import { NextResponse } from "next/server";
import crypto from "crypto";
import { compilePersona } from "@/lib/gemini";
import { speak } from "@/lib/tts";
import { insertSession } from "@/lib/store";
import type { SessionRecord } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const { confession } = await req.json();
  if (!confession || String(confession).trim().length < 10) {
    return NextResponse.json({ error: "Tell it a little more than that." }, { status: 400 });
  }

  const { persona, extraction } = await compilePersona(String(confession).slice(0, 4000));

  const session: SessionRecord = {
    id: crypto.randomUUID(),
    ...extraction,
    confession: String(confession).slice(0, 4000),
    persona,
    verdict: "undecided",
    verdictText: null,
    pledgeTx: null,
    createdAt: new Date().toISOString(),
  };
  await insertSession(session);

  const audio = await speak(persona.openingLine, persona.temperament);

  return NextResponse.json({
    sessionId: session.id,
    persona: {
      name: persona.name,
      embodiment: persona.embodiment,
      temperament: persona.temperament,
      openingLine: persona.openingLine,
    },
    audio,
  });
}
