// =====================================================================
// IL RE ROSPO RIFATTO: «il Tiranno delle Lucciole» (Denis, 15 ottobre: «rivisita tutti i boss … possenti, belli, fighi, che diano
// timore nello sfidarli», «migliora anche le loro abilità speciali»; 16 ottobre, dopo il Golem: «sì, fai gli altri 12»). ANTEPRIMA: questo
// file e il modello sprite/nemici3d/toad2.js entrano solo nella copia del gioco fatta da anteprime/mk_boss2.py; nel gioco vero dopo il sì
// di Denis (il modello prende il posto di 'toad' e questo file va in src/ordine.txt). Design e numeri: docs/boss-classici-design/toad.md.
// Il rospo più grosso e prepotente della Palude delle Lucciole: per diventare re si è ingozzato delle lucciole della sua palude e la loro
// luce gli vive dentro. Prima di ogni colpo la luce gli corre sotto la pelle fino al punto da cui partirà (il suo avviso, come il cuore del
// Golem) e si sente un tintinnio di vetro. Ogni stato ha il nome di una mossa del modello; il colpo vero parte nel suo fotogramma (b3at,
// 81-boss3-base.js). Mosse:
// - Linguata (tongue): una striscia rossa ti segue e si blocca; la lingua corre lungo la striscia (300 px, la ferma il primo ostacolo). Se
//   ti prende ti tira davanti a lui (uno scatto ti stacca: «Strappo!») e poi ti prende in giro; se manca resta incollata (stuck, 1,1 s): è
//   indifeso e i colpi fanno +50% («Lingua incollata!»).
// - Panciata (flop): un cerchio rosso ti segue e si blocca, le sue tre lucciole ci girano sopra; salta e ricade di pancia: un'onda d'acqua
//   e tre chiazze di fango che rallentano. Nella fase 2 tre di fila; l'ultima, la Panciata Reale, più grande e con l'onda più lunga.
// - Rutto di bolle (bubbles): un ventaglio rosso, poi due file di bolle con una lucciola dentro (uscire dal ventaglio o passare nei varchi).
// - Tamburo di pancia (drum): tre anelli d'acqua bassi (quattro nella fase 2) con un corridoio senza onda che non punta mai verso di te
//   (nella fase 2 gira di 15° a ogni anello), l'ultimo intero; poi indica le pozze e da ognuna salta fuori un girino.
// - Frustata (sweep, fase 2): un ventaglio rosso che la lingua spazza da un lato all'altro (la freccia dice il verso); ti spinge via.
// - Pioggia di lucciole (rain, fase 2): tossisce lucciole arancio che ricadono in sette cerchi (il primo sotto di te, tre intorno a lui,
//   tre che ti inseguono).
// - Furia (rage, a metà vita): batte i pugni, si mangia le lucciole della stanza (la stanza non si scurisce), la sua luce diventa brace e
//   le torce arancio; il gracidio; poi tutto 1,25 volte più rapido.
// Entrata (enter): cade dal cielo di pancia sul cerchio di rune, le tife scattano su, la corona gli ricade in testa, il gracidio reale.
// Sconfitta (die): si gonfia, sputa tutte le lucciole in una fontana di luce (restano nella stanza), si sgonfia e torna un rospetto qualunque
// che si tuffa nel fango; resta la corona. È il boss dell'arena 3: mai due attacchi insieme, ogni danno con un avviso a terra di almeno
// 0,6 s veri (anche nella fase 2), dopo ogni mossa almeno 1 s di camminata. Gli avvisi tondi sul pavimento sono ellissi 1 : 0,6 (il
// pavimento visto dalla telecamera dei modelli) e colpiscono esattamente dove si vedono; i pericoli stanno sul pavimento (i piedi
// dell'eroe sono 8 px sotto il suo punto).
// =====================================================================
const TKON=typeof N3!=='undefined'&&!!N3.toad2;
const TK={seq1:['tongue','flop','bubbles','tongue','drum','flop'],seq2:['rain','sweep','flop3','bubbles','tongue','drum'],red:'229,72,77',lime:'200,240,90',
  ember:'255,150,60',K:.6,FY:8,sp2:1.25,deg:Math.PI/180,orange:[['#ff6a10','#ffb040','#fff0c8'],'255,170,90'],
  // when the light of the swallowed fireflies runs inside him toward the blow (the model's signal): [from, to] in the move
  sig:{tongue:[.05,.55],sweep:[.05,.52],flop:[.05,.30],bubbles:[.03,.60],drum:[.03,.32],rain:[.03,.35]},
  // the glass tinkle of that light, when it starts to run (in the move)
  glass:{tongue:[.05],sweep:[.05],flop:[.05,.15],bubbles:[.03],drum:[.03],rain:[.03]}};
if(TKON){
  // the new model in place of the old one (its drawing of today stays as N3.meta.toad.old for the pages)
  const old=N3.toad,oldM=N3.meta.toad;N3.toad=N3.toad2;N3.meta.toad=Object.assign({},N3.meta.toad2,{old:(x,y,f,a,p)=>old(x,y,f,oldM.an.includes(a)?a:'idle',p,oldM.sc||1,{})});
  ET.toad.r=40;BOSS_INTRO.toad=3.4;Object.assign(BDEATH,{toad:{dur:4,clou:2,snd:'splash'}});
  // the bar, the halo and the colours; the 2D flies, glint, drool and swarm of the old king go (the model draws all of it), and so do the
  // old warnings (this brain draws its own) and the game's shadow (the model has its own, it grows in the entrance)
  B2H.toad=100;B2T.toad=[[TK.lime,TK.ember],B2T.toad[1]];B2.toad.front=()=>{};ETELE.toad=()=>{};ESHADOW.toad=()=>{};
  // the belly is a lantern: always lit, stronger while the light runs toward a blow
  ELIGHT.toad=(e,Lt)=>{if(e.hidden||e.intro>0&&(e.iT||0)<1.5)return;const s=tkSig(e),p2=!!e.p2;Lt(e.x,e.y-26,(p2?110:90)*(1+.3*s),(p2?.6:.45)+.3*s)};
  // what the game passes to the model: the tip of the tongue, the side of the Frustata, the chained belly flops, the pool it points at, its
  // fireflies flown onto the landing circle, the height of its leaps (only while it leaps: otherwise the model keeps its own); the walk
  // follows its own clock
  // (wk: how far into its crawl it is, so the first step grows out of the pose at rest and the last goes back to it)
  N3G.zm.toad=1;
  N3G.opt.toad=e=>({tip:e.tkTip||undefined,side:e.tkSide||1,chain:!!e.tkChain,point:e.tkPoint,noFlies:!!e.tkNoFlies,
    z:e.st==='flop'||e.st==='walk'&&e.p2?(e.z||0):undefined,wk:e.st==='walk'&&!e.p2?Math.max(0,Math.min(1,(e.wt||0)/.35,(e.stT||0)/.3)):undefined});
  N3G.wp.toad=e=>{const d=B3D(e,'walk');return(((e.wt||0)%d)+d)%d/d};
  // (its line in the guide is in 44-guida.js, with the others)
  VINTO.rospo='Il Re Rospo si è sgonfiato. Le lucciole sono libere.'}
// ---- helpers
// the model's own drawings of the pieces of its attacks (design: Bubble(x,y,z,r,ph,sc,o), Fly(x,y,z,k,sc,o), Mud(x,y,r,k,sc,o),
// Crown(x,y,z,rot,sc,o), x, y the floor point, z the height); the game's simple drawings if the model has none
const tkArt=n=>N3['toad'+n]||N3['toad2'+n]||null;
const tkS=e=>e&&e.p2?1.12:1;// the model is 12% bigger in the second phase
// a body point of the model on the screen (the feet are 8 px under the game's point), with the face it is drawn with
const tkPt=(e,bx,by,bz,face)=>{const f=face!=null?face:e.f3!=null?e.f3:(e.face||0),s=tkS(e),q=C3.V(f).P([bx*s,by*s,(bz||0)*s]);return{x:e.x+q[0],y:e.y+8+q[1]}};
// the floor under a body point as a game point (where a hero standing on it would be)
const tkGp=(e,bx,by,face)=>{const q=tkPt(e,bx,by,0,face);return{x:q.x,y:q.y-TK.FY}};
// distances on the floor as they look (a circle on the floor is an ellipse 1 : .6)
const tkD=(x,y,X,Y)=>Math.hypot(X-x,(Y-y)/TK.K);
const tkBoss=()=>G&&G.enemies?G.enemies.find(q=>q.type==='toad'&&!q.dead):null;
// the tip of the tongue for the model: the screen offset from its drawing point of a game point (x, y) at height h, and h (the model
// draws the tongue exactly to it, and hides behind its head what is behind it)
const tkTipXY=(e,x,y,h)=>[x-e.x,y-e.y-h,h];
const tkMouthTip=e=>{const q=tkPt(e,36,0,55);return[q.x-e.x,q.y-e.y-8,55*tkS(e)]};
const tkLerp=(a,b,u)=>[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,(a[2]||0)+((b[2]||0)-(a[2]||0))*u];
// how strong the light running inside him is now (0..1)
const tkSig=e=>{const w=TK.sig[e.st];if(!w||e.intro>0)return 0;const k=b3k(e);return k<w[0]||k>w[1]?0:Math.min(1,(k-w[0])/.08,(w[1]-k)/.04+.3)};
function tkReset(){if(G)G.tk={warn:[],strip:null,fan:null,orb:null,lane:null,pre:null,rings:[],rain:[],rainQ:[],tads:[],up:[],bub:[],pops:[],eat:[],scare:null}}
function tkDreset(){if(G)G.tkd={free:[],sit:null}}
{const _br=buildRoom;buildRoom=function(){tkReset();tkDreset();return _br.apply(this,arguments)}}
const tkB=()=>G.tk||(tkReset(),G.tk);
// how far from (x,y) along a before a wall or an obstacle (its trees and reed beds stop the tongue)
function tkReach(x,y,a,max){const ca=Math.cos(a),sa=Math.sin(a);for(let s=0;s<max;s+=4){const px=x+ca*s,py=y+sa*s;if(px<L+2||px>R-2||py<TOP+2||py>BOT-2)return{len:s,wall:true};
    const k=G.rocks.find(k=>!k.temp&&Math.hypot(k.x-px,k.y-py)<k.r);if(k)return{len:s,rock:k}}return{len:max}}
// ---- the arena reacts (52-boss2-arena-reagisce.js): the lily pads jump, the reeds shake and lose their heads, twigs and leaves fall
function tkLilies(x,y,R,n){const L0=(G.puddles||[]).filter(p=>p.swamp&&Math.hypot(p.x-x,p.y-y)<R);if(!L0.length)return;
  for(let i=0;i<n;i++){const p=L0[i%L0.length];G.debris.push({x:p.x+rand(-p.rx,p.rx)*.6,y:p.y+rand(-p.ry,p.ry)*.5,z:2,vx:rand(-24,24),vy:rand(-10,10),vz:rand(90,170),
    col:pk(['#4f8a34','#5f9e3c','#3f7a2a']),s:rand(2.6,3.8),rot:rand(0,TAU),vr:rand(-7,7),life:1.6,wet:true})}}
function tkRockHit(r,lash){if(BOSS2)ENV2.rocks(r.x,r.y,r.r+6,0);for(let i=0;i<B3N(lash?6:4);i++)G.debris.push({x:r.x+rand(-r.r,r.r)*.6,y:r.y+rand(-3,3),z:kH(r)*rand(.5,1),
  vx:rand(-50,50),vy:rand(-18,18),vz:rand(30,90),col:pk(lash?['#6b3f22','#8a5a2a','#7a8a3a']:['#6b5a48','#4a3c30','#7a6a50']),s:rand(1.6,2.6),rot:rand(0,TAU),vr:rand(-8,8),life:1.8})}
