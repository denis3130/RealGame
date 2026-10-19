// =====================================================================
// IL BURATTINAIO D'OMBRA RIFATTO: «la Marionetta del Teatro delle Ombre» (Denis, 15 ottobre: «rivisita tutti i boss … possenti, belli,
// fighi, che diano timore nello sfidarli», «migliora anche le loro abilità speciali»; poi, visto il Golem, «sì, fai gli altri 12»).
// ANTEPRIMA: questo file e il modello sprite/nemici3d/puppeteer2.js entrano solo nella copia del gioco fatta da anteprime/mk_boss2.py; nel
// gioco vero dopo il sì di Denis (il modello prende il posto di 'puppeteer' e questo file va in src/ordine.txt). Design e numeri:
// docs/boss-classici-design/puppeteer.md («Le abilità nel gioco»).
// Il custode della Cripta delle Ombre (arena 9): un giullare di legno, avorio e velluto alto tre volte e mezzo l'eroe, appeso a cinque fili
// d'oro che salgono a una croce che dondola da sola nel buio. Il suo avviso: prima di ogni colpo si accendono e si tendono i fili dell'arto
// che colpirà, la croce si piega da quella parte, tintinnano i campanelli del cappuccio e si sente lo «zing» di una corda; quando i fili sono
// molli è indifeso. Ogni stato ha il nome di una mossa del modello e il colpo vero parte nel suo fotogramma (b3at, 81-boss3-base.js):
// - Manate (slam): due cerchi rossi dove cadranno i pugni e l'anello fin dove arriva l'onda d'ombra; poi resta piegato coi fili molli.
// - Fili d'oro (strings): una banda rossa attraverso la stanza passando per lui, poi il filo d'oro di oggi che la spazza (scatto o riparo);
//   nella fase 2 il filo resta teso contro la parete in fondo e torna dopo 2,2 s.
// - Sei il mio burattino! (lasso, yank, snap): una linea d'oro dal dito a te si blocca col clic, poi il filo corre lungo la linea; se ti
//   prende tre strattoni ti tirano verso di lui e un pugno cade nel cerchio rosso davanti a lui. Lo scatto spezza il filo: barcolla
//   indifeso (+50%).
// - Burattini (puppets): due botole (tre nella fase 2) davanti a lui; si aprono e ne saltano fuori i burattini d'ombra. Ogni burattino che
//   rompi ferisce il padrone (il filo torna a lui: l'1,2% della sua vita).
// - Sipario e riflettore (vanish, spot, drop): cala il sipario e lui sparisce; un occhio di bue ti cerca, si blocca e lui cade dall'alto in
//   un mucchio di legno e velluto (fili allentati: +50%), con un anello di sfere d'ombra.
// - Fase 2, il vero Burattinaio (rage, a metà vita): crolla, una mano d'ombra gigante afferra la croce, due occhi magenta nel buio; da lì
//   lo portano. Mano dell'Ombra (hand: l'ombra di una mano enorme ti insegue, si blocca e la mano cade dal buio), Manate a catena (slam3:
//   tre pugni che avanzano), i Fili che tornano, tre burattini, sedici sfere.
// Entrata (enter): si alza il sipario, i fili si tendono uno a uno e fa l'inchino. Sconfitta (die): i fili si spezzano uno a uno, resta un
// giocattolo e cala il sipario. Mai due mosse insieme; ogni danno ha un avviso rosso a terra di almeno 0,6 s veri (se una velocità li
// accorciasse, la mossa resta ferma sul fotogramma prima del colpo); d'oro solo la mira del filo, che non fa danno. Il contatto fa 22 come
// oggi, ma non quando è un mucchio di legno (la caduta, e dopo finché non si è scostato da te) né mentre barcolla col filo spezzato.
// =====================================================================
const PU2ON=typeof N3!=='undefined'&&!!N3.puppeteer2;
const BU2={red:'229,72,77',gold:'255,214,110',goldL:'255,233,160',mag:'255,95,200',magL:'255,154,224',vio:'170,110,255',light:'255,244,214',
  seq1:['slam','strings','lasso','puppets','vanish'],seq2:['hand','slam3','strings','lasso','hand','puppets','vanish'],
  // the states that keep the time of the first phase (the moves of the second go 1.15 times faster): the walk and the gestures have their
  // own lengths, the thread of the puppet always goes at the first phase's pace, the spotlight goes in real seconds
  slow:new Set(['walk','lasso','yank','snap','spot','rage','taunt','call','enter']),
  // the states that are no attack: no charging ring round him when they start (51-boss2-mondi.js)
  calm:new Set(['call','snap','spot','yank','drop','rage','taunt']),
  // the attacks: the signal (the zing of a string and the bells of the hood) when they start
  att:new Set(['slam','slam3','strings','puppets','lasso','vanish','hand'])};
if(PU2ON){
  // the new model in place of the old one (its drawing of today stays as N3.meta.puppeteer.old for the pages); its puppet too
  const old=N3.puppeteer,oldM=N3.meta.puppeteer;N3.puppeteer=N3.puppeteer2;N3.meta.puppeteer=Object.assign({},N3.meta.puppeteer2,{old:(x,y,f,a,p)=>old(x,y,f,oldM.an.includes(a)?a:'idle',p,oldM.sc||1,{})});
  if(N3.puppet2&&N3.meta.puppet2){const op=N3.puppet,opM=N3.meta.puppet;N3.puppet=N3.puppet2;N3.meta.puppet=Object.assign({},N3.meta.puppet2,{old:(x,y,f,a,p)=>op(x,y,f,opM.an.includes(a)?a:'idle',p,opM.sc||1,{})})}
  BOSS_INTRO.puppeteer=3.4;Object.assign(BDEATH,{puppeteer:{dur:3.8,clou:1.75,snd:'magic'}});B2H.puppeteer=105;ECOL.puppeteer='#6e42b8';delete ETELE.puppeteer;
  BBFX.puppeteer={c:'#351a6e',f:'#ffcd45',k:'rise',s:'magic'};
  // the model gets its height from the game in the fall (o.z); its walk has its own clock, from the first step; what the game passes to it
  N3G.zm.puppeteer=1;N3G.wp.puppeteer=e=>{const d=B3D(e,'walk');return(((e.wt||0)%d)+d)%d/d};
  N3G.opt.puppeteer=e=>{if(!G||!G.enemies||!G.enemies.includes(e))return{mini:1};const O=e.out3||(e.out3={}),B=G.pu2,t=G.t||0;O.t=t;
    return{game:1,jig:e.jig3||0,look:e.look3||0,talk:(e.talkT||0)>t?1:0,veil:e.veil3||0,out:O,
      traps:e.st==='puppets'&&B&&B.traps.length?B.traps.filter(q=>q.mv===e.bu2mv).map(q=>({x:q.x,y:q.y})):null}};
  // (its line in the guide is in 44-guida.js, BEST2, with the others)
}
// ---- helpers
// the model's own drawings of the pieces of its attacks (design: Hand(x,y,z,k,sc,o), Trap(x,y,k,sc,o)) and its numbers (Info)
const bu2a=n=>N3['puppeteer'+n]||N3['puppeteer2'+n]||null;
function bu2I(){return Object.assign({slam:.52,slam3:[.4,.64,.9],strings:.4,puppets:.62,lasso:.68,yank:[.12,.39,.66],yankHit:.94,vanish:.45,drop:.28,hand:.78,
  slamWarn:.04,lassoLock:.28,handLock:.36},bu2a('Info')||{})}
const bu2Ez=u=>{u=clamp(u,0,1);return u*u*(3-2*u)};
const bu2Au=()=>!!(AU.ctx&&AU.on.sfx&&AU.ctx.state==='running');
const bu2Boss=()=>G&&G.enemies?G.enemies.find(q=>q.type==='puppeteer'&&!q.dead):null;
const bu2Puppets=()=>G.enemies.filter(q=>q.type==='puppet'&&!q.dead).length;
// the arena's boss speed (bossLvl, ×1.24-1.27 in the arena 9: the boss's dt already carries it) and the second phase's 1.15
const bu2Spd=()=>((G.bossLvl||(G.bossLvl=bossLvl())).spd)||1;
const bu2F=(e,st)=>e.p2&&!BU2.slow.has(st||e.st)?1.15:1;
// real seconds for a part dk of the move st
const bu2Real=(e,dk,st)=>dk*B3D(e,st||e.st)/(bu2Spd()*bu2F(e,st));
// the camera of the models squashes the floor (y·K): the face that makes him look straight at a point of the room
let bu2Kv=.55,bu2Kt=-1;function bu2K(){const t=G&&G.t||0;if(t!==bu2Kt){bu2Kt=t;try{bu2Kv=C3.V(0).P([0,1,0])[1]||.55}catch(err){bu2Kv=.55}}return bu2Kv}
function bu2Face(a){return Math.atan2(Math.sin(a)/bu2K(),Math.cos(a))}
// a point of his body (forward x, left y, up z) in the room, with the face he is drawn with (or the given one)
function bu2pt(e,bx,by,bz,face){const f=face!=null?face:e.f3!=null?e.f3:(e.face||0),s=(N3.meta.puppeteer&&N3.meta.puppeteer.sc)||1;let q=[0,0];
  try{q=C3.V(f).P([bx,by,bz||0])}catch(err){}return{x:e.x+q[0]*s,y:e.y+8+q[1]*s}}
// the points the model writes while it draws (o.out: in the room); if it has none (or they are old), the design's points of the body
function bu2Out(e,k,bx,by,bz){const O=e.out3,v=O&&O.t!=null&&(G.t||0)-O.t<.25?O[k]:null;
  if(v&&(Array.isArray(v)?isFinite(v[0])&&isFinite(v[1]):isFinite(v.x)&&isFinite(v.y)))return Array.isArray(v)?{x:v[0],y:v[1]}:{x:v.x,y:v.y};return bu2pt(e,bx,by,bz)}
const bu2Tip=e=>bu2Out(e,'tipR',30,-30,96),bu2Cross=e=>bu2Out(e,'cross',0,0,158);
// how far from (x,y) along a before a wall or an obstacle
function bu2Reach(x,y,a,max,m){const ca=Math.cos(a),sa=Math.sin(a);m=m||0;let s=0;for(;s<max;s+=4){const px=x+ca*(s+4),py=y+sa*(s+4);
    if(px<L+m||px>R-m||py<TOP+m||py>BOT-m)break;if(G.rocks.some(k=>Math.hypot(k.x-px,k.y-py)<k.r+m))break}return s}
