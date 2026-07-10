import { atlasStats } from "@/lib/store";

export const dynamic = "force-dynamic";

function Bar({ label, count, max, index }: { label: string; count: number; max: number; index: number }) {
  return (
    <div className="group flex items-center gap-4 text-sm">
      <div className="w-36 shrink-0 truncate text-right capitalize text-stone-400 transition-colors group-hover:text-stone-200">
        {label.replaceAll("_", " ")}
      </div>
      <div className="h-6 flex-1 overflow-hidden rounded-md bg-stone-900/80">
        <div
          className="bar-grow h-full rounded-md bg-gradient-to-r from-amber-800 via-amber-600 to-amber-400 opacity-90 transition-opacity group-hover:opacity-100"
          style={{
            width: `${Math.max(4, (count / Math.max(max, 1)) * 100)}%`,
            animationDelay: `${index * 70}ms`,
          }}
        />
      </div>
      <div className="w-8 font-mono text-xs text-stone-500">{count}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-14">
      <div className="mb-5 flex items-center gap-4">
        <h2 className="font-display shrink-0 text-2xl text-stone-100">{title}</h2>
        <span aria-hidden className="h-px flex-1 bg-gradient-to-r from-stone-800 to-transparent" />
      </div>
      {children}
    </section>
  );
}

export default async function Atlas() {
  const s = await atlasStats();
  const maxPassion = s.topPassions[0]?.count ?? 1;
  const maxReason = s.byReason[0]?.count ?? 1;
  const maxCat = s.byCategory[0]?.count ?? 1;

  return (
    <main className="mx-auto max-w-3xl px-6 pb-24 pt-14">
      <p className="text-[11px] uppercase tracking-[0.3em] text-amber-500/80">The Atlas</p>
      <h1 className="font-display mt-2 text-4xl text-stone-100">of Abandoned Passions</h1>
      <p className="mt-3 text-sm text-stone-500">
        Anonymized and aggregated {s.source === "snowflake" ? "live in Snowflake" : "locally (Snowflake pending)"} — what
        humanity gives up, and why.
      </p>

      {s.total === 0 ? (
        <div className="mt-16 rounded-3xl border border-stone-800 bg-stone-900/30 p-14 text-center">
          <div className="ember-dot mx-auto h-3 w-3 rounded-full bg-amber-400" />
          <p className="font-display mt-6 text-xl text-stone-300">The Atlas is empty — for now.</p>
          <p className="mt-2 text-sm text-stone-500">Be the first confession.</p>
          <a
            href="/session"
            className="mt-6 inline-block rounded-full bg-amber-500 px-6 py-2.5 text-sm font-medium text-stone-950 hover:bg-amber-400"
          >
            Begin →
          </a>
        </div>
      ) : (
        <>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { v: s.total, l: "passions confessed" },
              { v: s.rekindled, l: "rekindled" },
              { v: s.laidToRest, l: "laid to rest" },
              { v: s.avgYearsDormant, l: "avg years dormant" },
            ].map((c) => (
              <div
                key={c.l}
                className="rounded-2xl border border-stone-800/80 bg-stone-900/40 p-6 text-center transition-all duration-300 hover:border-amber-800/60 hover:shadow-[0_0_30px_rgba(245,158,11,0.06)]"
              >
                <div className="font-display text-4xl text-amber-400">{c.v}</div>
                <div className="mt-2 text-[11px] uppercase tracking-wide text-stone-500">{c.l}</div>
              </div>
            ))}
          </div>

          <Section title="Most abandoned">
            <div className="space-y-2.5">
              {s.topPassions.map((p, i) => (
                <Bar key={p.label} label={p.label} count={p.count} max={maxPassion} index={i} />
              ))}
            </div>
          </Section>

          <Section title="What killed them">
            <div className="space-y-2.5">
              {s.byReason.map((r, i) => (
                <Bar key={r.reason} label={r.reason} count={r.count} max={maxReason} index={i} />
              ))}
            </div>
          </Section>

          <Section title="By category">
            <div className="space-y-2.5">
              {s.byCategory.map((c, i) => (
                <Bar key={c.category} label={c.category} count={c.count} max={maxCat} index={i} />
              ))}
            </div>
          </Section>

          <div className="mt-16 text-center">
            <p className="font-display text-lg italic text-stone-400">
              There is a closet like yours in every house on earth.
            </p>
            <a
              href="/session"
              className="mt-5 inline-block rounded-full bg-amber-500 px-7 py-3 text-sm font-medium text-stone-950 transition-all hover:bg-amber-400 hover:shadow-[0_0_30px_rgba(245,158,11,0.35)]"
            >
              Add your confession →
            </a>
          </div>
        </>
      )}
    </main>
  );
}