function tkLeaves(n){for(let i=0;i<B3N(n);i++)G.debris.push({x:rand(L+10,R-10),y:rand(TOP+20,BOT-10),z:rand(180,260),vx:rand(-10,10),vy:0,vz:-20,col:pk(['#6b5a48','#5a7a2a','#7a8a3a','#8a6a3a']),
  s:rand(2,3.4),rot:rand(0,TAU),vr:rand(-4,4),life:5,leaf:true})}
// the fireflies of the room flee from (x,y) for s seconds
function tkScare(x,y,s){tkB().scare={x,y,t:s,max:s}}
// ---- its sounds (the voice is in B3VO, at the end of this file)
function tkSnd(k,x){if(typeof AU==='undefined'||!AU.ctx||!AU.on.sfx)return;const c=AU.ctx,t=c.currentTime+.005,now=performance.now();
  if(k==='pop'){if(now-(tkSnd.pop||0)<70)return;tkSnd.pop=now}
  AU.pan=x==null?0:Math.max(-.7,Math.min(.7,(x-(G.vx||0)-VW/2)/200));
  try{switch(k){
    case 'thwip':fNoise(t,.11,'bandpass',VR(2600,.08),2.2,.15,{f2:650});fThump(t+.015,VR(420,.06),150,.07,.12);break;
    case 'slurp':fNoise(t,.16,'bandpass',VR(900,.1),3,.1,{f2:1800});fThump(t,220,120,.1,.1);break;
    case 'squelch':fThump(t,VR(180,.1),70,.12,.18);fNoise(t,.1,'lowpass',VR(800,.1),1.4,.12,{brown:true});break;
    case 'tug':fThump(t,VR(150,.08),95,.09,.13);fNoise(t,.05,'bandpass',VR(1200,.1),2,.05);break;
    case 'snap':fThump(t,VR(240,.06),VR(560,.06),.07,.12);fNoise(t,.07,'bandpass',VR(1600,.1),2.5,.09,{f2:3200});break;
    case 'fwip':whoosh(t,.24,700,3400,.13);fNoise(t+.06,.09,'bandpass',VR(1800,.1),1.5,.08);break;
    case 'jump':whoosh(t,.3,400,1600,.08);fThump(t,VR(130,.08),220,.12,.12);break;
    case 'drum':fThump(t,VR(74,.04),46,.34,.42,.15);fNoise(t,.09,'lowpass',VR(420,.1),1.2,.16,{brown:true});fModal(t,VR(150,.05),[1,1.59,2.14],[.16,.09,.05],.05,.2);break;
    case 'boing':fThump(t,VR(200,.08),VR(460,.06),.15,.07);fThump(t+.05,VR(320,.08),VR(250,.06),.09,.04);break;
    case 'clink':coinClink(t,1.4);fModal(t+.02,VR(2600,.04),[1,2.4,3.9],[.4,.25,.15],.045,.4);break;
    case 'tap':fThump(t,VR(170,.06),115,.05,.08);fThump(t+.07,VR(165,.06),112,.05,.07);break;
    case 'fall':whoosh(t,.6,2600,480,.075,.3);break;
    case 'pop':fThump(t,VR(650,.1),VR(1500,.1),.035,.05);fNoise(t,.03,'highpass',3500,.8,.03);break;
    case 'sizzle':fNoise(t,.2,'highpass',VR(3000,.1),.8,.05);fThump(t,VR(500,.1),900,.04,.04);break;
    case 'plop':fThump(t,VR(520,.05),VR(160,.05),.09,.15);fNoise(t,.05,'bandpass',900,2,.05);break;
    case 'bells':[88,92,95,100].forEach((m,i)=>vBell(null,t+i*.09,m,1.4,.028));break;
    case 'cape':fNoise(t,.35,'bandpass',VR(700,.1),.8,.05,{att:.1});break;
    case 'creak':fNoise(t,.25,'bandpass',VR(320,.15),6,.05,{f2:VR(520,.1)});break;
    case 'whistle':{const o=osc('sine',900,t,t+.95),g=c.createGain();o.frequency.exponentialRampToValueAtTime(300,t+.85);g.gain.setValueAtTime(.0001,t);
      g.gain.linearRampToValueAtTime(.045,t+.05);g.gain.exponentialRampToValueAtTime(.0005,t+.9);o.connect(g);route(g,null,.2);fNoise(t,.85,'bandpass',1500,1.3,.05,{f2:450});break}
  }}catch(err){}AU.pan=0}
// the tinkle of glass of the light that runs inside him: three soft notes that climb (in place of the Golem's heartbeat)
function tkGlass(t,v){[1200,1600,2400].forEach((f,i)=>fModal(t+i*.07,VR(f,.015),[1,2.76,5.4],[.28,.14,.07],.028*v,.5))}
// ---- the brain
function tkWalk(e,d){e.wt=0;e.z=0;e.air=0;e.hopA=null;e.tkTip=null;e.tkChain=false;e.tkNoFlies=false;e.tkPoint=undefined;e.tkTri=0;
  // it hit you during its move: first it mocks you (at most once every 9 s: the voices' rule, 88-boss3-voci.js)
  const S=e.b3s||{},now=G.t||0;if(e.tkPend&&now-e.tkPend<4.5&&now-(S.tauntT==null?-99:S.tauntT)>9){e.tkPend=0;b3taunt(e);return}e.tkPend=0;
  b3go(e,'walk',d||rand(1,1.4))}
const tkPeek=e=>{const s=e.p2?TK.seq2:TK.seq1;return s[((e.si==null?-1:e.si)+1)%s.length]};
function tkNext(e,a){const s=e.p2?TK.seq2:TK.seq1;e.si=((e.si==null?-1:e.si)+1)%s.length;tkStart(e,s[e.si],a)}
function tkStart(e,nx,a){const B=tkB();e.moving=false;e.z=0;e.air=0;e.tkTip=null;e.tkHit=false;e.tkSnapT=null;e.tkChain=false;e.tkTri=0;
  if(nx==='flop3'){e.tkTri=1;nx='flop'}
  if(B.pre!==nx){if(B.pre==='sweep')B.fan=null;if(B.pre==='drum')B.lane=null}B.pre=null;
  b3go(e,nx);
  if(nx==='tongue'){e.ta=a;B.strip=null}
  else if(nx==='sweep'){if(!B.fan||B.fan.kind!=='sweep'){e.tkSide=Math.random()<.5?-1:1;tkSweepFan(e,a)}e.sa=B.fan.a;e.tkSwN=(e.tkSwN||0)+1;e.swHit=false;e.swA=null}
  else if(nx==='flop'){e.tkNoFlies=true;B.orb=null}
  else if(nx==='bubbles')B.fan=null;
  else if(nx==='drum'){if(!B.lane)tkLane(e);else{B.lane.x=e.x;B.lane.y=e.y}}}
// the Frustata's fan: 110°, 230 px, in front of him toward a
function tkSweepFan(e,a){const M=tkGp(e,36,0,a);tkB().fan={kind:'sweep',x:M.x,y:M.y,a,hw:55*TK.deg,R:230,side:e.tkSide||1,lock:false,fill:0}}
// the Tamburo: the reach of its rings (280) and the corridor, 45–75° away from you, on the side with more free floor; in the second
// phase one gap for each ring, turned 15° further each time (the bent corridor)
function tkLane(e){const K=TK.K,th=Math.atan2((P.y-e.y)/K,P.x-e.x),off=rand(45,75)*TK.deg,reach=c=>{let r=0;for(;r<420;r+=8){const x=e.x+Math.cos(c)*r,y=e.y+Math.sin(c)*r*K;if(x<L||x>R||y<TOP||y>BOT)break}return r};
  const r1=reach(th+off),r2=reach(th-off),sd=r1>=r2?1:-1,c=th+off*sd,n=e.p2?4:3,rot=e.p2?15*TK.deg*sd:0;
  tkB().lane={x:e.x,y:e.y,R:280,hw:(e.p2?30:35)*TK.deg,gaps:[...Array(n-1)].map((_,i)=>({c:c+rot*i})),fired:false}}
// the rage can start only when it is on the ground and not striking
function tkCanRage(e){const k=b3k(e);switch(e.st){case 'flop':return k<.3&&!e.tkTri;case 'tongue':return k<.55;case 'sweep':return k<.52;case 'walk':return !(e.z>0);default:return true}}
function tkRage(e){const B=tkB();e.tkRage=1;e.shell=9;// it cannot be targeted and does no harm, not even by touching you
  banner('Il Re Rospo si gonfia di rabbia','Fase 2',1.6);bossRage(e,TK.ember);$('bossBar').classList.add('rage');shake(8);sfx('croak',1,e.x);
  B.warn=[];B.strip=null;B.fan=null;B.orb=null;B.lane=null;B.pre=null;e.tkTip=null;e.z=0;e.air=1;e.tkNoFlies=false;e.tkChain=false;e.tkTri=0;e.sx=null;if(P.pull&&P.pull.tk)P.pull=null;
  for(const p of B.bub){const i=G.eproj.indexOf(p);if(i>=0)G.eproj.splice(i,1);tkPop(p)}B.bub=[];// the bubbles in the room burst (no harm)
  b3go(e,'rage');e.moving=false}
