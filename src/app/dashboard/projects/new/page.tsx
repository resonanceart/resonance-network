'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NewProjectPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard/projects/live-edit')
  }, [router])

  return (
    <div className="container dashboard-loading">
      <div className="dashboard-spinner" aria-label="Redirecting" />
    </div>
  )
}