// the door (top middle of the room) and a free point near (x,y): not on the door, not on an obstacle
const bu2Door=(x,y)=>Math.abs(x-AW/2)<DOORW+22&&y<TOP+48;
const bu2Bad=(x,y,m)=>bu2Door(x,y)||x<L+m||x>R-m||y<TOP+m||y>BOT-m||G.rocks.some(k=>Math.hypot(k.x-x,k.y-y)<k.r+m);
function bu2Free(x,y,m){if(!bu2Bad(x,y,m))return{x,y};for(let r=10;r<=200;r+=10)for(let i=0;i<16;i++){const a=i/16*TAU,px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;if(!bu2Bad(px,py,m))return{x:px,y:py}}
  return{x:clamp(x,L+m,R-m),y:clamp(y,TOP+60,BOT-m)}}
// where he walks between two moves: 150-230 px from you, away from the obstacles, on the circle of runes (the stage) when he can, never
// with his feet over TOP+130 (his head stays under the bar)
function bu2Anchor(e){const c=G.runeAt,top=TOP+130;let best=null,bs=-1e9;
  for(let i=0;i<26;i++){const an=rand(0,TAU),r=rand(150,230),x=clamp(P.x+Math.cos(an)*r,L+40,R-40),y=clamp(P.y+Math.sin(an)*r,top,BOT-34),dh=Math.hypot(x-P.x,y-P.y);
    if(dh<140||G.rocks.some(k=>Math.hypot(k.x-x,k.y-y)<k.r+36))continue;
    let s=-.25*Math.hypot(x-e.x,y-e.y)-.2*Math.abs(dh-190);if(c&&((x-c.x)/101)**2+((y-c.y)/62.6)**2<=1)s+=120;if(s>bs){bs=s;best={x,y}}}
  return best||{x:clamp(e.x,L+40,R-40),y:clamp(Math.max(e.y,top),top,BOT-34)}}
function bu2Reset(){if(G)G.pu2={warn:[],traps:[],trails:[],aim:null,lasso:null,tied:null,pull:null,spot:null,hand:null,fall:null,ret:null,baked:0}}
{const _br=buildRoom;buildRoom=function(){bu2Reset();return _br.apply(this,arguments)}}
// a warning: k its kind, dur the real seconds it fills in, life how long it stays (it goes away at its blow, or when life is over)
function bu2Warn(o){const B=G.pu2||(bu2Reset(),G.pu2);o.t0=G.t||0;if(o.life==null)o.life=(o.dur||.6)+.4;B.warn.push(o);return o}
const bu2Gone=(...W)=>{for(const w of W)if(w)w.gone=1};
// the rule of the design: a blow at the moment p comes at least 0.6 real seconds after its warning (t0); if a speed made it come earlier,
// the move stays on the frame just before the blow
function bu2HoldAt(e,p,t0){(e.hold3||(e.hold3=[])).push({p,t0:t0!=null?t0:(G.t||0)})}
function bu2Hold(e,mdt){const H=e.hold3;if(!H||!H.length||!e.st)return mdt;const D=B3D(e,e.st),mt=e.mt||0,now=G.t||0;
  for(const h of H){const at=h.p*D;if(mt>=at||now-h.t0>=.6)continue;if(mt+mdt>=at)mdt=Math.max(0,at-1e-4-mt)}return mdt}
// the progress of an eased stretch a0..a1 of the move during this frame (for the drags of the chain)
function bu2Seg(e,a0,a1){const D=B3D(e,e.st),k1=(e.mt||0)/D,k0=((e.mt||0)-(e.mdt||0))/D;return bu2Ez((k1-a0)/(a1-a0))-bu2Ez((k0-a0)/(a1-a0))}
// walking between two moves (in the boss's seconds, like the moves: 1.1-1.5, in the second phase 0.7-0.95); the walk starts from its first step
function bu2Walk(e,dur){e.wt=0;e.z=0;e.air=0;e.anchor=null;e.hidden=false;e.alpha=1;e.moving=false;b3go(e,'walk',dur!=null?dur:e.p2?rand(.7,.95):rand(1.1,1.5))}
// ---- the sounds (few and soft, never over the voice, with the instruments the game already has)
// a struck piece of wood (the clacks of the strings that pull taut, the joints, the eyelids)
function bu2Wood(t,v,f){fModal(t,VR(f||330,.08),[1,2.57,4.1],[.14,.07,.04],.22*v,.12);fNoise(t,.04,'bandpass',VR(1400,.1),1.2,.25*v)}
function bu2Snd(e,k,x){if(!bu2Au())return;try{const c=AU.ctx,t=c.currentTime+.01,v=e?Math.max(.5,enemyAt(e)):.8;if(!e)AU.pan=x==null?0:Math.max(-.7,Math.min(.7,(x-(G.vx||0)-VW/2)/200));
  switch(k){
    // the signal: the zing of a rubbed string rising (600 → 1400 Hz, a quarter of a second) and two high notes of the bells of the hood
    case 'zing':fNoise(t,.25,'bandpass',600,18,.11*v,{f2:1400,att:.07});fNoise(t,.25,'bandpass',1200,16,.045*v,{f2:2800,att:.07});vBell(null,t+.05,96,.7,.022*v);vBell(null,t+.16,100,.7,.019*v);break;
    case 'bells':vBell(null,t,96,.6,.016*v);vBell(null,t+.09,100,.6,.014*v);break;
    case 'clac':bu2Wood(t,.75*v,VR(300,.06));bu2Wood(t+.05,.45*v,VR(420,.06));break;
    case 'tac':bu2Wood(t,.65*v,VR(380,.06));break;
    case 'click':bu2Wood(t,.35*v,VR(950,.05));break;
    // the ratchet of the head turning on its peg: eight clicks in half a second
    case 'ratchet':for(let i=0;i<8;i++)bu2Wood(t+i*.0625,.26*v,VR(760,.08));break;
    case 'creak':fNoise(t,.2,'bandpass',VR(620,.1),10,.045*v,{f2:380,att:.05});bu2Wood(t+.02,.2*v,VR(700,.08));break;
    case 'velvet':fNoise(t,1,'lowpass',VR(900,.1),.7,.07*v,{brown:true,att:.35});fNoise(t+.1,.8,'bandpass',VR(2400,.1),.8,.018*v,{att:.3});break;
    // the trapdoors: a «tok» and a creak
    case 'trap':bu2Wood(t,.7*v,VR(220,.08));fNoise(t+.03,.22,'bandpass',VR(700,.1),9,.05*v,{f2:420});break;
    case 'fwip':whoosh(t,.16,900,3200,.09*v,.12);break;
    case 'twang':twang(t,VR(520,.05),.09*v);twang(t+.03,VR(780,.05),.05*v);break;
    // the arpeggio of the spotlight (the music box)
    case 'arp':[84,88,91,96].forEach((m,i)=>vBox(null,t+i*.07,m,.7,.045*v));break;
    case 'thud':fThump(t,VR(96,.06),34,.4,.45*v,.25);fNoise(t,.3,'lowpass',VR(700,.1),.7,.22*v,{brown:true});for(let i=0;i<3;i++)bu2Wood(t+.08+i*.07,.4*v,VR(360+i*90,.08));break;
    // the deep breath of the Hand falling from the dark
    case 'breath':fNoise(t,.55,'lowpass',VR(320,.1),.7,.2*v,{brown:true,att:.12});whoosh(t+.05,.4,140,520,.08*v,.25);break;
    case 'handhit':fThump(t,VR(70,.06),30,.5,.55*v,.3);fNoise(t,.4,'lowpass',VR(500,.1),.7,.28*v,{brown:true});break;
    // the out-of-tune music box of the entrance: three notes falling, a little off
    case 'box3':[[84,0],[80.6,.26],[76.7,.52]].forEach(([m,d])=>vBox(null,t+d,m,1,.05*v));break;
    case 'ping':vBox(null,t,VR(96,.01),.55,.045*v);break;
    case 'drin':vBell(null,t,98,1.4,.03*v);vBell(null,t+.12,98,1.1,.018*v);break;
    // the far applause from the dark: soft wide bursts of noise
    case 'clap':for(let i=0;i<16;i++)fNoise(t+i*.07+Math.random()*.05,.05,'bandpass',VR(1500,.3),1.1,.02*v*(1-i/22),{rev:.6});break;
    case 'box2':vBox(null,t,79,1.4,.04*v);vBox(null,t+.45,76,1.8,.032*v);break}
  AU.pan=0}catch(err){}}
