// =====================================================================
// LA SALAMANDRA DI LAVA RIFATTA: «la Regina del Vulcano» (Denis, 15 ottobre: «rivisita tutti i boss … possenti, belli, fighi, che diano
// timore nello sfidarli», «migliora anche le loro abilità speciali»; 16 ottobre, dopo il Golem: «sì, fai gli altri 12»). ANTEPRIMA: questo
// file e il modello sprite/nemici3d/salamander2.js entrano solo nella copia del gioco fatta da anteprime/mk_boss2.py; nel gioco vero dopo
// il sì di Denis (il modello prende il posto di 'salamander' e questo file va in src/ordine.txt). Design e numeri: docs/boss-classici.md.
// Una salamandra pezzata enorme, carminio e oro, ritta come su un trono, con una corona d'ossidiana, una gorgiera di petali di magma (il
// suo cuore: prima di ogni colpo si apre come un sole e la sua luce corre nella parte che colpirà) e lo scettro in punta alla coda.
// Ogni stato ha il nome di una mossa del modello; il colpo vero parte nel suo fotogramma (b3at, 81-boss3-base.js). Mosse:
// - Sputafuoco (spit): un cono rosso a terra dalla bocca verso di te, poi tre ventagli di palle di magma (5, 4 e 5, gli uni negli spazi
//   degli altri): si esce dal cono di lato.
// - Frustata (whip): se sei lontano scatta verso di te (rush), poi si gira di spalle; una mezzaluna rossa dietro di lei si riempie nel
//   verso della spazzata e la coda spazza il pavimento lasciando il fuoco (uscire oltre la mezzaluna o scattare attraverso la coda). Se le
//   stai addosso troppo a lungo la fa anche fuori turno. Nella fase 2 doppia (whip2): la spazzata, poi lo schiocco lungo una striscia.
// - Tuffo di lava (burrow, swim, breach): si tuffa e sotto il pavimento resta solo la corona, che taglia la pietra come una pinna e ti
//   viene incontro (non fa male: avvisa); dove si ferma un cerchio rosso con sei tacche, poi esplode fuori da una colonna di lava con un
//   anello di palle e una pozza. Nella fase 2 il salto del delfino (leap): esce, fa un arco e si ri-tuffa in un secondo cerchio.
// - Anello di fuoco (crouch, run, pant): un anello rosso tratteggiato intorno a te con un varco segnato da due paletti di luce; lei ci
//   corre sopra lasciando il fuoco, poi si ferma sul varco col collare freddo che sfiata vapore: i colpi fanno +50%.
// - Eruzione (erupt, solo fase 2): beve il suo fuoco dal pavimento, si alza ritta e fa scoppiare tre onde di geyser intorno a sé (più uno
//   sotto di te).
// - La muta (rage, a metà vita): cambia pelle ed esce incandescente; la pelle vuota resta nella stanza 15 s e ferma palle e frecce.
// Entrata (enter): esce da una pozza di magma, prima le punte della corona, poi gli occhi, poi lei. Sconfitta (die): la luce se ne va dalla
// coda alla testa, la corona cade e rotola, il corpo diventa un mucchio d'ossidiana. È il primo boss del vulcano: mai due attacchi insieme,
// ogni danno ha un avviso a terra di almeno 0,6 s, dopo ogni mossa almeno 1 s di camminata. Gli avvisi tondi sono ellissi 1 : 0,6 (il
// pavimento visto dalla telecamera dei modelli) e colpiscono esattamente dove si vedono; i pericoli stanno sul pavimento (i piedi dell'eroe
// sono 8 px sotto il suo punto). Nella fase 2 l'ordine è Frustata doppia, Tuffo, Sputafuoco, Anello, Eruzione: le mosse nuove arrivano
// subito dopo la muta e l'Eruzione beve l'anello appena acceso.
// =====================================================================
const SL2ON=typeof N3!=='undefined'&&!!N3.salamander2;
const SL2={seq1:['spit','whip','dive','spit','ring'],seq2:['whip2','dive','spit','ring','erupt'],red:'229,72,77',lava:'255,140,50',gold:'255,215,120',
  K:.6,KP:.55,sp2:1.25,cha:100*Math.PI/180,charge:new Set(['spit','whip','whip2','burrow','crouch','erupt'])};
const SL2TORCH={red:[['#ff3d12','#ff8a22','#ffe0a0'],'255,110,50'],white:[['#fff0c0','#ffd27a','#ffffff'],'255,230,180']};
if(SL2ON){
  // the new model in place of the old one (its drawing of today stays as N3.meta.salamander.old for the pages)
  const old=N3.salamander,oldM=N3.meta.salamander;N3.salamander=N3.salamander2;
  N3.meta.salamander=Object.assign({},N3.meta.salamander2,{old:(x,y,f,a,p)=>old(x,y,f,oldM.an.includes(a)?a:'idle',p,oldM.sc||1,{})});
  BOSS_INTRO.salamander=3.4;Object.assign(BDEATH,{salamander:{dur:4,clou:2.3,snd:'ignite'}});ET.salamander.r=30;
  // the bar, the halo, the aura and the runes; the 2D flames, embers and smoke of the old trail go: the model draws all of it
  B2H.salamander=92;B2T.salamander=[[SL2.lava,SL2.gold],'255,190,110'];B2.salamander.back=()=>{};B2.salamander.front=()=>{};
  BBFX.salamander={c:'#43355a',f:'#ffb060',k:'rise',s:'ignite'};RUNEC.magma=['255,110,40',SL2.gold];
  // what the game passes to the model: the height of the dolphin leap (o.z), the head turned toward the hero while she walks (o.look,
  // smoothed), the bend of the run round the ring (o.curve); the walk follows its own clock
  N3G.zm.salamander=1;
  N3G.opt.salamander=e=>{let lk=0;if(e.st==='walk'&&typeof P!=='undefined'&&P){const f=e.f3!=null?e.f3:(e.face||0);lk=clamp(angDiff(f,Math.atan2(P.y-e.y,P.x-e.x)),-1.2,1.2)}
    const t=G.t||0,dt=Math.min(.1,Math.max(0,t-(e.lkT==null?t:e.lkT)));e.lkT=t;e.lk=e.lk==null?lk:e.lk+(lk-e.lk)*Math.min(1,dt*8);return{look:e.lk,curve:e.curve||0}};
  N3G.wp.salamander=e=>{const d=B3D(e,'walk');return(((e.wt||0)%d)+d)%d/d};
  {const b=BEST.find(q=>q[0]==='salamander');if(b)b[2]='Boss. Ventagli di magma, frustate di coda, nuota sotto il pavimento con la corona come una pinna e ti chiude in un anello di fuoco. A metà vita cambia pelle: la pelle vecchia resta e fa da riparo.'}
  VINTO.magma='La corona della Salamandra è caduta. Il vulcano tace.'}
// ---- helpers
// the model's own drawings of the pieces of her attacks (design: Glob(x,y,z,a,sc,o), Geyser(x,y,k,sc,o), Pool(x,y,r,k,o), Husk(x,y,face,sc,o),
// Print(x,y,a,k,o), with x, y on the floor); the game's simple drawings if the model has none
const sl2art=n=>N3['salamander'+n]||N3['salamander2'+n]||null;
// how much faster than real time her moves run (the speed of the arena's bosses, and the second phase)
const sl2rt=e=>(e&&e.p2?SL2.sp2:1)*((G.bossLvl&&G.bossLvl.spd)||1);
// distances on the floor as they look (a circle on the floor is an ellipse 1 : .6)
const sl2d=(x,y,X,Y)=>Math.hypot(X-x,(Y-y)/SL2.K);
const sl2hf=()=>({x:P.x,y:P.y+8});
const sl2boss=()=>G&&G.enemies?G.enemies.find(q=>q.type==='salamander'&&!q.dead):null;
const sl2under=e=>{const k=b3k(e);return e.st==='swim'||e.st==='burrow'&&k>=.8||e.st==='breach'&&k<.45||e.st==='leap'&&k<.4};
// a floor point inside the room (m px from the walls)
const sl2in=(x,y,m)=>x>L+(m||0)&&x<R-(m||0)&&y>TOP+8+(m||0)&&y<BOT+8-(m||0);
function sl2reset(keep){if(!G)return;const o=G.sl2;G.sl2={warn:[],fire:[],prints:[],cracks:[],gey:[],drink:[],husk:keep&&o?o.husk:null,flare:keep&&o?o.flare:null,rune:null,ringFl:0}}
{const _br=buildRoom;buildRoom=function(){sl2reset();return _br.apply(this,arguments)}}
const sl2B=()=>G.sl2||(sl2reset(),G.sl2);
function sl2w(o){o.max=o.t;sl2B().warn.push(o);return o}
function sl2unw(w){if(w&&G.sl2){const i=G.sl2.warn.indexOf(w);if(i>=0)G.sl2.warn.splice(i,1)}}
// one of her fires on the floor: the magma cools from the edge in, the black crust round it does not hurt; at most 40 (24 with LOWFX),
// the oldest goes out first; when one ends a small scorch stays
function sl2fire(x,y,r,life,o){if(!sl2in(x,y,2))return null;const B=sl2B(),cap=LOWFX?24:40;
  while(B.fire.length>=cap){let j=0;for(let i=1;i<B.fire.length;i++)if(B.fire[i].born<B.fire[j].born)j=i;sl2scorch(B.fire.splice(j,1)[0])}
  const z={x,y,r0:r,t:life,max:life,born:(G.t||0)+Math.random()*1e-3,seed:Math.random()*10,p2:!!(o&&o.p2),ring:!!(o&&o.ring)};B.fire.push(z);
  if(BOSS2){ENV2.burnGrass(x,y,r);ENV2.ignite(x,y,r*.6)}return z}
function sl2scorch(z){if(BOSS2&&z&&!z.drink)ENV2.mark('scorch',z.x,z.y,z.r0*.7)}
// a ball of magma: its floor track is the line it is aimed along (it flies at the hero's height), drawn h px higher at first (it comes
// out of her mouth and drops to its flight)
function sl2shoot(x,y,a,sp,dmg,h,p2){shootE(x,y,a,sp,7,dmg,'magma');const p=G.eproj[G.eproj.length-1];if(p&&p.kind==='magma'){p.h=h||0;p.p2=!!p2}return p}
// the torches burn in her colours for a while (as ENV2.torches, without the magic's sound: her collar has its own)
function sl2torch(cols,light,sec){if(!BOSS2||!G||!G.env)return;if(!G.env._base)G.env={...G.env,_base:G.env};G.env.torch=cols;G.env.light=light;G._tT=sec;
  for(const t of G.torches||[])for(let i=0;i<(LOWFX?2:5);i++)G.embers.push({k:'ember',x:t.x+rand(-3,3),y:t.y-16,vx:rand(-20,20),vy:rand(-70,-30),life:rand(.5,1),max:1,ph:rand(0,9)})}
