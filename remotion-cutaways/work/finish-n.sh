#!/bin/bash
# n-<slug>: flash scan, -14 LUFS master, review copy
s=$1
cd "$(dirname "$0")/.."
mkdir -p out/final out/review
nice python3 work/flash.py n-$s
nice ffmpeg -y -loglevel error -i out/n-$s.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:a aac -b:a 192k -movflags +faststart out/final/$s.mp4
nice ffmpeg -y -loglevel error -i out/final/$s.mp4 -c:v libx264 -b:v 3800k -maxrate 4800k -bufsize 8000k -c:a copy out/review/$s.mp4
echo "finished $s $(du -h out/review/$s.mp4 | cut -f1)"
