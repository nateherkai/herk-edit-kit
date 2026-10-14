# Lecciones medidas

Lo aprendido produciendo **50 piezas** contra 23 referencias de motion graphics
reales (recolectadas aparte; el repo no las incluye), **midiendo cada afirmación
en vez de estimarla** — y contra las skills que el propio motor publica.

**Cuando algo de acá contradiga al resto del skill, gana esto: está medido.**

Noventa y tres lecciones agrupadas por el momento en que hacen falta. Si vas a empezar
una pieza, el orden útil es: *El motor* → *Fluidez* → *Composición* → *Color*.
Las de *Objetos y técnicas* son un catálogo para consultar cuando hace falta una.

## Índice

**El motor: trampas de la captura por seek**
- [`immediateRender` muerde en las dos direcciones](#immediaterender-muerde-en-las-dos-direcciones)
- [Un fundido que termina en el límite de un clip necesita un `tl.set` duro](#un-fundido-que-termina-en-el-límite-de-un-clip-necesita-un-tlset-duro)
- [El estado inicial va en CSS, no metido en el tween largo](#el-estado-inicial-va-en-css-no-metido-en-el-tween-largo)
- [🆕 Una salida que termina en el borde del siguiente clip necesita `tl.set`](#una-salida-que-termina-en-el-borde-del-siguiente-clip-necesita-tlset)
- [🚨 `clip-path` recorta en vertical también](#clip-path-recorta-en-vertical-también)
- [🚨 Animar la forma de una caja: `clip-path`, nunca `height`/`margin`](#animar-la-forma-de-una-caja-clip-path-nunca-heightmargin)

**Fluidez: qué hace que un plano esté vivo**
- [Dos tweens sobre la misma propiedad: el que termina después gana](#dos-tweens-sobre-la-misma-propiedad-el-que-termina-después-gana)
- [Umbral de percepción](#umbral-de-percepción)
- [Medir la fluidez, no opinarla](#medir-la-fluidez-no-opinarla)
- [El desenfoque se come el movimiento](#el-desenfoque-se-come-el-movimiento)
- [Un objeto chico no sostiene la fluidez: la sostiene la cámara](#un-objeto-chico-no-sostiene-la-fluidez-la-sostiene-la-cámara)
- [Girar rinde más que desplazar](#girar-rinde-más-que-desplazar)
- [La cuenta que hay que hacer ANTES de renderizar](#la-cuenta-que-hay-que-hacer-antes-de-renderizar)
- [Muchos objetos chicos reemplazan a la cámara](#muchos-objetos-chicos-reemplazan-a-la-cámara)
- [Cuando la cámara no puede escalar, todo el sostén va en la traslación](#cuando-la-cámara-no-puede-escalar-todo-el-sostén-va-en-la-traslación)
- [Cuando el contenido se traslada solo, la cámara pasa a segundo plano](#cuando-el-contenido-se-traslada-solo-la-cámara-pasa-a-segundo-plano)
- [🆕 🚨 Un tipeo no sostiene un plano](#un-tipeo-no-sostiene-un-plano)
- [🚨 El grano infla la medición de fluidez](#el-grano-infla-la-medición-de-fluidez)

**Composición y texto**
- [Tiempo de lectura](#tiempo-de-lectura)
- [Copiar antes que inventar](#copiar-antes-que-inventar)
- [Revelar texto: por letra, y construir apilando](#revelar-texto-por-letra-y-construir-apilando)
- [🆕 Tipeo: las dos recetas sirven, y se diferencian en el CURSOR](#tipeo-las-dos-recetas-sirven-y-se-diferencian-en-el-cursor)
- [Hacer que el color "viaje" entre objetos](#hacer-que-el-color-viaje-entre-objetos)
- [Una fila de píldoras se sale del cuadro antes de lo que parece](#una-fila-de-píldoras-se-sale-del-cuadro-antes-de-lo-que-parece)
- [El texto no va encima del objeto](#el-texto-no-va-encima-del-objeto)
- [Construir una frase en horizontal sin medir y sin descentrar](#construir-una-frase-en-horizontal-sin-medir-y-sin-descentrar)
- [Las unidades van debajo del número, nunca al lado](#las-unidades-van-debajo-del-número-nunca-al-lado)
- [`backdrop-filter` sirve, con una condición de contexto](#backdrop-filter-sirve-con-una-condición-de-contexto)
- [La profundidad la termina de contar la oclusión](#la-profundidad-la-termina-de-contar-la-oclusión)
- [Las etiquetas en esquina son síntoma de un cuadro sobrecargado](#las-etiquetas-en-esquina-son-síntoma-de-un-cuadro-sobrecargado)
- [Oclusión sobre texto: al pie, no al centro](#oclusión-sobre-texto-al-pie-no-al-centro)
- [El apaisado no es el vertical rotado: el cuerpo se mide contra el ALTO](#el-apaisado-no-es-el-vertical-rotado-el-cuerpo-se-mide-contra-el-alto)
- [El rótulo de unidad va arriba del número](#el-rótulo-de-unidad-va-arriba-del-número)
- [Portar entre formatos: recalcular el cuerpo, no reencuadrar](#portar-entre-formatos-recalcular-el-cuerpo-no-reencuadrar)
- [Cada rótulo se centra sobre su objeto](#cada-rótulo-se-centra-sobre-su-objeto)
- [Los números de una degradación de jerarquía no se portan entre formatos](#los-números-de-una-degradación-de-jerarquía-no-se-portan-entre-formatos)
- [Alinear carteles sin transcripción](#alinear-carteles-sin-transcripción)

**Color, luz y fondo**
- [En registro claro, el BLANCO es el material principal](#en-registro-claro-el-blanco-es-el-material-principal)
- [Logos de marca reales](#logos-de-marca-reales)
- [Perspectiva: el gradiente de velocidad que ningún easing produce](#perspectiva-el-gradiente-de-velocidad-que-ningún-easing-produce)
- [El fondo claro necesita estructura tonal, igual que el oscuro](#el-fondo-claro-necesita-estructura-tonal-igual-que-el-oscuro)
- [Gradientes: no se interpolan, se apilan](#gradientes-no-se-interpolan-se-apilan)
- [🚨 El borde de una capa desplazada entra al cuadro](#el-borde-de-una-capa-desplazada-entra-al-cuadro)
- [Arcos de luz: gradiente cónico recortado con `mask`](#arcos-de-luz-gradiente-cónico-recortado-con-mask)
- [🚨 El `at X% Y%` de un gradiente es relativo a la caja, no al cuadro](#el-at-x-y-de-un-gradiente-es-relativo-a-la-caja-no-al-cuadro)
- [En registro claro, las manchas van fuera de la banda de lectura](#en-registro-claro-las-manchas-van-fuera-de-la-banda-de-lectura)
- [Logos de marca: placa clara detrás](#logos-de-marca-placa-clara-detrás)

**Objetos y técnicas**
- [Y no alcanza con moverse: hace falta TEXTURA contra la cual verlo](#y-no-alcanza-con-moverse-hace-falta-textura-contra-la-cual-verlo)
- [El bokeh son círculos, no un lavado](#el-bokeh-son-círculos-no-un-lavado)
- [Composición radial: una línea de CSS por elemento](#composición-radial-una-línea-de-css-por-elemento)
- [Cintas de luz: el reflejo va asimétrico](#cintas-de-luz-el-reflejo-va-asimétrico)
- [Resaltador de marcador](#resaltador-de-marcador)
- [Trazos a mano: `stroke-dashoffset`, y con pocas curvas](#trazos-a-mano-stroke-dashoffset-y-con-pocas-curvas)
- [Números que cuentan: trasladar, no escribir](#números-que-cuentan-trasladar-no-escribir)
- [Un punto que recorre una curva: guion de largo cero, no trigonometría](#un-punto-que-recorre-una-curva-guion-de-largo-cero-no-trigonometría)
- [La profundidad de un abanico es `z-index`, no orden del DOM](#la-profundidad-de-un-abanico-es-z-index-no-orden-del-dom)
- [Formas orgánicas: el filtro pegajoso, y el paso que hay que borrar](#formas-orgánicas-el-filtro-pegajoso-y-el-paso-que-hay-que-borrar)
- [Volumen de texto: copias apiladas, no 3D](#volumen-de-texto-copias-apiladas-no-3d)
- [Campos de partículas: PRNG sembrado en el generador, no en el documento](#campos-de-partículas-prng-sembrado-en-el-generador-no-en-el-documento)
- [Contorno iluminado: se gira el contenido, nunca el recorte](#contorno-iluminado-se-gira-el-contenido-nunca-el-recorte)
- [Esqueleto de carga: el brillo va dentro de la barra](#esqueleto-de-carga-el-brillo-va-dentro-de-la-barra)
- [Comparación con barrido: recorte y filo, el mismo número](#comparación-con-barrido-recorte-y-filo-el-mismo-número)
- [🆕 Del prompt al SVG: cuando el material es vectorial, cada trazo es un objeto](#del-prompt-al-svg-cuando-el-material-es-vectorial-cada-trazo-es-un-objeto)
- [🆕 `pathLength="1"`: un solo corrimiento para trazos que se llevan 59 a 1](#pathlength1-un-solo-corrimiento-para-trazos-que-se-llevan-59-a-1)
- [🆕 🚨 `vector-effect: non-scaling-stroke` y `pathLength` no conviven](#vector-effect-non-scaling-stroke-y-pathlength-no-conviven)
- [🆕 🚨 En SVG, GSAP no usa `transform-origin`: el pivote va en `svgOrigin`](#en-svg-gsap-no-usa-transform-origin-el-pivote-va-en-svgorigin)
- [🆕 🚨 `transform-box: view-box` mide desde la esquina del `viewBox`](#transform-box-view-box-mide-desde-la-esquina-del-viewbox)
- [Fotos: el travelling va en la imagen, no en el marco](#fotos-el-travelling-va-en-la-imagen-no-en-el-marco)
- [Los silencios de la locución son los puntos de corte](#los-silencios-de-la-locución-son-los-puntos-de-corte)

**Movimiento: curvas, barrido y ritmo**
- [🔄 El obturador SÍ existe: `npx hyperframes add motion-blur`](#el-obturador-sí-existe-npx-hyperframes-add-motion-blur)
- [Para que algo viaje sobre su propio eje, la rotación va en el envoltorio](#para-que-algo-viaje-sobre-su-propio-eje-la-rotación-va-en-el-envoltorio)
- [Un elemento rotado se mide contra la DIAGONAL](#un-elemento-rotado-se-mide-contra-la-diagonal)
- [Varias escenas: se anima el contenedor, y el fondo no corta](#varias-escenas-se-anima-el-contenedor-y-el-fondo-no-corta)
- [🔑 El motion blur se calcula, no se estima](#el-motion-blur-se-calcula-no-se-estima)
- [🆕 El barrido de un zoom es RADIAL, y vive en espacio de pantalla](#el-barrido-de-un-zoom-es-radial-y-vive-en-espacio-de-pantalla)
- [🆕 En un zoom vectorial el trazo se multiplica por la escala](#en-un-zoom-vectorial-el-trazo-se-multiplica-por-la-escala)
- [🆕 🚨 La cola de un `power2.inOut` mata el cuadro](#la-cola-de-un-power2inout-mata-el-cuadro)
- [Una raya corta con barrido fuerte se borra](#una-raya-corta-con-barrido-fuerte-se-borra)
- [Movimiento reactivo al audio: un valor por cuadro](#movimiento-reactivo-al-audio-un-valor-por-cuadro)

**Entrega y formatos**
- [🆕 Una composición, N videos: `--variables` y `--batch`](#una-composición-n-videos---variables-y---batch)
- [🆕 Las salidas que no son MP4](#las-salidas-que-no-son-mp4)
- [Entrega: el render del motor es mucho más pesado de lo necesario](#entrega-el-render-del-motor-es-mucho-más-pesado-de-lo-necesario)
- [Zona segura de Instagram, verificada](#zona-segura-de-instagram-verificada)

**Método e instrumentos**
- [🆕 🚨 El motor se mueve todos los días: mirar la versión antes de creerle a esta hoja](#el-motor-se-mueve-todos-los-días-mirar-la-versión-antes-de-creerle-a-esta-hoja)
- [🚨 Los valores relativos (`+=`, `-=`) rompen bajo render en paralelo](#los-valores-relativos--rompen-bajo-render-en-paralelo)
- [Y un límite del propio motor](#y-un-límite-del-propio-motor)
- [Mirar a resolución completa, no en miniaturas](#mirar-a-resolución-completa-no-en-miniaturas)
- [⭐ El A/B pareado por timestamp](#el-ab-pareado-por-timestamp)
- [Un recorrido circular se cronometra con la geometría, no con el ojo](#un-recorrido-circular-se-cronometra-con-la-geometría-no-con-el-ojo)
- [Un chequeo automático que no modela el tamaño del efecto inventa problemas](#un-chequeo-automático-que-no-modela-el-tamaño-del-efecto-inventa-problemas)
- [🚨 El color de una marca se mide del archivo, no se lee de una descripción](#el-color-de-una-marca-se-mide-del-archivo-no-se-lee-de-una-descripción)
- [Un instrumento que devuelve un cero parejo está roto él](#un-instrumento-que-devuelve-un-cero-parejo-está-roto-él)
- [TTS local: el bloqueo suele ser la versión de Python](#tts-local-el-bloqueo-suele-ser-la-versión-de-python)


---

## El motor: trampas de la captura por seek

### `immediateRender` muerde en las dos direcciones
| | Qué muestra el elemento ANTES de que arranque su tween |
| --- | --- |
| `from()` / `fromTo()` con el default (`true`) | su estado **inicial**, desde el cuadro 0 |
| `fromTo(..., {immediateRender:false})` | su estado **FINAL**, desde el cuadro 0 |

Con `immediateRender:false` el elemento **tiene que nacer invisible** (`opacity:0`
en el CSS o en el `gsap.set` de carga). No es algo para recordar en cada tween:
va una vez a la hoja de estilos.

*Costó tres apariciones del mismo bug: tarjetas ya puestas en el cuadro 0, un
puntero visible desde el principio, un botón que se veía antes de existir.*

### Un fundido que termina en el límite de un clip necesita un `tl.set` duro
El lint lo llama `gsap_exit_missing_hard_kill`. Al saltar de cuadro, el motor
puede caer después del fundido y dejar visibilidad obsoleta.

### El estado inicial va en CSS, no metido en el tween largo

Meter `opacity` y `scale` en el mismo `fromTo` que una rotación de 8,5 s hace que
ese tween pise a todos los demás que tocan esas propiedades —seis advertencias de
superposición de una sola vez—. `opacity:0` en CSS, un `fromTo` corto para
entrar, y otro aparte para el golpe.

### 🆕 Una salida que termina en el borde del siguiente clip necesita `tl.set`

    ✗ gsap_exit_missing_hard_kill: … ends at the clip start boundary without a
      matching tl.set hard kill.

La captura por seek puede caer justo después del fundido y quedarse con el estado
viejo. El remedio es un corte duro explícito:

    tl.to ('.l0', {opacity:0, …, duration:.26}, t + .42);
    tl.set('.l0', {opacity:0},                  t + .69);

En una secuencia de reemplazos, verificar además con la aritmética que
**`entrada_fin ≤ salida_inicio`** del mismo elemento: es fácil que el paso entre
elementos parezca suficiente y se pisen por centésimas.

### 🚨 `clip-path` recorta en vertical también

`inset(0 0% 0 0)` no recorta a los lados, pero **el borde de la caja sigue
recortando arriba y abajo**. Un elemento que cae por debajo de la caja recortada
desaparece. El arreglo es agrandar la caja, no mover el elemento.

### 🚨 Animar la forma de una caja: `clip-path`, nunca `height`/`margin`

    ✗ gsap_non_transform_motion: … snaps to integer device pixels: marginTop.

Las propiedades de **layout** se redondean a píxel entero durante el cálculo de la
página: un movimiento lento o la cola de un ease-out **tartamudea** bajo la
captura por seek. Cuando lo que tiene que cambiar es la **forma** (no la posición,
que sería un transform), va `clip-path: inset(… round R)`, que es de pintado y
admite subpíxel.


---

## Fluidez: qué hace que un plano esté vivo

### Dos tweens sobre la misma propiedad: el que termina después gana
Cuando algo "no obedece", **buscar el otro tween que lo está pisando** antes de
tocar el valor. El lint avisa (`overlapping_gsap_tweens`) y hay que hacerle caso.

---

## 2 · La cámara

**Medido sobre la referencia albus**, cuánto del ancho del cuadro ocupa el objeto:

| tiempo | ancho |
| --- | --- |
| 0.0 s | **13 %** |
| 1.3 s | 40 % |
| 2.3 s | 62 % |
| 3.8 s | **88 %** |

**Es un travelling de 6.8× y ocupa el acto entero.** Un empuje de `1.0 → 1.15`
no es una cámara: es una imagen fija. Y el crecimiento va **cargado adelante**
(`power1.out`), no lineal.

🔑 **El error de fondo es construir el objeto a escala web.** Con una cápsula de
760 px en un cuadro de 1920, por más que se empuje nunca llena el cuadro. Se
construye el objeto **grande** (1560 px) y se lo arranca al 13 % de escala.

### Umbral de percepción
Una cámara necesita **≥1 px de desplazamiento aparente por cuadro** para que el
ojo la registre, y 2-3 px para que se sienta viva. Un giro de 12° en 5 s son
0.04° por cuadro: invisible.

### Medir la fluidez, no opinarla
`scripts/lab/fluidez.sh` compara cada cuadro con el anterior y dibuja el perfil.
**Objetivo: menos del 10 % de cuadros quietos.** El movimiento medio hay que
leerlo contra la familia de la pieza — una pieza minimalista sobre negro nunca va
a marcar como una pila de paneles iluminados. Calibración: las referencias del
board miden **3.06 de mediana**; las dos minimalistas miden 0.16 y 0.17.

### El desenfoque se come el movimiento

Medido en lab-15: cuatro manchas de color viajando **300 px en 8 s bajo
`blur(46px)`** dan **0,22 de movimiento y 84 % de cuadros quietos**. El blur
promedia el contraste hasta que no queda borde que medir, así que un objeto
desenfocado tiene que moverse **mucho más** que uno nítido para leerse igual.

- El umbral de 1 px/cuadro se traduce, a 60 fps, en **≥ 60 px/s**.
- 300 px en 8 s son 37 px/s: **por debajo del umbral**, aunque en el navegador
  "se vea moverse".
- Bajar a `blur(30px)` y triplicar el recorrido llevó la medición a 0,36 · 57 %.

### Un objeto chico no sostiene la fluidez: la sostiene la cámara

En la misma pieza, la cápsula ocupaba el **12 % del cuadro**. Arreglar el
líquido adentro no alcanzó — el otro 88 % seguía quieto. Lo que llevó de
**57 % a 0 % de cuadros quietos** fue:

1. envolver **todo** en un `.cam` y empujarlo (`scale 1 → 1.085` más 34 px de
   deriva en 8 s),
2. subir el resplandor de fondo de `opacity .5` a `.85`,
3. subir el grano de `.06` a `.14`.

**La cámara desplaza cada píxel del cuadro; el objeto desplaza sólo los suyos.**
Cuando la medición da quietos y el objeto ya se mueve bien, el problema no es
el objeto: es que no hay cámara.

### Girar rinde más que desplazar

Medido en lab-16: bajar el `rotationY` de sostén de 17° a 8° llevó los cuadros
quietos de 11 % a **31 %**. Convertirlo en barrido `yoyo` de ±11° —el mismo rango
visual, el doble de recorrido— los dejó en **2 %**. Cuando hay que sostener un
plano largo sin agregar objetos, una rotación 3D compra más movimiento por grado
de cambio visual que una traslación.

### La cuenta que hay que hacer ANTES de renderizar

Toda cámara de sostén se calcula, no se estima:

    recorrido_px / duración_s  ≥  60

Cometí este error dos veces en la misma sesión (lab-15 y lab-16): cámaras de
9 px/s que en el navegador "se ven moverse" y en la medición son cuadros muertos.

### Muchos objetos chicos reemplazan a la cámara

26 hojas girando con un solo `rotation` en el contenedor dieron **1 % de cuadros
quietos sin ninguna otra cámara de sostén**. Ninguna hoja sola llega al umbral de
60 px/s, pero entre todas cubren el cuadro. Cuando la pieza tiene un campo de
objetos, el sostén ya está; la cuenta de px/s es para cuando hay uno solo.

### Cuando la cámara no puede escalar, todo el sostén va en la traslación

Escalar la cámara sobre una línea de texto ancha la empuja fuera de los márgenes.
En ese caso la escala se deja en ~1,04 y los 60 px/s se consiguen **sólo con
traslación**: 520 px en 8,5 s. Fue lo que llevó una pieza clara de 26 % a 7 % de
cuadros quietos.

### Cuando el contenido se traslada solo, la cámara pasa a segundo plano

La pieza del odómetro mide **2,19 de movimiento y 0 % de cuadros quietos** sin
forzar nada: dos columnas de dígitos recorren cientos de px/s por sí solas. **La
cuenta de 60 px/s es para piezas donde nada se mueve solo** — no es un impuesto
que haya que pagar siempre.

### 🚨 Un tipeo no sostiene un plano

Un carácter de 40 px pinta del orden de **300 píxeles oscuros sobre 2.073.600**:
0,015 % del cuadro. En el primer render del lab-40 los **primeros 4,2 s** —el
prompt escribiéndose— dieron `·` en los siete cubos seguidos: movimiento medio
por debajo de 0,35 sobre 255. Un cuadro muerto de punta a punta, y con la
composición "funcionando".

Lo que lo salvó no fue la cámara: **la cámara sobre un cuadro vacío tampoco
mueve nada** —escalar un `div` blanco de 1,30 a 1,00 midió cero igual—. Lo que
lo salvó fue **poner algo que cruce**: una banda de luz suave barriendo el papel
2.720 px en 2,60 s, 1.046 px/s. De **39 % a 13 %** de cuadros quietos, con tres
cambios: la luz que barre, el dibujo entrando con masa antes (el moleteado son
113 trazos de golpe), y el prompt acortado de 32 a 26 caracteres.

**Regla: un plano cuyo único contenido es texto apareciendo está muerto. Necesita
un elemento que atraviese el cuadro, no una cámara.**

### 🚨 El grano infla la medición de fluidez

`feTurbulence` da ruido independiente por canal (lo que lo vuelve monocromo es la
opacidad baja). Subido a .30 para lograr el moteado de colores, la medición saltó
a **5,72** —más que cualquier referencia— con el archivo en 26 MB. **No era
movimiento, era ruido.** A .19 cae a 3,14, el valor real.

**El medidor no distingue movimiento de grano: hay que fijar el grano antes de
leer la medición, y no comparar piezas con granos distintos.**


---

## Composición y texto

### Tiempo de lectura
**17 caracteres por segundo, contados DESPUÉS de que el texto está completo.**
23 caracteres necesitan 1.35 s de permanencia.

⚠️ Y dar tiempo de lectura **sube los cuadros muertos**: un texto que se queda es
un cuadro que no cambia. La salida no es acortar el hold sino **sostenerlo con la
cámara** — el texto sigue acercándose mientras se lee.

---

## 7 · Audio

- **El sonido va en el PICO de la animación, no en el corte.** Y el pico no está
  al principio del archivo: el whoosh mediano de biblioteca lo tiene a 200 ms del
  inicio, así que hay que adelantar el arranque por ese offset. Sintetizar los
  sonidos resuelve el problema de raíz: el pico queda donde uno lo pone
  (`scripts/lab/sfx.sh`).
- **Dos o tres golpes en toda la pieza, nunca uno por corte.**
- **J-cut: 2.00 s de adelanto.** El sonido del acto siguiente entra dos segundos
  antes que su imagen.
- **El limitador no existe dentro de HyperFrames:** va en un pase de masterizado
  que **copia el video** (`-c:v copy`) y sólo re-encodea el audio.
- **−14 LUFS es para contenido denso.** Una pieza con tres acentos sobre silencio
  necesita **−16**, o el normalizador comprime tanto que los golpes se comen todo.
- 🚨 **`loudnorm` controla el pico de MUESTRA; el encoder AAC reconstruye picos
  ENTRE muestras y se pasa** (~1.6 dB, y depende del contenido). Hace falta un
  `alimiter` después, **verificando** el resultado: `scripts/lab/master.sh` baja el
  límite solo hasta cumplir.

---

## 8 · Método

### Copiar antes que inventar
Copiar una referencia 1:1 enseña más rápido que diseñar de cero, porque obliga a
notar decisiones que uno nunca se habría animado a tomar — un travelling de 6.8×,
un borde de 7 px, un color que sube hasta invertir el texto.

---

## 9 · Errores propios que cuestan renders

- **`open(p,'w')` trunca antes de escribir.** Una escritura que falla deja el
  archivo vacío. Escribir a `.tmp` y `os.replace()`.
- **Nunca silenciar `stderr` en una herramienta.** Un `2>/dev/null` hizo que
  `master.sh` escribiera un archivo de 0 bytes sin avisar.
- **zsh se come `:l` después de una variable** (`$LIM:level` → `0.9evel`): es su
  modificador de minúsculas. Usar `${LIM}:level`.
- **Verificar que el elemento existe** (`grep -c`) antes de culpar a la animación.
  Un `<div>` que nunca se insertó se ve exactamente igual que un tween roto.
- **Borrar un elemento sin borrar su JS mata la timeline entera.** Síntoma:
  archivo minúsculo, render lentísimo, todos los cuadros idénticos.

### Revelar texto: por letra, y construir apilando

- El "descifrado" de letras de las referencias es un **stagger de `blur`**:
  cada glifo en su span, `blur(22px) → 0` con `stagger: .052` y `y: 44 → 0`.
  Nunca `letter-spacing` — reflowea, tiembla bajo la captura por seek y el lint
  lo rechaza.
- **Construir una frase palabra por palabra en horizontal deja descentrados
  todos los pasos intermedios.** Corregirlo exige medir el texto, que falla
  antes de `document.fonts.ready`. Apilar —una palabra o frase por renglón—
  centra solo, no requiere medición y no se puede romper.
- `white-space: nowrap` en el contenedor: sin eso la última palabra puede
  provocar un salto de renglón a mitad de la construcción, y el reflow se ve.

### Tipeo: las dos recetas sirven, y se diferencian en el CURSOR

Hay dos formas, y **las dos sobreviven a la captura por seek** — medido con un
A/B pareado renderizado a 4 workers, donde cada worker arranca en mitad de la
línea de tiempo:

- **`tl.call()` + `textContent`** (la receta de `skills/hyperframes-animation`
  río arriba). Funciona. Y como el texto crece de verdad, **un cursor en línea
  viaja gratis**, sin calcular nada.
- **Un `<span>` por carácter revelado con `tl.set`**. También funciona, y es la
  única que permite animar cada glifo por separado.

🚨 **La diferencia está en el cursor, y es la que sorprende.** Con la segunda,
los caracteres invisibles **siguen ocupando su lugar**: un cursor en línea se
para después de la palabra completa desde el cuadro cero, no donde va el tipeo.
Medido, se ve clavado a media línea de distancia del texto. Por eso, si se
revela por spans, la posición del cursor **se lee del layout**:

```js
linea.innerHTML = [...FRASE].map(c => `<span>${c === ' ' ? '&nbsp;' : c}</span>`).join('');
const bordes = [...linea.children].map(s => s.offsetLeft + s.offsetWidth);
letras.forEach((_, i) => {
  const t = T0 + (i + 1) / 17;                      // 17 caracteres por segundo
  tl.set('.linea span:nth-child(' + (i + 1) + ')', {opacity: 1}, t);
  tl.set('.cur', {x: bordes[i]}, t);
});
```

Se puede leer `offsetLeft` en la construcción de la línea de tiempo porque **el
compilador embebe la fuente y ya está resuelta al cargar**: es sincrónico y
determinista. Estimar el ancho por carácter falla con cualquier tipografía que
no sea monoespaciada, y falla distinto en cada palabra.

⚠️ **Y la trampa que costó un render:** si el contenedor de los spans es él
mismo un `<span>`, una regla como `.caja span {opacity: 0}` lo apaga *a él*, y
la opacidad de un padre no se recupera desde el hijo. El tipeo no aparece nunca.
Scopear la regla al hijo directo, o usar un `div` de contenedor.

**Y el techo de 17 caracteres por segundo también vale acá.** 26 caracteres son
1,53 s; 32 son 1,88 s. Es la diferencia entre una apertura que respira y una que
se hace larga — en el lab-40 acortar la frase fue parte de lo que arregló la
fluidez.

### Hacer que el color "viaje" entre objetos

Cada objeto **llega encendido y se apaga cuando llega el siguiente**. El color
nunca salta: siempre está en el recién llegado. Es más barato y se lee mejor que
mover un resaltado de un objeto a otro.

Para cerrar con un objeto solo y centrado, dejar al sobreviviente **solo en su
fila**: queda centrado sin medir nada y basta subir el racimo
`(alto_racimo − alto_fila)/2`.

### Una fila de píldoras se sale del cuadro antes de lo que parece

A 74 px de cuerpo con 64 px de padding lateral, tres píldoras de 5–7 caracteres
suman 1156 px sobre un lienzo de 1080. El chequeo es aritmético, no visual:

    Σ(chars · 0,54 · cuerpo + 2 · padding) + gaps  ≤  1080 − 244

(244 = los 122 px de margen por lado que pidió Thiago.)

### El texto no va encima del objeto

Poner la línea en el centro de un objeto con textura (un anillo, una tarjeta con
gradiente) obliga a taparla con `text-shadow` y aun así se lee peor. **Objeto
arriba, línea abajo, los dos centrados y sin tocarse.** El hueco de un anillo
casi nunca es más ancho que la frase que se le quiere meter adentro.

### Construir una frase en horizontal sin medir y sin descentrar

Es la solución al problema que antes obligaba a apilar:

    .w  { display:inline-block; overflow:hidden; max-width:0; vertical-align:top }
    .in { display:inline-block; white-space:nowrap }

    tl.fromTo('.w'+i, {maxWidth:'0px'}, {maxWidth:'720px', duration:.46}, t);

El navegador **recorta `max-width` al ancho real de la palabra**, así que basta
un techo mayor que cualquier palabra: la palabra se desenrolla y la línea
(`text-align:center`) **se recentra sola en cada cuadro**. Sin medir una letra,
sin `document.fonts.ready`, y centrada en todos los pasos intermedios.

### Las unidades van debajo del número, nunca al lado

Posicionar la unidad en absoluto junto al número la monta encima. Metida dentro
del contenedor del medidor, debajo, se centra sola y cualquier degradación de
jerarquía la arrastra sin un tween aparte.

### `backdrop-filter` sirve, con una condición de contexto

    backdrop-filter: blur(17px) saturate(150%);

Renderiza bien en la captura y desenfoca lo pintado detrás. **La condición:** el
grupo lleva **una sola** transformación 3D y los hijos son planos ordenados con
`z-index`. Con `preserve-3d` cada hijo arma su propio contexto de apilamiento, el
`backdrop-filter` deja de ver a sus hermanos y el vidrio sale liso.

La placa además tiene que **teñir de verdad** (alfa ~.45, no ~.30): con poco tinte
se lee como un vidrio apoyado sobre lo que hay detrás en vez de como un objeto
propio. Lo que se ve a través tiene que ser textura, no el sujeto.

### La profundidad la termina de contar la oclusión

Un objeto extruido solo sigue leyéndose como un dibujo. Lo que lo mete en el
espacio es **algo que le pasa por delante y le tapa un pedazo**. Es el recurso de
composición más barato que hay.

⚠️ Tiene que **cruzar, no tapar**: el objeto de adelante va sobre el **centro
óptico** del de atrás, no sobre su borde. Con un texto grande ese centro está muy
por debajo del `top` del contenedor, porque el texto baja desde ahí.

### Las etiquetas en esquina son síntoma de un cuadro sobrecargado

Al rehacer una pieza vieja apareció claro: el rótulo de esquina y la lista de
datos existían **para compensar que un solo plano intentaba contar cuatro cosas**
(promesa + botón + prueba + marca). Partido en tres escenas con un pase entre
cada una, cada beat se queda con una sola cosa y **la etiqueta deja de hacer
falta**. Cuando aparezcan ganas de poner un rótulo aclaratorio, el problema casi
nunca es que falte texto: es que sobra contenido en el plano.

### Oclusión sobre texto: al pie, no al centro

Un objeto que cruza una cifra de **dos** glifos puede ir centrado. Sobre **tres o
más**, el centro se come el glifo del medio y la cifra deja de leerse. Va rozando
el **pie** y corrido a un lado: la profundidad se mantiene y el texto sobrevive.

### El apaisado no es el vertical rotado: el cuerpo se mide contra el ALTO

    vertical  1080×1920 → titular 112 px = 5,8 % del alto
    apaisado  1920×1080 → titular 128 px = 11,9 % del alto  ← se ve más grande

En 16:9 el ancho sobra y el alto es la dimensión escasa: **dimensionar contra el
ancho deja los titulares perdidos**. A cambio, una frase larga entra en un solo
renglón, así que lo que en vertical obligaba a apilar acá no hace falta.

### El rótulo de unidad va arriba del número

`$6.000` con `decants desde` debajo se lee "seis mil decants desde". El **orden de
lectura manda sobre la jerarquía visual**: el número puede ser cinco veces más
grande y leerse igual en segundo lugar.

### Portar entre formatos: recalcular el cuerpo, no reencuadrar

    ancho ≈ nº_caracteres · k · cuerpo      k = 0,52 minúscula · 0,66 versalita
    ancho_util = ANCHO − 244                (122 px de margen por lado)

En apaisado la dimensión escasa es el **alto**; en vertical, el **ancho**. Pasando
un 16:9 a 9:16, tres de cinco frases dejaron de entrar. Portar es recalcular el
cuerpo y decidir qué frase se apila. Bajar el cuerpo hasta que entre en un renglón
suele ser peor: la frase entra pero se pierde en el cuadro.

**Lo que se reusa idéntico:** guion, tiempos, transiciones, sonidos y master.
**Lo que se rehace:** tipografía, tamaños de objeto y qué se apila. La pieza es el
guion; el formato es presentación — por eso conviene renderizar las dos desde el
mismo proyecto y no recortar una de la otra.

### Cada rótulo se centra sobre su objeto

Con objetos de tamaños distintos, cada etiqueta necesita
`left = centro_del_objeto − ancho_rótulo/2`. En una comparación se nota enseguida:
el ojo empareja rótulo con objeto por proximidad.

### Los números de una degradación de jerarquía no se portan entre formatos

Se recalculan contra el **alto** del formato. En vertical sobra alto para que el
objeto suba y el texto ocupe el hueco; en 16:9 la misma subida deja el texto
encima del objeto. Al portar, la degradación necesita **más subida y más
reducción**, y el texto se corre al otro lado del centro.

### Alinear carteles sin transcripción

Dentro de cada segmento de habla, se reparten en proporción a los caracteres:

    dur = (fin_seg − ini_seg) · len(texto) / Σ len(textos del segmento)

y se verifica que ninguno pase de **17 caracteres por segundo**. Si alguno se pasa,
hay que **partirlo**, no acelerarlo.

Las tres reglas que el motor no chequea: **hueco constante** (3 cuadros entre
carteles), **banda fija** (un solo `top` para todos — el renglón no se mueve ni un
píxel), y **el contraste se arregla con sombra, nunca cambiando el color**.


---

## Color, luz y fondo

### En registro claro, el BLANCO es el material principal
El color es un acento que se insinúa en un borde. Cuatro manchas saturadas
cubriendo el cuadro no son un registro claro: son un papel de caramelo.

---

## 4 · Medir texto: la trampa más cara

🚨 **Ninguna medición de texto es válida antes de `document.fonts.ready`.**
Al ejecutarse el script la fuente embebida todavía no cargó, así que
`offsetWidth` devuelve el ancho de la **tipografía de respaldo**. Medido: **23 %
menos** del ancho real. Una caja calculada con ese número recorta la frase **para
siempre**, por más que la timeline esté perfecta.

**La solución no es un factor de corrección: es no medir.**
- recorte de tipeo → `clip-path: inset(… X% …)` animado de 100 % a 0 %
- recentrado → `xPercent` de 0 a −50 (porcentaje del propio ancho)
- cursor → un **riel** del ancho del texto que se traslada `xPercent` 0→100:
  llega exacto al final de la frase sin saber cuánto mide

Lo que sí necesita medir (titulares estáticos) se encaja en
`document.fonts.ready` — toca `font-size`, nunca la timeline:

```js
function encajar(sel, caja) {
  document.querySelectorAll(sel).forEach(el => {
    let px = parseFloat(getComputedStyle(el).fontSize);
    const piso = px * 0.45;          // fusible: si hay que bajar más, el
    while (el.scrollWidth > caja && px > piso) {   // problema es la medición
      px -= 1; el.style.fontSize = px + 'px';
    }
  });
}
encajar('.titular', CAJA);
if (document.fonts) document.fonts.ready.then(() => encajar('.titular', CAJA));
```

⚠️ **`scrollWidth` sobre un bloque de ancho 100 % mide el BLOQUE, no el texto.**
El texto a medir va en un `inline-block`. Sin eso el encaje achica la tipografía
hasta el mínimo y el titular sale del tamaño de una nota al pie.

⚠️ **Si el texto se escala después de encajarlo, la caja debe descontar esa
escala** (`CAJA / 1.07` para una deriva de 1.07).

### Logos de marca reales
`scripts/lab/logos.mjs` los baja del CDN de **Simple Icons**
(`cdn.simpleicons.org/<slug>`), sin API key y con el **color oficial de cada
marca**. Se bajan al proyecto en vez de enlazarlos: el motor renderiza sin red
garantizada y una composición tiene que ser reproducible offline.

⚠️ **No todas las marcas están.** Adobe, Canva, Slack y OpenAI devuelven **404**:
pidieron que no se use su logo. La herramienta lo reporta en vez de tragárselo.

🔑 **El logo va sobre una pastilla blanca, y eso no es decoración.** Notion,
Vercel, GitHub y OBS son casi negros: sobre fondo oscuro desaparecen.

---

## 5 · Composición del texto

> **El texto casi nunca es lo más grande del cuadro. El OBJETO lo es.**
> El texto es una etiqueta que nombra lo que estás viendo.

Siete layouts leídos de las referencias:

| # | Layout | Cuándo |
| --- | --- | --- |
| 1 | etiqueta chica arriba, objeto abajo | el objeto es el argumento — el más común |
| 2 | titular anclado a un margen, sangrando | frases largas |
| 3 | cuadro partido: objeto de un lado, texto del otro | comparaciones |
| 4 | texto tapado por el objeto | da profundidad y cuesta cero |
| 5 | una palabra enorme cortada por el borde | remates |
| 6 | una forma parte el cuadro; el texto vive en una mitad | cambios de sección |
| 7 | **centrado y SOLO** | placas de título puras, sin nada más en el cuadro |

🚨 **El 7 es el único que permite centrar, y exige que no haya nada más.**
Texto centrado con un objeto detrás no está en la lista porque **ninguna
referencia lo usa**.

🚨 **Y no alcanza con "no centrar":** si todos los bloques comparten el mismo
anclaje —todos a la izquierda— es la misma plantilla en otro eje. Lo que se varía
es el anclaje **entre bloques y entre actos**.

**Márgenes:** 58 px en 1080 no es un margen, es estar contra la pared (5 %).
Piso **122 px** (11 %). Sangrar el objeto sí; **cortar una palabra a la mitad, no**
— eso lee a desborde, no a recorte.

**El color vive en los objetos, no en las letras.** Texto blanco sobre oscuro o
negro sobre claro. Si el texto compite en color con el objeto, hay dos cosas
peleando por el mismo trabajo.

**Jerarquía adentro del bloque:** una palabra manda, notoriamente más grande y en
el peso más pesado; las secundarias finas y **en gris**, nunca en un color de acento.
Un salto de cuerpo de 2.7× es lo que lo hace leer como jerarquía y no como lista.

---

## 6 · Ritmo

- **Variación de plano (máx ÷ mediana) ≈ 3×.** El ritmo parejo es la causa
  medida de que una pieza salga lenta. El hook corta rápido, la prueba respira,
  el remate vuelve a cortar.
- **`expo.out` sobre duraciones largas es una trampa:** recorre el 80 % de la
  distancia en el primer 20 % del tiempo y después se arrastra. Para llegadas
  fluidas, **`power2.out` sobre 0.7-0.8 s**.
- **Equivalencias de curva** (los tutoriales usan nombres de Qt; GSAP numera
  distinto y es un error fácil):

| Tutorial / Qt | GSAP |
| --- | --- |
| cubic out · `OutCubic` | **`power2.out`** (no `power3`) |
| quad ease · `InOutQuad` | `power1.inOut` |
| circ ease · `InOutCirc` | `circ.inOut` |
| `OutExpo` — para **un número que aparece** | `expo.out` |

- **El corte cae en el ARRANQUE de un gesto, no en el medio.** Medido sobre 109
  cortes: movimiento antes del corte 0.84 (bajo el azar), después 1.55. Para un
  impacto, el corte va **justo antes**, para que caiga entero en el plano nuevo.
- **Punch-in:** 10 fotogramas a 30 fps = **0.333 s**. El zoom no es el plano: es
  el acento adentro del plano.
- **Pre-lap:** el acto siguiente empieza a entrar antes de que el anterior
  termine. Es el J-cut hecho imagen, y es lo que hace que los actos dejen de
  leerse como piezas pegadas.

### Perspectiva: el gradiente de velocidad que ningún easing produce

Un rectángulo largo con `rotateX(55deg)` que se traslada sobre su propio eje da,
con **un solo tween lineal**, campo cercano a cientos de px/cuadro y campo lejano
casi quieto. Es como está hecha la referencia de más energía del board (8,99).

- El `filter` (desenfoque de movimiento) va en un **ancestro** del contexto 3D.
  Aplicado sobre el mismo elemento que lleva `preserve-3d`, lo aplana.
  `.cam[filter] > .esc[perspective] > .piso[preserve-3d]`.
- A esa velocidad el desenfoque direccional es **obligatorio**, no decorativo: la
  captura por seek no genera ninguno y el vuelo estroboscopia.

### El fondo claro necesita estructura tonal, igual que el oscuro

Medido en lab-17: sobre `#FAFAFA` liso, con cámara y grano ya corriendo, la
pieza daba **0,29 de movimiento y 70 % de cuadros quietos**. Desplazar una
superficie de tono uniforme no produce diferencia alguna: no hay tono que mover.

Base `#F4F1EC` más tres manchas desenfocadas —blanco, gris azulado `#D9DEE8`,
durazno `#F6E0CE`— derivando a 70 px/s: **0,78 · 0 % quietos**.

**"Fondo claro" no es sinónimo de fondo blanco.** El resplandor que se le pone a
un fondo oscuro hay que ponérselo igual al claro, sólo que con otros tonos.

### Gradientes: no se interpolan, se apilan

`linear-gradient(A) → linear-gradient(B)` no es tweeneable, ni un gradiente hacia
un color plano. Para que un objeto se encienda y se apague, dos capas:

    .p   { background:#EDE5D9 }                      /* estado neutro */
    .hot { position:absolute; inset:0; opacity:0;    /* el gradiente encima */
           background:linear-gradient(104deg,#FF5E2B,#E01F5A,#7B3BFF) }

y se anima la **opacidad** de `.hot`. El texto acompaña con un tween de `color`,
que sí interpola.

### 🚨 El borde de una capa desplazada entra al cuadro

Thiago lo vio antes que la medición: un **rectángulo con bordes rectos** en el
fondo de las piezas. La causa no era el filtro ni el gradiente: era **la capa de
grano**, de 144 % del cuadro, desplazada ±610 px. Su propio borde entra en campo,
y como va en `mix-blend-mode: screen` ese borde es un **escalón de brillo**: se
ve un rectángulo perfecto de arriba abajo.

**La cuenta, antes de renderizar:**

    media_extensión_de_la_caja  ≥  media_pantalla + viaje_completo

Con viaje de 610 px en horizontal: 540 + 610 = 1150 px. Una caja de 144 % sólo
da 778. Hace falta **280 %** (1512 px). En vertical, 960 + 520 = 1480; 280 % da
2688. La regla vale para **cualquier** capa que se traslade —grano, resplandor,
textura— y es especialmente visible con `mix-blend-mode`, porque ahí el borde no
es un degradado sino un salto.

**Cómo verlo:** el artefacto es invisible en el render normal porque vive en los
tonos oscuros. Se revela estirando sólo ese rango:

    ffmpeg -ss T -i v.mp4 -frames:v 1 -vf "format=gray,lutyuv=y='(val-13)*16'" f.png

Un A/B así muestra la costura de inmediato. **Un detector numérico de gradiente
no sirve** para esto: confunde la pendiente suave de un resplandor con una
costura, y me mandó dos veces a la capa equivocada. La comparación visual
estirada es el instrumento correcto.

### Arcos de luz: gradiente cónico recortado con `mask`

    background: conic-gradient(from 0deg, TRANSPARENTE 0deg, COLOR 70deg,
                CABEZA 92deg, TRANSPARENTE 206deg, TRANSPARENTE 360deg);
    mask: radial-gradient(circle, transparent 0 44%, #000 48%, #000 51%, transparent 55%);

El cónico pinta **a lo largo de la circunferencia**, la máscara radial deja sólo
el anillo, y un único tween de `rotation` barre la luz. Los bordes suaves de la
máscara (44→48 % y 51→55 %) evitan el filo de pixel.

**Con dos aros hay que contrarrotarlos.** Girando en el mismo sentido se lee como
una sola pasada de luz; con el fino al revés y más rápido se lee como volumen.

Una caja más grande que el cuadro **no viola** la regla del borde desplazado
mientras sólo rote y escale: esa regla aplica al **viaje**, no al tamaño.

### 🚨 El `at X% Y%` de un gradiente es relativo a la caja, no al cuadro

Al agrandar la caja de un resplandor a `inset:-120%` para cumplir la regla del
borde desplazado, **todas las posiciones en porcentaje dejan de apuntar a la
pantalla**. Con caja de 3,4 cuadros de lado, `at 38% 22%` cae en y = −868: la
mancha queda entera por encima del borde superior y el campo se ve lavado.

La conversión, para no estimarla:

    pct_x = (x_cuadro + 1.2·ANCHO) / (3.4·ANCHO) · 100
    pct_y = (y_cuadro + 1.2·ALTO)  / (3.4·ALTO)  · 100

### En registro claro, las manchas van fuera de la banda de lectura

Son dos requisitos simultáneos: el fondo necesita **rango tonal** (si no, no hay
nada que la cámara pueda mover) y la banda del texto necesita quedar **clara**
(si no, el negro no se lee). Se resuelven con la **posición** de los centros —a
unos 500 px de la línea, arriba y abajo—, no bajando la saturación, que es lo que
mata el rango tonal.

### Logos de marca: placa clara detrás

Varias marcas tienen color oficial **#000000** (vercel, github, notion entre
otras). Sobre fondo oscuro desaparecen. De las tres salidas —monocromo blanco,
halo, o placa clara— **sólo la placa conserva el color de cada marca**, que es lo
que pide la regla de que el color viva en el objeto. Además es como están
diseñados: para fondo claro.

Los slugs que la marca no autoriza devuelven **404**, y eso hay que verlo, no
tragárselo.


---

## Objetos y técnicas

### Y no alcanza con moverse: hace falta TEXTURA contra la cual verlo
Un degradado radial desplazado se ve idéntico a sí mismo. La solución es la del
cine: **grano**. Una capa de `feTurbulence` a pantalla completa, corrida ~1.4 px
por cuadro, cambia todos los píxeles del cuadro. Hace tres cosas a la vez:
da referencia visual al movimiento, **rompe el banding de H.264** en degradados
oscuros, y los negros dejan de parecer un vacío digital.

🚨 **`mix-blend-mode: overlay` sobre negro devuelve negro.** Sobre fondo oscuro va
`screen` (aditivo); sobre fondo claro va `multiply`. Con el modo equivocado el
grano está puesto y es literalmente invisible — el archivo pesa lo mismo.

---

## 3 · La luz define el objeto, no el relleno

En un cuadro oscuro **el objeto lo define su borde**. La receta medida contra la
referencia:
- contorno **continuo** de 5-7 px casi blanco
- **tres** `drop-shadow` encadenados (14 px, 44 px, 96 px) — una sola sombra da un
  borde prolijo; tres dan un objeto que emite luz
- un halo grande y desenfocado detrás: es lo que lo despega del negro
- un **segundo anillo concéntrico** exterior, más tenue
- interior **más oscuro** que el borde: el filo tiene que ganarle al relleno

**Un objeto fino no se agranda: se agranda su LUZ.** Un halo de 1720×960 hace que
un cuadro deje de leer como vacío sin tocar el objeto.

### El bokeh son círculos, no un lavado
Discos desenfocados a ~20 % de opacidad, cada uno moviéndose a su ritmo. Un
degradado radial difuso no da profundidad de campo: da niebla.

### Composición radial: una línea de CSS por elemento

    transform: rotate(Ai) translateY(-R) rotate(Bdeg)

`rotate(Ai)` elige la dirección, `translateY(-R)` empuja el elemento a la
circunferencia, y el **tercer** `rotate` lo inclina en su lugar — eso convierte
un aro de pétalos en una turbina. Sin trigonometría y sin posicionar a mano.

**Animar `scale` encima de ese transform inline no rompe la posición:** GSAP lee
la matriz y la descompone en rotación + traslación + escala, y la escala termina
aplicándose al elemento en su lugar. Si hiciera falta escalar la *distancia* al
centro, ahí sí hay que separar en dos divs anidados.

### Cintas de luz: el reflejo va asimétrico

Un gradiente atravesado **simétrico** (oscuro → claro al 50 % → oscuro) se lee
como un **tubo de neón**. Corriendo el filo claro a **un solo borde** —cuerpo
oscuro ancho, franja casi blanca al 76–83 %— se lee como una **superficie curva
iluminada de un lado**. La asimetría es toda la diferencia.

Y el campo tiene que ser **irregular a mano**: cinco cintas con ángulos de −19° a
−41°, anchos de 258 a 520 px y separaciones desparejas se leen como un campo;
siete al mismo ángulo y equiespaciadas se leen como una grilla.

### Resaltador de marcador

Va **detrás** de la palabra, no encima: `position:absolute` dentro de la palabra
con `z-index:1` (texto en `z-index:2`) y `transform: scaleX(0) → 1` con
`transform-origin: 0 50%`. El texto queda negro sobre el color, que es la regla.

### Trazos a mano: `stroke-dashoffset`, y con pocas curvas

`stroke-dasharray` igual al largo del path y `stroke-dashoffset` animado a 0 lo
dibuja solo. **Un path con tres béziers y dos vueltas se lee como un garabato sin
sentido; un solo arco se lee como un gesto.** En un trazo de acento, menos curvas
= más intencional.

### Números que cuentan: trasladar, no escribir

Tweenear un número en un proxy y escribirlo en un `onUpdate` funciona, pero el
**odómetro es mejor y es puro transform**, así que es perfectamente buscable y
renderiza igual en cualquier worker de la captura paralela:

    .slot { width:W; height:H; overflow:hidden; position:relative }
    .col  { position:absolute; top:0; left:0 }        /* dígitos 0-9 repetidos */
    .col span { display:block; height:H; line-height:H }

    y = -(vueltas·10 + dígito_final) · H

Con `power3.out` frena como un contador mecánico. `font-variant-numeric:
tabular-nums` evita que el ancho salte entre dígitos.

### Un punto que recorre una curva: guion de largo cero, no trigonometría

Sin MotionPathPlugin, la salida obvia es muestrear el bezier y emitir keyframes.
**Mejor: el punto es la misma ruta, con un guion de largo casi cero y punta
redonda.**

    .punto { stroke-width:30; stroke-linecap:round }
    tl.set(sel, {attr:{'stroke-dasharray':'0.1 ' + (L+10), 'stroke-dashoffset':0}});
    tl.to (sel, {attr:{'stroke-dashoffset':-(L-0.6)}, duration:DIB});

La punta redonda del guion se renderiza como un círculo. Comparte parametrización
con la línea que se dibuja, así que **la sincronía es exacta por construcción** y
sigue siéndolo si cambian la ruta, la duración o el easing.

⚠️ El desfase final va a **`-(L - 0.6)`**, no a `-L`: justo en el fin de la ruta el
guion se recorta y el punto desaparece.

**El halo va como otra copia de la misma ruta con el mismo guion.** Animado
aparte, se adelanta o se atrasa respecto de la línea.

### La profundidad de un abanico es `z-index`, no orden del DOM

En un abanico la pieza **central va adelante** y las laterales asoman a los
costados (`z-index` 3/2/1 más desplazamiento en x). Dejarlo librado al orden de
escritura hace que la última tape a todas.

### Formas orgánicas: el filtro pegajoso, y el paso que hay que borrar

    <filter id="goo" x="-25%" y="-25%" width="150%" height="150%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="26" result="d"/>
      <feColorMatrix in="d" mode="matrix"
        values="1 0 0 0 0   0 1 0 0 0   0 0 1 0 0   0 0 0 27 -13"/>
    </filter>

Desenfocar y después subir el **contraste del alfa** (`α → 27α − 13`) convierte
círculos que se rozan en **una sola silueta con cuello**. Sólo la cuarta fila de
la matriz hace algo.

🚨 **La receta que circula termina en `<feBlend in="SourceGraphic" in2="g"/>` y eso
anula la fusión**: repinta los círculos nítidos encima. Sirve para poner contenido
crocante sobre una mancha; para fundir formas hay que sacarlo.

**El volumen sale del orden de los colores.** Un color distinto por círculo, de
claro en un extremo a profundo en el otro: el desenfoque los mezcla y la masa
queda con una rampa que el ojo lee como luz lateral. No hace falta sombreado.

**Ojo con la región del filtro:** un elemento que entra desde muy lejos aparece
recortado. El viewBox del SVG recorta (`overflow:visible` lo arregla) y la región
del filtro sólo llega a −25 %/+150 % de la bbox.

### Volumen de texto: copias apiladas, no 3D

N copias del mismo texto, cada una corrida un paso más (`x: i·k`, `y: i·k·0,78`)
y progresivamente **más oscura**; la de adelante con el degradado claro por
`background-clip: text`. Sin `preserve-3d` y sin `rotateX`.

**Animar el corrimiento de 0 al valor final** (stagger de ~6 ms) hace que el
volumen **crezca desde el plano**: el texto llega chato y después se levanta.

### Campos de partículas: PRNG sembrado en el generador, no en el documento

Posición, tamaño y opacidad salen de un `mulberry32` calculado **al generar el
HTML**. Determinista por construcción, sin `Math.random()` en el documento, y con
un período de parpadeo distinto por partícula para que no se lea la grilla.

### Contorno iluminado: se gira el contenido, nunca el recorte

Un aro circular se puede rotar entero (un círculo rotado es el mismo círculo).
**Un rectángulo redondeado no:** al rotar el elemento rota su máscara y el filo se
despega del borde. Van dos elementos:

    .filo { inset:0; border-radius:R; padding:G; overflow:hidden;
            mask: linear-gradient(#000 0 0) content-box,
                  linear-gradient(#000 0 0);
            mask-composite: exclude }              /* el contorno, QUIETO */
    .filo > .giro { cuadrado y más grande que la caja;
                    background: conic-gradient(...) }   /* esto es lo que rota */

La doble máscara con `exclude` deja sólo el anillo del padding — es el truco del
borde con degradado. **Regla: cuando la forma recortada no es invariante a la
rotación, se gira el contenido.**

En un rectángulo el cónico reparte el ángulo desde el centro, así que la luz corre
rápido por los extremos cortos y lenta por los lados largos. No es un defecto: es
lo que hace que el filo parezca acelerar al doblar.

### Esqueleto de carga: el brillo va dentro de la barra

    .bar    { position:relative; overflow:hidden; background:rgba(255,255,255,.085) }
    .brillo { position:absolute; width:60%; height:100%;
              background:linear-gradient(105deg, transparent, rgba(255,255,255,.34) 50%, transparent) }
    xPercent: -130 → 230, con 0,12 s de desfase entre barras

La **misma** franja de luz puesta sobre la tarjeta entera se lee como un reflejo
en el vidrio; recortada dentro de cada barra se lee como carga. Cambia el
recorte, cambia el significado.

Y el contenido real tiene que aparecer **exactamente en el hueco que ocupaba el
esqueleto**: si aparece en otra posición se lee como un cambio de pantalla, no
como un relleno. Lo que vende el efecto es que el espacio no se mueve.

### Comparación con barrido: recorte y filo, el mismo número

    tl.fromTo('.corte', {x:0},{x:460, duration:.92, ease:'power2.inOut'}, T);
    tl.fromTo('.lado2', {clipPath:'inset(0 100% 0 0)'},
                        {clipPath:'inset(0 0% 0 0)', duration:.92, ease:'power2.inOut'}, T);

Misma duración y misma curva, o la luz se ve separada del corte. Igual que el
punto montado en la curva: **los dos elementos de un mismo gesto comparten
parámetro**.

### Del prompt al SVG: cuando el material es vectorial, cada trazo es un objeto

La técnica de [Bin Liu sobre Quiver Arrow 2](https://x.com/liu8in/status/2100422723361210852):
se escribe un texto, sale un **SVG editable**, y ese SVG entra a HyperFrames.
Lo que cambia no es la estética — es el material. Una imagen es una sola cosa;
un plano vectorial de 179 trazos son **179 nodos del DOM**, y eso destraba tres
cosas que un PNG no da nunca:

1. **Se dibuja solo** — `stroke-dashoffset` de 1 a 0, con corrimiento.
2. **Aguanta el zoom** — a 7,5× no hay un solo píxel interpolado.
3. **Cada pieza se anima por separado** — las nueve palas del diafragma cierran
   sin tocar el resto del dibujo.

**Cuando el gráfico es un diagrama, un ícono, un esquema o un plano, el material
correcto es SVG en línea, no una imagen.** El `<img src="algo.svg">` no sirve:
los trazos tienen que estar en el documento para que GSAP los alcance.

### `pathLength="1"`: un solo corrimiento para trazos que se llevan 59 a 1

Medido sobre el plano del lab-40: el trazo recto más corto mide **8 unidades** y
el más largo **468** — **59 a 1**, y eso sin contar los contornos curvos. Con un
`stroke-dasharray` en unidades reales, el mismo tween deja la marca chica
terminada al instante y el contorno largo a medio camino: el dibujo sale
emparchado.

Con `pathLength="1"` declarado en cada `<path>`, el guion y el corrimiento se
miden **en fracciones del largo propio**. Entonces:

```css
.plano path { stroke-dasharray: 1; stroke-dashoffset: 1 }
```
```js
tl.to('.cuerpo', {strokeDashoffset: 0, duration: .45, stagger: {amount: .70}}, D);
```

Un solo tween, 179 trazos, todos tardan lo mismo. **El `pathLength` se pone en
el generador del SVG, no después.**

📌 La receta de `skills/hyperframes-animation/techniques.md` río arriba todavía
clava un `stroke-dasharray: 280` a mano y sugiere `path.getTotalLength()`. Sirve
para **un** trazo; para un dibujo de muchos obliga a un cálculo por elemento y
no da un corrimiento parejo. `pathLength="1"` lo resuelve en el marcado.

### 🚨 `vector-effect: non-scaling-stroke` y `pathLength` no conviven

Puesto junto al guion normalizado, el trazo **aparece punteado desde el cuadro
cero**: el `stroke-dasharray: 1` vuelve a medirse en píxeles de pantalla y
dibuja una raya de 1 px encendida y 1 px apagada. En el primer render del
lab-40 el plano entero estaba visible como un fantasma de puntos durante todo
el prompt, y además **infló la medición de fluidez de 1,45 a 2,02**: el
instrumento estaba contando el titileo del punteado como movimiento.

Si hace falta dibujar trazos y además controlar su grosor bajo zoom, el grosor
se compensa a mano (ver *En un zoom vectorial el trazo se multiplica por la
escala*). Y de paso: **`vector-effect` no se hereda** — puesto en el `<svg>` no
llega a un solo trazo, va en el `path`.

### 🚨 En SVG, GSAP no usa `transform-origin`: el pivote va en `svgOrigin`

Para que un diafragma cierre, cada pala tiene que girar **sobre su propio pivote
en el borde**, no sobre el centro del círculo: girando todas sobre el centro el
dibujo rota entero y la abertura queda igual. La cuenta: la distancia del centro
a una pala que va del vértice *i* al *i+2* es `RB·|sen(130° + θ)|` — con θ=0 vale
`0,766·RB`, con θ=34° cae a **`0,276·RB`**. Eso es el cierre.

Poner el pivote fue tres intentos, y los dos primeros son la lección:

1. `style="transform-origin: 1560px 430px"` en el `path` → **GSAP lo pisa**, usa
   50 % 50 % y las palas se van del cuadro.
2. `transformOrigin` pasado al tween → en un elemento SVG **GSAP no lo resuelve
   contra el `viewBox`**: hornea el pivote en una matriz calculada desde el
   *bounding box* del trazo.
3. `svgOrigin: (i, el) => el.dataset.o` con `data-o="1560.0 288.0"` → **esto sí**.
   `svgOrigin` toma coordenadas del sistema del `viewBox`, absolutas, sin restar
   nada.

```js
tl.to('.pala', {rotation: 34, svgOrigin: (i, el) => el.dataset.o,
                duration: 2.10, ease: 'power2.inOut', stagger: {amount: .18}}, 11.20);
```

**El pivote viaja como dato en el elemento, no como estilo.**

### 🚨 `transform-box: view-box` mide desde la esquina del `viewBox`

La trampa hermana, para cuando sí se usa CSS: con `transform-box: view-box` el
origen del sistema **no** es (0,0) del documento sino la esquina `min-x min-y`
del `viewBox`. Con `viewBox="160 186 1660 492"`, un pivote que en coordenadas de
usuario está en (1560, 430) se escribe **(1400, 244)**. Si el `viewBox` arranca
en cero nunca se nota; en cuanto arranca corrido, todo lo que gira se va a otro
lado.

### Fotos: el travelling va en la imagen, no en el marco

El contenedor recorta y queda **fijo**; la imagen adentro es la que se mueve
(`scale 1.16 → 1.0` más paneo). Así el encuadre no se desplaza y el movimiento
pasa por dentro del cuadro — que es lo que hace que una foto quieta parezca
filmada. Mover el marco entero se lee como una estampa que se corre.

**Y el umbral de 60 px/s no aplica a fotos:** 22 px/s sobre una imagen dio 0 % de
cuadros quietos, porque una foto tiene textura en cada píxel y un desplazamiento
mínimo cambia el cuadro entero. **El umbral es para superficies planas.**

**El alfa no es un lujo:** sin PNG con alfa, el reflejo y la sombra siguen una caja
en vez de la silueta y la foto se lee como una estampilla pegada. `scripts/lab/recorte.py`
recorta, suaviza el borde y guarda con alfa.

**Un reflejo va como `background-image`, no como un segundo `<img>`:** dos imágenes
con la misma fuente disparan `duplicate_media_discovery_risk`. Un reflejo no es
contenido, es pintura.

### Los silencios de la locución son los puntos de corte

    ffmpeg -i voz.wav -af "silencedetect=noise=-38dB:d=0.16" -f null -

Da los segmentos de habla. **Las transiciones van dentro de los silencios**:
cortar sobre la voz se nota, cortar en el hueco es invisible. Los tiempos de corte
no se eligen — los dicta la locución.


---

## Movimiento: curvas, barrido y ritmo

### 🔄 El obturador SÍ existe: `npx hyperframes add motion-blur`

**Esta lección decía lo contrario y estaba desactualizada.** Decía "no hay
obturador: todo el motion blur es autoreado". Hoy hay dos mecanismos reales y
hay que elegir a sabiendas.

**1 · El componente del catálogo** (`npx hyperframes add motion-blur`). Corre
dentro de la página: después de cada cuadro reposiciona la línea de tiempo en
`samplesPerFrame` tiempos sub-cuadro, lee la **matriz `transform` resuelta** de
cada copia y las apila con `mix-blend-mode: plus-lighter` a 1/N de opacidad. El
promedio de esas copias **es** la integral del obturador.

Que lea la matriz resuelta y no una lista de propiedades es lo que lo cambia
todo: **traslación, escala, rotación, rotación 3D y sesgo salen todos de la
misma cuenta**. Es decir, **cubre el zoom**, que es justo donde la fórmula a
mano no llega (ver *El barrido de un zoom es RADIAL*).

A/B pareado sobre el mismo cuadro del lab-40, en el pico de un zoom a 7,5×:

| | energía de detalle | render de 15 s |
|---|---|---|
| sin barrido | — | **18 s** |
| `backdrop-filter` radial a mano | 9,10 | 18 s |
| componente · 16 muestras | **11,63** (1,28×) | 3 m 16 s (**10,6×**) |
| componente · 6 muestras | 12,33 | 1 m 9 s (3,8×) |

El desenfoque a mano es una gaussiana de pantalla: **borra el dibujo entero**.
El componente integra sobre la trayectoria real, así que la línea se mantiene
nítida a lo largo y sólo se abre en la dirección del movimiento.

⚠️ **La energía de detalle no es una medida de calidad del barrido.** Con 6
muestras da *más* que con 16 porque la escalera de fantasmas es más gruesa, y un
laplaciano cuenta ese escalón como detalle. Hubo que **mirar el cuadro ampliado**
para confirmar que a esta longitud de estela las dos son indistinguibles. La
regla real: **las muestras se escalan con el largo de la estela, no se fijan.**

**Lo que cuesta:** N+1 copias del subárbol entero, reestiladas en cada cuadro.
En un movimiento de cámara lo que se mueve es *todo*, así que se pagan 17 copias
de 179 trazos. Apuntarlo al elemento que se mueve, nunca a un contenedor de más.

**Las tres trampas de uso:**
- Se llama **después** de definir todos los tweens y **antes** de registrar en
  `window.__timelines`.
- Se le pasa `fps` explícito: si no, lo saca del `data-fps` del root.
- Una copia **pierde el `id` y conserva las clases**. Después de enganchar,
  al elemento se lo direcciona por `id`, nunca por una clase que las copias
  también llevan.

**2 · El obturador del motor** (v0.8.45+, configuración de render, todavía sin
flag de CLI): re-renderiza la página en varios instantes de la ventana y los
promedia píxel a píxel. Desde v0.8.46 elige entre 16 y 64 muestras **midiendo
cuánto se movió cada cuadro**. Es el camino correcto cuando el movimiento no es
un `transform` — pero no está disponible en la versión que pinea el kit.

**3 · A mano**, que sigue valiendo cuando lo anterior no aplica (ruta del
compositor por capas, contenido que no se mueve por `transform`, o cuando el
costo de 10× no entra): *lo que se mueve rápido se desenfoca en la dirección en
que se mueve, y recupera el foco al frenar.* A 60 fps no es opcional.

### Para que algo viaje sobre su propio eje, la rotación va en el envoltorio

GSAP aplica su `x` en el marco del padre. Si la rotación también la pone GSAP, el
elemento se desplaza en horizontal en vez de a lo largo de sí mismo. La rotación
va en **CSS sobre un envoltorio**, y GSAP anima la `x` del hijo, que ya está
dentro del marco rotado.

### Un elemento rotado se mide contra la DIAGONAL

La regla de la caja desplazada usa media-pantalla, pero **un elemento rotado
puede asomar la punta por cualquier esquina**: en 1080×1920 la media-diagonal es
**1101 px**, no 540. Con un viaje de 880 px hacen falta 1981 px de media-longitud.

### Varias escenas: se anima el contenedor, y el fondo no corta

La transición **ES** la salida de la escena: se anima el contenedor, nunca los
elementos, y el contenido de la que sale está entero cuando arranca el pase.

    function pasa(sale, entra, t) {
      tl.to(sale,  {opacity:0, scale:1.22, filter:'blur(30px)', duration:.56, ease:'power2.in'}, t);
      tl.fromTo(entra, {opacity:0, scale:.84, filter:'blur(26px)'},
                       {opacity:1, scale:1,  filter:'blur(0px)', duration:.66, ease:'power2.out'}, t + .12);
    }

El solape de 0,12 s evita el cuadro vacío en el medio.

**Lo que cose las escenas es el fondo:** las manchas de ambiente y el grano corren
de punta a punta sin cortar, por debajo de todas. Eso hace que se lea como una
pieza y no como clips pegados. Las escenas cambian; el aire no.

Y con varias escenas en el DOM desde el cuadro 0, **`opacity:0` en CSS deja de ser
una preferencia**: las que todavía no empezaron se ven completas si ese estado
vive en un tween.

### 🔑 El motion blur se calcula, no se estima

El motor **captura por seek: cada cuadro es un instante perfecto, sin
obturador.** Una cámara real integra durante una fracción del cuadro. De ahí:

    σ = (velocidad_px_por_segundo / fps) · obturador / 3

- `velocidad / fps` → píxeles que se corre el objeto en un cuadro
- `obturador` → **0,5** para 180° (cine) · **0,9** para 320° (el "mucho blur"
  que pidió Thiago; también es un obturador real)
- `/ 3` porque una gaussiana cubre ±3σ

Ejemplos a 60 fps: 3564 px/s → σ 9,9 (180°) / 17,8 (320°) · 5158 px/s → 14,3 /
25,8 · 1485 px/s → 4,1 / 7,4.

**Va sólo en el eje del movimiento** (`stdDeviation="17.8 0"` para horizontal):
isotrópico se lee como desenfoque de foco, no como barrido. El filtro va en un
**ancestro** del objeto y con región ancha (`x="-60%" width="220%"`), o el
barrido se corta contra el borde de la región.

**Una instrucción permanente necesita un número, o se evapora.** Auditando las 35
piezas: 60 fps en 35 de 35, pero motion blur en sólo 6 — y la última, diecinueve
piezas antes. Los 60 fps sobrevivieron porque son un atributo que se copia; el
blur no, porque era criterio.

### El barrido de un zoom es RADIAL, y vive en espacio de pantalla

Un desplazamiento tiene una velocidad y un eje, y por eso sale con la fórmula
`σ = (px_s / fps) · obturador / 3`. **Un zoom no.** En un zoom la velocidad de
cada píxel es proporcional a su distancia al punto fijo: `v(r) = r · dS/dt`.
Vale **cero** en el punto fijo y **máximo** en el borde. Un desenfoque parejo
está mal en los dos lugares a la vez.

La cuenta del lab-40: escala de 1 a 7,5 en 2,85 s con `power1.inOut` da un pico
de `dS/dt ≈ 4,6 /s`. A `r = 540 px` (media pantalla) son **2.484 px/s**, o sea
`σ = 2484/60 · 0,9/3 = ` **12,4 px**. A `r = 0`, cero.

Se resuelve con **una capa de `backdrop-filter` enmascarada por un gradiente
radial**, hermana de lo que escala, no hija:

```css
.barrido { position:absolute; inset:0; opacity:0;
  backdrop-filter: blur(13px);
  mask-image: radial-gradient(circle at 50% 50%, transparent 0%, transparent 13%, #000 64%) }
```

Tiene que vivir **fuera** de la cámara: el desenfoque es un efecto de pantalla y
si se mete adentro del elemento que escala, la máscara escala con él y el
agujero central crece junto al zoom. Y la opacidad de esa capa **sigue a la
velocidad, no a la posición** — sube y baja con la misma forma que el `ease`,
en cero en las dos puntas.

### En un zoom vectorial el trazo se multiplica por la escala

Es la contracara de "nítido a cualquier escala": el SVG no pierde un píxel, pero
un `stroke-width` de 2,6 a **7,5×** se dibuja de **19,5 px** y el plano técnico
se convierte en un garabato grueso. La compensación es una cuenta:

    sw = ancho_en_pantalla / (k · escala)        k = ancho_render / ancho_viewBox

En el lab-40, `k = 1700/1660 = 1,0241`. Para sostener ~4,2 px en pantalla a 7,5×:
`sw = 4,2 / (1,0241 · 7,5) = ` **0,547**. A 2,6× son **1,353**.

Se anima con una variable CSS en el `<svg>`, en el mismo tween que la cámara,
con el mismo `ease` — si no, el grosor y la escala se desfasan y el trazo late:

```css
.plano { --sw: 2.6px; stroke-width: var(--sw) }
.plano .molet { stroke-width: calc(var(--sw) * .58) }
```
```js
tl.to('.cam',   {scale: 7.5, x: 975, y: 737.3, duration: 2.85, ease: 'power1.inOut'}, 6.25);
tl.to('.plano', {'--sw': '0.547px',            duration: 2.85, ease: 'power1.inOut'}, 6.25);
```

### 🚨 La cola de un `power2.inOut` mata el cuadro

Medido: un zoom de 2,85 s con `power2.inOut` dejó **0,6 s enteros marcados como
quietos** justo al final, cuando la velocidad cae a cero. Pasarlo a
`power1.inOut` — que frena menos — recuperó ese tramo sin que el movimiento se
sienta abrupto. **Cuando un movimiento largo es lo único que se mueve, su
desaceleración es un hueco.** O se le baja el grado al `ease`, o algo tiene que
empezar a moverse antes de que ese movimiento termine.

### Una raya corta con barrido fuerte se borra

Con σ 28 de motion blur, una raya de 42 px en el eje del movimiento **se disuelve**:
el barrido no la estira, la reparte. El mismo σ sobre una raya de 640–1500 px la
lee como estela. **El desenfoque de movimiento pide objetos largos en el eje del
movimiento** — si el objeto es más corto que ~3σ, desaparece.

### Movimiento reactivo al audio: un valor por cuadro

    ffmpeg -i bed.wav -af "lowpass=f=200,asetnsamples=n=800,
           astats=metadata=1:reset=1,ametadata=print:key=...RMS_level:file=-"

`asetnsamples=n=SR/fps` da **exactamente una ventana por cuadro** (800 a 48 kHz y
60 fps). Con el array resultante:

    tl.to(sel, {keyframes:{scale: VALORES.map(v => 1 + v*0.30)},
                duration: DUR, ease:'none'}, 0);

GSAP reparte los N valores en tramos iguales: **un keyframe por cuadro de
captura**, determinista y buscable, sin `onUpdate` ni analizador en vivo.

**Se analiza lo que tiene que mover el visual, no lo que se escucha:** midiendo la
mezcla completa, una cama continua aplana la banda baja (envolvente clavada en
0,5). Midiendo una mezcla sólo con los golpes, vuelve el rango. Y la
normalización va con curva (`((d−lo)/rango)**1.6`) para marcar el ataque.


---

## Entrega y formatos

### 🆕 Una composición, N videos: `--variables` y `--batch`

La tanda de creativos no se hace duplicando la composición. Se declara qué
cambia y se pasa una tabla:

```html
<div id="b" data-composition-id="b" data-start="0" data-duration="2"
     data-width="1080" data-height="1080" data-fps="60"
     data-composition-variables='{"titulo":{"type":"string","default":"Producto"},
                                  "precio":{"type":"string","default":"$0"}}'>
```
```js
const v = window.__hyperframes.getVariables();
document.getElementById('tt').textContent = v.titulo;
```
```bash
npx hyperframes render --batch filas.json
```

`filas.json` es un array de objetos: **un video por fila**, más un
`renders/manifest.json` que dice cuál salió de cuál. Medido en la versión que
pinea el kit: 3 filas, **3,6 s por video**, cero duplicación de HTML.

`--strict-variables` hace fallar el render si una clave no está declarada o
tiene el tipo equivocado; sin la bandera son avisos.

**Esto es lo que convierte una pieza en una tanda.** Diez ángulos de un anuncio
son diez filas de un JSON, no diez carpetas.

### 🆕 Las salidas que no son MP4

Ya están en la versión del kit y ninguna aparecía acá:

| Bandera | Para qué |
|---|---|
| `--format mov` · `--format webm` | **con transparencia** — para montar sobre metraje en otra herramienta |
| `--format png-sequence` | cuadros RGBA a un directorio, para entrar a otro editor |
| `--resolution 4k` \| `portrait-4k` \| `square` | la composición no cambia: Chrome captura con más DPR. La proporción tiene que coincidir y la escala ser múltiplo entero |
| `--quality delivery` | por encima del `looks` (CRF 16) por defecto |

La `--resolution` es la que más rinde: **una sola composición a 1080 sirve para
entregar en 4K** sin tocar un número.

### Entrega: el render del motor es mucho más pesado de lo necesario

Sale a ~17 Mbps; una pieza de 18 s pesa 38 MB y no pasa un límite de subida de
30 MiB. `scripts/lab/web.sh` busca el CRF más bajo que entre y **copia el audio ya
masterizado**. A crf 20 una pieza así queda en 13 MB e indistinguible del master
en un A/B recortado al 100 %.

### Zona segura de Instagram, verificada

Chrome de Reels: **264 px arriba, 322 abajo** (en 1080×1920). Se verifica midiendo
el brillo máximo en esas franjas a lo largo de la pieza; por encima de ~200 hay
texto u objeto claro bajo el chrome. Textura de fondo ahí es correcta.


---

## Método e instrumentos

### 🚨 El motor se mueve todos los días: mirar la versión antes de creerle a esta hoja

El kit pinea `hyperframes@0.7.109`. Al escribir esto la publicada era
**0.8.46**, del mismo día, y el repo saca **varias versiones por día**. Una
hoja de lecciones envejece contra un motor así, y dos de acá ya envejecieron:
el obturador y la lista de formatos de salida.

Antes de dar por buena una afirmación sobre lo que el motor *no puede*:

```bash
npm view hyperframes version                     # qué hay publicado
gh release view vX.Y.Z --repo heygen-com/hyperframes --json body -q .body
npx hyperframes render --help                    # qué acepta la versión LOCAL
npx hyperframes add <componente>                 # qué trae el catálogo
```

Y el repo publica **sus propias skills** en `skills/` —21 de ellas, entre otras
`motion-graphics`, `hyperframes-animation` y `hyperframes-keyframes`—. Son la
versión canónica de lo que hace esta hoja: conviene leerlas antes de inventar,
**y no darlas por correctas sin medir**. Dos afirmaciones de acá salieron de
medir contra ellas: una las mejora (`pathLength="1"`) y otra corrigió una
hipótesis mía que era falsa (el `tl.call` del tipeo).

### 🚨 Los valores relativos (`+=`, `-=`) rompen bajo render en paralelo
Un valor relativo **captura su base al inicializar el tween**. El render reparte
la pieza en tramos entre varios workers: uno inicializa a mitad de vuelo del
tween anterior y otro arranca en frío con el estado final — **el mismo cuadro
sale en dos posiciones distintas**, y se ve como un salto en el límite del tramo.
Va siempre `fromTo` con extremos explícitos, para que cualquier camino de seek
resuelva al mismo estado. (El lint lo llama `gsap_relative_value_second_writer`.)

### Y un límite del propio motor
**Solo hay 18 tipografías embebidas**, y el propio skill prohíbe la mayoría.
Las usables sin traer archivos: **Montserrat · Oswald · League Gothic ·
Archivo Black · Space Mono · IBM Plex Mono · JetBrains Mono · Source Code Pro**.
Cualquier otra necesita un `@font-face` real con su `.woff2` — y las reglas hay
que **pegarlas inline**: un `@import` a un `.css` externo el compilador no lo ve.
`scripts/lab/getfont.mjs` baja cualquier Google Font y arma el bloque.

### Mirar a resolución completa, no en miniaturas
La hoja de contactos sirve para el arco. Los defectos —un elemento fantasma, un
recorte, un choque— sólo aparecen en un cuadro a resolución completa.

### ⭐ El A/B pareado por timestamp
Extraer **el mismo instante** de la referencia y de la propia pieza y apilarlos.
Es lo que más rápido delata una copia: encuentra en un minuto diferencias de
escala, de luz y de tiempo que una hoja suelta no muestra nunca.

### Un recorrido circular se cronometra con la geometría, no con el ojo

Con la órbita girando `VUELTA` grados lineales en `DUR` segundos, el elemento que
está en el ángulo `Ai` se enciende en:

    t_i = T0 + DUR · (Ai / VUELTA)

(y otra vez en `Ai + 360` si entra en la vuelta). Nada se ajusta a mano: cambiar
la cantidad de elementos o de vueltas recalcula todos los tiempos solo.

### Un chequeo automático que no modela el tamaño del efecto inventa problemas

Auditando los resplandores por posición marqué 10 piezas "rotas"; agregando el
**radio** al cálculo resultaron 0. Un resplandor centrado fuera del cuadro se
derrama adentro igual, y muchas veces es lo buscado:

    llega al cuadro ⟺ (max(0,|x−W/2|−W/2)/Rx)² + (max(0,|y−H/2|−H/2)/Ry)² < 1

### 🚨 El color de una marca se mide del archivo, no se lee de una descripción

Le pedí a la herramienta de lectura web un resumen de la paleta y me contestó
"negro, gris/plateado, dorado" — una **interpretación del contenido**, no una
medición. La marca era **azul #1D1DE8**. Tres piezas salieron con la paleta
equivocada.

El procedimiento correcto, que lleva dos minutos:

    1. pedir la URL del logo (header, og:image, link rel=icon)
    2. bajarlo:  curl -sL -o logo.png "<url>"
    3. contar píxeles opacos con Pillow:
       Counter((p[0],p[1],p[2]) for p in im.getdata() if p[3] > 240)

Y **el símbolo del logo es el mejor objeto de la pieza**: ya está dibujado por
quien hizo la marca. Se recorta buscando el hueco de alfa entre símbolo y palabra
(columnas con alfa 0 durante ≥12 px seguidos).

### Un instrumento que devuelve un cero parejo está roto él

`ffmpeg -vf … -i archivo` pone el filtro **antes** de la entrada y ffmpeg lo
ignora: devolvió 0 en todos los cuadros y parecía que la pieza estaba rota. Antes
de creerle a una medición uniforme, verificar el instrumento.

### TTS local: el bloqueo suele ser la versión de Python

`kokoro-onnx` pide `onnxruntime>=1.20.1`, que necesita Python ≥3.10. Con un
`python3` de sistema viejo, la salida es un **venv aparte** apuntado con
`HYPERFRAMES_PYTHON`, sin tocar el intérprete del sistema. Voz `ef_dora` para
español; sin red ni API key en tiempo de render.

