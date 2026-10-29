import cv2,glob,json,sys,numpy as np
def dots(img):
    red=cv2.inRange(img,(0,0,190),(130,130,255))      # BGR
    yel=cv2.inRange(img,(0,140,190),(120,255,255))
    grn=cv2.inRange(img,(0,140,0),(120,255,120))
    def cents(m):
        n,lab,st,cen=cv2.connectedComponentsWithStats(m)
        return [(cen[i][0],cen[i][1],st[i][4]) for i in range(1,n) if 25<=st[i][4]<=300 and 0.6<st[i][2]/max(1,st[i][3])<1.6]
    return cents(red),cents(yel),cents(grn)
res={}
for n in sys.argv[1:]:
    out={}
    files=sorted(glob.glob(f'ocr/f{n}/*.jpg'))
    for f in files:
        t=int(f[-8:-4])-1
        img=cv2.imread(f)
        R,Y,G=dots(img);hits=[]
        for rx,ry,_ in R:
            for yx,yy,_ in Y:
                if abs(yy-ry)<4 and 12<yx-rx<28:
                    for gx,gy,_ in G:
                        if abs(gy-ry)<4 and 12<gx-yx<28: hits.append((round(rx),round(ry)))
        if hits: out[t]=hits
    res[n]=out
    print(n,len(out),'frames with window lights')
json.dump(res,open('lights.json','w'))
