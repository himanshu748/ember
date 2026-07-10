import { NextResponse } from "next/server";
import { atlasStats } from "@/lib/store";

export const runtime = "nodejs";
export const revalidate = 60;

export async function GET() {
  return NextResponse.json(await atlasStats());
}
