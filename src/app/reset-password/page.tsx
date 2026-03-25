'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-auth'
import Link from 'next/link'

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const step = searchParams.get('step')
  const supabase = createSupabaseBrowserClient()

  if (step === 'update') {
    return <UpdatePassword supabase={supabase} />
  }

  return <RequestReset supabase={supabase} />
}

function RequestReset({ supabase }: { supabase: ReturnType<typeof createSupabaseBrowserClient> }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    const siteUrl = window.location.origin
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/reset-password?step=update`,
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Check your email for a password reset link.')
    }
    setLoading(false)
  }

  return (
    <section className="section" style={{ maxWidth: '28rem', margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
      <h1 className="section__title" style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
        Reset Password
      </h1>

      <p style={{ textAlign: 'center', marginBottom: 'var(--space-6)', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
        Enter your email address and we&apos;ll send you a link to reset your password.
      </p>

      {error && (
        <div className="form-error" style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', borderRadius: '8px', background: 'rgba(220,38,38,0.08)' }}>
          {error}
        </div>
      )}

      {message && (
        <div style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', borderRadius: '8px', background: 'rgba(20,184,166,0.08)', color: 'var(--color-primary)', fontSize: 'var(--text-sm)' }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="email">Email</label>
          <input
            id="email"
            className="form-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn--primary"
          disabled={loading}
          style={{ width: '100%', marginBottom: 'var(--space-4)' }}
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <p style={{ textAlign: 'center', fontSize: 'var(--text-sm)' }}>
        <Link href="/login" style={{ color: 'var(--color-primary)' }}>Back to Sign In</Link>
      </p>
    </section>
  )
}

function UpdatePassword({ supabase }: { supabase: ReturnType<typeof createSupabaseBrowserClient> }) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Your password has been updated. You can now sign in.')
    }
    setLoading(false)
  }

  return (
    <section className="section" style={{ maxWidth: '28rem', margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
      <h1 className="section__title" style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
        Set New Password
      </h1>

      {error && (
        <div className="form-error" style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', borderRadius: '8px', background: 'rgba(220,38,38,0.08)' }}>
          {error}
        </div>
      )}

      {message && (
        <div style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', borderRadius: '8px', background: 'rgba(20,184,166,0.08)', color: 'var(--color-primary)', fontSize: 'var(--text-sm)' }}>
          {message}
          <p style={{ marginTop: 'var(--space-2)' }}>
            <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Go to Sign In</Link>
          </p>
        </div>
      )}

      {!message && (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="password">New Password</label>
            <input
              id="password"
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              className="form-input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="btn btn--primary"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      )}
    </section>
  )
}
