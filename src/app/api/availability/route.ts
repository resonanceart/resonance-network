import { NextResponse } from 'next/server'

// TODO: Add email notification via SendGrid or Resend
// When an email service is configured, send a notification to
// resonanceartcollective@gmail.com with the collaborator profile details.

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

    // Log submission for now — replace with database/email service
    console.log('=== New Collaborator Profile ===')
    console.log(`Name: ${name}`)
    console.log(`Email: ${email}`)
    if (photoUrl) console.log(`Photo: ${photoUrl}`)
    console.log(`Skills: ${skills}`)
    if (portfolio) console.log(`Portfolio: ${portfolio}`)
    if (availability) console.log(`Availability: ${availability}`)
    if (notes) console.log(`Notes: ${notes}`)
    console.log('================================')

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
