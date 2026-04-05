import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { validateScrapeUrl } from '@/lib/scraper/url-validator'
import { scrapeProjectPage, scrapeProfilePage } from '@/lib/scraper'
import { validateCsrf } from '@/lib/csrf'
import { getClientIp } from '@/lib/sanitize'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  try {
    if (!validateCsrf(request)) {
      return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })
    }

    // Rate limit: 10 scrapes per minute per IP
    const ip = getClientIp(request)
    if (!rateLimit(ip)) {
      return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 })
    }

    // Auth required
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
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
      return NextResponse.json({ success: true, type: 'profile', data: result })
    }

    const result = await scrapeProjectPage(validation.url!)
    return NextResponse.json({ success: true, type: 'project', data: result })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Scraping failed'
    console.error('Scrape error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
