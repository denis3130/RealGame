// Zombie-mode enemies for Mossbound: Zombie della cripta, Zombie strisciante, Zombie minatore, Segugio infernale, boss Il Becchino.
// Every monster is a small 3D skeleton (x forward, y right, z up) projected with the facing angle, so it turns through
// all 360 degrees and every piece stays attached to the same point of the body.
//  - the trunk is a capsule (a hull around two balls, pelvis and chest), so it leans and bends the same way from every side
//  - arms and legs are two-bone chains solved with IK: the shoulder or hip is fixed on the body, the animation places the
//    hand or foot, the solver finds the elbow or knee, so a limb keeps its length and always bends the right way
//  - the draw order comes from the rest pose (where a shoulder or a hip sits on the body), never from a moving hand or foot,
//    so nothing jumps in front of or behind the body halfway through a move
//  - legs are always drawn under the body; limbs, sleeves and necks have no outline where they join the body
//  - held tools (pick, shovel) swing in a plane beside the head, so they never cut through the face, and stop at the floor
//  - every motion depends only on the cycle progress p, so each animation loops without a jump
// Drawn with the game's own primitives (ctx, ink, ell, shadow, glow, INK, LOWFX; G.t only for flickering lights).
// anim: 'idle' | 'walk' | 'attack' (boss: 'idle' | 'walk' | 'slam' | 'summon'); p = 0..1 progress in the cycle.
window.CR=(()=>{
const TAU=Math.PI*2,cl=(v,a,b)=>Math.max(a,Math.min(b,v)),ez=k=>k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2,lerp=(a,b,k)=>a+(b-a)*k;
const add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],mul=(a,k)=>[a[0]*k,a[1]*k,a[2]*k],
  len=a=>Math.hypot(a[0],a[1],a[2]),nrm=a=>{const l=len(a)||1;return[a[0]/l,a[1]/l,a[2]/l]},dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],
  cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],lerp3=(a,b,k)=>[lerp(a[0],b[0],k),lerp(a[1],b[1],k),lerp(a[2],b[2],k)];
// camera. P: body point -> screen; D: how close to the camera (draw order); F: how much a direction faces the camera (-1..1)
function V(face){const c=Math.cos(face),s=Math.sin(face);
  const P=(x,y,z)=>Array.isArray(x)?P(x[0],x[1],x[2]):[x*c-y*s,(x*s+y*c)*.55-z];
  const D=(x,y,z)=>Array.isArray(x)?D(x[0],x[1],x[2]):x*s+y*c+.55*(z||0);
  const F=(x,y,z)=>{if(Array.isArray(x))return F(x[0],x[1],x[2]);const l=Math.hypot(x,y,z||0)||1;return(x*s+y*c+.55*(z||0))/(l*1.141)};
  return{c,s,P,D,F}}
// colours: mix two #rrggbb (cached); farK = how much a limb on the far side of the body is darkened
const MX={};function mix(a,b,k){k=Math.round(cl(k,0,1)*16)/16;if(k<=0)return a;if(k>=1)return b;const id=a+b+k;if(MX[id])return MX[id];
  const A=parseInt(a.slice(1),16),B=parseInt(b.slice(1),16),f=h=>Math.round((A>>h&255)*(1-k)+(B>>h&255)*k);return MX[id]=`rgb(${f(16)},${f(8)},${f(0)})`}
const farK=f=>cl(-f*1.5,0,.9);
// two-bone IK: from root a toward target t, bones L1 and L2, the joint bends toward `pole`. Returns [joint, reached target]
function ik(a,t,L1,L2,pole){let d=sub(t,a),dl=len(d);const mx=L1+L2-.02;if(dl>mx){t=add(a,mul(d,mx/dl));d=sub(t,a);dl=mx}if(dl<.01)dl=.01;
  const u=mul(d,1/dl);let w=sub(pole,mul(u,dot(pole,u)));const wl=len(w);w=wl<1e-4?[0,0,1]:mul(w,1/wl);
  const x=(L1*L1-L2*L2+dl*dl)/(2*dl),h=Math.sqrt(Math.max(0,L1*L1-x*x));return[add(add(a,mul(u,x)),mul(w,h)),t]}
// feet or hands that step: planted for `share` of the cycle (sliding back as the body moves on), then swung forward and lifted
function stepper(p,share){return(k,S,H)=>{const q=((p+k)%1+1)%1;if(q<share)return{x:S-q/share*2*S,z:0};const u=(q-share)/(1-share);return{x:-S+ez(u)*2*S,z:Math.sin(u*Math.PI)*H}}}
const NOSTEP={x:0,z:0};

// ------------------------------------------------------------------ drawing helpers
function shine(rgb,x,y,r,a,ry){if(LOWFX||a<=0)return;ctx.save();ctx.globalCompositeOperation='lighter';glow(rgb,x,y,r,a,ry);ctx.restore()}
function ball(p,r){ctx.beginPath();ctx.arc(p[0],p[1],Math.max(.1,r),0,TAU)}
function seg(a,b){ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1])}
function tri(x0,y0,x1,y1,hw){const dx=x1-x0,dy=y1-y0,l=Math.hypot(dx,dy)||1,nx=-dy/l*hw,ny=dx/l*hw;ctx.beginPath();ctx.moveTo(x0+nx,y0+ny);ctx.lineTo(x1,y1);ctx.lineTo(x0-nx,y0-ny);ctx.closePath();ctx.fill();ctx.stroke()}
// a spike growing out of a surface: outline only on its two sides, so its base melts into the body
function spike(q,e,hw){const dx=e[0]-q[0],dy=e[1]-q[1],l=Math.hypot(dx,dy)||1,nx=-dy/l*hw,ny=dx/l*hw;ctx.beginPath();ctx.moveTo(q[0]+nx,q[1]+ny);ctx.lineTo(e[0],e[1]);ctx.lineTo(q[0]-nx,q[1]-ny);ctx.fill();ctx.stroke()}
// capsule outline around two screen circles: the shape of a trunk, a neck, a snout
function hull(a,ra,b,rb){const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy);ctx.beginPath();
  if(d<=Math.abs(ra-rb)+.01){const q=ra>=rb?a:b;ctx.arc(q[0],q[1],Math.max(ra,rb),0,TAU);return}
  const an=Math.atan2(dy,dx),f=Math.acos(cl((ra-rb)/d,-1,1));ctx.arc(a[0],a[1],ra,an+f,an+TAU-f);ctx.arc(b[0],b[1],rb,an-f,an+f);ctx.closePath()}
// a limb in two passes (every outline first, then every fill), so the joints have no seams; `end` (hand, paw, shoe) goes in between
function limb(pts,ws,col,end){ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=INK;
  for(let i=0;i<pts.length-1;i++){ctx.lineWidth=ws[i]+2.6;seg(pts[i],pts[i+1]);ctx.stroke()}
  if(end)end();ctx.lineCap='round';ctx.strokeStyle=col;
  for(let i=0;i<pts.length-1;i++){ctx.lineWidth=ws[i];seg(pts[i],pts[i+1]);ctx.stroke()}}
// a sleeve over the top of an arm. Where the shoulder sits on the edge of the body (rk=1) its root has no outline, so the arm
// grows out of the body; where the arm is in front of the body (seen from the side) the outline stays
function sleeve(a,b,w,col,rk){ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=w+2.6;seg(a,b);ctx.stroke();ctx.strokeStyle=col;ctx.lineWidth=w;ctx.stroke();if(rk>0){ctx.save();ctx.globalAlpha=rk;ctx.fillStyle=col;ball(a,w*.5+1.3);ctx.fill();ctx.restore()}}
// torn flaps at the end of a sleeve, hanging along the limb (direction taken in 3D, so they shorten instead of spinning)
function cuff(V0,e3,from3,w,col){const{P}=V0,e=P(e3),q=P(add(e3,nrm(sub(e3,from3))));let ux=q[0]-e[0],uy=q[1]-e[1]+.12;const pl=Math.hypot(ux,uy)||1;ux/=pl;uy/=pl;
  const k=Math.min(1,pl*1.3),nx=-uy,ny=ux;ctx.fillStyle=col;ctx.strokeStyle=INK;ctx.lineWidth=1.3;ctx.lineJoin='round';
  for(let i=-1;i<=1;i++){const bx=e[0]+nx*i*w*.3-ux*.8,by=e[1]+ny*i*w*.3-uy*.8,h=(i?2:3)*k+.6,hw=w*.19;ctx.beginPath();ctx.moveTo(bx-nx*hw,by-ny*hw);ctx.lineTo(bx+ux*h,by+uy*h);ctx.lineTo(bx+nx*hw,by+ny*hw);ctx.fill();ctx.stroke()}}
