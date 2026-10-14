// ---------- audio engine: original procedural score + sound design ----------
const AU={ctx:null,on:{music:true,sfx:true},cur:null,want:null,intT:.15,last:{},duck:1};
try{const st=JSON.parse(localStorage.getItem('cripta_audio'));if(st)Object.assign(AU.on,st)}catch(e){}
const mtof=m=>440*Math.pow(2,(m-69)/12);
function mkNoise(c,sec,kind){const b=c.createBuffer(1,c.sampleRate*sec,c.sampleRate),d=b.getChannelData(0);let last=0;
  for(let i=0;i<d.length;i++){const w=Math.random()*2-1;if(kind==='brown'){last=(last+.02*w)/1.02;d[i]=last*3.5}else d[i]=w}return b}
function mkImpulse(c,sec,decay){const len=c.sampleRate*sec,b=c.createBuffer(2,len,c.sampleRate);
  for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);let lp=0;for(let i=0;i<len;i++){const w=Math.random()*2-1;lp+=(w-lp)*(.35-.25*i/len);d[i]=lp*Math.pow(1-i/len,decay)}}return b}
function initAudio(){
  // (difetti 48) on the phone the audio can stay 'interrupted' (a call, Siri, another app): the next tap starts it again, like when suspended
  if(AU.ctx){if(AU.ctx.state!=='running'&&AU.ctx.state!=='closed'&&!document.hidden)AU.ctx.resume();return}
  try{
    const c=new(window.AudioContext||window.webkitAudioContext)();AU.ctx=c;actx=c;
    const comp=c.createDynamicsCompressor();comp.threshold.value=-18;comp.knee.value=14;comp.ratio.value=3.5;comp.attack.value=.004;comp.release.value=.25;comp.connect(c.destination);
    // (difetti 48) a phone speaker plays nothing under 40 Hz, but those lows (the Becchino's steps and shovel, the blasts) filled the
    // compressor and the speaker: a gentle high-pass before the compressor
    const hp=c.createBiquadFilter();hp.type='highpass';hp.frequency.value=40;hp.Q.value=.6;hp.connect(comp);
    AU.master=c.createGain();AU.master.gain.value=.9;AU.master.connect(hp);
    AU.music=c.createGain();AU.music.gain.value=AU.on.music?.38:0;AU.music.connect(AU.master);
    AU.sfxBus=c.createGain();AU.sfxBus.gain.value=AU.on.sfx?.8:0;AU.sfxBus.connect(AU.master);
    AU.rev=c.createConvolver();AU.rev.buffer=mkImpulse(c,3,2.4);const rv=c.createGain();rv.gain.value=.6;AU.rev.connect(rv);rv.connect(AU.master);
    AU.mRev=c.createGain();AU.mRev.gain.value=AU.on.music?1:0;AU.mRev.connect(AU.rev);
    AU.sRev=c.createGain();AU.sRev.gain.value=AU.on.sfx?1:0;AU.sRev.connect(AU.rev);
    AU.dly=c.createDelay(1.5);const fb=c.createGain(),dl=c.createBiquadFilter(),dOut=c.createGain();fb.gain.value=.36;dl.type='lowpass';dl.frequency.value=2400;dOut.gain.value=.42;
    AU.dly.connect(dl);dl.connect(fb);fb.connect(AU.dly);dl.connect(dOut);dOut.connect(AU.music);
    AU.white=mkNoise(c,2,'white');AU.brown=mkNoise(c,2,'brown');
    setInterval(schedule,25);audioSettings();
    if(AU.want){const w=AU.want;AU.want=null;playMusic(w)}
  }catch(e){AU.ctx=null}
}
function audioSettings(){
  if(AU.ctx){const t=AU.ctx.currentTime;AU.music.gain.setTargetAtTime(AU.on.music?.38*AU.duck*VOLM():0,t,.15);AU.mRev.gain.setTargetAtTime(AU.on.music?1:0,t,.15);
    AU.sfxBus.gain.setTargetAtTime(AU.on.sfx?.8*VOLS():0,t,.05);AU.sRev.gain.setTargetAtTime(AU.on.sfx?1:0,t,.05)}
  try{localStorage.setItem('cripta_audio',JSON.stringify(AU.on))}catch(e){}
  for(const id of ['sndBtn','mSnd'])if($(id))$(id).style.opacity=AU.on.music?1:.45;
  if($('optMusic')){$('optMusic').textContent='Musica: '+(AU.on.music?'sì':'no');$('optSfx').textContent='Effetti: '+(AU.on.sfx?'sì':'no')}
}
const VOLM=()=>SAVE&&SAVE.set?SAVE.set.mv*1.25:1,VOLS=()=>SAVE&&SAVE.set?SAVE.set.sv*1.25:1;
function duckMusic(v){AU.duck=v;if(AU.ctx&&AU.on.music)AU.music.gain.setTargetAtTime(.38*v*VOLM(),AU.ctx.currentTime,.3)}
document.addEventListener('visibilitychange',()=>{if(!AU.ctx)return;if(document.hidden)AU.ctx.suspend();else AU.ctx.resume()});

// --- the load: about how many sound effects started in the last half second (every route without a track is one). (difetti 48, Denis:
// «l'audio dopo il quinto round va a farsi fottere») On the zombie map, with the automatic guns (9–16 shots a second) and many zombies, up
// to 800 audio nodes a second were made, more than a phone can play in time: the sounds that repeat look at audioLv() and leave out their
// extra layers (the gun's mechanism, the tails, the casings, the second noises, the voices), 1 = dense, 2 = full
AU.ld=0;AU.ldT=0;
function audioLoad(){const c=AU.ctx;if(!c)return 0;const t=c.currentTime,d=t-AU.ldT;if(d>0){AU.ld*=Math.exp(-d/.5);AU.ldT=t}return AU.ld}
function audioLv(){const l=audioLoad();return l>55?2:l>30?1:0}
// --- routing: dest is a track (music) or null (sound effect) ---
function route(node,tr,rev,dly){const c=AU.ctx;if(!tr){audioLoad();AU.ld++}if(!tr&&AU.pan&&c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=AU.pan;node.connect(p);p.connect(AU.sfxBus)}else node.connect(tr?tr.bus:AU.sfxBus);
  if(rev){const s=c.createGain();s.gain.value=rev;node.connect(s);s.connect(tr?AU.mRev:AU.sRev)}
  if(dly&&tr){const s=c.createGain();s.gain.value=dly;node.connect(s);s.connect(AU.dly)}}
