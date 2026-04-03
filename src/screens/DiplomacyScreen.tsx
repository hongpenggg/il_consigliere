// DiplomacyScreen.tsx
// Dedicated Diplomacy page — manage alliances, truces, and envoys with rival families.

import { useState } from 'react'
import { useGameStore } from '@/store/gameStore'

type Stance = 'allied' | 'neutral' | 'hostile'

interface Faction {
  id: string
  name: string
  region: string
  stance: Stance
  trust: number        // 0–100
  lastContact: string
}

const INITIAL_FACTIONS: Faction[] = [
  { id: 'brenta',    name: 'Famiglia del Brenta',  region: 'Veneto',     stance: 'neutral', trust: 42, lastContact: '3 days ago' },
  { id: 'comasina',  name: 'Banda della Comasina', region: 'Lombardy',   stance: 'hostile', trust: 12, lastContact: '2 weeks ago' },
  { id: 'magliana',  name: 'Banda della Magliana', region: 'Lazio',      stance: 'allied',  trust: 74, lastContact: 'Yesterday' },
  { id: 'cosentino', name: 'Famiglia Cosentino',   region: 'Basilicata', stance: 'neutral', trust: 55, lastContact: '1 week ago' },
  { id: 'scu',       name: 'Sacra Corona Unita',   region: 'Apulia',     stance: 'hostile', trust: 8,  lastContact: '1 month ago' },
]

const STANCE_COLOURS: Record<Stance, string> = {
  allied:  'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  neutral: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  hostile: 'text-red-400 bg-red-400/10 border-red-400/20',
}

const STANCE_ICON: Record<Stance, string> = {
  allied:  'handshake',
  neutral: 'balance',
  hostile: 'crisis_alert',
}

