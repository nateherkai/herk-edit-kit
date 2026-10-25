# Look builder

Um assistente local de 7 passos para escolher o visual de um vídeo **em cima do seu próprio clipe**
antes de pedir a edição ao Claude. Inspirado no "Look builder" que a criadora Zee mostrou no Instagram:
em vez de ler DESIGN.md e registry.json, você vê cada opção renderizada sobre um frame da sua gravação,
clica em "Escolher" ou "Mais como essa", e no fim salva um `look.json` que as skills do kit leem.

Cada opção vem de uma skill ou estilo deste kit: `reel-oney`, `reel-editorial-oney`, `anuncios-oney`,
`video-colagem-oney`, `reel-explicativo-oney`, `vsl` (roxo, laranja, clean) e `style-library`
(`02-kallaway`, `01-vox-explainer`). As regras de "o que não fazer" de cada DESIGN.md viram avisos de conflito.

## Como usar

```bash
npm run look-builder
```

Abra <http://localhost:8765/>. Para começar já com um clipe:

```bash
node tools/look-builder/server.mjs --clip "video-projects/meu-reel/assets/raw.mp4"
```

1. **Clipe**: escolha um vídeo listado (`video-projects/*/assets`, `meus-videos/`, `raw-media/`) ou cole um caminho.
   Dê Play/Pause: o frame em que você pausar vira o fundo de todos os cards.
2. **Guias**: arraste "Topo da cabeça" e "Legenda (topo)". Tudo acima da cabeça e as legendas se posicionam por aí.
3. **Texto de exemplo**: edite o gancho, a frase das legendas, a palavra-chave e o @, ou use
   "Usar a transcrição do projeto" (lê `assets/transcript.json` ou `assets/raw.json`).
4. **Passos 1 a 6**: Cores → Fontes → Gancho → Legendas → Elementos → Motion. Cada passo usa o que você já escolheu.
   "Começo rápido" aplica um preset inteiro (um look pronto de uma skill); dá para mudar qualquer peça depois.
   "Mais como essa" anota um pedido de variação para o Claude, sem quebrar o fluxo.
5. **Revisão**: confira, escolha (ou aceite) a skill executora, leia os conflitos, escreva notas,
   e **Salvar look.json** grava em `video-projects/<slug>/look.json` e copia um prompt pronto.
6. Cole o prompt no Claude Code. As skills Oney leem o `look.json` (regra em `.claude/skills/_perfil-oney.md`).

## Legenda Dinâmica (EffectCraft)

Se a pasta `C:\Users\<voce>\Desktop\EFEECTCRAFT EDITOR CLAUDE\catalogo` existir (ou `LDS_CATALOG=<pasta>` apontar
para uma pasta com `data.json` + `gifs/`), o passo **Legendas** ganha os 14 "prontos" do Legenda Dinâmica Studio
com os GIFs reais do catálogo, e o passo **Motion** passa a oferecer as 24 entradas quando um pronto está escolhido.
No palco à esquerda a legenda dinâmica aparece como aproximação (palavra-chave grande, conectivos pequenos, entrada
palavra por palavra) nas suas cores. O `look.json` grava `captions.engine = "legenda-dinamica-studio"` com pronto,
modelo, entrada e saída, e o prompt pede a legenda via skill `/legenda` no EffectCraft enquanto o resto do look
é montado no HyperFrames. Sem a pasta, o passo funciona só com as legendas HTML do kit.

## Testar de verdade

O preview do wizard é HTML/GSAP no navegador. O botão **▶ Testar de verdade** (rodapé) monta uma composição
HyperFrames real a partir do look atual em `video-projects/<slug>/look-test/` (um trecho de 8 s do clipe a partir
do tempo atual do player, copiado sem reencodar, as fontes das skills e um `index.html` com uma timeline GSAP
pausada registrada em `window.__timelines`) e roda `hyperframes snapshot` nos instantes do gancho, das legendas e
de cada entrada de elemento. Os PNGs aparecem numa galeria no próprio Look builder, com link para abrir em tamanho
real. Leva cerca de um minuto no primeiro uso (o HyperFrames sobe o navegador de render). O `look-test/` pode ser
apagado a qualquer momento; o `index.html` gerado também serve de ponto de partida para a skill, pois usa os
mesmos renderizadores de `looks.mjs` (`testbuild.mjs` serializa as funções `anim` para dentro da página).

## Atalhos e rascunho

← → mudam de passo, 1–9 escolhem o card, espaço dá play/pause, Esc fecha "Mais como essa". O rascunho é salvo
sozinho no navegador por clipe e restaurado ao reabrir; se o projeto já tem `look.json`, ele é carregado.
"🎲 Surpreenda-me" monta um look coerente de uma skill ao acaso. "Limpar" zera tudo.

## O que vai no look.json

