import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '@/store/gameStore'
import { useSupabaseAuth } from '@/hooks/useSupabase'
import { AppIcon } from '@/components/AppIcon'
import type { PlayerStats } from '@/types'

const AFFILIATIONS = [
  { id: 'famiglia_del_brenta', label: 'Famiglia del Brenta', desc: 'Veneto. Precision operators with deep local roots.' },
  { id: 'banda_della_comasina', label: 'Banda della Comasina', desc: 'Lombardy. Fast expansion through urban pressure.' },
  { id: 'banda_della_magliana', label: 'Banda della Magliana', desc: 'Lazio. Political leverage and street control.' },
  { id: 'famiglia_cosentino', label: 'Famiglia Cosentino', desc: 'Basilicata. Quiet moves, long memory, hard reprisals.' },
  { id: 'sacra_corona_unita', label: 'Sacra Corona Unita', desc: 'Apulia. Smuggling routes and coastal influence.' },
  { id: 'ndrangheta', label: 'La Ndrangheta', desc: 'Calabria. Blood ties only. The most secretive family.' },
  { id: 'camorra', label: 'La Camorra', desc: 'Campania. Street-level power. Fast, ruthless, loyal to coin.' },
  { id: 'cosa_nostra', label: 'La Cosa Nostra', desc: 'Sicily. The original order. Honour above everything.' },
  { id: 'gambino', label: 'Famiglia Gambino', desc: 'New York. High-volume operations and strategic intimidation.' },
  { id: 'lucchese', label: 'Famiglia Lucchese', desc: 'New York. Quiet influence through unions and ports.' },
  { id: 'genovese', label: 'Famiglia Genovese', desc: 'New York. Institutional power with disciplined command.' },
  { id: 'bonanno', label: 'Famiglia Bonanno', desc: 'New York. Opportunistic alliances and aggressive succession.' },
  { id: 'colombo', label: 'Famiglia Colombo', desc: 'New York. Resilient old guard with contested fronts.' },
  { id: 'peaky_blinders', label: 'Peaky Blinders', desc: 'Britain. Razor-sharp tactics and industrial-era networks.' },
  { id: 'independent', label: 'Independent', desc: 'No flag. No loyalty. Only opportunity.' },
] as const

