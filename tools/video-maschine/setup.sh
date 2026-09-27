#!/usr/bin/env bash
# Installiert die Werkzeuge für Faruks TikTok-Shop-Video-Maschine (Linux/WSL).
# Mehrfach ausführbar: überspringt, was schon da ist.
#
# Cloud: als Setup-Script in den Environment-Einstellungen eintragen:
#   bash tools/video-maschine/setup.sh
# Windows: in WSL 2 ausführen oder ffmpeg + Python-Pakete manuell installieren.
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
FAIL=0

if ! command -v ffmpeg >/dev/null || ! command -v ffprobe >/dev/null; then
  echo "[setup] ffmpeg installieren…"
  SUDO=""; [ "$(id -u)" -ne 0 ] && SUDO="sudo"
  $SUDO apt-get update -qq && $SUDO apt-get install -y -qq ffmpeg >/dev/null || { echo "[setup] FEHLER: ffmpeg"; FAIL=1; }
fi

if ! python3 -c "import PIL, numpy, faster_whisper" 2>/dev/null; then
  echo "[setup] Python-Pakete installieren…"
  python3 -m pip install --quiet Pillow numpy faster-whisper || { echo "[setup] FEHLER: pip"; FAIL=1; }
fi

[ -f "$ROOT/assets/fonts/Poppins-Bold.ttf" ] || { echo "[setup] FEHLER: assets/fonts/Poppins-Bold.ttf fehlt"; FAIL=1; }

echo "[setup] ffmpeg:  $(ffmpeg -version 2>/dev/null | head -1 | cut -d' ' -f3)"
echo "[setup] python:  $(python3 -c 'import PIL,numpy,faster_whisper;print("Pillow",PIL.__version__,"numpy",numpy.__version__,"faster-whisper",faster_whisper.__version__)' 2>/dev/null)"
[ "$FAIL" -eq 0 ] && echo "[setup] Video-Maschine bereit." || echo "[setup] Unvollständig, siehe Fehler oben."
exit "$FAIL"
