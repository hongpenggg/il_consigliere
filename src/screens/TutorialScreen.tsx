// TutorialScreen.tsx
// Interactive tutorial — mirrors the Python game's Chapters 0–10.
// Each chapter presents narrative text, choices, and mini-tasks.

import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '@/store/gameStore'

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase =
  | 'chapter0'
  | 'chapter1_news'
  | 'chapter1_ricci_reply'
  | 'chapter1_stats_intro'
  | 'chapter1_stat_panel'
  | 'chapter1_army'
  | 'chapter1_end'
  | 'chapter2_intro'
  | 'chapter2_objectives'
  | 'chapter2_spy'
  | 'chapter2_ricci_choice'
  | 'chapter2_vineyard'
  | 'chapter2_end'
  | 'chapter3_intro'
  | 'chapter3_mayor1'
  | 'chapter3_kidnap'
  | 'chapter3_mayor2'
  | 'chapter3_end'
  | 'chapter4_intro'
  | 'chapter4_drill'
  | 'chapter4_end'
  | 'chapter5_intro'
  | 'chapter5_trust'
  | 'chapter5_end'
  | 'chapter6_intro'
  | 'chapter6_map'
  | 'chapter6_end'
  | 'chapter7_intro'
  | 'chapter7_war'
  | 'chapter7_end'
  | 'chapter8_intro'
  | 'chapter8_business'
  | 'chapter8_end'
  | 'chapter9_intro'
  | 'chapter9_boosts'
  | 'chapter9_end'
  | 'chapter10_intro'
  | 'chapter10_boss'
  | 'chapter10_end'
  | 'done'

