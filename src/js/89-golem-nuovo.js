// =====================================================================
// IL GOLEM DI MUSCHIO RIFATTO: «Il Colosso della Cripta» (Denis, 15 ottobre: «rivisita tutti i boss … possenti, belli, fighi, che diano
// timore nello sfidarli», «migliora anche le loro abilità speciali»; si parte dal Golem, poi gli altri). ANTEPRIMA: questo file e il
// modello sprite/nemici3d/golem2.js entrano solo nella copia del gioco fatta da anteprime/mk_golem2.py; nel gioco vero dopo il sì di
// Denis (il modello prende il posto di 'golem' e questo file va in src/ordine.txt). Design e numeri: docs/boss-classici.md.
// Il Golem è un colosso di ardesia coperto di muschio: il cuore di runa nel petto manda la luce lungo le vene di pietra fino al braccio
// o alle gambe che stanno per colpire (il suo avviso). Ogni stato ha il nome di una mossa del modello; il colpo vero parte nel suo
// fotogramma (b3at, 81-boss3-base.js). Mosse:
// - Schianto (leap): si gira verso di te e salta; un cerchio rosso con la sua ombra che cresce segna dove ricade, un anello tratteggiato
//   fin dove arriva l'onda d'urto. Poi resta coi pugni incastrati (stuck, 1 s): non si muove e i colpi fanno +50% («Colpo al cuore!»).
// - Frana (throw): strappa una lastra dal pavimento (resta la buca), tre cerchi rossi, la scaglia: in volo si spacca in tre massi che
//   restano a terra 9 s e fanno da riparo (al massimo 6 massi insieme).
// - Faglia (fault): una striscia rossa verso di te, il pugno batte e una fila di zanne di pietra corre lungo la crepa (un passo di lato).
// - Valanga (curl, roll, unroll): una striscia larga ti segue e poi si blocca, rotola rimbalzando sui muri (3 rimbalzi, 4 nella fase 2),
//   poi resta senza fiato (si colpisce).
// - Raggio del Cuore (beam, solo fase 2): una linea di mira ti insegue piano, si blocca e lampeggia, poi il raggio esce dal cuore e si
//   ferma contro massi e ostacoli: ripararsi o fare un passo di lato.
// - Fase 2 (rage, a metà vita): il cuore si spacca e dentro c'è la lava, gli spallacci cadono e restano come massi, tutto più rapido.
// Entrata (enter): statua in ginocchio che si risveglia. Sconfitta (die): torna pietra. È il primo boss: mai due attacchi insieme, ogni
// danno ha un avviso a terra di almeno 0,6 s, dopo ogni mossa almeno 1,1 s di camminata.
// =====================================================================
const G2ON=typeof N3!=='undefined'&&!!N3.golem2;
const G2={seq1:['leap','throw','fault','curl'],seq2:['leap','throw','beam','fault','curl'],red:'229,72,77',mint:'110,255,190',lava:'255,122,46'};
if(G2ON){
  // the new model in place of the old one (its drawing of today stays as N3.meta.golem.old for the pages)
  const old=N3.golem,oldM=N3.meta.golem;N3.golem=N3.golem2;N3.meta.golem=Object.assign({},N3.meta.golem2,{old:(x,y,f,a,p)=>old(x,y,f,oldM.an.includes(a)?a:'idle',p,oldM.sc||1,{})});
  BOSS_INTRO.golem=3.2;
  Object.assign(BDEATH,{golem:{dur:4,clou:2.2,snd:'crumble'}});
  // the bar, the halo and the aura; the 2D stones, moss, flower and mushroom of the old golem go: the model draws all of it
  B2H.golem=100;B2T.golem=[[G2.mint,'255,120,40'],B2T.golem[1]];B2.golem.back=()=>{};B2.golem.front=()=>{};
  RUNEC.golem=[G2.mint,G2.lava];
  // what the game passes to the model: the turn of the rolling ball, the squash after a bounce; the walk follows its own clock
  N3G.opt.golem=e=>({spin:e.spin3||0,bump:Math.max(0,e.bump3||0)});
  N3G.wp.golem=e=>{const d=B3D(e,'walk');return(((e.wt||0)%d)+d)%d/d};
}
// ---- helpers
// the model's own drawings of the pieces of its attacks (design: Slab(x,y,z,rot,sc,o), Rock(x,y,z,r,spin,sc,o), Fang(x,y,h,k,sc,o),
// Shard(x,y,z,a,sc,o); x, y the floor point, z the height); the game's simple drawings if the model has none
const g2art=n=>N3['golem'+n]||N3['golem2'+n]||null;
const g2pt=(e,bx,by,bz,face)=>{const f=face!=null?face:e.f3!=null?e.f3:(e.face||0),q=C3.V(f).P([bx,by,bz||0]);return{x:e.x+q[0],y:e.y+8+q[1]}};
function g2walk(e){e.wt=0;b3go(e,'walk',rand(1.1,1.6))}
// how far from (x,y) along a before a wall or an obstacle (the temporary ones too, unless soft)
function g2reach(x,y,a,max,soft){const ca=Math.cos(a),sa=Math.sin(a);let s=0;for(;s<(max||900);s+=6){const px=x+ca*s,py=y+sa*s;if(px<L+4||px>R-4||py<TOP+4||py>BOT-4)break;
    if(G.rocks.some(k=>(!soft||!k.temp)&&Math.hypot(k.x-px,k.y-py)<k.r))break}return s}
// a free spot near (x,y), at least far px from the hero, inside the room and away from the obstacles
function g2spot(x,y,far){for(let i=0;i<24;i++){const a=rand(0,TAU),d=i?rand(10,90):0,tx=clamp(x+Math.cos(a)*d,L+30,R-30),ty=clamp(y+Math.sin(a)*d,TOP+40,BOT-40);
    if(Math.hypot(tx-P.x,ty-P.y)>=far&&!G.rocks.some(k=>Math.hypot(k.x-tx,k.y-ty)<k.r+26))return{x:tx,y:ty}}return null}
