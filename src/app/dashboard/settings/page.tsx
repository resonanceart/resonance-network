'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { createSupabaseBrowserClient } from '@/lib/supabase-auth'
import Link from 'next/link'

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  if (authLoading || !user) {
    return (
      <div className="container dashboard-loading">
        <div className="dashboard-spinner" aria-label="Loading settings" />
      </div>
    )
  }

  return (
    <section className="dashboard">
      <div className="container" style={{ maxWidth: '40rem', margin: '0 auto' }}>
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <Link href="/dashboard" style={{ color: 'var(--color-primary)', fontSize: 'var(--text-sm)' }}>
            &larr; Back to Dashboard
          </Link>
        </div>

        <h1 className="section__title" style={{ marginBottom: 'var(--space-8)' }}>Account Settings</h1>

        <ChangePasswordSection supabase={supabase} />
        <EmailPreferencesSection />
        <DataExportSection />
        <SignOutAllSection supabase={supabase} router={router} />
        <DeleteAccountSection router={router} />
      </div>
    </section>
  )
}

function ChangePasswordSection({ supabase }: { supabase: ReturnType<typeof createSupabaseBrowserClient> }) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Password updated successfully.')
      setNewPassword('')
      setConfirmPassword('')
    }
    setLoading(false)
  }

  return (
    <div style={{ marginBottom: 'var(--space-8)', padding: 'var(--space-6)', background: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
      <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>Change Password</h2>

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
          <label className="form-label" htmlFor="newPassword">New Password</label>
          <input
            id="newPassword"
            className="form-input"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="confirmNewPassword">Confirm New Password</label>
          <input
            id="confirmNewPassword"
            className="form-input"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
          />
        </div>

        <button type="submit" className="btn btn--primary btn--sm" disabled={loading}>
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  )
}

function EmailPreferencesSection() {
  const [prefs, setPrefs] = useState({
    project_updates: true,
    collaboration_notifications: true,
    newsletter: true,
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleToggle = (key: keyof typeof prefs) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = async () => {
    setLoading(true)
    setMessage('')

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_preferences: prefs }),
      })

      if (res.ok) {
        setMessage('Preferences saved.')
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginBottom: 'var(--space-8)', padding: 'var(--space-6)', background: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
      <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>Email Preferences</h2>

      {message && (
        <div style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', borderRadius: '8px', background: 'rgba(20,184,166,0.08)', color: 'var(--color-primary)', fontSize: 'var(--text-sm)' }}>
          {message}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {([
          { key: 'project_updates' as const, label: 'Project update emails' },
          { key: 'collaboration_notifications' as const, label: 'Collaboration notifications' },
          { key: 'newsletter' as const, label: 'Newsletter' },
        ]).map(({ key, label }) => (
          <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={prefs[key]}
              onChange={() => handleToggle(key)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
            />
            <span style={{ fontSize: 'var(--text-sm)' }}>{label}</span>
          </label>
        ))}
      </div>

      <button
        className="btn btn--primary btn--sm"
        onClick={handleSave}
        disabled={loading}
        style={{ marginTop: 'var(--space-4)' }}
      >
        {loading ? 'Saving...' : 'Save Preferences'}
      </button>
    </div>
  )
}

function DataExportSection() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleExport = async () => {
    setLoading(true)
    setMessage('')

    try {
      const res = await fetch('/api/user/export')
      if (!res.ok) {
        setMessage('Failed to export data.')
        setLoading(false)
        return
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `resonance-data-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setMessage('Data downloaded successfully.')
    } catch {
      setMessage('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginBottom: 'var(--space-8)', padding: 'var(--space-6)', background: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
      <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>Download My Data</h2>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
        Export all your data (profile, follows, messages, submissions) as a JSON file.
      </p>

      {message && (
        <div style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', borderRadius: '8px', background: 'rgba(20,184,166,0.08)', color: 'var(--color-primary)', fontSize: 'var(--text-sm)' }}>
          {message}
        </div>
      )}

      <button
        className="btn btn--outline btn--sm"
        onClick={handleExport}
        disabled={loading}
      >
        {loading ? 'Exporting...' : 'Download My Data'}
      </button>
    </div>
  )
}

function SignOutAllSection({ supabase, router }: { supabase: ReturnType<typeof createSupabaseBrowserClient>; router: ReturnType<typeof useRouter> }) {
  const [loading, setLoading] = useState(false)

  const handleSignOutAll = async () => {
    setLoading(true)
    await supabase.auth.signOut({ scope: 'global' })
    router.push('/login')
  }

  return (
    <div style={{ marginBottom: 'var(--space-8)', padding: 'var(--space-6)', background: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
      <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>Sign Out Everywhere</h2>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
        This will sign you out of all devices and browsers.
      </p>
      <button
        className="btn btn--outline btn--sm"
        onClick={handleSignOutAll}
        disabled={loading}
      >
        {loading ? 'Signing out...' : 'Sign Out of All Devices'}
      </button>
    </div>
  )
}

function DeleteAccountSection({ router }: { router: ReturnType<typeof useRouter> }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/user/profile', { method: 'DELETE' })

      if (res.ok) {
        router.push('/login')
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to delete account.')
        setLoading(false)
      }
    } catch {
      setError('Something went wrong.')
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 'var(--space-6)', background: 'var(--color-surface)', borderRadius: '12px', border: '1px solid rgba(220,38,38,0.3)' }}>
      <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)', color: '#dc2626' }}>Delete Account</h2>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
        Permanently delete your account and all associated data. This action cannot be undone.
      </p>

      {error && (
        <div className="form-error" style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', borderRadius: '8px', background: 'rgba(220,38,38,0.08)' }}>
          {error}
        </div>
      )}

      {!showConfirm ? (
        <button
          className="btn btn--sm"
          onClick={() => setShowConfirm(true)}
          style={{ background: '#dc2626', color: '#fff', border: 'none' }}
        >
          Delete My Account
        </button>
      ) : (
        <div>
          <p style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)', fontWeight: 600 }}>
            Type DELETE to confirm:
          </p>
          <input
            className="form-input"
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            style={{ marginBottom: 'var(--space-3)' }}
          />
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button
              className="btn btn--sm"
              onClick={handleDelete}
              disabled={confirmText !== 'DELETE' || loading}
              style={{ background: '#dc2626', color: '#fff', border: 'none', opacity: confirmText !== 'DELETE' ? 0.5 : 1 }}
            >
              {loading ? 'Deleting...' : 'Permanently Delete'}
            </button>
            <button
              className="btn btn--outline btn--sm"
              onClick={() => { setShowConfirm(false); setConfirmText('') }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
