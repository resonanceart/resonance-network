import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { ProjectGalleryGrid } from '@/components/ProjectGalleryGrid'
import { CollaborationTaskCard } from '@/components/CollaborationTaskCard'
import { TeamCard } from '@/components/TeamCard'
import projectsData from '../../../../data/projects.json'
import tasksData from '../../../../data/tasks.json'
import type { Project, CollaborationTask, Milestone, ProjectUpdate } from '@/types'
import type { Metadata } from 'next'

export async function generateStaticParams() {
  return (projectsData as Project[])
    .filter(p => p.status === 'published')
    .map(p => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const project = (projectsData as Project[]).find(p => p.slug === params.slug)
  if (!project) return {}
  const title = `${project.title} — ${project.domains.slice(0, 2).join(' & ')} Project`
  return {
    title,
    description: project.shortDescription,
    alternates: {
      canonical: `https://resonance.network/projects/${project.slug}`,
    },
    openGraph: {
      title: project.title,
      description: project.shortDescription,
      url: `https://resonance.network/projects/${project.slug}`,
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
    url: `https://resonance.network/projects/${project.slug}`,
    image: project.heroImage.url,
    creator: project.leadArtistName
      ? {
          '@type': 'Person',
          name: project.leadArtistName,
          description: project.leadArtistBio || undefined,
        }
      : undefined,
    genre: project.domains,
    keywords: [...project.domains, ...project.pathways].join(', '),
    about: project.overviewLead || project.shortDescription,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Resonance Network',
      url: 'https://resonance.network',
    },
  }
}

function getBreadcrumbJsonLd(project: Project) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://resonance.network',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Projects',
        item: 'https://resonance.network/#projects',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: project.title,
        item: `https://resonance.network/projects/${project.slug}`,
      },
    ],
  }
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const project = (projectsData as Project[]).find(p => p.slug === params.slug)
  if (!project) notFound()

  const tasks = (tasksData as CollaborationTask[]).filter(t => t.projectId === project.slug)

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
        <Image
          src={project.heroImage.url}
          alt={project.heroImage.alt}
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover' }}
        />
        <div className="project-hero__overlay"></div>
        <div className="project-hero__content">
          <Badge variant="stage">{project.stage}</Badge>
          <h1 className="project-hero__title">{project.title}</h1>
          <p className="project-hero__desc">{project.shortDescription}</p>
        </div>
      </section>

      {/* Overview */}
      {(project.overviewLead || project.leadArtistName) && (
        <section className="project-overview">
          <div className="container">
            <h2 className="sr-only">Project Overview</h2>
            <p className="section-label">The Vision</p>
            <h2 className="sr-only">Project Overview</h2>
            <div className="overview-grid">
              <div>
                {project.overviewLead && (
                  <p className="overview-lead">{project.overviewLead}</p>
                )}
                {project.overviewBody && (
                  <p className="overview-body">{project.overviewBody}</p>
                )}
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
                {project.pathways.length > 0 && (
                  <div className="overview-stat">
                    <p className="overview-stat__label">Pathways</p>
                    <p className="overview-stat__value">{project.pathways.join(' · ')}</p>
                  </div>
                )}
              </aside>
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {project.galleryImages.length > 0 && (
        <ProjectGalleryGrid images={project.galleryImages} />
      )}

      {/* Milestones */}
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

      {/* Latest Updates */}
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
                    {u.link ? (
                      <a href={u.link} target="_blank" rel="noopener noreferrer">{u.text}</a>
                    ) : (
                      u.text
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Classification */}
      <section className="project-classification">
        <div className="container">
          <h2 className="sr-only">Project Classification</h2>
          <p className="section-label">DNA</p>
          <h2 className="sr-only">Project Classification</h2>
          <div className="classification-grid">
            {project.domains.length > 0 && (
              <div className="classification-item">
                <h3>Domains</h3>
                <div className="badges-group">
                  {project.domains.map(d => (
                    <Badge key={d} variant="domain">{d}</Badge>
                  ))}
                </div>
              </div>
            )}
            {project.pathways.length > 0 && (
              <div className="classification-item">
                <h3>Pathways</h3>
                <div className="badges-group">
                  {project.pathways.map(p => (
                    <Badge key={p} variant="pathway">{p}</Badge>
                  ))}
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

      {/* Team */}
      {(project.leadArtistName || project.collaborators.length > 0) && (
        <section className="project-artist">
          <div className="container">
            <h2 className="sr-only">Team Members</h2>
            <p className="section-label">The People Behind It</p>
            <h2 className="sr-only">Team Members</h2>
            <div className="team-grid">
              {project.leadArtistName && (
                <TeamCard
                  name={project.leadArtistName}
                  bio={project.leadArtistBio || ''}
                  photo={project.leadArtistPhoto}
                />
              )}
              {project.collaborators.map(c => (
                <TeamCard
                  key={c.name}
                  name={c.name}
                  bio={c.role}
                  photo={c.photo}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Collaboration Tasks */}
      {tasks.length > 0 && (
        <section className="project-collab">
          <div className="container">
            <p className="section-label">Join This Project</p>
            <h2>Roles Seeking People</h2>
            <div className="task-grid">
              {tasks.map(task => (
                <CollaborationTaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact */}
      {project.contactEmail && (
        <section className="project-contact">
          <div className="container">
            <p className="section-label">Reach Out</p>
            <h2>Start a Conversation</h2>
            <p>Interested in supporting, hosting, or collaborating on this project? The team would love to hear from you.</p>
            <a
              href={`mailto:${project.contactEmail}?subject=Inquiry%20about%20${encodeURIComponent(project.title)}%20via%20Resonance%20Network`}
              className="btn btn--primary btn--large"
            >
              Contact the Team
            </a>
          </div>
        </section>
      )}

      {/* Internal linking: back to gallery and collaborate */}
      <nav className="project-nav" aria-label="Related pages">
        <div className="container" style={{ display: 'flex', gap: 'var(--space-4)', paddingBottom: 'var(--space-8)', flexWrap: 'wrap' }}>
          <Link href="/" className="btn btn--outline">Explore All Projects</Link>
          <Link href="/collaborate" className="btn btn--outline">See All Open Roles</Link>
          <Link href="/submit" className="btn btn--outline">Bring Your Own Project</Link>
        </div>
      </nav>
    </article>
  )
}
