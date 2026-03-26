import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import type { ProfileProject } from '@/types'

export function ProfileFeaturedWork({ projects }: { projects: ProfileProject[] }) {
  return (
    <div className="profile-featured-work">
      {projects.map((project, i) => (
        <div key={i} className="profile-featured-work__card">
          {project.image && (
            <div className="profile-featured-work__image">
              <Image
                src={project.image}
                alt={`Featured project: ${project.title}`}
                width={800}
                height={450}
                sizes="(max-width: 768px) 100vw, 50vw"
                loading="lazy"
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              />
            </div>
          )}
          <div className="profile-featured-work__body">
            <div className="profile-featured-work__meta">
              {project.role && <Badge variant="role">{project.role}</Badge>}
              {project.year && <span className="profile-featured-work__year">{project.year}</span>}
            </div>
            <h3 className="profile-featured-work__title">
              {project.url ? (
                project.url.startsWith('http') ? (
                  <a href={project.url} target="_blank" rel="noopener noreferrer">{project.title}</a>
                ) : (
                  <Link href={project.url}>{project.title}</Link>
                )
              ) : (
                project.title
              )}
            </h3>
            <p className="profile-featured-work__desc">{project.description}</p>
            {project.materials && project.materials.length > 0 && (
              <div className="profile-featured-work__materials">
                {project.materials.map(m => (
                  <Badge key={m} variant="tool">{m}</Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
