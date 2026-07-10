import { getSession } from "@/lib/store";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Stone({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await getSession(id);
  if (!s) notFound();

  const rekindled = s.verdict === "rekindled";
  const onChain = s.pledgeTx && !s.pledgeTx.startsWith("SIMULATED-");

  return (
    <main className="mx-auto max-w-xl px-6 pb-24 pt-16">
      {/* The stone — a framed certificate */}
      <div className="rounded-[2rem] border border-stone-800 bg-gradient-to-b from-stone-900/60 to-stone-950 p-2">
        <div
          className={`flex flex-col items-center rounded-[1.6rem] border px-8 py-14 text-center sm:px-12 ${
            rekindled ? "border-amber-900/50" : "border-stone-800"
          }`}
        >
          <div
            className={`ember-dot h-4 w-4 rounded-full ${
              rekindled
                ? "bg-amber-400 shadow-[0_0_60px_18px_rgba(245,158,11,0.4)]"
                : "bg-stone-400 shadow-[0_0_40px_12px_rgba(168,162,158,0.25)]"
            }`}
          />
          <p className="mt-10 text-[11px] uppercase tracking-[0.35em] text-stone-500">
            {rekindled ? "Revival pledge" : "Laid to rest"}
          </p>
          <h1 className="font-display mt-4 text-5xl capitalize text-stone-100">{s.passionLabel}</h1>
          <p className="mt-3 text-sm text-stone-500">
            {s.persona.name} ·{" "}
            {new Date(s.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <span aria-hidden className="mt-8 h-px w-24 bg-gradient-to-r from-transparent via-stone-700 to-transparent" />

          {s.verdictText && (
            <blockquote className="font-display mt-8 max-w-md text-balance text-xl leading-relaxed text-stone-300">
              “{s.verdictText}”
            </blockquote>
          )}

          <div className="mt-12 w-full rounded-2xl border border-stone-800/80 bg-stone-950/60 p-5 text-xs">
            <div className="uppercase tracking-[0.22em] text-stone-600">
              {onChain ? "Permanent · Solana devnet" : "Recorded · awaiting chain"}
            </div>
            {s.pledgeTx && <div className="mt-2.5 break-all font-mono text-stone-500">{s.pledgeTx}</div>}
            {onChain && (
              <a
                href={`https://explorer.solana.com/tx/${s.pledgeTx}?cluster=devnet`}
                target="_blank"
                className="mt-3 inline-block text-amber-400 transition-colors hover:text-amber-300"
              >
                View on Explorer →
              </a>
            )}
          </div>
        </div>
      </div>

      <p className="mt-10 text-center">
        <a href="/session" className="text-sm text-amber-400 transition-colors hover:text-amber-300">
          What&apos;s in your closet? →
        </a>
      </p>
    </main>
  );
}
