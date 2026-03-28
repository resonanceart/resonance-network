'use client'

import { useState } from 'react'
import { ContactFormModal } from './ContactFormModal'

interface ProfileHeaderClientProps {
  profileName: string
  profileSlug: string
  ctaPrimaryLabel: string
  ctaPrimaryAction: 'contact' | 'url' | 'booking'
  ctaPrimaryUrl?: string
  ctaSecondaryLabel: string
  ctaSecondaryAction: string
  ctaSecondaryUrl?: string
  profileEmail?: string
}

export function ProfileHeaderClient({
  profileName,
  profileSlug,
  ctaPrimaryLabel,
  ctaPrimaryAction,
  ctaPrimaryUrl,
  ctaSecondaryLabel,
  ctaSecondaryAction,
  ctaSecondaryUrl,
}: ProfileHeaderClientProps) {
  const [contactOpen, setContactOpen] = useState(false)

  const renderButton = (
    label: string,
    action: string,
    url: string | undefined,
    variant: 'primary' | 'secondary'
  ) => {
    const className = variant === 'primary' ? 'btn btn--primary' : 'btn btn--outline'

    if (action === 'contact') {
      return (
        <button className={className} onClick={() => setContactOpen(true)}>
          {label}
        </button>
      )
    }

    // For 'url' and 'booking' actions
    if (!url) return null

    return (
      <a className={className} href={url} target="_blank" rel="noopener noreferrer">
        {label}
      </a>
    )
  }

  const showSecondary =
    ctaSecondaryAction === 'contact' ||
    (ctaSecondaryAction === 'url' && ctaSecondaryUrl) ||
    (ctaSecondaryAction === 'booking' && ctaSecondaryUrl)

  return (
    <div className="profile-header__ctas">
      {renderButton(ctaPrimaryLabel, ctaPrimaryAction, ctaPrimaryUrl, 'primary')}
      {showSecondary &&
        renderButton(ctaSecondaryLabel, ctaSecondaryAction, ctaSecondaryUrl, 'secondary')}

      <ContactFormModal
        profileName={profileName}
        profileSlug={profileSlug}
        isOpen={contactOpen}
        onClose={() => setContactOpen(false)}
      />
    </div>
  )
}
