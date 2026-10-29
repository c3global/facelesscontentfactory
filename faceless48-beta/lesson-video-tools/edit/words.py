import json,sys,re
def words(n):
    d=json.load(open(f'tr{n}.json'));out=[]
    cur=None
    for seg in d['transcription']:
        for t in seg['tokens']:
            tx=t['text']
            if tx.startswith('[') or not tx.strip(): continue
            s,e=t['offsets']['from']/1000,t['offsets']['to']/1000
            if tx.startswith(' ') or cur is None:
                if cur: out.append(cur)
                cur=[s,e,tx.strip()]
            else:
                cur[2]+=tx;cur[1]=e
    if cur: out.append(cur)
    return out
if __name__=='__main__':
    n=sys.argv[1]
    w=words(n)
    with open(f'words{n}.tsv','w') as f:
        for s,e,x in w: f.write(f'{s:.2f}\t{e:.2f}\t{x}\n')
    print(len(w))
