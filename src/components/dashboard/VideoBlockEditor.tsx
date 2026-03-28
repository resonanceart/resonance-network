'use client'

import React from 'react'
import type { VideoBlockContent } from '@/types'

interface VideoBlockEditorProps {
  content: VideoBlockContent
  onChange: (content: VideoBlockContent) => void
}

function detectPlatform(url: string): string {
  if (!url) return ''
  if (/youtube\.com|youtu\.be/i.test(url)) return 'YouTube detected'
  if (/vimeo\.com/i.test(url)) return 'Vimeo detected'
  return url.trim() ? 'Unknown URL' : ''
}

export default function VideoBlockEditor({ content, onChange }: VideoBlockEditorProps) {
  const platform = detectPlatform(content.url)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <div>
        <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
          Video URL
        </label>
        <input
          type="text"
          value={content.url}
          onChange={e => onChange({ ...content, url: e.target.value })}
          placeholder="Paste YouTube or Vimeo URL"
          style={{
            width: '100%',
            padding: 'var(--space-2) var(--space-3)',
            border: '1px solid var(--color-border)',
            borderRadius: '4px',
            fontSize: 'var(--text-sm)',
            boxSizing: 'border-box',
          }}
        />
        {platform && (
          <p style={{ margin: 'var(--space-1) 0 0', fontSize: 'var(--text-xs)', color: platform.startsWith('Unknown') ? 'var(--color-text-muted)' : 'var(--color-primary)' }}>
            {platform}
          </p>
        )}
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
          Caption (optional)
        </label>
        <input
          type="text"
          value={content.caption || ''}
          onChange={e => onChange({ ...content, caption: e.target.value })}
          placeholder="Video caption"
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
