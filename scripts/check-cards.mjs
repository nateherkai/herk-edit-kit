#!/usr/bin/env node
/**
 * check-cards.mjs — enforce the style-library card contract mechanically.
 *
 * GUIDE.md defines what every card MUST do, and style-library/SKILL.md warns that
 * "the catalog contains draft resources, not a promise that every card has passed
 * rendered QA". Nothing checked the contract itself, so a card that Agent 3 cannot
 * mount, or whose placeholder copy overflows its declared slot, is only discovered
 * at render time.
 *
 *   node scripts/check-cards.mjs              every style
 *   node scripts/check-cards.mjs 03-mimmo     one style
 *   node scripts/check-cards.mjs --rules      what it enforces
 *
 * FAIL = the card will not mount or will render wrong. WARN = style hygiene.
 * Exit 1 on any failure. This does NOT render: a clean pass still needs a human
 * to watch the output, per the kit's own quality gates.
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LIB = join(ROOT, "style-library");

const RULES = [
  ["root-attrs",    "FAIL", "root div carries id, data-composition-id, data-start, data-width=1920, data-height=1080"],
  ["timeline-key",  "FAIL", "exactly one window.__timelines[...] registration, keyed to the composition id"],
  ["slots-declared","FAIL", "every data-slot in the HTML is declared in style.json, and every declared slot exists"],
  ["slot-overflow", "FAIL", "default slot copy fits the declared maxChars / maxItems"],
  ["gsap-missing",  "FAIL", "a card using gsap loads it itself, so it runs standalone"],
  ["determinism",   "FAIL", "no Date.now(), unseeded Math.random(), or fetch()"],
  ["file-missing",  "FAIL", "every card file named in style.json exists on disk"],
  ["tier-bg",       "FAIL", "tier1 root is opaque; tier2 root is transparent (it overlays the speaker)"],
  ["hardcoded",     "WARN", "colours and font families come from tokens.css, not literals"],
];

if (process.argv.includes("--rules")) {
  for (const [id, sev, why] of RULES) console.log(`${sev.padEnd(5)} ${id.padEnd(16)} ${why}`);
  process.exit(0);
}

const only = process.argv.slice(2).find((a) => !a.startsWith("--"));
const styles = readdirSync(LIB, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith("_") && existsSync(join(LIB, d.name, "style.json")))
  .map((d) => d.name)
  .filter((n) => !only || n === only);

if (!styles.length) { console.error(only ? `no style "${only}"` : "no styles found"); process.exit(2); }

let fails = 0, warns = 0;
const say = (sev, where, rule, msg) => {
  if (sev === "FAIL") fails++; else warns++;
  console.log(`${sev} ${where}  [${rule}]  ${msg}`);
};

for (const style of styles) {
  const dir = join(LIB, style);
  const manifest = JSON.parse(readFileSync(join(dir, "style.json"), "utf8"));
  console.log(`\n=== ${style} — ${manifest.cards?.length ?? 0} card(s) ===`);

  for (const card of manifest.cards ?? []) {
    const file = join(dir, card.file);
    const where = relative(ROOT, file);
    if (!existsSync(file)) { say("FAIL", where, "file-missing", `declared by ${card.id} but not on disk`); continue; }
    const html = readFileSync(file, "utf8");

    // root attributes + composition id
    const root = html.match(/<div([^>]*data-composition-id=["']([^"']+)["'][^>]*)>/);
    if (!root) { say("FAIL", where, "root-attrs", "no root div with data-composition-id"); continue; }
    const [, attrs, compId] = root;
    for (const need of ["id=", "data-start=", 'data-width="1920"', 'data-height="1080"']) {
      if (!attrs.includes(need)) say("FAIL", where, "root-attrs", `root div missing ${need}`);
    }

    // timeline registration
    const keys = [...html.matchAll(/window\.__timelines\[\s*["']([^"']+)["']\s*\]\s*=/g)].map((m) => m[1]);
    if (keys.length !== 1) say("FAIL", where, "timeline-key", `expected 1 registration, found ${keys.length}`);
    else if (keys[0] !== compId) say("FAIL", where, "timeline-key", `registers "${keys[0]}" but composition id is "${compId}"`);

    // a standalone card must be able to run on its own
    if (/\bgsap\s*\./.test(html) && !/<script[^>]+src=["'][^"']*gsap[^"']*["']/.test(html))
      say("FAIL", where, "gsap-missing", "uses gsap but never loads it — the card cannot preview or render standalone");

    // determinism
    for (const [re, name] of [[/Date\.now\(/, "Date.now()"], [/Math\.random\(/, "Math.random()"], [/\bfetch\(/, "fetch()"]]) {
      if (re.test(html)) say("FAIL", where, "determinism", `uses ${name}`);
    }

    // tier background discipline
    const rootCss = html.match(new RegExp(`#${compId}\\s*\\{[^}]*\\}`));
    if (rootCss) {
      const transparent = /background:\s*transparent/.test(rootCss[0]);
      if (card.tier === "tier2" && !transparent) say("FAIL", where, "tier-bg", "tier2 root is not transparent — it would cover the speaker");
      if (card.tier === "tier1" && transparent) say("FAIL", where, "tier-bg", "tier1 root is transparent — a takeover must be opaque");
    }

    // slots: declared vs present, and default copy length
    const declared = new Map((card.slots ?? []).map((s) => [s.name, s]));
    const present = [...html.matchAll(/data-slot=["']([^"']+)["']/g)].map((m) => m[1]);
    for (const n of present) if (!declared.has(n)) say("FAIL", where, "slots-declared", `data-slot="${n}" is not declared in style.json`);
    // Some cards attach data-slot in JS at runtime; a static scan cannot see those.
    const dynamicSlots = /setAttribute\(\s*["']data-slot["']/.test(html);
    for (const n of declared.keys()) {
      if (present.includes(n)) continue;
      if (dynamicSlots) say("WARN", where, "slots-declared", `"${n}" not in the static markup; this card builds slots in JS, so it cannot be verified here — render it`);
      else say("FAIL", where, "slots-declared", `style.json declares "${n}" but no element carries it`);
    }

    for (const name of present) {
      const spec = declared.get(name);
      if (!spec) continue;
      const block = html.match(new RegExp(`data-slot=["']${name}["'][^>]*>([\\s\\S]*?)</`));
      if (!block) continue;
      if (spec.type === "list") {
        const listBlock = html.match(new RegExp(`data-slot=["']${name}["'][^>]*>([\\s\\S]*?)</ul>`));
        const items = listBlock
          ? [...listBlock[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map((x) => x[1].replace(/<[^>]*>/g, "").trim())
          : [];
        if (spec.maxItems && items.length > spec.maxItems)
          say("FAIL", where, "slot-overflow", `"${name}" has ${items.length} default items, maxItems ${spec.maxItems}`);
        for (const it of items) if (spec.maxChars && it.length > spec.maxChars)
          say("FAIL", where, "slot-overflow", `"${name}" item ${it.length} chars > maxChars ${spec.maxChars}: ${it.slice(0, 40)}`);
      } else {
        const text = block[1].replace(/<[^>]*>/g, "").trim();
        if (spec.maxChars && text.length > spec.maxChars)
          say("FAIL", where, "slot-overflow", `"${name}" default is ${text.length} chars > maxChars ${spec.maxChars}`);
      }
    }

    // hygiene: literal colours / fonts inside the <style> block
    const css = (html.match(/<style>([\s\S]*?)<\/style>/) || ["", ""])[1];
    for (const m of css.matchAll(/(?:color|background(?:-color)?|border[a-z-]*|fill)\s*:\s*([^;{}]+);/gi)) {
      const v = m[1].trim();
      const hex = v.match(/#[0-9a-f]{3,8}\b/i);
      const rgbLit = /\brgba?\(\s*[\d.]/.test(v);   // rgba(var(--x), .5) is fine; rgba(0,0,0,.5) is not
      if (hex || rgbLit) say("WARN", where, "hardcoded", `literal colour ${hex ? hex[0] : v.slice(0, 28)} — use a tokens.css variable`);
    }
    for (const m of css.matchAll(/font-family\s*:\s*([^;{}]+);/g)) {
      const v = m[1].trim();
      if (!v.startsWith("var(")) say("WARN", where, "hardcoded", `literal font-family ${v.slice(0, 40)} — use var(--font-*)`);
    }
  }
}

console.log("");
console.log(`${fails} failure(s), ${warns} warning(s).`);
console.log("A clean pass is the contract only. Render the cards you use and watch them — the kit's own gates require it.");
process.exit(fails ? 1 : 0);
