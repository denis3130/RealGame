// =====================================================================
// L'IDRA DELLA PALUDE RIFATTA: «l'Antica della Pozza Nera» (Denis, 15 ottobre: «rivisita tutti i boss … possenti, belli, fighi, che
// diano timore nello sfidarli», «migliora anche le loro abilità speciali»; 16 ottobre, dopo il Golem: «sì, fai gli altri 12»). ANTEPRIMA:
// questo file e il modello sprite/nemici3d/hydra2.js entrano solo nella copia del gioco fatta da anteprime/mk_boss2.py; nel gioco vero dopo
// il sì di Denis (il modello prende il posto di 'hydra' e questo file va in src/ordine.txt). Design e numeri: docs/boss-classici-design/hydra.md.
// Tre teste e una sola mente nella sua pozza nera: prima di ogni colpo il veleno sale luminoso nel collo della testa che colpirà. Non si
// sposta finché non apre il terzo occhio (a metà vita); poi nuota verso di te. Ogni stato ha il nome di una mossa del modello; il colpo vero
// parte nel suo fotogramma (b3at, 81-boss3-base.js). Mosse:
// - Morso a Tenaglia (bite, poi stuck): tre cerchi, uno dove sei e due ai lati; le teste di lato mordono, poi quella di mezzo. Si schiva
//   con un passo avanti o indietro (di lato si finisce tra i denti) o con lo scatto. Poi resta con le zanne piantate: colpi +50%.
// - Salva di Veleno (spit): tre palle a pallonetto (cinque nella fase 2) dove sei, dove vai, di lato; dove cadono resta una pozza.
// - Soffio Velenoso (breath): tre strisce dalle bocche, poi la nebbia; i totem riparano (nella fase 2 le strisce girano verso dove vai).
// - Agguato dal Profondo (ambush): le teste vanno sotto e sbucano dal pavimento sotto di te, una alla volta: continua a muoverti. Intanto
//   il corpo resta lì coi colli ad arco: tiragli addosso.
// - Il Giudizio della Palude (decree, con almeno due pozze): le pozze ribollono, una corona di punti intorno a te; al cenno diventano
//   geyser. Il centro è sicuro: stai fermo dentro la corona.
// - Tuffo (dive, sotto il pavimento, rise): le sue luci nuotano sotto il pavimento, si apre l'acqua nera dove riemergerà, poi l'onda.
// - Sguardo del Terzo Occhio (gaze, fase 2): un cono; al lampo, chi ci sta dentro senza riparo resta incantato (lento) finché non scatta.
// - Apre il terzo occhio (rage, a metà vita): le gemme erano occhi; poi tutto 1,15 volte più svelto.
// È il boss dell'arena 7: mai due attacchi insieme, ogni danno ha un avviso di almeno 0,6 s veri; gli avvisi tondi sono ellissi 1 : 0,6.
// =====================================================================
const HY2ON=typeof N3!=='undefined'&&!!N3.hydra2;
const HY2={seq1:['A','breath','ambush','decree','A','dive'],seq2:['gaze','A','spit','breath','ambush','decree','dive'],red:'229,72,77',K:.6,lime:'150,230,90',vio:'199,125,255'};
if(HY2ON){
  // the new model in place of the old one (its drawing of today stays as N3.meta.hydra.old for the pages)
  const old=N3.hydra,oldM=N3.meta.hydra;N3.hydra=N3.hydra2;N3.meta.hydra=Object.assign({},N3.meta.hydra2,{old:(x,y,f,a,p)=>old(x,y,f,oldM.an.includes(a)?a:'idle',p,oldM.sc||1,{})});
  ET.hydra.r=34;ET.hydra.cdmg=24;BOSS_INTRO.hydra=4.2;Object.assign(BDEATH,{hydra:{dur:4,clou:2.4,snd:'bubble'}});
  // the bar, the halo, the runes; the 2D glows, crests, drips and eyes under the water of the old hydra go (the model draws all of it),
  // and the pink ring of spheres of the arenas 5-8 (B3S: body, voice and mocking like the new bosses)
  B2H.hydra=112;B2T.hydra=[['110,220,120',HY2.vio],'200,255,150'];if(typeof B2!=='undefined'&&B2.hydra){B2.hydra.back=()=>{};B2.hydra.front=()=>{};B2.hydra.pre=null;B2.hydra.post=null}
  BBFX.hydra={c:'#33784a',f:'#e2aaff',k:'burst',s:'bubble'};if(typeof RUNEC!=='undefined')RUNEC.idra=['150,255,90',HY2.vio];B3S.add('hydra');
  if(typeof ETELE!=='undefined')delete ETELE.hydra;
  // the light of its three mouths (and of its pools)
  ELIGHT.hydra=(e,Lt)=>{if(e.hidden||e.alpha===0||e.intro>0&&(e.iT||0)<2)return;const M=hyMouths(e);if(M)for(const m of M)if(m.up)Lt(m.m.x,m.m.y,50,.55);
    if(!LOWFX&&G.hy)for(const q of G.hy.pools)if(!q.dry)Lt(q.x,q.y,30,.3)};
  // what the game passes to the model: the bite targets, the turn of the breath, how far you are (the eyes converge), the call
  N3G.opt.hydra=e=>({tg:e.tg||null,tg2:e.tg2||null,sweep:e.sweep||0,td:Math.max(60,Math.hypot(P.x-e.x,P.y-e.y)),call:e.call?1:0,noGlob:true});
  // (its line in the guide is in 44-guida.js, BEST2, with the others)
}
// ---- helpers
const hySp=e=>(e.p2?1.15:1)*((G.bossLvl||bossLvl()||{}).spd||1);          // model time per real second
const hyD=(x,y,X,Y)=>Math.hypot(X-x,(Y-y)/HY2.K);                        // distances on the floor as they look (circles are ellipses 1 : .6)
const hyCan=()=>P.inv<=0&&P.dashT<=0;
function hyReset(){if(G)G.hy={warn:[],bite:null,globs:[],pools:[],boils:[],geys:[],lanes:null,mist:[],pops:[],dv:null,cone:null,charm:0,drops:0}}
{const _br=buildRoom;buildRoom=function(){hyReset();return _br.apply(this,arguments)}}
const hyB=()=>G.hy||(hyReset(),G.hy);
// where its mouths are now (from the model, the same pose as the drawing), in game points; once per frame
function hyMouths(e){const t=G.t||0;if(e._hyM&&e._hyM.t===t)return e._hyM.M;if(!N3.hydra2Mouths)return null;let M=null;
  try{const[an,p]=n3Move(e),o=N3G.opt.hydra(e);o.p2=!!e.p2;M=N3.hydra2Mouths(e.f3!=null?e.f3:(e.face||0),an,Math.min(.999,Math.max(0,p)),o).map(q=>({m:{x:e.x+q.m[0],y:e.y+8+q.m[1]},f:{x:e.x+q.f[0],y:e.y+8+q.f[1]},
    e:{x:e.x+q.e[0],y:e.y+8+q.e[1]},g:{x:e.x+q.g[0],y:e.y+8+q.g[1]},up:q.up}))}catch(err){}e._hyM={t,M};return M}
