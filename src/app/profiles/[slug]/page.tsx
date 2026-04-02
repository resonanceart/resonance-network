import { notFound } from 'next/navigation'
// Using raw <img> tags instead of next/image for Supabase Storage URLs
import { ProfileTimeline } from '@/components/profile/ProfileTimeline'
import { ProfileAvailabilityBadge } from '@/components/profile/ProfileAvailabilityBadge'
import { ProfileSmartGallery } from '@/components/profile/ProfileSmartGallery'
import { ProfileEditOverlay } from '@/components/profile/ProfileEditOverlay'
import { ShareProfile } from '@/components/profile/ShareProfile'
import { ProfileBadges } from '@/components/profile/ProfileBadges'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getProfiles, getProfileBySlug } from '@/lib/data'
import type { Profile, WorkExperience } from '@/types'
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
      images: profile.photo ? [{ url: profile.photo }] : [{ url: '/og-image.jpg' }],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${profile.name} — ${profile.title}`,
      description: profile.shortBio,
      images: profile.photo ? [profile.photo] : ['/og-image.jpg'],
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
    case 'facebook':
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M16.5 9a7.5 7.5 0 10-8.67 7.41v-5.24H5.98V9h1.85V7.34c0-1.83 1.09-2.84 2.76-2.84.8 0 1.63.14 1.63.14v1.8h-.92c-.9 0-1.19.56-1.19 1.14V9h2.03l-.32 2.17h-1.71v5.24A7.5 7.5 0 0016.5 9z" stroke="currentColor" strokeWidth="1.1"/>
        </svg>
      )
    case 'linktree':
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M9 2v14M5 6l4-4 4 4M5 10h8M6.5 14h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
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

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatExpDate(dateStr?: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`
}

function formatExpRange(start?: string, end?: string, isCurrent?: boolean): string {
  const s = start ? formatExpDate(start) : ''
  const e = isCurrent ? 'Present' : end ? formatExpDate(end) : ''
  if (s && e) return `${s} — ${e}`
  if (s) return s
  return ''
}

