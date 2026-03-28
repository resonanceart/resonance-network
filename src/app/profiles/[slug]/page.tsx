import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { ProfileMediaGallery } from '@/components/profile/ProfileMediaGallery'
import { ProfileTimeline } from '@/components/profile/ProfileTimeline'
import { ProfileAvailabilityBadge } from '@/components/profile/ProfileAvailabilityBadge'
import { ProfileToolsMaterials } from '@/components/profile/ProfileToolsMaterials'
import { ProfileFeaturedWork } from '@/components/profile/ProfileFeaturedWork'
import { ProfileProjectCardEnhanced } from '@/components/profile/ProfileProjectCardEnhanced'
import { ProfileBlockRenderer } from '@/components/profile/ProfileBlockRenderer'
import { getProfiles, getProfileBySlug } from '@/lib/data'
import type { Profile } from '@/types'
import type { Metadata } from 'next'

export const revalidate = 60
export const dynamicParams = true

export async function generateStaticParams() {
  const profiles = await getProfiles()
  return profiles.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const profile = await getProfileBySlug(params.slug)
  if (!profile) return {}
  return {
    title: `${profile.name} — ${profile.title}`,
    description: profile.shortBio,
    alternates: {
      canonical: `https://resonance.network/profiles/${profile.slug}`,
    },
    openGraph: {
      title: `${profile.name} — ${profile.title}`,
      description: profile.shortBio,
      url: `https://resonance.network/profiles/${profile.slug}`,
      images: profile.photo ? [{ url: profile.photo }] : [],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${profile.name} — ${profile.title}`,
      description: profile.shortBio,
      images: profile.photo ? [profile.photo] : [],
    },
  }
}

function getPersonJsonLd(profile: Profile) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.title,
    description: profile.shortBio,
    url: `https://resonance.network/profiles/${profile.slug}`,
    image: profile.photo,
    email: profile.email || undefined,
    address: profile.location ? { '@type': 'PostalAddress', addressLocality: profile.location } : undefined,
    knowsAbout: profile.specialties,
    sameAs: profile.links.map(l => l.url),
  }
}

function getLinkIcon(type?: string) {
  switch (type) {
    case 'website':
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M1.5 8h13M8 1.5c1.5 1.5 2.5 3.5 2.5 6.5s-1 5-2.5 6.5c-1.5-1.5-2.5-3.5-2.5-6.5s1-5 2.5-6.5z" stroke="currentColor" strokeWidth="1.2"/>
        </svg>
      )
    case 'instagram':
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <rect x="1.5" y="1.5" width="13" height="13" rx="3.5" stroke="currentColor" strokeWidth="1.2"/>
          <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.2"/>
          <circle cx="12" cy="4" r="0.8" fill="currentColor"/>
        </svg>
      )
    case 'linkedin':
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <rect x="1.5" y="1.5" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M5 7v4M5 5v.01M7 11v-2.5c0-1 .5-1.5 1.5-1.5s1.5.5 1.5 1.5V11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      )
    default:
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M6.5 9.5l3-3M7 6.5H5.5a2.5 2.5 0 000 5H7M9 6.5h1.5a2.5 2.5 0 010 5H9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      )
  }
}

