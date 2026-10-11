// ---------- input ----------
const keys={};
addEventListener('keydown',e=>{
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();
  keys[e.code]=true;
  if(modal&&['Digit1','Digit2','Digit3'].includes(e.code))pick(+e.code.slice(-1)-1);
  else if(e.code==='Space')dash();
  else if(e.code==='KeyQ'||e.code==='KeyE')useUlt();
  else if((e.code==='Escape'||e.code==='KeyP')&&started&&!modal)setPause(!paused);
});
addEventListener('keyup',e=>keys[e.code]=false);
const joy={active:false,id:null,ox:0,oy:0,x:0,y:0,dx:0,dy:0},JR=50;
cv.addEventListener('pointerdown',e=>{initAudio();if(joy.active)return;Object.assign(joy,{active:true,id:e.pointerId,ox:e.clientX,oy:e.clientY,x:e.clientX,y:e.clientY,dx:0,dy:0});try{cv.setPointerCapture(e.pointerId)}catch(_){}});
cv.addEventListener('pointermove',e=>{if(!joy.active||e.pointerId!==joy.id)return;joy.x=e.clientX;joy.y=e.clientY;
  let dx=(joy.x-joy.ox)/JR,dy=(joy.y-joy.oy)/JR;const m=Math.hypot(dx,dy);
  if(m>1){dx/=m;dy/=m;joy.ox=joy.x-dx*JR;joy.oy=joy.y-dy*JR}
  if(Math.hypot(dx,dy)<.15){dx=dy=0}joy.dx=dx;joy.dy=dy});
const endJoy=e=>{if(e.pointerId===joy.id){joy.active=false;joy.dx=joy.dy=0;joy.id=null}};
cv.addEventListener('pointerup',endJoy);cv.addEventListener('pointercancel',endJoy);
$('dashBtn').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();initAudio();dash()});
$('ultBtn').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();initAudio();useUlt()});
function input(){if(INTRO.on)return INTRO.inp;let x=0,y=0;
  if(keys.ArrowLeft||keys.KeyA)x-=1;if(keys.ArrowRight||keys.KeyD)x+=1;if(keys.ArrowUp||keys.KeyW)y-=1;if(keys.ArrowDown||keys.KeyS)y+=1;
  if(joy.active){x+=joy.dx;y+=joy.dy}const m=Math.hypot(x,y);if(m>1){x/=m;y/=m}return{x,y,m:Math.min(1,m)}}

// ---------- audio ----------
