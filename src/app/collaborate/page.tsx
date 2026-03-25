import type { Metadata } from 'next'
import tasksData from '../../../data/tasks.json'
import type { CollaborationTask } from '@/types'
import { CollaborationBoard } from '@/components/CollaborationBoard'

export const metadata: Metadata = {
  title: 'Open Roles — Art Jobs & Creative Collaboration Opportunities',
  description: 'Find art jobs and creative collaboration roles on ambitious projects across art, architecture, and ecology — engineering, fabrication, design, grant writing, and more.',
  alternates: {
    canonical: 'https://resonance.network/collaborate',
  },
  openGraph: {
    title: 'Art Jobs & Creative Collaboration — Resonance Network',
    description: 'Open roles on curated art, architecture, and ecology projects — engineering, fabrication, design, grant writing, and more.',
    url: 'https://resonance.network/collaborate',
    type: 'website',
    images: [{ url: '/og-image.jpg' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Art Jobs & Creative Collaboration — Resonance Network',
    description: 'Find meaningful roles on art and architecture projects. Engineering, fabrication, grant writing, and more.',
    images: [{ url: '/og-image.jpg' }],
  },
}

export default function CollaboratePage() {
  const tasks = tasksData as CollaborationTask[]
  return <CollaborationBoard tasks={tasks} />
}
