// =====================================================================
// LA PIOVRA DELLA PALUDE RIFATTA: «la Signora dello Stagno» (Denis, 15 ottobre: «rivisita tutti i boss … possenti, belli, fighi, che diano
// timore nello sfidarli», «migliora anche le loro abilità speciali»; 16 ottobre, visto il Golem: «sì, fai gli altri 12»). NEL GIOCO dal 20
// ottobre (Denis: «Tutto nel gioco»): questo file e il modello sprite/nemici3d/octopus2.js sono in src/ordine.txt e il modello prende il
// posto di 'octopus' (prima stavano solo nella copia del gioco di anteprime/mk_boss2.py). Design e numeri:
// docs/boss-classici-design/octopus.md.
// Una piovra antica color petrolio, seduta nella sua pozza come su un trono, con la corona dello stagno (giunco, chiocciole di palude, la
// cozza con la Perla). Il suo avviso è la Perla: lampeggia prima di ogni mossa e la sua luce corre dove sta per colpire (nelle ventose del
// braccio che si alza, giù fino al sifone, nelle braccia che si tuffano). Ogni stato ha il nome di una mossa del modello; il colpo vero
// parte nel suo fotogramma (b3at, 81-boss3-base.js). Mosse:
// - Tentacolata (slam, poi stuck): una striscia rossa verso di te; il braccio si abbatte lungo mezza stanza e lo schizzo corre oltre la
//   punta (un passo di lato). Poi resta con le ventose attaccate: non si muove e i colpi fanno +50% («Colpo alla perla!»).
// - Pioggia d'inchiostro (ink): tre palle in fila di traverso (cinque a X nella fase 2) con i loro cerchi rossi; dove cadono resta una
//   pozza che rallenta (al massimo 8 pozze: la più vecchia si asciuga).
// - Gabbia degli abissi (cage): otto braccia sbucano dal pavimento in cerchio intorno a te, tranne un buco dalla parte lontana da lei;
//   restano come sbarre, poi frustano verso il centro (si esce dal buco, o prima che sbuchino). Nella fase 2 escono anche dalle pozze
//   d'inchiostro vicine.
// - Gorgo (whirl): gira con le braccia stese a stella, ti tira a sé e spara bolle a spirale; l'anello rosso è fin dove arrivano le braccia.
//   Nella fase 2 finisce con la Risacca (un'onda).
// - Agguato (sink, swim, rise): si immerge, la corona taglia l'acqua come una pinna e ti viene dietro (più piano di te), poi esplode fuori
//   dove si è fermata, con un anello di bolle. Nella fase 2 due volte di fila, la seconda da una pozza d'inchiostro vicina a te.
// - Furia (rage, a metà vita): si alza sulle braccia, si accende di magenta, la pozza diventa d'inchiostro; poi tutto 1,2 volte più
//   rapido: Doppia tentacolata (slam2) e Marea Nera (tide: un'onda nera copre la stanza, si salva chi sta su una ninfea).
// Entrata (enter): la pozza scura ribolle, gli occhi d'ambra sotto l'acqua, tre colpetti impazienti, si alza, sbatte le mani, ruggisce.
// Sconfitta (die): la luce si ritira dalle punte, affonda, la corona resta a galleggiare. Il suo tempo è quello dell'arena (bossLvl) e nella
// fase 2 1,2 volte più svelto; ogni danno ha un avviso rosso di almeno 1 s del modello (0,73 s veri, 0,61 nella fase 2), una mossa alla
// volta. Quello che il modello disegna (il braccio della Tentacolata, le braccia del Gorgo) e quello che il gioco disegna stanno nello
// stesso posto: il gioco gira il modello con la sua telecamera (ocFace) e gli dà le lunghezze nel suo pavimento (ocML).
// =====================================================================
const OC2ON=typeof N3!=='undefined'&&!!N3.octopus2;
const OCN={red:'229,72,77',aqua:'140,250,232',mag:'255,122,224',sp2:1.2,
  seq1:['slam','ink','cage','slam','whirl','sink'],seq2:['slam2','cage','ink','sink','slam2','whirl','tide'],
  // the states that are no attack: no charging ring round her when they start (51-boss2-mondi.js)
  calm:new Set(['stuck','rise','swim'])};
if(OC2ON){
  // the new model in place of the old one (its drawing of today stays as N3.meta.octopus.old for the pages)
  const old=N3.octopus,oldM=N3.meta.octopus;N3.octopus=N3.octopus2;N3.meta.octopus=Object.assign({},N3.meta.octopus2,{old:(x,y,f,a,p)=>old(x,y,f,oldM.an.includes(a)?a:'idle',p,oldM.sc||1,{})});
  Object.assign(ET.octopus,{r:34,hp:7000,cdmg:24});BOSS_INTRO.octopus=3.4;Object.assign(BDEATH,{octopus:{dur:4,clou:2.2,snd:'bubble'}});B2H.octopus=100;
  if(typeof ETELE!=='undefined')delete ETELE.octopus;
  // what the game passes to the model: the hand that strikes and where (in its floor), the second blow, how many shots of ink, the call
  N3G.opt.octopus=e=>({side:e.oSide||1,ang:e.oAng||0,a2:e.oA2||0,len:e.oLen,len2:e.oLen2,n:e.oN,call:!!e.oCall});
  N3G.wp.octopus=e=>{const d=B3D(e,'walk');return(((e.wt||0)%d)+d)%d/d};
  // (its line in the guide is in 44-guida.js, BEST2, with the others)
}
// ---- helpers
// the model's own drawings of the pieces of its moves (design: Arm (x,y,k,a,sc,o), Pad (x,y,k,sc,o), Blob (x,y,z,k,sc,o)) and its moments
const ocArt=n=>(typeof N3!=='undefined'&&(N3['octopus2'+n]||N3['octopus'+n]))||null;
const OCI={slam:.6,splash:.66,pops:[.2,.29,.38,.47,.56,.65,.74,.83],stuck:.15,slam2:[.45,.85],ink3:[.4,.47,.54],ink5:[.36,.42,.48,.54,.6],
  cage:[.25,.715,.88,.925],sink:.5,rise:.63,riseAir:.75,tide:.55,whirl:[.15,.36,.85,.88]};
// the moments of the model's own Info (sprite/nemici3d/octopus2.js: impact, pops, ink, cage.push), each taken only with the shape of the
// design's (a number in 0..1, or as many numbers); what it does not say stays as in the design
let ocIv=null,ocIsrc=0;function ocI(){const M=ocArt('Info');if(ocIv&&ocIsrc===M)return ocIv;ocIsrc=M;ocIv=Object.assign({},OCI);if(!M)return ocIv;
  const ok=v=>typeof v==='number'&&isFinite(v)&&v>=0&&v<=1,put=(k,v)=>{const d=OCI[k];if(Array.isArray(d)?Array.isArray(v)&&v.length===d.length&&v.every(ok):ok(v))ocIv[k]=v},im=M.impact||{};
  for(const k in OCI)put(k,M[k]);put('slam',im.slam);put('slam2',im.slam2);put('rise',im.rise);put('tide',im.tide);
  if(M.ink&&typeof M.ink==='object'){put('ink3',M.ink[3]);put('ink5',M.ink[5])}
  if(M.cage&&ok(M.cage.push)){const c=OCI.cage.slice();c[1]=M.cage.push;put('cage',c)}return ocIv}
// her pace: the arena's boss speed (bossLvl, the game gives it to her dt) and 1.2 more in the second phase, once the rage is over
const ocSp=e=>e&&e.p2&&e.st!=='rage'?OCN.sp2:1;
const ocS=e=>(((G.bossLvl||(G.bossLvl=bossLvl()))||{}).spd||1)*ocSp(e);
// real seconds from a stretch of the move (pHit - pNow, in parts of the move)
const ocT=(e,f,st)=>Math.max(.05,f*B3D(e,st||e.st)/ocS(e));
const ocCan=()=>P.inv<=0&&P.dashT<=0;
const ocBoss=()=>G&&G.enemies?G.enemies.find(q=>q.type==='octopus'&&!q.dead):null;
// the camera of the models squashes the floor (y·K): the face that makes her (and her arm) point at a room angle, the room angle a face
// points at, how long a model unit along a face is on the screen, the model length of a room length, a room point in her body's floor
let ocKv=.55,ocKt=-1;function ocK(){const t=G&&G.t||0;if(t!==ocKt){ocKt=t;try{ocKv=C3.V(0).P([0,1,0])[1]||.55}catch(err){ocKv=.55}}return ocKv}
const ocFace=a=>Math.atan2(Math.sin(a)/ocK(),Math.cos(a));
const ocRoom=f=>Math.atan2(Math.sin(f)*ocK(),Math.cos(f));
const ocML=(f,D)=>D/Math.max(.3,Math.hypot(Math.cos(f),ocK()*Math.sin(f)));
function ocBody(e,x,y){const dx=x-e.x,dy=(y-e.y)/ocK();return[Math.hypot(dx,dy),Math.atan2(dy,dx)]}
// how far from (x,y) along a before a wall or an obstacle (her own bars do not count)
function ocReach(x,y,a,max){const ca=Math.cos(a),sa=Math.sin(a);let s=0;for(;s<(max||900);s+=5){const px=x+ca*s,py=y+sa*s;if(px<L+4||px>R-4||py<TOP+4||py>BOT-4)break;
    if(G.rocks.some(k=>!k.oc&&Math.hypot(k.x-px,k.y-py)<k.r))break}return s}
