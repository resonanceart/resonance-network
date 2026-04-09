import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { sanitizeText, getClientIp } from '@/lib/sanitize'
import { validateCsrf } from '@/lib/csrf'

export async function GET(request: Request) {
  try {
    const ip = getClientIp(request)
    if (!rateLimit(ip)) {
      return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
    }

    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's email for fallback matching
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('email')
      .eq('id', user.id)
      .single()

    const email = profile?.email

    // Query submissions by user_id OR email
    const { data: submissions, error } = await supabaseAdmin
      .from('project_submissions')
      .select('*')
      .or(`user_id.eq.${user.id}${email ? `,artist_email.eq.${email}` : ''}`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Projects fetch error:', error.message)
      return NextResponse.json({ error: 'Failed to fetch projects.' }, { status: 500 })
    }

    return NextResponse.json({ submissions: submissions || [] })
  } catch {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
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

    const body = await request.json()
    const { submissionId, ...fields } = body

    if (!submissionId) {
      return NextResponse.json({ error: 'submissionId is required.' }, { status: 400 })
    }

    // Verify ownership
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('email')
      .eq('id', user.id)
      .single()

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('project_submissions')
      .select('id, user_id, artist_email')
      .eq('id', submissionId)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Submission not found.' }, { status: 404 })
    }

    const isOwner = existing.user_id === user.id || (profile?.email && existing.artist_email === profile.email)
    if (!isOwner) {
      return NextResponse.json({ error: 'Not authorized to update this submission.' }, { status: 403 })
    }

    // Strip status field — users cannot change submission status
    delete fields.status
    delete fields.id
    delete fields.created_at
    delete fields.user_id

    // Sanitize text fields
    const updates: Record<string, unknown> = {}
    if (fields.artist_name !== undefined) updates.artist_name = sanitizeText(fields.artist_name, 200)
    if (fields.artist_bio !== undefined) updates.artist_bio = sanitizeText(fields.artist_bio, 5000)
    if (fields.artist_email !== undefined) updates.artist_email = sanitizeText(fields.artist_email, 500)
    if (fields.artist_website !== undefined) updates.artist_website = sanitizeText(fields.artist_website, 500)
    if (fields.project_title !== undefined) updates.project_title = sanitizeText(fields.project_title, 200)
    if (fields.one_sentence !== undefined) updates.one_sentence = sanitizeText(fields.one_sentence, 500)
    if (fields.vision !== undefined) updates.vision = sanitizeText(fields.vision, 5000)
    if (fields.experience !== undefined) updates.experience = sanitizeText(fields.experience, 5000)
    if (fields.story !== undefined) updates.story = sanitizeText(fields.story, 5000)
    if (fields.goals !== undefined) updates.goals = sanitizeText(fields.goals, 5000)
    if (fields.stage !== undefined) updates.stage = sanitizeText(fields.stage, 100)
    if (fields.scale !== undefined) updates.scale = sanitizeText(fields.scale, 200)
    if (fields.location !== undefined) updates.location = sanitizeText(fields.location, 200)
    if (fields.materials !== undefined) updates.materials = sanitizeText(fields.materials, 5000)
    if (fields.special_needs !== undefined) updates.special_needs = sanitizeText(fields.special_needs, 5000)
    if (fields.collaboration_needs !== undefined) updates.collaboration_needs = sanitizeText(fields.collaboration_needs, 5000)
    if (fields.domains !== undefined && Array.isArray(fields.domains)) updates.domains = fields.domains
    if (fields.pathways !== undefined && Array.isArray(fields.pathways)) updates.pathways = fields.pathways

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update.' }, { status: 400 })
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('project_submissions')
      .update(updates)
      .eq('id', submissionId)
      .select()
      .single()

    if (updateError) {
      console.error('Submission update error:', updateError.message)
      return NextResponse.json({ error: 'Failed to update submission.' }, { status: 500 })
    }

    return NextResponse.json({ submission: updated })
  } catch {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
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

    const body = await request.json()
    const { submissionId } = body

    if (!submissionId) {
      return NextResponse.json({ error: 'submissionId is required.' }, { status: 400 })
    }

    // Verify ownership
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('email')
      .eq('id', user.id)
      .single()

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('project_submissions')
      .select('id, user_id, artist_email, hero_image_url, gallery')
      .eq('id', submissionId)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Submission not found.' }, { status: 404 })
    }

    const isOwner = existing.user_id === user.id || (profile?.email && existing.artist_email === profile.email)
    if (!isOwner) {
      return NextResponse.json({ error: 'Not authorized to delete this submission.' }, { status: 403 })
    }

    // Clean up storage files
    const filesToDelete: string[] = []
    if (existing.hero_image_url) {
      const match = existing.hero_image_url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)/)
      if (match) filesToDelete.push(match[1])
    }
    if (existing.gallery && Array.isArray(existing.gallery)) {
      for (const item of existing.gallery) {
        const url = typeof item === 'string' ? item : item?.url
        if (url) {
          const match = url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)/)
          if (match) filesToDelete.push(match[1])
        }
      }
    }
    if (filesToDelete.length > 0) {
      await supabaseAdmin.storage.from('project-images').remove(filesToDelete).catch(() => {})
    }

    // Delete related collaboration_tasks first (if any exist)
    await supabaseAdmin
      .from('collaboration_tasks')
      .delete()
      .eq('submission_id', submissionId)
      .catch(() => {}) // Table may not exist

    // Delete the submission — try supabaseAdmin first, fall back to user client
    const { error: deleteError } = await supabaseAdmin
      .from('project_submissions')
      .delete()
      .eq('id', submissionId)

    if (deleteError) {
      console.error('Submission delete error (admin):', deleteError.message)
      // Fallback: try with the user's authenticated client (needs DELETE RLS policy)
      const { error: userDeleteError } = await supabase
        .from('project_submissions')
        .delete()
        .eq('id', submissionId)
      if (userDeleteError) {
        console.error('Submission delete error (user):', userDeleteError.message)
        return NextResponse.json({ error: `Failed to delete: ${userDeleteError.message}` }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
