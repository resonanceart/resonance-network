export function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '')
}

export function sanitizeText(str: unknown, maxLength: number): string {
  if (typeof str !== 'string') return ''
  return stripHtml(str).trim().slice(0, maxLength)
}

export function validateEmail(email: unknown): string | null {
  if (typeof email !== 'string') return null
  const trimmed = email.trim().slice(0, 254)
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(trimmed) ? trimmed : null
}

export function getClientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         request.headers.get('x-real-ip') ||
         'unknown'
}
