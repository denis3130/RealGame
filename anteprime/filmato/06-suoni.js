// ------------------------------------------------------------------ 06 · the sound of the film
// Everything is made by the code with the game's own audio engine (osc, filt, noiseSrc, fNoise, fThump, fModal, the instruments
// vPad, vChoir, vBell, vBrass, vBass, vHarp and the drums). Every sound is a cue at a second of the film: the cues are scheduled a
// little ahead, at the exact time, on the film's own buses (so Salta can silence them all at once, and the game's music stays out).
// The story of the sound: the night forest (wind, crickets, an owl, steps on the leaves, a mysterious motif), the hum of the
// crypt, drops and fire inside, the magic of the bow, the moss stick falling in slow motion, one second of total silence, the
// scream far away, the heartbeat, the run, the slab, the panting, the stick lit again, the drums of courage, the gate, the dark,
// the eyes, the scream close by, black, the title.

// ---------- small instruments of the film
function fmShaper(k){const n=1024,cur=new Float32Array(n);for(let i=0;i<n;i++){const x=i/(n-1)*2-1;cur[i]=(1+k)*x/(1+k*Math.abs(x))}const w=AU.ctx.createWaveShaper();w.curve=cur;w.oversample='2x';return w}
// a gain with a shape: pts [[dt, value], ...] (linear ramps)
function fmEnv(g,at,pts){g.gain.setValueAtTime(Math.max(.0001,pts[0][1]),at+pts[0][0]);for(let i=1;i<pts.length;i++)g.gain.linearRampToValueAtTime(Math.max(0,pts[i][1]),at+pts[i][0])}
// a long noise (wind, rumble, room tone, fire): filtered, with its own volume shape; sweep moves the filter slowly
function fmNoiseBed(at,dur,brown,type,f,q,pts,rev,sweep){const c=AU.ctx,n=noiseSrc(at,dur+.1,brown),b=filt(type,f,q),g=c.createGain();n.connect(b);b.connect(g);fmEnv(g,at,pts);
  if(sweep)for(let k=0;k<sweep.length;k++)b.frequency.linearRampToValueAtTime(sweep[k][1],at+sweep[k][0]);route(g,null,rev||0);return g}
function fmWind(at,dur,vol){fmNoiseBed(at,dur,true,'lowpass',380,.7,[[0,0],[1.2,vol],[dur-1.6,vol*.85],[dur,0]],.2,[[2,520],[4.5,300],[7,600],[dur,320]]);
  fmNoiseBed(at,dur,false,'bandpass',900,9,[[0,0],[1.5,vol*.11],[dur-1.5,vol*.08],[dur,0]],.4,[[2.5,1300],[5,760],[8,1150],[dur,850]])}
function fmCricket(at,v,f){const c=AU.ctx,o=osc('sine',f,at,at+.3),g=c.createGain();o.connect(g);g.gain.setValueAtTime(0,at);
  for(let i=0;i<3;i++){const t=at+i*.075;g.gain.linearRampToValueAtTime(v,t+.012);g.gain.linearRampToValueAtTime(0,t+.045)}route(g,null,.15)}
function fmOwl(at,v){const c=AU.ctx;for(const[dt,len,f] of[[0,.32,392],[.55,.22,370],[.86,.62,385]]){const t=at+dt,o=osc('sine',f,t,t+len+.1),vb=osc('sine',5.5,t,t+len+.1),vg=c.createGain(),g=c.createGain(),lp=filt('lowpass',900,.5);
    vg.gain.value=5;vb.connect(vg);vg.connect(o.frequency);o.frequency.linearRampToValueAtTime(f*.93,t+len);o.connect(lp);lp.connect(g);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.07);g.gain.exponentialRampToValueAtTime(.0005,t+len);route(g,null,.7)}}
