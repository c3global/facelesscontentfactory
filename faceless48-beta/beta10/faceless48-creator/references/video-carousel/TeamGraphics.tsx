import React from 'react';
const R='#C91B19', C='#F1B9A5', M='#A9574A';
const clamp=(x:number)=>Math.min(1,Math.max(0,x));
const show=(t:number,start:number)=>({opacity:clamp((t-start)*3),transform:`translateY(${(1-clamp((t-start)*2))*22}px)`});
const trace=(t:number,start:number)=>({strokeDasharray:1,strokeDashoffset:1-clamp((t-start)/.8)});
const glass:React.CSSProperties={position:'absolute',border:'1.5px solid rgba(241,185,165,.48)',borderRadius:22,background:'linear-gradient(155deg,rgba(241,185,165,.20),rgba(169,87,74,.12) 38%,rgba(25,20,23,.82) 100%)',boxShadow:'inset 0 2px 2px rgba(255,239,227,.72),inset 0 -2px 4px rgba(169,87,74,.40),0 16px 45px #0004',color:'white'};
const bold='"Manrope",Arial,sans-serif';
const Person=({x,y}:{x:number;y:number})=><g transform={`translate(${x} ${y})`} fill="none" stroke={C} strokeWidth="3"><circle cx="0" cy="-15" r="13"/><path d="M-23 20c2-25 44-25 46 0z"/></g>;
export const TeamGraphics:React.FC<{n:number;t:number;nonInstagram?:boolean;avatar?:React.ReactNode}>=({n,t,nonInstagram,avatar})=><div style={{position:'absolute',inset:0,fontFamily:bold}}>
{n===1&&<>
 {avatar&&<div style={{position:'absolute',right:30,top:-35,width:330,height:442,maskImage:'linear-gradient(#000 70%,transparent 96%)',WebkitMaskImage:'linear-gradient(#000 70%,transparent 96%)'}}>{avatar}</div>}
 <div style={{...glass,left:avatar?20:205,top:avatar?65:0,width:530,height:185,padding:'25px 32px',...show(avatar?5:t,.4)}}><div style={{fontSize:19,letterSpacing:2,color:'#D7C5C1'}}>ROLLOUT PLAN</div><div style={{fontSize:34,fontWeight:800,marginTop:17}}>AI tool: ready to launch</div><div style={{height:5,background:'#ffffff26',marginTop:20,borderRadius:5}}><div style={{height:'100%',width:`${72+12*Math.sin(t*.65)**2}%`,background:R}}/></div></div>
 <svg width="936" height="500" style={{position:'absolute',inset:0}}><path d="M285 250v55 M170 350v-45H766v45 M470 305v45" fill="none" stroke={C} strokeWidth="3" strokeDasharray="7 9" pathLength="1" style={trace(avatar?5:t,1.1)}/></svg>
 {[{x:40,label:'THE EXCEPTIONS'},{x:330,label:'THE SHORTCUTS'},{x:620,label:'THE JUDGMENT'}].map((a,i)=><div key={a.label} style={{...glass,left:a.x,top:avatar?350:317,width:275,height:150,textAlign:'center',padding:'25px 8px',...show(avatar?5:t,1.7+i*.45)}}><div style={{fontSize:37,color:C}}>0{i+1}</div><div style={{fontSize:17,fontWeight:800,letterSpacing:1,marginTop:12}}>{a.label}</div></div>)}
 {avatar&&<div style={{position:'absolute',top:540,left:20,right:20,textAlign:'center',fontSize:30,fontWeight:700,color:C}}>Invite their judgment into the plan.</div>}
 </>}
{n===2&&<>
 <div style={{position:'absolute',left:45,top:35,fontSize:23,letterSpacing:2,color:'#666A75',fontWeight:800}}>FOLLOW ONE REAL TASK</div>
 <svg width="936" height="400" style={{position:'absolute',inset:0}}><path d="M145 245H770" fill="none" stroke="#C91B19" strokeWidth="5" pathLength="1" style={trace(t,.9)}/><path d="m754 229 18 16-18 16" fill="none" stroke="#C91B19" strokeWidth="4" opacity={clamp((t-1.6)*3)}/></svg>
 {[{x:40,text:'Start the task',i:'01'},{x:345,text:'Handle a change',i:'02'},{x:650,text:'Finish the task',i:'03'}].map((a,j)=><div key={a.i} style={{position:'absolute',left:a.x,top:160,width:260,height:190,borderRadius:22,border:'2px solid #D9C7C1',background:'#FFFFFF',boxShadow:'0 15px 45px #3439441c',textAlign:'center',padding:22,...show(t,.45+j*.55)}}><div style={{fontSize:26,color:M,fontStyle:'italic'}}>{a.i}</div><div style={{fontSize:28,fontWeight:800,marginTop:16,color:'#111319'}}>{a.text}</div></div>)}
 <div style={{position:'absolute',top:445,left:55,right:55,textAlign:'center',fontSize:40,lineHeight:1.3,fontWeight:700,color:'#343A45',...show(t,2.5)}}>Where does the work take a detour?</div>
 </>}
{n===3&&<>
 <div style={{...glass,left:235,top:5,width:465,height:115,textAlign:'center',padding:27,fontSize:31,fontWeight:800,...show(t,.5)}}>A decision needs judgment</div>
 <svg width="936" height="470" style={{position:'absolute',inset:0}}><path d="M468 120v75H215v73 M468 195h255v73" fill="none" stroke="#FFE3D6" strokeWidth="4" strokeDasharray="6 8" pathLength="1" style={trace(t,1)}/></svg>
 {[{x:20,title:'THE EXCEPTION',body:'What does the usual process miss?'},{x:485,title:'THE RISK',body:'What needs a second look?'}].map((a,i)=><div key={a.title} style={{...glass,left:a.x,top:275,width:430,height:180,padding:28,textAlign:'center',...show(t,1.7+i*.6)}}><div style={{fontSize:20,color:C,fontWeight:800,letterSpacing:2}}>{a.title}</div><div style={{fontSize:31,lineHeight:1.25,fontWeight:700,marginTop:20}}>{a.body}</div></div>)}
 </>}
{n===4&&<>
 {[{x:0,tag:'THE TOOL',title:'Try a real task',sub:'Use the work your team knows.'},{x:490,tag:'THE TEAM',title:'Check the result',sub:'What did it miss?'}].map((a,i)=><div key={a.tag} style={{...glass,left:a.x,top:20,width:445,height:355,padding:35,...show(t,.5+i*1.1)}}><div style={{color:C,fontSize:19,letterSpacing:2,fontWeight:800}}>{a.tag}</div><div style={{fontSize:38,fontWeight:800,marginTop:35}}>{a.title}</div><div style={{fontSize:27,lineHeight:1.35,marginTop:20,color:'#E6E2E0'}}>{a.sub}</div></div>)}
 <svg width="936" height="450" style={{position:'absolute',inset:0}}><path d="M450 200h38m-14-13 14 13-14 13" fill="none" stroke={C} strokeWidth="4" pathLength="1" style={trace(t,1.5)}/></svg>
 <div style={{position:'absolute',top:465,left:30,right:30,textAlign:'center',fontSize:36,fontWeight:700,...show(t,3)}}>Let the people doing the work test it.</div>
 </>}
{n===5&&<>
 <svg width="936" height="460" style={{position:'absolute',inset:0}}><path d="M315 120H755 M755 120v155H600" fill="none" stroke={R} strokeWidth="4" pathLength="1" style={trace(t,.8)}/><path d="m615 261-17 14 17 14" fill="none" stroke={R} strokeWidth="4" opacity={clamp((t-2)*3)}/></svg>
 {[{x:55,y:55,num:'01',text:'Listen'},{x:625,y:55,num:'02',text:'Make a change'},{x:340,y:265,num:'03',text:'Share what changed'}].map((a,i)=><div key={a.num} style={{position:'absolute',left:a.x,top:a.y,width:260,minHeight:130,border:'1px solid #D4BBB3',borderRadius:22,background:'#fff',padding:20,textAlign:'center',boxShadow:'0 12px 40px #0002',...show(t,.4+i*.7)}}><div style={{color:M,fontSize:25,fontStyle:'italic'}}>{a.num}</div><div style={{fontSize:27,fontWeight:800,color:'#111319',marginTop:12}}>{a.text}</div></div>)}
 <div style={{position:'absolute',top:465,left:40,right:40,textAlign:'center',fontSize:30,color:'#515967',...show(t,3)}}>People can see how their input shaped the rollout.</div>
 </>}
{n===6&&<>
 <div style={{position:'absolute',left:0,right:0,top:0,textAlign:'center'}}><div style={{fontSize:31,fontWeight:700}}>{nonInstagram?'Explore':'Comment'}</div><div style={{fontFamily:'"Playfair Display",Georgia,serif',fontSize:137,lineHeight:1.3,fontStyle:'italic',fontWeight:600,letterSpacing:-2,backgroundImage:'linear-gradient(110deg,#A9574A 0%,#F1B9A5 24%,#FFF8EF 32%,#F1B9A5 40%,#A9574A 75%,#F1B9A5 100%)',backgroundSize:'220% 100%',backgroundPosition:`${100-((t%3.5)/3.5)*200}% 0`,backgroundClip:'text',WebkitBackgroundClip:'text',color:'transparent'}}>{nonInstagram?'AI AUDIT':'AIREADY'}</div><svg width="580" height="48" viewBox="0 0 580 48" style={{display:'block',margin:'-12px auto 22px',overflow:'visible'}}><defs><linearGradient id="team-underline"><stop stopColor="#A9574A"/><stop offset=".5" stopColor="#FFF9F2"/><stop offset="1" stopColor="#F1B9A5"/></linearGradient></defs><path d="M10 30 Q90 8 170 26 T330 24 T570 12" fill="none" stroke="url(#team-underline)" strokeWidth="5" strokeLinecap="round" pathLength="1" style={trace(t,1.1)}/></svg><div style={{fontSize:32,lineHeight:1.35,...show(t,1.6)}}>{nonInstagram?'See how ready your organization is.':"and I'll send you the AI Advantage Audit."}</div></div>
</>}
</div>;
