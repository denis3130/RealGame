// =====================================================================
// IL MIMIC RIFATTO: «la cassa sbagliata», il Forziere Affamato (Denis, 15 ottobre: «rivisita tutti i boss … possenti, belli, fighi, che
// diano timore nello sfidarli», «migliora anche le loro abilità speciali»; 16 ottobre, dopo il Golem: «sì, fai gli altri 12»). ANTEPRIMA:
// questo file e il modello sprite/nemici3d/mimic2.js entrano solo nella copia del gioco fatta da anteprime/mk_boss2.py; nel gioco vero dopo
// il sì di Denis (il modello prende il posto di 'mimic' e questo file va in src/ordine.txt). Design e numeri: docs/boss-classici-design/mimic.md.
// Il vecchio forziere della cripta su lunghe zampe pallide: prima di ogni colpo il tesoro si sveglia (tin-tin) e la sua luce corre
// nell'ottone fino alla parte che colpirà. Esce da una delle due casse gemelle (42), come prima. Ogni stato ha il nome di una mossa del
// modello; il colpo vero parte nel suo fotogramma (b3at, 81-boss3-base.js). Mosse:
// - Il Morso (chomp): una corsia rossa con tre impronte di denti; corre e morde tre volte. Un passo di lato, o un ostacolo in mezzo (lo
//   morde e resta l'impronta). Nella fase 2 due di fila.
// - La Frustata (tongue): una linea rossa dalla bocca; la lingua schiocca lungo il pavimento. Gli ostacoli la fermano. Nella fase 2 a tre.
// - L'Assaggio (grab, gulp): se gli stai addosso, un ventaglio rosso; se ti prende ti mastica (non ti vede nessuno) e ti risputa.
// - Sputo d'oro (coins): sette linee tratteggiate a ventaglio, le monete rimbalzano raso terra e poi restano a terra: si raccolgono (1 oro).
//   Nella fase 2 anche la pioggia: sei cerchi dove ricadono.
// - La Tagliola (leap, stuck): balzi a bocca aperta dove sei (un cerchio con otto dentini), l'ultimo resta incastrato: colpi +50%.
// - Il Gioco delle Casse (fase 2: hide, chest, pop, daze): torna cassa, cadono due finte, si scambiano; tocca quella vera.
// - Ha fame! (rage, a metà vita): la serratura era un occhio. Poi tutto 1,3 volte più svelto (il Gioco delle Casse e lo Stordito no).
// «Colpo in bocca!»: a bocca spalancata i colpi da davanti fanno +50% (da Incastrato e da Stordito da ogni lato).
// Esce anche nella prima arena: mai due attacchi insieme, ogni danno ha un avviso di almeno 0,8 s (0,6 s nella fase 2); gli avvisi tondi
// sono ellissi 1 : 0,6.
// =====================================================================
const MM2ON=typeof N3!=='undefined'&&!!N3.mimic2;
const MM2={seq1:['chomp','coins','tongue','leap'],seq2:['shell','chomp','coins','tongue3','leap'],red:'229,72,77',gold:'255,196,70',orange:'255,120,60',K:.6,
  // the «tin-tin» of the treasure waking up: when the model lights it (in the move)
  tin:{chomp:[.03,.10],tongue:[.03,.10],tongue3:[.03,.09],grab:[.03,.09],coins:[.03,.10]}};
if(MM2ON){
  // the new model in place of the old one (its drawing of today stays as N3.meta.mimic.old for the pages)
  const old=N3.mimic,oldM=N3.meta.mimic;N3.mimic=N3.mimic2;N3.meta.mimic=Object.assign({},N3.meta.mimic2,{old:old&&oldM?(x,y,f,a,p)=>old(x,y,f,oldM.an.includes(a)?a:'idle',p,oldM.sc||1,{}):null});
  ET.mimic.r=30;ET.mimic.cdmg=20;BOSS_INTRO.mimic=2.8;Object.assign(BDEATH,{mimic:{dur:3.4,clou:2.2,snd:'coin'}});
  B3S.add('mimic');N3G.zm.mimic=1;
  // its own light: warm out of its mouth, wide when it opens wide, none when it hides (nothing gives the real chest away)
  ELIGHT.mimic=(e,Lt)=>{if(e.hidden||e.intro>0&&(e.iT||0)<1.7)return;const o=mmOpen(e),f=e.face||0;Lt(e.x+Math.cos(f)*30,e.y+Math.sin(f)*22,50+60*o,.35+.35*o)};
  // what the game passes to the model: the tips of the tongue (screen offsets from its drawing point), the last leap, the place's
  // material, and in the chest the eyes' flash, the slide and the breath
  N3G.opt.mimic=e=>({tip:e.tip||null,tips:e.tips||null,last:!!e.last,mat:mmMat(),real:e.real||0,slide:e.slide||0,breath:e.breath||0,torn:!!e.torn});
  // the closed chest is drawn once into an image (sprite/nemici3d/mimic2.js): make those images in the menu's free moments, not when the
  // twin chests fall (one of them costs about 20 ms the first time)
  if(typeof IDLE!=='undefined'&&typeof warmDraw==='function')for(const torn of[0,1])for(const mat of['moss','ash','mud','frost'])IDLE.add(()=>warmDraw(()=>{try{N3.mimicChest(48,80,0,Math.PI/2,1,{mat,torn})}catch(e){}}));
}
// ---- helpers
const mmD=(x,y,X,Y)=>Math.hypot(X-x,(Y-y)/MM2.K);                         // distances on the floor as they look (circles are ellipses)
const mmCan=()=>P.inv<=0&&P.dashT<=0;
const mmSp=e=>e.p2?1.3:1;
const mmMat=()=>{const t=G&&themeOf(G.room);return t&&isIce(t)?'frost':t&&isSwamp(t)?'mud':t==='cenere'||t==='forgia'||t==='magma'||t==='fabbro'?'ash':'moss'};
const mmBoss=()=>G&&G.enemies?G.enemies.find(q=>q.type==='mimic'&&!q.dead):null;
function mmReset(){if(G)G.m2={warn:[],lane:null,tl:null,fan:null,clines:null,coins:[],floor:[],rain:[],rainW:[],trap:null,drops:[],shell:null,gulp:null,planks:[],ask:null}}
{const _br=buildRoom;buildRoom=function(){mmReset();return _br.apply(this,arguments)}}
const mmB=()=>G.m2||(mmReset(),G.m2);
// how open its mouth is now (0..1): the light, and the «Colpo in bocca!»
function mmOpen(e){const k=b3k(e);switch(e.st){case 'chomp':return k<.72?1:.3;case 'tongue':return k<.85?1:.3;case 'tongue3':return k<.86?1:.3;case 'coins':return k>.45&&k<.7?1:.4;
  case 'rage':return k>.6?1:.3;case 'taunt':return k>.12&&k<.6?.7:.2;case 'daze':return .7;case 'stuck':return .8;case 'leap':return .9;case 'gulp':return k>.75?1:.1;default:return e.p2?.3:.1}}
function mmMouth(e){const k=b3k(e);if(e.st==='stuck'&&k<.8||e.st==='daze')return 2;
  if(e.st==='chomp'&&k<.45||e.st==='tongue'&&k<.5||e.st==='tongue3'&&k<.36||e.st==='coins'&&k<.5||e.st==='taunt'&&k>.12&&k<.6)return 1;return 0}
// how far from (x,y) along a before a wall or an obstacle
function mmReach(x,y,a,max){const ca=Math.cos(a),sa=Math.sin(a);let s=0;for(;s<max;s+=5){const px=x+ca*s,py=y+sa*s;if(px<L+6||px>R-6||py<TOP+6||py>BOT-6)break;if(G.rocks.some(k=>Math.hypot(k.x-px,k.y-py)<k.r))break}return s}
function mmSeg(x,y,a,len,px,py){const ca=Math.cos(a),sa=Math.sin(a),u=clamp((px-x)*ca+(py-y)*sa,0,len);return{d:Math.hypot(px-(x+ca*u),py-(y+sa*u)),u}}
// a free point on the floor (inside the room, away from the obstacles)
function mmFree(x,y,away){const ok=(tx,ty)=>tx>=L+24&&tx<=R-24&&ty>=TOP+30&&ty<=BOT-24&&!G.rocks.some(k=>Math.hypot(k.x-tx,k.y-ty)<k.r+away);
  if(ok(x,y))return{x,y};for(let i=0;i<30;i++){const a=i*2.39996,d=6+i*3,tx=clamp(x+Math.cos(a)*d,L+24,R-24),ty=clamp(y+Math.sin(a)*d,TOP+30,BOT-24);if(ok(tx,ty))return{x:tx,y:ty}}return{x:clamp(x,L+24,R-24),y:clamp(y,TOP+30,BOT-24)}}
// the screen offset of a floor point from the model's drawing point (the model draws the tongue exactly to it)
const mmTip=(e,x,y)=>[x-e.x,y-(e.y+8)];
// the two clinks of a coin (its «tin-tin», on the boss's time), a soft one, the clack of its lid
function mmTin(e,a,b){try{if(!AU.ctx||!AU.on.sfx||AU.ctx.state!=='running')return;const t=AU.ctx.currentTime+.01,v=Math.max(.45,enemyAt(e)),k=1/mmSp(e);AU.pan=Math.max(-.7,Math.min(.7,(e.x-(G.vx||0)-180)/200));
  vBell(null,t+a*k,VR(98,.01),.32,.05*v);if(b!=null)vBell(null,t+b*k,VR(101,.01),.36,.05*v);AU.pan=0}catch(err){}}
