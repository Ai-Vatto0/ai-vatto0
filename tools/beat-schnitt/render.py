#!/usr/bin/env python3
"""Scooter-Werbung: rendert 9:16-Videos aus Originalmaterial.
Nur Ausschnitt/Zoom/Schnitt - keine Farb- oder Formveraenderung am Roller."""
import subprocess, sys, math, random, json
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont

W, H, FPS = 1080, 1920, 30
BPM = 143.55
BEAT = 60.0 / BPM
SRC = "/home/user/scooter/src/"
FONT = "/home/user/ai-vatto0/assets/fonts/PermanentMarker.ttf"
FONT_B = "/home/user/ai-vatto0/assets/fonts/Poppins-Bold.ttf"
C = dict(Y=(255, 212, 0), C=(46, 230, 255), P=(255, 79, 179), W=(255, 255, 255), G=(120, 255, 90))

# Quellen: Nutzbereich (Band ohne schwarze Balken) und Vorskalierung
SOURCES = {
    "d33":  dict(f="DJI_0033_cut.MP4", band=None, pre=1.0),
    "d29":  dict(f="DJI_0029_cut.MP4", band=None, pre=1.0),
    "avd":  dict(f="AVLX0403.MOV", band=None, pre=0.8),              # Details, Vollbild
    "avr1": dict(f="AVLX0403.MOV", band=(0, 638, 2160, 2566), pre=1.0),   # Fahrt 41-53s
    "avr2": dict(f="AVLX0403.MOV", band=(0, 444, 2160, 2952), pre=0.9),   # Fahrt 54-67s
    "s1": dict(f="seg1.MP4"), "s2": dict(f="seg2.MP4"), "s3": dict(f="seg3.MP4"),
    "s4": dict(f="seg4.MP4"), "s5": dict(f="seg5.MP4"), "s6": dict(f="seg6.MP4"),
    "s7": dict(f="seg7.MP4"), "s8": dict(f="seg8.MP4"),
    "p12": dict(f="IMG_0212.jpg", img=True),
}


def ease(t):  # smoothstep
    t = min(max(t, 0.0), 1.0)
    return t * t * (3 - 2 * t)


def interp(kf, t):
    """kf: Liste (t, cx, cy, z). Liefert (cx, cy, z) bei t in [0,1]."""
    if t <= kf[0][0]:
        return kf[0][1:]
    for a, b in zip(kf, kf[1:]):
        if t <= b[0]:
            u = ease((t - a[0]) / (b[0] - a[0]))
            return tuple(a[i] + (b[i] - a[i]) * u for i in (1, 2, 3))
    return kf[-1][1:]


def read_frames(key, ss, n, speed):
    s = SOURCES[key]
    path = SRC + s["f"]
    if s.get("img"):
        im = cv2.imread(path)
        h, w = im.shape[:2]
        f = 2160 / w
        im = cv2.resize(im, (int(w * f), int(h * f)), interpolation=cv2.INTER_AREA)
        return [im] * n
    vf = []
    if s.get("band"):
        x, y, w, h = s["band"]
        vf.append(f"crop={w}:{h}:{x}:{y}")
    vf.append(f"setpts=(PTS-STARTPTS)/{speed}")
    vf.append(f"fps={FPS}")
    pre = s.get("pre", 1.0)
    if pre != 1.0:
        vf.append(f"scale=trunc(iw*{pre}/2)*2:-2:flags=lanczos")
    vf.append("eq=contrast=1.04:saturation=1.05")
    cmd = ["ffmpeg", "-v", "error", "-ss", str(ss), "-i", path, "-t", str(n / FPS * speed + 0.2),
           "-vf", ",".join(vf), "-f", "rawvideo", "-pix_fmt", "bgr24", "-"]
    # Groesse ermitteln
    probe = subprocess.run(cmd[:-1] + ["-frames:v", "1", "-f", "image2pipe", "-vcodec", "png", "-"],
                           capture_output=True).stdout
    first = cv2.imdecode(np.frombuffer(probe, np.uint8), cv2.IMREAD_COLOR)
    h, w = first.shape[:2]
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    frames = []
    for _ in range(n):
        buf = p.stdout.read(w * h * 3)
        if len(buf) < w * h * 3:
            break
        frames.append(np.frombuffer(buf, np.uint8).reshape(h, w, 3))
    p.stdout.close(); p.wait()
    while len(frames) < n:
        frames.append(frames[-1])
    return frames


