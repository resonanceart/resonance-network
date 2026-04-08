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
          <div className="join-cards join-cards--two-up">
            {/* Card 1: Artist */}
            <div className="join-card join-card--featured">
              <div className="join-card__header">
                <span className="join-card__emoji">🎨</span>
                <h2>Share a Project</h2>
                <p className="join-card__tagline">
                  You lead creative work and need collaborators to bring it to life.
                </p>
              </div>
              <ul className="join-card__perks">
                <li>Curated project page with gallery</li>
                <li>Find engineers, fabricators, and producers</li>
                <li>Visibility to funders and curators</li>
              </ul>
              <Link
                href={user ? '/dashboard/projects/new' : '/login?tab=signup&redirect=/dashboard/welcome'}
                className="btn btn--primary btn--xl join-card__cta"
              >
                {user ? 'Share a Project' : 'Get Started — Free'}
              </Link>
            </div>

            {/* Card 2: Collaborator */}
            <div className="join-card join-card--featured">
              <div className="join-card__header">
                <span className="join-card__emoji">🛠</span>
                <h2>Join as Collaborator</h2>
                <p className="join-card__tagline">
                  You have skills and want to contribute to ambitious, values-aligned projects.
                </p>
              </div>
              <ul className="join-card__perks">
                <li>Browse curated projects seeking your expertise</li>
                <li>Credited roles linked to your profile</li>
                <li>Meaningful work, not commercial gigs</li>
              </ul>
              <Link
                href={user ? '/dashboard/profile' : '/login?tab=signup&redirect=/dashboard/welcome'}
                className="btn btn--primary btn--xl join-card__cta"
              >
                {user ? 'Edit Your Profile' : 'Get Started — Free'}
              </Link>
            </div>
          </div>

          {/* Curator — secondary, smaller */}
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
