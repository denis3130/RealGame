// =====================================================================
// THE HEROES' VOICES AND LINES (Denis, 16 October: «Versi e battute: ogni eroe con la sua voce da cartone: attacco, Super, colpito,
// vittoria»). Cartoon voices made in code with the throat of the new bosses (B3VO.clip and B3VO.job, 88), made in slices at the start
// of a run, only for the hero in the field. Each has its own: the Archer bright, the Huntress sure of herself, the Crossbowman gruff, the
// Druid blowing softly, the Bard singing, the Alchemist cackling, the Ninja whispering, the Paladin heroic, the ice Mage old and windy,
// the Berserker roaring, the Corsair rolling his r's, the Tamer whistling to his wolf, the Monk with his «Hai!».
// When: a voice now and then as he shoots (never at every shot: at least 4.5 s between two, and only one time in two; the special blows,
// the sabre, the fourth punch, come first, 2.2 s), a cry with the Super, a moan when he is hit (one every 1.4 s at most), a cheer when
// the room is clean (one time in two) and after a boss, a «nooo» when he falls.
// The lines: a speech bubble over his head with a short sentence (and the voice babbling as in the cartoons), at the start of the run,
// when the boss arrives, after the boss, when the health goes under 30% and when he gets up again; now and then when he cleans a room.
// Never two bubbles one on the other: at least 6 s between them (after the boss and when he gets up, always). Off in the trailer.
// =====================================================================
const HV=(()=>{const SR=B3VO.SR,PCM={},BUF={},Q=[];let wk=null,busy=false;
  // a seeded random (the babble of each hero is always the same)
  const rng=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
  // the voice of each one: f the pitch (Hz), vw its vowels, base the throat (breath, rasp, crooked pulses, brightness), rate the playback
  // (above 1 the mouth is smaller: a younger or lighter voice), sing (the Bard), whisper (the Ninja)
  const PF={
    arciere:{f:230,vw:['a','e','o'],base:{br:.15,ji:.03,lp:.6},rate:1.04},
    cacciatrice:{f:318,vw:['e','a','i'],base:{br:.22,ji:.03,lp:.65},rate:1.12},
    balestriere:{f:124,vw:['o','a','u'],base:{br:.2,ro:.3,ji:.05,lp:.5},rate:.96},
    druida:{f:118,vw:['o','u','m'],base:{br:.45,ji:.03,lp:.5},rate:.97},
    bardo:{f:208,vw:['a','o','e'],base:{br:.12,ji:.02,lp:.62},rate:1.04,sing:1},
    alchimista:{f:262,vw:['e','i','a'],base:{br:.18,ji:.08,lp:.68},rate:1.06},
    ninja:{f:180,vw:['h','u','i'],base:{br:.6,hs:.4,lp:.6},rate:1,whisper:1},
    paladino:{f:140,vw:['a','o','e'],base:{br:.15,ro:.08,ji:.03,lp:.55},rate:.98},
    mago:{f:176,vw:['o','u','e'],base:{br:.5,ji:.06,lp:.55},rate:1},
    berserker:{f:100,vw:['a','o','u'],base:{br:.3,ro:.5,ji:.08,lp:.5},rate:.93},
    corsaro:{f:135,vw:['a','r','o'],base:{br:.25,ro:.35,ji:.06,lp:.52},rate:.97},
    domatore:{f:165,vw:['e','a','o'],base:{br:.2,ro:.1,ji:.04,lp:.58},rate:1},
    monaco:{f:190,vw:['a','i','o'],base:{br:.15,ji:.02,lp:.6},rate:1}};
  // n syllables of a laugh from fa down to fb, one every step seconds
  const ha=(n,step,d,fa,fb,v,o)=>[...Array(n)].map((_,i)=>{const f=fa+(fb-fa)*i/Math.max(1,n-1);return{t:i*step,d,f:[f*1.05,f*.94],v:Array.isArray(v)?v[i%v.length]:v,a:1-i*.07,h:.3,...(o||{})}});
  // the babble that goes with a line: a few syllables that rise at the end, sung by the Bard, whispered by the Ninja
  function babble(id,p,k){const r=rng(id.length*977+k*131+(p.f|0)),n=4+((r()*3)|0),out=[];let t=0;const PEN=[1,1.125,1.25,1.5,1.667];
    for(let i=0;i<n;i++){const last=i===n-1,d=p.sing?.12+r()*.05:.07+r()*.045,up=last?1.18:1,f0=p.sing?p.f*PEN[(r()*5)|0]:p.f*(.92+r()*.36)*up;
      let v=p.vw[(r()*p.vw.length)|0];if(v==='h')v='u';
      out.push(p.whisper?{t,d,noise:1,v:['i','u','e'][(r()*3)|0],a:.7+r()*.3,hs:.3}:{t,d,f:[f0,f0*(last?1.12:.96)],v,a:.75+r()*.25,h:.15,att:.12,rel:.3,vib:p.sing?[.03,6]:null});
      t+=d+(p.sing?.03:.025+r()*.03)}
    return[t+.05,out,.42]}
  // what each one says (kind → variants [seconds, syllables, peak]): att the shot, hurt, ult the Super, win, die, talk with a line
  function lib(id){const p=PF[id]||PF.arciere,f=p.f,ro=(p.base.ro||0),br=(p.base.br||0);if(p.lib)return p.lib;
    const W=p.whisper?{
        att:[[.2,[{t:0,d:.18,noise:1,v:'i',hs:.9,a:.9}],.38],[.22,[{t:0,d:.06,noise:1,v:'h',a:.6},{t:.05,d:.15,noise:1,v:'u',hs:.6,a:.9}],.38]],
        hurt:[[.2,[{t:0,d:.18,noise:1,v:'u',a:.8}],.36],[.16,[{t:0,d:.14,noise:1,v:'h',hs:.5,a:.8}],.36]],
        ult:[[.62,[{t:0,d:.58,noise:1,v:['h','i'],hs:.8,a:1}],.44]],
        win:[[.36,[{t:0,d:.08,noise:1,v:'m',a:.6},{t:.12,d:.22,noise:1,v:'u',a:.8}],.36]],
        die:[[.8,[{t:0,d:.76,noise:1,v:['u','h'],a:.8}],.38]]}:{
        att:[[.2,[{t:0,d:.18,f:[f*1.12,f*1.32,f*1.02],v:p.vw[0],h:.28,att:.05,rel:.38}],.5],
          [.24,[{t:0,d:.22,f:[f*1.05,f*1.38,f*1.08],v:['i',p.vw[0]],h:.18,att:.05,rel:.36}],.5]],
        hurt:[[.2,[{t:0,d:.18,f:[f*1.25,f*.86],v:['u','o'],h:.1,ro:ro+.25,att:.04}],.46],
          [.24,[{t:0,d:.22,f:[f*1.35,f*1.1,f*.95],v:['a','i'],h:.06,att:.04,rel:.4}],.46]],
        ult:[[.8,[{t:0,d:.1,noise:1,v:'h',a:.5},{t:.08,d:.7,f:[f*1.08,f*1.55,f*1.3],v:[p.vw[0],p.vw[0],'o'],vib:[.03,6],att:.08,rel:.3}],.56]],
        win:[[.5,[{t:0,d:.46,f:[f*1.1,f*1.6,f*1.25],v:['i','e','a'],vib:[.02,7],att:.08,rel:.35}],.52]],
        die:[[.95,[{t:0,d:.9,f:[f*1.3,f*1.12,f*.62],v:['n','o','u'],vib:[.045,5],br:br+.2,att:.1,rel:.5}],.5]]};
    // their own touches
    if(id==='bardo'){W.win=[[.78,[{t:0,d:.16,f:[f,f],v:'a',h:.2},{t:.2,d:.16,f:[f*1.125,f*1.125],v:'a',h:.2},{t:.4,d:.36,f:[f*1.5,f*1.5],v:'a',vib:[.035,6],h:.15,rel:.4}],.5]];
      W.ult=[[.9,[{t:0,d:.86,f:[f*1.25,f*1.5,f*1.5],v:['o','a'],vib:[.04,6],att:.1,rel:.3}],.54]]}
    if(id==='alchimista')W.win=[[.72,[...ha(5,.12,.09,f*1.5,f*1.2,['e','i']),{t:.62,d:.1,f:[f*1.1,f],v:'e',a:.6}],.5]];
    if(id==='corsaro'){W.win=[[.8,[...ha(3,.15,.11,f*1.35,f*1.15,'a',{ro:.5}),{t:.46,d:.32,f:[f*1.1,f*.95],v:'r',am:[.9,26],a:.85}],.52]];W.att[1]=[.28,[{t:0,d:.26,f:[f*1.1,f*.98],v:'r',am:[.85,25],h:.1}],.5]}
    if(id==='berserker'){W.ult=[[1.05,[{t:0,d:1,f:[f*.9,f*1.5,f*1.1],v:['a','a','o'],ro:.75,br:.4,vib:[.04,7],att:.06,rel:.25}],.6]];W.win=[[.62,[{t:0,d:.58,f:[f*1.1,f*1.6,f*1.2],v:['a','o'],ro:.65,att:.06,rel:.3}],.58]]}
    if(id==='domatore')W.win=[[.6,[{t:0,d:.2,f:[1250,1500],v:'B',tn:1,att:.1,rel:.3},{t:.28,d:.28,f:[1500,1180],v:'B',tn:1,att:.1,rel:.35}],.3]];
    if(id==='druida')W.win=[[.6,[{t:0,d:.56,f:[f*.95,f*1.25,f*1.1],v:'m',br:.5,att:.15,rel:.4}],.45]];
    if(id==='mago'){W.win=[[.75,ha(3,.2,.15,f*1.3,f*1.1,'o',{br:.5}),.5]];W.hurt[1]=[.3,[{t:0,d:.28,f:[f*1.2,f*1.05],v:'r',am:[.9,24],br:.5}],.45]}
    if(id==='balestriere')W.win=[[.42,[{t:0,d:.08,noise:1,v:'n',a:.8},{t:.1,d:.28,f:[f*1.05,f*.92],v:'m',h:.1}],.46]];
    if(id==='monaco'){W.att=[[.18,[{t:0,d:.16,f:[f*1.3,f*1.5,f*1.2],v:['a','i'],att:.03,rel:.3}],.52],[.2,[{t:0,d:.17,f:[f*1.25,f*1.45,f*1.15],v:['o','i'],att:.03,rel:.3}],.52]];
      W.ult=[[.95,[...[0,1,2].map(i=>({t:i*.16,d:.12,f:[f*(1.3+i*.05),f*(1.4+i*.05)],v:['a','i'],att:.03,rel:.3})),{t:.5,d:.42,f:[f*1.4,f*1.7,f*1.45],v:'a',att:.05,rel:.35}],.56]]}
    if(id==='paladino')W.win=[[.6,[{t:0,d:.2,f:[f*1.2,f*1.35],v:'a',h:.2},{t:.26,d:.32,f:[f*1.45,f*1.25],v:'a',vib:[.02,6],rel:.4}],.52]];
    if(id==='cacciatrice')W.win=[[.36,[{t:0,d:.32,f:[f*1.25,f*1.05],v:'a',h:.35,att:.05,rel:.4}],.5]];
    W.talk=[babble(id,p,0),babble(id,p,1)];
    p.lib=W;return W}
  const nm=(h,k,i)=>h+'.'+k+'.'+i;
  function start(n){const[h,k,i]=n.split('.'),c=lib(h)[k]&&lib(h)[k][+i];if(!c)return null;const C=B3VO.clip(c[0],c[1],(PF[h]||PF.arciere).base,c[2]);return{n,C,J:B3VO.job(C)}}
  function finish(w){const d=w.J.out;let pk=0;for(let j=0;j<d.length;j++){const a=Math.abs(d[j]);if(a>pk)pk=a}const g=pk>1e-5?w.C.pk/pk:0,fo=Math.min(d.length,Math.floor(.02*SR));
    for(let j=0;j<d.length;j++)d[j]*=g;for(let j=0;j<fo;j++)d[d.length-1-j]*=j/fo;PCM[w.n]=d}
  function make(n){if(PCM[n]||BUF[n])return;let w=wk&&wk.n===n?wk:start(n);if(!w)return;if(w===wk)wk=null;w.J.step(1e9);finish(w);const q=Q.indexOf(n);if(q>=0)Q.splice(q,1)}
  function pump(){if(busy||!wk&&!Q.length)return;busy=true;setTimeout(()=>{busy=false;try{while(!wk&&Q.length){const n=Q.shift();if(!PCM[n]&&!BUF[n])wk=start(n)}
      if(wk&&wk.J.step(2)){finish(wk);wk=null}}catch(e){wk=null}pump()},wk?14:4)}
  function prep(h){if(!PF[h])return;const W=lib(h);for(const k in W)W[k].forEach((_,i)=>{const n=nm(h,k,i);if(!PCM[n]&&!BUF[n]&&!Q.includes(n))Q.push(n)});pump()}
  const buf=n=>{if(BUF[n])return BUF[n];const d=PCM[n];if(!d||typeof AU==='undefined'||!AU.ctx)return null;const b=AU.ctx.createBuffer(1,d.length,SR);b.getChannelData(0).set(d);BUF[n]=b;delete PCM[n];return b};
  let last='',until=0;
  // one clip of what hero h says (kind k); a voice never talks over itself, but the Super, the fall and the moan cut in
  function play(h,k,vol){const W=PF[h]&&lib(h),L0=W&&W[k];if(!L0||!AU.ctx||!AU.on.sfx||AU.ctx.state!=='running')return 0;const now=AU.ctx.currentTime;
    if(now<until-.04&&k!=='ult'&&k!=='die'&&k!=='hurt')return 0;let i=Math.floor(Math.random()*L0.length);if(L0.length>1&&nm(h,k,i)===last)i=(i+1)%L0.length;
    const n=nm(h,k,i);let b=buf(n);if(!b){make(n);b=buf(n);if(!b)return 0}
    const c=AU.ctx,s=c.createBufferSource();s.buffer=b;const rate=PF[h].rate*VR(1,.025);s.playbackRate.value=rate;const g=c.createGain();g.gain.value=vol;s.connect(g);
    AU.pan=0;route(g,null,.1);s.start(now+.01);last=n;until=now+.01+b.duration/rate;return b.duration/rate}
  return{prep,play,lib,PF,state:()=>({q:Q.length,wk:wk&&wk.n,pcm:Object.keys(PCM).length,buf:Object.keys(BUF).length})}})();