// how far from (x,y) along a before a wall or an obstacle
function hyReach(x,y,a,max){const ca=Math.cos(a),sa=Math.sin(a);let s=0;for(;s<max;s+=5){const px=x+ca*s,py=y+sa*s;if(px<L+4||px>R-4||py<TOP+4||py>BOT-4)break;if(G.rocks.some(k=>Math.hypot(k.x-px,k.y-py)<k.r))break}return s}
function hySeg(x,y,a,len,px,py){const ca=Math.cos(a),sa=Math.sin(a),u=clamp((px-x)*ca+(py-y)*sa,0,len);return{d:Math.hypot(px-(x+ca*u),py-(y+sa*u)),u}}
// does the line from (x0,y0) to (x1,y1) touch an obstacle?
function hyBlocked(x0,y0,x1,y1){const d=Math.hypot(x1-x0,y1-y0);for(let s=10;s<d-6;s+=6){const px=x0+(x1-x0)*s/d,py=y0+(y1-y0)*s/d;if(G.rocks.some(k=>Math.hypot(k.x-px,k.y-py)<k.r))return true}return false}
// a free point for something on the floor (a stain, a point that boils): inside the room, away from the obstacles and from the others
function hyFree(x,y,away,taken,min){const ok=(tx,ty)=>tx>=L+20&&tx<=R-20&&ty>=TOP+24&&ty<=BOT-20&&!G.rocks.some(k=>Math.hypot(k.x-tx,k.y-ty)<k.r+away)&&(taken||[]).every(q=>Math.hypot(q.x-tx,q.y-ty)>=(min||40));
  if(ok(x,y))return{x,y};for(let i=0;i<28;i++){const a=i*2.39996,d=8+i*3,tx=clamp(x+Math.cos(a)*d,L+20,R-20),ty=clamp(y+Math.sin(a)*d,TOP+24,BOT-20);if(ok(tx,ty))return{x:tx,y:ty}}return null}
// a pool of venom where a ball lands or a head sinks: 5 s (6 in the second phase), at most six (the oldest dries)
function hyPool(x,y,p2){const B=hyB(),live=B.pools.filter(q=>!q.dry);if(live.length>=6){live.sort((a,b)=>a.t-b.t);live[0].dry=.001}B.pools.push({x,y,r:26,t:0,life:p2?6:5,p2:!!p2,boil:0,dry:0})}
function hyRipples(){for(const p of G.puddles||[])G.ripples.push({x:p.x,y:p.y,r:3,max:p.rx,a:.9})}
// the gurgle that climbs with the venom (its «tum-tum», on the boss's time)
function hyGlu(e,k){try{if(!AU.ctx||!AU.on.sfx||AU.ctx.state!=='running')return;const t=AU.ctx.currentTime+.01,v=Math.max(.4,enemyAt(e));
  for(let i=0;i<3;i++)fNoise(t+i*.085,.07,'bandpass',VR(260+k*260+i*90,.08),7,.11*v);AU.pan=0}catch(err){}}
// ---- the brain
function hyWalk(e){e.wt=0;b3go(e,'walk',e.p2?rand(.7,.9):rand(1,1.3))}
function hyNext(e){const B=hyB(),seq=e.p2?HY2.seq2:HY2.seq1;let nx=seq[(e.si=(e.si==null?-1:e.si)+1)%seq.length];
  if(nx==='A')nx=Math.hypot(P.x-e.x,P.y-e.y)<165?'bite':'spit';
  if(nx==='decree'&&B.pools.filter(q=>!q.dry).length<2)nx='spit';
  hyStart(e,nx)}
function hyStart(e,st){const B=hyB(),a=Math.atan2(P.y-e.y,P.x-e.x);e.lf=a;e.tg=null;e.tg2=null;e.sweep=0;
  if(st==='bite'){const ux=Math.cos(a),uy=Math.sin(a),pxx=-uy,pyy=ux,fit=(x,y)=>{const d=Math.hypot(x-e.x,y-e.y);if(d>190){x=e.x+(x-e.x)*190/d;y=e.y+(y-e.y)*190/d}return{x:clamp(x,L+20,R-20),y:clamp(y,TOP+24,BOT-20)}};
    const m=fit(P.x,P.y),l=fit(P.x+pxx*56,P.y+pyy*56),r=fit(P.x-pxx*56,P.y-pyy*56);B.bite={m:{...m,r:32},l:{...l,r:28},r:{...r,r:28},l2:null,r2:null,p2:!!e.p2};
    e.tg=[[l.x-e.x,l.y-e.y-8],[m.x-e.x,m.y-e.y-8],[r.x-e.x,r.y-e.y-8]];hyGlu(e,0)}
  else if(st==='spit')B.spitN=0;
  else if(st==='ambush'){B.amb={n:0,first:-1,done:false,tDone:-1};e.amP=0;hyRipples()}
  b3go(e,st)}
const hyRage=e=>{const B=hyB();e.p2=true;banner("L'Idra apre il terzo occhio!",'Fase 2',1.6);bossRage(e,HY2.vio);$('bossBar').classList.add('rage');shake(8);
  G.eproj=[];B.globs=[];B.warn=[];B.lanes=null;B.mist=[];B.pops=[];B.boils=[];B.cone=null;B.bite=null;for(const q of B.pools)q.p2=true;e.tg=null;e.tg2=null;b3say(e,'angry');b3go(e,'rage')};
