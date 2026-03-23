import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { name, email, phone, experience, taskTitle, projectTitle } = data

    if (!name || !email || !experience) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and experience are required.' },
        { status: 400 }
      )
    }

    // Store in Supabase
    const { error } = await supabaseAdmin
      .from('collaboration_interest')
      .insert({
        name,
        email,
        phone: phone || null,
        experience,
        task_title: taskTitle || null,
        project_title: projectTitle || null,
      })

    if (error) {
      console.error('Supabase insert error:', error)
      // Fall back to logging if database isn't set up yet
      console.log('=== New Collaboration Interest (fallback log) ===')
      console.log({ name, email, phone, experience, taskTitle, projectTitle })
    }

    // TODO: Add email notification via SendGrid or Resend
    // Send notification to resonanceartcollective@gmail.com

    return NextResponse.json({
      success: true,
      message: "Your interest has been received. The project team will be in touch soon.",
    })
  } catch {
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
