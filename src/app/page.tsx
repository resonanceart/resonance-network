import Image from 'next/image'
import Link from 'next/link'
import { ProjectGallery } from '@/components/ProjectGallery'
import { AuthAwareCTA } from '@/components/AuthAwareCTA'
import { getProjects } from '@/lib/data'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Resonance Network — Connecting Community Through Passion and Purpose',
  description: 'Resonance Network connects creators, collaborators, and communities at the intersection of immersive art, regenerative design, and ecological innovation.',
  alternates: {
    canonical: 'https://resonance.network',
  },
  openGraph: {
    title: 'Resonance Network — Connecting Community Through Passion and Purpose',
    description: 'Resonance Network connects creators, collaborators, and communities at the intersection of immersive art, regenerative design, and ecological innovation.',
    url: 'https://resonance.network',
    type: 'website',
    images: [{ url: '/og-image.jpg' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Resonance Network — Connecting Community Through Passion and Purpose',
    description: 'Resonance Network connects creators, collaborators, and communities at the intersection of immersive art, regenerative design, and ecological innovation.',
    images: [{ url: '/og-image.jpg' }],
  },
}

export const revalidate = 60

export default async function HomePage() {
  const projects = await getProjects()

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

      {/* Project Gallery with filter tabs */}
      <section id="projects">
        <ProjectGallery projects={projects} />
      </section>

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
