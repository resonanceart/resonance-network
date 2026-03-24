'use client'
import { useState } from 'react'
import Link from 'next/link'
import projectsData from '../../data/projects.json'
import profilesData from '../../data/profiles.json'
import type { CollaborationTask, Project, Profile } from '@/types'
import { Badge } from './ui/Badge'

export function CollaborationTaskCard({ task }: { task: CollaborationTask }) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [experience, setExperience] = useState('')

  const categoryVariant = task.category.toLowerCase()

  const project = (projectsData as Project[]).find(p => p.slug === task.projectId || p.id === task.projectId)
  const leadName = project?.leadArtistName
  const leadProfile = leadName ? (profilesData as Profile[]).find(p => p.name === leadName && p.status === 'published') : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/collaborate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone: phone || undefined,
          experience,
          taskTitle: task.title,
          projectTitle: task.projectTitle,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setIsSubmitted(true)
      } else {
        setError(data.message || 'Something went wrong.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
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
      {leadName && (
        <p className="task-card__lead">
          Lead:{' '}
          {leadProfile ? (
            <Link href={`/profiles/${leadProfile.slug}`}>{leadName}</Link>
          ) : (
            <span>{leadName}</span>
          )}
        </p>
      )}
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
      ) : isSubmitted ? (
        <div className="task-card__confirmation">
          <div className="form-success">
            <span className="form-success__icon" aria-hidden="true">✓</span>
            <p>Thanks! We&apos;ve received your interest in this role. The project team will be in touch soon.</p>
          </div>
        </div>
      ) : (
        <div className="task-card__form-wrapper">
          {error && <p className="form-error">{error}</p>}
          <form className="task-card__form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor={`name-${task.id}`} className="form-label">Name *</label>
              <input
                id={`name-${task.id}`}
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your full name"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor={`email-${task.id}`} className="form-label">Email *</label>
              <input
                id={`email-${task.id}`}
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor={`phone-${task.id}`} className="form-label">Phone</label>
              <input
                id={`phone-${task.id}`}
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Optional"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor={`exp-${task.id}`} className="form-label">Relevant Experience *</label>
              <textarea
                id={`exp-${task.id}`}
                required
                value={experience}
                onChange={e => setExperience(e.target.value)}
                placeholder="Tell us briefly about your relevant experience"
                rows={3}
                className="form-textarea"
              />
            </div>
            <div className="task-card__form-actions">
              <button
                type="submit"
                className="btn btn--primary btn--full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Introduction'}
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
