"""Recorte do apresentador (alpha) para o texto ATRÁS DA CABEÇA.

Usa RobustVideoMatting (PeterL1n, ONNX, recorrente = sem tremedeira entre quadros, cabelo bom) na GPU.
Saída: assets/matte.webm (VP9 com alpha, pixels ORIGINAIS do vídeo + alpha do RVM), alinhado quadro a quadro
com assets/clean.mp4. build-index.mjs liga sozinho quando o arquivo existe.

Rode na pasta do projeto:
  ~/.venvs/matte/Scripts/python ../../.claude/skills/vsl/scripts/matte.py [assets/clean.mp4] [assets/matte.webm]   (opcional: placa NVIDIA)
Opções (env): RVM_MODEL (padrão ~/.cache/vsl/rvm_resnet50_fp32.onnx), RVM_DOWNSAMPLE (0.25), RVM_CRF (24)
Sem GPU/venv: npx hyperframes remove-background assets/clean.mp4 -o assets/matte.webm  (u2net, mais tremido).
"""
import glob, os, site, subprocess, sys, json
import numpy as np

src = sys.argv[1] if len(sys.argv) > 1 else "assets/clean.mp4"
dst = sys.argv[2] if len(sys.argv) > 2 else "assets/matte.webm"
model = os.environ.get("RVM_MODEL", os.path.expanduser("~/.cache/vsl/rvm_resnet50_fp32.onnx"))
ds = float(os.environ.get("RVM_DOWNSAMPLE", "0.25"))
crf = os.environ.get("RVM_CRF", "24")

for base in site.getsitepackages():  # DLLs do CUDA/cuDNN instalados via pip (onnxruntime-gpu[cuda,cudnn])
    for d in glob.glob(os.path.join(base, "nvidia", "*", "bin")):
        os.add_dll_directory(d); os.environ["PATH"] = d + os.pathsep + os.environ["PATH"]
import onnxruntime as ort
try:
    ort.preload_dlls()
except Exception:
    pass

info = json.loads(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height,r_frame_rate,nb_frames",
                                  "-of", "json", src], capture_output=True, text=True).stdout)["streams"][0]
W, H = int(info["width"]), int(info["height"])
fps = info["r_frame_rate"]
sess = ort.InferenceSession(model, providers=["CUDAExecutionProvider", "CPUExecutionProvider"])
print("RVM", os.path.basename(model), "providers:", sess.get_providers(), f"{W}x{H}@{fps}", flush=True)

dec = subprocess.Popen(["ffmpeg", "-v", "error", "-i", src, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{W}x{H}", "-r", fps, "-i", "-",
                        "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "0", "-crf", crf, "-row-mt", "1", "-deadline", "good", "-cpu-used", "4",
                        "-auto-alt-ref", "0", "-metadata:s:v:0", "alpha_mode=1", dst], stdin=subprocess.PIPE)
rec = [np.zeros([1, 1, 1, 1], dtype=np.float32)] * 4
dr = np.array([ds], dtype=np.float32)
n = 0
fb = W * H * 3
while True:
    buf = dec.stdout.read(fb)
    if len(buf) < fb:
        break
    rgb = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
    x = (rgb.astype(np.float32) / 255.0).transpose(2, 0, 1)[None]
    fgr, pha, *rec = sess.run(None, {"src": x, "r1i": rec[0], "r2i": rec[1], "r3i": rec[2], "r4i": rec[3], "downsample_ratio": dr})
    a = np.clip(pha[0, 0] * 255.0 + 0.5, 0, 255).astype(np.uint8)
    enc.stdin.write(np.dstack([rgb, a]).tobytes())
    n += 1
    if n % 150 == 0:
        print(f"  {n} quadros", flush=True)
enc.stdin.close(); enc.wait(); dec.wait()
print(f"ok: {dst} ({n} quadros)")
