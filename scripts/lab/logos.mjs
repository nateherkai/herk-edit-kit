#!/usr/bin/env node
// logos.mjs <project-dir> <slug[,slug…]> [--color HEX] [--size N]
//
// Baja logos de marca reales desde el CDN de Simple Icons a assets/logos/ del
// proyecto. Se bajan en vez de enlazarlos porque el motor renderiza sin red
// garantizada y porque una composición tiene que ser reproducible offline.
//
// El CDN devuelve el color de marca oficial; con --color se fuerza uno (útil
// para monocromo blanco sobre fondo oscuro).
// Slugs en https://simpleicons.org — no todas las marcas están: las que piden
// que no se use su logo salen con 404, y eso hay que verlo, no tragárselo.
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const args = process.argv.slice(2);
const dir = args[0], slugs = (args[1] || '').split(',').map(s => s.trim()).filter(Boolean);
const color = args.includes('--color') ? args[args.indexOf('--color') + 1].replace('#', '') : null;
if (!dir || !slugs.length) {
  console.error('uso: node logos.mjs <project-dir> <slug[,slug…]> [--color HEX]');
  process.exit(1);
}

const out = join(dir, 'assets', 'logos');
await mkdir(out, { recursive: true });

const ok = [], fail = [];
for (const slug of slugs) {
  const url = `https://cdn.simpleicons.org/${slug}${color ? '/' + color : ''}`;
  const r = await fetch(url);
  if (!r.ok) { fail.push(`${slug} (${r.status})`); continue; }
  const svg = await r.text();
  await writeFile(join(out, `${slug}.svg`), svg);
  ok.push({ slug, color: svg.match(/fill="(#[0-9A-Fa-f]{6})"/)?.[1] ?? '?' });
}

for (const { slug, color } of ok) console.log(`  ✓ ${slug.padEnd(22)} ${color}`);
if (fail.length) console.error(`\n  ✗ sin logo en Simple Icons: ${fail.join(' · ')}`);
console.log(`\n  ${ok.length}/${slugs.length} en ${out}`);
