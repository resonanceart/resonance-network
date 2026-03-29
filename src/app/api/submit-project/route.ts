import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rate-limit'
import { sanitizeText, validateEmail, getClientIp } from '@/lib/sanitize'
import { validateCsrf } from '@/lib/csrf'
import { sendSubmissionNotification } from '@/lib/notify'
import { sendEmail } from '@/lib/gmail'
import { projectSubmissionConfirmation } from '@/lib/email-templates'

export async function POST(request: Request) {
  try {
    if (!validateCsrf(request)) {
      return NextResponse.json(
        { success: false, message: 'Invalid request origin.' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Only rate limit NEW submissions (not authenticated draft saves)
    const isExistingDraft = !!body.id
    if (!isExistingDraft) {
      const ip = getClientIp(request)
      if (!rateLimit(ip)) {
        return NextResponse.json(
          { success: false, message: 'Too many requests. Please try again later.' },
          { status: 429 }
        )
      }
    }

    // Require authentication
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required. Please sign in to submit a project.' },
        { status: 401 }
      )
    }

    // Get profile data — use as authoritative source for artist info
    const { data: userProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('display_name, email, website, bio')
      .eq('id', user.id)
      .single()

    // Override artist fields with profile data
    body.artistName = userProfile?.display_name || body.artistName
    body.artistEmail = userProfile?.email || body.artistEmail
    body.artistWebsite = userProfile?.website || body.artistWebsite
    if (!body.artistBio && userProfile?.bio) body.artistBio = userProfile.bio
    const userId = user.id

    const artistName = sanitizeText(body.artistName, 200)
    const artistBio = sanitizeText(body.artistBio, 5000)
    const artistEmail = validateEmail(body.artistEmail)
    const artistWebsite = sanitizeText(body.artistWebsite, 500)
    const projectTitle = sanitizeText(body.projectTitle, 200)
    const oneSentence = sanitizeText(body.oneSentence, 500)
    const vision = sanitizeText(body.vision, 5000)
    const experience = sanitizeText(body.experience, 5000)
    const story = sanitizeText(body.story, 5000)
    const goals = sanitizeText(body.goals, 5000)
    const stage = sanitizeText(body.stage, 100)
    const scale = sanitizeText(body.scale, 200)
    const location = sanitizeText(body.location, 200)
    const materials = sanitizeText(body.materials, 5000)
    const specialNeeds = sanitizeText(body.specialNeeds, 5000)
    const domains = Array.isArray(body.domains) ? body.domains.filter((d: unknown) => typeof d === 'string').map((d: string) => d.slice(0, 100)) : null
    const pathways = Array.isArray(body.pathways) ? body.pathways.filter((p: unknown) => typeof p === 'string').map((p: string) => p.slice(0, 100)) : null
    const heroImageData = typeof body.heroImageData === 'string' && body.heroImageData.length <= 7_340_032 ? body.heroImageData : null
    const galleryImagesData = typeof body.galleryImagesData === 'string' && body.galleryImagesData.length <= 44_040_192 ? body.galleryImagesData : null
    // collaborationNeeds can be JSON (role cards) or plain text — don't sanitize JSON
    let collaborationNeeds: string | null = null
    if (typeof body.collaborationNeeds === 'string') {
      // Check if it's valid JSON (role cards array)
      try {
        JSON.parse(body.collaborationNeeds)
        // It's JSON — allow up to 50KB for roles with image URLs
        collaborationNeeds = body.collaborationNeeds.length <= 50_000 ? body.collaborationNeeds : null
      } catch {
        // Plain text — sanitize normally
        collaborationNeeds = sanitizeText(body.collaborationNeeds, 5000)
      }
    }
    const collaborationRoleCount = typeof body.collaborationRoleCount === 'number' && body.collaborationRoleCount >= 1 && body.collaborationRoleCount <= 20 ? body.collaborationRoleCount : null
    const artistHeadshotData = typeof body.artistHeadshotData === 'string' && body.artistHeadshotData.length <= 7_340_032 ? body.artistHeadshotData : null

    if (!projectTitle) {
      return NextResponse.json(
        { success: false, message: 'Project title is required.' },
        { status: 400 }
      )
    }
    // For non-draft submissions, require email
    if (body.status !== 'draft' && !artistEmail) {
      return NextResponse.json(
        { success: false, message: 'Valid email is required to submit for review.' },
        { status: 400 }
      )
    }

    // Determine status: 'draft' saves without notifying, anything else is a full submission
    const isDraft = body.status === 'draft'
    const submissionStatus = isDraft ? 'draft' : 'new'

    const submissionData = {
      artist_name: artistName || 'Unknown',
      artist_bio: artistBio || null,
      artist_email: artistEmail,
      artist_website: artistWebsite || null,
      project_title: projectTitle,
      one_sentence: oneSentence || null,
      vision: vision || null,
      experience: experience || null,
      story: story || null,
      goals: goals || null,
      domains: domains || null,
      pathways: pathways || null,
      stage: stage || null,
      scale: scale || null,
      location: location || null,
      materials: materials || null,
      special_needs: specialNeeds || null,
      hero_image_data: heroImageData || null,
      gallery_images_data: galleryImagesData || null,
      collaboration_needs: collaborationNeeds || null,
      collaboration_role_count: collaborationRoleCount,
      artist_headshot_data: artistHeadshotData || null,
      user_id: userId,
      status: submissionStatus,
    }

    // If an 'id' is provided, update the existing draft instead of inserting
    const existingId = typeof body.id === 'string' ? body.id : null
    let submissionId: string

    if (existingId) {
      // Verify user owns this submission
      const { data: existing } = await supabaseAdmin
        .from('project_submissions')
        .select('id, user_id, status')
        .eq('id', existingId)
        .single()

      if (!existing || existing.user_id !== userId) {
        return NextResponse.json(
          { success: false, message: 'Submission not found.' },
          { status: 404 }
        )
      }

      // Only allow updates to drafts and new submissions (not approved/rejected)
      if (existing.status !== 'draft' && existing.status !== 'new') {
        return NextResponse.json(
          { success: false, message: 'This submission can no longer be edited.' },
          { status: 400 }
        )
      }

      const { error: updateError } = await supabaseAdmin
        .from('project_submissions')
        .update(submissionData)
        .eq('id', existingId)

      if (updateError) {
        console.error('Supabase update error:', updateError.message, updateError.code, updateError.details)
        return NextResponse.json(
          { success: false, message: `Update failed: ${updateError.message}` },
          { status: 500 }
        )
      }
      submissionId = existingId
    } else {
      const { data: inserted, error } = await supabaseAdmin
        .from('project_submissions')
        .insert(submissionData)
        .select('id')
        .single()

      if (error) {
        console.error('Supabase insert error:', error.message, error.code, error.details)
        return NextResponse.json(
          { success: false, message: `Save failed: ${error.message}` },
          { status: 500 }
        )
      }
      submissionId = inserted.id
    }

    // Only send notification emails for full submissions (not drafts)
    if (!isDraft) {
      const previewUrl = `/preview/project/${submissionId}`

      try {
        await sendSubmissionNotification('project', {
          project_title: projectTitle,
          artist_name: artistName,
          artist_email: artistEmail,
          stage,
          location,
          one_sentence: oneSentence,
        }, previewUrl)
      } catch (err) { console.error('Admin notification error:', (err as Error).message) }

      try {
        const confirmEmail = projectSubmissionConfirmation(artistName, projectTitle, previewUrl)
        await sendEmail({
          to: artistEmail!,
          subject: confirmEmail.subject,
          html: confirmEmail.html,
        })
      } catch (err) { console.error('Applicant confirmation error:', (err as Error).message) }
    }

    return NextResponse.json({
      success: true,
      id: submissionId,
      message: isDraft ? 'Draft saved.' : 'Submission received successfully.',
      previewUrl: isDraft ? undefined : `/preview/project/${submissionId}`,
    })
  } catch {
    console.error('Submit project error: unexpected server error')
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again.' },
      { status: 500 }
    )
  }
}
