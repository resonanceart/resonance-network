'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { CollaborationTask, Project, Profile } from '@/types'
import { Badge } from './ui/Badge'
import projectsData from '../../data/projects.json'
import profilesData from '../../data/profiles.json'

export function CollaborationTaskCard({ task }: { task: CollaborationTask }) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [experience, setExperience] = useState('')

  const project = (projectsData as Project[]).find(p => p.slug === task.projectId || p.id === task.projectId)
  const leadName = project?.leadArtistName
  const leadProfile = leadName ? (profilesData as Profile[]).find(p => p.name === leadName && p.status === 'published') : null
  const heroImage = project?.heroImage?.url

  const categoryVariant = task.category.toLowerCase()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/collaborate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, experience, taskTitle: task.title, projectTitle: task.projectTitle }),
      })
      const data = await res.json()
      if (data.success) setIsSubmitted(true)
      else setError(data.message || 'Something went wrong.')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="task-card">
      {/* Hero banner */}
      {heroImage && (
        <div className="task-card__banner">
          <Image
            src={heroImage}
            alt={`Hero image for the ${task.projectTitle} project`}
            width={600}
            height={200}
            sizes="(max-width: 768px) 100vw, 50vw"
            loading="lazy"
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
        </div>
      )}

      <div className="task-card__content">
        {/* Badges */}
        <div className="task-card__header">
          <Badge variant={categoryVariant}>{task.category}</Badge>
          <Badge variant={task.status === 'Open' ? 'open' : 'stage'}>{task.status}</Badge>
        </div>

        {/* Title */}
        <h3 className="task-card__title">{task.title}</h3>

        {/* Project + Lead on one line */}
        <p className="task-card__meta-line">
          <Link href={`/projects/${task.projectId}`}>{task.projectTitle}</Link>
          {leadName && (
            <>
              {' · '}
              {leadProfile ? (
                <Link href={`/profiles/${leadProfile.slug}`}>{leadName}</Link>
              ) : (
                <span>{leadName}</span>
              )}
            </>
          )}
        </p>

        {/* Skills */}
        <div className="task-card__skills">
          {task.skillsNeeded.slice(0, 4).map(skill => (
            <span key={skill} className="skill-tag">{skill}</span>
          ))}
        </div>

        {/* Scope */}
        <p className="task-card__scope">{task.estimatedScope}</p>

        {/* Compensation */}
        {task.rewardDescription && (
          <div className="task-card__reward">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            <span><strong>Compensation:</strong> {task.rewardDescription}</span>
          </div>
        )}

        {/* Action */}
        {!isFormOpen ? (
          <button className="btn btn--primary btn--full btn--sm" onClick={() => setIsFormOpen(true)}>
            I&apos;m Interested
          </button>
        ) : isSubmitted ? (
          <div className="form-success" style={{ padding: 'var(--space-3) 0' }}>
            <span className="form-success__icon" aria-hidden="true">✓</span>
            <p style={{ fontSize: 'var(--text-sm)' }}>Sent! The team will reach out soon.</p>
          </div>
        ) : (
          <form className="task-card__form" onSubmit={handleSubmit}>
            {error && <p className="form-error" style={{ fontSize: 'var(--text-xs)' }}>{error}</p>}
            <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="form-input" style={{ fontSize: 'var(--text-sm)', padding: 'var(--space-2) var(--space-3)' }} />
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="form-input" style={{ fontSize: 'var(--text-sm)', padding: 'var(--space-2) var(--space-3)' }} />
            <textarea required value={experience} onChange={e => setExperience(e.target.value)} placeholder="Brief relevant experience" rows={2} className="form-textarea" style={{ fontSize: 'var(--text-sm)', padding: 'var(--space-2) var(--space-3)' }} />
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button type="submit" className="btn btn--primary btn--sm" style={{ flex: 1 }} disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send'}
              </button>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setIsFormOpen(false)}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
