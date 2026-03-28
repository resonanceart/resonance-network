import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { sanitizeText, getClientIp } from '@/lib/sanitize'
import { validateCsrf } from '@/lib/csrf'

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
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

    // Verify ownership
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('id, display_name')
      .eq('id', user.id)
      .single()

    if (!profile || slugify(profile.display_name) !== params.slug) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const updates: Record<string, unknown> = {}

    if (body.section_order !== undefined && Array.isArray(body.section_order)) {
      updates.section_order = body.section_order
        .map((s: unknown) => sanitizeText(s, 50))
        .filter(Boolean)
    }

    if (body.section_visibility !== undefined && typeof body.section_visibility === 'object') {
      updates.section_visibility = body.section_visibility
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update.' }, { status: 400 })
    }

    const { data: updated, error } = await supabaseAdmin
      .from('profile_extended')
      .upsert({ id: user.id, ...updates }, { onConflict: 'id' })
      .select()
      .single()

    if (error) {
      console.error('Sections update error:', error.message)
      return NextResponse.json({ error: 'Failed to update sections.' }, { status: 500 })
    }

    return NextResponse.json({
      section_order: updated.section_order,
      section_visibility: updated.section_visibility,
    })
  } catch {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
