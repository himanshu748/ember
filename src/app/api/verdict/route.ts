import { NextResponse } from "next/server";
import { writeVerdict } from "@/lib/gemini";
import { speak } from "@/lib/tts";
import { getSession, updateSession } from "@/lib/store";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const { sessionId, history = [], choice } = await req.json();
  if (choice !== "rekindle" && choice !== "rest") {
    return NextResponse.json({ error: "Choose a door." }, { status: 400 });
  }
  const session = await getSession(sessionId);
  if (!session) return NextResponse.json({ error: "Session not found." }, { status: 404 });

  const verdict = await writeVerdict(session, history, choice);
  await updateSession(sessionId, {
    verdict: choice === "rekindle" ? "rekindled" : "laid_to_rest",
    verdictText: choice === "rekindle" ? `${verdict.step} — by ${verdict.deadline}` : verdict.text,
  });

  const audio = await speak(verdict.text, session.persona.temperament);
  return NextResponse.json({ ...verdict, audio });
}