if(HY2ON)EUPD.hydra=function(e,dt,sm,a,d){const sp=e.p2?1.15:1;dt*=sp;const B=hyB(),p2=!!e.p2,real=hySp(e);
  if(!e.p2&&e.hp<e.max*.5&&e.st==='walk'){hyRage(e);return}
  b3tick(e,dt);const k=b3k(e);
  switch(e.st){
  // ---- between the moves: in the first phase it stays in its water and watches you; in the second it swims toward you (to 130 px)
  case 'walk':{e.face=a;let mv=false;if(p2&&d>130){const an=navAngle(e),v=45*dt;const nx=clamp(e.x+Math.cos(an)*v,L+84,R-84),ny=clamp(e.y+Math.sin(an)*v,TOP+84,BOT-84);
      if(Math.hypot(nx-e.x,ny-e.y)>.05){e.x=nx;e.y=ny;mv=true}}e.moving=mv;if(mv)e.wt=(e.wt||0)+dt;
    if(e.stT<=0){e.moving=false;hyNext(e)}break}
  case 'taunt':{e.moving=false;e.face=a;if(e.stT<=0)b3go(e,'walk',rand(.6,1));break}
  // ---- MORSO A TENAGLIA: the side discs fill until .48 (the side heads bite), the middle one until .64 (the middle head); in the second
  // phase two new side discs at .50 by where you are then, full at .95
  case 'bite':{e.moving=false;e.face=e.lf;const T=B.bite;if(!T){b3go(e,'stuck');break}
    if(b3at(e,.08)||b3at(e,.2)||b3at(e,.32))hyGlu(e,k*2);
    if(b3at(e,.48)){for(const s of[T.l,T.r]){if(hyD(P.x,P.y,s.x,s.y)<s.r+P.r*.4&&hyCan())hurtP(Math.round(16*DMG()));stamp('cracks',s.x,s.y,16);dustRing(s.x,s.y,8)}shake(3);sfx('block',0,e.x);vib(30)}
    if(p2&&b3at(e,.5)){const an=Math.atan2(P.y-e.y,P.x-e.x),pxx=-Math.sin(an),pyy=Math.cos(an),fit=(x,y)=>({x:clamp(x,L+20,R-20),y:clamp(y,TOP+24,BOT-20),r:28});
      T.l2=fit(P.x+pxx*56,P.y+pyy*56);T.r2=fit(P.x-pxx*56,P.y-pyy*56);e.tg2=[[T.l2.x-e.x,T.l2.y-e.y-8],[T.r2.x-e.x,T.r2.y-e.y-8]];sfx('hiss',0,e.x)}
    if(b3at(e,.64)){const m=T.m;if(hyD(P.x,P.y,m.x,m.y)<m.r+P.r*.4&&hyCan())hurtP(Math.round(22*DMG()));stamp('cracks',m.x,m.y,22);dustRing(m.x,m.y,12);shake(6);sfx('boom',0,m.x);vib([40,30,60]);
      if(BOSS2){ENV2.rocks(m.x,m.y,120,1);ENV2.fall(B3N(4))}}
    if(p2&&b3at(e,.95)&&T.l2){for(const s of[T.l2,T.r2]){if(hyD(P.x,P.y,s.x,s.y)<s.r+P.r*.4&&hyCan())hurtP(Math.round(16*DMG()));stamp('cracks',s.x,s.y,14)}shake(3);sfx('block',0,e.x)}
    if(e.stT<=0)b3go(e,'stuck');break}
  case 'stuck':{e.moving=false;e.face=e.lf;if(b3at(e,.8)){const m=B.bite&&B.bite.m;if(m){dustRing(m.x,m.y,10);vfxBlast(m.x,m.y,'200,190,170',40,{debris:'stone',n:8,dust:6})}sfx('rock',0,e.x)}
    if(e.stT<=0){B.bite=null;e.tg=null;e.tg2=null;hyWalk(e)}break}
  // ---- SALVA DI VENENO: balls from the real mouths (left .30, middle .42, right .54; in the second phase also .66 and .74)
  case 'spit':{e.moving=false;e.face=a;const T=p2?[[.30,0],[.42,1],[.54,2],[.66,0],[.74,2]]:[[.30,0],[.42,1],[.54,2]];
    for(const[t0,who] of T){if(b3at(e,t0-.24))hyGlu(e,.4+who*.3);if(!b3at(e,t0))continue;const M=hyMouths(e),mo=M&&M[who],n=B.spitN++||0;
      const vx=P.vxs||0,vy=P.vys||0,sd=Math.random()<.5?-1:1,an=Math.atan2(P.y-e.y,P.x-e.x),px0=-Math.sin(an),py0=Math.cos(an);B.sd=B.sd||sd;
      let tx=P.x,ty=P.y;if(n===1){tx+=vx*.5;ty+=vy*.5}else if(n===2){tx+=px0*40*B.sd;ty+=py0*40*B.sd}else if(n===3){tx+=vx*.5-px0*40*B.sd;ty+=vy*.5-py0*40*B.sd}
      tx=clamp(tx,L+16,R-16);ty=clamp(ty,TOP+20,BOT-16);const fx0=mo?mo.f.x:e.x,fy0=mo?mo.f.y:e.y,z0=mo?Math.max(0,mo.f.y-mo.m.y):60;
      B.globs.push({x0:fx0,y0:fy0,z0,x1:tx,y1:ty,t:0,dur:.9,p2,x:fx0,y:fy0,z:z0,vx:0,vy:0});B.warn.push({k:'glob',x:tx,y:ty,r:26,t:.9,max:.9});sfx('eshot','poison',fx0)}
    if(e.stT<=0){B.sd=0;hyWalk(e)}break}
  // ---- SOFFIO VELENOSO: three strips from under the mouths (.02), full from .30, the mist runs along them from .40 to .85
  case 'breath':{e.moving=false;e.face=e.lf;
    if(b3at(e,.02)){const M=hyMouths(e),L0=[];[-25,0,25].forEach((dg,i)=>{const mo=M&&M[i],x=mo?mo.f.x:e.x,y=mo?mo.f.y:e.y+10,an=e.lf+dg*Math.PI/180;L0.push({x,y,a:an,a0:an,len:hyReach(x,y,an,380)})});
      const vx=P.vxs||0,vy=P.vys||0,cr=Math.cos(e.lf)*vy-Math.sin(e.lf)*vx;B.lanes={L:L0,front:0,hit:false,on:false,p2,dir:Math.abs(cr)>8?Math.sign(cr):(Math.random()<.5?-1:1),sw:0};hyGlu(e,0);sfx('creep',1,e.x)}
    const Ls=B.lanes;if(Ls){if(k>=.3)Ls.on=true;
      if(p2){const sw=Ls.dir*14*Math.PI/180*C3.sstep(.4,.85,k);Ls.sw=sw;e.sweep=sw;for(const l of Ls.L){l.a=l.a0+sw;l.len=hyReach(l.x,l.y,l.a,380)}}
      if(k>=.4&&k<.85){if(!Ls.jet){Ls.jet=1;shake(4);sfx('hiss',0,e.x);if(BOSS2){ENV2.torches(['#9be05a','#d8ffb0','#ffffff'],HY2.lime,1);for(const l of Ls.L){for(let s=40;s<l.len;s+=60){const px=l.x+Math.cos(l.a)*s,py=l.y+Math.sin(l.a)*s;ENV2.mark('toxic',px,py,24);ENV2.wiltGrass(px,py,26)}}}}
        Ls.front=Math.min(380,Ls.front+700*dt/real);
        if(!Ls.hit&&hyCan())for(const l of Ls.L){const q=hySeg(l.x,l.y,l.a,Math.min(l.len,Ls.front),P.x,P.y);if(q.d<13+P.r*.5&&q.u>2){Ls.hit=true;hurtP(Math.round(18*DMG()));break}}}}
    if(e.stT<=0){B.lanes=null;e.sweep=0;hyWalk(e)}break}
  // ---- AGGUATO DAL PROFONDO: the model goes to .35 (the heads under from .30), then turns round .35-.65 while the three heads come out of
  // the floor under you (left, right, middle: the first at .30, the others every .8 s, .45 in the second phase), then .65-1
  case 'ambush':{e.moving=false;e.face=a;const D=B3D(e,'ambush'),A2=B.amb,mt=e.mt||0;if(!A2){hyWalk(e);break}
    if(A2.first<0&&mt>=.3*D){A2.first=mt;A2.nextT=0}
    if(A2.first>=0&&A2.n<3&&A2.nextT<=0){const who=[-1,1,0][A2.n],q=hyFree(P.x,P.y,22,B.pops,40)||{x:P.x,y:P.y};
      B.pops.push({x:q.x,y:q.y,who,t:0,fol:p2?.25:.3,p2,hit:false});A2.n++;A2.nextT=p2?.45:.8;sfx('creep',1,q.x)}
    if(A2.first>=0&&A2.n<3)A2.nextT-=dt/real;
    if(!A2.done&&A2.n>=3&&!B.pops.length){A2.done=true;A2.tDone=mt}
    if(mt<.35*D)e.amP=mt/D;else if(!A2.done)e.amP=.35+(((mt-.35*D)%(.3*D))+.3*D)%(.3*D)/D;else e.amP=Math.min(.999,.65+(mt-A2.tDone)/D);
    if(A2.done&&e.amP>=.999||mt>D*6){B.amb=null;B.pops=[];hyWalk(e)}
    if(Math.random()<dt*1.5)hyRipples();break}
  // ---- IL GIUDIZIO DELLA PALUDE: the first slap (.30) makes its pools boil and a ring of points round you; the nod (.71): geysers
  case 'decree':{e.moving=false;e.face=a;
    if(b3at(e,.08))hyGlu(e,.2);
    if(b3at(e,.3)){const taken=[];for(const q of B.pools)if(!q.dry){q.boil=1;taken.push(q)}const ring=(n,r,lag)=>{const a0=Math.random()*TAU;for(let i=0;i<n;i++){if(taken.length>=11)break;const an=a0+i/n*TAU,x=P.x+Math.cos(an)*r,y=P.y+Math.sin(an)*r*HY2.K;
        if(x<L+16||x>R-16||y<TOP+20||y>BOT-16||G.rocks.some(k2=>Math.hypot(k2.x-x,k2.y-y)<k2.r+20))continue;const b={x,y,r:24,lag,t:0};taken.push(b);B.boils.push(b)}};
      ring(5,80,0);if(p2)ring(7,140,.55);sfx('splash',1,e.x);shake(2);hyRipples()}
    if(b3at(e,.45)){sfx('splash',1,e.x);shake(2)}
    if(b3at(e,.71)){sfx('boom',0,e.x);shake(5);const go=(x,y,r,lag,p)=>B.geys.push({x,y,r,t:-lag,dur:1.05,hit:false,p2});
      for(const q of B.pools)if(!q.dry&&q.boil){go(q.x,q.y,q.r,0);q.dry=.001;q.boil=0}for(const b of B.boils)go(b.x,b.y,b.r,b.lag);B.boils=[];if(BOSS2)ENV2.fall(B3N(5))}
    if(e.stT<=0){for(const q of B.pools)q.boil=0;B.boils=[];hyWalk(e)}break}
  // ---- TUFFO: hidden from .50 of the dive; under the floor its lights swim to the new place (1 s), the water opens there (.6 s after,
  // with the warning for .9 s), then it comes up (rise): the blow at .20, the wave (and in the second phase the drops)
  case 'dive':{e.moving=false;e.face=a;if(b3at(e,.5)){e.hidden=true;sfx('splash',1,e.x);hyRipples();if(BOSS2)ENV2.splash(e.x,e.y,16,'#cfe9d8')}
    if(e.stT<=0){e.alpha=0;e.hidden=true;let best=null,bd=-1;for(let i=0;i<20;i++){const x=rand(L+84,R-84),y=rand(TOP+84,BOT-84),dd=Math.hypot(x-P.x,y-P.y);
        if(G.rocks.some(k2=>Math.hypot(k2.x-x,k2.y-y)<k2.r+60))continue;if(Math.abs(x-AW/2)<70&&y<TOP+110)continue;if(dd>=140&&dd<=240){best={x,y};break}if(dd>bd){bd=dd;best={x,y}}}
      best=best||{x:e.x,y:e.y};B.dv={x0:e.x,y0:e.y,x1:best.x,y1:best.y,t:0,p2};b3go(e,'under',1.5*real)}break}
  case 'under':{e.moving=false;e.alpha=0;e.hidden=true;const V=B.dv;if(V&&V.t>=1.5||!V||e.stT<=-1){if(V){e.x=V.x1;e.y=V.y1}B.dv=null;e.alpha=1;e.hidden=false;b3go(e,'rise');sfx('splash',2,e.x)}break}
  case 'rise':{e.moving=false;e.face=a;e.alpha=1;e.hidden=false;
    if(b3at(e,.2)){if(hyD(P.x,P.y,e.x,e.y)<60+P.r*.4&&hyCan())hurtP(Math.round(24*DMG()));G.waves.push({x:e.x,y:e.y,r:e.r,max:200,dmg:Math.round(14*DMG()),hit:false,rgb:HY2.lime});
      if(p2){for(let i=0;i<16;i++)shootE(e.x,e.y-14,i*TAU/16,135,6,10,'hyglob')}hyRipples();shake(8);sfx('roar',0,e.x);vib([50,30,70]);
      vfxBlast(e.x,e.y,'120,200,140',100,{sparks:12,spcol:['#c8f0d8','#7bd6a0','#ffffff'],dust:0,debris:['#3f7a4a','#2a5a34','#8fd0a8'],n:16});if(BOSS2){ENV2.rocks(e.x,e.y,140,1);ENV2.splash(e.x,e.y,22,'#cfe9d8')}}
    if(e.stT<=0)hyWalk(e);break}
  // ---- SGUARDO DEL TERZO OCCHIO (second phase): the cone from under the middle mouth (.05); at the flash (.55) whoever is in it, not behind
  // an obstacle and not dashing, is spellbound (slow) for 1.3 s; the dash breaks the spell
  case 'gaze':{e.moving=false;e.face=e.lf;if(b3at(e,.05)){const M=hyMouths(e),mo=M&&M[1];B.cone={x:mo?mo.f.x:e.x,y:mo?mo.f.y:e.y+10,a:e.lf,len:300,half:22*Math.PI/180,t:0}}
    if(b3at(e,.55)&&B.cone){const C=B.cone,dx=P.x-C.x,dy=P.y-C.y,dd=Math.hypot(dx,dy),da=Math.abs(Math.atan2(Math.sin(Math.atan2(dy,dx)-C.a),Math.cos(Math.atan2(dy,dx)-C.a)));
      fxPush({k:'flash',x:e.x,y:e.y-90,r:80,rgb:HY2.vio,t:.25,max:.25});sfx('shimmer',0,e.x);
      if(dd<C.len&&da<C.half&&!hyBlocked(C.x,C.y,P.x,P.y)&&P.dashT<=0){B.charm=1.3;text(P.x,P.y-46,'Incantato!','#e2aaff',16);sfx('magic',0,P.x)}}
    if(e.stT<=0){B.cone=null;hyWalk(e)}break}
  // ---- APRE IL TERZO OCCHIO: no blows; clic, clic, CLIC (.42 .50 .58), the hands on the stone (.72), the roar (.78)
  case 'rage':{e.moving=false;e.face=a;
    for(const t0 of[.42,.5,.58])if(b3at(e,t0))sfx('click',0,e.x);
    if(b3at(e,.72)){shake(8);for(const sd of[-1,1]){const x=e.x+Math.cos(a+sd*1.1)*58,y=e.y+Math.sin(a+sd*1.1)*36;stamp('cracks',x,y,18);dustRing(x,y,8)}sfx('rock',0,e.x)}
    if(b3at(e,.78)){vib([60,40,120]);for(let i=0;i<3;i++)setTimeout(()=>{if(G&&G.fx)fxPush({k:'ring2',x:e.x,y:e.y-e.r,rgb:HY2.vio,r0:e.r,r1:e.r*5,t:.45,max:.45,w:6-i*1.5})},i*170);
      if(BOSS2)ENV2.torches(['#9a52d8','#e2aaff','#fff4ff'],HY2.vio,999)}
    if(e.stT<=0){e.si=-1;e.press=0;hyNext(e)}break}
  default:hyWalk(e)}};
