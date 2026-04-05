'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'

const STORAGE_KEY = 'resonance_join_dismissed'
const DISMISS_EXPIRY_DAYS = 7

export function JoinModal() {
  const { user, loading: authLoading } = useAuth()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (user) return

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const { timestamp } = JSON.parse(stored)
        const daysSince = (Date.now() - timestamp) / (1000 * 60 * 60 * 24)
        if (daysSince < DISMISS_EXPIRY_DAYS) return
      }
    } catch {
      // localStorage unavailable — show modal
    }

    const timer = setTimeout(() => setVisible(true), 1500)
    return () => clearTimeout(timer)
  }, [user, authLoading])

  useEffect(() => {
    if (!visible) return

    document.body.style.overflow = 'hidden'

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') handleDismiss()
    }
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleEscape)
    }
  }, [visible])

  function handleDismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ dismissed: true, timestamp: Date.now() }))
    } catch {
      // localStorage unavailable
    }
    setVisible(false)
    document.body.style.overflow = ''
  }

  if (!visible) return null

  return (
    <div className="join-modal__overlay" role="dialog" aria-modal="true" aria-labelledby="join-modal-title">
      <div className="join-modal__card">
        <button className="join-modal__close" onClick={handleDismiss} aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <p id="join-modal-title" className="join-modal__title">Join Resonance Network</p>

        <div className="join-modal__paths">
          {/* Share Art path */}
          <Link href="/login?tab=signup&redirect=/dashboard/welcome" className="join-modal__path join-modal__path--share">
            <div className="join-modal__path-header">
              <div className="join-modal__path-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="7" height="7" rx="1"/>
                  <rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/>
                  <rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
              </div>
              <h3>Share Art</h3>
            </div>
            <p className="join-modal__path-desc">
              You have a project and need collaborators.
            </p>
            <span className="join-modal__path-cta">
              Join Now &rarr;
            </span>
          </Link>

          {/* Help Build Art path */}
          <Link href="/login?tab=signup&redirect=/dashboard/welcome" className="join-modal__path join-modal__path--help">
            <div className="join-modal__path-header">
              <div className="join-modal__path-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <h3>Help Build Art</h3>
            </div>
            <p className="join-modal__path-desc">
              You&apos;re a maker ready to work on projects that matter.
            </p>
            <span className="join-modal__path-cta">
              Join Now &rarr;
            </span>
          </Link>
        </div>

        <p className="join-modal__signin">
          Already have an account?{' '}
          <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
