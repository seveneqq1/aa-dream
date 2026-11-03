'use client';
import { Suspense, createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { ContactShadows, OrbitControls, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { colors, materials, products, type Config } from '../lib/furniture';

const textureCache=new Map<number,THREE.CanvasTexture>();
const FinishContext=createContext({color:'#c5b59d',material:1});
function Surface({color,material}:{color:string;material:number}){
 const texture=useMemo(()=>{
  if(textureCache.has(material))return textureCache.get(material)!;
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;const ctx=canvas.getContext('2d')!;
  let seed=32;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  ctx.fillStyle='#888';ctx.fillRect(0,0,256,256);
  if(material===0){for(let i=0;i<400;i++){ctx.strokeStyle=`rgba(40,25,10,${rand()*.15})`;ctx.lineWidth=rand()*2;ctx.beginPath();const y=rand()*256;ctx.moveTo(0,y);ctx.bezierCurveTo(80,y+rand()*8,160,y-rand()*8,256,y);ctx.stroke();}}
  else {for(let i=0;i<18000;i++){const shade=90+Math.floor(rand()*80);ctx.fillStyle=`rgb(${shade},${shade},${shade})`;ctx.fillRect(rand()*256,rand()*256,1,1);}}
  const t=new THREE.CanvasTexture(canvas);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(material===0?2:5,material===0?2:5);textureCache.set(material,t);return t;
 },[material]);
 return <meshPhysicalMaterial color={color} roughness={materials[material].roughness} metalness={material===6?.08:0} clearcoat={material===6?.85:0} sheen={material===1||material===2?.55:0} sheenColor={color} bumpMap={material<5?texture:undefined} bumpScale={material===0?.018:material===1?.012:.004}/>;
}
function Part({size,pos,color,material=0,r=.025,rotation=[0,0,0]}:{size:[number,number,number];pos:[number,number,number];color:string;material?:number;r?:number;rotation?:[number,number,number]}) {return <RoundedBox args={size} position={pos} radius={Math.min(r,...size.map(v=>v/2-.001))} smoothness={3} rotation={rotation} castShadow receiveShadow><Surface color={color} material={material}/></RoundedBox>;}
function P({s,p,r=.06,rot=[0,0,0],c,m}:{s:[number,number,number];p:[number,number,number];r?:number;rot?:[number,number,number];c?:string;m?:number}){const finish=useContext(FinishContext);return <Part size={s} pos={p} r={r} rotation={rot} color={c??finish.color} material={m??finish.material}/>;}
export function Furniture({config}:{config:Config}){
 const {product,color,material}=config;const col=colors[color][1];const model=products.find(p=>p.id===product)!;const wood='#6f5740';const dark='#3d3a35';
 return <FinishContext.Provider value={{color:col,material}}><group scale={[config.width/model.dims[0],config.height/model.dims[1],config.depth/model.dims[2]]}>
 {(product==='sofa'||product==='chair')&&(()=>{const w=product==='sofa'?2.4:.9;const d=product==='sofa'?1:.88;const h=product==='sofa'?.82:.85;const n=product==='sofa'?3:1;return <>
 <P s={[w-.12,.23,d-.1]} p={[0,.3,0]} r={.10}/><P s={[w-.12,h-.29,.22]} p={[0,.29+(h-.29)/2,-d/2+.11]} r={.10}/>
 {[-1,1].map(side=><P key={side} s={[.23,.47,d]} p={[side*(w/2-.115),.40,0]} r={.11}/>)}
 {Array.from({length:n},(_,i)=><group key={i}><P s={[(w-.51)/n-.018,.20,d-.30]} p={[-(w-.51)/2+((w-.51)/n)*(i+.5),.49,.075]} r={.085}/><P s={[(w-.49)/n-.025,.38,.18]} p={[-(w-.49)/2+((w-.49)/n)*(i+.5),h-.19,-d/2+.24]} r={.085} rot={[-.12,0,0]}/></group>)}
 {[-1,1].flatMap(x=>[-1,1].map(z=><P key={`${x}${z}`} s={[.065,.16,.065]} p={[x*(w/2-.19),.08,z*(d/2-.17)]} c={wood} m={0} r={.008}/>))}
 </>})()}
 {product==='bed'&&<>{[-1,1].flatMap(x=>[-1,1].map(z=><P key={`${x}${z}`} s={[.06,.2,.06]} p={[x*.75,.1,z*.9]} c={wood} m={0}/>))}<P s={[1.8,.25,2.2]} p={[0,.25,0]}/><P s={[1.8,1.0,.16]} p={[0,.60,-1.02]} r={.07}/><P s={[1.62,.23,1.94]} p={[0,.49,.07]} c='#ede8df' m={1} r={.07}/><P s={[1.66,.08,1.23]} p={[0,.64,.43]} r={.035}/>{[-1,1].map(x=><P key={x} s={[.68,.15,.44]} p={[x*.41,.68,-.62]} c='#f3eee7' m={1} r={.06}/>)}</>}
 {product==='table'&&<><P s={[1.8,.08,.9]} p={[0,.72,0]} r={.038}/>{[-1,1].map(x=><P key={x} s={[.20,.68,.61]} p={[x*.55,.34,0]} r={.04}/>)}</>}
 {product==='wardrobe'&&<><P s={[2,2.2,.60]} p={[0,1.1,0]} r={.012}/>{[-.75,-.25,.25,.75].map(x=><group key={x}><P s={[.488,2.12,.025]} p={[x,1.12,.306]} r={.006}/><P s={[.018,.42,.035]} p={[x+.17,1.1,.335]} c={dark} m={5} r={.008}/></group>)}</>}
 {product==='dresser'&&<><P s={[1.4,.66,.45]} p={[0,.47,0]} r={.016}/>{[.27,.47,.67].map(y=><group key={y}><P s={[1.34,.185,.025]} p={[0,y,.235]} r={.004}/><P s={[.24,.015,.024]} p={[0,y+.045,.258]} c={dark} m={5} r={.003}/></group>)}{[-1,1].flatMap(x=>[-1,1].map(z=><P key={`${x}${z}`} s={[.05,.16,.05]} p={[x*.58,.08,z*.16]} c={dark} m={5}/>))}</>}
 {product==='kitchen'&&<><P s={[2.8,.88,.6]} p={[0,.44,0]} r={.006}/><P s={[2.8,.055,.61]} p={[0,.907,0]} c='#e6e2da' m={5} r={.008}/>{[-1.05,-.35,.35,1.05].map(x=><group key={x}><P s={[.685,.77,.025]} p={[x,.45,.308]} r={.004}/><P s={[.22,.012,.03]} p={[x,.75,.33]} c={dark} m={5}/><P s={[.685,.7,.37]} p={[x,1.85,-.1]} r={.006}/><P s={[.22,.012,.025]} p={[x,1.58,.10]} c={dark} m={5}/></group>)}<P s={[.52,.015,.4]} p={[.70,.943,.015]} c='#262626' m={6} r={.03}/></>}
 </group></FinishContext.Provider>;
}
function Camera({config,reset,controlsRef}:{config:Config;reset:number;controlsRef:any}){const {camera,invalidate}=useThree();useEffect(()=>{const max=Math.max(config.width,config.height,config.depth)/100;camera.position.set(max*1.25,max*.83,max*1.5);camera.lookAt(0,config.height/200,0);controlsRef.current?.target.set(0,config.height/200,0);controlsRef.current?.update();invalidate();},[config.product,reset]);return null;}
export default function FurnitureScene({config,interactive=false,reset=0,angle=0,zoom=0}:{config:Config;interactive?:boolean;reset?:number;angle?:number;zoom?:number}){
 const controlsRef=useRef<any>(null);const [visible,setVisible]=useState(interactive);const root=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(interactive)return;const observer=new IntersectionObserver(([e])=>{if(e.isIntersecting){setVisible(true);observer.disconnect();}},{rootMargin:'150px'});if(root.current)observer.observe(root.current);return()=>observer.disconnect();},[interactive]);
 useEffect(()=>{const c=controlsRef.current;if(c){c.setAzimuthalAngle(c.getAzimuthalAngle()+Math.PI/4);c.update();}},[angle]);
 const previousZoom=useRef(0);useEffect(()=>{const c=controlsRef.current;if(c&&zoom!==previousZoom.current){const offset=c.object.position.clone().sub(c.target);offset.multiplyScalar(zoom>previousZoom.current?.8:1.25);c.object.position.copy(c.target).add(offset);c.update();}previousZoom.current=zoom;},[zoom]);
 return <div className="scene" ref={root} aria-label={`3D-модель ${products.find(p=>p.id===config.product)?.collection}`}>
 {visible&&<Canvas shadows dpr={[1,1.7]} frameloop="demand" camera={{position:[3.6,2.6,4.4],fov:36}} gl={{antialias:true,alpha:true}}>
 <ambientLight intensity={1.5}/><directionalLight position={[3,6,4]} intensity={3} castShadow shadow-mapSize={1024}/><directionalLight position={[-4,3,-2]} intensity={1.3}/>
 <Suspense fallback={null}><Furniture config={config}/><ContactShadows position={[0,-.015,0]} opacity={.28} scale={10} blur={2.8} far={4} resolution={256}/></Suspense>
 <OrbitControls ref={controlsRef} makeDefault enableRotate={interactive} enableZoom={interactive} enablePan={false} minDistance={1.2} maxDistance={12} minPolarAngle={.15} maxPolarAngle={Math.PI/2.03} target={[0,config.height/200,0]}/><Camera config={config} reset={reset} controlsRef={controlsRef}/>
 </Canvas>}
 </div>;
}
