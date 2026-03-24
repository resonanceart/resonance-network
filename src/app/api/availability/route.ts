import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendNotification } from '@/lib/notify'

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
    const { data: inserted, error } = await supabaseAdmin
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
      .select('id')
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      console.log('=== New Collaborator Profile (fallback log) ===')
      console.log({ name, email, photoUrl, skills, portfolio, availability, notes })
    }

    // Send notification email (non-blocking)
    sendNotification({
      to: ['resonanceartcollective@gmail.com'],
      subject: `New collaborator profile: ${name}`,
      body: [
        `A new collaborator has submitted their profile!\n`,
        `— Profile Details —`,
        `Name: ${name}`,
        `Email: ${email}`,
        photoUrl ? `Photo: ${photoUrl}` : null,
        ``,
        `— Skills & Expertise —`,
        skills,
        portfolio ? `\n— Portfolio / Past Projects —\n${portfolio}` : null,
        availability ? `\nAvailability: ${availability}` : null,
        notes ? `\n— Additional Notes —\n${notes}` : null,
        ``,
        `---`,
        `Submitted via Resonance Network`,
      ].filter(Boolean).join('\n'),
    }).catch(err => console.error('Notification error:', err))

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
