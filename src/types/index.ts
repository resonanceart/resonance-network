export interface GalleryImage {
  url: string
  alt: string
  caption?: string
}

export interface Collaborator {
  name: string
  role: string
  photo?: string
}

export interface Milestone {
  label: string
  completed: boolean
}

export interface ProjectUpdate {
  date: string
  text: string
  link?: string | null
}

export interface Project {
  id: string
  slug: string
  title: string
  eyebrow: string
  shortDescription: string
  stage: string
  status: 'published' | 'draft'
  domains: string[]
  pathways: string[]
  heroImage: {
    url: string
    alt: string
  }
  galleryImages: GalleryImage[]
  overviewLead?: string
  overviewBody?: string
  leadArtistName?: string
  leadArtistBio?: string
  leadArtistPhoto?: string
  collaborators: Collaborator[]
  scale?: string
  contactEmail?: string
  milestones?: Milestone[]
  updates?: ProjectUpdate[]
  experience?: string
  artistStory?: string
  goals?: string[]
  location?: string
  source?: 'json' | 'supabase'
  supabaseId?: string
}

export interface ProfileProject {
  title: string
  description: string
  image?: string
  url?: string
  year?: string
  role?: string
  materials?: string[]
  outcomes?: string
  galleryImages?: { url: string; alt: string; caption?: string }[]
  isFeatured?: boolean
}

export interface ProfileLink {
  label: string
  url: string
  type?: 'website' | 'instagram' | 'linkedin' | 'portfolio' | 'press' | 'other'
}

export interface ProfileMediaItem {
  url: string
  alt: string
  caption?: string
  type: 'image' | 'video'
  videoEmbedUrl?: string
  isFeatured?: boolean
  order: number
}

export interface ProfileTimelineEntry {
  year: string
  title: string
  organization?: string
  description?: string
  category: 'exhibition' | 'education' | 'award' | 'residency' | 'career' | 'publication' | 'other'
}

export interface Profile {
  id: string
  slug: string
  name: string
  title: string
  type: 'artist' | 'collaborator' | 'collective'
  photo: string
  coverImage?: string
  bio: string
  shortBio: string
  location?: string
  email?: string
  specialties: string[]
  projects: ProfileProject[]
  links: ProfileLink[]
  achievements?: string[]
  philosophy?: string
  mediaGallery?: ProfileMediaItem[]
  timeline?: ProfileTimelineEntry[]
  toolsAndMaterials?: string[]
  availabilityStatus?: 'open' | 'busy' | 'unavailable'
  availabilityNote?: string
  status: 'published' | 'draft'
  source?: 'json' | 'supabase'
  supabaseId?: string
}

export interface UserProfile {
  id: string
  created_at: string
  updated_at: string
  display_name: string
  email: string
  avatar_url: string | null
  bio: string | null
  location: string | null
  website: string | null
  skills: string[] | null
  role: 'collaborator' | 'creator' | 'admin'
  collaborator_profile_id: string | null
  onboarding_complete: boolean
}

export interface UserFollow {
  id: string
  created_at: string
  user_id: string
  project_id: string
}

export interface UserMessage {
  id: string
  created_at: string
  recipient_id: string
  sender_id: string | null
  sender_name: string | null
  subject: string
  body: string
  read: boolean
  message_type: 'notification' | 'collaboration_interest' | 'project_update' | 'system'
  related_project: string | null
  related_task: string | null
}

export interface CollaborationTask {
  id: string
  projectId: string
  projectTitle: string
  title: string
  description: string
  category: string
  status: 'Open' | 'Closed'
  skillsNeeded: string[]
  estimatedScope: string
  rewardDescription?: string | null
  contactEmail: string
  contactEmailSubject?: string
}
