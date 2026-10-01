#!/usr/bin/env bash
# Selbsttest der ganzen Kette mit einem SYNTHETISCHEN Clip (Computerstimme, Timecode im Bild).
# Erwartet: Versprecher/verworfener Take und 3 lange Pausen werden entfernt, QA ohne Fehler.
#   bash tools/selbsttest.sh        (braucht zusätzlich espeak-ng)
set -euo pipefail
cd "$(dirname "$0")/.."
command -v espeak-ng >/dev/null || { echo "espeak-ng fehlt (nur für den Selbsttest): apt-get install espeak-ng"; exit 1; }
JOB=selbsttest
rm -rf "jobs/$JOB"
node tools/testclip.mjs --out material/SELBSTTEST-synthetisch.mp4
node tools/quelle.mjs $JOB material/SELBSTTEST-synthetisch.mp4
node tools/transkript.mjs $JOB
node tools/schnittplan.mjs $JOB | tee "/tmp/$JOB-plan.log"
grep -q "verworfener_take" "/tmp/$JOB-plan.log" || { echo "✗ verworfener Take nicht erkannt"; exit 1; }
[ "$(grep -c '✂ .* pause:' "/tmp/$JOB-plan.log")" -ge 2 ] || { echo "✗ lange Pausen nicht erkannt"; exit 1; }
cp jobs/test/broll-schnittplan.json "jobs/$JOB/broll-schnittplan.json"
node tools/pruefe-plan.mjs $JOB
node tools/baue.mjs $JOB
node tools/render.mjs $JOB
echo "✓ Selbsttest durchgelaufen – Bericht: jobs/$JOB/qa/"
