---
name: vsl
description: Edit a talking-head recording (vertical 9:16) into a VSL / sales video in Oney Araújo's style (curso "Edição Viral com Claude"). Two looks in one skill - (1) the "roxo/laranja" motion-UI style (presenter flying between FULL / SPLIT / PIP layouts, display titles BEHIND the head via matte, glowing pills, glass cards, UI mockups, camcorder "BRUTO" hook, logo reveal, before/after wipe, CTA) and (2) the "clean" look (white / light-blue, no colour grade, one white panel above the head with Apple emojis and literal schematics, a full SKIN - font + colours - per profession/section, one-word captions at the collar following the head). OPTIONAL, ONLY when the user explicitly asks ("usa a Higgsfield"): swap outfit and room with Higgsfield (Kling O3 video-edit) keeping face, voice and movement ("modo médico / advogado"). Also handles the Higgsfield key setup: "configura a minha chave da Higgsfield", "abre o arquivo onde eu colo a chave", "testa se a chave da Higgsfield está funcionando". Use when the user says "/vsl", "VSL", "vídeo de venda", "estilo clean", "modo médico", "troca a roupa e o cenário", "usa a Higgsfield". For phone reels use reel-oney; explainer reels reel-explicativo-oney; editorial reel-editorial-oney; ads anuncios-oney.
---

# VSL roxo (motion UI)

**A regra:** o vídeo é uma conversa que **vira interface**. O apresentador nunca some por muito tempo: ele
voa entre 4 câmeras (FULL → SPLIT → PIP → FULL) e cada palavra-chave falada ganha um elemento entrando
**exatamente na palavra**. Tudo roxo, tudo com glow, tudo entrando com blur → nítido.

Referência analisada quadro a quadro: `references/BREAKDOWN.md` (mapa de 0:00 a 2:59, cada efeito com
tempo, geometria e easing) (as imagens de referência são material privado e não vêm no pacote)
(10 quadros/s de cada motion: gancho+glitch, título atrás, FULL→SPLIT, camadas 3D, marquee, mural, antes/depois, logo).
São material de estudo privado — nunca redistribuir nem usar como imagem em vídeo.
Leia o BREAKDOWN antes de planejar. Números e paleta: `template/DESIGN.md`. Implementação: `template/kit.js`.

## Fluxo (rode na raiz do kit `%USERPROFILE%\hyperframes-student-kit`)

`S=.claude/skills/vsl/scripts` · `E=.claude/skills/reel-editorial-oney/scripts` · `X=.claude/skills/reel-explicativo-oney/scripts`

1. **Projeto + transcrição**: `node $S/new-vsl.mjs "<video>" <slug>` → `video-projects/<slug>/assets/raw.mp4`, `raw.json`, `words.txt`.
2. **Corte apertado** (a referência não tem respiro): `assets/keeps.json` (retakes, falsas largadas) →
   em `assets/`: `~/.venvs/whisper/Scripts/python ../../../$X/tight-cut.py clean.mp4`.
   Retranscreva `clean.mp4` → `assets/transcript.json` (mesmo formato). Nunca misture tempos do raw com o clean.
3. **Matte (texto atrás da cabeça)**: na pasta do projeto
   `npx hyperframes remove-background assets/clean.mp4 -o assets/matte.webm` (padrão no pacote; u2net). Com placa NVIDIA e o venv `~/.venvs/matte` (RVM resnet50, opcional)
   dá para usar `matte.py`, que treme menos no cabelo.
   Sem matte o título fica NA FRENTE — então suba o título para não cobrir o rosto.
4. **Enquadramento** (`vsl.json`): olhe 1 frame de `clean.mp4` e ajuste
   `{"punch":1.22, "fullPos":"50% 28%", "splitPos":"50% 30%", "pipPos":"50% 24%", "pipZoom":1.55,
     "face":{"x":250,"y":330,"w":580,"h":700}, "head":{"x":540,"y":560}, "capY":1500}`
   — `face` = caixa do rosto já com o punch (para o HUD), `head` = centro da cabeça (órbita). Música opcional:
   `"music":{"file":"music.mp3","start":19,"volume":0.16}` (a referência só põe música depois do gancho).
5. **Mapa de beats** (`assets/map.md`): para cada frase do transcript, qual layout e qual componente
   (tabela "Gramática" abaixo). Regra de ritmo: FULL ~40 %, SPLIT ~45 %, PIP ~8 %, TAKEOVER ~7 %; algo novo
   a cada 1,5–3 s. Mostre o mapa ao aluno antes de montar se ele não pediu para ir direto.
