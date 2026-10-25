// Pull one frame per beat from a render, with the Instagram safe box drawn, into contact sheets to LOOK at.
// Usage (project root):  node <skill>/scripts/beat-sheet.mjs renders/draft.mp4 out-prefix 0.4 1.8 3.2 …
// Writes <out-prefix>-1.jpg, -2.jpg … (8 frames per sheet, 270 px wide each, time stamped).
import { execFileSync } from "node:child_process";
const [src, prefix, ...times] = process.argv.slice(2);
const per = 8;
for (let s = 0; s * per < times.length; s++) {
  const ts = times.slice(s * per, s * per + per);
  const args = ["-v", "error", "-y"];
  ts.forEach((t) => args.push("-ss", t, "-i", src));
  const f = ts.map((t, i) => `[${i}]scale=270:480,drawbox=x=${65 / 4}:y=${270 / 4}:w=${950 / 4}:h=${978 / 4}:color=red@0.8:t=1,` +
    `drawtext=fontfile='C\\:/Windows/Fonts/arial.ttf':text='${t}':x=4:y=4:fontsize=18:fontcolor=yellow:box=1:boxcolor=black[v${i}]`).join(";");
  const stack = ts.map((_, i) => `[v${i}]`).join("") + `hstack=inputs=${ts.length}`;
  args.push("-filter_complex", `${f};${ts.length > 1 ? stack : "[v0]copy"}`, "-frames:v", "1", `${prefix}-${s + 1}.jpg`);
  execFileSync("ffmpeg", args, { stdio: "inherit" });
  console.log(`${prefix}-${s + 1}.jpg`, ts.join(" "));
}
