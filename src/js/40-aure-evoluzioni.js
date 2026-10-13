// ---------- evolution auras: the evolution's element bursts out of the hero, then fades ----------
const AURA={evo_chain:{rgb:'255,140,40',dur:2.2},evo_frost:{rgb:'140,215,255',dur:2.3},evo_rain:{rgb:'255,205,80',dur:2.2},evo_blades:{rgb:'210,225,245',dur:2},evo_lethal:{rgb:'255,50,60',dur:1.9},evo_fan:{rgb:'120,255,190',dur:2}};
function startAura(id){if(!AURA[id]||!G||!P)return;const A=G.aura={id,t:0,dur:AURA[id].dur,parts:[],acc:0},R=(n,f)=>{for(let i=0;i<n;i++)A.parts.push(f(i,n))};
  if(id==='evo_frost')R(11,(i,n)=>({k:'shard',a:i/n*TAU+rand(-.12,.12),len:rand(15,25),w:rand(4,6),t:0,max:1.5}));
  if(id==='evo_rain')R(10,(i,n)=>({k:'arrow',a:i/n*TAU,t:0,max:1.6}));
  if(id==='evo_blades')R(3,(i,n)=>({k:'blade',a:i/n*TAU,t:0,max:1.7}));
  if(id==='evo_fan')R(5,(i,n)=>({k:'gust',a:-Math.PI/2+(i-2)*.45,t:-i*.06,max:1}));
  if(id==='evo_chain')R(12,(i,n)=>({k:'tongue',a:i/n*TAU,t:0,max:.7}));
  if(id==='evo_lethal')R(1,()=>({k:'sight',t:0,max:1.5}));
  shake(4);vib([30,20,60])}
function updAura(dt){const A=G.aura;if(!A)return;A.t+=dt;if(A.t>=A.dur){G.aura=null;return}
  const live=A.t<A.dur*.72;A.acc+=dt;
  while(live&&A.acc>.02){A.acc-=.02;const a=rand(0,TAU),bx=P.x+Math.cos(a)*rand(3,11),by=P.y-8+Math.sin(a)*rand(2,12),id=A.id,R=Math.random();
    if(id==='evo_chain'){A.parts.push({k:'flame',x:bx+rand(-4,4),y:by+4,vx:rand(-22,22),vy:rand(-130,-60),t:0,max:rand(.4,.65),r:rand(6,11)});if(R<.35)A.parts.push({k:'ember',c:'255,190,90',x:bx,y:by,vx:rand(-70,70),vy:rand(-160,-60),t:0,max:rand(.5,.9),g:60})}
    else if(id==='evo_frost'){if(R<.55)A.parts.push({k:'flake',x:P.x+rand(-30,30),y:P.y-rand(6,48),vx:rand(-12,12),vy:rand(12,34),t:0,max:rand(.7,1.1),rot:rand(0,TAU),vr:rand(-3,3)})}
    else if(id==='evo_lethal'){if(R<.45)A.parts.push({k:'ember',c:'255,70,70',x:bx,y:by,vx:Math.cos(a)*rand(70,150),vy:Math.sin(a)*rand(50,110),t:0,max:rand(.25,.45)})}
    else if(id==='evo_fan'){if(R<.75)A.parts.push({k:'leaf',x:bx,y:by,vx:rand(-50,50),vy:rand(-130,-50),t:0,max:rand(.6,1),rot:rand(0,TAU),vr:rand(-9,9)})}
    else if(id==='evo_rain'){if(R<.35)A.parts.push({k:'ember',c:'255,215,110',x:bx,y:by,vx:rand(-30,30),vy:rand(-100,-40),t:0,max:rand(.4,.7),g:30})}
    else if(id==='evo_blades'){if(R<.3)A.parts.push({k:'ember',c:'235,245,255',x:bx,y:by,vx:rand(-110,110),vy:rand(-110,110),t:0,max:.28})}}
  for(const p of A.parts){p.t+=dt;if(p.vx!=null){p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.g)p.vy+=p.g*dt;if(p.k==='flame')p.vx*=.95}if(p.vr)p.rot+=p.vr*dt}
  A.parts=A.parts.filter(p=>p.t<p.max)}
