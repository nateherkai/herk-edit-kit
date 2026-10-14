#!/bin/bash
# sfx.sh <destino> — sintetiza los cuatro sonidos de una pieza minimalista.
# Se sintetizan en vez de usar stock por dos razones: quedan limpios (registro
# Apple, no biblioteca) y el PICO queda en una posición conocida, que es lo que
# hace falta para alinearlos — la investigación mide que el pico de un whoosh de
# biblioteca está a ~200 ms del inicio del archivo y nadie lo compensa.
OUT="${1:-.}"; mkdir -p "$OUT"

# aire · pico a 0.55 s · un barrido de ruido filtrado, no un "whoosh" de pack
ffmpeg -v error -y -f lavfi -i "anoisesrc=color=brown:duration=1.0:amplitude=0.5:seed=3" \
  -af "highpass=f=260,lowpass=f=2600,afade=t=in:st=0:d=0.55:curve=exp,afade=t=out:st=0.55:d=0.45:curve=exp,volume=0.9" \
  -ar 48000 -ac 2 "$OUT/aire.wav"

# click · pico a 0.006 s · transitorio corto, sin cola
ffmpeg -v error -y -f lavfi -i "sine=frequency=2100:duration=0.09:sample_rate=48000" \
  -f lavfi -i "anoisesrc=color=white:duration=0.09:amplitude=0.6:seed=11" \
  -filter_complex "[0:a]volume=0.55[t];[1:a]highpass=f=1800,volume=0.45[n];[t][n]amix=inputs=2:normalize=0,\
afade=t=out:st=0.006:d=0.075:curve=exp,volume=1.4" -ar 48000 -ac 2 "$OUT/click.wav"

# sub · pico a 0.02 s · el golpe grave del fogonazo, con transitorio arriba
ffmpeg -v error -y -f lavfi -i "sine=frequency=54:duration=1.5:sample_rate=48000" \
  -f lavfi -i "anoisesrc=color=pink:duration=1.5:amplitude=0.5:seed=5" \
  -filter_complex "[0:a]volume=1.0[s];[1:a]highpass=f=900,lowpass=f=7000,afade=t=out:st=0:d=0.12:curve=exp,volume=0.5[n];\
[s][n]amix=inputs=2:normalize=0,afade=t=in:st=0:d=0.02,afade=t=out:st=0.16:d=1.3:curve=exp,volume=1.3" \
  -ar 48000 -ac 2 "$OUT/sub.wav"

# cama · 8 s · dos graves en quinta, apenas audibles: sostienen la sala
ffmpeg -v error -y -f lavfi -i "sine=frequency=55:duration=8:sample_rate=48000" \
  -f lavfi -i "sine=frequency=82.5:duration=8:sample_rate=48000" \
  -f lavfi -i "anoisesrc=color=brown:duration=8:amplitude=0.35:seed=7" \
  -filter_complex "[0:a]volume=0.5[a];[1:a]volume=0.26[b];[2:a]lowpass=f=420,volume=0.28[c];\
[a][b][c]amix=inputs=3:normalize=0,tremolo=f=0.22:d=0.28,afade=t=in:st=0:d=1.2,volume=0.8" \
  -ar 48000 -ac 2 "$OUT/cama.wav"

# riser · 2.0 s · pico al final · es el J-cut hecho sonido: entra dos segundos
# antes de que cambie la imagen y prepara al oído para el corte
ffmpeg -v error -y -f lavfi -i "anoisesrc=color=white:duration=2.0:amplitude=0.45:seed=17" \
  -filter_complex "[0:a]highpass=f=300,lowpass=f=9000,\
afade=t=in:st=0:d=1.9:curve=exp,volume=0.85,\
aecho=0.8:0.6:60:0.25" -ar 48000 -ac 2 "$OUT/riser.wav"

for f in aire click sub cama riser; do
  printf "  %-6s %5.2fs  pico@ %s\n" "$f" \
    "$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT/$f.wav")" \
    "$(ffprobe -v error -f lavfi -i "amovie=$OUT/$f.wav,astats=metadata=1:reset=0" -show_entries frame_tags=lavfi.astats.Overall.Peak_level -of csv=p=0 2>/dev/null | tail -1)"
done
