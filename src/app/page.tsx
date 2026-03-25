import Image from 'next/image'
import { ProjectGallery } from '@/components/ProjectGallery'
import { getProjects } from '@/lib/data'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Resonance Network — Where Ambitious Creative Projects Find Their People',
  description: 'An artist-led platform for large-scale art, regenerative architecture, and ecological design. Find collaborators and build the work you can\'t build alone.',
  alternates: {
    canonical: 'https://resonance.network',
  },
  openGraph: {
    title: 'Resonance Network — Where Ambitious Creative Projects Find Their People',
    description: 'An artist-led platform for large-scale art, regenerative architecture, and ecological design. Find collaborators and build the work you can\'t build alone.',
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
            <a href="/submit" className="btn btn--hero">Submit a Project</a>
          </div>
        </div>
      </section>

      {/* Intro section — below the hero */}
      <section className="hero-intro">
        <p className="hero-intro__text">A curated network for ambitious creative work — from first sketch to standing structure.</p>
      </section>

      {/* Project Gallery with filtering */}
      <ProjectGallery projects={projects} />

      {/* Bottom CTA */}
      <section className="cta-bottom">
        <div className="cta-bottom__inner">
          <h2 className="cta-bottom__heading">Your Skills Belong Here</h2>
          <p className="cta-bottom__body">Whether you&apos;re an artist with a vision, an engineer seeking meaningful work, or a specialist looking for projects that match your values — there&apos;s a place for you here.</p>
          <div className="cta-bottom__actions">
            <a href="/submit" className="btn btn--primary btn--large">Submit Your Project</a>
            <a href="/collaborate" className="btn btn--outline btn--large">Find a Role</a>
          </div>
        </div>
      </section>
    </>
  )
}
