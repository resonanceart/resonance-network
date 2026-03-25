import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/gmail'

export async function GET() {
  const diagnostics = {
    hasClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    hasRefreshToken: !!process.env.GOOGLE_REFRESH_TOKEN,
    clientIdPrefix: process.env.GOOGLE_CLIENT_ID?.substring(0, 10) || 'MISSING',
    timestamp: new Date().toISOString(),
  }

  try {
    await sendEmail({
      to: 'resonanceartcollective@gmail.com',
      subject: `[DEBUG] Email test at ${new Date().toLocaleTimeString()}`,
      html: `<div style="font-family:sans-serif;padding:24px">
        <h2 style="color:#14b8a6">Resonance Network — Email Debug</h2>
        <p>This email was sent from the Vercel production API route.</p>
        <p><strong>Diagnostics:</strong></p>
        <pre>${JSON.stringify(diagnostics, null, 2)}</pre>
      </div>`,
    })
    return NextResponse.json({ success: true, message: 'Email sent successfully', diagnostics })
  } catch (err) {
    const error = err as Error
    return NextResponse.json({
      success: false,
      message: error.message,
      diagnostics,
    }, { status: 500 })
  }
}
