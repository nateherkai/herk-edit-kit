"""Corte apertado + sem "ééé" + cortes J/L, numa passada só.

1. Detecta fala pelo SOM (energia + inclinação espectral): pausas e RESPIRAÇÕES saem, finais de palavra ficam.
2. Remove vícios de fala listados em raw-fillers.json (transcribe-fillers.py):
   - hesitação pura ("ãã", "hum", "éé", "eh"...) → sai inteira;
   - conjunção esticada ("e", "é", "a", "um" com mais de 0,45 s) → fica só o começo (0,14 s), o resto do "eeee" sai.
   Ajuste manual em fillers.json: {"cut": [[ini, fim], ...], "keep": [ini, ...], "force": [[ini, fim], ...]} (tempos do raw;
   "force" mantém um som que não é voz — estalo de dedo, palma — dentro de um keep).
3. Cortes J/L: em cada ponto de edição real a IMAGEM corta JL quadros antes/depois do SOM, alternando
   J (som da próxima frase entra antes) e L (imagem da próxima frase chega antes).
Rode em <projeto>/assets com o python do venv whisper:  python tight-jl-cut.py [--jl 4] [--out clean.mp4]
Entradas: raw.mp4, keeps.json, raw-fillers.json (opcional), fillers.json (opcional).
Saídas: clean.mp4, edit-decisions.json, fillers-removed.txt
"""
import json, os, subprocess, sys, unicodedata
import numpy as np

args = sys.argv[1:]
JL = int(args[args.index("--jl") + 1]) if "--jl" in args else 4
OUT = args[args.index("--out") + 1] if "--out" in args else "clean.mp4"
FPS = 30
SR, HOP, WIN = 16000, 160, 480
LEAD, TAIL = 0.06, 0.14
HOLE, ISLAND = 0.20, 0.07
fr = lambda t: round(t * FPS) / FPS

subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "raw.mp4", "-vn", "-ac", "1", "-ar", str(SR), "-f", "s16le", "raw16.pcm"], check=True)
a = np.fromfile("raw16.pcm", dtype=np.int16).astype(np.float32) / 32768
n = (len(a) - WIN) // HOP
f = np.fft.rfftfreq(WIN, 1 / SR); lo_b = (f > 80) & (f < 900); hi_b = (f > 2000) & (f < 7000); hann = np.hanning(WIN)
db = np.empty(n); tilt = np.empty(n)
for i in range(n):
    x = a[i * HOP:i * HOP + WIN]
    db[i] = 20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-9)
    X = np.abs(np.fft.rfft(x * hann)) ** 2
    tilt[i] = 10 * np.log10((X[lo_b].sum() + 1e-12) / (X[hi_b].sum() + 1e-12))
sp = ((db > -33) & (tilt > 12)) | ((db > -26) & (tilt > 0))

# ---- vícios de fala viram "silêncio" forçado
def nz(s): return "".join(c for c in unicodedata.normalize("NFD", s.lower()) if c.isalpha())
cuts = []
if os.path.exists("raw-fillers.json"):
    for w in json.load(open("raw-fillers.json", encoding="utf-8"))["words"]:
        t, d = nz(w["text"]), w["end"] - w["start"]
        pure = t in ("aa", "aaa", "ee", "eee", "eh", "ah", "hum", "hm", "uh", "umm", "mm") or (len(t) > 1 and len(set(t)) == 1)
        if pure: cuts.append([w["start"], w["end"], w["text"]])
        elif t in ("e", "a", "um", "o") and 0.45 < d < 1.6: cuts.append([w["start"] + 0.14, w["end"], w["text"] + " (esticado)"])
manual = json.load(open("fillers.json", encoding="utf-8")) if os.path.exists("fillers.json") else {}
keep_t = manual.get("keep", [])
cuts = [c for c in cuts if not any(abs(c[0] - k) < 0.3 for k in keep_t)] + [[x, y, "manual"] for x, y in manual.get("cut", [])]
for s, e, _ in cuts:
    sp[max(0, int(s * 100)):min(n, int(e * 100))] = False
for s, e in manual.get("force", []):  # sons curtos que o detector de voz descarta (estalo de dedo, palma)
    sp[max(0, int(s * 100)):min(n, int(e * 100))] = True
