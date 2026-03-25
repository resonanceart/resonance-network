import type { Metadata } from 'next'
import Link from 'next/link'
import { ProjectSubmissionForm } from '@/components/ProjectSubmissionForm'

export const metadata: Metadata = {
  title: 'Submit a Project',
  description: "You've done the hard part — now find the collaborators, expertise, and pathways to make it real. Submit your creative project to Resonance Network today.",
  alternates: {
    canonical: 'https://resonance.network/submit',
  },
  openGraph: {
    title: 'Submit a Project to Resonance Network',
    description: "You've done the hard part — now find the people, pathways, and momentum to make it real.",
    url: 'https://resonance.network/submit',
    type: 'website',
    images: [{ url: '/og-image.jpg' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Submit a Project to Resonance Network',
    description: "You've done the hard part — now find the collaborators and pathways to make it real.",
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
      name: 'Submit a Project',
      item: 'https://resonance.network/submit',
    },
  ],
}

export default function SubmitPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Page Header */}
      <section className="page-header">
        <div className="container">
          <nav aria-label="Breadcrumb" className="breadcrumb">
            <Link href="/">Home</Link> <span aria-hidden="true">/</span> <span>Submit</span>
          </nav>
          <p className="section-label">Submit</p>
          <h1>You&apos;ve Done the Hard Part. Let Us Help With the Rest.</h1>
          <p className="lead">You have a project with real substance — images, plans, a clear vision. Now you need the right people to make it real. This is the place.</p>
        </div>
      </section>

      {/* What to Prepare */}
      <section className="submit-section">
        <div className="container">
          <h2>Before You Begin</h2>
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
              <span>Specific roles or expertise your project is seeking, with descriptions of scope and skills needed</span>
            </li>
            <li>
              <strong>Contact information</strong>
              <span>How collaborators and the network can reach you</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Submission Form */}
      <section className="submit-form-section" id="submission-form">
        <div className="container">
          <h2>Submit Your Project</h2>
          <p>It takes about 15 minutes. Every project is reviewed by practicing artists and makers — people who understand the work.</p>
          <ProjectSubmissionForm />
        </div>
      </section>

      {/* What Makes a Strong Submission */}
      <section className="submit-section">
        <div className="container">
          <h2>What Makes a Strong Submission</h2>
          <p className="submit-section__intro">We&apos;re looking for projects past the idea stage and ready to engage. Here&apos;s what stands out:</p>
          <ul className="prepare-list">
            <li>
              <strong>Substance over polish</strong>
              <span>Real work matters more than perfect renders. Show us what you&apos;ve built, tested, or prototyped.</span>
            </li>
            <li>
              <strong>Clear creative vision</strong>
              <span>We want to understand what the project IS, not just what it looks like. Tell us the story.</span>
            </li>
            <li>
              <strong>Interdisciplinary ambition</strong>
              <span>Projects that cross boundaries between art, architecture, ecology, technology, and community.</span>
            </li>
            <li>
              <strong>Collaboration readiness</strong>
              <span>You know what you need. Specific roles, specific expertise, specific gaps.</span>
            </li>
            <li>
              <strong>Values alignment</strong>
              <span>Regenerative thinking, inclusivity, and genuine care for the communities your work touches.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Who Can Submit */}
      <section className="submit-section">
        <div className="container">
          <h2>Who Can Submit</h2>
          <p>Resonance Network is open to artists, architects, designers, collectives, and interdisciplinary teams. You don&apos;t need a track record of completed works — but you do need a project with real substance and a clear path forward.</p>
          <p>We welcome projects from Design Development through Production, across all domains: large-scale installations, regenerative buildings, public art, ecological design, experimental technology, and more.</p>
        </div>
      </section>

      {/* What to Expect */}
      <section className="submit-section">
        <div className="container">
          <h2>After You Submit</h2>
          <p>Our curation team reviews every project personally within two weeks. You&apos;ll hear from us either way.</p>
          <p>If approved, we&apos;ll work with you to build your project page — a curated, visual home for your work that you can share with funders, curators, and potential collaborators.</p>
          <p>If your project isn&apos;t quite ready, you&apos;ll get clear, specific feedback on what would strengthen it — and an open invitation to resubmit.</p>
          <p className="submit-about-link">Want to know more about our curation philosophy and values? <Link href="/about#process">Read about our process</Link>.</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="submit-section" id="faq">
        <div className="container">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-list">
            <div className="faq-item">
              <h3>What if my project gets rejected?</h3>
              <p>You&apos;ll get personal feedback and an open invitation to resubmit. The answer is never &quot;no&quot; — it&apos;s &quot;not yet.&quot;</p>
            </div>
            <div className="faq-item">
              <h3>When will I hear back?</h3>
              <p>Within two weeks. Every project is reviewed personally by our curation team.</p>
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
    </>
  )
}
