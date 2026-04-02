import type { VercelRequest, VercelResponse } from '@vercel/node'

// ─── Types ───────────────────────────────────────────────────────────────────

interface GenerateRequestBody {
  playerName: string
  familyName: string
  rank: string
  wealth: number
  heat: number
  context: string
  trigger?: string
}

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

// ─── Constants ───────────────────────────────────────────────────────────────

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL = 'mistralai/mistral-7b-instruct:free'

const SYSTEM_PROMPT = `You are the narrative engine of "Il Consigliere" — a 1940s noir mafia RPG.
You write in the style of a gritty, atmospheric crime novel: short punchy sentences, heavy with dread and dark wit.
Never break character. Always write in second person ("you"). 
Every response must include:
1. A narrative paragraph (3-5 sentences) describing what happens
2. A tense line of dialogue from an NPC
3. Two choices the player can make (each with a code like +5 Loyalty, -10 Suspicion)
Format your response as JSON: { "narrative": "...", "dialogue": "...", "speaker": "...", "choices": [{"text": "...", "effects": "...", "label": "..."}] }
Keep the world morally grey. Every choice has consequences.`

// ─── Allowed origins (update with your real Vercel domain) ───────────────────
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
  process.env.ALLOWED_ORIGIN ?? ''
].filter(Boolean)

// ─── Handler ─────────────────────────────────────────────────────────────────

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // ── CORS ──────────────────────────────────────────────────────────────────
  const origin = req.headers.origin ?? ''
  const isAllowed =
    ALLOWED_ORIGINS.includes(origin) ||
    // Allow all preview deployments on your own Vercel project
    /\.vercel\.app$/.test(origin)

  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // ── API key check (server-side only — never sent to client) ───────────────
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    console.error('[generate] OPENROUTER_API_KEY env var is not set')
    return res.status(500).json({ error: 'AI service not configured' })
  }

  // ── Validate request body ─────────────────────────────────────────────────
  const body = req.body as Partial<GenerateRequestBody>

  if (!body?.context) {
    return res.status(400).json({ error: 'Missing required field: context' })
  }

  const {
    playerName = 'Don',
    familyName = 'Corleone',
    rank = 'Capo',
    wealth = 1200000,
    heat = 40,
    context,
    trigger
  } = body

  // ── Build prompt ──────────────────────────────────────────────────────────
  const userMessage = [
    `Player: ${playerName} of the ${familyName} family.`,
    `Rank: ${rank}.`,
    `Wealth: ${wealth} Lira.`,
    `Heat: ${heat}.`,
    `Context: ${context}.`,
    trigger ? `Recent event: ${trigger}` : ''
  ]
    .filter(Boolean)
    .join(' ')

  const messages: OpenRouterMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userMessage }
  ]

  // ── Call OpenRouter ───────────────────────────────────────────────────────
  try {
    const upstream = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        // Required by OpenRouter — use the production URL in production
        'HTTP-Referer': process.env.ALLOWED_ORIGIN ?? 'https://il-consigliere.vercel.app',
        'X-Title': 'Il Consigliere'
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.85,
        max_tokens: 500
      })
    })

    if (!upstream.ok) {
      const errorText = await upstream.text()
      console.error('[generate] OpenRouter error:', upstream.status, errorText)
      return res.status(502).json({ error: 'AI upstream error', detail: upstream.status })
    }

    const data = (await upstream.json()) as OpenRouterResponse
    const text = data.choices?.[0]?.message?.content ?? ''

    // Return raw text — parsing stays in useAIGenerator.ts on the client
    return res.status(200).json({ text })
  } catch (err) {
    console.error('[generate] Unexpected error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
