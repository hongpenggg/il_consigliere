import { create } from 'zustand'
import type {
  PlayerStats,
  StoryEvent,
  FamilyMember,
  Territory,
  LedgerEntry,
  IntelReport,
  GameSave,
  StoryWorldState,
  DialogueToneTag,
  NpcToneMemoryEntry,
  NewspaperIssue,
  PersonalEvent,
  CommissionFactions
} from '@/types'

interface GameStore {
  // Player
  player: PlayerStats | null
  setPlayer: (player: PlayerStats) => void
  updateStats: (delta: Partial<PlayerStats>) => void

  // Narrative
  currentEvent: StoryEvent | null
  narrativeHistory: StoryEvent[]
  setCurrentEvent: (event: StoryEvent) => void
  addToHistory: (event: StoryEvent) => void
  isGenerating: boolean
  setIsGenerating: (val: boolean) => void

  // Family
  familyMembers: FamilyMember[]
  setFamilyMembers: (members: FamilyMember[]) => void
  updateMemberLoyalty: (id: string, delta: number) => void
  logToneDecision: (memberId: string, tone: DialogueToneTag) => void

  // Territories
  territories: Territory[]
  setTerritories: (territories: Territory[]) => void
  selectedTerritory: Territory | null
  setSelectedTerritory: (territory: Territory | null) => void
  markTerritoryInteraction: (territoryId: string) => void
  evaluateNeglectedTerritories: () => void
  activeRegion: 'italy' | 'usa'
  setActiveRegion: (region: 'italy' | 'usa') => void
  regionTransitionTitle: string | null
  setRegionTransitionTitle: (title: string | null) => void

  // Ledger
  ledgerEntries: LedgerEntry[]
  addLedgerEntry: (entry: LedgerEntry) => void
  setLedgerEntries: (entries: LedgerEntry[]) => void
  newspaperIssues: NewspaperIssue[]
  addNewspaperIssue: (headline: string, subheadline: string) => void

  // Intel
  intelReports: IntelReport[]
  addIntelReport: (report: IntelReport) => void
  setIntelReports: (reports: IntelReport[]) => void
  personalEvents: PersonalEvent[]
  triggerPersonalEvent: () => void
  resolvePersonalEvent: (id: string) => void

  // Saves
  saves: GameSave[]
  setSaves: (saves: GameSave[]) => void

  // UI
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  notificationsOpen: boolean
  setNotificationsOpen: (open: boolean) => void

  // Auth
  userId: string | null
  setUserId: (id: string | null) => void

  // Instance restore state — true once we've checked Supabase on login
  instanceChecked: boolean
  setInstanceChecked: (val: boolean) => void

  // Tutorial + Story mode progression
  tutorialCompleted: boolean
  tutorialPhase: string
  setTutorialCompleted: (val: boolean) => void
  setTutorialPhase: (phase: string) => void
  storyModeStarted: boolean
  storyChapter: number
  storyStep: number
  storyPath: string[]
  storyEnding: string | null
  storyWorld: StoryWorldState
  hiddenStoryFlags: string[]
  npcToneMemory: Record<string, NpcToneMemoryEntry>
  commissionFactions: CommissionFactions
  startStoryMode: () => void
  advanceStory: (choiceId: string, nextChapter: number, ending?: string | null) => void
  resetStoryMode: () => void
  setStoryWorld: (world: StoryWorldState) => void
  applyPhilosophyShiftFromTone: (tone: DialogueToneTag) => void
  advanceWeek: (cause: string) => void
  runCommissionVote: (proposal: string) => boolean
  hydrateProgress: (snapshot: Partial<Pick<GameStore, 'tutorialCompleted' | 'tutorialPhase' | 'storyModeStarted' | 'storyChapter' | 'storyStep' | 'storyPath' | 'storyEnding' | 'storyWorld'>>) => void

  // Reset
  resetGame: () => void
}

