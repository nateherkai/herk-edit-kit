"""Rastreia BOCA e rosto em clean.mp4 (MediaPipe Face Landmarker) → assets/face-track.json.

Usado pela legenda que segue a boca (K.mouthCaps) e pode alimentar o HUD do rosto.
Cada quadro: [t, bocaX, bocaY, larguraBoca, queixoY, testaY, rostoX0, rostoX1] em pixels do VÍDEO-FONTE (1080×1920),
suavizado (média móvel exponencial). Quadro sem rosto repete o último valor.
Rode em <projeto>:  ~/.venvs/whisper/Scripts/python ../../.claude/skills/vsl/scripts/track-mouth.py [assets/clean.mp4] [assets/face-track.json]
(o instalador põe mediapipe + opencv no venv do whisper; o modelo face_landmarker.task é baixado na 1ª vez)
"""
import json, os, sys, urllib.request
import cv2, mediapipe as mp
from mediapipe.tasks.python import vision, BaseOptions

src = sys.argv[1] if len(sys.argv) > 1 else "assets/clean.mp4"
out = sys.argv[2] if len(sys.argv) > 2 else "assets/face-track.json"
MODEL = os.path.expanduser("~/.venvs/whisper/models/face_landmarker.task")
if not os.path.exists(MODEL):
    os.makedirs(os.path.dirname(MODEL), exist_ok=True)
    urllib.request.urlretrieve("https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task", MODEL)
opts = vision.FaceLandmarkerOptions(base_options=BaseOptions(model_asset_path=MODEL),
                                    running_mode=vision.RunningMode.VIDEO, num_faces=1, min_face_detection_confidence=0.4, min_tracking_confidence=0.4)
det = vision.FaceLandmarker.create_from_options(opts)
cap = cv2.VideoCapture(src); fps = cap.get(cv2.CAP_PROP_FPS) or 30; W = int(cap.get(3)); H = int(cap.get(4))
rows, last, sm, i = [], None, None, 0
A = 0.35  # suavização (0 = parado, 1 = cru)
while True:
    ok, img = cap.read()
    if not ok: break
    r = det.detect_for_video(mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(img, cv2.COLOR_BGR2RGB)), int(i * 1000 / fps))
    if r.face_landmarks:
        L = r.face_landmarks[0]
        P = lambda k: (L[k].x * W, L[k].y * H)
        (ux, uy), (lx, ly) = P(13), P(14)
        (cx0, _), (cx1, _) = P(61), P(291)
        xs = [p.x * W for p in L]
        cur = [(ux + lx) / 2, (uy + ly) / 2, abs(cx1 - cx0), P(152)[1], P(10)[1], min(xs), max(xs)]
        last = cur
    cur = last
    if cur is not None:
        sm = cur if sm is None else [s + A * (c - s) for s, c in zip(sm, cur)]
        rows.append([round(i / fps, 3)] + [round(v, 1) for v in sm])
    i += 1
json.dump({"fps": fps, "w": W, "h": H, "cols": ["t", "mx", "my", "mw", "chin", "top", "x0", "x1"], "rows": rows}, open(out, "w"))
print(f"{len(rows)} quadros com rosto de {i} -> {out}")
