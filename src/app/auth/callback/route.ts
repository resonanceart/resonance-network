import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'signup' | 'email' | 'recovery' | 'invite' | 'magiclink' | undefined
  const next = searchParams.get('next') ?? '/dashboard'

  // Handle error redirects from Supabase (e.g., expired confirmation links)
  const authError = searchParams.get('error')
  const errorDesc = searchParams.get('error_description')
  if (authError) {
    const desc = errorDesc ? `&error_description=${encodeURIComponent(errorDesc)}` : ''
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(authError)}${desc}`)
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: Record<string, unknown>) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Token hash flow — works across browsers (no PKCE verifier needed)
  // Used for email confirmations, password resets, magic links
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    return NextResponse.redirect(`${origin}/login?error=auth&error_description=${encodeURIComponent(error.message)}`)
  }

  // PKCE code exchange flow — requires same browser that initiated signup
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    // If PKCE fails (different browser), show friendly message
    if (error.message.includes('PKCE') || error.message.includes('code verifier')) {
      return NextResponse.redirect(`${origin}/login?error=auth&error_description=${encodeURIComponent('PKCE code verifier not found')}`)
    }
    return NextResponse.redirect(`${origin}/login?error=auth&error_description=${encodeURIComponent(error.message)}`)
  }

  return NextResponse.redirect(`${origin}/login?error=auth&error_description=${encodeURIComponent('No authentication code received. Please try signing up again.')}`)
}
