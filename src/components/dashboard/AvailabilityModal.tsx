'use client'

import { useState, useEffect } from 'react'

interface AvailabilityModalProps {
  isOpen: boolean
  onClose: () => void
  currentStatus: string
  currentTypes: string[]
  currentNote: string
  onSave: (status: string, types: string[], note: string) => void
}

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open to opportunities' },
  { value: 'selective', label: 'Selective' },
  { value: 'focused', label: 'Focused on current work' },
] as const

const TYPE_OPTIONS = [
  'Freelance',
  'Full-time',
  'Contract',
  'Residency',
  'Mentorship',
  'Volunteer',
  'Commission',
] as const

export function AvailabilityModal({
  isOpen,
  onClose,
  currentStatus,
  currentTypes,
  currentNote,
  onSave,
}: AvailabilityModalProps) {
  const [status, setStatus] = useState(currentStatus)
  const [types, setTypes] = useState<string[]>(currentTypes)
  const [note, setNote] = useState(currentNote)

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStatus(currentStatus)
      setTypes(currentTypes)
      setNote(currentNote)
    }
  }, [isOpen, currentStatus, currentTypes, currentNote])

  // Close on Esc
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  function toggleType(type: string) {
    setTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  if (!isOpen) return null

  return (
    <div className="availability-modal__overlay" onClick={handleBackdropClick}>
      <div className="availability-modal__card">
        <button className="availability-modal__close" onClick={onClose} aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        <h2 className="availability-modal__title">Add Availability</h2>
        <p className="availability-modal__desc">
          Let people know what kind of work you&apos;re open to.
        </p>

        <label className="availability-modal__label">Status</label>
        <div className="availability-modal__status-grid">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`availability-modal__status-card${status === opt.value ? ' availability-modal__status-card--active' : ''}`}
              onClick={() => setStatus(opt.value)}
              type="button"
            >
              {opt.label}
            </button>
          ))}
        </div>

        <label className="availability-modal__label">Open to</label>
        <div className="availability-modal__types-grid">
          {TYPE_OPTIONS.map((type) => {
            const active = types.includes(type)
            return (
              <button
                key={type}
                className={`availability-modal__type-card${active ? ' availability-modal__type-card--active' : ''}`}
                onClick={() => toggleType(type)}
                type="button"
              >
                {active && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="availability-modal__type-check">
                    <path d="M3 8.5L6 11.5L13 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {type}
              </button>
            )
          })}
        </div>

        <div className="availability-modal__field">
          <label className="availability-modal__label" htmlFor="availability-note">
            Note (optional)
          </label>
          <input
            id="availability-note"
            type="text"
            className="availability-modal__input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Available for commissions starting June"
            maxLength={200}
          />
        </div>

        <div className="availability-modal__actions">
          <button className="btn btn--outline" onClick={onClose} type="button">
            Cancel
          </button>
          <button
            className="btn btn--primary"
            onClick={() => onSave(status, types, note)}
            type="button"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
