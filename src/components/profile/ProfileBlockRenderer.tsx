'use client'

import type {
  ContentBlock,
  TextBlockContent,
  GalleryBlockContent,
  VideoBlockContent,
  ProjectBlockContent,
  TimelineBlockContent,
  TestimonialsBlockContent,
  LinksBlockContent,
  EmbedBlockContent,
  PdfBlockContent,
  DividerBlockContent,
  SkillsBlockContent,
  AudioBlockContent,
  ProfileMediaItem,
  ProfileProject,
} from '@/types'
import { TextBlockDisplay } from './TextBlockDisplay'
import { ProfileMediaGallery } from './ProfileMediaGallery'
import { VideoBlockDisplay } from './VideoBlockDisplay'
import { ProfileProjectCardEnhanced } from './ProfileProjectCardEnhanced'
import { ProfileTimeline } from './ProfileTimeline'
import { TestimonialsBlockDisplay } from './TestimonialsBlockDisplay'
import { EmbedBlockDisplay } from './EmbedBlockDisplay'
import { PdfBlockDisplay } from './PdfBlockDisplay'
import { DividerBlockDisplay } from './DividerBlockDisplay'
import { ProfileToolsMaterials } from './ProfileToolsMaterials'
import { AudioBlockDisplay } from './AudioBlockDisplay'

function mapGalleryContent(content: GalleryBlockContent): ProfileMediaItem[] {
  return (content.items || []).map((item, i) => ({
    url: item.url,
    alt: item.alt || '',
    caption: item.caption,
    type: 'image' as const,
    isFeatured: item.isFeatured,
    order: i,
  }))
}

function mapProjectContent(content: ProjectBlockContent): ProfileProject {
  return {
    title: content.title,
    description: content.description,
    image: content.image,
    url: content.url,
    year: content.year,
    role: content.role,
    materials: content.materials,
    outcomes: content.outcomes,
    galleryImages: content.galleryImages,
    isFeatured: content.isFeatured,
  }
}

function renderBlock(block: ContentBlock) {
  switch (block.type) {
    case 'text':
      return <TextBlockDisplay content={block.content as TextBlockContent} />
    case 'gallery':
      return <ProfileMediaGallery items={mapGalleryContent(block.content as GalleryBlockContent)} />
    case 'video':
      return <VideoBlockDisplay content={block.content as VideoBlockContent} />
    case 'project':
      return <ProfileProjectCardEnhanced project={mapProjectContent(block.content as ProjectBlockContent)} />
    case 'timeline':
      return <ProfileTimeline entries={(block.content as TimelineBlockContent).entries} />
    case 'testimonials':
      return <TestimonialsBlockDisplay content={block.content as TestimonialsBlockContent} />
    case 'links': {
      const links = (block.content as LinksBlockContent).items || []
      return (
        <div className="profile-links">
          {links.map((link, i) => (
            <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="profile-link">
              {link.label}
              {link.type && <span className="profile-link__type">{link.type}</span>}
            </a>
          ))}
        </div>
      )
    }
    case 'embed':
      return <EmbedBlockDisplay content={block.content as EmbedBlockContent} />
    case 'pdf':
      return <PdfBlockDisplay content={block.content as PdfBlockContent} />
    case 'divider':
      return <DividerBlockDisplay content={block.content as DividerBlockContent} />
    case 'skills':
      return <ProfileToolsMaterials tools={(block.content as SkillsBlockContent).tags} />
    case 'audio':
      return <AudioBlockDisplay content={block.content as AudioBlockContent} />
    default:
      return null
  }
}

export function ProfileBlockRenderer({ block }: { block: ContentBlock }) {
  if (block.visible === false) return null

  return (
    <section className="profile-block">
      <div className="container">
        {block.label && <p className="section-label">{block.label}</p>}
        {renderBlock(block)}
      </div>
    </section>
  )
}
