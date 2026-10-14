#!/bin/bash
# fluidez.sh <video…> — mide cuánto cambia cada cuadro respecto del anterior.
# El motor captura por seek: si un tramo no cambia, el ojo lo lee como "lento".
for f in "$@"; do
  ffmpeg -v error -i "$f" -vf "tblend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-" \
    -f null - 2>/dev/null | grep -o 'YAVG=[0-9.]*' | cut -d= -f2 > /tmp/_fl.txt
  python3 - "$f" <<'PY'
import sys
vals=[float(x) for x in open('/tmp/_fl.txt') if x.strip()]
if not vals: print("sin datos"); raise SystemExit
n=len(vals); dead=sum(1 for v in vals if v<0.35)
print(f"{sys.argv[1]}")
print(f"  {n} cuadros · movimiento medio {sum(vals)/n:.2f} · quietos {dead/n*100:.0f}%")
step=max(1,n//24)
print('  '+''.join('█' if (m:=sum(vals[i:i+step])/len(vals[i:i+step]))>2 else '▓' if m>1 else '▒' if m>.35 else '·'
                   for i in range(0,n,step)))
PY
done
