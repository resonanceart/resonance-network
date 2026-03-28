import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sanitizeText, validateEmail, getClientIp } from '@/lib/sanitize'
import { validateCsrf } from '@/lib/csrf'

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

    return NextResponse.json({ success: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
