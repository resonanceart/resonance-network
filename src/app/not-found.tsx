import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="error-page">
      <div className="container error-page__inner">
        <span className="error-page__code">404</span>
        <h1 className="error-page__title">Page not found</h1>
        <p className="error-page__desc">
          This page doesn&apos;t exist — but plenty of extraordinary projects do.
        </p>
        <div className="error-page__actions">
          <Link href="/" className="btn btn--primary">Explore Projects</Link>
          <Link href="/collaborate" className="btn btn--outline">Find a Role</Link>
        </div>
        <div className="error-page__links">
          <Link href="/about">About</Link>
          <span className="error-page__sep" aria-hidden="true">&middot;</span>
          <Link href="/profiles">People</Link>
          <span className="error-page__sep" aria-hidden="true">&middot;</span>
          <a href="mailto:resonanceartcollective@gmail.com">Contact</a>
        </div>
      </div>
    </section>
  )
}
