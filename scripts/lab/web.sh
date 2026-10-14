#!/bin/bash
# web.sh <master.mp4> [salida.mp4] — deja el video bajo el límite de subida (30 MiB)
# sin tocar el audio. Busca el CRF más bajo (mejor calidad) que entre.
set -u
IN="$1"; OUT="${2:-${1%.*}-web.mp4}"; LIM=$((29*1024*1024))
for Q in 17 19 20 22 24 26; do
  ffmpeg -v error -y -i "$IN" -c:v libx264 -crf $Q -preset slow -pix_fmt yuv420p \
         -c:a copy -movflags +faststart "$OUT"
  S=$(stat -f%z "$OUT")
  echo "  crf $Q → $((S/1048576)) MB"
  [ "$S" -lt "$LIM" ] && { echo "  → $OUT"; exit 0; }
done
echo "  ⚠ ni con crf 26 entra: acortá la pieza o bajá el grano"
