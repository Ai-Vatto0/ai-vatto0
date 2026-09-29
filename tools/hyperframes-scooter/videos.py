#!/usr/bin/env python3
import sys
sys.path.insert(0, "/home/user/scooter")
from render import render

D33 = [(0, .46), (1, .49), (2, .52), (3, .51), (4.4, .51)]   # Fahrer-x in DJI_0033
D29 = [(0, .58), (2, .53), (4, .53), (6, .57), (7, .56), (8, .48), (10, .46), (11, .50), (12, .49), (13, .43), (14, .38), (15, .35), (16, .37), (19, .37)]    # Fahrer-x in DJI_0029


def track(tab, ss, dur, cy, z0, z1):
    """Kamerafuehrung, die dem Fahrer folgt."""
    def x_at(s):
        for a, b in zip(tab, tab[1:]):
            if s <= b[0]:
                return a[1] + (b[1] - a[1]) * (s - a[0]) / (b[0] - a[0])
        return tab[-1][1]
    return [(0, x_at(ss), cy, z0), (1, x_at(ss + dur), cy, z1)]


def push(z0=1.0, z1=1.15, cx=.5, cy=.5, cx1=None, cy1=None):
    return [(0, cx, cy, z0), (1, cx if cx1 is None else cx1, cy if cy1 is None else cy1, z1)]


B = 60 / 143.55
HOOK_Y, FACT_Y, CTA_Y = 470, 1240, 1300
CTA = [[("JETZT", "W"), ("IM", "W")], [("TIKTOK", "Y"), ("SHOP.", "Y")]]

# ---------------- V1: BRUECKE (15 s) ----------------
v1 = [
    dict(src="d33", ss=0.0, beats=6, speed=1.0, kf=track(D33, 0, 6*B, .48, 1.0, 1.3), fx="punch shake"),
    dict(src="s6", ss=2.2, beats=4, speed=1.25, kf=push(1.0, 1.12), fx="punch"),
    dict(src="d29", ss=4.0, beats=4, speed=1.0, kf=track(D29, 4, 4*B, .58, 1.15, 1.3), fx="flash"),
    dict(src="avr1", ss=44.0, beats=4, speed=1.0, kf=push(1.0, 1.12, .5, .5), fx="punch"),
    dict(src="s2", ss=8.6, beats=4, speed=1.2, kf=push(1.05, 1.2, .5, .6), fx="punch"),
    dict(src="s7", ss=9.0, beats=4, speed=1.0, kf=push(1.0, 1.12, .5, .55), fx="flash"),
    dict(src="d33", ss=2.4, beats=4, speed=1.0, kf=track(D33, 2.4, 4*B, .62, 1.35, 1.2), fx="punch"),
    dict(src="s1", ss=0.3, beats=6, speed=1.0, kf=push(1.0, 1.18, .5, .6), fx="flash"),
]
t1 = [
    dict(t0=0, t1=2, lines=[[("WENN", "W"), ("DEIN", "W")]], y=300, size=150),
    dict(t0=2, t1=6, lines=[[("WENN", "W"), ("DEIN", "W")], [("ARBEITSWEG", "Y")], [("SO", "C"), ("AUSSIEHT...", "C")]], y=430, size=130),
    dict(t0=16, t1=24, lines=[[("20", "Y"), ("KM/H", "Y")], [("MIT", "W"), ("ABE", "C")]], y=FACT_Y, size=150),
    dict(t0=30.2, t1=36, lines=CTA, y=CTA_Y, size=150, rot=-2),
]

