#!/usr/bin/env bash
# QA für ein gerendertes Video: technische Daten, schwarze Frames, eingefrorene Stellen, Kontaktbogen.
# Aufruf: bash tools/hyperframes-scooter/qa.sh export/video1_ueberarbeitet.mp4
set -u
f="$1"
name=$(basename "$f" .mp4)
out="$(dirname "$f")/qa"
mkdir -p "$out"
font=/home/user/ai-vatto0/assets/fonts/Poppins-Bold.ttf

echo "== $name"
ffprobe -v error -show_entries stream=codec_type,codec_name,width,height,r_frame_rate,sample_rate,channels \
  -show_entries format=duration,size,bit_rate -of default=nw=1 "$f" | tr '\n' ' '
echo

# Schwarze Frames (mind. 0,1 s, fast schwarz)
blk=$(ffmpeg -v info -i "$f" -vf "blackdetect=d=0.1:pix_th=0.08" -an -f null - 2>&1 | grep -c "black_start")
echo "Schwarze Abschnitte: $blk"

# Eingefrorene Stellen länger als 1,5 s (Standbild ohne jede Bewegung)
frz=$(ffmpeg -v info -i "$f" -vf "freezedetect=n=0.0015:d=1.5" -an -f null - 2>&1 | grep -c "freeze_start")
echo "Eingefrorene Stellen (>1,5 s): $frz"

# Tonspur vorhanden?
aud=$(ffprobe -v error -select_streams a -show_entries stream=codec_name -of csv=p=0 "$f")
echo "Audio-Codec: ${aud:-KEINE}"

# Kontaktbogen: 2 Bilder pro Sekunde mit Zeitstempel
ffmpeg -v error -y -i "$f" -vf "fps=2,scale=216:-2,drawtext=fontfile=$font:text='%{pts\:hms}':x=4:y=4:fontsize=14:fontcolor=yellow:borderw=2,tile=10x5:padding=3" \
  -frames:v 1 "$out/${name}_kontakt.jpg"
echo "Kontaktbogen: $out/${name}_kontakt.jpg"
