'use client'

import { useState } from 'react'

const COLLABORATOR_TYPES = [
  'Structural Engineer', 'Electrical Engineer', 'Software Engineer',
  'Architect', 'Lighting Designer', 'Sound Designer',
  'Industrial Designer', 'Graphic Designer', 'Fabricator',
  'Builder', 'Project Manager', 'Welder',
  'Sculptor', 'Rigger', 'AV Technician',
]

const GOALS = [
  { id: 'fund', label: 'Fund a project', icon: '💰' },
  { id: 'collaborators', label: 'Find collaborators', icon: '🤝' },
  { id: 'exposure', label: 'Get more exposure', icon: '📡' },
  { id: 'residency', label: 'Join a residency or festival', icon: '🏛' },
  { id: 'exhibit', label: 'Exhibit or install work', icon: '🎨' },
  { id: 'network', label: 'Build my network', icon: '🌐' },
  { id: 'income', label: 'Earn income from my practice', icon: '📈' },
  { id: 'learn', label: 'Learn new skills', icon: '📚' },
]

const FIELDS = [
  'Immersive Art', 'Installation', 'Sculpture', 'Architecture', 'Sound Design', 'Lighting Design',
  'Digital Art', 'Performance', 'Sustainability', 'Fabrication', 'Engineering',
  'Public Art', 'Community Art', 'Dance', 'Music', 'Film', 'Photography',
  'Textiles', 'Ceramics', 'Mixed Media', 'Kinetic Art', 'Interactive',
]

