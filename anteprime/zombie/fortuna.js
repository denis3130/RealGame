// ---------- LA MACCHINA DELLA FORTUNA e le LUCKY CARDS in partita (punti 33, 35 e 36 del piano di Denis, anteprima 47).
// La macchina: un piccolo armadietto di legno scuro con le guarnizioni d'ottone, una cupola di vetro con dentro una fiamma verde che guarda
// intorno (un occhio), un ingranaggio che gira sul fianco, una leva, la fessura da cui esce la carta. Due in tutta la mappa (una
// nell'area di partenza, una nella fattoria). Avvicinandosi: il bottone «Macchina della Fortuna», gratis una volta ogni 5 round (dal round 5),
// le altre volte 2.000 monete della partita: esce una carta a caso che si accende subito. Se hai portato una tua Lucky Card dal menu
// (src/js/71-menu-zombie.js), accanto compare «La tua carta»: la usi lì (al massimo 2 dello stesso tipo in una partita) e si consuma.
// Le carte accese bruciano piano a destra dello schermo: il fuoco scende col tempo che resta (le istantanee bruciano subito, l'autorianimazione
// resta finché non serve, il colpo fortunato finché non usi un'altra carta). Gli effetti passano dal motore con W.mods.
(()=>{const{P,box,cyl,ballAt,line3,fn3,plane,prop,solid,shade,flames,lights,W,S,rr,cl,lerp,ez,TAU,material,move}=ZM;
const E=(a,...b)=>a.push(...b);
material('fortWood',['#3c2a3e','#23172a','#5a425e'],'plank');
const LKP={prezzo:2000,ogni:5,maxTipo:2,pesi:[50,32,15,3],raggio:58};
// le carte (dal gioco: LUCKY in src/js/68-economia.js; nella pagina di prova questi nomi)
const DEF0=[['munizioni',"Munizioni d'emergenza",0,'i'],['impulso','Impulso repulsivo',0,'i'],['cassa','Cash istantaneo',1,'i'],['scudo','Scudo temporaneo',1,'t',20],['rigenera','Rigenerazione',1,'t',25],
  ['raffica','Raffica infinita',2,'t',18],['invisibile','Invisibilità',2,'t',15],['fortuna','Colpo fortunato',2,'p'],['rialzati','Autorianimazione',3,'p']].map(([id,n,rar,k,s])=>({id,n,rar,k,s}));
const defs=()=>{try{return typeof LUCKY!=='undefined'?LUCKY:DEF0}catch(e){return DEF0}};
const defOf=id=>defs().find(c=>c.id===id)||DEF0[0];
const inGame=()=>!!W.gioco;
// lo stato della partita: le carte accese (act), quante carte proprie usate per tipo (used), l'ultimo blocco di 5 round col giro gratis
const LK={act:[],used:{},freeBlk:0,pocket:null,fly:[],crits:[],rings:[],ui:null,crk:0,near:null,base:{spd:1,cash:1,dmg:1}};
const MACH=[];
const R=()=>W.director?W.director.R||0:0;
const freeNow=()=>R()>=LKP.ogni&&Math.floor(R()/LKP.ogni)>LK.freeBlk;
// ------------------------------------------------------------------ i suoni: l'ingranaggio, l'erogazione, la carta che prende fuoco, il crepitio
function suono(w,k){try{if(typeof AU==='undefined'||!AU.ctx||!AU.on.sfx)return;const t=AU.ctx.currentTime+.01;AU.pan=0;
  if(w==='eroga'){for(let i=0;i<7;i++)fModal(t+i*.07,rr(1500,1900),[1,2.4,4.1],[.05,.03,.02],.05,.1);fNoise(t+.1,.55,'bandpass',600,1.6,.09,{f2:2600});vBell(null,t+.55,84,1.4,.08);vBell(null,t+.68,91,1.2,.06);
    if(k>=2)vChoir(null,t+.6,[64,67,71],1.8,.05);if(k>=3)vBell(null,t+.8,96,1.6,.06)}
  else if(w==='accende'){fNoise(t,.5,'lowpass',900,.8,.12,{brown:true,att:.08,f2:300});fNoise(t,.18,'highpass',3200,1,.05)}
  else if(w==='crepita')fNoise(t,.025+Math.random()*.03,'highpass',rr(2200,5200),.7,.012+Math.random()*.012)
  else if(w==='tic')fModal(t,rr(2400,2800),[1,3.1],[.03,.02],.018,.05)
  else if(w==='impulso'){fThump(t,140,40,.5,.6,.4);fNoise(t,.5,'bandpass',500,1,.2,{f2:1800})}
  else if(w==='cassa'){for(let i=0;i<8;i++)coinClink(t+i*.06,.9)}
  else if(w==='scudo'){vBell(null,t,76,1.4,.07);vBell(null,t+.08,83,1.2,.05);fNoise(t,.4,'bandpass',2400,3,.04,{f2:1200})}
  else if(w==='rialza'){vChoir(null,t,[60,64,67,72],1.8,.08);vBell(null,t+.2,84,1.3,.1)}
  else if(w==='colpo')fThump(t,90,40,.12,.25,.1)}catch(e){}}
// ------------------------------------------------------------------ la macchina (un prop come gli altri: volumi 3D, tre toni, contorno scuro)
// la targa d'ottone sul davanti: l'occhio nel quadrifoglio, la scritta, la fessura delle carte
const frontTex=(w,h)=>{const g=ctx;g.fillStyle='#8a7030';g.fillRect(1,1,w-2,h-2);const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'rgba(255,240,180,.45)');gr.addColorStop(1,'rgba(40,20,0,.4)');g.fillStyle=gr;g.fillRect(1,1,w-2,h-2);
  g.strokeStyle='#2a1c08';g.lineWidth=.9;g.strokeRect(1.5,1.5,w-3,h-3);g.strokeStyle='rgba(255,236,170,.5)';g.lineWidth=.5;g.strokeRect(2.6,2.6,w-5.2,h-5.2);
  const cx=w/2,cy=h*.38;g.fillStyle='#2e5a2a';for(let k=0;k<4;k++){const a=k*Math.PI/2+Math.PI/4;g.beginPath();g.arc(cx+Math.cos(a)*2.6,cy+Math.sin(a)*2.6,2.3,0,TAU);g.fill()}
  g.fillStyle='#f4ecd0';g.beginPath();g.ellipse(cx,cy,2.2,1.4,0,0,TAU);g.fill();g.fillStyle='#1a3a1a';g.beginPath();g.arc(cx,cy,.8,0,TAU);g.fill();
  g.font='400 3px "Lilita One",system-ui';g.textAlign='center';g.fillStyle='#2a1c08';g.fillText('FORTUNA',cx,h*.66);
  g.fillStyle='#0c0806';g.fillRect(cx-4.5,h*.76,9,1.6);g.fillStyle='rgba(255,236,170,.5)';g.fillRect(cx-4.5,h*.76+1.6,9,.4)};
// la cupola: il vetro, dentro la fiamma verde con l'occhio che guarda intorno e sbatte; brilla d'oro quando c'è il giro gratis, lampeggia quando eroga
function drawDome(S2,m){const c=S2(m.x,m.y,36),x=c[0],y=c[1],t=W.t+m.ph,fr=freeNow(),dk=m.disp>0?m.disp:0,r=8.4;ctx.save();
  if(!LOWFX){ctx.globalCompositeOperation='lighter';glow(fr?'255,220,120':'110,255,170',x,y,26+dk*16,.32+.12*Math.sin(t*2.4)+dk*.5);ctx.globalCompositeOperation='source-over'}
  const g=ctx.createRadialGradient(x-2,y-2,1,x,y,r);g.addColorStop(0,'rgba(140,255,190,.38)');g.addColorStop(.7,'rgba(16,34,26,.6)');g.addColorStop(1,'rgba(6,12,10,.75)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();
  // la fiamma che galleggia
  const fy=y+1.5+Math.sin(t*1.7)*.8,fl=1+.1*Math.sin(t*11)+.06*Math.sin(t*23);ctx.save();ctx.translate(x,fy);ctx.scale(fl*.9,fl);
  ctx.fillStyle='rgba(120,255,170,.85)';ctx.beginPath();ctx.moveTo(0,-7.5);ctx.quadraticCurveTo(4.4,-2.5,3,1.6);ctx.quadraticCurveTo(0,4,-3,1.6);ctx.quadraticCurveTo(-4.4,-2.5,0,-7.5);ctx.fill();
  ctx.fillStyle='rgba(230,255,235,.95)';ctx.beginPath();ctx.ellipse(0,-.4,2.3,1.6,0,0,TAU);ctx.fill();
  const bl=(t%3.3)<.14?.15:1,lx=Math.sin(t*.7)*.9;ctx.fillStyle='#0f3a1c';ctx.beginPath();ctx.ellipse(lx,-.4,.95,.95*bl,0,0,TAU);ctx.fill();ctx.restore();
  // le scintille che le girano intorno (d'oro quando c'è il giro gratis)
  if(!LOWFX)for(let i=0;i<4;i++){const a=t*1.6+i*TAU/4,px=x+Math.cos(a)*(r+2.5),py=y+Math.sin(a)*(r+2.5)*.5;ctx.fillStyle=fr?`rgba(255,220,120,${.6+.4*Math.sin(t*5+i)})`:`rgba(150,255,190,${.35+.3*Math.sin(t*4+i)})`;ctx.beginPath();ctx.arc(px,py,.9,0,TAU);ctx.fill()}
  // il vetro: contorno, riflesso in alto a sinistra, bordo verde a destra, il lampo quando eroga
  ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke();ctx.strokeStyle='rgba(255,255,255,.65)';ctx.lineWidth=1.1;ctx.beginPath();ctx.arc(x,y,r-1.8,Math.PI*1.08,Math.PI*1.42);ctx.stroke();
  ctx.strokeStyle='rgba(140,255,190,.45)';ctx.lineWidth=.9;ctx.beginPath();ctx.arc(x,y,r-1,-Math.PI*.2,Math.PI*.25);ctx.stroke();
  if(dk>0){ctx.fillStyle=`rgba(230,255,240,${dk*.5})`;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill()}
  // la punta d'ottone in cima
  ctx.fillStyle='#c8a850';ctx.strokeStyle=INK;ctx.lineWidth=1.1;ctx.beginPath();ctx.arc(x,y-r-1.6,1.8,0,TAU);ctx.fill();ctx.stroke();ctx.restore()}
// l'ingranaggio sul fianco a est (gira piano, in fretta quando eroga) e la carta che esce dalla fessura
function drawGear(S2,m){const c=S2(m.x+11.4,m.y,14),x=c[0],y=c[1],t=W.t,an=m.rot,R0=5.6;ctx.save();ctx.translate(x,y);ctx.scale(.55,1);ctx.rotate(an);
  ctx.beginPath();for(let i=0;i<20;i++){const a=i*TAU/20,rr2=i%2?R0:R0+1.6;ctx.lineTo(Math.cos(a)*rr2,Math.sin(a)*rr2)}ctx.closePath();ctx.fillStyle='#b8943e';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.stroke();
  ctx.fillStyle='#6a5018';ctx.beginPath();ctx.arc(0,0,2.4,0,TAU);ctx.fill();ctx.stroke();ctx.strokeStyle='rgba(255,236,170,.6)';ctx.lineWidth=.8;ctx.beginPath();ctx.arc(0,0,R0-1,-2.4,-1.2);ctx.stroke();ctx.restore()}
function drawSlot(S2,m){if(!(m.disp>0))return;const k=1-m.disp/1.1,c=S2(m.x,m.y+7.4,10+k*10),x=c[0],y=c[1];ctx.save();ctx.globalAlpha=Math.min(1,m.disp*3);
  ctx.fillStyle='#f4ecd0';ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.fillRect(x-3,y-5,6,7);ctx.strokeRect(x-3,y-5,6,7);ctx.fillStyle=m.cardCol||'#7dffa0';ctx.fillRect(x-1.8,y-3.6,3.6,4.2);ctx.restore()}
P.fortuneMachine=function(x,y,i){solid(x-13,y-9,26,18);shade(x-12,y-8,24,16,40,.45);const parts=[],m={x,y,z:36,i,ph:i*1.7,disp:0,rot:0,spin:.6};MACH.push(m);
  const base=box(x-11,y-7,3,22,14,21,'fortWood',{noFoot:true,ow:1.8});
  E(parts,...box(x-12.5,y-8.5,0,25,17,3,'brass',{ow:1.4}),...base,...box(x-12.5,y-8.5,24,25,17,2.6,'brass',{noFoot:true,ow:1.4}));
  const front=base.find(t=>t.k==='face'&&t.key==='s');E(parts,plane(x-8,y+7,6,16,17,'x','fortuna_targa',frontTex,{host:front}));
  // le gambe d'ottone agli angoli, la leva a ovest con la palla rossa
  for(const[dx,dy] of[[-11,-7],[11,-7],[11,7],[-11,7]])E(parts,line3([x+dx,y+dy,3],[x+dx,y+dy,24],'#8a7030',1.6,{ink:true}));
  E(parts,line3([x-11,y+2,12],[x-16.5,y+2,21],'#3a2a20',2.2,{ink:true}),ballAt([x-16.8,y+2,22],2.2,'red',{ow:1.2}));
  E(parts,...cyl(x,y,26.6,7.4,2.4,'brass',{n:10}),fn3(S2=>drawGear(S2,m)),fn3(S2=>drawSlot(S2,m)),fn3(S2=>drawDome(S2,m)));
  // due lumini verdi sugli angoli davanti e la luce della cupola
  for(const dx of[-10,10]){E(parts,...cyl(x+dx,y+6,26.6,1.5,3,'brass',{n:6}));flames.push({x:x+dx,y:y+6,z:31,r:1.3,rgb:'120,255,170',ky:y+7})}
  lights.push({x,y:y+6,z:38,r:110,rgb:'110,255,170',a:.42,fl:1});
  prop({bx:[x-18,y-10,x+18,y+10,48],parts,noSplit:true});
  ZM.buyable({id:'fortuna'+i,x,y:y+14,r:LKP.raggio,show:()=>!!W.director&&W.director.st!=='fine'&&!W.hero.dead,
    label:()=>freeNow()?'Macchina della Fortuna · gratis!':'Macchina della Fortuna',price:()=>freeNow()?0:LKP.prezzo,
    act(){const fr=freeNow();if(!fr&&W.coins<LKP.prezzo)return false;if(fr)LK.freeBlk=Math.floor(R()/LKP.ogni);else W.coins-=LKP.prezzo;dispense(m,pick());return true}});
  return m};
// una carta a caso dalla macchina: prima la rarità (pesi), poi una carta di quella rarità
function pick(){const P0=LKP.pesi,tot=P0.reduce((a,b)=>a+b,0);let r=Math.random()*tot,rar=0;for(let i=0;i<P0.length;i++){r-=P0[i];if(r<0){rar=i;break}}const L=defs().filter(c=>c.rar===rar);return(L.length?L:defs())[Math.floor(Math.random()*(L.length||defs().length))].id}
// la macchina eroga: l'ingranaggio corre, la cupola lampeggia, la carta esce dalla fessura e vola su, poi si accende
const RCOL=['#cfd3d8','#4d97ff','#b874e6','#ffb020'];
function dispense(m,id,own){const L=defOf(id);m.disp=1.1;m.spin=7;m.cardCol=RCOL[L.rar]||'#7dffa0';suono('eroga',L.rar);LK.fly.push({m,id,t:0});
  W.toast=[(own?'La tua carta: ':'')+L.n,2.2];setTimeout(()=>activate(id),own?150:650)}
// ------------------------------------------------------------------ le carte accese: gli effetti
function activate(id){const L=defOf(id),h=W.hero,D=W.director;if(!D||D.st==='fine')return;
  // un'altra carta spegne il colpo fortunato
  for(const a of LK.act)if(a.id==='fortuna'&&!a.burn&&id!=='fortuna')burnOut(a);
  const ex=LK.act.find(a=>a.id===id&&!a.burn);suono('accende');
  if(L.k==='t'){if(ex){ex.t=0;ex.T=L.s}else LK.act.push(newCard(id,'t',L.s))}
  else if(L.k==='p'){if(!ex)LK.act.push(newCard(id,'p',0))}
  else{const a=newCard(id,'i',1.3);a.burn=true;LK.act.push(a);
    if(id==='munizioni'){const g=ZM.gun();if(g){g.mag=g.D.mag;g.res=Math.max(g.res,g.D.res);if(g.st==='ricarica')g.annulla()}W.toast=['Munizioni piene',2]}
    else if(id==='impulso'){suono('impulso');LK.rings.push({x:h.x,y:h.y,t:0});for(const z of W.Z){if(z.die||z.idle||z.rise<1)continue;const dx=z.x-h.x,dy=z.y-h.y,d=Math.hypot(dx,dy)||1;
      if(d<170){const Lp=(185-d)*.85,n=Math.ceil(Lp/4);for(let i=0;i<n;i++)move(z,dx/d*Lp/n,dy/d*Lp/n,11);if(!z.ai)z.stun=1.4}}}
    else if(id==='cassa'){W.coins+=2000;suono('cassa');W.FX.push({k:'coin',tw:[h.x,h.y,(h.zh||0)+46],n:2000,t:1.6,t0:1.6})}}
  if(id==='scudo')suono('scudo');applyMods()}
function newCard(id,kind,T){const c={id,kind,t:0,T,burn:false,in:0,emb:[],cv:null,img:null};return c}
function burnOut(a){if(a.burn)return;a.burn=true;a.kind='i';a.t=0;a.T=1.1}
// W.mods: la base della partita (livelli e accessori: src/js/63-zombie.js mette LK.base) più le carte accese
function applyMods(){const b=LK.base,on=id=>LK.act.some(a=>a.id===id&&!a.burn);W.mods={spd:b.spd||1,cash:b.cash||1,dmg:b.dmg||1,crit:on('fortuna')?.3:0,invis:on('invisibile')?1:0,shield:on('scudo')?1:0,regen:on('rigenera')?1:0,inf:on('raffica')?1:0}}
// l'autorianimazione: quando l'eroe cade (partita.js D.luckRevive)
function luckRevive(){const a=LK.act.find(a=>a.id==='rialzati'&&!a.burn);if(!a)return false;burnOut(a);suono('rialza');applyMods();return true}
// la tua carta, portata dal menu (SAVE.lucky.pick): alla macchina, al massimo 2 dello stesso tipo, e si consuma dall'inventario
function pocketLeft(){if(!inGame())return 0;try{const L=SAVE.lucky,id=L.pick;if(!id||!(L.inv[id]>0))return 0;return Math.min(L.inv[id],LKP.maxTipo-(LK.used[id]||0))}catch(e){return 0}}
function usePocket(){if(!LK.near||pocketLeft()<=0)return;const D=W.director;if(!D||D.st==='fine'||W.hero.dead)return;try{const L=SAVE.lucky,id=L.pick;L.inv[id]--;LK.used[id]=(LK.used[id]||0)+1;save();dispense(LK.near,id,true)}catch(e){}}
// ------------------------------------------------------------------ le carte che bruciano piano, in mezzo a destra (piccole, non coprono il gioco)
function mkUI(){const ov=document.getElementById('mz');if(!ov)return null;const el=document.createElement('div');el.id='mzLuck';el.innerHTML=`<style>
  #mzLuck{position:absolute;right:8px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:6px;pointer-events:none;z-index:2}
  #mzLuck canvas{position:relative;inset:auto;width:40px;height:58px;display:block}
  #mzLk{position:absolute;left:50%;bottom:calc(238px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);display:flex;align-items:center;gap:8px;padding:5px 12px 5px 6px;border-radius:13px;background:#1e2a22;border:2.5px solid #000;box-shadow:0 4px 0 #000,inset 0 0 0 2px #7dffa0;color:#efe6d0;font:700 12.5px "Baloo 2",system-ui;cursor:pointer;touch-action:none;-webkit-tap-highlight-color:transparent;pointer-events:auto;white-space:nowrap}
  #mzLk img{width:24px;height:auto;display:block}#mzLk b{display:block;font:400 14px "Lilita One",system-ui;color:#a6f0b0;line-height:1.1}#mzLk:active{transform:translateX(-50%) scale(.96)}
  #mzLk[hidden]{display:none}</style>`;ov.appendChild(el);
  const b=document.createElement('button');b.id='mzLk';b.type='button';b.hidden=true;ov.appendChild(b);b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();usePocket()});
  return{el,b,bk:''}}
