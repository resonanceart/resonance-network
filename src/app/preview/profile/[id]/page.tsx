'use client'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/Badge'

interface CollaboratorProfile {
  id: string
  created_at: string
  name: string
  email: string
  photo_url: string | null
  skills: string | null
  portfolio: string | null
  availability: string | null
  notes: string | null
  bio: string | null
  location: string | null
  headshot_data: string | null
  status: string
}

export default function ProfilePreviewPage({ params }: { params: { id: string } }) {
  const [profile, setProfile] = useState<CollaboratorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [actionStatus, setActionStatus] = useState<'idle' | 'approving' | 'rejecting' | 'approved' | 'rejected'>('idle')

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`/api/preview?type=profile&id=${params.id}`)
        if (!res.ok) { setNotFound(true); setLoading(false); return }
        const json = await res.json()
        if (json.data) setProfile(json.data)
        else setNotFound(true)
      } catch {
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

    const adminPassword = window.prompt('Enter admin password:')
    if (!adminPassword) return

    setActionStatus(action === 'approve' ? 'approving' : 'rejecting')
    try {
      const res = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'profile', id: params.id, action, adminPassword }),
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
        <h1>Preview Not Found</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>This profile may not exist or has been removed.</p>
      </div>
    )
  }

  const specialties = profile.skills ? profile.skills.split(',').map(s => s.trim()).filter(Boolean) : []

  return (
    <article className="profile-page">
      <head><meta name="robots" content="noindex,nofollow" /></head>
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

      {/* Admin action bar */}
      {profile.status === 'new' && actionStatus === 'idle' && (
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
            {(profile.headshot_data || profile.photo_url) && (
              <div className="profile-header__avatar">
                <img src={profile.headshot_data || profile.photo_url!} alt={`Photo of ${profile.name}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div className="profile-header__info">
              <h1 className="profile-header__name">{profile.name}</h1>
              <p className="profile-header__title">{profile.availability || 'Collaborator'}</p>
              {profile.location && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{profile.location}</p>}
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{profile.email}</p>
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

      {/* Bio */}
      {profile.bio && (
        <section className="profile-about">
          <div className="container">
            <p className="section-label">About</p>
            <div className="profile-about__text">
              <p>{profile.bio}</p>
            </div>
          </div>
        </section>
      )}

      {/* Skills detail */}
      {profile.skills && (
        <section className="profile-about">
          <div className="container">
            <p className="section-label">Skills &amp; Expertise</p>
            <div className="profile-about__text">
              <p>{profile.skills}</p>
            </div>
          </div>
        </section>
      )}

      {/* Portfolio */}
      {profile.portfolio && (
        <section style={{ padding: 'var(--space-12) 0', borderTop: '1px solid var(--color-border)' }}>
          <div className="container">
            <p className="section-label">Portfolio &amp; Past Work</p>
            <div className="profile-about__text">
              <p>{profile.portfolio}</p>
            </div>
          </div>
        </section>
      )}

      {/* Notes */}
      {profile.notes && (
        <section style={{ padding: 'var(--space-12) 0', borderTop: '1px solid var(--color-border)' }}>
          <div className="container">
            <p className="section-label">Additional Notes</p>
            <div className="profile-about__text">
              <p>{profile.notes}</p>
            </div>
          </div>
        </section>
      )}
    </article>
  )
}
