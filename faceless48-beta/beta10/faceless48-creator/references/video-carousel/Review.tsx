import React,{useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {MotionSlide} from './MotionSlide';
import plan from '../../content/editorial-v8/storyboard.json';
import type {MotionScene} from './schema';

const scenes=plan.scenes as MotionScene[];
const notes=scenes.map(s=>s.motionNote);
const Review=()=>{
 const [i,setI]=useState(0),[time,setTime]=useState(0),[playing,setPlaying]=useState(true),[auto,setAuto]=useState(true);
 const [scale,setScale]=useState(.46);const last=useRef<number>();
 useEffect(()=>{const resize=()=>setScale(Math.min(.62,(window.innerHeight-155)/1350,(window.innerWidth-40)/1080));resize();window.addEventListener('resize',resize);return()=>window.removeEventListener('resize',resize);},[]);
 const duration=scenes[i].end-scenes[i].start;
 useEffect(()=>{let id:number;const tick=(now:number)=>{const delta=last.current?Math.min(.1,(now-last.current)/1000):0;last.current=now;if(playing)setTime(t=>Math.min(duration,t+delta));id=requestAnimationFrame(tick);};id=requestAnimationFrame(tick);return()=>{cancelAnimationFrame(id);last.current=undefined;};},[playing,duration]);
 useEffect(()=>{if(time>=duration&&playing){if(auto){setI(n=>(n+1)%scenes.length);setTime(0);}else setPlaying(false);}},[time,duration,playing,auto]);
 const choose=(n:number)=>{setI(n);setTime(0);setPlaying(true);};
 return <><header><div><b>THE SECOND CHECKLIST</b><span>Motion storyboard · November 5 · version 8</span></div><div className="buttons"><button onClick={()=>{setTime(0);setPlaying(true);}}>Replay slide</button><button onClick={()=>setPlaying(v=>!v)}>{playing?'Pause':'Play'}</button><label><input type="checkbox" checked={auto} onChange={e=>setAuto(e.target.checked)}/> Play all slides</label></div></header><main><section className="stage" style={{width:1080*scale,height:1350*scale}}><div style={{transform:`scale(${scale})`,transformOrigin:'top left'}}><MotionSlide scene={scenes[i]} t={time} assetBase="./F48 Project/public/" avatar={scenes[i].avatar?<video key={i} autoPlay muted playsInline src="./F48 Project/public/matte/cici-hq-short-study.webm" style={{width:"100%",height:"100%",objectFit:"contain"}}/>:undefined}/></div></section><aside><div className="eyebrow">SLIDE {i+1} OF 7 / {duration} SECONDS</div><h1>{scenes[i].headline.map(l=>l.text).join(' ')}</h1><p>{notes[i]}</p><input aria-label="Slide time" className="scrub" type="range" min="0" max={duration} step=".033333" value={time} onChange={e=>{setPlaying(false);setTime(Number(e.target.value));}}/><div className="time">{time.toFixed(1)}s / {duration}s</div><nav>{scenes.map((s,n)=><button key={n} className={i===n?'active':''} onClick={()=>choose(n)}>{n+1}</button>)}</nav><p className="small">Live preview of the same layouts and timing used by Faceless48. This draft is silent. Avatar motion plays briefly, then holds.</p><p className="small">Crimson #C91B19 · Copper #A9574A · Highlight #F1B9A5</p></aside></main></>;
};
createRoot(document.getElementById('root')!).render(<Review/>);
