import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { sanitizeText, getClientIp } from '@/lib/sanitize'
import { validateCsrf } from '@/lib/csrf'

const VALID_CATEGORIES = ['software', 'hardware', 'materials', 'processes']

async function resolveProfileOwner(slug: string, userId: string) {
  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('id, display_name')
    .eq('id', userId)
    .single()

  if (!profile) return null
  const expectedSlug = profile.display_name
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  return expectedSlug === slug ? profile.id : null
}

async function getProfileIdBySlug(slug: string): Promise<string | null> {
  const { data: users } = await supabaseAdmin
    .from('user_profiles')
    .select('id, display_name')
    .eq('profile_visibility', 'published')

  if (!users) return null
  const match = users.find(
    (u: Record<string, unknown>) => {
      const s = String(u.display_name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      return s === slug
    }
  )
  return match ? String(match.id) : null
}

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const ip = getClientIp(request)
    if (!rateLimit(ip)) {
      return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
    }

    const profileId = await getProfileIdBySlug(params.slug)
    if (!profileId) {
      return NextResponse.json({ error: 'Profile not found.' }, { status: 404 })
    }

    const { data, error } = await supabaseAdmin
      .from('profile_tools')
      .select('*')
      .eq('profile_id', profileId)
      .order('display_order')

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch tools.' }, { status: 500 })
    }

    return NextResponse.json({ tools: data })
  } catch {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
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

    const profileId = await resolveProfileOwner(params.slug, user.id)
    if (!profileId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    if (!Array.isArray(body.tools)) {
      return NextResponse.json({ error: 'tools must be an array.' }, { status: 400 })
    }

    if (body.tools.length > 50) {
      return NextResponse.json({ error: 'Maximum 50 tools allowed.' }, { status: 400 })
    }

    const tools = body.tools.map((tool: Record<string, unknown>, i: number) => {
      const category = String(tool.category || 'software')
      return {
        profile_id: profileId,
        tool_name: sanitizeText(tool.tool_name, 100),
        category: VALID_CATEGORIES.includes(category) ? category : 'software',
        icon_url: tool.icon_url ? sanitizeText(tool.icon_url, 500) : null,
        display_order: i,
      }
    }).filter((t: { tool_name: string }) => t.tool_name.length > 0)

    const { error: deleteError } = await supabaseAdmin
      .from('profile_tools')
      .delete()
      .eq('profile_id', profileId)

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to update tools.' }, { status: 500 })
    }

    if (tools.length > 0) {
      const { error: insertError } = await supabaseAdmin
        .from('profile_tools')
        .insert(tools)

      if (insertError) {
        console.error('Tools insert error:', insertError.message)
        return NextResponse.json({ error: 'Failed to save tools.' }, { status: 500 })
      }
    }

    const { data: updated } = await supabaseAdmin
      .from('profile_tools')
      .select('*')
      .eq('profile_id', profileId)
      .order('display_order')

    return NextResponse.json({ tools: updated })
  } catch {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
