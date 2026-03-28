import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase'

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

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
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

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const type = (formData.get('type') as string) || 'gallery'

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
      return NextResponse.json(
        { error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Build storage path: userId/type/timestamp.ext
    const ext = file.name.split('.').pop()?.toLowerCase() || (isPdf ? 'pdf' : 'jpg')
    const timestamp = Date.now()
    const path = `${user.id}/${type}/${timestamp}.${ext}`

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type,
      })

    if (error) {
      console.error('Storage upload error:', error.message)
      return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 })
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
