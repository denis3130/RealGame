// =====================================================================
// AUDIO NUOVO (punti 47, 49 e 50 del piano di Denis, anteprima 47; gli zombie e i bossoli stanno in anteprime/zombie/audio_zombie.js).
// - La musica del menu Classico: un pezzo da gioco moderno per il telefono, energico e orecchiabile, allegro ma non da bambini (re maggiore,
//   112 battiti: marimba che canta il ritornello, accordi pizzicati in levare, basso sincopato, cassa, battito di mani e charleston), con
//   una seconda parte e variazioni a ogni giro così si ascolta volentieri tante volte; i bottoni suonano con lei (una nota di marimba).
// - Il menu Zombie: un bordone scuro, il cuore che batte piano, un violoncello lontano, il carillon stonato, il coro, e intorno al falò il
//   fuoco, il vento, i corvi, gli zombie che gemono lontano (con la loro voce vera), una catena; i bottoni fanno un colpo sordo di legno.
// - Il passaggio tra le modalità: la musica di prima si abbassa mentre la mano trascina, quella nuova entra quando arriva l'altro menu.
// - I nemici Classici: ognuno con i suoi versi quando attacca, quando viene colpito e quando muore, e i suoi passi (il goblin che ride, lo
//   scheletro che sbatte le ossa, lo slime che fa ciaf, il pipistrello che squittisce, il golem che macina pietra, il lupo che ringhia…),
//   più piano se è lontano e mai troppi insieme.
// =====================================================================
// ------------------------------------------------------------------ instruments of the new menu music
function vMallet(tr,t,m,dur,vel){const c=AU.ctx,f=mtof(m),g=c.createGain();
  for(const[r,a,d] of[[1,1,Math.min(dur,1.1)],[3.99,.32,.12],[9.8,.12,.05]]){const o=osc('sine',f*r,t,t+d+.05),og=c.createGain();og.gain.setValueAtTime(.0001,t);og.gain.linearRampToValueAtTime(vel*a,t+.003);og.gain.exponentialRampToValueAtTime(.0005,t+d);o.connect(og);og.connect(g)}
  const n=noiseSrc(t,.012),bp=filt('bandpass',3200,1.2),ng=c.createGain();ng.gain.setValueAtTime(vel*.5,t);ng.gain.exponentialRampToValueAtTime(.0005,t+.012);n.connect(bp);bp.connect(ng);ng.connect(g);route(g,tr,.22,.18)}
function vPluck(tr,t,ms,dur,vel){const c=AU.ctx,g=c.createGain(),lp=filt('lowpass',3600,1.2);lp.frequency.setValueAtTime(3600,t);lp.frequency.exponentialRampToValueAtTime(520,t+.16);
  for(const m of ms)for(const[ty,det] of[['sawtooth',-6],['square',6]]){const o=osc(ty,mtof(m),t,t+dur+.05);o.detune.value=det;const og=c.createGain();og.gain.value=ty==='square'?.5:1;o.connect(og);og.connect(lp)}
  lp.connect(g);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vel/ms.length,t+.004);g.gain.exponentialRampToValueAtTime(.0005,t+dur);route(g,tr,.15,.12)}
function vCello(tr,t,m,dur,vel){const c=AU.ctx,f=mtof(m),g=c.createGain(),lp=filt('lowpass',900,.8),v=osc('sine',5,t,t+dur+.6),vg=c.createGain();vg.gain.value=f*.006;v.connect(vg);
  for(const[ty,k] of[['sawtooth',1],['triangle',.6]]){const o=osc(ty,f,t,t+dur+.6);vg.connect(o.frequency);const og=c.createGain();og.gain.value=k;o.connect(og);og.connect(lp)}
  lp.connect(g);adsr(g,t,.45,vel,dur*.7,.8);route(g,tr,.55,0)}
function dKick(tr,t,v){const c=AU.ctx,o=osc('sine',150,t,t+.3),g=c.createGain();o.frequency.exponentialRampToValueAtTime(46,t+.12);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+.003);g.gain.exponentialRampToValueAtTime(.0005,t+.28);o.connect(g);route(g,tr,0,0);
  const n=noiseSrc(t,.01),hp=filt('highpass',2500),ng=c.createGain();ng.gain.setValueAtTime(v*.25,t);ng.gain.exponentialRampToValueAtTime(.0005,t+.01);n.connect(hp);hp.connect(ng);route(ng,tr,0,0)}
