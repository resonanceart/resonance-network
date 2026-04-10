'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import Link from 'next/link'

export default function NewProjectPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [useClassicForm, setUseClassicForm] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/login'); return }

    // Check if user explicitly wants the classic form via ?form=classic
    const params = new URLSearchParams(window.location.search)
    if (params.get('form') === 'classic') {
      setUseClassicForm(true)
      setLoading(false)
    } else {
      // Default: redirect to live editor
      router.replace('/dashboard/projects/live-edit?new=true')
    }
  }, [user, authLoading, router])

  if (!useClassicForm) {
    return (
      <div className="container" style={{ padding: 'var(--space-16) 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Redirecting to project builder...</p>
      </div>
    )
  }

  if (authLoading || loading) {
    return <div className="container dashboard-loading"><div className="dashboard-spinner" /></div>
  }
  if (!user) return null

  return (
    <div className="container" style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-10)', maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        <Link href="/dashboard/projects" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontSize: 'var(--text-sm)' }}>
          &larr; Back to My Projects
        </Link>
        <Link href="/dashboard/projects/live-edit?new=true" className="btn btn--outline btn--sm">
          Use Page Builder
        </Link>
      </div>
      <h1 style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>Submit New Project (Classic Form)</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>
        The classic form is no longer available. Please use the{' '}
        <Link href="/dashboard/projects/live-edit?new=true" style={{ color: 'var(--color-accent)' }}>
          Page Builder
        </Link>{' '}
        to create your project. You can access all form fields via the Settings panel in the toolbar.
      </p>
    </div>
  )
}