export default function HomeScreen() {
  const [step, setStep] = useState<'landing' | 'setup'>('landing')
  const [name, setName] = useState('')
  const [familyName, setFamilyName] = useState('')
  const [affiliation, setAffiliation] = useState<PlayerStats['affiliation']>('famiglia_del_brenta')
  const [error, setError] = useState('')

  const { setPlayer, player, resetGame, userId, instanceChecked } = useGameStore()
  const { signOut } = useSupabaseAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    resetGame()
    sessionStorage.removeItem('il_consigliere_player')
  }

  function startGame() {
    if (!name.trim() || !familyName.trim()) {
      setError('You need a name and a family name to enter the council.')
      return
    }
    const newPlayer: PlayerStats = {
      id: crypto.randomUUID(),
      name: name.trim(),
      familyName: familyName.trim(),
      territory: 'italy',
      affiliation,
      rank: 'Soldato',
      wealth: 1_200_000,
      loyalty: 75,
      suspicion: 20,
      heat: 30,
      soldiers: 12,
      territoryControl: 35,
      diplomacy: 40,
    }
    setPlayer(newPlayer)
    navigate('/command')
  }

  if (step === 'setup') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
        <div
          className="fixed inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
        <div className="fixed inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(137,7,14,0.10) 0%, transparent 65%)'
        }} />

        <div className="w-full max-w-xl relative z-10">
          <button
            onClick={() => setStep('landing')}
            className="flex items-center gap-2 font-label text-[10px] uppercase tracking-widest text-on-surface/40 hover:text-on-surface transition-colors mb-10"
          >
            <AppIcon name="arrow_back" className="text-sm" /> Back
          </button>

          <div className="mb-8">
            <p className="font-label text-[10px] uppercase tracking-[0.4em] text-primary/60 mb-2">New Dossier</p>
            <h1 className="font-headline text-4xl italic text-on-surface">Who are you?</h1>
            <p className="font-body text-on-surface-variant text-sm mt-2">
              Before the council convenes, we need to know the man giving the orders.
            </p>
          </div>

          <div className="space-y-6">
            {/* Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-label text-[10px] uppercase tracking-widest text-on-surface/60 mb-2">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Salvatore"
                  className="w-full bg-surface-container-low border border-outline-variant/30 px-4 py-3 font-body text-sm text-on-surface placeholder-on-surface/20 focus:outline-none focus:border-primary/60 transition-colors"
                />
              </div>
              <div>
                <label className="block font-label text-[10px] uppercase tracking-widest text-on-surface/60 mb-2">Family Name</label>
                <input
                  type="text"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  placeholder="Maranzano"
                  className="w-full bg-surface-container-low border border-outline-variant/30 px-4 py-3 font-body text-sm text-on-surface placeholder-on-surface/20 focus:outline-none focus:border-primary/60 transition-colors"
                />
              </div>
            </div>

            {/* Affiliation */}
            <div>
              <label className="block font-label text-[10px] uppercase tracking-widest text-on-surface/60 mb-3">Affiliation</label>
              <div className="grid grid-cols-2 gap-3">
                {AFFILIATIONS.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setAffiliation(a.id)}
                    className={`text-left p-4 border transition-all ${
                      affiliation === a.id
                        ? 'border-primary bg-primary-container/50'
                        : 'border-outline-variant/20 bg-surface-container-low hover:border-outline-variant/50'
                    }`}
                  >
                    <p className={`font-label text-xs font-bold uppercase tracking-wide ${
                      affiliation === a.id ? 'text-primary' : 'text-on-surface'
                    }`}>{a.label}</p>
                    <p className="font-body text-[11px] text-on-surface-variant mt-1 leading-snug">{a.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="font-label text-xs text-error border border-error/20 bg-error/5 px-4 py-3">{error}</p>
            )}

            <button
              onClick={startGame}
              className="w-full group flex items-center justify-between px-6 py-4 bg-primary-container border-l-4 border-primary hover:bg-primary/20 transition-all active:translate-x-px"
            >
              <span className="font-label text-sm font-bold uppercase tracking-widest text-on-primary-container">
                Enter the Council
              </span>
              <AppIcon name="arrow_forward" className="text-primary group-hover:translate-x-1 transition-transform" />
            </button>

            {!userId && (
              <button
                onClick={() => navigate('/auth')}
                className="w-full py-3 font-label text-[10px] uppercase tracking-widest text-on-surface/40 hover:text-on-surface transition-colors"
              >
                Sign in to save progress →
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Landing ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Grain */}
      <div
        className="fixed inset-0 z-[1] opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          mixBlendMode: 'overlay',
        }}
      />
      {/* CRT scanlines */}
      <div
        className="fixed inset-0 z-[1] opacity-40 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)',
        }}
      />
      {/* Radial vignette */}
      <div
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 40%, rgba(137,7,14,0.07) 0%, transparent 65%), radial-gradient(ellipse at 50% 100%, rgba(0,0,0,0.6) 0%, transparent 70%)'
        }}
      />

      <div className="relative z-10 flex flex-col min-h-screen px-8 md:px-16 lg:px-24 py-12">
        {/* Top nav */}
        <header className="flex items-center justify-between mb-auto">
          <div className="flex items-center gap-3">
              <div className="w-8 h-8 border border-primary/40 flex items-center justify-center">
              <AppIcon name="shield" className="text-primary text-lg" />
              </div>
            <div>
              <p className="font-headline text-sm font-bold text-on-surface leading-none">IL CONSIGLIERE</p>
              <p className="font-label text-[9px] uppercase tracking-widest text-primary/50">Cosa Nostra</p>
            </div>
          </div>
          {/* Auth button — sign in or sign out depending on state */}
          {userId ? (
            <button
              onClick={() => void handleSignOut()}
              className="font-label text-[10px] uppercase tracking-widest text-on-surface/40 hover:text-error transition-colors flex items-center gap-2"
            >
              <AppIcon name="logout" className="text-sm" /> Sign Out
            </button>
          ) : (
            <button
              onClick={() => navigate('/auth')}
              className="font-label text-[10px] uppercase tracking-widest text-on-surface/40 hover:text-on-surface transition-colors flex items-center gap-2"
            >
              <AppIcon name="login" className="text-sm" /> Sign In
            </button>
          )}
        </header>

        {/* Hero */}
        <main className="flex flex-col justify-center flex-1 max-w-3xl py-16">
          <p className="font-label text-[10px] uppercase tracking-[0.4em] text-primary/60 mb-6">
            Sicily, 1947
          </p>
          <h1 className="font-headline text-6xl md:text-7xl lg:text-8xl italic text-on-surface leading-[1.05] mb-8">
            The empire does
            <br />
            not build itself.
            <br />
            <span className="text-primary">Neither does yours.</span>
          </h1>
          <p className="font-body text-on-surface-variant text-lg leading-relaxed max-w-xl mb-12">
            An AI-driven narrative strategy game. Forge alliances, seize territories, and counsel
            the most powerful crime family in postwar Italy. Every choice has consequences.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setStep('setup')}
              className="group flex items-center justify-between gap-8 px-8 py-5 bg-primary-container border-l-4 border-primary hover:bg-primary/20 transition-all active:translate-x-px"
            >
              <span className="font-label text-sm font-bold uppercase tracking-widest text-on-primary-container">
                Begin New Game
              </span>
              <AppIcon name="arrow_forward" className="text-primary group-hover:translate-x-1 transition-transform" />
            </button>

            {player && (
              <button
                onClick={() => navigate('/command')}
                className="group flex items-center justify-between gap-8 px-8 py-5 bg-surface-container-low border border-outline-variant/30 hover:border-outline-variant/60 hover:bg-surface-container transition-all"
              >
                <span className="font-label text-sm uppercase tracking-widest text-on-surface/70 group-hover:text-on-surface transition-colors">
                  Continue — {player.familyName} Family
                </span>
                <AppIcon name="play_arrow" className="text-on-surface/40 group-hover:text-on-surface transition-all" />
              </button>
            )}

            {!!userId && !player && !instanceChecked && (
              <div className="px-6 py-5 bg-surface-container-low border border-outline-variant/30">
                <p className="font-label text-[10px] uppercase tracking-widest text-on-surface/40">
                  Checking your active game...
                </p>
              </div>
            )}
          </div>
        </main>

        {/* Footer stats */}
        <footer className="flex flex-wrap gap-8 pt-8 border-t border-outline-variant/10">
          {[
            { label: 'Active Territories', value: '7' },
            { label: 'AI Narrative Engine', value: 'OpenRouter' },
            { label: 'Powered By', value: 'Mistral 7B' },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-label text-[9px] uppercase tracking-widest text-on-surface/30">{s.label}</p>
              <p className="font-label text-sm text-on-surface/60">{s.value}</p>
            </div>
          ))}
        </footer>
      </div>
    </div>
  )
}
