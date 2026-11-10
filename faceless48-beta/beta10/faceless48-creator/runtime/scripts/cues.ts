/** Resolve editorial cue phrases against actual timed words. No guessed or fuzzy timestamps. */
export type Word={text:string;startMs:number;endMs:number};
export type Cue={phrase:string;occurrence?:number;edge?:'start'|'end'};
const normalize=(s:string)=>s.normalize('NFKC').toLocaleLowerCase('en').replace(/[^\p{L}\p{N}]+/gu,' ').trim().split(/\s+/).filter(Boolean);
export function cueTime(words:Word[],cue:Cue){
 const needle=normalize(cue.phrase);if(!needle.length)throw Error('Cue phrase cannot be empty');
 const tokens=words.flatMap(w=>normalize(w.text).map(text=>({text,startMs:w.startMs,endMs:w.endMs})));
 for(const w of tokens)if(!Number.isFinite(w.startMs)||!Number.isFinite(w.endMs)||w.startMs<0||w.endMs<=w.startMs)throw Error('Invalid transcript timestamps');
 const matches:typeof tokens[]=[];
 for(let i=0;i<=tokens.length-needle.length;i++)if(needle.every((s,j)=>tokens[i+j].text===s))matches.push(tokens.slice(i,i+needle.length));
 if(!matches.length)throw Error(`Cue phrase not found: "${cue.phrase}". Correct the phrase or transcript; do not guess.`);
 if(matches.length>1&&cue.occurrence===undefined)throw Error(`Ambiguous cue "${cue.phrase}" (${matches.length} matches). Specify occurrence starting at 1.`);
 const n=cue.occurrence??1;if(!Number.isInteger(n)||n<1||n>matches.length)throw Error(`Invalid occurrence for "${cue.phrase}"`);
 const hit=matches[n-1];return (cue.edge==='end'?hit[hit.length-1].endMs:hit[0].startMs)/1000;
}
export function compileBrief(brief:any,words:Word[]){
 if(!Array.isArray(brief.scenes)||!brief.scenes.length)throw Error('Brief needs scenes');
 const scenes=brief.scenes.map((s:any,i:number)=>{
  const {startCue,endCue,highlightCues,...rest}=s;
  const start=startCue?cueTime(words,startCue):(s.start??(i===0?0:undefined));
  if(start===undefined)throw Error(`Scene ${i+1} needs a start cue or time`);
  return {...rest,start,end:endCue?cueTime(words,endCue):s.end,highlights:highlightCues?highlightCues.map((h:any)=>({index:h.index,at:cueTime(words,h.cue)})):(s.highlights??[])};
 });
 scenes.forEach((s:any,i:number)=>{s.end??=scenes[i+1]?.start??brief.durationSec;});
 const {captionsFile,...rest}=brief;return {...rest,scenes,captions:words};
}
