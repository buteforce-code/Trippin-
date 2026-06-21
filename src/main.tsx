import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { registerSW } from 'virtual:pwa-register'
import './styles/tokens.css'
import './styles/keyframes.css'
import './styles/global.css'
import App from './App.tsx'
import { ThemeProvider } from './providers/ThemeProvider.tsx'
import { UIProvider } from './providers/UIProvider.tsx'
import { AuthProvider } from './providers/AuthProvider.tsx'
import { AuthGate } from './components/AuthGate.tsx'

registerSW({ immediate: true })

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, refetchOnWindowFocus: false },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AuthGate>
            <UIProvider>
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </UIProvider>
          </AuthGate>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
