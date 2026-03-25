'use client'
import { Suspense, useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase-auth'
import Link from 'next/link'

type Tab = 'signin' | 'signup'

function getPasswordStrength(password: string) {
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 1) return { label: 'Weak', color: '#dc2626', width: 25 }
  if (score === 2) return { label: 'Fair', color: '#f59e0b', width: 50 }
  if (score === 3) return { label: 'Good', color: '#84cc16', width: 75 }
  return { label: 'Strong', color: '#16a34a', width: 100 }
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<Tab>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createSupabaseBrowserClient()

  const urlError = searchParams.get('error')
  const emailValid = email.length > 0 && isValidEmail(email)
  const passwordStrength = useMemo(() => getPasswordStrength(password), [password])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    })
    if (error) {
      // Supabase returns this when email already exists with "fake" signup
      if (error.message.toLowerCase().includes('already registered') || error.message.toLowerCase().includes('already been registered')) {
        setError('email_exists')
      } else {
        setError(error.message)
      }
      setLoading(false)
    } else {
      // Supabase may return a user with identities=[] if the email already exists
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        setError('email_exists')
        setLoading(false)
      } else {
        setMessage('Check your email for a confirmation link.')
        setLoading(false)
      }
    }
  }

  const handleMagicLink = async () => {
    if (!email) {
      setError('Please enter your email address.')
      return
    }
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) {
      setError(error.message)
    } else {
      setMessage('Check your email for a magic link.')
    }
    setLoading(false)
  }

  return (
    <section className="section" style={{ maxWidth: '28rem', margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
      <h1 className="section__title" style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
        {tab === 'signin' ? 'Sign In' : 'Create Account'}
      </h1>

      {error && error !== 'email_exists' && (
        <div className="form-error" style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', borderRadius: '8px', background: 'rgba(220,38,38,0.08)' }}>
          {error}
        </div>
      )}

      {!error && urlError && (
        <div className="form-error" style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', borderRadius: '8px', background: 'rgba(220,38,38,0.08)' }}>
          Authentication failed. Please try again.
        </div>
      )}

      {error === 'email_exists' && (
        <div className="form-error" style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', borderRadius: '8px', background: 'rgba(220,38,38,0.08)' }}>
          An account with this email already exists.{' '}
          <button
            type="button"
            onClick={() => { setTab('signin'); setError('') }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-primary)',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
              font: 'inherit',
            }}
          >
            Try signing in instead.
          </button>
        </div>
      )}

      {message && (
        <div style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', borderRadius: '8px', background: 'rgba(20,184,166,0.08)', color: 'var(--color-primary)', fontSize: 'var(--text-sm)' }}>
          {message}
        </div>
      )}

      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
        <button
          onClick={() => { setTab('signin'); setError(''); setMessage('') }}
          className={`btn ${tab === 'signin' ? 'btn--primary' : 'btn--outline'}`}
          style={{ flex: 1 }}
        >
          Sign In
        </button>
        <button
          onClick={() => { setTab('signup'); setError(''); setMessage('') }}
          className={`btn ${tab === 'signup' ? 'btn--primary' : 'btn--outline'}`}
          style={{ flex: 1 }}
        >
          Create Account
        </button>
      </div>

      <form onSubmit={tab === 'signin' ? handleSignIn : handleSignUp}>
        {tab === 'signup' && (
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input
              id="name"
              className="form-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="email">Email</label>
          <div className="form-input-wrapper">
            <input
              id="email"
              className="form-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            {emailValid && (
              <span className="form-input-wrapper__check" aria-label="Valid email">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">Password</label>
          <input
            id="password"
            className="form-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={8}
          />
          {tab === 'signup' && password.length > 0 && (
            <div className="password-strength">
              <div className="password-strength__bar">
                <div
                  className="password-strength__fill"
                  style={{ width: `${passwordStrength.width}%`, background: passwordStrength.color }}
                />
              </div>
              <span className="password-strength__label" style={{ color: passwordStrength.color }}>
                {passwordStrength.label}
                {password.length < 8 && ' — minimum 8 characters'}
              </span>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="btn btn--primary"
          disabled={loading}
          style={{ width: '100%', marginBottom: 'var(--space-4)' }}
        >
          {loading ? 'Loading...' : tab === 'signin' ? 'Sign In' : 'Create Account'}
        </button>
      </form>

      {tab === 'signin' && (
        <>
          <button
            onClick={handleMagicLink}
            className="btn btn--outline"
            disabled={loading}
            style={{ width: '100%', marginBottom: 'var(--space-4)' }}
          >
            Send Magic Link Instead
          </button>
          <p style={{ textAlign: 'center', fontSize: 'var(--text-sm)' }}>
            <Link href="/reset-password" style={{ color: 'var(--color-primary)' }}>Forgot password?</Link>
          </p>
        </>
      )}
    </section>
  )
}
