'use client'
import { useState, useMemo } from 'react'

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

function CharCount({ current, max }: { current: number; max: number }) {
  return (
    <span className="form-hint" style={{ color: current > max * 0.9 ? 'var(--color-primary)' : undefined }}>
      {current}/{max}
    </span>
  )
}

function FieldError({ show, message }: { show: boolean; message?: string }) {
  if (!show) return null
  return <span className="form-hint" style={{ color: '#dc2626' }}>{message || 'This field is required'}</span>
}

function ImagePreview({ file }: { file: File }) {
  const url = useMemo(() => URL.createObjectURL(file), [file])
  return (
    <img
      src={url}
      alt={`Preview of ${file.name}`}
      style={{
        width: '100%',
        maxWidth: '160px',
        height: '100px',
        objectFit: 'cover',
        borderRadius: '8px',
        border: '1px solid var(--color-border)',
        marginTop: 'var(--space-2)',
      }}
    />
  )
}

export function ProjectSubmissionForm() {
  const [step, setStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')

  // Track touched fields for inline validation
  const [touched, setTouched] = useState<Set<string>>(new Set())
  function markTouched(field: string) {
    setTouched(prev => new Set(prev).add(field))
  }

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

  function toggleMulti(value: string, arr: string[], setter: (v: string[]) => void) {
    setter(arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value])
  }

  function canProceed(): boolean {
    if (step === 0) return !!(artistName && artistBio && artistEmail)
    if (step === 1) return !!(projectTitle && oneSentence && vision && experience && goals)
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
          artistName,
          artistBio,
          artistEmail,
          artistWebsite: artistWebsite || null,
          projectTitle,
          oneSentence,
          vision,
          experience,
          story,
          goals,
          domains,
          pathways,
          stage,
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
          <span className="form-success__icon" aria-hidden="true">✓</span>
          <h3>Submission Received</h3>
          <p>Your project has been submitted! Our team will review it within two weeks. In the meantime, you can preview how your page will look:</p>
          {previewUrl && (
            <a href={previewUrl} className="btn btn--primary" style={{ marginTop: 'var(--space-4)', display: 'inline-block' }}>
              Preview Your Project Page →
            </a>
          )}
        </div>
      </div>
    )
  }

  const inputStyle = (field: string, value: string) =>
    touched.has(field) && !value.trim() ? { borderColor: '#dc2626' } : {}

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
            <span className="submission-form__step-num">{i < step ? '✓' : i + 1}</span>
            <span className="submission-form__step-label">{label}</span>
          </button>
        ))}
      </div>

      {error && <p className="form-error" style={{ marginBottom: 'var(--space-4)' }}>{error}</p>}

      {/* Step 1: About You */}
      {step === 0 && (
        <div className="submission-form__section">
          <h3 className="submission-form__section-title">About You</h3>
          <div className="form-group">
            <label htmlFor="sf-name" className="form-label">Full Name *</label>
            <input id="sf-name" type="text" required value={artistName} onChange={e => setArtistName(e.target.value)} onBlur={() => markTouched('artistName')} className="form-input" placeholder="Your full name" style={inputStyle('artistName', artistName)} />
            <FieldError show={touched.has('artistName') && !artistName.trim()} />
          </div>
          <div className="form-group">
            <label htmlFor="sf-bio" className="form-label">Bio *</label>
            <textarea id="sf-bio" required value={artistBio} onChange={e => { if (e.target.value.length <= 700) setArtistBio(e.target.value) }} onBlur={() => markTouched('artistBio')} className="form-textarea" rows={4} placeholder="Tell us about yourself and your practice" style={inputStyle('artistBio', artistBio)} />
            <CharCount current={artistBio.length} max={700} />
            <FieldError show={touched.has('artistBio') && !artistBio.trim()} />
          </div>
          <div className="form-group">
            <label htmlFor="sf-headshot" className="form-label">Upload Headshot</label>
            <input id="sf-headshot" type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f && f.size <= 5 * 1024 * 1024) setArtistHeadshot(f); else if (f) setError('Headshot must be under 5MB') }} className="form-input" />
            <span className="form-hint">Max 5MB. JPG, PNG, or WebP.</span>
            {artistHeadshot && <ImagePreview file={artistHeadshot} />}
          </div>
          <div className="form-group">
            <label htmlFor="sf-email" className="form-label">Email *</label>
            <input id="sf-email" type="email" required value={artistEmail} onChange={e => setArtistEmail(e.target.value)} onBlur={() => markTouched('artistEmail')} className="form-input" placeholder="you@example.com" style={inputStyle('artistEmail', artistEmail)} />
            <FieldError show={touched.has('artistEmail') && !artistEmail.trim()} />
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
            <input id="sf-title" type="text" required value={projectTitle} onChange={e => setProjectTitle(e.target.value)} onBlur={() => markTouched('projectTitle')} className="form-input" placeholder="The name of your project" style={inputStyle('projectTitle', projectTitle)} />
            <FieldError show={touched.has('projectTitle') && !projectTitle.trim()} />
          </div>
          <div className="form-group">
            <label htmlFor="sf-onesentence" className="form-label">One-sentence description of your project *</label>
            <input id="sf-onesentence" type="text" required value={oneSentence} onChange={e => setOneSentence(e.target.value)} onBlur={() => markTouched('oneSentence')} className="form-input" placeholder="A single sentence that captures the essence" style={inputStyle('oneSentence', oneSentence)} />
            <FieldError show={touched.has('oneSentence') && !oneSentence.trim()} />
          </div>
          <div className="form-group">
            <label htmlFor="sf-vision" className="form-label">The Vision — What is this project and why does it matter? *</label>
            <textarea id="sf-vision" required value={vision} onChange={e => setVision(e.target.value)} onBlur={() => markTouched('vision')} className="form-textarea" rows={4} placeholder="Describe the big picture of your project (2-3 paragraphs)" style={inputStyle('vision', vision)} />
            <CharCount current={vision.length} max={5000} />
            <FieldError show={touched.has('vision') && !vision.trim()} />
          </div>
          <div className="form-group">
            <label htmlFor="sf-experience" className="form-label">The Experience — What does it feel like to be in or with this project? *</label>
            <textarea id="sf-experience" required value={experience} onChange={e => setExperience(e.target.value)} onBlur={() => markTouched('experience')} className="form-textarea" rows={4} placeholder="What will it feel like to experience this project?" style={inputStyle('experience', experience)} />
            <CharCount current={experience.length} max={5000} />
            <FieldError show={touched.has('experience') && !experience.trim()} />
          </div>
          <div className="form-group">
            <label htmlFor="sf-story" className="form-label">The Story Behind It (Optional)</label>
            <textarea id="sf-story" value={story} onChange={e => setStory(e.target.value)} className="form-textarea" rows={4} placeholder="The origin story — what inspired this project?" />
            <CharCount current={story.length} max={5000} />
          </div>
          <div className="form-group">
            <label htmlFor="sf-goals" className="form-label">Goals — What does this project aim to achieve? List 3-5 goals. *</label>
            <textarea id="sf-goals" required value={goals} onChange={e => setGoals(e.target.value)} onBlur={() => markTouched('goals')} className="form-textarea" rows={4} placeholder="List what you want to achieve (one per line)" style={inputStyle('goals', goals)} />
            <CharCount current={goals.length} max={5000} />
            <FieldError show={touched.has('goals') && !goals.trim()} />
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
            <CharCount current={materials.length} max={5000} />
          </div>
          <div className="form-group">
            <label htmlFor="sf-collab-needs" className="form-label">What roles or expertise does your project need? *</label>
            <textarea id="sf-collab-needs" required value={collaborationNeeds} onChange={e => setCollaborationNeeds(e.target.value)} onBlur={() => markTouched('collaborationNeeds')} className="form-textarea" rows={4} placeholder="e.g. Structural engineer for load analysis, lighting designer for immersive experience, grant writer for NEA application..." style={inputStyle('collaborationNeeds', collaborationNeeds)} />
            <CharCount current={collaborationNeeds.length} max={5000} />
            <FieldError show={touched.has('collaborationNeeds') && !collaborationNeeds.trim()} />
          </div>
          <div className="form-group">
            <label htmlFor="sf-role-count" className="form-label">How many collaboration roles are you looking to fill?</label>
            <input id="sf-role-count" type="number" min="1" max="20" value={collaborationRoleCount} onChange={e => setCollaborationRoleCount(e.target.value)} className="form-input" placeholder="e.g. 3" />
          </div>
          <div className="form-group">
            <label htmlFor="sf-special" className="form-label">Special Needs</label>
            <textarea id="sf-special" value={specialNeeds} onChange={e => setSpecialNeeds(e.target.value)} className="form-textarea" rows={2} placeholder="Anything else you'd like us to know?" />
            <CharCount current={specialNeeds.length} max={5000} />
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
            {heroImage && <ImagePreview file={heroImage} />}
          </div>
          <div className="form-group">
            <label className="form-label">Gallery images (up to 6, max 5MB each)</label>
            <span className="form-hint" style={{ marginBottom: 'var(--space-3)', display: 'block' }}>Additional images showing concept, materials, models, or renders. Each slot is one image.</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)' }}>
              {[0, 1, 2, 3, 4, 5].map(i => (
                <div key={i}>
                  <label htmlFor={`sf-gallery-${i}`} className="form-label" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    Image {i + 1} {i === 0 ? '' : '(optional)'}
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
                  {galleryImages[i] && <ImagePreview file={galleryImages[i]} />}
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
              {artistHeadshot && (
                <div>
                  <strong>Headshot:</strong>
                  <ImagePreview file={artistHeadshot} />
                </div>
              )}
              <p><strong>Bio:</strong> {artistBio}</p>
            </div>
            <div className="submission-form__review-group">
              <h4>Project</h4>
              <p><strong>Title:</strong> {projectTitle}</p>
              <p><strong>Summary:</strong> {oneSentence}</p>
              <p><strong>Vision:</strong> {vision.slice(0, 500)}{vision.length > 500 ? '...' : ''}</p>
              <p><strong>Experience:</strong> {experience.slice(0, 500)}{experience.length > 500 ? '...' : ''}</p>
              {story && <p><strong>Story:</strong> {story.slice(0, 500)}{story.length > 500 ? '...' : ''}</p>}
              {goals && <p><strong>Goals:</strong> {goals.slice(0, 500)}{goals.length > 500 ? '...' : ''}</p>}
            </div>
            <div className="submission-form__review-group">
              <h4>Classification</h4>
              <p><strong>Domains:</strong> {domains.join(', ')}</p>
              <p><strong>Pathways:</strong> {pathways.join(', ')}</p>
              <p><strong>Stage:</strong> {stage}</p>
              {collaborationNeeds && <p><strong>Collaboration needs:</strong> {collaborationNeeds.slice(0, 500)}{collaborationNeeds.length > 500 ? '...' : ''}</p>}
              {scale && <p><strong>Scale:</strong> {scale}</p>}
              {location && <p><strong>Location:</strong> {location}</p>}
            </div>
            <div className="submission-form__review-group">
              <h4>Images</h4>
              {heroImage && (
                <div>
                  <strong>Hero:</strong>
                  <ImagePreview file={heroImage} />
                </div>
              )}
              {galleryImages.length > 0 && (
                <div>
                  <strong>Gallery ({galleryImages.length} image{galleryImages.length !== 1 ? 's' : ''}):</strong>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginTop: 'var(--space-2)' }}>
                    {galleryImages.map((f, i) => (
                      <ImagePreview key={i} file={f} />
                    ))}
                  </div>
                </div>
              )}
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