```json
{
  "clip": "…/assets/raw.mp4", "orientation": "9:16", "canvas": {"width":1080,"height":1920},
  "framing": {"headTop": 620, "capTop": 1150},
  "preset": "editorial", "skill": "reel-editorial-oney", "skillCommand": "/reel-editorial-oney",
  "colours": {"id":"butter","acc":"#f4e27c", "...": "…"}, "fonts": {"id":"inter-serif", "...": "…"},
  "hook": {"id":"serif-stack"}, "captions": {"id":"one-word-lower"},
  "elements": [{"id":"print-card"}, {"id":"handwritten-note"}], "motion": [{"id":"blur-rise"}, {"id":"punch-in"}],
  "sampleText": {"...": "…"}, "extras": [{"step":"fonts","base":"inter-serif","ask":"mais fina"}],
  "notes": "…", "conflicts": []
}
```

Ao lado é gravado `LOOK.md`, a mesma coisa em prosa. `video-projects/` é gitignorado, então ambos ficam privados
junto com o seu vídeo.

## Estender

- `looks.mjs` é o catálogo. Para uma opção nova, adicione um objeto com `id`, `name`, `desc`, `skills`
  (onde ela é nativa) e um `render(S)` que escreve HTML em pixels de 1080 (ou 1920) de largura; `S.v` são as
  cores, `S.font` as fontes, `S.headTop`/`S.capTop` o enquadramento, `S.text` o texto de exemplo.
- `CONFLICTS` em `looks.mjs` traduz os "What NOT to do" de cada DESIGN.md. Se mudar uma skill, atualize ali.
- Fontes: o servidor serve `/fonts/<arquivo>` procurando nas pastas `template/fonts` das skills. Anton, Bebas,
  Fraunces, Archivo e Playfair vêm do Google Fonts (precisa de internet só para esses).

O preview é uma aproximação em HTML/GSAP para decidir o look. A edição real continua sendo feita pela skill
com HyperFrames, snapshots e render, como sempre.

## Detecção da cabeça

Ao abrir um clipe (sem rascunho salvo) o Look builder roda o MediaPipe Face Detector no próprio navegador em
4–9 frames espalhados pelo vídeo, fica com o maior rosto de cada frame e estima o topo da cabeça (cabelo acima da
caixa do rosto) e o queixo. Os sliders "Topo da cabeça" e "Legenda (topo)" já vêm preenchidos e um retângulo verde
mostra o rosto detectado. O botão "Detectar cabeça" refaz; a caixa "automático ao abrir um clipe" desliga a
detecção automática. Precisa de internet na primeira vez (modelo e wasm vêm do CDN e ficam em cache). Vídeos sem
rosto (animações, telas) caem no aviso "Nenhum rosto encontrado" e você ajusta à mão.

## Cards de preset

No passo 1, "Começo rápido" mostra cada preset como um card com uma miniatura do seu clipe e o gancho nas cores e
fontes daquele look. Se quiser ilustrações geradas (por exemplo no ChatGPT), siga
`assets/presets/PROMPT-CHATGPT.md`: salve `celular.png`, `editorial.png`, … em `assets/presets/` e a interface passa
a usá-las no lugar da miniatura desenhada.

## Catálogos de efeitos

- `looks.mjs`: as opções derivadas das skills Oney e do style-library.
- `looks.zee.mjs`: os efeitos do reel da Zee analisado frame a frame (rótulos amarelos no topo, cards de citação,
  prompt da IA digitando, shrink frame com coluna de thumbs, celular subindo com ✓, sticker e contorno brilhante na
  pessoa, celular atrás da pessoa, legendas manuscritas com palavra-chave amarela, nota com círculo rabiscado).
  Preset "Efeitos Zee".
- `looks.castilho.mjs`: os 35 efeitos do artigo da Castilho IA. Os 5 com comando completo (soco P&B, modo cinema,
  prompt digitando, lista que se marca, cortina de cor) seguem o texto; os outros 30 são aproximações da descrição.
  Preset "35 efeitos".
- Efeitos com "(matte)" no nome precisam do recorte da pessoa na edição real (as skills `video-colagem-oney` e
  `vsl` têm os scripts); o preview mostra a ideia.
- Nos passos Elementos e Motion há filtro por família (Oney, Zee, 35 efeitos, style-library) e busca por texto.
- Um elemento pode trazer a própria animação (`anim(tl, el, cam)`); alguns também movem a câmera (`camera: true`).

## Fontes da sua pasta

O servidor indexa uma biblioteca de fontes (.ttf/.otf/.woff/.woff2) e o passo **Fontes** ganha a seção
"Minha pasta de fontes": escolha o papel (display, corpo, voz serifada, manuscrita, mono), busque pelo nome ou pela
pasta e clique "Usar como …". A fonte substitui esse papel no par escolhido, aparece no preview na hora (FontFace API)
e vai para o `look.json` em `userFonts` com o caminho do arquivo; o "Testar de verdade" copia o arquivo para o
projeto de teste. Pasta padrão: `D:\Users\carlo\Documents\Fontes  em geral` (ou `~/FontBase`); outra pasta:

