import Image from 'next/image'
import { ProjectGallery } from '@/components/ProjectGallery'
import projectsData from '../../data/projects.json'
import type { Project } from '@/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Resonance Network — Immersive Art, Regenerative Architecture & Ecological Design',
  description: 'Explore curated projects at the intersection of art, architecture, and ecology — and meet the people building them. An artist-led platform for work too ambitious to do alone.',
  openGraph: {
    title: 'Resonance Network — Immersive Art, Regenerative Architecture & Ecological Design',
    description: 'Explore curated projects at the intersection of art, architecture, and ecology — and meet the people building them.',
    type: 'website',
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
          <h1 className="site-hero__title">Resonance Network</h1>
          <div className="site-hero__actions">
            <a href="#projects" className="btn btn--hero">Explore Projects</a>
            <a href="/submit" className="btn btn--hero btn--hero-outline">Submit a Project</a>
          </div>
        </div>
      </section>

      {/* Intro section — below the hero */}
      <section className="hero-intro">
        <div className="hero-intro__inner">
          <h2 className="hero-intro__heading">Where ambitious creative projects find the people and momentum to become real.</h2>
          <p className="hero-intro__body">Immersive installations. Regenerative architecture. Living public spaces. We connect visionary creators with the collaborators, expertise, and pathways they need — so extraordinary work doesn&apos;t stall at the concept stage.</p>
        </div>
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
