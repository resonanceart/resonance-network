'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'

export function SubmitPageContent() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard/projects/new')
    }
  }, [user, loading, router])

  if (loading || user) {
    return (
      <section className="submit-form-section" id="submission-form">
        <div className="container" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <div className="dashboard-spinner" aria-label="Loading" />
        </div>
      </section>
    )
  }

  return (
    <section className="submit-form-section" id="submission-form">
      <div className="container">
        <h2>Share Your Project</h2>
        <div style={{
          padding: 'var(--space-6)',
          borderRadius: 'var(--radius-lg)',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          textAlign: 'center',
          maxWidth: '600px',
          margin: '0 auto',
        }}>
          <p style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-3)' }}>
            To submit a project, create your free profile first.
          </p>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-5)', fontSize: 'var(--text-sm)' }}>
            Your profile becomes your portfolio on the network. You can manage your submission, edit it later, and connect with collaborators.
          </p>
          <Link
            href="/login?tab=signup&redirect=/dashboard/projects/new"
            className="btn btn--primary btn--large"
            style={{ marginBottom: 'var(--space-3)', display: 'inline-block' }}
          >
            Create Account &amp; Submit &rarr;
          </Link>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            Already have an account?{' '}
            <Link href="/login?redirect=/dashboard/projects/new" style={{ color: 'var(--color-primary)' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
