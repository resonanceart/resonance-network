import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { sanitizeText, getClientIp } from '@/lib/sanitize'

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

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const offset = (page - 1) * limit

    // Fetch messages with pagination
    const { data: messages, error, count } = await supabaseAdmin
      .from('user_messages')
      .select('*', { count: 'exact' })
      .eq('recipient_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Messages fetch error:', error.message)
      return NextResponse.json(
        { error: 'Failed to fetch messages.' },
        { status: 500 }
      )
    }

    // Get unread count
    const { count: unreadCount, error: unreadError } = await supabaseAdmin
      .from('user_messages')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', user.id)
      .eq('read', false)

    if (unreadError) {
      console.error('Unread count error:', unreadError.message)
    }

    return NextResponse.json({
      messages,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      unread_count: unreadCount || 0,
    })
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
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

    const body = await request.json()
    const messageId = sanitizeText(body.messageId, 100)

    if (!messageId) {
      return NextResponse.json(
        { error: 'messageId is required.' },
        { status: 400 }
      )
    }

    const { data: message, error } = await supabaseAdmin
      .from('user_messages')
      .update({ read: true })
      .eq('id', messageId)
      .eq('recipient_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Message update error:', error.message)
      return NextResponse.json(
        { error: 'Failed to mark message as read.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message })
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}
