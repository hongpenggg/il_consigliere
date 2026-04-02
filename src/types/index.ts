export interface PlayerStats {
  id: string
  name: string
  familyName: string
  territory: 'italy' | 'usa'
  affiliation: 'cosa_nostra' | 'genovese' | 'gambino'
  rank: string
  wealth: number
  loyalty: number
  suspicion: number
  heat: number
  soldiers: number
  territoryControl: number
  diplomacy: number
}

export interface FamilyMember {
  id: string
  name: string
  role: string
  loyalty: number
  familiarity: number
  status: 'active' | 'compromised' | 'deceased'
  avatarUrl?: string
}

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

export interface LedgerEntry {
  id: string
  description: string
  amount: number
  type: 'income' | 'expense' | 'bribe' | 'tribute'
  timestamp: string
  territory?: string
}

export interface StoryEvent {
  id: string
  content: string
  choices: Choice[]
  timestamp: string
  chapter: number
}

export interface Choice {
  id: string
  text: string
  effects: StatEffect[]
  label?: string
}

export interface StatEffect {
  stat: keyof PlayerStats
  delta: number
  label: string
}

export interface GameSave {
  id: string
  slotName: string
  playerStats: PlayerStats
  currentChapter: number
  currentEvent?: StoryEvent
  lastSaved: string
  playTime: number
}

export interface IntelReport {
  id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: string
  territory?: string
}

export interface Enterprise {
  id: string
  name: string
  type: 'racket' | 'front' | 'union' | 'port' | 'casino'
  territory: string
  weeklyIncome: number
  risk: number
  status: 'operational' | 'compromised' | 'seized'
}
