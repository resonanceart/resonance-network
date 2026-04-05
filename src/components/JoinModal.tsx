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
      // localStorage unavailable
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
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="join-modal__paths">
          <Link href="/import" onClick={handleDismiss} className="join-modal__path join-modal__path--share">
            <h2>Share Art</h2>
            <p>Import your project in seconds.</p>
            <span className="join-modal__path-cta">Get Started</span>
          </Link>

          <Link href="/login?tab=signup&redirect=/dashboard/welcome" onClick={handleDismiss} className="join-modal__path join-modal__path--help">
            <h2>Help Build Art</h2>
            <p>You&apos;re a maker ready to work on meaningful projects.</p>
            <span className="join-modal__path-cta">Get Started</span>
          </Link>
        </div>

        <p className="join-modal__signin">
          Already a member?{' '}
          <Link href="/login" onClick={handleDismiss}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
