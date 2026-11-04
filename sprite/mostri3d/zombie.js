// Mossbound · lo zombie base in 3D vero (Denis, 3 novembre: «mi piace come l'hai fatto il modello in 3d in questa immagine che mi hai mandato
// senza meshy», «non serve accedere a meshy continua cosi»). È il nostro Zombie della cripta (CR.zombie di sprite/mostri/disegno_mostri.js:
// stesse misure, stessi pezzi, stessi colori), costruito nel codice come un modello vero: triangoli, uno scheletro con le ossa e i pesi, le
// ombre morbide cotte dove i pezzi si toccano; lo disegna sprite/mostri3d/mb3.js (tre toni come la lanterna, contorno spesso, luna sui bordi,
// occhi che brillano). Il disegno 2D di oggi non cambia.
// ZB3.build() → il modello (lo prende MB3.gpu/MB3.draw); ZB3.solve(M, ZB3.pose(mossa, p, o)) → la posa (posti e giri delle ossa);
// ZB3.mix(a, b, w) sfuma due pose; ZB3.joints(M, posa) → le matrici per il disegno. Ogni mossa dipende solo da p (0..1): ZB3.MOSSE.
// Spazio del modello: x a sinistra dello zombie, y in su, z davanti; unità come quelle del disegno 2D (alto circa 42).
// I pezzi comuni della formula (forme, scheletro, ombre cotte, la testa e il braccio da zombie) stanno in sprite/mostri3d/kit3d.js (K3D).
(function(root){'use strict';
const K3D=(typeof root.K3D!=='undefined'&&root.K3D)||(typeof require==='function'?require('./kit3d.js'):null);
const {TAU,cl,lerp,sm,ez,add,sub,mul,dot,cross,len,nrm,lerp3,hash,mixc,Q0,qmul,qax,qrot,qnl,qframe,rx,ry,rz,qq,ik,K,frameOf,Mesh,tube,ball}=K3D;
// the colours of the zombie of today (ZC of disegno_mostri.js), plus the ink of the lines
const Z=K3D.ZC;
// ---------------------------------------------------------------- the skeleton (S = his left, +x; D = his right, -x)
const BN=['root','bacino','schiena','petto','collo','testa','mascella','spallaS','braccioS','avambraccioS','manoS','ditaS','punteS',
  'spallaD','braccioD','avambraccioD','manoD','ditaD','punteD','cosciaS','stincoS','piedeS','cosciaD','stincoD','piedeD'];
const BI={};BN.forEach((n,i)=>{BI[n]=i});
const PAR={bacino:'root',schiena:'bacino',petto:'schiena',collo:'petto',testa:'collo',mascella:'testa'};
for(const sd of['S','D']){Object.assign(PAR,{['spalla'+sd]:'petto',['braccio'+sd]:'spalla'+sd,['avambraccio'+sd]:'braccio'+sd,['mano'+sd]:'avambraccio'+sd,['dita'+sd]:'mano'+sd,
  ['punte'+sd]:'dita'+sd,['coscia'+sd]:'bacino',['stinco'+sd]:'coscia'+sd,['piede'+sd]:'stinco'+sd})}
const ARM={L1:5.8,L2:5.8},LEG={L1:4.3,L2:4.3},PV=[0,13.4,0],CH=[0,21.4,4.2],HC=[0,33.4,7],HR=8.2,ANK=2.0;
const aDir=s=>nrm([.34*s,-1,.22]);
function bindPose(){const P={root:[0,0,0],bacino:PV,schiena:[0,17,1.9],petto:CH,collo:[0,27.2,5.4],testa:[0,29.2,6.2],mascella:[0,30.4,9.2]};
  for(const s of[1,-1]){const sd=s>0?'S':'D',sh=[7*s,24.4,4.2],d=aDir(s);P['spalla'+sd]=[3.2*s,26,4.4];P['braccio'+sd]=sh;P['avambraccio'+sd]=add(sh,mul(d,ARM.L1));
    P['mano'+sd]=add(P['avambraccio'+sd],mul(d,ARM.L2));P['dita'+sd]=add(P['mano'+sd],mul(d,1.6));P['punte'+sd]=add(P['dita'+sd],mul(d,2.6));
    const hip=[3.4*s,10.1,0],an=[4.4*s,ANK,.8],[kn]=ik(hip,an,LEG.L1,LEG.L2,[0,.15,1]);P['coscia'+sd]=hip;P['stinco'+sd]=kn;P['piede'+sd]=an}
  return BN.map(n=>P[n])}
// the limbs, solved with the IK by K3D.solve: the arms reach a point near the chest ('petto', turned with the body) or in the world
// ('mondo'), the legs a point on the ground ('terra') or near the body ('corpo'); the hand turns with the forearm, the foot with the body
const CHAINS=[];for(const sd of['S','D']){const s=sd==='S'?1:-1;
  CHAINS.push({a:'braccio'+sd,b:'avambraccio'+sd,c:'mano'+sd,g:'arm',s:sd,L1:ARM.L1,L2:ARM.L2,pole:[.6*s,-1,-.15],y0:nrm([.6*s,-.25,-1]),
    target:(ch,wp,rootP,rootQ)=>ch.rel!=='mondo'?add(wp[BI.petto],qrot(rootQ,ch.t)):ch.t,end:(ch,w1)=>qmul(w1,ch.wrist||Q0())});
  CHAINS.push({a:'coscia'+sd,b:'stinco'+sd,c:'piede'+sd,g:'leg',s:sd,L1:LEG.L1,L2:LEG.L2,pole:[0,.15,1],y0:[0,.15,1],
    target:(ch,wp,rootP,rootQ,sp)=>ch.rel==='corpo'?add(rootP,qrot(rootQ,ch.t)):add([rootP[0],0,rootP[2]],qrot(sp.root&&sp.root.yawQ||Q0(),ch.t)),end:(ch,w1,rootQ)=>qmul(rootQ,ch.foot||Q0())})}
// ---------------------------------------------------------------- the zombie
function build(){const B=bindPose(),m=Mesh(),bi=n=>BI[n],bp=n=>B[BI[n]];
  // · the head: a big round ball, hollow sockets, a mouth too wide; the lower face goes with the jaw (zHead of kit3d.js)
  K3D.zHead(m,{c:HC,R:HR,bi});
  // · the neck: short, the head sits almost on the shoulders
  m.group(2);
  {const a=[0,27.4,5.5],b=[0,30.2,6.5];tube(m,[a,lerp3(a,b,.5),b],[3.9,3.6,3.4],16,(p,t)=>({c:mixc(Z.skinD,Z.skin,.4+t*.5),k:K(1),w:t<.5?[[bi('petto'),.5-t],[bi('collo'),.5+t]]:[[bi('collo'),1.5-t],[bi('testa'),t-.5]]}),{cap0:'open',cap1:'open'})}
  // · the shirt: a torn tube from below the hips to the collar, a hole on the front over the ribs, buttons on the back, a tear
  m.group(3);
  const A=nrm(sub(CH,PV)),HOLE=nrm([.55,-.1,.82]),TEAR=nrm([-.85,.35,-.5]);
  const holeIn=p=>{const d=nrm(sub(p,CH)),f=frameOf(HOLE),q=sub(d,mul(HOLE,dot(d,HOLE))),x=dot(q,f.ex),y=dot(q,f.ey),an=Math.atan2(y,x),
    jag=1+.22*Math.sin(an*7+1.3)+.12*Math.sin(an*13+.4);return dot(d,HOLE)>0&&(x*x/(.42*.42)+y*y/(.34*.34))<jag*jag};
  const torsoW=p=>{const t=dot(sub(p,PV),A)/len(sub(CH,PV));if(t<.15)return[[bi('bacino'),1]];if(t<.55){const k=sm((t-.15)/.4);return[[bi('bacino'),1-k],[bi('schiena'),k]]}
    const k=sm((t-.55)/.45);return[[bi('schiena'),1-k],[bi('petto'),k]]};
  const shirt=Mesh();shirt.group(3);
  {const ring=[],LC=len(sub(CH,PV));ring.push([add(PV,[0,-3.5,-.35]),6.2],[add(PV,[0,-2.6,-.25]),6.35],[add(PV,[0,-1.3,-.1]),6.5],[PV,6.55]);
    for(const t of[.25,.5,.75])ring.push([lerp3(PV,CH,t),lerp(6.55,8.45,t)+Math.sin(t*Math.PI)*.35]);ring.push([CH,8.45]);
    for(const th of[.3,.6,.85,1.02])ring.push([add(CH,mul(A,8.45*Math.sin(th))),8.45*Math.cos(th)]);ring.push([add(CH,mul(A,8.45*.9)),3.85]);
    const pts=ring.map(r=>r[0]),rads=ring.map(r=>r[1]);
    const rings=tube(shirt,pts,rads,40,(p,t,an,i)=>{const nearH=sm((1.15-(()=>{const d=nrm(sub(p,CH));const f=frameOf(HOLE),q=sub(d,mul(HOLE,dot(d,HOLE)));return Math.hypot(dot(q,f.ex)/.42,dot(q,f.ey)/.34)})())/.6)*(dot(nrm(sub(p,CH)),HOLE)>0?1:0);
        const collar=sm((t-.82)/.12)*sm((dot(nrm(sub(p,CH)),[0,-.2,1])-.1)/.5);let c=mixc(Z.cloth,Z.clothD,sm((.25-t)/.25)*.5);
        return{c,k:K(2,Math.max(nearH*.85,collar*.55)),w:torsoW(p)}},
      {cap0:'open',cap1:'open',up:[0,0,1],rag1:null});
    // the ragged hem: the first ring hangs down in teeth (like the 2D trunk), the cloth folds in a little on the inside
    const r0=rings[0];for(let j=0;j<r0.ring.length;j++){const an=j/r0.ring.length*TAU,v=r0.ring[j],tl=Math.max(0,Math.sin(an*4.5+.6))*(.9+.8*hash(j*.37))+(j%3===0?.4:0);
      shirt.P[v*3+1]-=tl;shirt.P[v*3]*=1.02;shirt.P[v*3+2]=PV[2]-.4+(shirt.P[v*3+2]-(PV[2]-.4))*1.02}
    // the hole: its triangles go, the edge stays torn
    const I=shirt.I,keep=[];for(let t=0;t<I.length;t+=3){let inn=0;for(let q=0;q<3;q++){const v=I[t+q];if(holeIn([shirt.P[v*3],shirt.P[v*3+1],shirt.P[v*3+2]]))inn++}if(inn<2)keep.push(I[t],I[t+1],I[t+2])}shirt.I=keep}
  // under the hole: the rotten chest and the ribs
  m.group(3);
  {const f=frameOf(HOLE);ball(m,CH,[7.35,7.35,7.35],28,20,(p,d)=>({c:mixc(mixc(Z.rot,Z.socket,.45),Z.skinD,.12+.2*hash(Math.floor(d[0]*40)+Math.floor(d[1]*40)*7)),k:K(1,.45),w:torsoW(p)}));
    for(let i=0;i<3;i++){const y=(-.2+i*.17),n=i===2?2:4,P=[];for(let k=-n;k<=n;k++){const dd=nrm(add(add(HOLE,mul(f.ex,k*.1+(i===2?-.12:0))),mul(f.ey,y+.03*(n*n-k*k)*.22)));P.push(add(CH,mul(dd,7.55)))}
      tube(m,P,P.map((_,k)=>.3-Math.abs(k-n)*.03),7,()=>({c:mixc(Z.bone,[.75,.68,.5],.25),k:K(5,.3,.45),w:[[bi('petto'),1]]}),{cap0:'ball',cap1:'ball'})}}
  // three green buttons down the back
  for(let i=0;i<3;i++){const d=nrm([0,.55-i*.42,-1]),c=add(CH,mul(d,8.35)),f=frameOf(d);ball(m,c,[1.3,1.3,.55],12,8,()=>({c:Z.skinD,k:K(4,0,.55),w:[[bi('petto'),1]]}),{ax:[f.ex,f.ey,d]})}
  // a tear across the lower back, and the stitches of a patch on his right flank
  {const f=frameOf(TEAR),P=[[-1,-3],[1.2,0],[-.4,2.6],[1,4]].map(([x,y])=>{const dd=nrm(add(add(TEAR,mul(f.ex,x/6.5)),mul(f.ey,y/6.5)));return add(lerp3(PV,CH,.2),mul(dd,6.95))});
    tube(m,P,P.map(()=>.3),5,()=>({c:Z.ink,k:K(0,0,0),w:[[bi('bacino'),1]]}),{cap0:'ball',cap1:'ball'})}
  // · the arms: thin and bony, a knobbly elbow, a tight torn sleeve, a small palm with three long hooked fingers and black claws (zArm of kit3d.js)
  for(const s of[1,-1]){const sd=s>0?'S':'D';K3D.zArm(m,shirt,{s,sd,sh:bp('braccio'+sd),el:bp('avambraccio'+sd),wr:bp('mano'+sd),d:aDir(s),L1:ARM.L1,L2:ARM.L2,bi,
    knob:nrm([.6*s,-.3,-1]),sleeveK:.36,g:10+(s>0?0:1),hg:12+(s>0?0:1)})}
  // · the legs: torn trousers, a bony ankle, a big old shoe flat on the ground
  for(const s of[1,-1]){const sd=s>0?'S':'D',hp=bp('coscia'+sd),kn=bp('stinco'+sd),an=bp('piede'+sd),it=bi('coscia'+sd),is=bi('stinco'+sd),ift=bi('piede'+sd);
    m.group(20+(s>0?0:1));
    const legW=p=>{const ab=sub(kn,hp),t=dot(sub(p,hp),ab)/dot(ab,ab);if(t<.15)return[[bi('bacino'),.5-t*2],[it,.5+t*2]];if(t<.8)return[[it,1]];if(t<1.15){const k=sm((t-.8)/.35);return[[it,1-k],[is,k]]}return[[is,1]]};
    const hem=add(an,[0,1.2,0]);shirt.group(20+(s>0?0:1));
    tube(shirt,[add(hp,[0,1.6,0]),hp,lerp3(hp,kn,.5),kn,lerp3(kn,hem,.5),hem],[2.45,2.5,2.4,2.25,2.15,2.3],16,(p,t)=>({c:mixc(Z.pants,[.12,.1,.085],sm((t-.6)/.4)*.4),k:K(3,s<0&&t>.45&&t<.62?.6:0),w:legW(p)}),
      {cap0:'open',cap1:'open',rag1:a=>({len:Math.max(0,Math.sin(a*2.5+s))*1.1*(1+.5*hash(a*5+s*3)),out:.12})});
    tube(m,[lerp3(kn,an,.55),add(an,[0,.4,0]),add(an,[0,-.6,.15])],[1.15,1.05,1.1],10,(p,t)=>({c:mixc(Z.skinD,Z.rot,.3),k:K(1),w:t<.5?[[is,1]]:[[is,.4],[ift,.6]]}),{cap0:'open',cap1:'open'});
    const heel=add(an,[0,-.15,-1.5]),toe=add(an,[s*.15,-.35,2.9]);
    tube(m,[heel,lerp3(heel,toe,.35),lerp3(heel,toe,.7),toe],[1.95,2.05,2.1,2.0],16,(p,t)=>({c:p[1]<.7?Z.sole:Z.shoe,k:K(4,0,1),w:[[ift,1]]}),{cap0:'ball',cap1:'ball',up:[s,0,0]})}
  // the soles flat on the ground
  for(let i=0;i<m.P.length/3;i++)if(m.G[i]>=20&&m.P[i*3+1]<.25&&m.K[i*4]===4){m.P[i*3+1]=.25}
  // · the soft shadow where pieces meet (balls that stand for the pieces; a piece does not shadow itself)
  const OCC=[[HC,HR,1],[CH,8.4,3],[PV,6.4,3],[lerp3(PV,CH,.5),7.4,3],[[0,28.6,5.9],3.8,2]];
  for(const s of[1,-1]){const sd=s>0?'S':'D',sh=bp('braccio'+sd),el=bp('avambraccio'+sd),wr=bp('mano'+sd),g=10+(s>0?0:1);
    for(let k=0;k<=4;k++)OCC.push([lerp3(sh,el,k/4),1.5,g]);for(let k=1;k<=4;k++)OCC.push([lerp3(el,wr,k/4),1.2,g]);OCC.push([add(wr,mul(aDir(s),2.5)),1.9,12+(s>0?0:1)]);
    const hp=bp('coscia'+sd),kn=bp('stinco'+sd),an=bp('piede'+sd),gl=20+(s>0?0:1);for(let k=0;k<=3;k++)OCC.push([lerp3(hp,kn,k/3),2.4,gl]);for(let k=1;k<=3;k++)OCC.push([lerp3(kn,an,k/3),2.2,gl]);OCC.push([add(an,[0,-.2,.8]),2.1,gl])}
  const skip=(g,gg)=>(g===1&&gg===2)||(g===2&&gg===1)||(g>=12&&g<=13&&gg===g-2),ground=(p,g)=>cl((2.5-p[1])/2.5,0,1)*.25*(g>=20?1:0);// near the ground
  K3D.bake(m,OCC,skip,ground);K3D.bake(shirt,OCC,skip,ground);
  // ---- into the shape MB3 wants: one piece for the body, one for the cloth (shirt, sleeves, trousers)
  return K3D.pack(K3D.skel(BN,PAR,B,CHAINS),[[m,0],[shirt,1]])}
// ---------------------------------------------------------------- the moves (each depends only on p, 0..1: the last frame meets the first)
// o.look: where you are, seen from him (radians round the up axis, 0 = in front): the head snaps that way
const MOSSE={fermo:{n:'Fermo',dur:6,loop:1},cammina:{n:'Cammina',dur:1.5,loop:1},corre:{n:'Corre',dur:.74,loop:1},sbuca:{n:'Sbuca da terra',dur:3.2},
  urla:{n:'Urla',dur:2.3},colpo:{n:'Colpo',dur:1.4},morso:{n:'Morso',dur:1.5},colpito:{n:'Colpito',dur:.7},muore:{n:'Muore',dur:2.8,hold:1}};
// feet that step (stepper() of disegno_mostri.js): planted for `share` of the cycle sliding back, then swung forward and lifted
const stepper=(p,share)=>(k,S,H)=>{const q=((p+k)%1+1)%1;if(q<share)return{x:S-q/share*2*S,z:0,up:0};const u=(q-share)/(1-share);return{x:-S+ez(u)*2*S,z:Math.sin(u*Math.PI)*H,up:Math.sin(u*Math.PI)}};
const FW=s=>nrm([aDir(s)[1],-aDir(s)[0],0]);// across the palm (the fingers hook round it)
function pose(id,p,o){o=o||{};p=cl(p,0,1);const ph=p*TAU,sp={root:{p:[0,0,0],q:Q0()},r:{},arm:{},leg:{},emK:1};const R=sp.r,look=cl(o.look||0,-1.2,1.2);
  const turn=(b,q)=>{R[b]=R[b]?qmul(R[b],q):q};
  const curl=(sd,k)=>{const s=sd==='S'?1:-1,ax=mul(FW(s),-1);turn('dita'+sd,qax(ax,k*.9));turn('punte'+sd,qax(ax,k*1.05))};
  const jaw=a=>turn('mascella',rx(-a*.55));
  const arm=(sd,t,pole,wrist,rel)=>{const s=sd==='S'?1:-1;sp.arm[sd]={t,rel:rel||'petto',pole:pole||[.6*s,-1,-.15],wrist:wrist||Q0()}};
  const feet=(lS,lD)=>{sp.leg.S=lS||{t:[4.4,ANK,.8]};sp.leg.D=lD||{t:[-4.4,ANK,.8]}};
  const snap=(k0,k1,k2,k3)=>p<k0?0:p<k1?sm((p-k0)/(k1-k0)):p<k2?1:1-sm((p-k2)/(k3-k2));
  switch(id){
  case 'fermo':{// still, hunched, arms hanging forward… then the head snaps round towards you, stays, and slowly comes back; a tremor now and then
    sp.root.p=[0,Math.sin(ph)*.12,0];turn('bacino',rz(Math.sin(ph)*.025));turn('schiena',rx(.08+Math.sin(ph*2)*.012));turn('petto',rx(.06));
    const g=snap(.55,.574,.8,.97);turn('collo',qq(ry(look*.38*g),rz(.1*(1-g))));turn('testa',qq(ry(look*.62*g),rz(.26*(1-g)-.05*g),rx(.12-.16*g)));
    const tr=p>.22&&p<.31?Math.sin(p*TAU*48)*Math.sin((p-.22)/.09*Math.PI):0,tr2=p>.66&&p<.7?Math.sin(p*TAU*60)*Math.sin((p-.66)/.04*Math.PI):0;
    for(const sd of['S','D']){const s=sd==='S'?1:-1,w=Math.sin(ph+s)*.4;arm(sd,[9.6*s,-1+w,9.6],[.6*s,-1,-.1],qq(rx(.12),rz(sd==='D'?tr*.3:0)));curl(sd,.35+Math.sin(ph*3+s)*.06+(sd==='D'?tr*.25:0))}
    turn('spallaD',rz(-tr2*.08));feet();jaw(.2+Math.sin(ph*2)*.06);break}
  case 'cammina':{// a limp: the left leg drags with short low steps, the right one does the work; the head bent too far, a jerk now and then
    const st=stepper(p,.56),fL=st(0,2.6,.6),fR=st(.5,4.2,2.2),spread=Math.abs(fL.x-fR.x)/6.8,bob=-spread*1.4,roll=.3-Math.sin(ph)*1.3;
    sp.root.p=[-roll*.12,bob,0];turn('bacino',qq(rz(-roll*.03),ry(Math.sin(ph)*.07)));turn('schiena',qq(rx(.12),rz(roll*.025)));turn('petto',qq(rx(.06),ry(-Math.sin(ph)*.1)));
    feet({t:[4.2,ANK+fL.z,.8+fL.x],foot:rx(fL.up*.45)},{t:[-4.5,ANK+fR.z,.8+fR.x],foot:rx(-fR.up*.2+(fR.z>0?.1:0))});
    const j=snap(.6,.62,.64,.72);turn('collo',rz(.12+j*.14));turn('testa',qq(rz(.42+j*.36),rx(.1+Math.sin(ph*2+.6)*.06),ry(j*.32)));
    for(const sd of['S','D']){const s=sd==='S'?1:-1,sw=Math.sin(ph+(s>0?Math.PI:0))*1.1;arm(sd,[10*s,-.5+sw,10+sw*.4],[.6*s,-1,0],rx(.1));curl(sd,.3+.1*Math.sin(ph+s))}
    jaw(.32+.1*Math.sin(ph*2));break}
  case 'corre':{// hunched right over, long strides, arms grabbing the air in front
    const st=stepper(p,.42),fL=st(0,4.6,2.8),fR=st(.5,4.6,2.8),bob=-Math.abs(fL.x-fR.x)/9.2*1.6+Math.abs(Math.sin(ph*2))*.6;
    sp.root.p=[0,bob,0];turn('bacino',qq(rx(.12),ry(Math.sin(ph)*.12)));turn('schiena',rx(.22));turn('petto',qq(rx(.12),ry(-Math.sin(ph)*.14)));
    feet({t:[4.1,ANK+fL.z,.8+fL.x],foot:rx(fL.up*.5)},{t:[-4.1,ANK+fR.z,.8+fR.x],foot:rx(fR.up*.5)});
    turn('collo',rx(-.12));turn('testa',qq(rx(-.1),rz(.22+Math.sin(ph*2)*.05)));
    for(const sd of['S','D']){const s=sd==='S'?1:-1,sw=Math.sin(ph+(s>0?Math.PI:0));arm(sd,[9.4*s,1.5+sw*2.2,11+sw*2],[.6*s,-1,0],rx(-.1));curl(sd,.55+.3*sw)}
    jaw(.55+.15*Math.sin(ph*2));break}
  case 'sbuca':{// out of the ground: the head first, slowly, with the claws coming up beside it; the hands slap down on the ground and he
    // drags himself out in two jerks, steps out, stands, and his head snaps round towards you
    const rise=p<.1?0:p<.32?.42*ez((p-.1)/.22):p<.34?.42:p<.5?.42+.18*ez((p-.34)/.16):p<.53?.6:p<.72?.6+.27*ez((p-.53)/.19):p<.9?.87+.13*ez((p-.72)/.18):1,y=-46*(1-rise);
    const tilt=.16*sm((p-.3)/.1)*(1-sm((p-.72)/.2))+.06*Math.sin(p*TAU*7)*sm((p-.34)/.05)*(1-sm((p-.7)/.05));sp.root.p=[0,y,-Math.sin(tilt)*20];sp.root.q=rx(tilt);
    // the hands: straight up beside the head while it rises, then flat on the ground beside him, pushing; at the end back to his sides
    const down=sm((p-.32)/.08),out=sm((p-.76)/.12),gD=[-8.5,1.3,7],gS=[8.8,1.3,7.6];
    for(const sd of['S','D']){const s=sd==='S'?1:-1,upT=[6.4*s,15+Math.sin(p*TAU*5+s)*.8,3.5],g=sd==='S'?gS:gD;
      if(out>=1||(p>.76&&out>.5))arm(sd,[9.6*s,-1,9.6],[.6*s,-1,-.1],rx(.12));
      else if(down<=0)arm(sd,upT,[.7*s,-.2,-1],rx(-.4));
      else{const P=add([0,y,-Math.sin(tilt)*20],[0,21.4,4.2]),wUp=add(P,upT);arm(sd,lerp3(wUp,g,down),[.6*s,-.7,-1],rx(.5),'mondo')}
      curl(sd,p<.32?.15+.1*Math.sin(p*TAU*4+s):.45)}
    sp.leg.S={t:[4.4,ANK,.8],rel:p<.9?'corpo':'terra'};sp.leg.D={t:[-4.4,ANK,.8],rel:p<.9?'corpo':'terra'};
    const g=snap(.9,.925,1.5,2);turn('schiena',rx(.12+.2*down*(1-out)));
    turn('collo',qq(rz(.3*(1-g)),ry(look*.35*g),rx(-.15*(1-down))));turn('testa',qq(rz(.32*(1-g)),rx(-.3*(1-down)-.15*down*(1-out)+.1),ry(look*.6*g)));jaw(.45+.2*Math.sin(ph*6));break}
  case 'urla':{// back, back… then the scream: head thrust up, jaw wide open, arms spread, the whole body shaking
    const k1=sm(p/.25),k2=snap(.25,.36,.76,1),tb=k2*Math.sin(p*TAU*38)*.035,pre=k1*(1-k2);
    sp.root.p=[0,-.6*pre,-1*pre];turn('schiena',rx(.06-.26*pre+.18*k2+tb));turn('petto',rx(-.2*pre+.12*k2+tb));turn('collo',rx(-.25*pre-.05*k2));turn('testa',qq(rx(-.38*pre-.32*k2+tb*2),rz(tb*3)));
    for(const sd of['S','D']){const s=sd==='S'?1:-1;arm(sd,lerp3(lerp3([8.2*s,-4.2,8.4],[10.5*s,1.5,-1.5],pre),[12.4*s,4.5,5.5],k2),[.6*s,-1,-.3]);curl(sd,.2+.6*pre-.15*k2);turn('spalla'+sd,rz(-s*(.18*pre+.1*k2)))}
    feet();jaw(.15+.85*k2+tb*4);sp.emK=1+.9*k2;break}
  case 'colpo':{// it rears back with both arms high over its head, then lunges and rakes them down (the attack of disegno_mostri.js)
    let up=0,reach=0,lunge=0;if(p<.35){up=ez(p/.35);lunge=-up*2}else if(p<.6){const k=ez((p-.35)/.25);up=1-k*1.3;reach=k;lunge=-2+k*7}else{const k=ez((p-.6)/.4);up=-.3*(1-k);reach=1-k;lunge=5*(1-k)}
    const upP=Math.max(0,up);sp.root.p=[0,-.5*reach,lunge*.6];turn('schiena',rx(.06-.24*upP+.3*reach));turn('petto',rx(-.12*upP+.16*reach));turn('testa',rx(-.15*upP+.2*reach));
    for(const sd of['S','D']){const s=sd==='S'?1:-1;arm(sd,[s*(10+upP*2-reach*2),-.5+up*15.5,10-upP*12+reach*5],[.6*s,-1+1.5*upP,-.3*upP]);curl(sd,.15+.5*reach*(p>.45?1:0));turn('spalla'+sd,rz(-s*.2*upP))}
    feet(null,{t:[-4.4,ANK+Math.max(0,Math.sin(cl((p-.33)/.3,0,1)*Math.PI))*1.6,.8+cl(lunge,0,5)*.9]});jaw(p>.25&&p<.7?.85:.25);break}
  case 'morso':{// it pulls back with the jaw wide open… snaps forward and bites, shakes its head as it tears, and comes back
    const pr=sm(p/.42),st=snap(.42,.5,.72,1),bk=pr*(1-st),sh=p>.5&&p<.7?Math.sin((p-.5)/.2*TAU*3)*sm((p-.5)/.03)*(1-sm((p-.66)/.04)):0;
    sp.root.p=[0,-.5*bk,-1.6*bk+3.4*st];turn('schiena',rx(.06-.2*bk+.36*st));turn('petto',rx(-.14*bk+.24*st));turn('collo',rx(-.28*bk+.18*st));turn('testa',qq(rx(-.34*bk+.36*st),ry(sh*.22),rz(.15*bk)));
    for(const sd of['S','D']){const s=sd==='S'?1:-1;arm(sd,[(7.4-2*st)*s,-1+1.2*bk,10.5+2.5*st],[.6*s,-1,-.1]);curl(sd,.2+.75*st)}
    feet(null,{t:[-4.4,ANK+Math.max(0,Math.sin(cl((p-.4)/.18,0,1)*Math.PI))*1.2,.8+2.6*st]});jaw(p<.47?pr:p<.5?pr*(1-sm((p-.47)/.03)):.15+.2*(1-st));break}
  case 'colpito':{// a jolt back, the head whipping round, then back with a wobble
    const b=p<.16?sm(p/.16):Math.exp(-(p-.16)*6.5)*Math.cos((p-.16)*13);
    sp.root.p=[0,0,-1.8*b];turn('schiena',rx(.06-.38*b));turn('petto',rx(-.22*b));turn('collo',rz(.24*b));turn('testa',qq(rx(-.55*b),rz(.38*b)));
    for(const sd of['S','D']){const s=sd==='S'?1:-1;arm(sd,lerp3([9.6*s,-1,9.6],[11*s,2.5,3],cl(b,0,1)),[.6*s,-1,-.2]);curl(sd,.35-.2*b)}
    feet();jaw(.2+.6*cl(b,0,1));break}
  case 'muore':{// hit… the knees give way, it slumps forward onto its face, one last twitch; the eyes go out
    const hit=p<.12?sm(p/.12):p<.2?1-sm((p-.12)/.08):0,kn=sm((p-.12)/.3),fall=ez(cl((p-.42)/.34,0,1)),tw=p>.84&&p<.9?Math.sin((p-.84)/.06*TAU*2):0;
    sp.root.p=[0,-7.2*kn+hit*0,-1.2*hit+1.5*fall];
    turn('bacino',rx(.25*kn+.35*fall));turn('schiena',rx(.06-.3*hit+.25*kn+.6*fall));turn('petto',rx(.15*kn+.35*fall));turn('collo',rx(.2*kn+.15*fall));
    turn('testa',qq(rx(-.4*hit+.3*kn-.1*fall),rz(.3*kn+tw*.08)));
    for(const sd of['S','D']){const s=sd==='S'?1:-1;const dn=[6.5*s,-11,3],fl=[8.5*s,1.2,17+s];
      if(fall>.02)arm(sd,lerp3(add([0,0,0],[6.5*s,-1,8]),fl,fall),[.6*s,-1,.2],rx(.4),fall>.5?'mondo':'petto');else arm(sd,lerp3([9.6*s,-1,9.6],dn,kn),[.6*s,-1,-.15]);
      curl(sd,.5+(sd==='D'?tw*.3:0))}
    feet();jaw(.25+.4*kn);sp.emK=1-.85*sm((p-.7)/.25);break}
  default:feet()}
  return sp}
// ---------------------------------------------------------------- posing: places and turns of the bones
// spec: {root:{p,q}, r:{bone: local turn}, arm:{S|D:{t (target), rel:'petto'|'mondo', pole, wrist (local turn of the hand), curl}},
//   leg:{S|D:{t, rel:'terra'|'corpo', pole, foot (turn of the foot in the body frame)}}, jaw, look}
const solve=(M,sp)=>K3D.solve(M.skel,sp),mix=K3D.mix,joints=(M,P,out)=>K3D.joints(M.bind,P,out);
const ZB3={build,solve,mix,joints,pose,MOSSE,stepper,BN,BI,bindPose,qax,qmul,rx,ry,rz,qq,ik,Q0,ARM,LEG,PV,CH,HC,HR,ANK,aDir,sm,ez,cl,lerp,TAU,add,sub,mul,nrm,len,lerp3,hash};
if(typeof module!=='undefined'&&module.exports)module.exports=ZB3;else root.ZB3=ZB3;
})(typeof window!=='undefined'?window:this);
