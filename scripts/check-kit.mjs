#!/usr/bin/env node
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { resolve, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
let errors = 0;
const fail = message => { console.error(message); errors++; };
const ignore = new Set(['node_modules', '.git', 'video-projects', 'raw-media', 'tmp', 'archives', 'renders', '.venv', '.venv-tts', 'venv', '__pycache__']);
function walk(dir) { return readdirSync(dir, { withFileTypes: true }).flatMap(e => ignore.has(e.name) || e.name === '.env' ? [] : e.isDirectory() ? walk(join(dir,e.name)) : [join(dir,e.name)]); }
const files = walk(root);
// Explicitly approved public exports; other media remains excluded.
const publicMedia = new Set([
  'examples/showcase/ai-edits-everything-reveal.mp4',
  'examples/showcase/ai-edits-everything-raw-vs-edited.mp4',
  'examples/showcase/ais-live-ad.mp4',
  'examples/showcase/youtube-showreel.mp4',
]);
if (!readFileSync(join(root,'AGENTS.md')).equals(readFileSync(join(root,'CLAUDE.md')))) fail('Root instruction files differ');
const sync = spawnSync(process.execPath, [join(root,'scripts/sync-codex-skills.mjs'),'--check'], {encoding:'utf8'});
if (sync.status !== 0) fail(sync.stdout + sync.stderr);
const registry = JSON.parse(readFileSync(join(root,'style-library/registry.json')));
let cards = 0;
const ids = new Set();
for (const style of registry.styles) for (const card of style.cards) {
  cards++;
  if (ids.has(card.id)) fail(`Duplicate card: ${card.id}`); ids.add(card.id);
  const path = join(root,'style-library',card.file);
  if (!existsSync(path)) { fail(`Missing card: ${card.file}`); continue; }
  const html = readFileSync(path,'utf8');
  for (const slot of card.slots) {
    const literal = html.includes(`data-slot="${slot}"`) || html.includes(`data-slot='${slot}'`);
    // Two legacy cards construct slots synchronously in JS; validate those in preview.
    const generated = html.includes('setAttribute("data-slot"') && html.includes(`"${slot}"`);
    if (!literal && !generated) fail(`Missing slot ${slot}: ${card.file}`);
  }
  for (const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
    const value=match[1];
    if (/^(https?:|data:|#)/.test(value)) continue;
    if (!existsSync(resolve(dirname(path), value))) fail(`Missing card dependency ${value}: ${card.file}`);
  }
}
if (cards !== registry.cardCount) fail('Registry count is stale');
for (const p of files) {
  const rel = relative(root,p).replaceAll('\\','/');
  if (/\.(mp4|mov|wav|mp3|m4a|zip|pyc|pem|key)$/i.test(p) && !publicMedia.has(rel)) fail(`Private/binary material in distribution: ${rel}`);
  const bytes=readFileSync(p); if(bytes.includes(0)) continue;
  const text=bytes.toString('utf8');
  // Report locations, never the value of a suspected credential.
  if (/(?:sk-[A-Za-z0-9]{20,}|gh[pous]_[A-Za-z0-9]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY)/.test(text)) fail(`Possible credential: ${rel}`);
  if (/(?:[A-Z]:[\\/](?:Users|home)[\\/]|\/Users\/|\/home\/[a-z])/.test(text)) fail(`Machine-specific path: ${rel}`);
  if (/\.(mjs|js)$/.test(p)) {
    const check=spawnSync(process.execPath,['--check',p],{encoding:'utf8'});
    if(check.status !== 0) fail(`Syntax error: ${rel}\n${check.stderr}`);
  }
  if (p.endsWith('SKILL.md')) {
    if (!/^---\r?\nname: [a-z0-9-]+\r?\ndescription: [\s\S]+?\r?\n---/.test(text)) fail(`Invalid skill frontmatter: ${rel}`);
    for(const m of text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
      const target=m[1].split('#')[0];
      if (!target || /^(https?:|mailto:)/.test(target) || /[<>]/.test(target)) continue;
      if(!existsSync(resolve(dirname(p),target))) fail(`Broken skill resource ${target}: ${rel}`);
    }
  }
}
console.log(`Checked ${files.length} distribution files, ${registry.styles.length} styles, ${cards} cards, and both skill trees; ${errors} errors.`);
process.exitCode=errors ? 1 : 0;