// una carta: l'immagine (src/js/71-menu-zombie.js luckyCardImg), il fuoco che scende col tempo, il bordo bruciato, le braci, la cenere
function cardImg(a){if(a.img)return a.img;const im=new Image();try{im.src=typeof luckyCardImg==='function'?luckyCardImg(a.id,40):''}catch(e){}a.img=im;return im}
function drawCard(a,dt){if(!a.cv){a.cv=document.createElement('canvas');a.cv.width=80;a.cv.height=116;LK.ui.el.appendChild(a.cv)}const c=a.cv,g=c.getContext('2d'),W0=80,H0=116;g.clearRect(0,0,W0,H0);
  a.in=Math.min(1,a.in+dt*4);const k=a.kind==='t'?cl(a.t/a.T,0,1):a.burn?cl(a.t/a.T,0,1):0,by=H0*k,sc=.6+.4*ez(a.in);g.save();g.translate(W0/2,H0/2);g.scale(sc,sc);g.translate(-W0/2,-H0/2);
  // the glow behind a card that waits (the revive, the lucky shot)
  if(a.kind==='p'&&!a.burn){g.save();g.globalCompositeOperation='lighter';const gr=g.createRadialGradient(40,58,4,40,58,52);gr.addColorStop(0,`rgba(125,255,160,${.25+.15*Math.sin(W.t*3)})`);gr.addColorStop(1,'rgba(125,255,160,0)');g.fillStyle=gr;g.fillRect(0,0,W0,H0);g.restore()}
  // the card below the burning edge (the edge waves)
  const edge=x=>by+Math.sin(x*.21+W.t*5)*2.2+Math.sin(x*.53-W.t*3)*1.4;g.save();g.beginPath();g.moveTo(0,H0);for(let x=0;x<=W0;x+=4)g.lineTo(x,edge(x));g.lineTo(W0,H0);g.closePath();g.clip();
  const im=cardImg(a);if(im.complete&&im.naturalWidth)g.drawImage(im,4,4,72,108);else{g.fillStyle='#2a3a2e';g.fillRect(6,6,68,104)}
  // charred band under the edge
  if(k>0){const gr=g.createLinearGradient(0,by-2,0,by+11);gr.addColorStop(0,'rgba(20,10,4,.95)');gr.addColorStop(.5,'rgba(60,24,8,.55)');gr.addColorStop(1,'rgba(60,24,8,0)');g.fillStyle=gr;g.fillRect(0,by-4,W0,16)}g.restore();
  // the glowing edge of the fire and the embers that rise from it, the ash that falls
  if(k>0&&k<1){g.save();g.globalCompositeOperation='lighter';g.lineWidth=2.4;g.strokeStyle=`rgba(255,${150+Math.round(60*Math.sin(W.t*13))},60,.95)`;g.beginPath();for(let x=4;x<=W0-4;x+=4)g.lineTo(x,edge(x));g.stroke();
    g.lineWidth=6;g.strokeStyle='rgba(255,120,40,.25)';g.stroke();g.restore();
    if(!LOWFX&&Math.random()<dt*(a.burn?40:14))a.emb.push({x:rr(6,W0-6),y:by,vx:rr(-10,10),vy:rr(-40,-18),t:0,T:rr(.5,1),ash:Math.random()<.35})}
  for(const e of a.emb){e.t+=dt;e.x+=e.vx*dt;e.y+=(e.ash?-e.vy*.6:e.vy)*dt;const al=1-e.t/e.T;if(al<=0)continue;if(e.ash){g.fillStyle=`rgba(160,150,140,${al*.8})`;g.fillRect(e.x,e.y,2,1.4)}
    else{g.save();g.globalCompositeOperation='lighter';g.fillStyle=`rgba(255,${170+Math.round(60*al)},80,${al})`;g.beginPath();g.arc(e.x,e.y,1.3,0,TAU);g.fill();g.restore()}}
  a.emb=a.emb.filter(e=>e.t<e.T);g.restore();return k>=1&&!a.emb.length}
