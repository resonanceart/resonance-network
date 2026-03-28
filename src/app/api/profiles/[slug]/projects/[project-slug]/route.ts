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
  { params }: { params: { slug: string; 'project-slug': string } }
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

    const projectSlug = params['project-slug']

    const { data: project, error } = await supabaseAdmin
      .from('portfolio_projects')
      .select('*')
      .eq('profile_id', profileId)
      .eq('slug', projectSlug)
      .eq('status', 'published')
      .single()

    if (error || !project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 })
    }

    // Fetch content blocks
    const { data: blocks } = await supabaseAdmin
      .from('portfolio_content_blocks')
      .select('*')
      .eq('project_id', project.id)
      .order('display_order')

    // Increment view count
    await supabaseAdmin
      .from('portfolio_projects')
      .update({ view_count: (project.view_count || 0) + 1 })
      .eq('id', project.id)

    return NextResponse.json({
      project: { ...project, content_blocks: blocks || [] },
    })
  } catch {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { slug: string; 'project-slug': string } }
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

    const projectSlug = params['project-slug']
    const { data: existing } = await supabaseAdmin
      .from('portfolio_projects')
      .select('id')
      .eq('profile_id', profileId)
      .eq('slug', projectSlug)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 })
    }

    const body = await request.json()
    const updates: Record<string, unknown> = {}

    if (body.title !== undefined) updates.title = sanitizeText(body.title, 200)
    if (body.tagline !== undefined) updates.tagline = sanitizeText(body.tagline, 300)
    if (body.description !== undefined) updates.description = sanitizeText(body.description, 50000)
    if (body.cover_image_url !== undefined) updates.cover_image_url = sanitizeText(body.cover_image_url, 1000)
    if (body.category !== undefined) updates.category = sanitizeText(body.category, 100)
    if (body.role !== undefined) updates.role = sanitizeText(body.role, 200)
    if (body.start_date !== undefined) updates.start_date = body.start_date
    if (body.end_date !== undefined) updates.end_date = body.end_date
    if (body.is_featured !== undefined) updates.is_featured = Boolean(body.is_featured)
    if (body.display_order !== undefined) updates.display_order = Number(body.display_order)
    if (body.tags !== undefined && Array.isArray(body.tags)) {
      updates.tags = body.tags.map((t: unknown) => sanitizeText(t, 50)).filter(Boolean)
    }
    if (body.tools_used !== undefined && Array.isArray(body.tools_used)) {
      updates.tools_used = body.tools_used.map((t: unknown) => sanitizeText(t, 100)).filter(Boolean)
    }
    if (body.external_links !== undefined && Array.isArray(body.external_links)) {
      updates.external_links = body.external_links
    }
    if (body.status !== undefined) {
      const validStatuses = ['draft', 'published', 'archived']
      if (validStatuses.includes(body.status)) {
        updates.status = body.status
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update.' }, { status: 400 })
    }

    updates.updated_at = new Date().toISOString()

    const { data: updated, error } = await supabaseAdmin
      .from('portfolio_projects')
      .update(updates)
      .eq('id', existing.id)
      .select()
      .single()

    if (error) {
      console.error('Portfolio project update error:', error.message)
      return NextResponse.json({ error: 'Failed to update project.' }, { status: 500 })
    }

    return NextResponse.json({ project: updated })
  } catch {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { slug: string; 'project-slug': string } }
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

    const projectSlug = params['project-slug']

    const { error } = await supabaseAdmin
      .from('portfolio_projects')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .eq('profile_id', profileId)
      .eq('slug', projectSlug)

    if (error) {
      console.error('Portfolio project archive error:', error.message)
      return NextResponse.json({ error: 'Failed to archive project.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
