'use client'

import { useState, useRef, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { resizeImageFile } from '@/lib/image-resize'

const TILE_THUMBNAIL_MAX_DIM = 800

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

interface SortableTileProps {
  item: GalleryItem
  index: number
  editable: boolean
  editingId: string | null
  editText: string
  failedThumbnails: Set<string>
  onEditText: (text: string) => void
  onStartEdit: (e: React.MouseEvent, item: GalleryItem) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onClick: (item: GalleryItem) => void
  onDelete?: (id: string) => void
  onEditTitle?: (id: string, newTitle: string) => void
  onEditThumbnail?: (id: string, thumbnailUrl: string) => void
  onThumbnailUpload: (e: React.MouseEvent, itemId: string) => void
  onThumbnailError: (id: string) => void
}

function SortableTile({
  item, index, editable, editingId, editText, failedThumbnails,
  onEditText, onStartEdit, onSaveEdit, onCancelEdit, onClick,
  onDelete, onEditTitle, onEditThumbnail, onThumbnailUpload, onThumbnailError,
}: SortableTileProps) {
  // Eager-load the first row (assuming 3-col grid) so the gallery doesn't
  // look empty on first render while lazy tiles catch up. Remaining tiles
  // stay lazy to save bandwidth.
  const eagerLoad = index < 3
  const [retryCount, setRetryCount] = useState(0)
  const handleImgError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    // Retry once with a cache-busting query param before giving up —
    // prevents transient network hiccups from permanently hiding the tile.
    if (retryCount === 0) {
      setRetryCount(1)
      const img = e.currentTarget
      const src = img.src
      img.src = src.includes('?') ? `${src}&_r=1` : `${src}?_r=1`
      return
    }
    onThumbnailError(item.id)
  }, [retryCount, item.id, onThumbnailError])
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: !editable || editingId === item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  }

  const isEditing = editingId === item.id
  const thumbFailed = failedThumbnails.has(item.id)
  const hasWorkingThumb = !!(item.thumbnail && !thumbFailed)
  const hasThumbnail = !!(hasWorkingThumb || (item.type === 'image'))

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`smart-gallery__tile smart-gallery__tile--${item.type}${hasThumbnail && item.type !== 'image' ? ' smart-gallery__tile--has-thumb' : ''}${isDragging ? ' smart-gallery__tile--dragging' : ''}`}
      onClick={() => onClick(item)}
    >
      {/* Background image — for images and tiles with thumbnails */}
      {item.type === 'image' && item.url ? (
        <img
          src={item.url}
          alt={item.title}
          className="smart-gallery__tile-img"
          loading={eagerLoad ? 'eager' : 'lazy'}
          decoding="async"
          onError={handleImgError}
        />
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
        <img
          src={item.thumbnail}
          alt={item.title}
          className="smart-gallery__tile-img"
          loading={eagerLoad ? 'eager' : 'lazy'}
          decoding="async"
          onError={handleImgError}
        />
      )}

      {/* PDF icon overlay */}
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

      {/* Link icon overlay */}
      {item.type === 'link' && !hasWorkingThumb && (
        <div className="smart-gallery__icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
          </svg>
        </div>
      )}

      {/* Title overlay */}
      <div className="smart-gallery__tile-body">
        {item.subtitle && <p className="smart-gallery__tile-subtitle">{item.subtitle}</p>}
        {isEditing ? (
          <div onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: 6, alignItems: 'center', pointerEvents: 'auto' }}>
            <input
              type="text" value={editText}
              onChange={e => onEditText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') onSaveEdit(); if (e.key === 'Escape') onCancelEdit() }}
              autoFocus
              style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.5)', borderRadius: 4, color: 'white', padding: '6px 10px', fontSize: '0.9rem', fontWeight: 700, width: '100%', textAlign: 'center' }}
            />
            <button onClick={onSaveEdit} style={{ background: '#01696F', color: 'white', border: 'none', borderRadius: 4, padding: '6px 12px', cursor: 'pointer', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>Save</button>
          </div>
        ) : (
          <h3 className="smart-gallery__tile-title">{item.title}</h3>
        )}
      </div>

      {/* Edit controls */}
      {editable && !isEditing && (
        <>
          {/* Drag handle - top left */}
          <div
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            className="smart-gallery__drag-handle"
            title="Drag to reorder"
            style={{ touchAction: 'none' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><circle cx="5" cy="3" r="1.5"/><circle cx="11" cy="3" r="1.5"/><circle cx="5" cy="8" r="1.5"/><circle cx="11" cy="8" r="1.5"/><circle cx="5" cy="13" r="1.5"/><circle cx="11" cy="13" r="1.5"/></svg>
          </div>

          {/* Edit buttons - bottom left */}
          <div className="smart-gallery__edit-buttons">
            {onEditTitle && (
              <button onClick={(e) => onStartEdit(e, item)} title="Edit title">
                ✎ Title
              </button>
            )}
            {onEditThumbnail && (item.type === 'pdf' || item.type === 'link') && (
              <button onClick={(e) => onThumbnailUpload(e, item.id)} title="Add/change preview image">
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
}

export function SmartGallery({ items, editable = false, onReorder, onDelete, onEditTitle, onEditThumbnail }: SmartGalleryProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [thumbnailTargetId, setThumbnailTargetId] = useState<string | null>(null)
  const [failedThumbnails, setFailedThumbnails] = useState<Set<string>>(new Set())
  const sorted = [...items].sort((a, b) => a.order - b.order)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id || !onReorder) return

    const oldIndex = sorted.findIndex(item => item.id === active.id)
    const newIndex = sorted.findIndex(item => item.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = [...sorted]
    const [moved] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, moved)
    onReorder(reordered.map((item, i) => ({ ...item, order: i })))
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
    const resized = await resizeImageFile(file, TILE_THUMBNAIL_MAX_DIM)
    const formData = new FormData()
    formData.append('file', resized)
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

  const content = sorted.map((item, i) => (
    <SortableTile
      key={item.id}
      item={item}
      index={i}
      editable={editable}
      editingId={editingId}
      editText={editText}
      failedThumbnails={failedThumbnails}
      onEditText={setEditText}
      onStartEdit={startEdit}
      onSaveEdit={saveEdit}
      onCancelEdit={() => setEditingId(null)}
      onClick={handleClick}
      onDelete={onDelete}
      onEditTitle={onEditTitle}
      onEditThumbnail={onEditThumbnail}
      onThumbnailUpload={startThumbnailUpload}
      onThumbnailError={(id) => setFailedThumbnails(prev => new Set(prev).add(id))}
    />
  ))

  return (
    <div className="smart-gallery">
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleThumbnailFile} style={{ display: 'none' }} />

      {editable ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sorted.map(item => item.id)} strategy={rectSortingStrategy}>
            {content}
          </SortableContext>
        </DndContext>
      ) : (
        content
      )}
    </div>
  )
}
