// =====================================================================
// IL CERVO D'AURORA RIFATTO: «il Re della Vetta» (Denis, 15 ottobre: «rivisita tutti i boss … possenti, belli, fighi, che diano
// timore nello sfidarli», «migliora anche le loro abilità speciali»; poi, visto il Golem, «sì, fai gli altri 12»). ANTEPRIMA: questo file
// e il modello sprite/nemici3d/stag2.js entrano solo nella copia del gioco fatta da anteprime/mk_boss2.py; nel gioco vero dopo il sì di
// Denis (il modello prende il posto di 'stag' e questo file va in src/ordine.txt). Design e numeri: docs/boss-classici-design/stag.md.
// L'ultimo boss (arena 12, la Vetta di Mossbound): un cervo del nord immenso, blu notte, con la corona di cristallo vivo. Prima di ogni
// colpo l'aurora nasce dalle rosette d'oro e corre una punta alla volta nel pezzo che colpirà (il suo avviso, come il cuore del Golem).
// Ogni stato ha il nome di una mossa del modello; il colpo vero parte nel suo fotogramma. Mosse:
// - Carica del Re (prep, charge, stuck): una striscia rossa ti segue, si blocca e lampeggia; galoppa dritto e pianta le corna nel muro o
//   in un ostacolo (schegge di cristallo all'indietro), poi resta con le corna incastrate: i colpi fanno +50% («Corna incastrate!»). Se
//   l'ostacolo non c'è più frena (skid). Nella fase 2 la prima carica rimbalza (recoil), mira di nuovo (prep2) e corre ancora.
// - Spazzata della Corona (sweep): un settore rosso davanti a lui e nove righe dove voleranno le schegge della corona; nella fase 2 il
//   ritorno, con otto schegge più lente negli spazi delle prime.
// - Tende d'Aurora (aurora): due fasce a onde da muro a muro (tre nella fase 2), ognuna con la sua piega senza luce; cadono ai suoi cenni.
// - Zoccolata del Re (stomp): si impenna, un cerchio rosso sotto di lui e l'anello fin dove arriva l'onda di brina con le punte di
//   ghiaccio; nella fase 2 il secondo colpo e dodici schegge a raggiera.
// - Richiamo della Mandria (call): tre corsie da muro a muro, gli spiriti d'aurora le percorrono al galoppo uno dopo l'altro (nella fase
//   2 poi altre due in verticale). Finché c'è uno spirito il Cervo non attacca: cammina.
// - Corona Boreale (crown, solo fase 2): sei raggi d'aurora che girano insieme di 40° (le frecce dicono il verso).
// - Fase 2 (rage, a metà vita): la corona si spegne, si inginocchia, scende una colonna d'aurora e si rialza viola; da lì torce color
//   aurora, neve leggera e un nastro d'aurora sopra il muro di fondo (la stanza non si scurisce). Nessuna accelerazione in più: nell'arena
//   12 i boss vanno già 1,38 volte (bossLvl), e tutti i suoi tempi sono fatti con quello.
// Entrata (enter): scende con l'aurora sul cerchio di rune. Sconfitta (die): si inchina, lascia la corona ritta nel muschio fiorito e torna
// aurora. Ogni danno ha un avviso rosso a terra di almeno 0,6 s veri; mai due mosse insieme (la dopo aspetta tende, spiriti e raggi).
// =====================================================================
const SGON=typeof N3!=='undefined'&&!!N3.stag2;
const SGC={red:'229,72,77',
  seq1:['charge','sweep','aurora','charge','stomp','call'],seq2:['crown','charge','sweep','aurora','stomp','charge','call'],
  // the states that are no attack of their own: no charging ring round him when they start (51-boss2-mondi.js)
  calm:new Set(['charge','stuck','recoil','skid']),
  // the six bells of the entrance, one for each notch of the crown (the notes of his music)
  bells:[74,78,81,86,90,93]};
const SGD=Math.PI/180;
if(SGON){
  // the new model in place of the old one (its drawing of today stays as N3.meta.stag.old for the pages)
  const old=N3.stag,oldM=N3.meta.stag;N3.stag=N3.stag2;N3.meta.stag=Object.assign({},N3.meta.stag2,{old:(x,y,f,a,p)=>old(x,y,f,oldM.an.includes(a)?a:'idle',p,oldM.sc||1,{})});
  ET.stag.r=32;ECOL.stag='#34497f';B2H.stag=100;BBFX.stag={c:'#34497f',f:'#a2eaf6',k:'rise',s:'shimmer'};BOSS_INTRO.stag=3.4;BDEATH.stag={dur:4.2,clou:2.2,snd:'shimmer'};
  // what the game passes to the model: the walk from the road walked (a stride every 70 px, so the hooves never slide), the crown lighter
  // when you walk behind him, the way the Northern Crown turns; the rage move does the change of colours by itself (o.p2 false in it)
  N3G.wp.stag=e=>((((e.wd||0)/70)%1)+1)%1;
  N3G.opt.stag=e=>({see:e.see3||0,dir:e.cdir||1,p2:e.st==='rage'?false:!!e.p2});
  // (its line in the guide is in 44-guida.js, BEST2, with the others)
}
// ---- helpers
// the model's own drawings of the pieces of its attacks (design: Shard(x,y,z,a,sc,o), Spike(x,y,h,k,sc,o), Spirit(x,y,face,p,sc,o),
// Crown(x,y,sc,o)); the game's simple drawings if the model has none
const sga=n=>N3['stag'+n]||N3['stag2'+n]||null;
// the moments of his moves: the model's own (N3.stagInfo), the design's when it has none
const SGI0={notch:[.08,.16,.24,.32,.40,.48],enterNotch:[.72,.745,.77,.795,.82,.845],prep:{lock:.35,paw:[.32,.58]},prep2:{lock:.05,paw:.45},stuck:{tug:[.30,.58],free:.82},
  sweep:{go:.55,end:.70,back:[.70,.82]},aurora:{nod:[.58,.72,.86]},stomp:{hit:[.52,.76],flash:.40},call:{roar:[.25,.70]},crown:{lock:.38,rays:[.40,.88],ring:[.15,.40]},
  rage:{column:[.32,.50],roar:.68,ring:.70},enter:{steps:[.42,.55],eyes:.64,roar:.86},die:{clou:.52,horns:[.56,.74],light:[.62,.92],flowers:.84}};
function sgI(m,k){const I=sga('Info'),o=I&&I[m],v=o!=null?(k==null?o:o[k]):undefined;return v!=null?v:(k==null?SGI0[m]:SGI0[m][k])}
// the camera of the models squashes the floor (y·K): the face that makes him look straight at a point of the room
let sgKv=.55,sgKt=-1;function sgKf(){const t=G&&G.t||0;if(t!==sgKt){sgKt=t;try{sgKv=C3.V(0).P([0,1,0])[1]||.55}catch(err){sgKv=.55}}return sgKv}
const sgFace=a=>Math.atan2(Math.sin(a)/sgKf(),Math.cos(a));
// his time: the boss's dt already runs bossLvl().spd times the room's (1.38 in the arena 12); a stretch of a move in real seconds
const sgBL=()=>((G.bossLvl||(G.bossLvl=bossLvl())).spd||1);
const sgBoss=()=>G&&G.enemies?G.enemies.find(q=>q.type==='stag'&&!q.dead):null;
// a state of his: b3go, and the length its model's move is played over (the shorter stuck of the second phase plays the whole move)
function sgGo(e,st,dur,fit){b3go(e,st,dur);e.sdSt=st;e.sd=fit&&dur!=null?dur:B3D(e,st)}
const sgDur=e=>e.sdSt===e.st&&e.sd?e.sd:B3D(e,e.st);
const sgK=e=>(e.mt||0)/sgDur(e);
function sgAt(e,p){const D=sgDur(e),k1=(e.mt||0)/D,k0=((e.mt||0)-(e.mdt||0))/D;return k0<p&&k1>=p}
const sgReal=(e,dp)=>dp*sgDur(e)/sgBL();
function sgReset(){if(G)G.s2={band:null,curt:[],lanes:[],herd:null,prints:[],spw:[],spikes:[],rays:null,rayEnd:null,rayOut:0,veil:null,p2fx:0,p2k:0,relic:null,snowOff:0,snowT:0}}
// the dangers of a move go (the rage, the defeat, the hero falling); the prints of light and the relic stay
function sgClear(){const B=G&&G.s2;if(!B)return;B.band=null;B.curt=[];B.lanes=[];B.herd=null;B.spw=[];B.spikes=[];B.rays=null;B.rayEnd=null;B.rayOut=0}
{const _br=buildRoom;buildRoom=function(){sgReset();return _br.apply(this,arguments)}}
// the next move waits until the dangers of the one before are over: curtains fallen, spirits gone, rays out
const sgBusy=()=>{const B=G.s2;return!!B&&(B.curt.length>0||B.lanes.length>0||!!B.herd||!!B.rays||B.rayOut>0)};
// a shot whose speed is given in real px/s (shootE speeds the shots up with the room: here the design's speeds are the real ones)
function sgShoot(x,y,a,real,r,dmg,kind,p2){const f=Math.min(1.7,1+(effRoom()-1)*.035);shootE(x,y,a,real/f,r,dmg,kind);const q=G.eproj[G.eproj.length-1];if(q&&q.kind===kind)q.sp2=p2?1:0}
// how far he can run along a from (x, y) before the antlers touch a wall or an obstacle (the band of the Charge, like stagLine of today)
function sgRun(e,x,y,a){const ca=Math.cos(a),sa=Math.sin(a),m=e.r;let s=0;for(;s<1000;s+=6){const px=x+ca*(s+6),py=y+sa*(s+6);
  if(px<L+m||px>R-m||py<TOP+m||py>BOT-m)break;if(G.rocks.some(k=>Math.hypot(k.x-px,k.y-py)<k.r+m*.6))break}return s}
// how far a ray of the Northern Crown reaches: it stops against obstacles and walls (8 px at a time)
function sgRay(x,y,a){const ca=Math.cos(a),sa=Math.sin(a);let s=24;for(;s<1100;s+=8){const px=x+ca*s,py=y+sa*s;if(px<L||px>R||py<TOP||py>BOT)break;
  if(G.rocks.some(k=>Math.hypot(k.x-px,k.y-py)<k.r))break}return s}
