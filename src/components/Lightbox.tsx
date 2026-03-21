'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import type { GalleryImage } from '@/types'

interface Props {
  images: GalleryImage[]
  initialIndex: number
  onClose: () => void
}

export function Lightbox({ images, initialIndex, onClose }: Props) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    dialogRef.current?.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setCurrentIndex(i => Math.min(i + 1, images.length - 1))
      if (e.key === 'ArrowLeft') setCurrentIndex(i => Math.max(i - 1, 0))
    },
    [images.length, onClose]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const currentImage = images[currentIndex]

  return (
    <dialog
      ref={dialogRef}
      style={{
        background: 'rgba(0,0,0,0.95)',
        border: 'none',
        padding: 0,
        maxWidth: '100vw',
        maxHeight: '100vh',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
      onClick={e => {
        if (e.target === e.currentTarget) onClose()
      }}
      aria-label="Image lightbox"
    >
      <button
        onClick={onClose}
        style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          background: 'none',
          border: 'none',
          color: 'white',
          fontSize: '2rem',
          cursor: 'pointer',
          zIndex: 10,
        }}
        aria-label="Close lightbox"
      >
        ×
      </button>

      <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '80vh' }}>
        <Image
          src={currentImage.url}
          alt={currentImage.alt}
          width={1200}
          height={800}
          sizes="90vw"
          style={{ maxWidth: '90vw', maxHeight: '80vh', width: 'auto', height: 'auto', objectFit: 'contain' }}
        />
      </div>

      {currentImage.caption && (
        <p style={{ color: 'white', marginTop: '1rem', textAlign: 'center' }}>
          {currentImage.caption}
        </p>
      )}

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', alignItems: 'center' }}>
        <button
          onClick={() => setCurrentIndex(i => Math.max(i - 1, 0))}
          disabled={currentIndex === 0}
          style={{
            background: 'none',
            border: '1px solid white',
            color: 'white',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            opacity: currentIndex === 0 ? 0.3 : 1,
          }}
          aria-label="Previous image"
        >
          ←
        </button>
        <span style={{ color: 'white' }}>
          {currentIndex + 1} / {images.length}
        </span>
        <button
          onClick={() => setCurrentIndex(i => Math.min(i + 1, images.length - 1))}
          disabled={currentIndex === images.length - 1}
          style={{
            background: 'none',
            border: '1px solid white',
            color: 'white',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            opacity: currentIndex === images.length - 1 ? 0.3 : 1,
          }}
          aria-label="Next image"
        >
          →
        </button>
      </div>
    </dialog>
  )
}
