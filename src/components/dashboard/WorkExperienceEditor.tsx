'use client'

import { useState } from 'react'
import type { WorkExperience } from '@/types'

interface WorkExperienceEditorProps {
  entries: WorkExperience[]
  onChange: (entries: WorkExperience[]) => void
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function generateId() {
  return crypto.randomUUID?.() ?? Math.random().toString(36).substr(2, 12)
}

function formatDateRange(start?: string, end?: string, isCurrent?: boolean): string {
  const fmt = (d: string) => {
    const date = new Date(d + 'T00:00:00')
    return `${MONTHS[date.getMonth()]?.slice(0, 3)} ${date.getFullYear()}`
  }
  const startStr = start ? fmt(start) : ''
  const endStr = isCurrent ? 'Present' : end ? fmt(end) : ''
  if (startStr && endStr) return `${startStr} — ${endStr}`
  if (startStr) return startStr
  return ''
}

function getYearRange(): number[] {
  const currentYear = new Date().getFullYear()
  const years: number[] = []
  for (let y = currentYear; y >= currentYear - 50; y--) years.push(y)
  return years
}

function parseDateParts(dateStr?: string): { month: string; year: string } {
  if (!dateStr) return { month: '', year: '' }
  const d = new Date(dateStr + 'T00:00:00')
  return {
    month: String(d.getMonth() + 1),
    year: String(d.getFullYear()),
  }
}

function buildDateStr(month: string, year: string): string | undefined {
  if (!month || !year) return undefined
  return `${year}-${month.padStart(2, '0')}-01`
}

interface EntryFormData {
  title: string
  organization: string
  location: string
  startMonth: string
  startYear: string
  endMonth: string
  endYear: string
  isCurrent: boolean
  description: string
}

const emptyForm: EntryFormData = {
  title: '',
  organization: '',
  location: '',
  startMonth: '',
  startYear: '',
  endMonth: '',
  endYear: '',
  isCurrent: false,
  description: '',
}

function entryToForm(entry: WorkExperience): EntryFormData {
  const start = parseDateParts(entry.start_date)
  const end = parseDateParts(entry.end_date)
  return {
    title: entry.title,
    organization: entry.organization || '',
    location: entry.location || '',
    startMonth: start.month,
    startYear: start.year,
    endMonth: end.month,
    endYear: end.year,
    isCurrent: entry.is_current,
    description: entry.description || '',
  }
}

function InlineForm({
  form,
  setForm,
  onSave,
  onCancel,
  type,
}: {
  form: EntryFormData
  setForm: (f: EntryFormData) => void
  onSave: () => void
  onCancel: () => void
  type: 'employment' | 'freelance' | 'education'
}) {
  const years = getYearRange()
  const isWork = type !== 'education'

  return (
    <div className="we-inline-form">
      <div className="form-group">
        <label className="form-label">{isWork ? 'Job Title' : 'Degree / Program'} *</label>
        <input
          type="text"
          className="form-input"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          placeholder={isWork ? 'e.g. Senior Designer' : 'e.g. MFA Interactive Media'}
          maxLength={200}
        />
      </div>

      <div className="form-group">
        <label className="form-label">{isWork ? 'Company' : 'School / Institution'}</label>
        <input
          type="text"
          className="form-input"
          value={form.organization}
          onChange={e => setForm({ ...form, organization: e.target.value })}
          placeholder={isWork ? 'e.g. Studio Drift' : 'e.g. Parsons School of Design'}
          maxLength={200}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Location</label>
        <input
          type="text"
          className="form-input"
          value={form.location}
          onChange={e => setForm({ ...form, location: e.target.value })}
          placeholder="e.g. New York, NY"
          maxLength={200}
        />
      </div>

      <div className="we-date-row">
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Start Date</label>
          <div className="we-date-selects">
            <select
              className="form-input"
              value={form.startMonth}
              onChange={e => setForm({ ...form, startMonth: e.target.value })}
            >
              <option value="">Month</option>
              {MONTHS.map((m, i) => (
                <option key={m} value={String(i + 1)}>{m}</option>
              ))}
            </select>
            <select
              className="form-input"
              value={form.startYear}
              onChange={e => setForm({ ...form, startYear: e.target.value })}
            >
              <option value="">Year</option>
              {years.map(y => (
                <option key={y} value={String(y)}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">End Date</label>
          {form.isCurrent ? (
            <div className="we-current-label">Present</div>
          ) : (
            <div className="we-date-selects">
              <select
                className="form-input"
                value={form.endMonth}
                onChange={e => setForm({ ...form, endMonth: e.target.value })}
              >
                <option value="">Month</option>
                {MONTHS.map((m, i) => (
                  <option key={m} value={String(i + 1)}>{m}</option>
                ))}
              </select>
              <select
                className="form-input"
                value={form.endYear}
                onChange={e => setForm({ ...form, endYear: e.target.value })}
              >
                <option value="">Year</option>
                {years.map(y => (
                  <option key={y} value={String(y)}>{y}</option>
                ))}
              </select>
            </div>
          )}
          <label className="we-checkbox-label">
            <input
              type="checkbox"
              checked={form.isCurrent}
              onChange={e => setForm({ ...form, isCurrent: e.target.checked, endMonth: '', endYear: '' })}
            />
            {isWork ? 'I currently work here' : 'Currently enrolled'}
          </label>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea
          className="form-textarea"
          value={form.description}
          onChange={e => { if (e.target.value.length <= 500) setForm({ ...form, description: e.target.value }) }}
          placeholder="Brief description of your role or studies"
          rows={3}
        />
        <span className="we-char-count">{form.description.length}/500</span>
      </div>

      <div className="we-form-actions">
        <button
          type="button"
          className="btn btn--primary btn--sm"
          onClick={onSave}
          disabled={!form.title.trim()}
        >
          Save
        </button>
        <button
          type="button"
          className="btn btn--outline btn--sm"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default function WorkExperienceEditor({ entries, onChange }: WorkExperienceEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [addingType, setAddingType] = useState<'employment' | 'freelance' | 'education' | null>(null)
  const [form, setForm] = useState<EntryFormData>(emptyForm)

  const workEntries = entries
    .filter(e => e.type === 'employment' || e.type === 'freelance')
    .sort((a, b) => {
      if (a.start_date && b.start_date) return b.start_date.localeCompare(a.start_date)
      if (a.start_date) return -1
      return 1
    })

  const educationEntries = entries
    .filter(e => e.type === 'education')
    .sort((a, b) => {
      if (a.start_date && b.start_date) return b.start_date.localeCompare(a.start_date)
      if (a.start_date) return -1
      return 1
    })

  const currentPositions = entries.filter(e => e.is_current && (e.type === 'employment' || e.type === 'freelance'))

  function handleStartEdit(entry: WorkExperience) {
    setEditingId(entry.id)
    setAddingType(null)
    setForm(entryToForm(entry))
  }

  function handleStartAdd(type: 'employment' | 'freelance' | 'education') {
    setAddingType(type)
    setEditingId(null)
    setForm(emptyForm)
  }

  function handleCancelForm() {
    setEditingId(null)
    setAddingType(null)
    setForm(emptyForm)
  }

  function handleSaveEdit() {
    if (!editingId || !form.title.trim()) return
    const updated = entries.map(e => {
      if (e.id !== editingId) return e
      return {
        ...e,
        title: form.title.trim(),
        organization: form.organization.trim() || undefined,
        location: form.location.trim() || undefined,
        start_date: buildDateStr(form.startMonth, form.startYear),
        end_date: form.isCurrent ? undefined : buildDateStr(form.endMonth, form.endYear),
        is_current: form.isCurrent,
        description: form.description.trim() || undefined,
      }
    })
    onChange(updated)
    handleCancelForm()
  }

  function handleSaveNew() {
    if (!addingType || !form.title.trim()) return
    const newEntry: WorkExperience = {
      id: generateId(),
      profile_id: '',
      type: addingType,
      title: form.title.trim(),
      organization: form.organization.trim() || undefined,
      location: form.location.trim() || undefined,
      start_date: buildDateStr(form.startMonth, form.startYear),
      end_date: form.isCurrent ? undefined : buildDateStr(form.endMonth, form.endYear),
      is_current: form.isCurrent,
      description: form.description.trim() || undefined,
      display_order: entries.length,
    }
    onChange([...entries, newEntry])
    handleCancelForm()
  }

  function handleDelete(id: string) {
    onChange(entries.filter(e => e.id !== id))
    if (editingId === id) handleCancelForm()
  }

  function renderEntry(entry: WorkExperience) {
    if (editingId === entry.id) {
      return (
        <div key={entry.id} className="we-entry we-entry--editing">
          <InlineForm
            form={form}
            setForm={setForm}
            onSave={handleSaveEdit}
            onCancel={handleCancelForm}
            type={entry.type}
          />
        </div>
      )
    }

    const initials = (entry.organization || entry.title)
      .split(' ')
      .map(w => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase()

    return (
      <div key={entry.id} className="we-entry">
        <div className="we-entry__icon">
          <span className="we-entry__initials">{initials}</span>
        </div>
        <div className="we-entry__content">
          <div className="we-entry__title">{entry.title}</div>
          {entry.organization && (
            <div className="we-entry__org">{entry.organization}</div>
          )}
          <div className="we-entry__meta">
            {formatDateRange(entry.start_date, entry.end_date, entry.is_current)}
            {entry.location && (
              <>{entry.start_date ? ' · ' : ''}{entry.location}</>
            )}
          </div>
          {entry.description && (
            <div className="we-entry__desc">{entry.description}</div>
          )}
        </div>
        <div className="we-entry__actions">
          <button
            type="button"
            className="we-action-btn"
            onClick={() => handleStartEdit(entry)}
            title="Edit"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10.5 1.5l2 2-8 8H2.5v-2l8-8z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>
          </button>
          <button
            type="button"
            className="we-action-btn we-action-btn--delete"
            onClick={() => handleDelete(entry.id)}
            title="Delete"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3.5h8M5.5 3.5V2.5h3v1M5.5 6v4M8.5 6v4M4 3.5l.5 8h5l.5-8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="we-editor">
      {/* Current Position */}
      {currentPositions.length > 0 && (
        <div className="we-current-position">
          <span className="we-current-position__label">Current Position</span>
          <span className="we-current-position__value">
            {currentPositions.map(p => `${p.title}${p.organization ? ` at ${p.organization}` : ''}`).join(', ')}
          </span>
        </div>
      )}

      {/* Work Experience Card */}
      <div className="we-card">
        <div className="we-card__header">
          <h3 className="we-card__title">Work Experience</h3>
        </div>
        <div className="we-card__body">
          {workEntries.length === 0 && addingType !== 'employment' && addingType !== 'freelance' && (
            <p className="we-empty">No work experience added yet.</p>
          )}
          {workEntries.map(renderEntry)}
          {(addingType === 'employment' || addingType === 'freelance') && (
            <div className="we-entry we-entry--editing">
              <InlineForm
                form={form}
                setForm={setForm}
                onSave={handleSaveNew}
                onCancel={handleCancelForm}
                type={addingType}
              />
            </div>
          )}
        </div>
        {addingType !== 'employment' && addingType !== 'freelance' && (
          <div className="we-card__footer">
            <button
              type="button"
              className="we-add-btn"
              onClick={() => handleStartAdd('employment')}
            >
              + Add Work Experience
            </button>
          </div>
        )}
      </div>

      {/* Education Card */}
      <div className="we-card">
        <div className="we-card__header">
          <h3 className="we-card__title">Education</h3>
        </div>
        <div className="we-card__body">
          {educationEntries.length === 0 && addingType !== 'education' && (
            <p className="we-empty">No education added yet.</p>
          )}
          {educationEntries.map(renderEntry)}
          {addingType === 'education' && (
            <div className="we-entry we-entry--editing">
              <InlineForm
                form={form}
                setForm={setForm}
                onSave={handleSaveNew}
                onCancel={handleCancelForm}
                type="education"
              />
            </div>
          )}
        </div>
        {addingType !== 'education' && (
          <div className="we-card__footer">
            <button
              type="button"
              className="we-add-btn"
              onClick={() => handleStartAdd('education')}
            >
              + Add Education
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
