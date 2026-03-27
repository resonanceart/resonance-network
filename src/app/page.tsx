import Image from 'next/image'
import { ProjectGallery } from '@/components/ProjectGallery'
import { AuthAwareCTA } from '@/components/AuthAwareCTA'
import { getProjects } from '@/lib/data'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Resonance Network — A Curated Guild for Immersive and Regenerative Projects',
  description: 'Resonance Network connects creators of concept-ready immersive and regenerative spatial projects with aligned collaborators, honest feedback, and the momentum to get built.',
  alternates: {
    canonical: 'https://resonance.network',
  },
  openGraph: {
    title: 'Resonance Network — A Curated Guild for Immersive and Regenerative Projects',
    description: 'Between proposal and build — we surround serious spatial projects with aligned collaborators and the momentum to get built.',
    url: 'https://resonance.network',
    type: 'website',
    images: [{ url: '/og-image.jpg' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Resonance Network — A Curated Guild for Immersive and Regenerative Projects',
    description: 'A curated platform connecting creators of immersive and regenerative spatial projects with collaborators at the intersection of art and ecology.',
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
          <h1 className="site-hero__tagline">A curated guild for concept-ready immersive and regenerative projects.</h1>
          <p className="site-hero__sub">Between proposal and build — we surround serious spatial projects with aligned collaborators, honest feedback, and the momentum to get built.</p>
          <div className="site-hero__actions">
            <AuthAwareCTA
              loggedOutHref="/login?tab=signup&redirect=/dashboard/projects/new"
              loggedOutLabel="Submit Your Project"
              loggedInHref="/dashboard/projects/new"
              loggedInLabel="Submit Your Project"
              className="btn btn--hero"
            />
            <AuthAwareCTA
              loggedOutHref="/collaborate"
              loggedOutLabel="Find Your Role"
              loggedInHref="/collaborate"
              loggedInLabel="Find Your Role"
              className="btn btn--hero btn--hero-outline"
            />
          </div>
        </div>
      </section>

      {/* Why bring your project here? */}
      <section className="hero-intro">
        <div className="hero-intro__inner">
          <h2 className="hero-intro__heading">Why bring your project here?</h2>
          <div className="hero-promises">
            <div className="hero-promises__card">
              <h3>You don&apos;t have to carry this alone</h3>
              <p>We surround serious projects with aligned collaborators — engineers, fabricators, producers, grant writers — and honest feedback at every stage.</p>
            </div>
            <div className="hero-promises__card">
              <h3>A professional project page you can share</h3>
              <p>Your project gets a curated page with gallery, team, and collaboration board — a living document you can send to funders, venues, and partners.</p>
            </div>
            <div className="hero-promises__card">
              <h3>&quot;Not yet&quot; isn&apos;t a no</h3>
              <p>If your project isn&apos;t ready, you get specific guidance on what to strengthen — not a silent rejection. We want to see your work succeed.</p>
            </div>
          </div>
          <a href="/about" className="hero-intro__link">Learn how it works →</a>
        </div>
      </section>

      {/* Social proof */}
      <div className="social-proof">
        <span className="social-proof__stat">9 curated spatial projects</span>
        <span className="social-proof__divider" aria-hidden="true">&middot;</span>
        <span className="social-proof__stat">30+ collaboration roles</span>
        <span className="social-proof__divider" aria-hidden="true">&middot;</span>
        <span className="social-proof__stat">Immersive art, regenerative architecture, ecological design</span>
      </div>

      {/* Project Gallery with filtering */}
      <section id="projects">
        <ProjectGallery projects={projects} />
      </section>

      {/* Bottom CTA */}
      <section className="cta-bottom">
        <div className="cta-bottom__inner">
          <h2 className="cta-bottom__heading">Your expertise belongs on work that matters.</h2>
          <p className="cta-bottom__body">Whether you&apos;re a structural engineer, lighting designer, fabricator, grant writer, or spatial audio specialist — there are concept-ready projects here that need exactly what you do. This isn&apos;t a job board. It&apos;s a guild.</p>
          <div className="cta-bottom__actions">
            <a href="/collaborate" className="btn btn--primary btn--large">Find Your Role</a>
            <AuthAwareCTA
              loggedOutHref="/join"
              loggedOutLabel="Submit Your Project"
              loggedInHref="/dashboard/projects/new"
              loggedInLabel="Submit Your Project"
              className="btn btn--outline btn--large"
            />
          </div>
        </div>
      </section>
    </>
  )
}
