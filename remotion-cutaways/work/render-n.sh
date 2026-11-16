#!/bin/bash
cd "$(dirname "$0")/.."
export REMOTION_LOCAL_FONTS=1 REMOTION_BROWSER_EXECUTABLE=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome RENDER_CONCURRENCY=1
for s in "$@"; do
  echo "start $s $(date +%H:%M)" >> work/nov-status.log
  rm -f out/n-$s.mp4
  npx tsx scripts/render-batch.mjs n-$s > work/render-n-$s.log 2>&1 && echo "rendered $s $(date +%H:%M)" >> work/nov-status.log && bash work/finish-n.sh $s >> work/nov-status.log 2>&1 || echo "FAIL render $s" >> work/nov-status.log
  find /tmp -maxdepth 1 -name "remotion-webpack-bundle-*" -mmin +1 -exec rm -rf {} + 2>/dev/null
done