// ------------------------------------------------------------------ ogni fotogramma e i disegni (agganciati alla partita: partita.js D)
function update(dt){const D=W.director,h=W.hero;if(!LK.ui)LK.ui=mkUI();for(const m of MACH){m.disp=Math.max(0,m.disp-dt);m.spin+=(.6-m.spin)*Math.min(1,dt*1.5);m.rot+=m.spin*dt}
  // the cards: time, the effects that last (regeneration, endless ammo), the burnt ones go away
  for(const a of LK.act){a.t+=dt;if(a.kind==='t'&&!a.burn&&a.t>=a.T){a.burn=true;a.kind='i';a.t=a.T=1}}
  const g=ZM.gun(),MD=W.mods||{};
  if(MD.regen&&!h.dead&&D&&D.st!=='fine')D.hp=Math.min(D.PZ.vita,D.hp+6*dt);
  if(MD.inf&&g){g.mag=g.D.mag;if(g.cd>.6/g.D.rate)g.cd=.6/g.D.rate}
  // a gun with no bullets left (not the pistol): back to the pistol
  if(inGame()&&g&&W.gunId!=='pistola'&&g.mag<=0&&g.res<=0&&g.st!=='ricarica'&&!MD.inf){ZM.equip('pistola');W.toast=['Munizioni finite: torni alla pistola',2.4]}
  // the HUD cards
  if(LK.ui){for(const a of LK.act){const done=drawCard(a,dt);if(done)a.gone=true}for(const a of LK.act)if(a.gone&&a.cv){a.cv.remove();a.cv=null}LK.act=LK.act.filter(a=>!a.gone);
    // the crackle of the fire while a card burns
    if(LK.act.some(a=>a.kind!=='p'||a.burn)){LK.crk-=dt;if(LK.crk<=0){LK.crk=rr(.1,.28);suono('crepita')}}
    // your card, near a machine
    let near=null,bd=1e9;for(const m of MACH){const d=Math.hypot(h.x-m.x,h.y-m.y-14);if(d<LKP.raggio+6&&d<bd){bd=d;near=m}}LK.near=near;
    if(near&&near.tic==null)near.tic=0;if(near&&(near.tic-=dt)<=0){near.tic=.55;suono('tic')}
    const left=pocketLeft(),show=!!near&&left>0&&D&&D.st!=='fine'&&!h.dead,B=LK.ui.b;
    if(show){let id=null;try{id=SAVE.lucky.pick}catch(e){}const k=id+'|'+left;if(k!==LK.ui.bk){LK.ui.bk=k;const L=defOf(id);let src='';try{src=luckyCardImg(id,24)}catch(e){}B.innerHTML=`${src?`<img src="${src}" alt="">`:''}<span><b>La tua carta: ${L.n}</b>Tocca per usarla · ancora ${left}</span>`}}
    if(B.hidden===show)B.hidden=!show}
  for(const f of LK.fly)f.t+=dt;LK.fly=LK.fly.filter(f=>f.t<.9);for(const c of LK.crits)c.t+=dt;LK.crits=LK.crits.filter(c=>c.t<.6);for(const r of LK.rings)r.t+=dt;LK.rings=LK.rings.filter(r=>r.t<.7);
  applyMods()}
