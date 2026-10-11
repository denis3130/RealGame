// =====================================================================
// ANTEPRIME DELLE ARENE (piano maestro, punto 9): via il teschio dell'accampamento. L'anteprima di ogni arena è la stanza del suo
// boss: il pavimento, il muro di fondo con il cancello e le torce del suo mondo, e il boss in piedi al centro. Nella scheda del
// Cammino e nel pass è un'immagine fissa (arenaThumb, cotta una volta per arena); nella schermata «Nuova arena sbloccata!» il boss
// respira e le torce tremolano (showArenaUp). I colori vengono da ENV della zona del boss, più la tinta dell'arena (ARENAS[i].tint).
// =====================================================================
const CUSTODE_INTRO={golem:'Il Golem di Muschio',radici:'La Strega delle Radici',magma:'La Salamandra di Lava',fabbro:'Il Fabbro Infernale',rospo:'Il Re Rospo',idra:"L'Idra della Palude",yeti:'Lo Yeti delle Vette',regina:'La Regina dei Ghiacci'};
function fakeBoss(type){const e=makeE0(type,0,0,0);Object.assign(e,{intro:0,face:Math.PI*.5,t:1.2,cd:1,z:0,jump:0,alpha:1,hidden:false,spawn:0});
  if(type==='hydra')e.heads=[-1,0,1].map(s=>({s,ext:0,open:0,st:'idle'}));if(type==='salamander')e.trail=Array.from({length:50},(_,k)=>({x:-60+k*1.2,y:-20+k*.4}));return e}
// the scene: cv is the canvas, i the arena, t the time (for the breathing and the flames)
function arenaScene(cv,i,t){const A=ARENAS[i],z=A.boss||'radici',E=ENV[z]||ENV.muschio,W=cv.width,H=cv.height,c=cv.getContext('2d'),saved=ctx,gt=G&&G.t,ns=noShadow;ctx=c;c.setTransform(1,0,0,1,0,0);
  let s=i*7919+13;const rnd=()=>(s=(s*9301+49297)%233280)/233280;const lava=LAVAZ.includes(z),swamp=z==='rospo'||z==='idra',ice=z==='yeti'||z==='regina';
  // floor: slabs of the world with the mortar showing through, darker at the edges
  const wh=Math.round(H*.3),S=Math.round(W/14);c.fillStyle=E.mortar;c.fillRect(0,0,W,H);
  for(let y=wh-4;y<H;y+=S)for(let x=-S/2;x<W;x+=S){c.fillStyle=E.floor[Math.floor(rnd()*E.floor.length)];c.fillRect(x+1.5,y+1.5,S-3,S-3);c.fillStyle='rgba(255,240,210,.07)';c.fillRect(x+1.5,y+1.5,S-3,2)}
  if(lava){for(let k=0;k<4;k++){const x0=rnd()*W,y0=wh+rnd()*(H-wh);c.strokeStyle='rgba(255,120,30,.9)';c.lineWidth=2.2;c.lineCap='round';c.beginPath();c.moveTo(x0,y0);let x=x0,y=y0;for(let j=0;j<4;j++){x+=(rnd()-.5)*40;y+=(rnd()-.3)*26;c.lineTo(x,y)}c.stroke();c.save();c.globalCompositeOperation='lighter';c.strokeStyle='rgba(255,90,20,.35)';c.lineWidth=7;c.stroke();c.restore()}}
  if(swamp){c.fillStyle='rgba(20,60,55,.75)';c.beginPath();c.ellipse(W*.22,H*.72,W*.17,H*.09,0,0,TAU);c.fill();c.beginPath();c.ellipse(W*.8,H*.56,W*.12,H*.07,0,0,TAU);c.fill();
    for(const[px,py,r] of[[W*.17,H*.71,8],[W*.27,H*.75,6],[W*.82,H*.55,6]]){c.fillStyle='#4f8a3a';c.beginPath();c.ellipse(px,py,r,r*.6,0,0,TAU);c.fill();c.strokeStyle='rgba(16,24,12,.6)';c.lineWidth=1;c.stroke()}}
  if(ice){for(let k=0;k<5;k++){const px=rnd()*W,py=wh+rnd()*(H-wh);c.fillStyle='rgba(200,235,255,.22)';c.beginPath();c.ellipse(px,py,18+rnd()*18,8+rnd()*8,0,0,TAU);c.fill()}
    c.strokeStyle='rgba(240,250,255,.8)';c.lineWidth=1.2;for(let k=0;k<6;k++){const px=rnd()*W,py=wh+rnd()*(H-wh),r=4+rnd()*4;for(let a=0;a<3;a++){c.beginPath();c.moveTo(px-Math.cos(a*1.05)*r,py-Math.sin(a*1.05)*r);c.lineTo(px+Math.cos(a*1.05)*r,py+Math.sin(a*1.05)*r);c.stroke()}}}
  if(!lava&&!swamp&&!ice){c.lineCap='round';for(let k=0;k<22;k++){const px=rnd()*W,py=wh+rnd()*(H-wh);c.strokeStyle=k%2?'#6f8a3a':'#4f6a2a';c.lineWidth=1.6;c.beginPath();c.moveTo(px,py);c.lineTo(px+(rnd()-.5)*4,py-4-rnd()*4);c.stroke()}}
  // the back wall: bricks, a cornice, the gate in the middle, two torches
  for(let y=0;y<wh;y+=10)for(let x=((y/10)%2?-9:0);x<W;x+=18){c.fillStyle=E.wall[Math.floor(rnd()*E.wall.length)];c.fillRect(x+1,y+1,16,8)}
  c.fillStyle='rgba(0,0,0,.35)';c.fillRect(0,wh-3,W,3);c.fillStyle=E.base||E.side;c.fillRect(0,wh-8,W,5);
  const gx=W/2,gw=W*.14;c.fillStyle='#07060a';c.beginPath();c.moveTo(gx-gw,wh);c.lineTo(gx-gw,wh*.5);c.arc(gx,wh*.5,gw,Math.PI,0);c.lineTo(gx+gw,wh);c.closePath();c.fill();c.strokeStyle=E.side;c.lineWidth=4;c.stroke();ink(2);c.stroke();
  const f=.8+.2*Math.sin(t*9)+.1*Math.sin(t*23);
  for(const tx of[W*.22,W*.78]){c.fillStyle='#3a2a1c';c.fillRect(tx-2.5,wh*.42,5,18);ink(1.5);c.strokeRect(tx-2.5,wh*.42,5,18);
    c.save();c.globalCompositeOperation='lighter';glow(E.light,tx,wh*.4,38*f,.55);c.restore();
    c.fillStyle=E.torch[1];c.beginPath();c.ellipse(tx,wh*.38,5,8*f,0,0,TAU);c.fill();c.fillStyle=E.torch[2];c.beginPath();c.ellipse(tx,wh*.4,2.4,4*f,0,0,TAU);c.fill()}
  // the floor lit by the torches, darker in the corners
  c.save();c.globalCompositeOperation='lighter';glow(E.light,W*.22,wh+20,90,.16);glow(E.light,W*.78,wh+20,90,.16);c.restore();
  const g=c.createRadialGradient(W/2,H*.55,H*.3,W/2,H*.55,H*.95);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,`rgba(0,0,0,${.35+.3*(E.dark||.4)})`);c.fillStyle=g;c.fillRect(0,0,W,H);
  // the boss, standing in the middle of its room
  const e=fakeBoss(BOSSZ[z]||'witch');e.t=1.2+t;if(G)G.t=t;const sc=1.3*W/360;c.setTransform(sc,0,0,sc,W/2,H*.76);noShadow=false;try{shadowFor(e);drawEnemy(e)}catch(err){}
  c.setTransform(1,0,0,1,0,0);noShadow=ns;if(G)G.t=gt;ctx=saved}
