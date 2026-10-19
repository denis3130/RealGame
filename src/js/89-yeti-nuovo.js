// =====================================================================
// LO YETI DELLE VETTE RIFATTO: «la Montagna che Respira» (Denis, 15 ottobre: «rivisita tutti i boss … possenti, belli, fighi, che diano
// timore nello sfidarli», «migliora anche le loro abilità speciali»; 16 ottobre, dopo il Golem: «sì, fai gli altri 12»). ANTEPRIMA: questo
// file e il modello sprite/nemici3d/yeti2.js entrano solo nella copia del gioco fatta da anteprime/mk_boss2.py; nel gioco vero dopo il sì
// di Denis (il modello prende il posto di 'yeti' e questo file va in src/ordine.txt). Design e numeri: docs/boss-classici-design/yeti.md.
// Un gigante antichissimo delle vette, curvo, col mantello di neve sulla gobba e le corna da montone. Il suo avviso è IL RESPIRO: prima di
// ogni colpo prende fiato (il pelo si gonfia, la neve della stanza gli corre in bocca, si sente il fiato che sale con tre note di vetro) e
// il colpo parte con lo sbuffo; dopo il Soffio e il Ruggito resta senza fiato e si colpisce forte. «Prende fiato: scappa. Ha il fiatone:
// colpiscilo.» Ogni stato ha il nome di una mossa del modello; il colpo vero parte nel suo fotogramma (b3at, 81-boss3-base.js). Mosse:
// - Balzo del Gigante (leap): un cerchio rosso con la sua ombra ti insegue, si blocca, lui ricade: schegge di ghiaccio a raggiera, brina.
// - Pioggia di ghiaccioli (pound): tre dischi sotto le mani (sinistra, destra, tutte e due); a ogni schiaffo un ghiacciolo cade dove sei.
// - La palla che cresce (snowball): una corsia ti segue e si blocca; la palla rotola, cresce e ti insegue piano; si rompe sui blocchi.
// - Soffio gelido (breath): un cono che i blocchi di ghiaccio fermano (dietro, uno spicchio sicuro a righe); poi Senza fiato (gasp: +50%).
// - Fase 2 (rage, a metà vita): il pelo gela, le corna mettono i cristalli, gli artigli diventano lame; nella stanza la bufera.
// - Ruggito della valanga (roar): sei corsie, quattro rosse; due ondate di neve dal muro in alto (ripari: i blocchi di ghiaccio e lui).
// - Balzi della bufera (bound, bound, leap), Artigli di ghiaccio (claws: due mezzelune a X), la Pioggia con la stalattite, il Soffio che
//   spazza, la Palla doppia.
// Entrata (enter): la valanga lo porta e la montagna si sveglia. Sconfitta (die): torna neve. Mai due attacchi insieme, ogni danno con un
// avviso a terra di almeno 0,6 s veri (anche nella fase 2), un po' di camminata tra una mossa e l'altra.
// =====================================================================
const Y2ON=typeof N3!=='undefined'&&!!N3.yeti2;
const Y2={seq1:['leap','pound','snowball','breath'],seq2:['roar','bounds','claws','pound','breath','snowball'],red:'229,72,77',ice:'150,215,255',deep:'90,160,255',
  air:{leap:[.22,.8],bound:[.25,.8]},snow:['#ffffff','#eef5fc','#cfdeee']};
if(Y2ON){
  // the new model in place of the old one (its drawing of today stays as N3.meta.yeti.old for the pages)
  const old=N3.yeti,oldM=N3.meta.yeti;N3.yeti=N3.yeti2;N3.meta.yeti=Object.assign({},N3.meta.yeti2,{old:(x,y,f,a,p)=>old(x,y,f,oldM.an.includes(a)?a:'idle',p,oldM.sc||1,{})});
  Object.assign(ET.yeti,{r:34,hp:4700,cdmg:25});BOSS_INTRO.yeti=3.4;Object.assign(BDEATH,{yeti:{dur:4,clou:2.2,snd:'icicles'}});
  // the bar, the halo and the aura; the 2D spikes, breath and glints of the old yeti go (the model draws all of it)
  B2H.yeti=100;B2T.yeti=[[Y2.ice,Y2.deep],'235,245,255'];B2.yeti.back=()=>{};B2.yeti.front=()=>{};RUNEC.yeti=[Y2.ice,Y2.deep];ECOL.yeti='#6c84bd';ETELE.yeti=()=>{};
  // a dark shadow, so the body stands out on the white floor of the den; hidden while the avalanche is still bringing him in
  ESHADOW.yeti=e=>{if(e.intro>0&&(e.iT||0)<.55)return;const sz=1-Math.min(.5,(e.z||0)/200);shadow(e.x,e.y+6,46*sz,15*sz,.45)};
  // the walk follows its own clock (two steps in 1.3 s of the model)
  N3G.wp.yeti=e=>{const d=B3D(e,'walk');return(((e.wt||0)%d)+d)%d/d};
  // what the model is told: in the Furia the move before it still fades out in the first phase (no glimpse of the second before he
  // turns); in the Presa in giro the arm on our side, chosen when it starts (it never swaps arms as he turns to follow you)
  N3G.opt.yeti=e=>{const o={};if(e.st==='rage')o.p2=false;if(e.st==='taunt'&&e.tsd)o.tsd=e.tsd;return o};
  // voice and personality like the new bosses (88-boss3-voci.js); panting is no attack (no charging ring round him)
  B3S.add('yeti');B2CALM.add('gasp');
  // of the old aura only the snow falling round him stays
  {const _au=b2aura;b2aura=function(e,dt){if(e.type!=='yeti')return _au.apply(this,arguments);
    if(b2every(e,'sn',.12,dt))b2emit(e,{k:'snow',x:e.x+rand(-56,56),y:e.y-(e.z||0)-rand(95,135),vy:rand(18,28),life:2.8,ph:rand(0,9),r:rand(1,1.8)})}}
}
// ---- helpers
// the model's own drawings of the pieces of its attacks (design: Icicle(x,y,z,sc,o), Ball(x,y,r,spin,sc,o), Shard(x,y,z,a,sc,o),
// Crescent(x,y,a,w,k,sc,o); x, y the floor point); the game's simple drawings if the model has none
const y2art=n=>N3['yeti'+n]||N3['yeti2'+n]||null;
// model seconds in a real second (the second phase is 1.25 times faster, the boss of the higher arenas a little faster too)
const y2rt=e=>(e&&e.p2?1.25:1)*((G.bossLvl&&G.bossLvl.spd)||1);
const y2ad=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
const y2ez=u=>u*u*(3-2*u);
const y2boss=()=>G&&G.enemies?G.enemies.find(q=>q.type==='yeti'&&!q.dead):null;
// how far from (x,y) along a before a wall or an ice block
function y2reach(x,y,a,max){const ca=Math.cos(a),sa=Math.sin(a);let s=0;for(;s<max;s+=5){const px=x+ca*s,py=y+sa*s;if(px<L+2||px>R-2||py<TOP+2||py>BOT-2)break;
    if(G.rocks.some(k=>!k.temp&&Math.hypot(k.x-px,k.y-py)<k.r))break}return Math.min(s,max)}
// all he leaves in the room lives in G.y2: the warnings, the breath, the snowball lanes, the avalanche, the icicles, the balls, the
// crescents, his footprints and the blizzard of the second phase
function y2reset(){if(G)G.y2={warn:[],cone:null,sbl:null,waves:[],ice:[],balls:[],cres:[],prints:[],snow:0}}
{const _br=buildRoom;buildRoom=function(){y2reset();return _br.apply(this,arguments)}}
function y2warn(o){(G.y2||(y2reset(),G.y2)).warn.push(o);return o}
const y2fronts=()=>!!G.y2&&G.y2.waves.some(w=>w.st!=='done');
// no new move while something of the last one is still about (a ball rolling, an icicle falling, a crescent flying, the avalanche)
const y2busy=()=>{const B=G.y2;return!!B&&(B.balls.length>0||B.ice.length>0||B.cres.length>0||y2fronts())};
const y2air=e=>{const w=Y2.air[e.st];if(!w)return false;const k=b3k(e);return k>=w[0]&&k<w[1]};
// ---- what you hear: the air sucked in rising (500 → 2200 Hz) with three notes of glass (E, G, B: the chord of his theme), the «HAH!» of
// the blow, the fists on the chest, the crack of the ice growing on him, his panting, the rumble of the avalanche
const y2au=()=>typeof AU!=='undefined'&&AU.ctx&&AU.on.sfx&&AU.ctx.state==='running';
function y2inhale(e,dm,real){if(!y2au())return;try{const d=Math.max(.15,real?dm:dm/y2rt(e)),t=AU.ctx.currentTime+.01,v=Math.max(.55,enemyAt(e));
  fNoise(t,d+.05,'bandpass',500,1.3,.12*v,{f2:2200,att:d*.85,rev:.3});fNoise(t,d,'highpass',3200,.7,.025*v,{f2:6500,att:d*.8});
  [76,79,83].forEach((m,i)=>vBell(null,t+d*(.18+i*.27),m,.75,.028*v))}catch(err){}AU.pan=0}
function y2hah(e,k){if(!y2au())return;try{const t=AU.ctx.currentTime+.01,v=Math.max(.55,enemyAt(e))*(k||1);
  fNoise(t,.24,'bandpass',VR(760,.1),1.1,.17*v,{f2:330,att:.01,rev:.18});fThump(t,VR(110,.08),62,.14,.14*v,.1)}catch(err){}AU.pan=0}
