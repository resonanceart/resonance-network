'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { loadImportData } from '@/lib/import-store'
import { importAdminBlockBanner } from '@/lib/claim-copy'

interface ImportedProfile {
  name: string
  bio: string
  titles: string[]
  education: string[]
  avatarUrl: string | null
  heroImageUrl: string | null
  galleryImages: Array<{ url: string; alt: string }>
  socialLinks: Array<{ platform: string; url: string }>
  website: string
  sections: Array<{ heading: string; content: string }>
  otherProjects: Array<{ title: string; url: string }>
}

function getSocialIcon(platform: string) {
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
    case 'spotify':
      return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.3"/><path d="M5 7.5c2.5-1 5.5-.8 8 .5M5.5 10c2-0.8 4.5-.6 6.5.4M6 12.5c1.5-.6 3.5-.5 5 .3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
    case 'soundcloud':
      return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M1.5 11V9M3.5 12V8M5.5 13V7M7.5 13V6M9.5 13V5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M11 5c2.5 0 4.5 1.8 4.5 4s-2 4-4.5 4" stroke="currentColor" strokeWidth="1.3"/></svg>
    case 'tiktok':
      return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M10 2v9a3 3 0 11-2.5-2.96" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M10 5c1 1 2.5 1.5 4 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
    case 'facebook':
      return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M16.5 9a7.5 7.5 0 10-8.67 7.41v-5.24H5.98V9h1.85V7.34c0-1.83 1.09-2.84 2.76-2.84.8 0 1.63.14 1.63.14v1.8h-.92c-.9 0-1.19.56-1.19 1.14V9h2.03l-.32 2.17h-1.71v5.24A7.5 7.5 0 0016.5 9z" stroke="currentColor" strokeWidth="1.1"/></svg>
    default:
      return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.3"/><path d="M2 9h14M9 2c2 2 3 4.5 3 7s-1 5-3 7c-2-2-3-4.5-3-7s1-5 3-7z" stroke="currentColor" strokeWidth="1.3"/></svg>
  }
}

