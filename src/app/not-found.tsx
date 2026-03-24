import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container" style={{ padding: 'var(--space-16) 0', textAlign: 'center' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-4)' }}>404</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
        This page doesn&apos;t exist — but plenty of extraordinary projects do.
      </p>
      <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/" className="btn btn--primary">Explore Projects</Link>
        <Link href="/collaborate" className="btn btn--outline">Find a Role</Link>
      </div>
    </div>
  )
}
