'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { Badge } from '@/components/ui/Badge'
import { SmartGallery, type GalleryItem } from '@/components/profile/SmartGallery'

function getSocialSvg(platform: string) {
  const s = 16
  switch (platform) {
    case 'instagram': return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>
    case 'facebook': return <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
    case 'linkedin': return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="3"/><path d="M7 11v6M7 7v.01M11 17v-4a2 2 0 014 0v4M15 11v6"/></svg>
    case 'x': return <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
    case 'youtube': return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="4"/><polygon points="10 8 16 12 10 16" fill="currentColor" stroke="none"/></svg>
    case 'tiktok': return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2v13a4 4 0 11-3-3.87"/><path d="M12 6c2 1.5 4 2 6 2"/></svg>
    case 'behance': return <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 3.211 3.483 3.312 4.588 1.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988H0V5.021h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zM3 11h3.584c2.508 0 2.906-3-.312-3H3v3zm3.391 3H3v3.016h3.341c3.055 0 2.868-3.016.05-3.016z"/></svg>
    case 'github': return <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
    case 'linktree': return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18M7 7l5-4 5 4M7 13h10M8 18h8"/></svg>
    case 'spotify': return <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2z"/></svg>
    default: return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
  }
}

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
  collaboration_role_count: number | null
  hero_image_data: string | null
  gallery_images_data: string | null
  team_members: Array<{ name: string; role: string; photo: string | null }> | null
  status: string
  user_id: string | null
}

interface CollabRole {
  title: string
  customTitle?: string
  skills?: string
  description: string
  image_url?: string
}