W.onCrit=z=>{if(LK.crits.length<12)LK.crits.push({x:z.x,y:z.y,z:(z.zh||0)+40*z.sc,t:0});suono('colpo')};
function drawTop(){
  // the card flying up from the machine
  for(const f of LK.fly){const k=f.t/.9,q=S(f.m.x,f.m.y,40+k*50);ctx.save();ctx.globalAlpha=1-k*k;ctx.translate(q[0],q[1]);ctx.rotate(Math.sin(k*9)*.25);const s=1+k*.6;ctx.scale(s,s);
    if(!LOWFX){ctx.globalCompositeOperation='lighter';glow('125,255,170',0,0,16,.6*(1-k));ctx.globalCompositeOperation='source-over'}
    ctx.fillStyle='#f4ecd0';ctx.strokeStyle=INK;ctx.lineWidth=1.4;ctx.fillRect(-4.5,-6.5,9,13);ctx.strokeRect(-4.5,-6.5,9,13);ctx.fillStyle=RCOL[defOf(f.id).rar]||'#7dffa0';ctx.fillRect(-3,-5,6,7);ctx.restore()}
  // the lucky shots: a golden star
  for(const c of LK.crits){const k=c.t/.6,q=S(c.x,c.y,c.z+k*16);ctx.save();ctx.globalAlpha=1-k;ctx.translate(q[0],q[1]);ctx.rotate(k*2);ctx.fillStyle='#ffd84a';ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.beginPath();
    for(let i=0;i<10;i++){const r=i%2?2.6:6.4,a=i*TAU/10-Math.PI/2;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r)}ctx.closePath();ctx.fill();ctx.stroke();ctx.restore()}
  // the push of the impulse
  for(const r of LK.rings){const k=r.t/.7,q=S(r.x,r.y,4);ctx.save();ctx.globalAlpha=1-k;ctx.strokeStyle='rgba(127,224,255,.95)';ctx.lineWidth=3*(1-k)+1;ctx.beginPath();ctx.ellipse(q[0],q[1],20+k*170,(20+k*170)*.55,0,0,TAU);ctx.stroke();ctx.restore()}}
