// =====================================================================
// 97. NEMICI PIÙ VIVI (Denis, 29 ottobre: «Nemici più vivi»: il pezzo che mancava della FASE 2, i nemici normali con tutte le mosse,
// fermi, camminano, si preparano, attaccano, colpiti, muoiono, e i loro suoni). Le mosse stanno nei modelli (sprite/nemici3d: «prep» e
// «die» per i 26 nemici normali); qui:
// 1. le voci proprie dei dieci che prendevano in prestito quelle di un altro (VOX in 75: bigslime, magmaslime, tadpole, snail, bonelet,
//    pyro, mushroom, eyeflower, shadoweye, obsidian);
// 2. un verso di preparazione per ognuno (VOX[tipo].p), quando si prepara a colpire;
// 3. i suoni della mossa «muore» nel suo momento (NVD: [frazione della mossa, suono]);
// 4. nel gioco: la mossa «si prepara» quando il nemico prende la mira, accende la miccia, carica, gonfia la sacca… (NVP: per ogni tipo il
//    segnale che il gioco ha già, gli stessi della stellina di 56), e il corpo che recita la mossa «muore» del suo modello (77: dal vivo,
//    al massimo NV.live insieme; gli altri tengono la foto di prima, che resta anche la riserva se un modello dà errore).
// NV.on spegne tutto.
// =====================================================================
const NV={on:true,live:5};
// ------------------------------------------------------------------ the little sounds they are made of
// a bubble: a sine that slides (up for a pop, down for a sag)
const nvBub=(t,f0,f1,dur,vol)=>{const c=AU.ctx,o=osc('sine',f0,t,t+dur+.03),g=c.createGain();o.frequency.exponentialRampToValueAtTime(f1,t+dur);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol,t+.006);g.gain.exponentialRampToValueAtTime(.0005,t+dur);o.connect(g);route(g,null,.15)};
const nvSizzle=(t,dur,vol)=>fNoise(t,dur,'highpass',VR(4200,.1),.8,vol,{att:dur*.3});
// a hum that swells and fades (two voices a fifth apart), sliding to f2
const nvHum=(t,f,dur,vol,f2)=>{const c=AU.ctx,o=osc('sine',f,t,t+dur+.05),o2=osc('triangle',f*1.5,t,t+dur+.05),g=c.createGain();
  if(f2){o.frequency.exponentialRampToValueAtTime(f2,t+dur);o2.frequency.exponentialRampToValueAtTime(f2*1.5,t+dur)}
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol,t+dur*.35);g.gain.exponentialRampToValueAtTime(.0005,t+dur);o.connect(g);o2.connect(g);route(g,null,.3)};
// a creak (a bow being drawn): a narrow band of noise that rises
const nvCreak=(t,dur,f0,f1,vol)=>fNoise(t,dur,'bandpass',f0,9,vol,{f2:f1,att:dur*.6});
// a body landing on the floor
const nvThud=(t,v)=>{fThump(t,VR(150,.1),62,.12,.22*v);fNoise(t,.08,'lowpass',VR(900,.15),.8,.12*v,{brown:true})};
// a note wobbling (the eye flower staring)
const nvWob=(t,f,dur,vol)=>{const c=AU.ctx,o=osc('sine',f,t,t+dur),v=osc('sine',7,t,t+dur),vg=c.createGain(),g=c.createGain();vg.gain.value=f*.04;v.connect(vg);vg.connect(o.frequency);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol,t+dur*.3);g.gain.exponentialRampToValueAtTime(.0005,t+dur*.96);o.connect(g);route(g,null,.3)};
// ------------------------------------------------------------------ 1. their own voices: [attack, hurt, death, step (and every how many px)]
Object.assign(VOX,{
  bigslime:{a:t=>{M.goo(t,.8);fThump(t+.06,VR(200,.1),VR(460,.1),.12,.1)},h:t=>{fThump(t,VR(260,.1),110,.1,.14);fNoise(t,.08,'lowpass',700,1.4,.1,{brown:true})},d:null,
    s:t=>fThump(t,VR(170,.15),95,.07,.07),px:42},
  magmaslime:{a:t=>{M.goo(t,.5);nvSizzle(t+.02,.28,.05);fThump(t+.05,VR(300,.1),VR(640,.1),.08,.07)},h:t=>{fThump(t,VR(340,.1),170,.07,.11);nvSizzle(t,.18,.05)},d:null,
    s:t=>{fThump(t,VR(240,.15),130,.05,.05);if(Math.random()<.5)nvSizzle(t,.08,.025)},px:34},
  tadpole:{a:t=>{nvBub(t,VR(620,.1),1400,.07,.07);fNoise(t+.02,.06,'lowpass',1600,1,.04,{brown:true})},h:t=>nvBub(t,950,560,.08,.07),d:t=>{nvBub(t,700,1600,.05,.06);nvBub(t+.07,900,2000,.04,.05)},px:0},
  snail:{a:t=>{M.shell(t,.5);fNoise(t,.45,'lowpass',VR(320,.1),.8,.08,{brown:true,att:.1})},h:t=>{M.shell(t,.5);squeak(t+.02,1250,900,.09,.04)},d:t=>{M.shell(t,.8);squeak(t+.05,1100,520,.32,.035)},
    s:t=>fNoise(t,.08,'lowpass',VR(700,.15),1.2,.06,{brown:true}),px:30},
  bonelet:{a:t=>{rattle(t,3,.3,1600);ev(t+.04,VR(620,.08),700,.07,.06,[950,2200])},h:t=>rattle(t,3,.35,1750),d:null,s:t=>M.bone(t,.12,VR(1700,.15)),px:18},
  pyro:{a:t=>{whoosh(t,.35,700,2200,.06);ev(t+.05,VR(260,.08),230,.1,.09,[650,1500])},h:t=>ev(t,330,240,.13,.11,[700,1500]),d:t=>{ev(t,300,150,.45,.12,[650,1400]);fNoise(t+.12,.3,'highpass',3200,.8,.05)},
    s:t=>fThump(t,VR(220,.1),120,.03,.05),px:28},
  mushroom:{a:t=>{fNoise(t,.22,'lowpass',VR(1500,.1),.9,.08,{att:.03});nvBub(t+.03,300,520,.1,.05)},h:t=>{fThump(t,VR(420,.1),250,.06,.1);rustle(t,.05,.08)},d:t=>fNoise(t,.5,'lowpass',1500,.9,.07,{f2:300,att:.05}),
    s:t=>fThump(t,VR(300,.15),180,.03,.04),px:22},
  eyeflower:{a:t=>{rustle(t,.08,.16);fNoise(t+.06,.02,'bandpass',2000,3,.05);nvBub(t+.06,1200,800,.05,.04)},h:t=>squeak(t,1800,1300,.12,.04),d:t=>{nvBub(t,900,300,.5,.035);rustle(t+.1,.06,.3)},px:0},
  shadoweye:{a:t=>{nvHum(t,110,.5,.05);M.glass(t+.1,.3,VR(1800,.1))},h:t=>{M.glass(t,.4,VR(1600,.1));ev(t,150,120,.15,.06,[400,900],{rasp:.3})},d:t=>{whoosh(t,.5,3000,600,.05,.4);nvHum(t,120,.6,.035,70)},px:0},
  obsidian:{a:t=>{fThump(t,VR(80,.1),42,.4,.22,.15);nvSizzle(t+.05,.3,.05);M.glass(t+.08,.3,VR(1400,.1))},h:t=>{M.glass(t,.6,VR(1400,.1));M.stone(t,.4)},d:null,
    s:t=>{fThump(t,VR(90,.1),45,.16,.18);M.glass(t,.12,VR(2400,.1))},px:36}});
