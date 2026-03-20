import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  metadataBase: new URL('https://resonancenetwork.com'),
  title: 'Resonance Network — Curated Projects at the Intersection of Art, Architecture & Ecology',
  description: 'A curated, artist-led platform for large-scale immersive and regenerative projects. From vision to reality, together.',
  openGraph: {
    title: 'Resonance Network',
    description: 'A curated, artist-led platform for large-scale immersive and regenerative projects.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
      <body>
        <ThemeProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
