import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSupabaseAuth } from '@/hooks/useSupabase'

type Mode = 'signin' | 'signup' | 'magic'

function GrainOverlay() {
  return (
    <div
      className="fixed inset-0 z-[200] opacity-[0.04] pointer-events-none"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        mixBlendMode: 'overlay',
      }}
    />
  )
}

export default function AuthScreen() {
  const { signIn, signUp, signInWithMagicLink } = useSupabaseAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)

    try {
      if (mode === 'magic') {
        const { error } = await signInWithMagicLink(email)
        if (error) throw error
        setInfo('Check your inbox — a magic link is on its way.')
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password)
        if (error) throw error
        setInfo('Account created. Check your email to confirm, then sign in.')
        setMode('signin')
      } else {
        const { error } = await signIn(email, password)
        if (error) throw error
        navigate('/setup', { replace: true })
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const modeLabel: Record<Mode, string> = {
    signin: 'Sign In',
    signup: 'Create Account',
    magic: 'Magic Link',
  }

  return (
    <>
      <GrainOverlay />

      {/* CRT scanlines */}
      <div
        className="fixed inset-0 z-[199] opacity-50 pointer-events-none"
        style={{
          background:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
        }}
      />

      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative z-10">
        {/* Wordmark */}
        <header className="mb-12 text-center">
          <p className="font-label text-[10px] uppercase tracking-[0.5em] text-primary/60 mb-3">
            1940s Noir RPG
          </p>
          <h1 className="font-headline text-5xl md:text-6xl italic text-on-surface">
            Il Consigliere
          </h1>
          <div className="mt-4 flex items-center justify-center gap-3">
            <div className="w-12 h-px bg-outline-variant/40" />
            <div className="w-1.5 h-1.5 bg-primary/50" />
            <div className="w-12 h-px bg-outline-variant/40" />
          </div>
        </header>

        {/* Card */}
        <div className="w-full max-w-sm bg-surface-container-low border border-outline-variant/20 p-8">
          {/* Mode tabs */}
          <div className="flex gap-0 mb-8 border-b border-outline-variant/20">
            {(['signin', 'signup', 'magic'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null); setInfo(null) }}
                className={`flex-1 pb-3 font-label text-[10px] uppercase tracking-widest transition-colors ${
                  mode === m
                    ? 'text-primary border-b-2 border-primary -mb-px'
                    : 'text-on-surface/40 hover:text-on-surface/70'
                }`}
              >
                {modeLabel[m]}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block font-label text-[10px] uppercase tracking-widest text-on-surface/50 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant/30 px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface/30 focus:outline-none focus:border-primary/60 transition-colors"
                placeholder="your@email.com"
              />
            </div>

            {/* Password — hidden for magic link mode */}
            {mode !== 'magic' && (
              <div>
                <label
                  htmlFor="password"
                  className="block font-label text-[10px] uppercase tracking-widest text-on-surface/50 mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant/30 px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface/30 focus:outline-none focus:border-primary/60 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            )}

            {/* Error / info messages */}
            {error && (
              <p className="font-label text-[10px] uppercase tracking-wide text-error border border-error/30 px-4 py-3">
                {error}
              </p>
            )}
            {info && (
              <p className="font-label text-[10px] uppercase tracking-wide text-secondary border border-secondary/30 px-4 py-3">
                {info}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group w-full flex items-center justify-between px-6 py-4 bg-primary-container border-l-4 border-primary hover:bg-primary/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:translate-x-px active:translate-y-px mt-2"
            >
              <span className="font-label text-sm font-bold uppercase tracking-widest text-on-primary-container group-hover:text-primary group-disabled:group-hover:text-on-primary-container transition-colors">
                {loading ? 'Working...' : modeLabel[mode]}
              </span>
              {!loading && (
                <span className="font-label text-xs text-primary group-hover:translate-x-0.5 transition-transform">
                  →
                </span>
              )}
            </button>
          </form>
        </div>

        <p className="mt-8 font-label text-[9px] uppercase tracking-widest text-on-surface/20">
          IL CONSIGLIERE — OMERTÀ PROTOCOL
        </p>
      </div>
    </>
  )
}
