"use client";

import { useRef, useState } from "react";

export default function CheckIn({
  sessionId,
  personaName,
  alreadyFulfilled,
}: {
  sessionId: string;
  personaName: string;
  alreadyFulfilled: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [reaction, setReaction] = useState("");
  const [explorer, setExplorer] = useState<string | null>(null);
  const [fulfilled, setFulfilled] = useState(alreadyFulfilled);
  const [error, setError] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  async function checkin(didIt: boolean) {
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, didIt }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Something went wrong.");
      setReaction(j.reaction);
      if (didIt) setFulfilled(true);
      if (j.explorer) setExplorer(j.explorer);
      if (j.audio) {
        audioRef.current?.pause();
        audioRef.current = new Audio(j.audio);
        audioRef.current.play().catch(() => {});
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  if (fulfilled && !reaction) {
    return (
      <p className="mt-8 text-sm text-amber-400">
        🔥 Pledge fulfilled. {personaName} knows you came back.
      </p>
    );
  }

  return (
    <div className="mt-10 w-full">
      {!reaction ? (
        <>
          <p className="text-sm tracking-wide text-stone-400">
            {personaName} is waiting to hear how it went.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <button
              onClick={() => checkin(true)}
              disabled={busy}
              className="rounded-full bg-amber-500 px-6 py-3 text-sm font-medium text-stone-950 transition-all hover:bg-amber-400 hover:shadow-[0_0_30px_rgba(245,158,11,0.35)] disabled:opacity-40"
            >
              {busy ? "…" : "I did it 🔥"}
            </button>
            <button
              onClick={() => checkin(false)}
              disabled={busy}
              className="rounded-full border border-stone-700 px-6 py-3 text-sm text-stone-300 transition-colors hover:border-stone-500 disabled:opacity-40"
            >
              Not yet
            </button>
          </div>
        </>
      ) : (
        <div className="rise-in">
          <blockquote className="font-display mx-auto max-w-md text-balance text-xl leading-relaxed text-amber-100">
            “{reaction}”
          </blockquote>
          {explorer && (
            <a
              href={explorer}
              target="_blank"
              className="mt-5 inline-block text-sm text-amber-400 transition-colors hover:text-amber-300"
            >
              Fulfillment sealed on-chain →
            </a>
          )}
        </div>
      )}
      {error && (
        <p role="alert" className="mt-4 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
