// =====================================================================
// LA FENICE DELLA FORGIA RIFATTA: «la Fenice Imperiale» (Denis, 15 ottobre: «rivisita tutti i boss … possenti, belli, fighi, che diano
// timore nello sfidarli», «migliora anche le loro abilità speciali»; poi, visto il Golem, «sì, fai gli altri 12»). ANTEPRIMA: questo file
// e il modello sprite/nemici3d/phoenix2.js entrano solo nella copia del gioco fatta da anteprime/mk_boss2.py; nel gioco vero dopo il sì di
// Denis (il modello prende il posto di 'phoenix' e questo file va in src/ordine.txt). Design e numeri: docs/boss-classici.md.
// L'imperatrice di fuoco della Forgia degli Dei (arena 10). Nel petto il Cuore di Forgia batte due volte prima di ogni colpo e manda il
// fuoco lungo le penne fino al pezzo che colpirà (il suo avviso, come il cuore del Golem); man mano che perde vita le punte delle piume
// diventano cenere. Ogni stato ha il nome di una mossa del modello; il colpo vero parte nel suo fotogramma (b3at, 81-boss3-base.js). Mosse:
// - Ventaglio dell'Impero (fan): apre le ali dietro di sé come un ventaglio; otto raggi rossi sottili segnano le corsie delle penne
//   accese, due corsie restano scure (il varco). Le piume si fermano contro le incudini e restano piantate nei muri.
// - Picchiata della Cometa (dive): una striscia rossa da lei, attraverso di te, fino al muro (o fino a un'incudine), col cerchio d'arrivo;
//   sale, si chiude a cometa e si tuffa lasciando il fuoco. Contro un'incudine si schianta e resta a terra di più. Poi resta a terra
//   (grounded): i colpi fanno +50% («Fiamma bassa!»); si rialza (rise).
// - Ali dell'Impero (wings): plana verso di te; una mezzaluna rossa davanti a lei si riempie e lei chiude le ali come due falci di fuoco.
// - Ruota di Fiamme (sweep): lo strascico diventa una frusta che spazza il cerchio intorno a lei (il cerchio, la riga dove parte la
//   frusta, la freccia del verso), poi un anello di fuoco si allarga dai suoi piedi.
// - Pioggia di Braci (rain): in alto batte le ali tre volte; a ogni battuta cadono le penne accese su di te e in cerchio intorno a te.
// - Rinascita (rebirth, a metà vita): si spegne in un uovo di cenere che batte tre volte (non si può colpire), un anello rosso fin dove
//   arriva lo scoppio; rinasce azzurra (schegge e onda), da lì tutto 1,15 volte più rapido.
// - Fase 2: Sguardo del Giudizio (judge: un cerchio ti insegue, a ogni cenno della testa cade una colonna di fuoco azzurro dove sta),
//   Picchiata a V (dive e redive), Ventaglio doppio (fan2), Ali dell'Impero doppie (wings2), Ruota a due fruste, Pioggia a quattro ondate.
// Entrata (enter): l'ombra delle ali attraversa la stanza, scende in una colonna di fuoco, apre le ali e grida. Sconfitta (die): torna
// cenere, resta un uovo e ne esce un pulcino. Ogni danno ha un avviso rosso a terra di almeno 0,6 s veri, una mossa alla volta, un po' di
// volo tra una mossa e l'altra. Il suo tempo è quello del design, pensato per l'arena 10: il cervello toglie la velocità dei boss
// dell'arena (bossLvl) e nella fase 2 va 1,15 volte più svelto.
// =====================================================================
const PXON=typeof N3!=='undefined'&&!!N3.phoenix2;
const PXC={red:'229,72,77',fire:'255,140,50',hot:'255,225,150',blue:'120,200,255',bhot:'220,245,255',mint:'127,240,192',
  seq1:['fan','dive','wings','sweep','fan','rain'],seq2:['judge','dive','fan2','wings2','judge','sweep','rain'],
  // the double beat of the Heart of the Forge before each move (the model's own moments, A.beat)
  beat:{fan:[.01,.05],fan2:[0,.03],dive:[0,.04],redive:[.02],wings:[0,.04],wings2:[0,.025],sweep:[0,.04],rain:[0,.04],judge:[.02,.06]},
  // the states that are no attack: no charging ring round her when they start (51-boss2-mondi.js)
  calm:new Set(['grounded','rise','redive'])};
if(PXON){
  // the new model in place of the old one (its drawing of today stays as N3.meta.phoenix.old for the pages)
  const old=N3.phoenix,oldM=N3.meta.phoenix;N3.phoenix=N3.phoenix2;N3.meta.phoenix=Object.assign({},N3.meta.phoenix2,{old:(x,y,f,a,p)=>old(x,y,f,oldM.an.includes(a)?a:'idle',p,oldM.sc||1,{})});
  ET.phoenix.r=28;BOSS_INTRO.phoenix=3.4;Object.assign(BDEATH,{phoenix:{dur:4,clou:2.2,snd:'ignite'}});B2H.phoenix=96;delete ETELE.phoenix;
  // the model lifts itself (o.z); what the game passes to it: the dark lanes of the fans, the V of the dive, the anvil, the turn of the
  // wheel, the ash on the tips, the veil of the train when you stand on it
  N3G.zm.phoenix=1;N3G.wp.phoenix=e=>{const d=B3D(e,'walk');return(((e.wt||0)%d)+d)%d/d};
  N3G.opt.phoenix=e=>({gap:e.gap3!=null?e.gap3:-1,gap2:e.gap4!=null?e.gap4:-1,chain:!!e.chain3,anvil:e.anvil3?1:0,dir:e.sdir||1,ash:pxAsh(e),veil:e.veil3||0});
  {const b=BEST.find(q=>q[0]==='phoenix');if(b)b[2]="Boss. Ventagli di piume con un varco, picchiata da cometa (attirala contro un'incudine!), ali che tagliano davanti a sé, coda che spazza in cerchio, pioggia di braci a ondate. A metà vita rinasce dall'uovo, azzurra, e ti giudica con colonne di fuoco."}}
// ---- helpers
// the model's own drawings of the pieces of its attacks (design: Feather, Ember, Shard (x,y,z,a,sc,o), Shadow (x,y,a,k,sc)) and its numbers
const pxa=n=>N3['phoenix'+n]||N3['phoenix2'+n]||null;
function pxI(){return Object.assign({lanes:10,laneDeg:12,fanShot:.5,fan2Shot:[.36,.72],rain:[.24,.48,.72],rain2:[.22,.38,.54,.7],judge:[.25,.42,.59]},pxa('Info')||{})}
function pxSweep(p,p2){const F=pxa('Sweep');if(F){try{const r=F(p,p2);if(r&&isFinite(r.a))return r}catch(err){}}const u=pxEz((p-.3)/.5);return{a:TAU*u,r0:30,r1:p2?150:135,on:p>=.3&&p<.8}}
function pxEz(u){u=clamp(u,0,1);return u*u*(3-2*u)}
// her own pace: the arena's boss speed taken out (her moments are made for the Forge of the Gods), 1.15 times faster once reborn
function pxSp(e){return e.p2&&!e.rb?1.15:1}
const pxReal=(e,f,st)=>f*B3D(e,st||e.st)/pxSp(e);
// the camera of the models squashes the floor (y·K). The face that makes her look straight at a point of the room; a point of the room in
// her body's floor (distance, angle: the floor of the model, where her train and her whip lie); a point of that floor back on the screen
let pxKv=.55,pxKt=-1;function pxK(){const t=G&&G.t||0;if(t!==pxKt){pxKt=t;try{pxKv=C3.V(0).P([0,1,0])[1]||.55}catch(err){pxKv=.55}}return pxKv}
function pxFace(a){return Math.atan2(Math.sin(a)/pxK(),Math.cos(a))}
function pxBody(e,x,y){const dx=x-e.x,dy=(y-e.y)/pxK();return[Math.hypot(dx,dy),Math.atan2(dy,dx)]}
function pxOut(x,y,ang,r){return[x+Math.cos(ang)*r,y+Math.sin(ang)*r*pxK()]}
// how much of the tips of her feathers is ash: the health lost in this phase
function pxAsh(e){const m=e.max||1;return .35*clamp(e.p2?(m/2-e.hp)/(m/2):(m-e.hp)/(m/2),0,1)}
const pxBoss=()=>G&&G.enemies?G.enemies.find(q=>q.type==='phoenix'&&!q.dead):null;
function pxReset(){if(G)G.ph={warn:[],embers:[],locks:[],cols:[],stuck:[],pins:[],chase:null,whip:null,glow:0,duck:0,sing:0}}
{const _br=buildRoom;buildRoom=function(){if(G&&G.ph&&G.ph.duck)duckMusic(1);pxReset();return _br.apply(this,arguments)}}
// a fire on the floor: at most 14 at a time (the oldest goes out); blue after the rebirth
function pxZone(x,y,r,t,blue){const F=G.zones.filter(z=>z.kind==='fire');if(F.length>=14)G.zones.splice(G.zones.indexOf(F[0]),1);G.zones.push({x,y,r,t,max:t,kind:'fire',pxb:blue?1:0})}
// flying between two moves (real seconds); the flight's wing beat starts again from the top
function pxWalk(e,real){e.wt=0;e.z=0;e.air=0;e.anchor=null;b3go(e,'walk',(real!=null?real:e.p2?rand(.7,1):rand(1,1.4))*pxSp(e))}
// the ten lanes of the fan in her body (θi = (i − 4.5)·12°, from her right to her left; the model's own long primaries), on the screen
// through the model's camera. The design's 6°·s that puts one lane on you is a turn of her whole body (pxFanFace), so the lanes of the
// game and the feathers of the model are the same
function pxLanes(e,f,gap){const I=pxI(),n=I.lanes||10,dg=(I.laneDeg||12)*Math.PI/180,o=[];
  for(let i=0;i<n;i++){const th=(i-(n-1)/2)*dg,q=b3pt(e,100*Math.cos(th),100*Math.sin(th),f);o.push({i,th,a:Math.atan2(q.y-(e.y+8),q.x-e.x),dark:gap>=0&&(i===gap||i===gap+1)})}return o}
