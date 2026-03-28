import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { sanitizeText, getClientIp } from '@/lib/sanitize'
import { validateCsrf } from '@/lib/csrf'
import { getProfileBySlugEnhanced } from '@/lib/data'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const ip = getClientIp(request)
    if (!rateLimit(ip)) {
      return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
    }

    const { slug } = params
    const profile = await getProfileBySlugEnhanced(slug)

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found.' }, { status: 404 })
    }

    return NextResponse.json({ profile })
  } catch {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}

export async function PATCH(
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

    // Verify ownership
    const { slug } = params
    const { data: ownerProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('id, display_name')
      .eq('id', user.id)
      .single()

    if (!ownerProfile) {
      return NextResponse.json({ error: 'Profile not found.' }, { status: 404 })
    }

    // Verify slug matches user
    const expectedSlug = ownerProfile.display_name
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    if (expectedSlug !== slug) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    // Extended fields that go to profile_extended
    const extendedUpdates: Record<string, unknown> = {}
    const textFields: [string, number][] = [
      ['pronouns', 100],
      ['location_secondary', 200],
      ['artist_statement', 10000],
      ['accent_color', 20],
      ['primary_website_url', 500],
      ['primary_website_label', 100],
      ['cta_primary_label', 100],
      ['cta_primary_url', 500],
      ['cta_secondary_label', 100],
      ['cta_secondary_action', 100],
      ['cta_secondary_url', 500],
      ['gallery_layout', 20],
    ]

    for (const [field, maxLen] of textFields) {
      if (body[field] !== undefined) {
        extendedUpdates[field] = sanitizeText(body[field], maxLen)
      }
    }

    if (body.cta_primary_action !== undefined) {
      const valid = ['contact', 'url', 'booking']
      if (valid.includes(body.cta_primary_action)) {
        extendedUpdates.cta_primary_action = body.cta_primary_action
      }
    }

    if (body.cover_position !== undefined && typeof body.cover_position === 'object') {
      extendedUpdates.cover_position = body.cover_position
    }

    if (body.availability_types !== undefined && Array.isArray(body.availability_types)) {
      extendedUpdates.availability_types = body.availability_types.map((s: unknown) => sanitizeText(s, 100)).filter(Boolean)
    }

    if (body.section_order !== undefined && Array.isArray(body.section_order)) {
      extendedUpdates.section_order = body.section_order.map((s: unknown) => sanitizeText(s, 50)).filter(Boolean)
    }

    if (body.section_visibility !== undefined && typeof body.section_visibility === 'object') {
      extendedUpdates.section_visibility = body.section_visibility
    }

    if (body.gallery_columns !== undefined) {
      const cols = parseInt(body.gallery_columns, 10)
      if (cols >= 1 && cols <= 6) {
        extendedUpdates.gallery_columns = cols
      }
    }

    if (Object.keys(extendedUpdates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update.' }, { status: 400 })
    }

    const { data: updated, error } = await supabaseAdmin
      .from('profile_extended')
      .upsert({ id: user.id, ...extendedUpdates }, { onConflict: 'id' })
      .select()
      .single()

    if (error) {
      console.error('Profile extended update error:', error.message)
      return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 })
    }

    return NextResponse.json({ profile_extended: updated })
  } catch {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
