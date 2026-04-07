import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Join the Network',
  description: 'Join Resonance Network as a project creator or skilled collaborator. Submit your ambitious project or offer expertise in immersive art and ecology.',
  alternates: {
    canonical: 'https://resonancenetwork.org/join',
  },
  openGraph: {
    title: 'Join Resonance Network',
    description: 'Whether you bring an ambitious project or offer expertise, there is a place for you in our community of immersive art creators and collaborators.',
    url: 'https://resonancenetwork.org/join',
    type: 'website',
    images: [{ url: '/og-image.jpg' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Join Resonance Network',
    description: 'Submit a project or join as a collaborator on ambitious immersive art, regenerative design, and ecological innovation work.',
    images: [{ url: '/og-image.jpg' }],
  },
}

export default function JoinLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
