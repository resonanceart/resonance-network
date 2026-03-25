import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Join the Network',
  description: 'Join Resonance Network as a project creator or skilled collaborator. Submit your ambitious project or offer your expertise to creative work in art and ecology.',
  alternates: {
    canonical: 'https://resonance.network/join',
  },
  openGraph: {
    title: 'Join Resonance Network',
    description: 'Whether you bring a project or offer expertise, there is a place for you here.',
    url: 'https://resonance.network/join',
    type: 'website',
    images: [{ url: '/og-image.jpg' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Join Resonance Network',
    description: 'Submit a project or join as a collaborator on ambitious creative work.',
    images: [{ url: '/og-image.jpg' }],
  },
}

export default function JoinLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
