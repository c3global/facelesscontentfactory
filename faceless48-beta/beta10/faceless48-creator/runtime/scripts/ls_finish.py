"""Finish a Life Scene: picture (clip or PNG sequence) + optional overlay sequence + the cinematic finish + original audio.

Examples
  python3 scripts/ls_finish.py --picture clip.mp4 --out LS_Name.mp4
  python3 scripts/ls_finish.py --picture clip.mp4 --overlay seq/element-%03d.png --out LS_Name.mp4
  python3 scripts/ls_finish.py --picture cam/element-%03d.png --audio-from clip.mp4 --out LS_Name.mp4
  python3 scripts/ls_finish.py --picture clip.mp4 --blackout 5.0 5.6 --out LS_Name.mp4   (M05: hard cut to black and back, never a fade)

Look options (any combination)
  --grade golden|blue     M11 golden-hour / M12 blue-hour color look
  --glow                  M13 soft glow on highlights
  --leaks SEQ             M10 light leaks: OPAQUE leaks sequence (Remotion LSLeaks), screen-blended
  --letterbox [PX]        M15 cinema bars top and bottom (default 150 px each, clear of the text band)
  --flash T [T ...]       M06 flash frame: two frames of white starting at each second T

Finish = light contrast and color lift, light vignette, light grain. Encoded once at 1080x1920, 24 fps.
"""
import argparse
import subprocess

ap = argparse.ArgumentParser()
ap.add_argument('--picture', required=True, help='mp4, or a PNG sequence pattern such as cam/element-%%03d.png')
ap.add_argument('--audio-from', help='clip whose audio to keep (defaults to --picture when it is an mp4)')
ap.add_argument('--overlay', help='PNG sequence pattern with alpha (Remotion overlay)')
ap.add_argument('--blackout', nargs=2, type=float, metavar=('START', 'END'), help='seconds: instant black and back, picture and sound')
ap.add_argument('--no-audio', action='store_true', help='drop the clip audio (for a voiceover that replaces it)')
ap.add_argument('--plain', action='store_true', help='no contrast, saturation or vignette: grain only, for clips already color graded')
ap.add_argument('--grade', choices=['golden', 'blue'])
ap.add_argument('--glow', action='store_true')
ap.add_argument('--leaks', help='opaque PNG/JPEG sequence pattern, screen-blended over the picture')
ap.add_argument('--letterbox', nargs='?', const=150, type=int, metavar='PX')
ap.add_argument('--flash', nargs='+', type=float, metavar='T')
ap.add_argument('--out', required=True)
a = ap.parse_args()

is_seq = '%' in a.picture
audio_src = None if a.no_audio else (a.audio_from or (None if is_seq else a.picture))

cmd = ['ffmpeg', '-v', 'error', '-y']
cmd += ['-framerate', '24', '-i', a.picture] if is_seq else ['-i', a.picture]
n_in = 1
overlay_idx = None
if a.overlay:
    cmd += ['-framerate', '24', '-i', a.overlay]
    overlay_idx = n_in
    n_in += 1
leaks_idx = None
if a.leaks:
    cmd += ['-framerate', '24', '-i', a.leaks]
    leaks_idx = n_in
    n_in += 1
audio_idx = None
if audio_src and audio_src != a.picture:
    cmd += ['-i', audio_src]
    audio_idx = n_in
    n_in += 1
elif audio_src:
    audio_idx = 0

fin = 'noise=alls=3:allf=t' if a.plain else 'eq=contrast=1.04:saturation=1.03,vignette=angle=PI/7,noise=alls=3:allf=t'
GRADES = {
    # warm sunlit: lifts reds and yellows, pulls blue out of the shadows and highlights
    'golden': 'colorbalance=rs=.05:gs=.01:bs=-.07:rm=.07:gm=.025:bm=-.08:rh=.05:gh=.015:bh=-.06,eq=saturation=1.07:contrast=1.03',
    # cool evening: blue in the shadows and mids, a little less warmth, slightly deeper
    'blue': 'colorbalance=rs=-.04:bs=.07:rm=-.05:gm=-.005:bm=.07:rh=-.03:bh=.05,eq=saturation=0.95:brightness=-0.015',
}
pre = ''
if a.grade:
    pre += GRADES[a.grade] + ','
if a.glow:
    # keep only the bright part, blur it wide, screen it back at low strength
    pre += ("format=gbrp,split[gl0][gl1];[gl1]curves=all='0/0 0.62/0 0.85/0.5 1/1',gblur=sigma=30[glb];"
            "[gl0][glb]blend=all_mode=screen:all_opacity=0.5,")
chain = f'[0:v]scale=1080:1920:flags=lanczos,{pre}{fin},format=yuva420p[b]'
last = '[b]'
if leaks_idx is not None:
    # screen must be blended in RGB; in YUV it shifts the chroma planes and turns the picture magenta
    chain += f';[b]format=gbrp[bg];[{leaks_idx}:v]scale=1080:1920,format=gbrp[lk];[bg][lk]blend=all_mode=screen:all_opacity=0.9,format=yuva420p[bl]'
    last = '[bl]'
if overlay_idx is not None:
    chain += f';{last}[{overlay_idx}:v]overlay=format=auto[o]'
    last = '[o]'
tail = ''
if a.letterbox:
    h = a.letterbox
    tail += f'drawbox=x=0:y=0:w=iw:h={h}:color=black@1:t=fill,drawbox=x=0:y=ih-{h}:w=iw:h={h}:color=black@1:t=fill,'
for ft in (a.flash or []):
    t1, t2 = ft + 2 / 24, ft + 1 / 24
    # frame one is near full white, frame two eases off, like a real flash
    tail += (f"drawbox=x=0:y=0:w=iw:h=ih:color=white@0.92:t=fill:enable='between(t,{ft:.4f},{t2:.4f})',"
             f"drawbox=x=0:y=0:w=iw:h=ih:color=white@0.45:t=fill:enable='between(t,{t2:.4f},{t1:.4f})',")
tail += 'format=yuv420p'
if a.blackout:
    s, e = a.blackout
    tail = tail[:-len('format=yuv420p')] + f"drawbox=x=0:y=0:w=iw:h=ih:color=black@1:t=fill:enable='between(t,{s},{e})',format=yuv420p"
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