// her own way of moving: the stones of the old skin do not push her until she has got away from it
function sl2move(e,dx,dy,free){const R0=G.rocks;if(!R0.some(k=>k.sl2husk&&k.soft))return moveCircle(e,dx,dy,free);G.rocks=R0.filter(k=>!(k.sl2husk&&k.soft));try{moveCircle(e,dx,dy,free)}finally{G.rocks=R0}}
// how far a ball goes along a before the wall
function sl2reach(x,y,a,max){const ca=Math.cos(a),sa=Math.sin(a);let s=0;for(;s<max;s+=6){const px=x+ca*s,py=y+sa*s;if(px<L||px>R||py<TOP||py>BOT+8)break}return s}
// her own sounds (the voice is in B3VO, below): the bellows of the collar, the tail, the crown, the lava
const SL2SND={
  fff(t,v){fNoise(t,.42,'bandpass',VR(620,.08),1.3,.22*v,{att:.16,f2:1500,rev:.2});fNoise(t+.05,.34,'lowpass',VR(420,.1),.8,.12*v,{brown:true,att:.12})},
  vuff(t,v){fNoise(t,.24,'lowpass',VR(360,.1),.9,.2*v,{brown:true,att:.03,f2:160});fThump(t+.02,90,48,.14,.18*v)},
  whip(t,v){whoosh(t,.2,450,2800,.12*v,.15);fNoise(t+.18,.06,'highpass',2400,.7,.22*v);fThump(t+.18,150,48,.16,.32*v,.2)},
  tick(t,v){fThump(t,VR(210,.1),90,.06,.14*v);fNoise(t,.02,'highpass',3200,.7,.06*v)},
  glass(t,v){[2650,3300,4150].forEach((f,i)=>M.glass(t+i*.07,.9*v,VR(f,.03)));M.glass(t+.3,.5*v,VR(2900,.03))},
  cough(t,v){fNoise(t,.1,'bandpass',VR(560,.1),1.1,.13*v,{att:.01});fNoise(t+.16,.09,'bandpass',VR(500,.1),1.1,.09*v,{att:.01})},
  tss(t,v){fNoise(t,.5,'bandpass',VR(4200,.1),2,.05*v,{att:.06,f2:2600})},
  petals(t,v){for(let i=0;i<10;i++){fNoise(t+i*.045,.14,'bandpass',VR(800+i*90,.05),1.2,(.06+i*.01)*v,{att:.02,f2:1600+i*120});fNoise(t+i*.045,.01,'highpass',3600,.7,.05*v)}},
  notes(t,v,i){vBell(null,t,[69,72,76,79,84][i]||76,1.4,.035*v)},
  geyser(t,v){fThump(t,VR(95,.1),40,.32,.32*v,.2);fNoise(t,.55,'lowpass',VR(900,.1),.7,.18*v,{brown:true,f2:260,att:.02});for(let i=0;i<4;i++)fThump(t+.06+i*.06,VR(240,.25),VR(620,.25),.05,.05*v)},
  drink(t,v){fNoise(t,.3,'bandpass',VR(300,.1),2,.08*v,{f2:900,att:.08,brown:true})},
  dig(t,v){fNoise(t,.3,'lowpass',VR(700,.1),.8,.14*v,{brown:true,att:.02,f2:260});fNoise(t+.05,.2,'bandpass',VR(2400,.1),1,.04*v,{att:.03})},
  rumble(t,v){fNoise(t,.5,'lowpass',VR(220,.1),.8,.12*v,{brown:true,att:.1});fThump(t+.1,VR(70,.1),40,.3,.1*v)},
  crackle(t,v){for(let i=0;i<7;i++)fNoise(t+i*.05+Math.random()*.03,.02,'highpass',VR(3000,.2),.7,.07*v);fNoise(t,.35,'bandpass',VR(900,.1),1,.06*v,{brown:true,att:.05})},
  rock(t,v){M.stone(t,.6*v);M.stone(t+.08,.4*v)}};
function sl2sfx(k,x,i){if(!SL2SND[k]||!AU.ctx||!AU.on.sfx||AU.ctx.state!=='running')return;AU.pan=x==null?0:Math.max(-.7,Math.min(.7,(x-(G.vx||0)-VW/2)/200));
  try{SL2SND[k](AU.ctx.currentTime+.005,1,i)}catch(err){}AU.pan=0}
// her balls sound like fire (one sound for a whole fan)
{let mxT=0;const _s=sfx;sfx=function(k,arg,x){if(k==='eshot'&&arg==='magma'){const now=performance.now();if(now-mxT<70)return;mxT=now;return _s.call(this,k,'fire',x)}return _s.apply(this,arguments)}}

// ---- the brain
function sl2walk(e,t){e.wt=0;e.wk=0;e.curve=0;e.shell=0;e.air=0;e.z=0;e.moving=true;b3go(e,'walk',t!=null?t:e.p2?rand(1,1.3):rand(1.1,1.5))}
// the next move of the sequence (the Frustata out of turn does not count)
function sl2next(e){const seq=e.p2?SL2.seq2:SL2.seq1;e.si=(e.si==null?-1:e.si)+1;const nx=seq[e.si%seq.length];e.moving=false;
  if(nx==='spit')sl2spit0(e);
  else if(nx==='whip'||nx==='whip2'){if(sl2d(e.x,e.y,P.x,P.y)>150){b3go(e,'rush',.9);e.rushTo=nx;sfx('dash',0,e.x)}else sl2whip0(e,nx)}
  else if(nx==='dive'){const a=Math.atan2(P.y-e.y,P.x-e.x);b3go(e,'burrow');e.face=a;e.lf=a;e.sa=null}
  else if(nx==='ring')sl2crouch0(e);
  else if(nx==='erupt')sl2erupt0(e);
  else sl2walk(e)}
// ---- SPUTAFUOCO: the cone from the mouth toward you (it fills up to .76), three fans at .42, .58 and .74
function sl2spit0(e){const a=Math.atan2(P.y-e.y,P.x-e.x),M=b3pt(e,40,0,a),H=sl2hf(),aa=Math.atan2(H.y-M.y,H.x-M.x),p2=e.p2;
  b3go(e,'spit');e.moving=false;e.face=a;e.lf=a;
  const len=Math.min(sl2reach(M.x,M.y,aa,900),Math.max(240,Math.hypot(H.x-M.x,H.y-M.y)+70));
  e.sp={x:M.x,y:M.y,a:aa,ha:(p2?30:23)*Math.PI/180,len};e.spw=sl2w({k:'cone',x:M.x,y:M.y,a:aa,ha:e.sp.ha,len,t:.76*B3D(e,'spit')/sl2rt(e)});sl2torch(...SL2TORCH.red,1.5)}
function sl2fan(e,n){const F=e.sp;if(!F)return;const S=b3pt(e,44,0,e.lf),st=e.p2?.175:.2;for(let i=0;i<n;i++)sl2shoot(S.x,S.y-14,F.a+(i-(n-1)/2)*st,e.p2?185:165,12,16,e.p2);
  if(!LOWFX)vfxBlast(S.x,S.y-36,SL2.lava,26,{sparks:6,dust:false,ring2:false,spcol:['#ffd05a','#ff8a2a','#fff3c4']});shake(1.5)}
// ---- FRUSTATA: it turns its back (the model), the crescent behind her toward you (.16), the sweep (.66); in the second phase also the
// stripe (.54) and the crack of the tail along it (.85). e.face stays the direction toward you at p 0 for the whole move
function sl2whip0(e,kind){const a=Math.atan2(P.y-e.y,P.x-e.x),H=sl2hf();b3go(e,kind);e.moving=false;e.face=a;e.lf=a;e.curve=0;
  e.wa=Math.atan2((H.y-(e.y+8))/SL2.K,H.x-e.x);e.wdir=1;e.cw=null;e.cb=null}
function sl2sweep(e){const cx=e.x,cy=e.y+8,H=sl2hf(),dd=sl2d(cx,cy,H.x,H.y),th=Math.atan2((H.y-cy)/SL2.K,H.x-cx),m=P.r*.4;
  if(dd>40-m&&dd<150+m&&Math.abs(angDiff(e.wa,th))<SL2.cha+P.r/Math.max(30,dd))hurtP(Math.round(18*DMG()));
  // the train of fire along the arc; the temporary stones in the crescent break (the old skin too)
  for(let i=-2;i<=2;i++){const t=e.wa+i*.7,x=cx+Math.cos(t)*110,y=cy+Math.sin(t)*110*SL2.K;if(!G.rocks.some(k=>Math.hypot(k.x-x,k.y-y)<k.r+6))sl2fire(x,y,14,1.4,{p2:e.p2})}
  for(const k of G.rocks){if(!k.temp)continue;const kd=sl2d(cx,cy,k.x,k.y),kt=Math.atan2((k.y-cy)/SL2.K,k.x-cx);
    if(kd<150+k.r&&Math.abs(angDiff(e.wa,kt))<SL2.cha+.25){if(k.sl2husk)sl2huskBreak();else if(k.life>.3){k.life=.3;dustRing(k.x,k.y,8)}}}
  shake(6);sl2sfx('whip',e.x);vib(30);
  if(BOSS2){for(const i of[-1,0,1]){const t=e.wa+i*.9;ENV2.mark('scorch',cx+Math.cos(t)*100,cy+Math.sin(t)*100*SL2.K,22)}ENV2.rocks(e.x,e.y,160,2);ENV2.fall(B3N(5));
    ENV2.chunks(e.x,e.y,B3N(10),['#3a2a24','#5a4038','#2a1d18'],120)}
  if(!LOWFX)for(let i=0;i<14;i++){const t=e.wa+rand(-1,1)*SL2.cha,r=rand(60,150);fxPush({k:'streak',x:cx+Math.cos(t)*r,y:cy+Math.sin(t)*r*SL2.K,vx:rand(-60,60),vy:rand(-120,-40),g:380,t:rand(.25,.45),max:.45,col:pk(['#ffd05a','#ff8a2a','#fff3c4']),w:2})}}
function sl2crack(e,W){const H=sl2hf(),ca=Math.cos(W.a),sa=Math.sin(W.a),ux=H.x-W.x,uy=H.y-W.y,u=ux*ca+uy*sa,v=Math.abs(uy*ca-ux*sa);
  if(u>W.l0-6&&u<W.l1+6&&v<W.w/2+P.r*.5)hurtP(Math.round(20*DMG()));
  for(let s=W.l0+6;s<=W.l1;s+=24){const x=W.x+ca*s,y=W.y+sa*s;if(!sl2in(x,y,4))break;if(!G.rocks.some(k=>Math.hypot(k.x-x,k.y-y)<k.r+4))sl2fire(x,y,12,1.2,{p2:e.p2})}
  for(const k of G.rocks){if(!k.temp)continue;const kx=k.x-W.x,ky=k.y-W.y,ku=kx*ca+ky*sa,kv=Math.abs(ky*ca-kx*sa);if(ku>0&&ku<W.l1+k.r&&kv<W.w/2+k.r){if(k.sl2husk)sl2huskBreak();else if(k.life>.3){k.life=.3;dustRing(k.x,k.y,8)}}}
  shake(5);sl2sfx('whip',e.x);if(BOSS2){ENV2.mark('cracks',W.x+ca*W.l1*.5,W.y+sa*W.l1*.5,40);ENV2.rocks(W.x+ca*120,W.y+sa*120,140,1.5)}
  if(!LOWFX)vfxBlast(W.x+ca*W.l1*.6,W.y+sa*W.l1*.6-6,SL2.lava,40,{sparks:10,dust:6,ring2:false,spcol:['#ffd05a','#ff8a2a','#fff3c4']})}
// ---- TUFFO: the circle where she comes out (six ticks), the blow: damage in the circle, a ring of balls, a pool of magma; the room shakes
function sl2breach0(e){const a=Math.atan2(P.y-e.y,P.x-e.x);b3go(e,'breach');e.shell=9;e.air=1;e.face=a;e.lf=a;e.sa=null;
  e.bw=sl2w({k:'circ',x:e.x,y:e.y+8,r:48,t:.48*B3D(e,'breach')/sl2rt(e),boil:1,seed:Math.random()*9});sl2sfx('rumble',e.x)}
function sl2leap0(e){const a=Math.atan2(P.y-e.y,P.x-e.x);b3go(e,'leap');e.shell=9;e.air=1;e.face=a;e.lf=a;e.sa=null;e.c1={x:e.x,y:e.y};e.c2=null;
  e.lw1=sl2w({k:'circ',x:e.x,y:e.y+8,r:48,t:.43*B3D(e,'leap')/sl2rt(e),boil:1,seed:Math.random()*9});sl2sfx('rumble',e.x)}
