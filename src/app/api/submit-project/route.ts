import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { sanitizeText, validateEmail, getClientIp } from '@/lib/sanitize'

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    if (!rateLimit(ip)) {
      return NextResponse.json(
        { success: false, message: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const origin = request.headers.get('origin')
    if (origin && !origin.includes('resonance.network') && !origin.includes('localhost')) {
      return NextResponse.json(
        { success: false, message: 'Invalid request origin.' },
        { status: 403 }
      )
    }

    const body = await request.json()

    const artistName = sanitizeText(body.artistName, 200)
    const artistBio = sanitizeText(body.artistBio, 5000)
    const artistEmail = validateEmail(body.artistEmail)
    const artistWebsite = sanitizeText(body.artistWebsite, 500)
    const projectTitle = sanitizeText(body.projectTitle, 200)
    const oneSentence = sanitizeText(body.oneSentence, 500)
    const vision = sanitizeText(body.vision, 5000)
    const experience = sanitizeText(body.experience, 5000)
    const story = sanitizeText(body.story, 5000)
    const goals = sanitizeText(body.goals, 5000)
    const stage = sanitizeText(body.stage, 100)
    const scale = sanitizeText(body.scale, 200)
    const location = sanitizeText(body.location, 200)
    const materials = sanitizeText(body.materials, 5000)
    const specialNeeds = sanitizeText(body.specialNeeds, 5000)
    const domains = Array.isArray(body.domains) ? body.domains.filter((d: unknown) => typeof d === 'string').map((d: string) => d.slice(0, 100)) : null
    const pathways = Array.isArray(body.pathways) ? body.pathways.filter((p: unknown) => typeof p === 'string').map((p: string) => p.slice(0, 100)) : null
    const heroImageData = typeof body.heroImageData === 'string' && body.heroImageData.length <= 7_340_032 ? body.heroImageData : null
    const galleryImagesData = typeof body.galleryImagesData === 'string' && body.galleryImagesData.length <= 44_040_192 ? body.galleryImagesData : null

    if (!artistName || !artistEmail || !projectTitle) {
      return NextResponse.json(
        { success: false, message: 'Valid name, email, and project title are required.' },
        { status: 400 }
      )
    }

    const { data: inserted, error } = await supabaseAdmin
      .from('project_submissions')
      .insert({
        artist_name: artistName,
        artist_bio: artistBio || null,
        artist_email: artistEmail,
        artist_website: artistWebsite || null,
        project_title: projectTitle,
        one_sentence: oneSentence || null,
        vision: vision || null,
        experience: experience || null,
        story: story || null,
        goals: goals || null,
        domains: domains || null,
        pathways: pathways || null,
        stage: stage || null,
        scale: scale || null,
        location: location || null,
        materials: materials || null,
        special_needs: specialNeeds || null,
        hero_image_data: heroImageData || null,
        gallery_images_data: galleryImagesData || null,
        status: 'new',
      })
      .select('id')
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to save submission. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Submission received successfully.',
      previewUrl: `/preview/project/${inserted.id}`,
    })
  } catch (err) {
    console.error('Submit project error:', err)
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again.' },
      { status: 500 }
    )
  }
}
