import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rate-limit'
import { getClientIp, sanitizeText } from '@/lib/sanitize'
import { validateCsrf } from '@/lib/csrf'

const MIN_PASSWORD_LENGTH = 8

/**
 * POST /api/claim/finalize
 *
 * Public (no auth). Given a claim token + a new password, swaps the
 * placeholder auth user's email to the real target_email and signs the user
 * in via cookies.
 *
 * CRITICAL INVARIANT: we NEVER create a new auth user here. We update the
 * existing placeholder via auth.admin.updateUserById so the profile's id
 * (= auth user id) remains unchanged and all linked data stays linked.
 */
export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    if (!rateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'rate_limited', message: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    if (!validateCsrf(request)) {
      return NextResponse.json(
        { success: false, error: 'invalid_origin', message: 'Invalid request origin.' },
        { status: 403 }
      )
    }

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'bad_request', message: 'Invalid request body.' },
        { status: 400 }
      )
    }

    const token = sanitizeText((body as Record<string, unknown>).token, 200)
    const password = typeof (body as Record<string, unknown>).password === 'string'
      ? ((body as Record<string, unknown>).password as string)
      : ''

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'bad_request', message: 'Missing token.' },
        { status: 400 }
      )
    }
    if (!password || password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        {
          success: false,
          error: 'weak_password',
          message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
        },
        { status: 400 }
      )
    }

    // 1. Look up the token
    const { data: tokenRow, error: tokenErr } = await supabaseAdmin
      .from('claim_tokens')
      .select('*')
      .eq('token', token)
      .maybeSingle()

    if (tokenErr) {
      console.error('claim/finalize: token lookup error:', tokenErr.message)
      return NextResponse.json(
        { success: false, error: 'server_error', message: 'Server error.' },
        { status: 500 }
      )
    }
    if (!tokenRow) {
      return NextResponse.json(
        { success: false, error: 'invite_not_found', message: 'Invite not found.' },
        { status: 404 }
      )
    }

    // 2. Expiry check
    if (tokenRow.expires_at && new Date(tokenRow.expires_at) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'expired', message: 'This invite has expired.' },
        { status: 410 }
      )
    }

    // 3. Already-claimed check
    if (tokenRow.claimed_at !== null) {
      return NextResponse.json(
        {
          success: false,
          error: 'already_claimed',
          message: 'This profile has already been claimed.',
        },
        { status: 409 }
      )
    }

    // 4. Fetch the prebuilt profile
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('user_profiles')
      .select('id, target_email, is_claimable')
      .eq('id', tokenRow.prebuilt_profile_id)
      .maybeSingle()

    if (profileErr) {
      console.error('claim/finalize: profile lookup error:', profileErr.message)
      return NextResponse.json(
        { success: false, error: 'server_error', message: 'Server error.' },
        { status: 500 }
      )
    }
    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'profile_missing', message: 'Profile not found.' },
        { status: 404 }
      )
    }

    const targetEmail: string | null = profile.target_email || tokenRow.target_email
    if (!targetEmail) {
      console.error('claim/finalize: no target_email on profile or token', profile.id)
      return NextResponse.json(
        { success: false, error: 'server_error', message: 'Server error.' },
        { status: 500 }
      )
    }

    // 5. Guard: does the target email already belong to a DIFFERENT
    // (non-placeholder) auth user? If yes, block — they already have an
    // account and should log in instead.
    try {
      const { data: existingProfile } = await supabaseAdmin
        .from('user_profiles')
        .select('id, is_claimable')
        .eq('email', targetEmail)
        .maybeSingle()

      if (
        existingProfile &&
        existingProfile.id !== profile.id &&
        !existingProfile.is_claimable
      ) {
        return NextResponse.json(
          {
            success: false,
            error: 'email_taken',
            message: 'You already have an account. Please log in.',
          },
          { status: 409 }
        )
      }
    } catch (err) {
      console.error(
        'claim/finalize: email-taken check failed (continuing):',
        (err as Error).message
      )
    }

    // 6. SWAP: update the placeholder auth user's email + password. This is
    // the core operation — we are NOT creating a new auth user.
    const { error: updateAuthErr } = await supabaseAdmin.auth.admin.updateUserById(
      profile.id,
      {
        email: targetEmail,
        password,
        email_confirm: true,
        user_metadata: {
          is_placeholder: false,
          claimed_via: 'claim_flow',
          claimed_at: new Date().toISOString(),
        },
      }
    )

    if (updateAuthErr) {
      console.error('claim/finalize: auth.updateUserById failed:', updateAuthErr.message)
      // Map duplicate-email errors to a 409 so the client can tell the user
      const msg = updateAuthErr.message?.toLowerCase() || ''
      if (msg.includes('already') || msg.includes('duplicate') || msg.includes('exists')) {
        return NextResponse.json(
          {
            success: false,
            error: 'email_taken',
            message: 'You already have an account. Please log in.',
          },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { success: false, error: 'claim_failed', message: 'Failed to claim profile.' },
        { status: 500 }
      )
    }

    // 7. Update user_profiles (clear claimable flags, sync email column)
    const { error: profileUpdateErr } = await supabaseAdmin
      .from('user_profiles')
      .update({
        is_claimable: false,
        target_email: null,
        email: targetEmail,
      })
      .eq('id', profile.id)

    if (profileUpdateErr) {
      // Partial state! The auth user is now under the real email but the
      // profile row still shows as claimable. Log loudly so ops can recover.
      console.error(
        'claim/finalize: PARTIAL_STATE user_profiles update failed after auth swap.',
        'user_id=',
        profile.id,
        'err=',
        profileUpdateErr.message
      )
      // Don't fail the request — the user is technically claimed. Flag it.
    }

    // 8. Mark the token claimed
    const { error: tokenUpdateErr } = await supabaseAdmin
      .from('claim_tokens')
      .update({
        claimed_at: new Date().toISOString(),
        claimed_by_user_id: profile.id,
      })
      .eq('id', tokenRow.id)

    if (tokenUpdateErr) {
      console.error(
        'claim/finalize: PARTIAL_STATE token update failed after auth swap.',
        'token_id=',
        tokenRow.id,
        'err=',
        tokenUpdateErr.message
      )
    }

    // 9. Sign the user in server-side via the write-capable server client.
    // createSupabaseServerClient() uses @supabase/ssr which writes session
    // cookies through Next's cookies() store — this is the same pattern the
    // app uses for authenticated server actions.
    try {
      const serverClient = await createSupabaseServerClient()
      const { error: signInErr } = await serverClient.auth.signInWithPassword({
        email: targetEmail,
        password,
      })
      if (signInErr) {
        console.error('claim/finalize: auto sign-in failed:', signInErr.message)
        // Return success with a flag so the client can redirect to /login
        return NextResponse.json({
          success: true,
          auto_signed_in: false,
          redirect: '/login?claimed=1',
        })
      }
    } catch (err) {
      console.error('claim/finalize: server sign-in threw:', (err as Error).message)
      return NextResponse.json({
        success: true,
        auto_signed_in: false,
        redirect: '/login?claimed=1',
      })
    }

    return NextResponse.json({
      success: true,
      auto_signed_in: true,
      redirect: '/dashboard/profile/live-edit?welcome=claimed',
    })
  } catch (err) {
    console.error('claim/finalize error:', err)
    return NextResponse.json(
      { success: false, error: 'server_error', message: 'Server error.' },
      { status: 500 }
    )
  }
}