function ocReset(){if(G)G.oc={warn:[],runs:[],blobs:[],cage:null,pads:[],wave:null,boil:null,veil:0,torch:0,trail:0}}
{const _br=buildRoom;buildRoom=function(){ocReset();return _br.apply(this,arguments)}}
const ocB=()=>G.oc||(ocReset(),G.oc);
// her bars of the cage: solid obstacles while the arms stand (on), gone (off)
function ocBars(on,C,life){const n=G.rocks.length;G.rocks=G.rocks.filter(k=>!k.oc);if(on&&C)for(const q of C.posts)if(!q.hole&&!q.ink)G.rocks.push({x:q.x,y:q.y,r:14,seed:q.seed,temp:true,life,kind:'octarm',oc:1,q});
  if(on||G.rocks.length!==n)fields={}}
// a pool of ink (G.zones kind 'slime', like today): at most eight alive, the oldest dries up
function ocInk(x,y,r,t,o){const Z=G.zones,I=Z.filter(z=>z.ink&&z.t>.4);if(I.length>=8)I[0].t=Math.min(I[0].t,.4);
  const z=Object.assign({x:clamp(x,L+8,R-8),y:clamp(y,TOP+8,BOT-8),r,t,max:t,kind:'slime',ink:true},o||{});Z.push(z);return z}
const ocInks=()=>G.zones.filter(z=>z.ink&&z.t>.4);
function ocClear(){const B=G.oc;if(!B)return;B.warn=[];B.runs=[];B.blobs=[];B.cage=null;B.pads=[];B.wave=null;B.boil=null;ocBars(false)}
// ---- the Tentacolata: the line toward a (from her, room px), the length of the arm in the room and for the model
function ocAim(e,a){const reach=ocReach(e.x,e.y,a,900),len=clamp(reach,60,165),f=ocFace(a);return{x:e.x,y:e.y,a,f,reach,len,mlen:ocML(f,len),far:Math.max(len,Math.min(240,reach)),hit:0,front:null}}
// the red stripe (b3wline) from 24 px to where the splash ends, 42 wide, and the light of the suckers running inside it
function ocWarnStrip(e,S,t){const ca=Math.cos(S.a),sa=Math.sin(S.a),len=Math.max(12,S.far-24);b3wline(S.x+ca*24,S.y+sa*24,S.a,len,42,t);ocB().runs.push({x:S.x+ca*24,y:S.y+sa*24,a:S.a,len:S.len-24,t,max:t,p2:!!e.p2})}
// is the hero in the stripe between s0 and s1 (room px along the line)?
function ocIn(S,s0,s1){const ca=Math.cos(S.a),sa=Math.sin(S.a),dx=P.x-S.x,dy=P.y-S.y,u=dx*ca+dy*sa,v=Math.abs(dy*ca-dx*sa),m=P.r*.4;return u>=s0-m&&u<=s1+m&&v<21+m}
// the arm lands along the line (once per blow); the splash starts at its tip
function ocLand(e,S,dmg){if(!S.hit&&ocCan()&&ocIn(S,24,S.len)){S.hit=1;hurtP(Math.round(dmg*DMG()))}
  const ca=Math.cos(S.a),sa=Math.sin(S.a),tx=S.x+ca*S.len,ty=S.y+sa*S.len,p2=!!e.p2;
  for(let s=44;s<=S.len;s+=LOWFX?80:46)vfxBlast(S.x+ca*s,S.y+sa*s,p2?'210,150,255':'150,230,215',24,{sparks:B3N(4),spcol:['#ffffff','#bff4ea',p2?'#ff7ae0':'#3aa89a'],dust:2,ring2:false});
  G.ripples.push({x:tx,y:ty,r:8,max:64,a:1});shake(6);sfx('splash',2,tx);b3fx(e,'oslam',tx,ty);S.front=S.len}
// the splash runs from the tip of the arm to the end of the stripe (p0..p1 of the move): who is there when it passes is hit (if the arm missed)
function ocSplash(e,S,k,p0,p1,dmg){if(S.front==null)return;const ca=Math.cos(S.a),sa=Math.sin(S.a),f0=S.front,f1=S.len+(S.far-S.len)*clamp((k-p0)/(p1-p0),0,1);
  if(f1>f0){if(!S.hit&&ocCan()&&ocIn(S,f0,f1)){S.hit=1;hurtP(Math.round(dmg*DMG()))}
    if(!LOWFX)for(let s=f0;s<f1;s+=14)G.debris.push({x:S.x+ca*s+rand(-6,6),y:S.y+sa*s+rand(-4,4),z:4,vx:rand(-30,30)+ca*60,vy:rand(-14,14)+sa*30,vz:rand(90,170),col:'#cfeee6',s:1.7,rot:0,vr:0,life:1.2,drop:true})}
  S.front=f1;if(k>=p1){S.front=null;if(S.far>S.len+4){const x=S.x+ca*S.far,y=S.y+sa*S.far;G.ripples.push({x,y,r:6,max:40,a:.9});if(BOSS2)ENV2.splash(x,y,B3N(6),'#cfe9d8')}}}
// ---- the rain of ink: the targets across the line to you (three in a row; five in an X in the second phase), inside the room
function ocInkTargets(e,p2){const a=Math.atan2(P.y-e.y,P.x-e.x),ux=Math.cos(a),uy=Math.sin(a),vx=-uy,vy=ux,T=[[0,0]];
  if(p2){const q=75/Math.SQRT2;T.push([q*(ux+vx),q*(uy+vy)],[q*(-ux-vx),q*(-uy-vy)],[q*(ux-vx),q*(uy-vy)],[q*(-ux+vx),q*(-uy+vy)])}else T.push([55*vx,55*vy],[-55*vx,-55*vy]);
  return T.map(([dx,dy])=>({x:clamp(P.x+dx,L+14,R-14),y:clamp(P.y+dy,TOP+14,BOT-14)}))}
// a ball of ink from the siphon (its point on the floor, 30 up), 0.9 s in an arc 90 high
function ocLob(e,T,p2){const s=b3pt(e,-2,28);ocB().blobs.push({x0:s.x,y0:s.y,z0:30,tx:T.x,ty:T.y,t:0,dur:.9,p2});sfx('eshot','poison',e.x)}
function ocInkLand(b){if(Math.hypot(P.x-b.tx,P.y-b.ty)<26+P.r*.4&&ocCan())hurtP(Math.round(14*DMG()));
  ocInk(b.tx,b.ty,30,b.p2?5:4.5);b3fx(ocBoss(),'oink',b.tx,b.ty,26);sfx('splash',0,b.tx);
  vfxBlast(b.tx,b.ty,'70,50,120',34,{sparks:B3N(6),spcol:['#3a2a6a','#8a7ae0','#2a2244'],dust:0,ring2:false})}
// ---- the cage: the centre on you (80 px from the walls), eight posts round it (62 px, turned at random), the hole on the side away from
// her with a free way out (110 px); in the second phase the ink pools near it (at most three, not on the ring) get an arm too
function ocFree(x0,y0,a,len){const ca=Math.cos(a),sa=Math.sin(a);for(let s=6;s<=len;s+=6){const x=x0+ca*s,y=y0+sa*s;if(x<L+P.r||x>R-P.r||y<TOP+P.r||y>BOT-P.r)return false;
    if(G.rocks.some(k=>Math.hypot(k.x-x,k.y-y)<k.r+P.r))return false}return true}
function ocCageStart(e){const C={x:clamp(P.x,L+80,R-80),y:clamp(P.y,TOP+80,BOT-80),posts:[],ink:[],p2:!!e.p2},a0=rand(0,TAU),bx=e.x-C.x,by=e.y-C.y,bd=Math.hypot(bx,by)||1;
  for(let i=0;i<8;i++){const a=a0+i*Math.PI/4,x=C.x+Math.cos(a)*62,y=C.y+Math.sin(a)*62;
    if(G.rocks.some(k=>!k.oc&&Math.hypot(k.x-x,k.y-y)<k.r+14)||Math.hypot(x-e.x,y-e.y)<e.r+16||x<L+10||x>R-10||y<TOP+10||y>BOT-10)continue;
    C.posts.push({x,y,a,i,seed:rand(0,9),hole:false})}
  const ok=C.posts.filter(q=>(Math.cos(q.a)*bx+Math.sin(q.a)*by)/bd<0&&ocFree(C.x,C.y,q.a,110));
  if(ok.length)pk(ok).hole=true;
  else if(C.posts.length){let far=C.posts[0];for(const q of C.posts)if(Math.hypot(q.x-e.x,q.y-e.y)>Math.hypot(far.x-e.x,far.y-e.y))far=q;far.hole=true;
    const nb=C.posts.find(q=>q!==far&&(q.i===(far.i+1)%8||q.i===(far.i+7)%8));if(nb)nb.hole=true}
  if(C.p2)C.ink=ocInks().map(z=>({z,d:Math.hypot(z.x-C.x,z.y-C.y)})).filter(q=>q.d<170&&q.d>=62+24).sort((a,b)=>a.d-b.d).slice(0,3).map(q=>({x:q.z.x,y:q.z.y,z:q.z,seed:rand(0,9),ink:true}));
  ocB().cage=C;sfx('bubble',1,C.x);for(const q of C.posts)if(!q.hole)G.ripples.push({x:q.x,y:q.y,r:3,max:18,a:.8})}