if(TKON)EUPD.toad=(e,dt,sm,a,d)=>{const sp=e.p2?TK.sp2:1;dt*=sp;// the second phase runs 1.25 times faster (n3Move draws the model at the same pace)
  const B=tkB();if(e.b3s&&e.b3s.pend)e.tkPend=e.b3s.pend;
  if(!e.p2&&!e.tkRage&&e.hp<e.max*.5&&tkCanRage(e)){tkRage(e);return}
  b3tick(e,dt);const p2=e.p2,k=b3k(e),s=tkS(e);
  switch(e.st){
  // ---- walking: in the first phase it crawls on all fours like a sumo wrestler (a splash at each hand); in the second it leaps heavily,
  // one leap a cycle (it moves only in the air, lands on its belly at .47); a moment before the Frustata and the Tamburo their warning
  // is already there (so it lasts at least .6 s even in the second phase)
  case 'walk':{const w0=e.wt||0;e.wt=w0+dt;const D=B3D(e,'walk'),ph0=(w0%D)/D,ph1=(e.wt%D)/D,cr=x=>ph1<ph0?(ph0<x||ph1>=x):(ph0<x&&ph1>=x),near=d<e.r+P.r+8;
    if(!p2){const na=navAngle(e);e.moving=!near;e.face=near?a:na;if(!near)moveCircle(e,Math.cos(na)*34*dt,Math.sin(na)*34*dt);
      if(!near&&e.wt>.25&&(cr(.001)||cr(.5))){const h=tkPt(e,54,cr(.5)?30:-30,0);stepFx(h.x,h.y,true);G.shake=Math.max(G.shake,1)}}
    else{e.moving=true;if(ph1>=.1&&ph1<.47){if(e.hopA==null)e.hopA=near?a:navAngle(e);e.face=e.hopA;e.air=1;
        if(ph1<.45&&!near)moveCircle(e,Math.cos(e.hopA)*45/(.35*D)*dt,Math.sin(e.hopA)*45/(.35*D)*dt);e.z=ph1<.45?16*Math.sin(Math.PI*(ph1-.1)/.35):0}
      else{e.z=0;e.air=0;e.hopA=null;e.face=a}
      if(cr(.47)){e.z=0;e.air=0;stepFx(e.x,e.y+8,true);G.shake=Math.max(G.shake,2);G.ripples.push({x:e.x,y:e.y+8,r:8,max:50,a:.9})}}
    if(e.stT<.12&&!B.pre){const nx=tkPeek(e);if(nx==='sweep'){e.tkSide=Math.random()<.5?-1:1;tkSweepFan(e,a);B.pre=nx}else if(nx==='drum'){tkLane(e);B.pre=nx}}
    if(e.stT<=0&&(!p2||ph1<.1||ph1>=.47)){e.moving=false;e.z=0;e.air=0;tkNext(e,a)}break}
  // ---- LINGUATA: a red strip from his mouth follows you (.02, at most 140°/s) and locks (.30); the tongue runs along it (.55): it catches
  // you and pulls you in front of him, or it sticks where it lands (.66: stuck)
  case 'tongue':{e.moving=false;
    if(k<.3){const M0=tkGp(e,36,0,e.ta),tg=Math.atan2(P.y-M0.y,P.x-M0.x);e.ta+=clamp(angDiff(e.ta,tg),-2.44*dt,2.44*dt)}
    e.face=e.ta;const M=tkGp(e,36,0,e.ta);
    if(k>=.02&&k<.55&&(!B.strip||!B.strip.lock)){const r=tkReach(M.x,M.y,e.ta,300);B.strip={x:M.x,y:M.y,a:e.ta,len:r.len,rock:r.rock||null,wall:!!r.wall,lock:k>=.3,w:24}}
    if(b3at(e,.3))sfx('click',0,e.x);
    if(b3at(e,.55)&&B.strip){B.strip.fire=1;tkSnd('thwip',e.x)}
    const S=B.strip;
    if(S&&S.fire&&!e.tkHit&&k<.66){const u=Math.min(1,(k-.55)/.05),l=S.len*u,ca=Math.cos(S.a),sa=Math.sin(S.a),ux=P.x-S.x,uy=P.y-S.y,al=ux*ca+uy*sa,pe=Math.abs(uy*ca-ux*sa);
      if(al>-P.r*.5&&al<l+P.r*.5&&pe<12+P.r*.5&&P.inv<=0&&P.dashT<=0){e.tkHit=true;hurtP(Math.round(20*DMG()));P.pull={x:e.x+ca*70,y:e.y+sa*70,t:.38,sp:280,tk:1};e.tkK0=null;
        tkSnd('slurp',P.x);shake(3);vib(30)}
      else e.tkTip=tkTipXY(e,S.x+ca*l,S.y+sa*l,55*s*(1-u)+(S.rock?12:S.wall?10:4)*u)}
    if(e.tkHit){B.strip=null;
      // a dash tore you off (dash() below): the tongue snaps back to the mouth in .07 s; then the move ends on its own clock from .86 (the
      // model swallows and licks its lips: the mouth never shuts in one frame) and it walks on, no mocking
      if(e.tkSnapT!=null){const u=Math.min(1,((G.t||0)-e.tkSnapT)/.07),D=B3D(e,'tongue');e.tkTip=u<1?tkLerp(e.tkTip0||tkMouthTip(e),tkMouthTip(e),u):null;
        if(u>=1&&k<.86){e.mt=.86*D;e.stT=D-e.mt}if(e.stT<=0){e.tkTip=null;tkWalk(e)}break}
      if(P.pull&&P.pull.tk&&P.pull.t>0){e.tkTip=tkTipXY(e,P.x,P.y,14);e.tkTip0=e.tkTip;e.face=Math.atan2(P.y-e.y,P.x-e.x)}
      else if(k<.9){if(e.tkK0==null){e.tkK0=k;e.tkTip0=e.tkTip||tkTipXY(e,P.x,P.y,14)}e.tkTip=tkLerp(e.tkTip0,tkMouthTip(e),Math.min(1,(k-e.tkK0)/Math.max(.02,.9-e.tkK0)))}
      else e.tkTip=null}
    else if(k>=.66){// missed: the tongue stays stuck where its tip landed (on the floor, on a wall, on a reed bed: it shakes and loses its heads)
      if(S){const ca=Math.cos(S.a),sa=Math.sin(S.a),ex=S.x+ca*S.len,ey=S.y+sa*S.len;e.tkTip=tkTipXY(e,ex,ey,S.rock?12:S.wall?10:4);e.tkStuck={x:ex,y:ey,rock:S.rock};
        if(S.rock)tkRockHit(S.rock,false);else{G.ripples.push({x:ex,y:ey+TK.FY,r:3,max:18,a:.9});if(BOSS2)ENV2.splash(ex,ey+TK.FY,B3N(5),'#e8a0b8')}}
      B.strip=null;b3go(e,'stuck');tkSnd('squelch',e.x);break}
    if(e.stT<=0){e.tkTip=null;B.strip=null;if(e.tkHit)b3taunt(e);else tkWalk(e)}break}
  // ---- LINGUA INCOLLATA: it tugs twice (.15, .45), comes loose (.70: the model brings the tongue back like a rubber band)
  case 'stuck':{e.moving=false;e.face=e.ta;const st=e.tkStuck;
    if(b3at(e,.15)||b3at(e,.45)){shake(1.5);tkSnd('tug',e.x);if(st&&st.rock&&BOSS2)ENV2.rocks(st.rock.x,st.rock.y,st.rock.r+4,0);else if(st)G.ripples.push({x:st.x,y:st.y+TK.FY,r:3,max:16,a:.8})}
    if(b3at(e,.7)){tkSnd('snap',e.x);if(st)fxPush({k:'puff',x:st.x,y:st.y+4,vx:0,vy:-10,t:.3,r:5})}
    if(k>=.77)e.tkTip=null;
    if(e.stT<=0){e.tkStuck=null;e.tkTip=null;tkWalk(e)}break}
  // ---- FRUSTATA (second phase): the fan points at you until .30, then locks and fills from the side the tongue starts on; .52-.70 the
  // tongue sweeps it from that side to the other: who is under it is hit and pushed away the way it goes
  case 'sweep':{e.moving=false;const F=B.fan&&B.fan.kind==='sweep'?B.fan:null;
    if(k<.3&&F){const M0=tkGp(e,36,0,e.sa),tg=Math.atan2(P.y-M0.y,P.x-M0.x);e.sa+=clamp(angDiff(e.sa,tg),-2.44*dt,2.44*dt)}
    e.face=e.sa;const M=tkGp(e,36,0,e.sa);
    if(F&&!F.fire){F.x=M.x;F.y=M.y;F.a=e.sa;F.lock=k>=.3;F.fill=Math.min(1,k/.52)}
    // .47-.52: the tongue hanging from the corner of the mouth stretches out to the edge of the fan where the lash starts (the model goes
    // from its hanging tongue to this tip over the same moments: no jump when the lash begins)
    if(F&&!F.fire&&k>=.47&&k<.52){const a0=F.a+F.hw*F.side,u=Math.min(1,Math.max(0,(k-.47)/.05)),l=F.R*u*u*(3-2*u);e.tkTip=tkTipXY(e,F.x+Math.cos(a0)*l,F.y+Math.sin(a0)*l,55*s*(1-l/F.R)+10*l/F.R)}
    if(b3at(e,.52)&&F){F.fire=1;tkSnd('fwip',e.x)}
    if(F&&F.fire&&k<.7){const u=Math.max(0,(k-.52)/.18),q=u*u*(3-2*u),ang=F.a+F.hw*F.side*(1-2*q),dx=P.x-F.x,dy=P.y-F.y,dd=Math.hypot(dx,dy);
      if(!e.swHit&&dd>6&&dd<F.R+P.r*.5&&P.inv<=0&&P.dashT<=0){const th=Math.atan2(dy,dx),d1=angDiff(ang,th),d0=e.swA==null?d1:angDiff(e.swA,th),tol=Math.atan2(12+P.r*.5,Math.max(dd,24));
        if(Math.abs(d1)<tol||d0*d1<0&&Math.abs(d0)<1.2){e.swHit=true;hurtP(Math.round(18*DMG()));const pa=ang-Math.PI/2*F.side;P.push={vx:Math.cos(pa)*220,vy:Math.sin(pa)*220,t:.2};shake(3)}}
      // the reed beds it lashes bend and lose their heads
      for(const r of G.rocks){if(r.temp||r.tkSw===e.tkSwN)continue;const rx=r.x-F.x,ry=r.y-F.y;if(Math.hypot(rx,ry)>F.R+r.r)continue;if(Math.abs(angDiff(ang,Math.atan2(ry,rx)))<.16){r.tkSw=e.tkSwN;tkRockHit(r,true)}}
      e.swA=ang;e.tkTip=tkTipXY(e,F.x+Math.cos(ang)*F.R,F.y+Math.sin(ang)*F.R,10)}
    else if(F&&F.fire&&k<.85){F.done=1;const ang=F.a-F.hw*F.side,u=(k-.7)/.15;e.tkTip=tkLerp(tkTipXY(e,F.x+Math.cos(ang)*F.R,F.y+Math.sin(ang)*F.R,10),tkMouthTip(e),u*u)}
    else if(k>=.85){e.tkTip=null;if(F)F.done=1}
    if(e.stT<=0){B.fan=null;e.tkTip=null;tkWalk(e)}break}
  // ---- PANCIATA: the circle chases you (.02-.30, 220 px/s), locks; it springs up (.30) and falls on its belly (.75); in the second phase
  // three in a row, the last (the Panciata Reale) bigger
  case 'flop':{e.moving=false;const small=e.tkTri===1||e.tkTri===2,roy=e.tkTri===3;
    if(k>=.02&&!B.orb&&k<.3)B.orb={x:clamp(P.x,L+e.r,R-e.r),y:clamp(P.y,TOP+e.r,BOT-e.r),r:roy?70:56,wave:small?0:roy?300:240,lock:false,k:0,t0:G.t||0};
    const O=B.orb;
    if(O&&!O.lock){const tx=clamp(P.x,L+e.r,R-e.r),ty=clamp(P.y,TOP+e.r,BOT-e.r),dx=tx-O.x,dy=ty-O.y,dd=Math.hypot(dx,dy);if(dd>.01){const m=Math.min(dd,220*dt);O.x+=dx/dd*m;O.y+=dy/dd*m}}
    if(O)O.k=Math.min(1,Math.max(0,(k-.02)/.73));
    if(k<.3)e.face=O?Math.atan2(O.y-e.y,O.x-e.x):a;
    if(b3at(e,.3)&&O){O.lock=true;e.sx=e.x;e.sy=e.y;e.tx=O.x;e.ty=O.y;e.lf=Math.atan2(O.y-e.y,O.x-e.x);tkSnd('jump',e.x);shake(3);if(BOSS2)ENV2.splash(e.x,e.y+TK.FY,B3N(8),'#cfe9d8')}
    if(k>=.3&&k<.75&&e.sx!=null){const u=(k-.3)/.45,q=u*u*(3-2*u);e.x=e.sx+(e.tx-e.sx)*q;e.y=e.sy+(e.ty-e.sy)*q;e.z=150*Math.sin(Math.PI*u);e.air=e.z>30?1:0;e.face=e.lf}
    if(b3at(e,.75)&&e.sx!=null){tkSplat(e,roy,small);e.sx=null}
    if(k>=.75){e.z=0;e.air=0}
    // the Triple: the next flop starts at once from the squashed belly (the model's chained flop begins on the splat's pose), the third ends
    if(e.tkTri&&e.tkTri<3&&k>=.755&&e.sx==null){e.z=0;e.air=0;B.orb=null;const n=e.tkTri+1;b3go(e,'flop');e.tkTri=n;e.tkChain=true;e.tkNoFlies=true;break}
    if(e.stT<=0){e.z=0;e.air=0;B.orb=null;tkWalk(e)}break}
  // ---- RUTTO DI BOLLE: the red fan follows his face (he turns to you at most 90°/s) until .40, locks; .60 the burp: two rows of bubbles
  case 'bubbles':{e.moving=false;if(k<.4)e.face+=clamp(angDiff(e.face,a),-1.571*dt,1.571*dt);const M=tkGp(e,36,0,e.face);
    if(k>=.03&&k<.6)B.fan={kind:'bub',x:M.x,y:M.y,a:e.face,hw:50*TK.deg,R:260,lock:k>=.4,fill:Math.min(1,(k-.03)/.57)};
    if(b3at(e,.6)){B.fan=null;tkBurp(e,M)}
    if(e.stT<=0){B.fan=null;tkWalk(e,rand(1.4,1.8))}break}
  // ---- TAMBURO DI PANCIA: the rings at .32, .52, .74 (.32, .46, .60, .76 in the second phase), then he points at a pool (.86): tadpoles
  case 'drum':{e.moving=false;e.face+=clamp(angDiff(e.face,a),-2*dt,2*dt);const T=p2?[.32,.46,.6,.76]:[.32,.52,.74];if(B.lane){B.lane.x=e.x;B.lane.y=e.y}
    T.forEach((c,j)=>{if(b3at(e,c))tkRing(e,j,T.length)});
    if(b3at(e,.86))tkTadpoles(e);
    if(e.stT<=0){e.tkPoint=undefined;tkWalk(e,rand(1.2,1.6))}break}
  // ---- PIOGGIA DI LUCCIOLE (second phase): three coughs (.35, .45, .55) and seven circles where the fireflies fall back
  case 'rain':{e.moving=false;e.face+=clamp(angDiff(e.face,a),-2*dt,2*dt);
    for(const c of[.35,.45,.55])if(b3at(e,c)){tkCough(e);if(c===.35)B.rainQ=[0,.12,.24,.36,.48,.6,.72].map((t,i)=>({t,i}))}
    if(e.stT<=0)tkWalk(e);break}
  // ---- FURIA: no harm; fists on the floor (.15, .25, .35), it swallows the fireflies of the room (.38), its light turns to embers and
  // the torches go orange (.62), the great croak (.62-.85); then the second phase, the Pioggia first
  case 'rage':{e.moving=false;e.face+=clamp(angDiff(e.face,a),-2*dt,2*dt);
    for(const c of[.15,.25,.35])if(b3at(e,c)){shake(4);sfx('splash',1,e.x);const sd=c===.15?[-1]:c===.25?[1]:[-1,1];for(const q of sd){const h=tkPt(e,42,30*q,0);
      if(BOSS2)ENV2.splash(h.x,h.y,B3N(8),'#8a7a5a');vfxBlast(h.x,h.y,'150,130,90',30,{debris:['#5a4a30','#3e3220','#7a6a48'],n:B3N(6),sparks:0,dust:4,ring2:false})}}
    if(b3at(e,.38))tkEat(e);
    // (the voice starts on the gulps: its three short croaks fall on them, the long one when the sac is full)
    if(b3at(e,.41))b3say(e,'angry');
    if(b3at(e,.62)){B.orange=1;if(G.env)ENV2.torches(TK.orange[0],TK.orange[1],9999);shake(8);vib([60,40,120]);
      for(let i=0;i<3;i++)setTimeout(()=>{if(G&&G.fx)fxPush({k:'ring2',x:e.x,y:e.y-e.r,rgb:'255,190,110',r0:e.r,r1:e.r*5,t:.45,max:.45,w:6-i*1.5})},i*170)}
    if(e.stT<=0){e.p2=true;e.shell=0;e.air=0;e.tkRage=0;e.si=-1;tkNext(e,a)}break}
  // ---- its mocking gesture (a pause in its walk, never between two blows: it walks again a little before the next move); the laugh starts
  // when the model laughs (.38: «gro-gro-gro» with the sac swelling at each one), not with the pats on the belly
  case 'taunt':{e.moving=false;e.face=a;e.z=0;e.air=0;if(B.pre){B.pre=null;B.fan=null;B.lane=null}if(b3at(e,.38))b3say(e,e.tkLk||'laugh',true);if(e.stT<=0){e.wt=0;b3go(e,'walk',rand(.3,.55))}break}
  default:tkWalk(e)}};
