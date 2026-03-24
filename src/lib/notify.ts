/**
 * Email notification helper.
 *
 * Currently logs notifications to console. When a Resend API key is
 * configured, uncomment the email sending code to deliver real emails.
 *
 * To enable:
 * 1. Sign up at resend.com (free tier: 100 emails/day)
 * 2. Add RESEND_API_KEY to .env.local
 * 3. Uncomment the fetch block below
 */

interface NotificationPayload {
  to: string[]
  subject: string
  body: string
}

export async function sendNotification({ to, subject, body }: NotificationPayload) {
  // Log the notification for development
  console.log('=== Email Notification ===')
  console.log(`To: ${to.join(', ')}`)
  console.log(`Subject: ${subject}`)
  console.log(`Body:\n${body}`)
  console.log('==========================')

  // Uncomment when RESEND_API_KEY is configured:
  /*
  const resendKey = process.env.RESEND_API_KEY
  if (resendKey && resendKey !== 're_placeholder') {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Resonance Network <notifications@resonance.network>',
          to,
          subject,
          text: body,
        }),
      })
    } catch (err) {
      console.error('Failed to send email notification:', err)
    }
  }
  */
}
