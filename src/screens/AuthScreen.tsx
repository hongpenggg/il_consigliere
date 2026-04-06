import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSupabaseAuth } from '@/hooks/useSupabase'

type Mode = 'signin' | 'signup' | 'magic'

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const { signIn, signUp, signInWithMagicLink, signInWithGoogle } = useSupabaseAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      if (mode === 'magic') {
        await signInWithMagicLink(email)
        setSuccess('Magic link sent. Check your inbox.')
      } else if (mode === 'signup') {
        const { error: err } = await signUp(email, password)
        if (err) throw err
        setSuccess('Account created. Check your inbox to confirm.')
      } else {
        const { error: err } = await signIn(email, password)
        if (err) throw err
        navigate('/')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleAuth() {
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      const { error: err } = await signInWithGoogle()
      if (err) throw err
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background texture */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(137,7,14,0.08) 0%, transparent 70%)'
      }} />

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 border border-primary/30 mb-4">
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
          </div>
          <h1 className="font-headline text-4xl italic text-on-surface">Il Consigliere</h1>
          <p className="font-label text-[10px] uppercase tracking-[0.4em] text-primary/60 mt-1">
            The Council Awaits
          </p>
        </div>

        {/* Mode tabs */}
        <div className="flex border border-outline-variant/20 mb-6">
          {(['signin', 'signup', 'magic'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(null); setSuccess(null) }}
              className={`flex-1 py-3 font-label text-[10px] uppercase tracking-widest transition-all ${
                mode === m
                  ? 'bg-primary-container text-on-primary-container border-b-2 border-primary'
                  : 'text-on-surface/40 hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              {m === 'signin' ? 'Sign In' : m === 'signup' ? 'Sign Up' : 'Magic Link'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <button
            type="button"
            onClick={() => void handleGoogleAuth()}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-outline-variant/30 bg-surface-container-low hover:bg-surface-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-base">account_circle</span>
            <span className="font-label text-[10px] uppercase tracking-widest text-on-surface/80">
              Continue with Google
            </span>
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-outline-variant/20" />
            <span className="font-label text-[9px] uppercase tracking-widest text-on-surface/30">or</span>
            <div className="h-px flex-1 bg-outline-variant/20" />
          </div>

          <div>
            <label className="block font-label text-[10px] uppercase tracking-widest text-on-surface/60 mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="don@corleone.it"
              className="w-full bg-surface-container-low border border-outline-variant/30 px-4 py-3 font-body text-sm text-on-surface placeholder-on-surface/20 focus:outline-none focus:border-primary/60 transition-colors"
            />
          </div>

          {mode !== 'magic' && (
            <div>
              <label className="block font-label text-[10px] uppercase tracking-widest text-on-surface/60 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface-container-low border border-outline-variant/30 px-4 py-3 font-body text-sm text-on-surface placeholder-on-surface/20 focus:outline-none focus:border-primary/60 transition-colors"
              />
            </div>
          )}

          {error && (
            <p className="font-label text-xs text-error border border-error/20 bg-error/5 px-4 py-3">
              {error}
            </p>
          )}
          {success && (
            <p className="font-label text-xs text-secondary border border-secondary/20 bg-secondary/5 px-4 py-3">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full group flex items-center justify-between px-6 py-4 bg-primary-container border-l-4 border-primary hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <span className="font-label text-sm font-bold uppercase tracking-widest text-on-primary-container">
              {loading ? 'Connecting...' : mode === 'signin' ? 'Enter the Council' : mode === 'signup' ? 'Create Identity' : 'Send Magic Link'}
            </span>
            <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </button>
        </form>

        <p className="text-center font-label text-[10px] uppercase tracking-widest text-on-surface/20 mt-8">
          Omertà applies. All records are sealed.
        </p>
      </div>
    </div>
  )
}
