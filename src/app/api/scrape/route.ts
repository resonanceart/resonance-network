import { NextResponse } from 'next/server'
import { validateScrapeUrl } from '@/lib/scraper/url-validator'
import { scrapeProjectPage, scrapeProfilePage } from '@/lib/scraper'
import type { ScrapedProject, ScrapedProfile } from '@/lib/scraper'
import { validateCsrf } from '@/lib/csrf'
import { getClientIp } from '@/lib/sanitize'
import { rateLimit } from '@/lib/rate-limit'

/** Download an image URL and return as base64 data URL */
async function imageToBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'ResonanceNetwork/1.0 (Project Import)' },
      signal: AbortSignal.timeout(10000),
    })
    if (!response.ok) return null

    const contentType = response.headers.get('content-type') || 'image/jpeg'
    // Skip non-image responses
    if (!contentType.startsWith('image/')) return null

    const buffer = await response.arrayBuffer()
    // Skip tiny images (likely icons/spacers) and huge ones
    if (buffer.byteLength < 2000 || buffer.byteLength > 10_000_000) return null

    const base64 = Buffer.from(buffer).toString('base64')
    return `data:${contentType};base64,${base64}`
  } catch {
    return null
  }
}

/** Download hero + gallery images, converting external URLs to base64 */
async function downloadImages(data: ScrapedProject | ScrapedProfile): Promise<void> {
  // Download hero image
  const heroKey = 'heroImageUrl' in data ? 'heroImageUrl' : null
  if (heroKey && data.heroImageUrl) {
    const base64 = await imageToBase64(data.heroImageUrl)
    if (base64) data.heroImageUrl = base64
  }

  // Download avatar for profiles
  if ('avatarUrl' in data && data.avatarUrl) {
    const base64 = await imageToBase64(data.avatarUrl)
    if (base64) data.avatarUrl = base64
  }

  // Download gallery images in parallel (max 8 to keep response time reasonable)
  const galleryToDownload = data.galleryImages.slice(0, 8)
  const results = await Promise.allSettled(
    galleryToDownload.map(async (img) => {
      const base64 = await imageToBase64(img.url)
      return { ...img, url: base64 || img.url }
    })
  )

  data.galleryImages = results
    .filter((r): r is PromiseFulfilledResult<{ url: string; alt: string }> => r.status === 'fulfilled')
    .map(r => r.value)
    .filter(img => img.url.startsWith('data:')) // only keep successfully downloaded ones
}

export async function POST(request: Request) {
  try {
    if (!validateCsrf(request)) {
      return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })
    }

    // Rate limit — no auth required, but rate-limit by IP to prevent abuse
    const ip = getClientIp(request)
    if (!rateLimit(ip)) {
      return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 })
    }

    const body = await request.json()
    const { url, type = 'project' } = body

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required.' }, { status: 400 })
    }

    // Validate URL
    const validation = validateScrapeUrl(url)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    if (type === 'profile') {
      const result = await scrapeProfilePage(validation.url!)
      await downloadImages(result)
      return NextResponse.json({ success: true, type: 'profile', data: result })
    }

    const result = await scrapeProjectPage(validation.url!)
    await downloadImages(result)
    return NextResponse.json({ success: true, type: 'project', data: result })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Scraping failed'
    console.error('Scrape error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
