import Image from 'next/image'
import Link from 'next/link'
import { ProjectGallery } from '@/components/ProjectGallery'
import { ProjectCard } from '@/components/ProjectCard'
import { AuthAwareCTA } from '@/components/AuthAwareCTA'
import { getProjects } from '@/lib/data'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Immersive Art Collaboration Platform',
  description: 'Resonance Network connects creators, collaborators, and communities at the intersection of immersive art, regenerative design, and ecological innovation.',
  alternates: {
    canonical: 'https://resonancenetwork.org',
  },
  openGraph: {
    title: 'Immersive Art Collaboration Platform',
    description: 'Resonance Network connects creators, collaborators, and communities at the intersection of immersive art, regenerative design, and ecological innovation.',
    url: 'https://resonancenetwork.org',
    type: 'website',
    images: [{ url: '/og-image.jpg' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Immersive Art Collaboration Platform',
    description: 'Resonance Network connects creators, collaborators, and communities at the intersection of immersive art, regenerative design, and ecological innovation.',
    images: [{ url: '/og-image.jpg' }],
  },
}

export const revalidate = 60

export default async function HomePage() {
  const projects = await getProjects()
  const liveProjects = projects.filter(p => p.source === 'supabase')
  const conceptProjects = projects.filter(p => p.source !== 'supabase')

  return (
    <>
      {/* Hero — full-width immersive image + tagline + 2 CTAs */}
      <section className="site-hero">
        <Image
          src="/assets/images/projects/money-shot.png"
          alt="Resonance — immersive spatial art installation"
          className="site-hero__img"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover' }}
        />
        <div className="site-hero__overlay" />
        <div className="site-hero__content">
          <h1 className="site-hero__tagline">Connecting Community Through Passion and Purpose</h1>
          <div className="site-hero__actions">
            <AuthAwareCTA
              loggedOutHref="/login?tab=signup"
              loggedOutLabel="Build Profile"
              loggedInHref="/dashboard/profile/live-edit"
              loggedInLabel="Build Profile"
              className="btn btn--hero"
            />
            <AuthAwareCTA
              loggedOutHref="/login?tab=signup&redirect=/dashboard/projects/new"
              loggedOutLabel="Submit Project"
              loggedInHref="/dashboard/projects/new"
              loggedInLabel="Submit Project"
              className="btn btn--hero btn--hero-outline"
            />
          </div>
        </div>
      </section>

      {/* Live Projects */}
      <section id="projects">
        {liveProjects.length > 0 ? (
          <ProjectGallery projects={liveProjects} />
        ) : (
          <div className="container" style={{ padding: 'var(--space-10) 0', textAlign: 'center' }}>
            <p className="section-label">Projects</p>
            <p style={{ color: 'var(--color-text-muted)' }}>Real projects coming soon. Be the first to submit yours.</p>
          </div>
        )}
      </section>

      {/* AI Concept Projects */}
      {conceptProjects.length > 0 && (
        <section id="ai-concepts" style={{ borderTop: '1px solid var(--color-border)' }}>
          <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)' }}>
            <p className="section-label">AI Concept Projects</p>
            <div className="project-grid">
              {conceptProjects.map((project, i) => (
                <ProjectCard key={project.id} project={project} index={i} transitionDelay={(i % 3) * 0.05} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bottom CTA — clean, 3 buttons */}
      <section className="cta-bottom">
        <div className="cta-bottom__inner">
          <h2 className="cta-bottom__heading">Connect to Your Passion and Purpose</h2>
          <div className="cta-bottom__actions">
            <Link href="/collaborate" className="btn btn--primary btn--large">Find Role</Link>
            <AuthAwareCTA
              loggedOutHref="/login?tab=signup"
              loggedOutLabel="Build Profile"
              loggedInHref="/dashboard/profile/live-edit"
              loggedInLabel="Build Profile"
              className="btn btn--outline btn--large"
            />
            <AuthAwareCTA
              loggedOutHref="/login?tab=signup&redirect=/dashboard/projects/new"
              loggedOutLabel="Submit"
              loggedInHref="/dashboard/projects/new"
              loggedInLabel="Submit"
              className="btn btn--outline btn--large"
            />
          </div>
        </div>
      </section>
    </>
  )
}
