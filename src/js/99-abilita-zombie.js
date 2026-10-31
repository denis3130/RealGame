// =====================================================================
// 99. LE ABILITÀ DELLA MODALITÀ ZOMBIE (Denis, 12 ottobre: «nella modalità zombie si potranno anche scegliere e sbloccare delle abilità
// (per esempio lo scatto), con al massimo 3 abilità equipaggiate insieme»; 31 ottobre, alla domanda «cosa possiamo migliorare?»: «Abilità
// zombie»). Sei abilità: lo Scatto c'è da subito, le altre si sbloccano nell'Arsenale (sezione «Abilità») con oro e Rottami, quando il
// record di round arriva al loro numero. Se ne portano tre in partita: tre bottoni rotondi in basso a destra (sulla tastiera 1, 2, 3),
// ognuno col suo tempo di ricarica che gira come un orologio. Il terzo che porti prende il posto del primo, come i compagni.
// - Scatto: un balzo dove vai (da fermo, via dallo zombie più vicino); per un attimo non ti toccano.
// - Bomba incendiaria: una bottiglia sul gruppo di zombie più vicino; la terra brucia per 4 secondi.
// - Rintocco: una campana a morto; gli zombie vicini volano indietro e restano storditi (i boss no).
// - Tagliola: resta dove stai; il primo zombie che la pesta resta preso 5 secondi e si fa male (al massimo due).
// - Adrenalina: per 7 secondi corri più veloce e ricarichi al doppio.
// - Benda: ti fasci le ferite e torni in forze.
// Si attacca alla partita (partita.js) avvolgendo ZM.partita: update, reset e i disegni del direttore. Tutto rispetta LOWFX.
// =====================================================================
const ZAB=[
  {id:'scatto',n:'Scatto',d:'Un balzo veloce dove vai; da fermo, via dallo zombie più vicino. Per un attimo non ti toccano.',cd:5,oro:0,rot:0,rec:0,col:'#8fd0ff'},
  {id:'bomba',n:'Bomba incendiaria',d:'Lanci una bottiglia sul gruppo di zombie più vicino: la terra brucia per 4 secondi.',cd:16,oro:900,rot:40,rec:3,col:'#ff9a3a'},
  {id:'rintocco',n:'Rintocco',d:'Suoni una campana a morto: gli zombie vicini volano indietro e restano storditi (i boss no).',cd:14,oro:1300,rot:70,rec:6,col:'#cdb8ff'},
  {id:'tagliola',n:'Tagliola',d:'Lasci una tagliola dove stai: il primo zombie che la pesta resta preso e si fa male. Al massimo due.',cd:9,oro:1800,rot:100,rec:9,col:'#c9ced6'},
  {id:'adrenalina',n:'Adrenalina',d:'Per 7 secondi corri più veloce e ricarichi al doppio.',cd:28,oro:2500,rot:140,rec:12,col:'#ff5a6a'},
  {id:'benda',n:'Benda',d:'Ti fasci le ferite: in un secondo torni in forze (più di metà della vita).',cd:32,oro:3400,rot:190,rec:15,col:'#8ff0a8'}];
const ZAB_BY=Object.fromEntries(ZAB.map(a=>[a.id,a]));
// ------------------------------------------------------------------ il salvataggio: SAVE.z.ab = {own: {id: 1}, eq: [id|null ×3]}
function zabSave(){if(typeof SAVE==='undefined')return{own:{scatto:1,bomba:1,rintocco:1},eq:['scatto','bomba','rintocco']};const z=SAVE.z||(SAVE.z={});
  if(!z.ab||typeof z.ab!=='object')z.ab={own:{scatto:1},eq:['scatto',null,null]};const A=z.ab;if(!A.own||typeof A.own!=='object')A.own={};A.own.scatto=1;
  if(!Array.isArray(A.eq))A.eq=['scatto',null,null];const seen={};A.eq=A.eq.slice(0,3).map(id=>id&&ZAB_BY[id]&&A.own[id]&&!seen[id]?(seen[id]=1,id):null);while(A.eq.length<3)A.eq.push(null);return A}
const zabRec=()=>typeof SAVE==='undefined'?99:SAVE.zRec||0;
function zabCanBuy(a){return zabRec()>=a.rec&&SAVE.gold>=a.oro&&(SAVE.mat&&SAVE.mat.rot||0)>=a.rot}
function zabBuy(id){const a=ZAB_BY[id],A=zabSave();if(!a||A.own[id]||!zabCanBuy(a))return false;SAVE.gold-=a.oro;SAVE.mat.rot-=a.rot;A.own[id]=1;
  if(!A.eq.includes(id)){const i=A.eq.indexOf(null);if(i>=0)A.eq[i]=id}save();return true}
