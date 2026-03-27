'use client'
import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { Badge } from '@/components/ui/Badge'
import { CollaborationTaskCard } from '@/components/CollaborationTaskCard'
import projectsData from '../../data/projects.json'
import type { Profile, Project, CollaborationTask } from '@/types'

const CATEGORIES = ['Engineering', 'Architecture', 'Fabrication', 'Production', 'Funding', 'Admin', 'Other']

export function CommunityPage({ profiles, tasks }: { profiles: Profile[]; tasks: CollaborationTask[] }) {
  const { user } = useAuth()
  const projects = projectsData as Project[]
  const [activeTab, setActiveTab] = useState<'people' | 'roles'>('roles')

  // People tab state
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState<string>('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')

  // Roles tab state
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Read tab from URL on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const tab = new URLSearchParams(window.location.search).get('tab')
      if (tab === 'roles' || tab === 'needs') setActiveTab('roles')
      else if (tab === 'people') setActiveTab('people')
    }
  }, [])

  // People filtering
  const allSpecialties = useMemo(() => {
    const set = new Set<string>()
    profiles.forEach(p => p.specialties.forEach(s => set.add(s)))
    return Array.from(set).sort()
  }, [profiles])

  const filteredProfiles = useMemo(() => {
    const q = search.toLowerCase()
    return profiles.filter(p => {
      const textMatch = !q || p.name.toLowerCase().includes(q) || p.specialties.some(s => s.toLowerCase().includes(q))
      const specMatch = !selectedSpecialty || p.specialties.includes(selectedSpecialty)
      const typeMatch = !selectedType || p.type === selectedType
      return textMatch && specMatch && typeMatch
    })
  }, [profiles, search, selectedSpecialty, selectedType])

  // Roles filtering
  const filteredTasks = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return tasks.filter(t => {
      const categoryMatch = !selectedCategory || t.category === selectedCategory
      const textMatch = !q || t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.projectTitle.toLowerCase().includes(q) || t.skillsNeeded.some(s => s.toLowerCase().includes(q))
      return categoryMatch && textMatch
    })
  }, [tasks, selectedCategory, searchQuery])

  function getProjectCount(profile: Profile): number {
    return projects.filter(pr => pr.leadArtistName === profile.name).length
  }

  return (
    <>
      {/* Page Header */}
      <section className="page-header">
        <div className="container">
          <nav aria-label="Breadcrumb" className="breadcrumb">
            <Link href="/">Home</Link> <span aria-hidden="true">/</span> <span>Community</span>
          </nav>
          <p className="section-label">Community</p>
          <h1>The People Behind the Work</h1>
          <p className="lead">
            Artists, architects, engineers, and makers building extraordinary things — together.
          </p>
        </div>
      </section>

      {/* Dual CTA */}
      <section className="profiles-dual-cta">
        <div className="container">
          <div className="profiles-dual-cta__grid">
            <Link href="/join" className="profiles-dual-cta__card">
              <h3>Submit a Project</h3>
              <p>Have an ambitious project? Share it with the network and find the right people.</p>
              <span className="btn btn--primary">Get Started</span>
            </Link>
            <Link href="/join" className="profiles-dual-cta__card">
              <h3>Join as Collaborator</h3>
              <p>Engineer, fabricator, or specialist? Find projects that need what you do.</p>
              <span className="btn btn--outline">Get Started</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Tab Toggle */}
      <section className="collab-tabs-section">
        <div className="container">
          <p className="collab-tabs-section__intro">
            Browse available collaboration roles or discover the people behind the projects.
          </p>
          <div className="collab-tabs" role="tablist" aria-label="Community view">
            <button
              role="tab"
              aria-selected={activeTab === 'roles'}
              className={`collab-tab${activeTab === 'roles' ? ' collab-tab--active' : ''}`}
              onClick={() => setActiveTab('roles')}
            >
              Available Roles <span className="collab-tab__count">({tasks.length})</span>
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'people'}
              className={`collab-tab${activeTab === 'people' ? ' collab-tab--active' : ''}`}
              onClick={() => setActiveTab('people')}
            >
              People <span className="collab-tab__count">({profiles.length})</span>
            </button>
          </div>
        </div>
      </section>

      {/* People Tab */}
      {activeTab === 'people' && (
        <>
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

          <section className="profiles-grid-section">
            <div className="container">
              <div className="profiles-grid">
                {filteredProfiles.map(profile => {
                  const projectCount = getProjectCount(profile)
                  return (
                    <div key={profile.id} className="profile-card">
                      <div className="profile-card__avatar">
                        <Image
                          src={profile.photo}
                          alt={`Photo of ${profile.name}`}
                          width={150}
                          height={150}
                          sizes="150px"
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
                      <div className="profile-card__actions">
                        <Link href={`/profiles/${profile.slug}`} className="btn btn--outline btn--sm">View Profile</Link>
                        {profile.email ? (
                          <a href={`mailto:${profile.email}?subject=Collaboration%20Inquiry%20via%20Resonance%20Network`} className="btn btn--primary btn--sm">Connect</a>
                        ) : (
                          <Link href={`/profiles/${profile.slug}`} className="btn btn--primary btn--sm">Connect</Link>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredProfiles.length === 0 && (
                  <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-12) 0' }}>
                    No profiles match your search.
                  </p>
                )}
              </div>
            </div>
          </section>
        </>
      )}

      {/* Open Roles Tab */}
      {activeTab === 'roles' && (
        <>
          <section className="collab-filters">
            <div className="container">
              <div className="filters-compact">
                <label htmlFor="collab-search" className="sr-only">Search collaboration opportunities</label>
                <input
                  id="collab-search"
                  type="search"
                  placeholder="Search opportunities..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="filter-search"
                  aria-label="Search collaboration opportunities"
                />
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="filter-select"
                  aria-label="Filter by category"
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              {(searchQuery || selectedCategory) && (
                <p className="filter-count">
                  {filteredTasks.length} {filteredTasks.length === 1 ? 'opportunity' : 'opportunities'}
                  {selectedCategory && ` in ${selectedCategory}`}
                  {searchQuery && ` matching "${searchQuery}"`}
                </p>
              )}
            </div>
          </section>

          <section className="collab-grid">
            <div className="container">
              <div className="task-grid">
                {filteredTasks.map(task => (
                  <CollaborationTaskCard key={task.id} task={task} />
                ))}
                {filteredTasks.length === 0 && (
                  <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No roles match your current filters. Try broadening your search.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Offer Your Skills CTA */}
          <section className="collab-available">
            <div className="container">
              <div className="collab-available__inner">
                <div className="collab-available__content">
                  <h2>{user ? 'Your Profile' : 'Offer Your Skills'}</h2>
                  {user ? (
                    <div>
                      <p className="collab-available__body">
                        Edit your profile to update your skills and availability so project teams can find you.
                      </p>
                      <Link href="/dashboard/profile" className="btn btn--primary btn--large" style={{ marginTop: 'var(--space-4)' }}>
                        Edit Your Profile &rarr;
                      </Link>
                    </div>
                  ) : (
                    <div>
                      <p className="collab-available__body">
                        Create a free account to build your collaborator profile and connect with project teams.
                      </p>
                      <Link href="/login?tab=signup&redirect=/dashboard/welcome" className="btn btn--primary btn--large" style={{ marginTop: 'var(--space-4)' }}>
                        Join the Network &rarr;
                      </Link>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-3)' }}>
                        Already have an account?{' '}
                        <Link href="/login?redirect=/dashboard/profile" style={{ color: 'var(--color-primary)' }}>Sign in</Link>
                      </p>
                    </div>
                  )}
                </div>
                <div className="collab-available__skills">
                  <p className="collab-available__skills-title">Skills projects are looking for:</p>
                  <div className="collab-available__skills-list">
                    <span className="skill-tag">Structural Engineering</span>
                    <span className="skill-tag">Lighting Design</span>
                    <span className="skill-tag">Grant Writing</span>
                    <span className="skill-tag">Fabrication</span>
                    <span className="skill-tag">Acoustic Engineering</span>
                    <span className="skill-tag">Community Organizing</span>
                    <span className="skill-tag">Landscape Architecture</span>
                    <span className="skill-tag">Material Science</span>
                    <span className="skill-tag">PV Systems</span>
                    <span className="skill-tag">Coastal Engineering</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Bottom CTA */}
      <section className="profiles-cta">
        <div className="container" style={{ textAlign: 'center', padding: 'var(--space-12) 0' }}>
          <h2>Add Your Name to This List</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>Create your free profile and join the network.</p>
          <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/join" className="btn btn--primary btn--large">Join the Network</Link>
          </div>
        </div>
      </section>
    </>
  )
}
