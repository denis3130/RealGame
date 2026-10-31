// Gli zombie nuovi della modalità Zombie (Denis, 31 ottobre: «Zombie nuovi»): il Gonfio, lo Sputatore e il Bruto. Col metodo dello
// spaventapasseri (scheletro 3D proiettato con V(face), braccia e gambe a due ossa con ik, ordine di disegno dalla posa di riposo, ogni
// mossa solo da p, la testa con una telecamera sua) e dipinti come la lanterna (tre toni, bordo illuminato, bagliori morbidi), con gli
// attrezzi di CR._rig: gli zombie di prima e la lanterna non cambiano. Stile Zombie: colori malati, occhi che brillano e pulsano, bocche
// troppo larghe, denti storti, cuciture, ferite e macchie scure; da fermi immobili, poi la testa che gira di scatto.
// Firma come gli altri: CR.<nome>(x, y, face, anim, p, sc).
// - gonfio: un cadavere gonfio come una botte sulle gambette, la pancia tesa con due cuciture e le vene viola, le pustole verdi, la
//   testina affondata nelle spalle. idle (la pancia che respira, gorgoglia), walk (dondola), attack (si gonfia, trema, le cuciture si
//   accendono e scoppia in una nube verde: nel gioco è la sua morte).
// - sputatore: magro e curvo, collo lungo, la mascella spaccata che penzola e la gola gonfia di acido che brilla sotto la pelle. idle,
//   walk (corre basso, a scatti), attack (tira indietro il collo, la gola si gonfia, scatta in avanti e sputa una palla d'acido).
// - bruto: enorme, il braccio destro mostruoso con la catena e il ceppo di ferro, la museruola di ferro sulla bocca, la grande cucitura a
//   Y sul petto, il grembiule da macellaio. idle (respiro pesante), walk (passi che pestano), charge (corre a testa bassa col braccio
//   avanti), attack (alza il braccio e schianta a terra).
(()=>{const R=CR._rig,{TAU,cl,ez,lerp,add,sub,mul,len,nrm,dot,cross,lerp3,V,Vat,mix,farK,ik,stepper,NOSTEP,shine,ball,seg,tri,hull,limb,on,neck,hand,bone,claw,leg,trunk,wa,rim,shadeLimb,glowTop,
  run,ZC,zArm}=R,KR=()=>R.KR();
// a still pose that snaps its head toward you: mostly still, at .55 the head jerks round in a few hundredths, holds, and comes back slowly
const snap=(p,a)=>{const k=p<.55?0:p<.58?ez((p-.55)/.03):p<.86?1:1-ez((p-.86)/.14);return a*k};
// an ellipse on the screen for a 3D ball with three tones (the lantern's way): colour, a darker side away from the light, a warm light
function blob(V0,c,r,col,colD,o){o=o||{};const q=V0.P(c),rx=r*(o.sx||1),ry=r*(o.sy||1);ink(o.lw||2.4);ctx.beginPath();ctx.ellipse(q[0],q[1],rx,ry,0,0,TAU);ctx.fillStyle=col;ctx.fill();ctx.stroke();
  ctx.save();ctx.beginPath();ctx.ellipse(q[0],q[1],Math.max(.3,rx-1.2),Math.max(.3,ry-1.2),0,0,TAU);ctx.clip();ctx.fillStyle=colD;ctx.beginPath();ctx.ellipse(q[0]+rx*.45,q[1]+ry*.5,rx*1.05,ry*.8,0,0,TAU);ctx.fill();
  if(o.inside)o.inside(q,rx,ry);ctx.fillStyle=wa(.14);ctx.beginPath();ctx.ellipse(q[0]-rx*.35,q[1]-ry*.42,rx*.45,ry*.3,0,0,TAU);ctx.fill();ctx.restore();
  rim(q,Math.min(rx,ry),q,Math.min(rx,ry),.3);return{q,rx,ry}}
// stitches along a curve of screen points, the way the zombies' heads are sewn: a dark seam with short dark crosses, old blood seeping
// under it (blood), glowing red-hot when it strains (a, 0..1: the Gonfio about to burst)
function stitches(pts,a,blood,cl0){if(pts.length<2)return;const L=cl0||1.3;ctx.lineCap='round';ctx.lineJoin='round';
  if(blood){ctx.strokeStyle='rgba(74,10,14,.5)';ctx.lineWidth=2.6;ctx.beginPath();pts.forEach((q,i)=>i?ctx.lineTo(q[0]+.3,q[1]+1):ctx.moveTo(q[0]+.3,q[1]+1));ctx.stroke()}
  if(a>0&&!LOWFX){ctx.strokeStyle=`rgba(255,${150-90*a|0},60,${(.55*a).toFixed(3)})`;ctx.lineWidth=2.4+2*a;ctx.beginPath();pts.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.stroke()}
  ctx.strokeStyle=a>.4?`rgb(${60+120*a|0},24,18)`:'rgba(26,16,14,.92)';ctx.lineWidth=1.1;ctx.beginPath();pts.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.stroke();
  ctx.lineWidth=.9;for(let i=1;i<pts.length;i++){const A=pts[i-1],B=pts[i],dx=B[0]-A[0],dy=B[1]-A[1],l=Math.hypot(dx,dy)||1,m=[(A[0]+B[0])/2,(A[1]+B[1])/2],nx=-dy/l*L,ny=dx/l*L,tx=dx/l*.5,ty=dy/l*.5;
    seg([m[0]-nx-tx,m[1]-ny-ty],[m[0]+nx+tx,m[1]+ny+ty]);ctx.stroke()}}
// a curve on the surface of a ball (centre C, radius r): directions dirs (3D), only the runs that face us; returns the runs of screen points
function surf(V0,C,r,dirs,v0){const runs=[];let cur=null;for(const d0 of dirs){const d=nrm(d0);if(V0.F(d)>(v0||0)){if(!cur){cur=[];runs.push(cur)}cur.push(V0.P(add(C,mul(d,r))))}else cur=null}return runs}
// cloth that covers a body above (up) or below a horizontal ring (centre C, radius rr), the scarecrow's way: everything past the near half of
// the ring's ellipse, inside the clip already set by the caller. The hem is torn (tear: how much), the tears turn with the body (face)
function ringCloth(V0,C,rr,face,up,col,colD,tear){const q=V0.P(C),ky=rr*.55*KR(),N=18,hem=[];
  for(let i=0;i<=N;i++){const a=i/N*Math.PI,ph=a-face,dy=tear&&i>0&&i<N?tear*(.55*Math.sin(5*ph)+.45*Math.sin(11*ph+1.3))*(up?1:-1):0;hem.push([q[0]+Math.cos(a)*rr,q[1]+Math.sin(a)*ky+dy])}
  const far=up?-rr*4:rr*4,shape=()=>{ctx.beginPath();hem.forEach((h,i)=>i?ctx.lineTo(h[0],h[1]):ctx.moveTo(h[0],h[1]));ctx.lineTo(q[0]-rr*1.4,q[1]);ctx.lineTo(q[0]-rr*1.4,q[1]+far);ctx.lineTo(q[0]+rr*1.4,q[1]+far);ctx.lineTo(q[0]+rr*1.4,q[1]);ctx.closePath()};
  ctx.fillStyle=col;shape();ctx.fill();if(colD){ctx.save();shape();ctx.clip();ctx.fillStyle=colD;ell(q[0]+rr*.55,q[1]+(up?-rr*.2:rr*.5),rr*.95,rr*.9);ctx.fill();ctx.restore()}
  ctx.strokeStyle=INK;ctx.lineWidth=1.3;ctx.lineJoin='round';ctx.beginPath();hem.forEach((h,i)=>i?ctx.lineTo(h[0],h[1]):ctx.moveTo(h[0],h[1]));ctx.stroke();return hem}
const path=pts=>{ctx.beginPath();pts.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]))};
// an ellipsoid (semi-axes a along the body's x, b along y, c up, centre C) as V0 sees it: the screen ellipse it projects to
function ellOf(V0,C,a,b,c){const cs=V0.c,sn=V0.s,K=R.cam.k,Z=R.cam.zk,j11=cs*a,j12=-sn*b,j21=K*sn*a,j22=K*cs*b,j23=-Z*c,
    S11=j11*j11+j12*j12,S12=j11*j21+j12*j22,S22=j21*j21+j22*j22+j23*j23,tr=(S11+S22)/2,dd=Math.sqrt(Math.max(0,tr*tr-(S11*S22-S12*S12))),l1=tr+dd,l2=tr-dd;
  return{q:V0.P(C),rx:Math.sqrt(Math.max(.01,l1)),ry:Math.sqrt(Math.max(.01,l2)),rot:Math.abs(S12)<1e-9?(S11>=S22?0:Math.PI/2):Math.atan2(l1-S11,S12)}}
