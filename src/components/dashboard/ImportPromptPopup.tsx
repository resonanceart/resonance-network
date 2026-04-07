'use client'

import { useState } from 'react'

import { saveImportData } from '@/lib/import-store'

type ImportMode = 'project' | 'profile' | 'both'

interface ImportPromptPopupProps {
  mode: ImportMode
}

export default function ImportPromptPopup({ mode }: ImportPromptPopupProps) {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(`resonance_import_prompt_dismissed_${mode}`) === '1'
  })
  const [activeTab, setActiveTab] = useState<'project' | 'profile'>(
    mode === 'profile' ? 'profile' : 'project'
  )
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (dismissed) return null

  function dismiss() {
    localStorage.setItem(`resonance_import_prompt_dismissed_${mode}`, '1')
    setDismissed(true)
  }

  async function handleImport() {
    let trimmed = url.trim()
    if (!trimmed) return

    // Auto-prepend https:// for bare domains
    if (!/^https?:\/\//i.test(trimmed)) {
      trimmed = 'https://' + trimmed
      setUrl(trimmed)
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': 'resonance' },
        body: JSON.stringify({ url: trimmed, type: activeTab }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `Scrape failed (${res.status})`)
      }

      const { data } = await res.json()

      if (activeTab === 'project') {
        await saveImportData('resonance_import_data', data)
        window.location.href = '/dashboard/projects/live-edit?new=true&import=true'
      } else {
        await saveImportData('resonance_profile_import', data)
        window.location.href = '/dashboard/profile/live-edit?import=profile'
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const showTabs = mode === 'both'
  const tabs = showTabs
    ? [
        { key: 'project' as const, label: 'Import Project', icon: projectIcon },
        { key: 'profile' as const, label: 'Import Profile', icon: profileIcon },
      ]
    : null

  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: '12px',
      padding: 'var(--space-5)',
      marginBottom: 'var(--space-5)',
      position: 'relative',
    }}>
      {/* Close button */}
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        style={{
          position: 'absolute', top: '12px', right: '12px',
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--color-text-muted)', padding: '4px',
          borderRadius: '6px', lineHeight: 1,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Header */}
      <div style={{ marginBottom: 'var(--space-4)', paddingRight: 'var(--space-6)' }}>
        <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', marginBottom: '4px' }}>
          {mode === 'profile' ? 'Already have a website or portfolio?' : 'Have an existing project online?'}
        </h3>
        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          {mode === 'profile'
            ? 'Import your portfolio or resume to auto-build your profile in seconds.'
            : 'Paste your URL and we\'ll pull in the details to get you started fast.'}
        </p>
      </div>

      {/* Tabs (only in "both" mode) */}
      {showTabs && tabs && (
        <div style={{
          display: 'flex', gap: 'var(--space-2)',
          marginBottom: 'var(--space-4)',
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: 'var(--space-2)',
        }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setError(''); setUrl('') }}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 12px', borderRadius: '8px',
                border: 'none', cursor: 'pointer',
                fontSize: 'var(--text-sm)', fontWeight: 500,
                background: activeTab === tab.key ? 'var(--color-accent-subtle, rgba(99,102,241,0.1))' : 'transparent',
                color: activeTab === tab.key ? 'var(--color-accent, #6366f1)' : 'var(--color-text-muted)',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* URL input + submit */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
        <input
          type="url"
          value={url}
          onChange={e => { setUrl(e.target.value); setError('') }}
          onKeyDown={e => { if (e.key === 'Enter') handleImport() }}
          placeholder={activeTab === 'project' ? 'Paste your project URL...' : 'Paste your portfolio or website URL...'}
          disabled={loading}
          style={{
            flex: '1 1 240px',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid var(--color-border)',
            background: 'var(--color-bg, #fff)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text)',
            outline: 'none',
            minWidth: 0,
          }}
        />
        <button
          onClick={handleImport}
          disabled={loading || !url.trim()}
          className="btn btn--primary btn--sm"
          style={{
            whiteSpace: 'nowrap',
            opacity: loading || !url.trim() ? 0.6 : 1,
            display: 'flex', alignItems: 'center', gap: '6px',
          }}
        >
          {loading ? (
            <>
              <span className="dashboard-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
              Importing...
            </>
          ) : (
            'Import'
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <p style={{
          margin: 0, marginTop: 'var(--space-2)',
          fontSize: 'var(--text-sm)', color: 'var(--color-error, #ef4444)',
        }}>
          {error}{' '}
          <button
            onClick={handleImport}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--color-accent, #6366f1)', textDecoration: 'underline',
              fontSize: 'inherit', padding: 0,
            }}
          >
            Retry
          </button>
        </p>
      )}

      {/* Skip link */}
      <p style={{ margin: 0, marginTop: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
        No website?{' '}
        <a
          href={activeTab === 'project' ? '/dashboard/projects/live-edit?new=true' : '/dashboard/profile/live-edit'}
          style={{ color: 'var(--color-accent, #6366f1)', textDecoration: 'underline', fontWeight: 500 }}
        >
          Start from scratch instead
        </a>
      </p>
    </div>
  )
}

/* ---- Icons ---- */
const projectIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V9C21 7.89543 20.1046 7 19 7H13L11 5H5C3.89543 5 3 5.89543 3 7Z" />
  </svg>
)

const profileIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
)
