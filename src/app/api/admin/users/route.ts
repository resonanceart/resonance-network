import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { sanitizeText, getClientIp } from '@/lib/sanitize'

export async function GET(request: Request) {
  try {
    const ip = getClientIp(request)
    if (!rateLimit(ip)) {
      return NextResponse.json(
        { success: false, message: 'Too many requests.' },
        { status: 429 }
      )
    }

    const adminPassword = request.headers.get('x-admin-password')
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }

    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('id, created_at, display_name, email, role, onboarding_complete, avatar_url')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Admin users fetch error:', error.message)
      return NextResponse.json({ success: false, message: 'Failed to fetch users.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, users: data })
  } catch {
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const ip = getClientIp(request)
    if (!rateLimit(ip)) {
      return NextResponse.json(
        { success: false, message: 'Too many requests.' },
        { status: 429 }
      )
    }

    const body = await request.json()

    const adminPassword = body.adminPassword || request.headers.get('x-admin-password')
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }

    const userId = sanitizeText(body.userId, 50)
    const newRole = sanitizeText(body.newRole, 20)

    if (!userId || !newRole) {
      return NextResponse.json({ success: false, message: 'Missing required fields.' }, { status: 400 })
    }

    if (!['collaborator', 'creator', 'admin'].includes(newRole)) {
      return NextResponse.json({ success: false, message: 'Invalid role.' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('user_profiles')
      .update({ role: newRole })
      .eq('id', userId)

    if (error) {
      console.error('Admin role update error:', error.message)
      return NextResponse.json({ success: false, message: 'Failed to update role.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: `Role updated to ${newRole}.` })
  } catch {
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 })
  }
}
