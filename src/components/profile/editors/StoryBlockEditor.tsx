'use client'

import type { ContentBlock, TextBlockContent } from '@/types'

type Props = {
  block: ContentBlock
  content: TextBlockContent
  onChange: (updates: Partial<ContentBlock>) => void
}

export function StoryBlockEditor({ block, content, onChange }: Props) {
  return (
    <div className="story-block-editor">
      <input
        type="text"
        value={block.label || ''}
        onChange={(e) => onChange({ label: e.target.value })}
        placeholder="Block title (e.g. Artist Statement, My Practice)"
        className="story-block-editor__title"
        maxLength={120}
      />
      <textarea
        value={content.markdown || ''}
        onChange={(e) => onChange({
          content: { ...content, markdown: e.target.value } as TextBlockContent,
        })}
        placeholder="Write your text here. Supports simple line breaks."
        className="story-block-editor__body"
        rows={6}
      />
      <p className="story-block-editor__hint">
        {(content.markdown || '').length} / 5000 characters
      </p>
    </div>
  )
}
