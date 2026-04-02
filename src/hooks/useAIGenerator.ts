import { useCallback, useRef } from 'react'
import { useGameStore } from '@/store/gameStore'
import type { StoryEvent, Choice } from '@/types'

// ─── Types ───────────────────────────────────────────────────────────────────

interface GenerateApiResponse {
  text?: string
  error?: string
}

interface ParsedNarrative {
  narrative?: string
  dialogue?: string
  speaker?: string
  choices?: Array<{ text: string; effects: string; label: string }>
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAIGenerator() {
  const {
    player,
    setCurrentEvent,
    addToHistory,
    setIsGenerating,
    isGenerating,
    addLedgerEntry,
    addIntelReport
  } = useGameStore()

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const generateNarrative = useCallback(
    async (context: string, trigger?: string) => {
      if (isGenerating) return

      setIsGenerating(true)

      try {
        // ── Call our own serverless function, not OpenRouter directly ──────
        // The API key lives server-side in /api/generate.ts and is never
        // exposed to the browser.
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerName: player?.name ?? 'Don',
            familyName: player?.familyName ?? 'Corleone',
            rank: player?.rank ?? 'Capo',
            wealth: player?.wealth ?? 1200000,
            heat: player?.heat ?? 40,
            context,
            trigger
          })
        })

        if (!response.ok) {
          throw new Error(`API error ${response.status}`)
        }

        const data = (await response.json()) as GenerateApiResponse
        const text = data.text ?? ''

        // ── Parse the JSON narrative from the AI's text response ───────────
        let parsed: ParsedNarrative = {}
        try {
          const jsonMatch = text.match(/\{[\s\S]*\}/)
          if (jsonMatch) parsed = JSON.parse(jsonMatch[0]) as ParsedNarrative
        } catch {
          parsed = {}
        }

        const event: StoryEvent = {
          id: crypto.randomUUID(),
          content: parsed.narrative ?? text,
          choices: (parsed.choices ?? []).map(
            (c, i): Choice => ({
              id: `c${i}`,
              text: c.text,
              effects: [],
              label: c.effects ?? c.label
            })
          ),
          timestamp: new Date().toISOString(),
          chapter: 1
        }

        if (!event.choices.length) {
          event.choices = getDefaultChoices()
        }

        setCurrentEvent(event)
      } catch (err) {
        console.error('AI generation error:', err)
        // Graceful fallback — game still playable without AI
        const fallback = createFallbackEvent(player?.name ?? 'Consigliere', trigger)
        setCurrentEvent(fallback)
      } finally {
        setIsGenerating(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [player, isGenerating, setCurrentEvent, setIsGenerating, addLedgerEntry, addIntelReport]
  )

  const generateDebounced = useCallback(
    (context: string, trigger?: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => generateNarrative(context, trigger), 300)
    },
    [generateNarrative]
  )

  const handleChoice = useCallback(
    (choice: Choice, currentEvent: StoryEvent) => {
      addToHistory(currentEvent)
      const context = `Player chose: "${choice.text}". Effects: ${choice.label ?? 'unknown'}.`
      generateDebounced(context, choice.text)
    },
    [addToHistory, generateDebounced]
  )

  return { generateNarrative: generateDebounced, handleChoice, isGenerating }
}

// ─── Fallback narratives (used when API is unavailable) ──────────────────────

function createFallbackEvent(name: string, _trigger?: string): StoryEvent {
  const events = [
    {
      content: `The city never sleeps, ${name}. Tonight, a tip arrives from one of your informants — Lorenzo Bianchi has been found dead at the docks. Authorities call it an accident. The streets call it something else entirely. Ricci leans across the heavy mahogany desk, the smoke from his cigar curling into the dim light. He looks at you with eyes that have seen too much blood.`,
      choices: [
        { id: 'c1', text: '"Send flowers... and a cleanup crew."', effects: [], label: '+5 Loyalty, +10 Suspicion' },
        { id: 'c2', text: '"Let the police finish their work."', effects: [], label: '+15 Diplomacy, -5 Loyalty' }
      ]
    },
    {
      content: `Word reaches you that the Moretti clan is expanding northward. Their men were spotted near your best lieutenant's home last Tuesday. Either it's a message, or it's reconnaissance. Either way, ${name}, you can't afford to wait.`,
      choices: [
        { id: 'c1', text: '"Send a crew to watch their movements."', effects: [], label: '+10 Intelligence, -5 Heat' },
        { id: 'c2', text: '"Strike first. Burn their operation."', effects: [], label: '+20 Territory, +30 Heat' }
      ]
    },
    {
      content: `The mayor's aide arrives unannounced — never a good sign. Inside the envelope: photographs of your men near the dockside warehouse. Someone has been watching, ${name}.`,
      choices: [
        { id: 'c1', text: '"Tell the mayor we pay. This time."', effects: [], label: '-75,000 Lira, +20 Safety' },
        { id: 'c2', text: '"Show him the other envelope."', effects: [], label: '+30 Leverage, +15 Suspicion' }
      ]
    }
  ]

  const random = events[Math.floor(Math.random() * events.length)]
  return {
    id: crypto.randomUUID(),
    content: random.content,
    choices: random.choices,
    timestamp: new Date().toISOString(),
    chapter: 1
  }
}

function getDefaultChoices(): Choice[] {
  return [
    { id: 'c1', text: 'Act swiftly and decisively.', effects: [], label: '+15 Heat, +10 Territory' },
    { id: 'c2', text: 'Exercise caution. Observe.', effects: [], label: '-5 Heat, +5 Intelligence' }
  ]
}
