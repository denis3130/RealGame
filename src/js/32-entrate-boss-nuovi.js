// ---------------- boss entrances for the new bosses ----------------
function bossIntro3(e,t,t0,at,roar){
  if(e.type==='toad'){// bursts out of the swamp water with a croak that shakes the room
    e.em=Math.min(1,Math.max(0,(t-.5)/.8));e.hole=Math.min(1,t/.4);e.sac=t>1.4&&t<2.2?Math.sin((t-1.4)/.8*Math.PI):0;
    if(t0===0){sfx('creep',1,e.x);shake(2)}
    if(at(.5)){shake(6);sfx('splash',2,e.x);vfxBlast(e.x,e.y,'120,200,140',100,{sparks:12,spcol:['#c8f0d8','#7bd6a0','#ffffff'],dust:0,debris:['#3f7a4a','#2a5a34','#8fd0a8'],n:20,ring2:false});G.ripples.push({x:e.x,y:e.y,r:10,max:80,a:1})}
    if(e.em>0&&e.em<1&&Math.random()<.5)G.fx.push({k:'bub',x:e.x+rand(-30,30),y:e.y+rand(-10,10),t:.5,r:rand(2,4)});
    if(at(1.5)){sfx('croak',2,e.x);roar()}return true}
  if(e.type==='hydra'){// the pool boils, one head, then the others, then the body
    if(!e.heads)e.heads=[-1,0,1].map((s,i)=>({s,t:1+i*.7,st:'idle',ext:0,open:0,tx:e.x,ty:e.y,k:0}));// the heads must exist during the entrance, or the hydra is not drawn at all
    e.em=Math.min(1,Math.max(0,(t-.6)/1.2));e.hole=Math.min(1,t/.5);if(t0===0){sfx('creep',1,e.x);shake(2)}
    if(Math.random()<.6&&t<1.8)G.fx.push({k:'bub',x:e.x+rand(-40,40),y:e.y+rand(-14,14),t:.6,r:rand(2,5)});
    if(at(.6)){shake(5);sfx('splash',2,e.x);vfxBlast(e.x,e.y,'120,200,140',110,{sparks:14,spcol:['#c8f0d8','#7bd6a0','#ffffff'],dust:0,debris:['#3f7a4a','#2a5a34','#8fd0a8'],n:22,ring2:false})}
    if(at(1.9)){sfx('roar',0,e.x);roar()}return true}
  if(e.type==='yeti'){// eyes in the dark doorway, a roar, then he smashes through the gate and lands in the room
    const jump=1.75,land=2.3;if(t<jump){e.yy=TOP-16;e.z=0}else{const k=clamp((t-jump)/(land-jump),0,1);e.yy=(TOP-16)+(e.y-(TOP-16))*k;e.z=Math.sin(k*Math.PI)*80}
    if(t0===0){sfx('quake',0,e.x);shake(2)}
    if(t<jump&&Math.random()<.35)G.debris.push({x:AW/2+rand(-DOORW,DOORW),y:TOP+rand(2,10),z:rand(30,60),vx:rand(-20,20),vy:rand(10,40),vz:0,col:pk(['#ffffff','#e0ecf4']),s:rand(1.6,3),rot:0,vr:3,life:1.6});
    if(at(.8)){sfx('roar',0,e.x);roar()}
    if(at(jump)){sfx('boom',0,AW/2);shake(8);vfxBlast(AW/2,TOP+4,'230,245,255',70,{debris:['#6b6f78','#4a4f58','#ffffff'],n:16,dust:12,sparks:10,spcol:['#ffffff','#c9cfd6']})}
    if(at(land)){e.z=0;e.yy=null;shake(14);G.hitstop=Math.max(G.hitstop||0,.1);sfx('boom',0,e.x);vib([120,50,160]);stamp('crater',e.x,e.y+4,e.r*1.6);dustRing(e.x,e.y,30);
      vfxBlast(e.x,e.y,'230,245,255',150,{debris:['#ffffff','#e0ecf4','#c8d8e6'],n:34,dust:30,sparks:12,spcol:['#ffffff','#c9f3ff']});for(let i=0;i<3;i++)setTimeout(()=>{if(G&&G.fx)fxPush({k:'ring2',x:e.x,y:e.y,rgb:'220,240,255',r0:e.r,r1:e.r*(4+i*2),t:.5,max:.5,w:8-i*2})},i*90)}
    return true}
  if(e.type==='icequeen'){// snow swirls into the middle of the room and she takes shape out of it
    e.fa=Math.min(1,Math.max(0,(t-.9)/.9));if(t0===0){sfx('creep',2,e.x);sfx('freeze',2,e.x)}
    if(t<1.8){const k=t/1.8;for(let i=0;i<3;i++){const an=G.t*4+i*2.1+rand(-.3,.3),r=120*(1-k)+10;G.fx.push({k:'snowp',x:e.x+Math.cos(an)*r,y:e.y-26+Math.sin(an)*r*.5,vx:-Math.cos(an)*60,vy:-Math.sin(an)*30,t:.4})}}
    if(at(1.8)){fxPush({k:'flash',x:e.x,y:e.y-26,rgb:'220,240,255',r:140,t:.3,max:.3});vfxBlast(e.x,e.y-20,'200,230,255',90,{sparks:18,spcol:['#ffffff','#c9f3ff','#c8b8ff'],dust:0});sfx('shimmer',2,e.x)}
    if(at(2.1)){sfx('roar',0,e.x);roar()}return true}
  return false}

