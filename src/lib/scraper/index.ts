import * as cheerio from 'cheerio'

export interface ScrapedProject {
  title: string
  shortDescription: string
  heroImageUrl: string | null
  galleryImages: Array<{ url: string; alt: string }>
  overviewLead: string
  overviewBody: string
  experience: string
  artistStory: string
  materials: string
  goals: string[]
  leadArtistName: string
  leadArtistBio: string
  socialLinks: Array<{ platform: string; url: string }>
  suggestedDomains: string[]
  suggestedPathways: string[]
  suggestedStage: string
  suggestedScale: string
  sourceUrl: string
  sections: Array<{ heading: string; content: string }>
}

export interface ScrapedProfile {
  name: string
  bio: string
  avatarUrl: string | null
  heroImageUrl: string | null
  galleryImages: Array<{ url: string; alt: string }>
  socialLinks: Array<{ platform: string; url: string }>
  website: string
  sections: Array<{ heading: string; content: string }>
}

const SOCIAL_PATTERNS: Record<string, RegExp> = {
  instagram: /instagram\.com/i,
  linkedin: /linkedin\.com/i,
  x: /twitter\.com|x\.com/i,
  youtube: /youtube\.com/i,
  vimeo: /vimeo\.com/i,
  behance: /behance\.net/i,
  github: /github\.com/i,
}

const DOMAIN_KEYWORDS: Record<string, string[]> = {
  'Immersive Art': ['immersive', 'interactive', 'installation', 'experiential', 'sensory'],
  'Public Space': ['public', 'outdoor', 'urban', 'civic', 'plaza', 'park'],
  'Experimental Technology': ['sensor', 'led', 'microcontroller', 'arduino', 'responsive', 'kinetic', 'projection', 'ai', 'machine learning', 'neural'],
  'Architecture': ['architectural', 'structure', 'building', 'spatial', 'pavilion'],
  'Ecological Design': ['solar', 'sustainable', 'ecological', 'nature', 'organic', 'biodegradable'],
  'Material Innovation': ['material', 'fabricat', 'composite', 'textile', 'ceramic'],
  'Community Infrastructure': ['community', 'social', 'participat', 'collective', 'collaborative'],
  'Social Impact': ['impact', 'humanitarian', 'equity', 'justice', 'access'],
}

const PATHWAY_KEYWORDS: Record<string, string[]> = {
  'Public Art': ['public art', 'sculpture', 'monument', 'mural', 'outdoor'],
  'Festival Installation': ['festival', 'burning man', 'playa', 'event', 'temporary'],
  'Exhibition/Cultural': ['museum', 'gallery', 'exhibition', 'cultural', 'curator'],
  'R&D': ['research', 'prototype', 'experiment', 'lab'],
  'Development/Commercial': ['commercial', 'commission', 'client', 'development'],
}

function resolveUrl(src: string, baseUrl: string): string {
  try {
    return new URL(src, baseUrl).href
  } catch {
    return src
  }
}

function extractSocialLinks($: cheerio.CheerioAPI, baseUrl: string): Array<{ platform: string; url: string }> {
  const links: Array<{ platform: string; url: string }> = []
  const seen = new Set<string>()

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || ''
    for (const [platform, pattern] of Object.entries(SOCIAL_PATTERNS)) {
      if (pattern.test(href) && !seen.has(platform)) {
        seen.add(platform)
        links.push({ platform, url: resolveUrl(href, baseUrl) })
      }
    }
  })

  return links
}

function extractImages($: cheerio.CheerioAPI, baseUrl: string): Array<{ url: string; alt: string }> {
  const images: Array<{ url: string; alt: string }> = []
  const seen = new Set<string>()

  // Get og:image first
  const ogImage = $('meta[property="og:image"]').attr('content')
  if (ogImage) {
    const resolved = resolveUrl(ogImage, baseUrl)
    seen.add(resolved)
    images.push({ url: resolved, alt: 'Hero image' })
  }

  // Get all img tags
  $('img').each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src') || ''
    if (!src) return

    const resolved = resolveUrl(src, baseUrl)
    // Skip tiny images, icons, spacers, tracking pixels
    if (seen.has(resolved)) return
    if (resolved.includes('favicon')) return
    if (resolved.includes('1x1')) return
    if (resolved.includes('spacer')) return
    // Skip very small specified dimensions
    const width = parseInt($(el).attr('width') || '0')
    const height = parseInt($(el).attr('height') || '0')
    if ((width > 0 && width < 50) || (height > 0 && height < 50)) return

    seen.add(resolved)
    images.push({ url: resolved, alt: $(el).attr('alt') || '' })
  })

  // Also check background images in Squarespace data-image attributes
  $('[data-image], [data-src]').each((_, el) => {
    const src = $(el).attr('data-image') || $(el).attr('data-src') || ''
    if (!src) return
    const resolved = resolveUrl(src, baseUrl)
    if (seen.has(resolved)) return
    seen.add(resolved)
    images.push({ url: resolved, alt: '' })
  })

  return images.slice(0, 20) // cap at 20 images
}