const DEFAULT_TERRITORIES: Territory[] = [
  { id: 't1', name: 'Sicily',    region: 'italy', influence: 88, controller: 'Genovese',      weeklyIncome: 45200, resistanceLevel: 2, description: 'The heart of the empire. Operational stability remains high despite recent probes from the northern syndicates.', lat: 37.5, lng: 14.0,  positionX: 62, positionY: 75, lastInteractedWeek: 1 },
  { id: 't2', name: 'Naples',    region: 'italy', influence: 45, controller: 'Contested',      weeklyIncome: 28000, resistanceLevel: 3, description: 'Contested ground between two rising powers. The docks remain a flashpoint.',                                          lat: 40.8, lng: 14.3,  positionX: 52, positionY: 55, lastInteractedWeek: 1 },
  { id: 't3', name: 'Lombardy',  region: 'italy', influence: 12, controller: 'Moretti Clan',   weeklyIncome: 12000, resistanceLevel: 5, description: 'Hostile territory under Moretti control. Infiltration attempts have failed twice.',                                   lat: 45.5, lng: 9.2,   positionX: 25, positionY: 18, lastInteractedWeek: 1 },
  { id: 't4', name: 'Rome',      region: 'italy', influence: 60, controller: 'Player',         weeklyIncome: 38000, resistanceLevel: 2, description: 'The political center. Police connections here are vital for operations.',                                             lat: 41.9, lng: 12.5,  positionX: 48, positionY: 42, lastInteractedWeek: 1 },
  { id: 't5', name: 'Manhattan', region: 'usa',   influence: 75, controller: 'Player',         weeklyIncome: 85000, resistanceLevel: 3, description: 'The crown jewel of American operations. Five families watch every move.',                                              lat: 40.7, lng: -74.0, positionX: 55, positionY: 40, lastInteractedWeek: 1 },
  { id: 't6', name: 'Brooklyn',  region: 'usa',   influence: 55, controller: 'Contested',      weeklyIncome: 42000, resistanceLevel: 3, description: 'Working-class neighborhoods with deep union ties. The waterfront is key.',                                             lat: 40.6, lng: -74.0, positionX: 52, positionY: 50, lastInteractedWeek: 1 },
  { id: 't7', name: 'Chicago',   region: 'usa',   influence: 30, controller: 'Capone Network', weeklyIncome: 65000, resistanceLevel: 4, description: 'Capone remnants still control the meat-packing districts. Approach with caution.',                                    lat: 41.8, lng: -87.6, positionX: 30, positionY: 38, lastInteractedWeek: 1 }
]

const DEFAULT_FAMILY: FamilyMember[] = [
  { id: 'f1', name: 'Vincenzo Ricci',  role: 'Informant / Capo',     loyalty: 85, familiarity: 25, ideology: 'loyalist', respect: 62, status: 'active' },
  { id: 'f2', name: 'Mayor Moretti',   role: 'Political Puppet',      loyalty: 42, familiarity: 60, ideology: 'opportunist', respect: 44, status: 'active' },
  { id: 'f3', name: 'Carlo Esposito',  role: 'Enforcer',              loyalty: 91, familiarity: 80, ideology: 'ruthless', respect: 88, status: 'active' },
  { id: 'f4', name: 'Sofia Ricci',     role: 'Intelligence Officer',  loyalty: 78, familiarity: 55, ideology: 'reformist', respect: 71, status: 'active' }
]

const DEFAULT_STORY_WORLD: StoryWorldState = {
  world: 'Italy',
  city: 'Sicily',
  year: 1947,
  season: 'Fall',
  week: 1,
  factions: {
    familyLoyalty: 68,
    donTrust: 62,
    rivalTension: 55,
    rivalRespect: 40,
    commissionStanding: 48,
    cityHallInfluence: 37,
    cityHallExposure: 34,
    lawHeat: 46,
    notoriety: 44,
    streetFear: 52,
    streetGoodwill: 33,
  },
  resources: {
    cash: 1200000,
    racketsActive: 5,
    racketsCompromised: 1,
    soldiersAvailable: 12,
    soldiersUnavailable: 2,
    favorsOwed: ['Dock foreman in Red Hook'],
    favorsHeld: ['Ledger on Ward Boss Deluca'],
  },
  philosophy: {
    oldCodeVsNewBlood: 0,
    violenceVsPolitics: 0,
    familyFirstVsEmpireFirst: 0,
    honorVsPragmatism: 0,
  },
}

const DEFAULT_COMMISSION: CommissionFactions = {
  oldFamilies: 48,
  expansionists: 52,
  politicians: 45
}

const DEFAULT_NPC_TONE_MEMORY: Record<string, NpcToneMemoryEntry> = {
  f1: { intimidate: 0, negotiate: 0, defer: 0, bribe: 0 },
  f2: { intimidate: 0, negotiate: 0, defer: 0, bribe: 0 },
  f3: { intimidate: 0, negotiate: 0, defer: 0, bribe: 0 },
  f4: { intimidate: 0, negotiate: 0, defer: 0, bribe: 0 },
}

const SEASONS: Array<StoryWorldState['season']> = ['Spring', 'Summer', 'Fall', 'Winter']
const WEEKS_PER_YEAR = 52
const WEEKS_PER_SEASON = 13
const TERRITORY_NEGLECT_THRESHOLD = 2