// the belly flop lands: the blow in the circle, the wave (not in the first two of the three), the mud, the swamp splashes
function tkSplat(e,roy,small){const B=tkB(),O=B.orb;e.z=0;e.air=0;e.x=e.tx;e.y=e.ty;moveCircle(e,0,0);const x=e.x,y=e.y,fy=y+TK.FY,R0=roy?70:56;
  if(tkD(x,y,P.x,P.y)<R0+P.r*.4&&P.inv<=0&&P.dashT<=0)hurtP(Math.round((roy?30:26)*DMG()));
  if(!small)G.waves.push({x,y,r:e.r,max:roy?300:240,dmg:Math.round(16*DMG()),hit:false,rgb:'190,235,170'});
  tkMud(x,y,small?2:3);
  vfxBlast(x,fy,'190,235,170',roy?130:small?80:110,{debris:['#5a4a30','#3e3220','#7a8a4a'],n:B3N(roy?26:small?12:20),sparks:B3N(10),spcol:['#e8ffc0','#c8f07a','#ffffff'],dust:B3N(10),ring2:false});
  for(const p of G.puddles||[])G.ripples.push({x:p.x,y:p.y,r:3,max:p.rx,a:.9});tkLilies(x,fy,roy?280:190,B3N(roy?10:6));
  if(BOSS2){ENV2.splash(x,fy,B3N(roy?24:small?10:16),'#cfe9d8');ENV2.rocks(x,y,190,small?0:roy?2:1);if(!small)ENV2.mark('puddle',x+rand(-8,8),fy+2,roy?30:24);ENV2.wiltGrass(x,fy,60);if(roy)tkLeaves(8)}
  shake(roy?11:small?6:9);sfx('boom',0,x);sfx('splash',small?1:2,x);vib(roy?[80,40,120]:small?[30,20,40]:[50,30,70]);if(O)O.done=1}
// three (two) patches of mud 40-60 px from where it landed: they slow you like slime for 4 s, six at most (the oldest dries first)
function tkMud(x,y,n){const K=TK.K,a0=rand(0,TAU);for(let i=0;i<n;i++){const Z=G.zones.filter(z=>z.tkMud);if(Z.length>=6){let o=Z[0];for(const z of Z)if(z.t<o.t)o=z;G.zones.splice(G.zones.indexOf(o),1)}
  const an=a0+i*TAU/n+rand(-.4,.4),dd=rand(40,60);G.zones.push({x:clamp(x+Math.cos(an)*dd,L+20,R-20),y:clamp(y+Math.sin(an)*dd*K,TOP+20,BOT-20),r:24,t:4,max:4,kind:'slime',tkMud:1,seed:rand(0,9)})}}
// the burp: two rows of bubbles from his mouth (row B in the gaps of row A, faster); at most 13 in the room, the oldest bursts
function tkBurp(e,M){const rows=e.p2?[[7,60,75],[6,50,105]]:[[5,40,70],[4,30,100]],z0=50*tkS(e)-14;for(const[n,w,v] of rows)for(let i=0;i<n;i++)tkBubble(M.x,M.y,e.face+(-w+i*2*w/(n-1))*TK.deg,v,e.p2,z0);
  if(!b3say(e,'burp',true))sfx('bubble',0,e.x);shake(3);for(const p of G.puddles||[])G.ripples.push({x:p.x,y:p.y,r:3,max:p.rx*.8,a:.8});
  // the lily pads in front of him fly away
  const F=(G.puddles||[]).filter(p=>p.swamp&&Math.abs(angDiff(e.face,Math.atan2(p.y-8-e.y,p.x-e.x)))<.9&&Math.hypot(p.x-e.x,p.y-e.y)<300);for(const p of F)tkLilies(p.x,p.y,4,B3N(4))}
// (z0: how high above its flight its mouth is: the bubble is drawn coming out of the mouth and drops to its height over its first 40 px)
function tkBubble(x,y,a,v,p2,z0){const B=tkB();B.bub=B.bub.filter(p=>G.eproj.includes(p));while(B.bub.length>=13){const o=B.bub.shift(),i=G.eproj.indexOf(o);if(i>=0)G.eproj.splice(i,1);tkPop(o)}
  const p={x,y:y-6,vx:Math.cos(a)*v,vy:Math.sin(a)*v,a,r:10,dmg:Math.round(12*DMG()),kind:'fbubble',life:5,ph:rand(0,9),p2:!!p2,x0:x,y0:y-6,z0:z0||0};G.eproj.push(p);B.bub.push(p)}
// a bubble bursts: a ring of light, four droplets, its firefly flies off
function tkPop(p){const B=tkB();if(tkArt('Bubble')&&!LOWFX)B.pops.push({x:p.x,y:p.y,ph:p.ph,p2:p.p2,t:0});else fxPush({k:'pop',x:p.x,y:p.y,r:p.r||10,t:.25,max:.25,col:'rgba(220,255,235,.9)'});
  for(let i=0;i<4;i++){const an=i*TAU/4+rand(-.4,.4);G.debris.push({x:p.x,y:p.y+14,z:14,vx:Math.cos(an)*40,vy:Math.sin(an)*20,vz:rand(40,90),col:'#cfe9d8',s:1.5,rot:0,vr:0,life:1,drop:true})}
  if(!LOWFX)B.up.push({x:p.x,y:p.y,vx:rand(-20,20),vy:-rand(60,110),t:0,ph:p.ph,p2:p.p2,slow:1});tkSnd('pop',p.x)}
// a ring of the drum: from his feet, 40 to 280 px at 190 px/s (the last 160), the gap of the corridor (the last is whole)
function tkRing(e,j,n){const B=tkB(),Ln=B.lane,last=j===n-1,g=!last&&Ln?Ln.gaps[j]:null;B.rings.push({x:e.x,y:e.y,r:40,sp:last?160:190,gap:g?g.c:null,hw:Ln?Ln.hw:0,hit:false,last});if(last&&Ln)Ln.fired=true;
  shake(last?5:3);tkSnd('drum',e.x);if(last)b3say(e,'hoh',true);if(BOSS2)ENV2.splash(e.x,e.y+TK.FY,B3N(6),'#cfe9d8');
  // the room keeps the beat: every pool rings, the reeds shake, the torches jump, the fireflies flee
  for(const p of G.puddles||[])G.ripples.push({x:p.x,y:p.y,r:3,max:p.rx*.9,a:.8});if(BOSS2)ENV2.rocks(e.x,e.y,900,0);for(const t of G.torches||[])t.ph+=1.2;tkScare(e.x,e.y-20,.5)}
// he points at the pools far from you (the farthest first): they bubble .8 s, then a tadpole jumps out of each; from his mouth if none
function tkTadpoles(e){const B=tkB(),n=e.p2?4:3,alive=G.enemies.filter(q=>q.type==='tadpole'&&!q.dead).length+B.tads.length,m=Math.max(0,Math.min(n,7-alive));
  const pools=(G.puddles||[]).filter(q=>q.swamp&&Math.hypot(q.x-P.x,q.y-(P.y+TK.FY))>=120).sort((u,v)=>Math.hypot(v.x-P.x,v.y-P.y)-Math.hypot(u.x-P.x,u.y-P.y));
  if(pools.length){const q=pools[0],f=e.f3!=null?e.f3:e.face;e.tkPoint=angDiff(f,Math.atan2((q.y-e.y-TK.FY)/.55,q.x-e.x));
    for(let i=0;i<m;i++){const q2=pools[i%pools.length];B.tads.push({x:q2.x+rand(-q2.rx,q2.rx)*.35,y:q2.y+rand(-q2.ry,q2.ry)*.3,t:.8})}}
  else if(m){const M=tkGp(e,36,0);for(let i=0;i<m;i++)G.enemies.push(makeE('tadpole',clamp(M.x+rand(-20,20),L+12,R-12),clamp(M.y+16+rand(-8,8),TOP+12,BOT-12),.25));sfx('croak',1,e.x)}}