```bash
USER_FONTS="C:\caminho\da\pasta" node tools/look-builder/server.mjs
```

## Mais catálogos (referências dos "perfis gringos")

- `looks.brandnat.mjs` + `/api/brandnat`: lê o `styles.js` do **Brand Nat Style Pack** (pasta
  `Desktop\Videos Gringo com painel\…\guide`, ou `BRANDNAT_GUIDE=<pasta>`) como dados, nunca executa o arquivo.
  Os 105 códigos (H, C, L, P, V, B, X, M, S, G) viram opções: ganchos e legendas com preview próprio, os demais
  mapeados para um renderizador do kit ou mostrados como card de posicionamento. S e G se escolhem na Revisão.
  O `look.json` grava `brandNat.codes` e o prompt traz a linha `Edit <vídeo> with H10 C9 …` para a skill deles.
- `looks.ajene.mjs`: os 31 templates de editing.ajenepinnock.com refeitos **frame a frame** a partir das amostras
  públicas (15 s cada, mesmo roteiro). Cada template é uma **cena** (`scene: true`, `dur: 15`): camadas de UI ligadas e
  desligadas numa timeline GSAP, legenda palavra a palavra no peito com a palavra-chave em serif itálico laranja e, onde
  a amostra faz isso, a câmera entra no painel escuro embaixo (recorte no rosto, legenda vai junto). Componentes
  compartilhados: caixas brancas de gancho, notificações, pílulas Hook/Story/Offer, grade de 30 dias, contadores,
  gráfico que se desenha, Google Doc, faixa de capas, tier list, quadros Top 5 / Se-Então / Isso-vs-Aquilo, documento
  rolando (16:9), formas de onda. Fundos em tela cheia (recortes, vlog, cinema, história natural) abrem um buraco suave em
  volta da pessoa no preview; a edição real usa matte. Presets `tpl-*`, paleta "Laranja Ajene", legendas `aj-word`,
  `aj-phrase`, `aj-stacked`, `ear-to-ear`. O "Testar de verdade" de uma cena renderiza 15 s (5 frames) e os helpers das
  animações vão junto na página (`AJ_RUNTIME`).
- **Camadas: pessoa na frente, efeitos atrás** (`layers.mjs`). Um efeito marca com `class="back"` o que passa atrás
  da pessoa (e `class="front"` o que, dentro disso, fica na frente: os toasts da Interface em Profundidade). Marcados:
  fundos dos templates Ajene (recortes, grade, vlog, cinema, diálogo, história natural, ensaio visual), telas da
  Interface em Profundidade, título atrás da cabeça, capa de banca, gráfico nas costas, parede de jornal, cristal,
  chuva de letras, letreiro, metade de trás do Carrossel 360 e dos Satélites (troca a cada volta), celular atrás da
  pessoa, contorno brilhante e a palavra grande do Ten Fold Bold. O look é desenhado duas vezes, com a mesma
  timeline: cópia de trás (só `.back`) → pessoa recortada → cópia da frente (o resto).
  - **No palco**: "recorte ao vivo" (aparece quando o look tem partes atrás) recorta a pessoa no navegador com o
    MediaPipe Image Segmenter (modelo selfie, baixado na primeira vez) e desenha num canvas que segue a câmera.
    Desligado, os fundos voltam a abrir o buraco oval em volta da pessoa.
  - **No Testar de verdade**: o servidor roda `hyperframes remove-background` no trecho de teste (WebM com alpha,
    guardado em `look-test/assets/matte-<chave>.webm` e reaproveitado no próximo teste do mesmo trecho) e monta as
    três camadas na composição HyperFrames.
  - `look.json` ganha `matte.needed`; o `LOOK.md` e a skill `/look-builder` dizem como empilhar na edição final.
- **Dois caminhos.** Ao abrir, o painel pergunta "Como você quer começar?": **Usar um template** (3 passos:
  Template → Ajustar → Testar e salvar) ou **Montar do zero** (os 7 passos). "Trocar caminho" no topo troca a qualquer
  hora sem perder as escolhas. Os templates ficam agrupados pelo objetivo (Reel falado, Explicativo e aula, Anúncio e
  venda, Motion sem rosto) e a origem (Kit, Ajene, Altra, Zee, Castilho, Ten Fold) aparece só como etiqueta no card.
  "Ajustar" tem abas Textos, Cores, Fontes e Legenda. As duas ações finais são **Ver render de verdade** (com progresso
  por etapa: montando, recortando a pessoa, capturando os quadros) e **Salvar e usar no Claude** (grava e copia o
  pedido). JSON, copiar o pedido e as opções avançadas (códigos Brand Nat, skill e conflitos) ficam no menu **Avançado**.
  As Legendas Dinâmicas aparecem sempre no passo Legendas e na aba Legenda do Ajustar.
