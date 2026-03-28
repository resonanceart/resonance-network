'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { PortfolioProject } from '@/types'

interface PortfolioGridProps {
  projects: PortfolioProject[]
  profileSlug: string
}

export function PortfolioGrid({ projects, profileSlug }: PortfolioGridProps) {
  const [activeCategory, setActiveCategory] = useState('All')

  const categories = useMemo(() => {
    const unique = Array.from(new Set(projects.map(p => p.category)))
    return ['All', ...unique]
  }, [projects])

  const sortedAndFiltered = useMemo(() => {
    const filtered = activeCategory === 'All'
      ? projects
      : projects.filter(p => p.category === activeCategory)

    return [...filtered].sort((a, b) => {
      if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1
      return a.display_order - b.display_order
    })
  }, [projects, activeCategory])

  if (projects.length === 0) {
    return (
      <div className="portfolio-empty">
        <div className="portfolio-empty__icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
        <p className="portfolio-empty__text">No work to show yet</p>
      </div>
    )
  }

  return (
    <div>
      <div className="portfolio-filter-bar">
        {categories.map(cat => (
          <button
            key={cat}
            className={`portfolio-filter-tab${cat === activeCategory ? ' portfolio-filter-tab--active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="portfolio-grid">
        {sortedAndFiltered.map(project => (
          <Link
            key={project.id}
            href={`/profiles/${profileSlug}/work/${project.slug}`}
            className="portfolio-card"
          >
            <Image
              src={project.cover_image_url}
              alt={project.title}
              width={600}
              height={400}
              className="portfolio-card__image"
            />
            <div className="portfolio-card__overlay">
              <h3 className="portfolio-card__title">{project.title}</h3>
              <div className="portfolio-card__meta">
                <span className="portfolio-card__category">{project.category}</span>
                <span className="portfolio-card__year">
                  {new Date(project.start_date).getFullYear()}
                </span>
              </div>
            </div>
            {project.is_featured && (
              <span className="portfolio-card__featured-badge">Featured</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