// a cough of the Pioggia: six orange fireflies rise from his mouth and leave the screen (only for the eye: they fall back in the circles)
// (from the real mouth of the body thrown back to the sky; they come in over the first 40 px, as the model's own fade out)
function tkCough(e){const B=tkB(),m=tkPt(e,15,0,64);shake(1.5);fxPush({k:'puff',x:m.x,y:m.y,vx:0,vy:-20,t:.4,r:6});
  for(let i=0;i<(LOWFX?3:6);i++){const x=m.x+rand(-5,5),y=m.y+rand(-4,2);B.up.push({x,y,x0:x,y0:y,vx:rand(-45,45),vy:-rand(170,260),t:0,ph:rand(0,9),p2:true,fin:1})}
  for(const t of G.torches||[])for(let i=0;i<2;i++)G.embers.push({k:'ember',x:t.x+rand(-3,3),y:t.y-16,vx:rand(-20,20),vy:rand(-70,-30),life:rand(.4,.8),max:.8,ph:rand(0,9)})}
// a circle of the Pioggia: the first under you, three round it (70-110 px, more than 70° apart), three more where you are then
function tkRainCircle(i){const B=tkB(),K=TK.K;let x=P.x,y=P.y,an=null;
  if(i>=1&&i<=3){const c0=B.rain.find(c=>c.i===0)||{x:P.x,y:P.y},used=B.rain.filter(c=>c.an!=null).map(c=>c.an);for(let n=0;n<30;n++){an=rand(0,TAU);if(used.every(u=>Math.abs(angDiff(u,an))>=70*TK.deg))break}
    const dd=rand(70,110);x=c0.x+Math.cos(an)*dd;y=c0.y+Math.sin(an)*dd*K}
  B.rain.push({i,x:clamp(x,L+20,R-20),y:clamp(y,TOP+20,BOT-20),r:26,t:0,w:.9,st:'warn',an});tkSnd('sizzle',x)}
// the Furia: the fireflies of the room fly in a spiral into his mouth and are gone (with LOWFX they are not drawn: they just go)
function tkEat(e){const B=tkB(),F=(G.amb||[]).filter(q=>q.k==='firefly');G.amb=(G.amb||[]).filter(q=>q.k!=='firefly');
  if(!LOWFX)F.forEach((f,i)=>B.eat.push({x0:f.x,y0:f.y,t:-i*.02,d:rand(.4,.55),ph:rand(0,9),sp:Math.random()<.5?-1:1}))}
// the stuck tongue: the blows hurt more (and the first time in the run, the words)
if(TKON){const _h=hurtE;hurtE=function(e,d){if(e&&e.type==='toad'&&e.st==='stuck'&&!(e.intro>0)&&b3k(e)<.7){const A=[...arguments];A[1]=d*1.5;
  if(!G.tkTxt){G.tkTxt=1;text(e.x,e.y-112,'Lingua incollata!','#ffd84a',18)}return _h.apply(this,A)}return _h.apply(this,arguments)}}
// the Strappo: a dash while the tongue pulls you tears you off (and the first time in the run, the words)
if(TKON){const _d=dash;dash=function(){const pl=P&&P.pull,r=_d.apply(this,arguments);try{if(pl&&pl.tk&&pl.t>0&&P.dashT>0&&P.pull===pl){P.pull=null;const e=tkBoss();
  if(e&&e.st==='tongue'&&e.tkHit&&e.tkSnapT==null){e.tkSnapT=G.t||0;e.tkTip0=e.tkTip;e.tkPend=0;if(e.b3s)e.b3s.pend=0}tkSnd('snap',P.x);
  if(!G.tkStr){G.tkStr=1;text(P.x,P.y-44,'Strappo!','#ffd84a',18)}}}catch(err){}return r}}
// no charging ring round him when the tongue gets stuck (it is no attack); in the second phase no flames at his feet (his light is embers)
// (the charge cue at the start of a blow takes his light: lime, embers in the second phase; it was the old king's pale blue)
if(TKON){const _bf=b2front;b2front=function(e){if(e&&e.type==='toad'){if(e.st==='stuck')e._b2st=e.st;B2T.toad[1]=e.p2?TK.ember:TK.lime}return _bf.apply(this,arguments)}
  const _bb=b2back;b2back=function(e){if(!e||e.type!=='toad')return _bb.apply(this,arguments);const t=G.t||0,h=B2H.toad||100,z=e.z||0;if(B2G.toad)B2G.toad(e);
    ctx.save();ctx.globalCompositeOperation='lighter';glow(b2halo(e),e.x,e.y-z-h*.55,h*1.1,(.24+.06*Math.sin(t*1.7))*(e.intro>0?.6:1));ctx.restore()}}
// ---- the dangers in time (real seconds)
function tkUpdate(dt){const B=G.tk;
  if(G.state!=='play'){if(B.rings.length||B.rain.length||B.rainQ.length||B.tads.length||B.strip||B.fan||B.orb||B.lane||B.bub.length||B.up.length||B.eat.length||B.pops.length)tkReset();return}
  // the bubbles: gone (a wall, an obstacle, you, the oldest) = burst; the others sway ±4 px (no trail behind them)
  for(let i=B.bub.length-1;i>=0;i--){const p=B.bub[i];if(!G.eproj.includes(p)){B.bub.splice(i,1);tkPop(p);continue}p.tr=null;p.x+=Math.cos((G.t||0)*3+p.ph)*12*dt;p.y+=Math.sin((G.t||0)*2.4+p.ph)*9.6*dt}
  for(let i=B.pops.length-1;i>=0;i--){B.pops[i].t+=dt;if(B.pops[i].t>=.25)B.pops.splice(i,1)}
  // the rings of the drum: once each, not in the gap, not while you dash
  for(let i=B.rings.length-1;i>=0;i--){const g=B.rings[i];g.r+=g.sp*dt;
    if(!g.hit&&P.inv<=0&&P.dashT<=0&&Math.abs(tkD(g.x,g.y,P.x,P.y)-g.r)<9+P.r*.4){const th=Math.atan2((P.y-g.y)/TK.K,P.x-g.x);if(g.gap==null||Math.abs(angDiff(g.gap,th))>g.hw){g.hit=true;hurtP(Math.round(14*DMG()))}}
    if(g.r>280)B.rings.splice(i,1)}
  if(B.lane&&B.lane.fired&&!B.rings.length)B.lane=null;
  // the Pioggia: the circles appear one every .12 s, each warns .9 s, then its firefly falls; a spot of light stays 1 s
  for(let j=B.rainQ.length-1;j>=0;j--){const q=B.rainQ[j];q.t-=dt;if(q.t<=0){B.rainQ.splice(j,1);tkRainCircle(q.i)}}
  for(let j=B.rain.length-1;j>=0;j--){const c=B.rain[j];c.t+=dt;
    if(c.st==='warn'&&c.t>=c.w){c.st='spot';c.t=0;if(tkD(c.x,c.y,P.x,P.y)<c.r+P.r*.4&&P.inv<=0&&P.dashT<=0)hurtP(Math.round(16*DMG()));
      vfxBlast(c.x,c.y+TK.FY,'255,170,70',34,{sparks:B3N(8),spcol:['#fff0c0','#ffb040','#ff7a20'],dust:0,ring2:false});tkSnd('pop',c.x);
      if(inPuddle(c.x,c.y+TK.FY))fxPush({k:'flash',x:c.x,y:c.y+TK.FY,r:46,rgb:'255,160,60',t:.3,max:.3})}
    else if(c.st==='spot'&&c.t>=1)B.rain.splice(j,1)}
  // the pools he pointed at bubble, then a tadpole jumps out with a splash (seven alive at most)
  for(let i=B.tads.length-1;i>=0;i--){const q=B.tads[i];q.t-=dt;if(!LOWFX&&Math.random()<dt*14)G.fx.push({k:'bub',x:q.x+rand(-8,8),y:q.y+rand(-4,4),t:.6,r:rand(1.5,3.2)});
    if(Math.random()<dt*5)G.ripples.push({x:q.x,y:q.y,r:2,max:14,a:.8});
    if(q.t<=0){B.tads.splice(i,1);if(G.enemies.filter(o=>o.type==='tadpole'&&!o.dead).length<7){G.enemies.push(makeE('tadpole',q.x,q.y-TK.FY,.25));if(BOSS2)ENV2.splash(q.x,q.y,B3N(8),'#cfe9d8');G.ripples.push({x:q.x,y:q.y,r:4,max:24,a:1});sfx('splash',0,q.x)}}}
  // the fireflies flying up (the coughs, the burst bubbles), and the ones he swallows
  for(let i=B.up.length-1;i>=0;i--){const f=B.up[i];f.t+=dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy-=(f.slow?20:60)*dt;if(f.y<TOP-160||f.t>(f.slow?1.4:1.8))B.up.splice(i,1)}
  for(let i=B.eat.length-1;i>=0;i--){const f=B.eat[i];f.t+=dt;if(f.t>=f.d)B.eat.splice(i,1)}
  // the fireflies of the room flee from a blow
  if(B.scare&&B.scare.t>0){const S=B.scare;S.t-=dt;const f=Math.max(0,S.t/S.max);for(const a of G.amb||[])if(a.k==='firefly'){const dx=a.x-S.x,dy=a.y-S.y,dd=Math.hypot(dx,dy)||1;a.x+=dx/dd*90*f*dt;a.y+=dy/dd*90*f*dt}}
  // in the second phase the torches stay orange
  if(B.orange&&G.env&&!(G._tT>0))ENV2.torches(TK.orange[0],TK.orange[1],9999)}
// the fireflies freed when he falls fly through the room, then stay in it (they become the room's fireflies); the one on the crown
function tkDUpdate(dt){const D=G.tkd;for(let i=D.free.length-1;i>=0;i--){const f=D.free[i];f.t+=dt;if(f.t<0)continue;const k=Math.min(1,f.t/.5);
  f.vx+=((f.tx-f.x)*1.6-f.vx*1.4)*dt*k;f.vy+=((f.ty-f.y)*1.6-f.vy*1.4)*dt*k;f.x+=f.vx*dt;f.y+=f.vy*dt;
  if(f.t>=f.life){D.free.splice(i,1);if(G.amb)G.amb.push({k:'firefly',x:clamp(f.x,L+6,R-6),y:clamp(f.y,TOP+6,BOT-6),vx:rand(-6,6),vy:rand(-5,5),ph:rand(0,TAU),t:0})}}
  if(D.sit)D.sit.t+=dt}
{const _u=update;update=function(dt){_u.apply(this,arguments);try{if(TKON&&G&&started&&!paused){if(G.tk)tkUpdate(dt);if(G.tkd)tkDUpdate(dt)}}catch(err){console.error(err)}}}
// ---- the drawings of its pieces when the model has none (the stub, LOWFX fallbacks)
// (k: the phase of the blink, in cycles; the model's N3.toadFly takes it the same way)
function tkFly(x,y,z,k,o){o=o||{};const A=tkArt('Fly');if(A){try{A(x,y,z,k,o.sc||1,o);return}catch(err){}}
  const b=.55+.45*Math.sin(k*TAU),c=o.p2?'255,150,50':'214,255,90',yy=y-z;
  if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';if(o.fall>0){const g=ctx.createLinearGradient(x,yy-70,x,yy);g.addColorStop(0,`rgba(${c},0)`);g.addColorStop(1,`rgba(${c},${.65*o.fall})`);
      ctx.strokeStyle=g;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,yy-70);ctx.lineTo(x,yy);ctx.stroke()}glow(c,x,yy,9,.7*b);ctx.restore()}
  ctx.fillStyle='#3a3020';circ(x-1,yy-1,1.6);ctx.fill();ctx.fillStyle=o.p2?`rgba(255,215,140,${b})`:`rgba(246,255,192,${b})`;circ(x+.8,yy+.6,1.5);ctx.fill()}
