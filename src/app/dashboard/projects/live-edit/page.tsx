'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { Badge } from '@/components/ui/Badge'

type EditSection = 'hero' | 'overview' | 'gallery' | 'experience' | 'story' | 'goals' | 'classification' | 'team' | 'roles' | null

const DOMAINS = [
  'Architecture', 'Immersive Art', 'Ecological Design', 'Material Innovation',
  'Public Space', 'Community Infrastructure', 'Experimental Technology', 'Social Impact',
]
const PATHWAYS = [
  'Public Art', 'Exhibition/Cultural', 'Festival Installation', 'R&D',
  'Development/Commercial', 'Social Impact/Humanitarian',
]
const STAGES = ['Concept', 'Design Development', 'Engineering', 'Fundraising', 'Production']

const ROLE_OPTIONS = [
  'Lighting Designer', 'Sound Designer', 'Fabricator', 'Architect', 'Engineer',
  'Project Manager', 'Creative Director', 'Producer', 'Installation Artist',
  'Software Developer', 'Visual Designer', 'Curator', 'Photographer/Videographer', 'Other',
]

interface CollabRole {
  title: string
  customTitle: string
  description: string
  imageUrl: string | null
}

function emptyRole(): CollabRole {
  return { title: '', customTitle: '', description: '', imageUrl: null }
}

async function uploadFile(file: File, type: string): Promise<string | null> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', type)
  try {
    const res = await fetch('/api/upload', { method: 'POST', credentials: 'same-origin', body: formData })
    if (!res.ok) return null
    const data = await res.json()
    return data.url || null
  } catch {
    return null
  }
}

