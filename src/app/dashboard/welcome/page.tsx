'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import Link from 'next/link'

const DOMAINS = [
  'Architecture', 'Immersive Art', 'Ecological Design', 'Material Innovation',
  'Public Space', 'Community Infrastructure', 'Experimental Technology', 'Social Impact',
]
const PATHWAYS = [
  'Public Art', 'Exhibition/Cultural', 'Festival Installation', 'R&D',
  'Development/Commercial', 'Social Impact/Humanitarian', 'Hospitality',
]
const STAGES = ['Concept', 'Design Development', 'Engineering', 'Fundraising', 'Production']

function compressImage(file: File, maxWidth = 1200, quality = 0.85): Promise<string> {
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

export default function WelcomePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Profile fields (Step 2)
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [skillsInput, setSkillsInput] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Portfolio fields (Step 3)
  const [website, setWebsite] = useState('')
  const [toolsInput, setToolsInput] = useState('')
  const [philosophy, setPhilosophy] = useState('')

  // Decision (Step 4)
  const [hasProject, setHasProject] = useState<boolean | null>(null)

  // Project fields (Steps 5-7)
  const [projectTitle, setProjectTitle] = useState('')
  const [oneSentence, setOneSentence] = useState('')
  const [vision, setVision] = useState('')
  const [story, setStory] = useState('')
  const [projectDomains, setProjectDomains] = useState<string[]>([])
  const [projectPathways, setProjectPathways] = useState<string[]>([])
  const [projectStage, setProjectStage] = useState('')
  const [projectLocation, setProjectLocation] = useState('')
  const [projectMaterials, setProjectMaterials] = useState('')
  const [collaborationNeeds, setCollaborationNeeds] = useState('')
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null)
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const heroInputRef = useRef<HTMLInputElement>(null)

  // Submission result
  const [projectSubmitted, setProjectSubmitted] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')

  // Link submissions state
  const [linkedCount, setLinkedCount] = useState(0)
  const [linkedItems, setLinkedItems] = useState<{ type: string; title: string }[]>([])

  const totalSteps = hasProject ? 8 : 5
  // Map: step 1=Welcome, 2=Profile Basics, 3=Portfolio, 4=Decision
  // If hasProject: 5=Project Basics, 6=Project Details, 7=Project Images, 8=All Set
  // If !hasProject: 5=All Set
  const finalStep = totalSteps

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/login'); return }
    const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || ''
    setDisplayName(fullName)
    fetch('/api/auth/welcome', { method: 'POST' }).catch(() => {})
    fetch('/api/user/link-submissions', { method: 'POST' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.count > 0) {
          setLinkedCount(data.count)
          setLinkedItems(data.linked)
        }
      })
      .catch(() => {})
  }, [user, authLoading, router])

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return
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

  async function saveBasicProfile() {
    setSaving(true)
    const skills = skillsInput.split(',').map(s => s.trim()).filter(Boolean)
    try {
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: displayName.trim() || undefined,
          bio: bio.trim() || undefined,
          location: location.trim() || undefined,
          skills: skills.length > 0 ? skills : undefined,
          avatar_url: avatarUrl || undefined,
        }),
      })
    } catch { /* continue */ }
    finally { setSaving(false) }
  }

  async function savePortfolio() {
    setSaving(true)
    const tools = toolsInput.split(',').map(s => s.trim()).filter(Boolean)
    try {
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          website: website.trim() || undefined,
          tools_and_materials: tools.length > 0 ? tools : undefined,
          extended_philosophy: philosophy.trim() || undefined,
        }),
      })
    } catch { /* continue */ }
    finally { setSaving(false) }
  }

  async function submitProject() {
    setSaving(true)
    setError('')
    try {
      const heroBase64 = heroImageFile ? await compressImage(heroImageFile) : null
      const galleryBase64 = await Promise.all(galleryFiles.map(f => compressImage(f)))

      const res = await fetch('/api/submit-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artistName: displayName,
          artistEmail: user?.email,
          projectTitle,
          oneSentence,
          vision,
          story: story || null,
          domains: projectDomains,
          pathways: projectPathways,
          stage: projectStage || null,
          location: projectLocation || null,
          materials: projectMaterials || null,
          collaborationNeeds: collaborationNeeds || null,
          heroImageData: heroBase64,
          galleryImagesData: galleryBase64.length > 0 ? JSON.stringify(galleryBase64) : null,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setProjectSubmitted(true)
        if (data.previewUrl) setPreviewUrl(data.previewUrl)
      } else {
        setError(data.message || 'Something went wrong submitting your project.')
        return // don't advance
      }
    } catch {
      setError('Network error. Please try again.')
      return
    } finally {
      setSaving(false)
    }
    setStep(finalStep)
  }

  async function completeOnboarding() {
    setSaving(true)
    try {
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onboarding_complete: true }),
      })
    } catch { /* continue */ }
    router.push('/dashboard')
  }

  function toggleMulti(value: string, arr: string[], setter: (v: string[]) => void) {
    setter(arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value])
  }

  function handleNext() {
    if (step === 2) saveBasicProfile()
    if (step === 3) savePortfolio()
    if (step === 7 && hasProject) {
      submitProject()
      return // submitProject handles advancing
    }
    if (step === 4 && hasProject === false) {
      // Skip to final step
      setStep(finalStep)
      return
    }
    if (step < finalStep) setStep(step + 1)
  }

  function handleBack() {
    if (step === finalStep && hasProject === false) {
      setStep(4)
      return
    }
    if (step > 1) setStep(step - 1)
  }

  if (authLoading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
        <div className="dashboard-spinner" aria-label="Loading" />
      </div>
    )
  }
  if (!user) return null

  // Calculate display step for indicator
  const displayTotalSteps = totalSteps
  const displayStep = step

  return (
    <section className="onboarding">
      <div className="onboarding__container">
        {/* Step Indicator */}
        <div className="onboarding__steps">
          {Array.from({ length: displayTotalSteps }, (_, i) => (
            <div
              key={i}
              className={`onboarding__step-dot${i + 1 <= displayStep ? ' onboarding__step-dot--active' : ''}`}
            />
          ))}
          <span className="onboarding__step-label">Step {displayStep} of {displayTotalSteps}</span>
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="onboarding__panel">
            <h1 className="onboarding__title">Welcome to Resonance Network</h1>
            <p className="onboarding__subtitle">
              You&apos;re joining a curated guild where concept-ready immersive and regenerative spatial projects find aligned collaborators, honest feedback, and the momentum to get built.
            </p>
            <div className="onboarding__features">
              <div className="onboarding__feature">
                <span className="onboarding__feature-icon" aria-hidden="true">&#9679;</span>
                <div>
                  <strong>Build Your Profile</strong>
                  <p>Showcase your work, skills, and experience.</p>
                </div>
              </div>
              <div className="onboarding__feature">
                <span className="onboarding__feature-icon" aria-hidden="true">&#9679;</span>
                <div>
                  <strong>Share Projects</strong>
                  <p>Bring your ambitious ideas to the network.</p>
                </div>
              </div>
              <div className="onboarding__feature">
                <span className="onboarding__feature-icon" aria-hidden="true">&#9679;</span>
                <div>
                  <strong>Collaborate</strong>
                  <p>Connect with engineers, fabricators, designers, and more.</p>
                </div>
              </div>
            </div>
            {linkedCount > 0 && (
              <div style={{ marginTop: 'var(--space-5)', padding: 'var(--space-4)', borderRadius: '10px', background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.2)' }}>
                <strong style={{ color: 'var(--color-primary)' }}>
                  We found {linkedCount} existing submission{linkedCount !== 1 ? 's' : ''}!
                </strong>
                <ul style={{ margin: 'var(--space-2) 0 0', paddingLeft: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                  {linkedItems.map((item, i) => (
                    <li key={i}>{item.title} ({item.type})</li>
                  ))}
                </ul>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
                  These are now linked to your account. View them in your dashboard.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Profile Basics */}
        {step === 2 && (
          <div className="onboarding__panel">
            <h1 className="onboarding__title">Complete Your Profile</h1>
            <p className="onboarding__subtitle">Help collaborators and project teams find you.</p>
            <div className="onboarding__form">
              <div className="form-group">
                <label className="form-label">Profile Photo</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-border)' }} />
                  ) : (
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-surface)', border: '2px dashed var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '20px' }}>
                      {displayName?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <button type="button" className="btn btn--outline" style={{ fontSize: 'var(--text-sm)' }} onClick={() => fileInputRef.current?.click()}>Upload Photo</button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="onb-name">Display Name</label>
                <input id="onb-name" className="form-input" type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" maxLength={200} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="onb-bio">Bio</label>
                <textarea id="onb-bio" className="form-textarea" value={bio} onChange={e => { if (e.target.value.length <= 500) setBio(e.target.value) }} placeholder="Tell the community about yourself" rows={3} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="onb-location">Location</label>
                <input id="onb-location" className="form-input" type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="City, region, or remote" maxLength={200} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="onb-skills">Skills</label>
                <input id="onb-skills" className="form-input" type="text" value={skillsInput} onChange={e => setSkillsInput(e.target.value)} placeholder="e.g. bamboo construction, sound design, permaculture" />
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Separate with commas</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Portfolio */}
        {step === 3 && (
          <div className="onboarding__panel">
            <h1 className="onboarding__title">Your Portfolio</h1>
            <p className="onboarding__subtitle">Add some details to make your profile stand out. You can always update these later.</p>
            <div className="onboarding__form">
              <div className="form-group">
                <label className="form-label" htmlFor="onb-website">Website / Portfolio URL</label>
                <input id="onb-website" className="form-input" type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://..." />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="onb-tools">Tools &amp; Materials</label>
                <input id="onb-tools" className="form-input" type="text" value={toolsInput} onChange={e => setToolsInput(e.target.value)} placeholder="e.g. Rhino 3D, bamboo, Arduino, welding" />
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Separate with commas</span>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="onb-philosophy">Your Approach</label>
                <textarea id="onb-philosophy" className="form-textarea" value={philosophy} onChange={e => { if (e.target.value.length <= 300) setPhilosophy(e.target.value) }} placeholder="In a sentence or two, what drives your work?" rows={2} />
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{philosophy.length}/300</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Decision */}
        {step === 4 && (
          <div className="onboarding__panel">
            <h1 className="onboarding__title">Do You Have a Project?</h1>
            <p className="onboarding__subtitle">You can always share a project later from your dashboard.</p>
            <div className="onboarding__decision-cards">
              <button
                className={`onboarding__decision-card${hasProject === true ? ' onboarding__decision-card--selected' : ''}`}
                onClick={() => setHasProject(true)}
                type="button"
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
                <h3>Yes, I have a project</h3>
                <p>I want to share my project and find collaborators.</p>
              </button>
              <button
                className={`onboarding__decision-card${hasProject === false ? ' onboarding__decision-card--selected' : ''}`}
                onClick={() => setHasProject(false)}
                type="button"
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <h3>Not yet — I&apos;m here to collaborate</h3>
                <p>I want to explore projects and offer my skills.</p>
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Project Basics (only if hasProject) */}
        {step === 5 && hasProject && (
          <div className="onboarding__panel">
            <h1 className="onboarding__title">Tell Us About Your Project</h1>
            <p className="onboarding__subtitle">Start with the essentials — you can add more details later.</p>
            <div className="onboarding__form">
              {error && <p className="form-error" style={{ marginBottom: 'var(--space-3)' }}>{error}</p>}
              <div className="form-group">
                <label className="form-label" htmlFor="onb-proj-title">Project Title *</label>
                <input id="onb-proj-title" className="form-input" type="text" required value={projectTitle} onChange={e => setProjectTitle(e.target.value)} placeholder="The name of your project" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="onb-proj-sentence">One-Sentence Summary *</label>
                <input id="onb-proj-sentence" className="form-input" type="text" required value={oneSentence} onChange={e => setOneSentence(e.target.value)} placeholder="Capture the essence in a single sentence" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="onb-proj-vision">The Vision — What is this project and why does it matter? *</label>
                <textarea id="onb-proj-vision" className="form-textarea" required value={vision} onChange={e => setVision(e.target.value)} placeholder="Describe the project and its significance" rows={4} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="onb-proj-story">The Story — What led you to create this?</label>
                <textarea id="onb-proj-story" className="form-textarea" value={story} onChange={e => setStory(e.target.value)} placeholder="The personal narrative behind the project" rows={3} />
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Project Details (only if hasProject) */}
        {step === 6 && hasProject && (
          <div className="onboarding__panel">
            <h1 className="onboarding__title">Project Details</h1>
            <p className="onboarding__subtitle">Help us categorize and match your project.</p>
            <div className="onboarding__form">
              <div className="form-group">
                <p className="form-label">Domains</p>
                <div className="onboarding__checkbox-grid">
                  {DOMAINS.map(d => (
                    <label key={d} className="onboarding__checkbox-item">
                      <input type="checkbox" checked={projectDomains.includes(d)} onChange={() => toggleMulti(d, projectDomains, setProjectDomains)} />
                      <span>{d}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <p className="form-label">Pathways</p>
                <div className="onboarding__checkbox-grid">
                  {PATHWAYS.map(p => (
                    <label key={p} className="onboarding__checkbox-item">
                      <input type="checkbox" checked={projectPathways.includes(p)} onChange={() => toggleMulti(p, projectPathways, setProjectPathways)} />
                      <span>{p}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="onb-proj-stage">Current Stage</label>
                <select id="onb-proj-stage" className="form-select" value={projectStage} onChange={e => setProjectStage(e.target.value)}>
                  <option value="">Select stage...</option>
                  {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="onb-proj-location">Location</label>
                <input id="onb-proj-location" className="form-input" type="text" value={projectLocation} onChange={e => setProjectLocation(e.target.value)} placeholder="City, region, or site flexible" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="onb-proj-materials">Materials &amp; Processes</label>
                <textarea id="onb-proj-materials" className="form-textarea" value={projectMaterials} onChange={e => setProjectMaterials(e.target.value)} placeholder="e.g. bamboo, steel fabrication, projection mapping..." rows={2} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="onb-proj-collab">Collaboration Needs</label>
                <textarea id="onb-proj-collab" className="form-textarea" value={collaborationNeeds} onChange={e => setCollaborationNeeds(e.target.value)} placeholder="What roles or expertise does your project need?" rows={3} />
              </div>
            </div>
          </div>
        )}

        {/* Step 7: Project Images (only if hasProject) */}
        {step === 7 && hasProject && (
          <div className="onboarding__panel">
            <h1 className="onboarding__title">Project Images</h1>
            <p className="onboarding__subtitle">Show us what your project looks like. A strong hero image makes a big difference.</p>
            <div className="onboarding__form">
              {error && <p className="form-error" style={{ marginBottom: 'var(--space-3)' }}>{error}</p>}
              <div className="form-group">
                <label className="form-label">Main Project Image *</label>
                <div
                  className="onboarding__image-upload"
                  onClick={() => heroInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter') heroInputRef.current?.click() }}
                >
                  {heroImageFile ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <span style={{ color: 'var(--color-primary)' }}>&#10003;</span>
                      <span>{heroImageFile.name}</span>
                      <button type="button" className="btn btn--ghost btn--sm" onClick={e => { e.stopPropagation(); setHeroImageFile(null) }}>Remove</button>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" style={{ opacity: 0.5 }}>
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
                      </svg>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>Click to upload your hero image (max 5MB)</p>
                    </div>
                  )}
                </div>
                <input ref={heroInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
                  const f = e.target.files?.[0]
                  if (f && f.size <= 5 * 1024 * 1024) { setHeroImageFile(f); setError('') }
                  else if (f) setError('Image must be under 5MB')
                }} />
              </div>
              <div className="form-group">
                <label className="form-label">Gallery Images (optional, up to 6)</label>
                <div className="onboarding__gallery-grid">
                  {[0, 1, 2, 3, 4, 5].map(i => (
                    <div key={i}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => {
                          const f = e.target.files?.[0]
                          if (f && f.size > 5 * 1024 * 1024) { setError('Image must be under 5MB'); return }
                          setGalleryFiles(prev => {
                            const next = [...prev]
                            if (f) next[i] = f
                            return next
                          })
                          setError('')
                        }}
                        className="form-input"
                        style={{ fontSize: 'var(--text-xs)' }}
                      />
                      {galleryFiles[i] && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)' }}>&#10003; {galleryFiles[i].name}</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Final Step: All Set */}
        {step === finalStep && (
          <div className="onboarding__panel" style={{ textAlign: 'center' }}>
            <div className="onboarding__checkmark" aria-hidden="true">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h1 className="onboarding__title">You&apos;re All Set!</h1>
            <p className="onboarding__subtitle">
              {projectSubmitted
                ? 'Your profile is live and your project has been shared for review. We\u2019ll notify you when it\u2019s approved.'
                : 'Your profile is ready. Here\u2019s where to go from here:'}
            </p>
            {projectSubmitted && previewUrl && (
              <a href={previewUrl} className="btn btn--outline" style={{ marginBottom: 'var(--space-4)', display: 'inline-block' }}>
                Preview Your Project &rarr;
              </a>
            )}
            <div className="onboarding__links">
              <Link href="/dashboard" className="btn btn--primary" style={{ width: '100%' }}>Go to Dashboard</Link>
              {!projectSubmitted && (
                <Link href="/dashboard/projects/new" className="btn btn--outline" style={{ width: '100%' }}>Share a Project</Link>
              )}
              <Link href="/collaborate" className="btn btn--outline" style={{ width: '100%' }}>Browse Open Roles</Link>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="onboarding__nav">
          {step > 1 && step < finalStep && (
            <button className="btn btn--outline" onClick={handleBack}>Back</button>
          )}
          {(step === 1 || step === finalStep) && <div />}
          {step === 4 ? (
            <button
              className="btn btn--primary"
              onClick={handleNext}
              disabled={hasProject === null}
            >
              Continue
            </button>
          ) : step < finalStep ? (
            <button
              className="btn btn--primary"
              onClick={handleNext}
              disabled={saving || (step === 5 && hasProject === true && (!projectTitle || !oneSentence || !vision)) || (step === 7 && hasProject === true && !heroImageFile)}
            >
              {saving ? 'Saving...' : step === 7 ? 'Share Project' : 'Next'}
            </button>
          ) : (
            <button className="btn btn--primary" onClick={completeOnboarding} disabled={saving}>
              {saving ? 'Finishing...' : 'Finish Setup'}
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
