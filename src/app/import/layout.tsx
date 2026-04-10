import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Import Your Portfolio',
  description: 'Paste a URL and we will build your project page or artist profile automatically. Everything is editable before publishing.',
  alternates: {
    canonical: 'https://resonancenetwork.org/import',
  },
}

export default function ImportLayout({ children }: { children: React.ReactNode }) {
  return children
}
