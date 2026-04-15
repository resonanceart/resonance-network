'use client'

import { useState, useCallback } from 'react'
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
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { ContentBlock, TextBlockContent, GalleryBlockContent } from '@/types'
import { createStoryBlock, createGalleryBlock, sortBlocks } from '@/lib/profile-blocks'
import { StoryBlockEditor } from './StoryBlockEditor'
import { GalleryBlockEditor } from './GalleryBlockEditor'

type Props = {
  blocks: ContentBlock[]
  onChange: (blocks: ContentBlock[]) => void
  userId: string
}

export function BlockEditor({ blocks, onChange, userId }: Props) {
  const sortedBlocks = sortBlocks(blocks)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = sortedBlocks.findIndex(b => b.id === active.id)
    const newIndex = sortedBlocks.findIndex(b => b.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const next = arrayMove(sortedBlocks, oldIndex, newIndex).map((b, i) => ({ ...b, order: i }))
    onChange(next)
  }, [sortedBlocks, onChange])

  const updateBlock = useCallback((id: string, updates: Partial<ContentBlock>) => {
    onChange(sortedBlocks.map(b => b.id === id ? { ...b, ...updates } : b))
  }, [sortedBlocks, onChange])

  const deleteBlock = useCallback((id: string) => {
    if (!confirm('Delete this block? This cannot be undone.')) return
    onChange(sortedBlocks.filter(b => b.id !== id).map((b, i) => ({ ...b, order: i })))
  }, [sortedBlocks, onChange])

  const addStoryBlock = useCallback(() => {
    const order = sortedBlocks.length
    const block = createStoryBlock({ title: 'New Story', body: '', order })
    onChange([...sortedBlocks, block])
  }, [sortedBlocks, onChange])

  const addGalleryBlock = useCallback(() => {
    const order = sortedBlocks.length
    const block = createGalleryBlock({ title: 'New Gallery', description: '', items: [], order })
    onChange([...sortedBlocks, block])
  }, [sortedBlocks, onChange])

  return (
    <div className="block-editor">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sortedBlocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
          <div className="block-editor__list">
            {sortedBlocks.length === 0 && (
              <div className="block-editor__empty">
                <p>No blocks yet. Add your first block below.</p>
              </div>
            )}
            {sortedBlocks.map(block => (
              <SortableBlock
                key={block.id}
                block={block}
                userId={userId}
                onUpdate={updateBlock}
                onDelete={deleteBlock}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="block-editor__add-menu">
        <h3 className="block-editor__add-heading">Add a Block</h3>
        <div className="block-editor__add-buttons">
          <button type="button" onClick={addStoryBlock} className="block-editor__add-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M4 6h16M4 12h16M4 18h10" />
            </svg>
            <div>
              <strong>Story</strong>
              <span>Heading + text. Artist statement, case study, philosophy.</span>
            </div>
          </button>
          <button type="button" onClick={addGalleryBlock} className="block-editor__add-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <div>
              <strong>Gallery</strong>
              <span>Title + images. Portfolio, builds, events, food, whatever.</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Sortable wrapper for a single block ──────────────────────────

function SortableBlock({
  block,
  userId,
  onUpdate,
  onDelete,
}: {
  block: ContentBlock
  userId: string
  onUpdate: (id: string, updates: Partial<ContentBlock>) => void
  onDelete: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="block-editor__block">
      <div className="block-editor__block-header">
        <button
          type="button"
          className="block-editor__drag-handle"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <circle cx="9" cy="6" r="1.5" />
            <circle cx="15" cy="6" r="1.5" />
            <circle cx="9" cy="12" r="1.5" />
            <circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="18" r="1.5" />
            <circle cx="15" cy="18" r="1.5" />
          </svg>
        </button>
        <span className="block-editor__block-type">{blockTypeLabel(block.type)}</span>
        <button
          type="button"
          className="block-editor__delete-btn"
          onClick={() => onDelete(block.id)}
          aria-label="Delete block"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div className="block-editor__block-body">
        {block.type === 'text' && (
          <StoryBlockEditor
            block={block}
            content={block.content as TextBlockContent}
            onChange={(updates) => onUpdate(block.id, updates)}
          />
        )}
        {block.type === 'gallery' && (
          <GalleryBlockEditor
            block={block}
            content={block.content as GalleryBlockContent}
            userId={userId}
            onChange={(updates) => onUpdate(block.id, updates)}
          />
        )}
        {block.type !== 'text' && block.type !== 'gallery' && (
          <p className="block-editor__unsupported">
            Block type &ldquo;{block.type}&rdquo; is not editable yet. Delete and add a new block instead.
          </p>
        )}
      </div>
    </div>
  )
}

function blockTypeLabel(type: string): string {
  switch (type) {
    case 'text': return 'Story'
    case 'gallery': return 'Gallery'
    case 'video': return 'Video'
    case 'timeline': return 'Timeline'
    case 'links': return 'Links'
    case 'skills': return 'Skills'
    case 'testimonials': return 'Testimonials'
    case 'pdf': return 'PDF'
    case 'embed': return 'Embed'
    case 'divider': return 'Divider'
    case 'audio': return 'Audio'
    case 'project': return 'Project'
    default: return type
  }
}
