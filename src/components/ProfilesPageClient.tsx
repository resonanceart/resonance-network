'use client'
import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import projectsData from '../../data/projects.json'
import type { Profile, Project } from '@/types'

export function ProfilesPageClient({ profiles }: { profiles: Profile[] }) {
  const projects = projectsData as Project[]
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState<string>('')

  const allSpecialties = useMemo(() => {
    const set = new Set<string>()
    profiles.forEach(p => p.specialties.forEach(s => set.add(s)))
    return Array.from(set).sort()
  }, [profiles])

  const [selectedSpecialty, setSelectedSpecialty] = useState('')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return profiles.filter(p => {
      const textMatch = !q || p.name.toLowerCase().includes(q) || p.specialties.some(s => s.toLowerCase().includes(q))
      const specMatch = !selectedSpecialty || p.specialties.includes(selectedSpecialty)
      const typeMatch = !selectedType || p.type === selectedType
      return textMatch && specMatch && typeMatch
    })
  }, [profiles, search, selectedSpecialty, selectedType])

  function getProjectCount(profile: Profile): number {
    return projects.filter(pr => pr.leadArtistName === profile.name).length
  }

  return (
    <>
      <section className="page-header">
        <div className="container">
          <nav aria-label="Breadcrumb" className="breadcrumb">
            <Link href="/">Home</Link> <span aria-hidden="true">/</span> <span>People</span>
          </nav>
          <p className="section-label">Community</p>
          <h1>The People Behind the Work</h1>
          <p className="lead">
            Artists, architects, engineers, and makers building extraordinary things — together.
          </p>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-3)' }}>
            Resonance Network is a growing community. The people you see here are the first — more profiles are added as new creators and collaborators join.
          </p>
        </div>
      </section>

      {/* Dual CTA */}
      <section className="profiles-dual-cta">
        <div className="container">
          <div className="profiles-dual-cta__grid">
            <Link href="/join" className="profiles-dual-cta__card">
              <h3>Share a Project</h3>
              <p>Have an ambitious project? Share it with the network and find the right people.</p>
              <span className="btn btn--primary">Get Started</span>
            </Link>
            <Link href="/join" className="profiles-dual-cta__card">
              <h3>Join as Collaborator</h3>
              <p>Engineer, fabricator, or specialist? Find projects that need what you do.</p>
              <span className="btn btn--outline">Explore Roles</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Search/Filter Bar */}
      <section className="profiles-filter-section">
        <div className="container">
          <div className="profiles-filter-bar">
            <div className="profiles-type-tabs" role="tablist" aria-label="Filter by type">
              {[
                { value: '', label: 'All' },
                { value: 'artist', label: 'Artists' },
                { value: 'collaborator', label: 'Collaborators' },
                { value: 'collective', label: 'Collectives' },
              ].map(tab => (
                <button
                  key={tab.value}
                  role="tab"
                  aria-selected={selectedType === tab.value}
                  className={`profiles-type-tab${selectedType === tab.value ? ' profiles-type-tab--active' : ''}`}
                  onClick={() => setSelectedType(tab.value)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <input
              type="search"
              placeholder="Search by name or specialty..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="profiles-filter-bar__search"
              aria-label="Search profiles"
            />
            <select
              value={selectedSpecialty}
              onChange={e => setSelectedSpecialty(e.target.value)}
              className="profiles-filter-bar__select"
              aria-label="Filter by specialty"
            >
              <option value="">All Specialties</option>
              {allSpecialties.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Profile Cards Grid */}
      <section className="profiles-grid-section">
        <div className="container">
          <div className="profiles-grid">
            {filtered.map(profile => {
              const projectCount = getProjectCount(profile)
              return (
                <Link
                  key={profile.id}
                  href={`/profiles/${profile.slug}`}
                  className="profile-card"
                >
                  <div className="profile-card__avatar">
                    <Image
                      src={profile.photo}
                      alt={`Photo of ${profile.name}`}
                      width={80}
                      height={80}
                      sizes="80px"
                      loading="lazy"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <h2 className="profile-card__name">{profile.name}</h2>
                  <p className="profile-card__title">{profile.title}</p>
                  {profile.location && (
                    <p className="profile-card__location">
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path d="M7 1C4.5 1 2.5 3 2.5 5.5C2.5 9 7 13 7 13s4.5-4 4.5-7.5C11.5 3 9.5 1 7 1z" stroke="currentColor" strokeWidth="1.2"/>
                        <circle cx="7" cy="5.5" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
                      </svg>
                      {profile.location}
                    </p>
                  )}
                  <div className="profile-card__specialties">
                    {profile.specialties.slice(0, 3).map(s => (
                      <Badge key={s} variant="domain">{s}</Badge>
                    ))}
                  </div>
                  {projectCount > 0 && (
                    <p className="profile-card__projects">
                      {projectCount} project{projectCount !== 1 ? 's' : ''} on Resonance
                    </p>
                  )}
                </Link>
              )
            })}
            {filtered.length === 0 && (
              <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-12) 0' }}>
                No profiles match your search.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="profiles-cta">
        <div className="container" style={{ textAlign: 'center', padding: 'var(--space-12) 0' }}>
          <h2>Add Your Name to This List</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>Create your free profile and join the network.</p>
          <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/join" className="btn btn--primary btn--large">Create Your Profile</Link>
            <Link href="/collaborate" className="btn btn--outline btn--large">Browse Open Roles</Link>
          </div>
        </div>
      </section>
    </>
  )
}
