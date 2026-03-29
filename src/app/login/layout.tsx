import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In — Resonance Network',
  description: 'Sign in to your Resonance Network account to manage your profile, submit projects, and connect with collaborators.',
  openGraph: {
    title: 'Sign In — Resonance Network',
    description: 'Sign in to manage your profile and connect with collaborators.',
    url: 'https://resonance.network/login',
  },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
