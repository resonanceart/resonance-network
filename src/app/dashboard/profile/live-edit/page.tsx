'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { Badge } from '@/components/ui/Badge'
import { ProfileAvailabilityBadge } from '@/components/profile/ProfileAvailabilityBadge'
import { ProfileSkillsDisplay } from '@/components/profile/ProfileSkillsDisplay'
import { ProfileToolsDisplay } from '@/components/profile/ProfileToolsDisplay'
import { ProfileChecklist } from '@/components/profile/ProfileChecklist'
import { ShareProfile } from '@/components/profile/ShareProfile'
import { SmartGallery, type GalleryItem as SmartGalleryItem } from '@/components/profile/SmartGallery'
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

// ─── Upload Helper ───────────────────────────────────────────────

async function uploadFile(file: File, type: string): Promise<{ url: string | null; error: string | null }> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', type)
  try {
    const res = await fetch('/api/upload', { method: 'POST', credentials: 'same-origin', body: formData })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Upload failed' }))
      return { url: null, error: err.error || `Upload failed (${res.status})` }
    }
    const data = await res.json()
    return { url: data.url || null, error: null }
  } catch {
    return { url: null, error: 'Network error during upload. Please check your connection.' }
  }
}

// ─── Main Page Component ──────────────────────────────────────────

