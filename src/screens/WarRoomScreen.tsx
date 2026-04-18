import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '@/store/gameStore'
import { useAIGenerator } from '@/hooks/useAIGenerator'
import { useGameState } from '@/hooks/useGameState'
import { GlassPanel } from '@/components/GlassPanel'
import { AppIcon } from '@/components/AppIcon'
import type { Territory } from '@/types'

function influenceClass(n: number) {
  if (n >= 70) return 'bg-secondary'
  if (n >= 40) return 'bg-[#ffb4ac]'
  if (n >= 20) return 'bg-on-surface/40'
  return 'bg-error/60'
}

function controllerClass(c: string) {
  if (c === 'Player') return 'text-secondary'
  if (c === 'Contested') return 'text-[#ffb4ac]'
  return 'text-error'
}

export default function WarRoomScreen() {
  const {
    territories,
    selectedTerritory,
    setSelectedTerritory,
    activeRegion,
    setActiveRegion,
    player,
    currentEvent,
    isGenerating,
  } = useGameStore()

  const { generateNarrative, handleChoice } = useAIGenerator()
  const { applyChoiceEffects } = useGameState()
  const navigate = useNavigate()

  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const regionTerritories = territories.filter((t) => t.region === activeRegion)

  async function launchOperation(territory: Territory, operation: string) {
    setActionLoading(operation)
    setSelectedTerritory(territory)
    await generateNarrative(
      `${player?.name ?? 'Don'} launches a "${operation}" operation in ${territory.name}. Current influence: ${territory.influence}%. Controller: ${territory.controller}. Resistance level: ${territory.resistanceLevel}/5.`,
      `operation_${operation.toLowerCase().replace(/ /g, '_')}`
    )
    setActionLoading(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-label text-[10px] uppercase tracking-[0.4em] text-primary/60">Strategic Operations</p>
          <h1 className="font-headline text-3xl italic text-on-surface">War Room</h1>
        </div>
        {/* Region toggle */}
        <div className="flex border border-outline-variant/20">
          {(['italy', 'usa'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setActiveRegion(r)}
              className={`px-5 py-2.5 font-label text-[10px] uppercase tracking-widest transition-all ${
                activeRegion === r
                  ? 'bg-primary-container text-primary'
                  : 'text-on-surface/40 hover:text-on-surface'
              }`}
            >
              {r === 'italy' ? '🇮🇹 Italy' : '🇺🇸 USA'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Territory map (left 2/3) */}
        <div className="xl:col-span-2 space-y-4">
          {/* Map visualiser */}
          <GlassPanel className="p-6 relative overflow-hidden" style={{ minHeight: '320px' }}>
            <p className="font-label text-[10px] uppercase tracking-[0.3em] text-on-surface/40 mb-4">
              Territory Map — {activeRegion === 'italy' ? 'Italy' : 'United States'}
            </p>
            {/* Dot map */}
            <div className="relative w-full" style={{ height: '240px', background: 'rgba(255,255,255,0.02)' }}>
              {regionTerritories.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTerritory(t)}
                  style={{
                    position: 'absolute',
                    left: `${t.positionX}%`,
                    top: `${t.positionY}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className="group flex flex-col items-center"
                  aria-label={t.name}
                >
                  <div
                    className={`rounded-full border-2 transition-all ${
                      selectedTerritory?.id === t.id
                        ? 'w-5 h-5 border-primary shadow-[0_0_12px_rgba(1,105,111,0.6)]'
                        : 'w-3.5 h-3.5 border-outline-variant/30 group-hover:w-4 group-hover:h-4'
                    } ${influenceClass(t.influence)}`}
                  />
                  <span className={`font-label text-[9px] uppercase tracking-wider mt-1 whitespace-nowrap ${
                    selectedTerritory?.id === t.id ? 'text-primary' : 'text-on-surface/40 group-hover:text-on-surface'
                  }`}>
                    {t.name}
                  </span>
                </button>
              ))}
              {/* Legend */}
              <div className="absolute bottom-0 left-0 flex items-center gap-4">
                {[
                  { label: 'Controlled', class: 'bg-secondary' },
                  { label: 'Contested', class: 'bg-[#ffb4ac]' },
                  { label: 'Hostile', class: 'bg-error/60' },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${l.class}`} />
                    <span className="font-label text-[9px] uppercase tracking-widest text-on-surface/30">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </GlassPanel>

          {/* Territory list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {regionTerritories.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTerritory(t)}
                className={`text-left p-4 border transition-all ${
                  selectedTerritory?.id === t.id
                    ? 'border-primary bg-primary-container/20'
                    : 'border-outline-variant/20 bg-surface-container-low hover:border-outline-variant/50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-label text-sm font-bold text-on-surface">{t.name}</p>
                    <p className={`font-label text-[10px] uppercase tracking-wide ${controllerClass(t.controller)}`}>
                      {t.controller}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-label text-lg font-bold tabular-nums text-on-surface">{t.influence}%</p>
                    <p className="font-label text-[9px] uppercase text-on-surface/30">Influence</p>
                  </div>
                </div>
                {/* Influence bar */}
                <div className="h-1 bg-outline-variant/20 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${influenceClass(t.influence)}`}
                    style={{ width: `${t.influence}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-label text-[9px] text-secondary">{new Intl.NumberFormat().format(t.weeklyIncome)} ₤/wk</span>
                  <span className="font-label text-[9px] text-on-surface/30">Resistance {t.resistanceLevel}/5</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right panel — selected territory detail */}
        <div className="space-y-4">
          {selectedTerritory ? (
            <>
              <GlassPanel border="left" className="p-5">
                <p className="font-label text-[10px] uppercase tracking-[0.3em] text-primary/60 mb-3">Target Dossier</p>
                <h2 className="font-headline text-2xl italic text-on-surface mb-1">{selectedTerritory.name}</h2>
                <p className={`font-label text-[10px] uppercase tracking-wide mb-4 ${controllerClass(selectedTerritory.controller)}`}>
                  {selectedTerritory.controller}
                </p>
                <p className="font-body text-sm text-on-surface/60 leading-relaxed mb-5">
                  {selectedTerritory.description}
                </p>
                <div className="space-y-3 border-t border-outline-variant/15 pt-4">
                  <Stat label="Influence" value={`${selectedTerritory.influence}%`} />
                  <Stat label="Weekly Income" value={`₤${new Intl.NumberFormat().format(selectedTerritory.weeklyIncome)}`} />
                  <Stat label="Resistance" value={`${selectedTerritory.resistanceLevel} / 5`} />
                </div>
              </GlassPanel>

              {/* Operations */}
              <GlassPanel className="p-5">
                <p className="font-label text-[10px] uppercase tracking-[0.3em] text-on-surface/40 mb-3">Launch Operation</p>
                <div className="space-y-2">
                  {[
                    { label: 'Infiltrate', icon: 'visibility', desc: '+Influence, +Heat' },
                    { label: 'Bribe Officials', icon: 'attach_money', desc: '-₤25K, +Safety' },
                    { label: 'Hostile Takeover', icon: 'bolt', desc: '++Territory, +++Heat' },
                    { label: 'Diplomatic Overture', icon: 'handshake', desc: '+Diplomacy, -Suspicion' },
                  ].map((op) => (
                    <button
                      key={op.label}
                      onClick={() => void launchOperation(selectedTerritory, op.label)}
                      disabled={actionLoading !== null || isGenerating}
                      className="w-full group flex items-center gap-3 px-4 py-3 bg-surface-container-low border border-outline-variant/20 hover:border-primary/40 hover:bg-primary-container/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-left"
                    >
                      <AppIcon name={op.icon} className="text-on-surface/40 group-hover:text-primary transition-colors text-sm" />
                      <div className="flex-1">
                        <p className="font-label text-xs font-bold uppercase tracking-wide text-on-surface group-hover:text-primary transition-colors">{op.label}</p>
                        <p className="font-label text-[9px] text-on-surface/30 uppercase tracking-wide">{op.desc}</p>
                      </div>
                      {actionLoading === op.label && (
                        <span className="w-3 h-3 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
                      )}
                    </button>
                  ))}
                </div>
              </GlassPanel>

              {/* AI result */}
              {(currentEvent || isGenerating) && (
                <GlassPanel border="left" className="p-5">
                  <p className="font-label text-[10px] uppercase tracking-[0.3em] text-primary/60 mb-3">Operation Report</p>
                  {isGenerating ? (
                    <div className="space-y-2">
                      {[1,2,3].map(i => <div key={i} className="h-3 bg-surface-container-high rounded animate-pulse" style={{ width: `${80 - i * 8}%` }} />)}
                    </div>
                  ) : (
                    <>
                      <p className="font-body text-sm text-on-surface/70 leading-relaxed mb-4">{currentEvent?.content}</p>
                      {currentEvent && (
                        <div className="space-y-2">
                          {currentEvent.choices.map((c) => (
                            <button
                              key={c.id}
                              onClick={() => { applyChoiceEffects(c.label); handleChoice(c, currentEvent) }}
                              className="w-full group flex items-start justify-between gap-3 px-4 py-3 bg-surface-container-low border border-outline-variant/20 hover:border-primary/30 hover:bg-primary-container/20 transition-all text-left"
                            >
                              <div className="flex-1">
                                <p className="font-body text-xs text-on-surface">{c.text}</p>
                                {c.label && <p className="font-label text-[9px] text-on-surface/30 mt-0.5 uppercase tracking-wide">{c.label}</p>}
                              </div>
                              <AppIcon name="arrow_forward" className="text-primary/40 group-hover:text-primary text-sm transition-all group-hover:translate-x-0.5" />
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </GlassPanel>
              )}
            </>
          ) : (
            <GlassPanel className="p-8 flex flex-col items-center justify-center text-center">
              <AppIcon name="map" className="text-on-surface/20 text-5xl mb-3" />
              <p className="font-label text-xs uppercase tracking-widest text-on-surface/30">
                Select a territory to begin
              </p>
            </GlassPanel>
          )}

          {/* Campaign CTA */}
          <button
            onClick={() => navigate('/conclude')}
            className="w-full group flex items-center justify-between px-5 py-4 border border-error/20 bg-error/5 hover:bg-error/10 hover:border-error/40 transition-all"
          >
            <span className="font-label text-[10px] uppercase tracking-widest text-error/70 group-hover:text-error transition-colors">
              Conclude Campaign
            </span>
            <AppIcon name="flag" className="text-error/40 group-hover:text-error text-sm transition-colors" />
          </button>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-label text-[10px] uppercase tracking-widest text-on-surface/40">{label}</span>
      <span className="font-label text-sm font-bold text-on-surface tabular-nums">{value}</span>
    </div>
  )
}
