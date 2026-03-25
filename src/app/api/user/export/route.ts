import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/sanitize'

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

    const email = user.email

    // Fetch all user data in parallel
    const [
      profileResult,
      followsResult,
      messagesResult,
      projectSubmissionsResult,
      collaboratorProfilesResult,
      collaborationInterestResult,
    ] = await Promise.all([
      supabaseAdmin.from('user_profiles').select('*').eq('id', user.id).single(),
      supabaseAdmin.from('user_follows').select('*').eq('user_id', user.id),
      supabaseAdmin.from('user_messages').select('*').eq('recipient_id', user.id),
      email
        ? supabaseAdmin.from('project_submissions').select('*').eq('artist_email', email)
        : Promise.resolve({ data: [], error: null }),
      email
        ? supabaseAdmin.from('collaborator_profiles').select('*').eq('email', email)
        : Promise.resolve({ data: [], error: null }),
      email
        ? supabaseAdmin.from('collaboration_interest').select('*').eq('email', email)
        : Promise.resolve({ data: [], error: null }),
    ])

    const exportData = {
      exported_at: new Date().toISOString(),
      user_id: user.id,
      email: user.email,
      profile: profileResult.data ?? null,
      follows: followsResult.data ?? [],
      messages: messagesResult.data ?? [],
      project_submissions: projectSubmissionsResult.data ?? [],
      collaborator_profiles: collaboratorProfilesResult.data ?? [],
      collaboration_interest: collaborationInterestResult.data ?? [],
    }

    const json = JSON.stringify(exportData, null, 2)

    return new NextResponse(json, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="resonance-data-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    })
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}
