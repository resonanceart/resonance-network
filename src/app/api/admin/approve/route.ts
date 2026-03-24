import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { sanitizeText, getClientIp } from '@/lib/sanitize'

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

    // Verify admin password
    const adminPassword = body.adminPassword || request.headers.get('x-admin-password')
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }

    const type = sanitizeText(body.type, 20)
    const id = sanitizeText(body.id, 50)
    const action = sanitizeText(body.action, 20)

    if (!type || !id || !action) {
      return NextResponse.json({ success: false, message: 'Missing required fields.' }, { status: 400 })
    }

    if (!['project', 'profile'].includes(type)) {
      return NextResponse.json({ success: false, message: 'Invalid type.' }, { status: 400 })
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ success: false, message: 'Invalid action.' }, { status: 400 })
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
