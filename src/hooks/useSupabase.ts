import { useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useGameStore } from '@/store/gameStore'
import type { GameSave, PlayerStats } from '@/types'

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
        id: d.id as string,
        slotName: d.slot_name as string,
        playerStats: d.player_stats as unknown as PlayerStats,
        currentChapter: d.chapter as number,
        lastSaved: d.created_at as string,
        playTime: 0
      })) as GameSave[])
    }
  }, [userId, setSaves])

  const saveGame = useCallback(async (slotName: string, playerStats: PlayerStats, chapter: number) => {
    if (!userId) return
    await supabase.from('saves').upsert({
      user_id: userId,
      slot_name: slotName,
      player_stats: playerStats as unknown as Record<string, unknown>,
      chapter
    })
    await loadSaves()
  }, [userId, loadSaves])

  return { loadSaves, saveGame }
}
