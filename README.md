# EMBER 🔥 — every abandoned passion still glows

Your abandoned passions get a voice. Confess what you quit, talk to it, then
rekindle it with an on-chain pledge — or lay it to rest with a voiced eulogy.

Built for the **DEV Weekend Challenge: Passion Edition** (July 2026).

## The loop

**Confess → Converse → Decide → Commit → Belong**

1. **Confess** — tell it what you abandoned. **Gemini** extracts your story and
   forges the persona — picking *what speaks*: the object (your old bat), the
   passion itself (cricket, personified), or the younger you.
2. **Converse** — it talks back, with a real voice via **ElevenLabs**, matched
   to its temperament. It remembers your details and pushes past your first excuse.
3. **Decide** — two doors: **Rekindle** (it negotiates the smallest possible
   first step) or **Lay to rest** (a personal eulogy, spoken aloud).
4. **Commit** — the pledge or eulogy is attested on **Solana** devnet via the
   Memo program: a timestamped, unforgeable record.
5. **Belong** — your anonymized session joins the **Atlas of Abandoned
   Passions**, aggregated in **Snowflake**: what humanity gives up, at what
   age, killed by what.

## Run it

```bash
npm install
cp .env.example .env.local   # add keys — every integration degrades gracefully without them
node scripts/seed.mjs        # seed the Atlas
npm run dev
```

Graceful degradation (judge-friendly, no setup required):

| Missing | Behavior |
|---|---|
| `GEMINI_API_KEY` | Scripted demo persona (full flow still walkable) |
| `ELEVENLABS_API_KEY` | Text-only mode (first-class, not broken) |
| `SNOWFLAKE_*` | Atlas computed from local JSON store |
| Devnet airdrop rate-limited | Pledge recorded locally, labelled "pending on-chain" |

## Snowflake

Run [sql/schema.sql](sql/schema.sql) in a worksheet, then fill `SNOWFLAKE_*`
in `.env.local`. The Atlas switches from local aggregation to live Snowflake
queries automatically.

## Stack

Next.js 16 · Gemini (`@google/genai`) · ElevenLabs TTS · Snowflake SDK ·
`@solana/web3.js` (devnet Memo attestations) · Tailwind v4