// the eyes flash when a warning locks: a tinkle of crystal
function sgTink(e){if(!AU.ctx||!AU.on.sfx||AU.ctx.state!=='running')return;const t=AU.ctx.currentTime+.01,v=Math.max(.5,enemyAt(e));M.glass(t,.75*v,VR(2600,.05));M.glass(t+.07,.5*v,VR(3400,.05));AU.pan=0}
function sgBell(e,m,dur,vel){if(!AU.ctx||!AU.on.sfx||AU.ctx.state!=='running')return;const v=Math.max(.6,enemyAt(e));vBell(null,AU.ctx.currentTime+.01,m,dur,vel*v);AU.pan=0}
// bits of ice falling from the crown (the tugs of the stuck antlers)
function sgIceBits(e,n){for(let i=0;i<B3N(n);i++)G.debris.push({x:e.x+rand(-34,34),y:e.y+rand(-4,6),z:rand(80,112),vx:rand(-30,30),vy:rand(-8,8),vz:rand(10,40),col:pk(['#f0ffff','#a2eaf6','#ffffff']),s:rand(1.6,2.6),rot:rand(0,TAU),vr:rand(-8,8),life:1.4})}
// puffs of snow (white, on the floor)
function sgSnowPuff(x,y,n,sp){if(LOWFX)n=Math.ceil(n/2);for(let i=0;i<n;i++){const a=rand(0,TAU),s=rand(.4,1)*(sp||70);fxPush({k:'puff',x:x+Math.cos(a)*6,y:y+Math.sin(a)*3,vx:Math.cos(a)*s,vy:Math.sin(a)*s*.5-10,t:rand(.35,.6),r:rand(3,6)})}}
// walking between two moves (boss seconds), the anchor chosen again
function sgWalk(e,m){e.anchor=null;e.air=0;e.z=0;sgGo(e,'walk',m!=null?m:e.p2?rand(.95,1.2):rand(1.25,1.6))}
// the hero walks behind him: the crown and the mane grow lighter (o.see goes to 1 in 0.2 s)
function sgSee(e,rdt){const on=P.y<e.y-10&&Math.abs(P.x-e.x)<66&&e.y-P.y<140?1:0,v=e.see3||0;e.see3=v+clamp(on-v,-rdt*5,rdt*5)}
// ---- the start of each move: from still, looking at you
function sgNext(e){const seq=e.p2?SGC.seq2:SGC.seq1;e.si=(e.si==null?-1:e.si)+1;sgBegin(e,seq[e.si%seq.length])}
function sgBegin(e,nx){const B=G.s2,a=Math.atan2(P.y-e.y,P.x-e.x);e.lf=a;e.face=sgFace(a);e.moving=false;e.anchor=null;e.air=0;
  if(nx==='charge'){e.dbl=e.p2?1:0;sgGo(e,'prep');B.band={x:e.x,y:e.y,a,len:sgRun(e,e.x,e.y,a),lock:false,fill:0}}
  else if(nx==='sweep'){sgSweepAim(e,a);sgGo(e,'sweep')}
  else if(nx==='crown'){e.cdir=Math.random()<.5?1:-1;e.th0=a+Math.PI/6;sgGo(e,'crown')}
  else sgGo(e,nx)}
// the Sweep: the sector toward you (a, from his feet); the nine shards from the crown (e.x, e.y−60) in a fan centred on you, the first
// from his right side (where b3pt(e,0,−60) falls), 18.75° apart; the eight of the return in the gaps, from his left side to his right
function sgSweepAim(e,a){const oy=e.y-60,aC=Math.atan2(P.y-6-oy,P.x-e.x),q=b3pt(e,0,-60,sgFace(a)),aR=Math.atan2(q.y-(e.y+8),q.x-e.x),side=angDiff(a,aR)>=0?1:-1,A=[],Bk=[];
  for(let i=0;i<9;i++)A.push(aC+side*(75-18.75*i)*SGD);for(let j=7;j>=0;j--)Bk.push(aC+side*(75-18.75*(j+.5))*SGD);
  e.sw={a,aC,ox:e.x,oy,A,back:Bk,shot:0}}
// ---- the brain
if(SGON)EUPD.stag=function(e,dt,sm,a,d){if(!G.s2)sgReset();const B=G.s2,rdt=dt/sgBL();e.z=0;sgSee(e,rdt);
  b3tick(e,dt);const k=sgK(e),p2=!!e.p2,hA=Math.atan2(P.y-e.y,P.x-e.x);
  switch(e.st){
  case 'enter':e.si=-1;sgWalk(e,.8);break;
  // ---- between two moves: at half distance from you (180-240 px), round you; the body along its walk and turned toward you
  case 'walk':{e.air=0;
    // half health: the aurora lights up (only while walking, never during a charge, the stuck antlers, the herd or the Crown)
    if(!e.p2&&e.hp<e.max*.5&&!sgBusy()){sgRage(e);break}
    if(!e.anchor||Math.hypot(e.anchor.x-P.x,e.anchor.y-P.y)<130){const an=Math.atan2(e.y-P.y,e.x-P.x)+rand(-.8,.8),r=rand(180,240);e.anchor=b3spot(P.x+Math.cos(an)*r,P.y+Math.sin(an)*r*.8,40)}
    const dx=e.anchor.x-e.x,dy=e.anchor.y-e.y,dd=Math.hypot(dx,dy);
    if(dd>3){const ox=e.x,oy=e.y,st=Math.min(dd,(p2?55:46)*dt*sm);moveCircle(e,dx/dd*st,dy/dd*st);const mv=Math.hypot(e.x-ox,e.y-oy);e.wd=(e.wd||0)+mv;e.moving=mv>.02;
      if(mv<st*.3)e.anchor=null;const md=Math.atan2(dy,dx);e.face=sgFace(md+clamp(angDiff(md,hA),-.8,.8))}
    else{e.moving=false;e.face=sgFace(hA)}
    if(e.stT<=0&&!sgBusy()){e.moving=false;sgNext(e)}
    break}
  // ---- the mocking gesture (88-boss3-voci.js starts it): still, looking down his muzzle at you; then a short walk
  case 'taunt':{e.moving=false;e.air=0;e.face=sgFace(hA);if(e.stT<=0)sgWalk(e,rand(.3,.55));break}
  // ---- CARICA: the band follows you (at most 2.5 rad a real second) and locks at .35 (the eyes flash); the second aim of the second
  // phase (prep2) is locked from the start
  case 'prep':case 'prep2':{e.moving=false;e.air=0;const W=B.band,two=e.st==='prep2';
    if(W){W.x=e.x;W.y=e.y;if(!two&&!W.lock&&k<sgI('prep','lock')){const mx=2.5*rdt;W.a+=clamp(angDiff(W.a,hA),-mx,mx)}W.len=sgRun(e,e.x,e.y,W.a);W.fill=clamp(k,0,1);e.lf=W.a;e.face=sgFace(W.a)}
    if(!two&&sgAt(e,sgI('prep','lock'))&&W){W.lock=true;sgTink(e)}
    if(two&&sgAt(e,sgI('prep2','lock')))sgTink(e);
    // the scrapes of the right fore hoof on the snow
    for(const c of[].concat(two?sgI('prep2','paw'):sgI('prep','paw')))if(sgAt(e,c)){const q=b3pt(e,19,-11,e.face);sgSnowPuff(q.x,q.y,4,50)}
    if(e.stT<=0){if(!W){sgWalk(e);break}
      e.cr={x0:e.x,y0:e.y,a:W.a,s:0,len:W.len,t:0,hit:0};W.fill=1;e.air=1;e.stepT=0;sgGo(e,'charge',99);sfx('dash',0,e.x);shake(2)}
    break}
  // ---- the gallop along the band (it loops: the model's p from the time), the frost under the hooves; the first wall or obstacle stops
  // him with the antlers in it
  case 'charge':{e.moving=false;e.air=1;const C=e.cr;if(!C){e.air=0;B.band=null;sgWalk(e);break}
    C.t+=dt;const sp=(p2?340:300)*dt,ca=Math.cos(C.a),sa=Math.sin(C.a),s1=C.s+sp;let hit=null;
    for(let s=C.s+4;;s+=4){const ss=Math.min(s,s1),px=C.x0+ca*ss,py=C.y0+sa*ss;
      if(px<L+e.r||px>R-e.r||py<TOP+e.r||py>BOT-e.r){hit={s:Math.max(C.s,ss-4)};break}
      if(G.rocks.some(q=>Math.hypot(q.x-px,q.y-py)<q.r+e.r*.6)){hit={s:Math.max(C.s,ss-4)};break}
      if(ss>=s1)break}
    const s=hit?hit.s:s1;e.x=C.x0+ca*s;e.y=C.y0+sa*s;C.s=s;e.lf=C.a;e.face=sgFace(C.a);
    // the body: 24 once, in place of the plain touch (e.air keeps that one off)
    if(!C.hit&&P.inv<=0&&P.dashT<=0&&Math.hypot(P.x-e.x,P.y-e.y)<P.r+e.r-2){C.hit=1;hurtP(Math.round(24*DMG()))}
    e.stepT=(e.stepT||0)-dt;if(e.stepT<=0){e.stepT=.17;stepFx(e.x,e.y+6,true);b3fx(e,'sstride',e.x,e.y+6);if(!LOWFX)fxPush({k:'puff',x:e.x-ca*20,y:e.y+8,vx:-ca*40,vy:-12,t:.4,r:rand(5,8)})}
    if(hit){sgImpact(e,C);break}
    // past the end of its band without touching anything (the obstacle is gone), or running too long: it brakes, and no reward for you
    if(C.s>C.len+20||C.t>Math.max(1.9,(C.len+20)/(p2?340:300)+.3)){B.band=null;e.air=0;e.cr=null;e.sk={a:C.a,v:p2?340:300};sgGo(e,'skid');sfx('dash',0,e.x)}
    break}
  // ---- the antlers stuck in the wall: still, the blows hurt more (hurtE below); two tugs (.30, .58), free at .82
  case 'stuck':{e.moving=false;e.air=0;
    if(sgI('stuck','tug').some(c=>sgAt(e,c))){shake(2);sgIceBits(e,3);if(AU.ctx&&AU.on.sfx&&AU.ctx.state==='running'){const v=Math.max(.5,enemyAt(e));M.ice(AU.ctx.currentTime+.01,.45*v);AU.pan=0}}
    if(sgAt(e,sgI('stuck','free'))){shake(3);sgIceBits(e,4);sgSnowPuff(e.x+Math.cos(e.lf||0)*e.r,e.y+Math.sin(e.lf||0)*e.r*.6,6,80);sfx('rock',0,e.x)}
    if(e.stT<=0){if(e.b3s)e.b3s.acc=0;sgWalk(e)}break}
  // ---- the second phase: the first charge bounces off (recoil), then the second aim, already locked toward you
  case 'recoil':{e.moving=false;e.air=0;
    if(e.stT<=0){const a2=Math.atan2(P.y-e.y,P.x-e.x);B.band={x:e.x,y:e.y,a:a2,len:sgRun(e,e.x,e.y,a2),lock:true,fill:0};e.lf=a2;e.face=sgFace(a2);sgGo(e,'prep2')}break}
  // ---- the run ended on nothing: the front hooves planted, he slides to a stop
  case 'skid':{e.moving=false;e.air=0;const S=e.sk;
    if(S&&k<.6){const v=S.v*(1-k/.6);moveCircle(e,Math.cos(S.a)*v*dt,Math.sin(S.a)*v*dt);if(!LOWFX&&Math.random()<.5){const q=b3pt(e,19,(Math.random()<.5?1:-1)*11,e.face);sgSnowPuff(q.x,q.y,1,60)}}
    if(e.stT<=0){e.sk=null;sgWalk(e)}break}
  // ---- SPAZZATA: the sector and the rows (from p 0); the shards one by one from .55 (210 px/s), the sector strikes at .62; in the second
  // phase the return from .70 (150 px/s, in the gaps)
  case 'sweep':{e.moving=false;e.air=0;const S=e.sw;if(!S){sgWalk(e);break}e.face=sgFace(S.a);
    const N=sgI('notch'),g0=sgI('sweep','go'),g1=sgI('sweep','end'),bk=sgI('sweep','back');
    if(sgAt(e,N[N.length-1]))sgTink(e);
    for(let i=0;i<9;i++)if(sgAt(e,g0+i*(g1-g0)/8)){sgShoot(S.ox,S.oy,S.A[i],210,6,12,'crystal',p2);S.shot=i+1;if(!i)b3fx(e,'scrystals')}
    if(sgAt(e,.62)){const dx=P.x-e.x,dy=P.y-e.y,dd=Math.hypot(dx,dy);
      if(P.inv<=0&&P.dashT<=0&&dd<95+P.r*.5&&(dd<10||Math.abs(angDiff(S.a,Math.atan2(dy,dx)))<=75*SGD))hurtP(Math.round(22*DMG()));
      b3fx(e,'ssweep',e.x,e.y,S.a);shake(3);if(AU.ctx&&AU.on.sfx&&AU.ctx.state==='running'){whoosh(AU.ctx.currentTime+.01,.32,280,1700,.08,.25);AU.pan=0}}
    if(p2)for(let j=0;j<8;j++)if(sgAt(e,bk[0]+(j+.5)*(bk[1]-bk[0])/8)){sgShoot(S.ox,S.oy,S.back[j],150,6,12,'crystal',true);if(!j&&AU.ctx&&AU.on.sfx&&AU.ctx.state==='running'){whoosh(AU.ctx.currentTime+.01,.28,320,1500,.06,.25);AU.pan=0}}
    if(e.stT<=0){e.sw=null;sgWalk(e)}break}
  // ---- TENDE: the curtains appear at .14 and fall at the nods of the model (.58, .72; .86 in the second phase)
  case 'aurora':{e.moving=false;e.air=0;e.face=sgFace(hA);if(sgAt(e,.14))sgCurtains(e);if(e.stT<=0)sgWalk(e);break}
  // ---- ZOCCOLATA: up on the hind legs; the circle fills until .52 (the blow, the wave); in the second phase again at .76
  case 'stomp':{e.moving=false;e.air=0;e.face=sgFace(hA);const H=sgI('stomp','hit');if(sgAt(e,sgI('stomp','flash')))sgTink(e);if(sgAt(e,H[0]))sgStomp(e,1);if(p2&&sgAt(e,H[1]))sgStomp(e,2);if(e.stT<=0)sgWalk(e);break}
  // ---- RICHIAMO: the lanes at the full bellow (.25); the spirits run on their own clock (sgUpdate), he walks meanwhile
  case 'call':{e.moving=false;e.air=0;e.face=sgFace(hA);if(sgAt(e,sgI('call','roar')[0]))sgHerd(e);if(e.stT<=0)sgWalk(e);break}
  // ---- CORONA BOREALE: the six red rows (.15), the rays light up (.40) and turn together 40° until .88, then go out; still, panting after
  case 'crown':{e.moving=false;e.air=0;
    const Ry=sgI('crown','rays');if(sgAt(e,sgI('crown','lock')))sgTink(e);
    if(k>=Ry[0]&&k<Ry[1]){const u=(k-Ry[0])/(Ry[1]-Ry[0]),Rs=[];for(let i=0;i<6;i++){const ar=e.th0+i*Math.PI/3+e.cdir*40*SGD*u;Rs.push({a:ar,len:sgRay(e.x,e.y,ar)})}
      if(!B.rays){B.rays={x:e.x,y:e.y,R:Rs,hit:[0,0,0,0,0,0]};sgCrownOn(e)}else{B.rays.R=Rs;B.rays.x=e.x;B.rays.y=e.y}
      if(P.inv<=0&&P.dashT<=0)for(let i=0;i<6;i++){if(B.rays.hit[i])continue;const r=Rs[i],ux=P.x-e.x,uy=P.y-e.y,ca=Math.cos(r.a),sa=Math.sin(r.a),u2=ux*ca+uy*sa,v=Math.abs(uy*ca-ux*sa);
        if(u2>0&&u2<r.len&&v<9+P.r*.5){B.rays.hit[i]=1;hurtP(Math.round(18*DMG()));break}}}
    if(sgAt(e,Ry[1])&&B.rays){B.rayEnd=B.rays;B.rays=null;B.rayOut=.1;b3fx(e,'scrown',e.x,e.y,B.rayEnd)}
    if(e.stT<=0)sgWalk(e,1.4);break}
  // ---- FASE 2: no damage, no attacks; the column of aurora (.32-.50), the bellow of the rage (.68), the snow swept away (.70)
  case 'rage':{e.moving=false;e.air=0;e.face=sgFace(hA);
    if(sgAt(e,.12))sfx('icicles',.4,e.x);
    const Cl=sgI('rage','column');
    if(sgAt(e,Cl[0])){sfx('shimmer',2,e.x);sgBell(e,62,3,.035)}
    if(sgAt(e,Cl[1])){fxPush({k:'ring2',x:e.x,y:e.y,rgb:'200,160,255',r0:e.r,r1:e.r*3,t:.45,max:.45,w:5});sgBell(e,74,2.4,.03)}
    if(sgAt(e,sgI('rage','roar'))){b3say(e,'angry');shake(4);vib([60,40,120])}
    if(sgAt(e,sgI('rage','ring'))){shake(6);for(let i=0;i<2;i++)fxPush({k:'ring2',x:e.x,y:e.y,rgb:'235,248,255',r0:e.r,r1:e.r*(4+i*2.4),t:.5+i*.12,max:.5+i*.12,w:7-i*2.5});sgSnowPuff(e.x,e.y,14,160);sgSnow(true)}
    if(e.stT<=0){e.shell=0;e.si=-1;sgNext(e)}break}
  default:sgWalk(e)}};
