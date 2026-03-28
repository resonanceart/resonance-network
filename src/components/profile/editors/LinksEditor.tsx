'use client'

import { useState, useEffect, useCallback } from 'react'

interface LinksEditorProps {
  profileSlug: string
  onClose: () => void
  onSave: () => void
}

interface SocialLink {
  platform: string
  url: string
}

const PLATFORMS = [
  'instagram',
  'linkedin',
  'behance',
  'artstation',
  'dribbble',
  'github',
  'vimeo',
  'soundcloud',
  'spotify',
  'youtube',
  'x',
  'tiktok',
]

export function LinksEditor({ profileSlug, onClose, onSave }: LinksEditorProps) {
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [links, setLinks] = useState<SocialLink[]>([])

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
        const res = await fetch(`/api/profiles/${profileSlug}/social-links`)
        if (!res.ok) throw new Error('Failed to load')
        const data = await res.json()
        setLinks(
          (data.social_links || []).map((l: Record<string, unknown>) => ({
            platform: String(l.platform || 'instagram'),
            url: String(l.url || ''),
          }))
        )
      } catch {
        setError('Failed to load social links.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [profileSlug])

  function handleAdd() {
    setLinks([...links, { platform: 'instagram', url: '' }])
  }

  function handleRemove(index: number) {
    setLinks(links.filter((_, i) => i !== index))
  }

  function handleChange(index: number, field: keyof SocialLink, value: string) {
    setLinks(links.map((l, i) => (i === index ? { ...l, [field]: value } : l)))
  }

  async function handleSave() {
    const validLinks = links.filter((l) => l.url.trim())
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/profiles/${profileSlug}/social-links`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ social_links: validLinks }),
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
        <h3 className="inline-editor__title">Edit Social Links</h3>
        {error && <div className="inline-editor__error">{error}</div>}
        {loading ? (
          <div className="inline-editor__body">
            <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
          </div>
        ) : (
          <>
            <div className="inline-editor__body">
              {links.map((link, i) => (
                <div key={i} className="inline-editor__link-row">
                  <select
                    className="form-select"
                    value={link.platform}
                    onChange={(e) => handleChange(i, 'platform', e.target.value)}
                    style={{ width: 140, flexShrink: 0 }}
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p} value={p}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </option>
                    ))}
                  </select>
                  <input
                    className="form-input"
                    type="url"
                    value={link.url}
                    onChange={(e) => handleChange(i, 'url', e.target.value)}
                    placeholder={`https://${link.platform}.com/...`}
                    style={{ flex: 1 }}
                  />
                  <button
                    className="inline-editor__link-remove"
                    onClick={() => handleRemove(i)}
                    aria-label="Remove link"
                  >
                    &times;
                  </button>
                </div>
              ))}

              {links.length < 20 && (
                <button className="btn btn--outline btn--sm" onClick={handleAdd}>
                  + Add Link
                </button>
              )}

              {links.length === 0 && (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                  No social links yet. Click &quot;+ Add Link&quot; to get started.
                </p>
              )}
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