function mmClink(x,v){try{if(!AU.ctx||!AU.on.sfx||AU.ctx.state!=='running')return;const t=AU.ctx.currentTime+.01;vBell(null,t,VR(100,.03),.22,(v||.02))}catch(err){}}
function mmClack(x,v){try{if(!AU.ctx||!AU.on.sfx||AU.ctx.state!=='running')return;const t=AU.ctx.currentTime+.005;AU.pan=Math.max(-.7,Math.min(.7,(x-(G.vx||0)-180)/200));
  M.wood(t,v||1,VR(300,.06));fNoise(t,.05,'bandpass',VR(2600,.1),2,.08);fThump(t,120,60,.06,.12*(v||1));AU.pan=0}catch(err){}}
// the marks it leaves on the floor: the bite (a ring of little teeth), three scratches, gold dust
function mmMark(kind,x,y,r,a){const c=fx;if(!c)return;c.save();c.setTransform(2,0,0,2,0,0);
  if(kind==='bite'){c.strokeStyle='rgba(30,20,14,.55)';c.lineWidth=1.6;c.lineCap='round';for(let i=0;i<12;i++){const an=i/12*TAU,rr=r*(.85+.15*Math.sin(i*2.7)),px=x+Math.cos(an)*rr,py=y+Math.sin(an)*rr*.6;
      c.beginPath();c.moveTo(px,py);c.lineTo(px-Math.cos(an)*4,py-Math.sin(an)*2.4);c.stroke()}c.fillStyle='rgba(20,14,10,.18)';c.beginPath();c.ellipse(x,y,r*.8,r*.48,0,0,TAU);c.fill()}
  else if(kind==='scratch'){const ca=Math.cos(a||0),sa=Math.sin(a||0);c.strokeStyle='rgba(28,20,14,.5)';c.lineWidth=1.3;c.lineCap='round';
    for(const o of[-6,0,6]){const px=x-sa*o,py=y+ca*o*.6;c.beginPath();c.moveTo(px,py);c.lineTo(px-ca*(r||16),py-sa*(r||16)*.6);c.stroke()}}
  else if(kind==='gold'){for(let i=0;i<14;i++){const an=Math.random()*TAU,d=Math.random()*r;c.fillStyle=`rgba(255,${200+Math.floor(Math.random()*40)},90,${.25+Math.random()*.3})`;c.fillRect(x+Math.cos(an)*d,y+Math.sin(an)*d*.6,1.4,1.4)}}
  c.restore()}
// a burst of wood: planks and chips that fly and fall (drawn by the model's own plank)
function mmPlanks(x,y,n,band){const B=mmB();for(let i=0;i<B3N(n);i++){const a=rand(0,TAU),s=rand(40,120);B.planks.push({x,y,z:rand(8,26),vx:Math.cos(a)*s,vy:Math.sin(a)*s*.6,vz:rand(60,160),rot:rand(0,TAU),vr:rand(-9,9),t:0,life:rand(.7,1.1),band:band&&i%3===0,sc:rand(.55,.9)})}}
// a coin on the floor: 1 gold, picked up at 16 px, 3 s, at most 12 (the oldest goes in a sparkle)
function mmFloor(x,y){const B=mmB(),q=mmFree(x,y,4);if(B.floor.length>=12){const o=B.floor.shift();mmSpark(o.x,o.y)}B.floor.push({x:q.x,y:q.y,t:0,ph:Math.random()*6})}
function mmSpark(x,y){for(let i=0;i<(LOWFX?2:5);i++)G.fx.push({k:'lvl',x,y:y-4,vx:rand(-40,40),vy:rand(-70,-20),t:.5,gold:true})}
// ---- the brain
function mmWalk(e,dur){e.st='walk';e.sub='';e.stT=dur==null?rand(1.1,1.5):dur;e.mt=0;e.s3=null;e.mdt=0;e.air=false;e.z=0;e.tip=null;e.tips=null;e.last=false;e.real=0;e.slide=0;e.breath=0;e.dart=null}
function mmNext(e){const p2=!!e.p2,now=G.t||0,d=Math.hypot(P.x-e.x,P.y-e.y);
  // the Assaggio first when you stand on it: it takes the place of the next move, which stays in the queue
  if(d<85&&now-(e.grabT==null?-99:e.grabT)>=(p2?4:6)){e.grabT=now;mmStart(e,'grab');return}
  const seq=p2?MM2.seq2:MM2.seq1;let nx=seq[(e.si=(e.si==null?-1:e.si)+1)%seq.length];if(nx==='shell'&&(e.shellN||0)>=2)nx='chomp';mmStart(e,nx)}
function mmStart(e,st){const B=mmB(),a=Math.atan2(P.y-e.y,P.x-e.x),p2=!!e.p2;e.lf=a;e.face=a;e.tip=null;e.tips=null;
  if(st==='chomp'){mmLane(e,a);e.chompN=e.chompN>0?e.chompN:(p2?2:1)}
  else if(st==='tongue'){const m={x:e.x+Math.cos(a)*24,y:e.y+Math.sin(a)*24},len=Math.max(40,Math.min(240,mmReach(m.x,m.y,a,240)));B.tl=[{x:m.x,y:m.y,a,len,t:.5,hit:false}];e.tip=mmTip(e,m.x+Math.cos(a)*len,m.y+Math.sin(a)*len)}
  else if(st==='tongue3'){B.tl=[-26,0,26].map((dg,i)=>{const an=a+dg*Math.PI/180,m={x:e.x+Math.cos(an)*24,y:e.y+Math.sin(an)*24},len=Math.max(40,Math.min(240,mmReach(m.x,m.y,an,240)));return{x:m.x,y:m.y,a:an,len,t:[.4,.56,.72][i],hit:false}});
    e.tips=B.tl.map(l=>mmTip(e,l.x+Math.cos(l.a)*l.len,l.y+Math.sin(l.a)*l.len))}
  else if(st==='coins'){const n=p2?9:7,span=70*Math.PI/180;B.clines=[...Array(n)].map((_,i)=>{const an=a+(i/(n-1)-.5)*span,m={x:e.x+Math.cos(an)*26,y:e.y+Math.sin(an)*26};return{x:m.x,y:m.y,a:an,len:Math.max(30,Math.min(rand(170,230),mmReach(m.x,m.y,an,230)))}})}
  else if(st==='leap'){e.leapN=e.leapN>0?e.leapN:(p2?3:2);mmTrap(e)}
  else if(st==='grab'){B.fan={x:e.x,y:e.y,a,r:72,half:65*Math.PI/180}}
  else if(st==='shell'){const S=mmShellPlan(e);if(!S){mmStart(e,'chomp');return}const dd=Math.hypot(S[0].x-e.x,S[0].y-e.y);
    if(dd>12){e.shellPlan=S;e.ra=Math.atan2(S[0].y-e.y,S[0].x-e.x);b3go(e,'retreat',clamp(dd/260,.15,.75));return}mmShell(e,S);return}
  b3go(e,st)}
// the lane of the Morso: the run (at most 180, 30 short of the first wall or obstacle) and the three bites marked on it
function mmLane(e,a){const B=mmB(),run=Math.max(40,Math.min(180,mmReach(e.x,e.y,a,260)-30)),k=run/180;B.lane={x:e.x,y:e.y,a,run,len:run+30,prints:[62,117,172].map(s=>s*k),done:0,bit:false,hitRock:false,rock:run<180};e.lf=a;e.face=a}
// the circle of a leap of the Tagliola: where you are, at most 220 px away (260 in the second phase), never on an obstacle
function mmTrap(e,noStuck){const B=mmB(),mx=e.p2?260:220,dx=P.x-e.x,dy=P.y-e.y,d=Math.hypot(dx,dy),k=d>mx?mx/d:1,q=mmFree(e.x+dx*k,e.y+dy*k,24);
  B.trap={x:q.x,y:q.y,r:36,x0:e.x,y0:e.y,noStuck:!!noStuck};e.lf=Math.atan2(q.y-e.y,q.x-e.x);e.face=e.lf;e.last=(e.leapN||1)<=1&&!noStuck}
// ---- IL GIOCO DELLE CASSE: three places, its own and two at its sides across the line to you, all at least 130 px from you, 40 from the
// walls and away from the obstacles (its own place is pushed away from you when you are near: it runs there first); null if none fits
function mmShellPlan(e){const ok=q=>q.x>=L+40&&q.x<=R-40&&q.y>=TOP+50&&q.y<=BOT-40&&Math.hypot(q.x-P.x,q.y-P.y)>=130&&!G.rocks.some(k=>Math.hypot(k.x-q.x,k.y-q.y)<k.r+30);
  const b0=Math.atan2(e.y-P.y,e.x-P.x),d0=Math.hypot(e.x-P.x,e.y-P.y);
  for(const dist of[Math.max(150,Math.min(d0,240)),180,220,260,150])for(const off of[0,.35,-.35,.7,-.7,1.1,-1.1,1.6,-1.6,2.2,-2.2,Math.PI]){const b=b0+off,c={x:P.x+Math.cos(b)*dist,y:P.y+Math.sin(b)*dist*.85};if(!ok(c))continue;
    const a=Math.atan2(P.y-c.y,P.x-c.x),nx=-Math.sin(a),ny=Math.cos(a);for(let i=0;i<4;i++){const r1=rand(110,140),r2=rand(110,140),s1={x:c.x+nx*r1,y:c.y+ny*r1*.75},s2={x:c.x-nx*r2,y:c.y-ny*r2*.75};
      if(ok(s1)&&ok(s2))return[c,s1,s2]}}
  return null}
