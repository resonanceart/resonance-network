'use client'

import { useState, useEffect, useCallback } from 'react'

interface ProfileSettingsPanelProps {
  isOpen: boolean
  onClose: () => void
  profileSlug: string
  initialData: {
    displayName: string
    title: string
    pronouns: string
    location: string
    locationSecondary: string
    availabilityStatus: string
    availabilityNote: string
    availabilityTypes: string[]
    ctaPrimaryLabel: string
    ctaPrimaryAction: string
    ctaPrimaryUrl: string
    ctaSecondaryLabel: string
    ctaSecondaryAction: string
    ctaSecondaryUrl: string
    socialLinks: Array<{ id: string; platform: string; url: string; display_order: number }>
    sectionOrder: string[]
    sectionVisibility: Record<string, boolean>
    slug: string
    bioExcerpt: string
  }
  onSave: (data: Record<string, unknown>) => void
}

const PRONOUN_OPTIONS = ['he/him', 'she/her', 'they/them', 'he/they', 'she/they', 'any pronouns', 'custom']
const AVAILABILITY_STATUS_OPTIONS = [
  { value: 'open', label: 'Open to opportunities' },
  { value: 'selective', label: 'Selective' },
  { value: 'focused', label: 'Focused on current work' },
]
const AVAILABILITY_TYPE_OPTIONS = ['Freelance', 'Full-time', 'Contract', 'Residency', 'Mentorship', 'Volunteer', 'Commission']
const CTA_ACTION_OPTIONS = [
  { value: 'contact', label: 'Contact Form' },
  { value: 'url', label: 'External URL' },
  { value: 'booking', label: 'Booking Link' },
]
const SOCIAL_PLATFORMS = [
  'instagram', 'linkedin', 'behance', 'artstation', 'dribbble', 'github',
  'vimeo', 'soundcloud', 'spotify', 'youtube', 'x', 'tiktok',
]
const DEFAULT_SECTIONS = ['Skills', 'Tools', 'Portfolio', 'Gallery', 'About', 'Timeline', 'Projects', 'Achievements', 'Links']

const SECTION_LABELS: Record<string, string> = {
  portfolio: 'Work',
  projects: 'Work (Legacy)',
}

function makeId() {
  return crypto.randomUUID?.() ?? Math.random().toString(36).substr(2, 9)
}