// a mark on the surface of a ball (centre C, radius r) in direction n: fn(screen point, how much it faces us); it fades in as it turns toward us
function on(V0,C,r,n,v0,fn){n=nrm(n);const v=V0.F(n);if(v<=v0)return;const q=V0.P(add(C,mul(n,r)));ctx.save();ctx.globalAlpha=cl((v-v0)*4,0,1);fn(q,v,n);ctx.restore()}
// a neck: capsule from the body to the head; `blend` hides its outline where it enters a body of the same colour
function neck(V0,a,ra,b,rb,col,blend){const A=V0.P(a),B=V0.P(b);ink(2.4);hull(A,ra,B,rb);ctx.fillStyle=col;ctx.fill();ctx.stroke();if(blend){ball(A,ra+1.3);ctx.fill()}}
// a hand: palm + three hooked fingers in 3D; fd = where the fingers point, pd = where the palm faces.
// The fingers foreshorten when they point at the camera instead of spinning round.
function hand(V0,h,fd,r,col,nail,pd){const{P}=V0;pd=pd||[1,0,-1];let cv=sub(pd,mul(fd,dot(pd,fd)));
  if(len(cv)<.25){const alt=[0,0,-1];cv=sub(alt,mul(fd,dot(alt,fd)));if(len(cv)<.25)cv=[1,0,0]}
  cv=nrm(cv);const sa=nrm(cross(fd,cv)),q=P(h),L=r*2,w=r*.6,fg=[];
  for(let k=-1;k<=1;k++){const d=nrm(add(fd,mul(sa,k*.55))),a=P(add(h,mul(d,r*.4))),m=P(add(add(h,mul(d,L*.85)),mul(cv,L*.1))),e=P(add(add(h,mul(d,L*(k?.88:1))),mul(cv,L*.5)));fg.push([a,m,e])}
  const path=f=>{ctx.beginPath();ctx.moveTo(f[0][0],f[0][1]);ctx.quadraticCurveTo(f[1][0],f[1][1],f[2][0],f[2][1])};
  ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=w+2.4;for(const f of fg){path(f);ctx.stroke()}ctx.fillStyle=INK;ball(q,r+1.25);ctx.fill();
  ctx.fillStyle=col;ball(q,r);ctx.fill();ctx.strokeStyle=col;ctx.lineWidth=w;for(const f of fg){path(f);ctx.stroke()}
  ctx.fillStyle=nail;for(const f of fg){ball(f[2],w*.62);ctx.fill()}}
