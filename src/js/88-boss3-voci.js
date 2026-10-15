// =====================================================================
// LE VOCI E LA PERSONALITÀ DEI 4 BOSS NUOVI (Denis, 15 ottobre: «ci sta ma secondo me gli manca qualcosa», poi ha scelto «voce e
// personalità» e «l'arena che reagisce», 87-boss3-arena.js). Voci da cartone, per la Classica: niente orrore.
// - Il Burattinaio d'Ombra è un burattinaio da teatro furbo: grida «Ah-ah!», ride «eh-eh-eh», «oh-oh-oh» quando ti prende in giro,
//   sussurra prima di sparire, ridacchia quando chiama i burattini, e quando cade un lungo «nooo» che trema.
// - La Fenice della Forgia è un uccello fiero: strida, trilli brevi quando ti prende in giro, un grido che sale prima della picchiata;
//   quando cade, il grido si spegne e dall'uovo esce il «pip pip» del pulcino.
// - La Piovra della Palude è brontolona e buffa: un «bluooarg» gorgogliante, la pernacchia quando ti prende in giro, «blub!» quando la
//   colpisci, «ptù!» quando sputa l'inchiostro.
// - Il Cervo d'Aurora è nobile: un bramito profondo, sbuffa col naso, un richiamo morbido quando chiama l'aurora.
// Ogni verso è preparato una volta sola, la prima volta che si entra in un'arena con uno di loro (poi è un nastro, come la gola degli
// zombie in anteprime/zombie/audio_zombie.js): una gola fatta col codice (i colpi della glottide, tre formanti come una bocca, il respiro,
// il raschio, i gorgoglii) e, per la Fenice, un fischio con le sue armoniche.
// La personalità: quando ti colpiscono ti prendono in giro con un gesto delle loro entrate (l'inchino del Burattinaio, le ali aperte della
// Fenice, il saluto della Piovra, la testa alta del Cervo) e la risata; se stai lontano dai loro colpi troppo a lungo ti chiamano; si
// lamentano quando li colpisci forte; ogni mossa ha il suo verso (si sente arrivare); ridono se cadi.
// =====================================================================
const B3VO=(()=>{const SR=22050,TAU=Math.PI*2;
  // a band-pass resonance whose frequency can move (the formants of the mouth), as in the zombies' throat
  const bp=(f,q)=>{const F={x1:0,x2:0,y1:0,y2:0};set(F,f,q);return F},set=(F,f,q)=>{const w=TAU*Math.min(f,SR*.45)/SR,al=Math.sin(w)/(2*q),a0=1+al;F.b0=al/a0;F.a1=-2*Math.cos(w)/a0;F.a2=(1-al)/a0},
    run=(F,x)=>{const y=F.b0*(x-F.x2)-F.a1*F.y1-F.a2*F.y2;F.x2=F.x1;F.x1=x;F.y2=F.y1;F.y1=y;return y};
  const ez=u=>u*u*(3-2*u);
  // the vowels of a cartoon voice [F1, F2, F3]; m a hum with the mouth shut, n the snort of a nose, r the lips trilling, h the breath,
  // B the bird (only its breath goes through them: the bird's voice is a whistle)
  const VW={a:[760,1220,2600],e:[520,1800,2650],i:[320,2300,3000],o:[520,860,2500],u:[360,760,2400],m:[280,1000,2300],n:[900,2200,3000],r:[300,620,2200],h:[650,1500,2700],B:[1500,2900,3900]};
  const mix=(a,b,u)=>[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u];
  const vow=(v,u)=>{if(!Array.isArray(v))return VW[v]||VW.a;if(v.length<2)return VW[v[0]];const n=v.length-1,x=Math.min(n-1e-6,u*n),i=Math.floor(x);return mix(VW[v[i]],VW[v[i+1]],ez(x-i))};
  const cur=(f,u)=>{const n=f.length-1;if(!n)return f[0];const x=Math.min(n-1e-6,u*n),i=Math.floor(x);return f[i]+(f[i+1]-f[i])*ez(x-i)};
  // a clip of d seconds made of syllables. Each syllable: t start, d length, f the pitch (2 or 3 points, Hz), v the vowel (or a glide
  // of vowels), a loudness, h the breath before the voice (part of the syllable), vib [depth, Hz] the vibrato, am [depth, Hz] the lips
  // trilling or the bird's flutter, att/rel the attack and the release (parts of the syllable), noise: breath only (a snort, a hiss); and
  // br breath, ro rasp, ji crooked pulses, gu gurgles, hs the hiss of the teeth, tn the whistle (the bird), over the clip's own base
  function clip(d,list,base,pk){base=base||{};const P=k=>{const t=k*d;
      for(const s of list){if(t<s.t||t>=s.t+s.d)continue;const u=(t-s.t)/s.d,v=vow(s.v||'a',u),g=q=>s[q]!=null?s[q]:base[q]||0;
        if(s.noise)return{f0:0,a:(s.a||1)*Math.min(1,u/.15)*Math.min(1,(1-u)/.45),v,br:1,hs:g('hs')};
        const h=s.h||0;if(u<h){const q=u/h;return{f0:0,a:(s.a||1)*.6*Math.sin(q*Math.PI/2),v:mix(VW.h,v,q),br:1}}
        const w=(u-h)/(1-h),vib=s.vib?1+s.vib[0]*Math.sin(TAU*s.vib[1]*t):1,am=s.am?1-s.am[0]+s.am[0]*Math.abs(Math.sin(Math.PI*s.am[1]*t)):1,
          env=Math.min(1,w/(s.att||.12))*Math.min(1,(1-w)/(s.rel||.3));
        return{f0:cur(s.f,w)*vib,a:(s.a||1)*env*am,v,br:g('br'),ro:g('ro'),ji:g('ji'),gu:g('gu'),hs:g('hs'),tn:g('tn')}}
      return{f0:0,a:0,v:VW.a,br:0}};
    return{d,P,pk:pk||.5,lp:base.lp||.55}}
  // the throat: a pulse at each period of the voice (crooked by ji, every other one weaker by ro: the growl), softened like a real
  // glottis, through three formants; the breath through two wider ones; little bubbles that rise and burst (gu); the hiss (hs); for the
  // bird a whistle with two harmonics (tn) in place of the pulses. A soft saturation, a low-pass (lp: .55 dark, .9 bright), no DC
  // made in slices (step(ms) renders for at most ms milliseconds, true when it is finished), so a long clip never stops a frame
  function job(C){const n=Math.floor(C.d*SR),out=new Float32Array(n),f1=bp(500,7),f2=bp(1000,9),f3=bp(2500,11),b1=bp(600,4),b2=bp(1500,4),hs=bp(3600,1.6),lpk=C.lp;
    let i=0,ph=0,per=SR/120,alt=0,lp=0,dc=0,dcx=0,bub=0,bubF=300,bubA=0,bubT=0,p=null,env=0,pe=0,dk=0,tp=0;
    return{out,step(ms){const t0=performance.now();
    for(;i<n;i++){if((i&63)===0){if((i&2047)===0&&i&&performance.now()-t0>ms)return false;p=C.P(i/n);set(f1,p.v[0],7);set(f2,p.v[1],9);set(f3,p.v[2],11);set(b1,p.v[0],4);set(b2,p.v[1],4)}
      const tn=p.tn||0;let x=0;
      if(p.f0>0&&tn<1){ph+=1;if(ph>=per){ph-=per;const ji=p.ji||0;per=SR/p.f0*(1+(Math.random()*2-1)*ji*.35);alt^=1;x=(1+(Math.random()*2-1)*ji*.5)*(alt&&p.ro?1-p.ro*.75:1);pe=1}}
      lp+=(x*8-lp)*.11;pe*=.993;
      const w=Math.random()*2-1,brt=(p.br||0)*(.55+.45*pe);
      let y=(run(f1,lp)*1.05+run(f2,lp)*.9+run(f3,lp)*.25)*(1-tn)+(run(b1,w)*1.1+run(b2,w)*.75)*brt*.75;
      if(tn>0&&p.f0>0){tp+=TAU*Math.min(p.f0,SR*.3)/SR;if(tp>TAU)tp-=TAU;y+=tn*(Math.sin(tp)+.35*Math.sin(2*tp)+.12*Math.sin(3*tp))*.6}
      if(p.gu>0){if(bubT<=0&&Math.random()<p.gu*45/SR){bubT=Math.floor(SR*(.008+Math.random()*.02));bubF=180+Math.random()*350;bubA=.4+Math.random()*.6;bub=0}
        if(bubT>0){bubT--;bubF*=1.0009;bub+=TAU*bubF/SR;y=y*(1-p.gu*.45)+Math.sin(bub)*bubA*p.gu*.55*Math.min(1,bubT/(SR*.004))}}
      if(p.hs>0)y+=run(hs,w)*p.hs*.7;
      env+=((p.a||0)-env)*.02;y*=env;y=Math.tanh(y*1.25);dk+=(y-dk)*lpk;dc=dk-dcx+.995*dc;dcx=dk;out[i]=dc}
    return true}}}
  const render=C=>{const J=job(C);J.step(1e9);return J.out};
  // a laugh: n syllables from the pitch fa down to fb, one every step seconds
  const ha=(n,t0,step,d,fa,fb,v,o)=>[...Array(n)].map((_,i)=>{const f=fa+(fb-fa)*i/Math.max(1,n-1);return{t:t0+i*step,d,f:[f*1.04,f*.94],v:Array.isArray(v)?v[i%v.length]:v,a:1-i*.06,h:.3,...(o||{})}});
  // a bird's chirps: n short rising whistles
  const chirp=(n,t0,step,d,f)=>[...Array(n)].map((_,i)=>({t:t0+i*step,d,f:[f*(.86+i*.03),f*(1.16+i*.03)],v:'B',att:.1,rel:.3}));
  // what each boss says: kind → variants [seconds, syllables, peak]. cry: the entrance; angry: the second phase; laugh: when it hits you
  // (laugh2 when it calls you out of hiding); hurt: when you hit it hard; c_<move>: the voice of each move; die, win (you fell); chick
  const VB={
    puppeteer:{base:{br:.25,ro:.12,ji:.05},k:{
      cry:[[.95,[{t:0,d:.14,f:[200,240],v:'a',a:.8,h:.25},{t:.18,d:.24,f:[270,310],v:'a',h:.2},{t:.46,d:.48,f:[300,250,170],v:['a','o'],a:.9,h:.12,vib:[.035,6.5],rel:.4}],.6]],
      laugh:[[1,[...ha(5,0,.13,.1,290,215,['a','e']),{t:.67,d:.32,f:[225,205,150],v:['a','o'],a:.75,h:.12,vib:[.04,7],rel:.45}],.5],
        [.95,[...ha(5,0,.12,.09,270,205,['e','a']),{t:.62,d:.3,f:[215,195,145],v:['e','o'],a:.7,h:.12,vib:[.04,7],rel:.45}],.5]],
      laugh2:[[.92,[...ha(4,0,.17,.12,205,175,'o'),{t:.7,d:.2,noise:1,v:'h',a:.4}],.5]],
      hurt:[[.24,[{t:0,d:.22,f:[270,320,210],v:['o','u'],h:.08,ro:.25}],.45],[.26,[{t:0,d:.07,noise:1,v:'u',a:.7},{t:.05,d:.19,f:[235,185],v:'u',a:.85,h:.3,br:.6}],.45]],
      angry:[[.9,[{t:0,d:.86,f:[150,215,140],v:['o','a'],h:.08,ro:.55,vib:[.03,8],rel:.35}],.62]],
      c_slam:[[.2,[{t:0,d:.17,f:[230,275],v:['u','a'],h:.35}],.42]],
      c_strings:[[.37,[{t:0,d:.24,noise:1,v:'i',hs:.9,a:.8},{t:.22,d:.13,f:[320,370],v:'i',a:.8}],.42]],
      c_puppets:[[.36,ha(3,0,.12,.09,335,355,'i',{a:.8}),.42]],
      c_vanish:[[.46,[{t:0,d:.44,noise:1,v:'u',hs:.85,a:.8}],.38]],
      die:[[1.5,[{t:0,d:1.45,f:[260,240,110],v:['o','u'],h:.04,vib:[.05,5.5],br:.35,rel:.55}],.55]],
      win:[[1.3,[...ha(6,0,.12,.085,305,225,['a','e']),{t:.76,d:.52,f:[240,255,150],v:['a','o'],h:.1,vib:[.045,7],rel:.5}],.55]]}},
    phoenix:{base:{tn:1,br:.1,ji:.02,lp:.9},k:{
      cry:[[1,[{t:0,d:.95,f:[1150,1600,900],v:'B',att:.06,rel:.35,vib:[.025,7],am:[.15,30]}],.20]],
      laugh:[[.75,[...chirp(3,0,.12,.075,1450),{t:.36,d:.36,f:[1400,1850,1300],v:'B',vib:[.02,9],rel:.4}],.18]],
      laugh2:[[.72,[{t:0,d:.45,f:[1300,1450],v:'B',am:[.8,22]},{t:.5,d:.2,f:[1500,1200],v:'B'}],.17]],
      hurt:[[.16,[{t:0,d:.14,f:[1050,780],v:'B',tn:.6,ro:.4,br:.3,att:.05}],.17],[.14,[{t:0,d:.12,f:[1200,900],v:'B',tn:.7,ro:.3,br:.3,att:.05}],.17]],
      angry:[[1.3,[{t:0,d:.32,f:[1200,1700],v:'B',att:.08},{t:.38,d:.9,f:[1300,1750,1000],v:'B',vib:[.03,6],am:[.2,28],rel:.35}],.21]],
      c_feathers:[[.18,[{t:0,d:.16,f:[1500,1150],v:'B',att:.06}],.16]],
      c_dive:[[.5,[{t:0,d:.48,f:[950,1900],v:'B',vib:[.02,10],att:.08,rel:.2}],.17]],
      c_vortex:[[.45,[{t:0,d:.42,f:[1250,1350],v:'B',am:[.85,24]}],.16]],
      c_rain:[[.52,[{t:0,d:.5,f:[1300,1800,1500],v:'B'}],.17]],
      die:[[1.5,[{t:0,d:1.45,f:[1400,1000,520],v:'B',vib:[.03,5],rel:.5,br:.25}],.19]],
      chick:[[.25,[{t:0,d:.07,f:[2600,3000],v:'B',a:.8,att:.1,rel:.3},{t:.15,d:.08,f:[2700,3100],v:'B',a:.9}],.12]],
      win:[[1,[...chirp(5,0,.11,.07,1400),{t:.58,d:.4,f:[1450,1900,1350],v:'B',vib:[.02,9],rel:.4}],.19]]}},
    octopus:{base:{br:.3,ro:.25,ji:.1,gu:.35,lp:.5},k:{
      cry:[[1.15,[{t:0,d:1.1,f:[115,165,105],v:['u','o','a'],h:.06,gu:.45,ro:.35,vib:[.03,5],rel:.4}],.62]],
      laugh:[[.76,[{t:0,d:.55,f:[95,88],v:'r',am:[.9,27],br:.6,gu:.3,h:.04},{t:.58,d:.16,f:[75,70],v:'u',a:.55,gu:1}],.52]],
      laugh2:[[.75,[...ha(3,0,.14,.1,150,138,'m',{a:.8,h:.2}),{t:.48,d:.25,f:[90,70],v:'u',a:.7,gu:1}],.5]],
      hurt:[[.22,[{t:0,d:.2,f:[160,85],v:'u',gu:.9,att:.05}],.48],[.24,[{t:0,d:.08,noise:1,v:'m',a:.7},{t:.05,d:.18,f:[150,120],v:'m',a:.85,h:.2}],.45]],
      angry:[[1.05,[{t:0,d:.42,f:[88,95],v:'o',a:.9,ro:.85,gu:.6},{t:.45,d:.58,f:[130,175,120],v:['o','a'],ro:.5,gu:.3,h:.1}],.62]],
      c_slam:[[.22,[{t:0,d:.2,f:[145,110],v:['m','u'],h:.35,br:.5}],.45]],
      c_ink:[[.22,[{t:0,d:.05,noise:1,v:'u',hs:.3},{t:.045,d:.16,f:[190,150],v:'u',a:.8}],.45]],
      c_whirl:[[.65,[{t:0,d:.62,f:[110,175,125],v:['u','o'],am:[.3,9],gu:.2}],.45]],
      c_dive:[[.45,[{t:0,d:.16,f:[100,70],v:'u',a:.8,gu:1},{t:.24,d:.18,f:[95,65],v:'u',a:.8,gu:1}],.42]],
      die:[[1.6,[{t:0,d:1.55,f:[140,110,65],v:['o','u'],gu:.9,vib:[.05,4],rel:.5}],.55]],
      win:[[.88,[...ha(3,0,.13,.1,190,175,'e',{h:.3}),{t:.45,d:.4,f:[120,80],v:'u',gu:1,a:.7}],.52]]}},
    stag:{base:{br:.35,ro:.3,ji:.06},k:{
      cry:[[1.6,[{t:0,d:1.55,f:[85,145,95],v:['o','a'],h:.1,ro:.4,vib:[.025,5],rel:.4}],.62]],
      laugh:[[.72,[{t:0,d:.1,noise:1,v:'n'},{t:.17,d:.1,noise:1,v:'n',a:.9},{t:.36,d:.32,f:[115,100],v:'m',a:.75,h:.3}],.5]],
      laugh2:[[.8,[{t:0,d:.12,noise:1,v:'n'},{t:.2,d:.55,f:[100,130,105],v:['u','o'],a:.8,h:.15}],.5]],
      hurt:[[.25,[{t:0,d:.23,f:[135,95],v:['u','o'],ro:.45,h:.15}],.48]],
      angry:[[1.7,[{t:0,d:1.65,f:[75,160,85],v:['o','a'],ro:.6,h:.08,vib:[.03,6],rel:.35}],.64]],
      c_charge:[[.56,[{t:0,d:.1,noise:1,v:'n'},{t:.14,d:.4,f:[95,105],v:'o',a:.9,ro:.9}],.48]],
      c_crystals:[[.2,[{t:0,d:.18,f:[150,130],v:'a',h:.35}],.42]],
      c_aurora:[[.85,[{t:0,d:.8,f:[110,135,115],v:['u','o'],a:.9,h:.1,ro:0,br:.5,vib:[.02,5]}],.45]],
      c_stomp:[[.2,[{t:0,d:.18,f:[130,100],v:['u','a'],h:.3,ro:.3}],.45]],
      die:[[1.9,[{t:0,d:1.85,f:[120,105,55],v:['o','u'],ro:.3,vib:[.04,4],rel:.6,br:.45}],.55]],
      win:[[1,[{t:0,d:.95,f:[95,150,110],v:['o','a'],ro:.35,h:.08}],.56]]}}};
  const BUF={},PCM={},Q=[];let busy=false,wk=null;
  const nm=(t,k,i)=>t+'.'+k+'.'+i;
  function start(n){const[t,k,i]=n.split('.'),V=VB[t],c=V&&V.k[k]&&V.k[k][+i];if(!c)return null;const C=clip(c[0],c[1],V.base,c[2]);return{n,C,J:job(C)}}
  // the clip at its own peak, with a soft end
  function finish(w){const d=w.J.out;let pk=0;for(let j=0;j<d.length;j++){const a=Math.abs(d[j]);if(a>pk)pk=a}const g=pk>1e-5?w.C.pk/pk:0,fo=Math.min(d.length,Math.floor(.02*SR));
    for(let j=0;j<d.length;j++)d[j]*=g;for(let j=0;j<fo;j++)d[d.length-1-j]*=j/fo;PCM[w.n]=d}
  // a clip needed now and not ready: made at once (only when the slices have not got to it yet)
  function make(n){if(PCM[n]||BUF[n])return;let w=wk&&wk.n===n?wk:start(n);if(!w)return;if(w===wk)wk=null;w.J.step(1e9);finish(w);const q=Q.indexOf(n);if(q>=0)Q.splice(q,1)}
  // a slice of 2 ms at a time with a pause between them (during the first rooms of the arena: nobody notices)
  function pump(){if(busy||!wk&&!Q.length)return;busy=true;setTimeout(()=>{busy=false;try{while(!wk&&Q.length){const n=Q.shift();if(!PCM[n]&&!BUF[n])wk=start(n)}
      if(wk&&wk.J.step(2)){finish(wk);wk=null}}catch(e){wk=null}pump()},wk?14:4)}
  function prep(t){const V=VB[t];if(!V)return;for(const k in V.k)V.k[k].forEach((_,i)=>{const n=nm(t,k,i);if(!PCM[n]&&!BUF[n]&&!Q.includes(n))Q.push(n)});pump()}
  const buf=n=>{if(BUF[n])return BUF[n];const d=PCM[n];if(!d||typeof AU==='undefined'||!AU.ctx)return null;const b=AU.ctx.createBuffer(1,d.length,SR);b.getChannelData(0).set(d);BUF[n]=b;delete PCM[n];return b};
  const has=(t,k)=>!!(VB[t]&&VB[t].k[k]);
  // one clip of what boss t says (kind k): when, how loud, rate (1 = its own voice), rev (the room); returns how long it lasts (0: not ready)
  function play(t,k,when,vol,rate,rev){const L0=VB[t]&&VB[t].k[k];if(!L0)return 0;let i=Math.floor(Math.random()*L0.length);if(L0.length>1&&nm(t,k,i)===play.last)i=(i+1)%L0.length;
    const n=nm(t,k,i);let b=buf(n);if(!b){make(n);b=buf(n);if(!b)return 0}
    const c=AU.ctx,s=c.createBufferSource();s.buffer=b;s.playbackRate.value=rate||1;const g=c.createGain();g.gain.value=vol;s.connect(g);route(g,null,rev||0);s.start(when);play.last=n;return b.duration/(rate||1)}
  const state=()=>({q:Q.length,wk:wk&&wk.n,pcm:Object.keys(PCM).length,buf:Object.keys(BUF).length});
  return{prep,play,has,state,VB,clip,render,job,SR}})();
