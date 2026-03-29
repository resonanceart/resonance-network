'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
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
  collaboration_needs: string | null
  hero_image_data: string | null
  gallery_images_data: string | null
  status: string
}

interface CollabRole {
  title: string
  description: string
  image_url?: string
}

function ProjectPreviewInner() {
  const { user, loading: authLoading } = useAuth()
  const searchParams = useSearchParams()
  const projectId = searchParams.get('id')

  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<ProjectSubmission | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) { window.location.href = '/login'; return }
    if (!projectId) { setLoading(false); return }

    fetch('/api/user/projects', { credentials: 'same-origin' })
      .then(r => r.json())
      .then(data => {
        const submissions: ProjectSubmission[] = data.submissions || []
        const found = submissions.find(s => s.id === projectId)
        if (found) setProject(found)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user, authLoading, projectId])

  if (authLoading || loading) {
    return (
      <div className="container" style={{ padding: 'var(--space-16) 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Loading preview...</p>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="container" style={{ padding: 'var(--space-16) 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Project not found.</p>
        <Link href="/dashboard/projects" className="btn btn--primary" style={{ marginTop: 'var(--space-4)', display: 'inline-block' }}>
          Back to Projects
        </Link>
      </div>
    )
  }

  const goalsList = project.goals ? project.goals.split('\n').filter(Boolean) : []
  const domains = project.domains || []
  const pathways = project.pathways || []

  // Parse gallery images
  let galleryImages: Array<{ url: string; alt: string }> = []
  if (project.gallery_images_data) {
    try {
      galleryImages = JSON.parse(project.gallery_images_data)
    } catch {}
  }

  // Parse collaboration roles — could be JSON array or plain text
  let collabRoles: CollabRole[] = []
  let collabPlainText = ''
  if (project.collaboration_needs) {
    try {
      const parsed = JSON.parse(project.collaboration_needs)
      if (Array.isArray(parsed) && parsed.length > 0) {
        collabRoles = parsed
      }
    } catch {
      collabPlainText = project.collaboration_needs
    }
  }

  return (
    <>
      {/* Preview banner */}
      <div style={{ position: 'sticky', top: 64, zIndex: 100, background: 'var(--color-primary)', color: '#fff', padding: 'var(--space-2) 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>
            {project.status === 'approved' ? 'This project is live on the network' : 'Preview — this project has not been published yet'}
          </span>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <Link href={`/dashboard/projects/live-edit?id=${projectId}`} style={{ color: '#fff', fontSize: 'var(--text-sm)', textDecoration: 'underline' }}>
              Back to Editor
            </Link>
          </div>
        </div>
      </div>

      <article>
        {/* Hero */}
        <section className="project-hero" style={{ minHeight: '400px', background: '#1a1a1a' }}>
          {project.hero_image_data && (
            <img
              src={project.hero_image_data}
              alt={`Hero image for ${project.project_title}`}
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
                  {pathways.length > 0 && (
                    <div className="overview-stat">
                      <p className="overview-stat__label">Pathways</p>
                      <p className="overview-stat__value">{pathways.join(' · ')}</p>
                    </div>
                  )}
                </aside>
              </div>
            </div>
          </section>
        )}

        {/* Gallery */}
        {galleryImages.length > 0 && (
          <section style={{ padding: 'var(--space-12) 0' }}>
            <div className="container">
              <p className="section-label">Gallery</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-3)' }}>
                {galleryImages.map((img, i) => (
                  <div key={i} style={{ borderRadius: 8, overflow: 'hidden', aspectRatio: '4/3' }}>
                    <img src={img.url} alt={img.alt || `Gallery image ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
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
              {project.stage && project.stage !== 'Production' && project.stage !== 'Completed' && (
                <p style={{ fontStyle: 'italic', color: 'var(--color-text-muted)', marginTop: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
                  This project is currently in {project.stage} stage. The experience above reflects the artist&apos;s vision for the completed work.
                </p>
              )}
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
              <h2>What We&apos;re Working Toward</h2>
              <ul className="goals-list">
                {goalsList.map((goal, i) => (
                  <li key={i} className="goals-list__item">{goal}</li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Classification */}
        {(domains.length > 0 || pathways.length > 0 || project.stage) && (
          <section className="project-classification">
            <div className="container">
              <p className="section-label">DNA</p>
              <div className="classification-grid">
                {domains.length > 0 && (
                  <div className="classification-item">
                    <h3>Domains</h3>
                    <div className="badges-group">
                      {domains.map(d => <Badge key={d} variant="domain">{d}</Badge>)}
                    </div>
                  </div>
                )}
                {pathways.length > 0 && (
                  <div className="classification-item">
                    <h3>Pathways</h3>
                    <div className="badges-group">
                      {pathways.map(p => <Badge key={p} variant="pathway">{p}</Badge>)}
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

        {/* Collaboration */}
        {(collabRoles.length > 0 || collabPlainText) && (
          <section className="project-collab">
            <div className="container">
              <p className="section-label">Collaboration</p>
              <h2>Open Roles</h2>
              {collabRoles.length > 0 ? (
                <div className="task-grid">
                  {collabRoles.map((role, i) => (
                    <div key={i} style={{ background: 'var(--color-surface)', borderRadius: 12, padding: 'var(--space-5)', border: '1px solid var(--color-border)' }}>
                      <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>{role.title}</h3>
                      {role.description && <p className="overview-body">{role.description}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="overview-body">{collabPlainText}</p>
              )}
            </div>
          </section>
        )}

        {/* Artist / Creator */}
        <section className="project-artist">
          <div className="container">
            <p className="section-label">The Creator</p>
            <div style={{ maxWidth: '65ch' }}>
              <h3>{project.artist_name}</h3>
              {project.artist_bio && <p className="overview-body">{project.artist_bio}</p>}
              {project.artist_website && (
                <p style={{ fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}>
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
    </>
  )
}

export default function ProjectPreviewPage() {
  return (
    <Suspense fallback={
      <div className="container" style={{ padding: 'var(--space-16) 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
      </div>
    }>
      <ProjectPreviewInner />
    </Suspense>
  )
}
