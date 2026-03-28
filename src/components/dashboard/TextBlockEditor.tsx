'use client'

import React, { useRef, useState } from 'react'
import type { TextBlockContent } from '@/types'

interface TextBlockEditorProps {
  content: TextBlockContent
  onChange: (content: TextBlockContent) => void
}

export default function TextBlockEditor({ content, onChange }: TextBlockEditorProps) {
  const [preview, setPreview] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function wrapSelection(before: string, after: string) {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const text = content.markdown
    const selected = text.slice(start, end)
    const newText = text.slice(0, start) + before + selected + after + text.slice(end)
    onChange({ ...content, markdown: newText })
    requestAnimationFrame(() => {
      ta.focus()
      ta.setSelectionRange(start + before.length, end + before.length)
    })
  }

  function prependLine(prefix: string) {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const text = content.markdown
    const lineStart = text.lastIndexOf('\n', start - 1) + 1
    const newText = text.slice(0, lineStart) + prefix + text.slice(lineStart)
    onChange({ ...content, markdown: newText })
    requestAnimationFrame(() => {
      ta.focus()
      ta.setSelectionRange(start + prefix.length, start + prefix.length)
    })
  }

  function insertAtCursor(insert: string) {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const text = content.markdown
    const newText = text.slice(0, start) + insert + text.slice(start)
    onChange({ ...content, markdown: newText })
    requestAnimationFrame(() => {
      ta.focus()
      ta.setSelectionRange(start + insert.length, start + insert.length)
    })
  }

  return (
    <div className="text-block-editor">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
        <div className="text-block-editor__toolbar">
          <button type="button" className="text-block-editor__toolbar-btn" onClick={() => wrapSelection('**', '**')} title="Bold">B</button>
          <button type="button" className="text-block-editor__toolbar-btn" onClick={() => wrapSelection('*', '*')} title="Italic" style={{ fontStyle: 'italic' }}>I</button>
          <button type="button" className="text-block-editor__toolbar-btn" onClick={() => prependLine('## ')} title="Heading">H</button>
          <button type="button" className="text-block-editor__toolbar-btn" onClick={() => insertAtCursor('[text](url)')} title="Link">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><path d="M6 8l2-2M6 6H4.5a2.5 2.5 0 000 5H6M8 6h1.5a2.5 2.5 0 010 5H8" /></svg>
          </button>
          <button type="button" className="text-block-editor__toolbar-btn" onClick={() => prependLine('- ')} title="List">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><path d="M5 3h8M5 7h8M5 11h8" /><circle cx="2" cy="3" r="0.8" fill="currentColor" /><circle cx="2" cy="7" r="0.8" fill="currentColor" /><circle cx="2" cy="11" r="0.8" fill="currentColor" /></svg>
          </button>
        </div>
        <button
          type="button"
          className="text-block-editor__toolbar-btn"
          onClick={() => setPreview(!preview)}
          style={{ marginLeft: 'var(--space-2)' }}
        >
          {preview ? 'Edit' : 'Preview'}
        </button>
      </div>

      {preview ? (
        <div
          style={{
            padding: 'var(--space-3)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            minHeight: '160px',
            fontSize: 'var(--text-sm)',
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
          }}
        >
          {content.markdown || 'Nothing to preview'}
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          rows={8}
          value={content.markdown}
          onChange={e => onChange({ ...content, markdown: e.target.value })}
          placeholder="Write your content in Markdown..."
          style={{
            width: '100%',
            padding: 'var(--space-3)',
            border: '1px solid var(--color-border)',
            borderRadius: '0 0 var(--radius-md) var(--radius-md)',
            fontSize: 'var(--text-sm)',
            fontFamily: 'monospace',
            resize: 'vertical',
            boxSizing: 'border-box',
          }}
        />
      )}
    </div>
  )
}
