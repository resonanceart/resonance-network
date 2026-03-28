'use client'

import React, { useRef } from 'react'
import type { PdfBlockContent } from '@/types'

interface PdfBlockEditorProps {
  content: PdfBlockContent
  onChange: (content: PdfBlockContent) => void
}

export default function PdfBlockEditor({ content, onChange }: PdfBlockEditorProps) {
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      onChange({ ...content, url: reader.result as string })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <div>
        <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
          Title *
        </label>
        <input
          type="text"
          value={content.title}
          onChange={e => onChange({ ...content, title: e.target.value })}
          required
          placeholder="Document title"
          style={{
            width: '100%',
            padding: 'var(--space-2) var(--space-3)',
            border: '1px solid var(--color-border)',
            borderRadius: '4px',
            fontSize: 'var(--text-sm)',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
          Description (optional)
        </label>
        <textarea
          value={content.description || ''}
          onChange={e => onChange({ ...content, description: e.target.value })}
          rows={2}
          placeholder="Brief description of the document"
          style={{
            width: '100%',
            padding: 'var(--space-2) var(--space-3)',
            border: '1px solid var(--color-border)',
            borderRadius: '4px',
            fontSize: 'var(--text-sm)',
            boxSizing: 'border-box',
            resize: 'vertical',
          }}
        />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
          PDF File
        </label>
        <input ref={fileRef} type="file" accept=".pdf" onChange={handleFileSelect} style={{ display: 'none' }} />
        <button type="button" className="btn btn--outline" onClick={() => fileRef.current?.click()}>
          {content.url ? 'Change PDF' : 'Upload PDF'}
        </button>
        {content.url && (
          <span style={{ marginLeft: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--color-primary)' }}>
            PDF uploaded
          </span>
        )}
      </div>
    </div>
  )
}