function mmShell(e,S){const B=mmB();e.shellN=(e.shellN||0)+1;e.x=S[0].x;e.y=S[0].y;e.shellPlan=null;
  const n=e.shellN>1?4:3,dur=e.shellN>1?.42:.5;
  // the swaps: two chests at a time; the real one is in at least two of them
  const sw=[];for(let i=0;i<n;i++){if(i<2||Math.random()<.6)sw.push([0,Math.random()<.5?1:2]);else sw.push([1,2])}
  B.shell={t:0,S,pos:[0,1,2],sw,n,dur,ph:'hide',fell:false,done:0,cur:-1,laugh:0};
  B.drops=[1,2].map(i=>({x:S[i].x,y:S[i].y,r:26,t:.8,max:.8}));
  G.cc=(G.cc||[]).filter(c=>c.st!=='m2');for(const i of[1,2])G.cc.push({st:'m2',m2:1,id:i,x:S[i].x,y:S[i].y,z:400,slide:0,t:0,k:0,bad:false});
  e.hidden=true;e.air=true;e.face=Math.PI/2;b3go(e,'hide');b3say(e,'c_hide')}
const mmRage=e=>{const B=mmB();e.p2=true;e.shell=9;banner('Il Mimic ha fame!','Fase 2',1.6);bossRage(e,MM2.orange);$('bossBar').classList.add('rage');shake(6);
  B.warn=[];B.lane=null;B.tl=null;B.fan=null;B.clines=null;B.coins=[];B.rain=[];B.rainW=[];B.trap=null;e.tip=null;e.tips=null;e.chompN=0;e.leapN=0;b3say(e,'angry');b3go(e,'rage')};
