'use client'
import { useState, useMemo, useEffect } from 'react'
import { supabase } from '@/lib/supabase-client'
import { useAuth } from '@/components/AuthProvider'

type Tab = 'review' | 'projects' | 'profiles' | 'user_profiles' | 'users' | 'interests' | 'messages' | 'activity'

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

interface UserProfileEntry {
  id: string
  created_at: string
  display_name: string
  email: string
  bio: string | null
  avatar_url: string | null
  skills: string[] | null
  profile_visibility: string
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
  const { user } = useAuth()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [checkingRole, setCheckingRole] = useState(true)

  // Auto-authenticate if user has admin role
  useEffect(() => {
    if (!user) { setCheckingRole(false); return }
    fetch('/api/user/profile', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.profile?.role === 'admin') {
          setPassword(process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'auto')
          setIsAuthenticated(true)
          fetchData()
        }
      })
      .catch(() => {})
      .finally(() => setCheckingRole(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const [projects, setProjects] = useState<ProjectSubmission[]>([])
  const [profiles, setProfiles] = useState<ProfileSubmission[]>([])
  const [users, setUsers] = useState<UserAccount[]>([])
  const [interests, setInterests] = useState<InterestEntry[]>([])
  const [userProfiles, setUserProfiles] = useState<UserProfileEntry[]>([])
  const [messages, setMessages] = useState<Array<{ id: string; created_at: string; from_name: string; from_email: string; subject_type: string; message: string; is_read: boolean }>>([])
  const [loading, setLoading] = useState(true)
  const [actionMsg, setActionMsg] = useState('')
  const [expandedMsg, setExpandedMsg] = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState<Tab>('review')
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
    const [projRes, profRes, intRes, upRes] = await Promise.all([
      supabase.from('project_submissions').select('id, created_at, project_title, artist_name, artist_email, status').order('created_at', { ascending: false }),
      supabase.from('collaborator_profiles').select('id, created_at, name, email, skills, status').order('created_at', { ascending: false }),
      supabase.from('collaboration_interest').select('id, created_at, name, email, task_title, project_title, experience, status').order('created_at', { ascending: false }),
      supabase.from('user_profiles').select('id, created_at, display_name, email, bio, avatar_url, skills, profile_visibility').order('created_at', { ascending: false }),
    ])
    setProjects((projRes.data || []) as ProjectSubmission[])
    setProfiles((profRes.data || []) as ProfileSubmission[])
    setInterests((intRes.data || []) as InterestEntry[])
    setUserProfiles((upRes.data || []) as UserProfileEntry[])

    // Fetch messages
    const msgRes = await supabase.from('profile_messages').select('*').order('created_at', { ascending: false }).limit(100)
    setMessages((msgRes.data || []) as any[])

    // Fetch users via admin API (requires admin password)
    try {
      const userRes = await fetch('/api/admin/users', {
        headers: { 'x-admin-password': password || '' },
        credentials: 'include',
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

  async function handleUserProfileAction(id: string, action: 'approve' | 'reject') {
    setActionMsg('')
    try {
      const res = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'user_profile', id, action, adminPassword: password || 'auto' }),
      })
      const data = await res.json()
      if (data.success) {
        setActionMsg(`Profile ${action === 'approve' ? 'approved' : 'rejected'} successfully.`)
        fetchData()
      } else {
        setActionMsg(data.message || 'Action failed.')
      }
    } catch {
      setActionMsg('Network error.')
    }
  }

  async function handleAction(type: 'project' | 'profile', id: string, action: 'approve' | 'reject') {
    setActionMsg('')
    try {
      const res = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id, action, adminPassword: password || 'auto' }),
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

  const filteredUserProfiles = useMemo(() => userProfiles.filter(up => {
    const matchSearch = !q || up.display_name.toLowerCase().includes(q) || up.email.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || up.profile_visibility === statusFilter
    return matchSearch && matchStatus
  }), [userProfiles, q, statusFilter])

  const filteredInterests = useMemo(() => interests.filter(i => {
    const matchSearch = !q || i.name.toLowerCase().includes(q) || i.email.toLowerCase().includes(q) || (i.project_title || '').toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || i.status === statusFilter
    return matchSearch && matchStatus
  }), [interests, q, statusFilter])

  const pendingItems = useMemo(() => {
    const items: Array<{
      id: string
      type: 'profile' | 'project'
      name: string
      email: string
      date: string
      status: string
      avatar?: string | null
    }> = []

    userProfiles.filter(up => up.profile_visibility === 'pending').forEach(up => {
      items.push({
        id: up.id,
        type: 'profile',
        name: up.display_name,
        email: up.email,
        date: up.created_at,
        status: 'pending',
        avatar: up.avatar_url,
      })
    })

    projects.filter(p => p.status === 'new' || p.status === 'draft').forEach(p => {
      items.push({
        id: p.id,
        type: 'project',
        name: p.project_title,
        email: p.artist_email,
        date: p.created_at,
        status: p.status,
      })
    })

    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [userProfiles, projects])

  const activityFeed = useMemo(() => {
    const feed: Array<{ id: string; type: string; text: string; date: string }> = []

    userProfiles.forEach(up => {
      feed.push({ id: `up-${up.id}`, type: 'user', text: `${up.display_name} signed up`, date: up.created_at })
      if (up.profile_visibility === 'pending') {
        feed.push({ id: `up-pending-${up.id}`, type: 'profile', text: `${up.display_name} submitted profile for review`, date: up.created_at })
      }
    })

    projects.forEach(p => {
      feed.push({ id: `proj-${p.id}`, type: 'project', text: `${p.artist_name} submitted "${p.project_title}"`, date: p.created_at })
    })

    interests.forEach(i => {
      feed.push({ id: `int-${i.id}`, type: 'interest', text: `${i.name} expressed interest in ${i.project_title || 'a role'}`, date: i.created_at })
    })

    return feed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 50)
  }, [userProfiles, projects, interests])

  const pendingProfiles = userProfiles.filter(up => up.profile_visibility === 'pending').length
  const pendingProjects = projects.filter(p => p.status === 'new' || p.status === 'draft').length
  const publishedProfiles = userProfiles.filter(up => up.profile_visibility === 'published').length
  const approvedProjects = projects.filter(p => p.status === 'approved').length

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
    { key: 'review', label: '\u26A1 Review Queue', count: pendingItems.length },
    { key: 'projects', label: 'Projects', count: projects.length },
    { key: 'profiles', label: 'Profiles', count: profiles.length },
    { key: 'user_profiles', label: 'User Profiles', count: userProfiles.length },
    { key: 'users', label: 'Users', count: users.length },
    { key: 'interests', label: 'Interests', count: interests.length },
    { key: 'messages', label: 'Messages', count: messages.length },
    { key: 'activity', label: 'Activity', count: activityFeed.length },
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
              { label: 'Pending Review', value: pendingProfiles + pendingProjects, color: '#f59e0b' },
              { label: 'Published Profiles', value: publishedProfiles, color: 'var(--color-primary)' },
              { label: 'Approved Projects', value: approvedProjects, color: '#22c55e' },
              { label: 'Projects', value: projects.length, color: 'var(--color-primary)' },
              { label: 'Profiles', value: profiles.length, color: '#6366f1' },
              { label: 'User Profiles', value: userProfiles.length, color: '#8b5cf6' },
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
            {activeTab !== 'users' && activeTab !== 'review' && activeTab !== 'messages' && activeTab !== 'activity' && (
              <select
                className="form-input"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={{ width: 'auto', minWidth: '120px' }}
              >
                <option value="all">All Status</option>
                {activeTab === 'user_profiles' ? (
                  <>
                    <option value="draft">Draft</option>
                    <option value="pending">Pending</option>
                    <option value="published">Published</option>
                  </>
                ) : (
                  <>
                    <option value="new">New</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </>
                )}
              </select>
            )}
          </div>

          {/* Review Queue Tab */}
          {activeTab === 'review' && (
            <section>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>
                Review Queue ({pendingItems.length})
              </h2>
              {pendingItems.length === 0 ? (
                <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  <p style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>All caught up!</p>
                  <p>No pending items to review.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {pendingItems.map(item => (
                    <div key={`${item.type}-${item.id}`} className="admin-item">
                      <div className="admin-item__info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: 999,
                            fontSize: 'var(--text-xs)',
                            fontWeight: 600,
                            background: item.type === 'profile' ? 'rgba(99,102,241,0.15)' : 'rgba(20,184,166,0.15)',
                            color: item.type === 'profile' ? '#6366f1' : 'var(--color-primary)',
                          }}>
                            {item.type === 'profile' ? 'Profile' : 'Project'}
                          </span>
                          {item.avatar && (
                            <img src={item.avatar} alt="" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
                          )}
                          <strong>{item.name}</strong>
                        </div>
                        <span style={{ fontSize: 'var(--text-sm)' }}>{item.email}</span>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                          {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="admin-item__actions">
                        {item.type === 'profile' ? (
                          <>
                            <a href={`/profiles/${item.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}?preview=1`} target="_blank" className="btn btn--outline btn--sm">Preview</a>
                            <button className="btn btn--primary btn--sm" onClick={() => handleUserProfileAction(item.id, 'approve')}>Publish</button>
                            <button className="btn btn--ghost btn--sm" onClick={() => handleUserProfileAction(item.id, 'reject')}>Reject</button>
                          </>
                        ) : (
                          <>
                            <a href={`/dashboard/projects/preview?id=${item.id}`} target="_blank" className="btn btn--outline btn--sm">Preview</a>
                            <button className="btn btn--primary btn--sm" onClick={() => handleAction('project', item.id, 'approve')}>Approve</button>
                            <button className="btn btn--ghost btn--sm" onClick={() => handleAction('project', item.id, 'reject')}>Reject</button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

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
                        {(p.status === 'new' || p.status === 'draft') && (
                          <>
                            <button className="btn btn--primary btn--sm" onClick={() => handleAction('project', p.id, 'approve')}>Approve</button>
                            <button className="btn btn--ghost btn--sm" onClick={() => handleAction('project', p.id, 'reject')}>Reject</button>
                          </>
                        )}
                        {p.status === 'approved' && (
                          <button className="btn btn--ghost btn--sm" onClick={() => handleAction('project', p.id, 'reject')}>Unpublish</button>
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

          {/* User Profiles Tab */}
          {activeTab === 'user_profiles' && (
            <section>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>
                User Profiles ({filteredUserProfiles.length})
              </h2>
              {filteredUserProfiles.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)' }}>No matching user profiles.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {filteredUserProfiles.map(up => (
                    <div key={up.id} className="admin-item">
                      <div className="admin-item__info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          {up.avatar_url ? (
                            <img src={up.avatar_url} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                              {up.display_name?.[0]?.toUpperCase() || '?'}
                            </div>
                          )}
                          <strong>{up.display_name}</strong>
                        </div>
                        <span>{up.email}</span>
                        {up.bio && (
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                            {up.bio}
                          </span>
                        )}
                        {up.skills && up.skills.length > 0 && (
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Skills: {up.skills.join(', ')}</span>
                        )}
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                          {new Date(up.created_at).toLocaleDateString()} · <span style={{ color: up.profile_visibility === 'published' ? 'var(--color-primary)' : up.profile_visibility === 'pending' ? '#d97706' : 'var(--color-text-muted)' }}>{up.profile_visibility}</span>
                        </span>
                      </div>
                      <div className="admin-item__actions">
                        <a
                          href={up.profile_visibility === 'published'
                            ? `/profiles/${up.display_name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`
                            : `/profiles/${up.display_name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}?preview=1`}
                          target="_blank"
                          className="btn btn--outline btn--sm"
                        >
                          View
                        </a>
                        {up.profile_visibility === 'pending' && (
                          <>
                            <button className="btn btn--primary btn--sm" onClick={() => handleUserProfileAction(up.id, 'approve')}>Publish</button>
                            <button className="btn btn--ghost btn--sm" onClick={() => handleUserProfileAction(up.id, 'reject')}>Reject</button>
                          </>
                        )}
                        {up.profile_visibility === 'published' && (
                          <button className="btn btn--ghost btn--sm" onClick={() => handleUserProfileAction(up.id, 'reject')}>Unpublish</button>
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

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <section>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>
                Messages ({messages.length})
              </h2>
              {messages.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)' }}>No messages yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {messages.map(m => (
                    <div key={m.id} style={{
                      padding: 'var(--space-3) var(--space-4)',
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      borderLeft: m.is_read ? undefined : '3px solid var(--color-primary)',
                      cursor: 'pointer',
                    }} onClick={() => setExpandedMsg(expandedMsg === m.id ? null : m.id)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <strong style={{ fontSize: 'var(--text-sm)' }}>{m.from_name}</strong>
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginLeft: 'var(--space-2)' }}>{m.from_email}</span>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>
                            {m.subject_type} · {new Date(m.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <a href={`mailto:${m.from_email}?subject=Re: ${m.subject_type}`} className="btn btn--outline btn--sm" onClick={e => e.stopPropagation()}>Reply</a>
                      </div>
                      {expandedMsg === m.id && (
                        <div style={{ marginTop: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-border)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                          {m.message}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <section>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>
                Activity Feed ({activityFeed.length})
              </h2>
              {activityFeed.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)' }}>No activity yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {activityFeed.map(item => {
                    const icon = item.type === 'user' ? '\uD83D\uDC64' : item.type === 'profile' ? '\uD83D\uDCCB' : item.type === 'project' ? '\uD83C\uDFA8' : '\u2B50'
                    const now = new Date()
                    const then = new Date(item.date)
                    const diffMs = now.getTime() - then.getTime()
                    const diffMin = Math.floor(diffMs / 60000)
                    const diffHr = Math.floor(diffMin / 60)
                    const diffDay = Math.floor(diffHr / 24)
                    const relativeDate = diffMin < 1 ? 'just now' : diffMin < 60 ? `${diffMin}m ago` : diffHr < 24 ? `${diffHr}h ago` : diffDay < 30 ? `${diffDay}d ago` : then.toLocaleDateString()

                    return (
                      <div key={item.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-3)',
                        padding: 'var(--space-3) var(--space-4)',
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                      }}>
                        <span style={{ fontSize: 'var(--text-lg)' }}>{icon}</span>
                        <span style={{ flex: 1, fontSize: 'var(--text-sm)' }}>{item.text}</span>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{relativeDate}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  )
}