function drawAura(front){const A=G.aura;if(!A||!P)return;const D=AURA[A.id],k=A.t/A.dur,fade=k<.08?k/.08:k>.7?Math.max(0,1-(k-.7)/.3):1,cx=P.x,cy=P.y-8,fy=P.y+5;
  ctx.save();
  if(!front){ctx.globalCompositeOperation='lighter';glow(D.rgb,cx,fy-6,52,.5*fade,30);glow(D.rgb,cx,cy,30,.35*fade);
    if(A.t<.55){const q=A.t/.55,r=12+78*q;ctx.strokeStyle=`rgba(${D.rgb},${.95*(1-q)})`;ctx.lineWidth=7*(1-q)+1;ell(cx,fy,r,r*.42);ctx.stroke();ctx.strokeStyle=`rgba(255,255,255,${.7*(1-q)})`;ctx.lineWidth=2;ell(cx,fy,r*.92,r*.39);ctx.stroke()}
    ctx.globalCompositeOperation='source-over'}
  for(const p of A.parts){const q=Math.max(0,p.t)/p.max;if(p.t<0)continue;
    if(p.k==='shard'){const inFront=Math.sin(p.a)>0;if(inFront!==front)continue;const g=Math.min(1,p.t/.18),sh=p.t>1.05?(p.t-1.05)/.45:0,L=p.len*g*(1-sh*.4),x0=cx+Math.cos(p.a)*16,y0=fy+Math.sin(p.a)*7,ox=Math.cos(p.a)*.55,oy=Math.sin(p.a)*.25;
      ctx.globalAlpha=1-sh;ctx.beginPath();ctx.moveTo(x0-p.w*Math.sin(p.a),y0+p.w*.4*Math.cos(p.a));ctx.lineTo(x0+ox*L,y0-L+oy*L);ctx.lineTo(x0+p.w*Math.sin(p.a),y0-p.w*.4*Math.cos(p.a));ctx.closePath();
      const gr=ctx.createLinearGradient(x0,y0,x0,y0-L);gr.addColorStop(0,'#5fb8e8');gr.addColorStop(1,'#eaffff');ctx.fillStyle=gr;ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.lineJoin='round';ctx.fill();ctx.stroke();
      ctx.strokeStyle='rgba(255,255,255,.85)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x0,y0-2);ctx.lineTo(x0+ox*L*.8,y0-L*.8+oy*L*.8);ctx.stroke();ctx.globalAlpha=1;continue}
    if(!front)continue;
    if(p.k==='flame'){ctx.globalCompositeOperation='lighter';const r=p.r*(1-q*.55);glow(q<.35?'255,230,140':q<.7?'255,140,40':'210,60,30',p.x,p.y,r*1.7,(1-q)*.9);glow('255,240,190',p.x,p.y,r*.6,(1-q)*.7);ctx.globalCompositeOperation='source-over'}
    else if(p.k==='ember'){ctx.globalCompositeOperation='lighter';ctx.fillStyle=`rgba(${p.c},${1-q})`;ctx.fillRect(p.x-1.3,p.y-1.3,2.6,2.6);ctx.globalCompositeOperation='source-over'}
    else if(p.k==='tongue'){const r=10+62*q,x=cx+Math.cos(p.a)*r,y=fy-4+Math.sin(p.a)*r*.45;ctx.globalCompositeOperation='lighter';glow('255,150,40',x,y-6,16*(1-q*.6),1-q,22*(1-q*.6));glow('255,235,160',x,y-4,6,(1-q)*.9);ctx.globalCompositeOperation='source-over'}
    else if(p.k==='flake'){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.globalAlpha=1-q;ctx.strokeStyle='#eaffff';ctx.lineWidth=1.4;ctx.beginPath();for(let i=0;i<3;i++){const a=i*Math.PI/3;ctx.moveTo(Math.cos(a)*-4,Math.sin(a)*-4);ctx.lineTo(Math.cos(a)*4,Math.sin(a)*4)}ctx.stroke();ctx.restore()}
    else if(p.k==='leaf'){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.globalAlpha=1-q;ell(0,0,4.2,2);ctx.fillStyle='#8ff0b4';ctx.fill();ctx.strokeStyle='rgba(27,22,18,.7)';ctx.lineWidth=1;ctx.stroke();ctx.restore()}
    else if(p.k==='arrow'){const ph=Math.min(1,p.t/.95),a=p.a+p.t*4.2,r=ph<1?18+12*ph:30+170*(p.t-.95),h=ph<1?6+30*ph:36+40*(p.t-.95),x=cx+Math.cos(a)*r,y=cy-h+Math.sin(a)*r*.45,dir=ph<1?a+Math.PI/2:Math.atan2(Math.sin(a)*.45-0.3,Math.cos(a));
      ctx.save();ctx.translate(x,y);ctx.rotate(dir);ctx.globalAlpha=ph<1?Math.min(1,p.t/.15):Math.max(0,1-(p.t-.95)/.6);ctx.globalCompositeOperation='lighter';glow('255,205,80',0,0,10,.6);ctx.globalCompositeOperation='source-over';
      ctx.strokeStyle=INK;ctx.lineWidth=3.6;ctx.beginPath();ctx.moveTo(-9,0);ctx.lineTo(7,0);ctx.stroke();ctx.strokeStyle='#ffd84a';ctx.lineWidth=1.8;ctx.stroke();ctx.fillStyle='#fff3b0';ctx.strokeStyle=INK;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(11,0);ctx.lineTo(5,-3.4);ctx.lineTo(5,3.4);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore()}
    else if(p.k==='blade'){const g=q<.15?q/.15:q>.75?1-(q-.75)/.25:1,r=14+26*Math.min(1,q/.3),a0=p.a+p.t*11;
      for(let j=3;j>=0;j--){const a=a0-j*.22;ctx.strokeStyle=j?`rgba(220,235,255,${.22*g*(4-j)/4})`:INK;ctx.lineWidth=j?5:4.5;ctx.beginPath();ctx.ellipse(cx,cy+2,r,r*.5,0,a-.5,a+.5);ctx.stroke()}
      ctx.strokeStyle=`rgba(235,245,255,${g})`;ctx.lineWidth=2.4;ctx.beginPath();ctx.ellipse(cx,cy+2,r,r*.5,0,a0-.5,a0+.5);ctx.stroke()}
    else if(p.k==='gust'){const d=12+130*q,a=p.a,x=cx+Math.cos(a)*d,y=cy+Math.sin(a)*d*.8,al=(1-q)*.95;ctx.lineCap='round';ctx.strokeStyle=`rgba(27,22,18,${al*.5})`;ctx.lineWidth=6*(1-q*.5);ctx.beginPath();ctx.arc(x-Math.cos(a)*12,y-Math.sin(a)*12,16,a-1.3,a+.25);ctx.stroke();ctx.strokeStyle=`rgba(190,255,225,${al})`;ctx.lineWidth=3.6*(1-q*.5);ctx.stroke();ctx.strokeStyle=`rgba(110,240,180,${al*.85})`;ctx.lineWidth=2;ctx.beginPath();ctx.arc(x-Math.cos(a)*22,y-Math.sin(a)*22,10,a-1.1,a+.3);ctx.stroke()}
    else if(p.k==='sight'){const c=Math.min(1,p.t/.32),r=60-42*(1-Math.pow(1-c,3)),pulse=c>=1?1+.12*Math.sin((p.t-.32)*18):1,al=p.t>1.1?1-(p.t-1.1)/.4:1;
      ctx.save();ctx.translate(cx,cy);ctx.rotate((1-c)*1.4);ctx.globalAlpha=al;ctx.lineWidth=4.5;ctx.strokeStyle=INK;circ(0,0,r*pulse);ctx.stroke();ctx.lineWidth=2.4;ctx.strokeStyle='#ff4a52';circ(0,0,r*pulse);ctx.stroke();
      for(let i=0;i<4;i++){ctx.rotate(Math.PI/2);ctx.lineWidth=4.5;ctx.strokeStyle=INK;ctx.beginPath();ctx.moveTo(r*pulse-7,0);ctx.lineTo(r*pulse+9,0);ctx.stroke();ctx.lineWidth=2.4;ctx.strokeStyle='#ff4a52';ctx.stroke()}
      if(p.t>.3&&p.t<.5){ctx.globalCompositeOperation='lighter';glow('255,60,70',0,0,70,(1-(p.t-.3)/.2)*.9)}ctx.restore()}}
  if(front&&A.t<.22){ctx.globalCompositeOperation='lighter';glow('255,255,255',cx,cy,24,(1-A.t/.22)*.5)}
  ctx.restore()}
{const _dh=drawHero;drawHero=function(){if(G&&G.aura)drawAura(false);_dh.apply(this,arguments);if(G&&G.aura)drawAura(true)}}
{const _up=update;update=function(dt){_up(dt);if(G&&G.aura)updAura(dt)}}
function onRoomClear(){if(G.event==='sfida'){trialReward();return}if(G.event)return;SAVE.stats.rooms++;mprog('room',null,G.room,true);if(G.mode==='inf')mprog('inf',null,G.room,true);checkAch()}

// fire chains between burning enemies
function fireChain(e){if(e.chainT>G.t)return;e.chainT=G.t+.35;let n=0;
  for(const o of G.enemies){if(n>=2)break;if(o===e||o.dead||o.spawn>0||o.hidden)continue;if(Math.hypot(o.x-e.x,o.y-e.y)>110)continue;n++;
    G.fx.push({k:'chain',x:e.x,y:e.y-10,x2:o.x,y2:o.y-10,t:.22});o.burn=Math.max(o.burn,2.5);hurtE(o,P.atk*.4,false,true)}}
function drawFrozen(e){const r=e.r*1.25;ctx.save();ctx.globalAlpha=.55;ctx.fillStyle='#bfe9ff';ell(e.x,e.y-e.r*.6,r,r*1.05);ctx.fill();ctx.globalAlpha=1;
  ctx.strokeStyle='rgba(230,250,255,.95)';ctx.lineWidth=2;ell(e.x,e.y-e.r*.6,r,r*1.05);ctx.stroke();ctx.strokeStyle='rgba(255,255,255,.8)';ctx.beginPath();ctx.moveTo(e.x-r*.5,e.y-e.r*1.2);ctx.lineTo(e.x-r*.2,e.y-e.r*1.5);ctx.stroke();ctx.restore()}

// --- hero drawing extras ---
function heroBits(S,B,hy,front){
  if(S.ponytail&&(front?B.back:!B.back)){ctx.save();ink(2.2);ctx.fillStyle=S.hair;ctx.beginPath();const sx=B.side?-9:0,sy=B.back?hy+2:hy-2;ctx.moveTo(sx-3,sy);ctx.quadraticCurveTo(sx-10+(B.side?0:4),sy+8+Math.sin(G.t*6)*1.5,sx-4,sy+15);ctx.quadraticCurveTo(sx+3,sy+8,sx+3,sy);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore()}
  if(S.antlers&&!front){ctx.save();ctx.strokeStyle=INK;ctx.lineWidth=4.5;const ant=s=>{ctx.beginPath();ctx.moveTo(s*5,hy-7);ctx.lineTo(s*9,hy-17);ctx.lineTo(s*15,hy-22);ctx.moveTo(s*8,hy-14);ctx.lineTo(s*3,hy-21);ctx.moveTo(s*11,hy-19);ctx.lineTo(s*12,hy-26);ctx.stroke()};
    if(B.side)ant(-1);else{ant(-1);ant(1)}ctx.strokeStyle='#c9a26a';ctx.lineWidth=2.2;if(B.side)ant(-1);else{ant(-1);ant(1)}ctx.restore();ink(2.5)}
  if(S.helm&&front){ink(2.5);ctx.beginPath();ctx.arc(0,hy-.5,10.8,Math.PI*1.02,Math.PI*1.98);ctx.closePath();ctx.fillStyle=vGrad(-10,10,'#c9cfd6','#8a929c','#5a5f68');ctx.fill();ctx.stroke();
    ctx.fillStyle='#5a5f68';ctx.fillRect(-11,hy-2,22,3);ctx.strokeRect(-11,hy-2,22,3);if(!B.back&&!B.side){ctx.fillRect(-1.2,hy,2.4,6)}}
  if(S.beard&&front&&!B.back){ink(2);const bx=B.v==='s'?0:B.v==='s34'?3:6;ctx.beginPath();ctx.moveTo(bx-6,hy+3);ctx.quadraticCurveTo(bx-7,hy+12,bx,hy+15);ctx.quadraticCurveTo(bx+7,hy+12,bx+6,hy+3);ctx.quadraticCurveTo(bx,hy+6,bx-6,hy+3);ctx.closePath();fs(S.beard);
    ctx.strokeStyle='rgba(0,0,0,.3)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(bx-2,hy+7);ctx.lineTo(bx-2,hy+12);ctx.moveTo(bx+2,hy+7);ctx.lineTo(bx+2,hy+12);ctx.stroke();ink(2.5)}
  if(S.tiara&&front){ctx.save();ctx.shadowColor='#9fe6ff';ctx.shadowBlur=8;ink(1.8);const sp=B.side?[-4,0,4]:[-8,-4,0,4,8];for(const tx of sp){const h=tx===0?14:Math.abs(tx)<5?10:7;ctx.beginPath();ctx.moveTo(tx-2.4,hy-7);ctx.lineTo(tx,hy-7-h);ctx.lineTo(tx+2.4,hy-7);ctx.closePath();const g=ctx.createLinearGradient(0,hy-7-h,0,hy-7);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#7fc8f0');ctx.fillStyle=g;ctx.fill();ctx.stroke()}
    ctx.fillStyle=S.p2?'#c48aff':'#5fd0ff';circ(0,hy-9,2.2);ctx.fill();ctx.restore();ink(2.5)}
}

// --- menu: the camp before the crypt ---
const MODES=[
  {id:'c1',kind:'Capitolo 1',n:'Cripta di Muschio',d:'Dieci stanze, il Golem e la Strega delle Radici.',req:'Completa il Capitolo 1',env:'muschio',mc:'#8fd14f',glow:'120,220,90'},
  {id:'c2',kind:'Capitolo 2',n:'Cuore del Vulcano',d:'La Salamandra di Lava e il Fabbro Infernale.',req:'Completa il Capitolo 1 per aprirlo',env:'cenere',mc:'#ff8a3c',glow:'255,110,40'},
  {id:'inf',kind:'Modalità infinita',n:"L'Abisso",d:'Stanze senza fine, sempre più dure.',req:'Sconfiggi il Golem di Muschio per aprirlo',env:'abisso',mc:'#c48ae8',glow:'180,110,255'},
  {id:'c3',kind:'Capitolo 3',n:'Palude delle Lucciole',d:"Il Re Rospo e l'Idra della Palude.",req:'Raggiungi 700 coppe',env:'palude',mc:'#c8f04a',glow:'190,240,110'},
  {id:'c4',kind:'Capitolo 4',n:'Picchi di Brina',d:'Lo Yeti delle Vette e la Regina dei Ghiacci.',req:'Raggiungi 1200 coppe',env:'brina',mc:'#9fe6ff',glow:'160,215,255'}];
const modeOf=ch=>MODES.find(m=>m.id==='c'+ch)||MODES[0];
function modeRecord(id){if(id==='inf')return SAVE.inf.best?`Record: stanza ${SAVE.inf.best}`:'Ancora nessun record';const b=SAVE[id==='c1'?'best':'best'+id.slice(1)]||{room:0,gold:0};return b.room?`Record: stanza ${b.room}, ${b.gold} oro`:'Ancora nessun record'}
const curMode=()=>{if(SAVE.sel==='inf')return MODES.find(m=>m.id==='inf');if(SAVE.sel==='daily'){const T=chalToday(),M=modeOf(T.ch);return{...M,kind:'Sfida del giorno',n:M.n,d:T.mods.map(id=>CHAL_MODS.find(x=>x.id===id).n).join(' + '),mc:'#ffd84a'}}const i=arenaIdx(SAVE.trophies||0),A=ARENAS[i];return{...modeOf(A.ch),kind:'Arena '+(i+1),n:A.n,d:A.d,mc:A.col,arena:i}};
const MODE_ORDER=['arena','daily','inf'];
const fmtH=ms=>{const t=Math.max(0,Math.ceil(ms/1000)),h=Math.floor(t/3600),m=Math.floor(t%3600/60),s=t%60;const d=Math.floor(h/24);return d>=2?`${d} giorni`:d===1?`1 giorno ${h%24}h`:h?`${h}h ${String(m).padStart(2,'0')}m`:`${m}m ${String(s).padStart(2,'0')}s`};
const SCROLL_SVG='<svg viewBox="0 0 44 44" aria-hidden="true"><path d="M10 8h22v26a4 4 0 0 1-4 4H12" fill="#f6ead2" stroke="#1b1612" stroke-width="2.4" stroke-linejoin="round"/><path d="M6 34a4 4 0 0 0 8 0V12a4 4 0 0 0-8 0z" fill="#dcc392" stroke="#1b1612" stroke-width="2.4"/><path d="M16 16h11M16 22h11M16 28h7" stroke="#8a5a20" stroke-width="2.4" stroke-linecap="round"/></svg>';
let lastFreeHTML='',lastMisHTML='';
function rewTxt(r){const R=MREW[r];return R.gold?`${R.gold} oro`:CHESTS[R.chest].n}
// bottom sheet
let SHEET=null;
function openSheet(kind){SHEET=kind;sfx('ui');if(kind==='mis')fillMissions();else if(kind==='guide')fillGuide();else if(kind==='road')fillRoad();else if(kind==='login')fillLogin();else if(kind==='pass')fillPass();else if(kind==='chal')fillChal();else fillSettings();$('sheetScr').hidden=false}
function closeSheet(){SHEET=null;$('sheetScr').hidden=true;renderPlay()}
$('sheetScr').addEventListener('click',e=>{if(e.target===$('sheetScr')||e.target.closest('.close'))closeSheet()});
$('misBtn').onclick=()=>openSheet('mis');$('guideBtn').onclick=()=>openSheet('guide');$('gearBtn').onclick=()=>openSheet('set');
let lastSheetHTML='';
function fillSettings(){const S=SAVE.set;lastSheetHTML='';$('sheet').innerHTML=`<h2>Impostazioni</h2>
  <label class="srow"><span>Musica</span><input type="range" min="0" max="100" value="${Math.round(S.mv*100)}" data-set="mv" aria-label="Volume musica"></label>
  <label class="srow"><span>Effetti</span><input type="range" min="0" max="100" value="${Math.round(S.sv*100)}" data-set="sv" aria-label="Volume effetti"></label>
  <div class="srow"><span>Vibrazione</span><div class="seg"><button class="${S.vib?'on':''}" data-vib="1">Attiva</button><button class="${S.vib?'':'on'}" data-vib="0">Spenta</button></div></div>
  <div class="srow"><span>Scatto</span><div class="seg"><button class="${S.left?'on':''}" data-left="1">A sinistra</button><button class="${S.left?'':'on'}" data-left="0">A destra</button></div></div>
  <div class="srow"><span>Stanze</span><div class="seg"><button class="${S.big!==false?'on':''}" data-big="1">Grandi</button><button class="${S.big===false?'on':''}" data-big="0">Piccole</button></div></div>
  <div class="srow"><span>Grafica</span><div class="seg"><button class="${S.q==='auto'?'on':''}" data-q="auto">Automatica</button><button class="${S.q==='alta'?'on':''}" data-q="alta">Alta</button><button class="${S.q==='bassa'?'on':''}" data-q="bassa">Bassa</button></div></div>
  <p class="lead">Con le stanze grandi la telecamera segue l'eroe; le stanze piccole stanno tutte nello schermo. Con la grafica bassa ci sono meno luci ed effetti: utile sui telefoni lenti. La vibrazione funziona sui telefoni Android che la supportano.</p>
  <div class="srow"><span>Salvataggio</span><div class="seg"><button data-code="out">Copia codice</button><button data-code="in">Carica codice</button></div></div><div id="codeBox"></div>
  <button class="btn alt" data-intro="1">Rivedi la intro</button>
  <button class="btn alt" data-guide="1">Apri la guida del gioco</button>
  <button class="btn alt close">Chiudi</button>`}
$('sheet').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.guide){openSheet('guide');return}
  if(b.dataset.intro){closeSheet();if(typeof playIntro==='function')playIntro(true);return}
  if(b.dataset.code==='out'){$('codeBox').innerHTML=`<p class="lead small">Copia questo codice e conservalo: su un altro telefono usa «Carica codice» per riavere i tuoi progressi.</p><textarea class="codeTa" readonly id="codeTa">${saveCode()}</textarea><button class="btn go" data-codecopy="1">Copia</button>`;sfx('ui');return}
  if(b.dataset.code==='in'){$('codeBox').innerHTML=`<p class="lead small">Incolla qui il tuo codice di salvataggio.</p><textarea class="codeTa" id="codeTa" placeholder="Incolla il codice"></textarea><button class="btn go" data-codeload="1">Carica</button>`;sfx('ui');return}
  if(b.dataset.codecopy){const ta=$('codeTa');const done=()=>toast('Codice copiato!');try{navigator.clipboard.writeText(ta.value).then(done,()=>{ta.select();toast('Selezionato: copialo a mano')})}catch(err){ta.select();toast('Selezionato: copialo a mano')}return}
  if(b.dataset.codeload){const o=readCode($('codeTa').value);if(!o){toast('Codice non valido');sfx('ui');return}$('codeBox').querySelectorAll('.codeAsk').forEach(x=>x.remove());$('codeBox').insertAdjacentHTML('beforeend',`<div class="srow codeAsk" style="grid-template-columns:1fr;gap:6px"><span>Sostituire i progressi di questo telefono?</span><div class="seg"><button data-codeok="1">Sì</button><button data-codeno="1">No</button></div></div>`);window.__pend=o;return}
  if(b.dataset.codeok&&window.__pend){try{localStorage.setItem(SAVE_KEY,JSON.stringify(window.__pend))}catch(err){}location.reload();return}
  if(b.dataset.codeno){$('codeBox').innerHTML='';window.__pend=null;return}
  if(b.classList.contains('mclaim')){if(CHbusy)return;const m=SAVE.daily.list[+b.dataset.m];if(!m||!m.done||m.claimed)return;m.claimed=true;const R=MREW[m.r];passXP(25);ensureWeekly().pts+=MPTS.d;
    if(R.gold){SAVE.gold+=R.gold;renderGold();toast(`+${R.gold} oro`);sfx('coin')}save();fillMissions();renderMissions();if(R.chest){closeSheet();openChest(R.chest)}return}
  const S=SAVE.set;if(b.dataset.big)S.big=b.dataset.big==='1';else if(b.dataset.vib)S.vib=b.dataset.vib==='1';else if(b.dataset.left)S.left=b.dataset.left==='1';else if(b.dataset.q)S.q=b.dataset.q;else return;
  save();applySettings();sfx('ui');if(S.vib&&b.dataset.vib)vib(40);fillSettings()});
$('sheet').addEventListener('input',e=>{const r=e.target.closest('[data-set]');if(!r)return;SAVE.set[r.dataset.set]=r.value/100;applySettings()});
$('sheet').addEventListener('change',e=>{save();if(e.target.dataset.set==='sv')sfx('coin')});
function applySettings(){const S=SAVE.set;$('wrap').classList.toggle('lefty',!!S.left);LOWFX=S.q==='bassa';slowT=0;resize();audioSettings()}