open("fillers-removed.txt", "w", encoding="utf-8").write("\n".join(f"{s:.2f}-{e:.2f}  {w}" for s, e, w in cuts))

def runs(mask):
    out, i = [], 0
    while i < len(mask):
        if mask[i]:
            j = i
            while j < len(mask) and mask[j]: j += 1
            out.append([i, j]); i = j
        else: i += 1
    return out
merged = []
for s, e in runs(sp):
    if merged and (s - merged[-1][1]) * 0.01 < HOLE and not any(merged[-1][1] * 0.01 <= c[0] + 0.02 and c[1] - 0.02 <= s * 0.01 for c in cuts):
        merged[-1][1] = e
    else: merged.append([s, e])
regions = [(s * 0.01, e * 0.01) for s, e in merged if (e - s) * 0.01 >= ISLAND]

def valley(t, before=0.15, after=0.03):
    i0, i1 = max(0, int((t - before) * 100)), min(n, int((t + after) * 100))
    return (i0 + int(np.argmin(db[i0:i1]))) * 0.01 if i1 > i0 else t
keeps = json.load(open("keeps.json", encoding="utf-8"))["keeps"]
segs = []
for k in keeps:
    k0, k1 = valley(k["from"], 0.15, 0.03), valley(k["to"], 0.03, 0.15)
    for s, e in regions:
        if e <= k0 or s >= k1: continue
        segs.append([max(k0, s - LEAD), min(k1, e + TAIL)])
segs.sort()
final = []
for s, e in segs:
    if final and s - final[-1][1] < 0.08: final[-1][1] = max(final[-1][1], e)
    else: final.append([s, e])
final = [[fr(s), fr(e)] for s, e in final if fr(e) - fr(s) >= 2 / FPS]

# ---- J/L: imagem desloca JL quadros no ponto de edição (só onde houve corte de verdade)
d = JL / FPS
v = [[s, e] for s, e in final]
flip = 0
for i in range(len(final) - 1):
    if final[i + 1][0] - final[i][1] < 0.25 or d == 0: continue
    if flip % 2 == 0: v[i][1] += d; v[i + 1][0] += d     # J
    else: v[i][1] -= d; v[i + 1][0] -= d                # L
    flip += 1
parts = []
for i, ((s, e), (vs, ve)) in enumerate(zip(final, v)):
    dur = e - s
    parts.append(f"[0:v]trim={vs:.4f}:{ve:.4f},setpts=PTS-STARTPTS[v{i}];"
                 f"[0:a]atrim={s:.4f}:{e:.4f},asetpts=PTS-STARTPTS,afade=t=in:d=0.008,afade=t=out:st={max(0, dur - 0.012):.3f}:d=0.012[a{i}];")
N = len(final)
fc = "".join(parts) + "".join(f"[v{i}]" for i in range(N)) + f"concat=n={N}:v=1:a=0[v];" + "".join(f"[a{i}]" for i in range(N)) + f"concat=n={N}:v=0:a=1[a]"
open("tight-filter.txt", "w").write(fc)
def _enc(v):
    return ["ffmpeg", "-v", "error", "-y", "-i", "raw.mp4", "-filter_complex_script", "tight-filter.txt", "-map", "[v]", "-map", "[a]",
            *v, "-g", str(FPS), "-r", str(FPS), "-c:a", "aac", "-b:a", "192k", "-shortest", OUT]
if subprocess.run(_enc(["-c:v", "h264_nvenc", "-preset", "p5", "-cq", "18"])).returncode != 0:  # sem placa NVIDIA -> CPU
    subprocess.run(_enc(["-c:v", "libx264", "-preset", "veryfast", "-crf", "18"]), check=True)
out, dec = 0.0, []
for (s, e), (vs, ve) in zip(final, v):
    dec.append({"source_start": s, "source_end": e, "video_start": round(vs, 3), "video_end": round(ve, 3), "output_start": round(out, 3), "output_end": round(out + e - s, 3)})
    out += e - s
json.dump({"source": "assets/raw.mp4", "fps": FPS, "jl_frames": JL, "duration": round(out, 3), "fillers_removed": len(cuts), "segments": dec}, open("edit-decisions.json", "w"), indent=1)
print(f"segmentos={N} cortes J/L={flip} vícios removidos={len(cuts)} duração={out:.2f}s -> {OUT}")
