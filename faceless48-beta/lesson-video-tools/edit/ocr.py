import sys,json,glob,os,subprocess
from rapidocr_onnxruntime import RapidOCR
eng=RapidOCR()
for n in (1,2,3,4):
    d=f'ocr/f{n}';os.makedirs(d,exist_ok=True)
    subprocess.run(['ffmpeg','-v','error','-y','-i',f't{n}.mp4','-vf','fps=0.5','-q:v','3',f'{d}/%04d.jpg'],check=True)
    out={}
    for f in sorted(glob.glob(f'{d}/*.jpg')):
        t=(int(os.path.basename(f)[:4])-1)*2.0
        res,_=eng(f)
        out[t]=[[b[0][0],b[0][1],b[2][0],b[2][1],txt] for b,txt,c in (res or [])]
        json.dump(out,open(f'ocr/ocr{n}.json','w'))
    print('done',n,flush=True)
open('ocr/ocr.done','w').write('x')