function adsr(g,t,a,peak,dur,rel){g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.setValueAtTime(peak,t+Math.max(a,dur));g.gain.exponentialRampToValueAtTime(.0005,t+Math.max(a,dur)+rel)}
function osc(type,f,t,end){const o=AU.ctx.createOscillator();o.type=type;o.frequency.setValueAtTime(f,t);o.start(t);o.stop(end);return o}
function noiseSrc(t,dur,brown){const s=AU.ctx.createBufferSource();s.buffer=brown?AU.brown:AU.white;s.loop=true;s.start(t,Math.random());s.stop(t+dur);return s}
function filt(type,f,q){const b=AU.ctx.createBiquadFilter();b.type=type;b.frequency.value=f;if(q)b.Q.value=q;return b}

// --- instruments ---
function vHarp(tr,t,m,dur,vel){const c=AU.ctx,f=mtof(m),g=c.createGain(),lp=filt('lowpass',Math.min(9000,f*9),.7);
  const o1=osc('triangle',f,t,t+dur+.1),o2=osc('sine',f*2,t,t+dur+.1),o3=osc('sine',f*3,t,t+dur*.4),g2=c.createGain(),g3=c.createGain();g2.gain.value=.4;g3.gain.value=.12;
  lp.frequency.setValueAtTime(Math.min(9000,f*9),t);lp.frequency.exponentialRampToValueAtTime(Math.max(250,f*1.2),t+dur);
  o1.connect(lp);o2.connect(g2);g2.connect(lp);o3.connect(g3);g3.connect(lp);lp.connect(g);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vel,t+.004);g.gain.exponentialRampToValueAtTime(.0005,t+dur);route(g,tr,.35,.22)}
function vPad(tr,t,ms,dur,vel,bright){const c=AU.ctx,g=c.createGain(),lp=filt('lowpass',bright||900,.5);
  const lfo=osc('sine',.18,t,t+dur+2),lg=c.createGain();lg.gain.value=(bright||900)*.35;lfo.connect(lg);lg.connect(lp.frequency);
  for(const m of ms)for(const det of [-7,7]){const o=osc('sawtooth',mtof(m),t,t+dur+2);o.detune.value=det+Math.random()*3;o.connect(lp)}
  lp.connect(g);adsr(g,t,Math.min(1.2,dur*.4),vel/ms.length,dur*.8,1.4);route(g,tr,.55,0)}
function vChoir(tr,t,ms,dur,vel){const c=AU.ctx,g=c.createGain(),f1=filt('bandpass',720,6),f2=filt('bandpass',1150,8),sum=c.createGain();
  for(const m of ms){for(const det of [-9,0,9]){const o=osc('sawtooth',mtof(m),t,t+dur+2);o.detune.value=det;const v=osc('sine',5.2,t,t+dur+2),vg=c.createGain();vg.gain.value=6;v.connect(vg);vg.connect(o.detune);o.connect(f1);o.connect(f2)}}
  f1.connect(sum);f2.connect(sum);sum.gain.value=1.6;sum.connect(g);adsr(g,t,.9,vel/ms.length,dur*.8,1.5);route(g,tr,.7,0)}
function vBass(tr,t,m,dur,vel){const c=AU.ctx,f=mtof(m),g=c.createGain(),lp=filt('lowpass',520,.8);
  const o1=osc('sine',f,t,t+dur+.4),o2=osc('triangle',f*2,t,t+dur+.4),g2=c.createGain();g2.gain.value=.25;o1.connect(lp);o2.connect(g2);g2.connect(lp);lp.connect(g);
  adsr(g,t,.02,vel,dur*.85,.25);route(g,tr,.05,0)}
function vBell(tr,t,m,dur,vel){const c=AU.ctx,f=mtof(m),g=c.createGain(),car=osc('sine',f,t,t+dur+.1),mod=osc('sine',f*3.5,t,t+dur+.1),mg=c.createGain();
  mg.gain.setValueAtTime(f*2.2,t);mg.gain.exponentialRampToValueAtTime(f*.08,t+dur*.6);mod.connect(mg);mg.connect(car.frequency);car.connect(g);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vel,t+.003);g.gain.exponentialRampToValueAtTime(.0005,t+dur);route(g,tr,.6,.35)}
function vFlute(tr,t,m,dur,vel){const c=AU.ctx,f=mtof(m),g=c.createGain(),o=osc('sine',f,t,t+dur+.4),o2=osc('triangle',f,t,t+dur+.4),g2=c.createGain();g2.gain.value=.25;
  const v=osc('sine',5.4,t,t+dur+.4),vg=c.createGain();vg.gain.setValueAtTime(0,t);vg.gain.linearRampToValueAtTime(f*.012,t+Math.min(.35,dur*.6));v.connect(vg);vg.connect(o.frequency);vg.connect(o2.frequency);
  const n=noiseSrc(t,dur+.3),nf=filt('bandpass',f*2,2),ng=c.createGain();ng.gain.value=.05;n.connect(nf);nf.connect(ng);ng.connect(g);
  o.connect(g);o2.connect(g2);g2.connect(g);adsr(g,t,.07,vel,dur*.9,.25);route(g,tr,.45,.25)}
function vBrass(tr,t,m,dur,vel){const c=AU.ctx,f=mtof(m),g=c.createGain(),lp=filt('lowpass',300,1.5);
  for(const det of [-6,6]){const o=osc('sawtooth',f,t,t+dur+.3);o.detune.value=det;o.connect(lp)}
  lp.frequency.setValueAtTime(250,t);lp.frequency.linearRampToValueAtTime(Math.min(4000,f*7),t+.04);lp.frequency.exponentialRampToValueAtTime(Math.max(300,f*2),t+dur);
  lp.connect(g);adsr(g,t,.02,vel,dur*.7,.12);route(g,tr,.25,0)}
function dDrum(tr,t,vel,f0,f1,dec,nf,nvol){const c=AU.ctx,g=c.createGain(),o=osc('sine',f0,t,t+dec+.05);o.frequency.exponentialRampToValueAtTime(f1,t+dec*.7);
  o.connect(g);g.gain.setValueAtTime(vel,t);g.gain.exponentialRampToValueAtTime(.0005,t+dec);route(g,tr?{bus:tr.drum}:null,.18,0);
  if(nvol){const n=noiseSrc(t,dec*.5),bf=filt('bandpass',nf,1.2),ng=c.createGain();n.connect(bf);bf.connect(ng);ng.gain.setValueAtTime(vel*nvol,t);ng.gain.exponentialRampToValueAtTime(.0005,t+dec*.4);route(ng,tr?{bus:tr.drum}:null,.15,0)}}
const dFrame=(tr,t,v)=>dDrum(tr,t,v,150,62,.32,900,.35),dTaiko=(tr,t,v)=>dDrum(tr,t,v,105,44,.7,500,.5),dTom=(tr,t,v,f)=>dDrum(tr,t,v,f||180,f?f*.6:110,.25,1200,.2);
function dShaker(tr,t,v){const c=AU.ctx,n=noiseSrc(t,.08),hp=filt('highpass',6500),g=c.createGain();n.connect(hp);hp.connect(g);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0005,t+.06);route(g,{bus:tr.drum},.08,0)}