if(MM2ON)mimicUpd=function(e,dt,a,d){const sp=mmSp(e),B=mmB(),p2=!!e.p2,inShell=['retreat','hide','chest','pop','daze'].includes(e.st);
  const dtm=inShell?dt:dt*sp;// the second phase runs 1.3 times faster; the chest game and the daze in real seconds
  if(!e.p2&&e.hp<e.max*.5&&e.st==='walk'){mmRage(e);return}
  b3tick(e,dtm);const k=b3k(e);if(e.real>0)e.real=Math.max(0,e.real-dt/.1);
  switch(e.st){
  // ---- between the moves: still as a piece of furniture, then quick as a spider; every dart goes beside you, never onto you
  case 'walk':{const D=B3D(e,'walk'),w0=e.wt||0;e.wt=w0+dtm;const u0=(w0%D)/D,u1=(e.wt%D)/D;
    if(!e.dart||u1<u0){const n=e.dn=(e.dn||0)+1;if(n%2===1)e.dside=-(e.dside||1);const b=Math.atan2(e.y-P.y,e.x-P.x)+(e.dside||1)*rand(.35,1.05),r=rand(80,120);
      let q=mmFree(P.x+Math.cos(b)*r,P.y+Math.sin(b)*r*.8,30);const cr=(x0,y0,x1,y1)=>{const dx=x1-x0,dy=y1-y0,l2=dx*dx+dy*dy||1,u=clamp(((P.x-x0)*dx+(P.y-y0)*dy)/l2,0,1);return Math.hypot(P.x-(x0+dx*u),P.y-(y0+dy*u))};
      if(cr(e.x,e.y,q.x,q.y)<70){const b2=Math.atan2(e.y-P.y,e.x-P.x);q=mmFree(P.x+Math.cos(b2)*r,P.y+Math.sin(b2)*r*.8,30)}e.dart=q;mmClink(e.x,.012)}
    for(const s of[.11,.22,.33,.44])if(u0<s&&u1>=s)sfx('mimicStep',1,e.x);
    if(u1<.55){const dx=e.dart.x-e.x,dy=e.dart.y-e.y,dd=Math.hypot(dx,dy);if(dd>4){const an=clearLine(e.x,e.y,e.dart.x,e.dart.y,e.r*.6)?Math.atan2(dy,dx):navAngle(e),v=Math.min(dd,140*dtm);
        moveCircle(e,Math.cos(an)*v,Math.sin(an)*v);e.face=an;e.moving=true}else{e.face=a;e.moving=false}}
    else{if(u0<.55&&u1>=.55&&Math.random()<.34&&!LOWFX)mmMark('scratch',e.x+Math.cos(e.face)*20,e.y+Math.sin(e.face)*12,14,e.face);e.face=a;e.moving=false}
    e.coinT=(e.coinT==null?rand(2,3):e.coinT)-dt;if(e.coinT<=0){e.coinT=rand(2,3);mmSpark(e.x+Math.cos(e.face)*18,e.y-60)}
    if(e.stT<=0&&u1>=.55){const seq=p2?MM2.seq2:MM2.seq1,nx=seq[((e.si==null?-1:e.si)+1)%seq.length];
      if((nx==='chomp'||nx==='leap')&&d>210&&(e.extra||0)<2){e.extra=(e.extra||0)+.8;e.stT+=.8;break}e.extra=0;e.moving=false;mmNext(e)}break}
  case 'taunt':{e.moving=false;e.face=a;if(e.stT<=0)mmWalk(e,rand(.3,.55));break}
  // the lure (when it calls you out): then the tongue if you stay far
  case 'lure':{e.moving=false;e.face=a;if(b3at(e,.35)||b3at(e,.55))mmClink(e.x,.02);if(e.stT<=0){if(d>=140)mmStart(e,p2?'tongue3':'tongue');else mmWalk(e,rand(.3,.55))}break}
  // ---- IL MORSO: the lane and its three bites (lit in turn), the run along it from .45 (CIAC .50 .58 .66), the lid on the floor (.74)
  case 'chomp':{e.moving=false;e.face=e.lf;const Ln=B.lane;if(!Ln){mmWalk(e);break}
    if(k>=.45&&k<.72&&Ln.done<Ln.run){e.air=true;const st=Math.min(Ln.run-Ln.done,380*dtm),ox=e.x,oy=e.y;moveCircle(e,Math.cos(Ln.a)*st,Math.sin(Ln.a)*st);const mv=Math.hypot(e.x-ox,e.y-oy);Ln.done+=mv;
      if(!LOWFX&&Math.random()<.5)G.fx.push({k:'puff',x:e.x+rand(-14,14),y:e.y+8,vx:-Math.cos(Ln.a)*30,vy:-8,t:.3,r:rand(4,7)});
      // stopped by an obstacle or a wall: it bites it
      if((mv<st*.4&&st>.5||Ln.rock&&Ln.done>=Ln.run-1)&&!Ln.hitRock){Ln.hitRock=true;Ln.done=Ln.run;const mx=e.x+Math.cos(Ln.a)*34,my=e.y+Math.sin(Ln.a)*34;mmMark('bite',mx,my,18);shake(3);mmClack(mx,1);
        if(BOSS2){ENV2.rocks(mx,my,90,2);ENV2.chunks(mx,my,B3N(8),['#8a6038','#6b4a2a','#9aa3a6'],90)}for(const r of G.rocks)if(Math.hypot(r.x-mx,r.y-my)<r.r+30&&!r.temp){r.hit=.3;r.dmg=(r.dmg||0)+2}}}
    if(k>=.72)e.air=false;
    for(const t0 of[.5,.58,.66])if(b3at(e,t0)){const mx=e.x+Math.cos(Ln.a)*28,my=e.y+Math.sin(Ln.a)*28;mmClack(mx,.9);shake(1.5);
      if(!Ln.bit&&Math.hypot(P.x-mx,P.y-my)<24+P.r*.5&&mmCan()){Ln.bit=true;hurtP(Math.round(28*DMG()))}}
    if(b3at(e,.74)){const mx=e.x+Math.cos(Ln.a)*32,my=e.y+Math.sin(Ln.a)*32;shake(2);dustRing(mx,my,8);if(!Ln.hitRock)mmMark('bite',mx,my,14)}
    if(b3at(e,.82))sfx('mimicStep',1,e.x);
    if(e.stT<=0){e.air=false;B.lane=null;if(--e.chompN>0){mmLane(e,Math.atan2(P.y-e.y,P.x-e.x));b3go(e,'chomp')}else{e.chompN=0;mmWalk(e)}}break}
  // ---- LA FRUSTATA (and the second phase's three): the tongue snaps along its line (.50, or .40 .56 .72), back .75-.90
  case 'tongue':case 'tongue3':{e.moving=false;e.face=e.lf;const T=B.tl;if(!T){mmWalk(e);break}
    for(const l of T){if(b3at(e,l.t)){sfx('dash',0,e.x);shake(1.5);if(!LOWFX)G.fx.push({k:'puff',x:l.x+Math.cos(l.a)*l.len,y:l.y+Math.sin(l.a)*l.len,vx:0,vy:-12,t:.35,r:6})}
      const w=e.st==='tongue'?.12:.07;if(!l.hit&&k>=l.t&&k<l.t+w&&mmCan()){const q=mmSeg(l.x,l.y,l.a,l.len,P.x,P.y);if(q.d<9+P.r*.5){l.hit=true;hurtP(Math.round((e.st==='tongue'?25:22)*DMG()))}}}
    if(b3at(e,e.st==='tongue'?.6:.45)||b3at(e,e.st==='tongue'?.7:.61))mmClack(e.x+Math.cos(e.lf)*120,.4);
    if(b3at(e,e.st==='tongue'?.76:.82))sfx('bubble',0,e.x);
    if(e.stT<=0){B.tl=null;e.tip=null;e.tips=null;mmWalk(e)}break}
  // ---- L'ASSAGGIO: the fan; at .58 it has you if you are in it (not dashing, not invulnerable), else it scratches the floor
  case 'grab':{e.moving=false;e.face=e.lf;
    if(b3at(e,.58)){const F=B.fan,dd=Math.hypot(P.x-e.x,P.y-e.y),an=Math.abs(Math.atan2(Math.sin(Math.atan2(P.y-e.y,P.x-e.x)-e.lf),Math.cos(Math.atan2(P.y-e.y,P.x-e.x)-e.lf)));
      mmClack(e.x,.8);if(F&&dd<F.r+P.r*.5&&an<F.half&&mmCan()&&G.state==='play'){B.fan=null;B.gulp={t:0};e.hidden=true;e.air=true;text(e.x,e.y-130,'Gnam!','#ffd84a',18);shake(4);vib([40,30,60]);b3go(e,'gulp');break}
      B.fan=null;for(const sd of[-1,1])mmMark('scratch',e.x+Math.cos(e.lf)*46-Math.sin(e.lf)*sd*10,e.y+Math.sin(e.lf)*46*.8+Math.cos(e.lf)*sd*6,18,e.lf)}
    if(e.stT<=0){B.fan=null;mmWalk(e)}break}
  // ---- IL BOCCONE: you are in its mouth (hidden), three chews, the spit at .75: 70 px in front, a hop, 24
  case 'gulp':{e.moving=false;e.face=e.lf;
    for(const t0 of[.2,.33,.46])if(b3at(e,t0)){mmClack(e.x,.7);shake(1.5);mmSpark(e.x+Math.cos(e.lf)*16,e.y-40)}
    if(b3at(e,.55))sfx('creep',1,e.x);
    if(b3at(e,.75)&&B.gulp){mmSpit(e,true)}
    if(e.stT<=0){if(B.gulp)mmSpit(e,false);e.hidden=false;e.air=false;b3taunt(e);if(e.st==='taunt')e.stT=Math.max(e.stT,.6)}break}
  // ---- SPUTO D'ORO (and the Pioggia): the coins at .50 along their lines; in the second phase the circles and the fountain
  case 'coins':{e.moving=false;e.face=e.lf;
    if(b3at(e,.5)&&B.clines){const z0=70;for(const l of B.clines)B.coins.push({x0:l.x,y0:l.y,a:l.a,len:l.len,t:0,dur:l.len/190,x:l.x,y:l.y,z:z0,z0,hit:false,spin:rand(0,6)});
      sfx('coin',0,e.x);mmClink(e.x,.03);vfxBlast(e.x+Math.cos(e.lf)*22,e.y+Math.sin(e.lf)*14-50,'255,210,90',30,{sparks:12,spcol:PAL.gold,dust:0,ring2:false});shake(2);
      if(p2){const W=[],vx=P.vxs||0,vy=P.vys||0,try1=(x,y)=>{const q=mmFree(x,y,22);if(W.every(w=>Math.hypot(w.x-q.x,w.y-q.y)>34))W.push(q)};try1(P.x,P.y);try1(P.x+vx*.8,P.y+vy*.8);
        for(let i=0;i<14&&W.length<(LOWFX?4:6);i++){const an=rand(0,TAU),r=rand(50,90);try1(P.x+Math.cos(an)*r,P.y+Math.sin(an)*r*.8)}B.rainW=W.map(q=>({x:q.x,y:q.y,r:18,t:1,max:1}))}}
    if(b3at(e,.55)&&p2&&B.rainW.length){const mx=e.x+Math.cos(e.lf)*22,my=e.y+Math.sin(e.lf)*14;for(const w of B.rainW)B.rain.push({x0:mx,y0:my,x1:w.x,y1:w.y,t:0,dur:.94,spin:rand(0,6)});sfx('coin',0,e.x)}
    if(b3at(e,.72)){mmFloor(e.x+Math.cos(e.lf)*30,e.y+Math.sin(e.lf)*20);sfx('coin',0,e.x)}
    if(e.stT<=0){B.clines=null;mmWalk(e)}break}
  // ---- LA TAGLIOLA: the circle where you are (k 0), the flight (.20-.93: z up to 80), the landing (.93): 20, the last one 24 and stuck
  case 'leap':{e.moving=false;const T=B.trap;if(!T){mmWalk(e);break}e.face=e.lf;
    if(b3at(e,.08))sfx('mimicStep',1,e.x);
    if(k>=.2&&k<.93){const u=(k-.2)/.73,q=C3.ez(u);e.x=T.x0+(T.x-T.x0)*q;e.y=T.y0+(T.y-T.y0)*q;e.z=80*Math.sin(Math.PI*u)}
    if(b3at(e,.93)){e.z=0;e.x=T.x;e.y=T.y;moveCircle(e,0,0);const last=e.last;
      if(mmD(P.x,P.y,T.x,T.y)<36+P.r*.4&&mmCan())hurtP(Math.round((last||T.noStuck?30:25)*DMG()));
      shake(5);mmClack(T.x,1.2);sfx('boom',0,T.x);mmMark('bite',T.x+Math.cos(e.lf)*20,T.y+Math.sin(e.lf)*12,22);dustRing(T.x,T.y,14);vib([30,20,40]);
      if(BOSS2){ENV2.fall(B3N(4));ENV2.rocks(T.x,T.y,130,1.5)}}
    if(e.stT<=0){e.z=0;B.trap=null;if(T.noStuck){e.leapN=0;e.last=false;mmWalk(e);break}
      if(--e.leapN>0){mmTrap(e);b3go(e,'leap')}else{e.leapN=0;b3go(e,'stuck')}}break}
  case 'stuck':{e.moving=false;e.z=0;if(Math.random()<dt*2.5)mmSpark(e.x+Math.cos(e.lf)*30,e.y+Math.sin(e.lf)*18);
    if(b3at(e,.8)){e.last=false;mmPlanks(e.x+Math.cos(e.lf)*30,e.y+Math.sin(e.lf)*18,8,true);vfxBlast(e.x+Math.cos(e.lf)*30,e.y+Math.sin(e.lf)*18,'200,180,150',44,{debris:'stone',n:8,dust:8,ring2:false});sfx('rock',0,e.x);shake(3)}
    if(e.stT<=0){e.last=false;mmWalk(e)}break}
  // ---- IL GIOCO DELLE CASSE (all in real seconds): back away if you are near, then hide; the fakes fall; the swaps; you choose
  case 'retreat':{e.moving=true;const S=e.shellPlan;if(S){e.ra=Math.atan2(S[0].y-e.y,S[0].x-e.x);const v=Math.min(260*dt,Math.hypot(S[0].x-e.x,S[0].y-e.y));moveCircle(e,Math.cos(e.ra)*v,Math.sin(e.ra)*v)}e.face=e.ra;e.wt=(e.wt||0)+dt*2;
    if(e.stT<=0){e.moving=false;if(S)mmShell(e,S);else mmStart(e,'chomp')}break}
  case 'hide':case 'chest':{e.moving=false;e.hidden=true;e.air=true;e.face=Math.PI/2;e.f3=Math.PI/2;e.fx3=0;e.fy3=1;e.f3t=G.t;mmShellTick(e,dt);if(e.st==='hide'&&e.stT<=0)b3go(e,'chest',999);break}
  case 'pop':{e.moving=false;e.face=a;e.hidden=true;e.air=true;e.z=0;if(e.stT<=0){e.hidden=false;e.air=false;const R=e.pop;e.pop=null;
      if(R==='daze'){b3go(e,'daze',2)}else{e.leapN=1;mmTrap(e,true);b3go(e,'leap')}}break}
  case 'daze':{e.moving=false;if(e.stT<=0)mmWalk(e,rand(.6,.9));break}
  // ---- HA FAME! no blows: it shakes, rises, the lock cracks (.47) and opens (it was an eye), the lid opens wide (.60), the roar (.75)
  case 'rage':{e.moving=false;e.face=a;
    if(b3at(e,.2))b3torch('gold',.8);
    if(b3at(e,.47)){sfx('click',0,e.x);sfx('shimmer',0,e.x)}
    if(b3at(e,.6))sfx('creep',2,e.x);
    if(b3at(e,.75)){b3torch('fire',4);shake(8);vib([60,40,120]);if(BOSS2)ENV2.rocks(e.x,e.y,400,1);mmMark('gold',e.x,e.y+10,40);
      for(let i=0;i<3;i++)setTimeout(()=>{if(G&&G.fx)fxPush({k:'ring2',x:e.x,y:e.y-60,rgb:'255,170,90',r0:e.r,r1:e.r*5,t:.45,max:.45,w:6-i*1.5})},i*170)}
    for(const t0 of[.78,.86])if(b3at(e,t0)){shake(4);dustRing(e.x+Math.cos(a)*40,e.y+Math.sin(a)*24,8)}
    if(e.stT<=0){e.shell=0;e.si=-1;mmNext(e)}break}
  default:mmWalk(e)}};