// a temporary stone on the floor (the boulders of the Landslide, the fallen pauldrons): at most six, the oldest crumbles
function g2stone(x,y,r,life,mat,p2){const T=G.rocks.filter(k=>k.temp);if(T.length>=6){const o=T.sort((a,b)=>a.life-b.life)[0];o.life=0;dustRing(o.x,o.y,10)}
  G.rocks.push({x,y,r,seed:Math.random()*10,temp:true,life,kind:'boulder',g2:1,g2k:mat||'floor',p2:!!p2,born:G.t||0});fields={}}
function g2reset(){if(G)G.g2={warn:[],slabs:[],chunks:[],faults:[],fangs:[],lane:null,beam:null,arrows:[]}}
{const _br=buildRoom;buildRoom=function(){g2reset();return _br.apply(this,arguments)}}
function g2warn(o){(G.g2||(g2reset(),G.g2)).warn.push(o)}
// ---- the brain
const g2rage=e=>{e.p2=true;e.shell=9;banner('Il Golem si infuria!','Fase 2',1.6);bossRage(e,G2.lava);$('bossBar').classList.add('rage');shake(8);sfx('boom',0,e.x);G.eproj=[];if(G.g2)G.g2.lane=null;b3go(e,'rage');e.moving=false;b3say(e,'angry')};
if(G2ON)golemUpd=function(e,dt,a){const sp=e.p2?1.3:1;dt*=sp;// the second phase runs 1.3 times faster (n3Move draws the model at the same pace)
  if(!G.g2)g2reset();const B=G.g2;
  if(!e.p2&&e.hp<e.max*.5&&!['leap','roll'].includes(e.st)){g2rage(e);return}
  b3tick(e,dt);const p2=e.p2,k=b3k(e);
  if(e.shardT>0){e.shardT-=dt;if(e.shardT<=0){const o=rand(0,TAU);for(let i=0;i<8;i++)shootE(e.x,e.y-10,o+i*TAU/8,150,7,10,'stone')}}
  if(e.bump3>0)e.bump3-=dt/.15;
  switch(e.st){
  case 'walk':{e.face=navAngle(e);e.moving=true;const w0=e.wt||0;e.wt=w0+dt;const d=B3D(e,'walk'),ph0=(w0%d)/d,ph1=(e.wt%d)/d;
    if(ph1<ph0||(ph0<.5&&ph1>=.5)){stepFx(e.x,e.y+4,true);G.shake=Math.max(G.shake,1.5)}
    moveCircle(e,Math.cos(e.face)*36*dt,Math.sin(e.face)*36*dt);
    if(e.stT<=0){e.moving=false;const seq=p2?G2.seq2:G2.seq1,nx=seq[(e.si=(e.si||0)+1)%seq.length];e.lf=a;b3go(e,nx);
      if(nx==='curl'){e.ra=a;B.lane={x:e.x,y:e.y,a,w:2*e.r,lock:false,fl:0}}
      if(nx==='beam'){e.bx=P.x;e.by=P.y}}
    break}
  // ---- SCHIANTO: turns to you, leaps (.333), lands (.833); then the fists stuck in the floor
  case 'leap':{e.moving=false;if(k<.333){e.face=a;e.lf=a}else e.face=e.lf;
    if(b3at(e,.333)){e.sx=e.x;e.sy=e.y;e.tx=clamp(P.x,L+e.r,R-e.r);e.ty=clamp(P.y,TOP+e.r,BOT-e.r);e.lf=Math.atan2(e.ty-e.y,e.tx-e.x);const fl=.5*B3D(e,'leap')/sp;
      g2warn({k:'land',x:e.tx,y:e.ty,r:50,t:fl,max:fl});g2warn({k:'ring',x:e.tx,y:e.ty,r:p2?320:240,t:fl+.45,max:fl+.45});stamp('cracks',e.x,e.y+4,16);sfx('dash',0,e.x);shake(3)}
    if(k>=.333&&k<.833&&e.sx!=null){const u=(k-.333)/.5,q=u*u*(3-2*u);e.x=e.sx+(e.tx-e.sx)*q;e.y=e.sy+(e.ty-e.sy)*q;e.z=95*Math.sin(Math.PI*u)}
    if(b3at(e,.833)){e.z=0;if(e.tx!=null){e.x=e.tx;e.y=e.ty}moveCircle(e,0,0);const x=e.x,y=e.y,S=stonePal();
      if(Math.hypot(P.x-x,P.y-y)<50+P.r*.4&&P.inv<=0&&P.dashT<=0)hurtP(Math.round(26*DMG()));
      G.waves.push({x,y,r:e.r,max:p2?320:240,dmg:Math.round(16*DMG()),hit:false,rgb:'215,200,175'});
      {const c=g2pt(e,12,0);stamp('crater',c.x,c.y,36)}vfxBlast(x,y,'255,210,140',110,{debris:'stone',n:26,cracks:58,sparks:18,dust:18});dustRing(x,y);
      if(BOSS2){ENV2.rocks(x,y,190,3);ENV2.fall(B3N(9));ENV2.chunks(x,y,B3N(18),[S.hi,S.mid,S.lo],150);ENV2.mark('cracks',x,y,60);ENV2.wiltGrass(x,y,70);for(const t of G.torches||[])t.ph+=2}
      shake(9);sfx('boom',0,x);vib([50,30,70]);if(p2)e.shardT=.3*sp}
    if(e.stT<=0){e.z=0;e.sx=null;b3go(e,'stuck')}break}
  case 'stuck':{e.moving=false;if(e.stT<=0)g2walk(e);break}
  // ---- FRANA: tears up a slab (.12), three red circles (.30), throws it (.50): it splits in the air into three boulders
  case 'throw':{e.moving=false;if(k<.5){e.face=a;e.lf=a}else e.face=e.lf;
    if(b3at(e,.12)){const q=g2pt(e,30,-22);g2hole(q.x,q.y);sfx('rock',0,e.x);shake(3);if(BOSS2){const S=stonePal();ENV2.chunks(q.x,q.y,B3N(8),[S.hi,S.mid,S.lo],90)}}
    if(b3at(e,.30)){const T=[{x:clamp(P.x,L+24,R-24),y:clamp(P.y,TOP+24,BOT-24)}];for(let n=0;n<(p2?3:2);n++){let best=null;
        for(let i=0;i<20;i++){const an=rand(0,TAU),tx=clamp(T[0].x+Math.cos(an)*75,L+24,R-24),ty=clamp(T[0].y+Math.sin(an)*75*.85,TOP+24,BOT-24);
          if(T.every(q=>Math.hypot(q.x-tx,q.y-ty)>=50)&&!G.rocks.some(r=>!r.temp&&Math.hypot(r.x-tx,r.y-ty)<r.r+20)){best={x:tx,y:ty};break}}if(best)T.push(best)}
      e.ft=T;const lead=.2*B3D(e,'throw')/sp+.95;T.forEach((q,i)=>g2warn({k:'disc',x:q.x,y:q.y,r:24,t:lead+i*.1,max:lead+i*.1}))}
    if(b3at(e,.50)&&e.ft){const h=g2pt(e,40,0),mx=e.ft.reduce((s,q)=>s+q.x,0)/e.ft.length,my=e.ft.reduce((s,q)=>s+q.y,0)/e.ft.length;
      B.slabs.push({x0:h.x,y0:h.y,z0:116,tx:mx,ty:my,t:0,dur:.95,split:.45,T:e.ft,p2});sfx('dash',0,e.x);e.ft=null}
    if(e.stT<=0)g2walk(e);break}
  // ---- FAGLIA: the line toward you (.05), the fist strikes (.50): fangs of stone run along the crack
  case 'fault':{e.moving=false;e.face=e.lf;
    if(b3at(e,.05)){const q=g2pt(e,30,22,0,a),ang=Math.atan2(P.y-q.y,P.x-q.x);e.lf=a;e.fq={x:q.x,y:q.y,rows:(p2?[-.436,0,.436]:[0]).map(o=>{const an=ang+o;return{a:an,len:g2reach(q.x,q.y,an,900,true)}})};
      const lead=.45*B3D(e,'fault')/sp;for(const r of e.fq.rows){b3wline(q.x,q.y,r.a,r.len,24,lead,G2.red);g2warn({k:'crack',x:q.x,y:q.y,a:r.a,len:r.len,t:lead,max:lead,col:p2?G2.lava:G2.mint})}sfx('rock',0,e.x)}
    if(b3at(e,.50)&&e.fq){for(const r of e.fq.rows)B.faults.push({x:e.fq.x,y:e.fq.y,a:r.a,len:r.len,s:0,next:0,hit:false,p2});shake(6);sfx('boom',0,e.x);vib([30,20,40]);
      if(BOSS2){const S=stonePal();ENV2.chunks(e.fq.x,e.fq.y,B3N(10),[S.hi,S.mid,S.lo],110);ENV2.rocks(e.fq.x,e.fq.y,120,1.5)}e.fq=null}
    if(e.stT<=0)g2walk(e);break}
  // ---- VALANGA: the wide band follows you, locks (.625); then it rolls, bouncing; then it stops to get its breath back
  case 'curl':{e.moving=false;if(k<.625){e.ra=a;e.face=a}else e.face=e.ra;if(B.lane){B.lane.x=e.x;B.lane.y=e.y;B.lane.a=e.ra;if(k>=.625&&!B.lane.lock){B.lane.lock=true;B.lane.fl=0;sfx('click',0,e.x)}}
    if(e.stT<=0){B.lane=null;b3go(e,'roll',2.6*sp);e.vx=Math.cos(e.ra)*330;e.vy=Math.sin(e.ra)*330;e.bounces=p2?4:3;e.spin3=0;sfx('dash',0,e.x)}break}
  case 'roll':{e.moving=false;e.spin3=(e.spin3||0)+9.2*dt;e.x+=e.vx*dt;e.y+=e.vy*dt;let hit=false,hx=e.x,hy=e.y;
    if(!LOWFX&&Math.random()<.6)fxPush({k:'puff',x:e.x+rand(-12,12),y:e.y+e.r*.4,vx:-e.vx*.12,vy:-e.vy*.12-12,t:.5,r:rand(5,10)});
    if(e.x<L+e.r){e.x=L+e.r;e.vx=Math.abs(e.vx);hit=true}if(e.x>R-e.r){e.x=R-e.r;e.vx=-Math.abs(e.vx);hit=true}
    if(e.y<TOP+e.r){e.y=TOP+e.r;e.vy=Math.abs(e.vy);hit=true}if(e.y>BOT-e.r){e.y=BOT-e.r;e.vy=-Math.abs(e.vy);hit=true}
    for(const r of G.rocks){const ex=e.x-r.x,ey=e.y-r.y,dd=Math.hypot(ex,ey),m=e.r+r.r;if(dd<m&&dd>.01){if(r.temp){r.life=0;dustRing(r.x,r.y,8);continue}
      const nx=ex/dd,ny=ey/dd;e.x=r.x+nx*m;e.y=r.y+ny*m;const dot=e.vx*nx+e.vy*ny;if(dot<0){e.vx-=2*dot*nx;e.vy-=2*dot*ny}hit=true}}
    if(hit){e.bounces--;e.bump3=1;shake(4);sfx('boom',0,e.x);fallingPebbles(B3N(4));vfxBlast(hx,hy,'230,210,180',50,{sparks:8,debris:'stone',n:8,dust:6,ring2:false});
      const da=Math.atan2(e.vy,e.vx);B.arrows.push({x:e.x,y:e.y,a:da,t:.25,max:.25});if(BOSS2)ENV2.rocks(e.x,e.y,90,1.5);
      if(p2){const ca=Math.atan2((TOP+BOT)/2-e.y,(L+R)/2-e.x);for(const o of[-.436,0,.436])shootE(e.x,e.y-10,ca+o,120,6,10,'stone')}}
    e.face=Math.atan2(e.vy,e.vx);if(hit){e.f3=e.face;e.fx3=Math.cos(e.face);e.fy3=Math.sin(e.face);e.f3t=G.t}if(e.bounces<=0||e.stT<=0)b3go(e,'unroll');break}
  case 'unroll':{e.moving=false;if(e.stT<=0)g2walk(e);break}
  // ---- RAGGIO DEL CUORE (second phase): the aim chases you slowly, locks (.417), flashes (.45, .52); the beam from .646 to .854
  case 'beam':{e.moving=false;const rdt=dt/sp;
    if(k<.417){const dx=P.x-e.bx,dy=P.y-e.by,dd=Math.hypot(dx,dy);if(dd>1){const st=Math.min(dd,110*rdt);e.bx+=dx/dd*st;e.by+=dy/dd*st}e.ba=Math.atan2(e.by-e.y,e.bx-e.x);if(AU.ctx&&Math.random()<.05)sfx('shimmer',0,e.x)}
    e.face=e.ba;const h=g2pt(e,21.6,0,41.6,e.ba),len=g2reach(h.x,e.y,e.ba,900,false);
    B.beam={x:e.x,y:e.y,hx:h.x,hy:h.y,a:e.ba,len,lock:k>=.417,fire:k>=.646&&k<.854,k};
    if(b3at(e,.417)||b3at(e,.45)||b3at(e,.52))sfx('click',0,e.x);
    if(b3at(e,.646)){sfx('magic',0,e.x);shake(5);e.bhit=false}
    if(k>=.646&&k<.854&&!e.bhit&&P.inv<=0&&P.dashT<=0){const ca=Math.cos(e.ba),sa=Math.sin(e.ba),ux=P.x-e.x,uy=P.y-e.y,u=ux*ca+uy*sa,v=Math.abs(uy*ca-ux*sa);
      if(u>0&&u<len&&v<10+P.r*.5){e.bhit=true;hurtP(Math.round(20*DMG()))}}
    if(e.stT<=0){B.beam=null;g2walk(e)}break}
  // ---- FASE 2: no damage, no attacks; the pauldrons fall (.62) and stay as stones; the roar (.72)
  case 'rage':{e.moving=false;e.face=a;
    if(b3at(e,.22))fxPush({k:'flash',x:e.x,y:e.y-50,r:90,rgb:'255,240,200',t:.25,max:.25});
    if(b3at(e,.62)){for(const s of[-1,1]){let q=g2pt(e,-4,72*s);if(q.x<L+30||q.x>R-30||q.y<TOP+40||q.y>BOT-40||Math.hypot(q.x-P.x,q.y-P.y)<80)q=g2spot(q.x,q.y,80);
        if(q){g2stone(q.x,q.y,16,12,'slate');dustRing(q.x,q.y,14);vfxBlast(q.x,q.y,'200,190,170',40,{debris:'stone',n:10,dust:8,ring2:false})}}shake(5);sfx('boom',0,e.x)}
    if(b3at(e,.72)){shake(8);sfx('roar');vib([60,40,120]);for(let i=0;i<3;i++)setTimeout(()=>{if(G&&G.fx)fxPush({k:'ring2',x:e.x,y:e.y-e.r,rgb:'255,180,120',r0:e.r,r1:e.r*5,t:.45,max:.45,w:6-i*1.5})},i*170)}
    if(e.stT<=0){e.shell=0;e.si=2;b3go(e,'beam');e.bx=P.x;e.by=P.y}break}
  default:g2walk(e)}};