// an ellipsoid painted like the lantern zombie: colour and outline, the darker side away from the light, the soft warm light, the lit rim.
// o.inside(e) paints marks inside its outline
function egg(V0,C,a,b,c,col,colD,o){o=o||{};const e=ellOf(V0,C,a,b,c),{q,rx,ry,rot}=e,sh=()=>{ctx.beginPath();ctx.ellipse(q[0],q[1],rx,ry,rot,0,TAU)};
  ink(o.lw||2.4);sh();ctx.fillStyle=col;ctx.fill();ctx.stroke();ctx.save();ctx.beginPath();ctx.ellipse(q[0],q[1],Math.max(.3,rx-1.2),Math.max(.3,ry-1.2),rot,0,TAU);ctx.clip();
  const m=Math.max(rx,ry),n=Math.min(rx,ry);ctx.fillStyle=colD;ctx.beginPath();ctx.ellipse(q[0]+m*.42,q[1]+n*.55,m*1.02,n*.85,rot,0,TAU);ctx.fill();
  if(o.inside)o.inside(e);ctx.fillStyle=wa(.13);ctx.beginPath();ctx.ellipse(q[0]-m*.3,q[1]-n*.42,m*.42,n*.3,rot,0,TAU);ctx.fill();ctx.restore();
  const g=ctx.createLinearGradient(q[0]-m*.8,q[1]-m*.8,q[0]+m*.15,q[1]+m*.15);g.addColorStop(0,wa(.3));g.addColorStop(1,wa(0));ctx.save();ctx.strokeStyle=g;ctx.lineWidth=1.3;
  ctx.beginPath();ctx.ellipse(q[0],q[1],Math.max(.4,rx-1.9),Math.max(.4,ry-1.9),rot,0,TAU);ctx.stroke();ctx.restore();return e}
// a curve on the surface of an ellipsoid: directions dirs, the runs that face us (by the ellipsoid's own normal)
function surfE(V0,C,a,b,c,dirs,v0){const runs=[];let cur=null;for(const d0 of dirs){const d=nrm(d0);if(V0.F(d[0]/a,d[1]/b,d[2]/c)>(v0||0)){if(!cur){cur=[];runs.push(cur)}cur.push(V0.P(add(C,[d[0]*a,d[1]*b,d[2]*c])))}else cur=null}return runs}
// a mark on an ellipsoid in direction n (like on(), for an egg)
function onE(V0,C,a,b,c,n,v0,fn){n=nrm(n);const v=V0.F(n[0]/a,n[1]/b,n[2]/c);if(v<=v0)return;const q=V0.P(add(C,[n[0]*a,n[1]*b,n[2]*c]));ctx.save();ctx.globalAlpha=cl((v-v0)*4,0,1);fn(q,v,n);ctx.restore()}
// the head of the new ones: zHead's skull, painted the same way (three tones, blotches, the rot, the stitched crack on the back, the rim),
// with eyes of their own colour that breathe (they swell and brighten, then dim, slowly), a mouth that can be too wide (o.mw) with
// crooked teeth, o.noMouth (the caller draws it: the brute's muzzle), o.noHair, o.noScar, o.up (eyes a little higher)
function zHead2(V0,Hc,R,ph,o){const{P,c}=V0,h=P(Hc),t=G.t,at=R*.95,sk=o.skin,skD=o.skinD;
  ink(2.4);ball(h,R);ctx.fillStyle=sk;ctx.fill();ctx.stroke();
  const lit=[];ctx.save();ball(h,R-1.1);ctx.clip();ctx.fillStyle=skD;ell(h[0]+R*.3,h[1]+R*.74,R*1.15,R*.62);ctx.fill();
  for(const[d,sz] of[[[-.45,-.6,.62],.22],[[-.85,.35,.38],.2],[[.15,.8,.55],.16],[[-.3,.15,.95],.15],[[.45,-.85,-.15],.17],[[-.6,-.25,-.75],.2]])on(V0,Hc,at,d,-.15,q=>{ctx.fillStyle=skD;ell(q[0],q[1],R*sz,R*sz*.72);ctx.fill()});
  glowTop(h,R,.17);
  on(V0,Hc,at,[-.15,-.5,.85],-.3,q=>{ctx.fillStyle=o.rot||ZC.rot;ell(q[0],q[1],R*.3,R*.19);ctx.fill()});
  on(V0,Hc,at,[-1,.1,.25],.05,q=>{ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(q[0]-3,q[1]-2);ctx.lineTo(q[0],q[1]);ctx.lineTo(q[0]+2.6,q[1]-2.4);for(let i=0;i<3;i++){const xx=q[0]-2.4+i*2.2;ctx.moveTo(xx-.8,q[1]-2.6+i*.4);ctx.lineTo(xx+.8,q[1]-.4+i*.4)}ctx.stroke()});
  if(!o.noScar)on(V0,Hc,at,[.15,1,-.1],.05,q=>{ctx.strokeStyle=INK;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(q[0]-2,q[1]-2);ctx.lineTo(q[0]+2,q[1]+2);ctx.moveTo(q[0]-1.4,q[1]+.6);ctx.lineTo(q[0]-.2,q[1]-.8);ctx.moveTo(q[0]+.4,q[1]+1.8);ctx.lineTo(q[0]+1.6,q[1]+.4);ctx.stroke()});
  for(const sd of[-1,1])on(V0,Hc,at,[.8,sd*.4,.16+(o.up||0)],0,(q,v)=>{const big=sd>0?1.15:.9;ink(1.5);ctx.fillStyle=ZC.socket;ctx.beginPath();ctx.ellipse(q[0],q[1],R*.3*big*Math.max(.45,v),R*.34*big,0,0,TAU);ctx.fill();ctx.stroke();
    lit.push([q,big,cl(v*4,0,1)])});
  ctx.restore();rim(h,R,h,R);
  // the eyes breathe: a slow swell of light (about every three seconds), the right one a little bigger
  for(const[q,big,k] of lit){const br=.5+.5*Math.sin(t*2.1+big*1.3),e=[q[0]+c*.3,q[1]+.2],er=R*.12*big*k*(.85+.25*br);
    shine(o.eyeRgb,q[0],q[1],R*(.5+.3*br),(.3+.4*br)*k);ctx.fillStyle=o.eye;ball(e,er);ctx.fill();ctx.fillStyle='#ffffff';ball([e[0]-er*.35,e[1]-er*.35],er*.42);ctx.fill()}
  // the mouth: wide, with crooked teeth leaning every way
  {const n=nrm([.8,0,-.5]),hv=n[0]*V0.s,q=P(add(Hc,mul(n,at))),v=Math.max(0,V0.F(n));if(!o.noMouth&&hv>-.15){ctx.save();ctx.globalAlpha=cl((hv+.15)*4,0,1);
    const op=o.open||0,mw=o.mw||.52,w=R*mw*Math.max(.38,v,Math.abs(V0.c)*.3),hh=R*.22+op*R*.3,nt=mw>.6?6:4;ink(1.6);ctx.fillStyle=ZC.mouth;ctx.beginPath();ctx.ellipse(q[0],q[1]+hh*.35,w,hh,0,0,TAU);ctx.fill();ctx.stroke();
    ctx.fillStyle=ZC.gum;ctx.fillRect(q[0]-w*.8,q[1]-hh*.6,w*1.6,1);ctx.fillStyle=ZC.bone;ink(.8);
    for(let i=0;i<nt;i++){const xx=q[0]-w*.78+i*w*1.56/(nt-1),ln=Math.sin(i*2.7)*.8;tri(xx,q[1]-hh*.5,xx+ln,q[1]-hh*.5+(i%3===1?2.6:1.5),.8)}
    for(let i=0;i<nt-1;i++){const xx=q[0]-w*.6+i*w*1.2/(nt-2),ln=Math.cos(i*1.9)*.7;tri(xx,q[1]+hh*1.1,xx+ln,q[1]+hh*1.1-1.6,.7)}
    if(o.drool){const dr=(ph/TAU*2+.3)%1;ctx.strokeStyle=o.drool;ctx.lineWidth=1.2;ctx.globalAlpha*=1-dr;seg([q[0]+w*.45,q[1]+hh*1.1],[q[0]+w*.45,q[1]+hh*1.2+1.4+dr*4]);ctx.stroke();ctx.fillStyle=o.drool;ball([q[0]+w*.45,q[1]+hh*1.2+1.6+dr*4],.8);ctx.fill()}ctx.restore()}}
  if(!o.noHair){ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.lineCap='round';for(let i=-1.5;i<=1.5;i++){const r=P(add(Hc,mul(nrm([-.25+Math.abs(i)*.1,i*.5,1]),R*.97))),k=i*1.3+Math.sin(ph+i)*.35;ctx.beginPath();ctx.moveTo(r[0],r[1]+1);ctx.quadraticCurveTo(r[0]+i*.8,r[1]-2.2,r[0]+k*1.5,r[1]-3.4+Math.abs(i)*.6);ctx.stroke()}}}


