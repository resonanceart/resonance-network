import type { VideoBlockContent } from '@/types'

function getEmbedUrl(url: string): string | null {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  return null
}

export function VideoBlockDisplay({ content }: { content: VideoBlockContent }) {
  const embedUrl = getEmbedUrl(content.url)

  if (!embedUrl) {
    return (
      <div className="video-block-display video-block-display--unsupported">
        <p>Video format not supported. <a href={content.url} target="_blank" rel="noopener noreferrer">Watch on the original site</a></p>
      </div>
    )
  }

  return (
    <div>
      <div className="video-block-display">
        <iframe
          src={embedUrl}
          title={content.caption || 'Embedded video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      {content.caption && (
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)', textAlign: 'center' }}>
          {content.caption}
        </p>
      )}
    </div>
  )
}
