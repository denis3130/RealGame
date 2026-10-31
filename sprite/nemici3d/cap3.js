// Nemici del terzo capitolo (Palude e Canneto) rifatti in 3D come l'Arciere: stesse forme e colori di oggi nel gioco, dipinti con la
// cassetta C3 (base3d.js). Ogni mossa dipende solo da p (0..1).
//  - Rana: verde con le macchie scure e viola, pancia color crema, grandi occhi gialli sopra la testa, il sacco della gola; sta seduta,
//    salta (cammina: si accuccia, vola con le zampe tese, atterra schiacciandosi) e sputa (il sacco si gonfia, la bocca si apre)
(()=>{const C=C3,{cam,TAU,cl,ez,lerp,add,sub,mul,len,nrm,dot,cross,lerp3,V,ball,seg,tri,hull,rim,run,ik,stepper,dk,lt,rgba,cmix,poly,line,smooth,chull,bbox,soft,softBox,softBall,rimPoly,
  sp,capPath,look,blink,keys,bump,sstep,hitK,frame,AXES,sball,caps,chain,disc3,spot,floor,stars,parts,reg,shine}=C;

// ------------------------------------------------------------------ an ellipsoid seen through the body's frame X, exact from every side
// (squash and lean included): centre C, radii Rd along the axes Fr (u forward, v right, w up); m = a unit direction in its own axes.
// E.p3(m): the point of the surface (body space); E.P(m): its screen point; E.vis(m) > 0 where the surface faces us; E.N(m): the
// normal there (body space); E.w: the way to the camera in the ellipsoid's own unit space (the outline is the circle m·w = 0)
function ell3(V0,X,Cc,Rd,Fr){Fr=Fr||AXES;const c0=X.T(Cc),a=sub(X.T(add(Cc,mul(Fr.u,Rd[0]))),c0),b=sub(X.T(add(Cc,mul(Fr.v,Rd[1]))),c0),c=sub(X.T(add(Cc,mul(Fr.w,Rd[2]))),c0),
  det=dot(a,cross(b,c))||1e-9,r0=mul(cross(b,c),1/det),r1=mul(cross(c,a),1/det),r2=mul(cross(a,b),1/det),v=[V0.s,V0.c,cam.k/cam.zk],w=nrm([dot(r0,v),dot(r1,v),dot(r2,v)]);
  const p3=m=>add(c0,add(add(mul(a,m[0]),mul(b,m[1])),mul(c,m[2])));
  return{c0,a,b,c,w,p3,P:m=>V0.P(p3(m)),vis:m=>dot(m,w),N:m=>nrm(add(add(mul(r0,m[0]),mul(r1,m[1])),mul(r2,m[2])))}}
// the outline of an ellipsoid on the screen (its limb), n points; with a water level L, only what is above the water: the limb above
// it and the line where the surface meets the water (the hull of the two is the outline of what shows). null if all of it is under
function outline(E,n,L){const w=E.w,e1=nrm(cross(w,Math.abs(w[2])<.9?[0,0,1]:[1,0,0])),e2=cross(w,e1),out=[];
  for(let i=0;i<n;i++){const t=i/n*TAU,m=add(mul(e1,Math.cos(t)),mul(e2,Math.sin(t)));if(L==null||E.p3(m)[2]>=L)out.push(E.P(m))}
  if(L==null)return out;
  const g=[E.a[2],E.b[2],E.c[2]],gl=len(g),d=(L-E.c0[2])/(gl||1e-9);if(d>=1)return null;if(d<=-1)return out;
  const gn=mul(g,1/gl),rr=Math.sqrt(1-d*d),k=add(mul(gn,d),[0,0,0]);let u=cross(gn,[0,0,1]);if(len(u)<.2)u=cross(gn,[0,1,0]);u=nrm(u);const v=cross(gn,u);
  for(let i=0;i<n;i++){const t=i/n*TAU;out.push(E.P(add(k,add(mul(u,Math.cos(t)*rr),mul(v,Math.sin(t)*rr)))))}
  return chull(out)}
// the part of the ellipsoid inside a cap round the unit direction n (half-angle al) that faces us, as screen points: the cap's rim where
// it shows, closed along the outline through the middle of the cap. null if none of it shows
function ellCap(E,n,al,N){N=N||28;n=nrm(n);let u=cross(n,[0,0,1]);if(len(u)<.2)u=cross(n,[0,1,0]);u=nrm(u);const v=cross(n,u),ca=Math.cos(al),sa=Math.sin(al),B=[],f=[];
  for(let i=0;i<N;i++){const t=i/N*TAU,m=add(mul(n,ca),add(mul(u,Math.cos(t)*sa),mul(v,Math.sin(t)*sa)));B.push(m);f.push(E.vis(m))}
  let nv=0;for(const x of f)if(x>=0)nv++;if(!nv)return null;if(nv===N)return B.map(E.P);
  let s0=0;for(let i=0;i<N;i++)if(f[i]<0&&f[(i+1)%N]>=0){s0=(i+1)%N;break}
  const cut=(a,c)=>{const k=f[a]/(f[a]-f[c]);return nrm(lerp3(B[a],B[c],k))},rn=[cut((s0-1+N)%N,s0)];let i=s0;while(f[i]>=0){rn.push(B[i]);i=(i+1)%N}rn.push(cut((i-1+N)%N,i));
  const w=E.w,e1=nrm(sub(n,mul(w,dot(n,w)))),e2=cross(w,e1),ang=m=>Math.atan2(dot(m,e2),dot(m,e1)),a0=ang(rn[rn.length-1]),a1=ang(rn[0]),pts=rn.map(E.P);
  for(let j=1;j<10;j++){const a=lerp(a0,a1,j/10);pts.push(E.P(add(mul(e1,Math.cos(a)),mul(e2,Math.sin(a)))))}
  return pts}
// a line on the ellipsoid: fn(k) gives a unit direction for k in 0..1; the runs of screen points where it faces us
function ellRuns(E,fn,N,v0){const runs=[];let cur=[];for(let i=0;i<=N;i++){const m=nrm(fn(i/N));if(E.vis(m)>(v0||.02))cur.push(E.P(m));else if(cur.length){runs.push(cur);cur=[]}}if(cur.length)runs.push(cur);return runs}
// the point of an ellipsoid (rest pose) toward the unit direction m and its normal: for parts that sit on it (eyes, legs)
function onEll(Cc,Rd,Fr,m,out){Fr=Fr||AXES;m=nrm(m);const p=add(Cc,add(add(mul(Fr.u,m[0]*Rd[0]),mul(Fr.v,m[1]*Rd[1])),mul(Fr.w,m[2]*Rd[2]))),
  n=nrm(add(add(mul(Fr.u,m[0]/Rd[0]),mul(Fr.v,m[1]/Rd[1])),mul(Fr.w,m[2]/Rd[2])));return out?add(p,mul(n,out)):p}
// fill a screen outline like the hero's pieces: three soft tones (or o.fill), the thick outline, the warm rim
function paint(pts,col,o){o=o||{};ctx.lineJoin='round';poly(pts);ctx.fillStyle=o.fill||softBox(o.box||bbox(pts),col,o.kl,o.kd);ctx.fill();if(!o.noInk){ctx.strokeStyle=INK;ctx.lineWidth=o.lw||2.5;ctx.stroke()}
  if(!o.noRim)rimPoly(pts,o.rim||.3)}
const tilt=th=>({u:[Math.cos(th),0,Math.sin(th)],v:[0,1,0],w:[-Math.sin(th),0,Math.cos(th)]});
// a polygon added to the current path, always wound the same way (so overlapping pieces filled in one path leave no holes)
function subPoly(o){let a=0;for(let i=0;i<o.length;i++){const p=o[i],q=o[(i+1)%o.length];a+=p[0]*q[1]-q[0]*p[1]}const r=a<0;ctx.moveTo(o[r?o.length-1:0][0],o[r?o.length-1:0][1]);
  for(let i=1;i<o.length;i++){const q=o[r?o.length-1-i:i];ctx.lineTo(q[0],q[1])}ctx.closePath()}

// clip to what of a ball (body point c, screen radius r) is above the water at height WL: the front of the waterline is an ellipse on
// the screen, everything above its near half shows. false if the ball is all under
function waterClip(V0,c,r,WL){if(WL==null||c[2]-r>=WL)return true;if(c[2]+r<=WL)return false;const rho=Math.sqrt(Math.max(0,r*r-(c[2]-WL)*(c[2]-WL))),ph0=Math.atan2(V0.c,V0.s),pts=[];
  for(let i=0;i<=12;i++){const t=ph0-Math.PI/2+i/12*Math.PI;pts.push(V0.P([c[0]+Math.cos(t)*rho,c[1]+Math.sin(t)*rho,WL]))}
  const a=pts[0],b=pts[pts.length-1];ctx.beginPath();ctx.moveTo(a[0],a[1]-r*3);for(const q of pts)ctx.lineTo(q[0],q[1]);ctx.lineTo(b[0],b[1]-r*3);ctx.closePath();ctx.clip();return true}
// a bulging eye (frog, crocodile): a ball of skin at c3 (body, rest) with a big coloured iris toward dir, the pupil (o.pup: 'bar' a
// horizontal slit, 'slit' an upright one), a point of light, the lid that comes down for a blink (o.blink 1 open .. 0 shut) and
// narrows the eye (o.squint); o.shut: squeezed shut (hit). The iris is a cap of the ball, so it turns with the head and goes round
function bulgeEye(V0,X,c3,r,dir,skin,iris,o){o=o||{};const c=X.T(c3),q=V0.P(c),d=nrm(X.Rd(dir)),up=nrm(X.Rd(o.up||[-.35,0,1]));
  if(o.water!=null){ctx.save();if(!waterClip(V0,c,r+1.3,o.water)){ctx.restore();return}}
  sball(V0,c,r,skin,{rim:.24,kl:.2,kd:.3,lw:o.lw||2.2});
  ctx.save();ball(q,r-.7);ctx.clip();
  if(o.shut){// the lid shut tight over the eye, a dark crease across it
    const s=sp(V0,q,r*.92,d),a=sp(V0,q,r*.92,nrm(add(d,mul(cross(up,d),.75)))),b=sp(V0,q,r*.92,nrm(add(d,mul(cross(up,d),-.75))));
    ctx.strokeStyle=dk(skin,.6);ctx.lineWidth=1.3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.quadraticCurveTo(s[0],s[1]+1.4,b[0],b[1]);ctx.stroke();ctx.restore();if(o.water!=null)ctx.restore();return}
  const ip=capPath(V0,q,r*.99,d,o.al||.7);
  if(ip){ctx.fillStyle=softBall(sp(V0,q,r,d),r*.8,iris,.25,.3);ctx.fill();ctx.save();ctx.clip();
    const sd=nrm(cross(up,d)),pw=o.pw||.42;ctx.strokeStyle='#1b1612';ctx.lineCap='round';
    if(o.pup==='slit'){const a=sp(V0,q,r,nrm(add(d,mul(up,.62)))),b=sp(V0,q,r,nrm(add(d,mul(up,-.62))));ctx.lineWidth=o.pl||1.2;seg(a,b);ctx.stroke()}
    else{const a=sp(V0,q,r,nrm(add(d,mul(sd,pw)))),b=sp(V0,q,r,nrm(add(d,mul(sd,-pw))));ctx.lineWidth=o.pl||1.25;seg(a,b);ctx.stroke()}
    ctx.restore();
    // the point of light, up and to the left on the iris
    const lq=sp(V0,q,r,nrm(add(d,add(mul(up,.38),mul(cross(up,d),.0))))),fv=V0.F(d);if(fv>.1&&!o.noLight){ctx.fillStyle='rgba(255,252,240,.95)';ball([lq[0]-.7,lq[1]-.2],.62);ctx.fill()}}
  // the upper lid: skin over the top of the ball, lower when it blinks or squints
  const bl=o.blink==null?1:o.blink,sq=o.squint||0,la=lerp(1.95,o.lid||.8,Math.min(bl,1-sq*.55));const lp=capPath(V0,q,r*1.02,up,la);
  if(lp){ctx.fillStyle=softBall(q,r,skin,.2,.3);ctx.fill();if(la>1.1&&lp.rim&&lp.rim.length>1){ctx.strokeStyle=dk(skin,.55);ctx.lineWidth=1.1;ctx.lineCap='round';line(lp.rim);ctx.stroke()}}
  ctx.restore();if(o.water!=null)ctx.restore()}

// ------------------------------------------------------------------ RANA: a green frog sitting on its rump, big yellow eyes on top of the head
// (EDRAW.frog): dark and purple spots, a cream belly, a wide smile, the throat sac that pulses and swells before the spit; the back legs
// folded at its sides (kicked out behind in the air), little front feet
const FC={body:'#5fb84a',dark:'#3f7a2a',belly:'#e8e0a0',sac:'#efe2a2',iris:'#ffb020',dot:'#b06ad8',mouth:'#4a1818',tongue:'#e07a8a',slow:'#8fc0c0',spit:'150,230,90'};
// the body: the rump sitting on the ground and the head in front of it, a little higher, in one smooth hull (the game's wide oval
// from the front, a frog's profile from the side)
const FR={C:[-2,0,8],R:[9.6,13.4,7.9],F:tilt(.22)},FH={C:[4.6,0,13.2],R:[7.8,11.4,6.3],F:tilt(-.08)};
// rest points: the eyes on top of the head, the hips and the shoulders, the chin (the throat sac hangs under it)
const F_EYE=[-1,1].map(sd=>onEll(FH.C,FH.R,FH.F,[.24,sd*.5,.83],2.2)),F_HIP=[-1,1].map(sd=>[-5,sd*8,4.2]),F_SH=[-1,1].map(sd=>[7.4,sd*6,4.4]),
  F_CHIN=onEll(FH.C,FH.R,FH.F,[.62,0,-.78],0),F_MOUTH=onEll(FH.C,FH.R,FH.F,[.96,0,-.25],.8);
// the spots: [rump (0) or head (1), unit direction on it, radius, purple?]
const F_SPOTS=[[0,[-.3,-.3,.9],2.6],[0,[-.65,.3,.7],2.2],[0,[-.1,.62,.78],1.9],[0,[-.15,-.82,.55],1.9],[0,[-.8,-.45,.4],1.6],[0,[-.95,.1,.3],1.7],[0,[.1,.95,.25],1.5],[1,[-.2,-.45,.87],1.6],[1,[.1,.55,.8],1.4],
  [0,[-.5,.05,.86],1.35,1],[0,[.2,-.92,.2],1.4,1],[0,[-.62,.68,.38],1.3,1],[1,[.35,.85,.1],1.15,1]];
function frogPose(anim,p){const ph=p*TAU,A={B:[0,0,0],lean:0,roll:0,s:0,yaw:0,k:0,fold:0,arm:0,sac:.14+.13*Math.sin(ph*2),open:0,blink:1,squint:0,shut:0,stars:0,puff:-1};
  if(anim==='walk'){// one hop as in the game: .0-.16 crouches, .16-.26 kicks off, .26-.66 flies with the back legs stretched out, .66-.8 lands
    // on the front feet and squashes, .8-1 settles (the game moves it only while it is in the air)
    const air=cl((p-.18)/.5,0,1),H=22;A.B=[0,0,air>0&&air<1?H*Math.sin(air*Math.PI):0];
    A.s=keys([[0,0],[.16,-.17],[.24,.2],[.5,.1],[.66,.06],[.74,-.17],[.86,.03],[1,0]],p);
    A.lean=keys([[0,0],[.16,.12],[.26,-.42],[.46,-.08],[.66,.22],[.76,.1],[.9,-.02],[1,0]],p);
    A.k=keys([[0,0],[.16,0],[.26,.9],[.36,1],[.56,.8],[.7,.15],[.8,0],[1,0]],p);A.fold=keys([[0,0],[.12,.6],[.18,.6],[.24,0],[1,0]],p);
    A.arm=keys([[0,0],[.2,0],[.32,-.6],[.56,.7],[.68,.8],[.8,0],[1,0]],p);A.squint=keys([[0,0],[.14,.5],[.24,.2],[.4,0],[.7,0],[.76,.6],[.9,0],[1,0]],p);A.sac=.15}
  else if(anim==='attack'){// the spit: .0-.55 the throat sac swells and the frog draws back, .55-.68 it lunges and spits with the mouth wide
    // open (a puff of poison), .68-1 the sac goes down and it settles
    A.sac=keys([[0,.2],[.55,1],[.58,.92],[.64,.22],[1,.22]],p);A.s=keys([[0,0],[.5,-.07],[.58,.08],[.7,-.05],[.85,.02],[1,0]],p);
    A.lean=keys([[0,0],[.5,-.14],[.6,.2],[.72,.08],[1,0]],p);A.B=[keys([[0,0],[.5,-.8],[.6,1.2],[.75,.4],[1,0]],p),0,0];
    A.open=keys([[0,0],[.54,0],[.6,1],[.68,.9],[.78,0],[1,0]],p);A.squint=keys([[0,0],[.5,.6],[.6,.2],[.78,0],[1,0]],p);A.puff=p>=.58&&p<.95?(p-.58)/.37:-1;A.arm=keys([[0,0],[.5,.15],[.6,-.2],[1,0]],p)}
  else if(anim==='hit'){const kb=hitK(p);A.lean=-.32*kb;A.B=[-2.6*kb,0,.5*kb];A.s=-.1*kb;A.roll=.07*kb;A.shut=p<.55?1:0;A.stars=p<.75?1-p/.75:0;A.k=.25*Math.max(0,kb);A.arm=-.4*kb;A.open=.35*(1-sstep(.34,.46,p));A.sac=0}
  else if(anim==='prep'){// gets ready to spit (held): the throat sac swelling and swelling, drawn back, eyes narrowed, a shiver
    const b=Math.sin(ph*2);A.sac=.72+.2*(.5+.5*b);A.s=-.06+.015*b;A.lean=-.12;A.B=[-.7+.15*Math.sin(ph*5),0,0];A.squint=.55;A.arm=.12}
  else if(anim==='die'){// .0-.15 the blow, .15-.55 a startled hop up, .55 it lands flat on its belly with the legs splayed out behind, then still, dizzy
    const k1=ez(cl(p/.15,0,1)),h=cl((p-.15)/.4,0,1),hop=Math.sin(h*Math.PI)*12,fl=p>.55?ez(cl((p-.55)/.12,0,1)):0;A.B=[-2*k1-2*h,0,hop];A.lean=-.3*k1*(1-h)+.18*fl;
    A.s=p<.55?-.1*k1+.12*Math.sin(h*Math.PI):-.24*fl+.04*Math.sin(cl((p-.55)/.3,0,1)*Math.PI*2)*(1-cl((p-.55)/.3,0,1));A.roll=.08*k1;A.k=p<.55?.4*h:1;A.fold=0;
    A.arm=p<.55?-.5*h:.7;A.shut=1;A.open=p>.5?.45:0;A.sac=0;A.stars=p>.65?.8:0}
  else{const b=Math.sin(ph);A.s=.02*b;A.yaw=look(p,.35);A.blink=blink(p,.42,.07);A.lean=-.02*b}
  return A}
function frog(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};const V0=V(face),{P,D,F}=V0,A=frogPose(anim,p),X=frame(A,0),body=o.slow?FC.slow:FC.body,legC=o.slow?dk(FC.slow,.25):cmix(FC.body,FC.dark,.8);
  floor(V0,x,y,sc,[A.B[0]+1,A.B[1],0],16,6.4,.3,A.B[2]);
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const L=parts(),dT=D(X.T(FR.C)),Er=ell3(V0,X,FR.C,FR.R,FR.F),Eh=ell3(V0,X,FH.C,FH.R,FH.F);
  // the back legs: a fat thigh, the shin and the long foot (ik, the knee goes forward): folded along the side of the rump, stretched
  // out behind in the air. The near one goes in front of the body when we see the rump's side (its place in the order: the hip at rest)
  for(const i of[0,1]){const sd=i?1:-1,hip=X.T(F_HIP[i]),k=A.k,lift=A.B[2],
      rest=[-4.5+A.fold*1.6,sd*(14.5-A.fold*.8),1.8],ext=add(hip,mul(nrm([-.9,sd*.3,-.18-.4*Math.max(0,1-lift/7)]),15.4)),
      ank=lerp3(rest,ext,ez(k)),toe=lerp3([4,sd*16,.5],add(ext,[-4.8,sd*1,-2.4]),ez(k)),[kn,an]=ik(hip,ank,8.9,6.9,[.5+k*.2,sd*(.85-k*.6),k*.8]);
    const col=dk(legC,.16*sstep(0,-.12,F(0,sd,0)));L.add(dT-20+D(F_HIP[i])*.01,()=>{chain(V0,[hip,kn,an,toe],[4.4,lerp(3.7,3,k),lerp(2.3,2,k),1.5],col,{kl:.18,kd:.3,rim:.18});
      // three round toes fanned at the end of the foot
      const dd=nrm(sub(toe,an)),sw=nrm(cross([0,0,1],dd));ctx.fillStyle=col;ctx.strokeStyle=INK;ctx.lineWidth=1.1;
      for(const t of[-1,0,1]){const e=P(add(toe,add(mul(dd,1.5-Math.abs(t)*.3),mul(sw,t*1.5))));ball(e,1.15);ctx.fill();ctx.stroke()}ball(P(toe),1.5);ctx.fill()})}
  // the front legs: short and stubby, the elbows back, little round feet with three toes on the ground (reaching forward in the air)
  for(const i of[0,1]){const sd=i?1:-1,sh=X.T(F_SH[i]),a=A.arm,air=A.B[2]>.5,foot=air?X.T([10.4+a*3.4,sd*7,1.4-Math.max(0,-a)*1.5]):[10+A.B[0]+a*1.2,sd*7+A.B[1],1],
      [el,ft]=ik(sh,foot,2.8,2.8,[-1,sd*.4,0]),col=dk(body,.2*sstep(0,-.12,F(0,sd,0)));
    L.add(dT-12+D([10,sd*7,1])*.01,()=>{chain(V0,[sh,el,ft],[2.8,2.4,2.2],col,{kl:.18,kd:.26,rim:.15});
      ctx.fillStyle=col;ctx.strokeStyle=INK;ctx.lineWidth=1.1;for(const t of[-1,0,1]){const e=P(add(ft,[1.7-Math.abs(t)*.4,t*1.5+sd*.2,-.6]));ball(e,1.1);ctx.fill();ctx.stroke()}ball(P(ft),1.9);ctx.fill()})}
  // the body: the hull of the rump and the head in three tones; each one's marks are hidden where the other one is in front of it: the
  // cream belly and throat, the spots, the wide smile (open when it spits)
  if(!o.dbg)L.add(dT,()=>{const oR=outline(Er,24),oH=outline(Eh,24),hp=chull(oR.concat(oH));paint(hp,body,{kl:.2,kd:.32});const bb=bbox(hp),headFront=D(Eh.c0)>D(Er.c0);
    const clipOut=(o2)=>{ctx.beginPath();for(const q of hp)ctx.lineTo(q[0],q[1]);ctx.closePath();ctx.moveTo(o2[0][0],o2[0][1]);for(const q of o2)ctx.lineTo(q[0],q[1]);ctx.closePath();ctx.clip('evenodd')};
    const marks=(E,id)=>{if(id===0){const bl=ellCap(E,[.84,0,-.54],.92);if(bl){poly(bl);ctx.fillStyle=softBox(bb,FC.belly,.12,.22);ctx.fill()}}
      else{const th=ellCap(E,[.5,0,-.86],.95);if(th){poly(th);ctx.fillStyle=softBox(bb,FC.belly,.12,.22);ctx.fill()}}
      for(const[w,m,r,pu] of F_SPOTS)if(w===id){const mm=nrm(m);spot(V0,E.p3(mm),E.N(mm),r,pu?FC.dot:FC.dark,{v0:.05,N:12})}};
    ctx.save();if(headFront)clipOut(oH);else{poly(hp);ctx.clip()}marks(Er,0);ctx.restore();
    ctx.save();if(!headFront)clipOut(oR);else{poly(hp);ctx.clip()}marks(Eh,1);
    const mth=k=>{const t=(k-.5)*2;return[Math.cos(t*1.45),Math.sin(t*1.45),-.2+.2*t*t]};
    if(A.open>.02){ctx.save();ctx.globalAlpha*=sstep(.02,.15,A.open);const lo=k=>{const t=(k-.5)*2,m=mth(k);return[m[0],m[1],m[2]-A.open*.5*(1-t*t)]},rr=ellRuns(Eh,k=>k<.5?mth(k*2):lo(2-k*2),40,.0);
      for(const r of rr){if(r.length<3)continue;ctx.fillStyle=FC.mouth;ctx.strokeStyle=INK;ctx.lineWidth=1.3;poly(r);ctx.fill();ctx.stroke();ctx.save();poly(r);ctx.clip();const tq=Eh.P(nrm([1,0,-.42-A.open*.15]));ctx.fillStyle=FC.tongue;ctx.beginPath();ctx.ellipse(tq[0],tq[1],3.4,1.9,0,0,TAU);ctx.fill();ctx.restore()}ctx.restore()}
    for(const r of ellRuns(Eh,mth,26)){if(r.length<2)continue;ctx.strokeStyle='#1b1612';ctx.lineWidth=1.5;ctx.lineCap='round';line(r);ctx.stroke()}
    ctx.restore()});
  // the throat sac: a cream ball under the chin that pulses as it breathes and swells up before the spit
  // (a bulge of the cream throat: its outline only round the bottom while small, so it grows out of the chin; it fades in and out with
  // the breath instead of popping, and its place in the draw order is the body at rest)
  {const r=1.4+A.sac*4.6,c3=add(F_CHIN,[r*.5-.4,0,-r*.3+.5]);L.add(F([1,0,-.3])>-.1?dT+1:dT-1,()=>{if(A.sac<.04)return;const q=P(X.T(c3)),k=sstep(.3,.75,A.sac),a0=lerp(.25,-.6,k),a1=Math.PI-a0;ctx.save();ctx.globalAlpha*=sstep(.04,.14,A.sac);
    ctx.fillStyle=softBall(q,r,FC.sac,.22,.18);ball(q,r);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=lerp(1.3,1.9,k);ctx.lineCap='round';ctx.beginPath();ctx.arc(q[0],q[1],r,a0,a1);ctx.stroke();
    if(k>.02)rim(q,r,q,r,.25*k);ctx.restore()})}
  // the eyes: two balls of skin on top of the head, the big yellow iris with the black bar, looking at whoever is in front
  for(const i of[0,1]){const sd=i?1:-1,fs=F(0,sd,0);L.add(fs<-.3?dT-1:dT+5+(fs>0?.5:0),()=>bulgeEye(V0,X,F_EYE[i],4.3,[1,sd*.26,.42],body,FC.iris,{pup:'bar',blink:A.blink,squint:A.squint,shut:A.shut,al:.74}))}
  // the spit: a puff of green poison from the mouth (the game shoots the drop)
  if(A.puff>=0&&!o.noFx)L.add(D(X.T(F_MOUTH))+2,()=>{const k=A.puff,m=X.T(F_MOUTH);for(let i=0;i<7;i++){const a=i/7*TAU,q=P(add(m,[2+k*10,Math.cos(a)*k*5,Math.sin(a)*k*4+k*2]));
      ctx.fillStyle=`rgba(${i%2?'150,230,90':'200,250,150'},${(1-k)*.8})`;ball(q,1.1+k*1.8);ctx.fill()}
    if(!LOWFX){const q=P(add(m,[3,0,0]));shine(FC.spit,q[0],q[1],8+k*10,.45*(1-k))}});
  run(L);
  if(A.stars>0)stars(P(X.T([2,0,30])),9,A.stars);
  ctx.restore()}
reg('frog',{n:'Rana',g:3,sc:1,an:['idle','walk','prep','attack','hit','die'],dur:{idle:2.6,walk:1,prep:.8,attack:.9,hit:.6,die:1},lab:{walk:'Saltella',attack:'Sputa'}},frog);

// ------------------------------------------------------------------ ZANZARA: a brown mosquito hovering in the air (EDRAW.mosquito): a round
// head with two big red eyes and the long proboscis, the dark thorax, the striped abdomen hanging back and down, two transparent wings
// that buzz too fast to see, six thin legs dangling. When it takes aim it trembles and its belly glows red, then it dives like a dart
const MQ={head:'#5a3a2a',thor:'#4a2f24',abd:'#8a4a3a',abdA:'#c8443a',eye:'#e5484d',eyeA:'#ff5a3c',leg:'#6e4a36',slow:'#8a8aa8',wing:'rgba(220,235,255,.45)',wingI:'rgba(27,22,18,.6)',glow:'255,80,60'};
// the body hovers with the thorax T at the height of the game's drawing; the head in front and a little up, the abdomen hangs back and
// down (seen from the front it hangs under the thorax, as in the game)
const MT=[0,0,26],MH=add(MT,[4,0,3.4]),MAx=nrm([-.36,0,-.93]),MA=add(MT,mul(MAx,8)),MAF=(()=>{const u=MAx,v=[0,1,0],w=cross(u,v);return{u,v,w:mul(w,-1)}})();
function mozPose(anim,p){const ph=p*TAU,A={B:[0,0,0],lean:0,roll:0,s:0,yaw:0,bob:Math.sin(ph*2)*1.4,aim:0,dive:0,sweep:0,flap:24,legT:0,blink:1,shut:0,stars:0,shake:0,trail:-1};
  if(anim==='walk'){// flying about: tipped forward, quicker bob, the legs trail behind
    A.lean=.32;A.bob=Math.sin(ph*2)*1.8;A.roll=.12*Math.sin(ph);A.legT=.7;A.B=[0,1.2*Math.sin(ph),0]}
  else if(anim==='attack'){// .0-.45 takes aim: rears back, trembles, the abdomen glows red; .45-.75 dives like a dart (the game moves it),
    // wings swept back, legs trailing; .75-1 brakes and hovers again
    A.aim=keys([[0,0],[.1,.6],[.45,1],[.5,1],[.75,.4],[1,0]],p);A.dive=keys([[0,0],[.44,0],[.52,1],[.72,1],[.86,0],[1,0]],p);
    A.lean=keys([[0,0],[.42,-.3],[.52,.62],[.72,.55],[.86,-.1],[1,0]],p);A.B=[keys([[0,0],[.44,-2.4],[.56,5],[.72,6],[.9,0],[1,0]],p),0,keys([[0,0],[.44,1.5],[.6,-2.5],[.74,-3],[.9,.5],[1,0]],p)];
    A.sweep=A.dive;A.legT=Math.max(A.dive,.2);A.shake=A.aim*(1-sstep(.4,.47,p));A.bob*=1-A.aim;A.flap=36;A.trail=p>.48&&p<.8?(p-.48)/.32:-1}
  else if(anim==='hit'){const kb=hitK(p);A.lean=-.45*kb;A.roll=.4*kb;A.B=[-3*kb,0,1.5*kb];A.shut=p<.55?1:0;A.stars=p<.75?1-p/.75:0;A.legT=-.5*kb;A.flap=12}
  else if(anim==='prep'){// takes aim (held): reared back, trembling, the abdomen glowing red
    A.aim=.85+.1*(.5+.5*Math.sin(ph*2));A.lean=-.28;A.B=[-2.2,0,1.4];A.shake=.8;A.flap=36;A.bob*=.2;A.legT=.2}
  else if(anim==='die'){// .0-.15 the blow, then it spins down with the wings stopping, lands on its back, the legs curled up, dizzy
    const k1=ez(cl(p/.15,0,1)),k2=cl((p-.15)/.5,0,1),fall=k2*k2;A.lean=-.45*k1*(1-k2)-.3*k2;A.roll=.4*k1+2.6*ez(k2);A.yaw=k2*TAU;A.B=[-3*k1,0,1.5*k1*(1-fall)-(MT[2]-3)*fall];
    A.bob=0;A.flap=24*(1-k2);A.shut=1;A.legT=-.5-.6*k2;A.stars=p>.68?.8:0}
  else{A.yaw=look(p,.4);A.blink=blink(p,.62,.07)}
  return A}
// a buzzing wing: an almond from the root along the span, flat in the plane of the span and the chord; transparent, a thin dark edge
function mozWing(V0,root,U,Cd,L,W,al){const N=12,pts=[];for(let i=0;i<=N;i++){const k=i/N,w=W*Math.sin(Math.PI*Math.pow(k,.75));pts.push(V0.P(add(add(root,mul(U,k*L)),mul(Cd,w*.35))))}
  for(let i=N-1;i>0;i--){const k=i/N,w=W*Math.sin(Math.PI*Math.pow(k,.75));pts.push(V0.P(add(add(root,mul(U,k*L)),mul(Cd,-w))))}
  ctx.save();ctx.globalAlpha*=al;ctx.lineJoin='round';poly(pts);ctx.fillStyle=MQ.wing;ctx.fill();ctx.strokeStyle=MQ.wingI;ctx.lineWidth=1;ctx.stroke();
  // two faint veins
  const a=V0.P(add(root,mul(U,L*.1))),b=V0.P(add(root,mul(U,L*.85)));ctx.strokeStyle='rgba(27,22,18,.25)';ctx.lineWidth=.7;seg(a,b);ctx.stroke();ctx.restore()}
function mosquito(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};const V0=V(face),{P,D,F}=V0,A=mozPose(anim,p),ph=p*TAU;
  // the whole insect turns round the thorax: lean (nose down > 0), roll, yaw; it bobs and trembles
  // (the tremble of the aim at 8 and 6 Hz: faster shakes turn into a random jitter on the frames of a phone)
  const jit=A.shake>0?[Math.sin(p*TAU*11)*.9*A.shake,Math.sin(p*TAU*9)*.7*A.shake,0]:[0,0,0];A.B=add(add(A.B,[0,0,A.bob]),jit);const X=frame(A,MT[2]);
  const aim=A.aim,abd=o.slow?MQ.slow:cmix(MQ.abd,MQ.abdA,aim),eye=aim>.3?MQ.eyeA:MQ.eye;
  floor(V0,x,y,sc,[X.T(MT)[0],X.T(MT)[1],0],8,3.2,.22,X.T(MT)[2]*.5);
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const L=parts(),dT=D(MT),Tc=X.T(MT);
  // the red glow while it takes aim
  if(aim>.05&&!o.noFx&&!LOWFX)L.add(dT-30,()=>{const q=P(X.T(MA));shine(MQ.glow,q[0],q[1],14,(.3+.25*Math.sin(p*TAU*9))*aim)});
  // six thin legs dangling under the thorax, swaying slowly; they trail behind in flight
  for(let i=0;i<3;i++)for(const sd of[-1,1]){const hip=add(MT,[1.4-i*1.4,sd*1.3,-3.6]),sw=Math.sin(ph+i*1.3+sd)*1.2,tr=A.legT,
      kn=add(hip,[[1.8,.2,-1.6][i]-tr*3.4+sw*.3,sd*(3.8+i*.5),-5+tr*1.8]),ft=add(kn,[[1,-.3,-1.8][i]-tr*4.6+sw,sd*.9,-5.8+tr*2.6]),far=F(0,sd,0)<0;
    L.add(dT-12+D(kn)*.01,()=>{const pts=[P(X.T(hip)),P(X.T(kn)),P(X.T(ft))];ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=INK;ctx.lineWidth=2.3;line(pts);ctx.stroke();
      ctx.strokeStyle=far?dk(MQ.leg,.3):MQ.leg;ctx.lineWidth=.9;line(pts);ctx.stroke()})}
  // the abdomen: an egg hanging back and down, with dark stripes round it, glowing red when it takes aim
  const Ea=ell3(V0,X,MA,[8.2,4.9,5],MAF);
  L.add(D(MA),()=>{const hp=outline(Ea,22);paint(hp,abd,{kl:.24,kd:.24});ctx.save();poly(hp);ctx.clip();
    for(const k of[-.5,-.1,.3,.65]){const r=Math.sqrt(1-k*k);for(const rr of ellRuns(Ea,t=>[k,Math.cos(t*TAU)*r,Math.sin(t*TAU)*r],20)){if(rr.length<2)continue;ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=1.2;ctx.lineCap='round';line(rr);ctx.stroke()}}
    if(aim>.2&&!LOWFX){const q=Ea.P(nrm([0,-.3,.9]));ctx.fillStyle=`rgba(255,200,170,${.25*aim})`;ctx.beginPath();ctx.ellipse(q[0],q[1],3,1.6,0,0,TAU);ctx.fill()}
    ctx.restore()});
  // the thorax: a dark round chest
  L.add(dT,()=>{sball(V0,Tc,5.2,o.slow?dk(MQ.slow,.2):MQ.thor,{kl:.3,kd:.2})});
  // the wings from the top of the thorax, buzzing up and down (two faint ghosts at the ends of the beat make the blur)
  // (a blur has no edge to show, so the wing turns its face to us: its chord is across the span and across the way to the camera)
  const cv=nrm([V0.s,V0.c,cam.k/cam.zk]),beat=Math.sin(ph*A.flap),wing=(sd,ph0,al)=>{const up=.24+ph0*.3-A.sweep*.2,bk=.42+A.sweep*.8,U=X.Rd(nrm([-Math.sin(bk),sd*Math.cos(bk)*Math.cos(up),Math.cos(bk)*Math.sin(up)])),
      fx=X.Rd([1,0,0]),c0=cross(U,cv),c1=nrm(sub(fx,mul(U,dot(U,fx)))),Cd=len(c0)>.15?nrm(add(mul(nrm(c0),dot(c0,fx)>=0?.6:-.6),mul(c1,.4))):c1,root=X.T(add(MT,[.4,sd*2,3.8])),
      a=P(root),b=P(add(root,mul(U,18))),fl=Math.hypot(b[0]-a[0],b[1]-a[1])/18;mozWing(V0,root,U,Cd,18,3.9,al*(fl<.5?.4+fl*1.2:1))};
  for(const sd of[-1,1]){const far=F(0,sd,.5)<0;L.add(far?dT-.5:D(add(MT,[-2,sd*8,6]))+2,()=>{if(!LOWFX&&!o.noBlur){wing(sd,1,.25);wing(sd,-1,.25)}wing(sd,beat,1)})}
  // the head: a round brown head with two big red eyes and a point of light, the long proboscis pointing forward and down
  const Hc=X.T(MH);L.add(D(MH)+.5,()=>{const pr0=X.T(add(MH,[3.2,0,-1])),pr1=X.T(add(MH,[3.2+8.8*.94,0,-1-8.8*.34])),fp=F(X.Rd([1,0,0]))<-.2;
    const prob=()=>{ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=2.2;seg(P(pr0),P(pr1));ctx.stroke();ctx.strokeStyle='#3a2418';ctx.lineWidth=.8;seg(P(pr0),P(pr1));ctx.stroke()};
    if(fp)prob();const q=sball(V0,Hc,3.9,MQ.head,{kl:.3,kd:.2,lw:2.2});
    for(const sd of[-1,1]){const d=X.Rd(nrm([.62,sd*.62,.3])),v=F(d);if(v<-.1)continue;const c=add(Hc,mul(d,2.9)),eq=P(c),er=1.9;
      if(A.shut){ctx.strokeStyle='#1b1612';ctx.lineWidth=1.1;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(eq[0]-er,eq[1]-.4);ctx.quadraticCurveTo(eq[0],eq[1]+1.2,eq[0]+er,eq[1]-.4);ctx.stroke();continue}
      ctx.save();ctx.globalAlpha*=cl((v+.1)*4,0,1);if(aim>.3&&!LOWFX)shine(MQ.glow,eq[0],eq[1],5,.5*aim);ink(1.3);ball(eq,er);ctx.fillStyle=softBall(eq,er,eye,.3,.25);ctx.fill();ctx.stroke();
      if(A.blink>.5){ctx.fillStyle='#fff';ball([eq[0]-er*.35,eq[1]-er*.4],.55);ctx.fill()}ctx.restore()}
    if(!fp)prob()});
  // the dive: a few red streaks behind it (the game leaves its own trail)
  if(A.trail>=0&&!o.noFx&&!LOWFX)L.add(dT-20,()=>{const k=A.trail;for(let i=0;i<3;i++){const a=X.T(add(MT,[-6-i*3,(i-1)*3,(i-1)*2])),b=X.T(add(MT,[-16-i*4-k*8,(i-1)*3.4,(i-1)*2.2]));
    ctx.strokeStyle=`rgba(255,110,90,${.5*(1-k)})`;ctx.lineWidth=1.4;ctx.lineCap='round';seg(P(a),P(b));ctx.stroke()}});
  run(L);
  if(A.stars>0)stars(P(X.T(add(MH,[0,0,6]))),7,A.stars);
  ctx.restore()}