// ---- the Black Tide: three lily pads 80-140 px from you, 70 apart, in the room and in the phone's view, never on an obstacle or ink
function ocPads(e){const B=ocB();B.tid=(B.tid||0)+1;const vx0=(G.vx||0)+24,vx1=(G.vx||0)+VW-24,vy0=(G.vy||0)+44,vy1=(G.vy||0)+VH-40,got=[];
  for(const[r0,r1,gap] of[[80,140,70],[60,180,60],[40,220,46]]){for(let i=0;i<80&&got.length<3;i++){const a=rand(0,TAU),r=rand(r0,r1),x=P.x+Math.cos(a)*r,y=P.y+Math.sin(a)*r;
      if(x<Math.max(L+24,vx0)||x>Math.min(R-24,vx1)||y<Math.max(TOP+24,vy0)||y>Math.min(BOT-24,vy1))continue;
      if(G.rocks.some(k=>Math.hypot(k.x-x,k.y-y)<k.r+24)||ocInks().some(z=>Math.hypot(z.x-x,z.y-y)<z.r+20)||Math.hypot(x-e.x,y-e.y)<e.r+60||got.some(q=>Math.hypot(q.x-x,q.y-y)<gap))continue;
      got.push({x,y,t:0,pass:-1,seed:rand(0,9),tid:B.tid})}if(got.length>=3)break}
  B.pads=got;for(const q of got){G.ripples.push({x:q.x,y:q.y,r:4,max:26,a:.9});if(!LOWFX)for(let j=0;j<3;j++)G.fx.push({k:'bub',x:q.x+rand(-8,8),y:q.y+rand(-4,4),t:.6,r:rand(2,4)})}sfx('bubble',0,P.x)}
const ocOnPad=()=>(G.oc&&G.oc.pads||[]).some(q=>q.pass<0||q.t-q.pass<1?Math.hypot(P.x-q.x,P.y-q.y)<20:false);
// ---- the brain
function ocWalk(e,real){e.anchor=null;e.extra=0;e.oCall=false;e.moving=false;e.hidden=false;e.air=0;e.alpha=1;b3go(e,'walk',(real!=null?real:e.p2?rand(.75,1):rand(1,1.4))*ocS(e))}
const ocPeek=e=>{const s=e.p2?OCN.seq2:OCN.seq1;return s[((e.si==null?-1:e.si)+1)%s.length]};
function ocBegin(e,nx){const B=ocB(),a=Math.atan2(P.y-e.y,P.x-e.x);e.moving=false;e.extra=0;e.anchor=null;e.lf=a;e.face=ocFace(a);
  if(nx==='slam'||nx==='slam2'){e.oAlt=e.oAlt===1?-1:1;e.oSide=e.oAlt;e.oAng=0;e.oA2=0;const S=e.sl=ocAim(e,a);e.sF=S.f;e.oLen=S.mlen;e.oLen2=undefined;e.sl2=null}
  else if(nx==='ink'){e.oN=e.p2?5:3;e.inkT=null}
  else if(nx==='sink'){e.dive2=0}
  else if(nx==='whirl'){e.whT=0;e.whHit=-9}
  b3go(e,nx);
  // the rings that start with the move (after b3go: the pace is the one of the new state)
  if(nx==='whirl'){const t=ocT(e,ocI().whirl[1]);B.warn.push({k:'whirl',x:e.x,y:e.y,r:92,t,max:t})}
  else if(nx==='tide'){const t=ocT(e,ocI().tide);B.warn.push({k:'tide',x:e.x,y:e.y,r:64,t,max:t})}}
function ocNext(e){const s=e.p2?OCN.seq2:OCN.seq1;e.si=(e.si==null?-1:e.si)+1;ocBegin(e,s[e.si%s.length])}
// the second phase: the banner, the rage, the red bar (b3phase, with the arena and the voice of 87 and 88); what is in flight goes
function ocRage(e){if(!b3phase(e,'La Piovra si infuria!','255,90,220','splash'))return false;
  G.eproj=[];ocClear();if(G.b3)G.b3.warn=[];e.shell=99;e.moving=false;e.hidden=false;e.air=0;e.alpha=1;e.sl=e.sl2=null;e.oLen=e.oLen2=undefined;e.oAng=e.oA2=0;e.oCall=false;e.inkT=null;
  b3go(e,'rage');return true}
