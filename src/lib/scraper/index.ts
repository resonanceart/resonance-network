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
  otherProjects: Array<{ title: string; url: string }>
  keyQuote: string
}

export interface ScrapedProfile {
  name: string
  bio: string
  titles: string[]
  education: string[]
  avatarUrl: string | null
  heroImageUrl: string | null
  galleryImages: Array<{ url: string; alt: string }>
  socialLinks: Array<{ platform: string; url: string }>
  website: string
  sections: Array<{ heading: string; content: string }>
  otherProjects: Array<{ title: string; url: string }>
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
  'Public Space': ['public', 'outdoor', 'urban', 'civic', 'plaza', 'park', 'sculpture'],
  'Experimental Technology': ['sensor', 'led', 'microcontroller', 'arduino', 'responsive', 'kinetic', 'projection', 'ai', 'machine learning', 'neural', 'audio-reactive', 'sound-reactive'],
  'Architecture': ['architectural', 'structure', 'building', 'spatial', 'pavilion'],
  'Ecological Design': ['solar', 'sustainable', 'ecological', 'nature', 'organic', 'biodegradable', 'off-grid'],
  'Material Innovation': ['material', 'fabricat', 'composite', 'textile', 'ceramic', 'steel', 'modular'],
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

/** Detect if page is built on Squarespace */
function isSquarespace($: cheerio.CheerioAPI): boolean {
  const html = $.html()
  return html.includes('squarespace') || html.includes('sqs-') || html.includes('fluid-engine')
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

/** Extract navigation links to other projects on the same site */
function extractProjectLinks($: cheerio.CheerioAPI, baseUrl: string, currentPath: string): Array<{ title: string; url: string }> {
  const projects: Array<{ title: string; url: string }> = []
  const seen = new Set<string>()
  const origin = new URL(baseUrl).origin

  // Look in nav links
  $('nav a[href], header a[href], .header-nav a[href]').each((_, el) => {
    const href = $(el).attr('href') || ''
    const text = $(el).text().trim()
    if (!text || text.length > 80) return
    // Skip common non-project links
    if (/about|contact|home|blog|shop|cart|skip|menu|close|search/i.test(text)) return
    if (href === '/' || href === '#' || href === currentPath) return
    // Must be internal link
    const resolved = resolveUrl(href, baseUrl)
    if (!resolved.startsWith(origin)) return
    if (seen.has(resolved)) return
    seen.add(resolved)
    projects.push({ title: text, url: resolved })
  })

  return projects
}

/** Check if a URL looks like a site-wide default/logo rather than real content */
function isLikelySiteDefault(url: string): boolean {
  return /untitled-111|default|placeholder|logo|favicon|site-?icon|brand|header-?logo|nav-?logo|og-?image|social-?share|share-?image|twitter-?card|fb-?image/i.test(url)
}

/** Score an image for hero candidacy — higher is better */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function scoreImageForHero(el: any | null, $: cheerio.CheerioAPI, url: string): number {
  let score = 0

  // Penalize images that look like site defaults
  if (isLikelySiteDefault(url)) score -= 50

  if (!el) return score

  // Check specified dimensions — larger is better for hero
  const width = parseInt($(el).attr('width') || '0')
  const height = parseInt($(el).attr('height') || '0')
  if (width > 600) score += 20
  if (width > 1000) score += 10
  if (height > 400) score += 15
  if (height > 800) score += 10
  // Small specified dimensions = probably not hero material
  if (width > 0 && width < 200) score -= 30
  if (height > 0 && height < 200) score -= 30

  // Check if image is inside main content area (not header/nav/footer)
  const parent = $(el).closest('main, article, [role="main"], .page-content, .content, section[data-section-id], .page-section, .sqs-section')
  if (parent.length > 0) score += 25

  // Penalize images inside header, nav, or footer
  const navParent = $(el).closest('header, nav, footer, .header, .nav, .footer, .header-nav')
  if (navParent.length > 0) score -= 40

  // Bonus for images with descriptive alt text (real content images tend to have alts)
  const alt = $(el).attr('alt') || ''
  if (alt.length > 5) score += 10

  // Bonus for images with srcset (usually real content images)
  if ($(el).attr('srcset')) score += 5

  return score
}

function extractImages($: cheerio.CheerioAPI, baseUrl: string): Array<{ url: string; alt: string; heroScore: number }> {
  const images: Array<{ url: string; alt: string; heroScore: number }> = []
  const seen = new Set<string>()

  // Get og:image — but only add it if it does NOT look like a site-wide default
  const ogImage = $('meta[property="og:image"]').attr('content')
  if (ogImage && !isLikelySiteDefault(ogImage)) {
    const resolved = resolveUrl(ogImage, baseUrl)
    seen.add(resolved)
    // og:image gets a moderate baseline score — real content images from main area can beat it
    images.push({ url: resolved, alt: 'Hero image', heroScore: 10 })
  }

  // Get all img tags — check src, data-src (lazy load), srcset
  $('img').each((_, el) => {
    let src = $(el).attr('src') || $(el).attr('data-src') || ''

    // For Squarespace, also check srcset for highest-res version
    const srcset = $(el).attr('srcset')
    if (srcset) {
      const candidates = srcset.split(',').map(s => s.trim())
      const last = candidates[candidates.length - 1]
      if (last) {
        const srcsetUrl = last.split(/\s+/)[0]
        if (srcsetUrl) src = srcsetUrl
      }
    }

    if (!src) return
    const resolved = resolveUrl(src, baseUrl)

    // Skip duplicates, tiny images, icons, tracking pixels
    if (seen.has(resolved)) return
    if (/favicon|1x1|spacer|pixel|badge|icon/i.test(resolved)) return
    // Skip very small specified dimensions
    const width = parseInt($(el).attr('width') || '0')
    const height = parseInt($(el).attr('height') || '0')
    if ((width > 0 && width < 50) || (height > 0 && height < 50)) return

    seen.add(resolved)
    const heroScore = scoreImageForHero(el, $, resolved)
    images.push({ url: resolved, alt: $(el).attr('alt') || '', heroScore })
  })

  // Squarespace-specific: data-image attributes on containers
  $('[data-image]').each((_, el) => {
    const src = $(el).attr('data-image') || ''
    if (!src) return
    const resolved = resolveUrl(src, baseUrl)
    if (seen.has(resolved)) return
    seen.add(resolved)
    images.push({ url: resolved, alt: '', heroScore: scoreImageForHero(null, $, resolved) })
  })

  // Squarespace-specific: background images in inline styles
  $('[style*="background-image"]').each((_, el) => {
    const style = $(el).attr('style') || ''
    const match = style.match(/url\(['"]?(.*?)['"]?\)/)
    if (match?.[1]) {
      const resolved = resolveUrl(match[1], baseUrl)
      if (!seen.has(resolved)) {
        seen.add(resolved)
        images.push({ url: resolved, alt: '', heroScore: scoreImageForHero(null, $, resolved) })
      }
    }
  })

  return images.slice(0, 20) // cap at 20 images
}

/** Extract a notable quote from marquee blocks, blockquotes, or standalone short paragraphs */
function extractKeyQuote($: cheerio.CheerioAPI): string {
  // Squarespace marquee blocks — try multiple selectors
  const marqueeSelectors = '.sqs-block-marquee, .marquee, [class*="marquee"], .sqs-block-marquee p, [data-block-type="52"] p'
  const marquee = $(marqueeSelectors).first().text().trim()
  if (marquee && marquee.length > 10 && marquee.length < 300) return marquee

  // Blockquotes
  const blockquote = $('blockquote').first().text().trim()
  if (blockquote && blockquote.length > 10) return blockquote.slice(0, 300)

  // Fallback: look for short, impactful standalone paragraphs (likely pull-quotes)
  let fallbackQuote = ''
  $('em, strong, .sqs-block-html h2, .sqs-block-html h3').each((_, el) => {
    if (fallbackQuote) return
    const text = $(el).text().trim()
    if (text.length > 20 && text.length < 200 && /not|is|are|will|can/.test(text.toLowerCase())) {
      fallbackQuote = text
    }
  })

  return fallbackQuote
}

function extractSections($: cheerio.CheerioAPI): Array<{ heading: string; content: string }> {
  const sections: Array<{ heading: string; content: string }> = []

  if (isSquarespace($)) {
    // Squarespace Strategy: Parse each fluid-engine section
    $('section[data-section-id], .page-section, .sqs-section').each((_, sectionEl) => {
      const $section = $(sectionEl)

      // Get all text blocks within this section
      const headings: string[] = []
      const paragraphs: string[] = []

      $section.find('h1, h2, h3, h4').each((_, h) => {
        const text = $(h).text().trim()
        if (text && text.length < 200) headings.push(text)
      })

      $section.find('p, li').each((_, p) => {
        const text = $(p).text().trim()
        if (text && text.length > 5 && !/#block-|--sqs-|\.fe-block-|\{[^}]*:[^}]*;\s*\}/.test(text)) {
          paragraphs.push(text)
        }
      })

      if (paragraphs.length > 0) {
        const heading = headings[0] || 'Content'
        const content = paragraphs.join('\n\n')
        // Skip nav-only or footer-only sections
        if (content.length > 30) {
          sections.push({ heading, content })
        }
      }
    })
  }

  // Fallback: heading + sibling content pairs
  if (sections.length === 0) {
    $('h1, h2, h3').each((_, el) => {
      const heading = $(el).text().trim()
      if (!heading || heading.length > 200) return

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
  }

  // Fallback: Squarespace sqs-block content blocks
  if (sections.length === 0) {
    $('.sqs-block-content').each((_, el) => {
      const heading = $(el).find('h1, h2, h3').first().text().trim()
      const allText = $(el).text().trim()
      const content = heading ? allText.replace(heading, '').trim() : allText
      if (content && content.length > 50) {
        sections.push({ heading: heading || 'Content', content })
      }
    })
  }

  // Fallback: generic content blocks
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

  // Filter out garbage content (JSON configs, CSS rules, form metadata)
  const filtered = sections.filter(s => {
    const c = s.content
    // Skip sections with JSON-like content
    if (/\{"type":\s*"/.test(c) || /\{"identifier"/.test(c)) return false
    // Skip sections with CSS rules
    if (/\{[^}]*:\s*[^}]*;\s*\}/.test(c) && c.split('{').length > 3) return false
    // Skip sections with code/config noise (including Squarespace CSS selectors and custom properties)
    if (/box-shadow:|border-radius:|font-family:|\.sqs-|#block-|--sqs-|--opacity:|--translate-|--scale-|--rotation:|--skew-|\.fe-block-/.test(c)) return false
    // Skip very long sections (likely full-page scrapes with nav/footer noise)
    if (c.length > 15000) return false
    return true
  })

  // Deduplicate sections with similar content
  const unique: Array<{ heading: string; content: string }> = []
  const seenContent = new Set<string>()
  for (const s of filtered) {
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
    const hitCount = keywords.filter(kw => lower.includes(kw)).length
    if (hitCount > 0) matched.push(domain)
  }
  // Sort by relevance (more keyword hits = higher rank)
  matched.sort((a, b) => {
    const aHits = DOMAIN_KEYWORDS[a].filter(kw => lower.includes(kw)).length
    const bHits = DOMAIN_KEYWORDS[b].filter(kw => lower.includes(kw)).length
    return bHits - aHits
  })
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

function suggestStage(allText: string): string {
  const lower = allText.toLowerCase()
  if (/completed|premiered|exhibited|installed|shown at|built in|debuted|launched at|presented at/i.test(lower)) return 'Production'
  if (/fundrais|kickstarter|seeking fund|crowdfund/i.test(lower)) return 'Fundraising'
  if (/engineered|fabricat|under construction|being built|engineering precision|\d{2,}[- ]?foot/i.test(lower)) return 'Engineering'
  if (/design development|detailed design|prototyp|rendering|concept art/i.test(lower)) return 'Design Development'
  return 'Concept'
}

/** Extract artist titles/roles from bio text (e.g. "Artist Engineer, Immersive Technologist") */
function extractTitles(text: string): string[] {
  // Look for comma-separated role lists preceded by "is a/an" or "as a/an"
  const rolePatterns = /(?:is\s+(?:an?\s+)?)((?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:,\s*(?:and\s+)?[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)*))/g
  const matches = text.match(rolePatterns)
  if (!matches) return []

  // Known role-like keywords to validate extracted titles
  const roleKeywords = /artist|designer|engineer|technolog|composer|architect|director|producer|curator|fabricat|developer|manager|scientist|researcher|writer|musician|filmmaker|photographer|sculptor/i

  const titles: string[] = []
  for (const match of matches) {
    const cleaned = match.replace(/^(?:is\s+(?:an?\s+)?)/, '').trim()
    const parts = cleaned.split(/,\s*(?:and\s+)?/)
    for (const part of parts) {
      const trimmed = part.trim()
      // Must be 3-80 chars AND contain a role-like keyword
      if (trimmed.length > 3 && trimmed.length < 80 && roleKeywords.test(trimmed)) {
        titles.push(trimmed)
      }
    }
  }
  return titles
}

/** Extract education from bio text */
function extractEducation(text: string): string[] {
  const education: string[] = []
  // Require word boundary and case-sensitive degree abbreviations to avoid "ms of light" etc.
  const patterns = [
    /\bBS\s+in\s+[\w\s]{3,40}/g,
    /\bBA\s+in\s+[\w\s]{3,40}/g,
    /\bBSc\s+in\s+[\w\s]{3,40}/g,
    /\bB\.S\.\s+in\s+[\w\s]{3,40}/g,
    /\bB\.A\.\s+in\s+[\w\s]{3,40}/g,
    /\bMS\s+in\s+[\w\s]{3,40}/g,
    /\bMSc\s+in\s+[\w\s]{3,40}/g,
    /\bMA\s+in\s+[\w\s]{3,40}/g,
    /\bM\.S\.\s+in\s+[\w\s]{3,40}/g,
    /\bM\.A\.\s+in\s+[\w\s]{3,40}/g,
    /\bMFA\s+in\s+[\w\s]{3,40}/g,
    /\bM\.F\.A\.\s+in\s+[\w\s]{3,40}/g,
    /\bPhD\s+in\s+[\w\s]{3,40}/g,
    /\bPh\.D\.\s+in\s+[\w\s]{3,40}/g,
  ]
  for (const pattern of patterns) {
    const matches = text.match(pattern)
    if (matches) education.push(...matches.map(m => m.trim()))
  }
  return education
}

export async function scrapeProjectPage(url: string): Promise<ScrapedProject> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'ResonanceNetwork/1.0 (Project Import)',
      'Accept': 'text/html,application/xhtml+xml',
    },
    signal: AbortSignal.timeout(15000),
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`)
  }

  const html = await response.text()
  const $ = cheerio.load(html)

  // Remove style and script tags to prevent CSS/JS leaking into text extraction
  $('style, script, noscript').remove()

  // Extract metadata
  const ogTitle = $('meta[property="og:title"]').attr('content')
  const ogDesc = $('meta[property="og:description"]').attr('content')
  const metaDesc = $('meta[name="description"]').attr('content')
  const pageTitle = $('title').text().trim()
  const h1 = $('h1').first().text().trim()
  const currentPath = new URL(url).pathname

  // Best title — clean up "PROJECT — SITE NAME" format
  let title = h1 || ogTitle || pageTitle || 'Untitled'
  title = title.split('—')[0].split('|')[0].split('–')[0].trim()

  // Best description — may be derived from content later if empty
  let shortDescription = ogDesc || metaDesc || ''

  // Extract all content
  const sections = extractSections($)
  const images = extractImages($, url)
  const socialLinks = extractSocialLinks($, url)
  const otherProjects = extractProjectLinks($, url, currentPath)
  const keyQuote = extractKeyQuote($)

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

  // Look for artist name — og:site_name is most reliable on Squarespace
  const siteName = $('meta[property="og:site_name"]').attr('content') || ''
  leadArtistName = siteName || ''

  // Fallback: look in footer for artist name
  if (!leadArtistName) {
    const footerHeading = $('footer h1, footer h2, footer h3, .footer h1, .footer h2').first().text().trim()
    if (footerHeading && footerHeading.length < 60) leadArtistName = footerHeading
  }

  // Clean common nav text from artist name
  leadArtistName = leadArtistName.replace(/home|about|contact|portfolio/gi, '').trim()

  for (const section of sections) {
    const headingLower = section.heading.toLowerCase()
    const contentLower = section.content.toLowerCase()

    // Skip very short, navigational, or bloated sections (likely nav/footer noise)
    if (section.content.length < 30) continue
    if (section.content.length > 15000) continue

    // Artist story / about sections
    if (headingLower.includes('about') || headingLower.includes('artist') ||
        headingLower.includes('why i chose') || headingLower.includes('bio') ||
        headingLower.includes('who is')) {
      if (!artistStory) artistStory = section.content
      else if (!leadArtistBio) leadArtistBio = section.content
    }
    // Goals / mission / why it matters — CHECK BEFORE materials to prevent misclassification
    else if (headingLower.includes('goal') || headingLower.includes('mission') ||
             headingLower.includes('matter') || headingLower.includes('why it')) {
      // Split on double-newline for paragraph-style content, single newline for bullet points
      const paragraphs = section.content.split(/\n\n+/).filter(l => l.trim().length > 10)
      if (paragraphs.length > 0) {
        goals.push(...paragraphs.slice(0, 5))
      } else {
        const lines = section.content.split('\n').filter(l => l.trim().length > 10)
        goals.push(...lines.slice(0, 5))
      }
    }
    // Materials / technical specs (heading-based only, not content-based to avoid false positives)
    else if (headingLower.includes('material') || headingLower.includes('technical') ||
             headingLower.includes('spec') || headingLower.includes('crown') ||
             headingLower.includes('construction') || headingLower.includes('fabricat')) {
      if (!materialsText) materialsText = section.content
      else materialsText += '\n\n' + section.content
    }
    // Experience / interactive features
    else if (headingLower.includes('experience') || headingLower.includes('feature') ||
             headingLower.includes('interactive') || headingLower.includes('eye') ||
             headingLower.includes('ear') || headingLower.includes('see through') ||
             headingLower.includes('speak through') || headingLower.includes('light')) {
      experience += (experience ? '\n\n' : '') + (section.heading !== 'Content' ? `**${section.heading}:** ` : '') + section.content
    }
    // From Vision to Reality (common Squarespace heading)
    else if (headingLower.includes('vision') || headingLower.includes('from vision')) {
      if (!overviewBody) overviewBody = section.content
    }
    // For generic "Content" headings, use content-based classification
    else if (headingLower === 'content') {
      // Try to classify by content keywords
      if (!materialsText && (contentLower.includes('microcontroller') || contentLower.includes('sensor') ||
          contentLower.includes('steel') || contentLower.includes('fabricat'))) {
        materialsText = section.content
      } else if (!experience && (contentLower.includes('interactive') || contentLower.includes('immersive') ||
          contentLower.includes('respond') || contentLower.includes('react'))) {
        experience = section.content
      } else if (!overviewLead) {
        overviewLead = section.content.split('\n\n')[0] || section.content
        const rest = section.content.split('\n\n').slice(1).join('\n\n')
        if (rest) overviewBody = rest
      } else if (!overviewBody) {
        overviewBody = section.content
      }
    }
    // First substantial text = overview
    else if (!overviewLead) {
      overviewLead = section.content.split('\n\n')[0] || section.content
      const rest = section.content.split('\n\n').slice(1).join('\n\n')
      if (rest) overviewBody = rest
    } else if (!overviewBody) {
      overviewBody = section.content
    }
  }

  // Fallback: if overviewLead is still empty, use first section content
  if (!overviewLead && sections.length > 0) {
    const firstSubstantial = sections.find(s => s.content.length > 50 && s.content.length < 15000)
    if (firstSubstantial) {
      overviewLead = firstSubstantial.content.split('\n\n')[0] || firstSubstantial.content
    }
  }

  // If no overview was found, use short description
  if (!overviewLead && shortDescription) {
    overviewLead = shortDescription
  }

  // Derive shortDescription from overviewLead if missing
  if (!shortDescription && overviewLead) {
    shortDescription = overviewLead.slice(0, 300)
  }

  // If we have a key quote and no goals, use it
  if (keyQuote && goals.length === 0) {
    goals.push(keyQuote)
  }

  // Hero image = pick the image with the highest hero score, not just the first
  let heroImageUrl: string | null = null
  let galleryImages: Array<{ url: string; alt: string }> = []

  if (images.length > 0) {
    // Find the best hero candidate by score
    let bestIdx = 0
    let bestScore = images[0].heroScore
    for (let i = 1; i < images.length; i++) {
      if (images[i].heroScore > bestScore) {
        bestScore = images[i].heroScore
        bestIdx = i
      }
    }
    heroImageUrl = images[bestIdx].url
    // Gallery = all other images (preserving original order)
    galleryImages = images
      .filter((_, i) => i !== bestIdx)
      .map(({ url, alt }) => ({ url, alt }))
  }

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
    suggestedStage: suggestStage(allText),
    suggestedScale: suggestScale(allText),
    sourceUrl: url,
    sections,
    otherProjects,
    keyQuote,
  }
}

export async function scrapeProfilePage(url: string): Promise<ScrapedProfile> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'ResonanceNetwork/1.0 (Profile Import)',
      'Accept': 'text/html,application/xhtml+xml',
    },
    signal: AbortSignal.timeout(15000),
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`)
  }

  const html = await response.text()
  const $ = cheerio.load(html)

  // Remove style and script tags to prevent CSS/JS leaking into text extraction
  $('style, script, noscript').remove()

  const currentPath = new URL(url).pathname

  const ogTitle = $('meta[property="og:title"]').attr('content')
  const h1 = $('h1').first().text().trim()
  const siteName = $('meta[property="og:site_name"]').attr('content') || ''

  // For about pages, prefer site name over page title
  let name = siteName || h1 || ogTitle || 'Unknown Artist'
  // Clean up "ABOUT/CONTACT — GAZELLE DASTI" patterns
  name = name.split('—')[0].split('|')[0].split('–')[0].trim()
  if (/about|contact/i.test(name)) name = siteName || h1 || 'Unknown Artist'

  const sections = extractSections($)
  const images = extractImages($, url)
  const socialLinks = extractSocialLinks($, url)
  const otherProjects = extractProjectLinks($, url, currentPath)

  // Combine all text
  const allText = sections.map(s => s.content).join('\n\n')

  // Extract structured info from bio text
  const titles = extractTitles(allText)
  const education = extractEducation(allText)

  // Combine sections as bio — skip very short ones, contact forms, and CSS/JSON noise
  const bio = sections
    .filter(s => s.content.length > 30 && !/thank you|submit|required/i.test(s.content))
    .map(s => s.content)
    .join('\n\n')
    // Strip CSS rules (class selectors, ID selectors, and Squarespace blocks)
    .replace(/[.#][a-zA-Z_][\w-]*\s*\{[^}]*\}/g, '')
    // Strip multi-line CSS custom property blocks
    .replace(/#block-[\w-]+\s*\{[^}]*\}/g, '')
    // Strip remaining Squarespace CSS noise
    .replace(/--sqs-[\w-]+:\s*[^;]+;/g, '')
    .replace(/\{"type":[^}]*\}/g, '')
    .replace(/\s{3,}/g, '\n\n')
    .trim()
    .slice(0, 5000)

  // For profile pages: first content image = avatar, og:image or next = hero
  // Skip logo-type images for avatar
  let avatarUrl: string | null = null
  let heroImageUrl: string | null = null
  const galleryImages: Array<{ url: string; alt: string }> = []

  for (const img of images) {
    // Headshot detection: look for portrait-like images (JPG, with person-like filenames)
    if (!avatarUrl && /\.(jpg|jpeg|png)/i.test(img.url) && !/logo|icon|banner|untitled-111/i.test(img.url)) {
      avatarUrl = img.url
    } else if (!heroImageUrl) {
      heroImageUrl = img.url
    } else {
      galleryImages.push({ url: img.url, alt: img.alt })
    }
  }

  return {
    name,
    bio,
    titles,
    education,
    avatarUrl,
    heroImageUrl,
    galleryImages,
    socialLinks,
    website: new URL(url).origin,
    sections,
    otherProjects,
  }
}
