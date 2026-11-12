import json
V="backdrops/red-velvet.jpg"
def words(slug):
    return [(w,float(a),float(b)) for w,a,b in (l.rstrip('\n').split('\t') for l in open(f'content/{slug}.words.tsv'))]
def mk(slug,dur,music,scenes,fx,end_at,hero,emph):
    return {"slug":slug,"video":f"raw/{slug}.mp4","durationSec":dur,"theme":{"field":"black","sans":"DM Sans"},"emphasis":emph,"captionStyle":"editorial","captionBand":{"top":1056,"bottom":1382},"captionBandTop":{"top":250,"bottom":560},"hero":hero,"boxed":[],"finish":{"grain":0.35,"lightLeaks":0.5},"style":"signature","scrim":0.7,"scenes":scenes,"fx":fx,
      "endCard":{"variant":"link-pill","startAt":end_at,"label":"LINK BELOW OR IN MY BIO","url":"bio.c3global.co"},
      "music":{"src":f"music/leveled/{music}","volume":0.35,"duckTo":0.16,"fadeInSec":1.5,"fadeOutSec":2.5,"startFromSec":0}}
def A(i,s,e): return {"id":i,"mood":"dark","segments":[{"start":s,"end":e,"layout":"A","captionPos":"bottom","graphics":[]}]}
def S(i,s,e,g): return {"id":i,"mood":"light","segments":[{"start":s,"end":e,"layout":"S","captionPos":"top","graphics":[dict(g,at=s,until=e)],"focus":{"y":8,"zoom":1.1}}]}
def H(label,line,em): return {"type":"headline-card","props":{"label":label,"line":line,"emphasis":em}}
def N(title,items): return {"type":"notes-card","props":{"label":"Notes","title":title,"items":[{"text":t,"at":a,"checkAfter":0.5} for t,a in items]}}
def ST(W,i,s,e,text,em,velvet=True):
    ts=[round(a,2) for w,a,b in W if a>=s-0.02 and a<e]
    n=len(text.split())
    assert len(ts)==n,(i,len(ts),n,[w for w,a,b in W if a>=s-0.02 and a<e])
    sc={"id":i,"mood":"dark","segments":[{"start":s,"end":e,"layout":"E","captionPos":"bottom","avatar":"hidden","captions":"off","graphics":[{"type":"statement-card","at":s,"until":e,"box":{"y":360,"h":1200,"center":True},"props":{"text":text,"emphasis":em,"wordTimes":ts}}]}]}
    if velvet: sc["bg"]=V
    return sc
def CH(i,s,e,chips,velvet=True,cap="off"):
    seg={"start":s,"end":e,"layout":"E","captionPos":"alternate","avatar":"hidden","graphics":[{"type":"floating-chips","at":s,"until":e,"props":{"mode":"stack","chips":[{"text":t,"at":a} for t,a in chips]}}]}
    if cap=="off": seg["captions"]="off"
    sc={"id":i,"mood":"dark","segments":[seg]}
    if velvet: sc["bg"]=V
    return sc
def Z(s,e,z=1.07): return {"type":"digital-zoom","at":s,"until":e,"props":{"creepTo":z,"snapTo":z}}
FL=lambda t: {"type":"flash-frame","at":t,"props":{"version":2}}
plans={}
W=words('decisions')
plans['decisions']=mk('decisions',40.06,'lofi-kola-french-toast.mp3',[
 A('hook',0,4.2),
 S('fast',4.2,9.9,H("A CALL FEELS FAST","The decision lives in people's heads.",["heads"])),
 CH('lost',9.9,15.82,[("What was decided",11.14),("Who owns it",12.07),("When to check on it",13.23)],cap="on"),
 A('again',15.82,18.67),
 S('shared',18.67,23.6,H("A SHARED SPACE","Where the whole team can see them.",["whole"])),
 S('three',23.6,30.35,N("Before any call ends",[("What did we decide?",26.61),("Who is doing it?",27.88),("When will we check?",29.08)])),
 A('post',30.35,33.25),
 ST(W,'lasts',33.25,36.3,"A decision lasts when it has an owner and a date.",["owner","date"],velvet=False),
 A('end',36.3,40.06)],[Z(15.9,18.6),Z(30.4,33.2)],36.36,["panic","call","heads","written","decide","place","stick"],["call"])
