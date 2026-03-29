import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase'
import { validateCsrf } from '@/lib/csrf'
import { rateLimit } from '@/lib/rate-limit'
import { sanitizeText, getClientIp } from '@/lib/sanitize'
import { sendEmail } from '@/lib/gmail'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const ip = getClientIp(request)
    if (!rateLimit(ip)) {
      return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
    }

    const supabase = createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return only this user's feature requests
    const { data, error } = await supabaseAdmin
      .from('feature_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch feature requests.' }, { status: 500 })
    }

    return NextResponse.json({ requests: data || [] })
  } catch {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    if (!rateLimit(ip)) {
      return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
    }

    if (!validateCsrf(request)) {
      return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })
    }

    const supabase = createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const title = sanitizeText(body.title?.trim() || '')
    const description = sanitizeText(body.description?.trim() || '')
    const priority = ['low', 'medium', 'high'].includes(body.priority) ? body.priority : 'medium'

    if (!title || title.length < 3) {
      return NextResponse.json({ error: 'Title must be at least 3 characters.' }, { status: 400 })
    }

    if (title.length > 200) {
      return NextResponse.json({ error: 'Title is too long.' }, { status: 400 })
    }

    // Get user display name for the email
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('display_name, email')
      .eq('id', user.id)
      .single()

    const { data, error } = await supabaseAdmin
      .from('feature_requests')
      .insert({
        user_id: user.id,
        title,
        description: description || null,
        priority,
        status: 'new',
      })
      .select()
      .single()

    if (error) {
      console.error('Feature request insert error:', error)
      return NextResponse.json({ error: 'Failed to submit feature request.' }, { status: 500 })
    }

    // Send email notification to admin
    try {
      const userName = profile?.display_name || profile?.email || user.email || 'A user'
      await sendEmail({
        to: 'admin@resonanceart.org',
        subject: `Feature Request: ${title}`,
        html: `
          <h2>New Feature Request</h2>
          <p><strong>From:</strong> ${userName}</p>
          <p><strong>Priority:</strong> ${priority}</p>
          <p><strong>Title:</strong> ${title}</p>
          ${description ? `<p><strong>Description:</strong></p><p>${description}</p>` : ''}
          <hr>
          <p style="color: #666; font-size: 12px;">Submitted via Resonance Network dashboard</p>
        `,
      })
    } catch (emailErr) {
      // Don't fail the request if email fails
      console.error('Feature request email notification failed:', emailErr)
    }

    return NextResponse.json({ request: data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