6. **Beats** (`src/beats.js`): só chamadas `K.*` com tempos de `K.at("frase exata")`. `K.at` LANÇA ERRO se a frase
   não existir — corrija a frase, nunca chute segundos. Use `node $E/anchors.mjs "frase" …` para conferir.
7. **Build + lint**: na pasta do projeto `node ../../$S/build-index.mjs && npx hyperframes lint`.
   (o build recopia kit.js/kit.css/fonts/sfx da skill — melhorias no kit valem para todos os projetos).
8. **Conferir**: `npx hyperframes snapshot --at t1,t2,… --no-end` em CADA troca de layout e em cada efeito;
   olhe: rosto nunca coberto (exceto título atrás), textos dentro da zona segura, nada cortado, glow sem estourar.
   Draft: `npx hyperframes render -q draft -o renders/draft.mp4`; extraia frames das transições e ouça os SFX.
   Final: `npx hyperframes render -q high -o renders/<slug>-final.mp4`. Evidências em `VERIFY.md`. Nunca publique.

## Gramática (o que usar quando)

| Momento da fala | Câmera | Componente(s) |
|---|---|---|
| Gancho "antes/sem edição" (0–2 s) | FULL bruto | `K.camcorder(0,t)` → `K.glitch(t)` (troca grade + boom) |
| Frase-tese de impacto | FULL + punch | `K.behindTitle(["NOVA","ERA"], t)` (atrás da cabeça) |
| Lista de 2–4 coisas faladas em sequência | FULL | `K.stack([{text,t,style:'blur'|'letters'|'image'|'glow'}])` ou `K.chain([...],{sep:'+'|'↓',label})` |
| Frase-chave com termo forte | FULL | `K.cap({l1, hl})` (caixa roxa) · `K.cap({l1, big})` (linha grande lavanda) · `K.cap({acc})` |
| "Eu / quem sou / apresentador" | FULL | `K.faceHud(t)` (scan + cantoneiras + etiqueta) |
| Enumeração de benefícios/entregas | SPLIT | `K.section({kicker,title,acc},t)` + `K.grid([{img,label,icon,t}])` |
| Dor / bagunça | SPLIT | `K.files(n,t)` + `K.notes([...])` + pílulas `K.pill(...,{kind:'dark'})` |
| Ideia → resultado | SPLIT | `K.dashbox("ESPAÇO",t).drop(img,t2).wipe(img2,t3)` |
| Variedade / portfólio | SPLIT/FULL | `K.row3d(imgs,t)` · `K.fan(imgs,t)` · `K.orbit(imgs,t0,t1)` (atrás da cabeça) |
| ~~"Camadas / profundidade"~~ | — | **NÃO usar `K.layers3d`** (Oney vetou). Para "o que você vê é a minha personalização" use `K.versus(padrão, meu estilo, t)` |
| Gancho "tudo isso foi editado por IA" | FULL → 3D | `K.explode(t0,t1,{lines,phrase})` — o quadro gira em 3D, as camadas (vídeo · texto · recorte dele) se afastam e a frase falada aparece LEGÍVEL na camada de texto |
| Comando para IA / pedido | FULL ou SPLIT | `K.prompt(texto,t,{kicker,send})` |
| Mensagem / direct / comentário | SPLIT | `K.dm({name,sub,text,attach},t)` |
| Passo técnico / instalação | SPLIT | `K.terminal([{cmd,ok,t}],t)` |
| Aprovação / prova | PIP | `K.stamp("APROVADO ✓",t,{x,y})` sobre um card |
| Escala / "muitos vídeos" | TAKEOVER | `K.wall(imgs,["NA SUA","ESCALA"],t,d)` (zoom-out e mergulho de volta) |
| Nome do produto | TAKEOVER | `K.takeover(t0,t1)` + `K.logo({text|img,sub},t,d)`; depois `K.marquee(rows,t,d)` atrás da cabeça |
| Antes × depois | FULL | `K.beforeAfter(t,d)` (linha roxa varrendo; esquerda bruta) |
| Número grande | FULL | `K.flash(t)` + `K.behindTitle(["100%"],t,{size:230})` |
| Oferta | SPLIT | `K.price({...},t)` + `K.ring("7","DIAS",t)` + `K.pill(...)` |
| Chamada final | FULL | `K.cta(texto,t,{clickAt})` + `K.kickerTop(...)` |