// the head nailed to the floor: the blows hurt more (and the first time in the run, the words)
{const _h=hurtE;hurtE=function(e,d){if(HY2ON&&e&&e.type==='hydra'&&e.st==='stuck'){const A=[...arguments];A[1]=d*1.5;if(!G.hytxt){G.hytxt=1;text(e.x,e.y-130,'Colpo alla testa!','#ffd84a',18)}return _h.apply(this,A)}return _h.apply(this,arguments)}}
// its own arena reactions (the old ones of today go)
{const _r=b2react;b2react=function(e){if(HY2ON&&e&&e.type==='hydra')return;return _r.apply(this,arguments)}}
// the call (the mocking when you stay far) shows the hand that beckons
{const _t=b3taunt;b3taunt=function(e,k){if(e&&e.type==='hydra')e.call=k==='laugh2';return _t.apply(this,arguments)}}
// ---- the dangers in flight and on the floor (real time)
function hyUpdate(dt){const B=G.hy;if(!B)return;if(G.state!=='play'){if(B.globs.length||B.pops.length||B.geys.length)hyReset();return}
  for(let i=B.warn.length-1;i>=0;i--){B.warn[i].t-=dt;if(B.warn[i].t<=0)B.warn.splice(i,1)}
  // the balls of venom: 0.9 s in the air, an arc 100 high; where they land, 13 in the disc and a pool
  for(let i=B.globs.length-1;i>=0;i--){const g=B.globs[i];g.t+=dt;const u=Math.min(1,g.t/g.dur),px=g.x,py=g.y;g.x=g.x0+(g.x1-g.x0)*u;g.y=g.y0+(g.y1-g.y0)*u;g.z=g.z0*(1-u)+100*Math.sin(Math.PI*u);g.vx=(g.x-px)/Math.max(1e-4,dt);g.vy=(g.y-py)/Math.max(1e-4,dt);
    if(u>=1){B.globs.splice(i,1);if(hyD(P.x,P.y,g.x1,g.y1)<26+P.r*.4&&hyCan())hurtP(Math.round(13*DMG()));hyPool(g.x1,g.y1,g.p2);sfx('splash',0,g.x1);
      vfxBlast(g.x1,g.y1,g.p2?'199,125,255':'150,230,90',36,{sparks:8,dust:0,n:6,debris:g.p2?['#c77dff','#9a52d8']:['#9be05a','#6fbf3a']})}}
  // the pools: 5 every 0.5 s to whoever stands in them (never while dashing); they dry up and go
  for(let i=B.pools.length-1;i>=0;i--){const q=B.pools[i];q.t+=dt;if(q.dry>0){q.dry+=dt/.6;if(q.dry>=1)B.pools.splice(i,1);continue}if(q.t>=q.life){q.dry=.001;continue}
    if(Math.hypot(P.x-q.x,(P.y-q.y)/.55)<q.r*.9&&P.dashT<=0&&P.poisonCd<=0&&G.state!=='dead'){G.bossDmg=true;P.poisonCd=.5;P.hp-=5;text(P.x,P.y-40,'-5','#b06ad8',13);if(P.hp<=0)die()}}
  // the geysers: 16 to whoever is inside in their first 0.35 s
  for(let i=B.geys.length-1;i>=0;i--){const g=B.geys[i];g.t+=dt;if(g.t<0)continue;if(!g.snd){g.snd=1;sfx('splash',1,g.x);stamp('scorch',g.x,g.y,12)}
    if(!g.hit&&g.t<.35&&hyD(P.x,P.y,g.x,g.y)<g.r+P.r*.4&&hyCan()){g.hit=true;hurtP(Math.round(16*DMG()))}if(g.t>=g.dur)B.geys.splice(i,1)}
  // the heads of the Agguato: the stain follows you, stops, the disc fills (0.6 s), the head bursts out (18, the middle one 22), stays 0.5 s,
  // sinks in 0.2 s and leaves a pool
  for(let i=B.pops.length-1;i>=0;i--){const q=B.pops[i];q.t+=dt;if(q.t<q.fol){const dx=P.x-q.x,dy=P.y-q.y,dd=Math.hypot(dx,dy),st=Math.min(dd,160*dt);if(dd>1){const nx=q.x+dx/dd*st,ny=q.y+dy/dd*st,f=hyFree(nx,ny,22,B.pops.filter(z=>z!==q),40);if(f){q.x=f.x;q.y=f.y}}}
    const tb=q.fol+.6;if(!q.burst&&q.t>=tb){q.burst=1;if(hyD(P.x,P.y,q.x,q.y)<(q.who===0?34:28)+P.r*.4&&hyCan())hurtP(Math.round((q.who===0?22:18)*DMG()));stamp('cracks',q.x,q.y,16);shake(4);sfx('splash',1,q.x);sfx('block',0,q.x);
      if(BOSS2)ENV2.splash(q.x,q.y,14,'#cfe9d8')}
    if(q.t>=tb+.7){B.pops.splice(i,1);hyPool(q.x,q.y,q.p2)}}
  if(B.dv)B.dv.t+=dt;
  // the spell of the gaze: slow as in the mud until it ends or you dash
  if(B.charm>0){B.charm-=dt;if(P.dashT>0)B.charm=0;else P.mire=Math.max(P.mire||0,.12)}}
{const _u=update;update=function(dt){_u.apply(this,arguments);try{if(HY2ON&&G&&G.hy&&started&&!paused)hyUpdate(dt)}catch(err){console.error(err)}}}
// the drops of the second phase rise: small balls of violet venom
if(HY2ON){const _de=typeof drawEproj==='function'?drawEproj:null;if(_de){drawEproj=function(p){if(p&&p.kind==='hyglob'&&N3.hydra2Glob){try{N3.hydra2Glob(p.x,p.y,6,4,1,{p2:true,vx:p.vx,vy:p.vy});return}catch(err){}}return _de.apply(this,arguments)}}}
// ---- on the floor: the pools, the warnings (discs that fill with a growing shadow and a flashing rim), the strips of the breath, the cone of
// the gaze, the points that boil, the stains of the Agguato, the lights under the floor and the stain where it comes up
function hyDisc(x,y,r,k,pu,col){col=col||HY2.red;ctx.fillStyle=`rgba(${col},${.1+.22*k})`;ell(x,y,r*Math.max(.05,k),r*Math.max(.05,k)*HY2.K);ctx.fill();ctx.strokeStyle=`rgba(${col},${pu})`;ctx.lineWidth=2.4;ell(x,y,r,r*HY2.K);ctx.stroke();
  ctx.fillStyle=`rgba(0,0,0,${.12+.28*k})`;ell(x,y,r*(.3+.7*k)*.8,r*(.3+.7*k)*.42);ctx.fill()}