function dClap(tr,t,v){const c=AU.ctx;for(const[d,k] of[[0,1],[.011,.8],[.022,.9]]){const n=noiseSrc(t+d,.14),bp=filt('bandpass',1500,.9),g=c.createGain();g.gain.setValueAtTime(.0001,t+d);g.gain.linearRampToValueAtTime(v*k,t+d+.002);g.gain.exponentialRampToValueAtTime(.0005,t+d+(k===.9?.13:.02));n.connect(bp);bp.connect(g);route(g,tr,.25,0)}}
function dHat(tr,t,v,open){const c=AU.ctx,n=noiseSrc(t,open?.2:.04),hp=filt('highpass',8200),g=c.createGain();g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0005,t+(open?.18:.035));n.connect(hp);hp.connect(g);route(g,tr,.05,0)}
// ------------------------------------------------------------------ 49. the Classic menu: «Mossbound», bright and catchy
TRACKS.menu={bpm:112,
  // I-V-vi-IV, then a lift in the second half; chords as voiced for the plucks, roots for the bass
  ch:[[62,66,69],[61,64,69],[62,66,71],[62,67,71],[62,66,69],[61,64,69],[62,67,71],[61,64,69],[62,67,71],[61,64,69],[61,66,69],[62,66,71],[62,67,71],[61,64,69],[62,66,69],[62,67,69]],
  root:[38,33,35,31,38,33,31,33,31,33,30,35,31,33,38,38],
  mel:[[[0,78,2],[2,76,2],[4,74,2],[6,76,4],[10,81,2],[12,78,4]],[[0,76,2],[2,74,2],[4,73,2],[6,74,6],[12,69,4]],[[0,74,2],[2,76,2],[4,78,2],[6,81,4],[10,83,2],[12,81,4]],[[0,79,4],[4,78,2],[6,76,6],[12,74,4]],
       [[0,78,2],[2,76,2],[4,74,2],[6,76,4],[10,81,2],[12,78,4]],[[0,76,2],[2,78,2],[4,81,2],[6,85,4],[10,83,2],[12,81,4]],[[0,83,4],[4,81,2],[6,79,2],[8,78,4],[12,76,4]],[[0,76,6],[6,73,2],[8,76,4],[12,69,4]],
       [[0,83,6],[6,81,2],[8,79,8]],[[0,81,6],[6,79,2],[8,78,8]],[[0,78,4],[4,81,4],[8,85,8]],[[0,83,12],[12,81,4]],[[0,79,4],[4,83,4],[8,86,8]],[[0,85,4],[4,83,4],[8,81,8]],[[0,78,4],[4,81,4],[8,86,6],[14,85,2]],[[0,86,12]]],
  play(tr,step,t,spb){const s=step%16,bar=Math.floor(step/16)%16,cyc=Math.floor(step/256),C=this.ch[bar],B=bar>=8,brk=cyc%3===2&&!B,intro=cyc===0&&bar<2;
    // the pad under the second half and the breakdown
    if(s===0&&(B||brk))vPad(tr,t,[C[0]-12,C[1]-12,C[2]-12],spb*16,.06,1500);
    // the bass: root, octave, push into the next bar
    if(!intro){const r=this.root[bar];if(s===0)vBass(tr,t,r,spb*5,.17);if(s===6)vBass(tr,t,r+12,spb*2,.12);if(s===8)vBass(tr,t,r,spb*3,.15);if(s===11)vBass(tr,t,r+7,spb*2,.12);if(s===14&&!brk)vBass(tr,t,this.root[(bar+1)%16]-1,spb*2,.12)}
    // chords plucked on the off-beats
    if(s%4===2)vPluck(tr,t,C,spb*1.6,brk?.05:.075);
    // drums: kick, clap on 2 and 4, hats; a fill at the end of each half
    if(!intro&&!brk){if(s===0||s===8||(B&&(s===6||s===11)))dKick(tr,t,.42);if(s===4||s===12)dClap(tr,t,.13);if(s%2===1)dHat(tr,t,s%4===3?.032:.02);if(s===14&&bar%4===3)dHat(tr,t,.04,true);
      if(bar%8===7&&s>=12)dTom(tr,t,.16,[220,190,165,140][s-12])}
    else if(brk&&(s===0||s===8))dKick(tr,t,.22);
    // the hook: marimba in the first half (an octave down on the odd rounds), bells in the second (with a third above on the odd rounds)
    if(!(brk&&bar<4))for(const[ss,m,l] of this.mel[bar])if(ss===s){if(!B)vMallet(tr,t,m-(cyc%2===1?12:0),spb*l*1.6,.075);else{vBell(tr,t,m,spb*l*1.8,.045);if(cyc%2===1)vBell(tr,t,m+4,spb*l*1.6,.02)}}}};
