'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface BadgeType {
  id: string
  label: string
  symbol: string
  description: string
  category: string
}

interface AwardedBadge {
  badge_type: string
  label?: string
  description?: string
  project_name?: string
  awarded_at: string
  profile_id: string
  display_name: string
  avatar_url: string | null
}

interface UserProfile {
  id: string
  display_name: string
  avatar_url: string | null
}

export default function AdminBadgesPage() {
  const router = useRouter()
  const [badgeTypes, setBadgeTypes] = useState<BadgeType[]>([])
  const [awardedBadges, setAwardedBadges] = useState<AwardedBadge[]>([])
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'award' | 'types' | 'awarded'>('award')

  // Award form state
  const [awardUserId, setAwardUserId] = useState('')
  const [awardBadgeType, setAwardBadgeType] = useState('')
  const [awardProjectName, setAwardProjectName] = useState('')
  const [awardCustomLabel, setAwardCustomLabel] = useState('')
  const [awardCustomDesc, setAwardCustomDesc] = useState('')
  const [awardMessage, setAwardMessage] = useState('')
  const [awarding, setAwarding] = useState(false)

  // Edit type state
  const [editingType, setEditingType] = useState<BadgeType | null>(null)
  const [newType, setNewType] = useState({ id: '', label: '', symbol: '', description: '', category: 'engagement' })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const badgesRes = await fetch('/api/admin/badges')
      if (badgesRes.ok) {
        const data = await badgesRes.json()
        setBadgeTypes(data.badgeTypes || [])
        setAwardedBadges(data.awardedBadges || [])
        setUsers(data.users || [])
      }
    } catch {}
    setLoading(false)
  }

  async function handleAward() {
    if (!awardUserId || !awardBadgeType) return
    setAwarding(true)
    setAwardMessage('')
    try {
      const res = await fetch('/api/admin/badges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'award',
          profile_id: awardUserId,
          badge_type: awardBadgeType,
          project_name: awardProjectName || undefined,
          custom_label: awardCustomLabel || undefined,
          custom_description: awardCustomDesc || undefined,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        const userName = users.find(u => u.id === awardUserId)?.display_name || 'User'
        const badgeLabel = badgeTypes.find(b => b.id === awardBadgeType)?.label || awardBadgeType
        setAwardMessage(`Awarded "${badgeLabel}" badge to ${userName}`)
        setAwardProjectName('')
        setAwardCustomLabel('')
        setAwardCustomDesc('')
        await loadData()
      } else {
        setAwardMessage(data.error || 'Failed to award badge.')
      }
    } catch {
      setAwardMessage('Something went wrong.')
    }
    setAwarding(false)
  }

  async function handleRemoveBadge(profileId: string, badgeType: string, projectName?: string) {
    if (!confirm('Remove this badge?')) return
    try {
      const res = await fetch('/api/admin/badges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'remove',
          profile_id: profileId,
          badge_type: badgeType,
          project_name: projectName,
        }),
      })
      if (res.ok) await loadData()
    } catch {}
  }

  async function handleSaveTypes(updatedTypes: BadgeType[]) {
    try {
      const res = await fetch('/api/admin/badges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_types', badgeTypes: updatedTypes }),
      })
      if (res.ok) {
        const data = await res.json()
        setBadgeTypes(data.badgeTypes || updatedTypes)
        setEditingType(null)
      }
    } catch {}
  }

  function handleAddType() {
    if (!newType.id || !newType.label || !newType.symbol) return
    const updated = [...badgeTypes, newType]
    handleSaveTypes(updated)
    setNewType({ id: '', label: '', symbol: '', description: '', category: 'engagement' })
  }

  function handleDeleteType(typeId: string) {
    if (!confirm(`Delete badge type "${typeId}"? This won't remove already-awarded badges.`)) return
    handleSaveTypes(badgeTypes.filter(t => t.id !== typeId))
  }

  function handleUpdateType(updated: BadgeType) {
    handleSaveTypes(badgeTypes.map(t => t.id === updated.id ? updated : t))
  }

  if (loading) {
    return <div className="container" style={{ padding: 'var(--space-8)' }}><p>Loading badges...</p></div>
  }

  return (
    <div style={{ maxWidth: 960, padding: 'var(--space-4)' }}>
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Badge Management</h1>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', borderBottom: '1px solid var(--color-border)' }}>
          {(['award', 'awarded', 'types'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontWeight: activeTab === tab ? 700 : 400,
                color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                borderBottom: activeTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent',
                marginBottom: -1,
              }}
            >
              {tab === 'award' ? 'Award Badge' : tab === 'awarded' ? `Awarded (${awardedBadges.length})` : `Badge Types (${badgeTypes.length})`}
            </button>
          ))}
        </div>

        {/* Award Tab */}
        {activeTab === 'award' && (
          <div className="settings-card">
            <h2 className="settings-card__title">Award a Badge</h2>

            <div className="form-group">
              <label className="form-label">User</label>
              <select className="form-input" value={awardUserId} onChange={e => setAwardUserId(e.target.value)}>
                <option value="">Select a user...</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.display_name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Badge Type</label>
              <select className="form-input" value={awardBadgeType} onChange={e => setAwardBadgeType(e.target.value)}>
                <option value="">Select a badge...</option>
                {badgeTypes.map(bt => (
                  <option key={bt.id} value={bt.id}>{bt.symbol} {bt.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Project Name (optional, for project badges)</label>
              <input className="form-input" value={awardProjectName} onChange={e => setAwardProjectName(e.target.value)} placeholder="e.g. Resonance" />
            </div>

            <div className="form-group">
              <label className="form-label">Custom Label (optional, overrides default)</label>
              <input className="form-input" value={awardCustomLabel} onChange={e => setAwardCustomLabel(e.target.value)} placeholder="Leave blank to use default" />
            </div>

            <div className="form-group">
              <label className="form-label">Custom Description (optional)</label>
              <input className="form-input" value={awardCustomDesc} onChange={e => setAwardCustomDesc(e.target.value)} placeholder="Leave blank to use default" />
            </div>

            {awardMessage && (
              <div className={awardMessage.startsWith('Awarded') ? 'settings-success' : 'form-error'} style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', borderRadius: '8px' }}>
                {awardMessage}
              </div>
            )}

            <button className="btn btn--primary" onClick={handleAward} disabled={awarding || !awardUserId || !awardBadgeType}>
              {awarding ? 'Awarding...' : 'Award Badge'}
            </button>
          </div>
        )}

        {/* Awarded Tab */}
        {activeTab === 'awarded' && (
          <div className="settings-card">
            <h2 className="settings-card__title">All Awarded Badges</h2>
            {awardedBadges.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)' }}>No badges awarded yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {awardedBadges.map((ab, i) => {
                  const type = badgeTypes.find(t => t.id === ab.badge_type)
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--color-surface)', borderRadius: 8 }}>
                      <span style={{ fontSize: 20, width: 32, textAlign: 'center' }}>{type?.symbol || '●'}</span>
                      <div style={{ flex: 1 }}>
                        <strong>{ab.display_name}</strong>
                        <span style={{ color: 'var(--color-text-muted)', marginLeft: 8 }}>
                          {ab.label || type?.label || ab.badge_type}
                          {ab.project_name && `, ${ab.project_name}`}
                        </span>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                          {new Date(ab.awarded_at).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveBadge(ab.profile_id, ab.badge_type, ab.project_name as string | undefined)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-error, #ef4444)', cursor: 'pointer', fontSize: 'var(--text-sm)' }}
                      >
                        Remove
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Badge Types Tab */}
        {activeTab === 'types' && (
          <div className="settings-card">
            <h2 className="settings-card__title">Badge Types</h2>
            <p className="settings-card__desc">Edit existing badges or create new ones. Changes apply to future awards.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
              {badgeTypes.map(bt => (
                <div key={bt.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--color-surface)', borderRadius: 8 }}>
                  {editingType?.id === bt.id ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <input className="form-input" value={editingType.symbol} onChange={e => setEditingType({ ...editingType, symbol: e.target.value })} placeholder="Symbol" style={{ width: 60 }} />
                        <input className="form-input" value={editingType.label} onChange={e => setEditingType({ ...editingType, label: e.target.value })} placeholder="Label" style={{ flex: 1 }} />
                      </div>
                      <input className="form-input" value={editingType.description} onChange={e => setEditingType({ ...editingType, description: e.target.value })} placeholder="Description" />
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <button className="btn btn--primary btn--sm" onClick={() => handleUpdateType(editingType)}>Save</button>
                        <button className="btn btn--outline btn--sm" onClick={() => setEditingType(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span style={{ fontSize: 20, width: 32, textAlign: 'center' }}>{bt.symbol}</span>
                      <div style={{ flex: 1 }}>
                        <strong>{bt.label}</strong>
                        <span style={{ color: 'var(--color-text-muted)', marginLeft: 8, fontSize: 'var(--text-sm)' }}>{bt.category}</span>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{bt.description}</div>
                      </div>
                      <button onClick={() => setEditingType({ ...bt })} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: 'var(--text-sm)' }}>Edit</button>
                      <button onClick={() => handleDeleteType(bt.id)} style={{ background: 'none', border: 'none', color: 'var(--color-error, #ef4444)', cursor: 'pointer', fontSize: 'var(--text-sm)' }}>Delete</button>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Add new type */}
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>Add New Badge Type</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <input className="form-input" value={newType.symbol} onChange={e => setNewType({ ...newType, symbol: e.target.value })} placeholder="Symbol (emoji)" style={{ width: 80 }} />
                <input className="form-input" value={newType.id} onChange={e => setNewType({ ...newType, id: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') })} placeholder="ID (e.g. burning_man)" style={{ width: 160 }} />
                <input className="form-input" value={newType.label} onChange={e => setNewType({ ...newType, label: e.target.value })} placeholder="Label" style={{ flex: 1 }} />
              </div>
              <input className="form-input" value={newType.description} onChange={e => setNewType({ ...newType, description: e.target.value })} placeholder="Description" />
              <select className="form-input" value={newType.category} onChange={e => setNewType({ ...newType, category: e.target.value })} style={{ width: 200 }}>
                <option value="status">Status</option>
                <option value="project">Project</option>
                <option value="engagement">Engagement</option>
                <option value="skill">Skill</option>
              </select>
              <button className="btn btn--primary btn--sm" onClick={handleAddType} disabled={!newType.id || !newType.label || !newType.symbol} style={{ alignSelf: 'flex-start' }}>
                Add Badge Type
              </button>
            </div>
          </div>
        )}
    </div>
  )
}
