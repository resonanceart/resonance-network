'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import ProfileEditorTabs from '@/components/dashboard/ProfileEditorTabs'
import MediaGalleryEditor from '@/components/dashboard/MediaGalleryEditor'
import ProjectEditor from '@/components/dashboard/ProjectEditor'
import TimelineEditor from '@/components/dashboard/TimelineEditor'
import LinksEditor from '@/components/dashboard/LinksEditor'
import AchievementsEditor from '@/components/dashboard/AchievementsEditor'
import type { UserProfile } from '@/types'

export default function ProfileEditPage() {
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [activeTab, setActiveTab] = useState('basic')

  // Basic tab fields
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [website, setWebsite] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Tab 1 new fields
  const [toolsAndMaterials, setToolsAndMaterials] = useState<string[]>([])
  const [toolInput, setToolInput] = useState('')
  const [availabilityStatus, setAvailabilityStatus] = useState<string>('open')
  const [availabilityNote, setAvailabilityNote] = useState('')

  // Tab 2 fields
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)
  const [mediaGallery, setMediaGallery] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const coverInputRef = useRef<HTMLInputElement>(null)

  // Tab 3 fields
  const [timeline, setTimeline] = useState<any[]>([])
  const [achievements, setAchievements] = useState<string[]>([])
  const [philosophy, setPhilosophy] = useState('')

  // Tab 4 fields
  const [links, setLinks] = useState<any[]>([])

  // Track unsaved changes per tab
  const [dirtyTabs, setDirtyTabs] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      window.location.href = '/login'
      return
    }

    fetch('/api/user/profile')
      .then(res => res.json())
      .then((data: { profile: UserProfile; extendedProfile?: Record<string, unknown> }) => {
        if (data.profile) {
          setDisplayName(data.profile.display_name || '')
          setBio(data.profile.bio || '')
          setLocation(data.profile.location || '')
          setWebsite(data.profile.website || '')
          setSkills(data.profile.skills || [])
          setAvatarUrl(data.profile.avatar_url || null)
        }
        const ext = data.extendedProfile
        if (ext) {
          setToolsAndMaterials((ext.tools_and_materials as string[]) || [])
          setAvailabilityStatus((ext.availability_status as string) || 'open')
          setAvailabilityNote((ext.availability_note as string) || '')
          setCoverImageUrl((ext.cover_image_url as string) || null)
          setMediaGallery((ext.media_gallery as unknown[]) || [])
          setProjects((ext.projects as unknown[]) || [])
          setTimeline((ext.timeline as unknown[]) || [])
          setAchievements((ext.achievements as string[]) || [])
          setPhilosophy((ext.philosophy as string) || '')
          setLinks((ext.links as unknown[]) || [])
        }
      })
      .catch(() => setMessage({ type: 'error', text: 'Failed to load profile.' }))
      .finally(() => setLoading(false))
  }, [user, authLoading])

  function markDirty(tab: string) {
    setDirtyTabs(prev => new Set(prev).add(tab))
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image must be under 5MB.' })
      return
    }
    const img = new window.Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const maxW = 400
      const ratio = Math.min(maxW / img.width, 1)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      setAvatarUrl(canvas.toDataURL('image/jpeg', 0.8))
      markDirty('basic')
    }
    img.src = URL.createObjectURL(file)
  }

  function handleCoverImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Cover image must be under 10MB.' })
      return
    }
    const img = new window.Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const maxW = 1600
      const ratio = Math.min(maxW / img.width, 1)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      setCoverImageUrl(canvas.toDataURL('image/jpeg', 0.85))
      markDirty('portfolio')
    }
    img.src = URL.createObjectURL(file)
  }

  function addSkill() {
    const trimmed = skillInput.trim()
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed])
      markDirty('basic')
    }
    setSkillInput('')
  }

  function removeSkill(skill: string) {
    setSkills(skills.filter(s => s !== skill))
    markDirty('basic')
  }

  function handleSkillKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addSkill()
    }
  }

  function addTool() {
    const trimmed = toolInput.trim()
    if (trimmed && !toolsAndMaterials.includes(trimmed)) {
      setToolsAndMaterials([...toolsAndMaterials, trimmed])
      markDirty('basic')
    }
    setToolInput('')
  }

  function removeTool(tool: string) {
    setToolsAndMaterials(toolsAndMaterials.filter(t => t !== tool))
    markDirty('basic')
  }

  function handleToolKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTool()
    }
  }

  async function saveTab(tab: string) {
    setSaving(true)
    setMessage(null)

    let payload: Record<string, unknown> = {}

    if (tab === 'basic') {
      if (!displayName.trim()) {
        setMessage({ type: 'error', text: 'Display name is required.' })
        setSaving(false)
        return
      }
      payload = {
        display_name: displayName.trim(),
        bio: bio.trim() || null,
        location: location.trim() || null,
        website: website.trim() || null,
        skills: skills.length > 0 ? skills : null,
        avatar_url: avatarUrl,
        tools_and_materials: toolsAndMaterials.length > 0 ? toolsAndMaterials : null,
        availability_status: availabilityStatus,
        availability_note: availabilityNote.trim() || null,
      }
    } else if (tab === 'portfolio') {
      payload = {
        cover_image_url: coverImageUrl,
        media_gallery: mediaGallery,
        projects: projects,
      }
    } else if (tab === 'cv') {
      payload = {
        timeline: timeline,
        achievements: achievements.length > 0 ? achievements : null,
        philosophy: philosophy.trim() || null,
      }
    } else if (tab === 'links') {
      payload = {
        links: links.length > 0 ? links : null,
      }
    }

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully.' })
        setDirtyTabs(prev => {
          const next = new Set(prev)
          next.delete(tab)
          return next
        })
      } else {
        const data = await res.json()
        setMessage({ type: 'error', text: data.message || data.error || 'Failed to update profile.' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)' }}>
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading profile...</p>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="container" style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-10)', maxWidth: '800px' }}>
      <Link href="/dashboard" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontSize: 'var(--text-sm)' }}>
        &larr; Back to Dashboard
      </Link>

      <h1 style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>Edit Profile</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>
        Update your public profile information.
      </p>

      {message && (
        <div
          style={{
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: '8px',
            marginBottom: 'var(--space-4)',
            background: message.type === 'success' ? 'var(--color-success-bg, rgba(20,184,166,0.1))' : 'var(--color-error-bg, rgba(239,68,68,0.1))',
            color: message.type === 'success' ? 'var(--color-accent)' : 'var(--color-error, #ef4444)',
            border: `1px solid ${message.type === 'success' ? 'var(--color-accent)' : 'var(--color-error, #ef4444)'}`,
          }}
        >
          {message.text}
        </div>
      )}

      <ProfileEditorTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ===== BASIC TAB ===== */}
      {activeTab === 'basic' && (
        <div>
          {/* Avatar */}
          <div className="form-group">
            <label className="form-label">Profile Photo</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar preview"
                  style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-border)' }}
                />
              ) : (
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    background: 'var(--color-surface)',
                    border: '2px dashed var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-text-muted)',
                    fontSize: '24px',
                  }}
                >
                  {displayName?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              <div>
                <button
                  type="button"
                  className="btn btn--outline"
                  style={{ fontSize: 'var(--text-sm)' }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload Photo
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => { setAvatarUrl(null); markDirty('basic') }}
                    style={{
                      marginLeft: 'var(--space-2)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-text-muted)',
                      cursor: 'pointer',
                      fontSize: 'var(--text-sm)',
                      textDecoration: 'underline',
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Display Name */}
          <div className="form-group">
            <label htmlFor="display-name" className="form-label">Display Name *</label>
            <input
              id="display-name"
              type="text"
              required
              value={displayName}
              onChange={e => { setDisplayName(e.target.value); markDirty('basic') }}
              placeholder="Your name"
              className="form-input"
              maxLength={200}
            />
          </div>

          {/* Bio */}
          <div className="form-group">
            <label htmlFor="bio" className="form-label">Bio</label>
            <textarea
              id="bio"
              value={bio}
              onChange={e => { if (e.target.value.length <= 1000) { setBio(e.target.value); markDirty('basic') } }}
              placeholder="Tell the community about yourself and your practice"
              rows={4}
              className="form-textarea"
            />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{bio.length}/1000</span>
          </div>

          {/* Location */}
          <div className="form-group">
            <label htmlFor="location" className="form-label">Location</label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={e => { setLocation(e.target.value); markDirty('basic') }}
              placeholder="City, region, or remote"
              className="form-input"
              maxLength={200}
            />
          </div>

          {/* Website */}
          <div className="form-group">
            <label htmlFor="website" className="form-label">Website</label>
            <input
              id="website"
              type="url"
              value={website}
              onChange={e => { setWebsite(e.target.value); markDirty('basic') }}
              placeholder="https://yourwebsite.com"
              className="form-input"
              maxLength={500}
            />
          </div>

          {/* Skills */}
          <div className="form-group">
            <label htmlFor="skills-input" className="form-label">Skills</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: skills.length > 0 ? 'var(--space-2)' : 0 }}>
              {skills.map(skill => (
                <span
                  key={skill}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    fontSize: 'var(--text-sm)',
                  }}
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--color-text-muted)',
                      padding: '0 2px',
                      fontSize: '14px',
                      lineHeight: 1,
                    }}
                    aria-label={`Remove ${skill}`}
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <input
                id="skills-input"
                type="text"
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                placeholder="Type a skill and press Enter"
                className="form-input"
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="btn btn--outline"
                onClick={addSkill}
                style={{ flexShrink: 0 }}
              >
                Add
              </button>
            </div>
          </div>

          {/* Tools & Materials */}
          <div className="form-group">
            <label htmlFor="tools-input" className="form-label">Tools &amp; Materials</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: toolsAndMaterials.length > 0 ? 'var(--space-2)' : 0 }}>
              {toolsAndMaterials.map(tool => (
                <span
                  key={tool}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    fontSize: 'var(--text-sm)',
                  }}
                >
                  {tool}
                  <button
                    type="button"
                    onClick={() => removeTool(tool)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--color-text-muted)',
                      padding: '0 2px',
                      fontSize: '14px',
                      lineHeight: 1,
                    }}
                    aria-label={`Remove ${tool}`}
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <input
                id="tools-input"
                type="text"
                value={toolInput}
                onChange={e => setToolInput(e.target.value)}
                onKeyDown={handleToolKeyDown}
                placeholder="Type a tool or material and press Enter"
                className="form-input"
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="btn btn--outline"
                onClick={addTool}
                style={{ flexShrink: 0 }}
              >
                Add
              </button>
            </div>
          </div>

          {/* Availability Status */}
          <div className="form-group">
            <label htmlFor="availability-status" className="form-label">Availability Status</label>
            <select
              id="availability-status"
              value={availabilityStatus}
              onChange={e => { setAvailabilityStatus(e.target.value); markDirty('basic') }}
              className="form-input"
            >
              <option value="open">Open</option>
              <option value="busy">Busy</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>

          {/* Availability Note */}
          <div className="form-group">
            <label htmlFor="availability-note" className="form-label">Availability Note</label>
            <input
              id="availability-note"
              type="text"
              value={availabilityNote}
              onChange={e => { setAvailabilityNote(e.target.value); markDirty('basic') }}
              placeholder="e.g. Available for commissions starting June"
              className="form-input"
              maxLength={300}
            />
          </div>

          {/* Save */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
            <button
              type="button"
              className="btn btn--primary"
              disabled={saving}
              onClick={() => saveTab('basic')}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link href="/dashboard" className="btn btn--outline">
              Cancel
            </Link>
            {dirtyTabs.has('basic') && <span className="unsaved-indicator" style={{ color: 'var(--color-warning, #f59e0b)', fontSize: 'var(--text-sm)', fontStyle: 'italic' }}>Unsaved changes</span>}
          </div>
        </div>
      )}

      {/* ===== PORTFOLIO TAB ===== */}
      {activeTab === 'portfolio' && (
        <div>
          {/* Cover Image */}
          <div className="form-group">
            <label className="form-label">Cover Image</label>
            <div style={{ marginBottom: 'var(--space-3)' }}>
              {coverImageUrl ? (
                <div style={{ position: 'relative' }}>
                  <img
                    src={coverImageUrl}
                    alt="Cover preview"
                    style={{
                      width: '100%',
                      maxHeight: 240,
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '2px solid var(--color-border)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => { setCoverImageUrl(null); markDirty('portfolio') }}
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      background: 'rgba(0,0,0,0.6)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px 10px',
                      cursor: 'pointer',
                      fontSize: 'var(--text-sm)',
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: 160,
                    borderRadius: '8px',
                    background: 'var(--color-surface)',
                    border: '2px dashed var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-text-muted)',
                    fontSize: 'var(--text-sm)',
                  }}
                >
                  No cover image
                </div>
              )}
            </div>
            <button
              type="button"
              className="btn btn--outline"
              style={{ fontSize: 'var(--text-sm)' }}
              onClick={() => coverInputRef.current?.click()}
            >
              Upload Cover Image
            </button>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverImageChange}
              style={{ display: 'none' }}
            />
          </div>

          {/* Media Gallery */}
          <div className="form-group">
            <label className="form-label">Media Gallery</label>
            <MediaGalleryEditor
              items={mediaGallery}
              onChange={items => { setMediaGallery(items); markDirty('portfolio') }}
            />
          </div>

          {/* Projects */}
          <div className="form-group">
            <label className="form-label">Projects</label>
            <ProjectEditor
              projects={projects}
              onChange={p => { setProjects(p); markDirty('portfolio') }}
            />
          </div>

          {/* Save */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
            <button
              type="button"
              className="btn btn--primary"
              disabled={saving}
              onClick={() => saveTab('portfolio')}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link href="/dashboard" className="btn btn--outline">
              Cancel
            </Link>
            {dirtyTabs.has('portfolio') && <span className="unsaved-indicator" style={{ color: 'var(--color-warning, #f59e0b)', fontSize: 'var(--text-sm)', fontStyle: 'italic' }}>Unsaved changes</span>}
          </div>
        </div>
      )}

      {/* ===== CV TAB ===== */}
      {activeTab === 'cv' && (
        <div>
          {/* Timeline */}
          <div className="form-group">
            <label className="form-label">Timeline</label>
            <TimelineEditor
              entries={timeline}
              onChange={t => { setTimeline(t); markDirty('cv') }}
            />
          </div>

          {/* Achievements */}
          <div className="form-group">
            <label className="form-label">Achievements</label>
            <AchievementsEditor
              achievements={achievements}
              onChange={a => { setAchievements(a); markDirty('cv') }}
            />
          </div>

          {/* Philosophy */}
          <div className="form-group">
            <label htmlFor="philosophy" className="form-label">Philosophy</label>
            <textarea
              id="philosophy"
              value={philosophy}
              onChange={e => { if (e.target.value.length <= 2000) { setPhilosophy(e.target.value); markDirty('cv') } }}
              placeholder="Describe your artistic philosophy, creative approach, or manifesto"
              rows={6}
              className="form-textarea"
            />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{philosophy.length}/2000</span>
          </div>

          {/* Save */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
            <button
              type="button"
              className="btn btn--primary"
              disabled={saving}
              onClick={() => saveTab('cv')}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link href="/dashboard" className="btn btn--outline">
              Cancel
            </Link>
            {dirtyTabs.has('cv') && <span className="unsaved-indicator" style={{ color: 'var(--color-warning, #f59e0b)', fontSize: 'var(--text-sm)', fontStyle: 'italic' }}>Unsaved changes</span>}
          </div>
        </div>
      )}

      {/* ===== LINKS TAB ===== */}
      {activeTab === 'links' && (
        <div>
          {/* Links */}
          <div className="form-group">
            <label className="form-label">Links</label>
            <LinksEditor
              links={links}
              onChange={l => { setLinks(l); markDirty('links') }}
            />
          </div>

          {/* Save */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
            <button
              type="button"
              className="btn btn--primary"
              disabled={saving}
              onClick={() => saveTab('links')}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link href="/dashboard" className="btn btn--outline">
              Cancel
            </Link>
            {dirtyTabs.has('links') && <span className="unsaved-indicator" style={{ color: 'var(--color-warning, #f59e0b)', fontSize: 'var(--text-sm)', fontStyle: 'italic' }}>Unsaved changes</span>}
          </div>
        </div>
      )}
    </div>
  )
}
