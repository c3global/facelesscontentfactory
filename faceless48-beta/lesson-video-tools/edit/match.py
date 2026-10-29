import cv2,glob,json,sys,numpy as np
def load(n):
    return sorted(glob.glob(f'ocr/f{n}/*.jpg'))
def crop(f,b):
    im=cv2.imread(f,cv2.IMREAD_GRAYSCALE);x0,y0,x1,y1=b
    return im[y0:y1,x0:x1].astype(np.float32)
def scan(n,tref,box,thr,srch=None):
    files=load(n);ref=crop(files[tref],box);out=[]
    for i,f in enumerate(files):
        c=crop(f,box);d=float(np.abs(c-ref).mean());out.append((i,d))
    return out
def ranges(out,thr,gap=2):
    ts=[i for i,d in out if d<thr];rng=[];s=p=None
    for t in ts:
        if s is None:s=p=t
        elif t-p<=gap:p=t
        else:rng.append((s,p));s=p=t
    if s is not None:rng.append((s,p))
    return rng
items={
 'L1 bookmarks':(1,10,(0,0,1920,40),6),
 'L1 chrome-band2':(1,10,(0,0,1920,18),6),
 'L1 env FAB':(1,96,(880,440,1060,472),5),
 'L2 chrome':(2,28,(0,0,1920,115),6),
 'L2 url tooltip':(2,142,(915,555,1185,635),6),
 'L3 users path':(3,57,(670,935,780,970),6),
 'L3 share people':(3,105,(610,530,830,575),6),
}
if __name__=='__main__':
    for name,(n,t,box,thr) in items.items():
        out=scan(n,t,box,thr)
        print(name,'ref d-range',min(d for i,d in out),'->',ranges(out,thr))
