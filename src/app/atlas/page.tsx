import { atlasStats } from "@/lib/store";

export const dynamic = "force-dynamic";

function Bar({ label, count, max }: { label: string; count: number; max: number }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="w-32 shrink-0 truncate text-right text-stone-400 capitalize">{label.replaceAll("_", " ")}</div>
      <div className="h-5 flex-1 overflow-hidden rounded bg-stone-900">
        <div
          className="h-full rounded bg-gradient-to-r from-amber-700 to-amber-400"
          style={{ width: `${Math.max(4, (count / Math.max(max, 1)) * 100)}%` }}
        />
      </div>
      <div className="w-8 text-stone-500">{count}</div>
    </div>
  );
}

export default async function Atlas() {
  const s = await atlasStats();
  const maxPassion = s.topPassions[0]?.count ?? 1;
  const maxReason = s.byReason[0]?.count ?? 1;
  const maxCat = s.byCategory[0]?.count ?? 1;

  return (
    <main className="mx-auto max-w-3xl px-6 pb-24 pt-12">
      <h1 className="font-display text-3xl text-stone-100">The Atlas of Abandoned Passions</h1>
      <p className="mt-2 text-sm text-stone-500">
        Anonymized, aggregated {s.source === "snowflake" ? "live in Snowflake" : "locally (Snowflake pending)"} — what
        humanity gives up, and why.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { v: s.total, l: "passions confessed" },
          { v: s.rekindled, l: "rekindled" },
          { v: s.laidToRest, l: "laid to rest" },
          { v: s.avgYearsDormant, l: "avg years dormant" },
        ].map((c) => (
          <div key={c.l} className="rounded-2xl border border-stone-800 bg-stone-900/40 p-5 text-center">
            <div className="font-display text-3xl text-amber-400">{c.v}</div>
            <div className="mt-1 text-xs text-stone-500">{c.l}</div>
          </div>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="font-display mb-4 text-xl text-stone-200">Most abandoned</h2>
        <div className="space-y-2">
          {s.topPassions.map((p) => (
            <Bar key={p.label} label={p.label} count={p.count} max={maxPassion} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display mb-4 text-xl text-stone-200">What killed them</h2>
        <div className="space-y-2">
          {s.byReason.map((r) => (
            <Bar key={r.reason} label={r.reason} count={r.count} max={maxReason} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display mb-4 text-xl text-stone-200">By category</h2>
        <div className="space-y-2">
          {s.byCategory.map((c) => (
            <Bar key={c.category} label={c.category} count={c.count} max={maxCat} />
          ))}
        </div>
      </section>

      <p className="mt-14 text-center text-sm text-stone-500">
        There is a closet like yours in every house on earth.{" "}
        <a href="/session" className="text-amber-400 hover:text-amber-300">
          Add your confession →
        </a>
      </p>
    </main>
  );
}