// ------------------------------------------------------------------ IL GONFIO
// a corpse swollen like a barrel on two stubby legs: the dirty undershirt riding up over the belly, the braces, the seam down the middle,
// the purple veins and the glowing boils, the head sunk into the shoulders with a fat neck, short puffy arms hanging at the sides
const GC={skin:'#9eab64',skinD:'#717d45',skinF:'#5d673a',head:'#93a05e',vein:'rgba(98,40,112,.5)',boil:'#d8f476',boilRgb:'214,250,120',
  shirt:'#d8cdaa',shirtD:'rgba(96,78,44,.36)',stain:'rgba(128,100,38,.42)',strap:'#5e3024',clip:'#b3a06a',pants:'#3a3330',pantsF:'#25201d',shoe:'#1c1714',
  gas:'158,214,84',eye:'#f2ff8c',eyeRgb:'222,255,120',bile:'rgba(196,214,96,.85)',flesh:'#6e2a2a'};
function gonfio(x,y,face,anim,p,sc){sc=sc||1.2;const V0=V(face),{P,D,F}=V0,ph=p*TAU,t=G.t,walk=anim==='walk',atk=anim==='attack';
  // attack (its death, in the game): .0-.66 it swells and trembles more and more, the seam glows red, the shirt rides up, the arms go up;
  // .62-.66 a flash; .66-1 it is gone: the cloud of gas, the scraps, the legs folding, a stain on the ground
  const sw=atk?ez(cl(p/.66,0,1)):0,gone=atk&&p>=.66,tr=atk&&!gone?Math.sin(p*TAU*26)*sw*sw:0;
  // walk: a heavy waddle, the whole barrel rolling from one stubby leg to the other
  const st=stepper(p,.55),fL=walk?st(0,2.2,1.3):NOSTEP,fR=walk?st(.5,2.2,1.3):NOSTEP,wad=walk?Math.sin(ph):0,dip=walk?-Math.abs(Math.cos(ph))*.7:0;
  // idle: it breathes, and at .3 a gurgle ripples through the belly
  const gq=!walk&&!atk&&p>.28&&p<.42?(p-.28)/.14:0,breath=walk?0:Math.sin(ph)*.025,gurgle=gq?Math.sin(gq*Math.PI*4)*.035*(1-gq):0;
  const kb=1+breath+gurgle+.34*sw,Rb=12*kb,Bc=[1+tr*.5,wad*1.5+tr*.7,3.4+Rb+dip],hz=Rb*(.5+.22*sw),
    Hc=add(Bc,[2-sw*1.4,wad*.5+tr*.3,Rb+2+sw*.6]),hy=walk?wad*.18:atk?0:snap(p,.85),RH=6.5;
  {const q=P(Bc[0],Bc[1],0);shadow(x+q[0]*sc,y+q[1]*sc,(13+sw*4)*sc,5.4*sc*KR(),.34)}
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);
  if(gone){gonfioBurst(V0,Bc,(p-.66)/.34,t);ctx.restore();return}
  const parts=[],dT=D(Bc);
  // the stubby legs under the belly (the belly hides the thighs)
  for(const[sd,f] of[[-1,fL],[1,fR]]){const hip=[Bc[0]-1,sd*5.2+wad*.6,7.6+dip],foot=[1.2+f.x,sd*6,f.z],k=farK(F(0,sd,0));
    parts.push({d:dT-100+D(hip)*.01,f:()=>leg(V0,hip,foot,{L1:4.2,L2:4.2,w1:6,w2:5,col:mix(GC.pants,GC.pantsF,k),colD:'rgba(0,0,0,.3)',shoe:GC.shoe,heel:1.4,toe:2.6,sr:2.5})})}
  parts.push({d:dT,f:()=>{const glow=sw>0?sw*(.55+.45*Math.sin(p*TAU*14)):0,c=P(Bc);
    if(glow>0)shine(GC.gas,c[0],c[1],Rb*1.8,glow*.6);
    blob(V0,Bc,Rb,mix(GC.skin,'#d8e6a2',sw*.55),GC.skinD,{sy:.95,inside:(q,rx,ry)=>{
      // the veins: purple, branching down the belly from under the shirt
      ctx.strokeStyle=GC.vein;ctx.lineWidth=.9;ctx.lineCap='round';
      for(const[d0,an] of[[[.8,-.45,-.05],.9],[[.75,.5,-.15],2.3],[[.35,-.9,-.1],1.2],[[-.6,.7,-.1],2],[[.95,.05,-.5],1.6]])on(V0,Bc,Rb,d0,.1,(k,v)=>{const L=4+sw*2;
        for(const b of[-.5,0,.6]){const a=an+b,mx=k[0]+Math.cos(a)*L*.55,my=k[1]+Math.sin(a)*L*.55;ctx.beginPath();ctx.moveTo(k[0],k[1]);ctx.quadraticCurveTo(mx+Math.sin(a*3)*1.2,my,k[0]+Math.cos(a)*L*(b?.8:1),k[1]+Math.sin(a)*L*(b?.8:1));ctx.stroke()}});
      // the swell lights it from inside
      if(glow>0){const g=ctx.createRadialGradient(q[0],q[1],1,q[0],q[1],rx);g.addColorStop(0,`rgba(${GC.gas},${(.4*glow).toFixed(3)})`);g.addColorStop(1,`rgba(${GC.gas},0)`);ctx.fillStyle=g;ctx.fillRect(q[0]-rx,q[1]-ry,rx*2,ry*2)}
      // the seam down the middle, below the shirt, and the navel beside it
      {const top=Math.asin(cl(hz/Rb,-1,1))-.14,dirs=[];for(let i=0;i<=7;i++){const a=-1.05+i/7*(top+1.05);dirs.push([Math.cos(a),.05*Math.sin(i*1.9),Math.sin(a)])}
        for(const r of surf(V0,Bc,Rb,dirs,.12))stitches(r,sw,1,1.1)}
      on(V0,Bc,Rb,[.93,-.24,-.28],.12,(k,v)=>{ink(.9);ctx.fillStyle='rgba(44,32,16,.75)';ctx.beginPath();ctx.ellipse(k[0],k[1],1.4*Math.max(.4,v),1,0,0,TAU);ctx.fill()});
      // the dirty undershirt over the top of the belly (it rides up as the belly swells), stains on it
      const rr=Math.sqrt(Math.max(.01,Rb*Rb-hz*hz)),cq=P(add(Bc,[0,0,hz]));ctx.strokeStyle='rgba(30,36,10,.28)';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(cq[0],cq[1]+1.6,rr,rr*.55*KR(),0,0,Math.PI);ctx.stroke();
      ringCloth(V0,add(Bc,[0,0,hz]),rr,face,1,GC.shirt,GC.shirtD,1);
      for(const[d0,a,b] of[[[.62,-.38,.62],3.2,2.1],[[.3,.72,.62],2.2,1.5],[[-.7,-.3,.6],2.8,1.9]])on(V0,Bc,Rb*.99,d0,.05,(k,v)=>{ctx.fillStyle=GC.stain;ctx.beginPath();ctx.ellipse(k[0],k[1],a*Math.max(.45,v),b,.3,0,TAU);ctx.fill()});
      // the braces: from the trousers under the belly, up over the shirt and the shoulders and down the back, a clip at each end
      for(const sy of[-.3,.3]){const dirs=[];for(let i=0;i<=26;i++){const a=-1+i/26*(Math.PI+2);dirs.push([Math.cos(a),sy*(1-.28*Math.max(0,Math.sin(a))),Math.sin(a)])}
        for(const r of surf(V0,Bc,Rb*1.005,dirs,.02)){if(r.length<2)continue;ctx.lineCap='round';ctx.lineJoin='round';path(r);ctx.strokeStyle=INK;ctx.lineWidth=3.4;ctx.stroke();ctx.strokeStyle=GC.strap;ctx.lineWidth=1.7;ctx.stroke();
          ctx.strokeStyle='rgba(255,214,170,.2)';ctx.lineWidth=.7;ctx.stroke()}
        for(const a of[-1,Math.PI+1])on(V0,Bc,Rb*1.005,[Math.cos(a),sy,Math.sin(a)],.08,k=>{ink(.9);ctx.fillStyle=GC.clip;ctx.fillRect(k[0]-1.6,k[1]-1.3,3.2,2.6);ctx.strokeRect(k[0]-1.6,k[1]-1.3,3.2,2.6)})}
      // the boils: glowing blisters that swell with the belly
      for(const[d0,r] of[[[.78,-.52,-.32],1.7],[[.56,.72,-.2],1.4],[[.88,.32,-.58],1.2],[[.22,-.96,.02],1.5],[[-.5,.75,-.35],1.4],[[-.86,-.42,-.22],1.2]])on(V0,Bc,Rb*.97,d0,.05,(k,v)=>{const rr=r*1.25*(1+sw*.5);
        if(!LOWFX)shine(GC.boilRgb,k[0],k[1],rr*3,.2+.16*Math.sin(t*3+r*5)+sw*.3);ink(.7);ctx.fillStyle=GC.boil;ctx.beginPath();ctx.ellipse(k[0],k[1],rr*Math.max(.5,v),rr,0,0,TAU);ctx.fill();ctx.stroke();
        ctx.fillStyle='rgba(255,255,225,.75)';ball([k[0]-rr*.3,k[1]-rr*.35],rr*.3);ctx.fill()});
    }})}});
  // the short puffy arms hanging at the sides, swinging limp; up and shaking when it swells
  for(const sd of[-1,1]){const sh=add(Bc,[.4,sd*Rb*.8,Rb*.48]),swg=walk?Math.sin(ph+(sd>0?0:Math.PI))*1.6:Math.sin(ph+sd)*.3,
      hd=atk?add(Bc,[2.4+sw*3,sd*(Rb+2.6+sw*3),-3+sw*12+tr*.8]):add(Bc,[2+swg*.6,sd*(Rb+2.2),-3.6+swg*.4]),k=farK(F(0,sd,0));
    parts.push({d:dT+(F(0,sd,0)>.15?1:-1),f:()=>zArm(V0,sh,hd,nrm([-.2,sd*.7,-1]),{side:sd,L1:5.8,L2:5.6,bony:1,w1:5,we:4.4,w2:3.8,hand:2.2,fl:3.6,skin:mix(GC.skin,GC.skinF,k),shade:'rgba(70,74,30,.42)',pd:[.4,-sd*.3,-1]})})}
  // the fat neck and the head sunk into the shoulders, on its own camera (it snaps round when it stands still); from behind the belly hides
  // the bottom of it
  parts.push({d:F(1,0,0)<-.3?dT-.5:D(Hc),f:()=>{neck(V0,add(Bc,[1.2,0,Rb*.78]),5.6,add(Hc,[-.4,0,-3.4]),5,GC.head,1);
    const Vh=Vat(face+hy,P(Hc),D(Hc));zHead2(Vh,[0,0,0],RH,ph,{skin:GC.head,skinD:GC.skinD,eye:GC.eye,eyeRgb:GC.eyeRgb,mw:.66,open:atk?.3+.7*sw:.45+.2*Math.sin(ph*2),drool:GC.bile,noScar:1})}});
  run(parts);
  // the burst itself: a flash at .6-.66
  if(atk&&p>.6&&!LOWFX){const k=(p-.6)/.06,q=P(Bc);shine('232,255,170',q[0],q[1],20+k*22,.85*k)}
  ctx.restore()}
