import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Badge } from '@/components/ui/Badge'
import { ProjectGalleryGrid } from '@/components/ProjectGalleryGrid'
import { CollaborationTaskCard } from '@/components/CollaborationTaskCard'
import { TeamCard } from '@/components/TeamCard'
import projectsData from '../../../../data/projects.json'
import tasksData from '../../../../data/tasks.json'
import type { Project, CollaborationTask } from '@/types'
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
  return {
    title: `${project.title} — Resonance Network`,
    description: project.shortDescription,
    openGraph: {
      title: project.title,
      description: project.shortDescription,
      images: [{ url: project.heroImage.url, alt: project.heroImage.alt }],
      type: 'website',
    },
  }
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const project = (projectsData as Project[]).find(p => p.slug === params.slug)
  if (!project) notFound()

  const tasks = (tasksData as CollaborationTask[]).filter(t => t.projectId === project.slug)

  return (
    <>
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
            <p className="section-label">Overview</p>
            <div className="overview-grid">
              <div>
                {project.overviewLead && (
                  <p className="overview-lead">{project.overviewLead}</p>
                )}
                {project.overviewBody && (
                  <p className="overview-body">{project.overviewBody}</p>
                )}
              </div>
              <div className="overview-stats">
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
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {project.galleryImages.length > 0 && (
        <ProjectGalleryGrid images={project.galleryImages} />
      )}

      {/* Classification */}
      <section className="project-classification">
        <div className="container">
          <p className="section-label">Classification</p>
          <div className="classification-grid">
            {project.domains.length > 0 && (
              <div className="classification-item">
                <h4>Domains</h4>
                <div className="badges-group">
                  {project.domains.map(d => (
                    <Badge key={d} variant="domain">{d}</Badge>
                  ))}
                </div>
              </div>
            )}
            {project.pathways.length > 0 && (
              <div className="classification-item">
                <h4>Pathways</h4>
                <div className="badges-group">
                  {project.pathways.map(p => (
                    <Badge key={p} variant="pathway">{p}</Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="classification-item">
              <h4>Stage</h4>
              <Badge variant="stage">{project.stage}</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      {(project.leadArtistName || project.collaborators.length > 0) && (
        <section className="project-artist">
          <div className="container">
            <p className="section-label">Team</p>
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
            <p className="section-label">Get Involved</p>
            <h2>Collaboration Opportunities</h2>
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
            <p className="section-label">Contact</p>
            <h2>Get in Touch</h2>
            <p>Interested in supporting, hosting, or collaborating? Reach out directly to the team.</p>
            <a
              href={`mailto:${project.contactEmail}?subject=Inquiry%20about%20${encodeURIComponent(project.title)}%20via%20Resonance%20Network`}
              className="btn btn--primary btn--large"
            >
              Contact the Team
            </a>
          </div>
        </section>
      )}
    </>
  )
}
