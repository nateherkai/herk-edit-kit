// Configura e testa a chave da Higgsfield (fluxo da aula "Higgsfield no Claude").
// Uso (na raiz do kit):
//   node .claude/skills/vsl/scripts/higgsfield-key.mjs setup   -> cria/abre o .env do kit no Bloco de Notas
//   node .claude/skills/vsl/scripts/higgsfield-key.mjs test    -> diz se a chave funciona (sem gastar crédito)
// A chave fica só no .env do kit (já está no .gitignore). Nunca peça para o aluno colar a chave no chat.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { KIT_ENV, testCredential } from "./hf-auth.mjs";

const cmd = process.argv[2] || "test";

if (cmd === "setup") {
  let txt = existsSync(KIT_ENV) ? readFileSync(KIT_ENV, "utf8") : "";
  if (!/^\s*HIGGSFIELD_API_KEY\s*=/m.test(txt)) {
    txt += `${txt && !txt.endsWith("\n") ? "\n" : ""}# Chave da API da Higgsfield (open.higgsfield.ai > API keys > Create API key > Copy API key). Não compartilhe.\nHIGGSFIELD_API_KEY=\n`;
    writeFileSync(KIT_ENV, txt);
  }
  console.log(`Arquivo: ${KIT_ENV}`);
  console.log("Cole a chave depois de HIGGSFIELD_API_KEY= , salve com Ctrl+S e feche.");
  const opener = process.platform === "win32" ? ["notepad.exe", [KIT_ENV]] : process.platform === "darwin" ? ["open", ["-e", KIT_ENV]] : ["xdg-open", [KIT_ENV]];
  spawn(opener[0], opener[1], { detached: true, stdio: "ignore" }).unref();
} else if (cmd === "test") {
  const r = await testCredential();
  if (r.ok) console.log(`✓ Chave da Higgsfield funcionando (${r.format}, lida de ${r.source}).`);
  else {
    console.log(r.reason === "sem chave"
      ? "✗ Nenhuma chave da Higgsfield configurada. Peça: \"Configura a minha chave da Higgsfield\" (abre o arquivo para colar)."
      : `✗ ${r.reason} — ${r.source}. Confira se colou a chave inteira, sem espaços, salvou o arquivo e tem saldo em open.higgsfield.ai.`);
    process.exitCode = 1;
  }
} else {
  console.error("uso: higgsfield-key.mjs setup | test");
  process.exitCode = 1;
}
