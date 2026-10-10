// copied from Mossbound's index.html by tests/poligono.js: the drawing and sound primitives the weapons code uses
const INK='#1b1612',TAU=Math.PI*2;let LOWFX=false;let ctx=null;const G={t:0};
const AU={ctx:null,on:{music:false,sfx:true},last:{},pan:0};
const mtof=m=>440*Math.pow(2,(m-69)/12);
function mkNoise(c,sec,kind){const b=c.createBuffer(1,c.sampleRate*sec,c.sampleRate),d=b.getChannelData(0);let last=0;
  for(let i=0;i<d.length;i++){const w=Math.random()*2-1;if(kind==='brown'){last=(last+.02*w)/1.02;d[i]=last*3.5}else d[i]=w}return b}
function mkImpulse(c,sec,decay){const len=c.sampleRate*sec,b=c.createBuffer(2,len,c.sampleRate);
  for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);let lp=0;for(let i=0;i<len;i++){const w=Math.random()*2-1;lp+=(w-lp)*(.35-.25*i/len);d[i]=lp*Math.pow(1-i/len,decay)}}return b}
function route(node,tr,rev,dly){const c=AU.ctx;if(!tr&&AU.pan&&c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=AU.pan;node.connect(p);p.connect(AU.sfxBus)}else node.connect(tr?tr.bus:AU.sfxBus);
  if(rev){const s=c.createGain();s.gain.value=rev;node.connect(s);s.connect(tr?AU.mRev:AU.sRev)}
  if(dly&&tr){const s=c.createGain();s.gain.value=dly;node.connect(s);s.connect(AU.dly)}}
function adsr(g,t,a,peak,dur,rel){g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.setValueAtTime(peak,t+Math.max(a,dur));g.gain.exponentialRampToValueAtTime(.0005,t+Math.max(a,dur)+rel)}
function osc(type,f,t,end){const o=AU.ctx.createOscillator();o.type=type;o.frequency.setValueAtTime(f,t);o.start(t);o.stop(end);return o}
function noiseSrc(t,dur,brown){const s=AU.ctx.createBufferSource();s.buffer=brown?AU.brown:AU.white;s.loop=true;s.start(t,Math.random());s.stop(t+dur);return s}
function filt(type,f,q){const b=AU.ctx.createBiquadFilter();b.type=type;b.frequency.value=f;if(q)b.Q.value=q;return b}
function vChoir(tr,t,ms,dur,vel){const c=AU.ctx,g=c.createGain(),f1=filt('bandpass',720,6),f2=filt('bandpass',1150,8),sum=c.createGain();
  for(const m of ms){for(const det of [-9,0,9]){const o=osc('sawtooth',mtof(m),t,t+dur+2);o.detune.value=det;const v=osc('sine',5.2,t,t+dur+2),vg=c.createGain();vg.gain.value=6;v.connect(vg);vg.connect(o.detune);o.connect(f1);o.connect(f2)}}
  f1.connect(sum);f2.connect(sum);sum.gain.value=1.6;sum.connect(g);adsr(g,t,.9,vel/ms.length,dur*.8,1.5);route(g,tr,.7,0)}
function vBell(tr,t,m,dur,vel){const c=AU.ctx,f=mtof(m),g=c.createGain(),car=osc('sine',f,t,t+dur+.1),mod=osc('sine',f*3.5,t,t+dur+.1),mg=c.createGain();
  mg.gain.setValueAtTime(f*2.2,t);mg.gain.exponentialRampToValueAtTime(f*.08,t+dur*.6);mod.connect(mg);mg.connect(car.frequency);car.connect(g);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vel,t+.003);g.gain.exponentialRampToValueAtTime(.0005,t+dur);route(g,tr,.6,.35)}
const VR=(v,p)=>v*(1+(Math.random()*2-1)*p);
function fNoise(t,dur,type,f,q,vol,o){o=o||{};const c=AU.ctx,n=noiseSrc(t,dur+.06,o.brown),b=filt(type,f,q),g=c.createGain();
  if(o.f2)b.frequency.exponentialRampToValueAtTime(o.f2,t+dur*(o.sw||1));
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol,t+(o.att||.003));g.gain.exponentialRampToValueAtTime(.0005,t+dur);
  n.connect(b);b.connect(g);route(g,null,o.rev||0);return g}
