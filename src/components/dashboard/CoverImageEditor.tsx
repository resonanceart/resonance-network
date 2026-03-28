'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface CoverImageEditorProps {
  coverUrl: string | null
  coverPosition: { x: number; y: number; scale: number }
  onSave: (url: string, position: { x: number; y: number; scale: number }) => void
  onUpload: (file: File) => void
}

export function CoverImageEditor({ coverUrl, coverPosition, onSave, onUpload }: CoverImageEditorProps) {
  const [editing, setEditing] = useState(false)
  const [position, setPosition] = useState(coverPosition)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [hovering, setHovering] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Sync position when prop changes
  useEffect(() => {
    setPosition(coverPosition)
  }, [coverPosition])

  // Get client position from mouse or touch event
  const getClientPos = useCallback((e: MouseEvent | TouchEvent) => {
    if ('touches' in e) {
      const touch = e.touches[0] || (e as TouchEvent).changedTouches[0]
      return { clientX: touch.clientX, clientY: touch.clientY }
    }
    return { clientX: (e as MouseEvent).clientX, clientY: (e as MouseEvent).clientY }
  }, [])

  // Document-level drag listeners for repositioning
  useEffect(() => {
    if (!isDragging) return

    const handleMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault()
      const { clientX, clientY } = getClientPos(e)
      const deltaX = clientX - dragStart.x
      const deltaY = clientY - dragStart.y

      setPosition(prev => ({
        ...prev,
        x: Math.max(0, Math.min(100, prev.x - deltaX * 0.15)),
        y: Math.max(0, Math.min(100, prev.y - deltaY * 0.15)),
      }))

      setDragStart({ x: clientX, y: clientY })
    }

    const handleUp = () => {
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleUp)
    document.addEventListener('touchmove', handleMove, { passive: false })
    document.addEventListener('touchend', handleUp)
    return () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleUp)
      document.removeEventListener('touchmove', handleMove)
      document.removeEventListener('touchend', handleUp)
    }
  }, [isDragging, dragStart, getClientPos])

  const handleImageDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!editing) return
    const clientPos = 'touches' in e
      ? { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY }
      : { clientX: (e as React.MouseEvent).clientX, clientY: (e as React.MouseEvent).clientY }
    setDragStart({ x: clientPos.clientX, y: clientPos.clientY })
    setIsDragging(true)
  }, [editing])

  const handleZoom = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPosition(prev => ({ ...prev, scale: parseFloat(e.target.value) }))
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onUpload(file)
    // Reset input so same file can be re-selected
    e.target.value = ''
  }, [onUpload])

  const handleDone = useCallback(() => {
    if (coverUrl) {
      onSave(coverUrl, position)
    }
    setEditing(false)
  }, [coverUrl, position, onSave])

  const handleCancel = useCallback(() => {
    setPosition(coverPosition)
    setEditing(false)
  }, [coverPosition])

  // No cover image state
  if (!coverUrl) {
    return (
      <div
        className="cover-editor cover-editor--empty"
        onClick={() => fileInputRef.current?.click()}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <span className="cover-editor__prompt-title">Add a Banner Image</span>
        <span className="cover-editor__prompt-sub">Optimal dimensions 1920 × 480px</span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          hidden
        />
      </div>
    )
  }

  // Editing mode
  if (editing) {
    return (
      <div ref={containerRef} className="cover-editor cover-editor--editing">
        <img
          src={coverUrl}
          className="cover-editor__image"
          style={{
            objectPosition: `${position.x}% ${position.y}%`,
            transform: `scale(${position.scale})`,
          }}
          draggable={false}
          onMouseDown={handleImageDown}
          onTouchStart={handleImageDown}
          alt="Cover"
        />
        <div className="cover-editor__overlay-text">Drag image to reposition</div>
        <div className="cover-editor__controls">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="5" y="5" width="14" height="14" rx="2" ry="2" />
            <circle cx="10" cy="10" r="1" />
            <polyline points="19 14 15 10 7 19" />
          </svg>
          <input
            type="range"
            min="1"
            max="2"
            step="0.05"
            value={position.scale}
            onChange={handleZoom}
            className="cover-editor__zoom"
          />
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
        <div className="cover-editor__actions">
          <button className="btn btn--outline btn--sm" onClick={handleCancel} type="button">
            Cancel
          </button>
          <button className="btn btn--primary btn--sm" onClick={handleDone} type="button">
            Done
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          hidden
        />
      </div>
    )
  }

  // Cover exists, not editing (view mode with hover edit button)
  return (
    <div
      className="cover-editor"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <img
        src={coverUrl}
        className="cover-editor__image"
        style={{
          objectPosition: `${position.x}% ${position.y}%`,
          transform: `scale(${position.scale})`,
        }}
        draggable={false}
        alt="Cover"
      />
      {hovering && (
        <button
          className="cover-editor__edit-btn"
          onClick={() => setEditing(true)}
          type="button"
        >
          Edit Cover
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        hidden
      />
    </div>
  )
}