// ---- the lines (short: they go in a bubble). start, boss (it arrives), win (after the boss), low (under 30%), revive, room (clean)
const HLINE={
  arciere:{start:'Si parte!',boss:'Non ho paura di te!',win:'Evvai!',low:'Devo resistere…',revive:'Non è finita!',room:['Tutti a terra!','Pulito!','Avanti!']},
  cacciatrice:{start:'Caccia aperta!',boss:'Che bella preda!',win:'Presa!',low:'Mi hai graffiata…',revive:'Ancora in piedi!',room:['Troppo lenti!','Facile!','La prossima!']},
  balestriere:{start:'In posizione.',boss:'Bersaglio grosso.',win:'Bersaglio abbattuto.',low:'Non ancora…',revive:'Un soldato non molla.',room:['Zona libera.','Avanzo.','Ricarico.']},
  druida:{start:'La foresta è con me.',boss:'Torna alla terra.',win:'Riposa, ora.',low:'Respira, piccola foglia…',revive:"Rinasco come l'erba.",room:['Il bosco tace.','Pace, radici.','Avanti, con calma.']},
  bardo:{start:'Musica, maestro!',boss:'Una ballata per te!',win:'Bis! Bis!',low:'Che stonatura…',revive:'Il concerto continua!',room:['Applausi, prego!','Che ritmo!','Do, re, mi!']},
  alchimista:{start:'Esperimento numero uno!',boss:'Che bel campione!',win:'Formula perfetta!',low:'Questa brucia…',revive:'La formula funziona!',room:['Tutto nel calderone!','Interessante…','Altro esperimento!']},
  ninja:{start:'…',boss:'Ti vedo.',win:'Svanito.',low:'Tsk.',revive:"Un'ombra non muore.",room:['…','Silenzio.','Ombra.']},
  paladino:{start:'Per la luce!',boss:'La luce ti fermerà!',win:'La luce vince!',low:'Lo scudo regge…',revive:'La luce mi rialza!',room:['Tutto tranquillo.','Avanti, compagni!','Giustizia!']},
  mago:{start:'Che freddo… per voi!',boss:'Ti gelo la barba!',win:'Ghiacciato!',low:'Brrr… che botta.',revive:'Il ghiaccio non si scioglie!',room:['Raffreddati!','Un bel freschino.','Neve per tutti!']},
  berserker:{start:'AAARGH!',boss:'UNO GROSSO, FINALMENTE!',win:'ANCORA! ANCORA!',low:'SOLLETICO!',revive:'NON BASTA!',room:['Chi è il prossimo?!','TROPPO FACILE!','DI PIÙ!']},
  corsaro:{start:"All'arrembaggio!",boss:'Bel bottino, tu!',win:'Il tesoro è mio!',low:'Per mille balene…',revive:'Un pirata torna sempre!',room:['Ciurma, avanti!','Arrr!','Tutti a bordo!']},
  domatore:{start:'Zanna, con me!',boss:'Zanna, quello grosso!',win:'Bravo, Zanna!',low:'Giù le zampe!',revive:'Zanna, sono qui!',room:['A cuccia, tutti!','Bravo lupo!','Si va, Zanna!']},
  monaco:{start:'Respira.',boss:'Il tuo spirito è agitato.',win:'Equilibrio.',low:'Il dolore passa.',revive:'Mi rialzo, come sempre.',room:['Pace.','Un passo alla volta.','Silenzio della mente.']}};