function y2thump(e,k){if(!y2au())return;try{const t=AU.ctx.currentTime+.01,v=Math.max(.55,enemyAt(e))*(k||1);fThump(t,72,40,.2,.32*v,.15);fNoise(t,.08,'lowpass',420,.7,.12*v,{brown:true})}catch(err){}AU.pan=0}
function y2crack(e,i){if(!y2au())return;try{const t=AU.ctx.currentTime+.01,v=Math.max(.55,enemyAt(e));fNoise(t,.05,'highpass',2800,.7,.15*v);for(let j=0;j<3;j++)M.glass(t+j*.025,.55*v,VR(1700+i*350+j*220,.06))}catch(err){}AU.pan=0}
function y2pant(e){if(!y2au())return;try{const t=AU.ctx.currentTime+.01,v=Math.max(.5,enemyAt(e));fNoise(t,.16,'bandpass',VR(650,.1),1,.07*v,{f2:420,att:.02})}catch(err){}AU.pan=0}
function y2rumble(dur){if(!y2au())return;try{const t=AU.ctx.currentTime+.01;fNoise(t,dur,'lowpass',260,.7,.2,{brown:true,att:.25,rev:.35,f2:160});fNoise(t,dur*.8,'bandpass',900,.8,.05,{att:.3,f2:500})}catch(err){}}
// the claws rake the ice before the leap: a scratch and a few sparks of frost
function y2scrape(e){if(y2au())try{const t=AU.ctx.currentTime+.01,v=Math.max(.5,enemyAt(e));fNoise(t,.12,'highpass',VR(3200,.1),.8,.06*v,{f2:1800});M.glass(t+.02,.3*v,VR(2600,.1))}catch(err){}AU.pan=0;
  if(!LOWFX)for(const s of[-1,1]){const q=b3pt(e,-14,40*s);for(let i=0;i<3;i++)G.fx.push({k:'snowp',x:q.x+rand(-6,6),y:q.y-2,vx:rand(-40,40),vy:rand(-50,-10),t:.4})}}
// the shards of ice of the landings and of the stalactite: the 'ice' shot sound
{const _s=sfx;sfx=function(k,arg){if(k==='eshot'&&arg==='yice'){const A=[...arguments];A[1]='ice';return _s.apply(this,A)}return _s.apply(this,arguments)}}
// ---- marks on the floor: the snow trail of the ball, the four furrows of the claws (they stay for the whole fight)
function y2mark(kind,x,y,r,a){const c=fx;if(!c)return;c.save();c.setTransform(2,0,0,2,0,0);c.lineCap='round';
  if(kind==='trail'){c.fillStyle='rgba(244,250,255,.26)';c.beginPath();c.ellipse(x,y,r,r*.45,0,0,TAU);c.fill()}
  else if(kind==='claws'){const ca=Math.cos(a),sa=Math.sin(a),nx=-sa,ny=ca;for(let i=0;i<4;i++){const o=(i-1.5)*8+rand(-1.5,1.5),s0=rand(4,14),s1=r*rand(.75,1),bow=rand(-5,5);
      const ax=x+ca*s0+nx*o,ay=y+sa*s0+ny*o,bx=x+ca*s1+nx*o,by=y+sa*s1+ny*o,mx=(ax+bx)/2+nx*bow,my=(ay+by)/2+ny*bow;
      for(const[col,w,dy] of[['rgba(40,62,110,.42)',3,0],['rgba(250,253,255,.55)',1.2,-1.3]]){c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(ax,ay+dy);c.quadraticCurveTo(mx,my+dy,bx,by+dy);c.stroke()}}}
  c.restore()}
function y2step(x,y,a){const B=G.y2;if(!B)return;B.prints.push({x,y,a,t:0});if(B.prints.length>14)B.prints.shift()}
// ---- the brain
function y2walk(e,d){e.wt=.25*B3D(e,'walk');e.tsd=0;b3go(e,'walk',d||rand(1.1,1.6));e.moving=true}
function y2gasp(e){b3go(e,'gasp');e.moving=false;if(!G.y2txt){G.y2txt=1;text(e.x,e.y-128,'Senza fiato!','#ffd84a',18)}}
// the start of a move: its warnings that come at once
function y2go(e,st,a){const D=B3D(e,st),rt=y2rt(e);b3go(e,st);e.moving=false;e.lf=a;
  if(st==='bound'){e.tx=clamp(P.x,L+e.r,R-e.r);e.ty=clamp(P.y,TOP+e.r,BOT-e.r);const t=.8*D/rt;e.lw=y2warn({k:'land',x:e.tx,y:e.ty,r:44,t,max:t,lock:true})}
  else if(st==='pound')e.pd=[[36,-30,34,.42,20],[36,30,34,.56,20],[40,0,46,.74,24]].map(([bx,by,r,at,dm])=>{const q=b3pt(e,bx,by,a),t=at*D/rt;return{x:q.x,y:q.y,r,dm,w:y2warn({k:'disc',x:q.x,y:q.y,r,t,max:t})}});
  else if(st==='claws')e.cb=[y2band(e,30,a,.48*D/rt)];
  else if(st==='snowball')G.y2.sbl=null}
// a red band 80 wide from a hand (the floor point under it) toward you, as far as the wall or the first ice block; it fills in t
function y2band(e,by,a,t){const q=b3pt(e,30,by,a),an=Math.atan2(P.y-q.y,P.x-q.x),len=Math.max(40,y2reach(q.x,q.y,an,900));return{x:q.x,y:q.y,a:an,len,w:y2warn({k:'band',x:q.x,y:q.y,a:an,len,wd:80,t,max:t})}}
function y2next(e,a){const seq=e.p2?Y2.seq2:Y2.seq1;let nx=seq[(e.si=(e.si==null?-1:e.si)+1)%seq.length];e.bn=0;if(nx==='bounds'){nx='bound';e.bn=1}y2go(e,nx,a)}
function y2rage(e){e.p2=true;e.shell=9;e.z=0;e.sx=null;e.pd=null;e.cb=null;e.lw=null;e.bn=0;
  banner('Lo Yeti scatena la valanga','Fase 2',1.6);bossRage(e,Y2.deep);$('bossBar').classList.add('rage');shake(8);G.eproj=[];y2reset();
  b3go(e,'rage');e.moving=false;b3say(e,'angry')}
// the landing of a leap (big) or of a short hop: the hit where the circle was
function y2land(e,big){const p2=e.p2,x=e.tx!=null?e.tx:e.x,y=e.ty!=null?e.ty:e.y,r=big?54:44;e.z=0;e.x=x;e.y=y;moveCircle(e,0,0);
  if(e.lw){e.lw.t=0;e.lw=null}
  if(Math.hypot(P.x-x,P.y-y)<r+P.r*.4)hurtP(Math.round((big?26:18)*DMG()));
  if(big){const n=p2?16:12,o=rand(0,TAU);for(let i=0;i<n;i++)shootE(x,y-10,o+i*TAU/n,140,6,10,'yice');addZone(x,y,56,3,'frost');stamp('crater',x,y+4,36);
    vfxBlast(x,y,'220,240,255',110,{debris:ICE_T,n:B3N(24),sparks:B3N(12),spcol:['#ffffff','#c9f3ff'],dust:B3N(16),cracks:44});dustRing(x,y);
    if(BOSS2){ENV2.rocks(x,y,190,3);ENV2.fall(B3N(10),true);ENV2.chunks(x,y,B3N(16),ICE_T,150)}shake(9);sfx('boom',0,x);vib([50,30,70])}
  else{addZone(x,y,30,2,'frost');stamp('cracks',x,y+4,30);vfxBlast(x,y,'220,240,255',70,{debris:ICE_T,n:B3N(12),sparks:B3N(6),spcol:['#ffffff','#c9f3ff'],dust:B3N(10),ring2:false});
    if(BOSS2)ENV2.rocks(x,y,120,1.5);shake(5);sfx('boom',0,x);vib(30)}}
// a slap of the Pioggia: the disc under the hand, and an icicle where you are (and where you are going)
function y2slap(e,i){const d=e.pd&&e.pd[i];if(!d)return;y2hah(e,i===2?1.2:1);
  if(Math.hypot(P.x-d.x,P.y-d.y)<d.r+P.r*.4)hurtP(Math.round(d.dm*DMG()));
  stamp('cracks',d.x,d.y,22);vfxBlast(d.x,d.y,'225,242,255',d.r*1.6,{debris:Y2.snow,n:B3N(10),sparks:B3N(5),spcol:['#ffffff','#c9f3ff'],dust:B3N(8),ring2:false});
  shake(i===2?6:3);sfx('boom',0,d.x);if(i===2){stamp('crater',d.x,d.y,30);if(BOSS2)ENV2.rocks(d.x,d.y,150,2);vib([40,20,60])}
  const here={x:P.x,y:P.y},go={x:P.x+(P.vxs||0)*.6,y:P.y+(P.vys||0)*.6},T=[here];if(i===2||(i===1&&e.p2))if(Math.hypot(go.x-here.x,go.y-here.y)>26)T.push(go);
  for(const q of T)y2icicle(q.x,q.y,false,e.p2)}
function y2icicle(x,y,big,p2){const B=G.y2;if(!B)return;x=clamp(x,L+18,R-18);y=clamp(y,TOP+18,BOT-18);
  B.ice.push({x,y,big,p2:!!p2,t:0,dur:big?1.1:.85,fall:big?.3:.25,r:big?40:20,land:false,sh:0,seed:Math.random()*10});if(big)sfx('freeze',1,x)}
function y2iceLand(c){const big=c.big;if(Math.hypot(P.x-c.x,P.y-c.y)<c.r+P.r*.4)hurtP(Math.round((big?22:14)*DMG()));
  addZone(c.x,c.y,c.r,big?3:2.5,'frost');sfx('iceBreak',0,c.x);shake(big?6:2);
  vfxBlast(c.x,c.y,'210,240,255',big?80:36,{debris:ICE_T,n:B3N(big?16:6),sparks:B3N(big?10:4),spcol:['#ffffff','#c9f3ff'],dust:B3N(big?10:3),ring2:false});
  if(big){const o=rand(0,TAU);for(let i=0;i<6;i++)shootE(c.x,c.y-8,o+i*TAU/6,140,6,10,'yice');stamp('crater',c.x,c.y,24);if(BOSS2)ENV2.rocks(c.x,c.y,110,1.5)}}
function y2ball(e,l){if(!l||l.gone)return;l.gone=true;G.y2.balls.push({x:l.x,y:l.y,a:l.a,r:14,t:0,spin:0,p2:!!e.p2,tr:0});y2hah(e);sfx('snowball',2,l.x);shake(2)}
function y2cres(e,i){const b=e.cb&&e.cb[i];if(!b)return;G.y2.cres.push({x:b.x,y:b.y,a:b.a,len:b.len,t:0,w:80,hit:false,p2:!!e.p2});y2hah(e);
  if(y2au())try{whoosh(AU.ctx.currentTime+.01,.32,2600,700,.12,.25);M.glass(AU.ctx.currentTime+.03,.5,VR(2400,.05))}catch(err){}}
