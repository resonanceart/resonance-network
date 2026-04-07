/** Validate and sanitize a URL for scraping — prevents SSRF attacks */
export function validateScrapeUrl(input: string): { valid: boolean; url?: string; error?: string } {
  let parsed: URL
  try {
    parsed = new URL(input)
  } catch {
    return { valid: false, error: 'Invalid URL format.' }
  }

  // Only allow http/https
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { valid: false, error: 'Only HTTP and HTTPS URLs are allowed.' }
  }

  // Block localhost and private IPs
  const hostname = parsed.hostname.toLowerCase()
  const blocked = [
    'localhost', '127.0.0.1', '0.0.0.0', '::1',
    '169.254.', '10.', '172.16.', '172.17.', '172.18.',
    '172.19.', '172.20.', '172.21.', '172.22.', '172.23.',
    '172.24.', '172.25.', '172.26.', '172.27.', '172.28.',
    '172.29.', '172.30.', '172.31.', '192.168.',
  ]
  if (blocked.some(b => hostname === b || hostname.startsWith(b))) {
    return { valid: false, error: 'Internal/private URLs are not allowed.' }
  }

  // Block common internal TLDs
  if (hostname.endsWith('.local') || hostname.endsWith('.internal')) {
    return { valid: false, error: 'Internal network URLs are not allowed.' }
  }

  return { valid: true, url: parsed.href }
}
