import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendNotification } from '@/lib/notify'
import projectsData from '../../../../data/projects.json'
import { rateLimit } from '@/lib/rate-limit'
import { sanitizeText, validateEmail, getClientIp } from '@/lib/sanitize'

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

    const origin = request.headers.get('origin')
    if (origin && !origin.includes('resonance.network') && !origin.includes('localhost')) {
      return NextResponse.json(
        { success: false, message: 'Invalid request origin.' },
        { status: 403 }
      )
    }

    const data = await request.json()

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
      })

    if (error) {
      console.error('Supabase insert error:', error)
      console.log('=== New Collaboration Interest (fallback log) ===')
      console.log({ name, email, phone, experience, taskTitle, projectTitle })
    }

    // Send notification emails (non-blocking)
    const recipients = ['resonanceartcollective@gmail.com']
    const artistEmail = projectTitle ? getProjectContactEmail(projectTitle) : null
    if (artistEmail && artistEmail !== 'resonanceartcollective@gmail.com') {
      recipients.push(artistEmail)
    }

    sendNotification({
      to: recipients,
      subject: `New collaboration interest: ${taskTitle || 'General'} on ${projectTitle || 'Resonance Network'}`,
      body: [
        `Someone is interested in collaborating!\n`,
        `Role: ${taskTitle || 'Not specified'}`,
        `Project: ${projectTitle || 'Not specified'}`,
        ``,
        `— Submitter Details —`,
        `Name: ${name}`,
        `Email: ${email}`,
        phone ? `Phone: ${phone}` : null,
        ``,
        `— Relevant Experience —`,
        experience,
        ``,
        `---`,
        `Submitted via Resonance Network`,
      ].filter(Boolean).join('\n'),
    }).catch(err => console.error('Notification error:', err))

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
