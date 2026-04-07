'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { OnboardingWizard } from '@/components/OnboardingWizard'

export default function WelcomePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showWizard, setShowWizard] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/login'); return }
    // Pre-fill name from auth metadata
    const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || ''
    setDisplayName(fullName)
    // Ensure user profile exists
    fetch('/api/auth/welcome', { method: 'POST' }).catch(() => {})
    // Link any existing submissions
    fetch('/api/user/link-submissions', { method: 'POST' }).catch(() => {})

    // Check if onboarding was already completed or name already set
    fetch('/api/user/onboarding', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.onboarding_completed) {
          router.push('/dashboard')
          return
        }
        if (data.display_name) {
          setDisplayName(data.display_name)
          // Name already set — skip to wizard
          if (data.display_name.trim()) setShowWizard(true)
        }
      })
      .catch(() => {})
      .finally(() => setCheckingStatus(false))
  }, [user, authLoading, router])

  async function handleContinue() {
    if (!displayName.trim()) {
      setError('Please enter your name.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: displayName.trim() }),
      })
      if (!res.ok) throw new Error('Failed to save')
      setShowWizard(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  function handleWizardComplete() {
    router.push('/dashboard?onboarded=1')
  }

  if (authLoading || checkingStatus) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-16)', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
      </div>
    )
  }

  // Show the onboarding wizard after name is set
  if (showWizard) {
    return <OnboardingWizard onComplete={handleWizardComplete} />
  }

  // Name entry step
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)' }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>
          Welcome to Resonance
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-8)', fontSize: 'var(--text-lg)' }}>
          Let&apos;s set up your profile. You can always edit it later.
        </p>

        <div style={{ textAlign: 'left', marginBottom: 'var(--space-6)' }}>
          <label htmlFor="display-name" className="form-label" style={{ marginBottom: 'var(--space-2)', display: 'block' }}>
            What&apos;s your name? *
          </label>
          <input
            id="display-name"
            type="text"
            className="form-input"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="Your name"
            maxLength={200}
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter') handleContinue() }}
            style={{ fontSize: 'var(--text-lg)', padding: 'var(--space-4)' }}
          />
        </div>

        {error && (
          <p style={{ color: 'var(--color-error, #ef4444)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
            {error}
          </p>
        )}

        <button
          className="btn btn--primary btn--large btn--full"
          onClick={handleContinue}
          disabled={saving || !displayName.trim()}
        >
          {saving ? 'Setting up...' : 'Continue'}
        </button>

        <p style={{ marginTop: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          Next: a quick quiz to personalize your experience.
        </p>
      </div>
    </div>
  )
}
