// Gmail API via direct HTTP — lightweight, no googleapis dependency needed in serverless

interface TokenResponse {
  access_token: string
  expires_in: number
  token_type: string
}

let cachedToken: { token: string; expiry: number } | null = null

async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < cachedToken.expiry - 60000) {
    return cachedToken.token
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(`Gmail credentials missing: clientId=${!!clientId}, secret=${!!clientSecret}, refresh=${!!refreshToken}`)
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Token refresh failed (${response.status}): ${errorText}`)
  }

  const data: TokenResponse = await response.json()
  cachedToken = {
    token: data.access_token,
    expiry: Date.now() + data.expires_in * 1000,
  }
  return data.access_token
}

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const accessToken = await getAccessToken()

  // Build RFC 2822 message
  const messageParts = [
    `To: ${to}`,
    `From: Resonance Network <resonanceartcollective@gmail.com>`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=utf-8`,
    '',
    html,
  ]
  const rawMessage = Buffer.from(messageParts.join('\r\n')).toString('base64url')

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: rawMessage }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Gmail send failed (${response.status}): ${errorText}`)
  }

  const result = await response.json()
  console.log(`Email sent: to=${to}, messageId=${result.id}`)
  return result
}
