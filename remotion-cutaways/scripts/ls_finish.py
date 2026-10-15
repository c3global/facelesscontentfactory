"""Finish a Life Scene: picture (clip or PNG sequence) + optional overlay sequence + the cinematic finish + original audio.

Examples
  python3 scripts/ls_finish.py --picture clip.mp4 --out LS_Name.mp4
  python3 scripts/ls_finish.py --picture clip.mp4 --overlay seq/element-%03d.png --out LS_Name.mp4
  python3 scripts/ls_finish.py --picture cam/element-%03d.png --audio-from clip.mp4 --out LS_Name.mp4
  python3 scripts/ls_finish.py --picture clip.mp4 --blackout 5.0 5.6 --out LS_Name.mp4   (M05: hard cut to black and back, never a fade)

Finish = light contrast and color lift, light vignette, light grain. Encoded once at 1080x1920, 24 fps.
"""
import argparse
import subprocess

ap = argparse.ArgumentParser()
ap.add_argument('--picture', required=True, help='mp4, or a PNG sequence pattern such as cam/element-%%03d.png')
ap.add_argument('--audio-from', help='clip whose audio to keep (defaults to --picture when it is an mp4)')
ap.add_argument('--overlay', help='PNG sequence pattern with alpha (Remotion overlay)')
ap.add_argument('--blackout', nargs=2, type=float, metavar=('START', 'END'), help='seconds: instant black and back, picture and sound')
ap.add_argument('--out', required=True)
a = ap.parse_args()

is_seq = '%' in a.picture
audio_src = a.audio_from or (None if is_seq else a.picture)

cmd = ['ffmpeg', '-v', 'error', '-y']
cmd += ['-framerate', '24', '-i', a.picture] if is_seq else ['-i', a.picture]
n_in = 1
overlay_idx = None
if a.overlay:
    cmd += ['-framerate', '24', '-i', a.overlay]
    overlay_idx = n_in
    n_in += 1
audio_idx = None
if audio_src and audio_src != a.picture:
    cmd += ['-i', audio_src]
    audio_idx = n_in
    n_in += 1
elif audio_src:
    audio_idx = 0

fin = 'eq=contrast=1.04:saturation=1.03,vignette=angle=PI/7,noise=alls=3:allf=t'
chain = f'[0:v]scale=1080:1920:flags=lanczos,{fin},format=yuva420p[b]'
last = '[b]'
if overlay_idx is not None:
    chain += f';[b][{overlay_idx}:v]overlay=format=auto[o]'
    last = '[o]'
tail = 'format=yuv420p'
if a.blackout:
    s, e = a.blackout
    tail = f"drawbox=x=0:y=0:w=iw:h=ih:color=black@1:t=fill:enable='between(t,{s},{e})',format=yuv420p"
chain += f';{last}{tail}[v]'
maps = ['-map', '[v]']
if audio_idx is not None:
    af = f'[{audio_idx}:a]anull[a]'
    if a.blackout:
        af = f"[{audio_idx}:a]volume=0:enable='between(t,{a.blackout[0]},{a.blackout[1]})'[a]"
    chain += ';' + af
    maps += ['-map', '[a]']
cmd += ['-filter_complex', chain] + maps
cmd += ['-c:v', 'libx264', '-crf', '18', '-maxrate', '14M', '-bufsize', '28M', '-preset', 'slow', '-r', '24']
if audio_idx is not None:
    cmd += ['-c:a', 'aac', '-b:a', '192k']
cmd += ['-movflags', '+faststart', '-shortest', a.out]
subprocess.run(cmd, check=True)
print('wrote', a.out)
