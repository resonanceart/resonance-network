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
