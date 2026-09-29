#!/usr/bin/env bash
# Beste Fassung unter 30 MB (Chat-Grenze): Original, wenn < 29 MB, sonst H.265 2-Pass auf ~28,5 MB (hvc1 für iPhone).
cd /home/user/ai-vatto0/export/neo2 && mkdir -p hq
for f in "$@"; do
  n=$(basename "$f" .mp4); s=$(stat -c %s "$f")
  if [ "$s" -lt 29000000 ]; then cp "$f" "hq/${n}_HQ.mp4"; echo "$n original"; continue; fi
  d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f"); br=$(python3 -c "print(int(28.5*8*1000/$d - 140))")
  ffmpeg -v error -y -i "$f" -c:v libx265 -b:v ${br}k -preset medium -x265-params pass=1:stats=/tmp/x265_$n.log:log-level=error -an -f mp4 /dev/null &&
  ffmpeg -v error -y -i "$f" -c:v libx265 -b:v ${br}k -preset medium -x265-params pass=2:stats=/tmp/x265_$n.log:log-level=error -tag:v hvc1 -c:a aac -b:a 128k -movflags +faststart "hq/${n}_HQ.mp4" &&
  echo "$n hevc $(stat -c %s hq/${n}_HQ.mp4)"
done