// --- the score ---
const CH=(name)=>name;
const TRACKS={
  menu:{bpm:72,
    pad:[[57,60,64],[57,60,65],[55,60,64],[55,59,62]],
    arp:[[45,52,57,60,64,69],[41,48,53,57,60,65],[48,55,60,64,67,72],[43,50,55,59,62,67]],
    bass:[33,29,36,31],
    mel:[[0,76,8],[8,74,4],[12,72,4],[16,72,12],[28,69,4],[32,72,8],[40,74,4],[44,76,4],[48,74,16]],
    play(tr,step,t,spb){const s=step%16,bar=Math.floor(step/16)%4,loop=step%64,cyc=Math.floor(step/64);
      if(s===0){vPad(tr,t,this.pad[bar],spb*16,.14,1100);vBass(tr,t,this.bass[bar]+12,spb*14,.2)}
      if(s%2===0){const pat=[0,2,3,4,5,4,3,2];vHarp(tr,t,this.arp[bar][pat[(s/2)%8]],1.6,s===0?.13:.085)}
      if(cyc%2===1)for(const[ss,m,l] of this.mel)if(ss===loop)vBell(tr,t,m,spb*l*1.8,.06)}},
  muschio:{bpm:92,
    pad:[[62,65,69],[62,65,70],[60,65,69],[60,64,67]],
    arp:[[50,57,62,65,69,74],[46,53,58,62,65,70],[41,48,53,57,60,65],[48,55,60,64,67,72]],
    bass:[38,34,41,36],
    melA:[[0,69,6],[6,67,2],[8,65,4],[12,64,2],[14,65,2],[16,62,8],[24,65,4],[28,70,4],[32,69,6],[38,72,2],[40,69,4],[44,67,4],[48,64,8],[56,67,6]],
    melB:[[0,74,4],[4,72,4],[8,69,8],[16,70,4],[20,69,4],[24,65,8],[32,69,4],[36,72,4],[40,77,8],[48,76,6],[54,74,2],[56,72,4],[60,76,4]],
    play(tr,step,t,spb){const s=step%16,bar=Math.floor(step/16)%4,loop=step%64,cyc=Math.floor(step/64);
      if(s===0){vPad(tr,t,this.pad[bar],spb*16,.11,800)}
      if(s===0||s===8||s===14)vBass(tr,t,this.bass[bar]+(s===14?7:0),spb*(s===14?2:6),.22);
      if(s%2===0){const pat=[0,2,4,5,3,4,2,1];vHarp(tr,t,this.arp[bar][pat[(s/2)%8]],1.2,s%8===0?.11:.075)}
      if(cyc>0){const mel=cyc%2?this.melA:this.melB;for(const[ss,m,l] of mel)if(ss===loop)vFlute(tr,t,m,spb*l*.95,.075)}
      if(s===0||s===8)dFrame(tr,t,s===0?.5:.38);if(s===6||s===11||s===14)dTom(tr,t,.16,230);dShaker(tr,t,s%2?.05:.025)}},
  cristalli:{bpm:76,
    pad:[[55,59,62,66],[55,59,60,64],[55,57,60,64],[54,59,64,66]],
    bass:[40,36,33,35],
    hi:[[79,83,86,90],[79,83,84,88],[81,84,88,91],[78,83,86,88]],
    mel:[[0,71,8],[8,74,8],[16,76,12],[28,74,4],[32,72,8],[40,71,8],[48,71,16]],
    play(tr,step,t,spb){const s=step%16,bar=Math.floor(step/16)%4,loop=step%64,cyc=Math.floor(step/64);
      if(s===0){vPad(tr,t,this.pad[bar],spb*16,.12,1600);vBass(tr,t,this.bass[bar],spb*14,.2)}
      const hits=[0,3,6,8,11,14];if(hits.includes(s)){const k=hits.indexOf(s);vBell(tr,t,this.hi[bar][(k+cyc)%4]-12,2.4,.04+(s===0?.02:0))}
      if(cyc%2===1)for(const[ss,m,l] of this.mel)if(ss===loop)vBell(tr,t,m,spb*l*1.6,.055);
      if(s===0||s===10)dTom(tr,t,.3,120);if(s===4||s===12)dDrum(tr,t,.09,900,600,.05,3000,.6);dShaker(tr,t,.018)}},
  golem:{bpm:124,
    pad:[[51,55,60],[51,56,60],[50,53,58],[50,55,59]],roots:[36,32,34,31],
    riff:[0,0,12,0,3,0,7,10],
    play(tr,step,t,spb){const s=step%16,bar=Math.floor(step/16)%4,r=this.roots[bar];
      if(s===0){vPad(tr,t,this.pad[bar],spb*16,.1,700);if(bar%2===0)vBell(tr,t,r+36,2,.05)}
      if(s%2===0){let off=this.riff[s/2];if(bar===3&&off===3)off=4;vBrass(tr,t,r+12+off,spb*1.6,.075);vBass(tr,t,r,spb*1.7,.16)}
      if([0,3,8,10,12,14].includes(s))dTaiko(tr,t,{0:.9,3:.5,8:.8,10:.5,12:.4,14:.6}[s]);dShaker(tr,t,s%2?.045:.025);if(s===4||s===12)dTom(tr,t,.25,200)}},
  witch:{bpm:108,
    choir:[[54,57,61],[55,59,62],[54,57,61],[52,56,59]],roots:[42,43,42,40],
    pat:[0,7,12,7,13,7,12,7],
    play(tr,step,t,spb){const s=step%16,bar=Math.floor(step/16)%4,r=this.roots[bar];
      if(s===0){vChoir(tr,t,this.choir[bar],spb*16,.12);vBass(tr,t,r-12,spb*14,.22);vBell(tr,t,bar%2?79:78,2.5,.035)}
      vHarp(tr,t,r+24+this.pat[s%8],.5,s%4===0?.085:.05);
      if([0,6,8,14].includes(s))dTaiko(tr,t,s===0?.85:.55);if(s===11)dTom(tr,t,.3,160);dShaker(tr,t,s%2?.04:.02)}}};
