import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { validateCsrf } from '@/lib/csrf'
import { getClientIp } from '@/lib/sanitize'

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

    const { data: profile, error } = await supabaseAdmin
      .from('user_profiles')
      .select('role_type, collaborator_type, goals, fields_of_interest, onboarding_completed, display_name')
      .eq('id', user.id)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch onboarding status.' }, { status: 500 })
    }

    return NextResponse.json({
      onboarding_completed: profile?.onboarding_completed ?? false,
      role_type: profile?.role_type ?? null,
      collaborator_type: profile?.collaborator_type ?? null,
      goals: profile?.goals ?? [],
      fields_of_interest: profile?.fields_of_interest ?? [],
      display_name: profile?.display_name ?? '',
    })
  } catch {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}

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

    const body = await request.json()
    const {
      role_type,
      collaborator_type,
      goals,
      fields_of_interest,
    } = body

    // Validate role_type
    const validRoles = ['artist', 'curator', 'collaborator']
    if (!role_type || !validRoles.includes(role_type)) {
      return NextResponse.json({ error: 'Invalid role type.' }, { status: 400 })
    }

    // Map role_type to the legacy role column
    const roleMapping: Record<string, string> = {
      artist: 'creator',
      curator: 'creator',
      collaborator: 'collaborator',
    }

    const updates: Record<string, unknown> = {
      role: roleMapping[role_type] || 'collaborator',
      role_type,
      onboarding_completed: true,
    }

    if (collaborator_type && role_type === 'collaborator') {
      updates.collaborator_type = String(collaborator_type).slice(0, 200)
    }

    if (Array.isArray(goals)) {
      updates.goals = goals.filter((g: unknown) => typeof g === 'string').slice(0, 20)
    }

    if (Array.isArray(fields_of_interest)) {
      updates.fields_of_interest = fields_of_interest.filter((f: unknown) => typeof f === 'string').slice(0, 50)
    }

    const { error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id)

    if (updateError) {
      console.error('Onboarding update error:', updateError.message)
      return NextResponse.json({ error: 'Failed to save onboarding data.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
