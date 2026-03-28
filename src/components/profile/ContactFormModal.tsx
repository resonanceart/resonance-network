'use client'

import { useState, useEffect, useRef, FormEvent } from 'react'

interface ContactFormModalProps {
  profileName: string
  profileSlug: string
  isOpen: boolean
  onClose: () => void
}

const SUBJECT_TYPES = ['Collaboration', 'Commission', 'Hiring', 'General'] as const

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_MESSAGE_LENGTH = 2000

export function ContactFormModal({ profileName, profileSlug, isOpen, onClose }: ContactFormModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subjectType, setSubjectType] = useState<string>(SUBJECT_TYPES[0])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  // Close on Esc key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setName('')
      setEmail('')
      setSubjectType(SUBJECT_TYPES[0])
      setMessage('')
      setLoading(false)
      setSuccess(false)
      setError(null)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!name.trim()) {
      setError('Name is required.')
      return
    }
    if (!email.trim() || !EMAIL_REGEX.test(email)) {
      setError('Please enter a valid email address.')
      return
    }
    if (!message.trim()) {
      setError('Message is required.')
      return
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      setError(`Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.`)
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/profiles/${profileSlug}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject_type: subjectType,
          message: message.trim(),
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Something went wrong. Please try again.')
      }

      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="contact-modal__overlay" onClick={onClose}>
      <div
        className="contact-modal__card"
        ref={cardRef}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="contact-modal__close" onClick={onClose} aria-label="Close">
          &times;
        </button>

        {success ? (
          <div className="contact-modal__success">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
              <circle cx="24" cy="24" r="24" fill="#22c55e" opacity="0.15" />
              <path
                d="M15 25l6 6 12-12"
                stroke="#22c55e"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h2 className="contact-modal__title">Message sent!</h2>
            <p>We&apos;ll make sure {profileName} sees your message.</p>
          </div>
        ) : (
          <>
            <h2 className="contact-modal__title">Contact {profileName}</h2>

            {error && <div className="contact-modal__error">{error}</div>}

            <form className="contact-modal__form" onSubmit={handleSubmit} noValidate>
              <div className="contact-modal__field">
                <label className="contact-modal__label" htmlFor="contact-name">
                  Name <span aria-hidden="true">*</span>
                </label>
                <input
                  id="contact-name"
                  type="text"
                  className="contact-modal__input form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Your name"
                />
              </div>

              <div className="contact-modal__field">
                <label className="contact-modal__label" htmlFor="contact-email">
                  Email <span aria-hidden="true">*</span>
                </label>
                <input
                  id="contact-email"
                  type="email"
                  className="contact-modal__input form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                />
              </div>

              <div className="contact-modal__field">
                <label className="contact-modal__label" htmlFor="contact-subject">
                  Subject
                </label>
                <select
                  id="contact-subject"
                  className="contact-modal__select form-select"
                  value={subjectType}
                  onChange={(e) => setSubjectType(e.target.value)}
                >
                  {SUBJECT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="contact-modal__field">
                <label className="contact-modal__label" htmlFor="contact-message">
                  Message <span aria-hidden="true">*</span>
                </label>
                <textarea
                  id="contact-message"
                  className="contact-modal__textarea form-textarea"
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
                  required
                  rows={5}
                  placeholder="Your message..."
                />
                <span className="contact-modal__char-count">
                  {message.length}/{MAX_MESSAGE_LENGTH}
                </span>
              </div>

              <button
                type="submit"
                className="contact-modal__submit btn btn--primary btn--full"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