// the burst (k 0..1): a dark stain spreading on the ground, the legs left standing and folding, scraps of shirt and skin flying in arcs,
// the cloud of gas rising and spreading and thinning out
function gonfioBurst(V0,Bc,k,t){const{P}=V0,g0=P(Bc[0],Bc[1],0);
  ctx.fillStyle=`rgba(64,84,30,${(.5*Math.min(1,k*3)*(1-k*.4)).toFixed(3)})`;ell(g0[0],g0[1],8+k*9,(8+k*9)*.5*KR());ctx.fill();
  if(k<.5)for(const sd of[-1,1]){const hip=[0,sd*5.2,7.6-k*12],foot=[1.2,sd*6,0];ctx.save();ctx.globalAlpha*=1-k/.5;leg(V0,hip,foot,{L1:4.2,L2:4.2,w1:6,w2:5,col:GC.pants,shoe:GC.shoe,heel:1.4,toe:2.6,sr:2.5});ctx.restore()}
  for(let i=0;i<7;i++){const a=i*.9+.3,u=Math.min(1,k*1.3),c=P([Bc[0]+Math.cos(a)*(5+u*22),Math.sin(a)*(5+u*22),Bc[2]+u*14-u*u*(Bc[2]+12)]);if(c[1]>g0[1]+2)continue;
    ink(.9);ctx.fillStyle=i%3===0?GC.shirt:i%3===1?GC.skinD:GC.flesh;ctx.beginPath();ctx.ellipse(c[0],c[1],1.8,1.1,a+k*6,0,TAU);ctx.fill();ctx.stroke()}
  for(let i=0;i<11;i++){const a=i/11*TAU+.4,r=(5+k*17)*(.8+.25*Math.sin(i*2.1)),c=P([Bc[0]+Math.cos(a)*r,Math.sin(a)*r,Bc[2]*.6+k*11+Math.sin(i*1.7)*3]),rr=(5+k*8)*(1-k*.25),al=.62*(1-k)*(1-k*.3);
    const g=ctx.createRadialGradient(c[0]-rr*.2,c[1]-rr*.25,rr*.1,c[0],c[1],rr);g.addColorStop(0,`rgba(186,232,110,${al.toFixed(3)})`);g.addColorStop(.55,`rgba(${GC.gas},${(al*.8).toFixed(3)})`);
    g.addColorStop(1,`rgba(${GC.gas},0)`);ctx.fillStyle=g;ball(c,rr);ctx.fill();ctx.fillStyle=`rgba(70,96,30,${(al*.3).toFixed(3)})`;ball([c[0]+rr*.3,c[1]+rr*.35],rr*.45);ctx.fill()}
  if(!LOWFX){const q=P(Bc);shine(GC.gas,q[0],q[1],26+k*16,.5*(1-k))}}

