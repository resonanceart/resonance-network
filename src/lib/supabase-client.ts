import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Client-safe Supabase instance (uses anon key, respects RLS)
// Safe to import in 'use client' components
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
