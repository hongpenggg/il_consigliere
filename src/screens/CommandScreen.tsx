import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '@/store/gameStore'
import { useAIGenerator } from '@/hooks/useAIGenerator'
import { useGameState } from '@/hooks/useGameState'
import { GlassPanel } from '@/components/GlassPanel'
import { formatLira } from '@/lib/utils'

// ─── Severity dot colour ──────────────────────────────────────────────────────
function severityClass(s: string) {
  if (s === 'critical') return 'bg-error'
  if (s === 'high') return 'bg-[#ffb4ac]'
  if (s === 'medium') return 'bg-secondary'
  return 'bg-on-surface/30'
}

export default function CommandScreen() {
  const {
    player,
    currentEvent,
    isGenerating,
    narrativeHistory,
    intelReports,
    familyMembers,
    territories,
  } = useGameStore()

  const { generateNarrative, handleChoice } = useAIGenerator()
  const { applyChoiceEffects, getHeatColor } = useGameState()
  const navigate = useNavigate()

  // Generate opening event if none exists
  useEffect(() => {
    if (!currentEvent && !isGenerating) {
      generateNarrative(
        `The ${player?.familyName ?? 'Corleone'} family begins a new operation. ${
          player?.name ?? 'Don'
        } surveys the city from their stronghold.`,
        'session_start'
      )
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const playerTerritories = territories.filter((t) => t.controller === 'Player')
  const weeklyIncome = playerTerritories.reduce((sum, t) => sum + t.weeklyIncome, 0)

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-label text-[10px] uppercase tracking-[0.4em] text-primary/60">Command Center</p>
          <h1 className="font-headline text-3xl italic text-on-surface">
            {player?.familyName} Family Operations
          </h1>
        </div>
        <button
          onClick={() => navigate('/conclude')}
          className="font-label text-[10px] uppercase tracking-widest text-on-surface/30 hover:text-error transition-colors border border-outline-variant/20 px-4 py-2 hover:border-error/40"
        >
          End Campaign
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Heat Level" value={`${player?.heat ?? 0}%`} valueClass={getHeatColor()} icon="local_fire_department" />
        <KpiCard label="Family Loyalty" value={`${player?.loyalty ?? 0}%`} valueClass="text-secondary" icon="favorite" />
        <KpiCard label="Territory" value={`${player?.territoryControl ?? 0}%`} valueClass="text-on-surface" icon="map" />
        <KpiCard label="Weekly Income" value={formatLira(weeklyIncome)} valueClass="text-secondary" icon="payments" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ── Narrative panel (2/3 width) ── */}
        <div className="xl:col-span-2 space-y-4">
          <GlassPanel border="left" className="p-6">
            <div className="flex items-center justify-between mb-5">
              <p className="font-label text-[10px] uppercase tracking-[0.3em] text-primary/60">Incoming Intelligence</p>
              {isGenerating && (
                <span className="flex items-center gap-2 font-label text-[10px] uppercase tracking-widest text-on-surface/40 animate-pulse">
                  <span className="w-2 h-2 bg-primary rounded-full animate-ping" />
                  Generating...
                </span>
              )}
            </div>

            {/* Narrative text */}
            <div className="mb-6 min-h-[100px]">
              {isGenerating && !currentEvent ? (
                <div className="space-y-3">
                  <div className="h-4 bg-surface-container-high rounded animate-pulse w-full" />
                  <div className="h-4 bg-surface-container-high rounded animate-pulse w-5/6" />
                  <div className="h-4 bg-surface-container-high rounded animate-pulse w-4/6" />
                </div>
              ) : (
                <p className="font-body text-on-surface-variant leading-[1.9] text-base">
                  {currentEvent?.content ?? 'Awaiting your orders...'}
                </p>
              )}
            </div>

            {/* Choices */}
            {currentEvent && !isGenerating && (
              <div className="space-y-3">
                <p className="font-label text-[9px] uppercase tracking-[0.3em] text-on-surface/30 mb-4">Your Move</p>
                {currentEvent.choices.map((choice) => (
                  <button
                    key={choice.id}
                    onClick={() => {
                      applyChoiceEffects(choice.label)
                      handleChoice(choice, currentEvent)
                    }}
                    className="w-full group flex items-start justify-between gap-4 px-5 py-4 bg-surface-container-low border border-outline-variant/20 hover:border-primary/40 hover:bg-primary-container/30 transition-all text-left active:scale-[0.99]"
                  >
                    <div className="flex-1">
                      <p className="font-body text-sm text-on-surface group-hover:text-on-surface transition-colors leading-snug">
                        {choice.text}
                      </p>
                      {choice.label && (
                        <p className="font-label text-[10px] text-on-surface/30 mt-1.5 uppercase tracking-wide">
                          {choice.label}
                        </p>
                      )}
                    </div>
                    <span className="material-symbols-outlined text-primary/40 group-hover:text-primary group-hover:translate-x-1 transition-all mt-0.5 text-lg flex-shrink-0">
                      arrow_forward
                    </span>
                  </button>
                ))}
              </div>
            )}
          </GlassPanel>

          {/* History */}
          {narrativeHistory.length > 0 && (
            <GlassPanel className="p-5">
              <p className="font-label text-[10px] uppercase tracking-[0.3em] text-on-surface/30 mb-4">Recent History</p>
              <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                {[...narrativeHistory].reverse().slice(0, 5).map((evt) => (
                  <div key={evt.id} className="border-l-2 border-outline-variant/20 pl-4">
                    <p className="font-body text-xs text-on-surface/50 leading-relaxed line-clamp-2">
                      {evt.content}
                    </p>
                  </div>
                ))}
              </div>
            </GlassPanel>
          )}
        </div>

        {/* ── Right sidebar ── */}
        <div className="space-y-4">
          {/* Intel */}
          <GlassPanel className="p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="font-label text-[10px] uppercase tracking-[0.3em] text-on-surface/40">Intel Feed</p>
              <button onClick={() => navigate('/dialogue')} className="font-label text-[9px] uppercase tracking-widest text-primary/60 hover:text-primary transition-colors">
                View All
              </button>
            </div>
            <div className="space-y-3">
              {intelReports.slice(0, 3).map((r) => (
                <div key={r.id} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${severityClass(r.severity)}`} />
                  <div>
                    <p className="font-label text-xs font-bold text-on-surface">{r.title}</p>
                    <p className="font-body text-[11px] text-on-surface/50 leading-snug mt-0.5">
                      {r.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>

          {/* Family */}
          <GlassPanel className="p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="font-label text-[10px] uppercase tracking-[0.3em] text-on-surface/40">Family Status</p>
            </div>
            <div className="space-y-3">
              {familyMembers.map((m) => (
                <div key={m.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-label text-xs text-on-surface">{m.name}</p>
                    <p className="font-label text-[10px] text-on-surface/40 uppercase">{m.role}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-label text-sm font-bold tabular-nums ${
                      m.loyalty >= 80 ? 'text-secondary' : m.loyalty >= 50 ? 'text-on-surface' : 'text-error'
                    }`}>{m.loyalty}%</p>
                    <p className="font-label text-[9px] text-on-surface/30 uppercase">Loyalty</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>

          {/* Quick actions */}
          <GlassPanel className="p-5">
            <p className="font-label text-[10px] uppercase tracking-[0.3em] text-on-surface/40 mb-3">Quick Actions</p>
            <div className="space-y-2">
              {[
                { label: 'View Ledger', icon: 'payments', path: '/ledger' },
                { label: 'War Room', icon: 'military_tech', path: '/war-room' },
                { label: 'Intelligence', icon: 'forum', path: '/dialogue' },
              ].map((a) => (
                <button
                  key={a.path}
                  onClick={() => navigate(a.path)}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-surface-container-low hover:bg-surface-container border border-outline-variant/10 hover:border-outline-variant/30 transition-all group"
                >
                  <span className="material-symbols-outlined text-on-surface/40 group-hover:text-primary transition-colors text-sm">{a.icon}</span>
                  <span className="font-label text-[10px] uppercase tracking-widest text-on-surface/60 group-hover:text-on-surface transition-colors">{a.label}</span>
                </button>
              ))}
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  )
}

function KpiCard({ label, value, valueClass, icon }: { label: string; value: string; valueClass: string; icon: string }) {
  return (
    <div className="bg-surface-container-low border border-outline-variant/15 p-5 flex items-start justify-between">
      <div>
        <p className="font-label text-[10px] uppercase tracking-widest text-on-surface/40 mb-2">{label}</p>
        <p className={`font-label text-2xl font-bold tabular-nums ${valueClass}`}>{value}</p>
      </div>
      <span className="material-symbols-outlined text-on-surface/20 text-2xl">{icon}</span>
    </div>
  )
}