const HVOL={att:.42,hurt:.5,ult:.66,win:.55,die:.62,talk:.46};
const hvOn=()=>!!(G&&P&&!INTRO.on&&G.mode!==undefined);
function hvSay(k){if(!hvOn())return 0;try{return HV.play(P.hero,k,HVOL[k]||.5)}catch(e){return 0}}
// a bubble with the line (and the babble)
function hvLine(k,force){if(!hvOn())return;const L=HLINE[P.hero]||HLINE.arciere,s=L[k];if(!s)return;const now=G.t||0;
  if(!force&&now-(G.hvT==null?-99:G.hvT)<6)return;const t=Array.isArray(s)?s[(Math.random()*s.length)|0]:s;G.hvT=now;G.hvb={t:0,max:Math.max(1.7,.9+t.length*.06),s:t,k};if(k!=='win')hvSay('talk')}
// ---- the voices get ready at the start of the run (and at every room, in case the hero changed: the tests)
{const _br=buildRoom;buildRoom=function(){const r=_br.apply(this,arguments);try{if(G&&P&&!INTRO.on){HV.prep(P.hero);G.hvb=null;if(G.room===1&&!G.event&&!G.hvStarted){G.hvStarted=1;G.hvStart=.9}}}catch(e){}return r}}
// ---- the shot: now and then (the special blows first)
let HVSHOT=-99;
function hvShot(special){if(!hvOn()||G.state!=='play')return;const now=G.t||0,gap=special?2.2:4.5;if(now-HVSHOT<gap)return;if(!special&&Math.random()>.5){HVSHOT=now-2;return}HVSHOT=now;hvSay('att')}
{const _v=volley;volley=function(){const r=_v.apply(this,arguments);try{hvShot(false)}catch(e){}return r}}
if(typeof slashStart==='function'){const _s=slashStart;slashStart=function(){const r=_s.apply(this,arguments);try{hvShot(true)}catch(e){}return r}}
if(typeof shockRing==='function'){const _s=shockRing;shockRing=function(){const r=_s.apply(this,arguments);try{hvShot(true)}catch(e){}return r}}
// ---- hit: a moan (and a line the first time the health goes under 30%)
let HVHURT=-99;
{const _h=hurtP;hurtP=function(){const h0=P?P.hp:0;const r=_h.apply(this,arguments);try{if(hvOn()&&P.hp<h0&&P.hp>0){const now=G.t||0;if(now-HVHURT>1.4&&Math.random()<.75){HVHURT=now;hvSay('hurt')}
  if(h0>=P.maxhp*.3&&P.hp<P.maxhp*.3&&now-(G.hvLow==null?-99:G.hvLow)>25){G.hvLow=now;setTimeout(()=>{if(G&&P&&P.hp>0)hvLine('low')},450)}}}catch(e){}return r}}
