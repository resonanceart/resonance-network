export function validateCsrf(request: Request): boolean {
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')

  if (!origin) return true // Allow non-browser requests (curl, etc.)

  const allowedOrigins = [
    'https://resonance.network',
    'https://resonance-network.vercel.app',
    'http://localhost:3000',
  ]

  // Also allow the current host
  if (host) {
    allowedOrigins.push(`https://${host}`)
    allowedOrigins.push(`http://${host}`)
  }

  return allowedOrigins.some(allowed => origin.startsWith(allowed))
}
