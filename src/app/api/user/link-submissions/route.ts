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

    // Get user email
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('email')
      .eq('id', user.id)
      .single()

    if (!profile?.email) {
      return NextResponse.json({ error: 'No email found on profile.' }, { status: 400 })
    }

    const email = profile.email

    // Link project submissions
    const { count: projectsLinked } = await supabaseAdmin
      .from('project_submissions')
      .update({ user_id: user.id })
      .eq('artist_email', email)
      .is('user_id', null)
      .select('id', { count: 'exact', head: true })

    // Link collaboration interests
    const { count: interestsLinked } = await supabaseAdmin
      .from('collaboration_interest')
      .update({ user_id: user.id })
      .eq('email', email)
      .is('user_id', null)
      .select('id', { count: 'exact', head: true })

    // Link collaborator profiles
    const { data: collabProfile } = await supabaseAdmin
      .from('collaborator_profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (collabProfile) {
      await supabaseAdmin
        .from('user_profiles')
        .update({ collaborator_profile_id: collabProfile.id })
        .eq('id', user.id)
        .is('collaborator_profile_id', null)
    }

    return NextResponse.json({
      success: true,
      linked: {
        projects: projectsLinked || 0,
        interests: interestsLinked || 0,
        collaboratorProfile: collabProfile ? true : false,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
