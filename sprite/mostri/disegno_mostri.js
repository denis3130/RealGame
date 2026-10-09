// New chapter enemies for Mossbound: Zombie, Segugio infernale (demon hound), boss Il Becchino.
// Drawn with the game's own primitives (ctx, ink, circ, ell, fs, glow, shadow, basis, INK, LOWFX).
// anim: 'idle' | 'walk' | 'attack' (boss: 'idle' | 'walk' | 'slam' | 'summon'); p = 0..1 progress in the cycle.
window.CR=(()=>{
const TAU=Math.PI*2,cl=(v,a,b)=>Math.max(a,Math.min(b,v)),ez=k=>k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
function line(x1,y1,x2,y2,w,col){ctx.strokeStyle=INK;ctx.lineWidth=w+2.6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.strokeStyle=col;ctx.lineWidth=w;ctx.stroke()}
function quad(x1,y1,cx,cy,x2,y2,w,col){ctx.strokeStyle=INK;ctx.lineWidth=w+2.6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x1,y1);ctx.quadraticCurveTo(cx,cy,x2,y2);ctx.stroke();ctx.strokeStyle=col;ctx.lineWidth=w;ctx.stroke()}

// ------------------------------------------------------------------ ZOMBIE
const ZC={skin:'#9cbf72',skinD:'#6f9150',shirt:'#5d7a94',shirtD:'#41586c',patch:'#a0703f',shoe:'#3e3a34',mouth:'#3a1d1d'};
function zombie(x,y,face,anim,p,sc){sc=sc||1.1;const B=basis(face),v=B.v,t=G.t;
  const walk=anim==='walk',atk=anim==='attack';
  const ph=p*TAU,w=walk?Math.sin(ph):0,bob=walk?Math.abs(Math.sin(ph))*1.4:Math.sin(ph)*.5;
  // attack: 0-.35 wind up (arms up, lean back), .35-.6 swipe (lean in), .6-1 recover
  let up=0,lean=0,reach=0;if(atk){if(p<.35){const k=ez(p/.35);up=k;lean=-k*.12}else if(p<.6){const k=ez((p-.35)/.25);up=1-k;lean=-.12+k*.3;reach=k}else{const k=ez((p-.6)/.4);lean=.18*(1-k);reach=1-k}}
  const sway=walk?Math.sin(ph)*.09:Math.sin(ph)*.04;
  shadow(x,y+8*sc,12*sc,4.6*sc,.32);
  ctx.save();ctx.translate(x,y-bob);ctx.scale(B.f*sc,sc);ctx.rotate(sway*(B.side?.4:1)+(B.side?lean:0));ink(2.5);
  // feet, dragging
  let a,b;if(B.side){a=[w*5,7];b=[-w*4,7.5]}else if(v==='s34'||v==='n34'){a=[-4+w*3,7+w];b=[4-w*3,7-w]}else{a=[-5,7+w*2];b=[5,7-w*2]}
  ell(b[0],b[1],4,3);fs('#2e2b26');ell(a[0],a[1],4,3);fs(ZC.shoe);
  // arms reaching forward: hands follow the facing direction
  const bw=B.side?8:v==='s'||v==='n'?11:9.5;
  const reachL=13+reach*7,hy=-6+B.ly*4-up*12-(1-up)*Math.sin(t*3)*.6;
  const arms=[];for(const s of[-1,1]){const sx=B.side?(s<0?-1:2):s*bw*.72,sy=-8;
    const hx=B.lx*reachL+(B.side?(s<0?-2:0):s*(4.5-Math.abs(B.lx)*2)),hyy=hy+(B.side?(s<0?-2:0):0)+(walk?Math.sin(ph+s)*1.2:0);arms.push([sx,sy,hx,hyy,s])}
  const drawArm=([sx,sy,hx,hy2,s])=>{line(sx,sy,hx,hy2,5.2,s<0&&B.side?ZC.skinD:ZC.skin);ctx.save();ctx.translate(hx,hy2);ink(1.6);circ(0,0,3.1);fs(ZC.skin);
    ctx.strokeStyle=INK;ctx.lineWidth=1.2;const ang=Math.atan2(B.ly,B.lx||.0001)-(up>.5?Math.PI/2:0);for(let k=-1;k<=1;k++){ctx.beginPath();ctx.moveTo(Math.cos(ang+k*.5)*2.6,Math.sin(ang+k*.5)*2.6);ctx.lineTo(Math.cos(ang+k*.45)*4.6,Math.sin(ang+k*.45)*4.6);ctx.stroke()}ctx.restore()};
  if(B.back)arms.forEach(drawArm);else if(B.side)drawArm(arms[0]);
  // torn shirt
  ink(2.5);ctx.beginPath();ctx.moveTo(-bw,4);ctx.quadraticCurveTo(-bw-2,-9,0,-11);ctx.quadraticCurveTo(bw+2,-9,bw,4);
  for(let i=0;i<=6;i++){const xx=bw-i*bw*2/6;ctx.lineTo(xx,i%2?6.5:4)}ctx.closePath();ctx.fillStyle=ZC.shirt;ctx.fill();ctx.stroke();
  ctx.fillStyle=ZC.shirtD;ctx.beginPath();ctx.ellipse(B.side?-3:bw*.35,0,bw*.45,4,0,0,TAU);ctx.fill();
  if(!B.back){ink(1.2);ctx.fillStyle=ZC.patch;ctx.fillRect(B.side?0:-bw*.6,-5,4.4,4);ctx.strokeRect(B.side?0:-bw*.6,-5,4.4,4);ctx.beginPath();ctx.moveTo(B.side?.6:-bw*.6+.6,-4);ctx.lineTo(B.side?3.8:-bw*.6+3.8,-1.4);ctx.stroke();
    ctx.strokeStyle='rgba(27,22,18,.5)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(B.side?5:3,-9);ctx.lineTo(B.side?3:1,-3);ctx.lineTo(B.side?6:4,1);ctx.stroke()}
  else{ctx.strokeStyle='rgba(27,22,18,.45)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(-4,-8);ctx.lineTo(-1,-3);ctx.lineTo(-5,2);ctx.stroke()}
  ink(2.5);
  if(!B.back)arms.slice(B.side?1:0).forEach(drawArm);
  // head: big, tilted, one huge eye
  const hx=B.side?3:B.lx*2,hyH=-19+(walk?Math.sin(ph*2)*.6:0),tilt=.18+Math.sin(t*1.7)*.05;
  ctx.save();ctx.translate(hx,hyH);ctx.rotate(B.side?.1:tilt);ink(2.5);
  ctx.beginPath();ctx.ellipse(0,0,9.6,9,0,0,TAU);ctx.fillStyle=ZC.skin;ctx.fill();ctx.stroke();
  ctx.fillStyle=ZC.skinD;ctx.beginPath();ctx.ellipse(B.side?-3:2.5,3.5,6,4,0,0,TAU);ctx.fill();
  // hair tuft
  ctx.strokeStyle=INK;ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(-3,-8.4);ctx.lineTo(-4.4,-12);ctx.moveTo(0,-9);ctx.lineTo(.6,-12.6);ctx.moveTo(2.6,-8.6);ctx.lineTo(4.6,-11.4);ctx.stroke();
  if(B.back){ctx.strokeStyle='rgba(27,22,18,.6)';ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(-5,-2);ctx.lineTo(4,1);for(let i=0;i<4;i++){const xx=-4+i*2.6,yy=-1.6+i*.8;ctx.moveTo(xx,yy-1.4);ctx.lineTo(xx+.4,yy+1.4)}ctx.stroke()}
  else{const ex=B.side?4:v==='s34'?2.4:0,big=B.side?[ex+1,-2]:[ex-3.4,-2],small=B.side?null:[ex+3.6,-1.4];
    ink(1.6);circ(big[0],big[1],3.4);fs('#f4f1e0');ctx.fillStyle=INK;circ(big[0]+(B.side?1:.4),big[1]+.6,1.2);ctx.fill();
    if(small){ctx.strokeStyle=INK;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(small[0]-1.6,small[1]-1.6);ctx.lineTo(small[0]+1.6,small[1]+1.6);ctx.moveTo(small[0]+1.6,small[1]-1.6);ctx.lineTo(small[0]-1.6,small[1]+1.6);ctx.stroke()}
    const mo=atk&&p>.3&&p<.7?1:.55+.15*Math.sin(t*4),mx=B.side?6.2:ex;ink(1.5);ctx.beginPath();ctx.ellipse(mx,4.2,B.side?2:3.6,1.8+mo*1.6,0,0,TAU);ctx.fillStyle=ZC.mouth;ctx.fill();ctx.stroke();
    ctx.fillStyle='#f4f1e0';ctx.fillRect(mx-1.6,2.8,1.3,1.6);ctx.fillRect(mx+.6,2.8,1.3,1.4);
    ctx.strokeStyle='rgba(27,22,18,.7)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(B.side?-4:-6,-5);ctx.lineTo(B.side?-1:-3,-7);for(let i=0;i<3;i++){const xx=(B.side?-3.6:-5.6)+i*1.1,yy=-5.4-i*.7;ctx.moveTo(xx-.6,yy-.9);ctx.lineTo(xx+.6,yy+.9)}ctx.stroke()}
  ctx.restore();ctx.restore()}

// ------------------------------------------------------------------ SEGUGIO INFERNALE (demon hound)
const HC={fur:'#3b2b30',furD:'#251a1e',belly:'#5a3a3a',spike:'#8a2020',ember:'#ff7a2a',eye:'#ff3b2f',horn:'#d9cbb0'};
function hound(x,y,face,anim,p,sc){sc=sc||1.05;const B=basis(face),t=G.t,run=anim==='walk',atk=anim==='attack';
  const ph=p*TAU,fx=Math.cos(face),fy=Math.sin(face)*.55,px=-fy,py=fx;// forward and sideways on screen
  // pounce: .0-.3 crouch, .3-.75 leap, .75-1 land
  let z=0,crouch=0,stretch=0,jaw=run?.25:.15;if(atk){if(p<.3){crouch=ez(p/.3);jaw=.3}else if(p<.75){const k=(p-.3)/.45;z=Math.sin(k*Math.PI)*16;stretch=Math.sin(k*Math.PI);crouch=0;jaw=1}else{const k=(p-.75)/.25;crouch=(1-k)*.6;jaw=.6*(1-k)}}
  const bob=run?Math.abs(Math.sin(ph))*2:Math.sin(ph)*.5,breath=Math.sin(ph)*.6;
  shadow(x,y+7*sc,14*sc*(1-z/40),5*sc*(1-z/40),.34);
  ctx.save();ctx.translate(x,y-z*sc-bob*sc+crouch*2.5*sc);ctx.scale(sc,sc);ink(2.4);
  const lead=atk&&p>.3&&p<.75?4:0,R=[-9-stretch*2,0],C=[6+stretch*3+lead*.3,-1],H=[14+stretch*4+lead,-7+crouch*3];
  const at=(u,h)=>[fx*u+px*0,fy*u-h];// point along the body axis (u forward), h up
  const P=(q)=>at(q[0],-q[1]);
  const parts=[];
  // legs: 4, gallop phases
  const leg=(u,side,phase)=>{const base=at(u,-1);const s=side*3.8,bx=base[0]+px*s,by=base[1]+py*s*.6;let swing=run?Math.sin(ph+phase)*5:0,lift=run?Math.max(0,Math.cos(ph+phase))*2.4:0;if(atk&&p>.3&&p<.75){swing=(u>0?7:-7)}
    const fx2=bx+fx*swing,fy2=by+fy*swing+7-lift-crouch*2;parts.push({d:by+(side>0?.5:-.5)*Math.abs(py),f:()=>{line(bx,by,fx2,fy2,3.2,side<0?HC.furD:HC.fur);ink(1.2);ctx.fillStyle=HC.furD;circ(fx2,fy2,1.8);ctx.fill();ctx.stroke()}})};
  leg(R[0],-1,0);leg(R[0],1,Math.PI*.5);leg(C[0],-1,Math.PI);leg(C[0],1,Math.PI*1.5);
  // tail with a flame at the tip
  {const r=P(R),tw=Math.sin(t*6)*3,tx=r[0]-fx*9+px*tw*.4,ty=r[1]-fy*9-6+(run?Math.sin(ph*2)*1.5:0);parts.push({d:r[1]-fy*6-.2,f:()=>{quad(r[0],r[1]-2,r[0]-fx*6,r[1]-fy*6-6,tx,ty,2.4,HC.fur);
    if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow('255,120,40',tx,ty-2,7,.5+.1*Math.sin(t*14));ctx.restore()}
    ink(1.2);ctx.fillStyle=HC.ember;ctx.beginPath();ctx.moveTo(tx-2.4,ty+1);ctx.quadraticCurveTo(tx-1.6,ty-4,tx+Math.sin(t*12)*1.2,ty-6.5);ctx.quadraticCurveTo(tx+1.8,ty-3.6,tx+2.4,ty+1);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#ffe28a';circ(tx,ty-1.2,1);ctx.fill()}})}
  // body: rump + chest blobs with spikes and ember cracks
  const body=()=>{const r=P(R),c=P(C);ink(2.4);ctx.fillStyle=HC.fur;
    ctx.beginPath();ctx.ellipse(r[0],r[1],7.5,6.2,0,0,TAU);ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.ellipse(c[0],c[1]-.5,8.2+breath*.3,7+breath*.3,0,0,TAU);ctx.fill();ctx.stroke();
    ctx.fillStyle=HC.fur;ctx.beginPath();ctx.moveTo(r[0],r[1]-6);ctx.lineTo(c[0],c[1]-7);ctx.lineTo(c[0],c[1]+6);ctx.lineTo(r[0],r[1]+6);ctx.closePath();ctx.fill();
    ctx.fillStyle=HC.belly;ctx.beginPath();ctx.ellipse((r[0]+c[0])/2,(r[1]+c[1])/2+3.4,7,2.6,Math.atan2(c[1]-r[1],c[0]-r[0]),0,TAU);ctx.fill();
    // spikes along the spine
    for(let i=0;i<5;i++){const k=i/4,sx=r[0]+(c[0]-r[0])*k,sy=r[1]+(c[1]-r[1])*k-6.4-(i===4?.6:0);ink(1.3);ctx.fillStyle=HC.spike;ctx.beginPath();ctx.moveTo(sx-2,sy+1.5);ctx.lineTo(sx-fx*1.5,sy-4-(i%2)*1.2);ctx.lineTo(sx+2,sy+1.5);ctx.closePath();ctx.fill();ctx.stroke()}
    // glowing cracks
    const gl=.65+.35*Math.sin(t*4);ctx.strokeStyle=`rgba(255,${120+50*gl|0},40,${.75*gl+.25})`;ctx.lineWidth=1.2;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(c[0]-2,c[1]-3);ctx.lineTo(c[0]+.5,c[1]);ctx.lineTo(c[0]-1,c[1]+2.5);ctx.moveTo(r[0]+1,r[1]-2);ctx.lineTo(r[0]-1.5,r[1]+1);ctx.stroke();ink(2.4)};
  const c=P(C);parts.push({d:c[1]-.1,f:body});
  // head: wolf skull-ish, horns, glowing eyes, jaw opens to bite
  const head=()=>{const h=P(H),ang=Math.atan2(fy,fx||1e-4);ctx.save();ctx.translate(h[0],h[1]);ink(2.4);
    // neck
    ctx.restore();line(c[0],c[1]-3,h[0],h[1],6,HC.fur);ctx.save();ctx.translate(h[0],h[1]);
    const back=B.back,sideF=Math.abs(fx)>.5;
    // horns
    for(const s of[-1,1]){const hx=-fx*2+px*s*3.4,hy=-fy*2-4.5+py*s*.6;ink(1.4);ctx.fillStyle=HC.horn;ctx.beginPath();ctx.moveTo(hx-1.6,hy+1);ctx.quadraticCurveTo(hx-fx*3+s*px*2,hy-5,hx-fx*5+s*px*3,hy-7.5);ctx.quadraticCurveTo(hx+1,hy-3,hx+1.6,hy+1);ctx.closePath();ctx.fill();ctx.stroke()}
    // skull
    ctx.fillStyle=HC.fur;ctx.beginPath();ctx.ellipse(0,0,6.6,5.8,0,0,TAU);ctx.fill();ctx.stroke();
    // ears
    for(const s of[-1,1]){const ex=-fx*1.5+px*s*4.2,ey=-fy*1.5-3.6;ctx.fillStyle=HC.furD;ctx.beginPath();ctx.moveTo(ex-1.8,ey+1.4);ctx.lineTo(ex-fx*.5+px*s,ey-4.6);ctx.lineTo(ex+1.8,ey+1.4);ctx.closePath();ctx.fill();ctx.stroke()}
    if(!back){// snout + jaw toward facing
      const sx=fx*6.5,sy=fy*6.5+1.4,op=jaw*3;ctx.fillStyle=HC.furD;ctx.beginPath();ctx.ellipse(sx,sy+op*.6,3.6,2.2,ang,0,TAU);ctx.fill();ctx.stroke();
      ctx.fillStyle=HC.fur;ctx.beginPath();ctx.ellipse(sx*.9,sy-1.2,4,2.6,ang,0,TAU);ctx.fill();ctx.stroke();
      if(op>.6){ctx.fillStyle='#5a0f12';ctx.beginPath();ctx.ellipse(sx*.95,sy+op*.2-.2,3,op*.45,ang,0,TAU);ctx.fill()}
      ctx.fillStyle='#fff8e6';for(const s of[-1,1]){ctx.beginPath();const tx=sx*.95+px*s*1.8,ty=sy-.2+py*s*.4;ctx.moveTo(tx-.7,ty);ctx.lineTo(tx,ty+1.8+op*.3);ctx.lineTo(tx+.7,ty);ctx.closePath();ctx.fill()}
      ctx.fillStyle=INK;circ(sx*1.25,sy-1.6,.9);ctx.fill();
      // glowing eyes
      const eyes=sideF?[[fx*2.4+px*0,-1.6]]:[[px*-2.4+fx*2,-1.6],[px*2.4+fx*2,-1.6]];
      for(const[e1,e2] of eyes){if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow('255,60,40',e1,e2,5,.55+.15*Math.sin(t*5));ctx.restore()}ctx.fillStyle=HC.eye;ctx.beginPath();ctx.ellipse(e1,e2,1.6,1.1,ang*.3,0,TAU);ctx.fill();ctx.fillStyle='#ffe28a';circ(e1+.3,e2-.2,.45);ctx.fill()}}
    ctx.restore()};
  const h=P(H);parts.push({d:h[1]+(B.back?-30:30),f:head});
  parts.sort((a,b)=>a.d-b.d).forEach(q=>q.f());
  ctx.restore()}

// ------------------------------------------------------------------ BOSS: IL BECCHINO (the gravedigger)
const BC={skin:'#8fb06a',skinD:'#647f48',coat:'#4a3b5c',coatD:'#33284a',belly:'#a7c47e',hat:'#2a2230',band:'#7a2e3a',shovel:'#8a96a2',wood:'#7a5230',glow:'150,255,110'};
function becchino(x,y,face,anim,p,sc){sc=sc||2.2;const B=basis(face),v=B.v,t=G.t,ph=p*TAU;
  const walk=anim==='walk',slam=anim==='slam',sum=anim==='summon';
  const w=walk?Math.sin(ph):0,bob=walk?Math.abs(Math.sin(ph))*1.6:Math.sin(ph)*.6;
  // slam: .0-.45 raise shovel overhead, .45-.6 smash, .6-1 hold/recover ; summon: arms up + glow + hands from the ground
  let raise=0,smash=0,lift=0,squash=0;
  if(slam){if(p<.45){raise=ez(p/.45);lift=raise*2}else if(p<.6){const k=(p-.45)/.15;raise=1-k*1.6;smash=k;squash=Math.sin(k*Math.PI)*.12}else{const k=(p-.6)/.4;raise=-.6*(1-ez(k));smash=1-k}}
  let arms=0;if(sum){arms=p<.25?ez(p/.25):p<.8?1:1-ez((p-.8)/.2)}
  shadow(x,y+9*sc,15*sc,5.6*sc,.36);
  // summon: green rune and hands breaking out of the ground (on the floor, under the boss)
  if(sum){const k=cl((p-.15)/.6,0,1);ctx.save();if(!LOWFX){ctx.globalCompositeOperation='lighter';glow(BC.glow,x,y+9*sc,32*sc*arms,.35*arms,10*sc*arms);ctx.globalCompositeOperation='source-over'}
    ctx.strokeStyle=`rgba(150,255,110,${.55*arms})`;ctx.lineWidth=2;ell(x,y+9*sc,26*sc*arms,8*sc*arms);ctx.stroke();
    for(let i=0;i<3;i++){const a=i*TAU/3+.5,hx=x+Math.cos(a)*24*sc,hy=y+9*sc+Math.sin(a)*8*sc,e=cl(k*1.4-i*.15,0,1);if(e<=0)continue;
      ctx.fillStyle='rgba(30,22,16,.7)';ell(hx,hy+2,5*sc,1.8*sc);ctx.fill();ctx.save();ctx.translate(hx,hy);ctx.scale(sc*.85,sc*.85);ink(1.8);
      const up=e*9;ctx.fillStyle=ZC.skin;ctx.beginPath();ctx.rect(-2.2,-up,4.4,up);ctx.fill();ctx.stroke();circ(0,-up,3.2);fs(ZC.skin);
      ctx.strokeStyle=INK;ctx.lineWidth=1.4;for(let f=-1;f<=1;f++){ctx.beginPath();ctx.moveTo(f*1.6,-up-2.4);ctx.lineTo(f*2.2,-up-5.4-Math.sin(t*8+i+f)*.6);ctx.stroke()}ctx.restore()}
    ctx.restore()}
  ctx.save();ctx.translate(x,y-bob*sc-lift*sc);ctx.scale(B.f*sc*(1+squash),sc*(1-squash));ink(2.4);
  // legs: short and stumpy
  let a,b;if(B.side){a=[w*4,8];b=[-w*4,8]}else{a=[-6,8+w*1.6];b=[6,8-w*1.6]}
  for(const q of[b,a]){ctx.fillStyle=BC.coatD;ctx.beginPath();ctx.rect(q[0]-3,q[1]-6,6,6);ctx.fill();ctx.stroke();ell(q[0]+(B.side?1.5:0),q[1]+.6,4.6,2.6);fs('#2a2420')}
  const bw=B.side?12:v==='s'||v==='n'?16:14;
  // shovel: held in one hand; behind the body when seen from the back
  const shovel=()=>{let ang,hx,hy;
    if(slam){ang=.35-raise*(Math.PI/2+.7);hx=B.side?7:B.lx*10+9;hy=-6-raise*8}else if(sum){ang=.9;hx=B.side?6:13;hy=2}else{ang=.5+Math.sin(t*1.5)*.05+(walk?w*.08:0);hx=B.side?7:B.lx*8+12;hy=-2}
    ctx.save();ctx.translate(hx,hy);ctx.rotate(ang);
    line(-6,0,20,0,2.8,BC.wood);ctx.fillStyle=BC.wood;ink(1.6);ctx.beginPath();ctx.rect(-9,-2.6,4,5.2);ctx.fill();ctx.stroke();
    ink(2);ctx.beginPath();ctx.moveTo(19,-5.5);ctx.lineTo(29,-4);ctx.quadraticCurveTo(32,0,29,4);ctx.lineTo(19,5.5);ctx.closePath();ctx.fillStyle=BC.shovel;ctx.fill();ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillRect(20.5,-3.6,6,1.4);ctx.fillStyle='rgba(120,70,40,.55)';circ(26,2,1.4);ctx.fill();circ(23,3,.9);ctx.fill();
    ink(2);circ(0,0,4);fs(BC.skin);ctx.restore()};
  if(B.back)shovel();
  // free arm
  const armUp=sum?arms:0,ax=B.side?-4:-bw-1,ay=-8;
  const freeArm=()=>{const hx=B.side?-6-armUp*2:-bw-6-armUp*2,hy=-2-armUp*22+(walk?w*2:0);line(ax,ay,hx,hy,6,BC.coat);ink(2);circ(hx,hy,4);fs(BC.skin)};
  if(B.back||B.side)freeArm();
  // coat + belly
  ctx.beginPath();ctx.moveTo(-bw,6);ctx.quadraticCurveTo(-bw-5,-6,-bw*.55,-14);ctx.quadraticCurveTo(0,-17,bw*.55,-14);ctx.quadraticCurveTo(bw+5,-6,bw,6);ctx.quadraticCurveTo(0,12,-bw,6);ctx.closePath();ctx.fillStyle=BC.coat;ctx.fill();ctx.stroke();
  if(!B.back){const bx=B.side?3:0,breath=Math.sin(t*2)*.6;ctx.fillStyle=BC.belly;ctx.beginPath();ctx.ellipse(bx,0,(B.side?7:10)+breath,8.6+breath,0,0,TAU);ctx.fill();ctx.stroke();
    ctx.strokeStyle=INK;ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(bx-4,-5);ctx.quadraticCurveTo(bx+1,0,bx-2,6);for(let i=0;i<4;i++){const yy=-4+i*3,xx=bx-3.4+Math.sin(i)*.6+i*.4;ctx.moveTo(xx-1.8,yy);ctx.lineTo(xx+1.8,yy+.6)}ctx.stroke();
    if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow(BC.glow,bx+3,2,9,.22+.08*Math.sin(t*3));ctx.restore()}
    // coat edges
    ctx.strokeStyle=BC.coatD;ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(bx-(B.side?7:10)-1,-6);ctx.lineTo(bx-(B.side?7:10)+1,7);ctx.stroke();ink(2.4);
    ctx.fillStyle='#c9a040';for(const yy of[-9,-4])circ(bx-(B.side?6:9)-2,yy,1.1),ctx.fill()}
  else{ctx.strokeStyle=BC.coatD;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-14);ctx.lineTo(0,8);ctx.stroke();ctx.fillStyle='#8a6a4a';ctx.beginPath();ctx.rect(-4,-6,7,6);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.3;ctx.stroke();ink(2.4)}
  if(!B.back&&!B.side)freeArm();
  if(!B.back)shovel();
  // head: small for the body, top hat, one glowing eye, crooked smile
  const hx=B.side?3:B.lx*2,hy=-21+(walk?Math.sin(ph*2)*.5:0)-(sum?arms*1.5:0);ctx.save();ctx.translate(hx,hy);ink(2.4);
  ctx.beginPath();ctx.ellipse(0,0,8.4,7.6,0,0,TAU);ctx.fillStyle=BC.skin;ctx.fill();ctx.stroke();ctx.fillStyle=BC.skinD;ctx.beginPath();ctx.ellipse(B.side?-2:2,3,5,3,0,0,TAU);ctx.fill();
  if(!B.back){const ex=B.side?3.6:v==='s34'?1.8:0,ge=sum?1:.5+.3*Math.sin(t*3);
    if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow(BC.glow,ex-(B.side?-1:2.4),-1.6,6+ge*3,.4+ge*.3);ctx.restore()}
    ink(1.4);circ(ex-(B.side?-1:2.4),-1.6,2.8);fs('#e9ffcf');ctx.fillStyle='#4fc23a';circ(ex-(B.side?-1.6:2),-1.2,1.3);ctx.fill();
    if(!B.side){ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(ex+1.6,-2.6);ctx.lineTo(ex+5,-1.2);ctx.stroke()}
    const op=(slam&&p>.4&&p<.65)||sum?1:0;ctx.fillStyle='#3a1d1d';ctx.beginPath();ctx.ellipse(ex+(B.side?2.4:.6),3.4,B.side?2:3.8,1.2+op*1.6,-.08,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='#f4f1e0';ctx.fillRect(ex-1+(B.side?2:0),2.6,1.4,1.4)}
  // top hat
  ctx.rotate(-.12);ink(2.2);ctx.fillStyle=BC.hat;ctx.beginPath();ctx.ellipse(0,-6,10,2.6,0,0,TAU);ctx.fill();ctx.stroke();ctx.beginPath();ctx.rect(-6,-17,12,11);ctx.fill();ctx.stroke();
  ctx.fillStyle=BC.band;ctx.fillRect(-6,-9.6,12,2.6);ctx.strokeRect(-6,-9.6,12,2.6);
  ctx.fillStyle='rgba(255,255,255,.12)';ctx.fillRect(-4.6,-16,2,6);ctx.restore();
  // flies circling
  if(!LOWFX){ctx.fillStyle=INK;for(let i=0;i<3;i++){const a=t*3+i*2.1;circ(hx+Math.cos(a)*13,hy-6+Math.sin(a*1.3)*4,.8);ctx.fill()}}
  ctx.restore();
  // slam impact on the floor: crack ring and green splash
  if(slam&&p>.55&&p<.95){const k=(p-.55)/.4,ix=x+(B.side?7:B.lx*10+9)*B.f*sc,iy=y+9*sc;ctx.save();ctx.strokeStyle=`rgba(150,255,110,${.7*(1-k)})`;ctx.lineWidth=3;ell(ix,iy,(8+k*30)*sc/2.2,(3+k*11)*sc/2.2);ctx.stroke();
    ctx.strokeStyle=`rgba(27,22,18,${.8*(1-k*.5)})`;ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<5;i++){const a=i*1.26+.3;ctx.moveTo(ix,iy);ctx.lineTo(ix+Math.cos(a)*14*sc/2.2*(.6+k),iy+Math.sin(a)*5*sc/2.2*(.6+k))}ctx.stroke();ctx.restore()}
}
return {zombie,hound,becchino};
})();
