import { useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useGameStore } from '@/store/gameStore'
import type { GameSave, PlayerStats, LedgerEntry, StoryWorldState } from '@/types'

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

  const signInWithGoogle = useCallback(async () => {
    const redirectTo = `${window.location.origin}/`
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })
  }, [])

  return { signIn, signUp, signInWithMagicLink, signInWithGoogle, signOut }
}

// ─── Game Instances ───────────────────────────────────────────────────────────
// A "game instance" is a row in `game_instances` that holds the full player
// snapshot for a given user. One row per active game; we upsert on every
// meaningful state change so it always reflects the latest progress.

export function useGameInstance() {
  const {
    userId,
    setPlayer,
    tutorialCompleted,
    tutorialPhase,
    storyModeStarted,
    storyChapter,
    storyStep,
    storyPath,
    storyEnding,
    storyWorld,
    hydrateProgress,
  } = useGameStore()

  /** Write (or overwrite) the current player snapshot to Supabase. */
  const saveInstance = useCallback(async (stats: PlayerStats) => {
    if (!userId) return
    const { error } = await supabase.from('game_instances').upsert(
      {
        user_id:      userId,
        player_stats: stats as unknown as Record<string, unknown>,
        progress_snapshot: {
          tutorialCompleted,
          tutorialPhase,
          storyModeStarted,
          storyChapter,
          storyStep,
          storyPath,
          storyEnding,
          storyWorld,
        },
        updated_at:   new Date().toISOString(),
        status:       'active',
      },
      // Each user has exactly one active instance row keyed by user_id.
      { onConflict: 'user_id' }
    )
    if (error) {
      console.error('Failed to save game instance:', error.message)
    }
  }, [userId, tutorialCompleted, tutorialPhase, storyModeStarted, storyChapter, storyStep, storyPath, storyEnding, storyWorld])

  /** Fetch the most recent open instance for this user. Returns true if found. */
  const loadInstance = useCallback(async (): Promise<boolean> => {
    if (!userId) return false
    const { data, error } = await supabase
      .from('game_instances')
      .select('player_stats, progress_snapshot')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error || !data) return false

    const stats = data.player_stats as unknown as PlayerStats
    if (stats?.id) {
      setPlayer(stats)
      const progress = data.progress_snapshot as Record<string, unknown> | null
      if (progress) {
        hydrateProgress({
          tutorialCompleted: progress.tutorialCompleted as boolean | undefined,
          tutorialPhase: progress.tutorialPhase as string | undefined,
          storyModeStarted: progress.storyModeStarted as boolean | undefined,
          storyChapter: progress.storyChapter as number | undefined,
          storyStep: progress.storyStep as number | undefined,
          storyPath: progress.storyPath as string[] | undefined,
          storyEnding: progress.storyEnding as string | null | undefined,
          storyWorld: progress.storyWorld as StoryWorldState | undefined,
        })
      }
      return true
    }
    return false
  }, [userId, setPlayer, hydrateProgress])

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

// ─── User Progress ─────────────────────────────────────────────────────────────

