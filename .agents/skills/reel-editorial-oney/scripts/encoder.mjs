// Fastest H.264 encoder this machine actually supports, for intermediate files (raw.mp4, clean.mp4).
// Tries the GPU / integrated-graphics encoders first (NVIDIA, Intel Quick Sync, AMD, Apple), then falls
// back to libx264 ultrafast. Each candidate is probed with a tiny test encode, because ffmpeg lists
// encoders the hardware may not have. Force CPU with EDITE_REELS_ENCODER=cpu.
import { spawnSync } from "node:child_process";

const CPU = ["-c:v", "libx264", "-preset", "ultrafast", "-crf", "18"];
const CANDIDATES = [
  ["h264_nvenc", ["-preset", "p4", "-rc", "vbr", "-cq", "20", "-b:v", "0"]],
  ["h264_qsv", ["-global_quality", "22"]],
  ["h264_amf", ["-quality", "balanced", "-rc", "cqp", "-qp_i", "20", "-qp_p", "22"]],
  ["h264_videotoolbox", ["-b:v", "14M"]],
];
let cached;

export function videoEncoder() {
  if (cached) return cached;
  if (process.env.EDITE_REELS_ENCODER === "cpu") return (cached = CPU);
  for (const [name, args] of CANDIDATES) {
    const probe = spawnSync("ffmpeg", ["-v", "error", "-f", "lavfi", "-i", "color=c=black:s=320x320:d=0.2",
      "-pix_fmt", "yuv420p", "-c:v", name, ...args, "-f", "null", "-"]);
    if (probe.status === 0) return (cached = ["-c:v", name, ...args]);
  }
  return (cached = CPU);
}

// Hardware-accelerated decoding where available (phone HEVC/4K decodes much faster); ffmpeg falls back silently.
export const HWDEC = ["-hwaccel", "auto"];
