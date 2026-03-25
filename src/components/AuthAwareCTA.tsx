'use client'

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
      <a href={loggedOutHref} className={className}>
        {loggedOutLabel}
      </a>
    )
  }

  return (
    <a href={user ? loggedInHref : loggedOutHref} className={className}>
      {user ? loggedInLabel : loggedOutLabel}
    </a>
  )
}
