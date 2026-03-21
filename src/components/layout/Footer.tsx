import Link from 'next/link'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <Link href="/" className="logo" aria-label="Resonance Network home">
                <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="28" height="28">
                  <circle cx="16" cy="16" r="4" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="16" cy="16" r="9" stroke="currentColor" strokeWidth="1.2" opacity="0.6"/>
                  <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="0.9" opacity="0.3"/>
                </svg>
                <span className="logo-text">Resonance Network</span>
              </Link>
              <p className="footer-mission">Made by artists who know how hard it is to carry a big vision alone. We connect creators with the people, expertise, and pathways to build what matters.</p>
            </div>
            <div>
              <p className="footer-col-title">Explore</p>
              <nav className="footer-links" aria-label="Footer navigation">
                <Link href="/">Projects</Link>
                <Link href="/collaborate">Collaborate</Link>
                <Link href="/about">About</Link>
              </nav>
            </div>
            <div>
              <p className="footer-col-title">Get Involved</p>
              <div className="footer-links">
                <Link href="/submit">Submit Your Project</Link>
                <a href="mailto:hello@resonanceartcollective.com">Contact Us</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span className="footer-copyright">&copy; 2026 Resonance Network. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
