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
  function body(t,vol,rev){fThump(t,VR(95,.1),38,.32,vol,rev||.15);fNoise(t,.22,'lowpass',VR(700,.15),.8,vol*.6,{brown:true});for(let i=0;i<3;i++)fNoise(t+.03+Math.random()*.12,.03,'bandpass',VR(1800,.3),1.5,vol*.15)}
  // the ground crumbling as something climbs out of it
  function dirt(t,vol){for(let i=0;i<7;i++)fNoise(t+i*.07+Math.random()*.05,VR(.09,.3),'lowpass',VR(1100,.3),.8,vol*(.5+Math.random()*.5),{brown:true});fThump(t,VR(80,.1),45,.4,vol*.8,.2)}
  return{voice,body,dirt}})();
(()=>{if(typeof ZM==='undefined')return;const{W,S}=ZM;
// the voices of each kind: fundamental range, the vowels, rasp and breath; the moans they can make
const KV={zombie:{f:[78,112],fm:[[430,940],[380,820],[520,1050]],rasp:.55,br:.35},strisciante:{f:[115,150],fm:[[560,1250],[620,1400]],rasp:.85,br:.6,gurgle:1},
  minatore:{f:[64,86],fm:[[400,780],[360,700]],rasp:.5,br:.3,cough:1},lanterna:{f:[96,128],fm:[[480,1100],[540,1300]],rasp:.25,br:.55,ghost:1},hound:{f:[150,210],fm:[[700,1500]],rasp:.9,br:.5,dog:1},
  becchino:{f:[50,62],fm:[[360,700]],rasp:.7,br:.4,big:1},spaventapasseri:{f:[90,110],fm:[[520,1200]],rasp:.4,br:.7,straw:1}};
const A={lastMoan:0,lastStep:0,lastHit:0,lastType:'',busy:[],cases:[]};
const on=()=>typeof AU!=='undefined'&&AU.ctx&&AU.on.sfx&&AU.ctx.state==='running';
// how loud from here (the hero) and where on the screen: near = present, far = soft and with more room in it
function place(x,y){const h=W.hero,d=Math.hypot(x-h.x,y-h.y),k=Math.max(0,Math.min(1,1-(d-60)/400)),q=S(x,y,0),hq=S(h.x,h.y,0);AU.pan=Math.max(-.8,Math.min(.8,(q[0]-hq[0])/190));return{k:k*k,d,rev:.12+.5*(1-k)}}
function vox(z){if(!z.au){const K=KV[z.kind]||KV.zombie,u=Math.random();z.au={K,f:K.f[0]+(K.f[1]-K.f[0])*u,fm:K.fm[Math.floor(Math.random()*K.fm.length)],next:0,hp:z.hp,wp:z.p||0,cd:0,rose:z.rise>=1}}return z.au}
// one moan, chosen so that the same kind does not come twice in a row
function moan(z,t,P){const v=vox(z),K=v.K,vol=.11*P.k,o={vol,rasp:K.rasp,breath:K.br,rev:P.rev};
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
  fThump(t,VR(K.big?75:118,.1),K.big?38:58,K.big?.18:.07,vol);fNoise(t,.08,'bandpass',VR(K.big?600:950,.2),1,vol*.5,{brown:true});if(Math.random()<.3)fNoise(t+.05,.12,'bandpass',VR(1800,.2),1.3,vol*.2)}
// hit, hurt, attack, death, rising
function impact(z,t,P){const vol=P.k*.26;fThump(t,VR(150,.12),62,.08,vol);fNoise(t,.06,'lowpass',VR(1500,.15),.8,vol*.6);fNoise(t+.01,.05,'bandpass',VR(700,.2),2,vol*.4,{brown:true})}
function pain(z,t,P){const v=vox(z);if(v.K.dog){ZV.voice(t,v.f*1.8,v.f*1.2,.22,v.fm,{vol:.1*P.k,att:.01,rasp:.6,rev:P.rev});return}ZV.voice(t,v.f*1.45,v.f*1.05,VR(.2,.2),v.fm,{vol:.12*P.k,att:.012,rasp:v.K.rasp+.2,breath:.4,rev:P.rev})}
function attack(z,t,P){const v=vox(z);if(v.K.dog){ZV.voice(t,v.f*1.2,v.f*1.6,.28,v.fm,{vol:.16*P.k,att:.01,rasp:1,trem:30,rev:P.rev});fThump(t+.12,VR(300,.1),120,.05,.15*P.k);return}
  ZV.voice(t,v.f*1.25,v.f*1.5,.32,v.fm,{vol:.15*P.k,att:.02,rasp:1,breath:.6,rev:P.rev});whoosh(t+.08,.18,VR(900,.1),VR(2400,.1),.1*P.k);fThump(t+.2,VR(200,.1),90,.06,.14*P.k)}
function death(z,t,P){const v=vox(z),K=v.K;if(K.dog){ZV.voice(t,v.f*1.6,v.f*.7,.6,v.fm,{vol:.13*P.k,att:.02,rasp:.5,rev:P.rev})}
  else ZV.voice(t,v.f*1.05,v.f*.52,VR(1.15,.15),v.fm,{vol:.14*P.k,att:.05,rasp:K.rasp+.15,breath:K.br+.2,rev:P.rev,fd:.75});ZV.body(t+.62,.3*P.k,P.rev)}
function rise(z,t,P){ZV.dirt(t,.18*P.k);const v=vox(z);ZV.voice(t+.3,v.f*.9,v.f*.75,1.1,v.fm,{vol:.08*P.k,att:.3,rasp:v.K.rasp,breath:.5,rev:P.rev})}
// ------------------------------------------------------------------ every frame: who moans, who steps, who got hit, who died
function update(dt,D){if(!on())return;const now=AU.ctx.currentTime,t=now+.02;A.busy=A.busy.filter(e=>e>now);
  for(const z of W.Z){const v=vox(z);if(z.idle&&!z.die)continue;
    if(z.rise<1){if(!v.rose&&z.rise>0){v.rose=1;const P=place(z.x,z.y);if(P.k>.02)rise(z,t,P)}continue}v.rose=1;
    if(z.die){if(!v.dead){v.dead=1;const P=place(z.x,z.y);if(P.k>.01)death(z,t,P)}continue}
    // hit since the last frame
    if(z.hp<v.hp-.4){const P=place(z.x,z.y);if(P.k>.01&&now-A.lastHit>.05){A.lastHit=now;impact(z,t,P);if(now>v.cd&&Math.random()<.45){v.cd=now+.7;pain(z,t+.03,P)}}}v.hp=z.hp;
    // steps on the walk (two a cycle)
    if(z.anim==='walk'&&z.p!=null){const p=z.p,w=v.wp;if((w<.5&&p>=.5)||p<w){if(now-A.lastStep>.045){const P=place(z.x,z.y);if(P.k>.03){A.lastStep=now;step(z,t,P)}}}v.wp=p}
    // a moan now and then (never more than three voices, never two at the same moment)
    if(now>v.next){const P=place(z.x,z.y);v.next=now+VR(4.5,.45)*(1+P.d/320);if(P.k>.04&&A.busy.length<3&&now-A.lastMoan>.4){A.lastMoan=now;A.busy.push(now+moan(z,t,P))}}}
  stepCases(dt)}
// ------------------------------------------------------------------ the casings: thrown out by the gun (motore.js passes the gun's 'bossolo'
// events to W.onCase), they fly, bounce and ring only when they land
W.onCase=n=>{const h=W.hero,a=(h.aim!=null?h.aim:h.face)||0,id=W.gunId,sh=id==='pompa'||id==='tattica',max=LOWFX?10:30;
  for(let i=0;i<(n||1);i++){const many=n>1,sd=a+Math.PI/2+VR(0,.4)*(Math.random()<.5?1:-1)*.3,sp=many?VR(14,.5):VR(55,.25);
    A.cases.push({x:h.x+Math.cos(a)*6,y:h.y+Math.sin(a)*6,z:(h.zh||0)+(many?16:21),vx:Math.cos(sd)*sp-Math.cos(a)*VR(12,.5),vy:Math.sin(sd)*sp-Math.sin(a)*VR(12,.5),vz:many?VR(10,.6):VR(70,.25),r:Math.random()*6.3,vr:VR(18,.6)*(Math.random()<.5?-1:1),b:0,life:many?3.2:2.6,sh,ground:(h.zh||0)})}
  if(A.cases.length>max)A.cases.splice(0,A.cases.length-max)};
function tink(c,first){if(!on())return;const P=place(c.x,c.y),t=AU.ctx.currentTime+.005,vol=(first?.026:.012)*Math.max(.25,P.k);
  if(c.sh){fThump(t,VR(820,.1),460,.035,vol*1.6);fNoise(t,.025,'bandpass',VR(2400,.15),1.4,vol*.9);return}
  // brass on stone and earth: a short ring of a few partials not quite in tune, a dry click, no long electronic tail
  const f=VR(first?3900:4300,.1);fModal(t,f,[1,VR(2.42,.03),VR(3.98,.03),VR(5.6,.04)],[.07,.05,.035,.025],vol,.05);fNoise(t,.008,'highpass',6500,.7,vol*.8,{att:.0006})}
function stepCases(dt){for(let i=A.cases.length-1;i>=0;i--){const c=A.cases[i];c.life-=dt;if(c.life<=0){A.cases.splice(i,1);continue}
  if(c.vz!==0||c.z>c.ground){c.vz-=300*dt;c.x+=c.vx*dt;c.y+=c.vy*dt;c.z+=c.vz*dt;c.r+=c.vr*dt;
    if(c.z<=c.ground){c.z=c.ground;if(c.vz<-28&&c.b<3){tink(c,c.b===0);c.vz=-c.vz*.34;c.vx*=.5;c.vy*=.5;c.vr*=.5;c.b++}else{c.vz=0;c.vx=c.vy=0;c.vr=0}}}}}
function drawCase(c,a){const q=ZM.SB(c.x,c.y,c.z);ctx.save();ctx.globalAlpha*=a;ctx.translate(q[0],q[1]);ctx.rotate(c.r);ctx.fillStyle='rgba(27,22,18,.85)';ctx.fillRect(-2,-1.1,4,2.2);ctx.fillStyle=c.sh?'#c8322a':'#d8a838';ctx.fillRect(-1.6,-.7,3.2,1.4);
  ctx.fillStyle=c.sh?'#e8c050':'#fff0b0';ctx.fillRect(c.sh?.6:-1.3,-.6,c.sh?1:1.4,.5);ctx.restore()}
// hooked to the match (like fortuna.js, armi_speciali.js, compagni.js)
{const _p=ZM.partita;ZM.partita=function(o){const D=_p(o);if(D.__au)return D;D.__au=1;
  const _u=D.update;D.update=(dt,on2)=>{_u(dt,on2);try{update(dt,D)}catch(e){console.error(e)}};
  // the zombie's blow: its snarl and the claw, when it really hits
  const _zh=D.zombieHit;D.zombieHit=(z,d)=>{const hp=D.hp;_zh(z,d);try{if(D.hp<hp&&on()){const P=place(z.x,z.y);attack(z,AU.ctx.currentTime+.01,P)}}catch(e){}};
  const _t=D.drawTop;D.drawTop=dt=>{_t(dt);if(!A.cases.length)return;try{for(const c of A.cases)drawCase(c,Math.min(1,c.life/.6))}catch(e){}};
  const _r=D.reset;D.reset=()=>{_r();A.cases.length=0;A.busy.length=0};return D}}
ZM.audio={A,KV,moan,place}})();
