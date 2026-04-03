// TutorialScreen.tsx
// Interactive tutorial — mirrors the Python game's Chapters 0–3.
// Each chapter presents narrative text, choices, and mini-tasks.

import { useState, useEffect, useRef, useCallback } from 'react'
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

  const completed = Object.values(statusMap).filter((s) => s === 'done').length

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
                // Can't kill hostage — Ricci intervenes
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
            `RICCI: Remember, Sig ${name} — power is earned, not given. Wealth opens doors, but loyalty keeps them open.`,
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
          <ContinueButton onClick={() => next('done')} label="Complete Tutorial" />
        </div>
      )}

      {/* ─── DONE ─────────────────────────────────────────────────────────── */}
      {state.phase === 'done' && (
        <div className="space-y-6 text-center py-8">
          <span className="material-symbols-outlined text-6xl text-[#ffb4ac]">military_tech</span>
          <div>
            <h2 className="font-headline text-3xl text-[#ffb4ac]">Tutorial Complete</h2>
            <p className="font-label text-xs text-gray-400 uppercase tracking-widest mt-2">You are ready to lead, Consigliere.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
            <button
              onClick={() => navigate('/command')}
              className="py-3 bg-[#89070e] text-white font-label text-[10px] uppercase tracking-widest hover:bg-[#89070e]/80 transition-all"
            >
              Command Center
            </button>
            <button
              onClick={() => setState((s) => ({ ...s, phase: 'chapter0', power: 10, wealth: 30, army: 0, familiarity: { 'Francesco Ricci': 0 }, loyalty: { 'Francesco Ricci': 50 }, characters: ['Francesco Ricci'], objectiveTotal: 0, completedObjectives: [], mayorTries: 0 }))}
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
