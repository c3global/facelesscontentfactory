const {chromium}=require('playwright');const fs=require('fs');
const css=fs.readFileSync('/tmp/claude-0/thumbs/css.txt','utf8').replace(/\$\{F\}/g,'/tmp/claude-0/t7/proj/public/fonts/');
const items=[
 [1,'📦','Download,','install and open it','Get the plug-in on your computer and ready to set up.'],
 [2,'⚙️','Get me','set up','Teach the plug-in who you are, one time.'],
 [3,'📁','Add your footage','and voiceover','Two ways to get your video and voice to your assistant.'],
 [4,'🎬','Make my','video','Your clip goes in. A finished video comes out.'],
 [5,'🎨','Styles, effects','and music','Choose a look and let your assistant place the effects.'],
 [6,'🎙️','Edit my','yap','A light, finished edit for casual videos.'],
 [7,'✏️','Animated','explainers','Turn your voice into an animated video.'],
 [8,'🌅','Life','Scenes','A few seconds of life, with words that stay.'],
 [9,'🎞️','Stock','footage','Free B-roll you choose, as cutaways.'],
];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:720}});
for(const [n,ic,a,bb,sub] of items){
 const html=`<html><head><meta charset=utf-8><style>@font-face{font-family:'DM Sans';font-weight:500;src:url('file:///tmp/claude-0/t7/proj/public/fonts/dm-sans-latin-500-normal.woff2')}@font-face{font-family:'DM Sans';font-weight:700;src:url('file:///tmp/claude-0/t7/proj/public/fonts/dm-sans-latin-700-normal.woff2')}${css.split('*{box-sizing')[1]?'*{box-sizing'+css.split('*{box-sizing')[1]:css}</style></head><body><div class=g1></div><div class=g2></div><div class=bar></div><div class=frame></div><div class=ic>${ic}</div><div class=t><div class=k>LESSON ${n}</div><h1>${a}<br><span>${bb}</span></h1><div class=s>${sub}</div></div><div class=brand>FACELESS<i>48</i></div></body></html>`;
 await p.setContent(html);await p.waitForTimeout(300);await p.screenshot({path:`lesson-${n}-thumbnail.png`});}
await b.close();})();
