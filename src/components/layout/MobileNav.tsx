'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function MobileNav({ isOpen, onClose }: Props) {
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!isOpen) return

    // Focus the first link when opening
    const firstLink = navRef.current?.querySelector('a') as HTMLElement | null
    firstLink?.focus()

    // Close on Escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }

      // Focus trap within the mobile nav
      if (e.key === 'Tab') {
        const focusableElements = navRef.current?.querySelectorAll('a') ?? []
        if (focusableElements.length === 0) return

        const firstEl = focusableElements[0] as HTMLElement
        const lastEl = focusableElements[focusableElements.length - 1] as HTMLElement

        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            e.preventDefault()
            lastEl.focus()
          }
        } else {
          if (document.activeElement === lastEl) {
            e.preventDefault()
            firstEl.focus()
          }
        }
      }
    }

    // Prevent body scroll when mobile nav is open
    document.body.style.overflow = 'hidden'

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  return (
    <nav
      ref={navRef}
      className={`nav-mobile${isOpen ? ' active' : ''}`}
      aria-label="Mobile navigation"
      aria-hidden={!isOpen}
    >
      <Link href="/collaborate" onClick={onClose}>Collaborate</Link>
      <Link href="/about" onClick={onClose}>About</Link>
      <Link href="/submit" onClick={onClose}>Submit Your Project</Link>
    </nav>
  )
}
