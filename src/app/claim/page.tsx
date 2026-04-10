'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────

interface ClaimPreviewProfile {
  id?: string
  display_name?: string | null
  bio?: string | null
  location?: string | null
  website?: string | null
  avatar_url?: string | null
  skills?: string[] | null
  profile_visibility?: string | null
  original_source_url?: string | null
  extended?: {
    professional_title?: string | null
    pronouns?: string | null
    location_secondary?: string | null
    cover_image_url?: string | null
    artist_statement?: string | null
    philosophy?: string | null
    media_gallery?: Array<{ type?: string; url?: string; title?: string; alt?: string }> | null
    accent_color?: string | null
    tools_and_materials?: string[] | null
  } | null
  skills_relation?: unknown[]
  tools?: unknown[]
  social_links?: Array<{ platform?: string; url?: string }> | null
  profile_skills?: Array<{ skill_name?: string; category?: string }> | null
  profile_tools?: Array<{ tool_name?: string; category?: string }> | null
}

interface PreviewResponse {
  success: true
  display_name: string | null
  target_email: string | null
  expires_at: string | null
  source_url: string | null
  profile: ClaimPreviewProfile & {
    social_links?: Array<{ platform?: string; url?: string }> | null
    skills?: unknown[] | string[] | null
    profile_skills?: Array<{ skill_name?: string; category?: string }> | null
    profile_tools?: Array<{ tool_name?: string; category?: string }> | null
  }
}

type PreviewErrorCode = 'invite_not_found' | 'expired' | 'already_claimed' | 'generic'

type PreviewState =
  | { status: 'loading' }
  | { status: 'error'; code: PreviewErrorCode; message: string }
  | { status: 'dismissed' }
  | { status: 'ready'; data: PreviewResponse }

// ─── Error messages ───────────────────────────────────────────────

function errorMessageFor(code: PreviewErrorCode): string {
  switch (code) {
    case 'invite_not_found':
      return "Hmm, we can't find this invite. It may have expired or been removed. If you think this is a mistake, reach out to hello@resonancenetwork.org."
    case 'expired':
      return "This invite has expired. If you still want to join, reach out to hello@resonancenetwork.org and we'll send you a fresh one."
    case 'already_claimed':
      return 'This profile has already been claimed. If this was you, log in to continue editing.'
    default:
      return 'Something went wrong loading this invite. Please try again in a moment.'
  }
}

// ─── Page wrapper with Suspense (required for useSearchParams) ────

export default function ClaimPage() {
  return (
    <Suspense
      fallback={
        <div className="claim-page__loading">
          <div className="claim-page__spinner" aria-label="Loading" />
        </div>
      }
    >
      <ClaimPageInner />
      <ClaimPageStyles />
    </Suspense>
  )
}

// ─── Inner component ──────────────────────────────────────────────

