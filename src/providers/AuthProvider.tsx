import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

interface AuthContextValue {
  session: Session | null
  loading: boolean
  /** Emails a 6-digit sign-in code (immune to link-prefetch scanners). */
  sendCode: (email: string) => Promise<{ error: string | null }>
  /** Verifies the 6-digit code and establishes the session in-app (no redirect). */
  verifyCode: (email: string, code: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

/** Turn opaque/empty Supabase auth errors into something a user can read. */
function readableAuthError(message?: string | null): string | null {
  if (!message) return null
  const m = message.trim()
  if (!m || m === '{}' || m === '[object Object]') {
    return "Couldn't send the code right now. Please try again in a moment."
  }
  if (/error sending/i.test(m)) {
    return "We couldn't email your code (mail service issue). Please try again shortly."
  }
  return m
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    // When Supabase isn't configured, `loading` already starts false (see useState above).
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      loading,
      sendCode: async (email: string) => {
        if (!supabase) return { error: 'Supabase is not configured.' }
        // No emailRedirectTo: this is a code flow, there is no link to click.
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { shouldCreateUser: true },
        })
        return { error: readableAuthError(error?.message) }
      },
      verifyCode: async (email: string, code: string) => {
        if (!supabase) return { error: 'Supabase is not configured.' }
        const { error } = await supabase.auth.verifyOtp({
          email,
          token: code,
          type: 'email',
        })
        return { error: readableAuthError(error?.message) }
      },
      signOut: async () => {
        await supabase?.auth.signOut()
      },
    }),
    [session, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
