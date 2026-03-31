'use client'

import { SmartGallery, type GalleryItem } from './SmartGallery'
import type { Profile } from '@/types'

interface ProfileSmartGalleryProps {
  profile: Profile
}

export function ProfileSmartGallery({ profile }: ProfileSmartGalleryProps) {
  const items: GalleryItem[] = []
  let order = 0

  // Check if mediaGallery contains unified format items (have 'type' and 'id' fields)
  const rawGallery = profile.mediaGallery as unknown as Array<Record<string, unknown>> | undefined
  const isUnifiedFormat = rawGallery && rawGallery.length > 0 && rawGallery[0].type

  if (isUnifiedFormat && rawGallery) {
    // Unified format — items already have type/id/url/title/order
    // Sort by order field and render directly (matching preview page logic)
    const sorted = [...rawGallery].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
    sorted.forEach((item, i) => {
      const itemType = String(item.type) as 'image' | 'pdf' | 'link'
      items.push({
        id: String(item.id || `${itemType}-${i}`),
        type: itemType,
        url: String(item.url || ''),
        thumbnail: item.thumbnail ? String(item.thumbnail) : undefined,
        title: String(item.title || (itemType === 'image' ? 'Gallery Image' : itemType === 'pdf' ? 'Document' : 'Link')),
        subtitle: item.subtitle ? String(item.subtitle) : (itemType === 'pdf' ? 'PDF' : undefined),
        order: i,
      })
    })
  } else {
    // Legacy separate-arrays format

    // Gallery images
    if (profile.mediaGallery) {
      profile.mediaGallery.forEach((img, i) => {
        items.push({
          id: `img-${i}`,
          type: 'image',
          url: img.url,
          title: img.alt || img.caption || 'Gallery Image',
          order: order++,
        })
      })
    }

    // Past work
    if (profile.past_work) {
      profile.past_work.forEach((item, i) => {
        items.push({
          id: `pw-${i}`,
          type: 'image',
          url: item.url,
          title: item.title || 'Past Work',
          subtitle: 'Past Work',
          order: order++,
        })
      })
    }

    // PDF documents
    if (profile.pdf_documents) {
      profile.pdf_documents.forEach((doc, i) => {
        items.push({
          id: `pdf-${i}`,
          type: 'pdf',
          url: doc.url,
          thumbnail: (doc as Record<string, unknown>).thumbnail as string | undefined,
          title: doc.title || 'Document',
          subtitle: 'PDF',
          order: order++,
        })
      })
    }

    // Portfolio PDF
    if (profile.portfolio_pdf_url) {
      items.push({
        id: 'portfolio-pdf',
        type: 'pdf',
        url: profile.portfolio_pdf_url,
        title: 'Portfolio',
        subtitle: 'PDF Document',
        order: order++,
      })
    }

    // Resume PDF
    if (profile.resume_url) {
      items.push({
        id: 'resume-pdf',
        type: 'pdf',
        url: profile.resume_url,
        title: 'Resume',
        subtitle: 'PDF Document',
        order: order++,
      })
    }

    // Media links
    if (profile.media_links) {
      profile.media_links.forEach((link, i) => {
        let subtitle = 'website'
        try { subtitle = new URL(link.url).hostname } catch {}
        items.push({
          id: `link-${i}`,
          type: 'link',
          url: link.url,
          thumbnail: (link as Record<string, unknown>).thumbnail as string | undefined,
          title: link.label || 'Link',
          subtitle,
          order: order++,
        })
      })
    }
  }

  if (items.length === 0) return null

  return (
    <section className="profile-media-grid-section">
      <div className="container">
        <p className="section-label">Gallery</p>
        <SmartGallery items={items} editable={false} />
      </div>
    </section>
  )
}
