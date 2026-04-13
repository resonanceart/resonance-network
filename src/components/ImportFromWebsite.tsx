'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import Link from 'next/link'
import type { ScrapedProject, ScrapedProfile } from '@/lib/scraper'
import { saveImportData } from '@/lib/import-store'
import { importAdminBlockBanner } from '@/lib/claim-copy'

type ScrapeMode = 'project' | 'profile'
type Step = 'input' | 'scraping' | 'preview' | 'error'

interface ImportFromWebsiteProps {
  backLink: { href: string; label: string }
}

export default function ImportFromWebsite({ backLink }: ImportFromWebsiteProps) {
  const { user } = useAuth()
  const searchParams = useSearchParams()

  const [url, setUrl] = useState('')
  const [mode, setMode] = useState<ScrapeMode>('project')

  // Read ?mode=profile from URL to pre-select profile mode
  useEffect(() => {
    const modeParam = searchParams.get('mode')
    if (modeParam === 'profile') setMode('profile')
  }, [searchParams])
  const [step, setStep] = useState<Step>('input')
  const [error, setError] = useState('')
  const [progress, setProgress] = useState('')
  const [projectData, setProjectData] = useState<ScrapedProject | null>(null)
  const [profileData, setProfileData] = useState<ScrapedProfile | null>(null)

  // If ?preview=project, load saved project data and jump to preview
  useEffect(() => {
    const previewParam = searchParams.get('preview')
    if (previewParam !== 'project') return
    setMode('project')
    async function loadSaved() {
      try {
        const { loadImportData } = await import('@/lib/import-store')
        const saved = await loadImportData<ScrapedProject>('resonance_import_data')
        if (saved) { setProjectData(saved); setStep('preview'); return }
      } catch { /* ignore */ }
      try {
        const raw = sessionStorage.getItem('resonance_import_data')
        if (raw) { setProjectData(JSON.parse(raw)); setStep('preview'); return }
      } catch { /* ignore */ }
    }
    loadSaved()
  }, [searchParams])

  // Admin block: when an admin is about to import into their own profile we
  // surface a banner + "Continue anyway" escape hatch instead of the direct
  // CTA button. Prevents silent overwrites of the admin's own profile row.
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminOverrideAck, setAdminOverrideAck] = useState(false)
  useEffect(() => {
    let cancelled = false
    if (!user) {
      setIsAdmin(false)
      return
    }
    fetch('/api/user/profile', { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return
        setIsAdmin(data?.profile?.role === 'admin')
      })
      .catch(() => { /* non-fatal — no banner */ })
    return () => { cancelled = true }
  }, [user])

  function renderSocialIcon(platform: string) {
    switch (platform) {
      case 'instagram':
        return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><rect x="1.5" y="1.5" width="15" height="15" rx="4" stroke="currentColor" strokeWidth="1.3"/><circle cx="9" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="13.5" cy="4.5" r="1" fill="currentColor"/></svg>
      case 'linkedin':
        return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><rect x="1.5" y="1.5" width="15" height="15" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M5.5 8v4.5M5.5 5.5v.01M8 12.5V9.5c0-1.2.6-1.8 1.7-1.8 1.1 0 1.6.6 1.6 1.8v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
      case 'behance':
        return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M2 5h4c1.7 0 2.5 1 2.5 2.2 0 .9-.5 1.5-1.2 1.8 1 .3 1.5 1.1 1.5 2.1 0 1.5-1 2.4-2.8 2.4H2V5z" stroke="currentColor" strokeWidth="1.3"/><path d="M10.5 10.5h5c0-1.7-1-3-2.5-3s-2.5 1.3-2.5 3c0 1.7 1 3 2.5 3 1 0 1.8-.5 2.2-1.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M10.5 5.5h4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
      case 'github':
        return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M9 1.5C4.9 1.5 1.5 4.9 1.5 9c0 3.3 2.1 6.1 5.1 7.1.4.1.5-.2.5-.4v-1.3c-2.1.5-2.5-1-2.5-1-.3-.8-.8-1.1-.8-1.1-.7-.5.1-.5.1-.5.7.1 1.1.7 1.1.7.6 1.1 1.7.8 2.1.6.1-.5.3-.8.5-.9-1.7-.2-3.4-.8-3.4-3.8 0-.8.3-1.5.7-2-.1-.2-.3-1 .1-2 0 0 .6-.2 2 .7.6-.2 1.2-.3 1.8-.3s1.2.1 1.8.3c1.4-.9 2-.7 2-.7.4 1 .2 1.8.1 2 .5.5.7 1.2.7 2 0 3-1.7 3.6-3.4 3.8.3.2.5.7.5 1.4v2.1c0 .2.1.5.5.4 3-1 5.1-3.8 5.1-7.1C16.5 4.9 13.1 1.5 9 1.5z" stroke="currentColor" strokeWidth="1.1"/></svg>
      case 'vimeo':
        return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M2 7c.2 2 1.5 3.8 2.5 4.8C6 13.3 8 15 10 15c2 0 3.5-1.5 4.5-4.5 1-3 1-4.5.5-5.5s-1.5-1.5-3-1c-1 .3-1.8 1.2-2 2.5.5-.3 1-.4 1.5-.2.5.2.5.7.3 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
      case 'youtube':
        return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><rect x="1.5" y="3.5" width="15" height="11" rx="3" stroke="currentColor" strokeWidth="1.3"/><path d="M7.5 6.5l4 2.5-4 2.5V6.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>
      case 'x':
        return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M2.5 2.5l5.2 7L2.5 15.5h1.3l4.5-5.2 3.7 5.2h4.5L11 8.2l4.5-5.7h-1.3L10.3 7.2 7 2.5H2.5z" stroke="currentColor" strokeWidth="1.1"/></svg>
      case 'tiktok':
        return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M10 2v9a3 3 0 11-2.5-2.96" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M10 5c1 1 2.5 1.5 4 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
      case 'spotify':
        return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.3"/><path d="M5 7.5c2.5-1 5.5-.8 8 .5M5.5 10c2-0.8 4.5-.6 6.5.4M6 12.5c1.5-.6 3.5-.5 5 .3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
      case 'soundcloud':
        return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M1.5 11V9M3.5 12V8M5.5 13V7M7.5 13V6M9.5 13V5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M11 5c2.5 0 4.5 1.8 4.5 4s-2 4-4.5 4" stroke="currentColor" strokeWidth="1.3"/></svg>
      case 'facebook':
        return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M16.5 9a7.5 7.5 0 10-8.67 7.41v-5.24H5.98V9h1.85V7.34c0-1.83 1.09-2.84 2.76-2.84.8 0 1.63.14 1.63.14v1.8h-.92c-.9 0-1.19.56-1.19 1.14V9h2.03l-.32 2.17h-1.71v5.24A7.5 7.5 0 0016.5 9z" stroke="currentColor" strokeWidth="1.1"/></svg>
      default:
        return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.3"/><path d="M2 9h14M9 2c2 2 3 4.5 3 7s-1 5-3 7c-2-2-3-4.5-3-7s1-5 3-7z" stroke="currentColor" strokeWidth="1.3"/></svg>
    }
  }

  async function handleScrape() {
    if (!url.trim()) return
    setStep('scraping')
    setError('')
    setProgress('Fetching page...')

    try {
      setProgress('Analyzing content...')
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ url: url.trim(), type: mode }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Could not read that page. Please check the URL and try again.')

      setProgress('Done!')

      if (mode === 'project') {
        setProjectData(json.data)
      } else {
        setProfileData(json.data)
      }
      setStep('preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setStep('error')
    }
  }

  async function handleUseInEditor() {
    if (!projectData) return
    try { await saveImportData('resonance_import_data', projectData) } catch { /* IndexedDB failed */ }
    try { sessionStorage.setItem('resonance_import_data', JSON.stringify(projectData)) } catch { /* too large for sessionStorage, IndexedDB has it */ }
    if (user) {
      window.location.href = '/dashboard/projects/live-edit?new=true&import=true'
    } else {
      const redirectPath = encodeURIComponent('/dashboard/projects/live-edit?new=true&import=true')
      window.location.href = `/login?tab=signup&redirect=${redirectPath}`
    }
  }

  async function saveProfileData() {
    if (profileData) {
      try { await saveImportData('resonance_profile_import', profileData) } catch { /* IndexedDB failed */ }
      try { sessionStorage.setItem('resonance_profile_import', JSON.stringify(profileData)) } catch { /* too large for sessionStorage, IndexedDB has it */ }
    }
  }

  async function handleUseProfileEditor() {
    await saveProfileData()
    if (user) {
      window.location.href = '/dashboard/profile/live-edit?import=profile'
    } else {
      window.location.href = '/login?tab=signup&redirect=' + encodeURIComponent('/dashboard/profile/live-edit?import=profile')
    }
  }

  return (
    <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-10)' }}>
      <div className="container" style={{ maxWidth: '720px' }}>
      <Link href={backLink.href} className="import-back-link">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 12L6 8l4-4"/></svg>
        {backLink.label}
      </Link>

      <h1 className="import-title">
        Import from Your Website
      </h1>
      <p className="import-subtitle">
        Paste a URL and we&apos;ll build your {mode === 'project' ? 'project page' : 'artist profile'} automatically. Everything is editable before publishing.
      </p>

      {/* Mode Toggle — large, clear cards */}
      <div className="import-mode-grid">
        <button
          onClick={() => { setMode('project'); if (step === 'preview') { setStep('input'); setProjectData(null); setProfileData(null) } }}
          className={`import-mode-card${mode === 'project' ? ' import-mode-card--active import-mode-card--project' : ''}`}
        >
          <span className="import-mode-card__icon">&#x1F3A8;</span>
          <span className="import-mode-card__label">Project Page</span>
          <span className="import-mode-card__desc">Import an artwork, installation, or creative project</span>
        </button>
        <button
          onClick={() => { setMode('profile'); if (step === 'preview') { setStep('input'); setProjectData(null); setProfileData(null) } }}
          className={`import-mode-card${mode === 'profile' ? ' import-mode-card--active import-mode-card--profile' : ''}`}
        >
          <span className="import-mode-card__icon">&#x1F464;</span>
          <span className="import-mode-card__label">Artist Profile</span>
          <span className="import-mode-card__desc">Import your about page or portfolio bio</span>
        </button>
      </div>

      {/* STEP: URL Input */}
      {(step === 'input' || step === 'error') && (
        <div className="import-url-section">
          <label className="import-url-label" htmlFor="import-url">
            {mode === 'project' ? 'Project URL' : 'Profile / About URL'}
          </label>
          <div className="import-url-row">
            <input
              id="import-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={mode === 'project' ? 'https://yourwebsite.com/project' : 'https://yourwebsite.com/about'}
              onKeyDown={(e) => e.key === 'Enter' && handleScrape()}
              className="import-url-input"
            />
            <button
              onClick={handleScrape}
              disabled={!url.trim()}
              className="btn btn--primary btn--xl import-url-btn"
            >
              Build My Page &rarr;
            </button>
          </div>
          {step === 'error' && (
            <div className="import-error">
              {error}
              <button onClick={() => setStep('input')} className="import-error__retry">
                Try again
              </button>
            </div>
          )}

          <div className="import-alt-action">
            <span>Don&apos;t have a website?</span>
            <Link href="/login?tab=signup&redirect=/dashboard/welcome" className="import-alt-action__link">
              Create your page from scratch &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* STEP: Scraping */}
      {step === 'scraping' && (
        <div className="import-scraping">
          <div className="dashboard-spinner" style={{ margin: '0 auto var(--space-4)' }} />
          <p className="import-scraping__status">{progress}</p>
          <p className="import-scraping__url">Reading {url}</p>
        </div>
      )}
      </div>{/* end .container for input/scraping steps */}

      {/* STEP: Preview — Project */}
      {step === 'preview' && mode === 'project' && projectData && (
        <div className="import-preview container" style={{ maxWidth: '800px' }}>
          {/* Hero preview */}
          {projectData.heroImageUrl && (
            <div style={{ borderRadius: '16px', overflow: 'hidden', marginBottom: 'var(--space-5)', aspectRatio: '16/9', position: 'relative' }}>
              <img
                src={projectData.heroImageUrl}
                alt={projectData.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 'var(--space-6) var(--space-5) var(--space-4)', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
                <h2 style={{ color: '#fff', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 700, margin: 0 }}>{projectData.title}</h2>
                {projectData.leadArtistName && (
                  <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: 'var(--space-1)' }}>by {projectData.leadArtistName}</p>
                )}
              </div>
            </div>
          )}

          {!projectData.heroImageUrl && (
            <div style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-5)', background: 'var(--color-surface)', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
              <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 700, margin: '0 0 var(--space-2)' }}>{projectData.title}</h2>
              {projectData.leadArtistName && (
                <p style={{ color: 'var(--color-text-muted)' }}>by {projectData.leadArtistName}</p>
              )}
            </div>
          )}

          {/* Description */}
          {projectData.shortDescription && (
            <p style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-5)', lineHeight: 1.6 }}>
              {projectData.shortDescription}
            </p>
          )}

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', marginBottom: 'var(--space-5)' }}>
            {projectData.suggestedDomains.length > 0 && (
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                {projectData.suggestedDomains.map(d => (
                  <span key={d} className="badge badge--outline" style={{ fontSize: 'var(--text-xs)' }}>{d}</span>
                ))}
              </div>
            )}
            {projectData.suggestedScale && (
              <span className="badge badge--outline" style={{ fontSize: 'var(--text-xs)' }}>{projectData.suggestedScale}</span>
            )}
            {projectData.suggestedStage && (
              <span className="badge badge--outline" style={{ fontSize: 'var(--text-xs)' }}>{projectData.suggestedStage}</span>
            )}
          </div>

          {/* Sections */}
          {projectData.overviewLead && (
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Overview</h3>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{projectData.overviewLead}</p>
              {projectData.overviewBody && (
                <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, marginTop: 'var(--space-3)', whiteSpace: 'pre-wrap' }}>{projectData.overviewBody}</p>
              )}
            </div>
          )}

          {projectData.experience && (
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Experience</h3>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{projectData.experience}</p>
            </div>
          )}

          {projectData.artistStory && (
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Artist Story</h3>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{projectData.artistStory}</p>
            </div>
          )}

          {projectData.materials && (
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Materials & Technology</h3>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{projectData.materials}</p>
            </div>
          )}

          {/* Gallery */}
          {projectData.galleryImages.length > 0 && (
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>Gallery ({projectData.galleryImages.length} images)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 'var(--space-3)' }}>
                {projectData.galleryImages.slice(0, 12).map((img, i) => (
                  <div key={i} style={{ borderRadius: '10px', overflow: 'hidden', aspectRatio: '4/3', background: 'var(--color-surface)' }}>
                    <img src={img.url} alt={img.alt || `Gallery ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key quote */}
          {projectData.keyQuote && (
            <div style={{ marginBottom: 'var(--space-5)', padding: 'var(--space-5)', borderLeft: '3px solid var(--color-accent)', background: 'var(--color-surface)', borderRadius: '0 12px 12px 0' }}>
              <p style={{ fontStyle: 'italic', fontSize: 'var(--text-lg)', lineHeight: 1.6, color: 'var(--color-text-secondary)', margin: 0 }}>
                &ldquo;{projectData.keyQuote}&rdquo;
              </p>
            </div>
          )}

          {/* Social links */}
          {projectData.socialLinks.length > 0 && (
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Social Links</h3>
              <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                {projectData.socialLinks.map(link => (
                  <span key={link.platform} className="badge badge--outline" style={{ fontSize: 'var(--text-sm)', textTransform: 'capitalize' }}>
                    {link.platform}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Other projects by same artist */}
          {projectData.otherProjects.length > 0 && (
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Other Projects by This Artist</h3>
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                {projectData.otherProjects.map(p => (
                  <button
                    key={p.url}
                    onClick={() => { setUrl(p.url); setStep('input') }}
                    className="badge badge--outline"
                    style={{ fontSize: 'var(--text-sm)', cursor: 'pointer', border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}
                  >
                    {p.title}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
                Click to import another project from this artist
              </p>
            </div>
          )}

          {/* Raw sections */}
          {projectData.sections.length > 0 && (
            <details style={{ marginBottom: 'var(--space-5)' }}>
              <summary style={{ cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)' }}>
                View all imported sections ({projectData.sections.length})
              </summary>
              {projectData.sections.map((s, i) => (
                <div key={i} style={{ padding: 'var(--space-3)', background: 'var(--color-surface)', borderRadius: '8px', marginBottom: 'var(--space-2)', border: '1px solid var(--color-border)' }}>
                  <strong style={{ fontSize: 'var(--text-sm)' }}>{s.heading}</strong>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)', whiteSpace: 'pre-wrap' }}>{s.content.slice(0, 300)}{s.content.length > 300 ? '...' : ''}</p>
                </div>
              ))}
            </details>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 'var(--space-3)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
            <button onClick={handleUseInEditor} className="btn btn--primary" style={{ flex: 1 }}>
              {user ? 'Use in Page Builder' : 'Sign Up & Build Your Page'}
            </button>
            <button onClick={() => { setStep('input'); setProjectData(null) }} className="btn btn--outline">
              Try a Different URL
            </button>
          </div>

          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', marginTop: 'var(--space-3)' }}>
            All content is editable in the Page Builder. This is just a preview of what was found.
          </p>
        </div>
      )}

      {/* STEP: Preview — Profile (matches real profile page layout) */}
      {step === 'preview' && mode === 'profile' && profileData && (
        <div className="import-preview">
          {/* Sticky CTA bar at top */}
          <div style={{
            position: 'sticky', top: 64, zIndex: 100,
            background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)',
            padding: 'var(--space-3) var(--space-4)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 'var(--space-3)', flexWrap: 'wrap',
          }}>
            <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>
              Preview for {profileData.name}
            </span>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              {isAdmin && !adminOverrideAck ? (
                <Link href="/admin" className="btn btn--sm btn--primary" style={{ whiteSpace: 'nowrap' }}>
                  {importAdminBlockBanner.goToAdminButton}
                </Link>
              ) : (
                <button
                  onClick={handleUseProfileEditor}
                  className="btn btn--sm"
                  style={{ background: '#8B5CF6', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                >
                  {user ? 'Open in Editor' : 'Build This Profile'}
                </button>
              )}
              <button onClick={() => { setStep('input'); setProfileData(null) }} className="btn btn--outline btn--sm">
                New URL
              </button>
            </div>
          </div>

          {/* Admin block banner — prevents silent overwrites of the admin's
              own profile. Shown above the preview whenever an admin is about
              to import into their own account. "Continue anyway" unlocks the
              existing flow; the live-edit page still shows a confirmation
              modal before any setters run. */}
          {isAdmin && !adminOverrideAck && (
            <div
              role="alert"
              style={{
                background: 'rgba(220, 38, 38, 0.06)',
                border: '1px solid rgba(220, 38, 38, 0.2)',
                borderRadius: 12,
                padding: 'var(--space-4)',
                margin: 'var(--space-4) auto',
                maxWidth: '800px',
              }}
            >
              <h4 style={{
                margin: '0 0 var(--space-2) 0',
                fontSize: 'var(--text-base)',
                fontWeight: 700,
                color: '#b91c1c',
              }}>
                {importAdminBlockBanner.heading}
              </h4>
              <p style={{
                margin: '0 0 var(--space-2) 0',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text)',
                lineHeight: 1.6,
              }}>
                {importAdminBlockBanner.body}
              </p>
              <p style={{
                margin: '0 0 var(--space-3) 0',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-muted)',
                lineHeight: 1.6,
              }}>
                {importAdminBlockBanner.continueHint}
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                <Link href="/admin" className="btn btn--primary btn--sm">
                  {importAdminBlockBanner.goToAdminButton}
                </Link>
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  onClick={() => setAdminOverrideAck(true)}
                >
                  {importAdminBlockBanner.continueButton}
                </button>
              </div>
            </div>
          )}

          <article className="profile-page">
            {/* Banner — use hero image or gradient */}
            <section
              className="profile-banner"
              style={profileData.heroImageUrl
                ? undefined
                : { background: 'linear-gradient(135deg, #8B5CF6 0%, #8B5CF6cc 50%, #8B5CF688 100%)' }
              }
            >
              {profileData.heroImageUrl && (
                <img
                  src={profileData.heroImageUrl}
                  alt={`Cover for ${profileData.name}`}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
              <div className="profile-banner__overlay" />
            </section>

            {/* 2-Column Header Grid */}
            <section className="profile-header-grid-section">
              <div className="container">
                <div className="profile-header-grid">
                  {/* Col 1: Photo + meta */}
                  <div>
                    <div className="profile-header-grid__photo">
                      {profileData.avatarUrl ? (
                        <img src={profileData.avatarUrl} alt={profileData.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div className="profile-header-grid__initials" style={{ backgroundColor: '#8B5CF6' }}>
                          {profileData.name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div style={{ marginTop: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>
                      {/* Education as skill tags */}
                      {profileData.education.length > 0 && (
                        <div style={{ marginBottom: 'var(--space-2)' }}>
                          <p className="profile-header-grid__sidebar-label">Education</p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {profileData.education.map((ed, i) => (
                              <span key={i} className="profile-skill-tag" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>{ed}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Social icons */}
                      {profileData.socialLinks.length > 0 && (
                        <div style={{ marginTop: 'var(--space-2)' }}>
                          <p className="profile-header-grid__sidebar-label">Social</p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {profileData.socialLinks.map(link => (
                              <a
                                key={link.platform}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                                style={{
                                  width: 36, height: 36, minWidth: 44, minHeight: 44,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  borderRadius: '50%', background: 'var(--color-surface)',
                                  border: '1px solid var(--color-border)', color: 'var(--color-text)',
                                  textDecoration: 'none',
                                }}
                              >
                                {renderSocialIcon(link.platform)}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Col 2: Name, title, bio */}
                  <div className="profile-header-grid__info">
                    <h1 className="profile-header-grid__name">{profileData.name}</h1>
                    {profileData.titles.length > 0 && (
                      <p className="profile-header-grid__title">{profileData.titles.join(' · ')}</p>
                    )}

                    {/* Website button */}
                    {profileData.website && (
                      <div className="profile-link-buttons">
                        <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="profile-link-btn--pill">
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="8" cy="8" r="6.5"/><path d="M1.5 8h13M8 1.5c1.5 1.5 2.5 3.5 2.5 6.5s-1 5-2.5 6.5c-1.5-1.5-2.5-3.5-2.5-6.5s1-5 2.5-6.5z"/></svg>
                          Website
                        </a>
                      </div>
                    )}

                    {/* Bio */}
                    {profileData.bio && (
                      <div className="profile-header-grid__bio">
                        {profileData.bio.slice(0, 2000).split('\n\n').map((paragraph, i) => (
                          <p key={i}>{paragraph}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Gallery — matching the smart gallery layout */}
            {profileData.galleryImages.length > 0 && (
              <section style={{ padding: 'var(--space-6) 0' }}>
                <div className="container">
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    gap: 'var(--space-3)',
                  }}>
                    {profileData.galleryImages.slice(0, 12).map((img, i) => (
                      <div key={i} style={{
                        borderRadius: '12px', overflow: 'hidden', aspectRatio: '4/3',
                        background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                      }}>
                        <img src={img.url} alt={img.alt || `Portfolio ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Artist Statement from sections */}
            {profileData.sections.length > 0 && (
              <section className="profile-two-col-section">
                <div className="container">
                  <p className="section-label">About</p>
                  <div className="profile-two-col__text">
                    {profileData.sections.slice(0, 3).map((s, i) => (
                      <div key={i}>
                        {s.heading !== 'Content' && <h3 style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>{s.heading}</h3>}
                        {s.content.slice(0, 800).split('\n\n').map((p, j) => <p key={j}>{p}</p>)}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Other projects by this artist */}
            {profileData.otherProjects.length > 0 && (
              <section style={{ padding: 'var(--space-4) 0' }}>
                <div className="container">
                  <p className="section-label">Projects</p>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginTop: 'var(--space-3)' }}>
                    {profileData.otherProjects.map(p => (
                      <button
                        key={p.url}
                        onClick={() => { setUrl(p.url); setMode('project'); setStep('input'); setProfileData(null) }}
                        className="profile-link-btn--pill"
                        style={{ cursor: 'pointer' }}
                      >
                        {p.title}
                      </button>
                    ))}
                  </div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
                    Click to import a project page
                  </p>
                </div>
              </section>
            )}
          </article>

          {/* Action buttons */}
          <div className="container" style={{ maxWidth: '800px' }}>
            <div style={{ display: 'flex', gap: 'var(--space-3)', paddingTop: 'var(--space-5)', borderTop: '1px solid var(--color-border)', marginTop: 'var(--space-4)' }}>
              {isAdmin && !adminOverrideAck ? (
                <Link
                  href="/admin"
                  className="btn btn--primary"
                  style={{ flex: 1, textAlign: 'center', fontWeight: 600 }}
                >
                  {importAdminBlockBanner.goToAdminButton}
                </Link>
              ) : (
                <button
                  onClick={handleUseProfileEditor}
                  className="btn"
                  style={{ flex: 1, background: '#8B5CF6', color: '#fff', border: 'none', fontWeight: 600, textAlign: 'center', cursor: 'pointer' }}
                >
                  {user ? 'Apply to My Profile' : 'Sign Up & Build Your Profile'}
                </button>
              )}
              <button onClick={() => { setStep('input'); setProfileData(null) }} className="btn btn--outline">
                Try a Different URL
              </button>
            </div>

            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', marginTop: 'var(--space-3)' }}>
              All content is editable in the Profile Editor. This is just a preview of what was found.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
