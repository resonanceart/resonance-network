import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getClientIp, sanitizeText } from '@/lib/sanitize'
import { rateLimit } from '@/lib/rate-limit'

// Badge types are stored in profile_extended as a JSON field on a special "system" row
// User badges are stored in profile_extended.badges as an array on each user's row

const DEFAULT_BADGE_TYPES = [
  { id: 'founder', label: 'Founder', symbol: '⚡', description: 'One of the first members of Resonance Network', category: 'status' },
  { id: 'featured', label: 'Featured', symbol: '◆', description: 'Profile was featured on the homepage', category: 'status' },
  { id: 'project_collaborator', label: 'Project Collaborator', symbol: '⊕', description: 'Active collaborator on a project', category: 'project' },
  { id: 'project_lead', label: 'Project Lead', symbol: '★', description: 'Leading or created an approved project', category: 'project' },
  { id: 'multi_project', label: 'Multi-Project', symbol: '★★', description: 'Collaborated on 3 or more projects', category: 'project' },
  { id: 'pioneer', label: 'Pioneer', symbol: '✦', description: 'Completed profile within first week of joining', category: 'engagement' },
  { id: 'connector', label: 'Connector', symbol: '⇄', description: 'Sent 5 or more collaboration interest requests', category: 'engagement' },
  { id: 'portfolio_pro', label: 'Portfolio Pro', symbol: '▦', description: 'Added 5 or more gallery items to profile', category: 'engagement' },
  { id: 'networked', label: 'Networked', symbol: '◎', description: 'Followed 10 or more projects', category: 'engagement' },
  { id: 'builder', label: 'Builder', symbol: '⚒', description: 'Listed fabrication or engineering skills', category: 'skill' },
  { id: 'curator', label: 'Curator', symbol: '◈', description: 'Organized or curated projects', category: 'skill' },
]

async function isAdmin(request: Request): Promise<boolean> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data } = await supabaseAdmin
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  return data?.role === 'admin'
}

// GET — list all badge types + all awarded badges
export async function GET(request: Request) {
  const ip = getClientIp(request)
  if (!rateLimit(ip)) return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
  if (!(await isAdmin(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get badge types from system config
  const { data: config } = await supabaseAdmin
    .from('profile_extended')
    .select('badges')
    .eq('id', '00000000-0000-0000-0000-000000000000')
    .single()

  const badgeTypes = config?.badges || DEFAULT_BADGE_TYPES

  // Get all user badges
  const { data: allExtended } = await supabaseAdmin
    .from('profile_extended')
    .select('id, badges')
    .not('id', 'eq', '00000000-0000-0000-0000-000000000000')

  // Get user names for display
  const { data: profiles } = await supabaseAdmin
    .from('user_profiles')
    .select('id, display_name, avatar_url')

  const profileMap = new Map((profiles || []).map((p: Record<string, unknown>) => [p.id, p]))

  const awardedBadges: Array<Record<string, unknown>> = []
  for (const ext of (allExtended || [])) {
    const userBadges = ext.badges as Array<Record<string, unknown>> | null
    if (userBadges && Array.isArray(userBadges)) {
      const profile = profileMap.get(ext.id) as Record<string, unknown> | undefined
      for (const badge of userBadges) {
        awardedBadges.push({
          ...badge,
          profile_id: ext.id,
          display_name: profile?.display_name || 'Unknown',
          avatar_url: profile?.avatar_url || null,
        })
      }
    }
  }

  return NextResponse.json({ badgeTypes, awardedBadges })
}

// POST — award a badge or manage badge types
export async function POST(request: Request) {
  const ip = getClientIp(request)
  if (!rateLimit(ip)) return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
  if (!(await isAdmin(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { action } = body

  // Award a badge to a user
  if (action === 'award') {
    const { profile_id, badge_type, custom_label, custom_description, project_name } = body
    if (!profile_id || !badge_type) {
      return NextResponse.json({ error: 'profile_id and badge_type are required.' }, { status: 400 })
    }

    // Get current user badges
    const { data: ext } = await supabaseAdmin
      .from('profile_extended')
      .select('badges')
      .eq('id', profile_id)
      .single()

    const currentBadges = (ext?.badges as Array<Record<string, unknown>>) || []

    // Don't duplicate same badge_type (unless it's project-specific)
    const isDuplicate = currentBadges.some(
      b => b.badge_type === badge_type && (!project_name || b.project_name === project_name)
    )
    if (isDuplicate) {
      return NextResponse.json({ error: 'User already has this badge.' }, { status: 400 })
    }

    const newBadge = {
      badge_type,
      label: custom_label || undefined,
      description: custom_description || undefined,
      project_name: project_name || undefined,
      awarded_at: new Date().toISOString(),
    }

    const updatedBadges = [...currentBadges, newBadge]

    const { error } = await supabaseAdmin
      .from('profile_extended')
      .upsert({ id: profile_id, badges: updatedBadges }, { onConflict: 'id' })

    if (error) {
      console.error('Award badge error:', error.message)
      return NextResponse.json({ error: 'Failed to award badge.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, badges: updatedBadges })
  }

  // Remove a badge from a user
  if (action === 'remove') {
    const { profile_id, badge_type, project_name } = body
    if (!profile_id || !badge_type) {
      return NextResponse.json({ error: 'profile_id and badge_type are required.' }, { status: 400 })
    }

    const { data: ext } = await supabaseAdmin
      .from('profile_extended')
      .select('badges')
      .eq('id', profile_id)
      .single()

    const currentBadges = (ext?.badges as Array<Record<string, unknown>>) || []
    const updatedBadges = currentBadges.filter(
      b => !(b.badge_type === badge_type && (!project_name || b.project_name === project_name))
    )

    const { error } = await supabaseAdmin
      .from('profile_extended')
      .update({ badges: updatedBadges })
      .eq('id', profile_id)

    if (error) {
      return NextResponse.json({ error: 'Failed to remove badge.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, badges: updatedBadges })
  }

  // Update badge types (add/edit/remove badge definitions)
  if (action === 'update_types') {
    const { badgeTypes } = body
    if (!Array.isArray(badgeTypes)) {
      return NextResponse.json({ error: 'badgeTypes must be an array.' }, { status: 400 })
    }

    const sanitized = badgeTypes.map((bt: Record<string, unknown>) => ({
      id: sanitizeText(bt.id, 50),
      label: sanitizeText(bt.label, 100),
      symbol: sanitizeText(bt.symbol, 10),
      description: sanitizeText(bt.description, 500),
      category: sanitizeText(bt.category, 50),
    }))

    const { error } = await supabaseAdmin
      .from('profile_extended')
      .upsert({ id: '00000000-0000-0000-0000-000000000000', badges: sanitized }, { onConflict: 'id' })

    if (error) {
      console.error('Update badge types error:', error.message)
      return NextResponse.json({ error: 'Failed to update badge types.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, badgeTypes: sanitized })
  }

  return NextResponse.json({ error: 'Invalid action.' }, { status: 400 })
}
