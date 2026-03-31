'use client'

import { useState } from 'react'

interface CollapsibleSectionProps {
  label: string
  description?: string
  children: React.ReactNode
}

export function CollapsibleSection({ label, description, children }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 'var(--space-3) 0',
          width: '100%',
          textAlign: 'left',
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transition: 'transform 0.25s ease',
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
            color: 'var(--color-text-muted)',
            flexShrink: 0,
          }}
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <div>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            {label}
          </span>
          {description && (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 'var(--space-1) 0 0', opacity: 0.7 }}>
              {description}
            </p>
          )}
        </div>
      </button>
      {open && (
        <div style={{ paddingTop: 'var(--space-4)', paddingBottom: 'var(--space-8)' }}>
          {children}
        </div>
      )}
    </div>
  )
}
