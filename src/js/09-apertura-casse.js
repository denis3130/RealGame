// ---------- chest opening sequence ----------
const TIER={
  legno:{lvl:0,c1:'#ffb35a',bg:'#3a210c',rays:9,burst:80,charge:1,flash:'#ffe2b0',coins:0,cols:['#ffd58a','#ffb35a','#fff1d0'],size:210},
  argento:{lvl:1,c1:'#bfe3ff',bg:'#14273d',rays:13,burst:150,charge:2,flash:'#e9f6ff',coins:0,cols:['#ffffff','#bfe3ff','#7fc8ff','#d9c8ff'],size:230},
  oro:{lvl:2,c1:'#ffd84a',bg:'#3d2600',rays:18,burst:260,charge:3,flash:'#fff3c0',coins:46,cols:['#fff6c8','#ffd84a','#ffb020','#ffffff'],size:255}};
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const anim=(el,kf,opt)=>el.animate(kf,Object.assign({fill:'forwards'},opt)).finished;
const SND={
  thump:()=>{if(!AU.ctx)return;dDrum(null,AU.ctx.currentTime,.7,95,38,.5,400,.5)},
  rattle:k=>{if(!AU.ctx)return;const t=AU.ctx.currentTime;for(let i=0;i<4;i++)dDrum(null,t+i*.06,.18+k*.06,260+k*40,180,.08,2200,.6)},
  burst:lv=>{if(!AU.ctx)return;const t=AU.ctx.currentTime;sfx('boom');[67,71,74,79,83,86].slice(0,3+lv).forEach((m,i)=>vBell(null,t+.08+i*.06,m+lv*2,2.2,.05));if(lv>=2)[72,76,79,84].forEach(m=>vBrass(null,t+.1,m,1.2,.035))},
  whoosh:()=>sfx('dash'),
  rise:l=>sfx('shimmer',l),
  flip:r=>{if(!AU.ctx)return;const t=AU.ctx.currentTime;sfx('paper');
    const sets=[[84],[84,88],[84,88,91],[79,83,86,91,95],[72,76,79,84,88,91,96]][r];sets.forEach((m,i)=>vBell(null,t+.05+i*.07,m,1.8,.045));
    if(r>=3){[60,64,67,72].forEach(m=>vBrass(null,t+.05,m,1,.04));dDrum(null,t,.6,105,44,.8,500,.5)}},
  tick:()=>sfx('click'),
  ready:()=>{if(!AU.ctx)return;const t=AU.ctx.currentTime;vBell(null,t,88,.8,.05);vBell(null,t+.09,91,1,.05)},
  coin:()=>sfx('coin')};

// --- canvas FX layer behind the chest scene ---
const fxc=$('fxCv'),fxx=fxc.getContext('2d');
const FX={on:false,parts:[],rings:[],rayA:0,rayTarget:0,rayT:0,rayN:9,rayCol:'#ffb35a',raySpeed:.25,bg:'#3a210c',glow:0,glowCol:'#ffb35a',flash:0,flashCol:'#fff',shake:0,cx:0,cy:0,d:1,last:0};
function fxSize(){FX.d=Math.min(2,window.devicePixelRatio||1);fxc.width=Math.max(1,fxc.clientWidth*FX.d);fxc.height=Math.max(1,fxc.clientHeight*FX.d)}
function fxPoint(el){const a=fxc.getBoundingClientRect(),b=el.getBoundingClientRect();return[(b.left+b.width/2-a.left)*FX.d,(b.top+b.height/2-a.top)*FX.d]}
function hexA(h,a){const n=parseInt(h.slice(1),16);return `rgba(${n>>16},${(n>>8)&255},${n&255},${a})`}
function burst(x,y,n,cols,o){o=o||{};const d=FX.d;if(RM)n=Math.ceil(n/3);
  for(let i=0;i<n;i++){const a=o.up?rand(-Math.PI*.95,-Math.PI*.05):rand(0,TAU),s=rand(o.min||120,o.max||620)*d;
    const k=o.kind||(Math.random()<.55?'spark':Math.random()<.6?'star':'confetti');
    FX.parts.push({k,x:x+rand(-10,10)*d,y:y+rand(-10,10)*d,vx:Math.cos(a)*s,vy:Math.sin(a)*s,g:(o.g==null?700:o.g)*d,drag:o.drag||1.6,life:rand(.6,1.3)*(o.life||1),max:0,col:cols[randi(0,cols.length-1)],r:rand(2,4.5)*d,rot:rand(0,TAU),vr:rand(-12,12)})}
  FX.parts.forEach(p=>{if(!p.max)p.max=p.life})}