// ---- the brain
if(PU2ON)EUPD.puppeteer=function(e,dt,sm,a,d){const rdt=dt/bu2Spd();if(!G.pu2)bu2Reset();const B=G.pu2;
  bu2Look(e,rdt);bu2Veil(e,rdt);if(e.jig3>0)e.jig3=Math.max(0,e.jig3-rdt/.25);
  // half health: the true Puppeteer (once), as soon as he is free (walking, mocking, calling, or at the end of a move)
  if(!e.p2&&!e.raged&&e.hp<e.max*.5&&(e.st==='walk'||e.st==='taunt'||e.st==='call'||e.st==='enter')){bu2Rage(e);return}
  const mdt=bu2Hold(e,dt*bu2F(e));b3tick(e,mdt);const k=b3k(e),fa=bu2Face(a),I=bu2I();
  switch(e.st){
  case 'enter':e.si=-1;bu2Walk(e,.9);break;
  // ---- between two moves: he walks (the strings pull the knees) toward a spot of the stage, his head on you
  case 'walk':{e.z=0;e.alpha=1;e.hidden=false;
    // after the fall he stands where you were: his body does not hurt you (nor does he mock you) until he has stepped off you
    if(e.nocon&&(Math.hypot(P.x-e.x,P.y-e.y)>P.r+e.r+6||e.mt>1.6))e.nocon=0;e.air=e.nocon?1:0;
    if(!e.anchor||Math.hypot(e.anchor.x-P.x,e.anchor.y-P.y)<130)e.anchor=bu2Anchor(e);
    const dx=e.anchor.x-e.x,dy=e.anchor.y-e.y,dd=Math.hypot(dx,dy),st=(e.p2?88:70)*dt;
    if(dd>3){const ox=e.x,oy=e.y;moveCircle(e,dx/dd*Math.min(dd,st),dy/dd*Math.min(dd,st));e.moving=Math.hypot(e.x-ox,e.y-oy)>st*.2;if(e.moving){e.face=bu2Face(Math.atan2(dy,dx));e.wt=(e.wt||0)+dt}else{e.face=fa;e.anchor=null}}
    else{e.moving=false;e.face=fa}
    // the thread of the second phase coming back: the next move waits until it is home
    if(e.stT<=0&&B.ret&&!B.ret.home)e.stT=.05;
    if(e.stT<=0){e.moving=false;bu2Next(e)}
    break}
  // ---- the mocking (88-boss3-voci.js starts it) and the call: no attack, then a short walk
  // (the mocking: the head turns all the way round on its peg with a ratchet of wood, then he claps his wooden hands twice; the call: «come,
  // come» with the index, a creak each time)
  case 'taunt':case 'call':{e.moving=false;e.face=fa;
    if(e.st==='taunt'){if(b3at(e,.01))bu2Snd(e,'ratchet');if(b3at(e,.82)||b3at(e,.9))bu2Snd(e,'clac')}else if(b3at(e,.2)||b3at(e,.55))bu2Snd(e,'creak');
    if(e.stT<=0)bu2Walk(e,rand(.3,.55));break}
  // ---- MANATE: two red circles where the fists will fall and the ring of the wave (.04); the fists hit the floor (.52); bent with his
  // strings slack until .74
  case 'slam':{e.moving=false;e.face=e.lf;const w=I.slamWarn||.04,h=I.slam||.52;
    if(b3at(e,w)){const pts=[bu2pt(e,38,18,0,e.lf),bu2pt(e,38,-18,0,e.lf)],c=bu2pt(e,38,0,0,e.lf),t=bu2Real(e,h-w);
      e.sl={pts,c,w:pts.map(q=>bu2Warn({k:'disc',x:q.x,y:q.y,r:30,dur:t})).concat([bu2Warn({k:'ring',x:c.x,y:c.y,r:230,dur:t,life:t+.9})])};bu2HoldAt(e,h)}
    if(b3at(e,h)&&e.sl){const S=e.sl;bu2Gone(S.w[0],S.w[1]);S.w[2].life=(G.t||0)-S.w[2].t0+.9;
      if(S.pts.some(q=>Math.hypot(P.x-q.x,P.y-q.y)<30+P.r*.4))hurtP(Math.round(22*DMG()));
      G.waves.push({x:S.c.x,y:S.c.y,r:14,max:230,dmg:Math.round(16*DMG()),hit:false,rgb:BU2.vio});
      for(const q of S.pts){vfxBlast(q.x,q.y,'150,90,230',46,{sparks:B3N(8),spcol:['#ffd84a','#c8a0ff','#ffffff'],dust:B3N(8),debris:'stone',n:B3N(6),ring2:false});stamp('crater',q.x,q.y,15)}
      b3fx(e,'pslam',S.c.x,S.c.y);shake(8);sfx('boom',0,S.c.x);vib([40,30,60]);e.sl=null}
    if(b3at(e,.74)||b3at(e,.8)){bu2Snd(e,'clac');shake(1)}
    if(e.stT<=0)bu2Walk(e);break}
  // ---- MANATE A CATENA (second phase): the line toward you locks (.04) with three circles on it; three fists (.40, .64, .90), the Shadow
  // drags him 45 px along the line between them; the last one, both fists, sends the wave
  case 'slam3':{e.moving=false;e.face=e.lf;const H=I.slam3||[.4,.64,.9];
    if(b3at(e,.04)){const ang=Math.atan2(P.y-e.y,P.x-e.x);e.lf=bu2Face(ang);e.face=e.lf;
      const reach=bu2Reach(e.x,e.y,ang,90+e.r,e.r*.6),step=clamp((reach-e.r*.5)/2,0,45),f0=bu2pt(e,38,0,0,e.lf);
      const c=[0,1,2].map(i=>({x:f0.x+Math.cos(ang)*step*i,y:f0.y+Math.sin(ang)*step*i}));
      e.ch={ang,step,c,w:c.map((q,i)=>bu2Warn({k:'disc',x:q.x,y:q.y,r:30,dur:bu2Real(e,H[i]-.04)}))};
      const t3=bu2Real(e,H[2]-.04);e.ch.w.push(bu2Warn({k:'ring',x:c[2].x,y:c[2].y,r:290,dur:t3,life:t3+1}));for(const h of H)bu2HoldAt(e,h)}
    const C=e.ch;
    if(C){for(const[a0,a1] of[[.42,.54],[.66,.78]]){const s=bu2Seg(e,a0,a1)*C.step;if(s>0)moveCircle(e,Math.cos(C.ang)*s,Math.sin(C.ang)*s)}
      H.forEach((h,i)=>{if(!b3at(e,h))return;const q=C.c[i],big=i===2;bu2Gone(C.w[i]);
        if(Math.hypot(P.x-q.x,P.y-q.y)<30+P.r*.4)hurtP(Math.round((big?22:18)*DMG()));
        if(big){G.waves.push({x:q.x,y:q.y,r:14,max:290,dmg:Math.round(16*DMG()),hit:false,rgb:BU2.mag});C.w[3].life=(G.t||0)-C.w[3].t0+1}
        vfxBlast(q.x,q.y,'190,90,220',big?56:40,{sparks:B3N(big?10:6),spcol:['#ffd84a','#ff8ad8','#ffffff'],dust:B3N(big?10:6),debris:'stone',n:B3N(big?8:5),ring2:false});stamp('crater',q.x,q.y,big?17:13);
        shake(big?8:5);sfx('boom',0,q.x);vib(big?[40,30,60]:25);b3fx(e,big?'pslam':'pchain',q.x,q.y)});
      // the strings of the next fist light up again: the bells
      if(b3at(e,.44)||b3at(e,.68))bu2Snd(e,'bells');if(b3at(e,.95)){bu2Snd(e,'clac');shake(1)}}
    if(e.stT<=0){e.ch=null;bu2Walk(e)}break}
  // ---- FILI D'ORO: a red band across the room through him, three golden arrows toward your side (.04); the thread of today runs from him
  // (.40). In the second phase it stays taut against the far wall and comes back after 2.2 s (bu2Update)
  case 'strings':{e.moving=false;const h=I.strings||.4;if(k<.04){e.lf=fa;e.face=fa}else e.face=e.lf;
    if(b3at(e,.04)){const ang=Math.atan2(P.y-e.y,P.x-e.x);e.sa=ang;e.lf=bu2Face(ang);e.face=e.lf;const t=bu2Real(e,h-.04);e.sw=bu2Warn({k:'band',x:e.x,y:e.y,a:ang,w:10,dur:t});bu2HoldAt(e,h)}
    if(b3at(e,h)&&e.sa!=null){bu2Gone(e.sw);const p2=!!e.p2;b3thread(e.x,e.y,e.sa,p2?340:290,18,{s0:22});
      if(p2){const th=G.b3.thr[G.b3.thr.length-1],ca=Math.cos(e.sa),sa=Math.sin(e.sa);let s=1e9;
        if(ca>.01)s=Math.min(s,(R-e.x)/ca);if(ca<-.01)s=Math.min(s,(L-e.x)/ca);if(sa>.01)s=Math.min(s,(BOT-e.y)/sa);if(sa<-.01)s=Math.min(s,(TOP-e.y)/sa);
        B.ret={h:th,x0:e.x,y0:e.y,a:e.sa,sp:Math.max(40,s-6),park:null,back:false,home:false}}
      b3fx(e,'pstrings');sfx('shimmer',2,e.x);sfx('dash',0,e.x);e.sa=null}
    if(e.stT<=0)bu2Walk(e);break}
  // ---- SEI IL MIO BURATTINO! The aim (.06-.28): a golden dashed line from the tip of his right index to you, following you; the click
  // (.28): it locks and flashes white; the thread runs along it (.68) at 900 px/s (bu2Update). While it flies he holds the flick (.70)
  case 'lasso':{e.moving=false;const lk=I.lassoLock||.28,sh=I.lasso||.68;
    if(k<lk){e.face=fa;e.lf=fa;if(k>=.06)B.aim={lock:false}}else e.face=e.lf;
    if(b3at(e,lk)){B.aim={lock:true,tx:P.x,ty:P.y-8,fx:P.x,fy:P.y,lt:G.t||0};bu2Snd(e,'click');sfx('click',0,e.x)}
    if(b3at(e,sh)&&B.aim&&B.aim.lock){const A=B.aim,la=Math.atan2(A.fy-e.y,A.fx-e.x),len=Math.min(420,bu2Reach(e.x,e.y,la,420,4)),T0=bu2Tip(e);
      B.lasso={ex:e.x,ey:e.y,a:la,s:20,len,d0:Math.max(30,Math.hypot(A.fx-e.x,A.fy-e.y)),T0,H:{x:A.tx,y:A.ty},st:'fly'};B.aim=null;
      b3fx(e,'plasso');bu2Snd(e,'fwip')}
    if(B.lasso&&B.lasso.st==='fly'&&k>.7){const D=B3D(e,'lasso');e.stT+=e.mt-.7*D;e.mt=.7*D}
    if(e.stT<=0){B.aim=null;bu2Walk(e)}break}
  // ---- TIRA! (it caught you): three tugs (.12, .39, .66) pull you 26 px toward him in 0.1 s; the red circle of the punch in front of
  // him (.12), the punch (.94)
  case 'yank':{e.moving=false;const Y=I.yank||[.12,.39,.66],h=I.yankHit||.94;if(k<.12)e.face=fa;else e.face=e.lf;
    if(b3at(e,.12)){e.lf=fa;e.face=fa;const q=bu2pt(e,44,0,0,e.lf);e.yc={x:q.x,y:q.y,w:bu2Warn({k:'disc',x:q.x,y:q.y,r:40,dur:bu2Real(e,h-.12)})};bu2HoldAt(e,h)}
    for(const c of Y)if(b3at(e,c)&&B.tied){B.pull={left:26,t:.1};bu2Snd(e,'clac');shake(1.5)}
    if(b3at(e,.72))bu2Snd(e,'zing');
    if(b3at(e,h)&&e.yc){const q=e.yc;bu2Gone(q.w);if(Math.hypot(P.x-q.x,P.y-q.y)<40+P.r*.4)hurtP(Math.round(26*DMG()));
      vfxBlast(q.x,q.y,'150,90,230',44,{sparks:B3N(8),spcol:['#ffd84a','#c8a0ff','#ffffff'],dust:B3N(6),ring2:false});shake(5);sfx('boom',0,q.x);e.yc=null}
    if(e.stT<=0){bu2Untie();e.yc=null;bu2Walk(e)}break}
  // ---- FILO SPEZZATO: he reels back with all his strings slack (the blows hurt more, hurtE below)
  case 'snap':{e.moving=false;e.face=e.lf;e.air=k<.6?1:0;if(b3at(e,.62)||b3at(e,.7)||b3at(e,.8))bu2Snd(e,'tac');if(e.stT<=0)bu2Walk(e);break}
  // ---- BURATTINI: two trapdoors (three in the second phase) in front of him (.08), they open and the puppets jump out (.62), they shut (.80)
  case 'puppets':{e.moving=false;e.face=e.lf;const h=I.puppets||.62;
    if(b3at(e,.08)){const T=bu2TrapSpots(e,e.p2?3:2),t=bu2Real(e,h-.08);e.bu2mv=(e.bu2mv||0)+1;for(const q of T)B.traps.push({x:q.x,y:q.y,t:0,dur:t,open:-1,close:-1,p2:!!e.p2,mv:e.bu2mv});bu2HoldAt(e,h);bu2Snd(e,'trap')}
    if(b3at(e,h)){let any=0;for(const tr of B.traps)if(tr.mv===e.bu2mv&&tr.open<0){tr.open=0;any=1;
        if(Math.hypot(P.x-tr.x,P.y-tr.y)<13+P.r*.5)hurtP(Math.round(14*DMG()));
        if(bu2Puppets()<4){const m=makeE('puppet',tr.x,tr.y,0);m.p2=!!e.p2;m.face=Math.atan2(P.y-tr.y,P.x-tr.x);m.pu2sp=.8;m.st='spawn';G.enemies.push(m)}
        b3fx(e,'ptrap',tr.x,tr.y);b3fx(e,'ppuppet',tr.x,tr.y)}
      if(any){bu2Snd(e,'trap');shake(2)}}
    if(b3at(e,.8))for(const tr of B.traps)if(tr.mv===e.bu2mv&&tr.close<0){tr.close=0;if(tr.open<0)tr.open=0}
    if(e.stT<=0)bu2Walk(e);break}
  // ---- SIPARIO: the red curtain comes down in front of him, the strings snatch him up (.45): gone (the model still draws the curtain going
  // up empty); then the spotlight
  case 'vanish':{e.moving=false;e.face=fa;const h=I.vanish||.45;
    if(b3at(e,h)){e.hidden=true;b3fx(e,'psink',e.x,e.y);sfx('creep',2,e.x);bu2Snd(e,'fwip')}
    if(b3at(e,.06))bu2Snd(e,'velvet');
    if(e.stT<=0)bu2Spot(e);break}
  // ---- IL RIFLETTORE (real seconds): it starts on you and follows you at 110 px/s for 0.6 s (you run at 150), then it locks for 0.35 s
  case 'spot':{e.moving=false;e.hidden=true;e.alpha=0;e.air=1;const S=B.spot;if(!S){bu2Spot(e);break}S.t+=rdt;
    if(!S.lock){const dx=P.x-S.x,dy=P.y-S.y,dd=Math.hypot(dx,dy);if(dd>1){const s=Math.min(dd,110*rdt);S.x+=dx/dd*s;S.y+=dy/dd*s}
      if(S.t>=.6){S.lock=true;S.lt=0;S.lockT=G.t||0;const q=bu2Free(S.x,S.y,26);S.x=q.x;S.y=q.y;bu2Snd(null,'arp',S.x);fxPush({k:'flash',x:S.x,y:S.y-10,r:50,rgb:BU2.light,t:.15,max:.15})}}
    else{S.lt+=rdt;if(S.lt>=.35)bu2Drop(e,S)}
    break}
  // ---- DAL RIFLETTORE: he falls from up high (.00-.28, from 260), the thud (.28): a heap of wood and velvet with the strings slack (the
  // blows hurt more until .80), a ring of shadow orbs; the strings pull taut one by one and set him up again
  case 'drop':{e.moving=false;e.face=fa;e.hidden=false;e.alpha=1;const h=I.drop||.28;e.z=k<h?260*(1-(k/h)**2):0;
    // in the air, then a heap nobody moves (defenceless): his body hurts nobody, the thud does
    e.air=1;
    if(b3at(e,h)){e.z=0;e.air=0;moveCircle(e,0,0);const S=B.spot;if(S&&S.w)bu2Gone(S.w);B.spot=null;
      if(Math.hypot(P.x-e.x,P.y-e.y)<46+P.r*.4)hurtP(Math.round(26*DMG()));
      const n=e.p2?16:12,o=rand(0,TAU);for(let i=0;i<n;i++)shootE(e.x,e.y-16,o+i*TAU/n,135,7,12,'shadow');
      fxPush({k:'ring2',x:e.x,y:e.y-8,rgb:e.p2?BU2.mag:BU2.vio,r0:12,r1:110,t:.45,max:.45,w:7});dustRing(e.x,e.y,B3N(16));
      b3fx(e,'pdrop',e.x,e.y);shake(7);bu2Snd(e,'thud');vib([50,30,70]);if(!G.pu2Txt3){G.pu2Txt3=1;text(e.x,e.y-70,'Fili allentati!','#ffd84a',18)}}
    for(const c of[.6,.7,.76,.84])if(b3at(e,c)){bu2Snd(e,'tac');shake(.8)}
    if(e.stT<=0){e.z=0;e.air=0;bu2Walk(e);e.nocon=1;e.air=1}break}
  // ---- MANO DELL'OMBRA (second phase): the shadow of a huge hand starts under you and follows you at 95 px/s (.08-.36), locks (.36), the
  // hand falls from the dark (.78)
  case 'hand':{e.moving=false;e.face=fa;const lk=I.handLock||.36,h=I.hand||.78;
    if(b3at(e,.08))B.hand={x:P.x,y:P.y,lock:false,a:rand(-.25,.25)};
    if(B.hand&&!B.hand.lock&&k<lk){const H=B.hand,dx=P.x-H.x,dy=P.y-H.y,dd=Math.hypot(dx,dy);if(dd>1){const s=Math.min(dd,95*rdt);H.x+=dx/dd*s;H.y+=dy/dd*s}}
    if(b3at(e,lk)&&B.hand){const H=B.hand;H.lock=true;const q=bu2Free(H.x,H.y,10);H.x=q.x;H.y=q.y;H.w=bu2Warn({k:'disc',x:H.x,y:H.y,r:50,dur:bu2Real(e,h-lk)+.08,mag:1});bu2HoldAt(e,h);bu2Snd(e,'click')}
    if(b3at(e,h)&&B.hand){const H=B.hand;B.fall={x:H.x,y:H.y,a:H.a,t:0,hit:false,w:H.w};B.hand=null;bu2Snd(e,'breath')}
    if(e.stT<=0){B.hand=null;bu2Walk(e)}break}
  // ---- IL VERO BURATTINAIO (half health): he falls in a heap, the Shadow's hand catches the cross and pulls him up; three clacks (.62,
  // .68, .74), the laugh in two voices (.80); he cannot be hit (e.shell) and does not attack; then the Hand of the Shadow
  case 'rage':{e.moving=false;e.face=fa;e.air=1;
    for(const c of[.62,.68,.74])if(b3at(e,c)){bu2Snd(e,'clac');shake(1.5)}
    if(b3at(e,.8)){b3say(e,'angry');e.omT=(G.t||0)+.15;b3fx(e,'phase2');shake(8);vib([60,40,120]);
      for(let i=0;i<3;i++)setTimeout(()=>{if(G&&G.fx)fxPush({k:'ring2',x:e.x,y:e.y-60,rgb:BU2.mag,r0:e.r,r1:e.r*5,t:.45,max:.45,w:6-i*1.5})},i*170)}
    if(e.omT&&(G.t||0)>=e.omT){e.omT=0;b3say(e,'ombra',true)}
    if(e.stT<=0){e.shell=0;e.air=0;e.si=0;e.lf=fa;e.face=fa;const S=e.b3s||(e.b3s={});S.tauntT=(G.t||0)+4;S.pend=0;b3go(e,'hand')}
    break}
  default:bu2Walk(e)}};
