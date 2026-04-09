'use client'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-auth'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
})

/**
 * Maximum time (ms) to wait for getSession before unblocking the UI.
 * Combined with the reduced lockAcquireTimeout (2s) on the Supabase
 * client, the worst-case spinner duration is about 3s instead of infinite.
 */
const SESSION_TIMEOUT_MS = 3000

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const resolvedRef = useRef(false)
  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    /** Apply a definitive session. First caller wins (via resolvedRef). */
    const applySession = (s: Session | null) => {
      if (resolvedRef.current) return
      resolvedRef.current = true
      clearTimeout(timeoutId)
      setSession(s)
      setUser(s?.user ?? null)
      setLoading(false)
    }

    // Path 1: try to recover session from cookies/storage
    supabase.auth.getSession().then(({ data: { session: s } }: { data: { session: Session | null } }) => {
      applySession(s)
    }).catch((err: unknown) => {
      // Lock acquire timeout or network error. Do not call
      // applySession(null) because onAuthStateChange may still
      // deliver the real session momentarily.
      console.warn('[AuthProvider] getSession error:', err)
    })

    // Path 2: timeout safety net. If neither getSession nor
    // onAuthStateChange resolved in time, unblock the UI. Leave
    // resolvedRef false so onAuthStateChange can still update state.
    timeoutId = setTimeout(() => {
      if (!resolvedRef.current) {
        console.warn('[AuthProvider] session init timed out, unblocking UI')
        setLoading(false)
      }
    }, SESSION_TIMEOUT_MS)

    // Path 3: auth state change listener. This is the most reliable
    // path. Supabase fires INITIAL_SESSION once the navigator lock is
    // acquired, even if getSession timed out above.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: string, s: Session | null) => {
        resolvedRef.current = true
        clearTimeout(timeoutId)
        setSession(s)
        setUser(s?.user ?? null)
        setLoading(false)
      }
    )

    return () => {
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
