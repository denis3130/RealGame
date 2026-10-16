// =====================================================================
// LA STREGA DELLE RADICI RIFATTA: «la Signora delle Radici» (Denis, 15 ottobre: «rivisita tutti i boss … possenti, belli, fighi, che
// diano timore nello sfidarli», «migliora anche le loro abilità speciali»; 16 ottobre, visto il Golem: «sì, fai gli altri 12»). ANTEPRIMA:
// questo file e il modello sprite/nemici3d/witch2.js entrano solo nella copia del gioco fatta da anteprime/mk_boss2.py; nel gioco vero dopo
// il sì di Denis (il modello prende il posto di 'witch' e questo file va in src/ordine.txt). Design e numeri: docs/boss-classici.md.
// Una strega altissima che non cammina ma scivola sulle sue radici, nel suo santuario (54-strega-santuario.js, che resta). Sul petto il
// Seme del Bosco: prima di ogni incantesimo la sua luce corre nelle vene fino alla parte che colpirà, e le dita scrocchiano (il suo
// avviso, come il cuore del Golem). Ogni stato ha il nome di una mossa del modello; il colpo vero parte nel suo fotogramma (b3at,
// 81-boss3-base.js). Mosse:
// - Mano del Bosco (hand): le dita si tuffano nel pavimento, una gobba corre sotto di te e si ferma, un'ellisse rossa si riempie e una
//   mano gigante di rami si chiude; se l'hai scansata resta un nodo di rami che ferma spine e frecce (al massimo due). Fase 2: due mani.
// - Spirale di Spine (spiral): un anello rosso tratteggiato e le frecce del verso, poi due bracci di spine che girano (tre nella fase 2,
//   che a metà cambia verso). Le spine si fermano contro gli ostacoli e i nodi.
// - Sprofonda e Riaffiora (sink, fin, rise) con il Cappello storto (fix): un'ellisse rossa segna dove tornerà, sotto terra non si colpisce,
//   fuori resta solo la punta del cappello; riaffiora in una colonna di radici e spara un anello di semi; poi si raddrizza il cappello e i
//   colpi fanno +50%. Fase 2: dove è sprofondata resta un guscio che si accende e spara otto spine.
// - Radici della Cripta (roots): strisce rosse da un muro all'altro (3, 4 nella fase 2), poi la radice spinosa esce lungo ognuna.
// - Il Giardino della Strega (sow): due semi volano dove c'è un cerchio di gesso e ne nascono funghi velenosi (fuochi fatui nella fase 2).
// - Rito delle Rune (rite, solo fase 2): al centro dell'altare, otto ondate del suo segno a tre bracci verso di te.
// - L'autunno della Strega (rage, a metà vita): foglie color brace, corna sul cappello, quattro radici guardiane che le girano intorno.
// Entrata (enter): un bocciolo che si apre. Sconfitta (die): diventa un albero spoglio, il cappello a terra, un germoglio. Mai due attacchi
// insieme, ogni danno con un avviso a terra di almeno 0,6 s veri anche nella fase 2, un po' di cammino tra una mossa e l'altra.
// =====================================================================
const W2ON=typeof N3!=='undefined'&&!!N3.witch2;
const W2={seq1:['hand','spiral','sink','roots','sow'],seq2:['rite','hand','spiral','sink','roots','sow'],red:'229,72,77',chalk:'255,235,210',
  mint:'123,240,192',violet:'190,120,255',amber:'255,138,60',FY:8,
  // the moment of each move's voice (the light has reached the part that strikes): B3CUE.witch says which clip
  cue:{hand:.24,spiral:.10,sink:.20,rise:.55,fix:.30,roots:.20,sow:.35,rite:.05}};
if(W2ON){
  // the new model in place of the old one (its drawing of today stays as N3.meta.witch.old for the pages)
  const old=N3.witch,oldM=N3.meta.witch;N3.witch=N3.witch2;N3.meta.witch=Object.assign({},N3.meta.witch2,{old:(x,y,f,a,p)=>old(x,y,f,oldM.an.includes(a)?a:'idle',p,oldM.sc||1,{})});
  // her health measured with tests/boss2diff.js (still hero, worst case): she is bigger, slower, never hidden and has no swarm of wisps
  // soaking up the arrows, so with the 2,300 of today the fight lasted 95 s against the 137 s of today's Witch
  ET.witch.r=26;ET.witch.hp=2900;BOSS_INTRO.witch=3.2;Object.assign(BDEATH,{witch:{dur:4,clou:1.8,snd:'bloom'}});
  ECOL.witch='#2a6a44';BBFX.witch={c:'#d0602a',f:'#ffd27a',k:'fall',s:'bloom'};
  // the bar, the halo and the aura; the 2D halo of roots, the lanterns turning round her and the roots at her feet go: the model draws them
  B2H.witch=100;B2T.witch=[[W2.mint,W2.amber],W2.violet];B2.witch.back=()=>{};B2.witch.front=()=>{};
  B2G.witch=e=>{ctx.fillStyle='rgba(40,16,60,.3)';ell(e.x,e.y+W2.FY,50,20);ctx.fill()};
  for(const s of['fix','fin','sink'])B2CALM.add(s);
  // the knot of branches left by the Hand is an obstacle: its height, the colours of its splinters
  KH.wfist=2.75;DPAL.wfist=['#9a6040','#52301f','#5fae6c'];
  Object.assign(TRC,{wthorn:'184,116,230',wseed:W2.mint,wthorn2:'255,150,60',wseed2:'255,150,60'});
  // what the game passes to the model: the way she moves (walk), the guardian roots, how many hands, the turn of the spiral, the hat kept
  // straight before the Rite, how much of the hat is out (the fin)
  N3G.opt.witch=e=>({mv:e.mv3w||0,orb:e.orb3||0,guard:e.p2?(e.guard3||0):0,hands:e.hands3||1,spin:e.spin3||1,neat:!!e.neat3,k:e.k3==null?1:e.k3});
  {const b=BEST.find(q=>q[0]==='witch');if(b)b[2]='Boss. Mani di rami dal pavimento, spirali di spine e radici che spaccano le lastre; sprofonda e riaffiora: segui la punta del cappello.'}}
// ---- helpers
// the model's own drawings of the pieces of her magic (design: Thorn(x,y,a,sc,o), Seed(x,y,z,sc,o), Hand(x,y,k,sc,o), Bump(x,y,a,k,sc,o),
// Root(x0,y0,x1,y1,k,sc,o), Husk(x,y,face,k,sc,o), Sprout(x,y,k,sc,o), Leaf(x,y,z,rot,sc,o)); the game's simple drawings if the model has none
const w2art=n=>N3['witch'+n]||N3['witch2'+n]||null;
// her time runs bossLvl().spd times the room's (the game passes it to her brain) and 1.1 times more in the second phase: a length of the
// model in real seconds
const w2rate=e=>(((G&&G.bossLvl)||bossLvl()).spd||1)*(e&&e.p2?1.1:1);
const w2ss=u=>{u=clamp(u,0,1);return u*u*(3-2*u)};
const w2cross=(p0,p1,g)=>p1>=p0?p0<g&&g<=p1:g>p0||g<=p1;
function w2boss(){if(!G||!G.enemies)return null;for(const e of G.enemies)if(e.type==='witch'&&!e.dead)return e;return null}
const w2kids=()=>G.enemies.filter(q=>q.w2kid&&!q.dead).length;
// the middle of her altar (or of the room without the sanctuary): her point there, with her feet on it
function w2center(){const c=G.runeAt||{x:AW/2,y:(TOP+BOT)/2};return{x:c.x,y:c.y-W2.FY,cx:c.x,cy:c.y}}
// how much of her is above the floor (sinking, the fin, rising, the entrance)
function w2vis(e){if(e.intro>0)return Math.min(1,(e.iT||0)/.8);const k=b3k(e);switch(e.st){case 'sink':return 1-w2ss((k-.25)/.5);case 'fin':return 0;case 'rise':return w2ss((k-.04)/.4);default:return 1}}
// how far from (x,y) along a before a wall or an obstacle (the knots too)
function w2reach(x,y,a,max){const ca=Math.cos(a),sa=Math.sin(a);let s=0;for(;s<(max||900);s+=6){const px=x+ca*s,py=y+sa*s;if(px<L+4||px>R-4||py<TOP+4||py>BOT-4)break;
    if(s>30&&G.rocks.some(k=>Math.hypot(k.x-px,k.y-py)<k.r))break}return s}
// a sound of hers (panned where it happens); the crick of a finger, the creak of her wood
function w2snd(x,f){if(typeof AU==='undefined'||!AU.ctx||!AU.on.sfx||AU.ctx.state!=='running')return;try{AU.pan=x==null?0:Math.max(-.7,Math.min(.7,(x-(G.vx||0)-VW/2)/200));f(AU.ctx.currentTime+.01)}catch(err){}AU.pan=0}
const w2crick=(x,v,dl)=>w2snd(x,t=>{t+=dl||0;fModal(t,VR(2600,.12),[1,2.3,3.9],[.025,.018,.012],.1*(v||1),.04);fNoise(t,.014,'bandpass',VR(4300,.12),4,.24*(v||1))});
const w2creak=(x,v,f)=>w2snd(x,t=>M.wood(t,v||.4,f||VR(230,.15)));
function w2reset(){if(G)G.w2={warn:[],bumps:[],hands:[],strips:[],rays:[],seeds:[],leaves:[],husk:null,arr:null,tree:null,leafT:0}}
// the dangers go (the second phase, the defeat); the tree left by the defeat and the falling leaves stay
function w2clearHz(){const B=G&&G.w2;if(!B)return;B.warn=[];B.bumps=[];B.hands=[];B.strips=[];B.rays=[];B.seeds=[];B.husk=null;B.arr=null}
{const _br=buildRoom;buildRoom=function(){w2reset();return _br.apply(this,arguments)}}
// where she walks: a spot 150–230 px from you, low enough that the hat stays under the wall, away from the obstacles, reachable in a line
function w2target(e){const y0=TOP+110,y1=TOP+.55*(BOT-TOP);let best=null,bs=-1e9;
  for(let i=0;i<24;i++){const an=rand(0,TAU),d=rand(150,230),x=clamp(P.x+Math.cos(an)*d,L+44,R-44),y=clamp(P.y+Math.sin(an)*d,y0,y1);
    if(G.rocks.some(k=>Math.hypot(k.x-x,k.y-y)<k.r+e.r+16))continue;const dh=Math.hypot(x-P.x,y-P.y),dm=Math.hypot(x-e.x,y-e.y);
    if(dm<40||!clearLine(e.x,e.y,x,y,e.r*.8))continue;const s=-Math.abs(dh-190)*.6-Math.max(0,dm-160)*.5+rand(0,25);if(s>bs){bs=s;best={x,y}}}
  return best||{x:clamp(e.x+rand(-60,60),L+44,R-44),y:clamp(e.y+rand(-40,40),y0,y1)}}
