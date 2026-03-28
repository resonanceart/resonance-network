'use client'

import { useState, useEffect, useCallback } from 'react'

interface BioEditorProps {
  profileSlug: string
  onClose: () => void
  onSave: () => void
}

export function BioEditor({ profileSlug, onClose, onSave }: BioEditorProps) {
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bio, setBio] = useState('')
  const [artistStatement, setArtistStatement] = useState('')
  const [philosophy, setPhilosophy] = useState('')

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
        setBio(data.profile?.bio || '')
        setArtistStatement(data.extendedProfile?.artist_statement || '')
        setPhilosophy(data.extendedProfile?.philosophy || '')
      } catch {
        setError('Failed to load current data.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio, artist_statement: artistStatement, philosophy }),
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
      <div className="inline-editor__card inline-editor__card--wide" onClick={(e) => e.stopPropagation()}>
        <button className="inline-editor__close" onClick={onClose}>&times;</button>
        <h3 className="inline-editor__title">Edit About</h3>
        {error && <div className="inline-editor__error">{error}</div>}
        {loading ? (
          <div className="inline-editor__body">
            <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
          </div>
        ) : (
          <>
            <div className="inline-editor__body">
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea
                  className="form-textarea"
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 3000))}
                  rows={6}
                  placeholder="Tell people about yourself..."
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {bio.length}/3000
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Artist Statement</label>
                <textarea
                  className="form-textarea"
                  value={artistStatement}
                  onChange={(e) => setArtistStatement(e.target.value.slice(0, 2000))}
                  rows={4}
                  placeholder="Your creative vision and practice..."
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {artistStatement.length}/2000
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Philosophy</label>
                <textarea
                  className="form-textarea"
                  value={philosophy}
                  onChange={(e) => setPhilosophy(e.target.value.slice(0, 500))}
                  rows={3}
                  placeholder="Your creative philosophy in a nutshell..."
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {philosophy.length}/500
                </span>
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
