'use client'

import React, { useEffect } from 'react'
import type { ContentBlock } from '@/types'

type ContentBlockType = ContentBlock['type']

const BLOCK_TYPES: { type: ContentBlockType; label: string; description: string; icon: React.ReactNode }[] = [
  {
    type: 'text', label: 'Text', description: 'Rich text with formatting',
    icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><path d="M3 4h12M3 9h8M3 14h10" /></svg>,
  },
  {
    type: 'gallery', label: 'Image Gallery', description: 'Grid of images with lightbox',
    icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="6" height="6" rx="1" /><rect x="10" y="2" width="6" height="6" rx="1" /><rect x="2" y="10" width="6" height="6" rx="1" /><rect x="10" y="10" width="6" height="6" rx="1" /></svg>,
  },
  {
    type: 'video', label: 'Video', description: 'YouTube or Vimeo embed',
    icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><polygon points="7 5 14 9 7 13" /></svg>,
  },
  {
    type: 'project', label: 'Project', description: 'Project case study',
    icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6l1-3h12l1 3" /><rect x="2" y="6" width="14" height="10" rx="1" /></svg>,
  },
  {
    type: 'timeline', label: 'Timeline', description: 'Career & milestones',
    icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><circle cx="9" cy="9" r="6.5" /><path d="M9 5v4l2.5 2.5" /></svg>,
  },
  {
    type: 'testimonials', label: 'Testimonials', description: 'Quotes from collaborators',
    icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><path d="M4 7c0-1.5 1-3 3-3s2 1.5 2 2.5c0 2-2 2.5-3 4M10 7c0-1.5 1-3 3-3s2 1.5 2 2.5c0 2-2 2.5-3 4" /><circle cx="5.5" cy="14" r="0.5" fill="currentColor" /><circle cx="11.5" cy="14" r="0.5" fill="currentColor" /></svg>,
  },
  {
    type: 'links', label: 'Links', description: 'Social & portfolio links',
    icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><path d="M7.5 10.5l3-3M8 7.5H6a3 3 0 000 6h2M10 7.5h2a3 3 0 010 6h-2" /></svg>,
  },
  {
    type: 'embed', label: 'Embed', description: 'SoundCloud, Sketchfab, etc.',
    icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><polyline points="5 5 2 9 5 13" /><polyline points="13 5 16 9 13 13" /><line x1="10" y1="4" x2="8" y2="14" /></svg>,
  },
  {
    type: 'pdf', label: 'Document', description: 'PDF for download',
    icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 2h6l4 4v10a1 1 0 01-1 1H5a1 1 0 01-1-1V3a1 1 0 011-1z" /><polyline points="11 2 11 6 15 6" /></svg>,
  },
  {
    type: 'divider', label: 'Divider', description: 'Visual separator',
    icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><line x1="2" y1="9" x2="16" y2="9" /></svg>,
  },
  {
    type: 'skills', label: 'Skills & Tags', description: 'Specialty badges',
    icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h5l7 7-5 5-7-7V3z" /><circle cx="6.5" cy="6.5" r="1" fill="currentColor" /></svg>,
  },
  {
    type: 'audio', label: 'Audio', description: 'Audio player',
    icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M7 4v10l-4-3H1V7h2l4-3z" /><path d="M12 6.5a3.5 3.5 0 010 5M14 4.5a6 6 0 010 9" /></svg>,
  },
]

interface BlockPickerProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (type: ContentBlockType) => void
}

export default function BlockPicker({ isOpen, onClose, onSelect }: BlockPickerProps) {
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="block-picker-overlay" onClick={onClose}>
      <div className="block-picker" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h3>Add Block</h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: 'var(--color-text-muted)', padding: '4px' }}
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <div className="block-picker__grid">
          {BLOCK_TYPES.map(bt => (
            <button
              key={bt.type}
              type="button"
              className="block-picker__item"
              onClick={() => onSelect(bt.type)}
            >
              <div className="block-picker__item-icon">{bt.icon}</div>
              <div className="block-picker__item-label">{bt.label}</div>
              <div className="block-picker__item-desc">{bt.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
