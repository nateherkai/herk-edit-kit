#!/usr/bin/env node
/**
 * check-placeholders.mjs — fail a build that still contains the kit's
 * illustrative placeholder content.
 *
 * The kit's own docs say:
 *
 *   "Library names, handles, statistics, and source labels inside cards are
 *    illustrative placeholders. Replace them with your own verified copy
 *    before publishing a video."
 *
 * Nothing enforced that. This does. Ship an unreplaced card and you publish an
 * invented statistic, under a fabricated source line, on your own channel.
 *
 *   node scripts/check-placeholders.mjs                 scan video-projects/
 *   node scripts/check-placeholders.mjs path/to/project scan one project
 *   node scripts/check-placeholders.mjs --list          show what it looks for
 *
 * The style library is NOT scanned by default and must not be: its cards are
 * supposed to contain placeholders. Only your built project has to be clean.
 *
 * Exit 0 = clean. Exit 1 = placeholders found. Exit 2 = bad usage.
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/* Each rule: what it catches, and why it matters if it ships. */
const FAIL = [
  { id: "source-label", re: /SOURCE\s*[·|\-–—:]\s*[^<>\n]{0,60}/gi,
    why: "fabricated citation line — attributes a number to a source that does not exist" },
  { id: "placeholder-handle", re: /@(handle|yourchannel|yourbrand|username|channel)\b/gi,
    why: "placeholder social handle" },
  { id: "shipped-handle", re: /@ronnymitchell\b/gi,
    why: "a specific handle carried in the library cards — replace it with your own" },
  { id: "font-placeholder", re: /["']FontName["']/g,
    why: "blueprint font placeholder — the card will fall back to a system face" },
  { id: "lorem", re: /lorem ipsum|your name here|example\.com|replace me/gi,
    why: "unreplaced dummy copy" },
];

/* Not failures. Numbers a human has to look at before publishing. */
const WARN = [
  { id: "statistic", re: />\s*(\d{1,3}(?:\.\d+)?\s*%|\d+(?:\.\d+)?\s*[BMK]\b|\d+\s*[x×]\b)\s*</g,
    why: "a statistic — verify it is yours and true, or replace it" },
];

const args = process.argv.slice(2);
if (args.includes("--list")) {
  console.log("FAILS the build:");
  for (const r of FAIL) console.log(`  ${r.id.padEnd(20)} ${r.why}`);
  console.log("\nWARNS only:");
  for (const r of WARN) console.log(`  ${r.id.padEnd(20)} ${r.why}`);
  process.exit(0);
}

const target = args.find((a) => !a.startsWith("--")) || join(ROOT, "video-projects");
if (!existsSync(target)) {
  console.log(`check-placeholders: nothing to scan — ${relative(ROOT, target) || target} does not exist yet.`);
  console.log("Build a project first, then run this before you publish.");
  process.exit(0);
}

const SKIP = new Set(["node_modules", ".git", "_preview", "style-library", "docs", "examples", "tests"]);
const EXT = /\.(html?|css|json|md|txt)$/i;

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP.has(entry.name)) walk(join(dir, entry.name), out);
    } else if (EXT.test(entry.name)) {
      out.push(join(dir, entry.name));
    }
  }
  return out;
}

const files = statSync(target).isDirectory() ? walk(target) : [target];
let fails = 0, warns = 0;

for (const file of files) {
  const lines = readFileSync(file, "utf8").split("\n");
  const rel = relative(ROOT, file);
  lines.forEach((line, i) => {
    for (const rule of FAIL) {
      for (const m of line.matchAll(rule.re)) {
        fails++;
        console.log(`FAIL ${rel}:${i + 1}  [${rule.id}]  ${m[0].trim().slice(0, 70)}`);
        console.log(`       ${rule.why}`);
      }
    }
    for (const rule of WARN) {
      for (const m of line.matchAll(rule.re)) {
        warns++;
        console.log(`warn ${rel}:${i + 1}  [${rule.id}]  ${m[0].replace(/[<>]/g, "").trim()}`);
      }
    }
  });
}

console.log("");
if (fails) {
  console.log(`${fails} placeholder(s) must be replaced before publishing. ${warns} statistic(s) to verify.`);
  console.log("The kit's docs: 'Replace them with your own verified copy before publishing a video.'");
  process.exit(1);
}
console.log(`No placeholders. ${warns} statistic(s) flagged for a human to verify.`);
process.exit(0);
