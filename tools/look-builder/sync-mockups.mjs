#!/usr/bin/env node
// Extracts the template mockups (CSS + builder code) from the kit's own landing page into mockups.mjs,
// so the Look builder cards use the same mini phones. Re-run after editing landing-pages/edicao-claude/index.html:
//   node tools/look-builder/sync-mockups.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..", "..");
const src = readFileSync(resolve(root, "landing-pages/edicao-claude/index.html"), "utf8");

const between = (a, b) => { const i = src.indexOf(a), j = src.indexOf(b, i); if (i < 0 || j < 0) throw new Error(`landing markup changed: cannot find ${a} … ${b}`); return src.slice(i, j).trim(); };
const css = between("/* MINI TELAS (mockups) */", "/* ENTREGÁVEIS */");
const js = between("const A = (s, inner", "// Gradientes do apresentador");
const chrome = between("const NORAIL", "const ESTILOS");
const defs = (src.match(/insertAdjacentHTML\('afterbegin', '(<svg.*?<\/svg>)'\)/) || [])[1];
if (!defs) throw new Error("landing markup changed: presenter gradient defs not found");

const tpl = (s) => s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
const out = [
  "// Mini mockups of the editing templates, taken from the kit's own landing page (landing-pages/edicao-claude/index.html):",
  "// dark phone frame, a neutral presenter in clay/cream, each layout drawn with positioned divs and cqw text so it scales",
  "// with the card. Generated file: regenerate with `node tools/look-builder/sync-mockups.mjs` after editing the landing.",
  "export const MOCKUP_CSS = `" + tpl(css) + "`;",
  "export const PERSON_DEFS = `" + tpl(defs) + "`;",
  js,
  chrome,
  "export const KINDS = Object.keys(L);",
  'export function mockupHtml(kind, wide = false) { const k = L[kind] ? kind : "pessoal"; return `<div class="phone${wide ? " w" : ""}">${L[k]}${wide ? "" : chrome(k)}</div>`; }',
  "",
].join("\n");
writeFileSync(resolve(here, "mockups.mjs"), out);
console.log(`mockups.mjs regenerated (${(out.length / 1024).toFixed(0)} KB)`);
