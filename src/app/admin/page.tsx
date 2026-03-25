'use client'
import { useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase-client'

type Tab = 'projects' | 'profiles' | 'users' | 'interests'

interface ProjectSubmission {
  id: string
  created_at: string
  project_title: string
  artist_name: string
  artist_email: string
  status: string
}

interface ProfileSubmission {
  id: string
  created_at: string
  name: string
  email: string
  skills: string | null
  status: string
}

interface UserAccount {
  id: string
  created_at: string
  display_name: string
  email: string
  role: string
  onboarding_complete: boolean
  avatar_url: string | null
}

interface InterestEntry {
  id: string
  created_at: string
  name: string
  email: string
  task_title: string | null
  project_title: string | null
  experience: string | null
  status: string
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  const [projects, setProjects] = useState<ProjectSubmission[]>([])
  const [profiles, setProfiles] = useState<ProfileSubmission[]>([])
  const [users, setUsers] = useState<UserAccount[]>([])
  const [interests, setInterests] = useState<InterestEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [actionMsg, setActionMsg] = useState('')

  const [activeTab, setActiveTab] = useState<Tab>('projects')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

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
    const [projRes, profRes, intRes] = await Promise.all([
      supabase.from('project_submissions').select('id, created_at, project_title, artist_name, artist_email, status').order('created_at', { ascending: false }),
      supabase.from('collaborator_profiles').select('id, created_at, name, email, skills, status').order('created_at', { ascending: false }),
      supabase.from('collaboration_interest').select('id, created_at, name, email, task_title, project_title, experience, status').order('created_at', { ascending: false }),
    ])
    setProjects((projRes.data || []) as ProjectSubmission[])
    setProfiles((profRes.data || []) as ProfileSubmission[])
    setInterests((intRes.data || []) as InterestEntry[])

    // Fetch users via admin API
    try {
      const userRes = await fetch('/api/admin/users', {
        headers: { 'x-admin-password': password },
      })
      const userData = await userRes.json()
      if (userData.success) {
        setUsers(userData.users || [])
      }
    } catch {
      // continue without users
    }

    setLoading(false)
  }

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

  async function handleRoleChange(userId: string, newRole: string) {
    setActionMsg('')
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newRole, adminPassword: password }),
      })
      const data = await res.json()
      if (data.success) {
        setActionMsg(`Role updated to ${newRole}.`)
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
      } else {
        setActionMsg(data.message || 'Failed to update role.')
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

  // Filtering
  const q = search.toLowerCase()

  const filteredProjects = useMemo(() => projects.filter(p => {
    const matchSearch = !q || p.project_title.toLowerCase().includes(q) || p.artist_name.toLowerCase().includes(q) || p.artist_email.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    return matchSearch && matchStatus
  }), [projects, q, statusFilter])

  const filteredProfiles = useMemo(() => profiles.filter(p => {
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    return matchSearch && matchStatus
  }), [profiles, q, statusFilter])

  const filteredUsers = useMemo(() => users.filter(u => {
    const matchSearch = !q || u.display_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    return matchSearch
  }), [users, q])

  const filteredInterests = useMemo(() => interests.filter(i => {
    const matchSearch = !q || i.name.toLowerCase().includes(q) || i.email.toLowerCase().includes(q) || (i.project_title || '').toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || i.status === statusFilter
    return matchSearch && matchStatus
  }), [interests, q, statusFilter])

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

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'projects', label: 'Projects', count: projects.length },
    { key: 'profiles', label: 'Profiles', count: profiles.length },
    { key: 'users', label: 'Users', count: users.length },
    { key: 'interests', label: 'Interests', count: interests.length },
  ]

  return (
    <div className="container" style={{ padding: 'var(--space-12) 0' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-2)' }}>Admin Dashboard</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)', fontSize: 'var(--text-sm)' }}>
        Manage submissions, users, and collaboration interests.
      </p>

      {actionMsg && (
        <p style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-6)', fontSize: 'var(--text-sm)' }}>
          {actionMsg}
        </p>
      )}

      {loading ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
      ) : (
        <>
          {/* Quick Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
            {[
              { label: 'Projects', value: projects.length, color: 'var(--color-primary)' },
              { label: 'Profiles', value: profiles.length, color: '#6366f1' },
              { label: 'Users', value: users.length, color: '#f59e0b' },
              { label: 'Interests', value: interests.length, color: '#ec4899' },
            ].map(stat => (
              <div key={stat.label} style={{
                padding: 'var(--space-4)',
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 'var(--space-1)', marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', overflowX: 'auto' }}>
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: 'var(--space-2) var(--space-4)',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab.key ? '2px solid var(--color-primary)' : '2px solid transparent',
                  color: activeTab === tab.key ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  fontWeight: activeTab === tab.key ? 600 : 400,
                  cursor: 'pointer',
                  fontSize: 'var(--text-sm)',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Search & Filter */}
          <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: '1 1 200px', maxWidth: '320px' }}
            />
            {activeTab !== 'users' && (
              <select
                className="form-input"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={{ width: 'auto', minWidth: '120px' }}
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            )}
          </div>

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <section>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>
                Project Submissions ({filteredProjects.length})
              </h2>
              {filteredProjects.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)' }}>No matching submissions.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {filteredProjects.map(p => (
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
          )}

          {/* Profiles Tab */}
          {activeTab === 'profiles' && (
            <section>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>
                Collaborator Profiles ({filteredProfiles.length})
              </h2>
              {filteredProfiles.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)' }}>No matching profiles.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {filteredProfiles.map(p => (
                    <div key={p.id} className="admin-item">
                      <div className="admin-item__info">
                        <strong>{p.name}</strong>
                        <span>{p.email}</span>
                        {p.skills && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Skills: {p.skills}</span>}
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
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <section>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>
                User Accounts ({filteredUsers.length})
              </h2>
              {filteredUsers.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)' }}>No matching users.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {filteredUsers.map(u => (
                    <div key={u.id} className="admin-item">
                      <div className="admin-item__info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                              {u.display_name?.[0]?.toUpperCase() || '?'}
                            </div>
                          )}
                          <strong>{u.display_name}</strong>
                        </div>
                        <span>{u.email}</span>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                          Joined {new Date(u.created_at).toLocaleDateString()} · Onboarding: {u.onboarding_complete ? 'Complete' : 'Pending'}
                        </span>
                      </div>
                      <div className="admin-item__actions">
                        <select
                          value={u.role}
                          onChange={e => handleRoleChange(u.id, e.target.value)}
                          className="form-input"
                          style={{ width: 'auto', minWidth: '120px', padding: 'var(--space-1) var(--space-2)', fontSize: 'var(--text-sm)' }}
                        >
                          <option value="collaborator">Collaborator</option>
                          <option value="creator">Creator</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Interests Tab */}
          {activeTab === 'interests' && (
            <section>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>
                Collaboration Interests ({filteredInterests.length})
              </h2>
              {filteredInterests.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)' }}>No matching interests.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {filteredInterests.map(i => (
                    <div key={i.id} className="admin-item">
                      <div className="admin-item__info">
                        <strong>{i.name}</strong>
                        <span>{i.email}</span>
                        {i.task_title && <span style={{ fontSize: 'var(--text-sm)' }}>Task: {i.task_title}</span>}
                        {i.project_title && <span style={{ fontSize: 'var(--text-sm)' }}>Project: {i.project_title}</span>}
                        {i.experience && (
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                            {i.experience}
                          </span>
                        )}
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                          {new Date(i.created_at).toLocaleDateString()} · <span style={{ color: statusColor(i.status) }}>{i.status}</span>
                        </span>
                      </div>
                      <div className="admin-item__actions">
                        <a href={`mailto:${i.email}`} className="btn btn--outline btn--sm">Email</a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  )
}