function zabWear(id){const A=zabSave();if(!A.own[id]||A.eq.includes(id))return;const i=A.eq.indexOf(null);if(i>=0)A.eq[i]=id;else{A.eq.shift();A.eq.push(id)}save()}
function zabTakeOff(id){const A=zabSave(),i=A.eq.indexOf(id);if(i>=0){A.eq[i]=null;save()}}
// ------------------------------------------------------------------ le icone: disegnate col contorno scuro del gioco, una volta sola
const ZABI={};
function zabIcon(id,sz){const k=id+sz;if(ZABI[k])return ZABI[k];const d=Math.min(2,window.devicePixelRatio||1),c=document.createElement('canvas');c.width=c.height=Math.round(sz*d);
  const g=c.getContext('2d');g.scale(sz*d/64,sz*d/64);g.lineJoin='round';g.lineCap='round';const ink=w=>{g.strokeStyle=INK;g.lineWidth=w},fs=(f,w)=>{g.fillStyle=f;g.fill();ink(w||3);g.stroke()};
  if(id==='scatto'){// a boot in a leap, three speed lines behind it
    g.strokeStyle='#8fd0ff';g.lineWidth=4;for(const[y,x0] of[[22,8],[32,4],[42,10]]){g.beginPath();g.moveTo(x0,y);g.lineTo(x0+14,y);g.stroke()}
    g.beginPath();g.moveTo(28,12);g.lineTo(42,12);g.lineTo(42,36);g.quadraticCurveTo(58,38,58,46);g.lineTo(58,50);g.lineTo(26,50);g.lineTo(26,40);g.quadraticCurveTo(30,30,28,12);g.closePath();fs('#7a5a3a');
    g.beginPath();g.moveTo(26,46);g.lineTo(58,46);ink(2.4);g.stroke();g.fillStyle='rgba(255,230,190,.35)';g.fillRect(31,15,4,20);
    g.beginPath();g.moveTo(26,50);g.lineTo(58,50);g.lineTo(58,54);g.lineTo(26,54);g.closePath();fs('#3a2a1e',2.6)}
  else if(id==='bomba'){// a bottle with a burning rag
    g.beginPath();g.moveTo(27,20);g.lineTo(37,20);g.lineTo(37,28);g.quadraticCurveTo(48,32,48,44);g.lineTo(48,52);g.quadraticCurveTo(48,58,42,58);g.lineTo(22,58);g.quadraticCurveTo(16,58,16,52);g.lineTo(16,44);g.quadraticCurveTo(16,32,27,28);g.closePath();fs('#3f7a52');
    g.fillStyle='rgba(220,255,200,.35)';g.fillRect(21,38,4,14);g.beginPath();g.rect(17,44,30,8);fs('#c9b48a',2.2);
    g.beginPath();g.moveTo(29,20);g.quadraticCurveTo(24,10,30,4);g.quadraticCurveTo(33,10,36,6);g.quadraticCurveTo(42,14,35,20);g.closePath();fs('#ffb13a',2.4);g.beginPath();g.moveTo(31,19);g.quadraticCurveTo(29,13,32,9);g.quadraticCurveTo(35,14,33,19);g.closePath();g.fillStyle='#fff3b0';g.fill()}
  else if(id==='rintocco'){// a bell with its clapper and two rings of sound
    g.strokeStyle='#cdb8ff';g.lineWidth=3;for(const r of[24,30]){g.beginPath();g.arc(32,34,r,-.6,.6);g.stroke();g.beginPath();g.arc(32,34,r,Math.PI-.6,Math.PI+.6);g.stroke()}
    g.beginPath();g.moveTo(32,8);g.quadraticCurveTo(46,10,46,30);g.lineTo(46,40);g.quadraticCurveTo(50,44,52,48);g.lineTo(12,48);g.quadraticCurveTo(14,44,18,40);g.lineTo(18,30);g.quadraticCurveTo(18,10,32,8);g.closePath();fs('#b59a5a');
    g.fillStyle='rgba(255,240,200,.45)';g.fillRect(23,16,4,22);g.beginPath();g.arc(32,52,5,0,TAU);fs('#7a6234',2.4);g.beginPath();g.arc(32,7,3.5,0,TAU);fs('#7a6234',2.2)}
  else if(id==='tagliola'){// the open jaws of a trap, the teeth
    g.beginPath();g.ellipse(32,40,24,10,0,0,TAU);fs('#6a6e76');g.beginPath();g.ellipse(32,40,15,5.5,0,0,TAU);g.fillStyle='#3a3d43';g.fill();ink(2);g.stroke();
    for(const sd of[-1,1]){g.beginPath();g.moveTo(8,40);g.quadraticCurveTo(32,40+sd*-34,56,40);ink(5);g.stroke();g.strokeStyle='#a9aeb7';g.lineWidth=2.4;g.stroke();
      g.fillStyle='#e8ecf0';for(let i=0;i<5;i++){const u=.2+i*.15,x=8+48*u,y=40-sd*34*2*u*(1-u);g.beginPath();g.moveTo(x-2.6,y);g.lineTo(x,y+sd*6);g.lineTo(x+2.6,y);g.closePath();g.fill();ink(1.2);g.stroke()}}
    g.beginPath();g.arc(32,40,3.4,0,TAU);fs('#c9b48a',2)}
  else if(id==='adrenalina'){// a heart with a lightning bolt
    g.beginPath();g.moveTo(32,56);g.bezierCurveTo(6,40,6,14,22,14);g.bezierCurveTo(28,14,32,20,32,24);g.bezierCurveTo(32,20,36,14,42,14);g.bezierCurveTo(58,14,58,40,32,56);g.closePath();fs('#d8343e');
    g.fillStyle='rgba(255,220,220,.4)';g.beginPath();g.ellipse(21,24,4,6,-.5,0,TAU);g.fill();
    g.beginPath();g.moveTo(35,16);g.lineTo(24,36);g.lineTo(32,36);g.lineTo(27,52);g.lineTo(42,30);g.lineTo(34,30);g.lineTo(39,16);g.closePath();fs('#ffd84a',2.4)}
  else if(id==='benda'){// a rolled bandage with a cross on it
    g.beginPath();g.moveTo(10,46);g.quadraticCurveTo(26,58,52,40);g.lineTo(56,46);g.quadraticCurveTo(30,64,12,52);g.closePath();fs('#e9e2d0',2.4);
    g.beginPath();g.ellipse(36,30,18,16,0,0,TAU);fs('#f1ead8');g.beginPath();g.ellipse(36,30,7,6,0,0,TAU);fs('#cfc5ad',2);
    g.strokeStyle='rgba(120,100,70,.35)';g.lineWidth=1.4;g.beginPath();g.ellipse(36,30,12.5,11,0,0,TAU);g.stroke();
    g.beginPath();g.rect(13,10,14,4.6);g.rect(17.7,5.3,4.6,14);g.fillStyle='#d8343e';g.fill();ink(1.6);g.beginPath();g.moveTo(17.7,5.3);g.lineTo(22.3,5.3);g.lineTo(22.3,10);g.lineTo(27,10);g.lineTo(27,14.6);g.lineTo(22.3,14.6);g.lineTo(22.3,19.3);g.lineTo(17.7,19.3);g.lineTo(17.7,14.6);g.lineTo(13,14.6);g.lineTo(13,10);g.lineTo(17.7,10);g.closePath();g.stroke()}
  return ZABI[k]=c.toDataURL()}
