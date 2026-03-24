import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import profilesData from '../../../data/profiles.json'
import type { Profile } from '@/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'People',
  description: 'Meet the artists, engineers, architects, and makers building extraordinary projects on Resonance Network.',
  alternates: {
    canonical: 'https://resonance.network/profiles',
  },
  openGraph: {
    title: 'People — Resonance Network',
    description: 'Meet the artists, engineers, architects, and makers building extraordinary projects on Resonance Network.',
    url: 'https://resonance.network/profiles',
    type: 'website',
  },
}

export default function ProfilesPage() {
  const profiles = (profilesData as Profile[]).filter(p => p.status === 'published')

  return (
    <>
      <section className="page-header">
        <div className="container">
          <nav aria-label="Breadcrumb" className="breadcrumb">
            <Link href="/">Home</Link> <span aria-hidden="true">/</span> <span>People</span>
          </nav>
          <p className="section-label">People</p>
          <h1>The Minds Behind the Work</h1>
          <p className="lead">
            Artists, engineers, architects, and makers — the people who bring extraordinary projects to life.
          </p>
        </div>
      </section>

      <section className="profiles-grid-section">
        <div className="container">
          <div className="profiles-grid">
            {profiles.map(profile => (
              <Link
                key={profile.id}
                href={`/profiles/${profile.slug}`}
                className="profile-card"
              >
                <div className="profile-card__photo-wrap">
                  <Image
                    src={profile.photo}
                    alt={`Photo of ${profile.name}`}
                    width={400}
                    height={400}
                    sizes="(max-width: 768px) 50vw, 25vw"
                    loading="lazy"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className="profile-card__body">
                  <h2 className="profile-card__name">{profile.name}</h2>
                  <p className="profile-card__title">{profile.title}</p>
                  {profile.location && (
                    <p className="profile-card__location">{profile.location}</p>
                  )}
                  <div className="profile-card__specialties">
                    {profile.specialties.slice(0, 3).map(s => (
                      <Badge key={s} variant="domain">{s}</Badge>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
