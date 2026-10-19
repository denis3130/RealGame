// =====================================================================
// LA REGINA DEI GHIACCI RIFATTA: «l'Imperatrice di Cristallo» (Denis, 15 ottobre: «rivisita tutti i boss … possenti, belli, fighi, che
// diano timore nello sfidarli», «migliora anche le loro abilità speciali»; 16 ottobre, dopo il Golem: «sì, fai gli altri 12»). ANTEPRIMA:
// questo file e il modello sprite/nemici3d/icequeen2.js entrano solo nella copia del gioco fatta da anteprime/mk_boss2.py; nel gioco vero
// dopo il sì di Denis (il modello prende il posto di 'icequeen' e questo file va in src/ordine.txt). Design e numeri: docs/boss-classici.md.
// Un'imperatrice altissima e immobile, piantata a terra come un monumento: scivola sul ghiaccio senza muovere un piede, sempre girata
// verso di te. Il suo avviso è la corona-orologio: prima di ogni incantesimo le stalattiti della corona si accendono a coppie (tin… tin…
// tin… TIN) e quando si accende quella di mezzo il colpo parte. Ogni stato ha il nome di una mossa del modello; il colpo vero parte nel
// suo fotogramma (b3at, 81-boss3-base.js). Mosse:
// - Lance di Cristallo (lances): cinque lance (sette nella fase 2) nascono sopra la sua testa; una linea rossa per ognuna, poi le lancia
//   a ventaglio con un gesto da direttore d'orchestra (un passo di lato). Nella fase 2 subito una seconda raffica, mirata di nuovo.
// - Incoronazione (crown): la corona vola via e sette stalattiti cadono in cerchio intorno a te (cerchi rossi), restano come pilastri e ti
//   sparano una scheggia ciascuno (strisce rosse): esci da un varco. Mentre la corona è spoglia la gemma è scoperta: i colpi fanno +50%.
// - Fiocco Reale (nova): pianta lo scettro, sei bracci rossi a fiocco di neve e una fila di punte di ghiaccio corre lungo ognuno (stai
//   tra due bracci; dietro un ostacolo si è al sicuro); poi lo scettro resta incastrato: è il momento di colpirla. Fase 2: un secondo
//   fiocco girato di 30° quando strappa lo scettro.
// - Sala degli Specchi (mirror, emerge, cast): una piroetta, tre specchi (quattro) le salgono intorno a te, si scioglie in neve ed esce
//   da uno di loro; dagli altri escono i suoi riflessi. Tirano a turno; la vera ha l'ombra e la corona accesa. Colpiscila e lo specchio si
//   infrange (corona incrinata: +50%); se in 6 s non la trovi gli specchi scoppiano in schegge lente.
// - Sguardo d'Inverno (gaze, fase 2, sempre dopo l'Incoronazione): un cono di luce che gira con la sua testa e ti congela per un attimo
//   se ci resti dentro: dietro un pilastro, contro la freccia, uno scatto.
// - Valzer della Tormenta (waltz, fase 2): balla lungo tre archi lasciando una scia che diventa rossa ed esplode in punte; poi una
//   piroetta e otto fiocchi lenti.
// - Notte Polare (rage, a metà vita, mai durante Sguardo, Valzer o Sala): l'abito si riempie di stelle, si apre il Ventaglio d'Inverno;
//   da lì tutto 1,15 volte più rapido, le torce restano viola e nevica il doppio.
// Entrata (enter): «Specchio, specchio…», esce da uno specchio che poi va in frantumi. Sconfitta (die): «l'ultimo inchino», si scioglie in
// un vortice di neve e restano la corona e lo scettro sul cumulo. Ogni danno ha un avviso a terra di almeno 0,6 s veri, anche nella fase 2.
// =====================================================================
const QON=typeof N3!=='undefined'&&!!N3.icequeen2;
const QN={seq1:['lances','crown','nova','mirror'],
  // the second phase (the design: crown, gaze, lances ×2, mirror, waltz, nova): the Waltz comes right after the Gaze, so the first round of
  // the Polar Night shows all three new moves; the Gaze always right after the Crown (its pillars are the cover)
  seq2:['crown','gaze','waltz','lances','mirror','nova'],
  red:'229,72,77',ice:'140,225,255',vio:'200,160,255',sp2:1.15,gs:0,
  // the damage of each blow, before DMG(): the design's numbers ×1.5. A hero standing still takes one blow per move (the old queen hit
  // with many small shards), and with the design's numbers lost a third less than against the queen of today (tests/boss2diff.js);
  // to be tuned by playing
  D:{lance:21,shard:21,land:24,spike:27,cast:18,castR:12,burst:15,gaze:21,trail:27,flake:15},
  // the crown's clock: when each pair of stalactites lights up; the last one (the middle) is the blow
  CLK:{lances:[.30,.45,.60,.76],crown:[.04,.08,.12,.16],nova:[.16,.26,.36,.46],mirror:[.05,.12,.19,.26],waltz:[.03,.06,.09,.12]},
  // the moves the second phase waits for
  HOLD:new Set(['gaze','waltz','mirror','emerge','hall','hallEnd','cast','stunned','rage']),
  HALL:new Set(['emerge','hall','cast','hallEnd']),
  T:{blue:[['#1a62ff','#7fc8ff','#f0fbff'],'140,200,255'],white:[['#5fb8ff','#dff4ff','#ffffff'],'200,235,255'],night:[['#7a3cff','#b48aff','#f4eeff'],'200,160,255'],
    warm:[['#ff7a2e','#ffc46b','#fff0d0'],'255,190,120']}};
if(QON){
  // the new model in place of the old one (its drawing of today stays as N3.meta.icequeen.old for the pages); the arena pictures ask for
  // her a little smaller (QN.gs); her size in the prologue (91, «I re») and in the guide (44) is with the other bosses remade
  const old=N3.icequeen,oldM=N3.meta.icequeen,oldQ=N3.qmirror,oldQM=N3.meta.qmirror,M2=N3.icequeen2;
  N3.icequeen2=N3.icequeen=(x,y,f,a,p,sc,o)=>M2(x,y,f,a,p,(sc||1)*(QN.gs||1),o);
  N3.meta.icequeen=Object.assign({},N3.meta.icequeen2,{old:(x,y,f,a,p)=>old(x,y,f,oldM.an.includes(a)?a:'idle',p,oldM.sc||1,{})});
  // her reflection is the model itself, pale and without its shadow
  N3.qmirror=(x,y,f,a,p,sc,o)=>M2(x,y,f,a,p,sc,Object.assign({},o,{ghost:1}));
  N3.meta.qmirror=Object.assign({},N3.meta.icequeen2,{n:'Riflesso della Regina',old:oldQ?(x,y,f,a,p)=>oldQ(x,y,f,oldQM.an.includes(a)?a:'idle',p,oldQM.sc||1,{}):null});
  Object.assign(ET.icequeen,{r:28});ET.qmirror.r=16;BOSS_INTRO.icequeen=3.4;
  Object.assign(BDEATH,{icequeen:{dur:4,clou:2.3,snd:'shimmer'}});
  // the bar, the halo and the runes; the 2D crystals, wings, aurora ribbons and the snowflake on the floor of today go: the model draws all
  B2H.icequeen=115;B2T.icequeen=[[QN.ice,QN.vio],'220,240,255'];B2.icequeen.back=()=>{};B2.icequeen.front=()=>{};B2G.icequeen=()=>{};
  RUNEC.regina=[QN.ice,QN.vio];
  // her shadow is the model's (only the real queen has one: it is the tell of the Hall of Mirrors), her light high on her body
  ESHADOW.icequeen=()=>{};ESHADOW.qmirror=()=>{};
  ELIGHT.icequeen=(e,Lt)=>{if(!e.hidden)Lt(e.x,e.y-60,130,.8)};ELIGHT.qmirror=(e,Lt)=>{if(!e.hidden&&e.q3)Lt(e.x,e.y-60,130,.8*(e.alpha==null?1:e.alpha))};
  // what the game passes to the model: the way she glides (mv, the motion against where she looks), the turn of the Gaze, the order of the
  // lances' gesture, the crown all lit (the real one in the Hall); the glide follows its own clock
  N3G.opt.icequeen=e=>({mv:e.qmv||0,sweep:e.qsw||1,rev:e.qrev||0,crown:e.crownLit||0});N3G.opt.qmirror=N3G.opt.icequeen;
  N3G.wp.icequeen=e=>{const d=B3D(e,'walk');return(((e.wt||0)%d)+d)%d/d};N3G.wp.qmirror=N3G.wp.icequeen;
  // her pillars and mirrors are obstacles of ice (their height for the shadows, their chips when an arrow hits them)
  Object.assign(KH,{qpillar:2.8,qmirror:3.2});Object.assign(DPAL,{qpillar:['#ffffff','#a8e6ff','#3f80d6'],qmirror:['#e6ecfa','#9aa8cc','#3a4a9a']});
  // (her line in the guide is in 44-guida.js, with the others)
}
// ---- helpers
// the model's own drawings of the pieces of her attacks (design: Lance(x,y,z,a,sc,o), Pillar(x,y,z,k,sc,o), Spike(x,y,h,k,sc,o),
// Mirror(x,y,k,sc,o), Ice(x,y,k,sc,o), Shard(x,y,z,a,sc,o), Flake(x,y,z,a,sc,o)); the game's simple drawings if the model has none
const qart=n=>N3['icequeen'+n]||N3['icequeen2'+n]||null;
const qsp=e=>((G.bossLvl||(G.bossLvl=bossLvl())).spd||1)*(e&&e.p2?QN.sp2:1);
// the real seconds between two moments of the move she is in (the warnings are timed in real time, like the Golem's)
const qlead=(e,p0,p1,st)=>(p1-p0)*B3D(e,st||e.st)/qsp(e);
function qQueen(){if(!G||!G.enemies)return null;for(const e of G.enemies)if(e.type==='icequeen'&&!e.dead)return e;return null}
function qreset(){if(G)G.qn={warn:[],falls:[],runs:[],spikes:[],trail:[],frost:[],hall:null,gaze:null,ice:null,live:new Set(),wid:0}}
// the dangers only (the hero fell: the Hall breaks too), the Polar Night stays
function qClear(){const Q=G.qn;if(!Q)return;Q.warn=[];Q.falls=[];Q.runs=[];Q.spikes=[];Q.trail=[];Q.gaze=null;Q.ice=null;Q.hall=null;Q.live.clear()}
{const _br=buildRoom;buildRoom=function(){qreset();return _br.apply(this,arguments)}}
// how far from (x,y) along a before a wall or an obstacle (the temporary ones too, unless soft)
function qReach(x,y,a,max,soft){const ca=Math.cos(a),sa=Math.sin(a);let s=0;for(;s<(max||900);s+=6){const px=x+ca*s,py=y+sa*s;if(px<L+2||px>R-2||py<TOP+2||py>BOT-2)break;
    if(G.rocks.some(k=>(!soft||!k.temp)&&Math.hypot(k.x-px,k.y-py)<k.r))break}return s}
function qWalk(e,dur){e.wt=0;e.wp=null;e.hidden=false;b3go(e,'walk',dur!=null?dur:(e.p2?rand(1.1,1.5):rand(1.2,1.7)))}
// where she glides to: 170–240 px from you, inside the room, away from the obstacles, better where she sees you (nothing between her
// spells and you), in the upper part of the room and not too far from where she is
function qPick(e){let best=null,bs=-1e9;const top=TOP+(BOT-TOP)*.6;
  for(let i=0;i<22;i++){const a=rand(0,TAU),d=rand(170,240),x=P.x+Math.cos(a)*d,y=P.y+Math.sin(a)*d;if(x<L+50||x>R-50||y<TOP+90||y>BOT-90)continue;
    if(G.rocks.some(k=>Math.hypot(k.x-x,k.y-y)<k.r+e.r))continue;const s=(y<top?60:0)+(clearLine(x,y-40,P.x,P.y-6,4)?80:0)-Math.hypot(x-e.x,y-e.y)*.25;if(s>bs){bs=s;best={x,y}}}
  return best||{x:clamp(e.x+rand(-40,40),L+60,R-60),y:clamp(TOP+150+rand(-30,30),TOP+90,BOT-90)}}
