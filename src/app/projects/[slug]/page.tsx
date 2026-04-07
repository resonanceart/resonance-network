import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { ProjectFollowWrapper } from '@/components/ProjectFollowWrapper'
import { ProjectSmartGallery } from '@/components/ProjectSmartGallery'
import { getProjects, getProjectBySlug } from '@/lib/data'
import type { Project, Milestone, ProjectUpdate } from '@/types'
import type { Metadata } from 'next'

export const revalidate = 60
export const dynamicParams = true

export async function generateStaticParams() {
  const projects = await getProjects()
  return projects.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug)
  if (!project) return {}
  const title = `${project.title} — ${project.domains.slice(0, 2).join(' & ')} | Resonance Network`
  return {
    title,
    description: `${project.shortDescription} Explore this ${project.stage.toLowerCase()} stage ${project.domains[0]?.toLowerCase() || 'creative'} project on Resonance Network.`,
    alternates: {
      canonical: `https://resonancenetwork.org/projects/${project.slug}`,
    },
    openGraph: {
      title: project.title,
      description: `${project.shortDescription} A curated ${project.domains[0]?.toLowerCase() || 'creative'} project on Resonance Network.`,
      url: `https://resonancenetwork.org/projects/${project.slug}`,
      images: [{ url: project.heroImage.url, alt: project.heroImage.alt, width: 1200, height: 630 }],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.shortDescription,
      images: [project.heroImage.url],
    },
  }
}

function getProjectJsonLd(project: Project) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.shortDescription,
    url: `https://resonancenetwork.org/projects/${project.slug}`,
    image: project.heroImage.url,
    creator: project.leadArtistName
      ? { '@type': 'Person', name: project.leadArtistName, description: project.leadArtistBio || undefined }
      : undefined,
    genre: project.domains,
    keywords: [...project.domains, ...project.pathways].join(', '),
    about: project.overviewLead || project.shortDescription,
    isPartOf: { '@type': 'WebSite', name: 'Resonance Network', url: 'https://resonancenetwork.org' },
  }
}

function getBreadcrumbJsonLd(project: Project) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://resonancenetwork.org' },
      { '@type': 'ListItem', position: 2, name: 'Projects', item: 'https://resonancenetwork.org/#projects' },
      { '@type': 'ListItem', position: 3, name: project.title, item: `https://resonancenetwork.org/projects/${project.slug}` },
    ],
  }
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
    case 'behance': return <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 3.211 3.483 3.312 4.588 1.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988H0V5.021h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zM3 11h3.584c2.508 0 2.906-3-.312-3H3v3zm3.391 3H3v3.016h3.341c3.055 0 2.868-3.016.05-3.016z"/></svg>
    case 'github': return <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
    case 'linktree': return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18M7 7l5-4 5 4M7 13h10M8 18h8"/></svg>
    case 'spotify': return <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2z"/></svg>
    default: return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
  }
}

interface CollabRole {
  title: string
  customTitle?: string
  skills?: string
  description: string
  image_url?: string
}