// the second circle of the dolphin leap: 120 px toward you, inside the room, never near the obstacles (shorter or turned if it must)
function sl2hop(c1){const a0=Math.atan2(P.y-c1.y,P.x-c1.x);for(const d of[120,95,70])for(const o of[0,.35,-.35,.7,-.7,1.05,-1.05]){const a=a0+o,x=c1.x+Math.cos(a)*d,y=c1.y+Math.sin(a)*d;
    if(x<L+40||x>R-40||y<TOP+50||y>BOT-40)continue;if(G.rocks.some(k=>Math.hypot(k.x-x,k.y-y)<k.r+58))continue;return{x,y}}return{x:c1.x,y:c1.y}}
function sl2burst(e,x,y,r,dmg,n,pr,pt){const H=sl2hf();
  if(sl2d(x,y,H.x,H.y)<r+P.r*.4){const h0=P.hp;hurtP(Math.round(dmg*DMG()));if(P.hp<h0){const aa=Math.atan2(H.y-y,H.x-x);P.push={vx:Math.cos(aa)*220,vy:Math.sin(aa)*220,t:.15}}}
  const o=rand(0,TAU);for(let i=0;i<n;i++)sl2shoot(x,y-14,o+i*TAU/n,140,12,22,e.p2);
  sl2fire(x,y,pr,pt,{p2:e.p2});shake(7);sfx('boom',0,x);vib([40,30,60]);sl2sfx('geyser',x);
  vfxBlast(x,y-6,'255,130,50',90,{debris:'lava',n:B3N(20),fire:B3N(14),sparks:B3N(16),dust:8});
  if(BOSS2){ENV2.mark('crater',x,y,34);ENV2.chunks(x,y,B3N(16),['#3a2a24','#ff7a2e','#5a4038'],150);ENV2.fall(B3N(8));sl2torch(...SL2TORCH.white,.6);ENV2.rocks(x,y,150,3);ENV2.burnGrass(x,y,70);ENV2.ignite(x,y,70)}}
// ---- ANELLO DI FUOCO: the ring round you (chosen at p 0 of the crouch), the gap just before where she gets on it
function sl2ring(e){const p2=e.p2,cx0=(L+R)/2,cy0=(TOP+BOT)/2,gap=(p2?40:60)*Math.PI/180,C=[];
  for(let rr=p2?110:125;rr>=(p2?90:95);rr-=10)for(let i=0;i<=10;i++){const u=i/10,cx=P.x+(cx0-P.x)*u,cy=P.y+(cy0-P.y)*u;
    if(cx-rr<L+20||cx+rr>R-20||cy-rr<TOP+20||cy+rr>BOT-20)continue;if(G.rocks.some(k=>Math.abs(Math.hypot(k.x-cx,k.y-cy)-rr)<k.r+24))continue;
    const cl=rr-Math.hypot(P.x-cx,P.y-cy);if(cl>=44)return sl2ringOf(e,cx,cy,rr,gap);C.push([cl,cx,cy,rr])}
  if(C.length){C.sort((a,b)=>b[0]-a[0]);return sl2ringOf(e,C[0][1],C[0][2],C[0][3],gap)}
  // no room for a ring: the lap of the room of today, an ellipse round the middle
  return{cx:cx0,cy:cy0,rr:0,rx:130,ry:170,oval:1,th:Math.atan2((e.y-cy0)/170,(e.x-cx0)/130),dir:Math.random()<.5?1:-1,gap:0}}
function sl2ringOf(e,cx,cy,rr,gap){return{cx,cy,rr,oval:0,th:Math.atan2(e.y-cy,e.x-cx),dir:Math.random()<.5?1:-1,gap}}
const sl2rpt=(R,th)=>R.oval?{x:R.cx+Math.cos(th)*R.rx,y:R.cy+Math.sin(th)*R.ry}:{x:R.cx+Math.cos(th)*R.rr,y:R.cy+Math.sin(th)*R.rr};
const sl2rds=(R,th)=>R.oval?Math.hypot(R.rx*Math.sin(th),R.ry*Math.cos(th)):R.rr;
function sl2rlen(R){if(!R.oval)return R.rr*R.tot;let s=0;for(let i=0;i<64;i++)s+=sl2rds(R,(i+.5)/64*TAU)*TAU/64;return s*R.tot/TAU}
function sl2crouch0(e){b3go(e,'crouch');e.moving=false;e.curve=0;const R=sl2ring(e),E=sl2rpt(R,R.th);e.rg=R;R.ph='wait';R.cov=0;R.tot=R.oval?TAU:TAU-R.gap;R.cur=R.th;
  e.face=Math.hypot(E.x-e.x,E.y-e.y)>20?Math.atan2(E.y-e.y,E.x-e.x):R.th+R.dir*Math.PI/2;e.lf=e.face;e.rw=sl2w({k:'ring',R,t:99})}
// ---- ERUZIONE: she drinks her fire (the zones within 260 px, nearest first), three waves of geysers round her and one under you
function sl2erupt0(e){const a=Math.atan2(P.y-e.y,P.x-e.x),B=sl2B();b3go(e,'erupt');e.moving=false;e.face=a;e.lf=a;e.curve=0;
  const cx=e.x,cy=e.y+8,dz=z=>Math.hypot(z.x-cx,z.y-cy),near=B.fire.filter(z=>dz(z)<260).sort((p,q)=>dz(p)-dz(q));
  near.forEach((z,i)=>{z.drink=1;z.dk=.02+.32*(near.length>1?i/(near.length-1):0)});
  const dh=sl2d(cx,cy,P.x,P.y+8),D=[85,160,235];let wm=2;if(dh<=270){wm=0;for(let i=1;i<3;i++)if(Math.abs(D[i]-dh)<Math.abs(D[wm]-dh))wm=i}
  e.er={o:rand(0,TAU),wm,hit:[{h:0},{h:0},{h:0}]};sl2torch(...SL2TORCH.red,2.2)}
function sl2wave(e,w){const B=G.sl2,X=e.er,n=[6,9,12][w],d=[85,160,235][w],o=X.o+(w?Math.PI/n:0),cx=e.x,cy=e.y+8,lead=.45*B3D(e,'erupt')/sl2rt(e),pts=[];
  for(let i=0;i<n;i++){const t=o+i*TAU/n;pts.push({x:cx+Math.cos(t)*d,y:cy+Math.sin(t)*d*SL2.K})}
  if(X.wm===w){const H=sl2hf();if(!pts.some(q=>sl2d(q.x,q.y,H.x,H.y)<20))pts.push({x:H.x,y:H.y})}
  for(const q of pts){if(!sl2in(q.x,q.y,12))continue;if(G.rocks.some(k=>Math.hypot(k.x-q.x,k.y-q.y)<k.r+30))continue;
    B.gey.push({x:q.x,y:q.y,t:-lead,lead,on:0,hit:X.hit[w],p2:e.p2,seed:Math.random()*9})}
  sl2sfx('rumble',cx)}
// ---- LA MUTA: at half health, from a calm move; no damage, no attacks; the banner at .86; at the end she slides 30 px forward and the old
// skin stays where she was (with two temporary stones inside it: a shelter), then the eruption
function sl2moult(e,a){const B=sl2B();e.p2=true;e.moult=1;e.shell=99;e.air=0;e.z=0;e.curve=0;e.sp=null;G.eproj=G.eproj.filter(p=>p.kind!=='magma');B.warn=[];B.gey=[];
  for(const z of B.fire)z.drink=0;b3go(e,'rage');e.moving=false;e.face=a;e.lf=a;sfx('hiss',0,e.x);shake(3)}
function sl2husk(x,y,f){const B=sl2B(),V0=C3.V(f);B.husk={x,y,face:f,t:0,life:15,max:15,brk:0};
  for(const[bx,main] of[[8,1],[-34,0]]){const q=V0.P([bx,0,0]);G.rocks.push({x:x+q[0],y:y+q[1],r:20,seed:Math.random()*10,temp:true,life:15.1,kind:'boulder',sl2husk:1,soft:true,main})}fields={}}
function sl2huskBreak(){const h=G.sl2&&G.sl2.husk;if(!h||h.brk)return;h.brk=1;h.life=Math.min(h.life,.5);dustRing(h.x,h.y+6,14);sl2sfx('rock',h.x);
  if(!LOWFX)vfxBlast(h.x,h.y,'150,130,120',50,{debris:['#5a4640','#7e6a60','#2e2220'],n:B3N(14),sparks:0,dust:10,ring2:false})}