const pxFanFace=(e,a)=>pxFace(a)+e.fs*(pxI().laneDeg||12)*Math.PI/360;
// the gap: two dark lanes next to the one that points at you (g = h−2 or h+1 most of the times, h−3 or h+2 the others), never too
// near the gap of the fan before (avoid)
function pxGap(h,n,avoid){const ok=g=>g>=0&&g<=n-2&&(avoid==null||avoid<0||Math.abs(g-avoid)>=2);let c=(Math.random()<.7?[h-2,h+1]:[h-3,h+2]).filter(ok);
  if(!c.length)c=[h-2,h+1,h-3,h+2,h-4,h+3].filter(ok);return c.length?pk(c):clamp(h+1,0,n-2)}
// the red rays on the lanes that will fly (the path of the feathers' hitbox: from the chest, 24 px over the floor point), 300 long or a
// little past you if you are farther
function pxRays(e,lanes,t){const o=b3pt(e,14,0,e.face),len=clamp(Math.hypot(P.x-o.x,P.y-o.y+24)+80,300,520);for(const l of lanes)if(!l.dark)G.ph.warn.push({k:'ray',x:o.x,y:o.y-24,a:l.a,len,w:5,t,max:t})}
function pxFanShot(e,lanes,two){const o=b3pt(e,14,0,e.face);for(const l of lanes)if(!l.dark)shootE(o.x,o.y-30,l.a,two?240:220,6,two?14:13,two?'pfeatherb':'pfeather');
  sfx('dash',0,e.x);shake(2);if(!LOWFX)fxPush({k:'ring2',x:o.x,y:o.y-40,rgb:e.p2?PXC.bhot:PXC.hot,r0:10,r1:60,t:.25,max:.25,w:4})}
// the line of a dive: from her, through the point (tx,ty), on to the wall (at most 440 px); it stops in front of an obstacle (an anvil)
function pxLine(e,tx,ty){const a=Math.atan2(ty-e.y,tx-e.x),ca=Math.cos(a),sa=Math.sin(a),m=e.r*.7;let s=0,an=null;
  for(;s<440;s+=4){const x=e.x+ca*(s+4),y=e.y+sa*(s+4);if(x<L+m||x>R-m||y<TOP+m||y>BOT-m)break;const k=G.rocks.find(k=>!k.temp&&Math.hypot(k.x-x,k.y-y)<k.r+m);if(k){an=k;break}}
  return{sx:e.x,sy:e.y,ex:e.x+ca*s,ey:e.y+sa*s,ang:a,len:s,anvil:an}}
// its warning: the band fills from a0 to a1 (the dive starts) and stays until a2 (the arrival), with the arrival circle unless it turns
// in the air (the V) or ends against an anvil (then the anvil is ringed in red)
function pxDiveWarn(e,D,a0,a1,a2,st,noArrive){const t=pxReal(e,a2-a0,st),fill=pxReal(e,a1-a0,st);G.ph.warn.push({k:'dive',x:D.sx,y:D.sy,a:D.ang,len:D.len,w:36,t,max:t,fill,p2:!!e.p2,
  ex:D.ex,ey:D.ey,arrive:noArrive||D.anvil?0:56,anvil:D.anvil||null})}
// the height of the comet in its dive: steep first, then it skims the floor
const pxDz=(z0,z1,u)=>z1+(z0-z1)*(1-pxEz(u/.5));
function pxLand(e,D){const p2=!!e.p2;
  if(D.anvil){const k=D.anvil;b3fx(e,'fanvil',(e.x+k.x)/2,(e.y+k.y)/2,k);G.hitstop=Math.max(G.hitstop||0,.06);sfx('boom',0,e.x);vib([40,30,60]);
    fxPush({k:'flash',x:e.x,y:e.y-30,r:70,rgb:'255,250,230',t:.2,max:.2})}
  else{if(Math.hypot(P.x-e.x,P.y-e.y)<56+P.r*.4&&P.inv<=0&&P.dashT<=0)hurtP(Math.round(18*DMG()));
    vfxBlast(e.x,e.y,p2?PXC.blue:PXC.fire,80,{fire:B3N(10),sparks:B3N(14),dust:8,ring2:false});stamp('scorch',e.x,e.y,26);shake(6);sfx('boom',0,e.x)}
  b3fx(e,'fdive',0,0,D)}
// the crescent of the Wings: centred on her, 200° wide, toward you; it fills for t seconds
function pxCres(e,x,y,t){let a=Math.atan2(P.y-y,P.x-x);if(Math.hypot(P.x-x,P.y-y)<4)a=Math.atan2(Math.sin(e.face)*pxK(),Math.cos(e.face));
  const c={k:'cres',x,y,r:150,a,span:200*Math.PI/180,t,max:t,p2:!!e.p2};G.ph.warn.push(c);return c}
function pxCresHit(e,c){const dx=P.x-c.x,dy=P.y-c.y,dd=Math.hypot(dx,dy);
  if(dd<156&&(dd<8||Math.abs(angDiff(c.a,Math.atan2(dy,dx)))<=c.span/2)&&P.inv<=0&&P.dashT<=0)hurtP(Math.round(24*DMG()));
  const rgb=e.p2?PXC.blue:PXC.fire;if(!LOWFX)for(let i=0;i<=12;i++){const a=c.a-c.span/2+c.span*i/12,r=rand(80,140);fxPush({k:'firep',x:c.x+Math.cos(a)*r,y:c.y+Math.sin(a)*r,vx:-Math.cos(a)*40,vy:-Math.sin(a)*40-30,r:rand(7,12),t:.45,max:.45})}
  fxPush({k:'flash',x:c.x+Math.cos(c.a)*30,y:c.y+Math.sin(c.a)*30-40,r:60,rgb:e.p2?PXC.bhot:PXC.hot,t:.18,max:.18});shake(5);sfx('ignite',1,c.x);sfx('dash',0,c.x)}
// a wave of the Rain: an ember on you and five in a ring round you (the last of the second phase: a huge one, the ring wider); they fall
// from the tips of her wings, three from each, and land after the meteor's 1.05 s
function pxRainWave(e,big){const p2=!!e.p2,cx=clamp(P.x,L+20,R-20),cy=clamp(P.y,TOP+20,BOT-20),T=[{x:cx,y:cy,r:big?56:30,dmg:big?20:16}],R0=big?150:130,o=rand(0,TAU);
  for(let j=0;j<5;j++){const an=o+j*TAU/5;T.push({x:cx+Math.cos(an)*R0,y:cy+Math.sin(an)*R0,r:22,dmg:14})}
  T.forEach((q,j)=>{const w=b3pt(e,-6,(j%2?1:-1)*82,e.face);G.ph.embers.push({x0:w.x,y0:w.y,tx:clamp(q.x,L+16,R-16),ty:clamp(q.y,TOP+16,BOT-16),r:q.r,dmg:q.dmg,t:0,dur:1.05,p2,big:big&&!j,lead:!j,
    spin:rand(0,TAU),vs:rand(5,8)*(Math.random()<.5?-1:1)})});sfx('incoming',0,e.x)}
// the start of each move: where it aims, where it glides, what the game passes to the model
function pxBegin(e,nx){const a=Math.atan2(P.y-e.y,P.x-e.x),d=Math.hypot(P.x-e.x,P.y-e.y);e.face=pxFace(a);
  if(nx==='fan'||nx==='fan2'){e.fs=Math.random()<.5?1:-1;e.face=pxFanFace(e,a);e.gap3=-1;e.gap4=-1;e.fl=null;e.fl2=null}
  else if(nx==='dive'){e.chain3=e.p2?1:0;e.anvil3=0;e.dv=null;e.cHit=0;e.trS=-1}
  else if(nx==='wings'||nx==='wings2'){const mv=d>110?Math.min(100,d-110):0,q=b3spot(e.x+Math.cos(a)*mv,e.y+Math.sin(a)*mv,16);e.wq={x0:e.x,y0:e.y,x:q.x,y:q.y};
    e.face=pxFace(Math.atan2(P.y-q.y,P.x-q.x));e.cr=null;e.cr2=null}
  else if(nx==='sweep'){const mv=clamp(d-100,-120,120),q=b3spot(e.x+Math.cos(a)*mv,e.y+Math.sin(a)*mv,16),f=pxFace(Math.atan2(P.y-q.y,P.x-q.x));e.wq={x0:e.x,y0:e.y,x:q.x,y:q.y};
    e.face=f;e.sdir=Math.random()<.5?1:-1;e.sw0=e.p2?[f+Math.PI/2,f-Math.PI/2]:[f+Math.PI];e.swA=0;e.swHit=0;
    const t=pxReal(e,.8,'sweep');G.ph.warn.push({k:'sweep',x:q.x,y:q.y,r:e.p2?160:140,s0:e.sw0.slice(),dir:e.sdir,t,max:t})}
  b3go(e,nx)}