reg('mosquito',{n:'Zanzara',g:3,sc:1,an:['idle','walk','prep','attack','hit','die'],dur:{idle:2.4,walk:1.2,prep:.8,attack:1.4,hit:.6,die:.9},lab:{walk:'Vola',attack:'Mira e picchia'}},mosquito);

// ------------------------------------------------------------------ COCCODRILLO: a green crocodile (EDRAW.croc), a long animal seen from every
// side: the body is a chain of ellipsoids along a spine that bends as it crawls (seamless: every outline first, then every fill), two rows
// of dark scutes down the back and a crest on the long tail, four short sprawling legs with ik, the head with yellow slit eyes on top and
// the long snout of two jaws full of little white teeth. It sinks under the water and comes up to bite (the dive move; o.water clips it)
const CC={body:'#6b7a3a',leg:'#5a6a32',scute:'#4a5a2a',belly:'#8a9a5a',eye:'#ffd86b',teeth:'#f6ead2',mouth:'#8a2a2a',tongue:'#c8606a',slow:'#8aa0a8',water:'30,40,24',ring:'200,230,170'};
// the chain from the skull to the tip of the tail: [x, z, rx, ry, rz] at rest (the spine runs along x); the skull is the first one
const CSEG=[[11.2,6.1,5.6,6.8,4.6],[6.6,6.3,5.4,8,5.3],[1.6,6.6,6.6,10.2,6.1],[-4.4,6.6,7,10.6,6.2],[-10.2,6.1,5.8,8.2,5.5],[-15.2,5.4,5.2,6,4.9],[-20.2,4.6,4.8,4.7,4.1],
  [-25,3.9,4.4,3.6,3.3],[-29.4,3.2,3.8,2.7,2.6],[-33.2,2.6,3.2,1.9,1.9],[-36.4,2.1,2.4,1.2,1.2]];
