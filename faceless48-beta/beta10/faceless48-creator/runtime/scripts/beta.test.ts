import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync,rmSync,existsSync,writeFileSync,readFileSync,readdirSync} from 'node:fs';
import os from 'node:os';import path from 'node:path';
import {explainerSchema} from '../src/Explainer';
import {fxSchema} from '../src/fx/schema';
const base={slug:'test',durationSec:3,scenes:[{start:0,end:3,title:'Hello'}]};
test('all styles accept both aspect ratios',()=>{for(const style of ['whiteboard','editorial','dark'])for(const format of ['portrait','landscape'])assert(explainerSchema.safeParse({...base,style,format}).success);});
test('reject timing overlap and captions outside duration',()=>{assert(!explainerSchema.safeParse({...base,scenes:[...base.scenes,{start:2,end:3,title:'Bad'}]}).success);assert(!explainerSchema.safeParse({...base,captions:[{text:'Bad',startMs:0,endMs:4000}]}).success);});
test('reject path escape and media scene without asset',()=>{for(const vo of ['../secret','/etc/passwd','https://example.com/a','..\\secret'])assert(!explainerSchema.safeParse({...base,vo}).success);assert(!explainerSchema.safeParse({...base,scenes:[{start:0,end:3,title:'x',visual:'image'}]}).success);});
test('all 152 FX schemas present (plus graphics/end cards)',()=>{assert.equal(fxSchema.options.length,152);});
test('beta 12 effects and upgrade batch 3 parse with member defaults',()=>{
  const ok=(fx:any)=>fxSchema.parse(fx);
  for(const fx of [
    {type:'dm-thread',at:1,props:{name:'Sam',messages:[{text:'Hi',from:'them',at:1.5}]}},
    {type:'review-card',at:1,props:{quote:'Real words',name:'A client'}},
    {type:'highlighter',at:1,props:{text:'Post *daily*'}},
    {type:'taped-note',at:1,props:{text:'A note'}},
    {type:'lower-third',at:1,props:{name:'Name',title:'Title'}},
    {type:'save-tap',at:1},
  ])ok(fx);
  for(const [type,props] of [['the-stack',{rows:[{label:'A',value:50,display:'50%'},{label:'B',value:20,display:'20%'}]}],['sticky-text',{text:'Hi'}],['freeze-sticker',{}],['comment-bubble',{comment:'GO',postAt:2,replyAt:3,reply:'Sent'}],['comment-drop',{keyword:'GO',postAt:2,reply:'Sent',replyAt:3}],['comment-cta',{keyword:'GO',line:'Comment',postAt:2}],['spotlight',{}],['polaroid-drop',{photos:[{caption:'One'},{caption:'Two'}]}],['phone-mockup',{}]] as const)
    assert.equal((ok({type,at:1,props:{...props,version:2}}) as any).props.version,2,type);
  assert.equal((ok({type:'the-stack',at:1,props:{rows:[{label:'A',value:5,display:'5'},{label:'B',value:5,display:'5'}]}}) as any).props.version,1,'originals stay the default');
});
test('project creation is isolated and refuses overwrite',()=>{const tmp=mkdtempSync(path.join(os.tmpdir(),'f48-test-'));try{const dest=path.join(tmp,'project');let r=spawnSync(process.execPath,['scripts/create-project.mjs',dest],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);assert(existsSync(path.join(dest,'src/Root.tsx')));assert(!existsSync(path.join(dest,'node_modules')));writeFileSync(path.join(dest,'keep.txt'),'keep');r=spawnSync(process.execPath,['scripts/create-project.mjs',dest],{encoding:'utf8'});assert.notEqual(r.status,0);assert.equal(readFileSync(path.join(dest,'keep.txt'),'utf8'),'keep');}finally{rmSync(tmp,{recursive:true,force:true});}});
import {cueTime,compileBrief} from './cues';
const words=[{text:'Start',startMs:0,endMs:200},{text:'here.',startMs:220,endMs:450},{text:'Start',startMs:1000,endMs:1250},{text:'again',startMs:1300,endMs:1600}];
test('cue phrase normalization and explicit repeats',()=>{assert.equal(cueTime(words,{phrase:'START HERE!'}),0);assert.equal(cueTime(words,{phrase:'start',occurrence:2}),1);assert.equal(cueTime(words,{phrase:'start here',edge:'end'}),.45);assert.throws(()=>cueTime(words,{phrase:'start'}),/Ambiguous/);assert.throws(()=>cueTime(words,{phrase:'missing'}),/not found/);});
test('compile scene and emphasis timings from actual words',()=>{const p=compileBrief({durationSec:2,scenes:[{start:0},{startCue:{phrase:'again'},items:['A'],highlightCues:[{index:0,cue:{phrase:'again'}}]}]},words);assert.equal(p.scenes[0].end,1.3);assert.equal(p.scenes[1].highlights[0].at,1.3);assert.equal(p.scenes[1].end,2);});
import {planSchema} from '../src/schema';
import {LANDSCAPE_FX} from '../src/VideoWide';
import {BEHIND} from '../src/fx/util';
const plan={slug:'wide',video:'raw/a.mp4',durationSec:3,scenes:[{id:'a',mood:'dark',segments:[{start:0,end:3,layout:'A',graphics:[]}]}]};
test('talking-head plans are portrait unless they ask for landscape',()=>{assert.equal(planSchema.parse(plan).format,'portrait');assert.equal(planSchema.parse({...plan,format:'landscape'}).format,'landscape');assert(!planSchema.safeParse({...plan,format:'square'}).success);});
test('landscape effects are camera moves and looks only, never cutout effects',()=>{for(const t of LANDSCAPE_FX)assert(!BEHIND.includes(t as any),t);for(const t of ['digital-zoom','pull-back','grade','glow','dust'])assert(LANDSCAPE_FX.includes(t),t);});
import {videoCarouselSchema} from '../src/VideoCarousel';
test('every carousel starter template parses and every picture or clip it names ships in public/',()=>{for(const f of readdirSync('content/templates').filter((n)=>n.endsWith('.json'))){const raw=JSON.parse(readFileSync(path.join('content/templates',f),'utf8'));const plan=videoCarouselSchema.parse(raw);for(const m of JSON.stringify(plan).match(/"[\w./-]+\.(png|jpg|jpeg|webp|mp4|mov)"/g)??[])assert(existsSync(path.join('public',JSON.parse(m))),`${f}: missing public/${JSON.parse(m)}`);}});
test('carousel background picture option',()=>{const base={kind:'video-carousel',slug:'bg',slides:[{layout:'cover',headline:'Hi',seconds:3}]};const p=videoCarouselSchema.parse({...base,background:{src:'backdrops/velvet.jpg'}});assert.equal(p.background?.dim,0.35);assert.equal(p.background?.drift,true);assert(!videoCarouselSchema.safeParse({...base,background:{src:'x.jpg',dim:2}}).success);});
