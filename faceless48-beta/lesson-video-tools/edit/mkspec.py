import json,os,re
L=json.load(open('lights.json'))
def track(n,t0,t1,ext=(28,20,895,665)):
    """per-second window boxes from the traffic-light detections, interpolated across short gaps"""
    d={int(k):v[0] for k,v in L[str(n)].items() if t0<=int(k)<=t1}
    ks=sorted(d)
    out={}
    for t in range(t0-1,t1+2):
        k=min(ks,key=lambda s:abs(s-t));x,y=d[k]
        out[str(t)]=[x-ext[0],y-ext[1],x+ext[2],y+ext[3]]
    return out
def finder(n,a,b,ext=(28,20,340,640)):
    return {'t0':a-1.2,'t1':b+1.8,'track':track(n,a,b,ext)}
def urlboxes(n,t0,t1,pad=14,extra=()):
    """link boxes from the scan (every 2 s, only frames where the link text was found). Each sample covers +-1 s,
    using the union with its neighbours so a fast scroll between samples stays covered."""
    U=json.load(open('urlocr.json')).get(str(n),{})
    pts=[]
    for t,b in sorted(U.items(),key=lambda x:int(x[0])):
        t=int(t)
        if not(t0<=t<=t1) or not b: continue
        # only boxes whose text looks like the link (not ordinary words that happen to contain "folders")
        keep=[v for v in b if re.search(r"drive\.g|drlve|foiders|usp=|sharing|zehp|https?:",v[4],re.I)]
        if not keep: continue
        pts.append((t,[min(v[0] for v in keep)-pad,min(v[1] for v in keep)-pad,max(v[2] for v in keep)+pad,max(v[3] for v in keep)+pad]))
    items=[]
    for i,(t,bx) in enumerate(pts):
        u=list(bx)
        for j in (i-1,i+1):
            if 0<=j<len(pts) and abs(pts[j][0]-t)<=2.1:
                o=pts[j][1]
                if abs(o[1]-u[1])<=160 or (o[1]<=u[3] and o[3]>=u[1]):
                    u=[min(u[0],o[0]),min(u[1],o[1]),max(u[2],o[2]),max(u[3],o[3])]
                else:
                    items.append({'t0':t-1.0,'t1':t+1.0,'box':o})
        items.append({'t0':t-1.0,'t1':t+1.0,'box':u})
    for a,b,box in extra: items.append({'t0':a,'t1':b,'box':box})
    return items
specs={}
specs[1]={'n':1,'src':'t1.mp4','out':'out/lesson1.mp4','words':'words1.tsv','audio':'a1.wav','tighten':False,'cuts':[[94.30,108.20]],'captions':False,'loudnorm':False,
 'blur':[{'t0':0,'t1':32.6,'box':[0,0,1920,40]},finder(1,54,69,(28,20,340,565)),
         {'t0':70.5,'t1':112.5,'box':[870,440,1062,476]},{'t0':110.5,'t1':120.5,'box':[870,440,1062,476]},{'t0':129.5,'t1':145.5,'box':[870,440,1062,476]}]}
specs[2]={'n':2,'src':'t2.mp4','out':'out/lesson2.mp4','words':'words2.tsv','audio':'a2.wav','captions':True,
 'blur':[{'t0':26.8,'t1':30.8,'box':[0,0,1920,115]},{'t0':140.8,'t1':145.3,'box':[905,545,1190,645]},finder(2,142,172)]}
specs[3]={'n':3,'src':'t3.mp4','out':'out/lesson3.mp4','words':'words3.tsv','audio':'a3.wav','captions':True,
 'blur':[finder(3,46,57),finder(3,62,67),finder(3,170,173),
         {'t0':54.8,'t1':62.4,'box':[660,935,790,1010]},{'t0':171.8,'t1':194.4,'box':[660,982,768,1056]},
         {'t0':103.8,'t1':119.5,'box':[578,535,1000,580]},{'t0':99.8,'t1':120.5,'box':[1790,0,1920,40]}]+[{'t0':193.6,'t1':227.2,'box':[735,346,1280,404]},{'t0':227.0,'t1':233.0,'box':[735,336,1280,845]},{'t0':232.8,'t1':240.6,'box':[735,346,1280,404]}]}
specs[4]={'n':4,'src':'t4.mp4','out':'out/lesson4.mp4','words':'words4.tsv','audio':'a4.wav','captions':True,'blur':[{'t0':0,'t1':6.2,'box':[720,850,1260,935]},{'t0':5.0,'t1':12.6,'box':[720,35,1260,940]},{'t0':68.5,'t1':72.5,'box':[700,0,1230,62]}]}
specs[2]['cuts']=[[120.20,122.55],[153.95,154.25],[159.90,161.85],[560.25,561.30]]
specs[2]['seqfix']=[[['Jog,','AI,'],['Jogg.ai,']],[['MediaPlace,','.io,'],['MediaPlace.io,']],[['Content','OS','dock'],['ContentOS','doc']],[['Content','OS'],['ContentOS']],[['Faceless','48'],['Faceless48']]]
specs[3]['cuts']=[[43.10,54.40]]
specs[3]['seqfix']=[[['Faceless','48'],['Faceless48']]]
specs[4]['cuts']=[[249.55,251.50],[309.55,311.15]]
specs[4]['seqfix']=[[['Dr.','CC'],['Dr.','CiCi']],[['Dr.','C-E-C-E'],['Dr.','Cece']],[['Dr.','C-C'],['Dr.','CiCi']],[['Chat','GPT'],['ChatGPT']],[['Lofi'],['Lo-fi']],[['Faceless','48'],['Faceless48']]]
specs[9]={'n':9,'src':'t9.mp4','out':'out/lesson9.mp4','words':'words9.tsv','audio':'a9.wav','keep_all':True,'captions':True,
 'blur':[{'t0':15.5,'t1':136.5,'box':[0,0,1920,72]},{'t0':500.5,'t1':551,'box':[0,0,1920,72]},{'t0':100.5,'t1':141.3,'box':[0,350,135,860]}],
 'nocap':[[383.0,409.7],[416.4,441.2]],
 'seqfix':[[['Faceless','48'],['Faceless48']],[['Dr.','CC'],['Dr.','CiCi']],[['Stop','Keys','Example'],['Stock','Keys','Example']]]}
for n,s in specs.items(): json.dump(s,open(f'spec{n}.json','w'),indent=1)
print('ok',{n:len(s['blur']) for n,s in specs.items()})