// ---- the voices get ready during the first rooms of an arena with one of the four (the boss room asks again: a quick start, the tests)
{const _br=buildRoom;buildRoom=function(){const r=_br.apply(this,arguments);try{const A=G&&G.mode!=='inf'&&!G.daily&&ARENAS[G.arena||0];if(A&&A.bt)B3VO.prep(A.bt)}catch(err){}return r}}
// ---- one clip said by boss e (or its corpse): louder near, softer far (never under half), with something of its own around a few of them.
// It never talks over itself: between a move's voice or a moan and the clip before, at least 2.4 s (the cry, the rage, the mocking, the
// defeat and the laugh when you fall always come; force for the others that must)
const B3VX={cry:1,angry:1,win:1,die:1,laugh:.9,laugh2:.85,hurt:.8,chick:.7},B3PRI={cry:1,angry:1,die:1,win:1,chick:1,laugh:1,laugh2:1};
function b3say(e,k,force){if(!e||!AU.ctx||!AU.on.sfx||AU.ctx.state!=='running'||!B3VO.has(e.type,k))return 0;const S=e.b3s||(e.b3s={}),now=G&&G.t||0;
  if(!B3PRI[k]&&!force&&now-(S.talkT==null?-99:S.talkT)<2.4)return 0;let d=0;
  try{const near=Math.max(.55,enemyAt(e)),t=AU.ctx.currentTime+.01;d=B3VO.play(e.type,k,t,(B3VX[k]||.75)*near,VR(1,.03),.18);if(d){S.talkT=now;b3sayMore(e,k,t)}}catch(err){}AU.pan=0;return d}