Câmeras: `K.layout('full'|'wide'|'split'|'splitS'|'pip'|'pipL'|'card916'|'card11'|'card169'|'hidden', t, d=0.45)`.
Enquadramento: `K.punch(t, escala, d=0)` (corte seco entre frases), `K.drift(t,d)`, `K.inset(t0,t1)` (moldura fina).
Transições: `K.flash`, `K.leak` (light leak roxo), `K.glitch`. Saída de qualquer coisa: `K.out(el,t)` ou `{until:t}`.
Tempo: `K.at(frase,n)`, `K.end(frase)`, `K.wt(frase)` (tempos de cada palavra), `K.has(frase)`.
SFX: automáticos em cada componente (`assets/sfx/*.wav`, gerados por `make-sfx.mjs`); manual `K.sfx(nome,t,vol)`;
desligar tudo: `vsl.json {"sfx":false}`; volume geral `"sfxVol":0.5` (padrão 0,55 — o Oney prefere SFX baixos).

## Regras do Oney (v3, 2026-10-08)

- **Legenda que segue a boca:** `K.mouthCaps({accent:[...]})` — blocos de 1–3 palavras logo abaixo do queixo, acompanhando
  a cabeça quadro a quadro (precisa de `assets/face-track.json`: `~/.venvs/whisper/Scripts/python
  ../../$S/track-mouth.py`). Some sozinha em SPLIT/PIP/TAKEOVER; sobe sozinha quando há pílula/CTA/progresso no peito.
  Chame depois dos layouts e antes de `K.live`. Correções de palavras erradas do Whisper: `assets/caption-fixes.json`.
- **Zona segura do Reels** (`cfg.safe` = `.claude/skills/vsl/references/SAFE-ZONES.md`: topo 220, base 1520, laterais 90/990, coluna de botões x>940 & y>1150):
  nada de texto/UI fora. PIP fica no canto **inferior ESQUERDO** (`pip`) ou alto à direita (`pipTop`) — nunca no canto
  inferior direito. Verifique SEMPRE: `node .claude/skills/vsl/scripts/safe-zone-check.mjs video-projects/<slug>` na raiz do kit (percorre o vídeo a cada 0,25 s).
- **Sem "ééé" e sem respiração, com cortes J/L:** em `assets/`:
  `python ../../../$S/transcribe-fillers.py raw.mp4 raw-fillers.json` (Whisper que NÃO esconde hesitações) →
  `python ../../../$S/tight-jl-cut.py --jl 4` (corte pelo som + remove hesitações + J/L alternados; ajustes manuais em
  `fillers.json {"cut":[[a,b]],"keep":[t]}`). Retranscreva `clean.mp4` e LEIA inteiro: vícios longos (>1,6 s) e
  retomadas não são cortados sozinhos — confira e ajuste `keeps.json`/`fillers.json`.
- `clean.mp4` precisa de keyframe a cada 1 s (`-g 30`), senão o render congela quadros.

## Tema e fonte (vsl.json)

- `"theme": "roxo"` (referência) ou `"laranja"` (pílulas, botões, brilhos, bordas e fundo em laranja/âmbar — combina
  com luz quente e óculos âmbar). Os temas são só variáveis CSS (`#vsl.t-<tema>` em `kit.css`); para um tema novo copie o
  bloco `t-laranja` e troque os valores.
- `"font": "advercase"` → Advercase em TODO texto (títulos, legendas, pílulas, UI). Mono continua só em terminal/timecode.
  Advercase é estreita: títulos atrás da cabeça precisam de `size` maior (≈ 300–400 para "100%") e de enquadramento
  mais aberto (`K.punch(t,1.2)`) para o número ler inteiro.
- Com a barra ao vivo (`K.live`), use `"topY": 312` para títulos não baterem nela, e `"capY"` na linha pescoço/gola (~1190).

## Edição simultânea (pedido do Oney: "parecer que o vídeo está sendo editado pela IA enquanto eu falo")

Objetivo: o espectador VÊ a edição acontecendo e entende quanto trabalho ela dá — e que com IA é simples.
Exemplo completo: `template/beats.live.example.js`.

