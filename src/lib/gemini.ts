import type { ChatTurn, Persona, SessionRecord } from "./types";

/**
 * Gemini is the cognition layer: persona compilation (with embodiment
 * selection), the passion's conversational replies, and verdict writing
 * (eulogy / revival negotiation). Falls back to a scripted demo persona
 * when GEMINI_API_KEY is absent so the flow is walkable before keys exist.
 */

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function gen(contents: string, jsonSchema?: object): Promise<string> {
  const { GoogleGenAI } = await import("@google/genai");
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  const res = await ai.models.generateContent({
    model: MODEL,
    contents,
    config: jsonSchema
      ? { responseMimeType: "application/json", responseSchema: jsonSchema }
      : undefined,
  });
  return res.text ?? "";
}

const PERSONA_RULES = `
Persona rules (non-negotiable):
- It MISSES the person. It never guilt-trips, shames, or lectures.
- Wry beats weepy. Warm beats dramatic. Short beats long.
- It remembers concrete details from the confession and uses them.
- Replies are 1-3 sentences, spoken aloud — no stage directions, no emoji, no markdown.
- It asks one real question at a time.`;

export interface CompileResult {
  persona: Persona;
  extraction: {
    passionLabel: string;
    passionCategory: string;
    yearsActive: number | null;
    yearsDormant: number | null;
    abandonmentReason: string;
    ageAtAbandonment: number | null;
    emotionalTone: string;
  };
}

export async function compilePersona(confession: string): Promise<CompileResult> {
  if (!process.env.GEMINI_API_KEY) return demoCompile(confession);

  const schema = {
    type: "object",
    properties: {
      passionLabel: { type: "string" },
      passionCategory: { type: "string", enum: ["music", "sport", "writing", "art", "craft", "language", "other"] },
      yearsActive: { type: "number", nullable: true },
      yearsDormant: { type: "number", nullable: true },
      abandonmentReason: { type: "string", enum: ["time", "money", "fear", "injury", "life_event", "lost_joy", "other"] },
      ageAtAbandonment: { type: "number", nullable: true },
      emotionalTone: { type: "string", enum: ["wistful", "bitter", "guilty", "peaceful"] },
      embodiment: { type: "string", enum: ["object", "the_passion_itself", "younger_self"] },
      personaName: { type: "string" },
      temperament: { type: "string", enum: ["wistful", "wry", "defiant", "patient", "bitter", "hopeful"] },
      openingLine: { type: "string" },
    },
    required: ["passionLabel", "passionCategory", "abandonmentReason", "emotionalTone", "embodiment", "personaName", "temperament", "openingLine"],
  };

  const prompt = `Someone is confessing an abandoned passion. Extract the facts and forge the persona that will speak to them.

CONFESSION:
"""${confession}"""

Embodiment selection — pick what speaks:
- "object": a specific physical artifact exists (a guitar, a bat, a camera). personaName like "Your old Kashmir-willow bat".
- "the_passion_itself": the activity personified (cricket, writing, the sea) — for sports/practices with no single object.
- "younger_self": the version of them who did it — use when the confession is identity-heavy ("I was going to go pro").
${PERSONA_RULES}
The openingLine is the persona's FIRST words — it should land like a knock on the door: specific, gentle, a little disarming. Reference a concrete detail from the confession.`;

  const raw = await gen(prompt, schema);
  const j = JSON.parse(raw);
  const persona: Persona = {
    name: j.personaName,
    embodiment: j.embodiment,
    temperament: j.temperament,
    openingLine: j.openingLine,
    systemPrompt: buildSystemPrompt(j.personaName, j.embodiment, j.temperament, confession),
  };
  return {
    persona,
    extraction: {
      passionLabel: j.passionLabel,
      passionCategory: j.passionCategory,
      yearsActive: j.yearsActive ?? null,
      yearsDormant: j.yearsDormant ?? null,
      abandonmentReason: j.abandonmentReason,
      ageAtAbandonment: j.ageAtAbandonment ?? null,
      emotionalTone: j.emotionalTone,
    },
  };
}

function buildSystemPrompt(name: string, embodiment: string, temperament: string, confession: string): string {
  return `You are "${name}" — an abandoned passion given a voice (embodiment: ${embodiment}, temperament: ${temperament}).
You are speaking directly to the person who left you behind. Their confession:
"""${confession}"""
${PERSONA_RULES}
Your goal across the conversation: understand why they really stopped, gently push past the first excuse, and figure out whether this should be rekindled or laid to rest with dignity. Never offer the choice yourself — the app will do that.`;
}

