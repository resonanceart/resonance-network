'use client'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { supabase } from '@/lib/supabase'

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
  status: string
}

export default function ProfilePreviewPage({ params }: { params: { id: string } }) {
  const [profile, setProfile] = useState<CollaboratorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function fetchProfile() {
      const { data, error } = await supabase
        .from('collaborator_profiles')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error || !data) {
        setNotFound(true)
      } else {
        setProfile(data)
      }
      setLoading(false)
    }
    fetchProfile()
  }, [params.id])

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
      {/* Draft banner */}
      <div className="draft-banner">
        <div className="container">
          <strong>DRAFT PREVIEW</strong> — This page is not public yet. Pending review by the Resonance Network team.
        </div>
      </div>

      {/* Profile Header */}
      <section className="profile-header" style={{ paddingTop: 'var(--space-8)' }}>
        <div className="container">
          <div className="profile-header__inner">
            {profile.photo_url && (
              <div className="profile-header__avatar">
                <img src={profile.photo_url} alt={`Photo of ${profile.name}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div className="profile-header__info">
              <h1 className="profile-header__name">{profile.name}</h1>
              <p className="profile-header__title">{profile.availability || 'Collaborator'}</p>
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
