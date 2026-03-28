'use client'

import React from 'react'
import type { EmbedBlockContent } from '@/types'

interface EmbedBlockEditorProps {
  content: EmbedBlockContent
  onChange: (content: EmbedBlockContent) => void
}

export default function EmbedBlockEditor({ content, onChange }: EmbedBlockEditorProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <div>
        <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
          Embed URL
        </label>
        <input
          type="text"
          value={content.url}
          onChange={e => onChange({ ...content, url: e.target.value })}
          placeholder="Paste embed URL"
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
          Height (px)
        </label>
        <input
          type="number"
          min={200}
          max={800}
          value={content.height || 400}
          onChange={e => onChange({ ...content, height: Math.min(800, Math.max(200, Number(e.target.value))) })}
          style={{
            width: '120px',
            padding: 'var(--space-2) var(--space-3)',
            border: '1px solid var(--color-border)',
            borderRadius: '4px',
            fontSize: 'var(--text-sm)',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
        Supported: SoundCloud, Sketchfab, CodePen, Google Maps, and most oEmbed-compatible services.
      </p>
    </div>
  )
}
