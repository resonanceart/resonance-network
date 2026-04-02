'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/components/ThemeProvider'
import { useAuth } from '@/components/AuthProvider'
import { MobileNav } from './MobileNav'

const navLinks = [
  { href: '/#projects', label: 'Projects' },
  { href: '/collaborate', label: 'Community' },
  { href: '/about', label: 'About' },
]

export function Header() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const hamburgerRef = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!user) { setUnreadCount(0); return }
    let cancelled = false
    const fetchUnread = async () => {
      try {
        const res = await fetch('/api/user/messages?limit=0')
        if (res.ok) {
          const data = await res.json()
          if (!cancelled) setUnreadCount(data.unread_count ?? 0)
        }
      } catch { /* silent */ }
    }
    fetchUnread()
    const interval = setInterval(fetchUnread, 60000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [user])

  return (
    <>
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
            {!authLoading && user ? (
              <Link
                href="/dashboard"
                className={`nav-cta${pathname?.startsWith('/dashboard') ? ' active' : ''}`}
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/join"
                className={`nav-cta${pathname === '/join' ? ' active' : ''}`}
              >
                Join the Network
              </Link>
            )}
          </nav>

          <div className="nav-actions">
            {!authLoading && (
              user ? (
                <>
                  <Link href="/dashboard/messages" className="nav-bell" aria-label={`Messages${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                    {unreadCount > 0 && <span className="nav-bell__badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                  </Link>
                  <Link href="/dashboard" className="nav-user" aria-label="Go to dashboard">
                    <span className="nav-user__avatar">
                      {user.user_metadata?.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </Link>
                </>
              ) : (
                <Link href="/login" className="nav-login">Log In</Link>
              )
            )}
            <button
              className="theme-toggle"
              aria-label="Toggle dark mode"
              onClick={toggleTheme}
            >
              <svg className="icon-sun" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"/>
              </svg>
              <svg className="icon-moon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
              </svg>
            </button>
            <button
              ref={hamburgerRef}
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

      </header>

      {/* Mobile nav — rendered OUTSIDE header to escape its stacking context */}
      <MobileNav isOpen={isMobileNavOpen} onClose={() => { setIsMobileNavOpen(false); hamburgerRef.current?.focus() }} />

      {/* Floating Action Button — mobile only */}
      <button
        className={`fab-menu${isMobileNavOpen ? ' fab-menu--open' : ''}`}
        aria-label={isMobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isMobileNavOpen}
        onClick={() => setIsMobileNavOpen(open => !open)}
      >
        <svg className="fab-menu__logo" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <circle cx="16" cy="16" r="4" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="16" cy="16" r="9" stroke="currentColor" strokeWidth="1.2" opacity="0.6"/>
          <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="0.9" opacity="0.3"/>
        </svg>
        <svg className="fab-menu__close" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </>
  )
}
