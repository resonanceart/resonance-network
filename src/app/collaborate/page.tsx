import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getProfiles, getCollaborationTasksFromSupabase } from '@/lib/data'
import { CommunityPage } from '@/components/CommunityPage'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Community & Open Roles | People, Projects, Collaboration',
  description: 'Meet the creators and collaborators behind Resonance Network. Find open roles on curated immersive art, architecture, and ecological design projects.',
  alternates: {
    canonical: 'https://resonancenetwork.org/collaborate',
  },
  openGraph: {
    title: 'Community & Open Roles | Resonance Network',
    description: 'Browse artists, engineers, and makers. Find collaboration opportunities on ambitious creative projects.',
    url: 'https://resonancenetwork.org/collaborate',
    type: 'website',
    images: [{ url: '/og-image.jpg' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Community & Open Roles | Resonance Network',
    description: 'People and projects building ambitious work at the intersection of art, architecture, and ecology.',
    images: [{ url: '/og-image.jpg' }],
  },
}

export default async function CollaboratePage() {
  const [profiles, tasks] = await Promise.all([
    getProfiles(),
    getCollaborationTasksFromSupabase(),
  ])

  return (
    <Suspense>
      <CommunityPage profiles={profiles} tasks={tasks} />
    </Suspense>
  )
}
