import { useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { useAIGenerator } from '@/hooks/useAIGenerator'
import { useGameState } from '@/hooks/useGameState'
import { GlassPanel } from '@/components/GlassPanel'
import type { FamilyMember } from '@/types'

const SEVERITY_BADGE: Record<string, string> = {
  critical: 'bg-error/15 text-error border-error/30',
  high: 'bg-[#89070e]/15 text-[#ffb4ac] border-[#ffb4ac]/30',
  medium: 'bg-secondary/10 text-secondary border-secondary/30',
  low: 'bg-surface-container text-on-surface/50 border-outline-variant/20',
}

export default function DialogueScreen() {
  const { familyMembers, intelReports, player, currentEvent, isGenerating } = useGameStore()
  const { handleChoice, generateNarrative } = useAIGenerator()
  const { applyChoiceEffects } = useGameState()

  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(familyMembers[0] ?? null)
  const [activeTab, setActiveTab] = useState<'intel' | 'family'>('intel')

  function consult(member: FamilyMember) {
    setSelectedMember(member)
    generateNarrative(
      `${player?.name ?? 'Don'} consults ${member.name}, the ${member.role}. Their loyalty is at ${member.loyalty}%.`,
      `consult_${member.id}`
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="font-label text-[10px] uppercase tracking-[0.4em] text-primary/60">Intelligence & Diplomacy</p>
        <h1 className="font-headline text-3xl italic text-on-surface">The Council Chamber</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-outline-variant/20">
        {(['intel', 'family'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-label text-[10px] uppercase tracking-widest transition-all ${
              activeTab === tab
                ? 'text-primary border-b-2 border-primary -mb-px'
                : 'text-on-surface/40 hover:text-on-surface'
            }`}
          >
            {tab === 'intel' ? 'Intel Reports' : 'Consult Family'}
          </button>
        ))}
      </div>

      {activeTab === 'intel' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reports list */}
          <div className="lg:col-span-1 space-y-3">
            {intelReports.map((r) => (
              <GlassPanel key={r.id} className="p-4 cursor-default">
                <div className="flex items-start gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-label text-[9px] uppercase tracking-widest px-2 py-0.5 border rounded-sm ${
                        SEVERITY_BADGE[r.severity] ?? SEVERITY_BADGE.low
                      }`}>
                        {r.severity}
                      </span>
                      {r.territory && (
                        <span className="font-label text-[9px] text-on-surface/30 uppercase tracking-wide">{r.territory}</span>
                      )}
                    </div>
                    <p className="font-label text-sm font-bold text-on-surface">{r.title}</p>
                    <p className="font-body text-xs text-on-surface/50 leading-relaxed mt-1">{r.description}</p>
                  </div>
                </div>
              </GlassPanel>
            ))}
          </div>

          {/* Narrative / AI response */}
          <div className="lg:col-span-2">
            <GlassPanel border="left" className="p-6 h-full">
              <p className="font-label text-[10px] uppercase tracking-[0.3em] text-primary/60 mb-5">Situation Report</p>
              {isGenerating ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => <div key={i} className="h-4 bg-surface-container-high rounded animate-pulse" style={{ width: `${90 - i * 10}%` }} />)}
                </div>
              ) : (
                <>
                  <p className="font-body text-on-surface-variant leading-[1.9] text-base mb-6">
                    {currentEvent?.content ?? 'Select a report to analyse it with the council.'}
                  </p>
                  {currentEvent && (
                    <div className="space-y-2">
                      {currentEvent.choices.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => { applyChoiceEffects(c.label); handleChoice(c, currentEvent) }}
                          className="w-full group flex items-start justify-between gap-4 px-5 py-4 bg-surface-container-low border border-outline-variant/20 hover:border-primary/40 hover:bg-primary-container/20 transition-all text-left"
                        >
                          <div className="flex-1">
                            <p className="font-body text-sm text-on-surface">{c.text}</p>
                            {c.label && <p className="font-label text-[10px] text-on-surface/30 mt-1 uppercase tracking-wide">{c.label}</p>}
                          </div>
                          <span className="material-symbols-outlined text-primary/40 group-hover:text-primary group-hover:translate-x-1 transition-all text-lg flex-shrink-0">
                            arrow_forward
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </GlassPanel>
          </div>
        </div>
      )}

      {activeTab === 'family' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Family members */}
          <div className="lg:col-span-1 space-y-3">
            {familyMembers.map((m) => (
              <button
                key={m.id}
                onClick={() => consult(m)}
                className={`w-full text-left p-4 border transition-all ${
                  selectedMember?.id === m.id
                    ? 'border-primary bg-primary-container/30'
                    : 'border-outline-variant/20 bg-surface-container-low hover:border-outline-variant/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-label text-sm font-bold text-on-surface">{m.name}</p>
                    <p className="font-label text-[10px] uppercase tracking-wide text-on-surface/40 mt-0.5">{m.role}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-label text-lg font-bold tabular-nums ${
                      m.loyalty >= 80 ? 'text-secondary' : m.loyalty >= 50 ? 'text-on-surface' : 'text-error'
                    }`}>{m.loyalty}%</p>
                    <p className="font-label text-[9px] uppercase text-on-surface/30">Loyalty</p>
                  </div>
                </div>
                {/* Loyalty bar */}
                <div className="mt-3 h-0.5 bg-outline-variant/20 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      m.loyalty >= 80 ? 'bg-secondary' : m.loyalty >= 50 ? 'bg-on-surface/50' : 'bg-error'
                    }`}
                    style={{ width: `${m.loyalty}%` }}
                  />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    m.status === 'active' ? 'bg-secondary' : m.status === 'compromised' ? 'bg-error' : 'bg-on-surface/30'
                  }`} />
                  <span className="font-label text-[9px] uppercase tracking-widest text-on-surface/30">{m.status}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Consultation panel */}
          <div className="lg:col-span-2">
            <GlassPanel border="left" className="p-6 h-full">
              {selectedMember ? (
                <>
                  <div className="mb-5 flex items-start justify-between">
                    <div>
                      <p className="font-label text-[10px] uppercase tracking-[0.3em] text-primary/60">Consulting</p>
                      <h2 className="font-headline text-2xl italic text-on-surface">{selectedMember.name}</h2>
                      <p className="font-label text-[10px] uppercase text-on-surface/40 tracking-wide">{selectedMember.role}</p>
                    </div>
                    <button
                      onClick={() => consult(selectedMember)}
                      disabled={isGenerating}
                      className="flex items-center gap-2 px-4 py-2 border border-primary/30 text-primary font-label text-[10px] uppercase tracking-widest hover:bg-primary-container/30 transition-all disabled:opacity-40"
                    >
                      <span className="material-symbols-outlined text-sm">refresh</span>
                      Consult Again
                    </button>
                  </div>
                  {isGenerating ? (
                    <div className="space-y-3">
                      {[1,2,3].map(i => <div key={i} className="h-4 bg-surface-container-high rounded animate-pulse" style={{ width: `${85 - i * 8}%` }} />)}
                    </div>
                  ) : (
                    <p className="font-body text-on-surface-variant leading-[1.9] text-base">
                      {currentEvent?.content ?? `${selectedMember.name} awaits your instruction. Press 'Consult Again' to seek their counsel.`}
                    </p>
                  )}
                  {currentEvent && !isGenerating && (
                    <div className="space-y-2 mt-6">
                      {currentEvent.choices.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => { applyChoiceEffects(c.label); handleChoice(c, currentEvent) }}
                          className="w-full group flex items-start justify-between gap-4 px-5 py-4 bg-surface-container-low border border-outline-variant/20 hover:border-primary/40 hover:bg-primary-container/20 transition-all text-left"
                        >
                          <div className="flex-1">
                            <p className="font-body text-sm text-on-surface">{c.text}</p>
                            {c.label && <p className="font-label text-[10px] text-on-surface/30 mt-1 uppercase tracking-wide">{c.label}</p>}
                          </div>
                          <span className="material-symbols-outlined text-primary/40 group-hover:text-primary transition-all text-lg flex-shrink-0 group-hover:translate-x-1">arrow_forward</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <span className="material-symbols-outlined text-on-surface/20 text-5xl mb-3">forum</span>
                  <p className="font-label text-xs uppercase tracking-widest text-on-surface/30">Select a family member to consult</p>
                </div>
              )}
            </GlassPanel>
          </div>
        </div>
      )}
    </div>
  )
}