export default async function ProjectPage({ params }: { params: { slug: string } }) {
  const project = await getProjectBySlug(params.slug)
  if (!project) notFound()

  // Parse gallery data — matching preview page logic
  let galleryImages: Array<{ url: string; alt: string }> = []
  let galleryPdfs: Array<{ url: string; title: string; thumbnail?: string }> = []
  let galleryLinks: Array<{ url: string; label: string; thumbnail?: string }> = []
  let projectSocialLinks: Array<{ platform: string; url: string }> = []
  let projectDescription = ''
  let inclusivityStatement = ''
  let materialsRegen = ''
  let savedGalleryOrder: string[] = []

  if (project.galleryImagesData) {
    try {
      const parsed = JSON.parse(project.galleryImagesData)
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

  // Fallback: legacy JSON projects have galleryImages directly on the project object
  if (galleryImages.length === 0 && project.galleryImages && project.galleryImages.length > 0) {
    galleryImages = project.galleryImages.map(img => ({ url: img.url, alt: img.alt || '' }))
  }

  // Parse collaboration roles — matching preview page logic
  let collabRoles: CollabRole[] = []
  let collabPlainText = ''
  if (project.collaborationNeeds) {
    try {
      const parsed = JSON.parse(project.collaborationNeeds)
      if (Array.isArray(parsed) && parsed.length > 0) {
        collabRoles = parsed
      }
    } catch {
      collabPlainText = project.collaborationNeeds
    }
  }

  const goalsList = project.goals || []
  const domains = project.domains || []
  const pathways = project.pathways || []

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getProjectJsonLd(project)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getBreadcrumbJsonLd(project)) }}
      />

      {/* Breadcrumb navigation */}
      <nav aria-label="Breadcrumb" className="breadcrumb container" style={{ paddingTop: 'var(--space-4)' }}>
        <Link href="/">Home</Link> <span aria-hidden="true">/</span> <Link href="/#projects">Projects</Link> <span aria-hidden="true">/</span> <span>{project.title}</span>
      </nav>

      {/* Hero */}
      <section className="project-hero">
        {project.heroImage.url && project.heroImage.url !== '/assets/images/projects/money-shot.png' && (
          <img
            src={project.heroImage.url}
            alt={project.heroImage.alt}
          />
        )}
        <div className="project-hero__overlay" />
        <div className="project-hero__content">
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <Badge variant="stage">{project.stage}</Badge>
            {project.source === 'json' && <Badge variant="concept">AI Concept</Badge>}
          </div>
          <h1 className="project-hero__title">{project.title}</h1>
          <p className="project-hero__desc">{project.shortDescription}</p>
          <div style={{ marginTop: 'var(--space-4)' }}>
            <ProjectFollowWrapper projectId={project.slug} />
          </div>
        </div>
      </section>

      {/* AI Concept notice */}
      {project.source === 'json' && (
        <div style={{ background: 'var(--color-surface-alt)', borderBottom: '1px solid var(--color-border)', padding: 'var(--space-3) 0', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', textAlign: 'center' }}>
          <div className="container">
            This is a fictional AI-generated concept project to demonstrate the platform. <a href="/#projects" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>View real projects</a>
          </div>
        </div>
      )}

      {/* Overview with stats sidebar — matching preview */}
      {(project.overviewLead || project.leadArtistName) && (
        <section className="project-overview">
          <div className="container">
            <p className="section-label">Project Philosophy</p>
            <div className="overview-grid">
              <div>
                {project.overviewLead && (() => {
                  const parts = project.overviewLead.split('\n\n')
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
                {project.leadArtistName && (
                  <div className="overview-stat">
                    <p className="overview-stat__label">Lead Creator</p>
                    <p className="overview-stat__value">{project.leadArtistName}</p>
                  </div>
                )}
                <div className="overview-stat">
                  <p className="overview-stat__label">Stage</p>
                  <p className="overview-stat__value">{project.stage}</p>
                </div>
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
                {projectSocialLinks.length > 0 && (
                  <div className="overview-stat">
                    <p className="overview-stat__label">Links</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                      {projectSocialLinks.map((link, i) => (
                        <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" title={link.platform}
                          style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'var(--color-surface)', color: 'var(--color-text)', textDecoration: 'none', border: '1px solid var(--color-border)', transition: 'background 0.2s' }}>
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

      {/* Gallery — SmartGallery matching preview */}
      <ProjectSmartGallery
        galleryImages={galleryImages}
        galleryPdfs={galleryPdfs}
        galleryLinks={galleryLinks}
        savedGalleryOrder={savedGalleryOrder}
      />

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

      {/* The Experience */}
      {project.experience && (
        <section className="project-experience">
          <div className="container">
            <p className="section-label">The Experience</p>
            <h2>What It Feels Like</h2>
            <p className="overview-body">{project.experience}</p>
            {project.stage !== 'Production' && project.stage !== 'Completed' && (
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

      {/* The Story Behind It */}
      {project.artistStory && (
        <section className="project-story">
          <div className="container">
            <p className="section-label">Origin</p>
            <h2>The Story Behind It</h2>
            <p className="overview-body">{project.artistStory}</p>
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

      {/* Milestones (legacy JSON projects) */}
      {project.milestones && project.milestones.length > 0 && (
        <section className="project-milestones">
          <div className="container">
            <p className="section-label">Progress</p>
            <h2>Where It Stands</h2>
            <div className="milestones-list">
              {project.milestones.map((m: Milestone, i: number) => (
                <div key={i} className={`milestone-item${m.completed ? ' milestone-item--done' : ''}`}>
                  <span className="milestone-check">{m.completed ? '\u2713' : ''}</span>
                  <span className="milestone-label">{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Updates (legacy JSON projects) */}
      {project.updates && project.updates.length > 0 && (
        <section className="project-updates">
          <div className="container">
            <p className="section-label">Field Notes</p>
            <h2>Latest from the Studio</h2>
            <div className="updates-list">
              {project.updates.map((u: ProjectUpdate, i: number) => (
                <div key={i} className="update-item">
                  <span className="update-date">
                    {new Date(u.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="update-text">
                    {u.link ? <a href={u.link} target="_blank" rel="noopener noreferrer">{u.text}</a> : u.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Team — matching preview layout */}
      {(project.leadArtistName || (project.teamMembers && project.teamMembers.length > 0) || project.collaborators.length > 0) && (
        <section className="project-artist">
          <div className="container">
            <p className="section-label">The People Behind It</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
              {/* Lead creator */}
              {project.leadArtistName && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '100%', aspectRatio: '3/4', borderRadius: 'var(--radius-lg)', background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-3)', fontSize: '2rem', color: 'var(--color-text-muted)', overflow: 'hidden' }}>
                    {project.leadArtistPhoto || project.artistHeadshotData ? (
                      <img src={project.leadArtistPhoto || project.artistHeadshotData!} alt={project.leadArtistName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      (project.leadArtistName || '?').charAt(0).toUpperCase()
                    )}
                  </div>
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, margin: '0 0 var(--space-1)' }}>{project.leadArtistName}</h3>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>Lead Creator</p>
                </div>
              )}
              {/* Team members from submission */}
              {project.teamMembers && project.teamMembers.map((member, i) => (
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
              {/* Legacy collaborators from JSON projects */}
              {!project.teamMembers && project.collaborators.map(c => (
                <div key={c.name} style={{ textAlign: 'center' }}>
                  <div style={{ width: '100%', aspectRatio: '3/4', borderRadius: 'var(--radius-lg)', background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-3)', fontSize: '2rem', color: 'var(--color-text-muted)', overflow: 'hidden' }}>
                    {c.photo ? (
                      <img src={c.photo} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      c.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, margin: '0 0 var(--space-1)' }}>{c.name}</h3>
                  {c.role && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>{c.role}</p>}
                </div>
              ))}
            </div>
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
              <div className="classification-item">
                <h3>Stage</h3>
                <Badge variant="stage">{project.stage}</Badge>
              </div>
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

      {/* Collaboration — using task-card styling from collaborate page */}
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
                    {project.heroImage.url && project.heroImage.url !== '/assets/images/projects/money-shot.png' && (
                      <div className="task-card__banner">
                        <img src={project.heroImage.url} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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

      {/* Contact */}
      {project.contactEmail && (
        <section className="project-contact">
          <div className="container">
            <p className="section-label">Reach Out</p>
            <h2>Get in Touch</h2>
            <p>Want to support, host, or collaborate on this project? We&apos;d love to hear from you.</p>
            <a
              href={`mailto:${project.contactEmail}?subject=Inquiry%20about%20${encodeURIComponent(project.title)}%20via%20Resonance%20Network`}
              className="btn btn--primary btn--large"
            >
              Contact the Team
            </a>
          </div>
        </section>
      )}

      {/* Bottom nav */}
      <nav className="project-nav" aria-label="Related pages">
        <div className="container" style={{ display: 'flex', gap: 'var(--space-4)', paddingBottom: 'var(--space-8)', flexWrap: 'wrap' }}>
          <Link href="/" className="btn btn--outline">All Projects</Link>
          <Link href="/collaborate" className="btn btn--outline">All Open Roles</Link>
          <Link href="/join" className="btn btn--outline">Share Your Project</Link>
        </div>
      </nav>
    </article>
  )
}
