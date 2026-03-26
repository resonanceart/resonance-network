'use client'

import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'

export default function JoinPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <section className="join-hero">
        <div className="container" style={{ textAlign: 'center', padding: 'var(--space-16) 0' }}>
          <div className="dashboard-spinner" aria-label="Loading" />
        </div>
      </section>
    )
  }

  if (user) {
    return (
      <>
        <section className="join-hero">
          <div className="container">
            <p className="section-label">Your Network</p>
            <h1>Welcome Back</h1>
            <p className="join-hero__sub">Here&apos;s what you can do next.</p>
          </div>
        </section>
        <section className="join-paths">
          <div className="container">
            <div className="join-cards">
              <Link href="/dashboard" className="join-card" style={{ textDecoration: 'none' }}>
                <h2>Go to Dashboard</h2>
                <p className="join-card__desc">View your submissions, messages, and profile.</p>
              </Link>
              <Link href="/dashboard/profile" className="join-card" style={{ textDecoration: 'none' }}>
                <h2>Edit Your Profile</h2>
                <p className="join-card__desc">Update your portfolio, skills, and availability.</p>
              </Link>
              <Link href="/dashboard/projects/new" className="join-card" style={{ textDecoration: 'none' }}>
                <h2>Submit a Project</h2>
                <p className="join-card__desc">Bring your ambitious project to the network.</p>
              </Link>
              <Link href="/collaborate" className="join-card" style={{ textDecoration: 'none' }}>
                <h2>Browse Open Roles</h2>
                <p className="join-card__desc">Find collaboration opportunities on curated projects.</p>
              </Link>
            </div>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <section className="join-hero">
        <div className="container">
          <p className="section-label">Get Involved</p>
          <h1>Join Resonance Network</h1>
          <p className="join-hero__sub">
            Create your free profile — and submit a project if you have one. It only takes a few minutes.
          </p>
          <Link
            href="/login?tab=signup&redirect=/dashboard/welcome"
            className="btn btn--primary btn--large"
            style={{ marginTop: 'var(--space-4)' }}
          >
            Create Your Free Profile &rarr;
          </Link>
        </div>
      </section>

      <section className="join-paths">
        <div className="container">
          <ul className="join-benefits">
            <li>
              <strong>Build your portfolio</strong>
              <span>Showcase your work, skills, and experience</span>
            </li>
            <li>
              <strong>Submit projects</strong>
              <span>Bring your ambitious ideas to the network</span>
            </li>
            <li>
              <strong>Find collaborators</strong>
              <span>Connect with engineers, fabricators, designers, and more</span>
            </li>
            <li>
              <strong>Get discovered</strong>
              <span>Project teams and curators can find you</span>
            </li>
          </ul>
          <p style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-6)' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--color-primary)' }}>Sign in</Link>
          </p>
        </div>
      </section>
    </>
  )
}
