import html,json,sys
sys.path.insert(0,'/tmp/claude-0/shells')
from content import L
FONT='/tmp/claude-0/t7/proj/public/fonts/'
CSS=open('/tmp/claude-0/course/lesson5.html').read().split('<style>')[1].split('</style>')[0].replace('/tmp/claude-0/t7/proj/public/fonts/',FONT)
def build(n):
    d=L[n]
    h=[f"<html><head><meta charset='utf-8'><style>{CSS}</style></head><body>"]
    h.append(f"<div class='kick'>FACELESS48 · LESSON {n}</div><h1>{html.escape(d['title'])}</h1><div class='sub'>{html.escape(d['sub'])}</div>")
    h.append(f"<div class='intro'>{html.escape(d['intro'])}</div><p><i>Words in bold are what you say to your assistant.</i></p>")
    for head,items in d['steps']:
        h.append(f"<h2>{html.escape(head)}</h2>")
        for it in items:
            if isinstance(it,tuple): h.append("<table>"+''.join(f"<tr><td>{html.escape(a)}</td><td>{html.escape(b)}</td></tr>" for a,b in it[1])+"</table>")
            else: h.append(f"<p>{it}</p>")
    h.append("<h2>Before you move on</h2><ul class='check'>"+''.join(f"<li>{html.escape(c)}</li>" for c in d['check'])+"</ul>")
    import os
    tp=f'/tmp/claude-0/lessons/transcript{n}.txt'
    if os.path.exists(tp):
        paras=[p for p in open(tp).read().split('\n\n') if p.strip()]
        h.append("<h2 style='page-break-before:always'>Transcript</h2><div class='tx'>"+''.join(f"<p>{html.escape(p)}</p>" for p in paras)+"</div>")
    h.append("<div class='foot'>Stuck? Email support@c3global.co with what you asked and the exact error. Never include passwords or API keys.</div></body></html>")
    open(f'lesson{n}.html','w').write(''.join(h))
    # TipTap
    ls=d['lesson']
    P=lambda t:{"type":"paragraph","content":[{"type":"text","text":t}]}
    li=lambda c:{"type":"listItem","content":[c]}
    doc=[P(ls['intro']),
      {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Say this to your assistant"}]},
      {"type":"bulletList","content":[li({"type":"paragraph","content":[{"type":"text","text":a,"marks":[{"type":"bold"}]},{"type":"text","text":" "+b}]}) for a,b in ls['say']]},
      {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Good to know"}]},
      {"type":"bulletList","content":[li(P(t)) for t in ls['know']]},
      {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Before you move on"}]},
      {"type":"taskList","content":[{"type":"taskItem","attrs":{"checked":False},"content":[P(c)]} for c in d['check']]},
      {"type":"callout","attrs":{"color":"blue","emoji":"📄"},"content":[P("Download the PDF below for the full step-by-step instructions.")]}]
    json.dump({"type":"doc","content":doc},open(f'lesson{n}.json','w'),ensure_ascii=False,separators=(',',':'))
for n in (1,2,3,4,9): build(n)
