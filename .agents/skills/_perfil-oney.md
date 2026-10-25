# Perfil do criador (lido por todas as skills /reel-oney, /reel-editorial-oney, /reel-explicativo-oney, /video-colagem-oney, /anuncios-oney)

Antes do primeiro vídeo, procure `perfil.json` na raiz do kit. Se não existir, pergunte ao aluno
UMA vez, numa mensagem só, e salve:

```json
{
  "nome": "Nome que aparece no perfil",
  "usuario": "arroba_sem_o_arroba",
  "nicho": "Ex.: Marketing Digital",
  "seguidores": "Ex.: 12,4 mil (como aparece no Instagram)",
  "pasta_prints": "C:\\Users\\<voce>\\Pictures\\Screenshots",
  "avatar": "caminho da foto de perfil (opcional)"
}
```

Use esses dados sempre que um template mostrar nome, @, avatar ou número de seguidores.
Nunca invente números, logos, capas ou prints. Se faltar algo, peça ao aluno o print exato.

## Look escolhido pelo aluno (Look builder)

Se existir `video-projects/<slug>/look.json` (gerado por `npm run look-builder`, em `tools/look-builder/`),
leia-o antes de qualquer decisão visual e honre as escolhas: `colours`, `fonts`, `hook`, `captions`,
`elements`, `motion`, `framing.headTop` / `framing.capTop`, `extras` (variações pedidas) e `notes`.
O campo `skill` diz qual skill o aluno espera; `conflicts` lista o que o look contraria no DESIGN.md
dessa skill — resolva isso com o aluno antes de montar (não ignore nem "corrija" em silêncio).
