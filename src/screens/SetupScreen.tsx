import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '@/store/gameStore'
import { useGameInstance } from '@/hooks/useSupabase'
import type { PlayerStats } from '@/types'

type Affiliation = PlayerStats['affiliation']
type Territory = PlayerStats['territory']

const AFFILIATIONS: { value: Affiliation; label: string; desc: string }[] = [
  { value: 'cosa_nostra', label: 'Cosa Nostra', desc: 'The original. Roots in Sicily, reach across the Atlantic.' },
  { value: 'camorra',     label: 'Camorra',     desc: 'Naples. Street-level power. Fast, ruthless, loyal to coin.' },
  { value: 'ndrangheta',  label: "'Ndrangheta",  desc: 'Calabria. Blood ties only. The most secretive family.' },
  { value: 'independent', label: 'Independent',  desc: 'No flag. No loyalty. Only opportunity.' },
]

const TERRITORIES: { value: Territory; label: string; desc: string }[] = [
  { value: 'italy', label: 'Italy',         desc: 'The old country. Sicily, Naples, Rome — blood and stone.' },
  { value: 'usa',   label: 'United States', desc: 'Manhattan, Brooklyn, Chicago — the new empire.' },
]

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

export default function SetupScreen() {
  const navigate = useNavigate()
  const { setPlayer, userId } = useGameStore()
  const { saveInstance } = useGameInstance()

  const [name, setName] = useState('')
  const [familyName, setFamilyName] = useState('')
  const [affiliation, setAffiliation] = useState<Affiliation>('cosa_nostra')
  const [territory, setTerritory] = useState<Territory>('italy')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleStart(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !familyName.trim()) {
      setError('Enter your name and family name to proceed.')
      return
    }

    const player: PlayerStats = {
      id: userId ?? crypto.randomUUID(),
      name: name.trim(),
      familyName: familyName.trim(),
      territory,
      affiliation,
      rank: 'Capo',
      wealth: 1_200_000,
      loyalty: 60,
      suspicion: 20,
      heat: 30,
      soldiers: 12,
      territoryControl: 25,
      diplomacy: 40,
    }

    setSaving(true)
    setPlayer(player)

    // Immediately persist to Supabase so it survives page reloads
    await saveInstance(player)

    setSaving(false)
    navigate('/game', { replace: true })
  }

  return (
    <>
      <GrainOverlay />
      <div
        className="fixed inset-0 z-[199] opacity-50 pointer-events-none"
        style={{
          background:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
        }}
      />

      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative z-10">
        <header className="mb-10 text-center">
          <p className="font-label text-[10px] uppercase tracking-[0.5em] text-primary/60 mb-3">
            New Dossier
          </p>
          <h1 className="font-headline text-4xl md:text-5xl italic text-on-surface">
            Who are you,{' '}
            <span className="text-primary">Consigliere?</span>
          </h1>
        </header>

        <form onSubmit={(e) => void handleStart(e)} className="w-full max-w-lg space-y-8">
          {/* Name fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-label text-[10px] uppercase tracking-widest text-on-surface/50 mb-2">
                Your Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Luca"
                className="w-full bg-surface-container border border-outline-variant/30 px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface/30 focus:outline-none focus:border-primary/60 transition-colors"
              />
            </div>
            <div>
              <label className="block font-label text-[10px] uppercase tracking-widest text-on-surface/50 mb-2">
                Family Name
              </label>
              <input
                type="text"
                required
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="e.g. Moretti"
                className="w-full bg-surface-container border border-outline-variant/30 px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface/30 focus:outline-none focus:border-primary/60 transition-colors"
              />
            </div>
          </div>

          {/* Territory */}
          <div>
            <p className="font-label text-[10px] uppercase tracking-widest text-on-surface/50 mb-3">
              Territory of Operations
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TERRITORIES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTerritory(t.value)}
                  className={`p-4 text-left border transition-all ${
                    territory === t.value
                      ? 'border-primary bg-primary-container'
                      : 'border-outline-variant/20 bg-surface-container-low hover:border-outline-variant/50'
                  }`}
                >
                  <p className={`font-label text-xs font-bold uppercase tracking-wider mb-1 ${
                    territory === t.value ? 'text-on-primary-container' : 'text-on-surface'
                  }`}>
                    {t.label}
                  </p>
                  <p className="font-body text-[11px] text-on-surface-variant leading-snug">
                    {t.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Affiliation */}
          <div>
            <p className="font-label text-[10px] uppercase tracking-widest text-on-surface/50 mb-3">
              Family Affiliation
            </p>
            <div className="space-y-2">
              {AFFILIATIONS.map((a) => (
                <button
                  key={a.value}
                  type="button"
                  onClick={() => setAffiliation(a.value)}
                  className={`w-full p-4 text-left border transition-all flex items-start gap-4 ${
                    affiliation === a.value
                      ? 'border-primary bg-primary-container'
                      : 'border-outline-variant/20 bg-surface-container-low hover:border-outline-variant/50'
                  }`}
                >
                  <div
                    className={`mt-0.5 w-3 h-3 border flex-shrink-0 ${
                      affiliation === a.value
                        ? 'border-primary bg-primary'
                        : 'border-outline-variant/50'
                    }`}
                  />
                  <div>
                    <p className={`font-label text-xs font-bold uppercase tracking-wider mb-0.5 ${
                      affiliation === a.value ? 'text-on-primary-container' : 'text-on-surface'
                    }`}>
                      {a.label}
                    </p>
                    <p className="font-body text-[11px] text-on-surface-variant leading-snug">
                      {a.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="font-label text-[10px] uppercase tracking-wide text-error border border-error/30 px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="group w-full flex items-center justify-between px-6 py-4 bg-primary-container border-l-4 border-primary hover:bg-primary/20 transition-all active:translate-x-px active:translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span className="font-label text-sm font-bold uppercase tracking-widest text-on-primary-container group-hover:text-primary transition-colors">
              {saving ? 'Saving...' : 'Enter the City'}
            </span>
            <span className="font-label text-xs text-primary group-hover:translate-x-0.5 transition-transform">
              →
            </span>
          </button>
        </form>

        <p className="mt-10 font-label text-[9px] uppercase tracking-widest text-on-surface/20">
          IL CONSIGLIERE — OMERTÀ PROTOCOL
        </p>
      </div>
    </>
  )
}
