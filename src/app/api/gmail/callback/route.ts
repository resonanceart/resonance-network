import { NextResponse } from 'next/server'

// Step 2: Exchange auth code for tokens
export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')

  if (error) {
    return NextResponse.json({ error: `OAuth error: ${error}` }, { status: 400 })
  }

  if (!code) {
    return NextResponse.json({ error: 'No authorization code received' }, { status: 400 })
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.NEXT_PUBLIC_SITE_URL + '/api/gmail/callback'

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId || '',
        client_secret: clientSecret || '',
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: 'Token exchange failed', details: data }, { status: 500 })
    }

    // Display the refresh token — you'll need to add this to Vercel env vars
    return new NextResponse(
      `<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;max-width:600px;margin:40px auto;padding:24px">
  <h1 style="color:#14b8a6">Gmail Authorization Complete!</h1>
  <p>Copy this refresh token and add it as <code>GOOGLE_REFRESH_TOKEN</code> in your Vercel environment variables:</p>
  <div style="background:#111;color:#0f0;padding:16px;border-radius:8px;word-break:break-all;font-family:monospace;font-size:14px">
    ${data.refresh_token || 'No refresh token returned (you may need to revoke and re-authorize)'}
  </div>
  <p style="margin-top:24px">
    <strong>Access token received:</strong> ✅<br>
    <strong>Refresh token:</strong> ${data.refresh_token ? '✅' : '❌ Missing — try revoking access at <a href="https://myaccount.google.com/permissions">Google Permissions</a> and re-authorizing'}<br>
    <strong>Expires in:</strong> ${data.expires_in}s
  </p>
  <p>After adding the refresh token to Vercel, emails will work automatically.</p>
</body>
</html>`,
      { headers: { 'Content-Type': 'text/html' } }
    )
  } catch (err) {
    return NextResponse.json({ error: 'Token exchange error', message: (err as Error).message }, { status: 500 })
  }
}