// the jaws in the head's own frame: [x, half width, top z, bottom z] at the base and at the tip; the hinge; the teeth along the edges
const JU=[[13.4,6.2,9.2,4.8],[30.6,3.2,7.3,4.8]],JL=[[13,5.8,4.8,1],[30,3.1,4.8,2.2]],HINGE=[12.4,0,4.8],NECK=[8.4,0,6];
// the legs: [shoulder or hip (rest), foot (rest), upper bone, lower bone]
const CLEG=[[[6.2,-6.6,4.6],[8.8,-13.4,0],5,4.8],[[6.2,6.6,4.6],[8.8,13.4,0],5,4.8],[[-8.6,-7,4.6],[-6.4,-13.8,0],5.2,5],[[-8.6,7,4.6],[-6.4,13.8,0],5.2,5]];
function crocPose(anim,p){const ph=p*TAU,A={B:[0,0,0],lean:0,roll:0,s:0,yaw:0,bend:0,wave:0,tail:Math.sin(ph)*.9,tailPh:ph,hy:look(p,.28),hp:0,open:.04,blink:blink(p,.7,.07),shut:0,stars:0,
    breath:Math.sin(ph),steps:null,sink:0,snapFx:-1,lift:0};
  if(anim==='walk'){// a real crawl: diagonal pairs of legs (front left with back right), the spine bends from side to side, the tail swings
    // behind out of step, the head stays pointed ahead
    const st=stepper(p,.6);A.steps=[st(0,3.4,2.2),st(.5,3.4,2.2),st(.5,3.6,2),st(0,3.6,2)];A.bend=Math.sin(ph);A.wave=1;A.tail=Math.sin(ph-1.1)*2.4;A.hy=0;A.lift=.7+.35*Math.abs(Math.cos(ph));A.roll=.04*Math.sin(ph)}
  else if(anim==='attack'){// the snap: .0-.36 rears the head up and opens the jaws wide, the body draws back; .36-.46 snaps them shut with a
    // lunge; .46-1 settles. The game pushes it forward a little at the snap
    A.open=keys([[0,.04],[.32,1],[.38,1],[.44,0],[.6,.08],[1,.04]],p);A.hp=keys([[0,0],[.32,-.22],[.4,-.14],[.46,.12],[.62,0],[1,0]],p);A.hy=0;
    A.B=[keys([[0,0],[.34,-2],[.44,3.2],[.62,1],[1,0]],p),0,0];A.lean=keys([[0,0],[.34,-.06],[.44,.05],[.62,0],[1,0]],p);A.tail=keys([[0,0],[.34,-1.6],[.46,2.4],[.7,-.8],[1,0]],p);
    A.snapFx=p>=.42&&p<.7?(p-.42)/.28:-1;A.blink=1}
  else if(anim==='dive'){// .0-.3 sinks into the water, .3-.7 only the eyes and the nostrils are out, .7-1 comes back up (the game draws the
    // water; the part under it is cut away at o.water, the floor if not given)
    A.sink=keys([[0,0],[.3,1],[.7,1],[1,0]],p);A.lean=-.14*A.sink;A.tail=Math.sin(ph*2)*1.6;A.hy=Math.sin(ph)*.14;A.blink=blink(p,.9,.06)}
  else if(anim==='hit'){const kb=hitK(p);A.B=[-2.6*kb,0,.4*kb];A.lean=-.1*kb;A.roll=.06*kb;A.hp=-.25*kb;A.open=p<.4?.5:.04;A.shut=p<.55?1:0;A.stars=p<.75?1-p/.75:0;A.tail=3*kb;A.bend=-.8*kb}
  else if(anim==='prep'){// gets ready to snap (held): the head reared up, the jaws open wide, the body drawn back, the tail lashing
    const b=Math.sin(ph*2);A.open=.85+.12*(.5+.5*b);A.hp=-.2;A.hy=0;A.B=[-1.8+.2*Math.sin(ph*5),0,0];A.lean=-.05;A.tail=-1.4+.7*Math.sin(ph*3);A.blink=1}
  else if(anim==='die'){// .0-.16 the blow, .16-.6 it rolls over onto its side, the belly showing, the jaws hanging open, the tail going limp, dizzy
    const k1=ez(cl(p/.16,0,1)),k2=ez(cl((p-.16)/.44,0,1));A.B=[-2.6*k1,0,.4*k1+5.5*k2];A.lean=-.1*k1*(1-k2);A.roll=.06*k1+1.3*k2;A.hp=-.25*k1*(1-k2)+.1*k2;
    A.open=.4*k2+(p<.3?.5*(1-k2):0);A.shut=1;A.tail=3*k1*(1-k2)+.6*k2;A.bend=-.8*k1*(1-k2)+.3*k2;A.hy=0;A.breath=0;A.blink=1;A.stars=p>.62?.8:0}
  return A}
