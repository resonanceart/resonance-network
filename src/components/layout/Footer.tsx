import Link from 'next/link'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-inner">
          <div className="footer-top">
            {/* Column 1: Brand */}
            <div className="footer-col footer-brand">
              <Link href="/" className="logo" aria-label="Resonance Network home">
                <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="28" height="28">
                  <circle cx="16" cy="16" r="4" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="16" cy="16" r="9" stroke="currentColor" strokeWidth="1.2" opacity="0.6"/>
                  <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="0.9" opacity="0.3"/>
                </svg>
                <span className="logo-text">Resonance Network</span>
              </Link>
              <p className="footer-tagline">We connect visionary creators with pathways to bring extraordinary visions to life.</p>
              <a href="mailto:resonanceartcollective@gmail.com" className="footer-email">resonanceartcollective@gmail.com</a>
            </div>

            {/* Column 2: Explore */}
            <div className="footer-col">
              <p className="footer-col-title">Explore</p>
              <nav className="footer-links" aria-label="Footer navigation">
                <Link href="/">Projects</Link>
                <Link href="/collaborate">Collaborate</Link>
                <Link href="/about">About</Link>
                <Link href="/submit">Submit a Project</Link>
              </nav>
            </div>

            {/* Column 3: Connect */}
            <div className="footer-col">
              <p className="footer-col-title">Connect</p>
              <div className="footer-links">
                <a href="#" aria-label="Instagram">
                  <svg className="footer-social-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2" y="2" width="20" height="20" rx="5"/>
                    <circle cx="12" cy="12" r="5"/>
                    <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/>
                  </svg>
                  <span>Instagram</span>
                </a>
                <a href="#" aria-label="LinkedIn">
                  <svg className="footer-social-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/>
                    <rect x="2" y="9" width="4" height="12"/>
                    <circle cx="4" cy="4" r="2"/>
                  </svg>
                  <span>LinkedIn</span>
                </a>
                <a href="mailto:resonanceartcollective@gmail.com">
                  <svg className="footer-social-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                  <span>Email</span>
                </a>
                <a href="#">
                  <svg className="footer-social-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                  <span>Linktree</span>
                </a>
              </div>
            </div>

            {/* Column 4: For Creators */}
            <div className="footer-col">
              <p className="footer-col-title">For Creators</p>
              <div className="footer-links">
                <Link href="/submit">Submit a Project</Link>
                <Link href="/about#process">How Curation Works</Link>
                <Link href="/about">FAQ</Link>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <span className="footer-copyright">&copy; 2026 Resonance Network. All rights reserved.</span>
            <span className="footer-tagline-small">Built by artists, for artists.</span>
            <Link href="/" className="footer-logo-small" aria-label="Resonance Network">
              <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="20" height="20">
                <circle cx="16" cy="16" r="4" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="16" cy="16" r="9" stroke="currentColor" strokeWidth="1.2" opacity="0.6"/>
                <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="0.9" opacity="0.3"/>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