def crop_frame(img, cx, cy, z):
    h, w = img.shape[:2]
    # groesstes 9:16-Rechteck im Bild
    if w / h > W / H:
        rh = h; rw = h * W / H
    else:
        rw = w; rh = w * H / W
    rw /= z; rh /= z
    x0 = min(max(cx * w - rw / 2, 0), w - rw)
    y0 = min(max(cy * h - rh / 2, 0), h - rh)
    s = W / rw
    M = np.float32([[s, 0, -x0 * s], [0, s, -y0 * s]])
    interp_ = cv2.INTER_AREA if s < 1 else cv2.INTER_CUBIC
    if s < 1:  # erst zuschneiden, dann sauber verkleinern
        xi, yi = int(x0), int(y0)
        sub = img[yi:int(y0 + rh) + 2, xi:int(x0 + rw) + 2]
        M2 = np.float32([[s, 0, -(x0 - xi) * s], [0, s, -(y0 - yi) * s]])
        big = cv2.resize(sub, (int(sub.shape[1] * s) + 2, int(sub.shape[0] * s) + 2), interpolation=cv2.INTER_AREA)
        M2 = np.float32([[1, 0, -(x0 - xi) * s], [0, 1, -(y0 - yi) * s]])
        return cv2.warpAffine(big, M2, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    return cv2.warpAffine(img, M, (W, H), flags=interp_, borderMode=cv2.BORDER_REFLECT)


# ---------- Text ----------
_cache = {}


def text_sprite(lines, size, font=FONT, rot=-3):
    """lines: Liste von Zeilen; Zeile = Liste von (wort, farbe). RGBA-Sprite."""
    key = (json.dumps(lines), size, font, rot)
    if key in _cache:
        return _cache[key]
    ft = ImageFont.truetype(font, size)
    stroke = max(6, size // 13)
    d0 = ImageDraw.Draw(Image.new("RGBA", (10, 10)))
    space = d0.textlength(" ", font=ft)
    rows = []
    for ln in lines:
        ws = [(t, col, d0.textbbox((0, 0), t, font=ft, stroke_width=stroke)) for t, col in ln]
        rw = sum(b[2] - b[0] for _, _, b in ws) + space * (len(ws) - 1)
        rows.append((ws, rw))
    lh = int(size * 1.12)
    cw = int(max(r for _, r in rows)) + 60
    ch = lh * len(rows) + 60
    img = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
    sh = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
    d, ds = ImageDraw.Draw(img), ImageDraw.Draw(sh)
    y = 30
    for ws, rw in rows:
        x = (cw - rw) / 2
        for t, col, b in ws:
            ds.text((x - b[0] + 7, y + 9), t, font=ft, fill=(0, 0, 0, 150), stroke_width=stroke, stroke_fill=(0, 0, 0, 150))
            d.text((x - b[0], y), t, font=ft, fill=C[col] + (255,), stroke_width=stroke, stroke_fill=(0, 0, 0, 255))
            x += (b[2] - b[0]) + space
        y += lh
    out = Image.alpha_composite(sh, img).rotate(rot, resample=Image.BICUBIC, expand=True)
    arr = np.array(out)
    # Maximalbreite 920 px sicherstellen
    if arr.shape[1] > 960:
        f = 960 / arr.shape[1]
        arr = cv2.resize(arr, (960, int(arr.shape[0] * f)), interpolation=cv2.INTER_AREA)
    _cache[key] = arr
    return arr


def blit(frame, spr, cx, cy, scale=1.0, alpha=1.0):
    if alpha <= 0:
        return
    if abs(scale - 1) > 1e-3:
        spr = cv2.resize(spr, (max(2, int(spr.shape[1] * scale)), max(2, int(spr.shape[0] * scale))), interpolation=cv2.INTER_LINEAR)
    h, w = spr.shape[:2]
    x0, y0 = int(cx - w / 2), int(cy - h / 2)
    xa, ya, xb, yb = max(x0, 0), max(y0, 0), min(x0 + w, W), min(y0 + h, H)
    if xa >= xb or ya >= yb:
        return
    s = spr[ya - y0:yb - y0, xa - x0:xb - x0].astype(np.float32)
    a = s[:, :, 3:4] / 255.0 * alpha
    rgb = s[:, :, 2::-1]  # RGBA -> BGR
    roi = frame[ya:yb, xa:xb].astype(np.float32)
    frame[ya:yb, xa:xb] = (roi * (1 - a) + rgb * a).astype(np.uint8)


def pop_scale(k):  # k = Frames seit Start
    if k >= 6:
        return 1.0
    u = k / 6
    return 1.0 + 0.45 * (1 - u) ** 2 * math.cos(u * 3.2)


# ---------- Render ----------
def render(name, shots, texts, out):
    """shots: Liste dict(src, ss, beats, speed, kf, fx). texts: dict(t0,t1 in Beats, lines, size, y, font)"""
    enc = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
         "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo",
         "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-profile:v", "high", "-level", "4.1", "-pix_fmt", "yuv420p",
         "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", out], stdin=subprocess.PIPE)
    beat_pos = 0.0
    gframe = 0
    cuts = []
    for sh in shots:
        f0 = round(beat_pos * BEAT * FPS)
        beat_pos += sh["beats"]
        f1 = round(beat_pos * BEAT * FPS)
        n = f1 - f0
        cuts.append(f0)
        frames = read_frames(sh["src"], sh["ss"], n, sh.get("speed", 1.0))
        fx = sh.get("fx", "")
        rnd = random.Random(f0)
        for i, img in enumerate(frames):
            t = i / max(n - 1, 1)
            cx, cy, z = interp(sh["kf"], t)
            if "punch" in fx and i < 7:  # Zoom-Stoss auf den Beat
                z *= 1 + 0.10 * (1 - i / 7) ** 2
            if "shake" in fx and i < 8:
                amp = 0.006 * (1 - i / 8)
                cx += rnd.uniform(-amp, amp); cy += rnd.uniform(-amp, amp)
            fr = crop_frame(img, cx, cy, z)
            if "flash" in fx and i < 3:
                fr = cv2.addWeighted(fr, 1 - 0.55 * (1 - i / 3), np.full_like(fr, 255), 0.55 * (1 - i / 3), 0)
            gf = f0 + i
            for tx in texts:
                a0 = round(tx["t0"] * BEAT * FPS); a1 = round(tx["t1"] * BEAT * FPS)
                if a0 <= gf < a1:
                    spr = text_sprite(tx["lines"], tx.get("size", 130), tx.get("font", FONT), tx.get("rot", -3))
                    k = gf - a0
                    alpha = min(1.0, (k + 1) / 3, (a1 - gf) / 3)
                    blit(fr, spr, W / 2 + tx.get("dx", 0), tx["y"], pop_scale(k), alpha)
            enc.stdin.write(fr.tobytes())
            gframe += 1
        print(f"{name}: shot {sh['src']} {n} Frames", flush=True)
    enc.stdin.close(); enc.wait()
    print(f"{name}: fertig {gframe} Frames = {gframe / FPS:.2f}s -> {out}")
    return cuts
