#!/usr/bin/env python
"""Transcreve áudio localmente com faster-whisper e salva JSON de palavras.

Uso:
  python scripts/transcribe-whisper-local.py <entrada> [--output saida.json]
         [--model medium] [--language pt]

Saída: lista [{"text","start","end"}] no formato que a skill hyperframes
(references/captions.md) espera, mais "segments" com as frases.
"""
import argparse, json, sys
from pathlib import Path

ap = argparse.ArgumentParser()
ap.add_argument("input")
ap.add_argument("--output")
ap.add_argument("--model", default="medium")
ap.add_argument("--language", default="pt")
a = ap.parse_args()

import subprocess, numpy as np  # noqa: E402
from faster_whisper import WhisperModel  # noqa: E402

def load_audio(path):
    """Decodifica com ffmpeg para float32 mono 16 kHz (evita depender do PyAV)."""
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-f", "f32le", "-ac", "1",
         "-ar", "16000", "-"], check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32)

src = Path(a.input)
out = Path(a.output) if a.output else src.with_suffix(".whisper.json")
model = WhisperModel(a.model, device="cpu", compute_type="int8")
segments, info = model.transcribe(
    load_audio(src), language=a.language, word_timestamps=True,
    vad_filter=True, beam_size=5,
)
words, segs = [], []
for s in segments:
    segs.append({"text": s.text.strip(), "start": round(s.start, 3), "end": round(s.end, 3)})
    for w in (s.words or []):
        words.append({"text": w.word.strip(), "start": round(w.start, 3),
                      "end": round(w.end, 3), "prob": round(w.probability, 3)})
out.write_text(json.dumps({"language": info.language, "duration": round(info.duration, 3),
                           "words": words, "segments": segs}, ensure_ascii=False, indent=2),
               encoding="utf-8")
print(f"{len(words)} palavras, {len(segs)} frases -> {out}")
for s in segs:
    print(f"[{s['start']:6.2f} - {s['end']:6.2f}] {s['text']}")
