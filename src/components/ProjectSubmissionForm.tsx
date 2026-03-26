'use client'
import { useState, useEffect, useCallback, useRef } from 'react'

const DOMAINS = [
  'Architecture', 'Immersive Art', 'Ecological Design', 'Material Innovation',
  'Public Space', 'Community Infrastructure', 'Experimental Technology', 'Social Impact',
]

const PATHWAYS = [
  'Public Art', 'Exhibition/Cultural', 'Festival Installation', 'R&D',
  'Development/Commercial', 'Social Impact/Humanitarian', 'Hospitality',
]

const STAGES = ['Concept', 'Design Development', 'Engineering', 'Fundraising', 'Production']

const STEPS = ['About You', 'Your Project', 'Classification', 'Images', 'Review & Submit']

const DRAFT_KEY = 'resonance-project-draft'

interface DraftData {
  step: number
  artistName: string
  artistBio: string
  artistEmail: string
  artistWebsite: string
  projectTitle: string
  oneSentence: string
  vision: string
  experience: string
  story: string
  goals: string
  domains: string[]
  pathways: string[]
  stage: string
  scale: string
  location: string
  materials: string
  specialNeeds: string
  collaborationNeeds: string
  collaborationRoleCount: string
}

function loadDraft(): DraftData | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function saveDraft(data: DraftData) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data))
  } catch { /* localStorage unavailable */ }
}

function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY)
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

