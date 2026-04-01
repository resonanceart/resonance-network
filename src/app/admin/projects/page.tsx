'use client'

import { useState, useMemo, useEffect } from 'react'
import { supabase } from '@/lib/supabase-client'

interface ProjectSubmission {
  id: string
  created_at: string
  project_title: string
  artist_name: string
  artist_email: string
  status: string
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<ProjectSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [actionMsg, setActionMsg] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [actionInFlight, setActionInFlight] = useState<string | null>(null)

  async function fetchProjects() {
    setLoading(true)
    const { data } = await supabase
      .from('project_submissions')
      .select('id, created_at, project_title, artist_name, artist_email, status')
      .order('created_at', { ascending: false })
    setProjects((data || []) as ProjectSubmission[])
    setLoading(false)
  }

  useEffect(() => { fetchProjects() }, [])

  async function handleAction(id: string, action: 'approve' | 'reject') {
    setActionMsg('')
    setActionInFlight(id)
    try {
      const res = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ type: 'project', id, action }),
      })
      const data = await res.json()
      if (data.success) {
        setActionMsg(`Project ${action === 'approve' ? 'approved' : 'rejected'} successfully.`)
        fetchProjects()
      } else {
        setActionMsg(data.message || 'Action failed.')
      }
    } catch {
      setActionMsg('Network error.')
    } finally {
      setActionInFlight(null)
    }
  }

  const q = search.toLowerCase()
  const filtered = useMemo(() => projects.filter(p => {
    const matchSearch = !q || p.project_title.toLowerCase().includes(q) || p.artist_name.toLowerCase().includes(q) || p.artist_email.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    return matchSearch && matchStatus
  }), [projects, q, statusFilter])

  const counts = useMemo(() => {
    const c = { all: projects.length, new: 0, draft: 0, approved: 0, rejected: 0 }
    for (const p of projects) {
      if (p.status in c) c[p.status as keyof typeof c]++
    }
    return c
  }, [projects])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <div className="dashboard-spinner" aria-label="Loading projects" />
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <div className="admin-content__header">
        <h1 className="admin-content__title">Project Submissions</h1>
        <p className="admin-content__subtitle">{projects.length} total submissions</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
        {([
          { label: 'Total', value: counts.all, color: '#e0e0e0' },
          { label: 'New', value: counts.new, color: '#f59e0b' },
          { label: 'Draft', value: counts.draft, color: '#6b7280' },
          { label: 'Approved', value: counts.approved, color: '#22c55e' },
          { label: 'Rejected', value: counts.rejected, color: '#ef4444' },
        ]).map(s => (
          <div key={s.label} className="admin-stat-card" style={{ cursor: 'pointer' }} onClick={() => setStatusFilter(s.label === 'Total' ? 'all' : s.label.toLowerCase())}>
            <div className="admin-stat-card__value" style={{ color: s.color }}>{s.value}</div>
            <div className="admin-stat-card__label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="admin-filters" style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          type="text"
          className="admin-topbar__search"
          placeholder="Search projects, artists, emails..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
        <select className="admin-filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Status ({counts.all})</option>
          <option value="new">New ({counts.new})</option>
          <option value="draft">Draft ({counts.draft})</option>
          <option value="approved">Approved ({counts.approved})</option>
          <option value="rejected">Rejected ({counts.rejected})</option>
        </select>
      </div>

      {/* Action message */}
      {actionMsg && (
        <p style={{ padding: '8px 16px', background: 'var(--color-surface, #111)', border: '1px solid var(--color-border, #222)', borderRadius: 8, marginBottom: 16, fontSize: 13, color: 'var(--color-primary, #14b8a6)' }}>
          {actionMsg}
        </p>
      )}

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--color-text-muted, #666)' }}>
          <p style={{ fontSize: 15 }}>No projects found{statusFilter !== 'all' ? ` with status "${statusFilter}"` : ''}.</p>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Creator</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td className="admin-table__name">{p.project_title}</td>
                <td>
                  <div>{p.artist_name}</div>
                  <div className="admin-table__email">{p.artist_email}</div>
                </td>
                <td>
                  <span className={`admin-badge admin-badge--${p.status}`}>{p.status}</span>
                </td>
                <td className="admin-table__date">{new Date(p.created_at).toLocaleDateString()}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <a href={`/preview/project/${p.id}`} target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn--outline admin-btn--sm">
                      Preview
                    </a>
                    {(p.status === 'new' || p.status === 'draft') && (
                      <>
                        <button
                          className="admin-btn admin-btn--primary admin-btn--sm"
                          onClick={() => handleAction(p.id, 'approve')}
                          disabled={actionInFlight === p.id}
                        >
                          {actionInFlight === p.id ? '...' : 'Approve'}
                        </button>
                        <button
                          className="admin-btn admin-btn--danger admin-btn--sm"
                          onClick={() => handleAction(p.id, 'reject')}
                          disabled={actionInFlight === p.id}
                        >
                          Reject
                        </button>
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
  )
}
