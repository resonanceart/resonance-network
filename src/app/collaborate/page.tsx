import type { Metadata } from 'next'
import { getProfiles, getCollaborationTasksFromSupabase } from '@/lib/data'
import tasksData from '../../../data/tasks.json'
import type { CollaborationTask } from '@/types'
import { CommunityPage } from '@/components/CommunityPage'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Community & Open Roles — People, Projects, Collaboration',
  description: 'Meet the creators and collaborators behind Resonance Network. Find open roles on curated immersive art, architecture, and ecological design projects.',
  alternates: {
    canonical: 'https://resonance.network/collaborate',
  },
  openGraph: {
    title: 'Community & Open Roles — Resonance Network',
    description: 'Browse artists, engineers, and makers. Find collaboration opportunities on ambitious creative projects.',
    url: 'https://resonance.network/collaborate',
    type: 'website',
    images: [{ url: '/og-image.jpg' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Community & Open Roles — Resonance Network',
    description: 'People and projects building ambitious work at the intersection of art, architecture, and ecology.',
    images: [{ url: '/og-image.jpg' }],
  },
}

export default async function CollaboratePage() {
  const [profiles, staticTasks, supabaseTasks] = await Promise.all([
    getProfiles(),
    Promise.resolve(tasksData as CollaborationTask[]),
    getCollaborationTasksFromSupabase(),
  ])

  // Tag static tasks as JSON source, then combine (Supabase first)
  const taggedStaticTasks = staticTasks.map(t => ({ ...t, source: 'json' as const }))
  const tasks = [...supabaseTasks, ...taggedStaticTasks]

  return <CommunityPage profiles={profiles} tasks={tasks} />
}
