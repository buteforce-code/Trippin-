import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { MobileFrame } from './components/shell/MobileFrame'

// Route-level code splitting: each screen ships as its own chunk.
const HomeScreen = lazy(() => import('./screens/HomeScreen').then((m) => ({ default: m.HomeScreen })))
const MoneyScreen = lazy(() => import('./screens/MoneyScreen').then((m) => ({ default: m.MoneyScreen })))
const TripScreen = lazy(() => import('./screens/TripScreen').then((m) => ({ default: m.TripScreen })))
const GalleryScreen = lazy(() => import('./screens/GalleryScreen').then((m) => ({ default: m.GalleryScreen })))

function App() {
  return (
    <Routes>
      <Route element={<MobileFrame />}>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/money" element={<MoneyScreen />} />
        <Route path="/trip" element={<TripScreen />} />
        <Route path="/gallery" element={<GalleryScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
