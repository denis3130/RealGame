// Zombie-mode enemies for Mossbound: Zombie della cripta, Zombie strisciante, Zombie minatore, Zombie della lanterna, Segugio infernale,
// Zombie spaventapasseri, boss Il Becchino.
// Every monster is a small 3D skeleton (x forward, y right, z up) projected with the facing angle, so it turns through
// all 360 degrees and every piece stays attached to the same point of the body.
//  - the trunk is a capsule (a hull around two balls, pelvis and chest), so it leans and bends the same way from every side
//  - arms and legs are two-bone chains solved with IK: the shoulder or hip is fixed on the body, the animation places the
//    hand or foot, the solver finds the elbow or knee, so a limb keeps its length and always bends the right way
//  - the draw order comes from the rest pose (where a shoulder or a hip sits on the body), never from a moving hand or foot,
//    so nothing jumps in front of or behind the body halfway through a move
//  - legs are always drawn under the body; limbs, sleeves and necks have no outline where they join the body
//  - the four zombies have thin bony arms: tapering bones, a knobbly elbow when bent, tight torn sleeves that melt into the shirt,
//    small palms with long fingers and dark claws (bone, claw, rag); the boss keeps the wide sleeves of his coat
//  - held tools (pick, shovel) swing in a plane beside the head, so they never cut through the face, and stop at the floor
//  - every monster is painted like the lantern zombie (the model): a warm light from the upper left, three tones on every piece,
//    a warm rim inside the outline on the lit side, folds on cloth, blotches on skin, strokes on fur, soft glows (rim, shadeLimb, folds)
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
function neck(V0,a,ra,b,rb,col,blend){const A=V0.P(a),B=V0.P(b);ink(2.4);hull(A,ra,B,rb);ctx.fillStyle=col;ctx.fill();ctx.stroke();if(blend){ball(A,ra+1.3);ctx.fill()}
  ctx.save();hull(A,ra-1.2,B,rb-1.2);ctx.clip();ctx.fillStyle='rgba(16,24,10,.3)';ell(B[0],B[1]+rb*.25,rb*1.3,rb*.95);ctx.fill();ctx.fillStyle='rgba(0,0,0,.14)';ell((A[0]+B[0])/2+ra*.75,(A[1]+B[1])/2,ra*.6,ra*1.7);ctx.fill();ctx.restore()}
// a hand: palm + three hooked fingers in 3D; fd = where the fingers point, pd = where the palm faces.
// The fingers foreshorten when they point at the camera instead of spinning round.
function hand(V0,h,fd,r,col,nail,pd){const{P}=V0;pd=pd||[1,0,-1];let cv=sub(pd,mul(fd,dot(pd,fd)));
  if(len(cv)<.25){const alt=[0,0,-1];cv=sub(alt,mul(fd,dot(alt,fd)));if(len(cv)<.25)cv=[1,0,0]}
  cv=nrm(cv);const sa=nrm(cross(fd,cv)),q=P(h),L=r*2,w=r*.6,fg=[];
  for(let k=-1;k<=1;k++){const d=nrm(add(fd,mul(sa,k*.55))),a=P(add(h,mul(d,r*.4))),m=P(add(add(h,mul(d,L*.85)),mul(cv,L*.1))),e=P(add(add(h,mul(d,L*(k?.88:1))),mul(cv,L*.5)));fg.push([a,m,e])}
  const path=f=>{ctx.beginPath();ctx.moveTo(f[0][0],f[0][1]);ctx.quadraticCurveTo(f[1][0],f[1][1],f[2][0],f[2][1])};
  ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=w+2.4;for(const f of fg){path(f);ctx.stroke()}ctx.fillStyle=INK;ball(q,r+1.25);ctx.fill();
  ctx.fillStyle=col;ball(q,r);ctx.fill();ctx.strokeStyle=col;ctx.lineWidth=w;for(const f of fg){path(f);ctx.stroke()}
  ctx.fillStyle=nail;for(const f of fg){ball(f[2],w*.62);ctx.fill()}ctx.save();ball(q,r);ctx.clip();ctx.fillStyle='rgba(0,0,0,.2)';ell(q[0]+r*.45,q[1]+r*.45,r*.8,r*.6);ctx.fill();glowTop(q,r,.2);ctx.restore()}
