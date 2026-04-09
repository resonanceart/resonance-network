import { createBrowserClient } from '@supabase/ssr'

let browserClient: ReturnType<typeof createBrowserClient> | null = null

/**
 * Custom lock that runs the callback immediately without acquiring a
 * navigator lock. The default GoTrueClient uses navigator.locks which
 * orphan on page reload — the old page's lock isn't released before the
 * new page tries to acquire it, causing a timeout that blocks session
 * recovery. Since we enforce a singleton client, cross-tab serialization
 * via navigator.locks is unnecessary.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function noopLock<T>(_name: string, _acquireTimeout: number, fn: () => Promise<T>): Promise<T> {
  return await fn()
}

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        lock: noopLock as any,
      },
    }
  )

  return browserClient
}
