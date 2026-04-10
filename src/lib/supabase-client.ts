import { createSupabaseBrowserClient } from '@/lib/supabase-auth'

// Client-safe Supabase instance (uses anon key, respects RLS)
// Safe to import in 'use client' components
// Re-exports the singleton from supabase-auth to avoid multiple clients
// competing for the same navigator lock on page reload.
export const supabase = createSupabaseBrowserClient()