// ------------------------------------------------------------------ 2. getting ready: one call each, when it starts
const NVPS={
  slime:t=>{nvBub(t,VR(260,.1),520,.12,.06);nvBub(t+.12,VR(330,.1),700,.1,.05)},
  bigslime:t=>{nvBub(t,VR(170,.1),340,.16,.07);nvBub(t+.16,VR(220,.1),460,.13,.06)},
  magmaslime:t=>{nvBub(t,VR(240,.1),500,.12,.05);nvSizzle(t,.35,.04)},
  bat:t=>squeak(t,VR(1800,.08),2700,.22,.045),
  goblin:t=>{nvCreak(t,.42,900,2200,.05);ev(t+.3,VR(380,.08),420,.06,.06,[800,1800])},
  plant:t=>{rustle(t,.08,.35);nvBub(t+.15,500,700,.12,.03)},
  skeleton:t=>{for(let i=0;i<3;i++)M.metal(t+i*.1,.15,VR(1500,.08),.3)},
  mushroom:t=>{nvBub(t,220,330,.28,.05);fNoise(t,.3,'lowpass',900,.8,.04,{att:.2})},
  wisp:t=>{vBell(null,t,VR(96,.01),.6,.025);fNoise(t,.35,'highpass',4500,.8,.025,{att:.25})},
  beetle:t=>{for(let i=0;i<6;i++)fNoise(t+i*(.09-i*.01),.012,'bandpass',VR(3400,.12),3,.1)},
  eyeflower:t=>nvWob(t,330,.5,.04),
  shadoweye:t=>nvHum(t,90,.6,.05,150),
  necro:t=>fNoise(t,.55,'bandpass',VR(2400,.1),4,.09,{att:.4,rev:.6}),
  bonelet:t=>{rattle(t,2,.25,1700);ev(t+.08,700,760,.05,.05,[1000,2300]);ev(t+.16,720,780,.05,.05,[1000,2300])},
  imp:t=>{for(let i=0;i<3;i++)ev(t+i*.1,VR(600,.05),650,.06,.06,[1100,2500])},
  obsidian:t=>{fNoise(t,.5,'lowpass',VR(260,.1),.7,.14,{brown:true,att:.3});M.stone(t+.35,.35)},
  pyro:t=>fNoise(t,.55,'bandpass',400,1.4,.07,{f2:1500,att:.4}),
  bomber:t=>{nvSizzle(t,.5,.05);ev(t+.15,VR(250,.06),230,.08,.07,[650,1500]);ev(t+.26,240,220,.08,.06,[650,1500])},
  frog:t=>ev(t,160,230,.4,.08,[480,1100],{trem:30}),
  mosquito:t=>squeak(t,VR(700,.1),1500,.45,.025),
  croc:t=>ev(t,VR(105,.06),92,.5,.09,[380,850],{rasp:.9}),
  snail:t=>{M.shell(t,.35);fNoise(t+.05,.35,'lowpass',300,.8,.06,{brown:true,att:.2})},
  tadpole:t=>{nvBub(t,600,1300,.05,.05);nvBub(t+.08,700,1500,.05,.04)},
  wolf:t=>ev(t,VR(140,.06),150,.55,.11,[650,1400],{rasp:1,trem:38}),
  snowspirit:t=>{for(let i=0;i<3;i++)vBell(null,t+i*.11,98+i*3,.4,.02)},
  icesentinel:t=>{for(let i=0;i<3;i++)M.ice(t+i*.12,.25+i*.08);nvHum(t,200,.5,.03,400)}};