function hyGround(){const B=G.hy;if(!B)return;const e=G.enemies&&G.enemies.find(q=>q.type==='hydra'&&!q.dead),t=G.t||0,pu=.55+.3*Math.sin(t*18),red=HY2.red,Pool=N3.hydra2Pool;
  for(const q of B.pools){const k=q.dry>0?1-q.dry:Math.min(1,q.t/.25),life=q.dry>0?.999:Math.min(.999,q.t/q.life);if(Pool){try{Pool(q.x,q.y,q.r,q.dry>0?.999-.2*(1-k):Math.max(.05,Math.min(life,.8)),1,{p2:q.p2,boil:q.boil,t});continue}catch(err){}}
    ctx.fillStyle=q.p2?'rgba(154,82,216,.6)':'rgba(111,191,58,.6)';ell(q.x,q.y,q.r,q.r*.55);ctx.fill()}
  for(const b of B.boils){if(Pool){try{Pool(b.x,b.y,b.r,.5,1,{p2:e&&e.p2,boil:1,t})}catch(err){}}ctx.strokeStyle=`rgba(${red},${pu})`;ctx.lineWidth=2.2;ell(b.x,b.y,b.r,b.r*HY2.K);ctx.stroke()}
  // the bite: the side discs full at .48, the middle at .64 (the second ones of the second phase at .95)
  if(e&&B.bite&&(e.st==='bite')){const k=b3k(e),T=B.bite;if(k<.5)for(const s of[T.l,T.r])hyDisc(s.x,s.y,s.r,Math.min(1,k/.48),pu);if(k<.66)hyDisc(T.m.x,T.m.y,T.m.r,Math.min(1,k/.64),pu);
    if(T.l2&&k>=.5)for(const s of[T.l2,T.r2])hyDisc(s.x,s.y,s.r,Math.min(1,(k-.5)/.45),pu)}
  for(const w of B.warn)if(w.k==='glob')hyDisc(w.x,w.y,w.r,1-w.t/w.max,pu);
  // the strips of the breath: striped, full and flashing from .30 (arrows of the turn in the second phase)
  const Ls=B.lanes;if(Ls)for(const l of Ls.L){ctx.save();ctx.translate(l.x,l.y);ctx.rotate(l.a);const fl=Ls.on?(Math.sin(t*30)>0?.32:.18):.1;ctx.fillStyle=`rgba(${red},${fl})`;ctx.fillRect(0,-13,l.len,26);
    ctx.strokeStyle=`rgba(${red},.75)`;ctx.lineWidth=1.6;if(!Ls.on)ctx.setLineDash([7,6]);ctx.strokeRect(0,-13,l.len,26);ctx.setLineDash([]);
    if(!Ls.on){ctx.strokeStyle=`rgba(${red},.3)`;ctx.lineWidth=3;ctx.beginPath();for(let s=10;s<l.len;s+=16){ctx.moveTo(s,-11);ctx.lineTo(s+8,11)}ctx.stroke()}
    if(Ls.p2&&Ls.on){ctx.fillStyle='rgba(255,255,255,.55)';for(let s=40;s<l.len;s+=70){ctx.beginPath();ctx.moveTo(s,Ls.dir*-9);ctx.lineTo(s+10,0);ctx.lineTo(s,Ls.dir*9);ctx.closePath();ctx.fill()}}ctx.restore()}
  // the cone of the gaze: a dashed border, violet rings coming toward you, the shadow behind every obstacle
  if(B.cone&&e){const C=B.cone,k=Math.min(1,b3k(e)/.55);ctx.save();ctx.beginPath();ctx.moveTo(C.x,C.y);ctx.arc(C.x,C.y,C.len,C.a-C.half,C.a+C.half);ctx.closePath();ctx.fillStyle=`rgba(${HY2.vio},${.08+.12*k})`;ctx.fill();
    ctx.strokeStyle=`rgba(${red},${pu})`;ctx.lineWidth=2;ctx.setLineDash([8,6]);ctx.stroke();ctx.setLineDash([]);ctx.clip();
    for(let i=0;i<4;i++){const r=((t*.9+i/4)%1)*C.len;ctx.strokeStyle=`rgba(${HY2.vio},${.5*(r/C.len)})`;ctx.lineWidth=2;ctx.beginPath();ctx.arc(C.x,C.y,r,C.a-C.half,C.a+C.half);ctx.stroke()}
    ctx.fillStyle='rgba(8,4,14,.35)';for(const r of G.rocks){const dx=r.x-C.x,dy=r.y-C.y,dd=Math.hypot(dx,dy);if(dd>C.len||dd<r.r)continue;const an=Math.atan2(dy,dx),w=Math.asin(Math.min(1,r.r/dd));
      ctx.beginPath();ctx.moveTo(C.x+Math.cos(an-w)*dd,C.y+Math.sin(an-w)*dd);ctx.lineTo(C.x+Math.cos(an-w)*C.len*1.2,C.y+Math.sin(an-w)*C.len*1.2);ctx.lineTo(C.x+Math.cos(an+w)*C.len*1.2,C.y+Math.sin(an+w)*C.len*1.2);ctx.lineTo(C.x+Math.cos(an+w)*dd,C.y+Math.sin(an+w)*dd);ctx.closePath();ctx.fill()}
    ctx.restore()}
  // the Agguato: the stain under you (with the eyes), its disc that fills
  for(const q of B.pops){const tb=q.fol+.6;if(q.t>=q.fol&&q.t<tb)hyDisc(q.x,q.y,q.who===0?34:28,(q.t-q.fol)/.6,pu);if(N3.hydra2Head){try{N3.hydra2Head(q.x,q.y,Math.atan2(P.y-q.y,P.x-q.x),'burst',hyPopP(q),1,{who:q.who,p2:q.p2,part:'stain'})}catch(err){}}}
  // the Tuffo: its lights under the floor, then the water that opens with the warning (six marks round the disc, the ring of the wave)
  const V=B.dv;if(V){const u=Math.min(1,V.t/1);if(u<1&&N3.hydra2Under){try{N3.hydra2Under(V.x0+(V.x1-V.x0)*C3.ez(u),V.y0+(V.y1-V.y0)*C3.ez(u),Math.atan2(V.y1-V.y0,V.x1-V.x0),(V.t/.6)%1,1,{p2:V.p2})}catch(err){}}
    if(V.t>=.6){const k=Math.min(1,(V.t-.6)/.9);if(N3.hydra2Stain){try{N3.hydra2Stain(V.x1,V.y1,Math.min(1,k*1.6),1,{p2:V.p2,t})}catch(err){}}hyDisc(V.x1,V.y1,60,k,pu);
      ctx.strokeStyle=`rgba(${red},.85)`;ctx.lineWidth=3;ctx.lineCap='round';for(let i=0;i<6;i++){if(k<i/6)continue;const an=i/6*TAU-Math.PI/2;ctx.beginPath();ctx.moveTo(V.x1+Math.cos(an)*56,V.y1+Math.sin(an)*56*HY2.K);ctx.lineTo(V.x1+Math.cos(an)*66,V.y1+Math.sin(an)*66*HY2.K);ctx.stroke()}
      ctx.strokeStyle=`rgba(${red},.4)`;ctx.lineWidth=1.6;ctx.setLineDash([6,8]);ell(V.x1,V.y1,200,200*HY2.K);ctx.stroke();ctx.setLineDash([])}}}
