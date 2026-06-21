import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { ThemeName } from '../data/types'
import { THEME_NAMES } from '../lib/catalog'

interface ThemeContextValue {
  theme: ThemeName
  setTheme: (t: ThemeName) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)
const STORAGE_KEY = 'kerala.theme'

function readInitialTheme(): ThemeName {
  if (typeof localStorage === 'undefined') return 'lagoon'
  const stored = localStorage.getItem(STORAGE_KEY)
  return THEME_NAMES.includes(stored as ThemeName) ? (stored as ThemeName) : 'lagoon'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(readInitialTheme)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme: setThemeState }),
    [theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
