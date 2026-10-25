# Decupagem da referência (VSL vertical, 2:59, 9:16, roxo)

Fonte: VSL de página de vendas de um curso de edição com IA (720×1280, 30 fps, 1 apresentador sentado,
microfone na frente, estante com LED roxo atrás). Analisada a 2 fps no vídeo inteiro e a 10 fps em todas
as transições. Este documento descreve **a gramática de edição**, não o conteúdo: nunca copie marca,
logo, roteiro ou imagens da referência — use a gramática com o conteúdo do Oney.

Coordenadas abaixo já convertidas para 1080×1920 (referência × 1,5).

## 1. As 4 "câmeras" (layouts) — o vídeo inteiro é uma troca entre elas

| Layout | Quando | Geometria (1080×1920) |
|---|---|---|
| **FULL** | fala de impacto, título atrás da cabeça, pílulas no peito | vídeo em tela cheia, **sempre com punch-in ~1,2–1,3×** (rosto grande, cabeça no terço superior) |
| **SPLIT** | explicação com UI (cards, painéis, mockups) | conteúdo no topo (y 60–960), vídeo num **card** embaixo: x 52, y 990, 976×880, raio 22, borda 2 px lavanda + glow, cantoneiras brancas dentro; enquadramento **aberto** (sem punch) |
| **PIP** | UI ocupa a tela toda (agente, comparação, "escolha seu caminho") | vídeo vira **círculo** Ø 270, centro (891, 1722) (ou canto esquerdo (150,1722)), borda lavanda + glow |
| **TAKEOVER** | logo, preço, mural, card final | sem apresentador; fundo roxo |

Regras de troca (sempre animadas, nunca corte seco entre layouts):
- FULL → SPLIT (0,35–0,5 s, `power3.inOut`): o quadro **encolhe** até o card de baixo enquanto o zoom do vídeo
  volta a 1,0; o fundo roxo aparece por trás; título do topo entra 0,1 s depois.
- SPLIT → FULL (0,4–0,5 s): o card **cresce** até a tela cheia (as bordas somem no fim), o conteúdo de cima
  sai com blur + fade 0,25 s antes. Às vezes um **light leak roxo** da esquerda cobre a troca (0:16).
- SPLIT → PIP (0,5 s): card encolhe para o canto e o raio vai a 50 % (vira círculo).
- Card muda de proporção falando de formatos: 9:16 → 1:1 → 16:9 (0,35 s cada, rótulo "9:16 VERTICAL" no topo).

Proporção de tempo na referência: FULL ~40 %, SPLIT ~45 %, PIP ~8 %, TAKEOVER ~7 %.
Um elemento novo entra a cada **1,5–3 s**. Nunca há mais de ~4 s de tela "parada".

## 2. Look

- **Grade "final"**: preto esmagado roxo-azulado, rosto quente, recorte azul/ciano na lateral, LED da estante
  magenta/roxo saturado. Vinheta forte nas bordas.
- **Grade "bruto"** (só no gancho e no antes/depois): dessaturado, cinza, levantado, sem contraste.
- **Fundo dos layouts SPLIT/PIP/TAKEOVER**: roxo profundo `#1f123d` com mancha mais clara no topo
  `#2d1f50`, borda quase preta `#0e0b1e`, grade quadriculada muito sutil, glow radial roxo atrás do conteúdo.
- **Paleta**: acento `#8b5cf6`/`#9b63ff`, botão gradiente `#8b55ff → #a07cff`, lavanda texto `#b9a3ff`/`#a98bff`,
  card `rgba(255,255,255,.04)` com borda `rgba(167,139,250,.28)`, branco `#ffffff`, cinza texto `#a59cc4`.
- **Tipografia** (3 vozes):
  1. Display largo e pesadíssimo (estilo Monument Extended) → `Anybody 900, width 150%`: "NOVA ERA",
     "PROFUNDIDADE 3D", "100%", mural "NA SUA ESCALA", letreiro, linha 1 do marquee.
  2. Grotesca geométrica bold (estilo Gilroy) → `Plus Jakarta Sans 700/800`: títulos, legendas, pílulas, UI.
  3. Mono (HUD, terminal, tags de camada) → `JetBrains Mono 500`.