export default function ProfileBuilderPreview() {
  const { user } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<ImportedProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Admin block banner state — prevents an admin from silently overwriting
  // their own profile via the scraped import flow. "Continue anyway" unlocks
  // the normal CTA; the live-edit page then shows a confirmation modal.
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
      .then((d) => {
        if (cancelled) return
        setIsAdmin(d?.profile?.role === 'admin')
      })
      .catch(() => { /* non-fatal — no banner */ })
    return () => { cancelled = true }
  }, [user])

  useEffect(() => {
    async function load() {
      // Try IndexedDB first (used by ImportPromptPopup), then sessionStorage
      try {
        const fromDb = await loadImportData<ImportedProfile>('resonance_profile_import')
        if (fromDb) { setData(fromDb); setLoading(false); return }
      } catch { /* ignore */ }
      try {
        const raw = sessionStorage.getItem('resonance_profile_import')
        if (raw) setData(JSON.parse(raw))
      } catch { /* ignore */ }
      setLoading(false)
    }
    load()
  }, [])

  function handleCreateAccount() {
    // Keep sessionStorage intact so profile editor picks it up after signup
    if (user) {
      router.push('/dashboard/profile/live-edit?import=profile')
    } else {
      // Route through login/signup — middleware will redirect after auth
      window.location.href = '/login?tab=signup&redirect=' + encodeURIComponent('/dashboard/profile/live-edit?import=profile')
    }
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: 'var(--space-16) 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Loading profile preview...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="container" style={{ padding: 'var(--space-16) 0', textAlign: 'center' }}>
        <h2>No profile data found</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
          Import a profile first to see the preview.
        </p>
        <Link href="/import" className="btn btn--primary">Go to Import</Link>
      </div>
    )
  }

  const initials = data.name
    .split(' ')
    .map(w => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="live-editor">
      {/* Floating toolbar — shows the builder context */}
      <div className="live-editor__toolbar">
        <div className="live-editor__toolbar-inner container">
          <span className="live-editor__toolbar-title">
            Profile Preview for {data.name}
          </span>
          <div className="live-editor__toolbar-actions">
            {isAdmin && !adminOverrideAck ? (
              <Link href="/admin" className="btn btn--primary btn--sm">
                {importAdminBlockBanner.goToAdminButton}
              </Link>
            ) : (
              <button onClick={handleCreateAccount} className="btn btn--primary btn--sm">
                {user ? 'Open in Profile Editor' : 'Create Account to Save'}
              </button>
            )}
            <Link href="/import" className="btn btn--outline btn--sm">
              Back to Import
            </Link>
          </div>
        </div>
      </div>

      {/* Profile page — same layout as real profiles */}
      <article className="profile-page" style={{ marginTop: '53px' }}>
        {/* Banner */}
        <section
          className="profile-banner"
          style={data.heroImageUrl
            ? undefined
            : { background: 'linear-gradient(135deg, #8B5CF6 0%, #8B5CF6cc 50%, #8B5CF688 100%)' }
          }
        >
          {data.heroImageUrl && (
            <img
              src={data.heroImageUrl}
              alt={`Cover for ${data.name}`}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
          <div className="profile-banner__overlay" />
        </section>

        {/* Header Grid */}
        <section className="profile-header-grid-section">
          <div className="container">
            <div className="profile-header-grid">
              {/* Col 1: Photo + meta */}
              <div>
                <div className="profile-header-grid__photo">
                  {data.avatarUrl ? (
                    <img src={data.avatarUrl} alt={data.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div className="profile-header-grid__initials" style={{ backgroundColor: '#8B5CF6' }}>
                      {initials}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>
                  {/* Education */}
                  {data.education.length > 0 && (
                    <div style={{ marginBottom: 'var(--space-2)' }}>
                      <p className="profile-header-grid__sidebar-label">Education</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {data.education.map((ed, i) => (
                          <span key={i} className="profile-skill-tag" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>{ed}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Social icons */}
                  {data.socialLinks.length > 0 && (
                    <div style={{ marginTop: 'var(--space-2)' }}>
                      <p className="profile-header-grid__sidebar-label">Social</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {data.socialLinks.map(link => (
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
                            {getSocialIcon(link.platform)}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Col 2: Name, title, website, bio */}
              <div className="profile-header-grid__info">
                <h1 className="profile-header-grid__name">{data.name}</h1>
                {data.titles.length > 0 && (
                  <p className="profile-header-grid__title">{data.titles.join(' · ')}</p>
                )}

                {data.website && (
                  <div className="profile-link-buttons">
                    <a href={data.website} target="_blank" rel="noopener noreferrer" className="profile-link-btn--pill">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="8" cy="8" r="6.5"/><path d="M1.5 8h13M8 1.5c1.5 1.5 2.5 3.5 2.5 6.5s-1 5-2.5 6.5c-1.5-1.5-2.5-3.5-2.5-6.5s1-5 2.5-6.5z"/></svg>
                      Website
                    </a>
                  </div>
                )}

                {data.bio && (
                  <div className="profile-header-grid__bio">
                    {data.bio.slice(0, 2000).split('\n\n').map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Gallery */}
        {data.galleryImages.length > 0 && (
          <section className="profile-media-grid-section">
            <div className="container">
              <p className="section-label">Gallery</p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: 'var(--space-3)',
              }}>
                {data.galleryImages.slice(0, 12).map((img, i) => (
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

        {/* Artist Statement / About sections */}
        {data.sections.length > 0 && (
          <section className="profile-two-col-section">
            <div className="container">
              <p className="section-label">About</p>
              <div className="profile-two-col__text">
                {data.sections.slice(0, 3).map((s, i) => (
                  <div key={i}>
                    {s.heading !== 'Content' && <h3 style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>{s.heading}</h3>}
                    {s.content.slice(0, 800).split('\n\n').map((p, j) => <p key={j}>{p}</p>)}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Other projects */}
        {data.otherProjects.length > 0 && (
          <section style={{ padding: 'var(--space-6) 0' }}>
            <div className="container">
              <p className="section-label">Projects</p>
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginTop: 'var(--space-3)' }}>
                {data.otherProjects.map(p => (
                  <span key={p.url} className="profile-link-btn--pill">{p.title}</span>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA section */}
        <section style={{ padding: 'var(--space-8) 0 var(--space-10)' }}>
          <div className="container" style={{ textAlign: 'center', maxWidth: '600px' }}>
            {isAdmin && !adminOverrideAck && (
              <div
                role="alert"
                style={{
                  background: 'rgba(220, 38, 38, 0.06)',
                  border: '1px solid rgba(220, 38, 38, 0.2)',
                  borderRadius: 12,
                  padding: 'var(--space-4)',
                  marginBottom: 'var(--space-5)',
                  textAlign: 'left',
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
            <h2 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>
              This is how your profile will look
            </h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-5)', lineHeight: 1.6 }}>
              Create your account to save this profile and customize it further. Add skills, availability, work experience, and more.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
              {isAdmin && !adminOverrideAck ? (
                <Link href="/admin" className="btn btn--primary" style={{ minWidth: '200px' }}>
                  {importAdminBlockBanner.goToAdminButton}
                </Link>
              ) : (
                <button onClick={handleCreateAccount} className="btn btn--primary" style={{ minWidth: '200px' }}>
                  {user ? 'Open in Profile Editor' : 'Create Account to Save'}
                </button>
              )}
              <Link href="/import" className="btn btn--outline">
                Back to Import
              </Link>
            </div>
          </div>
        </section>
      </article>
    </div>
  )
}