// the breath: the cone hurts you if you are in it, nearer than its front and not behind an ice block (it slows you and pushes you back)
function y2breathHit(C,rdt){const dx=P.x-C.x,dy=P.y-C.y,d=Math.hypot(dx,dy),an=Math.atan2(dy,dx);
  if(d<C.front&&Math.abs(y2ad(an,C.cur))<C.half&&d<y2reach(C.x,C.y,an,C.len)+P.r*.5&&P.dashT<=0){P.mire=Math.max(P.mire||0,1.2);moveCircle(P,Math.cos(an)*40*rdt,Math.sin(an)*40*rdt);
    C.tick-=rdt;if(C.tick<=0&&C.hits<3&&P.inv<=0){C.tick=.3;C.hits++;hurtP(Math.round(8*DMG()))}}}
// after the breath, frost along its axis (before the block that stopped it), and a fan of frost on the floor
function y2frostLine(C){const a=C.a,re=y2reach(C.x,C.y,a,300),ca=Math.cos(a),sa=Math.sin(a);for(const s of[70,130,190,250])if(s<re-14)addZone(C.x+ca*s,C.y+sa*s,28,4,'frost');
  if(BOSS2)for(const o of[-.3,.3]){const s=Math.min(y2reach(C.x,C.y,a+o,300),150);ENV2.mark('frost',C.x+Math.cos(a+o)*s,C.y+Math.sin(a+o)*s,34)}}
// the torches the breath reaches burn blue for a while
function y2torches(C){const T=G.torches||[],lo=C.p2?Math.min(C.a0,C.a1):C.a,hi=C.p2?Math.max(C.a0,C.a1):C.a,m=(lo+hi)/2,hw=(hi-lo)/2+C.half+.15;
  if(T.some(t=>Math.hypot(t.x-C.x,t.y-C.y)<C.len+90&&Math.abs(y2ad(Math.atan2(t.y-C.y,t.x-C.x),m))<hw))b3torch('blue',1.5)}
// the avalanche: six lanes from the top wall to the bottom one; four red, two free (one of them near you, the other not next to it, so
// that both can move over by one lane for the second wave and never fall on the same ones)
function y2lanes(){const B=G.y2,w=(R-L)/6,cx=i=>L+w*(i+.5),near=[0,1,2,3,4,5].filter(i=>Math.abs(cx(i)-P.x)<140);
  const A=near.length?pk(near):clamp(Math.floor((P.x-L)/w),0,5),opts=[];
  for(let b=0;b<6;b++){if(Math.abs(b-A)<2)continue;for(const s of[-1,1])if(A+s>=0&&A+s<6&&b+s>=0&&b+s<6)opts.push([b,s])}
  const[b,s]=opts.length?pk(opts):[(A+3)%6,A<3?1:-1],f1=[A,b],f2=[A+s,b+s],all=[0,1,2,3,4,5];
  B.waves=[{lanes:all.filter(i=>!f1.includes(i)),st:'warn',y:TOP,hit:false,wait:null},{lanes:all.filter(i=>!f2.includes(i)),st:'wait',y:TOP,hit:false,wait:null}]}
function y2wave(i){const B=G.y2,W=B&&B.waves[i];if(!W)return;W.st='run';W.y=TOP;shake(4);sfx('quake',0,AW/2);y2rumble(2.8);if(B.waves[i+1]){B.waves[i+1].st='warn';B.waves[i+1].wait=1.4}}
// a front can't hit you right under an ice block (or under the Yeti himself): it breaks there
function y2shelter(x,y){if(G.rocks.some(k=>!k.temp&&Math.abs(x-k.x)<k.r&&y>k.y))return true;const e=y2boss();return!!e&&Math.abs(x-e.x)<e.r&&y>e.y}
function y2waveHit(W){if(W.hit||P.inv>0||P.dashT>0)return;const w=(R-L)/6,li=Math.floor((P.x-L)/w);if(!W.lanes.includes(li)||Math.abs(P.y-W.y)>=22+P.r||y2shelter(P.x,P.y))return;
  W.hit=true;hurtP(Math.round(20*DMG()));P.push={vx:0,vy:200,t:.25}}
if(Y2ON)EUPD.yeti=function(e,dt,sm,a,d){const sp=e.p2?1.25:1;dt*=sp;// the second phase runs 1.25 times faster (n3Move draws the model at the same pace)
  if(!G.y2)y2reset();const B=G.y2;
  // half health: the second phase (never in the air: he lands first)
  if(!e.p2&&e.hp<e.max*.5&&!y2air(e)){y2rage(e);return}
  b3tick(e,dt);const p2=e.p2,k=b3k(e),rdt=dt/y2rt(e);
  switch(e.st){
  case 'walk':{e.face=navAngle(e);e.moving=true;const w0=e.wt||0;e.wt=w0+dt;const D=B3D(e,'walk'),ph0=(w0%D)/D,ph1=(e.wt%D)/D;
    // (the foot is planted 2 + its stride in front of him: 13.65, 16 in the second phase, where he walks faster so it never slides)
    if(ph1<ph0||(ph0<.5&&ph1>=.5)){const f=b3pt(e,e.p2?18:15.65,ph1<ph0?18:-18);stepFx(f.x,f.y-4,true);G.shake=Math.max(G.shake,1.5);y2step(f.x,f.y,e.face)}
    const vw=e.p2?49.2:42;moveCircle(e,Math.cos(e.face)*vw*dt,Math.sin(e.face)*vw*dt);
    const q=((ph1-.25)%.5+.5)%.5,near=Math.min(q,.5-q)<.045;
    if(e.stT<=0&&!y2busy()&&(near||e.stT<-.6)){e.moving=false;y2next(e,a)}
    break}
  // ---- BALZO DEL GIGANTE: breath (.04), the claws rake the ice, he springs (.22): the circle follows you until .40 and locks, he lands (.80)
  case 'leap':{e.moving=false;const D=B3D(e,'leap');
    if(k<.22){e.face=a;e.lf=a}else if(e.sx!=null&&Math.hypot(e.tx-e.sx,e.ty-e.sy)>4)e.face=Math.atan2(e.ty-e.sy,e.tx-e.sx);else e.face=e.lf;
    if(b3at(e,.04))y2inhale(e,.4);if(b3at(e,.1)||b3at(e,.16))y2scrape(e);
    if(b3at(e,.22)){e.sx=e.x;e.sy=e.y;e.tx=clamp(P.x,L+e.r,R-e.r);e.ty=clamp(P.y,TOP+e.r,BOT-e.r);const fl=.58*D/y2rt(e);
      e.lw=y2warn({k:'land',x:e.tx,y:e.ty,r:54,t:fl,max:fl,lock:false});y2hah(e);sfx('dash',0,e.x);shake(3);stamp('cracks',e.x,e.y+4,18)}
    if(k>=.22&&k<.4&&e.lw){const dx=P.x-e.tx,dy=P.y-e.ty,dd=Math.hypot(dx,dy);if(dd>1){const s=Math.min(dd,130*rdt);e.tx=clamp(e.tx+dx/dd*s,L+e.r,R-e.r);e.ty=clamp(e.ty+dy/dd*s,TOP+e.r,BOT-e.r)}e.lw.x=e.tx;e.lw.y=e.ty}
    if(b3at(e,.4)&&e.lw){e.lw.lock=true;sfx('click',0,e.tx);fxPush({k:'flash',x:e.tx,y:e.ty,r:64,rgb:'255,255,255',t:.2,max:.2})}
    if(k>=.22&&k<.8&&e.sx!=null){const u=(k-.22)/.58,q=y2ez(u);e.x=e.sx+(e.tx-e.sx)*q;e.y=e.sy+(e.ty-e.sy)*q;e.z=150*Math.sin(Math.PI*u)}
    if(b3at(e,.8))y2land(e,true);
    if(e.stT<=0){e.z=0;e.sx=null;e.bn=0;y2walk(e)}break}
  // ---- BALZO CORTO (second phase, three in a row with the leap): the circle where you are at once, the hop (.25), the landing (.80)
  case 'bound':{e.moving=false;
    if(k<.25)e.face=a;else if(e.sx!=null&&Math.hypot(e.tx-e.sx,e.ty-e.sy)>4)e.face=Math.atan2(e.ty-e.sy,e.tx-e.sx);
    if(b3at(e,.02))y2inhale(e,.2);
    if(b3at(e,.25)){e.sx=e.x;e.sy=e.y;y2hah(e,.8);sfx('dash',0,e.x)}
    if(k>=.25&&k<.8&&e.sx!=null){const u=(k-.25)/.55,q=y2ez(u);e.x=e.sx+(e.tx-e.sx)*q;e.y=e.sy+(e.ty-e.sy)*q;e.z=60*Math.sin(Math.PI*u)}
    if(b3at(e,.8))y2land(e,false);
    if(e.stT<=0){e.z=0;e.sx=null;if(e.bn===1){e.bn=2;y2go(e,'bound',a)}else{e.bn=3;y2go(e,'leap',a)}}break}
  // ---- PIOGGIA DI GHIACCIOLI: three discs at once (.42 left hand, .56 right, .74 both), an icicle on you at each slap; the stalactite (.86)
  case 'pound':{e.moving=false;e.face=e.lf;
    if(b3at(e,.04))y2inhale(e,.45);
    if(b3at(e,.42))y2slap(e,0);if(b3at(e,.56))y2slap(e,1);if(b3at(e,.74))y2slap(e,2);
    if(b3at(e,.8)&&BOSS2)ENV2.fall(B3N(6),true);
    if(p2&&b3at(e,.86))y2icicle(P.x,P.y,true,true);
    if(e.stT<=0){e.pd=null;y2walk(e)}break}
  // ---- LA PALLA CHE CRESCE: the lane from the right hand follows you (.14) and locks (.40); the ball leaves the hand (.60). In the
  // second phase one ball for each hand, in a V (.52 the left, .66 the right; their lanes from .06)
  case 'snowball':{e.moving=false;e.face=e.lf;const t0=p2?.06:.14;
    if(b3at(e,.4))y2inhale(e,.3);
    if(b3at(e,t0)){B.sbl=(p2?[[-16,-.384],[16,.384]]:[[16,0]]).map(([by,off])=>{const q=b3pt(e,30,by,e.lf);return{by,off,x:q.x,y:q.y,a:Math.atan2(P.y-q.y,P.x-q.x)+off,lock:false,gone:false,len:40}});sfx('snowball',1,e.x)}
    if(B.sbl){for(const l of B.sbl){if(l.gone)continue;const q=b3pt(e,30,l.by,e.lf);l.x=q.x;l.y=q.y;
        if(!l.lock){const want=Math.atan2(P.y-q.y,P.x-q.x)+l.off;l.a+=clamp(y2ad(want,l.a),-1.571*rdt,1.571*rdt)}l.len=Math.max(30,y2reach(l.x,l.y,l.a,320))}
      if(b3at(e,.4)){for(const l of B.sbl)l.lock=true;sfx('click',0,e.x)}
      if(p2){if(b3at(e,.52))y2ball(e,B.sbl[0]);if(b3at(e,.66))y2ball(e,B.sbl[1])}else if(b3at(e,.6))y2ball(e,B.sbl[0])}
    if(e.stT<=0){B.sbl=null;y2walk(e)}break}
  // ---- SOFFIO GELIDO: the great breath (.02–.42); the cone follows you at most 70°/s, locks (.12); he blows (.42–.80). In the second phase
  // the cone is narrower and sweeps 110° toward the side with more room, turning his body with it. Then he is out of breath
  case 'breath':{e.moving=false;let C=B.cone;
    if(b3at(e,.02)){y2inhale(e,1.2);const o=b3pt(e,46,0,e.lf);C=B.cone={x:o.x,y:o.y,a:Math.atan2(P.y-o.y,P.x-o.x),cur:0,half:p2?.349:.524,len:p2?300:270,lock:false,fire:false,front:0,hits:0,tick:0,p2}}
    if(C){if(!C.lock){const o=b3pt(e,46,0,C.a),want=Math.atan2(P.y-o.y,P.x-o.x);C.a+=clamp(y2ad(want,C.a),-1.222*rdt,1.222*rdt)}
      if(b3at(e,.12)){C.lock=true;sfx('click',0,e.x);if(p2){const r1=y2reach(C.x,C.y,C.a+.96,420),r0=y2reach(C.x,C.y,C.a-.96,420),s=r1>=r0?1:-1;C.a0=C.a-s*.96;C.a1=C.a+s*.96}}
      C.cur=C.lock&&p2?(k<.42?C.a+(C.a0-C.a)*y2ez(clamp((k-.12)/.3,0,1)):k<.8?C.a0+(C.a1-C.a0)*((k-.42)/.38):C.a1):C.a;
      e.face=C.cur;const o=b3pt(e,46,0,C.cur);C.x=o.x;C.y=o.y;
      if(b3at(e,.42)){C.fire=true;C.front=0;C.tick=0;b3say(e,'c_breath');sfx('freeze',2,e.x);fxPush({k:'flash',x:C.x,y:C.y-70,r:44,rgb:'220,245,255',t:.2,max:.2});y2torches(C)}
      if(C.fire&&k<.8){C.front=Math.min(C.len,C.front+520*rdt);y2breathHit(C,rdt)}
      if(b3at(e,.8)){C.fire=false;C.done=true;y2frostLine(C)}}
    if(e.stT<=0){B.cone=null;y2gasp(e)}break}
  // ---- SENZA FIATO: bent over, hands on the knees, four short puffs; the blows hurt him more (hurtE below)
  case 'gasp':{e.moving=false;for(const s of[.12,.34,.56,.78])if(b3at(e,s))y2pant(e);if(e.stT<=0)y2walk(e);break}
  // ---- FASE 2: no damage, no attacks; four blows on the chest, the frost runs over the fur (.16–.40), the crystals crack (.50–.58),
  // the howl (.62): the blizzard comes into the room; then at once the Ruggito della valanga
  case 'rage':{e.moving=false;e.face=a;
    [.16,.24,.32,.4].forEach((s,i)=>{if(b3at(e,s)){y2thump(e,.7+i*.12);fxPush({k:'ring2',x:e.x,y:e.y-58,rgb:'225,242,255',r0:12,r1:46+i*12,t:.34,max:.34,w:3+i});shake(1.5+i*.8)}});
    [.5,.54,.58].forEach((s,i)=>{if(b3at(e,s))y2crack(e,i)});
    if(b3at(e,.62)){sfx('roar',0,e.x);shake(8);vib([60,40,120]);for(let i=0;i<3;i++)setTimeout(()=>{if(G&&G.fx)fxPush({k:'ring2',x:e.x,y:e.y-e.r,rgb:'255,255,255',r0:e.r,r1:e.r*5,t:.45,max:.45,w:6-i*1.5})},i*170);
      b3torch('blue',4);if(BOSS2)ENV2.fall(B3N(14),true);vfxBlast(e.x,e.y-70,'200,235,255',90,{sparks:B3N(16),spcol:['#ffffff','#c9f3ff'],dust:false,ring2:false});G.y2.snow=1}
    if(e.stT<=0){e.shell=0;e.si=0;y2go(e,'roar',a)}break}
  // ---- RUGGITO DELLA VALANGA: three blows on the chest, the howl (.30: the lanes of the first wave), the first wave (.70), the second
  // 1.4 s later; then he is out of breath while the snow comes down (from a free lane you can hit him), and no new move until it is over
  case 'roar':{e.moving=false;e.face=a;
    if(b3at(e,.02))y2inhale(e,.6);
    for(const s of[.1,.18,.26])if(b3at(e,s)){y2thump(e,.9);fxPush({k:'ring2',x:e.x,y:e.y-58,rgb:'235,245,255',r0:12,r1:58,t:.32,max:.32,w:4})}
    if(b3at(e,.3)){b3say(e,'c_howl',true);b3torch('blue',3);if(BOSS2)ENV2.fall(B3N(12),true);y2lanes()}
    if(k>=.3&&k<.7)G.shake=Math.max(G.shake,2.2);
    if(b3at(e,.7))y2wave(0);
    if(e.stT<=0)y2gasp(e);break}
  // ---- ARTIGLI DI GHIACCIO: the band from the right hand toward you (.00, fills until .48), the band from the left hand toward where you
  // are then (.18, fills until .66): a crescent of frost flies along each (.48, .66)
  case 'claws':{e.moving=false;e.face=e.lf;const D=B3D(e,'claws');
    if(b3at(e,.04))y2inhale(e,.4);
    if(b3at(e,.18)&&e.cb)e.cb.push(y2band(e,-30,e.lf,(.66-.18)*D/y2rt(e)));
    if(b3at(e,.48))y2cres(e,0);if(b3at(e,.66))y2cres(e,1);if(b3at(e,.8))y2pant(e);
    if(e.stT<=0){e.cb=null;y2walk(e)}break}
  // ---- PRESA IN GIRO (88-boss3-voci.js starts it while he walks): «come here», then he walks again a little before the next move
  case 'taunt':{e.moving=false;e.face=a;if(!e.tsd)e.tsd=Math.cos(e.f3!=null?e.f3:e.face)>=0?1:-1;if(e.stT<=0)y2walk(e,rand(.6,1));break}
  default:y2walk(e)}};
