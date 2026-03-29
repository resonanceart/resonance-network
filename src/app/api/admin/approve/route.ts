import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rate-limit'
import { sanitizeText, getClientIp } from '@/lib/sanitize'
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

    const body = await request.json()

    // Verify admin access — either password OR authenticated admin user
    const adminPassword = body.adminPassword || request.headers.get('x-admin-password')
    let isAdmin = adminPassword === process.env.ADMIN_PASSWORD

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

    if (!['approve', 'reject'].includes(action)) {
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
    const newStatus = action === 'approve' ? 'approved' : 'rejected'

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
          const isApproved = action === 'approve'
          await supabaseAdmin.from('user_messages').insert({
            recipient_id: submitterProfile.id,
            sender_name: 'Resonance Network',
            subject: isApproved
              ? `Your ${type} "${submissionTitle}" has been approved!`
              : `Update on your ${type} submission "${submissionTitle}"`,
            body: isApproved
              ? `Great news! Your ${type} "${submissionTitle}" has been approved and is now live on Resonance Network. Visit the site to see it in action.`
              : `Your ${type} submission "${submissionTitle}" has been reviewed. Unfortunately, it wasn't selected at this time. Feel free to revise and resubmit.`,
            message_type: 'submission_status',
            related_project: type === 'project' ? submissionTitle : null,
          })
        }

        // Send email notification
        if (submitterEmail) {
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://resonance-network.vercel.app'
          const recipientName = type === 'project' ? row.artist_email?.split('@')[0] : row.name
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

    return NextResponse.json({ success: true, message: `Submission ${newStatus}.` })
  } catch (err) {
    console.error('Admin approve error:', err)
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 })
  }
}
