import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useGameStore } from '@/store/gameStore'
import { useSupabaseAuth } from '@/hooks/useSupabase'
import { SideNav } from '@/components/SideNav'
import TopBar from '@/components/TopBar'

// ─── Lazy screens ─────────────────────────────────────────────────────────────
const AuthScreen    = lazy(() => import('@/screens/AuthScreen'))
const HomeScreen    = lazy(() => import('@/screens/HomeScreen'))
const CommandScreen = lazy(() => import('@/screens/CommandScreen'))
const DialogueScreen = lazy(() => import('@/screens/DialogueScreen'))
const LedgerScreen  = lazy(() => import('@/screens/LedgerScreen'))
const WarRoomScreen = lazy(() => import('@/screens/WarRoomScreen'))
const ConcludeScreen = lazy(() => import('@/screens/ConcludeScreen'))

// ─── Loading fallback ─────────────────────────────────────────────────────────
function GameLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="font-headline text-4xl text-primary animate-pulse">IL CONSIGLIERE</p>
        <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Loading...</p>
      </div>
    </div>
  )
}

// ─── Layout wrapper for authenticated game screens ────────────────────────────
function GameLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <SideNav />
      <main className="ml-64 pt-20 min-h-[calc(100vh-80px)] p-6">
        {children}
      </main>
    </div>
  )
}

// ─── Auth guard ───────────────────────────────────────────────────────────────
function RequirePlayer({ children }: { children: React.ReactNode }) {
  const player = useGameStore((s) => s.player)
  const location = useLocation()
  if (!player) {
    return <Navigate to="/" state={{ from: location }} replace />
  }
  return <>{children}</>
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  // Attach Supabase auth listener globally
  useSupabaseAuth()

  return (
    <Suspense fallback={<GameLoader />}>
      <Routes>
        {/* Landing / setup */}
        <Route path="/" element={<HomeScreen />} />

        {/* Auth flow */}
        <Route path="/auth" element={<AuthScreen />} />

        {/* Protected game screens */}
        <Route
          path="/command"
          element={
            <RequirePlayer>
              <GameLayout><CommandScreen /></GameLayout>
            </RequirePlayer>
          }
        />
        <Route
          path="/dialogue"
          element={
            <RequirePlayer>
              <GameLayout><DialogueScreen /></GameLayout>
            </RequirePlayer>
          }
        />
        <Route
          path="/ledger"
          element={
            <RequirePlayer>
              <GameLayout><LedgerScreen /></GameLayout>
            </RequirePlayer>
          }
        />
        <Route
          path="/war-room"
          element={
            <RequirePlayer>
              <GameLayout><WarRoomScreen /></GameLayout>
            </RequirePlayer>
          }
        />
        <Route
          path="/conclude"
          element={
            <RequirePlayer>
              <ConcludeScreen />
            </RequirePlayer>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
