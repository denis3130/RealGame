// ---------- UI ----------
const bannerEl=$('banner');
function banner(t,sub,dur){bannerEl.innerHTML='';if(sub){const s=document.createElement('small');s.textContent=sub;bannerEl.appendChild(s)}bannerEl.appendChild(document.createTextNode(t));bannerEl.classList.add('show');G.bannerT=dur||1.8}
function setPause(v){if(!started||INTRO.on)return;paused=v;$('pauseScr').hidden=!v;
  if(v)$('ownSkills').innerHTML=Object.entries(P.skills).map(([id,n])=>{const k=SK.find(s=>s.id===id);return `<span class="osk ${k.evo?'evo':''}"><svg viewBox="0 0 40 40" aria-hidden="true">${ICON[id]||''}</svg>${n>1?`<b>${n}</b>`:''}${k.n}</span>`}).join('')||'<span class="none">Ancora nessuna abilità: sali di livello per sceglierne una.</span>'}
$('pauseBtn').onclick=()=>{if(started&&!modal)setPause(!paused)};
$('resumeBtn').onclick=()=>setPause(false);
$('optMusic').onclick=()=>{initAudio();AU.on.music=!AU.on.music;audioSettings()};$('optSfx').onclick=()=>{initAudio();AU.on.sfx=!AU.on.sfx;audioSettings();sfx('ui')};
$('quitBtn').onclick=()=>{$('pauseScr').hidden=true;endRun(false,true)};
$('sndBtn').onclick=()=>{initAudio();AU.on.music=!AU.on.music;audioSettings()};
document.addEventListener('pointerdown',()=>initAudio(),true);// capture: unlock audio on the very first tap, even on overlays that stop the event
$('againBtn').onclick=()=>startRun();$('menuBtn').onclick=()=>showMenu();
document.addEventListener('visibilitychange',()=>{if(document.hidden&&started&&!paused&&!modal)setPause(true)});
let offer=[];
let skMode='level',altarLeft=0;
function openSkills(mode,quiet){
  mode=mode||'level';skMode=mode;modal=true;paused=true;if(!quiet)sfx('pick');
  const avail=SK.filter(s=>(P.skills[s.id]||0)<s.max&&(!s.cond||s.cond()));
  if(mode==='shop'){if(!G.shopOffer)G.shopOffer=shuffle(avail.filter(s=>!s.evo)).slice(0,3).map(s=>({s,price:12+G.room*3+(s.max===1?5:0)}));offer=G.shopOffer.map(o=>o.s)}
  else{offer=shuffle(avail.filter(s=>!s.evo)).slice(0,3);const ev=avail.filter(s=>s.evo);if(ev.length)offer[0]=ev[0]}
  if(mode==='altar'&&altarLeft===0)altarLeft=2;
  const T={level:['Livello '+P.lvl,"Scegli un'abilità"],treasure:['Tesoro',"Scegli un'abilità"],shop:['Mercante · hai '+G.gold+' oro',"Compra con l'oro della partita"],
    altar:['Altare maledetto',altarLeft===2?'Scegli la prima abilità':'Scegli la seconda abilità']}[mode];
  $('skTag').textContent=T[0];$('skTitle').textContent=T[1];
  const note=mode==='altar'?(altarLeft===2?`<b>Maledizione:</b> ${G.curse.n}. ${G.curse.d}.`:'Il patto è stretto.'):mode==='shop'?"Ogni acquisto riduce l'oro che porti a casa.":'';
  $('skNote').innerHTML=note;$('skNote').hidden=!note;
  $('skList').innerHTML=offer.map((s,i)=>{const lv=(P.skills[s.id]||0)+1,o=mode==='shop'?G.shopOffer[i]:null,sold=o&&G.shopSold[s.id],dis=o&&(sold||G.gold<o.price);
    const rr=s.evo?3:SKR[s.id]||0;
    return `<button class="sk${s.evo?' evo':' r'+rr}" data-i="${i}" ${dis?'disabled':''}>${s.evo?'':`<em class="rar">${['Comune','Raro','Epico'][rr]}</em>`}<svg viewBox="0 0 40 40">${ICON[s.id]}</svg><div>${s.evo?'<em class="evotag">EVOLUZIONE</em>':''}<b>${s.n}</b><span>${s.d}</span>${!s.evo&&(EVO_OF[s.id]||[]).some(v=>!P.skills[v.id]&&v.req.every(r=>r===s.id||P.skills[r]))?'<em class="evoh">Sblocca un\'evoluzione!</em>':''}${s.max>1&&s.max<99?`<em>Livello ${lv} di ${s.max}</em>`:''}${o?`<em class="price">${sold?'Venduto':o.price+' oro'}</em>`:''}</div></button>`}).join('');
  $('skList').querySelectorAll('.sk').forEach(b=>b.onclick=()=>pick(+b.dataset.i));
  const rc=rerollCost();
  $('skFoot').innerHTML=mode==='shop'?'<button class="btn alt" id="skClose">Continua</button>':mode==='altar'&&altarLeft===2?'<button class="btn alt" id="skClose">Rifiuta il patto</button>'
    :`<button class="reroll" id="skRe" ${rc&&(SAVE.gems||0)<rc?'disabled':''}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.6-5.9M20 4v5h-5" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>Cambia<small>${rc?`<i class="gemS"></i>${rc}`:'gratis'}</small></button>`;
  if($('skRe'))$('skRe').onclick=()=>{const c=rerollCost();if(c&&(SAVE.gems||0)<c)return;if(c){SAVE.gems-=c;save()}G.rerolls=(G.rerolls||0)+1;sfx('shimmer',1);openSkills(skMode,true)};
  if($('skClose'))$('skClose').onclick=closeSkills;
  $('skScr').hidden=false;
}
// skill rarity, like the coloured cards of Archero 2
const SKR={front:1,diag:1,side:1,rear:1,pierce:1,orbit:1,poison:1,wallb:1,shield:1,multi:2,ric:2,fire:2,ice:2,light:2,giant:2,vamp:2};
const rerollCost=()=>!G.rerolls?0:Math.min(30,5*G.rerolls);
// --- revive for gems (once per run)
const REV_COST=25;let rvT=null;
function canRevive(){return !G.revived&&G.mode&&!G.ended}
function openRevive(){modal=true;paused=true;G.state='dead';const yes=$('rvYes'),ok=(SAVE.gems||0)>=REV_COST;
  yes.innerHTML=`Rinasci <i class="gemS"></i>${REV_COST}`;yes.disabled=!ok;$('revScr').hidden=false;sfx('death','hero',P.x);
  let t=5;const arc=$('rvArc'),t0=performance.now();clearInterval(rvT);
  rvT=setInterval(()=>{const e=(performance.now()-t0)/1000,left=Math.max(0,5-e);$('rvNum').textContent=Math.ceil(left);arc.style.strokeDashoffset=276.5*(1-left/5);
    if(Math.ceil(left)!==t){t=Math.ceil(left);if(t>0)sfx('click')}if(left<=0)reviveNo()},50)}
