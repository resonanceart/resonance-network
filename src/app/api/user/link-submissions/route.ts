import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/sanitize'
import { validateCsrf } from '@/lib/csrf'

export async function POST(request: Request) {
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

    // Get the user's profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email, collaborator_profile_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found.' }, { status: 404 })
    }

    const email = profile.email
    const linked: { type: string; title: string }[] = []
    const messagesToInsert: {
      recipient_id: string
      sender_name: string
      subject: string
      body: string
      message_type: string
    }[] = []

    // Find collaborator profiles with matching email
    const { data: collabProfiles } = await supabaseAdmin
      .from('collaborator_profiles')
      .select('id, name')
      .eq('email', email)

    if (collabProfiles && collabProfiles.length > 0) {
      // Link the first collaborator profile if not already linked
      if (!profile.collaborator_profile_id) {
        await supabaseAdmin
          .from('user_profiles')
          .update({ collaborator_profile_id: collabProfiles[0].id })
          .eq('id', user.id)
      }

      for (const cp of collabProfiles) {
        linked.push({ type: 'profile', title: cp.name })
        messagesToInsert.push({
          recipient_id: user.id,
          sender_name: 'Resonance Network',
          subject: 'Your collaborator profile is linked!',
          body: `We found your collaborator profile "${cp.name}" and linked it to your account. You can now track its status from your dashboard.`,
          message_type: 'system',
        })
      }
    }

    // Find project submissions with matching email
    const { data: projectSubs } = await supabaseAdmin
      .from('project_submissions')
      .select('id, project_title')
      .eq('artist_email', email)

    if (projectSubs && projectSubs.length > 0) {
      for (const ps of projectSubs) {
        linked.push({ type: 'project', title: ps.project_title })
        messagesToInsert.push({
          recipient_id: user.id,
          sender_name: 'Resonance Network',
          subject: `Your project "${ps.project_title}" is linked!`,
          body: `We found your project submission "${ps.project_title}". Track its status in your dashboard.`,
          message_type: 'system',
        })
      }
    }

    // Find collaboration interest with matching email
    const { data: interests } = await supabaseAdmin
      .from('collaboration_interest')
      .select('id, task_title, project_title')
      .eq('email', email)

    if (interests && interests.length > 0) {
      for (const ci of interests) {
        const task = ci.task_title || 'a role'
        const project = ci.project_title || 'a project'
        linked.push({ type: 'interest', title: `${task} on ${project}` })
        messagesToInsert.push({
          recipient_id: user.id,
          sender_name: 'Resonance Network',
          subject: `Your collaboration interest is linked!`,
          body: `Your interest in "${task}" on "${project}" is now visible in your dashboard.`,
          message_type: 'system',
        })
      }
    }

    // Insert all welcome messages
    if (messagesToInsert.length > 0) {
      await supabaseAdmin
        .from('user_messages')
        .insert(messagesToInsert)
    }

    return NextResponse.json({
      linked,
      count: linked.length,
    })
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}
