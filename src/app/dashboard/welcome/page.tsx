'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import Link from 'next/link'

const FEATURED_PROJECTS = [
  {
    slug: 'resonance',
    title: 'Resonance',
    description: 'A climbable, large-scale bamboo queen\'s conch shell that transforms sound into a shared experience.',
    heroImage: '/assets/images/projects/money-shot.png',
    domains: ['Architecture', 'Installation'],
  },
  {
    slug: 'terra-nexus',
    title: 'Terra Nexus',
    description: 'A regenerative community pavilion that restores degraded urban land through architecture.',
    heroImage: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=400&h=260&fit=crop',
    domains: ['Architecture', 'Ecology'],
  },
  {
    slug: 'luminous-currents',
    title: 'Luminous Currents',
    description: 'Hundreds of solar-powered light elements that sway with wind and water currents.',
    heroImage: 'https://images.unsplash.com/photo-1504297050568-910d24c426d3?w=400&h=260&fit=crop',
    domains: ['Installation', 'Ecology'],
  },
  {
    slug: 'mycelium-sound-chamber',
    title: 'Mycelium Sound Chamber',
    description: 'An acoustic installation grown from living mycelium — where architecture meets biology.',
    heroImage: 'https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=400&h=260&fit=crop',
    domains: ['Art', 'Ecology'],
  },
]

const TOTAL_STEPS = 4