// the rise where she stopped: the red circle with its six ticks (t until the blow), the size of the burst
function ocRise(e,r,n){e.riseR=r;e.riseN=n;b3go(e,'rise');const t=ocT(e,ocI().rise,'rise');ocB().warn.push({k:'rise',x:e.x,y:e.y,r,t,max:t});e.hidden=true;e.air=1}
if(OC2ON)EUPD.octopus=function(e,dt,sm,a,d){const B=ocB(),mdt=dt*ocSp(e),rdt=mdt/ocS(e),fa=ocFace(a),I=ocI();
  // half health: the rage, only when she is free (sliding, stuck, mocking): never in the middle of a move or under the water
  if(!e.p2&&e.hp<e.max*.5&&(e.st==='walk'||e.st==='stuck'||e.st==='taunt')&&ocRage(e))return;
  b3tick(e,mdt);const k=b3k(e),p2=!!e.p2;
  switch(e.st){
  case 'enter':e.si=-1;ocWalk(e,.9);break;
  // ---- sliding with her pool at half distance (150-220 px; 120-170 before a Tentacolata), her head turned to you; in the second phase
  // she leaves a pool of ink every 1.6 s
  case 'walk':{e.air=0;e.hidden=false;e.face=fa;const nx=ocPeek(e),near=nx==='slam'||nx==='slam2',r0=near?120:150,r1=near?170:220;
    if(!e.anchor||e.anchor.near!==near||Math.hypot(e.anchor.x-P.x,e.anchor.y-P.y)<r0*.8){const an=Math.atan2(e.y-P.y,e.x-P.x)+rand(-.8,.8),r=rand(r0,r1),q=b3spot(P.x+Math.cos(an)*r,P.y+Math.sin(an)*r*.8,40);e.anchor={x:q.x,y:q.y,near}}
    const dx=e.anchor.x-e.x,dy=e.anchor.y-e.y,dd=Math.hypot(dx,dy);e.moving=dd>3;
    if(e.moving){const mv=Math.min(dd,(p2?60:52)*mdt);moveCircle(e,dx/dd*mv,dy/dd*mv);e.wt=(e.wt||0)+mdt;
      if(p2){B.trail+=rdt;if(B.trail>=1.6){B.trail=0;const mine=G.zones.filter(z=>z.ocTr&&z.t>.4);if(mine.length>=3)mine[0].t=Math.min(mine[0].t,.4);ocInk(e.x,e.y+4,24,3.5,{ocTr:1})}}}
    // (never two moves together: the next one waits for the black wave to finish crossing the room)
    if(e.stT<=0&&!B.wave){// a Tentacolata: if you are still far she slides on toward you (at most 1 s more)
      if(near&&d>230&&(e.extra||0)<1){e.extra=(e.extra||0)+rdt;const an=Math.atan2(e.y-P.y,e.x-P.x);e.anchor={x:clamp(P.x+Math.cos(an)*150,L+40,R-40),y:clamp(P.y+Math.sin(an)*150,TOP+44,BOT-44),near};break}
      ocNext(e)}
    break}
  // ---- the mocking gesture (88-boss3-voci.js starts it): she looks down at you, then slides on (the call: o.call, b3taunt below)
  case 'taunt':{e.moving=false;e.face=fa;if(e.stT<=0)ocWalk(e,rand(.3,.55));break}
  // ---- TENTACOLATA: the stripe (.03), the arm comes down along it (.60), the splash runs on to the end of the stripe (.60-.66)
  case 'slam':{e.moving=false;const S=e.sl;if(!S){ocWalk(e);break}e.face=S.f;
    if(b3at(e,.03))ocWarnStrip(e,S,ocT(e,I.slam-k));
    if(b3at(e,I.slam))ocLand(e,S,24);
    if(k>=I.slam)ocSplash(e,S,k,I.slam,I.splash,24);
    if(e.stT<=0)b3go(e,'stuck');break}
  // ---- VENTOSE ATTACCATE: she does not move, the blows hurt more (hurtE below); the suckers come off one by one, the marks stay
  case 'stuck':{e.moving=false;if(e.sF!=null)e.face=e.sF;const S=e.sl;
    if(S&&b3at(e,I.stuck))b3fx(e,'ostuck',S.x,S.y,S);
    for(const c of I.pops)if(b3at(e,c))sfx('bubble',0,e.x);
    if(e.stT<=0){e.sl=e.sl2=null;e.oLen=e.oLen2=undefined;e.oAng=e.oA2=0;ocWalk(e)}break}
  // ---- DOPPIA TENTACOLATA (second phase): the first stripe (.03) and blow (.45); then the second toward you (at most 1.1 rad turned, in
  // her floor), its stripe (.45) and blow (.85), a pool of ink at its tip; she ends stuck on the second arm
  case 'slam2':{e.moving=false;const S=e.sl;if(!S){ocWalk(e);break}e.face=S.f;const[h1,h2]=I.slam2;
    if(b3at(e,.03))ocWarnStrip(e,S,ocT(e,h1-k));
    if(b3at(e,h1)){ocLand(e,S,22);const fN=ocFace(Math.atan2(P.y-e.y,P.x-e.x)),a2=clamp(angDiff(S.f,fN),-1.1,1.1),S2=e.sl2=ocAim(e,ocRoom(S.f+a2));
      S2.f=S.f+a2;S2.mlen=ocML(S2.f,S2.len);e.oA2=a2;e.oLen2=S2.mlen;ocWarnStrip(e,S2,ocT(e,h2-k))}
    if(k>=h1)ocSplash(e,S,k,h1,h1+.04,22);
    const S2=e.sl2;
    if(S2&&b3at(e,h2)){ocLand(e,S2,22);ocInk(S2.x+Math.cos(S2.a)*S2.len,S2.y+Math.sin(S2.a)*S2.len,24,4)}
    if(S2&&k>=h2)ocSplash(e,S2,k,h2,h2+.04,22);
    if(e.stT<=0){if(S2){e.sl=S2;e.oSide=-(e.oSide||1);e.oAng=e.oA2;e.oLen=e.oLen2}b3go(e,'stuck')}break}
  // ---- PIOGGIA D'INCHIOSTRO: the targets and their circles (.30), the balls from the siphon (.40 .47 .54; .36-.60 with five)
  case 'ink':{e.moving=false;e.face=fa;const T0=p2?I.ink5:I.ink3;
    if(b3at(e,.3)){const T=e.inkT=ocInkTargets(e,p2);T.forEach((q,i)=>{const t=ocT(e,(T0[i]!=null?T0[i]:T0[T0.length-1])-k)+.9;B.warn.push({k:'ink',x:q.x,y:q.y,r:26,t,max:t,p2})})}
    T0.forEach((c,i)=>{if(b3at(e,c)&&e.inkT&&e.inkT[i])ocLob(e,e.inkT[i],p2)});
    if(e.stT<=0){e.inkT=null;e.oN=undefined;ocWalk(e)}break}
  // ---- GABBIA DEGLI ABISSI: the centre and the posts (.25), the arms burst out (.715: 18 and a push away; then they are bars), they whip
  // to the centre (.88: 20), they go down (.925); she stays with her arms in her pool (she can be hit)
  case 'cage':{e.moving=false;e.face=fa;const[c0,cU,cW,cD]=I.cage;
    if(b3at(e,c0))ocCageStart(e);const C=B.cage;
    if(C&&b3at(e,cU)){let hit=false;for(const q of C.posts.concat(C.ink)){if(q.hole)continue;if(!hit&&ocCan()&&Math.hypot(P.x-q.x,P.y-q.y)<18+P.r){hit=true;hurtP(Math.round(18*DMG()));
          if(!q.ink){let dx=P.x-C.x,dy=P.y-C.y,dd=Math.hypot(dx,dy);if(dd<1){dx=Math.cos(q.a);dy=Math.sin(q.a);dd=1}P.push={t:.2,vx:dx/dd*150,vy:dy/dd*150}}}
        G.ripples.push({x:q.x,y:q.y,r:6,max:30,a:1});if(!LOWFX)vfxBlast(q.x,q.y,q.ink?'120,80,180':'150,230,215',22,{sparks:B3N(4),spcol:['#ffffff','#bff4ea'],dust:3,ring2:false})}
      ocBars(true,C,ocT(e,cD-k)+.25);shake(4);sfx('splash',1,C.x);sfx('rock',0,C.x)}
    if(C&&b3at(e,cW)){if(Math.hypot(P.x-C.x,P.y-C.y)<46+P.r*.5&&ocCan())hurtP(Math.round(20*DMG()));shake(5);sfx('splash',2,C.x);
      vfxBlast(C.x,C.y,e.p2?'210,150,255':'150,230,215',50,{sparks:B3N(8),spcol:['#ffffff','#bff4ea'],dust:4,ring2:false})}
    if(C&&b3at(e,cD)){ocBars(false);for(const q of C.posts)if(!q.hole)b3fx(e,'ocage',q.x,q.y);for(const q of C.ink)if(q.z)q.z.t=Math.min(q.z.t,.4)}
    if(e.stT<=0){ocBars(false);B.cage=null;ocWalk(e)}break}
  // ---- GORGO: the red ring as far as her arms reach (from the start, full at .36), the pull and the spiral of bubbles (.15-.85), the arms
  // hurt from .36 to .85 (once every 0.7 s); in the second phase the ring of the Risacca (.50) and its wave (.88)
  case 'whirl':{e.moving=false;e.face=fa;const[w0,wD,wE,wR]=I.whirl;
    if(b3at(e,w0)){b3fx(e,'owhirl');sfx('bubble',2,e.x)}
    if(k>=w0&&k<wE){const dx=e.x-P.x,dy=e.y-P.y,dd=Math.hypot(dx,dy);if(dd<320&&dd>e.r+P.r&&P.dashT<=0){const v=(p2?75:55)*(1-dd/320)*rdt;moveCircle(P,dx/dd*v,dy/dd*v)}
      e.whT=(e.whT||0)+rdt;if(e.whT>=.22){e.whT-=.22;const n=p2?3:2,w=ocWhirlA(k);for(let q=0;q<n;q++){const an=w+q*TAU/n,pt=b3pt(e,40*Math.cos(an),40*Math.sin(an)),dir=Math.atan2(pt.y-(e.y+8),pt.x-e.x);
          shootE(pt.x,pt.y-12,dir,105,7,11,'bubble');const pj=G.eproj[G.eproj.length-1];if(pj)pj.ph=rand(0,TAU)}}}
    if(k>=wD&&k<wE&&ocCan()&&(G.t||0)-(e.whHit||-9)>=.7){const[db]=ocBody(e,P.x,P.y);if(db<92+P.r*.5){e.whHit=G.t||0;hurtP(Math.round(16*DMG()))}}
    if(p2&&b3at(e,.5)){const t=ocT(e,wR-k)+(240-92)/210;B.warn.push({k:'ring',x:e.x,y:e.y,r:240,t,max:t})}
    if(p2&&b3at(e,wR)){G.waves.push({x:e.x,y:e.y,r:92,max:240,dmg:Math.round(12*DMG()),hit:false,rgb:'120,220,210'});shake(4);sfx('splash',2,e.x);
      if(!LOWFX)fxPush({k:'ring2',x:e.x,y:e.y,rgb:'190,250,235',r0:60,r1:120,t:.35,max:.35,w:5})}
    if(e.stT<=0)ocWalk(e);break}
  // ---- AGGUATO: she goes under (.50: hidden, no contact), then swims after you; she comes up where she stopped
  case 'sink':{e.moving=false;e.face=fa;
    if(b3at(e,I.sink)){e.hidden=true;e.air=1;b3fx(e,'osink',e.x,e.y)}
    if(e.stT<=0){e.hidden=true;e.air=1;e.swT=0;e.swPool=null;
      // the second time in the second phase: from the ink pool nearest to you (if one is within 150 px), else a shorter swim
      if(e.dive2){const Z=ocInks().filter(z=>Math.hypot(z.x-P.x,z.y-P.y)<150);if(Z.length){Z.sort((a,b)=>Math.hypot(a.x-P.x,a.y-P.y)-Math.hypot(b.x-P.x,b.y-P.y));e.swPool=Z[0];B.boil={t:.3,max:.3};e.swMax=.3}else e.swMax=.9}
      else e.swMax=1.4;b3go(e,'swim',999)}break}
  case 'swim':{e.moving=false;e.hidden=true;e.air=1;e.swT=(e.swT||0)+rdt;
    if(e.swPool){e.alpha=clamp(1-e.swT/.3,0,1);if(e.swT>=.3){const z=e.swPool;e.swPool=null;e.x=z.x;e.y=z.y;z.t=Math.min(z.t,.4);moveCircle(e,0,0);ocRise(e,56,10)}break}
    const dd=Math.hypot(P.x-e.x,P.y-e.y);
    if(dd<20||e.swT>=e.swMax){ocRise(e,e.dive2?56:60,e.dive2?10:(p2?16:12));break}
    {const an=navAngle(e),v=(p2?135:120)*rdt;moveCircle(e,Math.cos(an)*Math.min(v,dd),Math.sin(an)*Math.min(v,dd));e.face=ocFace(an);
      if(Math.random()<(LOWFX?.25:.5))G.fx.push({k:'bub',x:e.x-Math.cos(an)*rand(14,30)+rand(-6,6),y:e.y-Math.sin(an)*rand(10,20)+rand(-4,4),t:.6,r:rand(2,4)})}
    break}
  case 'rise':{e.moving=false;e.face=fa;if(e.alpha<1)e.alpha=Math.min(1,(e.alpha||0)+rdt/.25);
    if(b3at(e,I.rise)){const r=e.riseR||60;if(Math.hypot(P.x-e.x,P.y-e.y)<r+P.r*.4&&ocCan())hurtP(Math.round(26*DMG()));
      const n=e.riseN||12,o=rand(0,TAU);for(let i=0;i<n;i++){shootE(e.x,e.y-14,o+i*TAU/n,115,7,11,'bubble');const pj=G.eproj[G.eproj.length-1];if(pj)pj.ph=rand(0,TAU)}
      e.hidden=false;e.alpha=1;b3fx(e,'orise',e.x,e.y);shake(7);sfx('splash',2,e.x);G.ripples.push({x:e.x,y:e.y,r:12,max:90,a:1});
      vfxBlast(e.x,e.y,'120,220,210',90,{sparks:B3N(14),spcol:['#ffffff','#9ff0e0','#3aa89a'],dust:0,ring2:false})}
    if(b3at(e,I.riseAir))e.air=0;
    if(e.stT<=0){e.hidden=false;e.air=0;e.alpha=1;if(p2&&!e.dive2){e.dive2=1;b3go(e,'sink')}else{e.dive2=0;ocWalk(e)}}break}
  // ---- MAREA NERA (second phase): the red ring round her pool (to .55), the lily pads (.10), she slams every arm on the water and the
  // black wave runs over the whole room (.55)
  case 'tide':{e.moving=false;e.face=fa;
    if(b3at(e,.1))ocPads(e);
    if(b3at(e,I.tide)){const far=Math.max(...[[L,TOP],[R,TOP],[L,BOT],[R,BOT]].map(([x,y])=>Math.hypot(x-e.x,y-e.y)))+30;B.wave={x:e.x,y:e.y,r:40,max:far,hit:false,tid:B.tid};
      b3fx(e,'otide',e.x,e.y);shake(7);sfx('splash',2,e.x);vib([40,30,60]);if(!LOWFX)fxPush({k:'ring2',x:e.x,y:e.y,rgb:'230,255,248',r0:40,r1:110,t:.4,max:.4,w:6})}
    if(e.stT<=0)ocWalk(e);break}
  // ---- FURIA: no damage, no attacks (she cannot be hit); she stands up on her arms (.20-.50), lights up (.50-.70), roars (.70-.85)
  case 'rage':{e.moving=false;e.face=fa;
    if(b3at(e,.5)){sfx('bubble',2,e.x);for(const q of G.puddles||[])G.ripples.push({x:q.x,y:q.y,r:3,max:q.rx,a:.9})}
    if(b3at(e,.72)){shake(8);vib([60,40,120]);if(BOSS2)ENV2.splash(e.x,e.y,B3N(18),'#d8c8ff');for(let i=0;i<3;i++)setTimeout(()=>{if(G&&G.fx)fxPush({k:'ring2',x:e.x,y:e.y-e.r,rgb:'255,140,230',r0:e.r,r1:e.r*5,t:.45,max:.45,w:6-i*1.5})},i*170)}
    if(e.stT<=0){e.shell=0;e.si=-1;ocBegin(e,'tide')}break}
  default:ocWalk(e)}};
