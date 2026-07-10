import type { Temperament } from "./types";

/**
 * ElevenLabs gives the passion its literal voice. Each temperament maps to a
 * curated premade voice. Returns a base64 data URL, or null when no key is
 * configured (text-only mode stays first-class).
 */

const VOICE_BY_TEMPERAMENT: Record<Temperament, string> = {
  wistful: "EXAVITQu4vr4xnSDxMaL", // Sarah — mature, reassuring
  wry: "JBFqnCBsd6RMkjVDRZzb", // George — warm storyteller
  defiant: "pNInz6obpgDQGcFmaJgB", // Adam — dominant, firm
  patient: "pqHfZKP75CvOlQylNhV4", // Bill — wise, mature, balanced
  bitter: "N2lVS1w4EtoT3dr4eOWO", // Callum — husky trickster
  hopeful: "cgSgspJ2msm6clMCkdW9", // Jessica — playful, bright
};

export async function speak(text: string, temperament: Temperament): Promise<string | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey || !text.trim()) return null;
  try {
    const { ElevenLabsClient } = await import("@elevenlabs/elevenlabs-js");
    const client = new ElevenLabsClient({ apiKey });
    const stream = await client.textToSpeech.convert(VOICE_BY_TEMPERAMENT[temperament], {
      text,
      modelId: process.env.ELEVENLABS_MODEL || "eleven_turbo_v2_5",
      outputFormat: "mp3_44100_128",
    });
    const buf = Buffer.from(await new Response(stream as BodyInit).arrayBuffer());
    return `data:audio/mpeg;base64,${buf.toString("base64")}`;
  } catch (e) {
    console.error("ElevenLabs TTS failed (continuing text-only):", e);
    return null;
  }
}
