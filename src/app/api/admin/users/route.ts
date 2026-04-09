import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { sanitizeText, getClientIp } from '@/lib/sanitize'
import { validateCsrf } from '@/lib/csrf'

function verifyAdminPassword(password: string | null): boolean {
  if (!password || !process.env.ADMIN_PASSWORD) return false
  const pwdBuf = Buffer.from(String(password))
  const expBuf = Buffer.from(String(process.env.ADMIN_PASSWORD))
  return pwdBuf.length === expBuf.length && timingSafeEqual(pwdBuf, expBuf)
}

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
    if (!verifyAdminPassword(adminPassword)) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }

    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('id, created_at, display_name, email, role, onboarding_complete, avatar_url')
      .order('created_at', { ascending: false })
      .limit(500)

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

    if (!validateCsrf(request)) {
      return NextResponse.json(
        { success: false, message: 'Invalid request origin.' },
        { status: 403 }
      )
    }

    const body = await request.json()

    const adminPassword = body.adminPassword || request.headers.get('x-admin-password')
    if (!verifyAdminPassword(adminPassword)) {
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

export async function DELETE(request: Request) {
  try {
    const ip = getClientIp(request)
    if (!rateLimit(ip)) {
      return NextResponse.json(
        { success: false, message: 'Too many requests.' },
        { status: 429 }
      )
    }

    if (!validateCsrf(request)) {
      return NextResponse.json(
        { success: false, message: 'Invalid request origin.' },
        { status: 403 }
      )
    }

    const body = await request.json()

    const adminPassword = body.adminPassword || request.headers.get('x-admin-password')
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }

    const userId = sanitizeText(body.userId, 50)
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Missing user ID.' }, { status: 400 })
    }

    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .delete()
      .eq('id', userId)

    if (profileError) {
      console.error('Admin user delete error:', profileError.message)
      return NextResponse.json({ success: false, message: 'Failed to delete user profile.' }, { status: 500 })
    }

    try {
      await supabaseAdmin.auth.admin.deleteUser(userId)
    } catch {
      // Auth user may not exist
    }

    return NextResponse.json({ success: true, message: 'User deleted successfully.' })
  } catch {
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 })
  }
}
