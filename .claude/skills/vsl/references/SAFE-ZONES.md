# Zona segura — vídeos verticais (1080×1920)

Vale para **todas** as skills do kit, atuais e futuras. Interface do Instagram/TikTok cobre o topo (nome do perfil,
áudio), a base (legenda do post, conta, botão seguir) e a coluna de botões à direita (curtir, comentar, enviar).

| Perfil | Quando | Área segura (todo texto, número, pílula, botão, card com texto) |
|---|---|---|
| `reels` (padrão) | Reels, Shorts, TikTok orgânicos | **x 90–990 · y 220–1520** e nada na coluna de botões (x > 940 **e** y > 1150) |
| `ads` | anúncio Meta (Reels ads) | **x 90–990 · y 270–1248** (Meta: 14 % topo, 35 % base) |

Regras:
- Laterais sempre ≥ 90 px (preferência do Oney — nada "encostando" nas bordas).
- Legenda nunca no rodapé: no meio ou na linha pescoço/gola, dentro da área.
- Apresentador em círculo (PIP): canto **inferior esquerdo** ou alto à direita — nunca no canto inferior direito.
- Pode sangrar para fora (marcar `data-safe="ignore"`): fundos, fotos/vídeos em tela cheia, letreiro que corre para
  fora de propósito, texto gigante decorativo atrás da cabeça que não precisa ser lido inteiro.
- Exceção aprovada: anúncios do Oney com legenda logo abaixo do queixo até y 1640 (`#cap` com
  `data-safe="caption"` + `--caption-bottom 1640`).

Verificação obrigatória antes do render final (o script percorre o vídeo inteiro, a cada 0,25 s):

```bash
node scripts/safe-zone-check.mjs video-projects/<slug>
node scripts/safe-zone-check.mjs video-projects/<slug> --profile ads --caption-bottom 1640
```

Corrija tudo o que aparecer (ou marque como exceção intencional) e rode de novo até sair "zona segura OK".
Projetos com sub-composições (`data-composition-src`): confira também com `npx hyperframes snapshot`.
