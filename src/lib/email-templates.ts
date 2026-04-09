const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://resonancenetwork.org'

// Shared base layout for all emails
function baseLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f3ee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ee">
    <tr><td align="center" style="padding:40px 16px">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">
        <!-- Header -->
        <tr><td align="center" style="padding-bottom:24px">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-right:8px;vertical-align:middle">
                <div style="width:24px;height:24px;border-radius:50%;border:2px solid #14b8a6;position:relative">
                  <div style="width:14px;height:14px;border-radius:50%;border:1.5px solid #14b8a6;position:absolute;top:3px;left:3px;opacity:0.6"></div>
                </div>
              </td>
              <td style="font-size:14px;font-weight:600;color:#14b8a6;text-transform:uppercase;letter-spacing:0.1em;vertical-align:middle">Resonance Network</td>
            </tr>
          </table>
        </td></tr>
        <!-- Card -->
        <tr><td>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;border:1px solid #e5e2dc">
            <tr><td style="padding:32px 28px">
              ${content}
            </td></tr>
          </table>
        </td></tr>
        <!-- Footer -->
        <tr><td align="center" style="padding-top:24px">
          <p style="margin:0 0 8px;font-size:12px;color:#aaa">
            <a href="${SITE_URL}" style="color:#aaa;text-decoration:none">resonancenetwork.org</a>
          </p>
          <p style="margin:0;font-size:11px;color:#ccc">
            <a href="${SITE_URL}/dashboard/settings" style="color:#ccc;text-decoration:underline">Manage email preferences</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function ctaButton(text: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto;text-align:center">
  <tr><td align="center" style="border-radius:8px;background:#14b8a6">
    <a href="${url}" target="_blank" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;border-radius:8px">
      ${text}
    </a>
  </td></tr>
</table>`
}

function greeting(name: string): string {
  const first = name?.split(' ')[0] || 'there'
  return `<p style="margin:0 0 16px;font-size:16px;color:#1a1a1a">Hi ${first},</p>`
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#444">${text}</p>`
}

function signoff(): string {
  return `<p style="margin:24px 0 0;font-size:14px;color:#999">&mdash; The Resonance Network Team</p>`
}

// ============================================================================
// Template functions
// ============================================================================

export function welcomeEmail(name: string, dashboardUrl: string): { subject: string; html: string } {
  return {
    subject: 'Welcome to Resonance Network!',
    html: baseLayout(`
      ${greeting(name)}
      ${paragraph('Welcome to <strong>Resonance Network</strong>, a community where ambitious creative projects in art, architecture, and ecology find the collaborators and momentum to get built.')}
      ${paragraph('Here\'s what you can do:')}
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px">
        <tr><td style="padding:6px 0;font-size:14px;color:#444">
          <span style="color:#14b8a6;font-weight:700;margin-right:8px">&#9679;</span>
          <strong>Follow projects</strong> that inspire you and get updates on their progress
        </td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#444">
          <span style="color:#14b8a6;font-weight:700;margin-right:8px">&#9679;</span>
          <strong>Collaborate</strong> by offering your skills to projects that need them
        </td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#444">
          <span style="color:#14b8a6;font-weight:700;margin-right:8px">&#9679;</span>
          <strong>Submit your own project</strong> and find the people to bring it to life
        </td></tr>
      </table>
      ${paragraph('Start by completing your profile so collaborators can find you.')}
      ${ctaButton('Go to Your Dashboard', dashboardUrl)}
      ${signoff()}
    `),
  }
}

export function projectSubmissionConfirmation(name: string, projectTitle: string, previewUrl: string): { subject: string; html: string } {
  return {
    subject: `We received your project submission | Resonance Network`,
    html: baseLayout(`
      ${greeting(name)}
      ${paragraph(`Thank you for submitting <strong>${projectTitle}</strong> to Resonance Network. Our curation team will review your submission within two weeks.`)}
      ${paragraph('You can preview how your project page will look:')}
      ${ctaButton('Preview Your Project Page', `${SITE_URL}${previewUrl}`)}
      ${paragraph('We\'ll be in touch soon with our decision. In the meantime, feel free to explore the network and connect with other creators.')}
      ${signoff()}
    `),
  }
}

export function collaboratorProfileConfirmation(name: string): { subject: string; html: string } {
  return {
    subject: 'We received your collaborator profile | Resonance Network',
    html: baseLayout(`
      ${greeting(name)}
      ${paragraph('Thank you for submitting your collaborator profile to Resonance Network. Our team will review it and you\'ll hear from us within two weeks.')}
      ${paragraph('Once approved, your profile will be visible to project creators looking for collaborators with your skills.')}
      ${ctaButton('Browse Open Roles', `${SITE_URL}/collaborate`)}
      ${signoff()}
    `),
  }
}

