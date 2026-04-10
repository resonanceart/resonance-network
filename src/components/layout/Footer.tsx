import Link from 'next/link'

export function Footer() {
  return (
    <footer className="site-footer site-footer--compact">
      <div className="container">
        <div className="footer-inner footer-inner--compact">
          <div className="footer-top footer-top--compact">
            {/* Column 1: Brand — tight */}
            <div className="footer-col footer-brand">
              <Link href="/" className="logo" aria-label="Resonance Network home">
                <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="24" height="24">
                  <circle cx="16" cy="16" r="4" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="16" cy="16" r="9" stroke="currentColor" strokeWidth="1.2" opacity="0.6"/>
                  <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="0.9" opacity="0.3"/>
                </svg>
                <span className="logo-text">Resonance Network</span>
              </Link>
              <p className="footer-tagline">Connecting creators with the people and pathways to bring extraordinary work to life.</p>
            </div>

            {/* Column 2: Navigate */}
            <div className="footer-col">
              <p className="footer-col-title">Navigate</p>
              <nav className="footer-links" aria-label="Footer navigation">
                <Link href="/#projects">Projects</Link>
                <Link href="/collaborate">Collaborate</Link>
                <Link href="/join">Join</Link>
                <Link href="/about">About</Link>
                <Link href="/resources">Resources</Link>
              </nav>
            </div>

            {/* Column 3: For Creators */}
            <div className="footer-col">
              <p className="footer-col-title">For Creators</p>
              <div className="footer-links">
                <Link href="/join">Share a Project</Link>
                <Link href="/about#process">Curation Process</Link>
                <a href="https://fundrazr.com/72glEe" target="_blank" rel="noopener noreferrer">Support / Donate</a>
              </div>
            </div>

            {/* Column 4: Connect, inline social icons */}
            <div className="footer-col">
              <p className="footer-col-title">Connect</p>
              <div className="footer-links">
                <a href="mailto:resonanceartcollective@gmail.com" className="footer-email-link">resonanceartcollective@gmail.com</a>
              </div>
              <div className="footer-social-row">
                <a href="https://www.instagram.com/resonanceartcollective" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="footer-social-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2" y="2" width="20" height="20" rx="5"/>
                    <circle cx="12" cy="12" r="5"/>
                    <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/>
                  </svg>
                </a>
                <a href="https://www.facebook.com/profile.php?id=61571789286333" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="footer-social-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
                <a href="https://resonanceart.org" target="_blank" rel="noopener noreferrer" aria-label="Studio Site" className="footer-social-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                </a>
                <a href="https://linktr.ee/resonanceartcollective" target="_blank" rel="noopener noreferrer" aria-label="Linktree" className="footer-social-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="footer-bottom footer-bottom--compact">
            <span className="footer-copyright">&copy; {new Date().getFullYear()} Resonance Network</span>
            <nav className="footer-legal" aria-label="Legal">
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
            </nav>
            <span className="footer-tagline-small">Built by artists, for artists.</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
