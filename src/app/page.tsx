import Image from 'next/image'
import { ProjectGallery } from '@/components/ProjectGallery'
import projectsData from '../../data/projects.json'
import type { Project } from '@/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Resonance Network — Immersive Art Installations, Regenerative Architecture & Ecological Design',
  description: 'Discover curated immersive art installations, regenerative architecture, and ecological design projects. Connect with collaborators to build ambitious creative work.',
  alternates: {
    canonical: 'https://resonance.network',
  },
  openGraph: {
    title: 'Resonance Network — Immersive Art Installations, Regenerative Architecture & Ecological Design',
    description: 'Discover curated immersive art installations, regenerative architecture, and ecological design projects. Connect with collaborators to build ambitious creative work.',
    type: 'website',
    images: [{ url: '/og-image.jpg' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Resonance Network — Immersive Art Installations, Regenerative Architecture & Ecological Design',
    description: 'Curated immersive art installations, regenerative architecture, and ecological design. An artist-led collaboration platform.',
    images: [{ url: '/og-image.jpg' }],
  },
}

export default function HomePage() {
  const projects = projectsData as Project[]

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
        <p className="hero-intro__text">Immersive art. Regenerative architecture. Ecological design. One network.</p>
      </section>

      {/* Project Gallery with filtering */}
      <ProjectGallery projects={projects} />

      {/* Bottom CTA */}
      <section className="cta-bottom">
        <div className="cta-bottom__inner">
          <h2 className="cta-bottom__heading">Your Skills Belong Here</h2>
          <p className="cta-bottom__body">Whether you&apos;re an artist with a vision, an engineer who wants meaningful work, or an ecologist seeking projects that match your values — the network is waiting.</p>
          <div className="cta-bottom__actions">
            <a href="/submit" className="btn btn--primary btn--large">Submit Your Project</a>
            <a href="/collaborate" className="btn btn--outline btn--large">Find a Role</a>
          </div>
        </div>
      </section>
    </>
  )
}
