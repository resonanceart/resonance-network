import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendEmail } from '@/lib/gmail'
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

    // Send styled admin notification
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://resonance-network.vercel.app'
    for (const recipient of recipients) {
      try {
        await sendEmail({
          to: recipient,
          subject: `New interest in ${taskTitle || 'a role'} on ${projectTitle || 'Resonance Network'}`,
          html: `<div style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:40px 24px">
<div style="background:#fff;border-radius:12px;padding:32px;border:1px solid #e5e2dc">
  <h2 style="color:#14b8a6;margin:0 0 20px;font-size:14px;text-transform:uppercase;letter-spacing:0.1em">Resonance Network</h2>
  <h1 style="margin:0 0 4px;font-size:20px;color:#1a1a1a">Someone wants to collaborate</h1>
  <p style="margin:0 0 20px;color:#888;font-size:14px">on <strong>${projectTitle || 'Resonance Network'}</strong> — ${taskTitle || 'General interest'}</p>
  <table style="width:100%;border-collapse:collapse;font-size:14px">
    <tr><td style="padding:8px 0;color:#888;width:100px;vertical-align:top">Name</td><td style="padding:8px 0;color:#333;font-weight:600">${name}</td></tr>
    <tr><td style="padding:8px 0;color:#888;vertical-align:top">Email</td><td style="padding:8px 0"><a href="mailto:${email}" style="color:#14b8a6">${email}</a></td></tr>
    ${phone ? `<tr><td style="padding:8px 0;color:#888;vertical-align:top">Phone</td><td style="padding:8px 0;color:#333">${phone}</td></tr>` : ''}
    <tr><td style="padding:8px 0;color:#888;vertical-align:top;border-top:1px solid #eee">Experience</td><td style="padding:8px 0;color:#333;border-top:1px solid #eee;line-height:1.5">${experience}</td></tr>
  </table>
  <div style="text-align:center;margin:24px 0">
    <a href="mailto:${email}?subject=Re:%20Your%20interest%20in%20${encodeURIComponent(taskTitle || 'collaborating')}%20on%20${encodeURIComponent(projectTitle || 'Resonance Network')}" style="display:inline-block;padding:12px 28px;background:#14b8a6;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px">Reply to ${name.split(' ')[0]}</a>
  </div>
  <p style="text-align:center;margin:0"><a href="${siteUrl}/admin" style="color:#888;font-size:12px;text-decoration:underline">View in Admin Dashboard</a></p>
</div>
<p style="text-align:center;margin-top:20px;font-size:11px;color:#aaa">Resonance Network — resonanceartcollective@gmail.com</p>
</div>`,
        })
      } catch (err) { console.error('Admin notification error:', (err as Error).message) }
    }

    // Send confirmation to applicant
    try {
      await sendEmail({
        to: email,
        subject: `We received your interest — Resonance Network`,
        html: `<div style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:40px 24px">
<div style="background:#fff;border-radius:12px;padding:32px;border:1px solid #e5e2dc">
  <h2 style="color:#14b8a6;margin:0 0 16px;font-size:14px;text-transform:uppercase;letter-spacing:0.1em">Resonance Network</h2>
  <p>Hi ${name.split(' ')[0]},</p>
  <p>Thanks for your interest in <strong>${taskTitle || 'collaborating'}</strong> on <strong>${projectTitle || 'a Resonance Network project'}</strong>.</p>
  <p>The project team has been notified and will reach out if there's a good fit. In the meantime, feel free to explore other open roles on the network.</p>
  <div style="text-align:center;margin:24px 0">
    <a href="${siteUrl}/collaborate" style="display:inline-block;padding:12px 28px;background:#14b8a6;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px">Browse Open Roles</a>
  </div>
  <p style="color:#888;margin-top:20px">— The Resonance Network Team</p>
</div>
</div>`,
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