function extractSections($: cheerio.CheerioAPI): Array<{ heading: string; content: string }> {
  const sections: Array<{ heading: string; content: string }> = []

  // Strategy 1: Look for heading + content pairs
  $('h1, h2, h3').each((_, el) => {
    const heading = $(el).text().trim()
    if (!heading || heading.length > 200) return

    // Gather text from siblings until the next heading
    let content = ''
    let sibling = $(el).next()
    while (sibling.length && !sibling.is('h1, h2, h3')) {
      const text = sibling.text().trim()
      if (text) content += text + '\n\n'
      sibling = sibling.next()
    }

    if (content.trim()) {
      sections.push({ heading, content: content.trim() })
    }
  })

  // Strategy 2: Squarespace blocks
  if (sections.length === 0) {
    $('.sqs-block-content, .sqs-block').each((_, el) => {
      const heading = $(el).find('h1, h2, h3').first().text().trim()
      const allText = $(el).text().trim()
      const content = heading ? allText.replace(heading, '').trim() : allText
      if (content && content.length > 50) {
        sections.push({ heading: heading || 'Content', content })
      }
    })
  }

  // Strategy 3: Generic content blocks
  if (sections.length === 0) {
    $('section, article, [role="main"], main, .content, .page-content').each((_, el) => {
      const text = $(el).text().trim()
      if (text && text.length > 100) {
        const heading = $(el).find('h1, h2, h3').first().text().trim()
        sections.push({
          heading: heading || 'Content',
          content: heading ? text.replace(heading, '').trim() : text,
        })
      }
    })
  }

  // Deduplicate sections with identical content
  const unique: Array<{ heading: string; content: string }> = []
  const seenContent = new Set<string>()
  for (const s of sections) {
    const key = s.content.slice(0, 200)
    if (!seenContent.has(key)) {
      seenContent.add(key)
      unique.push(s)
    }
  }

  return unique
}

function suggestDomains(allText: string): string[] {
  const lower = allText.toLowerCase()
  const matched: string[] = []
  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      matched.push(domain)
    }
  }
  return matched.slice(0, 3)
}

function suggestPathways(allText: string): string[] {
  const lower = allText.toLowerCase()
  const matched: string[] = []
  for (const [pathway, keywords] of Object.entries(PATHWAY_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      matched.push(pathway)
    }
  }
  return matched.length > 0 ? matched.slice(0, 2) : ['Public Art']
}

function suggestScale(allText: string): string {
  const lower = allText.toLowerCase()
  if (/\b(\d{2,})[- ]?foot\b/.test(lower) || /large[- ]?scale/.test(lower) || /monumental/.test(lower)) {
    return 'Large-scale Installation'
  }
  if (/room[- ]?sized|gallery|indoor/.test(lower)) return 'Room-scale'
  if (/wearable|portable|handheld/.test(lower)) return 'Object/Wearable'
  return ''
}