// the spit: the hero comes out 70 px in front (a free place) with a hop; with dmg the 24 of the bite
function mmSpit(e,dmg){const B=mmB();if(!B.gulp)return;B.gulp=null;const f=e.lf!=null?e.lf:Math.PI/2,q=b3spot(e.x+Math.cos(f)*70,e.y+Math.sin(f)*70,30);P.x=q.x;P.y=q.y;P.hopT=.38;
  if(dmg){P.inv=0;hurtP(Math.round(30*DMG()));P.inv=Math.max(P.inv,1);text(P.x,P.y-60,'Bleah!','#ffd84a',16);b3say(e,'c_spit',true);sfx('splash',0,e.x)}else P.inv=Math.max(P.inv,.6);
  e.hidden=false;e.air=false;shake(3)}
// ---- the chest game, step by step (real seconds from the hide)
function mmShellTick(e,dt){const B=mmB(),S=B.shell;if(!S)return;S.t+=dt;const t=S.t,fakes=(G.cc||[]).filter(c=>c.st==='m2'),ch=j=>j===0?e:fakes.find(q=>q.id===j);
  // the fakes fall from 260 px in .55 s (from .25 s) on their circles: 14 to whoever is in one
  if(!S.fell)for(const c of fakes){const u=clamp((t-.25)/.55,0,1);c.z=u<=0?400:260*(1-u*u)}
  if(!S.fell&&t>=.8){S.fell=true;for(const c of fakes){c.z=0;if(mmD(P.x,P.y,c.x,c.y)<26+P.r*.4&&mmCan())hurtP(Math.round(18*DMG()));dustRing(c.x,c.y,12);vfxBlast(c.x,c.y,'210,190,150',46,{debris:'stone',n:8,dust:10,ring2:false})}
    shake(4);sfx('boom',0,e.x);B.drops=[];banner('Tre casse!','Trova quella vera',1.5)}
  // the swaps (from 1 s): two chests at a time change places on two arcs (one passes in front, the other behind) with a hop
  const ts=t-1;if(ts<0||S.ph==='end')return;const i=Math.floor(ts/S.dur);
  while(S.done<Math.min(i,S.n)){const[A,Bq]=S.sw[S.done];[S.pos[A],S.pos[Bq]]=[S.pos[Bq],S.pos[A]];S.done++;mmClack(e.x,.6);sfx('rock',0,e.x)}
  if(i<S.n){const u=(ts-i*S.dur)/S.dur,[A,Bq]=S.sw[i];
    if(S.cur!==i){S.cur=i;e.real=1;mmClack(e.x,.5);const g=ch(S.laugh++%3);if(g)b3say({type:'mimic',x:g.x,y:g.y,b3s:{}},'laugh',true)}
    for(let j=0;j<3;j++){const c=ch(j);if(!c)continue;const X0=S.S[S.pos[j]];let x=X0.x,y=X0.y,z=0,sl=0;
      if(j===A||j===Bq){const X1=S.S[S.pos[j===A?Bq:A]],q=C3.ez(u),fr=j===A?1:-1;x=X0.x+(X1.x-X0.x)*q;y=X0.y+(X1.y-X0.y)*q+fr*22*Math.sin(Math.PI*u);z=16*Math.sin(Math.PI*u);sl=Math.sign(X1.x-X0.x||1)*Math.sin(Math.PI*u)}
      c.x=x;c.y=y;c.z=z;c.slide=sl}}
  else if(S.ph!=='choose'){for(let j=0;j<3;j++){const c=ch(j);if(c){c.x=S.S[S.pos[j]].x;c.y=S.S[S.pos[j]].y;c.z=0;c.slide=0}}S.ph='choose';S.tc=0;B.ask={t:0}}
  // the choice: 3 s; the real one lifts its lid a little every 0.9 s; you choose by touching a chest
  if(S.ph==='choose'){S.tc+=dt;e.breath=C3K.pls((S.tc%.9)/.9,.5,.35);if(B.ask)B.ask.t+=dt;
    let pick=null;for(let j=0;j<3;j++){const c=ch(j);if(c&&touching(P,{x:c.x,y:c.y-2,rx:24,ry:12},8)){pick=c;break}}
    if(pick||S.tc>=3){S.ph='end';B.ask=null;e.breath=0;
      if(pick===e){text(e.x,e.y-70,'Trovato!','#ffd84a',20);sfx('victory');for(const c of fakes)mmBurst(c);e.pop='daze'}
      else{if(pick)mmBurst(pick);for(const c of fakes)if(c!==pick)mmBurst(c);e.pop='leap'}
      B.shell=null;G.cc=(G.cc||[]).filter(c=>c.st!=='m2');e.hidden=true;e.air=true;b3go(e,'pop')}}}
// a fake chest bursts: «Vuota!», a puff, planks and 3 real coins
function mmBurst(c){text(c.x,c.y-60,'Vuota!','#f4ecdc',15);for(let i=0;i<(LOWFX?6:12);i++)G.fx.push({k:'puff',x:c.x+rand(-16,16),y:c.y-rand(4,30),vx:rand(-60,60),vy:rand(-60,10),t:rand(.3,.6),r:rand(5,9)});
  mmPlanks(c.x,c.y-14,10,true);for(let i=0;i<3;i++)mmFloor(c.x+rand(-20,20),c.y+rand(-6,10));sfx('rock',0,c.x);mmClink(c.x,.03);c.st='gone'}
// «Colpo in bocca!»: with its mouth wide open, the blows from the front (and in the stuck and daze from every side) hurt half more
{const _h=hurtE;hurtE=function(e,d,crit,dot){if(MM2ON&&e&&e.type==='mimic'&&!dot&&!e.dead){const m=mmMouth(e);if(m){const fr=Math.abs(Math.atan2(Math.sin(Math.atan2(P.y-e.y,P.x-e.x)-(e.face||0)),Math.cos(Math.atan2(P.y-e.y,P.x-e.x)-(e.face||0))));
    if(m===2||fr<70*Math.PI/180){const A=[...arguments];A[1]=d*1.5;if(!G.mmtxt){G.mmtxt=1;text(e.x,e.y-130,'Colpo in bocca!','#ffd84a',18)}
      if((G.t||0)-(e.dingT||-9)>.18){e.dingT=G.t;mmClink(e.x,.04);for(let i=0;i<(LOWFX?2:4);i++)G.fx.push({k:'lvl',x:e.x+Math.cos(e.face||0)*20,y:e.y-70,vx:rand(-60,60),vy:rand(-90,-30),t:.45,gold:true})}
      if(Math.random()<.25)mmPlanks(e.x,e.y-50,2,false);return _h.apply(this,A)}}}return _h.apply(this,arguments)}}
