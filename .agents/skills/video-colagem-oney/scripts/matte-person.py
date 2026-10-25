# Cut the presenter out of the edited video so graphics can sit BEHIND them (efeito "atrás de mim").
# Run inside <project>/assets:
#   ~/.venvs/whisper/Scripts/python (Mac: ~/.venvs/whisper/bin/python) <skill>/scripts/matte-person.py clean.mp4 fg.webm
# Model: Robust Video Matting (temporal, no flicker) — ~/.models/rvm_mobilenetv3_fp32.onnx, downloaded on first use
#   (https://github.com/PeterL1n/RobustVideoMatting/releases/download/v1.0.0/rvm_mobilenetv3_fp32.onnx)
# Output: <out>.webm — VP8 with alpha (person opaque, everything else transparent), same frames/fps as input,
#         plus <out>-matte.mp4 (grayscale matte) to eyeball the edges.
import json, subprocess, sys, time
import numpy as np
import onnxruntime as ort

src, out = sys.argv[1], sys.argv[2]
import os, urllib.request
MODEL = os.path.join(os.path.expanduser("~"), ".models", "rvm_mobilenetv3_fp32.onnx")
if not os.path.exists(MODEL):  # first use: download Robust Video Matting (~15 MB)
    os.makedirs(os.path.dirname(MODEL), exist_ok=True)
    print("baixando o modelo de recorte (só na primeira vez)...", flush=True)
    urllib.request.urlretrieve("https://github.com/PeterL1n/RobustVideoMatting/releases/download/v1.0.0/rvm_mobilenetv3_fp32.onnx", MODEL)
DOWN = float(sys.argv[3]) if len(sys.argv) > 3 else 0.25  # 0.25 for 1080x1920 portrait

info = json.loads(subprocess.check_output(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
    "stream=width,height,r_frame_rate", "-of", "json", src]))["streams"][0]
W, H, fps = info["width"], info["height"], info["r_frame_rate"]

sess = ort.InferenceSession(MODEL, providers=["CPUExecutionProvider"])
rec = [np.zeros([1, 1, 1, 1], np.float32)] * 4
ds = np.array([DOWN], np.float32)

dec = subprocess.Popen(["ffmpeg", "-v", "error", "-i", src, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{W}x{H}", "-r", fps, "-i", "-",
    "-c:v", "libvpx", "-pix_fmt", "yuva420p", "-auto-alt-ref", "0", "-b:v", "6M", "-crf", "12", "-deadline", "good", "-cpu-used", "4",
    "-metadata:s:v:0", "alpha_mode=1", out], stdin=subprocess.PIPE)
mat = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "gray", "-s", f"{W}x{H}", "-r", fps, "-i", "-",
    "-c:v", "libx264", "-crf", "20", "-pix_fmt", "yuv420p", out.rsplit(".", 1)[0] + "-matte.mp4"], stdin=subprocess.PIPE)

n, t0 = 0, time.time()
while True:
    buf = dec.stdout.read(W * H * 3)
    if len(buf) < W * H * 3:
        break
    rgb = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
    x = (rgb.astype(np.float32) / 255.0).transpose(2, 0, 1)[None]
    fgr, pha, *rec = sess.run(None, {"src": x, "r1i": rec[0], "r2i": rec[1], "r3i": rec[2], "r4i": rec[3], "downsample_ratio": ds})
    a = (np.clip(pha[0, 0], 0, 1) * 255).astype(np.uint8)
    enc.stdin.write(np.dstack([rgb, a]).tobytes())  # original pixels, matte as alpha (no colour spill change)
    mat.stdin.write(a.tobytes())
    n += 1
    if n % 150 == 0:
        print(f"{n} frames  {n / (time.time() - t0):.1f} fps", flush=True)

for p in (enc, mat):
    p.stdin.close(); p.wait()
print(f"DONE {n} frames -> {out}")
