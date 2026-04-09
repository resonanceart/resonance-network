'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useTheme } from '@/components/ThemeProvider'
import { useAuth } from '@/components/AuthProvider'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function MobileNav({ isOpen, onClose }: Props) {
  const navRef = useRef<HTMLElement>(null)
  const { theme, toggleTheme } = useTheme()
  const { user, loading: authLoading } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!user) return
    fetch('/api/user/profile', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.profile?.role === 'admin') setIsAdmin(true)
      })
      .catch(() => {})
  }, [user])

  useEffect(() => {
    if (!isOpen) return
    const firstLink = navRef.current?.querySelector('a') as HTMLElement | null
    firstLink?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab') {
        const focusableElements = navRef.current?.querySelectorAll('a, button') ?? []
        if (focusableElements.length === 0) return
        const firstEl = focusableElements[0] as HTMLElement
        const lastEl = focusableElements[focusableElements.length - 1] as HTMLElement
        if (e.shiftKey) {
          if (document.activeElement === firstEl) { e.preventDefault(); lastEl.focus() }
        } else {
          if (document.activeElement === lastEl) { e.preventDefault(); firstEl.focus() }
        }
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  return (
    <nav
      ref={navRef}
      role="dialog"
      aria-modal="true"
      className={`nav-mobile${isOpen ? ' active' : ''}`}
      aria-label="Mobile navigation"
      aria-hidden={!isOpen}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Logo at top */}
      <div className="nav-mobile__logo">
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <circle cx="16" cy="16" r="4" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="16" cy="16" r="9" stroke="currentColor" strokeWidth="1.2" opacity="0.6"/>
          <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="0.9" opacity="0.3"/>
        </svg>
        <span>Resonance Network</span>
      </div>

      {/* Nav links */}
      <div className="nav-mobile__links">
        <Link href="/" onClick={onClose}>Home</Link>
        <Link href="/#projects" onClick={onClose}>Projects</Link>
        <Link href="/collaborate" onClick={onClose}>Community</Link>
        <Link href="/about" onClick={onClose}>About</Link>
        <Link href="/resources" onClick={onClose}>Resources</Link>
        {!authLoading && (
          user
            ? <Link href="/dashboard" onClick={onClose}>Dashboard</Link>
            : <Link href="/login" onClick={onClose}>Log In</Link>
        )}
      </div>

      {/* CTA buttons */}
      <div className="nav-mobile__cta">
        {!authLoading && (
          user ? (
            <>
              <Link href="/dashboard" onClick={onClose} className="btn btn--primary nav-mobile__cta-btn">Dashboard</Link>
              <Link href="/dashboard/projects/new" onClick={onClose} className="btn btn--outline nav-mobile__cta-btn">Submit Project</Link>
              {isAdmin && (
                <Link href="/admin" onClick={onClose} className="btn btn--outline nav-mobile__cta-btn" style={{ color: '#f59e0b', borderColor: '#f59e0b' }}>
                  Admin
                </Link>
              )}
            </>
          ) : (
            <>
              <Link href="/join" onClick={onClose} className="btn btn--primary nav-mobile__cta-btn">Join the Network</Link>
              <Link href="/login" onClick={onClose} className="btn btn--outline nav-mobile__cta-btn">Log In</Link>
            </>
          )
        )}
      </div>

      {/* Dark mode toggle */}
      <div className="nav-mobile__footer">
        <button
          className="nav-mobile__theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? '☀ Light Mode' : '☾ Dark Mode'}
        </button>
      </div>
    </nav>
  )
}