// ---- the Super
{const _u=useUlt;useUlt=function(){const was=P&&P.ult;const r=_u.apply(this,arguments);try{if(P&&was>=100&&P.ult<100)hvSay('ult')}catch(e){}return r}}
// ---- he falls (a «nooo»), or he gets up again (a line)
{const _d=die;die=function(){const r=_d.apply(this,arguments);try{if(hvOn()){if(G.state==='dead')hvSay('die');else if(P.hp>0)setTimeout(()=>hvLine('revive',true),500)}}catch(e){}return r}}
// ---- the start of the run, the boss that arrives, the clean room and the boss beaten, the comeback after a revive
{const _u=update;update=function(dt){const st0=G&&G.state;_u.apply(this,arguments);try{if(!hvOn())return;
  if(G.hvb){G.hvb.t+=dt;if(G.hvb.t>=G.hvb.max)G.hvb=null}
  if(G.hvStart>0&&G.state==='play'){G.hvStart-=dt;if(G.hvStart<=0){G.hvStart=0;hvLine('start',true)}}
  const boss=G.enemies.find(e=>isBoss(e.type)&&!e.dead);if(boss){G.hvBoss=1;if(boss.intro>0)boss.hvIn=1;else if(boss.hvIn){boss.hvIn=0;setTimeout(()=>hvLine('boss',true),700)}}
  if(st0==='play'&&G.state==='cleared'&&!G.event){if(G.hvBoss){G.hvBoss=0;hvSay('win');setTimeout(()=>hvLine('win',true),350)}else{if(Math.random()<.5)hvSay('win');if(Math.random()<.3)hvLine('room')}}
  if(st0==='dead'&&G.state==='play'&&P.hp>0)setTimeout(()=>hvLine('revive',true),400)}catch(e){}}}