// ------------------------------------------------------------------ 50. the Zombie menu: dark and quiet, the fire and the night around it
TRACKS.zmenu={bpm:60,ch:[[50,53,57],[46,50,53],[48,51,55],[45,49,52]],sc:[62,65,67,69,70,72,74],cel:[[0,62,10],[16,60,6],[24,58,8],[40,57,14],[56,58,8]],
  play(tr,step,t,spb){const s=step%16,bar=Math.floor(step/16)%4,C=this.ch[bar],cyc=Math.floor(step/64),loop=step%64;
    if(s===0){vPad(tr,t,[C[0]-12,C[1]-12],spb*16,.075,280);vBass(tr,t,C[0]-24,spb*12,.13)}
    // a heart beating slowly under everything
    if(s===0||s===3)dDrum(tr,t,s?.07:.1,s?54:62,36,.4,180,.05);
    if(s===0&&bar===0)vBell(tr,t,C[0]-12,spb*20,.03);
    // a cello far away, every other round
    if(cyc%2===0)for(const[ss,m,l] of this.cel)if(ss===loop)vCello(tr,t,m-12,spb*l*.9,.045);
    // the music box out of tune: a few notes, then it stops
    if(cyc%2===1&&(s===4||s===10||s===13)&&Math.random()<.65)vBox(tr,t,this.sc[Math.floor(Math.random()*this.sc.length)]-(Math.random()<.5?12:0)+(Math.random()-.5)*.35,spb*3,.02);
    if(s===8&&bar===2)vChoir(tr,t,[C[0],C[2]],spb*14,.028)}};
// the night round the fire: far moans (the zombies' own voice, far and with much room in it), wind that howls, a chain, an owl
if(typeof AMBEV!=='undefined'&&AMBEV.zmenu){AMBEV.zmenu.push(
  [8,18,t=>{if(typeof ZVB!=='undefined'&&ZVB.play('zombie','moan',t,.07,.85+Math.random()*.25,.95))return;if(typeof ZV==='undefined')return;const f=VR(85,.2);ZV.voice(t,f,f*VR(.75,.08),VR(1.6,.3),[[430,940],[380,820],[520,1050]][randi(0,2)],{vol:.028,att:.4,rasp:.5,breath:.5,rev:.9,fd:.85})}],
  [14,28,t=>{const c=AU.ctx,n=noiseSrc(t,3.2,true),bp=filt('bandpass',VR(520,.2),9),g=c.createGain();bp.frequency.linearRampToValueAtTime(VR(760,.15),t+1.4);bp.frequency.linearRampToValueAtTime(VR(480,.15),t+3);
    g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.05,t+1.2);g.gain.exponentialRampToValueAtTime(.0005,t+3.1);n.connect(bp);bp.connect(g);route(g,null,.6)}],
  [26,48,t=>{for(let i=0;i<3;i++)M.metal(t+i*.16+Math.random()*.05,.1,VR(1200,.1),.4)}],
  [35,70,t=>{const c=AU.ctx;for(const[d,f0] of[[0,420],[.45,400]]){const o=osc('sine',VR(f0,.02),t+d,t+d+.5),g=c.createGain();o.frequency.linearRampToValueAtTime(f0*.9,t+d+.4);g.gain.setValueAtTime(.0001,t+d);g.gain.linearRampToValueAtTime(.018,t+d+.08);g.gain.exponentialRampToValueAtTime(.0005,t+d+.45);o.connect(g);route(g,null,.7)}}])}
// ------------------------------------------------------------------ the buttons, in tune with the mode
{const _s=sfx;sfx=function(k,arg,x){if(k==='ui'&&AU.ctx&&AU.on.sfx){const now=performance.now();if(now-(AU.last.ui||0)<40)return;AU.last.ui=now;const t=AU.ctx.currentTime+.005;AU.pan=0;
    try{if(typeof zMode==='function'&&zMode()){M.wood(t,.32,VR(250,.05));fThump(t,VR(120,.05),70,.06,.12);if(Math.random()<.25)M.metal(t+.03,.06,VR(900,.1),.3)}
      else{vMallet(null,t,[74,76,78,81,83,86][randi(0,5)],.35,.05);fNoise(t,.01,'highpass',5000,.7,.04)}}catch(e){}return}
  return _s.apply(this,arguments)}}