function drawOnHero(q){const MD=W.mods||{},t=W.t;
  if(MD.shield){ctx.save();ctx.globalAlpha=.55+.15*Math.sin(t*4);ctx.strokeStyle='rgba(120,190,255,.9)';ctx.lineWidth=1.8;ctx.beginPath();ctx.ellipse(q[0],q[1]-20,17,25,0,0,TAU);ctx.stroke();
    if(!LOWFX){ctx.globalCompositeOperation='lighter';glow('110,170,255',q[0],q[1]-20,24,.25)}ctx.restore()}
  if(MD.regen&&!LOWFX&&Math.random()<.35)W.FX.push({k:'drop',tw:[W.hero.x+rr(-8,8),W.hero.y,(W.hero.zh||0)+rr(10,40)],x:0,y:-10,vx:0,vy:-30,t:.5});
  if(MD.inf&&!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow('255,190,90',q[0],q[1]-18,22,.2+.1*Math.sin(t*9));ctx.restore()}
  if(MD.invis&&!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<3;i++){const a=t*2+i*2.1;glow('170,220,255',q[0]+Math.cos(a)*10,q[1]-20+Math.sin(a*1.3)*12,7,.18)}ctx.restore()}}
// agganciati alla partita: aggiornamento, disegni, reset, rialzata
{const _p=ZM.partita;ZM.partita=function(o){const D=_p(o);if(D.__lk)return D;D.__lk=1;
  const _u=D.update;D.update=(dt,on)=>{_u(dt,on);try{update(dt)}catch(e){console.error(e)}};
  const _t=D.drawTop;D.drawTop=dt=>{_t(dt);drawTop()};const _h=D.drawOnHero;D.drawOnHero=q=>{drawOnHero(q);_h(q)};
  const _r=D.reset;D.reset=()=>{_r();for(const a of LK.act)if(a.cv)a.cv.remove();Object.assign(LK,{act:[],used:{},freeBlk:0,fly:[],crits:[],rings:[]});if(LK.ui){LK.ui.b.hidden=true;LK.ui.bk=''}for(const m of MACH){m.disp=0;m.spin=.6}applyMods()};
  D.luckRevive=luckRevive;return D}}
// la raffica: gli spari si sentono più pieni
if(window.ARMI&&ARMI.suono){const _s=ARMI.suono;ARMI.suono=function(id,w){const r=_s.apply(this,arguments);if(w==='sparo'&&W.mods&&W.mods.inf)suono('colpo');return r}}
ZM.fortuna={LK,MACH,activate,dispense,freeNow,pocketLeft,usePocket,applyMods,LKP}})();
