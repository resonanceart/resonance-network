import Image from 'next/image'

interface Props {
  name: string
  bio: string
  photo?: string
}

export function TeamCard({ name, bio, photo }: Props) {
  return (
    <div className="team-card">
      {photo && (
        <Image
          className="team-card__photo"
          src={photo}
          alt={name}
          width={120}
          height={120}
          style={{ objectFit: 'cover', borderRadius: '50%' }}
        />
      )}
      <div className="team-card__body">
        <h3 className="team-card__name">{name}</h3>
        <p className="team-card__bio">{bio}</p>
      </div>
    </div>
  )
}
