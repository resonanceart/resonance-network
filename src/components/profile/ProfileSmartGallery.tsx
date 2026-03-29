'use client'

import { SmartGallery, type GalleryItem } from './SmartGallery'
import type { Profile } from '@/types'

interface ProfileSmartGalleryProps {
  profile: Profile
}

export function ProfileSmartGallery({ profile }: ProfileSmartGalleryProps) {
  const items: GalleryItem[] = []
  let order = 0

  // Gallery images
  if (profile.mediaGallery) {
    profile.mediaGallery.forEach((img, i) => {
      items.push({
        id: `img-${i}`,
        type: 'image',
        url: img.url,
        title: img.alt || img.caption || 'Gallery',
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