// ------------------------------------------------------------------ LO SPUTATORE
// thin and hunched, bare to the waist (the ribs, the spine, the bruises), torn trousers held up by a rope, long arms with long fingers,
// a long neck, the throat swollen with acid that glows through the skin under the jaw, the lower jaw split in two halves that hang
const SPC={skin:'#97a492',skinD:'#6b7768',skinF:'#58624f',bruise:'rgba(104,62,124,.42)',rib:'rgba(54,50,56,.55)',acid:'#c6f450',acidRgb:'180,246,80',acidD:'#6f9a2a',
  pants:'#3e394a',pantsD:'rgba(10,8,16,.35)',pantsF:'#27232e',shoe:'#1a1618',nail:'#2a2420',eye:'#d8ff6a'};
function sputatore(x,y,face,anim,p,sc){sc=sc||1.15;const V0=V(face),{P,D,F}=V0,ph=p*TAU,t=G.t,walk=anim==='walk',atk=anim==='attack';
  // the spit: .0-.42 the neck draws back, the throat swells and glows; .42-.5 the head snaps forward and the acid comes out; .5-1 it settles
  let back=0,fwd=0,sac=.3+.07*Math.sin(ph*(walk?2:1));
  if(atk){if(p<.42){back=ez(p/.42);sac=.3+.7*back}else if(p<.5){const k=ez((p-.42)/.08);back=1-k;fwd=k;sac=1-.8*k}else{const k=ez((p-.5)/.5);fwd=1-k;sac=.2+.1*k}}
  // walk: low quick steps with a jerk forward on every step, the head bobbing; idle: still, a tic at .2, the head snapping round at .55
  const st=stepper(p,.46),fL=walk?st(0,3.6,2.4):NOSTEP,fR=walk?st(.5,3.6,2.4):NOSTEP,jerk=walk?Math.pow(Math.max(0,Math.sin(ph*2)),4)*1.4:0,
    up=walk?Math.abs(Math.sin(ph*2))*.6:0,tic=!walk&&!atk&&p>.18&&p<.24?Math.sin((p-.18)/.06*Math.PI*3)*1.4:0;
  const Pv=[0,0,12+up],Ch=[3.6-back*1.4+fwd*1.8+jerk,tic*.3,19.6+up-back*.3],Hc=add(Ch,[9-back*3.6+fwd*4.2+jerk*.4,tic,6+back*2.4-fwd*1.8]),
    hy=walk?Math.sin(ph*2)*.12:atk?0:snap(p,-.9),RH=6.6,rP=4.6,rC=6.2;
  {const q=P(3,0,0);shadow(x+q[0]*sc,y+q[1]*sc,11*sc,4.4*sc*KR(),.32)}
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const parts=[],dT=D(Ch);
  // thin bent legs: bare bony shins under the torn trousers, long bony feet
  for(const[sd,f] of[[-1,fL],[1,fR]]){const hip=add(Pv,[0,sd*3,-1.4]),foot=[1.4+f.x,sd*4.2,f.z],k=farK(F(0,sd,0)),o={L1:5.8,L2:5.8,w1:3.4,w2:2.8,col:mix(SPC.skin,SPC.skinF,k),colD:'rgba(30,30,30,.32)',shoe:SPC.shoe,heel:.9,toe:3.2,sr:1.6,pole:[1,0,.3]};
    parts.push({d:dT-100+D(hip)*.01,f:()=>{leg(V0,hip,foot,o);const[kn]=ik(hip,add(foot,[0,0,1.6]),o.L1,o.L2,o.pole),e3=lerp3(hip,kn,.92),col=mix(SPC.pants,SPC.pantsF,k);
      limb([P(hip),P(e3)],[5],col);shadeLimb([P(hip),P(e3)],[2.5,2.5],'rgba(0,0,0,.3)');R.cuff(V0,e3,hip,5,col)}})}
  // the body: bare, hunched; the ribs and a bruise in front, the spine on the back, the trousers from the waist with the rope belt
  parts.push({d:dT,f:()=>{trunk(V0,Pv,rP,Ch,rC,SPC.skin,SPC.skinD,0,{neck:1});const a=P(Pv),b=P(Ch);
    ctx.save();hull(a,rP-.1,b,rC-.1);ctx.clip();
    for(const sd of[-1,1])for(let i=0;i<3;i++)on(V0,Ch,rC*.98,[.62,sd*(.5+i*.08),-.08-i*.24],.1,(q,v)=>{const w=2.6*Math.max(.4,v);ctx.strokeStyle=SPC.rib;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(q[0]-w*sd*.2,q[1]-1);ctx.quadraticCurveTo(q[0]+sd*w*.6,q[1]+.8,q[0]+sd*w*1.3,q[1]-.4);ctx.stroke()});
    on(V0,Ch,rC,[.7,.62,.2],.05,q=>{ctx.fillStyle=SPC.bruise;ell(q[0],q[1],2.6,1.8);ctx.fill()});
    const W=lerp3(Pv,Ch,.2),rw=lerp(rP,rC,.2)+.2;ringCloth(V0,W,rw,face,0,SPC.pants,SPC.pantsD,.7);ctx.restore();
    // the rope belt and its knot
    {const d=[];for(let i=0;i<=24;i++){const an=i/24*TAU;d.push([Math.cos(an),Math.sin(an),0])}for(const r of surf(V0,add(W,[0,0,.5]),rw+.35,d,0)){if(r.length<2)continue;path(r);ctx.strokeStyle=INK;ctx.lineWidth=2.8;ctx.stroke();ctx.strokeStyle='#6b5c3e';ctx.lineWidth=1.3;ctx.stroke()}}
    on(V0,W,rw+.3,[.8,-.6,.1],.1,q=>{ink(1);ctx.fillStyle='#6b5c3e';ball(q,1.2);ctx.fill();ctx.stroke();ctx.strokeStyle='#6b5c3e';ctx.lineWidth=1;seg([q[0]-.4,q[1]+1],[q[0]-.9,q[1]+3.4]);ctx.stroke()});
    for(let i=0;i<4;i++)on(V0,lerp3(Pv,Ch,.45+i*.18),lerp(rP,rC,.45+i*.18),[-1,0,.15],.3,q=>{ink(1.1);ctx.fillStyle=SPC.skinD;ball(q,1.2);ctx.fill();ctx.stroke()})}});
  // long thin arms held forward, the hands hanging low with long fingers; they jerk back when it spits
  for(const sd of[-1,1]){const sh=add(Ch,[.4,sd*5.4,2.4]),swg=walk?Math.sin(ph*2+(sd>0?0:Math.PI))*1.4:Math.sin(ph+sd)*.4,
      hd=add(Ch,[6.4-back*3+fwd*2.4+swg,sd*(6.8+back*1.4),-8.6+back*2+swg*.3]),k=farK(F(0,sd,0));
    parts.push({d:D(add(sh,[6,0,0])),f:()=>zArm(V0,sh,hd,nrm([-.3,sd*.6,-1]),{side:sd,L1:6.6,L2:6.6,bony:1,w1:3,we:2.6,w2:2,hand:1.6,fl:6.8,skin:mix(SPC.skin,SPC.skinF,k),shade:'rgba(40,44,42,.42)',pd:[.3,-sd*.2,-1]})})}
  // the long neck, the head on its own camera, the throat swollen with acid under the jaw, the split jaw hanging
  parts.push({d:D(Hc),f:()=>{neck(V0,add(Ch,[2.6,0,4.4]),3,add(Hc,[-3.4,0,-2.4]),2.6,SPC.skin);
    const Vh=Vat(face+hy,P(Hc),D(Hc)),{P:Ph}=Vh,op=atk?(p>.38&&p<.62?1:.55):.62+.14*Math.sin(ph*2);
    zHead2(Vh,[0,0,0],RH,ph,{skin:SPC.skin,skinD:SPC.skinD,eye:SPC.eye,eyeRgb:SPC.acidRgb,up:.04,mw:.72,open:op,drool:`rgba(${SPC.acidRgb},.85)`});
    // the sac: under the jaw, glowing through the skin, veined; it swells before the spit
    const sq=[RH*.2,0,-RH*1.3],r=3.2+2.1*sac,q=Ph(sq);if(!LOWFX)shine(SPC.acidRgb,q[0],q[1],r*2.6,.3+.5*sac);
    blob(Vh,sq,r,mix(SPC.skin,'#d4f08e',.35+.45*sac),mix(SPC.skinD,'#7aa040',.45),{lw:2,inside:(c,rx,ry)=>{const g=ctx.createRadialGradient(c[0],c[1],.5,c[0],c[1],rx);
      g.addColorStop(0,`rgba(${SPC.acidRgb},${(.4+.5*sac).toFixed(3)})`);g.addColorStop(1,`rgba(${SPC.acidRgb},0)`);ctx.fillStyle=g;ctx.fillRect(c[0]-rx,c[1]-ry,rx*2,ry*2);
      ctx.strokeStyle='rgba(66,96,30,.6)';ctx.lineWidth=.7;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(c[0]-rx*.7,c[1]-ry*.3+i*ry*.32);ctx.quadraticCurveTo(c[0],c[1]-ry*.1+i*ry*.3,c[0]+rx*.7,c[1]-ry*.35+i*ry*.32);ctx.stroke()}}});
    // the split lower jaw: two halves hanging from the corners of the mouth, crooked teeth on their edges, acid dripping between them
    const fv=Vh.F(1,0,-.3);if(fv>-.1){ctx.save();ctx.globalAlpha=cl((fv+.1)*4,0,1);const o=op;
      for(const sd of[-1,1]){const a=Ph([RH*.7,sd*RH*.5,-RH*.46]),b=Ph([RH*.9+o*1.2,sd*(RH*.56+o*1.2),-RH*1.05-o*2.4]),c=Ph([RH*.82,sd*RH*.32,-RH*.66]);
        ink(1.3);ctx.fillStyle=SPC.skinD;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.lineTo(c[0],c[1]);ctx.closePath();ctx.fill();ctx.stroke();
        ctx.fillStyle=ZC.bone;ink(.7);for(const u of[.35,.7]){const m=[lerp(c[0],b[0],u),lerp(c[1],b[1],u)];tri(m[0],m[1],m[0]-sd*.5+(u-.5),m[1]-1.9,.6)}}
      const dq=Ph([RH*.96,0,-RH*.95]),dr=(ph/TAU*3)%1;ctx.strokeStyle=`rgba(${SPC.acidRgb},${(.85*(1-dr)).toFixed(3)})`;ctx.lineWidth=1.3;seg(dq,[dq[0],dq[1]+1.2+dr*4.5]);ctx.stroke();
      ctx.fillStyle=`rgba(${SPC.acidRgb},${(.9*(1-dr)).toFixed(3)})`;ball([dq[0],dq[1]+1.6+dr*4.5],.9);ctx.fill();ctx.restore()}}});
  run(parts);
  // the acid leaving the mouth: .44-.58, a glob and a spray (the game throws its own glob from here)
  if(atk&&p>.44&&p<.58){const k=(p-.44)/.14,c=add(Hc,[RH*.9+k*9,0,-RH*.5+k*1.6]),q=P(c);if(!LOWFX)shine(SPC.acidRgb,q[0],q[1],9,.75*(1-k*.6));
    ink(1.2);ctx.fillStyle=SPC.acid;ball(q,2.6*(1-k*.3));ctx.fill();ctx.stroke();ctx.fillStyle='rgba(255,255,220,.8)';ball([q[0]-.7,q[1]-.8],.8);ctx.fill();
    for(let i=1;i<4;i++){const c2=P(add(Hc,[RH*.9+(k-.06*i)*9,Math.sin(i*2.3)*1.4*k,-RH*.5+(k-.06*i)*1.6-i*.4]));ctx.fillStyle=`rgba(${SPC.acidRgb},${(.55-.13*i).toFixed(2)})`;ball(c2,1.6-.3*i);ctx.fill()}}
  ctx.restore()}

