import React, { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useGameStore } from '@/store/gameStore'
import { useSupabaseAuth } from '@/hooks/useSupabase'

// ── Lazy-loaded screens ─────────────────────────────────────────────────────
const AuthScreen   = lazy(() => import('@/screens/AuthScreen'))
const SetupScreen  = lazy(() => import('@/screens/SetupScreen'))
const GameScreen   = lazy(() => import('@/screens/GameScreen'))
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

// ── Error boundary — prevents white page on lazy-load / runtime errors ──────
interface ErrorBoundaryState { hasError: boolean; message: string }
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, message: '' }
  }
  static getDerivedStateFromError(err: unknown): ErrorBoundaryState {
    return {
      hasError: true,
      message: err instanceof Error ? err.message : String(err)
    }
  }
  override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <p className="font-headline text-3xl text-primary mb-4">IL CONSIGLIERE</p>
            <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-6">
              Something went wrong
            </p>
            <p className="font-body text-sm text-on-surface-variant bg-surface-container p-4 text-left font-mono break-all">
              {this.state.message || 'Unknown error'}
            </p>
            <p className="font-body text-xs text-on-surface-variant mt-4">
              Check your <code className="text-primary">.env</code> file has{' '}
              <code className="text-primary">VITE_SUPABASE_URL</code> and{' '}
              <code className="text-primary">VITE_SUPABASE_ANON_KEY</code> set.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-2 bg-primary-container text-on-primary-container font-label text-xs uppercase tracking-widest mechanical-btn"
            >
              Reload
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// ── Auth guard ──────────────────────────────────────────────────────────────
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
  useSupabaseAuth()

  return (
    <ErrorBoundary>
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

          {/* Fallback */}
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}
