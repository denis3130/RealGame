// ---------- L'AUDIO DEGLI ZOMBIE e i BOSSOLI (punti 46 e 48 del piano di Denis, anteprima 47). Prima sulla mappa gli zombie erano muti.
// Ora ognuno ha una voce sua (una gola che vibra, fatta passare per due formanti che fanno la vocale, il respiro, il raschio), diversa per
// tipo (lo zombie, lo strisciante che gorgoglia, il minatore che tossisce, la lanterna che sussurra, il cane che ringhia, il Becchino
// profondissimo) e un po' anche da zombie a zombie: gemiti, rantoli e respiri quando cammina, passi a tempo con il suo passo, il ringhio e
// l'artiglio quando colpisce, l'impatto bagnato e il lamento quando viene colpito, il verso e il corpo che cade quando muore, la terra che si
// sgretola quando esce dalla fossa. Più forte se è vicino, più piano e più lontano (riverbero) se è lontano, a destra o a sinistra secondo
// lo schermo; mai due versi uguali di fila e mai troppe voci insieme. I bossoli: espulsi dall'arma, volano, rimbalzano e tintinnano solo
// quando toccano terra (un ottone leggero, naturale, molto più basso degli spari; la cartuccia del fucile fa un «toc» di plastica).
// La voce ZV serve anche al falò del menu Zombie (src/js/75-audio-nuovo.js).
const ZV=(()=>{let curve=null;
  const rasp=()=>{if(curve)return curve;const n=1024;curve=new Float32Array(n);for(let i=0;i<n;i++){const x=i/(n-1)*2-1;curve[i]=Math.tanh(x*3.2)*.9+.1*Math.sin(x*9)}return curve};
  // a voice: f0 → f1 (Hz) in dur seconds, through the formants form [F1, F2]; o: vol, att, rasp (0..1), breath (0..1), trem (Hz of a
  // shaking, for the gurgle), rev (how far), jit (how irregular)
  function voice(t,f0,f1,dur,form,o){if(!AU.ctx)return;o=o||{};const c=AU.ctx,vol=o.vol||.1,end=t+dur;
    const src=osc('sawtooth',f0,t,end+.1);src.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur*.92);
    const j1=osc('sine',VR(6.2,.2),t,end+.1),j2=osc('sine',VR(1.7,.3),t,end+.1),jg=c.createGain(),jg2=c.createGain();jg.gain.value=f0*(o.jit==null?.035:o.jit);jg2.gain.value=f0*.05;j1.connect(jg);j2.connect(jg2);jg.connect(src.frequency);jg2.connect(src.frequency);
    const sh=c.createWaveShaper();sh.curve=rasp();const pre=c.createGain();pre.gain.value=.4+(o.rasp||0)*2.4;src.connect(pre);pre.connect(sh);
    const f1n=filt('bandpass',form[0],6),f2n=filt('bandpass',form[1],8),lp=filt('lowpass',o.lp||2600,.7),mix=c.createGain();mix.gain.value=1.8;sh.connect(f1n);sh.connect(f2n);
    if(o.fd){f1n.frequency.exponentialRampToValueAtTime(form[0]*o.fd,t+dur);f2n.frequency.exponentialRampToValueAtTime(form[1]*o.fd,t+dur)}
    f1n.connect(mix);f2n.connect(mix);mix.connect(lp);
    const g=c.createGain(),a=o.att||.12;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol,t+a);g.gain.setValueAtTime(vol*.85,t+Math.max(a,dur*.6));g.gain.exponentialRampToValueAtTime(.0005,end);
    if(o.trem){const tr=osc('sine',o.trem,t,end+.1),tg=c.createGain(),am=c.createGain();tg.gain.value=.5;am.gain.value=.5;tr.connect(tg);tg.connect(am.gain);lp.connect(am);am.connect(g)}else lp.connect(g);
    route(g,null,o.rev||.2);
    if(o.breath)fNoise(t,dur*1.05,'bandpass',VR(1300,.2),1,vol*o.breath*.9,{brown:true,att:a,rev:o.rev||.2})}
  // a body falling on the ground (the death, the becchino's blow)
  function body(t,vol,rev,lite){fThump(t,VR(95,.1),38,.32,vol,rev||.15);fNoise(t,.22,'lowpass',VR(700,.15),.8,vol*.6,{brown:true});if(!lite)for(let i=0;i<3;i++)fNoise(t+.03+Math.random()*.12,.03,'bandpass',VR(1800,.3),1.5,vol*.15)}
  // the ground crumbling as something climbs out of it
  function dirt(t,vol,n){for(let i=0;i<(n||7);i++)fNoise(t+i*.07+Math.random()*.05,VR(.09,.3),'lowpass',VR(1100,.3),.8,vol*(.5+Math.random()*.5),{brown:true});fThump(t,VR(80,.1),45,.4,vol*.8,.2)}
  return{voice,body,dirt}})();
