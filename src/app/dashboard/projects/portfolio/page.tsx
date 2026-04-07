'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabase-client'
import Link from 'next/link'
import type { PortfolioProject } from '@/types'

export default function PortfolioListPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [projects, setProjects] = useState<PortfolioProject[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/login'); return }

    async function loadProjects() {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user!.id)
        .single()
      if (!profile) { setLoading(false); return }

      const { data } = await supabase
        .from('portfolio_projects')
        .select('*')
        .eq('profile_id', profile.id)
        .order('display_order', { ascending: true })

      setProjects(data || [])
      setLoading(false)
    }
    loadProjects()
  }, [user, authLoading, router])

  if (authLoading || loading) {
    return <div className="portfolio-editor"><p>Loading...</p></div>
  }

  return (
    <div className="portfolio-editor">
      <div className="portfolio-editor__header">
        <div className="portfolio-editor__breadcrumb">
          <Link href="/dashboard">Dashboard</Link> / <span>Work</span>
        </div>
        <Link href="/dashboard/projects/portfolio/new" className="portfolio-editor__btn portfolio-editor__btn--primary">
          + Add New Work
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="portfolio-editor__empty">
          <h2>No work added yet</h2>
          <p>Add your first piece of work to showcase what you do.</p>
          <Link href="/dashboard/projects/portfolio/new" className="portfolio-editor__btn portfolio-editor__btn--primary">
            Add New Work
          </Link>
        </div>
      ) : (
        <div className="portfolio-editor__grid">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/portfolio/${project.id}/edit`}
              className="portfolio-editor__card"
            >
              {project.cover_image_url ? (
                <div
                  className="portfolio-editor__card-image"
                  style={{ backgroundImage: `url(${project.cover_image_url})` }}
                />
              ) : (
                <div className="portfolio-editor__card-image portfolio-editor__card-image--empty">
                  No Image
                </div>
              )}
              <div className="portfolio-editor__card-body">
                <h3 className="portfolio-editor__card-title">{project.title}</h3>
                {project.tagline && (
                  <p className="portfolio-editor__card-tagline">{project.tagline}</p>
                )}
                <span className={`portfolio-editor__status-badge portfolio-editor__status-badge--${project.status}`}>
                  {project.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