function tkBubbleDraw(x,y,r,ph,p2,pop){const t=G.t||0,w=1+Math.sin(t*7+ph)*.06,b=.5+.5*Math.sin(t*5+ph);ctx.save();ctx.translate(x,y);ctx.scale(w,2-w);
  if(!LOWFX){ctx.globalCompositeOperation='lighter';glow(p2?'255,150,50':'214,255,90',0,0,r*1.3,.35*b);ctx.globalCompositeOperation='source-over'}
  ctx.fillStyle='rgba(190,240,255,.2)';circ(0,0,r);ctx.fill();ctx.strokeStyle='rgba(30,70,40,.85)';ctx.lineWidth=1.4;ctx.stroke();
  ctx.fillStyle=p2?`rgba(255,190,90,${.6+.4*b})`:`rgba(230,255,150,${.6+.4*b})`;circ(Math.sin(t*2+ph)*2,Math.cos(t*1.7+ph)*1.5,1.8);ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,.85)';ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(0,0,r*.68,3.5,4.6);ctx.stroke();ctx.restore()}
function tkCrownDraw(x,y,rot){ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(rot)*.25);shadow(0,1,13,4,.3);ink(2);ctx.beginPath();ctx.moveTo(-11,0);ctx.lineTo(-12,-11);ctx.lineTo(-6,-5);ctx.lineTo(0,-13);
  ctx.lineTo(6,-5);ctx.lineTo(12,-11);ctx.lineTo(11,0);ctx.closePath();const g=ctx.createLinearGradient(-11,-13,11,0);g.addColorStop(0,'#fff0a0');g.addColorStop(.5,'#f2b62e');g.addColorStop(1,'#94580c');
  ctx.fillStyle=g;ctx.fill();ctx.stroke();ctx.fillStyle='#b8f040';circ(0,-4,2.2);ctx.fill();ctx.restore()}
// the mud: a dark wet patch that spreads, stays glossy, then dries with a lighter crust and fades (the model's own if it has one)
{const _sz=drawSoftZone;drawSoftZone=function(z,a){if(!z.tkMud)return _sz.apply(this,arguments);const k=1-z.t/z.max,x=z.x,y=z.y+TK.FY,A=tkArt('Mud');
  if(A){try{A(x,y,z.r,k,1,{seed:z.seed});return}catch(err){}}
  const r=z.r*Math.min(1,.4+k/.1*.6),al=k>.8?Math.max(0,(1-k)/.2):1,dry=Math.max(0,(k-.7)/.3);ctx.save();ctx.globalAlpha*=al;
  ctx.fillStyle=dry>0?`rgba(${58+30*dry|0},${42+26*dry|0},${28+18*dry|0},.85)`:'rgba(58,42,28,.88)';ctx.beginPath();ctx.ellipse(x,y,r,r*TK.K,0,0,TAU);ctx.fill();
  ctx.strokeStyle='rgba(201,183,140,.55)';ctx.lineWidth=1.4;ctx.beginPath();ctx.ellipse(x,y,r,r*TK.K,0,Math.PI*1.05,Math.PI*1.95);ctx.stroke();
  if(dry<.5){ctx.fillStyle='rgba(160,138,98,.55)';ctx.beginPath();ctx.ellipse(x-r*.3,y-r*.22,r*.28,r*.08,-.15,0,TAU);ctx.fill();
    for(let i=0;i<2;i++){const bx=x+Math.sin(z.seed+i*2.1)*r*.4,by=y+Math.cos(z.seed+i*1.3)*r*.2;ctx.strokeStyle='rgba(201,183,140,.6)';ctx.lineWidth=.9;circ(bx,by,1.4+Math.sin((G.t||0)*3+i)*.4);ctx.stroke()}}
  ctx.restore()}}
// the bubble with the firefly inside (the model's own if it has one): it comes out of his mouth (fading in from 6 to 22 px, as the
// model's froth fades out and the rows open up) and drops from the height of the mouth to its own over its first 40 px; it hits where it is drawn after that
Object.assign(EPDRAW,{fbubble:p=>{const d=Math.hypot(p.x-p.x0,p.y-p.y0),al=Math.min(1,Math.max(0,(d-6)/16));if(al<=0)return;const A=tkArt('Bubble'),a0=ctx.globalAlpha,zz=(p.z0||0)*Math.max(0,1-d/40);ctx.globalAlpha=a0*al;
  try{if(A)A(p.x,p.y+14,14+zz,p.r,(G.t||0)*3+p.ph,1,{p2:p.p2});else tkBubbleDraw(p.x,p.y-zz,p.r,p.ph,p.p2)}catch(err){tkBubbleDraw(p.x,p.y-zz,p.r,p.ph,p.p2)}ctx.globalAlpha=a0}});
Object.assign(TRC,{fbubble:'190,240,200'});
// ---- on the floor: the strip of the tongue, the fans, the landing circle (its growing shadow, six ticks, the dashed reach of the wave), the
// reach and the corridor of the drum and its rings of swamp water, the circles of the Pioggia; the light of his belly on the floor
function tkGround(){const B=G.tk;if(!B)return;const t=G.t||0,FY=TK.FY,K=TK.K,RD=TK.red,e=tkBoss();
  if(e&&!LOWFX&&!(e.intro>0)){const q=tkPt(e,34,0,0),s=tkSig(e);ctx.save();ctx.globalCompositeOperation='lighter';glow(e.p2?TK.ember:'210,240,110',q.x,q.y,58,.1+.14*s,26);ctx.restore()}
  if(B.lane){const Ln=B.lane,x=Ln.x,y=Ln.y+FY;ctx.save();
    for(const g of Ln.gaps){ctx.beginPath();ctx.moveTo(x,y);ctx.ellipse(x,y,Ln.R,Ln.R*K,0,g.c-Ln.hw,g.c+Ln.hw);ctx.closePath();ctx.fillStyle='rgba(255,250,210,.16)';ctx.fill();
      ctx.strokeStyle='rgba(255,250,210,.5)';ctx.lineWidth=1.6;ctx.setLineDash([7,6]);ctx.beginPath();for(const sd of[-1,1]){ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(g.c+sd*Ln.hw)*Ln.R,y+Math.sin(g.c+sd*Ln.hw)*Ln.R*K)}ctx.stroke();ctx.setLineDash([])}
    ctx.strokeStyle=`rgba(${RD},${.5+.25*Math.sin(t*12)})`;ctx.lineWidth=2.2;ctx.setLineDash([10,7]);ell(x,y,Ln.R,Ln.R*K);ctx.stroke();ctx.setLineDash([]);ctx.restore()}
  for(const g of B.rings){const x=g.x,y=g.y+FY,al=Math.max(0,Math.min(1,(280-g.r)/40)),a0=g.gap==null?0:g.gap+g.hw,a1=g.gap==null?TAU:g.gap-g.hw+TAU,ri=Math.max(1,g.r-9);
    ctx.save();ctx.globalAlpha*=al;ctx.beginPath();ctx.ellipse(x,y,g.r+9,(g.r+9)*K,0,a0,a1);ctx.ellipse(x,y,ri,ri*K,0,a1,a0,true);ctx.closePath();
    ctx.fillStyle=LOWFX?'rgba(44,66,42,.8)':'rgba(31,51,36,.85)';ctx.fill();ctx.strokeStyle='rgba(10,18,10,.7)';ctx.lineWidth=1.2;ctx.stroke();
    if(!LOWFX){ctx.strokeStyle='rgba(52,73,46,.95)';ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(x,y+1,g.r+3,(g.r+3)*K,0,a0,a1);ctx.stroke();
      ctx.strokeStyle='rgba(200,240,90,.45)';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(x,y+4,g.r+6,(g.r+6)*K,0,a0,a1);ctx.stroke()}
    ctx.strokeStyle='rgba(216,240,200,.9)';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,y-2,g.r,g.r*K,0,a0,a1);ctx.stroke();ctx.restore()}
  if(B.strip){const S=B.strip,w=S.w,l=S.len;ctx.save();ctx.translate(S.x,S.y+FY);ctx.rotate(S.a);
    if(S.fire){ctx.fillStyle=`rgba(${RD},.12)`;ctx.fillRect(0,-w/2,l,w)}
    else if(S.lock){ctx.fillStyle=`rgba(${RD},${(.27+.09*Math.sin(t*20)).toFixed(3)})`;ctx.fillRect(0,-w/2,l,w);ctx.strokeStyle=`rgba(${RD},.9)`;ctx.lineWidth=2.4;ctx.strokeRect(0,-w/2,l,w)}
    else{ctx.fillStyle=`rgba(${RD},.1)`;ctx.fillRect(0,-w/2,l,w);ctx.strokeStyle=`rgba(${RD},.7)`;ctx.lineWidth=2;ctx.setLineDash([8,6]);ctx.strokeRect(0,-w/2,l,w);ctx.setLineDash([])}
    if(!S.fire){ctx.fillStyle=`rgba(${RD},${S.lock?.6:.32})`;circ(l,0,6);ctx.fill()}ctx.restore()}
  if(B.fan&&!B.fan.done){const F=B.fan,x=F.x,y=F.y+FY,a0=F.a-F.hw,a1=F.a+F.hw,path=(r,b0,b1)=>{ctx.beginPath();ctx.moveTo(x,y);ctx.arc(x,y,r,b0,b1);ctx.closePath()};ctx.save();
    path(F.R,a0,a1);ctx.fillStyle=`rgba(${RD},${F.lock?(.15+.05*Math.sin(t*20)).toFixed(3):.07})`;ctx.fill();ctx.strokeStyle=`rgba(${RD},${F.lock?.85:.6})`;ctx.lineWidth=2;if(!F.lock)ctx.setLineDash([8,6]);ctx.stroke();ctx.setLineDash([]);
    const k=F.fill||0;
    if(F.kind==='sweep'){const as=F.a+F.hw*F.side,ae=as-2*F.hw*F.side*k;if(k>0){path(F.R,Math.min(as,ae),Math.max(as,ae));ctx.fillStyle=`rgba(${RD},.2)`;ctx.fill()}
      // the arrow on the arc: the way the tongue will sweep
      const am=F.a+F.hw*F.side*.5,a2=am-.6*F.side,ar=F.R+12;ctx.strokeStyle='rgba(255,235,210,.85)';ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();ctx.arc(x,y,ar,Math.min(am,a2),Math.max(am,a2));ctx.stroke();
      const hx=x+Math.cos(a2)*ar,hy=y+Math.sin(a2)*ar,ha=a2-Math.PI/2*F.side;ctx.fillStyle='rgba(255,235,210,.92)';ctx.beginPath();ctx.moveTo(hx+Math.cos(ha)*10,hy+Math.sin(ha)*10);
      ctx.lineTo(hx+Math.cos(ha+2.5)*8,hy+Math.sin(ha+2.5)*8);ctx.lineTo(hx+Math.cos(ha-2.5)*8,hy+Math.sin(ha-2.5)*8);ctx.closePath();ctx.fill()}
    else if(k>0){path(F.R*k,a0,a1);ctx.fillStyle=`rgba(${RD},.16)`;ctx.fill()}ctx.restore()}
  if(B.orb&&!B.orb.done){const O=B.orb,x=O.x,y=O.y+FY,r=O.r,k=O.k||0,pu=.55+.3*Math.sin(t*18);
    ctx.fillStyle=`rgba(${RD},${.1+.22*k})`;ell(x,y,r*k,r*k*K);ctx.fill();ctx.strokeStyle=`rgba(${RD},${O.lock?pu:.65})`;ctx.lineWidth=2.5;if(!O.lock)ctx.setLineDash([7,6]);ell(x,y,r,r*K);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle=`rgba(0,0,0,${.12+.25*k})`;ell(x,y,r*(.3+.7*k)*.85,r*(.3+.7*k)*K*.85);ctx.fill();
    for(let i=0;i<6;i++){const an=-Math.PI/2+i*TAU/6,on=k>=(i+1)/6;ctx.fillStyle=on?'rgba(255,240,200,.95)':`rgba(${RD},.6)`;circ(x+Math.cos(an)*r*1.1,y+Math.sin(an)*r*K*1.1,on?3:2);ctx.fill()}
    if(O.wave){ctx.strokeStyle=`rgba(255,235,210,${.32+.14*Math.sin(t*10)})`;ctx.lineWidth=1.5;ctx.setLineDash([6,7]);circ(O.x,O.y,O.wave);ctx.stroke();ctx.setLineDash([])}}
  for(const c of B.rain){const x=c.x,y=c.y+FY;if(c.st==='warn'){const k=c.t/c.w;ctx.fillStyle=`rgba(${RD},${.1+.26*k})`;ell(x,y,c.r*k,c.r*k*K);ctx.fill();
      ctx.strokeStyle=`rgba(${RD},${.55+.3*Math.sin(t*18)})`;ctx.lineWidth=2.2;ell(x,y,c.r,c.r*K);ctx.stroke()}
    else{const a=Math.max(0,1-c.t);if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow('255,170,70',x,y,c.r*1.3,.5*a,c.r*.7);ctx.restore()}else{ctx.fillStyle=`rgba(255,190,110,${.3*a})`;ell(x,y,c.r*.7,c.r*.42);ctx.fill()}}}}
