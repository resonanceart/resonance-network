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

  return (
    <>
      <section className="join-hero">
        <div className="container">
          <p className="section-label">Get Involved</p>
          <h1>{user ? 'Your Network' : 'Join Resonance Network'}</h1>
          <p className="join-hero__sub">
            {user
              ? 'You\u2019re part of the network. Here\u2019s what you can do next.'
              : 'Whether you\u2019re bringing a project or offering your expertise, there\u2019s a place for you here.'}
          </p>
        </div>
      </section>

      <section className="join-paths">
        <div className="container">
          <div className="join-cards">
            {/* Card 1: Submit a Project */}
            <div className="join-card join-card--project">
              <div className="join-card__icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="7" height="7" rx="1"/>
                  <rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/>
                  <rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
              </div>
              <h2>Submit a Project</h2>
              <p className="join-card__desc">You have an ambitious creative project — and you need collaborators, expertise, or pathways to make it real.</p>
              <p className="join-card__outcome">
                {user
                  ? 'Submit your project from your dashboard and start finding collaborators.'
                  : 'Create your free profile, then submit your project — all in one flow.'}
              </p>
              <ul className="join-card__benefits">
                <li>Project page with gallery and overview</li>
                <li>Artist profile on the network</li>
                <li>Collaboration board listing for open roles</li>
                <li>Visibility to funders and curators</li>
              </ul>
              <Link
                href={user ? '/dashboard/projects/new' : '/login?tab=signup&redirect=/dashboard/welcome'}
                className="btn btn--primary btn--large join-card__cta"
              >
                {user ? 'Submit a Project' : 'Get Started'} &rarr;
              </Link>
            </div>

            {/* Card 2: Join as Collaborator */}
            <div className="join-card join-card--collaborator">
              <div className="join-card__icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <h2>{user ? 'Edit Your Profile' : 'Join as Collaborator'}</h2>
              <p className="join-card__desc">
                {user
                  ? 'Update your collaborator profile so project teams can find you.'
                  : 'You\u2019re an engineer, fabricator, designer, grant writer, or specialist looking for meaningful projects that match your skills and values.'}
              </p>
              <p className="join-card__outcome">
                {user
                  ? 'Keep your profile current with your latest skills and availability.'
                  : 'Create your free profile so project teams can discover you and reach out.'}
              </p>
              <ul className="join-card__benefits">
                <li>Collaborator profile on the network</li>
                <li>Access to open roles on curated projects</li>
                <li>Direct connection to project teams</li>
                <li>Skill-matched project alerts</li>
              </ul>
              <Link
                href={user ? '/dashboard/profile' : '/login?tab=signup&redirect=/dashboard/welcome'}
                className="btn btn--primary btn--large join-card__cta"
              >
                {user ? 'Edit Your Profile' : 'Get Started'} &rarr;
              </Link>
            </div>
          </div>

          {/* Logged-in extras */}
          {user && (
            <div style={{ textAlign: 'center', marginTop: 'var(--space-8)' }}>
              <Link href="/collaborate" className="btn btn--outline" style={{ marginRight: 'var(--space-3)' }}>
                Browse Open Roles
              </Link>
              <Link href="/dashboard" className="btn btn--outline">
                Go to Dashboard
              </Link>
            </div>
          )}

          {/* Sign-in link for anonymous users */}
          {!user && (
            <p style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-6)' }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: 'var(--color-primary)' }}>Sign in</Link>
            </p>
          )}
        </div>
      </section>
    </>
  )
}
