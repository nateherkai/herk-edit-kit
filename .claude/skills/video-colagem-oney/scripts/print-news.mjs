// Real screenshots of a news article for "prova" cards: the headline block and any paragraphs by keyword.
// Run from ANY dir:  node <skill>/scripts/print-news.mjs "<url>" <out-dir> "palavra 1" "palavra 2" …
// Output: <out-dir>/print-headline.png + print-<slug(palavra)>.png (mobile width, 2.5x, fixed/sticky site bars hidden).
// Uses the kit's playwright with the system Edge or Chrome (no browser download needed).
import { createRequire } from "node:module";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const kit = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const { chromium } = createRequire(resolve(kit, "package.json"))("playwright");
const [url, out, ...keys] = process.argv.slice(2);
const slug = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
let b;
for (const channel of ["msedge", "chrome", undefined]) { try { b = await chromium.launch({ headless: true, ...(channel ? { channel } : {}) }); break; } catch {} }
if (!b) { console.error("Nenhum navegador encontrado (instale o Google Chrome ou o Edge)."); process.exit(1); }
const p = await b.newPage({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 2.5 });
await p.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
await p.waitForTimeout(4000);
const clean = () => p.evaluate(() => { for (const e of document.querySelectorAll("body *")) { const s = getComputedStyle(e);
  if ((s.position === "fixed" || s.position === "sticky") && !e.querySelector("h1,p")) e.style.display = "none"; } });
const shot = async (find, arg, file, padTop, extra) => {
  await clean();
  const el = (await p.evaluateHandle(find, arg)).asElement(); if (!el) { console.log("not found:", file); return; }
  await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(400); await clean();
  const bx = await el.boundingBox();
  await p.screenshot({ path: `${out}/${file}`, clip: { x: 0, y: Math.max(0, bx.y - padTop), width: 430, height: bx.height + padTop + extra } });
  console.log("saved", file);
};
await shot(() => document.querySelector("h1"), null, "print-headline.png", 60, 150);
for (const k of keys) await shot((k) => [...document.querySelectorAll("p")].find((s) => s.innerText.includes(k)), k, `print-${slug(k)}.png`, 16, 16);
await b.close();