export function ProjectSubmissionForm() {
  const [step, setStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [draftStatus, setDraftStatus] = useState<'idle' | 'saving' | 'saved' | 'restored'>('idle')
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Step 1 — About You
  const [artistName, setArtistName] = useState('')
  const [artistBio, setArtistBio] = useState('')
  const [artistHeadshot, setArtistHeadshot] = useState<File | null>(null)
  const [artistEmail, setArtistEmail] = useState('')
  const [artistWebsite, setArtistWebsite] = useState('')

  // Step 2 — Your Project
  const [projectTitle, setProjectTitle] = useState('')
  const [oneSentence, setOneSentence] = useState('')
  const [vision, setVision] = useState('')
  const [experience, setExperience] = useState('')
  const [story, setStory] = useState('')
  const [goals, setGoals] = useState('')

  // Step 3 — Classification
  const [domains, setDomains] = useState<string[]>([])
  const [pathways, setPathways] = useState<string[]>([])
  const [stage, setStage] = useState('')
  const [scale, setScale] = useState('')
  const [location, setLocation] = useState('')
  const [materials, setMaterials] = useState('')
  const [specialNeeds, setSpecialNeeds] = useState('')
  const [collaborationNeeds, setCollaborationNeeds] = useState('')
  const [collaborationRoleCount, setCollaborationRoleCount] = useState('')

  // Step 4 — Images
  const [heroImage, setHeroImage] = useState<File | null>(null)
  const [galleryImages, setGalleryImages] = useState<File[]>([])

  // Restore draft on mount
  useEffect(() => {
    const draft = loadDraft()
    if (draft) {
      setStep(draft.step || 0)
      setArtistName(draft.artistName || '')
      setArtistBio(draft.artistBio || '')
      setArtistEmail(draft.artistEmail || '')
      setArtistWebsite(draft.artistWebsite || '')
      setProjectTitle(draft.projectTitle || '')
      setOneSentence(draft.oneSentence || '')
      setVision(draft.vision || '')
      setExperience(draft.experience || '')
      setStory(draft.story || '')
      setGoals(draft.goals || '')
      setDomains(draft.domains || [])
      setPathways(draft.pathways || [])
      setStage(draft.stage || '')
      setScale(draft.scale || '')
      setLocation(draft.location || '')
      setMaterials(draft.materials || '')
      setSpecialNeeds(draft.specialNeeds || '')
      setCollaborationNeeds(draft.collaborationNeeds || '')
      setCollaborationRoleCount(draft.collaborationRoleCount || '')
      setDraftStatus('restored')
      setTimeout(() => setDraftStatus('idle'), 3000)
    }
  }, [])

  // Debounced auto-save
  const scheduleSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      setDraftStatus('saving')
      saveDraft({
        step, artistName, artistBio, artistEmail, artistWebsite,
        projectTitle, oneSentence, vision, experience, story, goals,
        domains, pathways, stage, scale, location, materials,
        specialNeeds, collaborationNeeds, collaborationRoleCount,
      })
      setDraftStatus('saved')
      setTimeout(() => setDraftStatus('idle'), 2000)
    }, 1000)
  }, [
    step, artistName, artistBio, artistEmail, artistWebsite,
    projectTitle, oneSentence, vision, experience, story, goals,
    domains, pathways, stage, scale, location, materials,
    specialNeeds, collaborationNeeds, collaborationRoleCount,
  ])

  // Trigger save on any field change
  useEffect(() => {
    if (isSubmitted) return
    if (artistName || artistEmail || projectTitle) {
      scheduleSave()
    }
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current) }
  }, [scheduleSave, isSubmitted, artistName, artistEmail, projectTitle])

  function handleClearDraft() {
    clearDraft()
    setStep(0)
    setArtistName(''); setArtistBio(''); setArtistEmail(''); setArtistWebsite('')
    setProjectTitle(''); setOneSentence(''); setVision(''); setExperience('')
    setStory(''); setGoals('')
    setDomains([]); setPathways([]); setStage(''); setScale(''); setLocation('')
    setMaterials(''); setSpecialNeeds(''); setCollaborationNeeds(''); setCollaborationRoleCount('')
    setHeroImage(null); setGalleryImages([]); setArtistHeadshot(null)
    setDraftStatus('idle')
  }

  function toggleMulti(value: string, arr: string[], setter: (v: string[]) => void) {
    setter(arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value])
  }

  function canProceed(): boolean {
    if (step === 0) return !!(artistName && artistBio && artistEmail)
    if (step === 1) return !!(projectTitle && oneSentence && vision && experience && story && goals)
    if (step === 2) return !!(domains.length > 0 && pathways.length > 0 && stage && collaborationNeeds)
    if (step === 3) return !!heroImage
    return true
  }

  async function handleSubmit() {
    setIsSubmitting(true)
    setError('')
    try {
      const heroBase64 = heroImage ? await compressImage(heroImage) : null
      const headshotBase64 = artistHeadshot ? await compressImage(artistHeadshot, 400, 0.8) : null
      const galleryBase64 = await Promise.all(galleryImages.map(f => compressImage(f)))

      const res = await fetch('/api/submit-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artistName, artistBio, artistEmail,
          artistWebsite: artistWebsite || null,
          projectTitle, oneSentence, vision, experience, story, goals,
          domains, pathways, stage,
          scale: scale || null,
          location: location || null,
          materials: materials || null,
          specialNeeds: specialNeeds || null,
          collaborationNeeds: collaborationNeeds || null,
          collaborationRoleCount: collaborationRoleCount ? parseInt(collaborationRoleCount) : null,
          artistHeadshotData: headshotBase64,
          heroImageData: heroBase64,
          galleryImagesData: JSON.stringify(galleryBase64),
        }),
      })
      const data = await res.json()
      if (data.success) {
        setIsSubmitted(true)
        clearDraft()
        if (data.previewUrl) setPreviewUrl(data.previewUrl)
      } else {
        setError(data.message || 'Something went wrong.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="submission-form">
        <div className="submission-form__success">
          <span className="form-success__icon" aria-hidden="true">&#10003;</span>
          <h3>Submission Received</h3>
          <p>Your project has been submitted! Our team will review it within two weeks. In the meantime, you can preview how your page will look:</p>
          {previewUrl && (
            <a href={previewUrl} className="btn btn--primary" style={{ marginTop: 'var(--space-4)', display: 'inline-block' }}>
              Preview Your Project Page &rarr;
            </a>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="submission-form">
      {/* Progress indicator */}
      <div className="submission-form__progress">
        {STEPS.map((label, i) => (
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
        {(artistName || projectTitle) && (
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

      {/* Step 1: About You */}
      {step === 0 && (
        <div className="submission-form__section">
          <h3 className="submission-form__section-title">About You</h3>
          <div className="form-group">
            <label htmlFor="sf-name" className="form-label">Full Name *</label>
            <input id="sf-name" type="text" required value={artistName} onChange={e => setArtistName(e.target.value)} className="form-input" placeholder="Your full name" />
          </div>
          <div className="form-group">
            <label htmlFor="sf-bio" className="form-label">Bio (700 characters max) *</label>
            <textarea id="sf-bio" required value={artistBio} onChange={e => { if (e.target.value.length <= 700) setArtistBio(e.target.value) }} className="form-textarea" rows={4} placeholder="Tell us about yourself and your practice" />
            <span className="form-hint">{artistBio.length}/700</span>
          </div>
          <div className="form-group">
            <label htmlFor="sf-headshot" className="form-label">Upload Headshot</label>
            <input id="sf-headshot" type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f && f.size <= 5 * 1024 * 1024) setArtistHeadshot(f); else if (f) setError('Headshot must be under 5MB') }} className="form-input" />
            <span className="form-hint">Max 5MB. JPG, PNG, or WebP.</span>
          </div>
          <div className="form-group">
            <label htmlFor="sf-email" className="form-label">Email *</label>
            <input id="sf-email" type="email" required value={artistEmail} onChange={e => setArtistEmail(e.target.value)} className="form-input" placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label htmlFor="sf-website" className="form-label">Website or Portfolio URL</label>
            <input id="sf-website" type="url" value={artistWebsite} onChange={e => setArtistWebsite(e.target.value)} className="form-input" placeholder="https://..." />
          </div>
        </div>
      )}

      {/* Step 2: Your Project */}
      {step === 1 && (
        <div className="submission-form__section">
          <h3 className="submission-form__section-title">Your Project</h3>
          <div className="form-group">
            <label htmlFor="sf-title" className="form-label">Project Title *</label>
            <input id="sf-title" type="text" required value={projectTitle} onChange={e => setProjectTitle(e.target.value)} className="form-input" placeholder="The name of your project" />
          </div>
          <div className="form-group">
            <label htmlFor="sf-onesentence" className="form-label">One-sentence description of your project *</label>
            <input id="sf-onesentence" type="text" required value={oneSentence} onChange={e => setOneSentence(e.target.value)} className="form-input" placeholder="A single sentence that captures the essence" />
          </div>
          <div className="form-group">
            <label htmlFor="sf-vision" className="form-label">The Vision &mdash; What is this project and why does it matter? *</label>
            <textarea id="sf-vision" required value={vision} onChange={e => setVision(e.target.value)} className="form-textarea" rows={4} placeholder="Describe the project and its significance" />
          </div>
          <div className="form-group">
            <label htmlFor="sf-experience" className="form-label">The Experience &mdash; What does it feel like to be in or with this project? *</label>
            <textarea id="sf-experience" required value={experience} onChange={e => setExperience(e.target.value)} className="form-textarea" rows={4} placeholder="Paint the picture of the experience" />
          </div>
          <div className="form-group">
            <label htmlFor="sf-story" className="form-label">The Story Behind It &mdash; What led you to create this? What drives the work? *</label>
            <textarea id="sf-story" required value={story} onChange={e => setStory(e.target.value)} className="form-textarea" rows={4} placeholder="The personal narrative behind the project" />
          </div>
          <div className="form-group">
            <label htmlFor="sf-goals" className="form-label">Goals &mdash; What does this project aim to achieve? List 3-5 goals. *</label>
            <textarea id="sf-goals" required value={goals} onChange={e => setGoals(e.target.value)} className="form-textarea" rows={4} placeholder="One goal per line" />
          </div>
        </div>
      )}

      {/* Step 3: Classification & Details */}
      {step === 2 && (
        <div className="submission-form__section">
          <h3 className="submission-form__section-title">Classification &amp; Details</h3>
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
            <label htmlFor="sf-collab-needs" className="form-label">What roles or expertise does your project need? *</label>
            <textarea id="sf-collab-needs" required value={collaborationNeeds} onChange={e => setCollaborationNeeds(e.target.value)} className="form-textarea" rows={4} placeholder="e.g. Structural engineer for load analysis, lighting designer for immersive experience, grant writer for NEA application..." />
          </div>
          <div className="form-group">
            <label htmlFor="sf-role-count" className="form-label">How many collaboration roles are you looking to fill?</label>
            <input id="sf-role-count" type="number" min="1" max="20" value={collaborationRoleCount} onChange={e => setCollaborationRoleCount(e.target.value)} className="form-input" placeholder="e.g. 3" />
          </div>
          <div className="form-group">
            <label htmlFor="sf-special" className="form-label">Special Needs</label>
            <textarea id="sf-special" value={specialNeeds} onChange={e => setSpecialNeeds(e.target.value)} className="form-textarea" rows={2} placeholder="Anything else you'd like us to know?" />
          </div>
        </div>
      )}

      {/* Step 4: Images */}
      {step === 3 && (
        <div className="submission-form__section">
          <h3 className="submission-form__section-title">Images</h3>
          <div className="form-group">
            <label htmlFor="sf-hero" className="form-label">Main project image *</label>
            <input id="sf-hero" type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f && f.size <= 5 * 1024 * 1024) { setHeroImage(f); setError('') } else if (f) setError('Hero image must be under 5MB') }} className="form-input" />
            <span className="form-hint">This will be your project&apos;s primary visual. Max 5MB.</span>
            {heroImage && <span className="form-hint" style={{ color: 'var(--color-primary)' }}>&#10003; {heroImage.name}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Gallery images (up to 6, max 5MB each)</label>
            <span className="form-hint" style={{ marginBottom: 'var(--space-3)', display: 'block' }}>Additional images showing concept, materials, models, or renders. All optional.</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)' }}>
              {[0, 1, 2, 3, 4, 5].map(i => (
                <div key={i}>
                  <label htmlFor={`sf-gallery-${i}`} className="form-label" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    Image {i + 1} (optional)
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
        </div>
      )}

      {/* Step 5: Review */}
      {step === 4 && (
        <div className="submission-form__section">
          <h3 className="submission-form__section-title">Review Your Submission</h3>
          <div className="submission-form__review">
            <div className="submission-form__review-group">
              <h4>About You</h4>
              <p><strong>Name:</strong> {artistName}</p>
              <p><strong>Email:</strong> {artistEmail}</p>
              {artistWebsite && <p><strong>Website:</strong> {artistWebsite}</p>}
              {artistHeadshot && <p><strong>Headshot:</strong> {artistHeadshot.name}</p>}
              <p><strong>Bio:</strong> {artistBio}</p>
            </div>
            <div className="submission-form__review-group">
              <h4>Project</h4>
              <p><strong>Title:</strong> {projectTitle}</p>
              <p><strong>Summary:</strong> {oneSentence}</p>
              <p><strong>Vision:</strong> {vision}</p>
              <p><strong>Experience:</strong> {experience}</p>
              <p><strong>Story:</strong> {story}</p>
              <p><strong>Goals:</strong> {goals}</p>
            </div>
            <div className="submission-form__review-group">
              <h4>Classification</h4>
              <p><strong>Domains:</strong> {domains.join(', ')}</p>
              <p><strong>Pathways:</strong> {pathways.join(', ')}</p>
              <p><strong>Stage:</strong> {stage}</p>
              {collaborationNeeds && <p><strong>Collaboration needs:</strong> {collaborationNeeds}</p>}
              {scale && <p><strong>Scale:</strong> {scale}</p>}
              {location && <p><strong>Location:</strong> {location}</p>}
              {materials && <p><strong>Materials:</strong> {materials}</p>}
            </div>
            <div className="submission-form__review-group">
              <h4>Images</h4>
              <p><strong>Hero:</strong> {heroImage?.name || 'None'}</p>
              <p><strong>Gallery:</strong> {galleryImages.length} image{galleryImages.length !== 1 ? 's' : ''}</p>
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
        {step < 4 ? (
          <button type="button" className="btn btn--primary" disabled={!canProceed()} onClick={() => setStep(s => s + 1)}>
            Continue
          </button>
        ) : (
          <button type="button" className="btn btn--primary btn--large" disabled={isSubmitting} onClick={handleSubmit}>
            {isSubmitting ? 'Submitting...' : 'Submit Project'}
          </button>
        )}
      </div>
    </div>
  )
}