// the next move of the round: the Hand, the chain, the threads, the puppet's thread, the puppets, the curtain (2nd phase), or the round of
// the first. The puppet's thread wants you 90-400 px away: if you are not, he first walks (at most 1 s more) or goes on to the next move;
// the puppets skip their turn when three are still up
function bu2Next(e){const seq=e.p2?BU2.seq2:BU2.seq1;
  for(let n=0;n<seq.length;n++){const i=((e.si==null?-1:e.si)+1)%seq.length,nx=seq[i];
    if(nx==='puppets'&&bu2Puppets()>=3){e.si=i;continue}
    if(nx==='lasso'){const dd=Math.hypot(P.x-e.x,P.y-e.y);if(dd<90||dd>400){if(!e.lx){e.lx=1;bu2Walk(e,1);e.anchor=bu2Anchor(e);return}e.lx=0;e.si=i;continue}}
    e.lx=0;e.si=i;bu2Begin(e,nx);return}
  bu2Walk(e)}
function bu2Begin(e,nx){const a=Math.atan2(P.y-e.y,P.x-e.x);e.lf=bu2Face(a);e.face=e.lf;e.moving=false;e.anchor=null;e.nocon=0;e.air=0;
  if(nx==='vanish')sfx('creep',2,e.x);b3go(e,nx)}
