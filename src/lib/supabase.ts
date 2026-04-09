import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Server-only anon client (for server components that need RLS).
// For client-side (browser) usage, import from '@/lib/supabase-client' instead,
// which uses the singleton from supabase-auth.ts to avoid multiple GoTrueClient instances.
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase instance (uses service role key, bypasses RLS)
// Only use in API routes and server components, NOT in 'use client' files
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : supabaseAnon // Fallback to anon client if no service key

// Re-export for any server code that needs the anon client
export { supabaseAnon as supabase }