// --- the camp diorama: night, the crypt on the hill, the hero resting by the fire ---
const CAMP={t:0,swap:0,walk:0,bg:{},embers:[],smoke:[],amb:[]};
const campCv=$('campCv'),campX=campCv.getContext('2d');
const SW=360,SH=270;
const SCENE={
  c1:{sky:['#0b1230','#1c2547','#3a3d58'],far:'#1d2440',far2:'#151b30',tree:'#0b120e',hill:['#4a463c','#36332b','#25221d'],stone:['#8a8070','#6b6253','#4d463b'],door:'#120d0b',
    ground:['#3d3a2c','#2a2820','#1a1814'],path:'#5a4f40',torch:['#ff5a14','#ffa632','#fff1c0'],moss:'#4f8a34',moon:'#f2ecd0'},
  c2:{sky:['#140808','#3a1410','#7a2a12'],far:'#2a1210',far2:'#1c0c0a',tree:'#120a08',hill:['#3e3430','#2c2420','#1c1714'],stone:['#6e6058','#4d423c','#332b26'],door:'#140a08',
    ground:['#352a24','#251d19','#160f0c'],path:'#4a3a30',torch:['#ff3c10','#ff8a22','#ffe6a0'],moss:null,moon:'#ffb070'},
  c3:{sky:['#081210','#13261f','#2a3a2a'],far:'#13221c',far2:'#0d1814',tree:'#08100c',hill:['#4a4a38','#36362a','#25251c'],stone:['#7d7f68','#5e604c','#3e4033'],door:'#0a0d0a',
    ground:['#2e3424','#20261a','#141810'],path:'#4a4a36',torch:['#3aa800','#b8f04a','#f4ffd0'],moss:null,moon:'#e8f0c0'},
  c4:{sky:['#050c22','#11224a','#33507e'],far:'#26365a',far2:'#1a2846',tree:'#0e2224',hill:['#d8e4ee','#a8b8ca','#788aa0'],stone:['#a8b4c4','#7a8696','#4e5a68'],door:'#0a0e18',
    ground:['#c8d6e2','#9fb2c4','#6a7e94'],path:'#8a9aac',torch:['#1a62ff','#7fc8ff','#f0fbff'],moss:null,moon:'#f0f6ff'},
  inf:{sky:['#07040f','#160b2a','#2a1440'],far:'#1a1030',far2:'#120a22',tree:'#0c0818',hill:['#3a3248','#2a2436','#1a1624'],stone:['#6e6280','#4e4460','#342c44'],door:'#0c0814',
    ground:['#2a2436','#1d1828','#120e1a'],path:'#3e3450','torch':['#7a2fd0','#c07aff','#f4e6ff'],moss:null,moon:'#e8d8ff'}};
const GATE={x:180,top:100,bot:166,w:20};
// the arena's colour is applied to the scenery only (hill, crypt, ground), never to the hero or the fire
function tintBg(m){const A=m.id==='inf'?null:ARENAS[arenaIdx(SAVE.trophies||0)];if(!A||!A.tint)return campBg(m);const k=m.id+'|'+A.tint;if(CAMP.bg[k])return CAMP.bg[k];
  const src=campBg(m),c=document.createElement('canvas');c.width=src.width;c.height=src.height;const x=c.getContext('2d');
  const t=document.createElement('canvas');t.width=src.width;t.height=src.height;const y=t.getContext('2d');
  if(HASF){y.filter=A.tint;y.drawImage(src,0,0);y.filter='none'}else{y.drawImage(src,0,0);y.globalCompositeOperation='color';y.globalAlpha=.5;y.fillStyle=A.col;y.fillRect(0,0,t.width,t.height);y.globalAlpha=1}
  // fade the tint in from the hill down, so the sky stays seamless with the one drawn above it
  const g=y.createLinearGradient(0,0,0,t.height);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.2,'rgba(0,0,0,0)');g.addColorStop(.42,'#000');g.addColorStop(1,'#000');
  y.globalCompositeOperation='destination-in';y.fillStyle=g;y.fillRect(0,0,t.width,t.height);
  x.drawImage(src,0,0);x.drawImage(t,0,0);return CAMP.bg[k]=c}
