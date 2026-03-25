import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { sanitizeText, getClientIp } from '@/lib/sanitize'
import { validateCsrf } from '@/lib/csrf'

export async function GET(request: Request) {
  try {
    const ip = getClientIp(request)
    if (!rateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: follows, error } = await supabaseAdmin
      .from('user_follows')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Follows fetch error:', error.message)
      return NextResponse.json(
        { error: 'Failed to fetch follows.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ follows })
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    if (!rateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
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
    const projectId = sanitizeText(body.projectId, 200)

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required.' },
        { status: 400 }
      )
    }

    const { data: follow, error } = await supabaseAdmin
      .from('user_follows')
      .insert({ user_id: user.id, project_id: projectId })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Already following this project.' },
          { status: 409 }
        )
      }
      console.error('Follow insert error:', error.message)
      return NextResponse.json(
        { error: 'Failed to follow project.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ follow }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const ip = getClientIp(request)
    if (!rateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
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
    const projectId = sanitizeText(body.projectId, 200)

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required.' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('user_follows')
      .delete()
      .eq('user_id', user.id)
      .eq('project_id', projectId)

    if (error) {
      console.error('Unfollow error:', error.message)
      return NextResponse.json(
        { error: 'Failed to unfollow project.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}
