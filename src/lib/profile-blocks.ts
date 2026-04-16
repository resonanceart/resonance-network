/**
 * Block-based profile system helpers.
 *
 * A profile is composed of a stack of content blocks. Each block has a type,
 * a user-defined title, order, visibility, and type-specific content.
 *
 * This module provides:
 * - Type-safe helpers for creating new blocks
 * - A migration function that converts legacy profile fields into blocks
 */

import type {
  ContentBlock,
  TextBlockContent,
  GalleryBlockContent,
  SkillsBlockContent,
  TimelineBlockContent,
} from '@/types'

/** Generate a short unique block ID */
export function generateBlockId(): string {
  return `blk_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`
}

/** Create a new Story (text) block */
export function createStoryBlock(opts: {
  title?: string
  body?: string
  order?: number
}): ContentBlock {
  return {
    id: generateBlockId(),
    type: 'text',
    order: opts.order ?? 0,
    visible: true,
    label: opts.title ?? 'Story',
    content: {
      markdown: opts.body ?? '',
    } as TextBlockContent,
  }
}

/** Create a new Gallery block */
export function createGalleryBlock(opts: {
  title?: string
  description?: string
  items?: { url: string; alt: string; caption?: string }[]
  order?: number
}): ContentBlock {
  return {
    id: generateBlockId(),
    type: 'gallery',
    order: opts.order ?? 0,
    visible: true,
    label: opts.title ?? 'Gallery',
    config: opts.description ? { description: opts.description } : undefined,
    content: {
      items: opts.items ?? [],
    } as GalleryBlockContent,
  }
}

/** Reorder blocks after a drag-and-drop operation */
export function reorderBlocks(blocks: ContentBlock[], fromIndex: number, toIndex: number): ContentBlock[] {
  const next = [...blocks]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)
  return next.map((b, i) => ({ ...b, order: i }))
}

/** Sort blocks by their order field */
export function sortBlocks(blocks: ContentBlock[]): ContentBlock[] {
  return [...blocks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

/**
 * Build a set of blocks from legacy profile_extended fields.
 * Used on first migration when a user has content in old fields but
 * no content_blocks yet.
 */
export function blocksFromLegacy(extended: {
  artist_statement?: string | null
  philosophy?: string | null
  media_gallery?: Array<{ type?: string; url?: string; caption?: string; alt?: string }> | null
  tools_and_materials?: string[] | null
}): ContentBlock[] {
  const blocks: ContentBlock[] = []
  let order = 0

  if (extended.artist_statement && extended.artist_statement.trim()) {
    blocks.push(createStoryBlock({
      title: 'Artist Statement',
      body: extended.artist_statement,
      order: order++,
    }))
  }

  if (extended.philosophy && extended.philosophy.trim()) {
    blocks.push(createStoryBlock({
      title: 'Philosophy',
      body: extended.philosophy,
      order: order++,
    }))
  }

  if (Array.isArray(extended.media_gallery) && extended.media_gallery.length > 0) {
    const items = extended.media_gallery
      .filter(m => m && m.url)
      .map(m => ({
        url: String(m.url),
        alt: m.alt || '',
        caption: m.caption,
      }))
    if (items.length > 0) {
      blocks.push(createGalleryBlock({
        title: 'Gallery',
        items,
        order: order++,
      }))
    }
  }

  return blocks
}

/** Check if content_blocks are actually populated */
export function hasBlocks(blocks: unknown): blocks is ContentBlock[] {
  return Array.isArray(blocks) && blocks.length > 0
}
