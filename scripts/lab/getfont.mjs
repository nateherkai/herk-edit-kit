#!/usr/bin/env node
// getfont.mjs — download Google Font woff2 files into a project and print @font-face CSS.
// Usage: node getfont.mjs <project-dir> "Instrument Sans" 400,700 [italic]
// HyperFrames only bundles 18 families; anything else needs a real @font-face + local file.
import { mkdir, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const [dir, family, weightsArg = '400', italic] = process.argv.slice(2);
if (!dir || !family) {
  console.error('usage: node getfont.mjs <project-dir> "Family Name" [weights] [italic]');
  process.exit(1);
}
const weights = weightsArg.split(',').map(w => w.trim()).filter(Boolean);
const ital = italic === 'italic';

// woff2 requires a modern UA; Google serves ttf to unknown agents.
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';
const spec = ital
  ? `${family}:ital,wght@${weights.map(w => `1,${w}`).join(';')}`
  : `${family}:wght@${weights.join(';')}`;
const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(spec)}&display=swap`;

const res = await fetch(cssUrl, { headers: { 'User-Agent': UA } });
if (!res.ok) { console.error(`Google Fonts said ${res.status} for "${family}" — check the exact family name.`); process.exit(1); }
const css = await res.text();

// Keep only the latin block; other subsets bloat the project for no visible gain.
const blocks = [...css.matchAll(/\/\*\s*([\w-\[\]]+)\s*\*\/\s*@font-face\s*\{([^}]+)\}/g)]
  .filter(m => m[1] === 'latin' || m[1] === 'latin-ext');
if (!blocks.length) { console.error('No latin @font-face blocks returned. Is the family/weight combination valid?'); process.exit(1); }

const slug = family.toLowerCase().replace(/\s+/g, '-');
const fontsDir = join(dir, 'assets', 'fonts');
await mkdir(fontsDir, { recursive: true });

const out = [];
for (const [, subset, body] of blocks) {
  const url = body.match(/url\((https:[^)]+\.woff2)\)/)?.[1];
  const weight = body.match(/font-weight:\s*([^;]+);/)?.[1].trim() ?? '400';
  const style = body.match(/font-style:\s*([^;]+);/)?.[1].trim() ?? 'normal';
  const unicode = body.match(/unicode-range:\s*([^;]+);/)?.[1].trim();
  if (!url) continue;

  const name = `${slug}-${weight.replace(/\s+/g, '')}-${style}-${subset}.woff2`;
  const bin = await fetch(url, { headers: { 'User-Agent': UA } });
  await writeFile(join(fontsDir, name), Buffer.from(await bin.arrayBuffer()));

  out.push(`@font-face{font-family:'${family}';font-style:${style};font-weight:${weight};font-display:block;` +
    `src:url('assets/fonts/${name}') format('woff2');` +
    (unicode ? `unicode-range:${unicode};` : '') + `}`);
  console.error(`  ✓ ${name}  (${(bin.headers.get('content-length') ?? '?')} bytes)`);
}

console.error(`\nPaste into <style>, or import ${relative(process.cwd(), join(fontsDir, '_' + slug + '.css'))}:\n`);
await writeFile(join(fontsDir, `_${slug}.css`), out.join('\n') + '\n');
console.log(out.join('\n'));