function LiveProjectEditorInner() {
  const { user, loading: authLoading } = useAuth()
  const searchParams = useSearchParams()
  const existingId = searchParams.get('id')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [savedMessage, setSavedMessage] = useState(false)
  const [activePanel, setActivePanel] = useState<EditSection>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [submissionId, setSubmissionId] = useState<string | null>(existingId)

  // Project fields — drive the live preview
  const [title, setTitle] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null)
  const [overviewLead, setOverviewLead] = useState('')
  const [overviewBody, setOverviewBody] = useState('')
  const [experience, setExperience] = useState('')
  const [story, setStory] = useState('')
  const [goals, setGoals] = useState<string[]>([])
  const [domains, setDomains] = useState<string[]>([])
  const [pathways, setPathways] = useState<string[]>([])
  const [stage, setStage] = useState('Concept')
  const [scale, setScale] = useState('')
  const [location, setLocation] = useState('')
  const [materials, setMaterials] = useState('')
  const [specialNeeds, setSpecialNeeds] = useState('')
  const [galleryImages, setGalleryImages] = useState<Array<{ url: string; alt: string }>>([])
  const [collaborators, setCollaborators] = useState<Array<{ name: string; role: string; photo: string | null }>>([])
  const [collabRoles, setCollabRoles] = useState<CollabRole[]>([emptyRole()])
  const [contactEmail, setContactEmail] = useState('')
  const [leadArtistName, setLeadArtistName] = useState('')

  const lastChangeTime = useRef(0)
  const markDirty = useCallback(() => { setHasChanges(true); lastChangeTime.current = Date.now() }, [])

  // Fetch existing project if editing
  useEffect(() => {
    if (authLoading) return
    if (!user) { window.location.href = '/login'; return }

    // Get user profile for defaults
    fetch('/api/user/profile', { credentials: 'same-origin' })
      .then(r => r.json())
      .then(data => {
        if (data.profile) {
          setLeadArtistName(data.profile.display_name || '')
          setContactEmail(data.profile.email || '')
        }
      })
      .catch(() => {})

    if (existingId) {
      // Fetch existing submission
      fetch(`/api/user/projects?id=${existingId}`, { credentials: 'same-origin' })
        .then(r => r.json())
        .then(data => {
          if (data.project) {
            const p = data.project
            setTitle(p.project_title || '')
            setShortDescription(p.one_sentence || '')
            setOverviewLead(p.vision || '')
            setOverviewBody(p.vision || '')
            setExperience(p.experience || '')
            setStory(p.story || '')
            setGoals(p.goals ? p.goals.split('\n').filter(Boolean) : [])
            setDomains(p.domains || [])
            setPathways(p.pathways || [])
            setStage(p.stage || 'Concept')
            setScale(p.scale || '')
            setLocation(p.location || '')
            setMaterials(p.materials || '')
            setSpecialNeeds(p.special_needs || '')
            // Parse collaboration_needs — could be JSON role array or plain text
            try {
              const parsed = JSON.parse(p.collaboration_needs || '[]')
              if (Array.isArray(parsed) && parsed.length > 0) {
                setCollabRoles(parsed.map((r: { title?: string; description?: string; image_url?: string }) => ({
                  title: ROLE_OPTIONS.includes(r.title || '') ? r.title || '' : 'Other',
                  customTitle: ROLE_OPTIONS.includes(r.title || '') ? '' : r.title || '',
                  description: r.description || '',
                  imageUrl: r.image_url || null,
                })))
              }
            } catch {
              // Legacy plain-text format — put it in first role's description
              if (p.collaboration_needs) {
                setCollabRoles([{ title: '', customTitle: '', description: p.collaboration_needs, imageUrl: null }])
              }
            }
            setLeadArtistName(p.artist_name || '')
            setContactEmail(p.artist_email || '')
            if (p.hero_image_data) setHeroImageUrl(p.hero_image_data)
          }
        })
        .catch(() => {})
    }

    setLoading(false)
  }, [user, authLoading, existingId])

  // Autosave every 15s with 2s debounce
  useEffect(() => {
    if (!hasChanges) return
    const timer = setInterval(() => {
      if (Date.now() - lastChangeTime.current < 2000) return
      saveDraft(true)
    }, 15000)
    return () => clearInterval(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasChanges])

  async function saveDraft(silent = false) {
    if (!title.trim()) {
      if (!silent) alert('Please enter a project title.')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/submit-project', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artistName: leadArtistName,
          artistEmail: contactEmail,
          artistBio: '',
          artistWebsite: '',
          projectTitle: title.trim(),
          oneSentence: shortDescription.trim(),
          vision: overviewLead.trim(),
          experience: experience.trim(),
          story: story.trim(),
          goals: goals.join('\n'),
          domains,
          pathways,
          stage,
          scale: scale.trim(),
          location: location.trim(),
          materials: materials.trim(),
          specialNeeds: specialNeeds.trim(),
          heroImageData: heroImageUrl,
          galleryImagesData: galleryImages.length > 0 ? JSON.stringify(galleryImages) : null,
          collaborationNeeds: JSON.stringify(
            collabRoles
              .filter(r => (r.title === 'Other' ? r.customTitle.trim() : r.title) && r.description.trim())
              .map(r => ({
                title: r.title === 'Other' ? r.customTitle.trim() : r.title,
                description: r.description.trim(),
                image_url: r.imageUrl,
              }))
          ),
          collaborationRoleCount: collabRoles.filter(r => r.title || r.customTitle).length || null,
          status: 'draft',
        }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.id && !submissionId) setSubmissionId(data.id)
        setHasChanges(false)
        if (!silent) {
          setSavedMessage(true)
          setTimeout(() => setSavedMessage(false), 3000)
        }
      }
    } catch {
      // silent fail
    }
    setSaving(false)
  }

  async function submitForReview() {
    if (!title.trim()) { alert('Please enter a project title.'); return }
    setSaving(true)
    try {
      const rolesData = collabRoles
        .filter(r => (r.title === 'Other' ? r.customTitle.trim() : r.title) && r.description.trim())
        .map(r => ({
          title: r.title === 'Other' ? r.customTitle.trim() : r.title,
          description: r.description.trim(),
          image_url: r.imageUrl,
        }))
      const res = await fetch('/api/submit-project', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: submissionId || undefined,
          artistName: leadArtistName,
          artistEmail: contactEmail,
          artistBio: '',
          artistWebsite: '',
          projectTitle: title.trim(),
          oneSentence: shortDescription.trim(),
          vision: overviewLead.trim(),
          experience: experience.trim(),
          story: story.trim(),
          goals: goals.join('\n'),
          domains,
          pathways,
          stage,
          scale: scale.trim(),
          location: location.trim(),
          materials: materials.trim(),
          specialNeeds: specialNeeds.trim(),
          heroImageData: heroImageUrl,
          galleryImagesData: galleryImages.length > 0 ? JSON.stringify(galleryImages) : null,
          collaborationNeeds: JSON.stringify(rolesData),
          collaborationRoleCount: rolesData.length || null,
          status: 'pending',
        }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.id && !submissionId) setSubmissionId(data.id)
        setHasChanges(false)
        setSavedMessage(true)
        setTimeout(() => setSavedMessage(false), 3000)
      }
    } catch { /* */ }
    setSaving(false)
  }

  async function handleHeroUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || file.size > 10 * 1024 * 1024) return
    setSaving(true)
    const url = await uploadFile(file, 'hero')
    if (url) {
      setHeroImageUrl(url)
      markDirty()
    }
    setSaving(false)
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return
    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) continue
      const url = await uploadFile(file, 'gallery')
      if (url) {
        setGalleryImages(prev => [...prev, { url, alt: file.name.replace(/\.[^.]+$/, '') }])
        markDirty()
      }
    }
  }

  function handlePhotoUpload(callback: (dataUrl: string) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file || file.size > 5 * 1024 * 1024) return
      const reader = new FileReader()
      reader.onload = () => {
        const img = new window.Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const maxW = 400
          const ratio = Math.min(maxW / img.width, 1)
          canvas.width = img.width * ratio
          canvas.height = img.height * ratio
          const ctx = canvas.getContext('2d')!
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          callback(canvas.toDataURL('image/jpeg', 0.8))
          markDirty()
        }
        img.src = reader.result as string
      }
      reader.readAsDataURL(file)
    }
  }

  function getRoleDisplayTitle(role: CollabRole): string {
    if (role.title === 'Other' && role.customTitle) return role.customTitle
    return role.title || 'New Role'
  }

  function openPanel(section: EditSection) { setActivePanel(section) }
  function closePanel() { setActivePanel(null) }

  if (authLoading || loading) {
    return (
      <div className="container" style={{ padding: 'var(--space-16) 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
      </div>
    )
  }
  if (!user) return null

  return (
    <div className="live-editor">
      {/* Toolbar */}
      <div className="live-editor__toolbar">
        <div className="live-editor__toolbar-inner container">
          <span className="live-editor__toolbar-title">Building Your Project</span>
          <div className="live-editor__toolbar-actions">
            {hasChanges && <span className="live-editor__unsaved">Unsaved changes</span>}
            {savedMessage && <span className="live-editor__saved">Saved!</span>}
            <button onClick={() => saveDraft(false)} className="btn btn--primary btn--sm" disabled={saving || !hasChanges}>
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button onClick={submitForReview} className="btn btn--outline btn--sm" disabled={saving || !title.trim()}>
              Submit for Review
            </button>
            {submissionId && (
              <a
                href={`/preview/project/${submissionId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--ghost btn--sm"
                onClick={async (e) => { if (hasChanges) { e.preventDefault(); await saveDraft(true); window.open(`/preview/project/${submissionId}`, '_blank') } }}
              >
                Preview
              </a>
            )}
            <button onClick={() => setSettingsOpen(true)} className="btn btn--ghost btn--sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              Settings
            </button>
            <Link href="/dashboard" className="btn btn--ghost btn--sm">Back</Link>
          </div>
        </div>
      </div>

      <article style={{ marginTop: '53px' }}>
        {/* Breadcrumb */}
        <nav className="breadcrumb container" style={{ paddingTop: 'var(--space-4)' }}>
          <Link href="/dashboard">Dashboard</Link> <span>/</span> <span>{title || 'New Project'}</span>
        </nav>

        {/* Hero */}
        <div className="editable-section" onClick={() => openPanel('hero')}>
          <section
            className="project-hero"
            style={heroImageUrl
              ? undefined
              : { background: 'linear-gradient(135deg, #01696F 0%, #01696Fcc 50%, #01696F88 100%)', position: 'relative', minHeight: 400 }
            }
          >
            {heroImageUrl && (
              <img
                src={heroImageUrl}
                alt="Hero"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}
            <div className="project-hero__overlay" />
            <div className="project-hero__content">
              <Badge variant="stage">{stage}</Badge>
              <h1 className="project-hero__title">
                {title || <span style={{ opacity: 0.5, fontStyle: 'italic' }}>Your Project Title</span>}
              </h1>
              <p className="project-hero__desc">
                {shortDescription || <span style={{ opacity: 0.5, fontStyle: 'italic' }}>A one-sentence description of your project</span>}
              </p>
            </div>
          </section>
          <div className="editable-section__overlay"><span>Edit hero</span></div>
        </div>

        {/* Overview */}
        <div className="editable-section" onClick={() => openPanel('overview')}>
          <section className="project-overview">
            <div className="container">
              <p className="section-label">The Vision</p>
              <div className="overview-grid">
                <div>
                  {overviewLead
                    ? <p className="overview-lead">{overviewLead}</p>
                    : <p className="overview-lead" style={{ opacity: 0.4, fontStyle: 'italic' }}>Describe your vision...</p>
                  }
                  {overviewBody && <p className="overview-body">{overviewBody}</p>}
                </div>
                <aside className="overview-stats">
                  <div className="overview-stat">
                    <p className="overview-stat__label">Lead Creator</p>
                    <p className="overview-stat__value">{leadArtistName || 'You'}</p>
                  </div>
                  <div className="overview-stat">
                    <p className="overview-stat__label">Stage</p>
                    <p className="overview-stat__value">{stage}</p>
                  </div>
                  {scale && (
                    <div className="overview-stat">
                      <p className="overview-stat__label">Scale</p>
                      <p className="overview-stat__value">{scale}</p>
                    </div>
                  )}
                  {location && (
                    <div className="overview-stat">
                      <p className="overview-stat__label">Location</p>
                      <p className="overview-stat__value">{location}</p>
                    </div>
                  )}
                  {pathways.length > 0 && (
                    <div className="overview-stat">
                      <p className="overview-stat__label">Pathways</p>
                      <p className="overview-stat__value">{pathways.join(' \u00b7 ')}</p>
                    </div>
                  )}
                </aside>
              </div>
            </div>
          </section>
          <div className="editable-section__overlay"><span>Edit overview</span></div>
        </div>

        {/* Gallery */}
        <div className="editable-section" onClick={() => openPanel('gallery')}>
          {galleryImages.length > 0 ? (
            <section style={{ padding: 'var(--space-8) 0' }}>
              <div className="container">
                <p className="section-label">Gallery</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
                  {galleryImages.map((img, i) => (
                    <div key={i} style={{ borderRadius: 8, overflow: 'hidden', aspectRatio: '4/3' }}>
                      <img src={img.url} alt={img.alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : (
            <section style={{ padding: 'var(--space-8) 0' }}>
              <div className="container">
                <div className="live-editor__empty-placeholder"><span>Add gallery images</span></div>
              </div>
            </section>
          )}
          <div className="editable-section__overlay"><span>Edit gallery</span></div>
        </div>

        {/* Experience */}
        <div className="editable-section" onClick={() => openPanel('experience')}>
          <section className="project-experience">
            <div className="container">
              <p className="section-label">The Experience</p>
              <h2>What It Feels Like</h2>
              {experience
                ? <p className="overview-body">{experience}</p>
                : <p style={{ opacity: 0.4, fontStyle: 'italic' }}>Describe what it feels like to experience your project...</p>
              }
            </div>
          </section>
          <div className="editable-section__overlay"><span>Edit experience</span></div>
        </div>

        {/* Story */}
        <div className="editable-section" onClick={() => openPanel('story')}>
          <section className="project-story">
            <div className="container">
              <p className="section-label">Origin</p>
              <h2>The Story Behind It</h2>
              {story
                ? <p className="overview-body">{story}</p>
                : <p style={{ opacity: 0.4, fontStyle: 'italic' }}>Tell the story behind your project...</p>
              }
            </div>
          </section>
          <div className="editable-section__overlay"><span>Edit story</span></div>
        </div>

        {/* Goals */}
        <div className="editable-section" onClick={() => openPanel('goals')}>
          <section className="project-goals">
            <div className="container">
              <p className="section-label">Ambition</p>
              <h2>What We&apos;re Working Toward</h2>
              {goals.length > 0 ? (
                <ul className="goals-list">
                  {goals.map((g, i) => <li key={i} className="goals-list__item">{g}</li>)}
                </ul>
              ) : (
                <p style={{ opacity: 0.4, fontStyle: 'italic' }}>Add your project goals...</p>
              )}
            </div>
          </section>
          <div className="editable-section__overlay"><span>Edit goals</span></div>
        </div>

        {/* Classification */}
        <div className="editable-section" onClick={() => openPanel('classification')}>
          <section className="project-classification">
            <div className="container">
              <p className="section-label">DNA</p>
              <div className="classification-grid">
                <div className="classification-item">
                  <h3>Domains</h3>
                  <div className="badges-group">
                    {domains.length > 0
                      ? domains.map(d => <Badge key={d} variant="domain">{d}</Badge>)
                      : <span style={{ opacity: 0.4, fontSize: 'var(--text-sm)' }}>Select domains</span>
                    }
                  </div>
                </div>
                <div className="classification-item">
                  <h3>Pathways</h3>
                  <div className="badges-group">
                    {pathways.length > 0
                      ? pathways.map(p => <Badge key={p} variant="pathway">{p}</Badge>)
                      : <span style={{ opacity: 0.4, fontSize: 'var(--text-sm)' }}>Select pathways</span>
                    }
                  </div>
                </div>
                <div className="classification-item">
                  <h3>Stage</h3>
                  <Badge variant="stage">{stage}</Badge>
                </div>
              </div>
            </div>
          </section>
          <div className="editable-section__overlay"><span>Edit classification</span></div>
        </div>

        {/* Team */}
        <div className="editable-section" onClick={() => openPanel('team')}>
          <section className="project-artist">
            <div className="container">
              <p className="section-label">The People Behind It</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 'var(--space-4)' }}>
                <div style={{ padding: 'var(--space-4)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-2)', fontWeight: 700 }}>
                    {(leadArtistName || 'Y').charAt(0).toUpperCase()}
                  </div>
                  <strong style={{ fontSize: 'var(--text-sm)' }}>{leadArtistName || 'You'}</strong>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', margin: 'var(--space-1) 0 0' }}>Lead Creator</p>
                </div>
                {collaborators.map((c, i) => (
                  <div key={i} style={{ padding: 'var(--space-4)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                    {c.photo ? (
                      <img src={c.photo} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', margin: '0 auto var(--space-2)' }} />
                    ) : (
                      <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--color-surface)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-2)', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                        {(c.name || '?').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <strong style={{ fontSize: 'var(--text-sm)' }}>{c.name || 'Team Member'}</strong>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', margin: 'var(--space-1) 0 0' }}>{c.role}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
          <div className="editable-section__overlay"><span>Edit team</span></div>
        </div>

        {/* Collaboration Roles */}
        <div className="editable-section" onClick={() => openPanel('roles')}>
          <section className="project-collab">
            <div className="container">
              <p className="section-label">Join This Project</p>
              <h2>Open Roles</h2>
              {collabRoles.some(r => r.title || r.customTitle) ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
                  {collabRoles.filter(r => r.title || r.customTitle).map((role, i) => (
                    <div key={i} className="collab-role-card" style={{ cursor: 'default' }}>
                      <div className="collab-role-card__header">
                        <span className="collab-role-card__number">{getRoleDisplayTitle(role)}</span>
                      </div>
                      <div className="collab-role-card__body">
                        {role.description && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 0 }}>{role.description}</p>}
                        {role.imageUrl && (
                          <img src={role.imageUrl} alt="" style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8, marginTop: 'var(--space-2)' }} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ opacity: 0.4, fontStyle: 'italic' }}>Add collaboration roles you&apos;re looking to fill...</p>
              )}
            </div>
          </section>
          <div className="editable-section__overlay"><span>Edit roles</span></div>
        </div>
      </article>

      {/* Slide-in Panel */}
      {activePanel && (
        <>
          <div className="live-editor__panel-backdrop" onClick={closePanel} />
          <div className="live-editor__panel">
            <div className="live-editor__panel-header">
              <h3 className="live-editor__panel-title">
                {activePanel === 'hero' && 'Hero Image & Title'}
                {activePanel === 'overview' && 'Project Overview'}
                {activePanel === 'gallery' && 'Gallery Images'}
                {activePanel === 'experience' && 'The Experience'}
                {activePanel === 'story' && 'The Story'}
                {activePanel === 'goals' && 'Goals'}
                {activePanel === 'classification' && 'Classification'}
                {activePanel === 'team' && 'Team'}
                {activePanel === 'roles' && 'Collaboration'}
              </h3>
              <button className="live-editor__panel-close" onClick={closePanel}>&times;</button>
            </div>
            <div className="live-editor__panel-body">

              {/* HERO PANEL */}
              {activePanel === 'hero' && (
                <div className="live-editor__panel-section">
                  <div className="form-group">
                    <label className="form-label">Project Title *</label>
                    <input
                      className="form-input"
                      value={title}
                      onChange={e => { setTitle(e.target.value); markDirty() }}
                      placeholder="Your project title"
                      maxLength={200}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">One-Sentence Description</label>
                    <input
                      className="form-input"
                      value={shortDescription}
                      onChange={e => { setShortDescription(e.target.value); markDirty() }}
                      placeholder="What is this project in one sentence?"
                      maxLength={300}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Hero Image</label>
                    {heroImageUrl && (
                      <img
                        src={heroImageUrl}
                        alt="Hero preview"
                        style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8, marginBottom: 'var(--space-3)' }}
                      />
                    )}
                    <label className="live-editor__upload-zone">
                      <input type="file" accept="image/*" onChange={handleHeroUpload} style={{ display: 'none' }} />
                      <span>{heroImageUrl ? 'Replace Hero Image' : 'Upload Hero Image'}</span>
                      <small>Recommended: 1600x900px</small>
                    </label>
                  </div>
                </div>
              )}

              {/* OVERVIEW PANEL */}
              {activePanel === 'overview' && (
                <div className="live-editor__panel-section">
                  <div className="form-group">
                    <label className="form-label">Vision (lead text)</label>
                    <textarea
                      className="form-textarea"
                      value={overviewLead}
                      onChange={e => { setOverviewLead(e.target.value); markDirty() }}
                      rows={4}
                      placeholder="What is your vision for this project?"
                      maxLength={2000}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Detailed Description</label>
                    <textarea
                      className="form-textarea"
                      value={overviewBody}
                      onChange={e => { setOverviewBody(e.target.value); markDirty() }}
                      rows={6}
                      placeholder="Describe your project in detail..."
                      maxLength={5000}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stage</label>
                    <select className="form-input" value={stage} onChange={e => { setStage(e.target.value); markDirty() }}>
                      {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                    <div className="form-group">
                      <label className="form-label">Scale</label>
                      <input
                        className="form-input"
                        value={scale}
                        onChange={e => { setScale(e.target.value); markDirty() }}
                        placeholder="e.g. Large outdoor installation"
                        maxLength={200}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Location</label>
                      <input
                        className="form-input"
                        value={location}
                        onChange={e => { setLocation(e.target.value); markDirty() }}
                        placeholder="City, region, or TBD"
                        maxLength={200}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* GALLERY PANEL */}
              {activePanel === 'gallery' && (
                <div className="live-editor__panel-section">
                  {galleryImages.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                      {galleryImages.map((img, i) => (
                        <div key={i} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden' }}>
                          <img src={img.url} alt={img.alt} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover' }} />
                          <button
                            onClick={() => { setGalleryImages(prev => prev.filter((_, j) => j !== i)); markDirty() }}
                            style={{
                              position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: 4,
                              background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                            }}
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <label className="live-editor__upload-zone">
                    <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} style={{ display: 'none' }} />
                    <span>Upload Gallery Images</span>
                    <small>Select multiple images</small>
                  </label>
                </div>
              )}

              {/* EXPERIENCE PANEL */}
              {activePanel === 'experience' && (
                <div className="live-editor__panel-section">
                  <div className="form-group">
                    <label className="form-label">What It Feels Like</label>
                    <textarea
                      className="form-textarea"
                      value={experience}
                      onChange={e => { setExperience(e.target.value); markDirty() }}
                      rows={8}
                      placeholder="Describe the sensory and emotional experience of your project..."
                      maxLength={5000}
                    />
                  </div>
                </div>
              )}

              {/* STORY PANEL */}
              {activePanel === 'story' && (
                <div className="live-editor__panel-section">
                  <div className="form-group">
                    <label className="form-label">The Story Behind It</label>
                    <textarea
                      className="form-textarea"
                      value={story}
                      onChange={e => { setStory(e.target.value); markDirty() }}
                      rows={8}
                      placeholder="What inspired this project? What's the origin story?"
                      maxLength={5000}
                    />
                  </div>
                </div>
              )}

              {/* GOALS PANEL */}
              {activePanel === 'goals' && (
                <div className="live-editor__panel-section">
                  <div className="form-group">
                    <label className="form-label">Project Goals</label>
                    {goals.map((g, i) => (
                      <div key={i} style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                        <input
                          className="form-input"
                          value={g}
                          onChange={e => { const updated = [...goals]; updated[i] = e.target.value; setGoals(updated); markDirty() }}
                          style={{ flex: 1 }}
                        />
                        <button className="btn btn--ghost btn--sm" onClick={() => { setGoals(goals.filter((_, j) => j !== i)); markDirty() }}>&times;</button>
                      </div>
                    ))}
                    <button className="btn btn--outline btn--sm" onClick={() => { setGoals([...goals, '']); markDirty() }}>+ Add Goal</button>
                  </div>
                </div>
              )}

              {/* CLASSIFICATION PANEL */}
              {activePanel === 'classification' && (
                <div className="live-editor__panel-section">
                  <div className="form-group">
                    <label className="form-label">Domains</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                      {DOMAINS.map(d => (
                        <button
                          key={d}
                          className={`inline-editor__type-option${domains.includes(d) ? ' inline-editor__type-option--active' : ''}`}
                          onClick={() => { setDomains(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]); markDirty() }}
                          style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-1) var(--space-3)' }}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pathways</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                      {PATHWAYS.map(p => (
                        <button
                          key={p}
                          className={`inline-editor__type-option${pathways.includes(p) ? ' inline-editor__type-option--active' : ''}`}
                          onClick={() => { setPathways(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]); markDirty() }}
                          style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-1) var(--space-3)' }}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stage</label>
                    <select className="form-input" value={stage} onChange={e => { setStage(e.target.value); markDirty() }}>
                      {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {/* TEAM PANEL */}
              {activePanel === 'team' && (
                <div className="live-editor__panel-section">
                  <div className="form-group">
                    <label className="form-label">Lead Creator</label>
                    <input
                      className="form-input"
                      value={leadArtistName}
                      onChange={e => { setLeadArtistName(e.target.value); markDirty() }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Team Members</label>
                    {collaborators.map((c, i) => (
                      <div key={i} className="collab-role-card" style={{ marginBottom: 'var(--space-3)' }}>
                        <div className="collab-role-card__header">
                          <span className="collab-role-card__number">{c.name || 'Team Member'}</span>
                          <button className="collab-role-card__delete" onClick={() => { setCollaborators(collaborators.filter((_, j) => j !== i)); markDirty() }}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                          </button>
                        </div>
                        <div className="collab-role-card__body">
                          <div className="form-group">
                            <label className="form-label">Name</label>
                            <input className="form-input" placeholder="Name" value={c.name}
                              onChange={e => { const u = [...collaborators]; u[i] = { ...u[i], name: e.target.value }; setCollaborators(u); markDirty() }} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Role</label>
                            <input className="form-input" placeholder="Role" value={c.role}
                              onChange={e => { const u = [...collaborators]; u[i] = { ...u[i], role: e.target.value }; setCollaborators(u); markDirty() }} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Photo (optional)</label>
                            {c.photo && <img src={c.photo} alt="" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', marginBottom: 'var(--space-2)' }} />}
                            <input type="file" accept="image/*" className="form-input"
                              onChange={handlePhotoUpload(url => { const u = [...collaborators]; u[i] = { ...u[i], photo: url }; setCollaborators(u) })} />
                          </div>
                        </div>
                      </div>
                    ))}
                    <button className="add-role-btn" onClick={() => { setCollaborators([...collaborators, { name: '', role: '', photo: null }]); markDirty() }}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5"/><path d="M10 6v8M6 10h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      Add Team Member
                    </button>
                  </div>
                </div>
              )}

              {/* ROLES PANEL */}
              {activePanel === 'roles' && (
                <div className="live-editor__panel-section">
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
                    Define the roles you need filled. Each role will appear as a card on your project page.
                  </p>

                  {collabRoles.map((role, i) => (
                    <div key={i} className="collab-role-card" style={{ marginBottom: 'var(--space-3)' }}>
                      <div className="collab-role-card__header">
                        <span className="collab-role-card__number">{getRoleDisplayTitle(role)}</span>
                        <button className="collab-role-card__delete" onClick={() => {
                          if (collabRoles.length <= 1) { setCollabRoles([emptyRole()]); markDirty() }
                          else { setCollabRoles(collabRoles.filter((_, j) => j !== i)); markDirty() }
                        }}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                        </button>
                      </div>
                      <div className="collab-role-card__body">
                        <div className="form-group">
                          <label className="form-label">Role</label>
                          <select className="form-select" value={role.title}
                            onChange={e => { const u = [...collabRoles]; u[i] = { ...u[i], title: e.target.value }; setCollabRoles(u); markDirty() }}>
                            <option value="">Select a role...</option>
                            {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </div>
                        {role.title === 'Other' && (
                          <div className="form-group">
                            <label className="form-label">Custom role title</label>
                            <input className="form-input" value={role.customTitle} placeholder="e.g. Kinetic Sculptor"
                              onChange={e => { const u = [...collabRoles]; u[i] = { ...u[i], customTitle: e.target.value }; setCollabRoles(u); markDirty() }} />
                          </div>
                        )}
                        <div className="form-group">
                          <label className="form-label">Description</label>
                          <textarea className="form-textarea" rows={3} value={role.description} placeholder="What will this collaborator do?"
                            onChange={e => { const u = [...collabRoles]; u[i] = { ...u[i], description: e.target.value }; setCollabRoles(u); markDirty() }} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Reference image (optional)</label>
                          {role.imageUrl && <img src={role.imageUrl} alt="" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 'var(--space-2)' }} />}
                          <input type="file" accept="image/*" className="form-input"
                            onChange={handlePhotoUpload(url => { const u = [...collabRoles]; u[i] = { ...u[i], imageUrl: url }; setCollabRoles(u) })} />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button className="add-role-btn" onClick={() => { setCollabRoles([...collabRoles, emptyRole()]); markDirty() }}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5"/><path d="M10 6v8M6 10h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    Add Collaboration Role
                  </button>

                  <div style={{ borderTop: '1px solid var(--color-border)', marginTop: 'var(--space-5)', paddingTop: 'var(--space-4)' }}>
                    <div className="form-group">
                      <label className="form-label">Contact Email</label>
                      <input className="form-input" type="email" value={contactEmail}
                        onChange={e => { setContactEmail(e.target.value); markDirty() }} placeholder="your@email.com" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Materials &amp; Technical Needs</label>
                      <textarea className="form-textarea" value={materials} rows={3}
                        onChange={e => { setMaterials(e.target.value); markDirty() }}
                        placeholder="Any specific materials, equipment, or technical requirements?" maxLength={5000} />
                    </div>
                  </div>
                </div>
              )}

            </div>
            <div className="live-editor__panel-footer">
              <button className="btn btn--primary btn--sm" onClick={closePanel}>Done</button>
            </div>
          </div>
        </>
      )}

      {/* Project Settings Panel */}
      {settingsOpen && (
        <>
          <div className="live-editor__panel-backdrop" onClick={() => setSettingsOpen(false)} />
          <div className="live-editor__panel" style={{ width: 'min(560px, 90vw)' }}>
            <div className="live-editor__panel-header">
              <h3 className="live-editor__panel-title">Project Settings</h3>
              <button className="live-editor__panel-close" onClick={() => setSettingsOpen(false)}>&times;</button>
            </div>
            <div className="live-editor__panel-body">
              {/* Basic Info */}
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-4)' }}>Basic Info</h4>
                <div className="form-group">
                  <label className="form-label">Project Title *</label>
                  <input className="form-input" value={title} onChange={e => { setTitle(e.target.value); markDirty() }} maxLength={200} />
                </div>
                <div className="form-group">
                  <label className="form-label">One-Sentence Description</label>
                  <input className="form-input" value={shortDescription} onChange={e => { setShortDescription(e.target.value); markDirty() }} maxLength={300} />
                </div>
                <div className="form-group">
                  <label className="form-label">Vision</label>
                  <textarea className="form-textarea" value={overviewLead} onChange={e => { setOverviewLead(e.target.value); markDirty() }} rows={4} maxLength={5000} />
                </div>
              </div>

              {/* Details */}
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-4)' }}>Details</h4>
                <div className="form-group">
                  <label className="form-label">Experience (What It Feels Like)</label>
                  <textarea className="form-textarea" value={experience} onChange={e => { setExperience(e.target.value); markDirty() }} rows={4} maxLength={5000} />
                </div>
                <div className="form-group">
                  <label className="form-label">Story (The Story Behind It)</label>
                  <textarea className="form-textarea" value={story} onChange={e => { setStory(e.target.value); markDirty() }} rows={4} maxLength={5000} />
                </div>
                <div className="form-group">
                  <label className="form-label">Goals (one per line)</label>
                  <textarea className="form-textarea" value={goals.join('\n')} onChange={e => { setGoals(e.target.value.split('\n').filter(Boolean)); markDirty() }} rows={4} />
                </div>
              </div>

              {/* Classification */}
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-4)' }}>Classification</h4>
                <div className="form-group">
                  <label className="form-label">Domains</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                    {DOMAINS.map(d => (
                      <button key={d} type="button" className={`inline-editor__type-option${domains.includes(d) ? ' inline-editor__type-option--active' : ''}`} style={{ fontSize: 'var(--text-xs)', padding: '4px 12px' }} onClick={() => { setDomains(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]); markDirty() }}>{d}</button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Pathways</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                    {PATHWAYS.map(p => (
                      <button key={p} type="button" className={`inline-editor__type-option${pathways.includes(p) ? ' inline-editor__type-option--active' : ''}`} style={{ fontSize: 'var(--text-xs)', padding: '4px 12px' }} onClick={() => { setPathways(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]); markDirty() }}>{p}</button>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
                  <div className="form-group">
                    <label className="form-label">Stage</label>
                    <select className="form-input" value={stage} onChange={e => { setStage(e.target.value); markDirty() }}>
                      {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Scale</label>
                    <input className="form-input" value={scale} onChange={e => { setScale(e.target.value); markDirty() }} maxLength={200} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input className="form-input" value={location} onChange={e => { setLocation(e.target.value); markDirty() }} maxLength={200} />
                  </div>
                </div>
              </div>

              {/* Collaboration */}
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-4)' }}>Collaboration</h4>
                <div className="form-group">
                  <label className="form-label">Materials &amp; Technical Needs</label>
                  <textarea className="form-textarea" value={materials} onChange={e => { setMaterials(e.target.value); markDirty() }} rows={3} maxLength={5000} />
                </div>
                <div className="form-group">
                  <label className="form-label">Special Needs</label>
                  <textarea className="form-textarea" value={specialNeeds} onChange={e => { setSpecialNeeds(e.target.value); markDirty() }} rows={3} maxLength={5000} />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Email</label>
                  <input className="form-input" type="email" value={contactEmail} onChange={e => { setContactEmail(e.target.value); markDirty() }} />
                </div>
              </div>
            </div>
            <div className="live-editor__panel-footer">
              <button className="btn btn--primary btn--sm" onClick={() => setSettingsOpen(false)}>Done</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function LiveProjectEditorPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: 'var(--space-16) 0', textAlign: 'center' }}><p>Loading...</p></div>}>
      <LiveProjectEditorInner />
    </Suspense>
  )
}
