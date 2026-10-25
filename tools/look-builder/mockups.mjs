// Mini mockups of the editing templates, taken from the kit's own landing page (landing-pages/edicao-claude/index.html):
// dark phone frame, a neutral presenter in clay/cream, each layout drawn with positioned divs and cqw text so it scales
// with the card. Generated file: regenerate with `node tools/look-builder/sync-mockups.mjs` after editing the landing.
export const MOCKUP_CSS = `/* MINI TELAS (mockups) */
.phone{position:relative;aspect-ratio:9/16;border-radius:14px;overflow:hidden;background:#0d0d0c;border:1px solid var(--line-2);container-type:inline-size;font-family:var(--serif);isolation:isolate}
.phone.w{aspect-ratio:16/9}
.phone .a{position:absolute}
.phone .fill{inset:0}
.phone .person{position:absolute;display:block;height:auto}
.phone .vig{inset:0;background:linear-gradient(180deg,rgba(0,0,0,.35),transparent 22%,transparent 60%,rgba(0,0,0,.55));pointer-events:none}
/* moldura de reel: barra de progresso e trilho de ícones */
.phone .prog{left:5%;right:5%;top:2.4%;height:.9cqw;border-radius:9px;background:rgba(255,255,255,.22);overflow:hidden}
.phone .prog i{position:absolute;inset:0;background:#fff;transform-origin:left;animation:prog 6s linear infinite}
@keyframes prog{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.phone .rail{right:4%;bottom:24%;display:flex;flex-direction:column;gap:3.4cqw}
.phone .rail i{display:block;width:5.4cqw;height:5.4cqw;border-radius:50%;background:rgba(255,255,255,.75)}
/* imagens */
.img1{background:linear-gradient(165deg,#f2a27f,#d97757 45%,#7a3622)}
.img2{background:linear-gradient(165deg,#4a4740,#23221e)}
.img3{background:radial-gradient(circle at 72% 28%,#f6e3c8 0 7%,transparent 7.5%),linear-gradient(180deg,#e9b48e,#a8705a 55%,#3a2a24 56%,#241b17)}
.img4{background:radial-gradient(circle at 30% 35%,#8fb0c9 0 18%,transparent 19%),linear-gradient(160deg,#3d4a55,#1d2329)}
.img5{background:linear-gradient(160deg,#e8d9b8,#b9a27a)}
.cycle{animation:cyc 6s infinite}
.cycle.d2{animation-delay:-4s}.cycle.d3{animation-delay:-2s}
@keyframes cyc{0%,30%{opacity:1}36%,94%{opacity:0}100%{opacity:1}}
/* textos */
.cap{left:6%;right:6%;text-align:center;font-weight:800;font-size:7.6cqw;line-height:1.05;letter-spacing:-.03em;text-transform:uppercase;color:#fff;text-shadow:0 .6cqw 2.4cqw rgba(0,0,0,.65)}
.cap b{color:var(--clay)}
.hl{background:var(--clay);color:var(--clay-ink);padding:0 .22em;border-radius:.14em;text-shadow:none}
.pop{animation:pop 1.5s cubic-bezier(.3,1.6,.5,1) infinite}
@keyframes pop{0%{transform:scale(.6);opacity:0}18%,85%{transform:scale(1);opacity:1}100%{opacity:0}}
.mono-s{font-family:var(--mono);font-size:3.6cqw;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.ui{background:rgba(27,26,24,.92);border:1px solid var(--line-2);border-radius:3.4cqw}
.glass{background:rgba(240,238,230,.13);border:1px solid rgba(240,238,230,.3);border-radius:3.6cqw;backdrop-filter:blur(6px);box-shadow:0 2cqw 6cqw rgba(0,0,0,.25)}
.paper{background:var(--cream);border-radius:2cqw;box-shadow:0 2cqw 6cqw rgba(0,0,0,.4)}
.ln{position:absolute;height:2.2cqw;border-radius:9px;background:#c9c4b8}
.ln.d{background:#3a3833}.ln.c{background:var(--clay)}
.bar{position:absolute;bottom:0;border-radius:1.4cqw 1.4cqw 0 0;background:var(--clay);transform-origin:bottom;animation:grow 2.4s ease-in-out infinite alternate}
@keyframes grow{from{transform:scaleY(.3)}to{transform:scaleY(1)}}
.draw{stroke-dasharray:240;stroke-dashoffset:240;animation:draw 4s ease-in-out infinite}
@keyframes draw{0%{stroke-dashoffset:240}55%,100%{stroke-dashoffset:0}}
.blink{animation:blink 1s steps(1) infinite}@keyframes blink{50%{opacity:0}}
.pulse{animation:pulse 2.2s ease-in-out infinite}@keyframes pulse{50%{opacity:.35}}
.float{animation:float 4s ease-in-out infinite}.float.d2{animation-delay:-1.3s}.float.d3{animation-delay:-2.6s}
@keyframes float{50%{translate:0 -2.4cqw}}
.slide{animation:slide 6s cubic-bezier(.7,0,.2,1) infinite}
@keyframes slide{0%,38%{transform:translateY(-102%)}46%,88%{transform:none}96%,100%{transform:translateY(-102%)}}
.scroll{animation:scroll 8s ease-in-out infinite alternate}@keyframes scroll{to{transform:translateY(-38%)}}
.seq{opacity:0;animation:seq 6s infinite}
@keyframes seq{0%{opacity:0;transform:scale(.7)}6%,90%{opacity:1;transform:none}100%{opacity:0}}
.node{border:1px solid var(--line-2);background:var(--bg-3);border-radius:2.4cqw;display:grid;place-items:center;font-weight:700;font-size:3.8cqw;color:var(--cream);animation:node 4.5s infinite}
@keyframes node{0%,10%{background:var(--clay);color:var(--clay-ink);border-color:var(--clay)}30%,100%{background:var(--bg-3);color:var(--cream);border-color:var(--line-2)}}
.tier{display:grid;place-items:center;font-weight:800;font-size:5.4cqw;color:#1b1a18;border-radius:1.6cqw}
.tile{border-radius:1.6cqw}
.phone .vig{z-index:1}.phone .cap{z-index:2}.phone .prog,.phone .rail{z-index:3}
@keyframes grow-x{from{transform:scaleX(.15)}to{transform:scaleX(1)}}`;
export const PERSON_DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><linearGradient id="gShirt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a4740"/><stop offset="1" stop-color="#252320"/></linearGradient><linearGradient id="gSkin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b48a73"/><stop offset="1" stop-color="#7d5f50"/></linearGradient></defs></svg>`;
const A = (s, inner = '', c = '') => `<div class="a ${c}" style="${s}">${inner}</div>`;
const RIM = 'filter:drop-shadow(.9cqw 0 0 #d97757) drop-shadow(-.9cqw 0 0 #d97757) drop-shadow(0 -.9cqw 0 #d97757)';
const person = (x, w, b = 0, rim = false) => `<svg class="person" viewBox="0 0 100 112" style="left:${x - w / 2}%;width:${w}%;bottom:${b}%;${rim ? RIM : ''}"><path fill="url(#gShirt)" d="M4 112C6 84 25 73 50 73s44 11 46 39Z"/><path fill="#7d5f50" d="M41 56h18v20c-3 4-15 4-18 0z"/><ellipse cx="50" cy="40" rx="17" ry="21" fill="url(#gSkin)"/><path fill="#2a2420" d="M32 40c-2-17 7-26 18-26s20 8 18 26c-2-9-9-13-18-13s-15 4-18 13z"/></svg>`;
const bars = (s, hs, color = 'var(--clay)') => A(s, hs.map((h, i) => `<i class="bar" style="left:${i * (100 / hs.length)}%;width:${100 / hs.length - 7}%;height:${h}%;animation-delay:${i * .3}s;background:${color}"></i>`).join(''));
const line = (s, color = '#fff') => `<svg class="a" viewBox="0 0 100 30" preserveAspectRatio="none" style="${s}"><path class="draw" d="M0 27 L18 20 L34 23 L52 12 L70 15 L100 3" fill="none" stroke="${color}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>`;
const lines = (x, y, ws, gap = 6, c = '') => ws.map((w, i) => `<i class="ln ${c}" style="left:${x}%;top:${y + i * gap}%;width:${w}%"></i>`).join('');
const cycle = (s, imgs) => imgs.map((im, i) => A(s, '', `${im} cycle d${i + 1}`)).join('');
const polaroid = (s, img, rot, d) => A(`${s};transform:rotate(${rot}deg)`, A('left:7%;right:7%;top:7%;bottom:22%;border-radius:1cqw', '', img), `paper float d${d}`);
const DARK = A('inset:0;background:#121211');

