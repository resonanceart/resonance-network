'use client'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/Badge'

interface CollaboratorProfile {
  id: string
  created_at: string
  name: string
  email: string
  photo_url: string | null
  headshot_data: string | null
  skills: string | null
  portfolio: string | null
  availability: string | null
  notes: string | null
  status: string
  location: string | null
  bio: string | null
  title: string | null
}

export default function ProfilePreviewPage({ params }: { params: { id: string } }) {
  const [profile, setProfile] = useState<CollaboratorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [actionStatus, setActionStatus] = useState<'idle' | 'approving' | 'rejecting' | 'approved' | 'rejected'>('idle')
  const [isAdmin, setIsAdmin] = useState(false)

  // Check if URL has ?admin=true to show admin controls
  useEffect(() => {
    const params2 = new URLSearchParams(window.location.search)
    if (params2.get('admin') === 'true') {
      const pw = window.prompt('Enter admin password to enable approval controls:')
      if (pw) {
        fetch('/api/admin/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: pw }),
        }).then(r => r.json()).then(d => {
          if (d.success) setIsAdmin(true)
        }).catch(() => {})
      }
    }
  }, [])

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`/api/preview?type=profile&id=${encodeURIComponent(params.id)}`)
        if (!res.ok) {
          console.error('Profile preview fetch failed:', res.status, res.statusText)
          setNotFound(true)
          setLoading(false)
          return
        }
        const json = await res.json()
        if (json.error || !json.data) {
          console.error('Profile preview fetch error:', json.error)
          setNotFound(true)
        } else {
          setProfile(json.data)
        }
      } catch (err) {
        console.error('Profile preview fetch exception:', err)
        setNotFound(true)
      }
      setLoading(false)
    }
    fetchProfile()
  }, [params.id])

  async function handleAction(action: 'approve' | 'reject') {
    const confirmed = window.confirm(
      action === 'approve'
        ? 'Approve this profile? It will become visible on the network.'
        : 'Reject this profile?'
    )
    if (!confirmed) return

    setActionStatus(action === 'approve' ? 'approving' : 'rejecting')
    try {
      const res = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'profile', id: params.id, action }),
      })
      const data = await res.json()
      if (data.success) {
        setActionStatus(action === 'approve' ? 'approved' : 'rejected')
      } else {
        alert(data.message || 'Action failed')
        setActionStatus('idle')
      }
    } catch {
      alert('Network error. Please try again.')
      setActionStatus('idle')
    }
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: 'var(--space-16) 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Loading preview...</p>
      </div>
    )
  }

  if (notFound || !profile) {
    return (
      <div className="container" style={{ padding: 'var(--space-16) 0', textAlign: 'center' }}>
        <h2>Preview Not Found</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>This profile may not exist or has been removed.</p>
      </div>
    )
  }

  // Map Supabase fields to profile shape
  const photoSrc = profile.headshot_data || profile.photo_url || null
  const specialties = profile.skills ? profile.skills.split(',').map(s => s.trim()).filter(Boolean) : []
  const displayTitle = profile.title || profile.availability || 'Collaborator'
  const displayBio = profile.bio || profile.skills || ''
  const portfolioLinks = profile.portfolio
    ? profile.portfolio.split('\n').filter(Boolean).map(url => ({
        label: url.replace(/https?:\/\/(www\.)?/, '').split('/')[0],
        url: url.startsWith('http') ? url : `https://${url}`,
      }))
    : []

  return (
    <article className="profile-page">
      {/* Status banner */}
      {actionStatus === 'approved' ? (
        <div className="draft-banner draft-banner--approved">
          <div className="container">
            <strong>APPROVED</strong> — This profile is now live on the network.
          </div>
        </div>
      ) : actionStatus === 'rejected' ? (
        <div className="draft-banner draft-banner--rejected">
          <div className="container">
            <strong>REJECTED</strong> — This profile has been declined.
          </div>
        </div>
      ) : (
        <div className="draft-banner">
          <div className="container">
            <strong>DRAFT PREVIEW</strong> — This page is not public yet. Pending review by the Resonance Network team.
          </div>
        </div>
      )}

      {/* Admin action bar — only visible to authenticated admins */}
      {isAdmin && profile.status === 'new' && actionStatus === 'idle' && (
        <div className="admin-action-bar">
          <div className="container" style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', padding: 'var(--space-4) 0' }}>
            <button className="btn btn--approve" onClick={() => handleAction('approve')}>Approve</button>
            <button className="btn btn--reject" onClick={() => handleAction('reject')}>Reject</button>
          </div>
        </div>
      )}
      {(actionStatus === 'approving' || actionStatus === 'rejecting') && (
        <div className="admin-action-bar">
          <div className="container" style={{ textAlign: 'center', padding: 'var(--space-4) 0', color: 'var(--color-text-muted)' }}>
            {actionStatus === 'approving' ? 'Approving...' : 'Rejecting...'}
          </div>
        </div>
      )}

      {/* Profile Header */}
      <section className="profile-header" style={{ paddingTop: 'var(--space-8)' }}>
        <div className="container">
          <div className="profile-header__inner">
            {photoSrc && (
              <div className="profile-header__avatar">
                <img
                  src={photoSrc}
                  alt={`Photo of ${profile.name}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            )}
            <div className="profile-header__info">
              <h1 className="profile-header__name">{profile.name}</h1>
              <p className="profile-header__title">{displayTitle}</p>
              {profile.location && (
                <p className="profile-header__location">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M7 1C4.5 1 2.5 3 2.5 5.5C2.5 9 7 13 7 13s4.5-4 4.5-7.5C11.5 3 9.5 1 7 1z" stroke="currentColor" strokeWidth="1.2"/>
                    <circle cx="7" cy="5.5" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
                  </svg>
                  {profile.location}
                </p>
              )}
            </div>
            <div className="profile-header__actions">
              {profile.email && (
                <a
                  href={`mailto:${profile.email}?subject=Collaboration%20Inquiry%20via%20Resonance%20Network`}
                  className="btn btn--primary"
                >
                  Get in Touch
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Specialties */}
      {specialties.length > 0 && (
        <section className="profile-specialties">
          <div className="container">
            <div className="profile-specialties__list">
              {specialties.map(s => <Badge key={s} variant="domain">{s}</Badge>)}
            </div>
          </div>
        </section>
      )}

      {/* About / Bio */}
      {displayBio && (
        <section className="profile-about">
          <div className="container">
            <p className="section-label">About</p>
            <div className="profile-about__text">
              {displayBio.split('\n\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Portfolio / Links */}
      {portfolioLinks.length > 0 && (
        <section className="profile-links-section">
          <div className="container">
            <p className="section-label">Portfolio</p>
            <div className="profile-links-row">
              {portfolioLinks.map(link => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="profile-link-btn"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M6.5 9.5l3-3M7 6.5H5.5a2.5 2.5 0 000 5H7M9 6.5h1.5a2.5 2.5 0 010 5H9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                  <span>{link.label}</span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Additional Notes */}
      {profile.notes && (
        <section className="profile-philosophy">
          <div className="container">
            <p className="section-label">Notes</p>
            <blockquote className="profile-philosophy__quote">
              <p>{profile.notes}</p>
            </blockquote>
          </div>
        </section>
      )}

      {/* CTA */}
      {profile.email && (
        <section className="profile-cta">
          <div className="container">
            <h2>Work with {profile.name.split(' ')[0]}</h2>
            <p>Interested in collaborating or learning more?</p>
            <a
              href={`mailto:${profile.email}?subject=Collaboration%20Inquiry%20via%20Resonance%20Network`}
              className="btn btn--primary btn--large"
            >
              Get in Touch
            </a>
          </div>
        </section>
      )}
    </article>
  )
}
