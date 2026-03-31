'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import BlockEditor from '@/components/dashboard/BlockEditor'
import ProfileSettingsPanel from '@/components/dashboard/ProfileSettingsPanel'
import { AvatarCropModal } from '@/components/dashboard/AvatarCropModal'
import { CoverImageEditor } from '@/components/dashboard/CoverImageEditor'
import { AvailabilityModal } from '@/components/dashboard/AvailabilityModal'
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

  if (profile.bio) {
    blocks.push({ id: makeId(), type: 'text', order: order++, visible: true, label: 'About', content: { markdown: profile.bio } })
  }
  if (profile.skills && profile.skills.length > 0) {
    blocks.push({ id: makeId(), type: 'skills', order: order++, visible: true, label: 'Specialties', content: { tags: profile.skills, variant: 'specialties' } })
  }
  const tools = ext.tools_and_materials as string[] | undefined
  if (tools && tools.length > 0) {
    blocks.push({ id: makeId(), type: 'skills', order: order++, visible: true, label: 'Tools & Materials', content: { tags: tools, variant: 'tools' } })
  }
  const gallery = ext.media_gallery as unknown[] | undefined
  if (gallery && gallery.length > 0) {
    blocks.push({ id: makeId(), type: 'gallery', order: order++, visible: true, label: 'Gallery', content: { images: gallery, columns: 3, layout: 'grid' } })
  }
  const projects = ext.projects as Array<Record<string, unknown>> | undefined
  if (projects && projects.length > 0) {
    for (const p of projects) {
      blocks.push({ id: makeId(), type: 'project', order: order++, visible: true, content: p })
    }
  }
  const timeline = ext.timeline as unknown[] | undefined
  if (timeline && timeline.length > 0) {
    blocks.push({ id: makeId(), type: 'timeline', order: order++, visible: true, label: 'Timeline', content: { entries: timeline } })
  }
  const philosophy = ext.philosophy as string | undefined
  if (philosophy) {
    blocks.push({ id: makeId(), type: 'text', order: order++, visible: true, label: 'Approach', content: { markdown: philosophy } })
  }
  const links = ext.links as unknown[] | undefined
  if (links && links.length > 0) {
    blocks.push({ id: makeId(), type: 'links', order: order++, visible: true, label: 'Links', content: { links } })
  }
  const achievements = ext.achievements as string[] | undefined
  if (achievements && achievements.length > 0) {
    const md = achievements.map(a => `- ${a}`).join('\n')
    blocks.push({ id: makeId(), type: 'text', order: order++, visible: true, label: 'Achievements', content: { markdown: md } })
  }

  return blocks
}

