// A neutral presenter: a grey, face-free figure in a softly lit room, like the placeholder presenter the sample
// videos of the editing packs use. Used as the preview background when no clip is loaded (or when the student
// prefers it), so every card still shows where things sit around a person.
function svg(w, h) {
  const cx = w / 2, headR = Math.round(Math.min(w, h) * 0.075), headY = Math.round(h * (w > h ? 0.44 : 0.33));
  const shW = Math.round(headR * 4.6), shoulderY = headY + headR * 1.7;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <defs>
    <linearGradient id="room" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3a40"/><stop offset=".55" stop-color="#2a2a30"/><stop offset="1" stop-color="#1b1b20"/></linearGradient>
    <radialGradient id="light" cx="50%" cy="28%" r="60%"><stop offset="0" stop-color="#6b6a72" stop-opacity=".9"/><stop offset="1" stop-color="#2a2a30" stop-opacity="0"/></radialGradient>
    <linearGradient id="fig" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c9c4bc"/><stop offset="1" stop-color="#9a9389"/></linearGradient>
    <linearGradient id="desk" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5a4a3a"/><stop offset="1" stop-color="#3d3128"/></linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#room)"/>
  <rect width="${w}" height="${h}" fill="url(#light)"/>
  <rect x="${Math.round(w * 0.08)}" y="${Math.round(h * 0.12)}" width="${Math.round(w * 0.22)}" height="${Math.round(h * 0.5)}" rx="8" fill="#26262c" opacity=".8"/>
  <rect x="${Math.round(w * 0.7)}" y="${Math.round(h * 0.1)}" width="${Math.round(w * 0.24)}" height="${Math.round(h * 0.55)}" rx="8" fill="#26262c" opacity=".8"/>
  <path d="M${cx - shW / 2} ${h} C ${cx - shW / 2} ${shoulderY + headR * 0.4}, ${cx - headR * 1.1} ${shoulderY}, ${cx} ${shoulderY} C ${cx + headR * 1.1} ${shoulderY}, ${cx + shW / 2} ${shoulderY + headR * 0.4}, ${cx + shW / 2} ${h} Z" fill="url(#fig)"/>
  <rect x="${cx - headR * 0.42}" y="${headY + headR * 0.75}" width="${headR * 0.84}" height="${headR * 1.1}" rx="${headR * 0.3}" fill="#b5afa6"/>
  <circle cx="${cx}" cy="${headY}" r="${headR}" fill="url(#fig)"/>
  <ellipse cx="${cx}" cy="${h + headR * 0.2}" rx="${w * 0.6}" ry="${headR * 1.2}" fill="url(#desk)" opacity=".9"/>
</svg>`;
}
const cache = {};
export function avatarDataUrl(landscape = false) {
  const k = landscape ? "l" : "p";
  if (!cache[k]) cache[k] = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(landscape ? svg(1920, 1080) : svg(1080, 1920));
  return cache[k];
}