// where she comes back up: 130–170 px from you (never under 90), inside the room, away from the obstacles and the knots
function w2arrival(e){let best=null,bs=-1e9;
  for(let i=0;i<30;i++){const an=rand(0,TAU),d=rand(130,170),x=P.x+Math.cos(an)*d,y=P.y+Math.sin(an)*d;
    if(x<L+40||x>R-40||y<TOP+110||y>BOT-50||G.rocks.some(k=>Math.hypot(k.x-x,k.y-y)<k.r+40))continue;
    const s=-Math.abs(Math.hypot(x-e.x,y-e.y)-180)*.2+rand(0,20);if(s>bs){bs=s;best={x,y}}}
  if(!best)for(let i=0;i<40;i++){const x=rand(L+40,R-40),y=rand(TOP+110,BOT-50);if(Math.hypot(x-P.x,y-P.y)<90||G.rocks.some(k=>Math.hypot(k.x-x,k.y-y)<k.r+30))continue;best={x,y};break}
  return best||{x:clamp(e.x,L+40,R-40),y:clamp(e.y,TOP+110,BOT-50)}}
// ---- the brain
function w2walk(e,d){e.wt=0;e.w2tg=null;e.w2mv=0;b3go(e,'walk',d!=null?d:e.p2?rand(.8,1.1):rand(1,1.4))}
function w2end(e){e.moving=false;e.w2mv=0;if(e.w2rq&&!e.p2){w2rage(e);return}w2walk(e)}
// the next move of her round (the Garden waits while two of her creatures are alive)
function w2next(e,a){const seq=e.p2?W2.seq2:W2.seq1;let n=seq[(e.si=(e.si+1)%seq.length)];if(n==='sow'&&w2kids()>=2)n=seq[(e.si=(e.si+1)%seq.length)];e.lf=a;e.moving=false;e.w2mv=0;
  if(n==='hand'){b3go(e,'hand');e.hands3=e.p2?2:(e.w2hd=-(e.w2hd||-1));e.w2hs=null}
  else if(n==='spiral'){b3go(e,'spiral');e.spin3=(e.w2sd=-(e.w2sd||-1));e.w2rev=0;e.w2sa=null;e.w2nx=.27*B3D(e,'spiral')}
  else if(n==='sink')w2sink(e,false);else if(n==='rite')w2sink(e,true);else b3go(e,n)}
// she sinks (to come back up near you, or in the middle of the altar before the Rite): the red circle where she will rise shows at once
function w2sink(e,center){const B=G.w2;b3go(e,'sink');e.w2c=!!center;e.neat3=false;e.moving=false;const A=center?w2center():w2arrival(e);e.w2A={x:A.x,y:A.y};
  e.w2fd=clamp(Math.hypot(A.x-e.x,A.y-e.y)/380,.35,.9);B.arr={x:A.x,y:A.y,t:0,max:(B3D(e,'sink')+e.w2fd+.12*B3D(e,'rise'))/w2rate(e),p2:e.p2}}
// the second phase: no damage, no attacks; the autumn comes down from the hat, the guardian roots come out (the model's 'rage')
function w2rage(e){e.p2=true;e.w2rq=0;e.shell=99;e.guard3=0;banner("L'autunno della Strega!",'Fase 2',1.6);bossRage(e,W2.amber);$('bossBar').classList.add('rage');shake(8);sfx('boom',0,e.x);
  G.eproj=[];w2clearHz();b3go(e,'rage');e.moving=false;e.w2mv=0;b3say(e,'angry');b3torch('fire',3)}
// the four guardian roots of the second phase: they turn round her 58 px out (1.7 rad/s of her time), away while she is under the floor and
// before they come out in the autumn; their tips hurt (at most once every 0.6 s)
function w2guard(e,dt){if(!e.p2){e.guard3=0;return}e.orb3=(e.orb3||0)+1.7*dt;const st=e.st,on=!(st==='sink'||st==='fin'||st==='rise'||st==='rage'&&b3k(e)<.62);
  e.guard3=on?Math.min(1,(e.guard3||0)+dt/.3):Math.max(0,(e.guard3||0)-dt/.2);
  if(e.guard3>.9&&P.inv<=0&&P.dashT<=0&&(G.t||0)-(e.w2gT==null?-9:e.w2gT)>=.6)for(let j=0;j<4;j++){const an=e.orb3+j*Math.PI/2;
    if(Math.hypot(P.x-(e.x+Math.cos(an)*58),P.y-(e.y+Math.sin(an)*58*.55))<10+.6*P.r){e.w2gT=G.t;hurtP(Math.round(14*DMG()));break}}}