// the turn of her skirt and arms in the Gorgo (in her body, from her face): a turn and a half, slow, fast, slow
function ocWhirlA(k){const W=ocArt('Info'),f=W&&W.whirlA;if(f){try{const v=f(k);if(isFinite(v))return v}catch(err){}}const u=clamp((k-.15)/.7,0,1);return TAU*1.5*(u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2)}
// the suckers stuck to the floor: the heart of the crown is bare, the blows hurt more (the first time in the run, the words); in the rage she
// cannot be hurt
{const _h=hurtE;hurtE=function(e,d){if(OC2ON&&e&&e.type==='octopus'&&!e.dead){
  if(e.shell>0){if(!(e._shF>(G.t||0)-.12)){e._shF=G.t||0;G.fx.push({k:'spark',x:e.x+rand(-20,20),y:e.y-30-rand(0,40),t:.15})}return}
  if(e.st==='stuck'){const A=[...arguments];A[1]=d*1.5;if(!G.ocTxt){G.ocTxt=1;text(e.x,e.y-124,'Colpo alla perla!','#ffd84a',18)}return _h.apply(this,A)}}return _h.apply(this,arguments)}}
// her bars are drawn as her arms, not as stones (in the depth order of the room)
{const _dr=drawRock;drawRock=function(k){if(k&&k.oc){try{const C=G.oc&&G.oc.cage,kc=ocCageK();if(C&&kc>=0&&k.q)ocArmOf(k.q,C,kc)}catch(err){}return}return _dr.apply(this,arguments)}}
{const _cs=castShadow;castShadow=function(k){if(k&&k.oc)return;return _cs.apply(this,arguments)}}
// the call (the mocking when you keep away): the cobra beckons, no bubbles
{const _t=b3taunt;b3taunt=function(e,k){if(e&&e.type==='octopus')e.oCall=k==='laugh2';return _t.apply(this,arguments)}}
// what the model plays: the entrance over its whole length, every move on her clock (the swim as a loop), the slide on its own clock
if(OC2ON){const _nm=n3Move;n3Move=function(e){if(e.type!=='octopus')return _nm.apply(this,arguments);
  if(e.intro>0)return['enter',Math.min(.999,Math.max(0,(e.iT||0)/BOSS_INTRO.octopus))];
  if(e.st==='enter')return['enter',.999];
  const an=(N3.meta.octopus||{}).an||[];
  if(e.st==='swim'&&an.includes('swim')){const d=B3D(e,'swim');return['swim',(((e.mt||0)%d)+d)%d/d]}
  if(e.st&&e.st!=='walk'&&an.includes(e.st))return[e.st,Math.min(.999,Math.max(0,b3k(e)))];
  return _nm.apply(this,arguments)}}
// no charging ring for the states that are no attack
if(OC2ON){const _bf=b2front;b2front=function(e){if(e.type==='octopus'&&OCN.calm.has(e.st))e._b2st=e.st;return _bf.apply(this,arguments)}}
// ---- the dangers in flight and on the floor (real time)
function ocUpdate(dt){const B=G.oc;if(!B)return;
  if(G.state!=='play'){if(B.warn.length||B.blobs.length||B.cage||B.pads.length||B.wave||B.runs.length)ocClear();B.veil=0;return}
  const e=ocBoss();
  for(const L0 of[B.warn,B.runs])for(let i=L0.length-1;i>=0;i--){L0[i].t-=dt;if(L0[i].t<=0)L0.splice(i,1)}
  // the balls of ink land
  for(let i=B.blobs.length-1;i>=0;i--){const b=B.blobs[i];b.t+=dt;if(b.t>=b.dur){B.blobs.splice(i,1);ocInkLand(b)}}
  // the cage lives only while she holds it
  if(B.cage&&!(e&&e.st==='cage')){ocBars(false);B.cage=null}
  if(B.boil){B.boil.t-=dt;if(B.boil.t<=0)B.boil=null}
  // the black wave: 260 px/s; when its front passes over you, 22 and a push (not on a lily pad, not dashing); it washes the ink away and
  // flattens the reeds; then the floor stays wet and shining for 4 s
  const W=B.wave;if(W){const r0=W.r;W.r+=260*dt;const d=Math.hypot(P.x-W.x,P.y-W.y);
    if(!W.hit&&d>=r0&&d<W.r){W.hit=true;if(!ocOnPad()&&ocCan()){hurtP(Math.round(22*DMG()));const u=d>1?1/d:0;P.push={t:.25,vx:(P.x-W.x)*u*160,vy:(P.y-W.y)*u*160}}}
    for(const z of G.zones)if(z.ink&&z.t>.3){const dz=Math.hypot(z.x-W.x,z.y-W.y);if(dz>=r0-z.r*.5&&dz<W.r){z.t=.3;G.ripples.push({x:z.x,y:z.y,r:4,max:z.r,a:.8})}}
    if(G.tufts)for(let i=G.tufts.length-1;i>=0;i--){const t=G.tufts[i],dz=Math.hypot(t.x-W.x,t.y-W.y);if(dz>=r0&&dz<W.r&&Math.random()<.5){G.tufts.splice(i,1);G.debris.push({x:t.x,y:t.y,z:4,vx:(t.x-W.x)/(dz||1)*40,vy:0,vz:14,col:'#5a5a2a',s:2,rot:0,vr:2,life:1.4,leaf:true})}}
    for(const q of B.pads){const dq=Math.hypot(q.x-W.x,q.y-W.y);if(q.pass<0&&q.tid===W.tid&&dq<W.r)q.pass=q.t}
    if(W.r>=W.max){B.wave=null;B.veil=4}}
  // the lily pads: they pop up (0.3 s), float until 1 s after the wave has passed them, sink (0.4 s)
  for(let i=B.pads.length-1;i>=0;i--){const q=B.pads[i];q.t+=dt;if(q.pass>=0&&q.t-q.pass>1.4||q.t>12)B.pads.splice(i,1)}
  if(B.veil>0)B.veil=Math.max(0,B.veil-dt);
  if(B.torch>0){B.torch-=dt;if(B.torch<=0)b3torch('magenta',2.4)}}
{const _u=update;update=function(dt){_u.apply(this,arguments);try{if(OC2ON&&G&&G.oc&&started&&!paused)ocUpdate(dt)}catch(err){console.error(err)}}}
// the k of a lily pad (design: up 0..0.12, floating 0.12..0.85, down 0.85..1)
function ocPadK(q){if(q.t<.3)return .12*q.t/.3;if(q.pass>=0&&q.t-q.pass>1)return Math.min(.999,.85+.15*(q.t-q.pass-1)/.4);return .12+.73*(1-Math.exp(-(q.t-.3)/2.5))}
// ---- the drawings: the model's own pieces if it has them, simple ones if not
function ocArmDraw(x,y,k,f,o){const A=ocArt('Arm');if(A){try{A(x,y,k,f,1,o);return}catch(err){}}
  const h=k<.62?0:k<.68?54*(k-.62)/.06:k<.9?54:54*(1-(k-.9)/.1);ctx.fillStyle=o.ink?'rgba(40,22,64,.75)':'rgba(10,34,38,.7)';ell(x,y,14,7.5);ctx.fill();if(h<1)return;
  ink(2);ctx.beginPath();ctx.moveTo(x-8,y);ctx.quadraticCurveTo(x-6,y-h*.6,x+2,y-h);ctx.quadraticCurveTo(x+4,y-h*.6,x+8,y);ctx.closePath();fs(o.p2?'#1d6a80':'#1d8080')}
