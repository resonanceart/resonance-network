'use client'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase-auth'

type Tab = 'signin' | 'signup'

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

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setMessage('Check your email for a confirmation link.')
      setLoading(false)
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

      {(error || urlError) && (
        <div className="form-error" style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', borderRadius: '8px', background: 'rgba(220,38,38,0.08)' }}>
          {error || 'Authentication failed. Please try again.'}
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
          className={`btn ${tab === 'signin' ? 'btn--primary' : 'btn--secondary'}`}
          style={{ flex: 1 }}
        >
          Sign In
        </button>
        <button
          onClick={() => { setTab('signup'); setError(''); setMessage('') }}
          className={`btn ${tab === 'signup' ? 'btn--primary' : 'btn--secondary'}`}
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
            minLength={6}
          />
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
        <button
          onClick={handleMagicLink}
          className="btn btn--secondary"
          disabled={loading}
          style={{ width: '100%' }}
        >
          Send Magic Link Instead
        </button>
      )}
    </section>
  )
}
