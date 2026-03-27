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
              <p className="footer-tagline">Connecting creators with the people and pathways to bring extraordinary work to life.</p>
              <a href="mailto:resonanceartcollective@gmail.com" className="footer-email">resonanceartcollective@gmail.com</a>
            </div>

            {/* Column 2: Explore */}
            <div className="footer-col">
              <p className="footer-col-title">Explore</p>
              <nav className="footer-links" aria-label="Footer navigation">
                <Link href="/#projects">Projects</Link>
                <Link href="/collaborate">Collaborate</Link>
                <Link href="/about">About</Link>
                <Link href="/submit#faq">FAQ</Link>
              </nav>
            </div>

            {/* Column 3: Connect */}
            <div className="footer-col">
              <p className="footer-col-title">Connect</p>
              <div className="footer-links">
                <a href="https://www.instagram.com/resonanceartcollective" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <svg className="footer-social-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2" y="2" width="20" height="20" rx="5"/>
                    <circle cx="12" cy="12" r="5"/>
                    <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/>
                  </svg>
                  <span>Instagram</span>
                </a>
                <a href="https://resonanceart.org" target="_blank" rel="noopener noreferrer" aria-label="Main Website">
                  <svg className="footer-social-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                  <span>Main Website</span>
                </a>
                <a href="mailto:resonanceartcollective@gmail.com" aria-label="Email">
                  <svg className="footer-social-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                  <span>Email</span>
                </a>
                <a href="https://linktr.ee/resonanceartcollective" target="_blank" rel="noopener noreferrer" aria-label="Linktree">
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
                <Link href="/join">Submit a Project</Link>
                <Link href="/about#process">How Curation Works</Link>
                <Link href="/resources">Resources & Guides</Link>
                <a href="https://fundrazr.com/72glEe" target="_blank" rel="noopener noreferrer">Support / Donate</a>
                <Link href="/about">About Us</Link>
                <Link href="/join">Join the Network</Link>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <span className="footer-copyright">&copy; {new Date().getFullYear()} Resonance Network. All rights reserved.</span>
            <nav className="footer-legal" aria-label="Legal">
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms of Service</Link>
            </nav>
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
