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
    if (!verifyAdminPassword(adminPassword)) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ success: false, message: 'Server misconfigured: missing service role key.' }, { status: 500 })
    }

    // Handle project deletion
    const projectId = sanitizeText(body.projectId, 50)
    if (projectId) {
      // Delete related collaboration_tasks first
      try {
        await supabaseAdmin.from('collaboration_tasks').delete().eq('submission_id', projectId)
      } catch {
        // Table may not exist
      }
      const { error: delError } = await supabaseAdmin
        .from('project_submissions')
        .delete()
        .eq('id', projectId)
      if (delError) {
        return NextResponse.json({ success: false, message: `Failed to delete project: ${delError.message}` }, { status: 500 })
      }
      return NextResponse.json({ success: true, message: 'Project deleted successfully.' })
    }

    // Handle user deletion
    const userId = sanitizeText(body.userId, 50)
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Missing user ID or project ID.' }, { status: 400 })
    }

    // Delete auth user first — CASCADE handles user_profiles and all related tables
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (authError) {
      // Auth user might not exist (e.g. imported profiles). Delete profile directly.
      console.warn('Auth delete failed (may not exist):', authError.message)
      const { error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .delete()
        .eq('id', userId)

      if (profileError) {
        console.error('Admin user delete error:', profileError.message)
        return NextResponse.json({ success: false, message: `Failed to delete: ${profileError.message}` }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true, message: 'User deleted successfully.' })
  } catch (err) {
    console.error('Admin DELETE error:', err)
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 })
  }
}
