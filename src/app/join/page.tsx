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
              <p className="join-card__desc">You have a concept-ready spatial project — an installation, pavilion, environment, or public work — and you need the right people to help build it.</p>
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
                  : 'You\u2019re an engineer, fabricator, designer, producer, or specialist who wants to work on projects that actually matter \u2014 regenerative, values-aligned, and concept-ready.'}
              </p>
              <p className="join-card__outcome">
                {user
                  ? 'Keep your profile current with your latest skills and availability.'
                  : 'Create your free profile so project teams can discover you and reach out.'}
              </p>
              <ul className="join-card__benefits">
                <li>Access a curated pipeline of serious projects ready for your expertise</li>
                <li>Work on regenerative, values-aligned installations — not commercial campaigns</li>
                <li>Build long-term relationships with visionary creators, not one-off transactions</li>
                <li>Your skills are treated as central to the work, not accessory</li>
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

      {/* Submission Info — visible to everyone */}
      <section className="submit-section">
        <div className="container">
          <h2>Before You Submit a Project</h2>
          <p className="submit-section__intro">Gather these materials so your project can shine:</p>
          <ul className="prepare-list">
            <li>
              <strong>Lead artist information</strong>
              <span>Name, bio, portfolio or website link</span>
            </li>
            <li>
              <strong>Project details</strong>
              <span>Title, short description (2&ndash;3 sentences), and full project story/narrative</span>
            </li>
            <li>
              <strong>Classification</strong>
              <span>Project domains (what it is), pathways (how it may be realized), and current stage</span>
            </li>
            <li>
              <strong>Images and renders</strong>
              <span>Hero image plus 3&ndash;5 gallery images showing the project concept, materials, or models</span>
            </li>
            <li>
              <strong>Collaboration needs</strong>
              <span>Specific roles or expertise your project is seeking</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="submit-section" id="faq">
        <div className="container">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-list">
            <div className="faq-item">
              <h3>What happens after I submit?</h3>
              <p>Our curation team reviews every project personally within two weeks. You&apos;ll hear from us either way.</p>
            </div>
            <div className="faq-item">
              <h3>What if my project gets rejected?</h3>
              <p>You&apos;ll get personal feedback and an open invitation to resubmit. The answer is never &quot;no&quot; — it&apos;s &quot;not yet.&quot;</p>
            </div>
            <div className="faq-item">
              <h3>Is there a fee?</h3>
              <p>No. Resonance Network is free for creators and collaborators.</p>
            </div>
            <div className="faq-item">
              <h3>What happens after approval?</h3>
              <p>We&apos;ll build your project page — a curated, visual home for your work — and list your collaboration needs on the network.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Who Can Submit */}
      <section className="submit-section">
        <div className="container">
          <h2>Who Can Submit</h2>
          <p>Resonance Network is for creators working on concept-ready spatial projects — immersive installations, regenerative architecture, public works, and experiential environments. We evaluate on scope and stewardship, not size. You are a good fit if:</p>
          <ul className="prepare-list">
            <li>
              <strong>Concept-ready spatial project</strong>
              <span>Your work is an installation, pavilion, environment, or public work with a clear vision and direction</span>
            </li>
            <li>
              <strong>Immersive or regenerative</strong>
              <span>Your project engages with ecological systems, material innovation, or experiential design</span>
            </li>
            <li>
              <strong>Collaboration-ready</strong>
              <span>You need aligned collaborators, technical expertise, or funding pathways to move forward</span>
            </li>
            <li>
              <strong>Open to curation</strong>
              <span>You welcome honest feedback and a curatorial process — &quot;not yet&quot; isn&apos;t a no</span>
            </li>
          </ul>
        </div>
      </section>

      {/* What Happens Next */}
      <section className="submit-section">
        <div className="container">
          <h2>What Happens Next</h2>
          <ol className="prepare-list">
            <li>
              <strong>Create your profile</strong>
              <span>Name, photo, bio, skills</span>
            </li>
            <li>
              <strong>Submit your project</strong>
              <span>Vision, images, collaboration needs</span>
            </li>
            <li>
              <strong>Our team reviews</strong>
              <span>Every project is reviewed personally within two weeks</span>
            </li>
            <li>
              <strong>Accepted projects</strong>
              <span>Get a public page, collaboration board listing, and visibility to the network</span>
            </li>
            <li>
              <strong>Even if redirected</strong>
              <span>You receive constructive feedback and an open invitation to resubmit</span>
            </li>
          </ol>
        </div>
      </section>
    </>
  )
}