function fmLeafStep(at,v){fNoise(at,.09,'bandpass',VR(2300,.15),1.3,.13*v);fNoise(at+.005,.07,'lowpass',VR(520,.1),.7,.2*v,{brown:true});for(let i=0;i<3;i++)fNoise(at+.015+Math.random()*.05,.012,'highpass',VR(4200,.2),.7,.05*v)}
function fmStoneStep(at,v,rev,pitch){pitch=pitch||1;fThump(at,VR(140,.1)*pitch,70*pitch,.07/Math.sqrt(pitch),.3*v,rev);fNoise(at,.035,'bandpass',VR(1900,.1)*pitch,1.5,.1*v,{rev:rev||0});fNoise(at+.01,.02,'highpass',3500*pitch,.7,.03*v)}
function fmDrip(at,v,f){fModal(at,f||VR(2200,.15),[1,2.4,4.1],[.12,.07,.04],.06*v,.9);fThump(at,VR(900,.1),500,.03,.03*v,.8)}
function fmFire(at,dur,v){fmNoiseBed(at,dur,true,'lowpass',420,.6,[[0,0],[.4,.05*v],[dur-.3,.05*v],[dur,0]],.1);
  for(let t=0;t<dur;t+=.03+Math.random()*.12)fNoise(at+t,.012,'highpass',VR(2600,.3),.8,(.02+Math.random()*.04)*v)}
function fmHum(at,dur,v){const c=AU.ctx;for(const[f,a] of[[55,1],[110,.45],[165,.18]]){const o=osc('sine',f,at,at+dur+.2),tr=osc('sine',.7,at,at+dur+.2),tg=c.createGain(),g=c.createGain(),m=c.createGain();
    tg.gain.value=.35;tr.connect(tg);m.gain.value=.65;tg.connect(m.gain);o.connect(m);m.connect(g);fmEnv(g,at,[[0,0],[dur*.7,v*a],[dur,0]]);route(g,null,.3)}}
function fmBreath(at,dur,v,inhale){if(inhale)fNoise(at,dur,'bandpass',900,.8,.08*v,{att:dur*.85,f2:1500});else fNoise(at,dur,'bandpass',1400,.8,.09*v,{att:.04,f2:650})}
function fmHeart(at,v){const lp=f=>f;fThump(at,68,42,.14,.42*v,.05);fThump(at+.17,58,38,.12,.28*v,.05);fNoise(at,.05,'lowpass',180,.7,.08*v,{brown:true})}
function fmRumble(at,dur,v){fmNoiseBed(at,dur,true,'lowpass',110,.7,[[0,0],[.15,v],[dur*.5,v*.7],[dur,0]],.3);const c=AU.ctx,o=osc('sine',38,at,at+dur+.1),g=c.createGain();o.connect(g);fmEnv(g,at,[[0,0],[.12,v*.6],[dur,0]]);route(g,null,.2)}
function fmDebris(at,dur,n,v){for(let i=0;i<n;i++){const t=at+Math.random()*dur;if(Math.random()<.5)M.stone(t,.25*v);else fModal(t,VR(1700,.3),[1,2.3],[.04,.02],.06*v,.4)}fmNoiseBed(at,dur,false,'highpass',3000,.6,[[0,0],[.2,.04*v],[dur,0]],.3)}
function fmGrind(at,dur,v,f){const c=AU.ctx,n=noiseSrc(at,dur+.1,false),b=filt('bandpass',f||380,1.6),g=c.createGain();n.connect(b);b.connect(g);g.gain.setValueAtTime(0,at);
  for(let t=0;t<dur;t+=.03)g.gain.linearRampToValueAtTime(v*(.35+Math.random()*.65)*Math.min(1,t/.08,(dur-t)/.1),at+t);g.gain.linearRampToValueAtTime(0,at+dur);route(g,null,.4);fmNoiseBed(at,dur,true,'lowpass',160,.7,[[0,0],[.08,v*.8],[dur,0]],.2)}