const EDITOR_SECTIONS = [
  { key: 'basic', label: 'Basic Information', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { key: 'skills', label: 'Skills & Tools', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
  { key: 'about', label: 'About Me', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
  { key: 'social', label: 'On The Web', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg> },
  { key: 'links', label: 'Links', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg> },
]

export default function ProfileEditPage() {
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Sidebar nav
  const [activeSection, setActiveSection] = useState('basic')

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

  const [profileVisibility, setProfileVisibility] = useState<string>('draft')

  // Extended profile fields
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

  // Avatar crop modal
  const [avatarCropSrc, setAvatarCropSrc] = useState<string | null>(null)

  // Availability modal
  const [availabilityModalOpen, setAvailabilityModalOpen] = useState(false)

  // Artist statement / philosophy
  const [artistStatement, setArtistStatement] = useState('')
  const [philosophy, setPhilosophy] = useState('')

  // Cover position
  const [coverPosition, setCoverPosition] = useState<{x: number; y: number; scale: number}>({x: 50, y: 50, scale: 1})

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      window.location.href = '/login'
      return
    }

    fetch('/api/user/profile')
      .then(res => res.json())
      .then((data: { profile: UserProfile; extendedProfile?: Record<string, unknown>; profileSkills?: Array<{id: string; skill_name: string; category: string; display_order: number}>; profileTools?: Array<{id: string; tool_name: string; category: string; display_order: number}>; socialLinks?: Array<{id: string; platform: string; url: string; display_order: number}> }) => {
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
          setSectionOrder((ext.section_order as string[]) || ['skills', 'tools', 'portfolio', 'gallery', 'about', 'timeline', 'projects', 'achievements', 'links'])
          setSectionVisibility((ext.section_visibility as Record<string, boolean>) || {})
          setBioExcerpt((ext.bio_excerpt as string) || '')
          setArtistStatement((ext.artist_statement as string) || '')
          setPhilosophy((ext.philosophy as string) || '')
          if (ext.cover_position) setCoverPosition(ext.cover_position as {x: number; y: number; scale: number})
        }

        // Load related table data from top-level API response
        if (data.profileSkills) setProfileSkills(data.profileSkills)
        if (data.profileTools) setProfileTools(data.profileTools)
        if (data.socialLinks) setSocialLinks(data.socialLinks)
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
    const reader = new FileReader()
    reader.onload = () => {
      setAvatarCropSrc(reader.result as string)
    }
    reader.readAsDataURL(file)
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
    if (trimmed && !skills.includes(trimmed)) setSkills([...skills, trimmed])
    setSkillInput('')
  }
  function removeSkill(skill: string) { setSkills(skills.filter(s => s !== skill)) }
  function handleSkillKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill() }
  }
  function addTool() {
    const trimmed = toolInput.trim()
    if (trimmed && !toolsAndMaterials.includes(trimmed)) setToolsAndMaterials([...toolsAndMaterials, trimmed])
    setToolInput('')
  }
  function removeTool(tool: string) { setToolsAndMaterials(toolsAndMaterials.filter(t => t !== tool)) }
  function handleToolKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTool() }
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
          cover_position: coverPosition,
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
          artist_statement: artistStatement.trim() || null,
          philosophy: philosophy.trim() || null,
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

  // --- Tag rendering helper ---
  function renderTagList(items: string[], onRemove: (item: string) => void) {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: items.length > 0 ? 'var(--space-2)' : 0 }}>
        {items.map(item => (
          <span key={item} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '999px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', fontSize: 'var(--text-sm)' }}>
            {item}
            <button type="button" onClick={() => onRemove(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '0 2px', fontSize: '14px', lineHeight: 1 }} aria-label={`Remove ${item}`}>&times;</button>
          </span>
        ))}
      </div>
    )
  }

  // --- Section renderers ---
  function renderBasicInfo() {
    return (
      <div className="profile-editor-section">
        <h2 className="profile-editor-section__title">Basic Information</h2>
        <p className="profile-editor-section__desc">Your public identity on Resonance Network.</p>
        <div className="profile-editor-section__body">
          {/* Avatar */}
          <div className="form-group">
            <label className="form-label">Profile Photo</label>
            <div className="profile-editor-avatar">
              {avatarUrl ? (
                <div className="profile-editor-avatar__preview" onClick={() => fileInputRef.current?.click()}>
                  <img src={avatarUrl} alt="Avatar" />
                </div>
              ) : (
                <div className="profile-editor-avatar__placeholder" onClick={() => fileInputRef.current?.click()}>
                  {displayName?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              <div className="profile-editor-avatar__actions">
                <button type="button" className="btn btn--outline btn--sm" onClick={() => fileInputRef.current?.click()}>
                  {avatarUrl ? 'Change Photo' : 'Upload Photo'}
                </button>
                {avatarUrl && (
                  <button type="button" onClick={() => setAvatarUrl(null)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 'var(--text-sm)', textDecoration: 'underline', textAlign: 'left' }}>Remove</button>
                )}
                <span className="profile-editor-avatar__hint">JPG or PNG, max 5MB</span>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
            </div>
          </div>

          {/* Cover Image */}
          <div className="form-group">
            <label className="form-label">Cover Image</label>
            <CoverImageEditor
              coverUrl={coverImageUrl}
              coverPosition={coverPosition}
              onSave={(url, pos) => { setCoverImageUrl(url); setCoverPosition(pos) }}
              onUpload={(file) => {
                const input = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>
                handleCoverImageChange(input)
              }}
            />
            <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverImageChange} style={{ display: 'none' }} />
          </div>

          {/* Display Name */}
          <div className="form-group">
            <label htmlFor="display-name" className="form-label">Display Name *</label>
            <input id="display-name" type="text" required value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" className="form-input" maxLength={200} />
          </div>

          {/* Professional Title */}
          <div className="form-group">
            <label htmlFor="pro-title" className="form-label">Professional Title</label>
            <input id="pro-title" type="text" value={professionalTitle} onChange={e => setProfessionalTitle(e.target.value)} placeholder="e.g. Interactive Artist & Creative Technologist" className="form-input" maxLength={200} />
          </div>

          {/* Pronouns */}
          <div className="form-group">
            <label htmlFor="pronouns" className="form-label">Pronouns</label>
            <select id="pronouns" value={pronouns} onChange={e => setPronouns(e.target.value)} className="form-input">
              <option value="">Select...</option>
              <option value="he/him">he/him</option>
              <option value="she/her">she/her</option>
              <option value="they/them">they/them</option>
              <option value="he/they">he/they</option>
              <option value="she/they">she/they</option>
              <option value="any pronouns">any pronouns</option>
            </select>
          </div>

          {/* Location */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div className="form-group">
              <label htmlFor="location" className="form-label">Location</label>
              <input id="location" type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="City, region" className="form-input" maxLength={200} />
            </div>
            <div className="form-group">
              <label htmlFor="location-2" className="form-label">Secondary Location</label>
              <input id="location-2" type="text" value={locationSecondary} onChange={e => setLocationSecondary(e.target.value)} placeholder="Second city or remote" className="form-input" maxLength={200} />
            </div>
          </div>

          {/* Website */}
          <div className="form-group">
            <label htmlFor="website" className="form-label">Website</label>
            <input id="website" type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://yourwebsite.com" className="form-input" maxLength={500} />
          </div>

          {/* Availability */}
          <div className="form-group">
            <label className="form-label">Availability</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>
                {availabilityStatus || 'Not set'}
                {availabilityTypes.length > 0 && ` — ${availabilityTypes.join(', ')}`}
              </span>
              <button type="button" className="btn btn--outline btn--sm" onClick={() => setAvailabilityModalOpen(true)}>
                Edit Availability
              </button>
            </div>
          </div>
        </div>
        <div className="profile-editor-section__footer">
          <button type="button" className="btn btn--primary" disabled={saving} onClick={saveProfile}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    )
  }

  function renderWorkExperience() {
    return (
      <div className="profile-editor-section">
        <h2 className="profile-editor-section__title">Work Experience</h2>
        <p className="profile-editor-section__desc">Exhibitions, education, awards, residencies, and career milestones.</p>
        <div className="profile-editor-section__body">
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
            Timeline entries can be managed in the <button type="button" onClick={() => setActiveSection('blocks')} style={{ color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', font: 'inherit' }}>Content Blocks</button> section using Timeline blocks.
          </p>
        </div>
      </div>
    )
  }

  function renderSkillsTools() {
    return (
      <>
        {/* Simple skills */}
        <div className="profile-editor-section">
          <h2 className="profile-editor-section__title">Skills</h2>
          <p className="profile-editor-section__desc">Add skills that describe your expertise. These appear as tags on your profile.</p>
          <div className="profile-editor-section__body">
            {renderTagList(skills, removeSkill)}
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <input type="text" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={handleSkillKeyDown} placeholder="Type a skill and press Enter" className="form-input" style={{ flex: 1 }} />
              <button type="button" className="btn btn--outline" onClick={addSkill} style={{ flexShrink: 0 }}>Add</button>
            </div>

            <hr className="profile-editor-section__divider" />

            {/* Enhanced categorized skills */}
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-1)' }}>Categorized Skills</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>Add skills grouped by category for better discoverability.</p>
            {profileSkills.length > 0 && (
              <div className="skill-tool-editor__list">
                {profileSkills.map(skill => (
                  <span key={skill.id} className="skill-tool-editor__item">
                    {skill.skill_name}
                    <span className="skill-tool-editor__item-category">{skill.category}</span>
                    <button type="button" className="skill-tool-editor__item-remove" onClick={() => setProfileSkills(prev => prev.filter(s => s.id !== skill.id))} aria-label={`Remove ${skill.skill_name}`}>&times;</button>
                  </span>
                ))}
              </div>
            )}
            <div className="skill-tool-editor__add-row">
              <input type="text" className="form-input" value={newSkillName} onChange={e => setNewSkillName(e.target.value)} placeholder="Skill name" maxLength={100} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (newSkillName.trim()) { setProfileSkills(prev => [...prev, { id: crypto.randomUUID?.() ?? Math.random().toString(36).substr(2, 9), skill_name: newSkillName.trim(), category: newSkillCategory, display_order: prev.length }]); setNewSkillName('') } } }} />
              <select className="form-input" value={newSkillCategory} onChange={e => setNewSkillCategory(e.target.value)} style={{ width: '160px', flexShrink: 0 }}>
                <option value="design">Design</option>
                <option value="architecture">Architecture</option>
                <option value="fabrication">Fabrication</option>
                <option value="sound">Sound</option>
                <option value="technology">Technology</option>
                <option value="production">Production</option>
                <option value="strategy">Strategy</option>
                <option value="community">Community</option>
              </select>
              <button type="button" className="btn btn--outline" style={{ flexShrink: 0 }} onClick={() => { if (newSkillName.trim()) { setProfileSkills(prev => [...prev, { id: crypto.randomUUID?.() ?? Math.random().toString(36).substr(2, 9), skill_name: newSkillName.trim(), category: newSkillCategory, display_order: prev.length }]); setNewSkillName('') } }}>Add</button>
            </div>
          </div>
          <div className="profile-editor-section__footer">
            <button type="button" className="btn btn--primary" disabled={saving} onClick={saveProfile}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </div>

        {/* Tools */}
        <div className="profile-editor-section">
          <h2 className="profile-editor-section__title">Tools & Materials</h2>
          <p className="profile-editor-section__desc">Software, hardware, materials, and processes you work with.</p>
          <div className="profile-editor-section__body">
            {renderTagList(toolsAndMaterials, removeTool)}
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <input type="text" value={toolInput} onChange={e => setToolInput(e.target.value)} onKeyDown={handleToolKeyDown} placeholder="Type a tool and press Enter" className="form-input" style={{ flex: 1 }} />
              <button type="button" className="btn btn--outline" onClick={addTool} style={{ flexShrink: 0 }}>Add</button>
            </div>

            <hr className="profile-editor-section__divider" />

            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-1)' }}>Categorized Tools</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>Add tools grouped by category.</p>
            {profileTools.length > 0 && (
              <div className="skill-tool-editor__list">
                {profileTools.map(tool => (
                  <span key={tool.id} className="skill-tool-editor__item">
                    {tool.tool_name}
                    <span className="skill-tool-editor__item-category">{tool.category}</span>
                    <button type="button" className="skill-tool-editor__item-remove" onClick={() => setProfileTools(prev => prev.filter(t => t.id !== tool.id))} aria-label={`Remove ${tool.tool_name}`}>&times;</button>
                  </span>
                ))}
              </div>
            )}
            <div className="skill-tool-editor__add-row">
              <input type="text" className="form-input" value={newToolName} onChange={e => setNewToolName(e.target.value)} placeholder="Tool name" maxLength={100} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (newToolName.trim()) { setProfileTools(prev => [...prev, { id: crypto.randomUUID?.() ?? Math.random().toString(36).substr(2, 9), tool_name: newToolName.trim(), category: newToolCategory, display_order: prev.length }]); setNewToolName('') } } }} />
              <select className="form-input" value={newToolCategory} onChange={e => setNewToolCategory(e.target.value)} style={{ width: '160px', flexShrink: 0 }}>
                <option value="software">Software</option>
                <option value="hardware">Hardware</option>
                <option value="materials">Materials</option>
                <option value="processes">Processes</option>
              </select>
              <button type="button" className="btn btn--outline" style={{ flexShrink: 0 }} onClick={() => { if (newToolName.trim()) { setProfileTools(prev => [...prev, { id: crypto.randomUUID?.() ?? Math.random().toString(36).substr(2, 9), tool_name: newToolName.trim(), category: newToolCategory, display_order: prev.length }]); setNewToolName('') } }}>Add</button>
            </div>
          </div>
          <div className="profile-editor-section__footer">
            <button type="button" className="btn btn--primary" disabled={saving} onClick={saveProfile}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </div>
      </>
    )
  }

  function renderAboutMe() {
    return (
      <div className="profile-editor-section">
        <h2 className="profile-editor-section__title">About Me</h2>
        <p className="profile-editor-section__desc">Tell the community about yourself and your practice.</p>
        <div className="profile-editor-section__body">
          <div className="form-group">
            <label htmlFor="bio" className="form-label">Bio</label>
            <textarea id="bio" value={bio} onChange={e => { if (e.target.value.length <= 1000) setBio(e.target.value) }} placeholder="Share your story, practice, and what drives your work" rows={6} className="form-textarea" />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{bio.length}/1000</span>
          </div>

          <div className="form-group">
            <label htmlFor="artist-statement" className="form-label">Artist Statement</label>
            <textarea id="artist-statement" value={artistStatement} onChange={e => { if (e.target.value.length <= 2000) setArtistStatement(e.target.value) }} placeholder="A formal statement about your artistic practice and vision" rows={4} className="form-textarea" />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{artistStatement.length}/2000</span>
          </div>

          <div className="form-group">
            {/* Philosophy field removed — managed in the live profile editor */}
          </div>

          <div className="form-group">
            <label htmlFor="bio-excerpt" className="form-label">SEO Excerpt</label>
            <textarea id="bio-excerpt" value={bioExcerpt} onChange={e => { if (e.target.value.length <= 160) setBioExcerpt(e.target.value) }} placeholder="Short description for search engines (160 chars max)" rows={2} className="form-textarea" />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{bioExcerpt.length}/160</span>
          </div>
        </div>
        <div className="profile-editor-section__footer">
          <button type="button" className="btn btn--primary" disabled={saving} onClick={saveProfile}>{saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </div>
    )
  }

  function renderOnTheWeb() {
    const PLATFORMS = ['instagram', 'linkedin', 'behance', 'artstation', 'dribbble', 'github', 'vimeo', 'soundcloud', 'spotify', 'youtube', 'x', 'tiktok']
    return (
      <div className="profile-editor-section">
        <h2 className="profile-editor-section__title">On The Web</h2>
        <p className="profile-editor-section__desc">Add your social media profiles and web presence.</p>
        <div className="profile-editor-section__body">
          {socialLinks.map((link, i) => (
            <div key={link.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <select value={link.platform} onChange={e => { const updated = [...socialLinks]; updated[i] = { ...updated[i], platform: e.target.value }; setSocialLinks(updated) }} className="form-input" style={{ width: '140px', flexShrink: 0 }}>
                {PLATFORMS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
              <input type="url" value={link.url} onChange={e => { const updated = [...socialLinks]; updated[i] = { ...updated[i], url: e.target.value }; setSocialLinks(updated) }} placeholder="https://..." className="form-input" style={{ flex: 1 }} />
              <button type="button" onClick={() => setSocialLinks(socialLinks.filter((_, j) => j !== i))} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', color: 'var(--color-text-muted)', flexShrink: 0 }} aria-label="Remove">&times;</button>
            </div>
          ))}
          <button type="button" className="btn btn--outline btn--sm" onClick={() => setSocialLinks([...socialLinks, { id: crypto.randomUUID?.() ?? Math.random().toString(36).substr(2, 9), platform: 'instagram', url: '', display_order: socialLinks.length }])}>
            + Add Social Link
          </button>
        </div>
        <div className="profile-editor-section__footer">
          <button type="button" className="btn btn--primary" disabled={saving} onClick={saveProfile}>{saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </div>
    )
  }

  function renderLinks() {
    return (
      <div className="profile-editor-section">
        <h2 className="profile-editor-section__title">Links</h2>
        <p className="profile-editor-section__desc">External links to your portfolio, press mentions, and other web pages.</p>
        <div className="profile-editor-section__body">
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
            External links can be managed in the <button type="button" onClick={() => setActiveSection('blocks')} style={{ color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', font: 'inherit' }}>Content Blocks</button> section using Link blocks.
          </p>
        </div>
      </div>
    )
  }

  function renderGallery() {
    return (
      <div className="profile-editor-section">
        <h2 className="profile-editor-section__title">Gallery & Media</h2>
        <p className="profile-editor-section__desc">Manage your media gallery, photos, and video embeds.</p>
        <div className="profile-editor-section__body">
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
            Gallery items and media can be managed in the <button type="button" onClick={() => setActiveSection('blocks')} style={{ color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', font: 'inherit' }}>Content Blocks</button> section using Gallery and Video blocks.
          </p>
        </div>
      </div>
    )
  }

  function renderContentBlocks() {
    return (
      <div className="profile-editor-section">
        <h2 className="profile-editor-section__title">Content Blocks</h2>
        <p className="profile-editor-section__desc">Arrange and customize the sections that appear on your public profile.</p>
        <div className="profile-editor-section__body">
          <BlockEditor blocks={contentBlocks} onChange={blocks => { setContentBlocks(blocks); setBlocksDirty(true) }} />
        </div>
        <div className="profile-editor-section__footer">
          <button type="button" className="btn btn--primary" disabled={blocksSaving || !blocksDirty} onClick={saveBlocks}>
            {blocksSaving ? 'Saving...' : 'Save Content'}
          </button>
          {blocksDirty && (
            <span style={{ color: 'var(--color-warning, #f59e0b)', fontSize: 'var(--text-sm)', fontStyle: 'italic' }}>Unsaved changes</span>
          )}
        </div>
      </div>
    )
  }

  // --- Loading / Auth guard ---
  if (authLoading || loading) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)' }}>
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading profile...</p>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="profile-editor-layout">
      {/* TOP BAR */}
      <div className="profile-editor-topbar">
        <Link href={profileVisibility === 'published' ? `/profiles/${slugifyName(displayName)}` : '/dashboard'} className="btn btn--primary btn--sm">
          {profileVisibility === 'published' ? 'View My Profile' : 'Back to Dashboard'}
        </Link>

        <div className="profile-editor-topbar__status">
          {profileVisibility === 'draft' && (
            <>
              <span className="profile-status-badge profile-status-badge--draft">Draft</span>
              {canSubmitForReview ? (
                <button className="btn btn--outline btn--sm" onClick={handleSubmitForReview} disabled={saving}>Submit for Review</button>
              ) : (
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Complete name, bio &amp; avatar to submit</span>
              )}
            </>
          )}
          {profileVisibility === 'pending' && <span className="profile-status-badge profile-status-badge--pending">Pending Review</span>}
          {profileVisibility === 'published' && <span className="profile-status-badge profile-status-badge--published">Published</span>}
        </div>

        <button type="button" className="btn btn--outline btn--sm" onClick={() => setSettingsOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          Settings
        </button>
      </div>

      {/* Message toast */}
      {message && (
        <div className="profile-editor-topbar__message" style={{
          margin: 'var(--space-3) var(--space-6)',
          background: message.type === 'success' ? 'var(--color-success-bg, rgba(20,184,166,0.1))' : 'var(--color-error-bg, rgba(239,68,68,0.1))',
          color: message.type === 'success' ? 'var(--color-primary)' : 'var(--color-error, #ef4444)',
          border: `1px solid ${message.type === 'success' ? 'var(--color-primary)' : 'var(--color-error, #ef4444)'}`,
        }}>
          {message.text}
        </div>
      )}

      <div className="profile-editor-body">
        {/* SIDEBAR */}
        <nav className="profile-editor-sidebar">
          <div className="profile-editor-sidebar__avatar">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="profile-editor-sidebar__avatar-img" />
            ) : (
              <div className="profile-editor-sidebar__avatar-placeholder">
                {displayName?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            <div>
              <div className="profile-editor-sidebar__avatar-name">{displayName || 'Your Name'}</div>
              <div className="profile-editor-sidebar__avatar-sub">{professionalTitle || 'Edit Profile'}</div>
            </div>
          </div>

          <ul className="profile-editor-sidebar__nav">
            {EDITOR_SECTIONS.map(s => (
              <li key={s.key}>
                <button
                  className={`profile-editor-sidebar__link ${activeSection === s.key ? 'profile-editor-sidebar__link--active' : ''}`}
                  onClick={() => setActiveSection(s.key)}
                >
                  {s.icon}
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* CONTENT */}
        <div className="profile-editor-content">
          {activeSection === 'basic' && renderBasicInfo()}
          {activeSection === 'experience' && renderWorkExperience()}
          {activeSection === 'skills' && renderSkillsTools()}
          {activeSection === 'about' && renderAboutMe()}
          {activeSection === 'social' && renderOnTheWeb()}
          {activeSection === 'links' && renderLinks()}
          {activeSection === 'gallery' && renderGallery()}
          {activeSection === 'blocks' && renderContentBlocks()}
        </div>
      </div>

      {/* Modals */}
      {avatarCropSrc && (
        <AvatarCropModal
          isOpen={true}
          imageSrc={avatarCropSrc}
          onCrop={(croppedUrl) => { setAvatarUrl(croppedUrl); setAvatarCropSrc(null) }}
          onClose={() => setAvatarCropSrc(null)}
        />
      )}

      <AvailabilityModal
        isOpen={availabilityModalOpen}
        onClose={() => setAvailabilityModalOpen(false)}
        currentStatus={availabilityStatus}
        currentTypes={availabilityTypes}
        currentNote={availabilityNote}
        onSave={(status, types, note) => {
          setAvailabilityStatus(status)
          setAvailabilityTypes(types)
          setAvailabilityNote(note)
          setAvailabilityModalOpen(false)
        }}
      />

      <ProfileSettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        profileSlug={slugifyName(displayName)}
        initialData={{
          displayName, title: professionalTitle, pronouns, location, locationSecondary,
          availabilityStatus, availabilityNote, availabilityTypes,
          ctaPrimaryLabel, ctaPrimaryAction, ctaPrimaryUrl,
          ctaSecondaryLabel, ctaSecondaryAction, ctaSecondaryUrl,
          socialLinks, sectionOrder, sectionVisibility,
          slug: slugifyName(displayName), bioExcerpt,
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
          setTimeout(() => saveProfile(), 100)
          setSettingsOpen(false)
        }}
      />
    </div>
  )
}