// ---------------- small effects used by the new worlds ----------------
const FXDRAW={
  ghost2:f=>{ctx.fillStyle=`rgba(${f.col},${f.t*2.4})`;circ(f.x,f.y,6);ctx.fill()},
  bub:f=>{const k=1-f.t/.6;ctx.strokeStyle=`rgba(210,240,190,${.7*(1-k)})`;ctx.lineWidth=1.2;circ(f.x,f.y-k*4,f.r*(.6+k*.6));ctx.stroke();if(k>.85){ctx.strokeStyle=`rgba(210,240,190,${(1-k)*3})`;circ(f.x,f.y-4,f.r*1.6);ctx.stroke()}},
  snowp:f=>{ctx.fillStyle=`rgba(255,255,255,${Math.min(1,f.t*2.5)})`;circ(f.x,f.y,1.6);ctx.fill()}};
// frost and slime puddles: they don't hurt, they slow you down
function drawSoftZone(z,a){
  if(z.kind==='frost'){const g=ctx.createRadialGradient(z.x,z.y,z.r*.2,z.x,z.y,z.r);g.addColorStop(0,`rgba(225,245,255,${.55*a})`);g.addColorStop(1,`rgba(160,215,255,${.15*a})`);ctx.fillStyle=g;ell(z.x,z.y,z.r,z.r*.62);ctx.fill();
    ctx.strokeStyle=`rgba(120,190,240,${.6*a})`;ctx.lineWidth=1.6;ell(z.x,z.y,z.r,z.r*.62);ctx.stroke();ctx.strokeStyle=`rgba(255,255,255,${.8*a})`;ctx.lineWidth=1.1;
    for(let i=0;i<4;i++){const an=i*1.7+z.x*.07,rr=z.r*.5,px=z.x+Math.cos(an)*rr,py=z.y+Math.sin(an)*rr*.6;ctx.beginPath();for(let k=0;k<3;k++){const q=k*Math.PI/3;ctx.moveTo(px-Math.cos(q)*3,py-Math.sin(q)*3);ctx.lineTo(px+Math.cos(q)*3,py+Math.sin(q)*3)}ctx.stroke()}}
  else{ctx.fillStyle=`rgba(210,200,110,${.32*a})`;ell(z.x,z.y,z.r,z.r*.6);ctx.fill();ctx.fillStyle=`rgba(255,255,220,${.35*a})`;ell(z.x-z.r*.3,z.y-z.r*.2,z.r*.35,z.r*.14);ctx.fill()}}
function drawIceBand(b,rect){
  if(b.warn>0){ctx.fillStyle=`rgba(160,215,255,${.12+.1*Math.sin(G.t*20)})`;ctx.fillRect(...rect);ctx.strokeStyle='rgba(160,215,255,.75)';ctx.lineWidth=2;ctx.setLineDash([8,6]);ctx.strokeRect(...rect);ctx.setLineDash([]);return}
  ctx.fillStyle='rgba(200,235,255,.4)';ctx.fillRect(...rect);ink(1.6);const len=b.h?R-L:BOT-TOP,sc=Math.min(1,(.45-b.act)/.08+.3);
  for(let s=7;s<len;s+=12){const cx=b.h?L+s:b.pos+((s*7)%9-4),cy=b.h?b.pos+((s*7)%9-4):TOP+s;ctx.beginPath();ctx.moveTo(cx-5,cy+6);ctx.lineTo(cx,cy+6-18*sc);ctx.lineTo(cx+5,cy+6);ctx.closePath();
    const g=ctx.createLinearGradient(cx,cy+6-18*sc,cx,cy+6);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#7fc8f0');ctx.fillStyle=g;ctx.fill();ctx.stroke()}}


