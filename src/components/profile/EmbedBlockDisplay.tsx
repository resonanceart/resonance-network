import type { EmbedBlockContent } from '@/types'

const ALLOWED_DOMAINS = [
  'soundcloud.com',
  'w.soundcloud.com',
  'sketchfab.com',
  'open.spotify.com',
  'bandcamp.com',
  'google.com/maps',
  'docs.google.com',
]

function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ALLOWED_DOMAINS.some(d => parsed.hostname.endsWith(d.split('/')[0]) && parsed.pathname.startsWith('/' + (d.split('/').slice(1).join('/') || '')))
  } catch {
    return false
  }
}

export function EmbedBlockDisplay({ content }: { content: EmbedBlockContent }) {
  if (!isAllowedUrl(content.url)) {
    return (
      <div className="embed-block-display embed-block-display--unsupported">
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', textAlign: 'center', padding: 'var(--space-6)' }}>
          Embed not supported for this URL.
        </p>
      </div>
    )
  }

  return (
    <div className="embed-block-display" style={{ height: content.height || 400 }}>
      <iframe
        src={content.url}
        title="Embedded content"
        style={{ width: '100%', height: '100%', border: 0, borderRadius: 'var(--radius-md)' }}
        allow="autoplay; encrypted-media"
        allowFullScreen
      />
    </div>
  )
}
