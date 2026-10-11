// =====================================================================
// SOUND WOW: the abyss is heard as well as seen. Under every room the wind of the abyss and the slow breath of the beast;
// each chapter adds its own life (drips and distant bones, boiling lava, bubbles and frogs, creaking ice and whistling wind).
// Everything that changes the arena has its sound (stones falling, icicles, fire catching, torches turning, frost, roots, flowers),
// the mimic and the hydra have voices, and sounds sit left or right of where the camera looks
// =====================================================================
const SFX2={
  crumble(t,v){fNoise(t,.8,'lowpass',260,.7,.28*v,{brown:true,att:.05,f2:110,rev:.45});for(let i=0;i<10;i++)M.stone(t+.06+Math.random()*.75,(.25+.35*Math.random())*v)},
  icicles(t,v){fNoise(t,.5,'highpass',5200,.7,.05,{att:.2,rev:.5});for(let i=0;i<9;i++)M.glass(t+.12+Math.random()*.85,(.35+.5*Math.random())*v,VR(2100+i*170,.15))},
  ignite(t){whoosh(t,.45,260,1900,.3,.2);fNoise(t+.05,.7,'bandpass',650,.8,.16,{brown:true,f2:1100,att:.1});for(let i=0;i<9;i++)fNoise(t+.1+Math.random()*.7,.012,'highpass',3600,.7,.08)},
  magic(t,kind){if(kind==='witch'){[45,48,52,55].forEach((m,i)=>vBell(null,t+i*.11,m+12,1.6,.035));fNoise(t,1,'bandpass',400,4,.1,{f2:1400,att:.4,rev:.6})}
    else if(kind==='frost'){fNoise(t,.9,'highpass',3800,.7,.12,{f2:9000,att:.2,rev:.6});[84,88,91].forEach((m,i)=>vBell(null,t+.1+i*.09,m,1.2,.03))}
    else{whoosh(t,.5,220,2400,.32,.2);M.metal(t+.05,.6,VR(520,.05),.6);fNoise(t,.6,'bandpass',900,.8,.12,{brown:true,att:.05})}},
  frost(t){fNoise(t,.7,'highpass',4200,.7,.11,{f2:9000,att:.1,rev:.5});for(let i=0;i<6;i++)M.glass(t+i*.07+Math.random()*.05,.45,VR(2600+i*240,.1))},
  groan(t){const c=AU.ctx,o=osc('sawtooth',VR(92,.1),t,t+1.15),vb=osc('sine',7,t,t+1.15),vg=c.createGain(),bp=filt('bandpass',VR(430,.1),6),g=c.createGain();vg.gain.value=9;vb.connect(vg);vg.connect(o.frequency);o.frequency.linearRampToValueAtTime(68,t+1.05);
    o.connect(bp);bp.connect(g);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.13,t+.25);g.gain.exponentialRampToValueAtTime(.0005,t+1.1);route(g,null,.45);M.wood(t+.45,.5,VR(210,.1));M.wood(t+.75,.35,VR(170,.1))},
  bloom(t){[67,71,74,79,83].forEach((m,i)=>vBell(null,t+i*.07,m,1.1,.022));fNoise(t,.6,'bandpass',2500,.8,.04,{f2:6000,att:.3,rev:.5})},
  hiss(t){fNoise(t,.85,'bandpass',VR(4800,.06),3,.15,{f2:2800,att:.12,rev:.35});fNoise(t,.6,'highpass',7000,.7,.05,{att:.1})},
  deepBubble(t){for(let i=0;i<5;i++)fThump(t+i*.09+Math.random()*.05,VR(130,.25),VR(360,.25),.08,.14,.35)},
  // the mimic: a lid creaking open, a wet snarl, and the bones of its limbs clicking as they unfold
  mimicWake(t){const c=AU.ctx,o=osc('sawtooth',VR(150,.05),t,t+1),bp=filt('bandpass',900,7),g=c.createGain();o.frequency.linearRampToValueAtTime(310,t+.9);o.connect(bp);bp.connect(g);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.09,t+.3);g.gain.exponentialRampToValueAtTime(.0005,t+.95);route(g,null,.35);
    fNoise(t+.5,.9,'bandpass',VR(480,.08),4,.22,{brown:true,f2:260,att:.15,rev:.4});for(let i=0;i<8;i++)M.bone(t+.1+i*.09+Math.random()*.04,.5,VR(1300-i*60,.1));fThump(t+.95,110,45,.3,.4,.2)},
  mimicStep(t){M.bone(t,.24,VR(1700,.15));fNoise(t,.02,'bandpass',VR(3000,.2),3,.07)},
  mimicBreath(t){fNoise(t,1.1,'bandpass',VR(360,.1),3,.3,{brown:true,f2:240,att:.45,rev:.3});fNoise(t+.2,.6,'bandpass',VR(1800,.1),4,.07,{att:.2})},
  // a growl from very far away, under the floor: the beast
  farGrowl(t){const c=AU.ctx,n=c.createBufferSource();n.buffer=AU.brown;n.loop=true;n.start(t);n.stop(t+2.6);const lp=filt('lowpass',190,1.2),am=osc('sine',VR(18,.2),t,t+2.6),amg=c.createGain(),pre=c.createGain(),g=c.createGain();
    amg.gain.value=.5;am.connect(amg);amg.connect(pre.gain);pre.gain.value=.6;n.connect(pre);pre.connect(lp);lp.connect(g);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.32,t+.9);g.gain.exponentialRampToValueAtTime(.0005,t+2.5);route(g,null,.8)}};
{const _s=sfx;sfx=function(k,arg,x){if(x!=null&&G&&G.vx!=null)x=x-(G.vx||0)-VW/2+180;
  if(!SFX2[k]){_s(k,arg,x);return}if(!AU.ctx||!AU.on.sfx)return;const now=performance.now();if(now-(AU.last[k]||0)<120)return;AU.last[k]=now;
  AU.pan=x==null?0:Math.max(-.7,Math.min(.7,(x-180)/200));try{SFX2[k](AU.ctx.currentTime+.005,arg==null?1:arg)}catch(e){}AU.pan=0}}
