import { useCallback, useRef } from 'react'
import { useGameStore } from '@/store/gameStore'
import type { StoryEvent, Choice } from '@/types'

const SYSTEM_PROMPT = `You are the narrative engine of "Il Consigliere" — a 1940s noir mafia RPG.
You write in the style of a gritty, atmospheric crime novel: short punchy sentences, heavy with dread and dark wit.
Never break character. Always write in second person ("you"). 
Every response must include:
1. A narrative paragraph (3-5 sentences) describing what happens
2. A tense line of dialogue from an NPC
3. Two choices the player can make (each with a code like +5 Loyalty, -10 Suspicion)
Format your response as JSON: { "narrative": "...", "dialogue": "...", "speaker": "...", "choices": [{"text": "...", "effects": "...", "label": "..."}] }
Keep the world morally grey. Every choice has consequences.`

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'

export function useAIGenerator() {
  const { player, setCurrentEvent, addToHistory, setIsGenerating, isGenerating, addLedgerEntry, addIntelReport } = useGameStore()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const generateNarrative = useCallback(async (context: string, trigger?: string) => {
    if (isGenerating) return
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY as string
    if (!apiKey) {
      // Fallback demo narrative
      const fallback = createFallbackEvent(player?.name ?? 'Consigliere', trigger)
      setCurrentEvent(fallback)
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Il Consigliere'
        },
        body: JSON.stringify({
          model: 'mistralai/mistral-7b-instruct:free',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: `Player: ${player?.name ?? 'Don'} of the ${player?.familyName ?? 'Corleone'} family. Rank: ${player?.rank ?? 'Capo'}. Wealth: ${player?.wealth ?? 1200000} Lira. Heat: ${player?.heat ?? 40}. Context: ${context}. ${trigger ? `Recent event: ${trigger}` : ''}` }
          ],
          temperature: 0.85,
          max_tokens: 500
        })
      })

      if (!response.ok) throw new Error('AI request failed')
      const data = await response.json() as { choices: Array<{ message: { content: string } }> }
      const text = data.choices[0]?.message.content ?? ''

      let parsed: { narrative?: string; dialogue?: string; speaker?: string; choices?: Array<{ text: string; effects: string; label: string }> } = {}
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) parsed = JSON.parse(jsonMatch[0]) as typeof parsed
      } catch {
        parsed = {}
      }

      const event: StoryEvent = {
        id: crypto.randomUUID(),
        content: parsed.narrative ?? text,
        choices: (parsed.choices ?? []).map((c, i): Choice => ({
          id: `c${i}`,
          text: c.text,
          effects: [],
          label: c.effects ?? c.label
        })),
        timestamp: new Date().toISOString(),
        chapter: 1
      }

      if (!event.choices.length) {
        event.choices = getDefaultChoices()
      }

      setCurrentEvent(event)
    } catch (err) {
      console.error('AI generation error:', err)
      const fallback = createFallbackEvent(player?.name ?? 'Consigliere', trigger)
      setCurrentEvent(fallback)
    } finally {
      setIsGenerating(false)
    }
  }, [player, isGenerating, setCurrentEvent, setIsGenerating, addLedgerEntry, addIntelReport])

  const generateDebounced = useCallback((context: string, trigger?: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => generateNarrative(context, trigger), 300)
  }, [generateNarrative])

  const handleChoice = useCallback((choice: Choice, currentEvent: StoryEvent) => {
    addToHistory(currentEvent)
    const context = `Player chose: "${choice.text}". Effects: ${choice.label ?? 'unknown'}.`
    generateDebounced(context, choice.text)
  }, [addToHistory, generateDebounced])

  return { generateNarrative: generateDebounced, handleChoice, isGenerating }
}

function createFallbackEvent(name: string, _trigger?: string): StoryEvent {
  const events = [
    {
      content: `The city never sleeps, ${name}. Tonight, a tip arrives from one of your informants — Lorenzo Bianchi has been found dead at the docks. Authorities call it an accident. The streets call it something else entirely. Ricci leans across the heavy mahogany desk, the smoke from his cigar curling into the dim light. He looks at you with eyes that have seen too much blood.`,
      dialogue: '"The void he leaves is a vacuum, Consigliere. And you know what happens to a vacuum in this city. The question is... will it be us, or will it be the wolves?"',
      speaker: 'Vincenzo Ricci',
      choices: [
        { id: 'c1', text: '"I loved Sig. Bianchi like a brother. Send flowers... and a cleanup crew."', effects: [], label: '+5 Loyalty with Ricci, +10 Suspicion' },
        { id: 'c2', text: '"I will not heed these comments. Let the police finish their work."', effects: [], label: '+15 Diplomacy, -5 Loyalty with Ricci' }
      ]
    },
    {
      content: `Word reaches you that the Moretti clan is expanding northward. Their men were spotted near your best lieutenant's home last Tuesday. Either it's a message, or it's reconnaissance. Either way, ${name}, you can't afford to wait. The shadows in the hallway feel heavier than usual tonight.`,
      dialogue: '"We move now, or we move never. Every hour we deliberate is an hour they gain ground."',
      speaker: 'Carlo Esposito',
      choices: [
        { id: 'c1', text: '"Send Esposito\'s crew to watch their movements. Patience is power."', effects: [], label: '+10 Intelligence, -5 Heat' },
        { id: 'c2', text: '"Strike first. Burn their operation in the harbor."', effects: [], label: '+20 Territory Control, +30 Heat' }
      ]
    },
    {
      content: `The mayor\'s aide arrives unannounced — never a good sign. He places a manila envelope on your desk without a word. Inside: photographs of your men near the dockside warehouse. Someone has been watching, ${name}. The question isn\'t who. The question is how long they\'ve known.`,
      dialogue: '"The mayor extends his... professional courtesies. He asks only for a modest arrangement. Something mutually beneficial."',
      speaker: 'Mayor\'s Aide',
      choices: [
        { id: 'c1', text: '"Tell the mayor his silence has a price. We pay. This time."', effects: [], label: '-75,000 Lira, +20 Political Safety' },
        { id: 'c2', text: '"Show him the other envelope. The one with his photographs."', effects: [], label: '+30 Leverage, +15 Suspicion' }
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
