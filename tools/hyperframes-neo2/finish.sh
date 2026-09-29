#!/usr/bin/env bash
# raw_vN.mp4 -> neo2_vN_name.mp4 (volle Qualität + stille AAC-Spur) + chat/…_chat.mp4 (<30 MB) + QA
set -u
cd /home/user/ai-vatto0/export/neo2
raw="$1"; out="$2"
ffmpeg -v error -y -i "$raw" -f lavfi -i anullsrc=r=44100:cl=stereo -shortest -map 0:v -map 1:a -c:v copy -c:a aac -b:a 128k -movflags +faststart "$out.mp4"
mkdir -p chat
d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$out.mp4")
br=$(python3 -c "print(int(26*8*1000/$d - 140))")   # Ziel ~26 MB
ffmpeg -v error -y -i "$out.mp4" -c:v libx264 -b:v ${br}k -pass 1 -preset slow -an -f mp4 -passlogfile /tmp/p_$out /dev/null
ffmpeg -v error -y -i "$out.mp4" -c:v libx264 -b:v ${br}k -pass 2 -preset slow -passlogfile /tmp/p_$out -c:a aac -b:a 128k -movflags +faststart "chat/${out}_chat.mp4"
bash /home/user/ai-vatto0/tools/hyperframes-neo2/qa.sh "$out.mp4"
ls -la "chat/${out}_chat.mp4" | awk '{print "Chat-Fassung:", $5/1e6, "MB"}'