function ring(x,y,col,max,w){FX.rings.push({x,y,r:10*FX.d,max:(max||420)*FX.d,col,w:(w||10)*FX.d,a:1})}
// the background of an opening (phase 9): the same gradient until the chest moves or the colour changes, so it is painted once in a canvas
// of its own and copied (an opaque copy instead of a gradient over the whole screen every frame)
const fxBgC=document.createElement('canvas');let fxBgK='';
function fxBg(W,H){const key=[W,H,FX.cx,FX.cy,FX.bg].join('|');if(key!==fxBgK){fxBgK=key;fxBgC.width=W;fxBgC.height=H;const x=fxBgC.getContext('2d');
    const bg=x.createRadialGradient(FX.cx,FX.cy,10,FX.cx,FX.cy,Math.max(W,H)*.75);bg.addColorStop(0,FX.bg);bg.addColorStop(.6,'#132f62');bg.addColorStop(1,'#0b1d42');x.fillStyle=bg;x.fillRect(0,0,W,H)}
  fxx.drawImage(fxBgC,0,0)}
function fxFrame(now){
  if(!FX.on)return;const dt=Math.min(.04,(now-(FX.last||now))/1000);FX.last=now;
  const W=fxc.width,H=fxc.height,c=fxx,d=FX.d;
  FX.rayA+=(FX.rayTarget-FX.rayA)*Math.min(1,dt*4);FX.rayT+=dt*FX.raySpeed;FX.flash=Math.max(0,FX.flash-dt*2.2);FX.shake=Math.max(0,FX.shake-dt*30);
  c.setTransform(1,0,0,1,0,0);c.globalCompositeOperation='source-over';
  fxBg(W,H);
  c.globalCompositeOperation='lighter';
  if(FX.glow>0){const g=c.createRadialGradient(FX.cx,FX.cy,4,FX.cx,FX.cy,280*d);g.addColorStop(0,hexA(FX.glowCol,.55*FX.glow));g.addColorStop(1,hexA(FX.glowCol,0));c.fillStyle=g;c.fillRect(FX.cx-281*d,FX.cy-281*d,562*d,562*d)}
  // the rays: the same fade for all of them, so one path and one fill; the fade ends at 0,6 of the screen's diagonal, the rays stop there
  // (past it they added nothing). The core only in its own square (phase 9: the same picture, a fraction of the work)
  if(FX.rayA>.01){const R=Math.hypot(W,H)*.6+2;const g=c.createRadialGradient(FX.cx,FX.cy,0,FX.cx,FX.cy,R-2);g.addColorStop(0,hexA(FX.rayCol,.5*FX.rayA));g.addColorStop(1,hexA(FX.rayCol,0));c.fillStyle=g;c.beginPath();
    for(let i=0;i<FX.rayN;i++){const a=FX.rayT+i*TAU/FX.rayN,w=TAU/FX.rayN*.42;c.moveTo(FX.cx,FX.cy);c.arc(FX.cx,FX.cy,R,a-w/2,a+w/2);c.closePath()}c.fill();
    const core=c.createRadialGradient(FX.cx,FX.cy,0,FX.cx,FX.cy,160*d);core.addColorStop(0,hexA('#ffffff',.35*FX.rayA));core.addColorStop(1,hexA(FX.rayCol,0));c.fillStyle=core;c.fillRect(FX.cx-161*d,FX.cy-161*d,322*d,322*d)}
  if(FX.plat>0){const py=FX.cy+(FX.size||120)*.42*d,g=c.createRadialGradient(FX.cx,py,2,FX.cx,py,(FX.size||120)*.95*d);g.addColorStop(0,hexA(FX.glowCol,.45*FX.plat));g.addColorStop(1,hexA(FX.glowCol,0));c.save();c.translate(FX.cx,py);c.scale(1,.32);c.translate(-FX.cx,-py);c.fillStyle=g;c.fillRect(FX.cx-300*d,py-300*d,600*d,600*d);c.restore()}
  if(FX.beam>0){FX.beam=Math.max(0,FX.beam-dt*.9);const bw=(70+60*FX.beam)*d,g=c.createLinearGradient(FX.cx-bw,0,FX.cx+bw,0);g.addColorStop(0,hexA(FX.rayCol,0));g.addColorStop(.5,hexA('#ffffff',.75*FX.beam));g.addColorStop(1,hexA(FX.rayCol,0));
    const fade=c.createLinearGradient(0,0,0,FX.cy);c.fillStyle=g;c.globalAlpha=1;c.fillRect(FX.cx-bw,0,bw*2,FX.cy);
    const g2=c.createLinearGradient(FX.cx-bw*.35,0,FX.cx+bw*.35,0);g2.addColorStop(0,hexA('#ffffff',0));g2.addColorStop(.5,hexA('#ffffff',.9*FX.beam));g2.addColorStop(1,hexA('#ffffff',0));c.fillStyle=g2;c.fillRect(FX.cx-bw*.35,0,bw*.7,FX.cy)}
  if(FX.idle&&!RM&&Math.random()<.35){const s=(FX.size||120)*d;burst(FX.cx+rand(-.5,.5)*s,FX.cy+rand(-.2,.4)*s,1,FX.cols||['#ffe9a0'],{up:true,min:20,max:90,g:-80,kind:'star',life:.9,drag:2})}
  for(let i=FX.rings.length-1;i>=0;i--){const r=FX.rings[i];r.r+=(r.max-r.r)*Math.min(1,dt*5);r.a-=dt*1.6;if(r.a<=0){FX.rings.splice(i,1);continue}
    c.strokeStyle=hexA(r.col,r.a);c.lineWidth=r.w*r.a;c.beginPath();c.arc(r.x,r.y,r.r,0,TAU);c.stroke()}
  for(let i=FX.parts.length-1;i>=0;i--){const p=FX.parts[i];p.life-=dt;if(p.life<=0){FX.parts.splice(i,1);continue}
    const dr=Math.exp(-p.drag*dt);p.vx*=dr;p.vy*=dr;p.vy+=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;const a=Math.min(1,p.life/p.max*1.6);
    if(p.k==='spark'){c.strokeStyle=hexA(p.col,a);c.lineWidth=p.r*.8;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x-p.vx*.035,p.y-p.vy*.035);c.stroke()}
    else if(p.k==='star'){c.fillStyle=hexA(p.col,a);const s=p.r*(1.2+Math.sin(p.rot*2)*.5);c.beginPath();c.moveTo(p.x,p.y-s*2);c.lineTo(p.x+s*.45,p.y-s*.45);c.lineTo(p.x+s*2,p.y);c.lineTo(p.x+s*.45,p.y+s*.45);c.lineTo(p.x,p.y+s*2);c.lineTo(p.x-s*.45,p.y+s*.45);c.lineTo(p.x-s*2,p.y);c.lineTo(p.x-s*.45,p.y-s*.45);c.closePath();c.fill()}
    else if(p.k==='dust'){c.globalCompositeOperation='source-over';c.fillStyle=`rgba(200,180,150,${a*.35})`;c.beginPath();c.arc(p.x,p.y,p.r*3,0,TAU);c.fill();c.globalCompositeOperation='lighter'}
    else if(p.k==='coin'){c.globalCompositeOperation='source-over';const w=Math.abs(Math.cos(p.rot))*p.r*2.2+1;c.fillStyle='#ffc93c';c.strokeStyle='#1b1612';c.lineWidth=1.5*d;c.beginPath();c.ellipse(p.x,p.y,w,p.r*2.2,0,0,TAU);c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.7)';c.beginPath();c.ellipse(p.x-w*.3,p.y-p.r*.6,w*.25,p.r*.5,0,0,TAU);c.fill();c.globalCompositeOperation='lighter'}
    else{c.save();c.translate(p.x,p.y);c.rotate(p.rot);c.fillStyle=hexA(p.col,a);c.fillRect(-p.r,-p.r*.5,p.r*2,p.r);c.restore()}}
  if(FX.flash>0){c.globalCompositeOperation='source-over';c.fillStyle=hexA(FX.flashCol,Math.min(1,FX.flash));c.fillRect(0,0,W,H)}
  const sc=$('cscene'),tf=FX.shake>0&&!RM?`translate(${rand(-1,1)*FX.shake}px,${rand(-1,1)*FX.shake}px)`:'';if(FX.tf!==tf){FX.tf=tf;sc.style.transform=tf}
  requestAnimationFrame(fxFrame);
}
let tapRes=null,CHbusy=false,CHgest=false;// CHgest: a pack waits for the finger to tear it (src/js/69-bustine.js)
// a tap during an animation finishes only the current step (landing, charge, opening, one card, summary), never the whole sequence
let CHskip=false,CHwait=[];
const canim=(el,kf,opt)=>anim(el,kf,CHskip?Object.assign({},opt,{duration:1,delay:0}):opt);
const csleep=ms=>CHskip?Promise.resolve():new Promise(r=>{let go;const id=setTimeout(()=>{CHwait=CHwait.filter(f=>f!==go);r()},ms);go=()=>{clearTimeout(id);r()};CHwait.push(go)});
function chestSkip(){if(CHskip)return;CHskip=true;FX.shake=0;
  for(const a of document.getAnimations()){const t=a.effect&&a.effect.target;try{if(t&&$('chestScr').contains(t)&&a.playState==='running'&&isFinite(a.effect.getComputedTiming().iterations))a.finish()}catch(e){}}
  const w=CHwait;CHwait=[];w.forEach(f=>f())}
