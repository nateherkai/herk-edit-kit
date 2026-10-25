// Print output-timeline times for spoken phrases, to time overlays.
// Run in the project root: node <skill>/scripts/anchors.mjs "menos seguidores" "do que eu" ...
import { readFileSync } from "node:fs";
const w = JSON.parse(readFileSync("assets/transcript.json", "utf8")).words;
const n = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9%]/g, "");
for (const phrase of process.argv.slice(2)) {
  const p = phrase.split(/\s+/).map(n);
  const hits = [];
  for (let i = 0; i < w.length; i++) if (p.every((x, j) => w[i + j] && n(w[i + j].text) === x)) hits.push(`${w[i].start.toFixed(2)}–${w[i + p.length - 1].end.toFixed(2)}`);
  console.log(`${phrase.padEnd(32)} ${hits.join("  ") || "??"}`);
}
