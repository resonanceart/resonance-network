'use client'

import Link from 'next/link'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <section className="error-page">
      <div className="container error-page__inner">
        <span className="error-page__code">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </span>
        <h1 className="error-page__title">Something went wrong</h1>
        <p className="error-page__desc">
          An unexpected error occurred. You can try again or head back to the homepage.
        </p>
        <div className="error-page__actions">
          <button onClick={reset} className="btn btn--primary">Try Again</button>
          <Link href="/" className="btn btn--outline">Go Home</Link>
        </div>
      </div>
    </section>
  )
}