function qNext(e){const seq=e.p2?QN.seq2:QN.seq1,nx=seq[(e.si=(e.si==null?-1:e.si)+1)%seq.length];e.qrev=0;e.moving=false;b3go(e,nx);if(nx==='waltz')qMelt('pillar')}
// a temporary obstacle of hers: the pillars of the Crowning, the mirrors of the Hall (at most eleven together: the oldest melts)
function qRock(x,y,r,qk,life,p2){const T=G.rocks.filter(k=>k.qk);if(T.length>=11){const o=T.sort((a,b)=>a.born-b.born)[0];o.life=Math.min(o.life,.5)}
  const k={x,y,r,seed:Math.random()*10,temp:true,life,kind:qk==='pillar'?'qpillar':'qmirror',qk,p2:!!p2,born:G.t||0};G.rocks.push(k);fields={};return k}
function qDrop(k){const i=G.rocks.indexOf(k);if(i>=0){G.rocks.splice(i,1);fields={}}}
function qMelt(qk){for(const k of G.rocks)if(k.qk===qk&&k.life>.5)k.life=.5}
// the torches in a colour of hers for sec seconds, without the sound of ENV2.torches (the second phase keeps them violet)
function qTorchSet(c,sec){const T=QN.T[c];if(!T||!G.env)return;if(!G.env._base)G.env={...G.env,_base:G.env};G.env.torch=T[0];G.env.light=T[1];G._tT=sec}
function qTorch(c,sec){const T=QN.T[c];if(T&&G&&G.env&&BOSS2)ENV2.torches(T[0],T[1],sec)}
// frost baked into the floor (no sound: ENV2.mark plays one for each mark): a star, a line of frost with its little branches, a ring
function qFrost(x,y,r){const c=fx;if(!c)return;c.save();c.setTransform(2,0,0,2,0,0);c.lineCap='round';const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(235,248,255,.5)');g.addColorStop(1,'rgba(235,248,255,0)');
  c.fillStyle=g;c.beginPath();c.ellipse(x,y,r,r*.5,0,0,TAU);c.fill();c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=1.1;
  for(let i=0;i<7;i++){const a=i/7*TAU+rand(-.2,.2),L0=r*rand(.55,.95),ex=x+Math.cos(a)*L0,ey=y+Math.sin(a)*L0*.5;c.beginPath();c.moveTo(x,y);c.lineTo(ex,ey);const bx=x+(ex-x)*.6,by=y+(ey-y)*.6;
    for(const s of[-1,1]){c.moveTo(bx,by);c.lineTo(bx+Math.cos(a+s*.8)*4,by+Math.sin(a+s*.8)*2)}c.stroke()}c.restore()}
// the snowflake left on the floor by the Royal Snowflake: along each arm a short stroke of frost near her and a few little stars
function qFrostArm(x,y,a,len){const c=fx;if(!c||len<12)return;const ca=Math.cos(a),sa=Math.sin(a),l0=Math.min(len,46);c.save();c.setTransform(2,0,0,2,0,0);c.lineCap='round';
  c.strokeStyle='rgba(235,248,255,.45)';c.lineWidth=1.6;c.beginPath();c.moveTo(x,y);c.lineTo(x+ca*l0,y+sa*l0);for(const d of[-1,1]){const bx=x+ca*l0*.6,by=y+sa*l0*.6;c.moveTo(bx,by);c.lineTo(bx+Math.cos(a+d*.7)*8,by+Math.sin(a+d*.7)*8)}c.stroke();c.restore();
  for(let s=70,n=0;s<len-10&&n<3;s+=rand(60,85),n++)qFrost(x+ca*s,y+sa*s,rand(7,10))}
function qFrostRing(x,y,r){const c=fx;if(!c)return;c.save();c.setTransform(2,0,0,2,0,0);c.strokeStyle='rgba(225,245,255,.55)';c.lineWidth=2;c.beginPath();c.ellipse(x,y,r,r*.55,0,0,TAU);c.stroke();
  c.strokeStyle='rgba(255,255,255,.75)';c.lineWidth=1;for(let i=0;i<8;i++){const a=i/8*TAU,px=x+Math.cos(a)*r,py=y+Math.sin(a)*r*.55;c.beginPath();c.moveTo(px-2.5,py);c.lineTo(px+2.5,py);c.moveTo(px,py-1.6);c.lineTo(px,py+1.6);c.stroke()}c.restore()}
// a puff of snow and glitter (a reflection breaking, a mirror bursting, a stalactite shattering): no damage
function qSnow(x,y,n,big){if(!G||!G.fx)return;n=B3N(n);for(let i=0;i<n;i++){const a=rand(0,TAU),s=rand(30,big?150:90);fxPush({k:'snowp',x:x+rand(-8,8),y:y+rand(-10,10),vx:Math.cos(a)*s,vy:Math.sin(a)*s*.6-rand(10,40),t:rand(.4,.9)})}
  if(!LOWFX)fxPush({k:'flash',x,y,rgb:'210,240,255',r:big?60:34,t:.2,max:.2});fxPush({k:'ring2',x,y:y+10,rgb:'220,245,255',r0:6,r1:big?60:36,t:.35,max:.35,w:3})}
// ---- the brain
function qRage(e){const Q=G.qn;e.p2=true;e.shell=9;banner('La Regina chiama la Notte Polare','Fase 2',1.6);bossRage(e,QN.vio);$('bossBar').classList.add('rage');shake(6);G.eproj=[];
  // the dangers still waiting go (circles, lines, arms not yet run, the trail); the pillars already planted stay
  if(Q){Q.warn=[];Q.falls=[];Q.runs=[];Q.trail=[];Q.gaze=null;Q.live.clear()}e.ql=e.qc=e.qf=e.qf2=e.qw=e.qg=null;e.qrev=0;e.crownLit=0;e.hidden=false;e.moving=false;b3go(e,'rage');b3say(e,'angry');qSnd('crack',e)}
