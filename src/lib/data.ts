import { supabaseAdmin } from './supabase'
import projectsData from '../../data/projects.json'
import profilesData from '../../data/profiles.json'
import type { Project, Profile, PortfolioProject, ProjectContentBlock, WorkExperience } from '@/types'

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function mapSubmissionToProject(row: Record<string, unknown>): Project {
  const domains = Array.isArray(row.domains) ? row.domains as string[] : []
  const pathways = Array.isArray(row.pathways) ? row.pathways as string[] : []
  const goalsStr = typeof row.goals === 'string' ? row.goals : ''
  const heroUrl = typeof row.hero_image_data === 'string' ? row.hero_image_data : '/assets/images/projects/money-shot.png'

  // Parse gallery images data to extract images for the galleryImages array
  let parsedGalleryImages: Array<{ url: string; alt: string }> = []
  if (typeof row.gallery_images_data === 'string') {
    try {
      const parsed = JSON.parse(row.gallery_images_data)
      if (Array.isArray(parsed)) {
        parsedGalleryImages = parsed
      } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.images)) {
        parsedGalleryImages = parsed.images
      }
    } catch {}
  }

  // Parse team members
  const teamMembers = Array.isArray(row.team_members)
    ? (row.team_members as Array<{ name: string; role: string; photo: string | null }>)
    : []

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
    galleryImages: parsedGalleryImages.map(img => ({ url: img.url, alt: img.alt || '' })),
    overviewLead: row.vision ? String(row.vision) : undefined,
    overviewBody: row.experience ? String(row.experience) : undefined,
    leadArtistName: row.artist_name ? String(row.artist_name) : undefined,
    leadArtistBio: row.artist_bio ? String(row.artist_bio) : undefined,
    leadArtistPhoto: typeof row.artist_headshot_data === 'string' ? row.artist_headshot_data : undefined,
    collaborators: teamMembers.filter(m => m.name).map(m => ({ name: m.name, role: m.role || '' })),
    experience: row.experience ? String(row.experience) : undefined,
    artistStory: row.story ? String(row.story) : undefined,
    goals: goalsStr ? goalsStr.split('\n').filter(Boolean) : [],
    location: row.location ? String(row.location) : undefined,
    scale: row.scale ? String(row.scale) : undefined,
    contactEmail: row.artist_email ? String(row.artist_email) : undefined,
    source: 'supabase',
    supabaseId: String(row.id),
    // Raw submission fields for public page rendering
    materials: typeof row.materials === 'string' ? row.materials : undefined,
    specialNeeds: typeof row.special_needs === 'string' ? row.special_needs : undefined,
    collaborationNeeds: typeof row.collaboration_needs === 'string' ? row.collaboration_needs : undefined,
    collaborationRoleCount: typeof row.collaboration_role_count === 'number' ? row.collaboration_role_count : undefined,
    galleryImagesData: typeof row.gallery_images_data === 'string' ? row.gallery_images_data : undefined,
    teamMembers: teamMembers.length > 0 ? teamMembers : undefined,
    artistHeadshotData: typeof row.artist_headshot_data === 'string' ? row.artist_headshot_data : undefined,
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

