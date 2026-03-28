'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import BlockEditor from '@/components/dashboard/BlockEditor'
import ProfileSettingsPanel from '@/components/dashboard/ProfileSettingsPanel'
import type { UserProfile, ContentBlock } from '@/types'

function generateBlocksFromLegacy(
  ext: Record<string, unknown>,
  profile: { bio?: string | null; skills?: string[] | null }
): ContentBlock[] {
  const blocks: ContentBlock[] = []
  let order = 0

  function makeId() {
    return crypto.randomUUID?.() ?? Math.random().toString(36).substr(2, 9)
  }

  // Bio -> text block
  if (profile.bio) {
    blocks.push({ id: makeId(), type: 'text', order: order++, visible: true, label: 'About', content: { markdown: profile.bio } })
  }

  // Skills -> skills block
  if (profile.skills && profile.skills.length > 0) {
    blocks.push({ id: makeId(), type: 'skills', order: order++, visible: true, label: 'Specialties', content: { tags: profile.skills, variant: 'specialties' } })
  }

  // Tools & Materials -> skills block
  const tools = ext.tools_and_materials as string[] | undefined
  if (tools && tools.length > 0) {
    blocks.push({ id: makeId(), type: 'skills', order: order++, visible: true, label: 'Tools & Materials', content: { tags: tools, variant: 'tools' } })
  }

  // Media gallery -> gallery block
  const gallery = ext.media_gallery as unknown[] | undefined
  if (gallery && gallery.length > 0) {
    blocks.push({ id: makeId(), type: 'gallery', order: order++, visible: true, label: 'Gallery', content: { images: gallery, columns: 3, layout: 'grid' } })
  }

  // Projects -> project blocks
  const projects = ext.projects as Array<Record<string, unknown>> | undefined
  if (projects && projects.length > 0) {
    for (const p of projects) {
      blocks.push({ id: makeId(), type: 'project', order: order++, visible: true, content: p })
    }
  }

  // Timeline -> timeline block
  const timeline = ext.timeline as unknown[] | undefined
  if (timeline && timeline.length > 0) {
    blocks.push({ id: makeId(), type: 'timeline', order: order++, visible: true, label: 'Timeline', content: { entries: timeline } })
  }

  // Philosophy -> text block
  const philosophy = ext.philosophy as string | undefined
  if (philosophy) {
    blocks.push({ id: makeId(), type: 'text', order: order++, visible: true, label: 'Approach', content: { markdown: philosophy } })
  }

  // Links -> links block
  const links = ext.links as unknown[] | undefined
  if (links && links.length > 0) {
    blocks.push({ id: makeId(), type: 'links', order: order++, visible: true, label: 'Links', content: { links } })
  }

  // Achievements -> text block with bullets
  const achievements = ext.achievements as string[] | undefined
  if (achievements && achievements.length > 0) {
    const md = achievements.map(a => `- ${a}`).join('\n')
    blocks.push({ id: makeId(), type: 'text', order: order++, visible: true, label: 'Achievements', content: { markdown: md } })
  }

  return blocks
}

