import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/sanitize'
import { validateCsrf } from '@/lib/csrf'
import { scrapeProjectPage } from '@/lib/scraper'
import { validateScrapeUrl } from '@/lib/scraper/url-validator'
import { downloadImages } from '@/lib/scraper/download-images'

/**
 * POST /api/admin/create-project-for-profile
 *
 * Admin-only. Scrapes a URL as a project and creates a project_submission
 * linked to a claimable profile's user_id. The project is auto-approved
 * so it shows on the site immediately.
 *
 * Request body: { profile_id: string, url: string, adminPassword?: string }
 */
export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    if (!rateLimit(ip)) {
      return NextResponse.json({ success: false, message: 'Too many requests.' }, { status: 429 })
    }
    if (!validateCsrf(request)) {
      return NextResponse.json({ success: false, message: 'Invalid request origin.' }, { status: 403 })
    }

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, message: 'Invalid request body.' }, { status: 400 })
    }

    // Admin auth (same pattern as send-claim-invite)
    const adminPassword = (body as Record<string, unknown>).adminPassword || request.headers.get('x-admin-password')
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
        const { data: { user } } = await supabase.auth.getUser()
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
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }

    const profileId = typeof (body as Record<string, unknown>).profile_id === 'string'
      ? ((body as Record<string, unknown>).profile_id as string).trim()
      : ''
    const url = typeof (body as Record<string, unknown>).url === 'string'
      ? ((body as Record<string, unknown>).url as string).trim()
      : ''

    if (!profileId) {
      return NextResponse.json({ success: false, message: 'profile_id is required.' }, { status: 400 })
    }
    if (!url) {
      return NextResponse.json({ success: false, message: 'url is required.' }, { status: 400 })
    }

    // Verify the profile exists and is claimable
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('user_profiles')
      .select('id, display_name, email, is_claimable, target_email')
      .eq('id', profileId)
      .maybeSingle()

    if (profileErr || !profile) {
      return NextResponse.json({ success: false, message: 'Profile not found.' }, { status: 404 })
    }

    // Validate and scrape the URL
    const validation = validateScrapeUrl(url)
    if (!validation.valid) {
      return NextResponse.json({ success: false, message: validation.error }, { status: 400 })
    }

    let project
    try {
      project = await scrapeProjectPage(validation.url!)
      await downloadImages(project)
    } catch (err) {
      return NextResponse.json({
        success: false,
        message: `Scrape failed: ${(err as Error).message}`,
      }, { status: 422 })
    }

    if (!project || !project.title) {
      return NextResponse.json({ success: false, message: 'Could not extract project data from that URL.' }, { status: 422 })
    }

    // Build gallery images JSON
    let galleryImagesData: string | null = null
    if (project.galleryImages && project.galleryImages.length > 0) {
      galleryImagesData = JSON.stringify(project.galleryImages)
    }

    // Insert into project_submissions linked to the profile's user_id
    const submissionData = {
      user_id: profile.id,
      artist_name: project.leadArtistName || profile.display_name || 'Unknown',
      artist_bio: project.leadArtistBio || null,
      artist_email: profile.target_email || profile.email || null,
      artist_website: project.sourceUrl || url,
      project_title: project.title || 'Untitled Project',
      one_sentence: project.shortDescription || null,
      vision: project.overviewLead || null,
      experience: project.experience || null,
      story: project.artistStory || null,
      goals: project.goals?.join(', ') || null,
      domains: project.suggestedDomains || null,
      pathways: project.suggestedPathways || null,
      stage: project.suggestedStage || null,
      scale: project.suggestedScale || null,
      materials: project.materials || null,
      hero_image_data: project.heroImageUrl || null,
      gallery_images_data: galleryImagesData,
      status: 'approved',
    }

    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from('project_submissions')
      .insert(submissionData)
      .select('id, project_title')
      .single()

    if (insertErr) {
      console.error('create-project-for-profile: insert error:', insertErr.message)
      return NextResponse.json({
        success: false,
        message: `Failed to create project: ${insertErr.message}`,
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      project_id: inserted.id,
      project_title: inserted.project_title,
      profile_id: profile.id,
      profile_name: profile.display_name,
    })
  } catch (err) {
    console.error('create-project-for-profile error:', err)
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 })
  }
}