function campBg(m){if(CAMP.bg[m.id])return CAMP.bg[m.id];const c=document.createElement('canvas');c.width=SW*2;c.height=SH*2;const x=c.getContext('2d');x.scale(2,2);
  const Z=SCENE[m.id],R=(a,b)=>a+Math.random()*(b-a),P=a=>a[Math.floor(Math.random()*a.length)];
  const poly=(pts,fill,stroke,lw)=>{x.beginPath();pts.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.closePath();if(fill){x.fillStyle=fill;x.fill()}if(stroke){x.strokeStyle=stroke;x.lineWidth=lw||2;x.lineJoin='round';x.stroke()}};
  // sky
  let g=x.createLinearGradient(0,0,0,150);g.addColorStop(0,Z.sky[0]);g.addColorStop(.6,Z.sky[1]);g.addColorStop(1,Z.sky[2]);x.fillStyle=g;x.fillRect(0,0,SW,SH);
  // moon
  // far mountains
  const ridge=(y0,amp,col,seed)=>{x.beginPath();x.moveTo(0,SH);let px=0;x.lineTo(0,y0);while(px<SW){px+=R(14,30);x.lineTo(px,y0-Math.abs(Math.sin(px*.03+seed))*amp-R(0,amp*.3))}x.lineTo(SW,SH);x.closePath();x.fillStyle=col;x.fill()};
  if(m.id==='c4')for(const[px,ph,pw] of [[30,74,70],[118,96,92],[236,102,104],[330,80,84]]){poly([[px-pw,152],[px,152-ph],[px+pw,152]],'#2e4064');poly([[px-pw*.3,152-ph*.7],[px,152-ph],[px+pw*.3,152-ph*.7],[px+pw*.12,152-ph*.64],[px,152-ph*.73],[px-pw*.14,152-ph*.62]],'#e8f2ff')}
  ridge(112,34,Z.far,1);
  if(m.id==='c2'){x.save();x.translate(345,0);x.scale(-1,1);// volcano with a glowing crater
    x.beginPath();x.moveTo(-10,132);x.quadraticCurveTo(40,104,56,62);x.lineTo(80,62);x.quadraticCurveTo(98,104,150,132);x.closePath();const vg=x.createLinearGradient(0,60,0,132);vg.addColorStop(0,'#3a1a12');vg.addColorStop(1,'#1e0c08');x.fillStyle=vg;x.fill();
    const cg=x.createRadialGradient(68,62,1,68,62,16);cg.addColorStop(0,'rgba(255,200,90,.95)');cg.addColorStop(1,'rgba(255,90,20,0)');x.fillStyle=cg;x.fillRect(48,46,40,30);
    x.save();x.shadowColor='#ff6a1a';x.shadowBlur=8;x.lineCap='round';for(const[sx,c1x,ex,ey,w] of [[63,56,48,104,2.4],[70,74,82,96,1.8],[66,64,60,84,1.4]]){x.strokeStyle='#ff7a2e';x.lineWidth=w;x.beginPath();x.moveTo(sx,63);x.quadraticCurveTo(c1x,(63+ey)/2,ex,ey);x.stroke()}x.restore();x.restore()}
  ridge(126,22,Z.far2,4);
  // the colossal beast: its horned skull looms behind the crypt hill and its ribs rise from the ground on both sides, lost in the night haze
  {const b=document.createElement('canvas');b.width=SW*2;b.height=SH*2;const y=b.getContext('2d');y.scale(2,2);y.lineJoin='round';y.lineCap='round';
    const bone='#cfc6ae',bs='#8f866f',K='#14100c';
    for(const sd of [-1,1])for(let i=0;i<3;i++){const bx=sd<0?14+i*30:SW-14-i*30,top=40+i*16,path=()=>{y.beginPath();y.moveTo(bx,140);y.quadraticCurveTo(bx-sd*26,top-10,bx+sd*34,top)};
      path();y.strokeStyle=K;y.lineWidth=13-i*2;y.stroke();path();y.strokeStyle=bs;y.lineWidth=9-i*2;y.stroke();y.save();y.translate(-sd*1.5,-1.5);path();y.strokeStyle=bone;y.lineWidth=4-i*.8;y.stroke();y.restore()}
    const cx=180,cy=54;
    for(const sd of [-1,1]){const hp=()=>{y.beginPath();y.moveTo(cx+sd*78,cy-18);y.bezierCurveTo(cx+sd*118,cy-26,cx+sd*150,cy-28,cx+sd*166,cy-50)};hp();y.strokeStyle=K;y.lineWidth=17;y.stroke();hp();y.strokeStyle=bs;y.lineWidth=12;y.stroke();y.save();y.translate(-sd*1.5,-2);hp();y.strokeStyle=bone;y.lineWidth=5;y.stroke();y.restore()}
    y.beginPath();y.ellipse(cx,cy,94,50,0,0,TAU);y.fillStyle=bone;y.fill();y.strokeStyle=K;y.lineWidth=3;y.stroke();
    y.beginPath();y.ellipse(cx,cy+10,94,40,0,0,Math.PI);y.fillStyle=bs;y.globalAlpha=.6;y.fill();y.globalAlpha=1;
    y.beginPath();y.ellipse(cx-26,cy-30,34,10,-.12,Math.PI*1.05,Math.PI*1.85);y.strokeStyle='#f2ecd8';y.lineWidth=5;y.stroke();
    y.strokeStyle=K;y.lineWidth=2;y.beginPath();y.moveTo(cx+14,cy-48);y.lineTo(cx+20,cy-34);y.lineTo(cx+14,cy-26);y.stroke();
    for(const sd of [-1,1]){y.beginPath();y.ellipse(cx+sd*38,cy-2,22,16,sd*.25,0,TAU);y.fillStyle=K;y.fill();y.beginPath();y.moveTo(cx+sd*14,cy-18);y.quadraticCurveTo(cx+sd*38,cy-30,cx+sd*64,cy-12);y.strokeStyle=K;y.lineWidth=7;y.stroke();y.strokeStyle=bone;y.lineWidth=3.5;y.stroke()}
    // haze: the beast sits far away, behind the night air
    y.globalCompositeOperation='source-atop';const hz=y.createLinearGradient(0,0,0,150);hz.addColorStop(0,Z.sky[0]);hz.addColorStop(1,Z.sky[2]);y.globalAlpha=.5;y.fillStyle=hz;y.fillRect(0,0,SW,SH);y.globalAlpha=1;
    x.drawImage(b,0,0,SW,SH)}
  // tree line / spires
  for(let i=0;i<26;i++){const tx=i<13?R(-6,120):R(240,366),ty=R(124,136),th=R(18,34);
    if(m.id==='c1'){x.fillStyle=Z.tree;for(let k=0;k<4;k++){const w=th*(.42-k*.07),y=ty-k*th*.24;poly([[tx-w,y],[tx,y-th*.42],[tx+w,y]],Z.tree)}x.fillRect(tx-1.5,ty-2,3,6)}
    else if(m.id==='c3'){x.strokeStyle=Z.tree;x.lineWidth=2.6;x.lineCap='round';x.beginPath();x.moveTo(tx,ty);x.quadraticCurveTo(tx+R(-3,3),ty-th*.5,tx,ty-th);x.stroke();x.lineWidth=1.1;for(let k=0;k<7;k++){const a=-Math.PI/2+(k-3)*.36,ex=tx+Math.cos(a)*th*.42,ey=ty-th+Math.sin(a)*th*.25;x.beginPath();x.moveTo(tx,ty-th);x.quadraticCurveTo(ex,ey-4,ex+R(-2,2),ey+th*R(.45,.75));x.stroke()}}
    else if(m.id==='c4'){for(let k=0;k<3;k++){const w=th*(.38-k*.08),y=ty-k*th*.26;poly([[tx-w,y],[tx,y-th*.45],[tx+w,y]],Z.tree);poly([[tx-w*.55,y-th*.2],[tx,y-th*.45],[tx+w*.55,y-th*.2]],'#dfe9f4')}x.fillStyle=Z.tree;x.fillRect(tx-1.5,ty-2,3,6)}
    else if(m.id==='c2'){x.strokeStyle=Z.tree;x.lineWidth=2.4;x.lineCap='round';x.beginPath();x.moveTo(tx,ty);x.lineTo(tx+R(-2,2),ty-th);x.moveTo(tx,ty-th*.55);x.lineTo(tx+R(5,10),ty-th*.85);x.moveTo(tx,ty-th*.4);x.lineTo(tx-R(4,9),ty-th*.7);x.stroke()}
    else{poly([[tx-4,ty],[tx,ty-th],[tx+4,ty]],Z.tree);x.strokeStyle='rgba(180,120,255,.35)';x.lineWidth=1;x.beginPath();x.moveTo(tx,ty-th);x.lineTo(tx,ty-4);x.stroke()}}
  // the hill the crypt is carved into
  const hill=[[40,160],[62,118],[96,92],[132,74],[170,66],[206,70],[240,82],[272,104],[300,128],[322,160]];
  poly(hill,Z.hill[1],'#1b1612',2.5);
  x.save();x.beginPath();hill.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.closePath();x.clip();
  for(let i=0;i<26;i++){const px=R(50,312),py=R(70,160),s=R(8,20);poly([[px-s,py+s*.4],[px-s*.4,py-s*.5],[px+s*.6,py-s*.3],[px+s,py+s*.3]],P([Z.hill[0],Z.hill[1],Z.hill[2]]),'rgba(0,0,0,.35)',1.2)}
  x.strokeStyle='rgba(255,255,255,.08)';x.lineWidth=2;x.beginPath();hill.forEach((p,i)=>i?x.lineTo(p[0],p[1]+3):x.moveTo(p[0],p[1]+3));x.stroke();
  if(Z.moss)for(let i=0;i<40;i++){x.fillStyle=P(['#3f6a2a','#2f5220','#4f8a34']);x.beginPath();x.ellipse(R(55,305),R(72,150),R(3,7),R(1.5,3),0,0,TAU);x.fill()}
  if(m.id==='c2'){x.shadowColor='#ff6a1a';x.shadowBlur=8;x.strokeStyle='#ff7a2e';x.lineWidth=1.4;for(let i=0;i<7;i++){let px=R(60,300),py=R(90,150);x.beginPath();x.moveTo(px,py);for(let k=0;k<4;k++){px+=R(-8,8);py+=R(3,8);x.lineTo(px,py)}x.stroke()}x.shadowBlur=0}
  if(m.id==='c4'){x.fillStyle='#eef4fb';for(let i=0;i<34;i++){x.beginPath();x.ellipse(R(55,305),R(66,130),R(6,18),R(2,4.5),0,0,TAU);x.fill()}x.fillStyle='rgba(140,170,210,.35)';for(let i=0;i<14;i++){x.beginPath();x.ellipse(R(60,300),R(80,150),R(5,12),R(1.5,3),0,0,TAU);x.fill()}}
  if(m.id==='c3'){x.lineCap='round';for(let i=0;i<12;i++){const vx=R(60,300),vy=R(70,120),len=R(10,26);x.strokeStyle='#1b1612';x.lineWidth=2.2;x.beginPath();x.moveTo(vx,vy);x.quadraticCurveTo(vx+R(-4,4),vy+len*.5,vx+R(-3,3),vy+len);x.stroke();x.strokeStyle='#3f5a2a';x.lineWidth=1;x.stroke()}}
  if(m.id==='inf'){x.shadowColor='#b874e6';x.shadowBlur=8;for(let i=0;i<10;i++){const px=R(60,300),py=R(84,150);poly([[px-3,py],[px,py-R(6,12)],[px+3,py]],P(['#c48ae8','#8a5bc4','#e0c0ff']))}x.shadowBlur=0}
  x.restore();
  // ground
  g=x.createLinearGradient(0,150,0,SH);g.addColorStop(0,Z.ground[0]);g.addColorStop(.5,Z.ground[1]);g.addColorStop(1,Z.ground[2]);x.fillStyle=g;x.fillRect(0,152,SW,SH-152);
  // path from the camp to the steps
  poly([[150,186],[210,186],[262,SH],[118,SH]],Z.path);x.fillStyle='rgba(0,0,0,.18)';for(let i=0;i<30;i++){const t=R(0,1),px=180+(R(-1,1))*(20+t*70),py=170+t*(SH-170);x.beginPath();x.ellipse(px,py,1.5+t*3,1+t*1.6,0,0,TAU);x.fill()}
  for(let i=0;i<70;i++){const py=R(156,SH),t=(py-150)/120,px=R(0,SW),s=(.6+t*2.2)*R(.6,1.2);x.fillStyle=P([Z.stone[1],Z.stone[2],Z.hill[1]]);x.strokeStyle='#1b1612';x.lineWidth=.8+t*.6;x.beginPath();x.ellipse(px,py,s*1.5,s,0,0,TAU);x.fill();x.stroke()}
  if(m.id==='c1')for(let i=0;i<46;i++){const py=R(156,SH),t=(py-150)/120,px=R(0,SW);if(px>130&&px<235&&py>175)continue;for(let b=0;b<4;b++){x.strokeStyle=P(['#5a8a32','#6fa040','#3f6a2a']);x.lineWidth=.8+t;x.beginPath();x.moveTo(px+b*(1+t),py);x.lineTo(px+b*(1+t)+R(-2,2),py-(3+t*7)*R(.6,1));x.stroke()}}
  if(m.id==='c2'){x.shadowColor='#ff6a1a';x.shadowBlur=6;x.lineCap='round';for(let i=0;i<9;i++){let px=R(0,SW),py=R(168,SH);if(px>110&&px<260)continue;const a0=R(-.4,.4),t=(py-150)/120;x.strokeStyle='#1a0e0a';x.lineWidth=3+t*2;x.beginPath();x.moveTo(px,py);const pts=[[px,py]];for(let k=0;k<4;k++){px+=Math.cos(a0+R(-.5,.5))*R(5,10)*(1+t);py+=Math.sin(a0+R(-.5,.5))*R(2,4);pts.push([px,py])}pts.forEach((p,k)=>k&&x.lineTo(p[0],p[1]));x.stroke();x.strokeStyle='#ff8a3c';x.lineWidth=1+t;x.stroke()}x.shadowBlur=0}
  if(m.id==='c3'){for(const[px,py,rx] of [[48,206,32],[312,214,36],[76,252,22],[290,256,26]]){x.fillStyle='#0e1a14';x.beginPath();x.ellipse(px,py,rx,rx*.32,0,0,TAU);x.fill();x.strokeStyle='rgba(200,240,160,.25)';x.lineWidth=1;x.beginPath();x.ellipse(px,py-1,rx*.9,rx*.26,0,Math.PI*1.1,Math.PI*1.9);x.stroke();
      for(let k=0;k<3;k++){x.fillStyle='#3f6a2a';x.beginPath();x.ellipse(px+R(-rx*.6,rx*.6),py+R(-3,3),R(3,5),R(1.4,2.2),0,0,TAU);x.fill()}
      for(let k=0;k<4;k++){const cx=px+rx*R(.6,1.05)*(k%2?1:-1),h=R(10,18);x.strokeStyle='#1b1612';x.lineWidth=2;x.beginPath();x.moveTo(cx,py);x.lineTo(cx+R(-2,2),py-h);x.stroke();x.strokeStyle='#5a6a2a';x.lineWidth=1;x.stroke();x.fillStyle='#5a3a1e';x.fillRect(cx-1.4,py-h-5,2.8,6)}}}
  if(m.id==='c4'){for(let i=0;i<22;i++){const px=R(0,SW),py=R(160,SH),t=(py-150)/120;if(px>120&&px<240&&py>170)continue;x.fillStyle='#f4f8ff';x.beginPath();x.ellipse(px,py,R(8,20)*(.6+t),R(2,4)*(.6+t),0,0,TAU);x.fill();x.fillStyle='rgba(120,150,190,.3)';x.beginPath();x.ellipse(px+3,py+2,R(6,12)*(.6+t),R(1.5,3),0,0,TAU);x.fill()}}
  // --- the crypt facade ---
  const S=Z.stone,ink=(w)=>{x.strokeStyle='#1b1612';x.lineWidth=w||2;x.lineJoin='round'};
  // steps down to the path
  // plinth
  x.fillStyle=S[1];x.fillRect(118,140,124,12);x.fillStyle=S[0];x.fillRect(118,140,124,3);ink(2);x.strokeRect(118,140,124,12);
  // back wall between the columns
  x.fillStyle=S[2];x.fillRect(138,92,84,48);for(let r=0;r<6;r++)for(let c=0;c<7;c++){x.fillStyle=P([S[1],S[2],S[2]]);x.fillRect(139+c*12+(r%2)*6,93+r*8,11,7)}ink(2);x.strokeRect(138,92,84,48);
  // door arch
  const gx=GATE.x,gw=GATE.w,gt=GATE.top,gb=GATE.bot;
  x.fillStyle=S[0];x.beginPath();x.moveTo(gx-gw-6,gb);x.lineTo(gx-gw-6,gt+gw);x.arc(gx,gt+gw,gw+6,Math.PI,0);x.lineTo(gx+gw+6,gb);x.closePath();x.fill();ink(2);x.stroke();
  for(let k=0;k<7;k++){const a=Math.PI+k*Math.PI/7;x.beginPath();x.moveTo(gx+Math.cos(a)*gw,gt+gw+Math.sin(a)*gw);x.lineTo(gx+Math.cos(a)*(gw+6),gt+gw+Math.sin(a)*(gw+6));x.lineWidth=1.2;x.stroke()}
  x.fillStyle=Z.door;x.beginPath();x.moveTo(gx-gw,gb);x.lineTo(gx-gw,gt+gw);x.arc(gx,gt+gw,gw,Math.PI,0);x.lineTo(gx+gw,gb);x.closePath();x.fill();
  // columns
  for(const cx of [131,229]){x.fillStyle=S[1];x.fillRect(cx-9,134,18,6);ink(1.6);x.strokeRect(cx-9,134,18,6);
    g=x.createLinearGradient(cx-7,0,cx+7,0);g.addColorStop(0,S[0]);g.addColorStop(.5,S[1]);g.addColorStop(1,S[2]);x.fillStyle=g;x.fillRect(cx-7,96,14,38);ink(1.8);x.strokeRect(cx-7,96,14,38);
    x.strokeStyle='rgba(0,0,0,.3)';x.lineWidth=1;for(const f of [-3.5,0,3.5]){x.beginPath();x.moveTo(cx+f,98);x.lineTo(cx+f,132);x.stroke()}
    x.fillStyle=S[0];x.fillRect(cx-10,90,20,6);ink(1.6);x.strokeRect(cx-10,90,20,6)}
  // architrave + pediment
  x.fillStyle=S[1];x.fillRect(114,82,132,9);x.fillStyle=S[0];x.fillRect(114,82,132,2.5);ink(2);x.strokeRect(114,82,132,9);
  poly([[110,82],[180,54],[250,82]],S[1],'#1b1612',2);poly([[122,79],[180,60],[238,79]],S[2]);
  x.fillStyle=S[0];x.beginPath();x.arc(180,72,7,0,TAU);x.fill();ink(1.5);x.stroke();
  // weathering
  if(Z.moss){for(let i=0;i<14;i++){x.fillStyle=P(['#4f8a34','#6fa040','#3f6a2a']);x.beginPath();x.ellipse(R(116,244),P([83,91,141]),R(2,5),R(1,2),0,0,TAU);x.fill()}
    x.lineCap='round';for(const vx of [118,136,226,243]){const len=R(14,34);x.strokeStyle='#1b1612';x.lineWidth=2.6;x.beginPath();x.moveTo(vx,84);x.quadraticCurveTo(vx+R(-4,4),84+len*.5,vx+R(-2,2),84+len);x.stroke();x.strokeStyle='#5f9e3c';x.lineWidth=1.4;x.stroke()}}
  x.strokeStyle='rgba(0,0,0,.35)';x.lineWidth=1;for(let i=0;i<5;i++){let px=R(120,240),py=R(84,138);x.beginPath();x.moveTo(px,py);x.lineTo(px+R(-4,4),py+R(3,7));x.lineTo(px+R(-4,4),py+R(6,12));x.stroke()}
  // the stairwell: steps cut into the ground, going down to the sunken door
  {const BY=152,FY=186,yS=t=>FY+(166-FY)*Math.pow(t,.8),wS=t=>32+(21-32)*t,N=7;
    for(const sd of [-1,1]){poly([[180+sd*24,BY],[180+sd*36,FY-2],[180+sd*wS(0),yS(0)],[180+sd*wS(1),yS(1)]],S[2],'#1b1612',1.6);
      x.strokeStyle='rgba(0,0,0,.35)';x.lineWidth=.8;for(let k=1;k<4;k++){const f=k/4;x.beginPath();x.moveTo(180+sd*(24+12*f),BY+(FY-2-BY)*f);x.lineTo(180+sd*(wS(1)+(wS(0)-wS(1))*f),yS(1)+(yS(0)-yS(1))*f);x.stroke()}}
    for(let k=N-1;k>=0;k--){const t0=k/N,t1=(k+1)/N,tm=(k+.62)/N,y0=yS(t0),y1=yS(t1),ym=yS(tm),w0=wS(t0),w1=wS(t1),wm=wS(tm),dark=t0;
      poly([[180-wm,ym],[180+wm,ym],[180+w1,y1],[180-w1,y1]],'#0b0807');
      g=x.createLinearGradient(0,y0,0,ym);g.addColorStop(0,S[0]);g.addColorStop(1,S[1]);poly([[180-w0,y0],[180+w0,y0],[180+wm,ym],[180-wm,ym]],g);
      x.fillStyle=`rgba(0,0,0,${.15+dark*.6})`;x.fill();x.strokeStyle=`rgba(255,240,210,${.25*(1-dark)})`;x.lineWidth=.8;x.beginPath();x.moveTo(180-wm,ym);x.lineTo(180+wm,ym);x.stroke()}
    x.fillStyle=S[0];x.strokeStyle='#1b1612';x.lineWidth=1.6;for(const sd of [-1,1]){x.beginPath();x.moveTo(180+sd*24,BY);x.lineTo(180+sd*36,FY-2);x.lineTo(180+sd*40,FY-2);x.lineTo(180+sd*28,BY);x.closePath();x.fill();x.stroke()}
    x.beginPath();x.moveTo(140,FY-2);x.lineTo(220,FY-2);x.lineTo(220,FY+1.5);x.lineTo(140,FY+1.5);x.closePath();x.fill();x.stroke();
    if(Z.moss)for(let i=0;i<8;i++){x.fillStyle=P(['#3f6a2a','#4f8a34']);x.beginPath();x.ellipse(P([142,218,R(150,210)]),R(176,188),R(2,4),1.4,0,0,TAU);x.fill()}}
  if(m.id==='c4'){x.fillStyle='#f4f8ff';poly([[110,82],[180,53],[250,82],[240,80],[180,57],[120,80]],'#f4f8ff');x.fillRect(114,80,132,3);x.fillRect(118,138,124,3);for(const cx of [131,229])x.fillRect(cx-10,88,20,3);
    x.strokeStyle='rgba(160,215,255,.8)';x.lineWidth=1.4;for(let ix=118;ix<244;ix+=R(6,11)){const h=R(3,9);x.beginPath();x.moveTo(ix,91);x.lineTo(ix+1,91+h);x.stroke()}}
  if(m.id==='c3'){x.lineCap='round';for(const vx of [116,138,224,246]){const len=R(16,36);x.strokeStyle='#1b1612';x.lineWidth=2.4;x.beginPath();x.moveTo(vx,84);x.quadraticCurveTo(vx+R(-4,4),84+len*.5,vx+R(-2,2),84+len);x.stroke();x.strokeStyle='#4a6a2a';x.lineWidth=1.2;x.stroke()}}
  // torch posts beside the steps
  for(const px of [120,240]){x.fillStyle=S[1];x.fillRect(px-5,164,10,22);ink(1.6);x.strokeRect(px-5,164,10,22);x.fillStyle=S[0];x.fillRect(px-7,161,14,4);x.strokeRect(px-7,161,14,4)}
  return CAMP.bg[m.id]=c}
