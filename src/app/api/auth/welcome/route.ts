import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/sanitize'
import { sendEmail } from '@/lib/gmail'
import { welcomeEmail } from '@/lib/email-templates'

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    if (!rateLimit(ip)) {
      return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
    }

    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if welcome email was already sent
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('welcome_email_sent, display_name')
      .eq('id', user.id)
      .single()

    if (profile?.welcome_email_sent) {
      return NextResponse.json({ ok: true, already_sent: true })
    }

    // Send welcome email
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://resonance.network'
    const name = profile?.display_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'there'
    const email = welcomeEmail(name, `${siteUrl}/dashboard`)

    try {
      await sendEmail({
        to: user.email!,
        subject: email.subject,
        html: email.html,
      })
    } catch (err) {
      console.error('Welcome email send error:', (err as Error).message)
    }

    // Mark as sent (best-effort — don't fail if column doesn't exist yet)
    try {
      await supabaseAdmin
        .from('user_profiles')
        .update({ welcome_email_sent: true })
        .eq('id', user.id)
    } catch {
      // Column may not exist yet — that's OK
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