export default function ProfileEditPage() {
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Header form fields
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [website, setWebsite] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [toolsAndMaterials, setToolsAndMaterials] = useState<string[]>([])
  const [toolInput, setToolInput] = useState('')
  const [availabilityStatus, setAvailabilityStatus] = useState<string>('open')
  const [availabilityNote, setAvailabilityNote] = useState('')

  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  // Profile visibility
  const [profileVisibility, setProfileVisibility] = useState<string>('draft')

  // New extended profile fields
  const [professionalTitle, setProfessionalTitle] = useState('')
  const [pronouns, setPronouns] = useState('')
  const [locationSecondary, setLocationSecondary] = useState('')
  const [availabilityTypes, setAvailabilityTypes] = useState<string[]>([])
  const [ctaPrimaryLabel, setCtaPrimaryLabel] = useState('')
  const [ctaPrimaryAction, setCtaPrimaryAction] = useState('contact')
  const [ctaPrimaryUrl, setCtaPrimaryUrl] = useState('')
  const [ctaSecondaryLabel, setCtaSecondaryLabel] = useState('')
  const [ctaSecondaryAction, setCtaSecondaryAction] = useState('url')
  const [ctaSecondaryUrl, setCtaSecondaryUrl] = useState('')
  const [socialLinks, setSocialLinks] = useState<Array<{id: string; platform: string; url: string; display_order: number}>>([])
  const [sectionOrder, setSectionOrder] = useState<string[]>(['skills', 'tools', 'portfolio', 'gallery', 'about', 'timeline', 'projects', 'achievements', 'links'])
  const [sectionVisibility, setSectionVisibility] = useState<Record<string, boolean>>({})
  const [bioExcerpt, setBioExcerpt] = useState('')

  // Settings panel
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Enhanced skills/tools
  const [profileSkills, setProfileSkills] = useState<Array<{id: string; skill_name: string; category: string; display_order: number}>>([])
  const [profileTools, setProfileTools] = useState<Array<{id: string; tool_name: string; category: string; display_order: number}>>([])
  const [newSkillName, setNewSkillName] = useState('')
  const [newSkillCategory, setNewSkillCategory] = useState('design')
  const [newToolName, setNewToolName] = useState('')
  const [newToolCategory, setNewToolCategory] = useState('software')

  // Content blocks
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([])
  const [blocksDirty, setBlocksDirty] = useState(false)
  const [blocksSaving, setBlocksSaving] = useState(false)

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
          setProfileVisibility(data.profile.profile_visibility || 'draft')
        }
        const ext = data.extendedProfile
        if (ext) {
          setToolsAndMaterials((ext.tools_and_materials as string[]) || [])
          setAvailabilityStatus((ext.availability_status as string) || 'open')
          setAvailabilityNote((ext.availability_note as string) || '')
          setCoverImageUrl((ext.cover_image_url as string) || null)
          setProfessionalTitle((ext.professional_title as string) || '')
          setPronouns((ext.pronouns as string) || '')
          setLocationSecondary((ext.location_secondary as string) || '')
          setAvailabilityTypes((ext.availability_types as string[]) || [])
          setCtaPrimaryLabel((ext.cta_primary_label as string) || '')
          setCtaPrimaryAction((ext.cta_primary_action as string) || 'contact')
          setCtaPrimaryUrl((ext.cta_primary_url as string) || '')
          setCtaSecondaryLabel((ext.cta_secondary_label as string) || '')
          setCtaSecondaryAction((ext.cta_secondary_action as string) || 'url')
          setCtaSecondaryUrl((ext.cta_secondary_url as string) || '')
          setSocialLinks((ext.social_links as Array<{id: string; platform: string; url: string; display_order: number}>) || [])
          setSectionOrder((ext.section_order as string[]) || ['skills', 'tools', 'portfolio', 'gallery', 'about', 'timeline', 'projects', 'achievements', 'links'])
          setSectionVisibility((ext.section_visibility as Record<string, boolean>) || {})
          setBioExcerpt((ext.bio_excerpt as string) || '')
          setProfileSkills((ext.profile_skills as Array<{id: string; skill_name: string; category: string; display_order: number}>) || [])
          setProfileTools((ext.profile_tools as Array<{id: string; tool_name: string; category: string; display_order: number}>) || [])
        }

        // Load content blocks or migrate from legacy data
        const loadedBlocks = (ext?.content_blocks as ContentBlock[]) || []
        if (loadedBlocks.length === 0 && ext) {
          const generated = generateBlocksFromLegacy(ext, { bio: data.profile?.bio, skills: data.profile?.skills })
          if (generated.length > 0) {
            setContentBlocks(generated)
            setBlocksDirty(true)
          }
        } else {
          setContentBlocks(loadedBlocks)
        }
      })
      .catch(() => setMessage({ type: 'error', text: 'Failed to load profile.' }))
      .finally(() => setLoading(false))
  }, [user, authLoading])

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
    }
    img.src = URL.createObjectURL(file)
  }

  function addSkill() {
    const trimmed = skillInput.trim()
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed])
    }
    setSkillInput('')
  }

  function removeSkill(skill: string) {
    setSkills(skills.filter(s => s !== skill))
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
    }
    setToolInput('')
  }

  function removeTool(tool: string) {
    setToolsAndMaterials(toolsAndMaterials.filter(t => t !== tool))
  }

  function handleToolKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTool()
    }
  }

  const canSubmitForReview = !!(displayName && bio && avatarUrl)

  async function handleSubmitForReview() {
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_visibility: 'pending' }),
      })
      if (res.ok) {
        setProfileVisibility('pending')
        setMessage({ type: 'success', text: 'Profile submitted for review!' })
      } else {
        const data = await res.json()
        setMessage({ type: 'error', text: data.message || 'Failed to submit for review.' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  function slugifyName(text: string) {
    return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  async function saveProfile() {
    setSaving(true)
    setMessage(null)
    if (!displayName.trim()) {
      setMessage({ type: 'error', text: 'Display name is required.' })
      setSaving(false)
      return
    }
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: displayName.trim(),
          bio: bio.trim() || null,
          location: location.trim() || null,
          website: website.trim() || null,
          skills: skills.length > 0 ? skills : null,
          avatar_url: avatarUrl,
          tools_and_materials: toolsAndMaterials.length > 0 ? toolsAndMaterials : null,
          availability_status: availabilityStatus,
          availability_note: availabilityNote.trim() || null,
          cover_image_url: coverImageUrl,
          professional_title: professionalTitle.trim() || null,
          pronouns: pronouns.trim() || null,
          location_secondary: locationSecondary.trim() || null,
          availability_types: availabilityTypes,
          cta_primary_label: ctaPrimaryLabel.trim() || null,
          cta_primary_action: ctaPrimaryAction,
          cta_primary_url: ctaPrimaryUrl.trim() || null,
          cta_secondary_label: ctaSecondaryLabel.trim() || null,
          cta_secondary_action: ctaSecondaryAction,
          cta_secondary_url: ctaSecondaryUrl.trim() || null,
          social_links: socialLinks,
          section_order: sectionOrder,
          section_visibility: sectionVisibility,
          bio_excerpt: bioExcerpt.trim() || null,
          profile_skills: profileSkills,
          profile_tools: profileTools,
        }),
      })
      if (res.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully.' })
      } else {
        const data = await res.json()
        setMessage({ type: 'error', text: data.error || 'Failed to update profile.' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  async function saveBlocks() {
    setBlocksSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_blocks: contentBlocks }),
      })
      if (res.ok) {
        setMessage({ type: 'success', text: 'Content blocks saved.' })
        setBlocksDirty(false)
      } else {
        const data = await res.json()
        setMessage({ type: 'error', text: data.error || 'Failed to save blocks.' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setBlocksSaving(false)
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

      {/* Profile Status Banner */}
      <div className="profile-status-banner">
        {profileVisibility === 'draft' && (
          <>
            <span className="profile-status-badge profile-status-badge--draft">Draft</span>
            <p style={{ margin: 0, fontSize: 'var(--text-sm)' }}>Your profile is only visible to you.</p>
            {canSubmitForReview ? (
              <button className="btn btn--primary btn--sm" onClick={handleSubmitForReview} disabled={saving}>
                Submit Profile for Review
              </button>
            ) : (
              <p className="text-muted" style={{ margin: 0, fontSize: 'var(--text-xs)' }}>Complete your name, bio, and avatar to submit for review.</p>
            )}
          </>
        )}
        {profileVisibility === 'pending' && (
          <>
            <span className="profile-status-badge profile-status-badge--pending">Pending Review</span>
            <p style={{ margin: 0, fontSize: 'var(--text-sm)' }}>Your profile is being reviewed by our team. You&apos;ll be notified when it&apos;s approved.</p>
          </>
        )}
        {profileVisibility === 'published' && (
          <>
            <span className="profile-status-badge profile-status-badge--published">Published</span>
            <p style={{ margin: 0, fontSize: 'var(--text-sm)' }}>Your profile is live on the network. <a href={`/profiles/${slugifyName(displayName)}`} style={{ color: 'var(--color-accent)' }}>View your public profile &rarr;</a></p>
          </>
        )}
      </div>

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

      {/* ===== HEADER FORM ===== */}
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
                  onClick={() => setAvatarUrl(null)}
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
            onChange={e => setDisplayName(e.target.value)}
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
            onChange={e => { if (e.target.value.length <= 1000) setBio(e.target.value) }}
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
            onChange={e => setLocation(e.target.value)}
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
            onChange={e => setWebsite(e.target.value)}
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

        {/* Enhanced Skills Editor */}
        <div className="skill-tool-editor">
          <h3>Enhanced Skills</h3>
          <p className="skill-tool-editor__desc">
            Add categorized skills to your profile for better discoverability.
          </p>
          {profileSkills.length > 0 && (
            <div className="skill-tool-editor__list">
              {profileSkills.map(skill => (
                <span key={skill.id} className="skill-tool-editor__item">
                  {skill.skill_name}
                  <span className="skill-tool-editor__item-category">{skill.category}</span>
                  <button
                    type="button"
                    className="skill-tool-editor__item-remove"
                    onClick={() => setProfileSkills(prev => prev.filter(s => s.id !== skill.id))}
                    aria-label={`Remove ${skill.skill_name}`}
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="skill-tool-editor__add-row">
            <input
              type="text"
              className="form-input"
              value={newSkillName}
              onChange={e => setNewSkillName(e.target.value)}
              placeholder="Skill name"
              maxLength={100}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  if (newSkillName.trim()) {
                    setProfileSkills(prev => [...prev, {
                      id: crypto.randomUUID?.() ?? Math.random().toString(36).substr(2, 9),
                      skill_name: newSkillName.trim(),
                      category: newSkillCategory,
                      display_order: prev.length,
                    }])
                    setNewSkillName('')
                  }
                }
              }}
            />
            <select
              className="form-input"
              value={newSkillCategory}
              onChange={e => setNewSkillCategory(e.target.value)}
              style={{ width: '160px', flexShrink: 0 }}
            >
              <option value="design">Design</option>
              <option value="architecture">Architecture</option>
              <option value="fabrication">Fabrication</option>
              <option value="sound">Sound</option>
              <option value="technology">Technology</option>
              <option value="production">Production</option>
              <option value="strategy">Strategy</option>
              <option value="community">Community</option>
            </select>
            <button
              type="button"
              className="btn btn--outline"
              style={{ flexShrink: 0 }}
              onClick={() => {
                if (newSkillName.trim()) {
                  setProfileSkills(prev => [...prev, {
                    id: crypto.randomUUID?.() ?? Math.random().toString(36).substr(2, 9),
                    skill_name: newSkillName.trim(),
                    category: newSkillCategory,
                    display_order: prev.length,
                  }])
                  setNewSkillName('')
                }
              }}
            >
              Add
            </button>
          </div>
        </div>

        {/* Enhanced Tools Editor */}
        <div className="skill-tool-editor">
          <h3>Enhanced Tools</h3>
          <p className="skill-tool-editor__desc">
            Add categorized tools and technologies to your profile.
          </p>
          {profileTools.length > 0 && (
            <div className="skill-tool-editor__list">
              {profileTools.map(tool => (
                <span key={tool.id} className="skill-tool-editor__item">
                  {tool.tool_name}
                  <span className="skill-tool-editor__item-category">{tool.category}</span>
                  <button
                    type="button"
                    className="skill-tool-editor__item-remove"
                    onClick={() => setProfileTools(prev => prev.filter(t => t.id !== tool.id))}
                    aria-label={`Remove ${tool.tool_name}`}
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="skill-tool-editor__add-row">
            <input
              type="text"
              className="form-input"
              value={newToolName}
              onChange={e => setNewToolName(e.target.value)}
              placeholder="Tool name"
              maxLength={100}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  if (newToolName.trim()) {
                    setProfileTools(prev => [...prev, {
                      id: crypto.randomUUID?.() ?? Math.random().toString(36).substr(2, 9),
                      tool_name: newToolName.trim(),
                      category: newToolCategory,
                      display_order: prev.length,
                    }])
                    setNewToolName('')
                  }
                }
              }}
            />
            <select
              className="form-input"
              value={newToolCategory}
              onChange={e => setNewToolCategory(e.target.value)}
              style={{ width: '160px', flexShrink: 0 }}
            >
              <option value="software">Software</option>
              <option value="hardware">Hardware</option>
              <option value="materials">Materials</option>
              <option value="processes">Processes</option>
            </select>
            <button
              type="button"
              className="btn btn--outline"
              style={{ flexShrink: 0 }}
              onClick={() => {
                if (newToolName.trim()) {
                  setProfileTools(prev => [...prev, {
                    id: crypto.randomUUID?.() ?? Math.random().toString(36).substr(2, 9),
                    tool_name: newToolName.trim(),
                    category: newToolCategory,
                    display_order: prev.length,
                  }])
                  setNewToolName('')
                }
              }}
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
            onChange={e => setAvailabilityStatus(e.target.value)}
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
            onChange={e => setAvailabilityNote(e.target.value)}
            placeholder="e.g. Available for commissions starting June"
            className="form-input"
            maxLength={300}
          />
        </div>

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
                  onClick={() => setCoverImageUrl(null)}
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

        {/* Save Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
          <button
            type="button"
            className="btn btn--primary"
            disabled={saving}
            onClick={saveProfile}
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
          <button
            type="button"
            className="btn btn--outline"
            onClick={() => setSettingsOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Settings
          </button>
          <Link href="/dashboard" className="btn btn--outline">
            Cancel
          </Link>
        </div>
      </div>

      {/* Divider */}
      <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 'var(--space-8) 0' }} />

      {/* Content Blocks */}
      <div>
        <h2 style={{ marginBottom: 'var(--space-2)' }}>Profile Content</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
          Arrange and customize the sections that appear on your public profile.
        </p>

        <BlockEditor
          blocks={contentBlocks}
          onChange={blocks => { setContentBlocks(blocks); setBlocksDirty(true) }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
          <button
            type="button"
            className="btn btn--primary"
            disabled={blocksSaving || !blocksDirty}
            onClick={saveBlocks}
          >
            {blocksSaving ? 'Saving...' : 'Save Content'}
          </button>
          {blocksDirty && (
            <span style={{ color: 'var(--color-warning, #f59e0b)', fontSize: 'var(--text-sm)', fontStyle: 'italic' }}>
              Unsaved changes
            </span>
          )}
        </div>
      </div>

      {/* Profile Settings Panel */}
      <ProfileSettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        profileSlug={slugifyName(displayName)}
        initialData={{
          displayName,
          title: professionalTitle,
          pronouns,
          location,
          locationSecondary,
          availabilityStatus,
          availabilityNote,
          availabilityTypes,
          ctaPrimaryLabel,
          ctaPrimaryAction,
          ctaPrimaryUrl,
          ctaSecondaryLabel,
          ctaSecondaryAction,
          ctaSecondaryUrl,
          socialLinks,
          sectionOrder,
          sectionVisibility,
          slug: slugifyName(displayName),
          bioExcerpt,
        }}
        onSave={(data) => {
          setDisplayName((data.displayName as string) || displayName)
          setProfessionalTitle((data.title as string) || '')
          setPronouns((data.pronouns as string) || '')
          setLocation((data.location as string) || '')
          setLocationSecondary((data.locationSecondary as string) || '')
          setAvailabilityStatus((data.availabilityStatus as string) || 'open')
          setAvailabilityNote((data.availabilityNote as string) || '')
          setAvailabilityTypes((data.availabilityTypes as string[]) || [])
          setCtaPrimaryLabel((data.ctaPrimaryLabel as string) || '')
          setCtaPrimaryAction((data.ctaPrimaryAction as string) || 'contact')
          setCtaPrimaryUrl((data.ctaPrimaryUrl as string) || '')
          setCtaSecondaryLabel((data.ctaSecondaryLabel as string) || '')
          setCtaSecondaryAction((data.ctaSecondaryAction as string) || 'url')
          setCtaSecondaryUrl((data.ctaSecondaryUrl as string) || '')
          setSocialLinks((data.socialLinks as Array<{id: string; platform: string; url: string; display_order: number}>) || [])
          setSectionOrder((data.sectionOrder as string[]) || sectionOrder)
          setSectionVisibility((data.sectionVisibility as Record<string, boolean>) || {})
          setBioExcerpt((data.bioExcerpt as string) || '')
          // Trigger save after updating state
          setTimeout(() => saveProfile(), 100)
          setSettingsOpen(false)
        }}
      />
    </div>
  )
}
