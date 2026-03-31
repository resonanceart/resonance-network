'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Project } from '@/types'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'

interface Props {
  project: Project
  index?: number
  transitionDelay?: number
}

export function ProjectCard({ project, index = 0, transitionDelay = 0 }: Props) {
  const [imgError, setImgError] = useState(false)
  const { ref, isVisible } = useScrollAnimation(0.1)
  const staggerDelay = (index % 3) * 0.08

  return (
    <div
      ref={ref}
      className={`project-card${isVisible ? ' project-card--visible' : ''}${project.source === 'json' ? ' project-card--concept' : ''}`}
      style={{
        animationDelay: isVisible ? `${staggerDelay}s` : undefined,
        transitionDelay: `${transitionDelay}s`,
      }}
    >
      <Link href={`/projects/${project.slug}`} className="project-card__link">
        {!imgError ? (
          project.heroImage.url.startsWith('data:') ? (
            <img
              src={project.heroImage.url}
              alt={project.heroImage.alt}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <Image
              src={project.heroImage.url}
              alt={project.heroImage.alt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              loading="lazy"
              style={{ objectFit: 'cover' }}
              onError={() => setImgError(true)}
            />
          )
        ) : (
          <div
            style={{ position: 'absolute', inset: 0, backgroundColor: '#1a1a1a' }}
            aria-hidden="true"
          />
        )}
        {project.source === 'json' && (
          <span className="project-card__concept-tooltip">AI Concept — developed by AI</span>
        )}
        <div className="project-card__body">
          <p className="project-card__eyebrow">{project.eyebrow}</p>
          <h2 className="project-card__title">{project.title}</h2>
          {project.source === 'json' && (
            <span className="project-card__concept-badge">AI Concept</span>
          )}
        </div>
      </Link>
    </div>
  )
}
