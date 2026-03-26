export default function Loading() {
  return (
    <>
      {/* Hero skeleton */}
      <section className="site-hero" style={{ background: '#111' }}>
        <div className="site-hero__overlay" />
        <div className="site-hero__content">
          <div
            style={{
              width: '60%',
              maxWidth: 480,
              height: '2.4rem',
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 6,
              margin: '0 auto',
            }}
          />
        </div>
      </section>

      {/* Grid skeleton */}
      <section className="container container--wide">
        <div className="project-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="project-card"
              style={{
                opacity: 1,
                background: '#1a1a1a',
                animation: 'skeletonPulse 1.6s ease-in-out infinite',
                animationDelay: `${i * 0.12}s`,
              }}
            />
          ))}
        </div>
      </section>

      <style>{`
        @keyframes skeletonPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </>
  )
}
