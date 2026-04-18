import { useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { AppIcon } from '@/components/AppIcon'
import type { PlayerStats } from '@/types'

// ─── Helpers ────────────────────────────────────────────────────────────────

function getRank(player: PlayerStats): string {
  const ctrl = player.territoryControl
  if (ctrl >= 90) return 'Il Capo dei Capi'
  if (ctrl >= 70) return 'Underboss'
  if (ctrl >= 50) return 'Capo di Tutti'
  if (ctrl >= 30) return 'Capo'
  return 'Soldato'
}

function getVerdictLabel(player: PlayerStats): { label: string; won: boolean } {
  if (player.territoryControl >= 60 && player.heat < 90) {
    return { label: 'EMPIRE SECURED', won: true }
  }
  if (player.heat >= 90) {
    return { label: 'EMPIRE FALLEN', won: false }
  }
  return { label: 'STORY CONCLUDED', won: true }
}

function formatWealth(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  return `$${n}`
}

// ─── Character fate data ────────────────────────────────────────────────────

const CHARACTER_FATES = [
  {
    name: 'Vincenzo Ricci',
    status: 'Survived',
    statusColor: 'text-primary',
    desc: 'Retired to Venice. Rumoured to have written a memoir quietly purchased and destroyed by the Family.',
  },
  {
    name: 'Mayor Moretti',
    status: 'Compliant',
    statusColor: 'text-secondary',
    desc: 'Served two more terms. Attended every Family dinner. Asked no questions.',
  },
  {
    name: 'Lorenzo Bianchi',
    status: 'Eliminated',
    statusColor: 'text-error',
    desc: 'The official verdict: dock accident. The unofficial one was never spoken of again.',
  },
  {
    name: 'The Consigliere',
    status: 'Untouchable',
    statusColor: 'text-primary',
    desc: 'No record of a face. No record of a name. Only orders — that shaped a city.',
  },
]

// ─── Sub-components ─────────────────────────────────────────────────────────

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

function CrtLines() {
  return (
    <div
      className="fixed inset-0 z-[199] opacity-50 pointer-events-none"
      style={{
        background:
          'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
      }}
    />
  )
}

interface StatRowProps {
  label: string
  value: string
  valueColor?: string
}
function StatRow({ label, value, valueColor = 'text-on-surface' }: StatRowProps) {
  return (
    <div className="pb-4 border-b border-outline-variant/20">
      <div className="flex justify-between items-baseline">
        <span className="font-label text-[10px] uppercase tracking-widest text-on-surface/40">
          {label}
        </span>
        <span className={`font-label text-xl tabular-nums ${valueColor}`}>{value}</span>
      </div>
    </div>
  )
}

interface FateCardProps {
  name: string
  status: string
  statusColor: string
  desc: string
  dim?: boolean
}
function FateCard({ name, status, statusColor, desc, dim }: FateCardProps) {
  return (
    <div className={`p-5 bg-surface-container-low transition-opacity ${dim ? 'opacity-70' : ''}`}>
      <p className="font-headline text-lg text-on-surface">{name}</p>
      <p className={`font-label text-[10px] uppercase tracking-widest mb-2 ${statusColor}`}>
        {status}
      </p>
      <p className="font-body text-xs text-on-surface-variant leading-relaxed">{desc}</p>
    </div>
  )
}

// ─── Epilogue overlay ────────────────────────────────────────────────────────

interface EpilogueOverlayProps {
  onClose: () => void
  onRestart: () => void
}
function EpilogueOverlay({ onClose, onRestart }: EpilogueOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      {/* BG */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, #131313 0%, rgba(19,19,19,0.85) 50%, rgba(19,19,19,0.6) 100%)',
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen px-8 md:px-20 lg:px-32 py-12 max-w-4xl mx-auto w-full">
        {/* Header */}
        <header className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-4">
            <div className="w-6 h-px bg-primary/40" />
            <span className="font-label text-[10px] uppercase tracking-[0.4em] text-primary/60">
              Epilogue
            </span>
          </div>
          <button
            onClick={onClose}
            className="font-label text-[10px] uppercase tracking-widest text-on-surface/30 hover:text-on-surface transition-colors flex items-center gap-2"
          >
            <AppIcon name="close" className="text-sm" /> Close
          </button>
        </header>

        {/* Body */}
        <main className="flex-1 space-y-10">
          <div>
            <p className="font-label text-[10px] uppercase tracking-[0.4em] text-primary/60 mb-6">
              New York, Winter 1948
            </p>
            <h2 className="font-headline text-4xl md:text-5xl italic text-on-surface leading-tight mb-8">
              The City That Never Sleeps
              <br />
              <span className="text-primary/80">— but Always Remembers.</span>
            </h2>
          </div>

          <div className="space-y-6 font-body text-on-surface-variant leading-[1.85] text-base md:text-lg max-w-2xl">
            <p>
              The newspapers called it a &ldquo;reorganisation of civic interests.&rdquo; Those who
              knew better called it a coronation. By the time the snow had settled on the East River
              docks, the Corleone name had moved from whisper to weight — the kind that bends girders
              and judges.
            </p>
            <p>
              Mayor Moretti, now reliably pliable, approved the waterfront contracts before Christmas.
              The police commissioner resigned quietly in January. The Genovese representatives
              arrived in February with a bottle of Barolo and their hats in their hands.
            </p>
            <p className="text-on-surface italic border-l-2 border-primary/30 pl-6">
              &ldquo;Vincenzo Ricci was found in a Venetian hotel in March of 1949, alive, and
              reading the morning papers. He was reportedly smiling.&rdquo;
            </p>
            <p>
              The Consigliere&rsquo;s ledger — forty-two orders, eleven territories, seven alliances
              sealed in the quiet language of omertà — was filed under &lsquo;Classified&rsquo; and
              never surfaced again.
            </p>
            <p>
              What endures is the reputation. They speak of the Consigliere the way old cities speak
              of their founding myths. With reverence. With a hint of fear. And with the understanding
              that some debts are never forgiven.
            </p>
          </div>

          {/* Pull-quote */}
          <div className="border-t border-outline-variant/20 pt-10">
            <div className="p-8 bg-surface-container-low border-l-2 border-primary/50 max-w-xl">
              <p className="font-headline italic text-2xl text-on-surface leading-relaxed mb-4">
                &ldquo;Behind every great fortune there is a crime. Behind every great crime — a
                Consigliere.&rdquo;
              </p>
              <p className="font-label text-[10px] uppercase tracking-widest text-outline">
                — From the sealed records, 1949
              </p>
            </div>
          </div>

          {/* Character fates */}
          <div className="pt-6">
            <p className="font-label text-[10px] uppercase tracking-[0.3em] text-primary/60 mb-6">
              Where They Ended Up
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CHARACTER_FATES.map((c) => (
                <FateCard
                  key={c.name}
                  {...c}
                  dim={c.status === 'Compliant' || c.status === 'Eliminated'}
                />
              ))}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-outline-variant/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <p className="font-label text-[9px] uppercase tracking-[0.4em] text-on-surface/30">
              IL CONSIGLIERE — V.1.0.4
            </p>
            <p className="font-headline italic text-on-surface/40 text-sm mt-1">
              The story is complete. The empire endures.
            </p>
          </div>
          <button
            onClick={onRestart}
            className="group flex items-center gap-4 px-8 py-4 bg-primary-container border-l-4 border-primary hover:bg-primary/20 transition-all active:translate-x-px active:translate-y-px"
          >
            <span className="font-label text-sm font-bold uppercase tracking-widest text-on-primary-container group-hover:text-primary transition-colors">
              Begin Again
            </span>
            <AppIcon name="arrow_forward" className="text-primary group-hover:translate-x-1 transition-transform" />
          </button>
        </footer>
      </div>
    </div>
  )
}

