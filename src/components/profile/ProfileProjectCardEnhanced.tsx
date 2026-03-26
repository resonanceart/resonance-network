import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import type { ProfileProject } from '@/types'

export function ProfileProjectCardEnhanced({ project }: { project: ProfileProject }) {
  return (
    <div className="profile-project-card-enhanced">
      {project.image && (
        <div className="profile-project-card-enhanced__image">
          <Image
            src={project.image}
            alt={`Project image for ${project.title}`}
            width={600}
            height={400}
            sizes="(max-width: 768px) 100vw, 33vw"
            loading="lazy"
            style={{ objectFit: 'cover', width: '100%', height: 'auto' }}
          />
          {project.galleryImages && project.galleryImages.length > 0 && (
            <div className="profile-project-card-enhanced__thumbs">
              {project.galleryImages.slice(0, 4).map((img, i) => (
                <div key={i} className="profile-project-card-enhanced__thumb">
                  <Image src={img.url} alt={img.alt} width={80} height={60} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="profile-project-card-enhanced__body">
        <div className="profile-project-card__meta">
          {project.year && <span className="profile-project-card__year">{project.year}</span>}
          {project.role && <span className="profile-project-card__role">{project.role}</span>}
        </div>
        <h3 className="profile-project-card__title">
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
        <p className="profile-project-card__desc">{project.description}</p>
        {project.materials && project.materials.length > 0 && (
          <div className="profile-project-card-enhanced__materials">
            {project.materials.map(m => (
              <Badge key={m} variant="tool">{m}</Badge>
            ))}
          </div>
        )}
        {project.outcomes && (
          <p className="profile-project-card-enhanced__outcomes">{project.outcomes}</p>
        )}
      </div>
    </div>
  )
}
