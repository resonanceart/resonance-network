'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { ProfileAvailabilityBadge } from '@/components/profile/ProfileAvailabilityBadge'
import { ProfileTimeline } from '@/components/profile/ProfileTimeline'
import { ShareProfile } from '@/components/profile/ShareProfile'
import { SmartGallery, type GalleryItem } from '@/components/profile/SmartGallery'

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
}

function getSocialIcon(platform: string) {
  const size = 20
  switch (platform) {
    case 'instagram':
      return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>
    case 'linkedin':
      return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="3"/><path d="M7 11v6M7 7v.01M11 17v-4a2 2 0 014 0v4M15 11v6"/></svg>
    case 'github':
      return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
    case 'facebook':
      return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
    case 'behance':
      return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 3.211 3.483 3.312 4.588 1.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988H0V5.021h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zM3 11h3.584c2.508 0 2.906-3-.312-3H3v3zm3.391 3H3v3.016h3.341c3.055 0 2.868-3.016.05-3.016z"/></svg>
    case 'youtube':
      return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="4"/><polygon points="10 8 16 12 10 16" fill="currentColor" stroke="none"/></svg>
    case 'x':
      return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
    case 'tiktok':
      return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2v13a4 4 0 11-3-3.87"/><path d="M12 6c2 1.5 4 2 6 2"/></svg>
    case 'dribbble':
      return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.18 17.72M19.13 5.09C15.22 9.14 10.9 10.44 2.64 10.96M21.75 12.84c-6.62-1.41-12.14 1-16.38 6.32"/></svg>
    case 'spotify':
      return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
    case 'linktree':
      return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18M7 7l5-4 5 4M7 13h10M8 18h8"/></svg>
    default:
      return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
  }
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
  const [coverPositionY, setCoverPositionY] = useState(50)
  const [accentColor, setAccentColor] = useState('#01696F')
  const [availabilityStatus, setAvailabilityStatus] = useState('')
  const [availabilityNote, setAvailabilityNote] = useState('')
  const [profileSkills, setProfileSkills] = useState<Array<{id: string; skill_name: string; category: string; display_order: number}>>([])
  const [profileTools, setProfileTools] = useState<Array<{id: string; tool_name: string; category: string; display_order: number}>>([])
  const [socialLinks, setSocialLinks] = useState<Array<{id: string; platform: string; url: string; display_order: number}>>([])
  const [artistStatement, setArtistStatement] = useState('')
  const [philosophy, setPhilosophy] = useState('')
  const [galleryOrder, setGalleryOrder] = useState<string[]>([])
  const [resumeUrl, setResumeUrl] = useState<string | null>(null)
  const [portfolioPdfUrl, setPortfolioPdfUrl] = useState<string | null>(null)
  const [mediaGallery, setMediaGallery] = useState<Array<{url: string; alt: string; type: string}>>([])
  const [mediaLinks, setMediaLinks] = useState<Array<{label: string; url: string; type: string}>>([])
  const [pastWork, setPastWork] = useState<Array<{url: string; title: string}>>([])
  const [pdfDocuments, setPdfDocuments] = useState<Array<{url: string; title: string}>>([])
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
          if (ext.cover_position && typeof ext.cover_position === 'object') {
            setCoverPositionY((ext.cover_position as {y?: number}).y ?? 50)
          }
          setArtistStatement((ext.artist_statement as string) || '')
          setPhilosophy((ext.philosophy as string) || '')
          setAccentColor((ext.accent_color as string) || '#01696F')
          setResumeUrl((ext.resume_url as string) || null)
          setPortfolioPdfUrl((ext.portfolio_pdf_url as string) || null)
          if (ext.media_gallery) setMediaGallery(ext.media_gallery as any[])
          if (Array.isArray(ext.gallery_order)) setGalleryOrder(ext.gallery_order as string[])
          if (ext.media_links) setMediaLinks(ext.media_links as any[])
          if (ext.past_work) setPastWork(ext.past_work as any[])
          if (ext.pdf_documents) setPdfDocuments(ext.pdf_documents as any[])
          if (ext.timeline) setTimeline(ext.timeline as any[])
        }
        if (data.profileSkills) setProfileSkills(data.profileSkills)
        if (data.profileTools) setProfileTools(data.profileTools)
        if (data.socialLinks) setSocialLinks(data.socialLinks)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user, authLoading])

  // Build unified gallery items from separate data
  function buildGalleryItems(): GalleryItem[] {
    const items: GalleryItem[] = []
    let order = 0

    mediaGallery.forEach((img, i) => {
      items.push({
        id: `img-${i}`,
        type: 'image',
        url: img.url,
        title: img.alt || 'Gallery Image',
        order: order++,
      })
    })

    pastWork.forEach((item, i) => {
      items.push({
        id: `pw-${i}`,
        type: 'image',
        url: item.url,
        title: item.title || 'Past Work',
        subtitle: 'Past Work',
        order: order++,
      })
    })

    if (portfolioPdfUrl) {
      items.push({
        id: 'portfolio-pdf',
        type: 'pdf',
        url: portfolioPdfUrl,
        title: 'Portfolio',
        subtitle: 'PDF Document',
        order: order++,
      })
    }

    if (resumeUrl) {
      items.push({
        id: 'resume-pdf',
        type: 'pdf',
        url: resumeUrl,
        title: 'Resume',
        subtitle: 'PDF Document',
        order: order++,
      })
    }

    pdfDocuments.forEach((doc, i) => {
      items.push({
        id: `pdf-${i}`,
        type: 'pdf',
        url: doc.url,
        thumbnail: (doc as Record<string, unknown>).thumbnail as string | undefined,
        title: doc.title || 'Document',
        subtitle: 'PDF',
        order: order++,
      })
    })

    if (website) {
      try {
        items.push({
          id: 'website',
          type: 'link',
          url: website,
          title: 'Website',
          subtitle: new URL(website).hostname,
          order: order++,
        })
      } catch {}
    }

    mediaLinks.forEach((link, i) => {
      let subtitle = 'website'
      try { subtitle = new URL(link.url).hostname } catch {}
      items.push({
        id: `link-${i}`,
        type: 'link',
        url: link.url,
        thumbnail: (link as Record<string, unknown>).thumbnail as string | undefined,
        title: link.label || 'Link',
        subtitle,
        order: order++,
      })
    })

    // Apply saved gallery order
    if (galleryOrder.length > 0) {
      const orderMap = new Map(galleryOrder.map((id, i) => [id, i]))
      items.sort((a, b) => (orderMap.get(a.id) ?? 999) - (orderMap.get(b.id) ?? 999))
    }

    return items.map((item, i) => ({ ...item, order: i }))
  }

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
  const profileSlug = displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

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
          {coverImageUrl && <img src={coverImageUrl} alt="Cover" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: `center ${coverPositionY}%` }} />}
          <div className="profile-banner__overlay" />
        </section>

        {/* 3-Column Header Grid */}
        <section className="profile-header-grid-section">
          <div className="container">
            <div className="profile-header-grid">
              {/* Col 1: Photo + Skills/Social below */}
              <div>
                <div className="profile-header-grid__photo">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div className="profile-header-grid__initials" style={{ backgroundColor: accentColor }}>{initials}</div>
                  )}
                </div>
                {/* Skills, Location, Social — under the photo */}
                <div style={{ marginTop: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>
                  {locationDisplay && (
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M7 1C4.5 1 2.5 3 2.5 5.5C2.5 9 7 13 7 13s4.5-4 4.5-7.5C11.5 3 9.5 1 7 1z" stroke="currentColor" strokeWidth="1.2"/><circle cx="7" cy="5.5" r="1.5" stroke="currentColor" strokeWidth="1.2"/></svg>
                      {locationDisplay}
                    </p>
                  )}
                  {availabilityStatus && (
                    <div style={{ marginBottom: 'var(--space-2)' }}>
                      <ProfileAvailabilityBadge status={availabilityStatus as 'open' | 'busy' | 'unavailable'} note={availabilityNote} />
                    </div>
                  )}
                  {profileSkills.length > 0 && (
                    <div style={{ marginBottom: 'var(--space-2)' }}>
                      <p className="profile-header-grid__sidebar-label">Skills</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {[...profileSkills].sort((a, b) => a.display_order - b.display_order).map(s => (
                          <span key={s.id} className="profile-skill-tag" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>{s.skill_name}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {socialLinks.length > 0 && (
                    <div style={{ marginTop: 'var(--space-2)' }}>
                      <p className="profile-header-grid__sidebar-label">Social</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {[...socialLinks].sort((a, b) => a.display_order - b.display_order).map(link => (
                          <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" title={link.platform}
                            style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)', textDecoration: 'none' }}>
                            {getSocialIcon(link.platform)}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Col 2: Info (now wider — full remaining space) */}
              <div className="profile-header-grid__info">
                <h1 className="profile-header-grid__name">
                  {displayName}
                  {pronouns && <span className="profile-header-grid__pronouns">({pronouns})</span>}
                </h1>
                <p className="profile-header-grid__title">{professionalTitle || specialties[0] || ''}</p>

                {website && (
                  <div className="profile-link-buttons">
                    <a href={website} target="_blank" rel="noopener noreferrer" className="profile-link-btn--pill">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="8" cy="8" r="6.5"/></svg>
                      Website
                    </a>
                  </div>
                )}

                {bio && (
                  <div className="profile-header-grid__bio">
                    {bio.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
                  </div>
                )}
              </div>

              {/* Skills/Social moved under photo card above */}
            </div>
          </div>
        </section>

        {/* Media Gallery */}
        {(() => {
          const items = buildGalleryItems()
          if (items.length === 0) return null
          return (
            <section className="profile-media-grid-section">
              <div className="container">
                <p className="section-label">Gallery ({items.length} items)</p>
                <SmartGallery items={items} editable={false} />
              </div>
            </section>
          )
        })()}

        {/* Artist Statement — combined, below gallery */}
        {(artistStatement || philosophy) && (
          <section className="profile-two-col-section">
            <div className="container">
              <p className="section-label">Artist Statement</p>
              <div className="profile-two-col__text">
                {artistStatement && artistStatement.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
                {philosophy && philosophy.split('\n\n').map((p, i) => <p key={`ph-${i}`}>{p}</p>)}
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

        {/* Share Profile — show for published or pending profiles */}
        {(profileVisibility === 'published' || profileVisibility === 'pending') && profileSlug && (
          <section className="container" style={{ paddingBottom: 'var(--space-8)' }}>
            <ShareProfile slug={profileSlug} displayName={displayName} />
          </section>
        )}
      </article>
    </>
  )
}