export async function scrapeProjectPage(url: string): Promise<ScrapedProject> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'ResonanceNetwork/1.0 (Project Import)',
      'Accept': 'text/html',
    },
    signal: AbortSignal.timeout(15000),
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`)
  }

  const html = await response.text()
  const $ = cheerio.load(html)

  // Extract metadata
  const ogTitle = $('meta[property="og:title"]').attr('content')
  const ogDesc = $('meta[property="og:description"]').attr('content')
  const metaDesc = $('meta[name="description"]').attr('content')
  const pageTitle = $('title').text().trim()
  const h1 = $('h1').first().text().trim()

  // Best title
  const title = h1 || ogTitle || pageTitle?.split('—')[0]?.split('|')[0]?.trim() || 'Untitled'

  // Best description
  const shortDescription = ogDesc || metaDesc || ''

  // Extract all content
  const sections = extractSections($)
  const images = extractImages($, url)
  const socialLinks = extractSocialLinks($, url)

  // Combine all text for analysis
  const allText = sections.map(s => s.heading + ' ' + s.content).join(' ')

  // Map sections to project fields heuristically
  let overviewLead = ''
  let overviewBody = ''
  let experience = ''
  let artistStory = ''
  let materialsText = ''
  let leadArtistName = ''
  let leadArtistBio = ''
  const goals: string[] = []

  // Look for artist name from site header/footer or og:site_name
  const siteName = $('meta[property="og:site_name"]').attr('content') || ''
  const headerText = $('header').first().text().trim()
  leadArtistName = siteName || headerText?.split('\n')[0]?.trim() || ''
  // Clean up: remove "Home", nav text
  if (leadArtistName.length > 50) leadArtistName = leadArtistName.slice(0, 50)

  for (const section of sections) {
    const headingLower = section.heading.toLowerCase()

    if (headingLower.includes('about') || headingLower.includes('artist') || headingLower.includes('why i chose') || headingLower.includes('bio')) {
      if (!artistStory) artistStory = section.content
      else if (!leadArtistBio) leadArtistBio = section.content
    } else if (headingLower.includes('material') || headingLower.includes('technical') || headingLower.includes('spec')) {
      materialsText = section.content
    } else if (headingLower.includes('experience') || headingLower.includes('feature') || headingLower.includes('interactive') || headingLower.includes('eye') || headingLower.includes('ear') || headingLower.includes('light')) {
      experience += (experience ? '\n\n' : '') + section.content
    } else if (headingLower.includes('goal') || headingLower.includes('mission') || headingLower.includes('matter') || headingLower.includes('vision')) {
      // Extract as bullet points
      const lines = section.content.split('\n').filter(l => l.trim().length > 10)
      goals.push(...lines.slice(0, 5))
    } else if (!overviewLead) {
      overviewLead = section.content.split('\n\n')[0] || section.content
      overviewBody = section.content.split('\n\n').slice(1).join('\n\n')
    } else if (!overviewBody) {
      overviewBody = section.content
    }
  }

  // If no overview was found, use short description or first section
  if (!overviewLead && shortDescription) {
    overviewLead = shortDescription
  }

  // Hero image = first image (og:image prioritized in extractImages)
  const heroImageUrl = images.length > 0 ? images[0].url : null
  const galleryImages = images.slice(1) // everything after hero

  return {
    title,
    shortDescription: shortDescription.slice(0, 300),
    heroImageUrl,
    galleryImages,
    overviewLead,
    overviewBody,
    experience,
    artistStory,
    materials: materialsText,
    goals,
    leadArtistName,
    leadArtistBio,
    socialLinks,
    suggestedDomains: suggestDomains(allText),
    suggestedPathways: suggestPathways(allText),
    suggestedStage: 'Concept',
    suggestedScale: suggestScale(allText),
    sourceUrl: url,
    sections,
  }
}

export async function scrapeProfilePage(url: string): Promise<ScrapedProfile> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'ResonanceNetwork/1.0 (Profile Import)',
      'Accept': 'text/html',
    },
    signal: AbortSignal.timeout(15000),
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`)
  }

  const html = await response.text()
  const $ = cheerio.load(html)

  const ogTitle = $('meta[property="og:title"]').attr('content')
  const h1 = $('h1').first().text().trim()
  const siteName = $('meta[property="og:site_name"]').attr('content') || ''

  const name = h1 || ogTitle || siteName || 'Unknown Artist'

  const sections = extractSections($)
  const images = extractImages($, url)
  const socialLinks = extractSocialLinks($, url)

  // Combine all text as bio
  const bio = sections
    .map(s => s.content)
    .join('\n\n')
    .slice(0, 5000)

  // First image as avatar candidate, second as hero
  const avatarUrl = images.length > 0 ? images[0].url : null
  const heroImageUrl = images.length > 1 ? images[1].url : null
  const galleryImages = images.slice(2)

  return {
    name,
    bio,
    avatarUrl,
    heroImageUrl,
    galleryImages,
    socialLinks,
    website: new URL(url).origin,
    sections,
  }
}
