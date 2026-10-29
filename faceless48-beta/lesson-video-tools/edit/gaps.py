import numpy as np,wave,sys
def load(n):
    w=wave.open(f'a{n}.wav');x=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).astype(np.float32)/32768;return x
def feats(x,sr=16000):
    hop=160;n=len(x)//hop;rms=np.array([np.sqrt(np.mean(x[i*hop:(i+1)*hop]**2)) for i in range(n)])
    # periodicity per 30ms window
    per=np.zeros(n)
    for i in range(n):
        s=x[i*hop:i*hop+480]
        if len(s)<480 or rms[i]<1e-4: continue
        s=s-s.mean();ac=np.correlate(s,s,'full')[len(s)-1:];ac/=ac[0]+1e-9
        per[i]=ac[53:230].max()   # 70-300 Hz
    return rms,per
def words(n):
    return [(float(a),float(b),w) for a,b,w in (l.rstrip('\n').split('\t') for l in open(f'words{n}.tsv'))]
if __name__=='__main__':
    n=sys.argv[1];x=load(n);rms,per=feats(x);floor=np.percentile(rms,10)
    w=words(n);print('floor',floor,'words',len(w))
    cands=[];gaps=[]
    for (a0,a1,aw),(b0,b1,bw) in zip(w,w[1:]):
        g=b0-a1
        if g>=0.2:
            i0,i1=int(a1*100),int(b0*100)
            seg=slice(i0,i1);r=rms[seg];p=per[seg]
            voiced=float(np.mean((r>max(floor*4,0.004))&(p>0.5))) if len(r) else 0
            gaps.append(g)
            if voiced>0.45 and g>=0.25: cands.append((round(a1,2),round(b0,2),round(g,2),round(voiced,2),aw,bw))
    print('gaps>=0.2:',len(gaps),'total',round(sum(gaps),1),'s; >1s:',sum(1 for g in gaps if g>1))
    print('voiced-gap candidates (likely um/uh):',len(cands))
    for c in cands[:60]: print(c)
