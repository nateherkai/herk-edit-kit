// VSL laranja · Advercase · edição simultânea · v3
// - legenda que SEGUE A BOCA (K.mouthCaps, tracking em assets/face-track.json)
// - abertura: o vídeo vira 3D, as camadas se separam e a frase falada aparece legível na camada de texto
// - tudo dentro da zona segura do Reels (topo 220, base 1520, coluna de botões à direita); PIP no canto inferior ESQUERDO
// - corte novo: sem "ééé", sem respirações, com cortes J/L (assets/edit-decisions.json)
const A = (p, n = 1, after = 0) => K.at(p, n, after);
const IMG = Array.from({ length: 18 }, (_, i) => `assets/img/v${String(i + 1).padStart(2, "0")}.jpg`);
const RAW = Array.from({ length: 6 }, (_, i) => `assets/img/raw0${i + 1}.jpg`);
const CHEST = 1330; // linha do peito para pílulas/painéis em tela cheia (abaixo da legenda da boca)

// 1) "Tudo o que você está vendo nesse vídeo foi editado por inteligência artificial"
//    bruto → glitch → o vídeo gira em 3D, as camadas se afastam e a frase aparece legível na camada de texto
const tG = A("foi editado") - 0.05;
K.camcorder(0, tG, { label: "BRUTO · SEM EDIÇÃO" });
K.glitch(tG);
const tX1 = A("eu só") - 0.5;
K.explode(tG + 0.05, tX1, { lines: ["Foi editado", "por inteligência", "artificial"], phrase: "foi editado por inteligência artificial", top: 300, size: 120 });

// 2) "mandei um vídeo bruto com erros, respirações, falhas… e ele editou tudo pra mim"
const t2 = tX1 + 0.62;
K.layout("split", t2);
K.section({ kicker: "O que eu mandei", title: "Um vídeo bruto", acc: [2] }, t2 + 0.15, { until: A("basicamente") - 0.25 });
K.waveCut(A("mandei") - 0.1, [
  { label: "erro", at: 0.12, w: 0.13, t: A("erros") },
  { label: "respiração", at: 0.44, w: 0.1, t: A("respirações") },
  { label: "falha", at: 0.74, w: 0.11, t: A("falhas") },
], { thumbs: RAW, box: { x: 90, y: 520, w: 900, h: 430 }, cutAt: A("editou"), cutLabel: "3 cortes · sem pausas", until: A("basicamente") - 0.25 });
K.pill("Editado", A("tudo pra mim"), { y: 520 - 70, x: 760, sm: true, up: true, icon: "check", until: A("basicamente") - 0.25 });

// 3) "vai pegar o seu vídeo, vai colocar animações em menos de 10 minutos"
K.layout("full", A("basicamente") - 0.1);
K.progress("Colocando animações", A("animações") - 0.1, 0.9, { box: { x: 140, y: CHEST, w: 800 }, until: A("10 minutos") - 0.1 });
K.pill("Em menos de 10 minutos", A("10 minutos"), { y: CHEST + 20, icon: "clock", up: true, until: A("então se você") - 0.1 });

// 4) "se você passar horas editando" — a dor: timeline manual lotada, contadores e relógio disparando
const t4 = A("então se você");
K.layout("pip", t4 - 0.1);
K.manual(t4, A("deixa eu") - t4 + 0.15, { box: { x: 90, y: 400, w: 850, h: 800 }, hours: 8, until: A("deixa eu") + 0.2 });

// 5) "deixa eu te convidar, edite vídeos com IA" — manual 8 h × IA 10 min
const t5 = A("deixa eu");
K.topTitle({ kicker: "Deixa eu te convidar", text: "Edite com IA", icon: "scissors" }, A("edite vídeos") - 0.1, { until: A("e eu vou falar") - 0.1 });
K.compare([
  { label: "Edição manual", value: "8 horas", frac: 1, bad: true, t: t5 + 0.35 },
  { label: "Edição com IA", value: "10 min", frac: 0.05, t: A("com inteligência", 2) },
], t5 + 0.25, { title: "Tempo para editar 1 vídeo", box: { x: 90, y: 590, w: 900 }, until: A("e eu vou falar") - 0.1 });

// 6) "Eu sou o cara mais cético até eu testar"
K.layout("full", A("e eu vou falar") - 0.1);
K.stamp("TESTADO ✓", A("testar"), { x: 560, y: CHEST, rot: -7, until: A("e aí depois") - 0.1 });

// 7) "depois que eu testei, eu personalizei e deixei ela do jeitinho que eu queria"
const t7 = A("e aí depois");
K.layout("split", t7);
K.stylePanel(t7 + 0.25, { title: "Depois que eu testei · personalizei", box: { x: 90, y: 400, w: 900, h: 570 }, preview: RAW[2], sample: "DO MEU JEITO",
  tFont: A("personalizei"), tColor: A("deixei"), tCap: A("jeitinho"), until: A("então o que você") - 0.15 });

