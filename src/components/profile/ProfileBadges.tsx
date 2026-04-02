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
        const symbol = type?.symbol || '●'
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
            <span className="profile-badge__symbol">{symbol}</span>

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