if(QON)EUPD.icequeen=function(e,dt,sm,a,d){if(!G.qn)qreset();const Q=G.qn;
  if(!e.p2&&e.hp<e.max*.5&&!QN.HOLD.has(e.st)){qRage(e);return}
  const sp=e.p2?QN.sp2:1;dt*=sp;// the second phase runs 1.15 times faster (n3Move draws the model on the same clock)
  const rdt=dt/qsp(e);b3tick(e,dt);const p2=e.p2,k=b3k(e);
  if(!QN.HALL.has(e.st))e.crownLit=0;if(e.st!=='gaze')Q.gaze=null;
  switch(e.st){
  case 'walk':{e.hidden=false;e.face=a;if(!e.wp||e.wpT<=0||Math.hypot(e.wp.x-e.x,e.wp.y-e.y)<8){e.wp=qPick(e);e.wpT=1.2}e.wpT-=rdt;
    const dx=e.wp.x-e.x,dy=e.wp.y-e.y,dd=Math.hypot(dx,dy),v=(p2?80:70)*sm;e.moving=false;
    if(dd>2){const x0=e.x,y0=e.y,st=Math.min(dd,v*dt);moveCircle(e,dx/dd*st,dy/dd*st);const mv=Math.hypot(e.x-x0,e.y-y0);
      if(mv>.05){e.moving=true;e.qmv=angDiff(e.face,Math.atan2(e.y-y0,e.x-x0));e.wt=(e.wt||0)+dt;e.trd=(e.trd||0)+mv;
        if(e.trd>=(LOWFX?28:14)){e.trd=0;Q.frost.push({x:e.x+rand(-12,12),y:e.y+rand(-2,6),t:0,r:rand(6,10)})}}}
    if(e.stT<=0){e.moving=false;qNext(e)}break}
  // ---- LANCE DI CRISTALLO: the lances are born over her head (.10–.28), the aim locks and the lines show (.30), solid from .62; the
  // middle stalactite lights at .76 and lance k leaves at .76 + .025·k, in the order of the gesture (from her left; o.rev from her right)
  case 'lances':{e.moving=false;if(k<.30||!e.ql)e.face=a;else e.face=e.ql.a0;
    if(b3at(e,.10))qSnd('born',e);
    if(b3at(e,.30)){const sx=e.x,sy=e.y-40,a0=Math.atan2(P.y-6-sy,P.x-sx),n=p2?7:5,dl=(p2?14:16)*Math.PI/180,rev=e.qrev||0,list=[];
      for(let i=0;i<n;i++){const j=rev?n-1-i:i,an=a0+(j-(n-1)/2)*dl;list.push({an,len:qReach(sx,sy,an,900)})}
      e.ql={sx,sy,a0,n,list,fired:0};list.forEach((l,i)=>{const t=qlead(e,.30,.76+.025*i);Q.warn.push({k:'lance',x:sx,y:sy+6,a:l.an,len:l.len,t,max:t,solid:qlead(e,.30,.62)})})}
    if(e.ql)while(e.ql.fired<e.ql.n&&k>=.76+.025*e.ql.fired){const i=e.ql.fired++,l=e.ql.list[i];qShot(e.ql.sx,e.ql.sy,l.an,200,6,QN.D.lance,'qlance',{h0:80,p2});
      if(i===0){qTorchSet('blue',.6);shake(2)}}
    if(e.stT<=0){e.ql=null;if(p2&&!e.qrev){e.qrev=1;b3go(e,'lances')}else{e.qrev=0;qWalk(e)}}break}
  // ---- INCORONAZIONE: the bow and the clock (.04–.16), the crown flies off (.16): seven red circles round you, the stalactites fall
  // (.30–.52) and stand as pillars; the lines from each pillar (.58), the shards (.93). The gem is bare from .17 to .74 (+50%)
  case 'crown':{e.moving=false;e.face=a;
    if(b3at(e,.16))qCrownAim(e);
    if(b3at(e,.58)&&e.qc){const C=e.qc.C,t=qlead(e,.58,.93);e.qc.lines=[];
      for(const pl of e.qc.pillars){if(!G.rocks.includes(pl))continue;const ang=Math.atan2(C.y-6-pl.y,C.x-pl.x),sx=pl.x+Math.cos(ang)*17,sy=pl.y+Math.sin(ang)*17,
        dist=Math.hypot(C.x-sx,C.y-6-sy),len=p2?qReach(sx,sy,ang,900):dist;e.qc.lines.push({pl,ang,sx,sy,dist});Q.warn.push({k:'band',x:sx,y:sy+6,a:ang,len,w:12,t,max:t})}}
    if(b3at(e,.93)&&e.qc&&e.qc.lines){const mul=Math.min(1.7,1+(effRoom()-1)*.035);
      for(const l of e.qc.lines){if(!G.rocks.includes(l.pl))continue;const pr=qShot(l.sx,l.sy,l.ang,190,6,QN.D.shard,'qshard',{h0:14,p2});if(pr&&!p2)pr.life=l.dist/(190*mul)}
      qSnd('shards',e);shake(3)}
    if(e.stT<=0){e.qc=null;qWalk(e)}break}
  // ---- FIOCCO REALE: the scepter planted (.11) and the six red arms filling from its foot; the spikes run (.46); the scepter stuck (.46–
  // .95: she does not attack); in the second phase a second flake turned 30° when she tears it out (.95)
  case 'nova':{e.moving=false;if(k<.11||!e.qf){e.face=a;e.lf=a}else e.face=e.lf;
    if(b3at(e,.11)){const F=b3pt(e,22,0);F.x=clamp(F.x,L+8,R-8);F.y=clamp(F.y,TOP+8,BOT-8);const a1=Math.atan2(P.y-F.y,P.x-F.x);e.qf={F,a1,arms:qArms(F,a1)};
      const t=qlead(e,.11,.46);Q.warn.push({k:'flake',x:F.x,y:F.y,arms:e.qf.arms,t,max:t,fill:qlead(e,.11,.30)});stamp('cracks',F.x,F.y,16);qFrost(F.x,F.y,14);qSnd('plant',e);shake(4)}
    if(b3at(e,.46)&&e.qf){qRun(e.qf.F,e.qf.arms,p2);fxPush({k:'flash',x:e.x,y:e.y-70,rgb:'235,250,255',r:90,t:.25,max:.25});qTorch('white',1.2);
      if(BOSS2){ENV2.rocks(e.qf.F.x,e.qf.F.y,300,1);ENV2.fall(B3N(3),true)}shake(5);vib([30,20,40]);
      if(p2){const arms=qArms(e.qf.F,e.qf.a1+Math.PI/6),t=qlead(e,.46,.95);e.qf2={F:e.qf.F,arms};Q.warn.push({k:'flake',x:e.qf.F.x,y:e.qf.F.y,arms,t,max:t,fill:qlead(e,.46,.62)})}}
    if((b3at(e,.62)||b3at(e,.78))&&e.qf){qSnd('tug',e);qSnow(e.qf.F.x,e.qf.F.y-6,4)}
    if(b3at(e,.95)&&e.qf){if(e.qf2){qRun(e.qf2.F,e.qf2.arms,true);shake(4)}qSnd('tear',e);qSnow(e.qf.F.x,e.qf.F.y-6,6)}
    if(e.stT<=0){e.qf=e.qf2=null;qWalk(e)}break}
  // ---- SALA DEGLI SPECCHI: the pirouette and the clock (.05–.26), the frost circles where the mirrors will be (.26), the mirrors rise
  // (.45), she melts into snow (.55–.85) and comes out of one of them, the reflections of the others (emerge); then the Hall
  case 'mirror':{e.moving=false;e.face=a;
    if(b3at(e,.26)){e.qm=qSpots(e,p2?4:3);for(const m of e.qm)qFrostRing(m.x,m.y,22);qSnd('mirror',e)}
    if(b3at(e,.45)&&e.qm){for(const m of e.qm)m.rock=qRock(m.x,m.y,14,'mirror',99,p2);fxPush({k:'flash',x:e.x,y:e.y-100,rgb:'210,180,255',r:40,t:.2,max:.2})}
    if(k>.55&&k<.85&&!LOWFX&&Math.random()<.5)fxPush({k:'snowp',x:e.x+rand(-26,26),y:e.y-rand(0,130*(k-.55)/.3),vx:rand(-30,30),vy:-rand(20,60),t:.6});
    if(b3at(e,.85))qHall(e);
    if(e.stT<=0&&e.st==='mirror'){e.qm=null;qWalk(e)}break}
  case 'emerge':{e.moving=false;e.hidden=true;e.crownLit=1;e.face=k<.5?Math.PI/2:a;if(e.stT<=0){e.hidden=false;if(Q.hall){b3go(e,'hall',99);Q.hall.t=0;Q.hall.next=0}else qWalk(e)}break}
  case 'hall':{e.hidden=false;e.crownLit=1;e.face=a;qDrift(e,dt);if(!Q.hall){qWalk(e);break}qHallTick(e,rdt);break}
  case 'cast':{e.hidden=false;e.crownLit=1;qCast(e,a,p2,true);if(Q.hall)qHallTick(e,rdt);if(e.st==='cast'&&e.stT<=0){if(Q.hall)b3go(e,'hall',99);else qWalk(e)}break}
  case 'hallEnd':{e.moving=false;e.face=a;e.crownLit=1;const H=Q.hall;if(!H){qWalk(e);break}H.et+=rdt;
    if(H.et>=.4&&!H.circ){H.circ=1;for(const m of H.mirrors)if(G.rocks.includes(m))Q.warn.push({k:'disc',x:m.x,y:m.y,r:30,t:.8,max:.8})}
    if(H.et>=1.2){for(const m of H.mirrors)if(G.rocks.includes(m))qBurst(m,true);Q.hall=null;e.crownLit=0;qWalk(e)}break}
  case 'stunned':{e.moving=false;e.face=a;e.hidden=false;if(k>.12&&k<.7&&!LOWFX&&Math.random()<.25)fxPush({k:'snowp',x:e.x+rand(-10,10),y:e.y-rand(96,110),vx:rand(-20,20),vy:rand(10,40),t:.5});
    if(e.stT<=0)qWalk(e);break}
  // ---- SGUARDO D'INVERNO (second phase): the body locks toward you (.04): the red sector of all the sweep and the cone where it starts, with
  // the arrow of its turn; the eyes open (.32) and the cone turns with her head, at the same pace as the head (to .92)
  case 'gaze':{e.moving=false;
    if(b3at(e,.04)){const s=Math.random()<.5?-1:1;e.qsw=s;e.qg={a0:a,s,exp:0,done:false,rk:0};const t=qlead(e,.04,.32);Q.warn.push({k:'gazew',x:e.x,y:e.y,a0:a,s,t,max:t})}
    if(e.qg){e.face=e.qg.a0;qGaze(e,k,rdt)}else e.face=a;
    if(e.stT<=0){Q.gaze=null;if(e.qg&&e.qg.used)for(let i=-1;i<=1;i++){const an=e.qg.a0+i*e.qg.s*.9;qFrost(e.x+Math.cos(an)*120,e.y+Math.sin(an)*120,16)}e.qg=null;qWalk(e)}break}
  // ---- VALZER DELLA TORMENTA (second phase): her path shows (.03), she dances three arcs at a steady pace (.12–.70) leaving a trail that
  // turns red and bursts into spikes, the pirouette with its red ring (.70–.95), eight slow flakes (.95)
  case 'waltz':{
    if(b3at(e,.03)){e.qw=qWaltzPath(e);if(e.qw){const t=qlead(e,.03,.12);Q.warn.push({k:'path',pts:e.qw.pts,t,max:t})}}
    const W=e.qw;e.moving=false;
    if(W&&k>=.12&&k<.70){const pt=qPathAt(W,(k-.12)/.58*W.len),x0=e.x,y0=e.y;e.x=pt.x;e.y=pt.y;e.face=pt.a;W.d+=Math.hypot(e.x-x0,e.y-y0);
      while(W.d>=16){W.d-=16;Q.trail.push({x:e.x,y:e.y+4,t:0,w:W.id})}}
    else e.face=a;
    if(b3at(e,.12)||b3at(e,.45))if(BOSS2)ENV2.fall(B3N(5),true);
    if(b3at(e,.70)){const t=qlead(e,.70,.95);Q.warn.push({k:'ring8',x:e.x,y:e.y,r:40,t,max:t})}
    if(b3at(e,.95)){const o=rand(0,TAU);for(let i=0;i<8;i++){const pr=qShot(e.x,e.y-30,o+i*TAU/8,75,7,QN.D.flake,'qflake',{p2:true});if(pr)pr.life=3.5}qSnd('flakes',e);shake(2)}
    if(e.stT<=0){if(W)for(let i=0;i<W.pts.length;i+=6)qFrost(W.pts[i].x,W.pts[i].y+4,10);e.qw=null;qWalk(e)}break}
  // ---- NOTTE POLARE: no damage, no attacks; the gem cracks (.12), the night climbs the dress, the Fan opens (.40–.52), the flash (.86)
  case 'rage':{e.moving=false;e.face=a;
    if(b3at(e,.12))fxPush({k:'flash',x:e.x,y:e.y-104,rgb:'210,170,255',r:30,t:.2,max:.2});
    for(const p of[.40,.43,.46,.49,.52])if(b3at(e,p))qSnd('fan',e);
    if(b3at(e,.86)){fxPush({k:'flash',x:e.x,y:e.y-90,rgb:'230,210,255',r:150,t:.35,max:.35});if(BOSS2){ENV2.fall(B3N(14),true);ENV2.rocks(e.x,e.y,400,0)}Q.night=1;qTorchSet('night',600);qSnd('night',e);
      for(let i=0;i<8;i++){const t=i/8;addZone(L+20+(R-L-40)*t,TOP+18,24,9,'frost');addZone(L+20+(R-L-40)*t,BOT-18,24,9,'frost')}
      if(G.amb&&!Q.snow2){Q.snow2=1;for(let i=0;i<22;i++)G.amb.push({k:'snow',x:rand(L+10,R-10),y:rand(TOP+10,BOT-10),vx:rand(-6,6),vy:rand(14,28),ph:rand(0,TAU),t:0})}
      shake(8);vib([60,40,120]);for(let i=0;i<3;i++)setTimeout(()=>{if(G&&G.fx)fxPush({k:'ring2',x:e.x,y:e.y,rgb:'215,190,255',r0:e.r,r1:e.r*(4+i*1.5),t:.5,max:.5,w:7-i*2})},i*150)}
    if(e.stT<=0){e.shell=0;e.si=0;b3go(e,'crown')}break}
  // her mocking gesture: a pause in her glide, never between two blows (she glides again a little before the next move)
  case 'taunt':{e.moving=false;e.face=a;if(e.stT<=0)qWalk(e,rand(.6,1));break}
  default:qWalk(e)}};
// ---- the pieces of the moves
// a shot of hers (the game's projectile), with what its drawing needs: the height it falls from at first (h0), the phase, small, ghost
function qShot(x,y,a,sp,r,dmg,kind,o){shootE(x,y,a,sp,r,dmg,kind);const p=G.eproj[G.eproj.length-1];if(!p||p.kind!==kind)return null;Object.assign(p,{q3:1,t0:G.t||0},o||{});if(G.qn)G.qn.live.add(p);return p}
// the Crowning's ring: seven points round where you are, the ones in the walls or in the obstacles skipped (fewer than four: the ring
// moves away from the walls); a red circle on each, the stalactites falling on them
function qCrownAim(e){const Q=G.qn;let C={x:clamp(P.x,L+20,R-20),y:clamp(P.y,TOP+30,BOT-20)},pts=[];
  for(let tr=0;tr<2;tr++){const o=rand(0,TAU);pts=[];for(let i=0;i<7;i++){const an=o+i*TAU/7,x=C.x+Math.cos(an)*72,y=C.y+Math.sin(an)*72;
      if(x<L+20||x>R-20||y<TOP+30||y>BOT-20)continue;if(G.rocks.some(k=>Math.hypot(k.x-x,k.y-y)<k.r+16))continue;if(Math.hypot(e.x-x,e.y-y)<e.r+16)continue;pts.push({x,y})}
    if(pts.length>=4)break;C={x:clamp(C.x,L+40+72,R-40-72),y:clamp(C.y,TOP+40+72,BOT-40-72)}}
  const land=qlead(e,.16,.52),fall=qlead(e,.16,.30);e.qc={C,pillars:[],lines:null};
  for(const q of pts){Q.warn.push({k:'disc',x:q.x,y:q.y,r:16,t:land,max:land});Q.falls.push({x:q.x,y:q.y,t:0,t0:fall,t1:land,spin:rand(0,TAU),p2:!!e.p2,seed:Math.random()*10,c:e.qc})}
  qSnd('crownoff',e)}
// six arms from the foot of the scepter, the first toward you: each one to the wall or to the first obstacle
function qArms(F,a1){const A=[];for(let i=0;i<6;i++){const an=a1+i*Math.PI/3;A.push({a:an,len:qReach(F.x,F.y,an,900)})}return A}
// a flake's spikes running out along its arms at 420 px/s, a spike every 18 px (the hero is hit once per flake)
function qRun(F,arms,p2){const Q=G.qn,f={hit:false};for(const r of arms)Q.runs.push({x:F.x,y:F.y,a:r.a,len:r.len,s:0,next:12,p2,f});qSnd('nova',null,F.x)}
// the mirrors' places: on a circle of 150 px round you, evenly spaced with a random turn (a place that does not fit turns by 25°, then
// the circle shrinks to 120 px), inside the room, away from the obstacles and from her, at least 110 px apart. Against a wall the circle
// cannot hold them all: the missing ones go where there is room round you, as far as possible from the others
function qSpots(e,n){let best=[];const fits=(x,y)=>x>=L+40&&x<=R-40&&y>=TOP+70&&y<=BOT-50&&!G.rocks.some(k=>Math.hypot(k.x-x,k.y-y)<k.r+30)&&Math.hypot(x-e.x,y-e.y)>=e.r+30,
    far=(pts,x,y)=>pts.every(q=>Math.hypot(q.x-x,q.y-y)>=110);
  for(let tr=0;tr<30&&best.length<n;tr++){const R0=tr<20?150:120,o=rand(0,TAU),pts=[];
    for(let i=0;i<n;i++){for(const dv of[0,.44,-.44]){const an=o+i*TAU/n+dv,x=P.x+Math.cos(an)*R0,y=P.y+Math.sin(an)*R0;if(fits(x,y)&&far(pts,x,y)){pts.push({x,y});break}}}
    if(pts.length>best.length)best=pts}
  if(best.length<n){const C=[];for(const R0 of[150,135,165,120,180,205,230])for(let i=0;i<36;i++){const an=i/36*TAU+rand(-.05,.05),x=P.x+Math.cos(an)*R0,y=P.y+Math.sin(an)*R0;if(fits(x,y))C.push({x,y,R0})}
    if(!best.length&&C.length){const c150=C.filter(c=>c.R0===150);best.push((c150.length?c150:C)[randi(0,(c150.length?c150:C).length-1)])}
    while(best.length<n){let b=null,bs=-1e9;for(const c of C){const md=Math.min(...best.map(q=>Math.hypot(q.x-c.x,q.y-c.y))),sc=Math.min(md,190)-Math.abs(c.R0-150)*.6;if(md>=110&&sc>bs){bs=sc;b=c}}if(!b)break;best.push(b)}}
  return best.map(q=>({x:q.x,y:q.y}))}
