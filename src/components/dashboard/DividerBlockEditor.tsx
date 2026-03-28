'use client'

import React from 'react'
import type { DividerBlockContent } from '@/types'

interface DividerBlockEditorProps {
  content: DividerBlockContent
  onChange: (content: DividerBlockContent) => void
}

export default function DividerBlockEditor({ content, onChange }: DividerBlockEditorProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <div>
        <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
          Style
        </label>
        <select
          value={content.variant}
          onChange={e => onChange({ ...content, variant: e.target.value as DividerBlockContent['variant'] })}
          style={{
            width: '200px',
            padding: 'var(--space-2) var(--space-3)',
            border: '1px solid var(--color-border)',
            borderRadius: '4px',
            fontSize: 'var(--text-sm)',
            background: 'var(--color-surface)',
          }}
        >
          <option value="line">Line</option>
          <option value="dots">Dots</option>
          <option value="space">Space</option>
        </select>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
          Label (optional)
        </label>
        <input
          type="text"
          value={content.label || ''}
          onChange={e => onChange({ ...content, label: e.target.value })}
          placeholder="Centered label on divider"
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
