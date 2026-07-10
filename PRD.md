# EMBER — Your Abandoned Passions Get a Voice

**PRD v2.0 · DEV Weekend Challenge: Passion Edition · July 10–13, 2026**

---

## 1. One-liner

> Everyone has a guitar in the closet, a novel stuck at chapter 3, a pair of running shoes gathering dust. Ember gives that abandoned passion a literal voice — it talks to you, asks why you left, and either negotiates its revival or lets you say a proper goodbye.

Not an app about passion. An app about the passions we quit — the half of the theme nobody else will touch.

---

## 2. Why this wins (the honest calculus)

**The field:** a weekend challenge themed "passion" during the World Cup will be flooded with (a) World Cup companion apps — the brief literally suggests them, (b) hobby trackers, (c) "AI rates my passion" toys. Judges will read 100+ posts. The winner is the one they *remember* and *tell each other about*.

**Ember's edge:**

1. **Inverted theme interpretation.** "Passion" → everyone builds celebration. Ember builds *grief and rekindling*. Judges scoring "creativity/original interpretation" have an easy justification to rank it first.
2. **Universally personal.** Every judge HAS an abandoned passion. The demo isn't hypothetical to them — they'll try it with their own closet-guitar and feel something. Products that make judges feel something win.
3. **Compelling with exactly one user.** No leaderboard that looks dead, no network effect needed. One 3-minute session is the whole pitch.
4. **The writeup writes itself.** "I built an app that let my abandoned guitar confront me. It won the argument." That title gets clicked, upvoted, and remembered — and writing quality is 1/5 of the judging.
5. **Each sponsor tech is used at flagship depth, not chained as a gimmick** (see §3).

**Emotional arc of the demo:** confession → conversation (it *answers back*) → verdict (eulogy or revival) → pledge (on-chain, with teeth) → the Atlas (you're not alone — humanity's map of abandoned dreams).

---

## 3. Five-category strategy — flagship-depth per tech

Enter all four tech categories + overall. (DEV rule: one submission may enter multiple categories, wins at most once — five independent shots.)

| Category | Integration | Why it beats other entries in that category |
|---|---|---|
| **ElevenLabs** | **Conversational AI Agent** — the abandoned passion IS a live voice agent. You *talk* to it in real time; it has a designed voice matching its character (a weary upright piano; defiant running shoes). Uses ElevenLabs Agents platform + voice design + expressive audio tags. | Everyone else will do TTS playback. A real-time voice *conversation with a character* is the flagship ElevenLabs product used as intended — and it's the emotional core of the app, not a feature. |
| **Google AI** | Gemini does the cognition: (1) builds the passion's **persona** from your confession (voice/personality/grudges/hopes → agent system prompt), (2) structured extraction of your story (`{passion, years_dormant, abandonment_reason, emotional_tone}`), (3) writes the **eulogy** or the **revival negotiation terms**, (4) generates Atlas insights, (5) moderation. | Not "Gemini as chatbot" — Gemini as the persona-compiler and narrative engine behind another AI. Layered, structured, multimodal (accepts a photo of the dusty guitar as confession input). |
| **Snowflake** | **The Atlas of Abandoned Passions** — every anonymized session lands in Snowflake; live analytics: what humanity abandons most, at what age, killed by what (time/money/fear/life-event), revival-pledge rate, eulogy-vs-rekindle split. Cortex `AI_AGG` produces per-category insight blurbs ("Musicians quit at 24; parents of newborns quit everything except cooking"). | It's not a bolted-on leaderboard — it's a *data story about the human condition* that only aggregation can tell. Judges see Snowflake doing what Snowflake is for. |
| **Solana** | **The Revival Pledge** — if you choose to rekindle, the passion negotiates one tiny concrete step ("10 minutes, Sunday"). You sign it on-chain: a timestamped pledge (memo + cNFT badge). Stretch: micro-stake escrow — lock 0.05 devnet SOL, reclaim on check-in. Closure path mints a **Eulogy stone** instead: a permanent, dignified goodbye. | Reframes "mint an NFT" (what everyone does) into an *accountability primitive* — blockchain used for what it's uniquely good at: unforgeable public commitment. The eulogy mint is the memorable twist: on-chain closure. |
| **Overall** | The loop is one coherent story: **confess → converse → decide → commit → belong.** | Cohesion + originality + emotion = overall-winner profile. |

---

## 4. User journey (the 3-minute session)

