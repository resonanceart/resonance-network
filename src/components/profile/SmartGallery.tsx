'use client'

import { useState, useRef } from 'react'

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
  onEditThumbnail?: (id: string, thumbnailUrl: string) => void
}

export function SmartGallery({ items, editable = false, onReorder, onDelete, onEditTitle, onEditThumbnail }: SmartGalleryProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [thumbnailTargetId, setThumbnailTargetId] = useState<string | null>(null)
  const [failedThumbnails, setFailedThumbnails] = useState<Set<string>>(new Set())
  const sorted = [...items].sort((a, b) => a.order - b.order)

  function handleDragStart(index: number) { setDragIndex(index) }
  function handleDragOver(e: React.DragEvent) { e.preventDefault() }
  function handleDrop(index: number) {
    if (dragIndex === null || dragIndex === index || !onReorder) return
    const reordered = [...sorted]
    const [moved] = reordered.splice(dragIndex, 1)
    reordered.splice(index, 0, moved)
    onReorder(reordered.map((item, i) => ({ ...item, order: i })))
    setDragIndex(null)
  }

  function handleClick(item: GalleryItem) {
    if (editingId) return
    if (item.type === 'pdf' || item.type === 'link') {
      window.open(item.url, '_blank', 'noopener,noreferrer')
    }
  }

  function startEdit(e: React.MouseEvent, item: GalleryItem) {
    e.stopPropagation()
    setEditingId(item.id)
    setEditText(item.title)
  }

  function saveEdit() {
    if (editingId && onEditTitle && editText.trim()) {
      onEditTitle(editingId, editText.trim())
    }
    setEditingId(null)
  }

  function startThumbnailUpload(e: React.MouseEvent, itemId: string) {
    e.stopPropagation()
    setThumbnailTargetId(itemId)
    fileInputRef.current?.click()
  }

  async function handleThumbnailFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !thumbnailTargetId || !onEditThumbnail) return
    // Upload via /api/upload
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'gallery')
    try {
      const res = await fetch('/api/upload', { method: 'POST', credentials: 'same-origin', body: formData })
      if (res.ok) {
        const data = await res.json()
        if (data.url) onEditThumbnail(thumbnailTargetId, data.url)
      }
    } catch {}
    setThumbnailTargetId(null)
    e.target.value = ''
  }

  if (sorted.length === 0) return null

  return (
    <div className="smart-gallery">
      {/* Hidden file input for thumbnail uploads */}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleThumbnailFile} style={{ display: 'none' }} />

      {sorted.map((item, i) => {
        const isEditing = editingId === item.id
        const thumbFailed = failedThumbnails.has(item.id)
        const hasWorkingThumb = !!(item.thumbnail && !thumbFailed)
        const hasThumbnail = !!(hasWorkingThumb || (item.type === 'image'))

        return (
          <div
            key={item.id}
            className={`smart-gallery__tile smart-gallery__tile--${item.type}${hasThumbnail && item.type !== 'image' ? ' smart-gallery__tile--has-thumb' : ''}${dragIndex === i ? ' smart-gallery__tile--dragging' : ''}`}
            onClick={() => handleClick(item)}
            draggable={editable && !isEditing}
            onDragStart={() => handleDragStart(i)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(i)}
            onDragEnd={() => setDragIndex(null)}
          >
            {/* Background image — for images and tiles with thumbnails */}
            {item.type === 'image' && item.url ? (
              <img src={item.url} alt={item.title} className="smart-gallery__tile-img" />
            ) : item.type === 'image' && (
              <div className="smart-gallery__icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
            )}
            {item.type !== 'image' && hasWorkingThumb && (
              <img src={item.thumbnail} alt={item.title} className="smart-gallery__tile-img"
                onError={() => setFailedThumbnails(prev => new Set(prev).add(item.id))} />
            )}

            {/* PDF icon overlay — show when no thumbnail or thumbnail failed */}
            {item.type === 'pdf' && !hasWorkingThumb && (
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

            {/* Link icon overlay — show when no thumbnail or thumbnail failed */}
            {item.type === 'link' && !hasWorkingThumb && (
              <div className="smart-gallery__icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
                </svg>
              </div>
            )}

            {/* Hover overlay with title — always visible bottom gradient */}
            <div className="smart-gallery__tile-body">
              {item.subtitle && <p className="smart-gallery__tile-subtitle">{item.subtitle}</p>}
              {isEditing ? (
                <div onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: 6, alignItems: 'center', pointerEvents: 'auto' }}>
                  <input
                    type="text" value={editText}
                    onChange={e => setEditText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingId(null) }}
                    autoFocus
                    style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.5)', borderRadius: 4, color: 'white', padding: '6px 10px', fontSize: '0.9rem', fontWeight: 700, width: '100%', textAlign: 'center' }}
                  />
                  <button onClick={saveEdit} style={{ background: '#01696F', color: 'white', border: 'none', borderRadius: 4, padding: '6px 12px', cursor: 'pointer', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>Save</button>
                </div>
              ) : (
                <h3 className="smart-gallery__tile-title">{item.title}</h3>
              )}
            </div>

            {/* Edit controls — visible on hover */}
            {editable && !isEditing && (
              <>
                {/* Drag handle - top left */}
                <div className="smart-gallery__drag-handle" title="Drag to reorder">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><circle cx="5" cy="3" r="1.5"/><circle cx="11" cy="3" r="1.5"/><circle cx="5" cy="8" r="1.5"/><circle cx="11" cy="8" r="1.5"/><circle cx="5" cy="13" r="1.5"/><circle cx="11" cy="13" r="1.5"/></svg>
                </div>

                {/* Edit buttons - bottom left */}
                <div className="smart-gallery__edit-buttons">
                  {onEditTitle && (
                    <button onClick={(e) => startEdit(e, item)} title="Edit title">
                      ✎ Title
                    </button>
                  )}
                  {onEditThumbnail && (item.type === 'pdf' || item.type === 'link') && (
                    <button onClick={(e) => startThumbnailUpload(e, item.id)} title="Add/change preview image">
                      🖼 Image
                    </button>
                  )}
                </div>

                {/* Delete - top right */}
                {onDelete && (
                  <button className="smart-gallery__delete" onClick={(e) => { e.stopPropagation(); onDelete(item.id) }} title="Delete">
                    &times;
                  </button>
                )}
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