// ------------------------------------------------------------------ la partita: lo stato delle abilità
const ZABS={eq:[null,null,null],cd:[0,0,0],dash:null,bottles:[],fires:[],traps:[],rings:[],bells:[],pluses:[],puffs:[],adr:0,heal:0,last:0,ui:null,started:false};
const zabD=()=>ZM.W.director;
function zabSnd(w){try{if(typeof AU==='undefined'||!AU.ctx||!AU.on.sfx)return;const t=AU.ctx.currentTime+.01;AU.pan=0;
  if(w==='scatto'){whoosh(t,.28,500,2600,.32,.15);fThump(t,140,70,.08,.25)}
  else if(w==='lancio'){whoosh(t,.35,700,1800,.2,.1)}
  else if(w==='vetro'){M.glass(t,1.1,2300);M.glass(t+.03,.8,3100);fNoise(t,.5,'bandpass',900,.7,.35,{f2:300,att:.02});fThump(t,90,50,.4,.5,.3)}
  else if(w==='rintocco'){vBell(null,t,38,4.5,.55);vBell(null,t+.02,50,3,.25);vChoir(null,t+.15,[38,45,50],2.6,.07);fThump(t,70,36,.6,.5,.5)}
  else if(w==='posa'){M.metal(t,.8,520,.6);M.wood(t+.04,.5,240)}
  else if(w==='scatta'){M.metal(t,1.4,700,1.2);M.metal(t+.02,1,1100,.8);fThump(t,160,60,.12,.5,.2)}
  else if(w==='adrenalina'){fThump(t,62,40,.18,.8,.2);fThump(t+.22,62,40,.18,.7,.2);whoosh(t+.05,.6,300,1400,.18,.3)}
  else if(w==='cuore'){fThump(t,58,38,.14,.38,.1);fThump(t+.18,58,38,.14,.3,.1)}
  else if(w==='benda'){fNoise(t,.22,'bandpass',2600,.9,.22,{f2:1400});fNoise(t+.25,.18,'bandpass',2200,.9,.18,{f2:1200});vBell(null,t+.35,79,1.2,.08);vBell(null,t+.48,84,1.2,.06)}
  else if(w==='no'){fThump(t,180,120,.06,.18)}}catch(e){}}
function zabReset(){const A=zabSave();ZABS.eq=A.eq.slice();ZABS.cd=[0,0,0];ZABS.dash=null;ZABS.bottles=[];ZABS.fires=[];ZABS.traps=[];ZABS.rings=[];ZABS.bells=[];ZABS.pluses=[];ZABS.puffs=[];
  zabAdrEnd();ZABS.heal=0;ZABS.started=true;zabBuildUI()}
// adrenaline goes through the hook of the modifiers: the luck cards rebuild W.mods every frame (fortuna.js applyMods, then ZM.modsHook,
// where the elixirs add theirs), so the hero is faster and reloads at double speed for as long as ZABS.adr lasts
function zabMods(){try{if(ZM.fortuna&&ZM.fortuna.applyMods)ZM.fortuna.applyMods()}catch(e){}}
if(typeof ZM!=='undefined'){const _h=ZM.modsHook;ZM.modsHook=function(m){if(_h)_h.apply(this,arguments);if(ZABS.adr>0&&m){m.spd=(m.spd||1)*1.3;m.relK=(m.relK||1)*2}}}
function zabAdrEnd(){const was=ZABS.adr>0;ZABS.adr=0;if(was)zabMods()}
// la forza degli zombie del round (la vita di uno zombie normale), per le bombe e le tagliole
const zabHp=()=>{const D=zabD();return 80*(D&&D.hpMul?D.hpMul(Math.max(1,D.R||1)):1)};
const zabFoe=z=>!z.die&&!z.idle&&z.rise>=1;
function zabCan(){const D=zabD(),h=ZM.W.hero;return!!D&&!h.dead&&!h.cl&&!['fine','giu','su'].includes(D.st)}
function zabUse(i){const id=ZABS.eq[i];if(!id)return;const a=ZAB_BY[id];if(ZABS.cd[i]>0||!zabCan()){zabSnd('no');zabPulse(i,true);return}
  const W=ZM.W,h=W.hero,D=zabD();let ok=true;
  if(id==='scatto'){let dx=Math.cos(h.face||0),dy=Math.sin(h.face||0);if(!h.moving){let best=null,bd=1e9;for(const z of W.Z)if(zabFoe(z)&&ZM.sameLv(z)){const d=Math.hypot(z.x-h.x,z.y-h.y);if(d<bd){bd=d;best=z}}
      if(best&&bd<220){dx=h.x-best.x;dy=h.y-best.y;const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l}}
    ZABS.dash={t:0,T:.2,dx,dy,dist:96};D.inv=Math.max(D.inv,.45);zabSnd('scatto')}
  else if(id==='bomba'){// the thickest group of zombies within reach that the hero can see, or ahead
    let tx=h.x+Math.cos(h.face||0)*120,ty=h.y+Math.sin(h.face||0)*120,best=0;for(const z of W.Z){if(!zabFoe(z)||!ZM.sameLv(z))continue;const d=Math.hypot(z.x-h.x,z.y-h.y);if(d>230)continue;
      let n=0;for(const o of W.Z)if(zabFoe(o)&&Math.hypot(o.x-z.x,o.y-z.y)<60)n++;if(n>best&&ZM.physClear(h.x,h.y,z.x,z.y,1.5)){best=n;tx=z.x;ty=z.y}}
    ZABS.bottles.push({x0:h.x,y0:h.y,z0:(h.zh||0)+30,x:tx,y:ty,lv:h.lv||0,t:0,T:.55});zabSnd('lancio')}
  else if(id==='rintocco'){ZABS.rings.push({x:h.x,y:h.y,t:0});ZABS.bells.push({t:0});zabSnd('rintocco');if(D)D.shake=Math.max(D.shake,.3);
    for(const z of W.Z){if(!zabFoe(z)||!ZM.sameLv(z))continue;const dx=z.x-h.x,dy=z.y-h.y,d=Math.hypot(dx,dy)||1;if(d>125||z.ai)continue;const L=(140-d)*.62,n=Math.ceil(L/4);
      for(let k=0;k<n;k++)ZM.move(z,dx/d*L/n,dy/d*L/n,11);z.stun=1.8;z.flash=.15}}
  else if(id==='tagliola'){if(ZABS.traps.length>=2)ZABS.traps.shift();ZABS.traps.push({x:h.x+Math.cos(h.face||0)*6,y:h.y+Math.sin(h.face||0)*6,lv:h.lv||0,t:0,z:null,hold:0,shut:0,a:Math.random()*TAU});zabSnd('posa')}
  else if(id==='adrenalina'){ZABS.adr=7;ZABS.beat=0;zabMods();zabSnd('adrenalina')}
  else if(id==='benda'){ZABS.heal=1;zabSnd('benda');for(let k=0;k<5;k++)ZABS.pluses.push({t:-k*.12,x:(Math.random()-.5)*26})}
  else ok=false;
  if(ok){ZABS.cd[i]=a.cd;zabPulse(i)}}
