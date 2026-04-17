'use client'
import { useState } from 'react'
import Image from 'next/image'
import type { ProfileMediaItem } from '@/types'

export function ProfileMediaGallery({ items }: { items: ProfileMediaItem[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const sorted = [...items].sort((a, b) => a.order - b.order)
  // Featured items first
  const ordered = [
    ...sorted.filter(i => i.isFeatured),
    ...sorted.filter(i => !i.isFeatured),
  ]

  return (
    <>
      <div className="profile-media-gallery">
        {ordered.map((item, i) => (
          <button
            key={i}
            className={`profile-media-gallery__item${item.isFeatured ? ' profile-media-gallery__item--featured' : ''}`}
            onClick={() => setLightboxIndex(i)}
            aria-label={`View ${item.alt}`}
          >
            <Image
              src={item.url}
              alt={item.alt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading={i < 3 ? 'eager' : 'lazy'}
              priority={i < 3}
              style={{ objectFit: 'cover' }}
            />
            {item.type === 'video' && (
              <div className="profile-media-gallery__video-overlay" aria-hidden="true">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="23" stroke="white" strokeWidth="2" opacity="0.8"/>
                  <path d="M19 15l14 9-14 9V15z" fill="white" opacity="0.9"/>
                </svg>
              </div>
            )}
            {item.caption && (
              <span className="profile-media-gallery__caption">{item.caption}</span>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="profile-media-gallery__lightbox" onClick={() => setLightboxIndex(null)} role="dialog" aria-label="Image lightbox">
          <button className="profile-media-gallery__lightbox-close" onClick={() => setLightboxIndex(null)} aria-label="Close lightbox">&times;</button>
          <button
            className="profile-media-gallery__lightbox-prev"
            onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + ordered.length) % ordered.length) }}
            aria-label="Previous image"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div className="profile-media-gallery__lightbox-content" onClick={(e) => e.stopPropagation()}>
            <Image
              src={ordered[lightboxIndex].url}
              alt={ordered[lightboxIndex].alt}
              width={1200}
              height={800}
              sizes="90vw"
              style={{ objectFit: 'contain', width: '100%', height: 'auto', maxHeight: '85vh' }}
            />
            {ordered[lightboxIndex].caption && (
              <p className="profile-media-gallery__lightbox-caption">{ordered[lightboxIndex].caption}</p>
            )}
          </div>
          <button
            className="profile-media-gallery__lightbox-next"
            onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % ordered.length) }}
            aria-label="Next image"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      )}
    </>
  )
}