function reviveNo(){clearInterval(rvT);$('revScr').hidden=true;modal=false;endRun(false)}
$('rvNo').onclick=reviveNo;
$('rvYes').onclick=()=>{if((SAVE.gems||0)<REV_COST)return;clearInterval(rvT);SAVE.gems-=REV_COST;save();G.revived=true;$('revScr').hidden=true;modal=false;paused=false;
  G.state=G.enemies.length?'play':'cleared';G.deathT=null;duckMusic(1);P.hp=P.maxhp;P.inv=3;G.eproj=[];shake(8);sfx('rise');sfx('pick');
  vfxBlast(P.x,P.y-10,'255,230,140',160,{sparks:24,spcol:['#fff1a8','#ffd84a','#ffffff'],dust:10});fxPush({k:'flash',x:P.x,y:P.y-10,r:200,rgb:'255,240,190',t:.35,max:.35});
  for(const e of G.enemies)if(!isBoss(e.type)){const a=Math.atan2(e.y-P.y,e.x-P.x);moveCircle(e,Math.cos(a)*60,Math.sin(a)*60)}banner('Rinascita!','',1.4)};
// --- lucky wheel after a boss: gold rim, chasing lights, pegs that flick the pointer, a jackpot slice
const randSkill=(epic)=>{const av=SK.filter(s=>!s.evo&&(P.skills[s.id]||0)<s.max&&(!s.cond||s.cond()));const ep=av.filter(s=>SKR[s.id]===2);const s=pk(epic&&ep.length?ep:av);if(!s)return null;s.f();P.skills[s.id]=(P.skills[s.id]||0)+1;return s};
const WHEEL=[
  {n:'Abilità',ic:'skill',c:['#c98af7','#7a2fc0'],w:1,f:()=>{const s=randSkill();return s?s.n:'Abilità'}},
  {n:'Cura',ic:'heart',c:['#ff8a7a','#c22c2c'],w:1,f:()=>{P.hp=P.maxhp;return'Salute piena'}},
  {n:'Oro',ic:'coin',c:['#ffe27a','#d98a00'],w:1,f:()=>{const g=25+G.room*5;G.gold+=g;return'+'+g+' oro'}},
  {n:'Velocità',ic:'bolt',c:['#9ff0ff','#1f8fb8'],w:1,f:()=>{P.aspd*=1.15;return"Velocità d'attacco +15%"}},
  {n:'JACKPOT',ic:'crown',c:['#fff2a8','#e0a000'],w:.45,jack:1,f:()=>{const s=randSkill(true);G.gemsRun=(G.gemsRun||0)+4;G.gold+=80;return(s?s.n+' + ':'')+'4 cristalli + 80 oro'}},
  {n:'Cristalli',ic:'gem',c:['#8fe6ff','#2a6fd8'],w:1,f:()=>{G.gemsRun=(G.gemsRun||0)+2;return'+2 cristalli'}},
  {n:'Attacco',ic:'sword',c:['#ff9d6b','#c0401c'],w:1,f:()=>{P.atk*=1.15;return'Attacco +15%'}},
  {n:'Vigore',ic:'heartp',c:['#9df07a','#2f8f1c'],w:1,f:()=>{const a=Math.round(P.maxhp*.15);P.maxhp+=a;P.hp+=a;return'Salute massima +15%'}}];
