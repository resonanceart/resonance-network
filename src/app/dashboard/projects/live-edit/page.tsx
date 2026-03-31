'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { Badge } from '@/components/ui/Badge'
import { SmartGallery, type GalleryItem as SmartGalleryItem } from '@/components/profile/SmartGallery'

type EditSection = 'hero' | 'overview' | 'gallery' | 'description' | 'experience' | 'inclusivity' | 'materials_regen' | 'story' | 'goals' | 'classification' | 'team' | 'roles' | null

const DOMAINS = [
  'Architecture', 'Immersive Art', 'Ecological Design', 'Material Innovation',
  'Public Space', 'Community Infrastructure', 'Experimental Technology', 'Social Impact',
  'Other',
]
const PATHWAYS = [
  'Public Art', 'Exhibition/Cultural', 'Festival Installation', 'R&D',
  'Development/Commercial', 'Social Impact/Humanitarian', 'Other',
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
  skills: string
  description: string
  imageUrl: string | null
}

function emptyRole(): CollabRole {
  return { title: '', customTitle: '', skills: '', description: '', imageUrl: null }
}

function compressImage(file: File, maxWidth: number, quality: number): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new window.Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ratio = Math.min(maxWidth / img.width, 1)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}

function LiveProjectEditorInner() {
  const { user, loading: authLoading } = useAuth()
  const searchParams = useSearchParams()
  const existingId = searchParams.get('id')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [savedMessage, setSavedMessage] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [activePanel, setActivePanel] = useState<EditSection>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [submissionId, setSubmissionId] = useState<string | null>(existingId)

  // Project fields — drive the live preview
  const [title, setTitle] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null)
  const [heroPositionY, setHeroPositionY] = useState(50)
  const [isDraggingHero, setIsDraggingHero] = useState(false)
  const heroDragStartY = useRef(0)
  const heroDragStartPos = useRef(50)
  const [overviewLead, setOverviewLead] = useState('')
  const [overviewBody, setOverviewBody] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [experience, setExperience] = useState('')
  const [inclusivityStatement, setInclusivityStatement] = useState('')
  const [materialsRegen, setMaterialsRegen] = useState('')
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
  const [projectPdfs, setProjectPdfs] = useState<Array<{ url: string; title: string; thumbnail?: string }>>([])
  const [projectLinks, setProjectLinks] = useState<Array<{ url: string; label: string; thumbnail?: string }>>([])
  const [collaborators, setCollaborators] = useState<Array<{ name: string; role: string; photo: string | null }>>([])
  const [collabRoles, setCollabRoles] = useState<CollabRole[]>([emptyRole()])
  const [contactEmail, setContactEmail] = useState('')
  const [projectContactEmail, setProjectContactEmail] = useState('')
  const [contactMethod, setContactMethod] = useState('email') // email, form, website
  const [leadArtistName, setLeadArtistName] = useState('')
  const [creatorAvatarUrl, setCreatorAvatarUrl] = useState<string | null>(null)
  const [galleryOrder, setGalleryOrder] = useState<string[]>([]) // ordered list of item IDs for cross-type reordering
  const [showProjectAddLink, setShowProjectAddLink] = useState(false)
  const [newProjectLinkUrl, setNewProjectLinkUrl] = useState('')
  const [newProjectLinkLabel, setNewProjectLinkLabel] = useState('')
  const [galleryUploading, setGalleryUploading] = useState(false)
  const [projectSocialLinks, setProjectSocialLinks] = useState<Array<{platform: string; url: string}>>([])
  const [showAddProjectSocial, setShowAddProjectSocial] = useState(false)
  const [newSocialPlatform, setNewSocialPlatform] = useState('instagram')
  const [newSocialUrl, setNewSocialUrl] = useState('')

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
          if (data.profile.avatar_url) setCreatorAvatarUrl(data.profile.avatar_url)
        }
      })
      .catch(() => {})

    // Always check for existing submissions — load most recent draft if no ID specified
    {
      fetch('/api/user/projects', { credentials: 'include' })
        .then(r => r.json())
        .then(data => {
          const submissions = data.submissions || []
          // If an ID was specified, load that one. Otherwise, load the most recent draft.
          const p = existingId
            ? submissions.find((s: Record<string, unknown>) => s.id === existingId)
            : submissions.find((s: Record<string, unknown>) => s.status === 'draft') || submissions[0]
          if (p) {
            setSubmissionId(p.id as string)
            setTitle(p.project_title || '')
            setShortDescription(p.one_sentence || '')
            // Split vision into lead (first paragraph) and body (rest)
            if (p.vision) {
              const parts = p.vision.split('\n\n')
              setOverviewLead(parts[0] || '')
              setOverviewBody(parts.slice(1).join('\n\n') || '')
            }
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
                setCollabRoles(parsed.map((r: Record<string, unknown>) => ({
                  title: ROLE_OPTIONS.includes(String(r.title || '')) ? String(r.title || '') : (r.title ? 'Other' : ''),
                  customTitle: String(r.customTitle || (!ROLE_OPTIONS.includes(String(r.title || '')) ? r.title : '') || ''),
                  skills: String(r.skills || ''),
                  description: String(r.description || ''),
                  imageUrl: (r.image_url as string) || null,
                })))
              }
            } catch {
              // Legacy plain-text format — put it in first role's description
              if (p.collaboration_needs) {
                setCollabRoles([{ title: '', customTitle: '', skills: '', description: p.collaboration_needs, imageUrl: null }])
              }
            }
            setLeadArtistName(p.artist_name || '')
            setContactEmail(p.artist_email || '')
            setProjectContactEmail(p.artist_email || '')
            if (p.hero_image_data) setHeroImageUrl(p.hero_image_data)
            if (p.gallery_images_data) {
              try {
                const parsed = JSON.parse(p.gallery_images_data)
                if (Array.isArray(parsed)) {
                  // Legacy format — array of images only
                  setGalleryImages(parsed)
                } else if (parsed && typeof parsed === 'object') {
                  // New format — { images, pdfs, links }
                  if (Array.isArray(parsed.images)) setGalleryImages(parsed.images)
                  if (Array.isArray(parsed.pdfs)) setProjectPdfs(parsed.pdfs)
                  if (Array.isArray(parsed.links)) setProjectLinks(parsed.links)
                  if (Array.isArray(parsed.socialLinks)) setProjectSocialLinks(parsed.socialLinks)
                  if (typeof parsed.heroPositionY === 'number') setHeroPositionY(parsed.heroPositionY)
                  if (parsed.projectDescription) setProjectDescription(parsed.projectDescription)
                  if (parsed.inclusivityStatement) setInclusivityStatement(parsed.inclusivityStatement)
                  if (parsed.materialsRegen) setMaterialsRegen(parsed.materialsRegen)
                  if (Array.isArray(parsed.galleryOrder)) setGalleryOrder(parsed.galleryOrder)
                }
              } catch { /* */ }
            }
            // Load team members
            if (Array.isArray(p.team_members) && p.team_members.length > 0) {
              setCollaborators(p.team_members.map((t: { name: string; role: string; photo: string | null }) => ({
                name: t.name || '', role: t.role || '', photo: t.photo || null,
              })))
            }
          }
        })
        .catch(() => {})
    }

    setLoading(false)
  }, [user, authLoading, existingId])

  // Keep a ref to the latest saveDraft function to avoid stale closures
  const saveDraftRef = useRef(saveDraft)
  useEffect(() => { saveDraftRef.current = saveDraft })

  // Autosave every 5s with 2s debounce after last change
  useEffect(() => {
    if (!hasChanges) return
    const timer = setInterval(() => {
      if (Date.now() - lastChangeTime.current < 2000) return
      saveDraftRef.current(true)
    }, 5000)
    return () => clearInterval(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasChanges])

  async function saveDraft(silent = false) {
    if (!title.trim()) {
      if (!silent) alert('Please enter a project title.')
      return
    }
    setSaving(true)
    setErrorMessage(null)
    try {
      const rolesJson = JSON.stringify(
        collabRoles
          .filter(r => (r.title === 'Other' ? r.customTitle.trim() : r.title))
          .map(r => ({
            title: r.title === 'Other' ? r.customTitle.trim() : r.title,
            customTitle: r.customTitle?.trim() || '',
            description: r.description.trim(),
            skills: r.skills?.trim() || '',
            image_url: r.imageUrl,
          }))
      )
      const res = await fetch('/api/submit-project', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: submissionId || undefined,
          artistName: leadArtistName || 'Unknown',
          artistEmail: projectContactEmail || contactEmail || 'unknown@placeholder.com',
          artistBio: '',
          artistWebsite: '',
          projectTitle: title.trim(),
          oneSentence: shortDescription.trim(),
          vision: [overviewLead.trim(), overviewBody.trim()].filter(Boolean).join('\n\n'),
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
          galleryImagesData: (galleryImages.length > 0 || projectPdfs.length > 0 || projectLinks.length > 0 || projectSocialLinks.length > 0)
            ? JSON.stringify({ images: galleryImages, pdfs: projectPdfs, links: projectLinks, socialLinks: projectSocialLinks, heroPositionY, projectDescription: projectDescription.trim() || undefined, inclusivityStatement: inclusivityStatement.trim() || undefined, materialsRegen: materialsRegen.trim() || undefined, galleryOrder: galleryOrder.length > 0 ? galleryOrder : undefined })
            : (projectDescription.trim() ? JSON.stringify({ projectDescription: projectDescription.trim() }) : null),
          collaborationNeeds: rolesJson,
          collaborationRoleCount: collabRoles.filter(r => r.title || r.customTitle).length || null,
          teamMembers: collaborators.filter(c => c.name.trim()).map(c => ({ name: c.name.trim(), role: c.role.trim(), photo: c.photo })),
          status: 'draft',
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        console.error('Draft save failed:', res.status, data)
        if (!silent) setErrorMessage(data.message || `Save failed (${res.status})`)
        setSaving(false)
        return
      }
      const data = await res.json()
      if (data.id) setSubmissionId(data.id)
      setHasChanges(false)
      if (!silent) {
        setSavedMessage(true)
        setTimeout(() => setSavedMessage(false), 3000)
      }
    } catch (err) {
      console.error('Draft save error:', err)
      if (!silent) setErrorMessage('Network error. Please try again.')
    }
    setSaving(false)
  }

  async function submitForReview() {
    if (!title.trim()) { alert('Please enter a project title.'); return }
    setSaving(true)
    setErrorMessage(null)
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
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: submissionId || undefined,
          artistName: leadArtistName || 'Unknown',
          artistEmail: projectContactEmail || contactEmail || 'unknown@placeholder.com',
          artistBio: '',
          artistWebsite: '',
          projectTitle: title.trim(),
          oneSentence: shortDescription.trim(),
          vision: [overviewLead.trim(), overviewBody.trim()].filter(Boolean).join('\n\n'),
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
          galleryImagesData: (galleryImages.length > 0 || projectPdfs.length > 0 || projectLinks.length > 0 || projectSocialLinks.length > 0)
            ? JSON.stringify({ images: galleryImages, pdfs: projectPdfs, links: projectLinks, socialLinks: projectSocialLinks, heroPositionY, projectDescription: projectDescription.trim() || undefined, inclusivityStatement: inclusivityStatement.trim() || undefined, materialsRegen: materialsRegen.trim() || undefined, galleryOrder: galleryOrder.length > 0 ? galleryOrder : undefined })
            : (projectDescription.trim() ? JSON.stringify({ projectDescription: projectDescription.trim() }) : null),
          collaborationNeeds: JSON.stringify(rolesData),
          collaborationRoleCount: rolesData.length || null,
          status: 'pending',
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        console.error('Submit failed:', res.status, data)
        setErrorMessage(data.message || `Submission failed (${res.status})`)
        setSaving(false)
        return
      }
      const data = await res.json()
      if (data.id) setSubmissionId(data.id)
      setHasChanges(false)
      setSavedMessage(true)
      setTimeout(() => setSavedMessage(false), 3000)
    } catch (err) {
      console.error('Submit error:', err)
      setErrorMessage('Network error. Please try again.')
    }
    setSaving(false)
  }

  async function uploadFileToStorage(file: File, type: string): Promise<string | null> {
    // Direct Supabase Storage upload (bypasses Next.js body limit)
    try {
      const { createSupabaseBrowserClient } = await import('@/lib/supabase-auth')
      const supabase = createSupabaseBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setErrorMessage('Not authenticated. Please sign in again.'); return null }

      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const path = `${user.id}/${type}/${Date.now()}.${ext}`

      const { data, error } = await supabase.storage
        .from('profile-uploads')
        .upload(path, file, { cacheControl: '3600', upsert: true, contentType: file.type })

      if (error) {
        setErrorMessage(`Upload failed: ${error.message}`)
        return null
      }

      const { data: urlData } = supabase.storage.from('profile-uploads').getPublicUrl(data.path)
      return urlData.publicUrl
    } catch (e) {
      setErrorMessage('Upload failed. Please try again.')
      return null
    }
  }

  async function handleHeroUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || file.size > 10 * 1024 * 1024) return
    setSaving(true)
    const url = await uploadFileToStorage(file, 'hero')
    if (url) {
      setHeroImageUrl(url)
      markDirty()
    }
    setSaving(false)
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return
    setSaving(true)
    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) continue
      const url = await uploadFileToStorage(file, 'gallery')
      if (url) {
        setGalleryImages(prev => [...prev, { url, alt: file.name.replace(/\.[^.]+$/, '') }])
        markDirty()
      }
    }
    setSaving(false)
  }

  function buildProjectGalleryItems(): SmartGalleryItem[] {
    // Build all items with their IDs
    const allItems: SmartGalleryItem[] = []
    galleryImages.forEach((img, i) => {
      allItems.push({ id: `img-${i}`, type: 'image', url: img.url, title: img.alt || 'Gallery Image', order: 0 })
    })
    projectPdfs.forEach((doc, i) => {
      allItems.push({ id: `pdf-${i}`, type: 'pdf', url: doc.url, thumbnail: doc.thumbnail, title: doc.title || 'Document', subtitle: 'PDF', order: 0 })
    })
    projectLinks.forEach((link, i) => {
      let subtitle = 'website'
      try { subtitle = new URL(link.url).hostname } catch {}
      allItems.push({ id: `link-${i}`, type: 'link', url: link.url, thumbnail: link.thumbnail, title: link.label || 'Link', subtitle, order: 0 })
    })

    // Apply custom order if we have one
    if (galleryOrder.length > 0) {
      const orderMap = new Map(galleryOrder.map((id, i) => [id, i]))
      allItems.sort((a, b) => {
        const oa = orderMap.get(a.id) ?? 999
        const ob = orderMap.get(b.id) ?? 999
        return oa - ob
      })
    }

    // Set final order values
    return allItems.map((item, i) => ({ ...item, order: i }))
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
            {errorMessage && (
              <div style={{ background: '#dc2626', color: 'white', padding: '8px 16px', borderRadius: 8, fontSize: '14px', display: 'flex', alignItems: 'center', gap: 8, maxWidth: 400 }}>
                <span style={{ flex: 1 }}>{errorMessage}</span>
                <button onClick={() => setErrorMessage(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: 18 }}>&times;</button>
              </div>
            )}
            {saving && hasChanges && <span className="live-editor__autosave">Auto-saving...</span>}
            {hasChanges && !saving && !errorMessage && <span className="live-editor__unsaved">Unsaved changes</span>}
            {savedMessage && !saving && <span className="live-editor__saved">Saved!</span>}
            <button onClick={() => saveDraft(false)} className="btn btn--primary btn--sm" disabled={saving || !hasChanges}>
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button onClick={submitForReview} className="btn btn--outline btn--sm" disabled={saving || !title.trim()}>
              Submit for Review
            </button>
            {submissionId && (
              <button
                className="btn btn--ghost btn--sm"
                onClick={() => {
                  // Open window immediately to avoid Safari popup blocker
                  const previewWindow = window.open('about:blank', '_blank')
                  if (previewWindow) {
                    saveDraftRef.current(true).then(() => {
                      previewWindow.location.href = `/dashboard/projects/preview?id=${submissionId}`
                    })
                  }
                }}
              >
                Preview
              </button>
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
        <div className="editable-section" onClick={!isDraggingHero ? () => openPanel('hero') : undefined}>
          <section
            className="project-hero"
            style={heroImageUrl
              ? { cursor: isDraggingHero ? 'grabbing' : 'grab' }
              : { background: 'linear-gradient(135deg, #01696F 0%, #01696Fcc 50%, #01696F88 100%)', position: 'relative', minHeight: 400 }
            }
            onMouseDown={heroImageUrl ? (e) => {
              e.stopPropagation()
              setIsDraggingHero(true)
              heroDragStartY.current = e.clientY
              heroDragStartPos.current = heroPositionY
              e.preventDefault()
            } : undefined}
            onMouseMove={isDraggingHero ? (e) => {
              const delta = e.clientY - heroDragStartY.current
              const heroHeight = (e.currentTarget as HTMLElement).offsetHeight
              const newPos = Math.max(0, Math.min(100, heroDragStartPos.current + (delta / heroHeight) * 100))
              setHeroPositionY(newPos)
            } : undefined}
            onMouseUp={() => { if (isDraggingHero) { setIsDraggingHero(false); markDirty() } }}
            onMouseLeave={() => { if (isDraggingHero) { setIsDraggingHero(false); markDirty() } }}
          >
            {heroImageUrl && (
              <>
                <img
                  src={heroImageUrl}
                  alt="Hero"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: `center ${heroPositionY}%` }}
                />
                <div style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', padding: '4px 12px', borderRadius: 20, fontSize: '0.7rem', zIndex: 2, pointerEvents: 'none' }}>
                  ↕ Drag to reposition
                </div>
              </>
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
              <p className="section-label">Project Philosophy</p>
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
                  {/* Social Links — spans full width */}
                  <div className="overview-stat" style={{ gridColumn: '1 / -1' }}>
                    <p className="overview-stat__label">Links</p>
                    {projectSocialLinks.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4, marginBottom: 4 }}>
                        {projectSocialLinks.map((link, i) => (
                          <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 16, background: 'rgba(255,255,255,0.08)', fontSize: 'var(--text-xs)', border: '1px solid var(--color-border)', textTransform: 'capitalize' }}>
                            {link.platform}
                            <button onClick={(e) => { e.stopPropagation(); setProjectSocialLinks(prev => prev.filter((_, j) => j !== i)); markDirty() }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: 12, padding: 0 }}>&times;</button>
                          </div>
                        ))}
                      </div>
                    )}
                    {showAddProjectSocial ? (
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }} onClick={e => e.stopPropagation()}>
                        <select className="form-input" value={newSocialPlatform} onChange={e => setNewSocialPlatform(e.target.value)} style={{ width: 'auto', minWidth: 100, fontSize: 'var(--text-xs)', padding: '4px 6px' }}>
                          {['instagram', 'linkedin', 'facebook', 'x', 'youtube', 'tiktok', 'behance', 'github', 'vimeo', 'soundcloud', 'spotify', 'linktree', 'website', 'fundraiser'].map(p => (
                            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                          ))}
                        </select>
                        <input className="form-input" value={newSocialUrl} onChange={e => setNewSocialUrl(e.target.value)} placeholder="https://..." style={{ flex: 1, minWidth: 100, fontSize: 'var(--text-xs)', padding: '4px 6px' }} />
                        <button className="btn btn--primary btn--sm" style={{ fontSize: 'var(--text-xs)', padding: '4px 8px' }} onClick={(e) => {
                          e.stopPropagation()
                          if (newSocialUrl.trim()) {
                            setProjectSocialLinks(prev => [...prev, { platform: newSocialPlatform, url: newSocialUrl.trim() }])
                            markDirty(); setNewSocialUrl(''); setShowAddProjectSocial(false)
                          }
                        }}>Add</button>
                        <button className="btn btn--ghost btn--sm" style={{ fontSize: 'var(--text-xs)', padding: '4px 8px' }} onClick={(e) => { e.stopPropagation(); setShowAddProjectSocial(false) }}>Cancel</button>
                      </div>
                    ) : (
                      <button className="btn btn--ghost btn--sm" style={{ fontSize: 'var(--text-xs)', padding: '4px 8px', marginTop: 4 }} onClick={(e) => { e.stopPropagation(); setShowAddProjectSocial(true) }}>+ Add Link</button>
                    )}
                  </div>
                </aside>
              </div>
            </div>
          </section>
          <div className="editable-section__overlay"><span>Edit overview</span></div>
        </div>

        {/* Media Gallery — SmartGallery with images, PDFs, links */}
        <section style={{ padding: 'var(--space-8) 0' }}>
          <div className="container">
            <p className="section-label">Media Gallery</p>
            {buildProjectGalleryItems().length > 0 ? (
              <SmartGallery
                items={buildProjectGalleryItems()}
                editable={true}
                onReorder={(reordered) => {
                  // Store the reordered ID list — this controls display order across ALL types
                  setGalleryOrder(reordered.map(item => item.id))
                  markDirty()
                }}
                onDelete={(id) => {
                  if (id.startsWith('img-')) {
                    const idx = parseInt(id.split('-')[1])
                    setGalleryImages(prev => prev.filter((_, i) => i !== idx))
                  } else if (id.startsWith('pdf-')) {
                    const idx = parseInt(id.split('-')[1])
                    setProjectPdfs(prev => prev.filter((_, i) => i !== idx))
                  } else if (id.startsWith('link-')) {
                    const idx = parseInt(id.split('-')[1])
                    setProjectLinks(prev => prev.filter((_, i) => i !== idx))
                  }
                  markDirty()
                }}
                onEditTitle={(id, newTitle) => {
                  if (id.startsWith('img-')) {
                    const idx = parseInt(id.split('-')[1])
                    setGalleryImages(prev => prev.map((item, i) => i === idx ? { ...item, alt: newTitle } : item))
                  } else if (id.startsWith('pdf-')) {
                    const idx = parseInt(id.split('-')[1])
                    setProjectPdfs(prev => prev.map((item, i) => i === idx ? { ...item, title: newTitle } : item))
                  } else if (id.startsWith('link-')) {
                    const idx = parseInt(id.split('-')[1])
                    setProjectLinks(prev => prev.map((item, i) => i === idx ? { ...item, label: newTitle } : item))
                  }
                  markDirty()
                }}
                onEditThumbnail={(id, thumbnailUrl) => {
                  if (id.startsWith('pdf-')) {
                    const idx = parseInt(id.split('-')[1])
                    setProjectPdfs(prev => prev.map((item, i) => i === idx ? { ...item, thumbnail: thumbnailUrl } : item))
                  } else if (id.startsWith('link-')) {
                    const idx = parseInt(id.split('-')[1])
                    setProjectLinks(prev => prev.map((item, i) => i === idx ? { ...item, thumbnail: thumbnailUrl } : item))
                  }
                  markDirty()
                }}
              />
            ) : (
              <div className="live-editor__empty-placeholder">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <span>Add images, documents, and links to your media gallery</span>
              </div>
            )}
            {/* Image requirements */}
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-3)', marginBottom: 'var(--space-1)' }}>
              Accepted: JPG, PNG, WebP, GIF, HEIC, AVIF (max 10MB) · PDF (max 10MB) · Drag tiles to reorder
            </p>
            {/* Add buttons */}
            {galleryUploading && (
              <div style={{ padding: '10px 16px', borderRadius: 8, marginTop: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(1,105,111,0.1)' }}>
                <span className="dashboard-spinner" style={{ width: 16, height: 16 }} /> Uploading...
              </div>
            )}
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)', flexWrap: 'wrap' }}>
              <label className="btn btn--outline btn--sm" style={{ cursor: 'pointer' }}>
                <input type="file" accept="image/*" multiple onChange={async (e) => {
                  setGalleryUploading(true)
                  await handleGalleryUpload(e)
                  setGalleryUploading(false)
                }} style={{ display: 'none' }} />
                {galleryUploading ? 'Uploading...' : '+ Add Images'}
              </label>
              <label className="btn btn--outline btn--sm" style={{ cursor: 'pointer' }}>
                <input type="file" accept=".pdf,application/pdf" multiple onChange={async (e) => {
                  const files = e.target.files
                  if (!files) return
                  setGalleryUploading(true)
                  for (const file of Array.from(files)) {
                    if (file.size > 10 * 1024 * 1024) continue
                    const url = await uploadFileToStorage(file, 'portfolio')
                    if (url) {
                      setProjectPdfs(prev => [...prev, { url, title: file.name.replace(/\.pdf$/i, '') }])
                      markDirty()
                    }
                  }
                  setGalleryUploading(false)
                  e.target.value = ''
                }} style={{ display: 'none' }} />
                + Add PDF
              </label>
              {showProjectAddLink ? (
                <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-end', flexWrap: 'wrap', flex: 1 }}>
                  <input className="form-input" value={newProjectLinkUrl} onChange={e => setNewProjectLinkUrl(e.target.value)} placeholder="https://..." style={{ flex: 1, minWidth: 120, fontSize: 'var(--text-sm)' }} />
                  <input className="form-input" value={newProjectLinkLabel} onChange={e => setNewProjectLinkLabel(e.target.value)} placeholder="Label" style={{ flex: 1, minWidth: 80, fontSize: 'var(--text-sm)' }} />
                  <button className="btn btn--primary btn--sm" onClick={() => {
                    if (newProjectLinkUrl.trim()) {
                      setProjectLinks(prev => [...prev, { url: newProjectLinkUrl.trim(), label: newProjectLinkLabel.trim() || 'Link' }])
                      markDirty()
                      setNewProjectLinkUrl('')
                      setNewProjectLinkLabel('')
                      setShowProjectAddLink(false)
                    }
                  }}>Add</button>
                  <button className="btn btn--ghost btn--sm" onClick={() => setShowProjectAddLink(false)}>Cancel</button>
                </div>
              ) : (
                <button className="btn btn--outline btn--sm" onClick={() => setShowProjectAddLink(true)}>+ Add Link</button>
              )}
            </div>
          </div>
        </section>

        {/* Social links moved to overview sidebar above */}

        {/* Project Description */}
        <div className="editable-section" onClick={() => openPanel('description')}>
          <section className="project-experience">
            <div className="container">
              <p className="section-label">Project Description</p>
              <h2>About This Project</h2>
              {projectDescription
                ? projectDescription.split('\n\n').map((p, i) => <p key={i} className="overview-body">{p}</p>)
                : <p style={{ opacity: 0.4, fontStyle: 'italic' }}>Describe your project in detail...</p>
              }
            </div>
          </section>
          <div className="editable-section__overlay"><span>Edit description</span></div>
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

        {/* Inclusivity Statement */}
        <div className="editable-section" onClick={() => openPanel('inclusivity')}>
          <section className="project-experience">
            <div className="container">
              <p className="section-label">Inclusivity Statement</p>
                            {inclusivityStatement
                ? inclusivityStatement.split('\n\n').map((p, i) => <p key={i} className="overview-body">{p}</p>)
                : <p style={{ opacity: 0.4, fontStyle: 'italic' }}>Describe how your project promotes inclusivity and access...</p>
              }
            </div>
          </section>
          <div className="editable-section__overlay"><span>Edit inclusivity</span></div>
        </div>

        {/* Materials & Regenerative Practices */}
        <div className="editable-section" onClick={() => openPanel('materials_regen')}>
          <section className="project-experience">
            <div className="container">
              <p className="section-label">Materials & Regenerative Practices</p>

              {materialsRegen
                ? materialsRegen.split('\n\n').map((p, i) => <p key={i} className="overview-body">{p}</p>)
                : <p style={{ opacity: 0.4, fontStyle: 'italic' }}>Describe the materials and regenerative practices used...</p>
              }
            </div>
          </section>
          <div className="editable-section__overlay"><span>Edit materials</span></div>
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
                <div style={{ textAlign: 'center' }}>
                  {creatorAvatarUrl ? (
                    <div style={{ width: '100%', aspectRatio: '3/4', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 'var(--space-3)' }}>
                      <img src={creatorAvatarUrl} alt={leadArtistName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div style={{ width: '100%', aspectRatio: '3/4', borderRadius: 'var(--radius-lg)', background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-3)', fontSize: '2rem', color: 'var(--color-text-muted)' }}>
                      {(leadArtistName || 'Y').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, margin: '0 0 var(--space-1)' }}>{leadArtistName || 'You'}</h3>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>Lead Creator</p>
                </div>
                {collaborators.map((c, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    {c.photo ? (
                      <div style={{ width: '100%', aspectRatio: '3/4', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 'var(--space-3)' }}>
                        <img src={c.photo} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ) : (
                      <div style={{ width: '100%', aspectRatio: '3/4', borderRadius: 'var(--radius-lg)', background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-3)', fontSize: '2rem', color: 'var(--color-text-muted)' }}>
                        {(c.name || '?').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, margin: '0 0 var(--space-1)' }}>{c.name || 'Team Member'}</h3>
                    {c.role && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>{c.role}</p>}
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
                {activePanel === 'description' && 'Project Description'}
                {activePanel === 'experience' && 'The Experience'}
                {activePanel === 'inclusivity' && 'Inclusivity Statement'}
                {activePanel === 'materials_regen' && 'Materials & Regenerative Practices'}
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

              {/* Gallery is now inline — no panel needed */}

              {/* DESCRIPTION PANEL */}
              {activePanel === 'description' && (
                <div className="live-editor__panel-section">
                  <div className="form-group">
                    <label className="form-label">Project Description</label>
                    <textarea
                      className="form-textarea"
                      value={projectDescription}
                      onChange={e => { setProjectDescription(e.target.value); markDirty() }}
                      rows={8}
                      placeholder="Provide a detailed description of your project..."
                      maxLength={5000}
                    />
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 4 }}>{projectDescription.length}/5000</p>
                  </div>
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

              {/* INCLUSIVITY PANEL */}
              {activePanel === 'inclusivity' && (
                <div className="live-editor__panel-section">
                  <div className="form-group">
                    <label className="form-label">Inclusivity Statement</label>
                    <textarea className="form-textarea" value={inclusivityStatement} onChange={e => { setInclusivityStatement(e.target.value); markDirty() }} rows={6} placeholder="How does your project promote inclusivity, access, and diverse participation?" maxLength={5000} />
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 4 }}>{inclusivityStatement.length}/5000</p>
                  </div>
                </div>
              )}

              {/* MATERIALS & REGENERATIVE PANEL */}
              {activePanel === 'materials_regen' && (
                <div className="live-editor__panel-section">
                  <div className="form-group">
                    <label className="form-label">Materials & Regenerative Practices</label>
                    <textarea className="form-textarea" value={materialsRegen} onChange={e => { setMaterialsRegen(e.target.value); markDirty() }} rows={6} placeholder="Describe the materials, processes, and regenerative practices used in your project..." maxLength={5000} />
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 4 }}>{materialsRegen.length}/5000</p>
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
                          <label className="form-label">Role Category</label>
                          <select className="form-input" value={role.title} style={{ appearance: 'auto', WebkitAppearance: 'menulist', color: 'var(--color-text)', backgroundColor: 'var(--color-surface)' }}
                            onChange={e => { const u = [...collabRoles]; u[i] = { ...u[i], title: e.target.value }; setCollabRoles(u); markDirty() }}>
                            <option value="">Select a role...</option>
                            {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Role Title</label>
                          <input className="form-input" value={role.customTitle} placeholder="e.g. Interior Designer, Lead Fabricator"
                            onChange={e => { const u = [...collabRoles]; u[i] = { ...u[i], customTitle: e.target.value }; setCollabRoles(u); markDirty() }} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Skills Needed</label>
                          <input className="form-input" value={role.skills} placeholder="e.g. Rhino, SketchUp, AutoCAD"
                            onChange={e => { const u = [...collabRoles]; u[i] = { ...u[i], skills: e.target.value }; setCollabRoles(u); markDirty() }} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Role Description</label>
                          <textarea className="form-textarea" rows={3} value={role.description} placeholder="Describe what this collaborator will do..."
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
                <div className="form-group">
                  <label className="form-label">Detailed Description</label>
                  <textarea className="form-textarea" value={overviewBody} onChange={e => { setOverviewBody(e.target.value); markDirty() }} rows={4} maxLength={5000} placeholder="Expand on your vision with more detail..." />
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
                  <label className="form-label">Goals</label>
                  {goals.map((g, i) => (
                    <div key={i} style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                      <input className="form-input" value={g} onChange={e => { const u = [...goals]; u[i] = e.target.value; setGoals(u); markDirty() }} style={{ flex: 1 }} placeholder={`Goal ${i + 1}`} />
                      <button type="button" className="btn btn--ghost btn--sm" onClick={() => { setGoals(goals.filter((_, j) => j !== i)); markDirty() }}>&times;</button>
                    </div>
                  ))}
                  <button type="button" className="btn btn--outline btn--sm" onClick={() => { setGoals([...goals, '']); markDirty() }}>+ Add Goal</button>
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

              {/* Team */}
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-4)' }}>Team</h4>
                <div className="form-group">
                  <label className="form-label">Lead Creator</label>
                  <input className="form-input" value={leadArtistName} onChange={e => { setLeadArtistName(e.target.value); markDirty() }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Team Members</label>
                  {collaborators.map((c, i) => (
                    <div key={i} style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)', alignItems: 'center' }}>
                      <input className="form-input" placeholder="Name" value={c.name} onChange={e => { const u = [...collaborators]; u[i] = { ...u[i], name: e.target.value }; setCollaborators(u); markDirty() }} style={{ flex: 1 }} />
                      <input className="form-input" placeholder="Role" value={c.role} onChange={e => { const u = [...collaborators]; u[i] = { ...u[i], role: e.target.value }; setCollaborators(u); markDirty() }} style={{ flex: 1 }} />
                      <button type="button" className="btn btn--ghost btn--sm" onClick={() => { setCollaborators(collaborators.filter((_, j) => j !== i)); markDirty() }}>&times;</button>
                    </div>
                  ))}
                  <button type="button" className="btn btn--outline btn--sm" onClick={() => { setCollaborators([...collaborators, { name: '', role: '', photo: null }]); markDirty() }}>+ Add Team Member</button>
                </div>
              </div>

              {/* Collaboration Roles */}
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-4)' }}>Collaboration Roles</h4>
                {collabRoles.map((role, i) => (
                  <div key={i} style={{ padding: 'var(--space-3)', border: '1px solid var(--color-border)', borderRadius: 8, marginBottom: 'var(--space-3)', position: 'relative' }}>
                    <button type="button" style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: 16 }} onClick={() => { setCollabRoles(prev => prev.filter((_, j) => j !== i)); markDirty() }}>&times;</button>
                    <div className="form-group" style={{ marginBottom: 'var(--space-2)' }}>
                      <label className="form-label">Role Title</label>
                      <input className="form-input" value={role.title || role.customTitle || ''} onChange={e => { const u = [...collabRoles]; u[i] = { ...u[i], title: e.target.value, customTitle: e.target.value }; setCollabRoles(u); markDirty() }} placeholder="e.g. Structural Engineer" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Description</label>
                      <textarea className="form-textarea" value={role.description || ''} onChange={e => { const u = [...collabRoles]; u[i] = { ...u[i], description: e.target.value }; setCollabRoles(u); markDirty() }} rows={2} placeholder="What this role involves..." />
                    </div>
                  </div>
                ))}
                <button type="button" className="btn btn--outline btn--sm" onClick={() => { setCollabRoles(prev => [...prev, emptyRole()]); markDirty() }}>+ Add Role</button>
              </div>

              {/* Collaboration Details */}
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-4)' }}>Collaboration Details</h4>
                <div className="form-group">
                  <label className="form-label">Materials &amp; Technical Needs</label>
                  <textarea className="form-textarea" value={materials} onChange={e => { setMaterials(e.target.value); markDirty() }} rows={3} maxLength={5000} />
                </div>
                <div className="form-group">
                  <label className="form-label">Special Needs</label>
                  <textarea className="form-textarea" value={specialNeeds} onChange={e => { setSpecialNeeds(e.target.value); markDirty() }} rows={3} maxLength={5000} />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Email (for inquiries about this project)</label>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>This can be different from your login email. This is the email people will use to reach you about this project.</p>
                  <input className="form-input" type="email" value={projectContactEmail || contactEmail} onChange={e => { setProjectContactEmail(e.target.value); markDirty() }} placeholder="your-project-email@example.com" />
                </div>
                <div className="form-group">
                  <label className="form-label">Preferred Contact Method</label>
                  <select className="form-input" value={contactMethod} onChange={e => { setContactMethod(e.target.value); markDirty() }}>
                    <option value="email">Email</option>
                    <option value="form">Contact Form on Resonance</option>
                    <option value="website">Link to My Website</option>
                  </select>
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
