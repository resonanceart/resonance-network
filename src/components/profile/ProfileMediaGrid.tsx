import type { Profile } from '@/types'

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return url
  }
}

function getSocialIconSmall(platform: string) {
  switch (platform) {
    case 'instagram':
      return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1.5" y="1.5" width="15" height="15" rx="4" stroke="currentColor" strokeWidth="1.3"/><circle cx="9" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="13.5" cy="4.5" r="1" fill="currentColor"/></svg>
    case 'linkedin':
      return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1.5" y="1.5" width="15" height="15" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M5.5 8v4.5M5.5 5.5v.01M8 12.5V9.5c0-1.2.6-1.8 1.7-1.8 1.1 0 1.6.6 1.6 1.8v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
    case 'behance':
      return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 5h4c1.7 0 2.5 1 2.5 2.2 0 .9-.5 1.5-1.2 1.8 1 .3 1.5 1.1 1.5 2.1 0 1.5-1 2.4-2.8 2.4H2V5z" stroke="currentColor" strokeWidth="1.3"/><path d="M10.5 10.5h5c0-1.7-1-3-2.5-3s-2.5 1.3-2.5 3c0 1.7 1 3 2.5 3 1 0 1.8-.5 2.2-1.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M10.5 5.5h4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
    case 'github':
      return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 1.5C4.9 1.5 1.5 4.9 1.5 9c0 3.3 2.1 6.1 5.1 7.1.4.1.5-.2.5-.4v-1.3c-2.1.5-2.5-1-2.5-1-.3-.8-.8-1.1-.8-1.1-.7-.5.1-.5.1-.5.7.1 1.1.7 1.1.7.6 1.1 1.7.8 2.1.6.1-.5.3-.8.5-.9-1.7-.2-3.4-.8-3.4-3.8 0-.8.3-1.5.7-2-.1-.2-.3-1 .1-2 0 0 .6-.2 2 .7.6-.2 1.2-.3 1.8-.3s1.2.1 1.8.3c1.4-.9 2-.7 2-.7.4 1 .2 1.8.1 2 .5.5.7 1.2.7 2 0 3-1.7 3.6-3.4 3.8.3.2.5.7.5 1.4v2.1c0 .2.1.5.5.4 3-1 5.1-3.8 5.1-7.1C16.5 4.9 13.1 1.5 9 1.5z" stroke="currentColor" strokeWidth="1.1"/></svg>
    case 'youtube':
      return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1.5" y="3.5" width="15" height="11" rx="3" stroke="currentColor" strokeWidth="1.3"/><path d="M7.5 6.5l4 2.5-4 2.5V6.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>
    case 'x':
      return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2.5 2.5l5.2 7L2.5 15.5h1.3l4.5-5.2 3.7 5.2h4.5L11 8.2l4.5-5.7h-1.3L10.3 7.2 7 2.5H2.5z" stroke="currentColor" strokeWidth="1.1"/></svg>
    case 'tiktok':
      return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M10 2v9a3 3 0 11-2.5-2.96" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M10 5c1 1 2.5 1.5 4 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
    case 'vimeo':
      return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 7c.2 2 1.5 3.8 2.5 4.8C6 13.3 8 15 10 15c2 0 3.5-1.5 4.5-4.5 1-3 1-4.5.5-5.5s-1.5-1.5-3-1c-1 .3-1.8 1.2-2 2.5.5-.3 1-.4 1.5-.2.5.2.5.7.3 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
    case 'spotify':
      return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.3"/><path d="M5 7.5c2.5-1 5.5-.8 8 .5M5.5 10c2-.8 4.5-.6 6.5.4M6 12.5c1.5-.6 3.5-.5 5 .3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
    default:
      return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.3"/><path d="M2 9h14M9 2c2 2 3 4.5 3 7s-1 5-3 7c-2-2-3-4.5-3-7s1-5 3-7z" stroke="currentColor" strokeWidth="1.3"/></svg>
  }
}

interface ProfileMediaGridProps {
  profile: Profile
}