// the stuck fists: the heart is open, the blows hurt more (and the first time in the run, the words)
{const _h=hurtE;hurtE=function(e,d){if(G2ON&&e&&e.type==='golem'&&e.st==='stuck'){const A=[...arguments];A[1]=d*1.5;if(!G.g2txt){G.g2txt=1;text(e.x,e.y-120,'Colpo al cuore!','#ffd84a',18)}return _h.apply(this,A)}return _h.apply(this,arguments)}}
// the hole of the torn slab: dark, its edges broken
function g2hole(x,y){const c=fx;if(!c)return;c.save();c.setTransform(2,0,0,2,0,0);const g=c.createRadialGradient(x,y,2,x,y,22);g.addColorStop(0,'rgba(8,6,4,.85)');g.addColorStop(.7,'rgba(20,14,10,.6)');g.addColorStop(1,'rgba(0,0,0,0)');
  c.fillStyle=g;c.beginPath();c.ellipse(x,y,22,12,0,0,TAU);c.fill();c.strokeStyle='rgba(0,0,0,.6)';c.lineWidth=1.4;for(let i=0;i<6;i++){const a=i/6*TAU+rand(-.3,.3);c.beginPath();c.moveTo(x+Math.cos(a)*18,y+Math.sin(a)*10);c.lineTo(x+Math.cos(a)*rand(24,32),y+Math.sin(a)*rand(13,17));c.stroke()}c.restore()}
