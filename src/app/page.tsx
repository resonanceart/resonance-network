import Image from 'next/image'
import { ProjectGallery } from '@/components/ProjectGallery'
import { AuthAwareCTA } from '@/components/AuthAwareCTA'
import { getProjects } from '@/lib/data'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Resonance Network — Where Ambitious Creative Projects Find Their People',
  description: 'An artist-led platform for ambitious creative work across art, architecture, and ecology. Find collaborators and build the work you can\'t build alone.',
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
          <h1 className="site-hero__tagline">Art at the scale of your ambition.</h1>
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
          <h2 className="hero-intro__heading">Where visionary projects find the right people.</h2>
          <p className="hero-intro__body">Resonance Network connects artists, architects, and makers with the collaborators, expertise, and pathways to build what can&apos;t be built alone. Every project here is curated, every role is real.</p>
          <a href="/about" className="hero-intro__link">Learn how it works →</a>
        </div>
      </section>

      {/* Project Gallery with filtering */}
      <ProjectGallery projects={projects} />

      {/* Bottom CTA */}
      <section className="cta-bottom">
        <div className="cta-bottom__inner">
          <h2 className="cta-bottom__heading">Your Skills Belong Here</h2>
          <p className="cta-bottom__body">Whether you&apos;re an artist with a vision, an engineer seeking meaningful work, or a specialist looking for projects that match your values — there&apos;s a place for you here.</p>
          <div className="cta-bottom__actions">
            <AuthAwareCTA
              loggedOutHref="/login?tab=signup&redirect=/dashboard/projects/new"
              loggedOutLabel="Submit Your Project"
              loggedInHref="/dashboard/projects/new"
              loggedInLabel="Submit Your Project"
              className="btn btn--primary btn--large"
            />
            <AuthAwareCTA
              loggedOutHref="/login?tab=signup&redirect=/dashboard/welcome"
              loggedOutLabel="Join the Network"
              loggedInHref="/dashboard"
              loggedInLabel="Go to Dashboard"
              className="btn btn--outline btn--large"
            />
          </div>
        </div>
      </section>
    </>
  )
}
