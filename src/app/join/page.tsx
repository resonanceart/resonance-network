import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Join the Network',
  description: 'Join Resonance Network as a project creator or skilled collaborator. Submit your immersive art or regenerative architecture project, or offer your expertise.',
  alternates: {
    canonical: 'https://resonance.network/join',
  },
  openGraph: {
    title: 'Join Resonance Network',
    description: 'Whether you bring a project or offer expertise, there is a place for you here.',
    url: 'https://resonance.network/join',
    type: 'website',
    images: [{ url: '/og-image.jpg' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Join Resonance Network',
    description: 'Submit a project or join as a collaborator on immersive art and regenerative architecture.',
    images: [{ url: '/og-image.jpg' }],
  },
}

export default function JoinPage() {
  return (
    <>
      <section className="join-hero">
        <div className="container">
          <p className="section-label">Get Involved</p>
          <h1>Join Resonance Network</h1>
          <p className="join-hero__sub">Whether you&apos;re bringing a project or offering your expertise, there&apos;s a place for you here.</p>
        </div>
      </section>

      <section className="join-paths">
        <div className="container">
          <div className="join-cards">
            {/* Card 1: Submit a Project */}
            <div className="join-card join-card--project">
              <div className="join-card__icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="7" height="7" rx="1"/>
                  <rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/>
                  <rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
              </div>
              <h2>Submit a Project</h2>
              <p className="join-card__desc">You have a large-scale creative project — immersive art, regenerative architecture, ecological design — and you need collaborators, expertise, or pathways to make it real.</p>
              <p className="join-card__outcome">We&apos;ll create your project page and artist profile on the network.</p>
              <ul className="join-card__benefits">
                <li>Project page with gallery and overview</li>
                <li>Artist profile on the network</li>
                <li>Collaboration board listing for open roles</li>
                <li>Visibility to funders and curators</li>
              </ul>
              <Link href="/submit" className="btn btn--primary btn--large join-card__cta">
                Submit a Project &rarr;
              </Link>
            </div>

            {/* Card 2: Join as Collaborator */}
            <div className="join-card join-card--collaborator">
              <div className="join-card__icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <h2>Join as Collaborator</h2>
              <p className="join-card__desc">You&apos;re an engineer, fabricator, designer, grant writer, or specialist looking for meaningful projects that match your skills and values.</p>
              <p className="join-card__outcome">We&apos;ll create your collaborator profile so project teams can find you.</p>
              <ul className="join-card__benefits">
                <li>Collaborator profile on the network</li>
                <li>Access to open roles on curated projects</li>
                <li>Direct connection to project teams</li>
                <li>Skill-matched project alerts</li>
              </ul>
              <Link href="/collaborate" className="btn btn--primary btn--large join-card__cta">
                Create Your Profile &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
