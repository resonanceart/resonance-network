'use client'
import { useState, useRef } from 'react'
import type { CollaborationTask } from '@/types'
import { Badge } from './ui/Badge'

export function CollaborationTaskCard({ task }: { task: CollaborationTask }) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [experience, setExperience] = useState('')
  const formRef = useRef<HTMLDivElement>(null)

  const categoryVariant = task.category.toLowerCase()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const subject = encodeURIComponent(task.contactEmailSubject || `Collaboration Interest: ${task.title}`)
    const body = encodeURIComponent(
      `Hi,\n\nI'm interested in the "${task.title}" role on ${task.projectTitle}.\n\n` +
      `Name: ${name}\n` +
      `Email: ${email}\n` +
      (phone ? `Phone: ${phone}\n` : '') +
      `\nRelevant Experience:\n${experience}\n\n` +
      `—\nSent via Resonance Network`
    )
    window.location.href = `mailto:${task.contactEmail}?subject=${subject}&body=${body}`
  }

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

      {!isFormOpen ? (
        <div className="task-card__actions">
          <button
            className="btn btn--primary btn--full"
            onClick={() => setIsFormOpen(true)}
          >
            Connect Me
          </button>
        </div>
      ) : (
        <div className="task-card__form-wrapper" ref={formRef}>
          <form className="task-card__form" onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor={`name-${task.id}`}>Name *</label>
              <input
                id={`name-${task.id}`}
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div className="form-field">
              <label htmlFor={`email-${task.id}`}>Email *</label>
              <input
                id={`email-${task.id}`}
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="form-field">
              <label htmlFor={`phone-${task.id}`}>Phone</label>
              <input
                id={`phone-${task.id}`}
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="form-field">
              <label htmlFor={`exp-${task.id}`}>Relevant Experience *</label>
              <textarea
                id={`exp-${task.id}`}
                required
                value={experience}
                onChange={e => setExperience(e.target.value)}
                placeholder="Tell us briefly about your relevant experience"
                rows={3}
              />
            </div>
            <div className="task-card__form-actions">
              <button type="submit" className="btn btn--primary btn--full">
                Send Introduction
              </button>
              <button
                type="button"
                className="btn btn--ghost btn--full"
                onClick={() => setIsFormOpen(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
