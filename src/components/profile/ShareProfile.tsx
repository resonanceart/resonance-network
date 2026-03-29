'use client'

import { useState } from 'react'

interface ShareProfileProps {
  slug: string
  displayName: string
}

export function ShareProfile({ slug, displayName }: ShareProfileProps) {
  const [copied, setCopied] = useState(false)

  const profileUrl = `https://resonance.network/profiles/${slug}`
  const tweetText = encodeURIComponent(
    `I just created my profile on @ResonanceNetwork — connecting community through passion and purpose. Check it out: ${profileUrl}`
  )

  function copyLink() {
    navigator.clipboard.writeText(profileUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  return (
    <div className="share-profile">
      <div className="share-profile__icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      </div>
      <h3 className="share-profile__heading">Share Your Profile</h3>
      <p className="share-profile__text">Let your network know you&apos;re on Resonance Network.</p>

      <div className="share-profile__buttons">
        <a
          href={`https://twitter.com/intent/tweet?text=${tweetText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="share-profile__btn share-profile__btn--x"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2.5 2.5l5.2 7L2.5 15.5h1.3l4.5-5.2 3.7 5.2h4.5L11 8.2l4.5-5.7h-1.3L10.3 7.2 7 2.5H2.5z" stroke="currentColor" strokeWidth="1.1" />
          </svg>
          <span>X / Twitter</span>
        </a>

        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="share-profile__btn share-profile__btn--linkedin"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="1.5" y="1.5" width="15" height="15" rx="2" stroke="currentColor" strokeWidth="1.3" />
            <path d="M5.5 8v4.5M5.5 5.5v.01M8 12.5V9.5c0-1.2.6-1.8 1.7-1.8 1.1 0 1.6.6 1.6 1.8v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <span>LinkedIn</span>
        </a>

        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="share-profile__btn share-profile__btn--facebook"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M16.5 9a7.5 7.5 0 10-8.7 7.4v-5.2H5.9V9h1.9V7.3c0-1.9 1.1-2.9 2.8-2.9.8 0 1.6.1 1.6.1v1.8h-.9c-.9 0-1.2.6-1.2 1.1V9h2.1l-.3 2.2h-1.8v5.2A7.5 7.5 0 0016.5 9z" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          <span>Facebook</span>
        </a>

        <button
          onClick={copyLink}
          className="share-profile__btn share-profile__btn--copy"
        >
          {copied ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
          )}
          <span>{copied ? 'Copied!' : 'Copy Link'}</span>
        </button>
      </div>
    </div>
  )
}
