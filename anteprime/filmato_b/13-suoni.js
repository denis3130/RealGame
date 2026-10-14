// ------------------------------------------------------------------ 13 · the sound of the training film
// Made by the code like the first film (the game's instruments, the film's own buses). The story of the sound: the dawn chorus,
// a light tune in D major that starts running with them (frame drum, shaker, plucked bass, flute), the dashes, the clearing, the bow
// creaking, the arrow, the thunk in the straw; the contest with the drums and the heartbeat, the two arrows in slow motion, the split
// (a crack, bells and a choir), a comic trombone for the companion; the pine cones and the dodges; the morning on the log; the title.

// ---------- small instruments
// a bird: a few quick chirps sliding up
function fmBird(at,v,f,n){const c=AU.ctx;n=n||3;for(let i=0;i<n;i++){const t=at+i*(.07+Math.random()*.05),f0=f*(1+Math.random()*.1),o=osc('sine',f0,t,t+.09),g=c.createGain();
  o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f0*(1.35+Math.random()*.3),t+.035);o.frequency.exponentialRampToValueAtTime(f0*.9,t+.07);
  o.connect(g);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.008);g.gain.exponentialRampToValueAtTime(.0005,t+.075);route(g,null,.3)}}
// the wood of the bow bending: a dry creak that climbs
function fmCreak(at,dur,v){const c=AU.ctx,n=noiseSrc(at,dur+.1,false),b=filt('bandpass',300,7),g=c.createGain();n.connect(b);b.connect(g);b.frequency.setValueAtTime(260,at);b.frequency.exponentialRampToValueAtTime(620,at+dur);
  g.gain.setValueAtTime(0,at);for(let t=0;t<dur;t+=.025)g.gain.linearRampToValueAtTime(v*(.25+Math.random()*.75)*Math.min(1,t/.1),at+t);g.gain.linearRampToValueAtTime(0,at+dur);route(g,null,.15);
  for(let t=.05;t<dur;t+=.11+Math.random()*.14)fModal(at+t,VR(420,.2),[1,2.4],[.03,.02],.035*v/.12,.1)}
// an arrow into straw: a soft thump, the straw rustling, a little knock of the shaft
function fmThunk(at,v,low){const p=low?.6:1;fThump(at,180*p,58*p,.14,.55*v,.1);fNoise(at,.22,'lowpass',1300*p,.7,.3*v,{brown:true});fNoise(at+.01,.3,'bandpass',3200*p,.9,.08*v,{att:.02,f2:1800*p});M.wood(at+.005,.4*v,520*p)}
// the second arrow splitting the first: a sharp crack of wood, splinters, a ring
function fmCrack(at,v){M.wood(at,1.3*v,880);fModal(at,2300,[1,2.3,3.8,5.2],[.18,.12,.08,.05],.1*v,.4);fNoise(at,.05,'highpass',3200,.7,.35*v);fNoise(at+.02,.4,'bandpass',2600,1,.08*v,{att:.01,f2:900});
  for(let i=0;i<6;i++)fModal(at+.04+Math.random()*.3,VR(1600,.3),[1,2.2],[.03,.02],.03*v,.3)}
function fmDashW(at,v){whoosh(at,.26,450,2600,.3*v,.12);fNoise(at,.16,'highpass',3800,.7,.06*v,{att:.05});fNoise(at,.05,'lowpass',600,1,.12*v,{brown:true})}
function fmSkid(at,v){fNoise(at,.32,'bandpass',1800,.9,.14*v,{att:.03,f2:520});fNoise(at,.26,'lowpass',500,.8,.12*v,{brown:true,att:.04});for(let i=0;i<4;i++)fNoise(at+.03+Math.random()*.2,.015,'highpass',3500,.7,.04*v)}
function fmCone(at,dur,v){whoosh(at,dur,500,1900,.09*v,.05);fNoise(at,dur,'bandpass',900,1.5,.03*v,{att:dur*.6,f2:2200})}
function fmConeThud(at,v){fThump(at,150,75,.09,.32*v,.05);fNoise(at,.08,'lowpass',900,.8,.15*v,{brown:true});fNoise(at+.03,.05,'bandpass',2400,1.2,.05*v)}
function fmRustle(at,dur,v){for(let t=0;t<dur;t+=.03+Math.random()*.05)fNoise(at+t,.04,'bandpass',VR(2600,.3),1.1,(.03+Math.random()*.04)*v)}
// a quick harp run (up or down)
function harpRun(tr,at,notes,step,v){notes.forEach((m,i)=>vHarp(tr,at+i*step,m,1.4,v))}

