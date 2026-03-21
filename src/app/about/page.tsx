import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About',
  description: "Built by artists, for artists. Learn how Resonance Network helps visionary spatial projects — immersive, regenerative, ecological — cross the gap from concept to built reality.",
  alternates: {
    canonical: 'https://resonance.network/about',
  },
  openGraph: {
    title: 'About Resonance Network',
    description: 'An artist-led platform for work too ambitious to build alone — immersive installations, regenerative architecture, and ecological design at scale.',
    url: 'https://resonance.network/about',
    type: 'website',
    images: [{ url: '/og-image.jpg' }],
  },
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://resonance.network',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'About',
      item: 'https://resonance.network/about',
    },
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
            <a href="/">Home</a> <span aria-hidden="true">/</span> <span>About</span>
          </nav>
          <p className="section-label">About Resonance Network</p>
          <h1 className="about-hero__headline">A Home for Projects Too Ambitious to Build Alone</h1>
          <p className="about-hero__sub">A curated, community-driven platform for large-scale, immersive, and regenerative projects at the intersection of art, architecture, ecology, and social impact.</p>
        </div>
      </section>

      {/* Mission */}
      <section className="about-section about-section--alt">
        <div className="container">
          <div className="about-two-col">
            <div className="about-two-col__label">
              <p className="section-label">Mission</p>
              <h2>The Gap We Close</h2>
            </div>
            <div className="about-two-col__body">
              <p className="about-lead-text">Resonance Network helps serious, visionary spatial projects cross the gap from concept-ready to buildable reality.</p>
              <p>We do this by curating aligned projects, offering transparent feedback, and connecting creators with the technical expertise, collaborators, and funding pathways they need — so ambitious immersive and regenerative works can be realized without creators sacrificing their financial or emotional well-being.</p>
              <blockquote className="about-pullquote">
                <p>Resonance Network should feel like a deep exhale. Creators who arrive here have already done enormous work. What they need is not validation — they need to realize they do not have to do it alone.</p>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="about-section">
        <div className="container">
          <p className="section-label">Values</p>
          <h2>What Guides Us</h2>
          <div className="values-grid">
            <div className="value-card value-card--accent-1">
              <h3>Inspiration</h3>
              <p>We share work and stories that generate awe and emotional resonance. Every project we feature, every story we tell, should remind creators why this work matters.</p>
            </div>
            <div className="value-card value-card--accent-2">
              <h3>Participation</h3>
              <p>We treat the public and each other as active participants, not spectators. The network itself is participatory — shaped by the needs, ideas, and contributions of its members.</p>
            </div>
            <div className="value-card value-card--accent-3">
              <h3>Inclusivity</h3>
              <p>We uplift diverse voices across disciplines, cultures, and backgrounds. We actively seek perspectives underrepresented in mainstream art and architecture platforms.</p>
            </div>
            <div className="value-card value-card--accent-4">
              <h3>Originality</h3>
              <p>We support distinctive ideas, protecting space for experimentation over trends. The projects that thrive here are too ambitious, too interdisciplinary, or too unconventional for traditional pathways.</p>
            </div>
            <div className="value-card value-card--accent-5">
              <h3>Regeneration</h3>
              <p>We favor projects that work in long-term relationship with ecological and social systems — using renewable materials, emphasizing stewardship, and considering the full lifecycle of what we build.</p>
            </div>
            <div className="value-card value-card--accent-6">
              <h3>Transparency</h3>
              <p>We are clear about our processes, criteria, and limitations. Creators understand where they stand, what is missing, and what to do next.</p>
            </div>
            <div className="value-card value-card--accent-7">
              <h3>Integrity</h3>
              <p>We respect the labor and lived experience behind each project. Every creator who engages with Resonance Network — whether accepted or redirected — should feel they were treated with genuine care.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="about-section about-section--alt">
        <div className="container">
          <p className="section-label">Community</p>
          <h2>Who This Is For</h2>
          <div className="audience-grid">
            <div className="audience-card">
              <div className="audience-card__icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M5 20c0-4 3.5-7 7-7s7 3 7 7"/></svg>
              </div>
              <h3>Creators</h3>
              <p>Artists, architects, designers, and interdisciplinary creators with substantive, large-scale projects beyond the idea stage — immersive installations, regenerative architecture, public art, interactive environments.</p>
            </div>
            <div className="audience-card">
              <div className="audience-card__icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
              </div>
              <h3>Collaborators &amp; Experts</h3>
              <p>Engineers, fabricators, producers, technologists, and sustainability consultants whose expertise is essential — professionals who care about the work and want access to meaningful, values-aligned projects.</p>
            </div>
            <div className="audience-card">
              <div className="audience-card__icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              </div>
              <h3>Curators, Venues &amp; Funders</h3>
              <p>Museum curators, festival programmers, public art commissioners, foundations, and donors seeking high-quality immersive and regenerative projects with vetted, build-ready materials.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How Curation Works */}
      <section className="about-section">
        <div className="container">
          <p className="section-label">Process</p>
          <h2>How Curation Works</h2>
          <p className="about-section__intro">Every project submitted to Resonance Network is reviewed for alignment with shared values and readiness to engage. Here&apos;s how it works:</p>
          <div className="curation-timeline">
            <div className="curation-timeline__step">
              <div className="curation-timeline__marker">
                <span className="step-number">1</span>
                <span className="curation-timeline__line" />
              </div>
              <div className="step-content">
                <h4>Submission</h4>
                <p>Creators submit their project through our intake form, including images, descriptions, classification, and collaboration needs.</p>
              </div>
            </div>
            <div className="curation-timeline__step">
              <div className="curation-timeline__marker">
                <span className="step-number">2</span>
                <span className="curation-timeline__line" />
              </div>
              <div className="step-content">
                <h4>AI-Assisted Review</h4>
                <p>Submissions receive an initial review for completeness, alignment with network values, and project stage readiness.</p>
              </div>
            </div>
            <div className="curation-timeline__step">
              <div className="curation-timeline__marker">
                <span className="step-number">3</span>
                <span className="curation-timeline__line" />
              </div>
              <div className="step-content">
                <h4>Human Review</h4>
                <p>A curation team of practicing artists and makers reviews every project. Human approval is required — AI assists but never decides.</p>
              </div>
            </div>
            <div className="curation-timeline__step">
              <div className="curation-timeline__marker">
                <span className="step-number">4</span>
              </div>
              <div className="step-content">
                <h4>Publish or Guide</h4>
                <p>Approved projects are published to the network. Projects not yet ready receive clear, actionable feedback — with an explicit invitation to resubmit.</p>
              </div>
            </div>
          </div>
          <blockquote className="about-pullquote about-pullquote--centered">
            <p>The message is never &quot;no.&quot; It is <em>&quot;not yet — and here&apos;s how to come back.&quot;</em></p>
          </blockquote>
        </div>
      </section>

      {/* By Artists, For Artists */}
      <section className="about-section about-section--alt">
        <div className="container">
          <div className="about-two-col">
            <div className="about-two-col__label">
              <p className="section-label">Governance</p>
              <h2>By Artists, For Artists</h2>
            </div>
            <div className="about-two-col__body">
              <p>This is not just a tagline — it describes how we&apos;re built. Resonance Network is created and stewarded by practicing artists and makers who know firsthand how hard it is to carry a large, interdisciplinary project.</p>
              <p>The founding team has personally experienced the challenges — budget overruns, isolation, the need for technical expertise that&apos;s hard to find. This lived experience informs every decision: what curation criteria to set, how to give feedback, and how to treat creators.</p>
              <p>We believe the strongest projects grow from love, intention, and collaboration — not from chasing trends. When a visitor sees that the people running Resonance Network are peers — not venture-backed platform operators — trust is immediate and earned.</p>
            </div>
          </div>
        </div>
      </section>

      {/* What We're Not */}
      <section className="about-section">
        <div className="container">
          <p className="section-label">Clarity</p>
          <h2>What We&apos;re Not</h2>
          <p className="about-section__intro">Knowing what we aren&apos;t is just as important as knowing what we are:</p>
          <div className="not-grid">
            <div className="not-grid__item">
              <span className="not-icon">&times;</span>
              <div>
                <strong>Not a social media platform.</strong>
                <p>No feeds, follower counts, or engagement metrics. This is a working space, not a performance space.</p>
              </div>
            </div>
            <div className="not-grid__item">
              <span className="not-icon">&times;</span>
              <div>
                <strong>Not a crowdfunding site.</strong>
                <p>We don&apos;t host campaigns or process donations. We connect creators with funding pathways.</p>
              </div>
            </div>
            <div className="not-grid__item">
              <span className="not-icon">&times;</span>
              <div>
                <strong>Not a portfolio directory.</strong>
                <p>This is for serious projects in development that need collaborators and support to get built.</p>
              </div>
            </div>
            <div className="not-grid__item">
              <span className="not-icon">&times;</span>
              <div>
                <strong>Not a generic art marketplace.</strong>
                <p>Specifically for large-scale, immersive, and regenerative spatial projects.</p>
              </div>
            </div>
            <div className="not-grid__item">
              <span className="not-icon">&times;</span>
              <div>
                <strong>Not a grant-making organization.</strong>
                <p>We help creators navigate funding pathways and connect with the right supporters.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <div className="container">
          <h2>Carrying something ambitious?</h2>
          <p>You don&apos;t have to build it alone. Tell us what you&apos;re working on.</p>
          <Link href="/submit" className="btn btn--primary btn--large">
            Submit a Project
          </Link>
        </div>
      </section>
    </>
  )
}