// --- chapter 2: metal, fire and forge ---
function vAnvil(tr,t,vel,pitch){const c=AU.ctx,f=pitch||520,g=c.createGain(),bp=filt('highpass',300);
  for(const[r,a,d] of [[1,1,.9],[2.76,.6,.55],[5.4,.4,.3],[8.93,.25,.18]]){const o=osc('sine',f*r,t,t+d+.05),og=c.createGain();o.connect(og);og.gain.setValueAtTime(vel*a,t);og.gain.exponentialRampToValueAtTime(.0005,t+d);og.connect(bp)}
  const n=noiseSrc(t,.05),nf=filt('bandpass',3800,1.5),ng=c.createGain();n.connect(nf);nf.connect(ng);ng.gain.setValueAtTime(vel*.9,t);ng.gain.exponentialRampToValueAtTime(.0005,t+.05);ng.connect(bp);
  bp.connect(g);g.gain.value=1;route(g,tr?{bus:tr.drum}:null,.3,0)}
Object.assign(TRACKS,{
  vulcano:{bpm:100,
    pad:[[52,55,59],[53,57,60],[52,55,59],[50,53,57]],roots:[40,41,40,38],
    ost:[0,7,12,7,13,7,12,10],
    melA:[[0,71,6],[6,72,2],[8,71,4],[12,69,4],[16,67,8],[24,65,4],[28,64,4],[32,67,6],[38,69,2],[40,71,8],[48,72,4],[52,71,4],[56,64,8]],
    play(tr,step,t,spb){const s=step%16,bar=Math.floor(step/16)%4,loop=step%64,cyc=Math.floor(step/64),r=this.roots[bar];
      if(s===0){vPad(tr,t,this.pad[bar],spb*16,.11,650);vBass(tr,t,r-12,spb*12,.22)}
      if(s%2===0)vHarp(tr,t,r+12+this.ost[(s/2)%8],.7,s%8===0?.09:.06);
      if(s===8&&bar%2)vBrass(tr,t,r+12,spb*6,.06);
      if(cyc>0)for(const[ss,m,l] of this.melA)if(ss===loop)vFlute(tr,t,m-12+(cyc%2?12:0),spb*l*.95,.07);
      if(s===0||s===10)dTaiko(tr,t,s===0?.7:.45);if(s===4||s===12)dFrame(tr,t,.35);if(s===14)dTom(tr,t,.2,140);dShaker(tr,t,s%2?.04:.02)}},
  forgia:{bpm:96,
    pad:[[50,53,57],[51,55,58],[50,53,57],[48,51,55]],roots:[38,39,38,36],
    riff:[0,0,3,0,1,0,7,5],
    mel:[[0,74,4],[4,75,4],[8,74,8],[16,72,4],[20,70,4],[24,69,8],[32,74,4],[36,77,4],[40,75,8],[48,74,16]],
    play(tr,step,t,spb){const s=step%16,bar=Math.floor(step/16)%4,loop=step%64,cyc=Math.floor(step/64),r=this.roots[bar];
      if(s===0){vPad(tr,t,this.pad[bar],spb*16,.1,600)}
      if(s%2===0)vBass(tr,t,r+this.riff[s/2],spb*1.6,.17);
      if(s===4||s===12)vAnvil(tr,t,.16,s===4?560:620);if(s===14&&bar===3)vAnvil(tr,t,.1,700);
      if(cyc%2===1)for(const[ss,m,l] of this.mel)if(ss===loop)vBrass(tr,t,m-12,spb*l*.9,.05);
      if(cyc%2===0&&s%4===2)vHarp(tr,t,r+24+[0,3,7,8][(s/4|0)%4],.6,.06);
      if(s===0||s===8)dTaiko(tr,t,s===0?.75:.5);if(s===6||s===11)dTom(tr,t,.2,170);dShaker(tr,t,s%2?.035:.02)}},
  salamandra:{bpm:132,
    pad:[[57,58,64],[57,60,64],[58,62,65],[55,58,62]],roots:[33,33,34,31],
    riff:[0,12,0,1,0,12,3,1],
    play(tr,step,t,spb){const s=step%16,bar=Math.floor(step/16)%4,r=this.roots[bar],cyc=Math.floor(step/64);
      if(s===0){vPad(tr,t,this.pad[bar],spb*16,.09,900);vBell(tr,t,r+48,1.6,.04)}
      if(s%2===0){vBass(tr,t,r+this.riff[s/2],spb*1.6,.18);if(cyc>0)vBrass(tr,t,r+24+this.riff[s/2],spb*1.4,.055)}
      if(s%2===1&&cyc%2===1)vHarp(tr,t,r+36+[0,1,4,7][(s>>1)%4],.4,.05);
      if([0,3,6,8,11,14].includes(s))dTaiko(tr,t,{0:.9,3:.55,6:.6,8:.8,11:.5,14:.65}[s]);if(s===4||s===12)dFrame(tr,t,.45);dShaker(tr,t,s%2?.05:.03)}},
  fabbro:{bpm:116,
    choir:[[61,64,68],[59,64,68],[57,61,64],[56,60,63]],roots:[37,40,33,32],
    riff:[0,0,7,0,3,0,8,7],
    play(tr,step,t,spb){const s=step%16,bar=Math.floor(step/16)%4,r=this.roots[bar],cyc=Math.floor(step/64);
      if(s===0){vChoir(tr,t,this.choir[bar],spb*16,.13);vBass(tr,t,r-12,spb*14,.22)}
      if(s%2===0)vBrass(tr,t,r+12+this.riff[s/2],spb*1.5,.07);
      if(s===4||s===12)vAnvil(tr,t,.2,s===4?480:540);if(s===14&&cyc%2)vAnvil(tr,t,.12,720);
      if(cyc%2===1&&s===0)vBell(tr,t,r+36,3,.05);
      if([0,3,8,10,12,14].includes(s))dTaiko(tr,t,{0:.95,3:.55,8:.85,10:.5,12:.45,14:.65}[s]);if(s===6)dTom(tr,t,.28,150);dShaker(tr,t,s%2?.045:.025)}}});

function playMusic(name){
  if(INTRO.on&&name!=='trailer')return;if(!AU.ctx){AU.want=name;return}
  if(AU.cur&&AU.cur.name===name)return;
  const c=AU.ctx,now=c.currentTime;
  if(AU.cur){const old=AU.cur;old.bus.gain.setTargetAtTime(0,now,.5);setTimeout(()=>{try{old.bus.disconnect()}catch(e){}},4000)}
  const bus=c.createGain();bus.gain.setValueAtTime(0,now);bus.gain.setTargetAtTime(1,now+.05,.7);bus.connect(AU.music);
  const drum=c.createGain();drum.gain.value=AU.intT;drum.connect(bus);
  AU.cur={name,def:TRACKS[name],bus,drum,step:0,next:now+.12};
  AU.dly.delayTime.setValueAtTime(60/TRACKS[name].bpm*.75,now);
}
function schedule(){const c=AU.ctx;if(!c||!AU.cur||c.state!=='running')return;const tr=AU.cur,spb=60/tr.def.bpm/4;
  if(tr.next<c.currentTime-.2)tr.next=c.currentTime+.05;
  tr.drum.gain.setTargetAtTime(AU.intT,c.currentTime,.6);
  while(tr.next<c.currentTime+.2){try{tr.def.play(tr,tr.step,tr.next,spb)}catch(e){}tr.next+=spb;tr.step++}}