// where a point of the spine at x (rest) moves sideways, and the turn of the chain there
function spineY(A,x){let y=0;if(A.wave)y+=.9*A.bend*Math.sin(x*.16+.6);else y+=.5*A.bend*Math.sin(x*.12);
  if(x<-9){const t=(-9-x)/27;y+=A.tail*3.2*Math.pow(t,1.3)*Math.cos((A.wave?1:.4)*t*2.4)}return y}
function croc(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};const V0=V(face),{P,D,F}=V0,A=crocPose(anim,p),body=o.slow?CC.slow:CC.body,legC=o.slow?dk(CC.slow,.15):CC.leg;
  const WL=o.water!=null?o.water:anim==='dive'?0:null,sinkZ=-11.5*A.sink;A.B=add(A.B,[0,0,sinkZ+A.lift]);const X=frame(A,4);
  // the head turns on the neck (its own frame Xh); the snout opens round the hinge
  const hy=A.hy-.9*(spineY(A,9)-spineY(A,4))/5,hp=A.hp,yN=spineY(A,NECK[0]),
    hRot=v=>{let r=C.rotY(v,hp*.6);return C.rotZ(r,hy)},hT=q=>add(add(hRot(sub(q,NECK)),NECK),[0,yN,0]),Xh={T:q=>X.T(hT(q)),Rd:v=>X.Rd(hRot(v))};
  const op=A.open,jU=q=>{const r=C.rotY(sub(q,HINGE),-.62*op);return add(r,HINGE)},jL=q=>{const r=C.rotY(sub(q,HINGE),.3*op);return add(r,HINGE)};
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const L=parts(),Cm=X.T([-2,0,6]),dT=D(Cm);
  // its shadow: a long soft ellipse on the floor under the body (it fades as it sinks)
  {const sh=Math.max(0,1-A.sink*1.6);if(sh>0&&!noShadow){const pts=[];for(let i=0;i<24;i++){const t=i/24*TAU,xx=-2+A.B[0]+Math.cos(t)*27,yy=Math.sin(t)*(9-Math.max(0,-Math.cos(t))*4.5);pts.push(P([xx,yy+spineY(A,xx)*.7,0]))}
    ctx.fillStyle=`rgba(0,0,0,${.28*sh})`;smooth(pts);ctx.fill()}}
  // the segments of the chain: the ellipsoid (the skull turns with the head), its depth from the rest pose
  const seg3=CSEG.map(([sx,sz,rx,ry,rz],i)=>{const yy=spineY(A,sx),a=Math.atan2(spineY(A,sx+1)-spineY(A,sx-1),2),br=i>=1&&i<=4?1+.025*A.breath:1;
    let E;if(i===0)E=ell3(V0,Xh,[sx,0,sz],[rx,ry*br,rz],AXES);else E=ell3(V0,X,[sx,yy,sz],[rx,ry*br,rz*br],{u:[Math.cos(a),Math.sin(a),0],v:[-Math.sin(a),Math.cos(a),0],w:[0,0,1]});
    return{E,i,d:D([sx,0,sz]),o:outline(E,i>6?14:20,WL)}});
  // the scutes: little dark ridges in two rows down the back, one row down the tail (on the segment they sit on), gathered in one path
  // (each ridge turns its face to us, so it reads as a little spike from every side)
  const cv=[V0.s,V0.c,cam.k/cam.zk],scutes=(sg,tris)=>{const E=sg.E,i=sg.i,one=(m,h,w)=>{if(E.vis(m)<-.05)return;const b=E.p3(m);if(WL!=null&&b[2]<WL+.3)return;const n=E.N(m);let fw=cross(n,cv);fw=len(fw)<.1?nrm(cross(n,[0,1,0])):nrm(fw);
      tris.push([P(add(b,mul(fw,w))),P(add(b,mul(n,h))),P(add(b,mul(fw,-w)))])};
    if(i>=1&&i<=4)for(const k of[-.42,.2])for(const sd of[-1,1])one(nrm([k,sd*.36,.93]),2.1,1.35);
    if(i>=5&&i<=9)for(const k of[-.35,.3])one(nrm([k,0,1]),2.3-i*.12,1.3-i*.06)};
  const drawTris=tris=>{if(!tris.length)return;ctx.beginPath();for(const[a,t,c] of tris){ctx.moveTo(a[0],a[1]);ctx.lineTo(t[0],t[1]);ctx.lineTo(c[0],c[1])}ctx.fillStyle=CC.scute;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.lineJoin='round';ctx.stroke()};
  // every outline of the chain first (one path), then the body and the tail filled, the farther one first, each with its scutes
  const segs=seg3.filter(sg=>sg.o&&sg.o.length>2),bb=bbox([].concat(...segs.map(sg=>sg.o))),groups=[[segs.filter(sg=>sg.i<5),D([1,0,6])],[segs.filter(sg=>sg.i>=5),D([-24,0,4])]].filter(g=>g[0].length).sort((a,b)=>a[1]-b[1]);
  L.add(dT,()=>{const hd=P(Xh.T([20,0,5])),tl=P(X.T([-30,spineY(A,-30),3])),ax=[hd[0]-tl[0],hd[1]-tl[1]],al=Math.hypot(ax[0],ax[1])||1;let n=[-ax[1]/al,ax[0]/al];if(n[0]+n[1]>0)n=[-n[0],-n[1]];
    // the light falls across the body: a band from the lit side to the dark side, the same along the whole length
    let m0=1e9,m1=-1e9;const c0=[(bb[0]+bb[2])/2,(bb[1]+bb[3])/2];for(const sg of segs)for(const q of sg.o){const t=(q[0]-c0[0])*n[0]+(q[1]-c0[1])*n[1];m0=Math.min(m0,t);m1=Math.max(m1,t)}
    const g=ctx.createLinearGradient(c0[0]+n[0]*m1,c0[1]+n[1]*m1,c0[0]+n[0]*m0,c0[1]+n[1]*m0);g.addColorStop(0,lt(body,.16));g.addColorStop(.45,body);g.addColorStop(1,dk(body,.3));
    ctx.lineJoin='round';ctx.beginPath();for(const sg of segs)subPoly(sg.o);ctx.strokeStyle=INK;ctx.lineWidth=5;ctx.stroke();
    for(const[G] of groups){ctx.beginPath();for(const sg of G)subPoly(sg.o);ctx.fillStyle=g;ctx.fill();const tris=[];for(const sg of G)scutes(sg,tris);drawTris(tris)}});
  // under the water (the dive): a dark patch of water round the head with a light ring that ripples (the game's 'under' look)
  if(A.sink>.15&&!o.noFx)L.add(-1e3,()=>{const k=sstep(.15,.6,A.sink),c=P([12+A.B[0],spineY(A,12),WL||0]),rp=Math.sin(p*TAU*3);ctx.save();ctx.globalAlpha*=k;
    ctx.fillStyle=`rgba(${CC.water},.55)`;ctx.beginPath();ctx.ellipse(c[0],c[1],16+k*4,7*C.KR()+k*2,0,0,TAU);ctx.fill();
    ctx.strokeStyle=`rgba(${CC.ring},${.3+.12*rp})`;ctx.lineWidth=1.4;ctx.beginPath();ctx.ellipse(c[0],c[1],18+k*5+rp*1.5,8*C.KR()+k*2.4+rp*.6,0,0,TAU);ctx.stroke();ctx.restore()});
  // the legs: two bones each (ik, the elbows and knees out to the side and up: a sprawling crawl), a flat foot with four toes
  CLEG.forEach(([r0,f0,L1,L2],i)=>{const sd=Math.sign(r0[1]),st=A.steps?A.steps[i]:{x:0,z:0},root=X.T([r0[0],r0[1]+spineY(A,r0[0]),r0[2]]),
      foot=[f0[0]+st.x+A.B[0],f0[1]+spineY(A,r0[0])*.6,st.z+Math.max(0,A.B[2]-A.lift)*0],far=F(0,sd,0)<0;
    if(A.sink>.35)return;const[el,ft]=ik(root,add(foot,[0,0,1.2]),L1,L2,[r0[0]>0?-.2:.3,sd*.8,.7]),col=far?dk(legC,.15):legC;
    L.add(far?dT-30+i*.01:D(add(r0,[0,sd*4,0]))+(r0[0]>0?.2:0),()=>{if(A.sink>0){ctx.save();ctx.globalAlpha*=1-A.sink/.35}
      chain(V0,[root,el,ft],[3.4,2.8,2.3],col,{kl:.16,kd:.28,rim:.16});
      const fd=nrm([1,sd*.45,0]),sw=nrm(cross([0,0,1],fd));ctx.beginPath();for(const t of[-1.5,-.5,.5,1.5]){const e=P(add(ft,add(add(mul(fd,1.9-Math.abs(t)*.3),mul(sw,t*1.1)),[0,0,-1])));ctx.moveTo(e[0]+.95,e[1]);ctx.arc(e[0],e[1],.95,0,TAU)}
      ctx.fillStyle=col;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.1;ctx.stroke();ball(P(add(ft,[0,0,-.6])),2);ctx.fill();
      if(A.sink>0)ctx.restore()})});
  // the jaws: the lower one, the inside of the mouth when it opens, the upper one; teeth along both edges, nostrils on the tip
  const jaw=(J,tf)=>{const pts=[];for(const[jx,w,zt,zb] of J){const top=J===JU;for(let k=0;k<=8;k++){const t=k/8*Math.PI,yy=-Math.cos(t)*w,zz=top?zb+Math.sin(t)*(zt-zb):zt-Math.sin(t)*(zt-zb);pts.push(Xh.T(tf([jx,yy,zz])))}
      pts.push(Xh.T(tf([jx-.6,0,top?zb:zt])))}return pts},under=q=>WL!=null&&q[2]<WL;
  const dJ=D([24,0,5]);
  L.add(dJ,()=>{const ptsL=jaw(JL,jL),ptsU=jaw(JU,jU),clipW=WL!=null&&A.sink>0;
    const cut=pts=>clipW?pts.filter(q=>q[2]>=WL):pts,dr=(pts,col,lw)=>{const pp=cut(pts);if(pp.length<3)return null;return C.vol(V0,pp,col,{kl:.2,kd:.26,rim:.22,lw})};
    const hl=dr(ptsL,dk(body,.06),1.9);
    if(op>.06){const inner=[];for(const[J,tf] of[[JU,jU],[JL,jL]])for(const[jx,w,zt,zb] of J)for(const sd of[-1,1])inner.push(P(Xh.T(tf([jx,sd*(w-.4),J===JU?zb:zt]))));
      const ih=chull(inner);ctx.fillStyle=CC.mouth;ctx.strokeStyle=INK;ctx.lineWidth=1.2;poly(ih);ctx.fill();ctx.stroke();
      const tq=P(Xh.T(jL([18,0,4.7])));ctx.fillStyle=CC.tongue;ctx.beginPath();ctx.ellipse(tq[0],tq[1],3.2,1.6,0,0,TAU);ctx.fill()}
    // the teeth: little white triangles along the edges of both jaws, on the sides that face us
    const teeth=(J,tf,dn)=>{ctx.beginPath();for(const sd of[-1,1]){if(F(Xh.Rd([0,sd,0]))<-.25)continue;for(let k=0;k<4;k++){const tx=J[0][0]+3+k*3.6+(dn?0:1.8),u=(tx-J[0][0])/(J[1][0]-J[0][0]),w=lerp(J[0][1],J[1][1],u)-.3,z0=J===JU?J[0][3]:J[0][2],
      bc=Xh.T(tf([tx,sd*w,z0+(dn?.5:-.5)])),tc=Xh.T(tf([tx,sd*(w+1),z0+(dn?-1.9:1.8)]));let hw=cross(sub(tc,bc),cv);hw=len(hw)<.1?Xh.Rd([1.2,0,0]):mul(nrm(hw),1.2);
      const b0=P(add(bc,hw)),b1=P(sub(bc,hw)),tp=P(tc);ctx.moveTo(b0[0],b0[1]);ctx.lineTo(tp[0],tp[1]);ctx.lineTo(b1[0],b1[1]);ctx.closePath()}}ctx.fillStyle=CC.teeth;ctx.fill();ctx.strokeStyle='rgba(27,22,18,.8)';ctx.lineWidth=.55;ctx.stroke()};
    if(!clipW){teeth(JL,jL,false)}
    dr(ptsU,body,2.1);if(!clipW)teeth(JU,jU,true);
    // the nostrils: two little bumps on the tip of the snout
    for(const sd of[-1,1]){const c=Xh.T(jU([28.4,sd*1.3,7.9]));if(F(Xh.Rd([.3,0,1]))>0){ctx.save();if(waterClip(V0,c,1.6,WL)){const q=P(c);ctx.fillStyle=body;ink(1.2);ball(q,1.25);ctx.fill();ctx.stroke();ctx.fillStyle='#1b1612';ctx.beginPath();ctx.ellipse(q[0],q[1]-.15,.55,.4,0,0,TAU);ctx.fill()}ctx.restore()}}});
  // the eyes on top of the skull: green bumps with a yellow iris and a dark slit, looking ahead
  for(const sd of[-1,1]){const c3=[10.4,sd*4.1,9.6];L.add(D([10.4,sd*4.1,9.6])+(F(0,sd,0)<-.4?-30:6),()=>bulgeEye(V0,Xh,c3,3.1,[1,sd*.42,.48],body,CC.eye,{pup:'slit',blink:A.blink,shut:A.shut,al:.66,lw:2,lid:.85,water:WL}))}
  // the snap: two white strokes at the tip of the snout as the jaws slam shut
  if(A.snapFx>=0&&!o.noFx)L.add(dJ+1,()=>{const k=A.snapFx,c=P(Xh.T([32,0,5]));ctx.strokeStyle=`rgba(255,255,240,${(1-k)*.9})`;ctx.lineWidth=1.6;ctx.lineCap='round';
    for(const a of[-.9,-.3,.3,.9]){const r0=4+k*5,r1=7+k*7;ctx.beginPath();ctx.moveTo(c[0]+Math.sin(a)*r0,c[1]-Math.cos(a)*r0*.8);ctx.lineTo(c[0]+Math.sin(a)*r1,c[1]-Math.cos(a)*r1*.8);ctx.stroke()}});
  run(L);
  if(A.stars>0)stars(P(Xh.T([10,0,16])),9,A.stars);
  ctx.restore()}
