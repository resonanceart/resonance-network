'use client'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/Badge'

interface ProjectSubmission {
  id: string
  created_at: string
  artist_name: string
  artist_bio: string | null
  artist_email: string
  artist_website: string | null
  project_title: string
  one_sentence: string | null
  vision: string | null
  experience: string | null
  story: string | null
  goals: string | null
  domains: string[] | null
  pathways: string[] | null
  stage: string | null
  scale: string | null
  location: string | null
  materials: string | null
  special_needs: string | null
  hero_image_data: string | null
  gallery_images_data: string | null
  status: string
}

export default function ProjectPreviewPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<ProjectSubmission | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [actionStatus, setActionStatus] = useState<'idle' | 'approving' | 'rejecting' | 'approved' | 'rejected'>('idle')
  const [isAdmin, setIsAdmin] = useState(false)

  // Check if URL has ?admin=true to show the admin login option
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
    async function fetchProject() {
      try {
        const res = await fetch(`/api/preview?type=project&id=${encodeURIComponent(params.id)}`)
        if (!res.ok) {
          console.error('Preview fetch failed:', res.status, res.statusText)
          setNotFound(true)
          setLoading(false)
          return
        }
        const json = await res.json()
        if (json.error || !json.data) {
          console.error('Preview fetch error:', json.error)
          setNotFound(true)
        } else {
          setProject(json.data)
        }
      } catch (err) {
        console.error('Preview fetch exception:', err)
        setNotFound(true)
      }
      setLoading(false)
    }
    fetchProject()
  }, [params.id])

  async function handleAction(action: 'approve' | 'reject') {
    const confirmed = window.confirm(
      action === 'approve'
        ? 'Approve this project? It will become visible on the network.'
        : 'Reject this submission? The creator will need to resubmit.'
    )
    if (!confirmed) return

    setActionStatus(action === 'approve' ? 'approving' : 'rejecting')
    try {
      const res = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'project', id: params.id, action }),
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

  if (notFound || !project) {
    return (
      <div className="container" style={{ padding: 'var(--space-16) 0', textAlign: 'center' }}>
        <h1>Preview Not Found</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>This submission may not exist or has been removed.</p>
      </div>
    )
  }

  const goalsList = project.goals ? project.goals.split('\n').filter(Boolean) : []

  return (
    <article>
      {/* Status banner */}
      {actionStatus === 'approved' ? (
        <div className="draft-banner draft-banner--approved">
          <div className="container">
            <strong>APPROVED</strong> — This project is now live on the network.
          </div>
        </div>
      ) : actionStatus === 'rejected' ? (
        <div className="draft-banner draft-banner--rejected">
          <div className="container">
            <strong>REJECTED</strong> — This submission has been declined.
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
      {isAdmin && project.status === 'new' && actionStatus === 'idle' && (
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

      {/* Hero */}
      <section className="project-hero" style={{ minHeight: '400px', background: '#1a1a1a' }}>
        {project.hero_image_data && (
          <img
            src={project.hero_image_data}
            alt={`Hero image for the ${project.project_title} project`}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
        <div className="project-hero__overlay" />
        <div className="project-hero__content">
          {project.stage && <Badge variant="stage">{project.stage}</Badge>}
          <h1 className="project-hero__title">{project.project_title}</h1>
          {project.one_sentence && <p className="project-hero__desc">{project.one_sentence}</p>}
        </div>
      </section>

      {/* Overview with stats sidebar */}
      {(project.vision || project.artist_name) && (
        <section className="project-overview">
          <div className="container">
            <p className="section-label">The Vision</p>
            <div className="overview-grid">
              <div>
                {project.vision && <p className="overview-lead">{project.vision}</p>}
              </div>
              <aside className="overview-stats">
                <div className="overview-stat">
                  <p className="overview-stat__label">Lead Creator</p>
                  <p className="overview-stat__value">{project.artist_name}</p>
                </div>
                {project.stage && (
                  <div className="overview-stat">
                    <p className="overview-stat__label">Stage</p>
                    <p className="overview-stat__value">{project.stage}</p>
                  </div>
                )}
                {project.scale && (
                  <div className="overview-stat">
                    <p className="overview-stat__label">Scale</p>
                    <p className="overview-stat__value">{project.scale}</p>
                  </div>
                )}
                {project.location && (
                  <div className="overview-stat">
                    <p className="overview-stat__label">Location</p>
                    <p className="overview-stat__value">{project.location}</p>
                  </div>
                )}
              </aside>
            </div>
          </div>
        </section>
      )}

      {/* Experience */}
      {project.experience && (
        <section className="project-experience">
          <div className="container">
            <p className="section-label">The Experience</p>
            <h2>What It Feels Like</h2>
            <p className="overview-body">{project.experience}</p>
          </div>
        </section>
      )}

      {/* Story */}
      {project.story && (
        <section className="project-story">
          <div className="container">
            <p className="section-label">Origin</p>
            <h2>The Story Behind It</h2>
            <p className="overview-body">{project.story}</p>
          </div>
        </section>
      )}

      {/* Goals */}
      {goalsList.length > 0 && (
        <section className="project-goals">
          <div className="container">
            <p className="section-label">Ambition</p>
            <h2>What This Project Aims to Achieve</h2>
            <ul className="goals-list">
              {goalsList.map((goal, i) => (
                <li key={i} className="goals-list__item">{goal}</li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Classification */}
      {(project.domains?.length || project.pathways?.length) && (
        <section className="project-classification">
          <div className="container">
            <p className="section-label">DNA</p>
            <div className="classification-grid">
              {project.domains && project.domains.length > 0 && (
                <div className="classification-item">
                  <h3>Domains</h3>
                  <div className="badges-group">
                    {project.domains.map(d => <Badge key={d} variant="domain">{d}</Badge>)}
                  </div>
                </div>
              )}
              {project.pathways && project.pathways.length > 0 && (
                <div className="classification-item">
                  <h3>Pathways</h3>
                  <div className="badges-group">
                    {project.pathways.map(p => <Badge key={p} variant="pathway">{p}</Badge>)}
                  </div>
                </div>
              )}
              {project.stage && (
                <div className="classification-item">
                  <h3>Stage</h3>
                  <Badge variant="stage">{project.stage}</Badge>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Materials */}
      {project.materials && (
        <section style={{ padding: 'var(--space-12) 0', borderTop: '1px solid var(--color-border)' }}>
          <div className="container">
            <p className="section-label">Materials &amp; Processes</p>
            <p className="overview-body">{project.materials}</p>
          </div>
        </section>
      )}

      {/* Artist */}
      <section className="project-artist">
        <div className="container">
          <p className="section-label">The Creator</p>
          <div style={{ maxWidth: '65ch' }}>
            <h3>{project.artist_name}</h3>
            {project.artist_bio && <p className="overview-body">{project.artist_bio}</p>}
            {project.artist_email && (
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
                {project.artist_email}
              </p>
            )}
            {project.artist_website && (
              <p style={{ fontSize: 'var(--text-sm)' }}>
                <a href={project.artist_website} target="_blank" rel="noopener noreferrer">{project.artist_website}</a>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      {project.artist_email && (
        <section className="project-contact">
          <div className="container">
            <p className="section-label">Reach Out</p>
            <h2>Start a Conversation</h2>
            <p>Interested in supporting, hosting, or collaborating on this project?</p>
            <a
              href={`mailto:${project.artist_email}?subject=Inquiry%20about%20${encodeURIComponent(project.project_title)}%20via%20Resonance%20Network`}
              className="btn btn--primary btn--large"
            >
              Contact the Team
            </a>
          </div>
        </section>
      )}
    </article>
  )
}
