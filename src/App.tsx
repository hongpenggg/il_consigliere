import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useGameStore } from '@/store/gameStore'
import { useSupabaseAuth } from '@/hooks/useSupabase'
import { SideNav } from '@/components/SideNav'
import TopBar from '@/components/TopBar'
import type { PlayerStats } from '@/types'

// ─── Lazy screens ─────────────────────────────────────────────────────────────
const AuthScreen     = lazy(() => import('@/screens/AuthScreen'))
const HomeScreen     = lazy(() => import('@/screens/HomeScreen'))
const SetupScreen    = lazy(() => import('@/screens/SetupScreen'))
const GameScreen     = lazy(() => import('@/screens/GameScreen'))
const CommandScreen  = lazy(() => import('@/screens/CommandScreen'))
const DialogueScreen = lazy(() => import('@/screens/DialogueScreen'))
const LedgerScreen   = lazy(() => import('@/screens/LedgerScreen'))
const WarRoomScreen  = lazy(() => import('@/screens/WarRoomScreen'))
const ConcludeScreen = lazy(() => import('@/screens/ConcludeScreen'))

const SESSION_KEY = 'il_consigliere_player'

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
// Allows through if player exists in store OR if a session was persisted.
function RequirePlayer({ children }: { children: React.ReactNode }) {
  const player = useGameStore((s) => s.player)
  const setPlayer = useGameStore((s) => s.setPlayer)
  const location = useLocation()

  // Attempt to restore from sessionStorage on first render
  if (!player) {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as PlayerStats
        setPlayer(parsed)
        return <>{children}</>
      }
    } catch {
      // ignore corrupt data
    }
    return <Navigate to="/" state={{ from: location }} replace />
  }
  return <>{children}</>
}

// ─── Player persistence ───────────────────────────────────────────────────────
// Keeps sessionStorage in sync whenever player changes.
function PlayerPersistence() {
  const player = useGameStore((s) => s.player)
  useEffect(() => {
    if (player) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(player))
    } else {
      sessionStorage.removeItem(SESSION_KEY)
    }
  }, [player])
  return null
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  useSupabaseAuth()

  return (
    <>
      <PlayerPersistence />
      <Suspense fallback={<GameLoader />}>
        <Routes>
          {/* Landing */}
          <Route path="/" element={<HomeScreen />} />

          {/* Auth flow */}
          <Route path="/auth" element={<AuthScreen />} />

          {/* New-game character setup */}
          <Route path="/setup" element={<SetupScreen />} />

          {/* Main game hub */}
          <Route
            path="/game"
            element={
              <RequirePlayer>
                <GameScreen />
              </RequirePlayer>
            }
          />

          {/* Protected game sub-screens */}
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
    </>
  )
}
