"""Local word-level transcription with faster-whisper, tuned for slow PCs.

Writes the kit's transcript shape: {"words": [{text,start,end}], "audio_duration_secs"}.

Usage:
  python transcribe-local-whisper.py <media> <out.json>              # captions quality
  python transcribe-local-whisper.py <media> <out.json> --fast       # raw take, only to choose the cut
  python transcribe-local-whisper.py <media> --windows 12.4,30.1,... # check splices: text of a 3 s window
                                                                      # around each time, ONE model load
Options: --model NAME_OR_DIR (env WHISPER_MODEL) · --lang pt · --span 3

Speed rules (measured on CPU, 1 min of speech, 4 threads):
  medium beam 5 = 19.5 s · medium beam 1 = 14.5 s · small beam 1 = 5.5 s (base is too inaccurate for PT)
  With an NVIDIA GPU everything uses medium beam 5 (fast anyway).
  Without one: --fast and --windows use small; captions use medium with beam 1.
"""
import argparse, glob, json, os, subprocess, sys, site, tempfile


def add_cuda_dlls():
    if os.name != "nt":
        return
    for base in site.getsitepackages():
        for d in glob.glob(os.path.join(base, "nvidia", "*", "bin")):
            os.add_dll_directory(d)
            os.environ["PATH"] = d + os.pathsep + os.environ["PATH"]


def to_wav(media, start=None, dur=None):
    """Decode with ffmpeg to 16 kHz mono WAV: avoids decoder errors on phone files and is faster to read."""
    fd, path = tempfile.mkstemp(suffix=".wav"); os.close(fd)
    cmd = ["ffmpeg", "-v", "error", "-y"]
    if start is not None:
        cmd += ["-ss", f"{start:.3f}"]
    cmd += ["-i", media]
    if dur is not None:
        cmd += ["-t", f"{dur:.3f}"]
    subprocess.run(cmd + ["-vn", "-ac", "1", "-ar", "16000", path], check=True)
    return path


def load(model_name, fast):
    add_cuda_dlls()
    from faster_whisper import WhisperModel
    try:
        m = WhisperModel(model_name or "medium", device="cuda", compute_type="float16")
        return m, "cuda", 5
    except Exception:
        name = model_name or ("small" if fast else "medium")
        m = WhisperModel(name, device="cpu", compute_type="int8", cpu_threads=os.cpu_count() or 4)
        return m, "cpu", 1


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("media")
    ap.add_argument("out", nargs="?")
    ap.add_argument("--model", default=os.environ.get("WHISPER_MODEL"))
    ap.add_argument("--lang", default="pt")
    ap.add_argument("--fast", action="store_true")
    ap.add_argument("--windows", default="")
    ap.add_argument("--span", type=float, default=3.0)
    a = ap.parse_args()

    if a.windows:
        model, device, beam = load(a.model, True)
        for t in [float(x) for x in a.windows.split(",") if x.strip()]:
            start = max(0.0, t - a.span / 2)
            wav = to_wav(a.media, start, a.span)
            segs, _ = model.transcribe(wav, language=a.lang, beam_size=beam, condition_on_previous_text=False)
            print(f"[{t:8.2f}] {' '.join(s.text.strip() for s in segs)}", flush=True)
            os.remove(wav)
        return

    if not a.out:
        sys.exit("usage: transcribe-local-whisper.py <media> <out.json> [--fast]")
    model, device, beam = load(a.model, a.fast)
    wav = to_wav(a.media)
    segments, info = model.transcribe(wav, language=a.lang, beam_size=beam, word_timestamps=True,
                                      vad_filter=False, condition_on_previous_text=False)
    words = []
    for seg in segments:
        for w in seg.words or []:
            words.append({"text": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3)})
        print(f"[{seg.start:7.2f}] {seg.text.strip()}", flush=True)
    os.remove(wav)
    with open(a.out, "w", encoding="utf-8") as f:
        json.dump({"language_code": a.lang, "audio_duration_secs": round(info.duration, 3),
                   "text": " ".join(w["text"] for w in words), "words": words}, f, ensure_ascii=False, indent=1)
    print(f"DONE device={device} beam={beam} words={len(words)} -> {a.out}")


if __name__ == "__main__":
    main()
