'use client'
import { Widget } from '@typeform/embed-react'

interface TypeformEmbedProps {
  formId: string
  onSubmit?: () => void
  height?: number
}

export function TypeformEmbed({ formId, onSubmit, height = 500 }: TypeformEmbedProps) {
  return (
    <Widget
      id={formId}
      style={{ width: '100%', height }}
      onSubmit={onSubmit}
    />
  )
}
