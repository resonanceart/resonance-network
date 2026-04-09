import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'People | Artists & Collaborators',
  description: 'Meet the artists, engineers, architects, and makers building ambitious creative projects on Resonance Network across art, architecture, and ecology.',
  alternates: {
    canonical: 'https://resonancenetwork.org/profiles',
  },
  openGraph: {
    title: 'People | Resonance Network',
    description: 'Artists and collaborators building ambitious work at the intersection of art, architecture, and ecology.',
    url: 'https://resonancenetwork.org/profiles',
    type: 'website',
    images: [{ url: '/og-image.jpg' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'People | Resonance Network',
    description: 'Meet the artists and collaborators on Resonance Network.',
    images: [{ url: '/og-image.jpg' }],
  },
}

export default function ProfilesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
