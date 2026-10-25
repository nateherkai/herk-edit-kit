#!/usr/bin/env node
// Abre a pasta do vídeo pronto no gerenciador de arquivos com o arquivo SELECIONADO.
// Uso (de qualquer pasta):  node <kit>/scripts/reveal.mjs <arquivo.mp4>
// Windows: Explorer (/select) · macOS: Finder (open -R) · Linux: abre a pasta.
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const arg = process.argv[2];
if (!arg) { console.error('uso: node scripts/reveal.mjs <arquivo>'); process.exit(1); }
const file = resolve(arg);
if (!existsSync(file)) { console.error(`não encontrado: ${file}`); process.exit(1); }
const run = (cmd, args) => spawn(cmd, args, { detached: true, stdio: 'ignore', windowsVerbatimArguments: true }).unref();
if (process.platform === 'win32') run('explorer.exe', [`/select,"${file.replace(/\//g, '\\')}"`]);
else if (process.platform === 'darwin') run('open', ['-R', file]);
else run('xdg-open', [dirname(file)]);
console.log(`pasta aberta: ${file}`);
