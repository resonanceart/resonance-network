'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import Link from 'next/link'
import type { ScrapedProject, ScrapedProfile } from '@/lib/scraper'

type ScrapeMode = 'project' | 'profile'
type Step = 'input' | 'scraping' | 'preview' | 'error'

interface ImportFromWebsiteProps {
  backLink: { href: string; label: string }
}

export default function ImportFromWebsite({ backLink }: ImportFromWebsiteProps) {
  const { user } = useAuth()
  const router = useRouter()

  const [url, setUrl] = useState('')
  const [mode, setMode] = useState<ScrapeMode>('project')
  const [step, setStep] = useState<Step>('input')
  const [error, setError] = useState('')
  const [progress, setProgress] = useState('')
  const [projectData, setProjectData] = useState<ScrapedProject | null>(null)
  const [profileData, setProfileData] = useState<ScrapedProfile | null>(null)

  // Mode-specific theme colors
  const modeAccent = mode === 'project'
    ? { bg: 'rgba(1, 105, 111, 0.08)', border: 'rgba(1, 105, 111, 0.25)', text: '#01696F', label: 'Project Page' }
    : { bg: 'rgba(139, 92, 246, 0.08)', border: 'rgba(139, 92, 246, 0.25)', text: '#8B5CF6', label: 'Artist Profile' }

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

  function handleUseInEditor() {
    if (!projectData) return
    sessionStorage.setItem('resonance_import_data', JSON.stringify(projectData))
    if (user) {
      router.push('/dashboard/projects/live-edit?import=true')
    } else {
      const redirectPath = encodeURIComponent('/dashboard/projects/live-edit?import=true')
      router.push(`/login?tab=signup&redirect=${redirectPath}`)
    }
  }

  function handleApplyToProfile() {
    if (!profileData) return
    sessionStorage.setItem('resonance_profile_import', JSON.stringify(profileData))
    if (user) {
      router.push('/dashboard/profile/live-edit?import=profile')
    } else {
      const redirectPath = encodeURIComponent('/dashboard/profile/live-edit?import=profile')
      router.push(`/login?tab=signup&redirect=${redirectPath}`)
    }
  }

  return (
    <div className="container" style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-10)', maxWidth: '800px' }}>
      <Link href={backLink.href} style={{ color: 'var(--color-accent)', textDecoration: 'none', fontSize: 'var(--text-sm)' }}>
        &larr; {backLink.label}
      </Link>

      <h1 style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-2)', fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
        Create Your Page
      </h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)', fontSize: 'var(--text-base)' }}>
        Paste your project website and we&apos;ll build your page automatically. You can edit everything before publishing.
      </p>

      {/* Mode Toggle — visually distinct cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
        <button
          onClick={() => { setMode('project'); if (step === 'preview') { setStep('input'); setProjectData(null); setProfileData(null) } }}
          style={{
            padding: 'var(--space-4)',
            borderRadius: '12px',
            border: mode === 'project' ? '2px solid #01696F' : '1px solid var(--color-border)',
            background: mode === 'project' ? 'rgba(1, 105, 111, 0.08)' : 'var(--color-surface)',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>&#x1F3A8;</div>
          <div style={{ fontWeight: 600, fontSize: 'var(--text-base)', color: mode === 'project' ? '#01696F' : 'var(--color-text)', marginBottom: 'var(--space-1)' }}>
            Project Page
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
            Import an artwork, installation, or creative project
          </div>
        </button>
        <button
          onClick={() => { setMode('profile'); if (step === 'preview') { setStep('input'); setProjectData(null); setProfileData(null) } }}
          style={{
            padding: 'var(--space-4)',
            borderRadius: '12px',
            border: mode === 'profile' ? '2px solid #8B5CF6' : '1px solid var(--color-border)',
            background: mode === 'profile' ? 'rgba(139, 92, 246, 0.08)' : 'var(--color-surface)',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>&#x1F464;</div>
          <div style={{ fontWeight: 600, fontSize: 'var(--text-base)', color: mode === 'profile' ? '#8B5CF6' : 'var(--color-text)', marginBottom: 'var(--space-1)' }}>
            Artist Profile
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
            Import your about page or portfolio bio
          </div>
        </button>
      </div>

      {/* Active mode indicator */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        padding: 'var(--space-2) var(--space-3)',
        borderRadius: '8px',
        background: modeAccent.bg,
        border: `1px solid ${modeAccent.border}`,
        fontSize: 'var(--text-xs)',
        color: modeAccent.text,
        fontWeight: 600,
        marginBottom: 'var(--space-4)',
      }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: modeAccent.text }} />
        {modeAccent.label}
      </div>

      {/* STEP: URL Input */}
      {(step === 'input' || step === 'error') && (
        <div className="import-url-input">
          <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={mode === 'project' ? 'https://yourwebsite.com/project' : 'https://yourwebsite.com/about'}
              onKeyDown={(e) => e.key === 'Enter' && handleScrape()}
              style={{
                flex: 1,
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: '12px',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                fontSize: 'var(--text-base)',
              }}
            />
            <button
              onClick={handleScrape}
              disabled={!url.trim()}
              className="btn btn--primary"
            >
              Build My Page
            </button>
          </div>
          {step === 'error' && (
            <div style={{ padding: 'var(--space-3) var(--space-4)', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', color: '#ef4444', fontSize: 'var(--text-sm)' }}>
              {error}
              <button onClick={() => setStep('input')} style={{ marginLeft: 'var(--space-3)', textDecoration: 'underline', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
                Try again
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP: Scraping */}
      {step === 'scraping' && (
        <div style={{ textAlign: 'center', padding: 'var(--space-10) 0' }}>
          <div className="dashboard-spinner" style={{ margin: '0 auto var(--space-4)' }} />
          <p style={{ color: 'var(--color-text-muted)' }}>{progress}</p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}>
            Reading {url}
          </p>
        </div>
      )}

      {/* STEP: Preview — Project */}
      {step === 'preview' && mode === 'project' && projectData && (
        <div className="import-preview">
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

      {/* STEP: Preview — Profile */}
      {step === 'preview' && mode === 'profile' && profileData && (
        <div className="import-preview">
          {/* Profile header with purple accent */}
          <div style={{
            display: 'flex',
            gap: 'var(--space-4)',
            alignItems: 'center',
            marginBottom: 'var(--space-5)',
            padding: 'var(--space-5)',
            background: 'var(--color-surface)',
            borderRadius: '16px',
            border: '2px solid rgba(139, 92, 246, 0.25)',
          }}>
            {profileData.avatarUrl && (
              <img
                src={profileData.avatarUrl}
                alt={profileData.name}
                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(139, 92, 246, 0.3)' }}
              />
            )}
            <div>
              <h2 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', fontWeight: 700, margin: 0 }}>{profileData.name}</h2>
              {profileData.titles.length > 0 && (
                <p style={{ color: '#8B5CF6', fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}>{profileData.titles.join(' \u00B7 ')}</p>
              )}
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}>{profileData.website}</p>
            </div>
          </div>

          {profileData.education.length > 0 && (
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Education</h3>
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                {profileData.education.map((ed, i) => (
                  <span key={i} className="badge badge--outline" style={{ fontSize: 'var(--text-sm)' }}>{ed}</span>
                ))}
              </div>
            </div>
          )}

          {profileData.bio && (
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Bio</h3>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{profileData.bio.slice(0, 2000)}</p>
            </div>
          )}

          {profileData.galleryImages.length > 0 && (
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>Portfolio ({profileData.galleryImages.length} images)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 'var(--space-3)' }}>
                {profileData.galleryImages.slice(0, 12).map((img, i) => (
                  <div key={i} style={{ borderRadius: '10px', overflow: 'hidden', aspectRatio: '4/3', background: 'var(--color-surface)' }}>
                    <img src={img.url} alt={img.alt || `Image ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {profileData.socialLinks.length > 0 && (
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Social Links</h3>
              <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                {profileData.socialLinks.map(link => (
                  <span key={link.platform} className="badge badge--outline" style={{ fontSize: 'var(--text-sm)', textTransform: 'capitalize' }}>
                    {link.platform}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Other projects by this artist */}
          {profileData.otherProjects.length > 0 && (
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Projects</h3>
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                {profileData.otherProjects.map(p => (
                  <button
                    key={p.url}
                    onClick={() => { setUrl(p.url); setMode('project'); setStep('input'); setProfileData(null) }}
                    className="badge badge--outline"
                    style={{ fontSize: 'var(--text-sm)', cursor: 'pointer', border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}
                  >
                    {p.title}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
                Click to import a project page
              </p>
            </div>
          )}

          <details style={{ marginBottom: 'var(--space-5)' }}>
            <summary style={{ cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)' }}>
              View all imported sections ({profileData.sections.length})
            </summary>
            {profileData.sections.map((s, i) => (
              <div key={i} style={{ padding: 'var(--space-3)', background: 'var(--color-surface)', borderRadius: '8px', marginBottom: 'var(--space-2)', border: '1px solid var(--color-border)' }}>
                <strong style={{ fontSize: 'var(--text-sm)' }}>{s.heading}</strong>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)', whiteSpace: 'pre-wrap' }}>{s.content.slice(0, 300)}{s.content.length > 300 ? '...' : ''}</p>
              </div>
            ))}
          </details>

          {/* Action buttons — profile CTA with purple accent */}
          <div style={{ display: 'flex', gap: 'var(--space-3)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
            <button
              onClick={handleApplyToProfile}
              className="btn"
              style={{
                flex: 1,
                background: '#8B5CF6',
                color: '#fff',
                border: 'none',
                fontWeight: 600,
              }}
            >
              {user ? 'Apply to My Profile' : 'Sign Up & Build Your Profile'}
            </button>
            <button onClick={() => { setStep('input'); setProfileData(null) }} className="btn btn--outline">
              Try a Different URL
            </button>
          </div>

          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', marginTop: 'var(--space-3)' }}>
            All content is editable in the Profile Editor. This is just a preview of what was found.
          </p>
        </div>
      )}
    </div>
  )
}
