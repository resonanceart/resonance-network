'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { saveImportData } from '@/lib/import-store'

type CardStep = 'idle' | 'scraping' | 'error'

export default function JoinPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  // Project card state
  const [projectUrl, setProjectUrl] = useState('')
  const [projectStep, setProjectStep] = useState<CardStep>('idle')
  const [projectError, setProjectError] = useState('')
  const [projectProgress, setProjectProgress] = useState('')

  // Profile card state
  const [profileUrl, setProfileUrl] = useState('')
  const [profileStep, setProfileStep] = useState<CardStep>('idle')
  const [profileError, setProfileError] = useState('')
  const [profileProgress, setProfileProgress] = useState('')

  async function handleProjectScrape() {
    if (!projectUrl.trim()) return
    setProjectStep('scraping')
    setProjectError('')
    setProjectProgress('Analyzing your project...')
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ url: projectUrl.trim(), type: 'project' }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Could not read that page.')
      // Save data and redirect
      try { await saveImportData('resonance_import_data', json.data) } catch { /* IndexedDB failed */ }
      try { sessionStorage.setItem('resonance_import_data', JSON.stringify(json.data)) } catch { /* too large */ }
      if (user) {
        router.push('/dashboard/projects/live-edit?new=true&import=true')
      } else {
        // Show the full project preview on /import before asking to sign up
        router.push('/import?preview=project')
      }
    } catch (err) {
      setProjectError(err instanceof Error ? err.message : 'Something went wrong')
      setProjectStep('error')
    }
  }

  async function handleProfileScrape() {
    if (!profileUrl.trim()) return
    setProfileStep('scraping')
    setProfileError('')
    setProfileProgress('Building your profile...')
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ url: profileUrl.trim(), type: 'profile' }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Could not read that page.')
      // Save and redirect to profile preview
      try { await saveImportData('resonance_profile_import', json.data) } catch { /* IndexedDB failed */ }
      try { sessionStorage.setItem('resonance_profile_import', JSON.stringify(json.data)) } catch { /* too large */ }
      router.push('/import/profile-builder')
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Something went wrong')
      setProfileStep('error')
    }
  }

  if (loading) {
    return (
      <section className="join-hero join-hero--compact">
        <div className="container" style={{ textAlign: 'center', padding: 'var(--space-16) 0' }}>
          <div className="dashboard-spinner" aria-label="Loading" />
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="join-hero join-hero--compact">
        <div className="container">
          <p className="section-label">Join the Network</p>
          <h1>{user ? 'Your Network' : 'Join Resonance Network'}</h1>
          <p className="join-hero__sub">
            {user
              ? 'You\u2019re part of the network. Here\u2019s what you can do next.'
              : 'Paste a link to your website and we\u2019ll build your page automatically.'}
          </p>
        </div>
      </section>

      <section className="join-paths join-paths--compact">
        <div className="container">
          <div className="join-cards join-cards--two-up">

            {/* Card 1: Share a Project (Teal) */}
            <div className="join-card join-card--teal join-card--compact">
              <span className="join-card__label join-card__label--teal">I have a project</span>
              <h2>Share Your Project</h2>

              {projectStep === 'idle' || projectStep === 'error' ? (
                <div className="join-card__import">
                  <p className="join-card__import-hint">Paste your project URL and we&apos;ll build your page</p>
                  <div className="join-card__import-row">
                    <input
                      type="url"
                      value={projectUrl}
                      onChange={(e) => setProjectUrl(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleProjectScrape()}
                      placeholder="https://yourproject.com"
                      className="join-card__import-input join-card__import-input--teal"
                    />
                    <button
                      onClick={handleProjectScrape}
                      disabled={!projectUrl.trim()}
                      className="btn btn--teal btn--import"
                    >
                      Import
                    </button>
                  </div>
                  {projectStep === 'error' && (
                    <p className="join-card__import-error">{projectError}</p>
                  )}
                  <span className="join-card__secondary">
                    Don&apos;t have a website? <Link href={user ? '/dashboard/projects/new' : '/login?tab=signup&redirect=/dashboard/welcome'}>Build from scratch</Link>
                  </span>
                </div>
              ) : (
                <div className="join-card__import-loading">
                  <div className="dashboard-spinner" style={{ width: 24, height: 24 }} />
                  <span>{projectProgress}</span>
                </div>
              )}
            </div>

            {/* Card 2: Join as Collaborator (Gold) */}
            <div className="join-card join-card--gold join-card--compact">
              <span className="join-card__label join-card__label--gold">I want to collaborate</span>
              <h2>Join as Collaborator</h2>

              {profileStep === 'idle' || profileStep === 'error' ? (
                <div className="join-card__import">
                  <p className="join-card__import-hint">Paste your portfolio URL and we&apos;ll build your profile</p>
                  <div className="join-card__import-row">
                    <input
                      type="url"
                      value={profileUrl}
                      onChange={(e) => setProfileUrl(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleProfileScrape()}
                      placeholder="https://yourwebsite.com/about"
                      className="join-card__import-input join-card__import-input--gold"
                    />
                    <button
                      onClick={handleProfileScrape}
                      disabled={!profileUrl.trim()}
                      className="btn btn--gold btn--import"
                    >
                      Import
                    </button>
                  </div>
                  {profileStep === 'error' && (
                    <p className="join-card__import-error">{profileError}</p>
                  )}
                  <span className="join-card__secondary">
                    Don&apos;t have a website? <Link href={user ? '/dashboard/profile/live-edit' : '/login?tab=signup&redirect=/dashboard/welcome'}>Create a profile manually</Link>
                  </span>
                </div>
              ) : (
                <div className="join-card__import-loading">
                  <div className="dashboard-spinner" style={{ width: 24, height: 24 }} />
                  <span>{profileProgress}</span>
                </div>
              )}
            </div>

          </div>

          {/* Curator — compact row */}
          <div className="join-curator-row">
            <div className="join-curator-card">
              <span className="join-card__emoji">📖</span>
              <div>
                <h3>Join as Curator</h3>
                <p>Review projects, shape curatorial direction, and champion emerging spatial work.</p>
              </div>
              <Link
                href={user ? '/dashboard' : '/login?tab=signup&redirect=/dashboard/welcome'}
                className="btn btn--outline btn--large"
              >
                {user ? 'Dashboard' : 'Get Started'}
              </Link>
            </div>
          </div>

          {!user && (
            <p style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-6)' }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: 'var(--color-primary)' }}>Sign in</Link>
            </p>
          )}
        </div>
      </section>

      {/* What You Get */}
      <section className="submit-section">
        <div className="container">
          <h2>What You Get</h2>
          <div className="join-benefits__grid">
            <div className="join-benefit-card">
              <h3>Curated Project Page</h3>
              <p>A professional, visual home for your work that you can share with funders, venues, and partners.</p>
            </div>
            <div className="join-benefit-card">
              <h3>Collaboration Matching</h3>
              <p>Your project is visible to a curated community of engineers, fabricators, producers, and specialists.</p>
            </div>
            <div className="join-benefit-card">
              <h3>Curator Feedback</h3>
              <p>Every project receives a personal review from practicing artists and makers.</p>
            </div>
            <div className="join-benefit-card">
              <h3>Community &amp; Resources</h3>
              <p>Access a growing network of creators, experts, and cultural builders.</p>
            </div>
            <div className="join-benefit-card">
              <h3>Credibility Signal</h3>
              <p>Being on Resonance Network tells funders and venues your project meets a standard of rigor.</p>
            </div>
            <div className="join-benefit-card">
              <h3>No Algorithms</h3>
              <p>No feeds, no follower counts. Projects are discovered on merit, not popularity.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="submit-section" id="faq">
        <div className="container">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-list">
            <div className="faq-item">
              <h3>What happens after I share my project?</h3>
              <p>Our curation team reviews every project personally and will respond soon after receiving your submission.</p>
            </div>
            <div className="faq-item">
              <h3>What if my project gets rejected?</h3>
              <p>You&apos;ll get personal feedback and an open invitation to resubmit. The answer is never &quot;no.&quot; It&apos;s &quot;not yet.&quot;</p>
            </div>
            <div className="faq-item">
              <h3>Is there a fee?</h3>
              <p>No. Resonance Network is free for creators and collaborators.</p>
            </div>
            <div className="faq-item">
              <h3>What happens after approval?</h3>
              <p>We&apos;ll build your project page and list your collaboration needs on the network.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
