import Link from "next/link";

export default function Landing() {
  return (
    <main className="mx-auto max-w-3xl px-6">
      <section className="flex flex-col items-center pt-24 pb-20 text-center">
        <div className="ember-dot mb-10 h-4 w-4 rounded-full bg-amber-400 shadow-[0_0_60px_18px_rgba(245,158,11,0.35)]" />
        <h1 className="font-display glow-text text-5xl leading-tight text-stone-100 sm:text-6xl">
          The guitar in your closet
          <br />
          <span className="text-amber-400">has something to say.</span>
        </h1>
        <p className="mt-8 max-w-xl text-lg leading-relaxed text-stone-400">
          Everyone has an abandoned passion — the bat, the novel at chapter three, the
          running shoes. <span className="text-stone-200">Ember gives it a voice.</span>{" "}
          It talks to you, asks why you left, and either negotiates its revival or lets
          you say a proper goodbye.
        </p>
        <Link
          href="/session"
          className="mt-12 rounded-full bg-amber-500 px-8 py-4 font-medium text-stone-950 transition hover:bg-amber-400 hover:shadow-[0_0_40px_rgba(245,158,11,0.4)]"
        >
          Begin your confession
        </Link>
        <p className="mt-4 text-xs text-stone-600">3 minutes · no account · headphones recommended</p>
      </section>

      <section className="grid gap-6 pb-24 sm:grid-cols-3">
        {[
          {
            n: "01",
            t: "Confess",
            d: "Tell it what you abandoned and why. Gemini forges its persona — the object, the game itself, or the younger you.",
          },
          {
            n: "02",
            t: "Converse",
            d: "It speaks — a real voice, via ElevenLabs. It remembers your details, and it asks the question only it can ask.",
          },
          {
            n: "03",
            t: "Decide",
            d: "Rekindle it with a tiny pledge sealed on Solana — or lay it to rest with a voiced eulogy and an on-chain stone.",
          },
        ].map((s) => (
          <div key={s.n} className="rise-in rounded-2xl border border-stone-800 bg-stone-900/40 p-6">
            <div className="font-display text-sm text-amber-500">{s.n}</div>
            <div className="mt-2 font-display text-xl text-stone-100">{s.t}</div>
            <p className="mt-3 text-sm leading-relaxed text-stone-400">{s.d}</p>
          </div>
        ))}
      </section>

      <section className="mb-24 rounded-2xl border border-stone-800 bg-gradient-to-b from-stone-900/60 to-stone-950 p-8 text-center">
        <h2 className="font-display text-2xl text-stone-100">The Atlas of Abandoned Passions</h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-stone-400">
          Every confession joins an anonymized global map, aggregated in Snowflake — what
          humanity gives up, at what age, killed by what. You are not alone in the closet.
        </p>
        <Link href="/atlas" className="mt-6 inline-block text-sm text-amber-400 hover:text-amber-300">
          Explore the Atlas →
        </Link>
      </section>
    </main>
  );
}