function getExpInitials(org?: string, title?: string): string {
  const text = org || title || ''
  return text
    .split(' ')
    .map(w => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function WorkExperienceSection({ entries }: { entries: WorkExperience[] }) {
  const workEntries = entries
    .filter(e => e.type === 'employment' || e.type === 'freelance')
    .sort((a, b) => {
      if (a.start_date && b.start_date) return b.start_date.localeCompare(a.start_date)
      if (a.start_date) return -1
      return 1
    })

  const eduEntries = entries
    .filter(e => e.type === 'education')
    .sort((a, b) => {
      if (a.start_date && b.start_date) return b.start_date.localeCompare(a.start_date)
      if (a.start_date) return -1
      return 1
    })

  function renderEntries(items: WorkExperience[]) {
    return (
      <div className="we-public-list">
        {items.map(entry => (
          <div key={entry.id} className="we-public-entry">
            <div className="we-public-entry__icon">
              <span className="we-public-entry__initials">
                {getExpInitials(entry.organization, entry.title)}
              </span>
            </div>
            <div className="we-public-entry__content">
              <div className="we-public-entry__title">
                {entry.title}
                {entry.is_current && (
                  <span className="we-public-entry__current-badge">Current</span>
                )}
              </div>
              {entry.organization && (
                <div className="we-public-entry__org">{entry.organization}</div>
              )}
              <div className="we-public-entry__meta">
                {formatExpRange(entry.start_date, entry.end_date, entry.is_current)}
                {entry.location && (
                  <>{entry.start_date ? ' · ' : ''}{entry.location}</>
                )}
              </div>
              {entry.description && (
                <div className="we-public-entry__desc">{entry.description}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <section className="profile-work-experience">
      <div className="container">
        <p className="section-label">Experience</p>
        {workEntries.length > 0 && (
          <div className="we-public-section">
            <h3 className="we-public-section__title">Work Experience</h3>
            {renderEntries(workEntries)}
          </div>
        )}
        {eduEntries.length > 0 && (
          <div className="we-public-section">
            <h3 className="we-public-section__title">Education</h3>
            {renderEntries(eduEntries)}
          </div>
        )}
      </div>
    </section>
  )
}

export default async function ProfilePage({ params }: { params: { slug: string } }) {
  const profileData = await getProfileBySlug(params.slug)
  if (!profileData) notFound()
  const profile: Profile = profileData

  // Detect profile owner
  let isOwner = false
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    isOwner = !!(user && profile.supabaseId === user.id)
  } catch {
    // Not logged in or error — not owner
  }

  const accentColor = profile.accent_color || '#01696F'

  const coverPositionStyle = profile.cover_position
    ? `${profile.cover_position.x}% ${profile.cover_position.y}%`
    : 'center center'
  const coverScale = profile.cover_position?.scale || 1

  // Determine location display
  const locationDisplay = [profile.location, profile.location_secondary]
    .filter(Boolean)
    .join(' / ')

  return (
    <ProfileEditOverlay
      profileId={profile.id}
      profileSlug={profile.slug}
      isOwner={isOwner}
      hasAvatar={!!profile.photo}
      hasBio={!!(profile.bio && profile.bio.length > 50)}
      hasSkills={!!(profile.profile_skills && profile.profile_skills.length >= 3) || profile.specialties.length >= 3}
      hasAvailability={!!profile.availabilityStatus}
      hasCover={!!profile.coverImage}
      hasWork={!!(profile.past_work && profile.past_work.length > 0)}
    >
    <article className="profile-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getPersonJsonLd(profile)) }}
      />

      {/* Row 1: Banner */}
      <section
        className="profile-banner"
        data-editable="cover"
        style={profile.coverImage ? undefined : { background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}cc 50%, ${accentColor}88 100%)` }}
      >
        {profile.coverImage && (
          <img src={profile.coverImage} alt={`Cover image for ${profile.name}`}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: coverPositionStyle, transform: coverScale !== 1 ? `scale(${coverScale})` : undefined }} />
        )}
        <div className="profile-banner__overlay" />
      </section>

      {/* Row 2: 2-Column Header Grid (photo+meta left, info right) */}
      <section className="profile-header-grid-section">
        <div className="container">
          <div className="profile-header-grid">
            {/* Col 1: Photo + Skills/Location/Social underneath */}
            <div>
              <div className="profile-header-grid__photo" data-editable="avatar">
                {profile.photo && profile.photo !== '/assets/images/team/placeholder.svg' ? (
                  <img src={profile.photo} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div className="profile-header-grid__initials" style={{ backgroundColor: accentColor }}>{getInitials(profile.name)}</div>
                )}
              </div>
              {/* Skills, Location, Availability, Social — under the photo */}
              <div style={{ marginTop: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>
                {locationDisplay && (
                  <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M7 1C4.5 1 2.5 3 2.5 5.5C2.5 9 7 13 7 13s4.5-4 4.5-7.5C11.5 3 9.5 1 7 1z" stroke="currentColor" strokeWidth="1.2"/><circle cx="7" cy="5.5" r="1.5" stroke="currentColor" strokeWidth="1.2"/></svg>
                    {locationDisplay}
                  </p>
                )}
                {profile.availabilityStatus && (
                  <div style={{ marginBottom: 'var(--space-2)' }} data-editable="availability">
                    <ProfileAvailabilityBadge status={profile.availabilityStatus} note={profile.availabilityNote} />
                  </div>
                )}
                {profile.profile_skills && profile.profile_skills.length > 0 ? (
                  <div style={{ marginBottom: 'var(--space-2)' }} data-editable="skills">
                    <p className="profile-header-grid__sidebar-label">Skills</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {[...profile.profile_skills].sort((a, b) => a.display_order - b.display_order).map(skill => (
                        <span key={skill.id} className="profile-skill-tag" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>{skill.skill_name}</span>
                      ))}
                    </div>
                  </div>
                ) : profile.specialties.length > 0 ? (
                  <div style={{ marginBottom: 'var(--space-2)' }} data-editable="skills">
                    <p className="profile-header-grid__sidebar-label">Specialties</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {profile.specialties.map(s => <span key={s} className="profile-skill-tag" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>{s}</span>)}
                    </div>
                  </div>
                ) : null}
                {profile.profile_tools && profile.profile_tools.length > 0 && (
                  <div style={{ marginBottom: 'var(--space-2)' }}>
                    <p className="profile-header-grid__sidebar-label">Tools</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {[...profile.profile_tools].sort((a, b) => a.display_order - b.display_order).map(tool => (
                        <span key={tool.id} className="profile-skill-tag profile-skill-tag--tool" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>{tool.tool_name}</span>
                      ))}
                    </div>
                  </div>
                )}
                {profile.social_links && profile.social_links.length > 0 && (
                  <div style={{ marginTop: 'var(--space-2)' }} data-editable="links">
                    <p className="profile-header-grid__sidebar-label">Social</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {[...profile.social_links].sort((a, b) => a.display_order - b.display_order).map(link => (
                        <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" title={link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                          style={{ width: 36, height: 36, minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)', textDecoration: 'none' }}>
                          {getSocialIcon(link.platform)}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {profile.richBadges && profile.richBadges.length > 0 && (
                  <div style={{ marginTop: 'var(--space-3)' }}>
                    <p className="profile-header-grid__sidebar-label">Badges</p>
                    <ProfileBadges badges={profile.richBadges} />
                  </div>
                )}
              </div>
            </div>

            {/* Col 2: Info (full remaining space) */}
            <div className="profile-header-grid__info" data-editable="identity">
              <h1 className="profile-header-grid__name">
                <span>
                  {profile.name}
                  {profile.pronouns && <span className="profile-header-grid__pronouns"> ({profile.pronouns})</span>}
                </span>
              </h1>
              <p className="profile-header-grid__title">{profile.title}</p>

              {(profile.primary_website_url || profile.links.find(l => l.type === 'website') || profile.resume_url || profile.portfolio_pdf_url) && (
                <div className="profile-link-buttons">
                  {(profile.primary_website_url || profile.links.find(l => l.type === 'website')) && (
                    <a href={profile.primary_website_url || profile.links.find(l => l.type === 'website')?.url} target="_blank" rel="noopener noreferrer" className="profile-link-btn--pill">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="8" cy="8" r="6.5"/><path d="M1.5 8h13M8 1.5c1.5 1.5 2.5 3.5 2.5 6.5s-1 5-2.5 6.5c-1.5-1.5-2.5-3.5-2.5-6.5s1-5 2.5-6.5z"/></svg>
                      Website
                    </a>
                  )}
                  {profile.resume_url && (
                    <a href={profile.resume_url} target="_blank" rel="noopener noreferrer" className="profile-link-btn--pill" download>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      Resume
                    </a>
                  )}
                  {profile.portfolio_pdf_url && (
                    <a href={profile.portfolio_pdf_url} target="_blank" rel="noopener noreferrer" className="profile-link-btn--pill" download>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
                      Portfolio
                    </a>
                  )}
                </div>
              )}

              {profile.bio && (
                <div className="profile-header-grid__bio" data-editable="bio">
                  {profile.bio.split('\n\n').map((paragraph, i) => <p key={i}>{paragraph}</p>)}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Media Gallery — before artist statement, matching preview */}
      <ProfileSmartGallery profile={profile} />

      {/* Artist Statement — after gallery, matching preview */}
      {(profile.artist_statement || profile.philosophy) && (
        <section className="profile-two-col-section">
          <div className="container">
            <p className="section-label">Artist Statement</p>
            <div className="profile-two-col__text">
              {profile.artist_statement && profile.artist_statement.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
              {profile.philosophy && profile.philosophy.split('\n\n').map((p, i) => <p key={`ph-${i}`}>{p}</p>)}
            </div>
          </div>
        </section>
      )}

      {/* Row 5: Milestones */}
      {((profile.work_experience && profile.work_experience.length > 0) || (profile.timeline && profile.timeline.length > 0)) && (
        <section className="profile-milestones-section">
          <div className="container">
            <p className="section-label">Milestones</p>
            {profile.work_experience && profile.work_experience.length > 0 && (
              <WorkExperienceSection entries={profile.work_experience} />
            )}
            {profile.timeline && profile.timeline.length > 0 && (
              <ProfileTimeline entries={profile.timeline} />
            )}
          </div>
        </section>
      )}

      {/* Share Profile */}
      <section className="container" style={{ paddingBottom: 'var(--space-8)' }}>
        <ShareProfile slug={profile.slug} displayName={profile.name} />
      </section>
    </article>
    </ProfileEditOverlay>
  )
}
