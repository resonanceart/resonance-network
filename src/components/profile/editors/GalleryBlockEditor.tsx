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

type GalleryItem = { url: string; alt: string; caption?: string }

type Props = {
  block: ContentBlock
  content: GalleryBlockContent
  userId: string
  onChange: (updates: Partial<ContentBlock>) => void
}

export function GalleryBlockEditor({ block, content, userId, onChange }: Props) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const items = content.items || []
  const description = (block.config?.description as string) || ''

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const updateItems = useCallback((next: GalleryItem[]) => {
    onChange({ content: { ...content, items: next } as GalleryBlockContent })
  }, [content, onChange])

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    setUploadError(null)
    const uploaded: GalleryItem[] = []
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue
        if (file.size > 10 * 1024 * 1024) {
          setUploadError(`${file.name} is larger than 10MB.`)
          continue
        }
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', 'gallery')
        formData.append('userId', userId)
        const res = await fetch('/api/upload', { method: 'POST', credentials: 'include', body: formData })
        const json = await res.json().catch(() => ({}))
        if (res.ok && json.url) {
          uploaded.push({ url: json.url, alt: file.name.replace(/\.[^.]+$/, ''), caption: '' })
        } else {
          setUploadError(json.message || `Upload failed for ${file.name}`)
        }
      }
      if (uploaded.length > 0) {
        updateItems([...items, ...uploaded])
      }
    } catch (err) {
      setUploadError((err as Error).message || 'Upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }, [items, updateItems, userId])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex(i => i.url === active.id)
    const newIndex = items.findIndex(i => i.url === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    updateItems(arrayMove(items, oldIndex, newIndex))
  }, [items, updateItems])

  const removeItem = useCallback((url: string) => {
    updateItems(items.filter(i => i.url !== url))
  }, [items, updateItems])

  const updateCaption = useCallback((url: string, caption: string) => {
    updateItems(items.map(i => i.url === url ? { ...i, caption } : i))
  }, [items, updateItems])

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
        <SortableContext items={items.map(i => i.url)} strategy={rectSortingStrategy}>
          <div className="gallery-block-editor__grid">
            {items.map(item => (
              <SortableImage
                key={item.url}
                item={item}
                onRemove={() => removeItem(item.url)}
                onCaptionChange={(c) => updateCaption(item.url, c)}
              />
            ))}
            <button
              type="button"
              className="gallery-block-editor__add"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <span>Uploading…</span>
              ) : (
                <>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span>Add images</span>
                </>
              )}
            </button>
          </div>
        </SortableContext>
      </DndContext>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => handleFiles(e.target.files)}
      />

      {uploadError && <p className="gallery-block-editor__error">{uploadError}</p>}
      <p className="gallery-block-editor__hint">{items.length} image{items.length !== 1 ? 's' : ''}. Drag to reorder.</p>
    </div>
  )
}

function SortableImage({
  item,
  onRemove,
  onCaptionChange,
}: {
  item: GalleryItem
  onRemove: () => void
  onCaptionChange: (caption: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.url })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="gallery-block-editor__item">
      <div className="gallery-block-editor__item-image" {...attributes} {...listeners}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.url} alt={item.alt} />
      </div>
      <input
        type="text"
        value={item.caption || ''}
        onChange={(e) => onCaptionChange(e.target.value)}
        placeholder="Caption (optional)"
        className="gallery-block-editor__caption"
        maxLength={200}
      />
      <button
        type="button"
        className="gallery-block-editor__item-remove"
        onClick={onRemove}
        aria-label="Remove image"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}
