import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/sanitize'

// Reads request.headers / request.url — skip Next's static-analysis probe.
export const dynamic = 'force-dynamic'

/**
 * GET /api/claim/preview?token=xxx
 *
 * PUBLIC endpoint. Given a claim token, returns the full profile data so the
 * /claim page can render a preview. The endpoint is the sole gatekeeper for
 * claim_tokens reads (RLS on the table is service-role only), so all the
 * validation happens here.
 */
export async function GET(request: Request) {
  try {
    const ip = getClientIp(request)
    // Cheap read, generous limit, but still protected against scraping.
    if (!rateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'rate_limited', message: 'Too many requests.' },
        { status: 429, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    const url = new URL(request.url)
    const token = url.searchParams.get('token') || ''

    // Tokens from generateClaimToken are 32 chars; allow a small window to
    // tolerate future format tweaks without breaking the endpoint.
    if (!token || token.length < 20 || token.length > 64) {
      return NextResponse.json(
        { success: false, error: 'bad_request', message: 'Invalid token.' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    // Look up the token using the service-role client (RLS bypass by design).
    const { data: tokenRow, error: tokenErr } = await supabaseAdmin
      .from('claim_tokens')
      .select('id, token, target_email, prebuilt_profile_id, expires_at, claimed_at')
      .eq('token', token)
      .maybeSingle()

    if (tokenErr) {
      console.error('claim/preview: token lookup error:', tokenErr.message)
      return NextResponse.json(
        { success: false, error: 'server_error', message: 'Server error.' },
        { status: 500, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    if (!tokenRow) {
      return NextResponse.json(
        { success: false, error: 'invite_not_found', message: 'Invite not found.' },
        { status: 404, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    if (tokenRow.expires_at && new Date(tokenRow.expires_at) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'expired', message: 'This invite has expired.' },
        { status: 410, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    if (tokenRow.claimed_at !== null) {
      return NextResponse.json(
        { success: false, error: 'already_claimed', message: 'This profile has already been claimed.' },
        { status: 409, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    // Fetch the profile + all related data in parallel. Shape mirrors what
    // getProfileBySlugEnhanced in src/lib/data.ts assembles, so the /claim
    // page can reuse the existing profile renderer.
    const profileId = tokenRow.prebuilt_profile_id

    const [
      profileResult,
      extendedResult,
      socialLinksResult,
      skillsResult,
      toolsResult,
      portfolioResult,
      workExpResult,
    ] = await Promise.all([
      supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('id', profileId)
        .maybeSingle(),
      supabaseAdmin
        .from('profile_extended')
        .select('*')
        .eq('id', profileId)
        .maybeSingle(),
      supabaseAdmin
        .from('profile_social_links')
        .select('*')
        .eq('profile_id', profileId)
        .order('display_order'),
      supabaseAdmin
        .from('profile_skills')
        .select('*')
        .eq('profile_id', profileId)
        .order('display_order'),
      supabaseAdmin
        .from('profile_tools')
        .select('*')
        .eq('profile_id', profileId)
        .order('display_order'),
      supabaseAdmin
        .from('portfolio_projects')
        .select('*')
        .eq('profile_id', profileId)
        .order('display_order'),
      supabaseAdmin
        .from('work_experience')
        .select('*')
        .eq('profile_id', profileId)
        .order('display_order'),
    ])

    if (profileResult.error || !profileResult.data) {
      console.error(
        'claim/preview: profile fetch error:',
        profileResult.error?.message || 'not found'
      )
      return NextResponse.json(
        { success: false, error: 'profile_missing', message: 'Profile not found.' },
        { status: 404, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    const profile = profileResult.data as Record<string, unknown>

    // Strip the placeholder email from the payload so the public preview
    // never exposes internal placeholder@ addresses. The real invitee email
    // is returned via target_email at the top level.
    const safeProfile = { ...profile }
    delete safeProfile.email
    // Defensive: never leak admin-only state on a public endpoint.
    delete safeProfile.role

    return NextResponse.json(
      {
        success: true,
        display_name: profile.display_name || null,
        target_email: tokenRow.target_email,
        expires_at: tokenRow.expires_at,
        source_url: profile.original_source_url || null,
        profile: {
          ...safeProfile,
          extended: extendedResult.data || null,
          social_links: socialLinksResult.data || [],
          skills: skillsResult.data || [],
          tools: toolsResult.data || [],
          portfolio_projects: portfolioResult.data || [],
          work_experience: workExpResult.data || [],
        },
      },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-store' },
      }
    )
  } catch (err) {
    console.error('claim/preview error:', err)
    return NextResponse.json(
      { success: false, error: 'server_error', message: 'Server error.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
