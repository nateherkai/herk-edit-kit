"""Troca trechos de clean.mp4 por clipes editados na Higgsfield (roupa/cenário), colando a CABEÇA ORIGINAL por cima.

Uso (na pasta do projeto, venv do whisper — precisa de numpy):
  python splice-hf.py --out assets/clean-hf.mp4 --span 16.30 26.06 assets/hf/medico-edit.mp4 --span 26.06 40.24 assets/hf/advogado-edit.mp4 ...
Opções: --no-head (não cola a cabeça) --feather 14 --grow 1.25 --test (só o primeiro span, para conferir)

Cabeça = alpha do matte.webm × elipse em volta do rosto (assets/face-track.json: top, chin, x0, x1 por quadro),
suavizada. Onde a máscara é 1 fica o quadro original; onde é 0 fica o quadro da Higgsfield.
O clipe da Higgsfield é alinhado pelo INÍCIO do span; se for mais curto, o último quadro é segurado.
"""
import argparse, json, os, subprocess, sys, tempfile
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument("--src", default="assets/clean.mp4")
ap.add_argument("--matte", default="assets/matte.webm")
ap.add_argument("--track", default="assets/face-track.json")
ap.add_argument("--out", default="assets/clean-hf.mp4")
ap.add_argument("--span", nargs=3, action="append", metavar=("INI", "FIM", "CLIPE"), required=True)
ap.add_argument("--no-head", action="store_true", help="não cola nada do original (fica o rosto da IA)")
ap.add_argument("--head", action="store_true", help="cola a cabeça inteira (alpha do matte × elipse); padrão é só o rosto")
ap.add_argument("--feather", type=float, default=18)
ap.add_argument("--grow", type=float, default=1.25, help="(modo --head) fator da elipse em volta da cabeça")
ap.add_argument("--fx", type=float, default=0.80, help="(modo rosto) largura da elipse do rosto, fração da meia-largura x0..x1")
ap.add_argument("--fy", type=float, default=0.66, help="(modo rosto) altura da elipse, fração da meia-altura top..chin")
ap.add_argument("--test", action="store_true")
a = ap.parse_args()
W, H, FPS = 1080, 1920, 30


def dur(p):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p]).decode().strip())


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if r.returncode:
        sys.exit(f"ffmpeg falhou:\n{' '.join(cmd)}\n{r.stderr[-3000:]}")


track = json.load(open(a.track, encoding="utf-8"))
cols = track["cols"]; rows = track["rows"]
ci = {c: i for i, c in enumerate(cols)}


def head_at(t):
    i = min(len(rows) - 1, max(0, int(round(t * FPS))))
    r = rows[i]
    return r[ci["x0"]], r[ci["x1"]], r[ci["top"]], r[ci["chin"]]


def ellipse_frames(t0, t1, path):
    """escreve rawvideo gray 1080x1920 com a elipse da cabeça, quadro a quadro (fonte da máscara)."""
    n = int(round((t1 - t0) * FPS))
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    with open(path, "wb") as f:
        for k in range(n):
            x0, x1, top, chin = head_at(t0 + k / FPS)
            if a.head:
                cx, cy = (x0 + x1) / 2, (top + chin) / 2 - (chin - top) * 0.04
                rx, ry = (x1 - x0) / 2 * a.grow, (chin - top) / 2 * a.grow
            else:  # só o rosto: elipse por dentro do contorno da cabeça (testa → queixo), cabelo e contorno ficam da IA
                cx, cy = (x0 + x1) / 2, (top + chin) / 2 + (chin - top) * 0.12
                rx, ry = (x1 - x0) / 2 * a.fx, (chin - top) / 2 * a.fy
            d = ((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2
            m = np.clip((1.08 - d) / 0.16, 0, 1)  # borda já meio suave; o gblur termina
            f.write((m * 255).astype(np.uint8).tobytes())
    return n


spans = [(float(s), float(e), c) for s, e, c in a.span]
spans.sort()
if a.test:
    spans = spans[:1]
total = dur(a.src)
tmp = tempfile.mkdtemp(prefix="splice-")
parts = []
cursor = 0.0


def seg_src(t0, t1, out):
    run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t0:.3f}", "-to", f"{t1:.3f}", "-i", a.src, "-an", "-r", str(FPS),
         "-c:v", "libx264", "-preset", "fast", "-crf", "14", "-g", "30", "-pix_fmt", "yuv420p", out])


