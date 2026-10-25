# Remotion dentro do kit HyperFrames

Este projeto gera trechos animados em React (vinhetas, gráficos, legendas) que
entram como clipes normais num projeto HyperFrames. O HyperFrames continua
responsável pelo corte da fala e pela montagem final do Reel.

## Comandos

Preview ao vivo no Remotion Studio:

```bash
npm run dev
```

Render padrão (1080x1920, 30 fps, 4 s):

```bash
npx remotion render Vinheta out/vinheta.mp4
```

Render com textos e cores próprios (aspas simples por fora, JSON por dentro):

```bash
npx remotion render Vinheta out/vinheta-biolinka.mp4 --props='{"titulo":"Biolinka","subtitulo":"Seu link na bio, do seu jeito","tag":"@biolinka","corAcento":"#C8FF3D"}'
```

Props disponíveis em `src/Vinheta.tsx`: titulo, subtitulo, tag, corFundo,
corAcento, corTexto.

## Levar para o HyperFrames

1. Renderize o MP4 em `out/`.
2. Copie para `video-projects/<projeto>/assets/`.
3. Use como clipe de vídeo na composição HyperFrames, mudo, com áudio no mix
   por faixa irmã, como o kit já pede.

## Skills

As 12 skills oficiais do Remotion estão em `.claude/skills/remotion-*`.
Comece por `/remotion-best-practices`; para legendas por palavra use
`/remotion-captions`; para exportar, `/remotion-render`.
