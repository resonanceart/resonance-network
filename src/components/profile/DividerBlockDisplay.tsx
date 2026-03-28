import type { DividerBlockContent } from '@/types'

export function DividerBlockDisplay({ content }: { content: DividerBlockContent }) {
  if (content.variant === 'space') {
    return <div className="divider-block-display divider-block-display--space" />
  }

  if (content.variant === 'dots') {
    return (
      <div className="divider-block-display divider-block-display--dots" aria-hidden="true">
        <span>&middot; &middot; &middot;</span>
      </div>
    )
  }

  // 'line' variant (default)
  return (
    <div className="divider-block-display divider-block-display--line">
      {content.label ? (
        <span className="divider-block-display__label">{content.label}</span>
      ) : (
        <hr />
      )}
    </div>
  )
}
