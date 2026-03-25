import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'resonanceartcollective@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!process.env.GMAIL_APP_PASSWORD) {
    console.error('GMAIL_APP_PASSWORD not set — email not sent')
    return
  }

  const result = await transporter.sendMail({
    from: 'Resonance Network <resonanceartcollective@gmail.com>',
    to,
    subject,
    html,
  })

  return result
}
