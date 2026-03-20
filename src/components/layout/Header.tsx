'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/components/ThemeProvider'
import { MobileNav } from './MobileNav'

const navLinks = [
  { href: '/', label: 'Projects' },
  { href: '/collaborate', label: 'Collaborate' },
  { href: '/about', label: 'About' },
]

export function Header() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="site-header">
      <div className="container container--wide">
        <Link href="/" className="logo" aria-label="Resonance Network home">
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="16" cy="16" r="4" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="16" cy="16" r="9" stroke="currentColor" strokeWidth="1.2" opacity="0.6"/>
            <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="0.9" opacity="0.3"/>
          </svg>
          <span className="logo-text">Resonance Network</span>
        </Link>

        <nav className="nav-desktop" aria-label="Main navigation">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href ? 'active' : undefined}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/submit"
            className={`nav-cta${pathname === '/submit' ? ' active' : ''}`}
          >
            Submit a Project
          </Link>
        </nav>

        <div className="nav-actions">
          <button
            className="theme-toggle"
            aria-label="Toggle dark mode"
            onClick={toggleTheme}
          >
            <svg className="icon-sun" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"/>
            </svg>
            <svg className="icon-moon" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
            </svg>
          </button>
          <button
            className="hamburger"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileNavOpen}
            onClick={() => setIsMobileNavOpen(open => !open)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      <MobileNav isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />
    </header>
  )
}