// the second phase starts: the shots in flight and the dangers on the floor go, he cannot be hit until he stands again
function sgRage(e){e.p2=true;e.shell=99;e.air=0;e.moving=false;e.anchor=null;e.sw=null;e.cr=null;
  G.eproj=[];G.waves=[];sgClear();if(G.b3)G.b3.warn=[];
  banner("Il Cervo si accende d'aurora",'Fase 2',1.6);bossRage(e,'200,160,255');$('bossBar').classList.add('rage');shake(8);sfx('shimmer',2,e.x);
  b3fx(e,'phase2');sgTorches();sgGo(e,'rage')}
// for the rest of the fight the torches burn with the aurora: their colour of the room becomes the aurora (a copy: the world's own
// colours stay as they are), so whenever another blow changes them they come back to it
function sgTorches(){try{const T=B3TORCH.aurora,E=G.env;if(!E)return;const base=E._base||E,nb=Object.assign({},base,{torch:T[0],light:T[1]});delete nb._base;if(E._base)E._base=nb;else G.env=nb}catch(err){}}
// the light snow of the second phase (in the ambient particles: never with LOWFX); at the defeat it stops, a flake at a time
function sgSnow(on){const B=G.s2;if(!B||!G.amb)return;if(on){B.p2fx=1;if(!G.amb.some(a=>a.sg))for(let i=0;i<22;i++)G.amb.push({k:'snow',x:rand(L+10,R-10),y:rand(TOP+10,BOT-10),vx:rand(-6,6),vy:rand(14,28),ph:rand(0,TAU),t:0,sg:1})}
  else{B.p2fx=0;B.snowOff=1}}
// the blow of the charge against a wall or an obstacle: shards of crystal back from the antlers, then the antlers stuck (or, the first
// charge of the second phase, the rebound)
function sgImpact(e,C){const B=G.s2,p2=!!e.p2,ca=Math.cos(C.a),sa=Math.sin(C.a),ix=e.x+ca*e.r,iy=e.y+sa*e.r*.6;B.band=null;e.air=0;e.cr=null;
  shake(9);sfx('boom',0,e.x);vib([50,30,70]);
  vfxBlast(ix,iy-10,'190,240,255',80,{sparks:B3N(16),spcol:['#ffffff','#a2eaf6',p2?'#cdb8ff':'#7dffd0'],debris:['#e8f6ff','#a2eaf6','#ffffff'],n:B3N(12),dust:10,ring2:false});
  stamp('crater',ix,iy,22);b3fx(e,'swall',ix,iy);
  const n=p2?9:7,o=Math.atan2(-sa,-ca);for(let i=0;i<n;i++)sgShoot(ix,iy-20,o+(i-(n-1)/2)*.3,170,6,12,'crystal',p2);
  if(p2&&e.dbl===1){e.dbl=2;sgGo(e,'recoil')}else{e.dbl=0;sgGo(e,'stuck',p2?1.4:1.6,true)}}
// the Stomp's blows: 26 in the circle; the first one the wave of frost with its spikes, the second (second phase) twelve shards of ice
function sgStomp(e,n){const B=G.s2,p2=!!e.p2,R0=p2?80:72,x=e.x,y=e.y;
  if(P.inv<=0&&P.dashT<=0&&Math.hypot(P.x-x,P.y-y)<R0+P.r*.5)hurtP(Math.round(26*DMG()));
  vfxBlast(x,y,'220,245,255',n===1?110:80,{debris:['#ffffff','#e0f4ff','#a2eaf6'],n:B3N(n===1?20:12),sparks:B3N(12),spcol:['#ffffff','#a2eaf6',p2?'#cdb8ff':'#9fffe0'],dust:n===1?14:8,ring2:false});
  fxPush({k:'ring2',x,y,rgb:'230,248,255',r0:e.r,r1:R0*1.4,t:.35,max:.35,w:6});sfx('boom',0,x);
  if(n===1){G.waves.push({x,y,r:e.r,max:p2?290:240,dmg:Math.round(16*DMG()),hit:false,rgb:'190,240,255'});B.spw.push({x,y,r:e.r,max:p2?290:240,next:LOWFX?120:70,ring:0,p2});
    shake(10);sfx('icicles',0,x);vib([40,30,60]);stamp('crater',x,y+4,34);b3fx(e,'sstomp',x,y)}
  else{const o=rand(0,Math.PI/6);for(let i=0;i<12;i++){const a=o+i*Math.PI/6;sgShoot(x+Math.cos(a)*60,y+Math.sin(a)*60-8,a,150,6,12,'ice',true)}
    shake(8);sfx('freeze',1,x);stamp('cracks',x,y+4,30);if(BOSS2)ENV2.rocks(x,y,160,1)}}
// ---- TENDE D'AURORA: two parallel curtains (rows or columns), the first on your line, the second 130 px toward the side with more room
// (54 px of safe corridor between them); in the second phase a third across, where you stand. Each has its fold: 64 px with no light, at
// 60-150 px from where you are along it, never on a sheet of ice
const sgWave=(c,s)=>c.pos+16*Math.sin(TAU*s/260+c.ph);
function sgInCurt(c,x,y,pad){const s=c.h?x:y,dd=(c.h?y:x)-sgWave(c,s);return Math.abs(dd)<32+pad&&!(Math.abs(s-c.fold)<32)}
function sgFold(c){const sH=c.h?P.x:P.y,lo=(c.h?L:TOP)+36,hi=(c.h?R:BOT)-36,first=Math.random()<.5?1:-1;
  for(let n=0;n<16;n++){const side=n%2?-first:first,f=sH+side*rand(60,150);if(f<lo||f>hi)continue;
    if([f-32,f,f+32].some(s=>{const m=sgWave(c,s);return c.h?onIce(s,m):onIce(m,s)}))continue;return f}
  return clamp(sH+first*90,lo,hi)}
