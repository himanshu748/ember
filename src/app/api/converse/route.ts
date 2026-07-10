import { NextResponse } from "next/server";
import { passionReply } from "@/lib/gemini";
import { speak } from "@/lib/tts";
import { getSession } from "@/lib/store";
import type { ChatTurn } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_TURNS = 6; // credit + attention budget

export async function POST(req: Request) {
  const { sessionId, history = [], message } = await req.json();
  const session = await getSession(sessionId);
  if (!session) return NextResponse.json({ error: "Session not found." }, { status: 404 });
  if (!message?.trim()) return NextResponse.json({ error: "Say something." }, { status: 400 });

  const turns = (history as ChatTurn[]).filter((t) => t.role === "user").length + 1;
  const reply = await passionReply(session.persona, history, String(message).slice(0, 1000));
  const audio = await speak(reply, session.persona.temperament);

  return NextResponse.json({
    reply,
    audio,
    // After enough exchange, the app (never the persona) offers the two doors.
    offerVerdict: turns >= 3,
    forceVerdict: turns >= MAX_TURNS,
  });
}