for i, (t0, t1, clip) in enumerate(spans):
    if t0 > cursor + 0.001:
        p = os.path.join(tmp, f"orig{i}.mp4"); seg_src(cursor, t0, p); parts.append(p)
    n = int(round((t1 - t0) * FPS))
    out = os.path.join(tmp, f"hf{i}.mp4")
    cd = dur(clip)
    pad = max(0.0, (t1 - t0) - cd + 0.05)
    base = f"[1:v]fps={FPS},scale={W}:{H}:flags=lanczos,setsar=1,tpad=stop_mode=clone:stop_duration={pad:.3f},trim=duration={t1 - t0:.3f},setpts=PTS-STARTPTS[kl]"
    if a.no_head:
        run(["ffmpeg", "-v", "error", "-y", "-i", a.src, "-i", clip, "-filter_complex", base + ";[kl]format=yuv420p[v]",
             "-map", "[v]", "-an", "-c:v", "libx264", "-preset", "fast", "-crf", "14", "-g", "30", "-pix_fmt", "yuv420p", out])
    else:
        ell = os.path.join(tmp, f"ell{i}.raw"); ellipse_frames(t0, t1, ell)
        # maskedmerge precisa de formatos PLANARES iguais nos 3 lados: gbrp (rgb24 empacotado sai em cinza)
        if a.head:
            mask = (f";[2:v]trim=start={t0:.3f}:end={t1:.3f},setpts=PTS-STARTPTS,fps={FPS},format=rgba,alphaextract,format=gray[ma]"
                    f";[3:v]gblur=sigma={a.feather},format=gray[el]"
                    f";[ma][el]blend=all_mode=multiply,format=gray,format=gbrp[mask]")
            inputs = ["-i", a.src, "-i", clip, "-c:v", "libvpx-vp9", "-i", a.matte,
                      "-f", "rawvideo", "-pix_fmt", "gray", "-s", f"{W}x{H}", "-r", str(FPS), "-i", ell]
        else:
            mask = f";[2:v]gblur=sigma={a.feather},format=gray,format=gbrp[mask]"
            inputs = ["-i", a.src, "-i", clip, "-f", "rawvideo", "-pix_fmt", "gray", "-s", f"{W}x{H}", "-r", str(FPS), "-i", ell]
        fc = (base +
              f";[0:v]trim=start={t0:.3f}:end={t1:.3f},setpts=PTS-STARTPTS,fps={FPS},format=gbrp[orig]"
              + mask +
              f";[kl]format=gbrp[klr];[klr][orig][mask]maskedmerge,format=yuv420p[v]")
        run(["ffmpeg", "-v", "error", "-y", *inputs,
             "-filter_complex", fc, "-map", "[v]", "-an", "-frames:v", str(n),
             "-c:v", "libx264", "-preset", "fast", "-crf", "14", "-g", "30", "-pix_fmt", "yuv420p", out])
        os.remove(ell)
    parts.append(out)
    cursor = t1
    print(f"span {t0:.2f}-{t1:.2f} <- {os.path.basename(clip)} (clipe {cd:.2f}s, pad {pad:.2f}s)")
if cursor < total - 0.001:
    p = os.path.join(tmp, "tail.mp4"); seg_src(cursor, total, p); parts.append(p)

lst = os.path.join(tmp, "list.txt")
with open(lst, "w", encoding="utf-8") as f:
    for p in parts:
        f.write(f"file '{p.replace(os.sep, '/')}'\n")
run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-i", a.src, "-map", "0:v", "-map", "1:a",
     "-c:v", "libx264", "-preset", "medium", "-crf", "16", "-g", "30", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
     "-movflags", "+faststart", "-shortest", a.out])
print(f"pronto: {a.out} ({dur(a.out):.2f}s; fonte {total:.2f}s)")
