import { NextResponse } from "next/server";
import crypto from "crypto";
import { attestOnChain, createPledgeStake } from "@/lib/solana";
import { getSession, updateSession } from "@/lib/store";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const { sessionId } = await req.json();
  const session = await getSession(sessionId);
  if (!session) return NextResponse.json({ error: "Session not found." }, { status: 404 });
  if (session.verdict === "undecided") {
    return NextResponse.json({ error: "Decide first." }, { status: 400 });
  }

  const kind = session.verdict === "rekindled" ? "revival_pledge" : "eulogy_stone";
  const memo = {
    app: "ember",
    kind,
    passion: session.passionLabel,
    commitment: session.verdictText,
    confessionHash: crypto.createHash("sha256").update(session.confession).digest("hex").slice(0, 16),
    ts: new Date().toISOString(),
  };
  // Revival pledges put real value at stake in the pledge's own on-chain
  // account; eulogy stones are memorial attestations.
  const result =
    kind === "revival_pledge"
      ? await createPledgeStake(session.id, memo)
      : await attestOnChain(memo);

  await updateSession(sessionId, { pledgeTx: result.tx });
  return NextResponse.json({ ...result, kind, stoneUrl: `/stone/${sessionId}` });
}