// ─── Restart modal ───────────────────────────────────────────────────────────

interface RestartModalProps {
  onCancel: () => void
  onConfirm: () => void
}
function RestartModal({ onCancel, onConfirm }: RestartModalProps) {
  return (
    <div className="fixed inset-0 z-[150] bg-background/90 backdrop-blur-sm flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-surface-container-low border border-outline-variant/20 p-10">
        <p className="font-label text-[10px] uppercase tracking-[0.4em] text-primary/60">
          New Dossier?
        </p>
        <h2 className="font-headline text-3xl italic text-on-surface mt-3 mb-6">
          Erase the record and begin a new story?
        </h2>
        <p className="font-body text-on-surface-variant text-sm leading-relaxed mb-8">
          All progress, alliances, and ledger entries will be sealed and archived. The city will
          forget — but the streets never truly do.
        </p>
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 border border-outline-variant/30 font-label text-xs uppercase tracking-widest text-on-surface/60 hover:border-outline-variant/60 hover:text-on-surface transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-3 bg-primary-container font-label text-xs uppercase tracking-widest text-on-primary-container hover:bg-primary/20 transition-all border-l-4 border-primary"
          >
            Begin Again
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function ConcludeScreen() {
  const { player, resetGame } = useGameStore()
  const [showEpilogue, setShowEpilogue] = useState(false)
  const [showRestartModal, setShowRestartModal] = useState(false)

  // Derive stats from store (or fallback defaults for preview)
  const stats: PlayerStats = player ?? {
    id: 'preview',
    name: 'Il Consigliere',
    familyName: 'Corleone',
    territory: 'italy',
    affiliation: 'cosa_nostra',
    rank: 'Capo',
    wealth: 2_480_000,
    loyalty: 87,
    suspicion: 62,
    heat: 84,
    soldiers: 41,
    territoryControl: 78,
    diplomacy: 55,
  }

  const { label: verdictLabel, won } = getVerdictLabel(stats)
  const rank = getRank(stats)

  function handleRestart() {
    setShowRestartModal(false)
    resetGame()
    // In a real routing setup, navigate to '/' or '/setup'
    window.location.href = '/'
  }

  return (
    <>
      <GrainOverlay />
      <CrtLines />

      {/* ── Verdict screen ── */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuASEOhgI2rRvsJIee0_iiUSURZEs0OwhpLRo8_A9zr6nizh7yxtiBZbj-7BIaYwlxr6A9y7YDpnFjf6DiaH3nZZhbt4AALwW1hi3Ty3-d9xVuJME2EwLbDnKKL2ZWJaz2zZAUrvOecGKTkmIDODHR8SbV3_4k58DqYbEr1lCtcS7WX5J1R8iZoD_DG03VRkT-U_WiTYb8BoxPhnuithbZlKs9XA9gKP7UUe7DGyqNGcdB1qLFe4J6nUKXZ0FS9BLgBqnRPJtZMUyPtN"
            alt=""
            className="w-full h-full object-cover grayscale brightness-[0.18] contrast-125"
            loading="eager"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80" />
        </div>

        <div className="relative z-10 flex flex-col justify-between min-h-screen px-8 md:px-16 lg:px-24 py-12">
          {/* Header */}
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-px h-8 bg-primary/40" />
              <span className="font-label text-[10px] uppercase tracking-[0.4em] text-primary/60">
                Story Complete
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <div className="flex flex-col items-end">
                <span className="font-label text-[9px] uppercase text-on-surface/30 tracking-widest">
                  Session
                </span>
                <span className="font-label text-[11px] text-on-surface/60">CC-1947-ALPHA</span>
              </div>
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            </div>
          </header>

          {/* Main content */}
          <main className="flex flex-col lg:flex-row items-start lg:items-end gap-16 lg:gap-24">
            {/* Left: conclusion copy */}
            <div className="flex-1 space-y-8 max-w-2xl">
              <div>
                <p className="font-label text-[10px] uppercase tracking-[0.4em] text-primary/60 mb-4">
                  The Final Word
                </p>
                <h1 className="font-headline text-6xl md:text-7xl lg:text-8xl text-on-surface leading-[1.05] italic">
                  &ldquo;Power is not
                  <br />
                  given. It is
                  <br />
                  <span className="text-primary">taken.&rdquo;</span>
                </h1>
              </div>

              <div className="space-y-4">
                <p className="font-body text-on-surface-variant leading-relaxed text-base md:text-lg max-w-lg">
                  The city fell silent the night Bianchi&rsquo;s empire crumbled. Three months, seven
                  alliances, and forty-two orders later — the{' '}
                  <span className="italic">{stats.familyName}</span> name now echoes in every
                  corridor of power from the docks to the Palazzo.
                </p>
                <p className="font-body text-on-surface/50 italic text-sm leading-relaxed max-w-lg">
                  The Consigliere has concluded their counsel. The record stands for history — and
                  history does not forgive the weak.
                </p>
              </div>

              {/* Verdict stamp */}
              <div
                className={`px-6 py-3 inline-block border-2 ${
                  won ? 'border-secondary' : 'border-error'
                }`}
                style={{ transform: 'rotate(-4deg)' }}
              >
                <p
                  className={`font-label font-bold text-base uppercase tracking-[0.3em] ${
                    won ? 'text-secondary' : 'text-error'
                  }`}
                >
                  {verdictLabel}
                </p>
              </div>
            </div>

            {/* Right: final dossier stats */}
            <div className="w-full lg:w-80 xl:w-96 space-y-6">
              <div>
                <p className="font-label text-[10px] uppercase tracking-[0.4em] text-primary/60 mb-4">
                  Final Dossier
                </p>
                <div className="w-8 h-px bg-primary/40 mb-6" />
              </div>

              <div className="space-y-5">
                <StatRow
                  label="Territories Controlled"
                  value={`${stats.territoryControl}%`}
                />
                <StatRow
                  label="Family Wealth"
                  value={formatWealth(stats.wealth)}
                  valueColor="text-secondary"
                />
                <StatRow
                  label="Loyalty (Final)"
                  value={`${stats.loyalty}%`}
                  valueColor="text-secondary"
                />
                <StatRow
                  label="Heat Level (Final)"
                  value={`${stats.heat}%`}
                  valueColor={stats.heat >= 75 ? 'text-error' : 'text-on-surface'}
                />
                <StatRow
                  label="Soldiers Active"
                  value={String(stats.soldiers)}
                />

                <div className="pt-2">
                  <span className="font-label text-[10px] uppercase tracking-widest text-on-surface/40">
                    Overall Rank
                  </span>
                  <p className="font-headline text-3xl text-on-surface italic mt-1">{rank}</p>
                </div>
              </div>
            </div>
          </main>

          {/* Footer CTAs */}
          <footer className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pt-8 border-t border-outline-variant/10">
            <div className="space-y-1">
              <p className="font-label text-[9px] uppercase tracking-[0.4em] text-on-surface/30">
                Omertà Protocol
              </p>
              <p className="font-headline italic text-on-surface/40 text-sm">
                &ldquo;The record is sealed. The city remembers.&rdquo;
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowEpilogue(true)}
                className="group flex items-center justify-between gap-6 px-8 py-4 bg-primary-container border-l-4 border-primary hover:bg-primary/20 transition-all active:translate-x-px active:translate-y-px"
              >
                <span className="font-label text-sm font-bold uppercase tracking-widest text-on-primary-container group-hover:text-primary transition-colors">
                  Read Epilogue
                </span>
                <AppIcon name="arrow_forward" className="text-primary group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setShowRestartModal(true)}
                className="group flex items-center justify-between gap-6 px-8 py-4 bg-surface-container-low border border-outline-variant/20 hover:border-outline-variant/50 hover:bg-surface-container transition-all active:translate-x-px active:translate-y-px"
              >
                <span className="font-label text-sm uppercase tracking-widest text-on-surface/60 group-hover:text-on-surface transition-colors">
                  New Story
                </span>
                <AppIcon name="refresh" className="text-on-surface/40 group-hover:text-on-surface transition-all" />
              </button>
            </div>
          </footer>
        </div>
      </section>

      {/* ── Epilogue overlay ── */}
      {showEpilogue && (
        <EpilogueOverlay
          onClose={() => setShowEpilogue(false)}
          onRestart={() => {
            setShowEpilogue(false)
            setShowRestartModal(true)
          }}
        />
      )}

      {/* ── Restart confirmation modal ── */}
      {showRestartModal && (
        <RestartModal
          onCancel={() => setShowRestartModal(false)}
          onConfirm={handleRestart}
        />
      )}
    </>
  )
}
