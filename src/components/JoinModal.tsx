'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { saveImportData } from '@/lib/import-store'

const STORAGE_KEY = 'resonance_join_dismissed'
const DISMISS_EXPIRY_DAYS = 7

type ScrapeStep = 'idle' | 'scraping' | 'error'

export function JoinModal() {
  const { user, loading: authLoading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [visible, setVisible] = useState(false)

  // Project import state
  const [projectUrl, setProjectUrl] = useState('')
  const [projectStep, setProjectStep] = useState<ScrapeStep>('idle')
  const [projectError, setProjectError] = useState('')

  // Profile import state
  const [profileUrl, setProfileUrl] = useState('')
  const [profileStep, setProfileStep] = useState<ScrapeStep>('idle')
  const [profileError, setProfileError] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (user) return
    if (pathname?.startsWith('/import') || pathname?.startsWith('/join') || pathname?.startsWith('/login') || pathname?.startsWith('/dashboard') || pathname?.startsWith('/claim')) return

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const { timestamp } = JSON.parse(stored)
        const daysSince = (Date.now() - timestamp) / (1000 * 60 * 60 * 24)
        if (daysSince < DISMISS_EXPIRY_DAYS) return
      }
    } catch {
      // localStorage unavailable
    }

    const timer = setTimeout(() => setVisible(true), 1500)
    return () => clearTimeout(timer)
  }, [user, authLoading, pathname])

  useEffect(() => {
    if (!visible) return

    document.body.style.overflow = 'hidden'

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') handleDismiss()
    }
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleEscape)
    }
  }, [visible])

  function handleDismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ dismissed: true, timestamp: Date.now() }))
    } catch {
      // localStorage unavailable
    }
    setVisible(false)
    document.body.style.overflow = ''
  }

  async function handleProjectImport() {
    if (!projectUrl.trim()) return
    setProjectStep('scraping')
    setProjectError('')
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ url: projectUrl.trim(), type: 'project' }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Could not read that page.')
      try { await saveImportData('resonance_import_data', json.data) } catch {}
      try { sessionStorage.setItem('resonance_import_data', JSON.stringify(json.data)) } catch {}
      handleDismiss()
      router.push('/import?preview=project')
    } catch (err) {
      setProjectError(err instanceof Error ? err.message : 'Something went wrong')
      setProjectStep('error')
    }
  }

  async function handleProfileImport() {
    if (!profileUrl.trim()) return
    setProfileStep('scraping')
    setProfileError('')
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ url: profileUrl.trim(), type: 'profile' }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Could not read that page.')
      try { await saveImportData('resonance_profile_import', json.data) } catch {}
      try { sessionStorage.setItem('resonance_profile_import', JSON.stringify(json.data)) } catch {}
      handleDismiss()
      router.push('/import/profile-builder')
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Something went wrong')
      setProfileStep('error')
    }
  }

  if (!visible) return null

  return (
    <div className="join-modal__overlay" role="dialog" aria-modal="true" aria-labelledby="join-modal-title">
      <div className="join-modal__card">
        <button className="join-modal__close" onClick={handleDismiss} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="join-modal__paths">
          {/* Share Art — project import */}
          <div className="join-modal__path join-modal__path--share">
            <h2>Share Art</h2>
            <p>Import your project in seconds.</p>
            {projectStep === 'idle' || projectStep === 'error' ? (
              <div className="join-modal__import">
                <input
                  type="url"
                  value={projectUrl}
                  onChange={(e) => setProjectUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleProjectImport()}
                  placeholder="https://yourproject.com"
                  className="join-modal__import-input"
                />
                <button
                  onClick={handleProjectImport}
                  disabled={!projectUrl.trim()}
                  className="join-modal__import-btn join-modal__import-btn--teal"
                >
                  Import
                </button>
                {projectStep === 'error' && (
                  <p className="join-modal__import-error">{projectError}</p>
                )}
              </div>
            ) : (
              <div className="join-modal__import-loading">
                <div className="dashboard-spinner" style={{ width: 20, height: 20 }} />
                <span>Importing...</span>
              </div>
            )}
          </div>

          {/* Help Build Art — profile import */}
          <div className="join-modal__path join-modal__path--help">
            <h2>Help Build Art</h2>
            <p>Import your portfolio and join as a collaborator.</p>
            {profileStep === 'idle' || profileStep === 'error' ? (
              <div className="join-modal__import">
                <input
                  type="url"
                  value={profileUrl}
                  onChange={(e) => setProfileUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleProfileImport()}
                  placeholder="https://yoursite.com/about"
                  className="join-modal__import-input"
                />
                <button
                  onClick={handleProfileImport}
                  disabled={!profileUrl.trim()}
                  className="join-modal__import-btn join-modal__import-btn--gold"
                >
                  Import
                </button>
                {profileStep === 'error' && (
                  <p className="join-modal__import-error">{profileError}</p>
                )}
              </div>
            ) : (
              <div className="join-modal__import-loading">
                <div className="dashboard-spinner" style={{ width: 20, height: 20 }} />
                <span>Importing...</span>
              </div>
            )}
          </div>
        </div>

        <p className="join-modal__signin">
          Already a member?{' '}
          <Link href="/login" onClick={handleDismiss}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
