// Seeds .data/sessions.json with realistic Atlas entries.
// Run: node scripts/seed.mjs
import fs from "fs";
import path from "path";
import crypto from "crypto";

const seeds = [
  ["cricket", "sport", 6, 8, "life_event", 17, "wistful", "rekindled"],
  ["cricket", "sport", 9, 4, "time", 22, "guilty", "undecided"],
  ["cricket", "sport", 5, 11, "injury", 19, "peaceful", "laid_to_rest"],
  ["guitar", "music", 4, 6, "lost_joy", 21, "wistful", "rekindled"],
  ["guitar", "music", 2, 9, "time", 24, "guilty", "undecided"],
  ["guitar", "music", 7, 3, "life_event", 28, "wistful", "rekindled"],
  ["novel writing", "writing", 3, 5, "fear", 26, "bitter", "undecided"],
  ["novel writing", "writing", 1, 2, "fear", 31, "guilty", "rekindled"],
  ["poetry", "writing", 5, 12, "life_event", 23, "peaceful", "laid_to_rest"],
  ["piano", "music", 10, 15, "life_event", 18, "wistful", "laid_to_rest"],
  ["piano", "music", 6, 2, "time", 33, "guilty", "rekindled"],
  ["football", "sport", 8, 6, "injury", 20, "bitter", "laid_to_rest"],
  ["football", "sport", 12, 3, "time", 27, "wistful", "rekindled"],
  ["marathon running", "sport", 4, 2, "injury", 30, "guilty", "undecided"],
  ["swimming", "sport", 7, 10, "life_event", 16, "peaceful", "laid_to_rest"],
  ["oil painting", "art", 3, 7, "money", 25, "wistful", "undecided"],
  ["sketching", "art", 9, 4, "time", 26, "guilty", "rekindled"],
  ["photography", "art", 5, 3, "lost_joy", 29, "peaceful", "undecided"],
  ["ballet", "sport", 11, 9, "injury", 19, "wistful", "laid_to_rest"],
  ["chess", "other", 6, 5, "lost_joy", 22, "peaceful", "undecided"],
  ["violin", "music", 8, 13, "life_event", 17, "wistful", "laid_to_rest"],
  ["french", "language", 2, 4, "time", 27, "guilty", "rekindled"],
  ["japanese", "language", 1, 3, "time", 25, "guilty", "undecided"],
  ["woodworking", "craft", 4, 6, "money", 35, "wistful", "rekindled"],
  ["pottery", "craft", 2, 2, "money", 28, "wistful", "undecided"],
  ["baking", "craft", 5, 1, "time", 32, "guilty", "rekindled"],
  ["skateboarding", "sport", 6, 8, "injury", 21, "bitter", "laid_to_rest"],
  ["dance", "sport", 7, 5, "fear", 23, "wistful", "rekindled"],
  ["singing", "music", 9, 7, "fear", 24, "guilty", "undecided"],
  ["blogging", "writing", 3, 4, "lost_joy", 28, "peaceful", "laid_to_rest"],
  ["game development", "craft", 2, 3, "time", 26, "guilty", "undecided"],
  ["astronomy", "other", 4, 9, "life_event", 20, "wistful", "undecided"],
  ["gardening", "other", 3, 2, "time", 34, "peaceful", "rekindled"],
  ["badminton", "sport", 5, 6, "time", 25, "wistful", "undecided"],
  ["tabla", "music", 6, 10, "life_event", 18, "wistful", "laid_to_rest"],
  ["cycling", "sport", 4, 3, "lost_joy", 29, "peaceful", "rekindled"],
  ["origami", "craft", 2, 5, "lost_joy", 22, "peaceful", "laid_to_rest"],
  ["stand-up comedy", "other", 1, 2, "fear", 27, "bitter", "undecided"],
  ["short films", "art", 3, 4, "money", 24, "wistful", "undecided"],
  ["kite flying", "other", 8, 14, "life_event", 15, "peaceful", "laid_to_rest"],
];

const now = Date.now();
const rows = seeds.map(([label, cat, active, dormant, reason, age, tone, verdict], i) => ({
  id: crypto.randomUUID(),
  passionLabel: label,
  passionCategory: cat,
  yearsActive: active,
  yearsDormant: dormant,
  abandonmentReason: reason,
  ageAtAbandonment: age,
  emotionalTone: tone,
  confession: `(seed) I used to love ${label}.`,
  persona: {
    name: `The ${label} you left behind`,
    embodiment: "the_passion_itself",
    temperament: "wistful",
    openingLine: "",
    systemPrompt: "(seed)",
  },
  verdict,
  verdictText: null,
  pledgeTx: null,
  createdAt: new Date(now - (i + 1) * 3600_000 * 7).toISOString(),
}));

const dir = path.join(process.cwd(), ".data");
const file = path.join(dir, "sessions.json");
fs.mkdirSync(dir, { recursive: true });
const existing = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : [];
const nonSeed = existing.filter((r) => !String(r.confession).startsWith("(seed)"));
fs.writeFileSync(file, JSON.stringify([...rows, ...nonSeed], null, 2));
console.log(`Seeded ${rows.length} sessions (${nonSeed.length} real sessions kept).`);