// the model's p of a head of the Agguato: the burst falls at .56, it stays up to .875, sinks to 1
function hyPopP(q){const tb=q.fol+.6;return q.t<tb?.56*q.t/tb:q.t<tb+.5?.56+(q.t-tb)/.5*.315:Math.min(.999,.875+(q.t-tb-.5)/.2*.125)}
// in the air: the balls in flight, the heads out of the floor, the geysers, the mist of the breath
function hyAir(){const B=G.hy;if(!B)return;const t=G.t||0,Gl=N3.hydra2Glob,Gy=N3.hydra2Geyser;
  for(const g of B.globs){if(Gl){try{Gl(g.x,g.y,g.z,7,1,{p2:g.p2,vx:g.vx,vy:g.vy});continue}catch(err){}}ctx.fillStyle='#9be05a';circ(g.x,g.y-g.z,7);ctx.fill()}
  for(const q of B.pops)if(q.t>=q.fol+.5&&N3.hydra2Head){try{N3.hydra2Head(q.x,q.y,Math.atan2(P.y-q.y,P.x-q.x),'burst',hyPopP(q),1,{who:q.who,p2:q.p2,part:'head'})}catch(err){}}
  for(const g of B.geys){if(g.t<0)continue;if(Gy){try{Gy(g.x,g.y,Math.min(.999,g.t/g.dur),g.r,1,{p2:g.p2});continue}catch(err){}}}
  const Ls=B.lanes;if(Ls&&Ls.jet&&!LOWFX){const e=G.enemies.find(q=>q.type==='hydra'&&!q.dead),k=e?b3k(e):1;if(k<.87)for(const l of Ls.L){const fr=Math.min(l.len,Ls.front);for(let s=8;s<fr;s+=18){const w=(s/fr),j=Math.sin(s*.3+t*9)*3;
      ctx.fillStyle=`rgba(${Ls.p2?HY2.vio:HY2.lime},${.32*(1-w*.5)})`;circ(l.x+Math.cos(l.a)*s-Math.sin(l.a)*j,l.y+Math.sin(l.a)*s+Math.cos(l.a)*j-6,7+w*9);ctx.fill()}}}}
{const _g2=drawHazards2Ground;drawHazards2Ground=function(){_g2.apply(this,arguments);try{if(HY2ON)hyGround()}catch(err){}}}
{const _a2=drawHazards2Air;drawHazards2Air=function(){_a2.apply(this,arguments);try{if(HY2ON)hyAir()}catch(err){}}}
// ---- the entrance (4.2 s, the model's 'enter'): its black water turns, six gold eyes open under it, the fans come up, then the heads, the
// hands on the rim, the back with a wave, the roar in three voices, the heads tilt together
if(HY2ON){const _bi=bossIntro;bossIntro=function(e,dt,a){if(e.type!=='hydra')return _bi.apply(this,arguments);
  const T=BOSS_INTRO.hydra;if(e.iT==null){e.iT=0;if(G.swampPool){e.x=G.swampPool.x;e.y=G.swampPool.y-8}e.heads=null}const t0=e.iT;e.iT+=dt;const t=e.iT,at=s=>t0<s&&t>=s;
  e.intro=Math.max(0,T-t);e.face=a;e.st='enter';e.z=0;e.em=null;e.hole=0;e.hidden=t<2.8;e.alpha=1;
  if(at(.02))sfx('creep',1,e.x);if(at(.8))sfx('shimmer',0,e.x);if(at(1.3)){sfx('splash',0,e.x);if(BOSS2)ENV2.splash(e.x,e.y-20,8,'#cfe9d8')}
  for(const s of[2.6,2.75])if(at(s)){shake(2);sfx('splash',0,e.x);if(BOSS2)ENV2.splash(e.x+(s<2.7?-50:50),e.y+18,8,'#cfe9d8')}
  if(at(2.8)){shake(7);sfx('splash',2,e.x);vfxBlast(e.x,e.y,'120,200,140',90,{sparks:10,dust:0,n:12,debris:['#3f7a4a','#2a5a34','#8fd0a8']});hyRipples();if(BOSS2)ENV2.splash(e.x,e.y,20,'#cfe9d8')}
  if(at(3.4)){if(!b3say(e,'cry'))sfx('roar');shake(6);vib([60,40,120]);for(let i=0;i<3;i++)setTimeout(()=>{if(G&&G.fx)fxPush({k:'ring2',x:e.x,y:e.y,rgb:'200,240,210',r0:30,r1:110,t:.5,max:.5,w:5-i*1.2})},i*160)}
  if(at(4))sfx('click',0,e.x);
  if(e.intro<=0){e.z=0;e.si=-1;e.hidden=false;hyWalk(e);e.stT=.9}}}