reg('croc',{n:'Coccodrillo',g:3,sc:1,an:['idle','walk','prep','attack','dive','hit','die'],dur:{idle:2.6,walk:.9,prep:.8,attack:.8,dive:2,hit:.6,die:1},lab:{walk:'Striscia',attack:'Morso',dive:'Si immerge'}},croc);

// ------------------------------------------------------------------ LUMACA: a yellow snail (EDRAW.snail) with a big purple shell coiled in a
// spiral, a soft body that glides along the floor with ripples running down its foot, two eye stalks with round white eyes that bob about.
// When it is hit three times it pulls itself into the shell and the shell rolls at the hero (attack), then it comes out again
const SN={foot:'#d8c86a',footS:'#a8c8c8',shell:'#9a62aa',shellL:'#c890d8',shellD:'#6a3a7a',line:'#e8c8f0',eye:'#f6ead2',slime:'rgba(255,255,255,.35)'};
// the body along the floor: [x, z, rx, ry, rz] from the tail to the neck; the head on top of the neck; the shell on the back
const SBODY=[[-15.4,1.7,3.4,3,1.7],[-11,2.4,5,4.8,2.4],[-5,2.9,6,6,2.9],[1.2,3,6,6,3],[7,3.6,5,5,3.6],[11.4,6.2,3.8,4.4,4.6]],SHEAD=[14.8,0,10.4],SHR=4.3,
  SSH={C:[-4.6,0,16.4],R:[12,11.4,12.2]};
