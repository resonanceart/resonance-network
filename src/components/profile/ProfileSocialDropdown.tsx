'use client'

import { useState, useRef, useEffect } from 'react'
import type { ProfileSocialLink } from '@/types'

function getSocialIcon(platform: string) {
  switch (platform) {
    case 'instagram':
      return <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true"><rect x="1.5" y="1.5" width="15" height="15" rx="4" stroke="currentColor" strokeWidth="1.3"/><circle cx="9" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="13.5" cy="4.5" r="1" fill="currentColor"/></svg>
    case 'linkedin':
      return <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true"><rect x="1.5" y="1.5" width="15" height="15" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M5.5 8v4.5M5.5 5.5v.01M8 12.5V9.5c0-1.2.6-1.8 1.7-1.8 1.1 0 1.6.6 1.6 1.8v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
    case 'behance':
      return <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M2 5h4c1.7 0 2.5 1 2.5 2.2 0 .9-.5 1.5-1.2 1.8 1 .3 1.5 1.1 1.5 2.1 0 1.5-1 2.4-2.8 2.4H2V5z" stroke="currentColor" strokeWidth="1.3"/><path d="M10.5 10.5h5c0-1.7-1-3-2.5-3s-2.5 1.3-2.5 3c0 1.7 1 3 2.5 3 1 0 1.8-.5 2.2-1.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M10.5 5.5h4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
    case 'github':
      return <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M9 1.5C4.9 1.5 1.5 4.9 1.5 9c0 3.3 2.1 6.1 5.1 7.1.4.1.5-.2.5-.4v-1.3c-2.1.5-2.5-1-2.5-1-.3-.8-.8-1.1-.8-1.1-.7-.5.1-.5.1-.5.7.1 1.1.7 1.1.7.6 1.1 1.7.8 2.1.6.1-.5.3-.8.5-.9-1.7-.2-3.4-.8-3.4-3.8 0-.8.3-1.5.7-2-.1-.2-.3-1 .1-2 0 0 .6-.2 2 .7.6-.2 1.2-.3 1.8-.3s1.2.1 1.8.3c1.4-.9 2-.7 2-.7.4 1 .2 1.8.1 2 .5.5.7 1.2.7 2 0 3-1.7 3.6-3.4 3.8.3.2.5.7.5 1.4v2.1c0 .2.1.5.5.4 3-1 5.1-3.8 5.1-7.1C16.5 4.9 13.1 1.5 9 1.5z" stroke="currentColor" strokeWidth="1.1"/></svg>
    case 'youtube':
      return <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true"><rect x="1.5" y="3.5" width="15" height="11" rx="3" stroke="currentColor" strokeWidth="1.3"/><path d="M7.5 6.5l4 2.5-4 2.5V6.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>
    case 'x':
      return <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M2.5 2.5l5.2 7L2.5 15.5h1.3l4.5-5.2 3.7 5.2h4.5L11 8.2l4.5-5.7h-1.3L10.3 7.2 7 2.5H2.5z" stroke="currentColor" strokeWidth="1.1"/></svg>
    case 'tiktok':
      return <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M10 2v9a3 3 0 11-2.5-2.96" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M10 5c1 1 2.5 1.5 4 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
    case 'vimeo':
      return <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M2 7c.2 2 1.5 3.8 2.5 4.8C6 13.3 8 15 10 15c2 0 3.5-1.5 4.5-4.5 1-3 1-4.5.5-5.5s-1.5-1.5-3-1c-1 .3-1.8 1.2-2 2.5.5-.3 1-.4 1.5-.2.5.2.5.7.3 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
    case 'spotify':
      return <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true"><circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.3"/><path d="M5 7.5c2.5-1 5.5-.8 8 .5M5.5 10c2-.8 4.5-.6 6.5.4M6 12.5c1.5-.6 3.5-.5 5 .3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
    case 'soundcloud':
      return <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M1.5 11V9M3.5 12V8M5.5 13V7M7.5 13V6M9.5 13V5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M11 5c2.5 0 4.5 1.8 4.5 4s-2 4-4.5 4" stroke="currentColor" strokeWidth="1.3"/></svg>
    case 'dribbble':
      return <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true"><circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.3"/><path d="M2.5 7c2 0 5 .5 7.5-1s3.5-3.5 4-4.5M2 10c3-1 6-1 9 1s4.5 3 5 4M6 2.5c0 3 1 7 4 10s5 3.5 6 3.5" stroke="currentColor" strokeWidth="1.3"/></svg>
    case 'artstation':
      return <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M2.5 13.5L7 4.5h4l4.5 9h-3L11 10.5H5.5L4 13.5H2.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M13 10.5l2 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
    case 'facebook':
      return <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M16.5 9a7.5 7.5 0 10-8.7 7.4v-5.2H5.9V9h1.9V7.3c0-1.9 1.1-2.9 2.8-2.9.8 0 1.6.1 1.6.1v1.8h-.9c-.9 0-1.2.6-1.2 1.1V9h2.1l-.3 2.2h-1.8v5.2A7.5 7.5 0 0016.5 9z" stroke="currentColor" strokeWidth="1.2"/></svg>
    case 'linktree':
      return <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M9 2v14M5 6l4-4 4 4M5 10h8M6 14h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
    default:
      return <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true"><circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.3"/><path d="M2 9h14M9 2c2 2 3 4.5 3 7s-1 5-3 7c-2-2-3-4.5-3-7s1-5 3-7z" stroke="currentColor" strokeWidth="1.3"/></svg>
  }
}

interface ProfileSocialDropdownProps {
  socialLinks: ProfileSocialLink[]
}

export function ProfileSocialDropdown({ socialLinks }: ProfileSocialDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const sorted = [...socialLinks].sort((a, b) => a.display_order - b.display_order)

  return (
    <div className="profile-social-dropdown" ref={ref}>
      <button
        type="button"
        className="profile-link-btn--pill"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <circle cx="4" cy="7" r="1.2" fill="currentColor" />
          <circle cx="7" cy="7" r="1.2" fill="currentColor" />
          <circle cx="10" cy="7" r="1.2" fill="currentColor" />
        </svg>
        Social
        <svg
          width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"
          style={{ marginLeft: '2px', transition: 'transform 0.15s', transform: open ? 'rotate(180deg)' : undefined }}
        >
          <path d="M2.5 4l2.5 2.5L7.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="profile-social-dropdown__menu">
          {sorted.map(link => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="profile-social-dropdown__item"
              onClick={() => setOpen(false)}
            >
              {getSocialIcon(link.platform)}
              <span>{link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