if(W2ON)witchUpd=function(e,dt,a){const sp=e.p2?1.1:1;dt*=sp;// the second phase runs 1.1 times faster (n3Move draws the model at the same pace)
  if(!G.w2)w2reset();const B=G.w2;if(!e.p2&&e.hp<e.max*.5)e.w2rq=1;
  b3tick(e,dt);const p2=e.p2,k=b3k(e);
  {const c=W2.cue[e.st];if(c!=null&&b3at(e,c))b3say(e,B3CUE.witch[e.st],e.st==='fix')}
  w2guard(e,dt);
  switch(e.st){
  // ---- she glides on her roots toward a spot near you, always looking at you; the roots in front grab the floor at .25 and .75
  case 'walk':{if(e.w2rq&&!p2){w2rage(e);break}e.face=a;
    if(!e.w2tg||Math.hypot(e.w2tg.x-e.x,e.w2tg.y-e.y)<6||(e.w2stk||0)>.5){e.w2tg=w2target(e);e.w2stk=0}
    const tx=e.w2tg.x-e.x,ty=e.w2tg.y-e.y,td=Math.hypot(tx,ty);let mv=0;
    if(td>3){const st=Math.min(td,45*dt),ox=e.x,oy=e.y;moveCircle(e,tx/td*st,ty/td*st);mv=Math.hypot(e.x-ox,e.y-oy);e.w2stk=mv<st*.3?(e.w2stk||0)+dt:0;
      e.mv3w=angDiff(e.f3!=null?e.f3:e.face,Math.atan2(ty,tx))}
    e.w2mv=mv>.02?1:0;e.moving=!!e.w2mv;
    if(e.w2mv){const d=B3D(e,'walk'),w0=e.wt||0;e.wt=w0+dt;const p0=(w0%d)/d,p1=(e.wt%d)/d;
      for(const[g,s] of[[.25,-1],[.75,1]])if(w2cross(p0,p1,g)){const q=b3pt(e,34,12*s);stepFx(q.x,q.y,false);w2creak(q.x,.16,VR(260,.15))}}
    if(e.stT<=0)w2next(e,a);break}
  // ---- MANO DEL BOSCO: the light in the arm (.12, the fingers crick), the fingers dive into the floor (.24), the bump runs under you (.32)
  // and stops (.50; the second one at .60), the hand closes (.80; the second at .90)
  case 'hand':{e.moving=false;const D=B3D(e,'hand'),two=e.hands3===2;if(k<.24){e.face=a;e.lf=a}else e.face=e.lf;
    if(b3at(e,.12))for(let i=0;i<(two?8:4);i++)w2crick(e.x,.8,i*.018);
    if(b3at(e,.24)){e.w2hs=(two?[1,-1]:[e.hands3||1]).map(s=>{const q=b3pt(e,30,9*s);if(BOSS2){const S=stonePal();ENV2.chunks(q.x,q.y,B3N(6),[S.hi,S.mid,S.lo],70);ENV2.rocks(q.x,q.y-W2.FY,120,1)}
        stamp('cracks',q.x,q.y,10);return{s,x:q.x,y:q.y-W2.FY}});shake(2);w2snd(e.x,t=>{fNoise(t,.2,'lowpass',VR(500,.1),.8,.2,{brown:true});M.wood(t+.02,.5,VR(180,.1))})}
    if(b3at(e,.32)&&e.w2hs)e.w2hs.forEach((h,i)=>B.bumps.push({x:h.x,y:h.y,a:Math.atan2(P.y-h.y,P.x-h.x),i,side:h.s,lock:i?.60:.50,v0:Math.max(300,Math.hypot(P.x-h.x,P.y-h.y)/.39),cyc:0,run:0,p2}));
    // the bumps (in her time): the first one sticks under you until it stops, the second comes round your side
    for(let i=B.bumps.length-1;i>=0;i--){const b=B.bumps[i];let tx=P.x,ty=P.y,v=b.v0;
      if(b.i){const u=clamp((k-.32)/(b.lock-.32),0,1),ax=P.x-b.x,ay=P.y-b.y,al=Math.hypot(ax,ay)||1,off=70*(1-u)*b.side;tx=P.x-ay/al*off;ty=P.y+ax/al*off;
        v=Math.min(700,Math.max(250,Math.hypot(tx-b.x,ty-b.y)/Math.max(.05,b.lock*D-e.mt)))}
      const dx=tx-b.x,dy=ty-b.y,dd=Math.hypot(dx,dy);if(dd>.5){const st=Math.min(dd,v*dt);b.x+=dx/dd*st;b.y+=dy/dd*st;b.a=Math.atan2(dy,dx);b.run+=st;
        if(b.run>=30){b.run-=30;stamp('cracks',b.x,b.y+W2.FY,7);if(BOSS2&&!LOWFX){const S=stonePal();ENV2.chunks(b.x,b.y+W2.FY,2,[S.hi,S.mid],40)}w2snd(b.x,t=>fNoise(t,.1,'lowpass',VR(420,.15),.7,.09,{brown:true}))}}
      b.cyc+=dt*3;
      if(k>=b.lock){B.bumps.splice(i,1);const tc=(b.i?.90:.80)*D;B.hands.push({i:b.i,x:b.x,y:b.y,side:b.side,p2,st:'warn',t0:e.mt,tc,wk:0,kk:-1,seed:Math.random()*10});
        w2snd(b.x,t=>{fThump(t,90,50,.12,.22);fNoise(t,.08,'bandpass',1200,1,.08)})}}
    for(const h of B.hands)if(h.st==='warn'||h.st==='rise'){h.wk=clamp((e.mt-h.t0)/Math.max(.01,h.tc-h.t0),0,1);if(e.mt>=h.tc-.35){h.st='rise';h.kk=.30*clamp((e.mt-(h.tc-.35))/.35,0,1)}}
    if(b3at(e,.80))w2close(e,0);if(two&&b3at(e,.90))w2close(e,1);
    if(e.stT<=0){for(const h of B.hands)if(h.st==='warn'||h.st==='rise'){h.st='crumble';h.ct=0}B.bumps=[];w2end(e)}break}
  // ---- SPIRALE DI SPINE: the light up both arms, the eight fingertips crick one by one (.11–.25), the halo of thorns turns; a thorn for
  // each arm every 0.11 s from .27 to .85; in the second phase a flash (.46) and the snap (.55): the other way round
  case 'spiral':{e.moving=false;e.face=a;const D=B3D(e,'spiral');
    for(let i=0;i<8;i++)if(b3at(e,.11+i*.02))w2crick(e.x,.75);
    if(p2&&b3at(e,.46)){fxPush({k:'flash',x:e.x,y:e.y-90,r:46,rgb:W2.amber,t:.25,max:.25});w2snd(e.x,t=>M.bone(t,.6,VR(2200,.1)))}
    if(p2&&b3at(e,.55)){e.w2rev=1;shake(2);w2snd(e.x,t=>{M.bone(t,.9,VR(1800,.1));fNoise(t,.03,'highpass',3500,.7,.18)})}
    // the first thorn of the first arm goes where you are when the spiral starts
    if(e.w2sa==null&&e.w2nx!=null&&e.mt>=e.w2nx)e.w2sa=Math.atan2(P.y-6-(e.y-16),P.x-e.x);
    while(e.w2nx!=null&&e.mt>=e.w2nx&&e.w2nx<=.85*D+1e-6){const n=p2?3:2,dir=(e.spin3||1)*(e.w2rev?-1:1);for(let i=0;i<n;i++)shootE(e.x,e.y-16,e.w2sa+i*TAU/n,120,6,11,p2?'wthorn2':'wthorn');e.w2sa+=.23*dir;e.w2nx+=.11}
    if(e.stT<=0){e.w2nx=null;w2end(e)}break}
  // ---- SPROFONDA: she hugs herself, the train wraps her (.00–.25), the earth pulls her down (.25–.75; from .50 she cannot be hit), only the
  // tip of the hat stays out; in the second phase the husk stays where she was (.75)
  case 'sink':{e.moving=false;e.face=a;
    if(b3at(e,.25)){ENV2.mark('roots',e.x,e.y+W2.FY,34);ENV2.wiltGrass(e.x,e.y+W2.FY,50);w2snd(e.x,t=>{fNoise(t,.55,'lowpass',VR(300,.1),.7,.16,{brown:true,att:.12});M.wood(t+.1,.3,VR(160,.1))})}
    if(b3at(e,.50)){e.shell=99;e.air=1}
    if(p2&&!e.w2c&&b3at(e,.75))B.husk={x:e.x,y:e.y,face:e.f3!=null?e.f3:e.face,k:0,glow:0,st:'whole',bt:0,seed:Math.random()*10};
    if(e.stT<=0){b3go(e,'fin',e.w2fd);e.k3=1;e.w2v=Math.hypot(e.w2A.x-e.x,e.w2A.y-e.y)/Math.max(.05,e.w2fd);e.w2run=0}break}
  // ---- the fin: the tip of the hat cuts the floor in a straight line to where she comes back up; under an obstacle only the earth moves
  case 'fin':{e.moving=false;const A=e.w2A,dx=A.x-e.x,dy=A.y-e.y,d=Math.hypot(dx,dy);
    if(d>.5){const st=Math.min(d,e.w2v*dt);e.x+=dx/d*st;e.y+=dy/d*st;e.face=Math.atan2(dy,dx);e.w2run+=st;
      if(e.w2run>=24){e.w2run-=24;stamp('cracks',e.x,e.y+W2.FY,7);ENV2.wiltGrass(e.x,e.y+W2.FY,22);
        if(!LOWFX)for(let i=0;i<2;i++)G.debris.push({x:e.x+rand(-6,6),y:e.y+W2.FY,z:rand(3,8),vx:rand(-24,24),vy:rand(-8,8),vz:rand(40,80),col:e.p2?pk(['#ffb04a','#d0602a']):pk(['#5fae6c','#2a6a44']),s:2,rot:rand(0,TAU),vr:rand(-8,8),life:1.6,leaf:true});
        w2snd(e.x,t=>fNoise(t,.12,'lowpass',VR(360,.15),.7,.1,{brown:true}))}}
    {const under=G.rocks.some(r=>Math.hypot(r.x-e.x,r.y-e.y)<r.r+16);e.k3=(e.k3==null?1:e.k3)+((under?0:1)-(e.k3==null?1:e.k3))*Math.min(1,dt*14)}
    if(B.husk)B.husk.glow=clamp(e.mt/(e.w2fd+.58*B3D(e,'rise')),0,1);
    if(e.stT<=0){e.x=A.x;e.y=A.y;e.k3=1;e.face=a;b3go(e,'rise');e.neat3=!!e.w2c}break}
  // ---- RIAFFIORA: the column of roots (.12, the blow), she rises (.12–.30, hittable again from .30), opens like a bud and spreads her
  // arms: the ring of seeds (.58); in the second phase the husk breaks at the same moment and shoots its thorns
  case 'rise':{e.moving=false;e.face=a;if(B.husk&&B.husk.st==='whole')B.husk.glow=clamp((e.w2fd+e.mt)/(e.w2fd+.58*B3D(e,'rise')),0,1);
    if(b3at(e,.12))w2column(e);
    if(b3at(e,.30)){e.shell=0;e.air=0;ENV2.mark('bloom',e.x,e.y+W2.FY,26);
      for(let i=0;i<(LOWFX?4:10);i++)G.debris.push({x:e.x+rand(-20,20),y:e.y+W2.FY,z:rand(30,60),vx:rand(-30,30),vy:0,vz:rand(10,40),col:pk(e.p2?['#ffb04a','#d0602a','#7a2a18']:['#c48ae8','#5fae6c']),s:2,rot:rand(0,TAU),vr:3,life:2,leaf:true})}
    if(!e.w2c&&b3at(e,.58)){const n=p2?16:12,o=rand(0,TAU);for(let i=0;i<n;i++)shootE(e.x,e.y-6,o+i*TAU/n,140,6,12,p2?'wseed2':'wseed');
      w2snd(e.x,t=>{fNoise(t,.25,'bandpass',VR(1800,.1),1,.12,{f2:3600});vBell(null,t,[74,77][randi(0,1)],.8,.02)});
      if(B.husk&&B.husk.st==='whole'){const H=B.husk,o2=rand(0,TAU);H.st='break';H.bt=0;H.glow=1;for(let i=0;i<8;i++)shootE(H.x,H.y-30,o2+i*TAU/8,130,6,10,'wthorn2');
        vfxBlast(H.x,H.y-20,'200,170,130',40,{debris:['#8a7a6a','#5a4e42','#c49a64'],n:B3N(12),sparks:6,spcol:['#ffb04a','#ff8a3c'],dust:6,ring2:false});shake(3);w2snd(H.x,t=>{M.wood(t,.8,VR(160,.08));M.wood(t+.06,.6,VR(220,.08))})}}
    if(e.stT<=0){if(e.w2c){b3go(e,'rite');e.w2c=false;w2riteStart(e)}else{b3go(e,'fix');if(!G.w2txt){G.w2txt=1;text(clamp(e.x,(G.vx||0)+125,(G.vx||0)+VW-125),e.y-140,'Cappello storto: colpiscila!','#ffd84a',18)}}}break}
  // ---- CAPPELLO STORTO: she straightens her hat with both hands (.38, .60): the seed on her chest is uncovered, the blows hurt more
  case 'fix':{e.moving=false;e.face=a;if(b3at(e,.38)||b3at(e,.60))w2creak(e.x,.35,VR(300,.1));if(e.stT<=0)w2end(e);break}
  // ---- RADICI DELLA CRIPTA: the light runs down into the train (it creaks, .10), the roots whip down into the floor (.23), the strips (.26)
  case 'roots':{e.moving=false;if(k<.2){e.face=a;e.lf=a}else e.face=e.lf;
    if(b3at(e,.10))w2snd(e.x,t=>{M.wood(t,.45,VR(200,.1));M.wood(t+.12,.35,VR(170,.1))});
    if(b3at(e,.23)){shake(3);const q=b3pt(e,-30,0);stamp('cracks',q.x,q.y,18);w2snd(e.x,t=>{M.wood(t,.8,VR(150,.08));fNoise(t,.06,'bandpass',VR(1600,.1),1.2,.3)})}
    if(b3at(e,.26))w2strips(e);
    if(e.stT<=0)w2end(e);break}
  // ---- IL GIARDINO: the buds swell on the hat (a soft bell, .15), she picks them and sows them (.50)
  case 'sow':{e.moving=false;e.face=a;if(b3at(e,.15))w2snd(e.x,t=>vBell(null,t,[76,79][randi(0,1)],1.2,.025));if(b3at(e,.50))w2sow(e);if(e.stT<=0)w2end(e);break}
  // ---- RITO DELLE RUNE (second phase): in the middle of the altar, turning slowly toward you; eight waves of her sign
  case 'rite':{e.moving=false;{const da=angDiff(e.face,a);e.face+=clamp(da,-1.5*dt,1.5*dt)}const D=B3D(e,'rite');
    if(b3at(e,.05))for(let i=0;i<3;i++)w2crick(e.x,.9,i*.07);
    for(let i=0;i<8;i++)if(b3at(e,(.38+.45*i)/D))w2wave(e,i);
    if(e.stT<=0){w2riteEnd(e);e.si=0;e.neat3=false;w2end(e)}break}
  // ---- L'AUTUNNO: the cry (.20, the room trembles), the storm of leaves (.55), the guardians break the floor (.62, .66, .70, .74)
  case 'rage':{e.moving=false;e.face=a;
    if(b3at(e,.20)){if(BOSS2)ENV2.rocks(e.x,e.y,900,1);shake(6);vib([60,40,120]);for(let i=0;i<3;i++)setTimeout(()=>{if(G&&G.fx)fxPush({k:'ring2',x:e.x,y:e.y-e.r,rgb:'255,190,120',r0:e.r,r1:e.r*5,t:.45,max:.45,w:6-i*1.5})},i*170)}
    if(b3at(e,.55))B.leafT=1.6;
    for(let j=0;j<4;j++)if(b3at(e,.62+.04*j)){const an=(e.orb3||0)+j*Math.PI/2,x=e.x+Math.cos(an)*58,y=e.y+W2.FY+Math.sin(an)*58*.55;
      if(BOSS2){const S=stonePal();ENV2.chunks(x,y,B3N(8),[S.hi,S.mid,S.lo],90)}stamp('cracks',x,y,14);shake(4);w2snd(x,t=>{M.wood(t,.6,VR(190,.1));fNoise(t,.12,'lowpass',VR(600,.1),.8,.14,{brown:true})})}
    if(e.stT<=0){e.shell=0;w2sink(e,true)}break}
  // ---- her mocking gesture (88-boss3-voci.js starts it while she walks): blowing out her candles, «come, come…»
  case 'taunt':{e.moving=false;e.w2mv=0;e.face=a;if(b3at(e,.76)||b3at(e,.88))w2crick(e.x,.5);if(e.stT<=0)w2walk(e,rand(.6,1));break}
  default:w2walk(e)}};
// the blows of the hand: hit inside the ellipse; a hand that missed stays as a knot of branches (if it leaves you room), else it crumbles
function w2close(e,i){const B=G.w2,h=B.hands.find(q=>q.i===i&&(q.st==='warn'||q.st==='rise'));if(!h)return;h.kk=.30;
  const R=38+.4*P.r,dx=(P.x-h.x)/R,dy=(P.y-h.y)/(.6*R),inside=dx*dx+dy*dy<1;if(inside)hurtP(Math.round(22*DMG()));
  shake(5);vib([30,20,40]);w2snd(h.x,t=>{fThump(t,120,50,.22,.32);M.wood(t,.7,VR(150,.1));M.wood(t+.05,.5,VR(220,.1));fNoise(t,.25,'lowpass',VR(700,.1),.8,.16,{brown:true})});
  if(BOSS2){const S=stonePal();ENV2.mark('roots',h.x,h.y+W2.FY,34);ENV2.chunks(h.x,h.y+W2.FY,B3N(10),[S.hi,S.mid,S.lo],110);ENV2.rocks(h.x,h.y,120,1.5)}
  if(inside||!w2knotOk(h.x,h.y)){h.st='crumble';h.ct=0;h.front=inside;return}
  B.hands.splice(B.hands.indexOf(h),1);
  // at most two knots: the oldest crumbles
  const K=G.rocks.filter(q=>q.kind==='wfist');if(K.length>=2){const o=K.sort((a,b)=>a.life-b.life)[0];o.life=Math.min(o.life,.5)}
  G.rocks.push({x:h.x,y:h.y,r:16,seed:h.seed,temp:true,life:6,kind:'wfist',w2:{side:h.side,p2:h.p2,life0:6}});fields={}}