// a fist closed round a handle
function fist(V0,h,r,col){const q=V0.P(h);ink(2.2);ball(q,r);ctx.fillStyle=col;ctx.fill();ctx.stroke();ctx.strokeStyle='rgba(20,16,14,.45)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(q[0],q[1],r*.55,-.4,1.2);ctx.stroke()}
// a leg from the hip: IK knee, seamless thigh and shin, and a shoe that is a little 3D capsule from heel to toe
function leg(V0,hip,foot,o){const{P}=V0,[kn,f]=ik(hip,add(foot,[0,0,o.ank||1.6]),o.L1,o.L2,o.pole||[1,0,.15]);
  limb([P(hip),P(kn),P(f)],[o.w1,o.w2],o.col,()=>{ink(2.4);ctx.fillStyle=o.shoe;hull(P(add(f,[-o.heel,0,-.4])),o.sr,P(add(f,[o.toe,0,-.6])),o.sr*1.08);ctx.fill();ctx.stroke()})}
// a trunk: capsule from the pelvis ball to the chest ball, a ragged hem under the pelvis, soft shading inside
function trunk(V0,Pv,rP,Ch,rC,col,colD,teeth){const{P}=V0,a=P(Pv),b=P(Ch);ink(2.4);
  if(teeth){const n=teeth*2,pts=[];for(let i=0;i<=n;i++){const an=Math.PI*(.14+.72*i/n),r=rP+(i%2?1.9+(i%4===1?.9:0):-.2);pts.push([a[0]+Math.cos(an)*r,a[1]+Math.sin(an)*r])}
    ctx.fillStyle=col;ctx.beginPath();for(const q of pts)ctx.lineTo(q[0],q[1]);ctx.lineTo(a[0],a[1]);ctx.closePath();ctx.fill();ctx.beginPath();for(const q of pts)ctx.lineTo(q[0],q[1]);ctx.stroke()}
  hull(a,rP,b,rC);ctx.fillStyle=col;ctx.fill();ctx.stroke();
  ctx.save();hull(a,rP-1.3,b,rC-1.3);ctx.clip();ctx.fillStyle=colD;ell(a[0]+rP*.55,a[1]+rP*.55,rP,rP*.75);ctx.fill();ell(b[0]+rC*.78,b[1]+rC*.2,rC*.55,rC);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.07)';ell(b[0]-rC*.38,b[1]-rC*.45,rC*.42,rC*.28);ctx.fill();ctx.restore()}
function run(parts){parts.sort((a,b)=>a.d-b.d);for(const q of parts){ink(2.4);q.f()}}

// ------------------------------------------------------------------ shared zombie parts
const ZC={skin:'#88a06c',skinD:'#647c50',skinF:'#55693f',cloth:'#3a454e',clothD:'#262e35',clothF:'#252c33',pants:'#2f2a26',pantsF:'#1c1816',shoe:'#1f1b18',
  bone:'#e6dcc0',socket:'#141010',eye:'#e9ff7a',mouth:'#2a0c0c',gum:'#6a1a1a',nail:'#1e1a14',rot:'#3f5233'};
// an arm from its shoulder socket: IK elbow, seamless upper arm and forearm, a clawed hand, a torn sleeve over the root.
// o.full: the sleeve covers the whole arm (a coat); o.noHand: the caller draws the hand (a fist on a tool)
function zArm(V0,sh,hd,pole,o){const{P}=V0,[el,h]=ik(sh,hd,o.L1,o.L2,pole),a=P(sh),e=P(el),fd=o.fd||nrm(sub(h,el)),rk=cl(1-Math.abs(V0.F(0,o.side,0))*1.8,0,1),
  end=o.noHand?null:()=>hand(V0,h,fd,o.hand,o.skin,o.nail||ZC.nail,o.pd);
  if(o.full){const w3=lerp3(el,h,.78);if(end)end();limb([a,e,P(w3)],[o.w1,o.w2],o.cloth);if(rk>0){ctx.save();ctx.globalAlpha=rk;ctx.fillStyle=o.cloth;ball(a,o.w1*.5+1.3);ctx.fill();ctx.restore()}if(o.cuff)cuff(V0,w3,el,o.w2+1,o.cloth)}
  else{limb([a,e,P(h)],[o.w1,o.w2],o.skin,end);if(o.sleeve){const s3=lerp3(sh,el,o.sleeveK||.6);sleeve(a,P(s3),o.sleeve,o.cloth,rk);if(o.cuff)cuff(V0,s3,sh,o.sleeve,o.cloth)}}
  return{el,h}}
// a zombie head: hollow sockets with pinpoint lights, hanging jaw with broken teeth, a few hairs, a stitched crack on the back, a scar
function zHead(V0,Hc,R,ph,o){const{P,c}=V0,h=P(Hc),t=G.t,at=R*.95;o=o||{};
  ink(2.4);ball(h,R);ctx.fillStyle=o.skin||ZC.skin;ctx.fill();ctx.stroke();
  const lit=[];ctx.save();ball(h,R-1.1);ctx.clip();ctx.fillStyle=o.skinD||ZC.skinD;ell(h[0]+R*.3,h[1]+R*.74,R*1.15,R*.62);ctx.fill();
  if(!o.helmet)on(V0,Hc,at,[-.15,-.5,.85],-.3,q=>{ctx.fillStyle=ZC.rot;ell(q[0],q[1],R*.3,R*.19);ctx.fill()});
  on(V0,Hc,at,[-1,.1,.25],.05,q=>{ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(q[0]-3,q[1]-2);ctx.lineTo(q[0],q[1]);ctx.lineTo(q[0]+2.6,q[1]-2.4);for(let i=0;i<3;i++){const xx=q[0]-2.4+i*2.2;ctx.moveTo(xx-.8,q[1]-2.6+i*.4);ctx.lineTo(xx+.8,q[1]-.4+i*.4)}ctx.stroke()});
  if(!o.noScar)on(V0,Hc,at,[.15,1,-.1],.05,q=>{ctx.strokeStyle=INK;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(q[0]-2,q[1]-2);ctx.lineTo(q[0]+2,q[1]+2);ctx.moveTo(q[0]-1.4,q[1]+.6);ctx.lineTo(q[0]-.2,q[1]-.8);ctx.moveTo(q[0]+.4,q[1]+1.8);ctx.lineTo(q[0]+1.6,q[1]+.4);ctx.stroke()});
  for(const sd of[-1,1])on(V0,Hc,at,[.8,sd*.4,.16],0,(q,v)=>{const big=sd>0?1.15:.9;ink(1.5);ctx.fillStyle=ZC.socket;ctx.beginPath();ctx.ellipse(q[0],q[1],R*.3*big*Math.max(.45,v),R*.34*big,0,0,TAU);ctx.fill();ctx.stroke();
    if(!(o.deadEye&&sd<0))lit.push([q,big,cl(v*4,0,1)])});
  ctx.restore();
  for(const[q,big,k] of lit){shine('230,255,120',q[0],q[1],R*.55,(.5+.1*Math.sin(t*5+big))*k);ctx.fillStyle=ZC.eye;ball([q[0]+c*.3,q[1]+.2],R*.12*big*k);ctx.fill()}
  {const n=nrm([.8,0,-.5]),hv=n[0]*V0.s,q=P(add(Hc,mul(n,at))),v=Math.max(0,V0.F(n));if(hv>-.15){ctx.save();ctx.globalAlpha=cl((hv+.15)*4,0,1);const op=o.open||0,w=R*.52*Math.max(.38,v,Math.abs(V0.c)*.3),hh=R*.22+op*R*.3;ink(1.6);ctx.fillStyle=ZC.mouth;ctx.beginPath();ctx.ellipse(q[0],q[1]+hh*.35,w,hh,0,0,TAU);ctx.fill();ctx.stroke();
    ctx.fillStyle=ZC.gum;ctx.fillRect(q[0]-w*.8,q[1]-hh*.6,w*1.6,1);ctx.fillStyle=ZC.bone;ink(.8);
    for(let i=0;i<4;i++){const xx=q[0]-w*.75+i*w*.5;tri(xx,q[1]-hh*.5,xx,q[1]-hh*.5+(i===1?2.4:1.5),.8)}
    for(let i=0;i<3;i++){const xx=q[0]-w*.5+i*w*.5;tri(xx,q[1]+hh*1.1,xx,q[1]+hh*1.1-1.6,.7)}
    if(!o.noDrool){const dr=(ph/TAU*2+.3)%1;ctx.strokeStyle='rgba(190,220,140,.7)';ctx.lineWidth=1;ctx.globalAlpha*=.8*(1-dr);seg([q[0]+w*.4,q[1]+hh*1.2],[q[0]+w*.4,q[1]+hh*1.2+1+dr*3]);ctx.stroke()}ctx.restore()}}
  if(!o.helmet){ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.lineCap='round';for(let i=-1.5;i<=1.5;i++){const r=P(add(Hc,mul(nrm([-.25+Math.abs(i)*.1,i*.5,1]),R*.97))),k=i*1.3+Math.sin(ph+i)*.35;ctx.beginPath();ctx.moveTo(r[0],r[1]+1);ctx.quadraticCurveTo(r[0]+i*.8,r[1]-2.2,r[0]+k*1.5,r[1]-3.4+Math.abs(i)*.6);ctx.stroke()}}}

// ------------------------------------------------------------------ ZOMBIE DELLA CRIPTA
function zombie(x,y,face,anim,p,sc){sc=sc||1.1;const V0=V(face),{P,D,F}=V0,ph=p*TAU,walk=anim==='walk',atk=anim==='attack';
  // attack: .0-.35 rears back with both arms up, .35-.6 lunges and rakes down, .6-1 recovers
  let up=0,reach=0,lunge=0;
  if(atk){if(p<.35){up=ez(p/.35);lunge=-up*2}else if(p<.6){const k=ez((p-.35)/.25);up=1-k*1.3;reach=k;lunge=-2+k*7}else{const k=ez((p-.6)/.4);up=-.3*(1-k);reach=1-k;lunge=5*(1-k)}}
  // walk: a limp. The left leg drags with short low steps, the right one does the work; the body sinks when the feet are apart
  const st=stepper(p,.56),fL=walk?st(0,2.6,.5):NOSTEP,fR=walk?st(.5,4.2,2.2):NOSTEP,spread=walk?Math.abs(fL.x-fR.x)/6.8:0;
  const bob=walk?-spread*1.4:Math.sin(ph)*.35,roll=walk?.3-Math.sin(ph)*1.3:Math.sin(ph)*.5,L=lunge*.6,upP=Math.max(0,up);
  const Pv=[L,roll*.5,13.4+bob],Ch=[L+4.2-upP*3+reach*2,roll,21.4+bob+upP*1.2],
    Hc=add(Ch,[2.8-upP*1.2,roll*.25+Math.sin(ph*(walk?2:1)+.6)*1.1,12+(walk?Math.cos(ph*2)*.4:0)]);
  {const q=P(L*.7+2,0,0);shadow(x+q[0]*sc,y+q[1]*sc,11*sc,4.4*sc,.34)}
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const parts=[],dT=D(Ch);
  for(const[sd,f] of[[-1,fL],[1,fR]]){const hip=add(Pv,[0,sd*3.4,-3.3]),foot=[L*.4+1+f.x,sd*4.4,f.z],k=farK(F(0,sd,0));
    parts.push({d:dT-100+D(hip)*.01,f:()=>leg(V0,hip,foot,{L1:4.8,L2:4.8,w1:4.6,w2:4,col:mix(ZC.pants,ZC.pantsF,k),shoe:ZC.shoe,heel:1.3,toe:2.6,sr:2.2})})}
  parts.push({d:dT,f:()=>{trunk(V0,Pv,6.2,Ch,8.4,ZC.cloth,ZC.clothD,5);
    // a hole in the shirt over the ribs (front, left side); spine bumps and a tear on the back
    on(V0,Ch,8,[.82,-.55,-.1],.12,(q,v)=>{const w=Math.max(.4,v);ink(1.6);ctx.fillStyle=ZC.rot;ctx.beginPath();ctx.ellipse(q[0],q[1],4*w,3.3,0,0,TAU);ctx.fill();ctx.stroke();
      ctx.strokeStyle=ZC.bone;ctx.lineWidth=1.4;for(let i=0;i<2;i++){ctx.beginPath();ctx.moveTo(q[0]-3.2*w,q[1]-.6+i*2.2);ctx.quadraticCurveTo(q[0],q[1]-2.4+i*2.2,q[0]+3.2*w,q[1]-.6+i*2.2);ctx.stroke()}});
    for(let i=0;i<3;i++)on(V0,Ch,8.1,[-1,0,.55-i*.42],.35,q=>{ink(1.3);ctx.fillStyle=ZC.skinD;ball(q,1.5);ctx.fill();ctx.stroke()});
    on(V0,Pv,6.2,[-.5,.85,.35],.15,q=>{ctx.strokeStyle='rgba(20,16,14,.7)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(q[0]-1,q[1]-3);ctx.lineTo(q[0]+1.2,q[1]);ctx.lineTo(q[0]-.4,q[1]+2.6);ctx.stroke()})}});
  // arms reach forward; raised high and back over the head when it rears back (so they never cover the face), then they rake down
  for(const sd of[-1,1]){const sh=add(Ch,[0,sd*7,3]),sw=walk?Math.sin(ph+(sd>0?Math.PI:0))*1.1:Math.sin(ph+sd)*.4,
      hd=add(Ch,[10-upP*12+reach*5,sd*(10+upP*2-reach*2),-.5+up*15.5+sw]),k=farK(F(0,sd,0));
    parts.push({d:D(add(sh,[7,0,0])),f:()=>zArm(V0,sh,hd,nrm([-.3*upP,sd*.6,-1+1.5*upP]),{side:sd,L1:5.8,L2:5.8,w1:4.4,w2:3.9,hand:2.7,skin:mix(ZC.skin,ZC.skinF,k),cloth:mix(ZC.cloth,ZC.clothF,k),sleeve:5.4,sleeveK:.55})})}
  parts.push({d:D(Hc),f:()=>{neck(V0,add(Ch,[1.6,0,6.8]),3.8,add(Hc,[-.8,0,-5.6]),3.4,ZC.skin);zHead(V0,Hc,8.2,ph,{open:atk&&p>.25&&p<.7?1:.45+.2*Math.sin(ph*2)})}});
  run(parts);ctx.restore()}

// ------------------------------------------------------------------ ZOMBIE STRISCIANTE (crawler): only the upper half, drags itself on its long arms
function strisciante(x,y,face,anim,p,sc){sc=sc||1.1;const V0=V(face),{P,D,F}=V0,ph=p*TAU,walk=anim==='walk',atk=anim==='attack';
  // attack: .0-.35 rears up on its arms, .35-.65 lunges forward low with the jaw wide open, .65-1 slumps back
  let rear=0,lunge=0;if(atk){if(p<.35)rear=ez(p/.35);else if(p<.65){const k=ez((p-.35)/.3);rear=1-k;lunge=k*8}else lunge=8*(1-ez((p-.65)/.35))}
  // walk: one hand reaches out, plants and pulls while the other comes forward; the body surges on every pull
  const st=stepper(p,.5),hL=walk?st(0,3.4,2.6):NOSTEP,hR=walk?st(.5,3.4,2.6):NOSTEP,surge=walk?-Math.cos(ph*2)*.7:0,wig=walk?Math.sin(ph):Math.sin(ph)*.3;
  const B=lunge+surge,Ch=[B+1.5,wig*.5,6.8+rear*5],Wb=[B-7.5,-wig*.4,4.4+rear*1],Hc=add(Ch,[6,wig*.3,4.6+rear*1.2]);
  {const q=P(B-1,0,0);shadow(x+q[0]*sc,y+q[1]*sc,13*sc,4.6*sc,.36)}
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const parts=[],dT=D(lerp3(Wb,Ch,.6));
  // the spine and the rags trail on the floor behind the waist: always under the body
  parts.push({d:dT-100,f:()=>{ctx.fillStyle=ZC.clothD;ink(1.3);for(let i=0;i<3;i++){const r=P(add(Wb,[-2,(i-1)*3.2,-2.5])),e=P(B-12.5+i*1.4,(i-1)*5.2+Math.sin(ph+i)*.8,.4);spike(r,e,2.2)}
    for(let i=4;i>=0;i--){const k=i/4,q=P(add(Wb,[-3.5-k*8.5,Math.sin(ph+1+k*2)*1.6*k-wig*k,lerp(-1.6,-3.6,k)])),r=lerp(2.1,1.1,k);ink(1.3);ctx.fillStyle=ZC.bone;ctx.beginPath();ctx.ellipse(q[0],q[1],r*1.25,r,0,0,TAU);ctx.fill();ctx.stroke()}}});
  parts.push({d:dT,f:()=>{trunk(V0,Wb,5,Ch,7.2,ZC.cloth,ZC.clothD,0);
    // the torn back of the shirt shows the spine and the ribs
    const A=P(Wb),Bq=P(Ch),ax=Bq[0]-A[0],ay=Bq[1]-A[1],al=Math.hypot(ax,ay)||1,ux=ax/al,uy=ay/al;
    on(V0,lerp3(Wb,Ch,.45),6.2,[-.1,0,1],-.6,q=>{ink(1.3);ctx.fillStyle=ZC.rot;ctx.beginPath();ctx.ellipse(q[0],q[1],3,2,Math.atan2(uy,ux),0,TAU);ctx.fill();ctx.stroke();
      ctx.strokeStyle='rgba(230,220,192,.85)';ctx.lineWidth=1;for(let i=-.5;i<=.5;i++){const cx=q[0]+ux*i*1.6,cy=q[1]+uy*i*1.6;seg([cx+uy*1.5,cy-ux*1.5],[cx-uy*1.5,cy+ux*1.5]);ctx.stroke()}})}});
  // long arms: shoulders on the chest, hands planted on the floor ahead, elbows out to the sides
  for(const[sd,f] of[[-1,hL],[1,hR]]){const sh=add(Ch,[1.4,sd*6,1]),hd=[10.1+f.x*1.2+lunge*1.1,sd*8.8,f.z+(atk?lunge*.25:0)],k=farK(F(0,sd,0));
    parts.push({d:D(add(sh,[4,0,0])),f:()=>zArm(V0,sh,hd,nrm([-.5,sd,.25]),{side:sd,L1:7.4,L2:7.8,w1:4.2,w2:3.7,hand:2.8,fd:nrm([1,sd*.3,-.25]),pd:[0,0,-1],skin:mix(ZC.skin,ZC.skinF,k),cloth:mix(ZC.cloth,ZC.clothF,k),sleeve:5.6,sleeveK:.45})})}
  parts.push({d:D(Hc),f:()=>{neck(V0,add(Ch,[3,0,2.4]),3.4,add(Hc,[-2.6,0,-2.6]),3,ZC.skin);zHead(V0,Hc,6.8,ph,{open:atk&&p>.25&&p<.7?1:.55+.2*Math.sin(ph*2),noScar:true})}});
  run(parts);ctx.restore()}

// ------------------------------------------------------------------ ZOMBIE MINATORE: helmet with a lamp, overalls, rusty pickaxe
const MC={helm:'#d9a628',helmD:'#9a7418',over:'#3e5a7a',overD:'#2a3e56',overF:'#26374c',shirt:'#6a6458',shirtD:'#4e4a42',shirtF:'#3f3b35',boot:'#3a2a1a',
  wood:'#6b4a2a',woodD:'#4a321c',iron:'#8a9098',ironD:'#5a6068',button:'#c9a040'};
// overalls: denim from the waist down (a horizontal cut through the trunk), a bib on the chest, straps over the shoulders, coal dust
function overalls(V0,Pv,rP,Ch,rC){const{P,F}=V0,k=.45,W=lerp3(Pv,Ch,k),rw=lerp(rP,rC,k)+.3,q=P(W),a=P(Pv),b=P(Ch);
  ctx.save();hull(a,rP-.1,b,rC-.1);ctx.clip();
  ctx.fillStyle=MC.over;ctx.beginPath();ctx.ellipse(q[0],q[1],rw,rw*.55,0,0,Math.PI);ctx.lineTo(q[0]-rw-30,q[1]+40);ctx.lineTo(q[0]+rw+30,q[1]+40);ctx.closePath();ctx.fill();
  ctx.fillStyle=MC.overD;ell(a[0]+rP*.6,a[1]+rP*.6,rP*.9,rP*.7);ctx.fill();
  ctx.strokeStyle=INK;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(q[0],q[1],rw,rw*.55,0,0,Math.PI);ctx.stroke();
  // bib on the chest and the straps over the shoulders, all on the chest ball
  const S=d=>P(add(Ch,mul(nrm(d),rC))),fv=F(1,0,0);
  if(fv>-.1){ctx.save();ctx.globalAlpha=cl((fv+.1)*4,0,1);const cs=[[1,-.36,.32],[1,.36,.32],[1,.46,-.62],[1,-.46,-.62]].map(S);ink(1.5);ctx.fillStyle=MC.over;ctx.beginPath();cs.forEach(c=>ctx.lineTo(c[0],c[1]));ctx.closePath();ctx.fill();ctx.stroke();
    const pk=[[1,-.18,.05],[1,.18,.05],[1,.2,-.22],[1,-.2,-.22]].map(S);ctx.lineWidth=1;ctx.beginPath();pk.forEach(c=>ctx.lineTo(c[0],c[1]));ctx.closePath();ctx.stroke();ctx.restore()}
  const strap=[[1,.34,.36],[.45,.5,1],[-.45,.48,1],[-1,.34,.3],[-1,.36,-.55]];
  for(const pass of[0,1])for(const sd of[-1,1])for(let i=0;i<strap.length-1;i++){const d1=[strap[i][0],strap[i][1]*sd,strap[i][2]],d2=[strap[i+1][0],strap[i+1][1]*sd,strap[i+1][2]];if(F(d1)<-.02||F(d2)<-.02)continue;
    seg(S(d1),S(d2));ctx.lineCap='round';ctx.strokeStyle=pass?MC.over:INK;ctx.lineWidth=pass?2.4:4.6;ctx.stroke()}
  for(const sd of[-1,1])on(V0,Ch,rC,[1,sd*.36,.32],0,q=>{ink(1);ctx.fillStyle=MC.button;ball(q,1);ctx.fill();ctx.stroke()});
  ctx.fillStyle='rgba(20,18,16,.35)';for(const d of[[1,.5,-.3],[.6,-.8,.2],[.9,-.2,.6],[-.7,.6,-.2]])on(V0,Pv,rP*.95,d,.1,q=>{ball(q,1.2);ctx.fill()});
  ctx.restore()}
// the pickaxe: handle and a curved iron head, from a pose made by pose()
function pickaxe(V0,k){const{P}=V0,h0=P(add(k.hd,mul(k.dir,-4.5))),h1=P(k.top);
  ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=5.2;seg(h0,h1);ctx.stroke();ctx.strokeStyle=MC.wood;ctx.lineWidth=2.6;ctx.stroke();
  const A=P(k.tA),B=P(k.tB),T=P(add(k.top,mul(k.dir,-1))),M=P(add(k.top,mul(k.dir,5.6)));
  ctx.strokeStyle=INK;ctx.lineWidth=1.8;ctx.lineJoin='round';ctx.fillStyle=MC.iron;ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.quadraticCurveTo(M[0],M[1],B[0],B[1]);ctx.quadraticCurveTo(T[0],T[1],A[0],A[1]);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle=MC.ironD;ball(P(add(k.top,mul(k.dir,1))),1.7);ctx.fill();ctx.stroke();ctx.fillStyle='rgba(120,60,30,.6)';ball(P(add(add(k.top,mul(k.u,3.4)),mul(k.dir,1.6))),1);ctx.fill()}
// the miner's helmet: brim, dome with a ridge, and the lamp on the front (lit only where it faces us)
function helmet(V0,Hc,R,t){const{P,F}=V0,C0=add(Hc,[-.5,0,R*.5]),hb=P(C0),bw=R+1.2,rd=R*.92;ink(2);ctx.fillStyle=MC.helmD;ell(hb[0],hb[1],bw,bw*.55);ctx.fill();ctx.stroke();
  ctx.fillStyle=MC.helm;ctx.beginPath();ctx.arc(hb[0],hb[1],rd,Math.PI,0);ctx.ellipse(hb[0],hb[1],rd,rd*.55,0,0,Math.PI);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.save();ctx.clip();ctx.fillStyle=MC.helmD;ell(hb[0]+rd*.55,hb[1]+rd*.2,rd*.6,rd*.9);ctx.fill();ctx.fillStyle='rgba(255,255,255,.3)';ell(hb[0]-rd*.4,hb[1]-rd*.55,rd*.3,rd*.15);ctx.fill();
  ctx.strokeStyle=MC.helmD;ctx.lineWidth=1.6;ctx.beginPath();let first=true;for(let i=0;i<=12;i++){const th=.25+i*(Math.PI-.5)/12,d=[Math.cos(th),0,Math.sin(th)];if(F(d)<0){first=true;continue}const q=P(add(C0,mul(d,rd*.98)));if(first){ctx.moveTo(q[0],q[1]);first=false}else ctx.lineTo(q[0],q[1])}ctx.stroke();ctx.restore();
  on(V0,C0,rd*.92,[1,0,.5],-.35,(q,v)=>{shine('255,230,150',q[0],q[1],8,.7*cl(v+.35,0,1));ink(1.3);ctx.fillStyle='#5a5f68';ball(q,2.6);ctx.fill();ctx.stroke();ctx.fillStyle='#fff6c8';ball(q,1.6*Math.max(.3,v));ctx.fill()})}
function minatore(x,y,face,anim,p,sc){sc=sc||1.1;const V0=V(face),{P,D,F}=V0,ph=p*TAU,walk=anim==='walk',atk=anim==='attack',t=G.t;
  // the pick turns round the shoulder: a=0 points forward, π/2 straight up, more than π/2 behind the head.
  // attack: .0-.18 crouches and pulls the pick back, .18-.42 lifts it high over the head (with a small overshoot),
  // .42-.5 smashes it down, .5-.68 stuck in the ground with a jolt, .68-.84 tugs at it, .84-1 pulls it out
  let a=-.75+(walk?Math.sin(ph+.6)*.2:Math.sin(ph)*.05),crouch=0,lunge=0,jolt=0,hit=-1;
  if(atk){if(p<.18){const k=ez(p/.18);a=-.75-k*.4;crouch=k*1.6}
    else if(p<.42){const k=(p-.18)/.24,o=1+2.2*Math.pow(k-1,3)+1.2*Math.pow(k-1,2);a=-1.15+o*3.45;crouch=1.6*(1-k)}
    else if(p<.5){const k=(p-.42)/.08;a=2.3-k*3.3;lunge=k*3}
    else if(p<.68){const k=(p-.5)/.18;a=-1;lunge=3;jolt=1-k;hit=k}
    else if(p<.84){const k=(p-.68)/.16;a=-1+Math.sin(k*Math.PI*3)*.1;lunge=3-k*1.5}
    else{const k=ez((p-.84)/.16);a=-1+k*.25;lunge=1.5*(1-k)}}
  // walk: a stiff lurch, the head lags behind each step, the pick swings low in the hand
  const st=stepper(p,.56),fL=walk?st(0,4,1.8):NOSTEP,fR=walk?st(.5,4,1.8):NOSTEP,spread=walk?Math.abs(fL.x-fR.x)/8:0;
  const bob=(walk?-spread*1.3:Math.sin(ph)*.3)-crouch-jolt*.8,roll=walk?-Math.sin(ph)*1.4:Math.sin(ph)*.4,L=lunge*.6,jx=jolt*Math.sin(p*400)*.5;
  const Pv=[L+jx,roll*.4,12.4+bob],Ch=[L+2.6+lunge*.3+jx,roll,20.2+bob],Hc=add(Ch,[2.8,roll*.3+(walk?Math.sin(ph-1)*.8:Math.sin(ph)*.5),11-crouch*.3]);
  // where the hand, the handle and the iron head are for a pick angle; the pick is never pushed through the floor
  const pose=a=>{const hd=add(Ch,[2.6+Math.cos(a)*6.8,10.6,1+Math.sin(a)*8.8]),dir=nrm([Math.cos(a)*.95,.14,Math.sin(a)]),top=add(hd,mul(dir,15)),u=nrm([-dir[2]*.75,.66,dir[0]*.75]);
    return{a,hd,dir,top,u,tA:add(add(top,mul(u,7.2)),mul(dir,2.2)),tB:add(add(top,mul(u,-7.2)),mul(dir,2.2))}},low=q=>Math.min(q.tA[2],q.tB[2],q.top[2]-1);
  let pk=pose(a);if(low(pk)<.3){let lo=a,hi=Math.PI/2;for(let i=0;i<20;i++){const m=(lo+hi)/2;if(low(pose(m))<.3)lo=m;else hi=m}pk=pose(hi)}
  {const q=P(L+1,0,0);shadow(x+q[0]*sc,y+q[1]*sc,11*sc,4.4*sc,.34)}
  // the lamp lights a small spot on the floor ahead
  if(!LOWFX){const q=P(Ch[0]+14,Ch[1],0);ctx.save();ctx.globalCompositeOperation='lighter';glow('255,230,150',x+q[0]*sc,y+q[1]*sc,10*sc,.2+.04*Math.sin(t*9),5*sc);ctx.restore()}
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const parts=[],dT=D(Ch);
  for(const[sd,f] of[[-1,fL],[1,fR]]){const hip=add(Pv,[0,sd*3.4,-3.3]),foot=[L*.4+1+f.x,sd*4.3,f.z],k=farK(F(0,sd,0));
    parts.push({d:dT-100+D(hip)*.01,f:()=>leg(V0,hip,foot,{L1:4.4,L2:4.6,w1:4.8,w2:4.2,col:mix(MC.over,MC.overF,k),shoe:MC.boot,heel:1.4,toe:2.6,sr:2.4})})}
  parts.push({d:dT,f:()=>{trunk(V0,Pv,6.3,Ch,8.2,MC.shirt,MC.shirtD,0);overalls(V0,Pv,6.3,Ch,8.2)}});
  // left arm hangs and swings
  {const sh=add(Ch,[0,-7.6,1.4]),sw=walk?Math.sin(ph)*2.4:Math.sin(ph)*.3,hd=add(sh,[2.5+sw,-1.6,-11.6+crouch*.5]),k=farK(F(0,-1,0));
    parts.push({d:D(add(sh,[2,0,0])),f:()=>zArm(V0,sh,hd,[-1,0,-.1],{side:-1,L1:6,L2:6.2,w1:4.4,w2:3.9,hand:2.6,pd:[.5,1,0],skin:mix(ZC.skin,ZC.skinF,k),cloth:mix(MC.shirt,MC.shirtF,k),sleeve:5.8,sleeveK:.55})})}
  // right arm holds the pick; arm and pick swing in a plane beside the head
  {const sh=add(Ch,[0,7.6,1.4]),k=farK(F(0,1,0)),skin=mix(ZC.skin,ZC.skinF,k);
    parts.push({d:D(add(Ch,[2,9.6,1.4])),f:()=>{const tool=()=>pickaxe(V0,pk),arm=()=>zArm(V0,sh,pk.hd,nrm([-.4,.5,-1]),{side:1,L1:6,L2:6.2,w1:4.4,w2:3.9,noHand:true,skin,cloth:mix(MC.shirt,MC.shirtF,k),sleeve:5.8,sleeveK:.55});
      if(F(0,1,0)>0){arm();tool()}else{tool();arm()}fist(V0,pk.hd,2.9,skin)}})}
  parts.push({d:D(Hc),f:()=>{neck(V0,add(Ch,[1.6,0,6.6]),3.8,add(Hc,[-.8,0,-5.4]),3.4,ZC.skin);zHead(V0,Hc,8,ph,{open:atk&&p>.35&&p<.6?1:.35,helmet:true,deadEye:true,noDrool:true});helmet(V0,Hc,8,t)}});
  run(parts);ctx.restore();
  // the pick bites the floor: sparks and chips of stone where the point went in
  if(hit>=0&&hit<1){const tp=pk.tA[2]<pk.tB[2]?pk.tA:pk.tB,q=P(tp[0],tp[1],0),ix=x+q[0]*sc,iy=y+q[1]*sc,k=hit;ctx.save();
    for(let i=0;i<7;i++){const an=-Math.PI*.15-i*.45,r=(4+k*16)*sc;ctx.strokeStyle=`rgba(255,${200+i*8},120,${1-k})`;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(ix+Math.cos(an)*r*.6,iy+Math.sin(an)*r*.6);ctx.lineTo(ix+Math.cos(an)*r,iy+Math.sin(an)*r);ctx.stroke()}
    ctx.fillStyle=`rgba(90,80,70,${1-k})`;for(let i=0;i<4;i++){ball([ix+(i-1.5)*5*sc*k,iy-Math.sin(k*Math.PI)*8*sc+i],1.4*sc);ctx.fill()}ctx.restore()}}

// ------------------------------------------------------------------ SEGUGIO INFERNALE
const HC={fur:'#2b1f24',furD:'#1c1418',furF:'#150e11',hi:'#3d2c33',spike:'#9a2222',ember:'#ff7a2a',eye:'#ff3b2f',horn:'#c4b391',bone:'#e6dcc0',maw:'#4a0a0e',rib:'#5a4046'};
function flame(e,t,s){s=s||1;shine('255,120,40',e[0],e[1]-2*s,8*s,.55+.12*Math.sin(t*14));ink(1.2);ctx.fillStyle=HC.ember;ctx.beginPath();ctx.moveTo(e[0]-2.4*s,e[1]+1);ctx.quadraticCurveTo(e[0]-1.8*s,e[1]-3.6*s,e[0]+Math.sin(t*12)*1.2*s,e[1]-6.4*s);ctx.quadraticCurveTo(e[0]+2*s,e[1]-3.4*s,e[0]+2.4*s,e[1]+1);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#ffe28a';ball([e[0],e[1]-1.3*s],s);ctx.fill()}
function crack(q,t){const gl=.65+.35*Math.sin(t*4);ctx.strokeStyle=`rgba(255,${130+60*gl|0},50,${.7*gl+.3})`;ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(q[0]-1.6,q[1]-2.6);ctx.lineTo(q[0]+.6,q[1]-.4);ctx.lineTo(q[0]-.8,q[1]+2.2);ctx.stroke();shine('255,110,40',q[0],q[1],5,.2*gl)}
// head: skull, snout with fangs, eyes, ears and horns, each piece put in front of or behind the skull by where it faces
function houndHead(V0,Hc,jaw,ph){const{P,F,c}=V0,t=G.t,h=P(Hc),R=5.6,items=[];
  const skull=()=>{ink(2.4);ball(h,R);ctx.fillStyle=HC.fur;ctx.fill();ctx.stroke();ctx.save();ball(h,R-1);ctx.clip();ctx.fillStyle=HC.hi;ell(h[0]-1.6,h[1]-2.2,3,1.7);ctx.fill();ctx.restore();
    for(const sd of[-1,1])on(V0,Hc,R*.92,[.62,sd*.5,.5],0,(q,v)=>{shine('255,60,40',q[0],q[1],4.6,.55+.1*Math.sin(t*5));ctx.fillStyle=HC.eye;ctx.beginPath();ctx.ellipse(q[0],q[1],1.9*Math.max(.5,v),1.05,sd*.35*c,0,TAU);ctx.fill();ctx.fillStyle='#ffe28a';ball(q,.55);ctx.fill()})};
  const u0=add(Hc,[2.8,0,-1.6]),u1=add(Hc,[8.4,0,-2.6]),l0=add(Hc,[2.4,0,-3.2]),l1=add(Hc,[7.6,0,-3.8-jaw*3]),show=F(1,0,-.2)>-.25;
  const snout=()=>{const A=P(u0),B=P(u1),Cq=P(l0),E=P(l1);
    if(jaw>.25&&show){ctx.fillStyle=HC.maw;ctx.beginPath();for(const q of[A,B,E,Cq])ctx.lineTo(q[0],q[1]);ctx.closePath();ctx.fill()}
    ink(2.2);hull(Cq,2.2,E,1.5);ctx.fillStyle=HC.furD;ctx.fill();ctx.stroke();
    if(show){ctx.fillStyle=HC.bone;ink(.8);for(const sd of[-1,1])for(let i=0;i<3;i++){const b=lerp3(add(l0,[.4,sd*1.2,1.3]),add(l1,[0,sd*.7,1]),.3+i*.3),q=P(b),e=P(add(b,[0,0,1.4+jaw*.6]));tri(q[0],q[1],e[0],e[1],.7)}}
    ink(2.2);hull(A,2.7,B,1.9);ctx.fillStyle=HC.fur;ctx.fill();ctx.stroke();
    if(show){ctx.fillStyle=HC.bone;ink(.8);for(const sd of[-1,1])for(let i=0;i<4;i++){const b=lerp3(add(u0,[.6,sd*1.7,-1.8]),add(u1,[0,sd*1,-1.3]),i/3),q=P(b),e=P(add(b,[0,0,-(i===2?2.8:1.5)-jaw*.6]));tri(q[0],q[1],e[0],e[1],.8)}}
    ctx.fillStyle=INK;ball(P(add(u1,[.8,0,.9])),1.1);ctx.fill();
    if(jaw>.3&&show){const dr=(ph/TAU*2)%1,q=P(add(l1,[0,0,-.8]));ctx.strokeStyle='rgba(255,170,120,.6)';ctx.lineWidth=.9;seg(q,[q[0],q[1]+2+dr*4]);ctx.stroke()}};
  const ear=sd=>{const b1=P(add(Hc,mul(nrm([-.3,sd*.55,.75]),R*.9))),b2=P(add(Hc,mul(nrm([-.7,sd*.35,.65]),R*.9))),tp=P(add(Hc,[-3.4,sd*4.2,7]));ink(1.6);ctx.fillStyle=HC.furD;ctx.beginPath();ctx.moveTo(b1[0],b1[1]);ctx.lineTo(tp[0],tp[1]);ctx.lineTo(b2[0],b2[1]);ctx.fill();ctx.stroke()};
  const horn=sd=>{limb([add(Hc,mul(nrm([-.2,sd*.6,.8]),R*.85)),add(Hc,[-2.8,sd*4.3,6.4]),add(Hc,[-5.4,sd*4.7,6]),add(Hc,[-7.2,sd*4.3,4.4])].map(q=>P(q)),[2.2,1.5,.8],HC.horn)};
  items.push({d:0,f:skull},{d:F(1,0,-.3)*6,f:snout});
  for(const sd of[-1,1])items.push({d:F(-.4,sd*.75,.5)*6,f:()=>ear(sd)},{d:F(-.5,sd*.85,.4)*6+.01,f:()=>horn(sd)});
  items.sort((a,b)=>a.d-b.d);for(const i of items)i.f()}
function hound(x,y,face,anim,p,sc){sc=sc||1.05;const V0=V(face),{P,D,F}=V0,ph=p*TAU,gal=anim==='walk',atk=anim==='attack',idle=anim==='idle',t=G.t;
  // pounce: .0-.28 crouches and wiggles, .28-.36 launches nose up, .36-.66 flies (jaws wide, then snap), .66-.8 lands, .8-1 recovers
  let lift=0,crouch=0,str=0,pitch=0,wig=0,fwd=0,air=0,jaw=gal?.35+.15*Math.sin(ph*2):.2+(idle?Math.max(0,Math.sin(ph*2))*.3:0);
  if(atk){if(p<.28){const k=ez(p/.28);crouch=k;wig=Math.sin(k*Math.PI*5)*k;jaw=.45}
    else if(p<.36){const k=(p-.28)/.08;crouch=1-k;str=k;pitch=k*.4;jaw=.8;fwd=k}
    else if(p<.66){const k=(p-.36)/.3;lift=Math.sin(k*Math.PI)*13;str=1-k*.5;pitch=.4-k*.8;jaw=k<.55?1:Math.max(0,1-(k-.55)*6);fwd=1+k*2;air=Math.sin(k*Math.PI)}
    else if(p<.8){const k=(p-.66)/.14;crouch=Math.sin(k*Math.PI)*.8;pitch=-.4*(1-k);jaw=0;fwd=3}
    else{const k=ez((p-.8)/.2);fwd=3*(1-k);jaw=.2*k}}
  // gallop: hind pair then front pair; the back flexes (gather / stretch) and the body rocks
  const gp=stepper(p,.5),flex=gal?Math.cos(ph)*1.6:0,bounce=gal?Math.abs(Math.sin(ph))*1.3:Math.sin(ph)*.35,yw=wig*1.2;pitch+=gal?Math.sin(ph)*.12:0;
  const pz=x0=>x0*pitch*.5;
  const R=[-8-flex*.5-str*1.5+fwd,yw*.4,13.4+lift+bounce-crouch*2.6+pz(-8)],C=[5+flex*.5+str*1.5+fwd,yw,14.4+lift+bounce-crouch*2.2+pz(5)];
  const Hc=[C[0]+7+str*1.5,yw*1.3,C[2]+7.6+pz(7)-crouch*2.4];
  {const q=P(fwd-1.5,0,0),k=1-lift/40;shadow(x+q[0]*sc,y+q[1]*sc,15*sc*k,5.4*sc*k,.36)}
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const parts=[],dB=D(lerp3(R,C,.5));
  // legs: [side, front?, gallop phase]; always under the body, the far ones darker
  for(const[sd,fr,ps] of[[-1,0,0],[1,0,.1],[-1,1,.5],[1,1,.6]]){const f=gal?gp(ps,4.6,3):NOSTEP,k=farK(F(0,sd,0)),col=mix(HC.fur,HC.furF,k),
      base=fr?add(C,[1,sd*4.1,-4.2]):add(R,[-.5,sd*3.8,-3]),
      paw=fr?[6.5+fwd+f.x+air*4.5,sd*4.4,f.z+lift*.92+air*2]:[-9+fwd+f.x-air*4.5,sd*4.2,f.z+lift*.92+air*1.2],
      joint=fr?add(paw,[.6,0,2.2]):add(paw,[-1.6,0,3.4]),[kn,j2]=ik(base,joint,fr?4.6:4.4,fr?4.4:3.8,fr?[-1,0,-.1]:[1,0,.1]),pw=add(j2,sub(paw,joint));
    parts.push({d:dB-100+D(base)*.01,f:()=>limb([P(base),P(kn),P(j2),P(pw)],fr?[3.8,2.8,2.2]:[4.6,3,2.2],col,()=>{const q=P(pw);ink(1.4);ctx.fillStyle=HC.furD;ctx.beginPath();ctx.ellipse(q[0],q[1],2.3,1.5,0,0,TAU);ctx.fill();ctx.stroke();
      ctx.strokeStyle=HC.bone;ctx.lineWidth=1;for(let i=-1;i<=1;i++){seg(P(add(pw,[1.2,i*.8,-.2])),P(add(pw,[2.6,i*1.1,-.8])));ctx.stroke()}})})}
  // tail: bony with spikes, ending in a flame; in front of the body only when it points at the camera
  {const w=gal?Math.sin(ph-1.2)*2.4:Math.sin(ph)*2+wig*3,r0=add(R,[-4.6,0,2.2]),r1=add(R,[-8.6,w*.45,2.2]),r2=add(R,[-11.4,w,.2]);
    parts.push({d:dB+(F(-1,0,.3)>.3?50:-50),f:()=>{limb([P(r0),P(r1),P(r2)],[2.8,2],HC.fur);
      for(let i=1;i<3;i++){const b=lerp3(r0,r1,i/2.5),q=P(b),e=P(add(b,[-.6,0,2]));ctx.fillStyle=HC.spike;ink(1);spike(q,e,1)}flame(P(r2),t,.8)}})}
  // body: rump + ribcage, ribs on the flank that faces us, glowing cracks, spikes along the spine, smoke
  parts.push({d:dB,f:()=>{const a=P(R),b=P(C);ink(2.4);hull(a,6,b,7.2);ctx.fillStyle=HC.fur;ctx.fill();ctx.stroke();
    ctx.save();hull(a,4.9,b,6.1);ctx.clip();ctx.fillStyle=HC.furD;ell(a[0]+3,a[1]+4,7,4.6);ctx.fill();ell(b[0]+3.4,b[1]+4.4,7.6,4.8);ctx.fill();ctx.fillStyle=HC.hi;ell(b[0]-2.4,b[1]-3.6,4,2);ctx.fill();ell(a[0]-2,a[1]-3.4,3.2,1.6);ctx.fill();
    const rx=a[0]-b[0],ry=a[1]-b[1],rl=Math.hypot(rx,ry)||1;
    for(const sd of[-1,1])for(let i=0;i<4;i++)on(V0,C,6.9,[-.1-i*.24,sd,-.05],.12,q=>{ctx.strokeStyle=HC.rib;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(q[0],q[1]-4);ctx.quadraticCurveTo(q[0]+rx/rl*2.2,q[1],q[0],q[1]+3.8);ctx.stroke()});
    for(const sd of[-1,1]){on(V0,C,6.9,[.3,sd*.8,.4],.1,q=>crack(q,t));on(V0,R,5.9,[-.2,sd*.85,.35],.1,q=>crack(q,t))}
    ctx.restore();
    for(let i=0;i<6;i++){const u=i/5,q3=add(lerp3(R,C,u),[0,0,lerp(5.2,6.4,u)]),tp=add(q3,[-1.2,0,2.8+(i%2)*1.2+(i===5?.6:0)]);ctx.fillStyle=HC.spike;ink(1.3);spike(P(q3),P(tp),1.7)}
    if(!LOWFX)for(let i=0;i<3;i++){const k=(p*(gal?2:1)+i/3)%1,sp=P(add(lerp3(R,C,i/2),[0,0,9]));ctx.fillStyle=`rgba(60,50,55,${.35*(1-k)})`;ball([sp[0]+Math.sin(ph+i*2)*2,sp[1]-k*12],1.6+k*3);ctx.fill()}}});
  // neck (with hackles) and head, drawn together: behind the body when the head is turned away
  parts.push({d:D(Hc),f:()=>{const n0=add(C,[3.2,0,3.4]),n1=add(Hc,[-2.2,0,-1.8]),A=P(n0);ink(2.4);hull(A,4.4,P(n1),3.6);ctx.fillStyle=HC.fur;ctx.fill();ctx.stroke();ball(A,5.7);ctx.fill();
    for(let i=0;i<2;i++){const q3=add(lerp3(n0,n1,.3+i*.35),[0,0,3.4]),tp=add(q3,[-1.6,0,3.8]);ctx.fillStyle=HC.spike;ink(1.3);spike(P(q3),P(tp),1.8)}
    houndHead(V0,Hc,jaw,ph)}});
  run(parts);ctx.restore()}

// ------------------------------------------------------------------ BOSS: IL BECCHINO
const BC={skin:'#7d9a62',skinD:'#5d7848',skinF:'#4e6639',coat:'#2e2638',coatD:'#1e1826',coatF:'#211b2a',coatL:'#463a56',hat:'#1f1a24',band:'#6a1e28',
  metal:'#8a96a2',metalD:'#5f6a76',wood:'#6b4a2a',woodD:'#4a321c',bone:'#e6dcc0',hole:'#0e140c',glow:'150,255,110',chain:'#7a7f86',boot:'#1b1714',patch:'#6b5a3a'};
// the gravedigger's shovel: wooden handle with a T grip, an iron blade whose face shades as it turns
function shovel(V0,k){const{P,F}=V0,g=add(k.hd,mul(k.dir,-6)),gg=P(g),b0=P(k.b0);
  ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=5.8;seg(gg,b0);ctx.stroke();ctx.strokeStyle=BC.wood;ctx.lineWidth=3.2;ctx.stroke();
  const t1=P(add(g,mul(k.w3,2.8))),t2=P(add(g,mul(k.w3,-2.8)));ctx.strokeStyle=INK;ctx.lineWidth=5.2;seg(t1,t2);ctx.stroke();ctx.strokeStyle=BC.woodD;ctx.lineWidth=2.6;ctx.stroke();
  const n=cross(k.dir,k.w3),col=mix(BC.metal,BC.metalD,cl(.5-F(n)*.9,0,1)),c=[add(k.b0,mul(k.w3,2.8)),add(k.b1,mul(k.w3,4.2)),add(k.b1,mul(k.dir,4.8)),add(k.b1,mul(k.w3,-4.2)),add(k.b0,mul(k.w3,-2.8))].map(q=>P(q));
  ink(2);ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(c[0][0],c[0][1]);ctx.lineTo(c[1][0],c[1][1]);ctx.quadraticCurveTo(c[2][0],c[2][1],c[3][0],c[3][1]);ctx.lineTo(c[4][0],c[4][1]);ctx.closePath();ctx.fill();ctx.stroke();
  const fv=cl(Math.abs(F(n))*3,0,1);if(fv>0){ctx.save();ctx.globalAlpha=fv;ctx.fillStyle='rgba(110,40,30,.6)';ball(P(add(add(k.b1,mul(k.w3,1.6)),mul(k.dir,-1.5))),1.6);ctx.fill();ball(P(add(add(k.b1,mul(k.w3,-1.8)),mul(k.dir,-4))),1.1);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.28)';ball(P(add(add(k.b0,mul(k.w3,1.2)),mul(k.dir,2.4))),1.2);ctx.fill();ctx.restore()}
  ink(1.6);ctx.fillStyle=BC.metalD;ball(b0,2.2);ctx.fill();ctx.stroke()}
// chains: hanging across the top of the chest at the front (above the open belly), crossing the back diagonally
function chain(V0,Pv,rP,Ch,rC){const{P,F}=V0;ctx.lineWidth=1.2;ctx.strokeStyle=INK;
  for(let i=0;i<=20;i++){const u=i/20,front=u<=.5,w=front?u*2:(u-.5)*2,m=front?0:.85-w*.85,C=lerp3(Ch,Pv,m),r=lerp(rC,rP,m),
    d=front?nrm([.8,lerp(-.8,.8,w),.5-Math.sin(w*Math.PI)*.22]):nrm([-.85,lerp(.8,-.85,w),.15]),v=F(d);if(v<.05)continue;const q=P(add(C,mul(d,r*1.01)));
    ctx.save();ctx.globalAlpha=cl((v-.05)*4,0,1);ctx.fillStyle=BC.chain;ctx.beginPath();ctx.ellipse(q[0],q[1],1.9,1.2,.6,0,TAU);ctx.fill();ctx.stroke();ctx.restore()}}
// head: small for that body, one huge glowing eye, mouth stitched wide with jagged teeth, battered top hat tilted toward his left
function bHead(V0,Hc,R,ph,op){const{P,c}=V0,h=P(Hc),t=G.t,at=R*.95;ink(2.4);ball(h,R);ctx.fillStyle=BC.skin;ctx.fill();ctx.stroke();
  const lit=[];ctx.save();ball(h,R-1.1);ctx.clip();ctx.fillStyle=BC.skinD;ell(h[0]+R*.3,h[1]+R*.74,R*1.15,R*.6);ctx.fill();
  for(const sd of[-1,1])on(V0,Hc,at,[.8,sd*.42,.12],0,(q,v)=>{const big=sd>0?1.35:.85;ink(1.4);ctx.fillStyle='#0c120a';ctx.beginPath();ctx.ellipse(q[0],q[1],R*.3*big*Math.max(.45,v),R*.32*big,0,0,TAU);ctx.fill();ctx.stroke();lit.push([q,big,cl(v*4,0,1)])});
  ctx.restore();
  for(const[q,big,k] of lit){shine(BC.glow,q[0],q[1],6*big,(.55+.15*Math.sin(t*4))*k);ctx.fillStyle='#d6ff9a';ball([q[0]+c*.3,q[1]],1.1*big*k);ctx.fill()}
  on(V0,Hc,at,[.8,0,-.45],.04,(q,v)=>{const w=R*.62*Math.max(.35,v),hh=1.4+op*2.6;ink(1.5);ctx.fillStyle='#200808';ctx.beginPath();ctx.ellipse(q[0],q[1]+hh*.3,w,hh,0,0,TAU);ctx.fill();ctx.stroke();
    ctx.fillStyle=BC.bone;ink(.8);for(let i=0;i<5;i++){const xx=q[0]-w*.8+i*w*.4;tri(xx,q[1]-hh*.6,xx,q[1]-hh*.6+(i%2?2.2:1.4),.8)}
    ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.beginPath();for(let i=0;i<4;i++){const xx=q[0]-w*.7+i*w*.47;ctx.moveTo(xx,q[1]-hh-1.2);ctx.lineTo(xx+.4,q[1]+hh*1.2+1)}ctx.stroke()});
  const ax=P(nrm([.08,-.2,1])),tilt=Math.atan2(ax[0],-ax[1]),hb=P(add(Hc,[-.4,0,R-2.2]));
  ctx.save();ctx.translate(hb[0],hb[1]);ctx.rotate(tilt);ink(2.2);ctx.fillStyle=BC.hat;ell(0,0,10.5,3.1);ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.moveTo(-6.4,-.6);ctx.lineTo(-5.6,-12);ctx.lineTo(1,-13.4);ctx.lineTo(6,-11.4);ctx.lineTo(6.4,-.6);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle=BC.band;ctx.beginPath();ctx.moveTo(-6.2,-4.4);ctx.lineTo(6.3,-4.4);ctx.lineTo(6.3,-1.6);ctx.lineTo(-6.3,-1.6);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.strokeStyle=INK;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(2,-13);ctx.lineTo(3.4,-9.6);ctx.lineTo(1.6,-7.4);ctx.stroke();ctx.fillStyle='rgba(255,255,255,.1)';ctx.fillRect(-4.6,-11,2,6);ctx.restore()}
function becchino(x,y,face,anim,p,sc){sc=sc||2;const V0=V(face),{P,D,F}=V0,ph=p*TAU,walk=anim==='walk',slam=anim==='slam',sum=anim==='summon',t=G.t;
  // slam: .0-.45 lifts the shovel high over his shoulder and behind his head, .45-.6 smashes it flat on the ground, .6-1 lifts it a little and lets it rest
  let a=-.55+(walk?Math.sin(ph)*.1:Math.sin(ph)*.03),rise=0,squash=0,shake=0,hitK=-1;
  if(slam){if(p<.45){const k=ez(p/.45);a=-.55+k*3.05;rise=k*2}else if(p<.6){const k=(p-.45)/.15;a=2.5-k*4;squash=Math.sin(k*Math.PI)*.08}else{const k=ez((p-.6)/.4);a=lerp(-1.5,-.55,k)+Math.sin(k*Math.PI)*.5;shake=1-k;hitK=(p-.6)/.4}}
  const armUp=sum?(p<.25?ez(p/.25):p<.8?1:1-ez((p-.8)/.2)):0;
  const stp=stepper(p,.58),fL=walk?stp(0,3.4,2.4):NOSTEP,fR=walk?stp(.5,3.4,2.4):NOSTEP,spread=walk?Math.abs(fL.x-fR.x)/6.8:0;
  const bob=walk?-spread*1.8:Math.sin(ph)*.6,sway=walk?-Math.sin(ph)*1.3:0,jit=shake*Math.sin(p*260)*.7;
  const Pv=[jit,sway*.5,15.4+bob+rise*.4],Ch=[2.2+jit-rise*.6,sway,26.6+bob+rise],Hc=add(Ch,[3.4-rise*.4,sway*.5,15.4]);
  // hand, handle and blade for a shovel angle; the blade is never pushed through the floor
  const pose=a=>{const hd=add(Ch,[5.4+Math.cos(a)*6.5,13.6,-5+Math.sin(a)*10]),dir=nrm([Math.cos(a)*.9,.16,Math.sin(a)]),w3=nrm([-dir[2]*.75,.66,dir[0]*.75]);
    return{a,hd,dir,w3,b0:add(hd,mul(dir,15)),b1:add(hd,mul(dir,25.5))}},low=k=>Math.min(k.b1[2]+k.dir[2]*4.4-Math.abs(k.w3[2])*4.2,k.b0[2]);
  let sv=pose(a);if(low(sv)<.3){let lo=a,hi=Math.PI/2;for(let i=0;i<20;i++){const m=(lo+hi)/2;if(low(pose(m))<.3)lo=m;else hi=m}sv=pose(hi)}
  // summon: green ring on the floor and dead hands clawing out of the ground around him (the ones behind him first)
  const hands=front=>{const k=cl((p-.15)/.6,0,1);for(let i=0;i<4;i++){const an=i*TAU/4+.4,sn=Math.sin(an);if((sn>0)!==front)continue;const e=cl(k*1.5-i*.14,0,1)*armUp;if(e<=0)continue;
    const hx=x+Math.cos(an)*24*sc,hy=y+2*sc+sn*9*sc;ctx.fillStyle='rgba(20,16,12,.75)';ell(hx,hy+1,4.6*sc,1.6*sc);ctx.fill();ctx.save();ctx.translate(hx,hy);ctx.scale(sc*.8,sc*.8);
    const up=e*9,wv=Math.sin(ph*3+i)*1.2,top=[wv*.3,-up];ink(1.8);ctx.fillStyle=ZC.skin;ctx.beginPath();ctx.moveTo(-2.2,0);ctx.lineTo(-2.2+wv*.3,-up);ctx.lineTo(2.2+wv*.3,-up);ctx.lineTo(2.2,0);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.lineCap='round';const fg=[-1,0,1].map(j=>[[top[0]+j*1.6,top[1]-1],[top[0]+j*2.2+wv*.4,top[1]-4.6],[top[0]+j*2.6+wv*.6+1.2,top[1]-6.4]]);
    ctx.strokeStyle=INK;ctx.lineWidth=4;for(const f of fg){ctx.beginPath();ctx.moveTo(f[0][0],f[0][1]);ctx.quadraticCurveTo(f[1][0],f[1][1],f[2][0],f[2][1]);ctx.stroke()}ctx.fillStyle=INK;ball(top,4.2);ctx.fill();
    ctx.fillStyle=ZC.skin;ball(top,3);ctx.fill();ctx.strokeStyle=ZC.skin;ctx.lineWidth=1.6;for(const f of fg){ctx.beginPath();ctx.moveTo(f[0][0],f[0][1]);ctx.quadraticCurveTo(f[1][0],f[1][1],f[2][0],f[2][1]);ctx.stroke()}
    ctx.fillStyle=ZC.nail;for(const f of fg){ball(f[2],1);ctx.fill()}ctx.restore()}};
  shadow(x,y+2*sc,16*sc,6*sc,.38);
  if(sum){ctx.save();shine(BC.glow,x,y+2*sc,34*sc*armUp,.35*armUp);ctx.strokeStyle=`rgba(150,255,110,${.6*armUp})`;ctx.lineWidth=2;ell(x,y+2*sc,26*sc*armUp,9*sc*armUp);ctx.stroke();ctx.restore();hands(false)}
  ctx.save();ctx.translate(x,y);ctx.scale(sc*(1+squash),sc*(1-squash));const parts=[],dT=D(Ch);
  for(const[sd,f] of[[-1,fL],[1,fR]]){const hip=add(Pv,[0,sd*6,-7.4]),foot=[1+f.x,sd*7.6,f.z],k=farK(F(0,sd,0));
    parts.push({d:dT-100+D(hip)*.01,f:()=>leg(V0,hip,foot,{L1:4.4,L2:4.4,w1:7,w2:6.2,col:mix(BC.coatD,'#120e17',k),shoe:BC.boot,heel:2,toe:3.6,sr:3.2,ank:2.2})})}
  parts.push({d:dT,f:()=>{trunk(V0,Pv,12.2,Ch,12.8,BC.coat,BC.coatD,11);
    // the belly: the coat is open on a cage of ribs with a green glow inside
    on(V0,lerp3(Pv,Ch,.42),12.1,[1,0,-.05],.05,(q,v)=>{const bw=8*Math.max(.3,v),bh=7.2;ink(2);ctx.fillStyle=BC.skin;ctx.beginPath();ctx.ellipse(q[0],q[1],bw+2.2,bh+1.8,0,0,TAU);ctx.fill();ctx.stroke();
      ctx.fillStyle=BC.hole;ctx.beginPath();ctx.ellipse(q[0],q[1]+.4,bw,bh*.82,0,0,TAU);ctx.fill();shine(BC.glow,q[0],q[1]+1,10,.4+.12*Math.sin(t*3));
      ctx.fillStyle=`rgba(150,255,110,${.28+.12*Math.sin(t*3)})`;ell(q[0],q[1]+2.2,bw*.5,bh*.35);ctx.fill();
      ctx.strokeStyle=BC.bone;ctx.lineWidth=1.6;for(let i=0;i<3;i++){const yy=q[1]-3.6+i*3.4,ww=bw*(1-Math.abs(i-1)*.16);ctx.beginPath();ctx.moveTo(q[0]-ww,yy+1);ctx.quadraticCurveTo(q[0],yy-1.4,q[0]+ww,yy+1);ctx.stroke()}
      ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.beginPath();for(const sd of[-1,1])for(let i=0;i<3;i++){const yy=q[1]-4.6+i*3.6,xx=q[0]+sd*(bw+1.1);ctx.moveTo(xx-1.5,yy);ctx.lineTo(xx+1.5,yy+1)}ctx.stroke()});
    chain(V0,Pv,12.2,Ch,12.8);
    on(V0,Ch,12.4,[-1,.35,.05],.1,q=>{ink(1.4);ctx.fillStyle=BC.patch;ctx.fillRect(q[0]-3.4,q[1]-3.2,6.8,6);ctx.strokeRect(q[0]-3.4,q[1]-3.2,6.8,6);ctx.beginPath();for(let i=0;i<4;i++){ctx.moveTo(q[0]-3.4+i*2.2,q[1]-4);ctx.lineTo(q[0]-3.4+i*2.2,q[1]-2.4)}ctx.stroke()})}});
  // free arm (left): hangs and swings; raised straight up at his side to call the dead (never in front of his face)
  {const sh=add(Ch,[0,-11.4,3]),swg=walk?Math.sin(ph)*2.2:0,hd=add(Ch,[6-armUp*8,-15+armUp*2.5,-9+armUp*35+swg]),k=farK(F(0,-1,0));
    parts.push({d:D(add(sh,[6,0,0])),f:()=>{const r=zArm(V0,sh,hd,nrm([-.4,-.6,-1+armUp*1.4]),{side:-1,L1:8.6,L2:8.6,w1:7,w2:6,hand:3.8,full:true,skin:mix(BC.skin,BC.skinF,k),cloth:mix(BC.coat,BC.coatF,k),pd:nrm(lerp3([1,0,-1],[.2,0,1],armUp))});
      if(armUp>.3){const q=P(r.h);shine(BC.glow,q[0],q[1],10,.5*armUp)}}})}
  // shovel arm (right): arm and shovel swing in a plane beside the head
  {const sh=add(Ch,[0,11.4,3]),k=farK(F(0,1,0)),skin=mix(BC.skin,BC.skinF,k),cloth=mix(BC.coat,BC.coatF,k);
    parts.push({d:D(add(Ch,[4,13.6,0])),f:()=>{const tool=()=>shovel(V0,sv),arm=()=>zArm(V0,sh,sv.hd,nrm([-.4,.5,-1]),{side:1,L1:8.6,L2:8.6,w1:7,w2:6,noHand:true,full:true,skin,cloth});
      if(F(0,1,0)>0){arm();tool()}else{tool();arm()}fist(V0,sv.hd,3.8,skin)}})}
  parts.push({d:D(Hc),f:()=>{neck(V0,add(Ch,[2,0,9.6]),5.6,add(Hc,[-1,0,-5.4]),4.8,BC.skin);bHead(V0,Hc,8.6,ph,(slam&&p>.4&&p<.68)||sum?1:.3+.15*Math.sin(ph*2))}});
  run(parts);
  if(!LOWFX){ctx.fillStyle=INK;const h=P(Hc);for(let i=0;i<4;i++){const an=ph*2+i*1.6;ball([h[0]+Math.cos(an)*14,h[1]-4+Math.sin(an*1.5)*5],.8);ctx.fill()}}
  ctx.restore();
  if(sum)hands(true);
  // the blade hits the floor: crack and green splash
  if(hitK>=0&&hitK<.9){const k=hitK/.9,q=P(sv.b1[0]+sv.dir[0]*2,sv.b1[1]+sv.dir[1]*2,0),ix=x+q[0]*sc,iy=y+q[1]*sc;ctx.save();
    ctx.strokeStyle=`rgba(150,255,110,${.75*(1-k)})`;ctx.lineWidth=3;ell(ix,iy,(6+k*30)*sc/2,(2+k*11)*sc/2);ctx.stroke();
    ctx.strokeStyle=`rgba(20,16,12,${.85*(1-k*.4)})`;ctx.lineWidth=2.2;ctx.beginPath();for(let i=0;i<6;i++){const an=i*1.05+.3,r=(10+i%2*5)*sc/2*(.6+k*.8);ctx.moveTo(ix,iy);ctx.lineTo(ix+Math.cos(an)*r*.6,iy+Math.sin(an)*r*.25+1);ctx.lineTo(ix+Math.cos(an+.15)*r,iy+Math.sin(an+.15)*r*.4)}ctx.stroke();
    if(!LOWFX){for(let i=0;i<6;i++){const an=i*1.05,r=k*16*sc/2;ctx.fillStyle=`rgba(150,255,110,${.7*(1-k)})`;ball([ix+Math.cos(an)*r,iy+Math.sin(an)*r*.4-Math.sin(k*Math.PI)*8],2);ctx.fill()}}ctx.restore()}}

return {zombie,strisciante,minatore,hound,becchino};
})();
