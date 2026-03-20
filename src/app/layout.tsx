import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Resonance Network',
    template: '%s — Resonance Network',
  },
  description: 'A curated, artist-led platform for large-scale immersive and regenerative projects.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=zodiak@400,500,600,700&f[]=satoshi@300,400,500,700&display=swap"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Resonance Network',
              url: 'https://resonance.network',
              description: 'A curated, artist-led platform for large-scale immersive and regenerative projects.',
              email: 'hello@resonance.network',
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