| Fala | Componente |
|---|---|
| (o vídeo todo) | `K.live(t0, dur, {hide:[[a,b]]})` — barra "● IA EDITANDO" no topo: timecode, contador de edições, 4 trilhas (VÍDEO/TEXTO/MOTION/ÁUDIO) onde cada componente vira um bloco no instante em que entra, e aviso "+ legenda “…”". **Chame por último** no beats.js. Todo componente se registra sozinho (`K.ev(trilha, rótulo, t)` para registrar algo manual). |
| "mandei um vídeo bruto com erros / respirações / falhas… e ele editou" | `K.waveCut(t, [{label,at,w,t}], {thumbs, cutAt})` — onda do áudio com as marcas acendendo na palavra e depois sendo cortadas (os buracos fecham) |
| "horas editando", "dá trabalho" | `K.manual(t, d, {hours})` — timeline manual lotada nascendo, cursor frenético, contadores de cortes/keyframes/legendas/efeitos e relógio subindo até 8h |
| "com IA é muito mais rápido" | `K.compare([{label,value,frac,bad,t}], t, {title})` — barras manual × IA |
| "personalizei do meu jeito" | `K.stylePanel(t, {tFont,tColor,tCap,preview})` — o cursor escolhe fonte, cor e posição da legenda e a prévia muda |
| "manda, baixa e posta" | `K.flow([{label,sub,icon,t,progress}])` — passos acendendo na palavra |
| "comenta EU QUERO" | `K.comment({user,text},t)` + `K.dm(...)` |
| "te entrega editado" | `K.progress(label, t, d)` — render até 100 % |
| qualquer clique | `K.cursor([{x,y,t,click}])` |

## Dois looks na mesma skill — pergunte qual, se o pedido não disser

| | Look motion-UI (roxo/laranja) | Look clean (aprovado 2026-10-08) |
|---|---|---|
| Quando | VSL com identidade única, "motion UI", "igual àquela VSL" | ele "vira" várias pessoas/seções, "clean", "sem laranja", "cada parte com seu estilo" |
| Base | kit.js/kit.css, grade de cor, câmeras FULL/SPLIT/PIP, pílulas com glow | **sem filtro nenhum**, tela cheia, painel branco acima da cabeça, Plus Jakarta |
| Referência | `template/beats.example.js` | `template/clean/demo.template.html` |
| Template | `template/index.template.html` + `scripts/build-index.mjs` | `template/clean/index.template.html` + `scripts/build-clean.mjs` (demo: `template/clean/demo.template.html`) |

## Look clean (skin por seção) — regras

- **Vídeo**: sem filtro, sem tint, sem vinheta, sem punch. O que foi gravado (ou gerado) é a cena.
- **Base**: `--acc #4A90E2 --acc2 #EAF3FF --ink #102A43`, painel `rgba(255,255,255,.9)` raio 30, sombra suave, borda 2 px `--acc2`.
- **Skins** (classe no root, trocada com `tl.set(root,{attr:{class}})` exatamente no corte; muda chips, pílula E legenda):
  `.skin-med` Segoe UI / azul `#2F80ED` · `.skin-adv` Georgia / dourado `#B8902E` / preto · `.skin-nutri` Jakarta / verde `#2E9E5B`.
  Para uma seção nova, copie um bloco `.skin-*` e troque fonte + 4 cores. Pílula "🩺 MODO MÉDICO" ~1,5 s após a transição.
- **Painel**: `x 90–990, y 290–540`, sempre acima do topo da cabeça (o build imprime `cabeça min`; mínimo foi 674). Um emoji
  Apple grande (150 px) à esquerda + 1–2 chips curtos + ✅/❌ (86 px) **na palavra**. **Uma ideia por painel**; o esquema tem
  que condizer com o cenário (nutri = 🍚🥗🍎; médico = 💊🤧🧫🔍; advogado = 📄⚖️💰🛟). O painel seguinte só entra quando a fala
  muda de assunto; o anterior sai 0,45 s antes de um corte.
- **Abertura**: headline Advercase 86 px branca com contorno escuro, 2 linhas, 0,3 s → ~6 s; depois o primeiro painel.
- **Legenda**: 1 palavra, 50 px, branca com contorno `rgba(16,42,67,.85)` 5 px; palavra-chave na cor da skin com contorno branco;
  posição = média móvel (±6 quadros) de `mx` e **`chin + 165`** (linha da gola; `+78` ficou em cima do queixo); some em pausas > 0,6 s.