- **Kicker**: Jakarta 700, 20–22 px, caixa alta, letter-spacing .22em, cinza-lavanda, sempre acima do título.
- **Palavra-acento**: em todo título 1–2 palavras ficam lavanda (`você`, `explicar`, `aprovada`, `certo`).

## 3. Mapa de tempo da referência (o que acontece e como anima)

| Tempo | Layout | Elemento | Animação |
|---|---|---|---|
| 0:00–1:6 | FULL bruto | **HUD de filmadora**: ● REC (ponto vermelho), timecode `00:00:SS:FF` correndo, cantoneiras L nos 4 cantos, rótulo mono "BRUTO · SEM EDIÇÃO" | grade dessaturada; HUD estático, timecode conta quadro a quadro |
| 1:6–2:1 | FULL | **Glitch de barras**: 5 faixas horizontais finas (ciano/roxo alternadas, ~14 px, 70 % opac.) atravessam a tela; grade troca de bruto → final por baixo | 3–4 quadros; barras deslocam em x e somem; SFX ruído/glitch + **sub boom** |
| 2:5–3:3 | FULL | **"NOVA ERA" atrás da cabeça** (display largo, branco, glow roxo, 2 linhas, topo) | letras entram com blur 20 px → 0 + leve deslize em x, stagger 0,04 s; cabeça na frente (matte) |
| 3:4–4:0 | FULL→SPLIT | **corte p/ punch-in** e logo depois o quadro encolhe para o card; fileira de **cards 3D** (prints de vídeos) entra de cima/esquerda | cards em perspectiva (rotateY ~25°, profundidade), deslizando em leque |
| 4:0–7:3 | SPLIT | fileira de 4 cards 3D estáticos com drift lento | drift x lento |
| 7:4–8:1 | SPLIT→FULL | cards sobem e encolhem para dentro do topo; card do vídeo cresce até tela cheia | 0,6 s |
| 8:1–10:1 | FULL | **moldura fina lavanda** (inset 12 px, raio 26) + **pílula** "AGORA NO SEU CONTEÚDO" no peito | pílula: scale .85→1 + blur, 0,25 s |
| 10:3–12:4 | FULL | **pilha de lettering** centralizada no peito: linha 1 branca blur-in; linha 2 letra a letra (entra lavanda, assenta branca); linha 3 **preenchida com textura/imagem roxa**; linha 4 branca com glow roxo | uma linha por palavra falada |
| 12:4–12:6 | FULL | pilha sai | blur + fade 0,2 s |
| 12:6–16:0 | FULL | **legenda 2 níveis**: linha pequena branca palavra a palavra + linha de **destaque em caixa roxa** (caixa alta, glow) | palavra: opacity .25→1; caixa: scaleX 0→1 da esquerda + texto |
| 12:6–13:6 | FULL | **HUD de rosto**: linha de scan roxa brilhante desce do topo ao fundo; cantoneiras em volta do rosto + etiqueta mono "APRESENTADOR" | scan 1,0 s linear; cantoneiras pop |
| 16:0–16:5 | FULL→SPLIT | **light leak** roxo da esquerda + vídeo encolhe para o card | 0,5 s |
| 16:5–25:7 | SPLIT | título de seção (kicker + título palavra a palavra, última palavra lavanda); **grade 2×2 de cards de vidro** (thumb + ícone + rótulo caixa alta) entrando um por um na palavra falada | card: opacity 0, y 24, scale .96 → 1, 0,35 s `power2.out` |
| 25:8–27:3 | SPLIT→FULL | card cresce; **cantoneiras de rosto**; legenda "linha pequena + linha grande lavanda caixa alta" | linha grande palavra a palavra com blur |
| 27:3–33:2 | FULL→SPLIT | painel "pasta de gravações" (contador de arquivos sobe, thumbs pop em stagger), **post-its** brancos inclinados ("aumenta a fonte", "corta esse trecho"…) colados por cima, pílulas de dor com bolinha, card "ENTREGA HOJE 23:59" laranja | stagger 0,12 s; post-it: rotate ±6°, scale 1.2→1 |
| 32:4–35:0 | SPLIT | painel colapsa num **quadrado tracejado** que cresce → "ESPAÇO"; imagem-rascunho cai dentro; **wipe da esquerda** transforma rascunho → render roxo; pílula "do papel para a tela" | colapso 0,2 s; wipe 0,4 s com borda clara |
| 35:0–37:5 | SPLIT | cards em **leque** (4 cards, inclinações diferentes) + título palavra a palavra embaixo | leque abre 0,5 s |
| 38:0–38:6 | SPLIT→FULL | card cresce até tela cheia com punch | 0,5 s |
| 38:6–44:0 | FULL | título central topo: kicker + **ícone em quadrado roxo + palavra** + sublinhado desenhando; **corrente de pílulas** no peito: rótulo "IMAGINE" → pílula → "+" → pílula → "+" → pílula | blur-in; pílulas entram na palavra falada |
| 44:0–45:7 | TAKEOVER | fundo preto-roxo com feixe radial; **revelação de logo**: linha vertical roxa aparece, logo é revelado da esquerda p/ direita com **faixa de luz** branca na frente do wipe; tagline mono espaçada | 0,5 s; SFX whoosh + impacto |
| 45:8–48:0 | FULL | **barra de prompt** (vidro, ícone chat à esq., botão ↑ roxo à dir.) digitando com cursor; quebra p/ 2 linhas; kicker acima | ~18 caracteres/s |
| 48:8–52:0 | FULL | **marquee atrás da cabeça**: 4 linhas rolando em direções alternadas — display branco sólido / display contorno / Jakarta lavanda minúscula / contorno menor | cada linha entra com blur escalonado 0,1 s; velocidades diferentes |
| 52:0–54:2 | FULL | 3 cards de vidro no topo + 3 embaixo (enquadram o rosto) | pop stagger |
| 54:2–57:0 | FULL→SPLIT | título "… no momento certo"; **timeline com playhead** (régua com ticks + diamante de keyframe); imagem entra lavada/desfocada → cor total quando o playhead passa; pílula "no frame exato" | playhead linear |
| 57:5–1:02 | SPLIT | título; **fluxo de 3 passos** (ícone em quadrado roxo + rótulo + sub) com setas; chips "▲ ACIMA / ABAIXO ▼" alternando ativo | passos entram em sequência |
| 1:02–1:05 | FULL | **5 planos em profundidade 3D**: o quadro do vídeo vira o plano da frente, outros 4 planos de vidro atrás em perspectiva, cada um com etiqueta mono numerada ("05 · MOLDURA"…), ícones em círculos, rodapé "5 CAMADAS · PROFUNDIDADE REAL"; título display atrás da cabeça | câmera gira ~15° e volta; planos se afastam em z |
| 1:05–1:06 | FULL | planos colapsam; vídeo fica com título atrás da cabeça + "3D" contorno | |
| 1:05–1:10 | SPLIT | **DM mockup**: cabeçalho (avatar + "Nova mensagem"), "…" digitando, bolha com texto digitando, miniatura de vídeo anexada | 3 pontos 0,5 s → texto ~20 c/s |
| 1:10–1:20 | SPLIT (card menor) | celular-referência + painéis de análise (onda de áudio "RITMO", chips de transição, grade de composição), seta → segundo celular "novo vídeo, mesma direção", pílulas "adaptado ao seu: roteiro / identidade / gravação" | painéis um a um |
| 1:20–1:28 | PIP | título palavra a palavra; card "base v1" + **carimbo "APROVADO ✓"** (contorno, -8°, bate de 1.3→1); cards A/B/C empilhados com deslocamento; grade 3×2 de variações | carimbo 0,15 s + micro-shake |
| 1:28–1:30 | card | troca de proporção 9:16 → 1:1 → 16:9 com rótulo no topo | 0,35 s |
| 1:30–1:35 | SPLIT | categoria grande ("ANÚNCIOS." com ponto lavanda) + **barra segmentada** (5 traços) + imagem trocando com blur cross-fade | troca a cada ~0,8 s |
| 1:36–1:40 | SPLIT | **terminal** (3 bolinhas, título mono), linhas `$ comando` digitando + barra de progresso + "✓ … instalado"; trilha "BÁSICO ——— AVANÇADO" | |
| 1:40–1:42 | TAKEOVER | **editor de vídeo** (preview 9:16, propriedades, timeline com 6 trilhas, playhead correndo, "Exportando 9:16" barra) | |
| 1:42–1:46 | PIP esq. | "ESCOLHA O SEU CAMINHO": card A, pílula "OU", card B | cards sobem; "OU" pop |
| 1:46–1:53 | PIP | **app de agente** em perspectiva 3D (prompt digitando, checklist de etapas, camadas, timeline enchendo), pílulas "VOCÊ ORIENTA" / "E REVISA O RESULTADO" | |
| 1:53–1:58 | SPLIT | moedas "T" voando para um cofre ($), "tentativa 1/2/3" riscadas com X, pílula "SEM TENTATIVAS DESNECESSÁRIAS" | |
| 1:58–2:04 | FULL | **timeline grande** sobre o peito (trilhas MOTION/VÍDEO/VOZ/TELAS, clipes roxos, playhead), amostra destacada; fluxo "AMOSTRA → AJUSTE → REUSO" | |
| 2:04–2:09 | FULL | kicker topo; pílula positiva roxa + pílula negativa escura com ✕ e texto riscado | |
| 2:09–2:15 | SPLIT | **documento branco** rolando (guia), cursor clicando "copiar" | scroll suave |
| 2:15–2:18 | SPLIT | 4 cards "SKILL.md" + etiqueta "BÔNUS" + bloco "IA" com glow | |
| 2:18–2:21 | FULL | corrente vertical de pílulas com setas ↓ | |
| 2:22–2:27 | FULL | **cards 3D orbitando atrás da cabeça** (thumbnails de aulas, inclinados, girando em carrossel), pílula inferior "12 aulas · …" trocando texto | carrossel lento, cards somem atrás do corpo (matte) |
| 2:27–2:31 | FULL | corrente vertical de pílulas; legenda grande "no seu **ritmo**" | |
| 2:31–2:33 | → TAKEOVER | **flash cinza**, vídeo encolhe para um card 9:16 que vira peça de um **mural** de dezenas de cards; título display "NA SUA ESCALA" por cima; câmera **mergulha** de volta no card do apresentador | zoom-out 0,4 s, zoom-in 0,4 s |
| 2:33–2:44 | SPLIT | oferta: pílula "PRIMEIRA TURMA" + kicker, logo pequeno, card de preço (kicker, R$ + número display gigante + "à vista", parcelado), chips do que inclui, **anel de garantia** (traço circular desenhando + número), letra miúda | número conta; anel desenha 0,6 s |
| 2:44–2:48 | FULL | kicker topo; **antes/depois**: linha vertical roxa brilhante varre da esquerda p/ direita, lado esquerdo grade bruta ("ANTES"), lado direito grade final ("DEPOIS · COM IA" pílula) | linha vai e volta, sai pela esquerda |
| 2:48–2:52 | FULL | **flash** + "100%" display atrás da cabeça; "COM" + "IA" (caixa roxa) no peito; kicker + logo pequeno | blur-in |
| 2:52–2:57 | FULL | **botão CTA** (pílula gradiente roxo, glow, seta →), **brilho varrendo** o botão, **cursor** entra e clica, chevrons ↓ pulsando; logo pequeno no topo | shimmer a cada 1,2 s |
| 2:57–2:59 | TAKEOVER | card final: logo + CTA + letra miúda; fundo com feixe roxo vertical | fade do apresentador |

## 4. Áudio

- **Música** entra só em ~0:19 (antes disso: voz + SFX). Bed eletrônico grave, baixo, abaixo da voz.
- **SFX** (visíveis no espectrograma): ruído de banda larga no glitch (1,7–2,2 s) + **sub boom** em 2,2 s;
  whoosh + impacto na revelação do logo (43,6–44,3 s); cliques/pops curtos em quase toda entrada de
  card/pílula; teclas na digitação. SFX curtos (<0,4 s), volume baixo, nunca brigam com a voz.

## 5. Ritmo da fala

Corte apertado (sem respiro entre frases), fala rápida e contínua. Cada palavra-chave ganha um elemento
visual entrando **exatamente na palavra**. Títulos e pílulas mostram 1–4 palavras — nunca a frase inteira.
