'use client'

import { useState, useEffect, useCallback } from 'react'

interface AvailabilityEditorProps {
  profileSlug: string
  onClose: () => void
  onSave: () => void
}

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open to opportunities' },
  { value: 'selective', label: 'Selectively available' },
  { value: 'focused', label: 'Focused on current work' },
]

const TYPE_OPTIONS = [
  'Freelance',
  'Full-time',
  'Contract',
  'Residency',
  'Mentorship',
  'Volunteer',
  'Commission',
]

export function AvailabilityEditor({ profileSlug, onClose, onSave }: AvailabilityEditorProps) {
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState('open')
  const [types, setTypes] = useState<string[]>([])
  const [note, setNote] = useState('')

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/user/profile')
        if (!res.ok) throw new Error('Failed to load')
        const data = await res.json()
        const ext = data.extendedProfile || {}
        setStatus(ext.availability_status || 'open')
        setTypes(Array.isArray(ext.availability_types) ? ext.availability_types : [])
        setNote(ext.availability_note || '')
      } catch {
        setError('Failed to load current data.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function toggleType(type: string) {
    setTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          availability_status: status,
          availability_types: types,
          availability_note: note,
        }),
      })
      if (!res.ok) throw new Error('Failed to save')
      onSave()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="inline-editor__overlay" onClick={onClose}>
      <div className="inline-editor__card" onClick={(e) => e.stopPropagation()}>
        <button className="inline-editor__close" onClick={onClose}>&times;</button>
        <h3 className="inline-editor__title">Edit Availability</h3>
        {error && <div className="inline-editor__error">{error}</div>}
        {loading ? (
          <div className="inline-editor__body">
            <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
          </div>
        ) : (
          <>
            <div className="inline-editor__body">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Available for</label>
                <div className="inline-editor__checkboxes">
                  {TYPE_OPTIONS.map((type) => (
                    <label key={type} className="inline-editor__checkbox-label">
                      <input
                        type="checkbox"
                        checked={types.includes(type)}
                        onChange={() => toggleType(type)}
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Note</label>
                <input
                  className="form-input"
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Available starting April 2026"
                  maxLength={500}
                />
              </div>
            </div>
            <div className="inline-editor__actions">
              <button className="btn btn--outline" onClick={onClose}>Cancel</button>
              <button className="btn btn--primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