// a knot only where it never closes you in: off you, off the walls and with a wide passage round the other obstacles
function w2knotOk(x,y){if(Math.hypot(P.x-x,P.y-y)<16+P.r+4)return false;if(x<L+50||x>R-50||y<TOP+50||y>BOT-50)return false;
  return!G.rocks.some(k=>k.kind!=='wfist'&&Math.hypot(k.x-x,k.y-y)<k.r+16+30)}
// the column of roots where she comes back up: inside the red circle it hurts
function w2column(e){const B=G.w2;B.arr=null;const R=34+.4*P.r,dx=(P.x-e.x)/R,dy=(P.y-e.y)/(.6*R);if(dx*dx+dy*dy<1)hurtP(Math.round(16*DMG()));
  shake(4);vfxBlast(e.x,e.y+W2.FY,e.p2?'255,170,90':'160,230,190',60,{debris:['#9a6040','#52301f','#5fae6c'],n:B3N(14),sparks:0,dust:10,ring2:false});
  if(BOSS2){const S=stonePal();ENV2.rocks(e.x,e.y,100,1.5);ENV2.chunks(e.x,e.y+W2.FY,B3N(10),[S.hi,S.mid,S.lo],120)}
  w2snd(e.x,t=>{fThump(t,110,46,.25,.3);M.wood(t,.8,VR(140,.08));M.wood(t+.04,.6,VR(200,.08));fNoise(t,.3,'lowpass',VR(800,.1),.8,.16,{brown:true})})}
// the strips of the Roots: like the bands of today (makeBands), one across where you are, one along, the others 50–80 px off; each grows
// from the wall nearest to her; its root comes out under the obstacles only where they are not (o.gaps)
function w2strips(e){const B=G.w2,n=e.p2?4:3,r=w2rate(e),FY=W2.FY;
  for(let i=0;i<n;i++){const h=i%2===0,base=h?P.y:P.x,off=i<2?0:rand(50,80)*(Math.random()<.5?-1:1),pos=h?clamp(base+off,TOP+14,BOT-14):clamp(base+off,L+14,R-14);
    const fw=h?(e.x<(L+R)/2?1:-1):(e.y<(TOP+BOT)/2?1:-1),x0=h?(fw>0?L:R):pos,y0=h?pos+FY:(fw>0?TOP:BOT),x1=h?(fw>0?R:L):pos,y1=h?pos+FY:(fw>0?BOT:TOP),len=Math.hypot(x1-x0,y1-y0);
    const gaps=[];for(const k of[...G.rocks,{x:e.x,y:e.y+FY,r:24}]){const dp=h?Math.abs(k.y-(pos+FY)):Math.abs(k.x-pos);if(dp>k.r+13)continue;const d=h?Math.abs(k.x-x0):Math.abs(k.y-y0);gaps.push([d-k.r-6,d+k.r+6])}
    B.strips.push({h,pos,w:26,x0,y0,x1,y1,len,gaps,warn:(.95+.18*i)/r,warn0:(.95+.18*i)/r,act:.45/r,act0:.45/r,hit:false,p2:e.p2,seed:Math.random()*10,t:0})}
  w2snd(e.x,t=>fNoise(t,.5,'lowpass',VR(260,.1),.8,.12,{brown:true,att:.1}))}
// a wave of the Rite: her sign of three arms from the middle of the altar, the first one at you
function w2wave(e,i){const B=G.w2,C=w2center(),cx=C.cx,cy=C.cy,phi=Math.atan2((P.y+W2.FY-cy)/.62,P.x-cx),r=w2rate(e);
  const arms=[0,1,2].map(j=>{const ph=phi+j*TAU/3,a=Math.atan2(.62*Math.sin(ph),Math.cos(ph));return{a,len:w2reach(C.x,C.y,a,900),rx:cx+92*Math.cos(ph),ry:cy+92*.62*Math.sin(ph)}});
  B.rays.push({i,x:C.x,y:C.y,arms,warn:.9/r,warn0:.9/r,act:.25/r,act0:.25/r,hit:false,seed:Math.random()*10});
  w2snd(e.x,t=>vBell(null,t,[69,72,76,81][i%4],1.4,.03))}
function w2riteStart(e){b3torch('fire',B3D(e,'rite')/w2rate(e));if(BOSS2)ENV2.rocks(e.x,e.y,260,0)}
// the end of the Rite: eight scars of roots round the altar
function w2riteEnd(e){const C=w2center();if(BOSS2)for(let i=0;i<8;i++){const a=i/8*TAU+.2;ENV2.mark('roots',C.cx+Math.cos(a)*112,C.cy+Math.sin(a)*112*.62,26)}}
// the Garden: two seeds thrown in an arc (0.9 s, the top of the arc 50 px up) toward two free spots 70–120 px from her, never near you
function w2sow(e){const B=G.w2;for(let i=0;i<2;i++){const s=i?1:-1,q=b3pt(e,10,14*s);let tg=null;
  for(let t=0;t<30&&!tg;t++){const an=rand(0,TAU),d=rand(70,120),x=e.x+Math.cos(an)*d,y=e.y+Math.sin(an)*d*.8;
    if(x<L+30||x>R-30||y<TOP+40||y>BOT-40||Math.hypot(x-P.x,y-P.y)<60||G.rocks.some(k=>Math.hypot(k.x-x,k.y-y)<k.r+20)||B.seeds.some(o=>Math.hypot(o.tx-x,o.ty-y)<44)||G.enemies.some(o=>!o.dead&&o!==e&&Math.hypot(o.x-x,o.y-y)<30))continue;tg={x,y}}
  if(tg)B.seeds.push({sx:q.x,sy:q.y-W2.FY,tx:tg.x,ty:tg.y,t:0,dur:.9,p2:e.p2,spin:rand(0,TAU)})}
  w2snd(e.x,t=>{fNoise(t,.18,'bandpass',VR(2600,.1),1,.06,{f2:1400});M.plant(t,.4)})}
// a seed lands: a puff of spores, flowers, and one of her creatures (at most two alive)
function w2land(s){vfxBlast(s.tx,s.ty+W2.FY,s.p2?'255,170,90':'190,140,255',30,{sparks:0,spore:LOWFX?4:10,sporeRgb:s.p2?'255,170,90':'190,140,255',dust:4,ring2:false});
  ENV2.mark('bloom',s.tx,s.ty+W2.FY,18);w2snd(s.tx,t=>{M.plant(t,.6);fNoise(t,.3,'bandpass',VR(2200,.1),1,.06,{f2:900})});
  if(!w2boss()||w2kids()>=2)return;const o=makeE(s.p2?'wisp':'mushroom',s.tx,s.ty,.7);o.w2kid=1;G.enemies.push(o)}
// ---- the dangers that keep their own (real) time: warnings, strips, rays, seeds in flight, the husk breaking, the hands crumbling
function w2update(dt){const B=G.w2;if(!B)return;w2leaves(dt);
  if(G.state!=='play'){if(B.warn.length||B.bumps.length||B.hands.length||B.strips.length||B.rays.length||B.seeds.length||B.husk||B.arr)w2clearHz();return}
  if(B.arr)B.arr.t+=dt;
  // a hand (or a bump) whose move is over without closing it only crumbles
  {const e=w2boss();if(!e||e.st!=='hand'){B.bumps=[];for(const h of B.hands)if(h.st==='warn'||h.st==='rise'){h.st='crumble';h.ct=0;if(h.kk<.85)h.kk=.85}}
    if(B.arr&&(!e||!(e.st==='sink'||e.st==='fin'||e.st==='rise')))B.arr=null}
  for(let i=B.warn.length-1;i>=0;i--){B.warn[i].t-=dt;if(B.warn[i].t<=0)B.warn.splice(i,1)}
  for(let i=B.hands.length-1;i>=0;i--){const h=B.hands[i];if(h.st!=='crumble')continue;h.ct+=dt;h.kk=.85+.15*Math.min(1,h.ct/.5);if(h.ct>=.5)B.hands.splice(i,1)}
  // the strips: the warning grows, then the root comes out in a wave from the same side; it hurts once, when its front reaches you
  for(let i=B.strips.length-1;i>=0;i--){const s=B.strips[i];s.t+=dt;if(s.warn>0){s.warn-=dt;if(s.warn<=0)w2stripOut(s);continue}s.act-=dt;const kr=1-s.act/s.act0;
    const hu=s.h?Math.abs(P.x-s.x0):Math.abs(P.y+W2.FY-s.y0),hv=s.h?Math.abs(P.y-s.pos):Math.abs(P.x-s.pos);
    if(!s.hit&&kr<.7&&hu<=Math.min(1,kr/.3)*s.len&&hv<s.w/2+P.r*.6&&!s.gaps.some(g=>hu>g[0]&&hu<g[1])&&P.inv<=0&&P.dashT<=0){s.hit=true;hurtP(Math.round(18*DMG()))}
    if(s.act<=0){w2stripScar(s);B.strips.splice(i,1)}}
  // the rays of the Rite: each burst along its three arms hurts once
  for(let i=B.rays.length-1;i>=0;i--){const r=B.rays[i];if(r.warn>0){r.warn-=dt;if(r.warn<=0)w2rayOut(r);continue}r.act-=dt;
    if(!r.hit&&P.inv<=0&&P.dashT<=0)for(const m of r.arms){const ca=Math.cos(m.a),sa=Math.sin(m.a),ux=P.x-r.x,uy=P.y-r.y,u=ux*ca+uy*sa,v=Math.abs(uy*ca-ux*sa);
      if(u>36&&u<m.len&&v<12+.6*P.r){r.hit=true;hurtP(Math.round(16*DMG()));break}}
    if(r.act<=0)B.rays.splice(i,1)}
  for(let i=B.seeds.length-1;i>=0;i--){const s=B.seeds[i];s.t+=dt;if(s.t>=s.dur){B.seeds.splice(i,1);w2land(s)}}
  if(B.husk&&B.husk.st==='break'){const H=B.husk;H.bt+=dt;H.k=H.bt<.12?.6+.1*H.bt/.12:.7+.3*Math.min(1,(H.bt-.12)/.6);if(H.bt>=.72)B.husk=null}}
// the root of a strip comes out: the floor jumps along it, a crack of wood
function w2stripOut(s){shake(3);w2snd((s.x0+s.x1)/2,t=>{M.wood(t,.8,VR(150,.08));fNoise(t,.3,'lowpass',VR(700,.1),.8,.18,{brown:true});M.wood(t+.08,.5,VR(210,.1))});
  if(BOSS2&&!LOWFX){const S=stonePal();for(let d=20;d<s.len;d+=70)ENV2.chunks(s.x0+(s.x1-s.x0)*d/s.len,s.y0+(s.y1-s.y0)*d/s.len,2,[S.hi,S.mid,S.lo],60)}}
// and leaves its scar: cracks every 40 px, two marks of roots, the grass wilts, the obstacles near it shake
function w2stripScar(s){const n=Math.floor(s.len/40),at=u=>[s.x0+(s.x1-s.x0)*u,s.y0+(s.y1-s.y0)*u];
  for(let j=1;j<n;j++){const d=j*40;if(s.gaps.some(g=>d>g[0]&&d<g[1]))continue;const[x,y]=at(d/s.len);stamp('cracks',x,y,9);ENV2.wiltGrass(x,y,20)}
  if(BOSS2){for(const u of[.3,.7]){const[x,y]=at(u);if(!s.gaps.some(g=>u*s.len>g[0]&&u*s.len<g[1]))ENV2.mark('roots',x,y,22)}
    for(const k of G.rocks){const dp=s.h?Math.abs(k.y-s.pos-W2.FY):Math.abs(k.x-s.pos);if(dp<k.r+40)k.hit=Math.max(k.hit||0,.18)}}}
