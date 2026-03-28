'use client'
import { useState, useEffect, useCallback, useRef } from 'react'

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
  description: string
  imageFile: File | null
  imagePreview: string | null
}

function emptyRole(): CollabRole {
  return { title: '', customTitle: '', description: '', imageFile: null, imagePreview: null }
}

interface DraftData {
  step: number
  projectTitle: string
  oneSentence: string
  vision: string
  domains: string[]
  customDomain: string
  pathways: string[]
  customPathway: string
  stage: string
  scale: string
  location: string
  materials: string
  specialNeeds: string
  collabRoles: Array<{ title: string; customTitle: string; description: string }>
}

function loadDraft(key: string): DraftData | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function saveDraft(data: DraftData, key: string) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch { /* localStorage unavailable */ }
}

function clearDraft(key: string) {
  try {
    localStorage.removeItem(key)
  } catch { /* localStorage unavailable */ }
}

async function compressImage(file: File, maxWidth = 1200, quality = 0.7): Promise<string> {
  return new Promise((resolve) => {
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
    img.src = URL.createObjectURL(file)
  })
}

interface ProjectSubmissionFormProps {
  initialData?: Record<string, unknown>
  submissionId?: string
  userProfile: { name: string; email: string; website?: string }
  onSuccess?: (id: string) => void
}