function sgCurtains(e){const B=G.s2,p2=!!e.p2,rows=Math.random()<.5,ph=rand(0,TAU),lo=rows?TOP+20:L+20,hi=rows?BOT-20:R-20,h0=rows?P.y:P.x,
    pos1=clamp(h0,lo,hi),up=(pos1-lo)>(hi-pos1),pos2=clamp(pos1+(up?-130:130),lo,hi),N=sgI('aurora','nod'),C=[{h:rows,pos:pos1,ph,warn:sgReal(e,N[0]-.14)},{h:rows,pos:pos2,ph,warn:sgReal(e,N[1]-.14)}];
  if(p2){const h3=!rows;C.push({h:h3,pos:clamp(h3?P.y:P.x,h3?TOP+20:L+20,h3?BOT-20:R-20),ph:rand(0,TAU),warn:sgReal(e,(N[2]||.86)-.14)})}
  for(const c of C){Object.assign(c,{warn0:c.warn,st:'warn',fall:0,act:0,hit:false,p2,sg:1});c.fold=sgFold(c);B.curt.push(c)}
  sfx('shimmer',1,e.x)}
// ---- RICHIAMO DELLA MANDRIA: three lanes across the room (rows 48 wide, 100 px apart): one on your row, the other two toward the side
// with more room or one on each side; the spirits take shape at the wall farthest from you, then run (540 px/s, one after the other)
function sgHerd(e){const B=G.s2,p2=!!e.p2,lo=TOP+26,hi=BOT-26,y0=clamp(P.y,lo,hi),up=(y0-lo)>(hi-y0),both=y0-100>=lo&&y0+100<=hi,two=up?y0-200>=lo:y0+200<=hi,Y=[y0];
  if(both&&(!two||Math.random()<.5))Y.push(y0-100,y0+100);else if(two)Y.push(y0+(up?-100:100),y0+(up?-200:200));else Y.push(clamp(y0+(up?-100:100),lo,hi),clamp(y0+(up?100:-100),lo,hi));
  const dir=(P.x-L)>(R-P.x)?1:-1;Y.forEach((y,i)=>B.lanes.push(sgLane(true,y,dir,1.1+i*.2,p2)));B.herd={p2,wave2:p2?0:-1};
  if(AU.ctx&&AU.on.sfx&&AU.ctx.state==='running'){const t=AU.ctx.currentTime+.01,v=Math.max(.5,enemyAt(e));whoosh(t,.9,300,1800,.05*v,.5);AU.pan=0}}
function sgLane(h,pos,dir,go,p2){const a0=h?L:TOP,a1=h?R:BOT;return{h,pos,dir,go,p2,t:0,st:'form',k:0,hit:false,s:dir>0?a0+26:a1-26,end:dir>0?a1-14:a0+14,pp:null,pn:0,fd:0}}
// the gallop of a spirit: soft hooves of crystal and a whoosh
function sgHoof(l){if(!AU.ctx||!AU.on.sfx||AU.ctx.state!=='running')return;const t=AU.ctx.currentTime+.01,x=l.h?l.s:l.pos,d=P?Math.hypot(x-P.x,(l.h?l.pos:l.s)-P.y):0,v=Math.max(.35,1-d/600);
  whoosh(t,.7,700,2600,.045*v,.3);for(let i=0;i<7;i++){fThump(t+i*.1,VR(150,.1),70,.05,.07*v);M.glass(t+i*.1+.01,.3*v,VR(2400+i*90,.06))}}
// ---- CORONA BOREALE: the rays light up
function sgCrownOn(e){shake(3);if(AU.ctx&&AU.on.sfx&&AU.ctx.state==='running'){const t=AU.ctx.currentTime+.01,v=Math.max(.5,enemyAt(e));fNoise(t,1.9,'bandpass',600,2,.06*v,{f2:1500,att:.25,rev:.5});
  vBell(null,t,81,2.2,.03*v);vBell(null,t+.12,88,2,.024*v);AU.pan=0}}
// the blows on the stuck antlers hurt more (and the first time in the run, the words over the crown); the rage cannot be hurt
{const _h=hurtE;hurtE=function(e,d){if(SGON&&e&&e.type==='stag'&&!e.dead){
  if(e.shell>0){if(!(e._shF>(G.t||0)-.12)){e._shF=G.t||0;G.fx.push({k:'spark',x:e.x+rand(-18,18),y:e.y-30-rand(0,50),t:.15})}return}
  if(e.st==='stuck'){const A=[...arguments];A[1]=d*1.5;if(!G.sgTxt){G.sgTxt=1;text(e.x,e.y-145,'Corna incastrate!','#ffd84a',18)}return _h.apply(this,A)}}return _h.apply(this,arguments)}}
// what the model plays: the entrance over its whole length (its last frame until the brain moves on), the gallop as a loop on its own
// clock, every other move over the length the brain gave it
if(SGON){const _nm=n3Move;n3Move=function(e){if(e.type!=='stag')return _nm.apply(this,arguments);
  if(e.intro>0)return['enter',Math.min(.999,Math.max(0,(e.iT||0)/BOSS_INTRO.stag))];
  if(e.st==='enter')return['enter',.999];
  const an=(N3.meta.stag&&N3.meta.stag.an)||[];
  if(e.st==='charge'&&an.includes('charge')){const D=B3D(e,'charge');return['charge',(((e.mt||0)%D)+D)%D/D]}
  if(e.st&&e.st!=='walk'&&e.st!=='taunt'&&an.includes(e.st))return[e.st,Math.min(.999,Math.max(0,sgK(e)))];
  return _nm.apply(this,arguments)}}
// no charging ring for the states that are no attack
if(SGON){const _bf=b2front;b2front=function(e){if(e.type==='stag'&&SGC.calm.has(e.st))e._b2st=e.st;return _bf.apply(this,arguments)}}
// ---- the dangers that live on their own in the room (real time): curtains, lanes and spirits, the spikes of the wave, the prints
function sgUpdate(dt){const B=G.s2;if(!B)return;
  if(G.state!=='play'){if(B.band||B.curt.length||B.lanes.length||B.spw.length||B.rays)sgClear()}
  else{const e=sgBoss();
    // the curtains: in the sky until their nod, the drape comes down in 0.1 s and stays 0.5 s; 18 once if you are in the band and not in
    // the fold
    for(let i=B.curt.length-1;i>=0;i--){const c=B.curt[i];
      if(c.st==='warn'){c.warn-=dt;if(c.warn<=0){c.st='fall';c.fall=0}}
      else if(c.st==='fall'){c.fall+=dt;if(c.fall>=.1){c.st='act';c.act=0;shake(2);sfx('shimmer',2,c.h?P.x:c.pos);b3fx(e,'scurtain',0,0,c);b3fx(e,'saurora')}}
      else{c.act+=dt;if(!c.hit&&P.inv<=0&&P.dashT<=0&&sgInCurt(c,P.x,P.y,P.r*.5)){c.hit=true;hurtP(Math.round(18*DMG()))}if(c.act>=.5)B.curt.splice(i,1)}}
    // the lanes: the spirit takes shape (0.6 s), waits, gallops through the obstacles (they sparkle), vanishes in sparks at the wall
    for(let i=B.lanes.length-1;i>=0;i--){const l=B.lanes[i];l.t+=dt;
      if(l.st==='form'){l.k=Math.min(1,l.t/.6);if(l.t>=l.go){l.st='run';l.k=1;l.pp=l.s;sgHoof(l)}}
      else if(l.st==='run'){const s0=l.s;l.s+=540*dt*l.dir;if(l.dir>0?l.s>=l.end:l.s<=l.end)l.s=l.end;
        const ps=l.h?P.x:P.y,pd=l.h?P.y:P.x;
        if(!l.hit&&P.inv<=0&&P.dashT<=0&&Math.abs(pd-l.pos)<24+P.r*.5&&((ps-s0)*(ps-l.s)<=0||Math.abs(ps-l.s)<14)){l.hit=true;hurtP(Math.round(18*DMG()))}
        while(Math.abs(l.s-l.pp)>=40){l.pp+=40*l.dir;l.pn++;if(B.prints.length<70)B.prints.push({x:l.h?l.pp:l.pos+(l.pn%2?6:-6),y:l.h?l.pos+(l.pn%2?6:-6):l.pp,a:l.h?(l.dir>0?0:Math.PI):(l.dir>0?Math.PI/2:-Math.PI/2),t:0,p2:l.p2})}
        for(const k of G.rocks){const ka=l.h?k.x:k.y,kd=l.h?k.y:k.x;if(Math.abs(kd-l.pos)<k.r+24&&(ka-s0)*(ka-l.s)<=0&&!(k._sgT>(G.t||0)-.4)){k._sgT=G.t||0;k.hit=Math.max(k.hit||0,.18);
          if(!LOWFX)for(let j=0;j<4;j++)fxPush({k:'spark',x:k.x+rand(-k.r,k.r)*.6,y:k.y-kH(k)*rand(.2,.9),t:.3});if(AU.ctx&&AU.on.sfx&&AU.ctx.state==='running')M.glass(AU.ctx.currentTime+.01,.35,VR(3000,.08))}}
        if(l.s===l.end){l.st='fade';l.fd=0;const x=l.h?l.s:l.pos,y=l.h?l.pos:l.s;if(!LOWFX)for(let j=0;j<10;j++)fxPush({k:'spark',x:x+rand(-14,14),y:y-rand(0,46),vx:rand(-60,60),vy:-rand(20,90),t:rand(.25,.5)});b3fx(e,'sherd',x,y,l)}}
      else{l.fd+=dt;l.k=Math.max(0,1-l.fd/.2);if(l.fd>=.2)B.lanes.splice(i,1)}}
    // the second wave of the second phase: when the first three spirits start, two lanes down the room (your column and one 100 px away)
    if(B.herd&&B.herd.wave2===0&&B.lanes.some(l=>l.h&&l.st!=='form')){B.herd.wave2=1;const lo=L+26,hi=R-26,x0=clamp(P.x,lo,hi),left=(x0-lo)>(hi-x0),x1=clamp(x0+(left?-100:100),lo,hi),dir=(P.y-TOP)>(BOT-P.y)?1:-1;
      B.lanes.push(sgLane(false,x0,dir,1,true),sgLane(false,x1,dir,1.2,true))}
    if(B.herd&&!B.lanes.length){B.herd=null;for(const k in SGL)delete SGL[k]}
    // the waves of the Stomp: a ring of spikes every 70 px of radius (120 with LOWFX), half a step apart from one ring to the next
    for(let i=B.spw.length-1;i>=0;i--){const w=B.spw[i];w.r+=210*dt;const n=LOWFX?8:12;
      while(w.r>=w.next&&w.next<=w.max){for(let j=0;j<n;j++){const a=(j+(w.ring%2?.5:0))*TAU/n;B.spikes.push({x:w.x+Math.cos(a)*w.next,y:w.y+Math.sin(a)*w.next,a,t:0,p2:w.p2})}w.ring++;w.next+=LOWFX?120:70}
      if(w.r>w.max)B.spw.splice(i,1)}}
  for(let i=B.spikes.length-1;i>=0;i--){B.spikes[i].t+=dt;if(B.spikes[i].t>=.25)B.spikes.splice(i,1)}
  for(let i=B.prints.length-1;i>=0;i--){B.prints[i].t+=dt;if(B.prints[i].t>=2)B.prints.splice(i,1)}
  if(B.rayOut>0){B.rayOut-=dt;if(B.rayOut<=0){B.rayOut=0;B.rayEnd=null}}
  B.p2k=clamp((B.p2k||0)+(B.p2fx?dt:-dt)/.8,0,1);
  if(B.snowOff&&G.amb){B.snowT-=dt;if(B.snowT<=0){B.snowT=.08;const i=G.amb.findIndex(a=>a.sg);if(i>=0)G.amb.splice(i,1);else B.snowOff=0}}}
{const _u=update;update=function(dt){_u.apply(this,arguments);try{if(SGON&&G&&G.s2&&started&&!paused)sgUpdate(dt)}catch(err){console.error(err)}}}
// ---- the drawings
// the red of the warnings with a dark thread outside, so they read on the light floor of the Prato dell'Aurora (the path is ready)
function sgEdge(w,al,dash){ctx.save();ctx.lineJoin='round';ctx.lineCap='round';ctx.strokeStyle=`rgba(60,14,18,${(.55*Math.min(1,al+.25)).toFixed(3)})`;ctx.lineWidth=w+2.4;ctx.stroke();
  ctx.strokeStyle=`rgba(229,72,77,${al.toFixed(3)})`;ctx.lineWidth=w;if(dash)ctx.setLineDash(dash);ctx.stroke();ctx.restore()}
