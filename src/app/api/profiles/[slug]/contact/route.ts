import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sanitizeText, validateEmail, getClientIp } from '@/lib/sanitize'
import { validateCsrf } from '@/lib/csrf'
import { sendEmail } from '@/lib/gmail'

// Stricter rate limit for contact form: 5 per hour per IP
const contactRateMap = new Map<string, number[]>()
const CONTACT_WINDOW_MS = 60 * 60 * 1000 // 1 hour
const CONTACT_MAX_REQUESTS = 5

function contactRateLimit(ip: string): boolean {
  const now = Date.now()
  const timestamps = contactRateMap.get(ip) || []
  const recent = timestamps.filter(t => now - t < CONTACT_WINDOW_MS)
  if (recent.length >= CONTACT_MAX_REQUESTS) return false
  recent.push(now)
  contactRateMap.set(ip, recent)
  return true
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

const VALID_SUBJECT_TYPES = ['collaboration', 'commission', 'hiring', 'general']

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const ip = getClientIp(request)
    if (!contactRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many messages. Please try again later.' },
        { status: 429 }
      )
    }

    if (!validateCsrf(request)) {
      return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })
    }

    // Find profile by slug
    const { data: users } = await supabaseAdmin
      .from('user_profiles')
      .select('id, display_name')
      .eq('profile_visibility', 'published')

    if (!users) {
      return NextResponse.json({ error: 'Profile not found.' }, { status: 404 })
    }

    const match = users.find(
      (u: Record<string, unknown>) => slugify(String(u.display_name)) === params.slug
    )

    if (!match) {
      return NextResponse.json({ error: 'Profile not found.' }, { status: 404 })
    }

    const body = await request.json()

    const from_name = sanitizeText(body.from_name, 200)
    const from_email = validateEmail(body.from_email)
    const message = sanitizeText(body.message, 5000)
    const subject_type = VALID_SUBJECT_TYPES.includes(body.subject_type)
      ? body.subject_type
      : 'general'

    if (!from_name) {
      return NextResponse.json({ error: 'Name is required.' }, { status: 400 })
    }
    if (!from_email) {
      return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 })
    }
    if (!message) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 })
    }

    // Save to dashboard messages
    const { error } = await supabaseAdmin
      .from('profile_messages')
      .insert({
        to_profile_id: match.id,
        from_name,
        from_email,
        subject_type,
        message,
      })

    if (error) {
      console.error('Profile message insert error:', error.message)
      return NextResponse.json({ error: 'Failed to send message.' }, { status: 500 })
    }

    // Send email notification to the profile owner
    try {
      // Get contact_email from profile_extended, fall back to auth email
      const { data: extended } = await supabaseAdmin
        .from('profile_extended')
        .select('contact_email')
        .eq('id', match.id)
        .single()

      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(match.id)

      const recipientEmail = extended?.contact_email || authUser?.user?.email
      if (recipientEmail) {
        const subjectLine = `New ${subject_type} message from ${from_name} — Resonance Network`
        await sendEmail({
          to: recipientEmail,
          subject: subjectLine,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a19;">
              <h2 style="color: #01696F; margin-bottom: 16px;">New Message on Resonance Network</h2>
              <p><strong>From:</strong> ${from_name} (${from_email})</p>
              <p><strong>Type:</strong> ${subject_type.charAt(0).toUpperCase() + subject_type.slice(1)}</p>
              <div style="margin: 20px 0; padding: 16px; background: #f5f3ee; border-radius: 8px;">
                <p style="white-space: pre-wrap; margin: 0;">${message}</p>
              </div>
              <p style="color: #666; font-size: 14px;">You can reply directly to ${from_email} or view this message in your <a href="https://resonancenetwork.org/dashboard/messages" style="color: #01696F;">dashboard</a>.</p>
              <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;" />
              <p style="color: #999; font-size: 12px;">Resonance Network &mdash; Connecting Community Through Passion and Purpose</p>
            </div>
          `,
        })
      }
    } catch (emailErr) {
      // Don't fail the request if email fails — message is already saved
      console.error('Contact email notification error:', emailErr)
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