// the Hall begins: she melts away and steps out of one of the mirrors, her reflections out of the others
function qHall(e){const Q=G.qn,ms=(e.qm||[]).filter(m=>m.rock&&G.rocks.includes(m.rock));e.qm=null;
  const go=(o,x,y)=>{o.x=x;o.y=y;o.qhome={x,y};o.dtg=null;o.face=Math.PI/2;o.f3=Math.PI/2;o.fx3=0;o.fy3=1;o.f3t=G.t||0};
  if(ms.length<2){for(const m of ms)qBurst(m.rock,false);Q.hall=null;e.hidden=true;b3go(e,'emerge');return}
  const j=randi(0,ms.length-1);e.hidden=true;e.qlc=null;go(e,ms[j].x,ms[j].y+16);
  for(let i=0;i<ms.length;i++){if(i===j)continue;const m=ms[i],r=makeE('qmirror',m.x,m.y+16,0);Object.assign(r,{q3:1,qh:0,p2:!!e.p2,gold:0,hidden:true,rock:m.rock,intro:0});go(r,m.x,m.y+16);
    G.enemies.push(r);b3go(r,'emerge')}
  Q.hall={t:0,next:0,last:null,mirrors:ms.map(m=>m.rock),real:ms[j].rock,et:0,circ:0};b3go(e,'emerge');qSnd('emerge',e)}
// the queens of the Hall: the real one and the reflections still whole
const qHallQueens=()=>G.enemies.filter(o=>!o.dead&&(o.type==='icequeen'||o.type==='qmirror'&&o.q3)&&(o.st==='hall'||o.st==='cast'));
// every 1.2 s one of them casts, in turns (the one that waited longest, the nearest to you first), never the same twice in a row
function qHallTick(e,rdt){const H=G.qn.hall;if(!H)return;H.t+=rdt;
  if(H.t>=H.next){H.next+=1.2;const L0=qHallQueens().filter(o=>o.st==='hall');let c=null;
    if(L0.length){const cand=L0.length>1?L0.filter(o=>o!==H.last):L0;cand.sort((a,b)=>(a.qlc||-1)-(b.qlc||-1)||Math.hypot(a.x-P.x,a.y-P.y)-Math.hypot(b.x-P.x,b.y-P.y));c=cand[0]}
    if(c){H.last=c;c.qlc=G.t||0;b3go(c,'cast')}}
  if(H.t>=6&&!H.end){H.end=1;H.et=0;G.qn.warn=G.qn.warn.filter(w=>!w.cast);b3go(e,'hallEnd',99);for(const r of G.enemies)if(r.type==='qmirror'&&r.q3&&!r.dead){r.st='back';r.bt=0}qSnd('hallend',e)}}
// in the Hall they all glide slowly near their mirror (never behind the glass), turned toward you
function qDrift(e,dt){if(!e.qhome)return;if(!e.dtg||Math.hypot(e.dtg.x-e.x,e.dtg.y-e.y)<1.5)e.dtg={x:e.qhome.x+rand(-24,24),y:e.qhome.y+rand(-4,10)};
  const dx=e.dtg.x-e.x,dy=e.dtg.y-e.y,dd=Math.hypot(dx,dy),st=Math.min(dd,20*dt);if(dd>.05){e.x+=dx/dd*st;e.y+=dy/dd*st}e.moving=false}
// the shot from the mirror: the arm out, the scepter on you (.10, the three red lines), the flick of the wrist (.76)
function qCast(e,a,p2,real){const k=b3k(e);e.moving=false;if(k<.10||e.qca==null)e.face=a;else e.face=e.qca;
  if(b3at(e,.10)){const q=b3pt(e,30,10,a),a0=Math.atan2(P.y-6-q.y,P.x-q.x),t=qlead(G.enemies.find(o=>o.type==='icequeen')||e,.10,.76,'cast');e.qca=a0;e.qcs={x:q.x,y:q.y};
    for(const o of[-1,0,1]){const an=a0+o*14*Math.PI/180;G.qn.warn.push({k:'lance',x:q.x,y:q.y+6,a:an,len:qReach(q.x,q.y,an,900),t,max:t,solid:t*.7,ghost:!real,cast:1})}}
  if(b3at(e,.76)&&e.qcs){for(const o of[-1,0,1])qShot(e.qcs.x,e.qcs.y,e.qca+o*14*Math.PI/180,165,5,real?QN.D.cast:QN.D.castR,'qlance',{h0:76,p2,small:1,ghost:!real});qSnd('cast',e)}}
// a reflection breaks: snow and glitter, its mirror with it (no damage)
function qBreakRefl(r){r.dead=true;qSnow(r.x,r.y-50,12,false);qSnd('break',r);if(r.rock&&G.rocks.includes(r.rock))qBurst(r.rock,false)}
// a mirror bursts: with shards (the Hall not solved in time), or only glitter (found her, or a reflection broken); shards stay on the floor
function qBurst(m,shards){qDrop(m);qSnow(m.x,m.y-24,10,true);if(BOSS2)b3mark('shards',m.x,m.y+4,18);qSnd('glass',null,m.x);
  if(shards){const o=rand(0,TAU);for(let i=0;i<6;i++){const pr=qShot(m.x,m.y,o+i*TAU/6,85,5,QN.D.burst,'qshard',{h0:20,p2:!!m.p2});if(pr)pr.life=4}}}
// the real queen is found (a direct hit in the Hall): the mirrors and the reflections shatter, her crown cracks
function qFound(e){const Q=G.qn;if(!Q||!Q.hall)return;text(e.x,e.y-140,'Specchio infranto!','#dff4ff',18);G.texts[G.texts.length-1].pop=1;
  for(const r of G.enemies)if(r.type==='qmirror'&&r.q3&&!r.dead)qBreakRefl(r);
  for(const m of Q.hall.mirrors)if(G.rocks.includes(m))qBurst(m,false);Q.hall=null;Q.warn=Q.warn.filter(w=>!w.cast);e.crownLit=0;e.hidden=false;b3go(e,'stunned');e.moving=false;shake(4);vib(30);qSnd('found',e)}
// the Gaze: the cone of light (28°, 320 px) turns with her head; exposure grows while your body is in it (and nothing in between)
function qGaze(e,k,rdt){const Q=G.qn,g=e.qg;if(k<.32||k>=.92){Q.gaze=null;return}g.used=1;
  const c=g.a0+g.s*(-Math.PI/3+(2*Math.PI/3)*(k-.32)/.60),hw=14*Math.PI/180;Q.gaze={x:e.x,y:e.y,c,hw,len:320,s:g.s};
  // the obstacles in the light tremble and lose their frost
  if((g.rk-=rdt)<=0){g.rk=.15;for(const r of G.rocks){const ang=Math.atan2(r.y-e.y,r.x-e.x),dd=Math.hypot(r.x-e.x,r.y-e.y);if(dd<320&&Math.abs(angDiff(c,ang))<hw+.1&&clearLine(e.x,e.y,r.x+(e.x-r.x)/dd*(r.r+2),r.y+(e.y-r.y)/dd*(r.r+2),0)){r.hit=Math.max(r.hit||0,.12);
      if(!LOWFX)for(let i=0;i<2;i++)G.debris.push({x:r.x+rand(-r.r,r.r),y:r.y,z:kH(r)*rand(.5,1),vx:rand(-30,30),vy:rand(-10,10),vz:rand(30,70),col:'#ffffff',s:rand(1.2,2),rot:0,vr:4,life:1.2})}}}
  if(g.done||G.state!=='play')return;const dx=P.x-e.x,dy=P.y-e.y,dd=Math.hypot(dx,dy),ang=Math.atan2(dy,dx),half=hw+Math.atan2(P.r,Math.max(dd,1));
  const inside=P.dashT<=0&&P.inv<=0&&dd>20&&dd<320+P.r&&Math.abs(angDiff(c,ang))<=half&&clearLine(e.x,e.y,P.x,P.y,0);
  g.exp=inside?g.exp+rdt:Math.max(0,g.exp-2*rdt);
  if(g.exp>=.35){g.done=true;const h0=P.hp;hurtP(Math.round(QN.D.gaze*DMG()));if(P.hp<h0){text(P.x,P.y-50,'Congelato!','#bfe9ff',16);G.texts[G.texts.length-1].pop=1;
      P.pull={x:P.x,y:P.y,sp:0,t:.7};P.dashCd=Math.max(P.dashCd,.7);P.fireCd=Math.max(P.fireCd,.7);Q.ice={x:P.x,y:P.y,t:0};qSnd('freeze',null,P.x);vib([40,30,60])}}}
// the Waltz's path: three arcs from her past you, on the side with more room, never closer than 70 px to you, inside the room and away
// from the obstacles that stay (her pillars melt when she starts dancing)
function qWaltzPath(e){const S={x:e.x,y:e.y},dx=P.x-S.x,dy=P.y-S.y,dd=Math.hypot(dx,dy)||1,u={x:dx/dd,y:dy/dd},n0={x:-u.y,y:u.x};
  const room=(nx,ny)=>{let s=0;for(let d=20;d<=160;d+=20){const x=P.x+nx*d,y=P.y+ny*d;if(x<L+30||x>R-30||y<TOP+30||y>BOT-30)break;s=d}return s};
  const side=room(n0.x,n0.y)>=room(-n0.x,-n0.y)?1:-1;
  const inRoom=pts=>pts.every(q=>q.x>=L+36&&q.x<=R-36&&q.y>=TOP+56&&q.y<=BOT-40&&!G.rocks.some(k=>!k.temp&&Math.hypot(k.x-q.x,k.y-q.y)<k.r+e.r*.8)),near=pts=>Math.min(...pts.map(q=>Math.hypot(q.x-P.x,q.y-P.y)));
  let spare=null,sd0=-1;
  // past you on the roomier side (the design), the other side, wider, two arcs; then, if she starts too close to you, away from you
  for(const[sd,arcs,lat,amp,fw] of[[side,3,110,40,120],[side,3,110,-40,120],[-side,3,110,40,120],[-side,3,110,-40,120],[side,3,150,40,120],[-side,3,150,-40,120],[side,2,120,36,120],[-side,2,120,36,120],
      [side,2,90,24,120],[-side,2,90,24,120],[side,3,120,40,-260],[-side,3,120,40,-260],[side,2,80,30,-240],[-side,2,80,30,-240]]){
    const n={x:n0.x*sd,y:n0.y*sd};let T=fw>0?{x:clamp(P.x+u.x*fw+n.x*lat,L+50,R-50),y:clamp(P.y+u.y*fw+n.y*lat,TOP+70,BOT-70)}:{x:clamp(S.x+u.x*fw+n.x*lat,L+50,R-50),y:clamp(S.y+u.y*fw+n.y*lat,TOP+70,BOT-70)};
    const mk=T=>{const pts=[];for(let i=0;i<=48;i++){const t=i/48,w=amp*Math.sin(arcs*Math.PI*t);pts.push({x:S.x+(T.x-S.x)*t+n.x*w,y:S.y+(T.y-S.y)*t+n.y*w})}return pts};
    let pts=mk(T),len=qLen(pts);
    // 280–320 px long: the end comes closer or goes farther along the base line
    for(let it=0;it<4&&(len<280||len>320);it++){const f=(len>320?300/len:Math.min(1.25,300/len));T={x:clamp(S.x+(T.x-S.x)*f,L+50,R-50),y:clamp(S.y+(T.y-S.y)*f,TOP+70,BOT-70)};pts=mk(T);len=qLen(pts)}
    if(len<120||!inRoom(pts))continue;const nd=near(pts);if(nd>=70)return qPathOf(pts);if(nd>sd0){sd0=nd;spare=pts}}
  // nothing keeps 70 px from you: the path that keeps farthest (the trail still turns red and waits before it bursts)
  return spare&&sd0>=34?qPathOf(spare):null}
