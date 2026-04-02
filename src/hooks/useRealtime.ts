import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useGameStore } from '@/store/gameStore'
import type { IntelReport, LedgerEntry } from '@/types'

export function useRealtimeIntel() {
  const { userId, addIntelReport, addLedgerEntry } = useGameStore()

  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`intel:${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'story_events', filter: `user_id=eq.${userId}` },
        (payload) => {
          const row = payload.new as Record<string, unknown>
          const report: IntelReport = {
            id: row.id as string,
            title: 'New Intelligence',
            description: (row.content as string).slice(0, 100) + '...',
            severity: 'medium',
            timestamp: row.created_at as string
          }
          addIntelReport(report)
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ledger_entries', filter: `user_id=eq.${userId}` },
        (payload) => {
          const row = payload.new as Record<string, unknown>
          const entry: LedgerEntry = {
            id: row.id as string,
            description: row.description as string,
            amount: row.amount as number,
            type: row.type as LedgerEntry['type'],
            timestamp: row.created_at as string
          }
          addLedgerEntry(entry)
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [userId, addIntelReport, addLedgerEntry])
}
