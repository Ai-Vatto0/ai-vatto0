#!/usr/bin/env python3
"""Ruhige Fassung: laengere Einstellungen, keine Wackel-/Blitz-Effekte, ganzer Roller am Anfang/Ende."""
import sys
sys.path.insert(0, "/home/user/scooter")
from render import render
from videos import track, push, D33, D29, B, CTA

F27 = [(0, .45), (10, .45), (20, .47), (30, .48), (41, .48)]
HOOK_Y, FACT_Y = 470, 1240

# ---------------- V1: BRUECKE (15 s = 36 Beats) ----------------
v1 = [
    dict(src="d33", ss=0.0, beats=6, kf=track(D33, 0, 6*B, .5, 1.0, 1.08)),
    dict(src="p11", ss=0, beats=6, kf=push(0.8, 0.9, .5, .5)),
    dict(src="s5", ss=4.8, beats=6, kf=push(1.0, 1.06, .5, .6)),
    dict(src="n12", ss=24.4, beats=6, kf=push(1.0, 1.08, .45, .45)),
    dict(src="f27", ss=12.0, beats=6, kf=track(F27, 12, 6*B, .55, 1.0, 1.05)),
    dict(src="s1", ss=0.3, beats=6, kf=push(1.0, 1.1, .5, .6)),
]
t1 = [
    dict(t0=0, t1=2, lines=[[("WENN", "W"), ("DEIN", "W")]], y=300, size=150),
    dict(t0=2, t1=6, lines=[[("WENN", "W"), ("DEIN", "W")], [("ARBEITSWEG", "Y")], [("SO", "C"), ("AUSSIEHT...", "C")]], y=430, size=130),
    dict(t0=18.3, t1=24, lines=[[("LED-DISPLAY", "C")]], y=FACT_Y + 150, size=130),
    dict(t0=24.3, t1=30, lines=[[("20", "Y"), ("KM/H", "Y")], [("MIT", "W"), ("ABE", "C")]], y=300, size=150),
    dict(t0=30.3, t1=36, lines=CTA, y=1300, size=150, rot=-2),
]

# ---------------- V2: DROHNE (30 s = 72 Beats) ----------------
v2 = [
    dict(src="s2", ss=3.6, beats=8, kf=push(1.0, 1.08, .5, .55)),
    dict(src="p11", ss=0, beats=6, kf=push(0.8, 0.9, .5, .5)),
    dict(src="i08", ss=6.6, beats=6, kf=push(1.05, 1.12, .5, .5)),
    dict(src="i08", ss=8.6, beats=6, kf=push(1.0, 1.08, .5, .5)),
    dict(src="i08", ss=12.6, beats=6, kf=push(1.0, 1.08, .5, .5)),
    dict(src="n12", ss=24.4, beats=6, kf=push(1.0, 1.08, .45, .45)),
    dict(src="d33", ss=0.4, beats=8, kf=track(D33, .4, 8*B, .5, 1.0, 1.08)),
    dict(src="f27", ss=18.0, beats=6, kf=track(F27, 18, 6*B, .55, 1.0, 1.05)),
    dict(src="d29", ss=8.0, beats=6, kf=track(D29, 8, 6*B, .55, 1.05, 1.1)),
    dict(src="n17", ss=13.0, beats=6, kf=push(1.0, 1.08, .5, .5)),
    dict(src="p12", ss=0, beats=8, kf=push(0.75, 0.84, .5, .5)),
]
t2 = [
    dict(t0=0, t1=2, lines=[[("DAS", "W"), ("HIER", "W")]], y=HOOK_Y - 60, size=160),
    dict(t0=2, t1=4, lines=[[("DAS", "W"), ("HIER", "W")], [("STEHT", "P"), ("UNTER", "P")]], y=HOOK_Y, size=150),
    dict(t0=4, t1=8, lines=[[("DAS", "W"), ("HIER", "W")], [("STEHT", "P"), ("UNTER", "P")], [("DER", "Y"), ("BRÜCKE", "Y")]], y=HOOK_Y + 60, size=150),
    dict(t0=14.3, t1=20, lines=[[("DUALES", "P")], [("BREMSSYSTEM", "W")]], y=300, size=130),
    dict(t0=20.3, t1=26, lines=[[("10", "Y"), ("ZOLL", "Y")]], y=300, size=160),
    dict(t0=26.3, t1=32, lines=[[("FEDERUNG", "Y")], [("VORNE", "W")]], y=300, size=150),
    dict(t0=32.3, t1=38, lines=[[("LED-DISPLAY", "C")]], y=FACT_Y + 150, size=130),
    dict(t0=38.3, t1=46, lines=[[("20", "C"), ("KM/H", "C")], [("MIT", "W"), ("ABE", "Y")]], y=300, size=150),
    dict(t0=58.3, t1=64, lines=[[("350", "Y"), ("WATT", "Y")], [("MOTOR", "W")]], y=300, size=150),
    dict(t0=64.3, t1=72, lines=CTA, y=450, size=150, rot=-2),
]

# ---------------- V3: DETAILS (15 s = 36 Beats) ----------------
v3 = [
    dict(src="i08", ss=1.2, beats=6, kf=push(1.0, 1.06, .5, .5)),
    dict(src="i08", ss=7.2, beats=6, kf=push(1.1, 1.02, .5, .5)),
    dict(src="avd", ss=38.0, beats=6, kf=push(1.0, 1.06, .5, .55)),
    dict(src="avd", ss=28.6, beats=6, kf=push(1.0, 1.08, .45, .38)),
    dict(src="d29", ss=13.0, beats=6, kf=track(D29, 13, 6*B, .55, 1.05, 1.1)),
    dict(src="s8", ss=7.0, beats=6, kf=push(1.0, 1.06, .5, .6)),
]
t3 = [
    dict(t0=0, t1=2, lines=[[("SCHAU", "W"), ("MAL", "W")]], y=HOOK_Y - 40, size=160),
    dict(t0=2, t1=6, lines=[[("SCHAU", "W"), ("MAL", "W")], [("GENAU", "Y"), ("HIN", "Y")]], y=HOOK_Y, size=160),
    dict(t0=6.3, t1=12, lines=[[("DUALES", "P")], [("BREMSSYSTEM", "W")]], y=300, size=130),
    dict(t0=12.3, t1=18, lines=[[("FEDERUNG", "Y")], [("VORNE", "C")]], y=300, size=150),
    dict(t0=18.3, t1=24, lines=[[("LED-DISPLAY", "C")]], y=FACT_Y + 150, size=130),
    dict(t0=30.3, t1=36, lines=CTA, y=500, size=150, rot=-2),
]

ALL = {"V1_Bruecke_15s": (v1, t1), "V2_Drohne_30s": (v2, t2), "V3_Details_15s": (v3, t3)}

if __name__ == "__main__":
    for k in sys.argv[1:] or list(ALL):
        s, t = ALL[k]
        render(k, s, t, f"/home/user/scooter/out2/{k}.mp4")
