'use client'

import React, { useState } from 'react'
import type { ContentBlock } from '@/types'
import BlockListItem from './BlockListItem'
import BlockPicker from './BlockPicker'
import TextBlockEditor from './TextBlockEditor'
import VideoBlockEditor from './VideoBlockEditor'
import TestimonialsEditor from './TestimonialsEditor'
import EmbedBlockEditor from './EmbedBlockEditor'
import PdfBlockEditor from './PdfBlockEditor'
import DividerBlockEditor from './DividerBlockEditor'
import AudioBlockEditor from './AudioBlockEditor'

type ContentBlockType = ContentBlock['type']

function generateBlockId(): string {
  return crypto.randomUUID?.() ??
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
    })
}

function getDefaultContent(type: ContentBlockType): unknown {
  switch (type) {
    case 'text': return { markdown: '' }
    case 'gallery': return { items: [] }
    case 'video': return { url: '', caption: '' }
    case 'project': return { title: '', description: '' }
    case 'timeline': return { entries: [] }
    case 'testimonials': return { items: [] }
    case 'links': return { items: [] }
    case 'embed': return { url: '', height: 400 }
    case 'pdf': return { url: '', title: '' }
    case 'divider': return { variant: 'line' }
    case 'skills': return { tags: [] }
    case 'audio': return { url: '' }
  }
}

function getBlockLabel(block: ContentBlock): string {
  switch (block.type) {
    case 'text': {
      const md = (block.content as { markdown?: string }).markdown || ''
      return md ? `Text: ${md.slice(0, 40)}${md.length > 40 ? '...' : ''}` : 'Text Block'
    }
    case 'gallery': {
      const items = (block.content as { items?: unknown[] }).items || []
      return `Gallery (${items.length} image${items.length !== 1 ? 's' : ''})`
    }
    case 'video': {
      const url = (block.content as { url?: string }).url || ''
      return url ? `Video: ${url.slice(0, 40)}` : 'Video Block'
    }
    case 'project': {
      const title = (block.content as { title?: string }).title || ''
      return title || 'Project Block'
    }
    case 'timeline': {
      const entries = (block.content as { entries?: unknown[] }).entries || []
      return `Timeline (${entries.length} entr${entries.length !== 1 ? 'ies' : 'y'})`
    }
    case 'testimonials': {
      const items = (block.content as { items?: unknown[] }).items || []
      return `Testimonials (${items.length})`
    }
    case 'links': {
      const items = (block.content as { items?: unknown[] }).items || []
      return `Links (${items.length})`
    }
    case 'embed': {
      const url = (block.content as { url?: string }).url || ''
      return url ? `Embed: ${url.slice(0, 40)}` : 'Embed Block'
    }
    case 'pdf': {
      const title = (block.content as { title?: string }).title || ''
      return title || 'Document Block'
    }
    case 'divider': return 'Divider'
    case 'skills': {
      const tags = (block.content as { tags?: string[] }).tags || []
      return `Skills (${tags.length} tag${tags.length !== 1 ? 's' : ''})`
    }
    case 'audio': {
      const title = (block.content as { title?: string }).title || ''
      return title || 'Audio Block'
    }
    default: return 'Block'
  }
}

interface BlockEditorProps {
  blocks: ContentBlock[]
  onChange: (blocks: ContentBlock[]) => void
}

export default function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const sorted = [...blocks].sort((a, b) => a.order - b.order)

  function addBlock(type: ContentBlockType) {
    const newBlock: ContentBlock = {
      id: generateBlockId(),
      type,
      order: sorted.length > 0 ? sorted[sorted.length - 1].order + 1 : 0,
      visible: true,
      content: getDefaultContent(type) as ContentBlock['content'],
    }
    onChange([...blocks, newBlock])
    setPickerOpen(false)
    setEditingId(newBlock.id)
  }

  function removeBlock(id: string) {
    onChange(blocks.filter(b => b.id !== id))
    if (editingId === id) setEditingId(null)
  }

  function moveBlock(id: string, direction: -1 | 1) {
    const idx = sorted.findIndex(b => b.id === id)
    const target = idx + direction
    if (target < 0 || target >= sorted.length) return
    const updated = [...sorted]
    ;[updated[idx], updated[target]] = [updated[target], updated[idx]]
    onChange(updated.map((b, i) => ({ ...b, order: i })))
  }

  function toggleVisibility(id: string) {
    onChange(blocks.map(b => b.id === id ? { ...b, visible: !b.visible } : b))
  }

  function updateContent(id: string, content: ContentBlock['content']) {
    onChange(blocks.map(b => b.id === id ? { ...b, content } : b))
  }

  function renderBlockEditor(block: ContentBlock) {
    const content = block.content
    const update = (c: ContentBlock['content']) => updateContent(block.id, c)

    switch (block.type) {
      case 'text':
        return <TextBlockEditor content={content as import('@/types').TextBlockContent} onChange={update} />
      case 'video':
        return <VideoBlockEditor content={content as import('@/types').VideoBlockContent} onChange={update} />
      case 'testimonials':
        return <TestimonialsEditor content={content as import('@/types').TestimonialsBlockContent} onChange={update} />
      case 'embed':
        return <EmbedBlockEditor content={content as import('@/types').EmbedBlockContent} onChange={update} />
      case 'pdf':
        return <PdfBlockEditor content={content as import('@/types').PdfBlockContent} onChange={update} />
      case 'divider':
        return <DividerBlockEditor content={content as import('@/types').DividerBlockContent} onChange={update} />
      case 'audio':
        return <AudioBlockEditor content={content as import('@/types').AudioBlockContent} onChange={update} />
      default:
        return <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Editor for &ldquo;{block.type}&rdquo; blocks coming soon.</p>
    }
  }

  return (
    <div className="block-editor">
      {sorted.map((block, index) => (
        <BlockListItem
          key={block.id}
          block={block}
          label={getBlockLabel(block)}
          onEdit={() => setEditingId(editingId === block.id ? null : block.id)}
          onDelete={() => removeBlock(block.id)}
          onMoveUp={() => moveBlock(block.id, -1)}
          onMoveDown={() => moveBlock(block.id, 1)}
          onToggleVisibility={() => toggleVisibility(block.id)}
          isEditing={editingId === block.id}
          isFirst={index === 0}
          isLast={index === sorted.length - 1}
        >
          {renderBlockEditor(block)}
        </BlockListItem>
      ))}

      <button
        type="button"
        className="block-editor__add-btn"
        onClick={() => setPickerOpen(true)}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <line x1="8" y1="3" x2="8" y2="13" /><line x1="3" y1="8" x2="13" y2="8" />
        </svg>
        Add Block
      </button>

      <BlockPicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={addBlock}
      />
    </div>
  )
}
