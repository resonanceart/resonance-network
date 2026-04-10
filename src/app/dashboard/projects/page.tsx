'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'
import ImportPromptPopup from '@/components/dashboard/ImportPromptPopup'

interface Project {
  id: string
  project_title: string
  status: string
  created_at: string
  one_sentence: string | null
  artist_name: string
}

export default function MyProjectsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login')
      return
    }

    fetch('/api/user/projects')
      .then(res => res.json())
      .then(data => {
        setProjects(data.submissions ?? data.projects ?? [])
      })
      .catch(err => {
        console.error('Failed to load projects:', err)
      })
      .finally(() => setLoading(false))
  }, [user, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="container dashboard-loading">
        <div className="dashboard-spinner" aria-label="Loading projects" />
      </div>
    )
  }

  if (!user) return null

  function statusLabel(status: string): string {
    switch (status) {
      case 'new': return 'Under Review'
      case 'draft': return 'Draft'
      case 'approved': return 'Live'
      case 'rejected': return 'Changes Requested'
      default: return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  function badgeVariant(status: string): string {
    if (status === 'approved') return 'stage'
    if (status === 'rejected') return 'domain'
    return 'pathway'
  }

  function projectSlug(project: Project): string {
    const slug = project.project_title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    return `sub-${slug}-${project.id.substring(0, 8)}`
  }

  async function handleDelete(project: Project) {
    if (!window.confirm(`Are you sure you want to delete "${project.project_title}"? This cannot be undone.`)) return
    setDeletingId(project.id)
    try {
      const res = await fetch('/api/user/projects', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId: project.id }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Delete failed')
      }
      setProjects(prev => prev.filter(p => p.id !== project.id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete project. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <section className="my-projects-page">
      <div className="container" style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-10)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <h1 style={{ margin: 0 }}>My Projects</h1>
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <Link href="/dashboard/projects/import" className="btn btn--outline">
              Import from Website
            </Link>
            <Link href="/dashboard/projects/new" className="btn btn--primary">
              Submit New Project
            </Link>
          </div>
        </div>

        {projects.length === 0 && <ImportPromptPopup mode="both" />}

        {projects.length === 0 ? (
          <div
            className="my-projects-empty"
            style={{
              textAlign: 'center',
              padding: 'var(--space-10) var(--space-4)',
              background: 'var(--color-surface)',
              borderRadius: '12px',
              border: '1px solid var(--color-border)',
            }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}
              aria-hidden="true"
            >
              <path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V9C21 7.89543 20.1046 7 19 7H13L11 5H5C3.89543 5 3 5.89543 3 7Z" />
            </svg>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-base)' }}>
              You haven&apos;t submitted any projects yet.
            </p>
            <Link href="/dashboard/projects/new" className="btn btn--primary">
              Submit Your First Project
            </Link>
          </div>
        ) : (
          <div
            className="my-projects-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(400px, 100%), 1fr))',
              gap: 'var(--space-4)',
            }}
          >
            {projects.map(project => (
              <div
                key={project.id}
                className="my-projects-card"
                style={{
                  background: 'var(--color-surface)',
                  borderRadius: '12px',
                  border: '1px solid var(--color-border)',
                  padding: 'var(--space-5)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-3)',
                }}
              >
                <h3
                  className="my-projects-card__title"
                  style={{ margin: 0, fontSize: 'var(--text-lg)' }}
                >
                  {project.project_title}
                </h3>

                <div
                  className="my-projects-card__meta"
                  style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
                >
                  <Badge variant={badgeVariant(project.status)}>
                    {statusLabel(project.status)}
                  </Badge>
                  <time style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                    {formatDate(project.created_at)}
                  </time>
                </div>

                {project.one_sentence && (
                  <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
                    {project.one_sentence}
                  </p>
                )}

                <div
                  className="my-projects-card__actions"
                  style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'auto', flexWrap: 'wrap' }}
                >
                  <Link
                    href={`/dashboard/projects/live-edit?id=${project.id}`}
                    className="btn btn--outline btn--sm"
                  >
                    {project.status === 'approved' ? 'Manage' : 'Edit'}
                  </Link>
                  {project.status !== 'approved' && (
                    <Link
                      href={`/dashboard/projects/preview?id=${project.id}`}
                      className="btn btn--outline btn--sm"
                    >
                      Preview
                    </Link>
                  )}
                  {project.status === 'approved' && (
                    <Link
                      href={`/projects/${projectSlug(project)}`}
                      className="btn btn--outline btn--sm"
                    >
                      View Live
                    </Link>
                  )}
                  <button
                    onClick={() => handleDelete(project)}
                    disabled={deletingId === project.id}
                    className="btn btn--outline btn--sm"
                    style={{
                      color: 'var(--color-error, #dc2626)',
                      borderColor: 'var(--color-error, #dc2626)',
                      marginLeft: 'auto',
                      opacity: deletingId === project.id ? 0.5 : 1,
                      cursor: deletingId === project.id ? 'not-allowed' : 'pointer',
                      minHeight: '44px',
                      paddingLeft: 'var(--space-4)',
                      paddingRight: 'var(--space-4)',
                    }}
                  >
                    {deletingId === project.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