function w2rayOut(r){shake(2);w2snd(r.x,t=>{M.wood(t,.6,VR(170,.1));fNoise(t,.15,'lowpass',VR(600,.1),.8,.12,{brown:true})});
  for(const m of r.arms){const ca=Math.cos(m.a),sa=Math.sin(m.a);for(let d=40;d<m.len;d+=36)stamp('cracks',r.x+ca*d,r.y+W2.FY+sa*d,8)}}
// the leaves of the autumn falling from the ceiling (24, 10 with LOWFX), and lying a while on the floor
function w2leaves(dt){const B=G.w2;if(B.leafT>0){B.leafT-=dt;const n=LOWFX?10:24;if(B.leaves.length<n&&Math.random()<dt*n/1.4)B.leaves.push({x:rand(L+10,R-10),y:rand(TOP+20,BOT-10),z:rand(160,260),rot:rand(0,TAU),vr:rand(-3,3),ph:rand(0,TAU),lie:0,dry:Math.random()<.25})}
  for(let i=B.leaves.length-1;i>=0;i--){const l=B.leaves[i];if(l.z>0){l.z=Math.max(0,l.z-34*dt);l.x+=(Math.sin((G.t||0)*2.2+l.ph)*26+8)*dt;l.rot+=l.vr*dt}else{l.lie+=dt;if(l.lie>3.5)B.leaves.splice(i,1)}}}
{const _u=update;update=function(dt){_u.apply(this,arguments);try{if(W2ON&&G&&G.w2&&started&&!paused)w2update(dt)}catch(err){console.error(err)}}}
// the blows while she is under the floor: a spark and nothing more; with the hat crooked the blows hurt half as much again
{const _h=hurtE;hurtE=function(e,d,crit,dot){if(W2ON&&e&&e.type==='witch'&&!e.dead&&!(e.intro>0)){if(e.shell>0){if(!dot&&G&&G.fx)G.fx.push({k:'spark',x:e.x,y:e.y-8,t:.15});return}
    if(e.st==='fix'){const A=[...arguments];A[1]=d*1.5;return _h.apply(this,A)}}return _h.apply(this,arguments)}}
// the cue of each move is said in its moment (the light has reached the part that strikes), not when the move begins
{const _g=b3go;b3go=function(e,st){if(!W2ON||!e||e.type!=='witch'||!B3CUE.witch)return _g.apply(this,arguments);const C=B3CUE.witch;B3CUE.witch={};try{return _g.apply(this,arguments)}finally{B3CUE.witch=C}}}

// =====================================================================
// DRAWING
// =====================================================================
// the game's simple drawings of her pieces, for a model that has not got them
const W2F={
  thorn(x,y,a,p2){ctx.save();ctx.translate(x,y);ctx.rotate(a);ink(1.8);ctx.beginPath();ctx.moveTo(8,0);ctx.lineTo(-5,-3.4);ctx.lineTo(-3,0);ctx.lineTo(-5,3.4);ctx.closePath();fs('#52301f');
    ctx.strokeStyle='rgba(239,227,200,.8)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-3,-1);ctx.lineTo(6,0);ctx.stroke();ctx.fillStyle=p2?'#ff8a3c':'#efe3c8';circ(6.4,0,1.2);ctx.fill();ctx.restore()},
  seed(x,y,z,p2,spin){const yy=y-(z||0);if(!LOWFX)glow(p2?'255,170,80':W2.violet,x,yy,10,.4);ctx.save();ctx.translate(x,yy);ctx.rotate(spin||0);ink(1.6);ctx.beginPath();ctx.ellipse(0,0,4,5,0,0,TAU);fs(p2?'#ff8a3c':'#8a4ab8');
    ctx.fillStyle=p2?'#fff0c0':'#7bf0c0';circ(0,.5,1.8);ctx.fill();ctx.fillStyle='rgba(255,255,255,.75)';circ(-1.3,-1.8,1);ctx.fill();ctx.restore()},
  hand(x,y,k,side,p2){const out=w2ss(k/.18),cls=w2ss((k-.18)/.12),gone=w2ss((k-.85)/.15);if(gone>=1||out<=0)return;ctx.save();ctx.globalAlpha*=1-gone;
    for(let i=0;i<4;i++){const an=-Math.PI*.2+i*Math.PI*.42*(side||1),bx=x+Math.cos(an)*38,by=y+Math.sin(an)*38*.55,tx=x+(bx-x)*(1-cls)*.85,ty=y-(60-16*cls)*out+(by-y)*(1-cls)*.85;
      ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(bx,by);ctx.quadraticCurveTo((bx+tx)/2+(bx-x)*.2,by-30*out,tx,ty);ctx.stroke();ctx.strokeStyle='#52301f';ctx.lineWidth=5;ctx.stroke();
      ctx.strokeStyle='#9a6040';ctx.lineWidth=1.6;ctx.stroke();ctx.fillStyle='#efe3c8';circ(tx,ty,2.3);ctx.fill()}ctx.restore()},
  bump(x,y,a,k,p2){const S=stonePal(),c=[S.hi,S.mid,S.lo];ctx.save();ctx.translate(x,y);if(!LOWFX){ctx.globalCompositeOperation='lighter';glow(p2?W2.amber:W2.mint,-Math.cos(a)*12,-Math.sin(a)*6,14,.35,7);ctx.globalCompositeOperation='source-over'}
    ctx.fillStyle='rgba(20,12,8,.5)';ell(0,0,14,6);ctx.fill();for(let i=0;i<5;i++){const an=i/5*TAU+a,px=Math.cos(an)*9,py=Math.sin(an)*4-2-2*Math.abs(Math.sin(k*TAU*2+i));ink(1.2);ctx.beginPath();ctx.moveTo(px-3.5,py+1.5);ctx.lineTo(px,py-3);ctx.lineTo(px+3.5,py+1);ctx.closePath();fs(c[i%3])}ctx.restore()},
  root(x0,y0,x1,y1,k,o){const len=Math.hypot(x1-x0,y1-y0);if(len<1)return;const a=Math.atan2(y1-y0,x1-x0),fr=k<.3?k/.3*len:len,hk=k<.7?1:1-(k-.7)/.3,w=o.w||1,G0=o.gaps||[];if(hk<=.02)return;
    ctx.save();ctx.translate(x0,y0);ctx.rotate(a);ctx.lineCap='round';const step=LOWFX?60:40;
    for(let d=4;d+32<fr;d+=step){if(G0.some(g=>d+34>g[0]&&d<g[1]))continue;const h=14*hk*(.8+.2*Math.sin(d*.37+(o.seed||0)));
      for(const[c,lw] of[[INK,9*w],['#52301f',6*w],['#9a6040',2*w]]){ctx.strokeStyle=c;ctx.lineWidth=lw;ctx.beginPath();ctx.moveTo(d,0);ctx.quadraticCurveTo(d+17,-h*1.9,d+34,0);ctx.stroke()}
      ctx.fillStyle='#4f8a34';ell(d+17,-h*.92,5*w,1.6*w);ctx.fill();ctx.fillStyle='#efe3c8';for(const u of[.32,.68]){ctx.beginPath();ctx.moveTo(d+34*u-1.6,-h*1.6*Math.sin(Math.PI*u)*.6-2);ctx.lineTo(d+34*u,-h*1.6*Math.sin(Math.PI*u)*.6-6.5*w);ctx.lineTo(d+34*u+1.6,-h*1.6*Math.sin(Math.PI*u)*.6-2);ctx.closePath();ctx.fill()}}
    ctx.restore()},
  husk(x,y,k,glw){const gone=w2ss((k-.7)/.3),br=w2ss((k-.6)/.1);if(gone>=1)return;ctx.save();ctx.globalAlpha*=1-gone;ink(2.6);ctx.beginPath();ctx.moveTo(x-18,y);ctx.quadraticCurveTo(x-14-br*6,y-40,x-7-br*8,y-70);ctx.lineTo(x+7+br*8,y-70);ctx.quadraticCurveTo(x+14+br*6,y-40,x+18,y);ctx.closePath();
    const g=ctx.createLinearGradient(x-18,0,x+18,0);g.addColorStop(0,'#8a7a6a');g.addColorStop(.5,'#5a4e42');g.addColorStop(1,'#2a221a');ctx.fillStyle=g;ctx.fill();ctx.stroke();
    if(glw>0){ctx.strokeStyle=`rgba(255,138,60,${glw})`;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-4,y-6);ctx.lineTo(x+3,y-28);ctx.lineTo(x-3,y-50);ctx.moveTo(x+3,y-28);ctx.lineTo(x+10,y-38);ctx.stroke();if(!LOWFX)glow('255,138,60',x,y-30,26,.35*glw)}ctx.restore()},
  sprout(x,y,k,p2){ctx.lineCap='round';for(let i=0;i<6;i++){const an=k*TAU+i/6*TAU,px=x+Math.cos(an)*24,py=y+Math.sin(an)*24*.55,h=5+3*Math.sin(k*TAU*2+i);ctx.strokeStyle=INK;ctx.lineWidth=3.4;ctx.beginPath();ctx.moveTo(px,py);ctx.quadraticCurveTo(px+3,py-h*.6,px+1,py-h);ctx.stroke();
    ctx.strokeStyle=p2?'#d0602a':'#5fae6c';ctx.lineWidth=1.6;ctx.stroke()}},
  leaf(x,y,z,rot,p2,dry){ctx.save();ctx.translate(x,y-(z||0));ctx.rotate(rot||0);ink(1.2);ctx.beginPath();ctx.moveTo(-4.5,0);ctx.quadraticCurveTo(0,-2.6,4.5,0);ctx.quadraticCurveTo(0,2.6,-4.5,0);ctx.closePath();
    fs(dry?'#c49a64':p2?'#d0602a':'#2a6a44');ctx.strokeStyle=dry?'#8a6a3e':p2?'#ffd27a':'#8fd8a0';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(-3.5,0);ctx.lineTo(3.5,0);ctx.stroke();ctx.restore()}};
function w2drawHand(h){const F=w2art('Hand'),y=h.y+W2.FY;if(F){try{F(h.x,y,h.kk,1,{side:h.side,p2:h.p2,seed:h.seed});return}catch(err){}}W2F.hand(h.x,y,h.kk,h.side,h.p2)}
function w2drawRoot(x0,y0,x1,y1,k,o){const F=w2art('Root');if(F){try{F(x0,y0,x1,y1,k,1,o);return}catch(err){}}W2F.root(x0,y0,x1,y1,k,o)}
function w2drawHusk(H){const F=w2art('Husk');if(F){try{F(H.x,H.y+W2.FY,H.face,H.k,1,{glow:H.glow,p2:true,seed:H.seed});return}catch(err){}}W2F.husk(H.x,H.y+W2.FY,H.k,H.glow)}
// the knot of branches is an obstacle (its hand closed, from k .30 to .85 along its life, then crumbling in 0.5 s)
if(W2ON){const _dr=drawRock;drawRock=function(k){if(k.kind!=='wfist')return _dr.apply(this,arguments);const W=k.w2||{},L0=W.life0||6,age=L0-k.life,
  kk=k.life>.5?.30+.55*clamp(age/(L0-.5),0,1):.85+.15*(1-Math.max(0,k.life)/.5);w2drawHand({x:k.x+(k.hit>0?Math.sin(G.t*90)*k.hit*10:0),y:k.y,kk:Math.min(.999,kk),side:W.side,p2:W.p2,seed:k.seed})}}
