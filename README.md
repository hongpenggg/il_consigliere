# il_consigliere

A mafia strategy game with:
- Python story/game prototype (`/Il Consigliere/game.py`)
- React + Supabase web app (`/src`)

## New narrative systems (Suzerain-style roadmap update)

The React app now includes:

- **Interactive War Room map upgrades**
  - Territory click now triggers territory-specific narrative brief generation
  - Animated heat pulse for high-resistance territories
  - Neglect pressure: player-held territories can drift to `Contested` if ignored
  - Region-switch cinematic title card: **CROSSING THE ATLANTIC**

- **Deep NPC relationship layer**
  - Family members now include ideology tags (`loyalist`, `opportunist`, `reformist`, `ruthless`)
  - Dialogue tone memory per NPC (`INTIMIDATE`, `NEGOTIATE`, `DEFER`, `BRIBE`)
  - Betrayal warning event path when low loyalty combines with high suspicion
  - Familiarity-based hidden intel unlock for trusted characters

- **Philosophy-driven consequence feedback**
  - Dialogue choices now infer tone tags and shift philosophy axes
  - Live philosophy meter feedback in Dialogue screen
  - Hidden story route flags unlock when philosophy thresholds are crossed

- **Weekly turn cadence + narrative pressure**
  - Week/season/year progression with a “The Clock Is Ticking” header
  - Actions can advance week and trigger delayed world pressure
  - Periodic personal-life interruption events on the main game hub

- **Newspaper + chronicle loop**
  - Weekly “Il Corriere” issues are generated and stored
  - Ledger now includes a **Chronicle** tab to review prior issues

- **Commission political layer**
  - Commission factions tracked in state (Old Families / Expansionists / Politicians)
  - Monthly-style vote action in Game screen with majority outcome reporting

## Run the React app

```bash
npm install
npm run dev
```

Create `.env` from `.env.example` first.

## Google authentication setup (Supabase + Google Cloud)

### 1) Configure Google OAuth in Google Cloud
1. Go to Google Cloud Console → **APIs & Services** → **Credentials**.
2. Create OAuth client credentials:
   - Application type: **Web application**
   - Authorized redirect URIs:
     - `https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback`
3. Copy the generated **Client ID** and **Client Secret**.

### 2) Configure Google provider in Supabase
1. Go to Supabase Dashboard → **Authentication** → **Providers** → **Google**.
2. Enable Google provider.
3. Paste Google **Client ID** and **Client Secret** from step 1.
4. Save.

### 3) Configure allowed redirect URLs in Supabase
1. Supabase Dashboard → **Authentication** → **URL Configuration**.
2. Set Site URL (local example): `http://localhost:5173`
3. Add additional redirect URLs for all environments you use, e.g.:
   - `http://localhost:5173`
   - `https://<your-vercel-domain>`

### 4) Frontend environment variables
In `.env`:
```bash
VITE_SUPABASE_URL=https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co
VITE_SUPABASE_ANON_KEY=<YOUR_SUPABASE_ANON_KEY>
```

### 5) Test
1. Run `npm run dev`
2. Open `/auth`
3. Click **Continue with Google**
4. Complete Google sign-in and verify redirect back to `/`

## Server-side env vars for `/api/generate`

Set these in your deployment environment (and local `.env` if using Vercel dev):

```bash
OPENROUTER_API_KEY=<openrouter key>
SUPABASE_URL=https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<YOUR_SUPABASE_SERVICE_ROLE_KEY>
UPSTASH_REDIS_REST_URL=<upstash redis rest url>
UPSTASH_REDIS_REST_TOKEN=<upstash redis rest token>
ALLOWED_ORIGIN=https://<your-vercel-domain>
```
