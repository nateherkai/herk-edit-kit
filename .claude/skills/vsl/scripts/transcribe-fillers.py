"""Transcrição que NÃO esconde vícios de fala ("éé", "ãã", "hum").

O Whisper normalmente apaga hesitações. Com um initial_prompt cheio delas ele passa a transcrevê-las, e o corte
(tight-jl-cut.py) consegue remover cada uma. Saída no formato do kit: {"words":[{text,start,end}], "audio_duration_secs"}.
Uso (venv do whisper):  python transcribe-fillers.py assets/raw.mp4 assets/raw-fillers.json [--model DIR]
"""
import argparse, glob, json, os, site

ap = argparse.ArgumentParser()
ap.add_argument("media"); ap.add_argument("out")
ap.add_argument("--model", default=os.environ.get("WHISPER_MODEL", "medium"))  # modelo baixado pelo instalador
a = ap.parse_args()
for base in site.getsitepackages():
    for d in glob.glob(os.path.join(base, "nvidia", "*", "bin")):
        os.add_dll_directory(d); os.environ["PATH"] = d + os.pathsep + os.environ["PATH"]
from faster_whisper import WhisperModel
try:
    m = WhisperModel(a.model, device="cuda", compute_type="float16")
except Exception:
    m = WhisperModel(a.model, device="cpu", compute_type="int8")
prompt = "Éé, então, ããã, hum, é... tipo, éé, eh, ah, né, ããã, hum. Umm, éé."
segs, info = m.transcribe(a.media, language="pt", word_timestamps=True, initial_prompt=prompt,
                          condition_on_previous_text=False, vad_filter=False, beam_size=5)
words = []
for s in segs:
    for w in s.words or []:
        words.append({"text": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3)})
json.dump({"audio_duration_secs": round(info.duration, 3), "words": words}, open(a.out, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
print(f"{len(words)} palavras -> {a.out}")
