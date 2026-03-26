import Image from 'next/image'
import { ProjectGallery } from '@/components/ProjectGallery'
import { AuthAwareCTA } from '@/components/AuthAwareCTA'
import { getProjects } from '@/lib/data'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Resonance Network — Where Ambitious Creative Projects Find Their People',
  description: 'Resonance Network connects artists, architects, and makers with collaborators, expertise, and funding to build large-scale immersive and regenerative projects.',
  alternates: {
    canonical: 'https://resonance.network',
  },
  openGraph: {
    title: 'Resonance Network — Where Ambitious Creative Projects Find Their People',
    description: 'Large-scale art and architecture projects, curated and connected with the collaborators to get built.',
    url: 'https://resonance.network',
    type: 'website',
    images: [{ url: '/og-image.jpg' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Resonance Network — Where Ambitious Creative Projects Find Their People',
    description: 'An artist-led platform connecting creators with collaborators to build ambitious work at the intersection of art and ecology.',
    images: [{ url: '/og-image.jpg' }],
  },
}

export const revalidate = 60

export default async function HomePage() {
  const projects = await getProjects()

  return (
    <>
      {/* Hero — cinematic, image-forward */}
      <section className="site-hero">
        <Image
          src="/assets/images/projects/money-shot.png"
          alt="Resonance — climbable bamboo conch shell installation"
          className="site-hero__img"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover' }}
        />
        <div className="site-hero__overlay"></div>
        <div className="site-hero__content">
          <h1 className="site-hero__tagline">Where ambitious creative projects find the people to get built.</h1>
          <div className="site-hero__actions">
            <AuthAwareCTA
              loggedOutHref="/login?tab=signup&redirect=/dashboard/projects/new"
              loggedOutLabel="Submit a Project"
              loggedInHref="/dashboard/projects/new"
              loggedInLabel="Submit a Project"
              className="btn btn--hero"
            />
            <AuthAwareCTA
              loggedOutHref="/collaborate"
              loggedOutLabel="Find a Role"
              loggedInHref="/collaborate"
              loggedInLabel="Find a Role"
              className="btn btn--hero btn--hero-outline"
            />
          </div>
        </div>
      </section>

      {/* Intro section — below the hero */}
      <section className="hero-intro">
        <div className="hero-intro__inner">
          <h2 className="hero-intro__heading">The gap between vision and reality is not a lack of talent. It&apos;s a lack of connection.</h2>
          <p className="hero-intro__body">Across art, architecture, and regenerative design, extraordinary spatial projects rarely make it past the proposal stage — not because the vision isn&apos;t strong, but because creators are isolated from the technical expertise, production partners, and funding pathways they need. Resonance Network closes that gap.</p>
          <a href="/about" className="hero-intro__link">Learn how it works →</a>
        </div>
      </section>

      {/* Social proof */}
      <div className="social-proof">
        <span className="social-proof__stat">9 curated projects</span>
        <span className="social-proof__divider" aria-hidden="true">&middot;</span>
        <span className="social-proof__stat">30+ open roles</span>
        <span className="social-proof__divider" aria-hidden="true">&middot;</span>
        <span className="social-proof__stat">3 countries represented</span>
      </div>

      {/* Project Gallery with filtering */}
      <section id="projects">
        <ProjectGallery projects={projects} />
      </section>

      {/* Bottom CTA */}
      <section className="cta-bottom">
        <div className="cta-bottom__inner">
          <h2 className="cta-bottom__heading">Your expertise belongs on work that matters.</h2>
          <p className="cta-bottom__body">Whether you&apos;re a structural engineer, grant writer, fabricator, lighting designer, or production specialist — there are projects here that need exactly what you do.</p>
          <div className="cta-bottom__actions">
            <a href="/collaborate" className="btn btn--primary btn--large">Find Open Roles</a>
            <AuthAwareCTA
              loggedOutHref="/join"
              loggedOutLabel="Submit a Project"
              loggedInHref="/dashboard/projects/new"
              loggedInLabel="Submit a Project"
              className="btn btn--outline btn--large"
            />
          </div>
        </div>
      </section>
    </>
  )
}
