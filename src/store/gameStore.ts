import { create } from 'zustand'
import type { PlayerStats, StoryEvent, FamilyMember, Territory, LedgerEntry, IntelReport, GameSave } from '@/types'

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

  // Territories
  territories: Territory[]
  setTerritories: (territories: Territory[]) => void
  selectedTerritory: Territory | null
  setSelectedTerritory: (territory: Territory | null) => void
  activeRegion: 'italy' | 'usa'
  setActiveRegion: (region: 'italy' | 'usa') => void

  // Ledger
  ledgerEntries: LedgerEntry[]
  addLedgerEntry: (entry: LedgerEntry) => void
  setLedgerEntries: (entries: LedgerEntry[]) => void

  // Intel
  intelReports: IntelReport[]
  addIntelReport: (report: IntelReport) => void
  setIntelReports: (reports: IntelReport[]) => void

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

  // Reset
  resetGame: () => void
}

const DEFAULT_TERRITORIES: Territory[] = [
  { id: 't1', name: 'Sicily', region: 'italy', influence: 88, controller: 'Genovese', weeklyIncome: 45200, resistanceLevel: 2, description: 'The heart of the empire. Operational stability remains high despite recent probes from the northern syndicates.', lat: 37.5, lng: 14.0, positionX: 62, positionY: 75 },
  { id: 't2', name: 'Naples', region: 'italy', influence: 45, controller: 'Contested', weeklyIncome: 28000, resistanceLevel: 3, description: 'Contested ground between two rising powers. The docks remain a flashpoint.', lat: 40.8, lng: 14.3, positionX: 52, positionY: 55 },
  { id: 't3', name: 'Lombardy', region: 'italy', influence: 12, controller: 'Moretti Clan', weeklyIncome: 12000, resistanceLevel: 5, description: 'Hostile territory under Moretti control. Infiltration attempts have failed twice.', lat: 45.5, lng: 9.2, positionX: 25, positionY: 18 },
  { id: 't4', name: 'Rome', region: 'italy', influence: 60, controller: 'Player', weeklyIncome: 38000, resistanceLevel: 2, description: 'The political center. Police connections here are vital for operations.', lat: 41.9, lng: 12.5, positionX: 48, positionY: 42 },
  { id: 't5', name: 'Manhattan', region: 'usa', influence: 75, controller: 'Player', weeklyIncome: 85000, resistanceLevel: 3, description: 'The crown jewel of American operations. Five families watch every move.', lat: 40.7, lng: -74.0, positionX: 55, positionY: 40 },
  { id: 't6', name: 'Brooklyn', region: 'usa', influence: 55, controller: 'Contestd', weeklyIncome: 42000, resistanceLevel: 3, description: 'Working-class neighborhoods with deep union ties. The waterfront is key.', lat: 40.6, lng: -74.0, positionX: 52, positionY: 50 },
  { id: 't7', name: 'Chicago', region: 'usa', influence: 30, controller: 'Capone Network', weeklyIncome: 65000, resistanceLevel: 4, description: 'Capone remnants still control the meat-packing districts. Approach with caution.', lat: 41.8, lng: -87.6, positionX: 30, positionY: 38 }
]

const DEFAULT_FAMILY: FamilyMember[] = [
  { id: 'f1', name: 'Vincenzo Ricci', role: 'Informant / Capo', loyalty: 85, familiarity: 25, status: 'active' },
  { id: 'f2', name: 'Mayor Moretti', role: 'Political Puppet', loyalty: 42, familiarity: 60, status: 'active' },
  { id: 'f3', name: 'Carlo Esposito', role: 'Enforcer', loyalty: 91, familiarity: 80, status: 'active' },
  { id: 'f4', name: 'Sofia Ricci', role: 'Intelligence Officer', loyalty: 78, familiarity: 55, status: 'active' }
]

export const useGameStore = create<GameStore>((set) => ({
  player: null,
  setPlayer: (player) => set({ player }),
  updateStats: (delta) => set((state) => ({
    player: state.player ? { ...state.player, ...delta } : null
  })),

  currentEvent: null,
  narrativeHistory: [],
  setCurrentEvent: (event) => set({ currentEvent: event }),
  addToHistory: (event) => set((state) => ({ narrativeHistory: [...state.narrativeHistory, event] })),
  isGenerating: false,
  setIsGenerating: (val) => set({ isGenerating: val }),

  familyMembers: DEFAULT_FAMILY,
  setFamilyMembers: (members) => set({ familyMembers: members }),
  updateMemberLoyalty: (id, delta) => set((state) => ({
    familyMembers: state.familyMembers.map(m =>
      m.id === id ? { ...m, loyalty: Math.max(0, Math.min(100, m.loyalty + delta)) } : m
    )
  })),

  territories: DEFAULT_TERRITORIES,
  setTerritories: (territories) => set({ territories }),
  selectedTerritory: DEFAULT_TERRITORIES[0],
  setSelectedTerritory: (territory) => set({ selectedTerritory: territory }),
  activeRegion: 'italy',
  setActiveRegion: (region) => set({ activeRegion: region }),

  ledgerEntries: [
    { id: 'l1', description: 'Port Lockdown', amount: 0, type: 'expense', timestamp: new Date().toISOString(), territory: 'Sicily' },
    { id: 'l2', description: 'Union Bribe', amount: -50000, type: 'bribe', timestamp: new Date().toISOString() },
    { id: 'l3', description: 'Bianchi Exit', amount: 0, type: 'income', timestamp: new Date().toISOString() },
    { id: 'l4', description: 'Weekly Tribute – Sicily', amount: 45200, type: 'tribute', timestamp: new Date().toISOString(), territory: 'Sicily' },
    { id: 'l5', description: 'Police Payoff – Naples', amount: -12000, type: 'bribe', timestamp: new Date().toISOString(), territory: 'Naples' }
  ],
  addLedgerEntry: (entry) => set((state) => ({ ledgerEntries: [entry, ...state.ledgerEntries] })),
  setLedgerEntries: (entries) => set({ ledgerEntries: entries }),

  intelReports: [
    { id: 'i1', title: 'Port Lockdown', description: 'Authorities have seized dock operations in Palermo. Avoid shipments for 72 hours.', severity: 'high', timestamp: new Date().toISOString(), territory: 'Sicily' },
    { id: 'i2', title: 'Rival Movement', description: 'Intercepted communications suggest a gathering of underbosses in Naples. Potential hit planned for midnight.', severity: 'critical', timestamp: new Date().toISOString(), territory: 'Naples' },
    { id: 'i3', title: 'Police Probe', description: 'The police are sniffing around the West End. Avoid operations there for 48 hours.', severity: 'medium', timestamp: new Date().toISOString() }
  ],
  addIntelReport: (report) => set((state) => ({ intelReports: [report, ...state.intelReports] })),
  setIntelReports: (reports) => set({ intelReports: reports }),

  saves: [],
  setSaves: (saves) => set({ saves }),

  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  notificationsOpen: false,
  setNotificationsOpen: (open) => set({ notificationsOpen: open }),

  userId: null,
  setUserId: (id) => set({ userId: id }),

  resetGame: () => set({
    player: null,
    currentEvent: null,
    narrativeHistory: [],
    territories: DEFAULT_TERRITORIES,
    familyMembers: DEFAULT_FAMILY
  })
}))