const WH={a:0,spin:false,win:-1,winT:0,flap:0,raf:0,parts:[],t0:0,lastPeg:0,speed:0};
function whIcon(x,k,s){x.save();x.scale(s,s);x.lineWidth=3.2;x.strokeStyle='#1b1612';x.lineJoin='round';
  const P=(pts)=>{x.beginPath();pts.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.closePath()};
  if(k==='heart'||k==='heartp'){x.beginPath();x.moveTo(0,14);x.bezierCurveTo(-18,2,-16,-14,-6,-14);x.bezierCurveTo(-2,-14,0,-11,0,-8);x.bezierCurveTo(0,-11,2,-14,6,-14);x.bezierCurveTo(16,-14,18,2,0,14);x.fillStyle='#e5484d';x.fill();x.stroke();x.fillStyle='rgba(255,255,255,.55)';x.beginPath();x.ellipse(-7,-7,3.5,2.2,-.6,0,TAU);x.fill();
    if(k==='heartp'){x.fillStyle='#fff';x.fillRect(-1.8,-7,3.6,13);x.fillRect(-6.5,-2.3,13,3.6)}}
  else if(k==='coin'&&icoOk(ICO.coin)){for(const[cx,cy] of [[-7,6],[7,6],[0,-5]])x.drawImage(ICO.coin,cx-12,cy-12,24,24)}
  else if(k==='coin'){for(const[cx,cy] of [[-6,6],[6,6],[0,-4]]){x.beginPath();x.ellipse(cx,cy,9,9,0,0,TAU);x.fillStyle='#ffc93c';x.fill();x.stroke();x.beginPath();x.ellipse(cx,cy,5,5,0,0,TAU);x.strokeStyle='#b07a10';x.lineWidth=2;x.stroke();x.strokeStyle='#1b1612';x.lineWidth=3.2}}
  else if(k==='gem'&&icoOk(ICO.gem)){x.drawImage(ICO.gem,-19,-20,38,38)}
  else if(k==='gem'){P([[0,-15],[13,-4],[0,15],[-13,-4]]);const g=x.createLinearGradient(-13,-15,13,15);g.addColorStop(0,'#e9fdff');g.addColorStop(.45,'#5fd0f0');g.addColorStop(1,'#5a46c8');x.fillStyle=g;x.fill();x.stroke();x.beginPath();x.moveTo(-13,-4);x.lineTo(13,-4);x.moveTo(0,-15);x.lineTo(-5,-4);x.lineTo(0,15);x.lineTo(5,-4);x.closePath();x.lineWidth=1.6;x.stroke()}
  else if(k==='sword'){x.rotate(-.78);P([[-3,-18],[0,-22],[3,-18],[3,6],[-3,6]]);x.fillStyle='#dfe4ea';x.fill();x.stroke();x.fillStyle='#ffc93c';x.fillRect(-9,6,18,4);x.strokeRect(-9,6,18,4);x.fillStyle='#6b4a2a';x.fillRect(-2.5,10,5,9);x.strokeRect(-2.5,10,5,9)}
  else if(k==='bolt'){P([[4,-18],[-10,3],[-1,3],[-5,18],[11,-4],[2,-4]]);x.fillStyle='#ffd84a';x.fill();x.stroke()}
  else if(k==='skill'){x.rotate(.12);x.beginPath();x.roundRect?x.roundRect(-11,-15,22,30,4):x.rect(-11,-15,22,30);x.fillStyle='#f6ead2';x.fill();x.stroke();P([[0,-9],[2.6,-2.8],[9,-2.4],[4,1.8],[5.6,8.4],[0,4.8],[-5.6,8.4],[-4,1.8],[-9,-2.4],[-2.6,-2.8]]);x.fillStyle='#b05ef0';x.fill();x.lineWidth=2;x.stroke()}
  else if(k==='crown'){P([[-16,8],[-16,-8],[-8,0],[0,-14],[8,0],[16,-8],[16,8]]);const g=x.createLinearGradient(0,-14,0,8);g.addColorStop(0,'#fff6b0');g.addColorStop(1,'#f2a400');x.fillStyle=g;x.fill();x.stroke();x.fillStyle='#e5484d';x.beginPath();x.arc(0,1,3,0,TAU);x.fill();x.stroke();x.fillStyle='#5fd0f0';for(const c of[-9,9]){x.beginPath();x.arc(c,3,2.4,0,TAU);x.fill();x.stroke()}}
  x.restore()}