// ---- the dangers in flight and on the floor
function g2update(dt){const B=G.g2;if(!B)return;if(G.state!=='play'){if(B.slabs.length||B.chunks.length||B.faults.length||B.fangs.length)g2reset();return}
  for(let i=B.warn.length-1;i>=0;i--){B.warn[i].t-=dt;if(B.warn[i].t<=0)B.warn.splice(i,1)}
  for(let i=B.arrows.length-1;i>=0;i--){B.arrows[i].t-=dt;if(B.arrows[i].t<=0)B.arrows.splice(i,1)}
  // the slab: high over the head toward the middle of the circles; at 45% of its flight it splits into the boulders
  for(let i=B.slabs.length-1;i>=0;i--){const s=B.slabs[i];s.t+=dt;const u=Math.min(1,s.t/s.dur);if(u<s.split)continue;B.slabs.splice(i,1);
    const sx=s.x0+(s.tx-s.x0)*s.split,sy=s.y0+(s.ty-s.y0)*s.split,sz=s.z0*(1-s.split)+60*Math.sin(Math.PI*s.split);
    fxPush({k:'flash',x:sx,y:sy-sz,r:40,rgb:s.p2?'255,170,90':'200,255,220',t:.18,max:.18});vfxBlast(sx,sy-sz,'200,190,170',40,{debris:'stone',n:10,dust:6,ring2:false});sfx('rock',0,sx);
    s.T.forEach((q,j)=>B.chunks.push({x0:sx,y0:sy,z0:sz,tx:q.x,ty:q.y,t:0,dur:s.dur*(1-s.split)+j*.1,p2:s.p2,rot:rand(0,TAU),seed:Math.random()*10}))}
  for(let i=B.chunks.length-1;i>=0;i--){const c=B.chunks[i];c.t+=dt;if(c.t<c.dur)continue;B.chunks.splice(i,1);
    if(Math.hypot(P.x-c.tx,P.y-c.ty)<24+P.r*.4&&P.inv<=0&&P.dashT<=0)hurtP(Math.round(16*DMG()));
    shake(3);dustRing(c.tx,c.ty,10);stamp('crater',c.tx,c.ty,16);vfxBlast(c.tx,c.ty,'230,210,180',46,{debris:'stone',n:10,sparks:6,dust:8,cracks:14});sfx('boom',0,c.tx);
    if(BOSS2)ENV2.rocks(c.tx,c.ty,70,2);if(Math.hypot(P.x-c.tx,P.y-c.ty)>24)g2stone(c.tx,c.ty,14,9,'floor',c.p2)}
  // the fault: the crack runs at 420 px/s, a fang every 18 px; each rises in .08 s, stays .6 s, crumbles in .2 s
  for(let i=B.faults.length-1;i>=0;i--){const f=B.faults[i];f.s+=420*dt;const ca=Math.cos(f.a),sa=Math.sin(f.a);
    while(f.next<=Math.min(f.s,f.len)){const x=f.x+ca*f.next,y=f.y+sa*f.next;B.fangs.push({x,y,t:0,p2:f.p2,rot:rand(-.3,.3),seed:Math.random()*10,a:f.a});
      for(const r of G.rocks)if(r.temp&&Math.hypot(r.x-x,r.y-y)<r.r+8){r.life=0;dustRing(r.x,r.y,8)}
      if(!f.hit&&Math.hypot(P.x-x,P.y-y)<22&&P.inv<=0&&P.dashT<=0){f.hit=true;hurtP(Math.round(16*DMG()))}
      if(!LOWFX&&f.next%36<18)fxPush({k:'puff',x,y,vx:rand(-10,10),vy:-14,t:.4,r:rand(4,7)});f.next+=18}
    if(f.s>=f.len){B.faults.splice(i,1);if(BOSS2)ENV2.rocks(f.x+ca*f.len,f.y+sa*f.len,60,1)}}
  for(let i=B.fangs.length-1;i>=0;i--){B.fangs[i].t+=dt;if(B.fangs[i].t>.88)B.fangs.splice(i,1)}}
{const _u=update;update=function(dt){_u.apply(this,arguments);try{if(G2ON&&G&&G.g2&&started&&!paused)g2update(dt)}catch(err){console.error(err)}}}
// a fang of stone (the model's own if it has one): rises, stands, crumbles
function g2fang(f){const F=g2art('Fang');if(F){try{F(f.x,f.y,22,Math.min(.999,f.t/.88),1,{p2:f.p2,seed:f.seed,a:f.a});return}catch(e){}}
  const k=f.t<.08?f.t/.08:f.t<.68?1:1-(f.t-.68)/.2;if(k<=0)return;
  const h=22*k,w=7;ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.rot*.3);ink(1.8);ctx.beginPath();ctx.moveTo(-w,0);ctx.lineTo(-w*.4,-h*.65);ctx.lineTo(0,-h);ctx.lineTo(w*.5,-h*.55);ctx.lineTo(w,0);ctx.closePath();
  const g=ctx.createLinearGradient(-w,0,w,0);g.addColorStop(0,'#5d666b');g.addColorStop(.45,'#8e979a');g.addColorStop(1,'#3e4549');ctx.fillStyle=g;ctx.fill();ctx.stroke();
  ctx.strokeStyle=f.p2?'rgba(255,140,60,.9)':'rgba(140,255,200,.75)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(-1,-h*.15);ctx.lineTo(1,-h*.55);ctx.stroke();ctx.restore()}
