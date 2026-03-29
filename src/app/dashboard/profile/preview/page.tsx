'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { ProfileAvailabilityBadge } from '@/components/profile/ProfileAvailabilityBadge'
import { ProfileTimeline } from '@/components/profile/ProfileTimeline'

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
}

function getSocialIcon(platform: string) {
  // Simple text fallback for preview — full SVG icons are on the public page
  return <span style={{ fontSize: 'var(--text-xs)' }}>{platform.charAt(0).toUpperCase()}</span>
}

export default function ProfilePreviewPage() {
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)

  // Profile state
  const [displayName, setDisplayName] = useState('')
  const [professionalTitle, setProfessionalTitle] = useState('')
  const [pronouns, setPronouns] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [locationSecondary, setLocationSecondary] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)
  const [accentColor, setAccentColor] = useState('#01696F')
  const [availabilityStatus, setAvailabilityStatus] = useState('')
  const [availabilityNote, setAvailabilityNote] = useState('')
  const [profileSkills, setProfileSkills] = useState<Array<{id: string; skill_name: string; category: string; display_order: number}>>([])
  const [profileTools, setProfileTools] = useState<Array<{id: string; tool_name: string; category: string; display_order: number}>>([])
  const [socialLinks, setSocialLinks] = useState<Array<{id: string; platform: string; url: string; display_order: number}>>([])
  const [artistStatement, setArtistStatement] = useState('')
  const [philosophy, setPhilosophy] = useState('')
  const [resumeUrl, setResumeUrl] = useState<string | null>(null)
  const [portfolioPdfUrl, setPortfolioPdfUrl] = useState<string | null>(null)
  const [mediaGallery, setMediaGallery] = useState<Array<{url: string; alt: string; type: string}>>([])
  const [mediaLinks, setMediaLinks] = useState<Array<{label: string; url: string; type: string}>>([])
  const [pastWork, setPastWork] = useState<Array<{url: string; title: string}>>([])
  const [timeline, setTimeline] = useState<Array<{year: string; title: string; organization?: string; description?: string}>>([])
  const [website, setWebsite] = useState('')
  const [specialties, setSpecialties] = useState<string[]>([])
  const [profileVisibility, setProfileVisibility] = useState('draft')

  useEffect(() => {
    if (authLoading) return
    if (!user) { window.location.href = '/login'; return }

    fetch('/api/user/profile', { credentials: 'same-origin' })
      .then(r => r.json())
      .then(data => {
        const p = data.profile
        const ext = data.extendedProfile || {}
        if (p) {
          setDisplayName(p.display_name || '')
          setBio(p.bio || '')
          setLocation(p.location || '')
          setWebsite(p.website || '')
          setSpecialties(p.skills || [])
          setAvatarUrl(p.avatar_url || null)
          setProfileVisibility(p.profile_visibility || 'draft')
        }
        if (ext) {
          setProfessionalTitle((ext.professional_title as string) || '')
          setPronouns((ext.pronouns as string) || '')
          setLocationSecondary((ext.location_secondary as string) || '')
          setAvailabilityStatus((ext.availability_status as string) || '')
          setAvailabilityNote((ext.availability_note as string) || '')
          setCoverImageUrl((ext.cover_image_url as string) || null)
          setArtistStatement((ext.artist_statement as string) || '')
          setPhilosophy((ext.philosophy as string) || '')
          setAccentColor((ext.accent_color as string) || '#01696F')
          setResumeUrl((ext.resume_url as string) || null)
          setPortfolioPdfUrl((ext.portfolio_pdf_url as string) || null)
          if (ext.media_gallery) setMediaGallery(ext.media_gallery as any[])
          if (ext.media_links) setMediaLinks(ext.media_links as any[])
          if (ext.past_work) setPastWork(ext.past_work as any[])
          if (ext.timeline) setTimeline(ext.timeline as any[])
        }
        if (data.profileSkills) setProfileSkills(data.profileSkills)
        if (data.profileTools) setProfileTools(data.profileTools)
        if (data.socialLinks) setSocialLinks(data.socialLinks)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user, authLoading])

  async function handlePublish() {
    setPublishing(true)
    try {
      await fetch('/api/user/profile', {
        method: 'PUT',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_visibility: 'pending' }),
      })
      setProfileVisibility('pending')
    } catch {}
    setPublishing(false)
  }

  if (authLoading || loading) {
    return <div className="container" style={{ padding: 'var(--space-16) 0', textAlign: 'center' }}><p style={{ color: 'var(--color-text-muted)' }}>Loading preview...</p></div>
  }
  if (!user) return null

  const locationDisplay = [location, locationSecondary].filter(Boolean).join(' / ')
  const initials = getInitials(displayName)

  return (
    <>
      {/* Preview banner */}
      <div style={{ position: 'sticky', top: 64, zIndex: 100, background: 'var(--color-primary)', color: '#fff', padding: 'var(--space-2) 0', textAlign: 'center' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>
            {profileVisibility === 'published' ? 'This is your live profile' : 'Preview — this profile has not been published yet'}
          </span>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <Link href="/dashboard/profile/live-edit" style={{ color: '#fff', fontSize: 'var(--text-sm)', textDecoration: 'underline' }}>
              Back to Editor
            </Link>
            {profileVisibility === 'draft' && (
              <button onClick={handlePublish} disabled={publishing} style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 6, padding: '4px 12px', fontSize: 'var(--text-sm)', fontWeight: 600, cursor: 'pointer' }}>
                {publishing ? 'Submitting...' : 'Submit for Review'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile layout — matches public page */}
      <article className="profile-page">
        {/* Banner */}
        <section className="profile-banner" style={coverImageUrl ? undefined : { background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}cc 50%, ${accentColor}88 100%)` }}>
          {coverImageUrl && <img src={coverImageUrl} alt="Cover" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
          <div className="profile-banner__overlay" />
        </section>

        {/* 3-Column Header Grid */}
        <section className="profile-header-grid-section">
          <div className="container">
            <div className="profile-header-grid">
              {/* Col 1: Photo */}
              <div className="profile-header-grid__photo">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div className="profile-header-grid__initials" style={{ backgroundColor: accentColor }}>{initials}</div>
                )}
              </div>

              {/* Col 2: Info */}
              <div className="profile-header-grid__info">
                <h1 className="profile-header-grid__name">
                  {displayName}
                  {pronouns && <span className="profile-header-grid__pronouns">({pronouns})</span>}
                </h1>
                <p className="profile-header-grid__title">{professionalTitle || specialties[0] || ''}</p>

                <div className="profile-link-buttons">
                  {website && (
                    <a href={website} target="_blank" rel="noopener noreferrer" className="profile-link-btn--pill">Website</a>
                  )}
                  {resumeUrl && (
                    <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="profile-link-btn--pill" download>Resume</a>
                  )}
                  {portfolioPdfUrl && (
                    <a href={portfolioPdfUrl} target="_blank" rel="noopener noreferrer" className="profile-link-btn--pill" download>Portfolio</a>
                  )}
                  {socialLinks.length > 0 && (
                    <div className="profile-link-btn--pill profile-link-btn--social-group">
                      {[...socialLinks].sort((a, b) => a.display_order - b.display_order).map(link => (
                        <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="profile-social-icon-sm" title={link.platform}>{getSocialIcon(link.platform)}</a>
                      ))}
                    </div>
                  )}
                </div>

                {bio && (
                  <div className="profile-header-grid__bio">
                    {bio.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
                  </div>
                )}
              </div>

              {/* Col 3: Skills + Location */}
              <div className="profile-header-grid__sidebar">
                {profileSkills.length > 0 && (
                  <div className="profile-header-grid__skills">
                    <p className="profile-header-grid__sidebar-label">Skills</p>
                    <div className="profile-header-grid__skill-tags">
                      {[...profileSkills].sort((a, b) => a.display_order - b.display_order).map(s => (
                        <span key={s.id} className="profile-skill-tag">{s.skill_name}</span>
                      ))}
                    </div>
                  </div>
                )}
                {profileTools.length > 0 && (
                  <div className="profile-header-grid__skills" style={{ marginTop: 'var(--space-4)' }}>
                    <p className="profile-header-grid__sidebar-label">Tools</p>
                    <div className="profile-header-grid__skill-tags">
                      {[...profileTools].sort((a, b) => a.display_order - b.display_order).map(t => (
                        <span key={t.id} className="profile-skill-tag profile-skill-tag--tool">{t.tool_name}</span>
                      ))}
                    </div>
                  </div>
                )}
                {locationDisplay && (
                  <div className="profile-header-grid__location">
                    <p className="profile-header-grid__sidebar-label">Location</p>
                    <p className="profile-header-grid__location-text">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1C4.5 1 2.5 3 2.5 5.5C2.5 9 7 13 7 13s4.5-4 4.5-7.5C11.5 3 9.5 1 7 1z" stroke="currentColor" strokeWidth="1.2"/><circle cx="7" cy="5.5" r="1.5" stroke="currentColor" strokeWidth="1.2"/></svg>
                      {locationDisplay}
                    </p>
                  </div>
                )}
                {availabilityStatus && (
                  <div style={{ marginTop: 'var(--space-4)' }}>
                    <ProfileAvailabilityBadge status={availabilityStatus as 'open' | 'busy' | 'unavailable'} note={availabilityNote} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Statement / Philosophy */}
        {(artistStatement || philosophy) && (
          <section className="profile-two-col-section">
            <div className="container">
              <div className="profile-two-col">
                {artistStatement && (
                  <div className="profile-two-col__block">
                    <p className="section-label">Artist Statement</p>
                    <div className="profile-two-col__text">{artistStatement.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}</div>
                  </div>
                )}
                {philosophy && (
                  <div className="profile-two-col__block">
                    <p className="section-label">Philosophy</p>
                    <blockquote className="profile-two-col__quote"><p>{philosophy}</p></blockquote>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Media & Links */}
        {(portfolioPdfUrl || resumeUrl || mediaGallery.length > 0 || mediaLinks.length > 0 || pastWork.length > 0 || socialLinks.length > 0) && (
          <section className="profile-media-grid-section">
            <div className="container">
              <p className="section-label">Media &amp; Links</p>
              <div className="media-card-grid">
                {portfolioPdfUrl && (
                  <a href={portfolioPdfUrl} target="_blank" rel="noopener noreferrer" className="media-card media-card--pdf" download>
                    <div className="media-card__icon">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 13h6M9 17h4"/></svg>
                    </div>
                    <p className="media-card__label">Portfolio</p>
                    <span className="media-card__hint">PDF</span>
                  </a>
                )}
                {resumeUrl && (
                  <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="media-card media-card--pdf" download>
                    <div className="media-card__icon">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6M9 15l3 3 3-3"/></svg>
                    </div>
                    <p className="media-card__label">Resume</p>
                    <span className="media-card__hint">PDF</span>
                  </a>
                )}
                {mediaLinks.map((link, i) => (
                  <a key={`ml-${i}`} href={link.url} target="_blank" rel="noopener noreferrer" className={`media-card ${link.type === 'fundraiser' ? 'media-card--fundraiser' : 'media-card--website'}`}>
                    <div className="media-card__icon">
                      {link.type === 'fundraiser' ? (
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                      ) : (
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2c2.5 2.5 4 6 4 10s-1.5 7.5-4 10c-2.5-2.5-4-6-4-10s1.5-7.5 4-10z"/></svg>
                      )}
                    </div>
                    <p className="media-card__label">{link.label || 'Website'}</p>
                    <span className="media-card__hint">{link.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}</span>
                  </a>
                ))}
                {mediaGallery.length > 0 && (
                  <div className="media-card">
                    <div className="media-card__preview--grid">
                      {mediaGallery.filter(m => m.type === 'image').slice(0, 4).map((item, i) => (
                        <img key={i} src={item.url} alt={item.alt} style={{ width: '100%', height: 60, objectFit: 'cover', borderRadius: 4 }} />
                      ))}
                    </div>
                    <p className="media-card__label">Gallery ({mediaGallery.filter(m => m.type === 'image').length})</p>
                  </div>
                )}
                {pastWork.length > 0 && (
                  <div className="media-card">
                    <div className="media-card__preview--grid">
                      {pastWork.slice(0, 4).map((item, i) => (
                        <img key={i} src={item.url} alt={item.title} style={{ width: '100%', height: 60, objectFit: 'cover', borderRadius: 4 }} />
                      ))}
                    </div>
                    <p className="media-card__label">Past Work ({pastWork.length})</p>
                  </div>
                )}
                {socialLinks.length > 0 && (
                  <div className="media-card media-card--social-group">
                    <p className="media-card__label">Social ({socialLinks.length})</p>
                    <div className="media-card__social-icons">
                      {[...socialLinks].sort((a, b) => a.display_order - b.display_order).map(link => (
                        <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="media-card__social-dot" title={link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}>
                          {link.platform.charAt(0).toUpperCase()}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Milestones */}
        {timeline.length > 0 && (
          <section className="profile-milestones-section">
            <div className="container">
              <p className="section-label">Milestones</p>
              <ProfileTimeline entries={timeline as any} />
            </div>
          </section>
        )}
      </article>
    </>
  )
}