// the still picture used by the trophy road, the pass and the arena card (cached; the arena's tint on top)
arenaThumb=function(i){const A=ARENAS[i],k='thumb'+i;if(CAMP.bg[k])return CAMP.bg[k];const s=document.createElement('canvas');s.width=360;s.height=225;arenaScene(s,i,0);
  const c=document.createElement('canvas');c.width=360;c.height=225;const x=c.getContext('2d');if(HASF&&A.tint)x.filter=A.tint;x.drawImage(s,0,0);x.filter='none';
  if(!HASF&&A.tint){x.globalCompositeOperation='color';x.globalAlpha=.5;x.fillStyle=A.col;x.fillRect(0,0,360,225)}
  return CAMP.bg[k]=c.toDataURL('image/jpeg',.84)};
// «Nuova arena sbloccata!»: the boss room, alive, with the boss breathing and the torches flickering
showArenaUp=function(i){const A=ARENAS[i],el=$('arenaUpScr'),z=A.boss||'radici';
  el.innerHTML=`<div class="vsRays"></div><div class="auBox"><span class="vsKind">Nuova arena sbloccata!</span><div class="auPic"><canvas id="auCv" width="360" height="270" style="filter:${A.tint||'none'}"></canvas><span class="auNum">Arena ${i+1}</span></div><span class="ribbon" style="--ac:${A.col}">${A.n}</span><p>${A.d}</p><p class="auBoss">Custode: <b>${(CUSTODE_INTRO[z]||'').replace(/^(Il|La|Lo|L')\s?/,'')}</b></p><p class="auTr">${TROPHY}${A.t} coppe</p><button class="btn go" id="auOk">Fantastico!</button></div>`;
  el.hidden=false;const cv=$('auCv'),t0=performance.now();
  const loop=()=>{if(el.hidden||!cv.isConnected)return;try{arenaScene(cv,i,(performance.now()-t0)/1000)}catch(e){}if(!LOWFX)requestAnimationFrame(loop)};loop();
  sfx('victory');vib([40,30,40,30,120]);$('auOk').onclick=()=>{sfx('ui');el.hidden=true;renderPlay()}};
