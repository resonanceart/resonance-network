import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { rateLimit } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/sanitize'
import { validateCsrf } from '@/lib/csrf'

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

    const { password } = await request.json()
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword) {
      return NextResponse.json(
        { success: false, message: 'Admin access is not configured.' },
        { status: 503 }
      )
    }

    // Use timing-safe comparison to prevent timing attacks
    const passwordBuffer = Buffer.from(String(password || ''))
    const adminBuffer = Buffer.from(String(adminPassword || ''))
    if (passwordBuffer.length === adminBuffer.length && timingSafeEqual(passwordBuffer, adminBuffer)) {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { success: false, message: 'Invalid password.' },
      { status: 401 }
    )
  } catch {
    return NextResponse.json(
      { success: false, message: 'Server error.' },
      { status: 500 }
    )
  }
}