// ---- the bubble: over his head, inside the screen, with a little tail towards him; it pops in and fades out
function hvBubbleDraw(){const b=G&&G.hvb;if(!b||!P||G.state==='dead')return;const u=b.t,a=Math.max(0,Math.min(1,(b.max-u)/.25)),pop=u<.16?.4+.7*(u/.16):u<.26?1.1-.1*(u-.16)/.1:1;
  ctx.save();ctx.font='13px "Lilita One", sans-serif';const tw=ctx.measureText(b.s).width,w=tw+18,h=23,vx=G.vx||0,
    x=Math.max(vx+w/2+6,Math.min(vx+VW-w/2-6,P.x)),y=P.y-70;
  ctx.globalAlpha=a;ctx.translate(x,y);ctx.scale(pop,pop);
  const rr=10,x0=-w/2,y0=-h/2,tx=Math.max(x0+12,Math.min(x0+w-12,P.x-x));
  ctx.beginPath();ctx.moveTo(x0+rr,y0);ctx.lineTo(x0+w-rr,y0);ctx.quadraticCurveTo(x0+w,y0,x0+w,y0+rr);ctx.lineTo(x0+w,y0+h-rr);ctx.quadraticCurveTo(x0+w,y0+h,x0+w-rr,y0+h);
  ctx.lineTo(tx+5,y0+h);ctx.lineTo(tx-1,y0+h+8);ctx.lineTo(tx-6,y0+h);ctx.lineTo(x0+rr,y0+h);ctx.quadraticCurveTo(x0,y0+h,x0,y0+h-rr);ctx.lineTo(x0,y0+rr);ctx.quadraticCurveTo(x0,y0,x0+rr,y0);ctx.closePath();
  ctx.fillStyle=b.k==='win'||b.k==='boss'?'#fff3c4':'#fff8ea';ctx.fill();ctx.lineWidth=2.6;ctx.strokeStyle=INK;ctx.stroke();
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=INK;ctx.fillText(b.s,0,.5);ctx.restore()}
{const _db=drawBars;drawBars=function(){const r=_db.apply(this,arguments);try{if(!INTRO.on)hvBubbleDraw()}catch(e){}return r}}