// a fist closed round a handle
function fist(V0,h,r,col){const q=V0.P(h);ink(2.2);ball(q,r);ctx.fillStyle=col;ctx.fill();ctx.stroke();ctx.strokeStyle='rgba(20,16,14,.45)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(q[0],q[1],r*.55,-.4,1.2);ctx.stroke()}
// a thin bony limb: each bone tapers from joint to joint (rs = radius at each joint); knobs = bumps on the joints, [screen point, r].
// Every outline first, then `end` (the hand), then every fill, so the joints have no seams
function bone(pts,rs,col,end,knobs){knobs=knobs||[];ctx.fillStyle=INK;
  for(let i=0;i<pts.length-1;i++){hull(pts[i],rs[i]+1.3,pts[i+1],rs[i+1]+1.3);ctx.fill()}
  for(const[q,r] of knobs){ball(q,r+1.3);ctx.fill()}
  if(end)end();ctx.fillStyle=col;
  for(let i=0;i<pts.length-1;i++){hull(pts[i],rs[i],pts[i+1],rs[i+1]);ctx.fill()}
  for(const[q,r] of knobs){ball(q,r);ctx.fill()}}
// a bony hand: a small palm and three long thin fingers in 3D that hook toward the palm and end in dark pointed claws.
// fd = where the fingers point, pd = where the palm faces, fl = finger length. The fingers foreshorten instead of spinning round
function claw(V0,h,fd,r,col,nail,pd,fl){const{P}=V0;pd=pd||[1,0,-1];let cv=sub(pd,mul(fd,dot(pd,fd)));
  if(len(cv)<.25){const alt=[0,0,-1];cv=sub(alt,mul(fd,dot(alt,fd)));if(len(cv)<.25)cv=[1,0,0]}
  cv=nrm(cv);const sa=nrm(cross(fd,cv)),q=P(h),L=fl||r*3,w=Math.max(.9,r*.62),fg=[];
  for(let k=-1;k<=1;k++){const d=nrm(add(fd,mul(sa,k*.5))),Lk=L*(k?.86:1);
    fg.push([P(add(h,mul(d,r*.5))),P(add(add(h,mul(d,Lk*.75)),mul(cv,-Lk*.05))),P(add(add(h,mul(d,Lk*.97)),mul(cv,Lk*.36)))])}
  const path=f=>{ctx.beginPath();ctx.moveTo(f[0][0],f[0][1]);ctx.quadraticCurveTo(f[1][0],f[1][1],f[2][0],f[2][1])};
  ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=w+2;for(const f of fg){path(f);ctx.stroke()}ctx.fillStyle=INK;ball(q,r+1.2);ctx.fill();
  ctx.fillStyle=col;ball(q,r);ctx.fill();ctx.strokeStyle=col;ctx.lineWidth=w;for(const f of fg){path(f);ctx.stroke()}
  // the claws: the last part of each finger, dark, sharpened to a point a little past the fingertip
  const bz=(f,t)=>[0,1].map(i=>(1-t)*(1-t)*f[0][i]+2*(1-t)*t*f[1][i]+t*t*f[2][i]),
    nb=(f,t)=>{const x=(1-t)*(f[1][0]-f[0][0])+t*(f[2][0]-f[1][0]),y=(1-t)*(f[1][1]-f[0][1])+t*(f[2][1]-f[1][1]),l=Math.hypot(x,y)||1;return[x/l,y/l]};
  ctx.fillStyle=nail;for(const f of fg){const hw=w*.5+.35,side=[];
    for(const t of[.7,.86,1]){const c=bz(f,t),u=nb(f,t),s=hw*(t<1?1-(t-.7)*.6:.78);side.push([c[0]-u[1]*s,c[1]+u[0]*s,c[0]+u[1]*s,c[1]-u[0]*s])}
    const u=nb(f,1),tp=[f[2][0]+u[0]*(w*.5+1.9),f[2][1]+u[1]*(w*.5+1.9)];ctx.beginPath();for(const s of side)ctx.lineTo(s[0],s[1]);ctx.lineTo(tp[0],tp[1]);
    for(let i=side.length-1;i>=0;i--)ctx.lineTo(side[i][2],side[i][3]);ctx.closePath();ctx.fill()}}
// a tight torn sleeve over the top of the arm: a tube from the shoulder s3 (radius r0) to e3 (radius r1) that ends in ragged teeth
// hanging down the arm. Its root melts into the shirt wherever it lies over the body (`body` makes a path of the inside of the
// body's outline), so the arm grows out of the shirt instead of wearing a ball on the shoulder; on the edge of the body the
// outline stays. Without `body`, rk says how much of the root to melt (1 where the shoulder sits on the edge of the body)
function rag(V0,s3,e3,r0,r1,col,body,rk,shade){const{P}=V0,A=P(s3),B=P(e3);let ux=B[0]-A[0],uy=B[1]-A[1];const pl=Math.hypot(ux,uy),k=cl(pl/(len(sub(e3,s3))||1),0,1);
  if(pl<.01){ux=0;uy=1}else{ux/=pl;uy/=pl}const th=Math.atan2(uy,ux),pts=[],TL=[0,1.1,0,1.6,0,.9,0],RR=[1,1,.78,1,.78,1,1];
  for(let i=0;i<=10;i++){const an=th+Math.PI/2+i/10*Math.PI;pts.push([A[0]+Math.cos(an)*r0,A[1]+Math.sin(an)*r0])}
  for(let j=0;j<=6;j++){const an=th-Math.PI/2+j/6*Math.PI,rr=r1*RR[j],tl=TL[j]*k*r1/2.1;pts.push([B[0]+Math.cos(an)*rr+ux*tl,B[1]+Math.sin(an)*rr+uy*tl])}
  ctx.beginPath();for(const q of pts)ctx.lineTo(q[0],q[1]);ctx.closePath();ctx.lineJoin='round';ctx.strokeStyle=INK;ctx.lineWidth=2.6;ctx.stroke();ctx.fillStyle=col;ctx.fill();
  if(shade){ctx.save();ctx.clip();let nx=-uy,ny=ux;if(nx+ny>0){nx=-nx;ny=-ny}ctx.lineCap='round';ctx.strokeStyle=shade;ctx.lineWidth=(r0+r1)*.5;seg([A[0]-nx*r0*.75,A[1]-ny*r0*.75],[B[0]-nx*r1*.75+ux*2,B[1]-ny*r1*.75+uy*2]);ctx.stroke();
    ctx.strokeStyle=wa(.16);ctx.lineWidth=(r0+r1)*.16;seg([A[0]+nx*r0*.55,A[1]+ny*r0*.55],[B[0]+nx*r1*.55,B[1]+ny*r1*.55]);ctx.stroke();ctx.restore()}
  if(body){ctx.save();body();ctx.clip();ctx.fillStyle=col;ball(A,r0+1.45);ctx.fill();ctx.restore()}
  else if(rk>0){ctx.save();ctx.globalAlpha=rk;ctx.fillStyle=col;ball(A,r0+1.3);ctx.fill();ctx.restore()}}
// a leg from the hip: IK knee, seamless thigh and shin, and a shoe that is a little 3D capsule from heel to toe
function leg(V0,hip,foot,o){const{P}=V0,[kn,f]=ik(hip,add(foot,[0,0,o.ank||1.6]),o.L1,o.L2,o.pole||[1,0,.15]),pts=[P(hip),P(kn),P(f)];
  limb(pts,[o.w1,o.w2],o.col,()=>{const h0=P(add(f,[-o.heel,0,-.4])),t0=P(add(f,[o.toe,0,-.6]));ink(2.4);ctx.fillStyle=o.shoe;hull(h0,o.sr,t0,o.sr*1.08);ctx.fill();ctx.stroke();
    ctx.save();hull(h0,o.sr-1.2,t0,o.sr*1.08-1.2);ctx.clip();ctx.fillStyle='rgba(0,0,0,.25)';ell((h0[0]+t0[0])/2+o.sr*.5,(h0[1]+t0[1])/2+o.sr*.6,o.sr*2,o.sr*.7);ctx.fill();ctx.restore();rim(h0,o.sr,t0,o.sr*1.08,.24)});
  shadeLimb(pts,[o.w1/2,o.w2/2],o.colD||'rgba(0,0,0,.24)')}
// a trunk: capsule from the pelvis ball to the chest ball, a ragged hem under the pelvis, soft shading inside
// o.folds: angles of the folds down the cloth (painted like the lantern zombie's cloak)
function trunk(V0,Pv,rP,Ch,rC,col,colD,teeth,o){o=o||{};const{P}=V0,a=P(Pv),b=P(Ch);ink(2.4);
  if(teeth){const n=teeth*2,pts=[];for(let i=0;i<=n;i++){const an=Math.PI*(.14+.72*i/n),r=rP+(i%2?1.9+(i%4===1?.9:0):-.2);pts.push([a[0]+Math.cos(an)*r,a[1]+Math.sin(an)*r])}
    const tp=()=>{ctx.beginPath();for(const q of pts)ctx.lineTo(q[0],q[1]);ctx.lineTo(a[0],a[1]);ctx.closePath()};ctx.fillStyle=col;tp();ctx.fill();
    ctx.save();tp();ctx.clip();ctx.fillStyle=colD;ell(a[0]+rP*.55,a[1]+rP*.55,rP,rP*.75);ctx.fill();ctx.restore();ctx.beginPath();for(const q of pts)ctx.lineTo(q[0],q[1]);ctx.stroke()}
  hull(a,rP,b,rC);ctx.fillStyle=col;ctx.fill();ctx.stroke();
  ctx.save();hull(a,rP-1.3,b,rC-1.3);ctx.clip();ctx.fillStyle=colD;ell(a[0]+rP*.55,a[1]+rP*.55,rP,rP*.75);ctx.fill();ell(b[0]+rC*.78,b[1]+rC*.2,rC*.55,rC);ctx.fill();
  on(V0,lerp3(Pv,Ch,.6),lerp(rP,rC,.6),[-.75,0,.65],-.2,q=>{ctx.fillStyle=wa(.13);ell(q[0],q[1],rC*.75,rC*.42);ctx.fill()});
  ctx.fillStyle=wa(.12);ell(b[0]-rC*.38,b[1]-rC*.45,rC*.48,rC*.3);ctx.fill();
  if(o.folds)folds(V0,Ch,rC,Pv,rP,o.folds,.4,o.fz0,o.fz1);
  if(o.neck){const q=P(add(Ch,[1,0,rC*.8]));ctx.fillStyle='rgba(8,12,16,.3)';ell(q[0],q[1]+1,rC*.55,rC*.32);ctx.fill()}
  ctx.restore();if(!o.noRim)rim(a,rP,b,rC,.34)}
// ------------------------------------------------------------------ the lantern zombie's way of painting, used by every other monster
// The light comes from the upper left and is warm. Every piece gets three tones (its colour, a darker side away from the light, a soft
// warm light toward it), a thin warm rim just inside its outline on the lit side, and fine marks (folds, blotches, strokes).
// These change only how the pieces are painted, never what the pieces are. The lantern zombie keeps its own functions, untouched.
const WARM='255,238,205',LITK=.55,wa=a=>'rgba('+WARM+','+(a*LITK).toFixed(3)+')';
// a thin warm rim inside a capsule or ball outline (screen centres a,b and radii ra,rb), fading out away from the upper left
function rim(a,ra,b,rb,al){const cx=(a[0]+b[0])/2,cy=(a[1]+b[1])/2,R=Math.max(ra,rb)+Math.hypot(b[0]-a[0],b[1]-a[1])/2,g=ctx.createLinearGradient(cx-R*.8,cy-R*.8,cx+R*.15,cy+R*.15);
  g.addColorStop(0,wa(al||.3));g.addColorStop(1,wa(0));ctx.save();ctx.strokeStyle=g;ctx.lineWidth=1.3;hull(a,Math.max(.4,ra-1.9),b,Math.max(.4,rb-1.9));ctx.stroke();ctx.restore()}
// three tones on a limb that is already drawn (screen points, fill radii): a darker side away from the light, a thin warm light on the lit side
function shadeLimb(pts,rs,colD,al){for(let i=0;i<pts.length-1;i++){const A=pts[i],B=pts[i+1],ra=rs[i],rb=rs[i+1];let dx=B[0]-A[0],dy=B[1]-A[1];const l=Math.hypot(dx,dy);if(l<.4)continue;dx/=l;dy/=l;
    let nx=-dy,ny=dx;if(nx+ny>0){nx=-nx;ny=-ny}
    ctx.save();hull(A,ra,B,rb);ctx.clip();ctx.lineCap='round';ctx.strokeStyle=colD;ctx.lineWidth=(ra+rb)*.44;seg([A[0]-nx*ra*.66,A[1]-ny*ra*.66],[B[0]-nx*rb*.66,B[1]-ny*rb*.66]);ctx.stroke();
    ctx.strokeStyle=wa(al||.17);ctx.lineWidth=Math.max(.5,(ra+rb)*.17);seg([A[0]+nx*ra*.52,A[1]+ny*ra*.52],[B[0]+nx*rb*.52,B[1]+ny*rb*.52]);ctx.stroke();ctx.restore()}}
// a soft warm light on the upper left of a ball (screen centre q, radius r)
function glowTop(q,r,al){ctx.fillStyle=wa(al||.1);ell(q[0]-r*.32,q[1]-r*.42,r*.55,r*.36);ctx.fill()}
// thin folds down a piece of cloth, from the chest ball to the lower ball, only on the side that faces us (angles round the body)
function folds(V0,Ch,rC,Pv,rP,angs,al,z0,z1){const{P,F}=V0;ctx.strokeStyle=`rgba(20,14,10,${al||.4})`;ctx.lineWidth=1.1;ctx.lineCap='round';
  for(const an of angs){const d=[Math.cos(an),Math.sin(an),0];if(F(d)<.12)continue;const p0=P(add(Ch,mul(nrm([d[0],d[1],z0===undefined?-.25:z0]),rC*.9))),p1=P(add(Pv,mul(nrm([d[0],d[1],z1===undefined?-.65:z1]),rP*.96)));
    ctx.beginPath();ctx.moveTo(p0[0],p0[1]);ctx.quadraticCurveTo((p0[0]+p1[0])/2+1,(p0[1]+p1[1])/2,p1[0],p1[1]);ctx.stroke()}}
function run(parts){parts.sort((a,b)=>a.d-b.d);for(const q of parts){ink(2.4);q.f()}}

// ------------------------------------------------------------------ shared zombie parts
const ZC={skin:'#88a46a',skinD:'#647e4e',skinF:'#55693f',cloth:'#3b4956',clothD:'#27313b',clothF:'#242c34',pants:'#332b25',pantsF:'#1e1916',shoe:'#201b18',
  bone:'#e6dcc0',socket:'#141010',eye:'#e9ff7a',mouth:'#2a0c0c',gum:'#6a1a1a',nail:'#1e1a14',rot:'#3f5233'};
// an arm from its shoulder socket: IK elbow, seamless upper arm and forearm, a clawed hand, a torn sleeve over the root.
// o.bony: a thin dead arm (w1 at the shoulder, we at the elbow, w2 at the wrist) with a knobbly elbow, a tight torn sleeve
// (o.sleeve wide at the shoulder, down to o.sleeveK of the upper arm) and a bony hand (palm o.hand, fingers o.fl long);
// o.body: the inside of the body's outline, where the sleeve's root melts into the shirt.
// o.full: the sleeve covers the whole arm (a coat); o.noHand: the caller draws the hand (a fist on a tool)
function zArm(V0,sh,hd,pole,o){const{P}=V0,[el,h]=ik(sh,hd,o.L1,o.L2,pole),a=P(sh),e=P(el),fd=o.fd||nrm(sub(h,el)),rk=cl(1-Math.abs(V0.F(0,o.side,0))*1.8,0,1);
  if(o.bony){// the elbow knob grows with the bend and sits on the outside of it: a straight arm has no bump
    const re=o.we/2,out=sub(el,lerp3(sh,h,.5)),ol=len(out),bend=cl(ol/(o.L1*.45),0,1),kq=P(ol>.05?add(el,mul(out,re*.4*bend/ol)):el),
      end=o.noHand?null:()=>claw(V0,h,fd,o.hand,o.skin,o.nail||ZC.nail,o.pd,o.fl);
    bone([a,e,P(h)],[o.w1/2,re,o.w2/2],o.skin,end,[[kq,re*(1+.16*bend)]]);if(o.shade)shadeLimb([a,e,P(h)],[o.w1/2,re,o.w2/2],o.shade);
    if(o.sleeve)rag(V0,sh,lerp3(sh,el,o.sleeveK||.6),o.sleeve/2,o.sleeve/2*.9,o.cloth,o.body,rk,o.clothD);
    return{el,h}}
  const end=o.noHand?null:()=>hand(V0,h,fd,o.hand,o.skin,o.nail||ZC.nail,o.pd);
  if(o.full){const w3=lerp3(el,h,.78);if(end)end();limb([a,e,P(w3)],[o.w1,o.w2],o.cloth);if(o.clothD)shadeLimb([a,e,P(w3)],[o.w1/2,o.w2/2],o.clothD);if(rk>0){ctx.save();ctx.globalAlpha=rk;ctx.fillStyle=o.cloth;ball(a,o.w1*.5+1.3);ctx.fill();ctx.restore()}if(o.cuff)cuff(V0,w3,el,o.w2+1,o.cloth)}
  else{limb([a,e,P(h)],[o.w1,o.w2],o.skin,end);if(o.sleeve){const s3=lerp3(sh,el,o.sleeveK||.6);sleeve(a,P(s3),o.sleeve,o.cloth,rk);if(o.cuff)cuff(V0,s3,sh,o.sleeve,o.cloth)}}
  return{el,h}}
// a zombie head: hollow sockets with pinpoint lights, hanging jaw with broken teeth, a few hairs, a stitched crack on the back, a scar
function zHead(V0,Hc,R,ph,o){const{P,c}=V0,h=P(Hc),t=G.t,at=R*.95;o=o||{};
  ink(2.4);ball(h,R);ctx.fillStyle=o.skin||ZC.skin;ctx.fill();ctx.stroke();
  const lit=[];ctx.save();ball(h,R-1.1);ctx.clip();ctx.fillStyle=o.skinD||ZC.skinD;ell(h[0]+R*.3,h[1]+R*.74,R*1.15,R*.62);ctx.fill();
  for(const[d,sz] of[[[-.45,-.6,.62],.22],[[-.85,.35,.38],.2],[[.15,.8,.55],.16],[[-.3,.15,.95],.15],[[.45,-.85,-.15],.17],[[-.6,-.25,-.75],.2]])on(V0,Hc,at,d,-.15,q=>{ctx.fillStyle=o.skinD||ZC.skinD;ell(q[0],q[1],R*sz,R*sz*.72);ctx.fill()});
  glowTop(h,R,.17);
  if(!o.helmet)on(V0,Hc,at,[-.15,-.5,.85],-.3,q=>{ctx.fillStyle=ZC.rot;ell(q[0],q[1],R*.3,R*.19);ctx.fill()});
  on(V0,Hc,at,[-1,.1,.25],.05,q=>{ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(q[0]-3,q[1]-2);ctx.lineTo(q[0],q[1]);ctx.lineTo(q[0]+2.6,q[1]-2.4);for(let i=0;i<3;i++){const xx=q[0]-2.4+i*2.2;ctx.moveTo(xx-.8,q[1]-2.6+i*.4);ctx.lineTo(xx+.8,q[1]-.4+i*.4)}ctx.stroke()});
  if(!o.noScar)on(V0,Hc,at,[.15,1,-.1],.05,q=>{ctx.strokeStyle=INK;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(q[0]-2,q[1]-2);ctx.lineTo(q[0]+2,q[1]+2);ctx.moveTo(q[0]-1.4,q[1]+.6);ctx.lineTo(q[0]-.2,q[1]-.8);ctx.moveTo(q[0]+.4,q[1]+1.8);ctx.lineTo(q[0]+1.6,q[1]+.4);ctx.stroke()});
  for(const sd of[-1,1])on(V0,Hc,at,[.8,sd*.4,.16],0,(q,v)=>{const big=sd>0?1.15:.9;ink(1.5);ctx.fillStyle=ZC.socket;ctx.beginPath();ctx.ellipse(q[0],q[1],R*.3*big*Math.max(.45,v),R*.34*big,0,0,TAU);ctx.fill();ctx.stroke();
    if(!(o.deadEye&&sd<0))lit.push([q,big,cl(v*4,0,1)])});
  ctx.restore();rim(h,R,h,R);
  for(const[q,big,k] of lit){const e=[q[0]+c*.3,q[1]+.2],er=R*.12*big*k;shine('230,255,120',q[0],q[1],R*.62,(.5+.1*Math.sin(t*5+big))*k);ctx.fillStyle=ZC.eye;ball(e,er);ctx.fill();ctx.fillStyle='#ffffff';ball([e[0]-er*.35,e[1]-er*.35],er*.42);ctx.fill()}
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
    parts.push({d:dT-100+D(hip)*.01,f:()=>leg(V0,hip,foot,{L1:4.8,L2:4.8,w1:4.6,w2:4,col:mix(ZC.pants,ZC.pantsF,k),colD:'rgba(0,0,0,.3)',shoe:ZC.shoe,heel:1.3,toe:2.6,sr:2.2})})}
  parts.push({d:dT,f:()=>{trunk(V0,Pv,6.2,Ch,8.4,ZC.cloth,ZC.clothD,5,{folds:[-1.1,-.45,.25,.95,2.5,3.15,3.8],neck:1});
    // a hole in the shirt over the ribs (front, left side); spine bumps and a tear on the back
    on(V0,Ch,8,[.82,-.55,-.1],.12,(q,v)=>{const w=Math.max(.4,v);ink(1.6);ctx.fillStyle=ZC.rot;ctx.beginPath();ctx.ellipse(q[0],q[1],4*w,3.3,0,0,TAU);ctx.fill();ctx.stroke();
      ctx.strokeStyle=ZC.bone;ctx.lineWidth=1.4;for(let i=0;i<2;i++){ctx.beginPath();ctx.moveTo(q[0]-3.2*w,q[1]-.6+i*2.2);ctx.quadraticCurveTo(q[0],q[1]-2.4+i*2.2,q[0]+3.2*w,q[1]-.6+i*2.2);ctx.stroke()}});
    for(let i=0;i<3;i++)on(V0,Ch,8.1,[-1,0,.55-i*.42],.35,q=>{ink(1.3);ctx.fillStyle=ZC.skinD;ball(q,1.5);ctx.fill();ctx.stroke()});
    on(V0,Pv,6.2,[-.5,.85,.35],.15,q=>{ctx.strokeStyle='rgba(20,16,14,.7)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(q[0]-1,q[1]-3);ctx.lineTo(q[0]+1.2,q[1]);ctx.lineTo(q[0]-.4,q[1]+2.6);ctx.stroke()})}});
  // arms reach forward; raised high and back over the head when it rears back (so they never cover the face), then they rake down
  for(const sd of[-1,1]){const sh=add(Ch,[0,sd*7,3]),sw=walk?Math.sin(ph+(sd>0?Math.PI:0))*1.1:Math.sin(ph+sd)*.4,
      hd=add(Ch,[10-upP*12+reach*5,sd*(10+upP*2-reach*2),-.5+up*15.5+sw]),k=farK(F(0,sd,0));
    parts.push({d:D(add(sh,[7,0,0])),f:()=>zArm(V0,sh,hd,nrm([-.3*upP,sd*.6,-1+1.5*upP]),{side:sd,L1:5.8,L2:5.8,bony:1,w1:3.4,we:3,w2:2.2,hand:1.8,fl:5.6,skin:mix(ZC.skin,ZC.skinF,k),cloth:mix(ZC.cloth,ZC.clothF,k),shade:'rgba(40,58,26,.42)',clothD:'rgba(0,0,0,.28)',sleeve:4.6,sleeveK:.36,body:()=>hull(P(Pv),5,P(Ch),7.2)})})}
  parts.push({d:D(Hc),f:()=>{neck(V0,add(Ch,[1.6,0,6.8]),3.8,add(Hc,[-.8,0,-5.6]),3.4,ZC.skin);zHead(V0,Hc,8.2,ph,{open:atk&&p>.25&&p<.7?1:.45+.2*Math.sin(ph*2)})}});
  run(parts);ctx.restore()}

// ------------------------------------------------------------------ ZOMBIE STRISCIANTE (crawler): only the upper half, drags itself on its long arms
function strisciante(x,y,face,anim,p,sc){sc=sc||1.1;const V0=V(face),{P,D,F}=V0,ph=p*TAU,walk=anim==='walk',atk=anim==='attack';
  // attack: .0-.35 rears up on its arms, .35-.65 lunges forward low with the jaw wide open, .65-1 slumps back
  let rear=0,lunge=0;if(atk){if(p<.35)rear=ez(p/.35);else if(p<.65){const k=ez((p-.35)/.3);rear=1-k;lunge=k*8}else lunge=8*(1-ez((p-.65)/.35))}
  // walk: one hand reaches out, plants and pulls while the other comes forward; the body surges on every pull
  const st=stepper(p,.5),hL=walk?st(0,3.4,2.6):NOSTEP,hR=walk?st(.5,3.4,2.6):NOSTEP,surge=walk?-Math.cos(ph*2)*.7:0,wig=walk?Math.sin(ph):Math.sin(ph)*.3;
  // seen from the front its long back would hide behind the head: near the front view (only there, smoothly) everything behind the
  // chest is drawn a little longer, so the back and the spine show
  const fr=cl((V0.s-.72)/.28,0,1),el=1+.85*fr*fr*(3-2*fr);
  const B=lunge+surge,Ch=[B+1.5,wig*.5,6.8+rear*5],Wb=[B+1.5-9*el,-wig*.4,4.4+rear*1],Hc=add(Ch,[6,wig*.3,4.6+rear*1.2]);
  {const q=P(B-1-(el-1)*5,0,0);shadow(x+q[0]*sc,y+q[1]*sc,13*sc,4.6*sc*(1+(el-1)*.9),.36)}
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const parts=[],dT=D(lerp3(Wb,Ch,.6));
  // the spine and the rags trail on the floor behind the waist: always under the body
  parts.push({d:dT-100,f:()=>{ctx.fillStyle=ZC.clothD;ink(1.3);for(let i=0;i<3;i++){const r=P(add(Wb,[-2*el,(i-1)*3.2,-2.5])),e=P(Wb[0]-(5-i*1.4)*el,(i-1)*5.2+Math.sin(ph+i)*.8,.4);spike(r,e,2.2)}
    for(let i=4;i>=0;i--){const k=i/4,q=P(add(Wb,[-(3.5+k*8.5)*el,Math.sin(ph+1+k*2)*1.6*k-wig*k,lerp(-1.6,-3.6,k)])),r=lerp(2.1,1.1,k);ink(1.3);ctx.fillStyle=ZC.bone;ctx.beginPath();ctx.ellipse(q[0],q[1],r*1.25,r,0,0,TAU);ctx.fill();ctx.stroke();
      ctx.save();ctx.clip();ctx.fillStyle='rgba(110,86,52,.45)';ell(q[0]+r*.45,q[1]+r*.45,r*1.1,r*.8);ctx.fill();ctx.fillStyle=wa(.5);ell(q[0]-r*.4,q[1]-r*.35,r*.42,r*.26);ctx.fill();ctx.restore()}}});
  parts.push({d:dT,f:()=>{trunk(V0,Wb,5,Ch,7.2,ZC.cloth,ZC.clothD,0,{folds:[-1.3,-.7,.7,1.3],fz0:.55,fz1:.5});
    // the torn back of the shirt shows the spine and the ribs
    const A=P(Wb),Bq=P(Ch),ax=Bq[0]-A[0],ay=Bq[1]-A[1],al=Math.hypot(ax,ay)||1,ux=ax/al,uy=ay/al;
    on(V0,lerp3(Wb,Ch,.45),6.2,[-.1,0,1],-.6,q=>{ink(1.3);ctx.fillStyle=ZC.rot;ctx.beginPath();ctx.ellipse(q[0],q[1],3,2,Math.atan2(uy,ux),0,TAU);ctx.fill();ctx.stroke();
      ctx.strokeStyle='rgba(230,220,192,.85)';ctx.lineWidth=1;for(let i=-.5;i<=.5;i++){const cx=q[0]+ux*i*1.6,cy=q[1]+uy*i*1.6;seg([cx+uy*1.5,cy-ux*1.5],[cx-uy*1.5,cy+ux*1.5]);ctx.stroke()}})}});
  // long arms: shoulders on the chest, hands planted on the floor ahead, elbows out to the sides
  for(const[sd,f] of[[-1,hL],[1,hR]]){const sh=add(Ch,[1.4,sd*6,1]),hd=[10.1+f.x*1.2+lunge*1.1,sd*8.8,f.z+(atk?lunge*.25:0)],k=farK(F(0,sd,0));
    parts.push({d:D(add(sh,[4,0,0])),f:()=>zArm(V0,sh,hd,nrm([-.5,sd,.25]),{side:sd,L1:7.4,L2:7.8,bony:1,w1:3.4,we:3,w2:2.2,hand:1.9,fl:6,fd:nrm([1,sd*.3,-.25]),pd:[0,0,-1],skin:mix(ZC.skin,ZC.skinF,k),cloth:mix(ZC.cloth,ZC.clothF,k),shade:'rgba(40,58,26,.42)',clothD:'rgba(0,0,0,.28)',sleeve:4.4,sleeveK:.32,body:()=>hull(P(Wb),3.8,P(Ch),6)})})}
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
  on(V0,Pv,rP,[-.6,-.1,.3],-.2,q=>{ctx.fillStyle=wa(.1);ell(q[0],q[1],rP*.7,rP*.4);ctx.fill()});
  ctx.strokeStyle='rgba(12,20,32,.45)';ctx.lineWidth=1.1;ctx.lineCap='round';for(const[d,dx] of[[[.85,-.45,-.3],1],[[.95,.25,-.25],-1],[[.3,.95,-.25],1],[[-.2,-.95,-.3],-1]])on(V0,Pv,rP*.96,d,.1,q=>{ctx.beginPath();ctx.moveTo(q[0]-1.6,q[1]-1.2);ctx.quadraticCurveTo(q[0],q[1]-.2*dx,q[0]+1.4,q[1]+1.6);ctx.stroke()});
  if(fv>-.1){ctx.save();ctx.globalAlpha=cl((fv+.1)*4,0,1);const bq=S([1,-.2,.1]);ctx.fillStyle=wa(.12);ell(bq[0],bq[1]-1.4,2.6,1.4);ctx.fill();ctx.restore()}
  ctx.restore();rim(a,rP,b,rC,.34)}
// the pickaxe: handle and a curved iron head, from a pose made by pose()
function pickaxe(V0,k){const{P}=V0,h0=P(add(k.hd,mul(k.dir,-4.5))),h1=P(k.top);
  ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=5.2;seg(h0,h1);ctx.stroke();ctx.strokeStyle=MC.wood;ctx.lineWidth=2.6;ctx.stroke();
  {let dx=h1[0]-h0[0],dy=h1[1]-h0[1];const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;let nx=-dy,ny=dx;if(nx+ny>0){nx=-nx;ny=-ny}ctx.strokeStyle=MC.woodD;ctx.lineWidth=1;seg([h0[0]-nx*.7,h0[1]-ny*.7],[h1[0]-nx*.7,h1[1]-ny*.7]);ctx.stroke();
    ctx.strokeStyle=wa(.3);ctx.lineWidth=.6;seg([h0[0]+nx*.6,h0[1]+ny*.6],[h1[0]+nx*.6,h1[1]+ny*.6]);ctx.stroke();ctx.strokeStyle=MC.woodD;ctx.lineWidth=.9;for(const u of[.3,.62]){const m=[lerp(h0[0],h1[0],u),lerp(h0[1],h1[1],u)];seg([m[0]-nx*.9,m[1]-ny*.9],[m[0]+dx*1.1,m[1]+dy*1.1]);ctx.stroke()}}
  const A=P(k.tA),B=P(k.tB),T=P(add(k.top,mul(k.dir,-1))),M=P(add(k.top,mul(k.dir,5.6)));
  ctx.strokeStyle=INK;ctx.lineWidth=1.8;ctx.lineJoin='round';ctx.fillStyle=MC.iron;ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.quadraticCurveTo(M[0],M[1],B[0],B[1]);ctx.quadraticCurveTo(T[0],T[1],A[0],A[1]);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.save();ctx.clip();ctx.strokeStyle=wa(.4);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.quadraticCurveTo(T[0],T[1],B[0],B[1]);ctx.stroke();ctx.fillStyle='rgba(30,32,40,.3)';ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.quadraticCurveTo(M[0],M[1],B[0],B[1]);ctx.lineWidth=2.4;ctx.strokeStyle='rgba(30,32,40,.35)';ctx.stroke();ctx.restore();
  ctx.fillStyle=MC.ironD;ball(P(add(k.top,mul(k.dir,1))),1.7);ctx.fill();ctx.stroke();ctx.fillStyle='rgba(120,60,30,.6)';ball(P(add(add(k.top,mul(k.u,3.4)),mul(k.dir,1.6))),1);ctx.fill()}
// the miner's helmet: brim, dome with a ridge, and the lamp on the front (lit only where it faces us)
function helmet(V0,Hc,R,t){const{P,F}=V0,C0=add(Hc,[-.5,0,R*.5]),hb=P(C0),bw=R+1.2,rd=R*.92;ink(2);ctx.fillStyle=MC.helmD;ell(hb[0],hb[1],bw,bw*.55);ctx.fill();ctx.stroke();
  ctx.fillStyle=MC.helm;ctx.beginPath();ctx.arc(hb[0],hb[1],rd,Math.PI,0);ctx.ellipse(hb[0],hb[1],rd,rd*.55,0,0,Math.PI);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.save();ctx.clip();ctx.fillStyle=MC.helmD;ell(hb[0]+rd*.55,hb[1]+rd*.2,rd*.6,rd*.9);ctx.fill();ctx.fillStyle='rgba(255,255,255,.3)';ell(hb[0]-rd*.4,hb[1]-rd*.55,rd*.3,rd*.15);ctx.fill();
  ctx.strokeStyle='rgba(255,246,215,.28)';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(hb[0],hb[1],rd-1.5,Math.PI*1.08,Math.PI*1.55);ctx.stroke();
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
    parts.push({d:dT-100+D(hip)*.01,f:()=>leg(V0,hip,foot,{L1:4.4,L2:4.6,w1:4.8,w2:4.2,col:mix(MC.over,MC.overF,k),colD:'rgba(0,0,0,.28)',shoe:MC.boot,heel:1.4,toe:2.6,sr:2.4})})}
  parts.push({d:dT,f:()=>{trunk(V0,Pv,6.3,Ch,8.2,MC.shirt,MC.shirtD,0,{noRim:1,neck:1});overalls(V0,Pv,6.3,Ch,8.2)}});
  // left arm hangs and swings
  {const sh=add(Ch,[0,-7.6,1.4]),sw=walk?Math.sin(ph)*2.4:Math.sin(ph)*.3,hd=add(sh,[2.5+sw,-1.6,-11.6+crouch*.5]),k=farK(F(0,-1,0));
    parts.push({d:D(add(sh,[2,0,0])),f:()=>zArm(V0,sh,hd,[-1,0,-.1],{side:-1,L1:6,L2:6.2,bony:1,w1:3.4,we:3,w2:2.2,hand:1.8,fl:5.4,pd:[.5,1,0],skin:mix(ZC.skin,ZC.skinF,k),cloth:mix(MC.shirt,MC.shirtF,k),shade:'rgba(40,58,26,.42)',clothD:'rgba(0,0,0,.26)',sleeve:4.6,sleeveK:.4,body:()=>hull(P(Pv),5.1,P(Ch),7)})})}
  // right arm holds the pick; arm and pick swing in a plane beside the head
  {const sh=add(Ch,[0,7.6,1.4]),k=farK(F(0,1,0)),skin=mix(ZC.skin,ZC.skinF,k);
    parts.push({d:D(add(Ch,[2,9.6,1.4])),f:()=>{const tool=()=>pickaxe(V0,pk),arm=()=>zArm(V0,sh,pk.hd,nrm([-.4,.5,-1]),{side:1,L1:6,L2:6.2,bony:1,w1:3.4,we:3,w2:2.2,noHand:true,skin,cloth:mix(MC.shirt,MC.shirtF,k),shade:'rgba(40,58,26,.42)',clothD:'rgba(0,0,0,.26)',sleeve:4.6,sleeveK:.4,body:()=>hull(P(Pv),5.1,P(Ch),7)});
      if(F(0,1,0)>.2){arm();tool()}else{tool();arm()}fist(V0,pk.hd,2.3,skin);const fq=P(pk.hd);ctx.save();ball(fq,1.2);ctx.clip();glowTop(fq,2.3,.22);ctx.restore()}})}
  parts.push({d:D(Hc),f:()=>{neck(V0,add(Ch,[1.6,0,6.6]),3.8,add(Hc,[-.8,0,-5.4]),3.4,ZC.skin);zHead(V0,Hc,8,ph,{open:atk&&p>.35&&p<.6?1:.35,helmet:true,deadEye:true,noDrool:true});helmet(V0,Hc,8,t)}});
  run(parts);ctx.restore();
  // the pick bites the floor: sparks and chips of stone where the point went in
  if(hit>=0&&hit<1){const tp=pk.tA[2]<pk.tB[2]?pk.tA:pk.tB,q=P(tp[0],tp[1],0),ix=x+q[0]*sc,iy=y+q[1]*sc,k=hit;ctx.save();
    for(let i=0;i<7;i++){const an=-Math.PI*.15-i*.45,r=(4+k*16)*sc;ctx.strokeStyle=`rgba(255,${200+i*8},120,${1-k})`;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(ix+Math.cos(an)*r*.6,iy+Math.sin(an)*r*.6);ctx.lineTo(ix+Math.cos(an)*r,iy+Math.sin(an)*r);ctx.stroke()}
    ctx.fillStyle=`rgba(90,80,70,${1-k})`;for(let i=0;i<4;i++){ball([ix+(i-1.5)*5*sc*k,iy-Math.sin(k*Math.PI)*8*sc+i],1.4*sc);ctx.fill()}ctx.restore()}}

// ------------------------------------------------------------------ SEGUGIO INFERNALE
const HC={fur:'#302328',furD:'#1f161a',furF:'#170f12',hi:'#4a3740',spike:'#9e2523',ember:'#ff7a2a',eye:'#ff3b2f',horn:'#c4b391',bone:'#e6dcc0',maw:'#4a0a0e',rib:'#604850'};
function flame(e,t,s){s=s||1;shine('255,120,40',e[0],e[1]-2*s,8*s,.55+.12*Math.sin(t*14));ink(1.2);ctx.fillStyle=HC.ember;ctx.beginPath();ctx.moveTo(e[0]-2.4*s,e[1]+1);ctx.quadraticCurveTo(e[0]-1.8*s,e[1]-3.6*s,e[0]+Math.sin(t*12)*1.2*s,e[1]-6.4*s);ctx.quadraticCurveTo(e[0]+2*s,e[1]-3.4*s,e[0]+2.4*s,e[1]+1);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#ffe28a';ball([e[0],e[1]-1.3*s],s);ctx.fill()}
function crack(q,t){const gl=.65+.35*Math.sin(t*4);ctx.strokeStyle=`rgba(255,${130+60*gl|0},50,${.7*gl+.3})`;ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(q[0]-1.6,q[1]-2.6);ctx.lineTo(q[0]+.6,q[1]-.4);ctx.lineTo(q[0]-.8,q[1]+2.2);ctx.stroke();shine('255,110,40',q[0],q[1],5,.2*gl)}
// head: skull, snout with fangs, eyes, ears and horns, each piece put in front of or behind the skull by where it faces
function houndHead(V0,Hc,jaw,ph){const{P,F,c}=V0,t=G.t,h=P(Hc),R=5.6,items=[];
  const skull=()=>{ink(2.4);ball(h,R);ctx.fillStyle=HC.fur;ctx.fill();ctx.stroke();ctx.save();ball(h,R-1);ctx.clip();ctx.fillStyle=HC.furD;ell(h[0]+R*.35,h[1]+R*.7,R*1.1,R*.6);ctx.fill();
    for(const d of[[-.6,.6,.5],[-.7,-.55,.45],[-.2,0,1]])on(V0,Hc,R*.95,d,-.1,q=>{ctx.fillStyle=HC.furD;ell(q[0],q[1],1.7,1.1);ctx.fill()});
    ctx.fillStyle=HC.hi;ell(h[0]-1.6,h[1]-2.2,3,1.7);ctx.fill();glowTop(h,R,.12);ctx.restore();rim(h,R,h,R,.3)};
  const eye=sd=>on(V0,Hc,R*.92,[.62,sd*.5,.5],0,(q,v)=>{shine('255,60,40',q[0],q[1],5.2,.55+.1*Math.sin(t*5));ctx.fillStyle=HC.eye;ctx.beginPath();ctx.ellipse(q[0],q[1],1.9*Math.max(.5,v),1.05,sd*.35*c,0,TAU);ctx.fill();ctx.fillStyle='#ffe28a';ball(q,.55);ctx.fill();ctx.fillStyle='#ffffff';ball([q[0]-.55*Math.max(.5,v),q[1]-.35],.3);ctx.fill()});
  const u0=add(Hc,[2.8,0,-1.6]),u1=add(Hc,[8.4,0,-2.6]),l0=add(Hc,[2.4,0,-3.2]),l1=add(Hc,[7.6,0,-3.8-jaw*3]),show=F(1,0,-.2)>-.25;
  const snout=()=>{const A=P(u0),B=P(u1),Cq=P(l0),E=P(l1);
    if(jaw>.25&&show){ctx.fillStyle=HC.maw;ctx.beginPath();for(const q of[A,B,E,Cq])ctx.lineTo(q[0],q[1]);ctx.closePath();ctx.fill()}
    ink(2.2);hull(Cq,2.2,E,1.5);ctx.fillStyle=HC.furD;ctx.fill();ctx.stroke();
    if(show){ctx.fillStyle=HC.bone;ink(.8);for(const sd of[-1,1])for(let i=0;i<3;i++){const b=lerp3(add(l0,[.4,sd*1.2,1.3]),add(l1,[0,sd*.7,1]),.3+i*.3),q=P(b),e=P(add(b,[0,0,1.4+jaw*.6]));tri(q[0],q[1],e[0],e[1],.7)}}
    ink(2.2);hull(A,2.7,B,1.9);ctx.fillStyle=HC.fur;ctx.fill();ctx.stroke();ctx.save();hull(A,1.6,B,.9);ctx.clip();ctx.fillStyle=HC.furD;ell((A[0]+B[0])/2+1,(A[1]+B[1])/2+1.6,3.6,1.6);ctx.fill();ctx.restore();rim(A,2.7,B,1.9,.3);
    if(show){ctx.fillStyle=HC.bone;ink(.8);for(const sd of[-1,1])for(let i=0;i<4;i++){const b=lerp3(add(u0,[.6,sd*1.7,-1.8]),add(u1,[0,sd*1,-1.3]),i/3),q=P(b),e=P(add(b,[0,0,-(i===2?2.8:1.5)-jaw*.6]));tri(q[0],q[1],e[0],e[1],.8)}}
    ctx.fillStyle=INK;ball(P(add(u1,[.8,0,.9])),1.1);ctx.fill();
    if(jaw>.3&&show){const dr=(ph/TAU*2)%1,q=P(add(l1,[0,0,-.8]));ctx.strokeStyle='rgba(255,170,120,.6)';ctx.lineWidth=.9;seg(q,[q[0],q[1]+2+dr*4]);ctx.stroke()}};
  const ear=sd=>{const b1=P(add(Hc,mul(nrm([-.3,sd*.55,.75]),R*.9))),b2=P(add(Hc,mul(nrm([-.7,sd*.35,.65]),R*.9))),tp=P(add(Hc,[-3.4,sd*4.2,7]));ink(1.6);ctx.fillStyle=HC.furD;ctx.beginPath();ctx.moveTo(b1[0],b1[1]);ctx.lineTo(tp[0],tp[1]);ctx.lineTo(b2[0],b2[1]);ctx.fill();ctx.stroke();
    const m=[(b1[0]+b2[0])/2,(b1[1]+b2[1])/2];ctx.fillStyle='rgba(120,40,46,.55)';ctx.beginPath();ctx.moveTo(lerp(m[0],b1[0],.45),lerp(m[1],b1[1],.45));ctx.lineTo(lerp(m[0],tp[0],.7),lerp(m[1],tp[1],.7));ctx.lineTo(lerp(m[0],b2[0],.45),lerp(m[1],b2[1],.45));ctx.closePath();ctx.fill()};
  const horn=sd=>{const hp=[add(Hc,mul(nrm([-.2,sd*.6,.8]),R*.85)),add(Hc,[-2.8,sd*4.3,6.4]),add(Hc,[-5.4,sd*4.7,6]),add(Hc,[-7.2,sd*4.3,4.4])].map(q=>P(q));limb(hp,[2.2,1.5,.8],HC.horn);shadeLimb(hp,[1.1,.75,.4,.4],'rgba(120,96,60,.55)',.3)};
  items.push({d:0,f:skull},{d:F(1,0,-.3)*6,f:snout});
  for(const sd of[-1,1])items.push({d:F(-.4,sd*.75,.5)*6,f:()=>ear(sd)},{d:F(-.5,sd*.85,.4)*6+.01,f:()=>horn(sd)},{d:Math.max(.02,F(.62,sd*.5,.5)*6),f:()=>eye(sd)});
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
    parts.push({d:dB-100+D(base)*.01,f:()=>{const lp=[P(base),P(kn),P(j2),P(pw)],lw=fr?[3.8,2.8,2.2]:[4.6,3,2.2];limb(lp,lw,col,()=>{const q=P(pw);ink(1.4);ctx.fillStyle=HC.furD;ctx.beginPath();ctx.ellipse(q[0],q[1],2.3,1.5,0,0,TAU);ctx.fill();ctx.stroke();
      ctx.fillStyle=wa(.18);ell(q[0]-.7,q[1]-.5,1,.5);ctx.fill();ctx.strokeStyle=HC.bone;ctx.lineWidth=1;for(let i=-1;i<=1;i++){seg(P(add(pw,[1.2,i*.8,-.2])),P(add(pw,[2.6,i*1.1,-.8])));ctx.stroke()}});shadeLimb(lp,lw.map(w=>w/2).concat([1.1]),'rgba(0,0,0,.3)',.16)}})}
  // tail: bony with spikes, ending in a flame; in front of the body only when it points at the camera
  {const w=gal?Math.sin(ph-1.2)*2.4:Math.sin(ph)*2+wig*3,r0=add(R,[-4.6,0,2.2]),r1=add(R,[-8.6,w*.45,2.2]),r2=add(R,[-11.4,w,.2]);
    parts.push({d:dB+(F(-1,0,.3)>.3?50:-50),f:()=>{limb([P(r0),P(r1),P(r2)],[2.8,2],HC.fur);shadeLimb([P(r0),P(r1),P(r2)],[1.4,1],'rgba(0,0,0,.3)',.16);
      for(let i=1;i<3;i++){const b=lerp3(r0,r1,i/2.5),q=P(b),e=P(add(b,[-.6,0,2]));ctx.fillStyle=HC.spike;ink(1);spike(q,e,1)}flame(P(r2),t,.8)}})}
  // body: rump + ribcage, ribs on the flank that faces us, glowing cracks, spikes along the spine, smoke
  parts.push({d:dB,f:()=>{const a=P(R),b=P(C);ink(2.4);hull(a,6,b,7.2);ctx.fillStyle=HC.fur;ctx.fill();ctx.stroke();
    ctx.save();hull(a,4.9,b,6.1);ctx.clip();ctx.fillStyle=HC.furD;ell(a[0]+3,a[1]+4,7,4.6);ctx.fill();ell(b[0]+3.4,b[1]+4.4,7.6,4.8);ctx.fill();ctx.fillStyle=HC.hi;ell(b[0]-2.4,b[1]-3.6,4,2);ctx.fill();ell(a[0]-2,a[1]-3.4,3.2,1.6);ctx.fill();
    const rx=a[0]-b[0],ry=a[1]-b[1],rl=Math.hypot(rx,ry)||1;
    for(const sd of[-1,1])for(let i=0;i<4;i++)on(V0,C,6.9,[-.1-i*.24,sd,-.05],.12,q=>{ctx.strokeStyle=HC.rib;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(q[0],q[1]-4);ctx.quadraticCurveTo(q[0]+rx/rl*2.2,q[1],q[0],q[1]+3.8);ctx.stroke()});
    for(const sd of[-1,1]){on(V0,C,6.9,[.3,sd*.8,.4],.1,q=>crack(q,t));on(V0,R,5.9,[-.2,sd*.85,.35],.1,q=>crack(q,t))}
    on(V0,lerp3(R,C,.5),6.6,[-.15,0,1],-.4,q=>{ctx.fillStyle=wa(.1);ell(q[0],q[1]-1,8,3.2);ctx.fill()});
    ctx.lineCap='round';for(const sd of[-1,1])for(const[C0,r0,d] of[[C,6.9,[.55,sd*.75,-.25]],[C,6.9,[.2,sd*.85,-.45]],[R,5.9,[-.5,sd*.8,-.2]],[R,5.9,[-.1,sd*.9,-.4]],[C,6.9,[.75,sd*.45,.45]]])on(V0,C0,r0,d,.1,q=>{ctx.strokeStyle=HC.furD;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(q[0]-1.4,q[1]-1.2);ctx.quadraticCurveTo(q[0]+.2,q[1]-.4,q[0]+.4,q[1]+1.4);ctx.moveTo(q[0]+.6,q[1]-1.4);ctx.quadraticCurveTo(q[0]+1.8,q[1]-.6,q[0]+2,q[1]+1);ctx.stroke()});
    for(const d of[[-.35,.3,.9],[.25,-.3,.9],[-.8,-.2,.6]])on(V0,lerp3(R,C,.5),6.5,d,0,q=>{ctx.strokeStyle=HC.hi;ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(q[0]-1.2,q[1]+.6);ctx.quadraticCurveTo(q[0],q[1]-.6,q[0]+1.3,q[1]+.4);ctx.stroke()});
    ctx.restore();rim(a,6,b,7.2,.3);
    for(let i=0;i<6;i++){const u=i/5,q3=add(lerp3(R,C,u),[0,0,lerp(5.2,6.4,u)]),tp=add(q3,[-1.2,0,2.8+(i%2)*1.2+(i===5?.6:0)]);ctx.fillStyle=HC.spike;ink(1.3);spike(P(q3),P(tp),1.7)}
    if(!LOWFX)for(let i=0;i<3;i++){const k=(p*(gal?2:1)+i/3)%1,sp=P(add(lerp3(R,C,i/2),[0,0,9]));ctx.fillStyle=`rgba(60,50,55,${.35*(1-k)})`;ball([sp[0]+Math.sin(ph+i*2)*2,sp[1]-k*12],1.6+k*3);ctx.fill()}}});
  // neck (with hackles) and head, drawn together: behind the body when the head is turned away
  parts.push({d:D(Hc),f:()=>{const n0=add(C,[3.2,0,3.4]),n1=add(Hc,[-2.2,0,-1.8]),A=P(n0);ink(2.4);hull(A,4.4,P(n1),3.6);ctx.fillStyle=HC.fur;ctx.fill();ctx.stroke();ball(A,5.7);ctx.fill();rim(A,4.4,P(n1),3.6,.26);
    for(let i=0;i<2;i++){const q3=add(lerp3(n0,n1,.3+i*.35),[0,0,3.4]),tp=add(q3,[-1.6,0,3.8]);ctx.fillStyle=HC.spike;ink(1.3);spike(P(q3),P(tp),1.8)}
    houndHead(V0,Hc,jaw,ph)}});
  run(parts);ctx.restore()}

// ------------------------------------------------------------------ BOSS: IL BECCHINO
const BC={skin:'#7d9a62',skinD:'#5d7848',skinF:'#4e6639',coat:'#2e2638',coatD:'#1e1826',coatF:'#211b2a',coatL:'#463a56',hat:'#1f1a24',band:'#6a1e28',
  metal:'#8a96a2',metalD:'#5f6a76',wood:'#6b4a2a',woodD:'#4a321c',bone:'#e6dcc0',hole:'#0e140c',glow:'150,255,110',chain:'#7a7f86',boot:'#1b1714',patch:'#6b5a3a'};
// the gravedigger's shovel: wooden handle with a T grip, an iron blade whose face shades as it turns
function shovel(V0,k){const{P,F}=V0,g=add(k.hd,mul(k.dir,-6)),gg=P(g),b0=P(k.b0);
  ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=5.8;seg(gg,b0);ctx.stroke();ctx.strokeStyle=BC.wood;ctx.lineWidth=3.2;ctx.stroke();
  {let dx=b0[0]-gg[0],dy=b0[1]-gg[1];const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;let nx=-dy,ny=dx;if(nx+ny>0){nx=-nx;ny=-ny}ctx.strokeStyle=BC.woodD;ctx.lineWidth=1.2;seg([gg[0]-nx*.9,gg[1]-ny*.9],[b0[0]-nx*.9,b0[1]-ny*.9]);ctx.stroke();
    ctx.strokeStyle=wa(.3);ctx.lineWidth=.7;seg([gg[0]+nx*.8,gg[1]+ny*.8],[b0[0]+nx*.8,b0[1]+ny*.8]);ctx.stroke()}
  const t1=P(add(g,mul(k.w3,2.8))),t2=P(add(g,mul(k.w3,-2.8)));ctx.strokeStyle=INK;ctx.lineWidth=5.2;seg(t1,t2);ctx.stroke();ctx.strokeStyle=BC.woodD;ctx.lineWidth=2.6;ctx.stroke();
  const n=cross(k.dir,k.w3),col=mix(BC.metal,BC.metalD,cl(.5-F(n)*.9,0,1)),c=[add(k.b0,mul(k.w3,2.8)),add(k.b1,mul(k.w3,4.2)),add(k.b1,mul(k.dir,4.8)),add(k.b1,mul(k.w3,-4.2)),add(k.b0,mul(k.w3,-2.8))].map(q=>P(q));
  ink(2);ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(c[0][0],c[0][1]);ctx.lineTo(c[1][0],c[1][1]);ctx.quadraticCurveTo(c[2][0],c[2][1],c[3][0],c[3][1]);ctx.lineTo(c[4][0],c[4][1]);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.save();ctx.clip();ctx.strokeStyle=wa(.32);ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(c[0][0],c[0][1]);ctx.lineTo(c[1][0],c[1][1]);ctx.quadraticCurveTo(c[2][0],c[2][1],c[3][0],c[3][1]);ctx.stroke();ctx.restore();
  const fv=cl(Math.abs(F(n))*3,0,1);if(fv>0){ctx.save();ctx.globalAlpha=fv;ctx.fillStyle='rgba(110,40,30,.6)';ball(P(add(add(k.b1,mul(k.w3,1.6)),mul(k.dir,-1.5))),1.6);ctx.fill();ball(P(add(add(k.b1,mul(k.w3,-1.8)),mul(k.dir,-4))),1.1);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.28)';ball(P(add(add(k.b0,mul(k.w3,1.2)),mul(k.dir,2.4))),1.2);ctx.fill();ctx.restore()}
  ink(1.6);ctx.fillStyle=BC.metalD;ball(b0,2.2);ctx.fill();ctx.stroke()}
// chains: hanging across the top of the chest at the front (above the open belly), crossing the back diagonally
function chain(V0,Pv,rP,Ch,rC){const{P,F}=V0;ctx.lineWidth=1.2;ctx.strokeStyle=INK;
  for(let i=0;i<=20;i++){const u=i/20,front=u<=.5,w=front?u*2:(u-.5)*2,m=front?0:.85-w*.85,C=lerp3(Ch,Pv,m),r=lerp(rC,rP,m),
    d=front?nrm([.8,lerp(-.8,.8,w),.5-Math.sin(w*Math.PI)*.22]):nrm([-.85,lerp(.8,-.85,w),.15]),v=F(d);if(v<.05)continue;const q=P(add(C,mul(d,r*1.01)));
    ctx.save();ctx.globalAlpha=cl((v-.05)*4,0,1);ctx.fillStyle=BC.chain;ctx.beginPath();ctx.ellipse(q[0],q[1],1.9,1.2,.6,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='rgba(255,250,235,.45)';ball([q[0]-.6,q[1]-.4],.45);ctx.fill();ctx.restore()}}
// head: small for that body, one huge glowing eye, mouth stitched wide with jagged teeth, battered top hat tilted toward his left
function bHead(V0,Hc,R,ph,op){const{P,c}=V0,h=P(Hc),t=G.t,at=R*.95;ink(2.4);ball(h,R);ctx.fillStyle=BC.skin;ctx.fill();ctx.stroke();
  const lit=[];ctx.save();ball(h,R-1.1);ctx.clip();ctx.fillStyle=BC.skinD;ell(h[0]+R*.3,h[1]+R*.74,R*1.15,R*.6);ctx.fill();
  for(const[d,sz] of[[[-.5,-.6,.6],.2],[[-.85,.35,.38],.2],[[.2,.8,.5],.15],[[.45,-.85,-.15],.16]])on(V0,Hc,at,d,-.15,q=>{ctx.fillStyle=BC.skinD;ell(q[0],q[1],R*sz,R*sz*.72);ctx.fill()});glowTop(h,R,.15);
  for(const sd of[-1,1])on(V0,Hc,at,[.8,sd*.42,.12],0,(q,v)=>{const big=sd>0?1.35:.85;ink(1.4);ctx.fillStyle='#0c120a';ctx.beginPath();ctx.ellipse(q[0],q[1],R*.3*big*Math.max(.45,v),R*.32*big,0,0,TAU);ctx.fill();ctx.stroke();lit.push([q,big,cl(v*4,0,1)])});
  ctx.restore();rim(h,R,h,R);
  for(const[q,big,k] of lit){const e=[q[0]+c*.3,q[1]],er=1.1*big*k;shine(BC.glow,q[0],q[1],6.6*big,(.55+.15*Math.sin(t*4))*k);ctx.fillStyle='#d6ff9a';ball(e,er);ctx.fill();ctx.fillStyle='#ffffff';ball([e[0]-er*.35,e[1]-er*.35],er*.4);ctx.fill()}
  on(V0,Hc,at,[.8,0,-.45],.04,(q,v)=>{const w=R*.62*Math.max(.35,v),hh=1.4+op*2.6;ink(1.5);ctx.fillStyle='#200808';ctx.beginPath();ctx.ellipse(q[0],q[1]+hh*.3,w,hh,0,0,TAU);ctx.fill();ctx.stroke();
    ctx.fillStyle=BC.bone;ink(.8);for(let i=0;i<5;i++){const xx=q[0]-w*.8+i*w*.4;tri(xx,q[1]-hh*.6,xx,q[1]-hh*.6+(i%2?2.2:1.4),.8)}
    ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.beginPath();for(let i=0;i<4;i++){const xx=q[0]-w*.7+i*w*.47;ctx.moveTo(xx,q[1]-hh-1.2);ctx.lineTo(xx+.4,q[1]+hh*1.2+1)}ctx.stroke()});
  const ax=P(nrm([.08,-.2,1])),tilt=Math.atan2(ax[0],-ax[1]),hb=P(add(Hc,[-.4,0,R-2.2]));
  ctx.save();ctx.translate(hb[0],hb[1]);ctx.rotate(tilt);ink(2.2);ctx.fillStyle=BC.hat;ell(0,0,10.5,3.1);ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.moveTo(-6.4,-.6);ctx.lineTo(-5.6,-12);ctx.lineTo(1,-13.4);ctx.lineTo(6,-11.4);ctx.lineTo(6.4,-.6);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle=BC.band;ctx.beginPath();ctx.moveTo(-6.2,-4.4);ctx.lineTo(6.3,-4.4);ctx.lineTo(6.3,-1.6);ctx.lineTo(-6.3,-1.6);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.strokeStyle=INK;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(2,-13);ctx.lineTo(3.4,-9.6);ctx.lineTo(1.6,-7.4);ctx.stroke();ctx.fillStyle='rgba(255,255,255,.1)';ctx.fillRect(-4.6,-11,2,6);
  ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.moveTo(2.6,-.8);ctx.lineTo(3.2,-12.2);ctx.lineTo(6,-11.4);ctx.lineTo(6.4,-.6);ctx.closePath();ctx.fill();
  ctx.strokeStyle=wa(.3);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-5,-1.2);ctx.lineTo(-4.4,-11);ctx.stroke();ctx.beginPath();ctx.ellipse(0,0,9.2,2.2,0,Math.PI*1.05,Math.PI*1.55);ctx.stroke();ctx.restore()}
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
    parts.push({d:dT-100+D(hip)*.01,f:()=>leg(V0,hip,foot,{L1:4.4,L2:4.4,w1:7,w2:6.2,col:mix(BC.coatD,'#120e17',k),colD:'rgba(0,0,0,.3)',shoe:BC.boot,heel:2,toe:3.6,sr:3.2,ank:2.2})})}
  parts.push({d:dT,f:()=>{trunk(V0,Pv,12.2,Ch,12.8,BC.coat,BC.coatD,11,{folds:[-1.2,-.55,.55,1.2,2.3,3,3.7],neck:1});
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
    parts.push({d:D(add(sh,[6,0,0])),f:()=>{const r=zArm(V0,sh,hd,nrm([-.4,-.6,-1+armUp*1.4]),{side:-1,L1:8.6,L2:8.6,w1:7,w2:6,hand:3.8,full:true,skin:mix(BC.skin,BC.skinF,k),cloth:mix(BC.coat,BC.coatF,k),clothD:'rgba(0,0,0,.32)',pd:nrm(lerp3([1,0,-1],[.2,0,1],armUp))});
      if(armUp>.3){const q=P(r.h);shine(BC.glow,q[0],q[1],10,.5*armUp)}}})}
  // shovel arm (right): arm and shovel swing in a plane beside the head
  {const sh=add(Ch,[0,11.4,3]),k=farK(F(0,1,0)),skin=mix(BC.skin,BC.skinF,k),cloth=mix(BC.coat,BC.coatF,k);
    parts.push({d:D(add(Ch,[4,13.6,0])),f:()=>{const tool=()=>shovel(V0,sv),arm=()=>zArm(V0,sh,sv.hd,nrm([-.4,.5,-1]),{side:1,L1:8.6,L2:8.6,w1:7,w2:6,noHand:true,full:true,skin,cloth,clothD:'rgba(0,0,0,.32)'});
      if(F(0,1,0)>0){arm();tool()}else{tool();arm()}fist(V0,sv.hd,3.8,skin);const fq=P(sv.hd);ctx.save();ball(fq,2.7);ctx.clip();glowTop(fq,3.8,.22);ctx.restore()}})}
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

// ------------------------------------------------------------------ ZOMBIE DELLA LANTERNA: a big hunched ghoul in a mossy hooded cloak, swinging a lantern on a staff
const LC={cloak:'#4b3a2b',cloakD:'#33271d',cloakF:'#2b2118',cloakL:'#6e5743',inside:'#1a130e',moss:'#6f8b3a',mossD:'#4c6427',mossL:'#9ab556',
  skin:'#9fb87e',skinD:'#7a9460',skinF:'#66804f',eye:'#f6ff9c',mouth:'#2e0b0b',tongue:'#c0393f',tongueD:'#7d2026',tooth:'#efe6cc',
  key:'#b07a40',wood:'#5e432a',woodD:'#3d2b19',iron:'#3c3c44',ironD:'#24242b',light:'#f2ff8a',glow:'225,255,120',
  wrap:'#43362c',wrapF:'#29221b',band:'#6a5846',foot:'#2f2621',claw:'#1d1814',twig:'#4a3727',leaf:'#7d9c3c'};
// 2D convex outline of a set of points (for the cloak: chest, pelvis and hem in one sack)
function hull2(pts){pts=pts.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]),lo=[],up=[];
  for(const q of pts){while(lo.length>1&&cr(lo[lo.length-2],lo[lo.length-1],q)<=0)lo.pop();lo.push(q)}
  for(let i=pts.length-1;i>=0;i--){const q=pts[i];while(up.length>1&&cr(up[up.length-2],up[up.length-1],q)<=0)up.pop();up.push(q)}
  lo.pop();up.pop();return lo.concat(up)}
// a patch of moss with a few drips
function mossBlob(q,s,ph){ctx.save();ctx.fillStyle=LC.mossD;for(const[dx,dy,r] of[[-1.5,.5,1.8],[1.2,.2,2],[0,1,1.6]]){ball([q[0]+dx*s,q[1]+dy*s],r*s);ctx.fill()}
  ctx.fillStyle=LC.moss;for(const[dx,dy,r] of[[-1.5,0,1.7],[1.2,-.4,1.9],[0,.5,1.5]]){ball([q[0]+dx*s,q[1]+dy*s],r*s);ctx.fill()}
  ctx.strokeStyle=LC.moss;ctx.lineCap='round';ctx.lineWidth=1.2*s;for(const[dx,l] of[[-1.1,2.4],[1.5,1.6],[.3,1.1]]){seg([q[0]+dx*s,q[1]+1.2*s],[q[0]+dx*s,q[1]+(1.2+l+Math.sin(ph+dx)*.3)*s]);ctx.stroke()}
  ctx.fillStyle=LC.mossL;ball([q[0]-1.6*s,q[1]-.6*s],.7*s);ctx.fill();ball([q[0]+1*s,q[1]-1*s],.5*s);ctx.fill();ctx.restore()}
// the cloak: one sack from the shoulders to the knees, torn strips under the hem, folds, holes showing the skin, moss, the rusty key.
// Strips, folds, holes and moss sit at fixed places on the body in 3D, so they turn with it.
function lCloak(V0,Pv,rP,Ch,rC,Hm,rH,ph){const{P,F}=V0,a=P(Pv),b=P(Ch),hm=P(Hm),pts=[],hem=an=>add(Hm,[Math.cos(an)*rH,Math.sin(an)*rH,Math.cos(an)*3.4]);
  for(let i=0;i<24;i++){const an=i/24*TAU,c=Math.cos(an),s=Math.sin(an);pts.push([a[0]+c*rP,a[1]+s*rP],[b[0]+c*rC,b[1]+s*rC],P(hem(an)))}
  const H=hull2(pts),path=()=>{ctx.beginPath();for(const q of H)ctx.lineTo(q[0],q[1]);ctx.closePath()};
  for(let i=0;i<16;i++){const an=i/16*TAU+.15,d=[Math.cos(an),Math.sin(an),0],v=F(d);if(v<-.35)continue;const L=1.8+((i*5)%4)*.7+Math.sin(ph+i*1.3)*.3,
    base=add(hem(an),mul(d,-rH*.06)),tp=add(base,[d[0]*.9,d[1]*.9,-L]);ctx.fillStyle=v<.1?LC.cloakD:LC.cloak;ink(1.8);spike(P(add(base,[0,0,1.4])),P(tp),1.6)}
  ink(2.4);path();ctx.fillStyle=LC.cloak;ctx.fill();ctx.stroke();
  ctx.save();path();ctx.clip();
  ctx.fillStyle=LC.cloakD;ell(hm[0]+rH*.55,hm[1]+rH*.1,rH*.75,rH);ctx.fill();ell(b[0]+rC*.8,b[1]+rC*.3,rC*.55,rC*.9);ctx.fill();
  ctx.fillStyle='rgba(255,240,210,.07)';ell(b[0]-rC*.4,b[1]-rC*.45,rC*.5,rC*.3);ctx.fill();
  on(V0,lerp3(Pv,Ch,.6),lerp(rP,rC,.6),[-.75,0,.65],-.2,q=>{ctx.fillStyle='rgba(255,236,200,.1)';ell(q[0],q[1],rC*.75,rC*.42);ctx.fill()});
  ctx.strokeStyle='rgba(20,14,10,.42)';ctx.lineWidth=1.2;for(const an of[-1,-.4,.2,.8,2.5,3.1,3.7]){const d=[Math.cos(an),Math.sin(an),0];if(F(d)<.12)continue;
    const p0=P(add(Ch,mul(nrm([d[0],d[1],-.25]),rC*.9))),p1=P(add(hem(an),mul(d,-rH*.03)));ctx.beginPath();ctx.moveTo(p0[0],p0[1]);ctx.quadraticCurveTo((p0[0]+p1[0])/2+1,(p0[1]+p1[1])/2,p1[0],p1[1]);ctx.stroke()}
  for(const[C0,r0,d] of[[Pv,rP,[.25,.97,-.05]],[Ch,rC,[-.35,-.9,-.3]]])on(V0,C0,r0,d,.12,(q,v)=>{const w=2.6*Math.max(.45,v);ink(1.4);ctx.fillStyle=LC.skin;ctx.beginPath();
    for(let i=0;i<10;i++){const an=i/10*TAU,r=[1,.82,.95,.7,1,.84,.9,.74,1,.86][i];ctx.lineTo(q[0]+Math.cos(an)*w*r,q[1]+Math.sin(an)*3*r)}ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle=LC.skinD;ell(q[0]+w*.3,q[1]+1,w*.5,1.2);ctx.fill()});
  for(const[C0,r0,d,s] of[[Ch,rC,[.2,-.7,.7],1.2],[Ch,rC,[-.6,.55,.6],1],[Hm,rH,[.85,.45,.1],.9],[Hm,rH,[-.8,-.5,.1],.9]])on(V0,C0,r0,d,.05,q=>mossBlob(q,s,ph));
  ctx.restore();
  on(V0,Pv,rP,[.8,-.55,-.15],.05,q=>{const sw=Math.sin(ph*2)*.8,k=[q[0]+sw*1.3,q[1]+3];ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=1;seg(q,k);ctx.stroke();
    for(const pass of[0,1]){ctx.strokeStyle=pass?LC.key:INK;ctx.lineWidth=pass?1.3:2.9;ctx.beginPath();ctx.arc(k[0],k[1]+1.4,1.4,0,TAU);ctx.stroke();seg([k[0],k[1]+2.8],[k[0]+sw*.2,k[1]+6.6]);ctx.stroke();seg([k[0]+sw*.2,k[1]+5.4],[k[0]+sw*.2+1.6,k[1]+5.4]);ctx.stroke();seg([k[0]+sw*.2,k[1]+6.4],[k[0]+sw*.2+1.2,k[1]+6.4]);ctx.stroke()}})}
// the short cape over the shoulders, between the hood and the cloak: it gives him shoulders from every side and the arms come out under it
function lCape(V0,top,rT,ring,rR,ph){const{P,F}=V0,a=P(top),pts=[],rp=an=>add(ring,[Math.cos(an)*rR,Math.sin(an)*rR,Math.cos(an)*1.4]);
  for(let i=0;i<24;i++){const an=i/24*TAU;pts.push([a[0]+Math.cos(an)*rT,a[1]+Math.sin(an)*rT],P(rp(an)))}
  for(let i=0;i<18;i++){const an=i/18*TAU+.1,d=[Math.cos(an),Math.sin(an),0],v=F(d);if(v<-.3)continue;const base=rp(an),tp=add(base,[d[0]*1.2,d[1]*1.2,-(1.6+((i*3)%3)*.8+Math.sin(ph+i)*.25)]);
    ctx.fillStyle=v<.1?LC.cloakD:LC.cloak;ink(1.6);spike(P(add(base,[0,0,1])),P(tp),1.5)}
  const H=hull2(pts),path=()=>{ctx.beginPath();for(const q of H)ctx.lineTo(q[0],q[1]);ctx.closePath()};ink(2.4);path();ctx.fillStyle=LC.cloak;ctx.fill();ctx.stroke();
  ctx.save();path();ctx.clip();const r=P(ring);ctx.fillStyle=LC.cloakD;ell(r[0]+rR*.6,r[1]+rR*.25,rR*.6,rR*.5);ctx.fill();ctx.fillStyle='rgba(255,240,210,.08)';ell(r[0]-rR*.45,r[1]-rR*.35,rR*.5,rR*.25);ctx.fill();
  for(const[d,sz] of[[[-.4,-.75,.5],1],[[.3,.85,.4],.9]])on(V0,ring,rR*.95,d,0,q=>mossBlob(q,sz,ph));ctx.restore()}
// a dead twig sticking out of the point of the hood, two leaves hanging from it on threads
function twig(V0,tp,ph){const{P}=V0,s1=add(tp,[-1,.3,3.4]),s2=add(s1,[1.1,.5,3.2]),f1=add(s1,[-2.4,-.4,2]),sw=Math.sin(ph*2)*.5;
  limb([P(tp),P(s1),P(s2)],[1.6,1.2],LC.twig);limb([P(s1),P(f1)],[1],LC.twig);
  for(const[e,l] of[[s2,2.2],[f1,1.8]]){const q=P(e),lf=[q[0]+sw,q[1]+l];ctx.strokeStyle=INK;ctx.lineWidth=.8;seg(q,lf);ctx.stroke();ink(1);ctx.fillStyle=LC.leaf;ctx.beginPath();ctx.ellipse(lf[0],lf[1]+1.4,1,1.7,sw*.3,0,TAU);ctx.fill();ctx.stroke()}}
// the hood with the face inside. The hood is a ball of cloth with the front cut away (a cap around the direction n). From any angle:
// the part of the hood whose front surface is cut away shows the dark lining, the face sits in front of the lining, and the rest
// of the hood covers the top and the sides of the head. The lip of the opening goes behind the face on the far side and in front
// on the near side; the point of the hood (with its twig) goes behind or in front of the ball by where it faces.
function lHead(V0,Ho,Rh,Hf,Rf,ph,open,tsw){const{P,F,c,s}=V0,t=G.t,ho=P(Ho),n=nrm([1,0,-.2]),u=[0,1,0],w=nrm(cross(n,u)),CA=.47,SA=.883,
    cam=nrm([s,c,.55]),e1=nrm(cross(cam,[0,0,1])),e2=cross(cam,e1);
  const proj=d=>{const q=P(add(Ho,mul(d,Rh))),dx=q[0]-ho[0],dy=q[1]-ho[1],l=Math.hypot(dx,dy);return l>Rh?[ho[0]+dx/l*Rh,ho[1]+dy/l*Rh]:q};
  const rim=[];for(let i=0;i<40;i++){const th=i/40*TAU,d=add(mul(n,CA),add(mul(u,Math.cos(th)*SA),mul(w,Math.sin(th)*SA)));rim.push({q:proj(d),v:F(d),th})}
  const sil=[];for(let i=0;i<64;i++){const f=i/64*TAU,d=add(mul(e1,Math.cos(f)),mul(e2,Math.sin(f))),q=P(d),l=Math.hypot(q[0],q[1])||1;sil.push({q:[ho[0]+q[0]/l*Rh,ho[1]+q[1]/l*Rh],cap:dot(d,n)>CA})}
  const cp=rim.filter(r=>r.v>0).map(r=>r.q).concat(sil.filter(q=>q.cap).map(q=>q.q)),hole=cp.length>2?hull2(cp):null,showFace=!!hole&&F(n)>-.45;
  const lip=near=>{ctx.lineCap='round';for(const pass of[0,1])for(let i=0;i<rim.length;i++){const A=rim[i],B=rim[(i+1)%rim.length];if((A.v>0&&B.v>0)!==near||(near&&Math.sin(A.th)<-.45))continue;
    ctx.strokeStyle=pass?(near&&Math.sin(A.th)>.35?LC.cloakL:LC.cloakD):INK;ctx.lineWidth=pass?1.7:3.6;seg(A.q,B.q);ctx.stroke()}};
  const tb=add(Ho,mul(nrm([-.6,0,.8]),Rh*.7)),tp=add(Ho,[-Rh*1.25,Math.sin(ph)*.4,Rh*.62]),tipFront=F(-1,0,.3)>.2;
  const tip=()=>{ink(2.4);hull(P(tb),Rh*.42,P(tp),1.4);ctx.fillStyle=LC.cloak;ctx.fill();ctx.stroke();if(tipFront){ball(P(tb),Rh*.42+1.3);ctx.fill()}twig(V0,tp,ph)};
  if(!tipFront)tip();
  const mn=nrm([.86,0,-.42]),hv=mn[0]*s;
  if(showFace){ctx.fillStyle=LC.inside;ctx.beginPath();for(const q of hole)ctx.lineTo(q[0],q[1]);ctx.closePath();ctx.fill();lip(false);
    const h=P(Hf);ink(2.4);ball(h,Rf);ctx.fillStyle=LC.skin;ctx.fill();ctx.stroke();
    ctx.save();ball(h,Rf-1);ctx.clip();ctx.fillStyle=LC.skinD;ell(h[0]+Rf*.35,h[1]+Rf*.75,Rf*1.1,Rf*.6);ctx.fill();for(const[mx,my,mr] of[[-.45,.1,.22],[.4,-.2,.16],[-.1,.45,.13]]){ell(h[0]+Rf*mx,h[1]+Rf*my,Rf*mr,Rf*mr*.75);ctx.fill()}
    ctx.fillStyle='rgba(26,18,12,.35)';ell(h[0]-Rf*.2,h[1]-Rf*.9,Rf*1.2,Rf*.55);ctx.fill();ctx.restore();
    for(const sd of[-1,1])on(V0,Hf,Rf*.93,[.64,sd*.58,.24],0,(q,v)=>{const big=sd>0?1.18:.94,rx=Rf*.23*big*Math.max(.5,v),ry=Rf*.25*big;ctx.fillStyle=INK;ctx.beginPath();ctx.ellipse(q[0],q[1],rx+.9,ry+.9,0,0,TAU);ctx.fill();
      shine(LC.glow,q[0],q[1],Rf*.75*big,.55+.1*Math.sin(t*5+sd));ctx.fillStyle=LC.eye;ctx.beginPath();ctx.ellipse(q[0],q[1],rx,ry,0,0,TAU);ctx.fill();ctx.fillStyle='#ffffff';ball([q[0]-rx*.3,q[1]-ry*.35],ry*.25);ctx.fill()});
    if(hv>-.15){const q=P(add(Hf,mul(mn,Rf*.93))),v=Math.max(0,F(mn)),wd=Rf*.42*Math.max(.4,v,Math.abs(c)*.3),hh=Rf*.2+open*Rf*.22;ctx.save();ctx.globalAlpha=cl((hv+.15)*4,0,1);
      ink(1.6);ctx.fillStyle=LC.mouth;ctx.beginPath();ctx.ellipse(q[0],q[1]+hh*.3,wd,hh,0,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle=LC.tooth;ink(.8);
      for(let i=0;i<4;i++){const xx=q[0]-wd*.7+i*wd*.47;tri(xx,q[1]-hh*.55,xx,q[1]-hh*.55+1.6,.75)}ctx.restore()}}
  ctx.save();ctx.beginPath();ctx.arc(ho[0],ho[1],Rh,0,TAU);if(showFace){ctx.moveTo(hole[0][0],hole[0][1]);for(let i=1;i<hole.length;i++)ctx.lineTo(hole[i][0],hole[i][1]);ctx.closePath()}
  ctx.fillStyle=LC.cloak;ctx.fill('evenodd');ctx.clip('evenodd');ctx.fillStyle=LC.cloakD;ell(ho[0]+Rh*.45,ho[1]+Rh*.5,Rh*.9,Rh*.7);ctx.fill();ctx.fillStyle='rgba(255,240,210,.08)';ell(ho[0]-Rh*.4,ho[1]-Rh*.5,Rh*.45,Rh*.28);ctx.fill();
  for(const[d,sz] of[[[.15,-.45,.88],1.2],[[-.35,.5,.8],1],[[.45,.55,.7],.8]])on(V0,Ho,Rh*.98,d,-.1,q=>mossBlob(q,sz,ph));
  ctx.restore();ctx.strokeStyle=INK;ctx.lineWidth=2.4;ctx.lineCap='round';for(let i=0;i<sil.length;i++){const A=sil[i],B=sil[(i+1)%sil.length];if(showFace&&(A.cap||B.cap))continue;seg(A.q,B.q);ctx.stroke()}
  if(showFace)lip(true);
  if(tipFront)tip();
  if(showFace&&hv>-.15){const m0=add(Hf,add(mul(mn,Rf*.95),[0,0,-Rf*.12])),m1=add(m0,[1.1+open*.7,tsw,-3.2-open*1.2]),A=P(m0),B=P(m1);ctx.save();ctx.globalAlpha=cl((hv+.15)*4,0,1);
    ink(1.8);hull(A,1.3,B,1.9);ctx.fillStyle=LC.tongue;ctx.fill();ctx.stroke();ctx.strokeStyle=LC.tongueD;ctx.lineWidth=.9;seg([lerp(A[0],B[0],.2),lerp(A[1],B[1],.2)],[lerp(A[0],B[0],.85),lerp(A[1],B[1],.85)]);ctx.stroke();ctx.restore()}}
// a leg wrapped in rags, knee forward, big dark foot with three claws
function lLeg(V0,hip,foot,k){const{P}=V0,[kn,f]=ik(hip,add(foot,[0,0,2.1]),5.4,5.6,[1,0,.12]),col=mix(LC.wrap,LC.wrapF,k),Kq=P(kn),E=P(f);
  limb([P(hip),Kq,E],[5.8,5],col,()=>{ink(2.4);ctx.fillStyle=mix(LC.foot,'#000000',k*.4);hull(P(add(f,[-1.8,0,-.8])),2.9,P(add(f,[2.8,0,-1.1])),3.1);ctx.fill();ctx.stroke();
    ctx.lineCap='round';for(const pass of[0,1])for(let i=-1;i<=1;i++){ctx.strokeStyle=pass?LC.claw:INK;ctx.lineWidth=pass?1.3:3.1;seg(P(add(f,[3.6,i*1.5,-1.4])),P(add(f,[5.4,i*2,-2.2])));ctx.stroke()}});
  ctx.strokeStyle=mix(LC.band,LC.wrapF,k);ctx.lineWidth=1.2;for(const u of[.35,.62]){const q=[lerp(Kq[0],E[0],u),lerp(Kq[1],E[1],u)],dx=E[0]-Kq[0],dy=E[1]-Kq[1],l=Math.hypot(dx,dy)||1,nx=-dy/l*2.3,ny=dx/l*2.3;seg([q[0]-nx,q[1]-ny-.5],[q[0]+nx,q[1]+ny+.5]);ctx.stroke()}}
// the lantern: ring, roof, glowing glass with an iron cross, base; it hangs from the end of the staff and tilts with its chain
function lanternBody(q,rot,t,lit){shine(LC.glow,q[0],q[1],9+lit*6,(.5+.08*Math.sin(t*9))*(1+lit));ctx.save();ctx.translate(q[0],q[1]);ctx.rotate(rot);const w=2.6,h=3.2;
  ctx.lineJoin='round';ctx.strokeStyle=INK;ctx.lineWidth=1.7;ctx.beginPath();ctx.arc(0,-h-2.6,1.2,0,TAU);ctx.stroke();
  ink(1.6);ctx.fillStyle=LC.ironD;ctx.beginPath();ctx.moveTo(-w-.8,-h+.4);ctx.lineTo(-w*.4,-h-1.6);ctx.lineTo(w*.4,-h-1.6);ctx.lineTo(w+.8,-h+.4);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle=lit>.3?'#ffffff':LC.light;ctx.fillRect(-w,-h,w*2,h*2);ctx.strokeRect(-w,-h,w*2,h*2);
  ctx.strokeStyle=INK;ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(-w,-h);ctx.lineTo(w,h);ctx.moveTo(w,-h);ctx.lineTo(-w,h);ctx.stroke();
  ink(1.4);ctx.fillStyle=LC.ironD;ctx.fillRect(-w-.8,h,w*2+1.6,1.5);ctx.strokeRect(-w-.8,h,w*2+1.6,1.5);ctx.restore()}
// the staff: twisted wood with knots, the chain from its end to the lantern
function staffLantern(V0,k,Lc,t,lit){const{P}=V0,b0=P(k.butt),b1=P(k.tip),q=P(Lc),dx=b1[0]-b0[0],dy=b1[1]-b0[1],l=Math.hypot(dx,dy)||1;
  ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=5.6;seg(b0,b1);ctx.stroke();ctx.strokeStyle=LC.wood;ctx.lineWidth=3;ctx.stroke();
  ctx.strokeStyle=LC.woodD;ctx.lineWidth=1;for(let i=1;i<5;i++){const m=[lerp(b0[0],b1[0],i/5),lerp(b0[1],b1[1],i/5)],nx=-dy/l*1.3,ny=dx/l*1.3;seg([m[0]-nx,m[1]-ny],[m[0]+nx+dx/l*1.2,m[1]+ny+dy/l*1.2]);ctx.stroke()}
  const hx=q[0]-b1[0],hy=q[1]-b1[1],rot=Math.atan2(-hx,hy),ring=[q[0]+Math.sin(rot)*5.8,q[1]-Math.cos(rot)*5.8];ctx.strokeStyle=INK;ctx.lineWidth=1.3;seg(b1,ring);ctx.stroke();
  lanternBody(q,rot,t,lit)}
// the burst of light when the lantern hits the floor: a star, a ring on the floor, sparks
function lBurst(x,y,k,sc){const r=(4.5+k*13)*sc*.5,a=1-k;ctx.save();if(!LOWFX)glow(LC.glow,x,y,r*1.7,.85*a);
  ctx.strokeStyle=`rgba(200,255,120,${.7*a})`;ctx.lineWidth=2.4;ell(x,y+r*.5,r*1.3,r*.5);ctx.stroke();ctx.lineJoin='round';
  const star=(R,col,ln)=>{ctx.beginPath();for(let i=0;i<22;i++){const an=i/22*TAU+k*.6,rr=i%2?R*.42:R*(1-((i*7)%4)*.1);ctx.lineTo(x+Math.cos(an)*rr,y+Math.sin(an)*rr*.8)}ctx.closePath();ctx.fillStyle=col;ctx.fill();if(ln){ctx.strokeStyle=ln;ctx.lineWidth=1.6;ctx.stroke()}};
  star(r*1.25,`rgba(214,255,96,${.9*a})`,`rgba(110,160,30,${.8*a})`);star(r*.7,`rgba(255,255,220,${.95*a})`);
  if(!LOWFX)for(let i=0;i<9;i++){const an=i/9*TAU+.3,d=r*(1.15+k*.6),px=x+Math.cos(an)*d,py=y+Math.sin(an)*d*.7-Math.sin(k*Math.PI)*6*sc;ctx.fillStyle=`rgba(232,255,140,${a})`;ctx.beginPath();ctx.moveTo(px,py-2);ctx.lineTo(px+1.2,py);ctx.lineTo(px,py+2);ctx.lineTo(px-1.2,py);ctx.closePath();ctx.fill()}
  ctx.restore()}
function lanterna(x,y,face,anim,p,sc){sc=sc||1.55;const V0=V(face),{P,D,F}=V0,ph=p*TAU,walk=anim==='walk',atk=anim==='attack',t=G.t;
  // attack: .0-.24 leans back and swings the staff up behind his head, .24-.38 holds the lantern up high (it shakes),
  // .38-.48 smashes it down in front of him, .48-.7 the lantern bursts in green light on the floor, .7-1 straightens up
  let a=-.25+(walk?Math.sin(ph+.5)*.1:Math.sin(ph)*.04),lean=0,lunge=0,burst=-1,taut=0,shake=0;
  if(atk){if(p<.24){const k=ez(p/.24);a=-.25+k*2.7;lean=k;taut=k*.5}
    else if(p<.38){const k=(p-.24)/.14;a=2.45;lean=1;shake=Math.sin(k*Math.PI);taut=.5}
    else if(p<.48){const k=(p-.38)/.1;a=2.45-ez(k)*3.45;lean=1-k*1.6;lunge=k*4;taut=.5+k*.5}
    else if(p<.7){const k=(p-.48)/.22;a=-1;lean=-.6;lunge=4;burst=k;taut=1-k*.7}
    else{const k=ez((p-.7)/.3);a=lerp(-1,-.25,k);lean=-.6*(1-k);lunge=4*(1-k);taut=.3*(1-k)}}
  // walk: a heavy shamble with long strides; the body rocks, the lantern swings behind the staff
  const st=stepper(p,.56),fL=walk?st(0,4.4,2.4):NOSTEP,fR=walk?st(.5,4.4,2.4):NOSTEP,spread=walk?Math.abs(fL.x-fR.x)/8.8:0;
  const bob=walk?-spread*1.8:Math.sin(ph)*.5,roll=walk?-Math.sin(ph)*1.6:Math.sin(ph)*.4,L=lunge*.6,jit=shake*Math.sin(p*300)*.4;
  const Pv=[L-lean*1.5+jit,roll*.5,12+bob],Ch=[L+7-lean*4+jit,roll,19+bob+lean*2.2],Ho=add(Ch,[5-lean*1.6,roll*.3,5+lean*.8]),
    Hf=add(Ho,[5.2,Math.sin(ph*(walk?2:1)+.4)*.5,-2.4]),Hm=[L*.5-1.5-lean,roll*.3,8.4+bob*.5];
  // hand, staff and lantern for a staff angle; the lantern is never pushed through the floor
  const pose=a=>{const hd=add(Ch,[2.5+Math.cos(a)*4.6,10.2,-1+Math.sin(a)*7]),dir=nrm([Math.cos(a)*.95,.12,Math.sin(a)]);return{a,hd,dir,tip:add(hd,mul(dir,11.5)),butt:add(hd,mul(dir,-3.2))}};
  const sw=walk?Math.sin(ph*2-1.4)*.32:Math.sin(ph-1)*.1,lant=k=>add(k.tip,mul(nrm(lerp3([sw,sw*.25,-1],k.dir,taut)),5.4)),low=k=>Math.min(lant(k)[2]-3.4,k.tip[2]-1);
  let sv=pose(a);if(low(sv)<.2){let lo=a,hi=Math.PI/2;for(let i=0;i<22;i++){const m=(lo+hi)/2;if(low(pose(m))<.2)lo=m;else hi=m}sv=pose(hi)}
  const Lc=lant(sv),lit=burst>=0?Math.max(0,1-burst*2.5):0;
  {const q=P(L+1,0,0);shadow(x+q[0]*sc,y+q[1]*sc,14*sc,5.6*sc,.38)}
  // the lantern lights the floor under it
  if(!LOWFX){const q=P(Lc[0],Lc[1],0),k=cl(1-Lc[2]/30,0,1);ctx.save();ctx.globalCompositeOperation='lighter';glow(LC.glow,x+q[0]*sc,y+q[1]*sc,8*sc,(.24+.04*Math.sin(t*9))*k,3.8*sc);ctx.restore()}
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const parts=[],dT=D(Ch);
  for(const[sd,f] of[[-1,fL],[1,fR]]){const hip=add(Pv,[0,sd*4.4,-3.2]),foot=[L*.5+3+f.x,sd*5.4,f.z],k=farK(F(0,sd,0));
    parts.push({d:dT-100+D(hip)*.01,f:()=>lLeg(V0,hip,foot,k)})}
  parts.push({d:dT,f:()=>lCloak(V0,Pv,7,Ch,8,Hm,10,ph)});
  // left arm hangs long in front of him and swings, big claws
  {const sh=add(Ch,[1.5,-8,3.5]),s=walk?Math.sin(ph)*2.4:Math.sin(ph)*.6,hd=add(Ch,[7+s-lean*3,-9.6,-11.5+lean*5]),k=farK(F(0,-1,0));
    parts.push({d:Math.min(D(Ho)-.01,D(add(sh,[1.5,0,0]))),f:()=>zArm(V0,sh,hd,[-1,-.2,-.1],{side:-1,L1:7.6,L2:7.8,bony:1,w1:3.8,we:3.4,w2:2.5,hand:2.2,fl:6.6,skin:mix(LC.skin,LC.skinF,k),cloth:mix(LC.cloak,LC.cloakF,k),nail:LC.claw,pd:[.4,1,-.2],sleeve:5.2,sleeveK:.8})})}
  // right arm holds the staff. The hood hangs over both shoulders, so the arms always go under it; the staff, the lantern and the fist
  // swing in a plane beside the head and go in front of the hood on the near side
  {const sh=add(Ch,[1.5,8,3.5]),k=farK(F(0,1,0)),skin=mix(LC.skin,LC.skinF,k),kA=Math.min(D(Ho)-.01,D(add(sh,[4,2.5,0])));
    parts.push({d:kA,f:()=>zArm(V0,sh,sv.hd,nrm([-.4,.5,-1]),{side:1,L1:6.8,L2:6.8,bony:1,w1:3.8,we:3.4,w2:2.5,noHand:true,skin,cloth:mix(LC.cloak,LC.cloakF,k),sleeve:5.2,sleeveK:.8})});
    parts.push({d:Math.max(D(add(Ch,[4,10.5,0])),kA+.001),f:()=>{staffLantern(V0,sv,Lc,t,lit);fist(V0,sv.hd,2.6,skin)}})}
  // the cape is the outer layer: always over the cloak, under the hood when the hood is in front, over the hood's base when seen from behind
  parts.push({d:Math.max(dT+.001,D(Ho)-.005),f:()=>lCape(V0,add(Ho,[-1.5,0,-4.5]),6,add(Ch,[-.5,0,3]),10.5,ph)});
  parts.push({d:D(Ho),f:()=>lHead(V0,Ho,8.6,Hf,7,ph,atk&&p>.3&&p<.75?1:.4+.15*Math.sin(ph*2),Math.sin(ph*2+1)*.6)});
  run(parts);ctx.restore();
  if(burst>=0&&burst<1){const q=P(Lc[0],Lc[1],Math.max(1,Lc[2]));lBurst(x+q[0]*sc,y+q[1]*sc,burst,sc)}}

// ------------------------------------------------------------------ ZOMBIE SPAVENTAPASSERI: a scarecrow that came down off its post
// A burlap sack for a head (a sewn-on button eye, a torn hole that glows, a stitched grin), a floppy straw hat with a crow on its brim,
// a plaid shirt stuffed with straw, patched trousers, a rope belt. The crossbar of its post still runs through the sleeves, so the arms
// stay straight out and the bony hands hang from the cuffs. It hops stiffly and rocks like a puppet, the bar tilting with it.
// Its attack is a spinning top: it winds up, turns right round sweeping the bar about (the crow flies off, then lands again), then
// wobbles, dizzy. The spin turns the whole skeleton (the camera angle plus the spin), so every piece stays attached; the hat turns a
// little behind the body (its own camera, Vat), and the crow flies in the room's frame while it is off the hat.
const SC={sack:'#c9a46a',sackD:'#977645',straw:'#e9c45a',strawD:'#b98f2e',strawL:'#fff0a8',twine:'#e6d29c',
  hat:'#d8b14e',hatD:'#a07b28',band:'#b8372b',shirt:'#c0462f',shirtD:'#86301f',shirtF:'#6c2719',shirtL:'#de6a4c',
  pants:'#50708f',pantsF:'#2d4459',pantsD:'#37516b',patch:'#7f9c3e',patchD:'#566f2a',rope:'#b38d50',ropeD:'#6f5529',
  wood:'#7b5833',woodD:'#523a21',boot:'#3b2b1f',button:'#2b2328',buttonL:'#7a6e78',thread:'#2c1e14',hole:'#120c08',
  crow:'#34303f',crowD:'#1b1922',crowL:'#6f6c9c',beak:'#f2b13a',beakD:'#a8701a',crowEye:'#ffd23a'};
// the camera of a piece that turns on its own (the hat, the crow): facing ang, its origin drawn at the screen point o, at depth d0
function Vat(ang,o,d0){const v=V(ang);return{c:v.c,s:v.s,F:v.F,P:(x,y,z)=>{const q=v.P(x,y,z);return[q[0]+o[0],q[1]+o[1]]},D:(x,y,z)=>v.D(x,y,z)+d0}}
// a body point turned by the spin into the room's frame (V(face+a).P(b) is V(face).P(rz(b,a)))
const rz=(v,a)=>{const c=Math.cos(a),s=Math.sin(a);return[v[0]*c-v[1]*s,v[0]*s+v[1]*c,v[2]]};
const angTo=(a,b,k)=>a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*k;
// a tuft of straw: n strands from b3 along d3 (in 3D, so they shorten as it turns), fanned out sideways by spr; every outline first
function strawTuft(V0,b3,d3,n,L,spr,seed){const{P}=V0,d=nrm(d3);let side=cross(d,[0,0,1]);if(len(side)<.2)side=[0,1,0];side=nrm(side);const up=nrm(cross(side,d)),S=[];
  for(let i=0;i<n;i++){const r1=Math.sin(seed*12.9+i*78.2)*.5+.5,r2=Math.sin(seed*39.3+i*17.7)*.5+.5,f=n>1?i/(n-1)*2-1:0,
    dir=nrm(add(add(d,mul(side,f*spr+(r1-.5)*.35)),mul(up,(r2-.5)*.5))),l=L*(.7+r2*.55),a=add(b3,mul(side,f*.5)),e=add(a,mul(dir,l)),m=add(lerp3(a,e,.55),mul(up,(r1-.5)*.8));
    S.push([P(a),P(m),P(e),i%3])}
  const path=c=>{ctx.beginPath();for(const s of S)if(c<0||s[3]===c){ctx.moveTo(s[0][0],s[0][1]);ctx.quadraticCurveTo(s[1][0],s[1][1],s[2][0],s[2][1])}};
  ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=2.2;path(-1);ctx.stroke();
  ctx.lineWidth=1.05;for(let c=0;c<3&&c<n;c++){ctx.strokeStyle=c?(c===1?SC.straw:SC.strawD):SC.strawL;path(c);ctx.stroke()}}
// the crossbar of the post: a wooden pole with grain lines
function bar(V0,a3,b3,w){const A=V0.P(a3),B=V0.P(b3);limb([A,B],[w],SC.wood);shadeLimb([A,B],[w/2,w/2],'rgba(40,24,10,.45)',.22);
  const dx=B[0]-A[0],dy=B[1]-A[1],l=Math.hypot(dx,dy);if(l<1.5)return;const ux=dx/l,uy=dy/l;ctx.strokeStyle=SC.woodD;ctx.lineWidth=.7;
  for(const[o,u0,u1] of[[-.2,.1,.6],[.18,.4,.92]]){seg([A[0]+dx*u0-uy*w*o,A[1]+dy*u0+ux*w*o],[A[0]+dx*u1-uy*w*o,A[1]+dy*u1+ux*w*o]);ctx.stroke()}}
// rope wound round a tube (centre c3, axis ax, radius r), n turns gap apart: only the half of each turn that faces us shows, unless
// we look down the tube (then the whole turn is in front of it)
function ropeRings(V0,c3,ax,r,n,gap){const{P,F}=V0;ax=nrm(ax);let u=cross(ax,[0,0,1]);if(len(u)<.2)u=[1,0,0];u=nrm(u);const v=cross(ax,u),fa=Math.abs(F(ax)),turns=[];
  for(let i=0;i<n;i++){const c=add(c3,mul(ax,(i-(n-1)/2)*gap)),pts=[];for(let j=0;j<=20;j++){const th=j/20*TAU,nr=add(mul(u,Math.cos(th)),mul(v,Math.sin(th)));pts.push([P(add(c,mul(nr,r))),F(nr)>-fa*1.2-.02])}turns.push(pts)}
  ctx.lineCap='round';ctx.lineJoin='round';for(const pass of[0,1]){ctx.strokeStyle=pass?SC.rope:INK;ctx.lineWidth=pass?1:2.4;ctx.beginPath();
    for(const pts of turns){let on=false;for(let j=0;j<pts.length;j++){if(!pts[j][1]){on=false;continue}if(on)ctx.lineTo(pts[j][0][0],pts[j][0][1]);else{ctx.moveTo(pts[j][0][0],pts[j][0][1]);on=true}}}ctx.stroke()}}
// a flat round face across a tube (the dark inside of a cuff, the sawn end of the bar), centre c3, axis ax, radius r
function disc(V0,c3,ax,r,col,lw){const{P}=V0;ax=nrm(ax);let u=cross(ax,[0,0,1]);if(len(u)<.2)u=[1,0,0];u=nrm(u);const v=cross(ax,u);ctx.beginPath();
  for(let j=0;j<18;j++){const th=j/18*TAU,q=P(add(c3,add(mul(u,Math.cos(th)*r),mul(v,Math.sin(th)*r))));ctx.lineTo(q[0],q[1])}ctx.closePath();ctx.fillStyle=col;ctx.fill();if(lw){ink(lw);ctx.stroke()}}
// a little cartoon star (dizzy)
function starS(x,y,r,a){if(a<=0)return;ctx.save();ctx.globalAlpha=a;ink(1);ctx.fillStyle='#ffe066';ctx.beginPath();for(let i=0;i<10;i++){const an=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.45:r;ctx.lineTo(x+Math.cos(an)*rr,y+Math.sin(an)*rr)}
  ctx.closePath();ctx.fill();ctx.stroke();ctx.restore()}
// the shirt below the trunk's outline: plaid round and down the body, patched trousers from the waist down, a tear with straw in it,
// a patch on the back, the rope belt with its knot, straw poking out above the belt, the collar
function scBody(V0,Pv,rP,Ch,rC,ph){const{P,F}=V0,a=P(Pv),b=P(Ch),kW=.34,W=lerp3(Pv,Ch,kW),rw=lerp(rP,rC,kW)+.3,q=P(W),dark='rgba(70,16,10,.4)',light='rgba(255,214,170,.3)';
  ctx.save();hull(a,rP-.1,b,rC-.1);ctx.clip();ctx.lineCap='round';
  for(const k of[.45,.68,.9]){const Cz=lerp3(W,Ch,k),r=lerp(rw,rC,k),cq=P(Cz);ctx.strokeStyle=dark;ctx.lineWidth=2.1;ctx.beginPath();ctx.ellipse(cq[0],cq[1],r,r*.55,0,0,Math.PI);ctx.stroke();
    if(!LOWFX){ctx.strokeStyle=light;ctx.lineWidth=.6;ctx.beginPath();ctx.ellipse(cq[0],cq[1]+1.7,r,r*.55,0,0,Math.PI);ctx.stroke()}}
  for(let i=0;i<12;i++){const an=i/12*TAU+.25,d=[Math.cos(an),Math.sin(an),0],v=F(d);if(v<.05)continue;const dd=[Math.cos(an+.13),Math.sin(an+.13),0];ctx.globalAlpha=cl(v*3,0,1);
    ctx.strokeStyle=dark;ctx.lineWidth=2.1;seg(P(add(Ch,mul(nrm([d[0],d[1],.45]),rC*.97))),P(add(W,mul(d,rw))));ctx.stroke();
    if(!LOWFX){ctx.strokeStyle=light;ctx.lineWidth=.6;seg(P(add(Ch,mul(nrm([dd[0],dd[1],.45]),rC*.97))),P(add(W,mul(dd,rw))));ctx.stroke()}}
  ctx.globalAlpha=1;
  ctx.fillStyle=SC.pants;ctx.beginPath();ctx.ellipse(q[0],q[1],rw,rw*.55,0,0,Math.PI);ctx.lineTo(q[0]-rw-30,q[1]+40);ctx.lineTo(q[0]+rw+30,q[1]+40);ctx.closePath();ctx.fill();
  ctx.fillStyle=SC.pantsD;ell(a[0]+rP*.6,a[1]+rP*.6,rP*.9,rP*.7);ctx.fill();
  ctx.strokeStyle='rgba(12,22,36,.45)';ctx.lineWidth=1;for(const[d,dx] of[[[.85,-.45,-.45],1],[[.9,.3,-.4],-1]])on(V0,Pv,rP*.96,d,.1,k=>{ctx.beginPath();ctx.moveTo(k[0]-1.4,k[1]-1.4);ctx.quadraticCurveTo(k[0],k[1]-.2*dx,k[0]+1.2,k[1]+1.6);ctx.stroke()});
  on(V0,Pv,rP,[.62,.72,-.25],.08,(k,v)=>{const w=2.4*Math.max(.45,v);ink(1.1);ctx.fillStyle=SC.patch;ctx.fillRect(k[0]-w,k[1]-2,w*2,4);ctx.strokeRect(k[0]-w,k[1]-2,w*2,4);ctx.fillStyle=SC.patchD;ctx.fillRect(k[0]-w+.6,k[1]+.8,w*2-1.2,.7);
    ctx.strokeStyle=SC.twine;ctx.lineWidth=.6;for(let i=0;i<3;i++){const xx=k[0]-w+.8+i*(w*2-1.6)/2;seg([xx-.5,k[1]-2.6],[xx+.5,k[1]-1.4]);ctx.stroke()}});
  on(V0,Ch,rC,[.72,.6,-.3],.1,(k,v)=>{ink(1.2);ctx.fillStyle=SC.hole;ctx.beginPath();for(let i=0;i<7;i++){const an=i/7*TAU,r=[1,.6,.95,.7,1,.55,.85][i]*2.1;ctx.lineTo(k[0]+Math.cos(an)*r*Math.max(.5,v),k[1]+Math.sin(an)*r*.8)}
    ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle=SC.strawD;ell(k[0],k[1]+.3,1.3*Math.max(.5,v),.8);ctx.fill()});
  on(V0,Ch,rC,[-.85,-.35,.15],.08,(k,v)=>{const w=2.8*Math.max(.45,v);ink(1.2);ctx.fillStyle=SC.pants;ctx.fillRect(k[0]-w,k[1]-2.6,w*2,5.2);ctx.strokeRect(k[0]-w,k[1]-2.6,w*2,5.2);ctx.strokeStyle=SC.twine;ctx.lineWidth=.6;
    for(const[sx,sy] of[[-1,-1],[1,-1],[-1,1],[1,1]]){const cx=k[0]+sx*(w-.8),cy=k[1]+sy*1.8;seg([cx-.6,cy-.6],[cx+.6,cy+.6]);ctx.stroke();seg([cx+.6,cy-.6],[cx-.6,cy+.6]);ctx.stroke()}});
  ctx.restore();
  {const d=nrm([.72,.6,-.3]);if(F(d)>.15)strawTuft(V0,add(Ch,mul(d,rC*.98)),add(d,[0,0,-.4]),4,2.6,.6,11)}
  ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=3.7;ctx.beginPath();ctx.ellipse(q[0],q[1],rw+.1,(rw+.1)*.55,0,.05,Math.PI-.05);ctx.stroke();ctx.strokeStyle=SC.rope;ctx.lineWidth=1.9;ctx.stroke();
  ctx.strokeStyle=SC.ropeD;ctx.lineWidth=.7;for(let i=1;i<9;i++){const u=i/9*Math.PI,x0=q[0]+Math.cos(u)*rw,y0=q[1]+Math.sin(u)*rw*.55;seg([x0-.5,y0-.7],[x0+.5,y0+.7]);ctx.stroke()}
  for(const[d,s] of[[[.85,.45,0],13],[[.2,-.98,0],14],[[-.7,.7,0],15]]){if(F(d)<.08)continue;strawTuft(V0,add(W,mul(nrm(d),rw*.92)),add(d,[0,0,1]),3,2.4,.45,s)}
  on(V0,W,rw,[.85,-.5,0],.05,k=>{const sw=Math.sin(ph*2+.5)*.5;for(const pass of[0,1]){ctx.strokeStyle=pass?SC.rope:INK;ctx.lineWidth=pass?1.3:3;seg(k,[k[0]-.4+sw,k[1]+4.2]);ctx.stroke();seg(k,[k[0]+1.4+sw*.6,k[1]+3.6]);ctx.stroke()}
    ink(1.2);ctx.fillStyle=SC.rope;ball(k,1.5);ctx.fill();ctx.stroke();ctx.fillStyle=wa(.5);ball([k[0]-.4,k[1]-.5],.5);ctx.fill()});
  for(const sd of[-1,1])on(V0,Ch,rC,[.6,sd*.34,.72],.05,(k,v)=>{const w=Math.max(.5,v),f=P(add(Ch,[rC*.9,0,rC*.25])),dx=Math.sign(k[0]-f[0]||sd)*w;ink(1.2);ctx.fillStyle=SC.shirtL;
    ctx.beginPath();ctx.moveTo(k[0]-dx*1.6,k[1]-1.2);ctx.lineTo(k[0]+dx*1.8,k[1]-.6);ctx.lineTo(k[0]+dx*.2,k[1]+3);ctx.closePath();ctx.fill();ctx.stroke()});
  rim(a,rP,b,rC,.34)}
// the head: the straw bursting out round the neck, the sack gathered and tied with a rope, then the sack: burlap weave, a blue patch
// and a stitched seam on the side, a sewn-on button for the left eye, a torn hole for the right one (with the zombie's light in it),
// frowning stitched brows, a wide stitched grin (it splits open when o.open is high)
function scHead(V0,Ch,Hc,R,ph,o){const{P,F,c}=V0,t=G.t,at=R*.95,lit=[],n0=add(Ch,[.8,0,6]),n1=add(Hc,[-.2,0,-R*.82]),Nk=lerp3(n0,n1,.55),Nr=lerp3(n0,n1,.2);
  const ruff=front=>{if(LOWFX&&!front)return;for(let i=0;i<8;i++){if(LOWFX&&i%2)continue;const an=i/8*TAU+.2,d=[Math.cos(an),Math.sin(an),0];if((F(d)>=0)!==front)continue;strawTuft(V0,add(Nr,mul(d,2.6)),add(d,[0,0,-.3]),4,2.6+((i*7)%3)*.5,.55,i+1)}};
  ruff(false);neck(V0,n0,3.6,n1,3.1,SC.sack);
  {const A=P(n0),B=P(n1);ctx.strokeStyle='rgba(90,60,25,.5)';ctx.lineWidth=.8;for(const o2 of[-1.6,0,1.6]){seg([lerp(A[0],B[0],.5)+o2,lerp(A[1],B[1],.5)],[B[0]+o2*1.15,B[1]+1]);ctx.stroke()}}
  ruff(true);
  {const k=P(Nk),rr=3.5;ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=3.4;ctx.beginPath();ctx.ellipse(k[0],k[1],rr,rr*.55,0,.1,Math.PI-.1);ctx.stroke();ctx.strokeStyle=SC.rope;ctx.lineWidth=1.7;ctx.stroke();
    ctx.strokeStyle=SC.ropeD;ctx.lineWidth=.7;for(let i=1;i<6;i++){const u=i/6*Math.PI,x0=k[0]+Math.cos(u)*rr,y0=k[1]+Math.sin(u)*rr*.55;seg([x0-.5,y0-.6],[x0+.5,y0+.6]);ctx.stroke()}
    on(V0,Nk,rr,[.75,.66,0],0,kq=>{const sw=Math.sin(ph*2)*.6;for(const pass of[0,1]){ctx.strokeStyle=pass?SC.rope:INK;ctx.lineWidth=pass?1.3:3;seg(kq,[kq[0]+.6+sw,kq[1]+3.6]);ctx.stroke();seg(kq,[kq[0]+2.2+sw*.7,kq[1]+3]);ctx.stroke()}
      ink(1.2);ctx.fillStyle=SC.rope;ball(kq,1.4);ctx.fill();ctx.stroke()})}
  const h=P(Hc);ink(2.4);ball(h,R);ctx.fillStyle=SC.sack;ctx.fill();ctx.stroke();
  ctx.save();ball(h,R-1.1);ctx.clip();ctx.fillStyle=SC.sackD;ell(h[0]+R*.3,h[1]+R*.74,R*1.15,R*.62);ctx.fill();
  if(!LOWFX){ctx.strokeStyle='rgba(96,66,28,.22)';ctx.lineWidth=.55;ctx.beginPath();for(let i=-4;i<=4;i++){ctx.moveTo(h[0]-R,h[1]+i*1.8-.4);ctx.lineTo(h[0]+R,h[1]+i*1.8+.4);ctx.moveTo(h[0]+i*1.8+.4,h[1]-R);ctx.lineTo(h[0]+i*1.8-.4,h[1]+R)}ctx.stroke()}
  glowTop(h,R,.2);
  on(V0,Hc,at,[-.55,-.72,.3],.05,(k,v)=>{const w=2.8*Math.max(.45,v);ink(1.2);ctx.fillStyle=SC.pants;ctx.fillRect(k[0]-w,k[1]-2.5,w*2,5);ctx.strokeRect(k[0]-w,k[1]-2.5,w*2,5);ctx.strokeStyle=SC.twine;ctx.lineWidth=.7;
    for(const[x0,y0] of[[-w,-2.5],[w,-2.5],[-w,2.5],[w,2.5]]){const cx=k[0]+x0*.72,cy=k[1]+y0*.72;seg([cx-.7,cy-.7],[cx+.7,cy+.7]);ctx.stroke();seg([cx+.7,cy-.7],[cx-.7,cy+.7]);ctx.stroke()}});
  ctx.strokeStyle=SC.thread;ctx.lineWidth=.9;if(!LOWFX)for(let i=0;i<7;i++){const e=-.7+i*.27;on(V0,Hc,at,[-.25,Math.cos(e),Math.sin(e)],.08,k=>{seg([k[0]-1.1,k[1]-.3],[k[0]+1.1,k[1]+.3]);ctx.stroke()})}
  on(V0,Hc,at,[.82,-.44,.12],0,(k,v)=>{const r=R*.22,rx=r*Math.max(.5,v);ink(1.3);ctx.fillStyle=SC.button;ctx.beginPath();ctx.ellipse(k[0],k[1],rx,r,0,0,TAU);ctx.fill();ctx.stroke();
    ctx.strokeStyle=SC.buttonL;ctx.lineWidth=.7;ctx.beginPath();ctx.ellipse(k[0],k[1],rx*.72,r*.72,0,Math.PI*1.1,Math.PI*1.7);ctx.stroke();
    ctx.strokeStyle=SC.twine;ctx.lineWidth=.8;seg([k[0]-rx*.4,k[1]-r*.4],[k[0]+rx*.4,k[1]+r*.4]);ctx.stroke();seg([k[0]+rx*.4,k[1]-r*.4],[k[0]-rx*.4,k[1]+r*.4]);ctx.stroke()});
  on(V0,Hc,at,[.82,.44,.12],0,(k,v)=>{const r=R*.25,sx=Math.max(.5,v);ink(1.3);ctx.fillStyle=SC.hole;ctx.beginPath();
    for(let i=0;i<9;i++){const an=i/9*TAU,rr=r*[1,.78,.96,.7,1,.82,.94,.74,.9][i];ctx.lineTo(k[0]+Math.cos(an)*rr*sx,k[1]+Math.sin(an)*rr)}ctx.closePath();ctx.fill();ctx.stroke();
    ctx.strokeStyle='rgba(96,66,28,.7)';ctx.lineWidth=.6;for(const an of[.4,1.9,3.4,4.9]){seg([k[0]+Math.cos(an)*r*sx,k[1]+Math.sin(an)*r],[k[0]+Math.cos(an)*r*1.45*sx,k[1]+Math.sin(an)*r*1.45]);ctx.stroke()}
    lit.push([k,cl(v*4,0,1)])});
  for(const sd of[-1,1])on(V0,Hc,at,[.78,sd*.42,.38],.05,(k,v)=>{const f=P(add(Hc,mul(nrm([.9,0,.2]),at))),ux=(Math.sign(f[0]-k[0])||-sd)*Math.max(.45,v);
    ctx.lineCap='round';ctx.strokeStyle=SC.thread;ctx.lineWidth=1.5;seg([k[0]-ux*2.3,k[1]-1],[k[0]+ux*2.1,k[1]+.9]);ctx.stroke();ctx.lineWidth=.8;
    for(const u of[-1.2,0,1.2]){const m=[k[0]+ux*u,k[1]+u*.45*Math.sign(ux)];seg([m[0]-.25,m[1]-1.1],[m[0]+.25,m[1]+1.1]);ctx.stroke()}});
  {const n=nrm([.86,0,-.46]),v=F(n);if(v>-.1){const k=P(add(Hc,mul(n,at))),op=o.open||0,w=R*.62*Math.max(.32,v),hh=.8+op*2.4;ctx.save();ctx.globalAlpha=cl((v+.1)*4,0,1);
    ink(1.3);ctx.fillStyle=SC.hole;ctx.beginPath();for(let i=0;i<=8;i++){const x0=-w+i/8*2*w,u=x0/w;ctx.lineTo(k[0]+x0,k[1]-1.6*u*u)}for(let i=8;i>=0;i--){const x0=-w+i/8*2*w,u=x0/w;ctx.lineTo(k[0]+x0,k[1]-1.6*u*u+hh*(1-u*u))}
    ctx.closePath();ctx.fill();ctx.stroke();if(op>.3)shine('230,255,120',k[0],k[1]+hh*.4,w*.9,.35*op);
    ctx.strokeStyle=SC.twine;ctx.lineWidth=.85;ctx.lineCap='round';for(let i=1;i<6;i++){const x0=-w+i/6*2*w,u=x0/w,y0=k[1]-1.6*u*u,y1=y0+hh*(1-u*u);seg([k[0]+x0-.7,y0-1.1],[k[0]+x0+.7,y1+1.1]);ctx.stroke();seg([k[0]+x0+.7,y0-1.1],[k[0]+x0-.7,y1+1.1]);ctx.stroke()}
    ctx.restore()}}
  ctx.restore();rim(h,R,h,R,.3);
  for(const[k,a] of lit){const gk=o.glow||1,er=R*.11*a;shine('230,255,120',k[0],k[1],R*.55*gk,(.45+.1*Math.sin(t*5))*a*gk);ctx.fillStyle=ZC.eye;ball([k[0]+c*.3,k[1]+.3],er);ctx.fill();ctx.fillStyle='#ffffff';ball([k[0]+c*.3-er*.35,k[1]+.3-er*.35],er*.42);ctx.fill()}}
// the hat in its own frame (origin on the head's centre, R the head's radius): a wavy brim that sags at the back and turns up a little
// at the front (so it never hides the eyes), woven rings, a frayed edge, a crown with a bent tip, a red band, straw out of a hole
const SH={RB:10.6,rc:5.3,aP:-1.25};
const brimDroop=a=>1.6*Math.pow(Math.max(0,Math.cos(a+2.3)),2)+1*Math.pow(Math.max(0,Math.cos(a-2)),2)-.5*Math.pow(Math.max(0,Math.cos(a)),2)+.25*Math.sin(a*5+1);
function brimPt(R,a,k){const r=SH.RB*k*(1+.04*Math.sin(a*3+1.3));return[-.4+Math.cos(a)*r,Math.sin(a)*r,R*.86-brimDroop(a)*k*k]}
function scHat(Vh,R,ph,crowFn){const{P}=Vh,b0=brimPt(R,0,0),c0=P(b0),N=40,rc=SH.rc,edge=[],brimC='rgba(112,78,18,.45)';
  for(let i=0;i<N;i++)edge.push(P(brimPt(R,i/N*TAU,1)));const brim=()=>{ctx.beginPath();for(const q of edge)ctx.lineTo(q[0],q[1]);ctx.closePath()};
  ink(2.2);brim();ctx.fillStyle=SC.hat;ctx.fill();ctx.stroke();
  ctx.save();brim();ctx.clip();ctx.fillStyle=SC.hatD;ell(c0[0]+rc*.75,c0[1]+rc*.5,rc*1.6,rc*.8);ctx.fill();ctx.fillStyle=wa(.2);ell(c0[0]-SH.RB*.5,c0[1]-SH.RB*.22,SH.RB*.42,SH.RB*.17);ctx.fill();
  ctx.strokeStyle=brimC;ctx.lineWidth=.8;for(const k of[.66,.85]){ctx.beginPath();for(let i=0;i<=N;i++){const q=P(brimPt(R,i/N*TAU,k));ctx.lineTo(q[0],q[1])}ctx.stroke()}
  ctx.beginPath();for(let i=0;i<20;i++){const a=i/20*TAU+.12,q0=P(brimPt(R,a,.52)),q1=P(brimPt(R,a,.98));ctx.moveTo(q0[0],q0[1]);ctx.lineTo(q1[0],q1[1])}ctx.stroke()
  ctx.restore();
  if(!LOWFX)for(const[a,s] of[[.35,1],[1.95,2],[3.05,3],[4.4,4],[5.5,5]]){const e=brimPt(R,a,.96),o2=brimPt(R,a,1.3);strawTuft(Vh,e,add(nrm(sub(o2,e)),[0,0,-.25]),2,2.2,.35,s)}
  if(crowFn&&crowFn.behind)crowFn();
  const ap=add(b0,[-.6,0,6.2]),A=P(ap),hb=c0[1]-1.5,tw=rc*.72;
  const crown=()=>{ctx.beginPath();ctx.moveTo(c0[0]-rc,c0[1]);ctx.quadraticCurveTo(c0[0]-rc*1.02,A[1]+2.6,A[0]-tw,A[1]+.7);ctx.quadraticCurveTo(A[0]-tw*.45,A[1]-.9,A[0],A[1]+1);
    ctx.quadraticCurveTo(A[0]+tw*.45,A[1]-.9,A[0]+tw,A[1]+.7);ctx.quadraticCurveTo(c0[0]+rc*1.02,A[1]+2.6,c0[0]+rc,c0[1]);ctx.ellipse(c0[0],c0[1],rc,rc*.55,0,0,Math.PI);ctx.closePath()};
  ink(2.2);crown();ctx.fillStyle=SC.hat;ctx.fill();ctx.stroke();
  ctx.save();crown();ctx.clip();ctx.fillStyle=SC.hatD;ell(c0[0]+rc*.85,lerp(c0[1],A[1],.5),rc*.7,rc*1.4);ctx.fill();ctx.fillStyle=wa(.22);ell(c0[0]-rc*.5,lerp(c0[1],A[1],.55),rc*.3,rc*.75);ctx.fill();
  ctx.strokeStyle=brimC;ctx.lineWidth=.8;for(const k of[.36,.7]){const rr=lerp(rc,tw,k);ctx.beginPath();ctx.ellipse(lerp(c0[0],A[0],k),lerp(c0[1],A[1]+1.2,k),rr,rr*.55,0,0,Math.PI);ctx.stroke()}
  seg([A[0],A[1]+1],[A[0]+.3,A[1]+2.6]);ctx.stroke();
  ctx.lineCap='butt';ctx.strokeStyle=INK;ctx.lineWidth=3.8;ctx.beginPath();ctx.ellipse(c0[0],hb,rc*.99,rc*.545,0,.06,Math.PI-.06);ctx.stroke();ctx.strokeStyle=SC.band;ctx.lineWidth=2.2;ctx.stroke();
  ctx.strokeStyle=wa(.35);ctx.lineWidth=.6;ctx.beginPath();ctx.ellipse(c0[0],hb-.6,rc*.99,rc*.545,0,Math.PI*.55,Math.PI*.92);ctx.stroke();ctx.restore();ctx.lineCap='round';
  {const C0=add(b0,[-.3,0,2.8]),d=nrm([.25,.95,.2]);on(Vh,C0,rc*.86,d,.08,(k,v)=>{ink(1.2);ctx.fillStyle=SC.hole;ctx.beginPath();for(let i=0;i<7;i++){const an=i/7*TAU,r=[1,.7,1,.8,.95,.65,.9][i]*1.5;ctx.lineTo(k[0]+Math.cos(an)*r*Math.max(.5,v),k[1]+Math.sin(an)*r)}ctx.closePath();ctx.fill();ctx.stroke()});
    if(Vh.F(d)>.1)strawTuft(Vh,add(C0,mul(d,rc*.86)),add(d,[0,0,.5]),3,2.4,.4,7)}
  if(crowFn&&!crowFn.behind)crowFn()}
// the crow, in its own frame (x where it faces, y its right, z up), feet at the origin. o.wing 0 folded .. 1 spread, o.beat -1..1,
// o.look turns its head, o.peck dips it, o.open opens the beak, o.flick lifts the tail. Pieces go in front of or behind the body by
// where they face, so it reads the same from every side
function crow(Vc,o){const{P,F}=Vc,S=1.4,q=v=>mul(v,S),lk=o.look||0,hd=[Math.cos(lk),Math.sin(lk),0],pk=o.peck||0;
  const R0=q([-1.3,0,2.4]),F0=q([.8,0,2.9]),Hd=add(q([1.5,0,4.6-pk*1.5]),mul(hd,.4*S*(1+pk)));
  const body=()=>{const a=P(R0),b=P(F0);ink(1.6);hull(a,1.65*S,b,1.95*S);ctx.fillStyle=SC.crow;ctx.fill();ctx.stroke();
    ctx.save();hull(a,1.65*S-.9,b,1.95*S-.9);ctx.clip();ctx.fillStyle=SC.crowD;ell((a[0]+b[0])/2+1,(a[1]+b[1])/2+1.4,3*S,1.5*S);ctx.fill();
    ctx.fillStyle=SC.crowL;ell((a[0]+b[0])/2-.8,(a[1]+b[1])/2-1.2,1.9*S,.75*S);ctx.fill();ctx.restore()};
  // the tail: a fan of three feathers in one piece
  const tail=()=>{const fl=(o.flick||0)*1.6,pt=(x,y,z)=>P(add(R0,q([x,y,z]))),c=[pt(-.3,-.6,.1),pt(-3.3,-1.5,-.3+fl),pt(-3,-.55,-.5+fl),pt(-3.6,0,-.5+fl),pt(-3,.55,-.5+fl),pt(-3.3,1.5,-.3+fl),pt(-.3,.6,.1)];
    ink(1.2);ctx.fillStyle=SC.crowD;ctx.beginPath();for(const k of c)ctx.lineTo(k[0],k[1]);ctx.closePath();ctx.fill();ctx.stroke()};
  const wing=sd=>{const w=o.wing||0,bt=o.beat||0,fo=[[.9,1.45,3.4],[-1.1,1.85,3.1],[-3.3,1.2,2.4],[-2,1.45,1.8],[.3,1.5,2.2]],
      op=[[.7,1.2,3.6],[-.3,4.4,3.6+bt*2.4],[-1.4,7,3.2+bt*4.2],[-2.6,4,2.6+bt*2.2],[-1.6,1.4,2.5]],pts=fo.map((f,i)=>P(q(lerp3([f[0],f[1]*sd,f[2]],[op[i][0],op[i][1]*sd,op[i][2]],w))));
    ink(1.4);ctx.fillStyle=F(0,sd,.3)>0?SC.crow:SC.crowD;ctx.beginPath();for(const p2 of pts)ctx.lineTo(p2[0],p2[1]);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.strokeStyle=SC.crowL;ctx.lineWidth=.6;if(w>.3){for(const u of[.35,.65]){seg([lerp(pts[1][0],pts[2][0],u),lerp(pts[1][1],pts[2][1],u)],[lerp(pts[3][0],pts[2][0],u),lerp(pts[3][1],pts[2][1],u)]);ctx.stroke()}}
    else{seg([lerp(pts[0][0],pts[2][0],.3),lerp(pts[0][1],pts[2][1],.3)],[lerp(pts[0][0],pts[2][0],.8),lerp(pts[0][1],pts[2][1],.8)]);ctx.stroke()}};
  const beak=()=>{const op=o.open||0,b0=add(Hd,mul(hd,1.1*S)),tipU=add(add(Hd,mul(hd,2.9*S)),[0,0,-.3*S]),tipL=add(add(Hd,mul(hd,2.5*S)),[0,0,-.6*S-op*1.1*S]);
    ctx.fillStyle=SC.beakD;ink(1);tri(...P(add(b0,[0,0,-.35*S])),...P(tipL),.55*S);ctx.fillStyle=SC.beak;tri(...P(add(b0,[0,0,.15*S])),...P(tipU),.75*S)};
  const head=()=>{const h=P(Hd);ink(1.6);ball(h,1.55*S);ctx.fillStyle=SC.crow;ctx.fill();ctx.stroke();ctx.save();ball(h,1.55*S-.8);ctx.clip();ctx.fillStyle=SC.crowL;ell(h[0]-.6,h[1]-.8,1.1*S,.6*S);ctx.fill();ctx.restore();
    for(const sd of[-1,1])on(Vc,Hd,1.45*S,add(mul(hd,.55),[-hd[1]*sd*.8,hd[0]*sd*.8,.35]),.05,k=>{ctx.fillStyle=SC.crowEye;ball(k,.7*S);ctx.fill();ctx.fillStyle=INK;ball([k[0]+.15,k[1]],.36*S);ctx.fill();ctx.fillStyle='#ffffff';ball([k[0]-.2,k[1]-.25],.15*S);ctx.fill()})};
  ctx.strokeStyle=SC.beakD;ctx.lineWidth=.8;ctx.lineCap='round';for(const sd of[-1,1]){seg(P(q([0,sd*.5,0])),P(q([-.1,sd*.5,1.6])));ctx.stroke();seg(P(q([0,sd*.5,0])),P(q([.9,sd*.65,-.05])));ctx.stroke()}
  const hf=F(1,0,.3)*2+.3,items=[{d:0,f:body},{d:F(-1,0,0)*2,f:tail},{d:hf,f:head},{d:hf+(F(hd)>0?.05:-.05),f:beak}];
  for(const sd of[-1,1])items.push({d:F(0,sd,.25)*2.4,f:()=>wing(sd)});
  items.sort((a,b)=>a.d-b.d);for(const it of items)it.f()}
function spaventapasseri(x,y,face,anim,p,sc){sc=sc||1.15;const ph=p*TAU,walk=anim==='walk',atk=anim==='attack',idle=!walk&&!atk;
  // attack, the spinning top: .0-.2 winds up (twists back, crouches; the crow startles), .2-.7 turns right round with the bar sweeping
  // (the crow flies off), .7-1 wobbles, dizzy, and the crow lands back on the hat. The hat turns a little behind the body (hatX)
  let yaw=0,hatX=0,crouch=0,hop=0,lean=0,spin=-1,dizzy=-1,air=0;const yawAt=k=>-.9+(TAU+.9)*ez(cl(k,0,1));
  if(atk){if(p<.2){const k=ez(p/.2);yaw=-.9*k;hatX=.25*k;crouch=k*1.3}
    else if(p<.7){const k=(p-.2)/.5;yaw=yawAt(k);hatX=.25*(1-k)-.75*Math.sin(k*Math.PI);crouch=1.3*(1-ez(k));hop=Math.sin(k*Math.PI)*1.6;lean=Math.sin(k*Math.PI);spin=k}
    else{const k=(p-.7)/.3,f=(1-k)*(1-k);yaw=TAU+.38*Math.sin(k*Math.PI*3)*f;hatX=.55*Math.sin(k*TAU)*f;dizzy=k}
    air=p<.12?0:p<.24?ez((p-.12)/.12):p<.8?1:p<.94?1-ez((p-.8)/.14):0}
  const ang=face+yaw,V0=V(ang),Vw=V(face),{P,D,F}=V0,R=8;
  // walk: stiff hops, a foot at a time, rocking from side to side like a puppet; the bar tilts with the body
  const st=stepper(p,.5),fL=walk?st(0,3.2,2.4):NOSTEP,fR=walk?st(.5,3.2,2.4):NOSTEP;
  const rock=walk?-Math.sin(ph)*2.3:idle?Math.sin(ph)*.6:lean*1.3,bob=walk?Math.abs(Math.sin(ph))*1.1:idle?Math.sin(ph*2)*.25:hop-crouch;
  const Pv=[0,rock*.3,14.6+bob],Ch=[1.2-crouch*.5,rock,22.8+bob-crouch*.3],tk=(Ch[1]-Pv[1])/(Ch[2]-Pv[2]),wob=dizzy>=0?(1-dizzy)*(1-dizzy):0,
    Hc=add(Ch,[1.2+Math.cos(dizzy*TAU*2)*1.4*wob,rock*.35+Math.sin(ph*(walk?2:1)-.9)*(walk?.6:.35)+Math.sin(dizzy*TAU*2)*1.4*wob,15]),
    barAt=yy=>add(Ch,[-.6,yy,3.4-yy*tk]);
  // the hands swing on the cuffs: back and forth when it walks, flung out and back while it spins
  const hsw=sd=>{if(walk)return[Math.sin(ph+.6)*1.5,-rock*.25,0];if(idle)return[Math.sin(ph+sd)*.6,0,0];const s=spin>=0?Math.sin(spin*Math.PI):0;return[sd*s*2.4,sd*s*1.6,s*1.4+crouch*.3]};
  let pose;
  if(atk){const sk=cl((p-.04)/.1,0,1)*(1-cl((p-.92)/.08,0,1));pose={wing:air>0?Math.max(air,.5):sk*.6,beat:air>0?.3+.7*Math.sin(p*TAU*8):sk*.3*Math.sin(p*60),look:.3*Math.sin(ph*3),open:p<.3?1:0,flick:sk}}
  else if(walk)pose={wing:.32+.12*Math.sin(ph*2),beat:Math.sin(ph*2)*.6,look:Math.sin(ph)*.35,flick:Math.max(0,Math.sin(ph*2))*.5};
  else pose={look:Math.sin(ph)*.9,open:p>.12&&p<.3?Math.sin((p-.12)/.18*Math.PI):0,peck:p>.55&&p<.8?Math.sin((p-.55)/.25*Math.PI):0,flick:p>.35&&p<.5?Math.sin((p-.35)/.15*Math.PI):0};
  shadow(x,y,13*sc,4.8*sc,.34);
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const parts=[],dT=D(Ch);
  // legs: stiff, patched trousers, straw out of the cuffs (the tufts that point away go behind the leg), old boots
  for(const[sd,f] of[[-1,fL],[1,fR]]){const hip=add(Pv,[0,sd*3.3,-3.3]),foot=[1+f.x,sd*4.6,f.z],k=farK(F(0,sd,0));
    parts.push({d:dT-100+D(hip)*.01,f:()=>{const o={L1:5,L2:5.1,w1:4.4,w2:3.8,col:mix(SC.pants,SC.pantsF,k),colD:'rgba(0,0,0,.28)',shoe:mix(SC.boot,'#000000',k*.3),heel:1.3,toe:2.8,sr:2.3,pole:[1,0,.12]},
        [kn]=ik(hip,add(foot,[0,0,1.6]),o.L1,o.L2,o.pole),an=add(foot,[0,0,2.3]),tufts=[[-.6,sd*.5,-.7],[.7,sd*.6,-.6],[0,sd,-.5]];
      if(!LOWFX)for(const d of tufts)if(F(d)<0)strawTuft(V0,an,d,3,2.4,.5,sd*3+d[0]*7);
      leg(V0,hip,foot,o);
      for(const d of tufts)if(F(d)>=0)strawTuft(V0,an,d,3,2.4,.5,sd*3+d[0]*7);
      if(sd<0){const fv=F(1,0,0);if(fv>-.2){const q=P(lerp3(hip,kn,.75));ctx.save();ctx.globalAlpha=cl((fv+.2)*3,0,1);ink(1.1);ctx.fillStyle=SC.patch;ctx.fillRect(q[0]-1.8,q[1]-1.6,3.6,3.2);ctx.strokeRect(q[0]-1.8,q[1]-1.6,3.6,3.2);
        ctx.strokeStyle=SC.twine;ctx.lineWidth=.6;seg([q[0]-1.2,q[1]-1],[q[0]+1.2,q[1]+1]);ctx.stroke();seg([q[0]+1.2,q[1]-1],[q[0]-1.2,q[1]+1]);ctx.stroke();ctx.restore()}}}})}
  parts.push({d:dT,f:()=>{trunk(V0,Pv,5.4,Ch,7.2,SC.shirt,SC.shirtD,0,{noRim:1,neck:1});scBody(V0,Pv,5.4,Ch,7.2,ph)}});
  // arms: tight torn sleeves along the bar, the bar's end sticking out of the cuff, rope round the cuff, straw, a bony hand hanging
  for(const sd of[-1,1]){const sh=add(Ch,[-.3,sd*6.4,3.2-sd*6.4*tk]),wr=barAt(sd*15.2),k=farK(F(0,sd,0)),hs=hsw(sd);
    parts.push({d:D(add(sh,[3,0,0])),f:()=>{const w3=add(wr,[.2,-sd*.3,-1.4]),h=add(add(w3,[0,0,-2.6]),hs),skin=mix(ZC.skin,ZC.skinF,k),cloth=mix(SC.shirt,SC.shirtF,k),
        ax=nrm(sub(wr,sh)),fax=F(ax),toward=fax>.35,endFirst=F(0,sd,0)<.3,bx=nrm(sub(barAt(sd*18.4),barAt(sd*15.6)));
      const hand=()=>{bone([P(w3),P(h)],[1.3,1.05],skin,()=>claw(V0,h,nrm(add([.15,sd*.12,-1],mul(hs,.12))),1.7,skin,ZC.nail,[0,-sd,0],4.8));shadeLimb([P(w3),P(h)],[1.3,1.05],'rgba(40,58,26,.42)')};
      const end=()=>{bar(V0,barAt(sd*15.6),barAt(sd*18.4),3.2);const fe=F(bx);if(fe>.2){ctx.save();ctx.globalAlpha=cl((fe-.2)*3,0,1);disc(V0,barAt(sd*18.6),bx,1.5,'#a37c4e',1);
        ctx.strokeStyle=SC.woodD;ctx.lineWidth=.6;const q=P(barAt(sd*18.6));ctx.beginPath();ctx.arc(q[0],q[1],.7,0,TAU);ctx.stroke();ctx.restore()}};
      if(!toward)hand();if(endFirst)end();
      rag(V0,sh,wr,2.9,2.6,cloth,()=>hull(P(Pv),4.2,P(Ch),6),cl(1-Math.abs(F(0,sd,0))*1.8,0,1),'rgba(70,16,10,.38)');
      {const A=P(sh),B=P(wr),dx=B[0]-A[0],dy=B[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;if(l>4){ctx.lineCap='butt';ctx.strokeStyle='rgba(70,16,10,.42)';ctx.lineWidth=1.9;
        for(const u of[.42,.72]){const m=[lerp(A[0],B[0],u),lerp(A[1],B[1],u)],r=lerp(2.9,2.6,u)*.92;seg([m[0]-nx*r,m[1]-ny*r],[m[0]+nx*r,m[1]+ny*r]);ctx.stroke()}ctx.lineCap='round'}}
      ropeRings(V0,lerp3(sh,wr,.84),ax,2.85,2,1.5);
      if(fax>.08){ctx.save();ctx.globalAlpha=cl((fax-.08)*3,0,1);const cq=add(wr,mul(ax,.3));disc(V0,cq,ax,2.2,SC.strawD,1);const q=P(cq);ctx.lineCap='round';
        for(let i=0;i<6;i++){const an=i*1.05+.3,r0=.4+(i%3)*.45;ctx.strokeStyle=i%2?SC.straw:SC.strawL;ctx.lineWidth=.8;seg([q[0]+Math.cos(an)*r0,q[1]+Math.sin(an)*r0*.7],[q[0]+Math.cos(an+.5)*(r0+1.1),q[1]+Math.sin(an+.5)*(r0+1.1)*.7]);ctx.stroke()}ctx.restore()}
      strawTuft(V0,add(wr,mul(ax,.4)),add(ax,[.2,0,-.55]),4,2.8,.6,sd+20);
      if(toward)hand();if(!endFirst)end()}})}
  // the head with the hat; the crow rides on the brim (in front of or behind the crown by where it is) unless it is flying
  parts.push({d:D(Hc),f:()=>{scHead(V0,Ch,Hc,R,ph,{open:atk?(p>.15&&p<.75?1:.3):walk?.35+.15*Math.sin(ph*2):.25,glow:spin>=0?1+.6*Math.sin(spin*Math.PI):1});
    const Vh=Vat(ang+hatX,P(Hc),D(Hc)),perch=add(brimPt(R,SH.aP,.9),[0,0,.3]);let cf=null;
    if(air<=0){cf=()=>crow(Vat(ang+hatX+SH.aP-.3,Vh.P(perch),Vh.D(perch)),pose);cf.behind=Vh.D(perch)<Vh.D(add(brimPt(R,0,0),[0,0,3]))}
    scHat(Vh,R,ph,cf)}});
  // the sweep of the bar while it spins: two fading arcs behind its ends (in the room's frame), sorted with the body
  if(spin>=0){const k=Math.sin(spin*Math.PI),z=Ch[2]+3.4,span=1.9*k,n=LOWFX?4:10;
    for(const sd of[-1,1])for(let i=0;i<n;i++){const a0=yaw+sd*Math.PI/2-i/n*span,a1=yaw+sd*Math.PI/2-(i+1)/n*span,r=18.6,p0=[Math.cos(a0)*r,Math.sin(a0)*r,z],p1=[Math.cos(a1)*r,Math.sin(a1)*r,z],al=(1-i/n)*k;
      parts.push({d:Vw.D(lerp3(p0,p1,.5)),f:()=>{const A=Vw.P(p0),B=Vw.P(p1);ctx.lineCap='round';if(!LOWFX){ctx.strokeStyle=`rgba(255,240,200,${.28*al})`;ctx.lineWidth=5*(1-i/(n+2));seg(A,B);ctx.stroke()}
        ctx.strokeStyle=`rgba(255,250,230,${.7*al})`;ctx.lineWidth=1.6*(1-i/(n+2))+.4;seg(A,B);ctx.stroke()}})}}
  run(parts);
  // the crow off the hat: from its perch up into a circle over the head and back, beating its wings
  if(air>0){const perch=add(brimPt(R,SH.aP,.9),[0,0,.3]),hW=rz(Hc,yaw),att=add(hW,rz(perch,yaw+hatX)),hov=add(hW,[Math.cos(ph*2)*4,Math.sin(ph*2)*4,R*.86+8+Math.sin(ph*6)]),e=ez(air),
      cw=add(lerp3(att,hov,e),[0,0,Math.sin(air*Math.PI)*2]),a0=face+yaw+hatX+SH.aP-.3,a1=face+ph*2+Math.PI/2;
    crow(Vat(angTo(a1,a0,1-e),Vw.P(cw),0),pose)}
  // straw flung off the ends of the bar while it spins
  if(spin>=0&&!LOWFX)for(let i=0;i<8;i++){const te=.26+i*.045,age=(p-te)/.3;if(age<0||age>=1)continue;const sd=i%2?1:-1,ea=yawAt((te-.2)/.5)+sd*Math.PI/2,
      vx=Math.cos(ea)*9-Math.sin(ea)*13,vy=Math.sin(ea)*9+Math.cos(ea)*13,pz=Ch[2]+3+7*age-24*age*age;if(pz<.5)continue;
    const p3=[Math.cos(ea)*18.4+vx*age,Math.sin(ea)*18.4+vy*age,pz],vl=Math.hypot(vx,vy),A=Vw.P(p3),B=Vw.P(add(p3,[-vx/vl*2.4,-vy/vl*2.4,.6]));
    ctx.globalAlpha=1-age;ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=2.1;seg(A,B);ctx.stroke();ctx.strokeStyle=i%3?SC.straw:SC.strawL;ctx.lineWidth=1;ctx.stroke();ctx.globalAlpha=1}
  // dizzy: three little stars going round over the hat
  if(dizzy>=0&&dizzy<.9){const k=dizzy/.9,c0=P(add(Hc,[0,0,R*.86+11.5]));for(let i=0;i<3;i++){const an=k*TAU*1.5+i*TAU/3;starS(c0[0]+Math.cos(an)*8,c0[1]+Math.sin(an)*2.6,1.9,Math.sin(k*Math.PI))}}
  ctx.restore()}

return {zombie,strisciante,minatore,hound,becchino,lanterna,spaventapasseri};
})();
