import type { CollaborationTask } from '@/types'
import { Badge } from './ui/Badge'

export function CollaborationTaskCard({ task }: { task: CollaborationTask }) {
  const categoryVariant = task.category.toLowerCase()
  const mailtoHref = `mailto:${task.contactEmail}?subject=${encodeURIComponent(task.contactEmailSubject || 'Collaboration Interest via Resonance Network')}`

  return (
    <div className="task-card">
      <div className="task-card__header">
        <Badge variant={categoryVariant}>{task.category}</Badge>
        <Badge variant={task.status === 'Open' ? 'open' : 'stage'}>{task.status}</Badge>
      </div>
      <h3 className="task-card__title">{task.title}</h3>
      <p className="task-card__project">
        Project: <a href={`/projects/${task.projectId}`}>{task.projectTitle}</a>
      </p>
      <p className="task-card__desc">{task.description}</p>
      <div className="task-card__skills">
        {task.skillsNeeded.map(skill => (
          <span key={skill} className="skill-tag">{skill}</span>
        ))}
      </div>
      <div className="task-card__meta">
        <div className="task-card__meta-item">
          <span className="task-card__meta-label">Scope</span>
          <span>{task.estimatedScope}</span>
        </div>
        {task.rewardDescription && (
          <div className="task-card__meta-item">
            <span className="task-card__meta-label">Reward</span>
            <span>{task.rewardDescription}</span>
          </div>
        )}
      </div>
      <div className="task-card__actions">
        <a
          href={mailtoHref}
          className="btn btn--primary btn--full"
        >
          Raise Your Hand
        </a>
      </div>
    </div>
  )
}
