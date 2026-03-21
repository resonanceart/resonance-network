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
  link: string | null
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
