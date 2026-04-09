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

/** Timeout (ms) before we retry getSession if the initial call hangs
 *  (e.g. orphaned navigator lock from a previous tab crash). */
const SESSION_TIMEOUT_MS = 5000

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const resolvedRef = useRef(false)
  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    const applySession = (s: Session | null) => {
      if (resolvedRef.current) return
      resolvedRef.current = true
      clearTimeout(timeoutId)
      setSession(s)
      setUser(s?.user ?? null)
      setLoading(false)
    }

    // Primary: try to recover session from cookies/storage
    supabase.auth.getSession().then(({ data: { session: s } }: { data: { session: Session | null } }) => {
      applySession(s)
    })

    // Fallback: if getSession hangs (orphaned lock), retry after timeout
    timeoutId = setTimeout(() => {
      if (!resolvedRef.current) {
        console.warn('[AuthProvider] getSession timed out — retrying')
        supabase.auth.getSession().then(({ data: { session: s } }: { data: { session: Session | null } }) => {
          // Accept whatever we get, even null (will show login)
          resolvedRef.current = true
          setSession(s)
          setUser(s?.user ?? null)
          setLoading(false)
        }).catch(() => {
          // Last resort: unblock the UI so the user isn't stuck forever
          resolvedRef.current = true
          setSession(null)
          setUser(null)
          setLoading(false)
        })
      }
    }, SESSION_TIMEOUT_MS)

    // Also listen for auth state changes (handles sign-in/sign-out events)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: string, s: Session | null) => {
        // Once the listener fires, it means the lock was acquired and the
        // session is authoritative — always apply it.
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