export default function WelcomePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)

  // Profile fields
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [skillsInput, setSkillsInput] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Link submissions state
  const [linkedCount, setLinkedCount] = useState(0)
  const [linkedItems, setLinkedItems] = useState<{ type: string; title: string }[]>([])

  // Follow state
  const [followedSlugs, setFollowedSlugs] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login')
      return
    }
    // Pre-fill name from user metadata
    const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || ''
    setDisplayName(fullName)

    // Send welcome email (deduped server-side)
    fetch('/api/auth/welcome', { method: 'POST' }).catch(() => {})

    // Auto-link existing submissions
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

  async function saveProfile() {
    setSaving(true)
    const skills = skillsInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

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
    } catch {
      // continue even if save fails
    } finally {
      setSaving(false)
    }
  }

  function toggleFollow(slug: string) {
    setFollowedSlugs(prev => {
      const next = new Set(prev)
      if (next.has(slug)) {
        next.delete(slug)
      } else {
        next.add(slug)
      }
      return next
    })
  }

  async function completeOnboarding() {
    setSaving(true)
    try {
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onboarding_complete: true }),
      })
    } catch {
      // continue regardless
    }
    router.push('/dashboard')
  }

  function handleNext() {
    if (step === 2) {
      saveProfile()
    }
    if (step < TOTAL_STEPS) {
      setStep(step + 1)
    }
  }

  function handleBack() {
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

  return (
    <section className="onboarding">
      <div className="onboarding__container">
        {/* Step Indicator */}
        <div className="onboarding__steps">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              className={`onboarding__step-dot${i + 1 <= step ? ' onboarding__step-dot--active' : ''}`}
            />
          ))}
          <span className="onboarding__step-label">Step {step} of {TOTAL_STEPS}</span>
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="onboarding__panel">
            <h1 className="onboarding__title">Welcome to Resonance Network</h1>
            <p className="onboarding__subtitle">
              You&apos;re joining a community where ambitious creative projects in art, architecture, and ecology find the collaborators and momentum to get built.
            </p>
            <div className="onboarding__features">
              <div className="onboarding__feature">
                <span className="onboarding__feature-icon" aria-hidden="true">&#9679;</span>
                <div>
                  <strong>Follow Projects</strong>
                  <p>Stay updated on projects that inspire you.</p>
                </div>
              </div>
              <div className="onboarding__feature">
                <span className="onboarding__feature-icon" aria-hidden="true">&#9679;</span>
                <div>
                  <strong>Collaborate</strong>
                  <p>Offer your skills to projects that need them.</p>
                </div>
              </div>
              <div className="onboarding__feature">
                <span className="onboarding__feature-icon" aria-hidden="true">&#9679;</span>
                <div>
                  <strong>Submit Your Own</strong>
                  <p>Bring your ambitious project to the network.</p>
                </div>
              </div>
            </div>

            {linkedCount > 0 && (
              <div style={{
                marginTop: 'var(--space-5)',
                padding: 'var(--space-4)',
                borderRadius: '10px',
                background: 'rgba(20,184,166,0.08)',
                border: '1px solid rgba(20,184,166,0.2)',
              }}>
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

        {/* Step 2: Complete Profile */}
        {step === 2 && (
          <div className="onboarding__panel">
            <h1 className="onboarding__title">Complete Your Profile</h1>
            <p className="onboarding__subtitle">
              Help collaborators find you. You can always update this later.
            </p>
            <div className="onboarding__form">
              {/* Avatar */}
              <div className="form-group">
                <label className="form-label">Profile Photo</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt=""
                      style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-border)' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 64, height: 64, borderRadius: '50%',
                        background: 'var(--color-surface)', border: '2px dashed var(--color-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--color-text-muted)', fontSize: '20px',
                      }}
                    >
                      {displayName?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
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
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="onb-name">Display Name</label>
                <input
                  id="onb-name"
                  className="form-input"
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  maxLength={200}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="onb-bio">Bio</label>
                <textarea
                  id="onb-bio"
                  className="form-textarea"
                  value={bio}
                  onChange={e => { if (e.target.value.length <= 500) setBio(e.target.value) }}
                  placeholder="Tell the community about yourself"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="onb-location">Location</label>
                <input
                  id="onb-location"
                  className="form-input"
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="City, region, or remote"
                  maxLength={200}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="onb-skills">Skills</label>
                <input
                  id="onb-skills"
                  className="form-input"
                  type="text"
                  value={skillsInput}
                  onChange={e => setSkillsInput(e.target.value)}
                  placeholder="e.g. bamboo construction, sound design, permaculture"
                />
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Separate with commas</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Discover Projects */}
        {step === 3 && (
          <div className="onboarding__panel">
            <h1 className="onboarding__title">Discover Projects</h1>
            <p className="onboarding__subtitle">
              Here are a few projects to get you started. Follow the ones that inspire you.
            </p>
            <div className="onboarding__projects">
              {FEATURED_PROJECTS.map(project => (
                <div key={project.slug} className="onboarding__project-card">
                  <img
                    src={project.heroImage}
                    alt={project.title}
                    className="onboarding__project-image"
                  />
                  <div className="onboarding__project-body">
                    <h3 className="onboarding__project-title">{project.title}</h3>
                    <p className="onboarding__project-desc">{project.description}</p>
                    <div className="onboarding__project-domains">
                      {project.domains.map(d => (
                        <span key={d} className="onboarding__domain-tag">{d}</span>
                      ))}
                    </div>
                  </div>
                  <button
                    className={`btn btn--sm ${followedSlugs.has(project.slug) ? 'btn--primary' : 'btn--outline'}`}
                    onClick={() => toggleFollow(project.slug)}
                    style={{ flexShrink: 0 }}
                  >
                    {followedSlugs.has(project.slug) ? 'Following' : 'Follow'}
                  </button>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-4)' }}>
              You can discover more projects on the <Link href="/" style={{ color: 'var(--color-accent)' }}>homepage</Link>.
            </p>
          </div>
        )}

        {/* Step 4: All Set */}
        {step === 4 && (
          <div className="onboarding__panel" style={{ textAlign: 'center' }}>
            <div className="onboarding__checkmark" aria-hidden="true">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h1 className="onboarding__title">You&apos;re All Set!</h1>
            <p className="onboarding__subtitle">
              Your account is ready. Here&apos;s where to go from here:
            </p>
            <div className="onboarding__links">
              <Link href="/dashboard" className="btn btn--primary" style={{ width: '100%' }}>
                Go to Dashboard
              </Link>
              <Link href="/" className="btn btn--outline" style={{ width: '100%' }}>
                Browse Projects
              </Link>
              <Link href="/collaborate" className="btn btn--outline" style={{ width: '100%' }}>
                Explore Collaboration Opportunities
              </Link>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="onboarding__nav">
          {step > 1 && step < 4 && (
            <button className="btn btn--outline" onClick={handleBack}>
              Back
            </button>
          )}
          {step === 1 && <div />}
          {step < 4 ? (
            <button
              className="btn btn--primary"
              onClick={handleNext}
              disabled={saving}
            >
              {saving ? 'Saving...' : step === 3 ? 'Continue' : 'Next'}
            </button>
          ) : (
            <button
              className="btn btn--primary"
              onClick={completeOnboarding}
              disabled={saving}
            >
              {saving ? 'Finishing...' : 'Finish Setup'}
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