// --- the arena's reactions are heard
{const f=ENV2.fall;ENV2.fall=function(n,ice){f(n,ice);sfx(ice?'icicles':'crumble',Math.min(1.2,.5+n/16))}}
{const f=ENV2.ignite;ENV2.ignite=function(x,y,r){const before=G.rocks.filter(k=>k.burn>0).length;f(x,y,r);if(G.rocks.filter(k=>k.burn>0).length>before)sfx('ignite',1,x)}}
{const f=ENV2.torches;ENV2.torches=function(cols,light,sec){f(cols,light,sec);sfx('magic',/7a2fd0|ff3c10/.test(cols[0])?'witch':/1a62ff|5fb8ff/.test(cols[0])?'frost':'forge')}}
{const f=ENV2.mark;ENV2.mark=function(kind,x,y,r){f(kind,x,y,r);if(kind==='frost')sfx('frost',1,x);else if(kind==='roots')sfx('groan',1,x);else if(kind==='bloom')sfx('bloom',1,x)}}
{const f=ENV2.rocks;ENV2.rocks=function(x,y,R,dmg){const st=G.rocks.map(k=>wearSt(k));f(x,y,R,dmg);const k=G.rocks.find((k,i)=>wearSt(k)>st[i]);if(k)sfx('rock',k.kind,k.x)}}
// --- voices: the mimic unfolding and skittering, the hydra hissing as its heads break the water
{const _u=update;update=function(dt){_u(dt);if(!G||!G.enemies||!AU.ctx)return;
  for(const e of G.enemies){if(e.dead)continue;
    if(e.type==='mimic'){if(e.intro>0&&e.iT!=null&&!e._snW&&e.iT>.4){e._snW=1;sfx('mimicWake',1,e.x)}
      if(e.st==='walk'){const st=Math.floor((e.hopT||0)/Math.PI*2);if(st!==e._snS){e._snS=st;sfx('mimicStep',1,e.x)}}
      e._snB=(e._snB||rand(3,6))-dt;if(e._snB<=0){e._snB=rand(4,7);if(e.st==='walk')sfx('mimicBreath',1,e.x)}}
    if(e.type==='hydra'&&e.heads){for(const h of e.heads){if(h._snq!=null&&h._snq<=0&&h._q>0)sfx('hiss',1,e.x+h.s*36);h._snq=h._q}
      if(e.intro>0&&e.iT!=null){const k=Math.floor(e.iT/.7);if(k!==e._snI&&e.iT<1.4){e._snI=k;sfx('deepBubble',1,e.x)}}
      if(e.st==='dive'&&e.sub==='under'&&!e._snD){e._snD=1;sfx('deepBubble',1,e.tx)}if(e.st!=='dive')e._snD=0}}}}

