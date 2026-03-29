'use client'

import { useState } from 'react'

export function FeatureRequestForm() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!title.trim() || title.trim().length < 3) {
      setError('Please enter a title (at least 3 characters).')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/feature-requests', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), description: description.trim(), priority }),
      })

      if (res.ok) {
        setMessage('Feature request submitted! We\'ll review it soon.')
        setTitle('')
        setDescription('')
        setPriority('medium')
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to submit. Please try again.')
      }
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="form-error" style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', borderRadius: '8px', background: 'rgba(220,38,38,0.08)' }}>
          {error}
        </div>
      )}

      {message && (
        <div className="settings-success">
          {message}
        </div>
      )}

      <div className="form-group">
        <label className="form-label" htmlFor="fr-title">Title *</label>
        <input
          id="fr-title"
          className="form-input"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Add dark mode toggle to gallery"
          maxLength={200}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="fr-description">Description</label>
        <textarea
          id="fr-description"
          className="form-textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the feature you'd like to see..."
          rows={4}
          maxLength={2000}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="fr-priority">Priority</label>
        <select
          id="fr-priority"
          className="form-input"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          style={{ width: 'auto', minWidth: 140 }}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <button type="submit" className="btn btn--primary btn--sm" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Request'}
      </button>
    </form>
  )
}