const qLen=pts=>{let s=0;for(let i=1;i<pts.length;i++)s+=Math.hypot(pts[i].x-pts[i-1].x,pts[i].y-pts[i-1].y);return s};
function qPathOf(pts){const cum=[0];for(let i=1;i<pts.length;i++)cum.push(cum[i-1]+Math.hypot(pts[i].x-pts[i-1].x,pts[i].y-pts[i-1].y));G.qn.wid++;return{pts,cum,len:cum[cum.length-1],d:0,id:G.qn.wid,hit:false}}
function qPathAt(W,s){const c=W.cum;s=clamp(s,0,W.len);let i=1;while(i<c.length-1&&c[i]<s)i++;const a=W.pts[i-1],b=W.pts[i],u=(s-c[i-1])/Math.max(1e-6,c[i]-c[i-1]);
  return{x:a.x+(b.x-a.x)*u,y:a.y+(b.y-a.y)*u,a:Math.atan2(b.y-a.y,b.x-a.x)}}
// the gem bare in the Crowning, the crown cracked after the Hall: the blows hurt more (and the first time in the run, the words);
// in the Hall a direct hit on the real queen finds her; a reflection breaks at the second blow (the brain counts the blows, not health)
{const _h=hurtE;hurtE=function(e,d,crit,dot){if(QON&&e&&!e.dead){
    if(e.type==='qmirror'&&e.q3){if(e.hidden||e.intro>0||e.st==='back')return _h.apply(this,arguments);if(dot)return;e.flash=.08;e.h3q=G.t;e.qh=(e.qh||0)+1;qSnd('tick',e);
      if(e.qh>=2)qBreakRefl(e);return}
    if(e.type==='icequeen'&&!e.hidden&&!(e.intro>0)){if(!dot&&(e.st==='hall'||e.st==='cast')&&G.qn&&G.qn.hall)qFound(e);
      const k=b3k(e);if(e.st==='crown'&&k>=.17&&k<=.74||e.st==='stunned'){const A=[...arguments];A[1]=d*1.5;if(!G.q3txt){G.q3txt=1;text(e.x,e.y-150,'Colpo alla corona!','#ffd84a',18)}return _h.apply(this,A)}}}
  return _h.apply(this,arguments)}}
// ---- the reflections: they come out of their mirror with her, glide near it, cast when their turn comes, go back into the glass
if(QON)EUPD.qmirror=function(e,dt,sm,a,d){const Q=qQueen();if(!e.q3||!Q||!G.qn){e.dead=true;return}if(!G.qn.hall&&e.st!=='back'){qBreakRefl(e);return}dt*=qsp(Q);b3tick(e,dt);const k=b3k(e);e.p2=!!Q.p2;
  switch(e.st){
  case 'emerge':e.hidden=true;e.moving=false;e.face=k<.5?Math.PI/2:a;if(e.stT<=0){e.hidden=false;b3go(e,'hall',99)}break;
  case 'hall':e.hidden=false;e.face=a;qDrift(e,dt);break;
  case 'cast':e.hidden=false;qCast(e,a,Q.p2,false);if(e.stT<=0)b3go(e,'hall',99);break;
  case 'back':e.hidden=true;e.moving=false;e.bt=(e.bt||0)+dt/qsp(Q);e.alpha=Math.max(0,1-e.bt/.4);if(e.bt>=.4)e.dead=true;break;
  default:b3go(e,'hall',99)}};
// ---- the dangers on the floor and in the air, in real time
function qUpdate(dt){const Q=G.qn;if(!Q)return;if(G.state!=='play'){if(Q.warn.length||Q.falls.length||Q.runs.length||Q.spikes.length||Q.trail.length||Q.hall)qClear();return}
  for(let i=Q.warn.length-1;i>=0;i--){Q.warn[i].t-=dt;if(Q.warn[i].t<=0)Q.warn.splice(i,1)}
  for(let i=Q.frost.length-1;i>=0;i--){Q.frost[i].t+=dt;if(Q.frost[i].t>=1)Q.frost.splice(i,1)}
  // the stalactites of the Crowning: they fall, land (21 px: the hero is hit and the stalactite shatters), stand as pillars
  for(let i=Q.falls.length-1;i>=0;i--){const f=Q.falls[i];f.t+=dt;f.spin+=dt*9;if(f.t<f.t1)continue;Q.falls.splice(i,1);
    const near=Math.hypot(P.x-f.x,P.y-f.y)<21;if(near&&P.inv<=0&&P.dashT<=0)hurtP(Math.round(QN.D.land*DMG()));
    stamp('cracks',f.x,f.y,14);qFrost(f.x,f.y,12);shake(2);qSnd('land',null,f.x);
    if(near||Math.hypot(P.x-f.x,P.y-f.y)<P.r+13){qSnow(f.x,f.y-10,8,false);continue}
    const k=qRock(f.x,f.y,12,'pillar',7,f.p2);if(f.c)f.c.pillars.push(k);if(BOSS2)ENV2.rocks(f.x,f.y,60,1)}
  // the spikes running out along the arms of the Royal Snowflake
  for(let i=Q.runs.length-1;i>=0;i--){const r=Q.runs[i];r.s+=420*dt;const ca=Math.cos(r.a),sa=Math.sin(r.a);
    while(r.next<=Math.min(r.s,r.len)){const x=r.x+ca*r.next,y=r.y+sa*r.next;Q.spikes.push({x,y,t:0,dur:.48,h:20,a:r.a,p2:r.p2,seed:Math.random()*10,f:r.f});r.next+=18;
      if(!LOWFX&&r.next%54<18)fxPush({k:'snowp',x,y:y-6,vx:rand(-20,20),vy:-rand(20,50),t:.4})}
    if(r.s>=r.len){Q.runs.splice(i,1);qFrostArm(r.x,r.y,r.a,r.len);if(BOSS2)ENV2.rocks(r.x+ca*r.len,r.y+sa*r.len,40,0)}}
  // a spike hurts while it rises (once per flake, or once per waltz)
  for(let i=Q.spikes.length-1;i>=0;i--){const s=Q.spikes[i];s.t+=dt;if(s.t<.06&&s.f&&!s.f.hit&&P.inv<=0&&P.dashT<=0&&Math.hypot(P.x-s.x,P.y-s.y)<(s.hr||20)){s.f.hit=true;hurtP(Math.round((s.h===16?QN.D.trail:QN.D.spike)*DMG()))}
    if(s.t>=s.dur)Q.spikes.splice(i,1)}
  // the Waltz's trail: blue a moment, then red, then (0.85 s after her) a spike
  for(let i=Q.trail.length-1;i>=0;i--){const s=Q.trail[i];s.t+=dt;if(s.t<.85)continue;Q.trail.splice(i,1);const wf=Q.wf||(Q.wf={});
    const f=wf[s.w]||(wf[s.w]={hit:false});Q.spikes.push({x:s.x,y:s.y,t:0,dur:.36,h:16,a:rand(0,TAU),p2:true,seed:Math.random()*10,f,hr:18});if(!LOWFX&&Math.random()<.4)fxPush({k:'snowp',x:s.x,y:s.y-6,vx:rand(-20,20),vy:-30,t:.35})}
  if(Q.ice){Q.ice.t+=dt;if(Q.ice.t>=.7){qSnow(Q.ice.x,Q.ice.y-14,8,false);qSnd('icebreak',null,Q.ice.x);Q.ice=null}}
  // her shots that have gone: a frost mark where a lance struck a wall or an obstacle, a little burst where a shard of the ring broke
  for(const p of Q.live){if(G.eproj.includes(p))continue;Q.live.delete(p);const hk=G.rocks.find(k=>Math.hypot(k.x-p.x,k.y-p.y)<k.r+p.r*.5+4),wall=p.x<L+4||p.x>R-4||p.y<TOP+4||p.y>BOT-4;
    if(hk||wall){if(p.kind==='qlance'&&!p.small)qFrost(clamp(p.x,L+4,R-4),clamp(p.y,TOP+4,BOT-4),9);if(hk)hk.hit=Math.max(hk.hit||0,.15)}
    else if(p.kind==='qshard'&&p.life<=.05&&!LOWFX){qSnow(p.x,p.y,5,false)}}
  // the second phase: the torches stay violet-white for the rest of the fight
  const e=qQueen();if(e&&Q.night&&BOSS2&&G.env&&!(G._tT>0)&&G.env.light!==QN.T.night[1])qTorchSet('night',600);
  // no Hall (it ended, or the hero fell in it): the mirrors still standing melt (not while they rise in the move 'mirror')
  if(!Q.hall&&!(e&&e.st==='mirror'))for(const k of G.rocks)if(k.qk==='mirror'&&k.life>.4)k.life=.4}
{const _u=update;update=function(dt){_u.apply(this,arguments);try{if(QON&&G&&G.qn&&started&&!paused)qUpdate(dt)}catch(err){console.error(err)}}}
// ---- the drawings: on the floor the warnings (lines of the lances, bands of the shards, the arms of the flake, the circles, the sector
// and the cone of the Gaze, the Waltz's path, its ring), the trail, the frost of her glide, the cone of light; in the air the stalactites
// falling, the spikes, the ice cube round you
function qClip(){ctx.beginPath();ctx.rect(L,TOP,R-L,BOT-TOP);ctx.clip()}
function qGround(){const Q=G.qn;if(!Q)return;const t=G.t||0,pu=.55+.3*Math.sin(t*18),R0=QN.red;ctx.save();qClip();
  for(const f of Q.frost){const a=1-f.t;ctx.fillStyle=`rgba(235,248,255,${(.32*a).toFixed(3)})`;ell(f.x,f.y,f.r*(1+.3*f.t),f.r*.5*(1+.3*f.t));ctx.fill()}
  for(const f of Q.falls){const u=clamp((f.t-f.t0)/Math.max(.01,f.t1-f.t0),0,1);ctx.fillStyle=`rgba(10,20,50,${(.12+.3*u).toFixed(3)})`;ell(f.x,f.y,6+8*u,(6+8*u)*.5);ctx.fill()}
  for(const w of Q.warn){const el=w.max-w.t,kk=clamp(el/w.max,0,1);
    if(w.k==='lance'){const sol=el>=w.solid;ctx.save();ctx.translate(w.x,w.y);ctx.rotate(w.a);ctx.strokeStyle=`rgba(${R0},${sol?(Math.sin(t*28)>0?.95:.6):.7})`;ctx.lineWidth=sol?3:2.2;if(!sol)ctx.setLineDash([8,6]);
      ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(w.len,0);ctx.stroke();ctx.setLineDash([]);ctx.restore()}
    else if(w.k==='band'){ctx.save();ctx.translate(w.x,w.y);ctx.rotate(w.a);ctx.fillStyle=`rgba(${R0},${(.08+.2*kk).toFixed(3)})`;ctx.fillRect(0,-w.w/2,w.len,w.w);ctx.strokeStyle=`rgba(${R0},${pu.toFixed(3)})`;ctx.lineWidth=2;
      ctx.setLineDash([8,6]);ctx.strokeRect(0,-w.w/2,w.len,w.w);ctx.setLineDash([]);ctx.restore()}
    else if(w.k==='flake'){const fl=clamp(el/Math.max(.01,w.fill),0,1);for(const r of w.arms){ctx.save();ctx.translate(w.x,w.y);ctx.rotate(r.a);
        ctx.fillStyle=`rgba(${R0},${(.07+.08*kk).toFixed(3)})`;ctx.fillRect(0,-12,r.len,24);ctx.fillStyle=`rgba(${R0},${(.16+.16*kk).toFixed(3)})`;ctx.fillRect(0,-12,r.len*fl,24);
        ctx.strokeStyle=`rgba(${R0},${pu.toFixed(3)})`;ctx.lineWidth=2;ctx.setLineDash([8,6]);ctx.strokeRect(0,-12,r.len,24);ctx.setLineDash([]);
        // the little side branches of the snowflake (only a drawing: they do not hurt)
        ctx.strokeStyle=`rgba(${R0},.3)`;ctx.lineWidth=1.4;ctx.beginPath();for(let s=40;s<r.len-14;s+=46){for(const d of[-1,1]){ctx.moveTo(s,d*12);ctx.lineTo(s+12,d*22)}}ctx.stroke();ctx.restore()}
      if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow(QN.ice,w.x,w.y,22,.25+.25*kk);ctx.restore()}}
    else if(w.k==='disc'){ctx.fillStyle=`rgba(${R0},${(.1+.24*kk).toFixed(3)})`;ell(w.x,w.y,w.r*kk,w.r*kk*.6);ctx.fill();ctx.strokeStyle=`rgba(${R0},${pu.toFixed(3)})`;ctx.lineWidth=2.4;ell(w.x,w.y,w.r,w.r*.6);ctx.stroke()}
    else if(w.k==='gazew'){const a0=w.a0,s=w.s,D=74*Math.PI/180,h=14*Math.PI/180,st=a0-s*Math.PI/3;
      ctx.fillStyle=`rgba(${R0},.08)`;ctx.beginPath();ctx.moveTo(w.x,w.y);ctx.arc(w.x,w.y,320,Math.min(a0-D,a0+D),Math.max(a0-D,a0+D));ctx.closePath();ctx.fill();
      ctx.fillStyle=`rgba(${R0},${(.18+.12*kk).toFixed(3)})`;ctx.beginPath();ctx.moveTo(w.x,w.y);ctx.arc(w.x,w.y,320,st-h,st+h);ctx.closePath();ctx.fill();ctx.strokeStyle=`rgba(${R0},${pu.toFixed(3)})`;ctx.lineWidth=2;ctx.stroke();
      // the white arrow of the turn, curved round her
      const r=150,b0=st+s*.12,b1=st+s*.75;ctx.strokeStyle='rgba(255,255,255,.85)';ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();ctx.arc(w.x,w.y,r,Math.min(b0,b1),Math.max(b0,b1));ctx.stroke();
      const ax=w.x+Math.cos(b1)*r,ay=w.y+Math.sin(b1)*r,ta=b1+s*Math.PI/2;ctx.fillStyle='rgba(255,255,255,.9)';ctx.beginPath();ctx.moveTo(ax+Math.cos(ta)*10,ay+Math.sin(ta)*10);
      ctx.lineTo(ax+Math.cos(ta+2.5)*8,ay+Math.sin(ta+2.5)*8);ctx.lineTo(ax+Math.cos(ta-2.5)*8,ay+Math.sin(ta-2.5)*8);ctx.closePath();ctx.fill()}
    else if(w.k==='path'){ctx.strokeStyle=`rgba(240,250,255,${(.35+.25*Math.sin(t*10)).toFixed(3)})`;ctx.lineWidth=2;ctx.setLineDash([6,7]);ctx.beginPath();w.pts.forEach((q,i)=>i?ctx.lineTo(q.x,q.y+4):ctx.moveTo(q.x,q.y+4));ctx.stroke();ctx.setLineDash([])}
    else if(w.k==='ring8'){ctx.fillStyle=`rgba(${R0},${(.08+.18*kk).toFixed(3)})`;ell(w.x,w.y,w.r,w.r*.6);ctx.fill();ctx.strokeStyle=`rgba(${R0},${pu.toFixed(3)})`;ctx.lineWidth=2.4;ell(w.x,w.y,w.r,w.r*.6);ctx.stroke();
      for(let i=0;i<8;i++){const a=i/8*TAU,on=kk>=(i+1)/8;ctx.fillStyle=on?'rgba(255,240,240,.95)':`rgba(${R0},.65)`;circ(w.x+Math.cos(a)*w.r*1.12,w.y+Math.sin(a)*w.r*.67,on?3:2);ctx.fill()}}}
  // the Waltz's trail: blue just after her, red when it is about to burst
  for(const s of Q.trail){if(s.t<.2){ctx.fillStyle=`rgba(${QN.ice},${(.35*(1-s.t/.2)+.15).toFixed(3)})`;ell(s.x,s.y,8,4.8);ctx.fill()}
    else{const k2=(s.t-.2)/.65;ctx.fillStyle=`rgba(${R0},${(.16+.3*k2).toFixed(3)})`;ell(s.x,s.y,9+4*k2,(9+4*k2)*.6);ctx.fill();ctx.strokeStyle=`rgba(${R0},${pu.toFixed(3)})`;ctx.lineWidth=1.6;ell(s.x,s.y,10,6);ctx.stroke()}}
  // the light of the Gaze on the floor: fifteen rays, each to the first obstacle or the wall
  if(Q.gaze){const g=Q.gaze,pts=[];for(let i=0;i<15;i++){const an=g.c-g.hw+2*g.hw*i/14;pts.push([an,qReach(g.x,g.y,an,g.len)])}
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=`rgba(${LOWFX?'170,190,255':'160,190,255'},.35)`;ctx.beginPath();ctx.moveTo(g.x,g.y);for(const[an,l] of pts)ctx.lineTo(g.x+Math.cos(an)*l,g.y+Math.sin(an)*l);ctx.closePath();ctx.fill();ctx.restore();
    ctx.strokeStyle=`rgba(${R0},.85)`;ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(g.x,g.y);ctx.lineTo(g.x+Math.cos(pts[0][0])*pts[0][1],g.y+Math.sin(pts[0][0])*pts[0][1]);
    ctx.moveTo(g.x,g.y);ctx.lineTo(g.x+Math.cos(pts[14][0])*pts[14][1],g.y+Math.sin(pts[14][0])*pts[14][1]);ctx.stroke()}
  ctx.restore()}
