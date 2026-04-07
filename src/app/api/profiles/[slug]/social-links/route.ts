import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { sanitizeText, getClientIp } from '@/lib/sanitize'
import { validateCsrf } from '@/lib/csrf'

const VALID_PLATFORMS = [
  'instagram', 'linkedin', 'behance', 'artstation', 'dribbble', 'github',
  'vimeo', 'soundcloud', 'spotify', 'youtube', 'x', 'tiktok', 'facebook', 'linktree', 'custom',
]

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
      .from('profile_social_links')
      .select('*')
      .eq('profile_id', profileId)
      .order('display_order')

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch social links.' }, { status: 500 })
    }

    return NextResponse.json({ social_links: data })
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
    if (!Array.isArray(body.social_links)) {
      return NextResponse.json({ error: 'social_links must be an array.' }, { status: 400 })
    }

    if (body.social_links.length > 20) {
      return NextResponse.json({ error: 'Maximum 20 social links allowed.' }, { status: 400 })
    }

    // Validate each link
    const links = body.social_links.map((link: Record<string, unknown>, i: number) => {
      const platform = String(link.platform || 'custom')
      return {
        profile_id: profileId,
        platform: VALID_PLATFORMS.includes(platform) ? platform : 'custom',
        url: sanitizeText(link.url, 500),
        display_order: i,
      }
    }).filter((l: { url: string }) => l.url.length > 0)

    // Replace all: delete then insert
    const { error: deleteError } = await supabaseAdmin
      .from('profile_social_links')
      .delete()
      .eq('profile_id', profileId)

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to update social links.' }, { status: 500 })
    }

    if (links.length > 0) {
      const { error: insertError } = await supabaseAdmin
        .from('profile_social_links')
        .insert(links)

      if (insertError) {
        console.error('Social links insert error:', insertError.message)
        return NextResponse.json({ error: 'Failed to save social links.' }, { status: 500 })
      }
    }

    const { data: updated } = await supabaseAdmin
      .from('profile_social_links')
      .select('*')
      .eq('profile_id', profileId)
      .order('display_order')

    return NextResponse.json({ social_links: updated })
  } catch {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
