'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface AvatarEditorProps {
  profileSlug: string
  onClose: () => void
  onSave: () => void
}

function resizeImage(file: File, maxSize: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = maxSize
        canvas.height = maxSize
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('Canvas not supported'))

        // Center crop to square
        const size = Math.min(img.width, img.height)
        const sx = (img.width - size) / 2
        const sy = (img.height - size) / 2
        ctx.drawImage(img, sx, sy, size, size, 0, 0, maxSize, maxSize)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = reader.result as string
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

export function AvatarEditor({ profileSlug, onClose, onSave }: AvatarEditorProps) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB.')
      return
    }
    try {
      setError(null)
      const resized = await resizeImage(file, 400)
      setPreview(resized)
      setDataUrl(resized)
    } catch {
      setError('Failed to process image.')
    }
  }

  async function handleSave() {
    if (!dataUrl) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url: dataUrl }),
      })
      if (!res.ok) throw new Error('Failed to save')
      onSave()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="inline-editor__overlay" onClick={onClose}>
      <div className="inline-editor__card" onClick={(e) => e.stopPropagation()}>
        <button className="inline-editor__close" onClick={onClose}>&times;</button>
        <h3 className="inline-editor__title">Update Profile Photo</h3>
        {error && <div className="inline-editor__error">{error}</div>}
        <div className="inline-editor__body">
          <div className="inline-editor__field">
            {preview && (
              <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                <img
                  src={preview}
                  alt="Preview"
                  style={{ width: 160, height: 160, borderRadius: '50%', objectFit: 'cover' }}
                />
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <button
              className="btn btn--outline"
              onClick={() => fileRef.current?.click()}
              style={{ width: '100%' }}
            >
              {preview ? 'Choose Different Photo' : 'Choose Photo'}
            </button>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem', textAlign: 'center' }}>
              Image will be resized to 400x400px
            </p>
          </div>
        </div>
        <div className="inline-editor__actions">
          <button className="btn btn--outline" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" onClick={handleSave} disabled={saving || !dataUrl}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