function qAir(){const Q=G.qn;if(!Q)return;
  for(const f of Q.falls){if(f.t<f.t0)continue;const u=clamp((f.t-f.t0)/Math.max(.01,f.t1-f.t0),0,1),z=260*(1-u*u);qPillarArt(f.x,f.y,z,0,{p2:f.p2,spin:f.spin,seed:f.seed})}
  for(const s of Q.spikes)qSpikeArt(s);
  if(Q.ice){const A=qart('Ice'),k=Math.min(.999,Q.ice.t/.7);if(A){try{A(P.x,P.y+6,k,1,{});return}catch(e){}}const q=k<.15?k/.15:k<.8?1:1-(k-.8)/.2;if(q>0){ctx.save();ctx.globalAlpha*=.8;ink(2);ctx.fillStyle='rgba(190,235,255,.55)';ctx.beginPath();ctx.rect(P.x-15,P.y+6-34*q,30,34*q);ctx.fill();ctx.stroke();ctx.restore()}}}
{const _g2=drawHazards2Ground;drawHazards2Ground=function(){_g2.apply(this,arguments);try{if(QON)qGround()}catch(err){}}}
{const _a2=drawHazards2Air;drawHazards2Air=function(){_a2.apply(this,arguments);try{if(QON)qAir()}catch(err){}}}
// the model's drawings of the pieces, or the game's simple ones
const QC=p2=>p2?['#f6f2ff','#c9b8ff','#6a4fd6','200,170,255']:['#ffffff','#9adaff','#3f7fd0','150,235,255'];
function qPillarArt(x,y,z,k,o){const A=qart('Pillar');if(A){try{A(x,y,z,k,1,o);return}catch(e){}}
  const c=QC(o.p2),h=34*(k>.85?1-(k-.85)/.15:1),w=10;if(h<=.5)return;ctx.save();ctx.translate(x,y-(z||0));if(z>0)ctx.rotate(Math.sin(o.spin||0)*.5);ink(2);ctx.beginPath();ctx.moveTo(-w,0);ctx.lineTo(-w*.5,-h*.7);ctx.lineTo(0,-h);ctx.lineTo(w*.45,-h*.65);ctx.lineTo(w,0);ctx.closePath();
  const g=ctx.createLinearGradient(-w,0,w,0);g.addColorStop(0,c[2]);g.addColorStop(.45,c[1]);g.addColorStop(1,c[2]);ctx.fillStyle=g;ctx.fill();ctx.stroke();ctx.fillStyle=c[0];ctx.beginPath();ctx.moveTo(-w*.35,-h*.1);ctx.lineTo(0,-h*.92);ctx.lineTo(-w*.05,-h*.1);ctx.closePath();ctx.fill();ctx.restore()}
function qSpikeArt(s){const k=Math.min(.999,s.t/s.dur),A=qart('Spike');if(A){try{A(s.x,s.y,s.h,k,1,{a:s.a,seed:s.seed,p2:s.p2});return}catch(e){}}
  const c=QC(s.p2),q=k<.15?k/.15:k<.8?1:1-(k-.8)/.2;if(q<=0)return;const H=s.h*q,w=6;ctx.save();ctx.translate(s.x,s.y);ink(1.6);ctx.beginPath();ctx.moveTo(-w,0);ctx.lineTo(0,-H);ctx.lineTo(w,0);ctx.closePath();ctx.fillStyle=c[1];ctx.fill();ctx.stroke();
  ctx.fillStyle=c[0];ctx.beginPath();ctx.moveTo(-w*.3,0);ctx.lineTo(0,-H*.9);ctx.lineTo(0,0);ctx.closePath();ctx.fill();ctx.restore()}
// her obstacles: the pillar (0 planted, .85 standing, 1 melted), the mirror (it rises in the first quarter; the eyes, the ripples, her shape
// inside when the reflections go back, the cracks)
if(QON){const _dr=drawRock;drawRock=function(k){if(!k.qk)return _dr.apply(this,arguments);const age=(G.t||0)-(k.born||0),dx=k.hit>0?Math.sin((G.t||0)*90)*k.hit*14:0;
  ctx.save();try{if(k.qk==='pillar'){const kk=k.life<.5?.85+.15*(1-k.life/.5):.85*Math.min(1,age/6.5);qPillarArt(k.x+dx,k.y,0,Math.min(.999,kk),{p2:k.p2,seed:k.seed})}
    else{const H=G.qn&&G.qn.hall,inMove=G.enemies.find(o=>o.type==='icequeen'&&o.st==='mirror'),eyes=inMove?clamp((b3k(inMove)-.45)/.1,0,1)*(1-clamp((b3k(inMove)-.8)/.05,0,1)):0,
        inside=H&&H.end?clamp(H.et/.4,0,1):0,o={p2:k.p2,eyes,look:Math.atan2(P.y-k.y,P.x-k.x),inside,ripple:age<.9?Math.sin(clamp(age/.9,0,1)*Math.PI):0,crack:H&&H.end?Math.min(3,Math.floor(H.et/.35)):0};
      ctx.globalAlpha*=Math.min(1,k.life/.4);const A=qart('Mirror'),kk=Math.min(.999,age<.4?age/.4*.25:.25+.74*Math.min(1,(age-.4)/6));
      if(A)A(k.x+dx,k.y,kk,1,o);else{const up=clamp(kk/.25,0,1),Hh=46*up,W=15;if(Hh>1){ctx.translate(k.x+dx,k.y);ink(2.4);ctx.beginPath();ctx.moveTo(-W,0);ctx.lineTo(-W,-Hh+W);ctx.arc(0,-Hh+W,W,Math.PI,0);ctx.lineTo(W,0);ctx.closePath();
        ctx.fillStyle=k.p2?'#b9a8f0':'#c3cde8';ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(-W+3,-2);ctx.lineTo(-W+3,-Hh+W);ctx.arc(0,-Hh+W,W-3,Math.PI,0);ctx.lineTo(W-3,-2);ctx.closePath();ctx.fillStyle='#16224c';ctx.fill();
        if(eyes){ctx.fillStyle=`rgba(160,240,255,${eyes})`;for(const s of[-3,3]){circ(s,-Hh*.62,1.4);ctx.fill()}}}}}}catch(err){}ctx.restore()}}
