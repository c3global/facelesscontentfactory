import sys,os,json,re
sys.path.insert(0,'/tmp/claude-0/lessons')
import edit
def build(n):
    spec=json.load(open(f'spec{n}.json' if n!=1 else 'spec1_t.json'))
    words=edit.load_words(spec['words'])
    rms=edit.energy_frames(spec['audio'])
    import subprocess
    dur=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',spec['src']]).decode())
    if spec.get('keep_all') or n==1: kept=words
    else: _,kept=edit.build_keep(words,spec.get('cuts',[]),dur,rms)
    cw=[(s,e,edit.clean_text(w)) for s,e,w in kept]
    seq=spec.get('seqfix',[])
    if n==1: seq=seq+[[['Faceless','48'],['Faceless48']],[['clawed','code'],['Claude','Code']],[['codecs'],['Codex']],[['chat','GPT'],['ChatGPT']]]
    cw=edit.apply_seqfix(cw,seq)
    cw=[w for w in cw if w[2].strip()]
    # demo playback parts in lesson 9 are the sample video's words, not narration
    nocap=spec.get('nocap',[])
    marks=[]
    toks=[]
    for s,e,w in cw:
        if any(a<=s<b for a,b in nocap):
            if not marks or marks[-1]!=len(toks): marks.append(len(toks))
            continue
        toks.append(w)
    return toks
def paragraphs(toks,per=4):
    sents=[];cur=[]
    for t in toks:
        cur.append(t)
        if re.search(r'[.?!]["”]?$',t) and not re.fullmatch(r'(Dr|Mr|Mrs|St)\.',t): sents.append(' '.join(cur));cur=[]
    if cur: sents.append(' '.join(cur))
    paras=[];i=0
    while i<len(sents):
        paras.append(' '.join(sents[i:i+per]));i+=per
    return paras
if __name__=='__main__':
    for n in map(int,sys.argv[1:]):
        os.chdir('/tmp/claude-0/lessons')
        t=paragraphs(build(n))
        open(f'transcript{n}.txt','w').write('\n\n'.join(t))
        print(n,len(t),'paragraphs',sum(len(p.split()) for p in t),'words')
