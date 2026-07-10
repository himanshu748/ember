// Adds full-session columns so Snowflake is the system of record (serverless-safe),
// then backfills persona/confession from the local cache.
// Run: node --env-file=.env.local scripts/migrate-snowflake.mjs
import fs from "fs";
import snowflake from "snowflake-sdk";

snowflake.configure({ logLevel: "ERROR" });
const conn = snowflake.createConnection({
  account: process.env.SNOWFLAKE_ACCOUNT,
  username: process.env.SNOWFLAKE_USER,
  password: process.env.SNOWFLAKE_PASSWORD,
  warehouse: "COMPUTE_WH",
  database: "EMBER",
  schema: "PUBLIC",
});
const q = (sqlText, binds = []) =>
  new Promise((res, rej) =>
    conn.execute({ sqlText, binds, complete: (e, _s, rows) => (e ? rej(e) : res(rows)) })
  );

await new Promise((res, rej) => conn.connect((e) => (e ? rej(e) : res())));

await q(`ALTER TABLE sessions ADD COLUMN IF NOT EXISTS confession STRING`);
await q(`ALTER TABLE sessions ADD COLUMN IF NOT EXISTS persona_json STRING`);
await q(`ALTER TABLE sessions ADD COLUMN IF NOT EXISTS verdict_text STRING`);
console.log("columns ready");

const local = JSON.parse(fs.readFileSync(".data/sessions.json", "utf8"));
let backfilled = 0;
for (const s of local) {
  if (!s.confession?.startsWith("(seed)")) {
    await q(`UPDATE sessions SET confession = ?, persona_json = ?, verdict_text = ? WHERE id = ?`, [
      s.confession, JSON.stringify(s.persona), s.verdictText, s.id,
    ]);
    backfilled++;
  }
}
console.log(`backfilled ${backfilled} real sessions`);
conn.destroy(() => process.exit(0));