// the shots: the crystal lance (it falls from the arc over her head to its flight in its first instant), the shard, the flake
Object.assign(TRC,{qlance:'170,235,255',qshard:'190,230,255',qflake:'220,240,255'});
// (the lances leave from where the model stops drawing them, over her head or on the scepter's crystal, and come down to their flight)
const qH0=p=>{if(!p.h0)return 0;const u=Math.min(1,((G.t||0)-(p.t0||0))/.22);return p.h0*(1-u)*(1-u)};
Object.assign(EPDRAW,{
  qlance:p=>{const A=qart('Lance'),h=qH0(p);if(A){try{A(p.x,p.y,h,p.a,1,{p2:p.p2,small:p.small,ghost:p.ghost});return}catch(e){}}const c=QC(p.p2),s=p.small?.75:1,L0=13*s;
    ctx.save();ctx.translate(p.x,p.y-h);ctx.rotate(p.a);if(p.ghost)ctx.globalAlpha*=.6;if(!LOWFX)glow(c[3],0,0,L0*1.3,.45);ink(1.6);ctx.beginPath();ctx.moveTo(L0,0);ctx.lineTo(-L0*.2,-3.2*s);ctx.lineTo(-L0,0);ctx.lineTo(-L0*.2,3.2*s);ctx.closePath();
    ctx.fillStyle=c[1];ctx.fill();ctx.stroke();ctx.fillStyle=c[0];ctx.beginPath();ctx.moveTo(L0*.9,0);ctx.lineTo(-L0*.2,-1.4*s);ctx.lineTo(-L0*.6,0);ctx.closePath();ctx.fill();ctx.restore()},
  qshard:p=>{const A=qart('Shard'),h=qH0(p);if(A){try{A(p.x,p.y,h,p.a,1,{p2:p.p2});return}catch(e){}}const c=QC(p.p2);ctx.save();ctx.translate(p.x,p.y-h);ctx.rotate(p.a);if(!LOWFX)glow(c[3],0,0,12,.35);ink(1.4);
    ctx.beginPath();ctx.moveTo(6,0);ctx.lineTo(-3,-2.6);ctx.lineTo(-6,0);ctx.lineTo(-3,2.6);ctx.closePath();ctx.fillStyle=c[1];ctx.fill();ctx.stroke();ctx.restore()},
  qflake:p=>{const A=qart('Flake'),a=(G.t||0)*3+(p.x+p.y)*.01;if(A){try{A(p.x,p.y,0,a,1,{p2:p.p2});return}catch(e){}}ctx.save();ctx.translate(p.x,p.y);ctx.rotate(a);if(!LOWFX)glow('190,235,255',0,0,12,.4);
    ctx.strokeStyle=INK;ctx.lineWidth=3.6;ctx.lineCap='round';ctx.beginPath();for(let i=0;i<6;i++){const q=i*Math.PI/3;ctx.moveTo(0,0);ctx.lineTo(Math.cos(q)*7,Math.sin(q)*7)}ctx.stroke();ctx.strokeStyle='#ffffff';ctx.lineWidth=1.8;ctx.stroke();
    ctx.fillStyle='#8fe8ff';circ(0,0,2);ctx.fill();ctx.restore()}});
// ---- the room: her halo is not drawn in the Hall (the real one must be told by her shadow and her lit crown), no particles converging
// and no charge ring when she changes move (her warning is the crown), none of the old reactions of 52 (nova, blizzard, storm)
if(QON){{const _bb=b2back;b2back=function(e){if(e.type==='icequeen'&&QN.HALL.has(e.st))return;return _bb.apply(this,arguments)}}
  {const _bf=b2front;b2front=function(e){if(e.type==='icequeen')e._b2st=e.st;return _bf.apply(this,arguments)}}
  {const _r=b2react;b2react=function(e){if(e.type==='icequeen')return;return _r.apply(this,arguments)}}}
// ---- the entrance (3.4 s, the model's 'enter'): «Specchio, specchio…» — she steps out of a mirror of ice, which then shatters
if(QON){const _bi=bossIntro;bossIntro=function(e,dt,a){if(e.type!=='icequeen')return _bi.apply(this,arguments);
  const T=BOSS_INTRO.icequeen;if(e.iT==null){e.iT=0;e.iStep=0}const t0=e.iT;e.iT+=dt;const t=e.iT,at=s=>t0<s&&t>=s;e.intro=Math.max(0,T-t);e.face=a;e.st='enter';e.z=0;e.em=t<3.3?.999:1;e.fa=null;e.hidden=false;
  if(t0===0){sfx('creep',2,e.x);sfx('freeze',1,e.x)}
  if(at(.95))sfx('shimmer',0,e.x);if(at(1.1))qSnd('hum',e);
  if(t>1.1&&t<2&&!LOWFX&&Math.random()<.3){const q=b3pt(e,-16,0);fxPush({k:'snowp',x:q.x+rand(-14,14),y:q.y-rand(4,60),vx:rand(-10,10),vy:rand(-20,10),t:.5})}
  if(at(2.24)){const q=b3pt(e,-16,0);qSnow(q.x,q.y-34,16,true);qSnd('glass',null,q.x);shake(3);if(BOSS2){b3mark('shards',q.x,q.y+2,22);ENV2.fall(B3N(4),true)}qFrost(q.x,q.y,20)}
  if(at(3.13)){shake(5);vib([50,30,80]);qFrost(e.x,e.y+6,40);qTorch('blue',2);if(!b3say(e,'cry'))sfx('shimmer');
    for(let i=0;i<3;i++)setTimeout(()=>{if(G&&G.fx)fxPush({k:'ring2',x:e.x,y:e.y,rgb:'220,240,255',r0:e.r,r1:e.r*(4+i*1.6),t:.5,max:.5,w:7-i*2})},i*150)}
  if(e.intro<=0){e.z=0;e.em=null;e.fa=null;e.si=-1;qWalk(e,.9)}}}
// what the model plays: the entrance over its whole length, every move on the brain's own clock (so the model's blow and the game's blow
// are the same frame, in the second phase too), 'idle' in the Hall (the real queen and her reflections the same)
if(QON){const _nm=n3Move;n3Move=function(e){if(e.type==='icequeen'||e.type==='qmirror'&&e.q3){if(e.intro>0)return['enter',Math.min(.999,Math.max(0,(e.iT||0)/BOSS_INTRO.icequeen))];
    const M=N3.meta[e.type],st=e.st;if(st==='hall'||st==='hallEnd'||st==='back')return['idle',(((G.t||0)+(e.o3||(e.o3=Math.random()*7)))/((M.dur&&M.dur.idle)||3))%1];
    if(st&&st!=='walk'&&M&&M.an.includes(st))return[st,Math.min(.999,Math.max(0,b3k(e)))]}return _nm.apply(this,arguments)}}
// ---- the defeat (4 s, the model's 'die'): «l'ultimo inchino», a whirl of snow, the crown and the scepter left on a little heap
if(QON){const _sb=snapBoss;snapBoss=function(e){if(e.type==='icequeen')return{live:1};return _sb.apply(this,arguments)}
  BDIE.icequeen={setup(c){const e=c.e;c.face=e.f3!=null?e.f3:(e.face||Math.PI/2);c.p2=!!e.p2;c.live=1;qreset();
      for(const k of G.rocks)if(k.qk)k.life=Math.min(k.life,.5);for(const r of G.enemies)if(r.type==='qmirror'&&!r.dead){r.dead=true;qSnow(r.x,r.y-50,8,false)}},
    tick(c,dt,D){const p=Math.min(1,c.t/c.dur),at=s=>c.t-dt<s&&c.t>=s;
      if(at(.5))qSnd('hum',c);if(at(1.7))qSnd('crack',c);if(at(2.8))qSnd('tin',c);if(at(2.9)){qSnd('thud',c);shake(2)}
      if(at(2.3)){qTorchSet('warm',1.4);for(let i=0;i<(LOWFX?6:18);i++)cpart(c,{k:'frost',x:c.x+rand(-24,24),y:c.y-rand(10,110),vx:rand(-40,40),vz:rand(20,90),g:-10,life:rand(.8,1.4),r:rand(2,4),ph:rand(0,3)})}
      if(p>.55&&p<.8&&Math.random()<(LOWFX?.2:.7)){const a=c.t*7+Math.random()*2;cpart(c,{k:'spark',x:c.x+Math.cos(a)*rand(8,30),y:c.y-rand(20,120),vx:Math.cos(a+1.6)*30,vz:rand(30,70),life:rand(.6,1),r:1.6,col:'235,248,255'})}
      if(p>.8&&Math.random()<(LOWFX?.05:.2))cpart(c,{k:'frost',x:c.x+rand(-30,30),y:c.y-rand(30,90),vx:rand(-6,6),vz:-rand(10,25),life:1.2,r:rand(2,3),ph:rand(0,3)})},
    draw(c,D){const p=Math.min(.999,c.t/c.dur),M=N3.meta.icequeen;try{N3.icequeen(c.x,c.y+8,c.face,'die',p,(M&&M.sc)||1,{p2:c.p2,noFx:LOWFX})}catch(err){}}};
  const _dc=drawCorpse;drawCorpse=function(c){if(c.type!=='icequeen')return _dc.apply(this,arguments);try{BDIE.icequeen.draw(c,BDEATH.icequeen)}catch(err){}drawParts(c)}}
// ---- the arena pictures: she is far taller than the queen of today, so she is drawn a little smaller there
if(QON){if(typeof arenaScene==='function'){const _as=arenaScene;arenaScene=function(cv,i){const A=ARENAS[i];if(!A||A.bt||BOSSZ[A.boss]!=='icequeen')return _as.apply(this,arguments);QN.gs=.9;try{return _as.apply(this,arguments)}finally{QN.gs=0}}}}
// ---- the sounds of her ice and glass (her voice is below): the crown's clock, the lances born and thrown, the pillars, the snowflake,
// the mirrors, the freeze. Glass is a struck object with inharmonic partials (fModal), frost a high hiss
function qGlass(t,f,v,dec){fModal(t,VR(f,.02),[1,2.32,4.25,6.63],[(dec||.5),(dec||.5)*.64,(dec||.5)*.4,(dec||.5)*.24],.07*v,.45)}
function qSnd(k,e,x){if(!AU.ctx||!AU.on.sfx||AU.ctx.state!=='running')return;try{const t=AU.ctx.currentTime+.01;let v=1;if(e&&e.x!=null)v=Math.max(.55,enemyAt(e));else if(x!=null)AU.pan=clamp((x-(G.vx||0)-VW/2)/200,-.7,.7);
  switch(k){
  case 'born':for(let i=0;i<5;i++)qGlass(t+i*.07,VR(2600+i*180,.04),.45*v,.3);fNoise(t,.5,'highpass',5200,.7,.035*v,{att:.2,rev:.5});break;
  case 'crownoff':fModal(t,VR(196,.02),[1,2.76,5.4],[1.6,1,.5],.09*v,.6);for(let i=0;i<7;i++)qGlass(t+.05+i*.05,VR(2100+i*240,.05),.5*v,.25);break;
  case 'land':M.ice(t,.5);fThump(t,VR(220,.08),90,.08,.18);break;
  case 'shards':for(let i=0;i<6;i++)qGlass(t+i*.025,VR(3000,.1),.35*v,.15);whoosh(t,.25,3600,1400,.05,.2);break;
  case 'plant':fThump(t,VR(140,.05),55,.18,.4*v,.15);M.ice(t+.01,.9);fNoise(t,.3,'highpass',3200,.7,.06*v,{rev:.4});break;
  case 'nova':fModal(t,VR(1568,.02),[1,2.32,4.25,6.63,8.9],[1.4,.9,.55,.3,.2],.08,.6);fNoise(t,.6,'highpass',4200,.7,.07,{f2:9000,att:.02,rev:.5});break;
  case 'tug':fThump(t,VR(170,.1),80,.1,.22*v);fNoise(t,.12,'highpass',2800,.8,.06*v);break;
  case 'tear':fThump(t,VR(200,.08),70,.14,.3*v);M.ice(t+.02,.7);break;
  case 'mirror':[1319,1568,1760,2093,2637].forEach((f,i)=>qGlass(t+i*.06,f,.55*v,.6));fNoise(t+.2,.6,'bandpass',5000,1.2,.05*v,{att:.25,rev:.6});break;
  case 'emerge':fNoise(t,.5,'highpass',4400,.7,.05*v,{f2:9000,att:.15,rev:.6});qGlass(t+.1,1760,.4*v,.8);break;
  case 'cast':qGlass(t,VR(2350,.04),.5*v,.25);whoosh(t,.14,3400,1600,.04);break;
  case 'tick':qGlass(t,VR(3200,.06),.6*v,.12);break;
  case 'break':for(let i=0;i<5;i++)qGlass(t+i*.03,VR(2400+i*300,.1),.6*v,.3);fNoise(t,.35,'highpass',4800,.7,.07*v,{rev:.4});break;
  case 'glass':for(let i=0;i<8;i++)qGlass(t+Math.random()*.25,VR(1900+i*260,.1),.6,.35);fNoise(t,.5,'highpass',4200,.7,.08,{rev:.5});break;
  case 'found':for(let i=0;i<10;i++)qGlass(t+i*.035,VR(1700+i*200,.06),.7*v,.4);fModal(t,VR(330,.02),[1,2.4,3.9],[1,.6,.4],.06*v,.5);break;
  case 'hallend':fNoise(t,.4,'bandpass',VR(900,.1),2,.05*v,{f2:300,att:.1,rev:.5});break;
  case 'freeze':M.ice(t,1);fNoise(t,.5,'highpass',3600,.7,.1,{f2:8000,att:.02,rev:.4});qGlass(t+.05,1400,.8,.6);break;
  case 'icebreak':for(let i=0;i<6;i++)qGlass(t+i*.03,VR(2200+i*250,.1),.6,.25);M.ice(t,.6);break;
  case 'flakes':for(let i=0;i<8;i++)qGlass(t+i*.02,VR(2800+i*90,.05),.3*v,.3);whoosh(t,.4,2600,900,.06,.3);break;
  case 'fan':qGlass(t,VR(3100,.03),.4*v,.15);break;
  case 'crack':fNoise(t,.08,'highpass',3000,.8,.12*v);qGlass(t,VR(1300,.05),.8*v,.5);break;
  case 'hum':{const c=AU.ctx,f=VR(1046,.02),o=osc('sine',f,t,t+1.1),o2=osc('sine',f*2.01,t,t+1.1),g=c.createGain(),am=osc('sine',6,t,t+1.1),amg=c.createGain();amg.gain.value=.012;am.connect(amg);amg.connect(g.gain);
    g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.022*v,t+.3);g.gain.exponentialRampToValueAtTime(.0005,t+1.05);o.connect(g);o2.connect(g);route(g,null,.6);break}
  case 'tin':qGlass(t,2093,.9,.7);qGlass(t+.012,2637,.6,.6);break;
  case 'thud':fThump(t,VR(120,.05),50,.2,.35,.15);M.metal(t,.4,VR(780,.05),.5);break
  case 'night':fModal(t,VR(131,.02),[1,2.76,5.4],[2.2,1.4,.8],.08*v,.8);for(let i=0;i<6;i++)qGlass(t+.05+i*.09,[2637,2349,2093,1760,1568,1319][i],.6*v,.9);fNoise(t,1.2,'highpass',3800,.7,.06*v,{f2:8000,att:.3,rev:.6});break}}catch(err){}AU.pan=0}
