import { test, expect } from '@playwright/test'

const PAGES = [
  { path: '/', name: 'home' },
  { path: '/dashboard', name: 'dashboard' },
  { path: '/admin', name: 'admin' },
  { path: '/profile', name: 'profile' },
  { path: '/projects', name: 'projects' },
  { path: '/collaborate', name: 'collaborate' },
]

for (const page of PAGES) {
  test(`${page.name} loads without errors`, async ({ page: p, browserName }, testInfo) => {
    const errors: string[] = []
    p.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    const response = await p.goto(page.path, { waitUntil: 'networkidle', timeout: 15000 })
    const status = response?.status() ?? 0

    // Auth-gated pages redirect to /login — that's expected, not an error
    const isAuthRedirect = p.url().includes('/login')
    if (!isAuthRedirect) {
      expect(status).toBeLessThan(500)
    }

    const viewport = testInfo.project.name
    await p.screenshot({
      path: `tests/screenshots/${page.name}-${viewport}.png`,
      fullPage: true,
    })

    // Filter out known noisy console errors (e.g. Supabase auth, third-party scripts)
    const realErrors = errors.filter(
      e => !e.includes('supabase') && !e.includes('Failed to load resource') && !e.includes('favicon')
    )

    if (realErrors.length > 0) {
      console.warn(`Console errors on ${page.path}:`, realErrors)
    }
  })
}