// out of breath: the blows hurt him more
{const _h=hurtE;hurtE=function(e,d){if(Y2ON&&e&&e.type==='yeti'&&e.st==='gasp'){const A=[...arguments];A[1]=d*1.5;return _h.apply(this,A)}return _h.apply(this,arguments)}}
// ---- the dangers in flight and on the floor (real time: they never speed up)
function y2update(dt){const B=G.y2;if(!B)return;if(G.state!=='play'){if(B.warn.length||B.ice.length||B.balls.length||B.cres.length||B.waves.length||B.cone){const sn=B.snow;y2reset();G.y2.snow=sn}return}
  for(let i=B.warn.length-1;i>=0;i--){B.warn[i].t-=dt;if(B.warn[i].t<=0)B.warn.splice(i,1)}
  for(let i=B.prints.length-1;i>=0;i--){B.prints[i].t+=dt;if(B.prints[i].t>8)B.prints.splice(i,1)}
  // the icicles: a shadow that grows (.85 s), the fall (the last .25 s), then they shatter; the stalactite 1.1 s and .3 s
  for(let i=B.ice.length-1;i>=0;i--){const c=B.ice[i];c.t+=dt;if(!c.land&&c.t>=c.dur){c.land=true;y2iceLand(c)}if(c.land){c.sh=(c.t-c.dur)/.35;if(c.sh>=1)B.ice.splice(i,1)}}
  // the balls: they grow (5 px/s up to 30) and speed up (130 → 145 px/s, always slower than you), turning toward you at most 55°/s
  for(let i=B.balls.length-1;i>=0;i--){const b=B.balls[i];b.t+=dt;b.r=Math.min(30,14+5*b.t);const sp=130+15*(b.r-14)/16;
    b.a+=clamp(y2ad(Math.atan2(P.y-b.y,P.x-b.x),b.a),-.96*dt,.96*dt);const ca=Math.cos(b.a),sa=Math.sin(b.a);b.x+=ca*sp*dt;b.y+=sa*sp*dt;b.spin+=sp*dt/b.r;b.tr+=sp*dt;
    if(b.tr>12){b.tr=0;y2mark('trail',b.x,b.y+2,b.r*.75)}
    let end=b.dead?'ball':null;
    if(!end&&Math.hypot(P.x-b.x,P.y-b.y)<b.r+P.r&&P.inv<=0&&P.dashT<=0){hurtP(Math.round(20*DMG()));P.push={vx:ca*160,vy:sa*160,t:.25};end='hero'}
    if(!end&&(b.x<L+b.r*.8||b.x>R-b.r*.8||b.y<TOP+b.r*.5||b.y>BOT-b.r*.3))end='wall';
    if(!end){const k=G.rocks.find(k=>!k.temp&&Math.hypot(k.x-b.x,k.y-b.y)<k.r+b.r*.85);if(k){end='rock';if(BOSS2)ENV2.rocks(k.x,k.y,k.r+6,0);else k.hit=.3}}
    if(!end){const o=B.balls.find(o=>o!==b&&!o.dead&&Math.hypot(o.x-b.x,o.y-b.y)<o.r+b.r);if(o){end='ball';o.dead=1}}
    if(!end&&b.t>=3.5)end='melt';
    if(end){B.balls.splice(i,1);if(end==='melt'){addZone(b.x,b.y,26,3,'frost');fxPush({k:'puff',x:b.x,y:b.y-b.r*.5,vx:0,vy:-12,t:.5,r:b.r*.6});sfx('snowball',1,b.x)}
      else{vfxBlast(b.x,b.y-b.r*.6,'235,245,255',b.r*2.2,{debris:Y2.snow,n:B3N(14),sparks:0,dust:B3N(10),ring2:false});sfx('snowball',2,b.x);shake(end==='hero'?3:2)}}}
  // the avalanche: the second wave waits 1.4 s; the fronts run down at 260 px/s and leave mounds of snow along the bottom wall
  for(let wi=0;wi<B.waves.length;wi++){const W=B.waves[wi];
    if(W.st==='warn'&&W.wait!=null){W.wait-=dt;if(W.wait<=0){W.wait=null;y2wave(wi)}}
    else if(W.st==='run'){W.y+=260*dt;y2waveHit(W);
      if(W.y>BOT+28){W.st='done';const w=(R-L)/6;for(const li of W.lanes)addZone(L+w*(li+.5),BOT-16,22,4,'frost');shake(2)}}}
  // the crescents of frost: 300 px/s along their band; they break against the block (or the wall) at its end and leave the claw marks
  for(let i=B.cres.length-1;i>=0;i--){const c=B.cres[i];c.t+=dt;const s=Math.min(c.len,300*c.t),ca=Math.cos(c.a),sa=Math.sin(c.a);
    if(!c.hit&&P.inv<=0&&P.dashT<=0){const ux=P.x-c.x,uy=P.y-c.y,u=ux*ca+uy*sa,v=Math.abs(uy*ca-ux*sa);if(Math.abs(u-s)<14&&v<c.w/2+P.r*.5){c.hit=true;hurtP(Math.round(16*DMG()))}}
    if(300*c.t>=c.len){B.cres.splice(i,1);const x=c.x+ca*c.len,y=c.y+sa*c.len,k=G.rocks.find(k=>!k.temp&&Math.hypot(k.x-x,k.y-y)<k.r+14);
      if(k){k.hit=Math.max(k.hit||0,.3);k.dmg=(k.dmg||0)+2}vfxBlast(x,y-16,'200,235,255',44,{debris:ICE_T,n:B3N(8),sparks:B3N(8),spcol:['#ffffff','#c9f3ff'],dust:B3N(4),ring2:false});
      sfx('iceBreak',0,x);y2mark('claws',c.x,c.y,Math.min(c.len,130),c.a)}}}
{const _u=update;update=function(dt){_u.apply(this,arguments);try{if(Y2ON&&G&&G.y2&&started&&!paused)y2update(dt)}catch(err){console.error(err)}}}
// ---- drawings
let Y2PAT=null;
// stripes: light blue for the safe wedges behind the blocks, red for the lanes of the avalanche
function y2pat(red){const k=red?'r':'b';if(!Y2PAT||Y2PAT.ctx!==ctx)Y2PAT={ctx};if(Y2PAT[k]!==undefined)return Y2PAT[k];
  try{const c=document.createElement('canvas');c.width=c.height=14;const x=c.getContext('2d');x.strokeStyle=red?'rgba(229,72,77,.32)':'rgba(195,232,255,.6)';x.lineWidth=red?4:3;
    x.beginPath();for(const o of[-14,0,14]){x.moveTo(o-2,16);x.lineTo(o+16,-2)}x.stroke();Y2PAT[k]=ctx.createPattern(c,'repeat')}catch(err){Y2PAT[k]=null}return Y2PAT[k]}