// ------------------------------------------------------------------ ogni fotogramma (dentro l'update del direttore)
function zabUpdate(D,dt){if(!ZABS.started)zabReset();const W=ZM.W,h=W.hero;ZABS.last=performance.now();
  for(let i=0;i<3;i++)if(ZABS.cd[i]>0)ZABS.cd[i]=Math.max(0,ZABS.cd[i]-dt);
  // the dash: the hero is carried along, can't be touched, kicks up dust
  const S=ZABS.dash;if(S){if(h.dead||h.cl)ZABS.dash=null;else{const k0=S.t/S.T;S.t=Math.min(S.T,S.t+dt);const k1=S.t/S.T,ez2=u=>1-(1-u)*(1-u),step=S.dist*(ez2(k1)-ez2(k0));
    ZM.move(h,S.dx*step,S.dy*step,10);h.moving=true;h.face=Math.atan2(S.dy,S.dx);h.walk=(h.walk||0)+dt*26;if(!LOWFX&&Math.random()<.7)ZABS.puffs.push({x:h.x-S.dx*8,y:h.y-S.dy*8,t:0,r:4+Math.random()*3});if(S.t>=S.T)ZABS.dash=null}}
  // the bottles flying, then the fire on the ground
  for(const b of ZABS.bottles){b.t+=dt;if(b.t>=b.T&&!b.done){b.done=1;ZABS.fires.push({x:b.x,y:b.y,lv:b.lv,t:0,T:4,tick:0,r:58});zabSnd('vetro');if(D)D.shake=Math.max(D.shake,.15)}}
  ZABS.bottles=ZABS.bottles.filter(b=>!b.done);
  for(const f of ZABS.fires){f.t+=dt;f.tick-=dt;if(f.tick<=0&&f.t<f.T){f.tick=.25;const n=.45*zabHp()*.25;for(const z of W.Z)if(zabFoe(z)&&(z.lv||0)===f.lv&&Math.hypot(z.x-f.x,z.y-f.y)<f.r)ZM.hurt(z,z.ai||z.boss?n*.35:n,false)}}
  ZABS.fires=ZABS.fires.filter(f=>f.t<f.T+.6);
  // the traps: the first zombie that steps in is held, hurt a little every quarter second, then the trap is gone
  for(const T of ZABS.traps){T.t+=dt;if(!T.z){if(T.t>.3)for(const z of W.Z)if(zabFoe(z)&&!z.ai&&!z.boss&&(z.lv||0)===T.lv&&Math.hypot(z.x-T.x,z.y-T.y)<15){T.z=z;T.hold=5;T.shut=0;z.stun=5;z.x=T.x;z.y=T.y;zabSnd('scatta');break}}
    else{T.shut=Math.min(1,T.shut+dt*14);T.hold-=dt;T.tk=(T.tk||0)-dt;if(T.tk<=0){T.tk=.25;if(zabFoe(T.z)){ZM.hurt(T.z,1.4*zabHp()/20,false);T.z.stun=Math.max(T.z.stun||0,.3)}}if(T.z.die||T.hold<=0)T.gone=(T.gone||0)+dt}}
  ZABS.traps=ZABS.traps.filter(T=>!(T.gone>.6)&&T.t<40);
  // adrenaline: the heart beats, then everything goes back
  if(ZABS.adr>0){ZABS.adr-=dt;ZABS.beat=(ZABS.beat||0)-dt;if(ZABS.beat<=0){ZABS.beat=.62;zabSnd('cuore')}if(ZABS.adr<=0||h.dead)zabAdrEnd()}
  // the bandage: the life comes back in a second
  if(ZABS.heal>0){const PZ=D.PZ||{vita:100},k=Math.min(ZABS.heal,dt);ZABS.heal-=dt;if(!h.dead)D.hp=Math.min(PZ.vita,D.hp+PZ.vita*.6*k)}
  for(const r of ZABS.rings)r.t+=dt;ZABS.rings=ZABS.rings.filter(r=>r.t<.9);for(const b of ZABS.bells)b.t+=dt;ZABS.bells=ZABS.bells.filter(b=>b.t<1.3);
  for(const p of ZABS.pluses)p.t+=dt;ZABS.pluses=ZABS.pluses.filter(p=>p.t<1.1);for(const p of ZABS.puffs)p.t+=dt;ZABS.puffs=ZABS.puffs.filter(p=>p.t<.5);
  zabUIUpdate(D)}
