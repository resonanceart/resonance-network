export function validateCsrf(request: Request): boolean {
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')

  if (!origin) return true // Allow non-browser requests (curl, etc.)

  // Exact-match origins
  const allowedOrigins = [
    'https://resonancenetwork.org',
    'https://www.resonancenetwork.org',
    'https://resonance-network.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
  ]

  if (allowedOrigins.includes(origin)) return true

  // Allow the current host (handles dynamic ports, custom domains)
  if (host) {
    const hostWithoutPort = host.split(':')[0]
    if (
      origin === `https://${host}` ||
      origin === `http://${host}` ||
      origin === `https://${hostWithoutPort}` ||
      origin === `http://${hostWithoutPort}`
    ) {
      return true
    }
  }

  // Allow Vercel preview deployments (*.vercel.app)
  try {
    const originUrl = new URL(origin)
    if (originUrl.hostname.endsWith('.vercel.app')) return true
  } catch {
    // Invalid origin URL
  }

  return false
}
