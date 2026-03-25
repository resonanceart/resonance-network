'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import Link from 'next/link'

interface Message {
  id: string
  sender_name: string
  subject: string
  body: string
  read: boolean
  created_at: string
  message_type: string | null
  related_project: string | null
  related_task: string | null
}

type FilterType = 'all' | 'collaboration_interest' | 'submission_status' | 'system'

const FILTER_LABELS: Record<FilterType, string> = {
  all: 'All',
  collaboration_interest: 'Collaboration',
  submission_status: 'Project Updates',
  system: 'System',
}

const PAGE_SIZE = 20

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [unreadCount, setUnreadCount] = useState(0)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')
  const [markingAll, setMarkingAll] = useState(false)

  const fetchMessages = useCallback(async (pageNum: number, append: boolean) => {
    try {
      const res = await fetch(`/api/user/messages?page=${pageNum}&limit=${PAGE_SIZE}`)
      if (!res.ok) return

      const data = await res.json()
      setMessages(prev => append ? [...prev, ...data.messages] : data.messages)
      setTotalPages(data.pagination.totalPages)
      setUnreadCount(data.unread_count)
    } catch (err) {
      console.error('Messages fetch error:', err)
    }
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login')
      return
    }
    fetchMessages(1, false).then(() => setLoading(false))
  }, [user, authLoading, router, fetchMessages])

  const handleLoadMore = async () => {
    const nextPage = page + 1
    setLoadingMore(true)
    await fetchMessages(nextPage, true)
    setPage(nextPage)
    setLoadingMore(false)
  }

  const handleMarkAllRead = async () => {
    setMarkingAll(true)
    try {
      const unreadMessages = messages.filter(m => !m.read)
      await Promise.all(
        unreadMessages.map(m =>
          fetch('/api/user/messages', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messageId: m.id }),
          })
        )
      )
      setMessages(prev => prev.map(m => ({ ...m, read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Mark all read error:', err)
    } finally {
      setMarkingAll(false)
    }
  }

  const handleToggle = async (msg: Message) => {
    const isExpanding = expandedId !== msg.id
    setExpandedId(isExpanding ? msg.id : null)

    // Mark as read when expanding
    if (isExpanding && !msg.read) {
      try {
        const res = await fetch('/api/user/messages', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messageId: msg.id }),
        })
        if (res.ok) {
          setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, read: true } : m))
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
      } catch (err) {
        console.error('Mark read error:', err)
      }
    }
  }

  if (authLoading || loading) {
    return (
      <div className="container dashboard-loading">
        <div className="dashboard-spinner" aria-label="Loading messages" />
      </div>
    )
  }

  if (!user) return null

  const filtered = filter === 'all'
    ? messages
    : messages.filter(m => m.message_type === filter)

  return (
    <section className="dashboard">
      <div className="container">
        {/* Header */}
        <div className="messages-page-header">
          <div className="messages-page-header__left">
            <Link href="/dashboard" className="messages-back-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Dashboard
            </Link>
            <h1 className="dashboard-header__title">Messages</h1>
            {unreadCount > 0 && (
              <span className="messages-unread-badge">{unreadCount} unread</span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              className="btn btn--outline btn--sm"
              onClick={handleMarkAllRead}
              disabled={markingAll}
            >
              {markingAll ? 'Marking...' : 'Mark all as read'}
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="messages-filters">
          {(Object.entries(FILTER_LABELS) as [FilterType, string][]).map(([key, label]) => (
            <button
              key={key}
              className={`messages-filter${filter === key ? ' messages-filter--active' : ''}`}
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Message List */}
        {filtered.length === 0 ? (
          <div className="dashboard-empty">
            <p>{filter === 'all' ? 'No messages yet.' : `No ${FILTER_LABELS[filter].toLowerCase()} messages.`}</p>
          </div>
        ) : (
          <ul className="dashboard-messages">
            {filtered.map(msg => (
              <li
                key={msg.id}
                className={`dashboard-message${!msg.read ? ' dashboard-message--unread' : ''}`}
              >
                <button
                  className="dashboard-message__header"
                  onClick={() => handleToggle(msg)}
                  aria-expanded={expandedId === msg.id}
                >
                  {!msg.read && <span className="dashboard-message__dot" aria-label="Unread" />}
                  <span className="dashboard-message__from">{msg.sender_name}</span>
                  <span className="dashboard-message__subject">{msg.subject}</span>
                  {msg.message_type && (
                    <span className="messages-type-tag">{
                      msg.message_type === 'collaboration_interest' ? 'Collab' :
                      msg.message_type === 'submission_status' ? 'Status' : 'System'
                    }</span>
                  )}
                  <time className="dashboard-message__date">
                    {new Date(msg.created_at).toLocaleDateString()}
                  </time>
                  <svg
                    className={`dashboard-message__chevron${expandedId === msg.id ? ' dashboard-message__chevron--open' : ''}`}
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
                {expandedId === msg.id && (
                  <div className="dashboard-message__body">
                    <p>{msg.body}</p>
                    {msg.related_project && (
                      <p className="messages-related">
                        Project: <strong>{msg.related_project}</strong>
                        {msg.related_task && <> &middot; Role: <strong>{msg.related_task}</strong></>}
                      </p>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Load More */}
        {page < totalPages && filter === 'all' && (
          <div className="messages-load-more">
            <button
              className="btn btn--outline"
              onClick={handleLoadMore}
              disabled={loadingMore}
            >
              {loadingMore ? 'Loading...' : 'Load More Messages'}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