if(SL2ON)salamUpd=function(e,dt,a,d){const sp=e.p2?SL2.sp2:1;dt*=sp;// the second phase runs 1.25 times faster (n3Move draws the model at the same pace)
  const B=sl2B();
  if(!e.p2&&e.hp<e.max*.5&&(e.st==='walk'||e.st==='spit'||e.st==='pant'||e.st==='taunt')){sl2moult(e,a);return}
  b3tick(e,dt);const p2=e.p2,k=b3k(e),H=sl2hf();
  switch(e.st){
  case 'walk':{e.moving=true;if(e.wsd==null)e.wsd=Math.random()<.5?1:-1;const w0=e.wt||0;e.wt=w0+dt;e.wk=(e.wk||0)+dt;
    e.sdT=(e.sdT==null?rand(2,3):e.sdT)-dt;if(e.sdT<=0){e.sdT=rand(2,3);e.wsd=-e.wsd}
    // solemn: from far she comes closer turning round you a little, between 110 and 170 px she walks round you, closer she steps back
    // (a queen does not touch you: she strikes); the head stays on you
    const g=Math.hypot(P.x-e.x,P.y-e.y),base=g>170?navAngle(e):a,off=g>170?.4:g>110?1.3:g>80?1.75:2.5,ma=base+off*e.wsd,v=(g>80?50:70)*dt,ox=e.x,oy=e.y;
    sl2move(e,Math.cos(ma)*v,Math.sin(ma)*v);if(v>0&&Math.hypot(e.x-ox,e.y-oy)<v*.3){e.wsd=-e.wsd;e.sdT=rand(2,3)}e.face=ma;
    // the front feet leave a print that glows and cools (front right at .00, front left at .50)
    const D=B3D(e,'walk'),ph0=(w0%D)/D,ph1=(e.wt%D)/D;if(ph1<ph0)sl2print(e,-1);if(ph0<.5&&ph1>=.5)sl2print(e,1);
    // the train of the queen: the tip of the tail drags on the floor and leaves fire
    e.trT=(e.trT||0)-dt;if(e.trT<=0){e.trT=.3;const q=b3pt(e,-112,0);sl2fire(q.x,q.y,11,p2?2.2:1.4,{p2});
      if(!LOWFX)for(let i=0;i<2;i++)fxPush({k:'streak',x:q.x+rand(-4,4),y:q.y-2,vx:rand(-40,40),vy:rand(-80,-30),g:300,t:rand(.2,.35),max:.35,col:pk(['#ffd05a','#ff8a2a']),w:1.6})}
    // too close for too long: the Frustata out of turn (at most one every 5 s, at least .5 s after the last move)
    const ed=sl2d(e.x,e.y,P.x,P.y);e.nearT=ed<110?(e.nearT||0)+dt:0;
    if(e.nearT>=.8&&e.wk>=.5&&g>=55&&(G.t||0)-(e.owT==null?-99:e.owT)>=5){e.owT=G.t||0;e.nearT=0;sl2whip0(e,'whip');break}
    if(e.stT<=0)sl2next(e);break}
  case 'spit':{e.moving=false;e.face=e.lf;
    if(b3at(e,.42))sl2fan(e,p2?7:5);if(b3at(e,.58))sl2fan(e,p2?6:4);if(b3at(e,.74))sl2fan(e,p2?7:5);
    if(b3at(e,.76)){sl2unw(e.spw);e.spw=null}
    if(e.stT<=0){sl2unw(e.spw);e.spw=null;e.sp=null;sl2walk(e)}break}
  // the dash before the Frustata when you are out of reach (the model's run, straight); still out of reach after it: the next move
  case 'rush':{e.moving=true;e.curve=0;const ra=Math.atan2(P.y-e.y,P.x-e.x),ed=sl2d(e.x,e.y,P.x,P.y);e.face=ra;
    if(ed>95){const v=230*dt;sl2move(e,Math.cos(ra)*v,Math.sin(ra)*v);if(!LOWFX&&Math.random()<.5)fxPush({k:'puff',x:e.x+rand(-14,14),y:e.y+8,vx:-Math.cos(ra)*30,vy:-8,t:.4,r:rand(4,8)})}
    if(ed<=95||e.stT<=0){e.moving=false;if(sl2d(e.x,e.y,P.x,P.y)>150)sl2next(e);else sl2whip0(e,e.rushTo||'whip')}break}
  case 'whip':case 'whip2':{e.moving=false;e.face=e.lf;const W2=e.st==='whip2',D=B3D(e,e.st),ks=W2?.14:.16,kh=W2?.53:.66;
    if(b3at(e,ks))e.cw=sl2w({k:'cres',x:e.x,y:e.y+8,a:e.wa,r0:40,r1:150,ha:SL2.cha,dir:e.wdir,t:(kh-ks)*D/sl2rt(e)});
    if(b3at(e,kh)){sl2unw(e.cw);e.cw=null;sl2sweep(e)}
    if(W2&&b3at(e,.54))e.cb=sl2w({k:'band',x:e.x,y:e.y+8,a:e.lf,l0:20,l1:240,w:30,t:(.85-.54)*D/sl2rt(e)});
    if(W2&&b3at(e,.85)&&e.cb){sl2unw(e.cb);sl2crack(e,e.cb);e.cb=null}
    if(e.stT<=0){sl2unw(e.cw);sl2unw(e.cb);e.cw=e.cb=null;sl2walk(e)}break}
  // ---- TUFFO: hittable until .50, then under (e.shell: no aim, no blows; e.air: no contact damage; not e.hidden: the fin is drawn full)
  case 'burrow':{e.moving=false;e.face=e.lf;if(k>=.5)e.shell=9;if(k>=.8)e.air=1;
    if(b3at(e,.22)){const q=b3pt(e,30,0);if(BOSS2)ENV2.mark('cracks',q.x,q.y,22);sl2sfx('dig',e.x)}
    if(e.stT<=0){b3go(e,'swim',e.dv2?.8:p2?1.1:1.4);e.dv2=0;e.shell=9;e.air=1;e.sa=null;e.rmT=0}break}
  // the fin comes toward you (130 px/s, turning at most 2.5 rad/s); it stops 40 px from you or when its time is over, never under a rock
  case 'swim':{e.moving=false;e.shell=9;e.air=1;const ta=Math.atan2(H.y-(e.y+8),H.x-e.x);if(e.sa==null)e.sa=e.face;e.sa+=clamp(angDiff(e.sa,ta),-2.5*dt,2.5*dt);e.face=e.sa;
    const v=130*dt;e.x=clamp(e.x+Math.cos(e.sa)*v,L+34,R-34);e.y=clamp(e.y+Math.sin(e.sa)*v,TOP+44,BOT-44);
    if(!e.cpt||Math.hypot(e.x-e.cpt.x,e.y-e.cpt.y)>9){e.cpt={x:e.x,y:e.y};const j=rand(-3,3);B.cracks.push({x:e.x-Math.sin(e.sa)*j,y:e.y+8+Math.cos(e.sa)*j*SL2.K,t:1.5});if(B.cracks.length>40)B.cracks.shift()}
    for(const r of G.rocks)if(!r.temp&&Math.hypot(r.x-e.x,r.y-e.y)<r.r+14&&!(r._sl2T>(G.t||0)-.5)){r._sl2T=G.t||0;if(BOSS2)ENV2.rocks(r.x,r.y,r.r+10,0)}
    e.rmT=(e.rmT||0)-dt;if(e.rmT<=0){e.rmT=.45;sl2sfx('rumble',e.x)}
    const ed=sl2d(e.x,e.y,P.x,P.y),blocked=G.rocks.some(r=>Math.hypot(r.x-e.x,r.y-e.y)<r.r+e.r);
    if((ed<=40||e.stT<=0)&&(!blocked||e.stT<-.5)){if(blocked){const q=b3spot(e.x,e.y,70);e.x=q.x;e.y=q.y}e.cpt=null;
      if(p2&&N3.meta.salamander.an.includes('leap'))sl2leap0(e);else{sl2breach0(e);if(p2&&!e.dvDone){e.dive2=1;e.dvDone=1}else e.dvDone=0}}break}
  case 'breach':{e.moving=false;e.face=e.lf;if(k<.48){e.shell=9;e.air=1}
    if(b3at(e,.48)){sl2unw(e.bw);e.bw=null;e.air=0;sl2burst(e,e.x,e.y+8,48,22,LOWFX?8:10,26,4)}
    if(k>=.55)e.shell=0;
    if(b3at(e,.74)){shake(4);sfx('boom',0,e.x);dustRing(e.x,e.y+6,10)}
    if(b3at(e,.8)&&!LOWFX)for(let i=0;i<10;i++)fxPush({k:'streak',x:e.x+rand(-20,20),y:e.y-rand(10,40),vx:rand(-120,120),vy:rand(-160,-60),g:420,t:rand(.3,.5),max:.5,col:pk(['#ff8a2a','#ffd05a','#e0451c']),w:2.2});
    if(e.stT<=0){e.shell=0;e.air=0;if(e.dive2){e.dive2=0;e.dv2=1;b3go(e,'burrow');e.face=e.lf;e.sa=null}else sl2walk(e)}break}
  // the dolphin leap: out at .43, the arc from .48 to .76 (the game moves her and gives her height), into the second circle at .80
  case 'leap':{e.moving=false;e.face=e.lf;const c1=e.c1||{x:e.x,y:e.y};if(k<.48){e.shell=9;e.air=1}else e.shell=0;
    if(b3at(e,.25)){const c2=sl2hop(c1);e.c2=c2;if(Math.hypot(c2.x-c1.x,c2.y-c1.y)>1)e.lf=Math.atan2(c2.y-c1.y,c2.x-c1.x);
      e.lw2=sl2w({k:'circ',x:c2.x,y:c2.y+8,r:40,t:(.80-.25)*B3D(e,'leap')/sl2rt(e),seed:Math.random()*9})}
    if(b3at(e,.43)){sl2unw(e.lw1);e.lw1=null;sl2burst(e,c1.x,c1.y+8,48,22,LOWFX?10:12,26,3)}
    const c2=e.c2;if(c2&&k>=.48&&k<.76){const u=clamp((k-.48)/.28,0,1),q=u*u*(3-2*u);e.x=c1.x+(c2.x-c1.x)*q;e.y=c1.y+(c2.y-c1.y)*q;e.z=70*Math.sin(Math.PI*u);e.air=1}
    if(c2&&b3at(e,.76)){e.x=c2.x;e.y=c2.y;e.z=0}
    if(b3at(e,.8)){e.air=0;e.z=0;sl2unw(e.lw2);e.lw2=null;if(c2)sl2burst(e,c2.x,c2.y+8,40,18,LOWFX?6:8,22,3)}
    if(e.stT<=0){e.z=0;e.air=0;e.shell=0;e.c1=e.c2=null;sl2walk(e)}break}
  // ---- ANELLO: crouched (the ring is already on the floor), then the run: straight to where she gets on it, then round it
  case 'crouch':{e.moving=false;e.face=e.lf;if(e.stT<=0){const R=e.rg;R.ph='to';R.acc=0;R.mk=0;R.el=0;R.shots=0;R.len=sl2rlen(R);R.lapReal=R.len/((p2?375:300)*sl2rt(e));b3go(e,'run',99);e.moving=true;e.air=1}break}
  // on the run she touches you only where the band of the ring is (0.6 of her circle each side of the line, as wide as the band drawn):
  // the game's own contact would reach 40 px off the line, where nothing warns you
  case 'run':{e.moving=true;const R=e.rg;if(!R){sl2walk(e);break}const v=(p2?375:300)*dt;e.air=1;if(Math.hypot(P.x-e.x,P.y-e.y)<P.r+e.r*.6)hurtP(e.cdmg);
    if(R.ph==='to'){const E=sl2rpt(R,R.th),dx=E.x-e.x,dy=E.y-e.y,dd=Math.hypot(dx,dy);e.curve=0;
      if(dd<=v){e.x=E.x;e.y=E.y;R.ph='lap';R.cur=R.th}else{e.x+=dx/dd*v;e.y+=dy/dd*v;e.face=Math.atan2(dy,dx)}break}
    // round the ring: fire every 18 px (27 with LOWFX: the fires are fewer), a scorch every 40 px; in the second phase a ball at you
    // from outside at a quarter, half and three quarters of the lap
    R.el+=dt/sl2rt(e);const dth=Math.min(R.tot-R.cov,v/sl2rds(R,R.cur));R.cur+=R.dir*dth;R.cov+=dth;
    const q=sl2rpt(R,R.cur);e.x=q.x;e.y=q.y;e.face=Math.atan2(R.oval?R.ry*Math.cos(R.cur):Math.cos(R.cur),R.oval?-R.rx*Math.sin(R.cur):-Math.sin(R.cur))+(R.dir<0?Math.PI:0);
    {const rd=sl2rds(R,R.cur),kap=R.oval?R.rx*R.ry/Math.pow(rd,3):1/R.rr;e.curve=R.dir*kap}
    R.acc+=v;R.mk+=v;const gap=LOWFX?27:18;
    while(R.acc>=gap){R.acc-=gap;const left=Math.max(0,R.lapReal-R.el);sl2fire(e.x,e.y+8,LOWFX?17:15,left+(p2?3:2.2),{p2,ring:1})}
    if(R.mk>=40){R.mk=0;if(BOSS2)ENV2.mark('scorch',e.x,e.y+8,14)}
    if(p2)while(R.shots<3&&R.cov>=R.tot*(R.shots+1)/4){R.shots++;sl2shoot(e.x,e.y-6,Math.atan2(P.y-e.y,P.x-e.x),165,12,18,true)}
    if(R.cov>=R.tot-1e-6||R.el>R.lapReal+3){B.ringFl=.4;sl2unw(e.rw);e.rw=null;e.curve=0;e.moving=false;e.air=0;b3go(e,'pant');sfx('hiss',0,e.x)}break}
  // the cold collar: from .00 to .80 the blows do +50% (the first time in the run, the words)
  case 'pant':{e.moving=false;e.curve=0;
    if(b3at(e,.04)&&!G.sl2txt){G.sl2txt=1;const vx=G.vx||0;text(clamp(e.x,vx+96,vx+VW-96),e.y-118,'Il collare è freddo!','#ffd84a',18);const tx=G.texts[G.texts.length-1];if(tx)tx.life=1.5}
    if(!LOWFX&&k<.75&&Math.random()<.35){const q=b3pt(e,10,rand(-10,10));fxPush({k:'puff',x:q.x,y:q.y-46,vx:rand(-12,12),vy:rand(-30,-14),t:.6,r:rand(4,8)})}
    if(e.stT<=0)sl2walk(e);break}
  case 'erupt':{e.moving=false;e.face=e.lf;const X=e.er;
    // she drinks her fire: one zone at a time, the nearest first, each with a stream of embers sliding on the floor to her feet
    for(let i=B.fire.length-1;i>=0;i--){const z=B.fire[i];if(z.drink&&z.dk!=null&&k>=z.dk){B.fire.splice(i,1);B.drink.push({x:z.x,y:z.y,tx:e.x,ty:e.y+8,t:0,d:.32});if(Math.random()<.4)sl2sfx('drink',z.x)}}
    if(X)[.11,.25,.39].forEach((ka,w)=>{if(b3at(e,ka))sl2wave(e,w)});
    if(b3at(e,.36))shake(3);
    if(b3at(e,.52)){shake(6);sfx('boom',0,e.x);vib([50,30,70]);dustRing(e.x,e.y+6,16);B.flare={t0:G.t||0,d:1.2};if(BOSS2){ENV2.fall(B3N(10));ENV2.rocks(e.x,e.y,400,0)}}
    if(e.stT<=0){e.er=null;for(const z of B.fire)if(z.drink){z.drink=0;z.dk=null}sl2walk(e)}break}
  case 'rage':{e.moving=false;e.face=e.lf;e.shell=99;
    if(b3at(e,.2)||b3at(e,.32))sl2sfx('crackle',e.x);
    if(b3at(e,.45)){fxPush({k:'flash',x:e.x,y:e.y-50,r:80,rgb:'255,220,160',t:.25,max:.25});sfx('ignite',0,e.x)}
    [.74,.77,.80,.83,.86].forEach((ka,i)=>{if(b3at(e,ka))sl2sfx('notes',e.x,i)});
    if(b3at(e,.86)){banner('La Regina cambia pelle!','Fase 2',1.6);bossRage(e,SL2.gold);$('bossBar').classList.add('rage');shake(8);b3say(e,'angry');vib([60,40,120]);
      if(BOSS2){sl2torch(...SL2TORCH.red,3);ENV2.rocks(e.x,e.y,400,0);ENV2.fall(B3N(10))}}
    if(e.stT<=0){const hx=e.x,hy=e.y,hf=e.f3!=null?e.f3:e.lf;moveCircle(e,Math.cos(e.lf)*30,Math.sin(e.lf)*30);sl2husk(hx,hy,hf);e.shell=0;e.si=-1;sl2erupt0(e)}break}
  default:sl2walk(e)}};
