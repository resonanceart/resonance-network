import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your Resonance Network account to manage your profile, submit projects, and connect with collaborators on immersive art installations.',
  alternates: { canonical: 'https://resonance.network/login' },
  openGraph: {
    title: 'Sign In — Resonance Network',
    description: 'Sign in to manage your profile, submit projects, and connect with collaborators on Resonance Network.',
    url: 'https://resonance.network/login',
    images: [{ url: '/og-image.jpg' }],
  },
  twitter: {
    card: 'summary',
    title: 'Sign In — Resonance Network',
    description: 'Sign in to manage your profile, submit projects, and connect with collaborators on Resonance Network.',
  },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