// where the trapdoors open: 60-85 px from him toward you (±70°), 40 px from each other, never 70 px near you, on obstacles or on the door
function bu2TrapSpots(e,n){const a0=Math.atan2(P.y-e.y,P.x-e.x),T=[];
  for(let i=0;i<60&&T.length<n;i++){const an=a0+rand(-1.22,1.22),r=rand(60,85),x=e.x+Math.cos(an)*r,y=e.y+Math.sin(an)*r;
    if(bu2Bad(x,y,16)||Math.hypot(x-P.x,y-P.y)<70||T.some(q=>Math.hypot(q.x-x,q.y-y)<40))continue;T.push({x,y})}
  return T}
// the spotlight: he is gone, the light starts on you; it locks, then he falls on its middle
function bu2Spot(e){const B=G.pu2;b3go(e,'spot',99);e.hidden=true;e.alpha=0;e.air=1;e.moving=false;const q=bu2Free(P.x,P.y,10);
  B.spot={x:q.x,y:q.y,t:0,lock:false,lt:0};B.spot.w=bu2Warn({k:'spot',x:q.x,y:q.y,r:46,dur:2,life:99});b3fx(e,'pspot')}
function bu2Drop(e,S){e.x=S.x;e.y=S.y;e.hidden=false;e.alpha=1;e.z=260;e.air=1;e.moving=false;S.drop=1;b3go(e,'drop');bu2HoldAt(e,bu2I().drop||.28,S.lockT)}
// the rage at half health (not b3phase: its cries and its arena come at .80 of the move, from the brain)
function bu2Rage(e){e.raged=1;e.p2=true;e.shell=99;e.air=1;e.moving=false;e.hidden=false;e.alpha=1;e.z=0;e.anchor=null;
  G.eproj=[];if(G.b3)G.b3.warn=[];const B=G.pu2;B.warn=[];B.aim=null;B.hand=null;
  banner("L'Ombra tira i fili!",'Fase 2',1.6);bossRage(e,BU2.mag);$('bossBar').classList.add('rage');shake(4);bu2Snd(e,'clac');b3go(e,'rage')}
// the head follows you: the angle toward you less the direction drawn (±1.9 rad), soft
function bu2Look(e,rdt){const f=e.f3!=null?e.f3:(e.face||0),fa=Math.atan2((P.y-e.y)/bu2K(),P.x-e.x),tg=clamp(angDiff(f,fa),-1.9,1.9),v=e.look3||0;e.look3=v+(tg-v)*(1-Math.exp(-rdt*7))}
// the cross, the strings over his head and the Shadow get veiled when you stand behind him (over him on the screen)
function bu2Veil(e,rdt){const on=P.y<e.y&&e.y-P.y<175&&Math.abs(P.x-e.x)<45?1:0,v=e.veil3||0;e.veil3=v+clamp(on-v,-rdt*5,rdt*5)}
function bu2Untie(){const B=G.pu2;if(B){B.tied=null;B.pull=null;B.lasso=null}}
// the thread caught you: at once 'yank'
function bu2Catch(e){const B=G.pu2;B.lasso=null;B.tied={t:0};G.pu2Catch=(G.pu2Catch||0)+1;e.lf=bu2Face(Math.atan2(P.y-e.y,P.x-e.x));e.face=e.lf;b3go(e,'yank');
  fxPush({k:'ring2',x:P.x,y:P.y-8,rgb:BU2.goldL,r0:6,r1:22,t:.3,max:.3,w:3});bu2Snd(e,'tac');
  if(!G.pu2Txt1){G.pu2Txt1=1;text(P.x,P.y-52,'Scatta per spezzare il filo!','#ffd84a',16)}}
// a dash while you are tied: the thread snaps back on him with sparks, he reels (Filo spezzato)
function bu2Snap(e){const B=G.pu2;B.tied=null;B.pull=null;B.lasso=null;if(!e||e.st!=='yank')return;const tip=bu2Tip(e);
  for(let i=0;i<=B3N(10);i++){const u=i/B3N(10);fxPush({k:'spark',x:P.x+(tip.x-P.x)*u+rand(-3,3),y:P.y-8+(tip.y-P.y+8)*u+rand(-3,3),t:rand(.18,.3)})}
  if(!LOWFX)fxPush({k:'flash',x:tip.x,y:tip.y,r:26,rgb:BU2.goldL,t:.15,max:.15});if(e.yc){bu2Gone(e.yc.w);e.yc=null}
  bu2Snd(e,'twang');b3go(e,'snap');if(!G.pu2Txt2){G.pu2Txt2=1;text(e.x,e.y-150,'Filo spezzato!','#ffd84a',18)}}
// «the thread goes back to its master»: a puppet you break hurts him (1.2% of his health), a golden trail from it to the cross
function bu2Return(m){const e=bu2Boss();if(!e||!G.pu2||e.hidden||(e.z||0)>20||e.st==='rage'||e.shell>0||e.intro>0)return;
  G.pu2.trails.push({x:m.x,y:m.y-10,t:0,p2:!!e.p2})}
// ---- the dangers in real time
function bu2Update(dt){const B=G.pu2;if(!B)return;
  if(G.state!=='play'){if(B.warn.length||B.traps.length||B.trails.length||B.aim||B.lasso||B.tied||B.spot||B.hand||B.fall||B.ret){const bk=B.baked;bu2Reset();G.pu2.baked=bk}return}
  const e=bu2Boss(),now=G.t||0;
  for(let i=B.warn.length-1;i>=0;i--){const w=B.warn[i];if(w.gone||now-w.t0>w.life)B.warn.splice(i,1)}
  // the thread of the puppet: it flies along the locked line (its path on the floor), stops against walls and obstacles; it catches you if
  // its point passes within P.r+5 of you and you are not dashing nor invulnerable; else it goes back
  const Lz=B.lasso;
  if(Lz&&e){if(Lz.st==='fly'){const s0=Lz.s;Lz.s=Math.min(Lz.len,Lz.s+900*dt);const ca=Math.cos(Lz.a),sa=Math.sin(Lz.a),x0=Lz.ex+ca*s0,y0=Lz.ey+sa*s0,x1=Lz.ex+ca*Lz.s,y1=Lz.ey+sa*Lz.s;
      if(P.inv<=0&&P.dashT<=0&&e.st==='lasso'&&bu2SegD(P.x,P.y,x0,y0,x1,y1)<P.r+5)bu2Catch(e);
      else if(Lz.s>=Lz.len){Lz.st='back';if(Lz.len<419)fxPush({k:'spark',x:x1,y:y1-10,t:.2})}}
    else if(Lz.st==='back'){Lz.s-=1300*dt;if(Lz.s<=10)B.lasso=null}}
  else if(Lz&&!e)B.lasso=null;
  // tied: a dash snaps the thread; the tugs pull you (26 px in 0.1 s, up to 70% less if you run away; never nearer than 70 px to him;
  // never into walls or obstacles: moveCircle, as for your own steps)
  if(B.tied){if(!e||e.st!=='yank')bu2Untie();else if(P.dashT>0)bu2Snap(e);
    else if(B.pull){const pl=B.pull;pl.t-=dt;const dx=e.x-P.x,dy=e.y-P.y,dd=Math.hypot(dx,dy);
      if(dd>70){const ux=dx/dd,uy=dy/dd,run=clamp(-((P.vxs||0)*ux+(P.vys||0)*uy)/(P.spd||150),0,1),s=Math.min(pl.left,260*dt*(1-.7*run),dd-70);if(s>0){moveCircle(P,ux*s,uy*s);pl.left-=s}}
      if(pl.t<=0||pl.left<=0)B.pull=null}}
  // the trapdoors: the light grows in the cracks, they open (0.1 s), stay open, shut (0.3 s) and are baked into the floor (at most 6)
  for(let i=B.traps.length-1;i>=0;i--){const tr=B.traps[i];tr.t+=dt;if(tr.open>=0)tr.open+=dt;if(tr.close>=0){tr.close+=dt;if(tr.close>=.3){B.traps.splice(i,1);bu2Bake(tr)}}}
  // the trails of the broken puppets fly to the cross in 0.25 s: he flinches and moans
  for(let i=B.trails.length-1;i>=0;i--){const s=B.trails[i];s.t+=dt;if(s.t<.25)continue;B.trails.splice(i,1);
    if(e&&!e.dead&&!e.hidden&&e.st!=='rage'&&!(e.shell>0)){const dmg=Math.max(1,Math.round(e.max*.012));e.hp-=dmg;e.flash=.08;e.jig3=1;text(e.x+rand(-6,6),e.y-140,dmg,'#ffd84a',15);
      const c=bu2Cross(e);if(!LOWFX)fxPush({k:'flash',x:c.x,y:c.y,r:24,rgb:s.p2?BU2.magL:BU2.goldL,t:.15,max:.15});b3say(e,'hurt');if(e.hp<=0)killE(e)}}
  // the falling Hand: from 260 to the floor in 0.08 s, it presses 0.15 s, it rises in 0.3 s
  const F=B.fall;if(F){F.t+=dt;if(!F.hit&&F.t>=.08){F.hit=true;bu2Gone(F.w);if(Math.hypot(P.x-F.x,P.y-F.y)<50+P.r*.4)hurtP(Math.round(28*DMG()));
      shake(9);bu2Snd(null,'handhit',F.x);vib([60,40,90]);dustRing(F.x,F.y,B3N(18));fxPush({k:'flash',x:F.x,y:F.y-20,r:70,rgb:BU2.magL,t:.18,max:.18});b3fx(e,'phand',F.x,F.y,F.a)}
    if(F.t>=.53)B.fall=null}
  // the thread of the second phase: it stops taut against the far wall, its band lights up 0.8 s before it starts again, it comes back
  // 2.2 s later as a second thread from the wall across the room; he is «home» when it has passed him
  const Rt=B.ret;
  if(Rt){if(!Rt.park&&!Rt.back){if(!G.b3||!G.b3.thr.includes(Rt.h))B.ret=null;else if(Rt.h.s>=Rt.sp){G.b3.thr.splice(G.b3.thr.indexOf(Rt.h),1);Rt.park={x:Rt.x0+Math.cos(Rt.a)*Rt.sp,y:Rt.y0+Math.sin(Rt.a)*Rt.sp,t:0};sfx('shimmer',0,Rt.park.x)}}
    else if(Rt.park){const K=Rt.park;K.t+=dt;if(K.t>=1.4&&!K.w)K.w=bu2Warn({k:'band',x:K.x,y:K.y,a:Rt.a+Math.PI,w:10,dur:.8,life:.8,back:1});
      if(K.t>=2.2){b3thread(K.x,K.y,Rt.a+Math.PI,340,18,{s0:0});Rt.h2=G.b3.thr[G.b3.thr.length-1];Rt.px=K.x;Rt.py=K.y;Rt.park=null;Rt.back=true;bu2Gone(K.w);sfx('shimmer',1,K.x);sfx('dash',0,K.x)}}
    else if(Rt.back){const h=Rt.h2;if(!h||!G.b3||!G.b3.thr.includes(h))B.ret=null;else if(!Rt.home){const b=e||{x:Rt.x0,y:Rt.y0},dp=(b.x-Rt.px)*Math.cos(h.a)+(b.y-Rt.py)*Math.sin(h.a);if(h.s>=dp)Rt.home=true}}}}
