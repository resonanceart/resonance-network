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

/** Get the byte size of a base64 data URL */
function base64ByteSize(dataUrl: string): number {
  const base64Part = dataUrl.split(',')[1]
  if (!base64Part) return 0
  // base64 encodes 3 bytes per 4 chars, minus padding
  const padding = (base64Part.match(/=+$/) || [''])[0].length
  return Math.floor((base64Part.length * 3) / 4) - padding
}

/** Download hero + gallery images, converting external URLs to base64 */
async function downloadImages(data: ScrapedProject | ScrapedProfile): Promise<void> {
  // Download hero image
  let heroBase64: string | null = null
  let heroSize = 0
  if (data.heroImageUrl) {
    heroBase64 = await imageToBase64(data.heroImageUrl)
    if (heroBase64) {
      heroSize = base64ByteSize(heroBase64)
      data.heroImageUrl = heroBase64
    } else {
      // Hero download failed — clear it so we can fallback to gallery later
      data.heroImageUrl = null
    }
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
      return { ...img, url: base64 || img.url, byteSize: base64 ? base64ByteSize(base64) : 0 }
    })
  )

  const downloadedGallery = results
    .filter((r): r is PromiseFulfilledResult<{ url: string; alt: string; byteSize: number }> => r.status === 'fulfilled')
    .map(r => r.value)
    .filter(img => img.url.startsWith('data:')) // only keep successfully downloaded ones

  // Check if any gallery image is significantly larger than the hero — if so, swap it in as hero
  // This catches cases where the scraper's HTML-based scoring picked a small logo/screenshot
  // but a real project image is much larger by actual file size
  if (downloadedGallery.length > 0) {
    const largestGallery = downloadedGallery.reduce((best, img) =>
      img.byteSize > best.byteSize ? img : best
    , downloadedGallery[0])

    // Swap if: no hero was downloaded, OR the largest gallery image is at least 2x the hero size
    if (!data.heroImageUrl || (largestGallery.byteSize > heroSize * 2 && largestGallery.byteSize > 50_000)) {
      // Current hero (if any) goes back into gallery
      const oldHero = data.heroImageUrl
      data.heroImageUrl = largestGallery.url
      const newGallery = downloadedGallery
        .filter(img => img.url !== largestGallery.url)
        .map(({ url, alt }) => ({ url, alt }))
      // Put old hero at the end of gallery if it existed
      if (oldHero) {
        newGallery.push({ url: oldHero, alt: '' })
      }
      data.galleryImages = newGallery
    } else {
      data.galleryImages = downloadedGallery.map(({ url, alt }) => ({ url, alt }))
    }
  } else {
    data.galleryImages = []
  }

  // Final fallback: if still no hero, use first gallery image
  if (!data.heroImageUrl && data.galleryImages.length > 0) {
    data.heroImageUrl = data.galleryImages[0].url
    data.galleryImages = data.galleryImages.slice(1)
  }
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