function fThump(t,f0,f1,dur,vol,rev){const c=AU.ctx,o=osc('sine',f0,t,t+dur+.05),g=c.createGain();o.frequency.exponentialRampToValueAtTime(f1,t+dur*.8);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol,t+.004);g.gain.exponentialRampToValueAtTime(.0005,t+dur);o.connect(g);route(g,null,rev||0)}
function fModal(t,f,ratios,decs,vol,rev){const c=AU.ctx,g=c.createGain();g.gain.value=vol;route(g,null,rev||0);
  ratios.forEach((r,i)=>{const d=decs[Math.min(i,decs.length-1)],o=osc('sine',f*r,t,t+d+.05),gg=c.createGain();
    gg.gain.setValueAtTime(.0001,t);gg.gain.linearRampToValueAtTime(1/(1+i*.7),t+.002);gg.gain.exponentialRampToValueAtTime(.0005,t+d);o.connect(gg);gg.connect(g)})}
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
function coinClink(t,v){fModal(t,VR(2500,.07),[1,1.48,2.24,2.9],[.28,.2,.13,.09],.06*v,.25)}
function circ(x,y,r){ctx.beginPath();ctx.arc(x,y,r,0,TAU)}
function ell(x,y,rx,ry,rot){ctx.beginPath();ctx.ellipse(x,y,rx,ry,rot||0,0,TAU)}
function ink(w){ctx.strokeStyle=INK;ctx.lineWidth=w||2.5;ctx.lineJoin='round';ctx.lineCap='round'}
function fs(c){ctx.fillStyle=c;ctx.fill();ctx.stroke()}
const Q8=a=>((Math.round(a/(Math.PI/4))%8)+8)%8;
const VIEWS=[['side',1],['s34',1],['s',1],['s34',-1],['side',-1],['n34',-1],['n',1],['n34',1]];
function basis(face){const d=Q8(face),[v,f]=VIEWS[d],qa=d*Math.PI/4,lx=Math.cos(qa)*f,ly=Math.sin(qa);
  return{d,v,f,qa,lx,ly,la:Math.atan2(ly,lx),back:v==='n'||v==='n34',side:v==='side',front:v==='s'||v==='s34'}}
const GLOW={};
function glowSprite(rgb){if(GLOW[rgb])return GLOW[rgb];const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');
  const g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,`rgba(${rgb},1)`);g.addColorStop(.45,`rgba(${rgb},.42)`);g.addColorStop(1,`rgba(${rgb},0)`);x.fillStyle=g;x.fillRect(0,0,64,64);return GLOW[rgb]=c}
function glow(rgb,x,y,r,a,ry){if(a<=0)return;ctx.globalAlpha=Math.min(1,a);ctx.drawImage(glowSprite(rgb),x-r,y-(ry||r),r*2,(ry||r)*2);ctx.globalAlpha=1}
function initAudio(){if(AU.ctx){if(AU.ctx.state==='suspended')AU.ctx.resume();return}
  try{const c=new(window.AudioContext||window.webkitAudioContext)();AU.ctx=c;
    const comp=c.createDynamicsCompressor();comp.threshold.value=-18;comp.knee.value=14;comp.ratio.value=3.5;comp.attack.value=.004;comp.release.value=.25;comp.connect(c.destination);
    AU.master=c.createGain();AU.master.gain.value=.9;AU.master.connect(comp);
    AU.sfxBus=c.createGain();AU.sfxBus.gain.value=.8;AU.sfxBus.connect(AU.master);
    AU.rev=c.createConvolver();AU.rev.buffer=mkImpulse(c,3,2.4);const rv=c.createGain();rv.gain.value=.6;AU.rev.connect(rv);rv.connect(AU.master);
    AU.sRev=c.createGain();AU.sRev.gain.value=1;AU.sRev.connect(AU.rev);AU.mRev=AU.sRev;
    AU.white=mkNoise(c,2,'white');AU.brown=mkNoise(c,2,'brown')}catch(e){AU.ctx=null}}
document.addEventListener('visibilitychange',()=>{if(!AU.ctx)return;if(document.hidden)AU.ctx.suspend();else AU.ctx.resume()});