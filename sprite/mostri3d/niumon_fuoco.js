// Mossbound · il niumon di fuoco in 3D vero (Denis, 5 novembre: «prova a crearmi questo niumon con tanto di anteprima», con un'immagine in
// pixel art: un cucciolo a quattro zampe giallo-arancio, la testa grande con la criniera di fiamme, gli occhi grandi rosso-arancio con la
// luce, le zampe rosse, la coda di fuoco e le braci che salgono; accanto i fogli coi lati, dietro, a occhi chiusi, mentre cammina e felice
// con la bocca aperta e una zampa su; l'immagine sta in sprite/mostri3d/niumon_rif.webp). Fatto con la formula del 3D: il corpo è una forma
// sola scolpita con le distanze (scultura.js), le fiamme, gli occhi e le palpebre sono pezzi di kit3d.js; lo scheletro ha le ossa delle zampe
// (con la IK), della mascella, delle palpebre e delle fiamme, che si muovono come fuoco; lo dipinge mb3.js (le fiamme sono luce: il cuore
// giallo verso di te e l'orlo rosso, e fanno bagliore). Tutte le mosse sono nostre e dipendono solo da p.
// NF3.build(o), NF3.solve(M, NF3.pose(mossa, p, {look})), NF3.mix, NF3.joints, NF3.MOSSE, NF3.SEQ; NF3.fuoco(M, P): le punte delle fiamme
// (per le braci); NF3.bocca(M, P): la bocca e dove guarda (per la fiammata).
(function(root){'use strict';
const K3D=(typeof root.K3D!=='undefined'&&root.K3D)||(typeof require==='function'?require('./kit3d.js'):null);
const SCU=(typeof root.SCU!=='undefined'&&root.SCU)||(typeof require==='function'?require('./scultura.js'):null);
const {TAU,cl,lerp,sm,ez,add,sub,mul,dot,cross,len,nrm,lerp3,hash,hex,mixc,Q0,qmul,qax,qrot,rx,ry,rz,qq,K,Mesh,tube,ball}=K3D;
const {ell,cone,Sculpt,nets,normal,occl,weights,fbm,noise}=SCU;const sball=SCU.ball;
// ---------------------------------------------------------------- the colours of the picture
const C={fur:hex('#f6b54a'),furL:hex('#ffd77e'),furD:hex('#ec8f36'),furR:hex('#e0662c'),paw:hex('#c8441f'),pawD:hex('#9c2e16'),
  fl0:hex('#ffe27a'),fl1:hex('#ffb13a'),fl2:hex('#ff7424'),fl3:hex('#e2401b'),
  iris:hex('#ff6c2c'),irisT:hex('#c33a1d'),irisR:hex('#5c160b'),pupil:hex('#2a0906'),glint:hex('#fffaf0'),nose:hex('#7c2614'),
  mouth:hex('#561109'),tongue:hex('#ef7563')};
// ---------------------------------------------------------------- the skeleton of a little fire cub (24 tall with the flames)
const EYR=1.55,EYE=s=>[2.0*s,10.45,5.5],GAZE=s=>nrm([.13*s,-.03,1]);
const BN=['root','bacino','schiena','petto','collo','testa','mascella','palpS','palpD','cresta','crestaS','crestaD','orecchioS','orecchioD','nuca','nucaS','nucaD','coda1','coda2','coda3'];
for(const sd of['S','D'])BN.push('braccio'+sd,'avambraccio'+sd,'mano'+sd);
for(const sd of['S','D'])BN.push('coscia'+sd,'stinco'+sd,'piede'+sd);
const BI={};BN.forEach((n,i)=>{BI[n]=i});const bi=n=>BI[n];
const PAR={bacino:'root',schiena:'bacino',petto:'schiena',collo:'petto',testa:'collo',mascella:'testa',palpS:'testa',palpD:'testa',cresta:'testa',crestaS:'testa',crestaD:'testa',
  orecchioS:'testa',orecchioD:'testa',nuca:'testa',nucaS:'testa',nucaD:'testa',coda1:'bacino',coda2:'coda1',coda3:'coda2'};
for(const sd of['S','D'])Object.assign(PAR,{['braccio'+sd]:'petto',['avambraccio'+sd]:'braccio'+sd,['mano'+sd]:'avambraccio'+sd,['coscia'+sd]:'bacino',['stinco'+sd]:'coscia'+sd,['piede'+sd]:'stinco'+sd});
// the legs: front (shoulder, elbow a little back, wrist) and hind (hip, knee a little forward, ankle); the paws flat on the ground
const FRONT=s=>({sh:[1.95*s,4.8,2.0],el:[1.95*s,2.85,1.85],wr:[1.95*s,.95,2.3]}),HIND=s=>({hp:[2.15*s,5.0,-2.7],kn:[2.15*s,3.05,-2.15],an:[2.15*s,.95,-2.85]});
const FL1=len(sub(FRONT(1).el,FRONT(1).sh)),FL2=len(sub(FRONT(1).wr,FRONT(1).el)),HL1=len(sub(HIND(1).kn,HIND(1).hp)),HL2=len(sub(HIND(1).an,HIND(1).kn));
// the flames of the head: a bone each at its root; P: base, control, tip (a curve), r: how fat, sd: which side
const FLAMES=[{b:'cresta',P:[[0,14.0,5.1],[0,18.6,5.0],[0,21.2,.9]],r:2.05},
  {b:'crestaS',P:[[2.0,13.8,4.4],[3.5,17.5,4.0],[4.2,19.6,.4]],r:1.65},{b:'crestaD',P:[[-2.0,13.8,4.4],[-3.5,17.5,4.0],[-4.2,19.6,.4]],r:1.65},
  {b:'crestaS',P:[[1.0,14.4,3.2],[1.7,18.2,2.2],[2.1,20.0,-1.5]],r:1.5},{b:'crestaD',P:[[-1.0,14.4,3.2],[-1.7,18.2,2.2],[-2.1,20.0,-1.5]],r:1.5},
  {b:'orecchioS',P:[[3.6,12.9,2.6],[5.7,15.3,2.4],[6.7,17.2,-.5]],r:1.35},{b:'orecchioD',P:[[-3.6,12.9,2.6],[-5.7,15.3,2.4],[-6.7,17.2,-.5]],r:1.35},
  {b:'orecchioS',P:[[3.0,13.7,1.4],[4.7,16.4,.5],[5.5,18.0,-2.3]],r:1.3},{b:'orecchioD',P:[[-3.0,13.7,1.4],[-4.7,16.4,.5],[-5.5,18.0,-2.3]],r:1.3},
  {b:'nuca',P:[[0,14.5,.7],[0,18.4,-.7],[0,19.7,-4.1]],r:1.85},
  {b:'nucaS',P:[[2.4,14.0,.2],[4.0,16.7,-1.3],[4.8,17.6,-3.9]],r:1.45},{b:'nucaD',P:[[-2.4,14.0,.2],[-4.0,16.7,-1.3],[-4.8,17.6,-3.9]],r:1.45}];
// the tail: from the rump, a little furry stump, then the flame rising and curling forward at the top
const TAIL=[[0,6.9,-4.3],[0,9.8,-6.5],[0,12.9,-6.1],[0,15.2,-3.9]];
function bindPose(){const P={root:[0,0,0],bacino:[0,5.4,-2.4],schiena:[0,5.6,-.5],petto:[0,5.8,1.4],collo:[0,7.6,2.3],testa:[0,9.0,2.9],mascella:[0,9.55,5.0],
    palpS:EYE(1),palpD:EYE(-1),coda1:TAIL[0],coda2:TAIL[1],coda3:TAIL[2]};
  for(const f of FLAMES)if(!P[f.b])P[f.b]=f.P[0];
  for(const s of[1,-1]){const sd=s>0?'S':'D',F=FRONT(s),Hd=HIND(s);P['braccio'+sd]=F.sh;P['avambraccio'+sd]=F.el;P['mano'+sd]=F.wr;P['coscia'+sd]=Hd.hp;P['stinco'+sd]=Hd.kn;P['piede'+sd]=Hd.an}
  return BN.map(n=>P[n])}
const B0=bindPose(),bp=n=>B0[BI[n]];
// the four legs with the IK: the paws go where the move says, on the ground under him (or with the body, rel 'corpo'); the paw turns with q
const legT=(ch,wp,rootP,rootQ,sp)=>ch.rel==='corpo'?add(rootP,qrot(rootQ,ch.t)):add([rootP[0],0,rootP[2]],qrot(sp.root&&sp.root.yawQ||Q0(),ch.t)),legE=(ch,w1,rootQ)=>ch.q||rootQ;
const CHAINS=[];for(const sd of['S','D']){
  CHAINS.push({a:'braccio'+sd,b:'avambraccio'+sd,c:'mano'+sd,g:'ant',s:sd,L1:FL1,L2:FL2,pole:[0,-.2,-1],y0:[0,0,-1],target:legT,end:legE});
  CHAINS.push({a:'coscia'+sd,b:'stinco'+sd,c:'piede'+sd,g:'post',s:sd,L1:HL1,L2:HL2,pole:[0,-.2,1],y0:[0,0,1],target:legT,end:legE})}
// ---------------------------------------------------------------- the sculpture: the body, the big round head, the legs, the fur
// forCloth is not used (no clothes): the paws have three toes, the cheeks and the chest tufts of fur that look like little flames
function body(){const S=Sculpt();
  // · the body: a soft round barrel, the chest a little higher, the round rump, the belly
  S.add(ell([0,5.3,-.4],[3.1,2.85,3.7])).add(ell([0,5.8,1.5],[2.85,2.7,2.3]),.9).add(ell([0,5.4,-2.6],[2.95,2.7,2.3]),.9).add(ell([0,4.25,-.3],[2.45,1.55,2.9]),.8);
  // · the neck, short and thick, and the soft tufts of fur on the chest
  S.add(cone([0,6.6,1.7],[0,8.8,2.9],2.45,2.3),1.0);
  for(const[x,y,z,tx,ty,tz,r] of[[0,8.0,4.6,0,6.5,5.25,.95],[1.15,7.9,4.35,1.55,6.4,4.95,.8],[-1.15,7.9,4.35,-1.55,6.4,4.95,.8],[2.0,7.7,3.6,2.65,6.3,4.0,.65],[-2.0,7.7,3.6,-2.65,6.3,4.0,.65]])
    S.add(cone([x,y,z],[tx,ty,tz],r,.22),.5);
  // · the head: big and round (as big as the body), a little wider than tall; the soft cheeks with tufts going out and back; the
  // little nose and the mouth
  S.add(ell([0,11.0,2.9],[4.6,4.2,4.0]),1.0).add(ell([0,9.5,4.7],[3.1,2.1,2.35]),.9);
  for(const s of[1,-1])S.add(ell([3.0*s,9.6,4.1],[1.7,1.55,1.6]),.8).add(cone([3.9*s,9.9,3.0],[5.7*s,10.6,1.6],.7,.18),.45).add(cone([3.7*s,9.0,3.4],[5.2*s,8.3,2.4],.58,.16),.4)
    .add(cone([4.1*s,11.3,1.6],[5.6*s,12.4,.3],.6,.16),.4);
  S.add(sball([0,9.78,6.95],.24),.1);
  S.dig(ell([0,9.18,6.78],[.66,.055,.42]),.05);
  // · the legs: short and stubby, round at the joints; the paws big and round with three toes
  for(const s of[1,-1]){const F=FRONT(s),Hd=HIND(s);
    S.add(cone(F.sh,F.el,1.3,1.08),.6).add(cone(F.el,F.wr,1.08,.98),.4).add(ell(add(F.wr,[0,-.3,.55]),[1.08,.68,1.32]),.4);
    S.add(ell(add(Hd.hp,[0,-.25,0]),[1.5,1.8,1.65]),.8).add(cone(Hd.hp,Hd.kn,1.35,1.08),.6).add(cone(Hd.kn,Hd.an,1.08,.98),.4).add(ell(add(Hd.an,[0,-.3,.55]),[1.08,.68,1.32]),.4);
    for(const P of[F.wr,Hd.an])for(const dx of[-.55,0,.55])S.add(sball(add(P,[dx,-.58,1.5-.16*Math.abs(dx)]),.38),.22);
    // a little tuft of fur on the elbow
    S.add(cone(add(F.el,[0,.4,-.6]),add(F.el,[0,-.2,-1.5]),.45,.12),.3)}
  // · the stump of the tail, where the flame comes out
  S.add(cone([0,6.1,-4.0],[0,7.7,-5.3],1.3,1.0),.6);
  return S}
// ---------------------------------------------------------------- the weights of the bones
const seg=(n,b,s)=>({i:BI[n],a:bp(n),b,s});
const BONES=[seg('bacino',bp('schiena'),3.0),seg('schiena',bp('petto'),3.0),seg('petto',add(bp('petto'),[0,1.4,1]),3.0),seg('collo',bp('testa'),1.9),
  seg('testa',add(bp('testa'),[0,3.6,0]),3.6),seg('coda1',bp('coda2'),1.1)];
for(const sd of['S','D'])BONES.push(seg('braccio'+sd,bp('avambraccio'+sd),.9),seg('avambraccio'+sd,bp('mano'+sd),.75),seg('mano'+sd,add(bp('mano'+sd),[0,-.6,1.4]),.7),
  seg('coscia'+sd,bp('stinco'+sd),1.1),seg('stinco'+sd,bp('piede'+sd),.75),seg('piede'+sd,add(bp('piede'+sd),[0,-.6,1.4]),.7));
const PART={bacino:['bacino','schiena','cosciaS','cosciaD','coda1'],schiena:['bacino','schiena','petto'],petto:['schiena','petto','collo','braccioS','braccioD'],
  collo:['petto','collo','testa'],testa:['collo','testa'],coda1:['bacino','coda1'],braccioS:['petto','braccioS','avambraccioS'],braccioD:['petto','braccioD','avambraccioD'],
  avambraccioS:['braccioS','avambraccioS','manoS'],avambraccioD:['braccioD','avambraccioD','manoD'],manoS:['avambraccioS','manoS'],manoD:['avambraccioD','manoD'],
  cosciaS:['bacino','cosciaS','stincoS'],cosciaD:['bacino','cosciaD','stincoD'],stincoS:['cosciaS','stincoS','piedeS'],stincoD:['cosciaD','stincoD','piedeD'],piedeS:['stincoS','piedeS'],piedeD:['stincoD','piedeD']};
// the head is all one bone (rigid, round), the jaw takes the chin under the mouth
const jawW=p=>{const ax=Math.abs(p[0]);if(p[1]>9.22||p[2]<4.8||ax>2.8)return 0;return sm((9.19-p[1])/.22)*sm((p[2]-4.9)/.7)*sm((2.7-ax)/.6)};
function skinW(p){const inHead=p[1]>8.0&&p[2]>-1.6||p[1]>9.6;
  if(inHead&&p[1]>7.6){const t=sm((p[1]-7.8)/1.3);let w=[[bi('testa'),t],[bi('collo'),1-t]];const j=jawW(p);if(j>0)w=[[bi('testa'),t*(1-j)],[bi('mascella'),j*t],[bi('collo'),1-t]];return w.filter(x=>x[1]>.001)}
  const w0=weights(p,BONES,null,.01),near=BN[w0[0][0]],only=(PART[near]||[near]).map(bi);return weights(p,BONES,only,.45)}
// ---------------------------------------------------------------- the paint of the fur
function furPaint(p,n){const[x,y,z]=p;let c=C.fur.slice();const ax=Math.abs(x);
  c=mixc(c,C.furD,sm((n[1]-.35)/.5)*sm((8.6-y)/2)*.55);// the back a little more orange
  c=mixc(c,C.furL,sm((z-3.4)/1.4)*sm((11.4-y)/2.5)*.7);// the chest and the face lighter
  c=mixc(c,C.furL,sm((-n[1]-.2)/.5)*sm((5.2-y)/2)*.6);// the belly
  if(y>11.6)c=mixc(c,C.furL,sm((1.0-ax)/.6)*sm((z-3.6)/1)*.8);// the light streak up the forehead, under the flames
  c=mixc(c,C.furR,sm((2.6-y)/1.2)*.75);c=mixc(c,C.paw,sm((1.4-y)/.5));// the legs going red, the paws red
  for(const s of[1,-1])c=mixc(c,C.furR,sm((.75-len(sub(p,[2.95*s,9.4,5.2])))/.65)*.25);// a blush on the cheeks
  c=mixc(c,C.nose,sm((.32-len(sub(p,[0,9.78,6.95])))/.1));// the nose
  const nz=fbm(x*.9,y*.9,z*.9);c=mixc(c,C.furD,sm((nz-.58)/.12)*.18);return c}
// a flame: a tube along a curve, fat low and sharp at the tip, a little wavy; the colour from the light core at the root to red at the tip
const fireC=t=>t<.2?mixc(C.fl0,C.fl1,t/.2):t<.52?mixc(C.fl1,C.fl2,(t-.2)/.32):mixc(C.fl2,C.fl3,Math.min(1,(t-.52)/.36));
const bez=(P,t)=>{const u=1-t;return[u*u*P[0][0]+2*u*t*P[1][0]+t*t*P[2][0],u*u*P[0][1]+2*u*t*P[1][1]+t*t*P[2][1],u*u*P[0][2]+2*u*t*P[1][2]+t*t*P[2][2]]};
function flame(m,P,r0,wf,o){o=o||{};const N=o.n||14,pts=[],rad=[],side=o.side||[1,0,0];
  for(let i=0;i<=N;i++){const t=i/N;let p=P.length===3?bez(P,t):cat(P,t);p=add(p,mul(side,o.wave===undefined?.22*Math.sin(t*Math.PI*2+(o.ph||0))*t:o.wave*Math.sin(t*Math.PI*2+(o.ph||0))*t));
    pts.push(p);rad.push(r0*(1-Math.pow(t,1.6))*(.82+.4*Math.sin(Math.PI*Math.min(1,t*1.15))))}
  rad[N]=.02;tube(m,pts,rad,10,(q,t)=>({c:fireC(t),k:K(9.4,0,.6),w:wf(t)}),{cap0:'open',cap1:'point',tip:.6,flat:[o.flat||.8,1],up:o.up||[0,0,1]})}
// Catmull-Rom through points (the tail)
function cat(P,t){const n=P.length-1,f=t*n,i=Math.min(n-1,Math.floor(f)),u=f-i,p0=P[Math.max(0,i-1)],p1=P[i],p2=P[i+1],p3=P[Math.min(n,i+2)];
  return[0,1,2].map(k=>.5*((2*p1[k])+(-p0[k]+p2[k])*u+(2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*u*u+(-p0[k]+3*p1[k]-3*p2[k]+p3[k])*u*u*u))}
// ---------------------------------------------------------------- the model
function build(o){o=o||{};const HQ=o.h||1,m=Mesh(),fire=Mesh(),BODY=body(),BX=[-8,-1,-7.5,8,16,9],D=BODY.fast(BX,1,3.5);
  const NETS=[];const skin=(box,h,keep,name)=>{const t0=Date.now(),r=nets(D,box,h,{keep}),P=r.P,I=r.I,o0=m.P.length/3;m.group(1);
    for(let i=0;i<P.length/3;i++){const p=[P[i*3],P[i*3+1],P[i*3+2]],n=normal(D,p),inFace=p[2]>5.0&&p[1]>8.2&&p[1]<12.4&&Math.abs(p[0])<3.4;
      const v=m.v(p,n,furPaint(p,n),K(1.2,0,inFace?.7:1),skinW(p));m.K[v*4+2]=occl(D,p,n)*.7}
    for(let t=0;t<I.length;t+=3)m.t(o0+I[t],o0+I[t+1],o0+I[t+2]);NETS.push([name,I.length/3,Date.now()-t0])};
  // the face finer (the eyes sit in it, the nose, the mouth), the rest wider; the two grids overlap a little where they meet
  const inFace=p=>p[2]>3.6&&p[1]>7.8&&p[1]<13.0&&Math.abs(p[0])<3.9,inFaceCore=p=>p[2]>3.9&&p[1]>8.1&&p[1]<12.7&&Math.abs(p[0])<3.6;
  skin(BX,.2*HQ,p=>!inFaceCore(p),'corpo');skin([-4.1,7.6,3.4,4.1,13.2,7.6],.1*HQ,inFace,'viso');
  // · the eyes: big balls of fire-orange, the dark pupil, two glints; the lids (closed when he blinks or sleeps)
  for(const s of[1,-1]){const c=EYE(s),g=GAZE(s),up=[0,1,0],hd=nrm(add(add(g,mul([1,0,0],-.42)),mul(up,.5))),hd2=nrm(add(add(g,mul([1,0,0],.3)),mul(up,-.34)));
    m.group(2);ball(m,c,[EYR,EYR,EYR],40,28,(p,d)=>{const t=Math.acos(cl(dot(d,g),-1,1));let col,k=5;
      if(t<.48){col=C.pupil;k=6}else if(t<1.2){col=mixc(mixc(C.iris,C.irisT,sm((d[1]+.1)/.7)*.5),C.irisR,sm((t-1.02)/.18))}else col=C.irisR;
      if(Math.acos(cl(dot(d,hd),-1,1))<.24){col=C.glint;k=9}else if(Math.acos(cl(dot(d,hd2),-1,1))<.11){col=C.glint;k=9}
      return{c:col,k:K(k,0,.8),w:[[bi('testa'),1]]}});
    // the lid: a ball round the eye, a little bigger, the colour of the face; only its cap stays (lids()): open, up and back in the head
    const R=EYR+.07;ball(m,c,[R,R,R],26,14,(p,d)=>({c:mixc(furPaint(p,d),C.furD,.15),k:K(1.2,0,.75),w:[[bi(s>0?'palpS':'palpD'),1]]}))}
  lids(m);
  // · the inside of the mouth (dark) and the tongue: seen when the jaw opens
  ball(m,[0,9.2,6.0],[1.0,.62,.75],14,10,()=>({c:C.mouth,k:K(6,0,0),w:[[bi('testa'),.6],[bi('mascella'),.4]]}));
  ball(m,[0,8.86,6.3],[.58,.2,.52],12,8,()=>({c:C.tongue,k:K(1.2,0,0),w:[[bi('mascella'),1]]}));
  // · the flames of the head: the root with the head, the rest with its own bone
  for(const f of FLAMES){const s=f.P[0][0]>.5?1:f.P[0][0]<-.5?-1:0;
    flame(fire,f.P,f.r,t=>[[bi('testa'),1-sm(t/.55)],[bi(f.b),sm(t/.55)]],{side:s?[s*.5,0,.85]:[1,0,0],ph:hash(f.r*7+f.P[0][1])*6,wave:.42,up:s?[s,0,0]:[1,0,0],flat:.74})}
  // · the tail of fire: along the three bones, two little tongues out of it
  flame(fire,TAIL,1.95,t=>t<.33?[[bi('coda1'),1-sm(t/.33)*.5],[bi('coda2'),sm(t/.33)*.5]]:t<.66?[[bi('coda2'),1-sm((t-.33)/.33)*.5],[bi('coda3'),.5+sm((t-.33)/.33)*.5]]:[[bi('coda3'),1]],
    {n:20,side:[1,0,0],wave:.3,up:[1,0,0],flat:.82});
  for(const s of[1,-1])flame(fire,[[.4*s,10.4,-6.5],[1.7*s,12.2,-7.6],[2.0*s,13.9,-8.0]],.75,t=>[[bi('coda2'),1-t],[bi('coda3'),t]],{n:9,side:[0,0,1],wave:.12,up:[s,0,0]});
  const M=K3D.pack(K3D.skel(BN,PAR,B0,CHAINS),[[m,0],[fire,0]]);M.nets=NETS;return M}
// the lids are balls round the eyes: keep only the cap round their axis (up and back), so when the bone turns down it closes over the eye
function lids(m){const W=m.W,J=m.J,P=m.P,keep=[];const lidBones=[bi('palpS'),bi('palpD')];
  for(let t=0;t<m.I.length;t+=3){const a=m.I[t];const j=J[a*4];if(!lidBones.includes(j)||W[a*4]<.99){keep.push(m.I[t],m.I[t+1],m.I[t+2]);continue}
    const s=j===bi('palpS')?1:-1,c=EYE(s),g=GAZE(s),sAx=nrm(cross([0,1,0],g)),ax=qrot(qax(sAx,-1.3),[0,1,0]);let ok=true;
    for(const v of[m.I[t],m.I[t+1],m.I[t+2]]){const d=nrm(sub([P[v*3],P[v*3+1],P[v*3+2]],c));if(Math.acos(cl(dot(d,ax),-1,1))>1.86){ok=false;break}}
    if(ok)keep.push(m.I[t],m.I[t+1],m.I[t+2])}
  m.I.length=0;for(const i of keep)m.I.push(i)}
// ---------------------------------------------------------------- the moves (each depends only on p, 0..1)
// o.look: where you are, seen from him (radians round the up axis, 0 = in front): he turns his head to you
const MOSSE={posa:{n:'Posa del disegno',dur:4,loop:1},fermo:{n:'Fermo',dur:6,loop:1},cammina:{n:'Cammina',dur:1.1,loop:1},corre:{n:'Corre',dur:.62,loop:1},
  felice:{n:'Felice',dur:2.6},fiammata:{n:'Fiammata',dur:2.2},colpito:{n:'Colpito',dur:.9},dorme:{n:'Dorme',dur:6,loop:1},esausto:{n:'Esausto',dur:4.2}};
const SEQ=['posa','fermo','cammina','corre','felice','fiammata','colpito','dorme','esausto'];
const wrap=x=>((x%1)+1)%1,snap=(p,k0,k1,k2,k3)=>p<k0?0:p<k1?sm((p-k0)/(k1-k0)):p<k2?1:1-sm((p-k2)/(k3-k2));
const PAWF=s=>FRONT(s).wr,PAWH=s=>HIND(s).an,SAX=s=>nrm(cross([0,1,0],GAZE(s)));
function pose(id,p,o){o=o||{};p=cl(p,0,1);const m=MOSSE[id]||MOSSE.fermo,D=m.dur,sp={root:{p:[0,0,0],q:Q0(),yawQ:Q0()},r:{},ant:{},post:{},emK:1};const R=sp.r,look=cl(o.look||0,-1.2,1.2);
  const turn=(b,q)=>{R[b]=R[b]?qmul(R[b],q):q};
  // a wave that comes back to itself at the end of the move: f times a second
  const wv=(f,ph)=>Math.sin(TAU*(Math.max(1,Math.round(D*f))*p+(ph||0)));
  // the flames: they lick up and sway, each its own way; k how much (0 asleep … 1.6 angry), lean: all of them back (running, hit)
  const fire=(k,f,lean)=>{let i=0;for(const fl of FLAMES){i++;const a=k*(.16*wv(f,i*.37)+.07*wv(f*2.3,i*.61)),b=k*.11*wv(f*1.3,i*.29+.5);turn(fl.b,qq(rx(a-(lean||0)*.5),rz(b)))}
    turn('coda2',qq(rx(k*.09*wv(f*.9,.2)-(lean||0)*.3),rz(k*.12*wv(f*.7,.6))));turn('coda3',qq(rx(k*.14*wv(f*1.2,.45)-(lean||0)*.4),rz(k*.16*wv(f,.1))))};
  const blink=(c)=>{for(const s of[1,-1])turn(s>0?'palpS':'palpD',qax(SAX(s),1.42*c))};
  const jaw=a=>turn('mascella',rx(a));
  const paw=(g,sd,t,rel,q)=>{sp[g][sd]={t,rel,q}};
  const stand=()=>{for(const s of[1,-1]){const sd=s>0?'S':'D';paw('ant',sd,PAWF(s));paw('post',sd,PAWH(s))}};
  // a step: on the ground for st of the cycle sliding back (S half the stride), then lifted (H) and swung forward, the paw turned toes down
  const step=(g,sd,q,S,st,H,x0)=>{q=wrap(q);const s=sd==='S'?1:-1,B=g==='ant'?PAWF(s):PAWH(s);let z,y,r;
    if(q<st){z=S-2*S*q/st;y=0;r=0}else{const u=(q-st)/(1-st);z=-S+2*S*ez(u);y=H*Math.sin(Math.PI*u);r=.55*Math.sin(Math.PI*u)}
    paw(g,sd,[B[0]+(x0||0)*s,B[1]+y,B[2]+z],undefined,rx(r))};
  const breathe=k=>{const b=wv(.25);turn('petto',rx(-.025*b*k));turn('schiena',rx(.012*b*k));return b};
  const headTo=(g,tilt)=>{turn('collo',ry(look*.3*g));turn('testa',qq(ry(look*.42*g),rz(tilt||0)))};
  switch(id){
  case 'posa':{// the pose of the picture: standing, the head turned a little to you, breathing, the flames licking
    breathe(1);stand();headTo(.55,.04);fire(1,1.4);turn('coda1',rz(.05*wv(.5)));blink(snap(wrap(p*2),.46,.49,.51,.54));break}
  case 'fermo':{// at rest: breathing, the tail swaying, he blinks; then he looks at you and tilts his head, and looks away; an ear flame twitches
    const b=breathe(1),g=snap(p,.3,.42,.7,.84);stand();sp.root.p=[.12*wv(1/6),.05*b,0];turn('bacino',rz(.02*wv(1/6)));
    headTo(g,.17*g*Math.sin(Math.PI*cl((p-.36)/.4,0,1)));turn('testa',rx(-.05+.03*wv(1/3)));fire(1,1.4);
    turn('coda1',qq(rz(.14*wv(1/2)),rx(.05*wv(1/3))));turn('orecchioS',rz(-.25*snap(p,.55,.57,.6,.66)));
    blink(Math.max(snap(p,.18,.205,.215,.24),snap(p,.62,.645,.655,.68),snap(p,.93,.955,.965,.99)));break}
  case 'cammina':{// a little trot: the legs on the diagonal together, the body bobbing twice a step, the head steady, the tail swaying
    const S=1.25,st=.6;step('ant','S',p,S,st,1.0);step('post','D',p,S,st,1.0);step('ant','D',p+.5,S,st,1.0);step('post','S',p+.5,S,st,1.0);
    sp.root.p=[.08*Math.cos(TAU*p),-.12+.14*Math.cos(4*Math.PI*p),0];turn('bacino',qq(rz(.04*Math.cos(TAU*p)),ry(.04*Math.sin(TAU*p))));turn('petto',rz(-.03*Math.cos(TAU*p)));
    turn('collo',rx(-.04-.04*Math.cos(4*Math.PI*p)));turn('testa',rx(.04*Math.cos(4*Math.PI*p)));headTo(.4,0);
    turn('coda1',rz(.16*Math.sin(TAU*p)));fire(1.1,1.8,.15);blink(0);break}
  case 'corre':{// a bounding run: the front paws together and then the hind ones, the back bending and stretching, a flight between
    const S=2.4,st=.42;step('ant','S',p,S,st,1.6);step('ant','D',p+.06,S,st,1.6);step('post','S',p+.5,S,st,1.9);step('post','D',p+.56,S,st,1.9);
    const fl=Math.cos(TAU*p);sp.root.p=[0,.15+.55*Math.max(0,Math.sin(TAU*(p+.15))),0];sp.root.q=rx(.07*fl);
    turn('schiena',rx(.1*fl));turn('petto',rx(-.06*fl));turn('collo',rx(.12-.06*fl));turn('testa',rx(-.06+.06*fl));
    turn('coda1',rx(-.25+.1*fl));fire(1.25,2.2,.45);jaw(.12);blink(0);break}
  case 'felice':{// happy: he crouches, hops, lands, then raises his right front paw and waves it, the mouth open, the eyes squinting, the
    // flames flaring up, the tail wagging
    const cr=snap(p,0,.1,.13,.2),hop=p>.16&&p<.4?Math.sin(Math.PI*(p-.16)/.24):0,land=snap(p,.38,.42,.44,.52),w=snap(p,.46,.54,.86,.96),wave=Math.sin(TAU*3*cl((p-.5)/.34,0,1));
    sp.root.p=[0,-.7*cr+2.0*hop-.45*land,.2*hop];turn('schiena',rx(.06*cr-.08*hop));
    for(const s of[1,-1]){const sd=s>0?'S':'D';const tuck=hop;paw('post',sd,lerp3(PAWH(s),add(PAWH(s),[0,1.2,.6]),tuck));
      if(sd==='D'&&w>0)paw('ant',sd,lerp3(PAWF(s),add(PAWF(s),[-.3,2.6+.45*wave,1.5]),w),undefined,rx(-.9*w+.3*wave*w));else paw('ant',sd,lerp3(PAWF(s),add(PAWF(s),[0,1.1,.4]),tuck))}
    turn('bacino',rz(.06*w));turn('petto',rz(-.08*w));headTo(.8,.16*w);turn('testa',rx(-.12*Math.max(hop,w)));jaw(.42*Math.max(snap(p,.14,.22,.9,.98),0));
    blink(.32*w);fire(1+.6*Math.max(hop,w),2,0);sp.emK=1+.7*Math.max(hop,w);turn('coda1',qq(rz(.3*Math.sin(TAU*5*p)*Math.max(w,hop)),rx(-.15*w)));break}
  case 'fiammata':{// the fire breath: he steps back and draws in the air (the chest swells, the head up, the flames grow), then thrusts the
    // head forward with the mouth wide open and breathes fire, a little shaking, then closes the mouth and comes back
    const pr=snap(p,0,.26,.3,.36),th=snap(p,.28,.36,.7,.86),sh=p>.36&&p<.7?Math.sin(TAU*14*p)*.02:0;
    sp.root.p=[0,-.35*pr-.25*th,-.6*pr+.9*th];turn('petto',rx(-.12*pr+.08*th));turn('schiena',rx(.06*pr));
    turn('collo',rx(-.25*pr+.32*th+sh));turn('testa',rx(-.15*pr+.12*th));jaw(.58*th);headTo(.3*(1-th),0);
    stand();for(const s of[1,-1]){const sd=s>0?'S':'D';paw('ant',sd,add(PAWF(s),[0,0,.25*th]))}
    fire(1+.7*pr+.4*th,2.4,.3*th);sp.emK=1+.9*pr+.6*th;blink(.15*th);turn('coda1',rx(-.3*pr+.2*th));break}
  case 'colpito':{// a blow: he flinches back with the eyes shut, the flames blown back, a shake of the head, then he is himself again
    const b=p<.14?sm(p/.14):Math.exp(-(p-.14)*5)*Math.cos((p-.14)*12),bb=cl(b,0,1);
    sp.root.p=[0,-.2*bb,-.7*bb];turn('collo',qq(rx(-.25*b),rz(.12*b)));turn('testa',qq(rx(-.2*b),rz(.18*b)));stand();
    blink(snap(p,0,.06,.4,.55));jaw(.12*bb);fire(1,2,1.2*bb);sp.emK=1-.3*bb;turn('coda1',rx(-.4*bb));break}
  case 'dorme':{// asleep: lying on his belly, the front paws folded under the chin, the head down on them, the tail round the side, the eyes
    // shut, breathing slowly; the flames low and slow
    const b=Math.sin(TAU*2*p),dn=2.0;sp.root.p=[0,-dn+.06*b,0];
    for(const s of[1,-1]){const sd=s>0?'S':'D';paw('ant',sd,[1.35*s,.85,4.3]);paw('post',sd,[2.8*s,.85,-1.4],undefined,ry(-.5*s))}
    turn('petto',rx(-.04*b));turn('collo',rx(.55));turn('testa',qq(rx(.12),rz(.08)));blink(1);jaw(0);
    turn('coda1',qq(ry(.9),rx(.55)));turn('coda2',ry(.4));fire(.45,.7,.35);sp.emK=.7+.1*b;break}
  case 'esausto':{// worn out: he sways, totters, falls on his side with the eyes shut and the flames going small and dim, lies there, then
    // gets up again with a shake
    const sw=p<.24?Math.sin(TAU*2*p/.24)*sm(p/.1):0,fall=snap(p,.22,.42,.74,.92),shake=p>.88?Math.sin(TAU*6*(p-.88)/.12)*(1-sm((p-.94)/.06)):0;
    // he turns round the middle of his body (not round his feet), and goes down until his big head and his side rest on the ground
    const a=.12*sw+1.38*fall,Rq=qq(rz(a),ry(.2*shake)),cen=[0,7,0],rc=qrot(Rq,cen);sp.root.q=Rq;sp.root.p=[cen[0]-rc[0],cen[1]-rc[1]-2.35*sm(fall)+.1*Math.abs(sw),cen[2]-rc[2]];
    for(const s of[1,-1]){const sd=s>0?'S':'D',lim=fall;paw('ant',sd,lerp3(PAWF(s),add(PAWF(s),[.6*s,1.2,.8]),lim),fall>.5?'corpo':undefined);paw('post',sd,lerp3(PAWH(s),add(PAWH(s),[.5*s,1.1,.9]),lim),fall>.5?'corpo':undefined)}
    turn('collo',qq(rx(.2*fall),rz(-.25*fall)));turn('testa',rz(-.2*fall+.15*sw));blink(Math.max(.55*sm(p/.2)*(1-fall),fall));
    fire(.6+.4*(1-fall),1.2,.2+.4*fall);sp.emK=1-.62*fall;turn('coda1',ry(.5*fall));jaw(.1*fall);break}
  default:stand();fire(1,1.4)}
  // the legs with rel 'corpo' are relative to the body: give them the place of the paw in the rest pose plus the move's change, already done
  return sp}
const solve=(M,sp)=>K3D.solve(M.skel,sp),mix=K3D.mix,joints=(M,P,out)=>K3D.joints(M.bind,P,out);
// where the flames are now (their tips, to throw embers) and where the mouth is (for the fire breath), in the space of the model
const tipOf=(P,b,loc)=>add(P.wp[BI[b]],qrot(P.wr[BI[b]],sub(loc,bp(b))));
function fuoco(M,P){const out=[];for(const f of FLAMES)out.push(tipOf(P,f.b,bez(f.P,.8)));out.push(tipOf(P,'coda3',cat(TAIL,.85)));return out}
function bocca(M,P){const p=tipOf(P,'mascella',[0,9.2,7.0]),d=qrot(P.wr[BI.testa],nrm([0,-.15,1]));return{p,d}}
const NF3={build,body,solve,mix,joints,pose,fuoco,bocca,MOSSE,SEQ,BN,BI,bindPose,C,EYE,sm,ez,cl,lerp,TAU};
if(typeof module!=='undefined'&&module.exports)module.exports=NF3;else root.NF3=NF3;
})(typeof window!=='undefined'?window:this);