// ------------------------------------------------------------------ i disegni: a terra (bruciature, fuoco, tagliole, onde, polvere), sopra (bottiglie, fiamme, campana, croci)
function zabGround(){const{inGround}=ZM;if(!ZABS.fires.length&&!ZABS.traps.length&&!ZABS.rings.length&&!ZABS.puffs.length)return;inGround(()=>{const t=ZM.W.t||0;
  for(const p of ZABS.puffs){const k=p.t/.5;ctx.fillStyle=`rgba(190,180,160,${(.35*(1-k)).toFixed(3)})`;ctx.beginPath();ctx.ellipse(p.x,p.y,p.r*(1+k),p.r*(1+k)*.7,0,0,TAU);ctx.fill()}
  for(const f of ZABS.fires){const live=f.t<f.T,a=live?Math.min(1,f.t*5):Math.max(0,1-(f.t-f.T)/.6);
    // the scorch stays a moment after the fire
    ctx.fillStyle=`rgba(24,14,8,${(.42*a).toFixed(3)})`;ctx.beginPath();ctx.ellipse(f.x,f.y,f.r,f.r*.92,0,0,TAU);ctx.fill();
    if(live&&!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow('255,120,30',f.x,f.y,f.r*1.15,.5*a*(.85+.15*Math.sin(t*9)));ctx.restore()}
    if(live){ctx.strokeStyle=`rgba(255,${150+Math.round(60*Math.sin(t*11))},60,${(.55*a).toFixed(3)})`;ctx.lineWidth=2.2;ctx.setLineDash([7,6]);ctx.beginPath();ctx.ellipse(f.x,f.y,f.r,f.r*.92,0,0,TAU);ctx.stroke();ctx.setLineDash([])}}
  for(const T of ZABS.traps){const sh=T.shut||0,fade=T.gone?Math.max(0,1-T.gone/.6):Math.min(1,T.t*6);ctx.save();ctx.globalAlpha*=fade;ctx.translate(T.x,T.y);ctx.rotate(T.a);
    ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(1,2,15,10,0,0,TAU);ctx.fill();
    ctx.strokeStyle=INK;ctx.lineWidth=3.4;ctx.beginPath();ctx.ellipse(0,0,12,8,0,0,TAU);ctx.stroke();ctx.strokeStyle='#7c818a';ctx.lineWidth=1.8;ctx.stroke();
    // the two jaws: open flat on the ground, then snapped shut in the middle
    for(const sd of[-1,1]){const r=12*(1-sh*.82);ctx.strokeStyle=INK;ctx.lineWidth=3.6;ctx.beginPath();ctx.ellipse(0,sd*r*.35,13,Math.max(1,r),0,sd>0?0:Math.PI,sd>0?Math.PI:TAU);ctx.stroke();ctx.strokeStyle='#a9aeb7';ctx.lineWidth=1.8;ctx.stroke();
      ctx.fillStyle='#e8ecf0';for(let i=0;i<5;i++){const an=(sd>0?0:Math.PI)+(i+.5)/5*Math.PI,x=Math.cos(an)*13,y=sd*r*.35+Math.sin(an)*Math.max(1,r);ctx.beginPath();ctx.moveTo(x-1.6,y);ctx.lineTo(x*(.8),y*(.8)-sd*1);ctx.lineTo(x+1.6,y);ctx.closePath();ctx.fill()}}
    ctx.fillStyle='#c9b48a';ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(0,0,2.6,0,TAU);ctx.fill();ctx.stroke();
    if(!sh){ctx.strokeStyle='rgba(60,50,40,.7)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(-14,4);ctx.quadraticCurveTo(-24,10,-30,6);ctx.stroke()}ctx.restore()}
  for(const r of ZABS.rings){const k=r.t/.9;ctx.save();ctx.globalAlpha=1-k;ctx.strokeStyle='rgba(205,184,255,.95)';ctx.lineWidth=3.4*(1-k)+1;ctx.beginPath();ctx.arc(r.x,r.y,16+k*118,0,TAU);ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(r.x,r.y,10+k*96,0,TAU);ctx.stroke();ctx.restore()}})}
function zabTop(){const{S,SB}=ZM,W=ZM.W,h=W.hero,t=W.t||0;
  // the bottles in flight: an arc, spinning, the rag burning
  for(const b of ZABS.bottles){const k=Math.min(1,b.t/b.T),x=b.x0+(b.x-b.x0)*k,y=b.y0+(b.y-b.y0)*k,z=b.z0*(1-k)+Math.sin(k*Math.PI)*46,q=S(x,y,z);
    ctx.save();ctx.translate(q[0],q[1]);ctx.rotate(k*9);ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.fillStyle='#3f7a52';ctx.beginPath();ctx.ellipse(0,1.5,3.2,4.4,0,0,TAU);ctx.fill();ctx.stroke();ctx.fillRect(-1.2,-5.5,2.4,3.6);ctx.strokeRect(-1.2,-5.5,2.4,3.6);ctx.restore();
    if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow('255,150,40',q[0],q[1]-6,9,.7);ctx.restore()}ctx.fillStyle='#ffb13a';ctx.beginPath();ctx.ellipse(q[0],q[1]-7,2,3.2,0,0,TAU);ctx.fill()}
  // the flames standing up from the burning ground (flickering tongues, embers rising)
  for(const f of ZABS.fires){if(f.t>=f.T)continue;const a=Math.min(1,f.t*5)*(f.t>f.T-.5?(f.T-f.t)/.5:1),n=LOWFX?6:12;
    for(let i=0;i<n;i++){const an=i/n*TAU+i*.7,rr=f.r*(.25+.65*((i*.37)%1)),x=f.x+Math.cos(an)*rr,y=f.y+Math.sin(an)*rr*.92,ph=t*7+i*1.9,hh=(10+7*Math.sin(ph))*(.75+.25*((i*.53)%1)),q=S(x,y,0);
      ctx.save();ctx.globalAlpha=a*.92;ctx.fillStyle='#ff8a2a';ctx.beginPath();ctx.moveTo(q[0]-4,q[1]);ctx.quadraticCurveTo(q[0]-5,q[1]-hh*.6,q[0]+Math.sin(ph*1.3)*2,q[1]-hh);ctx.quadraticCurveTo(q[0]+5,q[1]-hh*.6,q[0]+4,q[1]);ctx.closePath();ctx.fill();
      ctx.fillStyle='#ffe28a';ctx.beginPath();ctx.moveTo(q[0]-2,q[1]);ctx.quadraticCurveTo(q[0]-2,q[1]-hh*.4,q[0],q[1]-hh*.62);ctx.quadraticCurveTo(q[0]+2,q[1]-hh*.4,q[0]+2,q[1]);ctx.closePath();ctx.fill();ctx.restore()}
    if(!LOWFX)for(let i=0;i<6;i++){const u=((t*.6+i*.17)%1),an=i*2.4,x=f.x+Math.cos(an)*f.r*.5,y=f.y+Math.sin(an)*f.r*.45,q=S(x,y,u*46);ctx.fillStyle=`rgba(255,${180-Math.round(u*90)},60,${(a*(1-u)).toFixed(3)})`;ctx.fillRect(q[0]-1,q[1]-1,2,2)}}
  // the ghost bell over the hero, swinging, then fading
  for(const b of ZABS.bells){const k=b.t/1.3,q=SB(h.x,h.y,(h.zh||0)+78),sw=Math.sin(b.t*9)*.35*(1-k);ctx.save();ctx.globalAlpha=Math.min(1,b.t*6)*(1-k);ctx.translate(q[0],q[1]-k*10);ctx.rotate(sw);
    if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow('205,184,255',0,6,26,.55);ctx.restore()}ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.fillStyle='rgba(214,196,255,.85)';ctx.beginPath();ctx.moveTo(0,-8);ctx.quadraticCurveTo(9,-7,9,4);ctx.lineTo(12,11);ctx.lineTo(-12,11);ctx.lineTo(-9,4);ctx.quadraticCurveTo(-9,-7,0,-8);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle='rgba(120,100,170,.9)';ctx.beginPath();ctx.arc(Math.sin(b.t*9+1)*3,13,2.6,0,TAU);ctx.fill();ctx.stroke();ctx.restore()}
  // adrenaline: a red pulse round the hero
  if(ZABS.adr>0&&!h.dead){const q=SB(h.x,h.y,(h.zh||0)+26),b=.5+.5*Math.sin(t*10.1),a=Math.min(1,ZABS.adr*2);if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow('255,60,70',q[0],q[1],34+6*b,.32*a);ctx.restore()}
    ctx.save();ctx.globalAlpha=.55*a;ctx.strokeStyle='#ff5a6a';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(q[0],q[1]+26,16+4*b,6+1.5*b,0,0,TAU);ctx.stroke();ctx.restore()}
  // the bandage: green crosses floating up
  for(const p of ZABS.pluses){if(p.t<0)continue;const k=p.t/1.1,q=SB(h.x,h.y,(h.zh||0)+30+k*44);ctx.save();ctx.globalAlpha=Math.min(1,p.t*8)*(1-k);ctx.translate(q[0]+p.x*(1+k*.3),q[1]);
    ctx.fillStyle='#8ff0a8';ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(-1.8,-6);ctx.lineTo(1.8,-6);ctx.lineTo(1.8,-1.8);ctx.lineTo(6,-1.8);ctx.lineTo(6,1.8);ctx.lineTo(1.8,1.8);ctx.lineTo(1.8,6);ctx.lineTo(-1.8,6);ctx.lineTo(-1.8,1.8);ctx.lineTo(-6,1.8);ctx.lineTo(-6,-1.8);ctx.lineTo(-1.8,-1.8);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore()}}
