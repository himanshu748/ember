import Link from "next/link";
import { atlasStats } from "@/lib/store";

export const dynamic = "force-dynamic";

const HERO_IMAGE =
  "https://d8j0ntlcm91z4.cloudfront.net/user_318C23nPR0PT9UTOdpsLk2Xj8ig/hf_20260710_042119_8f518ebb-cb3b-4e62-ba4a-33106625104d.png";

// Deterministic ember motes (position, timing) so SSR/CSR markup match.
const MOTES = [
  { l: "12%", t: 9, d: 0, x: 26, o: 0.6, s: 3 },
  { l: "28%", t: 12, d: 2.4, x: -18, o: 0.45, s: 2 },
  { l: "46%", t: 10, d: 1.1, x: 14, o: 0.7, s: 2.5 },
  { l: "63%", t: 13, d: 3.6, x: -24, o: 0.5, s: 2 },
  { l: "78%", t: 11, d: 0.7, x: 20, o: 0.65, s: 3 },
  { l: "90%", t: 14, d: 2.0, x: -12, o: 0.4, s: 2 },
];

export default async function Landing() {
  const stats = await atlasStats().catch(() => null);

  return (
    <main>
      {/* ---- Hero ---- */}
      <section className="relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO_IMAGE}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/70 via-stone-950/55 to-stone-950" />
        {MOTES.map((m, i) => (
          <span
            key={i}
            aria-hidden
            className="drift absolute bottom-[12%] rounded-full bg-amber-400"
            style={{
              left: m.l,
              width: m.s,
              height: m.s,
              boxShadow: "0 0 8px 2px rgba(245,158,11,0.5)",
              ["--mote-t" as string]: `${m.t}s`,
              ["--mote-d" as string]: `${m.d}s`,
              ["--mote-x" as string]: `${m.x}px`,
              ["--mote-o" as string]: m.o,
            }}
          />
        ))}

        <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 pb-28 pt-28 text-center sm:pt-36">
          <p className="rise-in mb-8 rounded-full border border-amber-500/25 bg-amber-500/[0.07] px-4 py-1.5 text-xs tracking-[0.22em] text-amber-300/90 uppercase">
            Every abandoned passion still glows
          </p>
          <h1 className="font-display glow-text text-balance text-5xl leading-[1.08] text-stone-100 sm:text-7xl">
            The guitar in your closet
            <br />
            <span className="text-amber-400">has something to say.</span>
          </h1>
          <p className="mt-8 max-w-xl text-pretty text-lg leading-relaxed text-stone-300/90">
            The bat. The novel at chapter three. The running shoes.{" "}
            <span className="text-stone-100">Ember gives what you quit a voice</span> — it asks why
            you left, then negotiates its revival or lets you say a proper goodbye.
          </p>
          <Link
            href="/session"
            className="mt-12 rounded-full bg-amber-500 px-9 py-4 font-medium text-stone-950 shadow-[0_0_30px_rgba(245,158,11,0.25)] transition-all hover:bg-amber-400 hover:shadow-[0_0_50px_rgba(245,158,11,0.45)]"
          >
            Begin your confession
          </Link>
          <p className="mt-4 text-xs tracking-wide text-stone-500">
            3 minutes · no account · headphones recommended
          </p>
        </div>
      </section>

      {/* ---- How it works ---- */}
      <section className="mx-auto max-w-4xl px-6 pt-4 pb-20">
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            {
              n: "I",
              t: "Confess",
              d: "Tell it what you abandoned. Gemini forges its persona — the object, the game itself, or the younger you.",
            },
            {
              n: "II",
              t: "Converse",
              d: "It speaks — a real voice, via ElevenLabs. It remembers your details and asks the question only it can ask.",
            },
            {
              n: "III",
              t: "Decide",
              d: "Rekindle it with a tiny pledge sealed on Solana — or lay it to rest with a spoken eulogy and a permanent stone.",
            },
          ].map((s) => (
            <div
              key={s.n}
              className="group rounded-2xl border border-stone-800/80 bg-stone-900/30 p-7 transition-all duration-300 hover:border-amber-700/50 hover:bg-stone-900/60 hover:shadow-[0_0_40px_rgba(245,158,11,0.07)]"
            >
              <div className="font-display text-sm tracking-[0.3em] text-amber-500/80">{s.n}</div>
              <div className="font-display mt-3 text-2xl text-stone-100">{s.t}</div>
              <p className="mt-3 text-sm leading-relaxed text-stone-400">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Atlas teaser ---- */}
      <section className="mx-auto max-w-4xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-stone-800 bg-gradient-to-b from-stone-900/70 to-stone-950 p-10 text-center sm:p-14">
          <div
            aria-hidden
            className="absolute left-1/2 top-0 h-40 w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/10 blur-3xl"
          />
          <h2 className="font-display relative text-3xl text-stone-100">
            The Atlas of Abandoned Passions
          </h2>
          <p className="relative mx-auto mt-4 max-w-lg text-sm leading-relaxed text-stone-400">
            Every confession joins an anonymized global map, aggregated live in Snowflake — what
            humanity gives up, at what age, killed by what.
          </p>
          {stats && stats.total > 0 && (
            <dl className="relative mx-auto mt-8 flex max-w-md items-stretch justify-center divide-x divide-stone-800">
              {[
                { v: stats.total, l: "confessed" },
                { v: stats.rekindled, l: "rekindled" },
                { v: `${stats.avgYearsDormant}y`, l: "avg dormant" },
              ].map((c) => (
                <div key={c.l} className="flex-1 px-6">
                  <dd className="font-display text-3xl text-amber-400">{c.v}</dd>
                  <dt className="mt-1 text-xs tracking-wide text-stone-500">{c.l}</dt>
                </div>
              ))}
            </dl>
          )}
          <Link
            href="/atlas"
            className="relative mt-9 inline-block rounded-full border border-amber-700/40 px-6 py-2.5 text-sm text-amber-300 transition-colors hover:bg-amber-950/40"
          >
            Explore the Atlas →
          </Link>
        </div>
      </section>
    </main>
  );
}
