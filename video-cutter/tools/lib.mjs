// Gemeinsame Helfer für die Schnitt-Werkzeuge. Keine externen Dienste, nur ffmpeg/ffprobe lokal.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const TOOLS_DIR = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(TOOLS_DIR, "..");
export const HF_VERSION = "0.8.77";

export function fail(msg) {
  console.error(`\n✗ STOPP: ${msg}\n`);
  process.exit(1);
}

export function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    encoding: opts.binary ? "buffer" : "utf8",
    maxBuffer: 1024 * 1024 * 1024,
    cwd: opts.cwd,
    env: { ...process.env, ...(opts.env || {}) },
  });
  if (r.error) throw r.error;
  if (r.status !== 0 && !opts.allowFail) {
    const err = opts.binary ? r.stderr.toString() : r.stderr;
    throw new Error(`${cmd} ${args.join(" ")}\n→ Exit ${r.status}\n${String(err).slice(-2000)}`);
  }
  return r;
}

export function hf(args, opts = {}) {
  // Immer die geprüfte, fest gepinnte HyperFrames-Version aus dem Projekt verwenden.
  const bin = path.join(ROOT, "node_modules", "hyperframes", "bin", "hyperframes.mjs");
  if (!fs.existsSync(bin)) fail(`HyperFrames ${HF_VERSION} fehlt. Im Ordner video-cutter: npm install`);
  return run(process.execPath, [bin, ...args], {
    ...opts,
    env: { HYPERFRAMES_NO_TELEMETRY: "1", DO_NOT_TRACK: "1", ...(opts.env || {}) },
  });
}

export function sha256(file) {
  const h = createHash("sha256");
  const fd = fs.openSync(file, "r");
  const buf = Buffer.alloc(8 * 1024 * 1024);
  let n;
  while ((n = fs.readSync(fd, buf, 0, buf.length, null)) > 0) h.update(buf.subarray(0, n));
  fs.closeSync(fd);
  return h.digest("hex");
}

export function readJSON(file) {
  if (!fs.existsSync(file)) fail(`Datei fehlt: ${file}`);
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function writeJSON(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
}

export function jobDir(job) {
  if (!job || !/^[a-z0-9][a-z0-9-]*$/.test(job)) fail(`Job-Name "${job}" ungültig (nur a-z, 0-9, Bindestrich).`);
  return path.join(ROOT, "jobs", job);
}

export function parseArgs(argv) {
  const pos = [];
  const opt = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const k = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("--")) opt[k] = true;
      else opt[k] = argv[++i];
    } else pos.push(a);
  }
  return { pos, opt };
}

export function fraction(s) {
  if (!s || s === "0/0") return 0;
  const [a, b] = String(s).split("/").map(Number);
  return b ? a / b : a;
}

export function ffprobe(file) {
  const r = run("ffprobe", ["-v", "error", "-print_format", "json", "-show_format", "-show_streams", file]);
  const j = JSON.parse(r.stdout);
  const v = j.streams.find((s) => s.codec_type === "video" && !s.disposition?.attached_pic);
  const audios = j.streams.filter((s) => s.codec_type === "audio");
  let rotation = 0;
  if (v) {
    const dm = (v.side_data_list || []).find((d) => d.rotation !== undefined);
    if (dm) rotation = Number(dm.rotation);
    else if (v.tags?.rotate) rotation = -Number(v.tags.rotate);
  }
  const rot = ((Math.round(rotation) % 360) + 360) % 360;
  const swap = rot === 90 || rot === 270;
  const width = v ? (swap ? v.height : v.width) : 0;
  const height = v ? (swap ? v.width : v.height) : 0;
  const rFps = v ? fraction(v.r_frame_rate) : 0;
  const avgFps = v ? fraction(v.avg_frame_rate) : 0;
  return {
    datei: path.resolve(file),
    dauer_s: Number(j.format.duration),
    bytes: Number(j.format.size),
    container: j.format.format_name,
    video: v
      ? {
          codec: v.codec_name,
          breite_gespeichert: v.width,
          hoehe_gespeichert: v.height,
          rotation_grad: rot,
          breite_angezeigt: width,
          hoehe_angezeigt: height,
          orientierung: height > width ? "hochkant" : height < width ? "quer" : "quadratisch",
          r_frame_rate: v.r_frame_rate,
          avg_frame_rate: v.avg_frame_rate,
          fps: Number((avgFps || rFps).toFixed(5)),
          variable_bildrate: rFps && avgFps ? Math.abs(rFps - avgFps) > 0.01 : null,
          pix_fmt: v.pix_fmt,
          frames: v.nb_frames ? Number(v.nb_frames) : null,
        }
      : null,
    audio: audios.map((a) => ({
      index: a.index,
      codec: a.codec_name,
      kanaele: a.channels,
      samplerate: Number(a.sample_rate),
      sprache: a.tags?.language || null,
      dauer_s: a.duration ? Number(a.duration) : null,
    })),
  };
}

// Mono-PCM (16 kHz) als Float32Array lesen – für Pausen, Grenzen und Ton-Abgleich.
export function readPcm(file, start = 0, dur = null, rate = 16000) {
  const args = ["-v", "error"];
  if (start > 0) args.push("-ss", String(start));
  args.push("-i", file);
  if (dur) args.push("-t", String(dur));
  args.push("-vn", "-ac", "1", "-ar", String(rate), "-f", "f32le", "-");
  const r = run("ffmpeg", args, { binary: true });
  const b = r.stdout;
  return new Float32Array(b.buffer, b.byteOffset, Math.floor(b.length / 4));
}

// Lautheit in 10-ms-Fenstern (dBFS).
export function energyDb(pcm, rate = 16000, win = 0.01) {
  const n = Math.round(rate * win);
  const out = new Float32Array(Math.floor(pcm.length / n));
  for (let i = 0; i < out.length; i++) {
    let s = 0;
    for (let k = i * n; k < (i + 1) * n; k++) s += pcm[k] * pcm[k];
    out[i] = 10 * Math.log10(s / n + 1e-12);
  }
  return out;
}

export function percentile(arr, p) {
  const a = Array.from(arr).sort((x, y) => x - y);
  return a[Math.min(a.length - 1, Math.max(0, Math.floor((p / 100) * a.length)))];
}

export const r3 = (x) => Math.round(x * 1000) / 1000;
export const fmt = (s) => {
  const m = Math.floor(s / 60);
  return `${m}:${(s - m * 60).toFixed(2).padStart(5, "0")}`;
};

export function nextVersion(dir, prefix, ext) {
  fs.mkdirSync(dir, { recursive: true });
  let n = 1;
  for (const f of fs.readdirSync(dir)) {
    const m = f.match(new RegExp(`^${prefix}-v(\\d{3})\\.${ext}$`));
    if (m) n = Math.max(n, Number(m[1]) + 1);
  }
  return path.join(dir, `${prefix}-v${String(n).padStart(3, "0")}.${ext}`);
}

// Zeit von Quelle → Schnitt über die Zeitkarte. null = liegt in einem entfernten Bereich.
export function quelleZuSchnitt(zeitkarte, t) {
  for (const z of zeitkarte) {
    if (t >= z.quelle_start - 1e-6 && t <= z.quelle_ende + 1e-6) return r3(z.schnitt_start + (t - z.quelle_start));
  }
  return null;
}
