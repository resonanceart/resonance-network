'use client'

import { marked } from 'marked'
import type { TextBlockContent } from '@/types'

// Configure marked for safety
marked.setOptions({
  breaks: true,
  gfm: true,
})

export function TextBlockDisplay({ content }: { content: TextBlockContent }) {
  if (!content.markdown) return null

  const html = marked.parse(content.markdown, { async: false }) as string

  return <div className="text-block-display" dangerouslySetInnerHTML={{ __html: html }} />
}
