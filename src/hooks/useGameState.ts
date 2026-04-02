import { useCallback } from 'react'
import { useGameStore } from '@/store/gameStore'
import type { PlayerStats } from '@/types'

export function useGameState() {
  const store = useGameStore()

  const applyChoiceEffects = useCallback((effectLabel: string) => {
    const effects: Partial<PlayerStats> = {}

    const loyaltyMatch = effectLabel.match(/([+-]\d+)\s*Loyalty/i)
    if (loyaltyMatch) effects.loyalty = (store.player?.loyalty ?? 0) + parseInt(loyaltyMatch[1])

    const suspMatch = effectLabel.match(/([+-]\d+)\s*Suspicion/i)
    if (suspMatch) effects.suspicion = (store.player?.suspicion ?? 0) + parseInt(suspMatch[1])

    const heatMatch = effectLabel.match(/([+-]\d+)\s*Heat/i)
    if (heatMatch) effects.heat = Math.max(0, Math.min(100, (store.player?.heat ?? 0) + parseInt(heatMatch[1])))

    const wealthMatch = effectLabel.match(/([+-][\d,]+)\s*Lira/i)
    if (wealthMatch) effects.wealth = (store.player?.wealth ?? 0) + parseInt(wealthMatch[1].replace(',', ''))

    const terrMatch = effectLabel.match(/([+-]\d+)\s*Territory/i)
    if (terrMatch) effects.territoryControl = Math.max(0, Math.min(100, (store.player?.territoryControl ?? 0) + parseInt(terrMatch[1])))

    if (Object.keys(effects).length > 0) store.updateStats(effects)
  }, [store])

  const getHeatColor = useCallback(() => {
    const heat = store.player?.heat ?? 0
    if (heat >= 80) return 'text-error'
    if (heat >= 60) return 'text-primary'
    if (heat >= 40) return 'text-secondary'
    return 'text-on-surface-variant'
  }, [store.player?.heat])

  return { ...store, applyChoiceEffects, getHeatColor }
}
