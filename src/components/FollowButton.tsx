'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'

interface FollowButtonProps {
  projectId: string
  compact?: boolean
}

export function FollowButton({ projectId, compact = false }: FollowButtonProps) {
  const { user, loading: authLoading } = useAuth()
  const [following, setFollowing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (authLoading || !user) return

    fetch(`/api/user/follows?projectId=${encodeURIComponent(projectId)}`)
      .then(res => res.json())
      .then(data => {
        setFollowing(!!data.following)
        setChecked(true)
      })
      .catch(() => setChecked(true))
  }, [user, authLoading, projectId])

  async function handleClick() {
    if (!user) {
      window.location.href = '/login'
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/user/follows', {
        method: following ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      })
      if (res.ok) {
        setFollowing(!following)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || (user && !checked)) return null

  const heartIcon = (
    <svg
      width={compact ? 16 : 18}
      height={compact ? 16 : 18}
      viewBox="0 0 24 24"
      fill={following ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`btn ${following ? 'btn--outline' : 'btn--primary'}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          ...(compact ? { padding: '6px 12px', fontSize: 'var(--text-sm)' } : {}),
        }}
        aria-label={following ? 'Unfollow this project' : 'Follow this project'}
      >
        {heartIcon}
        {!compact && (following ? 'Following' : 'Follow')}
      </button>
      {!user && !compact && (
        <span style={{ fontSize: 'var(--text-xs, 0.75rem)', color: 'var(--color-text-muted)', textAlign: 'center' }}>
          Sign in to follow this project and get updates
        </span>
      )}
    </div>
  )
}
