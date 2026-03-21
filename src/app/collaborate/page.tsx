import type { Metadata } from 'next'
import tasksData from '../../../data/tasks.json'
import type { CollaborationTask } from '@/types'
import { CollaborationBoard } from '@/components/CollaborationBoard'

export const metadata: Metadata = {
  title: 'Collaboration Opportunities',
  description:
    'Open roles on curated immersive art and regenerative architecture projects — engineering, fabrication, design, and more. Find meaningful work on projects you believe in.',
  alternates: {
    canonical: 'https://resonance.network/collaborate',
  },
  openGraph: {
    title: 'Collaboration Opportunities — Resonance Network',
    description:
      'Put your skills to work on projects that matter — open roles across immersive art, regenerative architecture, and ecological design.',
    url: 'https://resonance.network/collaborate',
    type: 'website',
    images: [{ url: '/og-image.jpg' }],
  },
}

export default function CollaboratePage() {
  const tasks = tasksData as CollaborationTask[]
  return <CollaborationBoard tasks={tasks} />
}
