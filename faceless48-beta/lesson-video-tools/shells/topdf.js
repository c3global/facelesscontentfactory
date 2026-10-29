const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();
for(const n of [1,2,3,4,9]){await p.goto('file:///tmp/claude-0/shells/lesson'+n+'.html');await p.pdf({path:`/tmp/claude-0/shells/Lesson-${n}-Instructions-and-Transcript.pdf`,format:'Letter',printBackground:true,margin:{top:'0.7in',bottom:'0.7in',left:'0.8in',right:'0.8in'}});}
await b.close();})();