export default function ProfileSettingsPanel({ isOpen, onClose, profileSlug, initialData, onSave }: ProfileSettingsPanelProps) {
  // Form state
  const [displayName, setDisplayName] = useState(initialData.displayName)
  const [title, setTitle] = useState(initialData.title)
  const [pronouns, setPronouns] = useState(initialData.pronouns)
  const [customPronouns, setCustomPronouns] = useState('')
  const [locationPrimary, setLocationPrimary] = useState(initialData.location)
  const [locationSecondary, setLocationSecondary] = useState(initialData.locationSecondary)

  const [availabilityStatus, setAvailabilityStatus] = useState(initialData.availabilityStatus)
  const [availabilityNote, setAvailabilityNote] = useState(initialData.availabilityNote)
  const [availabilityTypes, setAvailabilityTypes] = useState<string[]>(initialData.availabilityTypes)

  const [ctaPrimaryLabel, setCtaPrimaryLabel] = useState(initialData.ctaPrimaryLabel)
  const [ctaPrimaryAction, setCtaPrimaryAction] = useState(initialData.ctaPrimaryAction)
  const [ctaPrimaryUrl, setCtaPrimaryUrl] = useState(initialData.ctaPrimaryUrl)
  const [ctaSecondaryLabel, setCtaSecondaryLabel] = useState(initialData.ctaSecondaryLabel)
  const [ctaSecondaryAction, setCtaSecondaryAction] = useState(initialData.ctaSecondaryAction)
  const [ctaSecondaryUrl, setCtaSecondaryUrl] = useState(initialData.ctaSecondaryUrl)

  const [socialLinks, setSocialLinks] = useState<Array<{ id: string; platform: string; url: string; display_order: number }>>(initialData.socialLinks)

  const [sectionOrder, setSectionOrder] = useState<string[]>(
    initialData.sectionOrder.length > 0 ? initialData.sectionOrder : DEFAULT_SECTIONS.map(s => s.toLowerCase())
  )
  const [sectionVisibility, setSectionVisibility] = useState<Record<string, boolean>>(initialData.sectionVisibility)

  const [slug, setSlug] = useState(initialData.slug || profileSlug)
  const [bioExcerpt, setBioExcerpt] = useState(initialData.bioExcerpt)

  // Accordion state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ identity: true })

  const [saving, setSaving] = useState(false)

  // Sync from initialData when panel opens
  useEffect(() => {
    if (isOpen) {
      setDisplayName(initialData.displayName)
      setTitle(initialData.title)
      setPronouns(initialData.pronouns)
      setLocationPrimary(initialData.location)
      setLocationSecondary(initialData.locationSecondary)
      setAvailabilityStatus(initialData.availabilityStatus)
      setAvailabilityNote(initialData.availabilityNote)
      setAvailabilityTypes(initialData.availabilityTypes)
      setCtaPrimaryLabel(initialData.ctaPrimaryLabel)
      setCtaPrimaryAction(initialData.ctaPrimaryAction)
      setCtaPrimaryUrl(initialData.ctaPrimaryUrl)
      setCtaSecondaryLabel(initialData.ctaSecondaryLabel)
      setCtaSecondaryAction(initialData.ctaSecondaryAction)
      setCtaSecondaryUrl(initialData.ctaSecondaryUrl)
      setSocialLinks(initialData.socialLinks)
      setSectionOrder(initialData.sectionOrder.length > 0 ? initialData.sectionOrder : DEFAULT_SECTIONS.map(s => s.toLowerCase()))
      setSectionVisibility(initialData.sectionVisibility)
      setSlug(initialData.slug || profileSlug)
      setBioExcerpt(initialData.bioExcerpt)
      // Determine if pronouns are custom
      const isCustom = initialData.pronouns && !PRONOUN_OPTIONS.slice(0, -1).includes(initialData.pronouns)
      if (isCustom && initialData.pronouns) {
        setCustomPronouns(initialData.pronouns)
        setPronouns('custom')
      } else {
        setCustomPronouns('')
      }
    }
  }, [isOpen, initialData, profileSlug])

  // Close on Esc
  useEffect(() => {
    if (!isOpen) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const toggleSection = useCallback((key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }))
  }, [])

  function toggleAvailabilityType(type: string) {
    setAvailabilityTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  function addSocialLink() {
    setSocialLinks(prev => [
      ...prev,
      { id: makeId(), platform: 'instagram', url: '', display_order: prev.length },
    ])
  }

  function removeSocialLink(id: string) {
    setSocialLinks(prev => prev.filter(l => l.id !== id).map((l, i) => ({ ...l, display_order: i })))
  }

  function updateSocialLink(id: string, field: 'platform' | 'url', value: string) {
    setSocialLinks(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l))
  }

  function moveSocialLink(id: string, direction: 'up' | 'down') {
    setSocialLinks(prev => {
      const idx = prev.findIndex(l => l.id === id)
      if (idx < 0) return prev
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1
      if (targetIdx < 0 || targetIdx >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[targetIdx]] = [next[targetIdx], next[idx]]
      return next.map((l, i) => ({ ...l, display_order: i }))
    })
  }

  function toggleSectionVisibility(section: string) {
    setSectionVisibility(prev => ({ ...prev, [section]: !prev[section] }))
  }

  function moveSectionItem(section: string, direction: 'up' | 'down') {
    setSectionOrder(prev => {
      const idx = prev.indexOf(section)
      if (idx < 0) return prev
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1
      if (targetIdx < 0 || targetIdx >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[targetIdx]] = [next[targetIdx], next[idx]]
      return next
    })
  }

  function validateSlug(value: string) {
    return value.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/--+/g, '-')
  }

  async function handleSave() {
    setSaving(true)
    const resolvedPronouns = pronouns === 'custom' ? customPronouns : pronouns
    const data: Record<string, unknown> = {
      displayName,
      title,
      pronouns: resolvedPronouns,
      location: locationPrimary,
      locationSecondary,
      availabilityStatus,
      availabilityNote,
      availabilityTypes,
      ctaPrimaryLabel,
      ctaPrimaryAction,
      ctaPrimaryUrl,
      ctaSecondaryLabel,
      ctaSecondaryAction,
      ctaSecondaryUrl,
      socialLinks,
      sectionOrder,
      sectionVisibility,
      slug,
      bioExcerpt,
    }
    onSave(data)
    setSaving(false)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="settings-panel__overlay" onClick={onClose} />

      {/* Panel */}
      <div className="settings-panel">
        {/* Header */}
        <div className="settings-panel__header">
          <h2 style={{ margin: 0, fontSize: 'var(--text-lg)' }}>Profile Settings</h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              fontSize: '24px',
              lineHeight: 1,
              padding: '4px',
            }}
            aria-label="Close settings"
          >
            &times;
          </button>
        </div>

        {/* Scrollable content */}
        <div className="settings-panel__content">

          {/* === Identity === */}
          <div className="settings-panel__section">
            <button
              type="button"
              className="settings-panel__section-header"
              onClick={() => toggleSection('identity')}
            >
              <span>Identity</span>
              <span>{openSections.identity ? '\u25B2' : '\u25BC'}</span>
            </button>
            {openSections.identity && (
              <div className="settings-panel__section-body">
                <div className="settings-panel__field">
                  <label className="form-label">Display Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    maxLength={200}
                  />
                </div>
                <div className="settings-panel__field">
                  <label className="form-label">Professional Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Light Artist, Sound Designer"
                    maxLength={200}
                  />
                </div>
                <div className="settings-panel__field">
                  <label className="form-label">Pronouns</label>
                  <select
                    className="form-input"
                    value={PRONOUN_OPTIONS.slice(0, -1).includes(pronouns) ? pronouns : (pronouns ? 'custom' : '')}
                    onChange={e => {
                      setPronouns(e.target.value)
                      if (e.target.value !== 'custom') setCustomPronouns('')
                    }}
                  >
                    <option value="">Select pronouns</option>
                    {PRONOUN_OPTIONS.map(p => (
                      <option key={p} value={p}>{p === 'custom' ? 'Custom...' : p}</option>
                    ))}
                  </select>
                  {(pronouns === 'custom') && (
                    <input
                      type="text"
                      className="form-input"
                      value={customPronouns}
                      onChange={e => setCustomPronouns(e.target.value)}
                      placeholder="Enter your pronouns"
                      style={{ marginTop: 'var(--space-2)' }}
                      maxLength={50}
                    />
                  )}
                </div>
                <div className="settings-panel__field">
                  <label className="form-label">Location Primary</label>
                  <input
                    type="text"
                    className="form-input"
                    value={locationPrimary}
                    onChange={e => setLocationPrimary(e.target.value)}
                    placeholder="City, region, or remote"
                    maxLength={200}
                  />
                </div>
                <div className="settings-panel__field">
                  <label className="form-label">Location Secondary</label>
                  <input
                    type="text"
                    className="form-input"
                    value={locationSecondary}
                    onChange={e => setLocationSecondary(e.target.value)}
                    placeholder="Second city or region"
                    maxLength={200}
                  />
                </div>
              </div>
            )}
          </div>

          {/* === Availability === */}
          <div className="settings-panel__section">
            <button
              type="button"
              className="settings-panel__section-header"
              onClick={() => toggleSection('availability')}
            >
              <span>Availability</span>
              <span>{openSections.availability ? '\u25B2' : '\u25BC'}</span>
            </button>
            {openSections.availability && (
              <div className="settings-panel__section-body">
                <div className="settings-panel__field">
                  <label className="form-label">Status</label>
                  <select
                    className="form-input"
                    value={availabilityStatus}
                    onChange={e => setAvailabilityStatus(e.target.value)}
                  >
                    {AVAILABILITY_STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="settings-panel__field">
                  <label className="form-label">Detail</label>
                  <input
                    type="text"
                    className="form-input"
                    value={availabilityNote}
                    onChange={e => { if (e.target.value.length <= 200) setAvailabilityNote(e.target.value) }}
                    placeholder="Brief note about your availability"
                    maxLength={200}
                  />
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{availabilityNote.length}/200</span>
                </div>
                <div className="settings-panel__field">
                  <label className="form-label">Types</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                    {AVAILABILITY_TYPE_OPTIONS.map(type => (
                      <label
                        key={type}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: 'var(--text-sm)',
                          cursor: 'pointer',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          background: availabilityTypes.includes(type) ? 'rgba(20,184,166,0.15)' : 'transparent',
                          border: '1px solid',
                          borderColor: availabilityTypes.includes(type) ? 'var(--color-accent)' : 'var(--color-border)',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={availabilityTypes.includes(type)}
                          onChange={() => toggleAvailabilityType(type)}
                          style={{ display: 'none' }}
                        />
                        {type}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* === CTAs === */}
          <div className="settings-panel__section">
            <button
              type="button"
              className="settings-panel__section-header"
              onClick={() => toggleSection('ctas')}
            >
              <span>Call to Action</span>
              <span>{openSections.ctas ? '\u25B2' : '\u25BC'}</span>
            </button>
            {openSections.ctas && (
              <div className="settings-panel__section-body">
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)', marginTop: 0 }}>
                  Primary CTA
                </p>
                <div className="settings-panel__field">
                  <label className="form-label">Label</label>
                  <input
                    type="text"
                    className="form-input"
                    value={ctaPrimaryLabel}
                    onChange={e => setCtaPrimaryLabel(e.target.value)}
                    placeholder="Get in Touch"
                    maxLength={50}
                  />
                </div>
                <div className="settings-panel__field">
                  <label className="form-label">Action</label>
                  <select
                    className="form-input"
                    value={ctaPrimaryAction}
                    onChange={e => setCtaPrimaryAction(e.target.value)}
                  >
                    {CTA_ACTION_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                {(ctaPrimaryAction === 'url' || ctaPrimaryAction === 'booking') && (
                  <div className="settings-panel__field">
                    <label className="form-label">URL</label>
                    <input
                      type="url"
                      className="form-input"
                      value={ctaPrimaryUrl}
                      onChange={e => setCtaPrimaryUrl(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                )}

                <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 'var(--space-4) 0' }} />

                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)', marginTop: 0 }}>
                  Secondary CTA
                </p>
                <div className="settings-panel__field">
                  <label className="form-label">Label</label>
                  <input
                    type="text"
                    className="form-input"
                    value={ctaSecondaryLabel}
                    onChange={e => setCtaSecondaryLabel(e.target.value)}
                    placeholder="View Work"
                    maxLength={50}
                  />
                </div>
                <div className="settings-panel__field">
                  <label className="form-label">Action</label>
                  <select
                    className="form-input"
                    value={ctaSecondaryAction}
                    onChange={e => setCtaSecondaryAction(e.target.value)}
                  >
                    {CTA_ACTION_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                {(ctaSecondaryAction === 'url' || ctaSecondaryAction === 'booking') && (
                  <div className="settings-panel__field">
                    <label className="form-label">URL</label>
                    <input
                      type="url"
                      className="form-input"
                      value={ctaSecondaryUrl}
                      onChange={e => setCtaSecondaryUrl(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* === Social Links === */}
          <div className="settings-panel__section">
            <button
              type="button"
              className="settings-panel__section-header"
              onClick={() => toggleSection('social')}
            >
              <span>Social Links</span>
              <span>{openSections.social ? '\u25B2' : '\u25BC'}</span>
            </button>
            {openSections.social && (
              <div className="settings-panel__section-body">
                {socialLinks.map((link, idx) => (
                  <div key={link.id} className="settings-panel__social-entry">
                    <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flex: 1 }}>
                      <select
                        className="form-input"
                        value={link.platform}
                        onChange={e => updateSocialLink(link.id, 'platform', e.target.value)}
                        style={{ width: '130px', flexShrink: 0 }}
                      >
                        {SOCIAL_PLATFORMS.map(p => (
                          <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                        ))}
                      </select>
                      <input
                        type="url"
                        className="form-input"
                        value={link.url}
                        onChange={e => updateSocialLink(link.id, 'url', e.target.value)}
                        placeholder="https://..."
                        style={{ flex: 1 }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => moveSocialLink(link.id, 'up')}
                        disabled={idx === 0}
                        className="block-list-item__action"
                        title="Move up"
                      >
                        &#9650;
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSocialLink(link.id, 'down')}
                        disabled={idx === socialLinks.length - 1}
                        className="block-list-item__action"
                        title="Move down"
                      >
                        &#9660;
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSocialLink(link.id)}
                        className="block-list-item__action block-list-item__action--danger"
                        title="Remove"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={addSocialLink}
                  style={{ fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}
                >
                  + Add Link
                </button>
              </div>
            )}
          </div>

          {/* === Sections === */}
          <div className="settings-panel__section">
            <button
              type="button"
              className="settings-panel__section-header"
              onClick={() => toggleSection('sections')}
            >
              <span>Sections</span>
              <span>{openSections.sections ? '\u25B2' : '\u25BC'}</span>
            </button>
            {openSections.sections && (
              <div className="settings-panel__section-body">
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 0, marginBottom: 'var(--space-3)' }}>
                  Toggle visibility and reorder the sections on your profile.
                </p>
                {sectionOrder.map((section, idx) => (
                  <div key={section} className="settings-panel__section-item">
                    <label className="settings-panel__switch">
                      <input
                        type="checkbox"
                        checked={sectionVisibility[section] !== false}
                        onChange={() => toggleSectionVisibility(section)}
                      />
                      <span className="settings-panel__switch-track" />
                    </label>
                    <span style={{ flex: 1, fontSize: 'var(--text-sm)', textTransform: 'capitalize' }}>
                      {SECTION_LABELS[section] || section}
                    </span>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      <button
                        type="button"
                        onClick={() => moveSectionItem(section, 'up')}
                        disabled={idx === 0}
                        className="block-list-item__action"
                        title="Move up"
                      >
                        &#9650;
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSectionItem(section, 'down')}
                        disabled={idx === sectionOrder.length - 1}
                        className="block-list-item__action"
                        title="Move down"
                      >
                        &#9660;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* === SEO === */}
          <div className="settings-panel__section">
            <button
              type="button"
              className="settings-panel__section-header"
              onClick={() => toggleSection('seo')}
            >
              <span>SEO</span>
              <span>{openSections.seo ? '\u25B2' : '\u25BC'}</span>
            </button>
            {openSections.seo && (
              <div className="settings-panel__section-body">
                <div className="settings-panel__field">
                  <label className="form-label">Custom Slug</label>
                  <input
                    type="text"
                    className="form-input"
                    value={slug}
                    onChange={e => setSlug(validateSlug(e.target.value))}
                    placeholder="your-name"
                    maxLength={100}
                  />
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '4px', display: 'block' }}>
                    Preview: /profiles/{slug || 'your-name'}
                  </span>
                </div>
                <div className="settings-panel__field">
                  <label className="form-label">Bio Excerpt</label>
                  <textarea
                    className="form-textarea"
                    value={bioExcerpt}
                    onChange={e => { if (e.target.value.length <= 160) setBioExcerpt(e.target.value) }}
                    placeholder="Short description for search engines"
                    rows={3}
                    maxLength={160}
                  />
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{bioExcerpt.length}/160</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="settings-panel__footer">
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleSave}
            disabled={saving}
            style={{ width: '100%' }}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </>
  )
}
