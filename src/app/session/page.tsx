"use client";

import { useEffect, useRef, useState } from "react";

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

const COMPILE_LINES = [
  "…it's waking up…",
  "…remembering the callouses, the evenings…",
  "…finding its voice…",
];

function SpeakingIndicator() {
  return (
    <span className="inline-flex items-end gap-[3px]" aria-label="speaking" role="status">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="speak-bar w-[3px] rounded-full bg-amber-400/80"
          style={{ height: 10 + (i % 2) * 5, animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

export default function Session() {
  const [step, setStep] = useState<Step>("confess");
  const [confession, setConfession] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [persona, setPersona] = useState<PersonaView | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [offerVerdict, setOfferVerdict] = useState(false);
  const [compileLine, setCompileLine] = useState(0);
  const [verdictText, setVerdictText] = useState("");
  const [verdictChoice, setVerdictChoice] = useState<"rekindle" | "rest" | null>(null);
  const [pact, setPact] = useState<{ step?: string; deadline?: string }>({});
  const [pledge, setPledge] = useState<{ tx: string; simulated: boolean; explorer: string | null; stoneUrl: string } | null>(null);
  const [error, setError] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns, step]);

  useEffect(() => {
    if (step !== "compiling") return;
    const t = setInterval(() => setCompileLine((n) => (n + 1) % COMPILE_LINES.length), 1600);
    return () => clearInterval(t);
  }, [step]);

  function play(audio: string | null) {
    if (!audio) return;
    audioRef.current?.pause();
    const a = new Audio(audio);
    audioRef.current = a;
    setSpeaking(true);
    a.onended = () => setSpeaking(false);
    a.onerror = () => setSpeaking(false);
    a.play().catch(() => setSpeaking(false));
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

  const stageIndex = step === "confess" || step === "compiling" ? 0 : step === "converse" ? 1 : 2;

  return (
    <main className="mx-auto max-w-2xl px-6 pb-24">
      {/* Stage dots */}
      <div className="flex items-center justify-center gap-3 pt-8" aria-hidden>
        {["Confess", "Converse", "Decide"].map((label, i) => (
          <div key={label} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`h-1.5 w-1.5 rounded-full transition-colors duration-500 ${
                  i <= stageIndex ? "bg-amber-400 shadow-[0_0_8px_2px_rgba(245,158,11,0.4)]" : "bg-stone-700"
                }`}
              />
              <span className={`text-[11px] tracking-[0.18em] uppercase ${i <= stageIndex ? "text-amber-400/90" : "text-stone-600"}`}>
                {label}
              </span>
            </div>
            {i < 2 && <span className="h-px w-8 bg-stone-800" />}
          </div>
        ))}
      </div>

      {step === "confess" && (
        <section className="rise-in pt-12">
          <h1 className="font-display text-4xl text-stone-100">The Confession</h1>
          <p className="mt-3 leading-relaxed text-stone-400">
            What did you abandon? When did you start, when did you stop, and what killed it?
            Be honest — it already knows.
          </p>
          <label htmlFor="confession" className="sr-only">
            Your confession
          </label>
          <textarea
            id="confession"
            value={confession}
            onChange={(e) => setConfession(e.target.value)}
            rows={7}
            placeholder="I played cricket every evening from 11 to 17. I told everyone I'd play Ranji one day. Then the entrance-exam years came, and the bat went behind the cupboard. It's been eight years…"
            className="mt-6 w-full resize-none rounded-2xl border border-stone-700/80 bg-stone-900/70 p-5 leading-relaxed text-stone-100 shadow-inner placeholder-stone-600 transition-colors focus:border-amber-500/70 focus:outline-none"
          />
          <div className="mt-5 flex items-center justify-between">
            <p className="text-xs text-stone-600">It speaks out loud — headphones on.</p>
            <button
              onClick={submitConfession}
              disabled={confession.trim().length < 10}
              className="rounded-full bg-amber-500 px-7 py-3 font-medium text-stone-950 transition-all hover:bg-amber-400 hover:shadow-[0_0_30px_rgba(245,158,11,0.35)] disabled:opacity-40 disabled:hover:shadow-none"
            >
              Speak it into the ember
            </button>
          </div>
        </section>
      )}

      {step === "compiling" && (
        <section className="flex flex-col items-center pt-28 text-center" role="status" aria-live="polite">
          <div className="ember-dot h-6 w-6 rounded-full bg-amber-400 shadow-[0_0_80px_24px_rgba(245,158,11,0.4)]" />
          <p className="font-display mt-10 text-2xl text-stone-200">{COMPILE_LINES[compileLine]}</p>
          <p className="mt-3 text-sm text-stone-500">forging the one who will speak to you</p>
        </section>
      )}

      {(step === "converse" || step === "verdict") && persona && (
        <section className="pt-10">
          <div className="mb-8 text-center">
            <div className="ember-dot mx-auto h-3 w-3 rounded-full bg-amber-400 shadow-[0_0_40px_12px_rgba(245,158,11,0.35)]" />
            <h2 className="font-display mt-5 text-3xl text-amber-300">{persona.name}</h2>
            <p className="mt-2 flex items-center justify-center gap-3 text-[11px] uppercase tracking-[0.22em] text-stone-500">
              {persona.embodiment.replaceAll("_", " ")} · {persona.temperament}
              {speaking && <SpeakingIndicator />}
            </p>
          </div>

          <div className="space-y-5">
            {turns.map((t, i) => (
              <div key={i} className={`rise-in flex ${t.role === "user" ? "justify-end" : "justify-start"}`}>
                {t.role === "user" ? (
                  <div className="max-w-[80%] rounded-2xl rounded-br-md bg-stone-800/90 px-5 py-3 leading-relaxed text-stone-200">
                    {t.text}
                  </div>
                ) : (
                  <div className="relative max-w-[88%] pl-5">
                    <span aria-hidden className="absolute left-0 top-1 bottom-1 w-px bg-gradient-to-b from-amber-500/70 via-amber-700/40 to-transparent" />
                    <p className="font-display text-xl leading-relaxed text-amber-50/95">{t.text}</p>
                  </div>
                )}
              </div>
            ))}
            {busy && (
              <div className="pl-5" role="status" aria-label="thinking">
                <span className="ember-dot inline-block h-2 w-2 rounded-full bg-amber-400/80" />
              </div>
            )}
            <div ref={endRef} />
          </div>

          {step === "converse" && (
            <div className="mt-10">
              <div className="flex gap-3">
                <label htmlFor="reply" className="sr-only">
                  Your reply
                </label>
                <input
                  id="reply"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Answer it…"
                  autoComplete="off"
                  className="flex-1 rounded-full border border-stone-700/80 bg-stone-900/70 px-5 py-3.5 text-stone-100 placeholder-stone-600 transition-colors focus:border-amber-500/70 focus:outline-none"
                />
                <button
                  onClick={send}
                  disabled={busy || !message.trim()}
                  className="rounded-full bg-amber-500 px-6 py-3.5 font-medium text-stone-950 transition-all hover:bg-amber-400 disabled:opacity-40"
                >
                  Reply
                </button>
              </div>
              {offerVerdict && (
                <button
                  onClick={() => setStep("verdict")}
                  className="font-display mt-6 w-full rounded-2xl border border-amber-800/50 py-3.5 text-lg text-amber-300 transition-all hover:border-amber-600/70 hover:bg-amber-950/25"
                >
                  I&apos;m ready to decide →
                </button>
              )}
            </div>
          )}

          {step === "verdict" && (
            <div className="mt-12">
              <p className="mb-5 text-center text-sm tracking-wide text-stone-500">Two doors. It will honor either one.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  onClick={() => decide("rekindle")}
                  disabled={busy}
                  className="group rounded-3xl border border-amber-600/50 bg-gradient-to-b from-amber-950/50 to-stone-950 p-7 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-400/80 hover:shadow-[0_8px_50px_rgba(245,158,11,0.15)] disabled:opacity-40"
                >
                  <div aria-hidden className="text-2xl">🔥</div>
                  <div className="font-display mt-3 text-2xl text-amber-300">Rekindle it</div>
                  <p className="mt-2 text-sm leading-relaxed text-stone-400">
                    It negotiates the smallest possible first step. You pledge it on-chain — where you can&apos;t quietly delete it.
                  </p>
                </button>
                <button
                  onClick={() => decide("rest")}
                  disabled={busy}
                  className="group rounded-3xl border border-stone-700 bg-stone-900/40 p-7 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-stone-400/70 hover:shadow-[0_8px_50px_rgba(168,162,158,0.1)] disabled:opacity-40"
                >
                  <div aria-hidden className="text-2xl">🕯️</div>
                  <div className="font-display mt-3 text-2xl text-stone-200">Lay it to rest</div>
                  <p className="mt-2 text-sm leading-relaxed text-stone-400">
                    A proper goodbye: a spoken eulogy and a permanent stone. Closure is a feature, not a failure.
                  </p>
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {step === "done" && persona && (
        <section className="rise-in pt-14 text-center">
          <div className="ember-dot mx-auto h-4 w-4 rounded-full bg-amber-400 shadow-[0_0_60px_18px_rgba(245,158,11,0.4)]" />
          <p className="mt-8 text-[11px] uppercase tracking-[0.3em] text-stone-500">
            {verdictChoice === "rekindle" ? "The Pact" : "The Eulogy"}
          </p>
          <blockquote className="font-display mx-auto mt-5 max-w-lg text-balance text-2xl leading-relaxed text-stone-100">
            “{verdictText}”
          </blockquote>
          {verdictChoice === "rekindle" && pact.step && (
            <div className="mx-auto mt-9 max-w-md rounded-2xl border border-amber-800/50 bg-amber-950/25 p-6">
              <div className="text-[11px] uppercase tracking-[0.25em] text-amber-500">Your pledge</div>
              <div className="font-display mt-3 text-xl text-stone-100">{pact.step}</div>
              <div className="mt-1.5 text-sm text-stone-400">by {pact.deadline}</div>
            </div>
          )}

          {!pledge ? (
            <button
              onClick={seal}
              disabled={busy}
              className="mt-10 rounded-full bg-amber-500 px-9 py-4 font-medium text-stone-950 transition-all hover:bg-amber-400 hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] disabled:opacity-40"
            >
              {busy
                ? "Sealing…"
                : verdictChoice === "rekindle"
                  ? "Seal the pledge on Solana"
                  : "Place the stone on Solana"}
            </button>
          ) : (
            <div className="mx-auto mt-10 max-w-md rounded-2xl border border-stone-700/80 bg-stone-900/50 p-6 text-sm">
              <div className="text-[11px] uppercase tracking-[0.22em] text-stone-500">
                {pledge.simulated ? "Recorded — pending on-chain (devnet faucet)" : "Sealed on Solana devnet"}
              </div>
              <div className="mt-3 break-all font-mono text-xs text-stone-500">{pledge.tx}</div>
              <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2">
                {pledge.explorer && (
                  <a href={pledge.explorer} target="_blank" className="text-amber-400 transition-colors hover:text-amber-300">
                    View on Explorer →
                  </a>
                )}
                <a href={pledge.stoneUrl} className="text-amber-400 transition-colors hover:text-amber-300">
                  Your stone →
                </a>
                <a href="/atlas" className="text-stone-400 transition-colors hover:text-stone-300">
                  The Atlas →
                </a>
              </div>
            </div>
          )}
        </section>
      )}

      {error && (
        <p role="alert" className="mt-6 text-center text-sm text-red-400">
          {error}{" "}
          <button onClick={() => setError("")} className="underline decoration-red-400/50 hover:text-red-300">
            dismiss
          </button>
        </p>
      )}
    </main>
  );
}