// --- ambience: the wind of the abyss, the breath of the beast, and the chapter's own life
const AMB={kind:null,bus:null,nodes:[],next:{}};
const ambVol=()=>AU.on.sfx?.42*VOLS():0;
function ambStop(){if(!AMB.bus)return;const c=AU.ctx,b=AMB.bus,ns=AMB.nodes;b.gain.setTargetAtTime(0,c.currentTime,.6);setTimeout(()=>{for(const n of ns)try{n.stop()}catch(e){}try{b.disconnect()}catch(e){}},3000);AMB.bus=null;AMB.nodes=[];AMB.kind=null}
function ambStart(kind){if(!AU.ctx||AMB.kind===kind)return;ambStop();if(!kind)return;const c=AU.ctx,t=c.currentTime,far=t+36000,menu=kind==='menu';AMB.kind=kind;AMB.next={};
  const bus=c.createGain();bus.gain.value=0;bus.connect(AU.master);bus.gain.setTargetAtTime(ambVol()*(menu?.6:1),t,1.5);AMB.bus=bus;const rs=c.createGain();rs.gain.value=.35;bus.connect(rs);rs.connect(AU.rev);
  // wind through the abyss: brown noise in a slowly moving band, in gusts
  const n=c.createBufferSource();n.buffer=AU.brown;n.loop=true;n.start(t);const bp=filt('bandpass',kind==='ice'?900:kind==='lava'?260:420,.8),wg=c.createGain();wg.gain.value=kind==='ice'?.55:.36;
  const l1=osc('sine',.06,t,far),l1g=c.createGain();l1g.gain.value=kind==='ice'?520:200;l1.connect(l1g);l1g.connect(bp.frequency);
  const l2=osc('sine',.13,t,far),l2g=c.createGain();l2g.gain.value=kind==='ice'?.25:.16;l2.connect(l2g);l2g.connect(wg.gain);n.connect(bp);bp.connect(wg);wg.connect(bus);
  // the beast breathing far below: two deep tones swelling in and out every eight seconds
  const d1=osc('sine',41,t,far),d2=osc('sine',41.7,t,far),d3=osc('triangle',61.5,t,far),dg=c.createGain(),d3g=c.createGain();d3g.gain.value=.35;dg.gain.value=.035;d1.connect(dg);d2.connect(dg);d3.connect(d3g);d3g.connect(dg);
  const br=osc('sine',.125,t,far),brg=c.createGain();brg.gain.value=.03;br.connect(brg);brg.connect(dg.gain);dg.connect(bus);
  const bn=c.createBufferSource();bn.buffer=AU.brown;bn.loop=true;bn.start(t);const bnf=filt('lowpass',160,.7),bng=c.createGain();bng.gain.value=.12;const brg2=c.createGain();brg2.gain.value=.12;br.connect(brg2);brg2.connect(bng.gain);bn.connect(bnf);bnf.connect(bng);bng.connect(bus);
  AMB.nodes=[n,l1,l2,d1,d2,d3,br,bn]}
const AMBEV={
  moss:[[2,6,t=>{vBell(null,t,VR(96,.02),.5,.012);fThump(t,VR(900,.1),VR(1400,.1),.03,.03,.7)}],[14,26,t=>{for(let i=0;i<3;i++)M.bone(t+i*.12,.12,VR(900,.1))}],[18,32,t=>{M.metal(t,.18,VR(420,.05),.8);M.metal(t+.2,.12,VR(380,.05),.8)}]],
  lava:[[1.2,3.5,t=>{fThump(t,VR(90,.2),VR(240,.2),.09,.1,.3);fThump(t+.07,VR(130,.2),VR(320,.2),.06,.06,.3)}],[10,20,t=>fNoise(t,1.6,'lowpass',120,.7,.25,{brown:true,att:.5,rev:.4})],[3,7,t=>{for(let i=0;i<4;i++)fNoise(t+Math.random()*.4,.012,'highpass',3500,.7,.035)}]],
  swamp:[[1.5,4,t=>{for(let i=0;i<3;i++)fThump(t+i*.08,VR(220,.3),VR(600,.3),.05,.04,.3)}],[6,12,t=>{const f=VR(160,.15);for(let i=0;i<2;i++){fThump(t+i*.12,f,f*.7,.1,.05,.5);fNoise(t+i*.12,.09,'bandpass',VR(520,.05),6,.035,{rev:.5})}}],[8,16,t=>fNoise(t,1.4,'bandpass',4200,6,.012,{att:.5,f2:4600})]],
  ice:[[5,12,t=>fModal(t,VR(420,.15),[1,2.3,3.7],[.6,.4,.25],.03,.6)],[9,18,t=>{const c=AU.ctx,o=osc('sine',VR(900,.1),t,t+2.2),g=c.createGain();o.frequency.linearRampToValueAtTime(VR(1300,.1),t+1.1);o.frequency.linearRampToValueAtTime(VR(1000,.1),t+2.1);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.012,t+.8);g.gain.exponentialRampToValueAtTime(.0003,t+2.1);o.connect(g);route(g,null,.7)}]],
  menu:[[.12,.45,t=>{if(!$('tabPlay').hidden)fNoise(t,.012,'highpass',VR(3000,.3),.7,.03)}],[3,6,t=>{if(!$('tabPlay').hidden)fNoise(t,.5,'bandpass',600,.8,.03,{brown:true,att:.1})}]]};
