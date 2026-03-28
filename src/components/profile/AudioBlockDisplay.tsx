import type { AudioBlockContent } from '@/types'

function getSoundCloudEmbedUrl(url: string): string | null {
  if (url.includes('soundcloud.com')) {
    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%2314b8a6&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`
  }
  return null
}

function isDirectAudio(url: string): boolean {
  return /\.(mp3|wav|ogg|m4a|aac|flac)(\?.*)?$/i.test(url)
}

export function AudioBlockDisplay({ content }: { content: AudioBlockContent }) {
  const scEmbed = getSoundCloudEmbedUrl(content.url)

  if (scEmbed) {
    return (
      <div className="audio-block-display">
        {content.title && <p className="audio-block-display__title">{content.title}</p>}
        <iframe
          src={scEmbed}
          width="100%"
          height="166"
          scrolling="no"
          frameBorder="0"
          allow="autoplay"
          title={content.title || 'Audio player'}
          style={{ borderRadius: 'var(--radius-md)' }}
        />
      </div>
    )
  }

  if (isDirectAudio(content.url)) {
    return (
      <div className="audio-block-display">
        {content.title && <p className="audio-block-display__title">{content.title}</p>}
        <audio controls preload="metadata" style={{ width: '100%' }}>
          <source src={content.url} />
          Your browser does not support the audio element.
        </audio>
      </div>
    )
  }

  return (
    <div className="audio-block-display">
      <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
        Audio format not supported. <a href={content.url} target="_blank" rel="noopener noreferrer">Listen on the original site</a>
      </p>
    </div>
  )
}
