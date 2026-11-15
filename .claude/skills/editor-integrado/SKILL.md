---
name: editor-integrado
description: Edita um Reel juntando TUDO de uma pasta de projeto - o vídeo gravado, o ROTEIRO.md (da skill roteiros), as imagens/B-rolls (gerados ou baixados) - e entrega o vídeo final usando um dos estilos do kit (reel-oney, reel-editorial-oney, reel-explicativo-oney, video-colagem-oney, anuncios-oney, vsl). Use quando a pessoa digitar /editor-integrado, passar uma pasta de reel ("edita a pasta meu-reel-01"), ou pedir "edita usando o roteiro e as imagens".
---

# Editor Integrado

Liga as três etapas num fluxo só: **roteiro → imagens → edição**. Esta skill não tem
estilo próprio. Ela prepara o projeto (lê roteiro, mapeia imagens, casa tudo com as falas
do vídeo) e então **executa o estilo escolhido** do kit, usando o que ela montou.

Entrada: `/editor-integrado meus-videos\<pasta-do-reel>` (ou o caminho de um vídeo; veja
"Sem pasta" abaixo). Opcional: o estilo (`oney`, `editorial`, `explicativo`, `colagem`, `anuncio`, `vsl`).

## Estrutura esperada da pasta do reel

```
meus-videos/<reel>/
  video.mp4          (ou qualquer .mp4/.mov: o vídeo gravado)
  ROTEIRO.md         (roteiro final; da skill roteiros ou get-brolls)
  imagens/           (prints, imagens geradas, B-rolls: .png .jpg .webp .mp4)
    SOURCES.md       (opcional: origem/legenda de cada arquivo)
```

Tudo é opcional menos o vídeo. Falta roteiro → edita só pela transcrição. Faltam imagens → só
usa os prints do `pasta_prints` do `perfil.json`, como a skill do estilo já faz.

## Regras que valem sempre

- Leia `../_perfil-oney.md` e `perfil.json` (crie perguntando UMA vez, se não existir).
- **Nunca invente** prints, números, logos, capas ou fontes. Imagem faltando → peça a exata.
- Imagem gerada por IA entra como ilustração, nunca como "prova" real (print, dado, notícia).
- Nunca publique nem envie nada. Entregue só os arquivos.
- Antes de cada passo lento, diga em uma linha curta em português o que está rodando.
- Tudo em português, hand-off curto.

## Fluxo

1. **Inventário da pasta.** Liste o conteúdo. Confirme em uma linha: vídeo, se achou
   `ROTEIRO.md`, quantas imagens e de que tipos. Se houver mais de um vídeo, pergunte qual.
2. **Estilo.** Se a pessoa não disse, escolha pelo roteiro/pedido e confirme em uma linha:
   - celular cru, prints em cima da cabeça → `reel-oney`
   - visual desenhado, serifada, cards → `reel-editorial-oney`
   - notícia/explicação com imagens reais em cima → `reel-explicativo-oney`
   - muito ilustrado, fotos recortadas → `video-colagem-oney`
   - anúncio com headline e esquemas → `anuncios-oney`
   - vídeo de venda → `vsl`
   Abra o `SKILL.md` do estilo escolhido e siga o fluxo dele a partir daqui.
3. **Ler o roteiro.** Extraia do `ROTEIRO.md`: a ordem das ideias, o gancho, e cada ponto em que
   o roteiro cita uma imagem, print, dado ou B-roll (procure marcações como `[imagem]`, `B-roll:`,
   `mostrar`, `print`, nomes de arquivo, ou linhas de storyboard).
4. **Mapa de imagens (`assets/plano.json`).** Para cada arquivo em `imagens/`, olhe a imagem
   (ou o `SOURCES.md`) e associe a uma frase do roteiro:
   ```json
   {"itens":[{"arquivo":"imagens/grafico.png","frase":"o número de casos dobrou","tipo":"ilustracao|prova|broll","obs":""}]}
   ```
   Associação duvidosa (imagem que serve a duas frases, ou nenhuma) → pergunte uma vez, numa
   mensagem só, com a lista. Imagem sem lugar no roteiro fica de fora e vai no hand-off.
5. **Scaffold e transcrição** do estilo (`new-reel.mjs`, `words.txt`, `keeps.json`, corte, re-transcrição).
   O roteiro ajuda a decidir qual take manter: fica o take mais próximo do roteiro e mais limpo.
6. **Casar falas e imagens.** Com a transcrição final, ache o tempo de cada `frase` do plano
   (`node <scripts-do-estilo>/anchors.mjs "frase" ...`). A frase falada pode diferir do roteiro:
   use a fala real do vídeo e registre no `plano.json` o tempo `t` de cada item.
   Cópia/recorte das imagens vai para `video-projects/<slug>/assets/` (log em `assets/prints/SOURCES.md`).
7. **Compor, checar e renderizar** seguindo o estilo: build, `npx hyperframes lint`, snapshots de
   cada mudança de overlay (olhe os PNGs: rosto nunca coberto, texto legível), e só então um
   render final em `video-projects/<slug>/renders/<slug>-final.mp4`.
8. **Hand-off** (curto): caminho do arquivo final, o que foi cortado, qual imagem entrou em qual
   frase, o que ficou de fora e por quê, e qualquer incerteza.

## Sem pasta

Se receber só o caminho de um vídeo: procure `ROTEIRO.md` e `imagens/` ao lado dele; se não
houver, avise em uma linha e siga só com a transcrição (equivale a rodar o estilo direto).

## Ajustes

Pedidos como "troca a imagem do minuto 0:20", "tira essa parte" ou "legenda mais baixa" se
resolvem editando o `plano.json`/template do projeto e renderizando de novo só uma vez.
