import React from 'react';
import {Composition} from 'remotion';
import {StickVideo,SIZES} from './stick/StickVideo';
import {LifeScene,lifeScenePlanSchema,lifeSceneFrames} from './LifeScene';
const lifeSample=lifeScenePlanSchema.parse({kind:'life-scene',slug:'life-sample',durationSec:5,shots:[{src:'raw/sample.mp4',effect:'zoom',from:1,to:1.1,moveSec:5,px:0.5,py:0.4,lengthSec:5}],text:[{text:['Your line here'],fromSec:0.6,toSec:4.6,top:1130}]});
import {Video} from './Video';
import {planSchema,videoPropsSchema} from './schema';
import {Explainer,explainerSchema} from './Explainer';
import sample from '../content/sample.scene.json';
const example=explainerSchema.parse({slug:'example',durationSec:4,scenes:[{start:0,end:4,title:'Your next idea',body:'Turn a voiceover into a visual story.',visual:'presenter'}]});
export const Root:React.FC=()=> <>
 <Composition id="Video" component={Video} schema={videoPropsSchema} defaultProps={{plan:planSchema.parse(sample),captions:[]}} durationInFrames={120} fps={30} width={1080} height={1920} calculateMetadata={({props})=>({durationInFrames:Math.ceil(props.plan.durationSec*30),width:props.plan.format==='landscape'?1920:1080,height:props.plan.format==='landscape'?1080:1920})}/>
 <Composition id="LifeScene" component={LifeScene} defaultProps={{plan:lifeSample}} durationInFrames={120} fps={24} width={1080} height={1920} calculateMetadata={({props})=>({durationInFrames:lifeSceneFrames(props.plan)})}/>
 <Composition id="Stick" component={StickVideo as any} defaultProps={{format:'landscape',plan:{slug:'stick',stage:'f48-demo',durationSec:3,vo:'',emphasis:[],hero:[],captionsEnd:3,cues:{ciciIn:999},cici:[]},captions:[]}} durationInFrames={90} fps={30} width={1920} height={1080} calculateMetadata={({props}:any)=>({durationInFrames:Math.ceil(props.plan.durationSec*30),...SIZES[props.format as 'portrait'|'landscape']})}/>
 <Composition id="Explainer" component={Explainer} defaultProps={{plan:example}} durationInFrames={120} fps={30} width={1080} height={1920} calculateMetadata={({props})=>({durationInFrames:Math.ceil(props.plan.durationSec*30),width:props.plan.format==='landscape'?1920:1080,height:props.plan.format==='landscape'?1080:1920})}/>
</>;
