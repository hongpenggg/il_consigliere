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
