import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { name, email, photoUrl, skills, portfolio, availability, notes } = data

    if (!name || !email || !skills) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and skills are required.' },
        { status: 400 }
      )
    }

    // Store in Supabase
    const { error } = await supabaseAdmin
      .from('collaborator_profiles')
      .insert({
        name,
        email,
        photo_url: photoUrl || null,
        skills,
        portfolio: portfolio || null,
        availability: availability || null,
        notes: notes || null,
      })

    if (error) {
      console.error('Supabase insert error:', error)
      // Fall back to logging if database isn't set up yet
      console.log('=== New Collaborator Profile (fallback log) ===')
      console.log({ name, email, photoUrl, skills, portfolio, availability, notes })
    }

    // TODO: Add email notification via SendGrid or Resend
    // Send notification to resonanceartcollective@gmail.com

    return NextResponse.json({
      success: true,
      message: "Your profile has been submitted. We'll connect you with matching projects soon.",
    })
  } catch {
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