export function collaborationInterestNotification(params: {
  recipientName: string
  applicantName: string
  applicantEmail: string
  taskTitle: string
  projectTitle: string
  experience: string
  phone?: string
}): { subject: string; html: string } {
  const { recipientName, applicantName, applicantEmail, taskTitle, projectTitle, experience, phone } = params
  const replySubject = encodeURIComponent(`Re: Your interest in ${taskTitle || 'collaborating'} on ${projectTitle || 'Resonance Network'}`)

  return {
    subject: `New interest in ${taskTitle || 'a role'} on ${projectTitle || 'Resonance Network'}`,
    html: baseLayout(`
      ${greeting(recipientName)}
      <h2 style="margin:0 0 4px;font-size:18px;color:#1a1a1a">Someone wants to collaborate</h2>
      <p style="margin:0 0 20px;color:#888;font-size:14px">on <strong>${projectTitle || 'Resonance Network'}</strong> &mdash; ${taskTitle || 'General interest'}</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;margin-bottom:20px">
        <tr>
          <td style="padding:10px 0;color:#888;width:100px;vertical-align:top;border-bottom:1px solid #f0f0f0">Name</td>
          <td style="padding:10px 0;color:#1a1a1a;font-weight:600;border-bottom:1px solid #f0f0f0">${applicantName}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#888;vertical-align:top;border-bottom:1px solid #f0f0f0">Email</td>
          <td style="padding:10px 0;border-bottom:1px solid #f0f0f0"><a href="mailto:${applicantEmail}" style="color:#14b8a6;text-decoration:none">${applicantEmail}</a></td>
        </tr>
        ${phone ? `<tr>
          <td style="padding:10px 0;color:#888;vertical-align:top;border-bottom:1px solid #f0f0f0">Phone</td>
          <td style="padding:10px 0;color:#1a1a1a;border-bottom:1px solid #f0f0f0">${phone}</td>
        </tr>` : ''}
        <tr>
          <td style="padding:10px 0;color:#888;vertical-align:top">Experience</td>
          <td style="padding:10px 0;color:#1a1a1a;line-height:1.6">${experience}</td>
        </tr>
      </table>
      ${ctaButton(`Reply to ${applicantName.split(' ')[0]}`, `mailto:${applicantEmail}?subject=${replySubject}`)}
      <p style="text-align:center;margin:0"><a href="${SITE_URL}/admin" style="color:#888;font-size:12px;text-decoration:underline">View in Admin Dashboard</a></p>
      ${signoff()}
    `),
  }
}

export function collaborationInterestConfirmation(name: string, taskTitle: string, projectTitle: string, collaborateUrl: string): { subject: string; html: string } {
  return {
    subject: 'We received your interest | Resonance Network',
    html: baseLayout(`
      ${greeting(name)}
      ${paragraph(`Thanks for your interest in <strong>${taskTitle || 'collaborating'}</strong> on <strong>${projectTitle || 'a Resonance Network project'}</strong>.`)}
      ${paragraph('The project team has been notified and will reach out if there\'s a good fit. In the meantime, feel free to explore other open roles on the network.')}
      ${ctaButton('Browse Open Roles', collaborateUrl)}
      ${signoff()}
    `),
  }
}

export function submissionApproved(name: string, type: 'project' | 'profile', title: string, pageUrl: string): { subject: string; html: string } {
  const typeLabel = type === 'project' ? 'project' : 'collaborator profile'
  return {
    subject: `Your ${typeLabel} "${title}" has been approved! | Resonance Network`,
    html: baseLayout(`
      ${greeting(name)}
      ${paragraph(`Great news! Your ${typeLabel} <strong>${title}</strong> has been approved and is now live on Resonance Network.`)}
      ${paragraph(type === 'project'
        ? 'Your project page is now visible to collaborators, supporters, and the creative community. Share it with your network!'
        : 'Your profile is now visible to project creators looking for collaborators with your skills.'
      )}
      ${ctaButton(`View Your ${type === 'project' ? 'Project' : 'Profile'}`, pageUrl)}
      ${signoff()}
    `),
  }
}

export function submissionRejected(name: string, type: 'project' | 'profile', title: string): { subject: string; html: string } {
  const typeLabel = type === 'project' ? 'project' : 'collaborator profile'
  return {
    subject: `Update on your ${typeLabel} submission | Resonance Network`,
    html: baseLayout(`
      ${greeting(name)}
      ${paragraph(`Thank you for submitting <strong>${title}</strong> to Resonance Network. After careful review, our curation team has decided not to feature this ${typeLabel} at this time.`)}
      ${paragraph('This doesn\'t mean your work isn\'t valuable. Our curation focuses on fit with the current network themes and stage. We encourage you to:')}
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px">
        <tr><td style="padding:6px 0;font-size:14px;color:#444">
          <span style="color:#14b8a6;font-weight:700;margin-right:8px">&#9679;</span>
          Revise and resubmit with additional detail
        </td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#444">
          <span style="color:#14b8a6;font-weight:700;margin-right:8px">&#9679;</span>
          Explore existing projects and collaboration opportunities
        </td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#444">
          <span style="color:#14b8a6;font-weight:700;margin-right:8px">&#9679;</span>
          Reach out to us with questions at <a href="mailto:resonanceartcollective@gmail.com" style="color:#14b8a6">resonanceartcollective@gmail.com</a>
        </td></tr>
      </table>
      ${ctaButton('Explore the Network', SITE_URL)}
      ${signoff()}
    `),
  }
}

export function passwordResetEmail(name: string, resetUrl: string): { subject: string; html: string } {
  return {
    subject: 'Reset your password | Resonance Network',
    html: baseLayout(`
      ${greeting(name)}
      ${paragraph('We received a request to reset your password. Click the button below to choose a new one.')}
      ${ctaButton('Reset Password', resetUrl)}
      ${paragraph('This link will expire in 1 hour. If you didn\'t request a password reset, you can safely ignore this email.')}
      ${signoff()}
    `),
  }
}

export function magicLinkEmail(name: string, magicUrl: string): { subject: string; html: string } {
  return {
    subject: 'Your sign-in link | Resonance Network',
    html: baseLayout(`
      ${greeting(name)}
      ${paragraph('Click the button below to sign in to Resonance Network. No password needed.')}
      ${ctaButton('Sign In to Resonance Network', magicUrl)}
      ${paragraph('This link will expire in 1 hour. If you didn\'t request this, you can safely ignore this email.')}
      ${signoff()}
    `),
  }
}