// ---- in the air: his three fireflies circling the landing circle, the fireflies that rise and fall back (with their trail of light), the
// ones he swallows, the bubbles that burst; and when he has fallen, the freed fireflies and the one on the crown
function tkAir(){const t=G.t||0,B=G.tk,D=G.tkd,FY=TK.FY,K=TK.K;
  if(B){const e=tkBoss();
    if(B.orb&&!B.orb.done&&!LOWFX&&e){const O=B.orb,u=Math.min(1,(t-O.t0)/.35),q=u*u*(3-2*u);for(let i=0;i<3;i++){const an=t*2.6+i*TAU/3,cx=O.x+Math.cos(an)*(O.r+4),cy=O.y+FY+Math.sin(an)*(O.r+4)*K,z=34+6*Math.sin(t*3+i*2);
      tkFly(e.x+(cx-e.x)*q,e.y+8+(cy-e.y-8)*q,60+(z-60)*q,t*1.3+i*.37,{p2:!!e.p2})}}
    for(const f of B.up){const al=f.fin?Math.min(1,Math.hypot(f.x-f.x0,f.y-f.y0)/40):1;if(al<=.02)continue;const a0=ctx.globalAlpha;ctx.globalAlpha=a0*al;tkFly(f.x,f.y,0,t*1.6+f.ph,{p2:f.p2});ctx.globalAlpha=a0}
    for(const c of B.rain)if(c.st==='warn'&&c.w-c.t<.25){const f=1-(c.w-c.t)/.25;tkFly(c.x,c.y+FY,240*(1-f),t*2+c.i,{p2:true,fall:f})}
    if(B.eat.length&&e){const m=tkPt(e,36,0,56);for(const f of B.eat){if(f.t<0)continue;const u=Math.min(1,f.t/f.d),q=u*u,an=(1-q)*Math.PI*1.4*f.sp,dx=f.x0-m.x,dy=f.y0-m.y,ca=Math.cos(an),sa=Math.sin(an);
      tkFly(m.x+(dx*ca-dy*sa)*(1-q),m.y+(dx*sa+dy*ca)*(1-q),0,t*2+f.ph,{p2:false})}}
    const A=tkArt('Bubble');if(A)for(const p of B.pops){try{A(p.x,p.y+14,14,10,t*3+p.ph,1,{p2:p.p2,pop:Math.min(1,p.t/.25)})}catch(err){}}}
  // (the one on the crown blinks once a second, as it did while the model drew it)
  if(D){for(const f of D.free)if(f.t>=0)tkFly(f.x,f.y,0,t*1.4+f.ph,{p2:false});if(D.sit)tkFly(D.sit.x,D.sit.y,D.sit.z||0,D.sit.t,{p2:false,sc:D.sit.s||1})}}
{const _g2=drawHazards2Ground;drawHazards2Ground=function(){_g2.apply(this,arguments);try{if(TKON)tkGround()}catch(err){}}}
{const _a2=drawHazards2Air;drawHazards2Air=function(){_a2.apply(this,arguments);try{if(TKON)tkAir()}catch(err){}}}
// ---- the entrance (3.4 s, the model's 'enter'): the fireflies of the room whirl over the circle of runes, a far croak from above, a whistle,
// and the king falls from the sky on his belly in the middle of the runes (1.53 s): the room shakes, the pools splash, the lily pads jump,
// the fireflies flee; the seven cattails spring up (boing), the crown falls back on his head (clink), the royal croak (2.52 s), two taps
if(TKON){const _bi=bossIntro;bossIntro=function(e,dt,a){if(e.type!=='toad')return _bi.apply(this,arguments);
  const T=BOSS_INTRO.toad;if(e.iT==null){e.iT=0;e.iStep=0}const t0=e.iT;e.iT+=dt;const t=e.iT,at=s=>t0<s&&t>=s;
  e.intro=Math.max(0,T-t);e.face=a;e.st='enter';e.z=0;e.em=t<1.53?.999:1;e.hole=0;
  if(t0===0){tkReset();if(G.runeAt){e.x=G.runeAt.x;e.y=G.runeAt.y-TK.FY}e.tkAmb=(G.amb||[]).filter(q=>q.k==='firefly')}
  const c=G.runeAt||{x:e.x,y:e.y+TK.FY},F=e.tkAmb||[];
  if(t<1.53){F.forEach((f,i)=>{const an=t*(2.2+t*.8)+i/Math.max(1,F.length)*TAU,rr=(95-t*30)*(.85+.15*Math.sin(i*1.7)),tx=c.x+Math.cos(an)*rr,ty=c.y-30-t*12+Math.sin(an)*rr*.5,kk=Math.min(1,dt*(2+t*3));
      f.x+=(tx-f.x)*kk;f.y+=(ty-f.y)*kk});if(Math.random()<dt*6){const p=(G.puddles||[])[randi(0,Math.max(0,(G.puddles||[]).length-1))];if(p)G.ripples.push({x:p.x+rand(-p.rx,p.rx)*.5,y:p.y,r:2,max:p.rx*.7,a:.8})}}
  if(at(.2)&&AU.ctx&&AU.on.sfx&&AU.ctx.state==='running'){try{B3VO.play('toad','far',AU.ctx.currentTime+.01,.32,VR(1,.03),.6)}catch(err){}}
  if(at(.9))tkSnd('fall',e.x);
  if(at(1.53)){const x=e.x,y=e.y+TK.FY;shake(10);vib([80,40,100]);sfx('boom',0,x);sfx('splash',2,x);for(const p of G.puddles||[])G.ripples.push({x:p.x,y:p.y,r:3,max:p.rx,a:.9});tkLilies(x,y,900,B3N(10));
    if(BOSS2){ENV2.rocks(x,e.y,400,0);ENV2.splash(x,y,B3N(18),'#cfe9d8');ENV2.mark('puddle',x,y+2,30)}
    vfxBlast(x,y,'190,235,170',120,{debris:['#5a4a30','#3e3220','#7a8a4a'],n:B3N(22),sparks:B3N(10),spcol:['#e8ffc0','#c8f07a','#ffffff'],dust:B3N(12),ring2:false});
    for(let i=0;i<3;i++)setTimeout(()=>{if(G&&G.fx)fxPush({k:'ring2',x,y,rgb:'200,240,190',r0:e.r,r1:e.r*(3.5+i*1.8),t:.5,max:.5,w:7-i*2})},i*110);tkScare(c.x,c.y-30,.9)}
  for(const s of[1.87,1.94,2.01,2.07,2.14,2.21,2.28])if(at(s))tkSnd('boing',e.x);
  // (the clink and the glint when the crown lands on his head: the model's .68)
  if(at(2.31)){tkSnd('clink',e.x);const q=tkPt(e,8,-3,92);fxPush({k:'flash',x:q.x,y:q.y,r:22,rgb:'255,240,170',t:.25,max:.25})}
  if(at(2.52)){if(!b3say(e,'cry'))sfx('croak',2,e.x);vib([60,40,120]);shake(5);for(const t2 of G.torches||[])t2.ph+=2.5;
    for(let i=0;i<3;i++)setTimeout(()=>{if(G&&G.fx)fxPush({k:'ring2',x:e.x,y:e.y-e.r,rgb:'230,255,190',r0:e.r,r1:e.r*5,t:.45,max:.45,w:6-i*1.5})},i*170)}
  if(at(3.18))tkSnd('tap',e.x);// the two fingers on the belly (the model's .935 and .955)
  if(e.intro<=0){e.z=0;e.em=null;e.si=-1;e.tkAmb=null;e.wt=0;b3go(e,'walk',.9)}}}
// what the model plays: the entrance over its whole length (its own clock, not the boss speed); every move on the brain's own clock (the
// blow of the game and the gesture of the model in the same frame, and a chained flop starts again from its first frame)
if(TKON){const _nm=n3Move;n3Move=function(e){if(e.type==='toad'){if(e.intro>0)return['enter',Math.min(.999,Math.max(0,(e.iT||0)/BOSS_INTRO.toad))];
    const M=N3.meta.toad;if(e.st&&e.st!=='walk'&&M&&M.an.includes(e.st))return[e.st,Math.min(.999,Math.max(0,b3k(e)))]}
  return _nm.apply(this,arguments)}}
// ---- the defeat (4 s, the model's 'die'): it swells, spits all its fireflies in a fountain of light (2 s: the bar and «sconfitto»), they stay
// in the room; it deflates, shrinks to a common little toad that dives into the mud (.92); the crown stays on the floor, a firefly on it
// (at the size, in the place and turned the way the model drew it at its last frame; the firefly that sat on it stays where it sat)
function tkBakeCrown(c){const s=c.p2?1.12:1,V=C3.V(c.face),q=V.P([26*s,-50*s,0]),x=c.x+q[0],y=c.y+8+q[1],A=tkArt('Crown'),sv=ctx;
  if(G.tkd){const q2=V.P([28*s,-49*s,0]);G.tkd.sit={x:c.x+q2[0],y:c.y+8+q2[1],z:14*s,s,t:0}}
  try{ctx=fx;fx.save();fx.setTransform(2,0,0,2,0,0);if(A)A(x,y,0,c.face,s,{});else tkCrownDraw(x,y,c.face);fx.restore()}catch(err){try{fx.restore()}catch(e2){}}finally{ctx=sv}}