- **Transições** (NÃO vêm no pacote — são de um pack pago; coloque as suas em `template/trans/` com os mesmos nomes, webm VP9 com alpha + wav; sem elas use corte seco com flash): `alpha-1` (film burn roxo/azul, 0,47 s) e `alpha-2` (0,30 s) nas trocas de
  seção, `alpha-00` (escuro, 0,43 s) na volta. `<video class="trans">` em `data-track-index="2"` começando em
  `corte − 0,45 × duração` + o `.wav` da própria transição (`track 3`, volume 0,45). Mais transições no pack:
  `…\00_Oney Editing Viral Pack\Cinemarkers_4K\Assets\Alpha Transitions` (ProRes 4444 → `scale=-2:1920,crop=1080:1920` → VP9 `yuva420p`).
- **SFX**: só o som das transições. **Áudio**: voz em `track 1`, vídeo `muted` em `track 0`.
- **Emojis**: digite o caractere; `build-clean.mjs` troca pela arte da Apple (cache da `reel-oney`, baixa o que faltar).
- **Demo antes do vídeo inteiro**: 2 seções (~20 s) com `template/clean/demo.template.html`; só siga depois do "gostei".

## Troca de roupa e cenário com Higgsfield — SÓ quando o aluno pedir

**Padrão desta skill é NÃO usar a Higgsfield.** Ative apenas se ele pedir com todas as letras ("usa a Higgsfield", "troca a
roupa e o cenário", "modo médico", "me coloca de terno"). Sem esse pedido, a skill edita a footage como está, nos dois looks.
### Primeira vez: a chave da Higgsfield (é o que a aula ensina)
- "Configura a minha chave da Higgsfield / abre o arquivo onde eu colo ela" → `node .claude/skills/vsl/scripts/higgsfield-key.mjs setup`
  (cria o `.env` do kit e abre no Bloco de Notas). Explique: colar a chave depois de `HIGGSFIELD_API_KEY=`, Ctrl+S, fechar.
- "Testa se a chave da Higgsfield está funcionando" → `node .claude/skills/vsl/scripts/higgsfield-key.mjs test` (não gasta crédito).
  ✓ → "instalação concluída". ✗ → chave incompleta/errada ou sem saldo; peça para copiar de novo em open.higgsfield.ai › API keys.
- Se o aluno colar a chave no chat, avise que é arriscado, salve no `.env` (nunca repita a chave na resposta) e sugira criar
  uma chave nova depois.
- Onde pegar: **open.higgsfield.ai** (não o app higgsfield.ai) › login › **Top up / Add funds** (saldo pré-pago, separado da
  assinatura do app) › **API keys** › **Create API key** › nome "claude" › **Create key** › **Copy API key** (aparece 1× só).

### Quando o aluno pedir a troca
0. **Chave**: `node .claude/skills/vsl/scripts/higgsfield-key.mjs test` (na raiz do kit; não gasta crédito). Sem chave ou
   recusada → `higgsfield-key.mjs setup` abre o `.env` do kit no Bloco de Notas para colar a chave (nunca peça a chave no
   chat). A credencial é lida por `scripts/hf-auth.mjs`: variáveis de ambiente → `.env` do kit.
   Aceita a **chave única** do painel novo (open.higgsfield.ai › API keys › Create API key › Copy API key, "cole como está")
   e o formato antigo key id + secret (`HIGGSFIELD_API_SECRET`).
1. **Corte primeiro**, depois recorte os trechos que mudam (3 a 15,5 s cada, limite do Kling O3; a troca acontece no INÍCIO do
   trecho — "Ou pode ser que eu seja um advogado" → corte em "Ou"):
   `ffmpeg -ss a -to b -i assets/clean.mp4 -c:v libx264 -crf 16 -g 30 -c:a aac assets/hf/<nome>-src.mp4`.
2. **Custo + OK antes de rodar**: `higgsfield-edit.mjs <src> <out> "<prompt>" --estimate` mostra a faixa por clipe sem subir
   nada (US$ 0,042–0,126/s; tabela de 09/10/2026: Kling O3 "from $0.084/s", com desconto "from $0.042/s"; no pro pagamos
   ~US$ 0,06–0,13/s). Some os clipes, mostre o total e peça o OK; diga que a footage dele sobe pra Higgsfield. Na geração o
   script ainda tenta o `/estimate` oficial (o Kling O3 video-edit costuma responder 500 → cai na tabela). A API não devolve
   o débito: o saldo fica no painel **open.higgsfield.ai** — logado, o menu NÃO tem "Billing": o saldo entra por **Top up**
   (menu) / **Add funds** (botão). O saldo do app higgsfield.ai (assinatura) não vale na API.
3. `node ../../.claude/skills/vsl/scripts/higgsfield-edit.mjs assets/hf/<nome>-src.mp4 assets/hf/<nome>-edit.mp4 "<prompt>" --mode pro`
   — rode os clipes **em paralelo** (5–10 min cada). Prompt que funcionou: "Change the man's outfit to <roupa>. Change the
   background to <cenário com 2–3 objetos>. Keep his face, glasses, hair, body movement, hand gestures, the mug in his hands and
   the camera framing exactly the same. Photorealistic, same lighting on the face." Confira cada retorno numa folha de contato
   (roupa, cenário, props, rosto). O Kling devolve 24 fps e 1–2 % mais curto.
4. `python ../../.claude/skills/vsl/scripts/splice-hf.py --no-head --out assets/clean-hf.mp4 --span a b assets/hf/<nome>-edit.mp4 …`
   (venv do whisper) — remonta o vídeo alinhando pelo início (deriva medida: 1–2 quadros), reamostra a 30 fps e segura o último
   quadro. **`--no-head` = rosto do Kling puro**, que é o padrão recomendado (a colagem do rosto original pareceu máscara; `--head`
   vaza o cabelo da IA). **Nenhum filtro** sobre os trechos gerados.
5. Use o **look clean** por cima (o matte da VSL cobre a roupa nova e ele rejeitou a grade laranja nesses trechos).

## Esquemas desenhados (K.panel)

`K.panel(html, t, {title, box:{x,y,w,h}, steps:[{sel, t, anim:'pop'|'fade'|'slide'|'draw'|'strike', d, label, sfx}], until})` —
card de vidro com o SEU HTML/SVG; cada `step` revela os filhos de `sel` na palavra (`draw` desenha path/circle SVG, `strike` cresce
um risco). Use para ilustrar literalmente a fala (pinta no rosto com círculo, vírus ✕ / bactéria ✓, arroz riscado → ✓ PODE).
Em SPLIT, `box: {x:90, y:400, w:900, h:560}` (abaixo da barra ao vivo, acima da moldura do vídeo).

## Regras que fazem parecer a referência (e não um template genérico)

- **Troca de câmera sempre animada** (o quadro voa e encolhe/cresce, 0,45 s) — nunca corte seco FULL↔SPLIT.
- **FULL é sempre punch-in**, SPLIT/PIP mostram o enquadramento aberto. Punch extra (1,3–1,4) em frase de impacto, corte seco.
- **Legenda NÃO é contínua.** Só frases-chave (1 a cada ~6–10 s), 2 níveis: linha pequena + destaque.
- Títulos de 1–5 palavras; 1–2 palavras-acento lavanda. Nunca a frase inteira na tela.
- Tudo entra com blur → nítido; tudo sai com blur + fade. Glow roxo em pílulas, bordas, títulos display.
- Título display **atrás da cabeça** só em FULL e só com matte; a cabeça cobre parte das letras.
- Cards de vidro: borda lavanda 30 %, fundo quase transparente, sombra funda, raio 22.
- Gancho: 1,5–2 s "BRUTO" dessaturado com HUD de filmadora → glitch → grade roxa. É a assinatura do estilo.
- Música só entra depois do gancho; SFX curtos e baixos; boom só em 2 momentos (gancho e logo).

## Aprendizados de 2026-10-08 (vídeo de profissões do Oney)

- **A camada `#layMatte` fica SEMPRE por cima do vídeo.** Se o `cam` for um vídeo com trechos trocados (Higgsfield), o matte
  do original cobre a roupa/cenário novos e o Oney vê "ele na frente e outra pessoa se movendo atrás". Regenere o matte a partir
  do vídeo final ou não use título atrás da cabeça nesses trechos.
- **`tl.fromTo(el, {opacity:1, scaleX:0}, {scaleX:1})` some no render do HyperFrames** (no navegador aparece). Sempre inclua
  `opacity` no destino, ou `tl.set(el,{opacity:1})` antes. Vale para qualquer tween que só "cresce".
- **Snapshot sem nenhum overlay = `K.at` lançou erro.** Abra o `index.html` no navegador (preview do kit) e leia o console: a
  mensagem diz a frase. Palavra com hífen ("seguro-desemprego") nunca casa — ancore na palavra anterior (`K.end("muitos casos")`).
- O Oney **rejeitou a grade laranja e a UI pesada** para um vídeo em que ele "vira" várias pessoas (muda roupa e sala): nasceu o
  look clean (seção acima). O look motion-UI continua valendo para vídeo de venda com identidade única.
- `A("entregar")` pegou o 1º "entregar" de outra frase e um card vazou por 18 s: quando a palavra se repete, ancore com mais
  contexto (`A("te entregar")`) e confira o `until` de cada painel na folha de contato. `at("minuto", 2)` falha se a 1ª é "minutos".
- Animar `left` reprova no lint (`gsap_non_transform_motion`): use `x`. Chips estourando x > 990: o `safe-zone-check` pega —
  empilhe em coluna com chips de 30 px.
- `npx serve` com clean URLs quebra `assets/…` relativos ao abrir `/final/index.html` → `/final`: os 404 de emoji no navegador são
  falsos; o snapshot/render do HyperFrames carrega certo.
- Whisper padrão engole fala perto de pausas longas e "ééé": retranscreva as janelas suspeitas com `vad_filter=False` antes de
  decidir cortes. Retomadas retóricas ("Quer melhorar a sua produção?", "Basicamente, o que vai acontecer é que") também saem.

## Limites conhecidos (seja honesto com o aluno)

- Fidelidade de **movimento, layout, tipografia e paleta**: alta. Conteúdo das telas (prints, thumbnails, UIs reais)
  depende dos materiais do aluno — o kit desenha mockups genéricos; prints reais entram como `img`.
- **Grade de cor**: feita por CSS (filtro + camadas roxas). Footage muito clara/colorida (parede branca, LED vermelho)
  não fica idêntica à referência, que foi gravada num quarto escuro com LED roxo. Para ficar igual: gravar com fundo
  escuro e luz roxa/azul atrás, ou aplicar LUT no ffmpeg antes (`-vf lut3d=arquivo.cube`).
- **Matte**: RVM é ótimo em cabelo/óculos; microfone na frente pode sair parcial (só afeta texto que passe atrás dele).
- Fontes: Anybody/Plus Jakarta/JetBrains são equivalentes livres de Monument Extended/Gilroy (comerciais). Se o
  aluno tiver as licenças, troque os `@font-face` em `kit.css`.
- Alternativas prontas no registry HyperFrames (se quiser variar): `camcorder-hud`, `glitch`, `light-sweep-pass`,
  `shimmer-sweep`, `before-after-wipe`, `perspective-marquee`, `telemetry-hud`, `carousel-vision-*`, `terminal-simulator`,
  `chat-thread`, `typed-prompt`, `oversized-cursor` (`npx hyperframes add <nome>`). Elas têm o visual delas, não o roxo — use o kit.

## Nunca

- **Rodar a Higgsfield (ou qualquer geração paga / upload da footage dele) sem ele pedir explicitamente e sem o OK do custo.**
- **Pedir ou imprimir a chave da Higgsfield no chat.** Ela vai no `.env` do kit (`higgsfield-key.mjs setup`), que é gitignored.
- Copiar logo, marca, textos ou imagens da VSL de referência. A skill copia a **gramática**, o conteúdo é do aluno.
- Inventar prova (prints falsos de resultados, números que ele não disse). Mockups genéricos são ilustração.
- Publicar ou enviar o vídeo sem o aluno pedir.


## Entrega (regra do kit — obrigatória)

1. **Zona segura** (vídeo vertical): antes do render final, na raiz do kit,
   `node .claude/skills/vsl/scripts/safe-zone-check.mjs video-projects/<slug>` e corrija tudo até sair "zona segura OK" (regras e exceções em `.claude/skills/vsl/references/SAFE-ZONES.md`:
   texto/UI em x 90–990, y 220–1520, nada na coluna de botões à direita, PIP nunca no canto inferior direito).
2. **Vídeo pronto → abrir a pasta:** assim que o render FINAL terminar (não drafts), rode
   `node .claude/skills/vsl/scripts/reveal.mjs video-projects/<slug>/renders/<arquivo>.mp4` — abre o Explorer com o vídeo selecionado.
