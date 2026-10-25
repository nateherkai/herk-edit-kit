// Search your screenshot index (OCR text) for candidate prints.
// Usage: node find-prints.mjs "seguidores" "1,6 mi" [--min-w 600] [--since 2026-01-01] [--limit 15]
// Score = number of query terms found in the OCR text (accent/case-insensitive). Always LOOK at a candidate before using it.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const idx = JSON.parse(readFileSync(join(here, "..", "..", "reel-oney", "prints-index.json"), "utf8").replace(/^﻿/, ""));
const argv = process.argv.slice(2);
const opt = (k, d) => (argv.includes(k) ? argv[argv.indexOf(k) + 1] : d);
const flags = new Set(["--min-w", "--since", "--limit"]);
const terms = argv.filter((a, i) => !a.startsWith("--") && !flags.has(argv[i - 1]));
const norm = (s) => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const minW = Number(opt("--min-w", 0)), since = opt("--since", ""), limit = Number(opt("--limit", 15));

const hits = idx
  .filter((x) => x.w >= minW && (!since || x.date >= since))
  .map((x) => ({ x, score: terms.reduce((n, t) => n + (norm(x.text).includes(norm(t)) ? 1 : 0), 0) }))
  .filter((h) => h.score > 0 || !terms.length)
  .sort((a, b) => b.score - a.score || b.x.date.localeCompare(a.x.date))
  .slice(0, limit);
for (const { x, score } of hits) console.log(`${score} | ${x.date} | ${x.w}x${x.h} | ${x.file}\n    ${norm(x.text).replace(/\s+/g, " ").slice(0, 160)}`);
if (!hits.length) console.log("no matches");
