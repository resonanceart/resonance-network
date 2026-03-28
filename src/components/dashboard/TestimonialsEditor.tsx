'use client'

import React, { useState, useRef } from 'react'
import type { TestimonialsBlockContent } from '@/types'

type Testimonial = TestimonialsBlockContent['items'][number]

interface TestimonialsEditorProps {
  content: TestimonialsBlockContent
  onChange: (content: TestimonialsBlockContent) => void
}

const RELATIONSHIPS = ['Collaborator', 'Client', 'Curator', 'Peer', 'Other']

const emptyForm: Testimonial = { quote: '', authorName: '', authorTitle: '', relationship: 'Collaborator' }

export default function TestimonialsEditor({ content, onChange }: TestimonialsEditorProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [formData, setFormData] = useState<Testimonial>({ ...emptyForm })
  const fileRef = useRef<HTMLInputElement>(null)

  const items = content.items || []

  function openAdd() {
    setFormData({ ...emptyForm })
    setEditingIndex(null)
    setShowForm(true)
  }

  function openEdit(index: number) {
    setFormData({ ...items[index] })
    setEditingIndex(index)
    setShowForm(true)
  }

  function cancel() {
    setShowForm(false)
    setEditingIndex(null)
    setFormData({ ...emptyForm })
  }

  function save() {
    if (!formData.quote.trim() || !formData.authorName.trim()) return
    const cleaned: Testimonial = {
      quote: formData.quote.trim(),
      authorName: formData.authorName.trim(),
      authorTitle: formData.authorTitle?.trim() || undefined,
      relationship: formData.relationship || undefined,
      authorPhoto: formData.authorPhoto || undefined,
    }

    let updated: Testimonial[]
    if (editingIndex !== null) {
      updated = items.map((item, i) => (i === editingIndex ? cleaned : item))
    } else {
      updated = [...items, cleaned]
    }
    onChange({ ...content, items: updated })
    cancel()
  }

  function remove(index: number) {
    onChange({ ...content, items: items.filter((_, i) => i !== index) })
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 100
      canvas.height = 100
      const ctx = canvas.getContext('2d')!
      const size = Math.min(img.width, img.height)
      const sx = (img.width - size) / 2
      const sy = (img.height - size) / 2
      ctx.drawImage(img, sx, sy, size, size, 0, 0, 100, 100)
      setFormData(prev => ({ ...prev, authorPhoto: canvas.toDataURL('image/jpeg', 0.85) }))
    }
    img.src = URL.createObjectURL(file)
    e.target.value = ''
  }

  return (
    <div>
      {items.map((item, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            padding: 'var(--space-3)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: '0 0 var(--space-1)', fontSize: 'var(--text-sm)', fontStyle: 'italic' }}>
              &ldquo;{item.quote.length > 80 ? item.quote.slice(0, 80) + '...' : item.quote}&rdquo;
            </p>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              &mdash; {item.authorName}{item.authorTitle ? `, ${item.authorTitle}` : ''}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexShrink: 0, marginLeft: 'var(--space-2)' }}>
            <button className="btn btn--outline" onClick={() => openEdit(index)} style={{ fontSize: 'var(--text-xs)' }}>Edit</button>
            <button className="btn btn--outline" onClick={() => remove(index)} style={{ fontSize: 'var(--text-xs)' }}>Delete</button>
          </div>
        </div>
      ))}

      {showForm && (
        <div style={{ padding: 'var(--space-4)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', marginTop: 'var(--space-3)' }}>
          <div style={{ marginBottom: 'var(--space-3)' }}>
            <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>Quote *</label>
            <textarea
              value={formData.quote}
              onChange={e => setFormData({ ...formData, quote: e.target.value })}
              rows={3}
              required
              placeholder="What they said..."
              style={{ width: '100%', padding: 'var(--space-2)', fontSize: 'var(--text-sm)', border: '1px solid var(--color-border)', borderRadius: '4px', boxSizing: 'border-box', resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>Author Name *</label>
              <input type="text" value={formData.authorName} onChange={e => setFormData({ ...formData, authorName: e.target.value })} required placeholder="Jane Doe" style={{ width: '100%', padding: 'var(--space-2)', fontSize: 'var(--text-sm)', border: '1px solid var(--color-border)', borderRadius: '4px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>Author Title</label>
              <input type="text" value={formData.authorTitle || ''} onChange={e => setFormData({ ...formData, authorTitle: e.target.value })} placeholder="Curator at MoMA" style={{ width: '100%', padding: 'var(--space-2)', fontSize: 'var(--text-sm)', border: '1px solid var(--color-border)', borderRadius: '4px', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>Relationship</label>
              <select
                value={formData.relationship || 'Collaborator'}
                onChange={e => setFormData({ ...formData, relationship: e.target.value })}
                style={{ width: '100%', padding: 'var(--space-2)', fontSize: 'var(--text-sm)', border: '1px solid var(--color-border)', borderRadius: '4px', boxSizing: 'border-box', background: 'var(--color-surface)' }}
              >
                {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>Author Photo</label>
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
              <button type="button" className="btn btn--outline" onClick={() => fileRef.current?.click()}>
                {formData.authorPhoto ? 'Change Photo' : 'Upload Photo'}
              </button>
              {formData.authorPhoto && (
                <img src={formData.authorPhoto} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', marginLeft: 'var(--space-2)', verticalAlign: 'middle' }} />
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button className="btn btn--primary" onClick={save}>{editingIndex !== null ? 'Update' : 'Save'}</button>
            <button className="btn btn--outline" onClick={cancel}>Cancel</button>
          </div>
        </div>
      )}

      {!showForm && (
        <button className="btn btn--primary" onClick={openAdd} style={{ marginTop: 'var(--space-3)' }}>
          Add Testimonial
        </button>
      )}
    </div>
  )
}
