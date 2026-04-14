import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rate-limit'
import { sanitizeText, getClientIp } from '@/lib/sanitize'
import { validateCsrf } from '@/lib/csrf'
import { sendEmail } from '@/lib/gmail'
import { generateClaimToken } from '@/lib/tokens'
import { claimInvite } from '@/lib/email-templates'

/**
 * POST /api/admin/send-claim-invite
 *
 * Admin-only. Creates (or regenerates) a claim token for a claimable profile
 * and emails the target invitee. Mirrors the dual-auth pattern from
 * /api/admin/approve.
 *
 * Request body: { profile_id: string, adminPassword?: string }
 */
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

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Invalid request body.' },
        { status: 400 }
      )
    }

    // Dual-auth admin check (mirrors /api/admin/approve)
    const adminPassword =
      (body as Record<string, unknown>).adminPassword ||
      request.headers.get('x-admin-password')
    let isAdmin = false
    let adminUserId: string | null = null

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
          if (profile?.role === 'admin') {
            isAdmin = true
            adminUserId = user.id
          }
        }
      } catch {}
    }

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized.' },
        { status: 401 }
      )
    }

    const profileId = sanitizeText((body as Record<string, unknown>).profile_id, 64)
    if (!profileId) {
      return NextResponse.json(
        { success: false, message: 'profile_id is required.' },
        { status: 400 }
      )
    }

    // Fetch the claimable profile
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('user_profiles')
      .select('id, display_name, target_email, is_claimable, original_source_url')
      .eq('id', profileId)
      .maybeSingle()

    if (profileErr) {
      console.error('send-claim-invite: profile lookup error:', profileErr.message)
      return NextResponse.json(
        { success: false, error: 'server_error', message: 'Server error.' },
        { status: 500 }
      )
    }

    if (!profile || !profile.is_claimable) {
      return NextResponse.json(
        { success: false, error: 'profile_not_found', message: 'Claimable profile not found.' },
        { status: 404 }
      )
    }

    // Allow generating a token without an email (for copy-link flow)
    const skipEmail = !profile.target_email || (body as Record<string, unknown>).link_only === true

    // Generate a fresh token + compute new expiry (30 days from now)
    const token = generateClaimToken()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    // Look for an existing row for this prebuilt profile
    const { data: existingToken, error: existingErr } = await supabaseAdmin
      .from('claim_tokens')
      .select('id, send_count')
      .eq('prebuilt_profile_id', profile.id)
      .maybeSingle()

    if (existingErr) {
      console.error('send-claim-invite: existing token lookup error:', existingErr.message)
      return NextResponse.json(
        { success: false, error: 'server_error', message: 'Server error.' },
        { status: 500 }
      )
    }

    let sendCount = 1

    if (existingToken) {
      sendCount = (existingToken.send_count || 0) + 1
      const { error: updateErr } = await supabaseAdmin
        .from('claim_tokens')
        .update({
          token,
          target_email: profile.target_email || '',
          expires_at: expiresAt.toISOString(),
          last_sent_at: now.toISOString(),
          send_count: sendCount,
          // Clear any prior claim state in case the row is being recycled
          claimed_at: null,
          claimed_by_user_id: null,
        })
        .eq('id', existingToken.id)

      if (updateErr) {
        console.error('send-claim-invite: token update error:', updateErr.message)
        return NextResponse.json(
          { success: false, error: 'server_error', message: 'Failed to update token.' },
          { status: 500 }
        )
      }
    } else {
      // created_by is NOT NULL in the schema and references auth.users. When
      // the caller authenticates by password, we don't have a user id, so
      // fall back to the profile owner (the placeholder auth user) to satisfy
      // the FK while still recording a real row.
      const createdBy = adminUserId || profile.id
      const { error: insertErr } = await supabaseAdmin.from('claim_tokens').insert({
        token,
        target_email: profile.target_email,
        prebuilt_profile_id: profile.id,
        created_by: createdBy,
        expires_at: expiresAt.toISOString(),
        last_sent_at: now.toISOString(),
        send_count: sendCount,
      })

      if (insertErr) {
        console.error('send-claim-invite: token insert error:', insertErr.message)
        return NextResponse.json(
          { success: false, error: 'server_error', message: 'Failed to create token.' },
          { status: 500 }
        )
      }
    }

    // Build the claim URL
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://resonancenetwork.org'
    const claimUrl = `${siteUrl}/claim?token=${token}`

    // Send the email (unless skipping)
    let emailSent = false
    let emailError: string | null = null

    if (!skipEmail && profile.target_email) {
      const email = claimInvite(
        profile.display_name || '',
        claimUrl,
        profile.original_source_url || ''
      )
      try {
        await sendEmail({
          to: profile.target_email,
          subject: email.subject,
          html: email.html,
        })
        emailSent = true
      } catch (err) {
        emailError = (err as Error).message
        console.error(
          'send-claim-invite: sendEmail failed (token still generated):',
          emailError,
          'profile_id=',
          profile.id
        )
      }
    }

    return NextResponse.json({
      success: true,
      token,
      claim_url: claimUrl,
      sent_to: profile.target_email || null,
      send_count: sendCount,
      email_sent: emailSent,
      email_skipped: skipEmail,
      email_error: emailError,
    })
  } catch (err) {
    console.error('send-claim-invite error:', err)
    return NextResponse.json(
      { success: false, error: 'server_error', message: 'Server error.' },
      { status: 500 }
    )
  }
}
