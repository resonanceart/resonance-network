'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { OnboardingWizard } from '@/components/OnboardingWizard'

export function OnboardingCheck() {
  const { user, loading } = useAuth()
  const [showWizard, setShowWizard] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (loading || !user || checked) return

    fetch('/api/user/onboarding', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.onboarding_completed === false) {
          setShowWizard(true)
        }
      })
      .catch(() => {})
      .finally(() => setChecked(true))
  }, [user, loading, checked])

  if (!showWizard) return null

  return <OnboardingWizard onComplete={() => setShowWizard(false)} />
}
