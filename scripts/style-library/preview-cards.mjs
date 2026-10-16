#!/usr/bin/env node
/**
 * preview-cards.mjs — render the 2-3s loop + poster GUIDE.md requires per card.
 *
 * GUIDE: "a preview is produced by rendering the card on its own (via the
 * HyperFrames CLI) and grabbing frame 1 as the poster. The preview script is
 * added once the first real card exists" — this is that script.
 *
 *   node scripts/style-library/preview-cards.mjs 03-mimmo
 *   node scripts/style-library/preview-cards.mjs 03-mimmo --seconds 3
 *   node scripts/style-library/preview-cards.mjs 02-kallaway --card kallaway.t1.stat.bigfig
 *
 * The CLI renders a project directory, not a loose file, so each card is copied
 * into a scratch project with its tokens.css beside it. tier2 cards are overlays
 * and would preview as black, so they are rendered over a neutral backdrop —
 * that backdrop exists only in the preview, never in the card.
 *
 * MP4 loops go to renders/previews/<style>/ because check-kit treats loose media in
 * the distribution as an error, and GUIDE calls the loops regenerable. Posters are
 * committed alongside the cards.
 *
 * Needs FFmpeg 7+ (same floor as the cut scripts). Poster is taken after the
 * entrance settles, not at frame 1, so it shows the card rather than its first
 * frame of animation.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, copyFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const LIB = join(ROOT, "style-library");
const CLI = join(ROOT, "node_modules", ".bin", "hyperframes");

const args = process.argv.slice(2);
const style = args.find((a) => !a.startsWith("--"));
const seconds = Number(args[args.indexOf("--seconds") + 1]) || 3;
const onlyCard = args.includes("--card") ? args[args.indexOf("--card") + 1] : null;
if (!style) { console.error("usage: preview-cards.mjs <style-folder> [--seconds 3]"); process.exit(2); }

const dir = join(LIB, style);
const manifest = JSON.parse(readFileSync(join(dir, "style.json"), "utf8"));
const outDir = join(dir, "preview");           // posters: committed
const loopDir = join(ROOT, "renders", "previews", style);  // MP4 loops: generated, excluded from the distribution
mkdirSync(outDir, { recursive: true });
mkdirSync(loopDir, { recursive: true });

const scratch = join(ROOT, "tmp", `preview-${style}`);
const rows = [];

for (const card of (manifest.cards ?? []).filter((c) => !onlyCard || c.id === onlyCard)) {
  const src = join(dir, card.file);
  if (!existsSync(src)) { rows.push([card.id, "MISSING", "-"]); continue; }

  rmSync(scratch, { recursive: true, force: true });
  mkdirSync(scratch, { recursive: true });
  copyFileSync(join(dir, "tokens.css"), join(scratch, "tokens.css"));

  let html = readFileSync(src, "utf8").replace(/href="[^"]*tokens\.css"/, 'href="tokens.css"');
  if (card.tier === "tier2") {
    // preview-only backdrop so an overlay card is visible against something
    html = html.replace("<body>", '<body>\n    <div style="position:absolute;inset:0;background:#3B3B4D"></div>');
  }
  writeFileSync(join(scratch, "index.html"), html);

  const raw = join(scratch, "raw.mp4");
  execFileSync(CLI, ["render", scratch, "-o", raw, "-q", "draft"], { stdio: ["ignore", "ignore", "pipe"] });

  const mp4 = join(loopDir, `${card.id}.mp4`);
  const png = join(outDir, `${card.id}.png`);
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", raw, "-t", String(seconds), "-an", mp4]);
  execFileSync("ffmpeg", ["-v", "error", "-y", "-ss", "2", "-i", raw, "-frames:v", "1", png]);

  const dur = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", raw])
    .toString().trim();
  rows.push([card.id, `${Number(dur).toFixed(1)}s source`, `${basename(mp4)} + ${basename(png)}`]);
}

rmSync(scratch, { recursive: true, force: true });
console.log(`\n${style} — posters in ${join(style, "preview")}, loops in ${join("renders", "previews", style)}\n`);
for (const [id, a, b] of rows) console.log(`  ${id.padEnd(26)} ${a.padEnd(16)} ${b}`);
console.log("\nPreviews are the motion check. Watch them before using a card in a real video.");
