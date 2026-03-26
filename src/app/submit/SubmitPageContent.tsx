'use client'

import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'

export function SubmitPageContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
        <div className="dashboard-spinner" aria-label="Loading" />
      </div>
    )
  }

  if (user) {
    // Authenticated users should use the dashboard form
    return (
      <section className="submit-form-section" id="submission-form">
        <div className="container">
          <h2>Submit Your Project</h2>
          <p style={{ marginBottom: 'var(--space-4)' }}>
            You&apos;re signed in! Head to your dashboard to submit and manage your project.
          </p>
          <Link href="/dashboard/projects/new" className="btn btn--primary btn--large">
            Go to Project Submission &rarr;
          </Link>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-3)' }}>
            You can also manage existing submissions from your <Link href="/dashboard" style={{ color: 'var(--color-primary)' }}>dashboard</Link>.
          </p>
        </div>
      </section>
    )
  }

  // Anonymous users see signup CTA instead of the form
  return (
    <section className="submit-form-section" id="submission-form">
      <div className="container">
        <h2>Submit Your Project</h2>
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
            To submit a project, you&apos;ll need a free account first.
          </p>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-5)', fontSize: 'var(--text-sm)' }}>
            This lets you manage your submission, edit it later, and build your artist profile on the network.
          </p>
          <Link
            href="/login?tab=signup&redirect=/dashboard/projects/new"
            className="btn btn--primary btn--large"
            style={{ marginBottom: 'var(--space-3)', display: 'inline-block' }}
          >
            Create Account &amp; Submit
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