// iron brazier with a proper flame
function campTorch(x,y,s,cols,ph){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ink(1.8);
  ctx.fillStyle='#2e2f34';ctx.beginPath();ctx.moveTo(-7,-2);ctx.lineTo(7,-2);ctx.lineTo(4,6);ctx.lineTo(-4,6);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.strokeStyle='#5a5f68';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(-5,1);ctx.lineTo(5,1);ctx.moveTo(-2,-2);ctx.lineTo(-1.5,6);ctx.moveTo(2,-2);ctx.lineTo(1.5,6);ctx.stroke();
  ctx.fillStyle='#ff6a2a';ctx.fillRect(-5,-3.5,10,2);ctx.restore();flame(x,y-2*s,s*.78,cols,ph)}
// the hero, sitting on a log with his back to us
function drawSeated(x,y,S,t){const sc=2.05,br=Math.sin(t*1.6)*.025;
  ctx.save();ctx.translate(x,y);
  ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(0,4,40,8,0,0,TAU);ctx.fill();
  ctx.save();ctx.scale(sc,sc*(1+br));ctx.translate(0,-6);
  const look=Math.sin(t*.35)>.6?.8:0;
  mossOn=1;drawRig(0,0,-Math.PI/2+look,0,false,{...S,held:null},{});mossOn=0;ctx.restore();
  // the log he sits on, in front of his legs
  ink(2.5);ctx.fillStyle='#6b4a2a';ctx.beginPath();ctx.moveTo(-42,-4);ctx.lineTo(40,-4);ctx.quadraticCurveTo(46,3,40,10);ctx.lineTo(-42,10);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.1)';ctx.fillRect(-40,-3,78,3);ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=1.2;for(const lx of [-26,-6,18]){ctx.beginPath();ctx.moveTo(lx,0);ctx.lineTo(lx+9,1);ctx.stroke()}
  ctx.fillStyle='#c9a26a';ctx.beginPath();ctx.ellipse(-42,3,5,7,0,0,TAU);ctx.fill();ink(2);ctx.stroke();ctx.strokeStyle='rgba(110,70,40,.6)';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(-42,3,2.5,3.5,0,0,TAU);ctx.stroke();
  // gear on the ground: weapon and pack
  ctx.save();ctx.translate(-56,8);ctx.rotate(-.25);
  if(S.held==='staff'){ctx.strokeStyle=INK;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-14,0);ctx.lineTo(22,0);ctx.stroke();ctx.strokeStyle='#6b4a2a';ctx.lineWidth=2.6;ctx.stroke();ctx.fillStyle=S.eyeCol||'#9fff7a';ctx.beginPath();ctx.arc(24,0,4,0,TAU);ctx.fill();ink(1.6);ctx.stroke()}
  else{ctx.strokeStyle=INK;ctx.lineWidth=5.5;ctx.beginPath();ctx.arc(0,-6,18,.35,Math.PI-.35);ctx.stroke();ctx.strokeStyle=S.bowCol||'#a4703d';ctx.lineWidth=3;ctx.stroke();ctx.strokeStyle='#f6ead2';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(Math.cos(.35)*18,-6+Math.sin(.35)*18);ctx.lineTo(Math.cos(Math.PI-.35)*18,-6+Math.sin(Math.PI-.35)*18);ctx.stroke()}
  ctx.restore();
  ink(2);ctx.fillStyle='#7a5a3a';ctx.beginPath();ctx.ellipse(52,4,11,9,0,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='#5a3f2a';ctx.beginPath();ctx.ellipse(52,-3,9,4,0,0,TAU);ctx.fill();ctx.stroke();ctx.strokeStyle='#3a2a1d';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(45,2);ctx.lineTo(59,2);ctx.stroke();
  ctx.restore()}
function campResize(){const dpr=Math.min(2,window.devicePixelRatio||1),w=Math.max(1,Math.round(campCv.clientWidth*dpr)),h=Math.max(1,Math.round(campCv.clientHeight*dpr));if(campCv.width!==w||campCv.height!==h){campCv.width=w;campCv.height=h}}
const LO=300,LH=SH+600;const campL=document.createElement('canvas');campL.width=SW/3;campL.height=LH/3;const campLx=campL.getContext('2d');campLx.scale(1/3,1/3);
function drawCamp(dt){campResize();const m=homeMode(),open=true,Z=SCENE[m.id],saved=ctx;ctx=campX;CAMP.t+=dt;const t=CAMP.t;G.t=t;
  // the hero's feet stand just above the «change hero» pill, the crypt fills the space behind him
  const cr=campCv.getBoundingClientRect(),dpr=campCv.width/Math.max(1,cr.width),hp=$('heroPill').getBoundingClientRect(),tb=$('topbar').getBoundingClientRect();
  const u=campCv.width/SW,top=(tb.bottom-cr.top)*dpr,feet0=(hp.top-cr.top)*dpr,room=Math.max(80*dpr,feet0-top),hs=clamp(Math.min(room*.56,215*dpr)/(46*u),1.4,3.6),feet=feet0-13*hs*u,oy=feet-HOME_Y*u,ox=campCv.width/2-180*u;
  CAMP.tf={u,ox,oy,dpr,hs};ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle=Z.sky[0];ctx.fillRect(0,0,campCv.width,campCv.height);ctx.setTransform(u,0,0,u,ox,oy);
  ctx.fillStyle=Z.ground[2];ctx.fillRect(-400,SH-2,SW+800,900);
  ctx.drawImage(tintBg(m),0,0,SW,SH);
  if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';const ep=.65+.35*Math.sin(t*1.6);for(const sd of [-1,1]){glow(m.glow,180+sd*38,53,30,ep*.55);glow(m.glow,180+sd*38,53,10,ep);glow('255,255,255',180+sd*38,53,3.5,ep)}ctx.restore()}
  // living sky
  if(m.id==='inf'||m.id==='c4'){ctx.save();ctx.globalCompositeOperation='lighter';for(let k=0;k<3;k++){ctx.strokeStyle=m.id==='c4'?`rgba(${k%2?'120,255,200':'120,200,255'},${.09+.05*Math.sin(t*.7+k)})`:`rgba(${k%2?'120,220,255':'190,120,255'},${.10+.05*Math.sin(t*.7+k)})`;ctx.lineWidth=10-k*2;ctx.beginPath();for(let px=0;px<=SW;px+=12){const py=-170+k*22+Math.sin(px*.02+t*.5+k)*10;px?ctx.lineTo(px,py):ctx.moveTo(px,py)}ctx.stroke()}ctx.restore()}
  if(m.id==='c2'){glow('255,90,30',277,58,30+3*Math.sin(t*2),.5);for(let k=0;k<5;k++){const q=(t*.08+k/5)%1;ctx.fillStyle=`rgba(60,40,36,${.35*(1-q)})`;ctx.beginPath();ctx.arc(277-q*40+Math.sin(q*6+k)*6,54-q*90,6+q*18,0,TAU);ctx.fill()}}
  if(m.id!=='c2'){const mx=246,my=-70;glow('240,235,210',mx,my,70,.22);ctx.fillStyle=Z.moon;circ(mx,my,17);ctx.fill();ctx.fillStyle='rgba(0,0,0,.12)';for(const[a,b,r] of [[-5,-4,4.5],[5,4,3],[-2,8,2.4]]){circ(mx+a,my+b,r);ctx.fill()}}
  for(let k=0;k<5;k++){const cx=((k*91+t*(3+k))%460)-50,cy=-150+k*34+(k%2)*12,w=60+k*14;ctx.fillStyle=m.id==='c2'?'rgba(70,24,16,.55)':m.id==='c3'?'rgba(20,38,30,.55)':m.id==='c4'?'rgba(50,70,110,.45)':m.id==='inf'?'rgba(40,20,70,.5)':'rgba(24,30,58,.6)';
    ctx.beginPath();ctx.ellipse(cx,cy,w,9,0,0,TAU);ctx.ellipse(cx-w*.3,cy-6,w*.45,8,0,0,TAU);ctx.ellipse(cx+w*.25,cy-5,w*.4,7,0,0,TAU);ctx.fill();
    ctx.strokeStyle=m.id==='c2'?'rgba(255,120,60,.18)':'rgba(220,225,255,.14)';ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(cx-w*.3,cy-6,w*.45,8,0,Math.PI*1.1,Math.PI*1.9);ctx.stroke()}
  if((t%9)<.6){const q=(t%9)/.6;ctx.strokeStyle=`rgba(255,255,240,${(1-q)*.8})`;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(40+q*120,-200+q*50);ctx.lineTo(28+q*120,-203+q*50);ctx.stroke()}
  for(let i=0;i<90;i++){const sx=(i*97.3)%SW,sy=-260+(i*53.7)%330,tw=.4+.6*Math.abs(Math.sin(t*1.3+i*1.7));if(m.id==='c2'&&i%3)continue;ctx.fillStyle=`rgba(255,250,230,${tw*.7})`;ctx.fillRect(sx,sy,1.2,1.2)}
  // the realm beyond the door
  const gx=GATE.x,gw=GATE.w,gt=GATE.top,gb=GATE.bot,pul=.7+.3*Math.sin(t*1.8);
  ctx.save();ctx.beginPath();ctx.moveTo(gx-gw,gb);ctx.lineTo(gx-gw,gt+gw);ctx.arc(gx,gt+gw,gw,Math.PI,0);ctx.lineTo(gx+gw,gb);ctx.closePath();ctx.clip();
  {const gl=open?1:.25;ctx.fillStyle='#070504';ctx.fillRect(gx-gw,gt,gw*2,gb-gt);
    const deep=ctx.createRadialGradient(gx,gb+4,1,gx,gb,34);deep.addColorStop(0,`rgba(${m.glow},${.95*gl*pul})`);deep.addColorStop(.4,`rgba(${m.glow},${.35*gl})`);deep.addColorStop(1,`rgba(${m.glow},0)`);ctx.fillStyle=deep;ctx.fillRect(gx-gw,gt,gw*2,gb-gt);
    for(const z of [.82,.64,.48,.34,.22]){const cy=gt+gw+(gb-gt-gw)*(1-z)*1.15,r=gw*z;ctx.strokeStyle=`rgba(${m.glow},${(.12+.5*(1-z))*gl})`;ctx.lineWidth=1.6*z+.4;ctx.beginPath();ctx.moveTo(gx-r,gb);ctx.lineTo(gx-r,cy);ctx.arc(gx,cy,r,Math.PI,0);ctx.lineTo(gx+r,gb);ctx.stroke()}
    for(let k=0;k<4;k++){const y=gb-1-k*2.2,w=gw*(.3-k*.05);ctx.fillStyle=`rgba(${m.glow},${(.35-k*.07)*gl})`;ctx.fillRect(gx-w,y,w*2,1)}
    const fog=ctx.createLinearGradient(0,gt,0,gb);fog.addColorStop(0,'rgba(0,0,0,.6)');fog.addColorStop(.55,'rgba(0,0,0,0)');ctx.fillStyle=fog;ctx.fillRect(gx-gw,gt,gw*2,gb-gt)}
  if(open)for(let k=0;k<8;k++){const q=(t*.25+k/8)%1;ctx.fillStyle=`rgba(${m.glow},${(1-q)*.9})`;ctx.fillRect(gx+Math.sin(k*2.1+t)*gw*.6,gb-4-q*38,1.4,1.4)}
  else{ctx.strokeStyle=INK;ctx.lineWidth=3.2;for(let bx=gx-gw+5;bx<gx+gw;bx+=6.5){ctx.beginPath();ctx.moveTo(bx,gt);ctx.lineTo(bx,gb);ctx.stroke()}ctx.strokeStyle='#7a808a';ctx.lineWidth=1.6;for(let bx=gx-gw+5;bx<gx+gw;bx+=6.5){ctx.beginPath();ctx.moveTo(bx,gt);ctx.lineTo(bx,gb);ctx.stroke()}
    for(const y of [gt+18,gb-10]){ctx.strokeStyle=INK;ctx.lineWidth=3.2;ctx.beginPath();ctx.moveTo(gx-gw,y);ctx.lineTo(gx+gw,y);ctx.stroke();ctx.strokeStyle='#7a808a';ctx.lineWidth=1.6;ctx.stroke()}}
  ctx.restore();
  if(!open){ink(1.6);ctx.fillStyle='#c9a040';ctx.fillRect(gx-5,gb-34,10,9);ctx.strokeRect(gx-5,gb-34,10,9);ctx.beginPath();ctx.arc(gx,gb-34,3.5,Math.PI,0);ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.stroke();ctx.strokeStyle='#c9a040';ctx.lineWidth=1.4;ctx.stroke()}
  // rune on the pediment
  glow(m.glow,180,72,16,open?.6*pul:.12);ctx.strokeStyle=`rgba(${m.glow},${open?.95:.3})`;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(180,66);ctx.lineTo(184.5,72);ctx.lineTo(180,78);ctx.lineTo(175.5,72);ctx.closePath();ctx.stroke();
  // torches: two on the columns, two on the posts by the steps
  for(const[tx,ty,ts] of [[131,103,.55],[229,103,.55],[120,160,.95],[240,160,.95]])campTorch(tx,ty,ts,Z.torch,tx*.1);
  // sparks rising from the runes
  const hx=180,hy=HOME_Y;
  if(Math.random()<dt*(LOWFX?3:9))CAMP.embers.push({x:hx+rand(-19,19)*hs,y:hy+rand(-3,3)*hs,vx:rand(-3,3),vy:rand(-26,-12),l:rand(1.2,2.4),c:m.glow});
  // the hero on the rune stone, the companions beside him (only the ones you own and took with you)
  drawRuneStone(hx,hy,hs,m.glow,t);
  if(CAMP.walk>0){const p=Math.min(1,(t-CAMP.walk)/1.5),q=Math.max(0,(p-.12)/.88),a1=Math.min(1,q/.6),a2=Math.max(0,(q-.6)/.4),ey=gb+2,py=hy+(190-hy)*a1+(ey-190)*a2,sc=hs-(hs-1.1)*a1-.35*a2;
    ctx.globalAlpha=a2>.4?Math.max(0,1-(a2-.4)/.6):1;ctx.save();ctx.translate(hx,py);ctx.scale(sc,sc);noShadow=false;mossOn=1;drawRig(0,0,-Math.PI/2,t*10,q>0,heroStyle(),{});mossOn=0;ctx.restore();ctx.globalAlpha=1;CAMP.hero=null}
  else{drawHomeHero(hx,hy,hs,t);CAMP.hero={x:ox+hx*u,y:oy+hy*u,w:20*hs*u,h:50*hs*u,dpr}}
  if(SAVE.pets)petEq().forEach((id,i)=>{const px=hx+(i?-1:1)*20*hs,py=hy+3*hs,ps=hs*.5;ctx.save();ctx.translate(px,py);ctx.scale(ps,ps);ctx.fillStyle='rgba(0,0,0,.3)';ell(0,2,9,3);ctx.fill();const hb=Math.pow(Math.max(0,Math.sin((t+i*2.3)*.8)),14);ctx.translate(0,-(typeof N3!=='undefined'&&N3[id]?0:hb*7));drawPetSprite(id,0,0,{t:t+i*.7,face:i?0:Math.PI,moving:false,att:0,happy:hb>.2?.5:0,hop:0});ctx.restore()});
  for(let i=CAMP.embers.length-1;i>=0;i--){const e=CAMP.embers[i];e.l-=dt;e.x+=(e.vx+Math.sin(t*5+i)*14)*dt;e.y+=e.vy*dt;if(e.l<=0){CAMP.embers.splice(i,1);continue}if(e.c){ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=`rgba(${e.c},${Math.min(1,e.l)*.9})`;ctx.fillRect(e.x-.9,e.y-.9,1.8,1.8);ctx.restore()}else{ctx.fillStyle=`rgba(255,${170+(i*37)%80},90,${Math.min(1,e.l)})`;ctx.fillRect(e.x,e.y,1.6,1.6)}}
  // ambient life
  if(CAMP.amb.length<30)CAMP.amb.push({x:rand(0,SW),y:rand(-60,SH+40),ph:rand(0,9),v:rand(-6,6)});
  ctx.save();ctx.globalCompositeOperation='lighter';
  for(const a of CAMP.amb){a.ph+=dt;if(m.id==='c4'){a.y+=dt*14;a.x+=Math.sin(a.ph)*dt*8-dt*4;if(a.y>SH+20)a.y=-60;ctx.fillStyle='rgba(255,255,255,.75)';ctx.fillRect(a.x,a.y,1.6,1.6)}
    else if(m.id==='c1'||m.id==='c3'){a.x+=Math.sin(a.ph*.8)*dt*8;a.y+=Math.cos(a.ph*.6)*dt*6;const b=(Math.sin(a.ph*2.4)+1)/2;glow(m.id==='c3'?'220,255,110':'210,255,120',a.x,a.y,m.id==='c3'?6:5,.5*b)}
    else if(m.id==='c2'){a.y+=dt*10;a.x+=Math.sin(a.ph)*dt*6;if(a.y>SH)a.y=60;ctx.fillStyle='rgba(170,160,150,.35)';ctx.fillRect(a.x,a.y,1.6,1.2)}
    else{a.y-=dt*6;if(a.y<60)a.y=SH;const b=(Math.sin(a.ph*2)+1)/2;glow('190,130,255',a.x,a.y,4,.5*b)}}
  ctx.restore();
  // night: darkness with holes of light
  const lx=campLx;lx.globalCompositeOperation='source-over';lx.clearRect(0,0,SW,LH);lx.fillStyle=`rgba(6,4,14,${m.id==='c2'?.45:m.id==='c4'?.4:.55})`;lx.fillRect(0,0,SW,LH);
  lx.globalCompositeOperation='destination-out';const spr=glowSprite('0,0,0'),Lt=(x,y,r,a)=>{lx.globalAlpha=Math.min(1,a);lx.drawImage(spr,x-r,y+LO-r,r*2,r*2)};
  const fl=1+.04*Math.sin(t*2.1);Lt(hx,hy-18*hs,(44+18*hs)*fl,1);Lt(hx,hy-6*hs,(18+10*hs)*fl,1);
  for(const[tx,ty,r] of [[131,100,34],[229,100,34],[120,154,52],[240,154,52]])Lt(tx,ty,r*(1+.04*Math.sin(t*5+tx)),.9);
  Lt(gx,gb-14,open?50:24,open?.9:.5);if(m.id!=='c2')Lt(246,-70,60,.7);else Lt(277,58,60,.7);
  lx.globalAlpha=1;ctx.drawImage(campL,0,-LO,SW,LH);
  ctx.save();ctx.globalCompositeOperation='lighter';glow(m.glow,hx,hy-6,16*hs,.14+.04*Math.sin(t*2.1));glow(m.glow,gx,gb-12,30,open?.22*pul:.04);ctx.restore();
  const v=ctx.createRadialGradient(SW/2,SH*.6,SH*.4,SW/2,SH*.6,SH*1.3);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.5)');ctx.fillStyle=v;ctx.fillRect(-400,-LO,SW+800,LH);
  if(CAMP.swap>0){CAMP.swap=Math.max(0,CAMP.swap-dt*3);ctx.fillStyle=`rgba(6,4,10,${CAMP.swap})`;ctx.fillRect(-400,-LO,SW+800,LH)}
  if(CAMP.walk>0&&t-CAMP.walk>1.25){ctx.fillStyle=`rgba(6,4,10,${Math.min(1,(t-CAMP.walk-1.25)/.4)})`;ctx.fillRect(-400,-LO,SW+800,LH)}
  ctx.setTransform(1,0,0,1,0,0);ctx=saved}
