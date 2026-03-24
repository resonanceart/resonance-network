import { google } from 'googleapis'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost'
)
oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN })

const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const message = [
    `To: ${to}`,
    `From: resonanceartcollective@gmail.com`,
    `Subject: ${subject}`,
    `Content-Type: text/html; charset=utf-8`,
    '',
    html,
  ].join('\n')

  const encodedMessage = Buffer.from(message).toString('base64url')

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encodedMessage },
  })
}
