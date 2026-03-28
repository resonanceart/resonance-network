'use client'

import { useState, useEffect, useCallback } from 'react'

interface IdentityEditorProps {
  profileSlug: string
  onClose: () => void
  onSave: () => void
}

const PRONOUN_OPTIONS = [
  '',
  'he/him',
  'she/her',
  'they/them',
  'he/they',
  'she/they',
  'ze/zir',
  'any pronouns',
  'prefer not to say',
]

export function IdentityEditor({ profileSlug, onClose, onSave }: IdentityEditorProps) {
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [professionalTitle, setProfessionalTitle] = useState('')
  const [pronouns, setPronouns] = useState('')
  const [location, setLocation] = useState('')
  const [locationSecondary, setLocationSecondary] = useState('')

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
        setDisplayName(data.profile?.display_name || '')
        setProfessionalTitle(data.profile?.professional_title || data.extendedProfile?.professional_title || '')
        setPronouns(data.profile?.pronouns || data.extendedProfile?.pronouns || '')
        setLocation(data.profile?.location || '')
        setLocationSecondary(data.profile?.location_secondary || data.extendedProfile?.location_secondary || '')
      } catch {
        setError('Failed to load current data.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleSave() {
    if (!displayName.trim()) {
      setError('Display name is required.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: displayName,
          professional_title: professionalTitle,
          pronouns,
          location,
          location_secondary: locationSecondary,
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
        <h3 className="inline-editor__title">Edit Profile Info</h3>
        {error && <div className="inline-editor__error">{error}</div>}
        {loading ? (
          <div className="inline-editor__body">
            <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
          </div>
        ) : (
          <>
            <div className="inline-editor__body">
              <div className="form-group">
                <label className="form-label">Display Name</label>
                <input
                  className="form-input"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  maxLength={200}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Professional Title</label>
                <input
                  className="form-input"
                  type="text"
                  value={professionalTitle}
                  onChange={(e) => setProfessionalTitle(e.target.value)}
                  placeholder="e.g. Interactive Designer, Sound Artist"
                  maxLength={200}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Pronouns</label>
                <select
                  className="form-select"
                  value={pronouns}
                  onChange={(e) => setPronouns(e.target.value)}
                >
                  {PRONOUN_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p || '-- Select --'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  className="form-input"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, Country"
                  maxLength={200}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Secondary Location</label>
                <input
                  className="form-input"
                  type="text"
                  value={locationSecondary}
                  onChange={(e) => setLocationSecondary(e.target.value)}
                  placeholder="Another city you work from"
                  maxLength={200}
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