W=words('quiet-space')
plans['quiet-space']=mk('quiet-space',40.06,'lofi-kola-sturmfrei.mp3',[
 A('hook',0,4.85),
 S('q1',4.85,9.95,H("QUESTION 1","When did something last happen here?",["last"])),
 ST(W,'q2',9.95,15.36,"Question 2. Is there anything on the calendar next week that someone would look forward to?",["forward"]),
 S('q3',15.36,21.3,H("QUESTION 3","Another person, or an empty room?",["empty"])),
 A('reason',21.3,25.35),
 ST(W,'back',25.35,29.895,"People come back to places where something is happening and someone is expecting them.",["expecting"],velvet=False),
 S('week',29.895,36.5,H("THIS WEEK","One small, regular event. Invite people by name.",["name"])),
 A('end',36.5,40.06)],[Z(21.4,25.3)],36.55,["check","visiting","reason","happening","expecting","name","life"],["visiting"])
W=words('who-owns')
plans['who-owns']=mk('who-owns',32.93,'lofi-jyme-refresh.mp3',[
 A('hook',0,3.7),
 ST(W,'hard',3.7,8.95,"It isn't. The tool is the easy part. The hard part starts when someone helps people actually use it.",["easy","hard"]),
 A('ask',8.95,10.38),
 S('three',10.38,20.7,N("Three questions",[("Who do people ask?",10.4),("What is it for? What is off limits?",13.34),("How will we know it's helping?",16.84)])),
 A('sit',20.7,26.5),
 S('owner',26.5,29.98,H("THIS WEEK","Pick one owner. Write the answers down.",["owner"])),
 A('end',29.98,32.93)],[Z(20.8,26.4,1.08)],30.05,["over","questions","old","owner"],["hard"])
W=words('paste-ai')
plans['paste-ai']=mk('paste-ai',29.9,'lofi-fuad-assani-enjoy.mp3',[
 A('hook',0,4.4),
 ST(W,'control',4.4,9.95,"With many tools, once you paste something in, you may not control where it goes.",["control"]),
 A('rule',9.95,12.95),
 S('groups',12.95,20.4,N("A simple rule",[("Safe to paste: public information",13.0),("Ask first: clients and the business",16.0)])),
 ST(W,'never',20.4,25.95,"Do not paste passwords, private personal details, and anything you're legally required to protect.",["not"],velvet=False),
 A('end',25.95,29.9)],[FL(20.1)],26.05,["paste","control","rule","safely"],["paste"])
W=words('change-ai')
plans['change-ai']=mk('change-ai',26.33,'lofi-agnes-azria-paper-cut.mp3',[
 A('hook',0,3.85),
 ST(W,'friday',3.85,8.9,"and by Friday, the questions are scattered across hallways and chat threads.",["scattered"]),
 S('covered',8.9,16.9,H("THE ANNOUNCEMENT","Not what to do on day one, or where to go when you get stuck.",["day","one"])),
 A('walk',16.9,20.05),
 ST(W,'guide',20.05,24.5,"Find what will confuse people by 10 o'clock, then put an AI guide right there to answer them.",["guide"],velvet=False),
 A('end',24.5,26.33)],[Z(17.0,20.0)],24.9,["Monday","Friday","rollout","paper","adoption"],["change"])
for s,p in plans.items(): json.dump(p,open(f'content/{s}.scene.json','w'),indent=1)
# decisions captions: restore punctuation from her script (recording says "the whole team"); drop the doubled "next week"
c=json.load(open('content/decisions.captions.json'))
txt='Don\'t panic. If your answer keeps being, "Let\'s just get on a call," we can fix that. A call feels fast, but when it ends, the decision lives in people\'s heads. Too often, what was decided, who owns it, and when to check on it don\'t get written down, so the same call comes back next week. A shared space can hold those answers where the whole team can see them. Before any call ends, ask three questions. What did we decide? Who is doing it? And when will we check? Then post the answers in one place. A decision lasts when it has an owner and a date. Follow and subscribe for more ways to make decisions stick.'.split()
toks=[t for t in c]
ws=[t['text'].strip().lower().strip('.,?"') for t in toks]
# find doubled "next week"
for i in range(len(ws)-3):
    if ws[i:i+4]==['next','week','next','week']:
        del toks[i+2:i+4]; break
print(len(toks),len(txt))
if len(toks)==len(txt):
    for t,w in zip(toks,txt): t['text']=' '+w
    json.dump(toks,open('content/decisions.captions.json','w'),indent=1)
