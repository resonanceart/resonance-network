import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About | An Artist-Led Platform for Ambitious Creative Work',
  description: 'Built by artists, for artists. Resonance Network is a curated platform where ambitious creative projects find the people and pathways to get built.',
  alternates: {
    canonical: 'https://resonancenetwork.org/about',
  },
  openGraph: {
    title: 'About Resonance Network | Art Collaboration Platform',
    description: 'An artist-led collaboration platform connecting creators of ambitious projects with the expertise to make them real.',
    url: 'https://resonancenetwork.org/about',
    type: 'website',
    images: [{ url: '/og-image.jpg' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Resonance Network | Art Collaboration Platform',
    description: 'An artist-led platform connecting creators of ambitious projects with the collaborators to make them real.',
    images: [{ url: '/og-image.jpg' }],
  },
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://resonancenetwork.org' },
    { '@type': 'ListItem', position: 2, name: 'About', item: 'https://resonancenetwork.org/about' },
  ],
}

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Hero — headline + mission/vision all above the fold */}
      <section className="about-hero about-hero--immersive">
        <div className="container">
          <h1 className="about-hero__headline about-hero__headline--full">Built by artists. For artists.</h1>

          <div className="mission-vision-grid mission-vision-grid--hero">
            <div className="mission-vision-block">
              <h2 className="mission-vision__label mission-vision__label--bold">Mission</h2>
              <p className="mission-vision__text mission-vision__text--hero">
                Resonance Network connects artists, technologists, and cultural builders exploring how immersive architecture and regenerative design can transform collective awareness. We cultivate collaboration across disciplines to develop works that deepen our relationship to nature, community, and the living systems we inhabit.
              </p>
            </div>
            <div className="mission-vision-block">
              <h2 className="mission-vision__label mission-vision__label--bold">Vision</h2>
              <p className="mission-vision__text mission-vision__text--hero">
                We envision a world where immersive public art and regenerative design form the cultural infrastructure of the future, fostering shared ritual, ecological stewardship, and creative solidarity across borders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values & Evaluation Framework — combined, single section */}
      <section className="about-section" id="values">
        <div className="container">
          <p className="section-label">Core Values &amp; Evaluation</p>
          <h2>What Guides Us</h2>
          <p className="about-section__intro">These eight values guide everything we do, from how we collaborate to how we evaluate projects for the network.</p>
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

          {/* Fit Levels */}
          <div style={{ marginTop: 'var(--space-10)' }}>
            <h3 style={{ marginBottom: 'var(--space-4)', textAlign: 'center' }}>Fit Levels</h3>
            <p className="about-section__intro">Projects don&apos;t need to score perfectly across all domains. We look for meaningful alignment in the areas most relevant to the work.</p>
            <div className="eval-fit-grid">
              <div className="eval-fit-card">
                <span className="eval-fit-card__icon" aria-hidden="true">&#9673;</span>
                <strong>Core-Fit</strong>
                <p>Strong alignment in 2&ndash;3 domains. The project has a clear center of gravity and genuine potential. Accepted with guidance on strengthening weaker areas.</p>
              </div>
              <div className="eval-fit-card">
                <span className="eval-fit-card__icon eval-fit-card__icon--petal" aria-hidden="true">&#9673;&#9673;</span>
                <strong>Petal-Fit</strong>
                <p>Alignment across 4&ndash;5 domains. Well-rounded project with broad resonance. Full network support and active collaboration matching.</p>
              </div>
              <div className="eval-fit-card">
                <span className="eval-fit-card__icon eval-fit-card__icon--full" aria-hidden="true">&#9673;&#9673;&#9673;</span>
                <strong>Full-Bloom</strong>
                <p>Deep alignment across 6+ domains. Rare, exceptional projects that embody the network&apos;s values. Priority placement and flagship support.</p>
              </div>
            </div>
            <blockquote className="about-pullquote about-pullquote--centered" style={{ marginTop: 'var(--space-6)' }}>
              <p>The message is never &quot;no.&quot; It is <em>&quot;not yet, and here&apos;s how to come back.&quot;</em></p>
            </blockquote>

            {/* Full Scorecard CTA */}
            <div style={{ marginTop: 'var(--space-8)', textAlign: 'center' }}>
              <a
                href="/assets/resonance-evaluation-framework.pdf"
                target="_blank"
                rel="noopener noreferrer"
                download
                className="btn btn--primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="12" y1="18" x2="12" y2="12"/>
                  <polyline points="9 15 12 18 15 15"/>
                </svg>
                Download Full Scorecard
              </a>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
                PDF with 8 value domains, scoring criteria, and fit-level definitions
              </p>
            </div>
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
              Visionary spatial projects like immersive installations, regenerative pavilions, ecological environments rarely fail because the vision isn&apos;t strong enough. They stall because creators are isolated from the collaborators, technical expertise, and funding pathways they need. Resonance Network exists to close that gap.
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

      {/* How Curation Works — 3 steps with descriptions */}
      <section className="about-section about-section--alt" id="process">
        <div className="container">
          <p className="section-label">Process</p>
          <h2>How Curation Works</h2>
          <div className="curation-cards">
            <div className="curation-card">
              <span className="curation-card__number">1</span>
              <h3>Submission</h3>
              <p>Creators submit their project through our intake form, including images, descriptions, classification, and collaboration needs.</p>
            </div>
            <div className="curation-card">
              <span className="curation-card__number">2</span>
              <h3>Review</h3>
              <p>A curation team of practicing artists and makers reviews every project for values alignment and readiness. Human approval is always required.</p>
            </div>
            <div className="curation-card">
              <span className="curation-card__number">3</span>
              <h3>Publish or Guide</h3>
              <p>Approved projects are published to the network. Projects not yet ready receive clear, actionable feedback with an invitation to resubmit.</p>
            </div>
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
