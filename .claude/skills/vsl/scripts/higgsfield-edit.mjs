// Edita um clipe existente na Higgsfield (Kling O3 video-edit): troca roupa/cenário mantendo movimento.
// Uso:  node higgsfield-edit.mjs <src.mp4> <out.mp4> "<prompt>" [--ref img.jpg ...] [--mode std|pro|4k] [--model kling-video/o3/video-edit] [--estimate]
//   --estimate : só mostra a faixa de custo pela duração do clipe e sai — NÃO sobe a footage nem gera nada.
//   Numa geração de verdade o script ainda tenta o /estimate oficial da API antes de enviar.
// Credencial: hf-auth.mjs (ambiente → .env do kit); aceita a chave única do painel
//   novo (open.higgsfield.ai, "cole como está") ou key id + secret. Configurar/testar: higgsfield-key.mjs setup | test
// Limites Kling O3: vídeo de 3 a 15,5 s, ≤ 200 MB, até 4 imagens de referência.
// Preço (open.higgsfield.ai/pricing em 09/10/2026): Kling O3 "from $0.084/s" (desconto de lançamento "from $0.042/s");
// no modo pro pagamos ~US$ 0,06–0,13/s em out/2026. A API não devolve o débito: o saldo fica no painel.
import { writeFileSync, statSync } from "node:fs";
import { basename, extname } from "node:path";
import { execFileSync } from "node:child_process";
import { API, authHeaders } from "./hf-auth.mjs";

const args = process.argv.slice(2);
const pos = []; const refs = []; let mode = "pro"; let model = "kling-video/o3/video-edit"; let estimateOnly = false;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--ref") refs.push(args[++i]);
  else if (args[i] === "--mode") mode = args[++i];
  else if (args[i] === "--model") model = args[++i];
  else if (args[i] === "--estimate") estimateOnly = true;
  else pos.push(args[i]);
}
const [src, out, prompt] = pos;
if (!src || !out || !prompt) { console.error('uso: higgsfield-edit.mjs <src.mp4> <out.mp4> "<prompt>" [--ref img] [--mode pro] [--estimate]'); process.exit(1); }

const H = authHeaders();
const secs = (() => { try { return +execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", src]).toString().trim(); } catch { return NaN; } })();
const tabela = () => isFinite(secs) ? `${secs.toFixed(1)} s × US$ 0,042–0,126/s ≈ US$ ${(secs * 0.042).toFixed(2)}–${(secs * 0.126).toFixed(2)} (faixa da tabela)` : "duração desconhecida";
if (estimateOnly) { console.log(`custo: ${tabela()}`); process.exit(0); }

async function upload(path) {
  const ext = extname(path).toLowerCase();
  const type = ext === ".mp4" ? "video/mp4" : ext === ".png" ? "image/png" : "image/jpeg";
  const r = await fetch(`${API}/files/generate-upload-url`, { method: "POST", headers: H, body: JSON.stringify({ content_type: type }) });
  if (!r.ok) throw new Error(`upload-url ${r.status}: ${await r.text()}`);
  const info = await r.json();
  const put = await fetch(info.upload_url, { method: "PUT", headers: info.upload_headers || { "Content-Type": type }, body: readFileSync(path) });
  if (!put.ok) throw new Error(`PUT ${put.status}: ${await put.text()}`);
  console.log(`  enviado ${basename(path)} (${(statSync(path).size / 1e6).toFixed(1)} MB)`);
  return info.public_url;
}

const t0 = Date.now();
console.log(`modelo ${model} · modo ${mode}`);
const video_url = await upload(src);
const image_urls = []; for (const r of refs) image_urls.push(await upload(r));
const body = { prompt, video_urls: [video_url], mode };
if (image_urls.length) body.image_urls = image_urls;
// custo antes de gerar: tenta o endpoint oficial de estimativa (o Kling O3 video-edit às vezes responde 500) → tabela
let est = null;
try {
  const e = await fetch(`${API}/estimate/${model}`, { method: "POST", headers: H, body: JSON.stringify(body) });
  if (e.ok) est = await e.json();
} catch {}
console.log(est ? `  custo estimado pela API: US$ ${est.usd} (${est.credits} créditos)` : `  custo: ${tabela()}`);
const sub = await fetch(`${API}/${model}`, { method: "POST", headers: H, body: JSON.stringify(body) });
if (!sub.ok) throw new Error(`submit ${sub.status}: ${await sub.text()}`);
const job = await sub.json();
console.log(`  request ${job.request_id} (${job.status})`);
const statusUrl = job.status_url || `${API}/requests/${job.request_id}/status`;
let data;
for (let i = 0; i < 240; i++) {
  await new Promise((r) => setTimeout(r, 5000));
  const p = await fetch(statusUrl, { headers: H });
  if (!p.ok) throw new Error(`status ${p.status}: ${await p.text()}`);
  data = await p.json();
  const st = String(data.status || "").toLowerCase();
  if (i % 6 === 0) console.log(`  ${st} … ${Math.round((Date.now() - t0) / 1000)}s`);
  if (st === "completed") break;
  if (["failed", "nsfw", "canceled", "cancelled"].includes(st)) throw new Error(`geração ${st}: ${JSON.stringify(data).slice(0, 600)}`);
}
const url = data?.video?.url || (JSON.stringify(data).match(/https?:\/\/[^"\s]+\.mp4[^"\s]*/) || [])[0];
if (!url) throw new Error(`sem URL de vídeo: ${JSON.stringify(data).slice(0, 600)}`);
const v = await fetch(url); if (!v.ok) throw new Error(`download ${v.status}`);
writeFileSync(out, Buffer.from(await v.arrayBuffer()));
writeFileSync(out.replace(/\.mp4$/, ".json"), JSON.stringify({ model, mode, prompt, refs, request_id: job.request_id, url, seconds: Math.round((Date.now() - t0) / 1000) }, null, 2));
console.log(`pronto: ${out} (${Math.round((Date.now() - t0) / 1000)}s)`);