// the distance from (px,py) to the segment (x0,y0)-(x1,y1)
function bu2SegD(px,py,x0,y0,x1,y1){const dx=x1-x0,dy=y1-y0,l2=dx*dx+dy*dy,u=l2>0?clamp(((px-x0)*dx+(py-y0)*dy)/l2,0,1):0;return Math.hypot(px-(x0+dx*u),py-(y0+dy*u))}
{const _u=update;update=function(dt){_u.apply(this,arguments);try{if(PU2ON&&G&&G.pu2&&started&&!paused)bu2Update(dt)}catch(err){console.error(err)}}}
// ---- the hooks
// the blows: he flinches (o.jig); while he cannot be hit (the rage) only a spark; the reeling of the snapped thread and the heap of the
// fall (.28-.80) take 50% more
{const _h=hurtE;hurtE=function(e,d,crit,dot){if(PU2ON&&e&&e.type==='puppeteer'&&!e.dead&&!(e.intro>0)){
  if(e.shell>0){if(!(e._shF>(G.t||0)-.12)){e._shF=G.t||0;G.fx.push({k:'spark',x:e.x+rand(-16,16),y:e.y-40-rand(0,50),t:.15})}return}
  if(!dot&&!e.hidden)e.jig3=1;
  if(e.st==='snap'||e.st==='drop'&&b3k(e)>=(bu2I().drop||.28)&&b3k(e)<.8){const A=[...arguments];A[1]=d*1.5;return _h.apply(this,A)}}return _h.apply(this,arguments)}}
// a puppet you break (killE without its second argument: not the ones that wear out, nor those of the defeat) hurts its master
{const _k=killE;killE=function(e,noLoot){const r=_k.apply(this,arguments);try{if(PU2ON&&e&&e.type==='puppet'&&!noLoot)bu2Return(e)}catch(err){}return r}}
// the puppets: out of the trapdoor for 0.8 s, hanging on its string (the move 'spawn': it neither moves nor shoots); no orbs while you are tied
{const _pu=EUPD.puppet;EUPD.puppet=function(e,dt,sm,a,d){if(!PU2ON)return _pu.apply(this,arguments);
  if(e.pu2sp>0){e.pu2sp-=dt;e.moving=false;e.face=a;e.st='spawn';if(e.pu2sp<=0)e.st=null;return}
  if(G.pu2&&G.pu2.tied){e.aim=0;e.cd=Math.max(e.cd==null?0:e.cd,.4)}return _pu.apply(this,arguments)}}
// what the model plays: the entrance over its whole length, every move on the brain's clock (the blow always on its frame), the spotlight
// hidden; the walk with its own clock (N3G.wp)
if(PU2ON){const _nm=n3Move;n3Move=function(e){if(e.type!=='puppeteer')return _nm.apply(this,arguments);
  if(e.intro>0)return['enter',Math.min(.999,Math.max(0,(e.iT||0)/BOSS_INTRO.puppeteer))];
  if(e.st==='enter')return['enter',.999];if(e.st==='spot')return['idle',0];
  const an=(N3.meta.puppeteer&&N3.meta.puppeteer.an)||[];if(e.st&&e.st!=='walk'&&an.includes(e.st))return[e.st,Math.min(.999,Math.max(0,b3k(e)))];
  return _nm.apply(this,arguments)}}
// no charging ring for the states that are no attack (in place of adding them to the shared B2CALM: other bosses have a 'rage' or a 'drop')
if(PU2ON){const _bf=b2front;b2front=function(e){if(e&&e.type==='puppeteer'&&BU2.calm.has(e.st))e._b2st=e.st;return _bf.apply(this,arguments)}}
// the call of 88-boss3-voci.js (b3taunt with the call's time) is his 'call', not the mocking
if(PU2ON){const _bt=b3taunt;b3taunt=function(e){_bt.apply(this,arguments);try{const S=e&&e.b3s;if(e.type==='puppeteer'&&S&&S.callT!=null&&S.callT===S.tauntT&&e.st==='taunt')b3go(e,'call')}catch(err){}}}
// every start of a move forgets the holds of the move before; the signal before every attack: the zing and the bells (you hear it coming
// even with him off the screen); the snapped thread always moans (its voice is 'hurt')
{const _g=b3go;b3go=function(e,st){if(PU2ON&&e&&e.type==='puppeteer'&&st==='snap'&&e.b3s)e.b3s.talkT=-99;_g.apply(this,arguments);
  try{if(PU2ON&&e.type==='puppeteer'){e.hold3=[];if(!(e.intro>0)&&BU2.att.has(st))bu2Snd(e,'zing')}}catch(err){}}}
// the jaw talks while the voice lasts (b3say gives back how long)
{const _s=b3say;b3say=function(e,k){const d=_s.apply(this,arguments);try{if(PU2ON&&d&&e&&e.type==='puppeteer')e.talkT=Math.max(e.talkT||0,(G.t||0)+d)}catch(err){}return d}}
// ---- the drawings
// the trapdoor's moment: 0 shut (its light grows), opening in 0.1 s to .3, open .3-.7, shutting in 0.3 s to 1
function bu2TrapK(tr){if(tr.close>=0)return .7+.3*clamp(tr.close/.3,0,1);if(tr.open>=0)return tr.open<.1?.3*tr.open/.1:.3+.4*clamp((tr.open-.1)/.4,0,1);return 0}
function bu2TrapDraw(x,y,k,o){const T=bu2a('Trap');if(T){try{T(x,y,k,1,o);return}catch(err){}}
  const w=13,h=7.2,op=k<.3?k/.3:k<.7?1:1-(k-.7)/.3;ctx.save();ctx.lineJoin='round';ink(2);ctx.fillStyle='#2d190c';ctx.beginPath();ctx.rect(x-w,y-h,w*2,h*2);ctx.fill();ctx.stroke();
  if(op>0){ctx.fillStyle='#0c0608';ctx.fillRect(x-w+2,y-h+2,(w-2)*2,(h-2)*2)}ctx.fillStyle='#5f3b22';for(const sd of[-1,1]){const dw=w*(1-op*.85);ctx.beginPath();ctx.rect(sd<0?x-w:x+w-dw,y-h,dw,h*2);ctx.fill();ctx.stroke()}
  const gl=clamp((o.glow||0)+op,0,1);if(gl>0){ctx.strokeStyle=`rgba(${o.p2?'255,120,210':'255,210,110'},${(.3+.6*gl).toFixed(3)})`;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(x,y-h+1);ctx.lineTo(x,y+h-1);ctx.stroke()}ctx.restore()}
// a shut trapdoor baked into the floor (like the hole of the Golem's slab), at most six in a room
function bu2Bake(tr){const B=G.pu2;if(!B||B.baked>=6||typeof fx==='undefined'||!fx)return;B.baked++;const saved=ctx;try{ctx=fx;fx.save();fx.setTransform(2,0,0,2,0,0);bu2TrapDraw(tr.x,tr.y,0,{glow:0,noFx:true});fx.restore()}catch(err){}finally{ctx=saved}}
// the hand of the Shadow (the model's own if it has one)
function bu2HandDraw(x,y,z,k,a){const H=bu2a('Hand');if(H){try{H(x,y,z,k,1,{a,noFx:LOWFX});return}catch(err){}}
  const yy=y-z,op=k<.3?.6+.4*k/.3:k<.65?1:1-.6*(k-.65)/.35;ctx.save();ctx.translate(x,yy);ctx.rotate(a||0);ink(3);
  for(let i=0;i<4;i++){ctx.save();ctx.translate((i-1.5)*9,-14);ctx.rotate((i-1.5)*.34*op);ctx.beginPath();ctx.ellipse(0,-13,5.2,15,0,0,TAU);fs('#2a1444');ctx.restore()}
  ctx.save();ctx.translate(-20,4);ctx.rotate(-.9-.5*op);ctx.beginPath();ctx.ellipse(0,-12,5.5,14,0,0,TAU);fs('#2a1444');ctx.restore();
  ctx.beginPath();ctx.ellipse(0,0,22,19,0,0,TAU);fs('#2a1444');ctx.strokeStyle=`rgba(${BU2.mag},.6)`;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,23,20,0,Math.PI*1.05,Math.PI*1.95);ctx.stroke();ctx.restore()}
// the shadow of the great hand on the floor: palm, four long fingers and the thumb, spread
function bu2HandShadow(x,y,a,al,s,edge){ctx.save();ctx.translate(x,y);ctx.rotate(a||0);ctx.scale(s,s*.7);ctx.fillStyle=`rgba(12,4,24,${al.toFixed(3)})`;
  ctx.beginPath();ctx.ellipse(0,4,22,19,0,0,TAU);ctx.fill();for(let i=0;i<4;i++){ctx.save();ctx.translate((i-1.5)*10,-12);ctx.rotate((i-1.5)*.32);ctx.beginPath();ctx.ellipse(0,-14,5.6,16,0,0,TAU);ctx.fill();ctx.restore()}
  ctx.save();ctx.translate(-22,6);ctx.rotate(-1.35);ctx.beginPath();ctx.ellipse(0,-12,5.8,14,0,0,TAU);ctx.fill();ctx.restore();
  if(edge){ctx.strokeStyle=edge;ctx.lineWidth=2.2/s;ctx.beginPath();ctx.ellipse(0,4,23,20,0,0,TAU);ctx.stroke()}ctx.restore()}
