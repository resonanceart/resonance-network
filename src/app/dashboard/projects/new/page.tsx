'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { ProjectSubmissionForm } from '@/components/ProjectSubmissionForm'
import Link from 'next/link'

export default function NewProjectPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<{ display_name: string; email: string; website?: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login')
      return
    }

    fetch('/api/user/profile')
      .then(res => res.json())
      .then(data => {
        if (data.profile) {
          setProfile({
            display_name: data.profile.display_name,
            email: data.profile.email,
            website: data.profile.website,
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="container dashboard-loading">
        <div className="dashboard-spinner" aria-label="Loading" />
      </div>
    )
  }

  if (!user || !profile) return null

  return (
    <div className="container" style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-10)', maxWidth: '800px' }}>
      <Link href="/dashboard/projects" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontSize: 'var(--text-sm)' }}>
        ← Back to My Projects
      </Link>
      <h1 style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>Submit New Project</h1>
      <ProjectSubmissionForm
        mode="authenticated"
        userProfile={{ name: profile.display_name, email: profile.email, website: profile.website }}
        onSuccess={() => router.push('/dashboard/projects')}
      />
    </div>
  )
}