interface TutorialState {
  phase: Phase
  power: number
  wealth: number
  army: number
  familiarity: Record<string, number>
  loyalty: Record<string, number>
  characters: string[]
  objectiveTotal: number
  completedObjectives: string[]
  mayorTries: number
  ricciFamiliarityBonus: number
  recruitedTypes: string[]
  relationshipMoves: string[]
  regionsControlled: string[]
  warBattlesWon: string[]
  businessesStarted: string[]
  starterPackage: string | null
  bossOutcome: 'pending' | 'won' | 'lost'
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StatBar({ label, value, max = 100 }: { label: string; value: number; max?: number }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div>
      <div className="flex justify-between font-label text-[10px] uppercase tracking-widest text-gray-400 mb-1">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#ffb4ac] transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function NarrativeBox({ lines }: { lines: string[] }) {
  return (
    <div className="space-y-3">
      {lines.map((line, i) => {
        if (line.startsWith('RICCI:')) {
          return (
            <div key={i} className="flex gap-3">
              <div className="mt-0.5 w-8 h-8 flex-shrink-0 bg-[#89070e]/30 border border-[#ffb4ac]/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-sm text-[#ffb4ac]">person</span>
              </div>
              <div>
                <p className="font-label text-[9px] text-[#ffb4ac] uppercase tracking-widest mb-0.5">Francesco Ricci</p>
                <p className="font-body text-sm text-gray-300">{line.replace('RICCI: ', '')}</p>
              </div>
            </div>
          )
        }
        if (line.startsWith('MAYOR:')) {
          return (
            <div key={i} className="flex gap-3">
              <div className="mt-0.5 w-8 h-8 flex-shrink-0 bg-blue-900/30 border border-blue-400/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-sm text-blue-400">account_balance</span>
              </div>
              <div>
                <p className="font-label text-[9px] text-blue-400 uppercase tracking-widest mb-0.5">The Mayor</p>
                <p className="font-body text-sm text-gray-300">{line.replace('MAYOR: ', '')}</p>
              </div>
            </div>
          )
        }
        if (line.startsWith('GAME TIP:')) {
          return (
            <div key={i} className="border-l-2 border-yellow-400/40 pl-3 py-1">
              <p className="font-label text-[10px] text-yellow-400 uppercase tracking-widest mb-0.5">Game Tip</p>
              <p className="font-body text-xs text-yellow-200/70">{line.replace('GAME TIP: ', '')}</p>
            </div>
          )
        }
        if (line.startsWith('BREAKING NEWS:')) {
          return (
            <div key={i} className="border border-red-500/30 bg-red-900/10 p-3">
              <p className="font-label text-[9px] text-red-400 uppercase tracking-widest mb-1">⚡ Breaking News</p>
              <p className="font-body text-sm text-gray-200">{line.replace('BREAKING NEWS: ', '')}</p>
            </div>
          )
        }
        if (line === '') return <div key={i} className="h-1" />
        return <p key={i} className="font-body text-sm text-gray-300 leading-relaxed">{line}</p>
      })}
    </div>
  )
}

function ChoiceButton({ label, onClick, variant = 'default' }: { label: string; onClick: () => void; variant?: 'default' | 'danger' | 'success' }) {
  const colours = {
    default: 'border-[#ffb4ac]/20 text-[#ffb4ac] hover:bg-[#ffb4ac]/10',
    danger:  'border-red-400/30 text-red-400 hover:bg-red-400/10',
    success: 'border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/10',
  }
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 border font-label text-xs uppercase tracking-widest transition-all active:scale-[0.98] ${colours[variant]}`}
    >
      {label}
    </button>
  )
}

function ContinueButton({ onClick, label = 'Continue' }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      className="mt-4 px-6 py-3 bg-[#89070e] text-white font-label text-[10px] uppercase tracking-widest hover:bg-[#89070e]/80 transition-all active:scale-[0.98]"
    >
      {label} →
    </button>
  )
}

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
        <div className="h-full bg-[#89070e] transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
      <span className="font-label text-[9px] text-gray-500">{Math.round(pct)}%</span>
    </div>
  )
}

// ─── Objective task component ─────────────────────────────────────────────────

type TaskStatus = 'pending' | 'active' | 'running' | 'done'

const OBJECTIVES = [
  { id: 'armies',   label: 'Assemble 5 armies',                    hint: "Type: army army",            answer: ['army army', 'armyarmy'],         weight: 20, steps: ['Summoning the family... [0%]', 'Training the troops... [50%]', 'Purging the top brass... [100%]', '✔ Assembled 5 armies.'] },
  { id: 'ricci',    label: 'Improve relations with Ricci',          hint: "Type: ricci ricci ricci",     answer: ['ricci ricci ricci', 'ricciricciricci'], weight: 30, steps: ['Calling Ricci for coffee... [0%]', 'Inviting Ricci to a dinner party in Palermo... [33%]', 'Promoting Ricci to Hand of the King... [66%]', 'Starting a heist with Ricci... [99%]', '✔ Improved relationship with Francesco Ricci.'] },
  { id: 'regions',  label: 'Conquer 2 neighbouring regions',        hint: "Type: Apulia Calabria",       answer: ['apulia calabria', 'apuliacalabria', 'Apulia Calabria'],  weight: 50, steps: ['Gathering the armies... [0%]', 'Summoning the generals... [40%]', 'Waging war... [80%]', '✔ Conquered Apulia and Calabria.'] },
]

function ObjectivesTask({ onComplete }: { onComplete: () => void }) {
  const [input, setInput] = useState('')
  const [statusMap, setStatusMap] = useState<Record<string, TaskStatus>>({ armies: 'pending', ricci: 'pending', regions: 'pending' })
  const [logLines, setLogLines] = useState<string[]>([])
  const [total, setTotal] = useState(0)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function runTask(obj: typeof OBJECTIVES[number]) {
    setStatusMap((p) => ({ ...p, [obj.id]: 'running' }))
    for (const step of obj.steps) {
      await new Promise<void>((r) => setTimeout(r, 900))
      setLogLines((l) => [...l, step])
    }
    setTotal((t) => t + obj.weight)
    setStatusMap((p) => ({ ...p, [obj.id]: 'done' }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const val = input.trim().toLowerCase()
    setError('')

    const match = OBJECTIVES.find((o) =>
      statusMap[o.id] !== 'done' &&
      statusMap[o.id] !== 'running' &&
      o.answer.some((a) => a.toLowerCase() === val)
    )
    if (!match) {
      setError("Hmm, that doesn't seem right… Try again!")
      return
    }
    setInput('')
    await runTask(match)
  }

  const allDone = Object.values(statusMap).every((s) => s === 'done')

  return (
    <div className="space-y-4">
      <div className="border border-[#ffb4ac]/10 bg-[#1a1a1a] p-4 space-y-3">
        <div className="flex justify-between items-center">
          <p className="font-label text-[10px] uppercase tracking-widest text-gray-400">Objectives</p>
          <p className="font-label text-xs text-[#ffb4ac]">Total: {total} / 100</p>
        </div>
        {OBJECTIVES.map((obj) => {
          const status = statusMap[obj.id]
          return (
            <div key={obj.id} className="flex items-start gap-3">
              <div className={`mt-0.5 w-4 h-4 flex-shrink-0 border flex items-center justify-center ${
                status === 'done' ? 'bg-emerald-500/20 border-emerald-400/40' :
                status === 'running' ? 'bg-yellow-500/20 border-yellow-400/40' :
                'bg-[#2a2a2a] border-gray-600'
              }`}>
                {status === 'done' && <span className="material-symbols-outlined text-[10px] text-emerald-400">check</span>}
                {status === 'running' && <span className="material-symbols-outlined text-[10px] text-yellow-400 animate-spin" style={{fontSize:'10px'}}>autorenew</span>}
              </div>
              <div className="flex-1">
                <p className={`font-label text-[10px] uppercase tracking-widest ${
                  status === 'done' ? 'text-gray-600 line-through' : 'text-gray-300'
                }`}>{obj.label}</p>
                {status !== 'done' && (
                  <p className="font-label text-[9px] text-gray-500">{obj.hint} — +{obj.weight} pts</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Log */}
      {logLines.length > 0 && (
        <div className="border border-[#ffb4ac]/10 bg-[#161616] p-3 max-h-32 overflow-y-auto space-y-1">
          {logLines.map((l, i) => (
            <p key={i} className={`font-label text-[10px] ${ l.startsWith('✔') ? 'text-emerald-400' : 'text-gray-500'}`}>{l}</p>
          ))}
        </div>
      )}

      {!allDone ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Complete an objective..."
            className="flex-1 bg-[#1a1a1a] border border-[#ffb4ac]/20 px-3 py-2 font-label text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#ffb4ac]/50"
          />
          <button type="submit" className="px-4 py-2 bg-[#89070e] font-label text-[10px] uppercase tracking-widest text-white hover:bg-[#89070e]/80 transition-all">
            Execute
          </button>
        </form>
      ) : (
        <div className="space-y-2">
          <p className="font-label text-xs text-emerald-400">✔ All objectives complete! Total: {total} / 100</p>
          <ContinueButton onClick={onComplete} label="Continue to Spy Network" />
        </div>
      )}
      {error && <p className="font-label text-[10px] text-red-400">{error}</p>}
    </div>
  )
}

// ─── Kidnap task ──────────────────────────────────────────────────────────────

function KidnapTask({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'prompt' | 'running' | 'done'>('prompt')
  const [input, setInput] = useState('')
  const [log, setLog] = useState<string[]>([])
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (input.trim().toLowerCase() !== 'kidnap') {
      setError("That doesn't look right — type 'kidnap'.")
      return
    }
    setError('')
    setPhase('running')
    const steps = [
      'Planning with your lieutenants... [0%]',
      'Training the hit crew... [33%]',
      'Fighting off her bodyguards... [66%]',
      'Returning in victory... [99%]',
      '✔ You have kidnapped the mayor\'s wife!',
    ]
    for (const step of steps) {
      await new Promise<void>((r) => setTimeout(r, 900))
      setLog((l) => [...l, step])
    }
    setPhase('done')
  }

  return (
    <div className="space-y-3">
      <div className="border border-red-500/20 bg-red-900/5 p-3">
        <p className="font-label text-[9px] uppercase tracking-widest text-red-400 mb-1">Operation</p>
        <p className="font-body text-sm text-gray-300">[Kidnap the mayor's wife, +30 power] — type <code className="text-[#ffb4ac]">kidnap</code></p>
      </div>
      {log.length > 0 && (
        <div className="border border-[#ffb4ac]/10 bg-[#161616] p-3 space-y-1">
          {log.map((l, i) => (
            <p key={i} className={`font-label text-[10px] ${l.startsWith('✔') ? 'text-emerald-400' : 'text-gray-500'}`}>{l}</p>
          ))}
        </div>
      )}
      {phase !== 'done' ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Your order..."
            disabled={phase === 'running'}
            className="flex-1 bg-[#1a1a1a] border border-[#ffb4ac]/20 px-3 py-2 font-label text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#ffb4ac]/50 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={phase === 'running'}
            className="px-4 py-2 bg-[#89070e] font-label text-[10px] uppercase tracking-widest text-white hover:bg-[#89070e]/80 transition-all disabled:opacity-50"
          >
            Order
          </button>
        </form>
      ) : (
        <ContinueButton onClick={onComplete} label="Confront the Mayor" />
      )}
      {error && <p className="font-label text-[10px] text-red-400">{error}</p>}
    </div>
  )
}

// ─── Spy task ─────────────────────────────────────────────────────────────────

function SpyTask({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'prompt' | 'running' | 'done'>('prompt')
  const [input, setInput] = useState('')
  const [log, setLog] = useState<string[]>([])
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (input.trim().toLowerCase() !== 'spy') {
      setError("Type 'spy' to start assembling your network.")
      return
    }
    setError('')
    setPhase('running')
    const steps = [
      'Hiring informants... [0%]',
      "Bribing the mayor's secretary... [40%]",
      'Assassinating clean officials... [80%]',
      "✔ Successfully assembled 'The Eyes'.",
    ]
    for (const step of steps) {
      await new Promise<void>((r) => setTimeout(r, 900))
      setLog((l) => [...l, step])
    }
    setPhase('done')
  }

  return (
    <div className="space-y-3">
      <div className="border border-[#ffb4ac]/15 bg-[#1a1a1a] p-3">
        <p className="font-body text-sm text-gray-300">RICCI: The mafia life is all about control. Many bosses run extensive spy networks. Let's start our own!</p>
        <p className="font-label text-[10px] text-gray-500 mt-2">Type <code className="text-[#ffb4ac]">spy</code> to begin assembling your network.</p>
      </div>
      {log.length > 0 && (
        <div className="border border-[#ffb4ac]/10 bg-[#161616] p-3 space-y-1">
          {log.map((l, i) => (
            <p key={i} className={`font-label text-[10px] ${l.startsWith('✔') ? 'text-emerald-400' : 'text-gray-500'}`}>{l}</p>
          ))}
        </div>
      )}
      {phase !== 'done' ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Your order..."
            disabled={phase === 'running'}
            className="flex-1 bg-[#1a1a1a] border border-[#ffb4ac]/20 px-3 py-2 font-label text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#ffb4ac]/50 disabled:opacity-50"
          />
          <button type="submit" disabled={phase === 'running'} className="px-4 py-2 bg-[#89070e] font-label text-[10px] uppercase tracking-widest text-white hover:bg-[#89070e]/80 transition-all disabled:opacity-50">
            Execute
          </button>
        </form>
      ) : (
        <ContinueButton onClick={onComplete} label="Continue" />
      )}
      {error && <p className="font-label text-[10px] text-red-400">{error}</p>}
    </div>
  )
}

// ─── Vineyard task ────────────────────────────────────────────────────────────

function VineyardTask({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'prompt' | 'running' | 'done'>('prompt')
  const [input, setInput] = useState('')
  const [log, setLog] = useState<string[]>([])
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (input.trim().toLowerCase() !== 'vineyard') {
      setError("Type 'vineyard' to build it.")
      return
    }
    setError('')
    setPhase('running')
    const steps = [
      'Reviewing land prices... [0%]',
      'Sourcing the finest grapes... [50%]',
      'Hiring true artisans... [100%]',
      '✔ Vineyard constructed!',
    ]
    for (const step of steps) {
      await new Promise<void>((r) => setTimeout(r, 900))
      setLog((l) => [...l, step])
    }
    setPhase('done')
  }

  return (
    <div className="space-y-3">
      <div className="border border-[#ffb4ac]/15 bg-[#1a1a1a] p-3">
        <p className="font-body text-sm text-gray-300">RICCI: Let's build a vineyard! After all, wine is one of life's greatest joys.</p>
        <p className="font-label text-[10px] text-gray-500 mt-2">[Build your vineyard, +20 pts] — type <code className="text-[#ffb4ac]">vineyard</code></p>
      </div>
      {log.length > 0 && (
        <div className="border border-[#ffb4ac]/10 bg-[#161616] p-3 space-y-1">
          {log.map((l, i) => (
            <p key={i} className={`font-label text-[10px] ${l.startsWith('✔') ? 'text-emerald-400' : 'text-gray-500'}`}>{l}</p>
          ))}
        </div>
      )}
      {phase !== 'done' ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What are you building?"
            disabled={phase === 'running'}
            className="flex-1 bg-[#1a1a1a] border border-[#ffb4ac]/20 px-3 py-2 font-label text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#ffb4ac]/50 disabled:opacity-50"
          />
          <button type="submit" disabled={phase === 'running'} className="px-4 py-2 bg-[#89070e] font-label text-[10px] uppercase tracking-widest text-white hover:bg-[#89070e]/80 transition-all disabled:opacity-50">
            Build
          </button>
        </form>
      ) : (
        <ContinueButton onClick={onComplete} label="Continue to Chapter 3" />
      )}
      {error && <p className="font-label text-[10px] text-red-400">{error}</p>}
    </div>
  )
}

function ArmyDrillTask({ onComplete }: { onComplete: (units: number, types: string[]) => void }) {
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [units, setUnits] = useState(0)
  const [types, setTypes] = useState<string[]>([])
  const [log, setLog] = useState<string[]>([])

  async function recruit(kind: 'mercenary' | 'core' | 'family') {
    const labels = {
      mercenary: ['Paying captains... [0%]', 'Signing contracts... [60%]', '✔ Mercenary battalion recruited.'],
      core: ['Testing loyalty... [0%]', 'Training trusted men... [60%]', '✔ Core guard formed.'],
      family: ['Calling the bloodline... [0%]', 'Rallying house veterans... [60%]', '✔ Family regiment assembled.'],
    }
    for (const step of labels[kind]) {
      await new Promise<void>((r) => setTimeout(r, 700))
      setLog((l) => [...l, step])
    }
    setTypes((prev) => (prev.includes(kind) ? prev : [...prev, kind]))
    setUnits((u) => u + 2)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const val = input.trim().toLowerCase()
    setError('')
    if (val !== 'mercenary' && val !== 'core' && val !== 'family') {
      setError("Use 'mercenary', 'core', or 'family'.")
      return
    }
    setInput('')
    await recruit(val)
  }

  const ready = units >= 6 && types.length === 3

  return (
    <div className="space-y-3">
      <div className="border border-[#ffb4ac]/15 bg-[#1a1a1a] p-3">
        <p className="font-label text-[10px] text-gray-400 uppercase tracking-widest mb-1">Army Drill</p>
        <p className="font-body text-sm text-gray-300">Recruit each army type once. Commands: <code className="text-[#ffb4ac]">mercenary</code>, <code className="text-[#ffb4ac]">core</code>, <code className="text-[#ffb4ac]">family</code>.</p>
        <p className="font-label text-[10px] text-[#ffb4ac] mt-2">Units raised: {units} / 6</p>
      </div>
      {log.length > 0 && (
        <div className="border border-[#ffb4ac]/10 bg-[#161616] p-3 space-y-1 max-h-36 overflow-y-auto">
          {log.map((l, i) => <p key={i} className={`font-label text-[10px] ${l.startsWith('✔') ? 'text-emerald-400' : 'text-gray-500'}`}>{l}</p>)}
        </div>
      )}
      {!ready ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Recruit type..."
            className="flex-1 bg-[#1a1a1a] border border-[#ffb4ac]/20 px-3 py-2 font-label text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#ffb4ac]/50"
          />
          <button type="submit" className="px-4 py-2 bg-[#89070e] font-label text-[10px] uppercase tracking-widest text-white hover:bg-[#89070e]/80 transition-all">
            Recruit
          </button>
        </form>
      ) : (
        <ContinueButton onClick={() => onComplete(units, types)} label="Secure the Armies" />
      )}
      {error && <p className="font-label text-[10px] text-red-400">{error}</p>}
    </div>
  )
}

function RelationshipTask({ onComplete }: { onComplete: (bonus: number, moves: string[]) => void }) {
  const [input, setInput] = useState('')
  const [moves, setMoves] = useState<string[]>([])
  const [bonus, setBonus] = useState(0)
  const [error, setError] = useState('')
  const [log, setLog] = useState<string[]>([])

  async function perform(action: 'coffee' | 'dinner' | 'favor') {
    const lines = {
      coffee: ['Meeting Ricci over espresso... [0%]', 'Trading insights... [100%]', '✔ Trust improved.'],
      dinner: ['Hosting a Palermo dinner... [0%]', 'Public show of unity... [100%]', '✔ Familiarity increased.'],
      favor: ['Handling a private request... [0%]', 'Debt of honor secured... [100%]', '✔ Loyalty reinforced.'],
    }
    for (const step of lines[action]) {
      await new Promise<void>((r) => setTimeout(r, 700))
      setLog((l) => [...l, step])
    }
    if (!moves.includes(action)) {
      setMoves((m) => [...m, action])
      setBonus((b) => b + 2)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const val = input.trim().toLowerCase()
    setError('')
    if (val !== 'coffee' && val !== 'dinner' && val !== 'favor') {
      setError("Use 'coffee', 'dinner', or 'favor'.")
      return
    }
    setInput('')
    await perform(val)
  }

  const done = moves.length === 3

  return (
    <div className="space-y-3">
      <div className="border border-[#ffb4ac]/15 bg-[#1a1a1a] p-3">
        <p className="font-body text-sm text-gray-300">Build trust with Ricci using all three actions: <code className="text-[#ffb4ac]">coffee</code>, <code className="text-[#ffb4ac]">dinner</code>, <code className="text-[#ffb4ac]">favor</code>.</p>
        <p className="font-label text-[10px] text-[#ffb4ac] mt-2">Relationship bonus: +{bonus}</p>
      </div>
      {log.length > 0 && (
        <div className="border border-[#ffb4ac]/10 bg-[#161616] p-3 space-y-1 max-h-32 overflow-y-auto">
          {log.map((l, i) => <p key={i} className={`font-label text-[10px] ${l.startsWith('✔') ? 'text-emerald-400' : 'text-gray-500'}`}>{l}</p>)}
        </div>
      )}
      {!done ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Action..."
            className="flex-1 bg-[#1a1a1a] border border-[#ffb4ac]/20 px-3 py-2 font-label text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#ffb4ac]/50"
          />
          <button type="submit" className="px-4 py-2 bg-[#89070e] font-label text-[10px] uppercase tracking-widest text-white hover:bg-[#89070e]/80 transition-all">
            Commit
          </button>
        </form>
      ) : (
        <ContinueButton onClick={() => onComplete(bonus, moves)} label="Lock In Alliances" />
      )}
      {error && <p className="font-label text-[10px] text-red-400">{error}</p>}
    </div>
  )
}

function MapTask({ onComplete }: { onComplete: (regions: string[]) => void }) {
  const [selected, setSelected] = useState<string[]>([])
  const regions = ['Sicily', 'Naples', 'Calabria', 'Apulia', 'Lombardy']
  const done = selected.length >= 3

  return (
    <div className="space-y-3">
      <div className="border border-[#ffb4ac]/10 bg-[#1a1a1a] p-3">
        <p className="font-body text-sm text-gray-300">Choose at least 3 regions to establish influence routes.</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {regions.map((r) => (
          <ChoiceButton
            key={r}
            label={`${selected.includes(r) ? '✔' : '•'} ${r}`}
            onClick={() => {
              setSelected((prev) => prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r])
            }}
            variant={selected.includes(r) ? 'success' : 'default'}
          />
        ))}
      </div>
      <p className="font-label text-[10px] text-gray-500">Controlled: {selected.join(', ') || 'None'}</p>
      {done && <ContinueButton onClick={() => onComplete(selected)} label="Confirm Routes" />}
    </div>
  )
}

function WarTask({ onComplete }: { onComplete: (wins: string[]) => void }) {
  const [wins, setWins] = useState<string[]>([])
  const [error, setError] = useState('')
  const battlefields = ['Harbor', 'Hilltop', 'City Gate']
  const done = wins.length === battlefields.length

  function winBattle(field: string) {
    if (wins.includes(field)) {
      setError('Battle already won. Choose another front.')
      return
    }
    setError('')
    setWins((w) => [...w, field])
  }

  return (
    <div className="space-y-3">
      <div className="border border-red-500/20 bg-red-900/5 p-3">
        <p className="font-body text-sm text-gray-300">Conquest drill: win all three fronts to secure the region.</p>
      </div>
      <div className="space-y-2">
        {battlefields.map((f) => (
          <ChoiceButton
            key={f}
            label={`${wins.includes(f) ? '✔' : '⚔'} ${f}`}
            onClick={() => winBattle(f)}
            variant={wins.includes(f) ? 'success' : 'danger'}
          />
        ))}
      </div>
      {error && <p className="font-label text-[10px] text-red-400">{error}</p>}
      {done && <ContinueButton onClick={() => onComplete(wins)} label="Claim Conquest" />}
    </div>
  )
}

function BusinessTask({ onComplete }: { onComplete: (addedWealth: number, businesses: string[]) => void }) {
  const [wealthGain, setWealthGain] = useState(0)
  const [picked, setPicked] = useState<string[]>([])
  const entries = [
    { id: 'rob', label: "Rob a Bank [type 'rob']", gain: 10 },
    { id: 'heist', label: "Plan a Louvre Heist [type 'heist']", gain: 20 },
    { id: 'vehicle', label: "Stop a Bank Armored Vehicle [type 'vehicle']", gain: 10 },
    { id: 'casino_royale', label: "Start a Casino [type 'casino royale']", gain: 40 },
    { id: 'lux_the_club', label: "Start a Brothel [type 'lux the club']", gain: 30 },
    { id: 'al_capone', label: "Start a Racketeering Front [type 'al capone']", gain: 25 },
    { id: 'palantir', label: "Insider Trading [type 'stop that palantir']", gain: 60 },
  ]

  function choose(id: string, gain: number) {
    if (picked.includes(id)) return
    setPicked((p) => [...p, id])
    setWealthGain((w) => w + gain)
  }

  const done = wealthGain >= 60

  return (
    <div className="space-y-3">
      <div className="border border-[#ffb4ac]/10 bg-[#1a1a1a] p-3">
        <p className="font-body text-sm text-gray-300">RICCI: Build wealth through long-term ventures and high-risk operations until you gain at least +60 wealth.</p>
        <p className="font-label text-[10px] text-[#ffb4ac] mt-2">Wealth gain: +{wealthGain}</p>
      </div>
      <div className="space-y-2">
        {entries.map((e) => (
          <ChoiceButton
            key={e.id}
            label={`${picked.includes(e.id) ? '✔' : '+'} ${e.label} [+${e.gain} wealth]`}
            onClick={() => choose(e.id, e.gain)}
            variant={picked.includes(e.id) ? 'success' : 'default'}
          />
        ))}
      </div>
      {done && <ContinueButton onClick={() => onComplete(wealthGain, picked)} label="Bank the Profits" />}
    </div>
  )
}

function BossTask({ onComplete }: { onComplete: (result: 'won' | 'lost') => void }) {
  const [choice, setChoice] = useState<'power' | 'wealth' | 'allies' | null>(null)

  return (
    <div className="space-y-3">
      <div className="border border-[#ffb4ac]/15 bg-[#1a1a1a] p-3">
        <p className="font-body text-sm text-gray-300">The boss tests your doctrine. Choose your opening move.</p>
      </div>
      <ChoiceButton label="Use raw power to intimidate the boss." variant="danger" onClick={() => setChoice('power')} />
      <ChoiceButton label="Use wealth to buy his network overnight." onClick={() => setChoice('wealth')} />
      <ChoiceButton label="Use alliances and loyalty to isolate him." variant="success" onClick={() => setChoice('allies')} />
      {choice && (
        <div className="border border-[#ffb4ac]/10 bg-[#161616] p-3 space-y-2">
          <p className="font-body text-sm text-gray-300">
            {choice === 'allies'
              ? 'Your coalition fractures the boss from within. He kneels before the family council.'
              : 'The move lands hard, but sparks backlash. You survive, yet the boss remains standing.'}
          </p>
          <ContinueButton onClick={() => onComplete(choice === 'allies' ? 'won' : 'lost')} label="Resolve the Trial" />
        </div>
      )}
    </div>
  )
}

// ─── Chapter header ───────────────────────────────────────────────────────────

function ChapterHeader({ number, title }: { number: number; title: string }) {
  return (
    <div className="border-b border-[#ffb4ac]/10 pb-4 mb-6">
      <p className="font-label text-[9px] uppercase tracking-[0.2em] text-[#89070e] mb-1">Chapter {number}</p>
      <h2 className="font-headline text-xl text-[#ffb4ac]">{title}</h2>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TutorialScreen() {
  const player = useGameStore((s) => s.player)
  const navigate = useNavigate()
  const name = player?.name ?? 'Signore'
  const family = player?.familyName ?? 'your family'

  const [state, setState] = useState<TutorialState>({
    phase: 'chapter0',
    power: 10,
    wealth: 30,
    army: 0,
    familiarity: { 'Francesco Ricci': 0 },
    loyalty: { 'Francesco Ricci': 50 },
    characters: ['Francesco Ricci'],
    objectiveTotal: 0,
    completedObjectives: [],
    mayorTries: 0,
    ricciFamiliarityBonus: 0,
    recruitedTypes: [],
    relationshipMoves: [],
    regionsControlled: [],
    warBattlesWon: [],
    businessesStarted: [],
    starterPackage: null,
    bossOutcome: 'pending',
  })

  const [mayorChoice, setMayorChoice] = useState<1 | 2 | null>(null)

  const next = useCallback((phase: Phase, patch?: Partial<TutorialState>) => {
    setState((s) => ({ ...s, phase, ...patch }))
  }, [])

  // Chapter progress bar value
  const CHAPTER_ORDER: Phase[] = [
    'chapter0',
    'chapter1_news', 'chapter1_ricci_reply', 'chapter1_stats_intro', 'chapter1_stat_panel', 'chapter1_army', 'chapter1_end',
    'chapter2_intro', 'chapter2_objectives', 'chapter2_spy', 'chapter2_ricci_choice', 'chapter2_vineyard', 'chapter2_end',
    'chapter3_intro', 'chapter3_mayor1', 'chapter3_kidnap', 'chapter3_mayor2', 'chapter3_end',
    'chapter4_intro', 'chapter4_drill', 'chapter4_end',
    'chapter5_intro', 'chapter5_trust', 'chapter5_end',
    'chapter6_intro', 'chapter6_map', 'chapter6_end',
    'chapter7_intro', 'chapter7_war', 'chapter7_end',
    'chapter8_intro', 'chapter8_business', 'chapter8_end',
    'chapter9_intro', 'chapter9_boosts', 'chapter9_end',
    'chapter10_intro', 'chapter10_boss', 'chapter10_end',
    'done',
  ]
  const progressPct = ((CHAPTER_ORDER.indexOf(state.phase)) / (CHAPTER_ORDER.length - 1)) * 100

  return (
    <div className="max-w-3xl space-y-6">
      {/* Top bar */}
      <div className="border-b border-[#ffb4ac]/10 pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-headline text-2xl text-[#ffb4ac] tracking-wide">Tutorial</h1>
          <p className="font-label text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">The Consigliere's Handbook</p>
        </div>
        <div className="w-48">
          <ProgressBar pct={progressPct} />
        </div>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-3 gap-3">
        <StatBar label="Power" value={state.power} />
        <StatBar label="Wealth" value={state.wealth} />
        <StatBar label="Army" value={state.army} max={20} />
      </div>

      {/* ─── CHAPTER 0 ─────────────────────────────────────────────────────── */}
      {state.phase === 'chapter0' && (
        <div className="space-y-5">
          <ChapterHeader number={0} title="Welcome, Consigliere" />
          <NarrativeBox lines={[
            `Welcome, ${name}. Here is what awaits you in the chapters ahead:`,
            '',
            '1. Intro to the game',
            '2. Story objectives',
            '3. Power and Wealth',
            '4. Armies',
            '5. Relationships',
            '6. Maps and Regions',
            '7. War and Conquest',
            '8. Business — All\'s Good.',
            '9. A head start to your game.',
            '10. Try to beat the boss.',
          ]} />
          <ContinueButton onClick={() => next('chapter1_news')} label="Begin Chapter 1" />
        </div>
      )}

      {/* ─── CHAPTER 1: NEWS ──────────────────────────────────────────────── */}
      {state.phase === 'chapter1_news' && (
        <div className="space-y-5">
          <ChapterHeader number={1} title="Intro to the Game" />
          <NarrativeBox lines={[
            `BREAKING NEWS: The long-time consigliere of the ${family} in Italy, Lorenzo Bianchi, has died in mysterious circumstances.`,
            'Multiple media outlets report he died of cancer.',
            `However, insider sources in the ${family} have hinted at assassination.`,
            `Bianchi will be succeeded by a young upstart — ${name} — who has risen quickly since joining in 2020.`,
          ]} />
          <ContinueButton onClick={() => next('chapter1_ricci_reply')} />
        </div>
      )}

      {/* ─── CHAPTER 1: RICCI REPLY ───────────────────────────────────────── */}
      {state.phase === 'chapter1_ricci_reply' && (
        <div className="space-y-5">
          <ChapterHeader number={1} title="Intro to the Game" />
          <NarrativeBox lines={[
            `RICCI: You should not listen to the paparazzi, my Sig. Ah — I forgot to introduce myself. Welcome, Sig ${name}. I am Francesco Ricci, your advisor.`,
            'GAME TIP: Your advisor will advise you in-game with tips and tricks. You can choose to listen or ignore them.',
            `RICCI: I am sure you had nothing to do with Sig Bianchi's death.`,
          ]} />
          <div className="space-y-2">
            <p className="font-label text-[10px] text-gray-400 uppercase tracking-widest">Your response:</p>
            <ChoiceButton
              label="1. You are right, Sig Ricci. I loved Sig Bianchi like a father."
              onClick={() => next('chapter1_stats_intro', { familiarity: { 'Francesco Ricci': state.familiarity['Francesco Ricci'] + 1 } })}
            />
            <ChoiceButton
              label="2. Thank you, Sig Ricci. I will not heed these comments."
              onClick={() => next('chapter1_stats_intro', { familiarity: { 'Francesco Ricci': state.familiarity['Francesco Ricci'] + 1 } })}
            />
          </div>
        </div>
      )}

      {/* ─── CHAPTER 1: STATS INTRO ───────────────────────────────────────── */}
      {state.phase === 'chapter1_stats_intro' && (
        <div className="space-y-5">
          <ChapterHeader number={1} title="Intro to the Game" />
          <NarrativeBox lines={[
            `RICCI: Let me introduce you to the game, Sig ${name}.`,
            '',
            `First, the people you know: ${state.characters.join(', ')}.`,
            '',
            'Familiarity — how close you are with someone. Higher familiarity means they are more likely to collaborate with you. Ranges from 0 (strangers) to 100 (inseparable).',
            '',
            'Loyalty — how loyal someone is to you. Negative loyalty means they may betray you. Ranges from -100 (traitor) to 100 (completely loyal).',
          ]} />
          <div className="border border-[#ffb4ac]/10 bg-[#1a1a1a] p-4 space-y-3">
            <p className="font-label text-[9px] uppercase tracking-widest text-gray-500">Current Relations</p>
            {state.characters.map((c) => (
              <div key={c} className="space-y-1">
                <div className="flex justify-between font-label text-[10px] text-gray-400">
                  <span>{c}</span>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <p className="font-label text-[9px] text-gray-600 mb-0.5">Familiarity {state.familiarity[c]}</p>
                    <div className="h-1 bg-[#2a2a2a] rounded-full overflow-hidden">
                      <div className="h-full bg-[#ffb4ac]" style={{ width: `${state.familiarity[c]}%` }} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-label text-[9px] text-gray-600 mb-0.5">Loyalty {state.loyalty[c]}</p>
                    <div className="h-1 bg-[#2a2a2a] rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${(state.loyalty[c] + 100) / 2}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <ContinueButton onClick={() => next('chapter1_stat_panel')} />
        </div>
      )}

      {/* ─── CHAPTER 1: STAT PANEL ────────────────────────────────────────── */}
      {state.phase === 'chapter1_stat_panel' && (
        <div className="space-y-5">
          <ChapterHeader number={1} title="Intro to the Game" />
          <NarrativeBox lines={[
            'Power is your influence in your region and family. The higher your power, the more ability you have to make people do as you want.',
            'Power can be increased by acquiring wealth or armies. Ranges from 1 (powerless) to 100 (supreme authority).',
            '',
            'Wealth is how much money you have. The richer you are, the more you can bribe officials and bankroll mercenary armies. Ranges from 1 (destitute) to 100 (enormously wealthy).',
          ]} />
          <div className="grid grid-cols-2 gap-4 border border-[#ffb4ac]/10 bg-[#1a1a1a] p-4">
            <StatBar label="Power" value={state.power} />
            <StatBar label="Wealth" value={state.wealth} />
          </div>
          <ContinueButton onClick={() => next('chapter1_army')} />
        </div>
      )}

      {/* ─── CHAPTER 1: ARMIES ────────────────────────────────────────────── */}
      {state.phase === 'chapter1_army' && (
        <div className="space-y-5">
          <ChapterHeader number={1} title="Intro to the Game" />
          <NarrativeBox lines={[
            'Armies can be used to enforce your will. Great mafia leaders often bankroll large mercenary armies.',
            '',
            'There are three types:',
            '• Mercenary — fight for money. Recruit them by paying up.',
            '• Core — fight for you out of loyalty. Built slowly over time.',
            '• Family — fight for the family. Requires leadership of the house.',
            '',
            'Each army unit counts as 1 strength. The more you have, the stronger you become — and armies increase your power significantly.',
          ]} />
          <div className="border border-[#ffb4ac]/10 bg-[#1a1a1a] p-4">
            <StatBar label="Army Units" value={state.army} max={20} />
          </div>
          <ContinueButton onClick={() => next('chapter1_end')} />
        </div>
      )}

      {/* ─── CHAPTER 1: END ───────────────────────────────────────────────── */}
      {state.phase === 'chapter1_end' && (
        <div className="space-y-5">
          <ChapterHeader number={1} title="Intro to the Game" />
          <NarrativeBox lines={[
            'RICCI: Well done!',
            'In this chapter, you learned the basics of the game: characters, familiarity, loyalty, power, wealth, and armies.',
            'Next, we will learn about story objectives.',
          ]} />
          <ContinueButton onClick={() => next('chapter2_intro')} label="Begin Chapter 2" />
        </div>
      )}

      {/* ─── CHAPTER 2: INTRO ─────────────────────────────────────────────── */}
      {state.phase === 'chapter2_intro' && (
        <div className="space-y-5">
          <ChapterHeader number={2} title="Story Objectives" />
          <NarrativeBox lines={[
            'Every story starts with a compelling problem, powerful enemies, and underlying objectives.',
            '',
            'RICCI: Objectives are like goals. In story mode, to win you must hit as many objectives as possible.',
            'RICCI: They can include things like [Assemble 10 armies] or [Be the head of family] or [Conquer 2 neighbouring regions].',
            'RICCI: Each objective has a weight. You win when your completed objectives total a target score — for example, 100 or 200.',
            'RICCI: Objectives are not permanent. If you later fall below the threshold, you must hit them again.',
          ]} />
          <ContinueButton onClick={() => next('chapter2_objectives')} label="Try the Objectives" />
        </div>
      )}

      {/* ─── CHAPTER 2: OBJECTIVES TASK ───────────────────────────────────── */}
      {state.phase === 'chapter2_objectives' && (
        <div className="space-y-5">
          <ChapterHeader number={2} title="Story Objectives" />
          <NarrativeBox lines={[
            'Complete the three objectives below to reach a total of 100 points.',
            'Type the command shown beside each objective, then press Execute.',
          ]} />
          <ObjectivesTask onComplete={() => next('chapter2_spy', { objectiveTotal: 100 })} />
        </div>
      )}

      {/* ─── CHAPTER 2: SPY TASK ──────────────────────────────────────────── */}
      {state.phase === 'chapter2_spy' && (
        <div className="space-y-5">
          <ChapterHeader number={2} title="Story Objectives" />
          <SpyTask onComplete={() => next('chapter2_ricci_choice', { power: state.power + 1 })} />
        </div>
      )}

      {/* ─── CHAPTER 2: RICCI CHOICE ──────────────────────────────────────── */}
      {state.phase === 'chapter2_ricci_choice' && (
        <div className="space-y-5">
          <ChapterHeader number={2} title="Story Objectives" />
          <NarrativeBox lines={[
            `RICCI: Hmmm… You now have your own spy network. That's wonderful, but you need a little something… More!`,
          ]} />
          <div className="space-y-2">
            <p className="font-label text-[10px] text-gray-400 uppercase tracking-widest">Your response:</p>
            <ChoiceButton
              label="1. A little something more? What do you mean, Sig Ricci?"
              onClick={() => next('chapter2_vineyard')}
            />
            <ChoiceButton
              label="2. That's enough, Sig Ricci. I'm tired."
              onClick={() => next('chapter2_vineyard')}
              variant="danger"
            />
          </div>
        </div>
      )}

      {/* ─── CHAPTER 2: VINEYARD TASK ─────────────────────────────────────── */}
      {state.phase === 'chapter2_vineyard' && (
        <div className="space-y-5">
          <ChapterHeader number={2} title="Story Objectives" />
          <VineyardTask onComplete={() => next('chapter2_end')} />
        </div>
      )}

      {/* ─── CHAPTER 2: END ───────────────────────────────────────────────── */}
      {state.phase === 'chapter2_end' && (
        <div className="space-y-5">
          <ChapterHeader number={2} title="Story Objectives" />
          <NarrativeBox lines={[
            `RICCI: That was incredible! You're the fastest learner I've seen!`,
            `RICCI: I'm sure you will lead the ${family} to new heights.`,
            'RICCI: Cheers to a new world!',
          ]} />
          <ContinueButton onClick={() => next('chapter3_intro')} label="Begin Chapter 3" />
        </div>
      )}

      {/* ─── CHAPTER 3: INTRO ─────────────────────────────────────────────── */}
      {state.phase === 'chapter3_intro' && (
        <div className="space-y-5">
          <ChapterHeader number={3} title="Power and Wealth" />
          <NarrativeBox lines={[
            'In this chapter, we learn all about power and wealth — the engines of influence.',
            '',
            'Power manifests itself in many ways. It may affect your options, your story, and your endings.',
            'But as you will see, power may bring some… negative outcomes.',
            '',
            'As Signor Ben used to say: with great power, comes great responsibility!',
          ]} />
          <ContinueButton onClick={() => next('chapter3_mayor1')} label="Meet the Mayor" />
        </div>
      )}

      {/* ─── CHAPTER 3: MAYOR ROUND 1 ─────────────────────────────────────── */}
      {state.phase === 'chapter3_mayor1' && (
        <div className="space-y-5">
          <ChapterHeader number={3} title="Power and Wealth" />
          <NarrativeBox lines={[
            'RICCI: Try convincing the mayor to renew your casino license!',
            '',
            `MAYOR: How can I help you, Sig ${name}?`,
          ]} />
          <div className="space-y-2">
            <p className="font-label text-[10px] text-gray-400 uppercase tracking-widest">Your approach:</p>
            <ChoiceButton
              label="1. Perhaps you can renew my Casino's license, Sig Mayor… [Ask nicely]"
              onClick={() => {
                setState((s) => ({ ...s, mayorTries: s.mayorTries + 1 }))
              }}
            />
            <ChoiceButton
              label="2. I demand you renew my license, Mayor. [Demand the license]"
              variant="danger"
              onClick={() => {
                setState((s) => ({ ...s, mayorTries: s.mayorTries + 1 }))
              }}
            />
          </div>
          {state.mayorTries > 0 && (
            <div className="space-y-4">
              <NarrativeBox lines={[
                `MAYOR: That would not be possible, Signor. Your casino must close or move — final answer!`,
                '',
                'RICCI: And… CUT!',
                "RICCI: The mayor has made a deal with another family. He doesn't respect you — your power is too low.",
                'RICCI: We need to take more drastic action.',
              ]} />
              <ContinueButton onClick={() => next('chapter3_kidnap')} label="Take Action" />
            </div>
          )}
        </div>
      )}

      {/* ─── CHAPTER 3: KIDNAP TASK ───────────────────────────────────────── */}
      {state.phase === 'chapter3_kidnap' && (
        <div className="space-y-5">
          <ChapterHeader number={3} title="Power and Wealth" />
          <NarrativeBox lines={[
            'RICCI: Let\'s make this mayor listen! We must demonstrate real power.',
          ]} />
          <KidnapTask onComplete={() => next('chapter3_mayor2', { power: 80 })} />
        </div>
      )}

      {/* ─── CHAPTER 3: MAYOR ROUND 2 ─────────────────────────────────────── */}
      {state.phase === 'chapter3_mayor2' && (
        <div className="space-y-5">
          <ChapterHeader number={3} title="Power and Wealth" />
          <NarrativeBox lines={[
            `MAYOR: Sig ${name}! I'm so sorry…`,
            'MAYOR: Please let my wife go. I\'ll do anything!',
          ]} />
          <div className="space-y-2">
            <p className="font-label text-[10px] text-gray-400 uppercase tracking-widest">Your response:</p>
            <ChoiceButton
              label="1. I like your new attitude, mayor. Renew my casino's license, and I'll let her go."
              variant="success"
              onClick={() => setMayorChoice(1)}
            />
            <ChoiceButton
              label="2. Hahahaha. I like to see you beg. Do what I told you, and she'll be unharmed."
              onClick={() => setMayorChoice(2)}
            />
            <ChoiceButton
              label="3. Too late, Sig Mayor! [Kill the hostage]"
              variant="danger"
              onClick={() => {
                setState((s) => ({ ...s }))
              }}
            />
          </div>
          {mayorChoice !== null && (
            <div className="space-y-4">
              <NarrativeBox lines={[
                mayorChoice === 1
                  ? `MAYOR: You are right, Sig ${name}. I shall do it right away.`
                  : `MAYOR: Please, Sig ${name}. I will do what you say!`,
                '',
                '✔ Your casino license has been renewed!',
                'Your reputation as a strong leader has spread across the region.',
                'RICCI: You have gained a new acquaintance — the Mayor.',
              ]} />
              <ContinueButton onClick={() => next('chapter3_end', { power: 80, characters: [...state.characters, 'The Mayor'], loyalty: { ...state.loyalty, 'The Mayor': 10 } })} label="Conclude Chapter 3" />
            </div>
          )}
          {mayorChoice === null && state.mayorTries > 1 && (
            <NarrativeBox lines={['RICCI: You cannot kill the hostage! She is your only leverage. Choose wisely!']} />
          )}
        </div>
      )}

      {/* ─── CHAPTER 3: END ───────────────────────────────────────────────── */}
      {state.phase === 'chapter3_end' && (
        <div className="space-y-5">
          <ChapterHeader number={3} title="Power and Wealth" />
          <NarrativeBox lines={[
            'RICCI: You\'re truly on your way to greatness!',
            '',
            'RICCI: Wealth is not only your personal money. Family wealth includes the combined strength of all members.',
            'RICCI: In real play, choices have costs and requirements. Some moves are blocked if your wealth, power, or family loyalty are too low.',
            'RICCI: You are usually limited to one choice per turn — be economical.',
            '',
            `RICCI: The ${family} stands stronger today because of your decisions. Continue building your empire — the real game begins now.`,
          ]} />
          <div className="border border-[#ffb4ac]/10 bg-[#1a1a1a] p-4 space-y-3">
            <p className="font-label text-[9px] uppercase tracking-widest text-gray-500 mb-2">Tutorial Complete — Final Stats</p>
            <StatBar label="Power" value={state.power} />
            <StatBar label="Wealth" value={state.wealth} />
            <StatBar label="Army" value={state.army} max={20} />
            <div className="pt-2 border-t border-[#ffb4ac]/10">
              <p className="font-label text-[9px] text-gray-500 uppercase tracking-widest mb-1">Characters Known</p>
              {state.characters.map((c) => (
                <p key={c} className="font-label text-[10px] text-gray-300">• {c}</p>
              ))}
            </div>
          </div>
          <ContinueButton onClick={() => next('chapter4_intro')} label="Begin Chapter 4" />
        </div>
      )}

      {/* ─── CHAPTER 4: ARMIES ──────────────────────────────────────────────── */}
      {state.phase === 'chapter4_intro' && (
        <div className="space-y-5">
          <ChapterHeader number={4} title="Armies" />
          <NarrativeBox lines={[
            'RICCI: Armies are not numbers — they are instruments of pressure.',
            'In the field, you command mercenary, core, and family forces for different purposes.',
            'A true consigliere mixes them, then points them with precision.',
          ]} />
          <ContinueButton onClick={() => next('chapter4_drill')} label="Run Army Drill" />
        </div>
      )}

      {state.phase === 'chapter4_drill' && (
        <div className="space-y-5">
          <ChapterHeader number={4} title="Armies" />
          <ArmyDrillTask onComplete={(units, types) => next('chapter4_end', { army: state.army + units, power: Math.min(100, state.power + 8), recruitedTypes: types })} />
        </div>
      )}

      {state.phase === 'chapter4_end' && (
        <div className="space-y-5">
          <ChapterHeader number={4} title="Armies" />
          <NarrativeBox lines={[
            'RICCI: Excellent. You now know how to raise force by doctrine, not panic.',
            `Army types fielded: ${state.recruitedTypes.join(', ') || 'none'}.`,
            'Next, we shape relationships — because every war is decided before swords are drawn.',
          ]} />
          <ContinueButton onClick={() => next('chapter5_intro')} label="Begin Chapter 5" />
        </div>
      )}

      {/* ─── CHAPTER 5: RELATIONSHIPS ───────────────────────────────────────── */}
      {state.phase === 'chapter5_intro' && (
        <div className="space-y-5">
          <ChapterHeader number={5} title="Relationships" />
          <NarrativeBox lines={[
            'RICCI: Influence is borrowed from people who trust you.',
            'Familiarity opens doors. Loyalty keeps knives out of your back.',
            'We will reinforce our bond step by step.',
          ]} />
          <ContinueButton onClick={() => next('chapter5_trust')} label="Build Trust" />
        </div>
      )}

      {state.phase === 'chapter5_trust' && (
        <div className="space-y-5">
          <ChapterHeader number={5} title="Relationships" />
          <RelationshipTask
            onComplete={(bonus, moves) => next('chapter5_end', {
              familiarity: { ...state.familiarity, 'Francesco Ricci': state.familiarity['Francesco Ricci'] + bonus },
              loyalty: { ...state.loyalty, 'Francesco Ricci': state.loyalty['Francesco Ricci'] + bonus },
              relationshipMoves: moves,
            })}
          />
        </div>
      )}

      {state.phase === 'chapter5_end' && (
        <div className="space-y-5">
          <ChapterHeader number={5} title="Relationships" />
          <NarrativeBox lines={[
            'RICCI: Good. You understand the language of trust.',
            `Moves used: ${state.relationshipMoves.join(', ') || 'none'}.`,
            'Next: regions and maps — where influence becomes territory.',
          ]} />
          <ContinueButton onClick={() => next('chapter6_intro')} label="Begin Chapter 6" />
        </div>
      )}

      {/* ─── CHAPTER 6: MAPS AND REGIONS ────────────────────────────────────── */}
      {state.phase === 'chapter6_intro' && (
        <div className="space-y-5">
          <ChapterHeader number={6} title="Maps and Regions" />
          <NarrativeBox lines={[
            'RICCI: Borders decide logistics, taxation, and the speed of violence.',
            'Choose your route network wisely — every region is a lever.',
          ]} />
          <ContinueButton onClick={() => next('chapter6_map')} label="Survey the Map" />
        </div>
      )}

      {state.phase === 'chapter6_map' && (
        <div className="space-y-5">
          <ChapterHeader number={6} title="Maps and Regions" />
          <MapTask onComplete={(regions) => next('chapter6_end', { regionsControlled: regions, power: Math.min(100, state.power + 4) })} />
        </div>
      )}

      {state.phase === 'chapter6_end' && (
        <div className="space-y-5">
          <ChapterHeader number={6} title="Maps and Regions" />
          <NarrativeBox lines={[
            `Controlled routes established: ${state.regionsControlled.join(', ') || 'none'}.`,
            'RICCI: Territory gives your name weight.',
            'Now we test that weight in open conflict.',
          ]} />
          <ContinueButton onClick={() => next('chapter7_intro')} label="Begin Chapter 7" />
        </div>
      )}

      {/* ─── CHAPTER 7: WAR AND CONQUEST ────────────────────────────────────── */}
      {state.phase === 'chapter7_intro' && (
        <div className="space-y-5">
          <ChapterHeader number={7} title="War and Conquest" />
          <NarrativeBox lines={[
            'RICCI: Conquest is administration after violence.',
            'Win the fronts, then hold them with fear and order.',
          ]} />
          <ContinueButton onClick={() => next('chapter7_war')} label="Open the Fronts" />
        </div>
      )}

      {state.phase === 'chapter7_war' && (
        <div className="space-y-5">
          <ChapterHeader number={7} title="War and Conquest" />
          <WarTask onComplete={(wins) => next('chapter7_end', { warBattlesWon: wins, power: Math.min(100, state.power + 6) })} />
        </div>
      )}

      {state.phase === 'chapter7_end' && (
        <div className="space-y-5">
          <ChapterHeader number={7} title="War and Conquest" />
          <NarrativeBox lines={[
            `Fronts secured: ${state.warBattlesWon.join(', ') || 'none'}.`,
            'RICCI: You do not merely command — you conquer.',
            'Next, we stabilize with business.',
          ]} />
          <ContinueButton onClick={() => next('chapter8_intro')} label="Begin Chapter 8" />
        </div>
      )}

      {/* ─── CHAPTER 8: BUSINESS — ALL'S GOOD. ─────────────────────────────── */}
      {state.phase === 'chapter8_intro' && (
        <div className="space-y-5">
          <ChapterHeader number={8} title="Business — All's Good." />
          <NarrativeBox lines={[
            'RICCI: Business is the bloodstream of power.',
            'Violence takes cities. Cash keeps them.',
            'RICCI: The strongest empires rely on long-term cashflow — casinos, brothels, and racketeering fronts.',
          ]} />
          <ContinueButton onClick={() => next('chapter8_business')} label="Start Ventures" />
        </div>
      )}

      {state.phase === 'chapter8_business' && (
        <div className="space-y-5">
          <ChapterHeader number={8} title="Business — All's Good." />
          <BusinessTask onComplete={(addedWealth, businesses) => next('chapter8_end', { wealth: Math.min(100, state.wealth + addedWealth), businessesStarted: businesses })} />
        </div>
      )}

      {state.phase === 'chapter8_end' && (
        <div className="space-y-5">
          <ChapterHeader number={8} title="Business — All's Good." />
          <NarrativeBox lines={[
            `Ventures launched: ${state.businessesStarted.join(', ') || 'none'}.`,
            'RICCI: Good money, strategic money — that is how empires survive.',
            'Now I will give you a head start.',
          ]} />
          <ContinueButton onClick={() => next('chapter9_intro')} label="Begin Chapter 9" />
        </div>
      )}

      {/* ─── CHAPTER 9: A HEAD START TO YOUR GAME ───────────────────────────── */}
      {state.phase === 'chapter9_intro' && (
        <div className="space-y-5">
          <ChapterHeader number={9} title="A head start to your game." />
          <NarrativeBox lines={[
            'RICCI: Before true play, choose your starter edge.',
            'Pick one package — momentum matters.',
          ]} />
          <ContinueButton onClick={() => next('chapter9_boosts')} label="Choose Head Start" />
        </div>
      )}

      {state.phase === 'chapter9_boosts' && (
        <div className="space-y-5">
          <ChapterHeader number={9} title="A head start to your game." />
          <div className="space-y-2">
            <ChoiceButton
              label="Starter A: War Chest (+20 Wealth)"
              onClick={() => next('chapter9_end', { wealth: Math.min(100, state.wealth + 20), starterPackage: 'War Chest' })}
            />
            <ChoiceButton
              label="Starter B: Veteran Captains (+4 Army)"
              onClick={() => next('chapter9_end', { army: state.army + 4, starterPackage: 'Veteran Captains' })}
            />
            <ChoiceButton
              label="Starter C: Political Cover (+8 Loyalty with Ricci)"
              variant="success"
              onClick={() => next('chapter9_end', { loyalty: { ...state.loyalty, 'Francesco Ricci': state.loyalty['Francesco Ricci'] + 8 }, starterPackage: 'Political Cover' })}
            />
          </div>
        </div>
      )}

      {state.phase === 'chapter9_end' && (
        <div className="space-y-5">
          <ChapterHeader number={9} title="A head start to your game." />
          <NarrativeBox lines={[
            `Starter selected: ${state.starterPackage ?? 'None'}.`,
            'RICCI: Good. You enter the board with an edge.',
            'Last lesson: try to beat the boss.',
          ]} />
          <ContinueButton onClick={() => next('chapter10_intro')} label="Begin Chapter 10" />
        </div>
      )}

      {/* ─── CHAPTER 10: TRY TO BEAT THE BOSS ───────────────────────────────── */}
      {state.phase === 'chapter10_intro' && (
        <div className="space-y-5">
          <ChapterHeader number={10} title="Try to beat the boss." />
          <NarrativeBox lines={[
            'RICCI: This is your final trial.',
            'One decision. One outcome. Show me what kind of consigliere you are.',
          ]} />
          <ContinueButton onClick={() => next('chapter10_boss')} label="Face the Boss" />
        </div>
      )}

      {state.phase === 'chapter10_boss' && (
        <div className="space-y-5">
          <ChapterHeader number={10} title="Try to beat the boss." />
          <BossTask onComplete={(result) => next('chapter10_end', { bossOutcome: result })} />
        </div>
      )}

      {state.phase === 'chapter10_end' && (
        <div className="space-y-5">
          <ChapterHeader number={10} title="Try to beat the boss." />
          <NarrativeBox lines={[
            state.bossOutcome === 'won'
              ? 'RICCI: Magnificent. You beat the boss through alliances, timing, and discipline.'
              : 'RICCI: You held your ground, but the boss remains. Learn, adapt, return stronger.',
            'Tutorial run complete. The table is set for your real campaign.',
          ]} />
          <ContinueButton onClick={() => next('done')} label="Complete Tutorial" />
        </div>
      )}

      {/* ─── DONE ─────────────────────────────────────────────────────────── */}
      {state.phase === 'done' && (
        <div className="space-y-6 text-center py-8">
          <span className="material-symbols-outlined text-6xl text-[#ffb4ac]">military_tech</span>
          <div>
            <h2 className="font-headline text-3xl text-[#ffb4ac]">Tutorial Complete</h2>
            <p className="font-label text-xs text-gray-400 uppercase tracking-widest mt-2">You are ready to lead, Consigliere — Chapters 0 to 10 complete.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
            <button
              onClick={() => navigate('/command')}
              className="py-3 bg-[#89070e] text-white font-label text-[10px] uppercase tracking-widest hover:bg-[#89070e]/80 transition-all"
            >
              Command Center
            </button>
            <button
              onClick={() => setState((s) => ({
                ...s,
                phase: 'chapter0',
                power: 10,
                wealth: 30,
                army: 0,
                familiarity: { 'Francesco Ricci': 0 },
                loyalty: { 'Francesco Ricci': 50 },
                characters: ['Francesco Ricci'],
                objectiveTotal: 0,
                completedObjectives: [],
                mayorTries: 0,
                ricciFamiliarityBonus: 0,
                recruitedTypes: [],
                relationshipMoves: [],
                regionsControlled: [],
                warBattlesWon: [],
                businessesStarted: [],
                starterPackage: null,
                bossOutcome: 'pending',
              }))}
              className="py-3 border border-[#ffb4ac]/20 text-[#ffb4ac] font-label text-[10px] uppercase tracking-widest hover:bg-[#ffb4ac]/5 transition-all"
            >
              Replay
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
