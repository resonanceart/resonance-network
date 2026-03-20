import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Submit a Project — Resonance Network',
  description: "Share your project with Resonance Network. We're looking for concept-ready projects at the intersection of art, architecture, ecology, and social impact.",
  openGraph: {
    title: 'Submit a Project — Resonance Network',
    description: 'Share your concept-ready project with a curated community of collaborators and experts.',
    type: 'website',
  },
}

export default function SubmitPage() {
  return (
    <main>
      {/* Page Header */}
      <section className="page-header">
        <div className="container">
          <p className="section-label">Submit</p>
          <h1>Share Your Project</h1>
          <p className="lead">We&apos;re looking for concept-ready projects at the intersection of art, architecture, ecology, and social impact — projects with real substance that need the right people and pathways to become reality.</p>
        </div>
      </section>

      {/* What Belongs Here */}
      <section className="submit-section">
        <div className="container">
          <h2>What Kinds of Projects Belong</h2>
          <p>Resonance Network features curated, &quot;concept-ready&quot; projects — work that exists beyond the idea stage. You have images, drawings, a rough budget, artist statements, and a clear philosophy. What you need now is the ecosystem: collaborators, technical expertise, and pathways to move from vision to built reality.</p>
          <p>Projects on the network span immersive installations, regenerative architecture, large-scale public art, interactive environments, ecological design, material innovation, and social impact infrastructure. The common thread is ambition, interdisciplinary practice, and a commitment to creating work that matters.</p>
        </div>
      </section>

      {/* What to Prepare */}
      <section className="submit-section">
        <div className="container">
          <h2>What to Prepare</h2>
          <p style={{ marginBottom: 'var(--space-5)' }}>Before you begin, gather the following materials:</p>
          <ul className="prepare-list">
            <li><strong>Lead artist information</strong> — name, bio, portfolio or website link</li>
            <li><strong>Project details</strong> — title, short description (2–3 sentences), and full project story/narrative</li>
            <li><strong>Classification</strong> — project domains (what it is), pathways (how it may be realized), and current stage</li>
            <li><strong>Images and renders</strong> — hero image plus 3–5 gallery images showing the project concept, materials, or models</li>
            <li><strong>Collaboration needs</strong> — specific roles or expertise your project is seeking, with descriptions of scope and skills needed</li>
            <li><strong>Contact information</strong> — how collaborators and the network can reach you</li>
          </ul>
        </div>
      </section>

      {/* How Curation Works */}
      <section className="submit-section">
        <div className="container">
          <h2>How Curation Works</h2>
          <p>Every submission is reviewed for quality, alignment with network values, and project readiness. AI assists with initial processing, but a human curation team — practicing artists and makers — reviews and approves every project.</p>
          <p>We review for clarity of materials, alignment with our values of regeneration, originality, and inclusivity, and whether the project has enough substance for collaborators and supporters to engage meaningfully.</p>
        </div>
      </section>

      {/* What to Expect */}
      <section className="submit-section">
        <div className="container">
          <h2>What to Expect</h2>
          <p>After you submit, our team will review your project within two weeks. You&apos;ll hear from us either way.</p>
          <p>If your project is approved, we&apos;ll work with you to create your project page — a curated, visual anchor for your work on the network that you can share with funders, curators, and potential collaborators.</p>
          <p>If your project isn&apos;t quite ready, you&apos;ll receive clear, specific feedback on what would strengthen your application — with an explicit invitation to resubmit when those elements are in place. Our message is never &quot;no.&quot; It&apos;s <em>&quot;not yet — and here&apos;s how to come back.&quot;</em></p>
        </div>
      </section>

      {/* CTA */}
      <section className="submit-cta">
        <div className="container">
          <h2>Ready to Begin?</h2>
          <p>Share your project with us — we&apos;d love to learn about your vision.</p>
          <a
            href="https://resonance-network.typeform.com/submit"
            className="btn btn--primary btn--large"
            target="_blank"
            rel="noopener noreferrer"
          >
            Submit Your Project
          </a>
        </div>
      </section>
    </main>
  )
}
