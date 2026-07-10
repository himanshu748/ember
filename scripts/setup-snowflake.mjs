// One-time Snowflake provisioning: warehouse, database, table, seed data.
// Run: node --env-file=.env.local scripts/setup-snowflake.mjs
import fs from "fs";
import snowflake from "snowflake-sdk";

snowflake.configure({ logLevel: "ERROR" });

const conn = snowflake.createConnection({
  account: process.env.SNOWFLAKE_ACCOUNT,
  username: process.env.SNOWFLAKE_USER,
  password: process.env.SNOWFLAKE_PASSWORD,
});

const q = (sqlText, binds = []) =>
  new Promise((res, rej) =>
    conn.execute({ sqlText, binds, complete: (e, _s, rows) => (e ? rej(e) : res(rows)) })
  );

await new Promise((res, rej) => conn.connect((e) => (e ? rej(e) : res())));
console.log("connected");

await q(`CREATE WAREHOUSE IF NOT EXISTS COMPUTE_WH WITH WAREHOUSE_SIZE='X-SMALL' AUTO_SUSPEND=60 AUTO_RESUME=TRUE INITIALLY_SUSPENDED=TRUE`);
await q(`USE WAREHOUSE COMPUTE_WH`);
await q(`CREATE DATABASE IF NOT EXISTS EMBER`);
await q(`USE DATABASE EMBER`);
await q(`USE SCHEMA PUBLIC`);
await q(`CREATE TABLE IF NOT EXISTS sessions (
  id                 STRING,
  passion_label      STRING,
  passion_category   STRING,
  years_active       NUMBER,
  years_dormant      NUMBER,
  abandonment_reason STRING,
  age_at_abandonment NUMBER,
  emotional_tone     STRING,
  verdict            STRING DEFAULT 'undecided',
  pledge_tx          STRING,
  created_at         TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
)`);
console.log("schema ready");

const rows = JSON.parse(fs.readFileSync(".data/sessions.json", "utf8"));
const existing = await q(`SELECT COUNT(*) AS C FROM sessions`);
if (Number(existing[0].C) > 0) {
  console.log(`table already has ${existing[0].C} rows — skipping seed`);
} else {
  for (const s of rows) {
    await q(
      `INSERT INTO sessions (id, passion_label, passion_category, years_active, years_dormant,
        abandonment_reason, age_at_abandonment, emotional_tone, verdict, pledge_tx)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [s.id, s.passionLabel, s.passionCategory, s.yearsActive, s.yearsDormant,
       s.abandonmentReason, s.ageAtAbandonment, s.emotionalTone, s.verdict, s.pledgeTx]
    );
  }
  console.log(`inserted ${rows.length} sessions`);
}

const stats = await q(`SELECT COUNT(*) AS TOTAL, SUM(IFF(verdict='rekindled',1,0)) AS REKINDLED FROM sessions`);
console.log("snowflake totals:", JSON.stringify(stats[0]));
conn.destroy(() => process.exit(0));
