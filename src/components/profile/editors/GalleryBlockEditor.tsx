'use client'

import { useState, useCallback, useRef } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { ContentBlock, GalleryBlockContent } from '@/types'
import { resizeImageFile } from '@/lib/image-resize'

const GALLERY_IMAGE_MAX_DIM = 1600
const TILE_THUMBNAIL_MAX_DIM = 800

type GalleryItem = { url: string; alt: string; caption?: string; type?: 'image' | 'pdf' | 'link'; thumbnail?: string; label?: string }

type Props = {
  block: ContentBlock
  content: GalleryBlockContent
  userId: string
  onChange: (updates: Partial<ContentBlock>) => void
}

export function GalleryBlockEditor({ block, content, userId, onChange }: Props) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [showAddLink, setShowAddLink] = useState(false)
  const [newLinkUrl, setNewLinkUrl] = useState('')
  const [newLinkLabel, setNewLinkLabel] = useState('')
  const [newLinkThumbnail, setNewLinkThumbnail] = useState<string | null>(null)
  const [thumbUploading, setThumbUploading] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)
  const linkThumbInputRef = useRef<HTMLInputElement>(null)
  const items = content.items || []
  const description = (block.config?.description as string) || ''

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const updateItems = useCallback((next: GalleryItem[]) => {
    onChange({ content: { ...content, items: next } as GalleryBlockContent })
  }, [content, onChange])

  // Image upload
  const handleImageFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    setUploadError(null)
    const uploaded: GalleryItem[] = []
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue
        if (file.size > 10 * 1024 * 1024) { setUploadError(`${file.name} > 10MB`); continue }
        const resized = await resizeImageFile(file, GALLERY_IMAGE_MAX_DIM)
        const formData = new FormData()
        formData.append('file', resized)
        formData.append('type', 'gallery')
        formData.append('userId', userId)
        const res = await fetch('/api/upload', { method: 'POST', credentials: 'include', body: formData })
        const json = await res.json().catch(() => ({}))
        if (res.ok && json.url) {
          uploaded.push({ url: json.url, alt: file.name.replace(/\.[^.]+$/, ''), caption: '', type: 'image' })
        } else { setUploadError(json.message || `Upload failed for ${file.name}`) }
      }
      if (uploaded.length > 0) updateItems([...items, ...uploaded])
    } catch (err) { setUploadError((err as Error).message) }
    finally { setUploading(false); if (imageInputRef.current) imageInputRef.current.value = '' }
  }, [items, updateItems, userId])

  // PDF upload
  const handlePdfFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    setUploadError(null)
    const uploaded: GalleryItem[] = []
    try {
      for (const file of Array.from(files)) {
        if (file.size > 10 * 1024 * 1024) { setUploadError(`${file.name} > 10MB`); continue }
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', 'portfolio')
        formData.append('userId', userId)
        const res = await fetch('/api/upload', { method: 'POST', credentials: 'include', body: formData })
        const json = await res.json().catch(() => ({}))
        if (res.ok && json.url) {
          uploaded.push({ url: json.url, alt: file.name.replace(/\.pdf$/i, ''), caption: file.name.replace(/\.pdf$/i, ''), type: 'pdf' })
        } else { setUploadError(json.message || `Upload failed`) }
      }
      if (uploaded.length > 0) updateItems([...items, ...uploaded])
    } catch (err) { setUploadError((err as Error).message) }
    finally { setUploading(false); if (pdfInputRef.current) pdfInputRef.current.value = '' }
  }, [items, updateItems, userId])

  // Add link
  const handleAddLink = useCallback(() => {
    if (!newLinkUrl.trim()) return
    const link: GalleryItem = {
      url: newLinkUrl.trim(),
      alt: newLinkLabel.trim() || 'Link',
      caption: newLinkLabel.trim() || 'Link',
      label: newLinkLabel.trim() || 'Link',
      type: 'link',
      thumbnail: newLinkThumbnail || undefined,
    }
    updateItems([...items, link])
    setNewLinkUrl('')
    setNewLinkLabel('')
    setNewLinkThumbnail(null)
    setShowAddLink(false)
  }, [items, updateItems, newLinkUrl, newLinkLabel, newLinkThumbnail])

  // Upload thumbnail for a pending link
  const handleLinkThumbUpload = useCallback(async (file: File | null) => {
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { setUploadError('Thumbnail > 10MB'); return }
    setThumbUploading(true)
    try {
      const resized = await resizeImageFile(file, TILE_THUMBNAIL_MAX_DIM)
      const formData = new FormData()
      formData.append('file', resized)
      formData.append('type', 'gallery')
      formData.append('userId', userId)
      const res = await fetch('/api/upload', { method: 'POST', credentials: 'include', body: formData })
      const json = await res.json().catch(() => ({}))
      if (res.ok && json.url) {
        setNewLinkThumbnail(json.url)
      } else {
        setUploadError(json.message || 'Thumbnail upload failed')
      }
    } catch (err) { setUploadError((err as Error).message) }
    finally { setThumbUploading(false); if (linkThumbInputRef.current) linkThumbInputRef.current.value = '' }
  }, [userId])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((_, i) => `item-${i}` === active.id)
    const newIndex = items.findIndex((_, i) => `item-${i}` === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    updateItems(arrayMove(items, oldIndex, newIndex))
  }, [items, updateItems])

  const removeItem = useCallback((index: number) => {
    updateItems(items.filter((_, i) => i !== index))
  }, [items, updateItems])

  const updateCaption = useCallback((index: number, caption: string) => {
    updateItems(items.map((item, i) => i === index ? { ...item, caption } : item))
  }, [items, updateItems])

  /** Upload and set a thumbnail for an existing link/PDF item */
  const uploadItemThumbnail = useCallback(async (index: number, file: File) => {
    if (file.size > 10 * 1024 * 1024) { setUploadError('Thumbnail > 10MB'); return }
    try {
      const resized = await resizeImageFile(file, TILE_THUMBNAIL_MAX_DIM)
      const formData = new FormData()
      formData.append('file', resized)
      formData.append('type', 'gallery')
      formData.append('userId', userId)
      const res = await fetch('/api/upload', { method: 'POST', credentials: 'include', body: formData })
      const json = await res.json().catch(() => ({}))
      if (res.ok && json.url) {
        updateItems(items.map((item, i) => i === index ? { ...item, thumbnail: json.url } : item))
      } else { setUploadError(json.message || 'Thumbnail upload failed') }
    } catch (err) { setUploadError((err as Error).message) }
  }, [items, updateItems, userId])

  return (
    <div className="gallery-block-editor">
      <input
        type="text"
        value={block.label || ''}
        onChange={(e) => onChange({ label: e.target.value })}
        placeholder="Gallery title (e.g. Private Chef, Community Events)"
        className="gallery-block-editor__title"
        maxLength={120}
      />
      <textarea
        value={description}
        onChange={(e) => onChange({ config: { ...block.config, description: e.target.value } })}
        placeholder="Short description (optional)"
        className="gallery-block-editor__desc"
        rows={2}
        maxLength={500}
      />

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((_, i) => `item-${i}`)} strategy={rectSortingStrategy}>
          <div className="gallery-block-editor__grid">
            {items.map((item, i) => (
              <SortableMediaItem
                key={`item-${i}`}
                id={`item-${i}`}
                item={item}
                onRemove={() => removeItem(i)}
                onCaptionChange={(c) => updateCaption(i, c)}
                onThumbnailUpload={(file) => uploadItemThumbnail(i, file)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Upload buttons row */}
      <div className="gallery-block-editor__actions">
        <button
          type="button"
          className="gallery-block-editor__action-btn"
          onClick={() => imageInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'Uploading…' : '+ Images'}
        </button>
        <button
          type="button"
          className="gallery-block-editor__action-btn"
          onClick={() => pdfInputRef.current?.click()}
          disabled={uploading}
        >
          + PDF
        </button>
        {showAddLink ? (
          <div className="gallery-block-editor__link-form">
            <input
              type="url"
              value={newLinkUrl}
              onChange={(e) => setNewLinkUrl(e.target.value)}
              placeholder="https://..."
              className="gallery-block-editor__link-input"
              onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
              autoFocus
            />
            <input
              type="text"
              value={newLinkLabel}
              onChange={(e) => setNewLinkLabel(e.target.value)}
              placeholder="Label (e.g. My Website)"
              className="gallery-block-editor__link-input"
              onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
            />
            <button
              type="button"
              className="gallery-block-editor__action-btn"
              onClick={() => linkThumbInputRef.current?.click()}
              disabled={thumbUploading}
            >
              {newLinkThumbnail ? '✓ Tile image' : thumbUploading ? 'Uploading…' : '+ Tile image (optional)'}
            </button>
            <input
              ref={linkThumbInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => handleLinkThumbUpload(e.target.files?.[0] || null)}
            />
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button type="button" className="gallery-block-editor__action-btn" onClick={handleAddLink} disabled={!newLinkUrl.trim()}>Add link</button>
              <button type="button" className="gallery-block-editor__action-btn" onClick={() => { setShowAddLink(false); setNewLinkThumbnail(null) }}>Cancel</button>
            </div>
          </div>
        ) : (
          <button type="button" className="gallery-block-editor__action-btn" onClick={() => setShowAddLink(true)}>
            + Link
          </button>
        )}
      </div>

      <input ref={imageInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={(e) => handleImageFiles(e.target.files)} />
      <input ref={pdfInputRef} type="file" accept=".pdf,application/pdf" multiple style={{ display: 'none' }} onChange={(e) => handlePdfFiles(e.target.files)} />

      {uploadError && <p className="gallery-block-editor__error">{uploadError}</p>}
      <p className="gallery-block-editor__hint">
        {items.filter(i => (i.type || 'image') === 'image').length} images
        {items.filter(i => i.type === 'pdf').length > 0 && `, ${items.filter(i => i.type === 'pdf').length} PDFs`}
        {items.filter(i => i.type === 'link').length > 0 && `, ${items.filter(i => i.type === 'link').length} links`}
        . Drag to reorder.
      </p>
    </div>
  )
}

function SortableMediaItem({
  id,
  item,
  onRemove,
  onCaptionChange,
  onThumbnailUpload,
}: {
  id: string
  item: GalleryItem
  onRemove: () => void
  onCaptionChange: (caption: string) => void
  onThumbnailUpload: (file: File) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const itemType = item.type || 'image'
  const thumbInputRef = useRef<HTMLInputElement>(null)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="gallery-block-editor__item">
      <div className="gallery-block-editor__item-image" {...attributes} {...listeners}>
        {itemType === 'image' && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.url} alt={item.alt} />
        )}
        {itemType === 'pdf' && (
          <div className="gallery-block-editor__item-pdf">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <span>PDF</span>
          </div>
        )}
        {itemType === 'link' && (
          item.thumbnail ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.thumbnail} alt={item.label || 'Link'} />
              <div className="gallery-block-editor__item-link-overlay">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                <span>{item.label || 'Link'}</span>
              </div>
            </>
          ) : (
            <div className="gallery-block-editor__item-link">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
              <span>{item.label || 'Link'}</span>
            </div>
          )
        )}
      </div>
      <input
        type="text"
        value={item.caption || ''}
        onChange={(e) => onCaptionChange(e.target.value)}
        placeholder={itemType === 'pdf' ? 'PDF title' : itemType === 'link' ? 'Link label' : 'Caption'}
        className="gallery-block-editor__caption"
        maxLength={200}
      />
      <button
        type="button"
        className="gallery-block-editor__item-remove"
        onClick={onRemove}
        aria-label="Remove"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Thumbnail edit button — only for link and PDF items */}
      {(itemType === 'link' || itemType === 'pdf') && (
        <>
          <button
            type="button"
            className="gallery-block-editor__item-thumb-btn"
            onClick={(e) => { e.stopPropagation(); thumbInputRef.current?.click() }}
            aria-label={item.thumbnail ? 'Change tile image' : 'Add tile image'}
            title={item.thumbnail ? 'Change tile image' : 'Add tile image'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </button>
          <input
            ref={thumbInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onThumbnailUpload(file)
              e.target.value = ''
            }}
          />
        </>
      )}
    </div>
  )
}
