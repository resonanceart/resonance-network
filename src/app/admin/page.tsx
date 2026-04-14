'use client'
import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import { useAuth } from '@/components/AuthProvider'
import { adminClaimCopy } from '@/lib/claim-copy'
import '@/styles/admin.css'

type AdminView = 'overview' | 'review' | 'users' | 'projects' | 'profiles' | 'user_profiles' | 'messages' | 'interests' | 'activity'

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
  is_claimable?: boolean | null
  target_email?: string | null
  original_source_url?: string | null
  updated_at?: string | null
  role?: string | null
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
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [checkingRole, setCheckingRole] = useState(true)

  // "Build Profile for Artist" modal state
  const [showClaimableModal, setShowClaimableModal] = useState(false)
  const [claimableEmail, setClaimableEmail] = useState('')
  const [claimableDisplayName, setClaimableDisplayName] = useState('')
  const [claimableImportUrl, setClaimableImportUrl] = useState('')
  const [claimableSubmitting, setClaimableSubmitting] = useState(false)
  const [claimableError, setClaimableError] = useState<string | null>(null)

  function resetClaimableForm() {
    setClaimableEmail('')
    setClaimableDisplayName('')
    setClaimableImportUrl('')
    setClaimableError(null)
    setClaimableSubmitting(false)
  }

  async function handleCreateClaimableProfile(e: React.FormEvent) {
    e.preventDefault()
    setClaimableError(null)

    const email = claimableEmail.trim()
    const displayName = claimableDisplayName.trim()
    const importUrl = claimableImportUrl.trim()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setClaimableError('Please enter a valid email address.')
      return
    }
    if (!displayName) {
      setClaimableError('Display name is required.')
      return
    }

    setClaimableSubmitting(true)
    try {
      const res = await fetch('/api/admin/create-claimable-profile', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password || '',
        },
        body: JSON.stringify({
          email,
          display_name: displayName,
          import_url: importUrl || undefined,
          adminPassword: password || 'auto',
        }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok || !data?.success) {
        if (data?.error === 'email_exists') {
          setClaimableError(
            'This email already has an account on Resonance Network. Ask them to log in instead.'
          )
        } else if (data?.error === 'already_claimable') {
          setClaimableError(
            'There\u2019s already a pending claimable profile for this email. Open it from the Profiles list.'
          )
        } else {
          setClaimableError(data?.message || 'Server error \u2014 try again.')
        }
        setClaimableSubmitting(false)
        return
      }

      const newUserId: string | undefined = data.user_id || data.profile_id
      if (!newUserId) {
        setClaimableError('Profile created but no id returned. Refresh and open it manually.')
        setClaimableSubmitting(false)
        return
      }

      // Land the admin straight in the profile editor, editing AS the new user.
      setShowClaimableModal(false)
      resetClaimableForm()
      router.push(`/dashboard/profile/live-edit?admin_edit_as=${encodeURIComponent(newUserId)}`)
    } catch {
      setClaimableError('Network error \u2014 try again.')
      setClaimableSubmitting(false)
    }
  }

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
  const [messages, setMessages] = useState<Array<{id:string; created_at:string; from_name:string; from_email:string; subject_type:string; message:string; is_read:boolean; to_profile_id:string}>>([])
  const [loading, setLoading] = useState(true)
  const [actionMsg, setActionMsg] = useState('')
  const [expandedMsg, setExpandedMsg] = useState<string | null>(null)

  const [activeView, setActiveView] = useState<AdminView>('overview')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
      supabase.from('user_profiles').select('id, created_at, display_name, email, bio, avatar_url, skills, profile_visibility, is_claimable, target_email, original_source_url, updated_at').order('created_at', { ascending: false }),
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

  async function handleAction(type: 'project' | 'profile', id: string, action: 'approve' | 'reject' | 'unpublish') {
    setActionMsg('')
    try {
      const res = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id, action, adminPassword: password || 'auto' }),
      })
      const data = await res.json()
      if (data.success) {
        const label = action === 'approve' ? 'Approved' : action === 'unpublish' ? 'Unpublished' : 'Rejected'
        setActionMsg(`${label} successfully.`)
        fetchData()
      } else {
        setActionMsg(data.message || 'Action failed.')
      }
    } catch {
      setActionMsg('Network error.')
    }
  }

  async function handleDeleteUser(userId: string, displayName: string) {
    if (!confirm(`Are you sure you want to delete ${displayName}? This cannot be undone.`)) return
    setActionMsg('')
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': 'resonance' },
        body: JSON.stringify({ userId, adminPassword: password }),
      })
      const data = await res.json()
      if (data.success) {
        setActionMsg(`User "${displayName}" deleted successfully.`)
        setUsers(prev => prev.filter(u => u.id !== userId))
        setUserProfiles(prev => prev.filter(up => up.id !== userId))
      } else {
        setActionMsg(data.message || 'Failed to delete user.')
      }
    } catch {
      setActionMsg('Network error.')
    }
  }

  async function handleDeleteProject(projectId: string, projectTitle: string) {
    if (!confirm(`Are you sure you want to delete "${projectTitle}"? This will permanently delete this project and all its data.`)) return
    setActionMsg('')
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': 'resonance' },
        body: JSON.stringify({ projectId, adminPassword: password }),
      })
      const data = await res.json()
      if (data.success) {
        setActionMsg(`Project "${projectTitle}" deleted successfully.`)
        setProjects(prev => prev.filter(p => p.id !== projectId))
      } else {
        setActionMsg(data.message || 'Failed to delete project.')
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
    const matchSearch = !q
      || up.display_name.toLowerCase().includes(q)
      || (up.email || '').toLowerCase().includes(q)
      || (up.target_email || '').toLowerCase().includes(q)
    // "claimable" is a virtual status — it filters on is_claimable instead of
    // profile_visibility so placeholder profiles surface even when they also
    // carry a draft visibility.
    const matchStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'claimable'
          ? up.is_claimable === true
          : up.profile_visibility === statusFilter
    return matchSearch && matchStatus
  }), [userProfiles, q, statusFilter])

  const filteredInterests = useMemo(() => interests.filter(i => {
    const matchSearch = !q || i.name.toLowerCase().includes(q) || i.email.toLowerCase().includes(q) || (i.project_title || '').toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || i.status === statusFilter
    return matchSearch && matchStatus
  }), [interests, q, statusFilter])

  // Computed values
  const pendingProfiles = userProfiles.filter(up => up.profile_visibility === 'pending')
  const pendingProjects = projects.filter(p => p.status === 'new' || p.status === 'draft')
  const pendingCount = pendingProfiles.length + pendingProjects.length
  const publishedProfiles = userProfiles.filter(up => up.profile_visibility === 'published')
  const approvedProjects = projects.filter(p => p.status === 'approved')
  const recentUsers = userProfiles.filter(up => {
    const week = 7 * 24 * 60 * 60 * 1000
    return Date.now() - new Date(up.created_at).getTime() < week
  })

  // Combined review queue
  const reviewQueue = useMemo(() => {
    const items: Array<{id:string; type:'profile'|'project'; name:string; email:string; date:string; status:string; avatar?:string|null}> = []
    pendingProfiles.forEach(up => items.push({ id: up.id, type: 'profile', name: up.display_name, email: up.email, date: up.created_at, status: 'pending', avatar: up.avatar_url }))
    pendingProjects.forEach(p => items.push({ id: p.id, type: 'project', name: p.project_title, email: p.artist_email, date: p.created_at, status: p.status }))
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [pendingProfiles, pendingProjects])

  // Activity feed
  const activityFeed = useMemo(() => {
    const feed: Array<{id:string; type:string; text:string; date:string}> = []
    userProfiles.forEach(up => feed.push({ id: `signup-${up.id}`, type: 'user', text: `${up.display_name} joined`, date: up.created_at }))
    projects.forEach(p => feed.push({ id: `proj-${p.id}`, type: 'project', text: `${p.artist_name} submitted "${p.project_title}"`, date: p.created_at }))
    interests.forEach(i => feed.push({ id: `int-${i.id}`, type: 'interest', text: `${i.name} interested in ${i.project_title || 'a role'}`, date: i.created_at }))
    return feed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 100)
  }, [userProfiles, projects, interests])

  function timeAgo(dateStr: string) {
    const ms = Date.now() - new Date(dateStr).getTime()
    if (ms < 0) return 'just now'
    const secs = Math.floor(ms / 1000)
    if (secs < 60) return `${secs}s ago`
    const mins = Math.floor(secs / 60)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    if (days < 30) return `${days}d ago`
    return new Date(dateStr).toLocaleDateString()
  }

  // Auth screen
  if (!isAuthenticated) {
    if (checkingRole) return <div className="admin-auth"><p style={{color:'var(--color-text-muted)'}}>Checking access...</p></div>
    return (
      <div className="admin-auth">
        <div className="admin-auth__card">
          <h1 className="admin-auth__title">Resonance Admin</h1>
          <p className="admin-auth__subtitle">Enter admin password to continue</p>
          <form onSubmit={handleAuth}>
            {authError && <p className="admin-auth__error">{authError}</p>}
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="admin-auth__input" placeholder="Admin password" autoFocus />
            <button type="submit" className="admin-auth__btn" disabled={authLoading}>{authLoading ? 'Checking...' : 'Sign In'}</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar${sidebarOpen ? ' admin-sidebar--open' : ''}`}>
        <div className="admin-sidebar__brand"><span>Resonance</span> Admin</div>
        <nav className="admin-sidebar__nav">
          {[
            { key: 'overview', label: 'Overview', icon: '\uD83D\uDCCA' },
            { key: 'review', label: 'Review Queue', icon: '\u26A1', badge: pendingCount },
            { key: 'user_profiles', label: 'Profiles', icon: '\uD83D\uDC64' },
            { key: 'projects', label: 'Projects', icon: '\uD83D\uDCC1' },
            { key: 'users', label: 'Users', icon: '\uD83D\uDC65' },
            { key: 'messages', label: 'Messages', icon: '\uD83D\uDCAC', badge: messages.filter(m => !m.is_read).length },
            { key: 'interests', label: 'Interests', icon: '\uD83E\uDD1D' },
            { key: 'activity', label: 'Activity', icon: '\uD83D\uDCE1' },
          ].map(item => (
            <button key={item.key} onClick={() => { setActiveView(item.key as AdminView); setSidebarOpen(false) }}
              className={`admin-sidebar__link${activeView === item.key ? ' admin-sidebar__link--active' : ''}`}>
              <span>{item.icon}</span>
              {item.label}
              {item.badge ? <span className="admin-sidebar__badge">{item.badge}</span> : null}
            </button>
          ))}
          <a href="/admin/badges" className="admin-sidebar__link" style={{ marginTop: 'var(--space-4)', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 'var(--space-4)' }}>
            <span>🏅</span>
            Badges
          </a>
        </nav>
        <div className="admin-sidebar__user">
          <div className="admin-sidebar__user-avatar">A</div>
          <div>
            <div className="admin-sidebar__user-name">Admin</div>
            <div className="admin-sidebar__user-role">Administrator</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main">
        <div className="admin-topbar">
          <button className="admin-topbar__icon-btn" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ display: 'none' }}>{'\u2630'}</button>
          <span className="admin-topbar__title">{activeView === 'overview' ? 'Dashboard' : activeView.charAt(0).toUpperCase() + activeView.slice(1).replace('_', ' ')}</span>
          <input type="text" className="admin-topbar__search" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          <div className="admin-topbar__actions">
            <a href="/" target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn--outline admin-btn--sm">View Site</a>
            <button className="admin-topbar__icon-btn" title="Notifications">
              {'\uD83D\uDD14'}
              {pendingCount > 0 && <span className="admin-topbar__notification-dot" />}
            </button>
          </div>
        </div>

        <div className="admin-content">
          {loading ? <p style={{color:'var(--color-text-muted)'}}>Loading data...</p> : (
            <>
              {/* OVERVIEW */}
              {activeView === 'overview' && (
                <>
                  <div className="admin-content__header">
                    <h1 className="admin-content__title">Dashboard</h1>
                    <p className="admin-content__subtitle">Overview of your network</p>
                  </div>
                  <div className="admin-stats">
                    <div className="admin-stat-card">
                      <div className="admin-stat-card__value">{userProfiles.length}</div>
                      <div className="admin-stat-card__label">Total Users</div>
                      {recentUsers.length > 0 && <div className="admin-stat-card__change">+{recentUsers.length} this week</div>}
                    </div>
                    <div className="admin-stat-card">
                      <div className="admin-stat-card__value">{publishedProfiles.length}</div>
                      <div className="admin-stat-card__label">Published Profiles</div>
                    </div>
                    <div className="admin-stat-card">
                      <div className="admin-stat-card__value">{approvedProjects.length}</div>
                      <div className="admin-stat-card__label">Active Projects</div>
                    </div>
                    <div className="admin-stat-card">
                      <div className="admin-stat-card__value" style={{color: pendingCount > 0 ? 'var(--color-warning, #f59e0b)' : 'var(--color-success, #22c55e)'}}>{pendingCount}</div>
                      <div className="admin-stat-card__label">Pending Review</div>
                    </div>
                    <div className="admin-stat-card">
                      <div className="admin-stat-card__value">{interests.length}</div>
                      <div className="admin-stat-card__label">Collaboration Interests</div>
                    </div>
                    <div className="admin-stat-card">
                      <div className="admin-stat-card__value">{messages.length}</div>
                      <div className="admin-stat-card__label">Messages</div>
                    </div>
                  </div>

                  {/* Quick actions */}
                  <div className="admin-quick-actions">
                    {pendingCount > 0 && <button className="admin-btn admin-btn--primary" onClick={() => setActiveView('review')}>Review {pendingCount} Pending Items</button>}
                    <a href="/dashboard/profile/live-edit" target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn--outline">Profile Builder</a>
                    <a href="/dashboard/projects/live-edit" target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn--outline">Project Builder</a>
                  </div>

                  {/* Artist Profiles In Progress — claimable profiles the admin is building */}
                  {(() => {
                    const inProgress = userProfiles
                      .filter(up => up.is_claimable === true)
                      .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
                      .slice(0, 5)
                    return (
                      <div className="admin-section">
                        <div className="admin-section__title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                          <span>Artist Profiles In Progress</span>
                          <button
                            type="button"
                            className="admin-btn admin-btn--outline admin-btn--sm"
                            onClick={() => { resetClaimableForm(); setShowClaimableModal(true); setActiveView('user_profiles') }}
                          >
                            + Build Profile for Artist
                          </button>
                        </div>
                        {inProgress.length === 0 ? (
                          <div style={{ padding: '20px 4px', color: 'var(--color-text-muted)', fontSize: 14 }}>
                            No claimable profiles yet.{' '}
                            <button
                              type="button"
                              onClick={() => { resetClaimableForm(); setShowClaimableModal(true); setActiveView('user_profiles') }}
                              style={{ background: 'none', border: 'none', padding: 0, color: 'var(--color-primary, #14b8a6)', textDecoration: 'underline', cursor: 'pointer', font: 'inherit' }}
                            >
                              Click Build Profile for Artist
                            </button>{' '}
                            to create one.
                          </div>
                        ) : (
                          <div className="admin-feed">
                            {inProgress.map(up => (
                              <div
                                key={up.id}
                                className="admin-feed__item"
                                role="button"
                                tabIndex={0}
                                onClick={() => router.push(`/dashboard/profile/live-edit?admin_edit_as=${up.id}`)}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); router.push(`/dashboard/profile/live-edit?admin_edit_as=${up.id}`) } }}
                                style={{ cursor: 'pointer', alignItems: 'center', gap: 12 }}
                              >
                                {up.avatar_url ? (
                                  <img src={up.avatar_url} className="admin-avatar" alt="" />
                                ) : (
                                  <div className="admin-avatar admin-avatar-placeholder" aria-hidden="true">
                                    {(up.display_name || '?').charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {up.display_name || 'Untitled'}
                                  </div>
                                  {up.target_email && (
                                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {up.target_email}
                                    </div>
                                  )}
                                </div>
                                <span className="admin-feed__time" style={{ whiteSpace: 'nowrap' }}>
                                  Last edited {timeAgo(up.updated_at || up.created_at)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })()}

                  {/* Recent activity mini-feed */}
                  <div className="admin-section">
                    <div className="admin-section__title">Recent Activity</div>
                    <div className="admin-feed">
                      {activityFeed.slice(0, 10).map(a => (
                        <div key={a.id} className="admin-feed__item">
                          <div className={`admin-feed__icon admin-feed__icon--${a.type}`}>
                            {a.type === 'user' && '\uD83D\uDC64'}
                            {a.type === 'project' && '\uD83D\uDCC1'}
                            {a.type === 'interest' && '\uD83E\uDD1D'}
                          </div>
                          <span className="admin-feed__text" dangerouslySetInnerHTML={{__html: a.text.replace(/(^[^"]+)/, '<strong>$1</strong>')}} />
                          <span className="admin-feed__time">{timeAgo(a.date)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* REVIEW QUEUE */}
              {activeView === 'review' && (
                <>
                  <div className="admin-content__header">
                    <h1 className="admin-content__title">Review Queue</h1>
                    <p className="admin-content__subtitle">{reviewQueue.length} items need your attention</p>
                  </div>
                  {actionMsg && <p style={{padding:'8px 16px', background:'var(--color-surface, #111)', border:'1px solid var(--color-border, #222)', borderRadius:8, marginBottom:16, fontSize:13, color:'var(--color-primary, #14b8a6)'}}>{actionMsg}</p>}
                  {reviewQueue.length === 0 ? (
                    <div className="admin-empty">
                      <div className="admin-empty__icon">{'\u2705'}</div>
                      <div className="admin-empty__title">All caught up!</div>
                      <div className="admin-empty__subtitle">No pending items to review.</div>
                    </div>
                  ) : (
                    <table className="admin-table">
                      <thead><tr><th>Type</th><th>Name</th><th>Email</th><th>Date</th><th>Actions</th></tr></thead>
                      <tbody>
                        {reviewQueue.map(item => (
                          <tr key={`${item.type}-${item.id}`}>
                            <td><span className={`admin-badge admin-badge--${item.type}`}>{item.type}</span></td>
                            <td>
                              <div style={{display:'flex',alignItems:'center',gap:8}}>
                                {item.avatar && <img src={item.avatar} className="admin-avatar" alt="" />}
                                <span className="admin-table__name">{item.name}</span>
                              </div>
                            </td>
                            <td className="admin-table__email">{item.email}</td>
                            <td className="admin-table__date">{timeAgo(item.date)}</td>
                            <td>
                              <div style={{display:'flex',gap:6}}>
                                {item.type === 'profile' ? (
                                  <>
                                    <button className="admin-btn admin-btn--primary admin-btn--sm" onClick={() => handleUserProfileAction(item.id, 'approve')}>Publish</button>
                                    <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => handleUserProfileAction(item.id, 'reject')}>Reject</button>
                                  </>
                                ) : (
                                  <>
                                    <a href={`/preview/project/${item.id}`} target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn--outline admin-btn--sm">Preview</a>
                                    <button className="admin-btn admin-btn--primary admin-btn--sm" onClick={() => handleAction('project', item.id, 'approve')}>Approve</button>
                                    <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => handleAction('project', item.id, 'reject')}>Reject</button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </>
              )}

              {/* USER PROFILES */}
              {activeView === 'user_profiles' && (
                <>
                  <div className="admin-content__header">
                    <h1 className="admin-content__title">User Profiles</h1>
                    <p className="admin-content__subtitle">{userProfiles.length} profiles total</p>
                  </div>
                  <div className="admin-filters" style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
                    <select className="admin-filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                      <option value="all">All Status</option>
                      <option value="draft">Draft</option>
                      <option value="pending">Pending</option>
                      <option value="published">Published</option>
                      <option value="claimable">Claimable</option>
                    </select>
                    <button
                      type="button"
                      className="admin-btn admin-btn--primary"
                      onClick={() => { resetClaimableForm(); setShowClaimableModal(true) }}
                      style={{ marginLeft: 'auto' }}
                    >
                      + Build Profile for Artist
                    </button>
                  </div>
                  {actionMsg && <p style={{padding:'8px 16px', background:'var(--color-surface, #111)', border:'1px solid var(--color-border, #222)', borderRadius:8, marginBottom:16, fontSize:13, color:'var(--color-primary, #14b8a6)'}}>{actionMsg}</p>}
                  <table className="admin-table">
                    <thead><tr><th>User</th><th>Email</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
                    <tbody>
                      {filteredUserProfiles.map(up => {
                        const isClaimable = up.is_claimable === true
                        // Placeholder profiles use placeholder+<uuid>@resonanceart.org
                        // as their login email — show the target_email the admin
                        // entered instead so the row is identifiable.
                        const emailDisplay = isClaimable ? (up.target_email || up.email) : up.email
                        return (
                          <tr key={up.id}>
                            <td>
                              <div style={{display:'flex',alignItems:'center',gap:8}}>
                                {up.avatar_url ? <img src={up.avatar_url} className="admin-avatar" alt="" /> : <div className="admin-avatar-placeholder">{up.display_name?.[0]?.toUpperCase()}</div>}
                                <span className="admin-table__name">{up.display_name}</span>
                              </div>
                            </td>
                            <td className="admin-table__email">{emailDisplay}</td>
                            <td>
                              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                                <span className={`admin-badge admin-badge--${up.profile_visibility}`}>{up.profile_visibility}</span>
                                {isClaimable && (
                                  <span
                                    className="admin-badge"
                                    style={{
                                      background: 'rgba(245, 158, 11, 0.15)',
                                      color: '#b45309',
                                      border: '1px solid rgba(245, 158, 11, 0.4)',
                                    }}
                                  >
                                    Claimable
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="admin-table__date">{new Date(up.created_at).toLocaleDateString()}</td>
                            <td>
                              <div style={{display:'flex',gap:6}}>
                                {isClaimable ? (
                                  <>
                                    <button
                                      type="button"
                                      className="admin-btn admin-btn--primary admin-btn--sm"
                                      onClick={() => router.push(`/dashboard/profile/live-edit?admin_edit_as=${up.id}`)}
                                    >
                                      Edit
                                    </button>
                                    {up.target_email && (
                                      <button
                                        type="button"
                                        className="admin-btn admin-btn--outline admin-btn--sm"
                                        onClick={async () => {
                                          try {
                                            const res = await fetch('/api/admin/send-claim-invite', {
                                              method: 'POST',
                                              headers: { 'Content-Type': 'application/json' },
                                              credentials: 'include',
                                              body: JSON.stringify({ profile_id: up.id, adminPassword: localStorage.getItem('admin_password') }),
                                            })
                                            const data = await res.json()
                                            if (data.success && data.email_sent) {
                                              alert(`Invite sent to ${up.target_email}`)
                                            } else if (data.success) {
                                              await navigator.clipboard.writeText(data.claim_url)
                                              alert(`Email failed but link copied: ${data.claim_url}`)
                                            } else {
                                              alert(data.message || 'Failed to send invite')
                                            }
                                          } catch { alert('Network error') }
                                        }}
                                      >
                                        Send Invite
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      className="admin-btn admin-btn--outline admin-btn--sm"
                                      onClick={async () => {
                                        try {
                                          const res = await fetch('/api/admin/send-claim-invite', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            credentials: 'include',
                                            body: JSON.stringify({ profile_id: up.id, link_only: true, adminPassword: localStorage.getItem('admin_password') }),
                                          })
                                          const data = await res.json()
                                          if (data.success && data.claim_url) {
                                            try {
                                              await navigator.clipboard.writeText(data.claim_url)
                                              alert('Claim link copied to clipboard!')
                                            } catch {
                                              prompt('Copy this claim link:', data.claim_url)
                                            }
                                          } else {
                                            alert(data.message || `Failed: ${res.status}`)
                                          }
                                        } catch (err) { alert(`Error: ${(err as Error).message}`) }
                                      }}
                                    >
                                      Copy Link
                                    </button>
                                  </>
                                ) : (
                                  <a href={`/profiles/${up.display_name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')}?preview=1`} target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn--outline admin-btn--sm">View</a>
                                )}
                                {up.profile_visibility === 'pending' && (
                                  <>
                                    <button className="admin-btn admin-btn--primary admin-btn--sm" onClick={() => handleUserProfileAction(up.id, 'approve')}>Publish</button>
                                    <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => handleUserProfileAction(up.id, 'reject')}>Reject</button>
                                  </>
                                )}
                                {up.profile_visibility === 'published' && (
                                  <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => handleUserProfileAction(up.id, 'reject')}>Unpublish</button>
                                )}
                                <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => handleDeleteUser(up.id, up.display_name)}>Delete</button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </>
              )}

              {/* PROJECTS */}
              {activeView === 'projects' && (
                <>
                  <div className="admin-content__header">
                    <h1 className="admin-content__title">Project Submissions</h1>
                    <p className="admin-content__subtitle">{projects.length} total submissions</p>
                  </div>
                  <div className="admin-filters">
                    <select className="admin-filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                      <option value="all">All Status</option>
                      <option value="new">New</option>
                      <option value="draft">Draft</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  {actionMsg && <p style={{padding:'8px 16px', background:'var(--color-surface, #111)', border:'1px solid var(--color-border, #222)', borderRadius:8, marginBottom:16, fontSize:13, color:'var(--color-primary, #14b8a6)'}}>{actionMsg}</p>}
                  <table className="admin-table">
                    <thead><tr><th>Project</th><th>Creator</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                    <tbody>
                      {filteredProjects.map(p => (
                        <tr key={p.id}>
                          <td className="admin-table__name">{p.project_title}</td>
                          <td>
                            <div>{p.artist_name}</div>
                            <div className="admin-table__email">{p.artist_email}</div>
                          </td>
                          <td><span className={`admin-badge admin-badge--${p.status}`}>{p.status}</span></td>
                          <td className="admin-table__date">{new Date(p.created_at).toLocaleDateString()}</td>
                          <td>
                            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                              <a href={`/preview/project/${p.id}`} target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn--outline admin-btn--sm">Preview</a>
                              {(p.status === 'new' || p.status === 'draft') && (
                                <>
                                  <button className="admin-btn admin-btn--primary admin-btn--sm" onClick={() => handleAction('project', p.id, 'approve')}>Approve</button>
                                  <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => handleAction('project', p.id, 'reject')}>Reject</button>
                                </>
                              )}
                              {p.status === 'approved' && (
                                <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => handleAction('project', p.id, 'unpublish')}>Unpublish</button>
                              )}
                              <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => handleDeleteProject(p.id, p.project_title)}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {/* USERS */}
              {activeView === 'users' && (
                <>
                  <div className="admin-content__header">
                    <h1 className="admin-content__title">User Accounts</h1>
                    <p className="admin-content__subtitle">{users.length} registered users</p>
                  </div>
                  {actionMsg && <p style={{padding:'8px 16px', background:'var(--color-surface, #111)', border:'1px solid var(--color-border, #222)', borderRadius:8, marginBottom:16, fontSize:13, color:'var(--color-primary, #14b8a6)'}}>{actionMsg}</p>}
                  <table className="admin-table">
                    <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead>
                    <tbody>
                      {filteredUsers.map(u => (
                        <tr key={u.id}>
                          <td>
                            <div style={{display:'flex',alignItems:'center',gap:8}}>
                              {u.avatar_url ? <img src={u.avatar_url} className="admin-avatar" alt="" /> : <div className="admin-avatar-placeholder">{u.display_name?.[0]?.toUpperCase()}</div>}
                              <span className="admin-table__name">{u.display_name}</span>
                            </div>
                          </td>
                          <td className="admin-table__email">{u.email}</td>
                          <td><span className={`admin-badge admin-badge--${u.role === 'admin' ? 'approved' : 'new'}`}>{u.role}</span></td>
                          <td className="admin-table__date">{new Date(u.created_at).toLocaleDateString()}</td>
                          <td>
                            <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                              <select value={u.role} onChange={e => handleRoleChange(u.id, e.target.value)} className="admin-filter-select" style={{minWidth:100}}>
                                <option value="collaborator">Collaborator</option>
                                <option value="creator">Creator</option>
                                <option value="admin">Admin</option>
                              </select>
                              <button
                                onClick={() => handleDeleteUser(u.id, u.display_name)}
                                className="admin-btn admin-btn--sm"
                                style={{background:'rgba(220,38,38,0.1)',color:'#ef4444',border:'1px solid rgba(220,38,38,0.2)',padding:'4px 8px',borderRadius:6,cursor:'pointer',display:'inline-flex',alignItems:'center',gap:4,fontSize:12,whiteSpace:'nowrap'}}
                                title={`Delete ${u.display_name}`}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {/* MESSAGES */}
              {activeView === 'messages' && (
                <>
                  <div className="admin-content__header">
                    <h1 className="admin-content__title">Messages</h1>
                    <p className="admin-content__subtitle">{messages.length} total messages</p>
                  </div>
                  {messages.length === 0 ? (
                    <div className="admin-empty">
                      <div className="admin-empty__icon">{'\uD83D\uDCAC'}</div>
                      <div className="admin-empty__title">No messages yet</div>
                    </div>
                  ) : (
                    messages.map(m => (
                      <div key={m.id} className={`admin-message-card${!m.is_read ? ' admin-message-card--unread' : ''}`} onClick={() => setExpandedMsg(expandedMsg === m.id ? null : m.id)}>
                        <div className="admin-message-card__header">
                          <div>
                            <span className="admin-message-card__from">{m.from_name}</span>
                            <span className="admin-message-card__email">{m.from_email}</span>
                          </div>
                          <div style={{display:'flex',alignItems:'center',gap:8}}>
                            <span className="admin-message-card__date">{timeAgo(m.created_at)}</span>
                            <a href={`mailto:${m.from_email}?subject=Re: ${m.subject_type}`} className="admin-btn admin-btn--outline admin-btn--sm" onClick={e => e.stopPropagation()}>Reply</a>
                          </div>
                        </div>
                        <div className="admin-message-card__type">{m.subject_type}</div>
                        {expandedMsg === m.id && <div className="admin-message-card__body">{m.message}</div>}
                      </div>
                    ))
                  )}
                </>
              )}

              {/* INTERESTS */}
              {activeView === 'interests' && (
                <>
                  <div className="admin-content__header">
                    <h1 className="admin-content__title">Collaboration Interests</h1>
                    <p className="admin-content__subtitle">{interests.length} expressions of interest</p>
                  </div>
                  <table className="admin-table">
                    <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Project</th><th>Date</th><th>Actions</th></tr></thead>
                    <tbody>
                      {filteredInterests.map(i => (
                        <tr key={i.id}>
                          <td className="admin-table__name">{i.name}</td>
                          <td className="admin-table__email">{i.email}</td>
                          <td>{i.task_title || '\u2014'}</td>
                          <td>{i.project_title || '\u2014'}</td>
                          <td className="admin-table__date">{new Date(i.created_at).toLocaleDateString()}</td>
                          <td><a href={`mailto:${i.email}`} className="admin-btn admin-btn--outline admin-btn--sm">Email</a></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {/* ACTIVITY */}
              {activeView === 'activity' && (
                <>
                  <div className="admin-content__header">
                    <h1 className="admin-content__title">Activity Feed</h1>
                    <p className="admin-content__subtitle">Last {activityFeed.length} activities</p>
                  </div>
                  <div className="admin-feed">
                    {activityFeed.map(a => (
                      <div key={a.id} className="admin-feed__item">
                        <div className={`admin-feed__icon admin-feed__icon--${a.type}`}>
                          {a.type === 'user' ? '\uD83D\uDC64' : a.type === 'project' ? '\uD83D\uDCC1' : '\uD83E\uDD1D'}
                        </div>
                        <span className="admin-feed__text">{a.text}</span>
                        <span className="admin-feed__time">{timeAgo(a.date)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* PROFILES (legacy collaborator profiles) */}
              {activeView === 'profiles' && (
                <>
                  <div className="admin-content__header">
                    <h1 className="admin-content__title">Collaborator Profiles</h1>
                    <p className="admin-content__subtitle">{profiles.length} legacy profiles</p>
                  </div>
                  <table className="admin-table">
                    <thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                    <tbody>
                      {filteredProfiles.map(p => (
                        <tr key={p.id}>
                          <td className="admin-table__name">{p.name}</td>
                          <td className="admin-table__email">{p.email}</td>
                          <td><span className={`admin-badge admin-badge--${p.status}`}>{p.status}</span></td>
                          <td className="admin-table__date">{new Date(p.created_at).toLocaleDateString()}</td>
                          <td>
                            <div style={{display:'flex',gap:6}}>
                              {p.status === 'new' && (
                                <>
                                  <button className="admin-btn admin-btn--primary admin-btn--sm" onClick={() => handleAction('profile', p.id, 'approve')}>Approve</button>
                                  <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => handleAction('profile', p.id, 'reject')}>Reject</button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </>
          )}
        </div>
      </main>

      {/* ── "Build Profile for Artist" Modal ──────────────────────── */}
      {showClaimableModal && (
        <div
          className="admin-modal__overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="build-profile-title"
          onClick={(e) => {
            if (e.target === e.currentTarget && !claimableSubmitting) {
              setShowClaimableModal(false)
            }
          }}
        >
          <div className="admin-modal__card admin-modal--build-profile">
            <button
              type="button"
              className="admin-modal__close"
              aria-label="Close"
              onClick={() => { if (!claimableSubmitting) { setShowClaimableModal(false); resetClaimableForm() } }}
              disabled={claimableSubmitting}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <div className="admin-modal__brand">
              <span className="admin-modal__brand-mark" aria-hidden="true" />
              <span className="admin-modal__brand-label">Resonance Network</span>
            </div>

            <h2 id="build-profile-title" className="admin-modal__title">
              {adminClaimCopy.modalTitle}
            </h2>
            <p className="admin-modal__subtitle">
              {adminClaimCopy.modalSubtitle}
            </p>

            <form onSubmit={handleCreateClaimableProfile} className="admin-modal__form">
              <div className="admin-modal__field">
                <label htmlFor="claimable-email" className="admin-modal__label">
                  {adminClaimCopy.emailLabel}
                  <span className="admin-modal__label-required" aria-hidden="true">*</span>
                </label>
                <input
                  id="claimable-email"
                  type="email"
                  className="admin-modal__input"
                  value={claimableEmail}
                  onChange={(e) => setClaimableEmail(e.target.value)}
                  placeholder="artist@example.com"
                  required
                  autoFocus
                  disabled={claimableSubmitting}
                />
                {/* Note: adminClaimCopy.emailHint says "(optional)" but backend
                    requires this field — override with our own required copy. */}
                <p className="admin-modal__help">
                  Where we&rsquo;ll send the claim invite. Required.
                </p>
              </div>

              <div className="admin-modal__field">
                <label htmlFor="claimable-display-name" className="admin-modal__label">
                  {adminClaimCopy.displayNameLabel}
                  <span className="admin-modal__label-required" aria-hidden="true">*</span>
                </label>
                <input
                  id="claimable-display-name"
                  type="text"
                  className="admin-modal__input"
                  value={claimableDisplayName}
                  onChange={(e) => setClaimableDisplayName(e.target.value)}
                  placeholder="Marin Cosmos"
                  required
                  disabled={claimableSubmitting}
                />
                <p className="admin-modal__help">
                  {adminClaimCopy.displayNameHint.replace(/&mdash;/g, '—')}
                </p>
              </div>

              <div className="admin-modal__field">
                <label htmlFor="claimable-import-url" className="admin-modal__label">
                  {adminClaimCopy.importUrlLabel}
                </label>
                <input
                  id="claimable-import-url"
                  type="url"
                  className="admin-modal__input"
                  value={claimableImportUrl}
                  onChange={(e) => setClaimableImportUrl(e.target.value)}
                  placeholder="https://example.com"
                  disabled={claimableSubmitting}
                />
                <p className="admin-modal__help">
                  {adminClaimCopy.importUrlHint.replace(/&mdash;/g, '—')}
                </p>
              </div>

              {claimableError && (
                <div role="alert" className="admin-modal__error">
                  {claimableError}
                </div>
              )}

              {claimableSubmitting && claimableImportUrl.trim() && (
                <p className="admin-modal__help">
                  {adminClaimCopy.submittingWithUrl(claimableImportUrl.trim())}
                </p>
              )}

              <div className="admin-modal__actions">
                <button
                  type="button"
                  className="admin-modal__btn admin-modal__btn--secondary"
                  onClick={() => { setShowClaimableModal(false); resetClaimableForm() }}
                  disabled={claimableSubmitting}
                >
                  {adminClaimCopy.cancelButton}
                </button>
                <button
                  type="submit"
                  className="admin-modal__btn admin-modal__btn--primary"
                  disabled={claimableSubmitting}
                >
                  {claimableSubmitting
                    ? (claimableImportUrl.trim() ? adminClaimCopy.submittingWithUrl(claimableImportUrl.trim()) : adminClaimCopy.submittingNoUrl)
                    : (claimableImportUrl.trim() ? adminClaimCopy.submitButton : adminClaimCopy.submitButtonNoUrl)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