# ---------------- V2: DROHNEN-REVEAL (30 s) ----------------
v2 = [
    dict(src="s6", ss=1.4, beats=8, speed=1.2, kf=push(1.0, 1.1, .5, .55), fx="shake"),
    dict(src="s4", ss=13.0, beats=4, speed=1.0, kf=push(1.0, 1.12, .5, .6), fx="punch flash"),
    dict(src="avd", ss=28.3, beats=4, speed=1.0, kf=push(1.0, 1.15, .45, .35), fx="punch"),
    dict(src="avd", ss=38.0, beats=4, speed=1.0, kf=push(1.12, 1.0, .5, .55), fx="punch"),
    dict(src="avd", ss=35.0, beats=4, speed=1.0, kf=push(1.0, 1.1, .5, .6), fx="punch"),
    dict(src="s5", ss=8.8, beats=4, speed=1.2, kf=push(1.0, 1.15, .5, .6), fx="flash"),
    dict(src="d33", ss=0.4, beats=8, speed=1.0, kf=track(D33, .4, 8*B, .6, 1.05, 1.25), fx="punch"),
    dict(src="d29", ss=9.0, beats=4, speed=1.0, kf=track(D29, 9, 4*B, .58, 1.2, 1.35), fx="punch"),
    dict(src="avr2", ss=56.0, beats=4, speed=1.0, kf=push(1.05, 1.15, .5, .5), fx="punch"),
    dict(src="avd", ss=68.2, beats=4, speed=1.0, kf=push(1.0, 1.1, .5, .55), fx="flash"),
    dict(src="s7", ss=2.5, beats=4, speed=1.0, kf=push(1.0, 1.12, .5, .5), fx="punch"),
    dict(src="s8", ss=6.6, beats=4, speed=1.0, kf=push(1.0, 1.15, .5, .6), fx="punch"),
    dict(src="s4", ss=4.0, beats=6, speed=1.0, kf=push(1.0, 1.15, .5, .62), fx="flash"),
    dict(src="s2", ss=0.0, beats=10, speed=1.0, kf=push(1.0, 1.2, .5, .6), fx="punch"),
]
t2 = [
    dict(t0=0, t1=2, lines=[[("DAS", "W"), ("HIER", "W")]], y=HOOK_Y - 60, size=160),
    dict(t0=2, t1=4, lines=[[("DAS", "W"), ("HIER", "W")], [("STEHT", "P"), ("UNTER", "P")]], y=HOOK_Y, size=150),
    dict(t0=4, t1=8, lines=[[("DAS", "W"), ("HIER", "W")], [("STEHT", "P"), ("UNTER", "P")], [("DER", "Y"), ("BRÜCKE", "Y")]], y=HOOK_Y + 60, size=150),
    dict(t0=12, t1=16, lines=[[("LED-DISPLAY", "C")]], y=FACT_Y, size=130),
    dict(t0=16, t1=20, lines=[[("FEDERUNG", "Y")], [("VORNE", "W")]], y=FACT_Y, size=140),
    dict(t0=20, t1=24, lines=[[("DUALES", "P")], [("BREMSSYSTEM", "W")]], y=FACT_Y, size=130),
    dict(t0=24, t1=28, lines=[[("350", "Y"), ("WATT", "Y")], [("MOTOR", "W")]], y=FACT_Y, size=150),
    dict(t0=28, t1=36, lines=[[("20", "C"), ("KM/H", "C")], [("MIT", "W"), ("ABE", "Y")]], y=FACT_Y, size=150),
    dict(t0=48, t1=52, lines=[[("IN", "W"), ("3", "Y"), ("SEK.", "Y")], [("KLAPPBAR", "C")]], y=FACT_Y, size=140),
    dict(t0=52, t1=56, lines=[[("BIS", "W"), ("120", "P"), ("KG", "P")], [("TRAGLAST", "W")]], y=FACT_Y, size=140),
    dict(t0=62.2, t1=72, lines=CTA, y=CTA_Y, size=150, rot=-2),
]

# ---------------- V3: DETAILS (15 s) ----------------
v3 = [
    dict(src="avd", ss=35.0, beats=4, speed=1.0, kf=push(1.25, 1.05, .5, .62), fx="shake"),
    dict(src="avd", ss=36.2, beats=2, speed=1.0, kf=push(1.0, 1.1, .5, .5), fx="punch"),
    dict(src="avd", ss=37.2, beats=2, speed=1.0, kf=push(1.0, 1.1, .5, .5), fx="punch"),
    dict(src="avd", ss=38.3, beats=2, speed=1.0, kf=push(1.0, 1.1, .5, .5), fx="punch"),
    dict(src="avd", ss=29.4, beats=4, speed=1.0, kf=push(1.05, 1.2, .45, .35), fx="flash"),
    dict(src="p12", ss=0, beats=4, speed=1.0, kf=push(1.0, 1.18, .5, .55, .52, .6), fx="punch"),
    dict(src="s4", ss=15.8, beats=4, speed=1.0, kf=push(1.0, 1.12, .5, .6), fx="punch"),
    dict(src="d29", ss=13.5, beats=4, speed=1.0, kf=track(D29, 13.5, 4*B, .58, 1.2, 1.35), fx="flash"),
    dict(src="d33", ss=1.0, beats=4, speed=1.0, kf=track(D33, 1.0, 4*B, .63, 1.6, 1.45), fx="punch"),
    dict(src="s5", ss=4.6, beats=6, speed=1.0, kf=push(1.0, 1.15, .5, .6), fx="flash"),
]
t3 = [
    dict(t0=0, t1=2, lines=[[("SCHAU", "W"), ("MAL", "W")]], y=HOOK_Y - 40, size=160),
    dict(t0=2, t1=10, lines=[[("SCHAU", "W"), ("MAL", "W")], [("GENAU", "Y"), ("HIN", "Y")]], y=HOOK_Y, size=160),
    dict(t0=10, t1=14, lines=[[("LED-DISPLAY", "C")]], y=FACT_Y, size=130),
    dict(t0=14, t1=18, lines=[[("10", "Y"), ("ZOLL", "Y")], [("FEDERUNG", "W")], [("VORNE", "C")]], y=430, size=145),
    dict(t0=18, t1=22, lines=[[("DUALES", "P")], [("BREMSSYSTEM", "W")]], y=430, size=130),
    dict(t0=30.2, t1=36, lines=CTA, y=900, size=150, rot=-2),
]

ALL = {"V1_Bruecke_15s": (v1, t1), "V2_Drohne_30s": (v2, t2), "V3_Details_15s": (v3, t3)}

if __name__ == "__main__":
    which = sys.argv[1:] or list(ALL)
    for k in which:
        s, t = ALL[k]
        render(k, s, t, f"/home/user/scooter/out/{k}.mp4")