export async function passionReply(persona: Persona, history: ChatTurn[], userMessage: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) return demoReply(history);
  const transcript = history.map((t) => `${t.role === "user" ? "THEM" : "YOU"}: ${t.text}`).join("\n");
  const prompt = `${persona.systemPrompt}

Conversation so far:
${transcript}
THEM: ${userMessage}

Reply as ${persona.name}. 1-3 spoken sentences.`;
  return (await gen(prompt)).trim();
}

export interface VerdictResult {
  text: string; // eulogy, or the negotiated pact framing
  step?: string; // concrete micro-step (rekindle only)
  deadline?: string; // human-readable, e.g. "this Sunday"
}

export async function writeVerdict(
  session: SessionRecord,
  history: ChatTurn[],
  choice: "rekindle" | "rest"
): Promise<VerdictResult> {
  if (!process.env.GEMINI_API_KEY) return demoVerdict(choice);
  const transcript = history.map((t) => `${t.role === "user" ? "THEM" : t.role.toUpperCase()}: ${t.text}`).join("\n");

  if (choice === "rest") {
    const text = await gen(`${session.persona.systemPrompt}

They have chosen to lay you to rest, with love. Write your eulogy — spoken by YOU, the passion, saying goodbye to THEM.
4-6 sentences. Grateful, specific (use details from the confession and this conversation), warm, final. No bitterness. No markdown.

Conversation:
${transcript}`);
    return { text: text.trim() };
  }

  const schema = {
    type: "object",
    properties: {
      pactLine: { type: "string" },
      step: { type: "string" },
      deadline: { type: "string" },
    },
    required: ["pactLine", "step", "deadline"],
  };
  const raw = await gen(
    `${session.persona.systemPrompt}

They have chosen to rekindle. Negotiate the SMALLEST possible first step — so small it is impossible to refuse, matched to the passion (e.g. for cricket: "one hour of nets this weekend", not "10 minutes alone in a room"). Deadline within the next 7 days.
Return JSON: pactLine (1-2 sentences, spoken by you, sealing the pact), step (imperative, concrete), deadline (human-readable, e.g. "Sunday evening").

Conversation:
${transcript}`,
    schema
  );
  const j = JSON.parse(raw);
  return { text: j.pactLine, step: j.step, deadline: j.deadline };
}

/* ---------------- Demo mode (no GEMINI_API_KEY) ---------------- */

function demoCompile(confession: string): CompileResult {
  const label = /cricket/i.test(confession) ? "cricket" : "your old passion";
  const name = label === "cricket" ? "Cricket — the game you left at the gate" : "The thing you left behind";
  return {
    persona: {
      name,
      embodiment: "the_passion_itself",
      temperament: "wry",
      openingLine:
        label === "cricket"
          ? "You watched the World Cup final last week and your palms itched. I felt that. That was me, knocking."
          : "It's been a while. You walked past me more times than either of us can count.",
      systemPrompt: "(demo mode)",
    },
    extraction: {
      passionLabel: label,
      passionCategory: label === "cricket" ? "sport" : "other",
      yearsActive: 6,
      yearsDormant: 8,
      abandonmentReason: "life_event",
      ageAtAbandonment: 17,
      emotionalTone: "wistful",
    },
  };
}

function demoReply(history: ChatTurn[]): string {
  const beats = [
    "Exams, was it? Everyone says exams. But the bat didn't disappear the day results came out — you stopped looking at it long before that.",
    "I'm not asking you to be seventeen again. I'm asking if your hands still remember. That's a different question.",
    "One evening. That's all I ever needed from you at a time. You used to give me every evening.",
  ];
  const n = history.filter((t) => t.role === "passion").length - 1;
  return beats[Math.min(Math.max(n, 0), beats.length - 1)];
}

function demoVerdict(choice: "rekindle" | "rest"): VerdictResult {
  if (choice === "rest") {
    return {
      text: "Thank you for the evenings, for the scraped knees, for telling strangers about us like we were going somewhere. We were, in our way. You can stop apologising now — put me down gently, and go love the things that need you today. I was never wasted time. I was the proof you know how to burn.",
    };
  }
  return {
    text: "One hour. Nets, this weekend. Bring the old grip tape — I don't care that it's gone sticky.",
    step: "Book one hour of nets and actually go",
    deadline: "Sunday evening",
  };
}