// ------------------------------------------------------------------ the music follows the swipe between the modes: the old one goes down while
// the hand drags, the new one comes in when the other menu arrives
{const _pm=playMusic;playMusic=function(name){const T=typeof MM!=='undefined'&&MM.tr;if(T&&!T.mid&&(name==='zmenu'||name==='menu')&&AU.ctx){T.music=name;if(AU.cur&&AU.cur.name!==name)AU.cur.bus.gain.setTargetAtTime(0,AU.ctx.currentTime,.2);return}return _pm.call(this,name)}}
if(typeof modeMid==='function'){const _mm=modeMid;modeMid=function(){const T=MM.tr,pend=T&&!T.mid&&T.music;_mm.apply(this,arguments);if(pend){T.music=null;playMusic(pend)}}}
// ------------------------------------------------------------------ 47. the Classic enemies' own voices and steps
const ev=(t,f0,f1,dur,vol,form,o)=>{if(typeof ZV!=='undefined')ZV.voice(t,f0,f1,dur,form,{rasp:.15,breath:.15,att:.01,rev:.15,...(o||{}),vol})};
const squeak=(t,f0,f1,dur,vol)=>{const c=AU.ctx,o=osc('sine',f0,t,t+dur+.05),tr=osc('sine',VR(38,.2),t,t+dur+.05),tg=c.createGain(),g=c.createGain();tg.gain.value=f0*.06;tr.connect(tg);tg.connect(o.frequency);o.frequency.exponentialRampToValueAtTime(f1,t+dur);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol,t+.01);g.gain.exponentialRampToValueAtTime(.0005,t+dur);o.connect(g);route(g,null,.15)};
const rattle=(t,n,v,f)=>{for(let i=0;i<n;i++)M.bone(t+i*.035+Math.random()*.02,v*(1-i/(n+2)),VR(f||1100,.15))};
const chitter=(t,n,v)=>{for(let i=0;i<n;i++)fNoise(t+i*.03,.012,'bandpass',VR(3400,.15),3,v)};
const rustle=(t,v,d)=>{fNoise(t,d||.22,'bandpass',VR(2800,.15),.9,v,{att:.03})};
// [attack, hurt, death, step (and every how many px)]
const VOX={
  goblin:{a:t=>{for(let i=0;i<3;i++)ev(t+i*.09,VR(330,.08),290,.07,.11,[750,1700])},h:t=>ev(t,460,320,.12,.12,[800,1800]),d:t=>ev(t,400,170,.42,.13,[700,1500],{att:.02}),s:t=>{fThump(t,VR(260,.1),140,.03,.05);fNoise(t,.02,'bandpass',2600,1.5,.03)},px:26},
  imp:{a:t=>{for(let i=0;i<4;i++)ev(t+i*.07,VR(560,.08),500,.05,.08,[1000,2400])},h:t=>ev(t,700,500,.1,.09,[1100,2600]),d:t=>{ev(t,620,300,.3,.1,[1000,2200]);fNoise(t+.05,.2,'highpass',3000,.7,.05)},px:0},
  bomber:{a:t=>{fNoise(t,.5,'highpass',VR(4200,.1),1,.05,{att:.02});ev(t+.1,VR(240,.08),210,.09,.09,[650,1500]);ev(t+.2,230,200,.09,.08,[650,1500])},h:t=>ev(t,300,220,.14,.12,[650,1400]),d:t=>ev(t,280,140,.4,.12,[600,1300]),s:t=>fThump(t,VR(200,.1),110,.04,.05),px:28},
  skeleton:{a:t=>{M.bone(t,.6,VR(900,.1));rattle(t+.05,3,.35)},h:t=>rattle(t,4,.45,1250),d:null,s:t=>M.bone(t,.18,VR(1300,.15)),px:24},
  necro:{a:t=>{fNoise(t,.5,'bandpass',VR(2600,.2),4,.05,{att:.15,rev:.6});vChoir(null,t,[50,53],.6,.03)},h:t=>ev(t,170,130,.2,.11,[500,1100],{rasp:.4}),d:t=>{fNoise(t,.9,'bandpass',1800,3,.05,{att:.2,rev:.7});rattle(t+.3,6,.4)},s:t=>fNoise(t,.08,'bandpass',900,1,.03,{brown:true}),px:30},
  slime:{a:t=>{M.goo(t,.5);fThump(t+.05,VR(320,.1),VR(700,.1),.08,.08)},h:t=>{fThump(t,VR(380,.1),180,.07,.12);fNoise(t,.06,'lowpass',900,1.4,.08,{brown:true})},d:null,s:t=>fThump(t,VR(260,.15),140,.05,.05),px:34},
  bat:{a:t=>squeak(t,VR(2300,.1),3300,.16,.05),h:t=>squeak(t,3000,2200,.1,.06),d:t=>squeak(t,2800,900,.35,.06),s:t=>fNoise(t,.05,'bandpass',VR(700,.2),1.5,.03),px:22},
  mosquito:{a:t=>squeak(t,VR(900,.1),1300,.3,.03),h:t=>squeak(t,1400,900,.1,.04),d:t=>squeak(t,1200,300,.3,.04),px:0},
  plant:{a:t=>{rustle(t,.1);fNoise(t+.12,.18,'highpass',3500,.8,.06)},h:t=>rustle(t,.08,.12),d:null,px:0},
  wisp:{a:t=>{vBell(null,t,VR(91,.01),.8,.03);whoosh(t,.3,1800,4200,.05,.3)},h:t=>M.glass(t,.5,VR(2200,.1)),d:null,px:0},
  beetle:{a:t=>chitter(t,6,.15),h:t=>{M.shell(t,.6);chitter(t+.04,3,.09)},d:t=>{M.shell(t,1);fThump(t+.05,VR(240,.1),120,.08,.1)},s:t=>chitter(t,2,.05),px:18},
  golem:{a:t=>{fNoise(t,.6,'lowpass',VR(320,.1),.8,.2,{brown:true,att:.15});fThump(t,VR(70,.1),40,.5,.25,.2)},h:t=>{M.stone(t,.6);fNoise(t,.12,'bandpass',VR(2000,.2),2,.06)},d:null,s:t=>{fThump(t,VR(70,.1),38,.2,.22);fNoise(t,.12,'lowpass',500,.7,.08,{brown:true})},px:40},
  frog:{a:t=>sfx('croak'),h:t=>ev(t,220,160,.12,.1,[500,1200],{trem:30}),d:t=>{ev(t,200,90,.35,.1,[480,1100],{trem:24});fThump(t+.2,VR(300,.1),120,.08,.08)},s:t=>{fThump(t,VR(300,.15),150,.05,.05);fNoise(t,.05,'lowpass',900,1.4,.03,{brown:true})},px:36},
  croc:{a:t=>{fThump(t,VR(180,.1),70,.12,.25);M.bone(t+.02,.8,VR(700,.1))},h:t=>ev(t,120,90,.2,.12,[400,900],{rasp:.6}),d:t=>ev(t,110,60,.6,.12,[380,850],{rasp:.6}),s:t=>fNoise(t,.15,'lowpass',600,1,.05,{brown:true}),px:40},
  wolf:{a:t=>{ev(t,VR(190,.08),240,.28,.14,[700,1500],{rasp:.9,trem:30});fThump(t+.15,VR(320,.1),140,.05,.1)},h:t=>ev(t,520,380,.18,.12,[900,2000],{rasp:.3}),d:t=>ev(t,480,200,.7,.12,[850,1900],{rasp:.2}),s:t=>{fThump(t,VR(260,.1),150,.025,.05);fNoise(t,.02,'bandpass',2400,1.5,.03)},px:22},
  snowspirit:{a:t=>{vBell(null,t,VR(93,.01),.9,.03);fNoise(t,.4,'highpass',5000,.8,.04,{att:.1,rev:.5})},h:t=>M.ice(t,.5),d:null,px:0},
  icesentinel:{a:t=>{M.ice(t,.8);fThump(t,VR(90,.1),50,.3,.2)},h:t=>M.ice(t,.6),d:null,s:t=>{fThump(t,VR(80,.1),40,.18,.18);M.ice(t,.2)},px:40},
  mimic:{a:t=>{M.wood(t,.9,VR(200,.1));ev(t+.05,90,70,.5,.14,[420,900],{rasp:.8})},h:t=>{M.wood(t,.7,VR(260,.1));ev(t,120,90,.2,.1,[420,900],{rasp:.7})},d:null,px:0}};
