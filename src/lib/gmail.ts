import nodemailer from 'nodemailer'

// Use Nodemailer with Gmail SMTP — works reliably from any server
// Requires either:
// 1. GMAIL_APP_PASSWORD (App Password from Google Account settings)
// 2. Or falls back to OAuth2 if available

function getTransporter() {
  const appPassword = process.env.GMAIL_APP_PASSWORD
  const user = 'resonanceartcollective@gmail.com'

  if (appPassword) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass: appPassword },
    })
  }

  // Fallback: OAuth2 (works from localhost but may fail from Vercel)
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN

  if (clientId && clientSecret && refreshToken) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user,
        clientId,
        clientSecret,
        refreshToken,
      },
    })
  }

  return null
}

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const transporter = getTransporter()

  if (!transporter) {
    console.error('EMAIL NOT SENT: No Gmail credentials configured (need GMAIL_APP_PASSWORD or OAuth2 creds)')
    return
  }

  try {
    const result = await transporter.sendMail({
      from: 'Resonance Network <resonanceartcollective@gmail.com>',
      to,
      subject,
      html,
    })
    console.log(`Email sent: to=${to}, messageId=${result.messageId}`)
    return result
  } catch (err: unknown) {
    const error = err as Error
    console.error(`Email send error: ${error.message}`)
    throw err
  }
}
