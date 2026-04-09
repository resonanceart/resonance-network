import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Import from Your Website | Resonance Network',
  description: 'Paste a URL and we will build your project page automatically. Everything is editable before publishing.',
}

export default function ImportLayout({ children }: { children: React.ReactNode }) {
  return children
}