function mapUserProfileRow(
  row: Record<string, unknown>,
  extended?: Record<string, unknown> | null,
  relatedData?: {
    social_links?: Record<string, unknown>[]
    skills?: Record<string, unknown>[]
    tools?: Record<string, unknown>[]
    portfolio_projects?: Record<string, unknown>[]
    work_experience?: Record<string, unknown>[]
  }
): Profile {
  const skills = Array.isArray(row.skills) ? row.skills as string[] : []
  const role = typeof row.role === 'string' ? row.role : 'collaborator'
  const profileType = role === 'creator' || role === 'admin' ? 'artist' : 'collaborator'

  return {
    id: String(row.id),
    slug: slugify(String(row.display_name)),
    name: String(row.display_name || ''),
    title: (extended?.professional_title ? String(extended.professional_title) : '') || skills[0] || (profileType === 'artist' ? 'Creator' : 'Collaborator'),
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
    ...(extended ? (() => {
      return {
        // Pass media_gallery through as-is — ProfileSmartGallery handles both
        // unified format (items with type/id/url/order) and legacy format
        mediaGallery: extended.media_gallery || undefined,
        timeline: extended.timeline || undefined,
        toolsAndMaterials: extended.tools_and_materials || undefined,
        availabilityStatus: extended.availability_status || undefined,
        availabilityNote: extended.availability_note || undefined,
        coverImage: extended.cover_image_url ? String(extended.cover_image_url) : undefined,
        achievements: extended.achievements || undefined,
        philosophy: extended.philosophy || undefined,
        contentBlocks: extended.content_blocks || undefined,
        pronouns: extended.pronouns ? String(extended.pronouns) : undefined,
        location_secondary: extended.location_secondary ? String(extended.location_secondary) : undefined,
        artist_statement: extended.artist_statement ? String(extended.artist_statement) : undefined,
        accent_color: extended.accent_color ? String(extended.accent_color) : undefined,
        cover_position: extended.cover_position as { x: number; y: number; scale: number } | undefined,
        availability_types: Array.isArray(extended.availability_types) ? extended.availability_types as string[] : undefined,
        primary_website_url: extended.primary_website_url ? String(extended.primary_website_url) : undefined,
        primary_website_label: extended.primary_website_label ? String(extended.primary_website_label) : undefined,
        cta_primary_label: extended.cta_primary_label ? String(extended.cta_primary_label) : undefined,
        cta_primary_action: extended.cta_primary_action as 'contact' | 'url' | 'booking' | undefined,
        cta_primary_url: extended.cta_primary_url ? String(extended.cta_primary_url) : undefined,
        cta_secondary_label: extended.cta_secondary_label ? String(extended.cta_secondary_label) : undefined,
        cta_secondary_action: extended.cta_secondary_action ? String(extended.cta_secondary_action) : undefined,
        cta_secondary_url: extended.cta_secondary_url ? String(extended.cta_secondary_url) : undefined,
        section_order: Array.isArray(extended.section_order) ? extended.section_order as string[] : undefined,
        section_visibility: extended.section_visibility as Record<string, boolean> | undefined,
        resume_url: extended.resume_url ? String(extended.resume_url) : undefined,
        portfolio_pdf_url: extended.portfolio_pdf_url ? String(extended.portfolio_pdf_url) : undefined,
        media_links: Array.isArray(extended.media_links) ? extended.media_links as { label: string; url: string; type: 'website' | 'fundraiser' | 'other' }[] : undefined,
        past_work: Array.isArray(extended.past_work) ? extended.past_work as { url: string; title: string; description?: string }[] : undefined,
        pdf_documents: Array.isArray(extended.pdf_documents) ? extended.pdf_documents as { url: string; title: string }[] : undefined,
      }
    })() : {}),
    // Related data from separate tables
    ...(relatedData ? {
      social_links: relatedData.social_links || undefined,
      profile_skills: relatedData.skills || undefined,
      profile_tools: relatedData.tools || undefined,
      portfolio_projects: relatedData.portfolio_projects || undefined,
      work_experience: (relatedData.work_experience as unknown as WorkExperience[]) || undefined,
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
  // Check Supabase user profiles FIRST (these are the real, editable profiles)
  // JSON profiles are legacy sample data and should only be used as fallback

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
  // Fetch all profiles (not just published) so admins and preview can access
  try {
    const { data: allUsers, error: upError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .limit(1000)
      .order('created_at', { ascending: false })

    if (!upError && allUsers) {
      // First try published, then any visibility
      const publishedMatch = allUsers.find(
        (row: Record<string, unknown>) => slugify(String(row.display_name)) === slug && row.profile_visibility === 'published'
      )
      const anyMatch = allUsers.find(
        (row: Record<string, unknown>) => slugify(String(row.display_name)) === slug
      )
      const match = publishedMatch || anyMatch
      if (match) {
        const profileId = String(match.id)

        // Fetch all related data in parallel (matching getProfileBySlugEnhanced)
        const [extResult, socialResult, skillsResult, toolsResult, projectsResult, workExpResult] = await Promise.all([
          supabaseAdmin.from('profile_extended').select('*').eq('id', profileId).single(),
          supabaseAdmin.from('profile_social_links').select('*').eq('profile_id', profileId).order('display_order'),
          supabaseAdmin.from('profile_skills').select('*').eq('profile_id', profileId).order('display_order'),
          supabaseAdmin.from('profile_tools').select('*').eq('profile_id', profileId).order('display_order'),
          supabaseAdmin.from('portfolio_projects').select('*').eq('profile_id', profileId).eq('status', 'published').order('display_order'),
          supabaseAdmin.from('work_experience').select('*').eq('profile_id', profileId).order('display_order'),
        ])

        return mapUserProfileRow(
          match as Record<string, unknown>,
          extResult.data as Record<string, unknown> | null,
          {
            social_links: (socialResult.data as Record<string, unknown>[]) || undefined,
            skills: (skillsResult.data as Record<string, unknown>[]) || undefined,
            tools: (toolsResult.data as Record<string, unknown>[]) || undefined,
            portfolio_projects: (projectsResult.data as Record<string, unknown>[]) || undefined,
            work_experience: (workExpResult.data as Record<string, unknown>[]) || undefined,
          }
        )
      }
    }
  } catch {
    // continue
  }

  // Fallback: check legacy JSON profiles (sample data)
  const jsonProfile = (profilesData as Profile[]).find(
    p => p.slug === slug && p.status === 'published'
  )
  if (jsonProfile) return { ...jsonProfile, source: 'json' }

  return null
}

export async function getProfileBySlugEnhanced(slug: string): Promise<Profile | null> {
  // Check JSON profiles first
  const jsonProfile = (profilesData as Profile[]).find(
    p => p.slug === slug && p.status === 'published'
  )
  if (jsonProfile) return { ...jsonProfile, source: 'json' }

  // Collaborator profiles
  if (slug.startsWith('collab-')) {
    return getProfileBySlug(slug)
  }

  // User profile with full enhanced data
  try {
    const { data: publishedUsers, error: upError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('profile_visibility', 'published')

    if (upError || !publishedUsers) return null

    const match = publishedUsers.find(
      (row: Record<string, unknown>) => slugify(String(row.display_name)) === slug
    )
    if (!match) return null

    const profileId = String(match.id)

    // Fetch all related data in parallel
    const [extResult, socialResult, skillsResult, toolsResult, projectsResult, workExpResult] = await Promise.all([
      supabaseAdmin.from('profile_extended').select('*').eq('id', profileId).single(),
      supabaseAdmin.from('profile_social_links').select('*').eq('profile_id', profileId).order('display_order'),
      supabaseAdmin.from('profile_skills').select('*').eq('profile_id', profileId).order('display_order'),
      supabaseAdmin.from('profile_tools').select('*').eq('profile_id', profileId).order('display_order'),
      supabaseAdmin.from('portfolio_projects').select('*').eq('profile_id', profileId).eq('status', 'published').order('display_order'),
      supabaseAdmin.from('work_experience').select('*').eq('profile_id', profileId).order('display_order'),
    ])

    return mapUserProfileRow(
      match as Record<string, unknown>,
      extResult.data as Record<string, unknown> | null,
      {
        social_links: (socialResult.data as Record<string, unknown>[]) || undefined,
        skills: (skillsResult.data as Record<string, unknown>[]) || undefined,
        tools: (toolsResult.data as Record<string, unknown>[]) || undefined,
        portfolio_projects: (projectsResult.data as Record<string, unknown>[]) || undefined,
        work_experience: (workExpResult.data as Record<string, unknown>[]) || undefined,
      }
    )
  } catch {
    return null
  }
}

export async function getPortfolioProject(
  profileSlug: string,
  projectSlug: string
): Promise<(PortfolioProject & { content_blocks: ProjectContentBlock[] }) | null> {
  try {
    // Find profile
    const { data: users } = await supabaseAdmin
      .from('user_profiles')
      .select('id, display_name')
      .eq('profile_visibility', 'published')

    if (!users) return null

    const match = users.find(
      (u: Record<string, unknown>) => slugify(String(u.display_name)) === profileSlug
    )
    if (!match) return null

    const profileId = String(match.id)

    const { data: project, error } = await supabaseAdmin
      .from('portfolio_projects')
      .select('*')
      .eq('profile_id', profileId)
      .eq('slug', projectSlug)
      .eq('status', 'published')
      .single()

    if (error || !project) return null

    const { data: blocks } = await supabaseAdmin
      .from('portfolio_content_blocks')
      .select('*')
      .eq('project_id', project.id)
      .order('display_order')

    return {
      ...(project as unknown as PortfolioProject),
      content_blocks: (blocks as unknown as ProjectContentBlock[]) || [],
    }
  } catch {
    return null
  }
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
