#!/bin/bash
# n-<slug>: flash scan, -14 LUFS master, review copy
s=$1
cd "$(dirname "$0")/.."
mkdir -p out/final out/review
nice python3 work/flash.py n-$s
nice ffmpeg -y -loglevel error -i out/n-$s.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:a aac -b:a 192k -movflags +faststart out/final/$s.mp4
# delivery copy: two-pass slow encode at the highest bitrate that stays under the ~28 MB upload limit (max 14 Mbps)
dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 out/final/$s.mp4)
kb=$(python3 -c "print(min(14000, int(27.5*8*1024/$dur - 200)))")
cd out && nice ffmpeg -y -loglevel error -i final/$s.mp4 -c:v libx264 -preset slow -b:v ${kb}k -pass 1 -passlogfile /tmp/x264-$s -an -f mp4 /dev/null && nice ffmpeg -y -loglevel error -i final/$s.mp4 -c:v libx264 -preset slow -b:v ${kb}k -maxrate $((kb*3/2))k -bufsize $((kb*2))k -pass 2 -passlogfile /tmp/x264-$s -c:a copy -movflags +faststart review/$s.mp4; cd ..
echo "finished $s $(du -h out/review/$s.mp4 | cut -f1)"
