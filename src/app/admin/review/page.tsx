'use client'

import { useState, useMemo, useEffect } from 'react'
import { supabase } from '@/lib/supabase-client'

interface ProjectSubmission {
  id: string
  created_at: string
  project_title: string
  artist_name: string
  artist_email: string
  one_sentence: string | null
  stage: string | null
  location: string | null
  status: string
}

export default function AdminReviewPage() {
  const [projects, setProjects] = useState<ProjectSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [actionMsg, setActionMsg] = useState('')
  const [actionInFlight, setActionInFlight] = useState<string | null>(null)

  async function fetchProjects() {
    setLoading(true)
    const { data } = await supabase
      .from('project_submissions')
      .select('id, created_at, project_title, artist_name, artist_email, one_sentence, stage, location, status')
      .eq('status', 'new')
      .order('created_at', { ascending: true })
    setProjects((data || []) as ProjectSubmission[])
    setLoading(false)
  }

  useEffect(() => { fetchProjects() }, [])

  async function handleAction(id: string, action: 'approve' | 'reject') {
    const confirmed = window.confirm(
      action === 'approve'
        ? 'Approve this project? It will become visible on the network.'
        : 'Reject this submission? The creator will need to resubmit.'
    )
    if (!confirmed) return

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

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <div className="dashboard-spinner" aria-label="Loading review queue" />
      </div>
    )
  }

  return (
    <>
      <div className="admin-content__header">
        <h1 className="admin-content__title">Review Queue</h1>
        <p className="admin-content__subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''} awaiting review</p>
      </div>

      {actionMsg && (
        <p style={{ padding: '8px 16px', background: '#111', border: '1px solid #222', borderRadius: 8, marginBottom: 16, fontSize: 13, color: '#14b8a6' }}>
          {actionMsg}
        </p>
      )}

      {projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 16px', color: '#666' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ margin: '0 auto 16px', display: 'block', color: '#22c55e' }}>
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <p style={{ fontSize: 15 }}>All caught up! No submissions awaiting review.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {projects.map(p => (
            <div key={p.id} style={{ background: '#111', border: '1px solid #222', borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600 }}>{p.project_title}</h3>
                  <p style={{ margin: '0 0 8px', fontSize: 13, color: '#999' }}>
                    by {p.artist_name} &middot; {p.artist_email}
                  </p>
                  {p.one_sentence && (
                    <p style={{ margin: '0 0 8px', fontSize: 14, color: '#bbb', lineHeight: 1.5 }}>{p.one_sentence}</p>
                  )}
                  <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#666' }}>
                    {p.stage && <span>Stage: {p.stage}</span>}
                    {p.location && <span>Location: {p.location}</span>}
                    <span>Submitted: {new Date(p.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <a href={`/preview/project/${p.id}`} target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn--outline admin-btn--sm">
                    Preview
                  </a>
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
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
