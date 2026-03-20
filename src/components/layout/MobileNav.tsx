'use client'
import Link from 'next/link'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function MobileNav({ isOpen, onClose }: Props) {
  return (
    <nav className={`nav-mobile${isOpen ? ' active' : ''}`} aria-label="Mobile navigation">
      <Link href="/collaborate" onClick={onClose}>Collaborate</Link>
      <Link href="/about" onClick={onClose}>About</Link>
      <Link href="/submit" onClick={onClose}>Submit a Project</Link>
    </nav>
  )
}
