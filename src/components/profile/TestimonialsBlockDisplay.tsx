import Image from 'next/image'
import type { TestimonialsBlockContent } from '@/types'

export function TestimonialsBlockDisplay({ content }: { content: TestimonialsBlockContent }) {
  if (!content.items || content.items.length === 0) return null

  return (
    <div className="testimonials-block-display">
      {content.items.map((item, i) => (
        <div key={i} className="testimonial-card">
          <blockquote className="testimonial-card__quote">
            <p>&ldquo;{item.quote}&rdquo;</p>
          </blockquote>
          <div className="testimonial-card__author">
            {item.authorPhoto && (
              <Image
                src={item.authorPhoto}
                alt={item.authorName}
                width={48}
                height={48}
                className="testimonial-card__photo"
                style={{ objectFit: 'cover' }}
              />
            )}
            <div>
              <strong className="testimonial-card__name">{item.authorName}</strong>
              {item.authorTitle && (
                <span className="testimonial-card__title">{item.authorTitle}</span>
              )}
            </div>
            {item.relationship && (
              <span className="testimonial-card__relationship">{item.relationship}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
