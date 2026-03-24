'use client'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="container" style={{ padding: 'var(--space-16) 0', textAlign: 'center' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-4)' }}>Something went wrong</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
        An unexpected error occurred. Please try again.
      </p>
      <button onClick={reset} className="btn btn--primary">
        Try Again
      </button>
    </div>
  )
}