function snailPose(anim,p,o){const ph=p*TAU,A={B:[0,0,0],lean:0,roll:0,s:0,yaw:0,ins:0,spin:0,ripple:0,stretch:0,hy:look(p,.3),hp:Math.sin(ph)*.05,st:[Math.sin(ph+.4)*.12,Math.sin(ph*2+1.9)*.1],
    blink:blink(p,.33,.08),shut:0,stars:0,bounce:0,arcs:-1,shellB:Math.sin(ph)*.25};
  if(anim==='walk'){// a slow glide: waves run down the foot from the head to the tail, the body stretches and gathers, the stalks sway
    A.ripple=1;A.stretch=.06*Math.sin(ph);A.hy=.06*Math.sin(ph);A.st=[Math.sin(ph+.6)*.18,Math.sin(ph+2.2)*.16];A.shellB=.5*Math.sin(ph*2)}
  else if(anim==='attack'){// the shell charge: .0-.14 it pulls into the shell, .14-.86 the shell rolls forward (two turns), .86-1 it comes out
    A.ins=keys([[0,0],[.12,1],[.88,1],[1,0]],p);const r=cl((p-.12)/.76,0,1);A.spin=ez(r)*TAU*2;A.bounce=Math.abs(Math.sin(r*Math.PI*4))*2.2*bump(r);A.arcs=r>0&&r<1?r:-1;A.shellB=0}
  else if(anim==='hit'){const kb=hitK(p);A.B=[-2.2*kb,0,.3*kb];A.lean=-.12*kb;A.ins=.65*Math.max(0,kb);A.shut=p<.55?1:0;A.stars=p<.75?1-p/.75:0;A.hp=-.1*kb}
  else if(anim==='prep'){// gets ready to roll (held): pulled half into the shell, the shell rocking on its foot, the stalks low
    A.ins=.72+.08*Math.sin(ph*2);A.spin=.22*Math.sin(ph*3);A.shellB=0;A.lean=-.04;A.st=[-.25,-.25]}
  else if(anim==='die'){// .0-.15 the blow, .15-.45 it pulls into the shell, .45-.75 the shell tips over onto its side, then still, dizzy
    const k1=ez(cl(p/.15,0,1)),k2=ez(cl((p-.15)/.3,0,1)),k3=ez(cl((p-.45)/.3,0,1));A.B=[-2.2*k1,0,.3*k1*(1-k2)+3*k3];A.lean=-.12*k1*(1-k2);A.ins=Math.max(.65*k1,k2);
    A.roll=1.15*k3;A.spin=.2*k3;A.shut=1;A.shellB=0;A.stars=p>.72?.8:0}
  if(o.shell!=null)A.ins=cl(o.shell,0,1);if(o.spin!=null)A.spin=o.spin;
  return A}
