import { useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useGameStore } from '@/store/gameStore'
import type { GameSave, PlayerStats, LedgerEntry } from '@/types'

// ─── Auth ─────────────────────────────────────────────────────────────────────

export function useSupabaseAuth() {
  const { setUserId } = useGameStore()

  useEffect(() => {
    void supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user.id ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null)
    })
    return () => subscription.unsubscribe()
  }, [setUserId])

  const signIn = useCallback(async (email: string, password: string) => {
    return supabase.auth.signInWithPassword({ email, password })
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    return supabase.auth.signUp({ email, password })
  }, [])

  const signInWithMagicLink = useCallback(async (email: string) => {
    return supabase.auth.signInWithOtp({ email })
  }, [])

  const signOut = useCallback(async () => {
    return supabase.auth.signOut()
  }, [])

  return { signIn, signUp, signInWithMagicLink, signOut }
}

// ─── Game Instances ───────────────────────────────────────────────────────────
// A "game instance" is a row in `game_instances` that holds the full player
// snapshot for a given user. One row per active game; we upsert on every
// meaningful state change so it always reflects the latest progress.

export function useGameInstance() {
  const { userId, setPlayer } = useGameStore()

  /** Write (or overwrite) the current player snapshot to Supabase. */
  const saveInstance = useCallback(async (stats: PlayerStats) => {
    if (!userId) return
    await supabase.from('game_instances').upsert(
      {
        user_id:      userId,
        player_stats: stats as unknown as Record<string, unknown>,
        updated_at:   new Date().toISOString(),
        status:       'active',
      },
      // Each user has exactly one active instance row keyed by user_id.
      { onConflict: 'user_id' }
    )
  }, [userId])

  /** Fetch the most recent open instance for this user. Returns true if found. */
  const loadInstance = useCallback(async (): Promise<boolean> => {
    if (!userId) return false
    const { data, error } = await supabase
      .from('game_instances')
      .select('player_stats')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error || !data) return false

    const stats = data.player_stats as unknown as PlayerStats
    if (stats?.id) {
      setPlayer(stats)
      return true
    }
    return false
  }, [userId, setPlayer])

  /** Mark the instance as concluded (e.g. on game-over / conclude screen). */
  const concludeInstance = useCallback(async () => {
    if (!userId) return
    await supabase
      .from('game_instances')
      .update({ status: 'concluded', updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('status', 'active')
  }, [userId])

  return { saveInstance, loadInstance, concludeInstance }
}

// ─── Saves ────────────────────────────────────────────────────────────────────

export function useGameSaves() {
  const { userId, setSaves } = useGameStore()

  const loadSaves = useCallback(async () => {
    if (!userId) return
    const { data } = await supabase
      .from('saves')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (data) {
      setSaves(data.map(d => ({
        id:             d.id             as string,
        slotName:       d.slot_name      as string,
        playerStats:    d.player_stats   as unknown as PlayerStats,
        currentChapter: d.chapter        as number,
        lastSaved:      d.updated_at     as string,
        playTime:       (d.play_time     as number) ?? 0
      })) as GameSave[])
    }
  }, [userId, setSaves])

  const saveGame = useCallback(async (
    slotName: string,
    playerStats: PlayerStats,
    chapter: number,
    playTime: number = 0
  ) => {
    if (!userId) return
    await supabase.from('saves').upsert({
      user_id:      userId,
      slot_name:    slotName,
      player_stats: playerStats as unknown as Record<string, unknown>,
      chapter,
      play_time:    playTime
    })
    await loadSaves()
  }, [userId, loadSaves])

  return { loadSaves, saveGame }
}

// ─── Ledger ───────────────────────────────────────────────────────────────────

export function useGameLedger() {
  const { userId, setLedgerEntries } = useGameStore()

  const loadLedger = useCallback(async () => {
    if (!userId) return
    const { data } = await supabase
      .from('ledger_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100)
    if (data) {
      setLedgerEntries(data.map(d => ({
        id:          d.id          as string,
        description: d.description as string,
        amount:      d.amount      as number,
        type:        d.type        as LedgerEntry['type'],
        timestamp:   d.created_at  as string,
        territory:   d.territory   as string | undefined
      })) as LedgerEntry[])
    }
  }, [userId, setLedgerEntries])

  const addEntry = useCallback(async (
    description: string,
    amount: number,
    type: LedgerEntry['type'],
    territory?: string
  ) => {
    if (!userId) return
    await supabase.from('ledger_entries').insert({
      user_id: userId,
      description,
      amount,
      type,
      ...(territory ? { territory } : {})
    })
  }, [userId])

  return { loadLedger, addEntry }
}
