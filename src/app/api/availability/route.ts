import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendSubmissionNotification } from '@/lib/notify'
import { sendEmail } from '@/lib/gmail'
import { rateLimit } from '@/lib/rate-limit'
import { sanitizeText, validateEmail, getClientIp } from '@/lib/sanitize'
import { validateCsrf } from '@/lib/csrf'

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    if (!rateLimit(ip)) {
      return NextResponse.json(
        { success: false, message: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    if (!validateCsrf(request)) {
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

    // Send emails BEFORE responding (Vercel kills function after response)
    if (inserted) {
      try {
        await sendSubmissionNotification('profile', { name, email, skills, availability, portfolio: website || portfolio }, `/preview/profile/${inserted.id}`)
      } catch (err) { console.error('Admin notification error:', (err as Error).message) }

      if (email) {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://resonance.network'
        try {
          await sendEmail({
            to: email,
            subject: 'We received your profile — Resonance Network',
            html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:40px 24px">
<div style="background:#fff;border-radius:12px;padding:32px;border:1px solid #e5e2dc">
<h2 style="color:#14b8a6;margin:0 0 16px;font-size:14px;text-transform:uppercase;letter-spacing:0.1em">Resonance Network</h2>
<p>Hi ${name},</p>
<p>Thank you for submitting your collaborator profile to Resonance Network. We'll review it and connect you with matching projects soon.</p>
<p>You can preview your profile here:</p>
<div style="text-align:center;margin:24px 0">
<a href="${siteUrl}/preview/profile/${inserted.id}" style="display:inline-block;padding:14px 32px;background:#14b8a6;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">Preview Your Profile</a>
</div>
<p>Welcome to the network!</p>
<p style="color:#888;margin-top:24px">— The Resonance Network Team</p>
</div></div>`,
          })
        } catch (err) { console.error('Applicant confirmation error:', (err as Error).message) }
      }
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
