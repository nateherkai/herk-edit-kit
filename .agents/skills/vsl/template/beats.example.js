// DEMO do kit VSL roxo sobre um anúncio do Oney (69 s). Cada bloco = um beat da gramática da referência.
const A = (p, n = 1, after = 0) => K.at(p, n, after);
const IMG = Array.from({ length: 18 }, (_, i) => `assets/img/v${String(i + 1).padStart(2, "0")}.jpg`);

// 1) GANCHO "BRUTO" → glitch → grade final + título atrás da cabeça
const tG = A("foi editado") - 0.05;
K.camcorder(0, tG, { label: "BRUTO · SEM EDIÇÃO" });
K.glitch(tG);
K.punch(tG + 0.1, 1.5);
K.behindTitle(["EDITADO", "POR IA"], A("por inteligência"), { size: 150, top: 250, until: A("só simplesmente") });

// 2) SPLIT: pasta de gravações + post-its de erro
const t2 = A("só simplesmente") - 0.1;
K.layout("split", t2);
K.section({ kicker: "O que eu mandei", title: "Um vídeo bruto com erros", acc: [3, 4] }, t2 + 0.15, { until: A("e ele editou") - 0.2 });
K.files(8, t2 + 0.35, { box: { x: 52, y: 300, w: 976, h: 330 }, until: A("e ele editou") - 0.2 });
K.notes([
  { text: "erros", x: 120, y: 690, t: A("erros"), rot: -6 },
  { text: "respirações", x: 380, y: 760, t: A("respirações"), rot: 4 },
  { text: "falhas", x: 700, y: 680, t: A("falhas"), rot: -3 },
], { until: A("e ele editou") - 0.2 });

// 3) FULL + HUD de rosto + legenda com caixa roxa
const t3 = A("e ele editou") - 0.05;
K.layout("full", t3, 0.45);
K.faceHud(t3 + 0.3, { label: "APRESENTADOR", until: A("basicamente") });
K.cap({ l1: "e ele editou", hl: "tudo pra mim" }, t3 + 0.1, { until: A("basicamente") - 0.05 });

// 4) Pilha de lettering, uma linha por palavra falada
K.stack([
  { text: "Seu vídeo", t: A("o seu vídeo"), style: "blur" },
  { text: "Animações", t: A("animações"), style: "letters" },
  { text: "10 minutos", t: A("10 minutos"), style: "glow" },
], { until: A("então se você") - 0.1 });
K.inset(A("basicamente"), A("então se você") - 0.1);

// 5) pílula riscada + pílula positiva
K.kickerTop("Pensa nisso", A("então se você"), { until: A("edite vídeos") - 0.1 });
K.pill("horas editando", A("horas editando"), { y: 1380, kind: "strike", up: true, until: A("edite vídeos") - 0.1 });
K.punch(A("deixa eu te"), 1.55);
K.topTitle({ kicker: "Deixa eu te convidar", text: "EDITE COM IA", icon: "scissors" }, A("edite vídeos"), { until: A("eu sou o cara") - 0.1 });
K.punch(A("eu sou o cara"), 1.42);

// 6) legenda linha + linha grande lavanda
K.cap({ l1: "eu sou o cara", big: "mais cético" }, A("eu sou o cara"), { until: A("e aí depois") - 0.05 });

// 7) corrente de pílulas (↓)
K.chain([
  { text: "Testei", t: A("eu testei"), icon: "check" },
  { text: "Personalizei", t: A("eu personalizei"), icon: "wand" },
  { text: "Do meu jeito", t: A("do jeitinho"), icon: "spark" },
], { y: 1200, sep: "↓", label: "Depois que eu", up: true, until: A("o que você está vendo aqui") - 0.1 });

// 8) 5 camadas em profundidade
const t8 = A("o que você está vendo aqui");
K.layers3d(["05 · MOLDURA", "04 · ÍCONES", "03 · LEGENDA", "02 · TEXTO"], t8, A("se você quer") - t8, { frontLabel: "01 · VÍDEO" });

// 9) prompt de IA digitando
const t9 = A("se você quer");
K.prompt("Edite meu vídeo: corte as pausas, legenda roxa e animações no ritmo da fala", A("quer só mandar") - 0.2, { y: 1360, kicker: "Você manda · a IA edita", cps: 26, send: true, until: A("e ter visualizações") - 0.1 });

// 10) mural dos vídeos dele
K.wall(IMG, ["VISUALIZAÇÕES", "COMO ESSAS"], A("e ter visualizações"), A("que foram com") - A("e ter visualizações"), { size: 70 });

// 11) PIP + DM "EU QUERO"
const t11 = A("comenta eu quero");
K.layout("split", A("que foram com"));
K.dm({ name: "Nova mensagem", sub: "agora · direct", text: "EU QUERO 🙋", attach: IMG[3] }, A("que foram com") + 0.2, { cps: 14, until: A("que a gente está") - 0.1 });
K.pill("Comenta EU QUERO", t11, { y: 960, icon: "chat", up: true, until: A("que a gente está") - 0.1 });

// 12) logo em takeover + marquee atrás da cabeça
const t12 = A("novo programa");
K.layout("full", A("que a gente está"), 0.45);
K.takeover(t12, t12 + 1.9, 0.2);
K.logo({ text: "Edição Viral", sub: "O método para editar com IA" }, t12, 1.9, { size: 92, y: 880, h: 110 });
K.marquee([{ text: "EDIÇÃO VIRAL" }, { text: "EDIÇÃO" }, { text: "edição viral com IA" }, { text: "VIRAL" }], t12 + 1.9, A("que você e o seu") - t12 - 1.9);

// 13) SPLIT + terminal
const t13 = A("que você e o seu") - 0.1;
K.layout("split", t13);
K.section({ kicker: "Do absoluto básico", title: "Da instalação ao primeiro vídeo", acc: [4, 5] }, t13 + 0.1, { until: A("e depois é só") - 0.1 });
K.terminal([
  { cmd: "baixar materiais", ok: "pronto", t: t13 + 0.5 },
  { cmd: "instalar ferramentas", ok: "instalado", t: A("executar essa") },
  { cmd: "conectar a IA", ok: "conectado", t: A("a instalação") },
], t13 + 0.3, { box: { x: 52, y: 280, w: 976, h: 420 }, until: A("e depois é só") - 0.1 });

// 14) FULL + antes/depois + 100% atrás da cabeça
const t14 = A("e depois é só");
K.layout("full", t14 - 0.1, 0.45);
K.beforeAfter(t14 + 0.4, A("100") - t14 - 0.6);
K.flash(A("100") - 0.15, { peak: 0.6 });
K.behindTitle(["100%"], A("100"), { size: 230, top: 300, until: A("então aproveita") });
K.cap({ acc: "editado com IA", accWords: [2] }, A("editado", 3), { y: 1380, until: A("a gente está lançando") });

// 15) CTA final
K.cta("Comenta EU QUERO", A("a gente está lançando"), { y: 1500, clickAt: 1.4 });
K.kickerTop("Lançamento · desconto hoje", A("a gente está lançando") + 0.2);
