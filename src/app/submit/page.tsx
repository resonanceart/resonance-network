import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Submit a Project',
  description: "You've done the hard part — now find the collaborators, expertise, and pathways to make it real. Submit your project to Resonance Network.",
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
          <p className="lead">If you have a large-scale creative project with real substance — images, plans, a clear vision — and you need collaborators, expertise, or pathways to make it real, this is the place.</p>
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

      {/* What to Expect */}
      <section className="submit-section">
        <div className="container">
          <h2>After You Submit</h2>
          <p>Our curation team reviews every project personally within two weeks. You&apos;ll hear from us either way.</p>
          <p>If your project is approved, we&apos;ll work with you to create your project page — a curated, visual anchor for your work on the network that you can share with funders, curators, and potential collaborators.</p>
          <p>If your project isn&apos;t quite ready, you&apos;ll receive clear, specific feedback on what would strengthen your application — with an explicit invitation to resubmit.</p>
          <p className="submit-about-link">Want to know more about our curation philosophy and values? <Link href="/about#process">Read about our process</Link>.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="submit-cta">
        <div className="container">
          <h2>Your Project Deserves the Right People Behind It</h2>
          <p>The submission takes about 15 minutes. Every project is reviewed by practicing artists and makers — people who understand the work.</p>
          <a
            href="https://form.typeform.com/to/Szk6kJmX"
            className="btn btn--primary btn--large"
            target="_blank"
            rel="noopener noreferrer"
          >
            Start Your Submission
          </a>
        </div>
      </section>
    </>
  )
}