function ClaimPageInner() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''

  const [state, setState] = useState<PreviewState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false

    if (!token) {
      setState({
        status: 'error',
        code: 'invite_not_found',
        message: errorMessageFor('invite_not_found'),
      })
      return
    }

    async function loadPreview() {
      try {
        const res = await fetch(`/api/claim/preview?token=${encodeURIComponent(token)}`, {
          credentials: 'same-origin',
          cache: 'no-store',
        })
        const data = await res.json().catch(() => ({}))

        if (cancelled) return

        if (res.ok && data?.success) {
          setState({ status: 'ready', data: data as PreviewResponse })
          return
        }

        const errorCode = (data?.error as string) || ''
        if (res.status === 404 || errorCode === 'invite_not_found') {
          setState({ status: 'error', code: 'invite_not_found', message: errorMessageFor('invite_not_found') })
        } else if (res.status === 410 || errorCode === 'expired') {
          setState({ status: 'error', code: 'expired', message: errorMessageFor('expired') })
        } else if (res.status === 409 || errorCode === 'already_claimed') {
          setState({ status: 'error', code: 'already_claimed', message: errorMessageFor('already_claimed') })
        } else {
          setState({ status: 'error', code: 'generic', message: errorMessageFor('generic') })
        }
      } catch {
        if (cancelled) return
        setState({ status: 'error', code: 'generic', message: errorMessageFor('generic') })
      }
    }

    loadPreview()
    return () => {
      cancelled = true
    }
  }, [token])

  if (state.status === 'loading') {
    return (
      <div className="claim-page__loading">
        <div className="claim-page__spinner" aria-label="Loading" />
        <p className="claim-page__loading-text">Loading your profile...</p>
      </div>
    )
  }

  if (state.status === 'error') {
    return <ClaimError code={state.code} message={state.message} />
  }

  if (state.status === 'dismissed') {
    return (
      <div className="claim-page__dismissed">
        <div className="claim-page__dismissed-card">
          <h1 className="claim-page__dismissed-title">Got it</h1>
          <p className="claim-page__dismissed-body">
            Thanks for stopping by. If this invite wasn&rsquo;t meant for you, you can safely close this tab.
          </p>
          <Link href="/" className="btn btn--outline btn--sm">
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  return <ClaimReady data={state.data} token={token} onDismiss={() => setState({ status: 'dismissed' })} />
}

// ─── Error screen ─────────────────────────────────────────────────

function ClaimError({
  code,
  message,
}: {
  code: PreviewErrorCode
  message: string
}) {
  return (
    <div className="claim-page__error">
      <div className="claim-page__error-card">
        <div className="claim-page__error-icon" aria-hidden="true">
          {code === 'already_claimed' ? '\u2713' : '\u26A0'}
        </div>
        <h1 className="claim-page__error-title">
          {code === 'invite_not_found' && 'Invite not found'}
          {code === 'expired' && 'Invite expired'}
          {code === 'already_claimed' && 'Already claimed'}
          {code === 'generic' && 'Something went wrong'}
        </h1>
        <p className="claim-page__error-body">{message}</p>
        <div className="claim-page__error-actions">
          {code === 'already_claimed' ? (
            <Link href="/login" className="btn btn--primary btn--sm">
              Log In
            </Link>
          ) : (
            <Link href="/" className="btn btn--outline btn--sm">
              Home
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Ready state: preview + signup form ──────────────────────────

function ClaimReady({
  data,
  token,
  onDismiss,
}: {
  data: PreviewResponse
  token: string
  onDismiss: () => void
}) {
  const profile = data.profile
  const displayName = data.display_name || profile?.display_name || 'Your profile'
  const targetEmail = data.target_email || ''
  const sourceUrl = data.source_url || profile?.original_source_url || ''
  const expiresAt = data.expires_at

  const sourceUrlDisplay = (() => {
    if (!sourceUrl) return ''
    try {
      const u = new URL(sourceUrl)
      return u.hostname.replace(/^www\./, '') + u.pathname.replace(/\/$/, '')
    } catch {
      return sourceUrl
    }
  })()

  const expiryFormatted = (() => {
    if (!expiresAt) return ''
    try {
      return new Date(expiresAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return ''
    }
  })()

  return (
    <div className="claim-page">
      {/* Header */}
      <header className="claim-page__header">
        <div className="claim-page__header-inner">
          <h1 className="claim-page__title">Your Resonance Network Profile</h1>
          <p className="claim-page__intro">
            {sourceUrl ? (
              <>
                We built this profile for you based on your website at{' '}
                <strong>{sourceUrlDisplay || 'your site'}</strong>. Take a look, then create a password to claim it and
                make it yours.
              </>
            ) : (
              <>We built this profile for you. Take a look, then create a password to claim it and make it yours.</>
            )}
          </p>
        </div>
      </header>

      {/* Split layout: preview + signup */}
      <main className="claim-page__main">
        {/* Mobile: signup form FIRST */}
        <aside className="claim-page__form-wrapper claim-page__form-wrapper--mobile">
          <ClaimForm
            token={token}
            displayName={displayName}
            targetEmail={targetEmail}
            expiryFormatted={expiryFormatted}
            onDismiss={onDismiss}
          />
          <p className="claim-page__scroll-hint">{'\u2193 Scroll down to see your profile'}</p>
        </aside>

        {/* Desktop: preview LEFT */}
        <section className="claim-page__preview">
          <ProfilePreview profile={profile} displayName={displayName} />
        </section>

        {/* Desktop: signup form RIGHT (sticky) */}
        <aside className="claim-page__form-wrapper claim-page__form-wrapper--desktop">
          <div className="claim-page__form-sticky">
            <ClaimForm
              token={token}
              displayName={displayName}
              targetEmail={targetEmail}
              expiryFormatted={expiryFormatted}
              onDismiss={onDismiss}
            />
          </div>
        </aside>
      </main>

      <ClaimPageStyles />
    </div>
  )
}

// ─── Signup form ─────────────────────────────────────────────────

function ClaimForm({
  token,
  displayName,
  targetEmail,
  expiryFormatted,
  onDismiss,
}: {
  token: string
  displayName: string
  targetEmail: string
  expiryFormatted: string
  onDismiss: () => void
}) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [emailTaken, setEmailTaken] = useState(false)

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setFieldError(null)
      setFormError(null)
      setEmailTaken(false)

      if (password.length < 8) {
        setFieldError('Password must be at least 8 characters.')
        return
      }
      if (password !== confirmPassword) {
        setFieldError('Passwords do not match.')
        return
      }

      setSubmitting(true)
      try {
        const res = await fetch('/api/claim/finalize', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, password }),
        })
        const data = await res.json().catch(() => ({}))

        if (res.ok && data?.success) {
          // Hard reload so session cookies are picked up
          const redirect = typeof data.redirect === 'string' ? data.redirect : '/dashboard/profile/live-edit?welcome=claimed'
          window.location.href = redirect
          return
        }

        if (res.status === 409 && data?.error === 'email_taken') {
          setEmailTaken(true)
          setSubmitting(false)
          return
        }

        if (res.status === 410 || data?.error === 'expired') {
          setFormError('This invite has expired. Please ask for a new one.')
        } else if (res.status === 404 || data?.error === 'invite_not_found') {
          setFormError('This invite is no longer valid.')
        } else if (data?.error === 'weak_password') {
          setFieldError(data?.message || 'Password must be at least 8 characters.')
        } else if (res.status === 429) {
          setFormError('Too many attempts. Please wait a moment and try again.')
        } else {
          setFormError(data?.message || 'Unable to claim the profile. Please try again.')
        }
        setSubmitting(false)
      } catch {
        setFormError('Network error. Please check your connection and try again.')
        setSubmitting(false)
      }
    },
    [token, password, confirmPassword]
  )

  return (
    <div className="claim-form-card">
      <h2 className="claim-form-card__heading">Claim This Profile</h2>
      <p className="claim-form-card__subtext">Welcome, {displayName}. Create a password to take ownership.</p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="claim-form-card__field">
          <label htmlFor="claim-email" className="claim-form-card__label">
            Email
          </label>
          <input
            id="claim-email"
            type="email"
            value={targetEmail}
            readOnly
            disabled
            className="claim-form-card__input claim-form-card__input--locked"
            aria-readonly="true"
          />
        </div>

        <div className="claim-form-card__field">
          <label htmlFor="claim-password" className="claim-form-card__label">
            Password
          </label>
          <input
            id="claim-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            required
            minLength={8}
            autoComplete="new-password"
            disabled={submitting}
            className="claim-form-card__input"
          />
        </div>

        <div className="claim-form-card__field">
          <label htmlFor="claim-confirm" className="claim-form-card__label">
            Confirm Password
          </label>
          <input
            id="claim-confirm"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            required
            minLength={8}
            autoComplete="new-password"
            disabled={submitting}
            className="claim-form-card__input"
          />
        </div>

        {fieldError && (
          <div role="alert" className="claim-form-card__error">
            {fieldError}
          </div>
        )}

        {formError && (
          <div role="alert" className="claim-form-card__error">
            {formError}
          </div>
        )}

        {emailTaken && (
          <div role="alert" className="claim-form-card__error">
            You already have an account.{' '}
            <Link href="/login" className="claim-form-card__error-link">
              Log in
            </Link>{' '}
            to continue.
          </div>
        )}

        <button type="submit" className="btn btn--primary claim-form-card__submit" disabled={submitting}>
          {submitting ? 'Claiming...' : 'Claim This Profile'}
        </button>

        <button type="button" onClick={onDismiss} className="claim-form-card__dismiss" disabled={submitting}>
          Not you? Dismiss
        </button>

        {expiryFormatted && (
          <p className="claim-form-card__expiry">This invite expires on {expiryFormatted}.</p>
        )}
      </form>
    </div>
  )
}

