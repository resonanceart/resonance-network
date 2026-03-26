'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { ProjectSubmissionForm } from '@/components/ProjectSubmissionForm'
import Link from 'next/link'

export default function EditProjectPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

  const [profile, setProfile] = useState<{ display_name: string; email: string; website?: string } | null>(null)
  const [projectData, setProjectData] = useState<Record<string, unknown> | null>(null)
  const [projectStatus, setProjectStatus] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login')
      return
    }

    Promise.all([
      fetch('/api/user/profile').then(r => r.json()),
      fetch('/api/user/projects').then(r => r.json()),
    ])
      .then(([profileData, projectsData]) => {
        if (profileData.profile) {
          setProfile({
            display_name: profileData.profile.display_name,
            email: profileData.profile.email,
            website: profileData.profile.website,
          })
        }

        const projects = projectsData.projects || []
        const project = projects.find((p: any) => p.id === projectId)
        if (project) {
          setProjectStatus(project.status || '')
          setProjectData({
            projectTitle: project.project_title || '',
            oneSentence: project.one_sentence || '',
            vision: project.vision || '',
            experience: project.experience || '',
            story: project.story || '',
            goals: project.goals || '',
            domains: project.domains || [],
            pathways: project.pathways || [],
            stage: project.stage || '',
            scale: project.scale || '',
            location: project.location || '',
            materials: project.materials || '',
            specialNeeds: project.special_needs || '',
            collaborationNeeds: project.collaboration_needs || '',
            collaborationRoleCount: project.collaboration_role_count?.toString() || '',
          })
        } else {
          setError('Project not found.')
        }
      })
      .catch(() => setError('Failed to load project data.'))
      .finally(() => setLoading(false))
  }, [user, authLoading, router, projectId])

  if (authLoading || loading) {
    return (
      <div className="container dashboard-loading">
        <div className="dashboard-spinner" aria-label="Loading" />
      </div>
    )
  }

  if (!user || !profile) return null

  if (error) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-error, #ef4444)', marginBottom: 'var(--space-4)' }}>{error}</p>
        <Link href="/dashboard/projects" className="btn btn--outline">Back to My Projects</Link>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-10)', maxWidth: '800px' }}>
      <Link href="/dashboard/projects" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontSize: 'var(--text-sm)' }}>
        ← Back to My Projects
      </Link>
      <h1 style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>Edit Project</h1>

      {projectStatus === 'approved' && (
        <div
          style={{
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: '8px',
            marginBottom: 'var(--space-4)',
            background: 'rgba(245, 158, 11, 0.1)',
            color: '#f59e0b',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            fontSize: 'var(--text-sm)',
          }}
        >
          This project is currently approved and live. Editing it will require re-review before changes appear publicly.
        </div>
      )}

      {projectData && (
        <ProjectSubmissionForm
          mode="authenticated"
          submissionId={projectId}
          initialData={projectData}
          userProfile={{ name: profile.display_name, email: profile.email, website: profile.website }}
          onSuccess={() => router.push('/dashboard/projects')}
        />
      )}
    </div>
  )
}