// the rays of a cone (every 3°), each as long as the wall or the first ice block lets it
function y2rays(C,a,half,cap){const n=Math.max(2,Math.ceil(half*2/.0524)),out=[];for(let i=0;i<=n;i++){const an=a-half+half*2*i/n;out.push([an,Math.min(cap==null?C.len:cap,y2reach(C.x,C.y,an,C.len))])}return out}
function y2fan(C,R0){ctx.beginPath();ctx.moveTo(C.x,C.y);for(const[an,d] of R0)ctx.lineTo(C.x+Math.cos(an)*d,C.y+Math.sin(an)*d);ctx.closePath()}
// the warning of the breath: the cone (dashed while it follows you, solid once locked); in the second phase the whole fan of the sweep,
// its first wedge full and an arrow the way it turns; behind the ice blocks the safe wedges, striped light blue
function y2coneWarn(C,t){if(C.fire||C.done)return;const pu=.55+.3*Math.sin(t*18);let lo=C.cur-C.half,hi=C.cur+C.half;ctx.save();ctx.lineJoin='round';
  if(C.p2&&C.lock){lo=Math.min(C.a0,C.a1)-C.half;hi=Math.max(C.a0,C.a1)+C.half;const F=y2rays(C,(lo+hi)/2,(hi-lo)/2);y2fan(C,F);ctx.fillStyle=`rgba(${Y2.red},.08)`;ctx.fill();
    ctx.strokeStyle=`rgba(${Y2.red},${pu.toFixed(3)})`;ctx.lineWidth=2;ctx.setLineDash([8,6]);ctx.stroke();ctx.setLineDash([]);
    y2fan(C,y2rays(C,C.a0,C.half));ctx.fillStyle=`rgba(${Y2.red},${(.2+.1*Math.sin(t*20)).toFixed(3)})`;ctx.fill();ctx.lineWidth=2.4;ctx.stroke();
    // the arrow along the arc
    const s=Math.sign(C.a1-C.a0),rr=Math.min(150,y2reach(C.x,C.y,C.a1,C.len)*.8);ctx.strokeStyle=`rgba(${Y2.red},.85)`;ctx.lineWidth=4;ctx.lineCap='round';ctx.beginPath();ctx.arc(C.x,C.y,rr,C.a0+s*.15,C.a1,s<0);ctx.stroke();
    const ex=C.x+Math.cos(C.a1)*rr,ey=C.y+Math.sin(C.a1)*rr,ta=C.a1+s*Math.PI/2;ctx.fillStyle=`rgba(${Y2.red},.9)`;ctx.beginPath();ctx.moveTo(ex+Math.cos(ta)*12,ey+Math.sin(ta)*12);
    ctx.lineTo(ex+Math.cos(ta+2.5)*11,ey+Math.sin(ta+2.5)*11);ctx.lineTo(ex+Math.cos(ta-2.5)*11,ey+Math.sin(ta-2.5)*11);ctx.closePath();ctx.fill()}
  else{const F=y2rays(C,C.cur,C.half);y2fan(C,F);ctx.fillStyle=`rgba(${Y2.red},${C.lock?(.16+.1*Math.sin(t*24)).toFixed(3):.1})`;ctx.fill();
    ctx.strokeStyle=`rgba(${Y2.red},${pu.toFixed(3)})`;ctx.lineWidth=C.lock?2.6:2;if(!C.lock)ctx.setLineDash([8,6]);ctx.stroke();ctx.setLineDash([]);
    // the cold of the boss as a light inside the warning
    ctx.save();ctx.globalCompositeOperation='lighter';glow(Y2.ice,C.x+Math.cos(C.cur)*C.len*.35,C.y+Math.sin(C.cur)*C.len*.35,C.len*.3,.16);ctx.restore()}
  // the safe wedges behind the blocks
  const S=y2rays(C,(lo+hi)/2,(hi-lo)/2),pat=y2pat(false);ctx.fillStyle=pat||'rgba(195,232,255,.3)';
  for(let i=0;i<S.length-1;i++){const[a0,d0]=S[i],[a1,d1]=S[i+1];if(d0>=C.len-6||d1>=C.len-6)continue;if(Math.min(d0,d1)<20)continue;ctx.beginPath();
    ctx.moveTo(C.x+Math.cos(a0)*d0,C.y+Math.sin(a0)*d0);ctx.lineTo(C.x+Math.cos(a0)*C.len,C.y+Math.sin(a0)*C.len);ctx.lineTo(C.x+Math.cos(a1)*C.len,C.y+Math.sin(a1)*C.len);ctx.lineTo(C.x+Math.cos(a1)*d1,C.y+Math.sin(a1)*d1);ctx.closePath();ctx.fill()}
  ctx.restore()}
// the blizzard of the second phase: twelve streaks of snow driven by the wind (right and a little up), never a veil; six still ones with LOWFX
function y2blizzard(t){const vx=G.vx||0,vy=G.vy||0,n=LOWFX?6:12;ctx.save();ctx.lineCap='round';
  for(let i=0;i<n;i++){const h1=(i*.6180339)%1,h2=(i*.4142+.13)%1,sp=LOWFX?0:150+70*h1,len=55+45*((i*.37)%1),al=.18+.12*((i*.53)%1);
    const x=vx-100+((h1*(VW+200)+t*sp)%(VW+200)),y=vy-40+(((h2*(VH+80)-t*sp*.25)%(VH+80))+(VH+80))%(VH+80);
    ctx.strokeStyle=`rgba(240,248,255,${al.toFixed(3)})`;ctx.lineWidth=1.4+((i*.71)%1);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-len*.97,y+len*.24);ctx.stroke()}
  ctx.restore()}