function waitTap(txt){CHskip=false;$('ctap').textContent=txt;$('ctap').classList.add('show');return new Promise(r=>tapRes=()=>{$('ctap').classList.remove('show');CHskip=false;r()})}
$('chestScr').addEventListener('pointerdown',e=>{if(CHgest||e.target.closest('button'))return;if(tapRes){const r=tapRes;tapRes=null;r()}else if(CHbusy)chestSkip()});
function chestParts(type){const c=CHC[type];
  const body=`<svg viewBox="0 0 80 84" aria-hidden="true"><ellipse cx="40" cy="80" rx="32" ry="4" fill="#000" opacity=".35"/><rect x="10" y="46" width="60" height="32" rx="4" fill="${c.body}" stroke="${I_}" stroke-width="3"/><rect x="13" y="49" width="54" height="6" fill="#fff" opacity=".12"/><path d="M22 46 V78 M58 46 V78" stroke="${c.band}" stroke-width="5"/><path d="M10 62 H70" stroke="${I_}" stroke-opacity=".25" stroke-width="2"/><rect x="34" y="42" width="12" height="14" rx="2" fill="${c.lock}" stroke="${I_}" stroke-width="2.5"/><circle cx="40" cy="48" r="2" fill="${I_}"/></svg>`;
  const lid=`<svg viewBox="0 0 80 84" aria-hidden="true"><path d="M10 46 V36 Q40 18 70 36 V46 Z" fill="${c.dark}" stroke="${I_}" stroke-width="3" stroke-linejoin="round"/><path d="M22 45 V26 M58 45 V26" stroke="${c.band}" stroke-width="5"/><path d="M16 34 Q40 22 64 34" stroke="#fff" stroke-opacity=".25" stroke-width="2" fill="none"/></svg>`;
  const seam=`<svg viewBox="0 0 80 84" aria-hidden="true"><path d="M11 46 H69" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M38 44 L40 50 L42 44" stroke="#fff" stroke-width="2.5" fill="none"/></svg>`;
  return `<div class="cbody">${body}</div><div class="cseam">${seam}</div><div class="clid">${lid}</div><div class="cbadge" id="cbadge"></div>`}
