'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'

interface UserProfile {
  display_name: string
  avatar_url: string | null
  bio: string | null
  location: string | null
  specialties: string[]
  submissions: Submission[]
}

interface Submission {
  id: string
  title: string
  type: 'project' | 'profile'
  status: 'new' | 'approved' | 'rejected'
  created_at: string
}

interface FollowedProject {
  id: string
  slug: string
  title: string
  stage: string
  heroImage: string
  domains: string[]
}

interface Message {
  id: string
  from_name: string
  subject: string
  body: string
  read: boolean
  created_at: string
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [follows, setFollows] = useState<FollowedProject[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const [profileRes, followsRes, messagesRes] = await Promise.all([
        fetch('/api/user/profile'),
        fetch('/api/user/follows'),
        fetch('/api/user/messages'),
      ])

      if (profileRes.ok) {
        const data = await profileRes.json()
        if (data.profile && !data.profile.onboarding_complete) {
          router.push('/dashboard/welcome')
          return
        }
        setProfile(data)
      }
      if (followsRes.ok) {
        const data = await followsRes.json()
        setFollows(data.follows ?? [])
      }
      if (messagesRes.ok) {
        const data = await messagesRes.json()
        setMessages(data.messages ?? [])
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login')
      return
    }
    fetchData()
  }, [user, authLoading, router, fetchData])

  const handleUnfollow = async (projectId: string) => {
    try {
      const res = await fetch('/api/user/follows', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      })
      if (res.ok) {
        setFollows(prev => prev.filter(p => p.id !== projectId))
      }
    } catch (err) {
      console.error('Unfollow error:', err)
    }
  }

  const toggleMessage = (messageId: string) => {
    setExpandedMessage(prev => prev === messageId ? null : messageId)
  }

  if (authLoading || loading) {
    return (
      <div className="container dashboard-loading">
        <div className="dashboard-spinner" aria-label="Loading dashboard" />
      </div>
    )
  }

  if (!user) return null

  const displayName = profile?.display_name || user.email?.split('@')[0] || 'there'
  const avatarUrl = profile?.avatar_url
  const unreadCount = messages.filter(m => !m.read).length
  const submissions = profile?.submissions ?? []

  // Profile completion calculation
  const completionFields = [
    !!profile?.display_name,
    !!profile?.avatar_url,
    !!profile?.bio,
    !!profile?.location,
    (profile?.specialties?.length ?? 0) > 0,
  ]
  const profileCompletion = Math.round(
    (completionFields.filter(Boolean).length / completionFields.length) * 100
  )

  return (
    <section className="dashboard">
      <div className="container">
        {/* Navigation */}
        <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
          <Link href="/dashboard/profile" className="btn btn--outline btn--sm">Edit Profile</Link>
          <Link href="/dashboard/settings" className="btn btn--outline btn--sm">Settings</Link>
        </div>

        {/* Welcome Header */}
        <div className="dashboard-header">
          <div className="dashboard-header__user">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="dashboard-header__avatar"
              />
            ) : (
              <div className="dashboard-header__avatar dashboard-header__avatar--placeholder">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="dashboard-header__title">Welcome back, {displayName}</h1>
              <p className="dashboard-header__subtitle">Here&apos;s what&apos;s happening with your network.</p>
            </div>
          </div>
        </div>

        {/* Profile Completion CTA */}
        {profileCompletion < 100 && (
          <div className="dashboard-completion-banner">
            <div className="dashboard-completion-banner__content">
              <strong>Complete your profile</strong>
              <p>Your profile is {profileCompletion}% complete. A full profile helps collaborators find you.</p>
            </div>
            <div className="dashboard-completion-banner__bar">
              <div
                className="dashboard-completion-banner__fill"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
            <Link href="/dashboard/profile" className="btn btn--primary btn--sm">
              Edit Profile
            </Link>
          </div>
        )}

        {/* Quick Stats */}
        <div className="dashboard-stats">
          <div className="dashboard-stat-card">
            <span className="dashboard-stat-card__value">{follows.length}</span>
            <span className="dashboard-stat-card__label">Projects Followed</span>
          </div>
          <div className="dashboard-stat-card">
            <span className="dashboard-stat-card__value">{unreadCount}</span>
            <span className="dashboard-stat-card__label">Unread Messages</span>
          </div>
          <div className="dashboard-stat-card">
            <span className="dashboard-stat-card__value">{profileCompletion}%</span>
            <span className="dashboard-stat-card__label">Profile Complete</span>
          </div>
        </div>

        {/* Followed Projects */}
        <div className="dashboard-section">
          <h2 className="section-label">Followed Projects</h2>
          {follows.length === 0 ? (
            <div className="dashboard-empty">
              <p>You haven&apos;t followed any projects yet.</p>
              <Link href="/" className="btn btn--outline btn--sm">Browse Projects</Link>
            </div>
          ) : (
            <div className="dashboard-projects-grid">
              {follows.map(project => (
                <div key={project.id} className="dashboard-project-card">
                  <Link href={`/projects/${project.slug}`} className="dashboard-project-card__link">
                    <img
                      src={project.heroImage}
                      alt={project.title}
                      className="dashboard-project-card__image"
                    />
                    <div className="dashboard-project-card__body">
                      <h3 className="dashboard-project-card__title">{project.title}</h3>
                      <div className="badges-group">
                        <Badge variant="stage">{project.stage}</Badge>
                        {project.domains.slice(0, 2).map(d => (
                          <Badge key={d} variant="domain">{d}</Badge>
                        ))}
                      </div>
                    </div>
                  </Link>
                  <button
                    className="btn btn--outline btn--sm dashboard-project-card__unfollow"
                    onClick={() => handleUnfollow(project.id)}
                  >
                    Unfollow
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Messages */}
        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2 className="section-label">Recent Messages</h2>
            <Link href="/dashboard/messages" className="dashboard-section-header__link">View all</Link>
          </div>
          {messages.length === 0 ? (
            <div className="dashboard-empty">
              <p>No messages yet.</p>
            </div>
          ) : (
            <ul className="dashboard-messages">
              {messages.map(msg => (
                <li
                  key={msg.id}
                  className={`dashboard-message${!msg.read ? ' dashboard-message--unread' : ''}`}
                >
                  <button
                    className="dashboard-message__header"
                    onClick={() => toggleMessage(msg.id)}
                    aria-expanded={expandedMessage === msg.id}
                  >
                    {!msg.read && <span className="dashboard-message__dot" aria-label="Unread" />}
                    <span className="dashboard-message__from">{msg.from_name}</span>
                    <span className="dashboard-message__subject">{msg.subject}</span>
                    <time className="dashboard-message__date">
                      {new Date(msg.created_at).toLocaleDateString()}
                    </time>
                    <svg
                      className={`dashboard-message__chevron${expandedMessage === msg.id ? ' dashboard-message__chevron--open' : ''}`}
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {expandedMessage === msg.id && (
                    <div className="dashboard-message__body">
                      <p>{msg.body}</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Your Submissions */}
        {submissions.length > 0 && (
          <div className="dashboard-section">
            <h2 className="section-label">Your Submissions</h2>
            <div className="dashboard-submissions">
              {submissions.map(sub => (
                <div key={sub.id} className="dashboard-submission">
                  <div className="dashboard-submission__info">
                    <span className="dashboard-submission__title">{sub.title}</span>
                    <span className="dashboard-submission__type">{sub.type}</span>
                  </div>
                  <div className="dashboard-submission__meta">
                    <Badge variant={sub.status === 'approved' ? 'stage' : sub.status === 'rejected' ? 'domain' : 'pathway'}>
                      {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                    </Badge>
                    <time className="dashboard-submission__date">
                      {new Date(sub.created_at).toLocaleDateString()}
                    </time>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
