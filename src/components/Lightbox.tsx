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
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const prevButtonRef = useRef<HTMLButtonElement>(null)
  const nextButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    dialogRef.current?.showModal()
    document.body.style.overflow = 'hidden'
    // Focus the close button on open for screen reader users
    closeButtonRef.current?.focus()
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  // Focus trap: cycle through close, prev, next buttons
  const handleFocusTrap = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Tab') return
    const focusableElements = [
      closeButtonRef.current,
      prevButtonRef.current,
      nextButtonRef.current,
    ].filter((el): el is HTMLButtonElement => el !== null && !el.disabled)

    if (focusableElements.length === 0) return

    const firstEl = focusableElements[0]
    const lastEl = focusableElements[focusableElements.length - 1]

    if (e.shiftKey) {
      if (document.activeElement === firstEl) {
        e.preventDefault()
        lastEl.focus()
      }
    } else {
      if (document.activeElement === lastEl) {
        e.preventDefault()
        firstEl.focus()
      }
    }
  }, [])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setCurrentIndex(i => Math.min(i + 1, images.length - 1))
      if (e.key === 'ArrowLeft') setCurrentIndex(i => Math.max(i - 1, 0))
      handleFocusTrap(e)
    },
    [images.length, onClose, handleFocusTrap]
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
      aria-label={`Image lightbox: ${currentImage.alt}`}
      role="dialog"
      aria-modal="true"
    >
      <button
        ref={closeButtonRef}
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
          width: '44px',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label="Close lightbox"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
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

      <div
        style={{ display: 'flex', gap: '1rem', marginTop: '1rem', alignItems: 'center' }}
        role="group"
        aria-label="Image navigation"
      >
        <button
          ref={prevButtonRef}
          onClick={() => setCurrentIndex(i => Math.max(i - 1, 0))}
          disabled={currentIndex === 0}
          style={{
            background: 'none',
            border: '1px solid white',
            color: 'white',
            padding: '0.5rem 1rem',
            cursor: currentIndex === 0 ? 'default' : 'pointer',
            opacity: currentIndex === 0 ? 0.3 : 1,
            minWidth: '44px',
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Previous image"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span style={{ color: 'white' }} aria-live="polite">
          {currentIndex + 1} / {images.length}
        </span>
        <button
          ref={nextButtonRef}
          onClick={() => setCurrentIndex(i => Math.min(i + 1, images.length - 1))}
          disabled={currentIndex === images.length - 1}
          style={{
            background: 'none',
            border: '1px solid white',
            color: 'white',
            padding: '0.5rem 1rem',
            cursor: currentIndex === images.length - 1 ? 'default' : 'pointer',
            opacity: currentIndex === images.length - 1 ? 0.3 : 1,
            minWidth: '44px',
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Next image"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </dialog>
  )
}
