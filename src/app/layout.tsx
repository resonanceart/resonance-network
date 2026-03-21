import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ScrollToTop } from '@/components/ScrollToTop'

export const metadata: Metadata = {
  metadataBase: new URL('https://resonance.network'),
  title: {
    default: 'Resonance Network — Art, Architecture & Ecology at Ambitious Scale',
    template: '%s — Resonance Network',
  },
  description:
    'A curated, artist-led platform for immersive installations, regenerative architecture, and ecological design. Explore projects, lend your expertise, or bring your own vision to the network.',
  keywords: [
    'immersive art',
    'regenerative architecture',
    'large-scale installation',
    'public art',
    'ecological design',
    'art collaboration',
    'creative projects',
    'bamboo architecture',
    'interactive environments',
    'social impact art',
  ],
  authors: [{ name: 'Resonance Network', url: 'https://resonance.network' }],
  creator: 'Resonance Network',
  publisher: 'Resonance Network',
  formatDetection: { telephone: false },
  openGraph: {
    title: 'Resonance Network — Art, Architecture & Ecology at Ambitious Scale',
    description:
      'A curated, artist-led platform for immersive installations, regenerative architecture, and ecological design. Explore projects, lend your expertise, or bring your own vision to the network.',
    url: 'https://resonance.network',
    siteName: 'Resonance Network',
    locale: 'en_US',
    type: 'website',
    images: [{ url: '/og-image.jpg' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Resonance Network',
    description:
      'Where ambitious creative projects find the collaborators, expertise, and momentum to cross from vision to built reality.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large' as const,
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      {
        url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="4" stroke="%2314b8a6" stroke-width="1.5" fill="none"/><circle cx="16" cy="16" r="9" stroke="%2314b8a6" stroke-width="1.2" fill="none" opacity="0.6"/><circle cx="16" cy="16" r="14" stroke="%2314b8a6" stroke-width="0.9" fill="none" opacity="0.3"/></svg>',
        type: 'image/svg+xml',
      },
    ],
  },
  alternates: {
    canonical: 'https://resonance.network',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F5F3EE' },
    { media: '(prefers-color-scheme: dark)', color: '#141312' },
  ],
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Resonance Network',
  url: 'https://resonance.network',
  logo: 'https://resonance.network/assets/images/projects/money-shot.png',
  description:
    'An artist-led platform connecting creators of immersive installations, regenerative architecture, and ecological design with the collaborators, expertise, and pathways to get built.',
  email: 'hello@resonanceartcollective.com',
  sameAs: [],
  foundingDate: '2024',
  knowsAbout: [
    'Immersive Art',
    'Regenerative Architecture',
    'Public Art',
    'Ecological Design',
    'Large-Scale Installations',
  ],
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Resonance Network',
  url: 'https://resonance.network',
  description:
    'An artist-led platform where ambitious creative projects find collaborators, expertise, and momentum to get built.',
  publisher: {
    '@type': 'Organization',
    name: 'Resonance Network',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t)}catch(e){}})()`,
          }}
        />
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=zodiak@400,500,600,700&f[]=satoshi@300,400,500,700&display=swap"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body>
        <ThemeProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <ScrollToTop />
        </ThemeProvider>
      </body>
    </html>
  )
}
