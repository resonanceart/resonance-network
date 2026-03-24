'use client'
import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
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

const SAMPLE_COLLABORATORS = [
  { name: "Maya Chen", photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face", skills: ["Structural Engineering", "Parametric Design"], availability: "Project-based" },
  { name: "James Okonkwo", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face", skills: ["Lighting Design", "Interactive Electronics"], availability: "Part-time" },
  { name: "Sofia Reyes", photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face", skills: ["Landscape Architecture", "Ecological Design"], availability: "Full-time" },
  { name: "Kai Tanaka", photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&crop=face", skills: ["Fabrication", "Bamboo Construction"], availability: "Project-based" },
  { name: "Amara Osei", photo: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop&crop=face", skills: ["Grant Writing", "Arts Administration"], availability: "Flexible" },
  { name: "Luca Romano", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face", skills: ["Sound Design", "Acoustic Engineering"], availability: "Part-time" },
]

export function CollaborationBoard({ tasks }: { tasks: CollaborationTask[] }) {
  const [activeTab, setActiveTab] = useState<'needs' | 'people' | 'available'>('needs')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // People tab state
  const [peopleSearch, setPeopleSearch] = useState('')
  const [peopleTypeFilter, setPeopleTypeFilter] = useState<'all' | 'artist' | 'collaborator'>('all')

  const profiles = (profilesData as Profile[]).filter(p => p.status === 'published')
  const allProjects = projectsData as Project[]

  // Profile form state
  const [profileName, setProfileName] = useState('')
  const [profileEmail, setProfileEmail] = useState('')
  const [profilePhoto, setProfilePhoto] = useState('')
  const [profileSkills, setProfileSkills] = useState('')
  const [profilePortfolio, setProfilePortfolio] = useState('')
  const [profileAvailability, setProfileAvailability] = useState('')
  const [profileNote, setProfileNote] = useState('')
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false)
  const [isProfileSubmitted, setIsProfileSubmitted] = useState(false)
  const [profileError, setProfileError] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const tab = new URLSearchParams(window.location.search).get('tab')
      if (tab === 'people') setActiveTab('people')
      if (tab === 'skills') setActiveTab('available')
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

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsProfileSubmitting(true)
    setProfileError('')
    try {
      const res = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileName,
          email: profileEmail,
          photoUrl: profilePhoto || undefined,
          skills: profileSkills,
          portfolio: profilePortfolio || undefined,
          availability: profileAvailability || undefined,
          notes: profileNote || undefined,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setIsProfileSubmitted(true)
      } else {
        setProfileError(data.message || 'Something went wrong.')
      }
    } catch {
      setProfileError('Network error. Please try again.')
    } finally {
      setIsProfileSubmitting(false)
    }
  }

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
          <p className="section-label">Open Roles</p>
          <h1>Put Your Skills to Work on Something You Believe In</h1>
          <p className="lead">
            Every role listed here is tied to a curated project with a real team behind it — from structural engineering to sound design to grant writing. This is meaningful work, not busywork.
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
              People in Network
            </button>
            <button role="tab" aria-selected={activeTab === 'available'} className={`collab-tab${activeTab === 'available' ? ' collab-tab--active' : ''}`} onClick={() => setActiveTab('available')}>
              Offer Your Skills
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
                  <p
                    style={{
                      gridColumn: '1/-1',
                      textAlign: 'center',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    No roles match your current filters. Try broadening your search.
                  </p>
                )}
              </div>
            </div>
          </section>
        </>
      ) : activeTab === 'people' ? (
        <>
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
                {SAMPLE_COLLABORATORS.map((collab, i) => (
                  <div key={`sample-${i}`} className="people-card">
                    <div className="people-card__avatar">
                      <Image
                        src={collab.photo}
                        alt={`Photo of ${collab.name}`}
                        width={64}
                        height={64}
                        sizes="64px"
                        loading="lazy"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div className="people-card__info">
                      <h3 className="people-card__name">{collab.name}</h3>
                      <Badge variant="stage">Coming Soon</Badge>
                      <div className="people-card__skills">
                        {collab.skills.map(s => (
                          <span key={s} className="skill-tag">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div className="people-card__actions">
                      <Link href="/profiles" className="btn btn--outline btn--sm">Directory</Link>
                    </div>
                  </div>
                ))}
                {filteredProfiles.length === 0 && SAMPLE_COLLABORATORS.length === 0 && (
                  <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-12) 0' }}>
                    No people match your search.
                  </p>
                )}
              </div>
              <p style={{ textAlign: 'center', marginTop: 'var(--space-8)' }}>
                <button className="btn btn--primary" onClick={() => setActiveTab('available')}>
                  Join the Network — Create your profile
                </button>
              </p>
            </div>
          </section>
        </>
      ) : (
        <section className="collab-available">
          <div className="container">
            {/* Roster showcase */}
            <div className="collab-roster-section">
              <p className="section-label">Available Now</p>
              <h2>People Ready to Collaborate</h2>
              <div className="collab-roster">
                {SAMPLE_COLLABORATORS.map(person => (
                  <div key={person.name} className="collab-roster-card">
                    <Image
                      src={person.photo}
                      alt={person.name}
                      width={64}
                      height={64}
                      className="collab-roster-card__photo"
                    />
                    <p className="collab-roster-card__name">{person.name}</p>
                    <div className="collab-roster-card__skills">
                      {person.skills.map(skill => (
                        <span key={skill} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                    <p className="collab-roster-card__availability">{person.availability}</p>
                  </div>
                ))}
              </div>
              <p className="collab-roster-note">These are community members who have offered their expertise. Submit your profile below to join them.</p>
            </div>

            {/* Existing form section */}
            <div className="collab-available__inner">
              <div className="collab-available__content">
                <h2>Offer Your Skills</h2>
                <p className="collab-available__body">
                  Are you an engineer, fabricator, designer, or specialist looking for meaningful projects? Fill out the form below and we&apos;ll connect you with curated projects that match your skills and values.
                </p>

                {isProfileSubmitted ? (
                  <div className="collab-available__confirmation">
                    <div className="form-success">
                      <span className="form-success__icon" aria-hidden="true">✓</span>
                      <p>Thanks! We&apos;ve received your profile. We&apos;ll connect you with matching projects soon.</p>
                    </div>
                  </div>
                ) : (
                  <form className="collab-profile-form" onSubmit={handleProfileSubmit}>
                    {profileError && <p className="form-error">{profileError}</p>}
                    <div className="form-group">
                      <label htmlFor="profile-name" className="form-label">Full Name *</label>
                      <input
                        id="profile-name"
                        type="text"
                        required
                        value={profileName}
                        onChange={e => setProfileName(e.target.value)}
                        placeholder="Your full name"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="profile-email" className="form-label">Email *</label>
                      <input
                        id="profile-email"
                        type="email"
                        required
                        value={profileEmail}
                        onChange={e => setProfileEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="profile-photo" className="form-label">Photo URL</label>
                      <input
                        id="profile-photo"
                        type="url"
                        value={profilePhoto}
                        onChange={e => setProfilePhoto(e.target.value)}
                        placeholder="Link to your headshot or profile photo"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="profile-skills" className="form-label">Skills and Expertise *</label>
                      <textarea
                        id="profile-skills"
                        required
                        value={profileSkills}
                        onChange={e => setProfileSkills(e.target.value)}
                        placeholder="What do you bring? Engineering, design, fabrication, etc."
                        rows={3}
                        className="form-textarea"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="profile-portfolio" className="form-label">Portfolio / Past Projects</label>
                      <textarea
                        id="profile-portfolio"
                        value={profilePortfolio}
                        onChange={e => setProfilePortfolio(e.target.value)}
                        placeholder="Links to portfolio, past projects, or relevant work"
                        rows={2}
                        className="form-textarea"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="profile-availability" className="form-label">Availability</label>
                      <select
                        id="profile-availability"
                        value={profileAvailability}
                        onChange={e => setProfileAvailability(e.target.value)}
                        className="form-select"
                      >
                        <option value="">Select availability...</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Project-based">Project-based</option>
                        <option value="Flexible">Flexible</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="profile-note" className="form-label">Additional Notes</label>
                      <textarea
                        id="profile-note"
                        value={profileNote}
                        onChange={e => setProfileNote(e.target.value)}
                        placeholder="Anything else you'd like us to know?"
                        rows={2}
                        className="form-textarea"
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn btn--primary btn--large"
                      disabled={isProfileSubmitting}
                    >
                      {isProfileSubmitting ? 'Submitting...' : 'Submit Profile'}
                    </button>
                  </form>
                )}
              </div>
              <div className="collab-available__skills">
                <p className="collab-available__skills-title">Skills in demand right now:</p>
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
      )}
    </>
  )
}
