import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { sanitizeText, getClientIp } from '@/lib/sanitize'
import { validateCsrf } from '@/lib/csrf'

const VALID_TYPES = ['employment', 'education', 'freelance']

export async function GET(request: Request) {
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

    const { data, error } = await supabaseAdmin
      .from('work_experience')
      .select('*')
      .eq('profile_id', user.id)
      .order('display_order')

    if (error) {
      console.error('Work experience fetch error:', error.message)
      return NextResponse.json({ error: 'Failed to fetch work experience.' }, { status: 500 })
    }

    return NextResponse.json({ entries: data })
  } catch {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const ip = getClientIp(request)
    if (!rateLimit(ip)) {
      return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
    }

    if (!validateCsrf(request)) {
      return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })
    }

    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    if (!Array.isArray(body.entries)) {
      return NextResponse.json({ error: 'entries must be an array.' }, { status: 400 })
    }

    if (body.entries.length > 50) {
      return NextResponse.json({ error: 'Maximum 50 entries allowed.' }, { status: 400 })
    }

    const entries = body.entries
      .map((entry: Record<string, unknown>, i: number) => {
        const type = String(entry.type || 'employment')
        const title = sanitizeText(entry.title, 200)
        if (!title) return null

        return {
          profile_id: user.id,
          type: VALID_TYPES.includes(type) ? type : 'employment',
          title,
          organization: entry.organization ? sanitizeText(entry.organization, 200) : null,
          location: entry.location ? sanitizeText(entry.location, 200) : null,
          start_date: entry.start_date || null,
          end_date: entry.end_date || null,
          is_current: Boolean(entry.is_current),
          description: entry.description ? sanitizeText(entry.description, 500) : null,
          display_order: i,
        }
      })
      .filter(Boolean)

    // Replace all: delete then insert
    const { error: deleteError } = await supabaseAdmin
      .from('work_experience')
      .delete()
      .eq('profile_id', user.id)

    if (deleteError) {
      console.error('Work experience delete error:', deleteError.message)
      return NextResponse.json({ error: 'Failed to update work experience.' }, { status: 500 })
    }

    if (entries.length > 0) {
      const { error: insertError } = await supabaseAdmin
        .from('work_experience')
        .insert(entries)

      if (insertError) {
        console.error('Work experience insert error:', insertError.message)
        return NextResponse.json({ error: 'Failed to save work experience.' }, { status: 500 })
      }
    }

    const { data: updated } = await supabaseAdmin
      .from('work_experience')
      .select('*')
      .eq('profile_id', user.id)
      .order('display_order')

    return NextResponse.json({ entries: updated })
  } catch {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
