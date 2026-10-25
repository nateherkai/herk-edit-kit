# DESIGN — VSL roxo (1080×1920, 30 fps)

Copiado para cada projeto. Os números moram em `assets/kit.css` / `assets/kit.js` (fonte: a skill).
Mude no `vsl.json` do projeto; não edite o kit dentro do projeto (é sobrescrito no build).

## Paleta
| Token | Hex | Uso |
|---|---|---|
| bg0 | `#0e0b1e` | borda/vinheta do fundo |
| bg1 | `#1f123d` | fundo roxo principal |
| bg2 | `#2d1f50` | mancha clara no topo |
| acc / acc2 | `#8b5cf6` / `#9b63ff` | acento, glow, caixa de destaque |
| btnA → btnB | `#8b55ff → #a47fff` | pílulas e botão CTA (gradiente 90°) |
| lav / lav2 | `#b9a3ff` / `#a98bff` | palavra-acento nos títulos, linha grande da legenda |
| card / cardB | `rgba(255,255,255,.045)` / `rgba(167,139,250,.30)` | cards de vidro |
| muted | `#a59cc4` | kicker, metadados |
| rec / orange | `#ff3b3b` / `#ffa53c` | ponto REC; urgência ("HOJE 23:59") |

## Tipografia (todas OFL, em `assets/fonts/`)
| Voz | Fonte | Uso |
|---|---|---|
| Display largo | **Anybody 900, font-stretch 150%** (≈ Monument Extended) | títulos atrás da cabeça, "100%", mural, marquee, logo |
| Grotesca | **Plus Jakarta Sans 700/800** (≈ Gilroy) | títulos 56 px, legendas 44/50/70 px, pílulas 29 px, UI |
| Mono | **JetBrains Mono 500/600** | HUD de filmadora, tags de camada, terminal, rótulos técnicos |

Kicker: Jakarta 700, 21 px, caixa alta, tracking .24em, `muted`. Sempre 1–2 palavras-acento lavanda por título.

## Geometria
- FULL: vídeo tela cheia com punch `vsl.json.punch` (1,22 padrão; rosto grande, olhos ~ y 560–620).
- SPLIT: card do vídeo x 52 · y 990 · 976×880 · raio 22; conteúdo entre y 54 e 960; margem lateral 52–56.
- PIP: círculo Ø 270 em (891, 1722) (`pip`) ou (189, 1722) (`pipL`).
- Legenda de destaque: centrada, topo em `capY` (1500). Nunca acima do queixo; nunca em cima da boca.
- Título atrás da cabeça: topo 96–130, 150–230 px; a cabeça tem que cobrir parte das letras de baixo.
- Zona segura: nada importante abaixo de y 1800 (UI do Instagram) nem nos 40 px laterais.

## Movimento
- Entradas: `opacity 0 + blur 8–18px + (y 10–26 | scale .8–.96)` → nítido, 0,22–0,5 s, `power2/3.out` ou `back.out(1.5)` para pílulas.
- Saídas: blur 10px + fade 0,2–0,25 s. Nada sai deslizando.
- Troca de câmera: 0,45 s `power3.inOut`, sempre animada (o quadro voa entre layouts).
- Texto revela **na palavra falada** (transcript), nunca por stagger arbitrário quando a frase existe.
- Um elemento novo a cada 1,5–3 s; FULL sem nada > 4 s só em momento emocional.
- SFX curtos e baixos em toda entrada (pop/tick/whoosh); glitch+boom só no gancho; whoosh+boom no logo.

## O que NÃO fazer
- Legenda contínua palavra a palavra o vídeo todo (a referência só legenda frases-chave).
- Cores fora da paleta, sombras pretas pesadas, emojis decorativos, fontes serifadas.
- Corte seco entre FULL e SPLIT; zoom contínuo exagerado; mais de 3 elementos entrando ao mesmo tempo.
- Copiar logo, marca ou textos da referência.
