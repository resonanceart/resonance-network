import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/sanitize'
import { validateCsrf } from '@/lib/csrf'

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

const VALID_BLOCK_TYPES = [
  'image', 'image_grid', 'side_by_side', 'video', 'rich_text',
  'quote', 'embed', 'file', 'divider', 'audio', 'carousel',
]

export async function PUT(
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

    // Verify ownership
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('id, display_name')
      .eq('id', user.id)
      .single()

    if (!profile || slugify(profile.display_name) !== params.slug) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const projectSlug = params['project-slug']

    // Get the project
    const { data: project } = await supabaseAdmin
      .from('portfolio_projects')
      .select('id')
      .eq('profile_id', profile.id)
      .eq('slug', projectSlug)
      .single()

    if (!project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 })
    }

    const body = await request.json()
    if (!Array.isArray(body.blocks)) {
      return NextResponse.json({ error: 'blocks must be an array.' }, { status: 400 })
    }

    if (body.blocks.length > 100) {
      return NextResponse.json({ error: 'Maximum 100 content blocks allowed.' }, { status: 400 })
    }

    const blocks = body.blocks
      .filter((b: Record<string, unknown>) => VALID_BLOCK_TYPES.includes(String(b.block_type)))
      .map((block: Record<string, unknown>, i: number) => ({
        project_id: project.id,
        block_type: String(block.block_type),
        content: typeof block.content === 'object' && block.content ? block.content : {},
        display_order: i,
      }))

    // Replace all: delete then insert
    const { error: deleteError } = await supabaseAdmin
      .from('portfolio_content_blocks')
      .delete()
      .eq('project_id', project.id)

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to update content blocks.' }, { status: 500 })
    }

    if (blocks.length > 0) {
      const { error: insertError } = await supabaseAdmin
        .from('portfolio_content_blocks')
        .insert(blocks)

      if (insertError) {
        console.error('Content blocks insert error:', insertError.message)
        return NextResponse.json({ error: 'Failed to save content blocks.' }, { status: 500 })
      }
    }

    const { data: updated } = await supabaseAdmin
      .from('portfolio_content_blocks')
      .select('*')
      .eq('project_id', project.id)
      .order('display_order')

    return NextResponse.json({ blocks: updated })
  } catch {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
