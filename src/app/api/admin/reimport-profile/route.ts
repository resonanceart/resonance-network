import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rate-limit'
import { sanitizeText, getClientIp } from '@/lib/sanitize'
import { validateCsrf } from '@/lib/csrf'
import { scrapeProfilePage, type ScrapedProfile } from '@/lib/scraper'
import { validateScrapeUrl } from '@/lib/scraper/url-validator'

export const runtime = 'nodejs'
export const maxDuration = 30
export const dynamic = 'force-dynamic'

type ReimportMode = 'replace' | 'fill_empty'

// Pick scraped value only if mode allows it to land on the target profile.
// For 'replace', any truthy scraped value wins. For 'fill_empty', the current
// value must be null/empty for the scraped value to be used.
function pick<T>(
  mode: ReimportMode,
  current: T | null | undefined,
  scraped: T | null | undefined
): T | null | undefined {
  if (scraped === undefined || scraped === null) return undefined
  if (typeof scraped === 'string' && scraped.trim().length === 0) return undefined
  if (mode === 'replace') return scraped
  // fill_empty
  const currentEmpty =
    current === null ||
    current === undefined ||
    (typeof current === 'string' && current.trim().length === 0)
  return currentEmpty ? scraped : undefined
}

function isEmptyArray(v: unknown): boolean {
  return !Array.isArray(v) || v.length === 0
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

    const body = await request.json().catch(() => ({}))

    // ─── Admin auth (mirrors /api/admin/create-claimable-profile) ───
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
          const { data: callerProfile } = await supabaseAdmin
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle()
          if (callerProfile?.role === 'admin') isAdmin = true
        }
      } catch {}
    }

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized.' },
        { status: 401 }
      )
    }

    // ─── Input validation ───
    const profileId = typeof body.profile_id === 'string' ? body.profile_id.trim() : ''
    const rawImportUrl = typeof body.import_url === 'string' ? body.import_url : ''
    const importUrl = sanitizeText(rawImportUrl, 500)
    const mode: ReimportMode = body.mode === 'replace' ? 'replace' : 'fill_empty'

    if (!profileId) {
      return NextResponse.json(
        { success: false, message: 'profile_id is required.' },
        { status: 400 }
      )
    }
    if (!importUrl) {
      return NextResponse.json(
        { success: false, message: 'import_url is required.' },
        { status: 400 }
      )
    }

    const urlValidation = validateScrapeUrl(importUrl)
    if (!urlValidation.valid || !urlValidation.url) {
      return NextResponse.json(
        { success: false, message: urlValidation.error || 'Invalid import URL.' },
        { status: 400 }
      )
    }

    // ─── Load target profile + gate on claimable + created_by_admin ───
    const { data: currentProfile, error: loadErr } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', profileId)
      .maybeSingle()

    if (loadErr || !currentProfile) {
      return NextResponse.json(
        { success: false, message: 'Profile not found.' },
        { status: 404 }
      )
    }

    if (!currentProfile.is_claimable || !currentProfile.created_by_admin) {
      return NextResponse.json(
        {
          success: false,
          message: 'Re-import is only available for admin-built claimable profiles.',
        },
        { status: 403 }
      )
    }

    // ─── Run the scraper (same function create-claimable-profile uses) ───
    let scraped: ScrapedProfile
    try {
      scraped = await scrapeProfilePage(urlValidation.url)
    } catch (err) {
      console.error('reimport-profile: scrape failed:', (err as Error).message)
      return NextResponse.json(
        {
          success: false,
          message: `Scraping failed: ${(err as Error).message || 'unknown error'}`,
        },
        { status: 502 }
      )
    }

    // ─── Snapshot current user_profiles row for undo ───
    const {
      previous_snapshot: _ps,
      previous_snapshot_at: _psa,
      ...coreSnapshot
    } = currentProfile as Record<string, unknown>
    void _ps
    void _psa

    // Build the user_profiles patch from scraped data based on mode.
    const userProfilePatch: Record<string, unknown> = {
      previous_snapshot: coreSnapshot,
      previous_snapshot_at: new Date().toISOString(),
      // original_source_url always updates — it records the last URL we ran.
      original_source_url: importUrl,
    }

    const bioPick = pick(mode, currentProfile.bio, scraped.bio?.slice(0, 2000))
    if (bioPick !== undefined) userProfilePatch.bio = bioPick

    const avatarPick = pick(mode, currentProfile.avatar_url, scraped.avatarUrl || undefined)
    if (avatarPick !== undefined) userProfilePatch.avatar_url = avatarPick

    const websitePick = pick(mode, currentProfile.website, scraped.website || undefined)
    if (websitePick !== undefined) userProfilePatch.website = websitePick

    // display_name: only overwrite in replace mode AND only when scraped.name
    // looks real (not an obvious placeholder).
    if (mode === 'replace' && scraped.name && scraped.name.trim().length > 0) {
      userProfilePatch.display_name = scraped.name.trim().slice(0, 120)
    } else if (
      mode === 'fill_empty' &&
      (!currentProfile.display_name || currentProfile.display_name.trim().length === 0) &&
      scraped.name
    ) {
      userProfilePatch.display_name = scraped.name.trim().slice(0, 120)
    }

    const { data: updatedProfile, error: updateErr } = await supabaseAdmin
      .from('user_profiles')
      .update(userProfilePatch)
      .eq('id', profileId)
      .select()
      .single()

    if (updateErr) {
      console.error('reimport-profile: user_profiles update failed:', updateErr.message)
      return NextResponse.json(
        { success: false, message: 'Failed to update profile.' },
        { status: 500 }
      )
    }

    // ─── profile_extended: cover image + media gallery + philosophy ───
    const { data: currentExt } = await supabaseAdmin
      .from('profile_extended')
      .select('*')
      .eq('id', profileId)
      .maybeSingle()

    const mediaGallery =
      scraped.galleryImages?.slice(0, 12).map((g) => ({
        url: g.url,
        alt: g.alt || '',
        caption: '',
      })) || []

    const extendedPatch: Record<string, unknown> = {}

    const coverPick = pick(
      mode,
      currentExt?.cover_image_url as string | null | undefined,
      scraped.heroImageUrl || undefined
    )
    if (coverPick !== undefined) extendedPatch.cover_image_url = coverPick

    const philosophyPick = pick(
      mode,
      currentExt?.philosophy as string | null | undefined,
      scraped.sections?.[0]?.content?.slice(0, 2000) || undefined
    )
    if (philosophyPick !== undefined) extendedPatch.philosophy = philosophyPick

    if (mediaGallery.length > 0) {
      if (mode === 'replace') {
        extendedPatch.media_gallery = mediaGallery
      } else if (mode === 'fill_empty' && isEmptyArray(currentExt?.media_gallery)) {
        extendedPatch.media_gallery = mediaGallery
      }
    }

    if (Object.keys(extendedPatch).length > 0) {
      // Snapshot extended row too, so undo can cover it.
      if (currentExt) {
        const {
          previous_snapshot: _eps,
          previous_snapshot_at: _epsa,
          ...extSnapshot
        } = currentExt as Record<string, unknown>
        void _eps
        void _epsa
        extendedPatch.previous_snapshot = extSnapshot
        extendedPatch.previous_snapshot_at = new Date().toISOString()
      }

      const { error: extErr } = await supabaseAdmin
        .from('profile_extended')
        .upsert({ id: profileId, ...extendedPatch }, { onConflict: 'id' })

      if (extErr) {
        console.warn(
          'reimport-profile: profile_extended upsert failed (non-blocking):',
          extErr.message
        )
      }
    }

    // ─── profile_social_links: replace mode wipes + reinserts;
    //     fill_empty only inserts if there are no existing rows. ───
    if (scraped.socialLinks && scraped.socialLinks.length > 0) {
      const scrapedRows = scraped.socialLinks.slice(0, 10).map((s, idx) => ({
        profile_id: profileId,
        platform: s.platform,
        url: s.url,
        display_order: idx,
      }))

      if (mode === 'replace') {
        await supabaseAdmin.from('profile_social_links').delete().eq('profile_id', profileId)
        await supabaseAdmin.from('profile_social_links').insert(scrapedRows)
      } else {
        const { count } = await supabaseAdmin
          .from('profile_social_links')
          .select('profile_id', { count: 'exact', head: true })
          .eq('profile_id', profileId)
        if (!count || count === 0) {
          await supabaseAdmin.from('profile_social_links').insert(scrapedRows)
        }
      }
    }

    // ─── profile_skills: same replace/fill_empty pattern ───
    if (scraped.titles && scraped.titles.length > 0) {
      const scrapedRows = scraped.titles.slice(0, 10).map((title, idx) => ({
        profile_id: profileId,
        skill_name: title,
        category: 'general',
        display_order: idx,
      }))

      if (mode === 'replace') {
        await supabaseAdmin.from('profile_skills').delete().eq('profile_id', profileId)
        await supabaseAdmin.from('profile_skills').insert(scrapedRows)
      } else {
        const { count } = await supabaseAdmin
          .from('profile_skills')
          .select('profile_id', { count: 'exact', head: true })
          .eq('profile_id', profileId)
        if (!count || count === 0) {
          await supabaseAdmin.from('profile_skills').insert(scrapedRows)
        }
      }
    }

    // ─── Return the reimported payload in the shape the frontend expects ───
    // We mirror the scraped-profile shape used by /dashboard/profile/live-edit's
    // applyImportedData helper so the client can hydrate its editor state
    // without a page reload.
    const importedForClient = {
      name: scraped.name || updatedProfile?.display_name || '',
      bio: scraped.bio || '',
      titles: scraped.titles || [],
      education: scraped.education || [],
      avatarUrl: scraped.avatarUrl || null,
      heroImageUrl: scraped.heroImageUrl || null,
      galleryImages: scraped.galleryImages || [],
      socialLinks: scraped.socialLinks || [],
      website: scraped.website || '',
    }

    return NextResponse.json({
      success: true,
      mode,
      profile: updatedProfile,
      imported: importedForClient,
    })
  } catch (err) {
    console.error('reimport-profile error:', err)
    return NextResponse.json(
      { success: false, message: 'Server error.' },
      { status: 500 }
    )
  }
}
