'use client'

import React from 'react'
import type { AudioBlockContent } from '@/types'

interface AudioBlockEditorProps {
  content: AudioBlockContent
  onChange: (content: AudioBlockContent) => void
}

export default function AudioBlockEditor({ content, onChange }: AudioBlockEditorProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <div>
        <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
          Audio URL
        </label>
        <input
          type="text"
          value={content.url}
          onChange={e => onChange({ ...content, url: e.target.value })}
          placeholder="Paste SoundCloud URL or audio file URL"
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
          Title (optional)
        </label>
        <input
          type="text"
          value={content.title || ''}
          onChange={e => onChange({ ...content, title: e.target.value })}
          placeholder="Track title"
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
    </div>
  )
}