// ------------------------------------------------------------------ i tre bottoni in basso a destra (sopra la telecamera: il tocco non la gira)
function zabBuildUI(){const ov=document.getElementById('mz');if(!ov)return;let el=document.getElementById('mzAb');
  if(!el){el=document.createElement('div');el.id='mzAb';ov.appendChild(el);const st=document.createElement('style');st.textContent=`
    #mzAb{position:absolute;right:calc(12px + env(safe-area-inset-right,0px));bottom:calc(16px + env(safe-area-inset-bottom,0px));display:flex;flex-direction:row-reverse;align-items:flex-end;gap:10px;z-index:3;transition:opacity .3s}
    #mz.game.zab .hint{bottom:calc(96px + env(safe-area-inset-bottom,0px))}
    #mzAb.off{opacity:0;pointer-events:none}
    #mzAb .ab{position:relative;width:58px;height:58px;padding:0;border-radius:50%;background:radial-gradient(circle at 40% 35%,#4a4038,#221c18);border:3px solid #000;box-shadow:0 4px 0 #000,inset 0 0 0 2px var(--c);-webkit-tap-highlight-color:transparent;touch-action:none;cursor:pointer}
    #mzAb .ab img{position:absolute;left:7px;top:7px;width:38px;height:38px;pointer-events:none}
    #mzAb .ab .cd{position:absolute;inset:0;border-radius:50%;background:conic-gradient(rgba(6,6,10,.72) calc(var(--p,0)*1turn),rgba(0,0,0,0) 0);pointer-events:none}
    #mzAb .ab .n{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:400 19px "Lilita One",system-ui;color:#efe6d0;text-shadow:0 2px 0 #000;pointer-events:none}
    #mzAb .ab .k{position:absolute;right:-4px;top:-5px;min-width:17px;height:17px;border-radius:9px;background:#141110;border:2px solid #000;font:700 11px/13px "Baloo 2",system-ui;color:#d8cfb8;text-align:center;pointer-events:none}
    #mzAb .ab.ready{box-shadow:0 4px 0 #000,inset 0 0 0 2px var(--c),0 0 12px var(--c)}
    #mzAb .ab.pop{animation:zabpop .35s}#mzAb .ab.no{animation:zabno .3s}
    @keyframes zabpop{40%{transform:scale(1.16)}}@keyframes zabno{25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
    #mzAb .ab.empty{opacity:.35}
    @media (hover:none){#mzAb .ab .k{display:none}}`;el.appendChild(st);
    el.addEventListener('pointerdown',e=>{e.stopPropagation();const b=e.target.closest('.ab');if(!b)return;e.preventDefault();zabUse(+b.dataset.i)});
    for(const t of['pointerup','pointermove','click'])el.addEventListener(t,e=>e.stopPropagation())}
  // a row in the bottom right corner, under the camera's pad (drawn 196 px up): the first at the corner, next to the thumb
  ov.classList.add('zab');el.querySelectorAll('.ab').forEach(b=>b.remove());ZABS.btn=[];
  ZABS.eq.forEach((id,i)=>{const a=id&&ZAB_BY[id];if(!a)return;const b=document.createElement('button');b.className='ab';b.dataset.i=i;b.style.setProperty('--c',a.col);b.setAttribute('aria-label',a.n);
    b.innerHTML=`<img src="${zabIcon(id,38)}" alt=""><span class="cd"></span><span class="n"></span><span class="k">${i+1}</span>`;el.appendChild(b);ZABS.btn[i]={b,cd:b.querySelector('.cd'),n:b.querySelector('.n'),k:''}});
  ZABS.ui=el}
