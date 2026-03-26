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
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Profile fetch error:', error.message)
      return NextResponse.json(
        { error: 'Failed to fetch profile.' },
        { status: 500 }
      )
    }

    // Fetch extended profile data
    const { data: extendedProfile } = await supabaseAdmin
      .from('profile_extended')
      .select('*')
      .eq('id', user.id)
      .single()

    // Fetch linked submissions by email
    const [projResult, profResult, interestResult] = await Promise.all([
      supabaseAdmin.from('project_submissions')
        .select('id, project_title, status, created_at')
        .or(`user_id.eq.${user.id},artist_email.eq.${profile.email}`),
      supabaseAdmin.from('collaborator_profiles')
        .select('id, name, status, created_at')
        .eq('email', profile.email),
      supabaseAdmin.from('collaboration_interest')
        .select('id, task_title, project_title, status, created_at')
        .or(`user_id.eq.${user.id},email.eq.${profile.email}`),
    ])

    const submissions: { id: string; title: string; type: string; status: string; created_at: string }[] = []

    if (projResult.data) {
      for (const p of projResult.data) {
        submissions.push({
          id: p.id,
          title: p.project_title,
          type: 'project',
          status: p.status || 'new',
          created_at: p.created_at,
        })
      }
    }

    if (profResult.data) {
      for (const p of profResult.data) {
        submissions.push({
          id: p.id,
          title: p.name,
          type: 'profile',
          status: p.status || 'new',
          created_at: p.created_at,
        })
      }
    }

    if (interestResult.data) {
      for (const i of interestResult.data) {
        const task = i.task_title || 'A role'
        const project = i.project_title || 'a project'
        submissions.push({
          id: i.id,
          title: `${task} on ${project}`,
          type: 'interest',
          status: i.status || 'new',
          created_at: i.created_at,
        })
      }
    }

    return NextResponse.json({ profile, extendedProfile: extendedProfile || null, submissions })
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const ip = getClientIp(request)
    if (!rateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    if (!validateCsrf(request)) {
      return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })
    }

    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete user profile row
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .delete()
      .eq('id', user.id)

    if (profileError) {
      console.error('Profile delete error:', profileError.message)
      return NextResponse.json(
        { error: 'Failed to delete account.' },
        { status: 500 }
      )
    }

    // Delete the auth user
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)

    if (deleteError) {
      console.error('Auth user delete error:', deleteError.message)
      return NextResponse.json(
        { error: 'Failed to delete account.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const ip = getClientIp(request)
    if (!rateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
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

    // Sanitize updatable fields
    const updates: Record<string, unknown> = {}
    if (body.display_name !== undefined) updates.display_name = sanitizeText(body.display_name, 200)
    if (body.bio !== undefined) updates.bio = sanitizeText(body.bio, 2000)
    if (body.location !== undefined) updates.location = sanitizeText(body.location, 200)
    if (body.website !== undefined) updates.website = sanitizeText(body.website, 500)
    if (body.avatar_url !== undefined) updates.avatar_url = sanitizeText(body.avatar_url, 1000)
    if (body.skills !== undefined && Array.isArray(body.skills)) {
      updates.skills = body.skills.map((s: unknown) => sanitizeText(s, 100)).filter(Boolean)
    }
    if (body.onboarding_complete !== undefined) updates.onboarding_complete = Boolean(body.onboarding_complete)
    if (body.profile_visibility !== undefined) {
      const validVisibilities = ['draft', 'pending']
      // Users can only set draft or pending (not published — that requires admin)
      if (validVisibilities.includes(body.profile_visibility)) {
        updates.profile_visibility = body.profile_visibility
      }
    }

    // Handle profile_extended fields
    const extendedFields: Record<string, unknown> = {}
    if (body.media_gallery !== undefined) extendedFields.media_gallery = body.media_gallery
    if (body.extended_projects !== undefined) extendedFields.projects = body.extended_projects
    if (body.extended_links !== undefined) extendedFields.links = body.extended_links
    if (body.timeline !== undefined) extendedFields.timeline = body.timeline
    if (body.testimonials !== undefined) extendedFields.testimonials = body.testimonials
    if (body.extended_achievements !== undefined) extendedFields.achievements = body.extended_achievements
    if (body.extended_philosophy !== undefined) extendedFields.philosophy = sanitizeText(body.extended_philosophy, 5000)
    if (body.cover_image_url !== undefined) extendedFields.cover_image_url = sanitizeText(body.cover_image_url, 1000)
    if (body.tools_and_materials !== undefined && Array.isArray(body.tools_and_materials)) {
      extendedFields.tools_and_materials = body.tools_and_materials.map((s: unknown) => sanitizeText(s, 200)).filter(Boolean)
    }
    if (body.availability_status !== undefined) {
      const validStatuses = ['open', 'busy', 'unavailable']
      if (validStatuses.includes(body.availability_status)) {
        extendedFields.availability_status = body.availability_status
      }
    }
    if (body.availability_note !== undefined) extendedFields.availability_note = sanitizeText(body.availability_note, 500)

    if (Object.keys(updates).length === 0 && Object.keys(extendedFields).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update.' },
        { status: 400 }
      )
    }

    let profile = null
    if (Object.keys(updates).length > 0) {
      const { data, error } = await supabaseAdmin
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Profile update error:', error.message)
        return NextResponse.json(
          { error: 'Failed to update profile.' },
          { status: 500 }
        )
      }
      profile = data
    } else {
      // Fetch current profile if no base updates
      const { data } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      profile = data
    }

    let extendedProfile = null
    if (Object.keys(extendedFields).length > 0) {
      const { data, error: extError } = await supabaseAdmin
        .from('profile_extended')
        .upsert({ id: user.id, ...extendedFields }, { onConflict: 'id' })
        .select()
        .single()

      if (extError) {
        console.error('Extended profile upsert error:', extError.message)
      } else {
        extendedProfile = data
      }
    }

    return NextResponse.json({ profile, extendedProfile })
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}