export default function LiveProfileEditor() {
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [savedMessage, setSavedMessage] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [galleryUploading, setGalleryUploading] = useState(false)
  const [activePanel, setActivePanel] = useState<EditSection>(null)
  const [showWelcome, setShowWelcome] = useState(false)

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
  const [portfolioPdfUrl, setPortfolioPdfUrl] = useState<string | null>(null)
  const [mediaLinks, setMediaLinks] = useState<Array<{label: string; url: string; type: 'website' | 'fundraiser' | 'other'}>>([])
  const [pdfDocuments, setPdfDocuments] = useState<Array<{url: string; title: string}>>([])
  const [showAddLink, setShowAddLink] = useState(false)
  const [newLinkUrl, setNewLinkUrl] = useState('')
  const [newLinkLabel, setNewLinkLabel] = useState('')
  const [newLinkThumbnail, setNewLinkThumbnail] = useState<string | null>(null)

  // Avatar crop state
  const [avatarRawSrc, setAvatarRawSrc] = useState<string | null>(null)

  // Refs for scroll-to-section
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const lastChangeTime = useRef(0)

  // Track changes
  const markDirty = useCallback(() => {
    setHasChanges(true)
    lastChangeTime.current = Date.now()
  }, [])

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
          setPortfolioPdfUrl((ext.portfolio_pdf_url as string) || null)
          if (ext.media_links) setMediaLinks(ext.media_links as Array<{label: string; url: string; type: 'website' | 'fundraiser' | 'other'}>)
          if (ext.past_work) setPastWork(ext.past_work as PastWorkItem[])
          if (ext.pdf_documents) setPdfDocuments(ext.pdf_documents as Array<{url: string; title: string}>)
        }
        // Load related table data from top-level API response
        if (data.profileSkills) setProfileSkills(data.profileSkills as SkillEntry[])
        if (data.profileTools) setProfileTools(data.profileTools as ToolEntry[])
        if (data.socialLinks) setSocialLinks(data.socialLinks as SocialEntry[])

        // Show welcome overlay for brand new profiles
        if (!p?.avatar_url && !p?.bio) {
          setShowWelcome(true)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user, authLoading])

  // Auto-save: 15s interval, debounced 2s after last change
  useEffect(() => {
    if (!hasChanges) return
    const timer = setInterval(() => {
      // Don't autosave if user changed something in the last 2 seconds
      if (Date.now() - lastChangeTime.current < 2000) return
      saveAll(true)
    }, 15000)
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
          portfolio_pdf_url: portfolioPdfUrl,
          media_links: mediaLinks.length > 0 ? mediaLinks : null,
          links: links.length > 0 ? links : null,
          pdf_documents: pdfDocuments.length > 0 ? pdfDocuments : null,
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

  // File upload wrapper with error feedback
  async function upload(file: File, type: string): Promise<string | null> {
    setUploadError(null)
    const result = await uploadFile(file, type)
    if (result.error) {
      setUploadError(result.error)
      return null
    }
    return result.url
  }

  // File upload helpers
  function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || file.size > 5 * 1024 * 1024) return
    const reader = new FileReader()
    reader.onload = () => {
      setAvatarRawSrc(reader.result as string)
      // Open the avatar panel to show crop UI
      setActivePanel('avatar')
    }
    reader.readAsDataURL(file)
  }

  async function handleResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || file.size > 5 * 1024 * 1024) return
    const url = await upload(file, 'resume')
    if (url) {
      setResumeUrl(url)
      markDirty()
    }
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || file.size > 10 * 1024 * 1024) return
    setSaving(true)
    const url = await upload(file, 'cover')
    if (url) {
      setCoverImageUrl(url)
      markDirty()
    }
    setSaving(false)
  }

  async function handlePortfolioPdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || file.size > 5 * 1024 * 1024) return
    const url = await upload(file, 'portfolio')
    if (url) {
      setPortfolioPdfUrl(url)
      markDirty()
    }
  }

  function addMediaLink() {
    setMediaLinks([...mediaLinks, { label: '', url: '', type: 'website' }])
    markDirty()
  }

  function updateMediaLink(index: number, field: string, value: string) {
    setMediaLinks(prev => prev.map((l, i) => i === index ? { ...l, [field]: value } : l))
    markDirty()
  }

  function removeMediaLink(index: number) {
    setMediaLinks(prev => prev.filter((_, i) => i !== index))
    markDirty()
  }

  async function handleGalleryUpload(files: FileList | null) {
    if (!files) return
    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) continue
      const url = await upload(file, 'gallery')
      if (url) {
        setMediaGallery(prev => [...prev, {
          url,
          alt: file.name.replace(/\.[^.]+$/, ''),
          type: 'image' as const,
          order: prev.length,
        }])
        markDirty()
      }
    }
  }

  function removeGalleryItem(index: number) {
    setMediaGallery(prev => prev.filter((_, i) => i !== index).map((item, i) => ({ ...item, order: i })))
    markDirty()
  }

  async function handlePastWorkUpload(file: File, title: string) {
    if (file.size > 10 * 1024 * 1024) return
    const url = await upload(file, 'pastwork')
    if (url) {
      setPastWork(prev => [...prev, { url, title: title || 'Untitled' }])
      markDirty()
    }
  }

  function removePastWorkItem(index: number) {
    setPastWork(prev => prev.filter((_, i) => i !== index))
    markDirty()
  }

  function updatePastWorkItem(index: number, field: keyof PastWorkItem, value: string) {
    setPastWork(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))
    markDirty()
  }

  // Build unified gallery items from separate data
  function buildGalleryItems(): SmartGalleryItem[] {
    const items: SmartGalleryItem[] = []
    let order = 0

    // Gallery images
    mediaGallery.forEach((img, i) => {
      items.push({
        id: `img-${i}`,
        type: 'image',
        url: img.url,
        title: img.alt || img.caption || 'Gallery Image',
        order: order++,
      })
    })

    // Past work images
    pastWork.forEach((item, i) => {
      items.push({
        id: `pw-${i}`,
        type: 'image',
        url: item.url,
        title: item.title || 'Past Work',
        subtitle: 'Past Work',
        order: order++,
      })
    })

    // PDF documents
    pdfDocuments.forEach((doc, i) => {
      items.push({
        id: `pdf-${i}`,
        type: 'pdf',
        url: doc.url,
        thumbnail: (doc as Record<string, unknown>).thumbnail as string | undefined,
        title: doc.title || 'Document',
        subtitle: 'PDF',
        order: order++,
      })
    })

    // Portfolio PDF
    if (portfolioPdfUrl) {
      items.push({
        id: 'portfolio-pdf',
        type: 'pdf',
        url: portfolioPdfUrl,
        title: 'Portfolio',
        subtitle: 'PDF Document',
        order: order++,
      })
    }

    // Resume PDF
    if (resumeUrl) {
      items.push({
        id: 'resume-pdf',
        type: 'pdf',
        url: resumeUrl,
        title: 'Resume',
        subtitle: 'PDF Document',
        order: order++,
      })
    }

    // Website links / media links
    if (website) {
      try {
        items.push({
          id: 'website',
          type: 'link',
          url: website,
          title: 'Website',
          subtitle: new URL(website).hostname,
          order: order++,
        })
      } catch {}
    }

    mediaLinks.forEach((link, i) => {
      let subtitle = 'website'
      try { subtitle = new URL(link.url).hostname } catch {}
      items.push({
        id: `link-${i}`,
        type: 'link',
        url: link.url,
        thumbnail: (link as Record<string, unknown>).thumbnail as string | undefined,
        title: link.label || 'Link',
        subtitle,
        order: order++,
      })
    })

    return items
  }

  // Social icon renderer
  function getSocialIconClean(platform: string) {
    const size = 20
    switch (platform) {
      case 'instagram':
        return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>
      case 'linkedin':
        return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="3"/><path d="M7 11v6M7 7v.01M11 17v-4a2 2 0 014 0v4M15 11v6"/></svg>
      case 'github':
        return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
      case 'youtube':
        return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="4"/><polygon points="10 8 16 12 10 16" fill="currentColor" stroke="none"/></svg>
      case 'x':
        return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      case 'tiktok':
        return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2v13a4 4 0 11-3-3.87"/><path d="M12 6c2 1.5 4 2 6 2"/></svg>
      case 'behance':
        return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 3.211 3.483 3.312 4.588 1.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988H0V5.021h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zM3 11h3.584c2.508 0 2.906-3-.312-3H3v3zm3.391 3H3v3.016h3.341c3.055 0 2.868-3.016.05-3.016z"/></svg>
      case 'facebook':
        return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
      case 'dribbble':
        return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.18 17.72M19.13 5.09C15.22 9.14 10.9 10.44 2.64 10.96M21.75 12.84c-6.62-1.41-12.14 1-16.38 6.32"/></svg>
      case 'spotify':
        return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
      case 'vimeo':
        return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197c1.185-1.044 2.351-2.084 3.501-3.128C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.507.539 2.45 1.131 3.674 1.776 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.868 3.434-5.757 6.762-5.637 2.473.06 3.628 1.664 3.493 4.797l-.013.01z"/></svg>
      case 'soundcloud':
        return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 14V10M5 15V8M8 16V6M11 16V4M14 16V3"/><path d="M17 4c3 0 5 2 5 5s-2.5 5-5 5" stroke="currentColor" strokeWidth="2"/></svg>
      case 'linktree':
        return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18M7 7l5-4 5 4M7 13h10M8 18h8"/></svg>
      default:
        return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
    }
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
            {saving && hasChanges && <span className="live-editor__autosave">Auto-saving...</span>}
            {hasChanges && !saving && !errorMessage && <span className="live-editor__unsaved">Unsaved changes</span>}
            {savedMessage && <span className="live-editor__saved">Saved!</span>}
            <button
              onClick={() => saveAll(false)}
              className="btn btn--primary btn--sm"
              disabled={saving || !hasChanges}
            >
              {saving ? 'Saving...' : 'Save All Changes'}
            </button>
            <button
              onClick={() => {
                // Open window immediately to avoid Safari popup blocker
                const previewWindow = window.open('about:blank', '_blank')
                if (previewWindow) {
                  if (hasChanges) {
                    saveAll(true).then(() => {
                      previewWindow.location.href = '/dashboard/profile/preview'
                    })
                  } else {
                    previewWindow.location.href = '/dashboard/profile/preview'
                  }
                }
              }}
              className="btn btn--outline btn--sm"
              disabled={saving || !displayName.trim()}
            >
              Preview
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
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="breadcrumb container" style={{ paddingTop: 'var(--space-4)' }}>
          <Link href="/dashboard">Dashboard</Link> <span aria-hidden="true">/</span>
          <span>Edit Profile</span> <span aria-hidden="true">/</span>
          <span>{displayName || 'Your Name'}</span>
        </nav>

        {/* Row 1: Banner */}
        <div ref={setSectionRef('cover')} className={`editable-section${activePanel === 'cover' ? ' editable-section--active' : ''}`} onClick={() => openPanel('cover')}>
          <section className="profile-banner"
            style={coverImageUrl ? undefined : { background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}cc 50%, ${accentColor}88 100%)` }}>
            {coverImageUrl && <img src={coverImageUrl} alt="Cover" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
            <div className="profile-banner__overlay" />
            {!coverImageUrl && (
              <div className="live-editor__empty-placeholder">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <span>Add a Cover Image</span>
                <small>Optimal: 1920 x 480px</small>
              </div>
            )}
          </section>
          <div className="editable-section__overlay"><span>Click to edit</span></div>
        </div>

        {/* Row 2: 3-Column Header Grid */}
        <section className="profile-header-grid-section">
          <div className="container">
            <div className="profile-header-grid">
              {/* Col 1: Photo */}
              <div ref={setSectionRef('avatar')} className={`editable-section profile-header-grid__photo${activePanel === 'avatar' ? ' editable-section--active' : ''}`} onClick={() => openPanel('avatar')}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div className="profile-header-grid__initials" style={{ backgroundColor: accentColor }}>
                    {initials || '?'}
                  </div>
                )}
                <div className="editable-section__overlay"><span>Edit photo</span></div>
              </div>

              {/* Col 2: Info */}
              <div ref={setSectionRef('identity')} className={`editable-section profile-header-grid__info${activePanel === 'identity' ? ' editable-section--active' : ''}`} onClick={() => openPanel('identity')}>
                <h1 className="profile-header-grid__name">
                  {displayName || <span className="live-editor__placeholder-text">Your Name</span>}
                  {pronouns && <span className="profile-header-grid__pronouns">({pronouns})</span>}
                </h1>
                <p className="profile-header-grid__title">
                  {professionalTitle || <span className="live-editor__placeholder-text">Your professional title</span>}
                </p>

                {/* Bio */}
                <div ref={setSectionRef('bio')} className={`profile-header-grid__bio${activePanel === 'bio' ? ' editable-section--active' : ''}`} onClick={(e) => { e.stopPropagation(); openPanel('bio') }} style={{ cursor: 'pointer' }}>
                  {bio ? (
                    bio.split('\n\n').map((p, i) => <p key={i}>{p}</p>)
                  ) : (
                    <p className="live-editor__placeholder-text">Click to write your bio...</p>
                  )}
                </div>

                <div className="editable-section__overlay"><span>Edit info</span></div>
              </div>

              {/* Col 3: Skills + Location */}
              <div ref={setSectionRef('skills')} className={`editable-section profile-header-grid__sidebar${activePanel === 'skills' ? ' editable-section--active' : ''}`} onClick={() => openPanel('skills')}>
                {profileSkills.length > 0 ? (
                  <div className="profile-header-grid__skills">
                    <p className="profile-header-grid__sidebar-label">Skills</p>
                    <div className="profile-header-grid__skill-tags">
                      {profileSkills.map(s => (
                        <span key={s.id} className="profile-skill-tag">{s.skill_name}</span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="profile-header-grid__skills">
                    <p className="profile-header-grid__sidebar-label">Skills</p>
                    <p className="live-editor__placeholder-text" style={{ fontSize: 'var(--text-sm)' }}>Add your skills</p>
                  </div>
                )}

                {profileTools.length > 0 && (
                  <div className="profile-header-grid__skills" style={{ marginTop: 'var(--space-4)' }}>
                    <p className="profile-header-grid__sidebar-label">Tools</p>
                    <div className="profile-header-grid__skill-tags">
                      {profileTools.map(t => (
                        <span key={t.id} className="profile-skill-tag profile-skill-tag--tool">{t.tool_name}</span>
                      ))}
                    </div>
                  </div>
                )}

                {locationDisplay && (
                  <div className="profile-header-grid__location">
                    <p className="profile-header-grid__sidebar-label">Location</p>
                    <p className="profile-header-grid__location-text">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1C4.5 1 2.5 3 2.5 5.5C2.5 9 7 13 7 13s4.5-4 4.5-7.5C11.5 3 9.5 1 7 1z" stroke="currentColor" strokeWidth="1.2"/><circle cx="7" cy="5.5" r="1.5" stroke="currentColor" strokeWidth="1.2"/></svg>
                      {locationDisplay}
                    </p>
                  </div>
                )}

                {availabilityStatus && (
                  <div ref={setSectionRef('availability')} style={{ marginTop: 'var(--space-4)' }} onClick={(e) => { e.stopPropagation(); openPanel('availability') }}>
                    <ProfileAvailabilityBadge status={availabilityStatus as 'open' | 'busy' | 'unavailable'} note={availabilityNote} />
                  </div>
                )}

                {/* Social Links */}
                <div ref={setSectionRef('social')} style={{ marginTop: 'var(--space-4)' }} onClick={(e) => { e.stopPropagation(); openPanel('social') }}>
                  <p className="profile-header-grid__sidebar-label">Social</p>
                  {socialLinks.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                      {[...socialLinks].sort((a, b) => a.display_order - b.display_order).map(link => (
                        <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="profile-social-icon-sm" title={link.platform} onClick={e => e.stopPropagation()}>
                          {getSocialIconClean(link.platform)}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="live-editor__placeholder-text" style={{ fontSize: 'var(--text-sm)' }}>Add social links</p>
                  )}
                </div>

                <div className="editable-section__overlay"><span>Edit skills</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* Row 3: Artist Statement | Philosophy (2-column) */}
        <div ref={setSectionRef('bio')} className={`editable-section${activePanel === 'bio' ? ' editable-section--active' : ''}`} onClick={() => openPanel('bio')}>
          <section className="profile-two-col-section">
            <div className="container">
              <div className="profile-two-col">
                <div className="profile-two-col__block">
                  <p className="section-label">Artist Statement</p>
                  {artistStatement ? (
                    <div className="profile-two-col__text">
                      {artistStatement.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
                    </div>
                  ) : (
                    <p className="live-editor__placeholder-text">Write your artist statement...</p>
                  )}
                </div>
                <div className="profile-two-col__block">
                  <p className="section-label">Philosophy</p>
                  {philosophy ? (
                    <blockquote className="profile-two-col__quote"><p>{philosophy}</p></blockquote>
                  ) : (
                    <p className="live-editor__placeholder-text">Share your philosophy...</p>
                  )}
                </div>
              </div>
            </div>
          </section>
          <div className="editable-section__overlay"><span>Edit about</span></div>
        </div>

        {/* Media Gallery */}
        <section className="profile-media-grid-section">
          <div className="container">
            <p className="section-label">Gallery</p>
            {buildGalleryItems().length > 0 ? (
              <SmartGallery
                items={buildGalleryItems()}
                editable={true}
                onReorder={(reordered) => {
                  // Update the underlying state from reordered items
                  // For now, just mark dirty — full reorder sync is complex
                  markDirty()
                }}
                onDelete={(id) => {
                  if (id.startsWith('img-')) {
                    const idx = parseInt(id.split('-')[1])
                    setMediaGallery(prev => prev.filter((_, i) => i !== idx))
                  } else if (id.startsWith('pw-')) {
                    const idx = parseInt(id.split('-')[1])
                    setPastWork(prev => prev.filter((_, i) => i !== idx))
                  } else if (id.startsWith('pdf-')) {
                    const idx = parseInt(id.split('-')[1])
                    setPdfDocuments(prev => prev.filter((_, i) => i !== idx))
                  } else if (id === 'portfolio-pdf') {
                    setPortfolioPdfUrl(null)
                  } else if (id === 'resume-pdf') {
                    setResumeUrl(null)
                  } else if (id === 'website') {
                    setWebsite('')
                  } else if (id.startsWith('link-')) {
                    const idx = parseInt(id.split('-')[1])
                    setMediaLinks(prev => prev.filter((_, i) => i !== idx))
                  }
                  markDirty()
                }}
                onEditThumbnail={(id, thumbnailUrl) => {
                  if (id.startsWith('pdf-')) {
                    const idx = parseInt(id.split('-')[1])
                    setPdfDocuments(prev => prev.map((item, i) => i === idx ? { ...item, thumbnail: thumbnailUrl } : item))
                  } else if (id.startsWith('link-')) {
                    const idx = parseInt(id.split('-')[1])
                    setMediaLinks(prev => prev.map((item, i) => i === idx ? { ...item, thumbnail: thumbnailUrl } as typeof item : item))
                  } else if (id === 'portfolio-pdf' || id === 'resume-pdf') {
                    // Store thumbnail in a separate state or extend the data
                  }
                  markDirty()
                }}
                onEditTitle={(id, newTitle) => {
                  if (id.startsWith('img-')) {
                    const idx = parseInt(id.split('-')[1])
                    setMediaGallery(prev => prev.map((item, i) => i === idx ? { ...item, alt: newTitle, caption: newTitle } : item))
                  } else if (id.startsWith('pw-')) {
                    const idx = parseInt(id.split('-')[1])
                    setPastWork(prev => prev.map((item, i) => i === idx ? { ...item, title: newTitle } : item))
                  } else if (id.startsWith('pdf-')) {
                    const idx = parseInt(id.split('-')[1])
                    setPdfDocuments(prev => prev.map((item, i) => i === idx ? { ...item, title: newTitle } : item))
                  } else if (id.startsWith('link-')) {
                    const idx = parseInt(id.split('-')[1])
                    setMediaLinks(prev => prev.map((item, i) => i === idx ? { ...item, label: newTitle } : item))
                  }
                  markDirty()
                }}
              />
            ) : (
              <div className="live-editor__empty-placeholder">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <span>Add images, documents, and links to your gallery</span>
              </div>
            )}
            {/* Upload status and errors — visible in the gallery area */}
            {uploadError && (
              <div style={{ background: 'rgba(220,38,38,0.15)', color: '#ff6b6b', padding: '10px 16px', borderRadius: 8, marginTop: 'var(--space-3)', fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(220,38,38,0.3)' }}>
                <span>{uploadError}</span>
                <button onClick={() => setUploadError(null)} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontSize: 18, padding: '0 4px', lineHeight: 1 }}>&times;</button>
              </div>
            )}
            {galleryUploading && (
              <div style={{ padding: '10px 16px', borderRadius: 8, marginTop: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(1,105,111,0.1)', border: '1px solid rgba(1,105,111,0.3)' }}>
                <span className="dashboard-spinner" style={{ width: 16, height: 16 }} /> Uploading file...
              </div>
            )}
            {/* Add buttons */}
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)', flexWrap: 'wrap' }}>
              <label className="btn btn--outline btn--sm" style={{ cursor: 'pointer' }}>
                <input type="file" accept="image/*" multiple onChange={async (e) => {
                  setGalleryUploading(true)
                  await handleGalleryUpload(e.target.files)
                  setGalleryUploading(false)
                }} style={{ display: 'none' }} />
                {galleryUploading ? 'Uploading...' : '+ Add Images'}
              </label>
              <label className="btn btn--outline btn--sm" style={{ cursor: 'pointer', position: 'relative' }}>
                <input type="file" accept=".pdf,application/pdf" multiple onChange={async (e) => {
                  const files = e.target.files
                  if (!files || files.length === 0) return
                  setUploadError(null)
                  setGalleryUploading(true)
                  for (const file of Array.from(files)) {
                    if (file.size > 10 * 1024 * 1024) {
                      setUploadError(`${file.name} is too large (max 10MB)`)
                      continue
                    }
                    const result = await upload(file, 'portfolio')
                    if (result) {
                      setPdfDocuments(prev => [...prev, { url: result, title: file.name.replace(/\.pdf$/i, '') }])
                      markDirty()
                    }
                  }
                  setGalleryUploading(false)
                  e.target.value = ''
                }} style={{ display: 'none' }} />
                {galleryUploading ? 'Uploading...' : '+ Add PDF'}
              </label>
              {showAddLink ? (
                <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-end', flexWrap: 'wrap', flex: 1 }}>
                  <div className="form-group" style={{ margin: 0, flex: 1, minWidth: 120 }}>
                    <label className="form-label" style={{ fontSize: 'var(--text-xs)' }}>URL</label>
                    <input className="form-input" value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)} placeholder="https://..." style={{ fontSize: 'var(--text-sm)' }} />
                  </div>
                  <div className="form-group" style={{ margin: 0, flex: 1, minWidth: 100 }}>
                    <label className="form-label" style={{ fontSize: 'var(--text-xs)' }}>Label</label>
                    <input className="form-input" value={newLinkLabel} onChange={e => setNewLinkLabel(e.target.value)} placeholder="My Website" style={{ fontSize: 'var(--text-sm)' }} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: 'var(--text-xs)' }}>Tile Image (optional)</label>
                    <label className="btn btn--ghost btn--sm" style={{ cursor: 'pointer', fontSize: 'var(--text-xs)' }}>
                      <input type="file" accept="image/*" onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const url = await upload(file, 'gallery')
                        if (url) setNewLinkThumbnail(url)
                      }} style={{ display: 'none' }} />
                      {newLinkThumbnail ? '✓ Image added' : '+ Image'}
                    </label>
                  </div>
                  <button className="btn btn--primary btn--sm" onClick={() => {
                    if (newLinkUrl.trim()) {
                      setMediaLinks(prev => [...prev, { label: newLinkLabel.trim() || 'Link', url: newLinkUrl.trim(), type: 'website' as const, thumbnail: newLinkThumbnail || undefined } as typeof prev[0]])
                      markDirty()
                      setNewLinkUrl('')
                      setNewLinkLabel('')
                      setNewLinkThumbnail(null)
                      setShowAddLink(false)
                    }
                  }}>Add</button>
                  <button className="btn btn--ghost btn--sm" onClick={() => { setShowAddLink(false); setNewLinkThumbnail(null) }}>Cancel</button>
                </div>
              ) : (
                <button className="btn btn--outline btn--sm" onClick={() => setShowAddLink(true)}>+ Add Link</button>
              )}
            </div>
          </div>
        </section>

        {/* Row 5: Milestones */}
        <div ref={setSectionRef('timeline')} className={`editable-section${activePanel === 'timeline' ? ' editable-section--active' : ''}`} onClick={() => openPanel('timeline')}>
          <section className="profile-milestones-section">
            <div className="container">
              <p className="section-label">Milestones</p>
              {timeline.length > 0 ? (
                <div className="profile-timeline">
                  {timeline.map((entry, i) => (
                    <div key={i} className="profile-timeline__entry">
                      <span className="profile-timeline__year-label">{entry.year}</span>
                      <div className="profile-timeline__content">
                        <strong>{entry.title}</strong>
                        {entry.organization && <span> — {entry.organization}</span>}
                        {entry.description && <p style={{ margin: 'var(--space-1) 0 0', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{entry.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="live-editor__empty-placeholder">
                  <span>Add career milestones</span>
                </div>
              )}
            </div>
          </section>
          <div className="editable-section__overlay"><span>Edit milestones</span></div>
        </div>
      </article>

      {/* Share Profile — show after save when profile is published or pending */}
      {savedMessage && (profileVisibility === 'published' || profileVisibility === 'pending') && slug && (
        <div className="container">
          <ShareProfile slug={slug} displayName={displayName} />
        </div>
      )}

      {/* Profile Checklist */}
      <ProfileChecklist
        hasAvatar={!!avatarUrl}
        hasBio={!!(bio && bio.length > 50)}
        hasSkills={profileSkills.length >= 3}
        hasAvailability={!!availabilityStatus}
        hasCover={!!coverImageUrl}
        hasProject={false}
        onEditSection={(section) => openPanel(section as EditSection)}
      />

      {/* Welcome overlay for brand new profiles */}
      {showWelcome && (
        <div className="live-editor__welcome-overlay">
          <div className="live-editor__welcome-card">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>
              Welcome to your profile!
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)', lineHeight: 1.6 }}>
              Click on any section to start building your profile. Add your photo, write your bio, and share your skills with the community.
            </p>
            <button className="btn btn--primary" onClick={() => setShowWelcome(false)}>
              Got it, let&apos;s go!
            </button>
          </div>
        </div>
      )}

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
              {uploadError && (
                <div style={{ background: 'rgba(220,38,38,0.1)', color: '#dc2626', padding: '8px 12px', borderRadius: 8, marginBottom: 12, fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{uploadError}</span>
                  <button onClick={() => setUploadError(null)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 16, padding: '0 4px' }}>&times;</button>
                </div>
              )}
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
                  {avatarRawSrc && (
                    <div style={{ marginTop: 'var(--space-4)' }}>
                      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Adjust &amp; Crop</p>
                      <div style={{ position: 'relative', width: '100%', maxWidth: 300, margin: '0 auto', overflow: 'hidden', borderRadius: 8, border: '1px solid var(--color-border)' }}>
                        <img src={avatarRawSrc} alt="Crop preview" style={{ width: '100%', display: 'block' }} />
                      </div>
                      <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', marginTop: 'var(--space-4)' }}>
                        <button className="btn btn--outline btn--sm" onClick={() => setAvatarRawSrc(null)}>Cancel</button>
                        <button className="btn btn--primary btn--sm" onClick={() => {
                          const img = new window.Image()
                          img.onload = () => {
                            const canvas = document.createElement('canvas')
                            const s = Math.min(img.width, img.height)
                            canvas.width = 400; canvas.height = 400
                            const ctx = canvas.getContext('2d')!
                            ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 400, 400)
                            canvas.toBlob(async (blob) => {
                              if (!blob) return
                              const croppedFile = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
                              const url = await upload(croppedFile, 'avatar')
                              if (url) {
                                setAvatarUrl(url)
                                setAvatarRawSrc(null)
                                markDirty()
                              }
                            }, 'image/jpeg', 0.85)
                          }
                          img.src = avatarRawSrc
                        }}>Crop &amp; Save</button>
                      </div>
                    </div>
                  )}
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
                  {/* Documents */}
                  <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-3)', color: 'rgba(255,255,255,0.8)' }}>Documents</h4>
                  <div className="form-group">
                    <label className="form-label">Portfolio PDF</label>
                    <input type="file" accept=".pdf,application/pdf" onChange={handlePortfolioPdfUpload} className="form-input" />
                    {portfolioPdfUrl && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)' }}>Portfolio uploaded</span>
                        <button type="button" onClick={() => { setPortfolioPdfUrl(null); markDirty() }} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 'var(--text-xs)' }}>Remove</button>
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Resume PDF</label>
                    <input type="file" accept=".pdf,application/pdf" onChange={handleResumeUpload} className="form-input" />
                    {resumeUrl && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)' }}>Resume uploaded</span>
                        <button type="button" onClick={() => { setResumeUrl(null); markDirty() }} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 'var(--text-xs)' }}>Remove</button>
                      </div>
                    )}
                  </div>

                  {/* Links */}
                  <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-3)', marginTop: 'var(--space-5)', color: 'rgba(255,255,255,0.8)' }}>Links</h4>
                  {mediaLinks.map((link, i) => (
                    <div key={i} style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                        <input type="text" className="form-input" placeholder="Label (e.g. Studio, Fundraiser)" value={link.label} onChange={e => updateMediaLink(i, 'label', e.target.value)} />
                        <input type="url" className="form-input" placeholder="https://..." value={link.url} onChange={e => updateMediaLink(i, 'url', e.target.value)} />
                        <select className="form-input" value={link.type} onChange={e => updateMediaLink(i, 'type', e.target.value)} style={{ width: '160px' }}>
                          <option value="website">Website</option>
                          <option value="fundraiser">Fundraiser</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <button type="button" onClick={() => removeMediaLink(i)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '18px', padding: '8px' }}>&times;</button>
                    </div>
                  ))}
                  <button type="button" onClick={addMediaLink} className="btn btn--outline btn--sm" style={{ marginBottom: 'var(--space-5)' }}>
                    + Add Link
                  </button>

                  {/* Gallery Images */}
                  <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-3)', marginTop: 'var(--space-3)', color: 'rgba(255,255,255,0.8)' }}>Gallery Images</h4>
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

        /* Welcome overlay */
        .live-editor__welcome-overlay {
          position: fixed;
          inset: 0;
          z-index: 2000;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-4);
          animation: fadeIn 0.3s ease-out;
        }
        .live-editor__welcome-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 16px;
          padding: var(--space-8);
          max-width: 440px;
          width: 100%;
          text-align: center;
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