export default async function ProfilePage({ params }: { params: { slug: string } }) {
  const profile = await getProfileBySlug(params.slug)
  if (!profile) notFound()

  return (
    <article className="profile-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getPersonJsonLd(profile)) }}
      />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="breadcrumb container" style={{ paddingTop: 'var(--space-4)' }}>
        <Link href="/">Home</Link> <span aria-hidden="true">/</span> <Link href="/profiles">People</Link> <span aria-hidden="true">/</span> <span>{profile.name}</span>
      </nav>

      {/* Cover Banner */}
      <section className="profile-banner">
        {profile.coverImage && (
          <Image
            src={profile.coverImage}
            alt={`Cover image for ${profile.name}`}
            fill
            priority
            sizes="100vw"
            style={{ objectFit: 'cover' }}
          />
        )}
        <div className="profile-banner__overlay" />
      </section>

      {/* Profile Header — overlaps banner */}
      <section className="profile-header">
        <div className="container">
          <div className="profile-header__inner">
            <div className="profile-header__avatar">
              <Image
                src={profile.photo}
                alt={`Photo of ${profile.name}`}
                width={200}
                height={200}
                priority
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div className="profile-header__info">
              <h1 className="profile-header__name">{profile.name}</h1>
              <p className="profile-header__title">{profile.title}</p>
              {profile.location && (
                <p className="profile-header__location">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M7 1C4.5 1 2.5 3 2.5 5.5C2.5 9 7 13 7 13s4.5-4 4.5-7.5C11.5 3 9.5 1 7 1z" stroke="currentColor" strokeWidth="1.2"/>
                    <circle cx="7" cy="5.5" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
                  </svg>
                  {profile.location}
                </p>
              )}
              {profile.availabilityStatus && (
                <ProfileAvailabilityBadge status={profile.availabilityStatus} note={profile.availabilityNote} />
              )}
            </div>
            <div className="profile-header__actions">
              {profile.email && (
                <a
                  href={`mailto:${profile.email}?subject=Collaboration%20Inquiry%20via%20Resonance%20Network`}
                  className="btn btn--primary"
                >
                  Get in Touch
                </a>
              )}
              {profile.links.length > 0 && (
                <a
                  href={profile.links[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--outline"
                >
                  Visit Website
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section className="profile-specialties">
        <div className="container">
          <div className="profile-specialties__list">
            {profile.specialties.map(s => (
              <Badge key={s} variant="domain">{s}</Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Content: Block-based or Legacy */}
      {profile.contentBlocks && profile.contentBlocks.length > 0 ? (
        <div className="profile-blocks">
          {profile.contentBlocks
            .filter(b => b.visible !== false)
            .sort((a, b) => a.order - b.order)
            .map(block => (
              <ProfileBlockRenderer key={block.id} block={block} />
            ))
          }
        </div>
      ) : (
        <>
          {/* Tools & Materials */}
          {profile.toolsAndMaterials && profile.toolsAndMaterials.length > 0 && (
            <section className="profile-tools-section">
              <div className="container">
                <ProfileToolsMaterials tools={profile.toolsAndMaterials} />
              </div>
            </section>
          )}

          {/* Featured Work */}
          {profile.projects.some(p => p.isFeatured) && (
            <section className="profile-featured-section">
              <div className="container">
                <p className="section-label">Featured Work</p>
                <ProfileFeaturedWork projects={profile.projects.filter(p => p.isFeatured)} />
              </div>
            </section>
          )}

          {/* Media Gallery */}
          {profile.mediaGallery && profile.mediaGallery.length > 0 && (
            <section className="profile-gallery-section">
              <div className="container">
                <p className="section-label">Gallery</p>
                <ProfileMediaGallery items={profile.mediaGallery} />
              </div>
            </section>
          )}

          {/* About / Bio */}
          <section className="profile-about">
            <div className="container">
              <p className="section-label">About</p>
              <div className="profile-about__text">
                {profile.bio.split('\n\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>
          </section>

          {/* Philosophy */}
          {profile.philosophy && (
            <section className="profile-philosophy">
              <div className="container">
                <p className="section-label">Approach</p>
                <blockquote className="profile-philosophy__quote">
                  <p>{profile.philosophy}</p>
                </blockquote>
              </div>
            </section>
          )}

          {/* Timeline */}
          {profile.timeline && profile.timeline.length > 0 && (
            <section className="profile-timeline-section">
              <div className="container">
                <p className="section-label">Timeline</p>
                <h2>Career &amp; Milestones</h2>
                <ProfileTimeline entries={profile.timeline} />
              </div>
            </section>
          )}

          {/* All Projects (non-featured) */}
          {profile.projects.filter(p => !p.isFeatured).length > 0 && (
            <section className="profile-work">
              <div className="container">
                <p className="section-label">Work</p>
                <h2>All Projects</h2>
                <div className="profile-work__grid">
                  {profile.projects.filter(p => !p.isFeatured).map((project, i) => (
                    <ProfileProjectCardEnhanced key={i} project={project} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Achievements */}
          {profile.achievements && profile.achievements.length > 0 && (
            <section className="profile-achievements">
              <div className="container">
                <p className="section-label">Recognition</p>
                <ul className="profile-achievements__list">
                  {profile.achievements.map((a, i) => (
                    <li key={i}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.5l-3.7 1.8.7-4.1-3-2.9 4.2-.7L8 1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                      </svg>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* Links */}
          {profile.links.length > 0 && (
            <section className="profile-links-section">
              <div className="container">
                <p className="section-label">Connect</p>
                <div className="profile-links-row">
                  {profile.links.map(link => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="profile-link-btn"
                      aria-label={link.label}
                    >
                      {getLinkIcon(link.type)}
                      <span>{link.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* CTA */}
      <section className="profile-cta">
        <div className="container">
          <h2>Work with {profile.name.split(' ')[0]}</h2>
          <p>Interested in collaborating or learning more about upcoming projects?</p>
          <div className="profile-cta__actions">
            {profile.email && (
              <a
                href={`mailto:${profile.email}?subject=Collaboration%20Inquiry%20via%20Resonance%20Network`}
                className="btn btn--primary btn--large"
              >
                Get in Touch
              </a>
            )}
            <Link href="/collaborate" className="btn btn--outline btn--large">
              Browse Open Roles
            </Link>
          </div>
        </div>
      </section>
    </article>
  )
}
