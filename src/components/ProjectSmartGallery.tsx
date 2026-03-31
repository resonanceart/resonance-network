'use client'

import { SmartGallery, type GalleryItem } from '@/components/profile/SmartGallery'

interface ProjectSmartGalleryProps {
  galleryImages: Array<{ url: string; alt: string }>
  galleryPdfs: Array<{ url: string; title: string; thumbnail?: string }>
  galleryLinks: Array<{ url: string; label: string; thumbnail?: string }>
  savedGalleryOrder: string[]
}

export function ProjectSmartGallery({ galleryImages, galleryPdfs, galleryLinks, savedGalleryOrder }: ProjectSmartGalleryProps) {
  if (galleryImages.length === 0 && galleryPdfs.length === 0 && galleryLinks.length === 0) return null

  const items: GalleryItem[] = []
  let order = 0

  galleryImages.filter(img => img.url).forEach((img, i) => {
    items.push({ id: `img-${i}`, type: 'image', url: img.url, title: img.alt || 'Gallery', order: order++ })
  })
  galleryPdfs.forEach((doc, i) => {
    items.push({ id: `pdf-${i}`, type: 'pdf', url: doc.url, thumbnail: doc.thumbnail, title: doc.title || 'Document', subtitle: 'PDF', order: order++ })
  })
  galleryLinks.forEach((link, i) => {
    let subtitle = 'website'
    try { subtitle = new URL(link.url).hostname } catch {}
    items.push({ id: `link-${i}`, type: 'link', url: link.url, thumbnail: link.thumbnail, title: link.label || 'Link', subtitle, order: order++ })
  })

  // Apply saved gallery order
  if (savedGalleryOrder.length > 0) {
    const orderMap = new Map(savedGalleryOrder.map((id, i) => [id, i]))
    items.sort((a, b) => (orderMap.get(a.id) ?? 999) - (orderMap.get(b.id) ?? 999))
    items.forEach((item, i) => { item.order = i })
  }

  return (
    <section style={{ padding: 'var(--space-8) 0' }}>
      <div className="container">
        <p className="section-label">Media</p>
        <SmartGallery items={items} editable={false} />
      </div>
    </section>
  )
}
