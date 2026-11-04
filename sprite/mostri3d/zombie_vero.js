// Mossbound · lo zombie base col corpo vero (Denis, 4 novembre: dal soldato del «Modello di prova» «Corpo più vero» e «Mosse più naturali»,
// «Solo il codice»). È il nostro Zombie della cripta (CR.zombie di sprite/mostri/disegno_mostri.js, che non cambia), con gli stessi pezzi e gli
// stessi colori ma il corpo di una persona vera, magra e marcia: alto sette teste e mezza (circa 42 unità, come prima), clavicole, scapole, la
// spina che sporge, braccia ossute coi tendini, ginocchia nodose, una testa vera con le orbite scavate, il naso marcito, la bocca troppo larga
// coi denti storti, la crepa cucita dietro e la cicatrice; la maglia blu e i pantaloni che seguono il corpo, strappati; le scarpe grosse.
// Il corpo è scolpito nel codice con le distanze (sprite/mostri3d/scultura.js), gli altri attrezzi vengono da kit3d.js, lo disegna mb3.js.
// ZV3.build(), ZV3.solve(M, ZV3.pose(mossa, p, {look})), ZV3.mix, ZV3.joints, ZV3.MOSSE come lo zombie base di prima (ZB3).
(function(root){'use strict';
const K3D=(typeof root.K3D!=='undefined'&&root.K3D)||(typeof require==='function'?require('./kit3d.js'):null);
const SCU=(typeof root.SCU!=='undefined'&&root.SCU)||(typeof require==='function'?require('./scultura.js'):null);
const {TAU,cl,lerp,sm,ez,add,sub,mul,dot,cross,len,nrm,lerp3,hash,mixc,Q0,qmul,qax,qrot,rx,ry,rz,qq,ik,K,frameOf,Mesh,tube,ball}=K3D;
const {ell,cone,Sculpt,nets,normal,onSkin,occl,weights,fbm,noise}=SCU;const sball=SCU.ball;
const Z=K3D.ZC;
// ---------------------------------------------------------------- the body of a real man (units of the 2D drawing: 42 tall)
const ARM={L1:7.1,L2:6.1},LEG={L1:9.75,L2:9.65},ANK=2.0;
const aDir=s=>nrm([.42*s,-1,.06]);// the arms in the rest shape, a little away from the body
const HEAD=[0,39.45,.2];// the middle of the head
const BN=['root','bacino','schiena','petto','collo','testa','mascella','spallaS','braccioS','avambraccioS','manoS','ditaS','punteS',
  'spallaD','braccioD','avambraccioD','manoD','ditaD','punteD','cosciaS','stincoS','piedeS','cosciaD','stincoD','piedeD'];
const BI={};BN.forEach((n,i)=>{BI[n]=i});
const PAR={bacino:'root',schiena:'bacino',petto:'schiena',collo:'petto',testa:'collo',mascella:'testa'};
for(const sd of['S','D']){Object.assign(PAR,{['spalla'+sd]:'petto',['braccio'+sd]:'spalla'+sd,['avambraccio'+sd]:'braccio'+sd,['mano'+sd]:'avambraccio'+sd,['dita'+sd]:'mano'+sd,
  ['punte'+sd]:'dita'+sd,['coscia'+sd]:'bacino',['stinco'+sd]:'coscia'+sd,['piede'+sd]:'stinco'+sd})}
function bindPose(){const P={root:[0,0,0],bacino:[0,22,0],schiena:[0,26.2,-.35],petto:[0,31,-.2],collo:[0,35,-.55],testa:[0,37,-.1],mascella:[0,37.55,.55]};
  for(const s of[1,-1]){const sd=s>0?'S':'D',sh=[4.55*s,34.3,-.1],d=aDir(s);P['spalla'+sd]=[1*s,34.8,.3];P['braccio'+sd]=sh;P['avambraccio'+sd]=add(sh,mul(d,ARM.L1));
    P['mano'+sd]=add(P['avambraccio'+sd],mul(d,ARM.L2));P['dita'+sd]=add(P['mano'+sd],mul(d,2.45));P['punte'+sd]=add(P['dita'+sd],mul(d,1.25));
    const hip=[2.1*s,21.3,.05],an=[2.55*s,ANK,-.35],[kn]=ik(hip,an,LEG.L1,LEG.L2,[0,.15,1]);P['coscia'+sd]=hip;P['stinco'+sd]=kn;P['piede'+sd]=an}
  return BN.map(n=>P[n])}
const B0=bindPose(),bp=n=>B0[BI[n]];
const CHAINS=[];for(const sd of['S','D']){const s=sd==='S'?1:-1;
  CHAINS.push({a:'braccio'+sd,b:'avambraccio'+sd,c:'mano'+sd,g:'arm',s:sd,L1:ARM.L1,L2:ARM.L2,pole:[.5*s,-.6,-1],y0:nrm([.5*s,-.1,-1]),
    target:(ch,wp,rootP,rootQ)=>ch.rel!=='mondo'?add(wp[BI.petto],qrot(rootQ,ch.t)):ch.t,end:(ch,w1)=>qmul(w1,ch.wrist||Q0())});
  CHAINS.push({a:'coscia'+sd,b:'stinco'+sd,c:'piede'+sd,g:'leg',s:sd,L1:LEG.L1,L2:LEG.L2,pole:[0,.1,1],y0:[0,.1,1],
    target:(ch,wp,rootP,rootQ,sp)=>ch.rel==='corpo'?add(rootP,qrot(rootQ,ch.t)):add([rootP[0],0,rootP[2]],qrot(sp.root&&sp.root.yawQ||Q0(),ch.t)),end:(ch,w1,rootQ)=>qmul(rootQ,ch.foot||Q0())})}
// the frame of a limb: Y along it, X to its outside, Z in front
const limbAx=(d,s)=>{const X=nrm(cross(d,[0,0,1*s])),Zf=nrm(cross(X,d));return[X,d,Zf]};
// ---------------------------------------------------------------- the sculpture of the body (in the rest shape)
// forCloth: the shape the clothes lie on (no hollows and no little bumps: cloth hangs over them, it does not sink into them)
function body(forCloth){const S=Sculpt(),dig=(s,k)=>{if(!forCloth)S.dig(s,k);return S},det=(s,k)=>S.add(s,forCloth?k*2.2+.3:k);// for the cloth the little bumps welded much
  // more softly: a bigger, smoother shape, so the cloth never lets them through (the spine shows under the shirt as a soft ridge)
  // · trunk: the ribcage, the flat chest, the shoulder girdle, the shoulder blades, the sunken belly, the pelvis, the buttocks
  S.add(ell([0,30.6,0],[3.9,4.7,2.75])).add(ell([0,32.4,.9],[3.7,1.9,1.6]),.9).add(cone([-3.6,34.3,-.7],[3.6,34.3,-.7],1.35,1.35),1)
   .add(cone([-3.4,34.6,-.8],[-.9,36,-.9],1,.8),.9).add(cone([3.4,34.6,-.8],[.9,36,-.9],1,.8),.9)
   .add(ell([0,26,.1],[3.05,3.4,2.05]),1.2).add(ell([0,23.9,-.05],[3.25,1.9,2.25]),1).add(ell([0,22.1,-.1],[3.75,2.3,2.45]),1)
   .add(ell([1.55,21.1,-1.45],[1.75,2,1.55]),.9).add(ell([-1.55,21.1,-1.45],[1.75,2,1.55]),.9)
   .add(ell([2.2,32.4,-2.35],[1.4,1.8,.5]),.6).add(ell([-2.2,32.4,-2.35],[1.4,1.8,.5]),.6);
  for(const s of[1,-1])det(cone([.45*s,34.75,1.25],[4.1*s,34.95,.5],.33,.3),.35);// the collarbones
  for(let y=24.2;y<34.5;y+=1.35)det(sball([0,y,-2.55-.25*Math.sin((y-24)/10*Math.PI)],.42),.3);// the spine sticking out of the back
  dig(ell([0,26.4,3.75],[2.5,2.3,1.75]),.9);// the belly sunken in under the ribs (the hollow reaches far out in front, so the skin round it stays smooth)
  // · neck: thin, the cords of the neck, the Adam's apple
  S.add(cone([0,34.6,-.45],[0,37.5,.05],1.3,1.12),.7);for(const s of[1,-1])det(cone([1.25*s,38,-.25],[.38*s,35,1.15],.38,.32),.4);det(sball([0,36.1,1.05],.32),.25);
  // · head: the skull, the face, the brow, the cheekbones, the jaw and the chin, the ears
  S.add(ell([0,39.75,-.15],[1.86,2.2,2.42]),.3).add(ell([0,38.8,1.05],[1.6,1.85,1.35]),.7).add(cone([-1.3,39.55,1.75],[1.3,39.55,1.75],.38,.38),.45);
  for(const s of[1,-1])S.add(sball([1.35*s,38.75,1.3],.52),.45).add(cone([1.55*s,38,.25],[.55*s,36.55,1.6],.58,.5),.5);
  S.add(sball([0,36.45,1.75],.62),.45).add(ell([0,37.85,1.6],[1.15,.55,.7]),.5).add(cone([0,39.25,2.05],[0,38.55,2.4],.3,.32),.3);
  S.add(ell([1.95,38.95,-.15],[.22,.6,.4]),.12).add(ell([-1.95,38.95,-.15],[.22,.6,.4]),.12);
  // dug: the nose rotted away, the sockets deep, the cheeks and the temples hollow, the mouth too wide, a bite out of his right ear
  dig(ell([0,38.5,2.45],[.36,.42,.4]),.15);for(const s of[1,-1])dig(ell([.72*s,39.15,1.95],[.6*(s<0?1.12:1),.48*(s<0?1.12:1),.55]),.22).dig(ell([1.25*s,37.95,1.55],[.48,.55,.32]),.5).dig(ell([1.82*s,39.5,.95],[.3,.55,.55]),.45);
  dig(ell([0,37.45,2.05],[1.15,.24,.45]),.12);dig(sball([-2.12,39.45,-.1],.26),.05);
  // · arms: thin, the biceps and the triceps, the bony elbow, the forearm with its cords, the wrist
  for(const s of[1,-1]){const sd=s>0?'S':'D',sh=bp('braccio'+sd),el=bp('avambraccio'+sd),wr=bp('mano'+sd),d=aDir(s),[X,Y,Zf]=limbAx(d,s);
    S.add(cone(sh,el,.95,.66),.6).add(ell(add(lerp3(sh,el,.45),mul(Zf,.35)),[.55,1.9,.6],[X,Y,Zf]),.5).add(ell(add(lerp3(sh,el,.4),mul(Zf,-.4)),[.6,2,.55],[X,Y,Zf]),.5)
     .add(ell([4.75*s,33.85,-.05],[1.3,1.65,1.4],[X,Y,Zf]),.8)
     .add(sball(el,.62),.4).add(sball(add(el,mul(Zf,-.45)),.42),.3).add(cone(el,wr,.7,.42),.5).add(ell(add(lerp3(el,wr,.28),mul(X,.22)),[.55,1.6,.5],[X,Y,Zf]),.45).add(sball(wr,.42),.3)}
  // · legs: the thighs, the knees with the kneecap, the thin shins and calves, the bony ankles
  for(const s of[1,-1]){const sd=s>0?'S':'D',hp=bp('coscia'+sd),kn=bp('stinco'+sd),an=bp('piede'+sd),d=nrm(sub(kn,hp)),d2=nrm(sub(an,kn)),Zf=[0,0,1];
    S.add(cone(hp,kn,1.65,1.05),.9).add(ell(add(lerp3(hp,kn,.4),mul(Zf,.5)),[1.1,3.2,.9]),.7).add(sball(kn,1),.5).add(sball(add(kn,[0,.1,.75]),.5),.3)
     .add(cone(kn,an,1,.52),.6).add(ell(add(lerp3(kn,an,.28),[0,0,-.55]),[.85,2.4,.8]),.6).add(sball(an,.58),.3).add(sball(add(an,[.45,0,0]),.3),.2).add(sball(add(an,[-.45,0,0]),.3),.2)}
  return S}
// the shoes: old leather shoes, flat and long: a thick sole, the round toe, the instep, the heel, the collar round the ankle with its opening
function shoes(){const S=Sculpt();for(const s of[1,-1]){const an=bp('piede'+(s>0?'S':'D')),x=an[0];
    S.add(ell([x+.05*s,.34,1.25],[1.18,.34,3.05]),0).add(ell([x+.1*s,.88,3.05],[1.06,.7,1.3]),.45).add(ell([x+.04*s,1.32,1.25],[1,.95,1.75]),.5)
     .add(ell([x,1.28,-.78],[.94,1.08,1.02]),.45).add(cone([x,1.75,-.62],[x,2.62,-.42],.98,.9),.4).dig(sball([x,2.95,-.38],.72),.25)}
  return S}
// ---------------------------------------------------------------- the zombie
function build(o){o=o||{};const HQ=o.h||.3,B=B0,m=Mesh(),cloth=Mesh(),bi=n=>BI[n],BODY=body(),D=(x,y,z)=>BODY.d(x,y,z),CLB=body(true),DC=(x,y,z)=>CLB.d(x,y,z);
  // the bones as segments, measured in their thickness, for the weights of the skin
  const seg=(n,b,s)=>({i:bi(n),a:bp(n),b,s});
  const BONES=[seg('bacino',bp('schiena'),3.3),seg('schiena',bp('petto'),3.3),seg('petto',bp('collo'),3.5),seg('collo',bp('testa'),1.15),seg('testa',add(bp('testa'),[0,4.6,.3]),2)];
  for(const sd of['S','D'])BONES.push(seg('spalla'+sd,bp('braccio'+sd),1.3),seg('braccio'+sd,bp('avambraccio'+sd),.85),seg('avambraccio'+sd,bp('mano'+sd),.6),
    seg('coscia'+sd,bp('stinco'+sd),1.4),seg('stinco'+sd,bp('piede'+sd),.9),seg('piede'+sd,add(bp('piede'+sd),[0,-.8,4]),.8));
  // which bones a point may follow: the part of the body it is in, and the parts next to it
  const PART={bacino:['bacino','schiena','cosciaS','cosciaD'],schiena:['bacino','schiena','petto'],petto:['schiena','petto','collo','spallaS','spallaD'],collo:['petto','collo','testa'],
    testa:['collo','testa'],spallaS:['petto','spallaS','braccioS'],spallaD:['petto','spallaD','braccioD'],braccioS:['spallaS','braccioS','avambraccioS'],braccioD:['spallaD','braccioD','avambraccioD'],
    avambraccioS:['braccioS','avambraccioS','manoS'],avambraccioD:['braccioD','avambraccioD','manoD'],cosciaS:['bacino','cosciaS','stincoS'],cosciaD:['bacino','cosciaD','stincoD'],
    stincoS:['cosciaS','stincoS','piedeS'],stincoD:['cosciaD','stincoD','piedeD'],piedeS:['stincoS','piedeS'],piedeD:['stincoD','piedeD']};
  const jawW=p=>{if(p[1]>37.65||p[2]<.35)return 0;return sm((37.5-p[1])/.35)*sm((p[2]-.45)/.6)};
  const skinW=p=>{const w0=weights(p,BONES,null,.01),near=BN[w0[0][0]],only=PART[near].map(bi),w=weights(p,BONES,only,.5);
    if(near==='testa'||near==='collo'&&p[1]>36.6){const j=jawW(p);if(j>0){const t=w.find(x=>x[0]===bi('testa'));if(t){t[1]*=1-j}w.push([bi('mascella'),j])}}return w};
  const rel=p=>sub(p,HEAD);
  // · the skin, its colours: green, darker blotches (the ones of the drawing on the head), the rotten patch, dark round the sockets and the
  // mouth, dark inside the holes; the chest under the hole of the shirt rotten, with blood
  const SPOTS=[[[.6,.62,-.45],.22],[[-.35,.38,-.85],.2],[[-.8,.55,.15],.16],[[-.15,.95,-.3],.15],[[.85,-.15,.45],.17],[[.25,-.75,-.6],.2]].map(([d,s])=>[nrm(d),s]),ROT=nrm([.5,.85,-.15]);
  const HOLE=nrm([.55,-.1,.82]),CH0=[0,31,0],inHole=(p,mg)=>{const d=nrm(sub(p,CH0)),f=frameOf(HOLE),q=sub(d,mul(HOLE,dot(d,HOLE))),x=dot(q,f.ex),y=dot(q,f.ey),an=Math.atan2(y,x),
      jag=1+.22*Math.sin(an*7+1.3)+.12*Math.sin(an*13+.4)+(mg||0);return dot(d,HOLE)>0&&p[1]>27&&p[1]<34&&(x*x/(.36*.36)+y*y/(.3*.3))<jag*jag};
  const dug=(p,sh,mg)=>sh.f(p[0],p[1],p[2])<(mg||0);
  const SOCK=[1,-1].map(s=>ell([.72*s,39.15,1.95],[.6*(s<0?1.12:1),.48*(s<0?1.12:1),.55])),NOSE=ell([0,38.5,2.45],[.36,.42,.4]),MOUTH=ell([0,37.45,2.05],[1.15,.24,.45]);
  const skinPaint=p=>{let c=Z.skin.slice(),kind=1,blood=0;const n=fbm(p[0]*.55,p[1]*.55,p[2]*.55);
    c=mixc(c,Z.skinD,sm((n-.5)/.16)*.75);c=mixc(c,mixc(Z.skinD,Z.rot,.5),sm((fbm(p[0]*.3+5,p[1]*.3,p[2]*.3)-.62)/.1)*.7);
    const r=rel(p),lh=len(r);if(lh<3.2&&p[1]>36.4){const d=nrm(r);for(const[s,sz] of SPOTS){const a=dot(d,s);c=mixc(c,Z.skinD,sm((a-Math.cos(sz*1.25))/(Math.cos(sz*.8)-Math.cos(sz*1.25)))*.85)}
      c=mixc(c,Z.rot,sm((dot(d,ROT)-Math.cos(.4))/(Math.cos(.24)-Math.cos(.4)))*.95);
      for(const sk of SOCK){if(dug(p,sk,.35)){c=mixc(c,mixc(Z.skinD,Z.rot,.5),.6)}if(dug(p,sk,.06)){c=mixc(c,Z.socket,.85);kind=6}}
      if(dug(p,NOSE,.08)){c=mixc(Z.socket,Z.mouth,.4);kind=6}if(dug(p,MOUTH,.22)){c=mixc(Z.gum,Z.mouth,.4);blood=.4}if(dug(p,MOUTH,.04)){c=Z.mouth;kind=6}
      if(p[1]<37.4&&p[2]>1.4&&Math.abs(p[0])<1)blood=Math.max(blood,.45*sm((37.4-p[1])/.5))}
    if(inHole(p,.25)){c=mixc(mixc(Z.rot,Z.socket,.45),Z.skinD,.15+.2*noise(p[0]*3,p[1]*3,p[2]*3));blood=.5}
    return{c,kind,blood}};
  // · the ribs under the hole of the shirt: three bones arching across it
  {const f=frameOf(HOLE);for(let i=0;i<3;i++){const P=[];for(let k=-4;k<=4;k++){const dd=nrm(add(add(HOLE,mul(f.ex,k*.085)),mul(f.ey,-.17+i*.15+.012*(16-k*k)*.4)));P.push(add(onSkin(D,add(CH0,mul(dd,6))),mul(dd,.12)))}
    tube(m,P,P.map((_,k)=>.2-Math.abs(k-4)*.015),6,()=>({c:mixc(Z.bone,[.75,.68,.5],.25),k:K(5,.3,.45),w:[[bi('petto'),1]]}),{cap0:'ball',cap1:'ball'})}}
  // · the eyes, deep in the sockets: little lights with a white spark (his right one bigger, like the drawing)
  for(const s of[1,-1]){const big=s<0?1.12:1,c=[.72*s,39.12,1.62],er=.23*big,d=nrm([.3*s,.05,1]),f=frameOf(d);
    ball(m,c,[er,er,er*.8],12,8,()=>({c:Z.eye,k:K(9,0,0),w:[[bi('testa'),1]]}),{ax:[f.ex,f.ey,d]});
    ball(m,add(add(c,mul(d,er*.7)),add(mul(f.ex,-er*.4),mul(f.ey,er*.4))),[er*.3,er*.3,er*.2],8,6,()=>({c:[1,1,1],k:K(9,0,0),w:[[bi('testa'),1]]}))}
  // · the back of the mouth (dark, never a hole), the crooked teeth: eight above with two missing, seven below on the jaw
  ball(m,[0,37.45,1.45],[.95,.32,.5],12,8,()=>({c:Z.mouth,k:K(6,0,0),w:[[bi('testa'),.55],[bi('mascella'),.45]]}));
  {const arch=(x,y)=>[x,y,2.12-x*x*.42];
    for(let i=0;i<8;i++){if(i===2||i===6)continue;const x=-.86+i*.245,b=arch(x,37.62),l=.3+.14*hash(i+3)+(i===4?.12:0),tw=(hash(i*7)-.5)*.35,d=nrm([tw,-1,.12+tw*.4]);
      tube(m,[b,add(b,mul(d,l*.6)),add(b,mul(d,l))],[.11,.09,.035],6,(p,t)=>({c:mixc(mixc(Z.bone,[.62,.55,.38],.4*(1-t)),Z.bone,t*.5),k:K(5,0,.3),w:[[bi('testa'),1]]}),{cap0:'open',cap1:'point',tip:.5})}
    for(let i=0;i<7;i++){const x=-.74+i*.247,b=arch(x,37.27),l=.26+.12*hash(i+11),tw=(hash(i*5+2)-.5)*.35,d=nrm([tw,1,.1]);
      tube(m,[b,add(b,mul(d,l*.6)),add(b,mul(d,l))],[.1,.085,.03],6,(p,t)=>({c:mixc(mixc(Z.bone,[.62,.55,.38],.4*(1-t)),Z.bone,t*.5),k:K(5,0,.3),w:[[bi('mascella'),1]]}),{cap0:'open',cap1:'point',tip:.5})}}
  // · a few long hairs on the scalp, the stitched crack on the back of the head and the stitched scar on his right
  for(let i=0;i<7;i++){const a=-1.2+i*.4,d=nrm([Math.sin(a)*.7,.75,-.35+.25*Math.cos(a*1.7)]),r0=onSkin(D,add(HEAD,mul(d,3))),out=normal(D,r0),l=1.2+.9*hash(i+40);
    const P=[r0,add(r0,add(mul(out,.35*l),[0,.2*l,0])),add(r0,add(mul(out,.5*l),[(hash(i)-.5)*.6,-.15*l,-.25*l]))];tube(m,P,[.07,.055,.02],5,()=>({c:Z.hair,k:K(0,0,.45),w:[[bi('testa'),1]]}),{cap0:'open',cap1:'point',tip:.6})}
  const stitch=(pts,r)=>{const P=pts.map(q=>{const sk=onSkin(D,q);return add(sk,mul(normal(D,sk),r*.35))});tube(m,P,P.map(()=>r),5,()=>({c:Z.ink,k:K(0,0,0),w:[[bi('testa'),1]]}),{cap0:'ball',cap1:'ball'})};
  {const C=add(HEAD,[0,.9,-2.6]);stitch([[-.9,-.5],[-.45,-.2],[0,0],[.4,-.3],[.8,-.6]].map(([x,y])=>add(C,[x,y,0])),.08);
    for(let i=0;i<3;i++){const x=-.65+i*.62;stitch([add(C,[x-.22,-.25+i*.05,.2]),add(C,[x+.22,.25+i*.05,.2])],.065)}
    const C2=add(HEAD,[-2,.1,.4]);stitch([add(C2,[0,-.6,-.6]),add(C2,[0,0,0]),add(C2,[0,.6,.6])],.075);stitch([add(C2,[.1,.1,-.6]),add(C2,[.1,-.35,-.2])],.06);stitch([add(C2,[.1,.5,.25]),add(C2,[.1,.05,.6])],.06)}
  // · the hands: a small bony palm, four long fingers and the thumb, bent like hooks, with black claws
  for(const s of[1,-1]){const sd=s>0?'S':'D',wr=bp('mano'+sd),d=aDir(s),fw=nrm(cross(d,[0,0,1])),pd=nrm(cross(fw,d)),ih=bi('mano'+sd),ifn=bi('dita'+sd),ipt=bi('punte'+sd),palm=add(wr,mul(d,1.15));
    m.group(12+(s>0?0:1));
    ball(m,palm,[.95,1.25,.36],14,10,()=>({c:mixc(Z.skin,Z.skinD,.15),k:K(1),w:[[ih,1]]}),{ax:[fw,d,pd]});
    for(let k=0;k<4;k++){const o=(k-1.5)*.46,dir=nrm(add(d,mul(fw,o*.18))),b0=add(add(palm,mul(dir,1.15)),mul(fw,o)),L=[1.85,2.1,2,1.6][k],
        kn=add(b0,mul(dir,L*.45)),tp=add(add(kn,mul(dir,L*.38)),mul(pd,-.32)),cw=add(add(tp,mul(dir,L*.2)),mul(pd,-.42));
      tube(m,[b0,lerp3(b0,kn,.5),kn,lerp3(kn,tp,.5),tp,cw],[.22,.2,.2,.17,.15,.03],7,(p,t,an,i)=>({c:i>=4?Z.nail:mixc(Z.skin,Z.skinD,.25+t*.3),k:i>=4?K(4,.5,.55):K(1,0,.7),
        w:i<=1?[[ih,1-i*.3],[ifn,i*.3]]:i===2?[[ifn,.6],[ipt,.4]]:[[ipt,1]]}),{cap0:'ball',cap1:'point',tip:.3})}
    {const b0=add(add(palm,mul(fw,-.85)),mul(d,-.2)),dir=nrm(add(mul(d,.7),add(mul(fw,-.55),mul(pd,.25)))),tp=add(b0,mul(dir,1.5)),cw=add(add(tp,mul(dir,.45)),mul(pd,-.3));
      tube(m,[b0,lerp3(b0,tp,.5),tp,cw],[.25,.21,.17,.03],7,(p,t,an,i)=>({c:i>=3?Z.nail:mixc(Z.skin,Z.skinD,.25),k:i>=3?K(4,.5,.55):K(1,0,.7),w:i<=1?[[ih,1]]:[[ih,.4],[ifn,.6]]}),{cap0:'ball',cap1:'point',tip:.3})}}
  // · the shirt: the body swollen a little, with folds, from the torn hem below the waist to the collar and down the arms to the torn ends of
  // the sleeves; the hole on the front over the ribs; the tear across the lower back; blood near the hole and the collar
  const armT=(p,s)=>{const sh=bp('braccio'+(s>0?'S':'D')),d=aDir(s);return dot(sub(p,sh),d)};
  const fold=p=>Math.sin(Math.atan2(p[0],p[2])*7+fbm(p[0]*.4,p[1]*.25,p[2]*.4)*4)*.5+.5;
  const SHIRT=(x,y,z)=>DC(x,y,z)-(.3+.16*fold([x,y,z])*(y<33?1:.4));
  const keepShirt=p=>{const ang=Math.atan2(p[0],p[2]),hem=22.6-Math.max(0,Math.sin(ang*4.5+.6))*(.8+.7*noise(ang*3,1,0))-(Math.abs(p[0])>4.4?9:0);
    if(p[1]<hem)return false;if(Math.hypot(p[0],p[2]+.45)<1.75&&p[1]>34.5)return false;if(p[1]>36.2)return false;
    for(const s of[1,-1]){if(p[0]*s>3.9){const t=armT(p,s),an=Math.atan2(p[2],p[1]),end=3.3+Math.max(0,Math.sin(an*1.5+(s>0?.4:2.2)))*1.4*(1+.4*noise(an*3,s,2));if(t>end)return false}}
    if(inHole(p))return false;
    {const q=sub(p,[-1.6,24.6,-2.3]);if(Math.abs(q[1]+q[0]*.35)<.09+.05*noise(p[0]*4,p[1]*4,0)&&Math.abs(q[0])<1.7&&p[2]<-1)return false}
    return true};
  cloth.group(3);
  {const r=nets(SHIRT,[-9.2,19.6,-4.6,9.2,37.2,4.4],HQ,{keep:keepShirt});
    for(let i=0;i<r.P.length/3;i++){const p=[r.P[i*3],r.P[i*3+1],r.P[i*3+2]],n=normal(SHIRT,p),ang=Math.atan2(p[0],p[2]),nearHole=inHole(p,.45)?1:0,collar=sm((p[1]-33.8)/1.2)*sm(p[2]/2+.5);
      const edge=sm((23.6-p[1])/1)+(nearHole?.5:0),c=mixc(mixc(Z.cloth,Z.clothD,.12+.35*edge+.2*(1-fold(p))),[.12,.11,.12],.15*noise(p[0]*.7,p[1]*.7,p[2]*.7));
      const v=cloth.v(p,n,c,K(2.2,Math.max(nearHole*.8,collar*.5,edge*.25)),skinW(p));cloth.K[v*4+2]=occl(D,p,n)*.75}
    for(let t=0;t<r.I.length;t+=3)cloth.t(r.I[t],r.I[t+1],r.I[t+2])}
  // · the trousers: from the waist down the legs to the torn hems over the shoes; dirty at the bottom, blood on his right knee
  const TROU=(x,y,z)=>DC(x,y,z)-(.34+.18*(Math.sin(y*1.9+fbm(x*.5,y*.3,z*.5)*5)*.5+.5));
  const keepTrou=p=>{if(p[1]>24.4)return false;const s=p[0]>0?1:-1,an=Math.atan2(p[2],p[0]-2.3*s),hem=4.6+Math.max(0,Math.sin(an*2.5+s))*1.2*(1+.5*noise(an*3,s*3,4));
    if(p[1]<hem)return false;if(Math.abs(p[0])>5.6)return false;
    {const kn=bp('stincoD'),q=sub(p,add(kn,[0,.2,.9]));if(q[2]>-.4&&Math.hypot(q[0]*1.1,q[1])<.7+.25*noise(p[0]*3,p[1]*3,0))return false}return true};
  cloth.group(20);
  {const r=nets(TROU,[-6,3.2,-4.6,6,25.2,4.2],HQ,{keep:keepTrou}),o=cloth.P.length/3;
    for(let i=0;i<r.P.length/3;i++){const p=[r.P[i*3],r.P[i*3+1],r.P[i*3+2]],n=normal(TROU,p),kn=bp('stincoD'),bk=len(sub(p,add(kn,[0,.2,.9])));
      const c=mixc(mixc(Z.pants,[.12,.1,.085],sm((9-p[1])/5)*.45),[.08,.07,.06],.25*noise(p[0]*.8,p[1]*.8,p[2]*.8));
      const v=cloth.v(p,n,c,K(3.2,p[0]<0&&bk<1.6?.75*sm((1.6-bk)/.6):0),skinW(p));cloth.K[v*4+2]=occl(D,p,n)*.8}
    for(let t=0;t<r.I.length;t+=3)cloth.t(o+r.I[t],o+r.I[t+1],o+r.I[t+2])}
  // · the skin of the body: surface nets of the sculpture, the normals and the soft shadow from it, the weights. The skin the clothes always
  // cover (well inside the shirt and the trousers, never near a hem, a tear or the hole) is left out: it is never seen, and the model weighs
  // half as much
  {const r=nets(D,[-11,1.3,-4.4,11,42.6,4.2],HQ),P=r.P,I=r.I,MG=.45,cov=q=>keepShirt(q)||keepTrou(q),
      hid=c=>{if(!cov(c))return false;for(let a=0;a<3;a++)for(const e of[-MG,MG]){const q=c.slice();q[a]+=e;if(!cov(q))return false}return true};
    const map=new Int32Array(P.length/3).fill(-1),T=[];
    for(let t=0;t<I.length;t+=3){const a=I[t],b=I[t+1],c=I[t+2],ce=[(P[a*3]+P[b*3]+P[c*3])/3,(P[a*3+1]+P[b*3+1]+P[c*3+1])/3,(P[a*3+2]+P[b*3+2]+P[c*3+2])/3];if(!hid(ce))T.push(a,b,c)}
    m.group(1);for(const i of T){if(map[i]>=0)continue;const p=[P[i*3],P[i*3+1],P[i*3+2]],n=normal(D,p),pa=skinPaint(p),k=K(pa.kind,pa.blood,pa.kind===6?.3:1);
      map[i]=m.v(p,n,pa.c,k,skinW(p));m.K[map[i]*4+2]=occl(D,p,n)*.9}
    for(let t=0;t<T.length;t+=3)m.t(map[T[t]],map[T[t+1]],map[T[t+2]])}
  // · the shoes, flat on the ground
  m.group(21);
  {const SH=shoes(),DS=(x,y,z)=>SH.d(x,y,z),r=nets(DS,[-5,-.3,-3,5,3.4,5.6],HQ*.8),o=m.P.length/3;
    for(let i=0;i<r.P.length/3;i++){const p=[r.P[i*3],r.P[i*3+1],r.P[i*3+2]],n=normal(DS,p),s=p[0]>0?1:-1,sd=s>0?'S':'D';if(p[1]<.08)p[1]=.08;
      // the sole (with a darker seam over it), the leather scuffed paler on the toe and the heel, worn dark at the creases
      const seam=sm((p[1]-.62)/.06)*(1-sm((p[1]-.8)/.06)),scuff=sm((p[2]-2.5)/.9)+sm((-.9-p[2])/.7)*.7;
      let c=p[1]<.66?mixc(Z.sole,[.2,.17,.14],.25*noise(p[0]*3,p[1]*3,p[2]*3)):mixc(mixc(Z.shoe,[.36,.29,.22],cl(scuff,0,1)*.45*noise(p[0]*1.5+4,p[1]*1.5,p[2]*1.5)+.08),[.11,.09,.08],.25*noise(p[0]*2,p[1]*2,p[2]*2));
      c=mixc(c,[.08,.065,.055],seam*.7);const v=m.v(p,n,c,K(4,0,1),p[1]>2.4?[[bi('piede'+sd),.6],[bi('stinco'+sd),.4]]:[[bi('piede'+sd),1]]);m.K[v*4+2]=cl((.7-p[1])/.7,0,1)*.35}
    for(let t=0;t<r.I.length;t+=3)m.t(o+r.I[t],o+r.I[t+1],o+r.I[t+2]);
    // the laces: three crossings over the instep, one end hanging loose
    for(const s of[1,-1]){const sd=s>0?'S':'D',x=bp('piede'+sd)[0],ib=bi('piede'+sd),on=(z,dx)=>{const q=onSkin(DS,[x+dx,3,z]);return add(q,mul(normal(DS,q),.05))};
      for(let k=0;k<3;k++){const z=.55+k*.62;tube(m,[on(z-.22,-.42),on(z,0),on(z+.22,.42)],[.07,.075,.07],5,()=>({c:[.16,.13,.1],k:K(4,0,.6),w:[[ib,1]]}),{cap0:'ball',cap1:'ball'});
        tube(m,[on(z-.22,.42),on(z,0),on(z+.22,-.42)],[.07,.075,.07],5,()=>({c:[.16,.13,.1],k:K(4,0,.6),w:[[ib,1]]}),{cap0:'ball',cap1:'ball'})}
      const a=on(2.05,.1*s);tube(m,[a,add(a,[.35*s,.15,.3]),add(a,[.75*s,-.45,.45]),add(a,[.85*s,-.95,.4])],[.07,.065,.06,.05],5,()=>({c:[.16,.13,.1],k:K(4,0,.6),w:[[ib,1]]}),{cap0:'ball',cap1:'ball'})}}
  return K3D.pack(K3D.skel(BN,PAR,B,CHAINS),[[m,0],[cloth,1]])}
// ---------------------------------------------------------------- the moves: natural, with weight (each depends only on p, 0..1)
// o.look: where you are, seen from him (radians round the up axis, 0 = in front): the head snaps that way
const MOSSE={fermo:{n:'Fermo',dur:6,loop:1},cammina:{n:'Cammina',dur:1.7,loop:1},corre:{n:'Corre',dur:.78,loop:1},sbuca:{n:'Sbuca da terra',dur:3.6},
  urla:{n:'Urla',dur:2.4},colpo:{n:'Colpo',dur:1.5},morso:{n:'Morso',dur:1.6},colpito:{n:'Colpito',dur:.8},muore:{n:'Muore',dur:3,hold:1}};
const snap=(p,k0,k1,k2,k3)=>p<k0?0:p<k1?sm((p-k0)/(k1-k0)):p<k2?1:1-sm((p-k2)/(k3-k2));
const wrap=x=>((x%1)+1)%1;
// a step of a foot, with the roll of a real foot: planted for `st` of the cycle (sliding back as the body goes on), the heel down first and
// the toes last; then lifted (knee up), swung forward and put down. → {z (forward), y (up), roll (the turn of the foot: + toes down)}
function step(q,st,S,H,drag){q=wrap(q);if(q<st){const u=q/st;return{z:S-u*2*S,y:0,roll:-.32*(1-sm(u/.18))+.42*sm((u-.72)/.28)}}
  const u=(q-st)/(1-st),e=ez(u);return{z:-S+e*2*S,y:Math.sin(u*Math.PI)*H*(drag?.35:1)+(drag?0:Math.max(0,Math.sin(u*Math.PI*1.4))*H*.25),roll:drag?.45*(1-u)+.15:.42*(1-sm(u/.4))-.32*sm((u-.6)/.4)}}
function pose(id,p,o){o=o||{};p=cl(p,0,1);const ph=p*TAU,sp={root:{p:[0,0,0],q:Q0()},r:{},arm:{},leg:{},emK:1};const R=sp.r,look=cl(o.look||0,-1.2,1.2);
  const turn=(b,q)=>{R[b]=R[b]?qmul(R[b],q):q};
  const curl=(sd,k)=>{const s=sd==='S'?1:-1,d=aDir(s),ax=mul(nrm(cross(d,[0,0,1])),-1);turn('dita'+sd,qax(ax,k*.85));turn('punte'+sd,qax(ax,k*1.1))};
  const jaw=a=>turn('mascella',rx(-a*.5));
  const arm=(sd,t,pole,wrist,rel)=>{const s=sd==='S'?1:-1;sp.arm[sd]={t,rel:rel||'petto',pole:pole||[.5*s,-.6,-1],wrist:wrist||Q0()}};
  const foot=(sd,z,y,roll,x,yaw)=>{const s=sd==='S'?1:-1;sp.leg[sd]={t:[(x===undefined?2.55:x)*s,ANK+y+Math.max(0,roll)*.55,-.35+z],foot:qq(ry((yaw||0)*s),rx(roll))}};
  // the hunch of the zombie: the back bent, the shoulders forward, the head pushed out
  const hunch=(k,hd)=>{turn('schiena',rx(.2*k));turn('petto',rx(.16*k));turn('collo',rx(.12*k));turn('testa',rx(-(hd===undefined?.2:hd)*k))};
  switch(id){
  case 'fermo':{// standing on his right leg, the left knee bent, breathing slowly; the head hangs to one side… then snaps round towards you,
    // stays, and slowly comes back; now and then the fingers of his right hand twitch
    const br=Math.sin(ph),sw=Math.sin(ph+.6);sp.root.p=[-.45+sw*.08,-.06+br*.05,0];turn('bacino',qq(rz(-.06),ry(.04*sw)));hunch(1);turn('petto',rx(-.025*br));
    const g=snap(p,.55,.572,.8,.97),tr=p>.22&&p<.31?Math.sin(p*TAU*48)*Math.sin((p-.22)/.09*Math.PI):0;
    turn('collo',qq(ry(look*.38*g),rz(.12*(1-g))));turn('testa',qq(ry(look*.62*g),rz(.3*(1-g)-.04*g),rx(.08-.14*g)));
    for(const sd of['S','D']){const s=sd==='S'?1:-1;arm(sd,[(5.2+.2*br)*s,-6.8+.25*br,3.6],[.5*s,-.6,-1],rx(.5));curl(sd,.45+.05*Math.sin(ph*3+s)+(sd==='D'?tr*.35:0))}
    foot('S',.4,0,.12,2.4,.25);foot('D',-.1,0,0,2.6,.08);jaw(.22+.06*Math.sin(ph*2));break}
  case 'cammina':{// the shamble of the drawing, with weight: his right leg does the work (heel, sole, toes), the left one drags, its toes on the
    // ground; the hips drop on the weak side and sway over the foot that holds him, the shoulders turn against the hips, the arms reach out
    // and swing behind the body, the head hangs to one side with a jerk now and then
    // the two feet go back at the same speed while they are on the ground (the speed of the walk: 2·2.7/(.56·1.7) = 5.7 a second), so they
    // never slide: the short dragging step stays on the ground less and drags forward longer
    const R0=step(p,.56,2.7,1.5),L0=step(p+.5,.56*1.6/2.7,1.6,1,1),hold=Math.sin(ph);// hold > 0: on his right foot
    const bob=.02-.2*Math.cos(ph*2)-.3*Math.max(0,-Math.sin(ph+.3));sp.root.p=[-.55*hold,bob,0];
    turn('bacino',qq(ry(.1*Math.cos(ph)),rz(-.07*Math.sin(ph+.4)),rx(.05)));hunch(1.1);turn('petto',qq(ry(-.13*Math.cos(ph-.25)),rz(.04*Math.sin(ph))));
    const j=snap(p,.6,.62,.64,.72);turn('collo',rz(.12+j*.12));turn('testa',qq(rz(.3+j*.3),rx(.04*Math.sin(ph*2-.8)),ry(j*.3)));
    foot('D',R0.z,R0.y,R0.roll,2.55,.05);foot('S',L0.z,L0.y,L0.roll,2.7,.32);
    for(const sd of['S','D']){const s=sd==='S'?1:-1,sw=Math.sin(ph-.5+(s>0?0:Math.PI)),lag=Math.sin(ph*2-1.1);arm(sd,[(3.4+.3*sw)*s,-1.2+.5*lag+.25*sw,8.4+sw*.9],[.5*s,-.6,-1],rx(.55+.12*lag));curl(sd,.35+.1*Math.sin(ph+s))}
    jaw(.3+.1*Math.sin(ph*2));break}
  case 'corre':{// a mad run, bent over: long strides with a flight, the arms grabbing the air forward and back, the head low and shaking
    const R0=step(p,.36,3.6,2.8),L0=step(p+.5,.36,3.6,2.8),hold=Math.sin(ph);
    sp.root.p=[-.3*hold,-.5+.55*Math.abs(Math.sin(ph*2+.6)),0];turn('bacino',qq(rx(.16),ry(.15*Math.cos(ph))));hunch(1.5,.45);turn('petto',ry(-.2*Math.cos(ph-.2)));
    turn('testa',qq(rz(.15+.06*Math.sin(ph*2)),rx(.05*Math.sin(ph*4))));foot('D',R0.z,R0.y,R0.roll,2.4,0);foot('S',L0.z,L0.y,L0.roll,2.4,0);
    for(const sd of['S','D']){const s=sd==='S'?1:-1,sw=Math.sin(ph+(s>0?Math.PI:0)-.3);arm(sd,[(3.6+.4*Math.abs(sw))*s,.2+sw*1.6,7.2+sw*3.2],[.5*s,-.6,-1],rx(.3-.3*sw));curl(sd,.5+.25*sw)}
    jaw(.55+.15*Math.sin(ph*2));break}
  case 'sbuca':{// out of the ground: first the claws and the top of the head; the hands find the edge and grip it; he hauls himself up in two
    // heaves, a knee onto the ground, then the other foot, he stands up straight… and his head snaps round towards you
    const rise=p<.1?0:p<.34?.42*ez((p-.1)/.24):p<.38?.42:p<.54?.42+.2*ez((p-.38)/.16):p<.58?.62:p<.76?.62+.26*ez((p-.58)/.18):p<.92?.88+.12*ez((p-.76)/.16):1,y=-44*(1-rise);
    const tilt=.18*sm((p-.32)/.1)*(1-sm((p-.76)/.2))+.05*Math.sin(p*TAU*6)*sm((p-.36)/.05)*(1-sm((p-.74)/.05));sp.root.p=[0,y,-Math.sin(tilt)*18];sp.root.q=rx(tilt);
    const down=sm((p-.34)/.08),out=sm((p-.8)/.12);
    for(const sd of['S','D']){const s=sd==='S'?1:-1,up=[3.6*s,13.5+Math.sin(p*TAU*5+s)*.6,4.2],g=[7.2*s,1,6.8+s*.5];
      if(out>=1||(p>.8&&out>.5))arm(sd,[5.2*s,-6.8,3.6],[.5*s,-.6,-1],rx(.5));
      else if(down<=0)arm(sd,up,[.6*s,-.2,-1],rx(-.3));
      else{const P=add([0,y,-Math.sin(tilt)*18],[0,31,-.2]),wUp=add(P,up);arm(sd,lerp3(wUp,g,down),[.6*s,-.7,-1],rx(.6),'mondo')}
      curl(sd,p<.34?.1+.1*Math.sin(p*TAU*4+s):.5)}
    const kneeUp=sm((p-.62)/.12)*(1-sm((p-.84)/.08));sp.leg.S={t:[2.55,ANK+kneeUp*3,-.35+kneeUp*2.5],rel:p<.92?'corpo':'terra'};sp.leg.D={t:[-2.55,ANK,-.35],rel:p<.92?'corpo':'terra'};
    const g=snap(p,.92,.94,1.5,2);hunch(1-.5*down*(1-out));turn('schiena',rx(.25*down*(1-out)));
    turn('collo',qq(rz(.3*(1-g)),ry(look*.35*g),rx(-.15*(1-down))));turn('testa',qq(rz(.3*(1-g)),rx(-.3*(1-down)+.1),ry(look*.6*g)));jaw(.45+.2*Math.sin(ph*6));break}
  case 'urla':{// he draws a breath (the chest rises, the head goes back)… then the scream: the head thrust forward and up, the jaw wide open,
    // the arms spread with the claws open, all of him shaking; the eyes brighter
    const k1=sm(p/.26),k2=snap(p,.26,.36,.78,1),tb=k2*Math.sin(p*TAU*36)*.03,pre=k1*(1-k2);
    sp.root.p=[0,.15*pre-.3*k2,-.6*pre+.4*k2];hunch(1-.6*pre);turn('schiena',rx(-.18*pre+.12*k2+tb));turn('petto',rx(-.14*pre+.06*k2+tb));
    turn('collo',rx(-.2*pre+.1*k2));turn('testa',qq(rx(-.25*pre-.38*k2+tb*2),rz(tb*3)));
    for(const sd of['S','D']){const s=sd==='S'?1:-1;arm(sd,lerp3(lerp3([5.2*s,-6.8,3.6],[6*s,-4.5,-1],pre),[9.6*s,1.5,4.5],k2),[.5*s,-.6,-.6],rx(.2-.4*k2));curl(sd,.4+.4*pre-.35*k2);turn('spalla'+sd,rz(-s*(.12*pre+.12*k2)))}
    foot('S',.3,0,0,2.7,.2);foot('D',-.2,0,0,2.6,.05);jaw(.15+.9*k2+tb*4);sp.emK=1+.9*k2;break}
  case 'colpo':{// the attack of the drawing, with weight: he rocks back raising both arms high, steps in with his right foot and rakes down
    // and across, the body turning into the blow and past it, then he gathers himself
    let up=0,reach=0,lunge=0;if(p<.34){up=ez(p/.34);lunge=-up*1.2}else if(p<.58){const k=ez((p-.34)/.24);up=1-k*1.3;reach=k;lunge=-1.2+k*4.6}else{const k=ez((p-.58)/.42);up=-.3*(1-k);reach=1-k;lunge=3.4*(1-k)}
    const upP=Math.max(0,up),tw=.25*upP-.35*reach;sp.root.p=[0,-.3*reach-.15*upP,lunge*.55];hunch(1-.5*upP+.4*reach);turn('bacino',ry(-tw*.4));turn('petto',qq(ry(-tw*.6),rx(-.2*upP+.15*reach)));turn('testa',rx(-.1*upP+.12*reach));
    for(const sd of['S','D']){const s=sd==='S'?1:-1,lead=s<0?1:.8;arm(sd,[s*(4.8+upP*1.2-reach*1.6),-6.8+upP*15+reach*5.5*lead,3.6-upP*5+reach*6.5],[.5*s,-.6+1.2*upP,-1+.8*upP]);
      curl(sd,.15+.55*reach*(p>.42?1:0));turn('spalla'+sd,rz(-s*.18*upP))}
    const st=cl(lunge/3.4,0,1);foot('D',-.1+st*3,Math.max(0,Math.sin(cl((p-.33)/.27,0,1)*Math.PI))*1.6,-.2*Math.sin(cl((p-.33)/.27,0,1)*Math.PI),2.6,.05);foot('S',.3-st*.6,0,.15*st,2.6,.2);
    jaw(p>.25&&p<.7?.85:.25);break}
  case 'morso':{// he lunges and grabs with both hands, pulls you in, bites (the head thrust forward, the jaw snapping shut), shakes his head
    // as he tears, lets go and steps back
    const gr=snap(p,.08,.32,.82,1),pr=sm((p-.2)/.2),st=snap(p,.4,.47,.72,.96),bk=pr*(1-st),sh=p>.5&&p<.7?Math.sin((p-.5)/.2*TAU*3)*sm((p-.5)/.03)*(1-sm((p-.66)/.04)):0;
    sp.root.p=[0,-.4*st,-1.1*bk+2.6*st+1.2*gr];hunch(1+.3*st);turn('petto',rx(-.12*bk+.18*st));turn('collo',rx(-.22*bk+.2*st));turn('testa',qq(rx(-.3*bk+.32*st),ry(sh*.25),rz(.14*bk+sh*.06)));
    for(const sd of['S','D']){const s=sd==='S'?1:-1;arm(sd,lerp3([5.2*s,-6.8,3.6],[(3.2-.6*st)*s,-1.2+bk,9.4+1.5*st],gr),[.5*s,-.6,-1],rx(.25));curl(sd,.2+.75*gr)}
    foot('D',1.6*gr+1.2*st,Math.max(0,Math.sin(cl((p-.06)/.2,0,1)*Math.PI))*1.2,0,2.6,.05);foot('S',.2,0,.1,2.6,.2);
    jaw(p<.46?pr:p<.49?pr*(1-sm((p-.46)/.03)):.12+.2*(1-st)+.12*Math.abs(sh));break}
  case 'colpito':{// the blow throws his chest back and his head round; he steps back to keep his balance, the arms flung out, then sways back
    const b=p<.14?sm(p/.14):Math.exp(-(p-.14)*5.5)*Math.cos((p-.14)*11),bb=cl(b,0,1);
    sp.root.p=[0,.1*bb,-1.4*bb-.4*sm(p/.3)*(1-sm((p-.6)/.4))];hunch(1-.6*bb);turn('schiena',rx(-.3*b));turn('petto',rx(-.18*b));turn('collo',rz(.26*b));turn('testa',qq(rx(-.5*b),rz(.4*b)));
    for(const sd of['S','D']){const s=sd==='S'?1:-1;arm(sd,lerp3([5.2*s,-6.8,3.6],[8.6*s,-1,-1.5],bb),[.5*s,-.6,-.6]);curl(sd,.4-.3*bb)}
    const bs=sm(p/.25)*(1-sm((p-.55)/.4));foot('S',.3-2.2*bs,Math.max(0,Math.sin(cl(p/.25,0,1)*Math.PI))*.9,0,2.7,.2);foot('D',-.1,0,0,2.6,.05);jaw(.2+.6*bb);break}
  case 'muore':{// hit… his knees give way one after the other and he drops onto them (the feet slide back, the shins flat on the ground),
    // sways, and falls forward onto his face without putting out his hands, pivoting on his knees; the head turns aside on the ground; one
    // last twitch; the eyes go out
    const hit=p<.1?sm(p/.1):p<.18?1-sm((p-.1)/.08):0,kS=sm((p-.12)/.17),kD=sm((p-.19)/.17),kn=(kS+kD)/2,
      sway=Math.sin(cl((p-.36)/.12,0,1)*Math.PI),fa=cl((p-.47)/.27,0,1),fall=fa*fa*(1.6-.6*fa),bump=p>.74?Math.sin(cl((p-.74)/.1,0,1)*Math.PI)*.06*(1-sm((p-.84)/.06)):0,
      tw=p>.86&&p<.92?Math.sin((p-.86)/.06*TAU*2):0,A=1.36*fall-bump-.08*sway*(1-fall);
    // the knee line: where he pivots (in the space of the body, then in the world); the body rotates round it
    const Kb=[0,11.55,.05],zz=-.9*hit+.5*kn,Pk=[0,11.55-10.65*kn,.05+zz],R=rx(A),rp=sub(Pk,qrot(R,Kb));sp.root.p=rp;sp.root.q=R;
    turn('bacino',rx(-.12*kn*(1-fall)));hunch((1-.5*hit+.25*kn)*(1-.75*fall));turn('schiena',rx(-.3*hit-.1*sway));
    turn('collo',qq(ry(.35*fall),rx(-.25*fall)));turn('testa',qq(rx(-.45*hit+.22*kn*(1-fall)-.2*fall),ry(1.05*fall),rz(.3*kn*(1-fall)+tw*.06)));
    for(const sd of['S','D']){const s=sd==='S'?1:-1,k=sd==='S'?kS:kD,zw=.05+zz-9.4*k;// the shin goes back flat on the ground, the top of the foot down
      sp.leg[sd]={t:[2.6*s,ANK+(1.1-ANK)*k+1.6*Math.sin(k*Math.PI),zw-rp[2]],foot:qmul(rx(-A),rx(Math.PI*.92*k))};
      arm(sd,lerp3(lerp3([5.2*s,-6.8,3.6],[6*s,-10.2,1.6],kn),[6.4*s,-9.8,-2.2],fall),[.5*s,-.8,-.2],rx(.4));curl(sd,.5+(sd==='D'?tw*.35:0))}
    jaw(.25+.4*kn);sp.emK=1-.85*sm((p-.72)/.22);break}
  default:hunch(1);for(const sd of['S','D']){const s=sd==='S'?1:-1;arm(sd,[5.2*s,-6.8,3.6],[.5*s,-.6,-1],rx(.5))}foot('S',0,0,0,2.55,.15);foot('D',0,0,0,2.55,.05)}
  return sp}
const solve=(M,sp)=>K3D.solve(M.skel,sp),mix=K3D.mix,joints=(M,P,out)=>K3D.joints(M.bind,P,out);
const ZV3={build,body,shoes,solve,mix,joints,pose,MOSSE,BN,BI,bindPose,HEAD,sm,ez,cl,lerp,TAU};
if(typeof module!=='undefined'&&module.exports)module.exports=ZV3;else root.ZV3=ZV3;
})(typeof window!=='undefined'?window:this);