// on the floor: the blizzard, the footprints, the warnings (landing circles with their growing shadow, discs under the hands, the bands
// of the claws), the cone of the breath, the snowball lanes, the lanes of the avalanche, the shadows of the icicles, the rings of the balls
function y2ground(){const B=G.y2;if(!B)return;const t=G.t||0,pu=.55+.3*Math.sin(t*18);
  if(B.snow)y2blizzard(t);
  for(const p of B.prints){const al=Math.min(1,(8-p.t)/2),ca=Math.cos(p.a),sa=Math.sin(p.a);ctx.save();ctx.transform(ca,sa*.62,-sa,ca*.62,p.x,p.y);ctx.fillStyle=`rgba(40,60,110,${(.28*al).toFixed(3)})`;
    ell(-1,0,6.5,4.6);ctx.fill();for(const s of[-1,0,1]){ell(7.5,s*4.4,2.6,1.7,s*.35);ctx.fill()}ctx.restore()}
  for(const w of B.warn){const k=Math.max(0,Math.min(1,1-w.t/w.max));
    if(w.k==='land'||w.k==='disc'){const r=w.r;ctx.fillStyle=`rgba(${Y2.red},${(.08+.24*k).toFixed(3)})`;ell(w.x,w.y,r*k,r*k*.6);ctx.fill();
      if(w.k==='land'){ctx.fillStyle=`rgba(10,16,34,${(.12+.28*k).toFixed(3)})`;ell(w.x,w.y,r*(.25+.7*k)*.9,r*(.25+.7*k)*.5);ctx.fill()}
      ctx.strokeStyle=`rgba(${Y2.red},${pu.toFixed(3)})`;ctx.lineWidth=2.5;if(w.k==='land'&&!w.lock)ctx.setLineDash([9,6]);ell(w.x,w.y,r,r*.6);ctx.stroke();ctx.setLineDash([]);
      ctx.save();ctx.globalCompositeOperation='lighter';glow(Y2.ice,w.x,w.y,Math.max(1,r*.8*k),.22*k,Math.max(1,r*.45*k));ctx.restore();
      if(w.k==='land'&&w.lock)for(let i=0;i<6;i++){const a=-Math.PI/2+i*TAU/6,on=k>=(i+1)/6;ctx.fillStyle=on?'rgba(255,240,200,.95)':`rgba(${Y2.red},.6)`;circ(w.x+Math.cos(a)*r*1.08,w.y+Math.sin(a)*r*.65,on?3:2);ctx.fill()}}
    else if(w.k==='band'){ctx.save();ctx.beginPath();ctx.rect(L,TOP,R-L,BOT-TOP);ctx.clip();ctx.translate(w.x,w.y);ctx.rotate(w.a);const hw=w.wd/2;
      ctx.fillStyle=`rgba(${Y2.red},.07)`;ctx.fillRect(0,-hw,w.len,w.wd);ctx.fillStyle=`rgba(${Y2.red},${(.12+.16*k).toFixed(3)})`;ctx.fillRect(0,-hw,w.len*k,w.wd);
      ctx.strokeStyle=`rgba(${Y2.red},${pu.toFixed(3)})`;ctx.lineWidth=2;ctx.setLineDash([8,6]);ctx.strokeRect(0,-hw,w.len,w.wd);ctx.setLineDash([]);
      ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(${Y2.ice},${(.15+.4*k).toFixed(3)})`;ctx.lineWidth=1.6;for(const o of[-14,0,14]){ctx.beginPath();ctx.moveTo(6,o);ctx.lineTo(w.len*k,o+o*.15);ctx.stroke()}
      ctx.globalCompositeOperation='source-over';ctx.fillStyle=`rgba(${Y2.red},.8)`;ctx.beginPath();ctx.moveTo(w.len-4,0);ctx.lineTo(w.len-24,-14);ctx.lineTo(w.len-24,14);ctx.closePath();ctx.fill();ctx.restore()}}
  if(B.cone)y2coneWarn(B.cone,t);
  if(B.sbl)for(const l of B.sbl){if(l.gone)continue;ctx.save();ctx.beginPath();ctx.rect(L,TOP,R-L,BOT-TOP);ctx.clip();ctx.translate(l.x,l.y);ctx.rotate(l.a);const hw=28;
    ctx.fillStyle=`rgba(${Y2.red},${l.lock?(.22+.08*Math.sin(t*20)).toFixed(3):.1})`;ctx.fillRect(0,-hw,l.len,hw*2);ctx.strokeStyle=`rgba(${Y2.red},.75)`;ctx.lineWidth=2;if(!l.lock)ctx.setLineDash([8,6]);
    ctx.strokeRect(0,-hw,l.len,hw*2);ctx.setLineDash([]);ctx.fillStyle=`rgba(${Y2.red},.85)`;ctx.beginPath();ctx.moveTo(l.len-4,0);ctx.lineTo(l.len-22,-12);ctx.lineTo(l.len-22,12);ctx.closePath();ctx.fill();ctx.restore()}
  for(const W of B.waves)if(W.st==='warn'){const w=(R-L)/6,pat=y2pat(true);for(const i of W.lanes){const x0=L+w*i+2;ctx.fillStyle=pat||`rgba(${Y2.red},.14)`;ctx.fillRect(x0,TOP,w-4,BOT-TOP);
      ctx.fillStyle=`rgba(${Y2.red},${(.05+.05*Math.sin(t*10)).toFixed(3)})`;ctx.fillRect(x0,TOP,w-4,BOT-TOP);ctx.strokeStyle=`rgba(${Y2.red},${(.35+.3*Math.sin(t*10)).toFixed(3)})`;ctx.lineWidth=2;ctx.setLineDash([10,7]);ctx.strokeRect(x0,TOP,w-4,BOT-TOP);ctx.setLineDash([])}}
  for(const c of B.ice)if(!c.land){const k=Math.min(1,c.t/c.dur),r=c.r;ctx.fillStyle=`rgba(${Y2.red},${(.08+.26*k).toFixed(3)})`;ell(c.x,c.y,r*k,r*k*.6);ctx.fill();
    ctx.strokeStyle=`rgba(${Y2.red},${pu.toFixed(3)})`;ctx.lineWidth=2;ell(c.x,c.y,r,r*.6);ctx.stroke();ctx.fillStyle=`rgba(10,16,34,${(.15+.3*k).toFixed(3)})`;ell(c.x,c.y,r*(.3+.6*k)*.8,r*(.3+.6*k)*.45);ctx.fill()}
  for(const b of B.balls){ctx.strokeStyle=`rgba(${Y2.red},${(.5+.3*Math.sin(t*14)).toFixed(3)})`;ctx.lineWidth=2;ell(b.x,b.y,b.r*1.12,b.r*.62);ctx.stroke()}}
// the model's ball (or a simple one): a ball of snow of radius r resting on the floor at (x,y)
function y2ballArt(x,y,r,spin,dir,p2,sh){const A=y2art('Ball');if(A){try{A(x,y,r,spin,1,{dir,p2,shadow:sh!==false});return}catch(err){}}
  if(sh!==false)shadow(x,y+1,r*1.05,r*.38,.32);const cy=y-r;ink(2.4);circ(x,cy,r);const g=ctx.createRadialGradient(x-r*.35,cy-r*.4,r*.1,x,cy,r);
  g.addColorStop(0,'#ffffff');g.addColorStop(.6,p2?'#c3ecfb':'#e6eff9');g.addColorStop(1,p2?'#6fb3dc':'#a9bedb');ctx.fillStyle=g;ctx.fill();ctx.stroke();
  ctx.strokeStyle='rgba(110,140,190,.6)';ctx.lineWidth=1.4;ctx.beginPath();ctx.ellipse(x,cy,Math.max(.5,r*.8*Math.abs(Math.cos(spin))),r*.8,dir+Math.PI/2,0,TAU);ctx.stroke()}
// a front of the avalanche in one lane: a heap of snow (tall at the back, a low lip in front) with two balls tumbling in it, broken where a
// block (or the Yeti) shelters the floor below it, the spray flying off its top
function y2front(W,t){const w=(R-L)/6,y=W.y,br=Math.min(24,w*.25+6),e=y2boss(),p2=!!(e&&e.p2);
  const heap=(xa,xb,top,foot,ph,c0,c1,c2)=>{const n=Math.max(2,Math.round((xb-xa)/22)),r0=Math.min(10,(xb-xa)/3),dx=(xb-xa-2*r0)/n;ink(2.4);ctx.beginPath();ctx.moveTo(xa,y+foot);
    ctx.quadraticCurveTo(xa-2,y-top*.45,xa+r0,y-top*.75);for(let j=0;j<n;j++){const x1=xa+r0+dx*j,x2=x1+dx,h=top+4*Math.sin(j*2.1+ph+t*8);ctx.bezierCurveTo(x1+dx*.08,y-h,x2-dx*.08,y-h,x2,y-top*.84-2*Math.sin(j+ph+t*6))}
    ctx.quadraticCurveTo(xb+2,y-top*.45,xb,y+foot);ctx.closePath();const g=ctx.createLinearGradient(0,y-top-6,0,y+foot);g.addColorStop(0,c0);g.addColorStop(.5,c1);g.addColorStop(1,c2);ctx.fillStyle=g;ctx.fill();ctx.stroke()};
  for(const i of W.lanes){const x0=L+w*i+2,x1=x0+w-4;let segs=[[x0,x1]];
    const cut=(a,b)=>{const out=[];for(const[s0,s1] of segs){if(b<=s0||a>=s1){out.push([s0,s1]);continue}if(a>s0)out.push([s0,a]);if(b<s1)out.push([b,s1])}segs=out};
    for(const k of G.rocks)if(!k.temp&&y>k.y)cut(k.x-k.r,k.x+k.r);if(e&&y>e.y)cut(e.x-e.r,e.x+e.r);
    for(const[s0,s1] of segs){if(s1-s0<8)continue;ctx.fillStyle='rgba(16,22,40,.24)';ell((s0+s1)/2,y+20,(s1-s0)/2+5,7);ctx.fill();
      heap(s0,s1,60,14,s0*.1,'#ffffff','#e6eff9','#b6c8e2');
      for(const u of[.3,.7]){const bx=x0+(x1-x0)*u;if(bx>s0+br*.6&&bx<s1-br*.6)y2ballArt(bx,y+(u<.5?6:12),br,y/br+u*3,Math.PI/2,p2,false)}
      heap(s0+2,s1-2,10,20,s0*.1+2,'#ffffff','#eef5fc','#cfdeee');
      if(!LOWFX){ctx.fillStyle='rgba(255,255,255,.4)';const n=Math.max(2,Math.round((s1-s0)/16));for(let j=0;j<n;j++){const q=(t*2.2+j*.37)%1;circ(s0+(s1-s0)*(j+.5)/n+Math.sin(j*3+t*5)*4,y-62-q*24,3+q*5);ctx.fill()}}}}}
// in the air: the wind of the breath, the fronts of the avalanche and their arrows, the balls, the crescents, the icicles
// the wind of the breath: frosty, soft at the sides (three fans narrower and brighter inward, not a white beam), streaks of wind and
// flakes running out along it; it rises to his mouth near him
function y2wind(C,t){const lift=d=>73*Math.max(0,1-d/150),fan=(half,a0,a1,a2)=>{const R0=y2rays(C,C.cur,half,C.front);const g=ctx.createRadialGradient(C.x,C.y-40,8,C.x,C.y,Math.max(30,C.front+20));
    g.addColorStop(0,`rgba(240,250,255,${a0})`);g.addColorStop(.55,`rgba(200,228,255,${a1})`);g.addColorStop(1,`rgba(170,210,250,${a2})`);ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(C.x,C.y-73);
    for(const[an,d] of R0)ctx.lineTo(C.x+Math.cos(an)*d,C.y+Math.sin(an)*d-lift(d));ctx.closePath();ctx.fill()};
  ctx.save();fan(C.half,.26,.16,0);fan(C.half*.72,.24,.16,0);fan(C.half*.42,.3,.2,0);
  if(!LOWFX){ctx.lineCap='round';for(let i=0;i<7;i++){const an=C.cur+(((i*.43)%1)-.5)*1.7*C.half,re=Math.min(C.front,y2reach(C.x,C.y,an,C.len)),u=(t*1.4+i*.31)%1,d0=re*u*.7,d1=Math.min(re,d0+50);if(d1-d0<8)continue;
      ctx.strokeStyle=`rgba(255,255,255,${(.5*Math.sin(Math.PI*u)).toFixed(3)})`;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(C.x+Math.cos(an)*d0,C.y+Math.sin(an)*d0-lift(d0));ctx.lineTo(C.x+Math.cos(an)*d1,C.y+Math.sin(an)*d1-lift(d1));ctx.stroke()}}
  const N=LOWFX?8:20;for(let i=0;i<N;i++){const h=(i*.618)%1,u=(t*1.7+h)%1,an=C.cur+(((i*.37)%1)-.5)*2*C.half*.9,dd=u*C.front;if(dd>y2reach(C.x,C.y,an,C.len))continue;
    ctx.fillStyle=`rgba(255,255,255,${(.85*(1-u)).toFixed(3)})`;circ(C.x+Math.cos(an)*dd,C.y+Math.sin(an)*dd-lift(dd),1.4+u*1.6);ctx.fill();
    ctx.strokeStyle=`rgba(70,110,170,${(.35*(1-u)).toFixed(3)})`;ctx.lineWidth=.8;ctx.stroke()}
  ctx.restore()}
function y2iceDraw(c){const f0=c.dur-c.fall;if(!c.land&&c.t<f0)return;const H=c.big?380:320,u=c.land?1:(c.t-f0)/c.fall,z=c.land?0:H*(1-u*u),A=y2art('Icicle');
  if(A){try{A(c.x,c.y,z,1,{big:c.big,p2:c.p2,shatter:c.land?Math.min(1,c.sh):0,seed:c.seed});return}catch(err){}}
  if(c.land){const k=Math.min(1,c.sh);ctx.save();ctx.globalAlpha*=1-k;for(let i=0;i<6;i++){const an=c.seed+i*TAU/6,d=6+k*(c.big?46:24),px=c.x+Math.cos(an)*d,py=c.y+Math.sin(an)*d*.55-14*Math.sin(Math.PI*Math.min(1,k*1.4));
    ink(1.4);ctx.beginPath();ctx.moveTo(px,py-5);ctx.lineTo(px+3,py+2);ctx.lineTo(px-3,py+2);ctx.closePath();fs('#c9f3ff')}ctx.restore();return}
  const L0=c.big?58:26,W0=c.big?22:9,ty=c.y-z;ctx.save();ink(c.big?2.4:1.8);ctx.beginPath();ctx.moveTo(c.x,ty);ctx.lineTo(c.x-W0/2,ty-L0);ctx.lineTo(c.x+W0/2,ty-L0);ctx.closePath();
  const g=ctx.createLinearGradient(c.x-W0/2,0,c.x+W0/2,0);g.addColorStop(0,'#f4fdff');g.addColorStop(.5,'#a8def5');g.addColorStop(1,'#5aa3cf');ctx.fillStyle=g;ctx.fill();ctx.stroke();ctx.restore()}
function y2cresDraw(c){const life=c.len/300,k=Math.min(.999,c.t/life),s=Math.min(c.len,300*c.t),x=c.x+Math.cos(c.a)*s,y=c.y+Math.sin(c.a)*s,A=y2art('Crescent');
  if(A){try{A(x,y,c.a,c.w,k,1,{p2:c.p2});return}catch(err){}}
  const al=k<.1?k/.1:k>.9?(1-k)/.1:1;ctx.save();ctx.globalAlpha*=al;ctx.translate(x,y-18);ctx.rotate(c.a);ctx.globalCompositeOperation='lighter';glow('150,225,255',0,0,46,.5);ctx.globalCompositeOperation='source-over';
  ink(2.2);ctx.beginPath();ctx.moveTo(-8,-40);ctx.quadraticCurveTo(22,0,-8,40);ctx.quadraticCurveTo(8,0,-8,-40);ctx.closePath();const g=ctx.createLinearGradient(-8,0,14,0);g.addColorStop(0,'#8fd0f2');g.addColorStop(1,'#ffffff');ctx.fillStyle=g;ctx.fill();ctx.stroke();ctx.restore()}
function y2drawAir(){const B=G.y2;if(!B)return;const t=G.t||0;
  if(B.cone&&B.cone.fire)y2wind(B.cone,t);
  for(const W of B.waves)if(W.st==='run')y2front(W,t);
  for(const b of B.balls)y2ballArt(b.x,b.y,b.r,b.spin,b.a,b.p2,true);
  for(const c of B.cres)y2cresDraw(c);
  for(const c of B.ice)y2iceDraw(c);
  // the arrows at the top of the screen over the red lanes of the next wave
  for(const W of B.waves)if(W.st==='warn'){const w=(R-L)/6,ay=Math.max(TOP+18,(G.vy||0)+70),k=.55+.4*Math.sin(t*10);for(const i of W.lanes){const cx=L+w*(i+.5);ink(1.6);ctx.beginPath();
    ctx.moveTo(cx,ay+14);ctx.lineTo(cx-12,ay);ctx.lineTo(cx-4.5,ay);ctx.lineTo(cx-4.5,ay-13);ctx.lineTo(cx+4.5,ay-13);ctx.lineTo(cx+4.5,ay);ctx.lineTo(cx+12,ay);ctx.closePath();
    ctx.fillStyle=`rgba(${Y2.red},${k.toFixed(3)})`;ctx.fill();ctx.stroke()}}}
{const _g2=drawHazards2Ground;drawHazards2Ground=function(){_g2.apply(this,arguments);try{if(Y2ON)y2ground()}catch(err){}}}
{const _a2=drawHazards2Air;drawHazards2Air=function(){_a2.apply(this,arguments);try{if(Y2ON)y2drawAir()}catch(err){}}}
// the shards of ice of the landings and of the stalactite (the model's own if it has one)
Object.assign(TRC,{yice:'150,220,255'});
Object.assign(EPDRAW,{yice:p=>{const A=y2art('Shard');if(A){try{A(p.x,p.y,0,p.a,1,{});return}catch(e){}}glow('150,220,255',p.x,p.y,p.r*2.4,.4);ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.a);ink(1.6);
  ctx.beginPath();ctx.moveTo(p.r*1.6,0);ctx.lineTo(-p.r*.2,-p.r*.75);ctx.lineTo(-p.r*1.1,0);ctx.lineTo(-p.r*.2,p.r*.75);ctx.closePath();const g=ctx.createLinearGradient(-p.r,0,p.r*1.6,0);
  g.addColorStop(0,'#5aa3cf');g.addColorStop(.6,'#c9f3ff');g.addColorStop(1,'#ffffff');ctx.fillStyle=g;ctx.fill();ctx.stroke();ctx.restore()}});
// ---- the entrance (3.4 s, the model's 'enter'): the avalanche brings him in, the mound breathes, two eyes open in the snow, the horns break
// out, the clods roll away, he shakes himself like a dog, takes the great breath (the signal, at once) and roars with the echo of the mountain
if(Y2ON){const _bi=bossIntro;bossIntro=function(e,dt,a){if(e.type!=='yeti')return _bi.apply(this,arguments);
  const T=BOSS_INTRO.yeti;if(e.iT==null){e.iT=0;e.iStep=0}const t0=e.iT;e.iT+=dt;const t=e.iT,at=s=>t0<s&&t>=s;e.intro=Math.max(0,T-t);e.face=a;e.st='enter';e.z=0;e.yy=null;e.em=null;e.fa=t<3.3?.999:1;
  if(t0===0){sfx('quake');shake(2);if(BOSS2)ENV2.fall(B3N(6),true)}
  if(t<.5&&Math.random()<.4)G.debris.push({x:AW/2+rand(-DOORW,DOORW),y:TOP+rand(2,10),z:rand(30,60),vx:rand(-20,20),vy:rand(10,40),vz:0,col:pk(['#ffffff','#e0ecf4','#bfe9ff']),s:rand(1.6,3),rot:0,vr:3,life:1.6});
  if(at(.4)){shake(5);sfx('boom',0,e.x);dustRing(e.x,e.y,18);vfxBlast(e.x,e.y,'235,245,255',90,{debris:Y2.snow,n:B3N(18),sparks:0,dust:B3N(14),ring2:false})}
  for(const s of[.68,.92])if(at(s)){y2pant(e);fxPush({k:'puff',x:e.x+rand(-10,10),y:e.y-32,vx:rand(-10,10),vy:-20,t:.5,r:8})}
  if(at(1.02))b3say(e,'growl');
  for(const s of[1.36,1.56,1.77])if(at(s)){sfx('iceBreak',0,e.x);shake(1.5);vfxBlast(e.x+rand(-30,30),e.y+rand(-8,8),'235,245,255',40,{debris:Y2.snow,n:B3N(8),sparks:0,dust:B3N(5),ring2:false})}
  for(const s of[1.97,2.11,2.24])if(at(s)){if(y2au())try{whoosh(AU.ctx.currentTime+.01,.18,900,2600,.08)}catch(err){}if(!LOWFX)for(let i=0;i<6;i++)G.fx.push({k:'snowp',x:e.x+rand(-20,20),y:e.y-rand(30,80),vx:rand(-120,120),vy:rand(-60,30),t:.6})}
  if(at(2.31))y2inhale(e,.41,true);
  if(at(2.72)){if(!b3say(e,'cry'))sfx('roar');b3torch('blue',2);if(BOSS2)ENV2.fall(B3N(10),true);shake(6);vib([60,40,120]);
    for(let i=0;i<3;i++)setTimeout(()=>{if(G&&G.fx)fxPush({k:'ring2',x:e.x,y:e.y-e.r,rgb:'235,245,255',r0:e.r,r1:e.r*5,t:.45,max:.45,w:6-i*1.5})},i*170)}
  if(e.intro<=0){e.z=0;e.em=null;e.fa=null;e.si=-1;y2walk(e,.9)}}}
// what the model plays: the entrance over its whole length, every state that is one of its moves at the brain's pace (64 doesn't know the
// 1.25 of his second phase)
if(Y2ON){const _nm=n3Move;n3Move=function(e){if(e.type==='yeti'){if(e.intro>0)return['enter',Math.min(.999,Math.max(0,(e.iT||0)/BOSS_INTRO.yeti))];
    const M=N3.meta.yeti;if(e.st&&e.st!=='walk'&&M.an.includes(e.st))return[e.st,Math.min(.999,Math.max(0,(e.mt||0)/B3D(e,e.st)))]}
  return _nm.apply(this,arguments)}}
// ---- the defeat (4 s, the model's 'die'): he goes back to snow
if(Y2ON){const _sb=snapBoss;snapBoss=function(e){if(e.type==='yeti')return{live:1};return _sb.apply(this,arguments)}
  BDIE.yeti={setup(c){const e=c.e;y2reset();c.face=e.f3!=null?e.f3:(e.face||Math.PI/2);c.p2=!!e.p2;c.live=1;sfx('freeze',2,c.x)},
    tick(c,dt,D){if(c.t<D.clou&&c.t>1.25&&Math.random()<(LOWFX?.25:.6))cpart(c,{k:'frost',x:c.x+rand(-34,34),y:c.y+rand(-6,6),vz:rand(20,60),life:rand(.6,1.1),r:rand(2,4),ph:rand(0,3)});
      if(c.t>=D.clou&&!c.crash){c.crash=1;shake(12);sfx('boom',0,c.x);vib([60,30,90]);for(let i=0;i<B3N(18);i++)cpart(c,{k:'puff',x:c.x+rand(-20,20),y:c.y+rand(-6,6),vx:rand(-90,90),vy:rand(-30,30),vz:rand(20,90),life:rand(.6,1.1),r:rand(5,10),col:'235,245,255'})}
      if(c.t>D.clou&&c.t<D.clou+1.2&&Math.random()<(LOWFX?.2:.5))cpart(c,{k:'frost',x:c.x+rand(-50,50),y:c.y+rand(-10,10),z:rand(60,110),vz:-rand(10,25),life:rand(1,1.6),r:rand(1.5,3),ph:rand(0,3)})},
    draw(c,D){const p=Math.min(.999,c.t/c.dur),M=N3.meta.yeti;try{N3.yeti(c.x,c.y+8,c.face,'die',p,(M&&M.sc)||1,{p2:c.p2,noFx:LOWFX})}catch(err){}}};
  const _dc=drawCorpse;drawCorpse=function(c){if(c.type!=='yeti')return _dc.apply(this,arguments);try{BDIE.yeti.draw(c,BDEATH.yeti)}catch(err){}drawParts(c)}}
// ---- the voice and the personality, like the four new bosses (88-boss3-voci.js): a gorilla's throat, deep and hollow, higher than the
// Golem; its signature is the echo of the mountain (after the big cries the same cry comes back twice, softer and darker). A «hoo-hoo-hoo»
// when he hits you and mocks you («come here», the model's 'taunt'); «hrrrm… hoo?» when you keep away; a grunt for each blow, after the
// breath you hear coming; «uhnn» when you hit him hard; a lament in the wind when he falls; «hoo-hoo-hoo-HOOO» and the drum of his chest
// if you fall.
if(Y2ON){
  const yha=(n,t0,step,d,fa,fb,v,o)=>[...Array(n)].map((_,i)=>{const f=fa+(fb-fa)*i/Math.max(1,n-1);return{t:t0+i*step,d,f:[f*1.04,f*.94],v,a:1-i*.06,h:.3,...(o||{})}});
  B3VO.VB.yeti={base:{br:.42,ro:.4,ji:.1,lp:.45},k:{
    cry:[[2,[{t:0,d:.16,noise:1,v:'h',a:.6},{t:.12,d:.8,f:[96,132],v:['u','o'],h:.12,ro:.25,vib:[.03,5],att:.2},{t:.86,d:1.1,f:[142,120,82],v:['a','a','o'],ro:.8,ji:.2,vib:[.04,6],rel:.4}],.66]],
    angry:[[1.7,[{t:0,d:.42,f:[82,92],v:'o',a:.85,ro:.9,ji:.25},{t:.4,d:1.26,f:[104,156,92],v:['o','a','o'],ro:.65,h:.06,vib:[.035,5.5],rel:.35}],.66]],
    laugh:[[.95,[...yha(3,0,.24,.17,150,122,'u',{ro:.25,h:.4}),{t:.74,d:.2,noise:1,v:'h',a:.5}],.52]],
    laugh2:[[1,[{t:0,d:.46,f:[92,86],v:'m',ro:.75,am:[.4,16]},{t:.6,d:.36,f:[112,152],v:['u','o'],h:.3,ro:.15,rel:.4}],.5]],
    hurt:[[.32,[{t:0,d:.3,f:[138,94],v:['u','o'],ro:.45,h:.12}],.5],[.3,[{t:0,d:.06,noise:1,v:'h',a:.7},{t:.05,d:.24,f:[128,96],v:'u',ro:.5,h:.2}],.5]],
    growl:[[.95,[{t:0,d:.92,f:[76,84,72],v:['o','u'],ro:.95,ji:.3,am:[.3,9],rel:.35}],.55]],
    c_leap:[[.5,[{t:0,d:.08,noise:1,v:'h',a:.6},{t:.07,d:.42,f:[90,98],v:'r',ro:.9,am:[.5,18],h:.1}],.48]],
    c_bound:[[.22,[{t:0,d:.06,noise:1,v:'h',a:.8},{t:.05,d:.15,f:[150,175],v:['u','a'],h:.2,att:.05}],.46]],
    c_pound:[[.58,[{t:0,d:.32,f:[86,94],v:'r',ro:.9,am:[.5,18]},{t:.32,d:.24,f:[146,112],v:'a',ro:.5,att:.06}],.56]],
    c_snowball:[[.32,[{t:0,d:.2,f:[112,100],v:'n',ro:.3},{t:.19,d:.11,noise:1,v:'h',a:.7}],.56]],
    c_roar:[[.42,[{t:0,d:.4,f:[98,86],v:'o',ro:.85,ji:.2}],.5]],
    c_claws:[[.44,[{t:0,d:.42,f:[108,96],v:['r','a'],ro:.95,am:[.6,22]}],.54]],
    c_breath:[[1.15,[{t:0,d:.32,noise:1,v:'h',a:.9},{t:.26,d:.86,f:[128,106,92],v:'a',h:.25,br:.85,ro:.35,rel:.45}],.5]],
    c_howl:[[1.35,[{t:0,d:1.3,f:[122,178,132],v:['u','o','u'],h:.05,ro:.22,vib:[.04,5],rel:.35}],.62]],
    die:[[2.3,[{t:0,d:2.2,f:[132,106,56],v:['o','u'],ro:.35,vib:[.05,3.5],br:.6,rel:.6}],.58]],
    win:[[1.6,[...yha(3,0,.22,.16,146,126,'u',{ro:.25,h:.35}),{t:.72,d:.82,f:[132,164,118],v:['u','o'],ro:.25,vib:[.04,5],rel:.4}],.56]]}};
  B3CUE.yeti={leap:'c_leap',bound:'c_bound',pound:'c_pound',snowball:'c_snowball',roar:'c_roar',claws:'c_claws'};
  // the echo of the mountain: the same clip comes back at .38 and .76 s, 8 and 14 dB softer, through a low-pass, with more of the room
  const ECHO={cry:1,angry:1,c_howl:1,die:1,win:1};
  {const _p=B3VO.play;B3VO.play=function(t,k){if(t!=='yeti'||!ECHO[k]||typeof AU==='undefined'||!AU.ctx)return _p.apply(this,arguments);const _r=route;let once=false;
    route=function(node,tr,rev,dly){_r(node,tr,rev,dly);if(once||tr)return;once=true;try{const c=AU.ctx,lp=filt('lowpass',VR(720,.08),.7);node.connect(lp);
      for(const[dl0,db] of[[.38,-8],[.76,-14]]){const dl=c.createDelay(1.5);dl.delayTime.value=dl0;const g=c.createGain();g.gain.value=Math.pow(10,db/20);lp.connect(dl);dl.connect(g);_r(g,null,(rev||0)+.3)}}catch(err){}};
    try{return _p.apply(this,arguments)}finally{route=_r}}}
  // under his big cries the wind of the peaks; the drum of his chest when he laughs at your fall
  {const _m=b3sayMore;b3sayMore=function(e,k,t){if(e.type!=='yeti')return _m.apply(this,arguments);
    if(k==='win')for(let i=0;i<4;i++)fThump(t+.02+i*.2,72,40,.18,.26,.15);
    else if(k==='die')fNoise(t+.1,2.2,'bandpass',600,.8,.05,{f2:1500,att:.7,rev:.5});
    else if(k==='cry'||k==='angry')fNoise(t+.3,1.4,'lowpass',260,.7,.08,{brown:true,att:.3,rev:.4})}}
  // the voices get ready in the rooms of his arena (and at once in his room)
  {const _br=buildRoom;buildRoom=function(){const r=_br.apply(this,arguments);try{const A=G&&G.mode!=='inf'&&!G.daily&&ARENAS[G.arena||0];
    if(A&&!A.bt&&BOSSZ[A.boss]==='yeti'||G&&(G.enemies||[]).some(q=>q.type==='yeti'))B3VO.prep('yeti')}catch(err){}return r}}
  // the defeat with its voice (the cry of the entrance and the rage are in bossIntro and y2rage)
  {const _s=BDIE.yeti.setup;BDIE.yeti.setup=function(c){_s.apply(this,arguments);b3say(c,'die')}}}
// ---- for the previews (anteprime/mk_boss2.py) and the tests (tests/boss2gioco.js): how to get into his room, his moves in each phase,
// the dangers he puts in the room (counted by the tests) and the clips of his voice
if(Y2ON){const RB=window.BCL||(window.BCL={});RB.yeti={n:'Yeti delle Vette',arena:3,p2:true,
  enter(){G.arena=3;G.chapter=ARENAS[3].ch;G.diff=ARENAS[3].diff;G.bossLvl=null;G.room=ROOMS;G.event=null;buildRoom()},
  moves:['leap','pound','snowball','breath','gasp'],moves2:['rage','roar','bound','claws'],
  hz(){const B=G.y2||{},W=B.waves||[];return{cerchi:(B.warn||[]).length,ghiaccioli:(B.ice||[]).filter(c=>!c.big).length,stalattiti:(B.ice||[]).filter(c=>c.big).length,
    palle:(B.balls||[]).length,schegge:G.eproj.filter(q=>q.kind==='yice').length,cono:B.cone?1:0,corsie:W.filter(w=>w.st==='warn').reduce((s,w)=>s+w.lanes.length,0),
    fronti:W.filter(w=>w.st==='run').reduce((s,w)=>s+w.lanes.length,0),mezzelune:(B.cres||[]).length,chiazze:G.zones.filter(z=>z.kind==='frost').length}},
  voice:['cry','laugh','angry','die']}}