// a stone in flight (slab or boulder), the model's own if it has one
function g2rockAir(x,y,z,r,rot,p2,slab,seed){shadow(x,y+2,r*(1-Math.min(.5,z/300)),r*.35*(1-Math.min(.5,z/300)),.3);const yy=y-z,A=g2art(slab?'Slab':'Rock');
  if(A){try{if(slab)A(x,y,z,rot,1,{p2,shadow:false});else A(x,y,z,r,rot,1,{kind:'floor',p2,seed,shadow:false});return}catch(e){}}
  ctx.save();ctx.translate(x,yy);ctx.rotate(rot);ink(2.2);ctx.beginPath();const n=slab?4:7;for(let i=0;i<n;i++){const a=i/n*TAU+(slab?Math.PI/4:0),rr=slab?r*1.3:r*(.85+.15*Math.sin(i*2.3+(seed||0)));const px=Math.cos(a)*rr,py=Math.sin(a)*rr*(slab?.55:.85);i?ctx.lineTo(px,py):ctx.moveTo(px,py)}ctx.closePath();
  const g=ctx.createLinearGradient(-r,-r,r,r);g.addColorStop(0,'#9aa3a6');g.addColorStop(.5,'#6b7478');g.addColorStop(1,'#3f474b');ctx.fillStyle=g;ctx.fill();ctx.stroke();
  if(p2){ctx.strokeStyle='rgba(255,130,50,.95)';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(-r*.5,-r*.1);ctx.lineTo(0,r*.15);ctx.lineTo(r*.45,-r*.2);ctx.stroke()}
  else{ctx.fillStyle='#4f8a34';ctx.beginPath();ctx.ellipse(-r*.2,-r*.45,r*.45,r*.18,0,0,TAU);ctx.fill()}ctx.restore()}
