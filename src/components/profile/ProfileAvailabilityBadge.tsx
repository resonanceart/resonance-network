export function ProfileAvailabilityBadge({ status, note }: { status: 'open' | 'busy' | 'unavailable'; note?: string }) {
  const labels = {
    open: 'Open for collaboration',
    busy: 'Currently busy',
    unavailable: 'Unavailable',
  }

  return (
    <div className={`profile-availability-badge profile-availability-badge--${status}`}>
      <span className="profile-availability-badge__dot" aria-hidden="true" />
      <span>{labels[status]}</span>
      {note && <span className="profile-availability-badge__note">{note}</span>}
    </div>
  )
}
