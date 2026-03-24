import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'People — Artists & Collaborators',
  description: 'Meet the artists, architects, designers, and collaborators building immersive art and regenerative architecture on Resonance Network.',
  alternates: {
    canonical: 'https://resonance.network/profiles',
  },
  openGraph: {
    title: 'People — Resonance Network',
    description: 'Artists and collaborators building immersive art, regenerative architecture, and ecological design.',
    url: 'https://resonance.network/profiles',
    type: 'website',
    images: [{ url: '/og-image.jpg' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'People — Resonance Network',
    description: 'Meet the artists and collaborators on Resonance Network.',
    images: [{ url: '/og-image.jpg' }],
  },
}

export default function ProfilesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