function b3sayMore(e,k,t){const T=e.type;
  if(T==='puppeteer'){if(k==='cry'||k==='win')[72,76,79,84].forEach((m,i)=>vBox(null,t+.1+i*.09,m,.6,.035));else if(k==='laugh'||k==='laugh2')[79,76].forEach((m,i)=>vBox(null,t+.05+i*.12,m,.4,.025))}
  else if(T==='phoenix'){if(k==='cry'||k==='angry')whoosh(t,.6,600,2400,.06,.4);else if(k==='c_feathers'||k==='laugh')for(let i=0;i<2;i++)fNoise(t+i*.11,.08,'lowpass',VR(700,.2),.8,.06,{brown:true})}
  else if(T==='octopus'){if(k==='laugh'||k==='hurt'||k==='c_dive')sfx('bubble',0,e.x)}
  else if(T==='stag'){if(k==='cry'||k==='c_aurora'||k==='win')vBell(null,t+.2,[86,90,93][randi(0,2)],1.6,.03);else if(k==='laugh'||k==='laugh2')for(let i=0;i<2;i++)fThump(t+.36+i*.14,VR(90,.1),45,.12,.12)}}
// ---- the entrance: its own cry in place of the beast's growl (the shake and the rings stay)
{const _s=sfx;sfx=function(k){if(k==='roar'&&AU.b3q)return;return _s.apply(this,arguments)}}
{const _bi=bossIntro3;bossIntro3=function(e,t,t0,at,roar){if(!B3S.has(e.type))return _bi.apply(this,arguments);const roar2=()=>{AU.b3q=1;try{roar()}finally{AU.b3q=0}b3say(e,'cry')};return _bi.call(this,e,t,t0,at,roar2)}}
// the Phoenix reborn cries with its own voice too
{const _rb=roarBoss;roarBoss=function(e){if(!B3S.has(e.type))return _rb.apply(this,arguments);AU.b3q=1;try{_rb.apply(this,arguments)}finally{AU.b3q=0}b3say(e,'angry')}}
// the second phase: the angry cry
{const _bp=b3phase;b3phase=function(e){const r=_bp.apply(this,arguments);if(r)b3say(e,'angry');return r}}
// ---- each move has its voice, when it starts (you hear it coming); the Phoenix moans as it curls up into the egg
const B3CUE={puppeteer:{slam:'c_slam',strings:'c_strings',puppets:'c_puppets',vanish:'c_vanish'},phoenix:{feathers:'c_feathers',dive:'c_dive',vortex:'c_vortex',rain:'c_rain',rebirth:'hurt'},
  octopus:{slam:'c_slam',ink:'c_ink',whirl:'c_whirl',dive:'c_dive'},stag:{charge:'c_charge',crystals:'c_crystals',aurora:'c_aurora',stomp:'c_stomp'}};
{const _g=b3go;b3go=function(e,st){const prev=e.st;_g.apply(this,arguments);try{if(!B3S.has(e.type)||e.intro>0)return;
  const mv=st==='prep'?(e.type==='stag'?'charge':e.nx):prev==='prep'?null:st,c=mv&&B3CUE[e.type][mv];
  if(c)b3say(e,c,mv==='rebirth')}catch(err){}}}
