'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Lightbox } from '@/components/Lightbox'
import type { ProjectContentBlock, GalleryImage } from '@/types'

interface ProjectBlockRendererProps {
  block: ProjectContentBlock
}

function getVideoEmbedUrl(url: string, source: string): string | null {
  if (source === 'youtube' || url.includes('youtube.com') || url.includes('youtu.be')) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/)
    return match ? `https://www.youtube.com/embed/${match[1]}` : null
  }
  if (source === 'vimeo' || url.includes('vimeo.com')) {
    const match = url.match(/vimeo\.com\/(\d+)/)
    return match ? `https://player.vimeo.com/video/${match[1]}` : null
  }
  return null
}

export function ProjectBlockRenderer({ block }: ProjectBlockRendererProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImages, setLightboxImages] = useState<GalleryImage[]>([])
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const openLightbox = (images: GalleryImage[], index: number) => {
    setLightboxImages(images)
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const content = block.content

  const renderBlock = () => {
    switch (block.block_type) {
      case 'image': {
        const { url, alt, caption, width, height } = content as {
          url: string
          alt?: string
          caption?: string
          width?: number
          height?: number
        }
        const images: GalleryImage[] = [{ url, alt: alt || '' }]
        return (
          <div className="project-block-image">
            <button
              className="project-block-image__trigger"
              onClick={() => openLightbox(images, 0)}
              type="button"
              aria-label={`View full size: ${alt || 'image'}`}
            >
              <Image
                src={url}
                alt={alt || ''}
                width={width || 1200}
                height={height || 800}
                sizes="100vw"
                style={{ width: '100%', height: 'auto' }}
              />
            </button>
            {caption && <p className="project-block-image__caption">{caption}</p>}
          </div>
        )
      }

      case 'image_grid': {
        const { images, columns = 3, gap = 16 } = content as {
          images: { url: string; alt?: string; caption?: string }[]
          columns?: number
          gap?: number
        }
        const galleryImages: GalleryImage[] = (images || []).map(img => ({
          url: img.url,
          alt: img.alt || '',
          caption: img.caption,
        }))
        return (
          <div
            className="project-block-image-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap: `${gap}px`,
            }}
          >
            {galleryImages.map((img, i) => (
              <button
                key={i}
                className="project-block-image-grid__item"
                onClick={() => openLightbox(galleryImages, i)}
                type="button"
                aria-label={`View full size: ${img.alt || `image ${i + 1}`}`}
              >
                <Image
                  src={img.url}
                  alt={img.alt}
                  width={600}
                  height={400}
                  sizes={`${Math.floor(100 / columns)}vw`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </button>
            ))}
          </div>
        )
      }

      case 'side_by_side': {
        const { left, right, ratio = '50-50' } = content as {
          left: { type: 'image' | 'text'; content: string }
          right: { type: 'image' | 'text'; content: string }
          ratio?: '50-50' | '60-40' | '40-60'
        }
        const [leftFlex, rightFlex] = ratio.split('-').map(Number)
        const renderSide = (side: { type: 'image' | 'text'; content: string }) => {
          if (side.type === 'image') {
            return (
              <Image
                src={side.content}
                alt=""
                width={800}
                height={600}
                sizes="50vw"
                style={{ width: '100%', height: 'auto' }}
              />
            )
          }
          return <div dangerouslySetInnerHTML={{ __html: side.content }} />
        }
        return (
          <div
            className="project-block-side-by-side"
            style={{ display: 'flex', gap: '1.5rem' }}
          >
            <div style={{ flex: leftFlex }}>{renderSide(left)}</div>
            <div style={{ flex: rightFlex }}>{renderSide(right)}</div>
          </div>
        )
      }

      case 'video': {
        const { source = 'upload', url, poster_url, autoplay } = content as {
          source?: 'upload' | 'youtube' | 'vimeo'
          url: string
          poster_url?: string
          autoplay?: boolean
        }
        const embedUrl = getVideoEmbedUrl(url, source)
        if (embedUrl) {
          return (
            <div className="project-block-video">
              <iframe
                src={`${embedUrl}${autoplay ? '?autoplay=1' : ''}`}
                width="100%"
                style={{ aspectRatio: '16 / 9', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Video embed"
              />
            </div>
          )
        }
        return (
          <div className="project-block-video">
            <video
              src={url}
              poster={poster_url}
              controls
              autoPlay={autoplay}
              muted={autoplay}
              playsInline
              style={{ width: '100%' }}
            />
          </div>
        )
      }

      case 'rich_text': {
        const { html } = content as { html: string }
        return (
          <div
            className="project-block-rich-text"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )
      }

      case 'quote': {
        const { text, attribution } = content as { text: string; attribution?: string }
        return (
          <blockquote className="project-block-quote">
            <p>{text}</p>
            {attribution && <cite>— {attribution}</cite>}
          </blockquote>
        )
      }

      case 'divider': {
        const { style = 'line' } = content as { style?: 'line' | 'space' | 'dots' }
        if (style === 'space') {
          return <div className="project-block-divider project-block-divider--space" />
        }
        if (style === 'dots') {
          return (
            <div className="project-block-divider project-block-divider--dots" aria-hidden="true">
              • • •
            </div>
          )
        }
        return <hr className="project-block-divider project-block-divider--line" />
      }

      case 'embed': {
        const { url, html: embedHtml } = content as {
          url?: string
          provider?: string
          html?: string
        }
        if (embedHtml) {
          return (
            <div
              className="project-block-embed"
              dangerouslySetInnerHTML={{ __html: embedHtml }}
            />
          )
        }
        if (url) {
          return (
            <div className="project-block-embed">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="project-block-embed__link"
              >
                {url}
              </a>
            </div>
          )
        }
        return null
      }

      case 'audio': {
        const { url, title } = content as { source?: string; url: string; title?: string }
        return (
          <div className="project-block-audio">
            {title && <p className="project-block-audio__title">{title}</p>}
            <audio src={url} controls style={{ width: '100%' }} />
          </div>
        )
      }

      case 'carousel': {
        return <CarouselBlock content={content} openLightbox={openLightbox} />
      }

      default:
        return null
    }
  }

  return (
    <div className={`project-block project-block--${block.block_type}`}>
      {renderBlock()}
      {lightboxOpen && (
        <Lightbox
          images={lightboxImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  )
}

// Separated carousel to isolate its state/effects
function CarouselBlock({
  content,
  openLightbox,
}: {
  content: Record<string, unknown>
  openLightbox: (images: GalleryImage[], index: number) => void
}) {
  const {
    images = [],
    auto_advance = false,
    interval = 5000,
  } = content as {
    images: { url: string; alt?: string; caption?: string }[]
    auto_advance?: boolean
    interval?: number
  }

  const [currentIndex, setCurrentIndex] = useState(0)

  const galleryImages: GalleryImage[] = (images || []).map(img => ({
    url: img.url,
    alt: img.alt || '',
    caption: img.caption,
  }))

  const goNext = useCallback(() => {
    setCurrentIndex(i => (i + 1) % images.length)
  }, [images.length])

  const goPrev = () => {
    setCurrentIndex(i => (i - 1 + images.length) % images.length)
  }

  useEffect(() => {
    if (!auto_advance || images.length <= 1) return
    const timer = setInterval(goNext, interval)
    return () => clearInterval(timer)
  }, [auto_advance, interval, images.length, goNext])

  if (!images.length) return null

  const current = images[currentIndex]

  return (
    <div className="project-block-carousel">
      <div className="project-block-carousel__viewport">
        <button
          className="project-block-carousel__nav project-block-carousel__nav--prev"
          onClick={goPrev}
          type="button"
          aria-label="Previous image"
        >
          ‹
        </button>
        <button
          className="project-block-carousel__image-trigger"
          onClick={() => openLightbox(galleryImages, currentIndex)}
          type="button"
          aria-label={`View full size: ${current.alt || `image ${currentIndex + 1}`}`}
        >
          <Image
            src={current.url}
            alt={current.alt || ''}
            width={1200}
            height={800}
            sizes="100vw"
            style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
          />
        </button>
        <button
          className="project-block-carousel__nav project-block-carousel__nav--next"
          onClick={goNext}
          type="button"
          aria-label="Next image"
        >
          ›
        </button>
      </div>
      {current.caption && (
        <p className="project-block-carousel__caption">{current.caption}</p>
      )}
      {images.length > 1 && (
        <div className="project-block-carousel__dots" aria-label="Carousel navigation">
          {images.map((_, i) => (
            <button
              key={i}
              className={`project-block-carousel__dot${i === currentIndex ? ' project-block-carousel__dot--active' : ''}`}
              onClick={() => setCurrentIndex(i)}
              type="button"
              aria-label={`Go to image ${i + 1}`}
              aria-current={i === currentIndex ? 'true' : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}