function ocPadDraw(q,p2,W){if(W&&W.tid!==q.tid)W=null;const k=ocPadK(q),A=ocArt('Pad'),on=Math.hypot(P.x-q.x,P.y-q.y)<20,lift=W?clamp(1-Math.abs(Math.hypot(q.x-W.x,q.y-W.y)-W.r)/40,0,1):0,wa=W?ocFace(Math.atan2(q.y-W.y,q.x-W.x)):0;
  if(A){try{A(q.x,q.y,k,1,{p2,lift,wa,on});return}catch(err){}}if(k>=.999)return;ctx.fillStyle='#4f8a34';ink(1.6);ell(q.x,q.y-lift*6,20,11);ctx.fill();ctx.stroke();ctx.fillStyle='#ff9ad8';circ(q.x,q.y-3-lift*6,4);ctx.fill()}
function ocBlobDraw(x,y,z,k,p2){const A=ocArt('Blob');if(A){try{A(x,y,z,k,1,{p2});return}catch(err){}}ink(1.8);ctx.beginPath();ctx.ellipse(x,y-z,7,6,k*4,0,TAU);fs('#2a1f40');ctx.fillStyle=p2?'rgba(255,122,208,.7)':'rgba(190,170,255,.6)';circ(x-2,y-z-2,2);ctx.fill()}
// the arms of the cage: k of the posts (design: (p - .25)/.75); an arm out of an ink pool does not whip
function ocCageK(){const B=G.oc,C=B&&B.cage,e=ocBoss();if(!C||!e||e.st!=='cage')return -1;const c0=ocI().cage[0];return clamp((b3k(e)-c0)/(1-c0),0,.999)}
function ocArmOf(q,C,kc){let k=kc;if(q.ink&&k>=.84&&k<.9)k=.83;ocArmDraw(q.x,q.y,k,ocFace(Math.atan2(C.y-q.y,C.x-q.x)),{p2:C.p2,ink:!!q.ink,seed:q.seed})}
// on the floor: the posts while the floor boils and when the arms go back down; while they stand they are bars, drawn with the rocks
// (in the room's depth order, before or after the hero and her). The arms out of the ink pools: in front of the hero or behind him
function ocCageArms(front){const C=G.oc&&G.oc.cage,kc=ocCageK();if(!C||kc<0)return;
  for(const q of C.posts){if(q.hole||front)continue;if(kc<.62||kc>=.9||!G.rocks.some(k=>k.oc&&k.q===q))ocArmOf(q,C,kc)}
  for(const q of C.ink)if(front===(kc>=.62&&q.y>P.y))ocArmOf(q,C,kc)}
// on the floor: the wet veil after the Black Tide, the warnings (the stripes with the light of the suckers, the circles of the ink, the
// ring of the Gorgo as far as her arms, the ring of the Risacca, the circle of the rise with its six ticks, the ring round her pool before
// the Tide), the foam currents of the Gorgo, the cage (its circles, the disc that fills like a clock, the boiling floor), the shadows of
// the balls of ink, the pools boiling before the second rise, the lily pads, the black wave
function ocGround(){const B=G.oc;if(!B)return;const e=ocBoss(),t=G.t||0,red=OCN.red,pu=.55+.3*Math.sin(t*18),K=ocK(),p2=!!(e&&e.p2),lt=p2?OCN.mag:OCN.aqua,fx=!LOWFX;
  if(B.veil>0&&!B.wave){const a=.12*B.veil/4;ctx.save();ctx.beginPath();ctx.rect(L,TOP,R-L,BOT-TOP);ctx.clip();ctx.fillStyle=`rgba(60,48,96,${a*.6})`;ctx.fillRect(L,TOP,R-L,BOT-TOP);
    if(fx){ctx.globalCompositeOperation='lighter';for(let i=0;i<7;i++){const x=L+(i*.137+.06)%1*(R-L),y=TOP+(i*.291+.1)%1*(BOT-TOP);ctx.fillStyle=`rgba(200,240,255,${a*.5})`;ell(x,y,40,6,-.15);ctx.fill()}}ctx.restore()}
  if(fx&&B.runs.length){ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';for(const r of B.runs){const u=1-r.t/r.max,l=Math.max(0,r.len)*u,c=r.p2?OCN.mag:OCN.aqua,x1=r.x+Math.cos(r.a)*l,y1=r.y+Math.sin(r.a)*l;
      ctx.strokeStyle=`rgba(${c},.28)`;ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(r.x,r.y);ctx.lineTo(x1,y1);ctx.stroke();ctx.strokeStyle=`rgba(${c},.6)`;ctx.lineWidth=2.4;ctx.stroke();glow(c,x1,y1,10,.7)}ctx.restore()}
  for(const w of B.warn){const k=1-w.t/w.max;
    if(w.k==='ink'){ctx.strokeStyle=`rgba(${red},${pu})`;ctx.lineWidth=2.5;circ(w.x,w.y,w.r);ctx.stroke();ctx.fillStyle=`rgba(${red},${.08+.24*k})`;circ(w.x,w.y,w.r*k);ctx.fill();
      if(fx&&k>.3){ctx.save();ctx.globalCompositeOperation='lighter';glow(w.p2?OCN.mag:OCN.aqua,w.x,w.y,w.r*1.1,.16*k,w.r*.7);ctx.restore()}}
    else if(w.k==='whirl'){ctx.strokeStyle=`rgba(${red},${pu})`;ctx.lineWidth=2.5;ctx.setLineDash([8,7]);ell(w.x,w.y,w.r,w.r*K);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle=`rgba(${red},${.06+.16*k})`;ell(w.x,w.y,w.r*k,w.r*k*K);ctx.fill()}
    else if(w.k==='ring'){ctx.strokeStyle=`rgba(${red},${.4+.2*Math.sin(t*10)})`;ctx.lineWidth=2;ctx.setLineDash([7,7]);circ(w.x,w.y,w.r);ctx.stroke();ctx.setLineDash([])}
    else if(w.k==='rise'){ctx.fillStyle=`rgba(0,0,0,${.12+.22*k})`;ell(w.x,w.y,w.r*(.3+.6*k),w.r*(.3+.6*k)*.5);ctx.fill();ctx.fillStyle=`rgba(${red},${.1+.2*k})`;circ(w.x,w.y,w.r*k);ctx.fill();
      ctx.strokeStyle=`rgba(${red},${pu})`;ctx.lineWidth=2.5;circ(w.x,w.y,w.r);ctx.stroke();
      for(let i=0;i<6;i++){const a=-Math.PI/2+i*TAU/6,on=k>=(i+1)/6;ctx.fillStyle=on?'rgba(255,240,200,.95)':`rgba(${red},.6)`;circ(w.x+Math.cos(a)*w.r*1.1,w.y+Math.sin(a)*w.r*1.1,on?3:2);ctx.fill()}
      if(fx){ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<5;i++){const u=(t*1.3+i*.2)%1,a=i*1.3+t;ctx.strokeStyle=`rgba(${lt},${.5*(1-u)})`;ctx.lineWidth=1.2;circ(w.x+Math.cos(a)*w.r*.45,w.y+Math.sin(a)*w.r*.3,2+u*5);ctx.stroke()}ctx.restore()}}
    else if(w.k==='tide'){ctx.strokeStyle=`rgba(${red},${.5+.4*Math.sin(t*12)})`;ctx.lineWidth=3;ell(w.x,w.y,w.r,w.r*K);ctx.stroke();ctx.strokeStyle=`rgba(${red},${.25*k})`;ctx.lineWidth=8;ell(w.x,w.y,w.r+6,(w.r+6)*K);ctx.stroke()}}
  // the Gorgo while it hurts: the ring as far as her arms flashes; the foam currents turning round her (not red: they do not hurt)
  if(e&&e.st==='whirl'){const I=ocI(),k=b3k(e),[w0,wD,wE]=I.whirl;
    if(k>=wD&&k<wE){ctx.strokeStyle=`rgba(${red},${Math.sin(t*26)>0?.9:.55})`;ctx.lineWidth=3;ell(e.x,e.y,92,92*K);ctx.stroke();ctx.fillStyle=`rgba(${red},.08)`;ell(e.x,e.y,92,92*K);ctx.fill()}
    if(fx&&k<.92){const al=.32*Math.min(1,k/.1)*Math.min(1,(.92-k)/.1),sp=ocWhirlA(k);ctx.save();ctx.strokeStyle=`rgba(230,255,248,${al})`;ctx.lineWidth=1.8;ctx.lineCap='round';
      for(let j=0;j<3;j++){ctx.beginPath();for(let i=0;i<=26;i++){const r=40+i*7,a=sp*.6+j*TAU/3+i*.16-t*.8;i?ctx.lineTo(e.x+Math.cos(a)*r,e.y+Math.sin(a)*r*K):ctx.moveTo(e.x+Math.cos(a)*r,e.y+Math.sin(a)*r*K)}ctx.stroke()}ctx.restore()}}
  // the cage: the circles of the posts (until they burst), the disc in the middle that fills like a clock until the whip
  const C=B.cage;if(C&&e&&e.st==='cage'){const I=ocI(),k=b3k(e),[c0,cU,cW]=I.cage,fk=clamp((k-c0)/(cW-c0),0,1);
    if(k<cW+.02){ctx.fillStyle=`rgba(${red},${.08+.16*fk})`;ctx.beginPath();ctx.moveTo(C.x,C.y);ctx.arc(C.x,C.y,46,-Math.PI/2,-Math.PI/2+TAU*fk);ctx.closePath();ctx.fill();
      ctx.strokeStyle=`rgba(${red},${pu})`;ctx.lineWidth=2;ctx.setLineDash([7,6]);circ(C.x,C.y,46);ctx.stroke();ctx.setLineDash([])}
    if(k<cU+.03)for(const q of C.posts.concat(C.ink)){if(q.hole)continue;const kk=clamp((k-c0)/(cU-c0),0,1);ctx.strokeStyle=`rgba(${red},${pu})`;ctx.lineWidth=2.4;circ(q.x,q.y,18);ctx.stroke();ctx.fillStyle=`rgba(${red},${.06+.2*kk})`;circ(q.x,q.y,18*kk);ctx.fill()}}
  ocCageArms(false);
  for(const b of B.blobs){const u=clamp(b.t/b.dur,0,1),x=b.x0+(b.tx-b.x0)*u,y=b.y0+(b.ty-b.y0)*u,s=.4+.6*u;ctx.fillStyle=`rgba(0,0,0,${.12+.2*u})`;ell(x,y+2,8*s,3.5*s);ctx.fill()}
  if(B.boil&&fx){const k=1-B.boil.t/B.boil.max;for(const z of ocInks())for(let i=0;i<4;i++){const u=(t*2.2+i*.25)%1,a=i*1.7+z.x;ctx.strokeStyle=`rgba(255,140,230,${.55*(1-u)*k})`;ctx.lineWidth=1.2;circ(z.x+Math.cos(a)*z.r*.5,z.y+Math.sin(a)*z.r*.3-u*5,2+u*3);ctx.stroke()}}
  for(const q of B.pads)ocPadDraw(q,p2,B.wave);
  // the black wave: the ink water behind, a band 22 wide, the crest of foam in front
  const W=B.wave;if(W){ctx.save();ctx.beginPath();ctx.rect(L,TOP,R-L,BOT-TOP);ctx.clip();const r=W.r,ri=Math.max(1,r-52);
    if(fx){ctx.fillStyle='rgba(60,48,96,.07)';circ(W.x,W.y,ri);ctx.fill()}
    const g=ctx.createRadialGradient(W.x,W.y,ri,W.x,W.y,r);g.addColorStop(0,'rgba(42,31,64,0)');g.addColorStop(.4,'rgba(42,31,64,.42)');g.addColorStop(.85,'rgba(30,60,72,.62)');g.addColorStop(1,'rgba(42,31,64,.7)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(W.x,W.y,r,0,TAU);ctx.arc(W.x,W.y,ri,0,TAU,true);ctx.fill();
    if(fx){ctx.globalCompositeOperation='lighter';ctx.strokeStyle='rgba(150,240,225,.35)';ctx.lineWidth=9;circ(W.x,W.y,r-2);ctx.stroke();ctx.globalCompositeOperation='source-over'}
    ctx.strokeStyle='#e6fff8';ctx.lineWidth=3;circ(W.x,W.y,r-1);ctx.stroke();
    if(fx){ctx.fillStyle='rgba(230,255,248,.85)';for(let i=0;i<36;i++){const a=i/36*TAU+Math.sin(i*7.3)*.05,rr=r+1+((i*13)%5);circ(W.x+Math.cos(a)*rr,W.y+Math.sin(a)*rr-((t*40+i*7)%8),1.4);ctx.fill()}}
    ctx.restore()}}
