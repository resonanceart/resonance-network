import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { sanitizeText, getClientIp } from '@/lib/sanitize'
import { sendNotification } from '@/lib/notify'
import { validateCsrf } from '@/lib/csrf'

// Increase body size limit to 10MB for base64 image uploads
export const runtime = 'nodejs'
export const maxDuration = 30
export const dynamic = 'force-dynamic'

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

    // Fetch related profile data in parallel
    const [
      workExpResult,
      skillsResult,
      toolsResult,
      socialLinksResult,
      projResult,
      profResult,
      interestResult,
    ] = await Promise.all([
      supabaseAdmin.from('work_experience').select('*').eq('profile_id', user.id).order('display_order'),
      supabaseAdmin.from('profile_skills').select('*').eq('profile_id', user.id).order('display_order'),
      supabaseAdmin.from('profile_tools').select('*').eq('profile_id', user.id).order('display_order'),
      supabaseAdmin.from('profile_social_links').select('*').eq('profile_id', user.id).order('display_order'),
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

    return NextResponse.json({
      profile,
      extendedProfile: extendedProfile || null,
      submissions,
      workExperience: workExpResult.data || [],
      profileSkills: skillsResult.data || [],
      profileTools: toolsResult.data || [],
      socialLinks: socialLinksResult.data || [],
    })
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

    // Delete extended profile data
    await supabaseAdmin.from('profile_extended').delete().eq('id', user.id)
    await supabaseAdmin.from('profile_skills').delete().eq('profile_id', user.id)
    await supabaseAdmin.from('profile_tools').delete().eq('profile_id', user.id)
    await supabaseAdmin.from('profile_social_links').delete().eq('profile_id', user.id)
    await supabaseAdmin.from('work_experience').delete().eq('profile_id', user.id)

    // Delete the auth user
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)

    if (deleteError) {
      console.error('Auth user delete error:', deleteError.message)
      return NextResponse.json(
        { error: 'Failed to delete account.' },
        { status: 500 }
      )
    }

    // Sign out the server-side session
    await supabase.auth.signOut()

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
    if (body.bio !== undefined) updates.bio = sanitizeText(body.bio, 3000)
    if (body.location !== undefined) updates.location = sanitizeText(body.location, 200)
    if (body.website !== undefined) updates.website = sanitizeText(body.website, 500)
    if (body.avatar_url !== undefined) {
      // Allow data URLs (base64 images) through without truncation
      if (typeof body.avatar_url === 'string' && body.avatar_url.startsWith('data:image/')) {
        updates.avatar_url = body.avatar_url
      } else {
        updates.avatar_url = sanitizeText(body.avatar_url, 2000)
      }
    }
    if (body.skills !== undefined && Array.isArray(body.skills)) {
      updates.skills = body.skills.map((s: unknown) => sanitizeText(s, 100)).filter(Boolean)
    }
    if (body.onboarding_complete !== undefined) updates.onboarding_complete = Boolean(body.onboarding_complete)
    if (body.onboarding_completed !== undefined) updates.onboarding_completed = Boolean(body.onboarding_completed)
    if (body.role_type !== undefined) {
      const validRoleTypes = ['artist', 'curator', 'collaborator']
      // Accept single role or comma-separated multiple roles
      const roles = String(body.role_type).split(',').map(r => r.trim()).filter(r => validRoleTypes.includes(r))
      if (roles.length > 0) updates.role_type = roles.join(',')
    }
    if (body.collaborator_type !== undefined) updates.collaborator_type = sanitizeText(body.collaborator_type, 200)
    if (body.goals !== undefined && Array.isArray(body.goals)) {
      updates.goals = body.goals.map((g: unknown) => sanitizeText(g, 200)).filter(Boolean).slice(0, 20)
    }
    if (body.fields_of_interest !== undefined && Array.isArray(body.fields_of_interest)) {
      updates.fields_of_interest = body.fields_of_interest.map((f: unknown) => sanitizeText(f, 200)).filter(Boolean).slice(0, 50)
    }
    if (body.profile_visibility !== undefined) {
      const validVisibilities = ['draft', 'pending']
      // Users can only set draft or pending (not published — that requires admin)
      if (validVisibilities.includes(body.profile_visibility)) {
        updates.profile_visibility = body.profile_visibility
      }
    }

    // Handle profile_extended fields
    const extendedFields: Record<string, unknown> = {}
    if (body.media_gallery !== undefined) {
      if (body.media_gallery === null) {
        extendedFields.media_gallery = null
      } else if (Array.isArray(body.media_gallery) && body.media_gallery.length <= 100) {
        extendedFields.media_gallery = body.media_gallery.filter((item: Record<string, unknown>) =>
          item && typeof item.type === 'string' && typeof item.url === 'string'
        ).slice(0, 100)
      }
    }
    if (body.extended_projects !== undefined) extendedFields.projects = body.extended_projects
    if (body.extended_links !== undefined) extendedFields.links = body.extended_links
    if (body.timeline !== undefined) extendedFields.timeline = body.timeline
    if (body.testimonials !== undefined) extendedFields.testimonials = body.testimonials
    if (body.extended_achievements !== undefined) extendedFields.achievements = body.extended_achievements
    if (body.extended_philosophy !== undefined) extendedFields.philosophy = sanitizeText(body.extended_philosophy, 5000)
    if (body.cover_image_url !== undefined) {
      if (typeof body.cover_image_url === 'string' && body.cover_image_url.startsWith('data:image/')) {
        extendedFields.cover_image_url = body.cover_image_url
      } else {
        extendedFields.cover_image_url = sanitizeText(body.cover_image_url, 2000)
      }
    }
    if (body.resume_url !== undefined) {
      if (body.resume_url === null) {
        extendedFields.resume_url = null
      } else if (typeof body.resume_url === 'string' && body.resume_url.startsWith('data:')) {
        // Allow base64 PDFs up to ~7MB encoded
        extendedFields.resume_url = body.resume_url.length <= 10_000_000 ? body.resume_url : null
      } else {
        extendedFields.resume_url = sanitizeText(body.resume_url, 2000)
      }
    }
    if (body.portfolio_pdf_url !== undefined) {
      if (body.portfolio_pdf_url === null) {
        extendedFields.portfolio_pdf_url = null
      } else if (typeof body.portfolio_pdf_url === 'string' && body.portfolio_pdf_url.startsWith('data:')) {
        extendedFields.portfolio_pdf_url = body.portfolio_pdf_url.length <= 10_000_000 ? body.portfolio_pdf_url : null
      } else {
        extendedFields.portfolio_pdf_url = sanitizeText(body.portfolio_pdf_url, 2000)
      }
    }
    if (body.media_links !== undefined) {
      if (body.media_links === null) {
        extendedFields.media_links = null
      } else if (Array.isArray(body.media_links) && body.media_links.length <= 20) {
        extendedFields.media_links = body.media_links
      }
    }
    if (body.tools_and_materials !== undefined && Array.isArray(body.tools_and_materials)) {
      extendedFields.tools_and_materials = body.tools_and_materials.map((s: unknown) => sanitizeText(s, 200)).filter(Boolean)
    }
    if (body.availability_status !== undefined) {
      const validStatuses = ['open', 'selective', 'focused', 'busy', 'unavailable']
      if (validStatuses.includes(body.availability_status)) {
        extendedFields.availability_status = body.availability_status
      }
    }
    if (body.availability_note !== undefined) extendedFields.availability_note = sanitizeText(body.availability_note, 500)
    if (body.contact_email !== undefined) extendedFields.contact_email = sanitizeText(body.contact_email, 320)
    if (body.content_blocks !== undefined) {
      if (Array.isArray(body.content_blocks) && body.content_blocks.length <= 50) {
        extendedFields.content_blocks = body.content_blocks
      }
    }
    // Accept non-prefixed field names as fallbacks for dashboard compatibility
    if (body.projects !== undefined && extendedFields.projects === undefined) extendedFields.projects = body.projects
    if (body.links !== undefined && extendedFields.links === undefined) extendedFields.links = body.links
    if (body.achievements !== undefined && extendedFields.achievements === undefined) extendedFields.achievements = body.achievements
    if (body.philosophy !== undefined && extendedFields.philosophy === undefined) extendedFields.philosophy = sanitizeText(body.philosophy || '', 500)

    // Enhanced profile fields
    if (body.professional_title !== undefined) extendedFields.professional_title = sanitizeText(body.professional_title, 200)
    if (body.pronouns !== undefined) extendedFields.pronouns = sanitizeText(body.pronouns, 100)
    if (body.location_secondary !== undefined) extendedFields.location_secondary = sanitizeText(body.location_secondary, 200)
    if (body.artist_statement !== undefined) extendedFields.artist_statement = sanitizeText(body.artist_statement, 2000)
    if (body.accent_color !== undefined) extendedFields.accent_color = sanitizeText(body.accent_color, 20)
    if (body.bio_excerpt !== undefined) extendedFields.bio_excerpt = sanitizeText(body.bio_excerpt, 500)
    if (body.primary_website_url !== undefined) extendedFields.primary_website_url = sanitizeText(body.primary_website_url, 500)
    if (body.primary_website_label !== undefined) extendedFields.primary_website_label = sanitizeText(body.primary_website_label, 100)
    if (body.cta_primary_label !== undefined) extendedFields.cta_primary_label = sanitizeText(body.cta_primary_label, 100)
    if (body.cta_primary_action !== undefined) {
      const validActions = ['contact', 'url', 'booking']
      if (validActions.includes(body.cta_primary_action)) {
        extendedFields.cta_primary_action = body.cta_primary_action
      }
    }
    if (body.cta_primary_url !== undefined) extendedFields.cta_primary_url = sanitizeText(body.cta_primary_url, 500)
    if (body.cta_secondary_label !== undefined) extendedFields.cta_secondary_label = sanitizeText(body.cta_secondary_label, 100)
    if (body.cta_secondary_action !== undefined) extendedFields.cta_secondary_action = sanitizeText(body.cta_secondary_action, 100)
    if (body.cta_secondary_url !== undefined) extendedFields.cta_secondary_url = sanitizeText(body.cta_secondary_url, 500)
    if (body.cover_position !== undefined && typeof body.cover_position === 'object') {
      extendedFields.cover_position = body.cover_position
    }
    if (body.availability_types !== undefined && Array.isArray(body.availability_types)) {
      extendedFields.availability_types = body.availability_types.map((s: unknown) => sanitizeText(s, 100)).filter(Boolean)
    }
    if (body.section_order !== undefined && Array.isArray(body.section_order)) {
      extendedFields.section_order = body.section_order.map((s: unknown) => sanitizeText(s, 50)).filter(Boolean)
    }
    if (body.section_visibility !== undefined && typeof body.section_visibility === 'object') {
      extendedFields.section_visibility = body.section_visibility
    }
    if (body.gallery_order !== undefined) {
      if (body.gallery_order === null) {
        extendedFields.gallery_order = null
      } else if (Array.isArray(body.gallery_order)) {
        extendedFields.gallery_order = body.gallery_order
      }
    }
    if (body.gallery_layout !== undefined) extendedFields.gallery_layout = sanitizeText(body.gallery_layout, 20)
    if (body.gallery_columns !== undefined) {
      const cols = parseInt(body.gallery_columns, 10)
      if (cols >= 1 && cols <= 6) extendedFields.gallery_columns = cols
    }
    if (body.past_work !== undefined) {
      if (body.past_work === null) {
        extendedFields.past_work = null
      } else if (Array.isArray(body.past_work) && body.past_work.length <= 50) {
        extendedFields.past_work = body.past_work
      }
    }
    if (body.pdf_documents !== undefined) {
      if (body.pdf_documents === null) {
        extendedFields.pdf_documents = null
      } else if (Array.isArray(body.pdf_documents) && body.pdf_documents.length <= 50) {
        extendedFields.pdf_documents = body.pdf_documents
      }
    }

    // Check if we have related table arrays to update
    const hasRelatedUpdates =
      body.profile_skills !== undefined ||
      body.profile_tools !== undefined ||
      body.social_links !== undefined ||
      body.work_experience !== undefined

    if (Object.keys(updates).length === 0 && Object.keys(extendedFields).length === 0 && !hasRelatedUpdates) {
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

    // Send email notification when profile submitted for review
    if (body.profile_visibility === 'pending' && profile) {
      // Only notify on first submission, not repeated saves
      const { data: currentProfile } = await supabaseAdmin
        .from('user_profiles')
        .select('profile_visibility')
        .eq('id', user.id)
        .single()
      const wasAlreadyPending = currentProfile?.profile_visibility === 'pending'

      if (!wasAlreadyPending) {
        const displayName = String(profile.display_name || 'Unknown')
        const userEmail = String(profile.email || '')
        try {
          // Notify admin
          await sendNotification({
            to: ['resonanceartcollective@gmail.com'],
            subject: `New Profile Submitted for Review: ${displayName}`,
            body: `${displayName} has submitted their profile for review.\n\nEmail: ${userEmail}\nUser ID: ${user.id}\n\nReview profiles in the admin dashboard.`,
          })
          // Confirm to user
          if (userEmail) {
            await sendNotification({
              to: [userEmail],
              subject: 'Profile Submitted - Resonance Network',
              body: `Hi ${displayName},\n\nYour profile has been submitted for review. Our team will review it shortly and you'll be notified when it's published.\n\nIn the meantime, you can continue editing your profile.\n\nThank you,\nResonance Network`,
            })
          }
        } catch (e) {
          console.error('Failed to send review notification:', e)
          // Don't fail the request if email fails
        }
      }
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

    // Handle related table replacements (delete + insert pattern)
    const relatedResults: Record<string, unknown> = {}

    if (body.profile_skills !== undefined && Array.isArray(body.profile_skills)) {
      await supabaseAdmin.from('profile_skills').delete().eq('profile_id', user.id)
      const skills = body.profile_skills
        .slice(0, 50)
        .map((s: Record<string, unknown>, i: number) => ({
          profile_id: user.id,
          skill_name: sanitizeText(s.skill_name, 100),
          category: sanitizeText(s.category, 50) || 'design',
          display_order: i,
        }))
        .filter((s: { skill_name: string }) => s.skill_name.length > 0)
      if (skills.length > 0) {
        await supabaseAdmin.from('profile_skills').insert(skills)
      }
      const { data } = await supabaseAdmin.from('profile_skills').select('*').eq('profile_id', user.id).order('display_order')
      relatedResults.profileSkills = data || []
    }

    if (body.profile_tools !== undefined && Array.isArray(body.profile_tools)) {
      await supabaseAdmin.from('profile_tools').delete().eq('profile_id', user.id)
      const tools = body.profile_tools
        .slice(0, 50)
        .map((t: Record<string, unknown>, i: number) => ({
          profile_id: user.id,
          tool_name: sanitizeText(t.tool_name, 100),
          category: sanitizeText(t.category, 50) || 'software',
          icon_url: t.icon_url ? sanitizeText(t.icon_url, 500) : null,
          display_order: i,
        }))
        .filter((t: { tool_name: string }) => t.tool_name.length > 0)
      if (tools.length > 0) {
        await supabaseAdmin.from('profile_tools').insert(tools)
      }
      const { data } = await supabaseAdmin.from('profile_tools').select('*').eq('profile_id', user.id).order('display_order')
      relatedResults.profileTools = data || []
    }

    if (body.social_links !== undefined && Array.isArray(body.social_links)) {
      await supabaseAdmin.from('profile_social_links').delete().eq('profile_id', user.id)
      const validPlatforms = [
        'instagram', 'linkedin', 'behance', 'artstation', 'dribbble', 'github',
        'vimeo', 'soundcloud', 'spotify', 'youtube', 'x', 'tiktok', 'facebook', 'linktree', 'custom',
      ]
      const links = body.social_links
        .slice(0, 20)
        .map((l: Record<string, unknown>, i: number) => {
          const platform = String(l.platform || 'custom')
          return {
            profile_id: user.id,
            platform: validPlatforms.includes(platform) ? platform : 'custom',
            url: sanitizeText(l.url, 500),
            display_order: i,
          }
        })
        .filter((l: { url: string }) => l.url.length > 0)
      if (links.length > 0) {
        await supabaseAdmin.from('profile_social_links').insert(links)
      }
      const { data } = await supabaseAdmin.from('profile_social_links').select('*').eq('profile_id', user.id).order('display_order')
      relatedResults.socialLinks = data || []
    }

    if (body.work_experience !== undefined && Array.isArray(body.work_experience)) {
      await supabaseAdmin.from('work_experience').delete().eq('profile_id', user.id)
      const validTypes = ['employment', 'education', 'freelance']
      const entries = body.work_experience
        .slice(0, 50)
        .map((e: Record<string, unknown>, i: number) => {
          const type = String(e.type || 'employment')
          const title = sanitizeText(e.title, 200)
          if (!title) return null
          return {
            profile_id: user.id,
            type: validTypes.includes(type) ? type : 'employment',
            title,
            organization: e.organization ? sanitizeText(e.organization, 200) : null,
            location: e.location ? sanitizeText(e.location, 200) : null,
            start_date: e.start_date || null,
            end_date: e.end_date || null,
            is_current: Boolean(e.is_current),
            description: e.description ? sanitizeText(e.description, 500) : null,
            display_order: i,
          }
        })
        .filter(Boolean)
      if (entries.length > 0) {
        await supabaseAdmin.from('work_experience').insert(entries)
      }
      const { data } = await supabaseAdmin.from('work_experience').select('*').eq('profile_id', user.id).order('display_order')
      relatedResults.workExperience = data || []
    }

    return NextResponse.json({ profile, extendedProfile, ...relatedResults })
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}
