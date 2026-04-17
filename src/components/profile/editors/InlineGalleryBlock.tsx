'use client'

import { useRef, useState } from 'react'
import type { ContentBlock, GalleryBlockContent } from '@/types'
import { SmartGallery, type GalleryItem as SmartGalleryItem } from '@/components/profile/SmartGallery'
import { resizeImageFile } from '@/lib/image-resize'

const GALLERY_IMAGE_MAX_DIM = 1600

type Props = {
  block: ContentBlock
  userId: string
  onChange: (updatedBlock: ContentBlock) => void
}

/**
 * Inline editable gallery block rendered on the live-edit preview area.
 * Matches the main gallery's edit experience — SmartGallery in editable mode
 * plus +Images / +PDF / +Link buttons below.
 */
export function InlineGalleryBlock({ block, userId, onChange }: Props) {
  const content = block.content as GalleryBlockContent
  const items = content.items || []
  const [uploading, setUploading] = useState(false)
  const [showAddLink, setShowAddLink] = useState(false)
  const [newLinkUrl, setNewLinkUrl] = useState('')
  const [newLinkLabel, setNewLinkLabel] = useState('')
  const imageInputRef = useRef<HTMLInputElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)

  // Convert block items → SmartGallery items (by index for stable IDs)
  const smartItems: SmartGalleryItem[] = items.map((item, i) => ({
    id: `blk-item-${i}`,
    type: (item.type || 'image') as 'image' | 'pdf' | 'link',
    url: item.url,
    thumbnail: item.thumbnail,
    title: item.label || item.caption || item.alt || '',
    subtitle: (item.type === 'pdf' || item.type === 'link') ? (item.caption !== item.label ? item.caption : undefined) : item.caption,
    order: i,
  }))

  const writeItems = (next: GalleryBlockContent['items']) => {
    onChange({ ...block, content: { ...content, items: next } as GalleryBlockContent })
  }

  async function uploadFile(file: File, type: string): Promise<string | null> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)
    formData.append('userId', userId)
    const res = await fetch('/api/upload', { method: 'POST', credentials: 'include', body: formData })
    const json = await res.json().catch(() => ({}))
    return res.ok && json.url ? json.url : null
  }

  async function handleImages(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    const added = []
    for (const f of Array.from(files)) {
      if (!f.type.startsWith('image/') || f.size > 10 * 1024 * 1024) continue
      const resized = await resizeImageFile(f, GALLERY_IMAGE_MAX_DIM)
      const url = await uploadFile(resized, 'gallery')
      if (url) added.push({ url, alt: f.name.replace(/\.[^.]+$/, ''), caption: '', type: 'image' as const })
    }
    if (added.length > 0) writeItems([...items, ...added])
    setUploading(false)
    if (imageInputRef.current) imageInputRef.current.value = ''
  }

  async function handlePdfs(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    const added = []
    for (const f of Array.from(files)) {
      if (f.size > 10 * 1024 * 1024) continue
      const url = await uploadFile(f, 'portfolio')
      if (url) {
        const title = f.name.replace(/\.pdf$/i, '')
        added.push({ url, alt: title, caption: title, label: title, type: 'pdf' as const })
      }
    }
    if (added.length > 0) writeItems([...items, ...added])
    setUploading(false)
    if (pdfInputRef.current) pdfInputRef.current.value = ''
  }

  function addLink() {
    if (!newLinkUrl.trim()) return
    const label = newLinkLabel.trim() || 'Link'
    writeItems([...items, {
      url: newLinkUrl.trim(),
      alt: label,
      caption: label,
      label,
      type: 'link',
    }])
    setNewLinkUrl('')
    setNewLinkLabel('')
    setShowAddLink(false)
  }

  function handleReorder(reordered: SmartGalleryItem[]) {
    // Map SmartGallery order back to block item indices
    const newItems = reordered.map(si => {
      const idx = parseInt(si.id.replace('blk-item-', ''))
      return items[idx]
    }).filter(Boolean)
    writeItems(newItems)
  }

  function handleDelete(id: string) {
    const idx = parseInt(id.replace('blk-item-', ''))
    writeItems(items.filter((_, i) => i !== idx))
  }

  function handleEditTitle(id: string, newTitle: string) {
    const idx = parseInt(id.replace('blk-item-', ''))
    writeItems(items.map((it, i) => i === idx ? { ...it, label: newTitle, caption: newTitle, alt: newTitle } : it))
  }

  async function handleEditThumbnail(id: string, thumbnailUrl: string) {
    const idx = parseInt(id.replace('blk-item-', ''))
    writeItems(items.map((it, i) => i === idx ? { ...it, thumbnail: thumbnailUrl } : it))
  }

  const description = (block.config?.description as string) || ''

  return (
    <section className="profile-media-grid-section">
      <div className="container">
        <p className="section-label">{block.label || 'Gallery'}</p>
        {description && <p className="profile-block__description" style={{ color: 'var(--color-text-secondary)', margin: '0 0 var(--space-4)', fontSize: 'var(--text-base)', lineHeight: 1.6 }}>{description}</p>}

        {items.length > 0 ? (
          <SmartGallery
            items={smartItems}
            editable={true}
            onReorder={handleReorder}
            onDelete={handleDelete}
            onEditTitle={handleEditTitle}
            onEditThumbnail={handleEditThumbnail}
          />
        ) : (
          <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
            Empty gallery. Add images, PDFs, or links below.
          </p>
        )}

        {/* Add buttons row */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginTop: 'var(--space-4)' }}>
          <label className="btn btn--outline btn--sm" style={{ cursor: 'pointer' }}>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => handleImages(e.target.files)}
            />
            {uploading ? 'Uploading…' : '+ Add Images'}
          </label>
          <label className="btn btn--outline btn--sm" style={{ cursor: 'pointer' }}>
            <input
              ref={pdfInputRef}
              type="file"
              accept=".pdf,application/pdf"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => handlePdfs(e.target.files)}
            />
            + Add PDF
          </label>
          {showAddLink ? (
            <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flex: 1, minWidth: 0, flexWrap: 'wrap' }}>
              <input
                type="url"
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                placeholder="https://..."
                className="form-input"
                style={{ fontSize: 'var(--text-sm)', flex: '1 1 200px' }}
                onKeyDown={(e) => e.key === 'Enter' && addLink()}
                autoFocus
              />
              <input
                type="text"
                value={newLinkLabel}
                onChange={(e) => setNewLinkLabel(e.target.value)}
                placeholder="Label"
                className="form-input"
                style={{ fontSize: 'var(--text-sm)', flex: '1 1 120px' }}
                onKeyDown={(e) => e.key === 'Enter' && addLink()}
              />
              <button type="button" className="btn btn--primary btn--sm" onClick={addLink} disabled={!newLinkUrl.trim()}>Add</button>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setShowAddLink(false)}>Cancel</button>
            </div>
          ) : (
            <button type="button" className="btn btn--outline btn--sm" onClick={() => setShowAddLink(true)}>
              + Add Link
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