1. **The Confession** — "What did you abandon?" Type, speak, or upload a photo of the dusty thing. A few gentle follow-ups (when did you start, when did you stop, what killed it).
2. **The Compilation** — Gemini forges the persona: name, temperament (bitter? patient? hopeful?), memories you gave it, a matched ElevenLabs voice. Loading state shows fragments: *"…remembering the callouses on your fingertips…"*
3. **The Conversation** — the screen dims. Your passion speaks first: *"Three years. You walked past me every day for three years."* Live voice conversation, 3–6 turns. It asks the question only it can ask: *why?* It rebuts your excuses with your own confession details.
4. **The Verdict** — the passion offers two doors:
   - **Rekindle** → it negotiates the smallest possible first step. You accept → Solana pledge signed, badge minted, check-in scheduled.
   - **Lay to rest** → Gemini writes a personal eulogy, ElevenLabs reads it, an on-chain Eulogy stone gives it permanence. *Closure is a feature.*
5. **The Atlas** — your (anonymized) passion joins the global map. "You're the 214th person to shelve a guitar. 31 rekindled theirs this month."

**Judge-friendly paths (non-negotiable):** text-only mode (no mic), demo-wallet mode (no Phantom), and a pre-recorded "session replay" on the landing page so a judge sees the magic in 60s without doing anything.

---

## 5. Features