for(const[k,s] of[['bigslime','slime'],['magmaslime','slime'],['tadpole','slime'],['snail','beetle'],['bonelet','skeleton'],['pyro','imp'],['mushroom','plant'],['eyeflower','plant'],['shadoweye','wisp'],['qmirror','wisp'],['obsidian','golem'],['toad','frog']])VOX[k]=VOX[s];
const EVA={lastV:0,lastS:0};
function enemyAt(e){const d=P?Math.hypot(e.x-P.x,e.y-P.y):0;AU.pan=Math.max(-.7,Math.min(.7,(e.x-(G.vx||0)-VW/2)/200));return Math.max(.3,1-d/520)}
// a sound played softer: for the time of the call the effects go through a gain of k on their way to the effects' bus (farther = softer)
function withVol(k,fn){const real=AU.sfxBus,g=AU.ctx.createGain();g.gain.value=k;g.connect(real);AU.sfxBus=g;try{fn()}finally{AU.sfxBus=real}}
function voxPlay(e,kind){const V=VOX[e.type];if(!V||!V[kind]||!AU.ctx||!AU.on.sfx)return;const now=AU.ctx.currentTime;if(now-EVA.lastV<.11)return;EVA.lastV=now;const k=enemyAt(e);
  try{withVol(k,()=>V[kind](now+.01))}catch(er){}}
