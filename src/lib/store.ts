import fs from "fs";
import path from "path";
import type { AtlasStats, SessionRecord } from "./types";

/**
 * Storage adapter: Snowflake when SNOWFLAKE_* env vars are present,
 * local JSON file otherwise (so the app runs before creds are provisioned).
 */

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "sessions.json");

function readLocal(): SessionRecord[] {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    return [];
  }
}

function writeLocal(rows: SessionRecord[]) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(rows, null, 2));
}

function computeAtlas(rows: SessionRecord[], source: AtlasStats["source"]): AtlasStats {
  const count = (key: (r: SessionRecord) => string) => {
    const m = new Map<string, number>();
    for (const r of rows) {
      const k = key(r) || "other";
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  };
  const dormant = rows.map((r) => r.yearsDormant).filter((n): n is number => n != null);
  return {
    total: rows.length,
    rekindled: rows.filter((r) => r.verdict === "rekindled").length,
    laidToRest: rows.filter((r) => r.verdict === "laid_to_rest").length,
    topPassions: count((r) => r.passionLabel.toLowerCase()).slice(0, 8).map(([label, count]) => ({ label, count })),
    byCategory: count((r) => r.passionCategory).map(([category, count]) => ({ category, count })),
    byReason: count((r) => r.abandonmentReason).map(([reason, count]) => ({ reason, count })),
    avgYearsDormant: dormant.length ? Math.round((dormant.reduce((a, b) => a + b, 0) / dormant.length) * 10) / 10 : 0,
    source,
  };
}

/* ---------------- Snowflake ---------------- */

const SF_ENABLED = !!(
  process.env.SNOWFLAKE_ACCOUNT &&
  process.env.SNOWFLAKE_USER &&
  (process.env.SNOWFLAKE_PASSWORD || process.env.SNOWFLAKE_TOKEN)
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sfConn: any = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function sf(): Promise<any> {
  if (sfConn) return sfConn;
  const snowflake = (await import("snowflake-sdk")).default;
  snowflake.configure({ logLevel: "ERROR" });
  const conn = snowflake.createConnection({
    account: process.env.SNOWFLAKE_ACCOUNT!,
    username: process.env.SNOWFLAKE_USER!,
    password: process.env.SNOWFLAKE_PASSWORD,
    warehouse: process.env.SNOWFLAKE_WAREHOUSE || "COMPUTE_WH",
    database: process.env.SNOWFLAKE_DATABASE || "EMBER",
    schema: process.env.SNOWFLAKE_SCHEMA || "PUBLIC",
  });
  await new Promise((res, rej) => conn.connect((e: unknown) => (e ? rej(e) : res(null))));
  sfConn = conn;
  return conn;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function sfQuery(sqlText: string, binds: any[] = []): Promise<any[]> {
  const conn = await sf();
  return new Promise((res, rej) =>
    conn.execute({
      sqlText,
      binds,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      complete: (err: unknown, _stmt: unknown, rows: any[]) => (err ? rej(err) : res(rows ?? [])),
    })
  );
}

/* ---------------- Public API ---------------- */

export async function insertSession(s: SessionRecord): Promise<void> {
  // Always keep a local copy — personas/conversation state are read back from it.
  const rows = readLocal();
  rows.push(s);
  writeLocal(rows);
  if (!SF_ENABLED) return;
  try {
    await sfQuery(
      `INSERT INTO sessions (id, passion_label, passion_category, years_active, years_dormant,
         abandonment_reason, age_at_abandonment, emotional_tone, verdict, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP())`,
      [s.id, s.passionLabel, s.passionCategory, s.yearsActive, s.yearsDormant,
       s.abandonmentReason, s.ageAtAbandonment, s.emotionalTone, s.verdict]
    );
  } catch (e) {
    console.error("Snowflake insert failed (local copy kept):", e);
  }
}

export async function getSession(id: string): Promise<SessionRecord | null> {
  return readLocal().find((r) => r.id === id) ?? null;
}

export async function updateSession(id: string, patch: Partial<SessionRecord>): Promise<void> {
  const rows = readLocal();
  const i = rows.findIndex((r) => r.id === id);
  if (i === -1) return;
  rows[i] = { ...rows[i], ...patch };
  writeLocal(rows);
  if (!SF_ENABLED) return;
  try {
    await sfQuery(`UPDATE sessions SET verdict = ?, pledge_tx = ? WHERE id = ?`, [
      rows[i].verdict, rows[i].pledgeTx, id,
    ]);
  } catch (e) {
    console.error("Snowflake update failed:", e);
  }
}

export async function atlasStats(): Promise<AtlasStats> {
  if (SF_ENABLED) {
    try {
      const [totals, byPassion, byCat, byReason] = await Promise.all([
        sfQuery(`SELECT COUNT(*) AS TOTAL,
                        SUM(IFF(verdict = 'rekindled', 1, 0)) AS REKINDLED,
                        SUM(IFF(verdict = 'laid_to_rest', 1, 0)) AS RESTED,
                        AVG(years_dormant) AS AVG_DORMANT
                 FROM sessions`),
        sfQuery(`SELECT LOWER(passion_label) AS L, COUNT(*) AS C FROM sessions GROUP BY 1 ORDER BY 2 DESC LIMIT 8`),
        sfQuery(`SELECT passion_category AS L, COUNT(*) AS C FROM sessions GROUP BY 1 ORDER BY 2 DESC`),
        sfQuery(`SELECT abandonment_reason AS L, COUNT(*) AS C FROM sessions GROUP BY 1 ORDER BY 2 DESC`),
      ]);
      const t = totals[0] ?? {};
      return {
        total: Number(t.TOTAL ?? 0),
        rekindled: Number(t.REKINDLED ?? 0),
        laidToRest: Number(t.RESTED ?? 0),
        avgYearsDormant: Math.round(Number(t.AVG_DORMANT ?? 0) * 10) / 10,
        topPassions: byPassion.map((r) => ({ label: String(r.L), count: Number(r.C) })),
        byCategory: byCat.map((r) => ({ category: String(r.L), count: Number(r.C) })),
        byReason: byReason.map((r) => ({ reason: String(r.L), count: Number(r.C) })),
        source: "snowflake",
      };
    } catch (e) {
      console.error("Snowflake atlas query failed, falling back to local:", e);
    }
  }
  return computeAtlas(readLocal(), "local");
}
