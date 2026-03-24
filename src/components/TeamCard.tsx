import Image from 'next/image'
import Link from 'next/link'

interface Props {
  name: string
  bio: string
  photo?: string
  href?: string
}

export function TeamCard({ name, bio, photo, href }: Props) {
  const content = (
    <>
      {photo && (
        <Image
          className="team-card__photo"
          src={photo}
          alt={`Photo of ${name}`}
          width={400}
          height={533}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          loading="lazy"
          style={{ objectFit: 'cover' }}
        />
      )}
      <div className="team-card__body">
        <h3 className="team-card__name">{name}</h3>
        <p className="team-card__bio">{bio}</p>
        {href && <span className="team-card__view-profile">View Profile →</span>}
      </div>
    </>
  )

  if (href) {
    return (
      <Link href={href} className="team-card team-card--linked">
        {content}
      </Link>
    )
  }

  return <div className="team-card">{content}</div>
}