// ---------- the cues
function fmCuesB(tr){const Q=[],q=(t,f)=>Q.push([t,f]);const BEAT=60/112,E=BEAT/2;
  // birds, all through the quiet parts
  const birds=(a,b,dens,v)=>{for(let t=a;t<b;t+=dens*(.5+Math.random())){const f=VR(2600,.25),n=2+Math.floor(Math.random()*3),vv=v*(.6+Math.random()*.6);q(t,x=>fmBird(x,vv,f,n))}};
  // --- 1 · dawn: a warm chord, a harp, the first call of the flute, the breeze, the birds
  q(0,a=>{fmWind(a,9,.08);vPad(tr,a,[50,57,62,66],3.6,.09,1300);vBass(tr,a,38,3.2,.12)});
  birds(.15,3.4,.42,.05);birds(8.9,10.6,.5,.04);birds(13.6,15.4,.6,.035);birds(27.7,36.4,.55,.04);
  for(let i=0;i<6;i++){const m=[62,66,69,74,78,74][i];q(.25+i*.27,a=>vHarp(tr,a,m,1.8,.045))}
  q(.45,a=>{vFlute(tr,a,74,.5,.07);vFlute(tr,a+.5,78,.35,.07);vFlute(tr,a+.85,81,.95,.075)});
  // --- 2 · the run: the tune starts running with them (frame drum, shaker, plucked bass, flute), their steps, the two dashes
  const RB=[[38,50],[45,57],[47,59],[43,55]],RC=[[62,66,69],[61,64,69],[59,62,66],[59,62,67]];
  for(let i=0;1.9+i*E<8.85;i++){const t=1.9+i*E,bar=Math.floor(i/8)%4,s=i%8;
    q(t,a=>{dShaker(tr,a,s%2?.035:.06);if(s%2===0)dFrame(tr,a,s===0?.5:.32);if(s===0||s===3||s===6)vBass(tr,a,RB[bar][s===3?1:0],E*1.6,.2);if(s===0)vPad(tr,a,RC[bar],BEAT*4,.06,1600);if(s===4)dTom(tr,a,.18,190)})}
  q(2.97,a=>{const M2=[[74,1],[78,1],[81,2],[79,1],[78,1],[76,2],[74,4]];let x=a;for(const[m,l] of M2){vFlute(tr,x,m,E*l*.95,.075);x+=E*l}});
  q(6.2,a=>{const M2=[[81,1],[83,1],[85,2],[86,4]];let x=a;for(const[m,l] of M2){vFlute(tr,x,m,E*l*.95,.07);x+=E*l}});
  for(let t=1.95;t<8.85;t+=.21){const v=t<3.6?.3+.12*(t-1.95):.5;q(t,a=>fmLeafStep(a,v+Math.random()*.2))}
  q(6.22,a=>{fmDashW(a,1);fmRustle(a,.3,1)});q(7.65,a=>{fmDashW(a,1.1);fmRustle(a,.3,1)});
  // into the light of the clearing: a rising rush and a bright chord
  q(8.45,a=>{fNoise(a,.45,'highpass',2500,.6,.08,{att:.42,f2:7000});whoosh(a,.45,600,3200,.12,.2)});
  q(8.9,a=>{vBell(tr,a,74,2.4,.05);vBell(tr,a,78,2.4,.04);vBell(tr,a,81,2.4,.04);harpRun(tr,a,[62,66,69,74,78,81,86],.045,.05);vPad(tr,a,[50,57,62,66,69],1.8,.08,1800)});
  // --- 3 · the clearing: they skid to a stop; the tune goes light (harp and shaker)
  q(9.45,a=>fmSkid(a,1));q(9.62,a=>fmSkid(a,.9));
  for(let i=0;9.9+i*E<10.6;i++){const t=9.9+i*E;q(t,a=>{dShaker(tr,a,.03);vHarp(tr,a,[62,69,66,69][i%4],.9,.04)})}
  // the draw: the music holds its breath, the bow creaks, an inhale; the twang and the arrow leaving
  q(10.6,a=>{vPad(tr,a,[57,61,64],1.8,.07,900);vBass(tr,a,45,1.7,.1)});q(11,a=>fmCreak(a,1,.11));q(11.55,a=>fmBreath(a,.4,.7,1));
  q(12.3,a=>{twang(a,240,.17);whoosh(a+.015,.18,2400,700,.12);fmBreath(a+.05,.3,.6,0)});
  // the flight, and the centre
  q(12.6,a=>{whoosh(a,.85,900,2600,.09,.15);fNoise(a,.85,'bandpass',1400,1.4,.03,{att:.7,f2:3000})});
  q(13.45,a=>{fmThunk(a,1);vBell(tr,a+.02,81,2.2,.05);vBell(tr,a+.02,86,2.2,.035);harpRun(tr,a+.05,[69,74,78,81],.05,.05);vPad(tr,a,[50,57,62,66],2,.07,1600)});
  // the companion's words: a light pluck under them
  for(let i=0;i<7;i++)q(13.9+i*E*1.2,a=>vHarp(tr,a,[50,57,62,57,55,59,62][i],.5,.05));
  // --- 4 · the contest: the drums grow, the bows creak, the target's rope squeaks; then only the heart and the breath
  q(15.5,a=>{vChoir(tr,a,[59,62,66],2.2,.05);vPad(tr,a,[47,54,59],2.1,.07,700)});
  for(let i=0,t=15.6,iv=.6;t<17.55;i++,t+=iv,iv=Math.max(.2,iv*.86)){const v=.25+i*.05;q(t,a=>dTaiko(tr,a,Math.min(.8,v)))}
  q(16,a=>fmCreak(a,1.4,.09));q(16.15,a=>fmCreak(a,1.3,.08));
  for(const t of[15.7,17.2])q(t,a=>fModal(a,VR(520,.05),[1,1.9],[.12,.08],.025,.2));
  for(const t of[17.7,18.3,18.9])q(t,a=>fmHeart(a,1));q(17.6,a=>{fModal(a,1760,[1,2,3],[1.6,1.2,.8],.012,.5);fNoise(a,1.4,'highpass',5000,.6,.012,{att:1.2})});
  q(18.4,a=>fmBreath(a,.45,.8,1));q(19,a=>fmBreath(a,.3,.9,0));
  // the release in slow motion: two deep twangs, two long low whooshes
  q(19.2,a=>{twang(a,120,.16);whoosh(a+.02,.8,300,900,.11,.3)});q(19.38,a=>{twang(a,135,.17);whoosh(a+.02,.8,320,950,.11,.3)});
  q(19.25,a=>vPad(tr,a,[38,45],1.5,.07,300));
  q(20.25,a=>fmThunk(a,.85,true));
  // the split: a crack, splinters, bells, a big choir chord, the drums; then the comic trombone for the companion
  q(20.7,a=>{fmCrack(a,1);dDrum(tr,a,.8,95,30,1.2,250,.4);dTaiko(tr,a,.9);vChoir(tr,a+.02,[62,66,69,74],2.2,.12);vBrass(tr,a+.02,50,1.6,.12);vBrass(tr,a+.02,57,1.6,.1);
    vBell(tr,a,86,2.8,.06);vBell(tr,a,90,2.8,.04);harpRun(tr,a+.1,[74,78,81,86,90,93],.04,.05);fNoise(a,1.6,'highpass',5200,.6,.05,{att:.005})});
  q(21.45,a=>{const W=[[62,.32],[61,.32],[60,.32],[59,1.1]];let x=a;for(const[m,l] of W){vBrass(tr,x,m-12,l*.95,.1);x+=l+.04}});
  // --- 5 · dodge this! A bouncy beat; the basket, the throws, the cones flying at you, the dashes, the cones hitting the ground
  const DB=60/124,DE=DB/2;
  for(let i=0;23.4+i*DE<28.6;i++){const t=23.4+i*DE,s=i%8,bar=Math.floor(i/8)%2;q(t,a=>{dShaker(tr,a,s%2?.03:.05);if(s===0||s===4)dFrame(tr,a,.4);if(s%2===0)vBass(tr,a,(bar?[43,47,50,47]:[38,45,42,45])[s/2],DE*.8,.18);
    if(s===2||s===6)vBell(tr,a,[78,81][bar],.4,.025)})}
  q(23.5,a=>fmRustle(a,.3,1.2));
  for(const t of B_THROW)q(t,a=>{whoosh(a,.3,700,2200,.16,.05);fNoise(a,.05,'lowpass',500,1,.08,{brown:true})});
  for(let i=0;i<3;i++){const t0=B_CONE[i];q(t0,a=>fmCone(a,.48,1));q(B_DASH[i],a=>{fmDashW(a,1);harpRun(tr,a+.05,[74,78,81],.035,.04)});q(t0+.62,a=>fmConeThud(a,.9))}
  // laughing together: a happy run on the harp and the bells
  q(27.75,a=>{harpRun(tr,a,[62,66,69,74,78,81,86,90],.05,.05);vBell(tr,a+.4,86,1.6,.04);vPad(tr,a,[50,57,62,66],1.6,.07,1600)});
  // --- 6 · the morning on the log: the tune, slow, on the flute; the crypt answers far away with the motif of Mossbound
  q(28.9,a=>{vPad(tr,a,[43,50,55,59],2.8,.08,1100);vBass(tr,a,31,2.6,.13)});q(31.7,a=>{vPad(tr,a,[50,57,62,66],2.9,.08,1100);vBass(tr,a,38,2.7,.13)});
  q(29.3,a=>{const M2=[[74,.6],[76,.6],[78,.9],[81,1.4],[79,.6],[78,.6],[76,.9],[74,1.8]];let x=a;for(const[m,l] of M2){vFlute(tr,x,m,l*.95,.065);x+=l}});
  q(30.4,a=>{vBell(tr,a,69,2.6,.035);vBell(tr,a+.9,74,2.6,.032);vBell(tr,a+1.8,73,3,.035)});
  q(28.9,a=>fmWind(a,7.5,.06));
  // the swell to the title
  q(34.6,a=>{vChoir(tr,a,[62,66,69],2,.07);vPad(tr,a,[50,57,62,66,69],1.95,.09,2000);vBrass(tr,a+.6,62,1.3,.06);vBrass(tr,a+1.2,66,.8,.07)});
  for(let i=0,t=35.2,iv=.4;t<36.5;i++,t+=iv,iv=Math.max(.12,iv*.8))q(t,a=>dTom(tr,a,.15+i*.06,150+i*12));
  q(36.75,a=>{dDrum(tr,a,1,95,26,1.8,300,.6);dTaiko(tr,a,1);vChoir(tr,a,[62,66,69,74],3.4,.15);vBrass(tr,a,50,2.6,.13);vBrass(tr,a,57,2.6,.1);vBrass(tr,a,62,2.6,.08);vBass(tr,a,38,2.6,.3);
    vBell(tr,a,86,3.2,.06);vBell(tr,a,93,3.2,.04);fNoise(a,2.2,'highpass',3200,.6,.1,{att:.005});harpRun(tr,a+.85,[74,78,81,86],.2,.055)});
  return Q.sort((x,y)=>x[0]-y[0])}
AUD.cues=fmCuesB;AUD.silent=[[36.55,36.74]];
