'use client'

import { useState, useEffect } from 'react'

interface ProfileChecklistProps {
  hasAvatar: boolean
  hasBio: boolean
  hasSkills: boolean
  hasAvailability: boolean
  hasCover: boolean
  hasProject: boolean
  onEditSection?: (section: string) => void
}

const STORAGE_KEY = 'resonance-profile-checklist-dismissed'

export function ProfileChecklist({
  hasAvatar,
  hasBio,
  hasSkills,
  hasAvailability,
  hasCover,
  hasProject,
  onEditSection,
}: ProfileChecklistProps) {
  const [dismissed, setDismissed] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [allCompleteHidden, setAllCompleteHidden] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const val = localStorage.getItem(STORAGE_KEY)
      if (val === 'true') setDismissed(true)
    }
  }, [])

  const items = [
    { key: 'avatar', label: 'Add your profile photo', done: hasAvatar },
    { key: 'bio', label: 'Write your bio', done: hasBio },
    { key: 'skills', label: 'Add your skills (3+)', done: hasSkills },
    { key: 'availability', label: 'Set your availability', done: hasAvailability },
    { key: 'cover', label: 'Add a cover image', done: hasCover },
    { key: 'project', label: 'Add your first work', done: hasProject },
  ]

  const sectionMap: Record<string, string> = {
    avatar: 'avatar',
    bio: 'bio',
    skills: 'skills',
    availability: 'availability',
    cover: 'cover',
    project: 'work',
  }

  const completedCount = items.filter((i) => i.done).length
  const total = items.length
  const percentage = Math.round((completedCount / total) * 100)
  const allComplete = completedCount === total

  useEffect(() => {
    if (allComplete) {
      const timer = setTimeout(() => setAllCompleteHidden(true), 3000)
      return () => clearTimeout(timer)
    }
  }, [allComplete])

  function handleDismiss() {
    localStorage.setItem(STORAGE_KEY, 'true')
    setDismissed(true)
  }

  if (dismissed || allCompleteHidden) return null

  return (
    <div className={`profile-checklist${collapsed ? ' profile-checklist--collapsed' : ''}`}>
      <div className="profile-checklist__header">
        <span className="profile-checklist__title">
          {allComplete ? 'Profile Complete! \u{1F389}' : 'Complete Your Profile'}
        </span>
        <div className="profile-checklist__header-actions">
          <button
            className="profile-checklist__toggle"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Expand checklist' : 'Collapse checklist'}
          >
            {collapsed ? (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 11L9 7L13 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 7L9 11L13 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
          <button
            className="profile-checklist__close"
            onClick={handleDismiss}
            aria-label="Close checklist"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 5L13 13M13 5L5 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {!collapsed && (
        <>
          <div className="profile-checklist__progress">
            <div className="profile-checklist__progress-bar" style={{ width: `${percentage}%` }} />
          </div>
          <span className="profile-checklist__progress-text">{percentage}% complete</span>

          <ul className="profile-checklist__items">
            {items.map((item) => {
              const isClickable = !item.done && onEditSection
              return (
                <li
                  key={item.key}
                  className={`profile-checklist__item${item.done ? ' profile-checklist__item--done' : ''}${isClickable ? ' profile-checklist__item--clickable' : ''}`}
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
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="9" cy="9" r="8" fill="#22c55e"/>
                        <path d="M5.5 9.5L7.5 11.5L12.5 6.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>
                    )}
                  </span>
                  <span className="profile-checklist__label">{item.label}</span>
                </li>
              )
            })}
          </ul>

          <button className="profile-checklist__dismiss" onClick={handleDismiss}>
            Don&apos;t show this again
          </button>
        </>
      )}
    </div>
  )
}