// ---- the brain
if(PXON)EUPD.phoenix=function(e,dt,sm,a,d){const bl=(G.bossLvl||(G.bossLvl=bossLvl())).spd||1,rdt=dt/bl,mdt=rdt*pxSp(e);
  if(!G.ph)pxReset();const B=G.ph;
  pxVeil(e,rdt);
  // half health: the rebirth (once), whatever it is doing; in the middle of a dive it waits until it lands
  if(!e.reborn&&e.hp<e.max*.5&&!((e.st==='dive'||e.st==='redive')&&b3k(e)>=.12&&b3k(e)<.8)){pxRebirth(e);return}
  b3tick(e,mdt);const k=b3k(e),fa=pxFace(a);
  switch(e.st){
  case 'enter':pxWalk(e,.9);e.si=-1;break;
  // ---- flying round you at half distance, 16 over the floor, a slow mighty wing beat per cycle
  case 'walk':{e.air=0;e.z=0;e.moving=true;e.face=fa;const w0=e.wt||0;e.wt=w0+mdt;const wd=B3D(e,'walk'),ph0=(w0%wd)/wd,ph1=(e.wt%wd)/wd;
    if((w0===0||ph1<ph0)&&AU.ctx&&AU.on.sfx&&AU.ctx.state==='running'){const v=Math.max(.4,enemyAt(e));whoosh(AU.ctx.currentTime+.01,.42,170,620,.035*v,.2);AU.pan=0}
    if(ph0<.38&&ph1>=.38&&!LOWFX)for(let i=0;i<3;i++){const an=rand(0,TAU);fxPush({k:'puff',x:e.x+Math.cos(an)*14,y:e.y+4,vx:Math.cos(an)*50,vy:Math.sin(an)*20,t:.4,r:rand(4,6)})}
    if(!e.anchor||Math.hypot(e.anchor.x-P.x,e.anchor.y-P.y)<130){const an=Math.atan2(e.y-P.y,e.x-P.x)+rand(-1,1),r=rand(170,240);e.anchor=b3spot(P.x+Math.cos(an)*r,P.y+Math.sin(an)*r*.8,40)}
    const dx=e.anchor.x-e.x,dy=e.anchor.y-e.y,dd=Math.hypot(dx,dy),st=(e.p2?110:90)*rdt;if(dd>2)moveCircle(e,dx/dd*Math.min(dd,st),dy/dd*Math.min(dd,st),true);
    if(e.stT<=0){const seq=e.p2?PXC.seq2:PXC.seq1;e.si=(e.si==null?-1:e.si)+1;pxBegin(e,seq[e.si%seq.length])}
    break}
  // ---- the mocking gesture (88-boss3-voci.js starts it): it lands, looks down its beak at you, then flies again
  case 'taunt':{e.moving=false;e.air=0;e.z=0;e.face=fa;if(e.stT<=0)pxWalk(e,rand(.3,.55));break}
  // ---- VENTAGLIO: the lanes light up and the rays show them (.05; the double fan .02 and, aimed where you are now, .40); the feathers
  // fly at .50 (.36 and .72)
  case 'fan':case 'fan2':{e.moving=false;e.air=0;e.z=0;const two=e.st==='fan2',I=pxI(),n=I.lanes||10,h=e.fs>0?n/2-1:n/2,F2=I.fan2Shot||[.36,.72];
    const aimA=two?.02:.05,shotA=two?F2[0]:(I.fanShot||.5),aimB=.40,shotB=F2[1];
    if(k<aimA||two&&k>=shotA&&k<aimB)e.face=pxFanFace(e,a);
    if(b3at(e,aimA)){e.face=pxFanFace(e,a);e.gap3=pxGap(h,n);e.fl=pxLanes(e,e.face,e.gap3);pxRays(e,e.fl,pxReal(e,shotA-aimA))}
    if(b3at(e,shotA)&&e.fl){pxFanShot(e,e.fl,two);b3fx(e,'ffeathers')}
    if(two&&b3at(e,aimB)){e.face=pxFanFace(e,a);e.gap4=pxGap(h,n,e.gap3);e.fl2=pxLanes(e,e.face,e.gap4);pxRays(e,e.fl2,pxReal(e,shotB-aimB))}
    if(two&&b3at(e,shotB)&&e.fl2){pxFanShot(e,e.fl2,true);b3fx(e,'ffeathers')}
    if(e.stT<=0){e.gap3=e.gap4=-1;e.fl=e.fl2=null;pxWalk(e)}break}
  // ---- PICCHIATA: the line (.05), up with two great beats (.12-.30, 260 over the floor), the comet holds (.30-.42), the dive along the
  // line (.42-.62) with its fire, the landing (or the anvil); in the second phase she brakes in the air at the end and dives again (redive)
  case 'dive':case 'redive':{e.moving=false;const re=e.st==='redive',D=e.dv,hold=!re&&!!e.chain3&&!(D&&D.anvil),t0=re?.45:.42;
    e.air=(re?k<.8:k>=.12&&k<.8)?1:0;
    if(!re&&k<.05)e.face=fa;
    // (a line that ends against an anvil is no V: it crashes there)
    if(!re&&b3at(e,.05)){const N=e.dv=pxLine(e,clamp(P.x,L+20,R-20),clamp(P.y,TOP+20,BOT-20));e.face=pxFace(N.ang);if(N.anvil)e.chain3=0;e.trS=-1;e.cHit=0;
      pxDiveWarn(e,N,.05,t0,.62,'dive',!!e.chain3)}
    e.z=re?(k<t0?30:k<.62?pxDz(30,12,(k-t0)/(.62-t0)):k<.8?4:0)
      :k<.12?0:k<.3?260*pxEz((k-.12)/.18):k<t0?260:k<.62?pxDz(260,hold?30:12,(k-t0)/(.62-t0)):k<.8?4:0;
    if(!re&&(b3at(e,.16)||b3at(e,.24))){sfx('dash',0,e.x);shake(1.5)}
    if(b3at(e,t0)){sfx('incoming',0,e.x);if(!LOWFX)fxPush({k:'flash',x:e.x,y:e.y-e.z,r:40,rgb:'255,255,255',t:.15,max:.15})}
    if(D&&k>=t0&&k<.62){const u=(k-t0)/(.62-t0),s=pxEz(u)*D.len;e.x=D.sx+Math.cos(D.ang)*s;e.y=D.sy+Math.sin(D.ang)*s;
      // the trail of fire, a fire every 38 px where the comet skims the floor
      if(e.z<60){if(e.trS<0)e.trS=s-38;while(e.trS+38<=s){e.trS+=38;pxZone(D.sx+Math.cos(D.ang)*e.trS,D.sy+Math.sin(D.ang)*e.trS,17,e.p2?3:2.2,e.p2)}}
      if(!LOWFX&&Math.random()<.8)fxPush({k:'firep',x:e.x+rand(-10,10),y:e.y-e.z+rand(-8,8),r:rand(7,12),t:.4,max:.4});
      if(!e.cHit&&e.z<90&&Math.hypot(P.x-e.x,P.y-e.y)<26&&P.inv<=0&&P.dashT<=0){e.cHit=1;hurtP(Math.round(22*DMG()))}}
    if(D&&b3at(e,.62)){e.x=D.ex;e.y=D.ey;
      if(hold){// the V: it brakes in the air at 30, turns on you and dives again along a new line, from where it is
        for(let s=0;s<=D.len;s+=38)ENV2.burnGrass(D.sx+Math.cos(D.ang)*s,D.sy+Math.sin(D.ang)*s,26);
        const N=e.dv=pxLine(e,clamp(P.x,L+20,R-20),clamp(P.y,TOP+20,BOT-20));e.face=pxFace(N.ang);e.trS=-1;e.cHit=0;e.chain3=0;
        pxDiveWarn(e,N,0,.45,.62,'redive');b3go(e,'redive');e.z=30;break}
      // the model hears of the anvil when it crashes into it
      e.anvil3=D.anvil?1:0;moveCircle(e,0,0);pxLand(e,D);e.gT=(D.anvil?(e.p2?1.4:1.6):(e.p2?.9:1.1))*pxSp(e)}
    if(e.stT<=0){e.z=0;e.air=0;e.dv=null;e.anvil3=0;e.chain3=0;b3go(e,'grounded',e.gT||1.1)}
    break}
  // ---- on the floor, out of breath: the heart is bare (the blows hurt more, hurtE below), then it gets up
  // (its fire is out: touching it does not burn, e.air keeps the contact off)
  case 'grounded':{e.moving=false;e.air=1;e.z=0;if(e.stT<=0)b3go(e,'rise');break}
  case 'rise':{e.moving=false;e.air=1;e.z=0;if(e.stT<=0)pxWalk(e);break}
  // ---- ALI DELL'IMPERO: it glides toward you, the crescent (.06; the double .04 and, toward you, .42), the wings shut (.52; .38 and .80)
  case 'wings':case 'wings2':{e.moving=false;e.air=0;e.z=0;const two=e.st==='wings2',W=e.wq,g1=two?.25:.2;
    if(W&&k<g1+.03){const u=pxEz(k/g1);e.x=W.x0+(W.x-W.x0)*u;e.y=W.y0+(W.y-W.y0)*u}
    const w1=two?.04:.06,h1=two?.38:.52,w2=.42,h2=.8;
    if(b3at(e,w1)){e.cr=pxCres(e,W?W.x:e.x,W?W.y:e.y,pxReal(e,h1-w1));e.face=pxFace(e.cr.a)}
    if(b3at(e,h1)&&e.cr){pxCresHit(e,e.cr);b3fx(e,'fwings',e.cr.x,e.cr.y)}
    if(two&&b3at(e,w2))e.cr2=pxCres(e,e.x,e.y,pxReal(e,h2-w2));
    if(two&&k>=.45&&k<.6&&e.cr2)e.face=pxFace(e.cr2.a);
    if(two&&b3at(e,h2)&&e.cr2){pxCresHit(e,e.cr2);b3fx(e,'fwings',e.x,e.y)}
    if(e.stT<=0){e.cr=e.cr2=null;pxWalk(e)}break}
  // ---- RUOTA DI FIAMME: it glides near you (.00-.15), the train becomes a whip (two in the second phase) and spins all round (.30-.80),
  // then a ring of fire from its feet (.84)
  case 'sweep':{e.moving=false;e.air=0;e.z=0;const W=e.wq,p2=!!e.p2;
    if(W&&k<.18){const u=pxEz(k/.15);e.x=W.x0+(W.x-W.x0)*u;e.y=W.y0+(W.y-W.y0)*u}
    if(b3at(e,.3)){const t=pxReal(e,.56);B.warn.push({k:'ring',x:e.x,y:e.y,r:p2?260:190,t,max:t});sfx('dash',0,e.x)}
    if(k>=.3&&k<.8){const S=pxSweep(k,p2),a1=S.a;
      if(!e.swHit&&P.inv<=0&&P.dashT<=0){const[db,ph]=pxBody(e,P.x,P.y);if(db>18&&db<S.r1+12){const tol=Math.atan2(12,Math.max(db,1)),span=Math.abs(a1-e.swA);
        for(const s0 of e.sw0){const rel=angDiff(s0+e.sdir*e.swA,ph)*e.sdir;if(rel>=-tol&&rel<=span+tol){e.swHit=1;hurtP(Math.round(18*DMG()));break}}}}
      if(Math.floor(a1/2.4)>Math.floor(e.swA/2.4)&&AU.ctx&&AU.on.sfx&&AU.ctx.state==='running'){whoosh(AU.ctx.currentTime+.01,.35,250,1100,.06,.25)}
      e.swA=a1;B.whip={x:e.x,y:e.y,a:e.sw0.map(s0=>s0+e.sdir*a1),r0:S.r0,r1:S.r1,p2};
      if(!LOWFX&&Math.random()<.5)for(const A of B.whip.a){const[x,y]=pxOut(e.x,e.y,A,rand(S.r0,S.r1));fxPush({k:'firep',x,y,vx:rand(-10,10),vy:-30,r:rand(5,9),t:.35,max:.35})}}
    else B.whip=null;
    if(b3at(e,.84)){G.waves.push({x:e.x,y:e.y,r:e.r,max:p2?260:190,dmg:Math.round((p2?14:12)*DMG()),hit:false,rgb:p2?PXC.blue:'255,140,40'});
      fxPush({k:'ring2',x:e.x,y:e.y-12,rgb:p2?PXC.bhot:'255,170,70',r0:12,r1:70,t:.35,max:.35,w:6});sfx('ignite',0,e.x);shake(4);b3fx(e,'fvortex',e.x,e.y);
      if(BOSS2){const K=pxK();for(let i=0;i<8;i++){const an=i/8*TAU+rand(-.15,.15);b3mark('ash',e.x+Math.cos(an)*120,e.y+Math.sin(an)*120*K,rand(9,13))}}}
    if(e.stT<=0){B.whip=null;pxWalk(e)}break}
  // ---- PIOGGIA DI BRACI: up high (the model; the game keeps it on the floor, so it can be hit), a wave at every beat of the wings
  case 'rain':{e.moving=false;e.air=1;e.z=0;e.face=fa;const I=pxI(),Lw=(e.p2?I.rain2:I.rain)||[.24,.48,.72];
    for(let i=0;i<Lw.length;i++)if(b3at(e,Lw[i])){pxRainWave(e,e.p2&&i===Lw.length-1);b3say(e,'c_rain',true);sfx('dash',0,e.x);shake(1.5)}
    if(b3at(e,.97)){dustRing(e.x,e.y,10);shake(2)}
    if(e.stT<=0){e.air=0;pxWalk(e)}break}
  // ---- SGUARDO DEL GIUDIZIO (second phase): a circle runs from its feet to you and chases you (slower than you); at every nod a circle
  // stays where it is, flashes 0.62 s and a column of blue fire falls on it
  case 'judge':{e.moving=false;e.air=0;e.z=0;if(k<.8)e.face=fa;const N=pxI().judge||[.25,.42,.59];
    if(b3at(e,.15))B.chase={x:e.x,y:e.y+4};
    if(B.chase&&k<.7){const c=B.chase,dx=P.x-c.x,dy=P.y-c.y,dd=Math.hypot(dx,dy);if(dd>1){const st=Math.min(dd,clamp(2.6*(dd-40),100,380)*rdt);c.x+=dx/dd*st;c.y+=dy/dd*st}}
    for(const c of N)if(b3at(e,c)&&B.chase){B.locks.push({x:B.chase.x,y:B.chase.y,t:.62,max:.62});sfx('click',0,e.x);if(AU.ctx&&AU.on.sfx&&AU.ctx.state==='running')vBell(null,AU.ctx.currentTime+.01,86,.9,.025)}
    if(b3at(e,.7))B.chase=null;
    if(e.stT<=0){B.chase=null;pxWalk(e)}break}
  // ---- RINASCITA: the egg of ash (.28-.64, it beats at .36, .46, .56), it bursts (.64): shards, a blue wave, the second phase; the cry (.84)
  case 'rebirth':{e.moving=false;e.z=0;e.face=fa;e.air=k<.7?1:0;if(k>=.7&&e.shell>0)e.shell=0;
    if(b3at(e,.28)){const t=pxReal(e,.36);B.warn.push({k:'egg',x:e.x,y:e.y,r:240,t,max:t});duckMusic(.45);B.duck=1;b3fx(e,'fegg')}
    for(const c of[.36,.46,.56])if(b3at(e,c)){shake(2);if(AU.ctx&&AU.on.sfx&&AU.ctx.state==='running'){const v=Math.max(.55,enemyAt(e));fThump(AU.ctx.currentTime+.01,52,34,.22,.3*v);AU.pan=0}
      if(c===.36)b3say(e,'c_egg',true);if(!LOWFX)fxPush({k:'ring2',x:e.x,y:e.y-26,rgb:c<.5?'255,200,90':PXC.blue,r0:22,r1:44,t:.25,max:.25,w:3})}
    if(k>=.3&&k<.64&&!LOWFX&&Math.random()<.35){const an=rand(0,TAU);fxPush({k:'spore',x:e.x+Math.cos(an)*40,y:e.y+Math.sin(an)*22,vx:-Math.cos(an)*30,vy:-60,t:.6,max:.6,r:3,rgb:PXC.mint})}
    if(b3at(e,.64)){e.p2=true;banner('La Fenice rinasce','Fase 2',1.6);bossRage(e,PXC.blue);$('bossBar').classList.add('rage');shake(9);sfx('boom',0,e.x);vib([60,40,100]);
      for(let i=0;i<16;i++)shootE(e.x,e.y-20,i*TAU/16,140,7,12,'pshard');G.waves.push({x:e.x,y:e.y,r:16,max:240,dmg:Math.round(14*DMG()),hit:false,rgb:PXC.blue});
      vfxBlast(e.x,e.y-20,'150,220,255',120,{fire:B3N(16),sparks:B3N(20),spcol:['#ffffff','#9fe0ff','#3a8ae8'],dust:10});fxPush({k:'flash',x:e.x,y:e.y-30,r:120,rgb:'230,248,255',t:.3,max:.3});
      if(B.duck){B.duck=0;duckMusic(1)}b3fx(e,'freborn',e.x,e.y)}
    if(b3at(e,.84))b3say(e,'angry');
    // reborn it does not stop to mock you: straight to the judgement
    if(e.stT<=0){e.rb=0;e.shell=0;e.air=0;e.si=-1;const S=e.b3s||(e.b3s={});S.tauntT=(G.t||0)+5;S.pend=0;pxWalk(e,.8)}
    break}
  default:pxWalk(e)}};
