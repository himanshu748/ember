---
title: "My Abandoned Cricket Kit Confronted Me. So I Built It a Voice"
published: true
tags: devchallenge, weekendchallenge, ai, solana
cover_image: https://raw.githubusercontent.com/himanshu748/ember/main/assets/devto-cover.png
---

*This is a submission for the [DEV Weekend Challenge: Passion Edition](https://dev.to/challenges/weekend-2026-07-09).*

## What I Built

Everyone will tell you about the passions they have. Nobody talks about the ones they quit.

I played cricket every evening from age 11 to 17. I told everyone I'd play Ranji Trophy one day. Then the entrance exam years came, the bat went behind the cupboard, and I never went back. Eight years now.

**EMBER gives that abandoned passion a voice.** You confess what you quit. AI forges its persona: the dusty object, the game itself, or the younger you. Then it *talks back*, out loud, in a voice matched to its temperament. It asks the question only it can ask: *why did you really stop?*

Then it offers two doors:

- 🔥 **Rekindle it.** It negotiates the smallest possible first step ("Pick up your old bat and feel its weight. Sunday evening.") and you seal the pledge **on-chain**, where you can't quietly delete it.
- 🕯️ **Lay it to rest.** It says goodbye properly: a personal eulogy, spoken aloud, and a permanent on-chain stone. Closure is a feature, not a failure state.

Every anonymized session joins the **Atlas of Abandoned Passions**, a live map of what humanity gives up, at what age, and what killed it.

When I ran my own confession through it, the app decided my passion should speak as "**Your old cricket kit bag**." Its first words:

> "It's been a while since you hoisted me up here, hasn't it? I still remember the thrill of a good cover drive, too."

I built a thing and it emotionally wrecked me on the first test run. Working as intended.

## Demo

{% embed https://youtu.be/9ZJ2rCCzg0U %}

🔗 **Live app:** https://ember-himanshus-projects-acd54afd.vercel.app

Try it in two clicks: tap an example confession (cricket at 17, the closet guitar, the novel at chapter three), headphones on. The voice is the point.

![The things we leave behind](https://d8j0ntlcm91z4.cloudfront.net/user_318C23nPR0PT9UTOdpsLk2Xj8ig/hf_20260710_042119_8f518ebb-cb3b-4e62-ba4a-33106625104d.png)

My cricket pledge, sealed on Solana devnet (the memo reads: passion cricket, commitment: book one hour in the nets this week): [view the transaction](https://explorer.solana.com/tx/2de9Lj1o5xUDb8Hg6qKkRfaCYKaV1AFt8v1q7zpUDS4DBuUdijZaBNWiN3ozXHD2H6MB4CUjZvKkYJSavY68hmDK?cluster=devnet).

## Code

🔗 **Repo:** https://github.com/himanshu748/ember

## How I Built It

The loop is confess, converse, decide, commit, belong. Each stage is one sponsor technology doing what it is uniquely good at.

### Google AI (Gemini): the persona compiler

Gemini doesn't chat with you. It reads your confession and forges the character that will. Structured extraction of your story (`years_dormant`, `abandonment_reason`, `emotional_tone`), then an **embodiment decision**: should the *object* speak (the kit bag), the *passion itself* (cricket, personified), or *the younger you*? It writes the persona's system prompt, its opening line, every conversational reply, and finally the eulogy or the negotiated revival pact. Strict persona rules: it misses you, it never guilt-trips, wry beats weepy.

### ElevenLabs: the voice

The persona's temperament maps to a curated voice (wistful is Sarah, wry is George, bitter is Callum). Every line the passion speaks arrives as real audio. Hearing your abandoned passion say things out loud is the difference between a chatbot and a séance.

### Snowflake: the Atlas

Every session lands in a Snowflake `sessions` table, and the Atlas page is pure live SQL: most abandoned passions, what killed them, dormancy years, rekindle rate. Snowflake is also the system of record for session state. The app runs serverless, so persona and conversation context are reconstructed from Snowflake on every request.

### Solana: the commitment device

A pledge you can edit is a wish. When you choose to rekindle, Ember creates a dedicated on-chain account for your pledge and locks a real stake in it (0.01 SOL on devnet), with the commitment memo in the same transaction. Your pledge is not a database row. It is an address you can watch.

When you return to your stone and report that you did it, the persona reacts in its own voice and the stake settles into the public [Rekindled Pool](https://explorer.solana.com/address/BEsKKCCtvEGnfDtyu3BhESVP1j65AR4BvfPATbbmLVLv?cluster=devnet), with a fulfillment memo sealed against the original pledge in the same transaction. Commitment, stake, follow-up, settlement: the whole loop lives on chain. A commitment with a follow-up is a system, not a receipt. Want to verify the whole lifecycle in under a minute? A full example from a real session: the [pledge creation transaction](https://explorer.solana.com/tx/NyZj6z79tTj8nA29QngPBM1fEDCotZzaYNwNUpgWhE1iUosNHQWXyXqN6amEHq3RCn3fsevKT2X4BuWXJgZ7VRX?cluster=devnet) and the [fulfillment transaction](https://explorer.solana.com/tx/3vV4UJeS6eLSCx3eGsjW6KNmFympjNUkwWR3ursRNEwuLQtmc8E6wkQLaA27eMH9gN4VBq2z4pmQGho1bNaJmLGY?cluster=devnet). The Atlas claim is checkable via the [live API response](https://ember-himanshus-projects-acd54afd.vercel.app/api/atlas).

Eulogy stones remain permanent memorial attestations via the Memo program. No wallet needed: a server-side vault signs. A mainnet version would swap the vault for a wallet-signed escrow program.

A note on the economics, because it matters: devnet SOL is test currency with zero monetary value, and every stake is funded by Ember's own vault. Players never pay anything, never connect a wallet, and never have money at risk. On mainnet the model inverts, and that inversion is the whole point: the stake would be your own SOL, locked by your own wallet in an escrow program, and the only way to get it back would be to actually keep your pledge. Here the economics are simulated; the mechanics (funded pledge accounts, auditable settlement) are the real thing.

### Stack

Next.js 16 · `@google/genai` · ElevenLabs TTS · `snowflake-sdk` · `@solana/web3.js` · Tailwind v4

## Prize Categories

**Best Use of Google AI, Best Use of ElevenLabs, Best Use of Snowflake, Best Use of Solana.** The four aren't features bolted onto an app. Each one is a load-bearing stage of a single emotional pipeline.

---

There is a closet like yours in every house on earth. What's in yours? The Atlas is waiting. 🔥