function fmChains(at,dur,v){for(let t=0;t<dur;t+=.055+Math.random()*.07)M.metal(at+t,.35*v*(.6+Math.random()*.4),VR(1150,.3),.4)}
function fmWhoosh(at,dur,f0,f1,v,rev){whoosh(at,dur,f0,f1,v,rev||.2)}
// the monster's scream: screeching saws through a distortion and three formants, a rough growl under it, breath and hiss.
// far (the first, behind the walls): darker, softer, more echo; close (the second): bright, loud, with a thump in the floor
function fmScream(at,close){const c=AU.ctx,D=close?1.55:1.9,out=c.createGain(),lp=filt('lowpass',close?8000:1300,.7);out.connect(lp);route(lp,null,close?.4:1);
  out.gain.setValueAtTime(.0001,at);out.gain.linearRampToValueAtTime(close?1:.5,at+.08);out.gain.setValueAtTime(close?1:.5,at+D*.5);out.gain.exponentialRampToValueAtTime(.0005,at+D);
  const pre=c.createGain(),sh=fmShaper(close?55:30),mix=c.createGain();pre.gain.value=.55;mix.gain.value=.75;pre.connect(sh);
  for(const[f,q] of[[950,3.5],[1700,4.5],[2900,5]]){const b=filt('bandpass',f,q);sh.connect(b);b.connect(mix)}mix.connect(out);
  const vib=osc('sine',7.3,at,at+D+.1),vg=c.createGain(),jit=osc('sawtooth',13,at,at+D+.1),jg=c.createGain();vg.gain.value=30;jg.gain.value=16;vib.connect(vg);jit.connect(jg);
  for(const[mul,det,a] of[[1,-14,.33],[1,11,.33],[1.5,5,.22],[.5,0,.45]]){const o=osc('sawtooth',380*mul,at,at+D+.1),og=c.createGain();o.detune.value=det;
    o.frequency.setValueAtTime(330*mul,at);o.frequency.exponentialRampToValueAtTime(680*mul,at+.22);o.frequency.exponentialRampToValueAtTime(470*mul,at+D*.65);o.frequency.exponentialRampToValueAtTime(250*mul,at+D);
    vg.connect(o.frequency);jg.connect(o.frequency);og.gain.value=a;o.connect(og);og.connect(pre)}
  // the growl: low saws roughened by a fast tremolo
  const gr=c.createGain(),glp=filt('lowpass',650,1),gsh=fmShaper(18),gOut=c.createGain();gr.gain.value=.5;gOut.gain.value=close?.8:.6;gr.connect(glp);glp.connect(gsh);gsh.connect(gOut);gOut.connect(out);
  const trem=osc('square',27,at,at+D+.1),tg=c.createGain();tg.gain.value=.5;trem.connect(tg);tg.connect(gr.gain);
  for(const f of[74,111]){const o=osc('sawtooth',f,at,at+D+.1);o.frequency.exponentialRampToValueAtTime(f*.8,at+D);o.connect(gr)}
  // the breath of it
  const n=noiseSrc(at,D+.1),nb=filt('bandpass',1300,.7),ng=c.createGain();ng.gain.value=close?.55:.35;n.connect(nb);nb.connect(ng);ng.connect(out);
  const h=noiseSrc(at,D+.1),hb=filt('highpass',3800),hg=c.createGain();hg.gain.value=close?.18:.05;h.connect(hb);hb.connect(hg);hg.connect(out);
  if(close){fThump(at,72,28,.7,.75,.3);fmRumble(at,1.6,.5)}else fmRumble(at+.05,1.8,.35)}
function fmGrowl(at,dur,v){const c=AU.ctx,g=c.createGain(),lp=filt('lowpass',380,1.2),sh=fmShaper(14),am=c.createGain();am.gain.value=.5;
  const tr=osc('sine',19,at,at+dur+.1),tg=c.createGain();tg.gain.value=.5;tr.connect(tg);tg.connect(am.gain);
  for(const f of[48,72,73.5]){const o=osc('sawtooth',f,at,at+dur+.1);o.connect(am)}am.connect(lp);lp.connect(sh);sh.connect(g);fmEnv(g,at,[[0,0],[dur*.4,v],[dur,v*.6]]);g.gain.linearRampToValueAtTime(0,at+dur+.05);route(g,null,.5)}

