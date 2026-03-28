'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { Badge } from '@/components/ui/Badge'
import { ProfileAvailabilityBadge } from '@/components/profile/ProfileAvailabilityBadge'
import { ProfileSkillsDisplay } from '@/components/profile/ProfileSkillsDisplay'
import { ProfileToolsDisplay } from '@/components/profile/ProfileToolsDisplay'
import type { ProfileSkill, ProfileTool, ProfileSocialLink } from '@/types'

// ─── Types ────────────────────────────────────────────────────────

type EditSection = 'cover' | 'avatar' | 'identity' | 'bio' | 'skills' | 'tools' | 'availability' | 'social' | 'timeline' | 'gallery' | 'pastWork' | null

type GalleryItem = { url: string; alt: string; caption?: string; type: 'image' | 'video'; isFeatured?: boolean; order: number }
type PastWorkItem = { url: string; title: string; description?: string }

type SkillEntry = { id: string; skill_name: string; category: ProfileSkill['category']; display_order: number }
type ToolEntry = { id: string; tool_name: string; category: ProfileTool['category']; display_order: number }
type SocialEntry = { id: string; platform: ProfileSocialLink['platform']; url: string; display_order: number; label?: string }
type TimelineEntry = { year: string; title: string; organization?: string; description?: string; category: string }

const SKILL_CATEGORIES: ProfileSkill['category'][] = ['design', 'architecture', 'fabrication', 'sound', 'technology', 'production', 'strategy', 'community']
const TOOL_CATEGORIES: ProfileTool['category'][] = ['software', 'hardware', 'materials', 'processes']
const SOCIAL_PLATFORMS: ProfileSocialLink['platform'][] = ['instagram', 'linkedin', 'behance', 'artstation', 'dribbble', 'github', 'vimeo', 'soundcloud', 'spotify', 'youtube', 'x', 'tiktok', 'facebook', 'linktree', 'custom']
const TIMELINE_CATEGORIES = ['exhibition', 'education', 'award', 'residency', 'career', 'publication', 'other']

// ─── Helper Panel Components ──────────────────────────────────────