// ------------------------------------------------------------------ LE VOCI NUOVE (Denis, 14 ottobre: «il verso degli zombie ora è
// fastidioso, lo vorrei molto più creepy»). Prima era un'onda a dente di sega che ronzava in due vocali con un vibrato: un kazoo, sempre
// uguale. Ora è una gola vera fatta col codice: i colpi della glottide (radi e storti: sotto i 55 Hz la voce gracchia, il «vocal fry» dei
// moribondi), tre formanti che si muovono come una bocca che si apre e si chiude, il respiro bagnato, il raschio (un colpo forte e uno
// debole: il ringhio), i gorgoglii, il sibilo tra i denti. Ogni verso è preparato una volta sola (poi è un nastro: tre nodi invece di quindici)
// e ogni zombie lo suona con la sua gola (un po' più alto o più basso). I versi sono di più e più vari (lamenti che finiscono gracchiando,
// respiri che rantolano, gorgoglii, sussurri, denti che battono, ringhi quando ti vede, il rantolo della morte, l'ansimo di chi esce dalla
// fossa) e più radi: il silenzio tra un verso e l'altro fa più paura del rumore.
const ZVB=(()=>{const SR=22050,TAU=Math.PI*2;
  // a band-pass resonance whose frequency can move (the formants of the mouth)
  const bp=(f,q)=>{const F={x1:0,x2:0,y1:0,y2:0};set(F,f,q);return F},set=(F,f,q)=>{const w=TAU*Math.min(f,SR*.45)/SR,al=Math.sin(w)/(2*q),a0=1+al;F.b0=al/a0;F.a1=-2*Math.cos(w)/a0;F.a2=(1-al)/a0},
    run=(F,x)=>{const y=F.b0*(x-F.x2)-F.a1*F.y1-F.a2*F.y2;F.x2=F.x1;F.x1=x;F.y2=F.y1;F.y1=y;return y};
  const L=(k,pts)=>{if(k<=pts[0][0])return pts[0][1];for(let i=1;i<pts.length;i++)if(k<=pts[i][0]){const a=pts[i-1],b=pts[i],u=(k-a[0])/(b[0]-a[0]||1),e=u*u*(3-2*u);return a[1]+(b[1]-a[1])*e}return pts[pts.length-1][1]};
  // one clip, d seconds; P(k) (k 0..1 along it) gives: f0 the voice (Hz; 0 = no voice), a loudness, v the three formants [F1,F2,F3], br breath,
  // ro the rasp (every other pulse weaker: the growl), ji how crooked the pulses are, gu gurgles, hs the hiss of the teeth, cl clicks of the jaw
  function voice(d,P){const n=Math.floor(d*SR),out=new Float32Array(n),f1=bp(500,7),f2=bp(1000,9),f3=bp(2500,11),b1=bp(600,4),b2=bp(1500,4),hs=bp(3600,1.6),ck=bp(2600,9);
    let ph=0,per=SR/90,pa=1,alt=0,lp=0,dc=0,dcx=0,bub=0,bubF=300,bubA=0,bubT=0,p=null,env=0,pulseEnv=0,dk=0;
    for(let i=0;i<n;i++){if((i&63)===0){p=P(i/n);set(f1,p.v[0],7);set(f2,p.v[1],9);set(f3,p.v[2],11);set(b1,p.v[0],4);set(b2,p.v[1],4)}
      // the glottis: a pulse each period, crooked (ji), every other one weaker (ro); none when f0 is 0
      let x=0;if(p.f0>0){ph+=1;if(ph>=per){ph-=per;const ji=p.ji||0;per=SR/p.f0*(1+(Math.random()*2-1)*ji*.35);alt^=1;pa=(1+(Math.random()*2-1)*ji*.5)*(alt&&p.ro?1-p.ro*.75:1);x=pa;pulseEnv=1}}
      lp+=(x*8-lp)*.11;pulseEnv*=.993;// the tilt of a throat (soft pulses), and the breath stronger right after each one
      const w=Math.random()*2-1,brt=(p.br||0)*(.55+.45*pulseEnv);
      let y=run(f1,lp)*1.05+run(f2,lp)*.9+run(f3,lp)*.25+(run(b1,w)*1.1+run(b2,w)*.75)*brt*.75;
      // gurgles: little bubbles that rise in pitch and burst, and the voice drowning under them
      if(p.gu>0){if(bubT<=0&&Math.random()<p.gu*45/SR){bubT=Math.floor(SR*(.008+Math.random()*.02));bubF=180+Math.random()*350;bubA=.4+Math.random()*.6;bub=0}
        if(bubT>0){bubT--;bubF*=1.0009;bub+=TAU*bubF/SR;y=y*(1-p.gu*.45)+Math.sin(bub)*bubA*p.gu*.55*Math.min(1,bubT/(SR*.004))}}
      if(p.hs>0)y+=run(hs,w)*p.hs*.7;
      if(p.cl>0&&Math.random()<p.cl*14/SR)y+=run(ck,1)*4;else if(p.cl>0)y+=run(ck,0)*4;
      env+=((p.a||0)-env)*.02;y*=env;
      // a little roughness, dark like a throat (a soft low-pass at about 2.8 kHz), and no slow drift (a gentle high-pass)
      y=Math.tanh(y*1.25);dk+=(y-dk)*.55;dc=dk-dcx+.995*dc;dcx=dk;out[i]=dc}
    return out}
  // the clips of each kind (d seconds, P(k))
  const Z={
    moanA:[1.7,k=>({f0:L(k,[[0,92],[.55,78],[.75,58],[1,32]]),a:L(k,[[0,0],[.22,1],[.7,.85],[1,0]]),v:[L(k,[[0,520],[1,400]]),L(k,[[0,900],[1,720]]),2450],br:.28,ro:L(k,[[0,.1],[.7,.35],[1,.6]]),ji:L(k,[[0,.08],[.6,.16],[1,.6]])})],
    moanB:[2,k=>k<.22?{f0:0,a:L(k,[[0,0],[.2,.7],[.22,.5]]),v:[L(k,[[0,520],[.22,700]]),L(k,[[0,1300],[.22,1600]]),2600],br:1}:
      {f0:L(k,[[.22,84],[.6,70],[.85,48],[1,30]]),a:L(k,[[.22,.4],[.35,1],[.8,.8],[1,0]]),v:[L(k,[[.22,700],[.6,540],[1,430]]),L(k,[[.22,1200],[.6,950],[1,760]]),2500],br:.3,ro:.25,ji:L(k,[[.22,.1],[.8,.2],[1,.6]])}],
    moanC:[1.4,k=>({f0:L(k,[[0,70],[.35,98],[.75,64],[1,40]]),a:L(k,[[0,0],[.25,1],[.75,.8],[1,0]]),v:[420,L(k,[[0,760],[.4,880],[1,700]]),2350],br:.22,ro:.4,ji:L(k,[[0,.1],[.7,.2],[1,.5]])})],
    groanA:[.65,k=>({f0:L(k,[[0,70],[1,58]]),a:L(k,[[0,0],[.08,1],[.6,.8],[1,0]]),v:[620,1150,2500],br:.22,ro:.6,ji:.22})],
    groanB:[.8,k=>({f0:L(k,[[0,44],[1,34]]),a:L(k,[[0,0],[.3,1],[.75,.7],[1,0]]),v:[560,L(k,[[0,1050],[1,900]]),2400],br:.15,ro:.3,ji:.5})],
    breathA:[1.5,k=>k<.45?{f0:0,a:L(k,[[0,0],[.4,.8],[.45,0]]),v:[L(k,[[0,600],[.45,760]]),L(k,[[0,1500],[.45,1750]]),2700],br:1}:
      {f0:L(k,[[.5,34],[1,26]]),a:L(k,[[.45,0],[.55,.75],[1,0]]),v:[520,1000,2500],br:.85,ro:.2,ji:.65,gu:.15}],
    breathB:[1.1,k=>({f0:k>.1&&k<.3||k>.55&&k<.78?36:0,a:L(k,[[0,0],[.12,.7],[.3,.1],[.55,.1],[.6,.8],[.78,.1],[1,0]]),v:[650,1350,2600],br:.95,ro:.2,ji:.6})],
    growlA:[.6,k=>({f0:L(k,[[0,105],[1,92]]),a:L(k,[[0,0],[.05,1],[.75,.9],[1,0]]),v:[760,1250,2600],br:.4,ro:.9,ji:.25,hs:L(k,[[0,0],[.65,0],[.8,.6],[1,.3]])})],
    growlB:[.5,k=>({f0:L(k,[[0,122],[1,84]]),a:L(k,[[0,0],[.04,1],[.7,.85],[1,0]]),v:[720,1180,2550],br:.45,ro:.8,ji:.3,hs:.2})],
    gurgleA:[1,k=>({f0:55,a:L(k,[[0,0],[.15,.6],[.8,.5],[1,0]]),v:[450,800,2300],br:.3,ro:.2,ji:.4,gu:.9})],
    painA:[.28,k=>({f0:L(k,[[0,128],[1,82]]),a:k<.82?L(k,[[0,0],[.06,1],[.82,.8]]):0,v:[650,1200,2500],br:.3,ro:.5,ji:.2})],
    painB:[.32,k=>({f0:L(k,[[0,110],[1,74]]),a:k<.78?L(k,[[0,0],[.05,1],[.78,.7]]):0,v:[560,1050,2450],br:.35,ro:.65,ji:.25})],
    painC:[.25,k=>({f0:L(k,[[0,140],[1,96]]),a:k<.85?L(k,[[0,0],[.05,1],[.85,.6]]):0,v:[700,1300,2600],br:.25,ro:.4,ji:.2})],
    deathA:[1.4,k=>({f0:L(k,[[0,46],[1,22]]),a:L(k,[[0,0],[.1,.8],[.6,.55],[1,0]]),v:[L(k,[[0,520],[1,400]]),L(k,[[0,880],[1,700]]),2400],br:.7,ro:.3,ji:.7,gu:L(k,[[0,.2],[.5,.7],[1,.3]])})],
    deathB:[1.2,k=>({f0:L(k,[[0,90],[.3,62],[.5,40],[1,24]]),a:L(k,[[0,0],[.06,1],[.35,.7],[1,0]]),v:[600,1000,2450],br:.5,ro:.5,ji:L(k,[[0,.15],[.5,.6]]),gu:L(k,[[0,0],[.45,.6],[1,.2]])})],
    riseA:[1.2,k=>k<.72?{f0:0,a:L(k,[[0,0],[.65,1],[.72,.6]]),v:[L(k,[[0,560],[.72,760]]),L(k,[[0,1400],[.72,1800]]),2700],br:1}:
      {f0:L(k,[[.72,44],[1,30]]),a:L(k,[[.72,.6],[.8,.8],[1,0]]),v:[560,1000,2450],br:.6,ro:.3,ji:.6}],
    whisperA:[1,k=>{const sy=Math.floor(k*8),vw=[[300,2300],[700,1200],[400,800],[600,1700],[350,2200],[750,1300],[450,900],[500,1500]][sy%8];
      return{f0:0,a:L(k,[[0,0],[.08,.8],[.9,.7],[1,0]])*(.55+.45*Math.sin((k*8%1)*Math.PI)),v:[vw[0],vw[1],2800],br:1,hs:sy%3===1?.8:0}}],
    chatter:[.45,k=>({f0:0,a:L(k,[[0,.9],[.85,.8],[1,0]]),v:[500,1000,2500],br:.05,cl:1})],
    // the crawler: wetter; the miner: a cough; the lantern: a ghost; the dog; the gravedigger's laugh; the scarecrow's straw and wood
    gurgleB:[.9,k=>({f0:70,a:L(k,[[0,0],[.1,.7],[.85,.6],[1,0]]),v:[500,900,2400],br:.4,ro:.3,ji:.3,gu:1})],
    hiss:[.75,k=>({f0:40,a:L(k,[[0,0],[.15,.8],[.8,.7],[1,0]]),v:[600,1700,2900],br:.5,ji:.5,hs:1})],
    coughA:[.75,k=>{const b=k<.22?k/.22:k>=.4&&k<.62?(k-.4)/.22:-1;return b<0?{f0:34,a:.12,v:[500,1000,2400],br:.4,ji:.6,gu:.4}:{f0:L(b,[[0,140],[1,90]]),a:L(b,[[0,0],[.06,1],[1,0]]),v:[700,1250,2600],br:1,ro:.6,ji:.3}}],
    ghostA:[1.9,k=>({f0:L(k,[[0,138],[.5,128],[1,104]]),a:L(k,[[0,0],[.35,.7],[.75,.6],[1,0]])*(.8+.2*Math.sin(k*1.9*4*TAU)),v:[380,L(k,[[0,1900],[1,1500]]),2950],br:.85,ji:.04})],
    ghostB:[1.6,k=>({f0:L(k,[[0,116],[.6,150],[1,96]]),a:L(k,[[0,0],[.4,.65],[1,0]]),v:[340,L(k,[[0,800],[.5,2000],[1,1200]]),3000],br:.9,ji:.05})],
    snarl:[.55,k=>({f0:L(k,[[0,160],[1,145]]),a:L(k,[[0,0],[.04,1],[.8,.9],[1,0]])*(.75+.25*Math.sin(k*.55*30*TAU)),v:[820,1450,2850],br:.5,ro:.9,ji:.25,hs:.45})],
    huff:[.55,k=>{const b=[.0,.2,.4].find(o=>k>=o&&k<o+.12);return{f0:0,a:b!=null?Math.sin((k-b)/.12*Math.PI):0,v:[900,1650,2800],br:1}}],
    yelp:[.24,k=>({f0:L(k,[[0,430],[1,260]]),a:k<.9?L(k,[[0,0],[.08,1],[.9,.6]]):0,v:[720,1550,3000],br:.25,ro:.2,ji:.1})],
    whimper:[1,k=>({f0:L(k,[[0,300],[.5,220],[1,150]]),a:L(k,[[0,0],[.1,.8],[1,0]]),v:[600,1500,2900],br:.4,ji:L(k,[[0,.05],[1,.5]]),gu:L(k,[[0,0],[.5,.5]])})],
    laugh:[1.1,k=>{const b=[0,.18,.36,.54,.72].findIndex(o=>k>=o&&k<o+.14);return b<0?{f0:0,a:0,v:[600,1000,2400],br:.1}:{f0:58-b*3,a:Math.sin((k-[0,.18,.36,.54,.72][b])/.14*Math.PI)*(1-b*.12),v:[650,1050,2400],br:.6,ro:.5,ji:.45}}],
    growlBig:[.95,k=>({f0:L(k,[[0,58],[1,48]]),a:L(k,[[0,0],[.08,1],[.75,.85],[1,0]]),v:[640,1050,2400],br:.35,ro:1,ji:.3,hs:.15})],
    rustle:[.6,k=>({f0:0,a:Math.random()<.3?1:.15,v:[2600,3400,4200],br:.8,hs:.5})],
    creak:[.8,k=>({f0:L(k,[[0,22],[.5,34],[1,18]]),a:L(k,[[0,0],[.15,.9],[.85,.8],[1,0]]),v:[1250,2300,3100],br:.05,ji:.6})]};
  // what each kind says: [the clip, its pitch] for each thing
  const KIND={zombie:{moan:['moanA','moanB','moanC','groanA','groanB','breathA','breathB','gurgleA','whisperA'],growl:['growlA','growlB'],pain:['painA','painB','painC'],death:['deathA','deathB'],rise:['riseA'],near:['chatter','breathB'],r:1},
    strisciante:{moan:['gurgleB','hiss','gurgleA','moanC','breathA'],growl:['hiss','growlB'],pain:['painA','painC'],death:['deathA','gurgleB'],rise:['riseA'],near:['chatter','gurgleB'],r:1.18},
    minatore:{moan:['moanA','groanA','coughA','groanB','breathA'],growl:['growlA'],pain:['painB','painA'],death:['deathB','deathA'],rise:['riseA'],near:['coughA'],r:.86},
    lanterna:{moan:['ghostA','ghostB','whisperA'],growl:['ghostB'],pain:['painC'],death:['ghostA'],rise:['whisperA'],near:['whisperA'],r:1.05},
    hound:{moan:['huff','snarl'],growl:['snarl'],pain:['yelp'],death:['whimper'],rise:['snarl'],near:['snarl'],r:1},
    becchino:{moan:['moanA','growlBig','laugh','moanB'],growl:['growlBig','laugh'],pain:['groanA'],death:['deathA'],rise:['laugh'],near:['laugh'],r:.62},
    spaventapasseri:{moan:['creak','rustle','whisperA'],growl:['creak'],pain:['rustle'],death:['creak'],rise:['rustle'],near:['whisperA'],r:1}};
  // how loud each clip comes out (its peak)
  const PK={moanA:.42,moanB:.42,moanC:.4,groanA:.45,groanB:.4,breathA:.3,breathB:.3,growlA:.55,growlB:.55,gurgleA:.35,painA:.42,painB:.42,painC:.4,deathA:.45,deathB:.45,riseA:.35,whisperA:.26,chatter:.3,
    gurgleB:.38,hiss:.35,coughA:.45,ghostA:.32,ghostB:.32,snarl:.55,huff:.3,yelp:.42,whimper:.4,laugh:.5,growlBig:.6,rustle:.25,creak:.35};
  const BUF={},PCM={},queue=[];let busy=false;
  // the clips are made one at a time when the browser has a moment (a few milliseconds each), the first ones that are needed first
  function make(name){if(PCM[name]||BUF[name])return;const c=Z[name];if(!c)return;const d=voice(c[0],c[1]);let pk=0;for(let i=0;i<d.length;i++){const a=Math.abs(d[i]);if(a>pk)pk=a}
    const g=pk>1e-5?(PK[name]||.4)/pk:0,fo=Math.min(d.length,Math.floor(.02*SR));for(let i=0;i<d.length;i++)d[i]*=g;for(let i=0;i<fo;i++)d[d.length-1-i]*=i/fo;PCM[name]=d}
  function pump(){if(busy||!queue.length)return;busy=true;setTimeout(()=>{busy=false;const n=queue.shift();try{make(n)}catch(e){}pump()},0)}
  function prepara(kind){const K=KIND[kind]||KIND.zombie;for(const t of['moan','growl','pain','death','rise','near'])for(const n of K[t])if(!PCM[n]&&!BUF[n]&&!queue.includes(n))queue.push(n);pump()}
  const buf=name=>{if(BUF[name])return BUF[name];const d=PCM[name];if(!d||typeof AU==='undefined'||!AU.ctx)return null;const b=AU.ctx.createBuffer(1,d.length,SR);b.getChannelData(0).set(d);BUF[name]=b;delete PCM[name];return b};
  // a clip of kind's thing (moan, growl, pain, death, rise, near): t when, vol, rate the throat (1 = the kind's own), rev the night
  // round it; returns how long it lasts (0: not ready yet, it will be the next time)
  function play(kind,thing,t,vol,rate,rev,last){const K=KIND[kind]||KIND.zombie,L0=K[thing]||K.moan;let n=L0[Math.floor(Math.random()*L0.length)];if(n===last&&L0.length>1)n=L0[(L0.indexOf(n)+1)%L0.length];
    const b=buf(n);if(!b){prepara(kind);return 0}const c=AU.ctx,s=c.createBufferSource();s.buffer=b;const r=K.r*(rate||1);s.playbackRate.value=r;const g=c.createGain();g.gain.value=vol;s.connect(g);route(g,null,rev||0);s.start(t);
    play.last=n;return b.duration/r}
  return{play,prepara,Z,KIND,voice,SR}})();