// what the model plays: the entrance over its whole length; every move on the brain's clock; the Agguato as its brain turns it
if(HY2ON){const _nm=n3Move;n3Move=function(e){if(e.type==='hydra'){if(e.intro>0)return['enter',Math.min(.999,Math.max(0,(e.iT||0)/BOSS_INTRO.hydra))];
    if(e.st==='ambush')return['ambush',Math.min(.999,Math.max(0,e.amP||0))];
    if(e.st&&e.st!=='walk'&&e.st!=='under'&&N3.meta.hydra.an.includes(e.st))return[e.st,Math.min(.999,Math.max(0,b3k(e)))]}return _nm.apply(this,arguments)}}
// ---- the defeat (4 s, the model's 'die'): it falls asleep and the swamp heals
if(HY2ON){const _sb=snapBoss;snapBoss=function(e){if(e.type==='hydra')return{live:1};return _sb.apply(this,arguments)}
  BDIE.hydra={setup(c){const e=c.e;c.face=e.f3!=null?e.f3:(e.face||Math.PI/2);c.p2=!!e.p2;c.live=1;sfx('bubble',0,c.x);const B=G.hy;if(B){B.globs=[];B.pops=[];B.geys=[];B.boils=[];B.lanes=null;B.cone=null;B.warn=[];B.bite=null}},
    tick(c,dt,D){const p=Math.min(1,c.t/c.dur),B=G.hy;if(Math.random()<(LOWFX?.15:.4)*dt*10)cpart(c,{k:'bubble',x:c.x+rand(-40,40),y:c.y+rand(-6,10),vz:rand(10,20),life:rand(.5,.9),r:rand(2,3.5)});
      if(B&&c.t>=2.4)for(const q of B.pools)if(!q.dry)q.dry=.001;if(p>.6&&!c.clou){c.clou=1;sfx('splash',1,c.x);hyRipples()}},
    draw(c,D){const p=Math.min(.999,c.t/c.dur),M=N3.meta.hydra;try{N3.hydra(c.x,c.y+8,c.face,'die',p,(M&&M.sc)||1,{p2:c.p2,noFx:LOWFX})}catch(err){}}};
  const _dc=drawCorpse;drawCorpse=function(c){if(c.type!=='hydra')return _dc.apply(this,arguments);try{BDIE.hydra.draw(c,BDEATH.hydra)}catch(err){}drawParts(c)}}
