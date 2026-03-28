import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About — An Artist-Led Platform for Ambitious Creative Work',
  description: 'Built by artists, for artists. Resonance Network is a curated platform where ambitious creative projects find the people and pathways to get built.',
  alternates: {
    canonical: 'https://resonance.network/about',
  },
  openGraph: {
    title: 'About Resonance Network — Art Collaboration Platform',
    description: 'An artist-led collaboration platform connecting creators of ambitious projects with the expertise to make them real.',
    url: 'https://resonance.network/about',
    type: 'website',
    images: [{ url: '/og-image.jpg' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Resonance Network — Art Collaboration Platform',
    description: 'An artist-led platform connecting creators of ambitious projects with the collaborators to make them real.',
    images: [{ url: '/og-image.jpg' }],
  },
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://resonance.network' },
    { '@type': 'ListItem', position: 2, name: 'About', item: 'https://resonance.network/about' },
  ],
}

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Hero — clean, no breadcrumb, no sub-text */}
      <section className="about-hero about-hero--immersive">
        <div className="container">
          <h1 className="about-hero__headline">Built by artists. For artists.</h1>
        </div>
      </section>

      {/* Mission & Vision — bigger, more impactful */}
      <section className="about-section about-section--alt">
        <div className="container">
          <div className="mission-vision-grid mission-vision-grid--large">
            <div>
              <p className="mission-vision__label">Mission</p>
              <p className="mission-vision__text">
                Resonance Network connects artists, technologists, and cultural builders exploring how immersive architecture and regenerative design can transform collective awareness. We cultivate collaboration across disciplines to develop works that deepen our relationship to nature, community, and the living systems we inhabit.
              </p>
            </div>
            <div>
              <p className="mission-vision__label">Vision</p>
              <p className="mission-vision__text">
                We envision a world where immersive public art and regenerative design form the cultural infrastructure of the future — fostering shared ritual, ecological stewardship, and creative solidarity across borders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values — titles only, no descriptions */}
      <section className="about-section" id="values">
        <div className="container">
          <p className="section-label">Core Values</p>
          <h2>What Guides Us</h2>
          <div className="values-grid values-grid--compact">
            <div className="value-card value-card--title-only value-card--accent-1"><h3>Resonance</h3></div>
            <div className="value-card value-card--title-only value-card--accent-2"><h3>Inspiration</h3></div>
            <div className="value-card value-card--title-only value-card--accent-3"><h3>Participation</h3></div>
            <div className="value-card value-card--title-only value-card--accent-4"><h3>Transparency</h3></div>
            <div className="value-card value-card--title-only value-card--accent-5"><h3>Regeneration</h3></div>
            <div className="value-card value-card--title-only value-card--accent-6"><h3>Inclusivity</h3></div>
            <div className="value-card value-card--title-only value-card--accent-7"><h3>Originality</h3></div>
            <div className="value-card value-card--title-only value-card--accent-8"><h3>Stewardship</h3></div>
          </div>
        </div>
      </section>

      {/* The Gap We Close */}
      <section className="about-section about-section--alt">
        <div className="container">
          <div className="about-gap">
            <p className="section-label">Purpose</p>
            <h2>The Gap We Close</h2>
            <p className="about-gap__text">
              Visionary spatial projects — immersive installations, regenerative pavilions, ecological environments — rarely fail because the vision isn&apos;t strong enough. They stall because creators are isolated from the collaborators, technical expertise, and funding pathways they need. Resonance Network exists to close that gap.
            </p>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="about-section">
        <div className="container">
          <p className="section-label">Community</p>
          <h2>Who This Is For</h2>
          <div className="audience-grid">
            <div className="audience-card">
              <div className="audience-card__icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M5 20c0-4 3.5-7 7-7s7 3 7 7"/></svg>
              </div>
              <h3>Creators</h3>
              <p>Artists, architects, designers, and interdisciplinary creators with substantive projects beyond the idea stage.</p>
            </div>
            <div className="audience-card">
              <div className="audience-card__icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
              </div>
              <h3>Collaborators &amp; Experts</h3>
              <p>Engineers, fabricators, producers, and specialists seeking meaningful, values-aligned projects.</p>
            </div>
            <div className="audience-card">
              <div className="audience-card__icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              </div>
              <h3>Curators, Venues &amp; Funders</h3>
              <p>Museum curators, festival programmers, and foundations seeking vetted, build-ready projects.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How Curation Works — 3 steps, compact, no descriptions */}
      <section className="about-section about-section--alt" id="process">
        <div className="container">
          <p className="section-label">Process</p>
          <h2>How Curation Works</h2>
          <div className="curation-steps-compact">
            <div className="curation-step-compact">
              <span className="curation-step-compact__number">1</span>
              <h3>Submission</h3>
            </div>
            <div className="curation-step-compact__arrow" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
            </div>
            <div className="curation-step-compact">
              <span className="curation-step-compact__number">2</span>
              <h3>Review</h3>
            </div>
            <div className="curation-step-compact__arrow" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
            </div>
            <div className="curation-step-compact">
              <span className="curation-step-compact__number">3</span>
              <h3>Publish or Guide</h3>
            </div>
          </div>
        </div>
      </section>

      {/* How We Evaluate — domains only, no questions, no fit levels */}
      <section className="about-section" id="evaluation">
        <div className="container">
          <p className="section-label">Evaluation</p>
          <h2>How We Evaluate Projects</h2>
          <div className="eval-domains-grid eval-domains-grid--compact">
            <div className="eval-domain eval-domain--accent-1"><strong>Resonance</strong></div>
            <div className="eval-domain eval-domain--accent-2"><strong>Inspiration</strong></div>
            <div className="eval-domain eval-domain--accent-3"><strong>Participation</strong></div>
            <div className="eval-domain eval-domain--accent-4"><strong>Transparency</strong></div>
            <div className="eval-domain eval-domain--accent-5"><strong>Regeneration</strong></div>
            <div className="eval-domain eval-domain--accent-6"><strong>Inclusivity</strong></div>
            <div className="eval-domain eval-domain--accent-7"><strong>Originality</strong></div>
            <div className="eval-domain eval-domain--accent-8"><strong>Stewardship</strong></div>
          </div>
        </div>
      </section>

      {/* CTA — centered */}
      <section className="about-cta about-cta--centered">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2>Carrying something ambitious?</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>You don&apos;t have to build it alone.</p>
          <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/dashboard/projects/live-edit" className="btn btn--primary btn--large">
              Submit Your Project
            </Link>
            <Link href="/collaborate" className="btn btn--outline btn--large">
              Explore Open Roles
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
