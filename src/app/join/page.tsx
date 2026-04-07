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
              : 'Artists, curators, and collaborators building at the intersection of art, architecture, and ecology.'}
          </p>
        </div>
      </section>

      <section className="join-paths">
        <div className="container">
          <div className="join-cards">
            {/* Card 1: Artist */}
            <div className="join-card join-card--project">
              <div className="join-card__icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="7" height="7" rx="1"/>
                  <rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/>
                  <rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
              </div>
              <h2>{user ? 'Share a Project' : 'Join as Artist'}</h2>
              <p className="join-card__desc">I create and lead projects — installations, pavilions, environments, or public works — and need the right people to help build them.</p>
              <p className="join-card__outcome">
                {user
                  ? 'Share your project from your dashboard and start finding collaborators.'
                  : 'Create your free profile, share your project, and find collaborators — all in one flow.'}
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
                {user ? 'Share a Project' : 'Get Started'} &rarr;
              </Link>
            </div>

            {/* Card 2: Collaborator */}
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
                  ? 'Update your profile so project teams can find you.'
                  : 'I contribute skills to projects — engineering, fabrication, design, production, or specialized expertise for work that actually matters.'}
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

            {/* Card 3: Curator */}
            <div className="join-card join-card--collaborator">
              <div className="join-card__icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
              </div>
              <h2>{user ? 'Curate Projects' : 'Join as Curator'}</h2>
              <p className="join-card__desc">
                {user
                  ? 'Review, organize, and present work on the network.'
                  : 'I organize and present work — selecting, contextualizing, and championing projects that push boundaries.'}
              </p>
              <p className="join-card__outcome">
                {user
                  ? 'Access the curation pipeline and help shape what the network highlights.'
                  : 'Join a community of curators shaping the future of spatial art and architecture.'}
              </p>
              <ul className="join-card__benefits">
                <li>Review and provide feedback on submitted projects</li>
                <li>Help shape the network&apos;s curatorial direction</li>
                <li>Connect with artists and collaborators working on ambitious projects</li>
                <li>Build your curatorial portfolio with emerging spatial work</li>
              </ul>
              <Link
                href={user ? '/dashboard' : '/login?tab=signup&redirect=/dashboard/welcome'}
                className="btn btn--primary btn--large join-card__cta"
              >
                {user ? 'Go to Dashboard' : 'Get Started'} &rarr;
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

      {/* What You Get */}
      <section className="submit-section">
        <div className="container">
          <h2>What You Get</h2>
          <div className="join-benefits__grid">
            <div className="join-benefit-card">
              <h3>Curated Project Page</h3>
              <p>A professional, visual home for your work — gallery, team, collaboration board — that you can share with funders, venues, and partners.</p>
            </div>
            <div className="join-benefit-card">
              <h3>Collaboration Matching</h3>
              <p>Your project is visible to a curated community of engineers, fabricators, producers, and specialists actively seeking meaningful work.</p>
            </div>
            <div className="join-benefit-card">
              <h3>Curator Feedback</h3>
              <p>Every project receives a personal review from practicing artists and makers — honest, specific, and designed to help your work succeed.</p>
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

      {/* Submission Info — visible to everyone */}
      <section className="submit-section">
        <div className="container">
          <h2>Before You Share a Project</h2>
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
              <h3>What happens after I share my project?</h3>
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
              <strong>Share your project</strong>
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