function SkillsPanel({
  profileSkills,
  setProfileSkills,
}: {
  profileSkills: SkillEntry[]
  setProfileSkills: (v: SkillEntry[]) => void
}) {
  const [newSkill, setNewSkill] = useState('')
  const [newCategory, setNewCategory] = useState<ProfileSkill['category']>('design')

  function addSkill() {
    const name = newSkill.trim()
    if (!name) return
    const entry: SkillEntry = {
      id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      skill_name: name,
      category: newCategory,
      display_order: profileSkills.length,
    }
    setProfileSkills([...profileSkills, entry])
    setNewSkill('')
  }

  function removeSkill(id: string) {
    setProfileSkills(profileSkills.filter(s => s.id !== id))
  }

  // Group by category for display
  const grouped = new Map<string, SkillEntry[]>()
  for (const s of profileSkills) {
    if (!grouped.has(s.category)) grouped.set(s.category, [])
    grouped.get(s.category)!.push(s)
  }

  return (
    <div className="live-editor__panel-section">
      {/* Existing skills */}
      {profileSkills.length > 0 && (
        <div style={{ marginBottom: 'var(--space-4)' }}>
          {Array.from(grouped.entries()).map(([cat, items]) => (
            <div key={cat} style={{ marginBottom: 'var(--space-3)' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{cat}</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)', marginTop: 'var(--space-1)' }}>
                {items.map(s => (
                  <span key={s.id} className="live-editor__tag">
                    {s.skill_name}
                    <button
                      type="button"
                      className="live-editor__tag-remove"
                      onClick={() => removeSkill(s.id)}
                      aria-label={`Remove ${s.skill_name}`}
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add new */}
      <div className="form-group">
        <label className="form-label">Add Skill</label>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-end' }}>
          <input
            className="form-input"
            value={newSkill}
            onChange={e => setNewSkill(e.target.value)}
            placeholder="e.g. Projection Mapping"
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
            style={{ flex: 1 }}
          />
          <select
            className="form-input"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value as ProfileSkill['category'])}
            style={{ width: 'auto', minWidth: 120 }}
          >
            {SKILL_CATEGORIES.map(c => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
          <button type="button" className="btn btn--primary btn--sm" onClick={addSkill}>Add</button>
        </div>
      </div>
    </div>
  )
}

function ToolsPanel({
  profileTools,
  setProfileTools,
}: {
  profileTools: ToolEntry[]
  setProfileTools: (v: ToolEntry[]) => void
}) {
  const [newTool, setNewTool] = useState('')
  const [newCategory, setNewCategory] = useState<ProfileTool['category']>('software')

  function addTool() {
    const name = newTool.trim()
    if (!name) return
    const entry: ToolEntry = {
      id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      tool_name: name,
      category: newCategory,
      display_order: profileTools.length,
    }
    setProfileTools([...profileTools, entry])
    setNewTool('')
  }

  function removeTool(id: string) {
    setProfileTools(profileTools.filter(t => t.id !== id))
  }

  const grouped = new Map<string, ToolEntry[]>()
  for (const t of profileTools) {
    if (!grouped.has(t.category)) grouped.set(t.category, [])
    grouped.get(t.category)!.push(t)
  }

  return (
    <div className="live-editor__panel-section">
      {profileTools.length > 0 && (
        <div style={{ marginBottom: 'var(--space-4)' }}>
          {Array.from(grouped.entries()).map(([cat, items]) => (
            <div key={cat} style={{ marginBottom: 'var(--space-3)' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{cat}</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)', marginTop: 'var(--space-1)' }}>
                {items.map(t => (
                  <span key={t.id} className="live-editor__tag">
                    {t.tool_name}
                    <button
                      type="button"
                      className="live-editor__tag-remove"
                      onClick={() => removeTool(t.id)}
                      aria-label={`Remove ${t.tool_name}`}
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Add Tool</label>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-end' }}>
          <input
            className="form-input"
            value={newTool}
            onChange={e => setNewTool(e.target.value)}
            placeholder="e.g. TouchDesigner"
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTool() } }}
            style={{ flex: 1 }}
          />
          <select
            className="form-input"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value as ProfileTool['category'])}
            style={{ width: 'auto', minWidth: 120 }}
          >
            {TOOL_CATEGORIES.map(c => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
          <button type="button" className="btn btn--primary btn--sm" onClick={addTool}>Add</button>
        </div>
      </div>
    </div>
  )
}

function SocialPanel({
  socialLinks,
  setSocialLinks,
}: {
  socialLinks: SocialEntry[]
  setSocialLinks: (v: SocialEntry[]) => void
}) {
  const platformLinks = socialLinks.filter(l => l.platform !== 'custom')
  const customLinks = socialLinks.filter(l => l.platform === 'custom')

  function addLink() {
    const entry: SocialEntry = {
      id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      platform: 'instagram',
      url: '',
      display_order: socialLinks.length,
    }
    setSocialLinks([...socialLinks, entry])
  }

  function addCustomLink() {
    const entry: SocialEntry = {
      id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      platform: 'custom' as ProfileSocialLink['platform'],
      url: '',
      label: '',
      display_order: socialLinks.length,
    }
    setSocialLinks([...socialLinks, entry])
  }

  function updateLink(id: string, field: 'platform' | 'url' | 'label', value: string) {
    setSocialLinks(socialLinks.map(l => l.id === id ? { ...l, [field]: value } : l))
  }

  function removeLink(id: string) {
    setSocialLinks(socialLinks.filter(l => l.id !== id))
  }

  return (
    <div className="live-editor__panel-section">
      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Social Platforms</p>
      {platformLinks.map((link) => (
        <div key={link.id} style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
          <select
            className="form-input"
            value={link.platform}
            onChange={e => updateLink(link.id, 'platform', e.target.value)}
            style={{ width: 'auto', minWidth: 120 }}
          >
            {SOCIAL_PLATFORMS.filter(p => p !== 'custom').map(p => (
              <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </select>
          <input
            className="form-input"
            value={link.url}
            onChange={e => updateLink(link.id, 'url', e.target.value)}
            placeholder="https://..."
            style={{ flex: 1 }}
          />
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => removeLink(link.id)}
            aria-label={`Remove ${link.platform} link`}
            style={{ flexShrink: 0 }}
          >
            &times;
          </button>
        </div>
      ))}
      <button type="button" className="btn btn--outline btn--sm" onClick={addLink}>
        + Add Social Link
      </button>

      <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 'var(--space-6) 0' }} />

      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Custom Links</p>
      {customLinks.map((link) => (
        <div key={link.id} style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
          <input
            className="form-input"
            value={link.label || ''}
            onChange={e => updateLink(link.id, 'label', e.target.value)}
            placeholder="Label (e.g. Portfolio)"
            style={{ width: 140 }}
          />
          <input
            className="form-input"
            value={link.url}
            onChange={e => updateLink(link.id, 'url', e.target.value)}
            placeholder="https://..."
            style={{ flex: 1 }}
          />
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => removeLink(link.id)}
            aria-label="Remove custom link"
            style={{ flexShrink: 0 }}
          >
            &times;
          </button>
        </div>
      ))}
      <button type="button" className="btn btn--outline btn--sm" onClick={addCustomLink}>
        + Add Custom Link
      </button>
    </div>
  )
}

function TimelinePanel({
  timeline,
  setTimeline,
}: {
  timeline: TimelineEntry[]
  setTimeline: (v: TimelineEntry[]) => void
}) {
  function addEntry() {
    setTimeline([...timeline, { year: new Date().getFullYear().toString(), title: '', category: 'career' }])
  }

  function updateEntry(index: number, field: keyof TimelineEntry, value: string) {
    const updated = [...timeline]
    updated[index] = { ...updated[index], [field]: value }
    setTimeline(updated)
  }

  function removeEntry(index: number) {
    setTimeline(timeline.filter((_, i) => i !== index))
  }

  return (
    <div className="live-editor__panel-section">
      {timeline.map((entry, i) => (
        <div key={i} className="live-editor__timeline-entry" style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', border: '1px solid var(--color-border)', borderRadius: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-muted)' }}>Entry {i + 1}</span>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => removeEntry(i)} aria-label="Remove entry">&times;</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Year</label>
              <input className="form-input" value={entry.year} onChange={e => updateEntry(i, 'year', e.target.value)} placeholder="2024" maxLength={10} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Title *</label>
              <input className="form-input" value={entry.title} onChange={e => updateEntry(i, 'title', e.target.value)} placeholder="Exhibition, award, etc." maxLength={200} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Organization</label>
              <input className="form-input" value={entry.organization || ''} onChange={e => updateEntry(i, 'organization', e.target.value)} placeholder="Venue, institution" maxLength={200} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Category</label>
              <select className="form-input" value={entry.category} onChange={e => updateEntry(i, 'category', e.target.value)}>
                {TIMELINE_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Description</label>
            <input className="form-input" value={entry.description || ''} onChange={e => updateEntry(i, 'description', e.target.value)} placeholder="Brief description" maxLength={500} />
          </div>
        </div>
      ))}
      <button type="button" className="btn btn--outline btn--sm" onClick={addEntry}>
        + Add Timeline Entry
      </button>
    </div>
  )
}

// ─── Main Page Component ──────────────────────────────────────────

export default function LiveProfileEditor() {
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [savedMessage, setSavedMessage] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [activePanel, setActivePanel] = useState<EditSection>(null)

  // ALL profile fields as state — these drive the live preview
  const [displayName, setDisplayName] = useState('')
  const [professionalTitle, setProfessionalTitle] = useState('')
  const [pronouns, setPronouns] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [locationSecondary, setLocationSecondary] = useState('')
  const [website, setWebsite] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)
  const [availabilityStatus, setAvailabilityStatus] = useState('')
  const [availabilityNote, setAvailabilityNote] = useState('')
  const [availabilityTypes, setAvailabilityTypes] = useState<string[]>([])
  const [skills, setSkills] = useState<string[]>([])
  const [profileSkills, setProfileSkills] = useState<SkillEntry[]>([])
  const [profileTools, setProfileTools] = useState<ToolEntry[]>([])
  const [toolsAndMaterials, setToolsAndMaterials] = useState<string[]>([])
  const [socialLinks, setSocialLinks] = useState<SocialEntry[]>([])
  const [artistStatement, setArtistStatement] = useState('')
  const [philosophy, setPhilosophy] = useState('')
  const [achievements, setAchievements] = useState<string[]>([])
  const [timeline, setTimeline] = useState<TimelineEntry[]>([])
  const [mediaGallery, setMediaGallery] = useState<GalleryItem[]>([])
  const [pastWork, setPastWork] = useState<PastWorkItem[]>([])
  const [accentColor, setAccentColor] = useState('#01696F')
  const [slug, setSlug] = useState('')
  const [profileVisibility, setProfileVisibility] = useState('draft')
  const [specialties, setSpecialties] = useState<string[]>([])
  const [links, setLinks] = useState<Array<{label: string; url: string; type?: string}>>([])
  const [sectionOrder, setSectionOrder] = useState<string[]>(['skills', 'tools', 'about', 'timeline', 'achievements', 'links'])
  const [resumeUrl, setResumeUrl] = useState<string | null>(null)

  // Refs for scroll-to-section
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Track changes
  const markDirty = useCallback(() => setHasChanges(true), [])

  // Fetch profile on mount
  useEffect(() => {
    if (authLoading) return
    if (!user) { window.location.href = '/login'; return }

    fetch('/api/user/profile', { credentials: 'same-origin' })
      .then(r => r.json())
      .then(data => {
        const p = data.profile
        const ext = data.extendedProfile || {}
        if (p) {
          setDisplayName(p.display_name || '')
          setBio(p.bio || '')
          setLocation(p.location || '')
          setWebsite(p.website || '')
          setSkills(p.skills || [])
          setAvatarUrl(p.avatar_url || null)
          setProfileVisibility(p.profile_visibility || 'draft')
          setSlug(
            (p.display_name || '')
              .toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[^a-z0-9-]/g, '')
          )
          setSpecialties(p.skills || [])
        }
        if (ext) {
          setProfessionalTitle((ext.professional_title as string) || '')
          setPronouns((ext.pronouns as string) || '')
          setLocationSecondary((ext.location_secondary as string) || '')
          setAvailabilityStatus((ext.availability_status as string) || '')
          setAvailabilityNote((ext.availability_note as string) || '')
          setAvailabilityTypes((ext.availability_types as string[]) || [])
          setCoverImageUrl((ext.cover_image_url as string) || null)
          setToolsAndMaterials((ext.tools_and_materials as string[]) || [])
          setArtistStatement((ext.artist_statement as string) || '')
          setPhilosophy((ext.philosophy as string) || '')
          setAchievements((ext.achievements as string[]) || [])
          setTimeline((ext.timeline as TimelineEntry[]) || [])
          setAccentColor((ext.accent_color as string) || '#01696F')
          setLinks((ext.links as Array<{label: string; url: string; type?: string}>) || [])
          if (ext.section_order) setSectionOrder(ext.section_order as string[])
          if (ext.media_gallery) setMediaGallery(ext.media_gallery as GalleryItem[])
          setResumeUrl((ext.resume_url as string) || null)
          if (ext.past_work) setPastWork(ext.past_work as PastWorkItem[])
        }
        // Load related table data from top-level API response
        if (data.profileSkills) setProfileSkills(data.profileSkills as SkillEntry[])
        if (data.profileTools) setProfileTools(data.profileTools as ToolEntry[])
        if (data.socialLinks) setSocialLinks(data.socialLinks as SocialEntry[])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user, authLoading])

  // Auto-save draft every 30s
  useEffect(() => {
    if (!hasChanges) return
    const timer = setInterval(() => {
      saveAll(true)
    }, 30000)
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasChanges])

  async function saveAll(silent = false) {
    setSaving(true)
    setErrorMessage(null)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: displayName.trim(),
          bio: bio.trim() || null,
          location: location.trim() || null,
          website: website.trim() || null,
          skills: skills.length > 0 ? skills : null,
          avatar_url: avatarUrl,
          tools_and_materials: toolsAndMaterials.length > 0 ? toolsAndMaterials : null,
          availability_status: availabilityStatus || null,
          availability_note: availabilityNote.trim() || null,
          cover_image_url: coverImageUrl,
          professional_title: professionalTitle.trim() || null,
          pronouns: pronouns.trim() || null,
          location_secondary: locationSecondary.trim() || null,
          availability_types: availabilityTypes,
          social_links: socialLinks,
          profile_skills: profileSkills,
          profile_tools: profileTools,
          artist_statement: artistStatement.trim() || null,
          philosophy: philosophy.trim() || null,
          achievements: achievements.length > 0 ? achievements : null,
          timeline: timeline.length > 0 ? timeline : null,
          accent_color: accentColor,
          media_gallery: mediaGallery.length > 0 ? mediaGallery : null,
          past_work: pastWork.length > 0 ? pastWork : null,
          resume_url: resumeUrl,
          links: links.length > 0 ? links : null,
          section_order: sectionOrder,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        console.error('Profile save failed:', res.status, data)
        if (!silent) {
          setErrorMessage(data.error || `Save failed (${res.status}). Please try again.`)
        }
        setSaving(false)
        return
      }
      setHasChanges(false)
      if (!silent) {
        setSavedMessage(true)
        setTimeout(() => setSavedMessage(false), 3000)
      }
    } catch (err) {
      console.error('Profile save error:', err)
      if (!silent) {
        setErrorMessage('Network error. Please check your connection and try again.')
      }
    }
    setSaving(false)
  }

  function openPanel(section: EditSection) {
    setActivePanel(section)
    // Scroll the section into view
    if (section && sectionRefs.current[section]) {
      sectionRefs.current[section]!.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }
  function closePanel() {
    setActivePanel(null)
  }
  function setSectionRef(key: string) {
    return (el: HTMLDivElement | null) => { sectionRefs.current[key] = el }
  }

  // File upload helpers
  function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return
    const reader = new FileReader()
    reader.onload = () => {
      const img = new window.Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const s = Math.min(img.width, img.height, 400)
        canvas.width = s
        canvas.height = s
        const ctx = canvas.getContext('2d')!
        const sx = (img.width - s) / 2
        const sy = (img.height - s) / 2
        ctx.drawImage(img, sx, sy, s, s, 0, 0, s, s)
        setAvatarUrl(canvas.toDataURL('image/jpeg', 0.85))
        markDirty()
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  }

  function handleResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || file.size > 5 * 1024 * 1024) return
    const reader = new FileReader()
    reader.onload = () => {
      setResumeUrl(reader.result as string)
      markDirty()
    }
    reader.readAsDataURL(file)
  }

  function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) return
    const reader = new FileReader()
    reader.onload = () => {
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
        markDirty()
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  }

  function handleGalleryUpload(files: FileList | null) {
    if (!files) return
    Array.from(files).forEach(file => {
      if (file.size > 10 * 1024 * 1024) return
      const reader = new FileReader()
      reader.onload = () => {
        const img = new window.Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const maxW = 1600
          const ratio = Math.min(maxW / img.width, 1)
          canvas.width = img.width * ratio
          canvas.height = img.height * ratio
          const ctx = canvas.getContext('2d')!
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
          setMediaGallery(prev => [...prev, {
            url: dataUrl,
            alt: file.name.replace(/\.[^.]+$/, ''),
            type: 'image',
            order: prev.length,
          }])
          markDirty()
        }
        img.src = reader.result as string
      }
      reader.readAsDataURL(file)
    })
  }

  function removeGalleryItem(index: number) {
    setMediaGallery(prev => prev.filter((_, i) => i !== index).map((item, i) => ({ ...item, order: i })))
    markDirty()
  }

  function handlePastWorkUpload(file: File, title: string) {
    if (file.size > 10 * 1024 * 1024) return
    const reader = new FileReader()
    reader.onload = () => {
      const img = new window.Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxW = 1200
        const ratio = Math.min(maxW / img.width, 1)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
        setPastWork(prev => [...prev, { url: dataUrl, title: title || 'Untitled' }])
        markDirty()
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  }

  function removePastWorkItem(index: number) {
    setPastWork(prev => prev.filter((_, i) => i !== index))
    markDirty()
  }

  function updatePastWorkItem(index: number, field: keyof PastWorkItem, value: string) {
    setPastWork(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))
    markDirty()
  }

  // --- Loading ---
  if (authLoading || loading) {
    return (
      <div className="container" style={{ padding: 'var(--space-16) 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Loading your profile...</p>
      </div>
    )
  }
  if (!user) return null

  const locationDisplay = [location, locationSecondary].filter(Boolean).join(' / ')
  const initials = displayName
    .split(' ')
    .map(w => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="live-editor">
      {/* ── Floating Toolbar ────────────────────────────────────── */}
      <div className="live-editor__toolbar">
        <div className="live-editor__toolbar-inner container">
          <span className="live-editor__toolbar-title">Editing Your Profile</span>
          <div className="live-editor__toolbar-actions">
            {errorMessage && (
              <span className="live-editor__error" onClick={() => setErrorMessage(null)} title="Click to dismiss">
                {errorMessage}
              </span>
            )}
            {hasChanges && !errorMessage && <span className="live-editor__unsaved">Unsaved changes</span>}
            {savedMessage && <span className="live-editor__saved">Saved!</span>}
            <button
              onClick={() => saveAll(false)}
              className="btn btn--primary btn--sm"
              disabled={saving || !hasChanges}
            >
              {saving ? 'Saving...' : 'Save All Changes'}
            </button>
            {slug && profileVisibility === 'published' && (
              <a
                href={`/profiles/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--outline btn--sm"
              >
                View Public Profile
              </a>
            )}
            <Link href="/dashboard" className="btn btn--ghost btn--sm">
              Back
            </Link>
          </div>
        </div>
      </div>

      {/* ── Profile Preview — exact same structure as public page ── */}
      <article className="profile-page" style={{ marginTop: '53px' }}>

        {/* Breadcrumb — matches public page structure */}
        <nav aria-label="Breadcrumb" className="breadcrumb container" style={{ paddingTop: 'var(--space-4)' }}>
          <Link href="/dashboard">Dashboard</Link> <span aria-hidden="true">/</span> <span>Edit Profile</span> <span aria-hidden="true">/</span> <span>{displayName || 'Your Name'}</span>
        </nav>

        {/* Cover Banner */}
        <div ref={setSectionRef('cover')} className={`editable-section${activePanel === 'cover' ? ' editable-section--active' : ''}`} onClick={() => openPanel('cover')}>
          <section
            className="profile-banner"
            style={
              coverImageUrl
                ? undefined
                : { background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}cc 50%, ${accentColor}88 100%)` }
            }
          >
            {coverImageUrl && (
              <img
                src={coverImageUrl}
                alt="Cover"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}
            <div className="profile-banner__overlay" />
            {!coverImageUrl && (
              <div className="live-editor__empty-placeholder">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span>Add a Cover Image</span>
                <small>Optimal: 1920 x 480px</small>
              </div>
            )}
          </section>
          <div className="editable-section__overlay">
            <span>Click to edit</span>
          </div>
        </div>

        {/* Header */}
        <section className="profile-header profile-header--enhanced">
          <div className="container">
            <div className="profile-header__inner profile-header__inner--left">
              {/* Avatar */}
              <div ref={setSectionRef('avatar')} className={`editable-section editable-section--inline${activePanel === 'avatar' ? ' editable-section--active' : ''}`} onClick={() => openPanel('avatar')}>
                <div className="profile-header__avatar profile-header__avatar--portrait">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="profile-header__initials" style={{ backgroundColor: accentColor }}>
                      {initials || '?'}
                    </div>
                  )}
                </div>
                <div className="editable-section__overlay">
                  <span>Edit photo</span>
                </div>
              </div>

              <div className="profile-header__content">
                {/* Identity */}
                <div ref={setSectionRef('identity')} className={`editable-section editable-section--inline${activePanel === 'identity' ? ' editable-section--active' : ''}`} onClick={() => openPanel('identity')}>
                  <div className="profile-header__info profile-header__info--left">
                    <h1 className="profile-header__name">
                      {displayName || <span className="live-editor__placeholder-text">Your Name</span>}
                      {pronouns && <span className="profile-header__pronouns">({pronouns})</span>}
                    </h1>
                    <p className="profile-header__title">
                      {professionalTitle || <span className="live-editor__placeholder-text">Your professional title</span>}
                    </p>
                    {locationDisplay && (
                      <p className="profile-header__location">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                          <path d="M7 1C4.5 1 2.5 3 2.5 5.5C2.5 9 7 13 7 13s4.5-4 4.5-7.5C11.5 3 9.5 1 7 1z" stroke="currentColor" strokeWidth="1.2" />
                          <circle cx="7" cy="5.5" r="1.5" stroke="currentColor" strokeWidth="1.2" />
                        </svg>
                        {locationDisplay}
                      </p>
                    )}
                  </div>
                  <div className="editable-section__overlay">
                    <span>Edit info</span>
                  </div>
                </div>

                {/* Availability */}
                <div ref={setSectionRef('availability')} className={`editable-section editable-section--inline${activePanel === 'availability' ? ' editable-section--active' : ''}`} onClick={() => openPanel('availability')}>
                  {availabilityStatus ? (
                    <ProfileAvailabilityBadge
                      status={availabilityStatus as 'open' | 'busy' | 'unavailable'}
                      note={availabilityNote}
                    />
                  ) : (
                    <div className="live-editor__empty-placeholder live-editor__empty-placeholder--small">
                      <span>Set your availability</span>
                    </div>
                  )}
                  <div className="editable-section__overlay">
                    <span>Edit availability</span>
                  </div>
                </div>

                {/* Social Links */}
                <div ref={setSectionRef('social')} className={`editable-section editable-section--inline${activePanel === 'social' ? ' editable-section--active' : ''}`} onClick={() => openPanel('social')}>
                  {socialLinks.length > 0 ? (
                    <div className="profile-header__social">
                      {[...socialLinks]
                        .sort((a, b) => a.display_order - b.display_order)
                        .map(link => (
                          <span
                            key={link.id}
                            className="profile-header__social-btn"
                            title={link.platform}
                          >
                            {link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                          </span>
                        ))}
                    </div>
                  ) : (
                    <div className="live-editor__empty-placeholder live-editor__empty-placeholder--small">
                      <span>Add social links</span>
                    </div>
                  )}
                  <div className="editable-section__overlay">
                    <span>Edit social links</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Specialties Badges — matches public page */}
        {specialties.length > 0 && (
          <section className="profile-specialties">
            <div className="container">
              <div className="profile-specialties__list">
                {specialties.map(s => (
                  <Badge key={s} variant="domain">{s}</Badge>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Skills & Tools Section (merged) */}
        <div ref={setSectionRef('skills')} className={`editable-section${activePanel === 'skills' ? ' editable-section--active' : ''}`} onClick={() => openPanel('skills')}>
          {(profileSkills.length > 0 || profileTools.length > 0) ? (
            <section className="profile-skills-section">
              <div className="container">
                {profileSkills.length > 0 && (
                  <>
                    <p className="section-label">Skills</p>
                    <ProfileSkillsDisplay skills={profileSkills as ProfileSkill[]} />
                  </>
                )}
                {profileTools.length > 0 && (
                  <>
                    {profileSkills.length > 0 && <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 'var(--space-6) 0' }} />}
                    <p className="section-label">Tools &amp; Materials</p>
                    <ProfileToolsDisplay tools={profileTools as ProfileTool[]} />
                  </>
                )}
              </div>
            </section>
          ) : (
            <section className="profile-skills-section">
              <div className="container">
                <div className="live-editor__empty-placeholder">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <span>Add your skills &amp; tools</span>
                </div>
              </div>
            </section>
          )}
          <div className="editable-section__overlay">
            <span>Edit skills &amp; tools</span>
          </div>
        </div>

        {/* About / Bio Section */}
        <div ref={setSectionRef('bio')} className={`editable-section${activePanel === 'bio' ? ' editable-section--active' : ''}`} onClick={() => openPanel('bio')}>
          <section className="profile-about">
            <div className="container">
              <p className="section-label">About</p>
              {bio ? (
                <div className="profile-about__text">
                  {bio.split('\n\n').map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              ) : (
                <div className="live-editor__empty-placeholder">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span>Write your bio</span>
                </div>
              )}
            </div>
          </section>
          <div className="editable-section__overlay">
            <span>Edit about</span>
          </div>
        </div>

        {/* Philosophy / Artist Statement */}
        {(philosophy || artistStatement) && (
          <div className="editable-section" onClick={() => openPanel('bio')}>
            <section className="profile-philosophy">
              <div className="container">
                {artistStatement && (
                  <>
                    <p className="section-label">Artist Statement</p>
                    <blockquote className="profile-philosophy__quote">
                      <p>{artistStatement}</p>
                    </blockquote>
                  </>
                )}
                {philosophy && (
                  <>
                    <p className="section-label">Approach</p>
                    <blockquote className="profile-philosophy__quote">
                      <p>{philosophy}</p>
                    </blockquote>
                  </>
                )}
              </div>
            </section>
            <div className="editable-section__overlay">
              <span>Edit about</span>
            </div>
          </div>
        )}

        {/* Gallery */}
        <div ref={setSectionRef('gallery')} className={`editable-section${activePanel === 'gallery' ? ' editable-section--active' : ''}`} onClick={() => openPanel('gallery')}>
          {mediaGallery.length > 0 ? (
            <section className="profile-gallery-section">
              <div className="container">
                <p className="section-label">Gallery</p>
                <div className="live-editor__gallery-preview">
                  {mediaGallery.map((item, i) => (
                    <div key={i} className="live-editor__gallery-preview-item">
                      <img src={item.url} alt={item.alt || `Gallery image ${i + 1}`} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : (
            <section className="profile-gallery-section">
              <div className="container">
                <div className="live-editor__empty-placeholder">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span>Add gallery images</span>
                </div>
              </div>
            </section>
          )}
          <div className="editable-section__overlay">
            <span>Edit gallery</span>
          </div>
        </div>

        {/* Past Work */}
        <div ref={setSectionRef('pastWork')} className={`editable-section${activePanel === 'pastWork' ? ' editable-section--active' : ''}`} onClick={() => openPanel('pastWork')}>
          {pastWork.length > 0 ? (
            <section className="profile-past-work-section">
              <div className="container">
                <p className="section-label">Past Work</p>
                <div className="past-work-grid">
                  {pastWork.map((item, i) => (
                    <div key={i} className="past-work-card">
                      <div className="past-work-card__image-wrapper">
                        <img src={item.url} alt={item.title} className="past-work-card__image" />
                        <div className="past-work-card__overlay">
                          <span className="past-work-card__title">{item.title}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : (
            <section className="profile-past-work-section">
              <div className="container">
                <div className="live-editor__empty-placeholder">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="7" height="9" rx="1"/>
                    <rect x="14" y="3" width="7" height="5" rx="1"/>
                    <rect x="14" y="12" width="7" height="9" rx="1"/>
                    <rect x="3" y="16" width="7" height="5" rx="1"/>
                  </svg>
                  <span>Showcase your past work</span>
                </div>
              </div>
            </section>
          )}
          <div className="editable-section__overlay">
            <span>Edit past work</span>
          </div>
        </div>

        {/* Timeline */}
        <div ref={setSectionRef('timeline')} className={`editable-section${activePanel === 'timeline' ? ' editable-section--active' : ''}`} onClick={() => openPanel('timeline')}>
          {timeline.length > 0 ? (
            <section className="profile-timeline-section">
              <div className="container">
                <p className="section-label">Timeline</p>
                <h2>Career &amp; Milestones</h2>
                <div className="profile-timeline">
                  {timeline.map((entry, i) => (
                    <div key={i} className="profile-timeline__entry">
                      <span className="profile-timeline__year-label">{entry.year}</span>
                      <div className="profile-timeline__content">
                        <strong>{entry.title}</strong>
                        {entry.organization && <span> — {entry.organization}</span>}
                        {entry.description && (
                          <p
                            style={{
                              margin: 'var(--space-1) 0 0',
                              fontSize: 'var(--text-sm)',
                              color: 'var(--color-text-muted)',
                            }}
                          >
                            {entry.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : (
            <section className="profile-timeline-section">
              <div className="container">
                <div className="live-editor__empty-placeholder">
                  <span>Add career milestones</span>
                </div>
              </div>
            </section>
          )}
          <div className="editable-section__overlay">
            <span>Edit timeline</span>
          </div>
        </div>

        {/* Achievements — matches public page */}
        {achievements.length > 0 && (
          <section className="profile-achievements">
            <div className="container">
              <p className="section-label">Recognition</p>
              <ul className="profile-achievements__list">
                {achievements.map((a, i) => (
                  <li key={i}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.5l-3.7 1.8.7-4.1-3-2.9 4.2-.7L8 1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                    </svg>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Links — matches public page */}
        {links.length > 0 && (
          <section className="profile-links-section">
            <div className="container">
              <p className="section-label">Connect</p>
              <div className="profile-links-row">
                {links.map((link, i) => (
                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="profile-link-btn" aria-label={link.label}>
                    <span>{link.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA — matches public page */}
        <section className="profile-cta">
          <div className="container">
            <h2>Work with {displayName.split(' ')[0] || 'You'}</h2>
            <p>Interested in collaborating or learning more about upcoming projects?</p>
            <div className="profile-cta__actions">
              <span className="btn btn--primary btn--large" style={{ opacity: 0.6, cursor: 'default' }}>Get in Touch</span>
              <Link href="/collaborate" className="btn btn--outline btn--large">Browse Open Roles</Link>
            </div>
          </div>
        </section>
      </article>

      {/* ── Slide-in Edit Panel ─────────────────────────────────── */}
      {activePanel && (
        <>
          <div className="live-editor__panel-backdrop" onClick={closePanel} />
          <div className="live-editor__panel">
            <div className="live-editor__panel-header">
              <h3 className="live-editor__panel-title">
                {activePanel === 'cover' && 'Cover Image'}
                {activePanel === 'avatar' && 'Profile Photo'}
                {activePanel === 'identity' && 'Profile Info'}
                {activePanel === 'bio' && 'About You'}
                {(activePanel === 'skills' || activePanel === 'tools') && 'Skills & Tools'}
                {activePanel === 'availability' && 'Availability'}
                {activePanel === 'social' && 'Social Links'}
                {activePanel === 'timeline' && 'Timeline'}
                {activePanel === 'gallery' && 'Gallery'}
                {activePanel === 'pastWork' && 'Past Work'}
              </h3>
              <button className="live-editor__panel-close" onClick={closePanel}>
                &times;
              </button>
            </div>
            <div className="live-editor__panel-body">
              {/* COVER PANEL */}
              {activePanel === 'cover' && (
                <div className="live-editor__panel-section">
                  {coverImageUrl && (
                    <div className="live-editor__panel-preview">
                      <img
                        src={coverImageUrl}
                        alt="Cover preview"
                        style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8 }}
                      />
                      <button
                        className="btn btn--ghost btn--sm"
                        onClick={() => { setCoverImageUrl(null); markDirty() }}
                        style={{ marginTop: 'var(--space-2)' }}
                      >
                        Remove Cover
                      </button>
                    </div>
                  )}
                  <label className="live-editor__upload-zone">
                    <input type="file" accept="image/*" onChange={handleCoverUpload} style={{ display: 'none' }} />
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span>{coverImageUrl ? 'Replace Cover Image' : 'Upload Cover Image'}</span>
                    <small>Optimal: 1920 x 480px, max 10MB</small>
                  </label>
                  <div className="form-group" style={{ marginTop: 'var(--space-4)' }}>
                    <label className="form-label">Accent Color</label>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={accentColor}
                        onChange={e => { setAccentColor(e.target.value); markDirty() }}
                        style={{ width: 40, height: 40, border: 'none', borderRadius: 8, cursor: 'pointer' }}
                      />
                      <input
                        className="form-input"
                        value={accentColor}
                        onChange={e => { setAccentColor(e.target.value); markDirty() }}
                        placeholder="#01696F"
                        maxLength={7}
                        style={{ width: 100 }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* AVATAR PANEL */}
              {activePanel === 'avatar' && (
                <div className="live-editor__panel-section">
                  {avatarUrl && (
                    <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
                      <img
                        src={avatarUrl}
                        alt="Avatar"
                        style={{
                          width: 120,
                          height: 120,
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '3px solid var(--color-border)',
                        }}
                      />
                      <br />
                      <button
                        className="btn btn--ghost btn--sm"
                        onClick={() => { setAvatarUrl(null); markDirty() }}
                        style={{ marginTop: 'var(--space-2)' }}
                      >
                        Remove Photo
                      </button>
                    </div>
                  )}
                  <label className="live-editor__upload-zone">
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span>{avatarUrl ? 'Change Photo' : 'Upload Photo'}</span>
                    <small>JPG or PNG, max 5MB</small>
                  </label>
                </div>
              )}

              {/* IDENTITY PANEL */}
              {activePanel === 'identity' && (
                <div className="live-editor__panel-section">
                  <div className="form-group">
                    <label className="form-label">Display Name *</label>
                    <input
                      className="form-input"
                      value={displayName}
                      onChange={e => { setDisplayName(e.target.value); markDirty() }}
                      placeholder="Your name"
                      maxLength={200}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Professional Title</label>
                    <input
                      className="form-input"
                      value={professionalTitle}
                      onChange={e => { setProfessionalTitle(e.target.value); markDirty() }}
                      placeholder="e.g. Interactive Artist & Creative Technologist"
                      maxLength={200}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pronouns</label>
                    <select
                      className="form-input"
                      value={pronouns}
                      onChange={e => { setPronouns(e.target.value); markDirty() }}
                    >
                      <option value="">Select...</option>
                      <option value="he/him">he/him</option>
                      <option value="she/her">she/her</option>
                      <option value="they/them">they/them</option>
                      <option value="he/they">he/they</option>
                      <option value="she/they">she/they</option>
                      <option value="any pronouns">any pronouns</option>
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                    <div className="form-group">
                      <label className="form-label">Location</label>
                      <input
                        className="form-input"
                        value={location}
                        onChange={e => { setLocation(e.target.value); markDirty() }}
                        placeholder="City, region"
                        maxLength={200}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Secondary Location</label>
                      <input
                        className="form-input"
                        value={locationSecondary}
                        onChange={e => { setLocationSecondary(e.target.value); markDirty() }}
                        placeholder="Second city"
                        maxLength={200}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Resume / CV (PDF)</label>
                    {resumeUrl ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary)' }}>Resume uploaded</span>
                        <button className="btn btn--ghost btn--sm" onClick={() => { setResumeUrl(null); markDirty() }}>Remove</button>
                      </div>
                    ) : (
                      <label className="live-editor__upload-zone" style={{ padding: 'var(--space-4)' }}>
                        <input type="file" accept=".pdf" onChange={handleResumeUpload} style={{ display: 'none' }} />
                        <span>Upload PDF (max 5MB)</span>
                      </label>
                    )}
                  </div>
                </div>
              )}

              {/* BIO PANEL */}
              {activePanel === 'bio' && (
                <div className="live-editor__panel-section">
                  <div className="form-group">
                    <label className="form-label">Bio</label>
                    <textarea
                      className="form-textarea"
                      value={bio}
                      onChange={e => {
                        if (e.target.value.length <= 3000) { setBio(e.target.value); markDirty() }
                      }}
                      rows={8}
                      placeholder="Tell the community about yourself..."
                    />
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                      {bio.length}/3000
                    </span>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Artist Statement</label>
                    <textarea
                      className="form-textarea"
                      value={artistStatement}
                      onChange={e => {
                        if (e.target.value.length <= 2000) { setArtistStatement(e.target.value); markDirty() }
                      }}
                      rows={4}
                      placeholder="A formal statement about your practice..."
                    />
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                      {artistStatement.length}/2000
                    </span>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Approach / Philosophy</label>
                    <textarea
                      className="form-textarea"
                      value={philosophy}
                      onChange={e => {
                        if (e.target.value.length <= 500) { setPhilosophy(e.target.value); markDirty() }
                      }}
                      rows={3}
                      placeholder="A short statement about your approach..."
                    />
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                      {philosophy.length}/500
                    </span>
                  </div>
                </div>
              )}

              {/* SKILLS & TOOLS PANEL (merged) */}
              {(activePanel === 'skills' || activePanel === 'tools') && (
                <div>
                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Skills</p>
                  <SkillsPanel
                    profileSkills={profileSkills}
                    setProfileSkills={v => { setProfileSkills(v); markDirty() }}
                  />
                  <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 'var(--space-6) 0' }} />
                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tools &amp; Materials</p>
                  <ToolsPanel
                    profileTools={profileTools}
                    setProfileTools={v => { setProfileTools(v); markDirty() }}
                  />
                </div>
              )}

              {/* AVAILABILITY PANEL */}
              {activePanel === 'availability' && (
                <div className="live-editor__panel-section">
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <div className="inline-editor__status-grid">
                      {([
                        { v: 'open', l: 'Open' },
                        { v: 'selective', l: 'Selective' },
                        { v: 'focused', l: 'Focused' },
                      ] as const).map(opt => (
                        <button
                          key={opt.v}
                          className={`inline-editor__status-option ${availabilityStatus === opt.v ? 'inline-editor__status-option--active' : ''}`}
                          onClick={() => { setAvailabilityStatus(opt.v); markDirty() }}
                        >
                          {opt.l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Open to</label>
                    <div className="inline-editor__type-grid">
                      {['Freelance', 'Full-time', 'Contract', 'Residency', 'Mentorship', 'Volunteer', 'Commission'].map(t => (
                        <button
                          key={t}
                          className={`inline-editor__type-option ${availabilityTypes.includes(t) ? 'inline-editor__type-option--active' : ''}`}
                          onClick={() => {
                            setAvailabilityTypes(prev =>
                              prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
                            )
                            markDirty()
                          }}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Note</label>
                    <input
                      className="form-input"
                      value={availabilityNote}
                      onChange={e => { setAvailabilityNote(e.target.value); markDirty() }}
                      placeholder="e.g. Available from June"
                      maxLength={200}
                    />
                  </div>
                </div>
              )}

              {/* SOCIAL PANEL */}
              {activePanel === 'social' && (
                <SocialPanel
                  socialLinks={socialLinks}
                  setSocialLinks={v => { setSocialLinks(v); markDirty() }}
                />
              )}

              {/* TIMELINE PANEL */}
              {activePanel === 'timeline' && (
                <TimelinePanel
                  timeline={timeline}
                  setTimeline={v => { setTimeline(v); markDirty() }}
                />
              )}

              {/* GALLERY PANEL */}
              {activePanel === 'gallery' && (
                <div className="live-editor__panel-section">
                  {/* Existing images */}
                  {mediaGallery.length > 0 && (
                    <div className="live-editor__gallery-grid">
                      {mediaGallery.map((item, i) => (
                        <div key={i} className="live-editor__gallery-item">
                          <img src={item.url} alt={item.alt || `Image ${i + 1}`} />
                          <button
                            type="button"
                            className="live-editor__gallery-remove"
                            onClick={() => removeGalleryItem(i)}
                            aria-label={`Remove image ${i + 1}`}
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload zone */}
                  <label
                    className="live-editor__upload-zone live-editor__gallery-dropzone"
                    onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('live-editor__gallery-dropzone--drag') }}
                    onDragLeave={e => { e.currentTarget.classList.remove('live-editor__gallery-dropzone--drag') }}
                    onDrop={e => {
                      e.preventDefault()
                      e.currentTarget.classList.remove('live-editor__gallery-dropzone--drag')
                      handleGalleryUpload(e.dataTransfer.files)
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={e => handleGalleryUpload(e.target.files)}
                      style={{ display: 'none' }}
                    />
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span>Drop images here or click to upload</span>
                    <small>JPG or PNG, max 10MB each</small>
                  </label>

                  {mediaGallery.length > 0 && (
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-3)' }}>
                      {mediaGallery.length} image{mediaGallery.length !== 1 ? 's' : ''} in gallery
                    </p>
                  )}
                </div>
              )}

              {/* PAST WORK PANEL */}
              {activePanel === 'pastWork' && (
                <div className="live-editor__panel-section">
                  {pastWork.map((item, i) => (
                    <div key={i} style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', border: '1px solid var(--color-border)', borderRadius: 8 }}>
                      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                        {item.url && (
                          <img src={item.url} alt={item.title} style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <input className="form-input" value={item.title} onChange={e => updatePastWorkItem(i, 'title', e.target.value)} placeholder="Project title" maxLength={200} style={{ marginBottom: 'var(--space-2)' }} />
                          <input className="form-input" value={item.description || ''} onChange={e => updatePastWorkItem(i, 'description', e.target.value)} placeholder="Brief description (optional)" maxLength={500} />
                        </div>
                        <button type="button" className="btn btn--ghost btn--sm" onClick={() => removePastWorkItem(i)} aria-label="Remove item" style={{ flexShrink: 0, alignSelf: 'flex-start' }}>&times;</button>
                      </div>
                    </div>
                  ))}
                  <label className="live-editor__upload-zone" onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('live-editor__gallery-dropzone--drag') }} onDragLeave={e => e.currentTarget.classList.remove('live-editor__gallery-dropzone--drag')} onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('live-editor__gallery-dropzone--drag'); if (e.dataTransfer.files) Array.from(e.dataTransfer.files).forEach(f => handlePastWorkUpload(f, f.name.replace(/\.[^.]+$/, ''))) }}>
                    <input type="file" accept="image/*" multiple onChange={e => { if (e.target.files) Array.from(e.target.files).forEach(f => handlePastWorkUpload(f, f.name.replace(/\.[^.]+$/, ''))); e.target.value = '' }} style={{ display: 'none' }} />
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                    <span>Drop images here or click to add past work</span>
                    <small>JPG or PNG, max 10MB each</small>
                  </label>
                  {pastWork.length > 0 && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-3)' }}>{pastWork.length} item{pastWork.length !== 1 ? 's' : ''}</p>}
                </div>
              )}
            </div>
            <div className="live-editor__panel-footer">
              <button className="btn btn--primary btn--sm" onClick={closePanel}>
                Done
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Styles ──────────────────────────────────────────────── */}
      <style jsx>{`
        .live-editor {
          min-height: 100vh;
          background: var(--color-bg);
        }

        /* Floating toolbar */
        .live-editor__toolbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: var(--color-surface);
          border-bottom: 1px solid var(--color-border);
          backdrop-filter: blur(12px);
          height: 53px;
          display: flex;
          align-items: center;
        }
        .live-editor__toolbar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }
        .live-editor__toolbar-title {
          font-weight: 600;
          font-size: var(--text-sm);
          color: var(--color-text);
        }
        .live-editor__toolbar-actions {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }
        .live-editor__unsaved {
          font-size: var(--text-xs);
          color: var(--color-warning, #d97706);
          font-weight: 500;
        }
        .live-editor__saved {
          font-size: var(--text-xs);
          color: var(--color-success, #059669);
          font-weight: 500;
        }

        /* Editable section wrapper */
        .editable-section {
          position: relative;
          cursor: pointer;
          transition: outline 0.15s;
        }
        .editable-section:hover {
          outline: 2px solid var(--color-accent, #01696F);
          outline-offset: -2px;
          border-radius: 4px;
        }
        .editable-section--active {
          outline: 2px solid var(--color-accent, #01696F) !important;
          outline-offset: -2px;
          border-radius: 4px;
          box-shadow: 0 0 0 4px rgba(1, 105, 111, 0.15);
        }
        .editable-section--inline {
          display: inline-block;
        }
        .editable-section__overlay {
          position: absolute;
          top: 8px;
          right: 8px;
          display: flex;
          align-items: center;
          gap: var(--space-1);
          padding: 4px 10px;
          background: var(--color-primary, #01696F);
          color: #fff;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.15s ease-out;
          z-index: 5;
          white-space: nowrap;
        }
        .editable-section:hover .editable-section__overlay {
          opacity: 1;
        }

        /* Empty placeholders */
        .live-editor__empty-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          padding: var(--space-8) var(--space-4);
          color: var(--color-text-muted);
          text-align: center;
        }
        .live-editor__empty-placeholder span {
          font-size: var(--text-sm);
          font-weight: 500;
        }
        .live-editor__empty-placeholder small {
          font-size: var(--text-xs);
          opacity: 0.7;
        }
        .live-editor__empty-placeholder--small {
          padding: var(--space-2) var(--space-3);
          flex-direction: row;
        }
        .live-editor__placeholder-text {
          color: var(--color-text-muted);
          font-style: italic;
          opacity: 0.6;
        }

        /* Slide-in panel */
        .live-editor__panel-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1100;
          background: rgba(0, 0, 0, 0.3);
          animation: fadeIn 0.15s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .live-editor__panel {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: min(440px, 90vw);
          z-index: 1200;
          background: var(--color-surface);
          border-left: 1px solid var(--color-border);
          display: flex;
          flex-direction: column;
          animation: slideInRight 0.2s ease-out;
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .live-editor__panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-4) var(--space-5);
          border-bottom: 1px solid var(--color-border);
          flex-shrink: 0;
        }
        .live-editor__panel-title {
          font-size: var(--text-base);
          font-weight: 600;
          margin: 0;
        }
        .live-editor__panel-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: var(--color-text-muted);
          padding: 4px 8px;
          line-height: 1;
        }
        .live-editor__panel-close:hover {
          color: var(--color-text);
        }
        .live-editor__panel-body {
          flex: 1;
          overflow-y: auto;
          padding: var(--space-5);
        }
        .live-editor__panel-footer {
          padding: var(--space-3) var(--space-5);
          border-top: 1px solid var(--color-border);
          flex-shrink: 0;
          display: flex;
          justify-content: flex-end;
        }
        .live-editor__panel-section {
          /* Container for panel form groups */
        }

        /* Upload zone */
        .live-editor__upload-zone {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          padding: var(--space-6) var(--space-4);
          border: 2px dashed var(--color-border);
          border-radius: 8px;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
          text-align: center;
          color: var(--color-text-muted);
        }
        .live-editor__upload-zone:hover {
          border-color: var(--color-accent, #01696F);
          background: rgba(1, 105, 111, 0.04);
        }
        .live-editor__upload-zone span {
          font-size: var(--text-sm);
          font-weight: 500;
        }
        .live-editor__upload-zone small {
          font-size: var(--text-xs);
          opacity: 0.7;
        }

        /* Tags in panels */
        .live-editor__tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: 999px;
          font-size: var(--text-xs);
          color: var(--color-text);
        }
        .live-editor__tag-remove {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--color-text-muted);
          font-size: 14px;
          line-height: 1;
          padding: 0 2px;
        }
        .live-editor__tag-remove:hover {
          color: var(--color-danger, #dc2626);
        }

        /* Gallery preview in profile */
        .live-editor__gallery-preview {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: var(--space-3);
        }
        .live-editor__gallery-preview-item {
          border-radius: 8px;
          overflow: hidden;
          aspect-ratio: 4 / 3;
        }
        .live-editor__gallery-preview-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Gallery editor in panel */
        .live-editor__gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: var(--space-2);
          margin-bottom: var(--space-4);
        }
        .live-editor__gallery-item {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          aspect-ratio: 1;
        }
        .live-editor__gallery-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .live-editor__gallery-remove {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.6);
          color: #fff;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          line-height: 1;
          opacity: 0;
          transition: opacity 0.15s;
        }
        .live-editor__gallery-item:hover .live-editor__gallery-remove {
          opacity: 1;
        }
        .live-editor__gallery-remove:hover {
          background: rgba(220, 38, 38, 0.8);
        }

        /* Drag-over state for gallery dropzone */
        .live-editor__gallery-dropzone--drag {
          border-color: var(--color-accent, #01696F) !important;
          background: rgba(1, 105, 111, 0.08) !important;
        }
      `}</style>
    </div>
  )
}