// the thorns and the seeds in flight (the model's own if it has them)
Object.assign(EPDRAW,{wthorn:p=>w2thornP(p,false),wthorn2:p=>w2thornP(p,true),wseed:p=>w2seedP(p,false),wseed2:p=>w2seedP(p,true)});
function w2thornP(p,p2){const F=w2art('Thorn');if(F){try{F(p.x,p.y,p.a,1,{p2});return}catch(err){}}W2F.thorn(p.x,p.y,p.a,p2)}
function w2seedP(p,p2){const F=w2art('Seed'),sp=(G.t||0)*6+(p.a||0);if(F){try{F(p.x,p.y+6,6,1,{p2,spin:sp});return}catch(err){}}W2F.seed(p.x,p.y+6,6,p2,sp)}
// ---- depth: the tall pieces on the floor (the hands, the husk, the roots bursting out, the tree left by the defeat) sit in the room's
// order as far as the hero and the witch go: what is behind the first of the two is drawn on the floor, the rest right after the one that
// stands just behind it (the long roots are cut in those bands of the room)
const W2D={t:-1,a:[],done:[]};
function w2anchors(){const A=[P.y],e=w2boss();if(e&&!(e.spawn>0))A.push(e.y);else{const c=(G.corpses||[]).find(q=>q.type==='witch');if(c)A.push(c.y)}A.sort((a,b)=>a-b);W2D.t=G.t;W2D.a=A;W2D.done=A.map(()=>false)}
function w2after(y){if(!G||!G.w2||W2D.t!==G.t)return;const A=W2D.a;for(let j=0;j<A.length;j++)if(!W2D.done[j]&&Math.abs(A[j]-y)<1e-6){W2D.done[j]=true;w2tall(A[j],j+1<A.length?A[j+1]:1e9);return}}
function w2tall(lo,hi){const B=G.w2;if(!B)return;
  for(const h of B.hands)if(h.kk>=0){const y=h.front?Math.max(h.y,P.y+.01):h.y;if(y>=lo&&y<hi)w2drawHand(h)}
  if(B.husk&&B.husk.y>=lo&&B.husk.y<hi)w2drawHusk(B.husk);
  if(B.tree&&B.tree.y>=lo&&B.tree.y<hi)w2drawTree(B.tree);
  const S=B.strips.filter(s=>s.warn<=0),Rs=B.rays.filter(r=>r.warn<=0);if(!S.length&&!Rs.length)return;
  const y0=Math.max(lo,-3000)+W2.FY,y1=Math.min(hi,AH+3000)+W2.FY,band=f=>{ctx.save();ctx.beginPath();ctx.rect(L-60,y0,R-L+120,y1-y0);ctx.clip();try{f()}finally{ctx.restore()}};
  for(const s of S){if(Math.max(s.y0,s.y1)+4<y0||Math.min(s.y0,s.y1)-30>=y1)continue;band(()=>w2drawRoot(s.x0,s.y0,s.x1,s.y1,Math.min(.999,1-s.act/s.act0),{w:1,gaps:s.gaps,p2:s.p2,seed:s.seed}))}
  for(const r of Rs)band(()=>{for(const m of r.arms){const ca=Math.cos(m.a),sa=Math.sin(m.a),oy=r.y+W2.FY;w2drawRoot(r.x,oy,r.x+ca*m.len,oy+sa*m.len,Math.min(.999,1-r.act/r.act0),{w:.9,gaps:[[0,24]],p2:true,seed:r.seed+m.a})}})}
// ---- on the floor: the warnings (the circle where she comes back up, the hands' ellipses with the shadow of the fingers, the ring of the
// spiral with its arrows, the strips and the rays, the chalk circles of the seeds), the bumps, the runes of the altar burning
function w2ground(){const B=G.w2;if(!B)return;const e=w2boss(),FY=W2.FY,t=G.t||0;w2anchors();
  // the shadow of her corpse and of the tree it leaves (the corpse has none of its own)
  {const c=(G.corpses||[]).find(q=>q.type==='witch'),T=B.tree;if(c||T)shadow((c||T).x,(c||T).y+FY,30,12,.3)}
  // the runes of her altar: one by one in the entrance (mint), burning orange through the Rite
  const RL=G.witchLights&&G.witchLights.length>=16?G.witchLights.slice(0,16):null;
  if(e&&RL&&e.intro>0){const n=Math.min(16,Math.floor((e.iT||0)/.04)+1),f=1-clamp(((e.iT||0)-2.2)/1,0,1);ctx.save();ctx.globalCompositeOperation='lighter';
    for(let i=0;i<n;i++){const l=RL[i];glow(W2.mint,l.x,l.y,14,.7*f,9)}
    if((e.iT||0)>.5&&(e.iT||0)<1){const u=w2ss(((e.iT||0)-.5)/.4),C=w2center();for(const l of[RL[0],RL[5],RL[10]])glow(W2.mint,l.x+(C.cx-l.x)*u,l.y+(C.cy-l.y)*u,12,.8*(1-u*.4),8)}ctx.restore()}
  if(e&&e.st==='rite'){const C=w2center(),k=b3k(e);ctx.save();ctx.globalCompositeOperation='lighter';
    if(RL)for(let i=0;i<16;i++){const l=RL[i];glow(W2.amber,l.x,l.y,13,.5+.25*Math.sin(t*6+i),8)}
    else for(let i=0;i<16;i++){const a=i/16*TAU+TAU/32,x=C.cx+Math.cos(a)*92,y=C.cy+Math.sin(a)*57;ctx.strokeStyle=`rgba(${W2.amber},${.7+.2*Math.sin(t*6+i)})`;ctx.lineWidth=1.8;
      ctx.beginPath();if(i%2){ctx.moveTo(x-3,y+2);ctx.lineTo(x,y-3);ctx.lineTo(x+3,y+2)}else{ctx.moveTo(x,y-3);ctx.lineTo(x,y+3);ctx.moveTo(x-2.5,y-.5);ctx.lineTo(x+2.5,y+.5)}ctx.stroke();glow(W2.amber,x,y,10,.4,7)}
    ctx.restore()}
  // where she comes back up: the red circle that fills, the rootlets turning in it
  if(B.arr){const A=B.arr,k=clamp(A.t/A.max,0,1),pu=.55+.3*Math.sin(t*18),y=A.y+FY;ctx.fillStyle=`rgba(${W2.red},${.1+.22*k})`;ell(A.x,y,34*k,34*k*.6);ctx.fill();
    ctx.strokeStyle=`rgba(${W2.red},${pu})`;ctx.lineWidth=2.5;ell(A.x,y,34,34*.6);ctx.stroke();const F=w2art('Sprout'),cy=(t*.9)%1;
    if(F){try{F(A.x,y,cy,1,{p2:A.p2})}catch(err){W2F.sprout(A.x,y,cy,A.p2)}}else W2F.sprout(A.x,y,cy,A.p2)}
  // the hands: the red ellipse fills while the shadows of four fingers spread in it
  for(const h of B.hands)if(h.st==='warn'||h.st==='rise'){const k=h.wk,y=h.y+FY,pu=.55+.35*Math.sin(t*(14+16*k));ctx.fillStyle=`rgba(${W2.red},${.08+.26*k})`;ell(h.x,y,38*k,38*k*.6);ctx.fill();
    ctx.strokeStyle=`rgba(${W2.red},${pu})`;ctx.lineWidth=2.5;ell(h.x,y,38,38*.6);ctx.stroke();ctx.save();ctx.lineCap='round';ctx.strokeStyle=`rgba(0,0,0,${.18+.2*k})`;ctx.lineWidth=5;
    for(let i=0;i<4;i++){const an=-Math.PI*.2+i*Math.PI*.42*(h.side||1),r0=6,r1=8+28*k;ctx.beginPath();ctx.moveTo(h.x+Math.cos(an)*r0,y+Math.sin(an)*r0*.6);ctx.lineTo(h.x+Math.cos(an)*r1,y+Math.sin(an)*r1*.6);ctx.stroke()}ctx.restore()}
  // the spiral: a dashed red ring round her and three curved arrows going the way it will turn
  if(e&&e.st==='spiral'){const k=b3k(e);if(k<.86){const f=k<.27?1:.45,x=e.x,y=e.y+FY,sp=(e.spin3||1)*(e.w2rev?-1:1);ctx.save();ctx.strokeStyle=`rgba(${W2.red},${(.5+.3*Math.sin(t*16))*f})`;ctx.lineWidth=2.2;ctx.setLineDash([7,6]);
    ell(x,y,60,36);ctx.stroke();ctx.setLineDash([]);ctx.strokeStyle=`rgba(${W2.red},${.7*f})`;ctx.fillStyle=`rgba(${W2.red},${.75*f})`;ctx.lineWidth=3;ctx.lineCap='round';
    for(let i=0;i<3;i++){const a0=t*1.4*sp+i*TAU/3,a1=a0+.75*sp;ctx.beginPath();for(let s=0;s<=8;s++){const an=a0+(a1-a0)*s/8;s?ctx.lineTo(x+Math.cos(an)*50,y+Math.sin(an)*30):ctx.moveTo(x+Math.cos(an)*50,y+Math.sin(an)*30)}ctx.stroke();
      const hx=x+Math.cos(a1)*50,hy=y+Math.sin(a1)*30,tx=-Math.sin(a1)*sp*50,ty=Math.cos(a1)*sp*30,tl=Math.hypot(tx,ty)||1,ux=tx/tl,uy=ty/tl;ctx.beginPath();ctx.moveTo(hx+ux*7,hy+uy*7);ctx.lineTo(hx-uy*5,hy+ux*5);ctx.lineTo(hx+uy*5,hy-ux*5);ctx.closePath();ctx.fill()}ctx.restore()}}
  // the chalk circles where the seeds of the Garden will land (they do not hurt)
  for(const s of B.seeds){ctx.save();ctx.strokeStyle=`rgba(${W2.chalk},${.45+.2*Math.sin(t*10)})`;ctx.lineWidth=1.6;ctx.setLineDash([5,6]);ell(s.tx,s.ty+FY,20,12);ctx.stroke();ctx.setLineDash([]);ctx.restore()}
  for(const s of B.strips)if(s.warn>0)w2stripWarn(s);
  for(const r of B.rays)if(r.warn>0)w2rayWarn(r);
  // the bumps under the floor
  {const F=w2art('Bump'),S=stonePal();for(const b of B.bumps){let ok=false;if(F){try{F(b.x,b.y+FY,b.a,b.cyc%1,1,{stone:[S.hi,S.mid,S.lo],p2:b.p2});ok=true}catch(err){}}if(!ok)W2F.bump(b.x,b.y+FY,b.a,b.cyc%1,b.p2)}}
  // the falling leaves' shadows
  for(const l of B.leaves)if(l.z>4)shadow(l.x,l.y,3,1.2,.2*(1-l.z/300));
  w2tall(-1e9,W2D.a[0])}
