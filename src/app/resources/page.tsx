import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Resources | Guides, Tools & Pathways',
  description: 'Fundraising guides, permitting resources, fiscal sponsorship pathways, and production tools for ambitious spatial and creative projects.',
  alternates: { canonical: 'https://resonancenetwork.org/resources' },
  openGraph: {
    title: 'Resources | Resonance Network',
    description: 'Fundraising guides, permitting resources, and production tools for ambitious immersive art and creative projects.',
    url: 'https://resonancenetwork.org/resources',
    images: [{ url: '/og-image.jpg' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Resources | Resonance Network',
    description: 'Fundraising guides, permitting resources, and production tools for ambitious immersive art and creative projects.',
    images: [{ url: '/og-image.jpg' }],
  },
}

export default function ResourcesPage() {
  return (
    <>
      <section className="section" style={{ padding: 'var(--space-10) 0' }}>
        <div className="container">
          <h1>Tools and Guides</h1>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))', gap: 'var(--space-5)' }}>
            <div style={{ padding: 'var(--space-5)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--color-primary)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-2)' }}>Fundraising & Fiscal Sponsorship</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>Navigate grant applications, fiscal sponsorship pathways (including Fractured Atlas at 8% admin fee), and crowdfunding strategies for creative projects.</p>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Coming soon</span>
            </div>

            <div style={{ padding: 'var(--space-5)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--color-primary)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-2)' }}>Permitting & Public Art Processes</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>Guides on navigating permitting processes by region, public art RFPs, site agreements, and working with municipalities.</p>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Coming soon</span>
            </div>

            <div style={{ padding: 'var(--space-5)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--color-primary)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-2)' }}>Production & Materials</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>Material sourcing guides, fabrication best practices, sustainable building methods, and production planning templates.</p>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Coming soon</span>
            </div>

            <div style={{ padding: 'var(--space-5)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--color-primary)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-2)' }}>Budgeting & Project Planning</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>Budget templates, cost estimation frameworks, timeline planning tools, and financial management guides for creative projects.</p>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Coming soon</span>
            </div>

            <div style={{ padding: 'var(--space-5)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--color-primary)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-2)' }}>Venue & Site Partnerships</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>How to approach venues, negotiate partnerships, write site proposals, and build relationships with institutions and land stewards.</p>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Coming soon</span>
            </div>

            <div style={{ padding: 'var(--space-5)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--color-primary)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-2)' }}>Evaluation Framework</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>Understand how projects are evaluated across 8 value domains. Download the full framework to prepare your submission.</p>
              <a href="/assets/resonance-evaluation-framework.pdf" target="_blank" rel="noopener noreferrer" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary)', fontWeight: 600 }}>Download PDF &rarr;</a>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 'var(--space-10)', padding: 'var(--space-6)', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>This library is growing.</p>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>We are building these resources with input from practicing artists, architects, and producers. If you have expertise to share, we would love to hear from you.</p>
            <Link href="/join" className="btn btn--primary">Join the Network</Link>
          </div>
        </div>
      </section>
    </>
  )
}