function normalizePhilosophy(value: number): number {
  return Math.round((value + 5) * 10)
}

function formatWeeklyHeadline(cause: string, week: number): string {
  const normalized = cause.toLowerCase()
  if (normalized.includes('operation in')) {
    const target = cause.replace(/operation in/i, '').trim()
    return `IL CORRIERE — WEEK ${week}: ${target.toUpperCase()} FRONT ESCALATES`
  }
  if (normalized.includes('dialogue')) {
    return `IL CORRIERE — WEEK ${week}: COUNCIL CHAMBER SHIFT`
  }
  return `IL CORRIERE — WEEK ${week}: CITY UNDER PRESSURE`
}

export const useGameStore = create<GameStore>((set, get) => ({
  player: null,
  setPlayer: (player) => set({ player }),
  updateStats: (delta) => set((state) => ({
    player: state.player ? { ...state.player, ...delta } : null
  })),

  currentEvent: null,
  narrativeHistory: [],
  setCurrentEvent: (event) => set({ currentEvent: event }),
  addToHistory:    (event) => set((state) => ({ narrativeHistory: [...state.narrativeHistory, event] })),
  isGenerating: false,
  setIsGenerating: (val) => set({ isGenerating: val }),

  familyMembers: DEFAULT_FAMILY,
  setFamilyMembers: (members) => set({ familyMembers: members }),
  updateMemberLoyalty: (id, delta) => set((state) => ({
    familyMembers: state.familyMembers.map(m =>
      m.id === id ? { ...m, loyalty: Math.max(0, Math.min(100, m.loyalty + delta)) } : m
    )
  })),
  logToneDecision: (memberId, tone) => set((state) => {
    const current = state.npcToneMemory[memberId] ?? { intimidate: 0, negotiate: 0, defer: 0, bribe: 0 }
    const key = tone.toLowerCase() as keyof NpcToneMemoryEntry
    return {
      npcToneMemory: {
        ...state.npcToneMemory,
        [memberId]: { ...current, [key]: current[key] + 1 }
      }
    }
  }),

  territories: DEFAULT_TERRITORIES,
  setTerritories: (territories) => set({ territories }),
  selectedTerritory: DEFAULT_TERRITORIES[0],
  setSelectedTerritory: (territory) => set({ selectedTerritory: territory }),
  markTerritoryInteraction: (territoryId) => set((state) => ({
    territories: state.territories.map((territory) =>
      territory.id === territoryId ? { ...territory, lastInteractedWeek: state.storyWorld.week } : territory
    )
  })),
  evaluateNeglectedTerritories: () => set((state) => ({
    territories: state.territories.map((territory) => {
      const ignoredWeeks = state.storyWorld.week - (territory.lastInteractedWeek ?? 1)
      if (ignoredWeeks >= TERRITORY_NEGLECT_THRESHOLD && territory.controller === 'Player') {
        return { ...territory, controller: 'Contested' }
      }
      return territory
    })
  })),
  activeRegion: 'italy',
  setActiveRegion: (region) => set({ activeRegion: region }),
  regionTransitionTitle: null,
  setRegionTransitionTitle: (title) => set({ regionTransitionTitle: title }),

  ledgerEntries: [
    { id: 'l1', description: 'Port Lockdown',           amount:       0, type: 'expense',  timestamp: new Date().toISOString(), territory: 'Sicily' },
    { id: 'l2', description: 'Union Bribe',             amount:  -50000, type: 'bribe',    timestamp: new Date().toISOString() },
    { id: 'l3', description: 'Bianchi Exit',            amount:       0, type: 'income',   timestamp: new Date().toISOString() },
    { id: 'l4', description: 'Weekly Tribute – Sicily', amount:   45200, type: 'tribute',  timestamp: new Date().toISOString(), territory: 'Sicily' },
    { id: 'l5', description: 'Police Payoff – Naples',  amount:  -12000, type: 'bribe',    timestamp: new Date().toISOString(), territory: 'Naples' }
  ],
  addLedgerEntry:  (entry)   => set((state) => ({ ledgerEntries: [entry, ...state.ledgerEntries] })),
  setLedgerEntries:(entries) => set({ ledgerEntries: entries }),
  newspaperIssues: [
    {
      id: 'paper-1',
      week: 1,
      season: 'Fall',
      year: 1947,
      headline: 'IL CORRIERE: POWER TRANSITION IN SICILY',
      subheadline: 'The Don withdraws from public view as the consiglere consolidates control.',
      timestamp: new Date().toISOString(),
    }
  ],
  addNewspaperIssue: (headline, subheadline) => set((state) => ({
    newspaperIssues: [
      {
        id: crypto.randomUUID(),
        week: state.storyWorld.week,
        season: state.storyWorld.season,
        year: state.storyWorld.year,
        headline,
        subheadline,
        timestamp: new Date().toISOString(),
      },
      ...state.newspaperIssues
    ]
  })),

  intelReports: [
    { id: 'i1', title: 'Port Lockdown',   description: 'Authorities have seized dock operations in Palermo. Avoid shipments for 72 hours.',                                                          severity: 'high',     timestamp: new Date().toISOString(), territory: 'Sicily' },
    { id: 'i2', title: 'Rival Movement',  description: 'Intercepted communications suggest a gathering of underbosses in Naples. Potential hit planned for midnight.',                                 severity: 'critical', timestamp: new Date().toISOString(), territory: 'Naples' },
    { id: 'i3', title: 'Police Probe',    description: 'The police are sniffing around the West End. Avoid operations there for 48 hours.',                                                          severity: 'medium',   timestamp: new Date().toISOString() }
  ],
  addIntelReport:  (report)  => set((state) => ({ intelReports: [report, ...state.intelReports] })),
  setIntelReports: (reports) => set({ intelReports: reports }),
  personalEvents: [],
  triggerPersonalEvent: () => set((state) => {
    if (state.personalEvents.some((event) => event.unresolved)) return {}
    return {
      personalEvents: [
        {
          id: crypto.randomUUID(),
          title: 'Dinner Missed Again',
          description: 'Your spouse asks why you keep choosing empire over family.',
          effectsHint: 'Family First choices improve loyalty at home but slow expansion momentum.',
          unresolved: true,
        },
        ...state.personalEvents
      ]
    }
  }),
  resolvePersonalEvent: (id) => set((state) => ({
    personalEvents: state.personalEvents.map((event) => event.id === id ? { ...event, unresolved: false } : event)
  })),

  saves: [],
  setSaves: (saves) => set({ saves }),

  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  notificationsOpen: false,
  setNotificationsOpen: (open) => set({ notificationsOpen: open }),

  userId: null,
  setUserId: (id) => set({ userId: id }),

  instanceChecked: false,
  setInstanceChecked: (val) => set({ instanceChecked: val }),

  tutorialCompleted: false,
  tutorialPhase: 'chapter0',
  setTutorialCompleted: (val) => set({ tutorialCompleted: val }),
  setTutorialPhase: (phase) => set({ tutorialPhase: phase }),

  storyModeStarted: false,
  storyChapter: 1,
  storyStep: 0,
  storyPath: [],
  storyEnding: null,
  storyWorld: DEFAULT_STORY_WORLD,
  hiddenStoryFlags: [],
  npcToneMemory: DEFAULT_NPC_TONE_MEMORY,
  commissionFactions: DEFAULT_COMMISSION,
  startStoryMode: () => set({
    storyModeStarted: true,
    storyChapter: 1,
    storyStep: 0,
    storyPath: [],
    storyEnding: null,
    storyWorld: DEFAULT_STORY_WORLD,
    hiddenStoryFlags: [],
  }),
  advanceStory: (choiceId, nextChapter, ending = null) => set((state) => ({
    storyModeStarted: true,
    storyChapter: nextChapter,
    storyStep: state.storyStep + 1,
    storyPath: [...state.storyPath, choiceId],
    storyEnding: ending,
  })),
  resetStoryMode: () => set({
    storyModeStarted: false,
    storyChapter: 1,
    storyStep: 0,
    storyPath: [],
    storyEnding: null,
    storyWorld: DEFAULT_STORY_WORLD,
    hiddenStoryFlags: [],
  }),
  setStoryWorld: (world) => set({ storyWorld: world }),
  applyPhilosophyShiftFromTone: (tone) => set((state) => {
    const delta = tone === 'INTIMIDATE'
      ? { violenceVsPolitics: 1, honorVsPragmatism: 1 }
      : tone === 'NEGOTIATE'
      ? { violenceVsPolitics: -1, oldCodeVsNewBlood: 1 }
      : tone === 'DEFER'
      ? { familyFirstVsEmpireFirst: 1, honorVsPragmatism: -1 }
      : { honorVsPragmatism: 1, violenceVsPolitics: -1 }
    const nextPhilosophy = {
      ...state.storyWorld.philosophy,
      oldCodeVsNewBlood: Math.max(-5, Math.min(5, state.storyWorld.philosophy.oldCodeVsNewBlood + (delta.oldCodeVsNewBlood ?? 0))),
      violenceVsPolitics: Math.max(-5, Math.min(5, state.storyWorld.philosophy.violenceVsPolitics + (delta.violenceVsPolitics ?? 0))),
      familyFirstVsEmpireFirst: Math.max(-5, Math.min(5, state.storyWorld.philosophy.familyFirstVsEmpireFirst + (delta.familyFirstVsEmpireFirst ?? 0))),
      honorVsPragmatism: Math.max(-5, Math.min(5, state.storyWorld.philosophy.honorVsPragmatism + (delta.honorVsPragmatism ?? 0))),
    }
    const nextFlags = new Set(state.hiddenStoryFlags)
    if (normalizePhilosophy(nextPhilosophy.violenceVsPolitics) > 70) nextFlags.add('iron_fist_route')
    if (normalizePhilosophy(nextPhilosophy.oldCodeVsNewBlood) > 70) nextFlags.add('old_guard_route')
    return {
      storyWorld: { ...state.storyWorld, philosophy: nextPhilosophy },
      hiddenStoryFlags: Array.from(nextFlags),
    }
  }),
  advanceWeek: (cause) => {
    const current = get().storyWorld
    const week = current.week + 1
    const nextSeasonIndex = Math.floor(((week - 1) % WEEKS_PER_YEAR) / WEEKS_PER_SEASON)
    const yearsPassed = Math.floor((week - 1) / WEEKS_PER_YEAR)
    const nextYear = 1947 + yearsPassed
    set({
      storyWorld: {
        ...current,
        week,
        season: SEASONS[nextSeasonIndex],
        year: nextYear,
      }
    })
    get().evaluateNeglectedTerritories()
    get().addNewspaperIssue(
      formatWeeklyHeadline(cause, week),
      'A delayed consequence surfaces as alliances shift and pressure mounts across both coasts.'
    )
    if (week % 4 === 0) {
      get().triggerPersonalEvent()
    }
  },
  runCommissionVote: (proposal) => {
    const state = get()
    const violenceNormalized = normalizePhilosophy(state.storyWorld.philosophy.violenceVsPolitics)
    const oldCodeNormalized = normalizePhilosophy(state.storyWorld.philosophy.oldCodeVsNewBlood)
    const politicians = state.commissionFactions.politicians + (violenceNormalized < 50 ? 8 : -6)
    const expansionists = state.commissionFactions.expansionists + (violenceNormalized > 50 ? 8 : -3)
    const oldFamilies = state.commissionFactions.oldFamilies + (oldCodeNormalized > 50 ? 8 : -4)
    const votesFor = [oldFamilies, expansionists, politicians].filter((score) => score >= 50).length
    const approved = votesFor >= 2
    set({
      intelReports: [
        {
          id: crypto.randomUUID(),
          title: approved ? 'Commission Approved Operation' : 'Commission Blocked Operation',
          description: `${proposal} ${approved ? 'passed with majority support.' : 'failed to secure a majority vote.'}`,
          severity: approved ? 'low' : 'high',
          territory: undefined,
          timestamp: new Date().toISOString(),
        },
        ...state.intelReports
      ]
    })
    return approved
  },
  hydrateProgress: (snapshot) => set((state) => ({
    tutorialCompleted: snapshot.tutorialCompleted ?? state.tutorialCompleted,
    tutorialPhase: snapshot.tutorialPhase ?? state.tutorialPhase,
    storyModeStarted: snapshot.storyModeStarted ?? state.storyModeStarted,
    storyChapter: snapshot.storyChapter ?? state.storyChapter,
    storyStep: snapshot.storyStep ?? state.storyStep,
    storyPath: snapshot.storyPath ?? state.storyPath,
    storyEnding: snapshot.storyEnding ?? state.storyEnding,
    storyWorld: snapshot.storyWorld ?? state.storyWorld,
  })),

  resetGame: () => set({
    player: null,
    currentEvent: null,
    narrativeHistory: [],
    territories: DEFAULT_TERRITORIES,
    selectedTerritory: null,
    activeRegion: 'italy',
    regionTransitionTitle: null,
    familyMembers: DEFAULT_FAMILY,
    ledgerEntries: [],
    newspaperIssues: [],
    intelReports: [],
    personalEvents: [],
    saves: [],
    notificationsOpen: false,
    sidebarOpen: true,
    instanceChecked: false,
    tutorialCompleted: false,
    tutorialPhase: 'chapter0',
    storyModeStarted: false,
    storyChapter: 1,
    storyStep: 0,
    storyPath: [],
    storyEnding: null,
    storyWorld: DEFAULT_STORY_WORLD,
    hiddenStoryFlags: [],
    npcToneMemory: DEFAULT_NPC_TONE_MEMORY,
    commissionFactions: DEFAULT_COMMISSION,
  })
}))