// the attack: when it shoots (shootE during its update) or when its state turns into a move (a charge, a leap, a bite)
{const _s=shootE;shootE=function(){const e=typeof N3G!=='undefined'?N3G.cur:null;if(e&&!isBoss(e.type)){const now=G.t||0;if(!e.vxA||now-e.vxA>1.1){e.vxA=now;voxPlay(e,'a')}}return _s.apply(this,arguments)}}
// hurt and steps: watched every frame
{const _u=update;update=function(dt){_u(dt);if(!G||G.state!=='play'||!AU.ctx||!AU.on.sfx)return;try{const now=G.t||0;
  for(const e of G.enemies){if(e.dead||e.spawn>0)continue;const V=VOX[e.type];if(!V)continue;
    if(e.vxH==null)e.vxH=e.hp;else if(e.hp<e.vxH-.5){if(!isBoss(e.type)&&(!e.vxHt||now-e.vxHt>.5)&&Math.random()<.6){e.vxHt=now;voxPlay(e,'h')}e.vxH=e.hp}
    if(e.st&&e.st!==e.vxSt){e.vxSt=e.st;if(!['walk','rest','idle'].includes(e.st)&&!isBoss(e.type)&&(!e.vxA||now-e.vxA>1.1)){e.vxA=now;voxPlay(e,'a')}}
    if(V.s&&V.px){if(e.vxX==null){e.vxX=e.x;e.vxY=e.y;e.vxD=0}const d=Math.hypot(e.x-e.vxX,e.y-e.vxY);e.vxX=e.x;e.vxY=e.y;if(d<20){e.vxD+=d;if(e.vxD>=V.px){e.vxD=0;const ac=AU.ctx.currentTime;if(ac-EVA.lastS>.07&&(!P||Math.hypot(e.x-P.x,e.y-P.y)<300)){EVA.lastS=ac;const k=enemyAt(e);try{withVol(k,()=>V.s(ac+.01))}catch(er){}}}}}}}catch(er){}}}
// the death cry over the material's sound (the bones, the goo and the stone keep theirs)
{const _s=sfx;sfx=function(k,arg,x){const r=_s.apply(this,arguments);if(k==='death'&&arg&&VOX[arg]&&VOX[arg].d&&AU.ctx&&AU.on.sfx){try{const t=AU.ctx.currentTime+.02;withVol(.8,()=>VOX[arg].d(t))}catch(e){}}return r}}
// the zombies on the path behind the campfire groan with the same voice as the ones on the map (far away: soft, with much room in it)
if(typeof sndZGroan==='function'){const _g=sndZGroan;sndZGroan=function(z){if(typeof ZV==='undefined'||!AU.ctx||!AU.on.sfx||$('menu').hidden)return _g.apply(this,arguments);
  try{const K=(typeof ZM!=='undefined'&&ZM.audio&&ZM.audio.KV[z.kind])||{f:[78,112],fm:[[430,940]],rasp:.5,br:.4},f=K.f[0]+(K.f[1]-K.f[0])*Math.random(),t=AU.ctx.currentTime+.02;
    AU.pan=Math.max(-.8,Math.min(.8,(z.x-180)/180*.8));if(!(typeof ZVB!=='undefined'&&ZVB.play(z.kind||'zombie','moan',t,.12,.9+Math.random()*.2,.8)))ZV.voice(t,f,f*VR(.76,.06),VR(1.3,.2),K.fm[Math.floor(Math.random()*K.fm.length)],{vol:.05,att:.3,rasp:K.rasp,breath:K.br,rev:.75,fd:.85});AU.pan=0}catch(e){}}}