function zabPulse(i,no){const B=ZABS.btn&&ZABS.btn[i];if(!B)return;B.b.classList.remove('pop','no');void B.b.offsetWidth;B.b.classList.add(no?'no':'pop')}
function zabUIUpdate(D){const el=ZABS.ui;if(!el)return;const h=ZM.W.hero,off=!zabCan()&&!(h.dead&&D.st==='giu');el.classList.toggle('off',D.st==='fine'||!!h.dead);
  ZABS.eq.forEach((id,i)=>{const B=ZABS.btn&&ZABS.btn[i];if(!B)return;const a=ZAB_BY[id],c=ZABS.cd[i],k=(c>0?Math.ceil(c):0)+'|'+(c>0?(c/a.cd).toFixed(2):0);if(k===B.k)return;B.k=k;
    B.cd.style.setProperty('--p',c>0?(c/a.cd).toFixed(3):0);B.n.textContent=c>0?Math.ceil(c):'';B.b.classList.toggle('ready',c<=0)})}

// la tastiera: 1, 2, 3 (solo durante la partita, quando il direttore lavora)
addEventListener('keydown',e=>{if(!ZABS.started||performance.now()-ZABS.last>250||e.repeat)return;const k=e.code,i=k==='Digit1'||k==='Numpad1'?0:k==='Digit2'||k==='Numpad2'?1:k==='Digit3'||k==='Numpad3'?2:-1;if(i>=0)zabUse(i)},true);
// ------------------------------------------------------------------ l'aggancio alla partita (partita.js): avvolge il direttore quando l'area lo accende
function zabInstall(D){if(!D||D.__zab)return;D.__zab=1;
  const _u=D.update;D.update=function(dt,on){_u.apply(this,arguments);try{zabUpdate(D,dt)}catch(e){console.error(e)}};
  const _r=D.reset;D.reset=function(){_r.apply(this,arguments);zabReset()};
  const _g=D.drawGround;D.drawGround=function(){_g.apply(this,arguments);try{zabGround()}catch(e){console.error(e)}};
  const _t=D.drawTop;D.drawTop=function(){_t.apply(this,arguments);try{zabTop()}catch(e){console.error(e)}}}
