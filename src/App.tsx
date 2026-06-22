import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { MobileFrame } from './components/shell/MobileFrame'
import { TripGate } from './components/TripGate'
import { BrandSplash } from './components/motion/BrandSplash'
import { MyTripsScreen } from './screens/MyTripsScreen'

// Route-level code splitting: each per-trip screen ships as its own chunk.
const HomeScreen = lazy(() => import('./screens/HomeScreen').then((m) => ({ default: m.HomeScreen })))
const MoneyScreen = lazy(() => import('./screens/MoneyScreen').then((m) => ({ default: m.MoneyScreen })))
const TripScreen = lazy(() => import('./screens/TripScreen').then((m) => ({ default: m.TripScreen })))
const GalleryScreen = lazy(() => import('./screens/GalleryScreen').then((m) => ({ default: m.GalleryScreen })))
const TripsScreen = lazy(() => import('./screens/TripsScreen').then((m) => ({ default: m.TripsScreen })))
const AnnouncementsScreen = lazy(() => import('./screens/AnnouncementsScreen').then((m) => ({ default: m.AnnouncementsScreen })))

// Setup / onboarding screens render full-page (their own background), so they
// live outside the MobileFrame shell and outside the trip gate.
const CreateTripScreen = lazy(() => import('./screens/CreateTripScreen').then((m) => ({ default: m.CreateTripScreen })))
const JoinTripScreen = lazy(() => import('./screens/JoinTripScreen').then((m) => ({ default: m.JoinTripScreen })))
const OnboardingScreen = lazy(() => import('./screens/OnboardingScreen').then((m) => ({ default: m.OnboardingScreen })))

function App() {
  return (
    <Suspense fallback={<BrandSplash />}>
      <Routes>
        {/* Post-login home: every trip the user belongs to. Eagerly imported so
            it paints immediately after sign-in. */}
        <Route path="/my-trips" element={<MyTripsScreen />} />

        {/* Trip setup / first-run flows — no current trip required. */}
        <Route path="/create-trip" element={<CreateTripScreen />} />
        <Route path="/join" element={<JoinTripScreen />} />
        <Route path="/join/:token" element={<JoinTripScreen />} />
        <Route path="/onboarding" element={<OnboardingScreen />} />

        {/* The per-trip app — requires a current trip + completed onboarding. */}
        <Route
          element={
            <TripGate>
              <MobileFrame />
            </TripGate>
          }
        >
          <Route path="/home" element={<HomeScreen />} />
          <Route path="/money" element={<MoneyScreen />} />
          <Route path="/trip" element={<TripScreen />} />
          <Route path="/gallery" element={<GalleryScreen />} />
          <Route path="/trips" element={<TripsScreen />} />
          <Route path="/announcements" element={<AnnouncementsScreen />} />
        </Route>

        {/* Landing + unknown routes → the My Trips home. */}
        <Route path="/" element={<Navigate to="/my-trips" replace />} />
        <Route path="*" element={<Navigate to="/my-trips" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App
