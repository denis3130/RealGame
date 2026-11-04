// Mossbound · lo Zombie minatore in 3D vero, fatto con la formula (sprite/mostri3d/LEGGIMI.md, «La formula per il 3D»; Denis, 4 novembre:
// «fammene un'altro»). È il nostro minatore di oggi (CR.minatore di sprite/mostri/disegno_mostri.js, che non cambia): il corpo degli zombie con
// la camicia grigia e la salopette di jeans (pettorina con la tasca, bretelle, due bottoni d'ottone, polvere di carbone), gli stivali, il casco
// giallo con la cresta e la lampada accesa, l'occhio sinistro spento, il braccio sinistro che pende e nella mano destra il piccone arrugginito.
// Stesse misure, pezzi e colori del disegno 2D (dal rig 2D, x avanti, y a destra, z in su, qui [-y, z, x]: x a sinistra, y in su, z davanti).
// I pezzi comuni vengono da sprite/mostri3d/kit3d.js; lo disegna sprite/mostri3d/mb3.js (il ferro è la materia 7, 7.2 il metallo dipinto del casco, 8 il legno).
// ZMI3.build(), ZMI3.solve(M, ZMI3.pose(mossa, p, {look})), ZMI3.mix, ZMI3.joints, ZMI3.MOSSE come lo zombie base; ZMI3.tip(M, posa) e
// ZMI3.lamp(M, posa) dicono dove sono la punta del piccone e la lampada (le scintille e la luce a terra della pagina).
(function(root){'use strict';
const K3D=(typeof root.K3D!=='undefined'&&root.K3D)||(typeof require==='function'?require('./kit3d.js'):null);
const {TAU,cl,lerp,sm,ez,add,sub,mul,dot,cross,len,nrm,lerp3,hash,hex,mixc,Q0,qmul,qax,qrot,qframe,rx,ry,rz,qq,ik,stepper,K,frameOf,Mesh,tube,ball}=K3D;
const Z=K3D.ZC;
// the colours of the miner of today (MC of disegno_mostri.js), plus the dark of the soles, the rust and the glass of the lamp
const MC={helm:hex('#d9a628'),helmD:hex('#9a7418'),over:hex('#3e5a7a'),overD:hex('#2a3e56'),shirt:hex('#6a6458'),shirtD:hex('#4e4a42'),boot:hex('#3a2a1a'),sole:hex('#1a120c'),
  wood:hex('#6b4a2a'),woodD:hex('#4a321c'),iron:hex('#8a9098'),ironD:hex('#5a6068'),rust:hex('#7a3c1e'),button:hex('#c9a040'),lamp:hex('#5a5f68'),glass:hex('#fff6c8')};
// ---------------------------------------------------------------- the measures of the drawing of today
const ARM={L1:6,L2:6.2},LEG={L1:3.85,L2:4},PV=[0,12.4,0],CH=[0,20.2,2.6],HC=[0,31.2,5.4],HR=8,ANK=2,RP=6.3,RC=8.2;
const aDir=s=>nrm([.34*s,-1,.22]);
// the pick, like pose(a) of the drawing: the right hand goes round a point beside the right shoulder (a = 0 forward, π/2 straight up, more
// than π/2 behind the head); dir: the handle, u: the iron head (a little turned outwards, so it is never seen edge-on). Places from the chest
const pickRel=a=>{const c=Math.cos(a),sn=Math.sin(a),d2=nrm([c*.95,.14,sn]),u2=nrm([-d2[2]*.75,.66,d2[0]*.75]);return{hd:[-10.6,1+sn*8.8,2.6+c*6.8],dir:[-d2[1],d2[2],d2[0]],u:[-u2[1],u2[2],u2[0]]}};
// ---------------------------------------------------------------- the skeleton (the base zombie's: S = his left, +x; D = his right, -x)
const BN=['root','bacino','schiena','petto','collo','testa','mascella','spallaS','braccioS','avambraccioS','manoS','ditaS','punteS',
  'spallaD','braccioD','avambraccioD','manoD','ditaD','punteD','cosciaS','stincoS','piedeS','cosciaD','stincoD','piedeD'];
const BI={};BN.forEach((n,i)=>{BI[n]=i});
const PAR={bacino:'root',schiena:'bacino',petto:'schiena',collo:'petto',testa:'collo',mascella:'testa'};
for(const sd of['S','D']){Object.assign(PAR,{['spalla'+sd]:'petto',['braccio'+sd]:'spalla'+sd,['avambraccio'+sd]:'braccio'+sd,['mano'+sd]:'avambraccio'+sd,['dita'+sd]:'mano'+sd,
  ['punte'+sd]:'dita'+sd,['coscia'+sd]:'bacino',['stinco'+sd]:'coscia'+sd,['piede'+sd]:'stinco'+sd})}
function bindPose(){const P={root:[0,0,0],bacino:PV,schiena:[0,16,1.4],petto:CH,collo:[0,25.2,3.8],testa:[0,27.1,4.6],mascella:add(HC,mul([0,-.366,.268],HR))};
  for(const s of[1,-1]){const sd=s>0?'S':'D',sh=[7.6*s,21.6,2.6],d=aDir(s);P['spalla'+sd]=[3.4*s,22.6,2.8];P['braccio'+sd]=sh;P['avambraccio'+sd]=add(sh,mul(d,ARM.L1));
    P['mano'+sd]=add(P['avambraccio'+sd],mul(d,ARM.L2));P['dita'+sd]=add(P['mano'+sd],mul(d,1.6));P['punte'+sd]=add(P['dita'+sd],mul(d,2.6));
    const hip=[3.4*s,9.1,0],an=[4.3*s,ANK,1],[kn]=ik(hip,an,LEG.L1,LEG.L2,[0,.15,1]);P['coscia'+sd]=hip;P['stinco'+sd]=kn;P['piede'+sd]=an}
  return BN.map(n=>P[n])}
const B0=bindPose(),bpos=n=>B0[BI[n]];
// the pick in the rest shape: in the right fist, the handle forward across the fist, the iron head up and down
const WR=bpos('manoD'),DR=aDir(-1),FC=add(WR,mul(DR,1.5)),HB=nrm(sub([0,0,1],mul(DR,DR[2]))),UB=nrm(sub([0,1,0],mul(HB,HB[1]))),
  TOP=add(FC,mul(HB,15)),TIPS=[add(add(TOP,mul(UB,7.2)),mul(HB,1.4)),add(add(TOP,mul(UB,-7.2)),mul(HB,1.4))];
// the lamp on the front of the helmet: where it is and where it looks, in the rest shape
const C0=add(HC,[0,HR*.5,-.5]),RD=HR*.92,LDIR=nrm([0,.5,1]),LAMP=add(C0,mul(LDIR,RD*.98)),LLOOK=nrm([0,-.22,1]);
// the limbs, solved with the IK: the left hand reaches a point near the chest or in the world and turns with the forearm; the right one holds
// the pick, so its turn is given by the move (hq, in the frame of the body); the legs like the base zombie's
const CHAINS=[];for(const sd of['S','D']){const s=sd==='S'?1:-1;
  CHAINS.push({a:'braccio'+sd,b:'avambraccio'+sd,c:'mano'+sd,g:'arm',s:sd,L1:ARM.L1,L2:ARM.L2,pole:[.6*s,-1,-.15],y0:nrm([.6*s,-.25,-1]),
    target:(ch,wp,rootP,rootQ)=>ch.rel!=='mondo'?add(wp[BI.petto],qrot(rootQ,ch.t)):ch.t,end:(ch,w1,rootQ)=>ch.hq?qmul(rootQ,ch.hq):qmul(w1,ch.wrist||Q0())});
  CHAINS.push({a:'coscia'+sd,b:'stinco'+sd,c:'piede'+sd,g:'leg',s:sd,L1:LEG.L1,L2:LEG.L2,pole:[0,.15,1],y0:[0,.15,1],
    target:(ch,wp,rootP,rootQ,sp)=>ch.rel==='corpo'?add(rootP,qrot(rootQ,ch.t)):add([rootP[0],0,rootP[2]],qrot(sp.root&&sp.root.yawQ||Q0(),ch.t)),end:(ch,w1,rootQ)=>qmul(rootQ,ch.foot||Q0())})}
// ---------------------------------------------------------------- the miner
function build(){const B=B0,m=Mesh(),cloth=Mesh(),bi=n=>BI[n],bp=n=>B[BI[n]];
  // · the head: the zombie head (zHead of kit3d.js) under the helmet: no rotten patch, no hairs, his left eye dead (an empty socket)
  K3D.zHead(m,{c:HC,R:HR,bi,eyeK:HR/8.2,rot:false,hair:false,deadEye:'S'});
  // · the helmet: yellow, a brim all round, the dome with a ridge from the front to the back, and the lamp on the front
  m.group(4);
  {const hb=bi('testa'),hw=[[hb,1]];
    ball(m,add(C0,[0,.25,0]),[RD,RD*.86,RD*1.03],36,22,(p,d)=>({c:mixc(MC.helm,MC.helmD,.15+.35*sm((-d[1]+.1)/.5)+.12*hash(Math.floor(d[0]*9)+Math.floor(d[2]*9)*13)),k:K(7.2,0,1),w:hw}));
    ball(m,add(C0,[0,-.35,.35]),[HR+1.25,.55,HR+1.45],36,6,(p,d)=>({c:mixc(MC.helmD,MC.helm,.35),k:K(7.2,0,.9),w:hw}));
    {const P=[];for(let i=0;i<=12;i++){const th=.25+i*(Math.PI-.5)/12;P.push(add(add(C0,[0,.25,0]),mul([0,Math.sin(th)*RD*.86,Math.cos(th)*RD*1.03],1.03)))}
      tube(m,P,P.map(()=>.5),7,()=>({c:MC.helmD,k:K(7.2,0,.6),w:hw}),{cap0:'ball',cap1:'ball'})}
    // the lamp: a dark ring that holds the glass, the glass that shines
    {const f=frameOf(LLOOK),a=sub(LAMP,mul(LLOOK,.5)),b=add(LAMP,mul(LLOOK,1.1));tube(m,[a,lerp3(a,b,.5),b],[2.5,2.7,2.6],16,()=>({c:MC.lamp,k:K(7,0,.9),w:hw}),{cap0:'ball',cap1:'open',up:f.ey});
      ball(m,add(b,mul(LLOOK,-.15)),[1.75,1.75,.6],14,8,()=>({c:MC.glass,k:K(9,0,0),w:hw}),{ax:[f.ex,f.ey,LLOOK]})}}
  // · the neck: short, the head sits almost on the shoulders
  m.group(2);
  {const a=[0,25.3,3.9],b=[0,28.1,4.9];tube(m,[a,lerp3(a,b,.5),b],[3.8,3.55,3.35],16,(p,t)=>({c:mixc(Z.skinD,Z.skin,.4+t*.5),k:K(1),w:t<.5?[[bi('petto'),.5-t],[bi('collo'),.5+t]]:[[bi('collo'),1.5-t],[bi('testa'),t-.5]]}),{cap0:'open',cap1:'open'})}
  // · the trunk: the grey shirt above, the jeans of the overalls below the waist (the line of the drawing), the bib on the chest with its
  // pocket, the coal dust; it closes round the neck like the base zombie's shirt and under the hips where the legs start
  cloth.group(3);
  const A=nrm(sub(CH,PV)),LC=len(sub(CH,PV)),WY=lerp(PV[1],CH[1],.45);
  const torsoW=p=>{const t=dot(sub(p,PV),A)/LC;if(t<.15)return[[bi('bacino'),1]];if(t<.55){const k=sm((t-.15)/.4);return[[bi('bacino'),1-k],[bi('schiena'),k]]}
    const k=sm((t-.55)/.45);return[[bi('schiena'),1-k],[bi('petto'),k]]};
  const bib=p=>{const d=nrm(sub(p,CH));return d[2]>.55&&d[1]<.34&&p[1]>WY-.2&&Math.abs(d[0])<.36+(.34-d[1])*.12};
  const dust=p=>sm((hash(Math.floor(p[0]*1.3)*7+Math.floor(p[1]*1.3)*13+Math.floor(p[2]*1.3)*29)-.62)/.2);
  {const ring=[[add(PV,[0,-3.9,-.2]),3.6],[add(PV,[0,-3.4,-.15]),5.3],[add(PV,[0,-2.1,-.1]),6.2],[PV,RP+.15]];
    for(const t of[.25,.5,.75])ring.push([lerp3(PV,CH,t),lerp(RP+.15,RC+.1,t)+Math.sin(t*Math.PI)*.3]);ring.push([CH,RC+.1]);
    for(const th of[.3,.6,.85,1.02])ring.push([add(CH,mul(A,(RC+.1)*Math.sin(th))),(RC+.1)*Math.cos(th)]);ring.push([add(CH,mul(A,(RC+.1)*.9)),3.95]);
    tube(cloth,ring.map(r=>r[0]),ring.map(r=>r[1]),40,(p,t)=>{const low=p[1]<WY,bb=!low&&bib(p),seam=Math.abs(p[1]-WY)<.35&&!bb;let c,k;
        if(low||bb){c=mixc(MC.over,MC.overD,.12+.35*dust(p));k=K(3,0)}else{c=mixc(MC.shirt,MC.shirtD,.15);k=K(2,0)}
        if(seam)c=mixc(c,[.08,.08,.1],.55);
        // the edge of the bib and the pocket on it: a darker seam
        if(bb){const d=nrm(sub(p,CH)),ex=Math.abs(d[0])-(.36+(.34-d[1])*.12),pk=Math.max(Math.abs(d[0])-.18,Math.abs(d[1]+.08)-.13);if(ex>-.035||Math.abs(pk)<.018)c=mixc(c,[.09,.11,.16],.6)}
        return{c,k,w:torsoW(p)}},{cap0:'ball',cap1:'open',up:[0,0,1]})}
  // the straps over the shoulders, from the corners of the bib down the back, and the two brass buttons
  for(const s of[1,-1]){const ds=[[.34*s,.36,1],[.5*s,1,.45],[.48*s,1,-.45],[.34*s,.3,-1],[.36*s,-.55,-1]].map(nrm),P=ds.map(d=>add(CH,mul(d,RC+.42)));
    tube(cloth,P,P.map(()=>.62),8,(p)=>({c:mixc(MC.over,MC.overD,.2),k:K(3,0,.7),w:torsoW(p)}),{cap0:'ball',cap1:'ball'});
    const bd=nrm([.36*s,.32,1]),bc=add(CH,mul(bd,RC+.75)),f=frameOf(bd);ball(m,bc,[1.05,1.05,.45],12,7,()=>({c:MC.button,k:K(7.2,0,.55),w:[[bi('petto'),1]]}),{ax:[f.ex,f.ey,bd]})}
  // · the arms (zArm of kit3d.js): the shirt sleeves; the left hand hangs, the right one is a fist round the handle of the pick
  for(const s of[1,-1]){const sd=s>0?'S':'D';K3D.zArm(m,cloth,{s,sd,sh:bp('braccio'+sd),el:bp('avambraccio'+sd),wr:bp('mano'+sd),d:aDir(s),L1:ARM.L1,L2:ARM.L2,bi,
    knob:nrm([.6*s,-.3,-1]),sleeveK:.4,cloth:MC.shirt,clothD:MC.shirtD,fist:s<0?{axis:HB}:null,g:10+(s>0?0:1),hg:12+(s>0?0:1)})}
  // · the pick: a long wooden handle through the fist, the curved iron head with its two points, rust; it goes with the right hand
  m.group(14);
  {const hw=[[bi('manoD'),1]],butt=sub(FC,mul(HB,4.5)),f=frameOf(HB);
    tube(m,[butt,add(butt,mul(HB,.4)),lerp3(butt,TOP,.5),add(TOP,mul(HB,-.6)),add(TOP,mul(HB,2.8))],[.82,.85,.78,.86,.8],10,(p,t)=>({c:mixc(MC.wood,MC.woodD,.25+.3*t),k:K(8,0,.85),w:hw}),{cap0:'ball',cap1:'ball',up:UB});
    const mid=add(TOP,mul(HB,2.6)),P=[TIPS[0],add(lerp3(TIPS[0],mid,.5),mul(HB,.35)),mid,add(lerp3(TIPS[1],mid,.5),mul(HB,.35)),TIPS[1]];
    tube(m,P,[.12,1.05,1.65,1.05,.12],7,(p,t)=>{const r=sm((hash(Math.floor(p[0]*2)*5+Math.floor(p[1]*2)*11+Math.floor(p[2]*2)*17)-.55)/.25);return{c:mixc(mixc(MC.iron,MC.ironD,.3+.3*Math.abs(t-.5)),MC.rust,.55*r),k:K(7,0,.8),w:hw}},{cap0:'point',cap1:'point',tip:.4,up:nrm(cross(HB,UB)),flat:[1,.7]});
    ball(m,add(TOP,mul(HB,1.2)),[1.25,1.25,1.25],10,7,()=>({c:MC.ironD,k:K(7,0,.7),w:hw}));
    ball(m,add(add(TOP,mul(UB,3.4)),mul(HB,2.2)),[.85,.85,.85],8,6,()=>({c:MC.rust,k:K(7,0,.3),w:hw}))}
  // · the legs: the jeans of the overalls down to old leather boots, flat on the ground
  for(const s of[1,-1]){const sd=s>0?'S':'D',hp=bp('coscia'+sd),kn=bp('stinco'+sd),an=bp('piede'+sd),it=bi('coscia'+sd),is=bi('stinco'+sd),ift=bi('piede'+sd);
    const legW=p=>{const ab=sub(kn,hp),t=dot(sub(p,hp),ab)/dot(ab,ab);if(t<.15)return[[bi('bacino'),.5-t*2],[it,.5+t*2]];if(t<.8)return[[it,1]];if(t<1.15){const k=sm((t-.8)/.35);return[[it,1-k],[is,k]]}return[[is,1]]};
    cloth.group(20+(s>0?0:1));const top=add(an,[0,3.3,0]);
    tube(cloth,[add(hp,[0,1.8,0]),hp,lerp3(hp,kn,.5),kn,lerp3(kn,top,.55),top],[2.6,2.62,2.5,2.35,2.25,2.3],16,(p,t)=>({c:mixc(MC.over,MC.overD,.15+.35*dust(p)),k:K(3,0),w:legW(p)}),{cap0:'open',cap1:'open'});
    m.group(20+(s>0?0:1));
    // the boot: the leather shaft up the shin, the foot with the heel and the toe, the dark sole
    tube(m,[add(an,[0,3.6,0]),add(an,[0,1.8,.1]),add(an,[0,.4,.2])],[2.45,2.4,2.35],16,(p,t)=>({c:mixc(MC.boot,[.13,.09,.06],.25*t+.25*dust(p)),k:K(4,0,1),w:t<.45?[[is,1]]:[[is,.35],[ift,.65]]}),{cap0:'open',cap1:'open'});
    const heel=add(an,[0,-.15,-1.6]),toe=add(an,[s*.15,-.35,3]);
    tube(m,[heel,lerp3(heel,toe,.35),lerp3(heel,toe,.7),toe],[2.15,2.25,2.3,2.15],16,(p,t)=>({c:p[1]<.75?MC.sole:mixc(MC.boot,[.15,.1,.07],.2),k:K(4,0,1),w:[[ift,1]]}),{cap0:'ball',cap1:'ball',up:[s,0,0]})}
  for(let i=0;i<m.P.length/3;i++)if(m.G[i]>=20&&m.P[i*3+1]<.25&&m.K[i*4]===4){m.P[i*3+1]=.25}
  // · the soft shadow where pieces meet (the helmet shades the face; a piece does not shadow itself)
  const OCC=[[HC,HR,1],[add(C0,[0,.25,0]),RD*.95,4],[CH,8.2,3],[PV,6.3,3],[lerp3(PV,CH,.5),7.3,3],[[0,26.6,4.4],3.8,2]];
  for(const s of[1,-1]){const sd=s>0?'S':'D',sh=bp('braccio'+sd),el=bp('avambraccio'+sd),wr=bp('mano'+sd),g=10+(s>0?0:1);
    for(let k=0;k<=4;k++)OCC.push([lerp3(sh,el,k/4),1.5,g]);for(let k=1;k<=4;k++)OCC.push([lerp3(el,wr,k/4),1.2,g]);OCC.push([add(wr,mul(aDir(s),2.5)),1.9,12+(s>0?0:1)]);
    const hp=bp('coscia'+sd),kn=bp('stinco'+sd),an=bp('piede'+sd),gl=20+(s>0?0:1);for(let k=0;k<=3;k++)OCC.push([lerp3(hp,kn,k/3),2.5,gl]);for(let k=1;k<=3;k++)OCC.push([lerp3(kn,an,k/3),2.3,gl]);OCC.push([add(an,[0,-.2,.8]),2.2,gl])}
  const skip=(g,gg)=>(g===1&&gg===2)||(g===2&&gg===1)||(g>=12&&g<=13&&gg===g-2)||(g===14&&gg===13)||(g===13&&gg===14),ground=(p,g)=>cl((2.5-p[1])/2.5,0,1)*.25*(g>=20?1:0);
  K3D.bake(m,OCC,skip,ground);K3D.bake(cloth,OCC,skip,ground);
  return K3D.pack(K3D.skel(BN,PAR,B,CHAINS),[[m,0],[cloth,1]])}
// ---------------------------------------------------------------- the moves (each depends only on p, 0..1: the last frame meets the first)
// o.look: where you are, seen from him (radians round the up axis, 0 = in front): the head snaps that way
const MOSSE={fermo:{n:'Fermo',dur:6,loop:1},cammina:{n:'Cammina',dur:1.6,loop:1},corre:{n:'Corre',dur:.8,loop:1},sbuca:{n:'Sbuca da terra',dur:3.4},
  urla:{n:'Urla',dur:2.3},colpo:{n:'Picconata',dur:1.9},morso:{n:'Morso',dur:1.5},colpito:{n:'Colpito',dur:.7},muore:{n:'Muore',dur:2.8,hold:1}};
const snap=(p,k0,k1,k2,k3)=>p<k0?0:p<k1?sm((p-k0)/(k1-k0)):p<k2?1:1-sm((p-k2)/(k3-k2));
function pose(id,p,o){o=o||{};p=cl(p,0,1);const ph=p*TAU,sp={root:{p:[0,0,0],q:Q0()},r:{},arm:{},leg:{},emK:1};const R=sp.r,look=cl(o.look||0,-1.2,1.2);
  const turn=(b,q)=>{R[b]=R[b]?qmul(R[b],q):q};
  const curl=(sd,k)=>{const s=sd==='S'?1:-1,d=aDir(s),fw=nrm([d[1],-d[0],0]),ax=mul(fw,-1);turn('dita'+sd,qax(ax,k*.9));turn('punte'+sd,qax(ax,k*1.05))};
  const jaw=a=>turn('mascella',rx(-a*.55));
  const arm=(sd,t,pole,wrist,rel)=>{const s=sd==='S'?1:-1;sp.arm[sd]={t,rel:rel||'petto',pole:pole||[.6*s,-1,-.15],wrist:wrist||Q0()}};
  const feet=(lS,lD)=>{sp.leg.S=lS||{t:[4.3,ANK,1]};sp.leg.D=lD||{t:[-4.3,ANK,1]}};
  // the pick at angle a: the right fist where the drawing puts it, the handle and the head turned with it; never through the floor (like the
  // drawing, the angle goes up until the lowest point of the pick is above the ground)
  const pick=(a,pole)=>{const body=sp.root.q,rp=sp.root.p,
      // where the chest is with the turns of the back given so far (the bones from the root to the chest)
      qb=qmul(body,R.bacino||Q0()),qs=qmul(qb,R.schiena||Q0()),pb=add(rp,qrot(body,PV)),ps=add(pb,qrot(qb,sub(bpos('schiena'),PV))),ch=add(ps,qrot(qs,sub(CH,bpos('schiena')))),
      at=a0=>{const k=pickRel(a0),hq=qframe(HB,UB,nrm(k.dir),nrm(k.u)),w=sub(k.hd,qrot(hq,sub(FC,WR))),pts=[TOP,...TIPS].map(q=>add(add(ch,qrot(body,k.hd)),qrot(qmul(body,hq),sub(q,FC))));return{w,hq,low:Math.min(...pts.map(q=>q[1]))}};
    let q=at(a);if(q.low<.3){let lo=a,hi=Math.PI/2;for(let i=0;i<20;i++){const md=(lo+hi)/2;if(at(md).low<.3)lo=md;else hi=md}q=at(hi)}
    sp.arm.D={t:q.w,rel:'petto',pole:pole||nrm([-.5,-1,-.4]),hq:q.hq};return q};
  switch(id){
  case 'fermo':{// still and hunched, the pick resting forward in the hand… then the head snaps round towards you, stays and slowly comes back;
    // the left hand trembles now and then
    sp.root.p=[0,Math.sin(ph)*.12,0];turn('bacino',rz(Math.sin(ph)*.025));turn('schiena',rx(.1+Math.sin(ph*2)*.012));turn('petto',rx(.06));
    const g=snap(p,.55,.574,.8,.97),tr=p>.22&&p<.31?Math.sin(p*TAU*48)*Math.sin((p-.22)/.09*Math.PI):0;
    turn('collo',qq(ry(look*.38*g),rz(.1*(1-g))));turn('testa',qq(ry(look*.62*g),rz(.24*(1-g)-.05*g),rx(.1-.16*g)));
    arm('S',[9.2,-10.2+Math.sin(ph)*.3,2.5],[.6,-1,-.1],rz(tr*.3));curl('S',.35+.05*Math.sin(ph*3)+tr*.25);
    pick(-.75+Math.sin(ph)*.05);feet();jaw(.2+Math.sin(ph*2)*.05);break}
  case 'cammina':{// a stiff lurch (the walk of disegno_mostri.js): the head lags behind each step, the pick swings low in the hand
    const st=stepper(p,.56),fL=st(0,4,1.8),fR=st(.5,4,1.8),spread=Math.abs(fL.x-fR.x)/8,bob=-spread*1.3,roll=-Math.sin(ph)*1.4;
    sp.root.p=[-roll*.4,bob,0];turn('bacino',qq(rz(-roll*.025),ry(Math.sin(ph)*.06)));turn('schiena',qq(rx(.1),rz(roll*.02)));turn('petto',qq(rx(.05),ry(-Math.sin(ph)*.08)));
    feet({t:[4.3,ANK+fL.z,1+fL.x],foot:rx(fL.up*.4)},{t:[-4.3,ANK+fR.z,1+fR.x],foot:rx(fR.up*.4)});
    const lag=Math.sin(ph-1);turn('collo',rz(lag*.06));turn('testa',qq(rz(lag*.12+.06),rx(.06+Math.cos(ph*2)*.04)));
    arm('S',[9.2,-10.2,2.5+Math.sin(ph)*2.4],[.6,-1,-.1]);curl('S',.35);pick(-.75+Math.sin(ph+.6)*.2);jaw(.25+.08*Math.sin(ph*2));break}
  case 'corre':{// bent right over, long strides, the pick held up across the body, the left hand grabbing the air in front
    const st=stepper(p,.42),fL=st(0,4.6,2.8),fR=st(.5,4.6,2.8),bob=-Math.abs(fL.x-fR.x)/9.2*1.6+Math.abs(Math.sin(ph*2))*.6;
    sp.root.p=[0,bob,0];turn('bacino',qq(rx(.12),ry(Math.sin(ph)*.12)));turn('schiena',rx(.22));turn('petto',qq(rx(.12),ry(-Math.sin(ph)*.14)));
    feet({t:[4.1,ANK+fL.z,1+fL.x],foot:rx(fL.up*.5)},{t:[-4.1,ANK+fR.z,1+fR.x],foot:rx(fR.up*.5)});turn('collo',rx(-.12));turn('testa',qq(rx(-.1),rz(.2+Math.sin(ph*2)*.05)));
    const sw=Math.sin(ph);arm('S',[8.8,1.5-sw*2,11+-sw*2],[.6,-1,0],rx(-.1));curl('S',.55-.3*sw);pick(.35+sw*.18);jaw(.55+.15*Math.sin(ph*2));break}
  case 'sbuca':{// out of the ground: first the pick, held up, comes out of the earth; then the helmet with the lamp lit, the head; the left hand
    // slaps the ground, two jerks, he stands, swings the pick down to rest and his head snaps round towards you
    const rise=p<.08?0:p<.3?.38*ez((p-.08)/.22):p<.34?.38:p<.5?.38+.2*ez((p-.34)/.16):p<.53?.58:p<.72?.58+.29*ez((p-.53)/.19):p<.9?.87+.13*ez((p-.72)/.18):1,y=-44*(1-rise);
    const tilt=.14*sm((p-.3)/.1)*(1-sm((p-.72)/.2))+.06*Math.sin(p*TAU*7)*sm((p-.34)/.05)*(1-sm((p-.7)/.05));sp.root.p=[0,y,-Math.sin(tilt)*20];sp.root.q=rx(tilt);
    const down=sm((p-.32)/.08),out=sm((p-.76)/.12),gS=[8.8,1.3,7.6];
    if(out>=1||(p>.76&&out>.5))arm('S',[9.2,-10.2,2.5],[.6,-1,-.1]);else if(down<=0)arm('S',[6.4,15+Math.sin(p*TAU*5)*.8,3.5],[.7,-.2,-1],rx(-.4));
    else{const P=add([0,y,-Math.sin(tilt)*20],CH),wUp=add(P,[6.4,15,3.5]);arm('S',lerp3(wUp,gS,down),[.6,-.7,-1],rx(.5),'mondo')}
    curl('S',p<.32?.15+.1*Math.sin(p*TAU*4):.45);
    pick(lerp(1.25+.12*Math.sin(p*TAU*3),-.75,sm((p-.82)/.14)));
    sp.leg.S={t:[4.3,ANK,1],rel:p<.9?'corpo':'terra'};sp.leg.D={t:[-4.3,ANK,1],rel:p<.9?'corpo':'terra'};
    const g=snap(p,.9,.925,1.5,2);turn('schiena',rx(.12+.2*down*(1-out)));
    turn('collo',qq(rz(.3*(1-g)),ry(look*.35*g),rx(-.15*(1-down))));turn('testa',qq(rz(.3*(1-g)),rx(-.3*(1-down)-.15*down*(1-out)+.1),ry(look*.6*g)));jaw(.4+.2*Math.sin(ph*6));break}
  case 'urla':{// back, back… then the scream: the head thrust up, the jaw wide open, the pick raised high, the left arm spread, all shaking
    const k1=sm(p/.25),k2=snap(p,.25,.36,.76,1),tb=k2*Math.sin(p*TAU*38)*.035,pre=k1*(1-k2);
    sp.root.p=[0,-.6*pre,-1*pre];turn('schiena',rx(.06-.26*pre+.18*k2+tb));turn('petto',rx(-.2*pre+.12*k2+tb));turn('collo',rx(-.25*pre-.05*k2));turn('testa',qq(rx(-.38*pre-.32*k2+tb*2),rz(tb*3)));
    arm('S',lerp3(lerp3([8.2,-4.2,8.4],[10.5,1.5,-1.5],pre),[12.4,4.5,5.5],k2),[.6,-1,-.3]);curl('S',.2+.6*pre-.15*k2);turn('spallaS',rz(-(.18*pre+.1*k2)));
    pick(lerp(lerp(-.75,-1.1,pre),1.45+tb*3,k2));feet();jaw(.15+.85*k2+tb*4);sp.emK=1+.9*k2;break}
  case 'colpo':{// the attack of the drawing: he crouches and pulls the pick back, lifts it high over his head (a little too far), smashes it
    // down, it bites the ground with a jolt (sparks), he tugs at it and pulls it out
    let a=-.75,crouch=0,lunge=0,jolt=0;
    if(p<.18){const k=ez(p/.18);a=-.75-k*.4;crouch=k*1.6}
    else if(p<.42){const k=(p-.18)/.24,ov=1+2.2*Math.pow(k-1,3)+1.2*Math.pow(k-1,2);a=-1.15+ov*3.45;crouch=1.6*(1-k)}
    else if(p<.5){const k=(p-.42)/.08;a=2.3-k*3.3;lunge=k*3}
    else if(p<.68){const k=(p-.5)/.18;a=-1;lunge=3;jolt=1-k}
    else if(p<.84){const k=(p-.68)/.16;a=-1+Math.sin(k*Math.PI*3)*.1;lunge=3-k*1.5}
    else{const k=ez((p-.84)/.16);a=-1+k*.25;lunge=1.5*(1-k)}
    const jx=jolt*Math.sin(p*400)*.5,up=sm((p-.18)/.24)*(1-sm((p-.42)/.08));
    sp.root.p=[jx*.3,-crouch-jolt*.8,lunge*.6];turn('bacino',rx(.1*crouch));turn('schiena',rx(.12+.1*crouch-.22*up+.3*sm((p-.42)/.08)*(1-sm((p-.84)/.16))));turn('petto',rx(-.1*up+.1*lunge/3));
    turn('testa',rx(-.12*up+.14*lunge/3));
    arm('S',lerp3([9.2,-8,-.5],[9,-6,8],sm((p-.42)/.08)*(1-sm((p-.84)/.16))),[.6,-1,.1]);curl('S',.4+.3*sm((p-.42)/.08));
    pick(a);feet(null,{t:[-4.3,ANK+Math.max(0,Math.sin(cl((p-.36)/.14,0,1)*Math.PI))*1.6,1+cl(lunge,0,3)*1.2]});jaw(p>.35&&p<.6?.9:.25);break}
  case 'morso':{// he pulls back with the jaw wide open… snaps forward and bites, shakes his head as he tears, and comes back; the pick held low
    const pr=sm(p/.42),st=snap(p,.42,.5,.72,1),bk=pr*(1-st),sh=p>.5&&p<.7?Math.sin((p-.5)/.2*TAU*3)*sm((p-.5)/.03)*(1-sm((p-.66)/.04)):0;
    sp.root.p=[0,-.5*bk,-1.6*bk+3.4*st];turn('schiena',rx(.06-.2*bk+.36*st));turn('petto',rx(-.14*bk+.24*st));turn('collo',rx(-.28*bk+.18*st));turn('testa',qq(rx(-.34*bk+.36*st),ry(sh*.22),rz(.15*bk)));
    arm('S',[7.4-2*st,-1+1.2*bk,10.5+2.5*st],[.6,-1,-.1]);curl('S',.2+.75*st);pick(-.85-.25*bk);
    feet(null,{t:[-4.3,ANK+Math.max(0,Math.sin(cl((p-.4)/.18,0,1)*Math.PI))*1.2,1+2.6*st]});jaw(p<.47?pr:p<.5?pr*(1-sm((p-.47)/.03)):.15+.2*(1-st));break}
  case 'colpito':{// a jolt back, the head whipping round, the pick swinging up, then back with a wobble
    const b=p<.16?sm(p/.16):Math.exp(-(p-.16)*6.5)*Math.cos((p-.16)*13);
    sp.root.p=[0,0,-1.8*b];turn('schiena',rx(.06-.38*b));turn('petto',rx(-.22*b));turn('collo',rz(.24*b));turn('testa',qq(rx(-.55*b),rz(.38*b)));
    arm('S',lerp3([9.2,-10.2,2.5],[11,2.5,3],cl(b,0,1)),[.6,-1,-.2]);curl('S',.35-.2*b);pick(-.75+.7*cl(b,0,1));feet();jaw(.2+.6*cl(b,0,1));break}
  case 'muore':{// hit… the knees give way, he falls forward with the pick under him, the head on its side (the helmet stays on), one last
    // twitch; the eyes and the lamp go out
    const hit=p<.12?sm(p/.12):p<.2?1-sm((p-.12)/.08):0,kn=sm((p-.12)/.3),fall=ez(cl((p-.42)/.34,0,1)),tw=p>.84&&p<.9?Math.sin((p-.84)/.06*TAU*2):0;
    sp.root.p=[0,-7*kn,-1.2*hit+1.5*fall];
    turn('bacino',rx(.25*kn+.35*fall));turn('schiena',rx(.06-.3*hit+.25*kn+.6*fall));turn('petto',rx(.15*kn+.35*fall));turn('collo',rx(.2*kn+.15*fall));
    turn('testa',qq(rx(-.4*hit+.3*kn-.3*fall),rz(.3*kn+.85*fall+tw*.08)));
    {const dn=[6.5,-11,3],fl=[8.5,1.2,17];if(fall>.02)arm('S',lerp3([6.5,-1,8],fl,fall),[.6,-1,.2],rx(.4),fall>.5?'mondo':'petto');else arm('S',lerp3([9.2,-10.2,2.5],dn,kn),[.6,-1,-.15]);curl('S',.5+tw*.3)}
    pick(lerp(-.75,.1,fall));feet();jaw(.25+.4*kn);sp.emK=1-.85*sm((p-.7)/.25);break}
  default:feet();pick(-.75)}
  return sp}
const solve=(M,sp)=>K3D.solve(M.skel,sp),mix=K3D.mix,joints=(M,P,out)=>K3D.joints(M.bind,P,out);
// where things are in a pose (in the space of the model): the lowest point of the pick, the lamp and where it looks
const atBone=(P,bn,p)=>add(P.wp[BI[bn]],qrot(P.wr[BI[bn]],sub(p,B0[BI[bn]])));
const tip=(M,P)=>{const a=atBone(P,'manoD',TIPS[0]),b=atBone(P,'manoD',TIPS[1]);return a[1]<b[1]?a:b};
const lamp=(M,P)=>({p:atBone(P,'testa',LAMP),d:qrot(P.wr[BI.testa],LLOOK)});
const ZMI3={build,solve,mix,joints,pose,MOSSE,BN,BI,bindPose,tip,lamp,CH,HC,HR,PV,sm,ez,cl,lerp,TAU};
if(typeof module!=='undefined'&&module.exports)module.exports=ZMI3;else root.ZMI3=ZMI3;
})(typeof window!=='undefined'?window:this);