// in the air: the balls of ink in flight, the arms of the cage in front of the hero
function ocAir(){const B=G.oc;if(!B)return;
  for(const b of B.blobs){const u=clamp(b.t/b.dur,0,1),x=b.x0+(b.tx-b.x0)*u,y=b.y0+(b.ty-b.y0)*u,z=b.z0*(1-u)+90*Math.sin(Math.PI*u);ocBlobDraw(x,y,z,u,b.p2)}
  ocCageArms(true)}
{const _g2=drawHazards2Ground;drawHazards2Ground=function(){_g2.apply(this,arguments);try{if(OC2ON)ocGround()}catch(err){}}}
{const _a2=drawHazards2Air;drawHazards2Air=function(){_a2.apply(this,arguments);try{if(OC2ON)ocAir()}catch(err){}}}
// ---- the arena reacts to the new blows (the others are in 87-boss3-arena.js: oslam, oink, owhirl, osink, orise, phase2)
// the marks of the suckers: dark wet rings with a light rim and a sheen (baked in the floor, like the other marks)
{const _m=b3mark;b3mark=function(kind,x,y,r){if(kind!=='suck')return _m.apply(this,arguments);const c=fx;if(!c)return;c.save();c.setTransform(2,0,0,2,0,0);
  c.fillStyle='rgba(12,30,34,.42)';c.beginPath();c.ellipse(x,y,r,r*.6,0,0,TAU);c.fill();c.strokeStyle='rgba(18,40,44,.7)';c.lineWidth=1.2;c.beginPath();c.ellipse(x,y,r*.62,r*.38,0,0,TAU);c.stroke();
  c.strokeStyle='rgba(200,240,232,.38)';c.lineWidth=.9;c.beginPath();c.ellipse(x,y,r,r*.6,0,Math.PI*1.05,Math.PI*1.95);c.stroke();c.fillStyle='rgba(230,255,248,.35)';c.beginPath();c.ellipse(x-r*.3,y-r*.22,r*.22,r*.1,0,0,TAU);c.fill();c.restore()}}
// the ring of broken stone where an arm of the cage went down, with water and two strands of weed in it
function ocHole(x,y){const c=fx;if(!c)return;c.save();c.setTransform(2,0,0,2,0,0);const g=c.createRadialGradient(x,y,1,x,y,12);g.addColorStop(0,'rgba(14,30,32,.75)');g.addColorStop(.7,'rgba(30,60,62,.5)');g.addColorStop(1,'rgba(0,0,0,0)');
  c.fillStyle=g;c.beginPath();c.ellipse(x,y,12,7,0,0,TAU);c.fill();c.fillStyle='rgba(200,240,232,.22)';c.beginPath();c.ellipse(x-3,y-2,4,1.4,0,0,TAU);c.fill();c.lineCap='round';
  for(const s of[-1,1]){c.strokeStyle='#3e6a28';c.lineWidth=1.6;c.beginPath();c.moveTo(x+s*4,y+1);c.quadraticCurveTo(x+s*10,y-2,x+s*14,y+3);c.stroke();c.strokeStyle='#78a043';c.lineWidth=.8;c.stroke()}c.restore()}
