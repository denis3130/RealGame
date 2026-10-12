// ---------- LA PARTITA a ondate della modalità zombie (decisioni di Denis del 12 ottobre): round come in CoD (a ogni round più zombie, più
// veloci e più resistenti, una pausa tra un round e l'altro), ogni 5 round un boss (il Becchino ai round 5, 15, 25…, lo Spaventapasseri ai
// round 10, 20…), la vita dell'eroe (100 punti; dopo 3 s senza colpi torna piena), la morte (la partita finisce: le monete della partita si
// azzerano, oro per il menu in base al round raggiunto) e la Lanterna delle Anime, che si compra con le monete: la sua fiammella segue l'eroe e
// lo rialza una volta (al massimo 3 anime per partita). L'area la accende con ZM.partita({lanterna}); il motore la chiama da W.director
// (update, zombieHit, killed, drawGround, drawOnHero, drawTop). Tutti i numeri stanno in PZ e nelle funzioni qui sotto: da regolare giocando.
(()=>{const{W,S,CAM,rr,cl,lerp,ez,TAU,inGround,move,zWalk,physClear,hit,heightAt,spawn,KINDS}=ZM;
const PZ={vita:100,ricarica:3,rigenera:45,inv:.5,pausa:9,inizio:3,
  danno:{zombie:28,strisciante:22,minatore:32,lanterna:40,hound:18},colpo:10,
  anima:{prezzo:1500,max:3},
  becchino:{vita:1200,passo:24,colpo:62,premio:500,evoca:13},spaventa:{vita:2200,passo:46,giro:16,premio:700},
  oro:R=>10*R*R+30*R};
// il round R: quanti zombie in tutto, quanta vita, quanto corrono, quanto fanno male, quanti insieme, ogni quanto ne esce uno, il boss
const quota=R=>Math.round(6+2.2*(R-1)+.18*(R-1)*(R-1)),
  hpMul=R=>R<=9?1+.3*(R-1):3.4*Math.pow(1.1,R-9),
  spdMul=(R,k)=>k==='hound'?Math.min(1.35,1+.035*(R-1)):Math.min(2.1,1+.1*(R-1)),
  dmgMul=R=>Math.min(1.6,1+.03*(R-1)),
  maxVivi=R=>(R<=5?6:R<=9?7:8)-(LOWFX?2:0),
  intervallo=R=>Math.max(.7,2*Math.pow(.92,R-1)),
  bossDi=R=>R%5?null:(R/5)%2===1?'becchino':'spaventapasseri';
function tipo(R){const w=R<=2?[['zombie',1]]:R<=4?[['zombie',.7],['strisciante',.3]]:R<=9?[['zombie',.5],['strisciante',.2],['minatore',.2],['lanterna',.1]]:[['zombie',.4],['strisciante',.15],['minatore',.2],['lanterna',.15],['hound',.1]];
  let r=Math.random();for(const[k,p] of w)if((r-=p)<=0)return k;return w[0][0]}
const NOMI={becchino:'Il Becchino',spaventapasseri:'Lo Spaventapasseri'};
const D={R:0,st:'inizio',t:0,left:0,sp:1,boss:null,bossT:0,hp:PZ.vita,hurtT:9,inv:0,red:0,anime:0,comprate:0,warn:[],cracks:[],burst:[],fly:null,lant:null,ui:null,prev:'round',kills0:0,shake:0};
// ------------------------------------------------------------------ i suoni (col bottone Suono acceso): campana dei round, colpi, la caduta, l'anima
function suono(w){try{if(typeof AU==='undefined'||!AU.ctx||!AU.on.sfx)return;const t=AU.ctx.currentTime+.01;AU.pan=0;
  if(w==='round'){vBell(null,t,45,3.4,.42);vBell(null,t+1.15,45,3.4,.34);vChoir(null,t+.15,[45,52,57],2.6,.045);fThump(t,70,40,.6,.35,.4)}
  else if(w==='fine'){for(let i=0;i<3;i++)vBell(null,t+i*.32,[69,64,57][i],1.6,.12);vChoir(null,t+.5,[57,60,64],2.2,.05)}
  else if(w==='boss'){fThump(t,58,28,1.4,.9,.5);vChoir(null,t,[38,45,50],3.2,.08);vBell(null,t+.3,38,4,.4);fNoise(t,1.6,'lowpass',260,.7,.45,{brown:true,att:.3})}
  else if(w==='colpito'){fThump(t,150,70,.14,.7,.15);fNoise(t,.14,'bandpass',800,1.4,.3)}
  else if(w==='cade'){fThump(t,90,36,.5,.8,.35);vChoir(null,t+.25,[48,51,55],2.4,.06)}
  else if(w==='anima'){whoosh(t,.7,300,3000,.3,.4);vChoir(null,t+.1,[60,64,67,72],1.8,.07);vBell(null,t+.25,84,1.3,.09)}
  else if(w==='compra'){vBell(null,t,79,1.1,.09);vBell(null,t+.13,84,1.1,.07);whoosh(t+.05,.5,900,2600,.18,.2)}
  else if(w==='colpo'){fThump(t,110,38,.4,1,.4);fNoise(t,.35,'lowpass',520,.7,.55,{brown:true});M.stone(t+.02,.9)}
  else if(w==='trottola'){whoosh(t,.55,500,1700,.22,.2);M.wood(t+.1,.6,180)}
  else if(w==='evoca'){vChoir(null,t,[38,45,50],1.8,.08);fNoise(t,.9,'lowpass',300,.7,.4,{brown:true,att:.2})}
  else if(w==='morte'){vBell(null,t,40,5,.5);vBell(null,t+1.6,40,5,.36);vChoir(null,t+.3,[40,43,47],4.2,.09)}
  else if(w==='boss_giu'){fThump(t,80,30,1,.9,.5);vChoir(null,t+.2,[52,57,61,64],2.6,.08);for(let i=0;i<5;i++)coinClink(t+.3+i*.08,.9)}}catch(e){}}
// ------------------------------------------------------------------ le scritte a schermo: vita, anima, round (le tacche di gesso rosso fino a 5,
// poi il numero), la barra del boss, la scritta grande in mezzo, il sangue ai bordi, la fine della partita
function mkUI(){const ov=document.getElementById('mz');if(!ov)return null;const el=document.createElement('div');el.id='mzPartita';el.innerHTML=`<style>
  #mzPartita{position:absolute;inset:0;pointer-events:none;font-family:"Baloo 2",system-ui,sans-serif;color:#efe6d0}
  #mzPartita .vita{position:absolute;left:14px;top:calc(66px + env(safe-area-inset-top,0px));display:flex;align-items:center;gap:7px}
  #mzPartita .vita .b{width:112px;height:9px;border:2px solid #000;border-radius:6px;background:#2a1414;overflow:hidden;box-shadow:0 2px 0 #000}
  #mzPartita .vita .b i{display:block;height:100%;width:100%;background:linear-gradient(#e0473a,#8f1a14);transform-origin:left;transition:transform .15s}
  #mzPartita canvas{position:relative;inset:auto}
  #mzPartita .vita .a{width:13px;height:18px;opacity:0;transition:opacity .4s}#mzPartita .vita .a.on{opacity:1}
  #mzPartita .rnd{position:absolute;inset:auto;right:10px;top:calc(114px + env(safe-area-inset-top,0px));width:76px;height:58px}
  #mzPartita .ban{position:absolute;left:0;right:0;top:34%;text-align:center;opacity:0;transform:scale(.9);transition:opacity .45s,transform .45s}
  #mzPartita .ban.on{opacity:1;transform:scale(1)}
  #mzPartita .ban .b1{font:400 44px "Lilita One",system-ui;letter-spacing:.03em;color:#c3231c;text-shadow:0 3px 0 #000,0 0 18px rgba(0,0,0,.8)}
  #mzPartita .ban .b2{font:400 21px "Lilita One",system-ui;letter-spacing:.02em;color:#efe6d0;text-shadow:0 2px 0 #000;margin-top:2px}
  #mzPartita .boss{position:absolute;left:50%;top:calc(112px + env(safe-area-inset-top,0px));transform:translateX(-50%);width:min(230px,58vw);text-align:center}
  #mzPartita .boss .n{font:400 15px "Lilita One",system-ui;letter-spacing:.03em;color:#e9d9a8;text-shadow:0 2px 0 #000}
  #mzPartita .boss .v{height:10px;border:2px solid #000;border-radius:6px;background:#1c1414;overflow:hidden;box-shadow:0 2px 0 #000;margin-top:2px}
  #mzPartita .boss .v i{display:block;height:100%;width:100%;background:linear-gradient(#7be08a,#2f7a3a);transform-origin:left;transition:transform .12s}
  #mzPartita .sangue{position:absolute;inset:0;opacity:0;background:radial-gradient(ellipse at center,rgba(0,0,0,0) 48%,rgba(90,4,4,.55) 78%,rgba(40,0,0,.92) 100%)}
  #mzPartita .fine{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;background:radial-gradient(ellipse at center,rgba(30,4,6,.78),rgba(6,2,4,.95));pointer-events:auto;opacity:0;transition:opacity .8s}
  #mzPartita .fine.on{opacity:1}
  #mzPartita .fine h2{margin:0;font:400 46px "Lilita One",system-ui;letter-spacing:.03em;color:#c3231c;text-shadow:0 3px 0 #000}
  #mzPartita .fine p{margin:0;font:700 16px "Baloo 2",system-ui;text-shadow:0 2px 0 #000}#mzPartita .fine p b{font:400 19px "Lilita One",system-ui;color:#ffd65a}
  #mzPartita .fine small{opacity:.7;font-size:12px;margin-top:2px}
  #mzPartita .fine button{margin-top:14px;font:400 19px "Lilita One",system-ui;color:#1b120a;background:linear-gradient(#ffd65a,#d6982a);border:2.5px solid #000;border-radius:14px;padding:9px 26px;box-shadow:0 4px 0 #000}
  </style><div class="sangue"></div><div class="vita"><div class="b"><i></i></div><canvas class="a" width="26" height="36"></canvas></div><canvas class="rnd" width="152" height="116"></canvas>
  <div class="boss" hidden><div class="n"></div><div class="v"><i></i></div></div><div class="ban"><div class="b1"></div><div class="b2"></div></div><div class="fine" hidden></div>`;ov.appendChild(el);
  const q=s=>el.querySelector(s),U={el,vita:q('.vita .b i'),ani:q('.vita .a'),rnd:q('.rnd'),boss:q('.boss'),bossN:q('.boss .n'),bossV:q('.boss .v i'),ban:q('.ban'),b1:q('.ban .b1'),b2:q('.ban .b2'),sangue:q('.sangue'),fine:q('.fine'),rk:'',banT:0,flash:0};
  // la fiammella dell'anima accanto alla vita
  {const g=U.ani.getContext('2d');fiamma(g,13,30,1.6,1)}
  return U}
// una fiammella verde (l'anima) in g: x, y alla base, s grandezza, a trasparenza
function fiamma(g,x,y,s,a){g.save();g.globalAlpha*=a;g.translate(x,y);g.scale(s,s);g.fillStyle=INK;g.beginPath();g.moveTo(0,-10.5);g.quadraticCurveTo(5.5,-4,3.6,0);g.quadraticCurveTo(0,2.6,-3.6,0);g.quadraticCurveTo(-5.5,-4,0,-10.5);g.fill();
  g.fillStyle='#5dff8f';g.beginPath();g.moveTo(0,-9);g.quadraticCurveTo(4.3,-3.6,2.7,-.5);g.quadraticCurveTo(0,1.4,-2.7,-.5);g.quadraticCurveTo(-4.3,-3.6,0,-9);g.fill();
  g.fillStyle='#e8fff0';g.beginPath();g.ellipse(0,-2.6,1.3,2.2,0,0,TAU);g.fill();g.restore()}
// il numero del round: tacche di gesso rosso (la quinta di traverso) fino a 5, poi il numero; bianco quando cambia, poi torna rosso
function drawRound(U){const R=D.R,k=R+'|'+(U.flash>0?Math.ceil(U.flash*10):0);if(k===U.rk)return;U.rk=k;const g=U.rnd.getContext('2d'),w=152,h=116;g.clearRect(0,0,w,h);if(R<1)return;
  const f=cl(U.flash/.5,0,1),col=`rgb(${Math.round(lerp(176,245,f))},${Math.round(lerp(24,240,f))},${Math.round(lerp(22,232,f))})`;g.lineCap='round';g.lineJoin='round';
  if(R<=5){const r=n=>{let s=Math.sin(n*12.9898+R*78.233)*43758.5453;return s-Math.floor(s)},mark=(x0,y0,x1,y1,i)=>{for(const[lw,c] of[[11,'#000'],[6.5,col]]){g.strokeStyle=c;g.lineWidth=lw;g.beginPath();g.moveTo(x0,y0);
      g.quadraticCurveTo((x0+x1)/2+(r(i)-.5)*6,(y0+y1)/2,x1,y1);g.stroke()}};
    for(let i=0;i<Math.min(4,R);i++){const x=24+i*28+(r(i+1)-.5)*5;mark(x,16+r(i+5)*6,x+(r(i+9)-.5)*8,h-14-r(i+3)*6,i)}
    if(R===5)mark(10,h-26,w-12,24,7)}
  else{g.font='400 86px "Lilita One",system-ui';g.textAlign='right';g.textBaseline='middle';g.lineJoin='round';g.lineWidth=9;g.strokeStyle='#000';g.strokeText(R,w-6,h/2+6);g.fillStyle=col;g.fillText(R,w-6,h/2+6)}}
function banner(t1,t2,secs){const U=D.ui;if(!U)return;U.b1.textContent=t1;U.b2.textContent=t2||'';U.ban.classList.add('on');U.banT=secs||2.6}
// ------------------------------------------------------------------ i round
function startRound(R){D.R=R;D.st='round';D.t=0;const bk=bossDi(R);D.left=bk?Math.round(quota(R)*.25):quota(R);D.sp=1.2;D.boss=null;D.bossT=bk?2.6:0;D.bossK=bk;D.kills0=W.kills||0;
  if(D.ui)D.ui.flash=.9;banner('Round '+R,bk?NOMI[bk]+' sta arrivando…':'',2.8);suono(bk?'boss':'round')}
function endRound(){D.st='pausa';D.t=0;banner('Round superato','Il prossimo tra '+PZ.pausa+' secondi',2.6);suono('fine')}
// uno zombie del round: dalle buche delle zone aperte, col tipo e la forza del round
function spawnOne(){const k=tipo(D.R),z=spawn({kind:k,hp:hpMul(D.R)*(k==='hound'?.8:1),spd:spdMul(D.R,k),q:1});if(z){z.dmg=(PZ.danno[k]||30)*dmgMul(D.R);z.dashCd=rr(1,4)}return z}
const vivi=()=>W.Z.filter(z=>z.q&&!z.die).length;
// ------------------------------------------------------------------ l'eroe: colpi, caduta, l'anima che lo rialza, la fine
// (con gli zombie spenti, o W.dbg.god nelle prove, nessuno fa male)
function hurtHero(n){const h=W.hero;if(h.dead||D.inv>0||D.st==='fine'||W.dbg.god||!D.on)return;D.hp-=n;D.hurtT=0;D.inv=PZ.inv;D.red=1;D.shake=Math.max(D.shake,.25);suono('colpito');
  for(let i=0;i<5;i++)W.FX.push({k:'drop',tw:[h.x,h.y,h.zh||0],x:0,y:-30,vx:rr(-50,50),vy:rr(-80,-20),t:.55});if(D.hp<=0)down()}
function down(){const h=W.hero;D.hp=0;h.dead=true;h.moving=false;D.prev=['inizio','pausa','round'].includes(D.st)?D.st:'round';D.st='giu';D.t=0;suono('cade')}
function revive(){const h=W.hero;D.anime=0;D.st='su';D.t=0;D.hp=PZ.vita;D.burst.push({x:h.x,y:h.y,t:0});suono('anima');W.toast=["L'anima ti rialza",2.2];
  for(const z of W.Z){if(z.die||z.idle||z.rise<1)continue;const dx=z.x-h.x,dy=z.y-h.y,d=Math.hypot(dx,dy)||1;if(d<120){move(z,dx/d*(130-d)*.7,dy/d*(130-d)*.7,11);if(!z.ai)z.stun=1.6}}
  if(D.lant&&D.comprate<PZ.anima.max)D.lant.set(true)}
function gameOver(){D.st='fine';D.t=0;const R=D.R,oro=PZ.oro(R),U=D.ui;suono('morte');W.coins=0;D.oro=oro;
  if(U){U.fine.hidden=false;U.fine.innerHTML=`<h2>Sei caduto</h2><p>Round raggiunto: <b>${R}</b></p><p>Zombie uccisi: <b>${W.kills||0}</b></p><p>Oro per il menu: <b>● ${oro.toLocaleString('it-IT')}</b></p><small>(nel gioco vero andrà nel tuo oro)</small><button>Riprova</button>`;
    U.fine.querySelector('button').onclick=()=>location.reload();requestAnimationFrame(()=>U.fine.classList.add('on'))}}
// ------------------------------------------------------------------ i boss: escono da terra lontano dall'eroe (una buca di una zona aperta)
function spawnBoss(k){const h=W.hero,H=ZM.holes.filter(p=>(p[2]==null||W.zoneOpen[p[2]])&&p[3]!=='porta'&&Math.hypot(p[0]-h.x,p[1]-h.y)>150);let p=H.length?H[Math.floor(Math.random()*H.length)]:null;
  if(!p){for(let i=0;i<40&&!p;i++){const a=rr(0,TAU),r=rr(170,260),x=h.x+Math.cos(a)*r,y=h.y+Math.sin(a)*r;if(!hit(x,y,16))p=[x,y]}}if(!p)p=[h.x+150,h.y];
  const n=D.R/(k==='becchino'?5:10),B=k==='becchino'?PZ.becchino:PZ.spaventa,hp=B.vita*Math.pow(Math.max(1,n),1.3);
  const z={kind:k,sc:k==='becchino'?2:1.4,spd:B.passo*Math.min(1.5,1+.06*(D.R/5-1)),spd0:0,hp,hp0:hp,x:p[0],y:p[1],face:Math.atan2(h.y-p[1],h.x-p[0]),p:0,anim:'idle',rise:0,die:0,flash:0,q:1,boss:1,
    reward:Math.round(B.premio*(1+.2*(n-1))),ai:k==='becchino'?becchinoAI:spaventaAI};z.spd0=z.spd;W.Z.push(z);D.boss=z;D.shake=.5;suono('boss');
  if(D.ui){D.ui.boss.hidden=false;D.ui.bossN.textContent=NOMI[k]}banner(NOMI[k],'',2.2)}
const setA=(z,an)=>{if(z.anim!==an){z.anim=an;z.p=0}};
// il Becchino: cammina piano verso l'eroe; vicino alza la pala dietro la testa e la sbatte a terra davanti a sé (un cerchio verde avvisa dove
// colpirà); ogni 13 s alza il braccio e dal cerchio verde escono due morti intorno all'eroe (tre dal round 15)
function becchinoAI(z,dt){const h=W.hero,dx=h.x-z.x,dy=h.y-z.y,d=Math.hypot(dx,dy),A=z.A||(z.A={st:'cammina',t:0,ev:5});A.t+=dt;A.ev-=dt;
  if(A.st==='cammina'){setA(z,'walk');z.p=(z.p+dt/1.7)%1;if(!h.dead)z.face=Math.atan2(dy,dx);
    if(A.ev<=0&&!h.dead&&d<330){A.st='evoca';A.t=0;A.sum=0;setA(z,'summon');A.ev=PZ.becchino.evoca;suono('evoca')}// (quando è pronta l'evocazione viene prima: lo scontro cambia)
    else if(!h.dead&&d<70&&physClear(z.x,z.y,h.x,h.y,2)){A.st='colpo';A.t=0;A.hit=0;setA(z,'slam');const a=Math.atan2(dy,dx);A.tx=z.x+Math.cos(a)*42;A.ty=z.y+Math.sin(a)*42;z.face=a;D.warn.push({x:A.tx,y:A.ty,r:46,t:0,T:.8})}
    else if(!h.dead&&d>40)zWalk(z,dt)}
  else if(A.st==='colpo'){z.p=Math.min(.999,A.t/1.45);if(!A.hit&&A.t>=.8){A.hit=1;D.cracks.push({x:A.tx,y:A.ty,a:z.face,t:0,s:Math.random()*99});D.shake=Math.max(D.shake,.45);suono('colpo');
      if(Math.hypot(h.x-A.tx,h.y-A.ty)<46+8)hurtHero(PZ.becchino.colpo*dmgMul(D.R))}if(A.t>=1.45)A.st='cammina'}
  else if(A.st==='evoca'){z.p=Math.min(.999,A.t/1.8);if(!A.sum&&A.t>=.85){A.sum=1;evoca(D.R>=15?3:2)}if(A.t>=1.8)A.st='cammina'}}
// tre morti escono da terra intorno all'eroe (contano per il round)
function evoca(n){const h=W.hero;for(let i=0;i<n;i++){let p=null;for(let k=0;k<25&&!p;k++){const a=rr(0,TAU),r=rr(80,150),x=h.x+Math.cos(a)*r,y=h.y+Math.sin(a)*r;if(!hit(x,y,14)&&physClear(h.x,h.y,x,y,1))p=[x,y]}
  if(!p)continue;const kd=KINDS[0],z={kind:kd[0],sc:kd[1],spd:kd[2]*spdMul(D.R,'zombie'),hp:kd[3]*hpMul(D.R),x:p[0],y:p[1],face:Math.atan2(h.y-p[1],h.x-p[0]),p:Math.random(),anim:'walk',rise:0,die:0,flash:0,q:1};
  z.spd0=z.spd;z.dmg=PZ.danno.zombie*dmgMul(D.R);W.Z.push(z);D.warn.push({x:p[0],y:p[1],r:20,t:0,T:1.3,sum:1})}}
// lo Spaventapasseri: saltella come un burattino verso l'eroe; vicino fa la trottola (gira su se stesso col palo: fa male a chi gli sta
// attaccato, tre volte al giro) e intanto scivola verso l'eroe
function spaventaAI(z,dt){const h=W.hero,dx=h.x-z.x,dy=h.y-z.y,d=Math.hypot(dx,dy),A=z.A||(z.A={st:'cammina',t:0});A.t+=dt;
  if(A.st==='cammina'){setA(z,'walk');z.p=(z.p+dt/1.1)%1;if(!h.dead)z.face=Math.atan2(dy,dx);
    if(!h.dead&&d<52&&physClear(z.x,z.y,h.x,h.y,2)){A.st='giro';A.t=0;A.tick=0;setA(z,'attack');D.warn.push({x:z.x,y:z.y,r:44,t:0,T:.45,follow:z});suono('trottola')}
    else if(!h.dead&&d>30)zWalk(z,dt)}
  else if(A.st==='giro'){z.p=(A.t/1.8)%1;if(A.t>.45&&!h.dead&&d>18){const sp=34*dt;move(z,dx/d*sp,dy/d*sp,11)}
    const k=Math.floor(Math.max(0,A.t-.45)/.38);if(A.t>.45&&k>=A.tick){A.tick=k+1;if(d<46)hurtHero(PZ.spaventa.giro*dmgMul(D.R))}if(A.t>=1.8+.45){A.st='cammina';A.t=0}}}
// ------------------------------------------------------------------ ogni fotogramma
D.update=(dt,on)=>{const h=W.hero;D.on=on;if(!D.ui)D.ui=mkUI();D.t+=dt;D.inv-=dt;D.red=Math.max(0,D.red-dt*1.6);D.shake=Math.max(0,D.shake-dt);
  if(D.st==='inizio'){if(D.t>=PZ.inizio)startRound(1)}
  else if(D.st==='round'){if(D.bossT>0&&(D.bossT-=dt)<=0)spawnBoss(D.bossK);
    if(on&&!W.dbg.noSpawn&&D.left>0&&(D.sp-=dt)<=0){if(vivi()<maxVivi(D.R)&&spawnOne()){D.left--;D.sp=intervallo(D.R)}else D.sp=.35}
    if(D.left<=0&&D.bossT<=0&&vivi()===0)endRound()}
  else if(D.st==='pausa'){if(D.t>=PZ.pausa)startRound(D.R+1)}
  else if(D.st==='giu'){h.fall=ez(Math.min(1,D.t/.55));if(D.t>=1.5){if(D.anime>0)revive();else gameOver()}}
  else if(D.st==='su'){h.fall=1-ez(Math.min(1,D.t/.8));if(D.t>=.9){h.dead=false;h.fall=0;D.inv=2.5;D.st=D.prev;D.t=0}}
  // la vita torna dopo qualche secondo senza colpi
  if(!h.dead&&D.st!=='fine'){D.hurtT+=dt;if(D.hurtT>PZ.ricarica)D.hp=Math.min(PZ.vita,D.hp+PZ.rigenera*dt)}
  // dal round 4 gli zombie a volte scattano all'improvviso quando l'eroe è vicino (lenti e poi uno scatto)
  if(D.R>=4)for(const z of W.Z){if(z.die||z.idle||z.ai||z.rise<1||!z.spd0)continue;z.dashCd=(z.dashCd||0)-dt;if(z.dashT>0){z.dashT-=dt;if(z.dashT<=0)z.spd=z.spd0}
    else if(z.dashCd<=0){z.dashCd=rr(.6,1.2);const d=Math.hypot(h.x-z.x,h.y-z.y);if(d<150&&d>40&&Math.random()<.22*Math.min(1,(D.R-3)/6)){z.dashT=.5;z.spd=z.spd0*2.2;z.dashCd=rr(2.5,4)}}}
  for(const w of D.warn)w.t+=dt;D.warn=D.warn.filter(w=>w.t<w.T);for(const c of D.cracks)c.t+=dt;D.cracks=D.cracks.filter(c=>c.t<2.2);for(const b of D.burst)b.t+=dt;D.burst=D.burst.filter(b=>b.t<1.2);
  if(D.fly&&(D.fly.t+=dt)>=.9)D.fly=null;
  // le scritte
  const U=D.ui;if(U){U.vita.style.transform=`scaleX(${(D.hp/PZ.vita).toFixed(3)})`;U.ani.classList.toggle('on',D.anime>0);if(U.flash>0)U.flash-=dt;drawRound(U);
    if(U.banT>0&&(U.banT-=dt)<=0)U.ban.classList.remove('on');
    const low=D.hp<40&&!h.dead?.35+.25*Math.sin(W.t*5):0;U.sangue.style.opacity=Math.min(1,Math.max(D.red*.9,low,h.dead?.85:0)).toFixed(2);
    if(D.boss){const b=D.boss;U.bossV.style.transform=`scaleX(${Math.max(0,b.hp/b.hp0).toFixed(3)})`;if(b.die)U.boss.hidden=true}
    const cv=document.getElementById('mzCv');if(cv)cv.style.transform=D.shake>0&&!LOWFX?`translate(${(Math.random()-.5)*10*D.shake}px,${(Math.random()-.5)*10*D.shake}px)`:''}};
// ogni colpo che va a segno dà qualche moneta (come in CoD), una volta per sparo anche se i pallini sono tanti
D.shotHit=()=>{W.coins+=PZ.colpo};
D.zombieHit=(z,d)=>{if(d>36)return;hurtHero(z.dmg||(PZ.danno[z.kind]||30)*dmgMul(Math.max(1,D.R)))};
D.killed=z=>{if(z!==D.boss)return;suono('boss_giu');const g=ZM.gun();if(g){g.mag=g.D.mag;g.res=Math.max(g.res,g.D.res)}W.toast=[NOMI[z.kind]+' è sconfitto! Munizioni piene',3];D.shake=.6;D.burst.push({x:z.x,y:z.y,t:0,boss:1})};
// ------------------------------------------------------------------ i disegni: a terra (avvisi, crepe, cerchi), sull'eroe (l'anima), in aria
D.drawGround=()=>{if(!D.warn.length&&!D.cracks.length&&!D.burst.length)return;inGround(()=>{
  for(const w of D.warn){const k=w.t/w.T,x=w.follow?w.follow.x:w.x,y=w.follow?w.follow.y:w.y;ctx.save();
    if(w.sum){ctx.globalAlpha=Math.min(1,k*3)*(1-k*k);ctx.strokeStyle='rgba(120,255,160,.9)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,w.r*(.5+k*.5),0,TAU);ctx.stroke();ctx.fillStyle='rgba(30,90,40,.35)';ctx.fill()}
    else{ctx.fillStyle='rgba(120,10,10,.18)';ctx.beginPath();ctx.arc(x,y,w.r,0,TAU);ctx.fill();ctx.fillStyle=`rgba(200,40,30,${.25+.3*k})`;ctx.beginPath();ctx.arc(x,y,w.r*k,0,TAU);ctx.fill();
      ctx.strokeStyle=`rgba(255,90,70,${.6+.4*Math.sin(w.t*30)*.5})`;ctx.lineWidth=2.2;ctx.beginPath();ctx.arc(x,y,w.r,0,TAU);ctx.stroke()}ctx.restore()}
  for(const c of D.cracks){const a=1-cl((c.t-1.4)/.8,0,1);ctx.save();ctx.globalAlpha=a;ctx.translate(c.x,c.y);let s=c.s;const r=()=>{s=(s*16807+7)%2147483647;return s/2147483647};
    ctx.strokeStyle='rgba(20,12,8,.85)';ctx.lineWidth=3;ctx.lineCap='round';for(let i=0;i<7;i++){const an=c.a+(i-3)*.55+r()*.3;let x=0,y=0;ctx.beginPath();ctx.moveTo(0,0);for(let j=0;j<3;j++){x+=Math.cos(an+(r()-.5)*.8)*(9+r()*9);y+=Math.sin(an+(r()-.5)*.8)*(9+r()*9);ctx.lineTo(x,y)}ctx.stroke()}
    if(!LOWFX){ctx.globalCompositeOperation='lighter';glow('110,255,150',0,0,40,.55*a*(1-c.t/2.2))}ctx.restore()}
  for(const b of D.burst){const k=b.t/1.2;ctx.save();ctx.globalAlpha=1-k;ctx.strokeStyle=b.boss?'rgba(255,220,120,.9)':'rgba(130,255,170,.95)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(b.x,b.y,20+k*(b.boss?160:120),0,TAU);ctx.stroke();ctx.restore()}})};
D.drawOnHero=q=>{if(D.anime>0&&!D.fly){const a=W.t*2.3,x=q[0]+Math.cos(a)*15,y=q[1]-38+Math.sin(a)*5,fl=1+.08*Math.sin(W.t*13);if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow('110,255,150',x,y-3,16,.55);ctx.restore()}fiamma(ctx,x,y+4,.62*fl,1)}};
D.drawTop=()=>{const h=W.hero;
  // l'anima che vola dalla lanterna all'eroe
  if(D.fly){const k=ez(D.fly.t/.9),a=S(D.fly.x,D.fly.y,D.fly.z),b=S(h.x,h.y,(h.zh||0)+38),x=lerp(a[0],b[0],k),y=lerp(a[1],b[1],k)-Math.sin(k*Math.PI)*40;if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow('110,255,150',x,y-3,22,.7);ctx.restore()}fiamma(ctx,x,y+4,.8,1)}
  // l'anima che rialza: una colonna di luce verde
  for(const b of D.burst){if(b.boss||LOWFX)continue;const k=b.t/1.2,q=S(b.x,b.y,0);ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createLinearGradient(q[0],q[1],q[0],q[1]-120);g.addColorStop(0,`rgba(110,255,150,${.5*(1-k)})`);g.addColorStop(1,'rgba(110,255,150,0)');
    ctx.fillStyle=g;ctx.fillRect(q[0]-18*(1-k*.5),q[1]-120,36*(1-k*.5),120);ctx.restore()}};
// ------------------------------------------------------------------ l'accensione dall'area: la Lanterna delle Anime da comprare
ZM.partita=function(o){o=o||{};W.director=D;W.kills=0;D.lant=o.lanterna||null;
  if(D.lant)ZM.buyable({id:'anima',x:D.lant.x,y:D.lant.y+16,r:58,show:()=>D.anime===0&&D.comprate<PZ.anima.max&&D.st!=='fine'&&!W.hero.dead,label:()=>'Lanterna delle Anime',price:()=>PZ.anima.prezzo,
    act(){if(W.coins<PZ.anima.prezzo)return false;W.coins-=PZ.anima.prezzo;D.anime=1;D.comprate++;D.lant.set(false);D.fly={t:0,x:D.lant.x,y:D.lant.y,z:D.lant.z};suono('compra');W.toast=["Un'anima ti segue: ti rialzerà una volta",2.6];return true}});
  return D};
// per le prove: le funzioni del round
D.PZ=PZ;D.quota=quota;D.hpMul=hpMul;D.spdMul=spdMul;D.startRound=startRound;D.hurtHero=hurtHero;D.spawnBoss=spawnBoss;
})();
