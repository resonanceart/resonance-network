import { getProfiles } from '@/lib/data'
import { ProfilesPageClient } from '@/components/ProfilesPageClient'
import type { Metadata } from 'next'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'People',
  description: 'Browse the artists, engineers, architects, and makers building extraordinary creative projects on Resonance Network — from large-scale installations to regenerative buildings.',
  alternates: { canonical: 'https://resonance.network/profiles' },
  openGraph: {
    title: 'People — Resonance Network',
    description: 'Browse the artists, engineers, architects, and makers building extraordinary creative projects on Resonance Network.',
    url: 'https://resonance.network/profiles',
    type: 'website',
    images: [{ url: '/og-image.jpg' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'People — Resonance Network',
    description: 'Artists and collaborators building ambitious work at the intersection of art, architecture, and ecology.',
    images: [{ url: '/og-image.jpg' }],
  },
}

export default async function ProfilesPage() {
  const profiles = await getProfiles()
  return <ProfilesPageClient profiles={profiles} />
}
