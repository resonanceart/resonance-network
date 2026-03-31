'use client'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/components/AuthProvider'
import { SmartGallery, type GalleryItem } from '@/components/profile/SmartGallery'

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
  collaboration_needs: string | null
  collaboration_role_count: number | null
  team_members: Array<{ name: string; role: string; photo: string | null }> | null
  user_id: string | null
  status: string
}

export default function ProjectPreviewPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const [project, setProject] = useState<ProjectSubmission | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [actionStatus, setActionStatus] = useState<'idle' | 'approving' | 'rejecting' | 'approved' | 'rejected'>('idle')
  const [isAdmin, setIsAdmin] = useState(false)
  const [creatorAvatar, setCreatorAvatar] = useState<string | null>(null)

  // Auto-detect admin role and fetch creator avatar
  useEffect(() => {
    if (!user) return
    fetch('/api/user/profile', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.profile?.role === 'admin') setIsAdmin(true)
      })
      .catch(() => {})
  }, [user])

  useEffect(() => {
    async function fetchProject() {
      try {
        const res = await fetch(`/api/preview?type=project&id=${encodeURIComponent(params.id)}`, { credentials: 'include' })
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
          // Fetch creator's avatar by their user_id (not current user)
          if (json.data.user_id) {
            try {
              const avatarRes = await fetch(`/api/preview?type=profile_avatar&id=${json.data.user_id}`, { credentials: 'include' })
              if (avatarRes.ok) {
                const avatarData = await avatarRes.json()
                if (avatarData.avatar_url) {
                  setCreatorAvatar(avatarData.avatar_url)
                }
              }
            } catch {}
          }
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
        credentials: 'include',
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
      {isAdmin && (project.status === 'new' || project.status === 'draft') && actionStatus === 'idle' && (
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
            <p className="section-label">Project Philosophy</p>
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

      {/* Media Gallery */}
      {project.gallery_images_data && (() => {
        try {
          const parsed = JSON.parse(project.gallery_images_data)
          const galleryItems: GalleryItem[] = []
          let order = 0
          // Handle both legacy (array) and new ({images, pdfs, links}) formats
          const images = Array.isArray(parsed) ? parsed : (parsed.images || [])
          const pdfs = Array.isArray(parsed) ? [] : (parsed.pdfs || [])
          const links = Array.isArray(parsed) ? [] : (parsed.links || [])

          images.forEach((img: { url: string; alt?: string }, i: number) => {
            galleryItems.push({ id: `img-${i}`, type: 'image', url: img.url, title: img.alt || 'Gallery', order: order++ })
          })
          pdfs.forEach((doc: { url: string; title?: string; thumbnail?: string }, i: number) => {
            galleryItems.push({ id: `pdf-${i}`, type: 'pdf', url: doc.url, thumbnail: doc.thumbnail, title: doc.title || 'Document', subtitle: 'PDF', order: order++ })
          })
          links.forEach((link: { url: string; label?: string; thumbnail?: string }, i: number) => {
            let subtitle = 'website'
            try { subtitle = new URL(link.url).hostname } catch {}
            galleryItems.push({ id: `link-${i}`, type: 'link', url: link.url, thumbnail: link.thumbnail, title: link.label || 'Link', subtitle, order: order++ })
          })

          // Apply saved gallery order
          const savedOrder = !Array.isArray(parsed) && Array.isArray(parsed.galleryOrder) ? parsed.galleryOrder as string[] : []
          if (savedOrder.length > 0) {
            const orderMap = new Map(savedOrder.map((id: string, i: number) => [id, i]))
            galleryItems.sort((a, b) => (orderMap.get(a.id) ?? 999) - (orderMap.get(b.id) ?? 999))
            galleryItems.forEach((item, i) => { item.order = i })
          }

          if (galleryItems.length === 0) return null
          return (
            <section style={{ padding: 'var(--space-8) 0' }}>
              <div className="container">
                <p className="section-label">Media</p>
                <SmartGallery items={galleryItems} editable={false} />
              </div>
            </section>
          )
        } catch { return null }
      })()}

      {/* Collaboration Roles — task-card styling */}
      {project.collaboration_needs && (() => {
        try {
          const roles = JSON.parse(project.collaboration_needs)
          if (!Array.isArray(roles) || roles.length === 0) return null
          return (
            <section className="project-collab" style={{ padding: 'var(--space-12) 0' }}>
              <div className="container">
                <p className="section-label">Join This Project</p>
                <h2>Open Roles</h2>
                <div className="task-grid">
                  {roles.map((role: { title: string; customTitle?: string; skills?: string; description: string; image_url?: string }, i: number) => (
                    <div key={i} className="task-card">
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
              </div>
            </section>
          )
        } catch { return null }
      })()}

      {/* The Team — combines project creator + team members */}
      <section className="project-artist">
        <div className="container">
          <p className="section-label">The People Behind It</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
            {/* Project creator — auto-included with their profile photo */}
            <div style={{ textAlign: 'center' }}>
              {creatorAvatar ? (
                <div style={{ width: '100%', aspectRatio: '3/4', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 'var(--space-3)' }}>
                  <img src={creatorAvatar} alt={project.artist_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ) : (
                <div style={{ width: '100%', aspectRatio: '3/4', borderRadius: 'var(--radius-lg)', background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-3)', fontSize: '2rem', color: 'var(--color-text-muted)' }}>
                  {project.artist_name.charAt(0).toUpperCase()}
                </div>
              )}
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

      {/* Artist bio (shown below team) */}
      {project.artist_bio && (
        <section style={{ padding: 'var(--space-8) 0', borderTop: '1px solid var(--color-border)' }}>
          <div className="container">
            <div style={{ maxWidth: '65ch' }}>
              <p className="overview-body">{project.artist_bio}</p>
            </div>
          </div>
        </section>
      )}

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