export default function DiplomacyScreen() {
  const player = useGameStore((s) => s.player)
  const [factions, setFactions] = useState<Faction[]>(INITIAL_FACTIONS)
  const [selected, setSelected] = useState<Faction | null>(null)
  const [log, setLog] = useState<string[]>([])

  function sendEnvoy(factionId: string) {
    setFactions((prev) =>
      prev.map((f) =>
        f.id === factionId
          ? { ...f, trust: Math.min(100, f.trust + 8), lastContact: 'Just now' }
          : f
      )
    )
    const target = factions.find((f) => f.id === factionId)!
    setLog((l) => [`Envoy dispatched to ${target.name}. Trust +8.`, ...l])
    if (selected?.id === factionId) {
      setSelected((prev) => prev ? { ...prev, trust: Math.min(100, prev.trust + 8), lastContact: 'Just now' } : prev)
    }
  }

  function proposeAlliance(factionId: string) {
    const target = factions.find((f) => f.id === factionId)!
    if (target.trust < 60) {
      setLog((l) => [`${target.name} refused your proposal — trust too low (need ≥60).`, ...l])
      return
    }
    setFactions((prev) =>
      prev.map((f) =>
        f.id === factionId ? { ...f, stance: 'allied', lastContact: 'Just now' } : f
      )
    )
    setLog((l) => [`Alliance forged with ${target.name}.`, ...l])
    if (selected?.id === factionId) setSelected((prev) => prev ? { ...prev, stance: 'allied' } : prev)
  }

  function declareTruce(factionId: string) {
    setFactions((prev) =>
      prev.map((f) =>
        f.id === factionId ? { ...f, stance: 'neutral', lastContact: 'Just now' } : f
      )
    )
    const target = factions.find((f) => f.id === factionId)!
    setLog((l) => [`Truce declared with ${target.name}.`, ...l])
    if (selected?.id === factionId) setSelected((prev) => prev ? { ...prev, stance: 'neutral' } : prev)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#ffb4ac]/10 pb-4">
        <h1 className="font-headline text-2xl text-[#ffb4ac] tracking-wide">Diplomacy</h1>
        <p className="font-label text-xs text-gray-400 uppercase tracking-widest mt-1">
          {player?.familyName ?? 'Your Family'} — Alliances &amp; Envoys
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Faction list */}
        <div className="lg:col-span-2 space-y-3">
          {factions.map((faction) => (
            <button
              key={faction.id}
              onClick={() => setSelected(faction)}
              className={`w-full text-left p-4 border transition-all ${
                selected?.id === faction.id
                  ? 'border-[#ffb4ac]/40 bg-[#ffb4ac]/5'
                  : 'border-[#ffb4ac]/10 bg-[#1c1c1c] hover:border-[#ffb4ac]/25 hover:bg-[#252525]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-headline text-sm text-white">{faction.name}</p>
                  <p className="font-label text-[10px] uppercase tracking-widest text-gray-500 mt-0.5">{faction.region}</p>
                </div>
                <div className="flex items-center gap-3">
                  {/* Trust bar */}
                  <div className="w-24">
                    <p className="font-label text-[9px] text-gray-500 mb-1">Trust {faction.trust}%</p>
                    <div className="h-1 bg-[#2a2a2a] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#ffb4ac] transition-all duration-500"
                        style={{ width: `${faction.trust}%` }}
                      />
                    </div>
                  </div>
                  {/* Stance badge */}
                  <span className={`flex items-center gap-1 px-2 py-1 rounded border font-label text-[10px] uppercase tracking-widest ${STANCE_COLOURS[faction.stance]}`}>
                    <span className="material-symbols-outlined text-sm">{STANCE_ICON[faction.stance]}</span>
                    {faction.stance}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Action panel */}
        <div className="space-y-4">
          {selected ? (
            <div className="border border-[#ffb4ac]/15 bg-[#1c1c1c] p-5 space-y-4">
              <div>
                <p className="font-headline text-base text-[#ffb4ac]">{selected.name}</p>
                <p className="font-label text-[10px] uppercase text-gray-500 tracking-widest">{selected.region}</p>
                <p className="font-label text-[10px] text-gray-500 mt-2">Last contact: {selected.lastContact}</p>
              </div>
              <div className="space-y-2 pt-2 border-t border-[#ffb4ac]/10">
                <button
                  onClick={() => sendEnvoy(selected.id)}
                  className="w-full py-2 font-label text-[10px] uppercase tracking-widest border border-[#ffb4ac]/20 text-[#ffb4ac] hover:bg-[#ffb4ac]/10 transition-all"
                >
                  <span className="material-symbols-outlined text-sm align-middle mr-1">send</span>
                  Send Envoy (+8 Trust)
                </button>
                <button
                  onClick={() => proposeAlliance(selected.id)}
                  disabled={selected.stance === 'allied'}
                  className="w-full py-2 font-label text-[10px] uppercase tracking-widest border border-emerald-400/20 text-emerald-400 hover:bg-emerald-400/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-sm align-middle mr-1">handshake</span>
                  Propose Alliance (Trust ≥60)
                </button>
                <button
                  onClick={() => declareTruce(selected.id)}
                  disabled={selected.stance !== 'hostile'}
                  className="w-full py-2 font-label text-[10px] uppercase tracking-widest border border-yellow-400/20 text-yellow-400 hover:bg-yellow-400/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-sm align-middle mr-1">balance</span>
                  Declare Truce
                </button>
              </div>
            </div>
          ) : (
            <div className="border border-[#ffb4ac]/10 bg-[#1c1c1c] p-5 text-center">
              <span className="material-symbols-outlined text-4xl text-gray-600">gavel</span>
              <p className="font-label text-[10px] uppercase text-gray-500 mt-2 tracking-widest">Select a faction to begin negotiations</p>
            </div>
          )}

          {/* Dispatch log */}
          {log.length > 0 && (
            <div className="border border-[#ffb4ac]/10 bg-[#1c1c1c] p-4 space-y-2">
              <p className="font-label text-[9px] uppercase tracking-widest text-gray-500">Dispatch Log</p>
              {log.slice(0, 5).map((entry, i) => (
                <p key={i} className="font-label text-[10px] text-gray-400 border-l-2 border-[#ffb4ac]/20 pl-2">{entry}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
