'use client'

import { useState } from 'react'

export interface GalleryItem {
  id: string
  type: 'image' | 'pdf' | 'link'
  url: string
  thumbnail?: string
  title: string
  subtitle?: string
  order: number
}

interface SmartGalleryProps {
  items: GalleryItem[]
  editable?: boolean
  onReorder?: (items: GalleryItem[]) => void
  onDelete?: (id: string) => void
  onEditTitle?: (id: string, newTitle: string) => void
}

export function SmartGallery({ items, editable = false, onReorder, onDelete, onEditTitle }: SmartGalleryProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const sorted = [...items].sort((a, b) => a.order - b.order)

  function handleDragStart(index: number) {
    setDragIndex(index)
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault()
    if (dragIndex === null || dragIndex === index) return
  }

  function handleDrop(index: number) {
    if (dragIndex === null || dragIndex === index || !onReorder) return
    const reordered = [...sorted]
    const [moved] = reordered.splice(dragIndex, 1)
    reordered.splice(index, 0, moved)
    const updated = reordered.map((item, i) => ({ ...item, order: i }))
    onReorder(updated)
    setDragIndex(null)
  }

  function handleClick(item: GalleryItem) {
    if (editingId) return // Don't navigate while editing title
    if (item.type === 'pdf' || item.type === 'link') {
      window.open(item.url, '_blank', 'noopener,noreferrer')
    }
  }

  function startEditTitle(e: React.MouseEvent, item: GalleryItem) {
    e.stopPropagation()
    setEditingId(item.id)
    setEditText(item.title)
  }

  function saveTitle() {
    if (editingId && onEditTitle && editText.trim()) {
      onEditTitle(editingId, editText.trim())
    }
    setEditingId(null)
    setEditText('')
  }

  if (sorted.length === 0) return null

  return (
    <div className="smart-gallery">
      {sorted.map((item, i) => (
        <div
          key={item.id}
          className={`smart-gallery__tile smart-gallery__tile--${item.type}${item.type === 'link' && item.thumbnail ? ' smart-gallery__tile--has-thumb' : ''}${dragIndex === i ? ' smart-gallery__tile--dragging' : ''}`}
          onClick={() => handleClick(item)}
          draggable={editable && !editingId}
          onDragStart={() => handleDragStart(i)}
          onDragOver={(e) => handleDragOver(e, i)}
          onDrop={() => handleDrop(i)}
          onDragEnd={() => setDragIndex(null)}
        >
          {/* Image background */}
          {item.type === 'image' && (
            <img src={item.url} alt={item.title} className="smart-gallery__tile-img" />
          )}

          {/* PDF icon — large centered document */}
          {item.type === 'pdf' && (
            <div className="smart-gallery__icon">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <line x1="10" y1="9" x2="8" y2="9"/>
              </svg>
            </div>
          )}

          {/* Link tile — with optional thumbnail */}
          {item.type === 'link' && item.thumbnail && (
            <img src={item.thumbnail} alt={item.title} className="smart-gallery__tile-img" />
          )}
          {item.type === 'link' && !item.thumbnail && (
            <div className="smart-gallery__icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
              </svg>
            </div>
          )}

          {/* Hover overlay text */}
          <div className="smart-gallery__tile-body">
            {item.subtitle && <p className="smart-gallery__tile-subtitle">{item.subtitle}</p>}
            {editingId === item.id ? (
              <div onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <input
                  type="text"
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') setEditingId(null) }}
                  autoFocus
                  style={{
                    background: 'rgba(0,0,0,0.6)',
                    border: '1px solid rgba(255,255,255,0.4)',
                    borderRadius: 4,
                    color: 'white',
                    padding: '4px 8px',
                    fontSize: '0.9rem',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    width: '100%',
                    textAlign: 'center',
                  }}
                />
                <button onClick={saveTitle} style={{ background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>Save</button>
              </div>
            ) : (
              <h3 className="smart-gallery__tile-title">{item.title}</h3>
            )}
          </div>

          {/* Edit controls */}
          {editable && (
            <>
              <div className="smart-gallery__drag-handle" title="Drag to reorder">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><circle cx="5" cy="3" r="1.5"/><circle cx="11" cy="3" r="1.5"/><circle cx="5" cy="8" r="1.5"/><circle cx="11" cy="8" r="1.5"/><circle cx="5" cy="13" r="1.5"/><circle cx="11" cy="13" r="1.5"/></svg>
              </div>
              {/* Edit title button */}
              {onEditTitle && editingId !== item.id && (
                <button
                  className="smart-gallery__edit-title"
                  onClick={(e) => startEditTitle(e, item)}
                  title="Edit title"
                  style={{
                    position: 'absolute', bottom: 8, left: 8, zIndex: 2,
                    opacity: 0, transition: 'opacity 0.2s',
                    background: 'rgba(0,0,0,0.6)', color: 'white',
                    border: 'none', borderRadius: 4, padding: '3px 8px',
                    cursor: 'pointer', fontSize: '0.7rem',
                  }}
                >
                  ✎ Edit title
                </button>
              )}
              {onDelete && (
                <button
                  className="smart-gallery__delete"
                  onClick={(e) => { e.stopPropagation(); onDelete(item.id) }}
                  title="Remove"
                >
                  &times;
                </button>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  )
}
