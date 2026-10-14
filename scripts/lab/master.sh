#!/bin/bash
# master.sh <entrada.mp4> [salida.mp4]
# Deja el audio en -16 LUFS con el pico real bajo -1.4 dBTP. El video se COPIA.
#
# Por qué dos pases: loudnorm necesita medir antes de corregir.
# Por qué un limitador aparte: loudnorm controla el pico de MUESTRA, pero el
# encoder AAC reconstruye picos ENTRE muestras y se pasa. El sobrepico depende
# del contenido (el ruido de banda ancha se pasa más), así que el límite no se
# adivina: se verifica y se corrige.
set -u
IN="$1"; OUT="${2:-${1%.*}-master.mp4}"

M=$(ffmpeg -hide_banner -nostats -i "$IN" -af loudnorm=I=-16:TP=-1.5:LRA=13:print_format=json -f null - 2>&1 \
    | sed -n '/^{/,/^}/p')
get(){ echo "$M" | grep "\"$1\"" | sed 's/.*: *"\([^"]*\)".*/\1/'; }
I=$(get input_i); TP=$(get input_tp); LRA=$(get input_lra)
TH=$(get input_thresh); OFF=$(get target_offset)
echo "  entrada: ${I} LUFS · pico ${TP} dBTP · LRA ${LRA}"

LIM=0.70
render(){
  ffmpeg -v error -y -i "$IN" -c:v copy \
    -af "loudnorm=I=-16:TP=-1.5:LRA=13:measured_I=${I}:measured_TP=${TP}:measured_LRA=${LRA}:measured_thresh=${TH}:offset=${OFF}:linear=false,alimiter=limit=${LIM}:level=false" \
    -c:a aac -b:a 192k "$OUT"
}
medir(){
  ffmpeg -hide_banner -nostats -i "$OUT" -af loudnorm=I=-16:TP=-1.5:print_format=summary -f null - 2>&1 \
    | grep "Input True Peak" | grep -oE -- '-?[0-9]+\.[0-9]+' | tail -1
}

render
for _ in 1 2 3; do
  TPO=$(medir)
  [ -z "$TPO" ] && break
  if python3 -c "import sys; sys.exit(0 if float('$TPO') <= -1.4 else 1)"; then break; fi
  LIM=$(python3 -c "print(round(${LIM} * 0.78, 3))")
  echo "  pico en ${TPO} dBTP · bajando el limitador a ${LIM}"
  render
done

ffmpeg -hide_banner -nostats -i "$OUT" -af loudnorm=I=-16:TP=-1.5:print_format=summary -f null - 2>&1 \
  | grep -E "Input (Integrated|True Peak)" | sed 's/Input/  salida:/'
echo "  → $OUT"