function ProjectPreviewInner() {
  const { user, loading: authLoading } = useAuth()
  const searchParams = useSearchParams()
  const projectId = searchParams.get('id')

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [project, setProject] = useState<ProjectSubmission | null>(null)
  const [creatorAvatar, setCreatorAvatar] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) { window.location.href = '/login'; return }
    if (!projectId) { setLoading(false); return }

    // Fetch creator's avatar
    fetch('/api/user/profile', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.profile?.avatar_url) setCreatorAvatar(data.profile.avatar_url)
      })
      .catch(() => {})

    fetch('/api/user/projects', { credentials: 'include' })
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

  async function handleSubmitForReview() {
    if (!project || !projectId) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/submit-project', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: projectId,
          artistName: project.artist_name,
          artistEmail: project.artist_email,
          projectTitle: project.project_title,
          oneSentence: project.one_sentence,
          vision: project.vision,
          experience: project.experience,
          story: project.story,
          goals: project.goals,
          domains: project.domains,
          pathways: project.pathways,
          stage: project.stage,
          scale: project.scale,
          location: project.location,
          materials: project.materials,
          specialNeeds: project.special_needs,
          heroImageData: project.hero_image_data,
          galleryImagesData: project.gallery_images_data,
          collaborationNeeds: project.collaboration_needs,
          collaborationRoleCount: project.collaboration_role_count,
          status: 'pending',
        }),
      })
      if (res.ok) {
        setProject({ ...project, status: 'new' })
      }
    } catch { /* */ }
    setSubmitting(false)
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

  // Parse gallery images — handle both legacy array and new {images, pdfs, links} format
  let galleryImages: Array<{ url: string; alt: string }> = []
  let galleryPdfs: Array<{ url: string; title: string; thumbnail?: string }> = []
  let galleryLinks: Array<{ url: string; label: string; thumbnail?: string }> = []
  let projectSocialLinks: Array<{ platform: string; url: string }> = []
  let projectDescription = ''
  let inclusivityStatement = ''
  let materialsRegen = ''
  let savedGalleryOrder: string[] = []
  if (project.gallery_images_data) {
    try {
      const parsed = JSON.parse(project.gallery_images_data)
      if (Array.isArray(parsed)) {
        galleryImages = parsed
      } else if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed.images)) galleryImages = parsed.images
        if (Array.isArray(parsed.pdfs)) galleryPdfs = parsed.pdfs
        if (Array.isArray(parsed.links)) galleryLinks = parsed.links
        if (Array.isArray(parsed.socialLinks)) projectSocialLinks = parsed.socialLinks
        if (Array.isArray(parsed.galleryOrder)) savedGalleryOrder = parsed.galleryOrder
        if (parsed.projectDescription) projectDescription = parsed.projectDescription
        if (parsed.inclusivityStatement) inclusivityStatement = parsed.inclusivityStatement
        if (parsed.materialsRegen) materialsRegen = parsed.materialsRegen
      }
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
            {project.status === 'approved'
              ? 'This project is live on the network'
              : project.status === 'new'
                ? 'Submitted for review'
                : 'Draft preview — not yet submitted'}
          </span>
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
            <Link href={`/dashboard/projects/live-edit?id=${projectId}`} style={{ color: '#fff', fontSize: 'var(--text-sm)', textDecoration: 'underline' }}>
              Back to Editor
            </Link>
            {project.status === 'draft' && (
              <button
                onClick={handleSubmitForReview}
                disabled={submitting}
                style={{
                  background: 'rgba(255,255,255,0.2)', color: '#fff',
                  border: '1px solid rgba(255,255,255,0.3)', borderRadius: 6,
                  padding: '4px 14px', fontSize: 'var(--text-sm)', fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {submitting ? 'Submitting...' : 'Submit for Review'}
              </button>
            )}
          </div>
        </div>
      </div>

      <article>
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="breadcrumb container" style={{ paddingTop: 'var(--space-4)' }}>
          <Link href="/dashboard">Dashboard</Link> <span aria-hidden="true">/</span> <Link href="/dashboard/projects">Projects</Link> <span aria-hidden="true">/</span> <span>{project.project_title}</span>
        </nav>
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
              <p className="section-label">Project Philosophy</p>
              <div className="overview-grid">
                <div>
                  {project.vision && (() => {
                    const parts = project.vision.split('\n\n')
                    return (
                      <>
                        <p className="overview-lead">{parts[0]}</p>
                        {parts.slice(1).map((p, i) => (
                          <p key={i} className="overview-body">{p}</p>
                        ))}
                      </>
                    )
                  })()}
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
                  {/* Pathways shown in Classification section below instead */}
                  {projectSocialLinks.length > 0 && (
                    <div className="overview-stat">
                      <p className="overview-stat__label">Links</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                        {projectSocialLinks.map((link, i) => (
                          <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" title={link.platform}
                            style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', color: 'var(--color-text)', textDecoration: 'none', border: '1px solid var(--color-border)', transition: 'background 0.2s' }}>
                            {getSocialSvg(link.platform)}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </aside>
              </div>
            </div>
          </section>
        )}

        {/* Gallery — SmartGallery with images, PDFs, links */}
        {(galleryImages.length > 0 || galleryPdfs.length > 0 || galleryLinks.length > 0) && (() => {
          const items: GalleryItem[] = []
          let order = 0
          galleryImages.forEach((img, i) => {
            items.push({ id: `img-${i}`, type: 'image', url: img.url, title: img.alt || 'Gallery', order: order++ })
          })
          galleryPdfs.forEach((doc, i) => {
            items.push({ id: `pdf-${i}`, type: 'pdf', url: doc.url, thumbnail: doc.thumbnail, title: doc.title || 'Document', subtitle: 'PDF', order: order++ })
          })
          galleryLinks.forEach((link, i) => {
            let subtitle = 'website'
            try { subtitle = new URL(link.url).hostname } catch {}
            items.push({ id: `link-${i}`, type: 'link', url: link.url, thumbnail: link.thumbnail, title: link.label || 'Link', subtitle, order: order++ })
          })
          // Apply saved gallery order
          if (savedGalleryOrder.length > 0) {
            const orderMap = new Map(savedGalleryOrder.map((id, i) => [id, i]))
            items.sort((a, b) => (orderMap.get(a.id) ?? 999) - (orderMap.get(b.id) ?? 999))
            items.forEach((item, i) => { item.order = i })
          }
          return (
            <section style={{ padding: 'var(--space-8) 0' }}>
              <div className="container">
                <p className="section-label">Media</p>
                <SmartGallery items={items} editable={false} />
              </div>
            </section>
          )
        })()}

        {/* Project Description */}
        {projectDescription && (
          <section className="project-experience">
            <div className="container">
              <p className="section-label">Project Description</p>
              <h2>About This Project</h2>
              {projectDescription.split('\n\n').map((p, i) => (
                <p key={i} className="overview-body">{p}</p>
              ))}
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

        {/* Inclusivity Statement */}
        {inclusivityStatement && (
          <section className="project-experience">
            <div className="container">
              <p className="section-label">Inclusivity Statement</p>
                            {inclusivityStatement.split('\n\n').map((p, i) => <p key={i} className="overview-body">{p}</p>)}
            </div>
          </section>
        )}

        {/* Materials & Regenerative Practices */}
        {materialsRegen && (
          <section className="project-experience">
            <div className="container">
              <p className="section-label">Materials & Regenerative Practices</p>

              {materialsRegen.split('\n\n').map((p, i) => <p key={i} className="overview-body">{p}</p>)}
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

        {/* Team Members */}
        {/* The People Behind It — creator + team members combined */}
        <section className="project-artist">
          <div className="container">
            <p className="section-label">The People Behind It</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
              {/* Project creator — auto-included */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '100%', aspectRatio: '3/4', borderRadius: 'var(--radius-lg)', background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-3)', fontSize: '2rem', color: 'var(--color-text-muted)', overflow: 'hidden' }}>
                  {creatorAvatar ? (
                    <img src={creatorAvatar} alt={project.artist_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    (project.artist_name || '?').charAt(0).toUpperCase()
                  )}
                </div>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, margin: '0 0 var(--space-1)' }}>{project.artist_name}</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>Lead Creator</p>
              </div>
              {/* Additional team members */}
              {project.team_members && project.team_members.map((member, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  {member.photo ? (
                    <div style={{ width: '100%', aspectRatio: '3/4', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 'var(--space-3)' }}>
                      <img src={member.photo} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div style={{ width: '100%', aspectRatio: '3/4', borderRadius: 'var(--radius-lg)', background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-3)', fontSize: '2rem', color: 'var(--color-text-muted)' }}>
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, margin: '0 0 var(--space-1)' }}>{member.name}</h3>
                  {member.role && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>{member.role}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

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

        {/* Collaboration — task-card styling matching collaborate page */}
        {(collabRoles.length > 0 || collabPlainText) && (
          <section className="project-collab">
            <div className="container">
              <p className="section-label">Join This Project</p>
              <h2>Open Roles</h2>
              {collabRoles.length > 0 ? (
                <div className="task-grid">
                  {collabRoles.map((role, i) => (
                    <div key={i} className="task-card">
                      {/* Banner — use project hero image */}
                      {project.hero_image_data && (
                        <div className="task-card__banner">
                          <img src={project.hero_image_data} alt={project.project_title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}
                      <div className="task-card__content">
                        <div className="task-card__header">
                          <Badge variant="open">Open</Badge>
                        </div>
                        <h3 className="task-card__title">{role.title}</h3>
                        {role.customTitle && (
                          <p className="task-card__meta-line">{role.customTitle}</p>
                        )}
                        {role.skills && (
                          <div className="task-card__skills">
                            {role.skills.split(',').map((s: string, j: number) => (
                              <span key={j} className="skill-tag">{s.trim()}</span>
                            ))}
                          </div>
                        )}
                        {role.description && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6 }}>{role.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="overview-body">{collabPlainText}</p>
              )}
            </div>
          </section>
        )}

        {/* Creator info removed — already shown in combined team section above */}

        {/* Contact CTA */}
        {project.artist_email && (
          <section className="project-contact">
            <div className="container">
              <p className="section-label">Reach Out</p>
              <h2>Get in Touch</h2>
              <p>Want to support, host, or collaborate on this project? We&apos;d love to hear from you.</p>
              <a
                href={`mailto:${project.artist_email}?subject=Inquiry%20about%20${encodeURIComponent(project.project_title)}%20via%20Resonance%20Network`}
                className="btn btn--primary btn--large"
              >
                Contact the Team
              </a>
            </div>
          </section>
        )}

        {/* Bottom nav — matches public page */}
        <nav className="project-nav" aria-label="Related pages">
          <div className="container" style={{ display: 'flex', gap: 'var(--space-4)', paddingBottom: 'var(--space-8)', flexWrap: 'wrap' }}>
            <Link href="/dashboard/projects" className="btn btn--outline">My Projects</Link>
            <Link href={`/dashboard/projects/live-edit?id=${projectId}`} className="btn btn--outline">Edit This Project</Link>
          </div>
        </nav>
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