// the spiral of the shell on one side (sd), as runs of screen points where it faces us; the roll turns it round the shell's axle
function spiral(E,sd,rot){return ellRuns(E,k=>{const t=k*9,r=.9-t*.09,a=t*1.3+rot;return[r*Math.cos(a),sd*Math.sqrt(Math.max(0,1-r*r)),r*Math.sin(a)]},44,.04)}
function snail(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};const V0=V(face),{P,D,F}=V0,A=snailPose(anim,p,o),ph=p*TAU,foot=o.slow?SN.footS:SN.foot,ins=A.ins,out=1-ins;
  A.B=add(A.B,[0,0,A.bounce]);const X=frame(A,0);
  floor(V0,x,y,sc,[A.B[0]-2,0,0],16,6,.3,A.bounce);
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const L=parts(),dT=D(SSH.C);
  // the body: a seamless chain along the floor, pulled in under the shell when it hides; ripples run down it as it glides
  const segs=[];if(out>.02){SBODY.forEach(([sx,sz,rx,ry,rz],i)=>{const k=i/(SBODY.length-1),wv=A.ripple?.45*Math.sin(ph*2-i*1.3):0,st=1+A.stretch*(k-.3)*2,
      xx=lerp(-4.6,sx*st,out),E=ell3(V0,X,[xx,0,(sz+wv*.6)*lerp(1,.5,ins)],[rx*lerp(1,.6,ins),ry*lerp(1,.75,ins),(rz+wv*.4)*lerp(1,.6,ins)]);segs.push({E,o:outline(E,18),d:D([sx,0,sz])})})}
  // the neck and the head: up at the front of the foot, turning to look round (stalks with it)
  const hy=A.hy,hT=q=>{const pv=[11,0,6],r=C.rotZ(C.rotY(sub(q,pv),A.hp),hy);return add(r,pv)},Hc0=lerp3([-2.5,0,9],SHEAD,out),Hr=SHR*lerp(.5,1,out);
  const Xh={T:q=>X.T(hT(q)),Rd:v=>X.Rd(C.rotZ(C.rotY(v,A.hp),hy))};
  L.add(dT-6,()=>{if(!segs.length)return;const all=[].concat(...segs.map(s2=>s2.o)),bb=bbox(all);ctx.lineJoin='round';ctx.strokeStyle=INK;ctx.lineWidth=5;for(const s2 of segs){poly(s2.o);ctx.stroke()}
    const g=softBox(bb,foot,.2,.26);for(const s2 of segs.slice().sort((a,b)=>a.d-b.d)){poly(s2.o);ctx.fillStyle=g;ctx.fill()}
    // the wet shine along its back
    const s0=segs[3].E,s1=segs[4].E,a=s0.P(nrm([.2,-.3,.93])),b=s1.P(nrm([.5,-.3,.8]));ctx.strokeStyle=SN.slime;ctx.lineWidth=1.6;ctx.lineCap='round';seg(a,b);ctx.stroke();
    });
  // the eye stalks: two soft stalks from the top of the head, bobbing, with round white eyes and dark pupils looking ahead
  const stalk=sd=>{const i=sd>0?1:0,b=Xh.T(add(SHEAD,[.6,sd*1.5,3.2])),sw=A.st[i],len2=lerp(1.5,12,out*out),
      tip=Xh.T(add(SHEAD,[3.2+sw*2,sd*(3+sw*1.4),3.2+len2])),mid=lerp3(b,tip,.5);return{b,tip,mid:add(mid,[0,0,.4]),i}};
  for(const sd of[-1,1]){const sk=stalk(sd),far=F(0,sd,0)<-.3;L.add(far?dT-7:D(SHEAD)+4+(F(0,sd,0)>0?.1:0),()=>{if(out<.15)return;
    chain(V0,[sk.b,sk.mid,sk.tip],[1.6,1.2,1],foot,{kl:.2,kd:.24,rim:.15,lw:2});
    const q=P(sk.tip),er=2.4*lerp(.5,1,out),dir=Xh.Rd([1,sd*.15,.1]),v=F(dir);ink(1.5);ball(q,er);ctx.fillStyle=softBall(q,er,SN.eye,.3,.15);ctx.fill();ctx.stroke();
    if(A.shut){ctx.strokeStyle='#1b1612';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(q[0]-er*.6,q[1]);ctx.lineTo(q[0]+er*.6,q[1]);ctx.stroke()}
    else if(v>-.35){const pq=sp(V0,q,er*.62,dir),bl=A.blink;ctx.save();ball(q,er-.4);ctx.clip();ctx.fillStyle='#1b1612';ctx.beginPath();ctx.ellipse(pq[0],pq[1],1.15*Math.max(.4,(v+.35)/1.35),1.15*Math.max(.15,bl),0,0,TAU);ctx.fill();
      if(bl>.5){ctx.fillStyle='#fff';ball([pq[0]-.4,pq[1]-.45],.38);ctx.fill()}ctx.restore()}})}
  // the head: a soft round end of the body with a little smile
  L.add(D(SHEAD)+2,()=>{if(out<.1)return;const c=Xh.T(Hc0),q=sball(V0,c,Hr,foot,{kl:.22,kd:.24,rim:.3});
    const md=Xh.Rd(nrm([1,0,-.35])),v=F(md);if(v>.1&&!A.shut&&out>.6){const mq=sp(V0,q,Hr*.9,md);ctx.strokeStyle='rgba(60,40,10,.75)';ctx.lineWidth=1;ctx.lineCap='round';ctx.beginPath();ctx.arc(mq[0],mq[1]-1,1.6*Math.max(.5,v),.4,Math.PI-.4);ctx.stroke()}});
  // the shell: a purple ball coiled in a spiral on both sides (dark line with a light line in it), a white shine; it rolls round its
  // axle when it charges
  const Es=ell3(V0,X,add(SSH.C,[0,0,A.shellB]),SSH.R),rot=-A.spin;
  L.add(dT,()=>{const hp=outline(Es,26),bb=bbox(hp),w=bb[2]-bb[0],h=bb[3]-bb[1],cx=(bb[0]+bb[2])/2,cy=(bb[1]+bb[3])/2,g=ctx.createRadialGradient(cx-w*.22,cy-h*.26,w*.05,cx-w*.02,cy+h*.02,Math.max(w,h)*.7);
    g.addColorStop(0,SN.shellL);g.addColorStop(.5,SN.shell);g.addColorStop(1,SN.shellD);paint(hp,SN.shell,{fill:g,rim:.32});ctx.save();poly(hp);ctx.clip();
    for(const sd of[-1,1])for(const r of spiral(Es,sd,rot*sd)){if(r.length<2)continue;ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=INK;ctx.lineWidth=2;line(r);ctx.stroke();ctx.strokeStyle=SN.line;ctx.lineWidth=.9;line(r);ctx.stroke()}
    // the opening of the shell under the front, a dark crescent where the body goes in
    {const m=nrm([.55,0,-.84]);if(Es.vis(m)>0){const q=Es.P(m);ctx.fillStyle='rgba(40,16,50,.55)';ctx.beginPath();ctx.ellipse(q[0],q[1],5.5,2.2,0,0,TAU);ctx.fill()}}
    ctx.fillStyle='rgba(255,255,255,.4)';ctx.beginPath();ctx.ellipse(cx-w*.2,cy-h*.25,w*.13,h*.07,-.5,0,TAU);ctx.fill();ctx.restore()});
  // the roll: white arcs round the spinning shell (the game adds its dust)
  if(A.arcs>=0&&!o.noFx)L.add(dT+30,()=>{const q=P(X.T(SSH.C)),r0=17;ctx.strokeStyle='rgba(255,255,255,.4)';ctx.lineWidth=1.5;ctx.lineCap='round';
    for(let k=0;k<3;k++){const a0=A.spin*1+k*2.1;ctx.beginPath();ctx.ellipse(q[0],q[1],r0+k*3,(r0+k*3)*.9,0,a0,a0+.8);ctx.stroke()}});
  run(L);
  if(A.stars>0)stars(P(X.T([2,0,32])),10,A.stars);
  ctx.restore()}
