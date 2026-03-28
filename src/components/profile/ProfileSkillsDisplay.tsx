'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { ProfileSkill } from '@/types'

interface ProfileSkillsDisplayProps {
  skills: ProfileSkill[]
}

const CATEGORY_COLORS: Record<ProfileSkill['category'], string> = {
  design: 'var(--badge-engineering)',
  architecture: 'var(--badge-architecture)',
  fabrication: 'var(--badge-fabrication)',
  sound: 'var(--badge-production)',
  technology: 'var(--badge-engineering)',
  production: 'var(--badge-production)',
  strategy: 'var(--badge-funding)',
  community: 'var(--badge-domain)',
}

const DEFAULT_VISIBLE = 10

export function ProfileSkillsDisplay({ skills }: ProfileSkillsDisplayProps) {
  const [expanded, setExpanded] = useState(false)

  if (!skills || skills.length === 0) return null

  // Sort all skills by display_order
  const sorted = [...skills].sort((a, b) => a.display_order - b.display_order)

  // Determine which skills to show
  const visibleSkills = expanded ? sorted : sorted.slice(0, DEFAULT_VISIBLE)
  const hasMore = sorted.length > DEFAULT_VISIBLE

  // Group visible skills by category, preserving the order categories first appear
  const categoryOrder: ProfileSkill['category'][] = []
  const grouped = new Map<ProfileSkill['category'], ProfileSkill[]>()

  for (const skill of visibleSkills) {
    if (!grouped.has(skill.category)) {
      categoryOrder.push(skill.category)
      grouped.set(skill.category, [])
    }
    grouped.get(skill.category)!.push(skill)
  }

  return (
    <div className="profile-skills-display">
      {categoryOrder.map(category => {
        const categorySkills = grouped.get(category)!
        return (
          <div key={category} className="profile-skills-display__category">
            <span className="profile-skills-display__category-label">
              <span
                className="profile-skills-display__dot"
                style={{ backgroundColor: CATEGORY_COLORS[category] }}
              />
              {category}
            </span>
            <div className="profile-skills-display__pills">
              {categorySkills.map(skill => (
                <Link
                  key={skill.id}
                  href={`/profiles?skill=${encodeURIComponent(skill.skill_name)}`}
                  className="profile-skills-display__pill"
                >
                  {skill.skill_name}
                </Link>
              ))}
            </div>
          </div>
        )
      })}

      {hasMore && !expanded && (
        <button
          className="profile-skills-display__expand"
          onClick={() => setExpanded(true)}
        >
          Show all {sorted.length} skills
        </button>
      )}
    </div>
  )
}
