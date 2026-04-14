import { ProfilesPageClient } from '@/components/ProfilesPageClient'
import { getProfiles } from '@/lib/data'

export const revalidate = 60

export default async function ProfilesPage() {
  const profiles = await getProfiles()
  return <ProfilesPageClient profiles={profiles} />
}