// the light of the aurora on a band: full (source-over, at most .55) green → sky blue → violet across it, a white line in the middle, a
// dark edge; the glow ('lighter') only on top and only without LOWFX. k its strength
function sgAuroraFill(x0,y0,x1,y1,k){const g=ctx.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,`rgba(125,255,208,${(.5*k).toFixed(3)})`);g.addColorStop(.5,`rgba(111,216,255,${(.55*k).toFixed(3)})`);
  g.addColorStop(1,`rgba(180,140,255,${(.5*k).toFixed(3)})`);return g}
// the band of the Charge: it fills as the light runs down the lances, it flashes once locked; the arrow at the antlers' end
function sgDrawBand(W,t){const len=Math.max(40,W.len+32),hw=32,fl=W.lock?(Math.sin(t*30)>0?.95:.6):.55+.25*Math.sin(t*14);
  ctx.save();ctx.beginPath();ctx.rect(L,TOP,R-L,BOT-TOP);ctx.clip();ctx.translate(W.x,W.y);ctx.rotate(W.a);
  ctx.fillStyle=`rgba(229,72,77,${(.07+.18*W.fill).toFixed(3)})`;ctx.fillRect(0,-hw,len,hw*2);ctx.fillStyle=`rgba(229,72,77,${(.14*W.fill).toFixed(3)})`;ctx.fillRect(0,-hw*.4,len*W.fill,hw*.8);
  ctx.beginPath();ctx.rect(0,-hw,len,hw*2);sgEdge(2.2,fl,W.lock?null:[9,7]);
  const ax=Math.max(30,len-10);ctx.beginPath();ctx.moveTo(ax,0);ctx.lineTo(ax-18,-12);ctx.lineTo(ax-18,12);ctx.closePath();ctx.fillStyle=`rgba(229,72,77,${(.5+.4*W.fill).toFixed(3)})`;ctx.fill();ctx.restore()}
// the Sweep: the sector fills until .62; beyond it the nine thin rows where the shards will fly (each until its shard has left)
function sgDrawSweep(e,S,k,t){const x=e.x,y=e.y,a0=S.a-75*SGD,a1=S.a+75*SGD;
  if(k<.62){const f=clamp(k/.62,0,1);ctx.fillStyle=`rgba(229,72,77,${(.06+.22*f).toFixed(3)})`;ctx.beginPath();ctx.moveTo(x,y);ctx.arc(x,y,95*(.25+.75*f),a0,a1);ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.moveTo(x,y);ctx.arc(x,y,95,a0,a1);ctx.closePath();sgEdge(2.2,.6+.3*Math.sin(t*16),[8,6])}
  if(k<sgI('sweep','end')+.01){ctx.save();ctx.beginPath();ctx.rect(L,TOP,R-L,BOT-TOP);ctx.clip();const al=.45+.4*clamp((k-.2)/.35,0,1);
    for(let i=S.shot;i<9;i++){const a=S.A[i],ca=Math.cos(a),sa=Math.sin(a),by=-54*sa,s0=Math.max(0,-by+Math.sqrt(Math.max(0,by*by+95*95-54*54))),ox=S.ox,oy=S.oy+6;
      ctx.beginPath();ctx.moveTo(ox+ca*s0,oy+sa*s0);ctx.lineTo(ox+ca*(s0+300),oy+sa*(s0+300));sgEdge(1.5,al,[6,6])}ctx.restore()}}
// the Stomp: the circle under him fills until the blow (in the second phase it stays and fills again until .76); the light dashed ring
// where the wave arrives
function sgDrawStomp(e,k,t){const p2=!!e.p2,R0=p2?80:72,R1=p2?290:240,H=sgI('stomp','hit');let f;if(k<H[0])f=k/H[0];else if(p2&&k<H[1])f=(k-H[0])/(H[1]-H[0]);else return;
  ctx.fillStyle=`rgba(229,72,77,${(.08+.25*f).toFixed(3)})`;circ(e.x,e.y,R0*Math.max(.05,f));ctx.fill();circ(e.x,e.y,R0);sgEdge(2.4,.6+.3*Math.sin(t*18),[8,6]);
  if(k<H[0]){circ(e.x,e.y,R1);ctx.save();ctx.setLineDash([7,7]);ctx.strokeStyle='rgba(30,40,70,.42)';ctx.lineWidth=4;ctx.stroke();ctx.strokeStyle=`rgba(235,248,255,${(.75+.2*Math.sin(t*10)).toFixed(3)})`;ctx.lineWidth=2;ctx.stroke();ctx.restore()}}
// the Northern Crown's warning: six red rows 18 wide, and the arrows at 120 px that tell which way they will turn
function sgDrawCrownWarn(e,k,t){const W=sgI('crown','ring'),f=clamp((k-W[0])/(W[1]-W[0]),0,1),al=.55+.35*f;ctx.save();ctx.beginPath();ctx.rect(L,TOP,R-L,BOT-TOP);ctx.clip();
  for(let i=0;i<6;i++){const a=e.th0+i*Math.PI/3,len=sgRay(e.x,e.y,a);ctx.save();ctx.translate(e.x,e.y);ctx.rotate(a);ctx.fillStyle=`rgba(229,72,77,${(.06+.16*f).toFixed(3)})`;ctx.fillRect(24,-9,len-24,18);
    ctx.beginPath();ctx.rect(24,-9,len-24,18);sgEdge(1.8,al,[8,6]);
    // the arrow: across the row, toward the way it turns
    const d=e.cdir||1;ctx.translate(120,0);ctx.beginPath();ctx.moveTo(0,d*24);ctx.lineTo(-8,d*12);ctx.lineTo(8,d*12);ctx.closePath();ctx.fillStyle=`rgba(229,72,77,${(.6+.3*f).toFixed(3)})`;ctx.fill();
    ctx.strokeStyle='rgba(60,14,18,.5)';ctx.lineWidth=1.2;ctx.stroke();ctx.restore()}ctx.restore()}
// the rays: aurora light 18 wide with the white heart, stopped by walls and obstacles; they go out in 0.1 s
function sgDrawRays(B){const Rr=B.rays||B.rayEnd;if(!Rr)return;const k=B.rays?1:clamp(B.rayOut/.1,0,1);ctx.save();ctx.beginPath();ctx.rect(L,TOP,R-L,BOT-TOP);ctx.clip();
  for(const r of Rr.R){ctx.save();ctx.translate(Rr.x,Rr.y);ctx.rotate(r.a);ctx.fillStyle=sgAuroraFill(0,-9,0,9,k);ctx.fillRect(20,-9,r.len-20,18);
    ctx.strokeStyle=`rgba(20,30,60,${(.35*k).toFixed(3)})`;ctx.lineWidth=1.4;ctx.strokeRect(20,-9,r.len-20,18);ctx.fillStyle=`rgba(255,255,255,${(.85*k).toFixed(3)})`;ctx.fillRect(20,-1.3,r.len-20,2.6);
    if(!LOWFX){ctx.globalCompositeOperation='lighter';ctx.fillStyle=`rgba(140,255,215,${(.14*k).toFixed(3)})`;ctx.fillRect(20,-16,r.len-20,32);glow('150,240,255',r.len,0,22,.5*k)}ctx.restore()}ctx.restore()}
// the path of a wavy band from s=a to s=b (x for a row, y for a column), its two edges hw from the middle line
function sgWavePath(c,a,b,hw){ctx.beginPath();for(let s=a;;s+=10){const q=Math.min(s,b),m=sgWave(c,q);if(c.h)ctx.lineTo(q,m-hw);else ctx.lineTo(m-hw,q);if(q>=b)break}
  for(let s=b;;s-=10){const q=Math.max(s,a),m=sgWave(c,q);if(c.h)ctx.lineTo(q,m+hw);else ctx.lineTo(m+hw,q);if(q<=a)break}ctx.closePath()}