// ─── Lightweight profile preview ─────────────────────────────────

function ProfilePreview({
  profile,
  displayName,
}: {
  profile: ClaimPreviewProfile
  displayName: string
}) {
  const ext = profile?.extended || null
  const coverImage = ext?.cover_image_url || null
  const avatarUrl = profile?.avatar_url || null
  const bio = profile?.bio || ''
  const professionalTitle = ext?.professional_title || ''
  const location = profile?.location || ''
  const accentColor = ext?.accent_color || '#01696F'

  // media gallery — accept unified items
  const gallery = Array.isArray(ext?.media_gallery)
    ? (ext.media_gallery as Array<{ type?: string; url?: string; title?: string; alt?: string }>)
    : []
  const galleryImages = gallery
    .filter((g) => (g?.type === 'image' || !g?.type) && typeof g?.url === 'string' && g.url)
    .slice(0, 9)

  const socialLinks = Array.isArray(profile?.social_links)
    ? (profile.social_links as Array<{ platform?: string; url?: string }>).filter(
        (s) => s && typeof s.url === 'string' && s.url
      )
    : []

  // skills — prefer profile_skills relation, fall back to legacy array
  const relationSkills = Array.isArray(profile?.profile_skills) ? profile.profile_skills : []
  const legacySkills = Array.isArray(profile?.skills) ? (profile.skills as string[]) : []
  const skillList =
    relationSkills.length > 0
      ? relationSkills.map((s) => s?.skill_name || '').filter(Boolean)
      : legacySkills.filter(Boolean)

  const artistStatement = ext?.artist_statement || ''
  const philosophy = ext?.philosophy || ''

  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <article className="claim-preview" style={{ '--claim-accent': accentColor } as React.CSSProperties}>
      {/* Cover */}
      <div
        className="claim-preview__cover"
        style={
          coverImage
            ? { backgroundImage: `url(${coverImage})` }
            : { background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}cc 50%, ${accentColor}88 100%)` }
        }
      />

      {/* Identity */}
      <div className="claim-preview__identity">
        <div className="claim-preview__avatar">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} />
          ) : (
            <span className="claim-preview__avatar-initials">{initials || '\u2022'}</span>
          )}
        </div>
        <div className="claim-preview__identity-text">
          <h2 className="claim-preview__name">{displayName}</h2>
          {professionalTitle && <p className="claim-preview__title">{professionalTitle}</p>}
          {location && <p className="claim-preview__location">{location}</p>}
        </div>
      </div>

      {/* Bio */}
      {bio && (
        <section className="claim-preview__section">
          <h3 className="claim-preview__section-title">About</h3>
          <p className="claim-preview__body">{bio}</p>
        </section>
      )}

      {/* Artist statement */}
      {artistStatement && (
        <section className="claim-preview__section">
          <h3 className="claim-preview__section-title">Artist Statement</h3>
          <p className="claim-preview__body">{artistStatement}</p>
        </section>
      )}

      {/* Skills */}
      {skillList.length > 0 && (
        <section className="claim-preview__section">
          <h3 className="claim-preview__section-title">Skills</h3>
          <div className="claim-preview__tags">
            {skillList.map((skill, i) => (
              <span key={`skill-${i}`} className="claim-preview__tag">
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Gallery */}
      {galleryImages.length > 0 && (
        <section className="claim-preview__section">
          <h3 className="claim-preview__section-title">Gallery</h3>
          <div className="claim-preview__gallery">
            {galleryImages.map((g, i) => (
              <div key={`gal-${i}`} className="claim-preview__gallery-item">
                <img src={g.url} alt={g.alt || g.title || ''} loading="lazy" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Philosophy */}
      {philosophy && (
        <section className="claim-preview__section">
          <h3 className="claim-preview__section-title">Philosophy</h3>
          <p className="claim-preview__body">{philosophy}</p>
        </section>
      )}

      {/* Social links */}
      {socialLinks.length > 0 && (
        <section className="claim-preview__section">
          <h3 className="claim-preview__section-title">Links</h3>
          <ul className="claim-preview__links">
            {socialLinks.map((s, i) => (
              <li key={`link-${i}`}>
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.platform || s.url}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  )
}

// ─── Styles ──────────────────────────────────────────────────────

function ClaimPageStyles() {
  return (
    <style jsx global>{`
      .claim-page {
        min-height: 100vh;
        background: var(--color-bg, #0a0a0a);
        color: var(--color-text, #f5f5f5);
        font-family: var(--font-body, system-ui, sans-serif);
      }

      .claim-page__header {
        padding: var(--space-10, 40px) var(--space-4, 16px) var(--space-6, 24px);
        text-align: center;
      }
      .claim-page__header-inner {
        max-width: 720px;
        margin: 0 auto;
      }
      .claim-page__title {
        font-family: var(--font-display, serif);
        font-size: clamp(28px, 5vw, 44px);
        line-height: 1.15;
        margin: 0 0 var(--space-3, 12px);
        color: var(--color-text, #f5f5f5);
      }
      .claim-page__intro {
        font-size: var(--text-base, 16px);
        color: var(--color-text-muted, #9ca3af);
        line-height: 1.6;
        margin: 0 auto;
        max-width: 560px;
      }
      .claim-page__intro strong {
        color: var(--color-text, #f5f5f5);
        font-weight: 500;
      }

      .claim-page__main {
        display: grid;
        grid-template-columns: 1fr;
        gap: var(--space-6, 24px);
        padding: var(--space-4, 16px) var(--space-4, 16px) var(--space-12, 48px);
        max-width: 1280px;
        margin: 0 auto;
      }

      .claim-page__preview {
        min-width: 0;
      }

      .claim-page__form-wrapper--mobile {
        display: block;
      }
      .claim-page__form-wrapper--desktop {
        display: none;
      }
      .claim-page__scroll-hint {
        text-align: center;
        color: var(--color-text-muted, #9ca3af);
        font-size: var(--text-sm, 13px);
        margin: var(--space-3, 12px) 0 0;
      }

      @media (min-width: 768px) {
        .claim-page__main {
          grid-template-columns: minmax(0, 2fr) minmax(300px, 1fr);
          gap: var(--space-8, 32px);
          padding: var(--space-6, 24px) var(--space-6, 24px) var(--space-16, 64px);
        }
        .claim-page__form-wrapper--mobile {
          display: none;
        }
        .claim-page__form-wrapper--desktop {
          display: block;
        }
        .claim-page__form-sticky {
          position: sticky;
          top: var(--space-6, 24px);
        }
      }

      /* ── Form card ── */
      .claim-form-card {
        background: var(--color-surface, #111);
        border: 1px solid var(--color-border, #222);
        border-radius: 16px;
        padding: var(--space-6, 24px);
        box-shadow: 0 16px 48px rgba(0, 0, 0, 0.25);
      }
      .claim-form-card__heading {
        font-family: var(--font-display, serif);
        font-size: var(--text-xl, 22px);
        margin: 0 0 var(--space-2, 8px);
        color: var(--color-text, #f5f5f5);
      }
      .claim-form-card__subtext {
        font-size: var(--text-sm, 13px);
        color: var(--color-text-muted, #9ca3af);
        line-height: 1.5;
        margin: 0 0 var(--space-5, 20px);
      }
      .claim-form-card__field {
        margin-bottom: var(--space-4, 16px);
      }
      .claim-form-card__label {
        display: block;
        font-size: var(--text-sm, 13px);
        font-weight: 500;
        color: var(--color-text, #f5f5f5);
        margin-bottom: var(--space-1, 4px);
      }
      .claim-form-card__input {
        width: 100%;
        padding: 10px 12px;
        background: var(--color-bg, #0a0a0a);
        border: 1px solid var(--color-border, #222);
        border-radius: 8px;
        color: var(--color-text, #f5f5f5);
        font-size: var(--text-base, 14px);
        font-family: inherit;
        outline: none;
        transition: border-color 0.15s ease;
      }
      .claim-form-card__input:focus {
        border-color: var(--color-primary, #14b8a6);
      }
      .claim-form-card__input--locked {
        opacity: 0.65;
        cursor: not-allowed;
      }
      .claim-form-card__error {
        padding: 10px 12px;
        margin-bottom: var(--space-3, 12px);
        background: rgba(220, 38, 38, 0.1);
        border: 1px solid rgba(220, 38, 38, 0.3);
        border-radius: 8px;
        color: #ef4444;
        font-size: var(--text-sm, 13px);
        line-height: 1.5;
      }
      .claim-form-card__error-link {
        color: #ef4444;
        text-decoration: underline;
      }
      .claim-form-card__submit {
        width: 100%;
        padding: 12px 16px;
        margin-top: var(--space-2, 8px);
        font-size: var(--text-base, 15px);
      }
      .claim-form-card__dismiss {
        display: block;
        width: 100%;
        background: none;
        border: none;
        color: var(--color-text-muted, #9ca3af);
        font-size: var(--text-sm, 13px);
        text-align: center;
        padding: var(--space-3, 12px) 0 0;
        cursor: pointer;
        text-decoration: underline;
      }
      .claim-form-card__dismiss:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .claim-form-card__expiry {
        font-size: var(--text-xs, 12px);
        color: var(--color-text-muted, #9ca3af);
        text-align: center;
        margin: var(--space-4, 16px) 0 0;
      }

      /* ── Preview ── */
      .claim-preview {
        background: var(--color-surface, #111);
        border: 1px solid var(--color-border, #222);
        border-radius: 16px;
        overflow: hidden;
      }
      .claim-preview__cover {
        width: 100%;
        aspect-ratio: 3 / 1;
        background-size: cover;
        background-position: center;
      }
      .claim-preview__identity {
        display: flex;
        gap: var(--space-4, 16px);
        align-items: flex-end;
        padding: 0 var(--space-6, 24px);
        margin-top: -48px;
      }
      .claim-preview__avatar {
        width: 96px;
        height: 96px;
        border-radius: 50%;
        background: var(--color-surface, #111);
        border: 3px solid var(--color-surface, #111);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
        overflow: hidden;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .claim-preview__avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .claim-preview__avatar-initials {
        font-family: var(--font-display, serif);
        font-size: 32px;
        color: var(--claim-accent, var(--color-primary, #14b8a6));
      }
      .claim-preview__identity-text {
        flex: 1;
        min-width: 0;
        padding-bottom: var(--space-2, 8px);
      }
      .claim-preview__name {
        font-family: var(--font-display, serif);
        font-size: var(--text-2xl, 28px);
        line-height: 1.1;
        margin: 0 0 4px;
        color: var(--color-text, #f5f5f5);
        word-wrap: break-word;
      }
      .claim-preview__title {
        font-size: var(--text-sm, 14px);
        color: var(--claim-accent, var(--color-primary, #14b8a6));
        margin: 0 0 2px;
      }
      .claim-preview__location {
        font-size: var(--text-sm, 13px);
        color: var(--color-text-muted, #9ca3af);
        margin: 0;
      }
      .claim-preview__section {
        padding: var(--space-5, 20px) var(--space-6, 24px);
        border-top: 1px solid var(--color-border, #222);
      }
      .claim-preview__section:first-of-type {
        border-top: none;
        margin-top: var(--space-5, 20px);
      }
      .claim-preview__section-title {
        font-family: var(--font-display, serif);
        font-size: var(--text-sm, 13px);
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--color-text-muted, #9ca3af);
        margin: 0 0 var(--space-3, 12px);
        font-weight: 500;
      }
      .claim-preview__body {
        font-size: var(--text-base, 15px);
        line-height: 1.7;
        color: var(--color-text, #d1d5db);
        margin: 0;
        white-space: pre-wrap;
      }
      .claim-preview__tags {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-2, 8px);
      }
      .claim-preview__tag {
        display: inline-block;
        padding: 4px 10px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--color-border, #222);
        border-radius: 999px;
        font-size: var(--text-xs, 12px);
        color: var(--color-text, #f5f5f5);
      }
      .claim-preview__gallery {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: var(--space-2, 8px);
      }
      .claim-preview__gallery-item {
        aspect-ratio: 1;
        overflow: hidden;
        border-radius: 8px;
        background: var(--color-bg, #0a0a0a);
      }
      .claim-preview__gallery-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .claim-preview__links {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: var(--space-2, 8px);
      }
      .claim-preview__links a {
        color: var(--claim-accent, var(--color-primary, #14b8a6));
        text-decoration: none;
        font-size: var(--text-sm, 14px);
        word-break: break-all;
      }
      .claim-preview__links a:hover {
        text-decoration: underline;
      }

      /* ── Loading + error ── */
      .claim-page__loading {
        min-height: 100vh;
        background: var(--color-bg, #0a0a0a);
        color: var(--color-text, #f5f5f5);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--space-3, 12px);
      }
      .claim-page__spinner {
        width: 40px;
        height: 40px;
        border: 3px solid var(--color-border, #222);
        border-top-color: var(--color-primary, #14b8a6);
        border-radius: 50%;
        animation: claim-spin 0.8s linear infinite;
      }
      .claim-page__loading-text {
        color: var(--color-text-muted, #9ca3af);
        font-size: var(--text-sm, 14px);
      }
      @keyframes claim-spin {
        to {
          transform: rotate(360deg);
        }
      }

      .claim-page__error,
      .claim-page__dismissed {
        min-height: 100vh;
        background: var(--color-bg, #0a0a0a);
        color: var(--color-text, #f5f5f5);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--space-4, 16px);
      }
      .claim-page__error-card,
      .claim-page__dismissed-card {
        background: var(--color-surface, #111);
        border: 1px solid var(--color-border, #222);
        border-radius: 16px;
        padding: var(--space-8, 32px);
        max-width: 480px;
        width: 100%;
        text-align: center;
      }
      .claim-page__error-icon {
        font-size: 48px;
        line-height: 1;
        color: var(--color-primary, #14b8a6);
        margin-bottom: var(--space-3, 12px);
      }
      .claim-page__error-title,
      .claim-page__dismissed-title {
        font-family: var(--font-display, serif);
        font-size: var(--text-2xl, 26px);
        margin: 0 0 var(--space-3, 12px);
      }
      .claim-page__error-body,
      .claim-page__dismissed-body {
        color: var(--color-text-muted, #9ca3af);
        font-size: var(--text-base, 15px);
        line-height: 1.6;
        margin: 0 0 var(--space-5, 20px);
      }
      .claim-page__error-actions {
        display: flex;
        gap: var(--space-2, 8px);
        justify-content: center;
      }
    `}</style>
  )
}