for(const k in NVPS)if(VOX[k])VOX[k].p=NVPS[k];
// ------------------------------------------------------------------ 3. dying: the sounds of the move «muore», at their moment of it
const NVD={
  slime:[[.22,t=>M.goo(t,.5)]],bigslime:[[.22,t=>M.goo(t,.8)]],magmaslime:[[.22,t=>{M.goo(t,.5);nvSizzle(t,.4,.04)}]],
  mushroom:[[.7,t=>nvThud(t,.35)],[.74,t=>fNoise(t,.4,'lowpass',1400,.9,.05,{att:.05})]],
  bat:[[.7,t=>nvThud(t,.25)]],plant:[[.3,t=>rustle(t,.06,.25)],[.72,t=>nvThud(t,.25)]],wisp:[[.2,t=>M.spirit(t,.5)]],
  beetle:[[.5,t=>{M.shell(t,.6);nvThud(t,.3)}],[.6,t=>fNoise(t,.25,'highpass',3000,.8,.04)]],
  eyeflower:[[.3,t=>rustle(t,.06,.3)],[.75,t=>nvThud(t,.3)]],shadoweye:[[.2,t=>whoosh(t,.45,2500,500,.07,.4)]],
  imp:[[.6,t=>nvThud(t,.35)],[.7,t=>nvThud(t,.15)]],
  obsidian:[[.2,t=>M.glass(t,.6,1300)],[.45,t=>M.stone(t,.6)],[.62,t=>nvThud(t,.5)]],
  frog:[[.55,t=>{nvThud(t,.4);M.goo(t,.25)}]],mosquito:[[.65,t=>fThump(t,VR(500,.1),300,.03,.05)]],
  croc:[[.6,t=>nvThud(t,.8)]],snail:[[.45,t=>M.shell(t,.5)],[.75,t=>{M.shell(t,.7);nvThud(t,.3)}]],tadpole:[[.4,t=>nvBub(t,500,1200,.06,.05)]],
  wolf:[[.5,t=>nvThud(t,.6)],[.62,t=>nvThud(t,.2)]],
  snowspirit:[[.58,t=>fNoise(t,.2,'lowpass',VR(1200,.1),.7,.09,{brown:true})],[.62,t=>M.ice(t,.25)]],
  icesentinel:[[.12,t=>M.ice(t,.8)],[.3,t=>M.ice(t,.4)],[.53,t=>{M.ice(t,.5);nvThud(t,.45)}]],
  goblin:[[.55,t=>nvThud(t,.45)]],necro:[[.55,t=>nvThud(t,.4)]],pyro:[[.55,t=>nvThud(t,.45)]],bomber:[[.55,t=>{nvThud(t,.55);M.metal(t+.02,.25,700,.4)}]],
  skeleton:[[.14,t=>rattle(t,4,.35,1200)],[.3,t=>rattle(t,8,.5,1000)],[.52,t=>rattle(t,5,.4,1300)],[.62,t=>M.bone(t,.6,700)]],
  bonelet:[[.14,t=>rattle(t,3,.3,1500)],[.3,t=>rattle(t,6,.45,1300)],[.52,t=>rattle(t,4,.35,1600)],[.62,t=>M.bone(t,.5,900)]]};