function whSeg(i){const n=WHEEL.length;return[i/n*TAU-Math.PI/2-Math.PI/n,i/n*TAU-Math.PI/2+Math.PI/n]}
function drawWheel(now){const c=$('whCv'),x=c.getContext('2d'),W=c.width,H=c.height,cx=W/2,cy=H/2+22,R=222,n=WHEEL.length,t=now/1000;
  x.clearRect(0,0,W,H);
  // sunburst behind
  x.save();x.translate(cx,cy);x.rotate(t*.25);const rg=x.createRadialGradient(0,0,R*.5,0,0,R*1.45);rg.addColorStop(0,'rgba(255,220,120,.45)');rg.addColorStop(1,'rgba(255,220,120,0)');x.fillStyle=rg;
  for(let i=0;i<14;i++){x.beginPath();x.moveTo(0,0);x.arc(0,0,R*1.5,i/14*TAU,i/14*TAU+TAU/28);x.closePath();x.fill()}x.restore();
  // drop shadow + outer gold rim
  x.save();x.translate(cx,cy);x.fillStyle='rgba(0,0,0,.45)';x.beginPath();x.arc(4,10,R+30,0,TAU);x.fill();
  let g=x.createLinearGradient(0,-R-30,0,R+30);g.addColorStop(0,'#fff3b0');g.addColorStop(.35,'#f2b81e');g.addColorStop(.7,'#b06a00');g.addColorStop(1,'#ffd75a');x.fillStyle=g;x.beginPath();x.arc(0,0,R+28,0,TAU);x.fill();x.lineWidth=6;x.strokeStyle='#0b1326';x.stroke();
  x.fillStyle='#3a1f0a';x.beginPath();x.arc(0,0,R+8,0,TAU);x.fill();x.stroke();
  // chasing bulbs
  const NB=24,chase=WH.spin?t*22:t*5,allOn=WH.win>=0&&Math.floor(t*8)%2;for(let i=0;i<NB;i++){const a=i/NB*TAU,on=allOn||(Math.floor(chase)+i)%3===0,bx=Math.cos(a)*(R+18),by=Math.sin(a)*(R+18);
    if(on){const bg=x.createRadialGradient(bx,by,0,bx,by,14);bg.addColorStop(0,'rgba(255,250,200,.95)');bg.addColorStop(1,'rgba(255,220,80,0)');x.fillStyle=bg;x.beginPath();x.arc(bx,by,14,0,TAU);x.fill()}
    x.fillStyle=on?'#fffbe0':'#8a5a10';x.beginPath();x.arc(bx,by,5.5,0,TAU);x.fill();x.lineWidth=2;x.strokeStyle='#0b1326';x.stroke()}
  // the wheel face
  x.rotate(WH.a);
  WHEEL.forEach((w,i)=>{const[a0,a1]=whSeg(i),am=(a0+a1)/2;x.beginPath();x.moveTo(0,0);x.arc(0,0,R,a0,a1);x.closePath();
    const sg=x.createRadialGradient(0,0,R*.15,0,0,R);sg.addColorStop(0,w.c[0]);sg.addColorStop(1,w.c[1]);x.fillStyle=sg;x.fill();
    if(w.jack){x.save();x.clip();x.globalCompositeOperation='lighter';for(let k=0;k<5;k++){const ra=am+Math.sin(t*2+k)*.18;x.strokeStyle=`rgba(255,255,255,${.12+.08*Math.sin(t*3+k)})`;x.lineWidth=10;x.beginPath();x.moveTo(0,0);x.lineTo(Math.cos(ra)*R,Math.sin(ra)*R);x.stroke()}x.restore()}
    if(WH.win>=0&&i!==WH.win){x.fillStyle='rgba(10,8,20,.5)';x.fill()}
    if(i===WH.win){x.save();x.clip();x.fillStyle=`rgba(255,255,255,${.18+.18*Math.sin(t*10)})`;x.fillRect(-R,-R,2*R,2*R);x.restore()}
    // inner bevel line
    x.save();x.beginPath();x.arc(0,0,R-7,a0+.02,a1-.02);x.strokeStyle='rgba(255,255,255,.28)';x.lineWidth=4;x.stroke();x.restore();
    x.save();x.rotate(am);x.translate(R*.55,0);x.rotate(Math.PI/2);whIcon(x,w.ic,w.jack?1.75:1.55);x.restore();
    x.save();x.rotate(am);x.translate(R*.84,0);x.rotate(Math.PI/2);x.font=`${w.jack?24:22}px ${getComputedStyle(document.body).getPropertyValue('--display')||'sans-serif'}`;x.textAlign='center';x.textBaseline='middle';x.lineJoin='round';x.lineWidth=7;x.strokeStyle='#0b1326';x.strokeText(w.n,0,0);x.fillStyle=w.jack?'#fff6b0':'#fff';x.fillText(w.n,0,0);x.restore()});
  // gold dividers and pegs
  for(let i=0;i<n;i++){const a=whSeg(i)[0];x.strokeStyle='#0b1326';x.lineWidth=8;x.beginPath();x.moveTo(0,0);x.lineTo(Math.cos(a)*R,Math.sin(a)*R);x.stroke();x.strokeStyle='#ffd75a';x.lineWidth=3.5;x.stroke();
    const px=Math.cos(a)*(R-6),py=Math.sin(a)*(R-6);x.fillStyle='#fff3b0';x.beginPath();x.arc(px,py,7,0,TAU);x.fill();x.lineWidth=3;x.strokeStyle='#0b1326';x.stroke()}
  x.beginPath();x.arc(0,0,R,0,TAU);x.lineWidth=6;x.strokeStyle='#0b1326';x.stroke();
  x.rotate(-WH.a);
  // hub
  g=x.createRadialGradient(-12,-14,4,0,0,52);g.addColorStop(0,'#fff6c8');g.addColorStop(.5,'#f2b81e');g.addColorStop(1,'#8a4a00');x.fillStyle=g;x.beginPath();x.arc(0,0,50,0,TAU);x.fill();x.lineWidth=6;x.strokeStyle='#0b1326';x.stroke();
  x.fillStyle='#2f8f1c';x.beginPath();x.arc(0,0,32,0,TAU);x.fill();x.lineWidth=4;x.stroke();
  x.save();x.rotate(-.5);x.fillStyle='#9df07a';x.beginPath();x.moveTo(-18,10);x.quadraticCurveTo(-14,-18,18,-12);x.quadraticCurveTo(10,16,-18,10);x.fill();x.lineWidth=3;x.stroke();x.strokeStyle='#2f8f1c';x.lineWidth=2.5;x.beginPath();x.moveTo(-14,8);x.lineTo(12,-9);x.stroke();x.restore();
  x.fillStyle='rgba(255,255,255,.35)';x.beginPath();x.ellipse(-16,-22,14,6,-.5,0,TAU);x.fill();
  x.restore();
  // pointer, flicked by the pegs
  x.save();x.translate(cx,cy-R-30);x.rotate(-WH.flap*.5);x.fillStyle='rgba(0,0,0,.4)';x.beginPath();x.moveTo(-22,-8);x.lineTo(26,-8);x.lineTo(4,52);x.closePath();x.fill();
  g=x.createLinearGradient(-24,0,24,0);g.addColorStop(0,'#ff6a5a');g.addColorStop(.5,'#e5484d');g.addColorStop(1,'#8a1f1c');x.fillStyle=g;x.beginPath();x.moveTo(-24,-14);x.quadraticCurveTo(0,-30,24,-14);x.lineTo(0,46);x.closePath();x.fill();x.lineWidth=6;x.strokeStyle='#0b1326';x.lineJoin='round';x.stroke();
  x.fillStyle='#ffd75a';x.beginPath();x.arc(0,-10,11,0,TAU);x.fill();x.lineWidth=4;x.stroke();x.fillStyle='#5fd0f0';x.beginPath();x.arc(0,-10,5,0,TAU);x.fill();x.restore();
  // particles
  for(let i=WH.parts.length-1;i>=0;i--){const p=WH.parts[i];p.t-=1/60;if(p.t<=0){WH.parts.splice(i,1);continue}p.vy+=p.g/60;p.x+=p.vx/60;p.y+=p.vy/60;p.r+=p.vr/60;
    x.save();x.globalAlpha=Math.min(1,p.t*2);x.translate(p.x,p.y);x.rotate(p.r);x.fillStyle=p.c;if(p.star){x.beginPath();for(let k=0;k<10;k++){const rr=k%2?3:8,a=k/10*TAU;x.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}x.fill()}else x.fillRect(-5,-3,10,6);x.restore()}
  WH.flap*=.82}