// ------------------------------------------------------------------ IL BRUTO
// huge: the chest wide like a barrel laid across, narrow hips, a hump behind the neck, the head low and forward between the shoulders with
// the iron muzzle, the heavy brow and the eyes burning orange; the right arm monstrous and long (a forearm bigger than the arm, the fist,
// the iron shackle and its broken chain), sewn on at the shoulder; the butcher's apron stained with blood; a long seam across the back
const BRC={skin:'#89947c',skinD:'#606a57',skinF:'#4f5847',apron:'#7a6347',apronD:'rgba(40,26,12,.38)',blood:'rgba(88,10,16,.66)',strap:'#3b2a1c',belt:'#3d2c1e',
  iron:'#5d6168',ironD:'#3b3e44',ironL:'#a2a8b0',rust:'#86522f',eye:'#ff8c3a',eyeRgb:'255,120,50',pants:'#2f2c2c',pantsD:'#1f1c1c',pantsF:'#1f1c1c',shoe:'#161313'};
function bruto(x,y,face,anim,p,sc){sc=sc||1.5;const V0=V(face),{P,D,F}=V0,ph=p*TAU,t=G.t,walk=anim==='walk',chg=anim==='charge',atk=anim==='attack',idle=!walk&&!chg&&!atk;
  // the slam: .0-.4 the big arm goes up over the head and the body leans back; .4-.5 it smashes down in front, the knees bend; .5-.62 it
  // stays down (the floor cracks, the dust rings out); .62-1 it straightens up again
  let raise=0,smash=0;if(atk){if(p<.4)raise=ez(p/.4);else if(p<.5){const k=(p-.4)/.1;raise=1-k*k;smash=k*k}else if(p<.62)smash=1;else smash=1-ez((p-.62)/.38)}
  // walk: slow heavy steps that stamp, the shoulders rolling; charge: bent forward, short fast steps, the big arm in front like a ram
  const st=stepper(p,chg?.4:.54),fL=walk||chg?st(0,chg?5.4:3.4,chg?2.6:1.5):NOSTEP,fR=walk||chg?st(.5,chg?5.4:3.4,chg?2.6:1.5):NOSTEP,
    up=walk?-Math.abs(Math.cos(ph))*1.1:chg?Math.abs(Math.sin(ph))*1.6:0,breath=idle?Math.sin(ph)*.6:0,
    lean=chg?6:atk?(-2.6*raise+7*smash):walk?1.2:0,sway=walk?Math.sin(ph)*1.5:chg?Math.sin(ph)*.9:0,crouch=smash*3;
  const Pv=[lean*.25,sway*.4,13.4+up-crouch],Ch=[1.4+lean,sway,24.6+up+breath*.5-crouch*1.7],Hc=add(Ch,[6.4+lean*.1+(chg?1.2:0),sway*.2,7.6-(chg?2.2:0)-smash*1.2]),
    hump=add(Ch,[-3.8,0,5.4]),hy=idle?snap(p,.75):0,RH=7,PA=6.2,PB=7.4,PC=6.2,CA=8,CB=12.4,CC=9.2;
  {const q=P(Pv[0]+2,0,0);shadow(x+q[0]*sc,y+q[1]*sc,15.5*sc,6.2*sc*KR(),.36)}
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const parts=[],dT=D(Ch);
  // thick legs, heavy boots
  for(const[sd,f] of[[-1,fL],[1,fR]]){const hip=add(Pv,[0,sd*4.4,-2.6]),foot=[Pv[0]*.6+1.4+f.x,sd*5.8,f.z],k=farK(F(0,sd,0));
    parts.push({d:dT-100+D(hip)*.01,f:()=>leg(V0,hip,foot,{L1:5.6,L2:5.6,w1:7,w2:6.2,col:mix(BRC.pants,BRC.pantsF,k),colD:'rgba(0,0,0,.32)',shoe:BRC.shoe,heel:1.7,toe:3.2,sr:3.1})})}
  // the hips in the trousers, the belt with its buckle
  parts.push({d:dT-2,f:()=>{egg(V0,Pv,PA,PB,PC,BRC.pants,BRC.pantsD);const d=[];for(let i=0;i<=28;i++){const an=i/28*TAU;d.push([Math.cos(an),Math.sin(an),.6])}
    for(const r of surfE(V0,Pv,PA*1.02,PB*1.02,PC*1.02,d,0)){if(r.length<2)continue;path(r);ctx.strokeStyle=INK;ctx.lineWidth=3.6;ctx.stroke();ctx.strokeStyle=BRC.belt;ctx.lineWidth=2;ctx.stroke()}
    onE(V0,Pv,PA*1.03,PB*1.03,PC*1.03,[1,0,.6],.1,q=>{ink(1);ctx.fillStyle=BRC.iron;ctx.fillRect(q[0]-1.8,q[1]-1.4,3.6,2.8);ctx.strokeRect(q[0]-1.8,q[1]-1.4,3.6,2.8);ctx.fillStyle=BRC.ironL;ctx.fillRect(q[0]-1,q[1]-.8,2,.6)})}});
  // the chest, the seam across the back, the apron in front (a plane on the body: it foreshortens as it turns)
  parts.push({d:dT,f:()=>{egg(V0,Ch,CA,CB,CC,BRC.skin,BRC.skinD,{inside:()=>{
      // the line between the pectorals and a scar, where the apron leaves the chest bare
      onE(V0,Ch,CA,CB,CC,[.92,0,.42],.1,q=>{ctx.strokeStyle='rgba(30,36,24,.45)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(q[0],q[1]-1.6);ctx.quadraticCurveTo(q[0]+.4,q[1]+1,q[0],q[1]+3);ctx.stroke()});
      const d=[];for(let i=0;i<=9;i++){const a=i/9;d.push([-.92+a*.1,.78-a*1.56,.52-a*.8])}for(const r of surfE(V0,Ch,CA,CB,CC,d,.12))stitches(r,0,1,1.4)}});
    const fa=F(1,0,0);if(fa>-.15){ctx.save();ctx.globalAlpha=cl((fa+.15)*4,0,1);
      const tl=P(add(Ch,[CA*.84,-6.2,2.2])),tr=P(add(Ch,[CA*.84,6.2,2.2])),br=P(add(Pv,[PA+1.8,7.6,-7.4])),bl=P(add(Pv,[PA+1.8,-7.6,-7.4])),shp=()=>{ctx.beginPath();ctx.moveTo(tl[0],tl[1]);ctx.lineTo(tr[0],tr[1]);ctx.lineTo(br[0],br[1]);
        for(let i=1;i<6;i++){const u=i/6;ctx.lineTo(lerp(br[0],bl[0],u),lerp(br[1],bl[1],u)+(i%2?1.6:0))}ctx.lineTo(bl[0],bl[1]);ctx.closePath()};
      ctx.lineCap='round';for(const c of[tl,tr]){const n=P(add(Ch,[2.6,c===tl?-3.6:3.6,CC*.95]));ctx.strokeStyle=INK;ctx.lineWidth=3;seg(c,n);ctx.stroke();ctx.strokeStyle=BRC.strap;ctx.lineWidth=1.4;ctx.stroke()}
      ink(2);ctx.fillStyle=BRC.apron;shp();ctx.fill();ctx.stroke();ctx.save();shp();ctx.clip();const m=[(tl[0]+br[0])/2,(tl[1]+br[1])/2],w=Math.hypot(tr[0]-tl[0],tr[1]-tl[1]);
      ctx.fillStyle=BRC.apronD;ell(m[0]+w*.42,m[1]+4,w*.5,26);ctx.fill();ctx.fillStyle=BRC.blood;ctx.beginPath();ctx.ellipse(m[0]-w*.12,m[1]-2,w*.24,4.4,.4,0,TAU);ctx.fill();
      ctx.beginPath();ctx.ellipse(m[0]+w*.22,m[1]+7,w*.14,2.6,-.3,0,TAU);ctx.fill();ctx.fillRect(m[0]-w*.16,m[1]+1,1.6,7);ctx.fillRect(m[0]+w*.02,m[1]+2,1.2,5);
      ctx.strokeStyle='rgba(30,20,10,.4)';ctx.lineWidth=.9;seg([m[0]-w*.32,m[1]-9],[m[0]-w*.36,m[1]+10]);ctx.stroke();seg([m[0]+w*.3,m[1]-9],[m[0]+w*.34,m[1]+10]);ctx.stroke();
      ctx.fillStyle=wa(.12);ell(m[0]-w*.3,m[1]-8,w*.18,5);ctx.fill();ctx.restore();ctx.restore()}}});
  // the hump behind the neck (from behind it hides the bottom of the head)
  parts.push({d:D(hump),f:()=>egg(V0,hump,5.6,8.6,5,BRC.skin,BRC.skinD,{inside:()=>{for(let i=0;i<4;i++)onE(V0,hump,5.6,8.6,5,[-.5-i*.12,0,.8-i*.42],.2,q=>{ctx.fillStyle='rgba(40,48,32,.4)';ctx.beginPath();ctx.ellipse(q[0],q[1]+.5,1.5,.8,0,0,TAU);ctx.fill();ctx.fillStyle=wa(.18);ctx.beginPath();ctx.ellipse(q[0]-.2,q[1]-.3,1.1,.5,0,0,TAU);ctx.fill()})}})});
  // the small left arm; the huge right arm sewn on at the shoulder: a forearm bigger than the arm, the fist, the shackle and the chain
  for(const sd of[-1,1]){const big=sd>0,k=farK(F(0,sd,0)),col=mix(BRC.skin,BRC.skinF,k),sh=add(Ch,[0,sd*(big?10.8:9.6),big?3.8:3.2]),
      swg=walk?Math.sin(ph+(big?Math.PI:0))*1.8:breath*.3,
      hd=big?(atk?add(Ch,[3-raise*4+smash*10,sd*(12-smash*4),-6+raise*28-smash*15]):chg?add(Ch,[14,sd*8,-4]):add(Ch,[4+swg,sd*14,-12+swg*.3])):add(Ch,[chg?7:4.6-swg,sd*11.6,-8.6+swg*.3]);
    parts.push({d:D(add(sh,[5,0,0]))+(big?.4:0),f:()=>{
      if(!big){zArm(V0,sh,hd,nrm([-.3,sd*.6,-1]),{side:sd,L1:6.4,L2:6.2,bony:1,w1:5.4,we:4.8,w2:4,hand:2.8,fl:4.8,skin:col,shade:'rgba(40,50,30,.42)'});egg(V0,add(sh,[0,-.6,1]),4.6,4.4,4.8,col,BRC.skinD);return}
      const[el,h]=ik(sh,hd,9,9.6,nrm([-.4,.8,-.5])),a=P(sh),e=P(el),w=P(h);
      bone([a,e,w],[4.4,3.9,5.4],col,null,[[e,4.2]]);shadeLimb([a,e,w],[4.4,3.9,5.4],'rgba(40,50,30,.42)');
      ctx.strokeStyle='rgba(60,40,70,.45)';ctx.lineWidth=.8;{const dx=w[0]-e[0],dy=w[1]-e[1];ctx.beginPath();ctx.moveTo(e[0]+dx*.2-dy*.08,e[1]+dy*.2+dx*.08);ctx.quadraticCurveTo(e[0]+dx*.5+dy*.12,e[1]+dy*.5-dx*.12,e[0]+dx*.72-dy*.05,e[1]+dy*.72+dx*.05);ctx.stroke()}
      {let kd=cross(sub(h,el),[0,0,1]);if(len(kd)<.5)kd=[0,1,0];R.grip(V0,h,kd,5.6,col,ZC.nail)}
      // the shackle: an iron cuff across the forearm, rivets, and the broken chain hanging from it
      {const s3=lerp3(el,h,.68),sq=P(s3),dx=w[0]-e[0],dy=w[1]-e[1],l=Math.hypot(dx,dy)||1,u=[dx/l,dy/l],n=[-u[1],u[0]],hw=5.6,hl=1.9,c4=[[-hl,-hw],[hl,-hw],[hl,hw],[-hl,hw]].map(([i,j])=>[sq[0]+u[0]*i+n[0]*j,sq[1]+u[1]*i+n[1]*j]);
        ink(1.6);ctx.fillStyle=BRC.iron;path(c4);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle=BRC.ironL;ctx.lineWidth=.7;seg([c4[0][0]+u[0]*.6,c4[0][1]+u[1]*.6],[c4[3][0]+u[0]*.6,c4[3][1]+u[1]*.6]);ctx.stroke();
        ctx.fillStyle=BRC.ironL;for(const j of[-3.4,3.4]){ball([sq[0]+n[0]*j,sq[1]+n[1]*j],.6);ctx.fill()}ctx.fillStyle=BRC.rust;ball([sq[0]+n[0]*1.4+u[0]*.6,sq[1]+n[1]*1.4+u[1]*.6],.8);ctx.fill();
        const hang=[sq[0]+n[0]*(n[1]>0?hw:-hw),sq[1]+n[1]*(n[1]>0?hw:-hw)];
        for(let i=1;i<=4;i++){const c=[hang[0]+Math.sin(ph+i*.7)*.4*i,hang[1]+i*2.6-1];ctx.strokeStyle=INK;ctx.lineWidth=2.4;ctx.beginPath();ctx.ellipse(c[0],c[1],1.3,1.8,i%2?0:Math.PI/2,0,TAU);ctx.stroke();ctx.strokeStyle=i%2?BRC.iron:BRC.ironL;ctx.lineWidth=1;ctx.stroke()}}
      // the shoulder over the root of the arm, and the seam where the arm was sewn on
      const S3=add(sh,[0,.8,1.2]);egg(V0,S3,5.6,5.4,5.8,col,BRC.skinD,{inside:()=>{const d=[];for(let i=0;i<=8;i++){const an2=-.4+i/8*2.2;d.push([Math.cos(an2)*.7,.7,Math.sin(an2)*.7])}
        for(const r of surfE(V0,S3,5.6,5.4,5.8,d,.1))stitches(r,0,1,1.1)}})}})}
  // the head low and forward between the shoulders, on its own camera; the iron muzzle with the strap round the head; the heavy brow
  parts.push({d:D(Hc),f:()=>{neck(V0,add(Ch,[2.6,0,CC*.8]),4.8,add(Hc,[-2,0,-3.4]),4,BRC.skin);const Vh=Vat(face+hy,P(Hc),D(Hc)),{P:Ph,F:Fh}=Vh;
    zHead2(Vh,[0,0,0],RH,ph,{skin:BRC.skin,skinD:BRC.skinD,eye:BRC.eye,eyeRgb:BRC.eyeRgb,up:.02,noMouth:1,noHair:1,brow:1});
    {const d=[];for(let i=0;i<=24;i++){const an=i/24*TAU;d.push([Math.cos(an),Math.sin(an),-.42])}for(const r of surf(Vh,[0,0,0],RH*1.01,d,0)){if(r.length<2)continue;path(r);ctx.strokeStyle=INK;ctx.lineWidth=3.2;ctx.stroke();ctx.strokeStyle=BRC.strap;ctx.lineWidth=1.6;ctx.stroke()}}
    const fv=Fh(1,0,-.3);if(fv>-.2){ctx.save();ctx.globalAlpha=cl((fv+.2)*3,0,1);const c=Ph([RH*.84,0,-RH*.42]),wv=RH*.62*Math.max(.35,fv),hh=RH*.36;
      ink(1.5);ctx.fillStyle=BRC.ironD;ctx.beginPath();ctx.ellipse(c[0],c[1],wv,hh,0,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='rgba(20,8,8,.9)';ctx.beginPath();ctx.ellipse(c[0],c[1]+.4,wv*.8,hh*.62,0,0,TAU);ctx.fill();
      ctx.strokeStyle=BRC.iron;ctx.lineWidth=1.3;for(let i=-2;i<=2;i++){seg([c[0]+i*wv*.34,c[1]-hh*.72],[c[0]+i*wv*.34,c[1]+hh*.72]);ctx.stroke()}seg([c[0]-wv*.9,c[1]],[c[0]+wv*.9,c[1]]);ctx.stroke();
      ctx.strokeStyle=BRC.ironL;ctx.lineWidth=.6;seg([c[0]-wv*.7,c[1]-hh*.66],[c[0]+wv*.5,c[1]-hh*.7]);ctx.stroke();ctx.fillStyle=BRC.ironL;for(const sd of[-1,1]){ball([c[0]+sd*wv*.86,c[1]-hh*.4],.8);ctx.fill()}
      ctx.fillStyle=ZC.bone;ink(.6);for(const xx of[-.5,0,.45])tri(c[0]+xx*wv,c[1]+hh*.5,c[0]+xx*wv+.4,c[1]-hh*.1,.7);ctx.restore()}}});
  run(parts);
  // the slam on the floor: a ring of dust and dark cracks in front, at .48-.85
  if(atk&&p>.47&&p<.86){const k=(p-.47)/.39,c=P(Ch[0]+12,8,0);ctx.strokeStyle=`rgba(206,196,176,${(.75*(1-k)).toFixed(3)})`;ctx.lineWidth=2.6*(1-k)+.6;ctx.beginPath();ctx.ellipse(c[0],c[1],6+k*20,(6+k*20)*.5*KR(),0,0,TAU);ctx.stroke();
    ctx.save();ctx.globalAlpha=cl(2-k*2,0,1);ctx.lineCap='round';for(let i=0;i<6;i++){const a=i/6*TAU+.3,L=5+Math.sin(i*2.7)*2+Math.min(1,k*4)*5,m=[c[0]+Math.cos(a+.25)*L*.5,c[1]+Math.sin(a+.25)*L*.25],e=[c[0]+Math.cos(a)*L,c[1]+Math.sin(a)*L*.5];
      ctx.strokeStyle='rgba(18,14,12,.85)';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(c[0],c[1]);ctx.lineTo(m[0],m[1]);ctx.lineTo(e[0],e[1]);ctx.stroke()}ctx.restore()}
  // dust at the feet when it charges
  if(chg&&!LOWFX)for(const[f,sd] of[[fL,-1],[fR,1]])if(f.z<.3){const q=P(Pv[0]*.6+1.4+f.x-3,sd*5.8,1);ctx.fillStyle='rgba(190,180,160,.28)';ball(q,2.6);ctx.fill();ball([q[0]-2.4,q[1]-1],1.8);ctx.fill()}
  ctx.restore()}

Object.assign(CR,{gonfio,sputatore,bruto});
})();