// the strip of the Roots while it warns: the band grows from the wall near her to the far one in 0.3 s, the chips of the slabs lift along it
// and the light runs in the joints the same way
function w2stripWarn(s){const k=1-s.warn/s.warn0,gr=w2ss(s.t/.3),len=s.len*gr,a=Math.atan2(s.y1-s.y0,s.x1-s.x0),pu=.45+.3*Math.sin((G.t||0)*18),S=stonePal(),C=[S.hi,S.mid,S.lo];
  ctx.save();ctx.translate(s.x0,s.y0);ctx.rotate(a);ctx.fillStyle=`rgba(${W2.red},${.07+.18*k})`;ctx.fillRect(0,-s.w/2,len,s.w);ctx.strokeStyle=`rgba(${W2.red},${pu})`;ctx.lineWidth=2;ctx.setLineDash([8,6]);ctx.strokeRect(0,-s.w/2,len,s.w);ctx.setLineDash([]);
  const step=LOWFX?44:26;let n=0;for(let d=12;d<len;d+=step,n++){if(s.gaps.some(g=>d>g[0]&&d<g[1]))continue;const j=((Math.sin(d*12.9898+s.seed*78.233)*43758.5453)%1+1)%1,h=1.5+2.5*k+Math.sin((G.t||0)*9+d)*.7,cy=(j-.5)*s.w*.55;
    ink(1);ctx.fillStyle=C[n%3];ctx.beginPath();ctx.moveTo(d-4,cy+1.5);ctx.lineTo(d-1.5,cy-h);ctx.lineTo(d+3.5,cy-h*.6);ctx.lineTo(d+4,cy+1.5);ctx.closePath();ctx.fill();ctx.stroke()}
  if(!LOWFX){const rgb=s.p2?W2.amber:W2.mint;ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(${rgb},${.16+.22*k})`;ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(0,0);for(let d=8;d<len;d+=8)ctx.lineTo(d,Math.sin(d*.6+s.seed)*1.6);ctx.stroke();
    glow(rgb,(s.t*340)%Math.max(1,len),0,18,.55*gr,7)}
  ctx.restore()}
// the rays of the Rite while they warn: a red band along each arm, and a mark of white-red light where it crosses the ring of runes
function w2rayWarn(r){const k=1-r.warn/r.warn0,pu=.5+.35*Math.sin((G.t||0)*20);for(const m of r.arms){const d0=36,l=Math.max(0,m.len-d0);ctx.save();ctx.translate(r.x,r.y+W2.FY);ctx.rotate(m.a);
    ctx.fillStyle=`rgba(${W2.red},${.08+.2*k})`;ctx.fillRect(d0,-12,l,24);ctx.strokeStyle=`rgba(${W2.red},${pu})`;ctx.lineWidth=2;ctx.setLineDash([8,6]);ctx.strokeRect(d0,-12,l,24);ctx.setLineDash([]);ctx.restore();
    ctx.save();ctx.globalCompositeOperation='lighter';glow('255,205,195',m.rx,m.ry,13+7*k,.45+.45*k,9);ctx.restore()}}
// ---- in the air: the seeds of the Garden in flight, the leaves of the autumn, and whatever tall piece was not drawn yet
function w2air(){const B=G.w2;if(!B)return;if(W2D.t===G.t)for(let j=0;j<W2D.a.length;j++)if(!W2D.done[j]){W2D.done[j]=true;w2tall(W2D.a[j],j+1<W2D.a.length?W2D.a[j+1]:1e9)}
  {const F=w2art('Seed');for(const s of B.seeds){const u=clamp(s.t/s.dur,0,1),x=s.sx+(s.tx-s.sx)*u,gy=s.sy+(s.ty-s.sy)*u+W2.FY,z=40*(1-u)+90*u*(1-u),sp=s.spin+u*9;
    shadow(x,gy,4.5*(1-z/160),1.8,.25);let ok=false;if(F){try{F(x,gy,z,1,{p2:s.p2,spin:sp});ok=true}catch(err){}}if(!ok)W2F.seed(x,gy,z,s.p2,sp)}}
  {const F=w2art('Leaf');for(const l of B.leaves){const a=l.z>0?1:Math.max(0,1-l.lie/3.5);if(a<=0)continue;ctx.save();ctx.globalAlpha*=a;let ok=false;
    if(F){try{F(l.x,l.y,l.z,l.rot,1,{p2:true,dry:l.dry});ok=true}catch(err){}}if(!ok)W2F.leaf(l.x,l.y,l.z,l.rot,true,l.dry);ctx.restore()}}}
{const _g2=drawHazards2Ground;drawHazards2Ground=function(){_g2.apply(this,arguments);try{if(W2ON)w2ground()}catch(err){console.error(err)}}}
{const _a2=drawHazards2Air;drawHazards2Air=function(){_a2.apply(this,arguments);try{if(W2ON)w2air()}catch(err){console.error(err)}}}
if(W2ON){const _dh=drawHero;drawHero=function(){_dh.apply(this,arguments);try{if(ctx===MAINCTX&&P)w2after(P.y)}catch(err){}}
  const _de=drawEnemy;drawEnemy=function(e){_de.apply(this,arguments);try{if(e&&e.type==='witch'&&ctx===MAINCTX&&G&&G.enemies&&G.enemies.includes(e))w2after(e.y)}catch(err){}}
  const _dc=drawCorpse;drawCorpse=function(c){_dc.apply(this,arguments);try{if(c&&c.type==='witch'&&ctx===MAINCTX)w2after(c.y)}catch(err){}}}
// ---- her body in the room: the shadow (with a lighter one under the train), the soft halo, the motes round her, the light she gives
if(W2ON){const _sf=shadowFor;shadowFor=function(e){if(e.type!=='witch')return _sf.apply(this,arguments);const v=w2vis(e);if(v<=.02)return;const y=e.y+W2.FY,s=.6+.4*v;
    shadow(e.x,y,30*s,12*s,.32*v);const f=(e.f3!=null?e.f3:e.face||0)+Math.PI+(e.st==='walk'&&e.w2mv?clamp(e.mv3w||0,-1.22,1.22):0),cx=e.x+Math.cos(f)*40,cy=y+Math.sin(f)*40*.55;
    if(!noShadow){ctx.save();ctx.fillStyle=`rgba(0,0,0,${.14*v})`;ctx.beginPath();ctx.ellipse(cx,cy,24*Math.hypot(Math.cos(f),.55*Math.sin(f))+7,7,Math.atan2(.55*Math.sin(f),Math.cos(f)),0,TAU);ctx.fill();ctx.restore()}};
  const _bb=b2back;b2back=function(e,dt){if(e.type!=='witch')return _bb.apply(this,arguments);const v=w2vis(e);if(v<=.02)return;B2G.witch(e);const t=G.t||0;
    ctx.save();ctx.globalCompositeOperation='lighter';glow(b2halo(e),e.x,e.y-55,100,(.14+.04*Math.sin(t*1.7))*(e.intro>0?.6:1)*v);ctx.restore()};
  const _au=b2aura;b2aura=function(e,dt){if(e.type!=='witch')return _au.apply(this,arguments);if(w2vis(e)<1)return;
    if(b2every(e,'au',.16,dt))b2emit(e,{k:'mote',e,a:rand(0,TAU),rad:e.r*rand(1,1.5),h0:rand(10,40),life:1.4,col:e.p2?'255,150,70':Math.random()<.5?W2.violet:W2.mint})};
  // the light on her: higher than the Witch of today (she is tall), none while she is under the floor (the fin keeps a little)
  ELIGHT.witch2L=(e,Lt)=>{const v=e.w2lv==null?1:e.w2lv;if(v>.05)Lt(e.x,e.y-55,110,.75*v);else if(e.st==='fin')Lt(e.x,e.y,40,.45)};
  const _dl=drawLighting;drawLighting=function(){const W=G&&G.enemies?G.enemies.filter(q=>q.type==='witch'):[];for(const q of W){q.w2lv=w2vis(q);q.type='witch2L'}try{return _dl.apply(this,arguments)}finally{for(const q of W)q.type='witch'}};
  // the arena of today reacted to her old moves: now only the torches of the spiral stay (the scars come with each blow)
  const _r=b2react;b2react=function(e,ps,pb,ns,nb){if(e.type!=='witch')return _r.apply(this,arguments);
    if(ns==='spiral')ENV2.torches(e.p2?['#ff3c10','#ff8a22','#ffe6a0']:['#7a2fd0','#c07aff','#f4e6ff'],e.p2?'255,120,60':'190,120,255',3)}}
// ---- the entrance (3.2 s, the model's 'enter'): in the middle of the altar a great bud rises and opens; she wakes, cracks her fingers, cries
if(W2ON){const _bi=bossIntro;bossIntro=function(e,dt,a){if(e.type!=='witch')return _bi.apply(this,arguments);
  const T=BOSS_INTRO.witch;if(e.iT==null){e.iT=0;e.iStep=0;const C=w2center();e.x=C.x;e.y=C.y}const t0=e.iT;e.iT+=dt;const t=e.iT,at=s=>t0<s&&t>=s;
  e.intro=Math.max(0,T-t);e.face=a;e.st='enter';e.z=0;e.em=t<2.69?.999:1;e.hole=0;e.moving=false;const FY=W2.FY;
  if(t0===0){shake(3);w2snd(e.x,q=>fNoise(q,1.1,'lowpass',220,.7,.2,{brown:true,att:.25}))}
  // the runes light up one by one and the light runs to the middle; the floor trembles, dust and slabs rise
  if(t<.64){for(let k=0;k<16;k++)if(at(k*.04))w2snd(e.x,q=>vBell(null,q,[81,84,88][k%3],.6,.012));if(Math.random()<.35){const an=rand(0,TAU),r=rand(20,110);
    fxPush({k:'puff',x:e.x+Math.cos(an)*r,y:e.y+FY+Math.sin(an)*r*.6,vx:rand(-20,20),vy:rand(-30,-8),t:rand(.3,.6),r:rand(4,8)})}}
  if(at(.3))stamp('cracks',e.x,e.y+FY,40);
  if(at(.64)){shake(2);if(BOSS2){const S=stonePal();ENV2.chunks(e.x,e.y+FY,B3N(14),[S.hi,S.mid,S.lo],120)}fxPush({k:'flash',x:e.x,y:e.y+FY,r:60,rgb:W2.mint,t:.3,max:.3})}
  for(const s of[.86,1.22])if(at(s))w2snd(e.x,q=>fThump(q,72,44,.22,.3));
  for(let i=0;i<5;i++)if(at(.96+i*.12))w2creak(e.x,.42,VR(230-i*12,.08));
  if(at(2.30))sfx('shimmer',2,e.x);
  if(at(2.40))w2snd(e.x,q=>{M.wood(q,.6,VR(320,.08));fNoise(q,.04,'bandpass',2200,1.5,.2)});
  for(const s of[2.43,2.50,2.56])if(at(s))w2crick(e.x,1);
  if(at(2.69)){if(!b3say(e,'cry'))sfx('roar');vib([60,40,120]);shake(6);for(let i=0;i<3;i++)setTimeout(()=>{if(G&&G.fx)fxPush({k:'ring2',x:e.x,y:e.y-e.r,rgb:'255,255,255',r0:e.r,r1:e.r*5,t:.45,max:.45,w:6-i*1.5})},i*170);
    vfxBlast(e.x,e.y-50,W2.mint,80,{sparks:0,spore:LOWFX?6:16,dust:0,debris:'leaf',n:LOWFX?8:18,ring2:false})}
  if(e.intro<=0){e.z=0;e.em=null;e.si=-1;w2walk(e,.9)}}}
// what the model plays: the entrance over its whole length, the walk on her own clock, the fin as a loop, every move on her clock (b3k:
// the model's own clock does not know the 1.1 of the second phase)
if(W2ON){const _nm=n3Move;n3Move=function(e){if(e.type!=='witch')return _nm.apply(this,arguments);
  if(e.intro>0)return['enter',Math.min(.999,Math.max(0,(e.iT||0)/BOSS_INTRO.witch))];const M=N3.meta.witch,st=e.st;
  if(st==='walk'||!st){if(e.w2mv){const d=B3D(e,'walk');return['walk',((((e.wt||0)%d)+d)%d)/d]}if(e.o3==null)e.o3=Math.random()*7;return['idle',((((G.t||0)+e.o3)/B3D(e,'idle'))%1+1)%1]}
  if(st==='fin')return['fin',((e.mt||0)/B3D(e,'fin'))%1];
  if(M.an.includes(st))return[st,Math.min(.999,Math.max(0,b3k(e)))];return _nm.apply(this,arguments)}}
// ---- the defeat (4 s, the model's 'die'): the last autumn, the hat falls (1.8 s), she becomes a bare tree, a sprout; the tree, the hat
// and the flowers stay until you leave the room
if(W2ON){BDIE.witch={setup(c){const e=c.e;w2clearHz();c.face=e.f3!=null?e.f3:(e.face||Math.PI/2);c.p2=!!e.p2;c.live=1;
      // her creatures wither: leaves and spores where they stood
      for(const o of G.enemies)if(o!==e&&!o.dead&&o.w2kid)vfxBlast(o.x,o.y,'190,140,255',28,{sparks:0,spore:LOWFX?3:8,sporeRgb:'190,140,255',dust:4,debris:'leaf',n:LOWFX?3:6,ring2:false});
      sfx('creep',0,c.x)},
    tick(c,dt,D){const p=Math.min(1,c.t/c.dur);
      if(p>.4&&p<.75&&Math.random()<(LOWFX?.25:.6))cpart(c,{k:'leaf',x:c.x+rand(-26,26),y:c.y+W2.FY,z:rand(40,110),vx:rand(-20,20),vz:rand(-30,-10),g:-10,sw:5,ph:rand(0,6),life:rand(1,1.6),col:pk(['#c49a64','#8a6a3e','#4a3420'])});
      if(c.t>=D.clou&&!c.thud){c.thud=1;shake(3);const q=b3pt(c,24,0,c.face);cpuff(c,q.x,q.y,LOWFX?3:7,'170,150,120');w2snd(c.x,t=>{fThump(t,140,60,.14,.25);M.wood(t,.4,VR(260,.1))})}
      if(c.t>=c.dur-1e-6&&!c.kept){c.kept=1;w2keepTree(c)}},
    draw(c,D){const p=Math.min(.999,c.t/c.dur),M=N3.meta.witch;try{N3.witch(c.x,c.y+W2.FY,c.face,'die',p,(M&&M.sc)||1,{p2:c.p2,noFx:LOWFX})}catch(err){}}}}
// the last frame of the defeat, painted once and kept on the floor
function w2keepTree(c){const B=G&&G.w2;if(!B)return;const K=2,W=360,H=360,ox=180,oy=300;let cv=null;
  try{cv=document.createElement('canvas');cv.width=W*K;cv.height=H*K;const saved=ctx,ns=noShadow;ctx=cv.getContext('2d');noShadow=true;ctx.scale(K,K);
    try{N3.witch(ox,oy,c.face,'die',.999,(N3.meta.witch&&N3.meta.witch.sc)||1,{p2:c.p2,noFx:true})}catch(err){cv=null}finally{noShadow=ns;ctx=saved}}catch(err){cv=null}
  B.tree={x:c.x,y:c.y,cv,K,ox,oy,W,H}}
function w2drawTree(T){if(T.cv)ctx.drawImage(T.cv,T.x-T.ox,T.y+W2.FY-T.oy,T.W,T.H)}

// =====================================================================
// THE VOICE AND THE PERSONALITY, like the four new bosses (88-boss3-voci.js): a fairy-tale witch, nasal, going up and down, never horror.
// A cry that climbs into a «ha-haaa!»; a dry high «ih-ih-ih-ih» when she hits you and mocks you (her gesture, the model's 'taunt': she blows
// out her candles and calls you with her finger); «vie-ni… vie-ni…» sung on two notes when you keep away; «hmpf!» when you hit her hard;
// a voice for each spell («hn!», a rising whisper, a giggle that sinks, «ah-ah!», «hmpf», a low «mmmm», her lullaby, a long chant); a sigh
// that becomes wind in the leaves when she falls; a long laugh if you fall. Under her big cries the wood creaks and the leaves rustle.
// =====================================================================
if(W2ON){B3S.add('witch');
  const ha=(n,t0,step,d,fa,fb,v,o)=>[...Array(n)].map((_,i)=>{const f=fa+(fb-fa)*i/Math.max(1,n-1);return{t:t0+i*step,d,f:[f*1.05,f*.94],v:Array.isArray(v)?v[i%v.length]:v,a:1-i*.06,h:.25,...(o||{})}});
  B3VO.VB.witch={base:{br:.3,ro:.1,ji:.05,lp:.62},k:{
    cry:[[1.35,[{t:0,d:.2,f:[300,380],v:['n','a'],h:.15},{t:.24,d:.16,f:[400,470],v:'a',h:.1},{t:.42,d:.9,f:[520,660,380],v:['a','e','i'],vib:[.045,6.5],rel:.4,ro:.15}],.55]],
    angry:[[1.5,[{t:0,d:.45,f:[330,300],v:['n','a'],ro:.45,ji:.12},{t:.42,d:1.02,f:[420,640,340],v:['a','o','a'],ro:.3,vib:[.05,7.5],rel:.35}],.58]],
    laugh:[[.85,[...ha(4,0,.11,.08,600,500,'i',{h:.2}),{t:.47,d:.34,f:[520,560,420],v:['i','e'],a:.75,vib:[.04,8],rel:.5}],.48]],
    laugh2:[[1.62,[{t:0,d:.2,f:[392,392],v:['i','e'],h:.12},{t:.24,d:.28,f:[330,330],v:['n','i'],vib:[.03,6]},{t:.62,d:.2,f:[392,392],v:['i','e'],h:.12},
      {t:.86,d:.32,f:[330,322],v:['n','i'],vib:[.03,6],rel:.4},...ha(3,1.26,.1,.07,560,500,'i',{a:.7})],.46]],
    hurt:[[.32,[{t:0,d:.06,noise:1,v:'m',a:.6},{t:.05,d:.25,f:[400,300],v:['m','u'],h:.1,ro:.2}],.45],[.28,[{t:0,d:.26,f:[520,380],v:['a','i'],h:.18}],.45]],
    c_hand:[[.22,[{t:0,d:.2,f:[340,270],v:['n','u'],h:.3}],.42]],
    c_spiral:[[.85,[{t:0,d:.82,noise:1,v:['u','e','i'],hs:.55,a:.75}],.36]],
    c_sink:[[.62,ha(4,0,.13,.09,520,340,'i',{a:.85}),.42]],
    c_rise:[[.48,[{t:0,d:.17,f:[440,520],v:'a',h:.22},{t:.21,d:.25,f:[580,470],v:'a',h:.12}],.45]],
    c_fix:[[.34,[{t:0,d:.06,noise:1,v:'m',a:.65},{t:.05,d:.27,f:[310,250],v:'m',h:.1}],.42]],
    c_roots:[[.7,[{t:0,d:.66,f:[220,205,230],v:'m',vib:[.03,5],h:.05}],.45]],
    c_sow:[[.95,[{t:0,d:.2,f:[440,440],v:['n','a'],vib:[.02,5]},{t:.23,d:.2,f:[523,523],v:['n','a'],vib:[.02,5]},{t:.46,d:.46,f:[659,650],v:['n','a'],vib:[.035,6],rel:.45}],.44]],
    c_rite:[[1.8,[{t:0,d:1.75,f:[262,330,440],v:['o','a','e'],vib:[.04,5.5],br:.45,rel:.3}],.48]],
    die:[[2.4,[{t:0,d:1.45,f:[460,340,190],v:['a','o','u'],vib:[.05,4],br:.5,rel:.6},{t:1.3,d:1.05,noise:1,v:['u','h'],a:.55}],.52]],
    win:[[1.6,[...ha(7,0,.12,.09,620,440,['a','e']),{t:.9,d:.6,f:[470,540,360],v:['a','o'],vib:[.05,7],rel:.5}],.52]]}};
  B3CUE.witch={hand:'c_hand',spiral:'c_spiral',sink:'c_sink',rise:'c_rise',fix:'c_fix',roots:'c_roots',sow:'c_sow',rite:'c_rite'};
  // under her big cries the wood creaks and the leaves rustle
  {const _m=b3sayMore;b3sayMore=function(e,k,t){if(e.type!=='witch')return _m.apply(this,arguments);
    if(k==='cry'||k==='angry'||k==='die'||k==='win'){M.wood(t+.12,.35,VR(210,.12));M.wood(t+.42,.28,VR(170,.12));fNoise(t+.05,k==='die'?2:1.1,'highpass',VR(3200,.1),.7,.035,{att:.3})}
    else if(k==='laugh'||k==='laugh2')M.wood(t+.06,.2,VR(260,.15))}}
  // the voices get ready in the rooms of her arena (and at once in her room)
  {const _br=buildRoom;buildRoom=function(){const r=_br.apply(this,arguments);try{const A=G&&G.mode!=='inf'&&!G.daily&&ARENAS[G.arena||0];
    if(A&&!A.bt&&BOSSZ[A.boss]==='witch'||G&&(G.enemies||[]).some(q=>q.type==='witch'))B3VO.prep('witch')}catch(err){}return r}}
  // the defeat with her voice (the cry of the entrance and of the autumn are in bossIntro and w2rage)
  {const _s=BDIE.witch.setup;BDIE.witch.setup=function(c){_s.apply(this,arguments);b3say(c,'die')}}}
// ---- for the previews (anteprime/mk_boss2.py) and the tests (tests/boss2gioco.js): how to get into her room, her moves in each phase, the
// dangers she puts in the room (counted by the tests) and the clips of her voice
if(W2ON){const R=window.BCL||(window.BCL={});R.witch={n:'Strega delle Radici',arena:4,p2:true,
  enter(){G.arena=4;G.chapter=ARENAS[4].ch;G.diff=ARENAS[4].diff;G.bossLvl=null;G.room=ROOMS;G.event=null;buildRoom()},
  moves:['hand','spiral','sink','fin','rise','fix','roots','sow'],moves2:['rage','rite'],
  hz(){const B=G.w2||{};return{avvisi:(B.warn||[]).length+(B.arr?1:0),gobbe:(B.bumps||[]).length,mani:(B.hands||[]).length,nodi:G.rocks.filter(k=>k.kind==='wfist').length,
    strisce:(B.strips||[]).length,raggi:(B.rays||[]).length,guscio:B.husk?1:0,semi_in_volo:(B.seeds||[]).length,
    semi:G.eproj.filter(q=>q.kind==='wseed'||q.kind==='wseed2').length,spine:G.eproj.filter(q=>q.kind==='wthorn'||q.kind==='wthorn2').length,
    servitori:G.enemies.filter(q=>q.w2kid&&!q.dead).length}},
  voice:['cry','laugh','angry','die']}}