function whLoop(now){if($('whScr').hidden){WH.raf=0;return}drawWheel(now);WH.raf=requestAnimationFrame(whLoop)}
function whBurst(jack){const c=$('whCv'),cx=c.width/2,cy=c.height/2+22,cols=jack?['#fff6b0','#ffd84a','#ffffff','#ff8a3c']:['#ffd84a','#ff6a8a','#5fd0f0','#9df07a','#c98af7','#ffffff'];
  for(let i=0;i<(jack?140:80);i++){const a=rand(0,TAU),sp=rand(200,jack?760:560);WH.parts.push({x:cx,y:cy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-200,g:900,t:rand(1,1.8),c:pk(cols),r:rand(0,6),vr:rand(-12,12),star:Math.random()<.35})}}
function closeSkills(){$('skScr').hidden=true;const wh=!$('whScr').hidden;modal=wh;paused=wh;if(skMode==='altar'&&altarLeft===2)altarLeft=0;if(P.pendingLv>0)G.lvlT=.3}
function pick(i){if(!modal||!offer[i])return;const s=offer[i];
  if(skMode==='shop'){const o=G.shopOffer[i];if(G.shopSold[s.id]||G.gold<o.price)return;G.gold-=o.price;G.shopSold[s.id]=1;s.f();P.skills[s.id]=(P.skills[s.id]||0)+1;sfx('upgrade');openSkills('shop',true);return}
  s.f();P.skills[s.id]=(P.skills[s.id]||0)+1;
  if(skMode==='altar'){if(altarLeft===2){G.curse.f();text(P.x,P.y-50,G.curse.n,'#c48ae8',15);sfx('roar')}altarLeft--;if(altarLeft>0){openSkills('altar',true);return}G.prop.used=true}
  closeSkills()}