- **Legenda Dinâmica igual ao catálogo** (`lds.mjs`): porta para o navegador do motor do EffectCraft
  (`plugin/scripts/motor/lds_core.jsx`): os mesmos 38 modelos, 33 prontos, 27 entradas e 15 saídas, com os mesmos
  tamanhos, cores, tracking, brilhos, sombras, marca-texto / pílula / sublinhado / círculo e os mesmos keyframes
  (d = 0,22 s na entrada, 0,16 s na saída). As palavras são divididas em telas pela regra do `planner.py`
  (conectivos pequenos, a palavra mais forte grande). A entrada escolhida no passo Motion substitui a do pronto no palco
  e no render de verdade; os cards do passo Legendas mostram cada pronto com a entrada original. Fontes: as do Windows
  que o motor usa (Arial Black, Impact, Bahnschrift, Garamond, Bookman, Cooper, Brush Script, Segoe Script) e Figtree,
  Bodoni Moda e EB Garamond do Google como reserva.
- **Edit Review** (`/review?project=<slug>`, botão "Edit Review" no topo do painel): assista o corte do projeto, deixe
  notas por tempo (N), uma lista de edits com tipo, in/out e status (E ou Shift+Enter; "Importar cortes da EDL" traz
  os cortes do cut-silences / cut-mistakes já marcados como feitos), e a transcrição clicável que segue o player.
  Marcadores na timeline: notas (laranja), edits (verde), cortes da EDL (vermelho). Salvar (Ctrl+S) grava
  `video-projects/<slug>/review.json` e `REVIEW.md`; rascunho em localStorage até salvar. Arquivos: `review.html`,
  `review.css`, `review.js`; rotas `/api/review` GET/POST.
- `looks.altra.mjs`: **nossas versões** dos nove vídeos de exemplo de altralabs.com.br/motiongraphics, lidos quadro a
  quadro nas amostras públicas, sem as marcas originais. Cenas de 15 s (presets `alt-*`, filtro "Altra"):
  Bruto → Editado (cortina bruto/editado, palavras gigantes atrás da cabeça, painéis de pedido e áudio, você num quadro,
  linha do tempo), Bokeh quente, Manifesto IA, Balão de retenção, Micro-interações de UI, Promo de streaming (marca
  fictícia), Gravura editorial, Faixas cinéticas e Anúncio lavanda. Legendas `al-word` (barra de progresso laranja) e
  `al-glow`; ganchos `al-typing` (digitando + caixa vermelha) e `al-bracket` ([ ano ]); seis paletas `altra-*`.
  Os cards desses presets mostram o quadro real da cena (`live: true`), não um desenho. Os helpers das animações vão
  para o teste real como `AL_RUNTIME`.
- `looks.tenfold.mjs`: os três looks do /video-edit da Ten Fold (Bold, Cool girl, Cool dude) como presets `tf-*`.
- Skill `/look-builder` (`.claude/skills/look-builder/`): chama a edição a partir do `look.json` ou de um template id,
  como os pacotes gringos fazem com "/". Ela roteia para a skill do kit que o look aponta.

## Visual do painel

O painel segue o estilo do guia Brand Nat: página creme quente, cards brancos com sombra suave, tinta espresso,
amarelo-manteiga de acento, títulos Inter Tight com um detalhe em Instrument Serif itálico, botões em pílula, barra
de filtros fixa e uma bandeja escura embaixo com as escolhas. O botão ◐ no topo alterna claro/escuro (fica salvo).
Os cards de preset e de template animam ao passar o mouse (gancho, legenda e o primeiro elemento) para você ver
qual é qual antes de clicar.

## Visual atual (landing edicao-claude)

O painel usa a paleta da landing `landing-pages/edicao-claude` (sala escura, texto creme, acento clay laranja,
Montserrat + Instrument Sans + JetBrains Mono). Os cards de preset e de template mostram os **mesmos mini celulares
da landing** (`mockups.mjs`, gerado por `node tools/look-builder/sync-mockups.mjs` a partir do HTML da landing), com
o apresentador neutro; ao passar o mouse o card troca para a prévia real sobre o seu clipe. O botão ◐ alterna para o
tema claro creme. Quando não há clipe, o palco e os cards usam um avatar neutro (`avatar.mjs`); a caixa "avatar" ao
lado de "guias" força o avatar mesmo com clipe. As legendas do Legenda Dinâmica aparecem em cards 9:16 como as outras,
com o caráter tipográfico do modelo (serif, cursiva, neon, impacto…) e a cor do look; o GIF original fica no canto.
