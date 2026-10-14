# Measured Light

Registro claro, geometría limpia, **un objeto por cuadro**. El color no toca
nunca la tipografía: vive en los objetos, en el volumen y en la luz del fondo.

Este estilo no sale de una referencia visual: sale de **medir 40 piezas** contra
22 referencias reales. Cada regla de acá tiene un número detrás, y el
razonamiento completo está en
[`lecciones-medidas.md`](../../.claude/skills/hyperframes/references/lecciones-medidas.md).

## Paleta

| Rol | Valor | Nota |
|---|---|---|
| Papel | `#F3F4F9` | **Nunca blanco puro.** Un campo plano no da rango tonal y la medición se desploma. |
| Tinta | `#0A0A14` | Todo el texto. Negro sobre claro, siempre. |
| Acento | `#1D1DE8` | Sólo en objetos: rellenos, volúmenes, filos de luz, manchas del fondo. |

## Tipografía

Instrument Sans, 700 para display y 600 para cuerpo. El cuerpo **se mide contra
el ALTO** del formato, que es la dimensión escasa en apaisado:

    ancho ≈ nº_caracteres · k · cuerpo      k = 0,52 minúscula · 0,66 versalita
    debe entrar en  ANCHO − 244

## Motion

Entradas con `power2.out` de 0,5–0,7 s; golpes con `back.out(2.4)` de 0,5 s;
salidas más rápidas que las entradas. El plano se sostiene con **cámara
calculada**, no estimada: `recorrido_px / duración_s ≥ 60`.

El desenfoque de movimiento tampoco se estima:

    σ = (velocidad_px_por_segundo / fps) · 0,9 / 3

y va **sólo en el eje del movimiento**.

## Qué NO hacer

- **Texto de color.** Ni una palabra. Si algo necesita destacarse, se destaca el
  objeto que lo contiene.
- **Etiquetas en esquinas, corchetes, números de paso.** Un rótulo aclaratorio es
  síntoma de un cuadro sobrecargado: la solución es partir en dos escenas.
- **Blanco puro de fondo** ni manchas de alfa bajo: sin rango tonal el plano
  muere (medido: 61 % de cuadros quietos).
- **Manchas detrás de la banda de lectura.** Van a ~500 px de la línea.
- **Animar `height`, `width` o `margin`**: se clavan a píxel entero y tiemblan.
  Para cambiar la forma de una caja va `clip-path`.