// on the floor: the trapdoors with their pulsing ring, the warnings (the circles that fill, the dashed ring of the wave, the band of the
// thread with its arrows, the spotlight's bright circle with its red edge), the shadow of the hand (following, locked), the shadow under
// the falling hand
function bu2Ground(){const B=G.pu2;if(!B)return;const t=G.t||0,red=BU2.red,pu=.55+.3*Math.sin(t*18);
  for(const tr of B.traps){const k=bu2TrapK(tr);bu2TrapDraw(tr.x,tr.y,k,{glow:tr.open<0?clamp(tr.t/Math.max(.1,tr.dur),0,1):1,p2:tr.p2,noFx:LOWFX});
    if(tr.open<0){ctx.strokeStyle=`rgba(${red},${pu})`;ctx.lineWidth=2.4;circ(tr.x,tr.y,16+1.5*Math.sin(t*14));ctx.stroke()}}
  for(const w of B.warn){const k=clamp((t-w.t0)/Math.max(.05,w.dur),0,1);
    if(w.k==='disc'){ctx.fillStyle=`rgba(${red},${(.07+.22*k).toFixed(3)})`;circ(w.x,w.y,w.r*(.25+.75*k));ctx.fill();ctx.strokeStyle=w.mag?`rgba(255,70,150,${pu})`:`rgba(${red},${pu})`;ctx.lineWidth=2.6;circ(w.x,w.y,w.r);ctx.stroke()}
    else if(w.k==='ring'){ctx.strokeStyle=`rgba(255,226,236,${(.3+.14*Math.sin(t*10)).toFixed(3)})`;ctx.lineWidth=1.6;ctx.setLineDash([6,7]);circ(w.x,w.y,w.r);ctx.stroke();ctx.setLineDash([])}
    else if(w.k==='band'){ctx.save();ctx.beginPath();ctx.rect(L,TOP,R-L,BOT-TOP);ctx.clip();ctx.translate(w.x,w.y);ctx.rotate(w.a+Math.PI/2);
      ctx.fillStyle=`rgba(${red},${(.06+.14*k).toFixed(3)})`;ctx.fillRect(-1200,-w.w/2,2400,w.w);ctx.strokeStyle=`rgba(${red},${pu})`;ctx.lineWidth=1.8;ctx.setLineDash([8,6]);ctx.strokeRect(-1200,-w.w/2,2400,w.w);ctx.setLineDash([]);
      // three golden arrows toward the side where the thread will run (in this frame -y is the way it runs)
      if(!w.back){ctx.fillStyle=`rgba(255,205,69,${(.55+.35*k).toFixed(3)})`;ctx.strokeStyle='rgba(60,30,8,.7)';ctx.lineWidth=1.2;for(const o of[-70,0,70]){const y0=-7,y1=-(18+9*k);ctx.beginPath();ctx.moveTo(o,y1-8);ctx.lineTo(o-8,y1);ctx.lineTo(o-3,y1);ctx.lineTo(o-3,y0);ctx.lineTo(o+3,y0);ctx.lineTo(o+3,y1);ctx.lineTo(o+8,y1);ctx.closePath();ctx.fill();ctx.stroke()}}
      ctx.restore()}
    else if(w.k==='spot'){const S=B.spot;if(!S)continue;const x=S.x,y=S.y,lk=S.lock;
      if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow(BU2.light,x,y,w.r*1.25,lk?(Math.sin(t*30)>0?.55:.35):.38,w.r*.8);ctx.restore()}
      ctx.fillStyle=`rgba(${BU2.light},${lk?.22:.14})`;circ(x,y,w.r);ctx.fill();ctx.strokeStyle=`rgba(${red},${lk?(Math.sin(t*30)>0?.95:.6):pu})`;ctx.lineWidth=lk?3:2.4;circ(x,y,w.r);ctx.stroke()}}
  if(B.hand){const H=B.hand;bu2HandShadow(H.x,H.y,H.a,H.lock?.42:.3,1.1,H.lock?`rgba(255,60,150,${pu})`:null)}
  if(B.fall){const F=B.fall,z=F.t<.08?260*(1-F.t/.08):F.t<.23?0:260*bu2Ez((F.t-.23)/.3),u=1-Math.min(1,z/260);bu2HandShadow(F.x,F.y,F.a,.15+.35*u,.75+.35*u)}}
// in the air: the aim of the thread, the thread of the puppet (flying, coming back, taut on you), the thread stopped against the wall, the
// spotlight's cone (and the thin golden thread coming down when it locks), the falling hand, the trails of the broken puppets
function bu2Air(){const B=G.pu2;if(!B)return;const t=G.t||0,e=bu2Boss();
  const line=(x0,y0,x1,y1,rgb,w,dash,al)=>{ctx.save();ctx.lineCap='round';ctx.strokeStyle='rgba(40,20,10,.5)';ctx.lineWidth=w+1.6;if(dash)ctx.setLineDash(dash);ctx.beginPath();ctx.moveTo(x0,y0+1);ctx.lineTo(x1,y1+1);ctx.stroke();
    ctx.strokeStyle=`rgba(${rgb},${al==null?1:al})`;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();ctx.restore()};
  if(B.aim&&e){const tip=bu2Tip(e),A=B.aim,tx=A.lock?A.tx:P.x,ty=A.lock?A.ty:P.y-8,fl=A.lock&&t-A.lt<.35&&Math.sin(t*40)>0;
    line(tip.x,tip.y,tx,ty,fl?'255,255,255':'255,205,69',fl?2.2:1.6,[7,6],A.lock?.95:.75);if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow('255,214,110',tip.x,tip.y,9,.6);ctx.restore()}}
  const Lz=B.lasso;if(Lz&&e){const tip=bu2Tip(e),u=Lz.s/Lz.d0,x1=Lz.T0.x+(Lz.H.x-Lz.T0.x)*u,y1=Lz.T0.y+(Lz.H.y-Lz.T0.y)*u;line(tip.x,tip.y,x1,y1,BU2.goldL,1.6);
    if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow('255,233,160',x1,y1,8,.7);ctx.restore()}}
  if(B.tied&&e){const tip=bu2Tip(e),hx=P.x,hy=P.y-8,j=B.pull?Math.sin(t*60)*1.2:0;line(tip.x,tip.y,hx,hy+j,BU2.goldL,1.8);
    ctx.strokeStyle=`rgba(255,205,69,${(.75+.2*Math.sin(t*12)).toFixed(3)})`;ctx.lineWidth=2;ell(P.x,P.y-6,13,7);ctx.stroke();
    if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';const u=(t*1.6)%1;glow('255,233,160',tip.x+(hx-tip.x)*u,tip.y+(hy-tip.y)*u,7,.6);ctx.restore()}}
  const K=B.ret&&B.ret.park;if(K){const a=B.ret.a,nx=-Math.sin(a),ny=Math.cos(a),v=Math.sin(t*38)*1.4;ctx.save();ctx.beginPath();ctx.rect(L-4,TOP-4,R-L+8,BOT-TOP+8);ctx.clip();
    line(K.x+nx*900,K.y+ny*900+v,K.x-nx*900,K.y-ny*900-v,'255,240,200',1.6,null,.85);ctx.restore()}
  const S=B.spot;if(S){if(!LOWFX){const top=Math.min(S.y-260,TOP-60),g=ctx.createLinearGradient(0,top,0,S.y);g.addColorStop(0,`rgba(${BU2.light},0)`);g.addColorStop(1,`rgba(${BU2.light},${S.lock?.26:.17})`);
      ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(S.x-18,top);ctx.lineTo(S.x+18,top);ctx.lineTo(S.x+46,S.y);ctx.lineTo(S.x-46,S.y);ctx.closePath();ctx.fill();ctx.restore()}
    if(S.lock){const u=Math.min(1,S.lt/.18),y0=S.y-300,y1=y0+(S.y-8-y0)*u;line(S.x,y0,S.x,y1,BU2.goldL,1.2,null,.9);if(u>=1&&!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow('255,240,190',S.x,S.y-8,12,.8);ctx.restore()}}}
  const F=B.fall;if(F){const z=F.t<.08?260*(1-F.t/.08):F.t<.23?0:260*bu2Ez((F.t-.23)/.3),k=F.t<.08?.3*Math.pow(F.t/.08,4):F.t<.23?.3+.3*(F.t-.08)/.15:.6+.4*bu2Ez((F.t-.23)/.3);
    ctx.save();ctx.globalAlpha=F.t>.43?Math.max(0,1-(F.t-.43)/.1):1;bu2HandDraw(F.x,F.y,z,k,F.a);ctx.restore()}
  if(B.trails.length&&e){const c=bu2Cross(e);for(const s of B.trails){const u=bu2Ez(s.t/.25),x=s.x+(c.x-s.x)*u,y=s.y+(c.y-s.y)*u-40*Math.sin(Math.PI*u),rgb=s.p2?BU2.magL:BU2.goldL;
      line(s.x+(x-s.x)*.6,s.y+(y-s.y)*.6,x,y,rgb,2,null,.8);if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow(rgb,x,y,10,.8);ctx.restore()}}}}
{const _g2=drawHazards2Ground;drawHazards2Ground=function(){_g2.apply(this,arguments);try{if(PU2ON)bu2Ground()}catch(err){}}}
{const _a2=drawHazards2Air;drawHazards2Air=function(){_a2.apply(this,arguments);try{if(PU2ON)bu2Air()}catch(err){}}}
// ---- the arena reacts to the new blows (the others are in 87-boss3-arena.js: pslam, pstrings, ppuppet, psink, phase2)
const BU2FX={
  // the first two fists of the chain: the obstacles shake, six chips, cracks, the torches magenta for half a second
  pchain(e,x,y){const S=stonePal();ENV2.rocks(x,y,110,1);ENV2.chunks(x,y,B3N(6),[S.hi,S.mid,S.lo],110);ENV2.mark('cracks',x,y,28);b3torch('magenta',.5)},
  // a trapdoor opens: a stain of shadow, four chips, golden sparks
  ptrap(e,x,y){const S=stonePal();b3mark('shadow',x,y,12);ENV2.chunks(x,y,B3N(4),[S.hi,S.mid,S.lo],80);if(!LOWFX)for(let i=0;i<6;i++)fxPush({k:'spark',x:x+rand(-10,10),y:y-rand(0,14),t:rand(.2,.35)})},
  // the thread of the puppet leaves: the torches gold (magenta in the second phase) for 0.4 s
  plasso(e){b3torch(e&&e.p2?'magenta':'gold',.4)},
  // the spotlight looks for you: the torches low for 1.2 s
  pspot(){b3torch('dim',1.2)},
  // the thud: the obstacles shake, dust from the ceiling, twelve chips, cracks, a stain of shadow, the grass bent
  pdrop(e,x,y){const S=stonePal();ENV2.rocks(x,y,170,2);ENV2.fall(B3N(6));ENV2.chunks(x,y,B3N(12),[S.hi,S.mid,S.lo],130);ENV2.mark('cracks',x,y,44);b3mark('shadow',x,y,26);ENV2.wiltGrass(x,y,60)},
  // the Hand: the obstacles shake hard, dust from the ceiling, cracks, a great stain of shadow shaped like a hand (five fingers), torches
  // magenta for 1.2 s
  phand(e,x,y,a){ENV2.rocks(x,y,220,3);ENV2.fall(B3N(10));ENV2.mark('cracks',x,y,56);b3mark('shadow',x,y,44);a=a||0;
    for(let i=0;i<4;i++){const an=-Math.PI/2+a+(i-1.5)*.32,d=52;b3mark('shadow',x+Math.cos(an)*d,y+Math.sin(an)*d*.62,9)}b3mark('shadow',x+Math.cos(Math.PI+a-.4)*42,y+Math.sin(Math.PI+a-.4)*42*.62,9);
    ENV2.wiltGrass(x,y,80);b3torch('magenta',1.2)}};
{const _f=b3fx;b3fx=function(e,what,x,y,r){if(!PU2ON||!BU2FX[what])return _f.apply(this,arguments);if(!BOSS2||!G||!G.rocks)return;try{BU2FX[what](e,x,y,r)}catch(err){}}}
// ---- the entrance «Si alza il sipario» (3.4 s, the model's 'enter'): the red curtain rises in the middle of the runes and shows a puppet
// hanging limp; the strings pull taut one by one (the head 1.05 s, the arms 1.29 and 1.50, the knees 1.73 and 1.90), he stands (2.04), the
// head turns too far (2.04-2.52), it snaps back and he cries «Ah-ah!» (2.58), the deep bow with the bells
if(PU2ON)B3IN.puppeteer=(e,t,t0,at,roar)=>{e.em=t<2.58?.999:1;e.z=0;e.face=bu2Face(Math.atan2(P.y-e.y,P.x-e.x));
  if(t0===0){bu2Reset();if(G.runeAt){e.x=G.runeAt.x;e.y=G.runeAt.y}bu2Snd(e,'box3');bu2Snd(e,'velvet');shake(1)}
  if(at(1.05)){bu2Snd(e,'tac');bu2Snd(e,'click');shake(1.5)}
  for(const s of[1.29,1.5,1.73,1.9])if(at(s)){bu2Snd(e,'tac');shake(1)}
  if(at(2.04)){dustRing(e.x,e.y,B3N(12));shake(3);bu2Snd(e,'ratchet')}
  if(at(2.58))roar()
  if(at(2.72)||at(3.0))bu2Snd(e,'bells')};
