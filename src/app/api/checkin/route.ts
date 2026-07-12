import { NextResponse } from "next/server";
import { checkinReaction } from "@/lib/gemini";
import { speak } from "@/lib/tts";
import { settlePledgeStake } from "@/lib/solana";
import { getSession, updateSession } from "@/lib/store";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const { sessionId, didIt } = await req.json();
  const session = await getSession(sessionId);
  if (!session) return NextResponse.json({ error: "Stone not found." }, { status: 404 });
  if (session.verdict !== "rekindled") {
    return NextResponse.json({ error: "Only revival pledges can be checked in." }, { status: 400 });
  }

  const reaction = await checkinReaction(session, !!didIt);
  const audio = await speak(reaction, session.persona.temperament);

  // "I did it" settles the pledge's stake into the Rekindled Pool with a
  // fulfillment memo in the same transaction; "not yet" writes nothing.
  let fulfilled = null;
  if (didIt && !session.fulfilledTx) {
    fulfilled = await settlePledgeStake(sessionId, {
      app: "ember",
      kind: "pledge_fulfilled",
      passion: session.passionLabel,
      pledgeTx: session.pledgeTx,
      ts: new Date().toISOString(),
    });
    await updateSession(sessionId, { checkedIn: true, fulfilledTx: fulfilled.tx });
  }

  return NextResponse.json({
    reaction,
    audio,
    fulfilledTx: fulfilled?.tx ?? session.fulfilledTx ?? null,
    explorer: fulfilled?.explorer ?? null,
    simulated: fulfilled?.simulated ?? false,
  });
}
