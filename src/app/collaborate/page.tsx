import tasksData from '../../../data/tasks.json'
import type { CollaborationTask } from '@/types'
import { CollaborationBoard } from '@/components/CollaborationBoard'

export const metadata = {
  title: 'Collaboration Opportunities — Resonance Network',
  description:
    'Connect your skills with projects that need your expertise. Browse open collaboration opportunities across large-scale immersive and regenerative projects.',
}

export default function CollaboratePage() {
  const tasks = tasksData as CollaborationTask[]
  return <CollaborationBoard tasks={tasks} />
}
