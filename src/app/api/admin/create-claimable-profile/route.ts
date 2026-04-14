import { NextResponse } from 'next/server'
import { timingSafeEqual, randomBytes, randomUUID } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rate-limit'
import { sanitizeText, validateEmail, getClientIp } from '@/lib/sanitize'
import { validateCsrf } from '@/lib/csrf'
import { scrapeProfilePage } from '@/lib/scraper'
import { downloadImages } from '@/lib/scraper/download-images'
import { validateScrapeUrl } from '@/lib/scraper/url-validator'

export const runtime = 'nodejs'
// 60s covers the scrape (~5s) + parallel image downloads (~15-30s for 8 imgs)
// + Supabase uploads + DB writes. Default of 10s was too tight once image
// rehost was added.
export const maxDuration = 60
export const dynamic = 'force-dynamic'

// Primary placeholder email domain. Fallback domain is used if Supabase
// rejects the primary (see A4 in the build spec).
const PLACEHOLDER_PRIMARY_DOMAIN = 'resonanceart.org'
const PLACEHOLDER_FALLBACK_DOMAIN = 'resonancenetwork.org'

function makePlaceholderEmail(domain: string): string {
  return `placeholder+${randomUUID()}@${domain}`
}

/**
 * Create the placeholder auth user, retrying with the fallback domain if the
 * primary domain is rejected by Supabase Auth.
 */
async function createPlaceholderAuthUser(targetEmail: string) {
  const password = randomBytes(32).toString('base64url')

  const attempt = async (domain: string) => {
    const placeholderEmail = makePlaceholderEmail(domain)
    const result = await supabaseAdmin.auth.admin.createUser({
      email: placeholderEmail,
      password,
      email_confirm: true,
      user_metadata: {
        is_placeholder: true,
        target_email: targetEmail,
        created_by_admin: true,
      },
    })
    return { result, placeholderEmail }
  }

  const first = await attempt(PLACEHOLDER_PRIMARY_DOMAIN)
  if (first.result.data?.user && !first.result.error) {
    return { user: first.result.data.user, placeholderEmail: first.placeholderEmail }
  }

  // Fallback — some Supabase projects reject unknown domains without MX
  console.warn(
    'create-claimable-profile: primary placeholder domain rejected, trying fallback.',
    first.result.error?.message
  )
  const second = await attempt(PLACEHOLDER_FALLBACK_DOMAIN)
  if (second.result.data?.user && !second.result.error) {
    return { user: second.result.data.user, placeholderEmail: second.placeholderEmail }
  }

  throw new Error(
    `Failed to create placeholder auth user: ${second.result.error?.message || 'unknown error'}`
  )
}

/**
 * Best-effort population of extended profile data from a scraped website.
 * All failures are swallowed (non-blocking) — the profile row is still
 * created even if scraping fails.
 */
