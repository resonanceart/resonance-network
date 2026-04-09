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
  const [showAllConcepts, setShowAllConcepts] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedStage, setSelectedStage] = useState('')
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

  // Roles filtering — derive locations and stages from projects
  const allLocations = useMemo(() => {
    const set = new Set<string>()
    projects.forEach(p => { if (p.location) set.add(p.location) })
    return Array.from(set).sort()
  }, [projects])

  const STAGES = ['Concept', 'Design Development', 'Engineering', 'Fundraising', 'Production']

  const filteredTasks = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return tasks.filter(t => {
      const categoryMatch = !selectedCategory || t.category === selectedCategory
      const textMatch = !q || t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.projectTitle.toLowerCase().includes(q) || t.skillsNeeded.some(s => s.toLowerCase().includes(q))
      // Location/stage filter: match via the task's project
      const proj = projects.find(p => p.slug === t.projectId || p.id === t.projectId)
      const locationMatch = !selectedLocation || (proj && proj.location === selectedLocation)
      const stageMatch = !selectedStage || (proj && proj.stage === selectedStage)
      return categoryMatch && textMatch && locationMatch && stageMatch
    })
  }, [tasks, selectedCategory, searchQuery, selectedLocation, selectedStage, projects])

  function getProjectCount(profile: Profile): number {
    return projects.filter(pr => pr.leadArtistName === profile.name).length
  }

  return (
    <>
      {/* Compact Header + Tabs — get to content fast */}
      <section className="collab-header-section">
        <div className="container">
          <h1 className="collab-header__title">Community Connections Board</h1>
          <p className="collab-header__subtitle">
            Find roles on ambitious projects — or meet the people building them.
          </p>

          <div className="collab-tabs collab-tabs--prominent" role="tablist" aria-label="Community view">
            <button
              role="tab"
              aria-selected={activeTab === 'roles'}
              className={`collab-tab collab-tab--roles${activeTab === 'roles' ? ' collab-tab--active' : ''}`}
              onClick={() => setActiveTab('roles')}
            >
              Open Roles <span className="collab-tab__count">{tasks.length}</span>
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'people'}
              className={`collab-tab collab-tab--people${activeTab === 'people' ? ' collab-tab--active' : ''}`}
              onClick={() => setActiveTab('people')}
            >
              People <span className="collab-tab__count">{profiles.length}</span>
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
                      <h2 className="profile-card__name">
                        {profile.name}
                        {profile.badges && profile.badges.length > 0 && profile.badges.map(b => (
                          <span key={b} className="profile-card__badge" title={b.charAt(0).toUpperCase() + b.slice(1)}>
                            {b.toLowerCase() === 'founder' ? (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                            ) : (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                            )}
                          </span>
                        ))}
                      </h2>
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
                  <option value="">Category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <select
                  value={selectedLocation}
                  onChange={e => setSelectedLocation(e.target.value)}
                  className="filter-select"
                  aria-label="Filter by location"
                >
                  <option value="">Location</option>
                  {allLocations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                <select
                  value={selectedStage}
                  onChange={e => setSelectedStage(e.target.value)}
                  className="filter-select"
                  aria-label="Filter by stage"
                >
                  <option value="">Stage</option>
                  {STAGES.map(s => (
                    <option key={s} value={s}>{s}</option>
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

          {(() => {
            const liveTasks = filteredTasks.filter(t => t.source === 'supabase')
            const conceptTasks = filteredTasks.filter(t => t.source !== 'supabase')
            return (
              <>
                {/* Live Roles */}
                <section className="collab-grid">
                  <div className="container">
                    <p className="section-label">Live Roles</p>
                    {liveTasks.length > 0 ? (
                      <div className="task-grid">
                        {liveTasks.map(task => (
                          <CollaborationTaskCard key={task.id} task={task} />
                        ))}
                      </div>
                    ) : (
                      <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-6) 0' }}>
                        {filteredTasks.length === 0
                          ? 'No roles match your current filters. Try broadening your search.'
                          : 'No live roles yet. Be the first to submit a project with open roles.'}
                      </p>
                    )}
                  </div>
                </section>

                {/* AI Concept Roles */}
                {conceptTasks.length > 0 && (
                  <section className="collab-grid" style={{ borderTop: '1px solid var(--color-border)' }}>
                    <div className="container" style={{ paddingTop: 'var(--space-6)' }}>
                      <p className="section-label">AI Concept Roles</p>
                      <div className="task-grid">
                        {(showAllConcepts ? conceptTasks : conceptTasks.slice(0, 6)).map(task => (
                          <CollaborationTaskCard key={task.id} task={task} />
                        ))}
                      </div>
                      {conceptTasks.length > 6 && !showAllConcepts && (
                        <div style={{ textAlign: 'center', marginTop: 'var(--space-6)' }}>
                          <button
                            className="btn btn--outline"
                            onClick={() => setShowAllConcepts(true)}
                          >
                            Show More Roles ({conceptTasks.length - 6} more)
                          </button>
                        </div>
                      )}
                    </div>
                  </section>
                )}
              </>
            )
          })()}

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

      {/* How Collaboration Works — moved below content */}
      <section className="collab-how-section">
        <div className="container">
          <h3 className="collab-how-section__title">How Collaboration Works</h3>
          <div className="collab-steps collab-steps--compact">
            <div className="collab-step collab-step--pill"><span className="collab-step__number">1</span><strong>Browse projects that inspire you</strong></div>
            <div className="collab-step collab-step--pill"><span className="collab-step__number">2</span><strong>Express interest in a role</strong></div>
            <div className="collab-step collab-step--pill"><span className="collab-step__number">3</span><strong>Connect with the project team</strong></div>
            <div className="collab-step collab-step--pill"><span className="collab-step__number">4</span><strong>Define scope together</strong></div>
            <div className="collab-step collab-step--pill"><span className="collab-step__number">5</span><strong>Build something extraordinary</strong></div>
          </div>
        </div>
      </section>

      {/* What You Gain — moved to bottom */}
      <section className="collab-benefits-section">
        <div className="container">
          <h3 className="collab-benefits-section__title">What You Gain</h3>
          <div className="collab-benefits__grid">
            <div className="collab-benefit-card">
              <strong>Portfolio-worthy work</strong>
              <p>Contribute to ambitious projects you can proudly showcase — not commercial campaigns, but values-aligned creative work.</p>
            </div>
            <div className="collab-benefit-card">
              <strong>Credited contributions</strong>
              <p>Your role is publicly documented on the project page and linked to your profile.</p>
            </div>
            <div className="collab-benefit-card">
              <strong>Flexible commitment</strong>
              <p>From a 2-hour plan review to an ongoing team role — contribute at the level that works for you.</p>
            </div>
            <div className="collab-benefit-card">
              <strong>Meaningful relationships</strong>
              <p>Build long-term connections with visionary creators and fellow specialists — a guild, not a gig.</p>
            </div>
          </div>
        </div>
      </section>

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
