// Mossbound · il Viandante in 3D vero: il personaggio dell'immagine di Denis (4 novembre: «bro posso chiederti di farmi questo modello in 3d
// invece? come hai fatto per l'artefatto modello di prova?»; l'immagine sta in sprite/mostri3d/viandante_rif.webp). Un uomo magro e asciutto,
// scalzo, coi capelli scuri spettinati, la barba di qualche giorno e gli occhi chiari; la tunica grigia senza maniche col collo a V, strappata
// e bucata; la corda attorcigliata due volte in vita col nodo grande e i due capi sfilacciati; il borsellino di cuoio; la gonna marrone a due
// strati stracciata; i pantaloni marroni al ginocchio col buco; le fasce di stoffa incrociate su avambracci e stinchi; la fascia rossa sul
// braccio sinistro; il cordino col cerchio di ferro. Scolpito nel codice con le distanze (sprite/mostri3d/scultura.js) come lo zombie col
// corpo vero, con gli attrezzi di kit3d.js; lo disegna mb3.js. Tutto il corpo è una forma sola: la griglia è larga sul corpo e fine sul viso,
// sulle mani e sui piedi (i pezzi si sovrappongono sotto le fasce e sotto il collo della tunica, dove le due griglie danno la stessa pelle).
// VI3.build(o), VI3.solve(M, VI3.pose(mossa, p, {look})), VI3.mix, VI3.joints, VI3.MOSSE, VI3.SEQ.
(function(root){'use strict';
const K3D=(typeof root.K3D!=='undefined'&&root.K3D)||(typeof require==='function'?require('./kit3d.js'):null);
const SCU=(typeof root.SCU!=='undefined'&&root.SCU)||(typeof require==='function'?require('./scultura.js'):null);
const {TAU,cl,lerp,sm,ez,add,sub,mul,dot,cross,len,nrm,lerp3,hash,hex,mixc,Q0,qmul,qax,qrot,rx,ry,rz,qq,ik,K,frameOf,Mesh,tube,ball}=K3D;
const {ell,cone,Sculpt,nets,normal,onSkin,occl,weights,fbm,noise,smin,smax}=SCU;const sball=SCU.ball;
// ---------------------------------------------------------------- the colours of the picture
const C={skin:hex('#bf8f75'),skinR:hex('#c27a66'),skinD:hex('#946a54'),pale:hex('#c99d84'),dirt:hex('#6a5241'),scratch:hex('#7a3b2f'),vein:hex('#8a6e6c'),
  lip:hex('#9a5e52'),lid:hex('#8c5f50'),nail:hex('#c4a090'),sole:hex('#7d5a46'),hair:hex('#1e1712'),hairL:hex('#4a3829'),brow:hex('#2a2019'),stub:hex('#4e3f39'),
  scl:hex('#bdb0a3'),iris:hex('#6d858e'),irisD:hex('#33434a'),pupil:hex('#09090a'),
  tun:hex('#8c8577'),tunD:hex('#5e5950'),tunL:hex('#a39c8c'),skir:hex('#6a4a35'),skirD:hex('#4b3425'),skir2:hex('#5d4231'),trou:hex('#6b5948'),trouD:hex('#4a3d31'),
  wrap:hex('#968b78'),wrapD:hex('#6b6152'),rope:hex('#b39b74'),ropeD:hex('#7b694e'),leath:hex('#6a4229'),leathD:hex('#43291a'),cord:hex('#2a201a'),iron:hex('#6d6b66'),
  red:hex('#8e3226'),redD:hex('#5c1f17')};
// ---------------------------------------------------------------- the skeleton of a real man, 42 tall (the units of the 2D drawings)
const ARM={L1:7.1,L2:6.1},LEG={L1:9.75,L2:9.65},ANK=2.0,BALL=[0,-1.45,3.35],HEEL=[0,-2.0,-1.0],TOE_OUT=.1;
const aDir=s=>nrm([.36*s,-1,.04]);// the arms of the picture: a little away from the body (the «A»)
const fDir=s=>[s*Math.sin(TOE_OUT),0,Math.cos(TOE_OUT)];// the feet: forward, the toes a little outward
const HEAD=[0,39.45,.15];
const BN=['root','bacino','schiena','petto','collo','testa','mascella'];
for(const sd of['S','D'])BN.push('spalla'+sd,'braccio'+sd,'avambraccio'+sd,'mano'+sd,'dita'+sd,'punte'+sd);
for(const sd of['S','D'])BN.push('coscia'+sd,'stinco'+sd,'piede'+sd,'punta'+sd);
const BI={};BN.forEach((n,i)=>{BI[n]=i});
const PAR={bacino:'root',schiena:'bacino',petto:'schiena',collo:'petto',testa:'collo',mascella:'testa'};
for(const sd of['S','D'])Object.assign(PAR,{['spalla'+sd]:'petto',['braccio'+sd]:'spalla'+sd,['avambraccio'+sd]:'braccio'+sd,['mano'+sd]:'avambraccio'+sd,['dita'+sd]:'mano'+sd,
  ['punte'+sd]:'dita'+sd,['coscia'+sd]:'bacino',['stinco'+sd]:'coscia'+sd,['piede'+sd]:'stinco'+sd,['punta'+sd]:'piede'+sd});
function bindPose(){const P={root:[0,0,0],bacino:[0,22,0],schiena:[0,26.2,-.35],petto:[0,31,-.2],collo:[0,35,-.55],testa:[0,37.1,-.1],mascella:[0,38.45,.15]};
  for(const s of[1,-1]){const sd=s>0?'S':'D',sh=[4.55*s,34.3,-.1],d=aDir(s);P['spalla'+sd]=[1*s,34.8,.3];P['braccio'+sd]=sh;P['avambraccio'+sd]=add(sh,mul(d,ARM.L1));
    P['mano'+sd]=add(P['avambraccio'+sd],mul(d,ARM.L2));P['dita'+sd]=add(P['mano'+sd],mul(d,2.3));P['punte'+sd]=add(P['dita'+sd],mul(d,1.05));
    const hip=[2.1*s,21.3,.05],an=[3.0*s,ANK,-.35],[kn]=ik(hip,an,LEG.L1,LEG.L2,[0,.15,1]);P['coscia'+sd]=hip;P['stinco'+sd]=kn;P['piede'+sd]=an;
    P['punta'+sd]=add(add(an,[0,BALL[1],0]),mul(fDir(s),BALL[2]))}
  return BN.map(n=>P[n])}
const B0=bindPose(),bp=n=>B0[BI[n]];
const CHAINS=[];for(const sd of['S','D']){const s=sd==='S'?1:-1;
  CHAINS.push({a:'braccio'+sd,b:'avambraccio'+sd,c:'mano'+sd,g:'arm',s:sd,L1:ARM.L1,L2:ARM.L2,pole:[.5*s,-.6,-1],y0:nrm([.5*s,-.1,-1]),
    target:(ch,wp,rootP,rootQ)=>ch.rel!=='mondo'?add(wp[BI.petto],qrot(rootQ,ch.t)):ch.t,end:(ch,w1)=>qmul(w1,ch.wrist||Q0())});
  CHAINS.push({a:'coscia'+sd,b:'stinco'+sd,c:'piede'+sd,g:'leg',s:sd,L1:LEG.L1,L2:LEG.L2,pole:[0,.1,1],y0:[0,.1,1],
    target:(ch,wp,rootP,rootQ,sp)=>ch.rel==='corpo'?add(rootP,qrot(rootQ,ch.t)):add([rootP[0],0,rootP[2]],qrot(sp.root&&sp.root.yawQ||Q0(),ch.t)),end:(ch,w1,rootQ)=>qmul(rootQ,ch.foot||Q0())})}
const limbAx=(d,s)=>{const X=nrm(cross(d,[0,0,1*s])),Zf=nrm(cross(X,d));return[X,d,Zf]};
// the frame of a hand in the rest pose: a along it (wrist → fingers), n the palm (towards the thigh), w across it (towards the thumb, in front)
function handFrame(s){const a=aDir(s),n0=[-s,0,0],n=nrm(sub(n0,mul(a,dot(n0,a)))),w=mul(cross(n,a),s);return{a,n,w}}
// the fingers: across the hand (v), along it (base, lengths of the three bones), thickness, spread; relaxed, bent a little at each joint
const FING=[{v:.5,base:2.26,L:[1.0,.62,.47],r:.19,sp:.08},{v:.16,base:2.33,L:[1.1,.7,.5],r:.2,sp:.01},{v:-.18,base:2.29,L:[1.04,.66,.48],r:.19,sp:-.05},
  {v:-.5,base:2.15,L:[.84,.52,.42],r:.165,sp:-.12}],FBEND=[.2,.34,.24],THUMB={base:[.42,.6,.12],dir:[.62,.62,.3],L:[.95,.68,.55],r:[.27,.23,.2]};
function handPts(s){const sd=s>0?'S':'D',wr=bp('mano'+sd),{a,n,w}=handFrame(s),at=(u,v,t)=>add(add(add(wr,mul(a,u)),mul(w,v)),mul(n,t)),fingers=[];
  for(const f of FING){let p=at(f.base,f.v,.02),dir=nrm(add(a,mul(w,f.sp)));const P=[p];for(let k=0;k<3;k++){dir=nrm(add(mul(dir,Math.cos(FBEND[k])),mul(n,Math.sin(FBEND[k]))));p=add(p,mul(dir,f.L[k]));P.push(p)}
    fingers.push({P,r:f.r,dir})}
  let p=at(...THUMB.base),dir=nrm(add(add(mul(a,THUMB.dir[0]),mul(w,THUMB.dir[1])),mul(n,THUMB.dir[2])));const T=[p];
  for(let k=0;k<3;k++){if(k)dir=nrm(add(mul(dir,Math.cos(.24)),mul(n,Math.sin(.24))));p=add(p,mul(dir,THUMB.L[k]));T.push(p)}
  return{wr,a,n,w,at,fingers,thumb:T}}
// the eyes: real size (a ball of 2.4 cm), deep under the brow
const EYR=.285,EYE=s=>[.73*s,39.27,1.56];
// an almond cut along z (the opening of the lids): half width a, the upper arc bu high, the lower one bl deep, the outer corner up by tilt
// (radians); from c[2]-zr to c[2]+zr
function almond(c,s,a,bu,bl,tilt,zr){const R1=(a*a+bu*bu)/(2*bu),R2=(a*a+bl*bl)/(2*bl),co=Math.cos(tilt),si=Math.sin(tilt);
  return{c,r:Math.hypot(a,zr)+.05,f:(x,y,z)=>{const u0=(x-c[0])*s,v0=y-c[1],u=u0*co+v0*si,v=-u0*si+v0*co;
    return Math.max(Math.hypot(u,v-(bu-R1))-R1,Math.hypot(u,v+(bl-R2))-R2,Math.abs(z-c[2])-zr)}}}
// ---------------------------------------------------------------- the sculpture: the whole body in one shape
// forCloth: the shape the clothes lie on (no hollows, the little bumps much softer, no fingers and toes): cloth hangs over, it does not sink in
function body(forCloth){const S=Sculpt(),dig=(s,k)=>{if(!forCloth)S.dig(s,k);return S},det=(s,k)=>S.add(s,forCloth?k*2.2+.3:k),only=(s,k)=>{if(!forCloth)S.add(s,k);return S};
  // · the trunk: the ribcage, the lean flat chest, the shoulder girdle, the trapezius, the shoulder blades, the lats, the belly, the pelvis
  S.add(ell([0,30.4,.05],[3.72,4.6,2.55])).add(ell([0,32.3,.85],[3.5,1.95,1.62]),.9);
  for(const s of[1,-1])S.add(ell([1.62*s,31.35,1.85],[1.7,1.08,.66]),.6);
  S.add(cone([-3.6,34.3,-.65],[3.6,34.3,-.65],1.3,1.3),1);
  for(const s of[1,-1])S.add(cone([3.3*s,34.65,-.85],[.85*s,36.15,-.85],1.02,.8),.9).add(ell([2.15*s,32.2,-2.2],[1.4,1.8,.4]),.8).add(ell([2.85*s,29.4,-1.15],[.9,2.7,1.35]),.8);
  S.add(ell([0,26.1,.18],[3.05,3.3,2.02]),1.2).add(ell([0,23.9,-.02],[3.32,1.9,2.18]),1).add(ell([0,22.1,-.1],[3.48,2.3,2.4]),1);
  for(const s of[1,-1])S.add(ell([1.5*s,21.2,-1.38],[1.72,2.0,1.55]),.9);
  for(const s of[1,-1])det(cone([.42*s,34.75,1.3],[4.05*s,34.95,.55],.3,.27),.35);// the collarbones
  dig(cone([0,24.6,-2.72],[0,33.2,-2.62],.3,.3),.5);// the groove of the spine, between the chest muscles
  // · the neck: lean, the cords of the neck, the Adam's apple
  S.add(cone([0,34.5,-.45],[0,37.7,-.05],1.32,1.14),.7);for(const s of[1,-1])det(cone([1.25*s,38.1,-.3],[.4*s,35.05,1.15],.36,.3),.4);det(sball([0,36.35,1.05],.27),.25);
  // · the head: the skull, the forehead, the brow ridge, the cheekbones with their arch towards the ears, the face under them, the jaw (from
  // under the ear to the chin) and the chin, the muzzle round the mouth, the nose, the lips, the ears. A lean face: narrow, the cheeks hollow
  // under the cheekbones, the eyes deep under the brow
  S.add(ell([0,39.82,-.28],[1.75,1.93,2.28]),.3).add(ell([0,40.42,.92],[1.42,1.0,1.04]),.8);
  S.add(cone([-1.08,39.78,1.67],[1.08,39.78,1.67],.27,.27),.45).add(sball([0,39.72,1.84],.2),.3);
  for(const s of[1,-1])S.add(sball([1.18*s,38.98,1.3],.36),.4).add(cone([1.3*s,38.98,1.0],[1.58*s,39.03,-.1],.24,.17),.35);
  S.add(ell([0,38.45,1.1],[1.12,1.12,1.28]),.55).add(ell([0,37.66,1.38],[.8,.56,.8]),.45);
  for(const s of[1,-1])S.add(cone([1.38*s,38.6,-.35],[1.15*s,37.45,-.2],.24,.26),.4).add(cone([1.15*s,37.45,-.15],[.42*s,36.86,1.3],.25,.23),.3);
  S.add(sball([0,37.0,1.45],.42),.35).add(ell([0,36.78,1.4],[.55,.28,.4]),.3);
  // the nose: long and straight, narrow at the top, the tip, the wings, the bit between the nostrils
  only(cone([0,39.45,1.97],[0,38.5,2.55],.14,.17),.2);only(sball([0,38.45,2.52],.2),.15);for(const s of[1,-1])only(sball([.22*s,38.33,2.27],.15),.12);
  only(ell([0,38.3,2.42],[.08,.07,.12]),.08);
  // the lips: thin, closed, a little down at the corners
  only(ell([0,37.83,2.1],[.42,.1,.15]),.16);only(ell([0,37.57,2.06],[.37,.11,.16]),.16);
  // the ears: the shell, the hollow inside, the lobe
  for(const s of[1,-1]){only(ell([1.76*s,39.02,-.12],[.18,.68,.4]),.12);only(sball([1.78*s,38.42,0],.15),.14);dig(ell([1.86*s,39.0,-.05],[.09,.3,.19]),.06)}
  // dug: the sockets under the brow, the lids (a shell round each eye) with their almond opening, the outer corners a little up; the
  // nostrils, the line of the mouth and its corners, the groove under the nose, the folds from the nose to the mouth, the hollow cheeks,
  // the temples
  for(const s of[1,-1]){const E=EYE(s);only(sball(E,EYR+.04),.18);dig(almond([E[0],E[1],1.95],s,.31,.112,.085,.06,.4),.025);
    dig(ell([.73*s,39.5,1.86],[.36,.045,.12]),.08);
    dig(ell([.11*s,38.25,2.38],[.06,.04,.07]),.035);dig(sball([.47*s,37.7,2.04],.07),.06);dig(cone([.42*s,38.3,2.2],[.6*s,37.66,1.98],.035,.035),.12);
    dig(ell([1.05*s,38.0,1.78],[.42,.55,.32]),.45);dig(ell([1.72*s,39.95,.75],[.16,.4,.4]),.45)}
  dig(ell([0,37.7,2.3],[.45,.018,.2]),.025);dig(ell([0,38.0,2.34],[.07,.12,.05]),.05);
  // · the arms: the deltoid, the biceps and the triceps, the bony elbow, the forearm with its muscles, the wrist
  for(const s of[1,-1]){const sd=s>0?'S':'D',sh=bp('braccio'+sd),el=bp('avambraccio'+sd),wr=bp('mano'+sd),d=aDir(s),[X,Y,Zf]=limbAx(d,s),A=[X,Y,Zf];
    S.add(ell([4.82*s,33.8,-.05],[1.45,1.75,1.45],A),.8).add(cone(sh,el,1.0,.7),.6).add(ell(add(lerp3(sh,el,.5),mul(Zf,.42)),[.6,1.9,.62],A),.5)
     .add(ell(add(lerp3(sh,el,.42),mul(Zf,-.48)),[.66,2.1,.58],A),.5).add(sball(el,.6),.4);det(sball(add(el,mul(Zf,-.45)),.4),.3);
    S.add(cone(el,wr,.8,.46),.5).add(ell(add(lerp3(el,wr,.25),add(mul(X,.28),mul(Zf,.15))),[.55,1.75,.5],A),.45).add(ell(add(lerp3(el,wr,.3),add(mul(X,-.2),mul(Zf,.1))),[.5,1.7,.48],A),.45)
     .add(sball(wr,.44),.3)}
  // · the hands: the palm, the heel of the hand, the thumb muscle, the knuckles, four fingers with three bones each and the thumb
  for(const s of[1,-1]){const H=handPts(s),{a,n,w,at}=H,ax=[w,a,n];
    S.add(cone(at(-1.6,0,0),at(.15,0,0),.5,.44),.3).add(ell(at(1.2,0,.04),[.92,1.15,.34],ax),.45).add(ell(at(.55,.05,.05),[.75,.6,.36],ax),.35)
     .add(ell(at(.85,.52,.2),[.42,.68,.33],ax),.35).add(ell(at(1.05,-.55,.12),[.33,.8,.3],ax),.3);
    if(!forCloth){for(const f of H.fingers){only(sball(f.P[0],f.r*1.12),.15);for(let k=0;k<3;k++){const r0=f.r*(1-.08*k),r1=f.r*(1-.08*(k+1))*(k===2?.84:1);only(cone(f.P[k],f.P[k+1],r0,r1),.06)}}
      const T=H.thumb,TR=THUMB.r;for(let k=0;k<3;k++)only(cone(T[k],T[k+1],TR[k],TR[k]*.9),k?.06:.25)}}
  // · the legs: the thighs, the knees with the kneecap, the shins, the calves, the bony ankles
  for(const s of[1,-1]){const sd=s>0?'S':'D',hp=bp('coscia'+sd),kn=bp('stinco'+sd),an=bp('piede'+sd);
    S.add(cone(hp,kn,1.72,1.08),.9).add(ell(add(lerp3(hp,kn,.4),[0,0,.55]),[1.15,3.3,.92]),.7).add(ell(add(lerp3(hp,kn,.25),[-.8*s,0,.1]),[.9,2.6,1.0]),.7)
     .add(ell(add(lerp3(hp,kn,.45),[0,0,-.6]),[1.0,3.0,.85]),.7).add(sball(kn,1.0),.5);det(sball(add(kn,[0,.15,.8]),.48),.3);
    S.add(cone(kn,an,1.0,.55),.6).add(ell(add(lerp3(kn,an,.3),[0,0,-.6]),[.98,2.5,.88]),.6).add(sball(an,.56),.3)}
  // · the bare feet: the heel, the sole with the arch, the instep, the ball of the foot, five toes (the big one inside), the Achilles tendon
  for(const s of[1,-1]){const sd=s>0?'S':'D',an=bp('piede'+sd),f=fDir(s),u=[0,1,0],r=cross(u,f),at=(z,x,y)=>add(add(add(an,mul(f,z)),mul(r,x*s)),[0,y,0]),ax=[r,u,f];
    S.add(sball(at(-.78,0,-1.38),.62),.4).add(ell(at(1.0,0,-1.25),[.86,.55,2.0],ax),.5).add(ell(at(.65,-.05,-.55),[.76,.6,1.25],ax),.5)
     .add(ell(at(2.55,-.08,-1.55),[1.0,.42,.62],ax),.4).add(cone(at(-.5,0,1.2),at(-.78,0,-1.0),.3,.36),.3);
    dig(ell(at(.95,-.58,-1.82),[.5,.34,1.1],ax),.3);
    for(const s2 of[1,-1])det(sball(at(-.05,.4*s2,-.05+(s2>0?-.08:0)),.26),.24);
    if(!forCloth){const TOES=[[-.56,.95,.3,.05],[-.12,.82,.23,.0],[.2,.72,.21,-.03],[.48,.62,.2,-.06],[.73,.5,.18,-.1]];
      for(const[x,L,tr,spl] of TOES){const b=at(2.95-Math.abs(x)*.28,x,-1.6),dir=nrm(add(f,mul(r,spl*s))),m1=add(add(b,mul(dir,L*.55)),[0,-.06,0]),tp=add(add(b,mul(dir,L*.86)),[0,-.14,0]);
        only(cone(b,m1,tr,tr*.92),.12);only(cone(m1,tp,tr*.92,tr*.86),.06)}}}
  return S}
// ---------------------------------------------------------------- the weights of the bones
const seg=(n,b,s)=>({i:BI[n],a:bp(n),b,s});
const BONES=[seg('bacino',bp('schiena'),3.3),seg('schiena',bp('petto'),3.3),seg('petto',bp('collo'),3.5),seg('collo',bp('testa'),1.15),seg('testa',add(bp('testa'),[0,4.7,.3]),2)];
for(const sd of['S','D'])BONES.push(seg('spalla'+sd,bp('braccio'+sd),1.3),seg('braccio'+sd,bp('avambraccio'+sd),.85),seg('avambraccio'+sd,bp('mano'+sd),.6),
  seg('coscia'+sd,bp('stinco'+sd),1.4),seg('stinco'+sd,bp('piede'+sd),.9));
const PART={bacino:['bacino','schiena','cosciaS','cosciaD'],schiena:['bacino','schiena','petto'],petto:['schiena','petto','collo','spallaS','spallaD'],collo:['petto','collo','testa'],
  testa:['collo','testa'],spallaS:['petto','spallaS','braccioS'],spallaD:['petto','spallaD','braccioD'],braccioS:['spallaS','braccioS','avambraccioS'],braccioD:['spallaD','braccioD','avambraccioD'],
  avambraccioS:['braccioS','avambraccioS'],avambraccioD:['braccioD','avambraccioD'],cosciaS:['bacino','cosciaS','stincoS'],cosciaD:['bacino','cosciaD','stincoD'],
  stincoS:['cosciaS','stincoS'],stincoD:['cosciaD','stincoD']};
const bi=n=>BI[n];
// the jaw takes the face under the mouth (and the chin), softly
const jawW=p=>{if(p[1]>37.72||p[2]<.1)return 0;return sm((37.68-p[1])/.26)*sm((p[2]-.2)/.7)*sm((1.6-Math.abs(p[0]))/.45)};
// the hand: the forearm under the wraps, the palm, each bone of each finger; the foot: the ankle, the foot, the toes
function handW(p,s){const sd=s>0?'S':'D',H=HP[sd],q=sub(p,H.wr),u=dot(q,H.a);
  if(u<.35){const k=sm((u+.55)/.8);return[[bi('avambraccio'+sd),1-k],[bi('mano'+sd),k]]}
  let best=1e9,bw=[[bi('mano'+sd),1]];const segD=(a,b,r)=>{const ab=sub(b,a),t=cl(dot(sub(p,a),ab)/(dot(ab,ab)||1),0,1);return[len(sub(p,add(a,mul(ab,t))))/r,t]};
  for(const f of H.fingers)for(let k=0;k<3;k++){const[d,t]=segD(f.P[k],f.P[k+1],f.r);if(d<best){best=d;const b=sm(t/.3);
      bw=k===0?[[bi('mano'+sd),(1-b)*.5],[bi('dita'+sd),.5+.5*b]]:k===1?[[bi('dita'+sd),(1-b)*.5],[bi('punte'+sd),.5+.5*b]]:[[bi('punte'+sd),1]]}}
  {const T=H.thumb;for(let k=0;k<3;k++){const[d,t]=segD(T[k],T[k+1],.26);if(d<best){best=d;bw=k===0?[[bi('mano'+sd),1]]:k===1?[[bi('mano'+sd),.6-.3*t],[bi('dita'+sd),.4+.3*t]]:[[bi('dita'+sd),1]]}}}
  return best>1.5?[[bi('mano'+sd),1]]:bw}
function footW(p,s){const sd=s>0?'S':'D',an=bp('piede'+sd),z=dot(sub(p,an),fDir(s)),y=p[1];
  if(y>2.5){const k=sm((y-2.5)/1.2);return[[bi('stinco'+sd),k],[bi('piede'+sd),1-k]]}
  const t=sm((z-2.55)/.6);return t<=0?[[bi('piede'+sd),1]]:[[bi('piede'+sd),1-t],[bi('punta'+sd),t]]}
const HP={};for(const s of[1,-1])HP[s>0?'S':'D']=handPts(s);
function skinW(p){// which part of the body: hands and feet by their own rules, the rest from the bones nearby
  for(const s of[1,-1]){const sd=s>0?'S':'D',H=HP[sd];if(dot(sub(p,H.wr),H.a)>-1.2&&len(sub(p,add(H.wr,mul(H.a,1.6))))<3.4)return handW(p,s)}
  if(p[1]<4.2)for(const s of[1,-1]){if(p[0]*s>.6)return footW(p,s)}
  const w0=weights(p,BONES,null,.01),near=BN[w0[0][0]],only=(PART[near]||[near]).map(bi),w=weights(p,BONES,only,.5);
  if(near==='testa'||near==='collo'&&p[1]>36.6){const j=jawW(p);if(j>0){const t=w.find(x=>x[0]===bi('testa'));if(t)t[1]*=1-j;w.push([bi('mascella'),j])}}
  return w}
// ---------------------------------------------------------------- the paint of the skin
function skinPaint(p){let c=C.skin.slice();const x=p[0],y=p[1],z=p[2],n1=fbm(x*.5,y*.5,z*.5),n2=fbm(x*1.4+3,y*1.4,z*1.4),ax=Math.abs(x);
  c=mixc(c,C.pale,sm((y-28)/2)*(1-sm((y-34.5)/1))*.15);// the chest a little paler than the arms and the face, burnt by the sun
  c=mixc(c,C.skinD,sm((n1-.52)/.14)*.35);c=mixc(c,C.dirt,sm((fbm(x*.33+9,y*.33,z*.33)-.56)/.12)*(.35+.3*sm((6-y)/4)));// the dirt, more on the feet
  const sc=Math.abs(noise(x*1.9+1,y*.6,z*1.9)-.5);if(sc<.018&&n2>.55)c=mixc(c,C.scratch,.55*(1-sc/.018));// a few scratches
  // red where the skin is thin or knocks: the nose, the cheeks, the ears, the knuckles, the elbows, the knees
  let red=0;if(y>36){red=Math.max(sm((.45-len(sub(p,[0,38.42,2.5])))/.35)*.8,sm((.6-len(sub(p,[1.0*Math.sign(x||1),38.78,1.72])))/.5)*.5,ax>1.6&&y>38.15&&y<39.85?.6:0)}
  for(const s of[1,-1]){const sd=s>0?'S':'D';red=Math.max(red,sm((.8-len(sub(p,bp('avambraccio'+sd))))/.6)*.5,sm((1.2-len(sub(p,bp('stinco'+sd))))/.8)*.45);
    for(const f of HP[sd].fingers)red=Math.max(red,sm((.28-len(sub(p,f.P[0])))/.2)*.5,sm((.22-len(sub(p,f.P[1])))/.18)*.35)}
  c=mixc(c,C.skinR,red*.6);
  // the veins on the arms (along them) and on the backs of the hands
  if(y<34&&ax>4){const v=Math.abs(noise(x*.9+y*.2,y*.25+x*.1,z*1.6)-.5);if(v<.02)c=mixc(c,C.vein,.35*(1-v/.02))}
  // the face: the lips, the stubble of a few days (the jaw, the chin, the cheeks under the cheekbones, the sideburns, over the lip, under the
  // jaw), the dark round the tired eyes
  if(y>36.0&&y<40.4&&z>-.9){const lipM=(Math.abs(y-37.7)<.24&&ax<.47&&z>1.95)?sm((.47-ax)/.12)*sm((.24-Math.abs(y-37.7))/.08):0;c=mixc(c,C.lip,lipM*.62);
    // the stubble: a soft shadow, darker on the chin and the jaw, lighter over the lip, no hard edge; the sideburns in front of the ears
    const yTop=38.12+.62*sm((ax-.9)/.6)+.5*sm((ax-1.45)/.3),nose=(z>2.18&&y>37.95&&ax<.4)?1:0,bd=sm((yTop-y)/.42)*sm((y-36.3)/.5)*(1-lipM)*(1-nose)*sm((z+.3)/.5)*(ax>1.66&&y>38.5?0:1);
    if(bd>0){const sp=noise(x*11,y*11,z*11),sp2=noise(x*23+5,y*23,z*23),up=y>37.75&&ax<.75?.6:1;c=mixc(c,C.stub,bd*up*(.11+.09*sp+.07*sm((sp2-.55)/.1)))}
    // a little dark round the tired eyes, the lids a little pink
    for(const s of[1,-1]){const e=len(sub(p,[.73*s,39.24,1.72]));c=mixc(c,C.lid,sm((.58-e)/.26)*.16)}}
  return{c,kind:1.2}}
// ---------------------------------------------------------------- a strip of cloth lying on a surface
// pts: the middle line, nr: the normals of the surface there, wid(t) half the width, th the thickness; paint(p, t, side) → {c, k, w}
function ribbon(m,pts,nr,wid,th,paint){const n=pts.length,R=[];
  for(let i=0;i<n;i++){const T=nrm(sub(pts[Math.min(n-1,i+1)],pts[Math.max(0,i-1)])),N=nrm(sub(nr[i],mul(T,dot(nr[i],T)))),Bv=nrm(cross(T,N)),t=i/(n-1),w=typeof wid==='function'?wid(t,i):wid;
    const p=pts[i],a=add(p,mul(Bv,w)),b=add(p,mul(Bv,-w)),at=add(a,mul(N,th)),bt=add(b,mul(N,th)),v=(q,nn,sd)=>{const pa=paint(q,t,sd);return m.v(q,nn,pa.c,pa.k,pa.w)};
    R.push({t0:v(at,N,0),t1:v(bt,N,1),s0a:v(a,Bv,0),s0b:v(at,Bv,0),s1a:v(bt,mul(Bv,-1),1),s1b:v(b,mul(Bv,-1),1)})}
  for(let i=0;i<n-1;i++){const A=R[i],B=R[i+1];m.t(A.t0,B.t0,B.t1);m.t(A.t0,B.t1,A.t1);m.t(A.s0a,B.s0a,B.s0b);m.t(A.s0a,B.s0b,A.s0b);m.t(A.s1a,B.s1a,B.s1b);m.t(A.s1a,B.s1b,A.s1b)}}
// a jagged edge: a sharp saw (the tears) with some noise
const saw=x=>{const f=x-Math.floor(x);return Math.abs(f*2-1)};
// ---------------------------------------------------------------- the model
function build(o){o=o||{};const HQ=o.h||1,m=Mesh(),cloth=Mesh(),BODY=body(),CLB=body(true),BX=[-13,-1,-5.5,13,44,6],D=BODY.fast(BX,1,3.5),DC=CLB.fast(BX,1,3.5);
  const covers=[];// the garments that hide the skin under them: {F: field, keep, off}
  const isHidden=(p,n)=>{for(const G of covers){const q=add(p,mul(n,G.off));if(Math.abs(G.F(q[0],q[1],q[2]))>.32||!G.keep(q))continue;
      const t1=nrm(cross(n,Math.abs(n[1])<.9?[0,1,0]:[1,0,0])),t2=cross(n,t1);let ok=true;
      for(const e of[[t1,.42],[mul(t1,-1),.42],[t2,.42],[mul(t2,-1),.42]]){const r=add(q,mul(e[0],e[1]));if(!G.keep(r)){ok=false;break}}if(ok)return true}return false};
  // the outline thinner on the small things (the fingers, the toes, the features of the face), so they do not turn into ink
  const olAt=p=>p[0]>5&&inHand(p,'S')||p[0]<-5&&inHand(p,'D')?.4:p[1]<1.3?.6:p[1]>36.6&&p[2]>.9&&Math.abs(p[0])<1.35?.65:1;
  const NETS=[];const skin=(box,h,keep,name)=>{const t0=Date.now(),r=nets(D,box,h,{keep}),P=r.P,I=r.I,map=new Int32Array(P.length/3).fill(-1),T=[];
    for(let t=0;t<I.length;t+=3){const a=I[t],b=I[t+1],c=I[t+2],ce=[(P[a*3]+P[b*3]+P[c*3])/3,(P[a*3+1]+P[b*3+1]+P[c*3+1])/3,(P[a*3+2]+P[b*3+2]+P[c*3+2])/3];
      if(covers.length&&isHidden(ce,normal(D,ce)))continue;T.push(a,b,c)}
    m.group(1);for(const i of T){if(map[i]>=0)continue;const p=[P[i*3],P[i*3+1],P[i*3+2]],n=normal(D,p),pa=skinPaint(p);
      const ol=olAt(p);map[i]=m.v(p,n,pa.c,K(pa.kind,0,ol),skinW(p));m.K[map[i]*4+2]=occl(D,p,n)*(ol<.5?.45:.85)}
    for(let t=0;t<T.length;t+=3)m.t(map[T[t]],map[T[t+1]],map[T[t+2]]);NETS.push([name,T.length/3,I.length/3,Date.now()-t0])};
  // where each grid works: the head and the neck fine, the hands and the feet finer, the rest of the body wider
  const inHead=p=>p[1]>36.4||p[1]>35.35&&Math.hypot(p[0],p[2]+.3)<2.75,inFace=p=>p[2]>.95&&Math.pow(p[0]/1.3,2)+Math.pow((p[1]-38.45)/1.62,2)<1,
    inFaceCore=p=>p[2]>1.05&&Math.pow(p[0]/1.17,2)+Math.pow((p[1]-38.45)/1.5,2)<1,inHand=(p,sd)=>{const H=HP[sd];return dot(sub(p,H.wr),H.a)>-1.15},inFoot=p=>p[1]<3.05;
  // · the hair: dark, messy, longer on top. A thin cap all over the skull down to the nape (the sideburns in front of the ears, over the top
  // of the ears), thicker on the crown, and on it the locks: flat clumps growing away from the crown, the fringe falling forward over the
  // forehead in a few locks, the sides combed back over the temples, the back down to the nape; a few strands sticking out
  const HCt=[0,39.9,-.3],crown=[0,41.6,-1.0],hairY=a=>{const A=Math.abs(a);if(A<.45)return 40.85+.1*Math.cos(a*9);if(A<1.1)return lerp(40.85,40.1,(A-.45)/.65);
      if(A<1.45)return lerp(40.05,39.25,sm((A-1.1)/.35));if(A<1.95)return lerp(39.25,39.8,sm((A-1.45)/.25));return lerp(39.8,38.3,sm((A-1.95)/.8))},
    earD=p=>Math.min(len(sub(p,[1.78,39.0,-.12])),len(sub(p,[-1.78,39.0,-.12])));
  const thick=(x,y,z)=>.12+.2*sm((y-40.4)/1.2)+.08*fbm(x*1.7,y*1.7,z*1.7),CAP=(x,y,z)=>D(x,y,z)-thick(x,y,z);
  const hairKeep=p=>{const a=Math.atan2(p[0],p[2]-HCt[2]);if(earD(p)<.8&&p[1]<39.85)return false;return p[1]>hairY(a)+.3*(noise(a*5,p[1]*.8,0)-.5)};
  covers.push({F:CAP,keep:hairKeep,off:.3});
  const hairC=(p,t,seed,an)=>mixc(mixc(C.hair,C.hairL,cl(.12+.3*hash(seed)+.3*t*hash(seed+3)+.18*Math.sin(an*2+seed),0,.8)),hex('#120e0b'),.25*noise(p[0]*7,p[1]*7,p[2]*7));
  {const r=nets(CAP,[-2.9,37.6,-3.4,2.9,43.2,3.0],.09*HQ,{keep:hairKeep}),o0=m.P.length/3;m.group(2);
    for(let i=0;i<r.P.length/3;i++){const p=[r.P[i*3],r.P[i*3+1],r.P[i*3+2]],n=normal(CAP,p),st=noise(p[0]*3,p[1]*.8,p[2]*3),c=mixc(mixc(C.hair,C.hairL,sm((st-.55)/.2)*.45),hex('#120e0b'),.3*noise(p[0]*7,p[1]*7,p[2]*7));
      const v=m.v(p,n,c,K(4.3,0,.7),[[bi('testa'),1]]);m.K[v*4+2]=occl(CAP,p,n)*.8}
    for(let t=0;t<r.I.length;t+=3)m.t(o0+r.I[t],o0+r.I[t+1],o0+r.I[t+2]);
    // a lock: from R0 on the cap, L long, w wide, th thick; it goes away from the crown along the head, falls by bend, turns aside by side;
    // fore: it may go past the hairline and lie on the skin of the forehead
    const lock=(R0,L,w,th,bend,side,fore,seed)=>{const NS=7,P=[];let q=R0,n=normal(CAP,q),d=sub(q,crown);d=nrm(sub(d,mul(n,dot(d,n))));
      for(let k=0;k<=NS;k++){const t=k/NS;P.push(add(q,mul(n,th*.5*sm(t/.3)-.07*(1-sm(t/.2))+.05*Math.sin(Math.PI*t))));if(k===NS)break;
        d=nrm(add(add(d,[0,-bend*(.3+t),0]),mul(cross(n,d),side*(.4+t)*.45)));d=nrm(sub(d,mul(n,dot(d,n))));
        let nq=add(q,mul(d,L/NS));const onCap=!fore||hairKeep(nq),F=onCap?CAP:D;nq=onSkin(F,nq);n=normal(F,nq);if(!onCap)nq=add(nq,mul(n,.03));q=nq}
      const nm=normal(CAP,onSkin(CAP,P[3]));
      tube(m,P,P.map((_,k)=>w*(1-.82*Math.pow(k/NS,1.5))),6,(p,t,an)=>({c:hairC(p,t,seed,an),k:K(4.3,0,.45),w:[[bi('testa'),1]]}),{cap0:'open',cap1:'point',tip:.9,flat:[th/w,1],up:nm})};
    // the locks all over the head (none where the ears are and on the face), longer and wider on top
    for(let row=0;row<5;row++)for(let i=0;i<16;i++){const a=(i+.5*(row&1)+(hash(i*13+row*7)-.5)*.55)/16*TAU-Math.PI,ta=Math.abs(a),el=.15+row*.27+(hash(i*5+row)-.5)*.1;
      if(row<2&&ta>1.25&&ta<2.05)continue;if(ta<.62&&row<3)continue;// the front is the fringe, below
      const dir0=nrm([Math.sin(a)*Math.cos(el),Math.sin(el)*.95+.05,Math.cos(a)*Math.cos(el)]),R=onSkin(CAP,add(HCt,mul(dir0,3.4)));if(!hairKeep(R))continue;
      const top=sm((R[1]-40.6)/1.2),L=.75+.55*top+.3*hash(i*3+row),w=.16+.08*top+.04*hash(i*7),side=(hash(i*11+row)-.5)*.6;
      lock(R,L,w,.07+.03*hash(i),ta>1.1?.55:.2,side,false,i*31+row)}
    // the fringe: locks from the top of the head falling forward and down over the forehead, some aside, two crossing
    for(let i=0;i<9;i++){const a=(i-4)/4*.62+(hash(i*3.7)-.5)*.1,el=.8+.14*hash(i*1.3),dir0=nrm([Math.sin(a)*Math.cos(el),Math.sin(el),Math.cos(a)*Math.cos(el)]),R=onSkin(CAP,add(HCt,mul(dir0,3.4)));
      lock(R,1.75+.6*hash(i*5.1)-.25*Math.abs(i-4)/4,.2+.06*hash(i*2.2),.08,.75+.3*hash(i),(i<4?-.4:.4)*(.4+.6*hash(i*9))+(i===3?.9:i===5?-.7:0),true,100+i)}
    // a few strands that stick out of the mess
    for(let i=0;i<34;i++){const a=(hash(i*2.3+1)*2-1)*Math.PI,ta=Math.abs(a);if(ta>1.35&&ta<2)continue;const y0=hairY(a)+.4+hash(i*4.1)*(41.9-hairY(a)),dir0=nrm([Math.sin(a)*1.9,(y0-HCt[1])*.9,Math.cos(a)*2.3]);
      const R=onSkin(CAP,add(HCt,mul(dir0,3.4))),n=normal(CAP,R);let F=sub(R,crown);F=nrm(sub(F,mul(n,dot(F,n))));const L=.45+.5*hash(i*9),d=nrm(add(add(F,mul(n,.3+.35*hash(i*5))),[(hash(i)-.5)*.6,-.25,0]));
      const P=[add(R,mul(n,.05)),add(add(R,mul(n,.1)),mul(d,L*.55)),add(add(R,mul(d,L)),[0,-.1*L,0])];tube(m,P,[.05,.035,.01],5,()=>({c:C.hair,k:K(4.3,0,.35),w:[[bi('testa'),1]]}),{cap0:'open',cap1:'point',tip:.6})}
    // the brows: thick, dark, low and drawn together (the worried look of the picture), three strands each
    for(const s of[1,-1])for(let k=0;k<3;k++){const P=[[.2,39.63+k*.02,2.22],[.5,39.72+k*.015,2.2],[.85,39.76,2.1],[1.18,39.7-k*.01,1.93],[1.38,39.6,1.76]].map(([x,y,z])=>{const q=onSkin(D,[x*s,y+(k-1)*.035,z+.3]);return add(q,mul(normal(D,q),.035))});
      tube(m,P,[.05,.075,.075,.064,.03].map(r=>r*(1-.15*Math.abs(k-1))),6,()=>({c:mixc(C.brow,C.hairL,.15*k),k:K(4.3,0,.3),w:[[bi('testa'),1]]}),{cap0:'point',cap1:'point',tip:.5,flat:[.38,1],up:[0,0,1]})}}
  if(o.vestiti!==false)addClothes();
  skin([-12,2.7,-4.4,12,36.2,4.5],.26*HQ,p=>!(p[1]>35.9&&Math.hypot(p[0],p[2]+.3)<2.6)&&!inFoot(p)&&!(p[0]>5&&inHand(p,'S'))&&!(p[0]<-5&&inHand(p,'D')),'corpo');
  skin([-2.7,35.3,-3.0,2.7,42.5,3.3],.095*HQ,p=>inHead(p)&&!inFaceCore(p),'testa');
  skin([-1.35,36.75,.9,1.35,40.15,2.95],.05*HQ,p=>inFace(p)&&inHead(p),'viso');// the face finer: the lids, the nose, the lips
  for(const s of[1,-1]){const sd=s>0?'S':'D',H=HP[sd],c=add(H.wr,mul(H.a,1.6));skin([c[0]-3.2,c[1]-3.5,c[2]-2.6,c[0]+3.2,c[1]+3.5,c[2]+2.6],.095*HQ,p=>inHand(p,sd)&&p[0]*s>4.5,'mano'+sd)}
  for(const s of[1,-1]){const an=bp('piede'+(s>0?'S':'D'));skin([an[0]-1.9,-.3,an[2]-2.2,an[0]+1.9,3.4,an[2]+4.6],.125*HQ,p=>p[0]*s>.6&&p[1]<3.4,'piede'+(s>0?'S':'D'))}
  addEyes();
  function addEyes(){// the eyes: wet balls behind the lids, the grey-blue iris with its dark rim, the pupil, looking ahead
    for(const s of[1,-1]){const c=EYE(s),g=nrm([-.05*s,-.03,1]);
      ball(m,c,[EYR,EYR,EYR],26,18,(p,d)=>{const t=Math.acos(cl(dot(d,g),-1,1));let col=C.scl,k=5;if(t<.49){const r=t/.49;col=r<.36?C.pupil:mixc(C.iris,C.irisD,sm((r-.72)/.2)*.9+.3*noise(d[0]*20,d[1]*20,d[2]*20));k=r<.36?6:5}
        else col=mixc(C.scl,hex('#c9a99a'),sm((t-.95)/.4)*.6);
        col=mixc(col,hex('#3b2a22'),sm((d[1]-.12)/.3)*.55);// the shadow of the upper lid on the eye
        return{c:col,k:K(k,0,0),w:[[bi('testa'),1]]}})}}
  function addClothes(){
    const ang=p=>Math.atan2(p[0],p[2]),fold=(p,k,f)=>Math.sin(ang(p)*k+fbm(p[0]*.35,p[1]*.3,p[2]*.35)*f)*.5+.5;
    // the lower base: the body plus a column between the legs (cloth that hangs from the hips does not go between them)
    const core=(x,y,z)=>{const rx=3.2,rz=2.0,u=x/rx,v=(z+.05)/rz,k0=Math.hypot(u,v),k1=Math.hypot(u/rx,v/rz),d2=k1<1e-6?-1:k0*(k0-1)/k1;return Math.max(d2,13-y,y-23.6)};
    const LOW=(x,y,z)=>smin(DC(x,y,z),core(x,y,z),.9),flare=y=>Math.max(0,24.3-y)*.075;
    const skW=p=>{// the cloth hanging from the hips: the hips, and the thigh on its side more and more going down (so it goes with the legs)
      const t=sm((23.4-p[1])/5.5),sx=cl(p[0]/2.6,-1,1),kS=(sx*.5+.5),kD=1-kS;return[[bi('bacino'),1-t*.75],[bi('cosciaS'),t*.75*kS],[bi('cosciaD'),t*.75*kD]]};
    const edge=(keep,p,r)=>{let e=0;for(const d of[[r,0,0],[-r,0,0],[0,r,0],[0,-r,0],[0,0,r],[0,0,-r]])if(!keep(add(p,d)))e++;return e/3};
    const put=(F,box,h,keep,paint,wf,aoK,cover)=>{if(cover)covers.push({F,keep,off:cover});const r=nets(F,box,h*HQ,{keep}),o0=cloth.P.length/3;
      for(let i=0;i<r.P.length/3;i++){const p=[r.P[i*3],r.P[i*3+1],r.P[i*3+2]],n=normal(F,p),pa=paint(p,n);const v=cloth.v(p,n,pa.c,pa.k,wf(p));cloth.K[v*4+2]=cl(occl(F,p,n)*(aoK||.6)+(pa.ao||0),0,.85)}
      for(let t=0;t<r.I.length;t+=3)cloth.t(o0+r.I[t],o0+r.I[t+1],o0+r.I[t+2])};
    // · the tunic: grey linen without sleeves, the deep V at the neck, loose and gathered by the rope at the waist, then hanging over the
    // skirts in torn tongues; open on his right in front (the brown skirt shows there), holes, frayed edges
    const holeC=[[-3.12,31.0,.2,.34],[-2.2,27.4,2.3,.22],[1.45,29.7,-2.65,.28],[2.3,20.3,3.4,.26],[-1.1,33.2,-2.7,.18]];
    const TU=(x,y,z)=>{const p=[x,y,z],sU=sm((y-23.6)/1.7);if(sU<=0)return LOW(x,y,z)-(.68+flare(y)*.7+.1*fold(p,11,3));
      const bl=.15*sm((y-24.9)/.8)*(1-sm((y-27.4)/1.8)),cin=sm((25.4-y)/.6)*sm((y-23.8)/.4),sho=sm((y-32.5)/1.5),up=DC(x,y,z)-(.3+.14*fold(p,8,4)*(1-cin)*(1-.6*sho)+bl-.12*cin-.12*sho);
      if(sU>=1)return up;return lerp(LOW(x,y,z)-(.68+flare(y)*.7+.1*fold(p,11,3)),up,sU)};
    const slit=a=>a>-1.0+.08*Math.sin(a*30)&&a<-.2;
    const tuKeep=p=>{const[x,y,z]=p,ax=Math.abs(x),a=ang(p),nz=noise(x*2.2,y*2.2,z*2.2);
      if(y>34.0&&Math.hypot(x*.95,z+.3)<1.68+.18*(nz-.5)+.25*sm((y-35.2)/.8))return false;if(y>36.6)return false;
      if(z>0&&y>28.6&&ax<.14+.36*(y-28.6)+.2*(nz-.5)+.08*saw(y*3.1))return false;// the V, deep and open
      if(ax>2.6&&Math.pow((ax-4.62)/1.6,2)+Math.pow((y-31.2)/3.25,2)<1+.18*(nz-.5))return false;// the armholes
      if(y>28.2?ax>3.55+.4*sm((32.5-y)/3.5)+.2*sm((y-33.0)/1.4)+.1*(nz-.5):ax>4.3)return false;// and nothing on the arms (the strap narrow on the shoulder)
      let hem=19.7-1.0*saw(a*1.9+.3*nz)-.6*nz;if(a>.12&&a<1.35)hem=Math.min(hem,17.5+1.7*Math.abs((a-.62)/.6)+.4*nz);if(y<hem)return false;
      if(slit(a)&&y<24.1+.4*(nz-.5)&&z>0)return false;
      for(const[hx,hy,hz,hr] of holeC){if(Math.hypot(x-hx,y-hy,z-hz)<hr*(1+.35*(nz-.5)))return false}return true};
    put(TU,[-7.2,15.8,-4.8,7.2,36.4,5.6],.24,tuKeep,(p,n)=>{const[x,y,z]=p,f=fold(p,8,4),e=edge(tuKeep,p,.28),st=fbm(x*.4+7,y*.4,z*.4);
      let c=mixc(mixc(C.tun,C.tunL,.25*sm((f-.6)/.3)),C.tunD,.28*(1-f)+.45*e);c=mixc(c,C.dirt,sm((st-.55)/.15)*.35+sm((21.5-y)/3)*.15);
      return{c,k:K(2.2,0,1),ao:(y<24.4&&y>23.5?.12:0)+e*.1}},p=>p[1]<23.6?skW(p):skinW(p),.55,.5);
    // · the skirts: two layers of rough brown cloth, the outer one shorter, both torn to points; seen under the tunic and in its opening
    const SK1=(x,y,z)=>LOW(x,y,z)-(.42+flare(y)*.85+.06*fold([x,y,z],9,3)),SK2=(x,y,z)=>LOW(x,y,z)-(.55+flare(y)*.78+.06*fold([x,y,z],10,3));
    const sk1Keep=p=>{const a=ang(p),nz=noise(p[0]*2,p[1]*2,p[2]*2),hem=15.8-1.15*saw(a*2.4+.4*nz)-.4*nz;if(p[1]<hem||p[1]>24.5)return false;return p[1]<19.4||slit(a)&&p[2]>0};
    const sk2Keep=p=>{const a=ang(p),nz=noise(p[0]*2+5,p[1]*2,p[2]*2),hem=18.4-1.0*saw(a*2.1+.7+.4*nz)-.35*nz;if(p[1]<hem||p[1]>24.5)return false;return p[1]<20.5||slit(a)&&p[2]>0};
    const skPaint=(base,dark,keep)=>(p,n)=>{const[x,y,z]=p,e=edge(keep,p,.26),w=noise(x*6,y*6,z*6),st=fbm(x*.45+3,y*.45,z*.45);
      let c=mixc(mixc(base,dark,.3*w+.4*e),C.dirt,sm((st-.55)/.15)*.3);return{c,k:K(2.2,0,1),ao:e*.08}};
    put(SK1,[-7.4,13.4,-5.4,7.4,24.8,5.6],.25,sk1Keep,skPaint(C.skir2,C.skirD,sk1Keep),skW,.5,.55);
    put(SK2,[-7.2,16.2,-5.2,7.2,24.8,5.5],.25,sk2Keep,skPaint(C.skir,C.skirD,sk2Keep),skW,.5,.55);
    // · the trousers: brown, loose, to just under the knee, torn at the hems, a hole on his right knee, worn on the left one
    const TR=(x,y,z)=>DC(x,y,z)-(.3+.12*(Math.sin(y*2.1+fbm(x*.5,y*.3,z*.5)*4)*.5+.5));
    const kneeH=add(bp('stincoD'),[0,.15,1.05]),kneeW=add(bp('stincoS'),[0,.1,1.0]);
    const trKeep=p=>{const[x,y,z]=p;if(y>18.8||y<9||Math.abs(x)<.2&&y>16)return false;const s=x>0?1:-1,kn=bp('stinco'+(s>0?'S':'D')),a=Math.atan2(x-kn[0],z-kn[2]),nz=noise(x*2.5,y*2.5,z*2.5);
      if(y<10.5-.7*saw(a*1.6+.5*nz)-.25*nz)return false;if(len(sub(p,kneeH))<.42*(1+.4*(nz-.5)))return false;return true};
    put(TR,[-6.4,8.6,-4.4,6.4,19.2,4.4],.26,trKeep,(p,n)=>{const[x,y,z]=p,e=edge(trKeep,p,.25),f=Math.sin(y*2.1+fbm(x*.5,y*.3,z*.5)*4)*.5+.5,st=fbm(x*.5+1,y*.5,z*.5);
      let c=mixc(mixc(C.trou,C.trouD,.3*(1-f)+.45*e),C.dirt,sm((st-.55)/.15)*.3+sm((12.5-y)/2.5)*.2);c=mixc(c,hex('#857260'),sm((.9-len(sub(p,kneeW)))/.5)*.35);
      return{c,k:K(3.2,0,1),ao:e*.08}},skinW,.55,.5);
    // · the wraps: strips of rough cloth wound round the shins (from the ankle to under the knee) and the forearms (from the wrist halfway up),
    // a tight layer and the strips crossing over it, the top edges frayed
    const WR=(x,y,z)=>DC(x,y,z)-.13,wrapPaint=(p,t)=>{const w=noise(p[0]*7,p[1]*7,p[2]*7),st=fbm(p[0]*.6,p[1]*.6,p[2]*.6);return mixc(mixc(C.wrap,C.wrapD,.35*w),C.dirt,sm((st-.5)/.2)*.35)};
    const shinTop=(p,s)=>9.25+.35*(noise(p[0]*3+s,p[2]*3,1)-.5),foreU=(p,sd)=>{const el=bp('avambraccio'+sd),d=aDir(sd==='S'?1:-1);return dot(sub(p,el),d)/ARM.L2};
    const wrKeep=p=>{const[x,y,z]=p;if(Math.abs(x)<.9)return false;const s=x>0?1:-1,sd=s>0?'S':'D';
      if(y<9.8)return y>2.5&&y<shinTop(p,s);const u=foreU(p,sd);return Math.abs(x)>5&&u>.5+.06*(noise(x*3,y*3,z)-.5)&&u<1.07};
    put(WR,[-11.2,2.2,-3.0,11.2,26.5,3.0],.19,wrKeep,(p,n)=>{const e=edge(wrKeep,p,.2);return{c:mixc(wrapPaint(p),C.wrapD,.4*e),k:K(2.2,0,.8),ao:e*.06}},skinW,.5,.3);
    // the strips: two helices crossing round each shin and each forearm
    const strips=(a,b,turns,r0,n0,ph,wf)=>{const ax=nrm(sub(b,a)),f=frameOf(ax);for(const dirS of[1,-1]){const P=[],N=[];const NS=Math.round(turns*28);
        for(let i=0;i<=NS;i++){const t=i/NS,th=ph+dirS*t*turns*TAU,c=lerp3(a,b,t),dd=add(mul(f.ex,Math.cos(th)),mul(f.ey,Math.sin(th))),q=onSkin(WR,add(c,mul(dd,r0))),nn=normal(WR,q);P.push(add(q,mul(nn,.015)));N.push(nn)}
        ribbon(cloth,P,N,(t,i)=>.24*(1-.25*sm((t-.93)/.07))*(1+.12*(noise(i*.3,dirS,n0)-.5)),.06,(q,t)=>({c:mixc(wrapPaint(q,t),C.wrapD,.15+.25*noise(q[0]*9,q[1]*9,q[2]*9)),k:K(2.2,0,.55),w:wf(q)}))}};
    for(const s of[1,-1]){const sd=s>0?'S':'D',kn=bp('stinco'+sd),an=bp('piede'+sd),A=lerp3(an,kn,.07),Bq=lerp3(an,kn,.73);strips(A,Bq,3.4,2.2,s,s*.7,skinW);
      const el=bp('avambraccio'+sd),wr=bp('mano'+sd);strips(lerp3(el,wr,.53),lerp3(el,wr,1.03),2.2,1.8,s+4,1.3,skinW)}
    // · the red cloth tied round his left arm, the knot outside and two tails
    {const sh=bp('braccioS'),el=bp('avambraccioS'),d=aDir(1),[X,Y,Zf]=limbAx(d,1),c0=lerp3(sh,el,.42),P=[],N=[];
      for(let i=0;i<=40;i++){const t=i/40,th=t*TAU*1.15-.4,dd=add(mul(X,Math.cos(th)),mul(Zf,Math.sin(th))),q=onSkin(D,add(add(c0,mul(Y,(t-.5)*.25)),mul(dd,1.6))),nn=normal(D,q);P.push(add(q,mul(nn,.06)));N.push(nn)}
      const redP=(q,t)=>({c:mixc(C.red,C.redD,.3*noise(q[0]*6,q[1]*6,q[2]*6)+.2*sm((t-.8)/.2)),k:K(2.2,0,.7),w:[[bi('braccioS'),1]]});
      ribbon(cloth,P,N,.3,.09,redP);
      const kc=add(onSkin(D,add(c0,mul(X,1.6))),mul(X,.2));ball(cloth,kc,[.24,.22,.2],10,7,()=>({c:C.red,k:K(2.2,0,.7),w:[[bi('braccioS'),1]]}));
      for(const[dx,L] of[[-.12,1.0],[.14,1.35]]){const Q=[],NN=[];for(let i=0;i<=8;i++){const t=i/8;Q.push(add(add(kc,mul(Y,t*L)),add(mul(X,.12+.25*t),mul(Zf,dx-.1*t*t))));NN.push(nrm(add(X,mul(Zf,-.3))))}
        ribbon(cloth,Q,NN,t=>.15*(1-.5*t)+.03*saw(t*5),.05,redP)}}
    // · the rope: three strands twisted, wound twice round the waist over the tunic, the big knot in front on his right, two ends hanging
    // with a little knot and a frayed tassel each
    const RR=.33,ropePaint=(L,w)=>(q,t,an)=>{const ph=3*an-6*Math.PI*t*L/1.25,v=.5+.5*Math.cos(ph);return{c:mixc(C.ropeD,mixc(C.rope,hex('#c9b38c'),.25*noise(q[0]*5,q[1]*5,q[2]*5)),sm((v-.12)/.35)),k:K(2.2,0,.75),w:w(q)}};
    const onTu=(x,y,z0)=>{const q=onSkin(TU,[x,y,z0]),n=normal(TU,q);return{q,n}},bw=()=>[[bi('bacino'),1]];
    const KA=-.5,knot=(()=>{const d=[Math.sin(KA),0,Math.cos(KA)],{q,n}=onTu(d[0]*4.5,24.62,d[2]*4.5);return{p:add(q,mul(n,.42)),n}})();
    for(let k=0;k<2;k++){const P=[];for(let i=0;i<=96;i++){const a=KA+i/96*TAU,y=24.92-.56*k+.1*Math.sin(a+.5+k*1.7),d=[Math.sin(a),0,Math.cos(a)],{q,n}=onTu(d[0]*5,y,d[2]*5);P.push(add(q,mul(n,RR-.06)))}
      let L=0;for(let i=1;i<P.length;i++)L+=len(sub(P[i],P[i-1]));tube(cloth,P,P.map(()=>RR),9,ropePaint(L,bw),{cap0:'open',cap1:'open'})}
    // the knot: a fat lump of rope with two loops round it
    ball(m,knot.p,[.56,.5,.44],12,9,(q,d)=>({c:mixc(C.ropeD,C.rope,.55+.45*Math.cos(Math.atan2(d[1],d[0])*5+d[2]*4)),k:K(2.2,0,.8),w:bw()}));
    {const f=frameOf(knot.n);for(const[tilt,r0] of[[.5,.4],[-.7,.36]]){const P=[];for(let i=0;i<=20;i++){const th=i/20*TAU,ax=nrm(add(f.ex,mul(f.ey,tilt)));
        P.push(add(knot.p,add(mul(ax,Math.cos(th)*r0),mul(knot.n,Math.sin(th)*r0*.55+.06))))}tube(m,P,P.map(()=>.17),8,ropePaint(2.4,bw),{cap0:'open',cap1:'open'})}}
    // the two ends hanging over the skirts, each with its little knot and its tassel of loose fibres
    for(const[dx,len0,dz] of[[-.12,3.4,.05],[.28,4.9,.12]]){const P=[];for(let i=0;i<=24;i++){const t=i/24,y=knot.p[1]-.2-t*len0,x=knot.p[0]+dx*t+.12*Math.sin(t*3),{q,n}=onTu(x,y,6);
        P.push(add(q,mul(n,.22+dz+.08*t)))}
      let L=0;for(let i=1;i<P.length;i++)L+=len(sub(P[i],P[i-1]));tube(cloth,P,P.map((_,i)=>.21-.02*i/24),8,ropePaint(L,bw),{cap0:'open',cap1:'open'});
      const kp=P[20];ball(m,kp,[.3,.28,.27],10,8,(q,d)=>({c:mixc(C.ropeD,C.rope,.5+.5*Math.cos(Math.atan2(d[1],d[0])*4+d[2]*3)),k:K(2.2,0,.8),w:bw()}));
      const end=P[24];for(let j=0;j<9;j++){const a=j/9*TAU,dd=nrm([Math.cos(a)*.35,-1,Math.sin(a)*.35+.1]),Lf=.55+.35*hash(j+dx*10);
        tube(cloth,[end,add(end,mul(dd,Lf*.5)),add(add(end,mul(dd,Lf)),[(hash(j)-.5)*.2,0,0])],[.09,.07,.02],5,()=>({c:mixc(C.rope,hex('#c4ad86'),.4*hash(j)),k:K(2.2,0,.5),w:bw()}),{cap0:'open',cap1:'point',tip:.5})}}
    // · the leather pouch on his left hip, hanging from the rope: a soft bag, the flap with its stitches, a toggle, the strap round the rope
    {const {q:base,n:bn}=onTu(3.55,22.85,5.5),u0=nrm(sub([0,1,0],mul(bn,bn[1]))),w0=nrm(cross(u0,bn)),c0=add(base,mul(bn,.4));
      const rbox=(c,hs,rr,ax)=>({c,r:Math.hypot(...hs)+rr,f:(x,y,z)=>{const d=[x-c[0],y-c[1],z-c[2]],l=[Math.abs(dot(d,ax[0]))-hs[0],Math.abs(dot(d,ax[1]))-hs[1],Math.abs(dot(d,ax[2]))-hs[2]];
        return len(l.map(v=>Math.max(v,0)))+Math.min(Math.max(l[0],l[1],l[2]),0)-rr}});
      const AX=[w0,u0,bn],BAG=Sculpt().add(rbox(c0,[.56,.62,.14],.26,AX)).add(ell(add(c0,mul(u0,-.4)),[.72,.46,.36],AX),.2),
        FL=Sculpt().add(rbox(add(add(c0,mul(u0,.4)),mul(bn,.38)),[.62,.27,.0],.07,AX)),FD=(x,y,z)=>FL.d(x,y,z),BD=(x,y,z)=>BAG.d(x,y,z);
      const bagP=(F,dark)=>(p,n)=>{const st=noise(p[0]*6,p[1]*6,p[2]*6),e=Math.abs(dot(sub(p,c0),w0))>.62||dot(sub(p,c0),u0)<-.62?1:0;return{c:mixc(mixc(C.leath,C.leathD,.25*st+dark),hex('#8a5a39'),.15*sm((st-.6)/.2)),k:K(4,0,1),ao:.08*e}};
      for(const[F,bx,dark] of[[BD,1.25,0],[FD,1.0,.1]]){const r=nets(F,[c0[0]-1.6,c0[1]-1.6,c0[2]-1.6,c0[0]+1.6,c0[1]+1.6,c0[2]+1.6],.075*HQ),o0=m.P.length/3,pt=bagP(F,dark);
        for(let i=0;i<r.P.length/3;i++){const p=[r.P[i*3],r.P[i*3+1],r.P[i*3+2]],n=normal(F,p),pa=pt(p,n),v=m.v(p,n,pa.c,pa.k,[[bi('bacino'),.75],[bi('cosciaS'),.25]]);m.K[v*4+2]=cl(occl(F,p,n)*.6+pa.ao,0,.8)}
        for(let t=0;t<r.I.length;t+=3)m.t(o0+r.I[t],o0+r.I[t+1],o0+r.I[t+2])}
      const tg=add(add(c0,mul(u0,.12)),mul(bn,.52));tube(m,[add(tg,mul(w0,-.2)),add(tg,mul(w0,.2))],[.07,.07],6,()=>({c:hex('#cdbb9a'),k:K(5,0,.6),w:[[bi('bacino'),1]]}),{cap0:'ball',cap1:'ball'});
      for(const sx of[-.32,.32]){const P=[],N=[];for(let i=0;i<=8;i++){const t=i/8,c=add(add(c0,mul(w0,sx)),mul(u0,.55+t*1.1));const{q,n}=onTu(c[0],c[1],6);P.push(add(q,mul(n,.06+.5*Math.sin(t*Math.PI)*(t>.5?1:.6))));N.push(n)}
        ribbon(m,P,N,.12,.05,()=>({c:C.leathD,k:K(4,0,.6),w:[[bi('bacino'),1]]}))}}
    // · the thin dark cord round his neck with an iron ring hanging on the chest (over the tunic where the tunic is)
    {const P=[],N=[];for(let i=0;i<=60;i++){const a=-Math.PI+i/60*TAU,y=35.45-2.15*Math.pow(Math.cos(a/2),4),d=[Math.sin(a),0,Math.cos(a)];let q=onSkin(D,add([0,y,-.3],mul(d,2.6))),n=normal(D,q);
        const t=add(q,mul(n,.45));if(Math.abs(TU(t[0],t[1],t[2]))<.35&&tuKeep(t)){const r=onSkin(TU,t);q=r;n=normal(TU,r)}P.push(add(q,mul(n,.06)));N.push(n)}
      tube(m,P,P.map(()=>.045),5,(q)=>({c:C.cord,k:K(4,0,.45),w:skinW(q)}),{cap0:'open',cap1:'open'});
      const P0=P[30],n0=N[30],f=frameOf(n0),rc=add(add(P0,[0,-.44,0]),mul(n0,.07)),R=[];for(let i=0;i<=24;i++){const th=i/24*TAU;R.push(add(rc,add(mul(f.ex,Math.cos(th)*.38),mul([0,1,0],Math.sin(th)*.38))))}
      tube(m,R,R.map(()=>.075),7,()=>({c:C.iron,k:K(7,0,.6),w:[[bi('petto'),1]]}),{cap0:'open',cap1:'open'})}
  }
  const M=K3D.pack(K3D.skel(BN,PAR,B0,CHAINS),[[m,0],[cloth,1]]);M.nets=NETS;return M}
// ---------------------------------------------------------------- the moves: natural, with weight (each depends only on p, 0..1)
// o.look: where you are, seen from him (radians round the up axis, 0 = in front): in «Fermo» and «Saluta» he turns his head to you
const MOSSE={posa:{n:'Posa del disegno',dur:4,loop:1},fermo:{n:'Fermo',dur:6,loop:1},cammina:{n:'Cammina',dur:1.15,loop:1},corre:{n:'Corre',dur:.72,loop:1},
  guarda:{n:'Si guarda intorno',dur:5},saluta:{n:'Saluta',dur:2.6},pugno:{n:'Pugno',dur:1.3},colpito:{n:'Colpito',dur:.9},muore:{n:'Muore',dur:3.2,hold:1}};
const SEQ=['posa','fermo','cammina','corre','guarda','saluta','pugno','colpito','muore'];
const wrap=x=>((x%1)+1)%1,snap=(p,k0,k1,k2,k3)=>p<k0?0:p<k1?sm((p-k0)/(k1-k0)):p<k2?1:1-sm((p-k2)/(k3-k2));
const SHR=s=>[4.55*s,3.3,.1];// the shoulder, seen from the chest
// the ankle for a foot whose contact point (the ball for r > 0, the heel for r < 0) stays on the ground where it would be with the foot flat
// and the ankle at zc: a real foot rolls over the heel and over the ball, it does not pivot on the ankle
function ankleAt(zc,r){const c=r>=0?BALL:HEEL,cy=c[1],cz=c[2],co=Math.cos(r),si=Math.sin(r);return[ANK+cy-(cy*co-cz*si),zc+cz-(cy*si+cz*co)]}
function pose(id,p,o){o=o||{};p=cl(p,0,1);const ph=p*TAU,sp={root:{p:[0,0,0],q:Q0()},r:{},arm:{},leg:{},emK:1};const R=sp.r,look=cl(o.look||0,-1.1,1.1);
  const turn=(b,q)=>{R[b]=R[b]?qmul(R[b],q):q};
  const curl=(sd,k,kt)=>{const s=sd==='S'?1:-1,H=HP[sd],ax=mul(H.w,-s);turn('dita'+sd,qax(ax,k*.9));turn('punte'+sd,qax(ax,(kt===undefined?k:kt)*1.15))};
  const arm=(sd,t,pole,wrist,rel)=>{const s=sd==='S'?1:-1;sp.arm[sd]={t,rel:rel||'petto',pole:pole||[.5*s,-.6,-1],wrist:wrist||Q0()}};
  const swingArm=(sd,a,reach,out,fw)=>{const s=sd==='S'?1:-1,d=nrm([(out===undefined?.14:out)*s,-Math.cos(a),Math.sin(a)]);arm(sd,add(add(SHR(s),mul(d,reach||12.7)),[0,0,fw||0]))};
  const foot=(sd,x,zc,r,lift,yaw,toe)=>{const s=sd==='S'?1:-1,[ay,az]=ankleAt(zc,r);sp.leg[sd]={t:[x*s,ay+(lift||0),az-.35],foot:qq(ry((yaw||0)*s),rx(r))};
    if(toe!==undefined)turn('punta'+sd,qax(nrm(cross([0,1,0],fDir(s))),toe))};
  const stand=(sd,x,z,r)=>foot(sd,x,z||0,r||0,0,0,r>0?-r:0);
  // a step of a gait: the stance (heel strike, foot flat, heel off rolling on the ball with the toes flat), then the swing (toes off, the foot
  // flies forward in an arc with the toes up, lands on the heel). S half the stride, st the part on the ground, H how high
  const step=(sd,q,S,st,H,x,kick)=>{q=wrap(q);if(q<st){const u=q/st,zc=S-2*S*u,r=u<.13?-.28*(1-u/.13):u>.6?.62*sm((u-.6)/.4):0;foot(sd,x,zc,r,0,0,r>0?-r:0);return}
    const v=(q-st)/(1-st),A0=ankleAt(-S,.62),A1=ankleAt(S,-.28),e=ez(v),r=lerp(.62,-.28,sm(v))-.18*Math.sin(Math.PI*v),s=sd==='S'?1:-1;
    sp.leg[sd]={t:[x*s,lerp(A0[0],A1[0],e)+H*Math.pow(Math.sin(Math.PI*v),.8)+(kick||0)*Math.pow(Math.sin(Math.PI*Math.min(1,v*1.6)),2),lerp(A0[1],A1[1],e)-(kick||0)*.5*Math.sin(Math.PI*Math.min(1,v*1.4))-.35],foot:rx(r)};
    turn('punta'+sd,qax(nrm(cross([0,1,0],fDir(s))),-.62*(1-sm(v/.35))+.12*sm((v-.6)/.4)))};
  const breathe=(k)=>{const b=Math.sin(ph*(MOSSE[id]&&MOSSE[id].loop?Math.max(1,Math.round(MOSSE[id].dur/4)):1));turn('petto',rx(-.018*b*k));for(const sd of['S','D'])turn('spalla'+sd,rz((sd==='S'?1:-1)*.012*b*k));return b};
  const headTo=(g,tilt)=>{turn('collo',ry(look*.35*g));turn('testa',qq(ry(look*.5*g),rx(tilt||0)))};
  switch(id){
  case 'posa':{// the pose of the picture: standing straight, the arms a little away from the body, breathing
    breathe(1);for(const sd of['S','D']){const s=sd==='S'?1:-1;arm(sd,sub(bp('mano'+sd),bp('petto')),[.5*s,-.6,-1]);stand(sd,3.0,0,0)}break}
  case 'fermo':{// at rest, the weight on his right leg (the hips drop on the other side, the shoulders answer), the left knee loose, the arms
    // hanging; breathing, a slow sway to keep his balance; after a while he turns his head to you, looks, and turns back
    const b=breathe(1),sw=Math.sin(ph),sw2=Math.sin(ph*2+1);sp.root.p=[-.42+.06*sw,-.14+.03*sw2,.05*Math.sin(ph+1.3)];
    turn('bacino',qq(rz(-.055),ry(.05)));turn('schiena',rz(.02));turn('petto',rz(.03));
    stand('D',2.75,-.1,0);foot('S',3.35,.55,.07,0,.12,-.07);
    for(const sd of['S','D']){const s=sd==='S'?1:-1;swingArm(sd,.05+.02*sw*s,12.55,.11,.15);curl(sd,.3+.04*Math.sin(ph*2+s),.32)}
    const g=snap(p,.3,.42,.72,.88);headTo(g,.03*Math.sin(ph*2));turn('testa',rz(.04*(1-g)));break}
  case 'cammina':{// a real walk: the heel down first and the toes last, the weight going from one foot to the other (the hips over the foot
    // that holds him, the other side dropping), the hips turning with the legs and the shoulders against them, the arms swinging the other
    // way and bending forward, the head steady. Both feet go back at the same speed on the ground (2·6/(.62·1.15) = 16.8 a second)
    const S=6,st=.62;step('D',p,S,st,1.25,2.25);step('S',p+.5,S,st,1.25,2.25);
    const bob=-.5+.3*Math.cos(4*Math.PI*(p-st/2)),shx=-.28*Math.cos(TAU*(p-st/2));sp.root.p=[shx,bob,0];
    turn('bacino',qq(ry(.11*Math.cos(ph)),rz(-.045*Math.cos(TAU*(p-st/2)))));turn('schiena',rx(.035));turn('petto',qq(ry(-.17*Math.cos(ph-.15)),rz(.02*Math.cos(TAU*(p-st/2)))));
    turn('collo',ry(.06*Math.cos(ph)));turn('testa',rx(-.03+.02*Math.cos(4*Math.PI*p)));
    for(const sd of['S','D']){const s=sd==='S'?1:-1,a=.34*Math.cos(ph+.3+(s>0?0:Math.PI)),fw=Math.max(0,a);swingArm(sd,a,12.7-2.2*fw,.13,0);curl(sd,.32+.12*fw,.36)}break}
  case 'corre':{// running: a flight between the steps, the knee driving up in front and the heel kicking up behind, bent forward, the arms bent
    // and pumping
    const S=7.2,st=.36;step('D',p,S,st,2.6,2.1,3.2);step('S',p+.5,S,st,2.6,2.1,3.2);
    sp.root.p=[-.18*Math.cos(TAU*(p-st/2)),-.95+.55*Math.cos(4*Math.PI*(p-st/2-.04)),.6];turn('bacino',qq(rx(.12),ry(.14*Math.cos(ph))));turn('schiena',rx(.1));turn('petto',qq(rx(.06),ry(-.22*Math.cos(ph-.2))));
    turn('collo',rx(-.08));turn('testa',rx(-.1));
    for(const sd of['S','D']){const s=sd==='S'?1:-1,a=.55*Math.cos(ph+.4+(s>0?0:Math.PI));swingArm(sd,a+.35,8.6,.18,0);curl(sd,.85,.9)}break}
  case 'guarda':{// wary: he turns his head and his shoulders to his left, looks, then to his right, looks, and back; the hips follow a little
    const L=snap(p,.06,.2,.38,.5),Rr=snap(p,.5,.62,.8,.94),y=.95*L-.95*Rr,b=breathe(1);sp.root.p=[-.2*y*.3-.15,-.12,0];
    turn('bacino',ry(y*.12));turn('schiena',ry(y*.12));turn('petto',ry(y*.22));turn('collo',ry(y*.28));turn('testa',qq(ry(y*.38),rx(.06*(L+Rr))));
    stand('D',2.8,-.15,0);stand('S',3.1,.35,0);for(const sd of['S','D']){const s=sd==='S'?1:-1;swingArm(sd,.04,12.55,.12,.1);curl(sd,.35+.25*(L+Rr),.4)}break}
  case 'saluta':{// he raises his right hand and waves to you, then lowers it
    const up=snap(p,.05,.25,.78,.96),wv=Math.sin((p-.2)/.6*TAU*2.5)*snap(p,.22,.3,.72,.8),b=breathe(1);sp.root.p=[-.25,-.12,0];
    turn('bacino',rz(-.04));turn('petto',qq(rz(.04*up),ry(.08*up)));headTo(.5+.5*up,-.04*up);turn('testa',rz(-.08*up));
    stand('D',2.8,-.1,0);stand('S',3.15,.3,0);swingArm('S',.04,12.55,.11,.1);curl('S',.32,.35);
    arm('D',lerp3(add(SHR(-1),[-.6,-12.4,.6]),add(SHR(-1),[-3.8+1.3*wv,4.6,3.2]),up),[-.6,-.9,-.4],rz(-.4*wv*up));curl('D',.3*(1-up)+.06,.3*(1-up)+.08);break}
  case 'pugno':{// guard up, a step in with the left foot, the right fist straight to your face with the hips and the shoulders turning into it,
    // the impact, then back
    const g=snap(p,0,.18,.7,.95),ex=snap(p,.25,.38,.5,.66),st=snap(p,.18,.3,.62,.86),turnK=ex*.42+g*.12;
    sp.root.p=[-.15,-.6*g-.25*ex,-.4*g*(1-st)+1.3*st];turn('bacino',ry(-turnK*.6));turn('schiena',rx(.08*g));turn('petto',qq(ry(-turnK),rx(.06*ex)));turn('testa',qq(ry(turnK*.7),rx(.05*g)));
    stand('D',2.7,-.5*g-.4*st,.35*ex);foot('S',2.9,.5+2.2*st,0,1.1*Math.sin(Math.PI*cl((p-.18)/.14,0,1))*(p<.32?1:0),.1,0);
    arm('S',lerp3(add(SHR(1),[.4,-12.4,.5]),[1.9,3.4,6.0],g),[.6,-.9,-.6]);arm('D',lerp3(lerp3(add(SHR(-1),[-.4,-12.4,.5]),[-1.7,3.6,5.6],g),[-.4,4.6,12.6],ex),[-.6,-.8,-.4],rx(-.15*ex));
    curl('S',.3+1.2*g,.35+1.25*g);curl('D',.3+1.25*g,.35+1.3*g);break}
  case 'colpito':{// a blow to the face: the head snaps back and round, the chest back, a step back to keep his balance, the arms flung, then back
    const b=p<.14?sm(p/.14):Math.exp(-(p-.14)*5.5)*Math.cos((p-.14)*10),bb=cl(b,0,1),bs=sm(p/.25)*(1-sm((p-.55)/.4));
    sp.root.p=[-.2,.1*bb-.2,-1.3*bb-.5*bs];turn('schiena',rx(-.24*b));turn('petto',rx(-.16*b));turn('collo',qq(rx(-.2*b),rz(.18*b)));turn('testa',qq(rx(-.42*b),rz(.3*b)));
    stand('D',2.8,-.1,0);foot('S',3.1,.3-2.6*bs,0,.9*Math.sin(cl(p/.25,0,1)*Math.PI)*(p<.25?1:0),.1,0);
    for(const sd of['S','D']){const s=sd==='S'?1:-1;arm(sd,lerp3(add(SHR(s),[.4*s,-12.4,.5]),add(SHR(s),[4.5*s,-7.5,-2.5]),bb),[.5*s,-.6,-.6]);curl(sd,.3-.25*bb)}break}
  case 'muore':{// hit in the chest: his hand goes to it, his knees give way one after the other and he drops onto them (the shins flat on the
    // ground), sways, and falls forward onto his face, pivoting on his knees, the head turned aside
    const hit=p<.1?sm(p/.1):p<.2?1-sm((p-.1)/.1):0,kS=sm((p-.14)/.17),kD=sm((p-.21)/.17),kn=(kS+kD)/2,sway=Math.sin(cl((p-.38)/.12,0,1)*Math.PI),
      fa=cl((p-.49)/.27,0,1),fall=fa*fa*(1.6-.6*fa),bump=p>.76?Math.sin(cl((p-.76)/.1,0,1)*Math.PI)*.06*(1-sm((p-.86)/.06)):0,A=1.36*fall-bump-.08*sway*(1-fall);
    const Kb=[0,11.55,.05],zz=-.9*hit+.5*kn,Pk=[0,11.55-10.65*kn,.05+zz],Rq=rx(A),rp=sub(Pk,qrot(Rq,Kb));sp.root.p=rp;sp.root.q=Rq;
    turn('bacino',rx(-.12*kn*(1-fall)));turn('schiena',rx(-.25*hit+.18*kn*(1-fall)-.1*sway));turn('petto',rx(.1*kn*(1-fall)));
    turn('collo',qq(ry(.35*fall),rx(-.25*fall)));turn('testa',qq(rx(-.4*hit+.25*kn*(1-fall)-.2*fall),ry(1.05*fall),rz(.2*kn*(1-fall))));
    for(const sd of['S','D']){const s=sd==='S'?1:-1,k=sd==='S'?kS:kD,zw=.05+zz-9.4*k;sp.leg[sd]={t:[2.6*s,ANK+(1.1-ANK)*k+1.6*Math.sin(k*Math.PI),zw-rp[2]],foot:qmul(rx(-A),rx(Math.PI*.92*k))};
      turn('punta'+sd,qax(nrm(cross([0,1,0],fDir(s))),-.5*k))}
    const ch=snap(p,.04,.14,.42,.55);arm('D',lerp3(lerp3(add(SHR(-1),[-.4,-12.4,.5]),[-.9,.2,3.2],ch),[-6.4,-9.8,-2.2],fall),[-.5,-.8,-.2]);
    arm('S',lerp3(lerp3(add(SHR(1),[.4,-12.4,.5]),[6*1,-10.2,1.6],kn),[6.4,-9.8,-2.2],fall),[.5,-.8,-.2]);curl('S',.5);curl('D',.5+.4*ch);
    sp.emK=1;break}
  default:for(const sd of['S','D']){const s=sd==='S'?1:-1;arm(sd,sub(bp('mano'+sd),bp('petto')));stand(sd,3.0,0,0)}}
  return sp}
const solve=(M,sp)=>K3D.solve(M.skel,sp),mix=K3D.mix,joints=(M,P,out)=>K3D.joints(M.bind,P,out);
const VI3={build,body,solve,mix,joints,pose,MOSSE,SEQ,BN,BI,bindPose,HEAD,C,handPts,sm,ez,cl,lerp,TAU};
if(typeof module!=='undefined'&&module.exports)module.exports=VI3;else root.VI3=VI3;
})(typeof window!=='undefined'?window:this);
