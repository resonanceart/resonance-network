'use client'

import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'

interface CTAProps {
  loggedOutHref: string
  loggedOutLabel: string
  loggedInHref: string
  loggedInLabel: string
  className?: string
}

export function AuthAwareCTA({ loggedOutHref, loggedOutLabel, loggedInHref, loggedInLabel, className }: CTAProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <Link href={loggedOutHref} className={className}>
        {loggedOutLabel}
      </Link>
    )
  }

  return (
    <Link href={user ? loggedInHref : loggedOutHref} className={className}>
      {user ? loggedInLabel : loggedOutLabel}
    </Link>
  )
}