// 8) "o que você está vendo aqui foi após a minha personalização" — padrão genérico × o estilo dele
K.versus({ img: RAW[3], label: "Padrão da IA", cap: "legenda padrão, sem motion" },
         { img: "assets/img/meu-estilo.jpg", label: "Com a minha personalização", t: A("minha personalização") },
         A("o que você está vendo aqui"), { box: { x: 90, y: 400, w: 900, h: 570 }, until: A("se você quer") - 0.2 });

// 9) "quer só mandar o vídeo para uma IA, baixar ele editado e postar no seu perfil"
const t9 = A("se você quer");
K.section({ kicker: "Se você quer editar assim", title: "Manda, baixa e posta", acc: [2, 3] }, t9 + 0.05, { until: A("e ter visualizações") - 0.2 });
K.flow([
  { label: "Enviar", sub: "vídeo bruto", icon: "send", t: A("mandar o vídeo") },
  { label: "IA edita", sub: "cortes + motion", icon: "wand", t: A("uma ia"), progress: 0.5 },
  { label: "Baixar", sub: "já editado", icon: "download", t: A("baixar ele") },
  { label: "Postar", sub: "no seu perfil", icon: "play", t: A("postar") },
], { box: { x: 90, y: 600, w: 900, h: 320 }, until: A("e ter visualizações") - 0.2 });

// 10) "ter visualizações como essas desses vídeos aqui que eu fiz" — mural com os vídeos dele
const tW = A("e ter visualizações");
K.wall(IMG, ["VÍDEOS QUE", "EU FIZ COM IA"], tW, A("que foram com") - tW, { size: 76 });

// 11) "comenta EU QUERO que eu mande o link no seu Direct"
K.pill("Feitos com IA", A("que foram com") + 0.15, { y: CHEST, up: true, icon: "spark", until: A("eu quero que") - 0.2 });
const t11 = A("eu quero que");
K.layout("split", t11 - 0.3);
K.comment({ user: "@voce", text: "EU QUERO" }, t11 - 0.1, { box: { x: 90, y: 400, w: 900 }, until: A("que a gente") - 0.15 });
K.dm({ name: "Direct", sub: "agora", text: "Aqui está o seu link 👇" }, A("mande o link") - 0.3, { box: { x: 90, y: 580, w: 900, h: 380 }, cps: 24, until: A("que a gente") - 0.15 });

// 12) "promoção de lançamento do nosso novo programa Edição Viral com o Claude"
K.layout("full", A("que a gente") - 0.1);
K.pill("Promoção de lançamento", A("promoção"), { y: CHEST, up: true, icon: "bolt", until: A("novo programa") });
const tL = A("edição viral");
K.takeover(tL - 0.15, tL + 1.6, 0.2);
K.hideMouth(tL - 0.15, tL + 1.6);
K.logo({ text: "Edição Viral", sub: "COM CLAUDE" }, tL - 0.1, 1.75, { size: 104, y: 800, h: 130 });

// 13) "baixar todos os materiais… ferramentas… computador… é bem simples a instalação"
const t13 = A("lá você vai") - 0.05;
K.layout("split", t13);
K.section({ kicker: "Tudo o que você precisa", title: "Bem simples de instalar", acc: [1, 2] }, t13 + 0.15, { until: A("e depois é só") - 0.2 });
K.terminal([
  { cmd: "baixar materiais", ok: "baixado", t: A("baixar todos") },
  { cmd: "instalar ferramentas", ok: "instalado", t: A("ferramentas") },
  { cmd: "preparar computador", ok: "pronto", t: A("computador") },
  { cmd: "conectar o Claude", ok: "conectado", t: A("executar") },
], t13 + 0.3, { box: { x: 90, y: 530, w: 900, h: 440 }, until: A("e depois é só") - 0.2 });

// 14) "é só mandar o seu vídeo bruto que ele vai te entregar um vídeo 100% editado"
K.layout("full", A("e depois é só") - 0.1);
const tB = A("vídeo bruto", 2) - 0.2;
K.beforeAfter(tB, A("entregar") - tB);
K.progress("Renderizando · 9:16 · 1080p", A("entregar"), 0.9, { box: { x: 140, y: CHEST, w: 800 }, until: A("a gente") + 0.1 });
K.flash(A("100") - 0.15, { peak: 0.45 });
K.punch(A("100") - 0.05, 1.2);
K.behindTitle(["100%"], A("100"), { size: 300, top: 420, until: A("então aproveita") });
K.punch(A("a gente", 2), 1.42);

// 15) "estamos lançando hoje, aproveita o desconto"
K.cta("Comenta EU QUERO", A("a gente", 2) + 0.2, { y: 1400, w: 800, clickAt: 1.4 });
K.kickerTop("Lançamento · desconto hoje", A("a gente", 2) + 0.4);

// legenda que segue a boca (depois dos layouts, para ler o enquadramento atual de cada quadro)
K.mouthCaps({ accent: ["IA", "inteligência", "bruto", "editado", "editou", "animações", "minutos", "horas", "cético", "personalizei", "Claude", "Viral", "desconto", "lançamento"] });

// barra "IA EDITANDO" — sempre por último (lê todas as edições acima)
K.live(tG, CFG.dur, { hide: [[tL - 0.15, tL + 1.6]] });
