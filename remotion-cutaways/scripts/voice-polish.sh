#!/bin/bash
# Clean up a talking-head voice: low rumble out, static and room hiss down, harsh "s" softened, level evened, a little
# presence, and a soft gate between words. Video is copied untouched, so word times, plans and cutouts stay valid.
#   scripts/voice-polish.sh public/raw/<slug>.mp4            (writes it in place; the original is kept as <slug>.raw-voice.mp4)
# Measured on Tolerance (Nov 13 2026): speech-to-pause gap 18.9 dB before, 25.6 dB after.
set -e
in="$1"; keep="${in%.mp4}.raw-voice.mp4"
[ -f "$keep" ] || cp "$in" "$keep"
ffmpeg -y -loglevel error -i "$keep" -map 0:v -map 0:a -c:v copy \
  -af "highpass=f=90,afftdn=nr=20:nf=-38:tn=1,deesser=i=0.3,acompressor=threshold=-22dB:ratio=2.5:attack=8:release=120:makeup=1.5,afftdn=nr=16:nf=-40,equalizer=f=3200:t=q:w=1.2:g=2,agate=threshold=0.02:ratio=4:attack=5:release=200:range=0.12" \
  -c:a aac -b:a 192k "${in%.mp4}.polish.tmp.mp4"
mv "${in%.mp4}.polish.tmp.mp4" "$in"
echo "polished $in (original voice kept in $keep)"
