'use client'

import { useState, useEffect, useCallback } from 'react'

interface SkillsEditorProps {
  profileSlug: string
  onClose: () => void
  onSave: () => void
}

interface Skill {
  skill_name: string
  category: string
}

const CATEGORIES = [
  'design',
  'architecture',
  'fabrication',
  'sound',
  'technology',
  'production',
  'strategy',
  'community',
]

export function SkillsEditor({ profileSlug, onClose, onSave }: SkillsEditorProps) {
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [skills, setSkills] = useState<Skill[]>([])
  const [newSkill, setNewSkill] = useState('')
  const [newCategory, setNewCategory] = useState('design')

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
        const res = await fetch(`/api/profiles/${profileSlug}/skills`)
        if (!res.ok) throw new Error('Failed to load')
        const data = await res.json()
        setSkills(
          (data.skills || []).map((s: Record<string, unknown>) => ({
            skill_name: String(s.skill_name || ''),
            category: String(s.category || 'design'),
          }))
        )
      } catch {
        setError('Failed to load skills.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [profileSlug])

  function handleAdd() {
    const name = newSkill.trim()
    if (!name) return
    if (skills.some((s) => s.skill_name.toLowerCase() === name.toLowerCase())) {
      setError('Skill already added.')
      return
    }
    setError(null)
    setSkills([...skills, { skill_name: name, category: newCategory }])
    setNewSkill('')
  }

  function handleRemove(index: number) {
    setSkills(skills.filter((_, i) => i !== index))
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/profiles/${profileSlug}/skills`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills }),
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
        <h3 className="inline-editor__title">Edit Skills</h3>
        {error && <div className="inline-editor__error">{error}</div>}
        {loading ? (
          <div className="inline-editor__body">
            <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
          </div>
        ) : (
          <>
            <div className="inline-editor__body">
              {skills.length > 0 && (
                <div className="inline-editor__tags">
                  {skills.map((skill, i) => (
                    <span key={i} className="inline-editor__tag">
                      <span className="inline-editor__tag-text">
                        {skill.skill_name}
                        <span style={{ fontSize: '0.7rem', opacity: 0.6, marginLeft: 4 }}>
                          ({skill.category})
                        </span>
                      </span>
                      <button
                        className="inline-editor__tag-remove"
                        onClick={() => handleRemove(i)}
                        aria-label={`Remove ${skill.skill_name}`}
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="form-group" style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Skill</label>
                  <input
                    className="form-input"
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="e.g. Projection Mapping"
                    maxLength={100}
                  />
                </div>
                <div>
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <button className="btn btn--outline btn--sm" onClick={handleAdd} style={{ whiteSpace: 'nowrap' }}>
                  Add
                </button>
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