// ---------- the cues: [second of the film, what to play at that audio time]
// tr = the film's music track (bus + drum bus) for the game's instruments
function fmCues(tr){const Q=[],q=(t,f)=>Q.push([t,f]);
  // --- 1 · the forest
  q(0,a=>{fmWind(a,12.2,.24);vPad(tr,a,[45,52,57],7.5,.11,520)});
  for(let t=.4;t<10;t+=.6+Math.random()*.9){const f=VR(4550,.06),v=.012+Math.random()*.012;q(t,a=>fmCricket(a,v,f))}
  q(1.4,a=>fmOwl(a,.05));
  // the motif of Mossbound: three bells, far away
  q(.6,a=>{vBell(tr,a,69,3,.05);vBell(tr,a+.9,72,3,.045);vBell(tr,a+1.8,71,3.4,.05);vHarp(tr,a+2.9,64,2.2,.03)});
  for(let t=3.05;t<5;t+=.35)q(t,a=>fmLeafStep(a,.55));
  for(let t=5.05;t<6.1;t+=.425)q(t,a=>fmLeafStep(a,.7));
  q(5,a=>{vPad(tr,a,[41,48,53],5,.1,600);vHarp(tr,a+.3,76,1.6,.035);vHarp(tr,a+.7,72,1.6,.03);vHarp(tr,a+1.1,69,2,.03)});
  q(6.3,a=>fNoise(a,.25,'bandpass',1800,.8,.04,{att:.08}));q(6.8,a=>fNoise(a,.22,'bandpass',1700,.8,.04,{att:.08}));
  // --- 2 · the crypt: a green hum grows, a glint of magic, steps on stone into the dark
  q(7,a=>{fmHum(a,5.2,.07);vChoir(tr,a+.3,[57,60,64],4.5,.05);vBell(tr,a+.25,84,2.2,.03)});
  q(8.8,a=>{for(const[i,m] of[[0,64],[1,69],[2,72],[3,76]])vHarp(tr,a+i*.09,m,1.6,.045);vBell(tr,a+.4,88,2,.025)});
  q(10,a=>vPad(tr,a,[43,50,55],2.2,.09,700));
  for(let t=10.05;t<11.7;t+=.275){const v=.5+.4*(t-10)/1.7;q(t,a=>fmStoneStep(a,v,.15+.5*(t-10)/1.7))}
  // --- 3 · inside: drops, the fire, the magic of the bow, the stick falling in slow motion
  q(12,a=>{fmNoiseBed(a,6,true,'lowpass',200,.7,[[0,0],[.5,.06],[5.6,.06],[6,0]],.3);fmFire(a,6,.8);vPad(tr,a,[38,45,50],5,.11,450);
    vChoir(tr,a+.2,[62,65,69],3.6,.05);vBell(tr,a+.3,81,3,.035);vBell(tr,a+.45,84,3,.03);vBell(tr,a+.6,88,3,.025)});
  for(const[t,f] of[[12.4,2300],[13.3,1900],[14.7,2500],[16,2100]])q(t,a=>fmDrip(a,1,f));
  q(14.9,a=>{M.wood(a,.5,420);fModal(a+.02,1300,[1,2.6],[.06,.03],.04,.3)});
  q(15.1,a=>{for(let i=0;i<4;i++)fModal(a+i*.04+Math.random()*.02,VR(1600,.2),[1,2.2],[.04,.02],.035,.2)});
  q(15.3,a=>fNoise(a,.35,'bandpass',520,12,.05,{att:.15,f2:760}));
  q(15,a=>vPad(tr,a,[41,48,53],1.8,.09,500));
  // slow motion: everything drops in pitch, a slow whoosh, the stick ticks on the stone
  q(16.5,a=>{vPad(tr,a,[33,40],1.5,.1,280);fmWhoosh(a+.05,.9,900,240,.07,.4)});
  q(17.36,a=>{fModal(a,1100,[1,2.4,4],[.18,.1,.06],.08,.6);fThump(a,160,70,.12,.12,.4);fNoise(a+.02,.4,'highpass',2600,.8,.03,{att:.05,f2:5200})});
  q(17.9,a=>fModal(a,1000,[1,2.4],[.12,.06],.04,.5));
  // --- 4 · one second of nothing at all, then the scream far away; the crypt shakes, the heart starts pounding
  q(19.05,a=>{fmScream(a,false);fmDebris(a+.2,1.6,14,.8);fNoise(a+.1,.6,'bandpass',600,.7,.06,{att:.2})});
  q(19.15,a=>{dDrum(tr,a,.8,90,30,1.2,250,.4);vChoir(tr,a+.2,[45,46,52],3,.06);vPad(tr,a+.2,[33,34],3.2,.1,260)});
  for(let t=20.5,iv=.72;t<27.25;t+=iv,iv=Math.max(.5,iv-.02)){const v=t<24?.9:1;q(t,a=>fmHeart(a,v))}
  q(20.5,a=>{vPad(tr,a,[33,40,44],1.8,.1,380);fNoise(a,1.5,'highpass',2400,.7,.05,{att:1.45,f2:6000})});
  // --- 5 · the run, the slab, the panting
  for(let t=22.02;t<23.95;t+=.17)q(t,a=>fmStoneStep(a,1,.3,1.15));
  q(22,a=>{for(let i=0;i<10;i++)dTom(tr,a+i*.17,.12+i*.02,150+i*6);vPad(tr,a,[38,45],1.9,.08,500)});
  q(23.72,a=>{fmChains(a,.2,.8);fmGrind(a+.02,.22,.6,300)});
  q(23.95,a=>{fThump(a,90,26,1.4,1,.5);M.stone(a,1.6);M.stone(a+.03,1.2);fmNoiseBed(a,1,true,'lowpass',320,.7,[[0,.6],[1,0]],.8);fmDebris(a+.1,1.4,16,.9);fmWhoosh(a+.05,.9,600,200,.12,.5)});
  q(24.55,a=>{fmGrind(a,.8,.18,420);for(let i=0;i<6;i++)fNoise(a+i*.15,.06,'bandpass',VR(1500,.2),1.2,.06)});
  for(const t of[25.53,25.93])q(t,a=>{fThump(a,140,55,.14,.5,.3);M.stone(a,.7);fmDebris(a+.03,.4,3,.5)});
  q(24.5,a=>vPad(tr,a,[33,40],2.6,.08,260));
  for(const[t,inh] of[[26.25,1],[26.45,0],[26.7,1],[26.9,0],[27.15,1],[27.8,0],[28.6,1]])q(t,a=>fmBreath(a,inh?.35:.4,inh?.9:1,inh));
  // --- 6 · the stick lit again, the bow drawn, the drums of courage
  q(28.62,a=>{fModal(a,2600,[1,2.3],[.03,.02],.04,.2);fNoise(a,.05,'highpass',3000,.7,.03)});
  q(28.92,a=>{fNoise(a,.5,'bandpass',300,.9,.12,{att:.06,f2:900});for(let i=0;i<8;i++)fNoise(a+.05+Math.random()*.5,.012,'highpass',3000,.8,.04);
    vPad(tr,a,[45,52,57,61],3,.11,900);vHarp(tr,a+.12,69,1.8,.05);vHarp(tr,a+.36,73,1.8,.05);vHarp(tr,a+.6,76,2.2,.055)});
  q(29.25,a=>fmBreath(a,.6,.8,0));
  q(29.68,a=>{fModal(a,1700,[1,2.5],[.05,.03],.05,.2);fNoise(a+.1,1.25,'bandpass',900,22,.12,{att:1.1,f2:1500});fNoise(a+.1,1.25,'bandpass',420,8,.05,{att:1,f2:620})});
  q(29.5,a=>vChoir(tr,a,[57,61,64],3.6,.09));
  for(const[t,v] of[[29.62,.45],[30.02,.5],[30.37,.55],[30.66,.62],[30.86,.7]])q(t,a=>dTaiko(tr,a,v));
  // the slow steps of the hero become the drums
  for(const t of[31,31.575,32.15,32.725,33.3,33.875,34.45])q(t,a=>{dTaiko(tr,a,1);dDrum(tr,a,.6,70,34,.8,200,.3)});
  q(31,a=>{vBrass(tr,a,57,.5,.12);vBrass(tr,a+.575,61,.5,.12);vBrass(tr,a+1.15,64,.5,.12);vBrass(tr,a+1.725,69,1.6,.13);vBass(tr,a,33,1.1,.24);vBass(tr,a+1.15,40,1.1,.24);vChoir(tr,a,[57,61,64],3.2,.1)});
  for(const t of[31,31.575,32.15])q(t,a=>fmStoneStep(a,.9,.4,.7));
  for(const t of[32.05,32.5,32.95])q(t,a=>fmStoneStep(a,.7,.35,1));
  // --- 7 · the gate, the dark, the eyes, the scream close by
  q(33.05,a=>{fmChains(a,1.35,.9);fmGrind(a,1.4,.35,260);fmRumble(a,1.4,.25);fmDebris(a+.1,1.2,10,.6);vBrass(tr,a,52,1.6,.08);vBrass(tr,a,57,1.6,.07)});
  q(34.5,a=>{fmNoiseBed(a,4,true,'lowpass',260,.7,[[0,0],[.6,.08],[3.6,.08],[4,0]],.5,[[1.5,360],[3,220]]);fmFire(a,4,.5);vPad(tr,a,[33],1.8,.09,220)});
  for(const t of[34.6,35.05,35.5])q(t,a=>fmStoneStep(a,.55,.7,.95));
  q(36.35,a=>{fThump(a,62,28,.9,.7,.6);dDrum(tr,a,.7,60,28,1.4,180,.3);vChoir(tr,a+.05,[45,48,51],2,.09);vBell(tr,a+.05,58,2.4,.04);fNoise(a-.5,.55,'highpass',1800,.7,.04,{att:.5,f2:5000})});
  q(36.8,a=>fmGrowl(a,.7,.25));
  q(37.15,a=>fNoise(a,.38,'bandpass',420,.9,.18,{att:.34,f2:900}));
  q(37.1,a=>{for(let i=0;i<16;i++){const k=i/16;dTom(tr,a+1.38*(1-Math.pow(1-k,1.6)),.2+k*.5,120+k*80)}});
  q(37.55,a=>{fmScream(a,true);fmWhoosh(a+.05,.8,1800,300,.16,.3);fmDebris(a+.15,.8,10,.9)});
  // --- black, then the title
  q(38.75,a=>{dDrum(tr,a,1,95,26,1.8,300,.6);dTaiko(tr,a,1);vChoir(tr,a,[57,61,64,69],3.4,.16);vBrass(tr,a,45,2.6,.13);vBrass(tr,a,52,2.6,.1);vBrass(tr,a,57,2.6,.08);vBass(tr,a,33,2.6,.3);
    vBell(tr,a,81,3.2,.06);vBell(tr,a,88,3.2,.04);fNoise(a,2.2,'highpass',3200,.6,.1,{att:.005});
    vHarp(tr,a+.85,69,1.6,.05);vHarp(tr,a+1.05,73,1.6,.05);vHarp(tr,a+1.25,76,1.6,.05);vHarp(tr,a+1.45,81,2.4,.06)});
  return Q.sort((x,y)=>x[0]-y[0])}
