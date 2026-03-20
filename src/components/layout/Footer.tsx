import Link from 'next/link'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-inner">
          <p className="footer-mission">Helping serious, visionary spatial projects cross the gap from concept-ready to buildable reality.</p>
          <div className="footer-links">
            <Link href="/">Projects</Link>
            <Link href="/collaborate">Collaborate</Link>
            <Link href="/about">About</Link>
            <Link href="/submit">Submit a Project</Link>
            <a href="mailto:hello@resonance.network">hello@resonance.network</a>
          </div>
          <div className="footer-bottom">
            <span className="footer-copyright">&copy; 2026 Resonance Network</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
