import { supabaseAdmin } from './supabase'
import projectsData from '../../data/projects.json'
import profilesData from '../../data/profiles.json'
import type { Project, Profile } from '@/types'

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function mapSubmissionToProject(row: Record<string, unknown>): Project {
  const domains = Array.isArray(row.domains) ? row.domains as string[] : []
  const pathways = Array.isArray(row.pathways) ? row.pathways as string[] : []
  const goalsStr = typeof row.goals === 'string' ? row.goals : ''
  const heroUrl = typeof row.hero_image_data === 'string' ? row.hero_image_data : '/assets/images/projects/money-shot.png'

  return {
    id: String(row.id),
    slug: 'sub-' + slugify(String(row.project_title)) + '-' + String(row.id).substring(0, 8),
    title: String(row.project_title || ''),
    eyebrow: domains.slice(0, 2).join(' | ') || String(row.stage || 'Project'),
    shortDescription: String(row.one_sentence || '').substring(0, 150) || String(row.vision || '').substring(0, 150),
    stage: String(row.stage || 'Concept'),
    status: 'published',
    domains,
    pathways,
    heroImage: { url: heroUrl, alt: String(row.project_title || '') },
    galleryImages: [],
    overviewLead: row.vision ? String(row.vision) : undefined,
    overviewBody: row.experience ? String(row.experience) : undefined,
    leadArtistName: row.artist_name ? String(row.artist_name) : undefined,
    leadArtistBio: row.artist_bio ? String(row.artist_bio) : undefined,
    collaborators: [],
    experience: row.experience ? String(row.experience) : undefined,
    artistStory: row.story ? String(row.story) : undefined,
    goals: goalsStr ? goalsStr.split('\n').filter(Boolean) : [],
    location: row.location ? String(row.location) : undefined,
    scale: row.scale ? String(row.scale) : undefined,
    contactEmail: row.artist_email ? String(row.artist_email) : undefined,
    source: 'supabase',
    supabaseId: String(row.id),
  }
}

function mapProfileRow(row: Record<string, unknown>): Profile {
  const skillsStr = typeof row.skills === 'string' ? row.skills : ''
  const portfolioStr = typeof row.portfolio === 'string' ? row.portfolio : ''
  const portfolioUrl = portfolioStr.match(/https?:\/\/\S+/)?.[0]

  return {
    id: String(row.id),
    slug: 'collab-' + slugify(String(row.name)) + '-' + String(row.id).substring(0, 8),
    name: String(row.name || ''),
    title: skillsStr.split(',')[0]?.trim() || 'Collaborator',
    type: 'collaborator',
    photo: typeof row.headshot_data === 'string' && row.headshot_data ? row.headshot_data : (typeof row.photo_url === 'string' && row.photo_url ? row.photo_url : '/assets/images/team/placeholder.svg'),
    bio: typeof row.bio === 'string' && row.bio ? row.bio : skillsStr,
    shortBio: (typeof row.bio === 'string' && row.bio ? row.bio : skillsStr).substring(0, 100),
    location: typeof row.location === 'string' ? row.location : undefined,
    email: typeof row.email === 'string' ? row.email : undefined,
    specialties: skillsStr ? skillsStr.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
    projects: [],
    links: portfolioUrl ? [{ label: 'Portfolio', url: portfolioUrl, type: 'portfolio' as const }] : [],
    status: 'published',
    source: 'supabase',
    supabaseId: String(row.id),
  }
}

