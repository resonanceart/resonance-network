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
  const redirectTo = searchParams.get('redirect') || '/dashboard'
  const defaultTab = searchParams.get('tab') as Tab | null
  const [tab, setTab] = useState<Tab>(defaultTab === 'signup' ? 'signup' : 'signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createSupabaseBrowserClient()

  const urlError = searchParams.get('error')
  const urlErrorDesc = searchParams.get('error_description')
  const emailValid = email.length > 0 && isValidEmail(email)
  const passwordStrength = useMemo(() => getPasswordStrength(password), [password])

  const handleGoogleSignIn = async () => {
    setError('')
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
        },
      })
      if (error) {
        setError(error.message)
        setLoading(false)
      }
      // If successful, the browser redirects — no need to handle here
    } catch {
      setError('Google sign-in is not available right now. Please use email and password.')
      setLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push(redirectTo)
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
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    })
    if (error) {
      if (error.message.toLowerCase().includes('already registered') || error.message.toLowerCase().includes('already been registered')) {
        setError('email_exists')
      } else {
        setError(error.message)
      }
      setLoading(false)
    } else {
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        setError('email_exists')
        setLoading(false)
      } else {
        setMessage(
          redirectTo !== '/dashboard'
            ? 'Check your email for a confirmation link. You\u2019ll be redirected after confirming.'
            : 'Check your email for a confirmation link.'
        )
        setLoading(false)
      }
    }
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
          {urlErrorDesc
            ? urlErrorDesc.replace(/\+/g, ' ')
            : 'Authentication failed. Please try again.'}
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

      {/* Google Sign-In — hidden until OAuth is configured in Supabase Dashboard
         To enable: Supabase Dashboard → Auth → Providers → Google → Add Client ID + Secret
      <button type="button" onClick={handleGoogleSignIn} disabled={loading} className="auth-google-btn">
        <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
        <span>Continue with Google</span>
      </button>
      <div className="auth-divider"><span>or</span></div>
      */}

      {/* Email/Password Form */}
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
        <p style={{ textAlign: 'center', fontSize: 'var(--text-sm)' }}>
          <Link href="/reset-password" style={{ color: 'var(--color-primary)' }}>Forgot password?</Link>
        </p>
      )}
    </section>
  )
}
