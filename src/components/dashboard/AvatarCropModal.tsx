'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface AvatarCropModalProps {
  isOpen: boolean
  imageSrc: string
  onCrop: (croppedDataUrl: string) => void
  onClose: () => void
}

export function AvatarCropModal({ isOpen, imageSrc, onCrop, onClose }: AvatarCropModalProps) {
  const [cropBox, setCropBox] = useState({ x: 0, y: 0, size: 200 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const resizeCornerRef = useRef<string>('')

  // Load image and calculate display dimensions
  useEffect(() => {
    if (!isOpen || !imageSrc) return

    const img = new Image()
    img.onload = () => {
      imageRef.current = img
      setImageSize({ width: img.width, height: img.height })

      const maxSize = 400
      const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1)
      const dw = Math.round(img.width * ratio)
      const dh = Math.round(img.height * ratio)
      setDisplaySize({ width: dw, height: dh })

      const cropSize = Math.round(Math.min(dw, dh) * 0.8)
      setCropBox({
        x: Math.round((dw - cropSize) / 2),
        y: Math.round((dh - cropSize) / 2),
        size: cropSize,
      })
    }
    img.src = imageSrc
  }, [isOpen, imageSrc])

  // Esc key to close
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  // Get client position from mouse or touch event
  const getClientPos = useCallback((e: MouseEvent | TouchEvent) => {
    if ('touches' in e) {
      const touch = e.touches[0] || (e as TouchEvent).changedTouches[0]
      return { clientX: touch.clientX, clientY: touch.clientY }
    }
    return { clientX: (e as MouseEvent).clientX, clientY: (e as MouseEvent).clientY }
  }, [])

  // Document-level move/up listeners for drag and resize
  useEffect(() => {
    if (!isDragging && !isResizing) return

    const handleMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault()
      const { clientX, clientY } = getClientPos(e)
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      if (isDragging) {
        let newX = clientX - rect.left - dragOffset.x
        let newY = clientY - rect.top - dragOffset.y
        newX = Math.max(0, Math.min(newX, displaySize.width - cropBox.size))
        newY = Math.max(0, Math.min(newY, displaySize.height - cropBox.size))
        setCropBox(prev => ({ ...prev, x: newX, y: newY }))
      }

      if (isResizing) {
        const corner = resizeCornerRef.current
        let newSize = cropBox.size
        let newX = cropBox.x
        let newY = cropBox.y

        const mouseX = clientX - rect.left
        const mouseY = clientY - rect.top

        if (corner === 'se') {
          newSize = Math.max(50, Math.min(
            mouseX - cropBox.x,
            mouseY - cropBox.y,
            displaySize.width - cropBox.x,
            displaySize.height - cropBox.y
          ))
        } else if (corner === 'sw') {
          const rightEdge = cropBox.x + cropBox.size
          newSize = Math.max(50, Math.min(
            rightEdge - mouseX,
            mouseY - cropBox.y,
            rightEdge,
            displaySize.height - cropBox.y
          ))
          newX = rightEdge - newSize
        } else if (corner === 'ne') {
          const bottomEdge = cropBox.y + cropBox.size
          newSize = Math.max(50, Math.min(
            mouseX - cropBox.x,
            bottomEdge - mouseY,
            displaySize.width - cropBox.x,
            bottomEdge
          ))
          newY = bottomEdge - newSize
        } else if (corner === 'nw') {
          const rightEdge = cropBox.x + cropBox.size
          const bottomEdge = cropBox.y + cropBox.size
          newSize = Math.max(50, Math.min(
            rightEdge - mouseX,
            bottomEdge - mouseY,
            rightEdge,
            bottomEdge
          ))
          newX = rightEdge - newSize
          newY = bottomEdge - newSize
        }

        setCropBox({ x: newX, y: newY, size: newSize })
      }
    }

    const handleUp = () => {
      setIsDragging(false)
      setIsResizing(false)
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
  }, [isDragging, isResizing, dragOffset, cropBox, displaySize, getClientPos])

  const handleCropBoxDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    const clientPos = 'touches' in e
      ? { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY }
      : { clientX: (e as React.MouseEvent).clientX, clientY: (e as React.MouseEvent).clientY }
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    setDragOffset({
      x: clientPos.clientX - rect.left - cropBox.x,
      y: clientPos.clientY - rect.top - cropBox.y,
    })
    setIsDragging(true)
  }, [cropBox.x, cropBox.y])

  const handleHandleDown = useCallback((corner: string, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    e.preventDefault()
    resizeCornerRef.current = corner
    setIsResizing(true)
  }, [])

  const handleCrop = useCallback(() => {
    if (!imageRef.current || displaySize.width === 0) return

    const scaleX = imageSize.width / displaySize.width
    const scaleY = imageSize.height / displaySize.height

    const origX = cropBox.x * scaleX
    const origY = cropBox.y * scaleY
    const origSize = cropBox.size * Math.min(scaleX, scaleY)

    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 400
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(
      imageRef.current,
      origX, origY, origSize, origSize,
      0, 0, 400, 400
    )

    onCrop(canvas.toDataURL('image/png'))
  }, [cropBox, imageSize, displaySize, onCrop])

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }, [onClose])

  if (!isOpen) return null

  return (
    <div className="avatar-crop-modal__overlay" onClick={handleBackdropClick}>
      <div className="avatar-crop-modal__card">
        <h3 className="avatar-crop-modal__title">Crop Your Photo</h3>

        <div
          ref={containerRef}
          className="avatar-crop-modal__preview"
          style={{ width: displaySize.width || 400, height: displaySize.height || 400 }}
        >
          {displaySize.width > 0 && (
            <>
              <img
                src={imageSrc}
                className="avatar-crop-modal__image"
                style={{ width: displaySize.width, height: displaySize.height }}
                draggable={false}
                alt="Upload preview"
              />

              {/* Dimming overlays around the crop box */}
              <div
                style={{
                  position: 'absolute', top: 0, left: 0, right: 0,
                  height: cropBox.y,
                  background: 'rgba(0,0,0,0.5)', pointerEvents: 'none',
                }}
              />
              <div
                style={{
                  position: 'absolute', top: cropBox.y + cropBox.size, left: 0, right: 0,
                  bottom: 0,
                  background: 'rgba(0,0,0,0.5)', pointerEvents: 'none',
                }}
              />
              <div
                style={{
                  position: 'absolute', top: cropBox.y, left: 0,
                  width: cropBox.x, height: cropBox.size,
                  background: 'rgba(0,0,0,0.5)', pointerEvents: 'none',
                }}
              />
              <div
                style={{
                  position: 'absolute', top: cropBox.y, left: cropBox.x + cropBox.size,
                  right: 0, height: cropBox.size,
                  background: 'rgba(0,0,0,0.5)', pointerEvents: 'none',
                }}
              />

              {/* Crop selection box */}
              <div
                className="avatar-crop-modal__crop-box"
                style={{
                  left: cropBox.x,
                  top: cropBox.y,
                  width: cropBox.size,
                  height: cropBox.size,
                }}
                onMouseDown={handleCropBoxDown}
                onTouchStart={handleCropBoxDown}
              >
                {/* Corner handles */}
                {(['nw', 'ne', 'sw', 'se'] as const).map(corner => (
                  <div
                    key={corner}
                    className={`avatar-crop-modal__handle avatar-crop-modal__handle--${corner}`}
                    onMouseDown={(e) => handleHandleDown(corner, e)}
                    onTouchStart={(e) => handleHandleDown(corner, e)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="avatar-crop-modal__actions">
          <button className="btn btn--outline btn--sm" onClick={onClose} type="button">
            Cancel
          </button>
          <button className="btn btn--primary btn--sm" onClick={handleCrop} type="button">
            Crop &amp; Save
          </button>
        </div>
      </div>
    </div>
  )
}