if(typeof ZM!=='undefined'&&ZM.partita){const _p=ZM.partita;ZM.partita=function(){const D=_p.apply(this,arguments);zabInstall(D);return D};if(ZM.W.director)zabInstall(ZM.W.director)}
// ------------------------------------------------------------------ l'Arsenale: la sezione «Abilità» (tre posti, le sei abilità) e il foglio di ognuna
if(typeof renderZArs==='function'&&typeof $==='function'&&$('zArs')){
  {const sec=document.createElement('div');sec.id='zAbSec';sec.innerHTML=`<div class="secTitle"><h3>Abilità</h3><small>Ne porti 3 in partita</small></div><div class="zabEq" id="zAbEq"></div><div class="coll" id="zAbAll"></div>`;
    $('zArs').prepend(sec);const st=document.createElement('style');st.textContent=`
    .zabEq{display:flex;gap:10px;justify-content:center;margin:2px 0 10px}
    .zabEq .slot{width:62px;height:62px;border-radius:50%;border:3px solid var(--ink);background:radial-gradient(circle at 40% 35%,#4a4038,#221c18);box-shadow:0 4px 0 var(--ink),inset 0 0 0 2px var(--c,#5a5147);display:flex;align-items:center;justify-content:center;position:relative;cursor:pointer;padding:0}
    .zabEq .slot img{width:40px;height:40px;pointer-events:none}.zabEq .slot.empty{opacity:.55}.zabEq .slot.empty::after{content:'+';font:400 26px var(--display);color:var(--parch);opacity:.6}
    .zabEq .slot b{position:absolute;right:-5px;top:-6px;min-width:18px;height:18px;border-radius:9px;background:#141110;border:2px solid var(--ink);font:700 11px/14px var(--body);color:var(--parch)}
    .icard.zab img{width:46px;height:46px;pointer-events:none}.icard.zab.locked img{filter:grayscale(1) brightness(.55)}
    .icard.zab .nm{font-family:var(--display);font-size:11.5px;line-height:1.1;text-align:center;min-height:2.2em;display:flex;align-items:center}
    .icard.zab .st{font-size:11px;font-weight:700;opacity:.92}.icard.zab .st.on{color:#9fe06a}
    .zabBig{display:flex;justify-content:center;margin:6px 0 4px}.zabBig img{width:84px;height:84px}
    .zabCost{display:flex;gap:12px;justify-content:center;font-weight:700;margin:4px 0}.zabCost .no{color:#ff8a70}`;document.head.appendChild(st)}
  function renderZAb(){const A=zabSave(),eq=$('zAbEq'),all=$('zAbAll');if(!eq||!all)return;
    eq.innerHTML=A.eq.map((id,i)=>{const a=id&&ZAB_BY[id];return a?`<button class="slot" data-zabopen="${id}" style="--c:${a.col}" aria-label="${a.n}"><img src="${zabIcon(id,40)}" alt=""><b>${i+1}</b></button>`:`<button class="slot empty" aria-label="Posto vuoto"><b>${i+1}</b></button>`}).join('');
    all.innerHTML=ZAB.map(a=>{const own=!!A.own[a.id],on=A.eq.includes(a.id),st=on?'<span class="st on">In partita</span>':own?'<span class="st">Pronta</span>':zabRec()<a.rec?`<span class="st">Record ${a.rec}</span>`:`<span class="st">${a.oro.toLocaleString('it-IT')} oro</span>`;
      return `<button class="icard zab ${own?'':'locked'}" data-zabopen="${a.id}" style="--rc:${a.col};--rc2:#2a2420"><img src="${zabIcon(a.id,46)}" alt=""><span class="nm">${a.n}</span>${st}</button>`}).join('')}
  {const _r=renderZArs;renderZArs=function(){_r.apply(this,arguments);try{renderZAb()}catch(e){console.error(e)}}}
  $('tabGear').addEventListener('click',e=>{const b=e.target.closest('[data-zabopen]');if(!b||!zMode())return;e.stopPropagation();openSheet('zab:'+b.dataset.zabopen)});
  function fillZAb(id){const a=ZAB_BY[id],A=zabSave(),own=!!A.own[id],on=A.eq.includes(id),rok=zabRec()>=a.rec,gok=SAVE.gold>=a.oro,mok=(SAVE.mat.rot||0)>=a.rot;lastSheetHTML='';
    $('sheet').innerHTML=`<h2>${a.n}</h2><div class="zabBig"><img src="${zabIcon(id,84)}" alt=""></div><p class="lead">${a.d}</p><p class="sub">Si ricarica in <b>${a.cd} secondi</b>. ${on?'La porti in partita.':own?'La puoi portare in partita.':''}</p>
      ${own?(on?`<button class="btn alt" data-zabact="off" data-id="${id}">Lasciala qui</button>`:`<button class="btn go" data-zabact="on" data-id="${id}">Portala in partita</button>${A.eq.every(Boolean)?`<small class="muted">Prende il posto di ${ZAB_BY[A.eq[0]].n}</small>`:''}`)
        :`${rok?'':`<p class="sub">Si sblocca quando arrivi al <b>round ${a.rec}</b> (il tuo record è ${zabRec()}).</p>`}<div class="zabCost"><span class="${gok?'':'no'}">${a.oro.toLocaleString('it-IT')} oro</span><span class="${mok?'':'no'}">${a.rot} ${MAT_SVG.rot.replace('<svg ','<svg class="mI" ')} Rottami</span></div>
        <button class="btn go" data-zabact="buy" data-id="${id}" ${rok&&gok&&mok?'':'disabled'}>Sblocca</button>`}
      <button class="btn alt close">Chiudi</button>`}
  {const _os=openSheet;openSheet=function(kind){if(typeof kind==='string'&&kind.startsWith('zab:')){SHEET=kind;sfx('ui');fillZAb(kind.slice(4));$('sheetScr').hidden=false;return}return _os.apply(this,arguments)}}
  $('sheet').addEventListener('click',e=>{const b=e.target.closest('button[data-zabact]');if(!b)return;const id=b.dataset.id,act=b.dataset.zabact;
    if(act==='buy'){if(zabBuy(id)){sfx('upgrade');try{achPop(ZAB_BY[id].n,'Abilità sbloccata!','trophy')}catch(_){}}else{sfx('ui');return}}
    else if(act==='on'){zabWear(id);sfx('ui')}else if(act==='off'){zabTakeOff(id);sfx('ui')}
    try{renderZArs()}catch(_){}fillZAb(id)})}
