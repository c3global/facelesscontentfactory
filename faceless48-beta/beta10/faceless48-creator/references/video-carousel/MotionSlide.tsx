import React from 'react';
import type {MotionScene} from './schema';
import {logoWhite,logoBlack} from './logos';
import {TeamGraphics} from './TeamGraphics';

const R='#C91B19',M='#A9574A',H='#F1B9A5';
const sans='"DM Sans",Arial,sans-serif',bold='"Manrope",Arial,sans-serif',serif='"Playfair Display",Georgia,serif';
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const progress=(t:number,a:number,d=.65)=>clamp((t-a)/d);
const ease=(p:number)=>1-Math.pow(1-p,3);
const on=(t:number,a:number)=>({opacity:progress(t,a,.3),transform:`translateY(${(1-ease(progress(t,a)))*25}px)`});
const stroke=(t:number,a:number,d=1)=>({strokeDasharray:1,strokeDashoffset:1-progress(t,a,d)});
const line:React.CSSProperties={position:'absolute',left:0,right:0,height:1,background:'#FFFFFF1C'};
const panel:React.CSSProperties={position:'absolute',background:'linear-gradient(135deg,rgba(255,255,255,.12) 0%,rgba(241,185,165,.075) 20%,rgba(24,31,41,.46) 48%,rgba(201,27,25,.10) 82%,rgba(255,255,255,.07) 100%)',border:'1.5px solid rgba(241,185,165,.34)',borderRadius:26,boxShadow:'inset 0 1px 0 rgba(255,255,255,.30), inset 1px 0 0 rgba(255,255,255,.10), 0 24px 80px #0006',backdropFilter:'blur(10px)'};
const label:React.CSSProperties={fontSize:23,letterSpacing:2.4,textTransform:'uppercase',fontWeight:700};

const Check:React.FC<{t:number;at:number;size?:number}>=({t,at,size=36})=><svg width={size} height={size} viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill={R}/><path d="m10 20 7 7 14-16" pathLength="1" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={stroke(t,at,.45)}/></svg>;
const Sheet:React.FC<{t:number;at?:number;style?:React.CSSProperties}>=({t,at=0,style})=><div style={{position:'absolute',width:258,height:322,background:'#FAFAF8',borderRadius:12,padding:28,color:'#16181D',boxShadow:'0 28px 65px #0005',...style}}><div style={{fontSize:19,fontWeight:700,letterSpacing:1.5}}>PAPER REVIEW</div>{[0,1,2,3].map(n=><div key={n} style={{display:'flex',alignItems:'center',gap:15,marginTop:22}}><svg width="25" height="25" viewBox="0 0 25 25"><rect x="2" y="2" width="21" height="21" rx="4" fill="none" stroke="#A9ADB5" strokeWidth="1.5"/><path d="m6 12 5 5 9-11" fill="none" stroke={R} strokeWidth="2.5" pathLength="1" style={stroke(t,at+n*.48,.3)}/></svg><div style={{height:3,width:120,background:'#C6C9D0'}}/></div>)}<div style={{fontSize:15,marginTop:23,paddingTop:15,borderTop:'1px solid #D9DADE'}}>SIGNATURE REQUIRED</div></div>;
const AI:React.FC<{t:number;style?:React.CSSProperties;title?:string}>=({t,style,title='AI REVIEW'})=><div style={{...panel,width:540,height:280,padding:32,...style}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{...label,fontSize:21,color:'#C3C8D2'}}>{title}</span><div style={{width:12,height:12,borderRadius:6,background:t>=1.3?H:R,boxShadow:`0 0 16px ${t>=1.3?H:R}`}}/></div><div style={{display:'flex',alignItems:'center',gap:22,marginTop:32}}><div style={{width:62,height:62,border:'1.5px solid #FFFFFF44',borderRadius:15,display:'grid',placeItems:'center'}}><svg width="43" height="43" viewBox="0 0 43 43"><path d="M21 3v37M3 21h37M8 8l26 26M8 34 34 8" stroke={H} strokeWidth="3"/></svg></div><div style={{fontSize:34,fontWeight:700}}>{t<1.3?'Reviewing…':'Review complete.'}</div>{t>=1.3&&<Check t={t} at={1.3}/>}</div><div style={{height:7,background:'#FFFFFF15',borderRadius:6,marginTop:32,overflow:'hidden'}}><div style={{height:'100%',background:R,width:`${progress(t,.1,1.2)*100}%`}}/></div></div>;
const Dot:React.FC<{x:number;y:number;opacity?:number}>=({x,y,opacity=1})=><circle cx={x} cy={y} r="7" fill={R} opacity={opacity}/>;
function pathDot(t:number,a:number,d:number,x1:number,y1:number,x2:number,y2:number){const p=progress(t,a,d);return <Dot x={x1+(x2-x1)*p} y={y1+(y2-y1)*p} opacity={t>=a&&t<a+d?1:0}/>;}
const Annotation:React.FC<{text:string;t:number;at:number;style?:React.CSSProperties}>=({text,t,at,style})=><div style={{position:'absolute',fontFamily:'"Covered By Your Grace",cursive',fontSize:48,lineHeight:1.1,color:H,...on(t,at),...style}}>{text}</div>;