// the prints of her front feet (s: +1 her left, -1 her right)
function sl2print(e,s){const B=G.sl2;if(!B)return;const q=b3pt(e,6,32*s),f=e.f3!=null?e.f3:e.face||0;B.prints.push({x:q.x,y:q.y,a:f,t:0});if(B.prints.length>8)B.prints.shift();G.shake=Math.max(G.shake||0,.8)}
// shell: no blows at all (under the floor, in the moult); the cold collar: +50%
{const _h=hurtE;hurtE=function(e,d){if(SL2ON&&e&&e.type==='salamander'&&!e.dead&&!(e.intro>0)){
  if(e.shell>0){if(G&&G.fx)G.fx.push({k:'spark',x:e.x,y:e.y-14,t:.15});return}
  if(e.st==='pant'&&b3k(e)<.8){const A=[...arguments];A[1]=d*1.5;return _h.apply(this,A)}}return _h.apply(this,arguments)}}
// her own reactions of the arena replace those of today (52-boss2-arena-reagisce.js, the old burrow)
{const _r=b2react;b2react=function(e){if(SL2ON&&e&&e.type==='salamander')return;return _r.apply(this,arguments)}}

// ---- the dangers on the floor and in the air
function sl2update(dt){const B=G.sl2;if(!B)return;const h=B.husk,S=sl2boss();
  // the old skin cools, then crumbles; its stones go with it and become solid only once she is away from it
  if(h){h.t+=dt;h.life-=dt;for(const k of G.rocks)if(k.sl2husk){k.life=h.life+.1;if(k.soft&&(!S||Math.hypot(S.x-k.x,S.y-k.y)>55))k.soft=false}
    if(h.life<=0){B.husk=null;for(const k of G.rocks)if(k.sl2husk)k.life=0;fields={}}}
  if(B.ringFl>0)B.ringFl-=dt;
  if(G.state!=='play'){if(B.warn.length||B.fire.length||B.gey.length||B.prints.length||B.cracks.length||B.drink.length){B.warn=[];B.fire=[];B.gey=[];B.prints=[];B.cracks=[];B.drink=[]}return}
  for(let i=B.warn.length-1;i>=0;i--){const w=B.warn[i];w.t-=dt;if(w.t<=0)B.warn.splice(i,1)}
  // her fires burn like the game's own (4 every half second, not while dashing) where the magma still is
  const H=sl2hf();
  for(let i=B.fire.length-1;i>=0;i--){const z=B.fire[i];z.t-=dt;if(z.t<=0){B.fire.splice(i,1);sl2scorch(z);continue}
    if(z.drink||P.dashT>0||P.poisonCd>0||P.fireRes)continue;const kk=1-z.t/z.max,rr=z.r0*(1-.55*kk);
    if(Math.hypot(H.x-z.x,(H.y-z.y)/SL2.KP)<rr){G.bossDmg=true;P.poisonCd=.5;const zd=Math.round(4*Math.min(2,DMG()));P.hp-=zd;text(P.x,P.y-40,'-'+zd,'#ff8a3c',13);if(P.hp<=0)die()}}
  for(let i=B.prints.length-1;i>=0;i--){B.prints[i].t+=dt;if(B.prints[i].t>1.2)B.prints.splice(i,1)}
  for(let i=B.cracks.length-1;i>=0;i--){B.cracks[i].t-=dt;if(B.cracks[i].t<=0)B.cracks.splice(i,1)}
  for(let i=B.drink.length-1;i>=0;i--){B.drink[i].t+=dt;if(B.drink[i].t>B.drink[i].d)B.drink.splice(i,1)}
  // the geysers: the floor boils in the circle, then the column (0.6 s): 18 if you are in it, one blow a wave; a drop of fire stays
  for(let i=B.gey.length-1;i>=0;i--){const g=B.gey[i];g.t+=dt;
    if(g.t>=0&&!g.on){g.on=1;shake(1.2);if(!g.hit.snd){g.hit.snd=1;sl2sfx('geyser',g.x)}if(!LOWFX)vfxBlast(g.x,g.y-8,SL2.lava,30,{sparks:5,dust:false,ring2:false,debris:'lava',n:3})}
    if(g.on&&g.t<.3&&!g.hit.h&&P.inv<=0&&P.dashT<=0&&sl2d(g.x,g.y,H.x,H.y)<24+P.r*.4){g.hit.h=1;hurtP(Math.round(18*DMG()))}
    if(g.t>=.6){B.gey.splice(i,1);sl2fire(g.x,g.y,14,1.2,{p2:g.p2})}}
  // her balls drop from the mouth to their flight
  for(const p of G.eproj)if(p.kind==='magma'&&p.h>0){p.h=Math.max(0,p.h-dt*60);p.tr=null}}
{const _u=update;update=function(dt){_u.apply(this,arguments);try{if(SL2ON&&G&&G.sl2&&started&&!paused&&G.state!=='dead')sl2update(dt)}catch(err){console.error(err)}}}
// ---- drawing: the game's simple shapes when the model has no drawing of its own
function sl2poolDraw(z){const k=clamp(1-z.t/z.max,0,1),A=sl2art('Pool'),a=Math.min(1,z.t/.25,(z.max-z.t)/.1+.2)*(z.drink?.55:1);if(a<=0)return;
  const a0=ctx.globalAlpha;ctx.globalAlpha=a0*a;
  if(A){try{A(z.x,z.y,z.r0,k,{seed:z.seed,p2:z.p2,noFx:LOWFX});ctx.globalAlpha=a0;return}catch(err){}}
  const r=z.r0,m=r*(1-.55*k);ctx.fillStyle='rgba(42,26,20,.8)';ell(z.x,z.y,r,r*SL2.KP);ctx.fill();
  const g=ctx.createRadialGradient(z.x,z.y,0,z.x,z.y,m);g.addColorStop(0,'#fff3c4');g.addColorStop(.45,'#ff8a2a');g.addColorStop(1,'#e0451c');ctx.fillStyle=g;ell(z.x,z.y,m,m*SL2.KP);ctx.fill();
  if(!LOWFX){ctx.globalCompositeOperation='lighter';glow(SL2.lava,z.x,z.y,m*1.6,.35,m*SL2.KP*1.6);ctx.globalCompositeOperation='source-over'}ctx.globalAlpha=a0}
function sl2printDraw(q){const k=Math.min(1,q.t/1.2),A=sl2art('Print');if(A){try{A(q.x,q.y,q.a,k,{noFx:LOWFX});return}catch(err){}}
  const hot=k<.3,al=hot?.85:.55*(1-k);if(al<=0)return;ctx.save();ctx.translate(q.x,q.y);ctx.scale(1,SL2.K);ctx.rotate(q.a);ctx.fillStyle=hot?`rgba(255,176,46,${al})`:`rgba(42,28,30,${al})`;
  circ(0,0,4.2);ctx.fill();for(const s of[-1,0,1]){circ(6.5,s*4.2,2);ctx.fill()}ctx.restore()}
function sl2geyDraw(g){const k=g.t<0?g.t/g.lead:Math.min(1,g.t/.6),A=sl2art('Geyser');
  if(g.t<0){const f=1+k;ctx.fillStyle=`rgba(${SL2.red},${.08+.24*f})`;ell(g.x,g.y,Math.max(1,24*f),Math.max(1,24*f*SL2.K));ctx.fill();
    ctx.strokeStyle=`rgba(${SL2.red},${.55+.3*Math.sin((G.t||0)*18)})`;ctx.lineWidth=2.2;ell(g.x,g.y,24,24*SL2.K);ctx.stroke()}
  if(A){try{A(g.x,g.y,k,1,{p2:g.p2,noFx:LOWFX,seed:g.seed});return}catch(err){}}
  const t=G.t||0;ctx.save();ctx.globalCompositeOperation='lighter';
  if(k<0){const f=1+k;for(let i=0;i<4;i++){const q=(t*1.8+i*.27+g.seed)%1,an=i*1.9+g.seed;ctx.fillStyle=`rgba(255,${150+60*q|0},60,${.6*(1-q)*f})`;circ(g.x+Math.cos(an)*12*f,g.y+Math.sin(an)*7*f,1.4+q*2.4);ctx.fill()}}
  else{const up=k<.15?k/.15:k<.6?1:1-(k-.6)/.4,h=50*up,w=12-4*up*.5;glow(SL2.lava,g.x,g.y-h*.5,22+h*.4,.6*up,h*.6+8);
    const gr=ctx.createLinearGradient(0,g.y-h,0,g.y);gr.addColorStop(0,'rgba(255,243,196,.95)');gr.addColorStop(.5,'rgba(255,160,50,.9)');gr.addColorStop(1,'rgba(224,69,28,.8)');ctx.globalCompositeOperation='source-over';
    ctx.fillStyle=gr;ctx.beginPath();ctx.moveTo(g.x-w,g.y);ctx.quadraticCurveTo(g.x-w*.7,g.y-h*.6,g.x-w*.5,g.y-h);ctx.lineTo(g.x+w*.5,g.y-h);ctx.quadraticCurveTo(g.x+w*.7,g.y-h*.6,g.x+w,g.y);ctx.closePath();ctx.fill()}
  ctx.restore()}
