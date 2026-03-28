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

// ─── Content Block System ───────────────────────────────────────

export interface ContentBlock {
  id: string
  type: 'text' | 'gallery' | 'video' | 'project' | 'timeline' | 'testimonials' | 'links' | 'embed' | 'pdf' | 'divider' | 'skills' | 'audio'
  order: number
  visible: boolean
  label?: string
  config?: Record<string, unknown>
  content: TextBlockContent | GalleryBlockContent | VideoBlockContent | ProjectBlockContent | TimelineBlockContent | TestimonialsBlockContent | LinksBlockContent | EmbedBlockContent | PdfBlockContent | DividerBlockContent | SkillsBlockContent | AudioBlockContent
}

export interface TextBlockContent {
  markdown: string
}

export interface GalleryBlockContent {
  items: { url: string; alt: string; caption?: string; isFeatured?: boolean }[]
}

export interface VideoBlockContent {
  url: string
  caption?: string
}

export interface ProjectBlockContent {
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

export interface TimelineBlockContent {
  entries: ProfileTimelineEntry[]
}

export interface TestimonialsBlockContent {
  items: {
    quote: string
    authorName: string
    authorTitle?: string
    authorPhoto?: string
    relationship?: string
  }[]
}

export interface LinksBlockContent {
  items: ProfileLink[]
}

export interface EmbedBlockContent {
  url: string
  height?: number
}

export interface PdfBlockContent {
  url: string
  title: string
  description?: string
}

export interface DividerBlockContent {
  variant: 'line' | 'dots' | 'space'
  label?: string
}

export interface SkillsBlockContent {
  tags: string[]
  label?: string
}

export interface AudioBlockContent {
  url: string
  title?: string
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
  contentBlocks?: ContentBlock[]
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
  profile_visibility?: 'draft' | 'pending' | 'published'
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

export interface ProjectSubmission {
  id: string
  created_at: string
  updated_at: string
  user_id: string | null
  artist_name: string
  artist_email: string
  artist_bio: string | null
  artist_website: string | null
  project_title: string
  one_sentence: string | null
  vision: string | null
  experience: string | null
  story: string | null
  goals: string | null
  domains: string[] | null
  pathways: string[] | null
  stage: string | null
  scale: string | null
  location: string | null
  materials: string | null
  special_needs: string | null
  collaboration_needs: string | null
  collaboration_role_count: number | null
  hero_image_data: string | null
  gallery_images_data: string | null
  status: string
}

export interface CollaborationInterest {
  id: string
  created_at: string
  user_id: string | null
  name: string
  email: string
  phone: string | null
  experience: string
  task_title: string | null
  project_title: string | null
  status: string
}

