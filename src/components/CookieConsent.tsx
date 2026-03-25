'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'resonance_cookie_consent'
const CONSENT_EXPIRY_DAYS = 30

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const { timestamp } = JSON.parse(stored)
        const daysSince = (Date.now() - timestamp) / (1000 * 60 * 60 * 24)
        if (daysSince < CONSENT_EXPIRY_DAYS) return
      }
      setVisible(true)
    } catch {
      setVisible(true)
    }
  }, [])

  function handleAccept() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ accepted: true, timestamp: Date.now() }))
    } catch {
      // localStorage unavailable
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="cookie-consent" role="alert">
      <div className="cookie-consent__inner">
        <p className="cookie-consent__text">
          We use cookies for authentication and to improve your experience. No tracking cookies.
        </p>
        <div className="cookie-consent__actions">
          <button className="btn btn--primary btn--sm" onClick={handleAccept}>
            Accept
          </button>
          <Link href="/privacy" className="btn btn--outline btn--sm">
            Learn More
          </Link>
        </div>
      </div>
    </div>
  )
}
