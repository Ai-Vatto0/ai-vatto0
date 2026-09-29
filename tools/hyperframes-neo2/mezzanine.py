#!/usr/bin/env python3
"""Zwischenclips 1080x1920 / 30 fps / SDR für die Neo-2-Videos. Nur Ausschnitt + HDR->SDR, nichts am Produkt verändert.
Quelle: Kopien in /home/user/drohne/src (Originale bleiben in Vattos Drive/Desktop unberührt)."""
import subprocess, sys
from concurrent.futures import ThreadPoolExecutor
SRC = "/home/user/drohne/src/"
OUT = "/home/user/ai-vatto0/videos/_media_neo2/"
HDR = "zscale=t=linear:npl=203,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p"
# name, datei, start, dauer, art, parameter
# art: "h" = 16:9 4K -> 9:16-Ausschnitt (param = Bildmitte 0..1) | "p" = Hochkant SDR | "hlg" = iPhone-HDR hochkant
#      "scr" = Bildschirmaufnahme 1180x2556 (param = y-Versatz)
CLIPS = [
    ("n_rocket_top", "CIWL3941_cut.MP4", 0, 6.1, "h", .42),
    ("n_rocket_top2", "DFWV4297_cut.MP4", 0, 7.8, "h", .5),
    ("n_behind_field", "DJI_0001_seg4.MP4", 0, 3.25, "h", .55),
    ("n_side", "DJI_0001_seg2.MP4", 0, 14.0, "h", .55),
    ("n_behind_sunset", "DJI_0004_cut.MP4", 3, 27, "h", .5),
    ("n_behind_sunset2", "DJI_0006_seg1.MP4", 0, 34, "h", .52),
    ("n_wave", "DJI_0006_seg4.MP4", 0, 3.65, "h", .47),
    ("n_gesture", "DJI_0006_seg6.MP4", 0, 10.6, "h", .55),
    ("n_dronie_bridge", "DJI_0011.MP4", 4.5, 12, "h", .5),
    ("n_front_forest", "DJI_0012_seg5.MP4", 0, 6.9, "h", .5),
    ("n_front_forest2", "DJI_0012_seg1.MP4", 0, 8.6, "h", .5),
    ("n_hill", "DJI_0021_seg3.MP4", 2.2, 14.6, "h", .5),
    ("n_hill2", "DJI_0021_seg2.MP4", 0, 11.5, "h", .5),
    ("n_forest_behind", "DJI_0026_cut.MP4", 0, 8.7, "h", .5),
    ("n_reveal", "DJI_0041.MP4", 2.5, 9, "h", .5),
    ("n_top_track", "DJI_0003.MP4", 0, 8, "h", .45),
    ("n_palm", "IMG_0203.MOV", 0, 6.3, "hlg", 0),
    ("n_fly_car", "IMG_0204.MOV", 0, 10.7, "hlg", 0),
    ("n_launch_sky", "IMG_0205_seg1.MOV", 0, 9, "hlg", 0),
    ("n_unbox", "IMG_0200.mov", 0, 104.6, "p", 0),
    ("n_app_modes", "LHAJ4878_seg1.MP4", 0, 14, "scr", 229),
    ("n_phone_cam", "LHAJ4878_seg2.MP4", 0, 12.7, "scr", 200),
    ("n_app_manual", "LHAJ4878_seg3.MP4", 2, 11.4, "scr", 229),
    ("n_akku", "LHAJ4878_seg4.MP4", 0, 31.7, "scr", 229),
    # Runde 2 (Vatto 29.09.: mehr Videos, Gesicht ok, Drohne-trifft-Drohne ok)
    ("w_bridge", "DJI_0011.MP4", 0, 16.5, "w", .5),
    ("w_dd1", "app_full.mp4", 10.5, 15, "w", .5),
    ("w_dd2", "app_full.mp4", 25, 20, "w", .5),
    ("w_dd_pilots", "app_full.mp4", 50.5, 14.9, "w", .5),
    ("w_reveal42", "DJI_0042.MP4", 0, 13.8, "w", .5),
    ("w_reveal41", "DJI_0041.MP4", 0, 11.5, "w", .5),
    ("w_hill_s1", "DJI_0021_seg1.MP4", 0, 9.2, "w", .5),
    ("w_hill_s2", "DJI_0021_seg2.MP4", 0, 11.5, "w", .5),
    ("n_hill_s1", "DJI_0021_seg1.MP4", 0, 9.2, "h", .5),
    ("n_hill_s4", "DJI_0021_seg4.MP4", 0, 11.3, "h", .5),
    ("n_forest_s3", "DJI_0012_seg3.MP4", 1.8, 8, "h", .5),
    ("n_forest_s4", "DJI_0012_seg4.MP4", 0, 5.3, "h", .5),
    ("n_forest_s6", "DJI_0012_seg6.MP4", 0, 6.9, "h", .5),
    ("n_forest_s7", "DJI_0012_seg7.MP4", 0, 14, "h", .5),
    ("n_side1", "DJI_0001_seg1.MP4", 2.0, 3.1, "h", .5),
    ("n_side3", "DJI_0001_seg3.MP4", 0, 6.5, "h", .5),
    ("n_gesture5", "DJI_0006_seg5.MP4", 0, 15.7, "h", .55),
    ("n_top_descend", "DJI_0009.MP4", 0, 10.8, "h", .5),
    ("n_vert_bridge", "DJI_0032_seg4.MP4", 0, 19.9, "p", 0),
    ("n_vert_bridge2", "DJI_0032_seg5.MP4", 0, 12.5, "p", 0),
    ("n_vert_grass", "DJI_0036_seg2.MP4", 0, 12.2, "p", 0),
    ("n_export", "DMLP7517_cut.MP4", 0, 17, "scr", 229),
]

def run(c):
    name, f, ss, dur, art, p = c
    if art == "h":
        vf = f"crop=1215:2160:'min(max(iw*{p}-607,0),iw-1215)':0,scale=1080:1920:flags=lanczos"
    elif art == "p":
        vf = "scale=1080:1920:flags=lanczos"
    elif art == "hlg":
        vf = HDR + ",scale=1080:1920:flags=lanczos"
    elif art == "w":
        # Breitbild-Layout: 4:3-Ausschnitt mittig, oben/unten unscharfe Kopie
        vf = None
        fc = (f"[0:v]split[a][b];[a]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,"
              f"gblur=sigma=40,eq=brightness=-0.15[bg];[b]crop='ih*4/3':ih:'min(max(iw*{p}-ih*2/3,0),iw-ih*4/3)':0,"
              f"scale=1080:810:flags=lanczos[fg];[bg][fg]overlay=0:(H-h)/2-60,fps=30,format=yuv420p")
    else:
        vf = f"crop=1180:2098:0:{p},scale=1080:1920:flags=lanczos"
    filt = ["-filter_complex", fc] if vf is None else ["-vf", vf + ",fps=30,format=yuv420p"]
    cmd = ["ffmpeg", "-v", "error", "-y", "-ss", str(ss), "-i", SRC + f, "-t", str(dur), *filt, "-an",
           "-c:v", "libx264", "-crf", "16", "-preset", "fast", "-g", "15", OUT + name + ".mp4"]
    r = subprocess.run(cmd, capture_output=True, text=True)
    return name, r.returncode, r.stderr[-300:]

if __name__ == "__main__":
    sel = [c for c in CLIPS if not sys.argv[1:] or c[0] in sys.argv[1:]]
    with ThreadPoolExecutor(4) as ex:
        for name, rc, err in ex.map(run, sel):
            print(("ok " if rc == 0 else "FEHLER ") + name, err if rc else "")