interface OnboardingWizardProps {
  onComplete: () => void
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(1)
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set())
  const [collaboratorType, setCollaboratorType] = useState<string>('')
  const [customCollabType, setCustomCollabType] = useState('')
  const [selectedGoals, setSelectedGoals] = useState<Set<string>>(new Set())
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const totalSteps = 5

  function toggleGoal(id: string) {
    setSelectedGoals(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleField(f: string) {
    setSelectedFields(prev => {
      const next = new Set(prev)
      if (next.has(f)) next.delete(f)
      else next.add(f)
      return next
    })
  }

  function selectAllFields() {
    if (selectedFields.size === FIELDS.length) {
      setSelectedFields(new Set())
    } else {
      setSelectedFields(new Set(FIELDS))
    }
  }

  function toggleRole(id: string) {
    setSelectedRoles(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function canProceed(): boolean {
    if (step === 1) return selectedRoles.size > 0 && (!selectedRoles.has('collaborator') || !!collaboratorType)
    if (step === 2) return true // Import step — always optional
    if (step === 3) return selectedGoals.size > 0
    if (step === 4) return selectedFields.size > 0
    return true
  }

  async function handleComplete() {
    setSaving(true)
    setError('')
    try {
      const finalCollabType = collaboratorType === 'Other' ? customCollabType.trim() || 'Other' : collaboratorType
      const roles = Array.from(selectedRoles)
      // Default to 'artist' if user skipped role selection
      const roleType = roles.length > 0 ? roles.join(',') : 'artist'
      const res = await fetch('/api/user/onboarding', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role_type: roleType,
          collaborator_type: selectedRoles.has('collaborator') ? finalCollabType : undefined,
          goals: Array.from(selectedGoals),
          fields_of_interest: Array.from(selectedFields),
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        console.error('Onboarding save failed:', data.error || res.status)
      }
      onComplete()
    } catch {
      // Network error — still try to proceed so user isn't stuck
      console.error('Onboarding network error, proceeding anyway')
      onComplete()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="onboarding__overlay">
      <div className="onboarding__card">
        {/* Progress bar */}
        <div className="onboarding__progress">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} className={`onboarding__progress-dot${i + 1 <= step ? ' onboarding__progress-dot--active' : ''}`} />
          ))}
        </div>

        {/* Step 1: Role Type */}
        {step === 1 && (
          <div className="onboarding__step">
            <h2 className="onboarding__title">Let&apos;s get you started</h2>
            <p className="onboarding__subtitle">Define your role — select all that apply</p>

            <div className="onboarding__role-grid">
              {[
                { id: 'artist', label: 'Artist', desc: 'I create and lead projects' },
                { id: 'curator', label: 'Curator', desc: 'I organize and present work' },
                { id: 'collaborator', label: 'Collaborator', desc: 'I contribute skills to projects' },
              ].map(role => (
                <button
                  key={role.id}
                  className={`onboarding__role-card${selectedRoles.has(role.id) ? ' onboarding__role-card--selected' : ''}`}
                  onClick={() => toggleRole(role.id)}
                >
                  <span className="onboarding__role-label">{role.label}</span>
                  <span className="onboarding__role-desc">{role.desc}</span>
                </button>
              ))}
            </div>

            {selectedRoles.has('collaborator') && (
              <div className="onboarding__collab-section">
                <p className="onboarding__collab-prompt">What type of collaborator are you?</p>
                <div className="onboarding__collab-grid">
                  {COLLABORATOR_TYPES.map(t => (
                    <button
                      key={t}
                      className={`onboarding__collab-pill${collaboratorType === t ? ' onboarding__collab-pill--selected' : ''}`}
                      onClick={() => setCollaboratorType(t)}
                    >
                      {t}
                    </button>
                  ))}
                  <button
                    className={`onboarding__collab-pill${collaboratorType === 'Other' ? ' onboarding__collab-pill--selected' : ''}`}
                    onClick={() => setCollaboratorType('Other')}
                  >
                    Other
                  </button>
                </div>
                {collaboratorType === 'Other' && (
                  <input
                    type="text"
                    value={customCollabType}
                    onChange={e => setCustomCollabType(e.target.value)}
                    placeholder="Describe your specialty..."
                    className="onboarding__input"
                    autoFocus
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Import existing content */}
        {step === 2 && (
          <div className="onboarding__step">
            <h2 className="onboarding__title">Have an existing website or portfolio?</h2>
            <p className="onboarding__subtitle">We can import your content to pre-build your profile — saving you time.</p>

            <div className="onboarding__role-grid" style={{ marginTop: 'var(--space-6)' }}>
              <a
                href={selectedRoles.has('artist') || selectedRoles.has('curator') ? '/import' : '/import?mode=profile'}
                className="onboarding__role-card"
                style={{ textDecoration: 'none', cursor: 'pointer' }}
              >
                <span className="onboarding__role-label">Import from Website</span>
                <span className="onboarding__role-desc">Paste a URL and we&apos;ll pull in your content automatically</span>
              </a>
              <button
                className="onboarding__role-card"
                onClick={() => setStep(3)}
              >
                <span className="onboarding__role-label">Start Fresh</span>
                <span className="onboarding__role-desc">I&apos;ll build my profile from scratch</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Goals */}
        {step === 3 && (
          <div className="onboarding__step">
            <h2 className="onboarding__title">Let&apos;s define some goals</h2>
            <p className="onboarding__subtitle">What would you like to achieve? Select all that apply.</p>

            <div className="onboarding__goals-grid">
              {GOALS.map(goal => (
                <button
                  key={goal.id}
                  className={`onboarding__goal-card${selectedGoals.has(goal.id) ? ' onboarding__goal-card--selected' : ''}`}
                  onClick={() => toggleGoal(goal.id)}
                >
                  <span className="onboarding__goal-icon">{goal.icon}</span>
                  <span className="onboarding__goal-label">{goal.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Fields of Interest */}
        {step === 4 && (
          <div className="onboarding__step">
            <h2 className="onboarding__title">Which fields are you interested in?</h2>
            <p className="onboarding__subtitle">Select all that apply.</p>

            <div className="onboarding__fields-header">
              <button className="onboarding__select-all" onClick={selectAllFields}>
                {selectedFields.size === FIELDS.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="onboarding__fields-grid">
              {FIELDS.map(f => (
                <button
                  key={f}
                  className={`onboarding__field-pill${selectedFields.has(f) ? ' onboarding__field-pill--selected' : ''}`}
                  onClick={() => toggleField(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Complete */}
        {step === 5 && (
          <div className="onboarding__step onboarding__step--complete">
            <div className="onboarding__check-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h2 className="onboarding__title">You&apos;re all set!</h2>
            <p className="onboarding__subtitle">Welcome to Resonance Network.</p>

            <div className="onboarding__summary">
              <div className="onboarding__summary-row">
                <span className="onboarding__summary-label">Role</span>
                <span className="onboarding__summary-value">
                  {Array.from(selectedRoles).map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(', ')}
                  {collaboratorType && ` — ${collaboratorType === 'Other' ? customCollabType || 'Other' : collaboratorType}`}
                </span>
              </div>
              {selectedGoals.size > 0 && (
                <div className="onboarding__summary-row">
                  <span className="onboarding__summary-label">Goals</span>
                  <span className="onboarding__summary-value">
                    {GOALS.filter(g => selectedGoals.has(g.id)).map(g => g.label).join(', ')}
                  </span>
                </div>
              )}
              {selectedFields.size > 0 && (
                <div className="onboarding__summary-row">
                  <span className="onboarding__summary-label">Interests</span>
                  <span className="onboarding__summary-value">{Array.from(selectedFields).join(', ')}</span>
                </div>
              )}
            </div>

            {error && <p className="onboarding__error">{error}</p>}
          </div>
        )}

        {/* Navigation */}
        <div className="onboarding__nav">
          {step > 1 && step < 5 && step !== 2 && (
            <button className="btn btn--ghost" onClick={() => setStep(s => s === 3 ? 2 : s - 1)}>
              Back
            </button>
          )}
          <div style={{ flex: 1 }} />
          {step < 5 && step !== 2 && (
            <button
              className="btn btn--primary"
              disabled={!canProceed()}
              onClick={() => setStep(s => s + 1)}
            >
              Next
            </button>
          )}
          {step === 5 && (
            <button
              className="btn btn--primary btn--large"
              onClick={handleComplete}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Go to Dashboard'}
            </button>
          )}
        </div>

        {/* Skip link */}
        {step < 5 && (
          <button
            className="onboarding__skip"
            onClick={() => setStep(5)}
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  )
}