// the moments when the film is silent on purpose: [from, to] (the buses are pulled down and back up)
const FM_SILENT=[[18,19.04],[38.5,38.74]];

// AUD.cues and AUD.silent: another film (the training film B) gives its own cues and silences; without them, this film's
const AUD={on:false,a0:0,i:0,Q:null,B:null,cues:null,silent:null,
  // the film has its own echo and its own delay, so a silence (or Salta) cuts the tails too
  buses(){const c=AU.ctx,B={};B.out=c.createGain();B.out.connect(AU.master);B.sfx=c.createGain();B.sfx.connect(B.out);B.mus=c.createGain();B.mus.connect(B.out);B.drum=c.createGain();B.drum.gain.value=1;B.drum.connect(B.mus);
    if(!this.imp||this.impCtx!==c){this.imp=mkImpulse(c,3,2.4);this.impCtx=c}B.conv=c.createConvolver();B.conv.buffer=this.imp;const cg=c.createGain();cg.gain.value=.6;B.conv.connect(cg);cg.connect(B.out);B.cg=cg;
    B.rev=c.createGain();B.rev.connect(B.conv);B.mrev=c.createGain();B.mrev.connect(B.conv);
    B.dly=c.createDelay(1.5);B.dly.delayTime.value=.47;const fb=c.createGain(),dl=c.createBiquadFilter(),dOut=c.createGain();fb.gain.value=.34;dl.type='lowpass';dl.frequency.value=2400;dOut.gain.value=.4;
    B.dly.connect(dl);dl.connect(fb);fb.connect(B.dly);dl.connect(dOut);dOut.connect(B.mus);B.dl=[fb,dl,dOut];
    const now=c.currentTime,sv=AU.on.sfx?.85*VOLS():0,mv=AU.on.music?.6*VOLM():0;B.sfx.gain.value=sv;B.rev.gain.value=AU.on.sfx?1:0;B.mus.gain.value=mv;B.mrev.gain.value=AU.on.music?1:0;B.sv=sv;B.mv=mv;return B},
  start(){if(!AU.ctx)return;const c=AU.ctx;if(c.state==='suspended')c.resume();
    // the game's own music goes quiet while the film plays
    if(AU.cur){const o=AU.cur;o.bus.gain.setTargetAtTime(0,c.currentTime,.2);setTimeout(()=>{try{o.bus.disconnect()}catch(e){}},2000);AU.cur=null}
    this.stop(true);this.B=this.buses();this.tr={bus:this.B.mus,drum:this.B.drum};this.Q=(this.cues||fmCues)(this.tr);const from=FM.from||0;this.a0=c.currentTime+.12-from;this.i=0;
    while(this.i<this.Q.length&&this.Q[this.i][0]<from-.02)this.i++;this.silences(from);this.on=true},
  // pull the film's output down for the silences (echoes included), from the film time `from` on
  silences(from){const g=this.B.out,now=AU.ctx.currentTime;for(const[a,b] of(this.silent||FM_SILENT)){if(b<from)continue;const ta=this.a0+a,tb=this.a0+b;
      g.gain.setValueAtTime(1,Math.max(now,ta-.04));g.gain.linearRampToValueAtTime(0,Math.max(now,ta));g.gain.setValueAtTime(0,Math.max(now,tb-.01));g.gain.linearRampToValueAtTime(1,Math.max(now,tb))}},
  tick(t){if(!this.on||!AU.ctx)return;const c=AU.ctx;if(c.state!=='running')return;
    // keep the sound on the picture: if they drift apart (the tab slept), the sound follows the picture
    const want=c.currentTime-t;if(Math.abs(want-this.a0)>.25){this.a0=want;while(this.i<this.Q.length&&this.Q[this.i][0]<t-.02)this.i++}
    const sb=AU.sfxBus,sr=AU.sRev,mr=AU.mRev,dl=AU.dly,pan=AU.pan;AU.sfxBus=this.B.sfx;AU.sRev=this.B.rev;AU.mRev=this.B.mrev;AU.dly=this.B.dly;AU.pan=0;
    try{while(this.i<this.Q.length&&this.Q[this.i][0]<t+.3){const[ct,fn]=this.Q[this.i++];try{fn(Math.max(c.currentTime+.005,this.a0+ct))}catch(e){console.error(e)}}}
    finally{AU.sfxBus=sb;AU.sRev=sr;AU.mRev=mr;AU.dly=dl;AU.pan=pan}},
  stop(quick){this.on=false;const B=this.B;if(!B||!AU.ctx)return;const c=AU.ctx,now=c.currentTime;B.out.gain.cancelScheduledValues(now);B.out.gain.setTargetAtTime(0,now,quick?.02:.12);
    setTimeout(()=>{for(const g of[B.out,B.sfx,B.mus,B.drum,B.rev,B.mrev,B.conv,B.cg,B.dly,...B.dl])try{g.disconnect()}catch(e){}},1500);this.B=null}};