(()=>{if(typeof ZM==='undefined')return;const{W,S}=ZM;
// the voices of each kind: fundamental range, the vowels, rasp and breath; the moans they can make
const KV={zombie:{f:[78,112],fm:[[430,940],[380,820],[520,1050]],rasp:.55,br:.35},strisciante:{f:[115,150],fm:[[560,1250],[620,1400]],rasp:.85,br:.6,gurgle:1},
  minatore:{f:[64,86],fm:[[400,780],[360,700]],rasp:.5,br:.3,cough:1},lanterna:{f:[96,128],fm:[[480,1100],[540,1300]],rasp:.25,br:.55,ghost:1},hound:{f:[150,210],fm:[[700,1500]],rasp:.9,br:.5,dog:1},
  becchino:{f:[50,62],fm:[[360,700]],rasp:.7,br:.4,big:1},spaventapasseri:{f:[90,110],fm:[[520,1200]],rasp:.4,br:.7,straw:1}};
const A={lastMoan:0,lastStep:0,lastHit:0,lastPain:0,lastDeath:0,lastAtk:0,lastTink:0,lastMag:0,lastGrowl:0,lastNear:0,lastType:'',busy:[],cases:[],mags:[],kinds:{}};
// (difetti 48, Denis: «l'audio dopo il quinto round va a farsi fottere») how busy the audio is (src/js/05-audio.js: 0 calm, 1 dense, 2 full):
// in the big fights of the later rounds the sounds that repeat (steps, hits, pains, deaths, risings, casings) come less often and lighter
const lvA=()=>typeof audioLv==='function'?audioLv():0;
const on=()=>typeof AU!=='undefined'&&AU.ctx&&AU.on.sfx&&AU.ctx.state==='running';
// how loud from here (the hero) and where on the screen: near = present, far = soft and with more room in it
function place(x,y){const h=W.hero,d=Math.hypot(x-h.x,y-h.y),k=Math.max(0,Math.min(1,1-(d-60)/400)),q=S(x,y,0),hq=S(h.x,h.y,0);AU.pan=Math.max(-.8,Math.min(.8,(q[0]-hq[0])/190));return{k:k*k,d,rev:.12+.5*(1-k)}}
function vox(z){if(!z.au){const K=KV[z.kind]||KV.zombie,u=Math.random();z.au={K,f:K.f[0]+(K.f[1]-K.f[0])*u,fm:K.fm[Math.floor(Math.random()*K.fm.length)],next:0,hp:z.hp,wp:z.p||0,cd:0,rose:z.rise>=1,
  rate:.92+Math.random()*.16,last:'',spotT:0,nearT:0};if(!A.kinds[z.kind]){A.kinds[z.kind]=1;ZVB.prepara(z.kind)}}return z.au}
// one clip of the new voices (ZVB): what the zombie says, how loud, a little more night round the far ones; returns how long it lasts
function say(z,thing,t,P,vol,rate){const v=vox(z),d=ZVB.play(z.kind,thing,t,vol*P.k,v.rate*(rate||1),Math.min(.95,P.rev+.08),v.last);if(d)v.last=ZVB.play.last;return d}
// one moan, chosen so that the same kind does not come twice in a row
function moan(z,t,P){const d=say(z,'moan',t,P,.28);if(d)return d;return .5}
function moanOld(z,t,P){const v=vox(z),K=v.K,vol=.11*P.k,o={vol,rasp:K.rasp,breath:K.br,rev:P.rev};
  let kinds=K.dog?['snarl','huff']:K.ghost?['moan','whisper']:K.gurgle?['gurgle','hiss','moan']:K.cough?['moan','groan','cough']:K.straw?['rustle','moan']:['moan','groan','breath','moan'];
  let k=kinds[Math.floor(Math.random()*kinds.length)];if(k===A.lastType&&kinds.length>1)k=kinds[(kinds.indexOf(k)+1)%kinds.length];A.lastType=k;
  if(k==='moan'){const d=VR(1.25,.25);ZV.voice(t,v.f,v.f*VR(.78,.08),d,v.fm,{...o,att:.25,fd:.85});return d}
  if(k==='groan'){const d=VR(.6,.2);ZV.voice(t,v.f*1.1,v.f*.8,d,v.fm,{...o,vol:vol*1.1,rasp:K.rasp+.25,att:.06});return d}
  if(k==='breath'){fNoise(t,.5,'bandpass',VR(900,.2),1.2,vol*.55,{brown:true,att:.2,rev:P.rev});fNoise(t+.6,.7,'bandpass',VR(650,.2),1.2,vol*.65,{brown:true,att:.12,f2:420,rev:P.rev});return 1.3}
  if(k==='gurgle'){const d=VR(.75,.2);ZV.voice(t,v.f,v.f*.9,d,v.fm,{...o,trem:VR(18,.2),breath:K.br+.3});return d}
  if(k==='hiss'){fNoise(t,.6,'highpass',VR(2400,.2),.8,vol*.5,{att:.15,rev:P.rev});ZV.voice(t,v.f*.7,v.f*.6,.6,v.fm,{...o,vol:vol*.4});return .6}
  if(k==='cough'){for(let i=0;i<2;i++){ZV.voice(t+i*.28,v.f*1.4,v.f,.16,v.fm,{...o,att:.01,rasp:.9,vol:vol*1.2});fNoise(t+i*.28,.14,'bandpass',900,1,vol*.7,{brown:true})}return .7}
  if(k==='whisper'){fNoise(t,.5,'bandpass',VR(2800,.2),4,vol*.4,{att:.18,rev:.7});fNoise(t+.4,.6,'bandpass',VR(1500,.2),5,vol*.35,{att:.2,rev:.7});vBell(null,t+.1,VR(86,.01),1.4,vol*.12);return 1.1}
  if(k==='rustle'){for(let i=0;i<5;i++)fNoise(t+i*.08,.1,'bandpass',VR(3200,.2),1.2,vol*.35);return .5}
  if(k==='snarl'){ZV.voice(t,v.f,v.f*1.2,.45,v.fm,{...o,trem:VR(32,.2),rasp:1,breath:.8});return .45}
  if(k==='huff'){for(let i=0;i<3;i++)fNoise(t+i*.16,.1,'bandpass',VR(1100,.2),1.2,vol*.6,{brown:true});return .5}
  return .5}
// a step of each kind, in time with its walk
function step(z,t,P){const v=vox(z),K=v.K,vol=P.k*(K.big?.32:.14);if(vol<.006)return;
  if(K.dog){fThump(t,VR(240,.1),130,.03,vol*.6);fNoise(t,.02,'bandpass',VR(2600,.2),1.5,vol*.4);return}
  if(z.kind==='strisciante'){fNoise(t,.22,'bandpass',VR(700,.2),.9,vol*.7,{brown:true,att:.06,f2:400});return}
  if(K.straw){fNoise(t,.12,'bandpass',VR(3000,.2),1.1,vol*.5);M.wood(t,vol*1.2,VR(240,.1));return}
  fThump(t,VR(K.big?75:118,.1),K.big?38:58,K.big?.18:.07,vol);fNoise(t,.08,'bandpass',VR(K.big?600:950,.2),1,vol*.5,{brown:true});if(!P.lv&&Math.random()<.3)fNoise(t+.05,.12,'bandpass',VR(1800,.2),1.3,vol*.2)}
// hit, hurt, attack, death, rising
function impact(z,t,P){const vol=P.k*.26;fThump(t,VR(150,.12),62,.08,vol);fNoise(t,.06,'lowpass',VR(1500,.15),.8,vol*.6);if(!P.lv)fNoise(t+.01,.05,'bandpass',VR(700,.2),2,vol*.4,{brown:true})}
function pain(z,t,P){say(z,'pain',t,P,.27)}
function attack(z,t,P){const v=vox(z);say(z,'growl',t,P,.43,1.04);if(v.K.dog){fThump(t+.12,VR(300,.1),120,.05,.15*P.k);return}
  if(P.lv<2)whoosh(t+.08,.18,VR(900,.1),VR(2400,.1),.1*P.k);fThump(t+.2,VR(200,.1),90,.06,.14*P.k)}
function death(z,t,P){const v=vox(z),K=v.K,now=AU.ctx.currentTime,sayIt=P.lv<2&&now-A.lastDeath>(P.lv?.45:.22);if(sayIt)A.lastDeath=now;
  if(sayIt)say(z,'death',t,P,.34);ZV.body(t+(sayIt?.62:.05),.3*P.k,P.rev,P.lv>0)}
function rise(z,t,P){ZV.dirt(t,.18*P.k,P.lv?3:7);if(P.lv)return;say(z,'rise',t+.25,P,.3)}
// ------------------------------------------------------------------ every frame: who moans, who steps, who got hit, who died (the casings and
// the magazines fly and fall even with the sound off: before, with the effects muted they stayed in the air)
function update(dt,D){stepCases(dt);stepMags(dt);if(!on())return;const now=AU.ctx.currentTime,t=now+.02,lv=lvA(),pl=(x,y)=>{const P=place(x,y);P.lv=lv;return P};A.busy=A.busy.filter(e=>e>now);
  for(const z of W.Z){const v=vox(z);if(z.idle&&!z.die)continue;
    if(z.rise<1){if(!v.rose&&z.rise>0){v.rose=1;const P=pl(z.x,z.y);if(P.k>.02)rise(z,t,P)}continue}v.rose=1;
    if(z.die){if(!v.dead){v.dead=1;const P=pl(z.x,z.y);if(P.k>.01)death(z,t,P)}continue}
    // hit since the last frame (one hit sound every 50 ms, 90 dense, 140 full; a pain every .18 s at most, .35 dense, none full)
    if(z.hp<v.hp-.4){const P=pl(z.x,z.y);if(P.k>.01&&now-A.lastHit>(lv>1?.14:lv?.09:.05)){A.lastHit=now;impact(z,t,P);if(lv<2&&now>v.cd&&now-A.lastPain>(lv?.35:.18)&&Math.random()<.45){v.cd=now+.7;A.lastPain=now;pain(z,t+.03,P)}}}v.hp=z.hp;
    // steps on the walk (two a cycle; with the audio full only the near ones)
    if(z.anim==='walk'&&z.p!=null){const p=z.p,w=v.wp;if((w<.5&&p>=.5)||p<w){if(now-A.lastStep>(lv>1?.12:lv?.07:.045)){const P=pl(z.x,z.y);if(P.k>(lv>1?.35:.03)){A.lastStep=now;step(z,t,P)}}}v.wp=p}
    // a moan now and then: each zombie waits 6-14 s (longer if far), never more than two voices (one dense, none full), never two starting
    // together (the silence between them is what frightens); a growl when it comes for you; its teeth when it is close
    const hd=Math.hypot(z.x-W.hero.x,z.y-W.hero.y);
    if(hd<150&&now>v.spotT&&now-A.lastGrowl>.8&&A.busy.length<2-lv){v.spotT=now+VR(11,.3);A.lastGrowl=now;const P=pl(z.x,z.y);if(P.k>.05){const d=say(z,'growl',t,P,.34);if(d)A.busy.push(now+d)}}
    else if(hd<70&&now>v.nearT&&now-A.lastNear>1.5&&!lv){v.nearT=now+VR(7,.4);A.lastNear=now;const P=pl(z.x,z.y);say(z,'near',t,P,.25)}
    if(now>v.next){const P=pl(z.x,z.y);v.next=now+(6+8*Math.random())*(1+P.d/450);if(P.k>.04&&A.busy.length<2-lv&&now-A.lastMoan>.55){A.lastMoan=now;A.busy.push(now+moan(z,t,P))}}}
}
// ------------------------------------------------------------------ the casings: thrown out by the gun (motore.js passes the gun's 'bossolo'
// events to W.onCase), they fly, bounce and ring only when they land
W.onCase=n=>{const h=W.hero,a=(h.aim!=null?h.aim:h.face)||0,id=W.gunId,sh=id==='pompa'||id==='tattica',max=LOWFX?10:30;
  for(let i=0;i<(n||1);i++){const many=n>1,sd=a+Math.PI/2+VR(0,.4)*(Math.random()<.5?1:-1)*.3,sp=many?VR(14,.5):VR(55,.25);
    A.cases.push({x:h.x+Math.cos(a)*6,y:h.y+Math.sin(a)*6,z:(h.zh||0)+(many?16:21),vx:Math.cos(sd)*sp-Math.cos(a)*VR(12,.5),vy:Math.sin(sd)*sp-Math.sin(a)*VR(12,.5),vz:many?VR(10,.6):VR(70,.25),r:Math.random()*6.3,vr:VR(18,.6)*(Math.random()<.5?-1:1),b:0,life:many?3.2:2.6,sh,ground:(h.zh||0)})}
  if(A.cases.length>max)A.cases.splice(0,A.cases.length-max)};
function tink(c,first){if(!on())return;const lv=lvA(),now=AU.ctx.currentTime;if(!first&&lv)return;if(now-A.lastTink<(lv>1?.16:lv?.09:.05))return;A.lastTink=now;
  const P=place(c.x,c.y),t=now+.005,vol=(first?.026:.012)*Math.max(.25,P.k);
  if(c.sh){fThump(t,VR(820,.1),460,.035,vol*1.6);fNoise(t,.025,'bandpass',VR(2400,.15),1.4,vol*.9);return}
  // brass on stone and earth: a short ring of a few partials not quite in tune, a dry click, no long electronic tail
  const f=VR(first?3900:4300,.1);if(lv)fModal(t,f,[1,VR(2.42,.03)],[.07,.05],vol,.05);else{fModal(t,f,[1,VR(2.42,.03),VR(3.98,.03),VR(5.6,.04)],[.07,.05,.035,.025],vol,.05);fNoise(t,.008,'highpass',6500,.7,vol*.8,{att:.0006})}}
function stepCases(dt){for(let i=A.cases.length-1;i>=0;i--){const c=A.cases[i];c.life-=dt;if(c.life<=0){A.cases.splice(i,1);continue}
  if(c.vz!==0||c.z>c.ground){c.vz-=300*dt;c.x+=c.vx*dt;c.y+=c.vy*dt;c.z+=c.vz*dt;c.r+=c.vr*dt;
    if(c.z<=c.ground){c.z=c.ground;if(c.vz<-28&&c.b<3){tink(c,c.b===0);c.vz=-c.vz*.34;c.vx*=.5;c.vy*=.5;c.vr*=.5;c.b++}else{c.vz=0;c.vx=c.vy=0;c.vr=0}}}}}
// ------------------------------------------------------------------ the empty magazine (Denis, 14 ottobre, la ricarica): it leaves the gun
// where the hero's drawing put it (W.magP, and W.magF the floor under it: offsets on the screen from his feet), falls turning, knocks on
// the floor once or twice (its own sound: steel, the drum, the tank, the crystal) and lies there a few seconds before it fades
W.onMag=()=>{const h=W.hero,a=W.magP;if(!a)return;const f=W.magF||[a[0],0],sd=Math.random()<.5?-1:1;
  A.mags.push({id:W.gunId,wx:h.x,wy:h.y,wz:h.zh||0,x:a[0],y:a[1],fy:Math.max(f[1],a[1]+4),vx:(f[0]-a[0])*1.5+sd*VR(10,.4),vy:-VR(18,.4),r:0,vr:sd*VR(7,.3),b:0,life:4.2,lie:sd*Math.PI/2});
  if(A.mags.length>(LOWFX?3:6))A.mags.shift()};
function magLand(c,first){if(!on())return;const lv=lvA(),now=AU.ctx.currentTime;if((!first&&lv)||now-A.lastMag<.08)return;A.lastMag=now;
  const P=place(c.wx,c.wy),t=now+.005,v=(first?.16:.07)*Math.max(.3,P.k),id=c.id;
  if(id==='lanciafiamme'){fThump(t,VR(150,.1),80,.12,v*1.4);M.metal(t,v*1.1,VR(260,.05),.5);return}
  if(id==='risonatore'){fModal(t,VR(2600,.06),[1,2.76,5.4],[.12,.08,.05],v*.6,.25);return}
  if(id==='tamburo'||id==='mitragliatrice'){fThump(t,VR(170,.1),90,.08,v*1.3);M.metal(t,v*.8,VR(520,.05),.25);fNoise(t,.04,'bandpass',VR(1600,.15),1.2,v*.4);return}
  fThump(t,VR(260,.1),130,.04,v);M.metal(t,v*.7,VR(id==='pistola'?1500:1100,.05),.12);fNoise(t,.02,'highpass',3200,.7,v*.35)}
function stepMags(dt){for(let i=A.mags.length-1;i>=0;i--){const c=A.mags[i];c.life-=dt;if(c.life<=0){A.mags.splice(i,1);continue}
  if(c.vy!==0||c.y<c.fy){c.vy+=320*dt;c.x+=c.vx*dt;c.y+=c.vy*dt;c.r+=c.vr*dt;
    if(c.y>=c.fy){c.y=c.fy;if(c.vy>55&&c.b<2){magLand(c,c.b===0);c.vy=-c.vy*.3;c.vx*=.4;c.vr*=.4;c.b++}else{c.vy=0;c.vx=0;c.vr=0}}}
  else c.r+=(c.lie-c.r)*Math.min(1,dt*14)}}
function drawMag(c){if(!window.ARMI||!ARMI.caricatore)return;const q=ZM.SB(c.wx,c.wy,c.wz),x=q[0]+c.x,a=Math.min(1,c.life/.6);
  ctx.save();ctx.globalAlpha*=a*.3;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(x,q[1]+c.fy+1,4,1.5,0,0,Math.PI*2);ctx.fill();ctx.restore();
  ctx.save();ctx.translate(x,q[1]+c.y);ctx.scale(1.2,1.2);ARMI.caricatore(c.id,0,0,c.r,a,1);ctx.restore()}
function drawCase(c,a){const q=ZM.SB(c.x,c.y,c.z);ctx.save();ctx.globalAlpha*=a;ctx.translate(q[0],q[1]);ctx.rotate(c.r);ctx.fillStyle='rgba(27,22,18,.85)';ctx.fillRect(-2,-1.1,4,2.2);ctx.fillStyle=c.sh?'#c8322a':'#d8a838';ctx.fillRect(-1.6,-.7,3.2,1.4);
  ctx.fillStyle=c.sh?'#e8c050':'#fff0b0';ctx.fillRect(c.sh?.6:-1.3,-.6,c.sh?1:1.4,.5);ctx.restore()}
// hooked to the match (like fortuna.js, armi_speciali.js, compagni.js)
{const _p=ZM.partita;ZM.partita=function(o){const D=_p(o);if(D.__au)return D;D.__au=1;ZVB.prepara('zombie');
  const _u=D.update;D.update=(dt,on2)=>{_u(dt,on2);try{update(dt,D)}catch(e){console.error(e)}};
  // the zombie's blow: its snarl and the claw, when it really hits
  const _zh=D.zombieHit;D.zombieHit=(z,d)=>{const hp=D.hp;_zh(z,d);try{const now=on()?AU.ctx.currentTime:0;if(D.hp<hp&&now&&now-A.lastAtk>.12){A.lastAtk=now;const P=place(z.x,z.y);P.lv=lvA();attack(z,now+.01,P)}}catch(e){}};
  const _t=D.drawTop;D.drawTop=dt=>{_t(dt);if(!A.cases.length&&!A.mags.length)return;try{for(const c of A.mags)drawMag(c);for(const c of A.cases)drawCase(c,Math.min(1,c.life/.6))}catch(e){}};
  const _r=D.reset;D.reset=()=>{_r();A.cases.length=0;A.mags.length=0;A.busy.length=0};return D}}
ZM.audio={A,KV,moan,place,ZVB}})();
