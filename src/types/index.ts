// ─── Player ──────────────────────────────────────────────────────────────────

export interface PlayerStats {
  id: string
  name: string
  familyName: string
  territory: string
  affiliation:
    | 'famiglia_del_brenta'
    | 'banda_della_comasina'
    | 'banda_della_magliana'
    | 'famiglia_cosentino'
    | 'sacra_corona_unita'
    | 'ndrangheta'
    | 'camorra'
    | 'cosa_nostra'
    | 'gambino'
    | 'lucchese'
    | 'genovese'
    | 'bonanno'
    | 'colombo'
    | 'peaky_blinders'
    | 'independent'
  rank: string
  wealth: number
  loyalty: number
  suspicion: number
  heat: number
  soldiers: number
  territoryControl: number
  diplomacy: number
}

// ─── Narrative ───────────────────────────────────────────────────────────────

export interface Choice {
  id: string
  text: string
  effects: string[]
  label: string
}

export interface StoryEvent {
  id: string
  content: string
  choices: Choice[]
  timestamp: string
  chapter: number
  speaker?: string
  dialogue?: string
}

export interface StoryFactionState {
  familyLoyalty: number
  donTrust: number
  rivalTension: number
  rivalRespect: number
  commissionStanding: number
  cityHallInfluence: number
  cityHallExposure: number
  lawHeat: number
  notoriety: number
  streetFear: number
  streetGoodwill: number
}

export interface StoryResourceState {
  cash: number
  racketsActive: number
  racketsCompromised: number
  soldiersAvailable: number
  soldiersUnavailable: number
  favorsOwed: string[]
  favorsHeld: string[]
}

export interface StoryPhilosophyState {
  oldCodeVsNewBlood: number
  violenceVsPolitics: number
  familyFirstVsEmpireFirst: number
  honorVsPragmatism: number
}

export interface StoryWorldState {
  city: 'Chicago' | 'New York' | 'Havana'
  year: number
  season: 'Spring' | 'Summer' | 'Fall' | 'Winter'
  factions: StoryFactionState
  resources: StoryResourceState
  philosophy: StoryPhilosophyState
}

export interface StoryStepDelta {
  player?: Partial<PlayerStats>
  factions?: Partial<StoryFactionState>
  resources?: Partial<Omit<StoryResourceState, 'favorsOwed' | 'favorsHeld'>>
  addFavorsOwed?: string[]
  resolveFavorsOwed?: string[]
  addFavorsHeld?: string[]
  spendFavorsHeld?: string[]
  philosophy?: Partial<StoryPhilosophyState>
}

export interface StoryChoiceOption {
  id: 'A' | 'B' | 'C' | 'D'
  text: string
  likelyEffect: string
  delta: StoryStepDelta
}

export interface StoryChapterScene {
  chapter: number
  week: number
  sceneHeader: {
    location: string
    present: string[]
    stakes: string
    leverage: string
  }
  brief: {
    known: string[]
    suspect: string[]
    unknown: string[]
  }
  body: string[]
  npcName: string
  npcDialogue: string
  options: StoryChoiceOption[]
  delayedThread: string
}

// ─── Family ──────────────────────────────────────────────────────────────────

export interface FamilyMember {
  id: string
  name: string
  role: string
  loyalty: number
  familiarity: number
  status: 'active' | 'compromised' | 'eliminated' | 'unknown'
}

// ─── Territories ─────────────────────────────────────────────────────────────

export interface Territory {
  id: string
  name: string
  region: 'italy' | 'usa'
  influence: number
  controller: string
  weeklyIncome: number
  resistanceLevel: number
  description: string
  lat: number
  lng: number
  positionX: number
  positionY: number
}

// ─── Ledger ──────────────────────────────────────────────────────────────────

export type LedgerType = 'income' | 'expense' | 'bribe' | 'tribute' | 'penalty' | 'investment'

export interface LedgerEntry {
  id: string
  description: string
  amount: number
  type: LedgerType
  timestamp: string
  territory?: string
}

// ─── Intel ───────────────────────────────────────────────────────────────────

export type IntelSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface IntelReport {
  id: string
  title: string
  description: string
  severity: IntelSeverity
  timestamp: string
  territory?: string
}

// ─── Saves ───────────────────────────────────────────────────────────────────

export interface GameSave {
  id: string
  slotName: string
  playerStats: PlayerStats
  currentChapter: number
  lastSaved: string
  playTime: number
}