const OCFX={
  // the arm stuck to the floor: two rows of six suckers' marks along it, a drop for each sucker
  ostuck(e,x,y,S){if(!S)return;const ca=Math.cos(S.a),sa=Math.sin(S.a),nx=-sa,ny=ca;for(let i=0;i<6;i++){const s=34+(S.len-40)*i/5,r=4.2-2.2*i/5;
      for(const sd of[-1,1]){const px=S.x+ca*s+nx*sd*6,py=S.y+sa*s+ny*sd*6;b3mark('suck',px,py,r);if(!LOWFX||i%2===0)G.debris.push({x:px,y:py,z:10,vx:rand(-8,8),vy:rand(-4,4),vz:rand(30,60),col:'#bfe9e0',s:1.5,rot:0,vr:0,life:1.2,drop:true})}}},
  // an arm of the cage gone down: the ring of broken stone with water and weed, a little puddle (at most 8 in a fight), the obstacles shake
  ocage(e,x,y){const B=G.b3||{};ENV2.mark('cracks',x,y,16);ocHole(x,y);if((B.pud=(B.pud||0)+1)<=8)ENV2.mark('puddle',x,y+3,12);ENV2.rocks(x,y,90,.5);ENV2.fall(B3N(3))},
  // the Black Tide: the torches dim and come back magenta, drops from the ceiling, every puddle trembles; the wave flattens the reeds and
  // leaves the floor wet (ocUpdate, ocGround)
  otide(e,x,y){b3torch('dim',.6);const B=ocB();B.torch=.6;ENV2.fall(B3N(10));for(const q of G.puddles||[])G.ripples.push({x:q.x,y:q.y,r:3,max:q.rx,a:.9})}};
{const _f=b3fx;b3fx=function(e,what,x,y,r){if(!OC2ON||!OCFX[what])return _f.apply(this,arguments);if(!BOSS2||!G||!G.rocks)return;try{OCFX[what](e,x,y,r)}catch(err){}}}
// ---- the entrance (3.4 s, the model's 'enter'): a dark pool spreads on her water and boils, two amber eyes open under it, the tip of a
// hand taps three times, she rises with the water running off her, the throne's arms uncurl, the Pearl lights up, she slaps the water,
// roars, and looks down at you
if(OC2ON)B3IN.octopus=(e,t,t0,at,roar)=>{e.em=t<3.13?.999:1;e.face=ocFace(Math.atan2(P.y-e.y,P.x-e.x));
  if(t0===0){if(!G.oc)ocReset();if(G.swampPool){e.x=G.swampPool.x;e.y=G.swampPool.y-8}shake(2);sfx('bubble',2,e.x)}
  if(t<1.4&&Math.random()<(LOWFX?.3:.7))G.fx.push({k:'bub',x:e.x+rand(-50,50),y:e.y+rand(-16,18),t:.6,r:rand(2,5)});
  if(at(.6))sfx('shimmer',0,e.x);
  for(const s of[1.05,1.19,1.33])if(at(s)){const q=b3pt(e,62,26);sfx('bubble',0,q.x);G.ripples.push({x:q.x,y:q.y-8,r:3,max:18,a:1})}
  for(const s of[1.77,2.04])if(at(s))sfx('splash',0,e.x);
  if(at(2.24))sfx('shimmer',1,e.x);
  if(at(2.55)){shake(5);sfx('splash',2,e.x);vfxBlast(e.x,e.y,'120,220,210',110,{sparks:B3N(14),spcol:['#ffffff','#9ff0e0','#3aa89a'],dust:0,ring2:false});G.ripples.push({x:e.x,y:e.y,r:10,max:100,a:1});
    if(BOSS2)for(const s of[-1,1]){const q=b3pt(e,40,56*s);ENV2.splash(q.x,q.y-8,B3N(8),'#cfe9d8')}}
  if(at(2.79))roar()};
// ---- the defeat (4 s, the model's 'die'; the bar and «sconfitto» at 2.2 s): bubbles while she sinks, the plop of the crown falling on
// the water, the last tinkle of the Pearl
if(OC2ON)B3DIE.octopus={setup(c){ocClear();if(G._tT>0&&G.env&&G.env._base)G._tT=.01},
  tick(c,dt,D,p){if(p>.25&&p<.8&&Math.random()<(LOWFX?.3:.7))cpart(c,{k:'bubble',x:c.x+rand(-30,30),y:c.y-rand(0,16),vz:rand(20,50),ph:rand(0,6),life:rand(.5,1),r:rand(2,5)});
    if(p>=.55&&!c.plop){c.plop=1;sfx('splash',0,c.x);cpart(c,{k:'ripple',x:c.x,y:c.y,life:1.2,r:16})}
    if(p>=.9&&!c.tink){c.tink=1;sfx('shimmer',0,c.x)}}};
// ---- the voice: the gurgling throat of today a fifth lower, dark vowels, more gurgle, a long whale's breath under the great cries.
// «Hooommm… AAARGH» at the entrance, a gurgling roar ending in a high whale's moan in the rage, «hmm-hm-hm» and a puff when she mocks you,
// «Mmmh?» when she calls you out, a voice for each move, a long moan that sinks into bubbles when she falls, «Oh-ho-ho… glub» if you fall
if(OC2ON){
  const ha=(n,t0,step,d,fa,fb,v,o)=>[...Array(n)].map((_,i)=>{const f=fa+(fb-fa)*i/Math.max(1,n-1);return{t:t0+i*step,d,f:[f*1.04,f*.94],v,a:1-i*.06,h:.3,...(o||{})}});
  B3VO.VB.octopus={base:{br:.35,ro:.3,ji:.08,gu:.45,lp:.42},k:{
    cry:[[1.5,[{t:0,d:.45,f:[70,82],v:['m','o'],h:.1,gu:.3},{t:.5,d:.95,f:[95,120,62],v:['o','a','u'],ro:.5,gu:.6,vib:[.03,4.5],rel:.45}],.6]],
    angry:[[1.4,[{t:0,d:.6,f:[72,80],v:'o',ro:.85,gu:.6},{t:.62,d:.75,f:[150,210,170],v:['u','o'],vib:[.04,5],br:.5,gu:.2,rel:.5}],.55]],
    laugh:[[1,[...ha(3,0,.16,.12,98,84,'m',{h:.2}),{t:.55,d:.35,noise:1,v:'u',a:.6,gu:1}],.7]],
    laugh2:[[.9,[{t:0,d:.45,f:[72,104],v:'m',h:.2},{t:.5,d:.35,f:[80,66],v:'u',gu:.9,a:.6}],.5]],
    hurt:[[.3,[{t:0,d:.26,f:[110,72],v:['m','u'],gu:.9,att:.05}],.42]],
    c_slam:[[.26,[{t:0,d:.24,f:[120,92],v:'a',ro:.4,h:.25}],.54]],
    c_ink:[[.52,[0,.17,.34].flatMap((t0,i)=>[{t:t0,d:.05,noise:1,v:'u',hs:.3,a:.8},{t:t0+.045,d:.1,f:[150-15*i,140-15*i],v:'u',a:.8}]),.64]],
    c_cage:[[.82,[{t:0,d:.8,f:[62,95],v:'m',gu:.4,rel:.35}],.52]],
    c_whirl:[[.72,[{t:0,d:.7,f:[88,120,95],v:['o','u'],am:[.3,8]}],.54]],
    c_dive:[[.52,[{t:0,d:.2,f:[85,60],v:'u',gu:1,a:.85},{t:.27,d:.22,f:[85,60],v:'u',gu:1,a:.8}],.44]],
    c_tide:[[1.32,[{t:0,d:1.3,f:[68,100,130],v:['o','a'],ro:.3,vib:[.025,4],rel:.35}],.56]],
    die:[[1.85,[{t:0,d:1.8,f:[110,85,48],v:['o','u'],gu:.9,vib:[.05,3.5],rel:.5}],.42]],
    win:[[1.1,[...ha(3,0,.17,.13,100,86,'o'),{t:.6,d:.42,f:[80,55],v:'u',gu:1,a:.7}],.52]]}};
  B3CUE.octopus={slam:'c_slam',slam2:'c_slam',ink:'c_ink',cage:'c_cage',whirl:'c_whirl',sink:'c_dive',tide:'c_tide'};
  // under the great cries a long breath, like a whale (the bubbles of 88 stay)
  {const _m=b3sayMore;b3sayMore=function(e,k,t){_m.apply(this,arguments);if(e.type!=='octopus')return;try{const v=Math.max(.55,enemyAt(e))*(B3VX[k]||.75);
    if(k==='cry'||k==='angry'||k==='die'||k==='c_tide')fNoise(t+.06,k==='die'?1.9:1.4,'lowpass',VR(320,.1),.7,.05*v,{brown:true,att:.4})}catch(err){}AU.pan=0}}}
// ---- for the previews (anteprime/mk_boss2.py) and the tests (tests/boss2gioco.js): how to get into its room, its moves in each phase,
// the dangers it puts in the room (counted by the tests), the clips of its voice
if(OC2ON){const R=window.BCL||(window.BCL={});R.octopus={n:'La Piovra della Palude',arena:10,p2:true,
  enter(){G.arena=10;G.chapter=ARENAS[10].ch;G.diff=ARENAS[10].diff;G.bossLvl=null;G.room=ROOMS;G.event=null;buildRoom()},
  moves:['slam','stuck','ink','cage','whirl','sink','swim','rise'],moves2:['rage','tide','slam2'],
  hz(){const B=G.oc||{},W=B.warn||[],n=k=>W.filter(w=>w.k===k).length,C=B.cage;return{avvisi:W.length+((G.b3&&G.b3.warn)||[]).length,strisce:(B.runs||[]).length,
    cerchi_inchiostro:n('ink'),palle:(B.blobs||[]).length,pozze:G.zones.filter(z=>z.ink&&z.t>.4).length,gorgo:n('whirl'),risacca:n('ring'),agguato:n('rise'),
    posti_gabbia:C?C.posts.filter(q=>!q.hole).length+C.ink.length:0,sbarre:G.rocks.filter(k=>k.oc).length,ninfee:(B.pads||[]).length,marea:B.wave?1:0,
    bolle:G.eproj.filter(q=>q.kind==='bubble').length,onde:G.waves.length}},
  voice:['cry','laugh','angry','die']}}
