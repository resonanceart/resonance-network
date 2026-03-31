'use client'

import { useState } from 'react'

interface ProfileChecklistProps {
  hasAvatar: boolean
  hasBio: boolean
  hasSkills: boolean
  hasAvailability: boolean
  hasCover: boolean
  hasProject: boolean
  onEditSection?: (section: string) => void
}

const sectionMap: Record<string, string> = {
  avatar: 'avatar',
  bio: 'bio',
  skills: 'skills',
  availability: 'availability',
  cover: 'cover',
  project: 'pastWork',
}

export function ProfileChecklist({
  hasAvatar,
  hasBio,
  hasSkills,
  hasAvailability,
  hasCover,
  hasProject,
  onEditSection,
}: ProfileChecklistProps) {
  const [collapsed, setCollapsed] = useState(false)

  const items = [
    { key: 'avatar', label: 'Add your profile photo', done: hasAvatar },
    { key: 'bio', label: 'Write your bio', done: hasBio },
    { key: 'skills', label: 'Add your skills (3+)', done: hasSkills },
    { key: 'availability', label: 'Set your availability', done: hasAvailability },
    { key: 'cover', label: 'Add a cover image', done: hasCover },
    { key: 'project', label: 'Add images', done: hasProject },
  ]

  const completedCount = items.filter((i) => i.done).length
  const total = items.length
  const percentage = Math.round((completedCount / total) * 100)

  // Collapsed pill view
  if (collapsed) {
    return (
      <div className="profile-checklist profile-checklist--collapsed" onClick={() => setCollapsed(false)}>
        <div className="profile-checklist__pill">
          <div className="profile-checklist__pill-bar">
            <div className="profile-checklist__pill-fill" style={{ width: `${percentage}%` }} />
          </div>
          <span className="profile-checklist__pill-text">
            Profile: {percentage}%
          </span>
          <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M5 11L9 7L13 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      </div>
    )
  }

  // Expanded view — always visible
  return (
    <div className="profile-checklist">
      {/* Header */}
      <div className="profile-checklist__header">
        <div className="profile-checklist__header-left">
          <span className="profile-checklist__title">
            {percentage === 100 ? 'Profile Complete!' : 'Complete Your Profile'}
          </span>
          <span className="profile-checklist__percentage">{percentage}%</span>
        </div>
        <button
          className="profile-checklist__toggle"
          onClick={() => setCollapsed(true)}
          aria-label="Minimize checklist"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M5 7L9 11L13 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>

      {/* Progress bar */}
      <div className="profile-checklist__progress">
        <div className="profile-checklist__progress-bar" style={{ width: `${percentage}%` }} />
      </div>

      {/* Items */}
      <ul className="profile-checklist__items">
        {items.map((item) => {
          const isClickable = !item.done && onEditSection
          return (
            <li
              key={item.key}
              className={`profile-checklist__item${item.done ? ' profile-checklist__item--done' : ' profile-checklist__item--todo'}`}
              onClick={isClickable ? () => onEditSection!(sectionMap[item.key]) : undefined}
              role={isClickable ? 'button' : undefined}
              tabIndex={isClickable ? 0 : undefined}
              onKeyDown={isClickable ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onEditSection!(sectionMap[item.key])
                }
              } : undefined}
            >
              <span className="profile-checklist__check">
                {item.done ? (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="9" fill="#22c55e"/>
                    <path d="M6 10.5L8.5 13L14 7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="9" stroke="var(--color-border)" strokeWidth="1.5"/>
                  </svg>
                )}
              </span>
              <span className="profile-checklist__label">{item.label}</span>
              {isClickable && (
                <svg className="profile-checklist__arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
