'use client'
import { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import Image from 'next/image'
import profilesData from '../../data/profiles.json'
import projectsData from '../../data/projects.json'
import type { CollaborationTask, Profile, Project } from '@/types'
import { CollaborationTaskCard } from './CollaborationTaskCard'
import { Badge } from './ui/Badge'

const CATEGORIES = ['Engineering', 'Architecture', 'Fabrication', 'Production', 'Funding', 'Admin', 'Other']

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://resonance.network',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Collaborate',
      item: 'https://resonance.network/collaborate',
    },
  ],
}

export function CollaborationBoard({ tasks }: { tasks: CollaborationTask[] }) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'needs' | 'people'>('needs')
  const formRef = useRef<HTMLDivElement>(null)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // People tab state
  const [peopleSearch, setPeopleSearch] = useState('')
  const [peopleTypeFilter, setPeopleTypeFilter] = useState<'all' | 'artist' | 'collaborator'>('all')

  const profiles = (profilesData as Profile[]).filter(p => p.status === 'published')
  const allProjects = projectsData as Project[]

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const tab = new URLSearchParams(window.location.search).get('tab')
      if (tab === 'people' || tab === 'skills') {
        setActiveTab('people')
        if (tab === 'skills') {
          setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }, 300)
        }
      }
    }
  }, [])

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return tasks.filter(t => {
      const categoryMatch = !selectedCategory || t.category === selectedCategory
      const textMatch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.projectTitle.toLowerCase().includes(q) ||
        t.skillsNeeded.some(s => s.toLowerCase().includes(q))
      return categoryMatch && textMatch
    })
  }, [tasks, selectedCategory, searchQuery])

  const filteredProfiles = useMemo(() => {
    const q = peopleSearch.toLowerCase()
    return profiles.filter(p => {
      const typeMatch = peopleTypeFilter === 'all' || p.type === peopleTypeFilter
      const textMatch = !q || p.name.toLowerCase().includes(q) || p.specialties.some(s => s.toLowerCase().includes(q))
      return typeMatch && textMatch
    })
  }, [profiles, peopleSearch, peopleTypeFilter])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <section className="collab-header">
        <div className="container">
          <nav aria-label="Breadcrumb" className="breadcrumb">
            <Link href="/">Home</Link> <span aria-hidden="true">/</span> <span>Collaborate</span>
          </nav>
          <p className="section-label">Collaborate</p>
          <h1>Open Roles on Curated Projects</h1>
          <p className="lead">
            Collaboration opportunities across curated projects — from structural engineering to grant writing to spatial audio design. Every role is tied to a real team with a clear vision.
          </p>
        </div>
      </section>

      {/* Tab Toggle */}
      <section className="collab-tabs-section">
        <div className="container">
          <div className="collab-tabs" role="tablist" aria-label="Collaboration view">
            <button role="tab" aria-selected={activeTab === 'needs'} className={`collab-tab${activeTab === 'needs' ? ' collab-tab--active' : ''}`} onClick={() => setActiveTab('needs')}>
              Open Roles
            </button>
            <button role="tab" aria-selected={activeTab === 'people'} className={`collab-tab${activeTab === 'people' ? ' collab-tab--active' : ''}`} onClick={() => setActiveTab('people')}>
              People
            </button>
          </div>
        </div>
      </section>

      {activeTab === 'needs' ? (
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
                  {filtered.length} {filtered.length === 1 ? 'opportunity' : 'opportunities'}
                  {selectedCategory && ` in ${selectedCategory}`}
                  {searchQuery && ` matching "${searchQuery}"`}
                </p>
              )}
            </div>
          </section>

          <section className="collab-grid">
            <div className="container">
              <div className="task-grid">
                {filtered.map(task => (
                  <CollaborationTaskCard key={task.id} task={task} />
                ))}
                {filtered.length === 0 && (
                  <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No roles match your current filters. Try broadening your search.
                  </p>
                )}
              </div>
            </div>
          </section>
        </>
      ) : (
        <>
          {/* People search/filter */}
          <section className="collab-filters">
            <div className="container">
              <div className="filters-compact">
                <input
                  type="search"
                  placeholder="Search people by name or skill..."
                  value={peopleSearch}
                  onChange={e => setPeopleSearch(e.target.value)}
                  className="filter-search"
                  aria-label="Search people"
                />
                <div className="filter-pills">
                  {(['all', 'artist', 'collaborator'] as const).map(type => (
                    <button
                      key={type}
                      className={`filter-pill${peopleTypeFilter === type ? ' filter-pill--active' : ''}`}
                      onClick={() => setPeopleTypeFilter(type)}
                    >
                      {type === 'all' ? 'All' : type === 'artist' ? 'Artists' : 'Collaborators'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* People grid */}
          <section className="collab-grid">
            <div className="container">
              <div className="people-grid">
                {filteredProfiles.map(profile => (
                  <div key={profile.id} className="people-card">
                    <div className="people-card__avatar">
                      <Image
                        src={profile.photo}
                        alt={`Photo of ${profile.name}`}
                        width={64}
                        height={64}
                        sizes="64px"
                        loading="lazy"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div className="people-card__info">
                      <h3 className="people-card__name">{profile.name}</h3>
                      <Badge variant={profile.type === 'artist' ? 'domain' : 'pathway'}>{profile.type === 'artist' ? 'Artist' : 'Collaborator'}</Badge>
                      {profile.location && <p className="people-card__location">{profile.location}</p>}
                      <div className="people-card__skills">
                        {profile.specialties.slice(0, 3).map(s => (
                          <span key={s} className="skill-tag">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div className="people-card__actions">
                      <Link href={`/profiles/${profile.slug}`} className="btn btn--outline btn--sm">View Profile</Link>
                      {profile.email && (
                        <a href={`mailto:${profile.email}?subject=Collaboration%20Inquiry%20via%20Resonance%20Network`} className="btn btn--primary btn--sm">Connect</a>
                      )}
                    </div>
                  </div>
                ))}
                {filteredProfiles.length === 0 && (
                  <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-12) 0' }}>
                    No people match your search.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Offer Your Skills / Account CTA */}
          <section className="collab-available">
            <div className="container">
              <div className="collab-available__inner">
                <div className="collab-available__content" id="join-form" ref={formRef}>
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
                      <Link
                        href="/login?tab=signup&redirect=/dashboard/welcome"
                        className="btn btn--primary btn--large"
                        style={{ marginTop: 'var(--space-4)' }}
                      >
                        Join the Network &rarr;
                      </Link>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-3)' }}>
                        Already have an account?{' '}
                        <Link href="/login?redirect=/dashboard/profile" style={{ color: 'var(--color-primary)' }}>
                          Sign in
                        </Link>
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
    </>
  )
}