function endRun(win,quit){
  if(!G||G.ended)return;G.ended=true;
  started=false;paused=true;$('pauseScr').hidden=true;$('bossBar').hidden=true;
  const gold=Math.round(G.gold*(P.goldMul||1)*(1+.12*(G.arena||0))),st=SAVE.stats;SAVE.gold+=gold;G.gemsRun=(G.gemsRun||0)+((G.gems&&G.gems.length)||0);G.gems=[];SAVE.gems=(SAVE.gems||0)+G.gemsRun;SAVE.runs++;st.gold+=gold;st.runs++;st.maxLvl=Math.max(st.maxLvl,P.lvl);mprog('gold',null,gold);mprog('lvl',null,P.lvl,true);
  const inf=G.mode==='inf',chn=G.chapter||1,c2=!inf&&chn===2;let rec=false,unlock='';
  if(inf){rec=G.room>SAVE.inf.best&&!quit;if(!quit){SAVE.inf.best=Math.max(SAVE.inf.best,G.room);SAVE.inf.top.push({room:G.room,hero:SAVE.hero,kills:G.kills,d:Date.now()});SAVE.inf.top.sort((a,b)=>b.room-a.room||b.kills-a.kills);SAVE.inf.top=SAVE.inf.top.slice(0,5)}mprog('inf',null,G.room,true)}
  else{const B=chn>1?'best'+chn:'best';if(!SAVE[B])SAVE[B]={room:0,gold:0};if(G.room>SAVE[B].room||(G.room===SAVE[B].room&&gold>SAVE[B].gold))SAVE[B]={room:G.room,gold}}
  if(win){st.wins++;SAVE.done['c'+chn]=true}
  const DR=G.daily?chalEnd(win,quit):null;passXP(quit?0:G.room*8+Math.min(80,G.kills*.6)+(win?40:0)+(G.bossKills||0)*25);
  let trD=0,arenaUp=-1;if(!inf&&!G.daily){const T0=SAVE.trophies||0,a0=arenaIdx(T0),gate=ARENAS[a0].t,T1=Math.max(gate,T0+(win?trWin():-trLose(G.room)));trD=T1-T0;SAVE.trophies=T1;
    if(T1>(SAVE.trBest||0))SAVE.trBest=T1;const a1=arenaIdx(T1);if(a1>a0){arenaUp=a1;SAVE.arenaUp=a1}}
  const ct0=quit?null:inf?(G.room>=20?'oro':G.room>=10?'argento':G.room>=5?'legno':null):win?'oro':G.room>=6?'argento':G.room>=3?'legno':null,ch=ct0?earnChest(matchChest(ct0,win),true):null,ct=ch&&ch.type||ct0;
  checkAch();save();
  $('endTag').textContent=G.daily?'Sfida del giorno':inf?"L'Abisso":win?ARENAS[G.arena||0].n+': arena conquistata':quit?'Incursione abbandonata':'Sconfitta';
  $('eTr').innerHTML=G.daily?(DR&&DR.score?`<div class="trd up">${DR.score.toLocaleString('it-IT')}</div><div class="trline">Punteggio · ${DR.pos}° in classifica${DR.bonus?' · <em>'+DR.bonus+'</em>':''}</div>`:''):inf?'':`<div class="trd ${trD>=0?'up':'down'}">${TROPHY}${trD>0?'+':''}${trD}</div><div class="trline">${SAVE.trophies} coppe${arenaUp>=0?` · <em>Nuova arena: ${ARENAS[arenaUp].n}!</em>`:trD===0&&!win?' · <em>La soglia dell’arena ti protegge</em>':''}</div>`;
  $('endTitle').textContent=win?'VITTORIA':quit?'RITIRATA':rec?'NUOVO RECORD':'SEI CADUTO';$('endTitle').style.color=win?'var(--moss)':rec?'var(--gold)':'var(--blood)';
  $('endText').textContent=inf?(quit?`Ti sei ritirato alla stanza ${G.room} dell'Abisso.`:`Sei arrivato alla stanza ${G.room} dell'Abisso.${rec?' Mai così in fondo!':` Il tuo record è la stanza ${SAVE.inf.best}.`}`)
    :win?(['La Strega delle Radici è caduta. La cripta è tua.','Il Fabbro Infernale è caduto. Il vulcano tace.',"L'Idra della Palude è sconfitta. Le lucciole tornano a brillare.",'La Regina dei Ghiacci è caduta. La vetta è tua.'][chn-1]||'Vittoria!'):quit?`Ti sei ritirato alla stanza ${G.room}. L'oro raccolto resta tuo.`:`Ti sei fermato alla stanza ${G.room}. Migliora l'equipaggiamento e riprova.`;
  $('eRoom').textContent=G.room;$('eKills').textContent=G.kills;$('eGold').textContent=gold;$('eGems').textContent=G.gemsRun||0;
  $('endReward').innerHTML=ch?`<div class="rew${ch.fifth?' fifth':''}"><div class="rewc">${chestSVG(ct,false)}</div><div><b>${ch.fifth?'Quinta cassa: ':''}${CHESTS[ct].n}</b><span>${ch.full?`Posti delle casse pieni: hai preso ${ch.gold} oro al suo posto`:ch.fifth?'I quattro posti erano pieni: è nel posto speciale':'Ti aspetta nei posti delle casse'}</span></div></div>`
    :`<p class="hint">${quit?'Abbandonando non si guadagnano casse.':inf?'Arriva alla stanza 5 per guadagnare una cassa.':'Arriva alla stanza 3 per guadagnare una cassa.'}</p>`;
  $('endScr').hidden=false;sfx(win||rec?'victory':quit?'ui':'defeat');if(!win&&!rec)duckMusic(.45);if(win||rec)vib([60,40,60,40,140]);
}