setInterval(()=>{const c=AU.ctx;if(!c||c.state!=='running')return;let want=null;
  if(INTRO&&INTRO.on)want=null;else if(!$('menu').hidden)want='menu';else if(started&&G&&G.room){const th=themeOf(G.room);want=LAVAZ.includes(th)?'lava':isSwamp(th)?'swamp':isIce(th)?'ice':'moss'}
  if(want!==AMB.kind)ambStart(want);if(!AMB.bus)return;
  const t=c.currentTime,evs=(AMBEV[AMB.kind]||[]).concat(AMB.kind==='menu'?[]:[[28,50,tt=>SFX2.farGrowl(tt)]]);if(paused&&AMB.kind!=='menu')return;
  evs.forEach((ev,i)=>{if(AMB.next[i]==null)AMB.next[i]=t+rand(ev[0],ev[1]);if(t>=AMB.next[i]){AMB.next[i]=t+rand(ev[0],ev[1]);if(AU.on.sfx){AU.pan=rand(-.6,.6);try{ev[2](t+.02)}catch(e){}AU.pan=0}}})},250);
{const _a=audioSettings;audioSettings=function(){_a();if(AU.ctx&&AMB.bus)AMB.bus.gain.setTargetAtTime(ambVol()*(AMB.kind==='menu'?.6:1),AU.ctx.currentTime,.3)}}
// =====================================================================
// FIRST RUN ONLY: a little hand, no words. It drags in a circle (move with your finger) and lifts (stand still and the hero
// shoots by himself). It goes away the moment you touch the screen, or by itself after a few seconds, and never comes back
// =====================================================================
{const st=document.createElement('style');st.textContent=`#hand1{position:absolute;left:38%;bottom:7%;width:120px;height:120px;margin-left:-60px;pointer-events:none;z-index:40;opacity:0;transition:opacity .35s}
#hand1.on{opacity:1}#hand1 .ring{position:absolute;left:30px;top:30px;width:60px;height:60px;border:3px dashed rgba(246,234,210,.55);border-radius:50%}
#hand1 .dot{position:absolute;left:45px;top:45px;width:30px;height:30px;border-radius:50%;background:rgba(246,234,210,.5);animation:hand1dot 2.4s ease-in-out infinite}
#hand1 svg{position:absolute;left:52px;top:52px;width:46px;height:56px;animation:hand1 2.4s ease-in-out infinite;filter:drop-shadow(0 3px 0 rgba(0,0,0,.45))}
@keyframes hand1{0%{transform:translate(0,0)}15%{transform:translate(18px,-6px)}35%{transform:translate(0,-20px)}55%{transform:translate(-18px,-6px)}70%{transform:translate(0,0)}85%{transform:translate(0,14px) scale(.9);opacity:.5}100%{transform:translate(0,0);opacity:1}}
@keyframes hand1dot{0%{transform:translate(0,0)}15%{transform:translate(18px,-6px)}35%{transform:translate(0,-20px)}55%{transform:translate(-18px,-6px)}70%,100%{transform:translate(0,0)}}`;document.head.appendChild(st)}
function showHand(){if(SAVE.handSeen||(SAVE.runs||0)>0)return;SAVE.handSeen=1;save();const w=$('wrap')||document.body;let h=$('hand1');if(!h){h=document.createElement('div');h.id='hand1';
    h.innerHTML='<div class="ring"></div><div class="dot"></div><svg viewBox="0 0 40 50"><path d="M14 4c0-2.2 3.6-2.2 3.6 0v18l2-1.5V9c0-2.2 3.6-2.2 3.6 0v12l2-.5V12c0-2.2 3.6-2.2 3.6 0v11l1.6.5V17c0-2.2 3.4-2.2 3.4 0v15c0 9-5 15-13 15-6 0-9-3-12-8L4 30c-1.2-2 1.4-4 3.2-2.4L14 33z" fill="#f6ead2" stroke="#1b1612" stroke-width="2.4" stroke-linejoin="round"/></svg>';w.appendChild(h)}
  requestAnimationFrame(()=>h.classList.add('on'));const off=()=>{h.classList.remove('on');removeEventListener('pointerdown',off,true);clearTimeout(h._t)};h._t=setTimeout(off,4500);setTimeout(()=>addEventListener('pointerdown',off,true),300)}
{const _sr=startRun;startRun=function(){const first=!(SAVE.runs>0)&&!SAVE.handSeen;_sr.apply(this,arguments);if(first&&started)setTimeout(showHand,900)}}
