'use client'
import { useState, useMemo } from 'react'
import type { CollaborationTask } from '@/types'
import { CollaborationTaskCard } from './CollaborationTaskCard'

const CATEGORIES = ['Engineering', 'Architecture', 'Fabrication', 'Production', 'Funding', 'Admin', 'Other']

export function CollaborationBoard({ tasks }: { tasks: CollaborationTask[] }) {
  const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set())
  const [activeSkills, setActiveSkills] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')

  const allSkills = useMemo(() => {
    const skills = new Set<string>()
    tasks.forEach(t => t.skillsNeeded.forEach(s => skills.add(s)))
    return Array.from(skills).sort()
  }, [tasks])

  const toggleCategory = (cat: string) => {
    if (cat === 'all') {
      setActiveCategories(new Set())
      return
    }
    setActiveCategories(prev => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  const toggleSkill = (skill: string) => {
    if (skill === 'all') {
      setActiveSkills(new Set())
      return
    }
    setActiveSkills(prev => {
      const next = new Set(prev)
      if (next.has(skill)) next.delete(skill)
      else next.add(skill)
      return next
    })
  }

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return tasks.filter(t => {
      const categoryMatch = activeCategories.size === 0 || activeCategories.has(t.category)
      const skillMatch = activeSkills.size === 0 || t.skillsNeeded.some(s => activeSkills.has(s))
      const textMatch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.projectTitle.toLowerCase().includes(q) ||
        t.skillsNeeded.some(s => s.toLowerCase().includes(q))
      return categoryMatch && skillMatch && textMatch
    })
  }, [tasks, activeCategories, activeSkills, searchQuery])

  return (
    <>
      <section className="collab-header">
        <div className="container">
          <p className="section-label">Opportunities</p>
          <h1>Collaboration Opportunities</h1>
          <p className="lead">
            Connect your skills with projects that need your expertise. Every opportunity here is
            attached to a curated, serious project seeking specific help.
          </p>
        </div>
      </section>

      <section className="collab-filters">
        <div className="container">
          <div className="filter-section" style={{ marginBottom: 'var(--space-4)' }}>
            <input
              type="search"
              placeholder="Search opportunities…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                maxWidth: '400px',
                padding: '0.5rem 1rem',
                fontSize: 'var(--text-sm)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
              }}
              aria-label="Search collaboration opportunities"
            />
          </div>

          <div className="filter-section">
            <span className="filter-label">Category</span>
            <div className="filter-group">
              <button
                className={`filter-btn${activeCategories.size === 0 ? ' active' : ''}`}
                type="button"
                onClick={() => toggleCategory('all')}
              >
                All
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`filter-btn${activeCategories.has(cat) ? ' active' : ''}`}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <span className="filter-label">Skills</span>
            <div className="filter-group">
              <button
                className={`filter-btn${activeSkills.size === 0 ? ' active' : ''}`}
                type="button"
                onClick={() => toggleSkill('all')}
              >
                All Skills
              </button>
              {allSkills.map(skill => (
                <button
                  key={skill}
                  className={`filter-btn${activeSkills.has(skill) ? ' active' : ''}`}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
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
                No opportunities match your filters.
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
