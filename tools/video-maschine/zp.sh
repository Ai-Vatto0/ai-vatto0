#!/usr/bin/env bash
# Kamerafahrt über ein Standbild (Faruks Maschine, Kapitel 5.3).
#
# Aufruf: zp.sh BILD DAUER_S ZOOM_START ZOOM_ENDE XDRIFT_START XDRIFT_ENDE YDRIFT_START YDRIFT_ENDE AUSGABE.mp4
#
# Beispiele:
#   Makro-Reveal:  zp.sh bild.png 2.0 2.3 1.0 0 0 0 0 shot1.mp4
#   Push-in:       zp.sh bild.png 1.8 1.0 1.4 0 0 0 -40 shot2.mp4
#
# Richtwerte: Shots 1–2,5 s, Schnitte auf Satzanfänge.
set -euo pipefail

if [ "$#" -ne 9 ]; then
  sed -n '2,9p' "$0" >&2
  exit 2
fi

IMG=$1 DUR=$2 Z0=$3 Z1=$4 X0=$5 X1=$6 Y0=$7 Y1=$8 OUT=$9
N=$(python3 -c "print(int(round(float('$DUR')*30)))")

ffmpeg -hide_banner -loglevel error -y -loop 1 -i "$IMG" -vf \
  "zoompan=z='$Z0+($Z1-$Z0)*on/$N':x='iw/2-(iw/zoom/2)+$X0+($X1-$X0)*on/$N':y='ih/2-(ih/zoom/2)+$Y0+($Y1-$Y0)*on/$N':d=$N:s=1080x1920:fps=30,vignette=PI/4.4,noise=alls=6:allf=t+u,format=yuv420p" \
  -frames:v "$N" -c:v libx264 -crf 18 "$OUT"
