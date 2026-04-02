'use client'

import { useState } from 'react'

interface Badge {
  badge_type: string
  label?: string
  description?: string
  project_name?: string
  awarded_at: string
}

interface BadgeType {
  id: string
  label: string
  symbol: string
  description: string
  category: string
}

const DEFAULT_BADGE_TYPES: BadgeType[] = [
  { id: 'founder', label: 'Founder', symbol: '⚡', description: 'One of the first members of Resonance Network', category: 'status' },
  { id: 'featured', label: 'Featured', symbol: '◆', description: 'Profile was featured on the homepage', category: 'status' },
  { id: 'project_collaborator', label: 'Project Collaborator', symbol: '⊕', description: 'Active collaborator on a project', category: 'project' },
  { id: 'project_lead', label: 'Project Lead', symbol: '★', description: 'Leading or created an approved project', category: 'project' },
  { id: 'multi_project', label: 'Multi-Project', symbol: '★★', description: 'Collaborated on 3 or more projects', category: 'project' },
  { id: 'pioneer', label: 'Pioneer', symbol: '✦', description: 'Completed profile within first week of joining', category: 'engagement' },
  { id: 'connector', label: 'Connector', symbol: '⇄', description: 'Sent 5 or more collaboration interest requests', category: 'engagement' },
  { id: 'portfolio_pro', label: 'Portfolio Pro', symbol: '▦', description: 'Added 5 or more gallery items to profile', category: 'engagement' },
  { id: 'networked', label: 'Networked', symbol: '◎', description: 'Followed 10 or more projects', category: 'engagement' },
  { id: 'builder', label: 'Builder', symbol: '⚒', description: 'Listed fabrication or engineering skills', category: 'skill' },
  { id: 'curator', label: 'Curator', symbol: '◈', description: 'Organized or curated projects', category: 'skill' },
]

interface ProfileBadgesProps {
  badges: Badge[]
  badgeTypes?: BadgeType[]
}

export function ProfileBadges({ badges, badgeTypes }: ProfileBadgesProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [expandedAll, setExpandedAll] = useState(false)
  const types = badgeTypes || DEFAULT_BADGE_TYPES

  if (!badges || badges.length === 0) return null

  const MAX_VISIBLE = 8
  const visible = expandedAll ? badges : badges.slice(0, MAX_VISIBLE)
  const overflow = badges.length - MAX_VISIBLE

  function getType(badge: Badge): BadgeType | undefined {
    return types.find(t => t.id === badge.badge_type)
  }

  return (
    <div className="profile-badges">
      {visible.map((badge, i) => {
        const type = getType(badge)
        // Use SVG icons for badges instead of text symbols
        const badgeId = badge.badge_type
        const symbolText = type?.symbol || '●'
        const label = badge.label || type?.label || badge.badge_type
        const description = badge.description || type?.description || ''
        const projectNote = badge.project_name ? ` — ${badge.project_name}` : ''
        const dateStr = badge.awarded_at
          ? new Date(badge.awarded_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          : ''

        return (
          <div
            key={`${badge.badge_type}-${badge.project_name || i}`}
            className="profile-badge"
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => setHoveredIndex(hoveredIndex === i ? null : i)}
            role="button"
            tabIndex={0}
            aria-label={label}
          >
            <span className="profile-badge__symbol">
              {badgeId === 'founder' ? (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="#FFD700"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              ) : badgeId === 'project_collaborator' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="9" cy="12" r="4"/><circle cx="15" cy="12" r="4"/></svg>
              ) : badgeId === 'project_lead' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFD700"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              ) : badgeId === 'pioneer' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5z"/></svg>
              ) : badgeId === 'featured' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFD700"><path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z"/></svg>
              ) : (
                <span style={{ fontSize: 16 }}>{symbolText}</span>
              )}
            </span>

            {hoveredIndex === i && (
              <div className="profile-badge__tooltip">
                <strong className="profile-badge__tooltip-title">{label}{projectNote}</strong>
                <span className="profile-badge__tooltip-desc">{description}</span>
                {dateStr && <span className="profile-badge__tooltip-date">Earned {dateStr}</span>}
              </div>
            )}
          </div>
        )
      })}

      {overflow > 0 && !expandedAll && (
        <button
          className="profile-badge profile-badge--more"
          onClick={() => setExpandedAll(true)}
        >
          +{overflow}
        </button>
      )}
    </div>
  )
}
