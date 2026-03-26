'use client'
import { useState } from 'react'
import type { ProfileTimelineEntry } from '@/types'

function getCategoryIcon(category: ProfileTimelineEntry['category']) {
  switch (category) {
    case 'award':
      return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.5l-3.7 1.8.7-4.1-3-2.9 4.2-.7L8 1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>
    case 'education':
      return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 6l6-3 6 3-6 3-6-3z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/><path d="M11 7.5v3.5c0 1-1.5 2-3 2s-3-1-3-2V7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    case 'exhibition':
      return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="2" y="3" width="12" height="9" rx="1" stroke="currentColor" strokeWidth="1.2"/><path d="M5 14h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
    case 'residency':
      return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6c0 3.5 4.5 8.5 4.5 8.5s4.5-5 4.5-8.5c0-2.5-2-4.5-4.5-4.5z" stroke="currentColor" strokeWidth="1.2"/><circle cx="8" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.2"/></svg>
    case 'career':
      return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="2" y="5" width="12" height="8" rx="1" stroke="currentColor" strokeWidth="1.2"/><path d="M5 5V3.5A1.5 1.5 0 016.5 2h3A1.5 1.5 0 0111 3.5V5" stroke="currentColor" strokeWidth="1.2"/></svg>
    case 'publication':
      return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="2" y="1" width="9" height="13" rx="1" stroke="currentColor" strokeWidth="1.2"/><path d="M5 4h3M5 6.5h3M5 9h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M11 4h1.5a1.5 1.5 0 011.5 1.5v8a1.5 1.5 0 01-1.5 1.5H5" stroke="currentColor" strokeWidth="1.2"/></svg>
    default:
      return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.2"/></svg>
  }
}

export function ProfileTimeline({ entries }: { entries: ProfileTimelineEntry[] }) {
  const [showAll, setShowAll] = useState(false)

  // Group by year, most recent first
  const grouped = entries.reduce<Record<string, ProfileTimelineEntry[]>>((acc, entry) => {
    if (!acc[entry.year]) acc[entry.year] = []
    acc[entry.year].push(entry)
    return acc
  }, {})
  const years = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  // Flatten for counting
  const allEntries = years.flatMap(y => grouped[y].map(e => ({ ...e, _year: y })))
  const shouldTruncate = allEntries.length > 8 && !showAll
  const visibleCount = shouldTruncate ? 6 : allEntries.length

  let rendered = 0

  return (
    <div className="profile-timeline">
      {years.map(year => {
        const yearEntries = grouped[year]
        const visibleYearEntries = yearEntries.filter(() => {
          if (rendered >= visibleCount) return false
          rendered++
          return true
        })
        if (visibleYearEntries.length === 0) return null
        return (
          <div key={year} className="profile-timeline__year-group">
            <div className="profile-timeline__year-label">{year}</div>
            {visibleYearEntries.map((entry, i) => (
              <div key={i} className="profile-timeline__entry">
                <div className="profile-timeline__marker">
                  {getCategoryIcon(entry.category)}
                </div>
                <div className="profile-timeline__content">
                  <span className="profile-timeline__title">{entry.title}</span>
                  {entry.organization && <span className="profile-timeline__org">{entry.organization}</span>}
                  {entry.description && <p className="profile-timeline__desc">{entry.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )
      })}
      {allEntries.length > 8 && !showAll && (
        <button className="btn btn--ghost btn--sm" onClick={() => setShowAll(true)} style={{ marginTop: 'var(--space-3)' }}>
          Show all ({allEntries.length} entries)
        </button>
      )}
    </div>
  )
}