async function tryPopulateFromScrape(profileId: string, importUrl: string) {
  try {
    const validation = validateScrapeUrl(importUrl)
    if (!validation.valid || !validation.url) {
      console.warn('create-claimable-profile: invalid import_url, skipping scrape.', validation.error)
      return
    }

    const scraped = await scrapeProfilePage(validation.url)

    // Rehost hero + avatar + gallery images onto Supabase Storage so the
    // profile doesn't break if the artist's source site changes. Same
    // helper /api/scrape uses. Non-blocking — if rehost fails, the raw
    // URLs still land in profile_extended as a best-effort fallback.
    try {
      const meta = await downloadImages(scraped)
      console.log(
        `[create-claimable-profile] image rehost: found=${meta.imagesFound} downloaded=${meta.imagesDownloaded} failed=${meta.imagesFailed} heroSource=${meta.heroSource}`
      )
    } catch (err) {
      console.warn(
        'create-claimable-profile: downloadImages threw (non-blocking):',
        (err as Error).message
      )
    }

    // profile_extended — bio/philosophy live on user_profiles.bio itself,
    // but cover image and achievements live here.
    const mediaGallery = scraped.galleryImages?.slice(0, 12).map((g) => ({
      url: g.url,
      alt: g.alt || '',
      caption: '',
    })) || []

    await supabaseAdmin
      .from('profile_extended')
      .upsert(
        {
          id: profileId,
          cover_image_url: scraped.heroImageUrl || null,
          media_gallery: mediaGallery,
          philosophy: scraped.sections?.[0]?.content?.slice(0, 2000) || null,
        },
        { onConflict: 'id' }
      )

    // Update core user_profiles fields with scraped basics
    const userProfilePatch: Record<string, unknown> = {}
    if (scraped.bio) userProfilePatch.bio = scraped.bio.slice(0, 2000)
    if (scraped.avatarUrl) userProfilePatch.avatar_url = scraped.avatarUrl
    if (scraped.website) userProfilePatch.website = scraped.website
    if (Object.keys(userProfilePatch).length > 0) {
      await supabaseAdmin.from('user_profiles').update(userProfilePatch).eq('id', profileId)
    }

    // Social links
    if (scraped.socialLinks && scraped.socialLinks.length > 0) {
      const rows = scraped.socialLinks.slice(0, 10).map((s, idx) => ({
        profile_id: profileId,
        platform: s.platform,
        url: s.url,
        display_order: idx,
      }))
      await supabaseAdmin.from('profile_social_links').insert(rows)
    }

    // Skills from scraped titles (loose mapping — admin refines in the editor)
    if (scraped.titles && scraped.titles.length > 0) {
      const rows = scraped.titles.slice(0, 10).map((title, idx) => ({
        profile_id: profileId,
        skill_name: title,
        category: 'general',
        display_order: idx,
      }))
      await supabaseAdmin.from('profile_skills').insert(rows)
    }
  } catch (err) {
    console.error(
      'create-claimable-profile: scrape population failed (non-blocking):',
      (err as Error).message
    )
  }
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    if (!rateLimit(ip)) {
      return NextResponse.json(
        { success: false, message: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    if (!validateCsrf(request)) {
      return NextResponse.json(
        { success: false, message: 'Invalid request origin.' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Dual-auth admin check (mirrors /api/admin/approve)
    const adminPassword = body.adminPassword || request.headers.get('x-admin-password')
    let isAdmin = false
    if (adminPassword && process.env.ADMIN_PASSWORD) {
      const pwdBuf = Buffer.from(String(adminPassword))
      const expectedBuf = Buffer.from(String(process.env.ADMIN_PASSWORD))
      if (pwdBuf.length === expectedBuf.length && timingSafeEqual(pwdBuf, expectedBuf)) {
        isAdmin = true
      }
    }

    if (!isAdmin) {
      try {
        const supabase = await createSupabaseServerClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabaseAdmin
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single()
          if (profile?.role === 'admin') isAdmin = true
        }
      } catch {}
    }

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized.' },
        { status: 401 }
      )
    }

    // Input validation + sanitization
    const email = validateEmail(body.email)
    const displayName = sanitizeText(body.display_name, 120)
    const importUrl =
      typeof body.import_url === 'string' && body.import_url.trim().length > 0
        ? sanitizeText(body.import_url, 500)
        : null

    if (!displayName) {
      return NextResponse.json(
        { success: false, message: 'Display name is required.' },
        { status: 400 }
      )
    }

    // Only check for duplicates if an email was provided
    if (email) {
      // A9: user_profiles has an email column — check it first. This catches
      // real users without a claimable row. Placeholder users have a
      // placeholder email, not the target_email, so they won't match.
      const { data: existingByEmail } = await supabaseAdmin
        .from('user_profiles')
        .select('id, is_claimable')
        .eq('email', email)
        .maybeSingle()

      if (existingByEmail && !existingByEmail.is_claimable) {
        return NextResponse.json(
          {
            success: false,
            error: 'email_exists',
            message: 'This email already has an account. Ask them to log in.',
          },
          { status: 409 }
        )
      }

      // Check existing claimable profile by target_email
      const { data: existingClaimable } = await supabaseAdmin
        .from('user_profiles')
        .select('id')
        .eq('target_email', email)
        .eq('is_claimable', true)
        .maybeSingle()

      if (existingClaimable) {
        return NextResponse.json(
          {
          success: false,
          error: 'already_claimable',
          message:
            'A claimable profile already exists for this email. Open it from the profiles list.',
          profile_id: existingClaimable.id,
        },
        { status: 409 }
      )
    }
    } // end if (email) duplicate checks

    // Create placeholder auth user — use provided email or generate one
    const emailForPlaceholder = email || `noemail-${Date.now()}@resonanceart.org`
    let createdUser
    let placeholderEmail
    try {
      const created = await createPlaceholderAuthUser(emailForPlaceholder)
      createdUser = created.user
      placeholderEmail = created.placeholderEmail
    } catch (err) {
      console.error('create-claimable-profile: createUser failed:', (err as Error).message)
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to create placeholder user. Check server logs.',
        },
        { status: 500 }
      )
    }

    // Upsert user_profiles row. The handle_new_user trigger may have inserted
    // a minimal row already (id + email + display_name) — upsert lets us
    // overwrite it with the full claimable shape without a PK conflict.
    // email is NOT NULL, so we store the placeholder here (it is swapped to
    // target_email when the user claims).
    const { error: profileError } = await supabaseAdmin.from('user_profiles').upsert(
      {
        id: createdUser.id,
        display_name: displayName,
        email: placeholderEmail,
        target_email: email || null,
        is_claimable: true,
        created_by_admin: true,
        original_source_url: importUrl,
        profile_visibility: 'draft',
      },
      { onConflict: 'id' }
    )

    if (profileError) {
      console.error(
        'create-claimable-profile: insert user_profiles failed, rolling back auth user:',
        profileError.message
      )
      // Rollback the placeholder auth user to avoid orphans
      try {
        await supabaseAdmin.auth.admin.deleteUser(createdUser.id)
      } catch (rollbackErr) {
        console.error(
          'create-claimable-profile: rollback deleteUser failed (manual cleanup needed):',
          (rollbackErr as Error).message,
          'user_id=',
          createdUser.id
        )
      }
      return NextResponse.json(
        { success: false, message: 'Failed to create profile row.' },
        { status: 500 }
      )
    }

    // Best-effort scrape population — non-blocking
    if (importUrl) {
      await tryPopulateFromScrape(createdUser.id, importUrl)
    }

    return NextResponse.json({
      success: true,
      user_id: createdUser.id,
      profile_id: createdUser.id,
    })
  } catch (err) {
    console.error('create-claimable-profile error:', err)
    return NextResponse.json(
      { success: false, message: 'Server error.' },
      { status: 500 }
    )
  }
}
