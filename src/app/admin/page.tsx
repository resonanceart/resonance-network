'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'

interface Submission {
  id: string
  created_at: string
  status: string
}

interface ProjectSubmission extends Submission {
  project_title: string
  artist_name: string
  artist_email: string
}

interface ProfileSubmission extends Submission {
  name: string
  email: string
  skills: string | null
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [projects, setProjects] = useState<ProjectSubmission[]>([])
  const [profiles, setProfiles] = useState<ProfileSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [actionMsg, setActionMsg] = useState('')

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError('')
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (data.success) {
        setIsAuthenticated(true)
        fetchData()
      } else {
        setAuthError(data.message || 'Invalid password.')
      }
    } catch {
      setAuthError('Network error.')
    } finally {
      setAuthLoading(false)
    }
  }

  async function fetchData() {
    setLoading(true)
    const [projRes, profRes] = await Promise.all([
      supabase.from('project_submissions').select('id, created_at, project_title, artist_name, artist_email, status').order('created_at', { ascending: false }),
      supabase.from('collaborator_profiles').select('id, created_at, name, email, skills, status').order('created_at', { ascending: false }),
    ])
    setProjects((projRes.data || []) as ProjectSubmission[])
    setProfiles((profRes.data || []) as ProfileSubmission[])
    setLoading(false)
  }

  // Only fetch data after authentication — not on mount

  async function handleAction(type: 'project' | 'profile', id: string, action: 'approve' | 'reject') {
    setActionMsg('')
    try {
      const res = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id, action, adminPassword: password }),
      })
      const data = await res.json()
      if (data.success) {
        setActionMsg(`${action === 'approve' ? 'Approved' : 'Rejected'} successfully.`)
        fetchData()
      } else {
        setActionMsg(data.message || 'Action failed.')
      }
    } catch {
      setActionMsg('Network error.')
    }
  }

  const statusColor = (s: string) => {
    if (s === 'approved') return 'var(--color-primary)'
    if (s === 'rejected') return '#c44'
    return 'var(--color-text-muted)'
  }

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ padding: 'var(--space-16) 0', maxWidth: '400px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-6)', textAlign: 'center' }}>Admin Access</h1>
        <form onSubmit={handleAuth}>
          {authError && <p className="form-error" style={{ marginBottom: 'var(--space-4)' }}>{authError}</p>}
          <div className="form-group">
            <label htmlFor="admin-password" className="form-label">Password</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="form-input"
              placeholder="Enter admin password"
              autoFocus
            />
          </div>
          <button type="submit" className="btn btn--primary btn--full" disabled={authLoading} style={{ marginTop: 'var(--space-4)' }}>
            {authLoading ? 'Checking...' : 'Sign In'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="container" style={{ padding: 'var(--space-12) 0' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-2)' }}>Admin Dashboard</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-8)', fontSize: 'var(--text-sm)' }}>
        Review and approve project submissions and collaborator profiles. In the future, approved items will auto-publish to the site.
      </p>

      {actionMsg && <p style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-6)', fontSize: 'var(--text-sm)' }}>{actionMsg}</p>}

      {loading ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
      ) : (
        <>
          {/* Project Submissions */}
          <section style={{ marginBottom: 'var(--space-12)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>
              Project Submissions ({projects.length})
            </h2>
            {projects.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)' }}>No submissions yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {projects.map(p => (
                  <div key={p.id} className="admin-item">
                    <div className="admin-item__info">
                      <strong>{p.project_title}</strong>
                      <span>by {p.artist_name} ({p.artist_email})</span>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                        {new Date(p.created_at).toLocaleDateString()} · <span style={{ color: statusColor(p.status) }}>{p.status}</span>
                      </span>
                    </div>
                    <div className="admin-item__actions">
                      <a href={`/preview/project/${p.id}`} target="_blank" className="btn btn--outline btn--sm">Preview</a>
                      {p.status === 'new' && (
                        <>
                          <button className="btn btn--primary btn--sm" onClick={() => handleAction('project', p.id, 'approve')}>Approve</button>
                          <button className="btn btn--ghost btn--sm" onClick={() => handleAction('project', p.id, 'reject')}>Reject</button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Collaborator Profiles */}
          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>
              Collaborator Profiles ({profiles.length})
            </h2>
            {profiles.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)' }}>No profiles yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {profiles.map(p => (
                  <div key={p.id} className="admin-item">
                    <div className="admin-item__info">
                      <strong>{p.name}</strong>
                      <span>{p.email}</span>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                        {new Date(p.created_at).toLocaleDateString()} · <span style={{ color: statusColor(p.status) }}>{p.status}</span>
                      </span>
                    </div>
                    <div className="admin-item__actions">
                      <a href={`/preview/profile/${p.id}`} target="_blank" className="btn btn--outline btn--sm">Preview</a>
                      {p.status === 'new' && (
                        <>
                          <button className="btn btn--primary btn--sm" onClick={() => handleAction('profile', p.id, 'approve')}>Approve</button>
                          <button className="btn btn--ghost btn--sm" onClick={() => handleAction('profile', p.id, 'reject')}>Reject</button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
