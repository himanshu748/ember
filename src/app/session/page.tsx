"use client";

import { useRef, useState } from "react";

type Step = "confess" | "compiling" | "converse" | "verdict" | "done";
interface Turn {
  role: "user" | "passion";
  text: string;
}
interface PersonaView {
  name: string;
  embodiment: string;
  temperament: string;
  openingLine: string;
}

export default function Session() {
  const [step, setStep] = useState<Step>("confess");
  const [confession, setConfession] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [persona, setPersona] = useState<PersonaView | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [offerVerdict, setOfferVerdict] = useState(false);
  const [verdictText, setVerdictText] = useState("");
  const [verdictChoice, setVerdictChoice] = useState<"rekindle" | "rest" | null>(null);
  const [pact, setPact] = useState<{ step?: string; deadline?: string }>({});
  const [pledge, setPledge] = useState<{ tx: string; simulated: boolean; explorer: string | null; stoneUrl: string } | null>(null);
  const [error, setError] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function play(audio: string | null) {
    if (!audio) return;
    audioRef.current?.pause();
    audioRef.current = new Audio(audio);
    audioRef.current.play().catch(() => {});
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function api(path: string, body: object): Promise<any> {
    const r = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const j = await r.json();
    if (!r.ok) throw new Error(j.error || "Something went wrong.");
    return j;
  }

  async function submitConfession() {
    setError("");
    setStep("compiling");
    try {
      const j = await api("/api/confess", { confession });
      setSessionId(j.sessionId);
      setPersona(j.persona);
      setTurns([{ role: "passion", text: j.persona.openingLine }]);
      setStep("converse");
      play(j.audio);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStep("confess");
    }
  }

  async function send() {
    if (!message.trim() || busy) return;
    const userTurn: Turn = { role: "user", text: message.trim() };
    const history = turns;
    setTurns((t) => [...t, userTurn]);
    setMessage("");
    setBusy(true);
    setError("");
    try {
      const j = await api("/api/converse", { sessionId, history, message: userTurn.text });
      setTurns((t) => [...t, { role: "passion", text: j.reply }]);
      setOfferVerdict(j.offerVerdict);
      if (j.forceVerdict) setStep("verdict");
      play(j.audio);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function decide(choice: "rekindle" | "rest") {
    setBusy(true);
    setError("");
    setVerdictChoice(choice);
    try {
      const j = await api("/api/verdict", { sessionId, history: turns, choice });
      setVerdictText(j.text);
      setPact({ step: j.step, deadline: j.deadline });
      setStep("done");
      play(j.audio);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setVerdictChoice(null);
    } finally {
      setBusy(false);
    }
  }

  async function seal() {
    setBusy(true);
    setError("");
    try {
      const j = await api("/api/pledge", { sessionId });
      setPledge(j);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 pb-24">
      {step === "confess" && (
        <section className="rise-in pt-16">
          <h1 className="font-display text-3xl text-stone-100">The Confession</h1>
          <p className="mt-3 text-stone-400">
            What did you abandon? When did you start, when did you stop, and what killed it?
            Be honest — it already knows.
          </p>
          <textarea
            value={confession}
            onChange={(e) => setConfession(e.target.value)}
            rows={7}
            placeholder="I played cricket every evening from 11 to 17. I told everyone I'd play Ranji one day. Then the entrance-exam years came, and the bat went behind the cupboard. It's been eight years…"
            className="mt-6 w-full rounded-xl border border-stone-700 bg-stone-900/70 p-4 text-stone-100 placeholder-stone-600 focus:border-amber-500 focus:outline-none"
          />
          <button
            onClick={submitConfession}
            disabled={confession.trim().length < 10}
            className="mt-4 rounded-full bg-amber-500 px-7 py-3 font-medium text-stone-950 transition hover:bg-amber-400 disabled:opacity-40"
          >
            Speak it into the ember
          </button>
        </section>
      )}

      {step === "compiling" && (
        <section className="flex flex-col items-center pt-32 text-center">
          <div className="ember-dot h-6 w-6 rounded-full bg-amber-400 shadow-[0_0_80px_24px_rgba(245,158,11,0.4)]" />
          <p className="font-display mt-10 text-xl text-stone-300">…it&apos;s waking up…</p>
          <p className="mt-2 text-sm text-stone-500">remembering the callouses, the evenings, the plans you made out loud</p>
        </section>
      )}

      {(step === "converse" || step === "verdict") && persona && (
        <section className="pt-12">
          <div className="mb-6 text-center">
            <div className="ember-dot mx-auto h-3 w-3 rounded-full bg-amber-400 shadow-[0_0_40px_12px_rgba(245,158,11,0.35)]" />
            <h2 className="font-display mt-4 text-2xl text-amber-300">{persona.name}</h2>
            <p className="mt-1 text-xs uppercase tracking-widest text-stone-600">
              {persona.embodiment.replaceAll("_", " ")} · {persona.temperament}
            </p>
          </div>

          <div className="space-y-4">
            {turns.map((t, i) => (
              <div key={i} className={`rise-in flex ${t.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-3 leading-relaxed ${
                    t.role === "user"
                      ? "bg-stone-800 text-stone-200"
                      : "font-display border border-amber-900/50 bg-gradient-to-b from-amber-950/40 to-stone-950 text-lg text-amber-100"
                  }`}
                >
                  {t.text}
                </div>
              </div>
            ))}
            {busy && <p className="font-display animate-pulse pl-2 text-amber-200/60">…</p>}
          </div>

          {step === "converse" && (
            <div className="mt-8">
              <div className="flex gap-3">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Answer it…"
                  className="flex-1 rounded-full border border-stone-700 bg-stone-900/70 px-5 py-3 text-stone-100 placeholder-stone-600 focus:border-amber-500 focus:outline-none"
                />
                <button
                  onClick={send}
                  disabled={busy || !message.trim()}
                  className="rounded-full bg-amber-500 px-6 py-3 font-medium text-stone-950 hover:bg-amber-400 disabled:opacity-40"
                >
                  Reply
                </button>
              </div>
              {offerVerdict && (
                <button
                  onClick={() => setStep("verdict")}
                  className="font-display mt-6 w-full rounded-xl border border-amber-800/60 py-3 text-amber-300 transition hover:bg-amber-950/30"
                >
                  I&apos;m ready to decide →
                </button>
              )}
            </div>
          )}

          {step === "verdict" && (
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <button
                onClick={() => decide("rekindle")}
                disabled={busy}
                className="rounded-2xl border border-amber-600/60 bg-gradient-to-b from-amber-950/50 to-stone-950 p-6 text-left transition hover:border-amber-400 disabled:opacity-40"
              >
                <div className="font-display text-xl text-amber-300">Rekindle it 🔥</div>
                <p className="mt-2 text-sm text-stone-400">
                  It will negotiate the smallest possible first step. You&apos;ll pledge it on-chain.
                </p>
              </button>
              <button
                onClick={() => decide("rest")}
                disabled={busy}
                className="rounded-2xl border border-stone-700 bg-stone-900/40 p-6 text-left transition hover:border-stone-400 disabled:opacity-40"
              >
                <div className="font-display text-xl text-stone-200">Lay it to rest 🕯️</div>
                <p className="mt-2 text-sm text-stone-400">
                  It will say goodbye properly. A eulogy, and a permanent stone. Closure is a feature.
                </p>
              </button>
            </div>
          )}
        </section>
      )}

      {step === "done" && persona && (
        <section className="rise-in pt-16 text-center">
          <div className="ember-dot mx-auto h-4 w-4 rounded-full bg-amber-400 shadow-[0_0_60px_18px_rgba(245,158,11,0.4)]" />
          <h2 className="font-display mt-8 text-2xl text-amber-300">
            {verdictChoice === "rekindle" ? "The Pact" : "The Eulogy"}
          </h2>
          <blockquote className="font-display mx-auto mt-6 max-w-lg text-xl leading-relaxed text-stone-200">
            “{verdictText}”
          </blockquote>
          {verdictChoice === "rekindle" && pact.step && (
            <div className="mx-auto mt-8 max-w-md rounded-2xl border border-amber-800/60 bg-amber-950/30 p-6">
              <div className="text-xs uppercase tracking-widest text-amber-500">Your pledge</div>
              <div className="mt-2 text-lg text-stone-100">{pact.step}</div>
              <div className="mt-1 text-sm text-stone-400">by {pact.deadline}</div>
            </div>
          )}

          {!pledge ? (
            <button
              onClick={seal}
              disabled={busy}
              className="mt-10 rounded-full bg-amber-500 px-8 py-4 font-medium text-stone-950 hover:bg-amber-400 disabled:opacity-40"
            >
              {busy
                ? "Sealing…"
                : verdictChoice === "rekindle"
                  ? "Seal the pledge on Solana"
                  : "Place the stone on Solana"}
            </button>
          ) : (
            <div className="mx-auto mt-10 max-w-md rounded-2xl border border-stone-700 bg-stone-900/50 p-6 text-sm">
              <div className="text-xs uppercase tracking-widest text-stone-500">
                {pledge.simulated ? "Recorded (devnet airdrop rate-limited — pending on-chain)" : "Sealed on Solana devnet"}
              </div>
              <div className="mt-2 break-all font-mono text-xs text-stone-400">{pledge.tx}</div>
              <div className="mt-4 flex justify-center gap-5">
                {pledge.explorer && (
                  <a href={pledge.explorer} target="_blank" className="text-amber-400 hover:text-amber-300">
                    View on Explorer →
                  </a>
                )}
                <a href={pledge.stoneUrl} className="text-amber-400 hover:text-amber-300">
                  Your stone →
                </a>
                <a href="/atlas" className="text-stone-400 hover:text-stone-300">
                  The Atlas →
                </a>
              </div>
            </div>
          )}
        </section>
      )}

      {error && <p className="mt-6 text-center text-sm text-red-400">{error}</p>}
    </main>
  );
}
