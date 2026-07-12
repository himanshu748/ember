export default function AtlasLoading() {
  return (
    <main className="mx-auto max-w-3xl px-6 pb-24 pt-14" aria-busy="true" aria-label="Loading the Atlas">
      <p className="text-[11px] uppercase tracking-[0.3em] text-amber-500/80">The Atlas</p>
      <h1 className="font-display mt-2 text-4xl text-stone-100">of Abandoned Passions</h1>
      <p className="mt-3 flex items-center gap-2 text-sm text-stone-500">
        <span className="ember-dot inline-block h-2 w-2 rounded-full bg-amber-400" />
        waking the warehouse, counting the closets…
      </p>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse rounded-2xl border border-stone-800/80 bg-stone-900/40 p-6">
            <div className="mx-auto h-9 w-14 rounded bg-stone-800" />
            <div className="mx-auto mt-3 h-3 w-24 rounded bg-stone-800/70" />
          </div>
        ))}
      </div>

      {[0, 1, 2].map((s) => (
        <section key={s} className="mt-14">
          <div className="mb-5 h-6 w-44 animate-pulse rounded bg-stone-800/80" />
          <div className="space-y-2.5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-4 w-36 animate-pulse rounded bg-stone-800/60" />
                <div className="h-6 flex-1 animate-pulse rounded-md bg-stone-900" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