// on the floor: the warnings (the landing circle with its growing shadow and its six ticks, the dashed ring of the wave, the discs of the
// boulders, the cracks of the fault), the rolling lane, the aim of the beam
function g2ground(){const B=G.g2;if(!B)return;
  for(const w of B.warn){const k=1-w.t/w.max,pu=.55+.3*Math.sin(G.t*18);
    if(w.k==='land'){ctx.fillStyle=`rgba(${G2.red},${.1+.22*k})`;ell(w.x,w.y,w.r*k,w.r*k*.6);ctx.fill();ctx.strokeStyle=`rgba(${G2.red},${pu})`;ctx.lineWidth=2.5;ell(w.x,w.y,w.r,w.r*.6);ctx.stroke();
      ctx.fillStyle=`rgba(0,0,0,${.15+.25*k})`;ell(w.x,w.y,w.r*(.3+.7*k)*.9,w.r*(.3+.7*k)*.5);ctx.fill();
      for(let i=0;i<6;i++){const a=-Math.PI/2+i*TAU/6,on=k>=(i+1)/6;ctx.fillStyle=on?`rgba(255,240,200,.95)`:`rgba(${G2.red},.6)`;circ(w.x+Math.cos(a)*w.r*1.08,w.y+Math.sin(a)*w.r*.65,on?3:2);ctx.fill()}}
    else if(w.k==='ring'){ctx.strokeStyle=`rgba(255,235,210,${.35+.15*Math.sin(G.t*10)})`;ctx.lineWidth=1.5;ctx.setLineDash([6,7]);ell(w.x,w.y,w.r,w.r*.6);ctx.stroke();ctx.setLineDash([])}
    else if(w.k==='disc'){ctx.fillStyle=`rgba(${G2.red},${.08+.28*k})`;ell(w.x,w.y,w.r*k,w.r*k*.6);ctx.fill();ctx.strokeStyle=`rgba(${G2.red},${pu})`;ctx.lineWidth=2.2;ell(w.x,w.y,w.r,w.r*.6);ctx.stroke()}
    else if(w.k==='crack'){ctx.save();ctx.translate(w.x,w.y);ctx.rotate(w.a);const l=w.len*Math.min(1,k*1.25);ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(${w.col},${.35+.4*k})`;ctx.lineWidth=2+2*k;
      ctx.beginPath();ctx.moveTo(0,0);for(let s=8;s<l;s+=8)ctx.lineTo(s,Math.sin(s*.7+w.x)*2.2);ctx.stroke();ctx.restore()}}
  if(B.lane){const l=B.lane,len=g2reach(l.x,l.y,l.a,900,true);ctx.save();ctx.beginPath();ctx.rect(L,TOP,R-L,BOT-TOP);ctx.clip();ctx.translate(l.x,l.y);ctx.rotate(l.a);
    const fl=l.lock?(Math.sin(G.t*30)>0?.32:.12):.1;ctx.fillStyle=`rgba(${G2.red},${fl})`;ctx.fillRect(0,-l.w/2,len,l.w);ctx.strokeStyle=`rgba(${G2.red},.7)`;ctx.lineWidth=2;
    if(!l.lock)ctx.setLineDash([8,6]);ctx.strokeRect(0,-l.w/2,len,l.w);ctx.setLineDash([]);ctx.restore()}
  if(B.beam&&!B.beam.fire){const b=B.beam;ctx.save();ctx.translate(b.hx,b.y);ctx.rotate(b.a);ctx.strokeStyle=`rgba(${G2.red},${b.lock?(Math.sin(G.t*28)>0?.95:.5):.6})`;ctx.lineWidth=b.lock?3:1.6;if(!b.lock)ctx.setLineDash([7,6]);
    ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(b.len,0);ctx.stroke();ctx.setLineDash([]);ctx.restore()}
  for(const a of B.arrows){const k=a.t/a.max;ctx.save();ctx.translate(a.x,a.y);ctx.rotate(a.a);ctx.fillStyle=`rgba(230,215,190,${.5*k})`;ctx.beginPath();ctx.moveTo(40,0);ctx.lineTo(24,-7);ctx.lineTo(24,7);ctx.closePath();ctx.fill();ctx.fillRect(4,-2.5,22,5);ctx.restore()}}
// in the air: the slab and the boulders in flight, the fangs, the beam
function g2air(){const B=G.g2;if(!B)return;
  for(const s of B.slabs){const u=Math.min(1,s.t/s.dur),x=s.x0+(s.tx-s.x0)*u,y=s.y0+(s.ty-s.y0)*u,z=s.z0*(1-u)+60*Math.sin(Math.PI*u);g2rockAir(x,y,z,18,u*3,s.p2,true)}
  for(const c of B.chunks){const u=Math.min(1,c.t/c.dur),x=c.x0+(c.tx-c.x0)*u,y=c.y0+(c.ty-c.y0)*u,z=c.z0*(1-u)+28*Math.sin(Math.PI*u);g2rockAir(x,y,z,12,c.rot+u*6,c.p2,false,c.seed)}
  for(const f of B.fangs)g2fang(f);
  if(B.beam&&B.beam.fire){const b=B.beam,k=(b.k-.646)/.208,a=Math.sin(Math.min(1,k)*Math.PI),ca=Math.cos(b.a),sa=Math.sin(b.a),ex=b.x+ca*b.len,ey=b.y+sa*b.len-18,mx=b.x+ca*40,my=b.y+sa*40-18;
    ctx.save();ctx.lineCap='round';ctx.globalCompositeOperation='lighter';for(const[w,col,al] of[[26,'255,110,30',.35],[16,'255,170,60',.6],[7,'255,240,190',.95]]){ctx.strokeStyle=`rgba(${col},${al*a})`;ctx.lineWidth=w;
      ctx.beginPath();ctx.moveTo(b.hx,b.hy);ctx.lineTo(mx,my);ctx.lineTo(ex,ey);ctx.stroke()}ctx.restore();glow('255,170,60',ex,ey,26,.6*a)}}
if(G2ON){const _dr=drawRock;drawRock=function(k){const A=k.g2&&g2art('Rock');if(!A)return _dr.apply(this,arguments);
  ctx.save();ctx.globalAlpha*=Math.min(1,k.life/.6);try{A(k.x,k.y,0,k.r,k.seed,1,{kind:k.g2k||'floor',p2:k.p2,cool:Math.min(1,((G.t||0)-(k.born||0))/2),seed:k.seed,shadow:false})}
  catch(err){ctx.restore();return _dr.apply(this,arguments)}ctx.restore()}}
{const _g2=drawHazards2Ground;drawHazards2Ground=function(){_g2.apply(this,arguments);try{if(G2ON)g2ground()}catch(err){}}}
{const _a2=drawHazards2Air;drawHazards2Air=function(){_a2.apply(this,arguments);try{if(G2ON)g2air()}catch(err){}}}
// the hot shards of the second phase (the model's own if it has one)
Object.assign(TRC,{stone:'255,130,50'});
Object.assign(EPDRAW,{stone:p=>{const A=g2art('Shard');if(A){try{A(p.x,p.y,0,p.a,(p.r||7)/7,{});return}catch(e){}}glow('255,120,40',p.x,p.y,p.r*2.4,.4);ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.a+G.t*6);ink(1.6);
  ctx.beginPath();ctx.moveTo(p.r*1.3,0);ctx.lineTo(-p.r*.2,-p.r*.9);ctx.lineTo(-p.r,-p.r*.1);ctx.lineTo(-p.r*.3,p.r*.8);ctx.closePath();ctx.fillStyle='#4a4f52';ctx.fill();ctx.stroke();
  ctx.strokeStyle='#ff8a3a';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(-p.r*.5,0);ctx.lineTo(p.r*.6,0);ctx.stroke();ctx.restore()}});
// ---- the entrance (3.2 s, the model's 'enter'): a statue on its knees in the middle of the runes wakes up
if(G2ON){const _bi=bossIntro;bossIntro=function(e,dt,a){if(e.type!=='golem')return _bi.apply(this,arguments);
  const T=BOSS_INTRO.golem;if(e.iT==null){e.iT=0;e.iStep=0}const t0=e.iT;e.iT+=dt;const t=e.iT,at=s=>t0<s&&t>=s;e.intro=Math.max(0,T-t);e.face=a;e.st='enter';e.z=0;e.em=t<2.75?.999:1;
  if(t0===0){sfx('quake');fallingPebbles(6);shake(2)}if(t<1.3&&Math.random()<.2)fallingPebbles(1);
  if(at(.8)){sfx('boom',0,e.x);shake(3)}if(at(1.12)){sfx('boom',0,e.x);shake(4);vib(30)}
  for(const s of[1.41,1.57,1.70,1.82,1.95])if(at(s)){sfx('rock',0,e.x);shake(1.5)}
  for(const s of[2.24,2.40])if(at(s))sfx('click',0,e.x);
  if(at(2.69)){shake(10);dustRing(e.x,e.y,26);vib([80,40,100]);for(const s of[-1,1]){const q=g2pt(e,26,26*s);stamp('crater',q.x,q.y,16)}vfxBlast(e.x,e.y,'215,200,175',120,{debris:'stone',n:26,dust:22,sparks:10});sfx('boom',0,e.x)}
  if(at(2.75)){if(!b3say(e,'cry'))sfx('roar');vib([60,40,120]);shake(6);for(let i=0;i<3;i++)setTimeout(()=>{if(G&&G.fx)fxPush({k:'ring2',x:e.x,y:e.y-e.r,rgb:'255,255,255',r0:e.r,r1:e.r*5,t:.45,max:.45,w:6-i*1.5})},i*170)}
  if(e.intro<=0){e.z=0;e.em=null;e.si=-1;b3go(e,'walk',.9)}}}
// what the model plays: the entrance over its whole length, the ball rolling on its own clock (the game turns it with o.spin)
if(G2ON){const _nm=n3Move;n3Move=function(e){if(e.type==='golem'){if(e.intro>0)return['enter',Math.min(.999,Math.max(0,(e.iT||0)/BOSS_INTRO.golem))];
    if(e.st==='roll')return['roll',((e.mt||0)/B3D(e,'roll'))%1]}return _nm.apply(this,arguments)}}
// ---- the defeat (4 s, the model's 'die'): it goes back to stone
if(G2ON){const _sb=snapBoss;snapBoss=function(e){if(e.type==='golem')return{live:1};return _sb.apply(this,arguments)}
  BDIE.golem={setup(c){const e=c.e;g2reset();c.face=e.f3!=null?e.f3:(e.face||Math.PI/2);c.p2=!!e.p2;c.live=1;sfx('crumble',0,c.x)},
    tick(c,dt,D){const p=Math.min(1,c.t/c.dur);if(p>.3&&p<.8&&Math.random()<(LOWFX?.25:.6))cpart(c,{k:'dust',x:c.x+rand(-40,40),y:c.y-rand(0,30),vz:rand(10,30),life:rand(.6,1),r:rand(4,8)});
      if(p>.55&&!c.thud){c.thud=1;shake(6);sfx('boom',0,c.x)}},
    draw(c,D){const p=Math.min(.999,c.t/c.dur),M=N3.meta.golem;try{N3.golem(c.x,c.y+8,c.face,'die',p,(M&&M.sc)||1,{p2:c.p2,noFx:LOWFX})}catch(err){}}};
  const _dc=drawCorpse;drawCorpse=function(c){if(c.type!=='golem')return _dc.apply(this,arguments);try{BDIE.golem.draw(c,BDEATH.golem)}catch(err){}drawParts(c)}}
// ---- the voice and the personality, like the four new bosses (88-boss3-voci.js): a colossus of stone. A deep rumbling roar with the
// stone grinding under it; a slow «hm-hm-hm» when it hits you and mocks you (its gesture, the model's 'taunt'); a grumble when you keep
// away and it calls you out; a grunt for each blow, after the heart beating («tum-tum», you hear the blow coming); a moan when you hit
// it hard; a long moan that sinks into the stone when it falls; a slow «ho… ho… ho» if you fall.
if(G2ON){B3S.add('golem');
  const ha=(n,t0,step,d,fa,fb,v,o)=>[...Array(n)].map((_,i)=>{const f=fa+(fb-fa)*i/Math.max(1,n-1);return{t:t0+i*step,d,f:[f*1.04,f*.94],v,a:1-i*.08,h:.25,...(o||{})}});
  B3VO.VB.golem={base:{br:.4,ro:.55,ji:.14,lp:.4},k:{
    cry:[[1.9,[{t:0,d:.16,noise:1,v:'h',a:.6},{t:.14,d:1.7,f:[58,104,66],v:['u','o','a','o'],h:.06,ro:.75,vib:[.03,4],rel:.4}],.66]],
    angry:[[1.8,[{t:0,d:.5,f:[52,60],v:'o',a:.85,ro:.9,ji:.25},{t:.48,d:1.28,f:[70,118,62],v:['o','a','o'],ro:.8,h:.06,vib:[.035,5],rel:.4}],.66]],
    laugh:[[1.05,[...ha(3,0,.24,.17,88,74,'m',{ro:.45}),{t:.72,d:.32,f:[70,58],v:['m','o'],a:.7,ro:.6,rel:.5}],.52]],
    laugh2:[[.95,[{t:0,d:.14,noise:1,v:'h',a:.7},{t:.16,d:.76,f:[66,92,72],v:['m','o'],ro:.65,am:[.35,14],h:.1}],.52]],
    hurt:[[.3,[{t:0,d:.28,f:[105,66],v:['u','o'],ro:.55,h:.12}],.5],[.28,[{t:0,d:.06,noise:1,v:'h',a:.7},{t:.05,d:.22,f:[96,70],v:'o',ro:.6,h:.2}],.5]],
    c_leap:[[.34,[{t:0,d:.32,f:[74,110],v:['u','a'],h:.35,ro:.45}],.5]],
    c_throw:[[.5,[{t:0,d:.26,f:[66,74],v:'m',ro:.55,h:.2},{t:.28,d:.2,f:[100,78],v:'a',ro:.4}],.5]],
    c_fault:[[.24,[{t:0,d:.22,f:[96,72],v:['u','a'],ro:.4,h:.25}],.48]],
    c_roll:[[.62,[{t:0,d:.6,f:[58,64],v:'o',ro:.85,am:[.55,17]}],.48]],
    c_beam:[[.95,[{t:0,d:.92,f:[56,96,140],v:['m','o','a'],ro:.3,vib:[.04,6],h:.05,rel:.25}],.5]],
    die:[[2.2,[{t:0,d:2.15,f:[92,72,36],v:['o','u'],ro:.5,vib:[.05,3.5],rel:.6,br:.5}],.58]],
    win:[[1.35,[...ha(3,0,.34,.24,84,70,'o',{ro:.5}),{t:1.02,d:.3,f:[66,52],v:'u',a:.6,ro:.6,rel:.5}],.56]]}};
  B3CUE.golem={leap:'c_leap',throw:'c_throw',fault:'c_fault',curl:'c_roll',beam:'c_beam'};
  // under its big cries the stone grinds
  {const _m=b3sayMore;b3sayMore=function(e,k,t){if(e.type!=='golem')return _m.apply(this,arguments);
    if(k==='cry'||k==='angry'||k==='die'||k==='win')fNoise(t+.05,k==='die'?1.9:1.3,'lowpass',VR(240,.15),.7,.08,{brown:true})}}
  // the heart before every blow: you hear it when the model's heart beats and sends its light down the veins (the Schianto two beats,
  // at .06 and .18 of the move; the Frana, the Faglia and the Valanga one at the start; in the boss's time, faster in the second phase)
  const G2BEAT={leap:[.06,.18],throw:[.03],fault:[.03],curl:[.05]};
  {const _g=b3go;b3go=function(e,st){_g.apply(this,arguments);try{const B=e.type==='golem'&&!(e.intro>0)&&G2BEAT[st];if(B&&AU.ctx&&AU.on.sfx&&AU.ctx.state==='running'){
    const k=B3D(e,st)/((e.p2?1.3:1)*((bossLvl()||{}).spd||1)),t=AU.ctx.currentTime+.01,v=Math.max(.55,enemyAt(e));B.forEach((c,i)=>fThump(t+c*k,64,38,.15,.22*v*(i?.8:1)));AU.pan=0}}catch(err){}}}
  // the voices get ready in the rooms of its arena (and at once in its room)
  {const _br=buildRoom;buildRoom=function(){const r=_br.apply(this,arguments);try{const A=G&&G.mode!=='inf'&&!G.daily&&ARENAS[G.arena||0];
    if(A&&BOSSZ[A.boss]==='golem'||G&&(G.enemies||[]).some(q=>q.type==='golem'))B3VO.prep('golem')}catch(err){}return r}}
  // its mocking gesture in its brain (a pause in its walk, never between two blows: it walks again a little before the next move)
  {const _gu=golemUpd;golemUpd=function(e,dt,a){if(e.st!=='taunt')return _gu.apply(this,arguments);b3tick(e,dt*(e.p2?1.3:1));e.moving=false;e.face=a;if(e.stT<=0)b3go(e,'walk',rand(.6,1))}}
  // the defeat with its voice (the cry of the entrance and the rage are in bossIntro and g2rage)
  {const _s=BDIE.golem.setup;BDIE.golem.setup=function(c){_s.apply(this,arguments);b3say(c,'die')}}}
// ---- for the previews (anteprime/mk_boss2.py) and the tests (tests/boss2gioco.js): every boss made anew says here how to get into its
// room, which moves it has in each phase, which dangers it puts in the room (counted by the tests) and the clips of its voice
if(G2ON){const R=window.BCL||(window.BCL={});R.golem={n:'Golem di Muschio',arena:0,p2:true,
  enter(){G.arena=0;G.chapter=ARENAS[0].ch;G.diff=ARENAS[0].diff;G.bossLvl=null;G.room=ROOMS;G.event=null;buildRoom()},
  moves:['leap','stuck','throw','fault','curl','roll','unroll'],moves2:['rage','beam'],
  hz(){const B=G.g2||{};return{cerchi:(B.warn||[]).length,lastre:(B.slabs||[]).length,massi_in_volo:(B.chunks||[]).length,faglie:(B.faults||[]).length,zanne:(B.fangs||[]).length,
    massi_a_terra:G.rocks.filter(k=>k.g2).length,onde:G.waves.length,striscia:B.lane?1:0,raggio:B.beam&&B.beam.fire?1:0,schegge:G.eproj.filter(q=>q.kind==='stone').length}},
  voice:['cry','laugh','angry','die']}}
