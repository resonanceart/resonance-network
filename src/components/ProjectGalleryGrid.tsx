'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Lightbox } from './Lightbox'
import type { GalleryImage } from '@/types'

export function ProjectGalleryGrid({ images }: { images: GalleryImage[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  return (
    <section className="project-gallery">
      <div className="container">
        <p className="section-label">Gallery</p>
        <h2 className="sr-only">Project Gallery</h2>
        <div className="gallery-grid">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setLightboxIndex(i)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                position: 'relative',
                display: 'block',
              }}
              aria-label={`Open image: ${img.alt}`}
            >
              <Image
                src={img.url}
                alt={img.alt}
                width={800}
                height={600}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                loading="lazy"
                style={{ width: '100%', height: 'auto' }}
              />
            </button>
          ))}
        </div>
      </div>
      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </section>
  )
}
