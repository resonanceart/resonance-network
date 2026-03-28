import type { PdfBlockContent } from '@/types'

export function PdfBlockDisplay({ content }: { content: PdfBlockContent }) {
  return (
    <div className="pdf-block-display">
      <div className="pdf-block-display__icon" aria-hidden="true">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      </div>
      <div className="pdf-block-display__info">
        <strong>{content.title}</strong>
        {content.description && <p>{content.description}</p>}
      </div>
      <a href={content.url} target="_blank" rel="noopener noreferrer" className="btn btn--outline btn--sm">
        Download PDF
      </a>
    </div>
  )
}
