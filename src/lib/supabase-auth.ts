import { createBrowserClient } from '@supabase/ssr'

let browserClient: ReturnType<typeof createBrowserClient> | null = null

/**
 * Returns a singleton Supabase browser client.
 * Multiple clients compete for the same navigator lock, causing
 * "Lock was not released within 5000ms" errors that block session
 * recovery on page reload. A singleton avoids the race entirely.
 */
export function createSupabaseBrowserClient() {
  if (browserClient) return browserClient

  browserClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
    {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: true,
        persistSession: true,
      },
    }
  )

  return browserClient
}