function sl2warnDraw(w){const k=clamp(1-w.t/w.max,0,1),t=G.t||0,pu=.55+.3*Math.sin(t*18),red=SL2.red;ctx.save();ctx.beginPath();ctx.rect(L-2,TOP-2,R-L+4,BOT-TOP+14);ctx.clip();
  if(w.k==='cone'){const a0=w.a-w.ha,a1=w.a+w.ha,sec=r=>{ctx.beginPath();ctx.moveTo(w.x,w.y);ctx.arc(w.x,w.y,r,a0,a1);ctx.closePath()};
    sec(w.len);ctx.fillStyle=`rgba(${red},${.07+.05*Math.sin(t*14)})`;ctx.fill();sec(Math.max(4,w.len*k));ctx.fillStyle=`rgba(${red},${.12+.16*k})`;ctx.fill();
    // the light of her throat inside it
    if(!LOWFX){const g=ctx.createRadialGradient(w.x,w.y,0,w.x,w.y,w.len*.7);g.addColorStop(0,`rgba(${SL2.lava},${.22*k})`);g.addColorStop(1,`rgba(${SL2.lava},0)`);
      ctx.globalCompositeOperation='lighter';ctx.fillStyle=g;sec(w.len*.7);ctx.fill();ctx.globalCompositeOperation='source-over'}
    ctx.strokeStyle=`rgba(${red},${pu})`;ctx.lineWidth=2;ctx.setLineDash([8,6]);sec(w.len);ctx.stroke();ctx.setLineDash([])}
  else if(w.k==='cres'){const K=SL2.K,s0=w.a-w.dir*w.ha,sw=2*w.ha*w.dir,sect=(a,b)=>{ctx.beginPath();ctx.ellipse(w.x,w.y,w.r1,w.r1*K,0,a,b,b<a);ctx.ellipse(w.x,w.y,w.r0,w.r0*K,0,b,a,!(b<a));ctx.closePath()};
    sect(s0,s0+sw);ctx.fillStyle=`rgba(${red},${.08+.05*Math.sin(t*14)})`;ctx.fill();ctx.strokeStyle=`rgba(${red},${pu})`;ctx.lineWidth=2;ctx.setLineDash([8,6]);ctx.stroke();ctx.setLineDash([]);
    if(k>.01){sect(s0,s0+sw*k);ctx.fillStyle=`rgba(${red},${.16+.18*k})`;ctx.fill()}
    // the arrow at the front of the fill, the way the tail will sweep
    const fa=s0+sw*Math.max(.04,k),rm=(w.r0+w.r1)/2,px=w.x+Math.cos(fa)*rm,py=w.y+Math.sin(fa)*rm*K,tx=-Math.sin(fa)*w.dir,ty=Math.cos(fa)*K*w.dir;
    ctx.translate(px,py);ctx.rotate(Math.atan2(ty,tx));ctx.fillStyle=`rgba(255,235,210,${.55+.3*k})`;ctx.beginPath();ctx.moveTo(14,0);ctx.lineTo(-4,-9);ctx.lineTo(-4,9);ctx.closePath();ctx.fill()}
  else if(w.k==='band'){ctx.translate(w.x,w.y);ctx.rotate(w.a);const n=w.l1-w.l0;ctx.fillStyle=`rgba(${red},${.07+.12*k})`;ctx.fillRect(w.l0,-w.w/2,n,w.w);
    ctx.fillStyle=`rgba(${red},${.14+.16*k})`;ctx.fillRect(w.l0,-w.w/2,n*k,w.w);ctx.strokeStyle=`rgba(${red},${pu})`;ctx.lineWidth=2;ctx.setLineDash([8,6]);ctx.strokeRect(w.l0,-w.w/2,n,w.w);ctx.setLineDash([])}
  else if(w.k==='circ'){const r=w.r,K=SL2.K;ctx.fillStyle=`rgba(${red},${.1+.22*k})`;ell(w.x,w.y,Math.max(1,r*k),Math.max(1,r*k*K));ctx.fill();
    ctx.strokeStyle=`rgba(${red},${pu})`;ctx.lineWidth=2.5;ell(w.x,w.y,r,r*K);ctx.stroke();
    // the floor boils in it: a hot glow and bubbles of lava
    if(w.boil&&!LOWFX){ctx.globalCompositeOperation='lighter';glow(SL2.lava,w.x,w.y,r*.9,.16+.24*k,r*.9*K);
      for(let i=0;i<6;i++){const q=(t*1.6+i*.37+w.seed)%1,an=i*2.4+w.seed,dd=r*.6*((i*.29+w.seed*.13)%1);ctx.fillStyle=`rgba(255,${180+40*q|0},90,${.55*(1-q)*(.3+.7*k)})`;circ(w.x+Math.cos(an)*dd,w.y+Math.sin(an)*dd*K,1.5+q*3);ctx.fill()}
      ctx.globalCompositeOperation='source-over'}
    for(let i=0;i<6;i++){const an=-Math.PI/2+i*TAU/6,on=k>=(i+1)/6;ctx.fillStyle=on?'rgba(255,240,200,.95)':`rgba(${red},.6)`;circ(w.x+Math.cos(an)*r*1.08,w.y+Math.sin(an)*r*K*1.08,on?3:2);ctx.fill()}}
  else if(w.k==='ring'){const Rg=w.R,rem=Rg.tot-Rg.cov,cur=Rg.cur,cy=Rg.cy+8;
    if(rem>.01){const path=()=>{ctx.beginPath();if(Rg.oval)ctx.ellipse(Rg.cx,cy,Rg.rx,Rg.ry,0,cur,cur+Rg.dir*rem,Rg.dir<0);else ctx.arc(Rg.cx,cy,Rg.rr,cur,cur+Rg.dir*rem,Rg.dir<0)};
      path();ctx.strokeStyle=`rgba(${red},${.1+.08*Math.sin(t*12)})`;ctx.lineWidth=36;ctx.stroke();path();ctx.strokeStyle=`rgba(${red},${pu})`;ctx.lineWidth=3;ctx.setLineDash([9,7]);ctx.stroke();ctx.setLineDash([]);
      // the arrow of the run at its front
      const q=sl2rpt(Rg,cur),tx=(Rg.oval?-Rg.rx*Math.sin(cur):-Math.sin(cur))*Rg.dir,ty=(Rg.oval?Rg.ry*Math.cos(cur):Math.cos(cur))*Rg.dir;
      ctx.save();ctx.translate(q.x,q.y+8);ctx.rotate(Math.atan2(ty,tx));ctx.fillStyle='rgba(255,235,210,.85)';ctx.beginPath();ctx.moveTo(16,0);ctx.lineTo(-4,-10);ctx.lineTo(-4,10);ctx.closePath();ctx.fill();ctx.restore()}
    // the gap: two posts of light
    if(!Rg.oval)for(const ga of[Rg.th,Rg.th-Rg.dir*Rg.gap]){const q=sl2rpt(Rg,ga),x=q.x,y=q.y+8;
      if(!LOWFX){ctx.globalCompositeOperation='lighter';glow('255,230,160',x,y-10,18,.55+.2*Math.sin(t*6),14);ctx.globalCompositeOperation='source-over'}
      ctx.strokeStyle='rgba(30,18,10,.8)';ctx.lineWidth=4.5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y-17);ctx.stroke();
      ctx.strokeStyle='rgba(255,240,200,.95)';ctx.lineWidth=2.4;ctx.stroke();ctx.fillStyle='#fff6d8';circ(x,y-18,2.6);ctx.fill()}}
  ctx.restore()}
// the husk (the old skin), drawn where its first stone stands in the room's order
function sl2huskDraw(){const h=G.sl2&&G.sl2.husk;if(!h)return;const cool=Math.min(1,h.t/h.max),cr=h.brk?clamp(1-h.life/.5,0,1):h.life<.8?clamp(1-h.life/.8,0,1):0,A=sl2art('Husk');
  if(A){try{A(h.x,h.y+8,h.face,1,{cool,crumble:cr,noFx:LOWFX});return}catch(err){}}
  const V0=C3.V(h.face),a0=ctx.globalAlpha;ctx.globalAlpha=a0*(1-cr);ink(2.2);
  for(let i=0;i<9;i++){const bx=24-i*16,r=i<2?16:i<5?20-i*.6:Math.max(4,18-(i-4)*3.2),q=V0.P([bx,0,r*.7]);ctx.beginPath();ctx.ellipse(h.x+q[0],h.y+8+q[1],r,r*.75,0,0,TAU);fs(i%2?'#5a4640':'#6a564e')}
  ctx.strokeStyle=`rgba(${cool<1?'255,106,42':'46,34,32'},${.8*(1-cool)+.2})`;ctx.lineWidth=1.6;ctx.beginPath();for(let i=0;i<8;i++){const q=V0.P([20-i*16,0,22-i*1.5]);i?ctx.lineTo(h.x+q[0],h.y+8+q[1]):ctx.moveTo(h.x+q[0],h.y+8+q[1])}ctx.stroke();ctx.globalAlpha=a0}