reg('snail',{n:'Lumaca',g:3,sc:1,an:['idle','walk','prep','attack','hit','die'],dur:{idle:2.8,walk:1.6,prep:.9,attack:2.2,hit:.6,die:1},lab:{walk:'Striscia',attack:'Guscio rotante'}},snail);

// ------------------------------------------------------------------ GIRINO: a little dark green tadpole (EDRAW.tadpole) swimming just over the
// floor in swarms: a round head-body with two yellow eyes on the sides and a light on its back, the long tail wiggling from side to side
const TD={body:'#3a5a2a',tail:'#4a6a3a',eye:'#ffd86b',slow:'#7a9aa8'};
const TB={C:[.8,0,6],R:[6.6,5.3,4.6]};
function tadPose(anim,p){const ph=p*TAU,A={B:[0,0,Math.sin(ph)*.5],lean:0,roll:0,s:0,yaw:0,amp:.6,freq:2,ph,curl:0,dart:0,shut:0,stars:0,blink:blink(p,.6,.08)};
  if(anim==='walk'){// swimming: the tail lashes fast, the body yaws a little with each stroke (as the game turns it), bobbing
    A.amp=1.15;A.freq=4;A.yaw=.22*Math.sin(ph*4);A.B=[0,0,.5*Math.sin(ph*8)];A.roll=.08*Math.sin(ph*4)}
  else if(anim==='attack'){// a dart: .0-.3 curls the tail and draws back, .3-.42 shoots forward stretched out, .42-1 glides and settles
    A.curl=keys([[0,0],[.28,1],[.34,-.4],[.5,0],[1,0]],p);A.dart=keys([[0,0],[.28,-1],[.4,1],[.6,.3],[1,0]],p);A.B=[A.dart*3,0,.3];A.s=-.1*Math.max(0,-A.dart);A.amp=p<.3?.4:p<.6?1.4:.7;A.freq=p<.3?1:5;
    A.lean=.08*A.dart}
  else if(anim==='hit'){const kb=hitK(p);A.B=[-3*kb,0,.6*kb];A.roll=.4*kb;A.lean=-.2*kb;A.shut=p<.55?1:0;A.stars=p<.75?1-p/.75:0;A.amp=1.2;A.freq=3}
  else if(anim==='prep'){// gets ready to dart (held): the tail curled, drawn back, quivering
    A.curl=.85+.12*Math.sin(ph*2);A.dart=-.85;A.B=[-2.5+.2*Math.sin(ph*5),0,.3];A.s=.06;A.amp=.4;A.freq=3}
  else if(anim==='die'){// .0-.15 the blow, then it rolls belly up and floats, the tail going still
    const k1=ez(cl(p/.15,0,1)),k2=ez(cl((p-.15)/.45,0,1));A.B=[-3*k1,0,.6*k1+1.2*k2];A.roll=.4*k1+(Math.PI-.4)*k2;A.lean=-.2*k1*(1-k2);A.shut=1;A.amp=1.2*(1-k2)+.15;A.freq=3*(1-k2)+.5;
    A.stars=p>.65?.75:0}
  return A}
function tadpole(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};const V0=V(face),{P,D,F}=V0,A=tadPose(anim,p),X=frame(A,6),body=o.slow?TD.slow:TD.body,tailC=o.slow?lt(TD.slow,.1):TD.tail;
  floor(V0,x,y,sc,[A.B[0],0,0],8,3,.25,A.B[2]+4);
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const L=parts(),dT=D(TB.C),E=ell3(V0,X,TB.C,TB.R);
  // the tail: a soft chain from the back of the body, the wave running down it and growing toward the tip; curled when it darts
  const N=7,tp=[];for(let i=0;i<=N;i++){const k=i/N,xx=-4.4-k*15,w=A.amp*Math.sin(A.ph*A.freq-k*3.2)*k*4.2+A.curl*k*k*6;tp.push(X.T([xx,w,6-k*1.2+Math.sin(A.ph*A.freq*.5+k*2)*.3*k]))}
  L.add(D([-12,0,5]),()=>{chain(V0,tp,[2.2,1.9,1.65,1.45,1.3,1.2,1.12,1.06],tailC,{kl:.2,kd:.25,rim:.15,lw:2})});
  // the body: a round dark green egg, a soft light on its back, the yellow eyes on the sides of the head
  L.add(dT,()=>{const hp=outline(E,22);paint(hp,body,{kl:.26,kd:.3,rim:.36});ctx.save();poly(hp);ctx.clip();
    const q=E.P(nrm([-.35,-.4,.85]));if(E.vis(nrm([-.35,-.4,.85]))>0){ctx.fillStyle='rgba(255,255,255,.3)';ctx.beginPath();ctx.ellipse(q[0],q[1],2.5,1.2,-.3,0,TAU);ctx.fill()}
    ctx.restore()});
  for(const sd of[-1,1]){const m=nrm([.66,sd*.5,.52]),c=add(TB.C,[TB.R[0]*m[0]*.9,TB.R[1]*m[1]*.9,TB.R[2]*m[2]*.9]);L.add(F(0,sd,0)<-.5?dT-1:dT+1,()=>{const d=X.Rd(m),v=F(d);if(v<-.25)return;
    const q=P(X.T(c)),er=2;ctx.save();ctx.globalAlpha*=cl((v+.25)*3,0,1);
    if(A.shut){ctx.strokeStyle='#1b1612';ctx.lineWidth=1;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(q[0]-er,q[1]-.3);ctx.quadraticCurveTo(q[0],q[1]+1,q[0]+er,q[1]-.3);ctx.stroke()}
    else{ink(1.2);ctx.beginPath();ctx.ellipse(q[0],q[1],er*Math.max(.55,Math.min(1,v+.5)),er*Math.max(.15,A.blink),0,0,TAU);ctx.fillStyle=softBall(q,er,TD.eye,.3,.2);ctx.fill();ctx.stroke();
      if(A.blink>.5){ctx.fillStyle='#fff';ball([q[0]-er*.32,q[1]-er*.36],.55);ctx.fill()}}ctx.restore()})}
  run(L);
  if(A.stars>0)stars(P(X.T([1,0,13])),6,A.stars);
  ctx.restore()}
reg('tadpole',{n:'Girino',g:3,sc:1,an:['idle','walk','prep','attack','hit','die'],dur:{idle:2,walk:.8,prep:.7,attack:.8,hit:.6,die:.9},lab:{walk:'Nuota',attack:'Scatto'}},tadpole);
})();
