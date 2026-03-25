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

    return NextResponse.json({ profile })
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

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update.' },
        { status: 400 }
      )
    }

    const { data: profile, error } = await supabaseAdmin
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

    return NextResponse.json({ profile })
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}
