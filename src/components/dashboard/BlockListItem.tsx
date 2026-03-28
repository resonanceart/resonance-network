'use client'

import React, { useState } from 'react'
import type { ContentBlock } from '@/types'

const BLOCK_TYPE_ICONS: Record<ContentBlock['type'], React.ReactNode> = {
  text: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><path d="M3 4h10M3 8h6M3 12h8" /></svg>,
  gallery: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="2" y="2" width="5" height="5" rx="1" /><rect x="9" y="2" width="5" height="5" rx="1" /><rect x="2" y="9" width="5" height="5" rx="1" /><rect x="9" y="9" width="5" height="5" rx="1" /></svg>,
  video: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"><polygon points="6 4 13 8 6 12" /></svg>,
  project: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M2 5l1-2.5h10l1 2.5" /><rect x="2" y="5" width="12" height="9" rx="1" /></svg>,
  timeline: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><circle cx="8" cy="8" r="5.5" /><path d="M8 4.5v3.5l2 2" /></svg>,
  testimonials: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><path d="M4 6c0-1.3.8-2.5 2.5-2.5S8.5 4.7 8.5 5.5c0 1.7-1.5 2-2.5 3.5" /><circle cx="5" cy="12" r="0.5" fill="currentColor" /></svg>,
  links: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><path d="M6.5 9.5l3-3M7 6.5H5.5a2.5 2.5 0 000 5H7M9 6.5h1.5a2.5 2.5 0 010 5H9" /></svg>,
  embed: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="5 4 2 8 5 12" /><polyline points="11 4 14 8 11 12" /><line x1="9" y1="3" x2="7" y2="13" /></svg>,
  pdf: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"><path d="M4.5 2h5.5l3 3v9a1 1 0 01-1 1h-7.5a1 1 0 01-1-1V3a1 1 0 011-1z" /><polyline points="10 2 10 5 13 5" /></svg>,
  divider: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><line x1="2" y1="8" x2="14" y2="8" /></svg>,
  skills: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"><path d="M3 3h4l6 6-4 4-6-6V3z" /><circle cx="5.5" cy="5.5" r="0.8" fill="currentColor" /></svg>,
  audio: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4v8l-3-2.5H1V6.5h2L6 4z" /><path d="M10 5.8a3 3 0 010 4.4" /></svg>,
}

interface BlockListItemProps {
  block: ContentBlock
  label: string
  onEdit: () => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onToggleVisibility: () => void
  isEditing: boolean
  isFirst: boolean
  isLast: boolean
  children: React.ReactNode
}

export default function BlockListItem({
  block,
  label,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  onToggleVisibility,
  isEditing,
  isFirst,
  isLast,
  children,
}: BlockListItemProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  function handleDelete() {
    if (confirmDelete) {
      onDelete()
      setConfirmDelete(false)
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
    }
  }

  return (
    <div className={`block-list-item${block.visible === false ? ' block-list-item--hidden' : ''}`}>
      <div className="block-list-item__header">
        <span className="block-list-item__icon">
          {BLOCK_TYPE_ICONS[block.type]}
        </span>
        <span className="block-list-item__label">{label}</span>
        <div className="block-list-item__actions">
          <button
            type="button"
            className="block-list-item__action"
            onClick={onMoveUp}
            disabled={isFirst}
            title="Move up"
            aria-label="Move up"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 11V3M3.5 6.5L7 3l3.5 3.5" /></svg>
          </button>
          <button
            type="button"
            className="block-list-item__action"
            onClick={onMoveDown}
            disabled={isLast}
            title="Move down"
            aria-label="Move down"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 3v8M3.5 7.5L7 11l3.5-3.5" /></svg>
          </button>
          <button
            type="button"
            className="block-list-item__action"
            onClick={onToggleVisibility}
            title={block.visible !== false ? 'Hide block' : 'Show block'}
            aria-label={block.visible !== false ? 'Hide block' : 'Show block'}
          >
            {block.visible !== false ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><path d="M1 7s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z" /><circle cx="7" cy="7" r="2" /></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><path d="M1 7s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z" /><line x1="2" y1="2" x2="12" y2="12" /></svg>
            )}
          </button>
          <button
            type="button"
            className="block-list-item__action"
            onClick={onEdit}
            title={isEditing ? 'Done' : 'Edit'}
            aria-label={isEditing ? 'Done' : 'Edit'}
          >
            {isEditing ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 7 6 10 11 4" /></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 2.5l3 3L4.5 12.5H1.5v-3l7-7z" /></svg>
            )}
          </button>
          <button
            type="button"
            className={`block-list-item__action block-list-item__action--danger`}
            onClick={handleDelete}
            title={confirmDelete ? 'Click again to confirm' : 'Delete'}
            aria-label="Delete block"
          >
            {confirmDelete ? (
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#dc2626' }}>Sure?</span>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 4 11 4" /><path d="M5 4V2.5h4V4M4 4l.5 8.5h5l.5-8.5" /></svg>
            )}
          </button>
        </div>
      </div>
      {isEditing && (
        <div className="block-list-item__body">
          {children}
        </div>
      )}
    </div>
  )
}