export function ProfileMediaGrid({ profile }: ProfileMediaGridProps) {
  const hasPortfolioPdf = !!profile.portfolio_pdf_url
  const hasResume = !!profile.resume_url
  const websiteLinks = (profile.media_links || []).filter(l => l.type === 'website' || l.type === 'other')
  const fundraiserLinks = (profile.media_links || []).filter(l => l.type === 'fundraiser')
  const socialLinks = profile.social_links || []

  // Also include legacy links as websites
  const legacyWebsites = (profile.links || [])
    .filter(l => l.type === 'website' || l.type === 'portfolio' || l.type === 'press')
    .filter(l => !websiteLinks.some(wl => wl.url === l.url))

  const hasAnyContent = hasPortfolioPdf || hasResume || websiteLinks.length > 0 || fundraiserLinks.length > 0 || socialLinks.length > 0 || legacyWebsites.length > 0

  if (!hasAnyContent) return null

  return (
    <section className="profile-media-grid-section">
      <div className="container">
        <p className="section-label">Media &amp; Links</p>
        <div className="media-card-grid">
          {/* Portfolio PDF */}
          {hasPortfolioPdf && (
            <a
              href={profile.portfolio_pdf_url!}
              target="_blank"
              rel="noopener noreferrer"
              className="media-card media-card--pdf"
              download={profile.portfolio_pdf_url!.startsWith('data:') ? `${profile.name.replace(/\s+/g, '_')}_Portfolio.pdf` : undefined}
            >
              <div className="media-card__icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="M9 13h6M9 17h4" />
                </svg>
              </div>
              <p className="media-card__label">Portfolio</p>
              <span className="media-card__hint">PDF</span>
            </a>
          )}

          {/* Resume PDF */}
          {hasResume && (
            <a
              href={profile.resume_url!}
              target="_blank"
              rel="noopener noreferrer"
              className="media-card media-card--pdf"
              download={profile.resume_url!.startsWith('data:') ? `${profile.name.replace(/\s+/g, '_')}_Resume.pdf` : undefined}
            >
              <div className="media-card__icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="M12 18v-6M9 15l3 3 3-3" />
                </svg>
              </div>
              <p className="media-card__label">Resume</p>
              <span className="media-card__hint">PDF</span>
            </a>
          )}

          {/* Website Links */}
          {websiteLinks.map((link, i) => (
            <a key={`wl-${i}`} href={link.url} target="_blank" rel="noopener noreferrer" className="media-card media-card--website">
              <div className="media-card__icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2c2.5 2.5 4 6 4 10s-1.5 7.5-4 10c-2.5-2.5-4-6-4-10s1.5-7.5 4-10z" />
                </svg>
              </div>
              <p className="media-card__label">{link.label || 'Website'}</p>
              <span className="media-card__hint">{getDomain(link.url)}</span>
            </a>
          ))}

          {/* Legacy website links */}
          {legacyWebsites.map((link, i) => (
            <a key={`ll-${i}`} href={link.url} target="_blank" rel="noopener noreferrer" className="media-card media-card--website">
              <div className="media-card__icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2c2.5 2.5 4 6 4 10s-1.5 7.5-4 10c-2.5-2.5-4-6-4-10s1.5-7.5 4-10z" />
                </svg>
              </div>
              <p className="media-card__label">{link.label}</p>
              <span className="media-card__hint">{getDomain(link.url)}</span>
            </a>
          ))}

          {/* Fundraiser Links */}
          {fundraiserLinks.map((link, i) => (
            <a key={`fl-${i}`} href={link.url} target="_blank" rel="noopener noreferrer" className="media-card media-card--fundraiser">
              <div className="media-card__icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
              </div>
              <p className="media-card__label">{link.label || 'Support'}</p>
              <span className="media-card__hint">{getDomain(link.url)}</span>
            </a>
          ))}

          {/* Social Media Links */}
          {socialLinks.length > 0 && (
            <div className="media-card media-card--social-group">
              <p className="media-card__label">Social</p>
              <div className="media-card__social-icons">
                {[...socialLinks].sort((a, b) => a.display_order - b.display_order).map(link => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="media-card__social-link"
                    title={link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                  >
                    {getSocialIconSmall(link.platform)}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
