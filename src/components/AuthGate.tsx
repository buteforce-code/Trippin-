import type { ReactNode } from 'react'
import { isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from '../providers/AuthProvider'
import { LoginScreen } from '../screens/LoginScreen'
import { APP_NAME } from '../lib/brand'

/**
 * Gates the app behind auth when Supabase is configured. With no Supabase env,
 * renders children directly (mock-data mode for local UI work).
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()

  if (!isSupabaseConfigured) return <>{children}</>

  if (loading) {
    return (
      <div className="app-bg" data-theme="lagoon" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 24, color: 'var(--primary-d)' }}>{APP_NAME} 🌴</div>
      </div>
    )
  }

  if (!session) return <LoginScreen />

  return <>{children}</>
}
