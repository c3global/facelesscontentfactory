import json,re,sys
from rapidocr_onnxruntime import RapidOCR
eng=RapidOCR()
jobs={3:range(196,241),4:range(0,86)}
out={}
pat=re.compile(r"drive\.g|drlve|folders|usp=|sharing|1_?zeh|zehp|https?:|//drive",re.I)
for n,rng in jobs.items():
    out[n]={}
    for t in rng:
        res,_=eng(f'ocr/f{n}/{t+1:04d}.jpg')
        b=[[round(x[0][0]),round(x[0][1]),round(x[2][0]),round(x[2][1]),txt] for x,txt,c in (res or []) if pat.search(txt)]
        out[n][t]=b
        json.dump(out,open('urlocr.json','w'))
print('done')
