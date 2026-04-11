import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { timingSafeEqual } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rate-limit'
import { sanitizeText, getClientIp } from '@/lib/sanitize'
import { validateCsrf } from '@/lib/csrf'
import { sendEmail } from '@/lib/gmail'
import { submissionApproved, submissionRejected } from '@/lib/email-templates'

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    if (!rateLimit(ip)) {
      return NextResponse.json(
        { success: false, message: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    if (!validateCsrf(request)) {
      return NextResponse.json(
        { success: false, message: 'Invalid request origin.' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Verify admin access: password (timing-safe) OR authenticated admin user
    const adminPassword = body.adminPassword || request.headers.get('x-admin-password')
    let isAdmin = false
    if (adminPassword && process.env.ADMIN_PASSWORD) {
      const pwdBuf = Buffer.from(String(adminPassword))
      const expectedBuf = Buffer.from(String(process.env.ADMIN_PASSWORD))
      if (pwdBuf.length === expectedBuf.length && timingSafeEqual(pwdBuf, expectedBuf)) {
        isAdmin = true
      }
    }

    if (!isAdmin) {
      // Check if authenticated user has admin role
      try {
        const supabase = await createSupabaseServerClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabaseAdmin
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single()
          if (profile?.role === 'admin') isAdmin = true
        }
      } catch {}
    }

    if (!isAdmin) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }

    const type = sanitizeText(body.type, 20)
    const id = sanitizeText(body.id, 50)
    const action = sanitizeText(body.action, 20)

    if (!type || !id || !action) {
      return NextResponse.json({ success: false, message: 'Missing required fields.' }, { status: 400 })
    }

    if (!['project', 'profile', 'user_profile'].includes(type)) {
      return NextResponse.json({ success: false, message: 'Invalid type.' }, { status: 400 })
    }

    if (!['approve', 'reject', 'unpublish'].includes(action)) {
      return NextResponse.json({ success: false, message: 'Invalid action.' }, { status: 400 })
    }

    // Handle user_profile approval separately
    if (type === 'user_profile') {
      const newVisibility = action === 'approve' ? 'published' : 'draft'
      const { error: upError } = await supabaseAdmin
        .from('user_profiles')
        .update({ profile_visibility: newVisibility })
        .eq('id', id)

      if (upError) {
        console.error('Admin user profile action error:', upError)
        return NextResponse.json({ success: false, message: 'Failed to update profile visibility.' }, { status: 500 })
      }

      // Send in-app notification
      try {
        const isApproved = action === 'approve'
        await supabaseAdmin.from('user_messages').insert({
          recipient_id: id,
          sender_name: 'Resonance Network',
          subject: isApproved
            ? 'Your profile has been approved!'
            : 'Update on your profile submission',
          body: isApproved
            ? 'Great news! Your profile has been approved and is now live on Resonance Network. Visit the profiles page to see it.'
            : 'Your profile has been reviewed. Unfortunately, it wasn\'t approved at this time. Please review and update your profile, then resubmit for review.',
          message_type: 'submission_status',
        })
      } catch (err) { console.error('In-app notification error:', (err as Error).message) }

      revalidatePath('/')
      revalidatePath('/profiles')

      return NextResponse.json({ success: true, message: `Profile ${newVisibility}.` })
    }

    const table = type === 'project' ? 'project_submissions' : 'collaborator_profiles'
    let newStatus: string
    if (action === 'approve') newStatus = 'approved'
    else if (action === 'unpublish') newStatus = 'draft'
    else newStatus = 'rejected'

    const { error } = await supabaseAdmin
      .from(table)
      .update({ status: newStatus })
      .eq('id', id)

    if (error) {
      console.error('Admin action error:', error)
      return NextResponse.json({ success: false, message: 'Failed to update status.' }, { status: 500 })
    }

    // Create in-app notification for the submitter
    try {
      const selectFields = type === 'project' ? 'artist_email, project_title' : 'email, name'
      const { data: submission } = await supabaseAdmin
        .from(table)
        .select(selectFields)
        .eq('id', id)
        .single()

      if (submission) {
        const row = submission as Record<string, string>
        const submitterEmail = type === 'project' ? row.artist_email : row.email
        const submissionTitle = type === 'project' ? row.project_title : row.name

        const { data: submitterProfile } = await supabaseAdmin
          .from('user_profiles')
          .select('id')
          .eq('email', submitterEmail)
          .single()

        if (submitterProfile) {
          let subject: string
          let bodyText: string
          if (action === 'approve') {
            subject = `Your ${type} "${submissionTitle}" has been approved!`
            bodyText = `Great news! Your ${type} "${submissionTitle}" has been approved and is now live on Resonance Network. Visit the site to see it in action.`
          } else if (action === 'unpublish') {
            subject = `Your ${type} "${submissionTitle}" has been unpublished`
            bodyText = `Your ${type} "${submissionTitle}" has been moved back to draft and is no longer publicly visible. You can edit and resubmit it from your dashboard at any time.`
          } else {
            subject = `Update on your ${type} submission "${submissionTitle}"`
            bodyText = `Your ${type} submission "${submissionTitle}" has been reviewed. Unfortunately, it wasn't selected at this time. Feel free to revise and resubmit.`
          }
          await supabaseAdmin.from('user_messages').insert({
            recipient_id: submitterProfile.id,
            sender_name: 'Resonance Network',
            subject,
            body: bodyText,
            message_type: 'submission_status',
            related_project: type === 'project' ? submissionTitle : null,
          })
        }

        // Send email notification (skip on unpublish — no need to email about a revert to draft)
        if (submitterEmail && action !== 'unpublish') {
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://resonancenetwork.org'
          const recipientName = type === 'project' ? (row.artist_name || row.artist_email?.split('@')[0]) : row.name
          try {
            if (action === 'approve') {
              const pageUrl = type === 'project'
                ? `${siteUrl}/projects/sub-${submissionTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`
                : `${siteUrl}/profiles/collab-${submissionTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`
              const approvedEmail = submissionApproved(recipientName || 'there', type as 'project' | 'profile', submissionTitle, pageUrl)
              await sendEmail({ to: submitterEmail, subject: approvedEmail.subject, html: approvedEmail.html })
            } else {
              const rejectedEmail = submissionRejected(recipientName || 'there', type as 'project' | 'profile', submissionTitle)
              await sendEmail({ to: submitterEmail, subject: rejectedEmail.subject, html: rejectedEmail.html })
            }
          } catch (emailErr) { console.error('Status email error:', (emailErr as Error).message) }
        }
      }
    } catch (err) { console.error('In-app notification error:', (err as Error).message) }

    // Revalidate affected pages
    revalidatePath('/')
    revalidatePath('/profiles')
    revalidatePath('/collaborate')

    const successMessage = action === 'unpublish'
      ? 'Submission unpublished.'
      : `Submission ${newStatus}.`
    return NextResponse.json({ success: true, message: successMessage })
  } catch (err) {
    console.error('Admin approve error:', err)
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 })
  }
}
