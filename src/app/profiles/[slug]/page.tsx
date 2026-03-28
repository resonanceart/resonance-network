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
import { ProfileSkillsDisplay } from '@/components/profile/ProfileSkillsDisplay'
import { ProfileToolsDisplay } from '@/components/profile/ProfileToolsDisplay'
import { ProfileHeaderClient } from '@/components/profile/ProfileHeaderClient'
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

function getSocialIcon(platform: string) {
  switch (platform) {
    case 'instagram':
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <rect x="1.5" y="1.5" width="15" height="15" rx="4" stroke="currentColor" strokeWidth="1.3"/>
          <circle cx="9" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.3"/>
          <circle cx="13.5" cy="4.5" r="1" fill="currentColor"/>
        </svg>
      )
    case 'linkedin':
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <rect x="1.5" y="1.5" width="15" height="15" rx="2" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M5.5 8v4.5M5.5 5.5v.01M8 12.5V9.5c0-1.2.6-1.8 1.7-1.8 1.1 0 1.6.6 1.6 1.8v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      )
    case 'behance':
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M2 5h4c1.7 0 2.5 1 2.5 2.2 0 .9-.5 1.5-1.2 1.8 1 .3 1.5 1.1 1.5 2.1 0 1.5-1 2.4-2.8 2.4H2V5z" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M10.5 10.5h5c0-1.7-1-3-2.5-3s-2.5 1.3-2.5 3c0 1.7 1 3 2.5 3 1 0 1.8-.5 2.2-1.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          <path d="M10.5 5.5h4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      )
    case 'artstation':
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M2.5 13.5L7 4.5h4l4.5 9h-3L11 10.5H5.5L4 13.5H2.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
          <path d="M13 10.5l2 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      )
    case 'dribbble':
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M2.5 7c2 0 5 .5 7.5-1s3.5-3.5 4-4.5M2 10c3-1 6-1 9 1s4.5 3 5 4M6 2.5c0 3 1 7 4 10s5 3.5 6 3.5" stroke="currentColor" strokeWidth="1.3"/>
        </svg>
      )
    case 'github':
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M9 1.5C4.9 1.5 1.5 4.9 1.5 9c0 3.3 2.1 6.1 5.1 7.1.4.1.5-.2.5-.4v-1.3c-2.1.5-2.5-1-2.5-1-.3-.8-.8-1.1-.8-1.1-.7-.5.1-.5.1-.5.7.1 1.1.7 1.1.7.6 1.1 1.7.8 2.1.6.1-.5.3-.8.5-.9-1.7-.2-3.4-.8-3.4-3.8 0-.8.3-1.5.7-2-.1-.2-.3-1 .1-2 0 0 .6-.2 2 .7.6-.2 1.2-.3 1.8-.3s1.2.1 1.8.3c1.4-.9 2-.7 2-.7.4 1 .2 1.8.1 2 .5.5.7 1.2.7 2 0 3-1.7 3.6-3.4 3.8.3.2.5.7.5 1.4v2.1c0 .2.1.5.5.4 3-1 5.1-3.8 5.1-7.1C16.5 4.9 13.1 1.5 9 1.5z" stroke="currentColor" strokeWidth="1.1"/>
        </svg>
      )
    case 'vimeo':
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M2 7c.2 2 1.5 3.8 2.5 4.8C6 13.3 8 15 10 15c2 0 3.5-1.5 4.5-4.5 1-3 1-4.5.5-5.5s-1.5-1.5-3-1c-1 .3-1.8 1.2-2 2.5.5-.3 1-.4 1.5-.2.5.2.5.7.3 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      )
    case 'soundcloud':
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M1.5 11V9M3.5 12V8M5.5 13V7M7.5 13V6M9.5 13V5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          <path d="M11 5c2.5 0 4.5 1.8 4.5 4s-2 4-4.5 4" stroke="currentColor" strokeWidth="1.3"/>
        </svg>
      )
    case 'spotify':
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M5 7.5c2.5-1 5.5-.8 8 .5M5.5 10c2-0.8 4.5-.6 6.5.4M6 12.5c1.5-.6 3.5-.5 5 .3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      )
    case 'youtube':
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <rect x="1.5" y="3.5" width="15" height="11" rx="3" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M7.5 6.5l4 2.5-4 2.5V6.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
        </svg>
      )
    case 'x':
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M2.5 2.5l5.2 7L2.5 15.5h1.3l4.5-5.2 3.7 5.2h4.5L11 8.2l4.5-5.7h-1.3L10.3 7.2 7 2.5H2.5z" stroke="currentColor" strokeWidth="1.1"/>
        </svg>
      )
    case 'tiktok':
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M10 2v9a3 3 0 11-2.5-2.96" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          <path d="M10 5c1 1 2.5 1.5 4 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      )
    default:
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M2 9h14M9 2c2 2 3 4.5 3 7s-1 5-3 7c-2-2-3-4.5-3-7s1-5 3-7z" stroke="currentColor" strokeWidth="1.3"/>
        </svg>
      )
  }
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map(w => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

const DEFAULT_SECTION_ORDER = ['skills', 'tools', 'portfolio', 'gallery', 'about', 'timeline', 'projects', 'achievements', 'links']

export default async function ProfilePage({ params }: { params: { slug: string } }) {
  const profileData = await getProfileBySlug(params.slug)
  if (!profileData) notFound()
  const profile: Profile = profileData

  const accentColor = profile.accent_color || '#01696F'
  const sectionOrder = profile.section_order || DEFAULT_SECTION_ORDER
  const sectionVisibility = profile.section_visibility || {}

  const coverPositionStyle = profile.cover_position
    ? `${profile.cover_position.x}% ${profile.cover_position.y}%`
    : 'center center'
  const coverScale = profile.cover_position?.scale || 1

  // Determine location display
  const locationDisplay = [profile.location, profile.location_secondary]
    .filter(Boolean)
    .join(' / ')

  // Build section renderers
  function renderSection(key: string) {
    // Skip if explicitly hidden
    if (sectionVisibility[key] === false) return null

    switch (key) {
      case 'skills':
        if (profile.profile_skills && profile.profile_skills.length > 0) {
          return (
            <div key={key} data-section={key}>
              <section className="profile-skills-section">
                <div className="container">
                  <p className="section-label">Skills</p>
                  <ProfileSkillsDisplay skills={profile.profile_skills} />
                </div>
              </section>
            </div>
          )
        }
        // Fallback: show specialties as skills if no profile_skills
        if (profile.specialties.length > 0 && !profile.profile_skills) {
          return (
            <div key={key} data-section={key}>
              <section className="profile-specialties">
                <div className="container">
                  <p className="section-label">Specialties</p>
                  <div className="profile-specialties__list">
                    {profile.specialties.map(s => (
                      <Badge key={s} variant="domain">{s}</Badge>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )
        }
        return null

      case 'tools':
        if (profile.profile_tools && profile.profile_tools.length > 0) {
          return (
            <div key={key} data-section={key}>
              <section className="profile-tools-section">
                <div className="container">
                  <p className="section-label">Tools</p>
                  <ProfileToolsDisplay tools={profile.profile_tools} />
                </div>
              </section>
            </div>
          )
        }
        // Fallback: show legacy toolsAndMaterials
        if (profile.toolsAndMaterials && profile.toolsAndMaterials.length > 0) {
          return (
            <div key={key} data-section={key}>
              <section className="profile-tools-section">
                <div className="container">
                  <ProfileToolsMaterials tools={profile.toolsAndMaterials} />
                </div>
              </section>
            </div>
          )
        }
        return null

      case 'portfolio':
        if (profile.projects.some(p => p.isFeatured)) {
          return (
            <div key={key} data-section={key}>
              <section className="profile-featured-section">
                <div className="container">
                  <p className="section-label">Featured Work</p>
                  <ProfileFeaturedWork projects={profile.projects.filter(p => p.isFeatured)} />
                </div>
              </section>
            </div>
          )
        }
        return null

      case 'gallery':
        if (profile.mediaGallery && profile.mediaGallery.length > 0) {
          return (
            <div key={key} data-section={key}>
              <section className="profile-gallery-section">
                <div className="container">
                  <p className="section-label">Gallery</p>
                  <ProfileMediaGallery items={profile.mediaGallery} />
                </div>
              </section>
            </div>
          )
        }
        return null

      case 'about':
        return (
          <div key={key} data-section={key}>
            {profile.artist_statement && (
              <section className="profile-philosophy">
                <div className="container">
                  <p className="section-label">Artist Statement</p>
                  <blockquote className="profile-philosophy__quote">
                    <p>{profile.artist_statement}</p>
                  </blockquote>
                </div>
              </section>
            )}
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
          </div>
        )

      case 'timeline':
        if (profile.timeline && profile.timeline.length > 0) {
          return (
            <div key={key} data-section={key}>
              <section className="profile-timeline-section">
                <div className="container">
                  <p className="section-label">Timeline</p>
                  <h2>Career &amp; Milestones</h2>
                  <ProfileTimeline entries={profile.timeline} />
                </div>
              </section>
            </div>
          )
        }
        return null

      case 'projects':
        if (profile.projects.filter(p => !p.isFeatured).length > 0) {
          return (
            <div key={key} data-section={key}>
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
            </div>
          )
        }
        return null

      case 'achievements':
        if (profile.achievements && profile.achievements.length > 0) {
          return (
            <div key={key} data-section={key}>
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
            </div>
          )
        }
        return null

      case 'links':
        if (profile.links.length > 0) {
          return (
            <div key={key} data-section={key}>
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
            </div>
          )
        }
        return null

      default:
        return null
    }
  }

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
      <section
        className="profile-banner"
        style={
          profile.coverImage
            ? undefined
            : {
                background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}cc 50%, ${accentColor}88 100%)`,
              }
        }
      >
        {profile.coverImage && (
          <Image
            src={profile.coverImage}
            alt={`Cover image for ${profile.name}`}
            fill
            priority
            sizes="100vw"
            style={{
              objectFit: 'cover',
              objectPosition: coverPositionStyle,
              transform: coverScale !== 1 ? `scale(${coverScale})` : undefined,
            }}
          />
        )}
        <div className="profile-banner__overlay" />
      </section>

      {/* Profile Header — left-aligned, avatar overlaps cover */}
      <section className="profile-header profile-header--enhanced">
        <div className="container">
          <div className="profile-header__inner profile-header__inner--left">
            {/* Avatar */}
            <div className="profile-header__avatar profile-header__avatar--overlap">
              {profile.photo ? (
                <Image
                  src={profile.photo}
                  alt={`Photo of ${profile.name}`}
                  width={120}
                  height={120}
                  priority
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div
                  className="profile-header__initials"
                  style={{ backgroundColor: accentColor }}
                >
                  {getInitials(profile.name)}
                </div>
              )}
            </div>

            {/* Info + CTAs + Social */}
            <div className="profile-header__content">
              <div className="profile-header__info profile-header__info--left">
                <h1 className="profile-header__name">
                  {profile.name}
                  {profile.pronouns && (
                    <span className="profile-header__pronouns">({profile.pronouns})</span>
                  )}
                </h1>
                <p className="profile-header__title">{profile.title}</p>
                {locationDisplay && (
                  <p className="profile-header__location">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path d="M7 1C4.5 1 2.5 3 2.5 5.5C2.5 9 7 13 7 13s4.5-4 4.5-7.5C11.5 3 9.5 1 7 1z" stroke="currentColor" strokeWidth="1.2"/>
                      <circle cx="7" cy="5.5" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
                    </svg>
                    {locationDisplay}
                  </p>
                )}
                {profile.availabilityStatus && (
                  <ProfileAvailabilityBadge status={profile.availabilityStatus} note={profile.availabilityNote} />
                )}
              </div>

              {/* CTA Buttons */}
              <ProfileHeaderClient
                profileName={profile.name}
                profileSlug={profile.slug}
                ctaPrimaryLabel={profile.cta_primary_label || 'Get in Touch'}
                ctaPrimaryAction={profile.cta_primary_action || 'contact'}
                ctaPrimaryUrl={profile.cta_primary_url}
                ctaSecondaryLabel={profile.cta_secondary_label || 'Visit Website'}
                ctaSecondaryAction={profile.cta_secondary_action || 'url'}
                ctaSecondaryUrl={profile.cta_secondary_url || profile.links?.[0]?.url}
                profileEmail={profile.email}
              />

              {/* Social Links */}
              {profile.social_links && profile.social_links.length > 0 && (
                <div className="profile-header__social">
                  {[...profile.social_links]
                    .sort((a, b) => a.display_order - b.display_order)
                    .map(link => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="profile-header__social-btn"
                        title={link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                        aria-label={link.platform}
                      >
                        {getSocialIcon(link.platform)}
                      </a>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content: Block-based or Legacy with dynamic section ordering */}
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
          {sectionOrder.map(key => renderSection(key))}
        </>
      )}

      {/* CTA — always at bottom */}
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
