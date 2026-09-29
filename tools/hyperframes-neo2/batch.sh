#!/usr/bin/env bash
# Rendert die übergebenen Projekte nacheinander, macht daraus Final- und Chat-Fassung, löscht die Roh-Renders.
cd /home/user/ai-vatto0
for n in "$@"; do
  short=${n#neo2-}; short=${short//-/_}
  (cd videos/$n && timeout 1500 npx --yes hyperframes@0.8.86 render -q delivery --sdr --quiet -o /home/user/ai-vatto0/export/neo2/raw_$short.mp4 > /tmp/render_$n.log 2>&1)
  echo "RENDER $n rc=$?"
  tools/hyperframes-neo2/finish.sh raw_$short.mp4 neo2_$short 2>&1 | grep -E "Schwarze|Eingefroren|Chat-Fassung|duration" | sed "s/^/  /"
  rm -f export/neo2/raw_$short.mp4 && rm -rf export/neo2/work-*
done
echo ALLE_FERTIG