// the train on the floor turns see-through when you stand on it, behind her (in the floor of the model: 115 px, ±35°)
function pxVeil(e,rdt){const[db,ph]=pxBody(e,P.x,P.y),on=db<(e.p2?125:115)&&Math.abs(angDiff(e.face+Math.PI,ph))<.61?1:0,v=e.veil3||0;e.veil3=v+clamp(on-v,-rdt*5,rdt*5)}
// the rebirth starts: the fires go out, the shots in flight and the warnings go; it cannot be hit while it is an egg
function pxRebirth(e){e.reborn=1;e.rb=1;e.z=0;e.air=1;e.moving=false;e.shell=99;e.chain3=0;e.anvil3=0;e.gap3=e.gap4=-1;e.dv=null;e.cr=e.cr2=null;
  G.zones=G.zones.filter(z=>z.kind!=='fire');G.eproj=[];G.lines=[];G.meteors=[];if(G.b3)G.b3.warn=[];const du=G.ph&&G.ph.duck;pxReset();G.ph.duck=du;
  b3go(e,'rebirth');sfx('ignite',2,e.x)}
// the blows on the bare heart hurt more (and the first time in the run, the words); the egg cannot be hurt
{const _h=hurtE;hurtE=function(e,d){if(PXON&&e&&e.type==='phoenix'&&!e.dead){
  if(e.shell>0){if(!(e._shF>(G.t||0)-.12)){e._shF=G.t||0;G.fx.push({k:'spark',x:e.x+rand(-16,16),y:e.y-24-rand(0,26),t:.15})}return}
  if(e.st==='grounded'){const A=[...arguments];A[1]=d*1.5;if(!G.pxTxt){G.pxTxt=1;text(e.x,e.y-110,'Fiamma bassa!','#ffd84a',18)}return _h.apply(this,A)}}return _h.apply(this,arguments)}}
// what the model plays: the entrance over its whole length, the flight on its own clock, the bare heart as a loop
if(PXON){const _nm=n3Move;n3Move=function(e){if(e.type!=='phoenix')return _nm.apply(this,arguments);
  if(e.intro>0)return['enter',Math.min(.999,Math.max(0,(e.iT||0)/BOSS_INTRO.phoenix))];
  if(e.st==='enter')return['enter',.999];
  const M=N3.meta.phoenix,an=M.an||[];
  if(e.st==='walk'&&e.wt!=null){const d=B3D(e,'walk');return['walk',(((e.wt%d)+d)%d)/d]}
  if(e.st==='grounded'&&an.includes('grounded')){const d=(M.dur&&M.dur.grounded)||1.1;return['grounded',((e.mt||0)/d)%1]}
  if(e.st&&e.st!=='walk'&&an.includes(e.st))return[e.st,Math.min(.999,Math.max(0,b3k(e)))];
  return _nm.apply(this,arguments)}}
// no charging ring for the states that are no attack; its embers from the whole of its height (blue once reborn), none from the egg
if(PXON){const _bf=b2front;b2front=function(e){if(e.type==='phoenix'&&PXC.calm.has(e.st))e._b2st=e.st;return _bf.apply(this,arguments)}
  const _au=b2aura;b2aura=function(e,dt){if(e.type!=='phoenix')return _au.apply(this,arguments);if((e.z||0)>40||e.rb&&b3k(e)<.64)return;
    if(b2every(e,'au',LOWFX?.2:.09,dt))b2emit(e,{k:'ember',x:e.x+rand(-30,30),y:e.y-(e.z||0)-rand(10,95),vx:rand(-10,10),vy:-rand(30,60),life:rand(.6,1.1),col:e.p2?PXC.blue:'255,140,50'})}}
