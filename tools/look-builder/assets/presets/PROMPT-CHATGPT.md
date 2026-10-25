# Miniaturas dos presets geradas no ChatGPT (opcional)

O Look builder desenha sozinho uma miniatura de cada preset (frame do seu clipe + gancho nas cores e fontes do
preset). Se você preferir uma ilustração gerada, cole o prompt abaixo no ChatGPT (projeto Salino), baixe a imagem
quadrada, corte em 3×3 e salve cada azulejo aqui com estes nomes (PNG ou JPG, qualquer tamanho, de preferência
quadrado):

```
celular.png  editorial.png  anuncio.png
colagem.png  explicativo.png  vsl-roxo.png
vsl-clean.png  aurora.png  vox.png
```

A interface detecta os arquivos ao carregar e usa-os no lugar da miniatura desenhada. Para cortar a grade com
ffmpeg (imagem 1024×1024 → 9 azulejos), na pasta onde salvou `grade.png`:

```bash
ffmpeg -i grade.png -vf "crop=iw/3:ih/3:0:0" celular.png
```

(e assim por diante, mudando `x:y` para `iw/3:0`, `2*iw/3:0`, `0:ih/3`, … na ordem acima).

## Prompt

Gere uma imagem quadrada 1:1: grade 3x3 de 9 azulejos iguais com margens pretas finas. Cada azulejo é um pôster
abstrato de um estilo de edição de Reels: sem rostos, sem pessoas, sem texto legível (tipografia só como blocos),
só cores, formas e textura. Ordem, da esquerda para a direita e de cima para baixo:

1. CELULAR: carvão quase preto, blocos de título brancos condensados, um bloco amarelo #ffd21f, um screenshot bruto de cantos retos sem sombra.
2. EDITORIAL: preto, traços de itálico serifado amarelo-manteiga #f4e27c sobre linhas brancas minúsculas, card arredondado com sombra suave.
3. ANÚNCIO: escuro com scrim, barra de título branca e amarela, painel de esquema com nó redondo laranja #d97757, setas tracejadas com ponto amarelo, círculos verde e vermelho.
4. COLAGEM: papel off-white com vinheta, silhuetas recortadas em P&B com contorno branco, carimbo carmim #9e1b2c inclinado, arcos azuis #5b7cff com brilho, fita adesiva.
5. EXPLICATIVO: faixa 16:9 cinza no topo, caixa marinho #0f1a24 opaca embaixo, plano branco com diagrama de linhas finas e um único acento verde #1f7a63.
6. VSL ROXO: violeta profundo #1f123d, pílulas com gradiente roxo #8b5cf6 e glow, cards de vidro fosco, letras largas de display abstratas em lavanda.
7. VSL CLEAN: branco, painel branco com borda azul-clara #EAF3FF e sombra suave, acento azul #4A90E2, dois pontos coloridos tipo emoji.
8. AURORA GLASS: quase preto frio #0A0E14 com aurora azul #37BDF8 subindo do rodapé, card de vidro fosco com borda-fio, grade de pontos fraca.
9. VOX PAPEL: papel quente #efe9dc, recorte de gravura antiga em meio-tom, forma azul #37BDF8 grande, seta vermelha #e23b2e desenhada à mão.

Estilo geral: design gráfico plano e premium, iluminação uniforme, alta nitidez, cada azulejo com identidade bem distinta.
