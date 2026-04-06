import { useMemo } from 'react'
import { useGameStore } from '@/store/gameStore'
import { useUserProgress } from '@/hooks/useSupabase'
import { getStoryChapter } from '@/data/storyModeChapters'
import type { PlayerStats, StoryChoiceOption, StoryFactionState, StoryResourceState, StoryPhilosophyState, StoryWorldState } from '@/types'

function clamp(min: number, value: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function applyPlayerDelta(player: PlayerStats | null, delta?: Partial<PlayerStats>) {
  if (!player || !delta) return player
  return {
    ...player,
    ...delta,
    heat: clamp(0, delta.heat ?? player.heat, 100),
    loyalty: clamp(0, delta.loyalty ?? player.loyalty, 100),
    suspicion: clamp(0, delta.suspicion ?? player.suspicion, 100),
    territoryControl: clamp(0, delta.territoryControl ?? player.territoryControl, 100),
    soldiers: Math.max(0, delta.soldiers ?? player.soldiers),
  }
}

function applyFactionDelta(current: StoryFactionState, delta?: Partial<StoryFactionState>): StoryFactionState {
  if (!delta) return current
  return {
    familyLoyalty: clamp(0, current.familyLoyalty + (delta.familyLoyalty ?? 0), 100),
    donTrust: clamp(0, current.donTrust + (delta.donTrust ?? 0), 100),
    rivalTension: clamp(0, current.rivalTension + (delta.rivalTension ?? 0), 100),
    rivalRespect: clamp(0, current.rivalRespect + (delta.rivalRespect ?? 0), 100),
    commissionStanding: clamp(0, current.commissionStanding + (delta.commissionStanding ?? 0), 100),
    cityHallInfluence: clamp(0, current.cityHallInfluence + (delta.cityHallInfluence ?? 0), 100),
    cityHallExposure: clamp(0, current.cityHallExposure + (delta.cityHallExposure ?? 0), 100),
    lawHeat: clamp(0, current.lawHeat + (delta.lawHeat ?? 0), 100),
    notoriety: clamp(0, current.notoriety + (delta.notoriety ?? 0), 100),
    streetFear: clamp(0, current.streetFear + (delta.streetFear ?? 0), 100),
    streetGoodwill: clamp(0, current.streetGoodwill + (delta.streetGoodwill ?? 0), 100),
  }
}

function applyResourceDelta(current: StoryResourceState, delta?: Partial<Omit<StoryResourceState, 'favorsOwed' | 'favorsHeld'>>) {
  if (!delta) return current
  return {
    ...current,
    cash: current.cash + (delta.cash ?? 0),
    racketsActive: Math.max(0, current.racketsActive + (delta.racketsActive ?? 0)),
    racketsCompromised: Math.max(0, current.racketsCompromised + (delta.racketsCompromised ?? 0)),
    soldiersAvailable: Math.max(0, current.soldiersAvailable + (delta.soldiersAvailable ?? 0)),
    soldiersUnavailable: Math.max(0, current.soldiersUnavailable + (delta.soldiersUnavailable ?? 0)),
  }
}

function applyPhilosophyDelta(current: StoryPhilosophyState, delta?: Partial<StoryPhilosophyState>) {
  if (!delta) return current
  return {
    oldCodeVsNewBlood: clamp(-5, current.oldCodeVsNewBlood + (delta.oldCodeVsNewBlood ?? 0), 5),
    violenceVsPolitics: clamp(-5, current.violenceVsPolitics + (delta.violenceVsPolitics ?? 0), 5),
    familyFirstVsEmpireFirst: clamp(-5, current.familyFirstVsEmpireFirst + (delta.familyFirstVsEmpireFirst ?? 0), 5),
    honorVsPragmatism: clamp(-5, current.honorVsPragmatism + (delta.honorVsPragmatism ?? 0), 5),
  }
}

function mergeWorld(world: StoryWorldState, choice: StoryChoiceOption) {
  const d = choice.delta
  const favorsOwed = world.resources.favorsOwed
    .filter((f) => !(d.resolveFavorsOwed ?? []).includes(f))
    .concat(d.addFavorsOwed ?? [])
  const favorsHeld = world.resources.favorsHeld
    .filter((f) => !(d.spendFavorsHeld ?? []).includes(f))
    .concat(d.addFavorsHeld ?? [])

  return {
    ...world,
    factions: applyFactionDelta(world.factions, d.factions),
    resources: {
      ...applyResourceDelta(world.resources, d.resources),
      favorsOwed,
      favorsHeld,
    },
    philosophy: applyPhilosophyDelta(world.philosophy, d.philosophy),
  }
}

function worldFromPlayerTerritory(territory: string | undefined, playerId?: string): Pick<StoryWorldState, 'world' | 'city'> {
  const mapping: Record<string, Pick<StoryWorldState, 'world' | 'city'>> = {
    italy: { world: 'Italy', city: 'Sicily' },
    usa: { world: 'USA', city: 'New York' },
    uk: { world: 'UK', city: 'London' },
  }
  const resolved = territory ? mapping[territory] : undefined
  void playerId
  return resolved ?? mapping.italy
}

function meter(value: number) {
  return (
    <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
      <div className="h-full bg-primary transition-all" style={{ width: `${value}%` }} />
    </div>
  )
}

export default function CommandScreen() {
  const {
    player,
    setPlayer,
    storyModeStarted,
    startStoryMode,
    storyChapter,
    storyStep,
    storyPath,
    storyEnding,
    storyWorld,
    setStoryWorld,
    advanceStory,
  } = useGameStore()
  const { trackStoryStep } = useUserProgress()

  const chapter = useMemo(() => getStoryChapter(storyChapter), [storyChapter])
  const world = useMemo<StoryWorldState>(() => {
    if (storyModeStarted) return storyWorld
    const inferred = worldFromPlayerTerritory(player?.territory, player?.id)
    return { ...storyWorld, ...inferred }
  }, [storyModeStarted, storyWorld, player?.territory])

  const handleStart = () => {
    startStoryMode()
    setStoryWorld({ ...world })
  }

  const handleChoice = (choice: StoryChoiceOption) => {
    const nextWorld = mergeWorld(world, choice)
    const nextPlayer = applyPlayerDelta(player, choice.delta.player)
    setStoryWorld(nextWorld)
    if (nextPlayer) setPlayer(nextPlayer)
    advanceStory(choice.id, choice.nextChapter, choice.ending ?? null)
    void trackStoryStep({
      chapter: chapter.chapter,
      content: chapter.body.join('\n\n'),
      choiceId: choice.id,
      choiceText: choice.text,
      choiceLabel: choice.likelyEffect,
      nextChapter: choice.nextChapter,
      ending: choice.ending ?? null,
      playerAfterStep: nextPlayer,
      worldAfterStep: nextWorld,
      storyPathAfterStep: [...storyPath, choice.id],
      storyStepAfterStep: storyStep + 1,
    })
  }

  const completedStory = storyChapter === 20 && !!storyEnding && storyStep > 0

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-label text-[10px] uppercase tracking-[0.35em] text-primary/60">Command Centre — Story Mode</p>
          <h1 className="font-headline text-3xl italic text-on-surface">Il Consigliere: {world.world}, {world.year}</h1>
          <p className="font-body text-sm text-on-surface/60 mt-2">Season: {world.season} · Session Week {chapter.week} · Chapter {chapter.chapter}/20</p>
        </div>
      </div>

      {!storyModeStarted && (
        <div className="bg-surface-container-low border border-outline-variant/20 p-5 space-y-3">
          <p className="font-body text-sm text-on-surface/80">
            Autumn, 1947. The Don is diminished. The Commission votes in three weeks. The docks are contested.
            A federal grand jury is active. The heir is reckless. You are the consigliere.
          </p>
          <button
            onClick={handleStart}
            className="px-5 py-3 bg-primary-container border-l-4 border-primary font-label text-[10px] uppercase tracking-widest text-on-primary-container"
          >
            Begin Session One
          </button>
        </div>
      )}

      {storyModeStarted && (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-4">
              <section className="bg-surface-container-low border border-outline-variant/20 p-5 space-y-4">
                <p className="font-label text-[10px] uppercase tracking-[0.25em] text-primary/70">The Brief</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <p className="font-label text-[10px] uppercase tracking-widest text-secondary mb-2">Known</p>
                    <ul className="space-y-1 text-on-surface/80">{chapter.brief.known.map((i) => <li key={i}>• {i}</li>)}</ul>
                  </div>
                  <div>
                    <p className="font-label text-[10px] uppercase tracking-widest text-primary mb-2">Suspect</p>
                    <ul className="space-y-1 text-on-surface/80">{chapter.brief.suspect.map((i) => <li key={i}>• {i}</li>)}</ul>
                  </div>
                  <div>
                    <p className="font-label text-[10px] uppercase tracking-widest text-error mb-2">Unknown</p>
                    <ul className="space-y-1 text-on-surface/80">{chapter.brief.unknown.map((i) => <li key={i}>• {i}</li>)}</ul>
                  </div>
                </div>
              </section>

              <section className="bg-surface-container-low border border-outline-variant/20 p-5 space-y-4">
                <div className="text-xs text-on-surface/70 space-y-1">
                  <p><span className="text-on-surface">Location:</span> {chapter.sceneHeader.location}</p>
                  <p><span className="text-on-surface">Present:</span> {chapter.sceneHeader.present.join(' · ')}</p>
                  <p><span className="text-on-surface">Stakes:</span> {chapter.sceneHeader.stakes}</p>
                  <p><span className="text-on-surface">Your leverage:</span> {chapter.sceneHeader.leverage}</p>
                </div>
                <div className="space-y-3 text-sm text-on-surface/80 leading-relaxed">
                  {chapter.body.map((p) => <p key={p}>{p}</p>)}
                </div>
              </section>

              <section className="bg-surface-container-low border border-outline-variant/20 p-5 space-y-4">
                <p className="font-label text-[10px] uppercase tracking-[0.25em] text-primary/70">Dialogue Node</p>
                <p className="font-body text-sm text-on-surface"><span className="font-bold">{chapter.npcName}</span> says: “{chapter.npcDialogue}”</p>
                {!completedStory ? (
                  <div className="space-y-3">
                    {chapter.options.map((o) => (
                      <button
                        key={o.id}
                        onClick={() => handleChoice(o)}
                        className="w-full text-left p-4 bg-background/40 border border-outline-variant/20 hover:border-primary/40 hover:bg-primary-container/20 transition-all"
                      >
                        <p className="font-label text-[10px] uppercase tracking-wider text-primary/80 mb-1">{o.id}) {o.text}</p>
                        <p className="text-xs text-on-surface/60">→ Likely effect: {o.likelyEffect}</p>
                      </button>
                    ))}
                    <div className="p-3 border border-outline-variant/15 bg-background/30">
                      <p className="text-xs text-on-surface/60">E) Custom action — describe your approach (UI placeholder for free-text custom action).</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border border-primary/30 bg-primary-container/25">
                    <p className="font-label text-[10px] uppercase tracking-widest text-primary">Ending Reached</p>
                    <p className="font-body text-sm text-on-surface mt-2">{storyEnding}</p>
                  </div>
                )}
              </section>
            </div>

            <div className="space-y-4">
              <section className="bg-surface-container-low border border-outline-variant/20 p-4 space-y-3">
                <p className="font-label text-[10px] uppercase tracking-[0.25em] text-primary/70">Faction Relationships</p>
                {[
                  ['Your Family — Loyalty', world.factions.familyLoyalty],
                  ['Your Family — Don Trust', world.factions.donTrust],
                  ['Rival — Tension', world.factions.rivalTension],
                  ['Rival — Respect', world.factions.rivalRespect],
                  ['Commission — Standing', world.factions.commissionStanding],
                  ['City Hall — Influence', world.factions.cityHallInfluence],
                  ['City Hall — Exposure', world.factions.cityHallExposure],
                  ['NYPD/FBI — Heat', world.factions.lawHeat],
                  ['Press/Public — Notoriety', world.factions.notoriety],
                  ['Street — Fear', world.factions.streetFear],
                  ['Street — Goodwill', world.factions.streetGoodwill],
                ].map(([label, val]) => (
                  <div key={label as string} className="space-y-1">
                    <div className="flex justify-between text-[11px] text-on-surface/70"><span>{label}</span><span>{val}</span></div>
                    {meter(Number(val))}
                  </div>
                ))}
              </section>

              <section className="bg-surface-container-low border border-outline-variant/20 p-4 space-y-2">
                <p className="font-label text-[10px] uppercase tracking-[0.25em] text-primary/70">Resources</p>
                <p className="text-xs text-on-surface/70">Cash: ${world.resources.cash.toLocaleString()}</p>
                <p className="text-xs text-on-surface/70">Operations: {world.resources.racketsActive} active / {world.resources.racketsCompromised} compromised</p>
                <p className="text-xs text-on-surface/70">Men: {world.resources.soldiersAvailable} available / {world.resources.soldiersUnavailable} unavailable</p>
                <p className="text-xs text-on-surface/70">Favors Owed: {world.resources.favorsOwed.join(' · ') || 'None'}</p>
                <p className="text-xs text-on-surface/70">Favors Held: {world.resources.favorsHeld.join(' · ') || 'None'}</p>
              </section>

              <section className="bg-surface-container-low border border-outline-variant/20 p-4 space-y-2">
                <p className="font-label text-[10px] uppercase tracking-[0.25em] text-primary/70">Consigliere Philosophy</p>
                <p className="text-xs text-on-surface/70">Old Code ↔ New Blood: {world.philosophy.oldCodeVsNewBlood}</p>
                <p className="text-xs text-on-surface/70">Violence ↔ Politics: {world.philosophy.violenceVsPolitics}</p>
                <p className="text-xs text-on-surface/70">Family First ↔ Empire First: {world.philosophy.familyFirstVsEmpireFirst}</p>
                <p className="text-xs text-on-surface/70">Honor ↔ Pragmatism: {world.philosophy.honorVsPragmatism}</p>
                <div className="pt-2 border-t border-outline-variant/15">
                  <p className="text-xs text-on-surface/60">Delayed thread: {chapter.delayedThread}</p>
                </div>
              </section>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
