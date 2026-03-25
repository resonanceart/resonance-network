import { google } from 'googleapis'

// Lazy initialization — only create the client when sendEmail is actually called
// This prevents crashes if env vars aren't available at module load time
let gmailClient: ReturnType<typeof google.gmail> | null = null

function getGmailClient() {
  if (gmailClient) return gmailClient

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    console.error('Gmail credentials missing:', {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      hasRefreshToken: !!refreshToken,
    })
    return null
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, 'http://localhost')
  oauth2Client.setCredentials({ refresh_token: refreshToken })

  gmailClient = google.gmail({ version: 'v1', auth: oauth2Client })
  return gmailClient
}

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const gmail = getGmailClient()
  if (!gmail) {
    console.error(`EMAIL NOT SENT (no Gmail credentials): to=${to}, subject=${subject}`)
    return
  }

  // RFC 2822 formatted message
  const messageParts = [
    `To: ${to}`,
    `From: Resonance Network <resonanceartcollective@gmail.com>`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=utf-8`,
    '',
    html,
  ]
  const message = messageParts.join('\r\n')
  const encodedMessage = Buffer.from(message).toString('base64url')

  try {
    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encodedMessage },
    })
    console.log(`Email sent successfully: to=${to}, messageId=${result.data.id}`)
  } catch (err: unknown) {
    const error = err as Error & { response?: { status: number; data: unknown } }
    console.error(`Gmail API error: ${error.message}`)
    if (error.response) {
      console.error(`Gmail API status: ${error.response.status}`)
      console.error(`Gmail API data: ${JSON.stringify(error.response.data)}`)
    }
    throw err
  }
}
