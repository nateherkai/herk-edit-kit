#!/usr/bin/env python3
"""recorte.py <entrada> <salida.png> [--radio N] [--pluma N] [--alto N]

Deja una foto de producto lista para componer: la recorta a una forma con
esquinas redondeadas, le suaviza el borde y la guarda en PNG con alfa.

El alfa importa: sin él no hay reflejo ni sombra que siga la silueta, y la
foto se lee como una estampilla pegada encima del fondo.
"""
import sys
from PIL import Image, ImageDraw, ImageFilter

a = sys.argv[1:]
if len(a) < 2:
    sys.exit("uso: recorte.py <entrada> <salida.png> [--radio N] [--pluma N] [--alto N]")
ent, sal = a[0], a[1]
def opt(n, d):
    return int(a[a.index(n)+1]) if n in a else d
radio, pluma, alto = opt("--radio", 48), opt("--pluma", 2), opt("--alto", 0)

im = Image.open(ent).convert("RGBA")
if alto:
    im = im.resize((round(im.width*alto/im.height), alto), Image.LANCZOS)

m = Image.new("L", im.size, 0)
ImageDraw.Draw(m).rounded_rectangle([0, 0, im.width-1, im.height-1], radius=radio, fill=255)
if pluma:
    m = m.filter(ImageFilter.GaussianBlur(pluma))
im.putalpha(m)
im.save(sal)
print("  %s → %dx%d, radio %d, pluma %d" % (sal, im.width, im.height, radio, pluma))
