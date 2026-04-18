import { lazy, Suspense, useEffect, useRef } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useGameStore } from '@/store/gameStore'
import { useSupabaseAuth, useGameInstance, useUserProgress } from '@/hooks/useSupabase'
import { SideNav } from '@/components/SideNav'
import TopBar from '@/components/TopBar'
import type { PlayerStats } from '@/types'

// ─── Lazy screens ─────────────────────────────────────────────────────────────
const AuthScreen      = lazy(() => import('@/screens/AuthScreen'))
const HomeScreen      = lazy(() => import('@/screens/HomeScreen'))
const SetupScreen     = lazy(() => import('@/screens/SetupScreen'))
const GameScreen      = lazy(() => import('@/screens/GameScreen'))
const CommandScreen   = lazy(() => import('@/screens/CommandScreen'))
const DialogueScreen  = lazy(() => import('@/screens/DialogueScreen'))
const LedgerScreen    = lazy(() => import('@/screens/LedgerScreen'))
const WarRoomScreen   = lazy(() => import('@/screens/WarRoomScreen'))
const ConcludeScreen  = lazy(() => import('@/screens/ConcludeScreen'))
const DiplomacyScreen = lazy(() => import('@/screens/DiplomacyScreen'))
const TutorialScreen  = lazy(() => import('@/screens/TutorialScreen'))

const SESSION_KEY = 'il_consigliere_player'
const PROGRESS_SESSION_KEY = 'il_consigliere_progress'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isValidPlayerStats(value: unknown): value is PlayerStats {
  if (!isRecord(value)) return false
  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.familyName === 'string' &&
    typeof value.territory === 'string' &&
    typeof value.affiliation === 'string' &&
    typeof value.rank === 'string' &&
    typeof value.wealth === 'number' &&
    typeof value.loyalty === 'number' &&
    typeof value.suspicion === 'number' &&
    typeof value.heat === 'number' &&
    typeof value.soldiers === 'number' &&
    typeof value.territoryControl === 'number' &&
    typeof value.diplomacy === 'number'
  )
}

function parseProgressSnapshot(value: unknown): Record<string, unknown> | null {
  if (!isRecord(value)) return null
  const snapshot: Record<string, unknown> = {}

  if (typeof value.tutorialCompleted === 'boolean') snapshot.tutorialCompleted = value.tutorialCompleted
  if (typeof value.tutorialPhase === 'string') snapshot.tutorialPhase = value.tutorialPhase
  if (typeof value.storyModeStarted === 'boolean') snapshot.storyModeStarted = value.storyModeStarted
  if (typeof value.storyChapter === 'number') snapshot.storyChapter = value.storyChapter
  if (typeof value.storyStep === 'number') snapshot.storyStep = value.storyStep
  if (Array.isArray(value.storyPath) && value.storyPath.every((item) => typeof item === 'string')) {
    snapshot.storyPath = value.storyPath
  }
  if (typeof value.storyEnding === 'string' || value.storyEnding === null) {
    snapshot.storyEnding = value.storyEnding
  }
  if (isRecord(value.storyWorld)) snapshot.storyWorld = value.storyWorld

  return snapshot
}

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
      {/* ml-64 offsets the fixed sidebar; pt-20 offsets the fixed TopBar */}
      <main className="ml-64 pt-20 p-6">
        {children}
      </main>
    </div>
  )
}

// ─── Auth guard ───────────────────────────────────────────────────────────────
function RequirePlayer({ children }: { children: React.ReactNode }) {
  const player = useGameStore((s) => s.player)
  const setPlayer = useGameStore((s) => s.setPlayer)
  const hydrateProgress = useGameStore((s) => s.hydrateProgress)
  const location = useLocation()

  if (!player) {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as unknown
        if (!isValidPlayerStats(parsed)) {
          sessionStorage.removeItem(SESSION_KEY)
          sessionStorage.removeItem(PROGRESS_SESSION_KEY)
          return <Navigate to="/" state={{ from: location }} replace />
        }
        setPlayer(parsed)
        const savedProgress = sessionStorage.getItem(PROGRESS_SESSION_KEY)
        if (savedProgress) {
          const parsedProgress = parseProgressSnapshot(JSON.parse(savedProgress) as unknown)
          if (parsedProgress) {
            hydrateProgress(parsedProgress)
          } else {
            sessionStorage.removeItem(PROGRESS_SESSION_KEY)
          }
        }
        return <>{children}</>
      }
    } catch {
      sessionStorage.removeItem(SESSION_KEY)
      sessionStorage.removeItem(PROGRESS_SESSION_KEY)
    }
    return <Navigate to="/" state={{ from: location }} replace />
  }
  return <>{children}</>
}

// ─── Player persistence (sessionStorage) ─────────────────────────────────────
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

function ProgressPersistence() {
  const tutorialCompleted = useGameStore((s) => s.tutorialCompleted)
  const tutorialPhase = useGameStore((s) => s.tutorialPhase)
  const storyModeStarted = useGameStore((s) => s.storyModeStarted)
  const storyChapter = useGameStore((s) => s.storyChapter)
  const storyStep = useGameStore((s) => s.storyStep)
  const storyPath = useGameStore((s) => s.storyPath)
  const storyEnding = useGameStore((s) => s.storyEnding)
  const storyWorld = useGameStore((s) => s.storyWorld)

  useEffect(() => {
    sessionStorage.setItem(PROGRESS_SESSION_KEY, JSON.stringify({
      tutorialCompleted,
      tutorialPhase,
      storyModeStarted,
      storyChapter,
      storyStep,
      storyPath,
      storyEnding,
      storyWorld,
    }))
  }, [tutorialCompleted, tutorialPhase, storyModeStarted, storyChapter, storyStep, storyPath, storyEnding, storyWorld])
  return null
}

// ─── Player persistence (Supabase autosave for authenticated users) ───────────
function SupabaseInstancePersistence() {
  const userId = useGameStore((s) => s.userId)
  const player = useGameStore((s) => s.player)
  const { saveInstance } = useGameInstance()
  const lastSaved = useRef<string | null>(null)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!userId || !player) return
    const serialized = JSON.stringify(player)
    if (lastSaved.current === serialized) return
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    saveTimeoutRef.current = setTimeout(() => {
      lastSaved.current = serialized
      void saveInstance(player)
    }, 2000)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [userId, player, saveInstance])

  return null
}

// ─── Instance restore on login ────────────────────────────────────────────────
function InstanceRestorer() {
  const userId             = useGameStore((s) => s.userId)
  const player             = useGameStore((s) => s.player)
  const instanceChecked    = useGameStore((s) => s.instanceChecked)
  const setInstanceChecked = useGameStore((s) => s.setInstanceChecked)
  const { loadInstance }   = useGameInstance()
  const { loadProgress } = useUserProgress()
  const didRun             = useRef(false)

  useEffect(() => {
    if (!userId || player || instanceChecked || didRun.current) return
    didRun.current = true
    void loadInstance().then((found) => {
      void loadProgress()
      setInstanceChecked(true)
      if (!found) return
    })
  }, [userId, player, instanceChecked, loadInstance, loadProgress, setInstanceChecked])

  return null
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  useSupabaseAuth()

  return (
    <>
      <PlayerPersistence />
      <ProgressPersistence />
      <SupabaseInstancePersistence />
      <InstanceRestorer />
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
            path="/diplomacy"
            element={
              <RequirePlayer>
                <GameLayout><DiplomacyScreen /></GameLayout>
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
            path="/tutorial"
            element={
              <RequirePlayer>
                <GameLayout><TutorialScreen /></GameLayout>
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