function musicFor(room){return MUSIC[themeOf(room)]}

// --- sound effects: physical "foley" built from real materials (string, wood, bone, stone, metal, goo, leaves, air).
// Every call varies a little in pitch and loudness, and is panned left/right by where it happens (3rd argument = x in the arena).
const VR=(v,p)=>v*(1+(Math.random()*2-1)*p);
function fNoise(t,dur,type,f,q,vol,o){o=o||{};const c=AU.ctx,n=noiseSrc(t,dur+.06,o.brown),b=filt(type,f,q),g=c.createGain();
  if(o.f2)b.frequency.exponentialRampToValueAtTime(o.f2,t+dur*(o.sw||1));
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol,t+(o.att||.003));g.gain.exponentialRampToValueAtTime(.0005,t+dur);
  n.connect(b);b.connect(g);route(g,null,o.rev||0);return g}
function fThump(t,f0,f1,dur,vol,rev){const c=AU.ctx,o=osc('sine',f0,t,t+dur+.05),g=c.createGain();o.frequency.exponentialRampToValueAtTime(f1,t+dur*.8);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol,t+.004);g.gain.exponentialRampToValueAtTime(.0005,t+dur);o.connect(g);route(g,null,rev||0)}
// a struck object: inharmonic partials that ring and die (wood, bone, metal, glass, clay)
function fModal(t,f,ratios,decs,vol,rev){const c=AU.ctx,g=c.createGain();g.gain.value=vol;route(g,null,rev||0);
  ratios.forEach((r,i)=>{const d=decs[Math.min(i,decs.length-1)],o=osc('sine',f*r,t,t+d+.05),gg=c.createGain();
    gg.gain.setValueAtTime(.0001,t);gg.gain.linearRampToValueAtTime(1/(1+i*.7),t+.002);gg.gain.exponentialRampToValueAtTime(.0005,t+d);o.connect(gg);gg.connect(g)})}
const MAT_OF={slime:'goo',bigslime:'goo',magmaslime:'goo',skeleton:'bone',golem:'stone',obsidian:'stone',plant:'plant',eyeflower:'plant',mushroom:'plant',
  wisp:'spirit',shadoweye:'spirit',beetle:'shell',mimic:'wood',witch:'plant'};
const mat=type=>MAT_OF[type]||'flesh';
// material layers
const M={
  wood:(t,v,f)=>{fModal(t,VR(f||330,.08),[1,2.57,4.1],[.14,.07,.04],.22*v,.12);fNoise(t,.04,'bandpass',VR(1400,.1),1.2,.25*v)},
  bone:(t,v,f)=>{fModal(t,VR(f||1150,.1),[1,2.2,3.7],[.05,.03,.02],.2*v,.08);fNoise(t,.025,'bandpass',VR(2600,.1),3,.3*v)},
  metal:(t,v,f,len)=>{fModal(t,VR(f||880,.05),[1,2.76,5.4,8.93],[.7*(len||1),.42*(len||1),.22,.12],.11*v,.35);fNoise(t,.02,'highpass',4500,.7,.12*v)},
  glass:(t,v,f)=>{fModal(t,VR(f||2100,.06),[1,2.32,4.25,6.63],[.5,.32,.2,.12],.07*v,.4)},
  clay:(t,v)=>{fModal(t,VR(620,.08),[1,2.1,3.3],[.12,.07,.04],.2*v,.15);fThump(t,180,90,.08,.25*v)},
  stone:(t,v)=>{fThump(t,VR(150,.1),55,.16,.45*v,.1);fNoise(t,.12,'lowpass',VR(900,.15),.7,.35*v,{brown:true});for(let i=0;i<3;i++)fNoise(t+.01+Math.random()*.06,.018,'highpass',VR(3000,.2),.7,.08*v)},
  goo:(t,v)=>{fThump(t,VR(300,.12),85,.12,.42*v);fNoise(t,.1,'lowpass',VR(700,.15),1.5,.3*v,{brown:true});const b=t+.04+Math.random()*.05;fThump(b,VR(500,.2),VR(1100,.2),.05,.07*v)},
  plant:(t,v)=>{fNoise(t,.07,'bandpass',VR(2600,.15),1,.22*v);fThump(t,VR(230,.1),120,.07,.25*v);fModal(t,VR(420,.1),[1,2.6],[.05,.03],.08*v)},
  flesh:(t,v)=>{fThump(t,VR(175,.1),68,.1,.5*v);fNoise(t,.05,'lowpass',VR(1700,.15),.8,.32*v)},
  shell:(t,v)=>{fModal(t,VR(760,.1),[1,1.9,3.1],[.07,.05,.03],.15*v,.05);fThump(t,190,90,.08,.3*v)},
  ice:(t,v)=>{fModal(t,VR(1700,.08),[1,2.32,4.25],[.35,.22,.12],.09*v,.35);fThump(t,VR(260,.1),120,.06,.2*v);fNoise(t,.03,'highpass',5000,.7,.12*v)},
  spirit:(t,v)=>{fNoise(t,.14,'highpass',VR(2500,.1),.7,.12*v,{f2:6500});fModal(t,VR(1300,.1),[1,2.4],[.2,.12],.05*v,.5)}};
function whoosh(t,dur,f0,f1,vol,rev){fNoise(t,dur,'bandpass',f0,1.1,vol,{f2:f1,att:dur*.35,rev})}
function twang(t,f,vol){// bowstring: a tight noise burst ringing through a narrow resonance, plus the limb's knock
  fNoise(t,.16,'bandpass',f,18,vol*1.6,{att:.001});fNoise(t,.09,'bandpass',f*2,14,vol*.6,{att:.001});fThump(t,95,60,.07,vol*.5)}