// ---- the dangers in flight and on the floor (real time)
function pxUpdate(dt,pre){const B=G.ph;if(!B)return;
  if(G.state!=='play'){if(B.warn.length||B.embers.length||B.locks.length||B.chase||B.whip){const du=B.duck;pxReset();G.ph.duck=du}if(G.ph.duck){G.ph.duck=0;duckMusic(1)}return}
  for(let i=B.warn.length-1;i>=0;i--){B.warn[i].t-=dt;if(B.warn[i].t<=0)B.warn.splice(i,1)}
  B.glow=Math.max(0,B.glow-dt*2);B.sing-=dt;
  // the embers of the Rain land
  for(let i=B.embers.length-1;i>=0;i--){const m=B.embers[i];m.t+=dt;if(m.t<m.dur)continue;B.embers.splice(i,1);
    if(Math.hypot(P.x-m.tx,P.y-m.ty)<m.r+P.r*.5)hurtP(Math.round(m.dmg*DMG()));
    G.fx.push({k:'boom',x:m.tx,y:m.ty,t:.35,r:m.r*1.3});vfxBlast(m.tx,m.ty,m.p2?PXC.blue:PXC.fire,m.r*1.8,m.p2?{fire:B3N(5),sparks:B3N(8),spcol:['#ffffff','#9fe0ff'],dust:4,ring2:false}:{fire:B3N(5),sparks:B3N(8),dust:4,ring2:false});
    if(m.lead){shake(m.big?6:3);sfx('boom',0,m.tx)}stamp('scorch',m.tx,m.ty,m.r);pxZone(m.tx,m.ty,m.r*.7,1.6,m.p2);b3fx(pxBoss(),'frain',m.tx,m.ty,m.r)}
  // the gaze: the locked circles flash, then the column of blue fire falls
  for(let i=B.locks.length-1;i>=0;i--){const c=B.locks[i];c.t-=dt;if(c.t>0)continue;B.locks.splice(i,1);
    if(Math.hypot(P.x-c.x,P.y-c.y)<40&&P.inv<=0&&P.dashT<=0)hurtP(Math.round(22*DMG()));
    B.cols.push({x:c.x,y:c.y,t:.45,max:.45});vfxBlast(c.x,c.y,'140,210,255',60,{fire:B3N(8),sparks:B3N(12),spcol:['#ffffff','#9fe0ff','#3a8ae8'],dust:4,ring2:false});shake(4);sfx('boom',0,c.x);b3fx(pxBoss(),'fjudge',c.x,c.y)}
  for(let i=B.cols.length-1;i>=0;i--){B.cols[i].t-=dt;if(B.cols[i].t<=0)B.cols.splice(i,1)}
  for(const L0 of[B.stuck,B.pins])for(let i=L0.length-1;i>=0;i--){L0[i].t+=dt;if(L0[i].t>=L0[i].life)L0.splice(i,1)}
  // the feathers that have just gone: into a wall (they stay planted and burn), against an anvil (it sings)
  if(pre&&pre.length){const now=new Set(G.eproj);for(const q of pre){if(now.has(q))continue;
    if(q.x<L||q.x>R||q.y<TOP||q.y>BOT){if(B.stuck.length<24)B.stuck.push({x:clamp(q.x,L+1,R-1),y:clamp(q.y,TOP+1,BOT-1),a:q.a,t:0,life:1.2,p2:q.kind==='pfeatherb'})}
    else if(G.rocks.some(k=>Math.hypot(k.x-q.x,k.y-q.y)<k.r+q.r*.5+3)&&B.sing<=0){B.sing=.09;if(!LOWFX)for(let j=0;j<4;j++)G.fx.push({k:'spark',x:q.x+rand(-4,4),y:q.y+rand(-4,4),t:.22});
      if(AU.ctx&&AU.on.sfx&&AU.ctx.state==='running')vAnvil(null,AU.ctx.currentTime+.005,.045,VR(900,.12))}}}
  if(B.duck&&!G.enemies.some(q=>q.type==='phoenix'&&q.st==='rebirth'&&b3k(q)<.64)){B.duck=0;duckMusic(1)}}
{const _u=update;update=function(dt){const pre=PXON&&G&&G.ph&&G.eproj?G.eproj.filter(q=>q.kind==='pfeather'||q.kind==='pfeatherb'):null;_u.apply(this,arguments);
  try{if(PXON&&G&&G.ph&&started&&!paused)pxUpdate(dt,pre)}catch(err){console.error(err)}}}
// ---- the drawings: the model's own pieces if it has them, simple ones if not
function pxFeather(x,y,a,o){const F=pxa('Feather');if(F){try{F(x,y,0,a,1,o);return}catch(err){}}const k=o.stuck||0;ctx.save();ctx.globalAlpha*=1-clamp((k-.6)/.4,0,1);
  b3feather({x,y,a,r:6},o.p2?['#7fc8ff','#e8f8ff','#3a8ae8']:['#ff7a24','#ffd84a','#e8361c'],o.p2?PXC.blue:PXC.fire);ctx.restore()}
function pxEmber(x,y,z,a,o){const F=pxa('Ember');if(F){try{F(x,y,z,a,o.big?1.5:1,o);return}catch(err){}}const yy=y-z,r=o.big?7:4.5;if(!LOWFX)glow(o.p2?PXC.blue:PXC.fire,x,yy,r*3,.6);
  ink(1.4);circ(x,yy,r);fs(o.p2?'#9fe0ff':'#ffb347')}
function pxShadow(x,y,a,k){if(k<=0)return;const F=pxa('Shadow');if(F){try{F(x,y,a,k,1.4);return}catch(err){}}ctx.save();ctx.translate(x,y);ctx.rotate(a+Math.PI/2);ctx.fillStyle=`rgba(0,0,0,${.35*k})`;
  ctx.beginPath();ctx.ellipse(0,0,20,44,0,0,TAU);ctx.fill();for(const s of[-1,1]){ctx.beginPath();ctx.moveTo(0,-12);ctx.quadraticCurveTo(s*80,-46,s*150,8);ctx.quadraticCurveTo(s*72,10,0,22);ctx.closePath();ctx.fill()}ctx.restore()}
Object.assign(TRC,{pfeather:'255,150,60',pfeatherb:'120,200,255',pshard:'160,210,255'});
Object.assign(EPDRAW,{pfeather:p=>pxFeather(p.x,p.y,p.a,{p2:false}),pfeatherb:p=>pxFeather(p.x,p.y,p.a,{p2:true}),
  pshard:p=>{const A=pxa('Shard'),a=p.a+(G.t||0)*7;if(A){try{A(p.x,p.y,0,a,(p.r||7)/7,{p2:true});return}catch(err){}}if(!LOWFX)glow('140,210,255',p.x,p.y,p.r*2.4,.4);ctx.save();ctx.translate(p.x,p.y);ctx.rotate(a);ink(1.6);
    ctx.beginPath();ctx.moveTo(p.r*1.3,0);ctx.lineTo(-p.r*.2,-p.r*.9);ctx.lineTo(-p.r,-p.r*.1);ctx.lineTo(-p.r*.3,p.r*.8);ctx.closePath();ctx.fillStyle='#3a3230';ctx.fill();ctx.stroke();
    ctx.strokeStyle='#9fe0ff';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(-p.r*.2,-p.r*.9);ctx.lineTo(p.r*1.3,0);ctx.stroke();ctx.restore()}});
