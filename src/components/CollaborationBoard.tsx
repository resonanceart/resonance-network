'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Widget } from '@typeform/embed-react'
import type { CollaborationTask } from '@/types'
import { CollaborationTaskCard } from './CollaborationTaskCard'

const CATEGORIES = ['Engineering', 'Architecture', 'Fabrication', 'Production', 'Funding', 'Admin', 'Other']

const AVAILABILITY_FORM_ID = process.env.NEXT_PUBLIC_TYPEFORM_AVAILABILITY_FORM_ID || 'M0IS4LTD'

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
  const [activeTab, setActiveTab] = useState<'needs' | 'available'>('needs')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

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
            <button
              role="tab"
              aria-selected={activeTab === 'needs'}
              className={`collab-tab${activeTab === 'needs' ? ' collab-tab--active' : ''}`}
              onClick={() => setActiveTab('needs')}
            >
              Project Needs
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'available'}
              className={`collab-tab${activeTab === 'available' ? ' collab-tab--active' : ''}`}
              onClick={() => setActiveTab('available')}
            >
              Available Collaborators
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
      ) : (
        <section className="collab-available">
          <div className="container">
            <div className="collab-available__inner">
              <div className="collab-available__content">
                <h2>Offer Your Skills</h2>
                <p className="collab-available__body">
                  Are you an engineer, fabricator, designer, or specialist looking for meaningful projects? Fill out the form below and we&apos;ll connect you with curated projects that match your skills and values.
                </p>
                <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginTop: 'var(--space-6)' }}>
                  <Widget
                    id={AVAILABILITY_FORM_ID}
                    style={{ width: '100%', height: '500px' }}
                  />
                </div>
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