const CARD_BACK=`<svg viewBox="0 0 100 140" aria-hidden="true"><rect x="8" y="8" width="84" height="124" rx="10" fill="none" stroke="#c9a24a" stroke-width="2.5" stroke-dasharray="5 4"/><circle cx="50" cy="70" r="26" fill="#2a1f17" stroke="#c9a24a" stroke-width="3"/><path d="M38 54 Q62 70 38 86" fill="none" stroke="#c9a24a" stroke-width="4" stroke-linecap="round"/><path d="M32 70 H68 M68 70 L61 65 M68 70 L61 75" stroke="#c9a24a" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
async function openChest(type){
  if(CHbusy)return;CHbusy=true;CHskip=false;duckMusic(.3);
  const T=TIER[type],rew=rollChest(type);grant(rew);renderGold();
  const prev={};for(const c of rew.cards){if(c.prev!=null){prev[c.id]=c.prev;continue}const o=SAVE.items[c.id];prev[c.id]=c.isNew?0:o.cards-c.n}
  const scr=$('chestScr'),cw=$('chestWrap');scr.hidden=false;$('cdone').hidden=true;$('csum').innerHTML='';$('csum').hidden=true;$('tray').innerHTML='';$('cardStage').innerHTML='';
  $('ctitle').innerHTML=`<span>${CHESTS[type].n}</span>`;$('ctitle').className='ctitle show';
  cw.innerHTML=chestParts(type);cw.style.width=T.size+'px';cw.className='chestWrap';cw.getAnimations().forEach(a=>a.cancel());
  Object.assign(FX,{beam:0,plat:0,idle:false,cols:T.cols,size:T.size,on:true,parts:[],rings:[],rayA:0,rayTarget:0,rayN:T.rays,rayCol:T.c1,raySpeed:.25,bg:T.bg,glow:0,glowCol:T.c1,flash:0,shake:0,last:0});
  fxSize();requestAnimationFrame(fxFrame);await csleep(30);[FX.cx,FX.cy]=fxPoint(cw);
  const badge=$('cbadge');let left=rew.cards.length;badge.textContent=left;
  // 1. the chest drops in
  SND.whoosh();
  await canim(cw,[{transform:'translateY(-110vh) rotate(-8deg) scale(.8)'},{transform:'translateY(0) rotate(0) scale(1.15,.82)',offset:.78},{transform:'translateY(-6%) scale(.96,1.06)',offset:.9},{transform:'none'}],{duration:RM?200:720,easing:'cubic-bezier(.4,0,.7,1)'});
  SND.thump();FX.shake=8+T.lvl*4;burst(FX.cx,FX.cy+T.size*.35*FX.d,26,['#c8b49a'],{kind:'dust',g:-40,min:60,max:260,drag:3,life:.9});
  ring(FX.cx,FX.cy+T.size*.38*FX.d,'#ffffff',260,6);FX.plat=1;
  FX.glow=.25;cw.classList.add('idle');FX.idle=true;
  await waitTap('Tocca per aprire');
  // 2. charge: one more thump for each tier, light leaking from the seam
  cw.classList.remove('idle');FX.idle=false;const seam=cw.querySelector('.cseam');
  for(let i=0;i<T.charge;i++){const k=(i+1)/T.charge;SND.rattle(i);SND.rise(i);
    seam.style.opacity=.35+.65*k;FX.glow=.3+.5*k;FX.rayTarget=.15*k;FX.shake=3+i*3;
    burst(FX.cx,FX.cy,10+i*10,T.cols,{up:true,min:80,max:260,g:300,kind:'spark'});
    await canim(cw,[{transform:'none'},{transform:`translateX(-${4+i*3}px) rotate(-${3+i*2}deg) scale(${1+.04*k})`,offset:.2},{transform:`translateX(${4+i*3}px) rotate(${3+i*2}deg) scale(${1+.06*k})`,offset:.45},{transform:`translateY(-${6+i*4}px) scale(${1.04+.04*k},${.96})`,offset:.7},{transform:'none'}],{duration:RM?120:420,easing:'ease-in-out',fill:'none'});
    await csleep(RM?40:120)}
  // 3. burst open
  FX.beam=1;SND.burst(T.lvl);vib(T.lvl>=2?[50,30,110]:T.lvl?[40,30,60]:35);FX.flashCol=T.flash;FX.flash=1;FX.shake=14+T.lvl*6;FX.rayTarget=1;FX.raySpeed=.6+T.lvl*.2;FX.glow=1;
  ring(FX.cx,FX.cy,T.c1,420,14);if(T.lvl>=1)setTimeout(()=>ring(FX.cx,FX.cy,'#ffffff',560,8),120);if(T.lvl>=2)setTimeout(()=>ring(FX.cx,FX.cy,T.c1,700,18),260);
  burst(FX.cx,FX.cy,T.burst,T.cols,{up:true,min:250,max:900,g:900});
  if(T.coins)burst(FX.cx,FX.cy,T.coins,['#ffc93c'],{kind:'coin',up:true,min:380,max:950,g:1300,drag:.6,life:1.6});
  seam.style.opacity=0;cw.classList.add('open');
  canim(cw.querySelector('.clid'),[{transform:'none'},{transform:'translateY(-95%) rotate(-38deg) scale(1.08)',offset:.3},{transform:'translateY(-62%) rotate(-30deg) scale(1.02)',offset:.6},{transform:'translateY(-34%) rotate(-16deg) scaleY(.78)'}],{duration:RM?150:650,easing:'cubic-bezier(.2,1.4,.4,1)'});
  await canim(cw,[{transform:'scale(1.25,.8)'},{transform:'scale(.92,1.12)',offset:.4},{transform:'none'}],{duration:RM?150:500,easing:'ease-out'});
  await csleep(RM?100:350);
  // 4. chest moves down, cards come out one by one
  FX.rayTarget=.45;FX.raySpeed=.25;
  await canim(cw,[{transform:'none'},{transform:'translateY(min(30vh,230px)) scale(.62)'}],{duration:RM?150:520,easing:'cubic-bezier(.5,0,.3,1)'});
  [FX.cx,FX.cy]=fxPoint(cw);
  for(let i=0;i<rew.cards.length;i++){left--;badge.textContent=left||'';if(!left)badge.classList.add('gone');else badge.animate([{transform:'scale(1.5)'},{transform:'none'}],{duration:250});await revealCard(rew.cards[i],prev[rew.cards[i].id],T,cw)}
  // 5. summary
  await summary(rew,T,cw);
  CHbusy=false;
}
async function revealCard(c,prevCards,T,cw){CHskip=false;
  const ci=CI(c.id,c),it=ci,r=RAR[it.rar],o=ci.o,need=ci.need,stage=$('cardStage');
  const el=document.createElement('div');el.className='fcard';el.style.cssText=`--rc:${r.c};--rc2:${r.d}`;
  el.innerHTML=`<div class="fbob"><div class="fin"><div class="fface fback">${CARD_BACK}</div><div class="fface ffront">
    ${c.isNew?'<em class="newb">Nuovo!</em>':''}<div class="fart">${ci.svg}</div><b>${it.n}</b><span class="rn">${r.n}</span>
    <strong class="cnt">×0</strong><small>${ci.sub}</small>
    <div class="bar"><i></i><span></span></div><div class="readyb">${ci.ready}</div></div></div></div>`;
  stage.appendChild(el);
  const fin=el.querySelector('.fin'),eb=el.getBoundingClientRect(),cb=cw.getBoundingClientRect();
  const dx=cb.left+cb.width/2-(eb.left+eb.width/2),dy=cb.top+cb.height*.35-(eb.top+eb.height/2);
  const [ex,ey]=fxPoint(el);
  // fly out of the chest
  SND.whoosh();burst(FX.cx,FX.cy-20*FX.d,24,T.cols,{up:true,min:150,max:450,g:500,kind:'spark'});
  canim(cw,[{transform:'translateY(min(30vh,230px)) scale(.62)'},{transform:'translateY(min(30vh,230px)) scale(.7,.55)',offset:.3},{transform:'translateY(min(30vh,230px)) scale(.62)'}],{duration:300});
  await canim(el,[{transform:`translate(${dx}px,${dy}px) scale(.12) rotate(-30deg)`,opacity:0},{transform:`translate(${dx*.3}px,${-40}px) scale(.85) rotate(8deg)`,opacity:1,offset:.6},{transform:'translate(0,6px) scale(1.04) rotate(-2deg)',offset:.85},{transform:'none',opacity:1}],{duration:RM?150:640,easing:'cubic-bezier(.3,.7,.4,1)'});
  el.classList.add('float');
  // suspense: rarer cards glow and tremble before turning
  if(it.rar>=2){el.classList.add('charged');FX.rayCol=r.c;FX.glowCol=r.c;SND.rise(it.rar-1);
    const steps=it.rar-1;for(let k=0;k<steps;k++){FX.rayTarget=.5+.25*k;FX.shake=2+k*2;burst(ex,ey,12+k*10,[r.c,'#ffffff'],{min:60,max:220,g:0,kind:'star',life:.7});
      await canim(fin,[{transform:'none'},{transform:`rotate(-${2+k*2}deg) scale(${1.02+k*.02})`,offset:.25},{transform:`rotate(${2+k*2}deg) scale(${1.03+k*.02})`,offset:.75},{transform:'none'}],{duration:RM?80:300+k*60,fill:'none'})}}
  // flip
  SND.flip(it.rar);
  canim(el,[{transform:'none'},{transform:'scale(1.12)',offset:.5},{transform:'none'}],{duration:RM?100:480,easing:'ease-out',fill:'none'});
  await canim(fin,[{transform:'rotateY(0deg)'},{transform:'rotateY(180deg)'}],{duration:RM?120:480,easing:'cubic-bezier(.5,0,.3,1.3)'});
  el.classList.add('shown');
  FX.rayCol=r.c;FX.glowCol=r.c;FX.rayTarget=it.rar>=3?1:it.rar>=1?.65:.4;
  burst(ex,ey,[30,50,80,140,220][it.rar],[r.c,'#ffffff',r.c],{min:200,max:700+it.rar*120,g:400});
  ring(ex,ey,r.c,300+it.rar*80,8+it.rar*2);
  if(it.rar>=3){vib(it.rar===4?[60,40,60,40,180]:[40,30,80]);FX.flashCol=r.c;FX.flash=.75;FX.shake=10+(it.rar-3)*8;ring(ex,ey,'#ffffff',520,6);slam(it.rar===4?'LEGGENDARIO!':'EPICO!',r.c)}
  else if(it.rar===2)slam('RARO!',r.c);
  if(c.isNew){const nb=el.querySelector('.newb');nb.animate([{transform:'translateX(-50%) scale(0) rotate(-30deg)'},{transform:'translateX(-50%) scale(1.3) rotate(-4deg)',offset:.6},{transform:'translateX(-50%) scale(1) rotate(-4deg)'}],{duration:450,easing:'ease-out',fill:'forwards',delay:150})}
  // count up and fill the card bar
  const cnt=el.querySelector('.cnt'),steps=Math.min(c.n,24),dur=RM?100:Math.min(700,220+c.n*40);
  for(let k=1;k<=steps;k++){const v=Math.round(c.n*k/steps);cnt.textContent='×'+v;if(k%2||k===steps)SND.tick();await csleep(dur/steps)}
  cnt.animate([{transform:'scale(1.6)'},{transform:'scale(1)'}],{duration:260,easing:'ease-out'});
  const bar=el.querySelector('.bar'),bi=bar.querySelector('i'),bs=bar.querySelector('span');
  if(ci.max){bi.style.width='100%';bs.textContent='MAX';bar.classList.add('full')}
  else{const p0=Math.min(1,Math.max(0,prevCards)/need),p1=Math.min(1,o.cards/need);bs.textContent=`${o.cards}/${need}`;
    await canim(bi,[{width:p0*100+'%'},{width:p1*100+'%'}],{duration:RM?100:600,easing:'cubic-bezier(.3,0,.2,1)'});
    if(o.cards>=need){bar.classList.add('full');const rb=el.querySelector('.readyb');rb.classList.add('on');SND.ready();rb.animate([{transform:'scale(0)'},{transform:'scale(1.2)',offset:.6},{transform:'scale(1)'}],{duration:380,easing:'ease-out'});burst(ex,ey+90*FX.d,20,['#a6e36e','#ffffff'],{up:true,min:100,max:300,g:300,kind:'star'})}}
  await waitTap('Tocca per continuare');
  // exit: the card spins away into the tray at the bottom
  el.classList.remove('float');const tray=$('tray'),slot=document.createElement('div');slot.className='tslot';slot.style.cssText=`--rc:${r.c};--rc2:${r.d}`;slot.innerHTML=ci.svg+`<b>×${c.n}</b>`;slot.style.visibility='hidden';tray.appendChild(slot);
  const sb=slot.getBoundingClientRect(),eb2=el.getBoundingClientRect(),tx=sb.left+sb.width/2-(eb2.left+eb2.width/2),ty=sb.top+sb.height/2-(eb2.top+eb2.height/2);
  SND.whoosh();FX.rayTarget=.35;FX.rayCol=T.c1;FX.glowCol=T.c1;
  await canim(el,[{transform:'none',opacity:1},{transform:`translate(${tx*.2}px,-30px) scale(1.06) rotate(-6deg)`,offset:.25},{transform:`translate(${tx}px,${ty}px) scale(.16) rotate(${tx>0?200:-200}deg)`,opacity:.9}],{duration:RM?120:520,easing:'cubic-bezier(.5,0,.6,1)'});
  el.remove();slot.style.visibility='';slot.animate([{transform:'scale(0)'},{transform:'scale(1.35)',offset:.6},{transform:'scale(1)'}],{duration:320,easing:'ease-out'});
  const [sx,sy]=fxPoint(slot);burst(sx,sy,14,[r.c,'#ffffff'],{min:60,max:200,g:200,kind:'star',life:.6});
}
function slam(txt,col){const s=document.createElement('div');s.className='slam';s.textContent=txt;s.style.color=col;$('cscene').appendChild(s);
  s.animate([{transform:'translate(-50%,-50%) scale(3) rotate(-8deg)',opacity:0},{transform:'translate(-50%,-50%) scale(.9) rotate(-4deg)',opacity:1,offset:.35},{transform:'translate(-50%,-50%) scale(1) rotate(-4deg)',opacity:1,offset:.75},{transform:'translate(-50%,-80%) scale(1.05) rotate(-4deg)',opacity:0}],{duration:1500,easing:'ease-out'}).finished.then(()=>s.remove())}
async function summary(rew,T,cw){CHskip=false;
  $('ctitle').innerHTML='<span>Hai ottenuto</span>';FX.rayTarget=.6;FX.rayCol=T.c1;FX.glowCol=T.c1;
  const sum=$('csum');sum.hidden=false;
  sum.innerHTML=rew.cards.map(c=>{const ci=CI(c.id,c),r=RAR[ci.rar];return `<div class="sumc" style="--rc:${r.c};--rc2:${r.d}">${c.isNew?'<em class="nb">Nuovo</em>':''}${ci.svg}<b>×${c.n}</b></div>`}).join('')+`<div class="sumc gold"><svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="14" fill="#ffc93c" stroke="#1b1612" stroke-width="3"/><circle cx="20" cy="20" r="4" fill="#fff" opacity=".6"/></svg><b id="sumGold">+0</b></div>`;
  $('tray').animate([{opacity:1},{opacity:0}],{duration:250,fill:'forwards'});
  const items=[...sum.children];
  items.forEach((n,i)=>n.animate([{transform:'translateY(40px) scale(.3) rotate(-10deg)',opacity:0},{transform:'translateY(-6px) scale(1.1)',opacity:1,offset:.7},{transform:'none',opacity:1}],{duration:420,delay:i*110,easing:'ease-out',fill:'backwards'}));
  await csleep(items.length*110+200);
  const gEl=$('sumGold'),[gx,gy]=fxPoint(gEl);
  burst(FX.cx,FX.cy,Math.min(40,rew.gold/4),['#ffc93c'],{kind:'coin',up:true,min:300,max:700,g:1100,drag:.7,life:1.2});
  const steps=20;for(let k=1;k<=steps;k++){gEl.textContent='+'+Math.round(rew.gold*k/steps);if(k%2)SND.coin();await csleep(RM?5:35)}
  gEl.parentElement.animate([{transform:'scale(1.3)'},{transform:'none'}],{duration:300,easing:'ease-out'});burst(gx,gy,18,['#ffd84a','#ffffff'],{kind:'star',min:80,max:240,g:0,life:.6});
  const b=$('cdone');b.hidden=false;b.animate([{transform:'scale(0)'},{transform:'scale(1.1)',offset:.7},{transform:'none'}],{duration:350,easing:'ease-out'});
}
$('cdone').onclick=async()=>{duckMusic(1);const scr=$('chestScr');await canim(scr,[{opacity:1},{opacity:0}],{duration:250});scr.hidden=true;scr.getAnimations().forEach(a=>a.cancel());FX.on=false;fxBgC.width=fxBgC.height=0;fxBgK='';$('tray').getAnimations().forEach(a=>a.cancel());renderHero();renderPlay();renderShop()};
addEventListener('resize',()=>{if(FX.on)fxSize()});

const hcv=$('heroCv'),hctx=hcv.getContext('2d');let pvT=0;
function showMenu(){playMusic('menu');duckMusic(1);$('menu').hidden=false;$('endScr').hidden=true;$('pauseScr').hidden=true;$('wrap').classList.add('inmenu');started=false;paused=true;renderGold();renderWho();setTab('tabPlay');if(SAVE.arenaUp!=null){const ai=SAVE.arenaUp;SAVE.arenaUp=null;save();setTimeout(()=>showArenaUp(ai),450)}else if(loginReady()&&(SAVE.runs||0)>=1&&showMenu.lg!==today()){showMenu.lg=today();setTimeout(()=>{if(!$('menu').hidden&&$('sheetScr').hidden&&$('chestScr').hidden)openSheet('login')},700)}}
function startRun(){if(!modeOpen(SAVE.sel||'c1')){toast('Modalità ancora bloccata');return}initAudio();duckMusic(1);$('menu').hidden=true;$('endScr').hidden=true;$('sheetScr').hidden=true;$('itemScr').hidden=true;SHEET=null;$('wrap').classList.remove('inmenu');started=true;paused=false;newRun()}
$('playBtn').onclick=startRun;
setInterval(()=>{if($('menu').hidden)return;if(!$('tabPlay').hidden)renderPlay();renderBadges();if(!$('tabShop').hidden&&!$('spDaily').hidden){const t=new Date(),mid=new Date(t.getFullYear(),t.getMonth(),t.getDate()+1);$('dealT').innerHTML=`Si aggiorna tra <b>${fmtH(mid-t)}</b>`}},500);

