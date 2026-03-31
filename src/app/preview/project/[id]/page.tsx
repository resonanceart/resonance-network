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

function getSocialSvg(platform: string) {
  const s = 16
  switch (platform) {
    case 'instagram': return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>
    case 'facebook': return <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
    case 'linkedin': return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="3"/><path d="M7 11v6M7 7v.01M11 17v-4a2 2 0 014 0v4M15 11v6"/></svg>
    case 'x': return <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
    case 'youtube': return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="4"/><polygon points="10 8 16 12 10 16" fill="currentColor" stroke="none"/></svg>
    case 'tiktok': return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2v13a4 4 0 11-3-3.87"/><path d="M12 6c2 1.5 4 2 6 2"/></svg>
    default: return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
  }
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

  // Parse gallery data — matching user preview page exactly
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

  // Parse collaboration roles — matching user preview page exactly
  let collabRoles: Array<{ title: string; customTitle?: string; skills?: string; description: string; image_url?: string }> = []
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

  // Build gallery items for SmartGallery
  function buildGalleryItems(): GalleryItem[] {
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
    if (savedGalleryOrder.length > 0) {
      const orderMap = new Map(savedGalleryOrder.map((id, i) => [id, i]))
      items.sort((a, b) => (orderMap.get(a.id) ?? 999) - (orderMap.get(b.id) ?? 999))
      items.forEach((item, i) => { item.order = i })
    }
    return items
  }

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

      {/* Admin action bar */}
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

      {/* === SECTIONS BELOW MATCH USER PREVIEW EXACTLY === */}

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
                {project.pathways && project.pathways.length > 0 && (
                  <div className="overview-stat">
                    <p className="overview-stat__label">Pathways</p>
                    <p className="overview-stat__value">{project.pathways.join(' · ')}</p>
                  </div>
                )}
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

      {/* Gallery */}
      {(() => {
        const items = buildGalleryItems()
        if (items.length === 0) return null
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
      <section className="project-artist">
        <div className="container">
          <p className="section-label">The People Behind It</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
            {/* Creator */}
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
            {/* Team members */}
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

      {/* Collaboration Roles */}
      {(collabRoles.length > 0 || collabPlainText) && (
        <section className="project-collab">
          <div className="container">
            <p className="section-label">Join This Project</p>
            <h2>Open Roles</h2>
            {collabRoles.length > 0 ? (
              <div className="task-grid">
                {collabRoles.map((role, i) => (
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
            ) : (
              <p className="overview-body">{collabPlainText}</p>
            )}
          </div>
        </section>
      )}

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
    </article>
  )
}
