# Cut raw.mp4 by the SOUND of speech (not by -30 dB silence or Whisper word guesses): removes pauses AND breaths,
# keeps word tails, and snaps every editorial cut (keeps.json from/to) to the nearest energy valley so no word is clipped.
# Run inside <project>/assets with the whisper venv python (numpy):  python tight-cut.py [out.mp4]
# Inputs: raw.mp4, keeps.json ({keeps:[{from,to,why}]}).  Outputs: cut.mp4 (default), tight-segments.json
import json, subprocess, sys


def video_encoder():
    """Fastest H.264 encoder that really works here (GPU / Quick Sync / AMD / Apple), else libx264 ultrafast."""
    for name, args in [("h264_nvenc", ["-preset", "p4", "-rc", "vbr", "-cq", "20", "-b:v", "0"]),
                       ("h264_qsv", ["-global_quality", "22"]),
                       ("h264_amf", ["-quality", "balanced", "-rc", "cqp", "-qp_i", "20", "-qp_p", "22"]),
                       ("h264_videotoolbox", ["-b:v", "14M"])]:
        probe = subprocess.run(["ffmpeg", "-v", "error", "-f", "lavfi", "-i", "color=c=black:s=320x320:d=0.2",
                                "-pix_fmt", "yuv420p", "-c:v", name, *args, "-f", "null", "-"], capture_output=True)
        if probe.returncode == 0:
            return ["-c:v", name, *args]
    return ["-c:v", "libx264", "-preset", "ultrafast", "-crf", "18"]
import numpy as np

OUT = sys.argv[1] if len(sys.argv) > 1 else "cut.mp4"
SR, HOP, WIN = 16000, 160, 480                   # 10 ms frames, 30 ms analysis window
LEAD, TAIL = 0.06, 0.14                          # keep before first / after last speech frame (TAIL protects final "s")
HOLE, ISLAND = 0.20, 0.07                        # close dips shorter than HOLE; drop speech blips shorter than ISLAND

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
# voiced speech: loud enough AND low-frequency dominant. Breaths / mouth noise are high-frequency or too quiet.
sp = ((db > -33) & (tilt > 12)) | ((db > -26) & (tilt > 0))

def runs(mask):
    out, i = [], 0
    while i < len(mask):
        if mask[i]:
            j = i
            while j < len(mask) and mask[j]: j += 1
            out.append([i, j]); i = j
        else: i += 1
    return out

r = runs(sp)
merged = []
for s, e in r:                                      # close short dips inside a phrase
    if merged and (s - merged[-1][1]) * 0.01 < HOLE: merged[-1][1] = e
    else: merged.append([s, e])
regions = [(s * 0.01, e * 0.01) for s, e in merged if (e - s) * 0.01 >= ISLAND]

def valley(t, before=0.15, after=0.03):              # quietest frame near a cut point, searching OUTWARD from the kept text
    i0, i1 = max(0, int((t - before) * 100)), min(n, int((t + after) * 100))
    return (i0 + int(np.argmin(db[i0:i1]))) * 0.01 if i1 > i0 else t

keeps = json.load(open("keeps.json", encoding="utf-8"))["keeps"]
segs = []
for k in keeps:
    if k.get("raw"):                                # keep the span as-is (soft word onsets the detector would drop, e.g. a breathy "Se")
        segs.append([k["from"], k["to"]]); continue
    k0, k1 = valley(k["from"], 0.15, 0.03), valley(k["to"], 0.03, 0.15)
    for s, e in regions:
        if e <= k0 or s >= k1: continue
        segs.append([max(k0, s - LEAD), min(k1, e + TAIL)])
segs.sort()
final = []
for s, e in segs:
    if final and s - final[-1][1] < 0.08: final[-1][1] = max(final[-1][1], e)
    else: final.append([s, e])

parts, labels = [], []
for i, (s, e) in enumerate(final):
    d = e - s
    parts.append(f"[0:v]trim={s:.3f}:{e:.3f},setpts=PTS-STARTPTS[v{i}];"
                 f"[0:a]atrim={s:.3f}:{e:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.008,afade=t=out:st={max(0, d - 0.012):.3f}:d=0.012[a{i}];")
    labels.append(f"[v{i}][a{i}]")
fc = "".join(parts) + "".join(labels) + f"concat=n={len(final)}:v=1:a=1[v][a]"
open("tight-filter.txt", "w").write(fc)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "raw.mp4", "-filter_complex_script", "tight-filter.txt", "-map", "[v]", "-map", "[a]",
                *video_encoder(), "-r", "30", "-c:a", "aac", "-b:a", "192k", OUT], check=True)
json.dump([{"from": round(s, 3), "to": round(e, 3)} for s, e in final], open("tight-segments.json", "w"), indent=0)
tot = sum(e - s for s, e in final)
print(f"segments={len(final)} duration={tot:.2f}s -> {OUT}")