function sl2ground(){const B=G.sl2;if(!B)return;const t=G.t||0,S=sl2boss();
  // the warm pool of her collar on the floor round her: it breathes with her (two breaths a cycle in the second phase)
  if(S&&!LOWFX&&!sl2under(S)){const ki=S.intro>0?clamp(((S.iT||0)-1.9)/.4,0,1):1;if(ki>0){const br=.5+.5*Math.sin(t*TAU/3.2*(S.p2?2:1));ctx.save();ctx.globalCompositeOperation='lighter';
    glow(S.p2?'255,170,80':'255,110,40',S.x,S.y+8,90,(.13+.07*br)*(S.p2?1.25:1)*ki,90*SL2.K);ctx.restore()}}
  // the glowing crack the fin leaves behind
  if(B.cracks.length>1){ctx.save();ctx.lineCap='round';for(let i=1;i<B.cracks.length;i++){const a=B.cracks[i-1],b=B.cracks[i];if(Math.hypot(a.x-b.x,a.y-b.y)>22)continue;const al=Math.min(a.t,b.t)/1.5;if(al<=0)continue;
      ctx.strokeStyle=`rgba(20,10,8,${.5*al})`;ctx.lineWidth=3.2;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
      ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(255,${120+80*al|0},40,${.85*al})`;ctx.lineWidth=1.6;ctx.stroke();ctx.globalCompositeOperation='source-over'}ctx.restore()}
  for(const q of B.prints)sl2printDraw(q);
  for(const z of B.fire)sl2poolDraw(z);
  // she drinks her fire: embers sliding on the floor to her feet
  if(B.drink.length){ctx.save();ctx.globalCompositeOperation='lighter';for(const s of B.drink){const u=Math.min(1,s.t/s.d);for(let j=0;j<5;j++){const v=clamp(u*1.4-j*.1,0,1),x=s.x+(s.tx-s.x)*v,y=s.y+(s.ty-s.y)*v;
      if(!LOWFX)glow(SL2.lava,x,y,8,.6*(1-u*.5),6);ctx.fillStyle='rgba(255,230,160,.9)';circ(x,y,1.4);ctx.fill()}}ctx.restore()}
  for(const w of B.warn)sl2warnDraw(w);
  for(const g of B.gey)if(g.t<0)sl2geyDraw(g)}
function sl2air(){const B=G.sl2;if(!B)return;
  // the end of the lap: the flames of the ring rise for an instant
  if(B.ringFl>0&&!LOWFX){const k=B.ringFl/.4;ctx.save();ctx.globalCompositeOperation='lighter';for(const z of B.fire)if(z.ring)glow('255,170,70',z.x,z.y-8,z.r0*2.2,.5*k,z.r0*1.5);ctx.restore()}}
{const _g2=drawHazards2Ground;drawHazards2Ground=function(){_g2.apply(this,arguments);try{if(SL2ON)sl2ground()}catch(err){}}}
// the columns of the geysers stand in the room's order (behind her or in front of her, of the hero, of the obstacles): while the room is
// drawn they ride in the list of the corpses (never in the game's own list: the corpses' clock and the end of the room do not see them)
if(SL2ON){const _rd=render;render=function(){const B=G&&G.sl2;if(!B||!B.gey.some(g=>g.t>=0))return _rd.apply(this,arguments);const C=G.corpses||(G.corpses=[]),n0=C.length;
    for(const g of B.gey)if(g.t>=0)C.push({type:'sl2gey',g,x:g.x,y:g.y-8,t:0,dur:1,parts:[]});try{return _rd.apply(this,arguments)}finally{C.length=n0}};
  const _dc=drawCorpse;drawCorpse=function(c){if(c&&c.type==='sl2gey'){try{sl2geyDraw(c.g)}catch(err){}return}return _dc.apply(this,arguments)}}
{const _a2=drawHazards2Air;drawHazards2Air=function(){_a2.apply(this,arguments);try{if(SL2ON)sl2air()}catch(err){}}}
// her balls of magma (the model's own if it has one)
Object.assign(TRC,{magma:SL2.lava});
Object.assign(EPDRAW,{magma:p=>{const z=p.h||0,A=sl2art('Glob');if(A){try{A(p.x,p.y,z,p.a,(p.r||7)/7,{p2:!!p.p2,noFx:LOWFX});return}catch(err){}}
  const y=p.y-z,r=p.r||7;if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow(SL2.lava,p.x,y,r*2.8,.5);ctx.restore()}ink(1.6);circ(p.x,y,r);
  const g=ctx.createRadialGradient(p.x-r*.3,y-r*.3,0,p.x,y,r);g.addColorStop(0,p.p2?'#ffffff':'#fff3c4');g.addColorStop(.5,'#ffd05a');g.addColorStop(1,'#ff8a2a');ctx.fillStyle=g;ctx.fill();ctx.stroke();
  ctx.fillStyle='#43355a';ctx.beginPath();ctx.ellipse(p.x+r*.3,y+r*.25,r*.42,r*.26,.5,0,TAU);ctx.fill();ctx.fillStyle='#8e7fb8';circ(p.x+r*.18,y+r*.12,r*.12);ctx.fill()}});
// the stones of the old skin: the husk itself is drawn in their place (they are only there to stop you, the balls and the arrows)
if(SL2ON){const _dr=drawRock;drawRock=function(k){if(k&&k.sl2husk){if(k.main)sl2huskDraw();return}return _dr.apply(this,arguments)}
  const _cs=castShadow;castShadow=function(k){if(k&&k.sl2husk){const h=k.main&&G.sl2&&G.sl2.husk;if(h)shadow(h.x,h.y+10,46,14,.22*Math.min(1,h.life/.5));return}return _cs.apply(this,arguments)}}
// her shadow: none under the floor, smaller in the air
if(SL2ON){const _sf=shadowFor;shadowFor=function(e){if(e.type!=='salamander')return _sf.apply(this,arguments);if(e.intro>0&&(e.iT||0)<1.75||sl2under(e))return;
  const k=1-Math.min(.6,(e.z||0)/120);shadow(e.x,e.y+8,44*k,14*k,.3*k)}}
// the halo round her (B2H 92), and the charging ring only when an attack begins; nothing of it while she is under the floor
if(SL2ON){const _bb=b2back;b2back=function(e,dt){if(e.type!=='salamander')return _bb.apply(this,arguments);if(sl2under(e))return;const t=G.t||0,z=e.z||0,hh=B2H.salamander;
    ctx.save();ctx.globalCompositeOperation='lighter';glow(b2halo(e),e.x,e.y-z-hh*.55,hh*1.1,(.2+.05*Math.sin(t*1.7))*(e.intro>0?.6:1));ctx.restore()};
  const _bf=b2front;b2front=function(e,dt){if(e.type!=='salamander')return _bf.apply(this,arguments);if(sl2under(e)||!SL2.charge.has(e.st)){e._b2st=e.st;return}return _bf.apply(this,arguments)}}
// the lights: hers (stronger and wider than before; on the fin a small one), her fires, the geysers, the lava cracks when they flare
if(SL2ON){const _dl=drawLighting;drawLighting=function(pass){if(!G||!G.enemies||pass==='out'||LOWFX&&!G.dark)return _dl.apply(this,arguments);
  const B=G.sl2,S=sl2boss(),LL=G.lavaLights||(G.lavaLights=[]),n0=LL.length,t=G.t||0;
  if(S&&!S.hidden){if(sl2under(S))LL.push({x:S.x,y:S.y+4,r:46});else if(!(S.intro>0&&(S.iT||0)<1.5))LL.push({x:S.x,y:S.y-14,r:108},{x:S.x,y:S.y-14,r:76})}
  if(B){for(const z of B.fire)if(!z.drink)LL.push({x:z.x,y:z.y,r:z.r0*(1-.4*(1-z.t/z.max))});
    for(const g of B.gey)if(g.t>=0)LL.push({x:g.x,y:g.y-20,r:40});
    if(B.flare){const u=(t-B.flare.t0)/B.flare.d;if(u>=0&&u<1){const k=Math.sin(Math.PI*Math.min(1,u*1.6));for(let i=0;i<n0;i++){const l=LL[i];if(l.r<=45)LL.push({x:l.x,y:l.y,r:l.r*1.5*k})}}}
    if(B.ringFl>0)for(const z of B.fire)if(z.ring)LL.push({x:z.x,y:z.y,r:z.r0*1.6})}
  const hid=S&&!S.hidden;if(hid)S.hidden=true;
  try{return _dl.apply(this,arguments)}finally{LL.length=n0;if(hid)S.hidden=false}}}
// the lava cracks of the room flare (the entrance: their light flows to the middle; the eruption), the circle of runes catches fire
if(SL2ON){const _lg=lavaGlowLive;lavaGlowLive=function(){_lg.apply(this,arguments);const B=G&&G.sl2;if(!B||LOWFX)return;try{const t=G.t||0;
  if(B.flare){const F=B.flare,u=(t-F.t0)/F.d;if(u<0||u>=1)B.flare=null;else{const k=Math.sin(Math.PI*Math.min(1,u*1.6))*(1-u*.3);ctx.save();ctx.globalCompositeOperation='lighter';
    for(const l of G.lavaLights||[]){if(l.r>45)continue;glow('255,150,60',l.x,l.y,l.r*1.8,.4*k,l.r);if(F.flow&&F.cx!=null&&!LOWFX){const v=Math.min(1,u*1.3),x=l.x+(F.cx-l.x)*v,y=l.y+(F.cy-l.y)*v;glow('255,190,90',x,y,16,.7*(1-v),10)}}ctx.restore()}}
  if(B.rune&&G.runeAt){const u=(t-B.rune.t0)/B.rune.d;if(u<0||u>=1)B.rune=null;else{const k=Math.sin(Math.PI*Math.min(1,u*2.2))*(1-u*.5),rx=101,ry=101*.62,ru=G.runeAt;ctx.save();ctx.globalCompositeOperation='lighter';
    ctx.strokeStyle=`rgba(255,150,60,${.5*k})`;ctx.lineWidth=7;ctx.beginPath();ctx.ellipse(ru.x,ru.y,rx,ry,0,0,TAU);ctx.stroke();ctx.strokeStyle=`rgba(255,230,160,${.7*k})`;ctx.lineWidth=2;ctx.stroke();
    for(let i=0;i<12;i++){const an=i/12*TAU;if(u*12<i*.6)continue;glow('255,170,70',ru.x+Math.cos(an)*rx,ru.y+Math.sin(an)*ry,12,.7*k,9)}ctx.restore()}}}catch(err){}}}

// ---- the entrance (3.4 s, the model's 'enter'): the lava cracks light up and their light runs to the middle, a pool of magma opens, the
// points of the crown come out of it, then the eyes, then she climbs out, lights her collar petal by petal, rears up and roars, lands and
// cracks her tail on the floor
if(SL2ON){const _bi=bossIntro;bossIntro=function(e,dt,a){if(e.type!=='salamander')return _bi.apply(this,arguments);
  const T=BOSS_INTRO.salamander;if(e.iT==null){e.iT=0;e.iStep=0}const t0=e.iT;e.iT+=dt;const t=e.iT,at=s=>t0<s&&t>=s;
  e.intro=Math.max(0,T-t);e.face=a;e.st='enter';e.z=0;e.em=null;e.hole=0;e.fa=t<T*.94?.999:1;
  if(t0===0){const B=sl2B();B.flare={t0:G.t||0,d:.6,flow:1,cx:e.x,cy:e.y+8};B.rune={t0:G.t||0,d:1.4};sfx('creep',1,e.x);shake(2)}
  for(const s of[.51,.65,.78])if(at(s)){sfx('click',0,e.x);shake(.8)}
  if(at(.99))sfx('shimmer',0,e.x);
  if(at(1.75)){sfx('boom',0,e.x);shake(3);vfxBlast(e.x,e.y+10,'255,130,50',44,{debris:'lava',n:B3N(14),fire:B3N(4),sparks:B3N(10),dust:false,ring2:false})}
  if(at(1.9))sl2sfx('petals',e.x);
  if(at(2.58)){fxPush({k:'flash',x:e.x,y:e.y-60,r:220,rgb:'255,200,120',t:.3,max:.3});sl2torch(...SL2TORCH.red,1.2)}
  if(at(2.62)){if(!b3say(e,'cry'))sfx('roar');vib([60,40,120]);shake(6);for(let i=0;i<3;i++)setTimeout(()=>{if(G&&G.fx)fxPush({k:'ring2',x:e.x,y:e.y-e.r,rgb:'255,255,255',r0:e.r,r1:e.r*5,t:.45,max:.45,w:6-i*1.5})},i*170)}
  if(at(2.99)){shake(4);sfx('boom',0,e.x)}
  // the crack of the tail behind her: a crescent of sparks and a burnt mark, no damage
  if(at(3.06)){shake(5);sl2sfx('whip',e.x);const q=b3pt(e,-110,0);if(BOSS2)ENV2.mark('scorch',q.x,q.y,26);
    if(!LOWFX)for(let i=0;i<16;i++){const an=e.face+Math.PI+rand(-1.3,1.3),r=rand(60,120);fxPush({k:'streak',x:e.x+Math.cos(an)*r,y:e.y+8+Math.sin(an)*r*SL2.K,vx:rand(-60,60),vy:rand(-130,-50),g:380,t:rand(.25,.45),max:.45,col:pk(['#ffd05a','#ff8a2a','#fff3c4']),w:2})}}
  if(e.intro<=0){e.z=0;e.em=null;e.fa=null;e.hole=0;stamp('crater',e.x,e.y+8,40);e.si=-1;sl2walk(e,.9)}}}
// what the model plays: the entrance over its whole length, the moves in the brain's own time (it already carries the speed), the fin
// and the run on their clocks (the run is also the dash before the Frustata)
if(SL2ON){const _nm=n3Move;n3Move=function(e){if(e.type!=='salamander')return _nm.apply(this,arguments);
  if(e.intro>0)return['enter',clamp((e.iT||0)/BOSS_INTRO.salamander,0,.999)];
  const st=e.st,M=N3.meta.salamander,cyc=a=>[a,((((e.mt||0)/B3D(e,a))%1)+1)%1];
  if(st==='swim')return cyc('swim');if(st==='run'||st==='rush')return cyc('run');
  if(st&&st!=='walk'&&M.an.includes(st))return[st,clamp(b3k(e),0,.999)];
  return _nm.apply(this,arguments)}}
// ---- the defeat (4 s, the model's 'die'; the clou at 2.3 s when the crown rolls on the floor)
function sl2coolCrack(c,l){const L0=G.lavaLights||[],i=L0.indexOf(l);if(i>=0)L0.splice(i,1);
  const g=fx;g.save();g.setTransform(2,0,0,2,0,0);const gr=g.createRadialGradient(l.x,l.y,2,l.x,l.y,40);gr.addColorStop(0,'rgba(24,15,12,.78)');gr.addColorStop(.55,'rgba(24,15,12,.5)');gr.addColorStop(1,'rgba(24,15,12,0)');
  g.fillStyle=gr;g.beginPath();g.ellipse(l.x,l.y,40,28,0,0,TAU);g.fill();g.restore();cpart(c,{k:'steam',x:l.x,y:l.y,z:0,vz:rand(14,26),life:rand(.7,1),r:rand(4,6)})}
if(SL2ON){const _sb=snapBoss;snapBoss=function(e){if(e.type==='salamander')return{live:1};return _sb.apply(this,arguments)}
  BDIE.salamander={setup(c){const e=c.e,h=G.sl2&&G.sl2.husk;c.face=e.f3!=null?e.f3:(e.face||Math.PI/2);c.p2=!!e.p2;c.live=1;sl2reset(true);if(h&&!h.brk)h.life=Math.min(h.life,1.4);
      c.cool=(G.lavaLights||[]).filter(l=>l.r===40).sort(()=>Math.random()-.5);c.ci=0;c.st=0;sfx('hiss',0,c.x)},
    tick(c,dt,D){const p=Math.min(1,c.t/c.dur),V0=C3.V(c.face),at=s=>c.t-dt<s*c.dur&&c.t>=s*c.dur,pt=(bx,bz)=>{const q=V0.P([bx,0,bz||0]);return{x:c.x+q[0],y:c.y+8+q[1]}};
      // the light goes from the tail to the head: a puff of steam from every fissure
      while(c.st<10&&p>=.15+c.st*.027){const q=pt(-100+c.st*11,0);cpart(c,{k:'steam',x:q.x,y:q.y,z:22,vz:rand(18,34),vx:rand(-8,8),life:rand(.7,1.1),r:rand(3,6)});if(c.st%3===0)sl2sfx('tss',c.x);c.st++}
      if(at(.48)){const q=pt(42,0);for(let i=0;i<3;i++)cpart(c,{k:'puff',x:q.x,y:q.y,z:40,vz:rand(10,24),vx:rand(-10,10),life:.8,r:3+i,col:'90,80,76'});sl2sfx('cough',c.x)}
      if(at(.55))sfx('click',0,c.x);if(at(.575))sl2sfx('glass',c.x);
      if(p>.575&&p<.8&&Math.random()<(LOWFX?.2:.5))cpart(c,{k:'ember',x:c.x+rand(-50,40),y:c.y+8+rand(-6,6),z:rand(4,20),vz:rand(30,60),vx:rand(-10,10),sw:4,ph:rand(0,6),life:rand(.6,1),r:rand(1.5,2.6)});
      for(const s of[.66,.71,.76])if(at(s)){sl2sfx('rock',c.x);shake(2.5)}
      if(p>.8&&Math.random()<(LOWFX?.08:.2))cpart(c,{k:'puff',x:c.x+rand(-14,14),y:c.y+8,z:10,vz:rand(10,22),vx:rand(-6,6),life:rand(1,1.4),r:rand(4,7),col:'70,58,56'});
      // the lava cracks of the room go out one by one
      if(c.t>=D.clou&&c.ci<c.cool.length){const n=c.cool.length,due=Math.floor((c.t-D.clou)/((c.dur-D.clou-.15)/n))+1;while(c.ci<Math.min(n,due))sl2coolCrack(c,c.cool[c.ci++])}},
    draw(c,D){const p=Math.min(.999,c.t/c.dur),M=N3.meta.salamander,f=p>.96?(1-p)/.04:1,a0=ctx.globalAlpha;ctx.globalAlpha=a0*Math.max(0,f);
      try{N3.salamander(c.x,c.y+8,c.face,M.an.includes('die')?'die':'hit',p,(M&&M.sc)||1,{p2:c.p2,noFx:LOWFX})}catch(err){}ctx.globalAlpha=a0}};
  const _dc=drawCorpse;drawCorpse=function(c){if(c.type!=='salamander')return _dc.apply(this,arguments);const k=Math.min(1,c.t/c.dur);shadow(c.x,c.y+8,44*(1-.4*k),14,.28*(1-k));
    try{BDIE.salamander.draw(c,BDEATH.salamander)}catch(err){}drawParts(c)}}

// ---- the voice and the personality, like the four new bosses (88-boss3-voci.js) and the Golem: a queen of fire. A regal hiss of a reptile
// with a purr under it and the lava gurgling; «hsss-hsss-hsss» when she hits you and mocks you (her gesture, the model's 'taunt': the chin
// up, two rings of smoke, the tip of the tail tapping); three knocks and a long hiss when you keep away and she calls you out; a sound for
// each blow, after the bellows of her collar («fff» when it opens, you hear the blow coming); a dry «ksss!» when you hit her hard; a long
// hiss that turns into the sizzle of water on hot stone when she falls; a slow «hsss… hsss… hsss…» if you fall.
if(SL2ON){B3S.add('salamander');
  B3VO.VB.salamander={base:{br:.45,ro:.2,ji:.06,lp:.5,hs:.12},k:{
    cry:[[1.95,[{t:0,d:.75,noise:1,v:['u','i'],hs:.9,a:.75},{t:.55,d:1.36,f:[84,138,96],v:['o','a','o'],h:.06,ro:.45,gu:.35,vib:[.03,5],rel:.4,hs:.25}],.54]],
    angry:[[1.7,[{t:0,d:.3,noise:1,v:'a',hs:.7,a:.8},{t:.22,d:1.42,f:[78,128,70],v:['o','a','o'],ro:.7,ji:.3,gu:.5,vib:[.035,6],rel:.35}],.55]],
    laugh:[[1.15,[{t:0,d:.2,noise:1,v:'i',hs:1,a:.85},{t:.27,d:.2,noise:1,v:'i',hs:1,a:.75},{t:.54,d:.2,noise:1,v:'i',hs:1,a:.65},{t:.78,d:.34,f:[66,58],v:'r',am:[.7,22],a:.6,br:.6,rel:.5}],.36]],
    laugh2:[[1.05,[{t:0,d:.05,noise:1,v:'e',hs:.6,a:.9},{t:.13,d:.05,noise:1,v:'e',hs:.6,a:.9},{t:.26,d:.05,noise:1,v:'e',hs:.6,a:.9},{t:.42,d:.6,noise:1,v:['i','e'],hs:1,a:.8}],.36]],
    hurt:[[.3,[{t:0,d:.04,noise:1,v:'a',a:1},{t:.03,d:.26,noise:1,v:'i',hs:1,a:.85}],.48],[.32,[{t:0,d:.05,noise:1,v:'o',a:.9},{t:.04,d:.26,f:[150,110],v:['i','e'],a:.6,br:.8,hs:.9,ro:.3}],.48]],
    c_spit:[[.5,[{t:0,d:.48,f:[80,150],v:['u','o'],gu:.9,ro:.3,a:.85,h:.1}],.37]],
    c_whip:[[.55,[{t:0,d:.3,f:[72,76],v:'m',ro:.4,a:.7},{t:.32,d:.05,noise:1,v:'h',a:.8},{t:.36,d:.17,f:[170,120],v:'a',ro:.3,h:.2}],.48]],
    c_dive:[[.5,[{t:0,d:.48,noise:1,v:['i','u'],hs:.85,a:.85}],.42]],
    c_ring:[[.55,[{t:0,d:.52,f:[118,138,124],v:'r',am:[.85,28],ro:.25,a:.85}],.46]],
    c_erupt:[[.9,[{t:0,d:.86,f:[96,170,118],v:['o','a','o'],ro:.5,gu:.3,vib:[.03,6],h:.05,rel:.3}],.44]],
    c_pant:[[1,[{t:0,d:.13,noise:1,v:'h',a:.8},{t:.2,d:.13,noise:1,v:'h',a:.7},{t:.4,d:.13,noise:1,v:'h',a:.7},{t:.6,d:.13,noise:1,v:'h',a:.6},{t:.72,d:.28,noise:1,v:['e','i'],hs:1,a:.6}],.37]],
    die:[[2.5,[{t:0,d:1.1,noise:1,v:['i','e'],hs:.95,a:.85},{t:.9,d:.95,f:[62,52],v:'h',br:1,hs:.8,gu:.9,a:.55,ro:0},{t:1.85,d:.6,noise:1,v:['a','u'],a:.45}],.47]],
    win:[[1.95,[{t:0,d:.26,noise:1,v:'i',hs:1,a:.8},{t:.46,d:.26,noise:1,v:'i',hs:1,a:.7},{t:.92,d:.26,noise:1,v:'i',hs:1,a:.6},{t:1.3,d:.6,f:[62,54],v:'r',am:[.75,20],br:.5,a:.65,rel:.5}],.48]]}};
  B3CUE.salamander={spit:'c_spit',whip:'c_whip',whip2:'c_whip',burrow:'c_dive',crouch:'c_ring',erupt:'c_erupt',pant:'c_pant'};
  // under her big cries the lava gurgles
  {const _m=b3sayMore;b3sayMore=function(e,k,t){if(e.type!=='salamander')return _m.apply(this,arguments);
    if(k==='cry'||k==='angry'||k==='die'||k==='win'){const d=k==='die'?2.2:k==='win'?1.6:1.5,n=k==='die'?9:6;fNoise(t+.05,d,'lowpass',VR(260,.15),.8,.08,{brown:true,att:.2});
      for(let i=0;i<n;i++)fThump(t+.15+i*d/n+Math.random()*.08,VR(140,.25),VR(380,.25),.08,.07,.3)}}}
  // the bellows of the collar before every blow: «fff» when it opens like a sun (the Sputafuoco, the Frustata, the Eruzione), a lower «vuff»
  // when it folds (the Tuffo, the Anello), at .02 of the move in the boss's time
  const SL2BR={spit:'fff',whip:'fff',whip2:'fff',erupt:'fff',burrow:'vuff',crouch:'vuff'};
  {const _g=b3go;b3go=function(e,st){_g.apply(this,arguments);try{const k=e.type==='salamander'&&!(e.intro>0)&&SL2BR[st];if(k&&AU.ctx&&AU.on.sfx&&AU.ctx.state==='running'){
    const t=AU.ctx.currentTime+.01+.02*B3D(e,st)/sl2rt(e),v=Math.max(.55,enemyAt(e));SL2SND[k](t,v);AU.pan=0}}catch(err){}}}
  // the voices get ready in the rooms of her arena (and at once in her room)
  {const _br=buildRoom;buildRoom=function(){const r=_br.apply(this,arguments);try{const A=G&&G.mode!=='inf'&&!G.daily&&ARENAS[G.arena||0];
    if(A&&BOSSZ[A.boss]==='salamander'||G&&(G.enemies||[]).some(q=>q.type==='salamander'))B3VO.prep('salamander')}catch(err){}return r}}
  // her mocking gesture in her brain (a pause in her walk, never between two blows: she walks again a little before the next move)
  {const _su=salamUpd;salamUpd=function(e,dt,a,d){if(e.st!=='taunt')return _su.apply(this,arguments);if(!e.p2&&e.hp<e.max*.5){sl2moult(e,a);return}
    if(!e.mt&&Math.hypot(P.x-e.x,P.y-e.y)<70){e.wt=0;b3go(e,'walk',rand(.6,1));return}b3tick(e,dt*(e.p2?SL2.sp2:1));e.moving=false;e.face=a;e.curve=0;if(b3at(e,.62)||b3at(e,.76))sl2sfx('tick',e.x);if(e.stT<=0){e.wt=0;b3go(e,'walk',rand(.6,1))}}}
  // the defeat with her voice (the cry of the entrance and the rage are in bossIntro and the moult)
  {const _s=BDIE.salamander.setup;BDIE.salamander.setup=function(c){_s.apply(this,arguments);b3say(c,'die')}}}
// ---- for the previews (anteprime/mk_boss2.py) and the tests (tests/boss2gioco.js): how to get into her room, her moves in each phase, the
// dangers she puts in the room (counted by the tests) and the clips of her voice
if(SL2ON){const R=window.BCL||(window.BCL={});R.salamander={n:'Salamandra di Lava',arena:1,p2:true,
  enter(){G.arena=1;G.chapter=ARENAS[1].ch;G.diff=ARENAS[1].diff;G.bossLvl=null;G.room=ROOMS;G.event=null;buildRoom()},
  moves:['spit','whip','burrow','swim','breach','crouch','run','pant'],moves2:['rage','erupt','whip2','leap'],
  hz(){const B=G.sl2||{};return{avvisi:(B.warn||[]).length,palle:G.eproj.filter(q=>q.kind==='magma').length,fuoco:(B.fire||[]).length,geyser:(B.gey||[]).length,muta:B.husk?1:0,
    pinna:G.enemies.some(q=>q.type==='salamander'&&q.st==='swim')?1:0}},
  voice:['cry','laugh','angry','die']}}
