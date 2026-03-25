import { sendEmail } from './gmail'

interface NotificationPayload {
  to: string[]
  subject: string
  body: string
}

/**
 * Legacy notification function — kept for backwards compatibility.
 * Calls sendSubmissionNotification internally when possible,
 * or falls back to console logging.
 */
export async function sendNotification({ to, subject, body }: NotificationPayload) {
  // Log subject only (no PII in production logs)
  console.log(`Sending notification: ${subject}`)

  for (const recipient of to) {
    try {
      await sendEmail({
        to: recipient,
        subject,
        html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#333"><pre style="white-space:pre-wrap;font-family:inherit">${body}</pre></div>`,
      })
    } catch (err) {
      console.error(`Email send failed to ${recipient}:`, (err as Error).message)
    }
  }
}

/**
 * Send a formatted notification email for new submissions.
 */
export async function sendSubmissionNotification(
  type: 'project' | 'profile',
  data: Record<string, unknown>,
  previewUrl: string
) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://resonance-network.vercel.app'
  // Admin preview URL includes ?admin=true so you get the approve/reject controls
  const fullPreviewUrl = siteUrl + previewUrl + '?admin=true'
  const adminUrl = siteUrl + '/admin'

  const subject = type === 'project'
    ? `New Project Submission: ${data.project_title || data.projectTitle || 'Untitled'}`
    : `New Collaborator Profile: ${data.name || 'Unknown'}`

  const html = buildEmailTemplate(type, data, fullPreviewUrl, adminUrl)

  try {
    await sendEmail({ to: 'resonanceartcollective@gmail.com', subject, html })
  } catch (err) {
    console.error('Email send failed:', (err as Error).message)
  }
}

function buildEmailTemplate(
  type: string,
  data: Record<string, unknown>,
  previewUrl: string,
  adminUrl: string
): string {
  const isProject = type === 'project'
  const title = isProject
    ? String(data.project_title || data.projectTitle || 'New Project')
    : String(data.name || 'New Profile')
  const subtitle = isProject
    ? `by ${data.artist_name || data.artistName || 'Unknown Artist'}`
    : String(data.skills || data.email || '')

  const details = isProject
    ? [
        data.artist_name && `<strong>Artist:</strong> ${data.artist_name}`,
        data.artist_email && `<strong>Email:</strong> ${data.artist_email}`,
        data.stage && `<strong>Stage:</strong> ${data.stage}`,
        data.location && `<strong>Location:</strong> ${data.location}`,
        data.one_sentence && `<strong>Summary:</strong> ${data.one_sentence}`,
      ].filter(Boolean)
    : [
        data.name && `<strong>Name:</strong> ${data.name}`,
        data.email && `<strong>Email:</strong> ${data.email}`,
        data.skills && `<strong>Skills:</strong> ${data.skills}`,
        data.availability && `<strong>Availability:</strong> ${data.availability}`,
        data.portfolio && `<strong>Portfolio:</strong> ${data.portfolio}`,
      ].filter(Boolean)

  return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f5f3ee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px">
    <div style="text-align:center;margin-bottom:32px">
      <h2 style="color:#14b8a6;margin:0;font-size:14px;text-transform:uppercase;letter-spacing:0.1em">Resonance Network</h2>
    </div>
    <div style="background:#fff;border-radius:12px;padding:32px;border:1px solid #e5e2dc">
      <h1 style="margin:0 0 4px;font-size:22px;color:#1a1a1a">${title}</h1>
      <p style="margin:0 0 24px;color:#888;font-size:14px">${subtitle}</p>
      <div style="border-top:1px solid #eee;padding-top:20px;margin-bottom:24px">
        ${(details as string[]).map(d => `<p style="margin:6px 0;font-size:14px;color:#444">${d}</p>`).join('')}
      </div>
      <div style="text-align:center;margin:28px 0">
        <a href="${previewUrl}" style="display:inline-block;padding:14px 32px;background:#14b8a6;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px">Preview This Submission</a>
      </div>
      <div style="text-align:center">
        <a href="${adminUrl}" style="color:#888;font-size:13px;text-decoration:underline">Go to Admin Dashboard</a>
      </div>
    </div>
    <p style="text-align:center;margin-top:24px;font-size:12px;color:#aaa">Resonance Network — resonanceartcollective@gmail.com</p>
  </div>
</body>
</html>`
}
