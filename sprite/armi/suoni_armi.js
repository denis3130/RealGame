// I suoni delle armi della modalità zombie, rifatti (Denis, 14 ottobre: «poi l'audio delle medesime armi»). Sempre fatti col codice, ma
// preparati una volta sola: ogni arma ha il suo «banco» (tre spari un po' diversi, la coda dell'eco per le raffiche, i rumori della
// ricarica uno per uno, la presa, il colpo a vuoto), suonato fuori tempo reale (OfflineAudioContext) la prima volta che l'arma serve; poi
// ogni suono è un solo nastro che riparte (tre nodi invece di quindici: con le armi automatiche il telefono respira).
// Lo sparo è fatto a strati, come nei giochi: lo schiocco dell'aria, lo scoppio della polvere (ruvido, saturato), il pugno (un tono che
// scende, reso ruvido perché anche le casse del telefono lo suonino: sotto i 150 Hz non suonano), il rombo profondo per le cuffie, la coda
// nel camposanto e l'eco che torna dai muri e dagli alberi, poi la meccanica dell'arma (carrello, otturatore, nastro, cilindro).
// La ricarica suona a tempo con la mossa (sprite/armi/disegno_armi.js manda un evento a ogni momento di ARMI.RLT): il caricatore che si
// sgancia, la mano alla cintura, quello nuovo che entra e scatta, il carrello indietro e avanti; il revolver che si apre, l'estrattore e i
// sei bossoli, i colpi uno a uno, lo scatto quando si chiude e il cilindro che gira; le cartucce, la pompa; il razzo che scorre nel tubo.
// Il lanciafiamme è un ruggito continuo finché spara (ARMI.fiamma, come ARMI.motore per le canne della mitragliatrice).
// Va dopo disegno_armi.js (usa AU, route, VR del gioco). Se il banco non è ancora pronto (i primi istanti) gli stessi suoni si fanno dal
// vivo; se il telefono non sa preparare i banchi resta il dal vivo.
(()=>{if(typeof ARMI==='undefined')return;
const SR=32000,RV_S=1.2,OAC=()=>window.OfflineAudioContext||window.webkitOfflineAudioContext;
const rnd=(v,p)=>v*(1+(Math.random()*2-1)*p);
// ------------------------------------------------------------------ the kit: the same layers on any context (the offline one that
// prepares the banks, or the game's own when it plays live). out: where it all goes; live: the room is the game's reverb
function kit(c,out,live){const nb={},cv={};
  const noiseB=k=>{if(nb[k])return nb[k];if(live&&typeof AU!=='undefined'&&AU.white)return nb[k]=k==='b'?AU.brown:AU.white;
    const n=Math.floor(c.sampleRate*1.6),b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);let l=0;for(let i=0;i<n;i++){const w=Math.random()*2-1;if(k==='b'){l=(l+.02*w)/1.02;d[i]=l*3.5}else d[i]=w}return nb[k]=b};
  const shaper=k=>{const s=c.createWaveShaper(),key=Math.round(k*10);if(!cv[key]){const n=1024,a=new Float32Array(n),th=Math.tanh(k);for(let i=0;i<n;i++){const x=i/(n-1)*2-1;a[i]=Math.tanh(x*k)/th}cv[key]=a}s.curve=cv[key];return s};
  // the graveyard at night, in the open: three slaps off the walls of the houses and the trees, then a soft dark tail
  let rv=null;const room=()=>{if(rv)return rv;rv=c.createGain();
    if(live){rv.connect(AU.sRev);return rv}
    const conv=c.createConvolver(),n=Math.floor(c.sampleRate*RV_S),ir=c.createBuffer(2,n,c.sampleRate);
    for(let ch=0;ch<2;ch++){const d=ir.getChannelData(ch);let lp=0;for(let i=0;i<n;i++){const tt=i/c.sampleRate,w=Math.random()*2-1;lp+=(w-lp)*(.42-.36*Math.min(1,tt/1.3));d[i]=lp*Math.pow(1-i/n,2.4)*.5*Math.min(1,tt/.02)}
      for(const[tt,a] of[[.052,.55],[.123,.4],[.21,.26],[.34,.14]]){const j=Math.floor((tt+ch*.006)*c.sampleRate);for(let q=0;q<260&&j+q<n;q++)d[j+q]+=(Math.random()*2-1)*a*Math.exp(-q/70)}}
    conv.buffer=ir;rv.connect(conv);conv.connect(out);return rv};
  const env=(g,t,a,v,dur)=>{g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(Math.max(.0002,v*.0006),t+Math.max(a+.004,dur))};
  const send=(node,o)=>{node.connect(out);if(o.rev){const s=c.createGain();s.gain.value=o.rev;node.connect(s);s.connect(room())}};
  const K={c,
    // filtered noise: type, f (to f2), q; o.drive: made rough; o.lp: a lowpass after; o.brown; o.att; o.rev
    noise(t,dur,type,f,q,vol,o){o=o||{};if(vol<=0)return;const s=c.createBufferSource();s.buffer=noiseB(o.brown?'b':'w');s.loop=true;s.start(t,Math.random()*1.3);s.stop(t+dur+.05);
      const b=c.createBiquadFilter();b.type=type;b.frequency.setValueAtTime(f,t);if(q)b.Q.value=q;if(o.f2)b.frequency.exponentialRampToValueAtTime(o.f2,t+dur*(o.sw||1));s.connect(b);let n=b;
      if(o.drive){const pre=c.createGain();pre.gain.value=o.pre||2;n.connect(pre);const sh=shaper(o.drive);pre.connect(sh);n=sh}
      if(o.lp){const l=c.createBiquadFilter();l.type='lowpass';l.frequency.value=o.lp;n.connect(l);n=l}
      const g=c.createGain();env(g,t,o.att||.0008,vol,dur);n.connect(g);send(g,o)},
    // a tone from f0 to f1 (in sw of the time); o.drive: made rough (its harmonics sound on small speakers); o.lp
    tone(t,wave,f0,f1,dur,vol,o){o=o||{};if(vol<=0)return;const s=c.createOscillator();s.type=wave;s.frequency.setValueAtTime(f0,t);if(f1&&f1!==f0)s.frequency.exponentialRampToValueAtTime(f1,t+dur*(o.sw||.7));s.start(t);s.stop(t+dur+.05);
      let n=s;if(o.drive){const pre=c.createGain();pre.gain.value=o.pre||1.6;n.connect(pre);const sh=shaper(o.drive);pre.connect(sh);n=sh}
      if(o.lp){const l=c.createBiquadFilter();l.type='lowpass';l.frequency.value=o.lp;n.connect(l);n=l}
      const g=c.createGain();env(g,t,o.att||.0015,vol,dur);n.connect(g);send(g,o)},
    // a struck piece of metal, wood or glass: partials not quite in tune that ring and die
    modal(t,f,ratios,decs,vol,o){o=o||{};if(vol<=0)return;const g=c.createGain();g.gain.value=vol;send(g,o);
      ratios.forEach((r,i)=>{if(f*r>c.sampleRate*.45)return;const d=decs[Math.min(i,decs.length-1)],s=c.createOscillator();s.frequency.value=f*r;s.start(t);s.stop(t+d+.05);const gg=c.createGain();env(gg,t,.0012,1/(1+i*.6),d);s.connect(gg);gg.connect(g)})}};
  return K}

// ------------------------------------------------------------------ the layers
// a shot (p: the gun's numbers, see SHOT): cr the crack of the air, bk the bark of the powder (saturated noise), pu the punch, bo the deep
// boom, ta the tail in the night, ec the echoes off the walls
function shot(K,t,p){const v=(k,d)=>p[k]==null?d:p[k];
  K.noise(t,v('crD',.022),'bandpass',rnd(p.cr,.06),.8,p.crV,{att:.0004});K.noise(t,.007,'highpass',6200,.7,p.crV*.55,{att:.0002});
  K.noise(t,p.bkD,'bandpass',rnd(p.bk,.07),v('bkQ',.75),p.bkV,{f2:p.bk*v('bkF',.45),att:.0008,drive:v('drv',3),pre:2.4,lp:v('bkLp',4200),rev:.12});
  K.tone(t,'triangle',rnd(p.pu,.05),p.pu2,p.puD,p.puV,{drive:v('pdrv',3.2),pre:2,lp:2000,sw:.55});
  if(p.boV)K.tone(t,'sine',rnd(p.bo,.05),p.bo2||32,p.boD,p.boV,{sw:.6});
  if(p.taV)K.noise(t+.012,p.taD,'lowpass',rnd(1000,.1),.7,p.taV,{brown:true,f2:180,att:.014,rev:1.1});
  if(p.ecV)for(const[d,a] of p.ec||[[.2,1],[.41,.45]])K.noise(t+rnd(d,.08),.13,'lowpass',rnd(1300,.1),.7,p.ecV*a,{brown:true,f2:380,att:.004,rev:.7})}
// a click of steel (f: how high, v: how loud), the slide or the bolt hitting home
const click=(K,t,f,v,len)=>{K.modal(t,rnd(f,.04),[1,2.62,5.1],[.045*(len||1),.03*(len||1),.018],v);K.noise(t,.012,'highpass',4200,.7,v*.6,{att:.0003})};
const clack=(K,t,f,v,len)=>{K.modal(t,rnd(f,.04),[1,2.4,4.9,7.1],[.085*(len||1),.055*(len||1),.03,.02],v);K.tone(t,'triangle',f*.13,f*.06,.05,v*1.2,{drive:2.6,lp:2600});K.noise(t,.018,'highpass',4000,.7,v*.7,{att:.0003})};
const scrape=(K,t,f0,f1,d,v)=>K.noise(t,d,'bandpass',rnd(f0,.08),1.6,v,{f2:f1,att:d*.3});
const rustle=(K,t,v)=>{K.noise(t,.15,'bandpass',rnd(2300,.15),.9,v,{att:.04});K.noise(t+.05,.11,'lowpass',rnd(650,.15),.8,v*1.2,{brown:true,att:.02})};
const thud=(K,t,f,v,d)=>K.tone(t,'triangle',f,f*.45,d||.08,v,{drive:2.4,lp:1500});
// what each gun sounds like (the numbers to tune by ear): see shot()
const SHOT={
  pistola:{cr:3400,crV:.5,bk:1300,bkD:.075,bkV:.95,pu:265,pu2:80,puD:.075,puV:.75,bo:95,bo2:45,boD:.15,boV:.32,taD:.55,taV:.12,ecV:.09,peak:.62,mech:(K,t)=>click(K,t+.034,2300,.11)},
  revolver:{cr:2600,crV:.7,bk:900,bkD:.15,bkV:1.05,drv:3.6,pu:200,pu2:60,puD:.13,puV:.95,bo:76,bo2:33,boD:.38,boV:.7,taD:1,taV:.22,ecV:.16,ec:[[.22,1],[.47,.5],[.8,.2]],peak:.72,
    mech:(K,t)=>{K.modal(t+.004,rnd(1500,.04),[1,2.76,5.4],[.5,.3,.15],.045);click(K,t+.27,2900,.05)}},
  mitraglietta:{cr:4300,crV:.45,bk:1750,bkD:.05,bkV:.72,drv:2.6,pu:305,pu2:95,puD:.045,puV:.5,taD:.17,taV:.04,peak:.48,mech:(K,t)=>click(K,t+.022,3100,.07,.7)},
  mitra:{cr:3600,crV:.55,bk:1250,bkD:.08,bkV:.92,pu:232,pu2:70,puD:.07,puV:.72,bo:86,bo2:42,boD:.12,boV:.28,taD:.3,taV:.07,ecV:.05,peak:.58,mech:(K,t)=>click(K,t+.03,1900,.08,.8)},
  mitragliatrice:{cr:3000,crV:.5,bk:1000,bkD:.09,bkV:1,drv:3.6,pu:182,pu2:58,puD:.09,puV:.9,bo:72,bo2:36,boD:.17,boV:.42,taD:.25,taV:.06,peak:.6,
    mech:(K,t)=>{click(K,t+.026,2600,.05,.6);click(K,t+.05,3150,.04,.5)}},
  pompa:{cr:2200,crV:.6,bk:700,bkQ:.7,bkF:.5,bkD:.23,bkV:1.25,drv:3.6,bkLp:3200,pu:152,pu2:48,puD:.16,puV:1,bo:66,bo2:30,boD:.46,boV:.8,taD:1.1,taV:.26,ecV:.2,ec:[[.24,1],[.52,.5],[.86,.22]],peak:.72},
  tattica:{cr:2600,crV:.6,bk:860,bkQ:.7,bkD:.19,bkV:1.15,drv:3.5,bkLp:3600,pu:172,pu2:52,puD:.14,puV:.95,bo:70,bo2:32,boD:.38,boV:.7,taD:.85,taV:.22,ecV:.16,peak:.68},
  tamburo:{cr:4000,crV:.45,bk:1500,bkD:.06,bkV:.76,drv:2.8,pu:282,pu2:85,puD:.05,puV:.56,taD:.2,taV:.045,peak:.5,mech:(K,t)=>{click(K,t+.022,2700,.06,.7);K.modal(t+.03,rnd(1100,.05),[1,2.3],[.05,.03],.03)}}};
// what makes each gun different in its reload: pitch (p: the steel), weight (v), and the kind of magazine
const RW={pistola:{p:1.15,v:.8},mitraglietta:{p:1.05,v:.85},mitra:{p:.9,v:1},mitragliatrice:{p:.62,v:1.25,box:1},tamburo:{p:.75,v:1.1,drum:1},lanciafiamme:{p:.5,v:1.1,tank:1},
  vapore:{p:.8,v:.9,steam:1},risonatore:{p:1,v:.8,glass:1}};
// the moments of a magazine reload (ARMI.RLT.mag): the release, the hand at the belt, the new one going home, the slide back and forward
const RL={
  out:(K,t,w)=>{if(w.glass){K.modal(t,rnd(2800,.04),[1,2.32,4.25],[.4,.25,.14],.07);return}if(w.tank){K.noise(t,.18,'highpass',3200,.7,.07,{att:.01,f2:5000});click(K,t+.05,1500*w.p,.12)}
    else{click(K,t,2700*w.p,.14*w.v);scrape(K,t+.015,1500*w.p,800*w.p,.09,.09*w.v)}},
  pouch:(K,t,w)=>rustle(K,t,.05),
  seat:(K,t,w)=>{if(w.glass){K.tone(t,'sine',110,165,.55,.16,{att:.08,sw:.8});K.modal(t+.02,rnd(2200,.04),[1,2.32,4.25],[.3,.2,.1],.05);return}
    if(w.tank){K.modal(t+.04,rnd(330,.05),[1,2.1,3.3],[.32,.2,.1],.16);thud(K,t+.04,165,.32,.1);return}
    scrape(K,t,1200*w.p,2100*w.p,.05,.09*w.v);clack(K,t+.05,1800*w.p,.17*w.v,w.box||w.drum?1.4:1);if(w.box||w.drum)thud(K,t+.05,150,.34*w.v,.11)},
  rack:(K,t,w)=>{if(w.glass){scrape(K,t,900,1400,.14,.05);return}if(w.tank||w.steam){K.noise(t,.22,'bandpass',rnd(1500,.1),9,.06,{f2:2300,att:.03});return}
    if(w.box){for(let i=0;i<6;i++)click(K,t+i*.022,3000+Math.random()*700,.035,.5);return}
    scrape(K,t,2600*w.p,1500*w.p,.06,.1*w.v);click(K,t+.055,2100*w.p,.13*w.v)},
  fwd:(K,t,w)=>{if(w.glass){[523,659,784].forEach((f,i)=>K.modal(t+i*.06,f*2,[1,2.32,4.25],[.6,.35,.2],.05));K.noise(t,.5,'highpass',5000,.7,.03,{att:.2});return}
    if(w.tank){K.noise(t,.5,'highpass',2800,.7,.08,{att:.3,f2:5200});K.noise(t+.42,.16,'lowpass',420,.8,.18,{brown:true,att:.02});return}
    if(w.steam){K.noise(t,.6,'highpass',3000,.7,.08,{att:.35,f2:6200});click(K,t+.5,3400,.06);return}
    clack(K,t,2400*w.p,.26*w.v,w.box?1.5:1);if(w.box||w.drum)thud(K,t,180,.3*w.v,.09)}};
// the revolver, the shotguns, the rocket
const RV={open:K=>{click(K,0,3100,.09);scrape(K,.02,2100,1200,.13,.05);click(K,.13,2400,.06)},
  eject:K=>{scrape(K,0,1700,1100,.06,.07);for(let i=0;i<6;i++)K.modal(.03+Math.random()*.09,rnd(4300,.12),[1,2.42,3.98],[.06,.04,.03],.03)},
  round:K=>{click(K,0,rnd(3500,.06),.06,.6);K.noise(0,.03,'bandpass',2600,1.2,.03,{att:.004})},
  shut:K=>clack(K,0,2600,.22,.9),
  spin:K=>{let t=0;for(let i=0;i<8;i++){click(K,t,3800+i*40,.05*(1-i/10),.4);t+=.028+i*.007}}};
const SG={cartuccia:K=>{scrape(K,0,1100,1700,.07,.12);click(K,.06,1500,.13,.8);thud(K,.06,230,.16,.05)},
  pompa:(K,id)=>{const f=id==='tattica',dt=(ARMI.DATI[id].pump||.3)*.55;scrape(K,0,f?2000:1700,f?1200:950,.08,.15);click(K,.012,f?1300:900,.2,1.1);if(!f)K.modal(.012,rnd(300,.05),[1,2.57,4.1],[.12,.06,.04],.14);
    clack(K,dt,f?1500:1150,.32,1.2);thud(K,dt,f?260:220,.34,.07);if(!f)K.modal(dt,rnd(340,.05),[1,2.57],[.1,.05],.12)}};
const RZ={pouch:K=>rustle(K,0,.06),in:K=>{scrape(K,0,600,1300,.48,.12);for(let i=0;i<5;i++)click(K,.06+i*.08,1400+Math.random()*400,.025,.5)},lock:K=>{thud(K,0,150,.34,.12);clack(K,.01,1200,.2,1.2)}};
// taking the gun up, and the gesture that arms it; the empty click
const EQ={estrai:(K,w)=>{K.noise(0,.24,'bandpass',rnd(1100,.1),.9,.07,{f2:2600,att:.08});rustle(K,.04,.04);thud(K,.16,420*(w.p||1),.08,.035)},
  armata:(K,id,w)=>{if(id==='pompa'||id==='tattica')return SG.pompa(K,id);if(id==='revolver')return RV.spin(K);
    if(id==='lanciarazzi')return RZ.lock(K);if(id==='mitragliatrice'){K.tone(0,'sawtooth',90,420,.55,.05,{lp:2200,att:.12,sw:.8});return clack(K,.02,800,.14,1.4)}
    if(w.tank){K.noise(0,.14,'lowpass',380,.8,.2,{brown:true,att:.02});K.noise(.05,.4,'highpass',3000,.7,.05,{att:.1});return}
    if(w.steam){K.noise(0,.45,'highpass',3000,.7,.08,{att:.15,f2:6000});return}
    if(w.glass){[523,784].forEach((f,i)=>K.modal(i*.07,f*2,[1,2.32,4.25],[.5,.3,.15],.05));return}
    RL.rack(K,0,w);RL.fwd(K,.1,w)},
  vuoto:(K,w)=>{click(K,0,2600*(w.p||1),.13,.7);thud(K,0,300,.1,.02)}};
// the others: the rocket, the flamethrower (only a soft puff: its roar is ARMI.fiamma), the steam rifle, the resonator, the blast
const OTHER={
  lanciarazzi:(K,t)=>{thud(K,t,140,.8,.2);K.tone(t,'sine',80,40,.3,.6,{sw:.6});K.noise(t,.42,'bandpass',500,1.1,.7,{f2:3200,att:.02});
    K.noise(t,.5,'lowpass',1800,.8,.9,{f2:400,drive:2.4,pre:2,rev:.3});K.noise(t+.05,1.1,'highpass',2800,.7,.2,{f2:6200,att:.05});K.noise(t+.02,.9,'lowpass',900,.7,.18,{brown:true,f2:200,att:.02,rev:1})},
  lanciafiamme:(K,t)=>{K.noise(t,.13,'bandpass',rnd(650,.2),.7,.2,{brown:true,f2:rnd(380,.2)})},
  vapore:(K,t)=>{K.noise(t,.5,'highpass',2400,.7,.42,{f2:5600,att:.004});K.tone(t,'triangle',172,55,.16,.85,{drive:3,pre:2,lp:1800,sw:.55});
    K.modal(t+.005,rnd(620,.05),[1,2.76,5.4],[.4,.25,.12],.18);K.noise(t,.08,'bandpass',900,.9,.5,{drive:2.5,att:.001});K.noise(t+.1,.55,'bandpass',4200,6,.06,{f2:2200,att:.08});K.noise(t+.01,.5,'lowpass',900,.7,.1,{brown:true,f2:200,att:.02,rev:1})},
  risonatore:(K,t)=>{K.tone(t,'triangle',92,34,.5,.95,{drive:1.6,lp:900,sw:.6});K.tone(t,'sine',330,330,2,.2,{att:.004});K.modal(t,660,[1,2.4,3.9],[1.6,1,.6],.1);
    K.noise(t,.6,'bandpass',260,1.1,.35,{f2:4200,att:.2});K.noise(t,.8,'highpass',5000,.7,.08,{att:.05});for(const f of[196,247,294])K.tone(t+.04,'sine',f,f,1.4,.05,{att:.12})},
  esplosione:(K,t)=>{K.tone(t,'sine',72,28,.9,1,{drive:1.5,lp:500,sw:.5});K.noise(t,1.2,'lowpass',2000,.8,.9,{brown:true,f2:150,drive:2.6,pre:2,rev:.5});K.noise(t,.08,'bandpass',2400,.8,.5,{att:.0005});
    thud(K,t,170,.7,.25);for(let i=0;i<12;i++)K.noise(t+.12+Math.random()*.75,.04,'lowpass',rnd(1500,.3),.8,.1*(1-i/14),{brown:true});K.noise(t+.03,1.4,'lowpass',700,.7,.25,{brown:true,f2:120,att:.05,rev:1.2})}};
// ------------------------------------------------------------------ the bank of one gun: every sound in its own slot of one offline
// render, then cut into its own buffer and brought to its loudness (peak)
const KIND=id=>id==='revolver'?'rev':id==='pompa'||id==='tattica'?'sg':id==='lanciarazzi'?'rz':'mag';
function items(id){const w=RW[id]||{p:1,v:1},S=SHOT[id],L=[],add=(name,dur,peak,f,rev)=>L.push({name,dur,peak,f,rev});
  for(let i=0;i<3;i++)add('sparo'+i,S?(S.taV?.4+S.taD:.5):id==='risonatore'?2.2:id==='lanciarazzi'?1.3:id==='vapore'?.8:.4,S?S.peak:({lanciafiamme:.3,lanciarazzi:.55,risonatore:.45,vapore:.75})[id]||.7,(K,t)=>{if(S){shot(K,t,S);if(S.mech)S.mech(K,t)}else OTHER[id](K,t)},true);
  if(S&&ARMI.DATI[id].auto)add('coda',1.1,.22,(K,t)=>{K.noise(t,.9,'lowpass',rnd(1000,.1),.7,.3,{brown:true,f2:180,att:.01,rev:1.2});for(const[d,a] of[[.2,1],[.42,.5]])K.noise(t+d,.14,'lowpass',1300,.7,.18*a,{brown:true,f2:380,att:.004,rev:.7})},true);
  const k=KIND(id);
  if(k==='mag')for(const n of['out','pouch','seat','rack','fwd'])add('rl:'+n,n==='fwd'&&(w.tank||w.steam||w.glass)?.7:n==='seat'&&w.glass?.65:.32,n==='pouch'?.16:n==='fwd'?.5:.38,(K,t)=>RL[n](K,t,w));
  if(k==='rev')for(const n of['open','eject','round','shut','spin'])add('rv:'+n,.3,n==='shut'?.5:n==='round'?.22:.35,(K,t)=>{const T=K.c;RV[n](shift(K,t))});
  if(k==='sg'){add('cartuccia',.2,.36,(K,t)=>SG.cartuccia(shift(K,t)));add('pompa',.5,.55,(K,t)=>SG.pompa(shift(K,t),id))}
  if(k==='rz'){for(const n of['pouch','in','lock'])add('rz:'+n,n==='in'?.6:.3,n==='pouch'?.16:.45,(K,t)=>RZ[n](shift(K,t)));add('esplosione',1.6,.8,(K,t)=>OTHER.esplosione(K,t),true)}
  add('estrai',.3,.22,(K,t)=>EQ.estrai(shift(K,t),w));add('armata',.7,.45,(K,t)=>EQ.armata(shift(K,t),id,w));add('vuoto',.12,.3,(K,t)=>EQ.vuoto(shift(K,t),w));
  if(id==='mitragliatrice')add('giri',.7,.35,(K,t)=>{const k2=shift(K,t);k2.tone(0,'sawtooth',90,420,.6,.06,{lp:2200,att:.15,sw:.75});clack(k2,0,800,.12,1.3)});
  return L}
// the same kit with every time moved by t0 (the layers above write their times from 0)
function shift(K,t0){const o={c:K.c};for(const f of['noise','tone','modal'])o[f]=(t,...a)=>K[f](t0+t,...a);return o}
const BANK={};
function render(id){const O=OAC();if(!O)return Promise.resolve(null);let L;try{L=items(id)}catch(e){return Promise.resolve(null)}
  let T=.02;const slots=L.map(it=>{const s={it,t0:T};T+=it.dur+(it.rev?RV_S+.05:.06);return s});
  let c;try{c=new O(1,Math.ceil(T*SR),SR)}catch(e){return Promise.resolve(null)}
  // the glue: a compressor that lets the crack through and lifts the body, then a soft clip (the shots of the games are dense and rough)
  const out=c.createGain(),cmp=c.createDynamicsCompressor();cmp.threshold.value=-26;cmp.knee.value=8;cmp.ratio.value=5;cmp.attack.value=.003;cmp.release.value=.09;
  const clip=c.createWaveShaper(),cn=1024,ca=new Float32Array(cn);for(let i=0;i<cn;i++){const x=i/(cn-1)*2-1;ca[i]=Math.tanh(x*1.6)/Math.tanh(1.6)}clip.curve=ca;
  out.gain.value=2.2;out.connect(cmp);cmp.connect(clip);clip.connect(c.destination);const K=kit(c,out,false);
  for(const s of slots){try{s.it.f(K,s.t0)}catch(e){}}
  return new Promise(res=>{let done=false;const fin=buf=>{if(done)return;done=true;try{const src=buf.getChannelData(0),B={};
        for(const s of slots){const i0=Math.floor(s.t0*SR),n=Math.min(src.length-i0,Math.ceil(s.it.dur*SR)),b=c.createBuffer(1,n,SR),d=b.getChannelData(0);let pk=0;
          for(let i=0;i<n;i++){const x=src[i0+i];d[i]=x;const a=x<0?-x:x;if(a>pk)pk=a}
          // a short fade at the end, the loudness of its kind
          const fo=Math.min(n,Math.floor(.03*SR));for(let i=0;i<fo;i++)d[n-1-i]*=i/fo;const g=pk>1e-5?s.it.peak/pk:0;for(let i=0;i<n;i++)d[i]*=g;
          const nm=s.it.name;if(/^sparo\d$/.test(nm))(B.sparo=B.sparo||[]).push(b);else B[nm]=b}
        res(B)}catch(e){res(null)}};
    try{c.oncomplete=e=>fin(e.renderedBuffer);const p=c.startRendering();if(p&&p.then)p.then(fin,()=>res(null))}catch(e){res(null)}})}
// prepare the bank of gun id (once; it is ready a moment later)
function prepara(id){if(!id||!ARMI.DATI[id])return null;if(BANK[id])return BANK[id];
  const rd=Object.keys(BANK).filter(k=>BANK[k]&&!BANK[k].wait);if(rd.length>=6){rd.sort((a,b)=>(BANK[a].u||0)-(BANK[b].u||0));delete BANK[rd[0]]}BANK[id]={wait:1};render(id).then(B=>{BANK[id]=B||{fail:1}});return BANK[id]}
const ready=id=>{const b=BANK[id];return b&&!b.wait&&!b.fail?b:null};
// one sound: from the bank (one buffer, a little faster or slower each time), or live with the same layers
function play(id,name,x,dt,vol){const c=AU.ctx,t=c.currentTime+.005+(dt||0),B=ready(id);AU.pan=x==null?0:Math.max(-.7,Math.min(.7,(x-180)/200));
  try{if(B){B.u=t;let b=B[name];if(Array.isArray(b))b=b[Math.floor(Math.random()*b.length)];if(!b)return false;const s=c.createBufferSource();s.buffer=b;s.playbackRate.value=rnd(1,name.startsWith('sparo')?.035:.02);
      const g=c.createGain();g.gain.value=vol==null?1:vol;s.connect(g);route(g,null,name.startsWith('sparo')?.08:0);s.start(t);return true}
    prepara(id);if(typeof audioLv==='function'&&audioLv()>1&&name!=='sparo')return true;
    // live (until the bank is ready): the same layers straight into the game's audio
    const it=items(id).find(q=>q.name===name||(name==='sparo'&&q.name==='sparo0'));if(!it)return false;const out=c.createGain();out.gain.value=(vol==null?1:vol)*it.peak*.5;route(out,null,0);it.f(kit(c,out,true),t);return true}
  catch(e){return false}finally{AU.pan=0}}
// ------------------------------------------------------------------ in place of the old ARMI.suono for the zombie guns (the old one stays
// for what is not here: the casing landing, the ammo picked up)
const N={};// the bursts of the automatic guns: how many shots in a row, and when the last one was
const old=ARMI.suono;
ARMI.suono=function(id,what,x,dt){if(typeof AU==='undefined'||!AU.ctx||!AU.on.sfx)return;const D=ARMI.DATI[id]||{};
  if(what==='sparo'){const n=N[id]||(N[id]={n:0,t:-9}),now=AU.ctx.currentTime;if(now-n.t>.3)n.n=0;n.t=now;const k=n.n++;
    if(id==='lanciafiamme'&&ARMI.fiamma)return;// its roar is continuous
    if(!play(id,'sparo',x,dt))return old(id,what,x,dt);
    // the burst's echo now and then (not over every shot: the ear hears the burst, not each shot)
    if(D.auto&&k%5===2&&!(typeof audioLv==='function'&&audioLv()>1))play(id,'coda',x,(dt||0)+.02,.55);return}
  if(what==='ricarica')return;// the reload sounds come at their moments (rl:, rv:, rz:)
  if(what==='esplosione'&&play('lanciarazzi','esplosione',x,dt))return;
  if(/^(rl|rv|rz):|^(cartuccia|pompa|estrai|armata|vuoto|giri|coda)$/.test(what)){if(!play(id,what,x,dt)&&!/:/.test(what))old(id,what,x,dt);return}
  return old(id,what,x,dt)};
// the end of a burst: the echo rolls away (called by the gun when the trigger is let go after three shots or more)
ARMI.codaRaffica=(id,x)=>{if(typeof AU==='undefined'||!AU.ctx||!AU.on.sfx)return;if(ARMI.DATI[id]&&ARMI.DATI[id].auto&&id!=='lanciafiamme')play(id,'coda',x,0,1)};
// ------------------------------------------------------------------ the flamethrower's roar: one voice for the gun, louder while it fires
// (g.sh: seconds since the last shot), a deep roar, the hiss of the jet and a crackle; it fades by itself if nobody calls it any more
ARMI.fiamma=(g,x)=>{if(typeof AU==='undefined'||!AU.ctx)return;const c=AU.ctx,on=AU.on.sfx&&g.sh!=null&&g.sh<.12&&g.st==='pronta';
  if(on&&!g.fv){try{const mk=(br,type,f,q)=>{const s=c.createBufferSource();s.buffer=br?AU.brown:AU.white;s.loop=true;s.start();const b=filt(type,f,q),gg=c.createGain();gg.gain.value=0;s.connect(b);b.connect(gg);return{s,b,gg}};
      const roar=mk(true,'bandpass',420,.7),hiss=mk(false,'highpass',2600,.7),crk=mk(false,'bandpass',1800,2.5),m=c.createGain();m.gain.value=.0001;
      for(const v of[roar,hiss,crk])v.gg.connect(m);roar.gg.gain.value=.9;hiss.gg.gain.value=.16;crk.gg.gain.value=.1;route(m,null,.15);g.fv={roar,hiss,crk,m}}catch(e){}}
  const F=g.fv;if(!F)return;const t=c.currentTime,v=on?1:0;
  F.m.gain.cancelScheduledValues(t);F.m.gain.setTargetAtTime(.0001+v*.22,t,on?.05:.12);F.m.gain.setTargetAtTime(.0001,t+.3,.1);
  F.roar.b.frequency.setTargetAtTime(380+Math.random()*120,t,.05);F.crk.gg.gain.setTargetAtTime(Math.random()<.3?.25:.04,t,.01);
  if(!on&&g.sh>.6){g.fv=null;try{for(const q of[F.roar,F.hiss,F.crk])q.s.stop(t+.5)}catch(e){}}};
// every loop of a gun put down (another gun taken, the match over)
ARMI.ferma=g=>{if(!g)return;try{if(g.mot){g.spinV=0;ARMI.motore(g,180)}if(g.fv){const t=AU.ctx.currentTime;g.fv.m.gain.setTargetAtTime(.0001,t,.05);for(const q of[g.fv.roar,g.fv.hiss,g.fv.crk])q.s.stop(t+.3);g.fv=null}}catch(e){}};
ARMI.prepara=prepara;ARMI.banco=BANK;ARMI.suonaBanco=play;ARMI.suonoVecchio=old;
// the machine gun's motor: it fades by itself too (before it kept humming when the game was paused)
{const _m=ARMI.motore;ARMI.motore=(g,x)=>{if(g.mot&&AU.ctx)g.mot.gg.gain.cancelScheduledValues(AU.ctx.currentTime);_m(g,x);if(g.mot&&AU.ctx){const t=AU.ctx.currentTime;g.mot.gg.gain.setTargetAtTime(.0001,t+.3,.1)}}}
})();
