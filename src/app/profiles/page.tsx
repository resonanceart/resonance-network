import { getProfiles } from '@/lib/data'
import { ProfilesPageClient } from '@/components/ProfilesPageClient'
import type { Metadata } from 'next'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'People',
  description: 'Meet the artists, engineers, architects, and makers building extraordinary projects on Resonance Network.',
  alternates: { canonical: 'https://resonance.network/profiles' },
  openGraph: {
    title: 'People — Resonance Network',
    description: 'Meet the artists, engineers, architects, and makers building extraordinary projects on Resonance Network.',
    url: 'https://resonance.network/profiles',
    type: 'website',
  },
}

export default async function ProfilesPage() {
  const profiles = await getProfiles()
  return <ProfilesPageClient profiles={profiles} />
}
