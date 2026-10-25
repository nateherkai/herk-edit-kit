// Credencial da Higgsfield para os scripts da skill vsl.
// Ordem de busca: variáveis de ambiente → .env na raiz do kit (hyperframes-student-kit\.env).
// Formatos aceitos (a Higgsfield mudou o painel em 2026):
//   HIGGSFIELD_API_KEY=<chave única copiada do open.higgsfield.ai>   ("cole como está")
//   HIGGSFIELD_API_KEY=<key id> + HIGGSFIELD_API_SECRET=<secret>     (formato antigo, key id + secret)
// Nunca imprima a chave.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const API = "https://api.higgsfield.ai";
export const KIT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..");
export const KIT_ENV = join(KIT, ".env");
const FALLBACK_ENVS = [KIT_ENV];

function parseEnv(file) {
  const out = {};
  for (const l of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return out;
}

export function loadCredential() {
  let key = process.env.HIGGSFIELD_API_KEY, secret = process.env.HIGGSFIELD_API_SECRET, source = "ambiente";
  if (!key) {
    for (const f of FALLBACK_ENVS) {
      if (!existsSync(f)) continue;
      const e = parseEnv(f);
      if (e.HIGGSFIELD_API_KEY) { key = e.HIGGSFIELD_API_KEY; secret = e.HIGGSFIELD_API_SECRET; source = f; break; }
    }
  }
  if (!key) return null;
  return { header: secret ? `Key ${key}:${secret}` : `Key ${key}`, source, format: secret ? "key id + secret" : "chave única" };
}

export function authHeaders() {
  const c = loadCredential();
  if (!c) throw new Error(`Chave da Higgsfield não encontrada. Rode: node ${join(".claude", "skills", "vsl", "scripts", "higgsfield-key.mjs")} setup`);
  return { Authorization: c.header, "Content-Type": "application/json" };
}

// 404 numa requisição inexistente = chave aceita; 401 = chave inválida.
export async function testCredential() {
  const c = loadCredential();
  if (!c) return { ok: false, reason: "sem chave" };
  const r = await fetch(`${API}/requests/00000000-0000-0000-0000-000000000000/status`, { headers: { Authorization: c.header } });
  if (r.status === 401 || r.status === 403) return { ok: false, reason: `chave recusada (${r.status})`, source: c.source };
  return { ok: true, status: r.status, source: c.source, format: c.format };
}
