// Mossbound · lo Zombie strisciante in 3D vero, fatto con la formula (sprite/mostri3d/LEGGIMI.md, «La formula per il 3D»; Denis, 4 novembre:
// «vai fai»). È il nostro strisciante di oggi (CR.strisciante di sprite/mostri/disegno_mostri.js, che non cambia): solo la metà di sopra del corpo,
// che si trascina sulle braccia lunghe coi gomiti in fuori e le mani piantate a terra; dietro la vita strisciano la spina e gli stracci della
// maglia; la maglia è strappata sulla schiena e fa vedere la spina e le costole; la testa è quella degli zombie, più piccola e senza cicatrice.
// Stesse misure, pezzi e colori del disegno 2D (dal rig 2D, x avanti, y a destra, z in su, qui [-y, z, x]: x a sinistra, y in su, z davanti).
// I pezzi comuni (forme, scheletro, ombre cotte, la testa e il braccio da zombie) vengono da sprite/mostri3d/kit3d.js; lo disegna mb3.js.
// ZS3.build() → il modello; ZS3.solve(M, ZS3.pose(mossa, p, {look})) → la posa; ZS3.mix, ZS3.joints, ZS3.MOSSE come lo zombie base (ZB3).
(function(root){'use strict';
const K3D=(typeof root.K3D!=='undefined'&&root.K3D)||(typeof require==='function'?require('./kit3d.js'):null);
const {TAU,cl,lerp,sm,ez,add,sub,mul,dot,cross,len,nrm,lerp3,hash,mixc,Q0,qmul,qax,qrot,rx,ry,rz,qq,stepper,K,frameOf,Mesh,tube,ball}=K3D;
const Z=K3D.ZC;
// ---------------------------------------------------------------- the measures of the drawing of today
// chest and waist (the trunk lies on the ground, the chest a little higher and ahead), the head ahead of the chest, the long arms
const CH=[0,6.8,1.5],RC=7.25,WB=[0,4.4,-7.5],RW=5.05,HC=[0,11.4,7.5],HR=6.8,ARM={L1:7.4,L2:7.8},HS=1.9/1.8,FS=6/5.6;
const A=nrm(sub(CH,WB));// along the trunk, from the waist to the chest
// the hands planted on the ground ahead: the palm on the floor, the fingers forward and a little out, hooking down into the ground
const PALM=s=>[8.8*s,1.1,10.1],HD=s=>nrm([.3*s,-.12,1]);
const HF={};for(const sd of['S','D']){const s=sd==='S'?1:-1,hd=HD(s),p0=nrm(sub([0,1,0],mul(hd,hd[1]))),fw=nrm(cross(hd,p0)),pd=nrm(cross(fw,hd));HF[sd]={dir:hd,fw,pd}}
const SH=s=>[6*s,7.8,2.9],POLE=s=>nrm([s,.25,-.5]);// the shoulders; the elbows go out to the sides, a little up and back
const WRO=s=>sub(PALM(s),mul(HD(s),1.15*HS));// the wrist of the planted hand
const AD=s=>nrm(sub(WRO(s),SH(s)));// the arm in the rest shape: straight from the shoulder towards the hand
const KNOB=s=>{const d=AD(s),p=POLE(s);return nrm(sub(p,mul(d,dot(p,d))))};// the outside of the bend of the elbow
// the spine trailing on the ground: five vertebrae from the stump, smaller and smaller (the 2D drawing: 3.5 to 12 behind the waist)
const TR=[[0,2.8,-11],[0,2.3,-13.125],[0,1.8,-15.25],[0,1.3,-17.375],[0,.8,-19.5]],TEND=[0,.45,-21.3],TRAD=[2.1,1.85,1.6,1.35,1.1],TSEG=2.125;
// the three torn strips of the shirt that come out from under the waist and lie on the ground (the left one longer, like the drawing)
const RAGS=[{a:[2.4,1.1,-8.6],b:[6.6,.32,-15.4],w:2.3},{a:[0,1.1,-9.4],b:[1.1,.32,-14.2],w:2},{a:[-2.4,1.1,-8.6],b:[-6.2,.32,-12.6],w:1.9}],RUP=nrm([0,.7,.7]);
// ---------------------------------------------------------------- the skeleton (S = his left, +x; D = his right, -x)
const BN=['root','vita','schiena','petto','collo','testa','mascella','spallaS','braccioS','avambraccioS','manoS','ditaS','punteS',
  'spallaD','braccioD','avambraccioD','manoD','ditaD','punteD','spina1','spina2','spina3','spina4','spina5','straccio1','straccio2','straccio3'];
const BI={};BN.forEach((n,i)=>{BI[n]=i});
const PAR={vita:'root',schiena:'vita',petto:'schiena',collo:'petto',testa:'collo',mascella:'testa',spina1:'vita',spina2:'spina1',spina3:'spina2',spina4:'spina3',spina5:'spina4',
  straccio1:'vita',straccio2:'vita',straccio3:'vita'};
for(const sd of['S','D'])Object.assign(PAR,{['spalla'+sd]:'petto',['braccio'+sd]:'spalla'+sd,['avambraccio'+sd]:'braccio'+sd,['mano'+sd]:'avambraccio'+sd,['dita'+sd]:'mano'+sd,['punte'+sd]:'dita'+sd});
function bindPose(){const P={root:[0,0,0],vita:WB,schiena:lerp3(WB,CH,.5),petto:CH,collo:[0,7.6,4.2],testa:[0,8.4,6.4],mascella:add(HC,mul([0,-.366,.268],HR))};
  for(const s of[1,-1]){const sd=s>0?'S':'D',sh=SH(s),d=AD(s),hd=HD(s);P['spalla'+sd]=[2.6*s,8.6,2.6];P['braccio'+sd]=sh;P['avambraccio'+sd]=add(sh,mul(d,ARM.L1));
    P['mano'+sd]=add(P['avambraccio'+sd],mul(d,ARM.L2));P['dita'+sd]=add(P['mano'+sd],mul(hd,1.6*HS));P['punte'+sd]=add(P['dita'+sd],mul(hd,2.6*FS))}
  TR.forEach((p,i)=>{P['spina'+(i+1)]=p});RAGS.forEach((r,i)=>{P['straccio'+(i+1)]=r.a});
  return BN.map(n=>P[n])}
// the arms, solved with the IK: the wrist goes to a point in the world ('mondo', the hand planted) or near the chest ('petto'); a planted hand
// keeps its own turn in the world (hq), a hand in the air turns with the forearm. The spine and the rags go through points given by the move.
const CHAINS=[];for(const sd of['S','D']){const s=sd==='S'?1:-1;
  CHAINS.push({a:'braccio'+sd,b:'avambraccio'+sd,c:'mano'+sd,g:'arm',s:sd,L1:ARM.L1,L2:ARM.L2,pole:POLE(s),y0:KNOB(s),
    target:(ch,wp,rootP,rootQ)=>ch.rel==='petto'?add(wp[BI.petto],qrot(rootQ,ch.t)):ch.t,end:(ch,w1)=>ch.hq?ch.hq:qmul(w1,ch.wrist||Q0())})}
const FOLLOW=[{bones:['spina1','spina2','spina3','spina4','spina5'],g:'coda',end:TEND,up:[1,0,0]}].concat(RAGS.map((r,i)=>({bones:['straccio'+(i+1)],g:'stracci'+i,end:r.b,up:RUP})));
// ---------------------------------------------------------------- the crawler
function build(){const B=bindPose(),m=Mesh(),shirt=Mesh(),bi=n=>BI[n],bp=n=>B[BI[n]];
  // · the head: the zombie head (zHead of kit3d.js), smaller like the drawing (6.8 instead of 8.2), without the scar
  K3D.zHead(m,{c:HC,R:HR,bi,eyeK:HR/8.2,scar:false});
  // · the neck: short and hidden, the head sits on the front of the chest
  m.group(2);
  {const a=[0,8,3],b=[0,9.8,6];tube(m,[a,lerp3(a,b,.5),b],[3.5,3.25,3],16,(p,t)=>({c:mixc(Z.skinD,Z.skin,.4+t*.5),k:K(1),w:t<.5?[[bi('petto'),.5-t],[bi('collo'),.5+t]]:[[bi('collo'),1.5-t],[bi('testa'),t-.5]]}),{cap0:'open',cap1:'open'})}
  // · the shirt: from the collar under the head, round the chest, down the trunk to the waist, where it ends in a torn hem; a hole on the back
  m.group(3);shirt.group(3);
  const UP=nrm(sub([0,1,0],mul(A,A[1]))),NC=nrm([0,.55,.835]),HO=lerp3(WB,CH,.45),LT=len(sub(CH,WB));
  const torsoW=p=>{const t=dot(sub(p,WB),A)/LT;if(t<.3)return[[bi('vita'),1]];if(t<.65){const k=sm((t-.3)/.35);return[[bi('vita'),1-k],[bi('schiena'),k]]}
    const k=sm((t-.65)/.35);return[[bi('schiena'),1-k],[bi('petto'),k]]};
  const axisAt=p=>add(WB,mul(A,dot(sub(p,WB),A))),onBack=p=>dot(nrm(sub(p,axisAt(p))),UP);
  const holeIn=p=>{const q=sub(p,HO),x=dot(q,A),y=q[0],an=Math.atan2(y,x),jag=1+.2*Math.sin(an*7+1.3)+.1*Math.sin(an*13+.4);return onBack(p)>.55&&(x*x/(3.4*3.4)+y*y/(2.5*2.5))<jag*jag};
  {const ring=[[add(CH,mul(NC,RC*.8)),4.4]];for(const th of[.92,.78,.56,.3])ring.push([add(CH,mul(NC,RC*Math.sin(th))),RC*Math.cos(th)]);ring.push([CH,RC]);
    for(const t of[.25,.5,.75])ring.push([lerp3(CH,WB,t),lerp(RC,RW,t)+Math.sin(t*Math.PI)*.3]);ring.push([WB,RW],[sub(WB,mul(A,1.3)),RW-.1],[sub(WB,mul(A,2.6)),RW-.3],[sub(WB,mul(A,3.4)),RW-.45]);
    const pts=ring.map(r=>r[0]),rads=ring.map(r=>r[1]),n=pts.length;
    tube(shirt,pts,rads,40,(p,t,an,i)=>{const hd=Math.hypot(dot(sub(p,HO),A)/3.4,p[0]/2.5),nearH=sm((1.5-hd)/.6)*(onBack(p)>.3?1:0),hem=sm((t-.82)/.18);
        return{c:mixc(mixc(Z.cloth,Z.clothD,.12+.4*hem),Z.clothD,.25*sm((-onBack(p)-.2)/.6)),k:K(2,Math.max(nearH*.8,hem*.35)),w:torsoW(p)}},
      {cap0:'open',cap1:'open',up:[0,1,0],rag1:an=>({len:Math.max(0,Math.sin(an*4.5+.6))*(1.2+.9*hash(an*3.7))+(Math.cos(an)>.3?.5:0),out:.15})});
    // the torn hem falls to the ground; the belly and the waist lie on the floor
    const v0=shirt.P.length/3-40;for(let v=v0;v<shirt.P.length/3;v++){const y=shirt.P[v*3+1];shirt.P[v*3+1]=y-(Math.max(0,-(shirt.P[v*3+2]-(WB[2]-3.4*A[2])))*.55)}
    // the hole: its triangles go, the edge stays torn
    const I=shirt.I,keep=[];for(let t=0;t<I.length;t+=3){let inn=0;for(let q=0;q<3;q++){const v=I[t+q];if(holeIn([shirt.P[v*3],shirt.P[v*3+1],shirt.P[v*3+2]]))inn++}if(inn<2)keep.push(I[t],I[t+1],I[t+2])}shirt.I=keep}
  // · under the shirt: the rotten body, the stump at the waist (torn dark flesh, the spine comes out of it), the spine and two ribs under the hole
  {const pts=[sub(WB,mul(A,2.5)),WB,lerp3(WB,CH,.5),CH,add(CH,mul(A,2))],rads=[RW-.75,RW-.3,lerp(RW,RC,.5)-.35,RC-.35,RC-1.8];
    tube(m,pts,rads,26,(p,t)=>{const st=sm((.16-t)/.16),c=mixc(mixc(mixc(Z.rot,Z.socket,.45),Z.skinD,.12+.2*hash(Math.floor(p[0]*3)+Math.floor(p[2]*3)*7)),mixc(Z.gum,Z.mouth,.45),st*.75);
        return{c,k:K(1,.45+.45*st),w:torsoW(p)}},{cap0:'ball',cap1:'open'})}
  const inR=t=>lerp(RW-.3,RC-.35,t);
  for(let i=0;i<4;i++){const t=.3+i*.1,c=add(lerp3(WB,CH,t),mul(UP,inR(t)+.05)),f=frameOf(A);ball(m,c,[.62,.5,.85],10,7,()=>({c:mixc(Z.bone,[.7,.62,.45],.3),k:K(5,.3,.5),w:torsoW(c)}),{ax:[f.ex,f.ey,A]})}
  for(const t of[.36,.52]){const c=lerp3(WB,CH,t),r=inR(t)+.15,P=[];for(let a=-1;a<=1;a+=.25){const an=a*.95,dd=nrm(add(mul(UP,Math.cos(an)),mul([1,0,0],Math.sin(an))));P.push(add(add(c,mul(dd,r)),mul(A,-.25*a*a)))}
    tube(m,P,P.map((_,k)=>.3-Math.abs(k-4)*.02),7,()=>({c:mixc(Z.bone,[.75,.68,.5],.25),k:K(5,.3,.45),w:torsoW(c)}),{cap0:'ball',cap1:'ball'})}
  // · the arms (zArm of kit3d.js): longer than the base zombie's, the elbows out, the hands planted with the claws in the ground
  for(const s of[1,-1]){const sd=s>0?'S':'D';K3D.zArm(m,shirt,{s,sd,sh:bp('braccio'+sd),el:bp('avambraccio'+sd),wr:bp('mano'+sd),d:AD(s),L1:ARM.L1,L2:ARM.L2,bi,
    knob:KNOB(s),sleeveK:.32,sleeveR:4.4/4.6,hand:HF[sd],hs:HS,fs:FS,g:10+(s>0?0:1),hg:12+(s>0?0:1)})}
  // · the spine on the ground: each vertebra a thick disc with the spike on its back and two little wings, a dark cord through them
  m.group(30);
  TR.forEach((c,k)=>{const r=TRAD[k],nx=k<4?TR[k+1]:TEND,zc=nrm(sub(nx,c)),yc=nrm(sub([0,1,0],mul(zc,zc[1]))),xc=cross(yc,zc),bn=bi('spina'+(k+1)),
      paint=p=>{const lo=sm((-dot(sub(p,c),yc)/r+.1)/.8);return{c:mixc(mixc(Z.bone,[.62,.52,.36],.25+.2*hash(k*7.1)),[.43,.34,.2],.45*lo),k:K(5,k===0?.55:.15*hash(k+2),.6),w:[[bn,1]]}};
    ball(m,c,[r,r*.62,r*.36],16,10,p=>paint(p),{ax:[xc,yc,zc]});
    {const b=add(c,mul(yc,r*.4)),dd=nrm(add(yc,mul(zc,.7)));tube(m,[b,add(b,mul(dd,r*.5)),add(b,mul(dd,r*.95))],[r*.3,r*.24,r*.12],8,p=>paint(p),{cap0:'open',cap1:'point',tip:.5})}
    for(const sg of[1,-1]){const b=add(c,mul(xc,sg*r*.8)),dd=nrm(add(mul(xc,sg),mul(yc,-.15)));tube(m,[b,add(b,mul(dd,r*.35)),add(b,mul(dd,r*.62))],[r*.22,r*.18,r*.08],7,p=>paint(p),{cap0:'open',cap1:'point',tip:.5})}});
  {const P=[lerp3(WB,TR[0],.55),...TR,lerp3(TR[4],TEND,.6)],bn=['vita','spina1','spina2','spina3','spina4','spina5','spina5'];
    tube(m,P,[.8,.62,.55,.5,.45,.4,.22],8,(p,t,an,i)=>({c:mixc(mixc(Z.gum,Z.rot,.45),Z.mouth,.3*hash(Math.floor(an*3)+i)),k:K(1,.55,.8),w:[[bi(i<0?(t>.5?'spina5':'vita'):bn[i]),1]]}),{cap0:'open',cap1:'point',tip:.8})}
  // · the rags: three torn strips of the shirt lying on the ground, dark and dirty
  shirt.group(31);
  RAGS.forEach((rg,i)=>{const a=rg.a,b=rg.b,d=sub(b,a),mid=add(lerp3(a,b,.45),[0,-.35,0]),bn=bi('straccio'+(i+1));
    tube(shirt,[a,mid,lerp3(a,b,.8),b],[rg.w,rg.w*.92,rg.w*.6,rg.w*.12],10,(p,t)=>({c:mixc(mixc(Z.cloth,Z.clothD,.3),[.16,.14,.11],.3*sm((t-.4)/.6)),k:K(2,.2*t),w:[[bn,1]]}),
      {cap0:'open',cap1:'point',tip:.6,flat:[1,.16],up:nrm(cross(d,[0,1,0]))})});
  // the belly and the waist on the ground
  for(const M of[m,shirt])for(let i=0;i<M.P.length/3;i++)if(M.G[i]===3&&M.P[i*3+1]<.3)M.P[i*3+1]=.3;
  // · the soft shadow where pieces meet, worked out in the rest pose (the hands are on the ground there, not in the straight rest shape)
  const S=K3D.skel(BN,PAR,B,CHAINS,FOLLOW),P0=K3D.solve(S,pose('riposo',0)),J=K3D.joints(B,P0);
  const skinned=M=>{const n=M.P.length/3,P=new Array(n*3),N=new Array(n*3);for(let i=0;i<n;i++){let x=0,y=0,z=0,a=0,b=0,c=0;
      for(let k=0;k<4;k++){const w=M.W[i*4+k];if(!w)continue;const j=M.J[i*4+k]*16,px=M.P[i*3],py=M.P[i*3+1],pz=M.P[i*3+2],nx=M.N[i*3],ny=M.N[i*3+1],nz=M.N[i*3+2];
        x+=w*(J[j]*px+J[j+4]*py+J[j+8]*pz+J[j+12]);y+=w*(J[j+1]*px+J[j+5]*py+J[j+9]*pz+J[j+13]);z+=w*(J[j+2]*px+J[j+6]*py+J[j+10]*pz+J[j+14]);
        a+=w*(J[j]*nx+J[j+4]*ny+J[j+8]*nz);b+=w*(J[j+1]*nx+J[j+5]*ny+J[j+9]*nz);c+=w*(J[j+2]*nx+J[j+6]*ny+J[j+10]*nz)}
      const l=Math.hypot(a,b,c)||1;P[i*3]=x;P[i*3+1]=y;P[i*3+2]=z;N[i*3]=a/l;N[i*3+1]=b/l;N[i*3+2]=c/l}return{P,N,G:M.G,K:M.K}};
  const at=(bn,p)=>{const j=BI[bn]*16;return[J[j]*p[0]+J[j+4]*p[1]+J[j+8]*p[2]+J[j+12],J[j+1]*p[0]+J[j+5]*p[1]+J[j+9]*p[2]+J[j+13],J[j+2]*p[0]+J[j+6]*p[1]+J[j+10]*p[2]+J[j+14]]};
  const OCC=[[at('testa',HC),HR,1],[CH,RC*.98,3],[WB,RW,3],[lerp3(WB,CH,.5),(RC+RW)/2,3],[[0,9,5],3.2,2]];
  for(const s of[1,-1]){const sd=s>0?'S':'D',a=P0.wp[BI['braccio'+sd]],e=P0.wp[BI['avambraccio'+sd]],w=P0.wp[BI['mano'+sd]],g=10+(s>0?0:1);
    for(let k=0;k<=4;k++)OCC.push([lerp3(a,e,k/4),1.5,g]);for(let k=1;k<=4;k++)OCC.push([lerp3(e,w,k/4),1.2,g]);OCC.push([at('mano'+sd,add(bp('mano'+sd),mul(HD(s),2.4*HS))),1.9,12+(s>0?0:1)])}
  TR.forEach((c,k)=>OCC.push([c,TRAD[k]*.8,30]));
  const skip=(g,gg)=>(g===1&&gg===2)||(g===2&&gg===1)||(g>=12&&g<=13&&gg===g-2),ground=(p,g)=>g===1?0:cl((2.4-p[1])/2.4,0,1)*.3;
  K3D.bake(skinned(m),OCC,skip,ground);K3D.bake(skinned(shirt),OCC,skip,ground);
  return K3D.pack(S,[[m,0],[shirt,1]])}
// ---------------------------------------------------------------- the moves (each depends only on p, 0..1: the last frame meets the first)
// o.look: where you are, seen from him (radians round the up axis, 0 = in front): the head snaps that way
const MOSSE={fermo:{n:'Fermo',dur:6,loop:1},cammina:{n:'Striscia',dur:1.6,loop:1},corre:{n:'Striscia veloce',dur:.82,loop:1},sbuca:{n:'Sbuca da terra',dur:3.6},
  urla:{n:'Urla',dur:2.4},colpo:{n:'Balzo',dur:1.5},morso:{n:'Morso',dur:1.6},colpito:{n:'Colpito',dur:.7},muore:{n:'Muore',dur:2.8,hold:1}};
const snap=(p,k0,k1,k2,k3)=>p<k0?0:p<k1?sm((p-k0)/(k1-k0)):p<k2?1:1-sm((p-k2)/(k3-k2));
function pose(id,p,o){o=o||{};p=cl(p,0,1);const ph=p*TAU,sp={root:{p:[0,0,0],q:Q0()},r:{},arm:{},emK:1};const R=sp.r,look=cl(o.look||0,-1.2,1.2);
  const turn=(b,q)=>{R[b]=R[b]?qmul(R[b],q):q};
  const curl=(sd,k)=>{const ax=mul(HF[sd].fw,-1);turn('dita'+sd,qax(ax,k*.9));turn('punte'+sd,qax(ax,k*1.05))};
  const jaw=a=>turn('mascella',rx(-a*.55));
  // a hand on the ground: the palm at P (in the world), the fingers tipped down by `tip`, turned by `yaw`
  const plant=(sd,P,tip,yaw)=>{const s=sd==='S'?1:-1,hq=qq(ry(yaw||0),rx(tip||0));sp.arm[sd]={t:sub(P,qrot(hq,mul(HD(s),1.15*HS))),hq}};
  // a hand in the air: the wrist at W, turned with the forearm
  const reach=(sd,W,wrist)=>{sp.arm[sd]={t:W,wrist:wrist||Q0()}};
  // the waist in the world (the spine and the rags hang from it) and the way back along the ground
  const waist=()=>{const Q=qmul(sp.root.q,R.vita||Q0()),W=add(sp.root.p,qrot(sp.root.q,WB)),bk=qrot(Q,[0,0,-1]);let bx=bk[0],bz=bk[2];const bl=Math.hypot(bx,bz)||1;bx/=bl;bz/=bl;
    return{W,Q,bx,bz,yaw:(ox,oz)=>[-ox*bz-oz*bx,ox*bx-oz*bz]}};
  // the spine: from the stump back along the ground. t: ph, sw (the snake of the spine), f (how fast), wig (the sway of the body), side (pushed
  // to a side), lash (whipping), lag (how much the end stays behind when the body jumps forward), hang (0..1: down into the hole)
  const tail=t=>{t=t||{};const w=waist(),b0=add(w.W,qrot(w.Q,sub(TR[0],WB))),dy=b0[1]-TR[0][1],P=[b0],ph2=(t.ph||0)*(t.f||1);
    for(let k=1;k<=5;k++){const kk=Math.min(k,4)/4,rp=k<5?TR[k]:TEND,o=sub(rp,TR[0]),h=w.yaw(o[0],o[2]);
      const sw=Math.sin(ph2+1+kk*2)*1.6*kk*(t.sw===undefined?1:t.sw)-(t.wig||0)*kk+(t.side||0)*kk+(t.lash||0)*Math.sin((t.ph||0)*9+kk*3)*kk,lg=(t.lag||0)*kk;
      const y=Math.max(k<5?TRAD[k]*.62:.3,lerp(rp[1]+dy,rp[1],sm(k/3))),lie=[b0[0]+h[0]-w.bz*sw+w.bx*lg,y,b0[2]+h[1]+w.bx*sw+w.bz*lg],hang=add(b0,[w.bx*.4*k,-TSEG*k,w.bz*.4*k]);
      P.push(lerp3(lie,hang,t.hang||0))}
    P.up=qrot(w.Q,[1,0,0]);sp.coda=P};
  // the rags: from under the waist to the ground behind (t: ph, k (how much they sway), lag, hang)
  const rags=t=>{t=t||{};const w=waist(),up=qrot(w.Q,RUP);
    RAGS.forEach((rg,i)=>{const a=add(w.W,qrot(w.Q,sub(rg.a,WB))),o=sub(rg.b,WB),h=w.yaw(o[0],o[2]),sw=Math.sin((t.ph||0)+i*2.1)*.8*(t.k===undefined?.5:t.k),lg=(t.lag||0)*.5;
      const lie=[w.W[0]+h[0]-w.bz*sw+w.bx*lg,rg.b[1],w.W[2]+h[1]+w.bx*sw+w.bz*lg],hang=add(a,[0,-len(sub(rg.b,rg.a)),0]),P=[a,lerp3(lie,hang,t.hang||0)];P.up=up;sp['stracci'+i]=P})};
  switch(id){
  case 'fermo':{// still, flat on the ground, the head bent too far to one side… then it snaps round towards you, stays, and slowly comes back;
    // now and then the fingers of one hand scratch the ground, the end of the spine twitches
    const br=Math.sin(ph),wig=Math.sin(ph)*.3;sp.root.p=[wig*.1,.06*br,0];turn('vita',rx(-.012*br));turn('schiena',rx(-.01*br));turn('petto',qq(rx(-.02*br),ry(wig*.04)));
    const g=snap(p,.55,.574,.8,.97),tr=p>.22&&p<.31?Math.sin(p*TAU*48)*Math.sin((p-.22)/.09*Math.PI):0,tw=p>.66&&p<.7?Math.sin((p-.66)/.04*Math.PI):0;
    turn('collo',qq(ry(look*.38*g),rz(.12*(1-g))));turn('testa',qq(ry(look*.62*g),rz(.34*(1-g)-.04*g),rx(-.06-.16*g)));
    for(const sd of['S','D']){const s=sd==='S'?1:-1,P=PALM(s);plant(sd,[P[0]+Math.sin(ph+s)*.15,P[1],P[2]+(sd==='D'?tr*.35:0)],sd==='D'?tr*.08:0);curl(sd,.5+.06*Math.sin(ph*3+s)+(sd==='D'?tr*.3:0))}
    tail({ph,wig,sw:.5,side:tw*1.2});rags({ph});jaw(.28+.08*Math.sin(ph*2));break}
  case 'cammina':{// it drags itself: one hand reaches out, plants and pulls while the other comes forward, the body surges on every pull
    // (the walk of disegno_mostri.js); the head bent too far to one side, with a jerk now and then
    const st=stepper(p,.5),hL=st(0,3.4,2.6),hR=st(.5,3.4,2.6),surge=-Math.cos(ph*2)*.7,wig=Math.sin(ph);
    sp.root.p=[-wig*.35,.12*Math.abs(Math.sin(ph*2)),surge];turn('vita',ry(wig*.09));turn('schiena',qq(rx(.02*surge),rz(-wig*.03)));turn('petto',qq(ry(wig*.05),rz(-wig*.05)));
    for(const[sd,f] of[['S',hL],['D',hR]]){const s=sd==='S'?1:-1,P=PALM(s);plant(sd,[P[0],P[1]+f.z,10.1+f.x*1.2],f.up*.7);curl(sd,.45+.35*f.up)}
    const j=snap(p,.6,.62,.64,.72);turn('collo',rz(.1+j*.12));turn('testa',qq(rz(.3+j*.32),rx(-.04+Math.sin(ph*2+.6)*.06),ry(j*.28-wig*.12)));
    tail({ph,wig,sw:1});rags({ph,k:1});jaw(.3+.1*Math.sin(ph*2));break}
  case 'corre':{// fast like a spider: long reaches, the hands slam down, the body low and the head forward, the spine whips
    const st=stepper(p,.42),hL=st(0,4.4,3.4),hR=st(.5,4.4,3.4),surge=-Math.cos(ph*2)*1.3,wig=Math.sin(ph)*1.3;
    sp.root.p=[-wig*.4,-.3+.2*Math.abs(Math.sin(ph*2)),surge];turn('vita',ry(wig*.1));turn('schiena',qq(rx(.04*surge),rz(-wig*.04)));turn('petto',qq(rx(.06),ry(wig*.06),rz(-wig*.06)));
    for(const[sd,f] of[['S',hL],['D',hR]]){const s=sd==='S'?1:-1,P=PALM(s);plant(sd,[P[0]*1.05,P[1]+f.z,11+f.x*1.3],f.up*.8);curl(sd,.4+.45*f.up)}
    turn('collo',rx(.1));turn('testa',qq(rx(.12+Math.sin(ph*2)*.05),rz(.18+Math.sin(ph*2+.5)*.06)));
    tail({ph,wig,sw:1.5});rags({ph,k:1.4});jaw(.55+.15*Math.sin(ph*2));break}
  case 'sbuca':{// out of the ground: the top of the head comes up slowly; one hand bursts out of the ground, up in the air with the fingers open, and
    // slams down in front, then the other; it pulls itself up in two jerks, drags itself out with the spine last, and its head snaps towards you
    const k0=ez((p-.06)/.1),k1=ez((p-.38)/.1),k2=ez((p-.52)/.1),k3=ez((p-.66)/.2);
    let y=-22+9.1*k0,z=3.9,pt=.95;y=lerp(y,-6.73,k1);pt=lerp(pt,.5,k2);y=lerp(y,-4.6,k2);z=lerp(z,1.4,k2);pt=lerp(pt,0,k3);y=lerp(y,0,k3);z=lerp(z,0,k3);
    const jit=.05*Math.sin(p*TAU*7)*sm((p-.36)/.04)*(1-sm((p-.64)/.04));sp.root.p=[0,y,z];sp.root.q=rx(-(pt+jit));
    for(const sd of['S','D']){const s=sd==='S'?1:-1,d0=sd==='S'?0:.1,up=sm((p-.14-d0)/.08),slam=sm((p-.22-d0)/.05),hole=[4*s,-9,1],air=[7*s,7.5+Math.sin(p*TAU*5+s)*.6,3],
        g1=[8.8*s,1.1,4.5],st=sm((p-.66-(sd==='S'?0:.08))/.08),fin=PALM(s),lift=Math.sin(st*Math.PI)*2.2,pl=[lerp(g1[0],fin[0],st),g1[1]+lift,lerp(g1[2],fin[2],st)];
      if(slam<=0){reach(sd,lerp3(hole,air,up),rx(-.6));curl(sd,-.25*up)}
      else{plant(sd,slam<1?lerp3(air,g1,slam):pl,slam<1?.5*(1-slam):lift*.25);curl(sd,lerp(-.25,.6,slam))}}
    const g=snap(p,.88,.905,1.5,2);turn('collo',qq(ry(look*.35*g),rx(-.15*(1-k2))));turn('testa',qq(rx(-.25*(1-k3)+.06*Math.sin(p*TAU*3)),rz(.25*(1-g)*k1),ry(look*.6*g)));
    jaw(.45+.2*Math.sin(ph*6));const hg=1-sm((p-.6)/.26);tail({ph,hang:hg,sw:.4});rags({ph,hang:hg});break}
  case 'urla':{// it draws back… then rears up on its arms, the head thrown up, the jaw wide open, the arms spread, the spine lashing; the eyes brighter
    const k1=sm(p/.25),k2=snap(p,.25,.36,.76,1),tb=k2*Math.sin(p*TAU*38)*.035,pre=k1*(1-k2);
    sp.root.p=[0,.8*k2,-1.2*pre+.6*k2];turn('vita',rx(.1*pre-.36*k2+tb));turn('schiena',rx(-.06*k2+tb));turn('petto',rx(-.08*k2+tb));
    turn('collo',rx(.2*pre-.25*k2));turn('testa',qq(rx(.25*pre-.4*k2+tb*2),rz(tb*3)));
    for(const sd of['S','D']){const s=sd==='S'?1:-1,P=PALM(s);plant(sd,[P[0]+2.4*s*k2,P[1],P[2]+1.2*k2-pre],0);curl(sd,.5+.3*pre-.35*k2)}
    tail({ph,sw:.5,lash:1.4*k2});rags({ph});jaw(.15+.85*k2+tb*4);sp.emK=1+.9*k2;break}
  case 'colpo':{// it rears up on its arms, then lunges forward low with the jaw wide open, the hands thrown ahead to grab, and slumps back
    // (the attack of disegno_mostri.js)
    let rear=0,lunge=0;if(p<.35)rear=ez(p/.35);else if(p<.65){const k=ez((p-.35)/.3);rear=1-k;lunge=k*8}else lunge=8*(1-ez((p-.65)/.35));
    const lk=lunge/8;sp.root.p=[0,rear,lunge];turn('vita',rx(-.52*rear));turn('petto',rx(-.06*rear+.08*lk));turn('collo',rx(.12*rear-.06*lk));turn('testa',rx(.16*rear+.1*lk));
    for(const sd of['S','D']){const s=sd==='S'?1:-1,P=PALM(s);plant(sd,[P[0],P[1]+lunge*.25,P[2]+lunge*1.1],-.15*lk);curl(sd,lunge>.3?.25+.55*lk:.3)}
    tail({ph,lag:lunge*.9,sw:.4});rags({ph,lag:lunge*.6});jaw(p>.25&&p<.7?.95:.3);break}
  case 'morso':{// it pulls back with the jaw wide open… snaps forward low and bites, the hands grabbing ahead, shakes its head as it tears, comes back
    const pr=sm(p/.4),st=snap(p,.4,.48,.72,1),bk=pr*(1-st),sh=p>.5&&p<.7?Math.sin((p-.5)/.2*TAU*3)*sm((p-.5)/.03)*(1-sm((p-.66)/.04)):0;
    sp.root.p=[0,.5*bk-.4*st,-1.4*bk+4*st];turn('vita',rx(-.12*bk+.06*st));turn('petto',rx(-.08*bk+.1*st));
    turn('collo',rx(-.15*bk+.3*st));turn('testa',qq(rx(-.25*bk+.32*st),ry(sh*.25),rz(.12*bk)));
    for(const sd of['S','D']){const s=sd==='S'?1:-1,P=PALM(s);plant(sd,[P[0]-1.2*s*st,P[1],P[2]+4.5*st-bk],0);curl(sd,.4+.5*st)}
    tail({ph,lag:3.2*st,sw:.5});rags({ph});jaw(p<.47?pr:p<.5?pr*(1-sm((p-.47)/.03)):.12+.18*(1-st)+.1*Math.abs(sh));break}
  case 'colpito':{// a jolt back, the head whipping round, one hand slipping, then back with a wobble
    const b=p<.16?sm(p/.16):Math.exp(-(p-.16)*6.5)*Math.cos((p-.16)*13),bb=cl(b,0,1);
    sp.root.p=[0,.25*b,-1.8*b];turn('vita',rx(-.14*b));turn('petto',rx(-.1*b));turn('collo',rz(.24*b));turn('testa',qq(rx(-.5*b),rz(.36*b)));
    plant('S',PALM(1),0);curl('S',.5-.2*b);{const P=PALM(-1);plant('D',[P[0]-2.4*bb,P[1]+1.2*bb,P[2]-1.6*bb],.3*bb);curl('D',.5-.4*bb)}
    tail({ph,side:b*1.5,sw:.4});rags({ph});jaw(.2+.6*bb);break}
  case 'muore':{// hit… the arms give way and slide out, the chest and the head fall to the ground, the head rolls on its cheek, one last twitch
    // of the fingers and of the spine; the eyes go out
    const hit=p<.12?sm(p/.12):p<.2?1-sm((p-.12)/.08):0,give=sm((p-.12)/.3),fall=ez(cl((p-.38)/.3,0,1)),roll=sm((p-.55)/.25),tw=p>.84&&p<.9?Math.sin((p-.84)/.06*TAU*2):0;
    sp.root.p=[0,-.5*fall,-1.2*hit+.6*fall];turn('vita',rx(-.15*hit+.06*fall));turn('petto',rx(-.1*hit+.12*fall));
    turn('collo',rx(.35*fall));turn('testa',qq(rx(-.4*hit+.42*fall),rz(1.05*roll+tw*.08)));
    for(const sd of['S','D']){const s=sd==='S'?1:-1,P=PALM(s);plant(sd,[P[0]+4.5*s*give,P[1],P[2]-2.5*give],-.2*give+(sd==='S'?tw*.15:0));curl(sd,.5-.35*give+(sd==='S'?tw*.4:0))}
    tail({ph,side:tw*.8,sw:.3*(1-fall)});rags({ph});jaw(.25+.35*give);sp.emK=1-.85*sm((p-.7)/.25);break}
  default:for(const sd of['S','D'])plant(sd,PALM(sd==='S'?1:-1),0);tail({sw:0});rags({k:0})}
  return sp}
const solve=(M,sp)=>K3D.solve(M.skel,sp),mix=K3D.mix,joints=(M,P,out)=>K3D.joints(M.bind,P,out);
const ZS3={build,solve,mix,joints,pose,MOSSE,BN,BI,bindPose,CH,WB,HC,HR,TR,ARM,sm,ez,cl,lerp,TAU};
if(typeof module!=='undefined'&&module.exports)module.exports=ZS3;else root.ZS3=ZS3;
})(typeof window!=='undefined'?window:this);