const L = {
  negocios: A('inset:0', '', 'img2') + person(50, 80)
    + A('left:0;right:0;top:0;height:50%;overflow:hidden',
        A('inset:0', '', 'img1') + A('left:8%;top:16%', '<div class="mono-s" style="color:#fff">faturamento</div><div style="font-weight:800;font-size:13cqw;color:#fff;letter-spacing:-.04em">R$ 48k</div>')
        + bars('right:8%;bottom:12%;width:38%;height:46%', [40, 65, 52, 92], '#fff'), 'slide')
    + A('bottom:17%', 'venda <span class="hl">mais</span>', 'cap'),

  pessoal: cycle('inset:0', ['img3', 'img4', 'img1'])
    + A('bottom:40%;text-transform:none;font-size:13cqw', 'hoje', 'cap pop'),

  painel: DARK
    + A('left:5%;right:5%;top:7%;height:49%', '<div class="a mono-s" style="left:7%;top:7%">crescimento</div><div class="a" style="left:7%;top:16%;font-weight:800;font-size:13cqw;color:var(--clay);letter-spacing:-.04em">+312%</div>' + bars('left:7%;right:7%;bottom:8%;height:46%', [30, 48, 40, 70, 95]), 'ui')
    + A('left:0;right:0;bottom:0;height:41%;overflow:hidden', A('inset:0', '', 'img2') + person(50, 66))
    + A('bottom:5%;font-size:6.6cqw', 'isso <b>muda</b> tudo', 'cap'),

  vidro: A('inset:0', '', 'img1') + A('inset:0;background:rgba(20,20,19,.38)') + person(50, 84)
    + A('left:7%;right:7%;top:8%;height:25%', '<div class="a mono-s" style="left:7%;top:12%;color:#fff">receita mensal</div><div class="a" style="left:7%;top:30%;font-weight:800;font-size:11cqw;color:#fff;letter-spacing:-.04em">12.480</div>' + line('left:52%;right:7%;top:28%;height:50%'), 'glass')
    + A('left:7%;top:36%;padding:1.6cqw 3cqw;font-weight:700;font-size:4.4cqw;color:#fff', '↑ 48%', 'glass')
    + A('right:7%;top:36%;padding:1.6cqw 3cqw;font-weight:700;font-size:4.4cqw;color:#fff', '+1.2k alunos', 'glass pulse'),

  ensaio: A('inset:0;background:#000')
    + A('left:8%;top:7%;font-weight:800;font-size:6.6cqw;color:#fff;letter-spacing:-.02em', 'PROVA <span style="color:var(--clay)">#01</span>')
    + A('left:10%;right:10%;top:15%;height:27%;transform:rotate(-3deg)', '<div class="a mono-s" style="left:7%;top:9%;color:#7a756b">jornal · 2026</div>' + lines(7, 26, [80, 66], 13, 'd') + '<i class="ln c" style="left:7%;top:52%;width:52%;height:1.4cqw"></i>' + lines(7, 66, [84, 74, 60], 10), 'paper')
    + person(50, 78, 0, true)
    + A('bottom:13%;font-size:6.4cqw', 'eles <b>sabiam</b>', 'cap'),

  split: A('left:0;right:0;top:0;height:50%;overflow:hidden', A('inset:0', '', 'img2') + person(50, 72))
    + A('left:0;right:0;top:50%;height:.8cqw;background:var(--clay)')
    + A('left:0;right:0;bottom:0;height:49.6%;background:#121211',
        '<div class="a mono-s" style="left:8%;top:9%">o fluxo</div>'
        + A('left:6%;top:26%;width:25%;height:20%', 'IDEIA', 'node')
        + A('left:37.5%;top:26%;width:25%;height:20%;animation-delay:1.5s', 'VÍDEO', 'node')
        + A('left:69%;top:26%;width:25%;height:20%;animation-delay:3s', 'VENDA', 'node')
        + '<svg class="a" viewBox="0 0 100 10" preserveAspectRatio="none" style="left:6%;right:6%;top:33%;height:6%"><path d="M29.5 5h5M64.8 5h5" stroke="#a19d92" stroke-width="1.4" vector-effect="non-scaling-stroke"/><path d="M33 2l2 3-2 3M68.3 2l2 3-2 3" vector-effect="non-scaling-stroke" fill="none" stroke="#a19d92" stroke-width="1.4"/></svg>'
        + line('left:8%;right:8%;top:58%;height:30%', 'var(--clay)')),

  broll: cycle('inset:0', ['img3', 'img4']) + A('inset:0;background:rgba(0,0,0,.3)')
    + A('left:8%;right:8%;top:30%;font-weight:800;font-size:11cqw;line-height:1.1;letter-spacing:-.04em;color:#fff;text-transform:uppercase;text-shadow:0 .6cqw 2.4cqw rgba(0,0,0,.5);z-index:2',
        '<div class="seq">pare de</div><div class="seq" style="animation-delay:.4s"><span class="hl">editar</span></div><div class="seq" style="animation-delay:.8s">sozinho</div>'),

  encaixe: A('inset:0', '', 'img2') + person(50, 82)
    + A('left:8%;right:8%;top:17%;color:#fff;z-index:2;text-shadow:0 .6cqw 2.4cqw rgba(0,0,0,.5)',
        '<div style="font-weight:600;font-size:5.4cqw">o segredo é o</div><div style="font-weight:800;font-size:19.5cqw;line-height:.92;letter-spacing:-.05em;color:var(--clay)">CLAUDE</div><div style="font-weight:600;font-size:5.4cqw;text-align:right">editando por você</div>'),

  cluster: A('inset:0', '', 'img2')
    + polaroid('left:5%;top:9%;width:40%;height:22%', 'img3', -7, 1)
    + polaroid('left:33%;top:15%;width:36%;height:21%', 'img1', 5, 2)
    + polaroid('right:5%;top:7%;width:34%;height:20%', 'img4', -3, 3)
    + person(50, 74)
    + A('bottom:11%;text-transform:none;font-weight:600;font-size:5cqw', 'tudo começou aqui', 'cap'),

  clipes: DARK
    + '<div class="a mono-s" style="left:7%;top:6%">vídeo longo · 48:12</div>'
    + A('left:7%;right:7%;top:11%;height:2.6cqw;border-radius:9px;background:#33312c',
        A('left:12%;width:9%;top:0;bottom:0;background:var(--clay);border-radius:9px') + A('left:46%;width:6%;top:0;bottom:0;background:var(--clay);border-radius:9px') + A('left:78%;width:8%;top:0;bottom:0;background:var(--clay);border-radius:9px'))
    + [['#1', '0:42', 96, 'img1'], ['#2', '0:58', 81, 'img4'], ['#3', '0:35', 67, 'img3']].map(([n, t, sc, im], i) =>
        A(`left:7%;right:7%;top:${19 + i * 25}%;height:21%;animation-delay:${i * .5}s`,
          A('left:4%;top:9%;bottom:9%;width:28%;border-radius:2cqw;overflow:hidden', A('inset:0', '', im) + person(50, 90))
          + `<div class="a" style="left:38%;top:16%;font-weight:800;font-size:8cqw;color:${i ? 'var(--cream)' : 'var(--clay)'}">${n}</div>`
          + `<div class="a mono-s" style="right:7%;top:22%">${t}</div>`
          + A('left:38%;right:7%;bottom:22%;height:2.4cqw;border-radius:9px;background:#33312c', A(`left:0;top:0;bottom:0;width:${sc}%;border-radius:9px;background:var(--clay)`)), 'ui seq')).join(''),

  recorte: cycle('inset:0', ['img1', 'img4', 'img3']) + person(50, 86, 0, true)
    + A('bottom:16%;font-size:6.8cqw', 'uma <b>ideia</b> por tela', 'cap'),

  grade: DARK
    + [[3, 3, 'img1', 'img4'], [51, 3, 'img4', 'img3'], [3, 51, 'img3', 'img1'], [51, 51, 'img5', 'img2']].map(([x, y, a, b]) =>
        A(`left:${x}%;top:${y}%;width:46%;height:46%;border-radius:2.4cqw;overflow:hidden`, A('inset:0', '', b) + A('inset:0', '', `${a} cycle d1`))).join('')
    + person(50, 62, 0, true),

  profundo: A('inset:0;background:#0f0f0e')
    + A('left:6%;right:6%;top:9%;height:44%',
        '<div class="a" style="left:5%;top:5%;display:flex;gap:1.4cqw"><i style="width:2.2cqw;height:2.2cqw;border-radius:50%;background:#e8916f"></i><i style="width:2.2cqw;height:2.2cqw;border-radius:50%;background:#c9c4b8"></i><i style="width:2.2cqw;height:2.2cqw;border-radius:50%;background:#6f6c64"></i></div>'
        + A('left:5%;top:17%;bottom:6%;width:22%;border-radius:1.6cqw;background:#242320') + lines(32, 18, [56, 40], 9, 'd') + bars('left:32%;right:6%;bottom:8%;height:40%', [35, 55, 45, 80, 62, 95]), 'ui')
    + A('right:8%;top:38%;padding:2cqw 3cqw;font-weight:700;font-size:4.2cqw;color:#fff', '✓ publicado', 'glass float')
    + person(50, 88)
    + A('bottom:15%;font-size:6.4cqw', 'o <b>sistema</b> real', 'cap'),

  ranking: DARK
    + '<div class="a mono-s" style="left:7%;top:5%">tier list · ferramentas</div>'
    + [['S', '#d97757', 3], ['A', '#e8b86f', 2], ['B', '#9fb4cf', 2], ['C', '#8a877e', 1]].map(([t, c, n], r) =>
        A(`left:6%;width:14%;top:${11 + r * 11.5}%;height:10%;background:${c}`, t, 'tier')
        + A(`left:23%;right:6%;top:${11 + r * 11.5}%;height:10%;border-radius:1.6cqw;background:#1f1e1b;border:1px solid #33312c`,
            Array.from({length: n}, (_, i) => A(`left:${3 + i * 24}%;top:12%;bottom:12%;width:20%;animation-delay:${(r * 3 + i) * .35}s`, '', `tile seq ${['img1', 'img4', 'img3', 'img5'][(r + i) % 4]}`)).join(''))).join('')
    + person(50, 64),

  youtube: A('inset:0', '', 'img2') + person(27, 40)
    + A('right:5%;width:48%;top:12%;height:70%', '<div class="a" style="left:7%;top:8%;font-weight:800;font-size:3.6cqw;color:#fff;letter-spacing:-.03em">3 PASSOS</div>'
        + [0, 1, 2].map(i => A(`left:7%;right:7%;top:${32 + i * 21}%;height:15%;animation-delay:${i * .6}s`, `<div class="a" style="left:0;top:0;bottom:0;aspect-ratio:1;border-radius:50%;background:var(--clay);color:var(--clay-ink);display:grid;place-items:center;font-weight:800;font-size:1.8cqw">${i + 1}</div><i class="ln" style="left:22%;top:38%;width:${70 - i * 12}%;height:1.2cqw;background:rgba(255,255,255,.75)"></i>`, 'seq')).join(''), 'glass')
    + A('left:5%;bottom:8%;padding:.8cqw 1.6cqw;border-left:.7cqw solid var(--clay);background:rgba(20,20,19,.85);font-weight:700;font-size:1.9cqw;color:#fff;border-radius:.6cqw', 'Seu Nome <span style="color:var(--muted);font-weight:500">· especialista</span>'),

  aula: A('inset:0;background:#1b1a18')
    + A('left:4%;width:54%;top:7%;bottom:7%;overflow:hidden',
        '<div class="a" style="left:7%;top:8%;font-weight:800;font-size:2.8cqw;color:#1b1a18;letter-spacing:-.03em">Aula 03 · Funil</div>'
        + A('left:6%;top:31%;height:7%;border-radius:.6cqw;background:rgba(217,119,87,.35);animation:grow-x 3s ease-in-out infinite alternate;transform-origin:left;width:70%')
        + lines(7, 32, [66, 78, 58, 72, 50], 11), 'paper')
    + A('left:61%;right:4%;top:7%;bottom:7%;border-radius:1.4cqw;overflow:hidden', A('inset:0', '', 'img2') + person(50, 92)),

  chamada: DARK
    + [[3, 6, 'img2'], [31, 6, 'img4'], [3, 51, 'img4'], [31, 51, 'img2']].map(([x, y, im], i) =>
        A(`left:${x}%;top:${y}%;width:26%;height:43%;border-radius:1.2cqw;overflow:hidden;${i === 0 ? 'outline:.4cqw solid var(--clay)' : ''}`,
          A('inset:0', '', im) + person(50, 70) + `<div class="a" style="left:5%;bottom:6%;font-size:1.4cqw;font-weight:600;color:#fff;background:rgba(0,0,0,.5);padding:.2cqw .8cqw;border-radius:.6cqw">${['você', 'aluno 1', 'aluno 2', 'aluno 3'][i]}</div>`)).join('')
    + '<svg class="a" viewBox="0 0 10 10" style="left:59%;top:44%;width:5%;height:12%"><path d="M1 5h7M5 2l3 3-3 3" fill="none" stroke="#d97757" stroke-width="1.2"/></svg>'
    + A('left:66%;width:22%;top:6%;bottom:6%;border-radius:1.4cqw;overflow:hidden;border:1px solid var(--line-2)',
        A('inset:0', '', 'img1') + person(50, 90) + A('left:8%;top:5%;padding:.3cqw 1cqw;border-radius:9px;background:var(--clay);color:var(--clay-ink);font-weight:800;font-size:1.5cqw', 'CLIPE #1') + '<div class="a" style="right:8%;top:6%;font-family:var(--mono);font-size:1.3cqw;color:#fff">0:58</div>'),

  documento: A('inset:0;background:#1b1a18')
    + A('left:20%;right:20%;top:6%;height:150%',
        '<div class="a" style="left:8%;top:4%;font-weight:800;font-size:3cqw;color:#1b1a18;letter-spacing:-.03em">Como vender todo dia</div>'
        + lines(8, 12, [84, 78, 82, 60], 4.2)
        + A('left:8%;right:8%;top:31%;height:13%;border-radius:1cqw;background:rgba(217,119,87,.18);border-left:.6cqw solid var(--clay)', lines(6, 28, [80, 62], 26, 'c'))
        + '<div class="a" style="left:8%;top:49%;font-weight:700;font-size:2.2cqw;color:#1b1a18">Passo 1</div>'
        + lines(8, 55, [80, 72, 84, 58, 76], 4.2), 'paper scroll'),

  broteca: DARK
    + A('left:6%;right:6%;top:9%;height:15%', '<div class="a" style="left:3%;top:50%;transform:translateY(-50%);font-size:2.6cqw;color:var(--cream);font-weight:500">⌕ &nbsp;pôr do sol na praia<span class="blink" style="color:var(--clay)">|</span></div>', 'ui')
    + ['img3', 'img2', 'img4', 'img1', 'img5', 'img3', 'img2', 'img4'].map((im, i) =>
        A(`left:${6 + (i % 4) * 22.4}%;top:${32 + Math.floor(i / 4) * 32}%;width:20%;height:28%;border-radius:1.2cqw;${i === 0 ? 'outline:.4cqw solid var(--clay);outline-offset:.3cqw' : 'opacity:.55'}`,
          i === 0 ? '<div class="a" style="right:6%;top:8%;padding:.2cqw .8cqw;border-radius:9px;background:var(--clay);color:var(--clay-ink);font-weight:800;font-size:1.5cqw">98%</div>' : '', im)).join(''),

  texto: DARK
    + A('left:5%;width:28%;top:12%;bottom:12%;border-radius:1.4cqw;overflow:hidden', A('inset:0', '', 'img1') + person(50, 90)
        + '<div class="a" style="left:50%;top:38%;width:7cqw;height:7cqw;margin:-3.5cqw 0 0 -3.5cqw;border-radius:50%;background:rgba(255,255,255,.85);display:grid;place-items:center"><i style="width:0;height:0;border-left:2.2cqw solid #1b1a18;border-top:1.4cqw solid transparent;border-bottom:1.4cqw solid transparent;margin-left:.6cqw"></i></div>')
    + '<svg class="a" viewBox="0 0 10 10" style="left:35%;top:44%;width:6%;height:12%"><path d="M1 5h7M5 2l3 3-3 3" fill="none" stroke="#d97757" stroke-width="1.2"/></svg>'
    + A('left:44%;right:5%;top:10%;height:44%', '<div class="a mono-s" style="left:5%;top:10%;font-size:1.5cqw;color:#7a756b">assunto: o erro que custou caro</div>' + lines(5, 34, [86, 78, 82, 52], 13), 'paper seq')
    + A('left:44%;right:5%;top:60%;height:30%;animation-delay:.6s', '<i class="a" style="left:4%;top:18%;width:4cqw;height:4cqw;border-radius:50%;background:var(--clay)"></i>' + lines(17, 22, [40], 1, 'd') + lines(4, 58, [88, 70], 18) + '<div class="a" style="right:5%;top:14%;color:var(--clay);font-size:2.4cqw">♥</div>', 'ui seq')
};
const NORAIL = ['clipes', 'ranking', 'painel', 'split'];
const chrome = k => '<div class="a vig"></div><div class="a prog"><i></i></div>' + (NORAIL.includes(k) ? '' : '<div class="a rail"><i></i><i></i><i></i></div>');
export const KINDS = Object.keys(L);
export function mockupHtml(kind, wide = false) { const k = L[kind] ? kind : "pessoal"; return `<div class="phone${wide ? " w" : ""}">${L[k]}${wide ? "" : chrome(k)}</div>`; }
