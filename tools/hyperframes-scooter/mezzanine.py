#!/usr/bin/env python3
"""Mezzanine-Clips für HyperFrames: lange Quellpassagen als 9:16-Clips, SDR, ohne Text/Zoom.
Aufgabe dieser Stufe: nur HDR->SDR und 16:9->9:16-Ausschnitt (dem Fahrer folgend).
Schnitt, Zooms, Texte, CTA passieren danach in HyperFrames.
Aufruf: python3 mezzanine.py <gruppe>   (gruppe: a | b | c | fotos)"""
import sys, subprocess
sys.path.insert(0, "/home/user/scooter")
import render as R
from videos import track, push, D33, D29
from videos2 import F27

OUT = "/home/user/ai-vatto0/videos/_media/"
B = R.BEAT

# name, quelle, start (s), dauer (s), keyframes, zielgröße
BIG = (1216, 2160)   # 4K-Quellen: Reserve für Zooms in HyperFrames
STD = (1080, 1920)   # Quellen unter 4K
GROUPS = {
    "a": [
        ("m01_bruecke_fahrt", "d33", 0.0, 4.3, track(D33, 0, 4.3, .5, 1.0, 1.0), BIG),
        ("m02_wald_fahrt", "d29", 0.0, 19.0, track(D29, 0, 19.0, .55, 1.0, 1.0), BIG),
        ("m06_skatepark_nacht", "avd", 68.2, 2.6, push(1.0, 1.0, .5, .5), BIG),
        ("m09_kurve_ganz", "n17", 12.5, 3.5, push(1.0, 1.0, .5, .5), STD),
    ],
    "b": [
        ("m03_strasse_drohne", "f27", 8.0, 30.0, track(F27, 8, 30.0, .55, 1.0, 1.0), STD),
        ("m04_abend_fahrt_a", "avr1", 41.5, 11.0, push(1.0, 1.0, .5, .5), BIG),
        ("m05_abend_fahrt_b", "avr2", 54.5, 13.0, push(1.0, 1.0, .5, .5), BIG),
    ],
    "c": [
        ("m07_details_0208", "i08", 0.0, 16.8, push(1.0, 1.0, .5, .5), BIG),
        ("m08_display_9412", "n12", 21.0, 9.0, push(1.0, 1.0, .5, .5), BIG),
        ("m10_details_avlx", "avd", 28.0, 12.5, push(1.0, 1.0, .5, .5), BIG),
        ("m11_drohne_seg1", "s1", 0.0, 8.0, push(1.0, 1.0, .5, .5), BIG),
        ("m12_drohne_seg2", "s2", 3.0, 7.0, push(1.0, 1.0, .5, .5), BIG),
        ("m13_drohne_seg4", "s4", 3.0, 13.0, push(1.0, 1.0, .5, .5), BIG),
        ("m14_drohne_seg5", "s5", 4.5, 6.5, push(1.0, 1.0, .5, .5), BIG),
        ("m15_drohne_seg6", "s6", 0.0, 7.2, push(1.0, 1.0, .5, .5), BIG),
        ("m16_drohne_seg8", "s8", 6.0, 7.0, push(1.0, 1.0, .5, .5), BIG),
    ],
}


# Gruppe c in drei parallele Teile aufgeteilt
_c = {n[0]: n for n in GROUPS["c"]}
GROUPS["c1"] = [_c["m07_details_0208"], _c["m08_display_9412"]]
GROUPS["c2"] = [_c["m10_details_avlx"], _c["m11_drohne_seg1"], _c["m12_drohne_seg2"]]
GROUPS["c3"] = [_c["m13_drohne_seg4"], _c["m14_drohne_seg5"], _c["m15_drohne_seg6"], _c["m16_drohne_seg8"]]


def fotos():
    """DNG-Entwicklungen in handliche Größen bringen (Seitenverhältnis bleibt)."""
    for name, src, w in [("p11_ganz_front", "IMG_0211.jpg", 1620), ("p12_ganz_seite", "IMG_0212.jpg", 1620),
                         ("p13_hinterrad", "IMG_0213.jpg", 2880)]:
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", R.SRC + src, "-vf", f"scale={w}:-2:flags=lanczos",
                        "-q:v", "2", OUT + name + ".jpg"], check=True)
        print("Foto", name)


def stream(name, key, ss, dur, kf, size):
    """Bild für Bild: dekodieren -> Ausschnitt -> kodieren. Kein Puffern ganzer Einstellungen."""
    import numpy as np
    R.W, R.H = size
    s = R.SOURCES[key]
    path = R.SRC + s["f"]
    n = round(dur * R.FPS)
    vf = [R.HDR] if s.get("hdr") else []
    if s.get("band"):
        x, y, w, h = s["band"]
        vf.append(f"crop={w}:{h}:{x}:{y}")
    vf.append("setpts=PTS-STARTPTS")
    vf.append(f"fps={R.FPS}")
    pre = s.get("pre", 1.0)
    if pre != 1.0:
        vf.append(f"scale=trunc(iw*{pre}/2)*2:-2:flags=lanczos")
    if s.get("sharp"):
        vf.append("unsharp=5:5:0.6")
    vf.append("eq=contrast=1.04:saturation=1.05")
    base = ["ffmpeg", "-v", "error", "-ss", str(ss), "-i", path, "-t", str(dur + 0.2), "-vf", ",".join(vf)]
    probe = subprocess.run(base + ["-frames:v", "1", "-f", "image2pipe", "-vcodec", "png", "-"],
                           capture_output=True).stdout
    first = R.cv2.imdecode(np.frombuffer(probe, np.uint8), R.cv2.IMREAD_COLOR)
    h, w = first.shape[:2]
    dec = subprocess.Popen(base + ["-f", "rawvideo", "-pix_fmt", "bgr24", "-"], stdout=subprocess.PIPE,
                           stderr=subprocess.DEVNULL)
    enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24",
                            "-s", f"{R.W}x{R.H}", "-r", str(R.FPS), "-i", "-", "-c:v", "libx264",
                            "-preset", "medium", "-crf", "16", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
                            "-an", OUT + name + ".mp4"], stdin=subprocess.PIPE)
    last = first
    for i in range(n):
        buf = dec.stdout.read(w * h * 3)
        if len(buf) == w * h * 3:
            last = np.frombuffer(buf, np.uint8).reshape(h, w, 3)
        cx, cy, z = R.interp(kf, i / max(n - 1, 1))
        enc.stdin.write(R.crop_frame(last, cx, cy, z).tobytes())
    dec.stdout.close(); dec.wait()
    enc.stdin.close(); enc.wait()
    print(f"{name}: {n} Frames ({n / R.FPS:.2f} s) {R.W}x{R.H}", flush=True)


if __name__ == "__main__":
    g = sys.argv[1]
    if g == "fotos":
        fotos(); sys.exit()
    for item in GROUPS[g]:
        stream(*item)
