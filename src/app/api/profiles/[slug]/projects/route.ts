import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { sanitizeText, getClientIp } from '@/lib/sanitize'
import { validateCsrf } from '@/lib/csrf'

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

async function resolveProfileOwner(slug: string, userId: string) {
  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('id, display_name')
    .eq('id', userId)
    .single()

  if (!profile) return null
  const expectedSlug = slugify(profile.display_name)
  return expectedSlug === slug ? profile.id : null
}

async function getProfileIdBySlug(slug: string): Promise<string | null> {
  const { data: users } = await supabaseAdmin
    .from('user_profiles')
    .select('id, display_name')
    .eq('profile_visibility', 'published')

  if (!users) return null
  const match = users.find(
    (u: Record<string, unknown>) => slugify(String(u.display_name)) === slug
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

    const url = new URL(request.url)
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '12', 10)))
    const category = url.searchParams.get('category')
    const offset = (page - 1) * limit

    let query = supabaseAdmin
      .from('portfolio_projects')
      .select('*', { count: 'exact' })
      .eq('profile_id', profileId)
      .eq('status', 'published')
      .order('display_order')
      .range(offset, offset + limit - 1)

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch projects.' }, { status: 500 })
    }

    return NextResponse.json({
      projects: data,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
      },
    })
  } catch {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}

export async function POST(
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
    const title = sanitizeText(body.title, 200)
    if (!title) {
      return NextResponse.json({ error: 'Title is required.' }, { status: 400 })
    }

    // Generate unique slug
    let projectSlug = slugify(title)
    const { data: existing } = await supabaseAdmin
      .from('portfolio_projects')
      .select('slug')
      .eq('profile_id', profileId)
      .like('slug', `${projectSlug}%`)

    if (existing && existing.length > 0) {
      const existingSlugs = new Set(existing.map((e: { slug: string }) => e.slug))
      if (existingSlugs.has(projectSlug)) {
        let counter = 2
        while (existingSlugs.has(`${projectSlug}-${counter}`)) counter++
        projectSlug = `${projectSlug}-${counter}`
      }
    }

    const project = {
      profile_id: profileId,
      title,
      slug: projectSlug,
      tagline: body.tagline ? sanitizeText(body.tagline, 300) : null,
      description: body.description ? sanitizeText(body.description, 50000) : null,
      cover_image_url: body.cover_image_url ? sanitizeText(body.cover_image_url, 1000) : null,
      category: body.category ? sanitizeText(body.category, 100) : null,
      tags: Array.isArray(body.tags) ? body.tags.map((t: unknown) => sanitizeText(t, 50)).filter(Boolean) : [],
      role: body.role ? sanitizeText(body.role, 200) : null,
      start_date: body.start_date || null,
      end_date: body.end_date || null,
      external_links: Array.isArray(body.external_links) ? body.external_links : [],
      tools_used: Array.isArray(body.tools_used) ? body.tools_used.map((t: unknown) => sanitizeText(t, 100)).filter(Boolean) : [],
      display_order: typeof body.display_order === 'number' ? body.display_order : 0,
      is_featured: Boolean(body.is_featured),
      status: body.status === 'published' ? 'published' : 'draft',
    }

    const { data: created, error } = await supabaseAdmin
      .from('portfolio_projects')
      .insert(project)
      .select()
      .single()

    if (error) {
      console.error('Portfolio project create error:', error.message)
      return NextResponse.json({ error: 'Failed to create project.' }, { status: 500 })
    }

    return NextResponse.json({ project: created }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