// ---- the voice and the personality (88-boss3-voci.js): three voices hissing in harmony, like a choir (the same clip at 1, 1.19 and 0.84)
if(HY2ON){
  const ss=(n,t0,step,d,fa,fb,v,o)=>[...Array(n)].map((_,i)=>{const f=fa+(fb-fa)*i/Math.max(1,n-1);return{t:t0+i*step,d,f:[f*1.05,f*.95],v,a:1-i*.05,h:.45,hs:.5,...(o||{})}});
  B3VO.VB.hydra={base:{br:.55,ro:.18,ji:.08,lp:.5,hs:.35},k:{
    cry:[[2.1,[{t:0,d:.5,noise:1,v:'h',a:.6,hs:.8},{t:.42,d:1.5,f:[150,205,170],v:['u','a','o'],h:.1,vib:[.03,5],gu:.35,rel:.4},{t:1.85,d:.24,noise:1,v:'h',hs:.9,a:.5}],.62]],
    angry:[[2,[{t:0,d:.36,f:[180,150],v:'a',ro:.5,ji:.3},{t:.4,d:.08,noise:1,v:'h'},{t:.55,d:.08,noise:1,v:'h'},{t:.7,d:.08,noise:1,v:'h'},{t:.86,d:1.1,f:[165,230,150],v:['a','o'],ro:.45,vib:[.04,6],rel:.35}],.64]],
    laugh:[[1.15,[...ss(3,0,.32,.26,220,180,'a'),{t:.95,d:.2,noise:1,v:'h',hs:.9,a:.6}],.52]],
    laugh2:[[1.1,[{t:0,d:.5,f:[130,140],v:'m',am:[.4,6]},{t:.55,d:.5,noise:1,v:'h',hs:.95,a:.7}],.5]],
    hurt:[[.32,[{t:0,d:.08,noise:1,v:'h',hs:.9},{t:.1,d:.08,noise:1,v:'h',hs:.9},{t:.2,d:.1,f:[240,200],v:'i',hs:.5}],.48]],
    c_bite:[[.62,[{t:0,d:.14,noise:1,v:'h',hs:.4,a:.7},{t:.2,d:.1,f:[230,190],v:'a',ro:.4},{t:.34,d:.1,f:[230,190],v:'a',ro:.4},{t:.48,d:.14,f:[260,170],v:'a',ro:.5}],.5]],
    c_spit:[[.7,[{t:0,d:.4,f:[120,200],v:['u','o'],gu:.9},{t:.42,d:.08,noise:1,v:'u',hs:.3},{t:.53,d:.08,noise:1,v:'u',hs:.3}],.48]],
    c_breath:[[.9,[{t:0,d:.85,noise:1,v:['o','a'],a:.9,hs:.4}],.5]],
    c_ambush:[[.9,[{t:0,d:.25,f:[90,70],v:'u',gu:.9},{t:.3,d:.18,noise:1,v:'h',hs:.9},{t:.5,d:.16,noise:1,v:'h',hs:.85,a:.8},{t:.7,d:.16,noise:1,v:'h',hs:.8,a:.6}],.5]],
    c_decree:[[1,[{t:0,d:.95,f:[110,104],v:['o','u'],vib:[.02,3],rel:.3}],.5]],
    c_dive:[[.6,[{t:0,d:.55,f:[150,90],v:'u',gu:1}],.46]],
    c_gaze:[[1.6,[{t:0,d:.36,f:[262,262],v:'m'},{t:.38,d:.36,f:[311,311],v:'m'},{t:.76,d:.36,f:[294,294],v:'m'},{t:1.14,d:.42,f:[247,247],v:'m',rel:.5}],.46]],
    die:[[2.2,[{t:0,d:1.7,f:[190,150,80],v:['a','o','u'],vib:[.05,3],rel:.6,br:.6},{t:1.6,d:.5,f:[90,70],v:'u',gu:1}],.56]],
    win:[[1.2,[...ss(4,0,.24,.2,210,190,'i',{hs:.7}),{t:.98,d:.2,noise:1,v:'h',hs:.9,a:.5}],.5]]}};
  B3CUE.hydra={bite:'c_bite',spit:'c_spit',breath:'c_breath',ambush:'c_ambush',decree:'c_decree',dive:'c_dive',gaze:'c_gaze'};
  // the other two voices of the choir, a third above and a third below
  {const _m=b3sayMore;b3sayMore=function(e,k,t){if(e.type!=='hydra')return _m.apply(this,arguments);try{const v=Math.max(.55,enemyAt(e))*(B3VX[k]||.75)*.55;B3VO.play('hydra',k,t+.015,v,1.19,.18);B3VO.play('hydra',k,t+.03,v,.84,.18)}catch(err){}
    if(k==='cry'||k==='die'||k==='c_dive'||k==='c_ambush')sfx('bubble',0,e.x)}}
  {const _br=buildRoom;buildRoom=function(){const r=_br.apply(this,arguments);try{const A=G&&G.mode!=='inf'&&!G.daily&&ARENAS[G.arena||0];
    if(A&&BOSSZ[A.boss]==='hydra'||G&&(G.enemies||[]).some(q=>q.type==='hydra'))B3VO.prep('hydra')}catch(err){}return r}}
  {const _s=BDIE.hydra.setup;BDIE.hydra.setup=function(c){_s.apply(this,arguments);b3say(c,'die')}}}
// ---- for the previews (anteprime/mk_boss2.py) and the tests (tests/boss2gioco.js): how to get into its room, its moves, its dangers
if(HY2ON){const R=window.BCL||(window.BCL={});R.hydra={n:"L'Idra della Palude",arena:6,p2:true,
  enter(){G.arena=6;G.chapter=ARENAS[6].ch;G.diff=ARENAS[6].diff;G.bossLvl=null;G.room=ROOMS;G.event=null;buildRoom()},
  moves:['bite','stuck','spit','breath','ambush','decree','dive','rise'],moves2:['rage','gaze'],
  hz(){const B=G.hy||{};return{avvisi:(B.warn||[]).length+(B.bite?3:0),palle:(B.globs||[]).length,pozze:(B.pools||[]).filter(q=>!q.dry).length,geyser:(B.geys||[]).length+(B.boils||[]).length,
    teste:(B.pops||[]).length,strisce:B.lanes?3:0,cono:B.cone?1:0,onde:(G.waves||[]).length,gocce:(G.eproj||[]).filter(p=>p.kind==='hyglob').length}},
  // in the tests the hero goes near it for 8 s (the bite) and back to the bottom for 8 s (the spit): it does not come to you in the first phase
  hero(e){if(!e||e.p2)return null;const near=Math.floor((G.t||0)/8)%2===0;return near?{x:clamp(e.x+30,L+30,R-30),y:clamp(e.y+125,TOP+40,BOT-40)}:{x:AW/2,y:BOT-60}},
  voice:['cry','laugh','angry','die']}}
