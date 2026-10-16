// =====================================================================
// THE CLASSIC ENEMIES MORE ALIVE (Denis, 16 October: «Nemici più vivi»: the complete moves of the classic enemies and their voices; the
// piece of phase 2 still to do). They walked, attacked, were hit and died (77) already; what was missing:
// - «Prepara», the wind-up: before the blow the enemy gathers itself (the start of its own attack, held: lower and wider as one who
//   takes a breath, a little higher at the end, its colour gathering round its feet) and a short voice of its family is heard (a wet
//   breath, a grunt, a rattle of bones, a buzz, a creak, a grind of stone or ice, a growl). It shows only when the blow is really coming,
//   from what the game is doing: the aim (goblin, skeleton), the charge (eye flower, obsidian golem), the last moment before the shot
//   (plant, imp, ice sentinel: their cooldown, NV.cd). The game's times do not change: it only shows what was already there.
// - Standing still they look round slowly (the Classic: «da fermi respirano e si guardano intorno piano»): the body turns a little to one
//   side and the other, slowly, and comes back to face you when they move, aim or shoot.
// The bosses keep their own moves. LOWFX: no glow.
// =====================================================================
const NV={cd:{plant:.5,imp:.45,icesentinel:.5},fam:{}};
const NVGRP=k=>{const M=N3.meta[k];return !!M&&(['1','2','3','4'].includes(String(M.g))||['goblin','skeleton','necro','bonelet','pyro','bomber'].includes(k))};
const nvRgb=k=>{const h=(typeof ECOL!=='undefined'&&ECOL[k])||'#fff0c8',n=parseInt(h.slice(1),16);return`${n>>16},${n>>8&255},${n&255}`};
// ---- the move 'prep' for every normal enemy with an attack and no wind-up of its own
if(typeof N3!=='undefined')for(const k in N3.meta){const M=N3.meta[k];if(!NVGRP(k)||!M.an||!M.an.includes('attack')||M.an.includes('prep')||typeof N3[k]!=='function')continue;const f=N3[k];
  N3[k]=function(x,y,face,anim,p,sc,o){if(anim!=='prep')return f.apply(this,arguments);const u=Math.max(0,Math.min(1,p/.85)),q=u*u*(3-2*u),s=sc||1,lift=p>.85?(p-.85)/.15:0;
    if(!(o&&o.noFx)&&!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow(nvRgb(k),x,y-10*s,(13+12*q)*s,.07+.2*q);ctx.restore()}
    ctx.save();ctx.translate(x,y);ctx.scale(1+.055*q-.03*lift,1-.075*q+.05*lift);ctx.translate(-x,-y);
    try{return f.call(this,x,y,face,'attack',.04+.27*q,sc,o)}finally{ctx.restore()}};
  M.an=M.an.slice();M.an.splice(M.an.indexOf('attack'),0,'prep');M.dur={...M.dur,prep:.8};M.lab={...(M.lab||{}),prep:'Prepara'}}
// ---- when: the wind-up the game is already doing
{const _m=n3Move;n3Move=function(e){const r=_m(e);try{const M=N3.meta[e.type];if(!M||!M.an.includes('prep')||isBoss(e.type)||r[0]==='hit')return r;
  const t=G.t||0;if(e.a3!=null&&t-e.a3<((M.dur&&M.dur.attack)||1)*.5){e.pv3=0;return r}
  let k=null;
  if(e.aim>0){const a0=Math.max(e.aim3||0,e.aim,.01);k=1-e.aim/a0}
  else if(e.wind>0){e.wd3=Math.max(e.wd3||0,e.wind);k=1-e.wind/e.wd3}
  else if(NV.cd[e.type]&&typeof e.cd==='number'&&e.cd>0&&e.cd<NV.cd[e.type]&&G.state==='play'&&(!e.moving||e.type==='icesentinel'))k=1-e.cd/NV.cd[e.type];
  if(!(e.wind>0))e.wd3=0;
  if(k==null){e.pv3=0;return r}
  if(!e.pv3){e.pv3=1;nvCue(e)}return['prep',Math.max(0,Math.min(.999,k))]}catch(err){return r}}}
// ---- standing still: they look round slowly (the turn eases in, and back out quickly when they move, aim or shoot)
{const _f=n3Face;n3Face=function(e){const f=_f(e);try{if(isBoss(e.type)||!NVGRP(e.type))return f;const t=G.t||0,dt=Math.min(.1,Math.max(0,t-(e.sw3t==null?t:e.sw3t)));e.sw3t=t;
  const idle=e.a3n==='idle'&&!(e.aim>0)&&!(e.wind>0);e.sw3=Math.max(0,Math.min(1,(e.sw3||0)+(idle?dt*1.1:-dt*4)));if(e.sw3<=0)return f;const o=e.o3||0;
  return f+e.sw3*(.42*Math.sin(t*.47+o)+.16*Math.sin(t*1.11+o*2.3))}catch(err){return f}}}
// ---- the voice of the wind-up, by family (as their deaths in 77)
const NVP={
  goo:t=>{fNoise(t,.28,'lowpass',VR(700,.15),1.2,.06,{brown:true,att:.12});if(typeof M!=='undefined')M.goo(t+.12,.35)},
  fall:t=>ev(t,VR(250,.08),VR(330,.06),.2,.1,[650,1500],{att:.05}),
  bones:t=>rattle(t,3,.32,VR(1000,.1)),
  fly:t=>squeak(t,VR(700,.1),VR(1400,.1),.26,.035),
  wilt:t=>{rustle(t,.09,.25);fNoise(t+.14,.12,'bandpass',VR(1200,.15),2.5,.04)},
  crumble:t=>{fNoise(t,.32,'lowpass',VR(380,.12),.9,.12,{brown:true,att:.15});if(typeof M!=='undefined')M.stone(t+.2,.3)},
  beast:t=>ev(t,VR(150,.08),VR(190,.06),.32,.12,[600,1300],{rasp:.8,trem:24})};
function nvCue(e){if(!AU.ctx||!AU.on.sfx||AU.ctx.state!=='running'||!G||G.state!=='play')return;const now=G.t||0;if(e.vxP!=null&&now-e.vxP<1.4)return;e.vxP=now;
  const fam=(typeof EDF!=='undefined'&&EDF[e.type])||'fall',f=e.type==='icesentinel'?t=>{M.ice(t,.5);fNoise(t,.3,'highpass',VR(4200,.1),.8,.03,{att:.1})}:NVP[fam];if(!f)return;
  try{const k=enemyAt(e),t=AU.ctx.currentTime+.01;withVol(k*.85,()=>f(t))}catch(err){}AU.pan=0}