// plays a sound of a type (k: 'a', 'h', 'd', 's', 'p', or a function) at the volume v, now
function nvSay(type,k,v){if(!AU.ctx||!AU.on.sfx)return;const f=typeof k==='function'?k:VOX[type]&&VOX[type][k];if(!f)return;try{withVol(v==null?1:v,()=>f(AU.ctx.currentTime+.01))}catch(er){}}
// ------------------------------------------------------------------ 4. in the game
// the game's own signal that each one is about to strike (the ones that have one): aiming, the cast, the fuse, the charge, the swelling sac.
// The skeleton aims while it walks: only standing still is it getting ready (or before its dash)
const NVP={slime:e=>!(e.jump>0)&&e.cd<.28,bigslime:e=>!(e.jump>0)&&e.cd<.28,magmaslime:e=>!(e.jump>0)&&e.cd<.28,bat:e=>e.elite&&e.cd<.4,
  goblin:e=>e.aim>0,plant:e=>e.cd<.45,skeleton:e=>(e.aim>0&&!e.moving)||e.wind>0,mushroom:e=>e.puff>0,beetle:e=>e.arm>0,eyeflower:e=>e.wind>0,shadoweye:e=>e.stare>0,
  imp:e=>e.cd<.4,obsidian:e=>e.wind>0,pyro:e=>e.cast>0,bomber:e=>e.throwT>0,frog:e=>e.spit>0,icesentinel:e=>e.cast>0};
