#!/usr/bin/env bash
# Einrichtung des Video-Cutting-Agenten (Linux, WSL 2, Cloud-Session). Mehrfach ausführbar.
#   bash video-cutter/tools/setup.sh
# Installiert: npm-Pakete (HyperFrames 0.8.77 fest gepinnt), offizielle HyperFrames-Skills
# (general-video, motion-graphics + Core), Render-Chrome, whisper.cpp (lokal gebaut) + Modell "small".
# Sendet keine Medien irgendwohin. Telemetrie von HyperFrames wird abgeschaltet.
set -uo pipefail
DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$DIR"
export HYPERFRAMES_NO_TELEMETRY=1 DO_NOT_TRACK=1
FAIL=0
HF="node $DIR/node_modules/hyperframes/bin/hyperframes.mjs"

command -v ffmpeg >/dev/null && command -v ffprobe >/dev/null || { echo "[cutter] ffmpeg fehlt → zuerst bash tools/video-maschine/setup.sh"; FAIL=1; }
command -v node >/dev/null || { echo "[cutter] Node.js ≥ 22 fehlt"; exit 1; }

[ -d node_modules/hyperframes ] || { echo "[cutter] npm-Pakete …"; npm ci --no-audit --no-fund >/dev/null || { echo "[cutter] FEHLER npm ci"; FAIL=1; }; }
$HF telemetry disable >/dev/null 2>&1 || true

echo "[cutter] offizielle Skills …"
$HF skills update general-video motion-graphics >/dev/null 2>&1 || { echo "[cutter] WARNUNG: Skills-Update fehlgeschlagen (GitHub erreichbar?)"; }

echo "[cutter] Render-Chrome …"
$HF browser ensure >/dev/null 2>&1 || { echo "[cutter] FEHLER: browser ensure"; FAIL=1; }

WBIN="$HOME/.cache/hyperframes/whisper/whisper.cpp/build/bin/whisper-cli"
# Auf einem anderen Prozessor gebaute Binärdatei stürzt mit "Illegal instruction" ab → neu bauen
if [ -x "$WBIN" ] && ! "$WBIN" --help >/dev/null 2>&1; then echo "[cutter] whisper-cli läuft auf diesem Prozessor nicht → Neubau"; rm -rf "$HOME/.cache/hyperframes/whisper/whisper.cpp"; fi
if ! command -v whisper-cli >/dev/null && [ ! -x "$WBIN" ]; then
  echo "[cutter] whisper.cpp bauen (2–4 Min.) …"
  command -v cmake >/dev/null || { echo "[cutter] FEHLER: cmake + C-Compiler nötig"; FAIL=1; }
  mkdir -p "$HOME/.cache/hyperframes/whisper"
  ( cd "$HOME/.cache/hyperframes/whisper" && rm -rf whisper.cpp && git clone -q --depth 1 https://github.com/ggml-org/whisper.cpp.git && cd whisper.cpp && cmake -B build -DGGML_NATIVE=OFF >/dev/null && cmake --build build --config Release -j >/dev/null ) || { echo "[cutter] FEHLER: whisper.cpp-Build"; FAIL=1; }
fi
M="$HOME/.cache/hyperframes/whisper/models/ggml-small.bin"
if [ ! -s "$M" ]; then
  echo "[cutter] whisper-Modell small (~470 MB) …"
  mkdir -p "$(dirname "$M")"
  curl -fsSL -o "$M" https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin || { echo "[cutter] FEHLER: Modell-Download"; rm -f "$M"; FAIL=1; }
fi

echo "[cutter] $($HF --version 2>/dev/null | head -1) · $($HF doctor 2>&1 | grep -E 'whisper-cpp|Chrome ' | sed 's/  */ /g' | tr '\n' ' ')"
[ "$FAIL" -eq 0 ] && echo "[cutter] Video-Cutting-Agent bereit." || echo "[cutter] Unvollständig, siehe oben."
exit "$FAIL"