// its own arena reactions (the old ones of today go: no more red lines nor quake)
{const _r=b2react;b2react=function(e){if(MM2ON&&e&&e.type==='mimic')return;return _r.apply(this,arguments)}}
// the call (the mocking when you stay far): the lure in place of the laugh
{const _t=b3taunt;b3taunt=function(e,k){if(MM2ON&&e&&e.type==='mimic'&&k==='laugh2'){const S=e.b3s||(e.b3s={});S.tauntT=G.t||0;S.pend=0;b3go(e,'lure');e.moving=false;b3say(e,'laugh2');return}return _t.apply(this,arguments)}}
// ---- in its mouth: no hero, no shadow, no bar, no dash, no Super; the hero sits 24 px in front of its centre
{const _dh=drawHero;drawHero=function(){if(MM2ON&&G&&G.m2&&G.m2.gulp)return;return _dh.apply(this,arguments)}}
{const _s=shadow;shadow=function(x,y,rx){if(MM2ON&&G&&G.m2&&G.m2.gulp&&P&&x===P.x&&y===P.y+8&&rx===13)return;return _s.apply(this,arguments)}}
{const _db=drawBars;drawBars=function(){if(MM2ON&&G&&G.m2&&G.m2.gulp&&P){const y=P.y;P.y=-9999;try{_db.apply(this,arguments)}finally{P.y=y}return}return _db.apply(this,arguments)}}
{const _d=dash;dash=function(){if(MM2ON&&G&&G.m2&&G.m2.gulp)return;return _d.apply(this,arguments)}}
{const _u=useUlt;useUlt=function(){if(MM2ON&&G&&G.m2&&G.m2.gulp)return;return _u.apply(this,arguments)}}
// ---- the dangers in flight and on the floor (real time)
function mmUpdate(dt){const B=G.m2;if(!B)return;const e=mmBoss();
  if(G.state!=='play'||!e){if(B.gulp){B.gulp=null;P.inv=Math.max(P.inv,.6)}B.coins=[];B.rain=[];B.rainW=[];B.warn=[];B.lane=null;B.tl=null;B.fan=null;B.clines=null;B.trap=null;B.drops=[];B.ask=null;
    if(B.shell){B.shell=null;if(G.cc)G.cc=G.cc.filter(c=>c.st!=='m2')}}
  if(B.gulp&&e){B.gulp.t+=dt;const f=e.lf!=null?e.lf:Math.PI/2;P.x=e.x+Math.cos(f)*24;P.y=e.y+Math.sin(f)*18;P.inv=Math.max(P.inv,.35);P.dashT=0}
  for(const w of B.rainW)w.t=Math.max(0,w.t-dt);for(const w of B.drops)w.t=Math.max(0,w.t-dt);
  // the coins of the Sputo: low over the floor with two bounces (14 and 6 high); 12 while they fly low, against an obstacle they drop
  for(let i=B.coins.length-1;i>=0;i--){const c=B.coins[i];c.t+=dt;const u=Math.min(1,c.t/c.dur),s=u*c.len,nx=c.x0+Math.cos(c.a)*s,ny=c.y0+Math.sin(c.a)*s;c.spin+=dt*14;
    c.z=u<.32?c.z0*Math.pow(1-u/.32,2):u<.68?14*Math.sin(Math.PI*(u-.32)/.36):6*Math.sin(Math.PI*(u-.68)/.32);
    const blk=G.rocks.some(k=>Math.hypot(k.x-nx,k.y-ny)<k.r+3);if(!blk){c.x=nx;c.y=ny}
    if(!c.hit&&c.z<18&&Math.hypot(P.x-c.x,P.y-c.y)<7+P.r*.4&&mmCan()&&!B.gulp){c.hit=true;hurtP(Math.round(15*DMG()))}
    if(blk||u>=1){B.coins.splice(i,1);mmFloor(c.x,c.y);if(blk)mmClink(c.x,.02)}}
  // the Pioggia: up from the mouth and down on its circle 1 s after the spit; 16 in the circle
  for(let i=B.rain.length-1;i>=0;i--){const c=B.rain[i];c.t+=dt;c.spin+=dt*10;if(c.t>=c.dur){B.rain.splice(i,1);if(mmD(P.x,P.y,c.x1,c.y1)<18+P.r*.4&&mmCan()&&!B.gulp)hurtP(Math.round(20*DMG()));mmFloor(c.x1,c.y1);mmClink(c.x1,.025);dustRing(c.x1,c.y1,5)}}
  if(!B.rain.length&&B.rainW.length&&B.rainW.every(w=>w.t<=0))B.rainW=[];
  // the coins on the floor: 1 gold each, 16 px, 3 s
  for(let i=B.floor.length-1;i>=0;i--){const c=B.floor[i];c.t+=dt;if(c.t>=3){B.floor.splice(i,1);mmSpark(c.x,c.y);continue}
    if(c.t>.3&&Math.hypot(P.x-c.x,P.y-c.y)<16&&!B.gulp){B.floor.splice(i,1);G.gold+=1;if(G.goldRun)G.goldRun.got+=1;sfx('coin');text(c.x,c.y-14,'+1','#ffd84a',11)}}
  // the planks in flight
  for(let i=B.planks.length-1;i>=0;i--){const q=B.planks[i];q.t+=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.vz-=520*dt;q.z+=q.vz*dt;q.rot+=q.vr*dt;if(q.z<0){q.z=0;q.vz=-q.vz*.3;q.vx*=.6;q.vy*=.6;q.vr*=.5}if(q.t>=q.life)B.planks.splice(i,1)}}
{const _u=update;update=function(dt){_u.apply(this,arguments);try{if(MM2ON&&G&&G.m2&&started&&!paused)mmUpdate(dt)}catch(err){console.error(err)}}}
// ---- drawing: on the floor the warnings and the coins lying there; in the air the coins flying, the planks, the «?» over the chests
function mmGround(){const B=G.m2;if(!B)return;const e=mmBoss(),t=G.t||0,pu=.55+.3*Math.sin(t*18),red=MM2.red,K=MM2.K;
  const disc=(x,y,r,k)=>{ctx.fillStyle=`rgba(${red},${.1+.22*k})`;ell(x,y,r*Math.max(.05,k),r*Math.max(.05,k)*K);ctx.fill();ctx.strokeStyle=`rgba(${red},${pu})`;ctx.lineWidth=2.4;ell(x,y,r,r*K);ctx.stroke();
    ctx.fillStyle=`rgba(0,0,0,${.12+.28*k})`;ell(x,y,r*(.3+.7*k)*.8,r*(.3+.7*k)*.42);ctx.fill()};
  // the lane of the Morso and its three bites (half moons with their little teeth, lit in turn)
  if(B.lane&&e&&e.st==='chomp'){const Ln=B.lane,k=Math.min(1,b3k(e)/.45);if(b3k(e)<.74){ctx.save();ctx.translate(Ln.x,Ln.y);ctx.rotate(Ln.a);const fl=k>=1?(Math.sin(t*30)>0?.3:.16):.12;
    ctx.fillStyle=`rgba(${red},${fl})`;ctx.fillRect(0,-22,Ln.len,44);ctx.strokeStyle=`rgba(${red},.75)`;ctx.lineWidth=1.8;if(k<1)ctx.setLineDash([8,6]);ctx.strokeRect(0,-22,Ln.len,44);ctx.setLineDash([]);
    Ln.prints.forEach((s,i)=>{const on=k>=(i+1)/3;ctx.strokeStyle=on?'rgba(255,244,214,.95)':`rgba(${red},.7)`;ctx.lineWidth=on?2.4:1.6;ctx.beginPath();ctx.arc(s,0,15,-Math.PI/2,Math.PI/2);ctx.stroke();
      ctx.beginPath();for(let j=0;j<5;j++){const an=-Math.PI/2+(j+.5)/5*Math.PI,x=s+Math.cos(an)*15,y=Math.sin(an)*15;ctx.moveTo(x,y);ctx.lineTo(s+Math.cos(an)*10,Math.sin(an)*10)}ctx.stroke()});ctx.restore()}}
  // the lines of the Frustata (a line lights up 0.15 s before its snap)
  if(B.tl&&e&&(e.st==='tongue'||e.st==='tongue3')){const k=b3k(e),D=B3D(e,e.st)/mmSp(e);for(const l of B.tl){if(k>l.t+.08)continue;const hot=(l.t-k)*D<.15;ctx.save();ctx.translate(l.x,l.y);ctx.rotate(l.a);
    ctx.fillStyle=`rgba(${red},${hot?(Math.sin(t*30)>0?.4:.24):.14})`;ctx.fillRect(0,-9,l.len,18);ctx.strokeStyle=`rgba(${red},${hot?.95:.6})`;ctx.lineWidth=1.6;if(!hot)ctx.setLineDash([7,6]);ctx.strokeRect(0,-9,l.len,18);ctx.setLineDash([]);ctx.restore()}}
  // the fan of the Assaggio
  if(B.fan&&e&&e.st==='grab'){const F=B.fan,k=Math.min(1,b3k(e)/.58);ctx.save();ctx.beginPath();ctx.moveTo(F.x,F.y);for(let i=0;i<=16;i++){const an=F.a-F.half+i/16*2*F.half;ctx.lineTo(F.x+Math.cos(an)*F.r,F.y+Math.sin(an)*F.r*K)}ctx.closePath();
    ctx.fillStyle=`rgba(${red},${.1+.2*k})`;ctx.fill();ctx.strokeStyle=`rgba(${red},${pu})`;ctx.lineWidth=2.2;ctx.stroke();ctx.restore()}
  // the lines of the Sputo, dashed, filling from the mouth outward, a little circle at their end
  if(B.clines&&e&&e.st==='coins'){const k=Math.min(1,b3k(e)/.5);ctx.save();ctx.lineCap='round';for(const l of B.clines){const ex=l.x+Math.cos(l.a)*l.len,ey=l.y+Math.sin(l.a)*l.len;
    ctx.strokeStyle=`rgba(${red},.35)`;ctx.lineWidth=5;ctx.setLineDash([6,6]);ctx.beginPath();ctx.moveTo(l.x,l.y);ctx.lineTo(ex,ey);ctx.stroke();
    ctx.strokeStyle=`rgba(${red},${pu})`;ctx.lineWidth=3;ctx.setLineDash([]);ctx.beginPath();ctx.moveTo(l.x,l.y);ctx.lineTo(l.x+Math.cos(l.a)*l.len*k,l.y+Math.sin(l.a)*l.len*k);ctx.stroke();
    ctx.lineWidth=2;ell(ex,ey,6,6*K);ctx.stroke()}ctx.restore()}
  // the circles of the Pioggia and of the falling fakes
  for(const w of B.rainW)disc(w.x,w.y,w.r,1-w.t/w.max);
  for(const w of B.drops)disc(w.x,w.y,w.r,1-w.t/w.max);
  // the circle of the Tagliola: its shadow growing inside, eight little teeth that light up in turn round its rim
  if(B.trap&&e&&e.st==='leap'){const T=B.trap,k=Math.min(1,b3k(e)/.93);disc(T.x,T.y,T.r,k);for(let i=0;i<8;i++){const an=-Math.PI/2+i/8*TAU,on=k>=(i+1)/8,x=T.x+Math.cos(an)*T.r*1.1,y=T.y+Math.sin(an)*T.r*1.1*K;
    ctx.fillStyle=on?'rgba(255,248,226,.95)':`rgba(${red},.65)`;ctx.strokeStyle='rgba(40,20,14,.8)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-3,y-1.5);ctx.lineTo(x+3,y-1.5);ctx.lineTo(x,y+(on?5:3.5));ctx.closePath();ctx.fill();ctx.stroke()}}
  // the coins on the floor, glinting
  const Co=N3.mimicCoin;for(const c of B.floor){const fade=c.t>2.6?Math.max(0,(3-c.t)/.4):1,gl=Math.max(0,Math.sin(t*4+c.ph))>.9?1:0;
    if(Co){try{Co(c.x,c.y,0,0,1,{floor:1,glint:gl,a:fade});continue}catch(err){}}ctx.fillStyle='#ffc93c';ell(c.x,c.y,4.5,2.4);ctx.fill()}}
function mmAir(){const B=G.m2;if(!B)return;const t=G.t||0,Co=N3.mimicCoin,Pl=N3.mimicPlank;
  for(const c of B.coins){if(Co){try{Co(c.x,c.y,c.z,c.spin,1,{});continue}catch(err){}}ctx.fillStyle='#ffc93c';circ(c.x,c.y-c.z,4.5);ctx.fill()}
  for(const c of B.rain){const u=Math.min(1,c.t/c.dur),x=c.x0+(c.x1-c.x0)*u,y=c.y0+(c.y1-c.y0)*u,z=60*(1-u)+130*Math.sin(Math.PI*u);if(Co){try{Co(x,y,z,c.spin,1,{});continue}catch(err){}}ctx.fillStyle='#ffc93c';circ(x,y-z,4.5);ctx.fill()}
  for(const q of B.planks){const a=q.t>q.life-.25?Math.max(0,(q.life-q.t)/.25):1;ctx.save();ctx.globalAlpha*=a;if(Pl){try{Pl(q.x,q.y,q.z,q.rot,q.sc,{band:q.band})}catch(err){}}ctx.restore()}
  // the «?» over the three chests while you choose
  if(B.ask){const e=mmBoss(),all=[e,...(G.cc||[]).filter(c=>c.st==='m2')].filter(Boolean);for(const c of all){const b=Math.sin(t*5+c.x*.05)*3,x=c.x,y=c.y-72;
    glow('255,215,90',x,y+10,26,.22);ctx.fillStyle='#ffc93c';ink(2.5);ctx.beginPath();ctx.moveTo(x,y+b);ctx.lineTo(x-7,y-10+b);ctx.lineTo(x+7,y-10+b);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.font='14px "Lilita One", sans-serif';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle=INK;ctx.strokeText('?',x,y-14+b);ctx.fillStyle='#fff';ctx.fillText('?',x,y-14+b)}}}
{const _g2=drawHazards2Ground;drawHazards2Ground=function(){_g2.apply(this,arguments);try{if(MM2ON)mmGround()}catch(err){}}}
{const _a2=drawHazards2Air;drawHazards2Air=function(){_a2.apply(this,arguments);try{if(MM2ON)mmAir()}catch(err){}}}
// ---- the shadows: the same for it, its fakes and the twin chests (drawn with the others, before every sprite)
function mmShadow(x,y,z){const air=clamp((z||0)/120,0,.6);shadow(x,y,44*(1-air*.5),18*(1-air*.5),.3*(1-air))}
{const _sf=shadowFor;shadowFor=function(e){if(MM2ON&&e&&e.type==='mimic'){if(!(e.intro>0&&(e.iT||0)<.05))mmShadow(e.x,e.y+8,e.z||0);return}return _sf.apply(this,arguments)}}
{const _ps=petShadow;petShadow=function(){_ps.apply(this,arguments);if(!MM2ON||!G||!G.cc)return;for(const c of G.cc){if(c.st==='m2'){if(c.z<300)mmShadow(c.x,c.y+8,c.z);continue}
    if(c.t<0||c.st==='gone')continue;const drop=c.st==='drop'?Math.max(0,1-c.t/.55):0,sq=c.st==='poof'?Math.max(0,1-c.k/.5):1;if(sq>.05)mmShadow(c.x,c.y+12,drop*drop*260)}}}
// ---- the twin chests (42 is not touched): drawn with the model's chest where the Mimic will be born, the fakes of the chest game too
if(MM2ON){const _dt=drawTwinChest;drawTwinChest=function(c){const Ch=N3.mimicChest;if(!Ch)return _dt.apply(this,arguments);
  try{const mat=mmMat();
    if(c.st==='m2'){if(c.z<300)Ch(c.x,c.y+8,c.z||0,Math.PI/2,1,{mat,slide:c.slide||0,shadow:false,torn:1});return}
    if(c.t<0)return;const drop=c.st==='drop'?Math.max(0,1-c.t/.55):0,h=drop*drop*260,sq=c.st==='poof'?Math.max(0,1-c.k/.5):1,o={mat,shadow:false};
    if(c.st==='open'){o.good=1;o.lid=Math.min(1,c.k/.35);o.gold=o.lid}if(c.st==='shake')o.shake=Math.min(1,c.k/1.1);
    if(sq<1){ctx.save();ctx.translate(c.x,c.y+12);ctx.scale(sq,sq);ctx.translate(-c.x,-(c.y+12))}Ch(c.x,c.y+12,h,Math.PI/2,1,o);if(sq<1)ctx.restore();
    if(c.st==='idle'&&G.state==='cleared'&&!G.ccChosen){const b=Math.sin(G.t*5)*3,x=c.x,y=c.y-60;glow('255,215,90',x,y+12,30,.22+.08*Math.sin(G.t*4));ctx.fillStyle='#ffc93c';ink(2.5);
      ctx.beginPath();ctx.moveTo(x,y+b);ctx.lineTo(x-7,y-10+b);ctx.lineTo(x+7,y-10+b);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.font='13px "Lilita One", sans-serif';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle=INK;ctx.strokeText('?',x,y-14+b);ctx.fillStyle='#fff';ctx.fillText('?',x,y-14+b)}}
  catch(err){return _dt.apply(this,arguments)}}
  // the new body is bigger: the rocks near the chests go
  const _sp=spawnTwinChests;spawnTwinChests=function(){const r=_sp.apply(this,arguments);try{for(const c of G.cc||[])c.crush=G.rocks.filter(k=>!k.temp&&Math.hypot(k.x-c.x,k.y-c.y)<k.r+36)}catch(err){}return r}}
// ---- the entrance (2.8 s, the model's 'enter'), out of the wrong twin chest
if(MM2ON){const _bi=bossIntro;bossIntro=function(e,dt,a){if(e.type!=='mimic')return _bi.apply(this,arguments);
  const T=BOSS_INTRO.mimic;if(e.iT==null){e.iT=0;e._snW=1;const an=Math.atan2(e.y-P.y,e.x-P.x),q=b3spot(e.x+Math.cos(an)*50,e.y+Math.sin(an)*50,20);e.ix0=e.x;e.iy0=e.y;e.ix1=q.x;e.iy1=q.y}
  const t0=e.iT;e.iT+=dt;const t=e.iT,at=s=>t0<s*T&&t>=s*T;e.intro=Math.max(0,T-t);e.face=a;e.st='enter';e.z=0;e.hidden=false;e.alpha=1;
  // .00-.10 a hop back, away from you, like someone found out
  if(t<=.28){const u=C3.ez(Math.min(1,t/.28));e.x=e.ix0+(e.ix1-e.ix0)*u;e.y=e.iy0+(e.iy1-e.iy0)*u}
  for(const s of[.10,.25,.33,.41])if(at(s)){shake(2);sfx('boom',0,e.x);dustRing(e.x,e.y+6,6)}
  for(const s of[.46,.53])if(at(s))sfx('click',0,e.x);
  if(at(.62))sfx('mimicWake',1,e.x);if(at(.6))mmClink(e.x,.02);
  if(at(.82)){shake(4);dustRing(e.x,e.y,12);vib([40,30,60])}
  if(at(.84)){if(!b3say(e,'cry'))sfx('roar');shake(6);for(let i=0;i<3;i++)setTimeout(()=>{if(G&&G.fx)fxPush({k:'ring2',x:e.x,y:e.y-60,rgb:'255,230,170',r0:e.r,r1:e.r*5,t:.45,max:.45,w:6-i*1.5})},i*170)}
  if(e.intro<=0){e.z=0;e.si=-1;e.torn=1;mmWalk(e,.9)}}}
// what the model plays: the entrance over its whole length; every move on the brain's clock; the walk and the daze loop
if(MM2ON){const _nm=n3Move;n3Move=function(e){if(e.type==='mimic'){if(e.intro>0)return['enter',Math.min(.999,Math.max(0,(e.iT||0)/BOSS_INTRO.mimic))];
    if(e.st==='walk'||e.st==='retreat'){const D=B3D(e,'walk');return['walk',(((e.wt||0)%D)+D)%D/D]}
    if(e.st==='daze')return['daze',((e.mt||0)%1+1)%1];
    if(e.st&&N3.meta.mimic.an.includes(e.st))return[e.st,Math.min(.999,Math.max(0,b3k(e)))]}return _nm.apply(this,arguments)}}
// ---- the defeat (3.4 s, the model's 'die'): it loses its lid and spits its coins
if(MM2ON){const _sb=snapBoss;snapBoss=function(e){if(e.type==='mimic')return{live:1};return _sb.apply(this,arguments)}
  BDIE.mimic={setup(c){const e=c.e;const B=G.m2;if(B&&B.gulp)mmSpit(e,false);if(B){B.lane=null;B.tl=null;B.fan=null;B.clines=null;B.coins=[];B.rain=[];B.rainW=[];B.trap=null;B.drops=[];B.ask=null;B.shell=null}
      if(G.cc)G.cc=G.cc.filter(q=>q.st!=='m2');c.face=e.f3!=null?e.f3:(e.face||Math.PI/2);c.p2=!!e.p2;c.live=1;sfx('coin',0,c.x)},
    tick(c,dt,D){const t=c.t;if(t>=1.36&&!c.thud){c.thud=1;shake(4);sfx('boom',0,c.x);cpuff(c,c.x,c.y+4,LOWFX?5:10,'150,120,90')}
      if(t>=D.clou&&t<D.clou+1&&Math.random()<(LOWFX?.35:.8))cpart(c,{k:'coin',x:c.x+rand(-14,14),y:c.y-30,vx:rand(-90,90),vy:rand(-30,30),vz:rand(120,300),g:560,ph:rand(0,6),life:rand(1.2,1.9)});
      if(t>D.clou&&t<D.clou+.9&&Math.random()<.12)sfx('coin')},
    draw(c,D){const p=Math.min(.999,c.t/c.dur),M=N3.meta.mimic;try{N3.mimic(c.x,c.y+8,c.face,'die',p,(M&&M.sc)||1,{p2:c.p2,noFx:LOWFX,mat:mmMat(),torn:1})}catch(err){}}};
  const _dc=drawCorpse;drawCorpse=function(c){if(c.type!=='mimic')return _dc.apply(this,arguments);try{BDIE.mimic.draw(c,BDEATH.mimic)}catch(err){}drawParts(c)}}
// ---- the voice and the personality (88-boss3-voci.js): wood, teeth and coins, never horror
if(MM2ON){
  const ka=(n,t0,step,d,fa,fb,v,o)=>[...Array(n)].map((_,i)=>{const f=fa+(fb-fa)*i/Math.max(1,n-1);return{t:t0+i*step,d,f:[f*1.06,f*.94],v,a:1-i*.06,h:.3,...(o||{})}});
  B3VO.VB.mimic={base:{br:.35,ro:.45,ji:.12,lp:.5,hs:.2},k:{
    // a hollow roar that booms as in a barrel, the wood creaking before it
    cry:[[1.9,[{t:0,d:.32,noise:1,v:'r',a:.6,hs:.5},{t:.26,d:1.5,f:[96,150,104],v:['o','a','o','u'],ro:.7,h:.05,vib:[.03,5],rel:.4}],.64]],
    angry:[[1.8,[{t:0,d:.08,noise:1,v:'h',a:.9,hs:1},{t:.12,d:.08,noise:1,v:'h',a:.7,hs:1},{t:.26,d:1.4,f:[110,170,96],v:['a','o','a'],ro:.75,h:.05,vib:[.04,6],rel:.35}],.64]],
    // teeth that chatter «ka-ka-ka-ka»
    laugh:[[1,[...ka(5,0,.16,.12,300,250,'a',{ro:.35,h:.4}),{t:.82,d:.16,noise:1,v:'h',hs:.8,a:.5}],.5]],
    laugh2:[[1,[{t:0,d:.3,f:[180,200],v:'m',am:[.3,8]},{t:.38,d:.42,f:[200,260],v:'m',am:[.3,8],rel:.5}],.48]],
    hurt:[[.3,[{t:0,d:.06,noise:1,v:'o',a:.9},{t:.04,d:.24,f:[150,110],v:'o',ro:.5,h:.1}],.5]],
    c_chomp:[[.5,[{t:0,d:.06,noise:1,v:'h',hs:1,a:.8},{t:.06,d:.38,f:[150,190,120],v:['a','a'],ro:.8,h:.2}],.5]],
    c_tongue:[[.6,[{t:0,d:.5,noise:1,v:['i','u'],a:.9,hs:.6,gu:.6}],.46]],
    c_grab:[[.55,[{t:0,d:.22,f:[160,180],v:['n','a'],ro:.3},{t:.26,d:.24,f:[180,150],v:['a','m'],ro:.3}],.48]],
    c_spit:[[.6,[{t:0,d:.1,noise:1,v:'u',hs:.3},{t:.1,d:.45,f:[220,170],v:['e','a'],ro:.5,h:.1,gu:.4}],.5]],
    c_coins:[[.7,[{t:0,d:.62,f:[110,90],v:['o','u'],gu:.9,ro:.4}],.48]],
    c_leap:[[.3,[{t:0,d:.08,noise:1,v:'h',a:.8},{t:.06,d:.2,f:[240,300],v:'o',ro:.3}],.46]],
    c_hide:[[.8,[...ka(4,0,.14,.1,340,300,'i',{ro:.2,h:.5,a:.7})],.42]],
    die:[[2.3,[{t:0,d:1.9,f:[180,120,60],v:['a','o','u'],vib:[.05,3],rel:.6,br:.6,ro:.5}],.56]],
    win:[[1.3,[...ka(5,0,.22,.15,260,220,'a',{ro:.4,h:.45}),{t:1.1,d:.18,noise:1,v:'h',hs:.7,a:.5}],.52]]}};
  B3CUE.mimic={chomp:'c_chomp',tongue:'c_tongue',tongue3:'c_tongue',grab:'c_grab',coins:'c_coins'};
  // coins under its big voices, wood creaking under the cry and the rage
  {const _m=b3sayMore;b3sayMore=function(e,k,t){if(e.type!=='mimic')return _m.apply(this,arguments);try{if(['cry','angry','laugh','win','die','c_coins'].includes(k))for(let i=0;i<(k==='die'?7:3);i++)vBell(null,t+.08+i*(k==='die'?.16:.11),VR(96+i%3*3,.02),.25,.022);
    if(k==='cry'||k==='angry')M.wood(t+.02,.6,VR(180,.1))}catch(err){}}}
  // the «tin-tin» before each blow, when the model wakes the light (the first leap only for the Tagliola), on the boss's time
  {const _g=b3go;b3go=function(e,st){_g.apply(this,arguments);try{if(e.type!=='mimic'||e.intro>0)return;const T=MM2.tin[st];if(T)mmTin(e,T[0]*B3D(e,st),T[1]*B3D(e,st));
    if(st==='leap'&&(e.leapN===(e.p2?3:2)||e.leapN===1&&mmB().trap&&mmB().trap.noStuck)){mmTin(e,.02*B3D(e,st));b3say(e,'c_leap')}}catch(err){}}}
  // the voices get ready in the room of the twin chests (and at once when it is there)
  {const _br=buildRoom;buildRoom=function(){const r=_br.apply(this,arguments);try{if(typeof ccIsRoom==='function'&&ccIsRoom()&&G.ccDone!==G.room||G&&(G.enemies||[]).some(q=>q.type==='mimic'))B3VO.prep('mimic')}catch(err){}return r}}
  {const _st=spawnTwinChests;spawnTwinChests=function(){const r=_st.apply(this,arguments);try{B3VO.prep('mimic')}catch(err){}return r}}
  {const _s=BDIE.mimic.setup;BDIE.mimic.setup=function(c){_s.apply(this,arguments);b3say(c,'die')}}}
// ---- for the previews (anteprime/mk_boss2.py) and the tests (tests/boss2gioco.js)
if(MM2ON){const R=window.BCL||(window.BCL={});R.mimic={n:'Il Mimic',arena:0,p2:true,sub:'Arena 1 · la cassa sbagliata',
  enter(o){G.arena=0;G.chapter=ARENAS[0].ch;G.diff=ARENAS[0].diff;G.bossLvl=null;G.room=4;G.event=null;buildRoom();G.enemies=[];G.eproj=[];G.lines=[];G.state='cleared';G.door=false;
    if(o&&o.casse){G.clearT=0;G.ccChosen=false;spawnTwinChests();return}
    const m=makeE('mimic',AW/2,TOP+(BOT-TOP)*.45,0);m.hp=m.max=Math.round(900*(1+(effRoom()-1)*.14));m.intro=BOSS_INTRO.mimic;G.enemies.push(m);G.state='play';G.door=false;
    bossBarReset();$('bossBar').hidden=false;$('bossBar').classList.remove('rage');$('bossName').textContent=ET.mimic.name;banner(ET.mimic.name,ET.mimic.title,2);bmIn('mimic');B3VO.prep('mimic')},
  moves:['chomp','coins','tongue','leap','stuck','grab','gulp'],moves2:['rage','hide','chest','pop','daze','tongue3'],
  hz(){const B=G.m2||{};return{avvisi:(B.warn||[]).length,corsia:B.lane?1:0,linee:(B.tl||[]).length+(B.clines||[]).length,ventaglio:B.fan?1:0,cerchi:(B.rainW||[]).length+(B.drops||[]).length+(B.trap?1:0),
    monete_in_volo:(B.coins||[]).length+(B.rain||[]).length,monete_a_terra:(B.floor||[]).length,casse_finte:(G.cc||[]).filter(c=>c.st==='m2').length,inghiottito:B.gulp?1:0}},
  // in the tests the hero stands on it now and then (the Assaggio) and, in the chest game, walks to the real chest (the daze)
  hero(e){if(!e)return null;const B=G.m2||{};if(B.shell&&B.shell.ph==='choose')return{x:e.x,y:e.y};if(B.gulp)return null;
    const ph=Math.floor((G.t||0)/7)%4;return ph===2?{x:clamp(e.x+Math.cos(e.face||0)*55,L+30,R-30),y:clamp(e.y+Math.sin(e.face||0)*42,TOP+40,BOT-40)}:{x:AW/2,y:BOT-60}},
  voice:['cry','laugh','angry','die']}}