if(TKON){const _sb=snapBoss;snapBoss=function(e){if(e.type==='toad')return{live:1};return _sb.apply(this,arguments)}
  BDIE.toad={setup(c){const e=c.e;tkReset();if(!G.tkd)tkDreset();c.face=e.f3!=null?e.f3:(e.face||Math.PI/2);c.p2=!!e.p2;c.live=1;if(P.pull&&P.pull.tk)P.pull=null;sfx('croak',1,c.x)},
    tick(c,dt,D){const p=Math.min(1,c.t/c.dur),pass=x=>c.t-dt<x*c.dur&&c.t>=x*c.dur,TD=G.tkd||(tkDreset(),G.tkd);
      if(pass(.02)){tkSnd('clink',c.x);shake(2)}
      if(p>.1&&p<.45&&Math.random()<dt*3)tkSnd('creak',c.x);
      for(const s of[.2,.25,.3,.34,.38,.41,.44])if(pass(s))tkSnd('boing',c.x);// the cattails pop off like corks
      if(pass(.5)){shake(7);vib([60,40,100]);fxPush({k:'flash',x:c.x,y:c.y-70,r:220,rgb:'214,255,90',t:.4,max:.4});tkSnd('bells',c.x);
        const m={x:c.x,y:c.y+8-82};for(let i=0;i<(LOWFX?12:40);i++){const an=i*2.4,v=rand(70,190);
          TD.free.push({x:m.x+rand(-4,4),y:m.y,vx:Math.cos(an)*v,vy:-rand(120,260)+Math.sin(an)*v*.4,t:-i*.012,life:rand(1.3,2.3),ph:rand(0,9),tx:rand(L+20,R-20),ty:rand(TOP+30,BOT-30)})}}
      if(pass(.51))tkSnd('whistle',c.x);
      if(pass(.62))tkSnd('cape',c.x);
      if(pass(.8)&&AU.ctx&&AU.on.sfx){try{B3VO.play('toad','cra',AU.ctx.currentTime+.01,.5,1,.15)}catch(err){}}
      if(pass(.92)){tkSnd('plop',c.x);const q=C3.V(c.face).P([14,0,0]);G.ripples.push({x:c.x+q[0],y:c.y+8+q[1],r:3,max:22,a:1});if(BOSS2)ENV2.splash(c.x+q[0],c.y+8+q[1],B3N(6),'#cfe9d8')}
      if(c.t>=c.dur&&!c.baked){c.baked=1;tkBakeCrown(c)}},
    draw(c,D){const p=Math.min(.999,c.t/c.dur),M=N3.meta.toad;try{N3.toad(c.x,c.y+8,c.face,'die',p,(M&&M.sc)||1,{p2:c.p2,noFx:LOWFX})}catch(err){}}};
  const _dc=drawCorpse;drawCorpse=function(c){if(c.type!=='toad')return _dc.apply(this,arguments);try{BDIE.toad.draw(c,BDEATH.toad)}catch(err){}drawParts(c)}}
// ---- the voice and the personality, like the four new bosses (88-boss3-voci.js): an enormous voice from the throat that croaks with the
// trill of the sac (the voice beats 20-25 times a second); never a gurgle nor a raspberry (those are the Octopus's). The royal croak in
// the entrance; «gro-gro-gro» when it hits you and mocks you (its gesture, the model's 'taunt'); a bored «graaak?» and a yawn when you keep
// away and it calls you out; «gwak!» when you hit it hard; a sound for each blow (a hum before the tongue, «hah!» with the Frustata,
// «hnnng… hup!» for the belly flop, the sac swelling and the real BURP, a breath before the drum and «hoh!» on its last blow, three hoarse
// coughs in the Pioggia); the rage; when it falls the effort while it swells, the enormous burp, the little «cra?» of the toadlet; and a
// slow «gro… ho… ho» with a little burp if you fall.
if(TKON){B3S.add('toad');
  B3VO.VB.toad={base:{br:.32,ro:.45,ji:.1,lp:.42},k:{
    far:[[.95,[{t:0,d:.9,f:[66,88,70],v:['o','a','o'],am:[.55,21],ro:.5,rel:.45}],.42]],
    // (the royal croak as long as the sac stays full in the entrance; the rage's long croak while its sac is full; the laugh's three
    // «gro» on the model's three laughs)
    cry:[[1.05,[{t:0,d:.16,noise:1,v:'h',a:.55},{t:.14,d:.56,f:[62,100,70],v:['o','a','o'],am:[.55,22],ro:.55,h:.04,vib:[.025,4],rel:.3}],.66]],
    angry:[[1.65,[{t:0,d:.16,f:[70,64],v:'o',am:[.5,24],ro:.5,h:.12},{t:.2,d:.16,f:[85,76],v:'o',am:[.5,24],ro:.5,h:.12},{t:.4,d:.16,f:[100,90],v:'a',am:[.5,24],ro:.55,h:.12},
      {t:.62,d:.82,f:[75,120,65],v:['a','a','o'],am:[.6,24],ro:.65,ji:.16,vib:[.03,5],h:.04,rel:.3}],.66]],
    laugh:[[.9,[{t:0,d:.16,f:[92,86],v:'o',am:[.5,22],ro:.45,h:.2},{t:.18,d:.16,f:[83,78],v:'o',am:[.5,22],ro:.45,h:.2,a:.92},{t:.36,d:.22,f:[74,68],v:['o','u'],am:[.5,22],ro:.5,h:.2,a:.85,rel:.4}],.52]],
    laugh2:[[1.45,[{t:0,d:.62,f:[70,76,95],v:['a','a','o'],am:[.55,21],ro:.5,h:.1,rel:.25},{t:.78,d:.6,noise:1,v:['a','o'],a:.5}],.5]],
    hurt:[[.3,[{t:0,d:.27,f:[130,85],v:['u','a'],am:[.4,23],ro:.4,h:.08}],.5],[.3,[{t:0,d:.05,noise:1,v:'h',a:.6},{t:.04,d:.24,f:[122,82],v:['o','a'],am:[.4,23],ro:.45}],.5]],
    c_tongue:[[.6,[{t:0,d:.55,f:[78,72,80],v:'m',am:[.3,20],ro:.4,rel:.4}],.4]],
    c_sweep:[[.85,[{t:.52,d:.26,f:[120,96],v:['a','a'],am:[.3,22],ro:.4,h:.3}],.48]],
    c_flop:[[.78,[{t:0,d:.44,f:[80,88],v:'m',am:[.4,20],ro:.5,a:.8},{t:.52,d:.18,f:[125,96],v:['u','a'],ro:.4,h:.3}],.48]],
    c_burp:[[.95,[{t:0,d:.9,f:[66,76],v:['m','u'],am:[.35,18],ro:.4,rel:.3}],.4]],
    burp:[[.8,[{t:0,d:.75,f:[60,50,44],v:['o','a','o'],am:[.7,26],ro:.8,ji:.3,h:.03,rel:.3}],.62]],
    c_drum:[[.42,[{t:0,d:.08,noise:1,v:'h',a:.5},{t:.07,d:.3,f:[88,80],v:'m',ro:.4,am:[.3,20]}],.4]],
    hoh:[[.34,[{t:0,d:.3,f:[108,88],v:['o','o'],ro:.45,h:.25,am:[.3,22]}],.5]],
    c_rain:[[1.15,[{t:0,d:.42,noise:1,v:['h','a'],a:.45},{t:.6,d:.13,f:[96,80],v:'a',ro:.75,ji:.3,h:.45},{t:.78,d:.13,f:[98,82],v:'a',ro:.75,ji:.3,h:.45},{t:.96,d:.15,f:[100,78],v:'a',ro:.8,ji:.3,h:.45}],.5]],
    die:[[2.45,[{t:0,d:1.85,f:[66,96,150],v:['m','o','u'],am:[.4,20],ro:.4,vib:[.04,5],h:.04,rel:.12},{t:1.95,d:.48,f:[56,46],v:['o','a'],am:[.7,25],ro:.8,ji:.3,rel:.4}],.6]],
    cra:[[.26,[{t:0,d:.22,f:[430,380],v:'a',am:[.3,30],ro:.15,h:.1}],.38]],
    win:[[1.7,[{t:0,d:.3,f:[84,76],v:'o',am:[.5,22],ro:.5,h:.15},{t:.5,d:.24,f:[92,84],v:'o',ro:.45,h:.3},{t:.92,d:.24,f:[88,80],v:'o',ro:.45,h:.3},{t:1.32,d:.3,f:[62,50],v:['o','a'],am:[.6,26],ro:.7,ji:.25,a:.7}],.56]]}};
  B3CUE.toad={tongue:'c_tongue',sweep:'c_sweep',flop:'c_flop',bubbles:'c_burp',drum:'c_drum',rain:'c_rain'};
  // its mocking (88-boss3-voci.js): the gesture now, the voice when the model laughs (the 'taunt' case of the brain, at .38)
  {const _bt=b3taunt;b3taunt=function(e,k){if(!e||e.type!=='toad')return _bt.apply(this,arguments);const S=e.b3s||(e.b3s={});S.tauntT=G.t||0;S.pend=0;
    b3go(e,'taunt');e.moving=false;e.anchor=null;e.tkLk=k||'laugh'}}
  // under its big cries the sac resonates, low
  {const _m=b3sayMore;b3sayMore=function(e,k,t){if(e.type!=='toad')return _m.apply(this,arguments);
    if(k==='cry'||k==='angry'||k==='die'||k==='win'||k==='burp')fNoise(t+.08,k==='die'?2.2:k==='burp'?.6:1.4,'lowpass',VR(170,.1),.9,.07,{brown:true,att:.25})}}
  // the light that runs inside him before each blow tinkles like glass (in the boss's time, faster in the second phase)
  {const _g=b3go;b3go=function(e,st){_g.apply(this,arguments);try{const B=e.type==='toad'&&!(e.intro>0)&&TK.glass[st];if(B&&AU.ctx&&AU.on.sfx&&AU.ctx.state==='running'){
    const k=B3D(e,st)/((e.p2?TK.sp2:1)*((G.bossLvl||bossLvl()||{}).spd||1)),t=AU.ctx.currentTime+.01,v=Math.max(.55,enemyAt(e));B.forEach(c=>tkGlass(t+c*k,v));AU.pan=0}}catch(err){}}}
  // the voices get ready in the rooms of its arena (and at once in its room)
  {const _br=buildRoom;buildRoom=function(){const r=_br.apply(this,arguments);try{const A=G&&G.mode!=='inf'&&!G.daily&&ARENAS[G.arena||0];
    if(A&&BOSSZ[A.boss]==='toad'||G&&(G.enemies||[]).some(q=>q.type==='toad'))B3VO.prep('toad')}catch(err){}return r}}
  // the defeat with its voice (the cry of the entrance and the rage are in bossIntro and the brain)
  {const _s=BDIE.toad.setup;BDIE.toad.setup=function(c){_s.apply(this,arguments);b3say(c,'die')}}}
// ---- for the previews (anteprime/mk_boss2.py) and the tests (tests/boss2gioco.js): how to get into its room, its moves in each phase, the
// dangers it puts in the room (counted by the tests) and the clips of its voice
if(TKON){const R=window.BCL||(window.BCL={});R.toad={n:'Re Rospo',arena:2,p2:true,
  enter(){G.arena=2;G.chapter=ARENAS[2].ch;G.diff=ARENAS[2].diff;G.bossLvl=null;G.room=ROOMS;G.event=null;buildRoom()},
  moves:['tongue','stuck','flop','bubbles','drum'],moves2:['rage','sweep','rain'],
  hz(){const B=G.tk||{};return{cerchi:(B.orb&&!B.orb.done?1:0)+(B.rain||[]).filter(c=>c.st==='warn').length,strisce:B.strip?1:0,ventagli:B.fan&&!B.fan.done?1:0,anelli:(B.rings||[]).length,
    bolle:G.eproj.filter(q=>q.kind==='fbubble').length,fango:G.zones.filter(z=>z.tkMud).length,pioggia:(B.rain||[]).length,girini:G.enemies.filter(q=>q.type==='tadpole'&&!q.dead).length,
    onde:G.waves.length,lingua:G.enemies.some(q=>q.type==='toad'&&q.tkTip)?1:0}},
  voice:['cry','laugh','angry','die']}}
