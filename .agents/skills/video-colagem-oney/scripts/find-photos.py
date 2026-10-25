# Download licensed candidate photos (Wikimedia Commons for real people/places, Openverse for generic stock).
# Usage:  python find-photos.py <out-dir> "commons|lula|Foto oficial Luiz Inácio Lula da Silva|6" "openverse|cadeira|empty chair spotlight|6"
# Saves <out-dir>/<tag>_<i>.jpg and appends tag, title, licence, author, page to <out-dir>/sources.tsv.
# Then make a contact sheet and LOOK before choosing (titles lie; check who is in the photo).
import sys, json, re, os, urllib.request, urllib.parse
H = {"User-Agent": "EditeReelsKit/1.0 (video editing for personal social media)"}
get = lambda u: urllib.request.urlopen(urllib.request.Request(u, headers=H), timeout=60).read()
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
log = open(os.path.join(out, "sources.tsv"), "a", encoding="utf-8")
for arg in sys.argv[2:]:
    src, tag, term, n = arg.split("|"); n = int(n); k = 0
    if src == "commons":
        p = {"action": "query", "format": "json", "generator": "search", "gsrsearch": f"filetype:bitmap|drawing {term}", "gsrnamespace": 6,
             "gsrlimit": n, "prop": "imageinfo", "iiprop": "url|extmetadata", "iiurlwidth": 1280}
        r = json.loads(get("https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(p)))
        for i, pg in enumerate(sorted((r.get("query", {}).get("pages", {}) or {}).values(), key=lambda x: x.get("index", 0))):
            ii = pg["imageinfo"][0]; m = ii.get("extmetadata", {})
            lic = m.get("LicenseShortName", {}).get("value", ""); art = re.sub("<[^>]+>", "", m.get("Artist", {}).get("value", "")).strip()[:60]
            try: open(f"{out}/{tag}_{i}.jpg", "wb").write(get(ii.get("thumburl") or ii["url"])); k += 1
            except Exception: continue
            log.write(f"{tag}_{i}\t{pg['title']}\t{lic}\t{art}\t{ii['descriptionurl']}\n")
    else:
        u = "https://api.openverse.org/v1/images/?" + urllib.parse.urlencode({"q": term, "license_type": "commercial", "page_size": n, "mature": "false"})
        for i, it in enumerate(json.loads(get(u)).get("results", [])):
            try: open(f"{out}/{tag}_{i}.jpg", "wb").write(get(it.get("thumbnail") or it["url"])); k += 1
            except Exception: continue
            log.write(f"{tag}_{i}\t{it.get('title','')}\t{it.get('license','')} {it.get('license_version','')}\t{it.get('creator','')}\t{it.get('foreign_landing_url','')}\n")
    print(tag, k)