export function ProjectSubmissionForm({ initialData, submissionId, userProfile, onSuccess }: ProjectSubmissionFormProps) {
  const isEditMode = !!submissionId
  const steps = ['Project Basics', 'Details', 'Collaboration', 'Review & Submit']
  const maxStep = steps.length - 1

  const draftKey = isEditMode ? `resonance-project-draft-edit-${submissionId}` : 'resonance-project-draft-authenticated'

  function formStep(): number {
    return step + 1
  }

  const [step, setStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [draftStatus, setDraftStatus] = useState<'idle' | 'saving' | 'saved' | 'restored'>('idle')
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Step 1 — Project Basics
  const [projectTitle, setProjectTitle] = useState('')
  const [oneSentence, setOneSentence] = useState('')
  const [vision, setVision] = useState('')
  const [heroImage, setHeroImage] = useState<File | null>(null)

  // Step 2 — Details
  const [domains, setDomains] = useState<string[]>([])
  const [customDomain, setCustomDomain] = useState('')
  const [pathways, setPathways] = useState<string[]>([])
  const [customPathway, setCustomPathway] = useState('')
  const [stage, setStage] = useState('')
  const [scale, setScale] = useState('')
  const [location, setLocation] = useState('')
  const [materials, setMaterials] = useState('')
  const [specialNeeds, setSpecialNeeds] = useState('')
  const [galleryImages, setGalleryImages] = useState<File[]>([])

  // Step 3 — Collaboration
  const [collabRoles, setCollabRoles] = useState<CollabRole[]>([emptyRole()])

  // Restore draft on mount
  useEffect(() => {
    if (initialData) {
      setProjectTitle((initialData.projectTitle as string) || '')
      setOneSentence((initialData.oneSentence as string) || '')
      setVision((initialData.vision as string) || '')
      setDomains((initialData.domains as string[]) || [])
      setPathways((initialData.pathways as string[]) || [])
      setStage((initialData.stage as string) || '')
      setScale((initialData.scale as string) || '')
      setLocation((initialData.location as string) || '')
      setMaterials((initialData.materials as string) || '')
      setSpecialNeeds((initialData.specialNeeds as string) || '')
      // Parse collaboration_needs back into roles if possible
      const collabStr = (initialData.collaborationNeeds as string) || ''
      try {
        const parsed = JSON.parse(collabStr)
        if (Array.isArray(parsed)) {
          setCollabRoles(parsed.map((r: { title?: string; description?: string }) => ({
            title: ROLE_OPTIONS.includes(r.title || '') ? r.title || '' : 'Other',
            customTitle: ROLE_OPTIONS.includes(r.title || '') ? '' : r.title || '',
            description: r.description || '',
            imageFile: null,
            imagePreview: null,
          })))
        }
      } catch { /* not JSON, ignore */ }
      return
    }

    const draft = loadDraft(draftKey)
    if (draft) {
      setStep(draft.step || 0)
      setProjectTitle(draft.projectTitle || '')
      setOneSentence(draft.oneSentence || '')
      setVision(draft.vision || '')
      setDomains(draft.domains || [])
      setCustomDomain(draft.customDomain || '')
      setPathways(draft.pathways || [])
      setCustomPathway(draft.customPathway || '')
      setStage(draft.stage || '')
      setScale(draft.scale || '')
      setLocation(draft.location || '')
      setMaterials(draft.materials || '')
      setSpecialNeeds(draft.specialNeeds || '')
      if (draft.collabRoles && draft.collabRoles.length > 0) {
        setCollabRoles(draft.collabRoles.map(r => ({
          ...r,
          imageFile: null,
          imagePreview: null,
        })))
      }
      setDraftStatus('restored')
      setTimeout(() => setDraftStatus('idle'), 3000)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Debounced auto-save
  const scheduleSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      setDraftStatus('saving')
      saveDraft({
        step,
        projectTitle, oneSentence, vision,
        domains, customDomain, pathways, customPathway,
        stage, scale, location, materials, specialNeeds,
        collabRoles: collabRoles.map(r => ({ title: r.title, customTitle: r.customTitle, description: r.description })),
      }, draftKey)
      setDraftStatus('saved')
      setTimeout(() => setDraftStatus('idle'), 2000)
    }, 1000)
  }, [
    step, projectTitle, oneSentence, vision,
    domains, customDomain, pathways, customPathway,
    stage, scale, location, materials, specialNeeds,
    collabRoles, draftKey,
  ])

  useEffect(() => {
    if (isSubmitted) return
    if (projectTitle) scheduleSave()
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current) }
  }, [scheduleSave, isSubmitted, projectTitle])

  function handleClearDraft() {
    clearDraft(draftKey)
    setStep(0)
    setProjectTitle(''); setOneSentence(''); setVision('')
    setDomains([]); setCustomDomain(''); setPathways([]); setCustomPathway('')
    setStage(''); setScale(''); setLocation('')
    setMaterials(''); setSpecialNeeds('')
    setCollabRoles([emptyRole()])
    setHeroImage(null); setGalleryImages([])
    setDraftStatus('idle')
  }

  function toggleMulti(value: string, arr: string[], setter: (v: string[]) => void) {
    setter(arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value])
  }

  // Collaboration role management
  function addRole() {
    setCollabRoles([...collabRoles, emptyRole()])
  }

  function updateRole(index: number, field: keyof CollabRole, value: unknown) {
    setCollabRoles(prev => prev.map((r, i) => i === index ? { ...r, [field]: value } : r))
  }

  function removeRole(index: number) {
    if (collabRoles.length <= 1) {
      setCollabRoles([emptyRole()])
    } else {
      setCollabRoles(collabRoles.filter((_, i) => i !== index))
    }
  }

  async function handleRoleImage(index: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5MB'); return }
    setError('')
    updateRole(index, 'imageFile', file)
    updateRole(index, 'imagePreview', URL.createObjectURL(file))
  }

  function getRoleDisplayTitle(role: CollabRole): string {
    if (role.title === 'Other' && role.customTitle) return role.customTitle
    return role.title || 'New Role'
  }

  function canProceed(): boolean {
    const fs = formStep()
    if (fs === 1) return !!(projectTitle && oneSentence && vision && (isEditMode || heroImage))
    if (fs === 2) return !!(domains.length > 0 && pathways.length > 0 && stage)
    if (fs === 3) {
      // At least one role with a title and description
      return collabRoles.some(r => {
        const hasTitle = r.title === 'Other' ? !!r.customTitle.trim() : !!r.title
        return hasTitle && !!r.description.trim()
      })
    }
    return true
  }

  async function handleSubmit() {
    setIsSubmitting(true)
    setError('')
    try {
      const heroBase64 = heroImage ? await compressImage(heroImage) : null
      const galleryBase64 = await Promise.all(galleryImages.map(f => compressImage(f)))

      // Build collaboration roles data
      const rolesData = await Promise.all(
        collabRoles
          .filter(r => (r.title === 'Other' ? r.customTitle.trim() : r.title) && r.description.trim())
          .map(async r => {
            const roleTitle = r.title === 'Other' ? r.customTitle.trim() : r.title
            const imageBase64 = r.imageFile ? await compressImage(r.imageFile, 800, 0.7) : null
            return {
              title: roleTitle,
              description: r.description.trim(),
              image_url: imageBase64,
            }
          })
      )

      // Build actual domains/pathways including custom values
      const finalDomains = [...domains]
      if (domains.includes('Other') && customDomain.trim()) {
        const idx = finalDomains.indexOf('Other')
        finalDomains[idx] = customDomain.trim()
      }
      const finalPathways = [...pathways]
      if (pathways.includes('Other') && customPathway.trim()) {
        const idx = finalPathways.indexOf('Other')
        finalPathways[idx] = customPathway.trim()
      }

      const payload: Record<string, unknown> = {
        artistName: userProfile.name,
        artistEmail: userProfile.email,
        artistWebsite: userProfile.website || null,
        projectTitle, oneSentence, vision,
        experience: vision, // Use vision as experience fallback
        story: oneSentence, // Use oneSentence as story fallback
        goals: '',
        domains: finalDomains, pathways: finalPathways, stage,
        scale: scale || null,
        location: location || null,
        materials: materials || null,
        specialNeeds: specialNeeds || null,
        collaborationNeeds: JSON.stringify(rolesData),
        collaborationRoleCount: rolesData.length || null,
      }

      if (!isEditMode) {
        payload.heroImageData = heroBase64
        payload.galleryImagesData = JSON.stringify(galleryBase64)
      } else {
        if (heroBase64) payload.heroImageData = heroBase64
        if (galleryBase64.length > 0) payload.galleryImagesData = JSON.stringify(galleryBase64)
      }

      let res: Response
      if (isEditMode) {
        res = await fetch('/api/user/projects', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ submissionId, ...payload }),
        })
      } else {
        res = await fetch('/api/submit-project', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      const data = await res.json()
      if (data.success || res.ok) {
        setIsSubmitted(true)
        clearDraft(draftKey)
        if (data.previewUrl) setPreviewUrl(data.previewUrl)
        if (onSuccess) onSuccess(data.id || submissionId || '')
      } else {
        setError(data.message || 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function resetForm() {
    handleClearDraft()
    setIsSubmitted(false)
    setError('')
    setPreviewUrl('')
  }

  // ─── Success State ────────────────────────────────────────────

  if (isSubmitted) {
    return (
      <div className="submission-form">
        <div className="submission-success">
          <div className="submission-success__icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
              <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2.5" />
              <path d="M14 24.5l7 7 13-14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="submission-success__heading">
            {isEditMode ? 'Project Updated Successfully!' : 'Project Submitted Successfully!'}
          </h2>
          <p className="submission-success__desc">
            {isEditMode
              ? 'Your changes have been saved.'
              : 'Your project is being reviewed by our team. We\u2019ll notify you when it\u2019s approved.'}
          </p>
          {!isEditMode && previewUrl && (
            <a href={previewUrl} className="btn btn--outline" style={{ marginBottom: 'var(--space-3)' }}>
              Preview Your Project Page
            </a>
          )}
          <div className="submission-success__actions">
            <a href="/dashboard/projects" className="btn btn--primary">
              View My Projects
            </a>
            {!isEditMode && (
              <button type="button" className="btn btn--outline" onClick={resetForm}>
                Submit Another Project
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ─── Form ─────────��───────────────────────────────────────────

  return (
    <div className="submission-form">
      {/* Progress indicator */}
      <div className="submission-form__progress">
        {steps.map((label, i) => (
          <button
            key={label}
            className={`submission-form__step${i === step ? ' submission-form__step--active' : ''}${i < step ? ' submission-form__step--done' : ''}`}
            onClick={() => { if (i < step) setStep(i) }}
            type="button"
            disabled={i > step}
          >
            <span className="submission-form__step-num">{i < step ? '\u2713' : i + 1}</span>
            <span className="submission-form__step-label">{label}</span>
          </button>
        ))}
      </div>

      {/* Draft status bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '24px', marginBottom: 'var(--space-2)' }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          {draftStatus === 'saving' && 'Saving draft...'}
          {draftStatus === 'saved' && '\u2713 Draft saved'}
          {draftStatus === 'restored' && '\u2713 Draft restored'}
        </span>
        {projectTitle && (
          <button
            type="button"
            onClick={handleClearDraft}
            style={{
              background: 'none', border: 'none', color: 'var(--color-text-muted)',
              cursor: 'pointer', fontSize: 'var(--text-xs)', textDecoration: 'underline', padding: '4px 0',
            }}
          >
            Clear draft
          </button>
        )}
      </div>

      {error && <p className="form-error" style={{ marginBottom: 'var(--space-4)' }}>{error}</p>}

      {/* ─── Step 1: Project Basics ─────────────────────────────── */}
      {formStep() === 1 && (
        <div className="submission-form__section">
          <h3 className="submission-form__section-title">Project Basics</h3>
          <div className="form-group">
            <label htmlFor="sf-title" className="form-label">Project Title *</label>
            <input id="sf-title" type="text" required value={projectTitle} onChange={e => setProjectTitle(e.target.value)} className="form-input" placeholder="The name of your project" />
          </div>
          <div className="form-group">
            <label htmlFor="sf-onesentence" className="form-label">One-sentence description *</label>
            <input id="sf-onesentence" type="text" required value={oneSentence} onChange={e => setOneSentence(e.target.value)} className="form-input" placeholder="A single sentence that captures the essence" />
          </div>
          <div className="form-group">
            <label htmlFor="sf-vision" className="form-label">The Vision &mdash; What is this project and why does it matter? *</label>
            <textarea id="sf-vision" required value={vision} onChange={e => setVision(e.target.value)} className="form-textarea" rows={5} placeholder="Describe the project, the experience, your story, and its significance" />
          </div>
          <div className="form-group">
            <label htmlFor="sf-hero" className="form-label">Main project image {isEditMode ? '' : '*'}</label>
            <input id="sf-hero" type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f && f.size <= 5 * 1024 * 1024) { setHeroImage(f); setError('') } else if (f) setError('Hero image must be under 5MB') }} className="form-input" />
            <span className="form-hint">This will be your project&apos;s primary visual. Max 5MB.</span>
            {heroImage && <span className="form-hint" style={{ color: 'var(--color-primary)' }}>&#10003; {heroImage.name}</span>}
          </div>
        </div>
      )}

      {/* ─── Step 2: Details ─────���──────────────────────────────── */}
      {formStep() === 2 && (
        <div className="submission-form__section">
          <h3 className="submission-form__section-title">Details</h3>
          <div className="form-group">
            <p className="form-label">Domains *</p>
            <div className="submission-form__checkboxes">
              {DOMAINS.map(d => (
                <label key={d} className="submission-form__checkbox">
                  <input type="checkbox" checked={domains.includes(d)} onChange={() => toggleMulti(d, domains, setDomains)} />
                  <span>{d}</span>
                </label>
              ))}
            </div>
            {domains.includes('Other') && (
              <input
                type="text"
                className="form-input"
                value={customDomain}
                onChange={e => setCustomDomain(e.target.value)}
                placeholder="Enter your custom domain"
                style={{ marginTop: 'var(--space-2)' }}
              />
            )}
          </div>
          <div className="form-group">
            <p className="form-label">Pathways *</p>
            <div className="submission-form__checkboxes">
              {PATHWAYS.map(p => (
                <label key={p} className="submission-form__checkbox">
                  <input type="checkbox" checked={pathways.includes(p)} onChange={() => toggleMulti(p, pathways, setPathways)} />
                  <span>{p}</span>
                </label>
              ))}
            </div>
            {pathways.includes('Other') && (
              <input
                type="text"
                className="form-input"
                value={customPathway}
                onChange={e => setCustomPathway(e.target.value)}
                placeholder="Enter your custom pathway"
                style={{ marginTop: 'var(--space-2)' }}
              />
            )}
          </div>
          <div className="form-group">
            <label htmlFor="sf-stage" className="form-label">Current Stage *</label>
            <select id="sf-stage" value={stage} onChange={e => setStage(e.target.value)} className="form-select">
              <option value="">Select stage...</option>
              {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="sf-scale" className="form-label">Scale</label>
            <input id="sf-scale" type="text" value={scale} onChange={e => setScale(e.target.value)} className="form-input" placeholder="e.g. 'Three-story installation' or 'Room-scale'" />
          </div>
          <div className="form-group">
            <label htmlFor="sf-location" className="form-label">Where is this project sited or intended?</label>
            <input id="sf-location" type="text" value={location} onChange={e => setLocation(e.target.value)} className="form-input" placeholder="City, region, or 'site flexible'" />
          </div>
          <div className="form-group">
            <label htmlFor="sf-materials" className="form-label">Materials &amp; Processes</label>
            <textarea id="sf-materials" value={materials} onChange={e => setMaterials(e.target.value)} className="form-textarea" rows={3} placeholder="e.g. steel fabrication, living plant systems, projection mapping..." />
          </div>
          <div className="form-group">
            <label className="form-label">Gallery images (up to 6, max 5MB each)</label>
            <span className="form-hint" style={{ marginBottom: 'var(--space-3)', display: 'block' }}>Additional images showing concept, materials, models, or renders. All optional.</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)' }}>
              {[0, 1, 2, 3, 4, 5].map(i => (
                <div key={i}>
                  <label htmlFor={`sf-gallery-${i}`} className="form-label" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    Image {i + 1}
                  </label>
                  <input
                    id={`sf-gallery-${i}`}
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const f = e.target.files?.[0]
                      if (f && f.size > 5 * 1024 * 1024) { setError('Image must be under 5MB'); return }
                      setGalleryImages(prev => {
                        const next = [...prev]
                        if (f) { next[i] = f } else { next.splice(i, 1) }
                        return next.filter(Boolean)
                      })
                      setError('')
                    }}
                    className="form-input"
                  />
                  {galleryImages[i] && <span className="form-hint" style={{ color: 'var(--color-primary)', fontSize: 'var(--text-xs)' }}>&#10003; {galleryImages[i].name}</span>}
                </div>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="sf-special" className="form-label">Special Needs</label>
            <textarea id="sf-special" value={specialNeeds} onChange={e => setSpecialNeeds(e.target.value)} className="form-textarea" rows={2} placeholder="Anything else you'd like us to know?" />
          </div>
        </div>
      )}

      {/* ─── Step 3: Collaboration Roles ───────────────────────── */}
      {formStep() === 3 && (
        <div className="submission-form__section">
          <h3 className="submission-form__section-title">Collaboration Roles</h3>
          <p className="form-hint" style={{ marginBottom: 'var(--space-5)' }}>
            Describe the roles or expertise your project needs. Add as many as you like.
          </p>

          {collabRoles.map((role, idx) => (
            <div key={idx} className="collab-role-card">
              <div className="collab-role-card__header">
                <span className="collab-role-card__number">{getRoleDisplayTitle(role)}</span>
                <button
                  type="button"
                  className="collab-role-card__delete"
                  onClick={() => removeRole(idx)}
                  aria-label="Remove role"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                </button>
              </div>

              <div className="collab-role-card__body">
                <div className="form-group">
                  <label className="form-label">Role *</label>
                  <select
                    className="form-select"
                    value={role.title}
                    onChange={e => updateRole(idx, 'title', e.target.value)}
                  >
                    <option value="">Select a role...</option>
                    {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                {role.title === 'Other' && (
                  <div className="form-group">
                    <label className="form-label">Custom role title *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={role.customTitle}
                      onChange={e => updateRole(idx, 'customTitle', e.target.value)}
                      placeholder="e.g. Kinetic Sculptor, Bio-Material Researcher"
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={role.description}
                    onChange={e => updateRole(idx, 'description', e.target.value)}
                    placeholder="What will this collaborator do? What skills and experience are you looking for?"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Reference image (optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleRoleImage(idx, e)}
                    className="form-input"
                  />
                  {role.imagePreview && (
                    <img
                      src={role.imagePreview}
                      alt="Role reference"
                      className="collab-role-card__preview"
                    />
                  )}
                </div>
              </div>
            </div>
          ))}

          <button type="button" className="add-role-btn" onClick={addRole}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10 6v8M6 10h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Add Collaboration Role
          </button>
        </div>
      )}

      {/* ─── Step 4: Review & Submit ───────────────────────────── */}
      {formStep() === 4 && (
        <div className="submission-form__section">
          <h3 className="submission-form__section-title">Review Your Submission</h3>
          <div className="submission-form__review">
            <div className="submission-form__review-group">
              <h4>Submitting As</h4>
              <p><strong>Name:</strong> {userProfile.name}</p>
              <p><strong>Email:</strong> {userProfile.email}</p>
              {userProfile.website && <p><strong>Website:</strong> {userProfile.website}</p>}
            </div>
            <div className="submission-form__review-group">
              <h4>Project Basics</h4>
              <p><strong>Title:</strong> {projectTitle}</p>
              <p><strong>Summary:</strong> {oneSentence}</p>
              <p><strong>Vision:</strong> {vision.length > 200 ? vision.slice(0, 200) + '...' : vision}</p>
              <p><strong>Hero image:</strong> {heroImage?.name || (isEditMode ? '(keeping existing)' : 'None')}</p>
            </div>
            <div className="submission-form__review-group">
              <h4>Details</h4>
              <p><strong>Domains:</strong> {domains.map(d => d === 'Other' && customDomain ? customDomain : d).join(', ')}</p>
              <p><strong>Pathways:</strong> {pathways.map(p => p === 'Other' && customPathway ? customPathway : p).join(', ')}</p>
              <p><strong>Stage:</strong> {stage}</p>
              {scale && <p><strong>Scale:</strong> {scale}</p>}
              {location && <p><strong>Location:</strong> {location}</p>}
              {materials && <p><strong>Materials:</strong> {materials}</p>}
              <p><strong>Gallery:</strong> {galleryImages.length} image{galleryImages.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="submission-form__review-group">
              <h4>Collaboration Roles ({collabRoles.filter(r => r.title || r.customTitle).length})</h4>
              {collabRoles.filter(r => r.title || r.customTitle).map((role, i) => (
                <div key={i} style={{ marginBottom: 'var(--space-2)' }}>
                  <p><strong>{getRoleDisplayTitle(role)}</strong></p>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{role.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="submission-form__nav">
        {step > 0 && (
          <button type="button" className="btn btn--outline" onClick={() => setStep(s => s - 1)}>
            Back
          </button>
        )}
        <div style={{ flex: 1 }} />
        {step < maxStep ? (
          <button type="button" className="btn btn--primary" disabled={!canProceed()} onClick={() => setStep(s => s + 1)}>
            Continue
          </button>
        ) : (
          <button
            type="button"
            className="btn btn--primary btn--large"
            disabled={isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <>
                <span className="submission-form__spinner" aria-hidden="true" />
                {isEditMode ? 'Updating...' : 'Submitting...'}
              </>
            ) : (
              isEditMode ? 'Update Project' : 'Submit Project'
            )}
          </button>
        )}
      </div>
    </div>
  )
}