export async function getProjects(): Promise<Project[]> {
  const jsonProjects = (projectsData as Project[])
    .filter(p => p.status === 'published')
    .map(p => ({ ...p, source: 'json' as const }))

  try {
    const { data, error } = await supabaseAdmin
      .from('project_submissions')
      .select('*')
      .eq('status', 'approved')

    if (error || !data) return jsonProjects
    const supabaseProjects = data.map(mapSubmissionToProject)
    return [...jsonProjects, ...supabaseProjects]
  } catch {
    return jsonProjects
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const jsonProject = (projectsData as Project[]).find(
    p => p.slug === slug && p.status === 'published'
  )
  if (jsonProject) return { ...jsonProject, source: 'json' }

  if (slug.startsWith('sub-')) {
    try {
      const { data, error } = await supabaseAdmin
        .from('project_submissions')
        .select('*')
        .eq('status', 'approved')

      if (error || !data) return null
      const match = data.find(
        (row: Record<string, unknown>) =>
          'sub-' + slugify(String(row.project_title)) + '-' + String(row.id).substring(0, 8) === slug
      )
      return match ? mapSubmissionToProject(match) : null
    } catch {
      return null
    }
  }

  return null
}

function mapUserProfileRow(row: Record<string, unknown>, extended?: Record<string, unknown> | null): Profile {
  const skills = Array.isArray(row.skills) ? row.skills as string[] : []
  const role = typeof row.role === 'string' ? row.role : 'collaborator'
  const profileType = role === 'creator' || role === 'admin' ? 'artist' : 'collaborator'

  return {
    id: String(row.id),
    slug: slugify(String(row.display_name)),
    name: String(row.display_name || ''),
    title: skills[0] || (profileType === 'artist' ? 'Creator' : 'Collaborator'),
    type: profileType,
    photo: typeof row.avatar_url === 'string' && row.avatar_url ? row.avatar_url : '/assets/images/team/placeholder.svg',
    bio: typeof row.bio === 'string' ? row.bio : '',
    shortBio: (typeof row.bio === 'string' ? row.bio : '').substring(0, 100),
    location: typeof row.location === 'string' ? row.location : undefined,
    email: typeof row.email === 'string' ? row.email : undefined,
    specialties: skills,
    projects: [],
    links: typeof row.website === 'string' && row.website ? [{ label: 'Website', url: row.website, type: 'website' as const }] : [],
    status: 'published',
    source: 'supabase' as const,
    supabaseId: String(row.id),
    ...(extended ? {
      mediaGallery: extended.media_gallery || undefined,
      timeline: extended.timeline || undefined,
      toolsAndMaterials: extended.tools_and_materials || undefined,
      availabilityStatus: extended.availability_status || undefined,
      availabilityNote: extended.availability_note || undefined,
      coverImageUrl: extended.cover_image_url || undefined,
      achievements: extended.achievements || undefined,
      philosophy: extended.philosophy || undefined,
      contentBlocks: extended.content_blocks || undefined,
    } : {}),
  } as Profile
}

export async function getProfiles(): Promise<Profile[]> {
  const jsonProfiles = (profilesData as Profile[])
    .filter(p => p.status === 'published')
    .map(p => ({ ...p, source: 'json' as const }))

  let supabaseProfiles: Profile[] = []
  let userProfiles: Profile[] = []

  try {
    const { data, error } = await supabaseAdmin
      .from('collaborator_profiles')
      .select('*')
      .eq('status', 'approved')

    if (!error && data) {
      supabaseProfiles = data.map(mapProfileRow)
    }
  } catch {
    // continue without collaborator profiles
  }

  try {
    const { data: publishedUsers, error: upError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('profile_visibility', 'published')

    if (!upError && publishedUsers) {
      // Fetch extended profiles for all published users
      const userIds = publishedUsers.map((u: Record<string, unknown>) => String(u.id))
      let extendedMap: Record<string, Record<string, unknown>> = {}

      if (userIds.length > 0) {
        const { data: extendedData } = await supabaseAdmin
          .from('profile_extended')
          .select('*')
          .in('id', userIds)

        if (extendedData) {
          extendedMap = Object.fromEntries(
            extendedData.map((e: Record<string, unknown>) => [String(e.id), e])
          )
        }
      }

      userProfiles = publishedUsers.map((u: Record<string, unknown>) =>
        mapUserProfileRow(u, extendedMap[String(u.id)] || null)
      )
    }
  } catch {
    // continue without user profiles
  }

  return [...jsonProfiles, ...supabaseProfiles, ...userProfiles]
}

export async function getProfileBySlug(slug: string): Promise<Profile | null> {
  const jsonProfile = (profilesData as Profile[]).find(
    p => p.slug === slug && p.status === 'published'
  )
  if (jsonProfile) return { ...jsonProfile, source: 'json' }

  if (slug.startsWith('collab-')) {
    try {
      const { data, error } = await supabaseAdmin
        .from('collaborator_profiles')
        .select('*')
        .eq('status', 'approved')

      if (error || !data) return null
      const match = data.find(
        (row: Record<string, unknown>) =>
          'collab-' + slugify(String(row.name)) + '-' + String(row.id).substring(0, 8) === slug
      )
      if (match) {
        const mapped = mapProfileRow(match)
        try {
          // Look up user account linked to this collaborator profile
          const { data: userProfile } = await supabaseAdmin
            .from('user_profiles')
            .select('id')
            .eq('collaborator_profile_id', String(match.id))
            .single()

          if (userProfile) {
            const { data: extended } = await supabaseAdmin
              .from('profile_extended')
              .select('*')
              .eq('id', userProfile.id)
              .single()

            if (extended) {
              return {
                ...mapped,
                mediaGallery: extended.media_gallery || undefined,
                timeline: extended.timeline || undefined,
                toolsAndMaterials: extended.tools_and_materials || undefined,
                availabilityStatus: extended.availability_status || undefined,
                availabilityNote: extended.availability_note || undefined,
                contentBlocks: extended.content_blocks || undefined,
              } as Profile
            }
          }
        } catch {
          // Extended data not available, continue with base profile
        }
        return mapped
      }
      return null
    } catch {
      return null
    }
  }

  // Check for user profile by slugified display_name
  try {
    const { data: publishedUsers, error: upError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('profile_visibility', 'published')

    if (!upError && publishedUsers) {
      const match = publishedUsers.find(
        (row: Record<string, unknown>) => slugify(String(row.display_name)) === slug
      )
      if (match) {
        const { data: extended } = await supabaseAdmin
          .from('profile_extended')
          .select('*')
          .eq('id', String(match.id))
          .single()

        return mapUserProfileRow(match as Record<string, unknown>, extended as Record<string, unknown> | null)
      }
    }
  } catch {
    // continue
  }

  return null
}

export async function getProfileByUserId(userId: string): Promise<Profile | null> {
  try {
    const { data: userProfile, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !userProfile) return null

    // Check if user has a linked collaborator profile
    if (userProfile.collaborator_profile_id) {
      const { data: collabProfile } = await supabaseAdmin
        .from('collaborator_profiles')
        .select('*')
        .eq('id', userProfile.collaborator_profile_id)
        .single()

      if (collabProfile) {
        const base = mapProfileRow(collabProfile)

        // Merge extended data
        const { data: extended } = await supabaseAdmin
          .from('profile_extended')
          .select('*')
          .eq('id', userId)
          .single()

        if (extended) {
          return {
            ...base,
            mediaGallery: extended.media_gallery || undefined,
            timeline: extended.timeline || undefined,
            toolsAndMaterials: extended.tools_and_materials || undefined,
            availabilityStatus: extended.availability_status || undefined,
            availabilityNote: extended.availability_note || undefined,
            contentBlocks: extended.content_blocks || undefined,
          } as Profile
        }
        return base
      }
    }

    // Build a minimal profile from user_profiles
    const slug = 'user-' + slugify(userProfile.display_name) + '-' + userId.substring(0, 8)

    // Fetch extended data
    const { data: extended } = await supabaseAdmin
      .from('profile_extended')
      .select('*')
      .eq('id', userId)
      .single()

    return {
      id: userId,
      slug,
      name: userProfile.display_name,
      title: userProfile.role || 'Collaborator',
      type: 'collaborator',
      photo: userProfile.avatar_url || '/assets/images/team/placeholder.svg',
      bio: userProfile.bio || '',
      shortBio: (userProfile.bio || '').substring(0, 100),
      location: userProfile.location || undefined,
      email: userProfile.email,
      specialties: userProfile.skills || [],
      projects: [],
      links: userProfile.website ? [{ label: 'Website', url: userProfile.website, type: 'website' as const }] : [],
      status: 'published',
      source: 'supabase',
      supabaseId: userId,
      ...(extended ? {
        mediaGallery: extended.media_gallery || undefined,
        timeline: extended.timeline || undefined,
        toolsAndMaterials: extended.tools_and_materials || undefined,
        availabilityStatus: extended.availability_status || undefined,
        availabilityNote: extended.availability_note || undefined,
        contentBlocks: extended.content_blocks || undefined,
      } : {}),
    } as Profile
  } catch {
    return null
  }
}
