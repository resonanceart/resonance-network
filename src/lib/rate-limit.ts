import { createHash } from 'crypto'

const rateMap = new Map<string, number[]>()
const WINDOW_MS = 60_000 // 1 minute
const MAX_REQUESTS = 100

export function rateLimit(ip: string): boolean {
  // Hash IP to avoid storing raw addresses in memory
  const key = createHash('sha256').update(ip).digest('hex').substring(0, 16)
  const now = Date.now()
  const timestamps = rateMap.get(key) || []
  const recent = timestamps.filter(t => now - t < WINDOW_MS)
  if (recent.length >= MAX_REQUESTS) return false
  recent.push(now)
  rateMap.set(key, recent)
  return true
}

/**
 * Tighter rate limit for high-value endpoints (e.g. /api/claim/finalize,
 * password reset). Default: 5 attempts per 15 minutes per IP.
 *
 * Separate store from rateLimit() so high-traffic read endpoints can't
 * starve out the strict budget for sensitive writes.
 */
const strictStore = new Map<string, { count: number; resetAt: number }>()

export function rateLimitStrict(
  ip: string,
  max = 5,
  windowMs = 15 * 60 * 1000
): boolean {
  const key = createHash('sha256').update(ip).digest('hex').substring(0, 16)
  const now = Date.now()
  const existing = strictStore.get(key)
  if (!existing || existing.resetAt < now) {
    strictStore.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (existing.count >= max) return false
  existing.count += 1
  return true
}
