'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { createSupabaseBrowserClient } from '@/lib/supabase-auth'
import Link from 'next/link'
import { FeatureRequestForm } from '@/components/FeatureRequestForm'

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
      <div className="container settings-container">
        <div className="settings-back">
          <Link href="/dashboard" className="settings-back__link">
            &larr; Back to Dashboard
          </Link>
        </div>

        <h1 className="settings-title">Account Settings</h1>

        <ChangePasswordSection supabase={supabase} />
        <EmailPreferencesSection />

        <div className="settings-card">
          <h2 className="settings-card__title">Feature Requests</h2>
          <p className="settings-card__desc">
            Have an idea for a new feature? Let us know what would make Resonance Network better for you.
          </p>
          <FeatureRequestForm />
        </div>

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
    <div className="settings-card">
      <h2 className="settings-card__title">Change Password</h2>

      {error && (
        <div className="form-error" style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', borderRadius: '8px', background: 'rgba(220,38,38,0.08)' }}>
          {error}
        </div>
      )}

      {message && (
        <div className="settings-success">
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
    <div className="settings-card">
      <h2 className="settings-card__title">Email Preferences</h2>

      {message && (
        <div className="settings-success">
          {message}
        </div>
      )}

      <div className="settings-checkboxes">
        {([
          { key: 'project_updates' as const, label: 'Project update emails' },
          { key: 'collaboration_notifications' as const, label: 'Collaboration notifications' },
          { key: 'newsletter' as const, label: 'Newsletter' },
        ]).map(({ key, label }) => (
          <label key={key} className="settings-checkbox">
            <input
              type="checkbox"
              checked={prefs[key]}
              onChange={() => handleToggle(key)}
              className="settings-checkbox__input"
            />
            <span className="settings-checkbox__label">{label}</span>
          </label>
        ))}
      </div>

      <button
        className="btn btn--primary btn--sm"
        onClick={handleSave}
        disabled={loading}
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
    <div className="settings-card">
      <h2 className="settings-card__title">Download My Data</h2>
      <p className="settings-card__desc">
        Export all your data (profile, follows, messages, submissions) as a JSON file.
      </p>

      {message && (
        <div className="settings-success">
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
    <div className="settings-card">
      <h2 className="settings-card__title">Sign Out Everywhere</h2>
      <p className="settings-card__desc">
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
  const [step, setStep] = useState(0) // 0=hidden, 1=checkbox, 2=type DELETE, 3=final confirm
  const [checked, setChecked] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    if (confirmText !== 'DELETE' || !checked) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/user/profile', { method: 'DELETE', credentials: 'include' })
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

  const reset = () => { setStep(0); setChecked(false); setConfirmText('') }

  return (
    <div className="settings-card settings-card--danger">
      <h2 className="settings-card__title settings-card__title--danger">Delete Account</h2>
      <p className="settings-card__desc">
        Permanently delete your account and all associated data. This action cannot be undone.
      </p>

      {error && (
        <div className="form-error" style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', borderRadius: '8px', background: 'rgba(220,38,38,0.08)' }}>
          {error}
        </div>
      )}

      {step === 0 && (
        <button className="btn btn--sm settings-btn--danger" onClick={() => setStep(1)}>
          Delete My Account
        </button>
      )}

      {step === 1 && (
        <div style={{ marginTop: 'var(--space-3)' }}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-error, #ef4444)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
            Step 1 of 3: Are you sure you want to delete your account?
          </p>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>
            This will permanently remove your profile, projects, gallery, messages, and all associated data. This cannot be undone.
          </p>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', cursor: 'pointer', marginBottom: 'var(--space-4)' }}>
            <input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)} style={{ marginTop: 3 }} />
            <span style={{ fontSize: 'var(--text-sm)' }}>I understand that deleting my account is permanent and all my data will be lost forever.</span>
          </label>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button className="btn btn--sm settings-btn--danger" disabled={!checked} onClick={() => setStep(2)}>Continue</button>
            <button className="btn btn--outline btn--sm" onClick={reset}>Cancel</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={{ marginTop: 'var(--space-3)' }}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-error, #ef4444)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
            Step 2 of 3: Type DELETE to confirm
          </p>
          <input className="form-input" type="text" value={confirmText} onChange={e => setConfirmText(e.target.value)} placeholder="Type DELETE here" style={{ maxWidth: 300, marginBottom: 'var(--space-4)' }} />
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button className="btn btn--sm settings-btn--danger" disabled={confirmText !== 'DELETE'} onClick={() => setStep(3)}>Continue</button>
            <button className="btn btn--outline btn--sm" onClick={reset}>Cancel</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{ marginTop: 'var(--space-3)' }}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-error, #ef4444)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
            Step 3 of 3: Final confirmation
          </p>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
            This is your last chance. Click the button below to permanently delete your account. There is no way to recover your data after this.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button className="btn btn--sm settings-btn--danger" onClick={handleDelete} disabled={loading}>
              {loading ? 'Deleting...' : 'Yes, Permanently Delete My Account'}
            </button>
            <button className="btn btn--outline btn--sm" onClick={reset}>Cancel — Keep My Account</button>
          </div>
        </div>
      )}

    </div>
  )
}
