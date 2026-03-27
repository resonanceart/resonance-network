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

      {/* Hero */}
      <section className="about-hero">
        <div className="container">
          <nav aria-label="Breadcrumb" className="breadcrumb">
            <Link href="/">Home</Link> <span aria-hidden="true">/</span> <span>About</span>
          </nav>
          <p className="section-label">About Resonance Network</p>
          <h1 className="about-hero__headline">Built by artists. For artists.</h1>
          <p className="about-hero__sub">Resonance Network connects artists, technologists, and cultural builders exploring how immersive architecture and regenerative design can transform collective awareness.</p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="about-section about-section--alt">
        <div className="container">
          <div className="mission-vision-grid">
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

      {/* Core Values */}
      <section className="about-section" id="values">
        <div className="container">
          <p className="section-label">Core Values</p>
          <h2>What Guides Us</h2>
          <div className="values-grid">
            <div className="value-card value-card--accent-1">
              <h3>Resonance</h3>
              <p>We create experiences that evoke harmony between people, place, and planet — cultivating emotional, spatial, and ecological coherence.</p>
            </div>
            <div className="value-card value-card--accent-2">
              <h3>Inspiration</h3>
              <p>We pursue beauty, wonder, and transformation as essential forces for cultural renewal. Our works aim to awaken curiosity and reconnect people to the sacred vitality of life.</p>
            </div>
            <div className="value-card value-card--accent-3">
              <h3>Participation</h3>
              <p>We invite the public into co-creation — transforming art, architecture, and technology into shared rituals of discovery, play, and presence.</p>
            </div>
            <div className="value-card value-card--accent-4">
              <h3>Transparency</h3>
              <p>We are clear and honest about processes, constraints, and needs — making project realities visible so collaborators and supporters can engage with trust and informed choice.</p>
            </div>
            <div className="value-card value-card--accent-5">
              <h3>Regeneration</h3>
              <p>We design for ecological balance and reciprocity, ensuring each structure, system, and collaboration contributes back to the living world.</p>
            </div>
            <div className="value-card value-card--accent-6">
              <h3>Inclusivity</h3>
              <p>We uplift diverse voices, cultures, and perspectives — creating open frameworks where creativity thrives through shared access and mutual respect.</p>
            </div>
            <div className="value-card value-card--accent-7">
              <h3>Originality</h3>
              <p>We embrace innovation, curiosity, and risk-taking to expand the forms and languages of immersive art, architecture, and intelligent design.</p>
            </div>
            <div className="value-card value-card--accent-8">
              <h3>Stewardship</h3>
              <p>We nurture long-term care for the environments, relationships, and technologies we cultivate — recognizing creation as an ongoing act of responsibility and love.</p>
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
              Resonance Network helps ambitious creative projects cross the gap from concept to buildable reality. We curate aligned projects, offer transparent feedback, and connect creators with the expertise, collaborators, and funding pathways they need — so the work gets built without creators sacrificing their financial or emotional well-being.
            </p>
            <blockquote className="about-pullquote about-pullquote--centered">
              <p>Resonance Network should feel like a deep exhale. Creators who arrive here have already done enormous work. What they need isn&apos;t validation — it&apos;s knowing they don&apos;t have to do it alone.</p>
            </blockquote>
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
              <p>Artists, architects, designers, and interdisciplinary creators with substantive projects beyond the idea stage — large-scale installations, public art, interactive environments, and regenerative buildings.</p>
            </div>
            <div className="audience-card">
              <div className="audience-card__icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
              </div>
              <h3>Collaborators &amp; Experts</h3>
              <p>Engineers, fabricators, producers, technologists, and sustainability consultants who care about the work — professionals seeking meaningful, values-aligned projects.</p>
            </div>
            <div className="audience-card">
              <div className="audience-card__icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              </div>
              <h3>Curators, Venues &amp; Funders</h3>
              <p>Museum curators, festival programmers, public art commissioners, foundations, and donors seeking vetted, build-ready projects at the intersection of art and ecology.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How Curation Works */}
      <section className="about-section about-section--alt" id="process">
        <div className="container">
          <p className="section-label">Process</p>
          <h2>How Curation Works</h2>
          <p className="about-section__intro">Every project is reviewed for values alignment and readiness to engage.</p>
          <div className="curation-timeline">
            <div className="curation-timeline__step">
              <div className="curation-timeline__marker">
                <span className="step-number">1</span>
                <span className="curation-timeline__line" />
              </div>
              <div className="step-content">
                <h3>Submission</h3>
                <p>Creators submit their project through our intake form, including images, descriptions, classification, and collaboration needs.</p>
              </div>
            </div>
            <div className="curation-timeline__step">
              <div className="curation-timeline__marker">
                <span className="step-number">2</span>
                <span className="curation-timeline__line" />
              </div>
              <div className="step-content">
                <h3>AI-Assisted Review</h3>
                <p>Submissions receive an initial review for completeness, alignment with network values, and project stage readiness.</p>
              </div>
            </div>
            <div className="curation-timeline__step">
              <div className="curation-timeline__marker">
                <span className="step-number">3</span>
                <span className="curation-timeline__line" />
              </div>
              <div className="step-content">
                <h3>Human Review</h3>
                <p>A curation team of practicing artists and makers reviews every project. Human approval is required — AI assists but never decides.</p>
              </div>
            </div>
            <div className="curation-timeline__step">
              <div className="curation-timeline__marker">
                <span className="step-number">4</span>
              </div>
              <div className="step-content">
                <h3>Publish or Guide</h3>
                <p>Approved projects are published to the network. Projects not yet ready receive clear, actionable feedback — with an explicit invitation to resubmit.</p>
              </div>
            </div>
          </div>
          <blockquote className="about-pullquote about-pullquote--centered">
            <p>The message is never &quot;no.&quot; It is <em>&quot;not yet — and here&apos;s how to come back.&quot;</em></p>
          </blockquote>
        </div>
      </section>

      {/* How We Evaluate Projects */}
      <section className="about-section" id="evaluation">
        <div className="container">
          <p className="section-label">Evaluation</p>
          <h2>How We Evaluate Projects</h2>
          <p className="about-section__intro">Every submission is assessed across eight value domains that reflect our mission. This isn&apos;t a checklist — it&apos;s a lens for understanding how a project resonates with the network&apos;s purpose.</p>

          <h3 style={{ marginTop: 'var(--space-6)', marginBottom: 'var(--space-4)' }}>The Eight Value Domains</h3>
          <div className="eval-domains-grid">
            <div className="eval-domain eval-domain--accent-1">
              <strong>Resonance</strong>
              <p>Does the project evoke harmony between people, place, and planet?</p>
            </div>
            <div className="eval-domain eval-domain--accent-2">
              <strong>Inspiration</strong>
              <p>Does it awaken curiosity, beauty, or a sense of wonder?</p>
            </div>
            <div className="eval-domain eval-domain--accent-3">
              <strong>Participation</strong>
              <p>Does it invite the public into co-creation or shared experience?</p>
            </div>
            <div className="eval-domain eval-domain--accent-4">
              <strong>Transparency</strong>
              <p>Are goals, needs, and constraints communicated honestly?</p>
            </div>
            <div className="eval-domain eval-domain--accent-5">
              <strong>Regeneration</strong>
              <p>Does it design for ecological balance and reciprocity?</p>
            </div>
            <div className="eval-domain eval-domain--accent-6">
              <strong>Inclusivity</strong>
              <p>Does it uplift diverse voices and create open access?</p>
            </div>
            <div className="eval-domain eval-domain--accent-7">
              <strong>Originality</strong>
              <p>Does it push boundaries in form, material, or concept?</p>
            </div>
            <div className="eval-domain eval-domain--accent-8">
              <strong>Stewardship</strong>
              <p>Does it demonstrate long-term care for its environment and community?</p>
            </div>
          </div>

          <h3 style={{ marginTop: 'var(--space-8)', marginBottom: 'var(--space-4)' }}>Fit Levels</h3>
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
              <p>Strong alignment in 4&ndash;5 domains. The project demonstrates breadth and depth — a solid candidate for featured placement and active collaboration matching.</p>
            </div>
            <div className="eval-fit-card">
              <span className="eval-fit-card__icon eval-fit-card__icon--full" aria-hidden="true">&#9673;&#9673;&#9673;</span>
              <strong>Full-Fit</strong>
              <p>Strong alignment across 6+ domains. Exceptional projects that embody the network&apos;s values. Prioritized for spotlight features, partnerships, and funding introductions.</p>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 'var(--space-8)' }}>
            <a href="/assets/resonance-evaluation-framework.pdf" target="_blank" className="btn btn--outline">
              Download Full Evaluation Framework (PDF)
            </a>
          </div>
        </div>
      </section>

      {/* By Artists, For Artists */}
      <section className="about-section">
        <div className="container">
          <div className="about-gap">
            <p className="section-label">Governance</p>
            <h2>By Artists, For Artists</h2>
            <p className="about-gap__text">
              This isn&apos;t just a tagline — it&apos;s how we&apos;re built. Resonance Network is created and stewarded by practicing artists and makers who know firsthand how hard it is to carry a large, interdisciplinary project.
            </p>
            <p className="about-gap__text">
              The founding team has lived the challenges — budget overruns, isolation, the search for expertise that&apos;s hard to find. That experience shapes every decision we make, from curation criteria to how we give feedback.
            </p>
            <p className="about-gap__text">
              The strongest projects grow from love, intention, and collaboration — not from chasing trends. The people running this network are peers, not platform operators. That&apos;s how trust gets built.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <div className="container">
          <h2>Carrying something ambitious?</h2>
          <p>You don&apos;t have to build it alone.</p>
          <Link href="/join" className="btn btn--primary btn--large">
            Join the Network
          </Link>
          <Link href="/collaborate" className="btn btn--outline btn--large">
            Explore Open Roles
          </Link>
        </div>
      </section>
    </>
  )
}
