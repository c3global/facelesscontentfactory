import React from 'react';
import {interpolate,useCurrentFrame,useVideoConfig} from 'remotion';
import {Arrival,Paper,Surface} from './ClinicCardTrials';
import {MetalBox,MetalRim} from './metal';
import {brand} from './brand';
import {handFamilies} from './fonts';
import type {Props} from './NextClinicNotes';

const W=760, L=160;
const script={fontFamily:handFamilies.caveat,fontWeight:600,fontSize:58,lineHeight:1.08,textAlign:'center' as const};
function Tip({tip,index,light=false,badge=false}:{tip:Props['tips'][number];index:number;light?:boolean;badge?:boolean}){
 return <div style={{...script,color:light?brand.white:brand.charcoal}}>
   {tip.lines.map((line,j)=><div key={j} style={{whiteSpace:'nowrap'}}>
     {j===0 && (badge ? <span style={{display:'inline-flex',width:36,height:36,marginRight:12,borderRadius:'50%',background:brand.crimson,color:brand.white,fontFamily:'DM Sans',fontSize:24,verticalAlign:'middle',alignItems:'center',justifyContent:'center'}}>{index+1}</span> : <span style={{color:light?'#F1B9A5':brand.crimson}}>{index+1}. </span>)}{line}
   </div>)}
 </div>;
}

function List({tips,bodyTop,treatment}:Props){
 const frame=useCurrentFrame(),{fps}=useVideoConfig();
 const clipboard=treatment==='welcome-clipboard', visitor=treatment==='visitor-checklist';
 const content=<div style={{padding:clipboard?'24px 20px 26px':visitor?'26px 22px':'26px 24px 30px'}}>
   {tips.map((tip,i)=>frame<Math.round(tip.at*fps)?null:<div key={i} style={{marginTop:i?18:0}}><Tip tip={tip} index={i} light={visitor} badge={visitor||clipboard}/></div>)}
 </div>;
 return <div style={{position:'absolute',left:L,top:bodyTop??1040,width:W}}><Arrival at={tips[0].at} snap>
   {clipboard ? <div style={{position:'relative',padding:'28px 18px 18px',borderRadius:14,background:brand.charcoal,boxShadow:'0 12px 28px rgba(0,0,0,.3)'}}>
     <MetalRim radius={14} thickness={4} kind="copper" variant="deep" seed={13}/>
     <div style={{background:brand.white,borderRadius:4}}>{content}</div>
     <MetalBox kind="copper" variant="deep" seed={17} style={{position:'absolute',top:-14,left:'50%',transform:'translateX(-50%)',width:168,height:40,borderRadius:8}}><div style={{position:'absolute',left:18,right:18,top:10,height:7,borderRadius:4,background:'rgba(0,0,0,.2)'}}/></MetalBox>
   </div> : visitor ? <Surface dark opacity={.94}>{content}</Surface> : <Paper padding="0">{content}</Paper>}
 </Arrival></div>;
}

function Cards(props:Props){
 const {tips,treatment}=props;const festive=treatment==='rest-cards';let offset=props.bodyTop??1050;
 return <>{tips.map((tip,i)=>{const top=offset;offset+=tip.lines.length*63+62;
   return <div key={i} style={{position:'absolute',left:L,top,width:W,transform:props.cardTilt?`rotate(${[-.8,.7,-.5][i]??0}deg)`:undefined}}><Arrival at={tip.at} snap>
     <div style={{position:'relative',background:brand.white,padding:festive?'28px 30px 27px':'21px 30px 23px',borderRadius:festive?13:5,boxShadow:'0 10px 22px rgba(0,0,0,.28)'}}>
       <MetalRim radius={festive?13:5} thickness={3} kind="copper" variant="deep" seed={30+i}/>
       {festive&&<><div style={{position:'absolute',bottom:3,left:14,right:14,height:5,background:brand.crimson,borderRadius:2}}/><MetalBox kind="copper" variant="deep" seed={60+i} style={{position:'absolute',top:-7,left:'50%',transform:'translateX(-50%)',width:80,height:14,borderRadius:2}}><div style={{position:'absolute',inset:3,background:brand.crimson}}/></MetalBox></>}
       <Tip tip={tip} index={i} badge={festive}/>
     </div>
   </Arrival></div>;
 })}</>;
}

function Envelope({tips,bodyTop}:Props){
 const frame=useCurrentFrame(),{fps}=useVideoConfig();const clamp={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
 const opening=interpolate(frame,[Math.round((tips[0].at-.95)*fps),Math.round((tips[0].at-.45)*fps)],[0,1],clamp);
 const rise=interpolate(frame,[Math.round((tips[0].at-.65)*fps),Math.round(tips[0].at*fps)],[0,1],{...clamp,easing:x=>1-(1-x)**3});
 return <div style={{position:'absolute',left:L,top:bodyTop??1010,width:W,height:660,perspective:1200}}><Arrival at={.65}>
   <div style={{position:'absolute',top:300,width:W,height:360,borderRadius:16,background:brand.crimsonDeep,boxShadow:'0 12px 28px rgba(0,0,0,.35)',zIndex:1}}><MetalRim radius={16} thickness={4} variant="bright" seed={23}/></div>
   <div style={{position:'absolute',left:22,top:305-rise*250,width:W-44,height:370,boxSizing:'border-box',padding:'24px 20px',background:brand.white,borderRadius:7,zIndex:rise>.55?4:0,boxShadow:'0 8px 20px rgba(0,0,0,.3)'}}>
     <MetalRim radius={7} thickness={2} variant="deep" seed={8}/>
     {tips.map((tip,i)=>frame<Math.round(tip.at*fps)?null:<div key={i} style={{marginTop:i?16:0}}><Tip tip={tip} index={i}/></div>)}
   </div>
   <div style={{position:'absolute',top:300,width:W,height:360,zIndex:2,borderRadius:16,overflow:'hidden',background:`linear-gradient(165deg,${brand.crimson},${brand.crimsonDeep})`}}>
     <svg width={W} height={360} viewBox="0 0 760 360"><path d="M0 0L380 230L760 0M0 360L266 180M760 360L494 180" fill="none" stroke="#A9574A" strokeWidth={3}/></svg><MetalRim radius={16} thickness={4} variant="bright" seed={23}/>
   </div>
   <div style={{position:'absolute',top:300,width:W,height:230,zIndex:3,transformOrigin:'50% 0',transform:`rotateX(${-opening*175}deg)`,opacity:opening>.6?0:1}}><svg width={W} height={230} viewBox="0 0 760 230"><polygon points="0,0 760,0 380,230" fill={brand.crimson} stroke="#A9574A" strokeWidth={3}/></svg></div>
   <MetalBox variant="deep" seed={11} style={{position:'absolute',left:338,top:474,width:84,height:84,borderRadius:'50%',zIndex:5,opacity:1-opening}}/>
 </Arrival></div>;
}

export function InsetClinicBody(props:Props){
 if(props.treatment==='invitation-envelope')return <Envelope {...props}/>;
 if(props.treatment==='appreciation-cards'||props.treatment==='rest-cards')return <Cards {...props}/>;
 return <List {...props}/>;
}
