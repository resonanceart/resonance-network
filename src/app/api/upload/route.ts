import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/sanitize'
import { slugify } from '@/lib/slugify'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_SIZES: Record<string, number> = {
  avatar: 5 * 1024 * 1024,
  cover: 10 * 1024 * 1024,
  gallery: 10 * 1024 * 1024,
  resume: 10 * 1024 * 1024,
  portfolio: 10 * 1024 * 1024,
  hero: 10 * 1024 * 1024,
  pastwork: 10 * 1024 * 1024,
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif', 'image/bmp', 'image/tiff', 'image/svg+xml', 'image/avif']
const ALLOWED_PDF_TYPES = ['application/pdf']
const BUCKET = 'profile-uploads'

export async function POST(request: Request) {
  try {
    // Auth check
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limit file uploads
    const ip = getClientIp(request)
    if (!rateLimit(ip)) {
      return NextResponse.json({ error: 'Too many uploads. Please wait.' }, { status: 429 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const type = (formData.get('type') as string) || 'gallery'
    const projectSlug = formData.get('projectSlug') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate size
    const maxSize = MAX_SIZES[type] || 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum ${Math.round(maxSize / 1024 / 1024)}MB.` },
        { status: 400 }
      )
    }

    // Validate type
    const isPdf = type === 'resume' || type === 'portfolio'
    const allowedTypes = isPdf ? [...ALLOWED_IMAGE_TYPES, ...ALLOWED_PDF_TYPES] : ALLOWED_IMAGE_TYPES
    if (!allowedTypes.includes(file.type)) {
      const friendlyTypes = isPdf
        ? 'JPG, PNG, WebP, GIF, HEIC, AVIF, BMP, TIFF, SVG, or PDF'
        : 'JPG, PNG, WebP, GIF, HEIC, AVIF, BMP, TIFF, or SVG'
      return NextResponse.json(
        { error: `"${file.name}" is not a supported file type (${file.type || 'unknown'}). Accepted formats: ${friendlyTypes}.` },
        { status: 400 }
      )
    }

    // Fetch display name for human-readable storage paths
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('display_name')
      .eq('id', user.id)
      .single()
    const nameSlug = slugify(profile?.display_name || '') || 'user'

    // Build storage path with human-readable naming
    const ext = file.name.split('.').pop()?.toLowerCase() || (isPdf ? 'pdf' : 'jpg')
    const timestamp = Date.now()
    const path = projectSlug
      ? `${user.id}/${nameSlug}/projects/${projectSlug}/${type}/${projectSlug}-${type}-${timestamp}.${ext}`
      : `${user.id}/${nameSlug}/${type}/${nameSlug}-${type}-${timestamp}.${ext}`

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type,
      })

    if (error) {
      console.error('Storage upload error:', error.message, error.statusCode)
      return NextResponse.json({ error: `Upload failed: ${error.message}. Please try again.` }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(BUCKET)
      .getPublicUrl(data.path)

    return NextResponse.json({ url: urlData.publicUrl, path: data.path })
  } catch (err) {
    console.error('Upload route error:', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
