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
}

export interface ProfileProject {
  title: string
  description: string
  image?: string
  url?: string
  year?: string
  role?: string
}

export interface ProfileLink {
  label: string
  url: string
  type?: 'website' | 'instagram' | 'linkedin' | 'portfolio' | 'press' | 'other'
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
  status: 'published' | 'draft'
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