$('playBtn').onclick=()=>goPlay('arena');

// --- hero tab ---
let heroView=SAVE.hero,heroConfirm=null,heroSeg='coll';
function drawPortrait(cv,S,face,sc){const c=cv.getContext('2d'),saved=ctx;ctx=c;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,cv.width,cv.height);c.setTransform(sc,0,0,sc,cv.width/2,cv.height*.72);noShadow=false;drawRig(0,0,face,0,false,S,{});ctx=saved}
document.querySelectorAll('.harr').forEach(b=>b.onclick=()=>{const i=HEROES.findIndex(h=>h.id===heroView);heroView=HEROES[(i+(+b.dataset.h)+HEROES.length)%HEROES.length].id;heroConfirm=null;pvT=1.1*2;sfx('ui');renderHero()});
$('hAct').onclick=e=>{const b=e.target.closest('[data-hact]');if(!b)return;e.stopPropagation();const h=HERO_BY[heroView];
  if(b.dataset.hact==='use'){SAVE.hero=h.id;save();sfx('upgrade');renderHero();return}
  if(heroConfirm!==h.id){heroConfirm=h.id;renderHero();setTimeout(()=>{if(heroConfirm===h.id){heroConfirm=null;if(!$('tabHero').hidden)renderHero()}},3000);return}
  heroConfirm=null;if(SAVE.gold<h.price){toast(`Ti servono ${h.price} oro`);renderHero();return}
  SAVE.gold-=h.price;SAVE.heroes[h.id]=1;SAVE.hero=h.id;save();renderGold();sfx('upgrade');achPop('Nuovo eroe',h.n+' si unisce alla compagnia','unlock');checkAch();save();renderHero()};
function renderTalents(){$('talents').innerHTML=TAL.map(t=>{const l=SAVE.tal[t.id]||0,max=l>=t.max,c=talCost(t,l);return `<div class="tal"><svg viewBox="0 0 40 40" aria-hidden="true">${TICON[t.ic]}</svg><div><b>${t.n} <i>${l}/${t.max}</i></b><span>${l?t.d(l):t.d(1)}${l&&!max?` <i>poi ${t.d(l+1)}</i>`:''}</span></div><button class="btn tbuy" data-tal="${t.id}" ${max||SAVE.gold<c?'disabled':''}>${max?'Al massimo':c+' oro'}</button></div>`}).join('')}
$('talents').addEventListener('click',e=>{const b=e.target.closest('.tbuy');if(!b||b.disabled)return;e.stopPropagation();const t=TAL.find(x=>x.id===b.dataset.tal),l=SAVE.tal[t.id]||0,c=talCost(t,l);if(l>=t.max||SAVE.gold<c)return;
  SAVE.gold-=c;SAVE.tal[t.id]=l+1;save();renderGold();sfx('upgrade');toast(`${t.n} sale al livello ${l+1}`);renderHero()});
function renderSets(){const act=activeSets(),eq=eqIds();$('setBox').innerHTML=SETS.map(s=>{const on=act.includes(s),have=s.items.filter(i=>eq.includes(i)).length;
  return `<div class="set ${on?'on':''}"><b>${s.n} <i>${have} di 2 indossati</i></b><span>${s.items.map(i=>`<u class="${eq.includes(i)?'has':SAVE.items[i]?'own':''}">${ITEM[i].n}</u>`).join(' e ')}</span><small>${s.d}</small></div>`}).join('')}

// --- who badge and profile ---
function renderWho(){if(!$('whoCv'))return;const h=HERO_BY[SAVE.hero],F=FRAMES[SAVE.frame]||FRAMES.base;$('whoName').textContent=h.n;$('whoTitle').textContent=SAVE.title||'Senza titolo';$('whoCv').style.setProperty('--f1',F.c[0]);drawPortrait($('whoCv'),heroStyle(),Math.PI*.55,2.3)}
let profSeg='ach';
$('profSeg').onclick=e=>{const b=e.target.closest('button');if(!b)return;profSeg=b.dataset.v;sfx('ui');renderProfile()};
$('skins').onclick=e=>{const b=e.target.closest('[data-skin]');if(!b||b.disabled)return;SAVE.skin=b.dataset.skin||null;save();sfx('ui');renderProfile();renderTop.k=null;renderTop()};
$('titles').onclick=e=>{const b=e.target.closest('[data-title]');if(!b)return;SAVE.title=b.dataset.title==='Senza titolo'?null:b.dataset.title;save();sfx('ui');renderProfile()};
$('frames').onclick=e=>{const b=e.target.closest('[data-frame]');if(!b)return;if(b.classList.contains('lock')){toast('Questa cornice si ottiene con un traguardo');return}SAVE.frame=b.dataset.frame;save();sfx('ui');renderProfile()};

// ===== richer menus: hero showcase, merchant with daily deals, player card =====
const SI={atk:'<path d="M4 16L14 6M12 4l4 4M3 17l2-1-1-1z" stroke="#1b1612" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M4 16L14 6" stroke="#dfe4ea" stroke-width="1.6"/>',
  hp:'<path d="M10 17C4 13 2 10 2 7a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 3-2 6-8 10z" fill="#e5484d" stroke="#1b1612" stroke-width="1.8"/>',
  aspd:'<path d="M11 1L4 11h5l-2 8 8-11h-5z" fill="#ffc93c" stroke="#1b1612" stroke-width="1.6" stroke-linejoin="round"/>',
  crit:'<circle cx="10" cy="10" r="7" fill="none" stroke="#e5484d" stroke-width="2.4"/><circle cx="10" cy="10" r="2.4" fill="#e5484d"/><path d="M10 1v4M10 15v4M1 10h4M15 10h4" stroke="#1b1612" stroke-width="2"/>',
  dash:'<path d="M7 3h7l-4 6h6L7 18l2-7H4z" fill="#2fb3a6" stroke="#1b1612" stroke-width="1.6" stroke-linejoin="round"/>',
  spd:'<path d="M5 14c0-5 3-10 7-10 2 0 3 2 3 4 0 4-4 6-10 6z" fill="#c9a26a" stroke="#1b1612" stroke-width="1.6"/><path d="M2 17h12" stroke="#1b1612" stroke-width="2" stroke-linecap="round"/>',
  gold:'<circle cx="10" cy="10" r="7" fill="#ffc93c" stroke="#1b1612" stroke-width="1.8"/><circle cx="10" cy="10" r="3.6" fill="none" stroke="#b07a10" stroke-width="1.6"/>',
  regen:'<path d="M10 2c4 4 6 7 6 10a6 6 0 0 1-12 0c0-3 2-6 6-10z" fill="#7bbf4a" stroke="#1b1612" stroke-width="1.6"/><path d="M10 9v6M7 12h6" stroke="#f6ead2" stroke-width="1.8"/>'};
