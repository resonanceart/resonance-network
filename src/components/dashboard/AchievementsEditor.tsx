'use client'

import { useState } from 'react'

interface AchievementsEditorProps {
  achievements: string[]
  onChange: (achievements: string[]) => void
}

export default function AchievementsEditor({ achievements, onChange }: AchievementsEditorProps) {
  const [input, setInput] = useState('')

  function addAchievement() {
    const trimmed = input.trim()
    if (trimmed && !achievements.includes(trimmed)) {
      onChange([...achievements, trimmed])
    }
    setInput('')
  }

  function removeAchievement(index: number) {
    onChange(achievements.filter((_, i) => i !== index))
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addAchievement()
    }
  }

  return (
    <div className="achievements-editor">
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. NEA Grant Recipient 2023"
          className="form-input"
          style={{ flex: 1 }}
        />
        <button type="button" className="btn btn--outline" onClick={addAchievement} style={{ flexShrink: 0 }}>
          Add
        </button>
      </div>

      {achievements.length > 0 && (
        <ul className="achievements-editor__list">
          {achievements.map((item, index) => (
            <li key={index} className="achievements-editor__item">
              <span>{item}</span>
              <button
                type="button"
                onClick={() => removeAchievement(index)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)',
                  fontSize: '16px',
                  lineHeight: 1,
                  padding: '2px 4px',
                }}
                aria-label={`Remove ${item}`}
              >
                &times;
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
