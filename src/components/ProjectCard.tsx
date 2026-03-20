import Link from 'next/link'
import Image from 'next/image'
import type { Project } from '@/types'

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.slug}`} className="project-card">
      <Image
        src={project.heroImage.url}
        alt={project.heroImage.alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        loading="lazy"
        style={{ objectFit: 'cover' }}
      />
      <div className="project-card__overlay"></div>
      <div className="project-card__body">
        <p className="project-card__eyebrow">{project.eyebrow}</p>
        <h2 className="project-card__title">{project.title}</h2>
        <p className="project-card__desc">{project.shortDescription}</p>
        <div className="badges-group">
          <span className="badge badge--stage">{project.stage}</span>
        </div>
      </div>
    </Link>
  )
}
