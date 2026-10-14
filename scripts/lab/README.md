# Herramientas de laboratorio

Siete herramientas construidas produciendo piezas contra referencias reales.
Cada una existe porque **algo se midió mal a ojo primero**. El razonamiento
completo está en
[`references/lecciones-medidas.md`](../../.claude/skills/hyperframes/references/lecciones-medidas.md).

## El orden en que se usan

```bash
npx hyperframes lint                      # el motor primero: 0 errores, 0 avisos
npx hyperframes render --workers 4
bash scripts/lab/fluidez.sh <render.mp4>  # ¿está vivo el plano?
bash scripts/lab/master.sh  <render.mp4>  # audio a -16 LUFS / -1.5 dBTP
bash scripts/lab/web.sh     <master.mp4>  # sólo si hay que subirlo
```

## Qué hace cada una

| Herramienta | Para qué | Lo que no es obvio |
|---|---|---|
| `fluidez.sh` | Mide cuadros quietos y movimiento medio. **Objetivo: <10% quietos.** | El grano infla la medición: hay que fijarlo antes de comparar piezas. No distingue movimiento de ruido. |
| `master.sh` | Audio a −16 LUFS con pico real bajo −1,4 dBTP. Dos pases de `loudnorm` más un limitador que **se verifica y se corrige solo**. | El encoder AAC reconstruye picos entre muestras: el límite no se adivina, se mide. Nunca silenciar stderr acá. |
| `sfx.sh` | Sintetiza la paleta de sonido: `aire`, `click`, `sub`, `cama`, `riser`. | El `riser` tiene el pico al final: es un sonido hecho para un corte en J. |
| `web.sh` | Busca el CRF más bajo que entre en el límite de subida, **copiando el audio ya masterizado**. | El render del motor sale a ~17 Mbps, mucho más de lo necesario. A crf 20 una pieza de 18 s queda en 13 MB, indistinguible. |
| `recorte.py` | Deja una foto de producto con esquinas redondeadas, borde suavizado y **alfa**. | Sin alfa no hay reflejo ni sombra que siga la silueta: la foto se lee como estampilla pegada. |
| `logos.mjs` | Baja logos de marca reales (Simple Icons) con su color oficial. | Las marcas que piden no ser usadas devuelven **404**, y eso hay que verlo, no tragárselo. Varias tienen color oficial negro: van sobre placa clara. |
| `getfont.mjs` | Descubre qué fuentes embebe el motor. | Son **18 familias**. Pedir otra no falla ruidosamente: cae al fallback y la pieza se ve distinta. |

## El método que funciona

1. **Estudiar la referencia cuadro a cuadro** antes de escribir nada.
2. **Construir**, con el estado inicial en CSS (nunca en el tween).
3. **A/B pareado por timestamp** contra el original: lo que delata la copia se ve
   ahí, no en el render suelto.
4. **Medir con `fluidez.sh`**, no opinar.
5. **Masterizar** y recién ahí mirar de nuevo.

**Y antes de creerle a una medición rara, verificar el instrumento.** Dos veces
un chequeo automático inventó problemas que no existían: un detector de costuras
que confundía la pendiente de un resplandor con un borde, y un `ffmpeg` con el
filtro puesto antes de la entrada que devolvía cero en todos los cuadros.
