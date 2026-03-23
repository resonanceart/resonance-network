import { NextResponse } from 'next/server'

// TODO: Add email notification via SendGrid or Resend
// When an email service is configured, send a notification to
// resonanceartcollective@gmail.com with the collaboration interest details.

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

    // Log submission for now — replace with database/email service
    console.log('=== New Collaboration Interest ===')
    console.log(`Task: ${taskTitle}`)
    console.log(`Project: ${projectTitle}`)
    console.log(`Name: ${name}`)
    console.log(`Email: ${email}`)
    if (phone) console.log(`Phone: ${phone}`)
    console.log(`Experience: ${experience}`)
    console.log('=================================')

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
