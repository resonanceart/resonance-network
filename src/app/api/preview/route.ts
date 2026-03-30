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

  // Check if user is authenticated (owner or admin)
  let isAuthorized = false
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      isAuthorized = true // Any authenticated user can preview
    }
  } catch {
    // Check admin password header as fallback
    const adminPwd = request.headers.get('x-admin-password')
    if (adminPwd === process.env.ADMIN_PASSWORD) {
      isAuthorized = true
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

    // If not authorized, only allow viewing approved/published items
    if (!isAuthorized) {
      const status = (data as Record<string, unknown>).status as string
      if (status !== 'approved' && status !== 'published') {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }
    }

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
