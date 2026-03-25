import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { sanitizeText, validateEmail, getClientIp } from '@/lib/sanitize'
import { sendSubmissionNotification } from '@/lib/notify'
import { sendEmail } from '@/lib/gmail'

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
    if (origin && !origin.includes('resonance') && !origin.includes('localhost') && !origin.includes('vercel.app')) {
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
    const collaborationNeeds = sanitizeText(body.collaborationNeeds, 5000)
    const artistHeadshotData = typeof body.artistHeadshotData === 'string' && body.artistHeadshotData.length <= 7_340_032 ? body.artistHeadshotData : null

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
        collaboration_needs: collaborationNeeds || null,
        artist_headshot_data: artistHeadshotData || null,
        status: 'new',
      })
      .select('id')
      .single()

    if (error) {
      console.error('Supabase insert error:', error.message)
      return NextResponse.json(
        { success: false, message: 'Failed to save submission. Please try again.' },
        { status: 500 }
      )
    }

    // Send emails BEFORE responding (Vercel kills the function after response)
    const previewUrl = `/preview/project/${inserted.id}`
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://resonance-network.vercel.app'

    try {
      await sendSubmissionNotification('project', {
        project_title: projectTitle,
        artist_name: artistName,
        artist_email: artistEmail,
        stage,
        location,
        one_sentence: oneSentence,
      }, previewUrl)
    } catch (err) { console.error('Admin notification error:', (err as Error).message) }

    try {
      await sendEmail({
        to: artistEmail,
        subject: 'We received your project submission — Resonance Network',
      html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:40px 24px">
<div style="background:#fff;border-radius:12px;padding:32px;border:1px solid #e5e2dc">
<h2 style="color:#14b8a6;margin:0 0 16px;font-size:14px;text-transform:uppercase;letter-spacing:0.1em">Resonance Network</h2>
<p>Hi ${artistName},</p>
<p>Thank you for submitting <strong>${projectTitle}</strong> to Resonance Network. Our curation team will review your submission within two weeks.</p>
<p>You can preview how your page will look:</p>
<div style="text-align:center;margin:24px 0">
<a href="${siteUrl}${previewUrl}" style="display:inline-block;padding:14px 32px;background:#14b8a6;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">Preview Your Project Page</a>
</div>
<p>We'll be in touch soon!</p>
<p style="color:#888;margin-top:24px">— The Resonance Network Team</p>
</div></div>`,
    })
    } catch (err) { console.error('Applicant confirmation error:', (err as Error).message) }

    return NextResponse.json({
      success: true,
      message: 'Submission received successfully.',
      previewUrl,
    })
  } catch {
    console.error('Submit project error: unexpected server error')
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again.' },
      { status: 500 }
    )
  }
}
