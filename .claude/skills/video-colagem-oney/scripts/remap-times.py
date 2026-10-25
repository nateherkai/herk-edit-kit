# After a RE-CUT, move every beat time of an existing composition to the new clean.mp4 timeline.
# Matches the words of the old and new transcripts (difflib) and maps each time through the nearest
# matched words (piecewise linear). Times that fall inside removed speech snap to the next kept word.
# Run in the project root:
#   python <skill>/scripts/remap-times.py assets/transcript-v1.json assets/transcript.json
# Rewrites (keeping a .bak): src/index.template.html  (data-start/data-duration of hand-made clips, and the
# time arguments in the TIMING script: helpers pop/rise/slideX/stamp/tilt/draw/out/swapCard/punch/blurIn/
# blurOut/flash/leak and the last argument of tl.from/to/set/fromTo), assets/sfx.json (t),
# assets/emphasis.json (at), assets/caption-fixes.json (at). Prints every beat whose anchor word was removed.
import difflib, json, re, shutil, sys, unicodedata

old = json.load(open(sys.argv[1], encoding="utf-8"))["words"]
new = json.load(open(sys.argv[2], encoding="utf-8"))["words"]
norm = lambda s: re.sub(r"[^a-z0-9]", "", unicodedata.normalize("NFD", s.lower()).encode("ascii", "ignore").decode())
sm = difflib.SequenceMatcher(None, [norm(w["text"]) for w in old], [norm(w["text"]) for w in new], autojunk=False)
pairs = [(0.0, 0.0)]
for a, b, n in sm.get_matching_blocks():
    for k in range(n): pairs.append((old[a + k]["start"], new[b + k]["start"]))
pairs.sort()
removed = []  # old-time spans with no kept words
for tag, i1, i2, j1, j2 in sm.get_opcodes():
    if tag in ("delete", "replace") and j1 == j2 and i2 > i1: removed.append((old[i1]["start"] - 0.15, old[i2 - 1]["end"] + 0.15))
warn = []

def m(t):
    for a, b in removed:
        if a <= t <= b: warn.append(t)
    lo = max((p for p in pairs if p[0] <= t), default=pairs[0]); hi = min((p for p in pairs if p[0] >= t), default=None)
    if hi is None: return round(lo[1] + (t - lo[0]), 3)
    if hi[0] == lo[0]: return round(lo[1], 3)
    span_o, span_n = hi[0] - lo[0], hi[1] - lo[1]
    # inside a cut gap the new span is shorter: compress linearly (beats keep their order, land between the same words)
    return round(lo[1] + (t - lo[0]) * (span_n / span_o if span_o > 0 else 0), 3)

fmt = lambda x: f"{x:g}"
p = "src/index.template.html"; shutil.copy(p, p + ".bak"); s = open(p, encoding="utf-8").read()
head, script = s.split("<script>\nconst tl", 1)
def clip(mo):
    st, du = float(mo.group(2)), float(mo.group(4)); ns = m(st); ne = m(st + du)
    return f'{mo.group(1)}{fmt(ns)}{mo.group(3)}{fmt(max(0.05, round(ne - ns, 3)))}"'
head = re.sub(r'(data-start=")([\d.]+)("\s+data-duration=")([\d.]+)"', clip, head)
num = r"(\d+(?:\.\d+)?)"
script = re.sub(r"\b(pop|rise|slideX|stamp|tilt|draw|out)\((\"[^\"]*\"), " + num, lambda mo: f'{mo.group(1)}({mo.group(2)}, {fmt(m(float(mo.group(3))))}', script)
script = re.sub(r"\bswapCard\((\"[^\"]*\"), (\"[^\"]*\"), " + num, lambda mo: f'swapCard({mo.group(1)}, {mo.group(2)}, {fmt(m(float(mo.group(3))))}', script)
script = re.sub(r"\b(punch|blurIn|blurOut|flash|leak)\(" + num, lambda mo: f'{mo.group(1)}({fmt(m(float(mo.group(2))))}', script)
script = re.sub(r"\}, " + num + r"\)", lambda mo: "}, " + fmt(m(float(mo.group(1)))) + ")", script)
open(p, "w", encoding="utf-8").write(head + "<script>\nconst tl" + script)
for f, key in (("assets/sfx.json", "t"), ("assets/emphasis.json", "at"), ("assets/caption-fixes.json", "at")):
    try: d = json.load(open(f, encoding="utf-8"))
    except FileNotFoundError: continue
    if isinstance(d, list):
        for x in d:
            if isinstance(x, dict) and key in x: x[key] = m(x[key])
        json.dump(d, open(f, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
print("removed old spans:", [(round(a, 2), round(b, 2)) for a, b in removed])
print("times that were inside removed speech (check these beats):", sorted(set(round(x, 2) for x in warn)))
