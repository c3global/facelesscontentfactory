import sys,json,glob,os,subprocess
import numpy as np
from PIL import Image
from rapidocr_onnxruntime import RapidOCR
eng=RapidOCR()
for n in sys.argv[1:]:
    d=f'ocrout/f{n}';os.makedirs(d,exist_ok=True)
    subprocess.run(['ffmpeg','-v','error','-y','-i',f'out/lesson{n}.mp4','-vf','fps=1','-q:v','3',f'{d}/%04d.jpg'],check=True)
    files=sorted(glob.glob(f'{d}/*.jpg'));out={};last=None;lastt=-99
    for f in files:
        t=int(os.path.basename(f)[:4])-1
        g=np.asarray(Image.open(f).convert('L').resize((192,108)),dtype=np.float32)
        # ignore the avatar corner (bottom-left) when comparing
        g2=g.copy();g2[60:,:50]=0
        if last is not None and np.abs(g2-last).mean()<1.2 and t-lastt<8: continue
        last=g2;lastt=t
        res,_=eng(f)
        out[t]=[[round(b[0][0]),round(b[0][1]),round(b[2][0]),round(b[2][1]),txt] for b,txt,c in (res or [])]
        json.dump(out,open(f'ocrout/ocr{n}.json','w'))
    print('done',n,len(out),'of',len(files),flush=True)
open('ocrout/ocr.done','w').write('x')