const nvReady=e=>{const f=NVP[e.type];return!!(f&&!e.dead&&!(e.spawn>0)&&f(e))};
// the ones whose blow is not a shot of the game (the spores, the bomb, the meteor, the beam): when getting ready ends, the attack's blow
const NVA={mushroom:1,bomber:1,pyro:1,shadoweye:1};
// the move: while it gets ready, the held «prep» of its model (the knock back of a hit still wins); the attack that follows starts from its
// blow. The necromancer's summoning plays his own move «Evoca» as long as it lasts
{const _m=n3Move;n3Move=function(e){const r=_m(e);if(!NV.on||isBoss(e.type))return r;const M=N3.meta[e.type],t=G.t||0;
  if(e.type==='necro'&&e.cast>0&&M.an.includes('summon')&&r[0]!=='hit')return['summon',Math.min(.999,1-e.cast)];
  if(!M.an.includes('prep')||!nvReady(e)){if(e.nvP!=null&&NVA[e.type]&&M.an.includes('attack')&&!(e.a3>=e.nvP)){e.a3=t;e.aim3=1}e.nvP=null;return r}
  if(e.nvP==null)e.nvP=t;e.aim3=Math.max(e.aim3||0,1);if(r[0]==='hit')return r;
  return['prep',((t-e.nvP)/((M.dur&&M.dur.prep)||.8))%1]}}
// the call when it starts getting ready, and the sounds of the bodies as their move goes on
{const _u=update;update=function(dt){_u(dt);if(!NV.on||!G||G.state!=='play'||!AU.ctx||!AU.on.sfx)return;try{
  for(const e of G.enemies){if(isBoss(e.type))continue;const on=nvReady(e);if(on&&!e.nvO&&VOX[e.type]&&VOX[e.type].p)voxPlay(e,'p');e.nvO=on}
  const L=G.ecorpses;if(L)for(const c of L){const S=c.live&&NVD[c.type];if(!S)continue;const p=c.t/c.dd;while(c.ns<S.length&&p>=S[c.ns][0]){const f=S[c.ns][1];c.ns++;
    const d=P?Math.hypot(c.x-P.x,c.y-P.y):0;AU.pan=Math.max(-.7,Math.min(.7,(c.x-(G.vx||0)-VW/2)/200));nvSay(c.type,f,.8*Math.max(.3,1-d/520))}}}catch(er){}}}
// the body plays the model's «muore» (at most NV.live at once: the others keep the photo of before), then fades in .35 s
{const _a=addECorpse;addECorpse=function(e){_a.apply(this,arguments);try{if(!NV.on||LOWFX)return;const L=G.ecorpses,c=L&&L[L.length-1],M=N3.meta[e.type];
  if(!c||c.type!==e.type||!M||!M.an.includes('die')||L.filter(o=>o.live).length>=NV.live)return;
  c.live=true;c.f=e.f3!=null?e.f3:(typeof e.face==='number'?e.face:Math.PI/2);c.big=(e.elite||G.giant)&&!e.type.includes('slime')?1.22:1;c.dd=(M.dur&&M.dur.die)||1;c.dur=c.dd+.35;c.ns=0}catch(er){}}}
{const _d=drawECorpse;drawECorpse=function(c){if(!c.live)return _d.apply(this,arguments);const M=N3.meta[c.type],p=Math.min(.999,c.t/c.dd),al=1-Math.min(1,Math.max(0,(c.t-c.dd)/.35));
  if(al<=.01)return;ctx.save();ctx.globalAlpha*=al;
  // one that died up in the air (a slime mid-jump) comes down to the floor in the first quarter of the move
  try{N3[c.type](c.x,c.y+8-(c.z||0)*(1-Math.min(1,p/.25)),c.f,'die',p,(M.sc||1)*c.big,{noFx:LOWFX})}catch(er){c.live=false;c.dur=c.t+.3}finally{ctx.restore()}}}