export function useUserProgress() {
  const {
    userId,
    player,
    tutorialCompleted,
    tutorialPhase,
    storyModeStarted,
    storyChapter,
    storyStep,
    storyPath,
    storyEnding,
    storyWorld,
    hydrateProgress,
  } = useGameStore()

  const saveProgress = useCallback(async (overrides?: {
    tutorialCompleted?: boolean
    tutorialPhase?: string
    storyModeStarted?: boolean
    storyChapter?: number
    storyStep?: number
    storyPath?: string[]
    storyEnding?: string | null
    storyWorld?: StoryWorldState
    player?: PlayerStats | null
  }) => {
    if (!userId) return
    const effectivePlayer = overrides?.player ?? player
    const nextTutorialCompleted = overrides?.tutorialCompleted ?? tutorialCompleted
    const nextTutorialPhase = overrides?.tutorialPhase ?? tutorialPhase
    const nextStoryModeStarted = overrides?.storyModeStarted ?? storyModeStarted
    const nextStoryChapter = overrides?.storyChapter ?? storyChapter
    const nextStoryStep = overrides?.storyStep ?? storyStep
    const nextStoryPath = overrides?.storyPath ?? storyPath
    const nextStoryEnding = overrides?.storyEnding ?? storyEnding
    const nextStoryWorld = overrides?.storyWorld ?? storyWorld
    const { error } = await supabase.from('user_progress').upsert({
      user_id: userId,
      current_chapter: nextStoryChapter,
      total_play_time: 0,
      last_active: new Date().toISOString(),
      tutorial_completed: nextTutorialCompleted,
      tutorial_phase: nextTutorialPhase,
      story_mode_started: nextStoryModeStarted,
      story_chapter: nextStoryChapter,
      story_step: nextStoryStep,
      story_path: nextStoryPath,
      story_ending: nextStoryEnding,
      story_world: nextStoryWorld as unknown as Record<string, unknown>,
      resource_snapshot: (effectivePlayer ?? null) as unknown as Record<string, unknown> | null,
    }, { onConflict: 'user_id' })
    if (error) {
      console.error('Failed to save user progress:', error.message)
    }

    if (effectivePlayer) {
      const { error: instanceError } = await supabase.from('game_instances').upsert(
        {
          user_id: userId,
          player_stats: effectivePlayer as unknown as Record<string, unknown>,
          progress_snapshot: {
            tutorialCompleted: nextTutorialCompleted,
            tutorialPhase: nextTutorialPhase,
            storyModeStarted: nextStoryModeStarted,
            storyChapter: nextStoryChapter,
            storyStep: nextStoryStep,
            storyPath: nextStoryPath,
            storyEnding: nextStoryEnding,
            storyWorld: nextStoryWorld,
          },
          updated_at: new Date().toISOString(),
          status: 'active',
        },
        { onConflict: 'user_id' }
      )
      if (instanceError) {
        console.error('Failed to save game instance from progress:', instanceError.message)
      }
    }
  }, [
    userId,
    player,
    tutorialCompleted,
    tutorialPhase,
    storyModeStarted,
    storyChapter,
    storyStep,
    storyPath,
    storyEnding,
    storyWorld,
  ])

  const loadProgress = useCallback(async () => {
    if (!userId) return false
    const { data, error } = await supabase
      .from('user_progress')
      .select('tutorial_completed, tutorial_phase, story_mode_started, story_chapter, story_step, story_path, story_ending, story_world')
      .eq('user_id', userId)
      .maybeSingle()
    if (error || !data) return false
    hydrateProgress({
      tutorialCompleted: (data.tutorial_completed as boolean | null) ?? false,
      tutorialPhase: (data.tutorial_phase as string | null) ?? 'chapter0',
      storyModeStarted: (data.story_mode_started as boolean | null) ?? false,
      storyChapter: (data.story_chapter as number | null) ?? 1,
      storyStep: (data.story_step as number | null) ?? 0,
      storyPath: (data.story_path as string[] | null) ?? [],
      storyEnding: (data.story_ending as string | null) ?? null,
      storyWorld: (data.story_world as StoryWorldState | null) ?? undefined,
    })
    return true
  }, [userId, hydrateProgress])

  const trackStoryStep = useCallback(async (params: {
    chapter: number
    content: string
    choiceId: string
    choiceText: string
    choiceLabel: string
    nextChapter: number
    ending?: string | null
    playerAfterStep: PlayerStats | null
    worldAfterStep: StoryWorldState
    storyPathAfterStep: string[]
    storyStepAfterStep: number
  }) => {
    if (!userId) return
    await supabase.from('story_events').insert({
      user_id: userId,
      content: `${params.content}\n\nChoice: ${params.choiceText}`,
      choices: [{ id: params.choiceId, text: params.choiceText, label: params.choiceLabel }],
      chapter: params.chapter,
      speaker: 'Command Center',
      dialogue: params.ending ? `Ending trajectory: ${params.ending}` : null,
    })
    await saveProgress({
      storyModeStarted: true,
      storyChapter: params.nextChapter,
      storyStep: params.storyStepAfterStep,
      storyPath: params.storyPathAfterStep,
      storyEnding: params.ending ?? null,
      storyWorld: params.worldAfterStep,
      player: params.playerAfterStep,
    })
  }, [userId, saveProgress])

  return { saveProgress, loadProgress, trackStoryStep }
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
