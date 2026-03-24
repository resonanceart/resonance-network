import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendSubmissionNotification } from '@/lib/notify'
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
    if (origin && !origin.includes('resonance') && !origin.includes('localhost') && !origin.includes('vercel.app')) {
      return NextResponse.json(
        { success: false, message: 'Invalid request origin.' },
        { status: 403 }
      )
    }

    const data = await request.json()

    const name = sanitizeText(data.name, 200)
    const email = validateEmail(data.email)
    const photoUrl = sanitizeText(data.photoUrl, 500)
    const skills = sanitizeText(data.skills, 5000)
    const portfolio = sanitizeText(data.portfolio, 5000)
    const availability = sanitizeText(data.availability, 100)
    const notes = sanitizeText(data.notes, 5000)
    const bio = sanitizeText(data.bio, 5000)
    const location = sanitizeText(data.location, 200)
    const headshotData = typeof data.headshotData === 'string' && data.headshotData.length <= 7_340_032 ? data.headshotData : null
    const website = sanitizeText(data.website, 500)

    if (!name || !email || !skills) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and skills are required.' },
        { status: 400 }
      )
    }

    // Store in Supabase
    const { data: inserted, error } = await supabaseAdmin
      .from('collaborator_profiles')
      .insert({
        name,
        email,
        photo_url: photoUrl || null,
        skills,
        portfolio: website || portfolio || null,
        availability: availability || null,
        notes: notes || null,
        bio: bio || null,
        location: location || null,
        headshot_data: headshotData || null,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Supabase insert error:', error.message)
      return NextResponse.json(
        { success: false, message: 'Failed to save your profile. Please try again.' },
        { status: 500 }
      )
    }

    // Send formatted notification (non-blocking)
    if (inserted) {
      sendSubmissionNotification('profile', { name, email, skills, availability, portfolio }, `/preview/profile/${inserted.id}`)
        .catch(err => console.error('Notification error:', err))
    }

    return NextResponse.json({
      success: true,
      message: "Your profile has been submitted. We'll connect you with matching projects soon.",
      previewUrl: inserted ? `/preview/profile/${inserted.id}` : undefined,
    })
  } catch {
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
