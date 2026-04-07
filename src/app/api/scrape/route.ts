import { NextResponse } from 'next/server'
import { validateScrapeUrl } from '@/lib/scraper/url-validator'
import { scrapeProjectPage, scrapeProfilePage } from '@/lib/scraper'
import type { ScrapedProject, ScrapedProfile } from '@/lib/scraper'
import { validateCsrf } from '@/lib/csrf'
import { getClientIp } from '@/lib/sanitize'
import { rateLimit } from '@/lib/rate-limit'
import { supabaseAdmin } from '@/lib/supabase'
import path from 'path'

/** Download an image and upload it to Supabase Storage, returning the public URL (retries once on failure) */
async function uploadImageToStorage(url: string, type: string): Promise<{ url: string; byteSize: number } | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const origin = new URL(url).origin
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'ResonanceNetwork/1.0 (Project Import)',
          'Accept': 'image/*,*/*;q=0.8',
          'Referer': origin + '/',
        },
        signal: AbortSignal.timeout(15000),
        redirect: 'follow',
      })
      if (!response.ok) {
        if (attempt === 0) { await new Promise(r => setTimeout(r, 3000)); continue }
        return null
      }

      const contentType = response.headers.get('content-type') || 'image/jpeg'
      if (!contentType.startsWith('image/')) return null

      const buffer = await response.arrayBuffer()
      const byteSize = buffer.byteLength
      if (byteSize < 2000 || byteSize > 10_000_000) return null

      // Derive extension from content type or original URL
      const extMap: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/svg+xml': 'svg' }
      const ext = extMap[contentType] || path.extname(new URL(url).pathname).replace('.', '') || 'jpg'
      const filename = `${crypto.randomUUID()}.${ext}`
      const timestamp = Date.now()
      const storagePath = `imports/${timestamp}/${type}/${filename}`

      const { error } = await supabaseAdmin.storage
        .from('profile-uploads')
        .upload(storagePath, Buffer.from(buffer), {
          contentType,
          upsert: false,
        })

      if (error) {
        if (attempt === 0) { await new Promise(r => setTimeout(r, 3000)); continue }
        console.error('Supabase upload error:', error.message)
        return null
      }

      const { data: publicUrlData } = supabaseAdmin.storage
        .from('profile-uploads')
        .getPublicUrl(storagePath)

      return { url: publicUrlData.publicUrl, byteSize }
    } catch {
      if (attempt === 0) { await new Promise(r => setTimeout(r, 3000)); continue }
      return null
    }
  }
  return null
}

/** Image download metadata */
interface ImageDownloadMeta {
  imagesFound: number
  imagesDownloaded: number
  imagesFailed: number
  heroSource: 'original' | 'gallery-swap' | 'fallback' | 'none'
}

/** Download hero + gallery images, uploading to Supabase Storage and returning public URLs */
async function downloadImages(data: ScrapedProject | ScrapedProfile): Promise<ImageDownloadMeta> {
  let imagesFound = 0
  let imagesDownloaded = 0
  let imagesFailed = 0
  let heroSource: ImageDownloadMeta['heroSource'] = 'none'

  // Upload hero image
  let heroSize = 0
  if (data.heroImageUrl) {
    imagesFound++
    const result = await uploadImageToStorage(data.heroImageUrl, 'hero')
    if (result) {
      heroSize = result.byteSize
      data.heroImageUrl = result.url
      heroSource = 'original'
      imagesDownloaded++
    } else {
      data.heroImageUrl = null
      imagesFailed++
    }
  }

  // Upload avatar for profiles
  if ('avatarUrl' in data && data.avatarUrl) {
    imagesFound++
    const result = await uploadImageToStorage(data.avatarUrl, 'avatar')
    if (result) {
      data.avatarUrl = result.url
      imagesDownloaded++
    } else {
      imagesFailed++
    }
  }

  // Upload gallery images in parallel (max 8 to keep response time reasonable)
  const galleryToDownload = data.galleryImages.slice(0, 8)
  imagesFound += galleryToDownload.length
  const results = await Promise.allSettled(
    galleryToDownload.map(async (img) => {
      const result = await uploadImageToStorage(img.url, 'gallery')
      return { alt: img.alt, url: result?.url || '', byteSize: result?.byteSize || 0, uploaded: !!result }
    })
  )

  const downloadedGallery = results
    .filter((r): r is PromiseFulfilledResult<{ url: string; alt: string; byteSize: number; uploaded: boolean }> => r.status === 'fulfilled')
    .map(r => r.value)
    .filter(img => img.uploaded)

  imagesDownloaded += downloadedGallery.length
  imagesFailed += galleryToDownload.length - downloadedGallery.length

  // Check if any gallery image is significantly larger than the hero — if so, swap it in as hero
  if (downloadedGallery.length > 0) {
    const largestGallery = downloadedGallery.reduce((best, img) =>
      img.byteSize > best.byteSize ? img : best
    , downloadedGallery[0])

    // Swap if: no hero was downloaded, OR the largest gallery image is at least 2x the hero size
    if (!data.heroImageUrl || (largestGallery.byteSize > heroSize * 2 && largestGallery.byteSize > 50_000)) {
      heroSource = 'gallery-swap'
      const oldHero = data.heroImageUrl
      data.heroImageUrl = largestGallery.url
      const newGallery = downloadedGallery
        .filter(img => img.url !== largestGallery.url)
        .map(({ url, alt }) => ({ url, alt }))
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
    heroSource = 'fallback'
  }

  return { imagesFound, imagesDownloaded, imagesFailed, heroSource }
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
      const meta = await downloadImages(result)
      return NextResponse.json({ success: true, type: 'profile', data: result, meta })
    }

    const result = await scrapeProjectPage(validation.url!)
    const meta = await downloadImages(result)
    return NextResponse.json({ success: true, type: 'project', data: result, meta })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Scraping failed'
    console.error('Scrape error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
