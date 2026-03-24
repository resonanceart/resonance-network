const rateMap = new Map<string, number[]>()
const WINDOW_MS = 60_000 // 1 minute
const MAX_REQUESTS = 10

export function rateLimit(ip: string): boolean {
  const now = Date.now()
  const timestamps = rateMap.get(ip) || []
  const recent = timestamps.filter(t => now - t < WINDOW_MS)
  if (recent.length >= MAX_REQUESTS) return false
  recent.push(now)
  rateMap.set(ip, recent)
  return true
}
