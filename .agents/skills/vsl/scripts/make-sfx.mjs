// Gera os SFX do kit de forma procedural (ffmpeg, sem download, sem licença de terceiros) em template/sfx/*.wav.
// Rode uma vez:  node .claude/skills/vsl/scripts/make-sfx.mjs
// Para trocar por SFX de banco (Pixabay/Mixkit/Freesound CC0), salve com o MESMO nome em template/sfx/ e
// ajuste SFX_DUR em kit.js se a duração mudar.
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const out = join(resolve(dirname(fileURLToPath(import.meta.url)), ".."), "template", "sfx");
mkdirSync(out, { recursive: true });
const SR = 48000;
const ev = (expr, d) => `aevalsrc='${expr}':s=${SR}:d=${d}`;
const noise = (c, d, a = 0.5) => `anoisesrc=c=${c}:d=${d}:a=${a}:r=${SR}:seed=7`;
const S = {
  whoosh: [noise("pink", 0.6, 0.7), "highpass=f=250,lowpass=f=5200,afade=t=in:d=0.38:curve=exp,afade=t=out:st=0.38:d=0.22,volume=1.4"],
  swoosh: [noise("pink", 0.4, 0.5), "bandpass=f=1400:w=1800,afade=t=in:d=0.2:curve=exp,afade=t=out:st=0.2:d=0.2,volume=1.2"],
  glitch: [noise("white", 0.35, 0.6), "acrusher=bits=5:samples=24:mix=1,volume='if(lt(mod(t\\,0.06)\\,0.032)\\,1\\,0.12)':eval=frame,afade=t=out:st=0.22:d=0.13"],
  boom: [ev("0.95*sin(2*PI*(34*t+9*(1-exp(-5*t))))*exp(-2.6*t)", 1.2), "lowpass=f=180,afade=t=in:d=0.004"],
  pop: [ev("0.55*sin(2*PI*(620*t+1400*t*t))*exp(-38*t)", 0.12), "afade=t=in:d=0.002"],
  click: [noise("white", 0.06, 0.6), "highpass=f=2500,afade=t=out:st=0.004:d=0.05:curve=exp"],
  tick: [ev("0.45*sin(2*PI*2300*t)*exp(-120*t)", 0.04), "afade=t=in:d=0.001"],
  type: [ev("0.32*sin(2*PI*(1700+300*sin(13*t))*t)*exp(-170*mod(t\\,0.073))*(0.55+0.45*abs(sin(41*t)))", 1.0), "highpass=f=900"],
  riser: [ev("0.18*sin(2*PI*(180*t+260*t*t))*(t/1.4)", 1.4), "afade=t=out:st=1.25:d=0.15"],
  shimmer: [ev("0.22*(sin(2*PI*2637*t)+sin(2*PI*3520*t)+0.5*sin(2*PI*5274*t))*exp(-4*t)", 0.9), "afade=t=in:d=0.01"],
  stamp: [ev("0.9*sin(2*PI*72*t)*exp(-11*t)+0.35*sin(2*PI*180*t)*exp(-30*t)", 0.35), "lowpass=f=1200,afade=t=in:d=0.002"],
  ding: [ev("0.35*sin(2*PI*1318*t)*exp(-5*t)+0.22*sin(2*PI*1975*t)*exp(-6*t)", 0.8), "afade=t=in:d=0.003"],
};
for (const [name, [src, fx]] of Object.entries(S)) {
  execFileSync("ffmpeg", ["-y", "-v", "error", "-f", "lavfi", "-i", src, "-af", `${fx},aformat=channel_layouts=stereo`, "-ar", String(SR), "-c:a", "pcm_s16le", join(out, name + ".wav")]);
  console.log("sfx", name);
}