### MVP (ship by Sat night)
- **F1 Confession intake** — text + voice + optional photo; Gemini structured extraction.
- **F2 Persona compiler** — Gemini → agent config (system prompt, opening line, voice selection from a curated set of 6 ElevenLabs voices mapped to temperament). Includes **embodiment selection** — the compiler picks *what speaks* based on the confession:
  - `object` — the physical artifact (the guitar, the bat, the camera) — best when a specific dusty object exists
  - `the_passion_itself` — the activity personified (cricket, writing, the sea) — for sports/practices with no single object
  - `younger_self` — the version of you who did it — highest emotional stakes; use when the confession is identity-heavy ("I was going to go pro")
  - Embodiment changes voice, opening line, and negotiation style (e.g., cricket's rekindle step is "one hour of nets this weekend," not "10 minutes alone in a room").
- **F3 The Conversation** — ElevenLabs Conversational AI agent, dynamically configured per session; text-chat fallback with TTS per message if realtime integration fights back (descope rung, still category-worthy).
- **F4 Verdict flow** — eulogy generation + voiced reading; or revival negotiation with concrete micro-step.
- **F5 Solana pledge/eulogy mint** — devnet; memo-program attestation `{passion, step, deadline, hash}` + cNFT badge; wallet-adapter + demo-vault path.
- **F6 The Atlas** — Snowflake-backed dashboard: top abandoned passions, abandonment-reason breakdown, dormancy-years histogram, rekindle rate. Seeded with ~40 real entries (friends, own history, the World Cup-adjacent "I quit playing football at 15" entries — subtle theme tie-in).

### Stretch
- **S1** Cortex AI_AGG insight blurbs on the Atlas.
- **S2** Check-in flow: return after doing the 10 minutes → passion *reacts* ("You came back.") → escrow releases.
- **S3** Shareable session cards (OG images) — the passion's best line as a quote card.

### Out of scope
Auth, mainnet, mobile apps, multi-passion profiles, notifications beyond one scheduled check-in email.

---

## 6. Architecture

```
Next.js 15 (Vercel)
 ├─ /            landing + 60s replay + "Begin confession"
 ├─ /session     confession → conversation → verdict (single stateful flow)
 ├─ /atlas       Snowflake dashboard
 ├─ /stone/[id]  pledge or eulogy permalink (on-chain proof link)
 └─ /api
     ├─ /confess   Gemini extraction + persona compile → agent config
     ├─ /agent     ElevenLabs Agents session token / signed URL
     ├─ /verdict   Gemini eulogy or negotiation terms
     ├─ /pledge    Solana devnet tx (memo + cNFT)
     └─ /atlas     Snowflake aggregates (cached 60s)
```

Stack: Next.js App Router + Tailwind + shadcn; `@google/genai`; ElevenLabs Agents SDK (`@elevenlabs/react`); `snowflake-sdk` server-side; `@solana/web3.js` + wallet-adapter + Metaplex Bubblegum.
Storage: Vercel Blob for audio artifacts; hashes in Snowflake + on-chain.
⚠️ Build in `~/n/ember` (not `~/Documents` — iCloud hang).

**Design direction:** dark, warm, ember-glow palette; serif display type; slow breathing animations. This should feel like a séance, not a SaaS. (Run `/brand-design` before frontend work.)

---

## 7. Snowflake schema

```sql
CREATE TABLE sessions (
  id                 STRING DEFAULT UUID_STRING(),
  passion_category   STRING,   -- music|sport|writing|art|craft|language|other
  passion_label      STRING,   -- 'guitar', 'novel', 'marathon running'
  years_active       NUMBER,
  years_dormant      NUMBER,
  abandonment_reason STRING,   -- time|money|fear|injury|life_event|lost_joy|other
  age_at_abandonment NUMBER,
  emotional_tone     STRING,   -- wistful|bitter|guilty|peaceful
  verdict            STRING,   -- rekindled|laid_to_rest|undecided
  pledge_tx          STRING,
  checked_in         BOOLEAN DEFAULT FALSE,
  created_at         TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);
```

Atlas queries: most-abandoned by category, reason × age heatmap, dormancy distribution, rekindle rate, "revived this week" counter. Cortex (stretch) summarizes free-text confessions per category.

---

## 8. Build plan (deadline Sun Jul 13, 6:59 AM UTC ≈ Sun 12:29 PM IST)

| Slot | Work | Gate |
|---|---|---|
| **Fri night** | Keys: Google AI, ElevenLabs (Agents enabled), Snowflake trial, devnet wallet. Scaffold. Gemini extraction + persona compile working on text input. | Persona JSON out of a confession |
| **Sat AM** | ElevenLabs agent session with dynamic persona; the conversation works end-to-end (text fallback built simultaneously). | I talked to my abandoned passion |
| **Sat PM** | Verdict flow (eulogy + negotiation); Solana pledge memo+mint; Snowflake insert + Atlas queries. | Full loop on localhost |
| **Sat night** | Atlas dashboard UI; seed 40 real sessions; `/stone/[id]` permalinks. | Deployed to Vercel |
| **Sun AM** | Polish, session-replay recording for landing, OG cards, demo-wallet + text-only paths verified. | A judge with no mic/wallet completes the loop |
| **Sun PM** | 90s demo video (record a REAL session — my own abandoned passion, unscripted), submission post, submit with ≥12h buffer. | Submitted |

**Descope ladder (in order):** S-features → realtime voice agent→turn-based chat+TTS → cNFT→memo-only attestation → photo input→text only. **Never descope:** the conversation, the two-door verdict, the Atlas, the pledge.

---

## 9. Submission post (20% of the score — treat as a feature)

- **Title:** *"My Abandoned Guitar Confronted Me — So I Built It a Voice (and Signed a Peace Treaty On-Chain)"*
- Open with the real transcript of my own first session — the actual moment the agent said something that landed. Authenticity beats feature lists.
- Official template sections; **declare all four prize categories**, one subsection each explaining why that tech was the *right* tool (agents-as-characters, Gemini as persona-compiler, Snowflake as the human-condition dataset, Solana as commitment device).
- Embed: 90s video, one Atlas screenshot with real data, one audio clip of the eulogy reading, Solana explorer link, live app link.
- End with an invitation: *"What's in your closet? The Atlas is waiting."* — drives comment engagement, which judges see.
- Tags: `#weekendchallenge` `#devchallenge` + tech tags.

## 10. Demo video script (90s)

1. Cold open, real footage: a dusty guitar in a corner. "I bought this in 2019. I haven't tuned it since 2022." (10s)
2. The confession — typing "my guitar" — persona compiling animation. (10s)
3. **The moment:** the guitar speaks, voice fills the room. Unscripted 2-turn exchange. Let the silence after its question sit. (30s)
4. The verdict: choose Rekindle. It negotiates: "Ten minutes. Sunday. That's all I ask." Sign the pledge → Solana explorer. (20s)
5. The Atlas: "1 of 214 shelved guitars. 31 rekindled this month." (10s)
6. Card: EMBER — every abandoned passion still glows. Four tech logos in the pipeline. (10s)

## 11. Risks

| Risk | Mitigation |
|---|---|
| ElevenLabs Agents realtime integration eats Saturday | Timebox to 4h; fallback = turn-based chat with per-message TTS (still voiced, still category-strong); build fallback path first, upgrade to realtime |
| Dynamic per-session agent config unsupported/fiddly | One pre-built agent + persona injected via dynamic variables / conversation-override — supported pattern; verify Friday night |
| Free-tier credit burn | Cap conversations at 6 turns, cache eulogy audio, curated 6-voice set (no per-user voice cloning) |
| Emotional tone lands as cringe instead of moving | Persona prompt rules: never guilt-trip, wry > weepy, it *misses* you rather than blames you; test on 3 friends Sat night |
| Snowflake trial friction | Provision Friday night before writing code; it's the system of record, so it goes in first, not last |
| Judge can't/won't talk to a mic | Text mode is first-class; landing-page replay shows the voiced experience without participation |