const sico=k=>`<svg viewBox="0 0 20 20" aria-hidden="true">${SI[k]}</svg>`;
const COIN='<i class="coin"></i>';
const powerOf=q=>Math.round(q.atk*12+q.maxhp*2.2+q.aspd*120+q.crit*900+(q.regen||0)*80+(2.4-q.dashMax)*60);
// the showcase: light rays, a glowing rune pedestal, the hero turning slowly
const SHOW={sp:[]};
function drawHeroPreview(dt,cvx,hid){pvT+=dt;const C=cvx||hcv,X=C.getContext('2d'),hv=hid||heroView,d=Math.floor(pvT/1.3)%8,saved=ctx;ctx=X;const W=C.width,H=C.height,t=pvT;
  X.setTransform(1,0,0,1,0,0);X.clearRect(0,0,W,H);
  const own=SAVE.heroes[hv],col=own?'255,200,110':'150,140,170';
  X.save();X.translate(W/2,H*.5);X.globalCompositeOperation='lighter';
  for(let i=0;i<12;i++){const a=i/12*TAU+t*.15;X.rotate(TAU/12);X.fillStyle=`rgba(${col},${.05+.025*Math.sin(t*1.3+i)})`;X.beginPath();X.moveTo(0,0);X.lineTo(W*.7,-26);X.lineTo(W*.7,26);X.closePath();X.fill()}
  X.restore();
  const g=X.createRadialGradient(W/2,H*.6,10,W/2,H*.6,W*.5);g.addColorStop(0,`rgba(${col},.35)`);g.addColorStop(1,`rgba(${col},0)`);X.fillStyle=g;X.fillRect(0,0,W,H);
  X.setTransform(W/90,0,0,W/90,W/2,H*.76);
  ink(2.5);ell(0,6,30,9);fs('#2a221c');ell(0,3,28,8);fs('#4d4237');ctx.strokeStyle=`rgba(${col},${.55+.25*Math.sin(t*2)})`;ctx.lineWidth=1.2;ell(0,3,22,6);ctx.stroke();ell(0,3,15,4);ctx.stroke();
  for(let k=0;k<8;k++){const a=k/8*TAU+t*.4;ctx.fillStyle=`rgba(${col},.8)`;circ(Math.cos(a)*18.5,3+Math.sin(a)*5,.9);ctx.fill()}
  if(Math.random()<dt*10)SHOW.sp.push({x:rand(-24,24),y:rand(-5,6),l:rand(.8,1.6)});
  noShadow=false;if(!own)ctx.globalAlpha=.85;drawRig(0,0,d*Math.PI/4,t*9,true,heroStyle(hv),{});ctx.globalAlpha=1;
  ctx.save();ctx.globalCompositeOperation='lighter';for(let i=SHOW.sp.length-1;i>=0;i--){const p=SHOW.sp[i];p.l-=dt;p.y-=dt*14;if(p.l<=0){SHOW.sp.splice(i,1);continue}ctx.fillStyle=`rgba(${col},${Math.min(1,p.l)})`;circ(p.x,p.y,.7);ctx.fill()}ctx.restore();
  ctx=saved}

// --- merchant: daily deals + chests ---
const DEAL_N=[14,9,5,3,1],DEAL_P=[120,240,450,900,2200];
function ensureDeals(){const t=today();if(SAVE.deals&&SAVE.deals.day===t)return;
  let h=7;for(const ch of t)h=(Math.imul(h,31)+ch.charCodeAt(0))>>>0;const rnd=()=>{h=(Math.imul(h,1103515245)+12345)>>>0;return h/4294967296};
  const pick=r=>{const pool=ITEMS.filter(i=>i.rar===r);return pool[Math.floor(rnd()*pool.length)]};const list=[];
  for(const r of [0,1,2+(rnd()<.35?1:0)+(rnd()<.08?1:0)]){let it=pick(Math.min(4,r));while(list.some(x=>x.id===it.id))it=pick(Math.min(4,r));list.push({id:it.id,n:DEAL_N[it.rar],p:DEAL_P[it.rar],sold:false})}
  SAVE.deals={day:t,list};save()}
// gold for gems: what the crystals' gems are for
const GOLD_PACKS=[{n:'Manciata',g:300,c:25},{n:'Sacchetto',g:1000,c:70,tag:'+15%'},{n:'Forziere',g:3000,c:180,tag:'Più conveniente'}];
function coinPile(k){const C=[[38,44],[30,46],[46,46],[24,48],[38,50],[52,48],[31,40],[45,40],[38,34],[18,50],[58,50],[24,42],[52,42],[38,26]],n=[4,8,14][k];let s='';
  for(let i=0;i<n;i++){const[x,y]=C[i];s+=`<ellipse cx="${x}" cy="${y}" rx="9" ry="4.5" fill="#b5620a" stroke="#1b1612" stroke-width="1.8"/><ellipse cx="${x}" cy="${y-2.2}" rx="9" ry="4.5" fill="#f5ad1c" stroke="#1b1612" stroke-width="1.8"/><ellipse cx="${x}" cy="${y-2.4}" rx="6" ry="2.8" fill="#ffd84a"/><ellipse cx="${x-2.5}" cy="${y-3.4}" rx="3" ry="1.1" fill="#fff6c0"/>`}
  const fx=[[50,28],[52,24],[54,18]][k];return `<svg viewBox="0 0 76 58" aria-hidden="true">${s}<image href="${svgURL(COIN_SVG)}" x="${fx[0]}" y="${fx[1]}" width="24" height="24" transform="rotate(12 ${fx[0]+12} ${fx[1]+12})"/></svg>`}
function renderGoldPacks(){$('goldPacks').innerHTML=GOLD_PACKS.map((p,i)=>`<div class="gpack">${p.tag?`<span class="bonus">${p.tag}</span>`:''}${coinPile(i)}<b>${p.g.toLocaleString('it-IT')}</b><span>${p.n} d'oro</span>
  <button class="btn" data-gp="${i}" ${(SAVE.gems||0)>=p.c?'':'disabled'}><i class="gemS"></i>${p.c}</button></div>`).join('')}
$('goldPacks').addEventListener('click',e=>{const b=e.target.closest('[data-gp]');if(!b||b.disabled)return;const p=GOLD_PACKS[+b.dataset.gp];if((SAVE.gems||0)<p.c)return;
  SAVE.gems-=p.c;SAVE.gold+=p.g;save();renderGold();renderShop();sfx('coin');setTimeout(()=>sfx('coin'),90);toast(`+${p.g.toLocaleString('it-IT')} oro`)});

// ===================== SHOP (sub-pages: daily, offers, chests, gold) =====================
let shopPage='spDaily';
const DISC=[10,20,30,30,40];
function dailyGift(){return 40+25*arenaIdx(SAVE.trophies||0)}
const freeReady=()=>{ensureDeals();return !SAVE.deals.free};
function renderShop(){ensureDeals();const D=SAVE.deals,t=new Date(),mid=new Date(t.getFullYear(),t.getMonth(),t.getDate()+1);
  $('dealT').innerHTML=`Si aggiorna tra <b>${fmtH(mid-t)}</b>`;
  const cell=(o)=>`<div class="dcard ${o.sold?'sold':''}" style="--rc:${o.rc||'#5fa8ff'};--rc2:${o.rc2||'#1d3f78'}">
    <b class="dt">${o.t}</b><div class="dic">${o.disc?`<span class="disc">-${o.disc}%</span>`:''}${o.icon}${o.n?`<em>${o.n}</em>`:''}</div><span class="left">${o.sold?'Esaurito':'Acquisti rimasti: 1'}</span><div class="dfoot">${o.btn}</div></div>`;
  const ch=CHESTS.argento,chP=Math.round(ch.price*.7),cells=[
    cell({t:'Regalo del giorno',icon:coinPile(0),n:'+'+dailyGift(),rc:'#ffd84a',rc2:'#6e4a0c',sold:D.free,btn:`<button class="btn go" data-dfree="1" ${D.free?'disabled':''}>${D.free?'Preso':'Gratis'}</button>${D.free?'':'<i class="bang">!</i>'}`}),
    ...D.list.map((d,i)=>{const it=ITEM[d.id],r=RAR[it.rar];return cell({t:it.n,icon:itemSVG(it),n:'x'+d.n,rc:r.c,rc2:r.d,disc:DISC[it.rar],sold:d.sold,btn:`<button class="btn go" data-deal="${i}" ${d.sold||SAVE.gold<d.p?'disabled':''}>${d.sold?'Venduto':COIN+d.p}</button>`})}),
    cell({t:ch.n,icon:chestSVG('argento',false),rc:'#c9e2ff',rc2:'#2e3a48',disc:30,sold:D.chest,btn:`<button class="btn go" data-dchest="1" ${D.chest||SAVE.gold<chP?'disabled':''}>${D.chest?'Venduto':COIN+chP}</button>`}),
    cell({t:"Sacco d'oro",icon:coinPile(1),n:'1.000',rc:'#ffd84a',rc2:'#6e4a0c',disc:30,sold:D.gp,btn:`<button class="btn go" data-dgp="1" ${D.gp||(SAVE.gems||0)<50?'disabled':''}>${D.gp?'Venduto':'<i class="gemS"></i>50'}</button>`})];
  $('daily').innerHTML=cells.join('');
  $('shop').innerHTML=Object.entries(CHESTS).map(([k,c])=>{const best=k==='oro';
    return `<div class="crate c-${k}">${best?'<span class="flag">Il più ricco</span>':''}<div class="cpic">${chestSVG(k,false)}</div><b class="cn">${c.n}</b><span class="cc">${c.cards} carte<br>${c.gold[0]}-${c.gold[1]} oro</span>
      <div class="odds">${c.odds.map((v,j)=>v?`<i style="--rc:${RAR[j].c}" title="${RAR[j].n}">${v}%</i>`:'').join('')}</div>
      <button class="btn" data-buy="${k}" ${SAVE.gold>=c.price?'':'disabled'}>${COIN}${c.price}</button></div>`}).join('');
  renderGoldPacks();renderPacks()}
$('daily').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;const D=SAVE.deals;
  if(b.dataset.dfree){if(D.free)return;D.free=true;const g=dailyGift();SAVE.gold+=g;save();renderGold();renderShop();sfx('coin');setTimeout(()=>sfx('coin'),90);toast(`+${g} oro`);return}
  if(b.dataset.dchest){const p=Math.round(CHESTS.argento.price*.7);if(D.chest||SAVE.gold<p)return;D.chest=true;SAVE.gold-=p;save();renderGold();renderShop();openChest('argento');return}
  if(b.dataset.dgp){if(D.gp||(SAVE.gems||0)<50)return;D.gp=true;SAVE.gems-=50;SAVE.gold+=1000;save();renderGold();renderShop();sfx('coin');toast('+1.000 oro');return}
  if(b.dataset.deal!=null){const d=D.list[+b.dataset.deal];if(!d||d.sold||SAVE.gold<d.p)return;
    SAVE.gold-=d.p;d.sold=true;const o=SAVE.items[d.id];if(!o){SAVE.items[d.id]={lvl:1,cards:d.n-1};const sl=ITEM[d.id].slot;if(!SAVE.eq[sl])SAVE.eq[sl]=d.id}else o.cards+=d.n;
    save();renderGold();renderShop();sfx('upgrade');vib(25);toast(`+${d.n} carte: ${ITEM[d.id].n}`)}});
// one-time packs: one for every arena you reach, plus a starter pack
function packList(){if(!SAVE.packs)SAVE.packs={};const L=[],ai=arenaIdx(SAVE.trBest||SAVE.trophies||0);
  if(!SAVE.packs.start)L.push({id:'start',t:"Pacchetto dell'esploratore",sub:'Per iniziare alla grande',val:300,chest:'argento',gold:400,c:40,col:'#5fd0f0'});
  if(!SAVE.pets.owned.draghetto&&!SAVE.packs.drago)L.push({id:'drago',t:'Compagno: Draghetto',sub:'Sputa fuoco al tuo fianco',val:200,pet:'draghetto',gold:300,c:500,col:'#ff7a3c'});
  for(let i=0;i<=ai;i++)if(!SAVE.packs['arena'+i])L.push({id:'arena'+i,t:`Pacchetto Arena ${i+1}`,sub:ARENAS[i].n,val:300+25*i,chest:'oro',gold:400*(i+1),c:90+30*i,col:ARENAS[i].col,arena:i});
  return L}
function renderPacks(){const L=packList();
  $('packs').innerHTML=L.length?L.map(p=>`<div class="pack" style="--pc:${p.col}"><span class="val">${p.val}%<br>Valore</span>
    <div class="part">${p.arena!=null?`<img class="pthumb" src="${arenaThumb(p.arena)}" alt="">`:''}<div class="pchest">${p.pet?`<img class="ppet" src="${petIcon(p.pet)}" alt="">`:chestSVG(p.chest,false)}</div><div class="pcoins">${coinPile(2)}</div></div>
    <div class="pinfo"><b>${p.t}</b><small>${p.sub}</small><span class="once">Solo una volta</span>
      <div class="pitems"><span class="pi">${p.pet?`<img src="${petIcon(p.pet)}" alt="">`:chestSVG(p.chest,false)}<em>1</em></span><span class="pi"><i class="coin"></i><em>${p.gold.toLocaleString('it-IT')}</em></span></div>
      <button class="btn go" data-pack="${p.id}" ${(SAVE.gems||0)>=p.c?'':'disabled'}><i class="gemS"></i>${p.c}</button></div></div>`).join('')
    :`<div class="pempty">Hai preso tutte le offerte!<br><small>Ne arriva una nuova a ogni arena che sblocchi.</small></div>`;
  $('pdots').innerHTML=L.length>1?L.map((p,i)=>`<i class="${i===0?'on':''}"></i>`).join(''):''}
