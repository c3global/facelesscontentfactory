import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import {bundle} from '@remotion/bundler';
import {renderFrames,selectComposition} from '@remotion/renderer';
import {lifeScenePlanSchema} from '../src/LifeScene';

// Keep source pixels out of the browser/JPEG pipeline. Only transparent graphics
// are rasterized; FFmpeg composites them directly onto the native YUV footage.
async function main(){
 const jobs=process.argv.slice(2);if(!jobs.length)throw Error('Pass one or more Life Scene JSON plans');
 const browserExecutable=process.env.REMOTION_BROWSER_EXECUTABLE;
 const serveUrl=await bundle({entryPoint:path.resolve('src/index.ts')});
 for(const file of jobs){
  const plan=lifeScenePlanSchema.parse(JSON.parse(fs.readFileSync(file,'utf8')));
  if(plan.shots.length!==1 || plan.shots[0].effect!=='none' || plan.shots[0].startSec)throw Error('Native clinic export requires one untransformed clip starting at zero');
  if(!plan.voiceover || plan.voiceoverDelaySec!==0)throw Error('Native clinic export requires music starting at zero');
  const src=path.resolve('public',plan.shots[0].src),music=path.resolve('public',plan.voiceover);
  const output=path.resolve('out',plan.slug+'.mp4');if(fs.existsSync(output))throw Error('Output exists: '+output);
  const probe=spawnSync('ffprobe',['-v','error','-select_streams','v:0','-show_streams','-of','json',src],{encoding:'utf8'});
  if(probe.status!==0)throw Error(probe.stderr);const stream=JSON.parse(probe.stdout).streams[0];
  if(stream.width*1920!==stream.height*1080)throw Error('Source must be portrait 9:16');
  if(stream.avg_frame_rate!=='24/1')throw Error('Expected original 24fps footage');
  const inputProps={plan:{...plan,graphicsOnly:true}};
  const composition=await selectComposition({serveUrl,id:'LifeScene',inputProps,browserExecutable,envVariables:{REMOTION_LOCAL_FONTS:'1'}});
  if(Number(stream.nb_frames)<composition.durationInFrames)throw Error('Source shorter than plan');
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ccn-png-'));
  console.log('Lossless graphics: '+plan.slug+' at '+stream.width+'x'+stream.height);
  let last=-1;
  await renderFrames({serveUrl,composition,inputProps,browserExecutable,envVariables:{REMOTION_LOCAL_FONTS:'1'},outputDir:dir,imageFormat:'png',scale:stream.width/1080,concurrency:1,muted:true,
   onStart:()=>{},onFrameUpdate:(n)=>{const p=Math.floor(n/composition.durationInFrames*4);if(p!==last){last=p;console.log('Graphics '+Math.min(100,p*25)+'%');}}});
  const first=fs.readdirSync(dir).find(f=>/\d+\.png$/.test(f));if(!first)throw Error('No image sequence');
  const pattern=first.replace(/\d+(?=\.png$)/,n=>'%0'+n.length+'d');
  const tagNames:Record<string,string>={color_space:'colorspace',color_transfer:'color_trc'};
  const tags=['color_space','color_primaries','color_transfer','color_range'].flatMap(k=>stream[k]&&stream[k]!=='unknown'?['-'+(tagNames[k]||k),stream[k]]:[]);
  const args=['-v','error','-i',src,'-framerate','24','-i',path.join(dir,pattern),'-i',music,'-filter_complex','[0:v][1:v]overlay=0:0:format=yuv420:shortest=1[v]','-map','[v]','-map','2:a:0','-frames:v',String(composition.durationInFrames),'-t',String(plan.durationSec),'-c:v','libx264','-preset','slow','-crf','14','-pix_fmt','yuv420p',...tags,'-c:a','aac','-b:a','256k','-movflags','+faststart',output];
  const result=spawnSync('ffmpeg',args,{encoding:'utf8',maxBuffer:1024*1024});
  if(result.status!==0)throw Error(result.stderr);
  fs.rmSync(dir,{recursive:true});console.log(output);
 }
}
main().catch(e=>{console.error(e);process.exit(1)});