// the shots of its kinds sound like fire, once for a whole fan
{let pxT=0;const _s=sfx;sfx=function(k,arg,x){if(k==='eshot'&&(arg==='pfeather'||arg==='pfeatherb'||arg==='pshard')){const now=performance.now();if(now-pxT<60)return;pxT=now;return _s.call(this,k,'fire',x)}return _s.apply(this,arguments)}}
// on the floor: the shadow of the wings at the entrance, the warnings (the rays of the fan, the band of the dive with its arrow and its
// arrival, the crescent of the wings with its edge catching fire, the reach of the whip and where it starts, the ring of the wave, the
// ring of the egg), the whip where it really cuts, the embers' circles, the gaze's circles, the feathers stuck in the floor
function pxGround(){const B=G.ph;if(!B)return;const t=G.t||0,red=PXC.red,pu=.55+.3*Math.sin(t*18),K=pxK();
  for(const e of G.enemies)if(e.type==='phoenix'&&e.intro>0&&(e.iT||0)<.8){const u=clamp((e.iT||0)/.75,0,1);pxShadow(e.x+(u-.5)*70,BOT+140-(BOT-TOP+280)*u,-Math.PI/2-.08,Math.sin(Math.PI*u)*.9)}
  for(const w of B.warn){const k=1-w.t/w.max;
    if(w.k==='ray'){ctx.save();ctx.beginPath();ctx.rect(L,TOP,R-L,BOT-TOP);ctx.clip();ctx.translate(w.x,w.y);ctx.rotate(w.a);ctx.fillStyle=`rgba(${red},${.06+.14*k})`;ctx.fillRect(12,-w.w/2,w.len-12,w.w);
      ctx.strokeStyle=`rgba(${red},${.45+.35*k})`;ctx.lineWidth=1.6;ctx.setLineDash([7,6]);ctx.beginPath();ctx.moveTo(12,0);ctx.lineTo(w.len,0);ctx.stroke();ctx.setLineDash([]);ctx.restore()}
    else if(w.k==='dive'){const fk=Math.min(1,(w.max-w.t)/w.fill),hw=w.w/2;ctx.save();ctx.beginPath();ctx.rect(L,TOP,R-L,BOT-TOP);ctx.clip();ctx.translate(w.x,w.y);ctx.rotate(w.a);
      ctx.fillStyle=`rgba(${red},${.08+.2*fk})`;ctx.fillRect(0,-hw,w.len,w.w);
      if(!LOWFX){ctx.globalCompositeOperation='lighter';ctx.fillStyle=`rgba(${w.p2?PXC.blue:PXC.fire},${.14*fk})`;ctx.fillRect(0,-hw*.35,w.len*fk,hw*.7);ctx.globalCompositeOperation='source-over'}
      ctx.strokeStyle=`rgba(${red},${fk>=1?(Math.sin(t*30)>0?.95:.6):pu})`;ctx.lineWidth=w.anvil?3:2;if(fk<1)ctx.setLineDash([8,6]);ctx.strokeRect(0,-hw,w.len,w.w);ctx.setLineDash([]);
      const ax=Math.max(22,w.len-8);ctx.fillStyle=`rgba(${red},${.45+.4*fk})`;ctx.beginPath();ctx.moveTo(ax,0);ctx.lineTo(ax-16,-11);ctx.lineTo(ax-16,11);ctx.closePath();ctx.fill();ctx.restore();
      if(w.arrive){ctx.strokeStyle=`rgba(${red},${pu})`;ctx.lineWidth=2.5;circ(w.ex,w.ey,w.arrive);ctx.stroke();ctx.fillStyle=`rgba(${red},${.06+.2*fk})`;circ(w.ex,w.ey,w.arrive*(.3+.7*fk));ctx.fill()}
      if(w.anvil){const a=w.anvil;ctx.strokeStyle=`rgba(${red},${Math.sin(t*24)>0?.95:.55})`;ctx.lineWidth=3;circ(a.x,a.y,a.r+9);ctx.stroke()}}
    else if(w.k==='cres'){const fk=Math.min(1,k/.78),a0=w.a-w.span/2,a1=w.a+w.span/2;ctx.fillStyle=`rgba(${red},${.07+.2*k})`;ctx.beginPath();ctx.moveTo(w.x,w.y);ctx.arc(w.x,w.y,w.r*(.25+.75*k),a0,a1);ctx.closePath();ctx.fill();
      ctx.strokeStyle=`rgba(${red},${pu})`;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(w.x,w.y);ctx.arc(w.x,w.y,w.r,a0,a1);ctx.closePath();ctx.stroke();
      if(!LOWFX&&fk>0){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(${w.p2?PXC.blue:PXC.fire},.8)`;ctx.lineWidth=4;ctx.lineCap='round';const h=w.span/2*fk;
        ctx.beginPath();ctx.arc(w.x,w.y,w.r,a0,a0+h);ctx.stroke();ctx.beginPath();ctx.arc(w.x,w.y,w.r,a1-h,a1);ctx.stroke();ctx.restore()}}
    else if(w.k==='sweep'){ctx.strokeStyle=`rgba(${red},${pu})`;ctx.lineWidth=2.5;ctx.setLineDash([8,7]);ell(w.x,w.y,w.r,w.r*K);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle=`rgba(${red},${.05+.08*k})`;ell(w.x,w.y,w.r,w.r*K);ctx.fill();
      ctx.strokeStyle=`rgba(${red},.9)`;ctx.fillStyle=`rgba(${red},.9)`;ctx.lineWidth=3;ctx.lineCap='round';
      for(const s0 of w.s0){const[x0,y0]=pxOut(w.x,w.y,s0,26),[x1,y1]=pxOut(w.x,w.y,s0,w.r);ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();
        const pts=[];for(let i=0;i<=6;i++)pts.push(pxOut(w.x,w.y,s0+w.dir*.55*i/6,w.r*.86));ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();
        const[ex,ey]=pts[6],[qx,qy]=pts[5],aa=Math.atan2(ey-qy,ex-qx);ctx.beginPath();ctx.moveTo(ex+Math.cos(aa)*9,ey+Math.sin(aa)*9);ctx.lineTo(ex+Math.cos(aa+2.4)*9,ey+Math.sin(aa+2.4)*9);ctx.lineTo(ex+Math.cos(aa-2.4)*9,ey+Math.sin(aa-2.4)*9);ctx.closePath();ctx.fill()}}
    else if(w.k==='ring'){ctx.strokeStyle=`rgba(255,220,190,${.35+.15*Math.sin(t*10)})`;ctx.lineWidth=1.6;ctx.setLineDash([6,7]);circ(w.x,w.y,w.r);ctx.stroke();ctx.setLineDash([])}
    else if(w.k==='egg'){ctx.strokeStyle=`rgba(${red},${pu})`;ctx.lineWidth=3;circ(w.x,w.y,w.r);ctx.stroke();ctx.fillStyle=`rgba(${red},${.04+.12*k})`;circ(w.x,w.y,w.r*k);ctx.fill()}}
  if(B.whip){const W=B.whip;ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';for(const A of W.a){const[x0,y0]=pxOut(W.x,W.y,A,W.r0),[x1,y1]=pxOut(W.x,W.y,A,W.r1);
    ctx.strokeStyle=`rgba(${W.p2?PXC.blue:PXC.fire},.42)`;ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();ctx.strokeStyle='rgba(255,240,210,.7)';ctx.lineWidth=2.4;ctx.stroke()}ctx.restore()}
  for(const m of B.embers){const p=clamp(m.t/m.dur,0,1),sr=m.r*(.3+.6*p);ctx.fillStyle=`rgba(0,0,0,${.1+.25*p})`;ell(m.tx,m.ty,sr,sr*.55);ctx.fill();
    ctx.strokeStyle=`rgba(${red},${.5+.3*Math.sin(t*20)})`;ctx.lineWidth=2.5;circ(m.tx,m.ty,m.r);ctx.stroke();ctx.fillStyle=`rgba(${red},${.08+.24*p})`;circ(m.tx,m.ty,m.r*p);ctx.fill();
    if(!LOWFX&&p>.4){ctx.save();ctx.globalCompositeOperation='lighter';glow(m.p2?PXC.blue:PXC.fire,m.tx,m.ty,m.r*1.1,.2*p);ctx.restore()}}
  if(B.chase){const c=B.chase;ctx.fillStyle=`rgba(${red},.1)`;circ(c.x,c.y,34);ctx.fill();ctx.strokeStyle=`rgba(${red},${pu})`;ctx.lineWidth=2.5;ctx.setLineDash([6,5]);circ(c.x,c.y,34);ctx.stroke();ctx.setLineDash([])}
  for(const c of B.locks){const k=1-c.t/c.max;ctx.fillStyle=`rgba(${red},${.12+.3*k})`;circ(c.x,c.y,34*(.4+.6*k));ctx.fill();ctx.strokeStyle=`rgba(${red},${Math.sin(t*26)>0?.95:.55})`;ctx.lineWidth=3;circ(c.x,c.y,34);ctx.stroke();
    if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow(PXC.blue,c.x,c.y,40,.25*k);ctx.restore()}}
  for(const s of B.pins)pxFeather(s.x,s.y,s.a,{p2:s.p2,stuck:s.t/s.life})}
// in the air: the embers falling from its wings, the columns of the gaze (and the ray of light before each), the arena's rays lighting
// up, the feathers planted in the walls
function pxAir(){const B=G.ph;if(!B)return;
  for(const m of B.embers){const u=clamp(m.t/m.dur,0,1);pxEmber(m.x0+(m.tx-m.x0)*u,m.y0+(m.ty-m.y0)*u,100*(1-u*u),m.spin+m.vs*m.t,{p2:m.p2,k:pxEz((u-.8)/.2),big:m.big})}
  if(!LOWFX&&(B.locks.length||B.cols.length)){ctx.save();ctx.globalCompositeOperation='lighter';
    for(const c of B.locks)if(c.t<.3){const k=1-c.t/.3,top=c.y-420,g=ctx.createLinearGradient(0,top,0,c.y);g.addColorStop(0,'rgba(160,255,220,0)');g.addColorStop(1,`rgba(170,230,255,${.35*k})`);
      ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(c.x-36,top);ctx.lineTo(c.x-26,top);ctx.lineTo(c.x+5,c.y);ctx.lineTo(c.x-5,c.y);ctx.closePath();ctx.fill()}
    for(const c of B.cols){const k=c.t/c.max,top=c.y-420,w=26*(.5+.5*k),g=ctx.createLinearGradient(0,top,0,c.y);g.addColorStop(0,'rgba(120,200,255,0)');g.addColorStop(.55,`rgba(120,200,255,${.4*k})`);g.addColorStop(1,`rgba(235,250,255,${.9*k})`);
      ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(c.x-w*.6-30,top);ctx.lineTo(c.x+w*.6-30,top);ctx.lineTo(c.x+w,c.y);ctx.lineTo(c.x-w,c.y);ctx.closePath();ctx.fill();glow('140,210,255',c.x,c.y-10,70,.6*k)}
    ctx.restore()}
  else if(LOWFX)for(const c of B.cols){ctx.fillStyle=`rgba(170,225,255,${.5*c.t/c.max})`;ctx.fillRect(c.x-10,c.y-300,20,300)}
  if(B.glow>0&&!LOWFX){const st=typeof ARST!=='undefined'&&ARST[G.arena||0],rgb=st&&st.light&&st.light.shafts;if(rgb){const t=G.t||0;ctx.save();ctx.globalCompositeOperation='lighter';
    for(let k=0;k<3;k++){const x=L+40+k*(R-L-80)/2+Math.sin(t*.2+k)*10,g=ctx.createLinearGradient(0,TOP,0,BOT);g.addColorStop(0,`rgba(${rgb},${.16*B.glow})`);g.addColorStop(1,`rgba(${rgb},0)`);
      ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x,TOP-10);ctx.lineTo(x+30,TOP-10);ctx.lineTo(x+90,BOT);ctx.lineTo(x+50,BOT);ctx.closePath();ctx.fill()}ctx.restore()}}
  for(const s of B.stuck)pxFeather(s.x,s.y,s.a,{p2:s.p2,stuck:s.t/s.life})}
{const _g2=drawHazards2Ground;drawHazards2Ground=function(){_g2.apply(this,arguments);try{if(PXON)pxGround()}catch(err){}}}
{const _a2=drawHazards2Air;drawHazards2Air=function(){_a2.apply(this,arguments);try{if(PXON)pxAir()}catch(err){}}}
// the fires of the reborn phoenix burn blue (the game draws its fires orange: those are taken out and drawn here the same way)
{const _hg=drawHazardsGround;drawHazardsGround=function(){const Z=G.zones;if(!PXON||!Z||!Z.some(z=>z.pxb))return _hg.apply(this,arguments);G.zones=Z.filter(z=>!z.pxb);try{_hg.apply(this,arguments)}finally{G.zones=Z}
  for(const z of Z){if(!z.pxb)continue;const a=Math.min(1,z.t/.4)*Math.min(1,(z.max-z.t)/.3+.2);ctx.fillStyle=`rgba(60,130,255,${.28*a})`;circ(z.x,z.y,z.r);ctx.fill();ctx.strokeStyle=`rgba(140,200,255,${.5*a})`;ctx.lineWidth=2;ctx.setLineDash([4,5]);circ(z.x,z.y,z.r);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle=`rgba(220,245,255,${.6*a})`;for(let i=0;i<5;i++){const an=G.t*.8+i*1.3,rr=z.r*(.3+.5*((i*37)%10)/10);circ(z.x+Math.cos(an)*rr,z.y+Math.sin(an)*rr*.7-((G.t*14+i*9)%14),2);ctx.fill()}
    const b=Math.min(1,z.t/.4);for(let i=0;i<4;i++){const an=i*1.7+z.x*.1,rr=z.r*.5*((i%2)+.4),x0=z.x+Math.cos(an)*rr,y0=z.y+Math.sin(an)*rr*.6,h=(7+Math.sin(G.t*12+i*2+z.x)*3)*b;ctx.fillStyle=`rgba(${110+i*20},${190+i*12},255,${.75*b})`;
      ctx.beginPath();ctx.moveTo(x0-3,y0);ctx.quadraticCurveTo(x0-2,y0-h*.6,x0,y0-h);ctx.quadraticCurveTo(x0+2,y0-h*.6,x0+3,y0);ctx.fill()}}}}
// the anvil it crashed into stays red-hot for 3 s (blue-hot after the rebirth)
{const _dr=drawRock;drawRock=function(k){_dr.apply(this,arguments);if(PXON&&k.pxHot>(G.t||0)&&ctx===MAINCTX){const f=Math.min(1,(k.pxHot-G.t)/1.2),h=kH(k),rgb=k.pxB?'120,190,255':'255,90,40';
  ctx.save();ctx.globalCompositeOperation='lighter';glow(rgb,k.x,k.y-h*.5,k.r*2.4,(.45+.1*Math.sin(G.t*14))*f);ctx.fillStyle=`rgba(${rgb},${.35*f})`;ell(k.x,k.y-h*.75,k.r*.9,k.r*.35);ctx.fill();ctx.restore()}}}
// ---- the arena reacts to the new blows (the others are in 87-boss3-arena.js: ffeathers, fdive, fvortex, fegg, freborn)
const PXFX={
  // the anvil it crashed into rings, glows red-hot for 3 s, sparks fly; the room shakes
  fanvil(e,x,y,k){const p2=!!(e&&e.p2);if(k){k.pxHot=(G.t||0)+3;k.pxB=p2;k.hit=Math.max(k.hit||0,.35)}ENV2.rocks(x,y,140,2);ENV2.chunks(x,y,B3N(14),['#3a3438','#8a8a92',p2?'#9fe0ff':'#ffb347'],150);ENV2.mark('scorch',x,y,26);
    vfxBlast(x,y-14,p2?'150,220,255':'255,170,70',70,{sparks:B3N(22),spcol:p2?['#ffffff','#9fe0ff']:['#fff1c0','#ffb347'],dust:6,ring2:false});shake(7);b3torch(p2?'blue':'fire',.5);
    if(AU.ctx&&AU.on.sfx&&AU.ctx.state==='running'){const t=AU.ctx.currentTime+.01;vAnvil(null,t,.16,520);vAnvil(null,t+.2,.07,780)}},
  // the wings shut: a gust; the torches bow and nearly go out, dust and ash pushed away from her, the obstacles shake
  fwings(e,x,y){ENV2.rocks(x,y,230,1);ENV2.chunks(x,y,B3N(12),['#8a837c','#5a544e','#3a3230'],180);ENV2.burnGrass(x,y,70);b3torch('ember',.5);for(const t of G.torches||[])t.ph+=2;
    if(!LOWFX)for(let i=0;i<10;i++){const a=rand(0,TAU),s=rand(90,170);fxPush({k:'puff',x:x+Math.cos(a)*30,y:y+Math.sin(a)*18,vx:Math.cos(a)*s,vy:Math.sin(a)*s*.6,t:rand(.4,.7),r:rand(4,8)})}
    if(AU.ctx&&AU.on.sfx&&AU.ctx.state==='running')whoosh(AU.ctx.currentTime+.01,.5,180,700,.09,.3)},
  // an ember of the rain: ash on the floor, the feather stuck in it for 4 s
  frain(e,x,y,r){b3mark('ash',x,y,(r||22)*.8);if(G.ph&&G.ph.pins.length<10)G.ph.pins.push({x:x+rand(-6,6),y:y+rand(-3,3),a:Math.PI/2+rand(-.5,.5),t:0,life:4,p2:!!(e&&e.p2)})},
  // a column of the gaze: a burnt circle of runes baked in the floor, the arena's rays light up
  fjudge(e,x,y){pxRunes(x,y,34);ENV2.burnGrass(x,y,40);ENV2.rocks(x,y,120,1);b3torch('blue',.5);if(G.ph)G.ph.glow=1}};
{const _f=b3fx;b3fx=function(e,what,x,y,r){if(!PXON||!PXFX[what])return _f.apply(this,arguments);if(!BOSS2||!G||!G.rocks)return;try{PXFX[what](e,x,y,r)}catch(err){}}}
// a burnt circle of runes on the floor (baked in it, like the other marks)
function pxRunes(x,y,r){const c=fx;if(!c)return;c.save();c.setTransform(2,0,0,2,0,0);const g=c.createRadialGradient(x,y,r*.2,x,y,r*1.25);g.addColorStop(0,'rgba(10,14,24,.45)');g.addColorStop(.7,'rgba(20,30,50,.3)');g.addColorStop(1,'rgba(0,0,0,0)');
  c.fillStyle=g;c.beginPath();c.ellipse(x,y,r*1.25,r*.7,0,0,TAU);c.fill();c.strokeStyle='rgba(30,22,18,.75)';c.lineWidth=2;c.beginPath();c.ellipse(x,y,r,r*.56,0,0,TAU);c.stroke();
  c.strokeStyle='rgba(140,210,255,.55)';c.lineWidth=1;c.beginPath();c.ellipse(x,y,r*.82,r*.46,0,0,TAU);c.stroke();c.strokeStyle='rgba(170,230,255,.7)';c.lineWidth=1.1;
  for(let i=0;i<8;i++){const a=i/8*TAU,px=x+Math.cos(a)*r*.91,py=y+Math.sin(a)*r*.51;c.beginPath();c.moveTo(px-2,py-1.5);c.lineTo(px,py+1.5);c.lineTo(px+2,py-1.5);c.stroke()}c.restore()}
// ---- the entrance (3.4 s, the model's 'enter'): the shadow of its wings crosses the room, a pillar of fire falls on the runes and she comes
// down inside it, lands light, opens her eyes, the crown lights up, the wings spread, the pillar bursts and she cries
if(PXON)B3IN.phoenix=(e,t,t0,at,roar)=>{e.em=t<2.65?.999:1;e.z=0;e.face=pxFace(Math.atan2(P.y-e.y,P.x-e.x));
  // the pillar falls on the circle of runes of the Nest: she comes down in the middle of it
  if(t0===0){if(!G.ph)pxReset();shake(1);if(G.runeAt){e.x=G.runeAt.x;e.y=G.runeAt.y}}
  if(at(.2))pxSay(e,'far',.5,.6);
  // the torches flare up when the shadow of the wings passes over them
  {const T=G.torches||[],ty=T.length?T.reduce((s,q)=>s+q.y,0)/T.length:TOP,ts=.75*clamp((BOT+140-ty)/(BOT-TOP+280),0,1);if(T.length&&at(ts))b3torch('fire',.4)}
  if(at(.75)){sfx('ignite',2,e.x);shake(2)}
  if(t>.75&&t<1.75&&Math.random()<(LOWFX?.35:.9))fxPush({k:'firep',x:e.x+rand(-18,18),y:e.y-rand(0,220),r:rand(6,12),t:.45,max:.45});
  if(at(1.7)){shake(2);stamp('scorch',e.x,e.y+4,34);dustRing(e.x,e.y,10)}
  if(at(2.58)){vfxBlast(e.x,e.y-50,'255,190,110',130,{sparks:B3N(26),fire:B3N(8),dust:0,ring2:false});fxPush({k:'ring2',x:e.x,y:e.y-40,rgb:'255,210,140',r0:20,r1:150,t:.45,max:.45,w:6})}
  if(at(2.65))roar()};
// ---- the defeat (4 s, the model's 'die'; the bar and «sconfitto» at 2.2 s): blue embers, then ash rising and falling slowly like snow, a
// soft thud when it crumbles, the crack of the little egg, the chick
if(PXON)B3DIE.phoenix={setup(c){pxReset();if(G._tT>0&&G.env&&G.env._base)G._tT=.01;c.p2=!!(c.e&&c.e.p2)},
  tick(c,dt,D,p){const f=!LOWFX;
    if(p<.3&&Math.random()<(f?.5:.2))cpart(c,{k:'spark',x:c.x+rand(-26,26),y:c.y-rand(10,80),vz:rand(20,50),life:.6,r:1.8,col:c.p2?'150,215,255':'255,170,70'});
    if(p>.3&&p<.85&&Math.random()<(f?.7:.3))cpart(c,{k:'ash',x:c.x+rand(-30,30),y:c.y-rand(8,60),vz:rand(10,30),vx:rand(-8,8),g:-12,life:rand(.8,1.3),r:rand(1.5,3),col:'150,144,138'});
    if(p>.3&&Math.random()<(f?.3:.1))cpart(c,{k:'ash',x:c.x+rand(-150,150),y:c.y+rand(-90,70),z:rand(80,150),vz:-rand(18,24),vx:rand(-5,5),sw:1.2,ph:rand(0,6),life:rand(2.5,3.5),r:rand(1.1,2),col:'205,198,190'});
    if(p>.55&&!c.thud){c.thud=1;shake(3);if(AU.ctx&&AU.on.sfx&&AU.ctx.state==='running')fThump(AU.ctx.currentTime+.01,70,38,.25,.18)}
    if(p>.85&&!c.crk){c.crk=1;sfx('click',0,c.x)}
    if(p>.95&&!c.chirp){c.chirp=1;b3say(c,'chick')}}};
// ---- the voice: an imperial bird. Its screech is lower and longer than before (900-1350 Hz), with a second voice an octave under it in
// the great cries and the breath of the fire beneath; «kek-kek-kek» when it mocks you, a long screech and a beat of the wings when it calls
// you out, a voice for each blow (after the heart beating «tum-tum»), three dull knocks from inside the egg, the far cry of the entrance.
function pxSay(e,k,vol,rev){if(!AU.ctx||!AU.on.sfx||AU.ctx.state!=='running'||!B3VO.has('phoenix',k))return 0;try{AU.pan=0;return B3VO.play('phoenix',k,AU.ctx.currentTime+.01,vol,VR(1,.03),rev||.18)}catch(err){return 0}}
if(PXON){
  const lo=(d,list,pk)=>[d,list.map(s=>s.f?Object.assign({},s,{f:s.f.map(x=>x/2),tn:.45,ro:.3,br:.3,am:null}):s),pk],
    kek=(n,t0,step,fa,fb)=>[...Array(n)].map((_,i)=>{const f=fa+(fb-fa)*i/Math.max(1,n-1);return{t:t0+i*step,d:.085,f:[f*1.05,f*.92],v:'B',am:[.55,34],att:.1,rel:.3,a:1-i*.06}});
  const CRY=[{t:0,d:1.35,f:[950,1350,880],v:'B',att:.06,rel:.35,vib:[.025,6.5],am:[.16,26]}],
    ANG=[{t:0,d:.36,f:[1000,1300],v:'B',att:.08},{t:.42,d:1.12,f:[1100,1350,900],v:'B',vib:[.03,6],am:[.2,28],rel:.35}],
    DIE=[{t:0,d:2.05,f:[1300,950,420],v:'B',vib:[.03,5],rel:.5,br:.25}],
    WIN=[...kek(3,0,.15,1250,1050),{t:.5,d:.62,f:[1000,1350,950],v:'B',vib:[.02,9],rel:.4}],
    JUD=[{t:0,d:1.15,f:[900,1020,940],v:'B',vib:[.02,5],att:.15,rel:.35}];
  B3VO.VB.phoenix={base:{tn:1,br:.1,ji:.02,lp:.9},k:{
    cry:[[1.4,CRY,.2]],angry:[[1.6,ANG,.21]],die:[[2.1,DIE,.19]],win:[[1.2,WIN,.19]],
    laugh:[[.88,[...kek(3,0,.14,1300,1100),{t:.44,d:.42,f:[1080,1260,920],v:'B',vib:[.02,9],rel:.4}],.18]],
    laugh2:[[.95,[{t:0,d:.62,f:[980,1300,1080],v:'B',am:[.2,24],rel:.3},{t:.7,d:.2,noise:1,v:'h',a:.8}],.17]],
    hurt:[[.2,[{t:0,d:.18,f:[1050,820],v:'B',tn:.6,ro:.4,br:.3,att:.05}],.17],[.18,[{t:0,d:.16,f:[1150,900],v:'B',tn:.7,ro:.3,br:.3,att:.05}],.17]],
    chick:[[.25,[{t:0,d:.07,f:[2600,3000],v:'B',a:.8,att:.1,rel:.3},{t:.15,d:.08,f:[2700,3100],v:'B',a:.9}],.12]],
    far:[[1.1,[{t:0,d:1.05,f:[880,1150,820],v:'B',att:.2,rel:.45,vib:[.02,5]}],.1]],
    c_fan:[[.36,[{t:0,d:.34,f:[1250,1420,1150],v:'B',att:.05,rel:.3}],.17]],
    c_dive:[[.62,[{t:0,d:.6,f:[850,1500],v:'B',vib:[.02,10],att:.08,rel:.2}],.17]],
    c_wings:[[.8,[{t:0,d:.32,noise:1,v:'u',a:.6},{t:.34,d:.42,f:[1100,1350,1000],v:'B',rel:.35}],.19]],
    c_sweep:[[.85,[{t:0,d:.42,noise:1,v:'a',a:.7},{t:.44,d:.38,f:[1150,1260],v:'B',am:[.8,26]}],.235]],
    c_rain:[[.42,[{t:0,d:.4,f:[1000,1150,880],v:'B',tn:.7,ro:.35,br:.35,att:.06,rel:.35}],.17]],
    c_judge:[[1.2,JUD,.18]],
    c_egg:[[.9,[0,.34,.68].map(t=>({t,d:.13,f:[130,95],v:'u',tn:0,ro:.35,br:.5,att:.05,rel:.5})),.48]],
    // the second voice an octave under the great cries
    lo_cry:[lo(1.4,CRY,.12)],lo_angry:[lo(1.6,ANG,.12)],lo_die:[lo(2.1,DIE,.11)],lo_win:[lo(1.2,WIN,.1)],lo_c_judge:[lo(1.2,JUD,.11)]}};
  Object.assign(B3VX,{far:.5,c_egg:.8});
  B3CUE.phoenix={fan:'c_fan',fan2:'c_fan',dive:'c_dive',redive:'c_dive',wings:'c_wings',wings2:'c_wings',sweep:'c_sweep',rain:'c_rain',judge:'c_judge',rebirth:'hurt'};
  // under the great cries the second voice and the breath of the fire; the gust of a beat of the wings, the roar of the whip, the bell of
  // the judgement
  {const _m=b3sayMore;b3sayMore=function(e,k,t){if(e.type!=='phoenix')return _m.apply(this,arguments);const near=Math.max(.55,enemyAt(e)),v=(B3VX[k]||.75)*near;
    if(B3VO.has('phoenix','lo_'+k)){try{B3VO.play('phoenix','lo_'+k,t,.35*v,1,.18)}catch(err){}fNoise(t+.05,k==='die'?1.9:1.2,'lowpass',800,.7,.05*v,{brown:true,att:.2})}
    if(k==='cry'||k==='angry')whoosh(t+.05,.7,500,2000,.05*v,.4);
    else if(k==='laugh2')fNoise(t+.7,.16,'lowpass',500,.8,.08*v,{brown:true});
    else if(k==='c_wings')whoosh(t,.35,300,1400,.06*v,.3);
    else if(k==='c_sweep')fNoise(t,.45,'lowpass',VR(600,.1),.8,.08*v,{brown:true,att:.1});
    else if(k==='c_judge')vBell(null,t+.15,74,2.2,.04*near);
    else if(k==='c_fan'||k==='laugh')for(let i=0;i<2;i++)fNoise(t+i*.11,.08,'lowpass',VR(700,.2),.8,.05*v,{brown:true});
    AU.pan=0}}
  // the Heart of the Forge before every blow: «tum-tum» when the model's heart beats and sends its fire down the feathers (in its time)
  {const _g=b3go;b3go=function(e,st){_g.apply(this,arguments);try{const I=pxI(),MB=I.beats||I.beat,B=e.type==='phoenix'&&!(e.intro>0)&&st!=='rebirth'&&st!=='idle'&&((MB&&MB[st])||PXC.beat[st]);
    if(B&&B.length&&AU.ctx&&AU.on.sfx&&AU.ctx.state==='running'){const k=B3D(e,st)/pxSp(e),t=AU.ctx.currentTime+.01,v=Math.max(.55,enemyAt(e));B.forEach((c,i)=>{fThump(t+c*k,86,46,.13,.2*v*(i?.8:1));fNoise(t+c*k,.05,'highpass',3200,.7,.018*v)});AU.pan=0}}catch(err){}}}}
// ---- for the previews (anteprime/mk_boss2.py) and the tests (tests/boss2gioco.js): how to get into its room, its moves in each phase,
// the dangers it puts in the room (counted by the tests), the clips of its voice
if(PXON){const R=window.BCL||(window.BCL={});R.phoenix={n:'La Fenice della Forgia',arena:9,p2:true,
  enter(){G.arena=9;G.chapter=ARENAS[9].ch;G.diff=ARENAS[9].diff;G.bossLvl=null;G.room=ROOMS;G.event=null;buildRoom()},
  moves:['fan','dive','grounded','rise','wings','sweep','rain'],moves2:['rebirth','judge','fan2','redive','wings2'],
  hz(){const B=G.ph||{},W=B.warn||[],n=k=>W.filter(w=>w.k===k).length;return{avvisi:W.length,raggi:n('ray'),linea:n('dive'),mezzalune:n('cres'),frusta:B.whip?B.whip.a.length:0,
    braci:(B.embers||[]).length,colonne:(B.locks||[]).length+(B.cols||[]).length,piume:G.eproj.filter(q=>q.kind==='pfeather'||q.kind==='pfeatherb').length,
    schegge:G.eproj.filter(q=>q.kind==='pshard').length,zone_di_fuoco:G.zones.filter(z=>z.kind==='fire').length,onde:G.waves.length,piantate:(B.stuck||[]).length+(B.pins||[]).length}},
  voice:['cry','laugh','angry','die','chick']}}