export const MotionSlide:React.FC<{scene:MotionScene;t:number;total?:number;assetBase?:string;avatar?:React.ReactNode}>=({scene:s,t,total=7,assetBase='',avatar})=>{
 const light=s.theme==='paper';const ink=light?'#111319':'#FFFFFF',muted=light?'#555D69':'#BAC0CB';
 const bg=s.theme==='crimson'?R:s.theme==='slate'?'#111317':light?'#F8F9FA':'#111317';
 const headlineTop=170; const graphicTop=s.layout==='replace'?630:s.layout==='questions'?465:s.layout==='invitation'?500:590;
 return <div style={{width:1080,height:1350,position:'relative',overflow:'hidden',background:bg,color:ink,fontFamily:sans,boxSizing:'border-box'}}>
  {s.theme==='crimson'&&<img src={`${assetBase}brand/carousel-studio/crimson-velvet.jpg`} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',opacity:1}}/>}
  {s.theme==='crimson'&&<div style={{position:'absolute',inset:0,background:'linear-gradient(rgba(0,0,0,.16),rgba(0,0,0,.16))'}}/>}
  {light&&<div style={{position:'absolute',inset:0,opacity:.32,backgroundImage:`url("${assetBase}brand/carousel-studio/marble-materials.jpg")`,backgroundSize:'300% 100%',backgroundPosition:'left'}}/>}
  <svg width="1080" height="1350" style={{position:'absolute',inset:0,opacity:s.theme==='crimson'?0:light?.1:(s.layout==='team-story'&&s.number===1?.75:.3)}}><defs><pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r={s.layout==='team-story'&&s.number===1?1.25:.7} fill={s.layout==='team-story'&&s.number===1?'#D89E8C':light?'#9DA4B1':'#7C8492'}/></pattern></defs><rect width="1080" height="1350" fill="url(#dots)"/></svg>
  <div style={{position:'absolute',left:72,right:72,top:55,display:'flex',alignItems:'center',justifyContent:'space-between',fontSize:19,letterSpacing:1.8,color:muted}}><span>DR. CICI / C3 GLOBAL</span><span>{String(s.number).padStart(2,'0')} / {String(total).padStart(2,'0')}</span></div>
  <div style={{position:'absolute',left:72,top:113,width:55,height:4,background:light||s.theme==='crimson'?light?R:H:R}}/>
  <div style={{position:'absolute',left:72,right:72,top:headlineTop}}>
   <div style={{...label,fontSize:19,color:muted,marginBottom:25,textAlign:'center'}}>{s.label}</div>
   <div style={{fontFamily:bold,textAlign:'center',fontSize:s.layout==='questions'?77:s.layout==='replace'?87:81,lineHeight:1.22,letterSpacing:-2.6,fontWeight:800}}>
   {s.headline.map((l,i)=>{const metallic=l.accent==='copper';const first=i===0||(s.layout==='team-story'&&s.number===1&&s.avatar);const a=first?0:.2+i*.15;return <div key={i} style={{overflow:'hidden',padding:'8px 18px 24px',margin:'-8px -18px -24px',clipPath:'inset(0 -12px -20px -12px)'}}><div style={{transform:`translateY(${first?0:(1-ease(progress(t,a,.7)))*110}%)`,opacity:first?1:progress(t,a,.4),fontFamily:metallic?serif:bold,fontWeight:metallic?600:800,fontStyle:metallic?'italic':'normal',...(metallic?{backgroundImage:`linear-gradient(110deg,${s.theme==='crimson'?'#FFD5C4':M} 5%,${H} 21%,#FFFDF9 25%,#FFFFFF 27%,${H} 30%,${s.theme==='crimson'?'#FFE9DF':M} 36%,${H} 60%,${s.theme==='crimson'?'#FFD5C4':M} 85%)`,backgroundSize:'210% 100%',backgroundPosition:`${100-((Math.max(0,t-1.1)%3.5)/3.5)*200}% 0`,color:'transparent',backgroundClip:'text',WebkitBackgroundClip:'text'}:l.accent==='crimson'?{color:R}:{})}}>{l.text}</div></div>})}</div>
   {s.body&&<div style={{fontSize:29,lineHeight:1.4,color:muted,marginTop:22,maxWidth:875,marginLeft:'auto',marginRight:'auto',textAlign:'center',...on(t,.65)}}>{s.body}</div>}
  </div>
  <div style={{position:'absolute',left:72,right:72,top:graphicTop,height:650}}>
   {s.layout==='duplicate'&&s.avatar&&<>
    <AI t={t} style={{left:0,top:15,transform:'rotate(-4deg)'}}/>
    <div style={{position:'absolute',right:38,top:-125,width:335,height:449,opacity:progress(t,2,.45),maskImage:'linear-gradient(to bottom, #000 69%, transparent 89%)',WebkitMaskImage:'linear-gradient(to bottom, #000 69%, transparent 89%)'}}>{avatar}</div>
    <svg width="936" height="620" style={{position:'absolute',inset:0,overflow:'visible',pointerEvents:'none'}}><path d="M477 266 C605 270 678 255 748 336" fill="none" stroke={R} strokeWidth="5" strokeLinecap="round" pathLength="1" style={stroke(t,1.8,.9)}/><path d="m733 325 16 16 11-21" fill="none" stroke={R} strokeWidth="5" opacity={progress(t,2.55,.2)}/></svg>
    <div style={{...on(t,2.1)}}><Sheet t={t} at={2.8} style={{right:34,top:265,transform:'rotate(7deg)'}}/></div>
    <Annotation t={t} at={3.7} text="And then… the old checklist." style={{left:0,top:420,width:530,transform:'rotate(-4deg)'}}/>
   </>}
   {s.layout==='duplicate'&&!s.avatar&&<>
    <AI t={t} style={{left:0,top:15,transform:'rotate(-4deg)'}}/>
    <svg width="936" height="620" style={{position:'absolute',inset:0,overflow:'visible'}}><path d="M477 266 C665 275 720 248 748 336" fill="none" stroke={R} strokeWidth="5" strokeLinecap="round" pathLength="1" style={stroke(t,1.8,.9)}/><path d="m733 325 16 16 11-21" fill="none" stroke={R} strokeWidth="5" opacity={progress(t,2.55,.2)}/></svg>
    <div style={{...on(t,2.1)}}><Sheet t={t} at={2.8} style={{right:34,top:265,transform:'rotate(7deg)'}}/></div>
    <Annotation t={t} at={3.7} text="And then… the old checklist." style={{left:0,top:420,width:530,transform:'rotate(-4deg)'}}/>
   </>}
   {s.layout==='team-story'&&<TeamGraphics n={s.number} t={t} nonInstagram={s.nonInstagram} avatar={s.avatar?avatar:undefined}/>}
   {s.layout==='experience'&&<>
    {s.number===1&&<>
      <img src={`${assetBase}brand/carousel-studio/objects/${s.theme==='paper'?'info.webp':s.theme==='crimson'?'microscope.png':'bubble-rose.webp'}`} style={{position:'absolute',left:328,top:16,width:280,height:280,objectFit:'contain',...on(t,.45)}}/>
      <div style={{position:'absolute',top:340,left:70,right:70,textAlign:'center',fontFamily:bold,fontSize:36,lineHeight:1.3,fontWeight:700,...on(t,1.2)}}>{s.items[0]}</div>
      <Annotation t={t} at={2.5} text="Look closer." style={{top:465,left:180,right:180,textAlign:'center',fontSize:54}}/>
    </>}
    {s.number>1&&s.number<total&&s.number%3===2&&<>
      <div style={{position:'absolute',left:35,top:40,width:128,height:128,borderRadius:64,border:`2px solid ${M}`,display:'grid',placeItems:'center',fontFamily:serif,fontSize:64,fontStyle:'italic',color:light?M:H,...on(t,.4)}}>01</div>
      <div style={{position:'absolute',left:200,top:64,right:28,fontFamily:bold,fontSize:37,fontWeight:700,lineHeight:1.25,...on(t,.7)}}>{s.items[0]}</div>
      {s.items[1]&&<><svg width="936" height="470" style={{position:'absolute',inset:0}}><path d="M100 180v90q0 35 38 35h53" fill="none" stroke={light?R:H} strokeWidth="4" strokeDasharray="9 9" pathLength="1" style={stroke(t,1.3,1)}/><path d="m181 294 14 11-14 11" fill="none" stroke={light?R:H} strokeWidth="4" opacity={progress(t,2,.3)}/></svg><div style={{...panel,left:195,right:25,top:235,minHeight:160,padding:'36px 42px',fontFamily:bold,fontSize:34,fontWeight:700,lineHeight:1.25,color:ink,...on(t,1.5)}}>{s.items[1]}</div></>}
    </>}
    {s.number>1&&s.number<total&&s.number%3===0&&<>
      <img src={`${assetBase}brand/carousel-studio/objects/${s.theme==='paper'?'info.webp':'microscope.png'}`} style={{position:'absolute',left:350,top:0,width:235,height:235,objectFit:'contain',...on(t,.5)}}/>
      <svg width="936" height="500" style={{position:'absolute',inset:0}}><path d="M468 230v55H230v38 M468 285h238v38" fill="none" stroke={light?M:H} strokeWidth="3" strokeDasharray="6 9" pathLength="1" style={stroke(t,1.1,1)}/></svg>
      {s.items.map((x,j)=><div key={x} style={{...panel,left:30+j*460,top:320,width:s.items.length===1?876:425,minHeight:165,padding:'30px 28px',display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',fontFamily:bold,fontSize:28,lineHeight:1.25,fontWeight:700,color:ink,...on(t,1.5+j*.6)}}>{x}</div>)}
    </>}
    {s.number>1&&s.number<total&&s.number%3===1&&<>
      {s.items.map((x,j)=><div key={x} style={{position:'absolute',left:50+j*440,top:60,width:400,minHeight:245,border:`2px solid ${light?M:H}88`,borderRadius:28,padding:32,background:light?'#FFFFFFBB':'#FFFFFF0D',textAlign:'center',...on(t,.6+j*.6)}}><div style={{fontFamily:serif,fontSize:56,fontStyle:'italic',color:light?M:H}}>0{j+1}</div><div style={{fontFamily:bold,fontSize:30,lineHeight:1.25,fontWeight:700,marginTop:15}}>{x}</div></div>)}
      {s.items.length>1&&<svg width="936" height="420" style={{position:'absolute',inset:0}}><path d="M446 185h40m-14-12 14 12-14 12" fill="none" stroke={light?R:H} strokeWidth="4" pathLength="1" style={stroke(t,1.8,.8)}/></svg>}
    </>}
    {s.number===total&&<>
      <img src={`${assetBase}brand/carousel-studio/objects/orbital.png`} style={{position:'absolute',left:356,top:0,width:220,height:220,objectFit:'contain',...on(t,.4)}}/>
      <div style={{position:'absolute',top:250,left:35,right:35,textAlign:'center',fontFamily:bold,fontSize:42,lineHeight:1.3,fontWeight:800,...on(t,1)}}>{s.items[0]}</div>
      <div style={{position:'absolute',top:330,left:50,right:50,textAlign:'center',fontSize:29,lineHeight:1.35,...on(t,1.6)}}>{s.items[1]}</div>
    </>}
   </>}
   {s.layout==='parallel'&&<>
    <div style={{...panel,top:20,left:0,width:936,height:490}}>
     <div style={{position:'absolute',left:32,top:28,...label,fontSize:19,color:muted}}>THE SAME PERMIT PACKET</div>
     <svg width="936" height="490" style={{position:'absolute',inset:0}}>
      <path d="M115 245H230V145H350M230 245v115h120" fill="none" stroke="#606A79" strokeWidth="3"/>
      <path d="M115 245H230V145H350" fill="none" stroke={R} strokeWidth="5" pathLength="1" style={stroke(t,.3,1.1)}/>
      <path d="M230 245v115h120" fill="none" stroke={R} strokeWidth="5" pathLength="1" style={stroke(t,2.2,1.1)}/>
      {pathDot(t,.5,.55,115,245,230,245)}
     </svg>
     <div style={{position:'absolute',left:47,top:194,width:118,height:118,border:'2px solid #77818F',background:'#303844',borderRadius:24,display:'grid',placeItems:'center'}}><svg width="62" height="70" viewBox="0 0 62 70"><path d="M10 4h28l15 15v47H10zM38 4v17h15M20 35h24M20 47h24" fill="none" stroke="#DCE0E7" strokeWidth="3"/></svg></div>
     {[{top:92,name:'AI review',at:.6},{top:308,name:'Paper review',at:2.6}].map(x=><div key={x.name} style={{position:'absolute',left:350,right:36,top:x.top,padding:'29px 28px',background:x.name==='Paper review'?'linear-gradient(135deg,rgba(201,27,25,.78),rgba(201,27,25,.45))':'linear-gradient(135deg,rgba(241,185,165,.18),rgba(126,144,166,.16),rgba(255,255,255,.07))',border:'1px solid rgba(255,255,255,.24)',boxShadow:'inset 0 1px 0 rgba(255,255,255,.25)',backdropFilter:'blur(8px)',borderRadius:18,display:'flex',alignItems:'center',justifyContent:'space-between',...on(t,x.at)}}><span style={{fontSize:36,fontWeight:700}}>{x.name}</span><Check t={t} at={x.at+.6}/></div>)}
    </div>
    <div style={{position:'absolute',top:550,left:30,right:30,textAlign:'center',fontSize:31,...on(t,3.8)}}>Both processes are still running.</div>
   </>}
   {s.layout==='replace'&&<>
    <div style={{position:'absolute',left:0,top:0,width:390,height:365,border:'1.5px solid #7A849355',borderRadius:28,background:'#FFFFFF05'}}><div style={{position:'absolute',left:25,top:20,...label,fontSize:19,color:muted}}>BEFORE THE ROLLOUT</div><Sheet t={0} style={{left:65,top:74,transform:'scale(.7)',transformOrigin:'top center'}}/></div>
    <div style={{position:'absolute',right:0,top:0,width:440,height:365,border:`2px solid ${M}`,borderRadius:28,background:'#FFFFFF05'}}><div style={{position:'absolute',left:25,top:20,...label,fontSize:19,color:muted}}>AFTER THE ROLLOUT</div><Sheet t={0} style={{left:40,top:90,transform:'scale(.63) rotate(-7deg)',transformOrigin:'top center'}}/><div style={{...on(t,1.4)}}><AI t={t-1.4} style={{left:145,top:122,transform:'scale(.43) rotate(8deg)',transformOrigin:'top left'}}/></div></div>
    <svg width="936" height="500" style={{position:'absolute',inset:0}}><path d="M405 190h55m-17-14 18 14-18 14" fill="none" stroke={H} strokeWidth="3" pathLength="1" style={stroke(t,.6,.7)}/><path d="M240 395c150 75 350 75 450-2" fill="none" stroke={R} strokeWidth="4" pathLength="1" style={stroke(t,3,.9)}/></svg>
    <Annotation t={t} at={3.8} text="The old step stayed." style={{top:450,left:180,fontSize:59}}/>
   </>}
   {s.layout==='signature'&&<>
    <div style={{position:'absolute',left:28,right:28,top:0,height:492,padding:'35px 42px',background:'#FFFFFF',boxShadow:'0 18px 60px #11131918',border:'1px solid #D8DCE3',borderRadius:18,color:'#111319',transform:`rotate(${-.8+ease(progress(t,.3,1.1))*.8}deg)`}}>
     <div style={{...label,fontSize:19,color:'#636D7B'}}>THE CHECKLIST'S INSTRUCTION</div>
     <div style={{fontFamily:serif,fontSize:45,lineHeight:1.2,marginTop:28}}>This form ends when the<br/>director signs the order.</div>
     <div style={{marginTop:45,height:1,background:'#D4D9E2'}}/>
     <div style={{...label,fontSize:18,color:'#636D7B',marginTop:26}}>DIRECTOR'S SIGNATURE</div>
     <div style={{position:'relative',marginTop:16,height:62,borderBottom:'2px solid #9CA5B2'}}><div style={{position:'absolute',left:0,right:0,bottom:0,height:53,background:`linear-gradient(90deg,#C91B191C ${progress(t,1.1,.7)*100}%,transparent 0)`}}/></div>
     <div style={{fontSize:26,color:R,marginTop:21,...on(t,2.6)}}>The order is still unsigned.</div>
    </div>
    <svg width="936" height="600" style={{position:'absolute',inset:0,overflow:'visible'}}><ellipse cx="453" cy="354" rx="381" ry="54" fill="none" stroke={R} strokeWidth="5" pathLength="1" strokeLinecap="round" style={stroke(t,1.65,1.15)}/><path d="M750 420q70 90-75 119" fill="none" stroke={R} strokeWidth="4" pathLength="1" style={stroke(t,3.4,.8)}/><path d="M692 521 L675 539 L698 545" fill="none" stroke={R} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity={progress(t,4.05,.25)}/></svg>
    <div style={{position:'absolute',left:70,top:547,fontFamily:serif,fontSize:38,fontStyle:'italic',color:'#111319',...on(t,4.1)}}>The decision hasn't been completed.</div>
   </>}
   {s.layout==='protect'&&<>
    {[{title:'A required record',icon:'record'},{title:'An approval',icon:'approval'},{title:'Accountability',icon:'person'}].map((x,j)=><div key={x.icon} style={{...panel,left:j*320,width:296,top:48,height:360,padding:27,textAlign:'center',...on(t,.5+j*.8)}}>
     <svg width="210" height="190" viewBox="0 0 210 190"><defs><linearGradient id={`shield-${j}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={M}/><stop offset=".45" stopColor={H}/><stop offset=".55" stopColor="#FFF2EB"/><stop offset="1" stopColor={M}/></linearGradient></defs><path d="M105 8 184 39v64c0 42-40 66-79 80-39-14-79-38-79-80V39z" fill="#111317" stroke={`url(#shield-${j})`} strokeWidth="3"/>
     {x.icon==='record'?<path d="M78 52h37l25 25v66H78zm37 0v27h25M90 100h37m-37 16h37" fill="none" stroke={H} strokeWidth="3"/>:x.icon==='approval'?<><circle cx="106" cy="92" r="38" fill={R}/><path d="m84 93 16 16 30-37" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round"/></>:<><circle cx="105" cy="72" r="21" fill="none" stroke={H} strokeWidth="3"/><path d="M67 135c0-43 76-43 76 0z" fill="none" stroke={H} strokeWidth="3"/></>}</svg>
     <div style={{fontSize:30,fontWeight:700,lineHeight:1.2,marginTop:22}}>{x.title}</div>
    </div>)}
    <div style={{position:'absolute',left:25,right:25,top:468,fontSize:31,lineHeight:1.45,color:muted,textAlign:'center',...on(t,3)}}>Find out what still needs protecting<br/>before removing the step.</div>
   </>}
   {s.layout==='questions'&&<>
    {s.items.map((x,j)=><div key={x} style={{position:'absolute',top:15+j*196,left:0,right:0,height:164,borderBottom:'1px solid #FFFFFF25',display:'flex',gap:32,alignItems:'center',...on(t,.25+j*.9)}}><div style={{fontFamily:serif,fontStyle:'italic',color:H,fontSize:70,width:95}}>0{j+1}</div><div style={{fontSize:37,lineHeight:1.22,maxWidth:790,fontWeight:500}}>{x}</div><svg width="85" height="9" style={{position:'absolute',left:127,bottom:19}}><path d="M0 4h85" stroke={R} strokeWidth="5" pathLength="1" style={stroke(t,.7+j*.9,.6)}/></svg></div>)}
    <Annotation t={t} at={3.6} text="Start with the work." style={{top:640,left:180,right:180,textAlign:'center',fontSize:58,transform:'rotate(-3deg)'}}/>
    <svg width="936" height="740" style={{position:'absolute',left:0,top:0,overflow:'visible',pointerEvents:'none'}}><defs><linearGradient id="rays-metal" x1="0" y1="0" x2="1" y2="0"><stop stopColor={M}/><stop offset={`${30+20*Math.sin(t*2.5)}%`} stopColor="#FFF9F2"/><stop offset="70%" stopColor={H}/><stop offset="100%" stopColor={M}/></linearGradient></defs><g fill="none" stroke="url(#rays-metal)" strokeWidth="5" strokeLinecap="round" style={{filter:`drop-shadow(0 0 ${2+3*(.5+.5*Math.sin(t*4))}px ${H})`}}><path d="M174 665l-28-18 M170 681h-32 M177 696l-27 18 M762 665l28-18 M766 681h32 M759 696l27 18" pathLength="1" style={stroke(t,4,.65)}/></g></svg>
   </>}
   {s.layout==='invitation'&&<>
    <div style={{position:'absolute',left:0,right:0,top:20,textAlign:'center'}}><div style={{fontSize:29,letterSpacing:1}}>{s.nonInstagram?"Explore":"Comment"}</div><div style={{fontFamily:serif,fontSize:s.nonInstagram?105:176,lineHeight:1.25,fontWeight:600,fontStyle:'italic',letterSpacing:4,backgroundImage:`linear-gradient(110deg,${M},${H} 20%,#FFFFFF 28%,#FFF8F3 31%,${M} 38%,${H} 67%,${M})`,backgroundSize:'220% 100%',backgroundPosition:`${100-((Math.max(0,t-.6)%3.5)/3.5)*200}% 0`,color:'transparent',backgroundClip:'text',WebkitBackgroundClip:'text'}}>{s.nonInstagram?'SHIFT INDEX':'SHIFT'}</div><svg width="410" height="44" viewBox="0 0 410 44" style={{display:'block',margin:'-16px auto 12px',overflow:'visible'}}><defs><linearGradient id="shift-underline" x1="0" y1="0" x2="1" y2="0"><stop stopColor={M}/><stop offset={`${30+20*Math.sin(t*2)}%`} stopColor="#FFFFFF"/><stop offset="70%" stopColor={H}/><stop offset="100%" stopColor={M}/></linearGradient></defs><path d="M10 30 Q55 8 100 26 T190 24 T280 23 T400 12" fill="none" stroke="url(#shift-underline)" strokeWidth="5" strokeLinecap="round" pathLength="1" style={{...stroke(t,1.1,1.2),filter:`drop-shadow(0 0 ${3+2*(.5+.5*Math.sin(t*4))}px ${H})`}}/></svg><div style={{fontSize:33,lineHeight:1.4}}>{s.nonInstagram?'See how ready your team is.':"and I'll send you the readiness index."}</div></div>
    <div style={{position:'absolute',left:145,right:145,top:440,border:'1px solid #FFFFFF50',borderRadius:22,background:'#FFFFFF12',padding:'25px 30px',display:'flex',gap:23,alignItems:'center',...on(t,2.1)}}><svg width="58" height="58" viewBox="0 0 58 58"><path d="M12 8h34v42H12zM21 20h16m-16 9h16m-16 9h10" fill="none" stroke="white" strokeWidth="2.5"/></svg><div><div style={{fontSize:27,fontWeight:700}}>THE SHIFT INDEX</div><div style={{fontSize:22,marginTop:7}}>C3 Global's readiness assessment</div></div></div>
   </>}
  </div>
  <div style={{position:'absolute',left:72,right:72,bottom:42,display:'flex',alignItems:'center',justifyContent:'space-between',color:muted,fontSize:17,letterSpacing:1}}><img src={light?logoBlack:logoWhite} style={{width:119,height:60,objectFit:'contain'}}/><span style={{position:'absolute',left:'50%',transform:'translateX(-50%)',whiteSpace:'nowrap',letterSpacing:.5,fontSize:25,fontWeight:700}}>bio.c3global.co</span><span style={{color:light?R:s.theme==='crimson'?'#FFFFFF':H,fontSize:29}}>{s.number<total?'→':'↗'}</span></div>
 </div>;
};
