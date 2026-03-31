'use client'

import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'

export default function FeedbackPage() {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/feature-requests', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), description: description.trim(), priority }),
      })
      if (res.ok) {
        setSubmitted(true)
        setTitle('')
        setDescription('')
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Failed to submit. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    }
    setSubmitting(false)
  }

  return (
    <div className="container" style={{ maxWidth: 700, paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-10)' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-2)' }}>Feedback & Feature Requests</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>
        Help us improve Resonance Network. Share your ideas, report issues, or request new features.
      </p>

      {submitted ? (
        <div style={{ padding: 'var(--space-6)', background: 'rgba(1,105,111,0.1)', border: '1px solid var(--color-primary)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" style={{ marginBottom: 'var(--space-3)' }}>
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-2)' }}>Thank you!</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>Your feedback has been submitted. We review every request.</p>
          <button className="btn btn--primary btn--sm" onClick={() => setSubmitted(false)}>Submit Another</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ padding: 'var(--space-3)', background: 'rgba(220,38,38,0.1)', color: '#ff6b6b', borderRadius: 8, marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
              {error}
            </div>
          )}
          <div className="form-group">
            <label className="form-label">What would you like to see?</label>
            <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Brief title for your request" maxLength={200} required />
          </div>
          <div className="form-group">
            <label className="form-label">Details (optional)</label>
            <textarea className="form-textarea" value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your idea, issue, or suggestion in more detail..." rows={5} maxLength={2000} />
          </div>
          <div className="form-group">
            <label className="form-label">Priority</label>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              {['low', 'medium', 'high'].map(p => (
                <button key={p} type="button" onClick={() => setPriority(p)}
                  style={{ padding: '6px 16px', borderRadius: 20, border: priority === p ? '2px solid var(--color-primary)' : '1px solid var(--color-border)', background: priority === p ? 'rgba(1,105,111,0.15)' : 'transparent', color: priority === p ? 'var(--color-primary)' : 'var(--color-text-muted)', cursor: 'pointer', fontSize: 'var(--text-sm)', textTransform: 'capitalize' }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className="btn btn--primary" disabled={submitting || !title.trim()} style={{ marginTop: 'var(--space-4)' }}>
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      )}
    </div>
  )
}
