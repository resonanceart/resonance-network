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
}

interface Submission {
  id: string
  title: string
  type: 'project' | 'profile' | 'interest'
  status: string
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
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [follows, setFollows] = useState<FollowedProject[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const [profileRes, followsRes, messagesRes] = await Promise.all([
        fetch('/api/user/profile', { credentials: 'same-origin' }),
        fetch('/api/user/follows', { credentials: 'same-origin' }),
        fetch('/api/user/messages', { credentials: 'same-origin' }),
      ])

      if (profileRes.ok) {
        const data = await profileRes.json()
        if (data.profile && data.profile.onboarding_completed === false) {
          router.push('/dashboard/welcome')
          return
        }
        setProfile(data.profile)
        setSubmissions(data.submissions ?? [])
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
        credentials: 'same-origin',
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

  // Profile completion checklist
  const checklistItems = [
    { key: 'name', label: 'Add your name', done: !!profile?.display_name },
    { key: 'avatar', label: 'Upload a profile photo', done: !!profile?.avatar_url },
    { key: 'bio', label: 'Write your bio', done: !!profile?.bio },
    { key: 'location', label: 'Set your location', done: !!profile?.location },
    { key: 'skills', label: 'Add skills (1+)', done: (profile?.specialties?.length ?? 0) > 0 },
  ]
  const completedCount = checklistItems.filter(i => i.done).length
  const profileCompletion = Math.round((completedCount / checklistItems.length) * 100)

  return (
    <section className="dashboard">
      <div className="container">

        {/* Welcome Header */}
        <div className="dashboard-header">
          <div className="dashboard-header__user">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="dashboard-header__avatar" />
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

        {/* Profile Completion Banner — with inline checklist */}
        {profileCompletion < 100 && (
          <div className="dashboard-completion-banner">
            <div className="dashboard-completion-banner__top">
              <div className="dashboard-completion-banner__content">
                <strong>Complete your profile — {profileCompletion}%</strong>
                <p>A complete profile helps collaborators find and connect with you.</p>
              </div>
              <Link href="/dashboard/profile/live-edit" className="btn btn--primary btn--sm">
                Complete Your Profile
              </Link>
            </div>
            <div className="dashboard-completion-banner__bar">
              <div
                className="dashboard-completion-banner__fill"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
            <ul className="dashboard-completion-checklist">
              {checklistItems.map(item => (
                <li
                  key={item.key}
                  className={`dashboard-completion-checklist__item${item.done ? ' dashboard-completion-checklist__item--done' : ''}`}
                >
                  {item.done ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <circle cx="8" cy="8" r="7" fill="#22c55e"/>
                      <path d="M5 8.5L7 10.5L11 6.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2"/>
                    </svg>
                  )}
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
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

        {/* Action Cards — primary CTAs */}
        <div className="dashboard-action-cards">
          <Link href="/dashboard/profile/live-edit" className="dashboard-action-card dashboard-action-card--primary">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            <div>
              <strong>Edit Your Profile</strong>
              <span>See your profile and edit it in real time</span>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="dashboard-action-card__arrow">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
          <Link href="/dashboard/projects/live-edit" className="dashboard-action-card">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            <div>
              <strong>Submit a Project</strong>
              <span>Propose a new project for the network</span>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="dashboard-action-card__arrow">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
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
              {submissions.map(sub => {
                const typeLabel = sub.type === 'project' ? 'Project' : sub.type === 'profile' ? 'Profile' : 'Interest'
                const previewLink = sub.type === 'project'
                  ? `/preview/project/${sub.id}`
                  : sub.type === 'profile'
                    ? `/preview/profile/${sub.id}`
                    : null

                return (
                  <div key={`${sub.type}-${sub.id}`} className="dashboard-submission">
                    <div className="dashboard-submission__info">
                      {previewLink ? (
                        <Link href={previewLink} className="dashboard-submission__title" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
                          {sub.title}
                        </Link>
                      ) : (
                        <span className="dashboard-submission__title">{sub.title}</span>
                      )}
                      <span className="dashboard-submission__type">{typeLabel}</span>
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
                )
              })}
            </div>
          </div>
        )}

        {/* Secondary Links */}
        <div className="dashboard-secondary-links">
          <Link href="/dashboard/profile" className="dashboard-secondary-link">Profile Settings</Link>
          <Link href="/dashboard/settings" className="dashboard-secondary-link">Account Settings</Link>
        </div>
      </div>
    </section>
  )
}
