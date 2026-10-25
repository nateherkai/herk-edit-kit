# cut people out of still photos with RVM (same model as matte-person.py). usage: python cutout.py in.jpg out.png
import sys, subprocess, json, numpy as np, onnxruntime as ort
src, out = sys.argv[1], sys.argv[2]
i = json.loads(subprocess.check_output(["ffprobe","-v","error","-select_streams","v:0","-show_entries","stream=width,height","-of","json",src]))["streams"][0]
W, H = i["width"], i["height"]
rgb = np.frombuffer(subprocess.check_output(["ffmpeg","-v","error","-i",src,"-f","rawvideo","-pix_fmt","rgb24","-"]), np.uint8).reshape(H, W, 3)
import os, urllib.request
MODEL = os.path.join(os.path.expanduser("~"), ".models", "rvm_mobilenetv3_fp32.onnx")
if not os.path.exists(MODEL):  # first use: download Robust Video Matting (~15 MB)
    os.makedirs(os.path.dirname(MODEL), exist_ok=True)
    print("baixando o modelo de recorte (só na primeira vez)...", flush=True)
    urllib.request.urlretrieve("https://github.com/PeterL1n/RobustVideoMatting/releases/download/v1.0.0/rvm_mobilenetv3_fp32.onnx", MODEL)
s = ort.InferenceSession(MODEL, providers=["CPUExecutionProvider"])
rec = [np.zeros([1,1,1,1], np.float32)]*4; x = (rgb.astype(np.float32)/255).transpose(2,0,1)[None]
ds = np.array([min(1.0, 512/max(W,H))], np.float32)
for _ in range(4):  # let the recurrent state settle on the still
    fgr, pha, *rec = s.run(None, {"src": x, "r1i": rec[0], "r2i": rec[1], "r3i": rec[2], "r4i": rec[3], "downsample_ratio": ds})
a = (np.clip(pha[0,0],0,1)*255).astype(np.uint8)
p = subprocess.Popen(["ffmpeg","-v","error","-y","-f","rawvideo","-pix_fmt","rgba","-s",f"{W}x{H}","-i","-",out], stdin=subprocess.PIPE)
p.stdin.write(np.dstack([rgb,a]).tobytes()); p.stdin.close(); p.wait(); print("ok", out)
