import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendEmail } from '@/lib/gmail'
import { collaborationInterestNotification, collaborationInterestConfirmation } from '@/lib/email-templates'
import projectsData from '../../../../data/projects.json'
import { rateLimit } from '@/lib/rate-limit'
import { sanitizeText, validateEmail, getClientIp } from '@/lib/sanitize'
import { validateCsrf } from '@/lib/csrf'

// Look up the project artist's contact email
function getProjectContactEmail(projectTitle: string): string | null {
  const project = (projectsData as Array<{ title: string; contactEmail?: string }>)
    .find(p => p.title === projectTitle)
  return project?.contactEmail || null
}

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

    // Optional auth: link interest to user account if logged in
    let userId: string | null = null
    try {
      const { createSupabaseServerClient } = await import('@/lib/supabase-server')
      const supabase = await createSupabaseServerClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        userId = user.id
        // Fetch user profile for defaults
        const { data: userProfile } = await supabaseAdmin
          .from('user_profiles')
          .select('display_name, email')
          .eq('id', user.id)
          .single()
        if (userProfile) {
          if (!data.name && userProfile.display_name) data.name = userProfile.display_name
          if (!data.email && userProfile.email) data.email = userProfile.email
        }
      }
    } catch {
      // Not authenticated, continue anonymously
    }

    const name = sanitizeText(data.name, 200)
    const email = validateEmail(data.email)
    const phone = sanitizeText(data.phone, 20)
    const experience = sanitizeText(data.experience, 5000)
    const taskTitle = sanitizeText(data.taskTitle, 200)
    const projectTitle = sanitizeText(data.projectTitle, 200)

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
        user_id: userId,
      })

    if (error) {
      console.error('Supabase insert error:', error.message)
      return NextResponse.json(
        { success: false, message: 'Failed to save your interest. Please try again.' },
        { status: 500 }
      )
    }

    // Send notification emails (non-blocking)
    const recipients = ['resonanceartcollective@gmail.com']
    const artistEmail = projectTitle ? getProjectContactEmail(projectTitle) : null
    if (artistEmail && artistEmail !== 'resonanceartcollective@gmail.com') {
      recipients.push(artistEmail)
    }

    // Send styled admin/artist notification
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://resonance-network.vercel.app'
    for (const recipient of recipients) {
      try {
        const notifEmail = collaborationInterestNotification({
          recipientName: recipient === 'resonanceartcollective@gmail.com' ? 'Team' : 'there',
          applicantName: name,
          applicantEmail: email,
          taskTitle: taskTitle || '',
          projectTitle: projectTitle || '',
          experience,
          phone: phone || undefined,
        })
        await sendEmail({
          to: recipient,
          subject: notifEmail.subject,
          html: notifEmail.html,
        })
      } catch (err) { console.error('Admin notification error:', (err as Error).message) }
    }

    // Send confirmation to applicant
    try {
      const confirmEmail = collaborationInterestConfirmation(
        name,
        taskTitle || '',
        projectTitle || '',
        `${siteUrl}/collaborate`
      )
      await sendEmail({
        to: email,
        subject: confirmEmail.subject,
        html: confirmEmail.html,
      })
    } catch (err) { console.error('Applicant confirmation error:', (err as Error).message) }

    // Create in-app message for project creator if they have an account
    try {
      const { data: creatorProfile } = await supabaseAdmin
        .from('user_profiles')
        .select('id')
        .eq('email', artistEmail)
        .single()

      if (creatorProfile) {
        await supabaseAdmin.from('user_messages').insert({
          recipient_id: creatorProfile.id,
          sender_name: name,
          subject: `New interest in "${taskTitle || 'a role'}" on ${projectTitle}`,
          body: `${name} (${email}) is interested in collaborating.\n\nExperience: ${experience}${phone ? `\nPhone: ${phone}` : ''}`,
          message_type: 'collaboration_interest',
          related_project: projectTitle,
          related_task: taskTitle,
        })
      }
    } catch (err) { console.error('In-app message error:', (err as Error).message) }

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