// a shot of hers is glass, not the game's «pfft»: each lance a «tin» a little higher than the one before
{let qT=0,qN=0;const _s=sfx;sfx=function(k,arg,x){if(QON&&k==='eshot'&&(arg==='qlance'||arg==='qshard'||arg==='qflake')){if(!AU.ctx||!AU.on.sfx)return;const now=performance.now();if(now-qT<35)return;qN=now-qT>220?0:qN+1;qT=now;
    try{const t=AU.ctx.currentTime+.005;if(arg==='qlance'){qGlass(t,1760*Math.pow(1.06,Math.min(8,qN)),.55,.3);whoosh(t,.12,3400,1500,.04)}else if(arg==='qshard')qGlass(t,VR(2900,.06),.45,.18);else{whoosh(t,.3,2400,900,.05,.3);qGlass(t,VR(2600,.04),.3,.4)}}catch(e){}return}
  if(QON&&k==='rock'&&(arg==='qpillar'||arg==='qmirror')){if(AU.ctx&&AU.on.sfx){try{M.ice(AU.ctx.currentTime+.005,.8)}catch(e){}}return}
  return _s.apply(this,arguments)}}
// the crown's clock before each spell: a «tin» of glass for each pair of stalactites, a brighter double «TIN» for the middle one (when
// the blow leaves), on the moments of the model's crown (in the boss's time, faster in the second phase); the Waltz's three glass notes
// on each one-two-three of its arcs
if(QON){const _g=b3go;b3go=function(e,st){_g.apply(this,arguments);try{if(e.type!=='icequeen'||e.intro>0||!AU.ctx||!AU.on.sfx||AU.ctx.state!=='running')return;const C=QN.CLK[st];if(!C)return;
  const k=B3D(e,st)/qsp(e),t=AU.ctx.currentTime+.01,v=Math.max(.55,enemyAt(e));
  C.forEach((p,i)=>{if(i<3)qGlass(t+p*k,1760,.5*v,.22);else{qGlass(t+p*k,2093,.85*v,.4);qGlass(t+p*k+.008,2637,.7*v,.35)}});
  if(st==='waltz')for(const a of[.12,.313,.507])[1047,1319,1568].forEach((f,i)=>qGlass(t+(a+i*.193/3)*k,f,.55*v,.45));AU.pan=0}catch(err){}}}
// ---- the voice and the personality, like the new bosses (88-boss3-voci.js): a soprano far away inside a glass harmonica. A long «aaah»
// that rises and holds when she arrives, with the glass ringing; a light «oh-oh-oh» going down when she hits you and mocks you with her
// little mirror (the model's 'taunt'); «mm?» and two taps of the scepter when you keep away; a «hm» before each spell; «oh!» when you hit
// her hard; a high note that breaks like glass when she falls; a giggle and three notes if you fall
if(QON){B3S.add('icequeen');
  const ha=(n,t0,step,d,fa,fb,v,o)=>[...Array(n)].map((_,i)=>{const f=fa+(fb-fa)*i/Math.max(1,n-1);return{t:t0+i*step,d,f:[f*1.03,f*.97],v,a:1-i*.08,h:.12,att:.15,rel:.4,...(o||{})}});
  B3VO.VB.icequeen={base:{tn:.5,br:.12,ji:.012,lp:.85},k:{
    cry:[[1.6,[{t:0,d:1.56,f:[660,880,990,990],v:['a','a','o'],vib:[.02,5.5],att:.18,rel:.3,h:.03}],.38]],
    angry:[[1.8,[{t:0,d:.26,noise:1,v:'i',a:.9,hs:.9},{t:.24,d:1.52,f:[784,770,740],v:['a','o'],vib:[.025,5.5],att:.12,rel:.35}],.4]],
    laugh:[[1,[...ha(3,0,.25,.19,880,698,'o'),{t:.78,d:.2,noise:1,v:'h',a:.35}],.4],[.95,[...ha(3,0,.23,.18,830,660,['o','a']),{t:.72,d:.2,noise:1,v:'h',a:.3}],.4]],
    laugh2:[[.7,[{t:0,d:.5,f:[660,700,880],v:['m','u'],att:.2,rel:.3,tn:.45}],.38]],
    hurt:[[.3,[{t:0,d:.28,f:[990,740],v:['o','u'],att:.06,h:.06}],.4],[.28,[{t:0,d:.26,f:[940,800],v:'a',att:.05,h:.08}],.4]],
    c_lances:[[.32,[{t:0,d:.3,f:[600,660],v:'m',tn:.35,att:.2}],.32]],
    c_crown:[[.5,[{t:0,d:.46,f:[740,880],v:'a',att:.25,rel:.4}],.32]],
    c_nova:[[.95,[{t:0,d:.92,f:[440,620,880],v:['m','m','u'],att:.3,rel:.15}],.36]],
    c_mirror:[[.6,[{t:0,d:.56,noise:1,v:'i',hs:.9,a:.7}],.3]],
    c_gaze:[[1.6,[{t:0,d:1.58,f:[1046,1050],v:'u',tn:1,att:.25,rel:.3,vib:[.006,4]}],.26]],
    c_waltz:[[.4,[{t:0,d:.36,f:[880,990],v:'a',att:.15,rel:.4}],.32]],
    die:[[2.4,[{t:0,d:1.1,f:[1175,1180,1100],v:['a','o'],tn:.6,vib:[.03,6],rel:.15},{t:1.12,d:1.24,f:[880,660,523],v:['o','u'],tn:.5,a:.6,rel:.5}],.38]],
    win:[[1.2,[...ha(3,0,.17,.13,990,880,'a'),{t:.56,d:.56,f:[880,830],v:'o',rel:.5}],.38]]}};
  B3CUE.icequeen={lances:'c_lances',crown:'c_crown',nova:'c_nova',mirror:'c_mirror',gaze:'c_gaze',waltz:'c_waltz'};
  // around her voice: the glass of the harmonica, the ice creaking, the choir under her anger, the scepter tapping
  {const _m=b3sayMore;b3sayMore=function(e,k,t){if(e.type!=='icequeen')return _m.apply(this,arguments);
    if(k==='cry'){for(let i=0;i<6;i++)qGlass(t+.2+i*.18,[1319,1568,1760,1976,2093,2349][i],.5,.9);fNoise(t+.05,1.2,'bandpass',VR(700,.1),3,.05,{f2:300,att:.3,rev:.5})}
    else if(k==='angry'){M.ice(t,1);fNoise(t,.3,'highpass',3000,.7,.12);for(const[f0,f1] of[[392,370],[330,311]]){const c=AU.ctx,o=osc('sawtooth',f0,t+.24,t+1.8),bp=filt('bandpass',f0*1.8,4),g=c.createGain();
        o.frequency.linearRampToValueAtTime(f1,t+1.6);g.gain.setValueAtTime(.0001,t+.24);g.gain.linearRampToValueAtTime(.035,t+.6);g.gain.exponentialRampToValueAtTime(.0005,t+1.75);o.connect(bp);bp.connect(g);route(g,null,.7)}}
    else if(k==='laugh'||k==='win')[2093,2637,3136].forEach((f,i)=>qGlass(t+.1+i*.12,f,.4,.5));
    else if(k==='laugh2')for(let i=0;i<2;i++){fThump(t+.52+i*.14,VR(180,.05),90,.06,.15);qGlass(t+.52+i*.14,2600,.4,.2)}
    else if(k==='die'){for(let i=0;i<8;i++)qGlass(t+1.05+i*.02,VR(2200+i*240,.1),.7,.4);[1760,1568,1319,1175,1047,880].forEach((f,i)=>qGlass(t+1.2+i*.16,f,.5,.8))}
    else if(k==='c_crown'){fModal(t,VR(147,.02),[1,2.76,5.4],[1.8,1.1,.6],.08,.7)}
    else if(k==='c_mirror')[1319,1568,1760,2093].forEach((f,i)=>qGlass(t+i*.08,f,.5,.6))}}
  // the voices get ready in the rooms of her arena (and at once in her room)
  {const _br=buildRoom;buildRoom=function(){const r=_br.apply(this,arguments);try{const A=G&&G.mode!=='inf'&&!G.daily&&ARENAS[G.arena||0];
    if(A&&!A.bt&&BOSSZ[A.boss]==='icequeen'||G&&(G.enemies||[]).some(q=>q.type==='icequeen'))B3VO.prep('icequeen')}catch(err){}return r}}
  // you keep out of her way and never hit her for 5 s: she calls you out («mm?», the scepter tapping), with her mocking gesture
  {const _u=update;update=function(dt){_u.apply(this,arguments);try{if(!G||G.state!=='play'||!started||paused)return;const e=qQueen();if(!e||e.intro>0)return;const S=e.b3s||(e.b3s={}),now=G.t||0;
    if(S.lastHit!=null&&b3free(e)&&now-S.lastHit>5&&now-(S.tauntT==null?-99:S.tauntT)>11&&now-(S.callT==null?-99:S.callT)>11){S.callT=now;b3taunt(e,'laugh2')}}catch(err){}}}
  // the defeat with its voice (the cry of the entrance and the anger of the rage are in bossIntro and qRage)
  {const _s=BDIE.icequeen.setup;BDIE.icequeen.setup=function(c){_s.apply(this,arguments);b3say(c,'die')}}}
// ---- for the previews (anteprime/mk_boss2.py) and the tests (tests/boss2gioco.js): how to get into her room, her moves in each phase,
// the dangers she puts in the room (counted by the tests) and the clips of her voice
if(QON){const R=window.BCL||(window.BCL={});R.icequeen={n:'Regina dei Ghiacci',arena:7,p2:true,
  enter(){G.arena=7;G.chapter=ARENAS[7].ch;G.diff=ARENAS[7].diff;G.bossLvl=null;G.room=ROOMS;G.event=null;buildRoom()},
  moves:['lances','crown','nova','mirror','emerge','cast','stunned'],moves2:['rage','gaze','waltz'],
  hz(){const Q=G.qn||{},ep=k=>G.eproj.filter(p=>p.kind===k).length;return{avvisi:(Q.warn||[]).length,lance:ep('qlance'),stalattiti:(Q.falls||[]).length,pilastri:G.rocks.filter(k=>k.qk==='pillar').length,
    bracci:(Q.runs||[]).length,punte:(Q.spikes||[]).length,specchi:G.rocks.filter(k=>k.qk==='mirror').length,riflessi:G.enemies.filter(e=>e.type==='qmirror'&&!e.dead).length,
    cono:Q.gaze?1:0,scia:(Q.trail||[]).length,fiocchi:ep('qflake'),schegge:ep('qshard'),gelo:Q.ice?1:0}},
  voice:['cry','laugh','angry','die']}}
