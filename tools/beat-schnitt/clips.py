import sys, json
sys.path.insert(0, "/home/user/scooter")
from render import render, BEAT, FPS
from videos import track, push, D33, D29
from videos2 import F27
B = BEAT
OUT = "/home/user/ai-vatto0/video-edit/public/clips/"
# (name, beats, shot)
SHOTS = [
    ("01_hook_bruecke", 6, dict(src="d33", ss=0.0, kf=track(D33, 0, 6.5*B, .5, 1.0, 1.06))),
    ("02_ganz_front", 6, dict(src="p11", ss=0, kf=push(0.8, 0.88, .5, .5))),
    ("03_bremse", 6, dict(src="i08", ss=6.6, kf=push(1.05, 1.1, .5, .5))),
    ("04_federung", 6, dict(src="i08", ss=12.6, kf=push(1.0, 1.06, .5, .5))),
    ("05_display", 6, dict(src="n12", ss=24.4, kf=push(1.0, 1.06, .45, .45))),
    ("06_fahrt_drohne", 6, dict(src="f27", ss=12.0, kf=track(F27, 12, 6.5*B, .55, 1.0, 1.04))),
    ("07_ganz_kurve", 6, dict(src="n17", ss=13.0, kf=push(1.0, 1.05, .5, .5))),
    ("08_ganz_seite", 8, dict(src="p12", ss=0, kf=push(0.75, 0.84, .5, .5))),
]
man = []; pos = 0.0
for name, beats, sh in SHOTS:
    f0 = round(pos * B * FPS); pos += beats; f1 = round(pos * B * FPS)
    sh = dict(sh, beats=beats + 0.5)   # etwas Reserve
    render(name, [sh], [], OUT + name + ".mp4")
    man.append(dict(file=f"clips/{name}.mp4", from_=f0, dur=f1 - f0))
json.dump(dict(fps=FPS, total=round(pos * B * FPS), beat=B * FPS, shots=man),
          open("/home/user/ai-vatto0/video-edit/src/scooter/manifest.json", "w"), indent=1)
print("ok", pos, "Beats")