// ---- the defeat «Cala il sipario» (3.8 s, the model's 'die'; the bar and «sconfitto» at 1.75 s): the strings snap one by one with a
// «ping» and a golden spark (the knees, the arms, the head), he collapses into a heap, the cross falls on it, the eyes go out, a bell
// rolls away, a far applause from the dark, the red curtain falls on the heap and melts into golden sparks
if(PU2ON)B3DIE.puppeteer={setup(c){for(const m of G.enemies)if(m.type==='puppet'&&!m.dead){vfxBlast(m.x,m.y-8,'120,70,200',30,{sparks:B3N(8),spcol:['#ffd84a','#c8a0ff','#ffe9a0'],dust:B3N(4),ring2:false});killE(m,true)}
    const bk=G.pu2?G.pu2.baked:0;bu2Reset();G.pu2.baked=bk},
  tick(c,dt,D,p){const ev=q=>{if(c['e'+q]||p<q)return false;c['e'+q]=1;return true},col=c.p2?'255,122,214':'255,214,110',f=!LOWFX;
    const pt=(bx,by,bz)=>{let q=[0,0];try{q=C3.V(c.face||0).P([bx,by,bz])}catch(err){}return{x:c.x+q[0],y:c.y+8+q[1]}};
    for(const[q,b] of[[.12,[3,10,26]],[.2,[3,-10,26]],[.28,[12,39,45]],[.36,[12,-39,45]],[.46,[3,0,108]]])if(ev(q)){bu2Snd(c,'ping');const s=pt(...b);
      for(let i=0;i<(f?7:3);i++)cpart(c,{k:'spark',x:s.x,y:s.y,z:0,vx:rand(-40,40),vy:rand(-10,10),vz:rand(20,70),g:120,life:rand(.35,.6),r:2,col})}
    if(p>.48&&p<.7&&Math.random()<(f?.5:.2))cpart(c,{k:'puff',x:c.x+rand(-30,30),y:c.y+rand(-4,6),vx:rand(-20,20),vz:rand(8,24),life:rand(.5,.8),r:rand(4,7),col:'150,130,170'});
    if(p>.48&&p<.7&&f&&Math.random()<.3)cpart(c,{k:'spark',x:c.x+rand(-26,26),y:c.y-rand(4,40),vz:rand(20,50),g:60,life:.5,r:1.8,col});
    if(ev(.7)){bu2Snd(c,'clac');shake(2)}if(ev(.84))bu2Snd(c,'click');if(ev(.86))bu2Snd(c,'drin');if(ev(.88))bu2Snd(c,'clap');if(ev(.9))bu2Snd(c,'box2');
    if(p>.95&&Math.random()<(f?.8:.3))cpart(c,{k:'spark',x:c.x+rand(-36,36),y:c.y-rand(0,90),vz:rand(30,60),vx:rand(-6,6),life:rand(.4,.7),r:2,col:'255,214,110'})}};
// ---- the voice (88-boss3-voci.js keeps his: cry, laugh, laugh2, hurt, angry, die, c_slam, c_strings, c_puppets, c_vanish, win); new:
// «eccoti!» when the thread of the puppet leaves, «hop-là!» when he falls from the spotlight, the slow deep laugh of the Shadow when its
// Hand comes and under his laugh in the rage (and, in the second phase, under his laugh when you fall)
if(PU2ON){const V=B3VO.VB.puppeteer,syl=(n,t0,step,d,fa,fb,v,o)=>[...Array(n)].map((_,i)=>{const f=fa+(fb-fa)*i/Math.max(1,n-1);return Object.assign({t:t0+i*step,d,f:[f*1.04,f*.94],v,a:1-i*.07,h:.3},o||{})});
  const OMB=[...syl(3,0,.3,.22,92,78,'a',{ro:.5,br:.5}),{t:.9,d:.38,f:[76,62],v:'o',ro:.5,br:.5,a:.8,rel:.5}];
  Object.assign(V.k,{
    c_lasso:[[.5,[{t:0,d:.12,f:[262,300],v:'e',h:.25},{t:.14,d:.12,f:[312,342],v:'o',h:.15},{t:.28,d:.2,f:[352,250],v:'i',rel:.45}],.45]],
    c_drop:[[.5,[{t:0,d:.05,noise:1,v:'h',a:.7},{t:.04,d:.15,f:[280,322],v:'o',h:.2},{t:.24,d:.25,f:[340,232],v:'a',vib:[.03,7],rel:.4}],.45]],
    c_hand:[[1.3,OMB,.6]],ombra:[[1.3,OMB,.6]]});
  B3VX.ombra=.9;
  B3CUE.puppeteer={slam:'c_slam',slam3:'c_slam',strings:'c_strings',puppets:'c_puppets',lasso:'c_lasso',vanish:'c_vanish',drop:'c_drop',hand:'c_hand',snap:'hurt'};
  {const _m=b3sayMore;b3sayMore=function(e,k,t){_m.apply(this,arguments);if(!e||e.type!=='puppeteer')return;try{const near=Math.max(.55,enemyAt(e));
    if(k==='win'&&e.p2&&B3VO.has('puppeteer','ombra'))B3VO.play('puppeteer','ombra',t+.15,.55*near,1,.3);
    if(k==='ombra'||k==='c_hand')fNoise(t,1.2,'lowpass',VR(260,.1),.7,.06*near,{brown:true,att:.25});
    AU.pan=0}catch(err){}}}}
// ---- for the previews (anteprime/mk_boss2.py) and the tests (tests/boss2gioco.js): how to get into his room, his moves in each phase,
// the dangers he puts in the room (counted by the tests), the clips of his voice. hero(): only in the test, the hero (who stands and
// shoots) dashes on the 1st, 3rd… time the thread catches him, so the snapped thread is seen too (the other times the tugs and the punch)
if(PU2ON){const R0=window.BCL||(window.BCL={});R0.puppeteer={n:"Il Burattinaio d'Ombra",arena:8,p2:true,
  enter(){G.arena=8;G.chapter=ARENAS[8].ch;G.diff=ARENAS[8].diff;G.bossLvl=null;G.room=ROOMS;G.event=null;buildRoom()},
  moves:['slam','strings','lasso','yank','snap','puppets','vanish','spot','drop'],moves2:['rage','hand','slam3'],
  hz(){const B=G.pu2||{},W=B.warn||[];return{cerchi:W.filter(w=>w.k==='disc').length,botole:(B.traps||[]).length,burattini:G.enemies.filter(q=>q.type==='puppet'&&!q.dead).length,
    lazo:B.lasso||B.aim?1:0,legato:B.tied?1:0,riflettore:B.spot?1:0,mano:(B.hand?1:0)+(B.fall?1:0),fili:((G.b3&&G.b3.thr)||[]).length+(B.ret&&B.ret.park?1:0),
    onde:G.waves.length,sfere:G.eproj.filter(q=>q.kind==='shadow').length,scie:(B.trails||[]).length}},
  hero(e){const B=G.pu2;if(B&&B.tied&&e.st==='yank'&&b3k(e)>.3&&!B.tied.tried){B.tied.tried=1;if((G.pu2Catch||0)%2===1){P.dashCd=0;dash()}}return null},
  voice:['cry','laugh','angry','die','c_lasso','c_drop','c_hand']}}
