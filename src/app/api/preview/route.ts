import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/sanitize'

export async function GET(request: Request) {
  const ip = getClientIp(request)
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const id = searchParams.get('id')

  if (!type || !id) {
    return NextResponse.json({ error: 'Missing type or id' }, { status: 400 })
  }

  if (!['project', 'profile', 'profile_avatar'].includes(type)) {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  }

  // Quick endpoint to get a user's avatar by ID
  if (type === 'profile_avatar') {
    try {
      const { data } = await supabaseAdmin
        .from('user_profiles')
        .select('avatar_url, display_name')
        .eq('id', id)
        .single()
      return NextResponse.json({ avatar_url: data?.avatar_url || null, display_name: data?.display_name || null })
    } catch {
      return NextResponse.json({ avatar_url: null })
    }
  }

  // Determine current user (if any)
  let currentUser: { id: string; email?: string } | null = null
  let isAdminAuth = false
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) currentUser = { id: user.id, email: user.email }
  } catch {
    // Not authenticated via session, check admin password header
    const adminPwd = request.headers.get('x-admin-password')
    if (adminPwd && process.env.ADMIN_PASSWORD) {
      const { timingSafeEqual } = await import('crypto')
      const a = Buffer.from(adminPwd)
      const b = Buffer.from(process.env.ADMIN_PASSWORD)
      if (a.length === b.length && timingSafeEqual(a, b)) {
        isAdminAuth = true
      }
    }
  }

  const table = type === 'project' ? 'project_submissions' : 'collaborator_profiles'

  try {
    const { data, error } = await supabaseAdmin
      .from(table)
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const row = data as Record<string, unknown>
    const status = row.status as string | undefined

    // Published/approved items are publicly viewable
    if (status === 'approved' || status === 'published') {
      return NextResponse.json({ data })
    }

    // Draft/pending items require ownership or admin access
    if (isAdminAuth) {
      return NextResponse.json({ data })
    }

    if (currentUser) {
      // Check if the user is an admin
      const { data: userProfile } = await supabaseAdmin
        .from('user_profiles')
        .select('role')
        .eq('id', currentUser.id)
        .single()
      if (userProfile?.role === 'admin') {
        return NextResponse.json({ data })
      }

      const isOwner =
        row.user_id === currentUser.id ||
        (currentUser.email && (row.artist_email === currentUser.email || row.email === currentUser.email))
      if (isOwner) {
        return NextResponse.json({ data })
      }
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
