import type { ReactNode } from 'react'
import { isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from '../providers/AuthProvider'
import { LoginScreen } from '../screens/LoginScreen'
import { BrandSplash } from './motion/BrandSplash'

/**
 * Gates the app behind auth when Supabase is configured. With no Supabase env,
 * renders children directly (mock-data mode for local UI work).
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()

  if (!isSupabaseConfigured) return <>{children}</>

  if (loading) {
    return <BrandSplash />
  }

  if (!session) return <LoginScreen />

  return <>{children}</>
}
