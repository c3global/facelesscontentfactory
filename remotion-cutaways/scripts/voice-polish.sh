#!/bin/bash
# Clean up a talking-head voice: low rumble out, static and room hiss down, harsh "s" softened, level evened, a little
# presence, and a soft gate between words. Video is copied untouched, so word times, plans and cutouts stay valid.
#   scripts/voice-polish.sh public/raw/<slug>.mp4            (writes it in place; the original is kept as <slug>.raw-voice.mp4)
# Measured on Tolerance (Nov 13 2026): speech-to-pause gap 18.9 dB before, 22.5 dB after, with about 2 dB more top-end clarity.
# A heavier version (two denoise passes) cleaned more but sounded muffled to Dr. CK; keep the denoise light.
set -e
in="$1"; keep="${in%.mp4}.raw-voice.mp4"
[ -f "$keep" ] || cp "$in" "$keep"
ffmpeg -y -loglevel error -i "$keep" -map 0:v -map 0:a -c:v copy \
  -af "highpass=f=80,afftdn=nr=10:nf=-42:tn=1,deesser=i=0.15,acompressor=threshold=-22dB:ratio=2.2:attack=10:release=150:makeup=1.5,equalizer=f=4000:t=q:w=1.0:g=3,highshelf=f=10000:g=4,agate=threshold=0.018:ratio=3:attack=5:release=220:range=0.2" \
  -c:a aac -b:a 192k "${in%.mp4}.polish.tmp.mp4"
mv "${in%.mp4}.polish.tmp.mp4" "$in"
echo "polished $in (original voice kept in $keep)"
