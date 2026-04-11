import path from 'path'
import { supabaseAdmin } from '@/lib/supabase'
import type { ScrapedProject, ScrapedProfile } from '@/lib/scraper'

/**
 * Download an image from an external URL and upload it to Supabase Storage,
 * returning the public URL and byte size. Retries once on transient failures.
 *
 * Extracted from /api/scrape/route.ts so all scrape entry points (public
 * import preview, admin create-claimable, admin re-import) can rehost images
 * identically instead of storing raw external URLs that may disappear or
 * break when the source site changes.
 */
export async function uploadImageToStorage(
  url: string,
  type: string
): Promise<{ url: string; byteSize: number } | null> {
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
      const extMap: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif',
        'image/svg+xml': 'svg',
      }
      const ext =
        extMap[contentType] ||
        path.extname(new URL(url).pathname).replace('.', '') ||
        'jpg'
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

export interface ImageDownloadMeta {
  imagesFound: number
  imagesDownloaded: number
  imagesFailed: number
  heroSource: 'original' | 'gallery-swap' | 'fallback' | 'none'
}

/**
 * Download hero + avatar + gallery images from the scraped payload and
 * rehost them on Supabase Storage. Mutates `data` in place:
 *   - data.heroImageUrl   → Supabase public URL or null
 *   - data.avatarUrl      → Supabase public URL or unchanged (profiles only)
 *   - data.galleryImages  → [{ url, alt }] with Supabase public URLs
 *
 * Gallery is capped at 8 images to keep response time reasonable. If the
 * largest gallery image is materially bigger than the hero (≥2× and ≥50KB),
 * it gets promoted to hero via "gallery-swap" — this covers sites where the
 * og:image is a small logo and the real hero lives in the gallery.
 */
export async function downloadImages(
  data: ScrapedProject | ScrapedProfile
): Promise<ImageDownloadMeta> {
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
      return {
        alt: img.alt,
        url: result?.url || '',
        byteSize: result?.byteSize || 0,
        uploaded: !!result,
      }
    })
  )

  const downloadedGallery = results
    .filter(
      (r): r is PromiseFulfilledResult<{
        url: string
        alt: string
        byteSize: number
        uploaded: boolean
      }> => r.status === 'fulfilled'
    )
    .map((r) => r.value)
    .filter((img) => img.uploaded)

  imagesDownloaded += downloadedGallery.length
  imagesFailed += galleryToDownload.length - downloadedGallery.length

  // Check if any gallery image is significantly larger than the hero — if so, swap it in as hero
  if (downloadedGallery.length > 0) {
    const largestGallery = downloadedGallery.reduce(
      (best, img) => (img.byteSize > best.byteSize ? img : best),
      downloadedGallery[0]
    )

    // Swap if: no hero was downloaded, OR the largest gallery image is at least 2x the hero size
    if (
      !data.heroImageUrl ||
      (largestGallery.byteSize > heroSize * 2 && largestGallery.byteSize > 50_000)
    ) {
      heroSource = 'gallery-swap'
      const oldHero = data.heroImageUrl
      data.heroImageUrl = largestGallery.url
      const newGallery = downloadedGallery
        .filter((img) => img.url !== largestGallery.url)
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
