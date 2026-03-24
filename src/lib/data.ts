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
    slug: 'sub-' + slugify(String(row.project_title)),
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
    slug: 'collab-' + slugify(String(row.name)),
    name: String(row.name || ''),
    title: skillsStr.split(',')[0]?.trim() || 'Collaborator',
    type: 'collaborator',
    photo: typeof row.photo_url === 'string' && row.photo_url ? row.photo_url : '/assets/images/team/elliot-fabri.png',
    bio: skillsStr + (portfolioStr ? '\n\n' + portfolioStr : ''),
    shortBio: skillsStr.substring(0, 100),
    location: typeof row.availability === 'string' ? row.availability : undefined,
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
        (row: Record<string, unknown>) => 'sub-' + slugify(String(row.project_title)) === slug
      )
      return match ? mapSubmissionToProject(match) : null
    } catch {
      return null
    }
  }

  return null
}

export async function getProfiles(): Promise<Profile[]> {
  const jsonProfiles = (profilesData as Profile[])
    .filter(p => p.status === 'published')
    .map(p => ({ ...p, source: 'json' as const }))

  try {
    const { data, error } = await supabaseAdmin
      .from('collaborator_profiles')
      .select('*')
      .eq('status', 'approved')

    if (error || !data) return jsonProfiles
    const supabaseProfiles = data.map(mapProfileRow)
    return [...jsonProfiles, ...supabaseProfiles]
  } catch {
    return jsonProfiles
  }
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
        (row: Record<string, unknown>) => 'collab-' + slugify(String(row.name)) === slug
      )
      return match ? mapProfileRow(match) : null
    } catch {
      return null
    }
  }

  return null
}