$('packs').addEventListener('scroll',()=>{const el=$('packs'),i=Math.round(el.scrollLeft/Math.max(1,el.clientWidth));[...$('pdots').children].forEach((d,j)=>d.classList.toggle('on',j===i))},{passive:true});
$('packs').addEventListener('click',e=>{const b=e.target.closest('[data-pack]');if(!b||b.disabled)return;const p=packList().find(x=>x.id===b.dataset.pack);if(!p||(SAVE.gems||0)<p.c)return;
  SAVE.packs[p.id]=1;SAVE.gems-=p.c;SAVE.gold+=p.gold;save();renderGold();renderShop();sfx('coin');toast(`+${p.gold.toLocaleString('it-IT')} oro`);if(p.pet){unlockPet(p.pet);save()}else setTimeout(()=>openChest(p.chest),250)});

// ===================== TROPHY ROAD (its own tab, with arena previews) =====================
function arenaThumb(i){const A=ARENAS[i],k='thumb'+i;if(CAMP.bg[k])return CAMP.bg[k];const src=campBg(modeOf(A.ch)),c=document.createElement('canvas');c.width=360;c.height=200;const x=c.getContext('2d');
  if(HASF&&A.tint)x.filter=A.tint;x.drawImage(src,0,30,src.width,src.height*200/270*.9,0,0,360,200);x.filter='none';
  if(!HASF&&A.tint){x.globalCompositeOperation='color';x.globalAlpha=.5;x.fillStyle=A.col;x.fillRect(0,0,360,200)}
  return CAMP.bg[k]=c.toDataURL('image/jpeg',.82)}
function renderRoad(keep){const T=SAVE.trophies||0,B=SAVE.trBest||0,ai=arenaIdx(T),L=roadList().slice().reverse();let html='',placed=false;
  const arenaCard=i=>{const A=ARENAS[i],st=i<ai?'past':i===ai?'cur':B>=A.t?'past':'lock';
    return `<div class="acard ${st}" style="--ac:${A.col}"><div class="apic"><img src="${arenaThumb(i)}" alt="">${st==='lock'?`<span class="alock">${LOCK}</span>`:''}<span class="anum">Arena ${i+1}</span>${st==='cur'?'<span class="acur">Sei qui</span>':''}</div>
      <div class="ainfo"><b>${A.n}</b><small>${A.d}</small><span class="atr">${TROPHY}${A.t.toLocaleString('it-IT')}</span></div></div>`};
  for(const n of L){const st=SAVE.road[n.t]?'done':B>=n.t?'ready':'lock';
    if(!placed&&T>=n.t){placed=true;html+=`<div class="rhere" id="rHere">Sei qui ${TROPHY}${T.toLocaleString('it-IT')}</div>`}
    if(n.arena)html+=arenaCard(n.arena);
    html+=`<div class="rnode ${st}${n.arena?' big':''}"><span class="rt">${TROPHY}${n.t.toLocaleString('it-IT')}</span><span class="rr">${n.k==='chest'?`<span class="rch">${chestSVG(n.v,false)}</span>`:''}${rewardLabel(n)}</span>${st==='ready'?`<button class="btn go" data-road="${n.t}">Riscatta</button>`:st==='done'?'<em class="ok">Preso</em>':LOCK}</div>`}
  if(!placed)html+=`<div class="rhere" id="rHere">Sei qui ${TROPHY}${T}</div>`;
  html+=arenaCard(0);
  $('roadHead').innerHTML=`<span class="trNow">${TROPHY}${T.toLocaleString('it-IT')}</span><small>Record ${B.toLocaleString('it-IT')} · ${roadReady()?`<em>${roadReady()} premi da riscattare</em>`:'i premi si sbloccano con il record'}</small>`;
  $('road').innerHTML=html;if(!keep)setTimeout(()=>{const h=$('rHere');if(h&&!$('tabRoad').hidden)h.scrollIntoView({block:'center'})},40)}
document.addEventListener('click',e=>{const b=e.target.closest('[data-road]');if(!b)return;const t=+b.dataset.road,n=roadList().find(x=>x.t===t);if(!n||SAVE.road[t]||(SAVE.trBest||0)<t)return;
  SAVE.road[t]=1;if(n.k==='gold'){SAVE.gold+=n.v;toast(`+${n.v} oro`);sfx('coin')}else if(n.k==='gems'){SAVE.gems=(SAVE.gems||0)+n.v;toast(`+${n.v} cristalli`);sfx('gem')}else if(n.k==='pet'){unlockPet(n.v);sfx('victory')}else if(n.k==='petc'){const u=addPetCards(n.v,n.n);save();sfx('victory');toast(u?`${PET_BY[n.v].n}: nuovo compagno!`:`+${n.n} carte ${PET_BY[n.v].n}`);if(u)achPop('Nuovo compagno!',PET_BY[n.v].n+': trovalo nella scheda Compagni','unlock')}
  save();renderGold();renderRoad(true);if(n.k==='chest')openChest(n.v)});

// ===================== MENU POLISH =====================
// --- daily login: 7 days, a gold chest on day 7, then it starts again
const LOGIN=[{k:'gold',v:100},{k:'gems',v:5},{k:'chest',v:'legno'},{k:'gold',v:200},{k:'gems',v:10},{k:'chest',v:'argento'},{k:'chest',v:'oro'}];
if(!SAVE.login)SAVE.login={last:'',n:0};if(!SAVE.pname)SAVE.pname='Esploratore';
const loginReady=()=>SAVE.login.last!==today();
function loginIcon(r){return r.k==='gold'?coinPile(r.v>300?1:0):r.k==='gems'?'<span class="bigGem"></span>':chestSVG(r.v,false)}
function loginLabel(r){return r.k==='gold'?r.v+' oro':r.k==='gems'?r.v+' cristalli':CHESTS[r.v].n}
function fillLogin(){const n=SAVE.login.n%7,ready=loginReady();
  $('sheet').innerHTML=`<h2>Accesso giornaliero</h2><p class="lead">Torna ogni giorno: al 7° giorno ti aspetta una <b>Cassa d'oro</b>!</p><div class="login">${LOGIN.map((r,i)=>{const st=i<n?'got':i===n&&ready?'today':i===n?'next':'later';
    return `<div class="lday ${st}${i===6?' big':''}"><span class="ld">Giorno ${i+1}</span><div class="lic">${loginIcon(r)}</div><span class="ll">${loginLabel(r)}</span>${st==='got'?'<i class="lok">✓</i>':''}${st==='today'?'<button class="btn go" data-login="1">Riscatta</button>':''}</div>`}).join('')}</div>
    ${ready?'':`<p class="lead" style="text-align:center">Prossimo premio tra <b>${fmtH(new Date(new Date().setHours(24,0,0,0))-new Date())}</b></p>`}<button class="btn alt close">Chiudi</button>`}
document.addEventListener('click',e=>{const b=e.target.closest('[data-login]');if(!b||!loginReady())return;const r=LOGIN[SAVE.login.n%7];SAVE.login={last:today(),n:SAVE.login.n+1};
  if(r.k==='gold'){SAVE.gold+=r.v;sfx('coin');setTimeout(()=>sfx('coin'),90)}else if(r.k==='gems'){SAVE.gems=(SAVE.gems||0)+r.v;sfx('gem')}
  save();renderGold();toast('+'+loginLabel(r));if(r.k==='chest'){closeSheet();openChest(r.v)}else fillLogin();renderSide()});
// --- side buttons on the home scene (Archero-style)
$('passBtn').onclick=()=>openSheet('pass');
$('loginBtn').onclick=()=>openSheet('login');
$('offerBtn').onclick=()=>{sfx('ui');setTab('tabShop');setShopPage('spOffers');renderShop()};
$('roadSide').onclick=()=>{sfx('ui');setTab('tabRoad')};
// --- numbers that count up instead of jumping
function tweenNum(el,to){if(el.dataset.v==null){el.dataset.v=to;el.textContent=to.toLocaleString('it-IT');return}const from=+el.dataset.v;el.dataset.v=to;if(from===to)return;
  const t0=performance.now(),d=Math.min(800,260+Math.abs(to-from)*1.5);cancelAnimationFrame(el._r);
  const step=n=>{const k=Math.min(1,(n-t0)/d),v=Math.round(from+(to-from)*(1-Math.pow(1-k,3)));el.textContent=v.toLocaleString('it-IT');if(k<1)el._r=requestAnimationFrame(step)};el._r=requestAnimationFrame(step);
  const r=el.closest('.res');if(r&&r.animate)r.animate(to>from?[{transform:'scale(1)'},{transform:'scale(1.14)'},{transform:'scale(1)'}]:[{transform:'translateX(0)'},{transform:'translateX(-3px)'},{transform:'translateX(3px)'},{transform:'translateX(0)'}],{duration:to>from?380:240})}
// --- your own name
function editName(){const h2=$('pName');if(h2.querySelector('input'))return;const inp=document.createElement('input');inp.className='nameIn';inp.maxLength=14;inp.value=SAVE.pname;inp.setAttribute('aria-label','Il tuo nome');
  h2.textContent='';h2.appendChild(inp);inp.focus();inp.select();
  const done=()=>{const v=inp.value.trim().replace(/\s+/g,' ').slice(0,14);if(v)SAVE.pname=v;save();renderProfile();renderTop()};
  inp.addEventListener('keydown',e=>{if(e.key==='Enter')inp.blur();if(e.key==='Escape'){inp.value=SAVE.pname;inp.blur()}});inp.addEventListener('blur',done,{once:true})}
$('pName').addEventListener('click',e=>{if(!e.target.closest('input')){sfx('ui');editName()}});


// --- player card ---
function renderProfile(){const h=HERO_BY[SAVE.hero],F=FRAMES[SAVE.frame]||FRAMES.base;
  $('avatar').style.setProperty('--f1',F.c[0]);$('avatar').style.setProperty('--f2',F.c[1]);$('pcard').style.setProperty('--f1',F.c[0]);drawPortrait($('avCv'),heroStyle(),Math.PI*.62,3.6);
  $('pName').textContent=SAVE.pname||h.n;$('pTitle').textContent=SAVE.title||'Senza titolo';
  const q=previewStats();$('pPower').textContent=powerOf(q).toLocaleString('it-IT');
  const st=SAVE.stats;$('pStats').innerHTML=[['Partite',SAVE.runs],['Nemici',kc(st,'any')],['Boss',Object.values(st.bosses).reduce((a,b)=>a+b,0)],['Abisso',SAVE.inf.best]].map(([l,v])=>`<span><b>${v}</b>${l}</span>`).join('');
  for(const[k,id] of [['ach','vAch'],['lb','vLb'],['look','vLook']])$(id).hidden=profSeg!==k;
  document.querySelectorAll('#profSeg button').forEach(b=>b.classList.toggle('on',b.dataset.v===profSeg));
  const tl=ACH.filter(a=>SAVE.ach[a.id]&&a.title).map(a=>a.title).concat(SAVE.xtitles||[]);
  $('titles').innerHTML=['Senza titolo',...tl].map(t=>`<button class="chipb ${(SAVE.title||'Senza titolo')===t?'on':''}" data-title="${t}">${t}</button>`).join('');
  const fr=['base',...ACH.filter(a=>SAVE.ach[a.id]&&a.frame).map(a=>a.frame),...(SAVE.xframes||[])];
  $('skins').innerHTML=[['','Originale'],...Object.entries(SKINS).map(([k,v])=>[k,v.n])].map(([k,n])=>{const own=!k||(SAVE.skins&&SAVE.skins[k]);return `<button class="chipb ${(SAVE.skin||'')===k?'on':''} ${own?'':'lock'}" data-skin="${k}" ${own?'':'disabled'}>${n}${own?'':' · Pass d\'oro'}</button>`}).join('');
  $('frames').innerHTML=Object.keys(FRAMES).map(k=>{const own=fr.includes(k),f=FRAMES[k];return `<button class="frm ${SAVE.frame===k?'on':''} ${own?'':'lock'}" data-frame="${k}" style="--f1:${f.c[0]};--f2:${f.c[1]}" aria-label="Cornice ${f.n}"><i></i><small>${f.n}</small></button>`}).join('');
  const got=Object.keys(SAVE.ach).length;$('achCount').innerHTML=`<span><b>${got}</b> di ${ACH.length} traguardi ottenuti</span><div class="bar"><i style="width:${got/ACH.length*100}%"></i></div>`;
  $('achs').innerHTML=ACH.map(a=>{const v=Math.min(a.g,a.v(SAVE.stats)),done=!!SAVE.ach[a.id],p=v/a.g;return `<div class="ach ${done?'done':''}"><div class="medal" style="--p:${p*360}deg">${kind2svg('trophy')}</div><b>${a.n}</b><span>${a.d}</span>${done?`<small>${a.title?'«'+a.title+'»':''}</small>`:`<small class="prog">${v}/${a.g} · ${ACH_R[a.id]||5} cristalli</small>`}${done&&!SAVE.achC[a.id]?`<button class="btn go achClaim" data-achc="${a.id}">Riscatta +${ACH_R[a.id]||5} <i class="gemS"></i></button>`:''}</div>`}).join('');
  const T=SAVE.inf.top;
  $('lb').innerHTML=T.length?`<div class="podium">${[1,0,2].map(i=>T[i]?`<div class="pod p${i+1}"><b>Stanza ${T[i].room}</b><span>${HERO_BY[T[i].hero]?HERO_BY[T[i].hero].n:''}</span><div class="step">${i+1}</div></div>`:'<div class="pod empty"></div>').join('')}</div>`+T.slice(3).map((r,i)=>`<li><em>${i+4}</em><div><b>Stanza ${r.room}</b><span>${HERO_BY[r.hero]?HERO_BY[r.hero].n:''}, ${r.kills} nemici</span></div><small>${new Date(r.d).toLocaleDateString('it-IT')}</small></li>`).join('')
    :`<li class="empty">${modeOpen('inf')?"Scendi nell'Abisso per segnare il primo record.":"Sconfiggi il Golem di Muschio per aprire l'Abisso."}</li>`;
  renderWho()}

