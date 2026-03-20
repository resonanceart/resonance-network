import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About — Resonance Network',
  description: "Learn about Resonance Network's mission, values, and how we support creators of large-scale immersive and regenerative projects.",
  openGraph: {
    title: 'About — Resonance Network',
    description: 'A curated, community-driven platform for large-scale immersive and regenerative projects.',
    type: 'website',
  },
}

export default function AboutPage() {
  return (
    <main>
      {/* Page Header */}
      <section className="page-header">
        <div className="container">
          <p className="section-label">About</p>
          <h1>What Resonance Network Is</h1>
          <p className="lead">A curated, community-driven platform for large-scale, immersive, and regenerative projects that sit at the intersection of art, architecture, ecology, and social impact.</p>
        </div>
      </section>

      {/* Mission */}
      <section className="about-section">
        <div className="container">
          <p className="section-label">Mission</p>
          <h2>Why We Exist</h2>
          <p>Resonance Network&apos;s mission is to help serious, visionary spatial projects cross the gap from concept-ready to buildable reality. We do this by curating aligned projects, offering transparent feedback, and connecting creators with the technical expertise, collaborators, and funding pathways they need — so ambitious immersive and regenerative works can be realized without creators sacrificing their financial or emotional well-being.</p>
          <p>Bringing large, interdisciplinary ideas to life is overwhelming. Most creators of ambitious spatial work — immersive installations, regenerative architecture, large-scale public art — face the same impossible equation: the vision requires engineering, architecture, fabrication, production management, funding, and venue partnerships, but the creator is working alone or with a small team, often funding the work out of pocket.</p>
          <p>Resonance Network should feel like a deep exhale. Creators who arrive here have already done enormous work. What they need is not validation that their idea is good. They need to feel seen and understood. They need to realize they do not have to abandon their vision. And they need to recognize they do not have to do it alone.</p>
        </div>
      </section>

      {/* Core Values */}
      <section className="about-section">
        <div className="container">
          <p className="section-label">Values</p>
          <h2>What We Stand For</h2>
          <div className="values-grid">
            <div className="value-card">
              <h3>Inspiration</h3>
              <p>We share work and stories that generate awe and emotional resonance. The network should leave people feeling more alive, curious, and imaginative. Every project we feature, every story we tell, and every interaction should remind creators why this work matters.</p>
            </div>
            <div className="value-card">
              <h3>Participation</h3>
              <p>We treat the public and each other as active participants, not spectators. Projects grow through collaboration, co-creation, and collective presence. The network itself is participatory — shaped by the needs, ideas, and contributions of its members.</p>
            </div>
            <div className="value-card">
              <h3>Inclusivity</h3>
              <p>We uplift diverse voices across disciplines, cultures, and backgrounds. We design for accessibility and cultural depth so a wide range of creators and communities can belong. The network actively seeks perspectives that are underrepresented in mainstream art and architecture platforms.</p>
            </div>
            <div className="value-card">
              <h3>Originality</h3>
              <p>We support distinctive ideas and forms, protecting space for experimentation rather than replicating trends or purely commercial formulas. The projects that thrive here are the ones that could not exist anywhere else — too ambitious, too interdisciplinary, or too unconventional for traditional pathways.</p>
            </div>
            <div className="value-card">
              <h3>Regeneration</h3>
              <p>We favor projects and practices that work in long-term relationship with ecological and social systems — using renewable or recycled materials, emphasizing stewardship, and considering the full lifecycle of what we build. Regeneration is not just a theme; it is a design principle.</p>
            </div>
            <div className="value-card">
              <h3>Transparency</h3>
              <p>We are clear about our processes, criteria, and limitations. When we review projects, creators understand where they stand, what is missing, and what to do next. We normalize honesty about project stages, budgets, and needs — because transparency is professionalism.</p>
            </div>
            <div className="value-card">
              <h3>Integrity</h3>
              <p>We respect the labor and lived experience behind each project. We keep our commitments and prioritize long-term relationships over short-term visibility or hype. Every creator who engages with Resonance Network — whether accepted or redirected — should feel they were treated with genuine care.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="about-section">
        <div className="container">
          <p className="section-label">Community</p>
          <h2>Who It&apos;s For</h2>
          <div className="audience-grid">
            <div className="audience-card">
              <h3>Creators</h3>
              <p>Artists, architects, designers, and interdisciplinary creators who have a substantive, large-scale project that exists beyond the idea stage. They have images, drawings, rough budgets, artist statements, and a clear philosophy. They may be working on immersive installations, regenerative architecture, public art, or interactive environments.</p>
            </div>
            <div className="audience-card">
              <h3>Collaborators &amp; Experts</h3>
              <p>Engineers, architects, fabricators, producers, technologists, lighting designers, sound designers, and sustainability consultants whose expertise is essential to large-scale creative projects. Professionals who care about the work, not just the contract — and who want access to meaningful, values-aligned projects.</p>
            </div>
            <div className="audience-card">
              <h3>Curators, Venues &amp; Funders</h3>
              <p>Museum curators, festival programmers, public art commissioners, venue operators, foundations, and individual donors seeking high-quality immersive and regenerative projects. A trusted source for discovering ambitious work with vetted, build-ready materials and clear needs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How Curation Works */}
      <section className="about-section">
        <div className="container">
          <p className="section-label">Process</p>
          <h2>How Curation Works</h2>
          <p style={{ marginBottom: 'var(--space-6)' }}>Every project submitted to Resonance Network is reviewed for alignment with shared values and readiness to engage with the network. Here&apos;s how it works:</p>
          <div className="curation-steps">
            <div className="curation-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Submission</h4>
                <p>Creators submit their project through our intake form, including images, descriptions, classification, and collaboration needs.</p>
              </div>
            </div>
            <div className="curation-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>AI-Assisted Review</h4>
                <p>Submissions receive an initial review for completeness, alignment with network values, and project stage readiness.</p>
              </div>
            </div>
            <div className="curation-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Human Review</h4>
                <p>A curation team of practicing artists and makers reviews every project. Human approval is required — AI assists but never decides.</p>
              </div>
            </div>
            <div className="curation-step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h4>Publish or Guide</h4>
                <p>Approved projects are published to the network. Projects that aren&apos;t ready yet receive clear, actionable feedback on what would strengthen their application — with an explicit invitation to resubmit.</p>
              </div>
            </div>
          </div>
          <p style={{ marginTop: 'var(--space-6)' }}>The message is never &quot;no.&quot; It is <em>&quot;not yet — and here&apos;s how to come back.&quot;</em> This approach builds trust, respects the creator&apos;s labor, and ensures that the curation process itself is a form of support.</p>
        </div>
      </section>

      {/* By Artists, For Artists */}
      <section className="about-section">
        <div className="container">
          <p className="section-label">Governance</p>
          <h2>By Artists, For Artists</h2>
          <p>This is not just a tagline — it describes how we&apos;re built. Resonance Network is created and stewarded by practicing artists and makers who know firsthand how hard it is to carry a large, interdisciplinary project. We show up as equals, not gatekeepers.</p>
          <p>The founding team has personally experienced the challenges of large-scale creative projects — the budget overruns, the isolation, the need for technical expertise that&apos;s hard to find. This lived experience informs every decision: what curation criteria to set, how to give feedback, what collaboration tools to build, and how to treat creators.</p>
          <p>We believe the strongest projects grow from love, intention, and collaboration — not from chasing trends or purely commercial outcomes. When a visitor sees that the people running Resonance Network are peers — not venture-backed platform operators — trust is immediate and earned.</p>
        </div>
      </section>

      {/* What We're Not */}
      <section className="about-section">
        <div className="container">
          <p className="section-label">Clarity</p>
          <h2>What We&apos;re Not</h2>
          <p style={{ marginBottom: 'var(--space-6)' }}>Clarity about what we are not is as important as clarity about what we are:</p>
          <div className="not-list">
            <div className="not-list-item">
              <span className="not-icon">×</span>
              <p><strong>Not a social media platform.</strong> We are not building a feed, follower counts, or engagement metrics. This is a working space, not a performance space.</p>
            </div>
            <div className="not-list-item">
              <span className="not-icon">×</span>
              <p><strong>Not a crowdfunding site.</strong> We do not host campaigns or process donations directly. We help connect creators with funding pathways and supporters.</p>
            </div>
            <div className="not-list-item">
              <span className="not-icon">×</span>
              <p><strong>Not a portfolio directory.</strong> We are not a place to showcase finished work. We are a place for serious projects in development that need collaborators and support to get built.</p>
            </div>
            <div className="not-list-item">
              <span className="not-icon">×</span>
              <p><strong>Not a generic art marketplace.</strong> We are specifically for large-scale, immersive, and regenerative spatial projects. This is not a platform for selling prints or digital art.</p>
            </div>
            <div className="not-list-item">
              <span className="not-icon">×</span>
              <p><strong>Not a grant-making organization (at launch).</strong> We do not award grants ourselves. We help creators navigate funding pathways and connect with the right supporters and organizations.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