function sgCurtSegs(c){const a=c.h?L:TOP,b=c.h?R:BOT,f0=c.fold-32,f1=c.fold+32,S=[];if(f0>a)S.push([a,Math.min(b,f0)]);if(f1<b)S.push([Math.max(a,f1),b]);return S}
// a curtain on the floor: the wavy band with its red filling up until the fall and its fold (two white notches); then the light lies on it
function sgCurtGround(c,t){const S=sgCurtSegs(c);
  if(c.st!=='act'){const k=c.st==='warn'?1-c.warn/c.warn0:1;ctx.fillStyle=`rgba(229,72,77,${(.06+.2*k).toFixed(3)})`;for(const[a,b]of S){sgWavePath(c,a,b,32);ctx.fill()}
    for(const[a,b]of S){sgWavePath(c,a,b,32);sgEdge(2,.55+.3*k+(k>.8?.1*Math.sin(t*26):0),[8,6])}
    ctx.save();ctx.strokeStyle='rgba(255,255,255,.95)';ctx.lineWidth=3.4;ctx.lineCap='round';for(const s of[c.fold-32,c.fold+32]){const m=sgWave(c,s);ctx.beginPath();if(c.h){ctx.moveTo(s,m-30);ctx.lineTo(s,m+30)}else{ctx.moveTo(m-30,s);ctx.lineTo(m+30,s)}
      ctx.strokeStyle='rgba(30,40,70,.35)';ctx.lineWidth=5.6;ctx.stroke();ctx.strokeStyle='rgba(255,255,255,.95)';ctx.lineWidth=3;ctx.stroke()}ctx.restore()}
  if(c.st==='fall'||c.st==='act'){const I=c.st==='fall'?clamp(c.fall/.1,0,1):clamp((.5-c.act)/.15,0,1);
    for(const[a,b]of S){sgWavePath(c,a,b,32);ctx.fillStyle=c.h?sgAuroraFill(0,c.pos-48,0,c.pos+48,I):sgAuroraFill(c.pos-48,0,c.pos+48,0,I);ctx.fill();ctx.strokeStyle=`rgba(20,30,60,${(.35*I).toFixed(3)})`;ctx.lineWidth=1.4;ctx.stroke()}
    for(const[a,b]of S){ctx.beginPath();for(let s=a;;s+=10){const q=Math.min(s,b),m=sgWave(c,q);if(c.h)ctx.lineTo(q,m);else ctx.lineTo(m,q);if(q>=b)break}
      ctx.strokeStyle=`rgba(255,255,255,${(.8*I).toFixed(3)})`;ctx.lineWidth=2.4;ctx.stroke();if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(140,255,215,${(.12*I).toFixed(3)})`;ctx.lineWidth=40;ctx.stroke();ctx.restore()}}}}
// a curtain in the sky: the drape of aurora sways over its band (only decoration, at most .45), comes down on it in 0.1 s and fades
function sgCurtAir(c,t){const k=c.st==='warn'?1-c.warn/c.warn0:1,fall=c.st==='warn'?0:c.st==='fall'?clamp(c.fall/.1,0,1):1,al=c.st==='act'?.45*Math.max(0,1-c.act/.3):.16+.29*k;if(al<=.01)return;
  const S=sgCurtSegs(c),drop=(1-fall)*(80-26*k)+Math.sin(t*1.6+c.ph)*4,H=96;ctx.save();
  for(const[a,b]of S){ctx.beginPath();
    if(c.h){for(let s=a;;s+=12){const q=Math.min(s,b),m=sgWave(c,q)+32-64*(1-fall)-drop+Math.sin(t*2.2+q*.03)*3;ctx.lineTo(q,m);if(q>=b)break}
      for(let s=b;;s-=12){const q=Math.max(s,a),m=sgWave(c,q)+32-64*(1-fall)-drop-H;ctx.lineTo(q,m);if(q<=a)break}ctx.closePath();
      const yb=c.pos+32-64*(1-fall)-drop,g=ctx.createLinearGradient(0,yb-H,0,yb);g.addColorStop(0,'rgba(180,140,255,0)');g.addColorStop(.55,`rgba(111,216,255,${(al*.6).toFixed(3)})`);g.addColorStop(1,`rgba(125,255,208,${al.toFixed(3)})`);ctx.fillStyle=g}
    else{const sh=drop;for(let s=a;;s+=12){const q=Math.min(s,b),m=sgWave(c,q);ctx.lineTo(m-26,q-sh);if(q>=b)break}for(let s=b;;s-=12){const q=Math.max(s,a),m=sgWave(c,q);ctx.lineTo(m+26,q-sh);if(q<=a)break}ctx.closePath();
      const g=ctx.createLinearGradient(c.pos-30,0,c.pos+30,0);g.addColorStop(0,'rgba(125,255,208,0)');g.addColorStop(.5,`rgba(111,216,255,${al.toFixed(3)})`);g.addColorStop(1,'rgba(180,140,255,0)');ctx.fillStyle=g}
    ctx.fill()}
  ctx.restore()}
// a hoof print (cloven: two little ovals) along a lane: red while the warning counts, lit when its turn has come
function sgHoofMark(x,y,a,on,t){ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.fillStyle=on?`rgba(255,${200+40*Math.sin(t*20)|0},205,.92)`:'rgba(229,72,77,.5)';
  for(const s of[-1,1]){ctx.beginPath();ctx.ellipse(1.5,s*3.3,5.6,2.6,s*.2,0,TAU);ctx.fill()}ctx.strokeStyle=on?'rgba(60,14,18,.6)':'rgba(60,14,18,.3)';ctx.lineWidth=1;for(const s of[-1,1]){ctx.beginPath();ctx.ellipse(1.5,s*3.3,5.6,2.6,s*.2,0,TAU);ctx.stroke()}ctx.restore()}
// a lane of the herd: the dashed red band, the prints lighting up one after the other from the spirit's end; the trail of the spirit
function sgLaneGround(l,t){if(l.st==='fade')return;const kw=l.st==='form'?Math.min(1,l.t/l.go):1,hw=24,rc=l.h?[L,l.pos-hw,R-L,hw*2]:[l.pos-hw,TOP,hw*2,BOT-TOP];
  ctx.fillStyle=`rgba(229,72,77,${(.05+.17*kw).toFixed(3)})`;ctx.fillRect(rc[0],rc[1],rc[2],rc[3]);ctx.beginPath();ctx.rect(rc[0],rc[1],rc[2],rc[3]);sgEdge(2,.5+.35*kw+(kw>.85?.1*Math.sin(t*26):0),[8,6]);
  const a0=l.h?L:TOP,a1=l.h?R:BOT,n=Math.floor((a1-a0)/46),lit=Math.floor(n*kw),ang=l.h?(l.dir>0?0:Math.PI):(l.dir>0?Math.PI/2:-Math.PI/2);
  for(let i=0;i<n;i++){const s=l.dir>0?a0+23+i*46:a1-23-i*46,o=i%2?5:-5;sgHoofMark(l.h?s:l.pos+o,l.h?l.pos+o:s,ang,i<lit,t)}
  if(l.st==='run'){const x=l.h?l.s:l.pos,y=l.h?l.pos:l.s,bx=l.h?x-l.dir*110:x,by=l.h?y:y-l.dir*110,g=ctx.createLinearGradient(bx,by,x,y);g.addColorStop(0,'rgba(125,255,208,0)');g.addColorStop(1,'rgba(150,240,255,.45)');
    ctx.fillStyle=g;if(l.h)ctx.fillRect(Math.min(x,bx),y-12,110,24);else ctx.fillRect(x-12,Math.min(y,by),24,110)}}
// the prints of light the spirits leave: they go out in 2 s
function sgDrawPrints(B,t){if(!B.prints.length)return;ctx.save();if(!LOWFX)ctx.globalCompositeOperation='lighter';
  for(const q of B.prints){const k=1-q.t/2;ctx.save();ctx.translate(q.x,q.y);ctx.rotate(q.a);ctx.fillStyle=q.p2?`rgba(200,170,255,${(.6*k).toFixed(3)})`:`rgba(140,255,215,${(.6*k).toFixed(3)})`;
    for(const s of[-1,1]){ctx.beginPath();ctx.ellipse(1,s*2.4,4,1.9,s*.2,0,TAU);ctx.fill()}ctx.restore()}ctx.restore()}
// the entrance: three ribbons of aurora come down from over the back wall onto the circle of runes (0-0.7 s), lie on it as a veil
// (0.7-1.2 s) and fade while he takes his colour (1.2-2.1 s)
const SGV=[['125,255,208',-40],['111,216,255',0],['180,140,255',40]];
function sgVeilGround(e){const T=e.iT||0,c=G.runeAt||{x:e.x,y:e.y};if(T<.55||T>2.1)return;const k=T<.7?(T-.55)/.15:T<1.2?1:1-(T-1.2)/.9,t=G.t||0;
  ctx.save();const g=ctx.createRadialGradient(c.x,c.y,8,c.x,c.y,104);g.addColorStop(0,`rgba(150,240,255,${(.42*k).toFixed(3)})`);g.addColorStop(.6,`rgba(125,255,208,${(.3*k).toFixed(3)})`);g.addColorStop(1,'rgba(180,140,255,0)');
  ctx.fillStyle=g;ell(c.x,c.y,104,64);ctx.fill();if(!LOWFX){ctx.globalCompositeOperation='lighter';for(let i=0;i<3;i++){ctx.strokeStyle=`rgba(${SGV[i][0]},${(.3*k).toFixed(3)})`;ctx.lineWidth=3;ell(c.x,c.y,70+i*14+Math.sin(t*2+i)*3,(70+i*14)*.6);ctx.stroke()}}ctx.restore()}
function sgVeilAir(e){const T=e.iT||0,c=G.runeAt||{x:e.x,y:e.y};if(T>1.2)return;const u=clamp(T/.7,0,1),fade=T<.7?1:1-(T-.7)/.5,t=G.t||0,top=TOP-160,bot=top+(c.y-top)*(.15+.85*u*u*(3-2*u));
  ctx.save();for(const[rgb,dx]of SGV){const x=c.x+dx*(1-.4*u)+Math.sin(t*2+dx)*6,g=ctx.createLinearGradient(0,top,0,bot);g.addColorStop(0,`rgba(${rgb},0)`);g.addColorStop(.7,`rgba(${rgb},${(.35*fade).toFixed(3)})`);g.addColorStop(1,`rgba(${rgb},${(.5*fade).toFixed(3)})`);
    ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x-12,top);ctx.quadraticCurveTo(x-24+Math.sin(t*3+dx)*8,(top+bot)/2,x-14,bot);ctx.lineTo(x+14,bot);ctx.quadraticCurveTo(x+24+Math.sin(t*3+dx)*8,(top+bot)/2,x+12,top);ctx.closePath();ctx.fill();
    ctx.fillStyle=`rgba(255,255,255,${(.5*fade).toFixed(3)})`;ctx.fillRect(x-1,bot-(bot-top)*.5,2,(bot-top)*.5)}ctx.restore()}
// the rage: a column of aurora comes down from the sky on him (.32-.50), at most .5
function sgDrawColumn(e,k,t){const Cl=sgI('rage','column');if(k<Cl[0]||k>Cl[1]+.06)return;const u=(k-Cl[0])/(Cl[1]-Cl[0]),al=.5*clamp(u/.25,0,1)*(k>Cl[1]?1-(k-Cl[1])/.06:1);if(al<=0)return;const top=TOP-260,bot=top+(e.y+8-top)*clamp(u/.45,0,1),x=e.x,w=30;
  ctx.save();const g=ctx.createLinearGradient(0,top,0,bot);g.addColorStop(0,'rgba(125,255,208,0)');g.addColorStop(.35,`rgba(125,255,208,${(al*.8).toFixed(3)})`);g.addColorStop(.75,`rgba(111,216,255,${al.toFixed(3)})`);g.addColorStop(1,`rgba(180,140,255,${al.toFixed(3)})`);
  ctx.fillStyle=g;ctx.fillRect(x-w,top,w*2,bot-top);ctx.fillStyle=`rgba(255,255,255,${(al*.9).toFixed(3)})`;ctx.fillRect(x-1.5,top,3,bot-top);
  if(!LOWFX){ctx.globalCompositeOperation='lighter';glow('170,150,255',x,bot-30,70,al*.8);for(let i=0;i<5;i++){const yy=top+((t*160+i*97)%(bot-top+1));ctx.fillStyle=`rgba(230,250,255,${(al*.8).toFixed(3)})`;circ(x+Math.sin(t*5+i*2)*18,yy,1.8);ctx.fill()}}ctx.restore()}
// the second phase: a faint ribbon of aurora (.3) sways over the back wall for the rest of the fight
function sgDrawRibbon(k,t){const y0=TOP-46;ctx.save();ctx.beginPath();for(let x=L-10;x<=R+10;x+=14)ctx.lineTo(x,y0+Math.sin(x/70+t*.7)*9-13);for(let x=R+10;x>=L-10;x-=14)ctx.lineTo(x,y0+Math.sin(x/70+t*.7+.6)*9+13);ctx.closePath();
  const g=ctx.createLinearGradient(L,0,R,0);g.addColorStop(0,`rgba(125,255,208,${(.3*k).toFixed(3)})`);g.addColorStop(.5,`rgba(111,216,255,${(.3*k).toFixed(3)})`);g.addColorStop(1,`rgba(180,140,255,${(.3*k).toFixed(3)})`);ctx.fillStyle=g;ctx.fill();
  if(!LOWFX){ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(200,255,240,${(.12*k).toFixed(3)})`;ctx.lineWidth=2;ctx.stroke()}ctx.restore()}
// a spike of ice of the Stomp's wave (the model's own if it has one): rises, stands, breaks into frost in 0.25 s
function sgDrawSpike(s){const k=Math.min(.999,s.t/.25),F=sga('Spike');if(F){try{F(s.x,s.y,18,k,1,{a:s.a,p2:s.p2});return}catch(err){}}
  const up=clamp(k/.15,0,1),br=clamp((k-.75)/.25,0,1),h=18*up*(1-br*.5);if(h<1)return;ctx.save();ctx.globalAlpha*=1-br;ctx.translate(s.x,s.y);ctx.rotate(Math.cos(s.a)*.25);ink(1.4);
  ctx.beginPath();ctx.moveTo(-5,0);ctx.lineTo(0,-h);ctx.lineTo(5,0);ctx.closePath();fs(s.p2?'#cdb8ff':'#a2eaf6');ctx.restore()}
function sgGround(){const B=G.s2;if(!B)return;const t=G.t||0,e=sgBoss();
  if(e&&e.intro>0)sgVeilGround(e);
  sgDrawPrints(B,t);
  for(const c of B.curt)sgCurtGround(c,t);
  for(const l of B.lanes)sgLaneGround(l,t);
  if(e&&!(e.intro>0)){const k=sgK(e);if(B.band)sgDrawBand(B.band,t);if(e.st==='sweep'&&e.sw)sgDrawSweep(e,e.sw,k,t);if(e.st==='stomp')sgDrawStomp(e,k,t);if(e.st==='crown'&&e.th0!=null){const W=sgI('crown','ring');if(k>=W[0]&&k<W[1])sgDrawCrownWarn(e,k,t)}}
  sgDrawRays(B)}
function sgAir(){const B=G.s2;if(!B)return;const t=G.t||0,e=sgBoss();
  if(e&&e.intro>0)sgVeilAir(e);
  for(const c of B.curt)sgCurtAir(c,t);
  for(const s of B.spikes)sgDrawSpike(s);
  if(e&&e.st==='rage')sgDrawColumn(e,sgK(e),t);
  if(B.p2k>0)sgDrawRibbon(B.p2k,t)}
{const _g2=drawHazards2Ground;drawHazards2Ground=function(){_g2.apply(this,arguments);try{if(SGON)sgGround()}catch(err){}}}
{const _a2=drawHazards2Air;drawHazards2Air=function(){_a2.apply(this,arguments);try{if(SGON)sgAir()}catch(err){}}}
// ---- the spirits of the herd and the crown left after the defeat stand among the others in the room (by their feet): they ride in the
// list of the corpses only while the room is drawn (the corpses' clock and the end of the room never see them, as 77-morti-nemici.js)
function sgExtras(B){const out=[];for(const l of B.lanes)if(l.k>0)out.push({sgSp:l,x:l.h?l.s:l.pos,y:l.h?l.pos:l.s});if(B.relic)out.push({sgRelic:B.relic,x:B.relic.x,y:B.relic.y});return out}
if(SGON){const _r=render;render=function(){const B=G&&G.s2;if(!B||!B.lanes.length&&!B.relic)return _r.apply(this,arguments);const keep=G.corpses,add=sgExtras(B);if(!add.length)return _r.apply(this,arguments);
  G.corpses=(keep||[]).concat(add);try{return _r.apply(this,arguments)}finally{G.corpses=keep}}
  const _dc=drawCorpse;drawCorpse=function(c){if(c&&c.sgSp){try{sgDrawSpirit(c.sgSp,c.x,c.y)}catch(err){}return}if(c&&c.sgRelic){try{sgDrawRelic(c.sgRelic)}catch(err){}return}return _dc.apply(this,arguments)}}
// the spirit: drawn once a frame for each way it runs (galloping, or still while it takes shape: o.k) on a layer, then laid down for each
// spirit; the layers go when the herd is over
const SGL={};
function sgSpiritModel(face,p,p2,k){const F=sga('Spirit');if(F){F(0,0,face,p,.62,{k,p2});return}N3.stag2(0,0,face,'charge',p,.62,{ghost:1,p2,noFx:true})}
function sgLayer(key,face,p,p2,k){const m=ctx.getTransform(),dp=Math.hypot(m.a,m.b)||1,W=Math.ceil(170*dp),H=Math.ceil(150*dp);let I=SGL[key];if(!I)I=SGL[key]={c:document.createElement('canvas'),ft:-1,dp:0};
  if(I.ft===(G.t||0)&&I.dp===dp)return I;const c=I.c;if(c.width!==W||c.height!==H){c.width=W;c.height=H}const g=c.getContext('2d'),sv=ctx;
  g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.clearRect(0,0,W,H);g.setTransform(dp,0,0,dp,W/2,H*.78);ctx=g;
  try{sgSpiritModel(face,p,p2,k)}catch(err){}finally{ctx=sv}I.ft=G.t||0;I.dp=dp;I.W=W;I.H=H;return I}
function sgDrawSpirit(l,x,y){const run=l.st!=='form',face=l.h?(l.dir>0?0:Math.PI):(l.dir>0?Math.PI/2:-Math.PI/2),p=run?((G.t||0)*4.8)%1:0,
  I=sgLayer((l.h?'h':'v')+l.dir+(run?'r':'w')+(l.p2?'2':''),face,p,l.p2,run?1:clamp(l.k,0,1)),k=l.st==='fade'?clamp(l.k,0,1):1;if(k<=0||!run&&l.k<=0)return;
  // its light on the floor
  ctx.save();ctx.fillStyle=`rgba(140,240,230,${(.22*k*(run?1:clamp(l.k,0,1))).toFixed(3)})`;ell(x,y+2,26,9);ctx.fill();ctx.restore();
  const m=ctx.getTransform(),sx=m.a*x+m.c*y+m.e,sy=m.b*x+m.d*y+m.f;ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha*=k;ctx.drawImage(I.c,sx-I.W/2,sy-I.H*.78);ctx.restore()}
// the crown standing on the mound of moss with its flowers: the model's last frame of the defeat, until you leave the room
function sgDrawRelic(R){const M=N3.meta.stag;N3.stag(R.x,R.y+8,R.face,'die',.999,(M&&M.sc)||1,{p2:R.p2,noFx:LOWFX})}
{const _tc=tickCorpses;tickCorpses=function(dt){const before=SGON&&G&&G.corpses?G.corpses.filter(c=>c.type==='stag'):null;_tc.apply(this,arguments);
  try{if(before&&before.length&&G.s2)for(const c of before)if(!(G.corpses||[]).includes(c))G.s2.relic={x:c.x,y:c.y,p2:!!c.p2,face:c.face}}catch(err){}}}
// the shards of the crown: the model's own drawing, violet in the second phase; they ring like crystal when they fly
if(SGON){const _cr=EPDRAW.crystal;EPDRAW.crystal=p=>{const A=sga('Shard');if(A){try{A(p.x,p.y,0,p.a,(p.r||6)/6,{p2:!!p.sp2});return}catch(err){}}_cr(p)};
  const _s=sfx;sfx=function(k,arg,x){if(k==='eshot'&&arg==='crystal')return _s.call(this,k,'ice',x);return _s.apply(this,arguments)}}
// ---- the arena reacts to the new blows (87-boss3-arena.js keeps sstride, swall, scrystals, saurora, sstomp, phase2)
const SGFX={
  // the Sweep: a crescent of frost in front of him, on the edge of the sector
  ssweep(e,x,y,a){for(let i=-2;i<=2;i++){const an=(a||0)+i*30*SGD;ENV2.mark('frost',x+Math.cos(an)*92,y+Math.sin(an)*92,12)}ENV2.rocks(x,y,140,.5)},
  // a spirit has run its lane: prints of frost every 40 px, the obstacles it ran through sparkle
  sherd(e,x,y,l){if(!l)return;const a0=l.h?L:TOP,a1=l.h?R:BOT;for(let s=a0+20;s<a1;s+=40){const px=l.h?s:l.pos,py=l.h?l.pos:s;ENV2.mark('frost',px,py,7)}
    for(const k of G.rocks){const kd=l.h?k.y:k.x;if(Math.abs(kd-l.pos)<k.r+24&&!(k._sgT>(G.t||0)-.4)){k._sgT=G.t||0;k.hit=Math.max(k.hit||0,.18);if(!LOWFX)for(let j=0;j<3;j++)fxPush({k:'spark',x:k.x+rand(-k.r,k.r)*.6,y:k.y-kH(k)*rand(.2,.9),t:.3})}}},
  // the Northern Crown goes out: lines of frost along the six rays (every 50 px)
  scrown(e,x,y,Rr){if(!Rr||!Rr.R)return;for(const r of Rr.R)for(let s=50;s<r.len;s+=50)ENV2.mark('frost',Rr.x+Math.cos(r.a)*s,Rr.y+Math.sin(r.a)*s,9);b3torch('aurora',1.6)},
  // a curtain has fallen: a line of frost along its real wavy line (every 70 px)
  scurtain(e,x,y,c){const a0=c.h?L:TOP,a1=c.h?R:BOT;for(let s=a0+20;s<a1;s+=70){if(Math.abs(s-c.fold)<32)continue;const m=sgWave(c,s);if(c.h)ENV2.mark('frost',s,m,14);else ENV2.mark('frost',m,s,14)}},
  // the defeat: the frost round the body melts into moss and flowers
  sdie(e,x,y){for(let i=0;i<5;i++){const a=i/5*TAU+rand(-.3,.3),r=i?rand(30,70):0;ENV2.mark('bloom',x+Math.cos(a)*r,y+Math.sin(a)*r*.6,i?16:24)}ENV2.wiltGrass(x,y,10)}};
{const _f=b3fx;b3fx=function(e,what,x,y,r){if(!SGON||!SGFX[what]||what==='scurtain'&&!(r&&r.sg))return _f.apply(this,arguments);if(!BOSS2||!G||!G.rocks)return;try{SGFX[what](e,x,y,r)}catch(err){}}}
// ---- the entrance (3.4 s, the model's 'enter'): the veil of aurora comes down on the circle of runes, his shape of light takes colour from
// the hooves up, two heavy steps, the eyes open, the crown lights up a tip at a time (a bell for each), the bellow
if(SGON)B3IN.stag=(e,t,t0,at,roar)=>{e.em=t<3?.999:1;e.z=0;e.face=sgFace(Math.atan2(P.y-e.y,P.x-e.x));
  if(t0===0){if(!G.s2)sgReset();if(G.runeAt){e.x=G.runeAt.x;e.y=G.runeAt.y}G.s2.veil=1;sfx('shimmer',1,e.x);sgBell(e,62,3.5,.03)}
  for(const s of sgI('enter','steps').map(c=>c*BOSS_INTRO.stag))if(at(s)){shake(4);for(const sd of[-1,1]){const q=b3pt(e,19,sd*11,e.face);if(BOSS2)ENV2.mark('frost',q.x,q.y,9);sgSnowPuff(q.x,q.y,3,50)}if(BOSS2)ENV2.fall(B3N(3),true);
    if(AU.ctx&&AU.on.sfx&&AU.ctx.state==='running'){fThump(AU.ctx.currentTime+.01,62,34,.3,.3);AU.pan=0}}
  if(at(sgI('enter','eyes')*BOSS_INTRO.stag))sfx('shimmer',0,e.x);
  SGC.bells.forEach((m,i)=>{if(at((sgI('enterNotch')[i]||.72+.025*i)*BOSS_INTRO.stag))sgBell(e,m,1.6,.035)});
  if(at(sgI('enter','roar')*BOSS_INTRO.stag)){roar();for(let i=0;i<2;i++)fxPush({k:'ring2',x:e.x,y:e.y,rgb:'235,248,255',r0:e.r,r1:e.r*(3.6+i*2.2),t:.5+i*.1,max:.5+i*.1,w:7-i*2});sgSnowPuff(e.x,e.y,12,150)}};
// ---- the defeat (4.2 s, the model's 'die'; the bar and «sconfitto» at the soft flash of the crown, 2.2 s): the tips go out with a tinkle,
// he bows, the flash, the antlers come off, he turns into aurora that rises, the flowers grow; the snow stops
if(SGON)B3DIE.stag={setup(c){sgClear();sgSnow(false);c.p2=!!(c.e&&c.e.p2)},
  tick(c,dt,D,p){const f=!LOWFX;
    if(p<.14&&Math.random()<(f?.4:.15))cpart(c,{k:'spark',x:c.x+rand(-44,44),y:c.y-rand(80,130),vz:rand(10,30),life:.5,r:1.6,col:'160,255,220'});
    if(p>.2&&!c.t1){c.t1=1;sfx('icicles',.4,c.x)}
    const Dm=sgI('die');if(p>(Dm.clou||.52)&&!c.fl){c.fl=1;fxPush({k:'ring2',x:c.x,y:c.y-6,rgb:'230,255,245',r0:20,r1:120,t:.55,max:.55,w:5});if(f)fxPush({k:'flash',x:c.x,y:c.y-30,r:80,rgb:'225,255,245',t:.35,max:.35});sfx('shimmer',1,c.x)}
    if(p>(Dm.horns||[.56])[0]&&!c.an){c.an=1;sfx('icicles',.8,c.x);for(let i=0;i<(f?10:4);i++)cpart(c,{k:'puff',x:c.x+rand(-30,30),y:c.y+rand(-6,6),z:rand(0,20),vx:rand(-30,30),vz:rand(10,40),life:rand(.5,.9),r:rand(3,5),col:'235,245,255'})}
    if(p>(Dm.light||[.62,.92])[0]&&p<(Dm.light||[.62,.92])[1]&&Math.random()<(f?.8:.3))cpart(c,{k:'spark',x:c.x+rand(-34,34),y:c.y-rand(0,60),vx:rand(-8,8),vz:rand(40,90),g:-20,life:rand(.8,1.4),r:2.2,col:Math.random()<.5?'125,255,208':'180,140,255'});
    if(p>.7&&!c.sh){c.sh=1;sfx('shimmer',2,c.x)}
    if(p>(Dm.flowers||.84)&&!c.bl){c.bl=1;b3fx(null,'sdie',c.x,c.y)}}};
// ---- the voice: a great northern stag (the wapiti). Lower than today's (×0.9) for the bigger body; the cry of the entrance and the rage
// are the wapiti's bugle: low and hoarse, then a long crystal whistle, then three grunts; «hmpf» with a tinkle before the Sweep, the full
// bugle with the far thunder of the hooves for the herd, a call rising slowly with the bells for the Crown, an annoyed snort when the
// antlers are stuck. The mocking stays the two snorts with the «hmm»
if(SGON){const V=B3VO.VB.stag,bug=(d,lo,hi,gr,pk)=>[d,[{t:0,d:.5,f:lo,v:['o','a'],h:.1,ro:.62,rel:.25},{t:.42,d:hi[3],f:hi.slice(0,3),v:'B',tn:1,br:.2,vib:[.025,5.5],att:.18,rel:.3,a:.85},
    ...gr.map((t0,i)=>({t:t0,d:.12,f:[90-i*3,75-i*3],v:'u',ro:.7,a:.85-i*.1,h:.2}))],pk];
  V.base={br:.35,ro:.3,ji:.06};
  Object.assign(V.k,{
    cry:[bug(2.1,[72,95,170],[560,720,650,1.05],[1.48,1.67,1.86],.34)],
    angry:[[2,[{t:0,d:.55,f:[66,80,150],v:['o','a'],h:.08,ro:.8,ji:.15},{t:.48,d:1,f:[500,680,600],v:'B',tn:1,br:.25,vib:[.03,6.5],am:[.12,22],att:.15,rel:.3,a:.9},{t:1.5,d:.42,f:[95,70],v:['a','o'],ro:.8,rel:.4}],.34]],
    laugh:[[.72,[{t:0,d:.1,noise:1,v:'n'},{t:.17,d:.1,noise:1,v:'n',a:.9},{t:.36,d:.32,f:[104,90],v:'m',a:.75,h:.3}],.5]],
    laugh2:[[.8,[{t:0,d:.12,noise:1,v:'n'},{t:.2,d:.55,f:[90,117,95],v:['u','o'],a:.8,h:.15}],.5]],
    hurt:[[.25,[{t:0,d:.23,f:[122,86],v:['u','o'],ro:.45,h:.15}],.48]],
    c_charge:[[.56,[{t:0,d:.1,noise:1,v:'n'},{t:.14,d:.4,f:[86,95],v:'o',a:.9,ro:.9}],.48]],
    c_crystals:[[.2,[{t:0,d:.18,f:[135,117],v:'a',h:.35}],.42]],
    c_aurora:[[.85,[{t:0,d:.8,f:[99,122,104],v:['u','o'],a:.9,h:.1,ro:0,br:.5,vib:[.02,5]}],.45]],
    c_stomp:[[.2,[{t:0,d:.18,f:[117,90],v:['u','a'],h:.3,ro:.3}],.45]],
    c_sweep:[[.3,[{t:0,d:.09,noise:1,v:'n',a:.9},{t:.08,d:.18,f:[100,86],v:'m',a:.8,h:.25,ro:.3}],.44]],
    c_call:[bug(2.25,[68,90,160],[600,780,700,1.15],[1.66,1.86,2.06],.33)],
    c_crown:[[1.3,[{t:0,d:1.25,f:[70,100,150],v:['u','o','a'],h:.1,ro:.25,br:.45,vib:[.02,5],att:.3,rel:.35}],.5]],
    c_stuck:[[.4,[{t:0,d:.13,noise:1,v:'n',a:1},{t:.12,d:.24,f:[95,80],v:['m','u'],ro:.5,a:.85,h:.2}],.46]],
    die:[[1.9,[{t:0,d:1.85,f:[108,95,50],v:['o','u'],ro:.3,vib:[.04,4],rel:.6,br:.45}],.55]],
    win:[[1,[{t:0,d:.95,f:[86,135,99],v:['o','a'],ro:.35,h:.08}],.56]]});
  B3CUE.stag={charge:'c_charge',prep2:'c_charge',sweep:'c_sweep',aurora:'c_aurora',stomp:'c_stomp',call:'c_call',crown:'c_crown',stuck:'c_stuck'};
  // never a moan while the antlers are stuck: there he snorts (c_stuck)
  {const _s=b3say;b3say=function(e,k,force){if(e&&e.type==='stag'&&k==='hurt'&&e.st==='stuck')return _s.call(this,e,'c_stuck',force);return _s.apply(this,arguments)}}
  // under the bugles the bells of the crown and a low rumble; the thunder of the hooves under the herd's call, the bells of the Crown, the
  // tinkle of the Sweep, the crack of the stuck antlers (the bells of the old cries stay for c_aurora and win, the thumps for the snorts)
  {const _m=b3sayMore;b3sayMore=function(e,k,t){if(e.type!=='stag')return _m.apply(this,arguments);const v=Math.max(.55,enemyAt(e));
    try{if(k==='cry'||k==='angry'){vBell(null,t+.55,86,2.2,.03*v);vBell(null,t+.7,93,2,.022*v);fNoise(t+.05,1.4,'lowpass',VR(220,.1),.7,.06*v,{brown:true,att:.2})}
      else if(k==='c_call'){fNoise(t+.15,1.8,'lowpass',150,.7,.08*v,{brown:true,att:.4});for(let i=0;i<12;i++)fThump(t+.25+i*.12+Math.random()*.03,VR(70,.12),40,.06,.07*v*(1-i/16))}
      else if(k==='c_crown')[74,78,81,86].forEach((m,i)=>vBell(null,t+.15+i*.22,m,1.6,.026*v));
      else if(k==='c_sweep'){M.glass(t+.12,.6*v,VR(2900,.05));M.glass(t+.2,.4*v,VR(3500,.05))}
      else if(k==='c_stuck')M.ice(t+.02,.5*v);
      else _m.apply(this,arguments)}catch(err){}AU.pan=0}}}
// ---- for the previews (anteprime/mk_boss2.py) and the tests (tests/boss2gioco.js): how to get into its room, its moves in each phase,
// the dangers it puts in the room (counted by the tests), the clips of its voice
if(SGON){const R=window.BCL||(window.BCL={});R.stag={n:"Il Cervo d'Aurora",arena:11,p2:true,
  enter(){G.arena=11;G.chapter=ARENAS[11].ch;G.diff=ARENAS[11].diff;G.bossLvl=null;G.room=ROOMS;G.event=null;buildRoom()},
  moves:['prep','charge','stuck','sweep','aurora','stomp','call'],moves2:['rage','crown','recoil','prep2'],
  hz(){const B=G.s2||{},e=sgBoss(),k=e?sgK(e):0,st=e&&e.st;return{striscia:B.band?1:0,settore:st==='sweep'&&k<.62?1:0,righe:st==='sweep'&&e.sw&&k<.71?9-e.sw.shot:0,
    cerchio:st==='stomp'&&(k<.52||e.p2&&k<.76)?1:0,righe_corona:st==='crown'&&k>=.15&&k<.4?6:0,raggi:B.rays?B.rays.R.length:0,tende:(B.curt||[]).length,
    corsie:(B.lanes||[]).length,spiriti:(B.lanes||[]).filter(l=>l.st==='run').length,punte:(B.spikes||[]).length,onde:G.waves.length,impronte:(B.prints||[]).length,
    schegge:G.eproj.filter(q=>q.kind==='crystal').length,ghiaccio:G.eproj.filter(q=>q.kind==='ice').length}},
  voice:['cry','laugh','angry','die']}}
