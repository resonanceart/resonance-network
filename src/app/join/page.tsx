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
          <p className="section-label">Join the Network</p>
          <h1>{user ? 'Your Network' : 'Join Resonance Network'}</h1>
          <p className="join-hero__sub">
            {user
              ? 'You\u2019re part of the network. Here\u2019s what you can do next.'
              : 'Whether you\u2019re sharing a visionary project or lending your expertise \u2014 import from your existing website in seconds, or start fresh.'}
          </p>
        </div>
      </section>

      <section className="join-paths">
        <div className="container">
          <div className="join-cards join-cards--two-up">

            {/* Card 1: Share a Project (Teal) */}
            <div className="join-card join-card--teal">
              <div className="join-card__icon join-card__icon--teal">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
              <span className="join-card__label join-card__label--teal">I have a project</span>
              <h2>Share Your Project</h2>
              <p className="join-card__desc">
                Import your project from any website &mdash; we&apos;ll build your curated page automatically. Everything is editable before publishing.
              </p>
              <ul className="join-card__perks">
                <li>Curated project page with gallery</li>
                <li>Find engineers, fabricators, and producers</li>
                <li>Visibility to funders and curators</li>
              </ul>
              <div className="join-card__cta-area">
                <Link
                  href={user ? '/dashboard/projects/new' : '/import'}
                  className="btn btn--teal btn--xl join-card__cta"
                >
                  {user ? 'Share a Project' : 'Import Your Project'}
                </Link>
                {!user && (
                  <span className="join-card__secondary">
                    Or <Link href="/login?tab=signup&redirect=/dashboard/welcome">build from scratch</Link>
                  </span>
                )}
              </div>
            </div>

            {/* Card 2: Join as Collaborator (Gold) */}
            <div className="join-card join-card--gold">
              <div className="join-card__icon join-card__icon--gold">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <span className="join-card__label join-card__label--gold">I want to collaborate</span>
              <h2>Join as Collaborator</h2>
              <p className="join-card__desc">
                Import your portfolio and join a curated community of architects, engineers, fabricators, and producers seeking meaningful creative work.
              </p>
              <ul className="join-card__perks">
                <li>Browse curated projects seeking your expertise</li>
                <li>Credited roles linked to your profile</li>
                <li>Meaningful work, not commercial gigs</li>
              </ul>
              <div className="join-card__cta-area">
                <Link
                  href={user ? '/dashboard/profile/live-edit' : '/import?mode=profile'}
                  className="btn btn--gold btn--xl join-card__cta"
                >
                  {user ? 'Edit Your Profile' : 'Import Your Portfolio'}
                </Link>
                {!user && (
                  <span className="join-card__secondary">
                    Or <Link href="/login?tab=signup&redirect=/dashboard/welcome">create a profile manually</Link>
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* Curator — secondary row */}
          <div className="join-curator-row">
            <div className="join-curator-card">
              <span className="join-card__emoji">📖</span>
              <div>
                <h3>Join as Curator</h3>
                <p>Review projects, shape curatorial direction, and champion emerging spatial work.</p>
              </div>
              <Link
                href={user ? '/dashboard' : '/login?tab=signup&redirect=/dashboard/welcome'}
                className="btn btn--outline btn--large"
              >
                {user ? 'Go to Dashboard' : 'Get Started'}
              </Link>
            </div>
          </div>

          {!user && (
            <p style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-6)' }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: 'var(--color-primary)' }}>Sign in</Link>
            </p>
          )}
        </div>
      </section>

      {/* What You Get */}
      <section className="submit-section">
        <div className="container">
          <h2>What You Get</h2>
          <div className="join-benefits__grid">
            <div className="join-benefit-card">
              <h3>Curated Project Page</h3>
              <p>A professional, visual home for your work (gallery, team, collaboration board) that you can share with funders, venues, and partners.</p>
            </div>
            <div className="join-benefit-card">
              <h3>Collaboration Matching</h3>
              <p>Your project is visible to a curated community of engineers, fabricators, producers, and specialists actively seeking meaningful work.</p>
            </div>
            <div className="join-benefit-card">
              <h3>Curator Feedback</h3>
              <p>Every project receives a personal review from practicing artists and makers. Honest, specific, and designed to help your work succeed.</p>
            </div>
            <div className="join-benefit-card">
              <h3>Community &amp; Resources</h3>
              <p>Access a growing network of creators, experts, and cultural builders working at the intersection of art, architecture, and ecology.</p>
            </div>
            <div className="join-benefit-card">
              <h3>Credibility Signal</h3>
              <p>Being on Resonance Network tells funders and venues that your project has been reviewed and meets a standard of rigor and values alignment.</p>
            </div>
            <div className="join-benefit-card">
              <h3>No Algorithms</h3>
              <p>No feeds, no follower counts, no engagement metrics. This is a working space where projects are discovered on merit, not popularity.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="submit-section" id="faq">
        <div className="container">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-list">
            <div className="faq-item">
              <h3>What happens after I share my project?</h3>
              <p>Our curation team reviews every project personally and will respond soon after receiving your submission. You&apos;ll hear from us either way.</p>
            </div>
            <div className="faq-item">
              <h3>What if my project gets rejected?</h3>
              <p>You&apos;ll get personal feedback and an open invitation to resubmit. The answer is never &quot;no.&quot; It&apos;s &quot;not yet.&quot;</p>
            </div>
            <div className="faq-item">
              <h3>Is there a fee?</h3>
              <p>No. Resonance Network is free for creators and collaborators.</p>
            </div>
            <div className="faq-item">
              <h3>What happens after approval?</h3>
              <p>We&apos;ll build your project page, a curated visual home for your work, and list your collaboration needs on the network.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
