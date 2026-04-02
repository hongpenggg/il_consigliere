import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useGameStore } from '@/store/gameStore'
import { useSupabaseAuth } from '@/hooks/useSupabase'

// ── Lazy-loaded screens ─────────────────────────────────────────────────────
const AuthScreen = lazy(() => import('@/screens/AuthScreen'))
const SetupScreen = lazy(() => import('@/screens/SetupScreen'))
const GameScreen = lazy(() => import('@/screens/GameScreen'))
const ConcludeScreen = lazy(() => import('@/screens/ConcludeScreen'))

// ── Shared loading fallback ─────────────────────────────────────────────────
function ScreenLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <p className="font-headline text-4xl text-primary animate-pulse">IL CONSIGLIERE</p>
        <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mt-4">
          Loading...
        </p>
      </div>
    </div>
  )
}

// ── Auth guard ──────────────────────────────────────────────────────────────
// Redirects unauthenticated users to /auth.
// Redirects authenticated users away from /auth.
function RequireAuth({ children }: { children: React.ReactNode }) {
  const userId = useGameStore((s) => s.userId)
  const location = useLocation()

  if (!userId) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }
  return <>{children}</>
}

function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const userId = useGameStore((s) => s.userId)
  if (userId) {
    return <Navigate to="/setup" replace />
  }
  return <>{children}</>
}

// ── App root ────────────────────────────────────────────────────────────────
export default function App() {
  // Initialise auth listener — keeps userId in store in sync with Supabase session
  useSupabaseAuth()

  return (
    <Suspense fallback={<ScreenLoader />}>
      <Routes>
        {/* Public */}
        <Route
          path="/auth"
          element={
            <RedirectIfAuthed>
              <AuthScreen />
            </RedirectIfAuthed>
          }
        />

        {/* Protected */}
        <Route
          path="/setup"
          element={
            <RequireAuth>
              <SetupScreen />
            </RequireAuth>
          }
        />
        <Route
          path="/game"
          element={
            <RequireAuth>
              <GameScreen />
            </RequireAuth>
          }
        />
        <Route
          path="/conclude"
          element={
            <RequireAuth>
              <ConcludeScreen />
            </RequireAuth>
          }
        />

        {/* Fallback — redirect root to /auth (auth guard will forward authed users) */}
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </Suspense>
  )
}