function coinClink(t,v){fModal(t,VR(2500,.07),[1,1.48,2.24,2.9],[.28,.2,.13,.09],.06*v,.25)}
function sfx(k,arg,x){
  if(!AU.ctx||!AU.on.sfx)return;const c=AU.ctx,t=c.currentTime+.005,now=performance.now();
  const gap={bow:45,hit:28,coin:35,death:40,xp:40,eshot:90,rock:40,block:40,shieldHit:40,dash:80}[k]||0;if(gap&&now-(AU.last[k]||0)<gap)return;AU.last[k]=now;
  AU.pan=x==null?0:Math.max(-.7,Math.min(.7,(x-180)/200));
  try{switch(k){
    case 'bow':{if(arg==='balestra'||arg==='bolt'){// crossbow: a hard latch clack and a fast hiss, no ringing string
        fThump(t,170,60,.07,.2);fModal(t+.004,VR(1900,.05),[1,2.6,4.1],[.05,.035,.02],.05,.12);fNoise(t,.04,'highpass',3200,1,.1,{att:.001});whoosh(t+.01,.11,3600,1400,.11);break}
      const f=VR(arg==='arco_ricurvo'?285:arg==='arco_tuono'?205:arg==='leaf'?170:240,.06);twang(t,f,.17);whoosh(t+.015,arg==='arco_ricurvo'?.12:.16,2400,700,.12);
      if(arg==='arco_fenice'){fNoise(t+.02,.24,'bandpass',800,.8,.08,{f2:380,att:.02});fNoise(t+.03,.18,'highpass',4500,1,.025,{att:.01})}
      if(arg==='arco_tuono')fModal(t+.01,VR(430,.05),[1,2.3],[.09,.05],.035,.1);break}
    case 'hit':{const crit=arg&&arg.c,m=mat(arg&&arg.t),v=crit?1.25:.85;
      fNoise(t,.018,'bandpass',VR(3200,.12),2,.22*v);// arrowhead biting in
      (M[m]||M.flesh)(t,v);
      if(crit){M.metal(t+.005,.9,VR(1800,.05),.5);fThump(t,110,40,.18,.4);fNoise(t,.2,'highpass',5000,.7,.05,{rev:.3})}break}
    case 'death':{const m=mat(arg),v=1;
      if(m==='goo'){fNoise(t,.28,'lowpass',900,1.2,.42,{brown:true,f2:180});fThump(t,260,55,.22,.45,.1);for(let i=0;i<3;i++){const b=t+.05+Math.random()*.25;fThump(b,VR(420,.3),VR(1000,.3),.045,.06)}}
      else if(m==='bone'){fThump(t,140,60,.14,.3);for(let i=0;i<7;i++)M.bone(t+.02+i*.045+Math.random()*.03,.7-i*.07,VR(1000+i*60,.15))}
      else if(m==='stone'){M.stone(t,1.3);for(let i=0;i<8;i++)fNoise(t+.05+Math.random()*.45,.02,'bandpass',VR(2400,.3),2,.1)}
      else if(m==='plant'){fNoise(t,.22,'bandpass',2800,.8,.3,{f2:1200});M.wood(t,.8,VR(260,.1));fThump(t,180,70,.16,.3)}
      else if(m==='ice'){fThump(t,140,60,.18,.35,.2);for(let i=0;i<8;i++)M.glass(t+Math.random()*.3,1-i*.08,VR(1800+i*160,.15));fNoise(t,.4,'highpass',4500,.7,.1,{rev:.5})}
      else if(m==='spirit'){fNoise(t,.4,'highpass',1800,.7,.18,{f2:7000,att:.05,rev:.4});M.glass(t,.8,VR(1700,.1))}
      else{fNoise(t,.3,'lowpass',2200,.9,.34,{f2:260});fThump(t,VR(210,.1),48,.2,.42,.1)}// dust "poof" + body
      break}
    case 'hurt':{fThump(t,130,50,.22,.7,.1);fNoise(t,.12,'bandpass',900,.9,.35);fNoise(t,.05,'lowpass',2600,.7,.3);fThump(t+.07,85,45,.16,.25);break}
    case 'dash':{whoosh(t,.26,450,2600,.32,.12);fNoise(t,.16,'highpass',3800,.7,.06,{att:.05});fNoise(t,.05,'lowpass',600,1,.12,{brown:true});break}
    case 'creep':{// something wrong under the floor: two low tones beating, a glassy wail bending down, breathy whispers, cracking ground
      const v=arg||0,base=v===1?44:v===2?52:49,dur=2.2,g=c.createGain();g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.5,t+.5);g.gain.setValueAtTime(.5,t+1.4);g.gain.exponentialRampToValueAtTime(.0005,t+dur);route(g,null,.55);
      for(const[f,ty,vv] of [[base,'sawtooth',.18],[base*1.031,'sawtooth',.16],[base*1.5,'triangle',.12]]){const o=osc(ty,f,t,t+dur+.1),lp=filt('lowpass',380,2),og=c.createGain();og.gain.value=vv;o.frequency.exponentialRampToValueAtTime(f*.78,t+dur);o.connect(lp);lp.connect(og);og.connect(g)}
      {const o=osc('sine',v===1?640:v===2?760:980,t+.2,t+dur),vib=osc('sine',5.5,t+.2,t+dur),vg=c.createGain(),og=c.createGain();vg.gain.value=14;vib.connect(vg);vg.connect(o.frequency);o.frequency.exponentialRampToValueAtTime(v===1?380:v===2?420:560,t+dur);
        og.gain.setValueAtTime(.0001,t+.2);og.gain.linearRampToValueAtTime(.05,t+.9);og.gain.exponentialRampToValueAtTime(.0005,t+dur);o.connect(og);route(og,null,.7)}
      for(let i=0;i<3;i++)fNoise(t+.15+i*.45,.6,'bandpass',VR(1400,.3),6,.05,{f2:VR(700,.2),att:.25,rev:.6});
      for(let i=0;i<10;i++)fModal(t+.1+Math.random()*1.4,VR(v===1?260:180,.25),[1,2.4,3.9],[.05,.03,.02],.05*(1-i/14),.25);
      fThump(t,60,32,1.4,.35,.4);break}
    case 'quake':{fNoise(t,1.1,'lowpass',220,.7,.5,{brown:true,att:.3,f2:120,rev:.3});fThump(t+.1,48,30,1,.3,.3);for(let i=0;i<8;i++)fModal(t+Math.random()*.9,VR(900,.3),[1,2.2],[.04,.02],.03,.2);break}
    case 'incoming':{whoosh(t,.42,500,2600,.32,.2);fNoise(t,.42,'lowpass',300,.7,.35,{brown:true,f2:900,att:.35});break}
    case 'boom':{fThump(t,VR(92,.08),28,.9,.75,.35);fNoise(t,.9,'lowpass',1300,.8,.6,{brown:true,f2:80,rev:.35});fNoise(t,.08,'bandpass',1800,.8,.3);
      for(let i=0;i<9;i++)fNoise(t+.08+Math.random()*.6,.02,'bandpass',VR(2600,.35),2,.09*(1-i/12));break}
    case 'block':{M.wood(t,1,VR(280,.05));fNoise(t,.14,'bandpass',3000,.9,.12,{f2:1500});vBell(null,t+.01,VR(84,.01),.6,.035);break}// leaf shield skill
    case 'shieldHit':{const d=arg||0;// wooden shield with an iron rim: duller and crackier the more it's damaged
      M.wood(t,1.2,VR(260*(1-.28*d),.05));M.metal(t+.003,.55*(1-d*.5),VR(700,.04),.35);fThump(t,150,70,.08,.3);
      if(d>.2){const n=1+Math.round(d*5);for(let i=0;i<n;i++)fNoise(t+.01+Math.random()*.08,.02,'bandpass',VR(2200,.3),2.5,.12*d)}break}
    case 'shieldBreak':{fThump(t,170,45,.3,.7,.2);M.wood(t,1.6,150);
      for(let i=0;i<14;i++)fNoise(t+Math.random()*.25,.016,'bandpass',VR(2600,.45),2.5,.16);// splinters
      [0,.17,.31,.42,.5].forEach((d,i)=>M.metal(t+d,1-i*.18,VR(640,.03),.25));// the iron rim clattering on the floor
      break}
    case 'eshot':{const kd=arg||'orb';
      if(kd==='arrow'){twang(t,VR(330,.05),.06);whoosh(t,.12,2800,900,.05)}
      else if(kd==='thorn'){fNoise(t,.06,'bandpass',VR(1300,.1),1.4,.18);M.wood(t,.35,VR(600,.1))}
      else if(kd==='fire'){fNoise(t,.28,'bandpass',VR(700,.1),.9,.16,{brown:true,f2:350,att:.05});for(let i=0;i<3;i++)fNoise(t+Math.random()*.2,.015,'highpass',3500,.7,.05)}
      else if(kd==='coinp'){coinClink(t,.9);coinClink(t+.04,.6)}
      else if(kd==='poison'){fThump(t,VR(380,.1),VR(820,.1),.06,.14);fNoise(t,.09,'lowpass',1200,1,.12,{brown:true})}
      else if(kd==='bubble'){fThump(t,VR(240,.2),VR(700,.2),.06,.1);fThump(t+.05,VR(320,.2),VR(900,.2),.05,.06)}
      else if(kd==='ice'){M.glass(t,.55,VR(2300,.1));whoosh(t,.12,3200,1500,.05)}
      else if(kd==='snow'){whoosh(t,.2,2200,800,.06);M.glass(t,.25,VR(3100,.1))}
      else{fNoise(t,.24,'bandpass',VR(320,.1),5,.2,{f2:900,att:.06})}break}
    case 'rock':{const kd=arg;
      if(kd==='crystal')M.glass(t,1.1);else if(kd==='stump'||kd==='thorns')M.wood(t,.9,VR(240,.1));
      else if(kd==='urn')M.clay(t,1);else if(kd==='deadtree'||kd==='totem'||kd==='reeds')M.wood(t,.9,VR(kd==='reeds'?420:230,.1));else if(kd==='mudmound'||kd==='snail')M.goo(t,.7);
      else if(kd==='iceblock'||kd==='frozenstatue'||kd==='snowpine')M.ice(t,.9);else if(kd==='snowman'||kd==='snowrock'){fThump(t,VR(170,.1),70,.12,.3);fNoise(t,.12,'lowpass',VR(1500,.1),.8,.2,{brown:true})}else if(kd==='anvil'||kd==='cauldron')M.metal(t,.9,kd==='anvil'?1250:520,.8);else M.stone(t,.55);break}
    case 'coin':{coinClink(t,1);coinClink(t+VR(.05,.3),.7);break}
    case 'heal':{[72,76,79,84].forEach((m,i)=>vBell(null,t+i*.07,m,.8,.05));fNoise(t,.5,'bandpass',2000,.8,.05,{f2:6000,att:.2,rev:.4});break}
    case 'pick':{[79,83,86,91].forEach((m,i)=>vBell(null,t+i*.06,m,1.2,.05));break}
    case 'door':{fNoise(t,1.1,'bandpass',180,1.5,.85,{brown:true,f2:520,att:.12,rev:.3});for(let i=0;i<10;i++)fNoise(t+.1+i*.085+Math.random()*.04,.03,'lowpass',VR(900,.2),.8,.12,{brown:true});// stone grinding
      dDrum(null,t+.95,.4,90,40,.4,300,.3);[74,78,81].forEach((m,i)=>vBell(null,t+1+i*.09,m,1.4,.035));break}
    case 'clear':{[62,66,69,74,78,81].forEach((m,i)=>vHarp(null,t+i*.07,m,1.6,.1));vBell(null,t+.45,86,2.2,.05);break}
    case 'roar':{// a beast's growl: rough breath through two "throat" resonances, plus the ground shaking
      const n=c.createBufferSource();n.buffer=AU.brown;n.loop=true;n.start(t);n.stop(t+1.4);const pre=c.createGain(),am=c.createOscillator(),amg=c.createGain();am.frequency.value=VR(26,.1);amg.gain.value=.6;am.connect(amg);amg.connect(pre.gain);am.start(t);am.stop(t+1.4);pre.gain.value=.7;n.connect(pre);
      const g=c.createGain();g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.9,t+.18);g.gain.setValueAtTime(.9,t+.7);g.gain.exponentialRampToValueAtTime(.0005,t+1.35);route(g,null,.45);
      for(const[f,q,v,f2] of [[VR(320,.08),5,1,220],[VR(780,.08),4,.6,520],[1600,3,.25,1100]]){const b=filt('bandpass',f,q),bg=c.createGain();bg.gain.value=v;b.frequency.exponentialRampToValueAtTime(f2,t+1.2);pre.connect(b);b.connect(bg);bg.connect(g)}
      fThump(t,70,38,1.2,.45,.3);for(let i=0;i<5;i++)dDrum(null,t+.1+i*.13,.18+i*.05,90,40,.45,400,.3);break}
    case 'victory':{const ch=[[60,64,67],[65,69,72],[67,71,74],[72,76,79]];ch.forEach((cc,i)=>cc.forEach(m=>vBrass(null,t+i*.32,m,i===3?1.6:.28,.05)));dDrum(null,t,.5,105,44,.7,500,.5);dDrum(null,t+.96,.7,105,44,.9,500,.5);[84,88,91,96].forEach((m,i)=>vBell(null,t+1+i*.1,m,2,.04));break}
    case 'defeat':{[[57,60,64],[53,57,60],[52,56,59]].forEach((cc,i)=>vPad(null,t+i*.7,cc,.9,.12,700));[69,65,64,57].forEach((m,i)=>vFlute(null,t+i*.45,m,.6,.06));dDrum(null,t+2.1,.6,90,35,1,300,.4);break}
    case 'upgrade':{[72,76,79,84,88].forEach((m,i)=>vBell(null,t+i*.06,m,1.2,.05));vHarp(null,t,60,1.5,.12);break}
    case 'ui':{M.wood(t,.55,VR(520,.04));break}
    case 'xp':{vBell(null,t,98+randi(0,5),.2,.03);break}
    case 'levelup':{[72,76,79,84,88,91].forEach((m,i)=>vBell(null,t+i*.05,m,1.4,.055));fNoise(t,.6,'bandpass',800,1.2,.08,{f2:7000,att:.25,rev:.5});vHarp(null,t,60,1.6,.1);break}
    case 'thunder':{fNoise(t,.06,'highpass',2500,.7,.4);for(let i=0;i<4;i++)fNoise(t+.02+i*.03+Math.random()*.02,.03,'bandpass',VR(3500,.3),1.5,.25);fNoise(t+.04,.9,'lowpass',400,.8,.45,{brown:true,f2:90,att:.08,rev:.5});fThump(t+.03,80,35,.7,.4,.3);break}
    case 'crystalBreak':{fNoise(t,.08,'highpass',3000,.7,.4);fThump(t,140,60,.2,.4,.2);
      for(let i=0;i<10;i++)M.glass(t+Math.random()*.35,1-i*.06,VR(1800+i*180,.15));fNoise(t+.02,.5,'highpass',5000,.7,.08,{rev:.5});break}
    case 'gem':{M.glass(t,1.3,VR(2600,.04));vBell(null,t+.03,91+randi(0,2),.7,.05);vBell(null,t+.1,98,.9,.035);break}
    case 'paper':{fNoise(t,.09,'bandpass',VR(3000,.1),1.2,.14,{f2:1800});fThump(t+.02,200,120,.05,.1);break}
    case 'click':{M.wood(t,.35,VR(900,.05));break}
    case 'croak':{const big=arg===2?1:arg===1?.55:0,f0=VR(big?115:250,.06);for(let i=0;i<2;i++){const tt=t+i*(.1+big*.06);fThump(tt,f0*(1+i*.18),f0*.7,.09+big*.12,.32+big*.35);fNoise(tt,.08+big*.1,'bandpass',VR(big?480:880,.05),6,.22+big*.22,{att:.005,rev:big*.3})}break}
    case 'splash':{const v=arg===2?1.4:arg===1?1:.7;fNoise(t,.35*v,'lowpass',VR(1800,.1),.7,.34*v,{f2:500,att:.01});fNoise(t,.12,'bandpass',VR(3200,.1),1,.14*v);for(let i=0;i<4;i++)fThump(t+.03+Math.random()*.2,VR(500,.3),VR(1100,.3),.04,.06*v);break}
    case 'buzz':{const o=osc('sawtooth',VR(arg?260:180,.05),t,t+.46),vb=osc('sine',38,t,t+.46),vg=c.createGain(),bp=filt('bandpass',arg?1400:900,4),g=c.createGain();vg.gain.value=arg?40:18;vb.connect(vg);vg.connect(o.frequency);if(arg)o.frequency.exponentialRampToValueAtTime(420,t+.4);
      o.connect(bp);bp.connect(g);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.09,t+.05);g.gain.exponentialRampToValueAtTime(.0005,t+.44);route(g,null,.1);break}
    case 'chomp':{M.bone(t,1,VR(700,.1));M.bone(t+.05,.8,VR(600,.1));fThump(t,160,70,.1,.35);break}
    case 'tongue':{whoosh(t,.16,600,3000,.22);fNoise(t+.05,.08,'lowpass',900,1,.18,{brown:true});break}
    case 'bubble':{for(let i=0;i<6;i++)fThump(t+i*.05+Math.random()*.03,VR(300,.3),VR(900,.3),.05,.08);break}
    case 'summon':{fNoise(t,.6,'bandpass',300,3,.12,{f2:1600,att:.2,rev:.5});[64,67,71].forEach((m,i)=>vBell(null,t+.1+i*.1,m-12,1,.04));fThump(t,70,40,.5,.25,.3);break}
    case 'howl':{const o=osc('sine',VR(420,.05),t,t+.95),vb=osc('sine',6,t,t+.95),vg=c.createGain(),g=c.createGain(),o2=osc('triangle',840,t,t+.95),g2=c.createGain();vg.gain.value=10;vb.connect(vg);vg.connect(o.frequency);
      o.frequency.linearRampToValueAtTime(640,t+.3);o.frequency.linearRampToValueAtTime(520,t+.9);o2.frequency.linearRampToValueAtTime(1280,t+.3);o2.frequency.linearRampToValueAtTime(1040,t+.9);g2.gain.value=.22;o2.connect(g2);g2.connect(g);o.connect(g);
      g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.07,t+.15);g.gain.setValueAtTime(.07,t+.6);g.gain.exponentialRampToValueAtTime(.0005,t+.92);route(g,null,.55);break}
    case 'freeze':{const v=arg===2?1.4:arg===1?.7:1;fNoise(t,.4*v,'highpass',VR(5000,.1),.7,.12*v,{f2:8000,att:.05,rev:.4});for(let i=0;i<5;i++)M.glass(t+Math.random()*.25,.6*v,VR(2400+i*200,.1));break}
    case 'iceHit':{M.ice(t,.9);break}
    case 'iceBreak':{fNoise(t,.06,'highpass',3000,.7,.3);fThump(t,150,60,.15,.3,.2);for(let i=0;i<6;i++)M.glass(t+Math.random()*.2,.9-i*.1,VR(1900+i*200,.15));break}
    case 'snowball':{const v=arg===2?1.2:arg===1?.9:.7;fThump(t,VR(140,.1),60,.18,.4*v);fNoise(t,.2,'lowpass',VR(1400,.1),.8,.3*v,{brown:true});for(let i=0;i<5;i++)fNoise(t+Math.random()*.12,.02,'bandpass',VR(3000,.3),2,.06*v);break}
    case 'shimmer':{const l=arg||0;fNoise(t,.55+l*.15,'bandpass',500,2,.06,{f2:1800+l*800,att:.3,rev:.5});[0,1,2].forEach(i=>vBell(null,t+.1+i*.13,84+l*2+i*3,.8,.02));break}
  }}catch(e){}
  AU.pan=0}
// kept for the few musical bits that still use a plain tone
function tone(f0,f1,dur,type,vol,delay){if(!AU.ctx||!AU.on.sfx)return;try{const c=AU.ctx,t=c.currentTime+(delay||0),o=c.createOscillator(),g=c.createGain();o.type=type||'triangle';
  o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+dur);g.gain.setValueAtTime(vol||.05,t);g.gain.exponentialRampToValueAtTime(.0005,t+dur+.05);o.connect(g);route(g,null,.25);o.start(t);o.stop(t+dur+.08)}catch(e){}}