// ---- the personality. The mocking gesture is the models' move 'taunt' (sprite/nemici3d/boss3.js): a piece of its own entrance, already
// seen and approved (the Puppeteer's deep bow, the Phoenix spreading its wings, the Octopus waving two tentacles with its grumpy face at
// the end, the Stag raising its head while the antlers light up), as long as the model says (its dur.taunt, in the boss's time).
// the mocking gesture is no attack: no charging ring round the boss when it starts (51-boss2-mondi.js)
B2CALM.add('taunt');
function b3boss(){if(!G||!G.enemies)return null;for(const e of G.enemies)if(B3S.has(e.type)&&!e.dead&&!(e.intro>0))return e;return null}
const b3free=e=>e.st==='walk'&&!e.hidden&&!e.air&&!(e.shell>0);
function b3taunt(e,k){const S=e.b3s||(e.b3s={});S.tauntT=G.t||0;S.pend=0;b3go(e,'taunt');e.moving=false;e.anchor=null;b3say(e,k||'laugh')}
for(const t of B3T){const f=EUPD[t];EUPD[t]=function(e,dt,sm,a,d){if(e.st!=='taunt')return f.apply(this,arguments);b3tick(e,dt);e.moving=false;e.face=a;if(e.stT<=0)b3go(e,'walk',rand(.3,.55))}}
{const _nm=n3Move;n3Move=function(e){if(B3S.has(e.type)&&e.st==='taunt'){return['taunt',Math.min(.999,Math.max(0,b3k(e)))]}return _nm.apply(this,arguments)}}
// it hits you: it mocks you (at once if it is free, or as soon as it ends its move); you fall: it laughs
{const _h=hurtP;hurtP=function(){const h0=P?P.hp:0;const r=_h.apply(this,arguments);try{if(P&&P.hp<h0){const e=b3boss();if(e){const S=e.b3s||(e.b3s={}),now=G.t||0;
  if(P.hp<=0){if(!S.won){S.won=1;b3say(e,'win')}}else if(now-(S.tauntT==null?-99:S.tauntT)>9){if(b3free(e))b3taunt(e);else S.pend=now}}}}catch(err){}return r}}
{const _u=update;update=function(dt){_u.apply(this,arguments);try{if(!G||G.state!=='play'||!started||paused)return;const e=b3boss();if(!e)return;const S=e.b3s||(e.b3s={}),now=G.t||0;
  if(P.hp>0)S.won=0;
  if(S.pend){if(now-S.pend>2.2)S.pend=0;else if(b3free(e))b3taunt(e)}
  // you keep out of its way and never hit it for a while: it calls you out
  if(S.lastHit==null)S.lastHit=now;
  if(b3free(e)&&now-S.lastHit>7&&now-(S.tauntT==null?-99:S.tauntT)>11&&now-(S.callT==null?-99:S.callT)>11){S.callT=now;b3taunt(e,'laugh2')}
  // hit hard (more than 2% of its health in a moment): a cry of pain, not too often
  if(S.hp==null)S.hp=e.hp;const lost=Math.max(0,S.hp-e.hp);S.hp=e.hp;if(lost>0)S.lastHit=now;S.acc=(S.acc||0)*Math.exp(-dt/1.2)+lost;
  if(S.acc>e.max*.02&&now-(S.hurtT==null?-99:S.hurtT)>6&&e.st!=='taunt'&&!(e.shell>0)&&b3say(e,'hurt')){S.hurtT=now;S.acc=0}}catch(err){}}}
// ---- the defeat: its last cry (and from the Phoenix's egg, the chick's «pip pip»)
for(const t of B3T){const s=BDIE[t].setup;BDIE[t].setup=function(c){s.apply(this,arguments);b3say(c,'die')}}
{const tk=B3DIE.phoenix.tick;B3DIE.phoenix.tick=function(c){const had=c.chirp;tk.apply(this,arguments);if(!had&&c.chirp)b3say(c,'chick')}}
