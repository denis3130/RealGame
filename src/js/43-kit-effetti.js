// ---------- VFX kit: flashes, rings, sparks, debris, fire, cracks ----------
const PAL={stone:null,dirt:['#6b4a2a','#4a3220','#8a6a44'],leaf:['#5f9e3c','#7bbf4a','#3f6a2a'],lava:['#ff7a2e','#ffd86b','#3d3430'],spark:['#ffe9a0','#ffc93c','#ff8a3c'],gold:['#ffe08a','#ffc93c','#b07a10'],spore:['#7bf0c0','#b8f0a0','#5fd3a6']};
function fxPush(f){if(LOWFX&&(f.k==='streak'||f.k==='spore'||f.k==='firep')&&Math.random()<.55)return;if(G.fx.length<420)G.fx.push(f)}
function vfxBlast(x,y,rgb,R,o){o=o||{};
  fxPush({k:'flash',x,y,rgb,r:R*1.1,t:.22,max:.22});
  fxPush({k:'ring2',x,y,rgb,r0:R*.2,r1:R,t:.42,max:.42,w:o.w||7});
  if(o.ring2!==false)fxPush({k:'ring2',x,y,rgb:'255,255,255',r0:R*.1,r1:R*.65,t:.3,max:.3,w:3});
  const sp=o.sparks==null?14:o.sparks;for(let i=0;i<sp;i++){const a=rand(0,TAU),s=rand(140,340)*(R/80+.4);fxPush({k:'streak',x,y:y-6,vx:Math.cos(a)*s,vy:Math.sin(a)*s*.7-60,g:420,t:rand(.25,.5),max:.5,col:pk(o.spcol||PAL.spark),w:rand(1.6,2.6)})}
  if(o.debris){const pal=o.debris==='stone'?(()=>{const S=stonePal();return[S.hi,S.mid,S.lo]})():PAL[o.debris]||o.debris;const n=o.n||16;
    for(let i=0;i<n;i++){const a=rand(0,TAU),s=rand(70,220)*(R/90+.5);G.debris.push({x:x+rand(-6,6),y:y+rand(-3,3),z:rand(4,14),vx:Math.cos(a)*s,vy:Math.sin(a)*s*.6,vz:rand(120,300),col:pk(pal),s:rand(1.8,4.2),rot:rand(0,TAU),vr:rand(-18,18),life:rand(1.6,2.8),glow:o.debris==='lava',leaf:o.debris==='leaf'&&Math.random()<.7})}
    if(G.debris.length>300)G.debris.splice(0,G.debris.length-300)}
  if(o.fire)for(let i=0;i<(o.fire|0);i++){const a=rand(0,TAU),d=rand(0,R*.45);fxPush({k:'firep',x:x+Math.cos(a)*d,y:y+Math.sin(a)*d*.6,vx:rand(-15,15),vy:rand(-90,-40),t:rand(.4,.8),max:.8,r:rand(6,12)})}
  if(o.spore)for(let i=0;i<(o.spore|0);i++){const a=rand(0,TAU),s=rand(30,110);fxPush({k:'spore',x,y:y-8,vx:Math.cos(a)*s,vy:Math.sin(a)*s*.7-20,t:rand(.5,1),max:1,r:rand(3,7),rgb:o.sporeRgb||'123,240,192'})}
  if(o.dust!==false)for(let i=0;i<(o.dust||10);i++){const a=rand(0,TAU),s=rand(50,130)*(R/90+.5);fxPush({k:'puff',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s*.55,t:rand(.35,.7),r:rand(5,10)})}
  if(o.cracks)stamp('cracks',x,y,o.cracks===true?R*.6:o.cracks)}
function bossRage(e,rgb){vfxBlast(e.x,e.y-20,rgb,120,{sparks:26,debris:'stone',n:14,dust:16});fxPush({k:'ring2',x:e.x,y:e.y,rgb,r0:20,r1:200,t:.7,max:.7,w:10});vib([60,40,100])}
// projectile trails
function trailOf(p){if(!p.tr)p.tr=[];p.tr.push(p.x,p.y);if(p.tr.length>12)p.tr.splice(0,2)}
const TRC={orb:'229,72,77',thorn:'123,200,90',arrow:'229,72,77',fire:'255,130,50',coinp:'255,210,90',poison:'150,230,90',bubble:'190,240,170',ice:'160,220,255',snow:'230,245,255'};
function drawTrail(p,rgb,w){const t=p.tr;if(!t||t.length<4||LOWFX)return;const n=t.length/2;ctx.lineCap='round';
  for(let i=1;i<n;i++){const a=i/n;ctx.strokeStyle=`rgba(${rgb},${a*.55})`;ctx.lineWidth=w*a;ctx.beginPath();ctx.moveTo(t[i*2-2],t[i*2-1]);ctx.lineTo(t[i*2],t[i*2+1]);ctx.stroke()}}
function drawFx2(f){const p=1-f.t/(f.max||1);
  if(f.k==='flash'){ctx.save();ctx.globalCompositeOperation='lighter';glow(f.rgb,f.x,f.y,f.r*(.7+.3*p),.9*(1-p));ctx.restore()}
  else if(f.k==='ring2'){const r=f.r0+(f.r1-f.r0)*(1-Math.pow(1-p,2.2));ctx.strokeStyle=`rgba(${f.rgb},${.85*(1-p)})`;ctx.lineWidth=Math.max(.5,f.w*(1-p));ell(f.x,f.y,r,r*.62);ctx.stroke()}
  else if(f.k==='streak'){ctx.strokeStyle=f.col;ctx.globalAlpha=Math.min(1,f.t/(f.max*.5));ctx.lineWidth=f.w;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(f.x,f.y);ctx.lineTo(f.x-f.vx*.035,f.y-f.vy*.035);ctx.stroke();ctx.globalAlpha=1}
  else if(f.k==='firep'){const a=Math.min(1,f.t/(f.max*.6));ctx.save();ctx.globalCompositeOperation='lighter';glow('255,120,40',f.x,f.y,f.r*2,a*.6);ctx.fillStyle=`rgba(255,${190+40*a|0},90,${a})`;circ(f.x,f.y,f.r*.45);ctx.fill();ctx.restore()}
  else if(f.k==='spore'){const a=Math.min(1,f.t/(f.max*.6));ctx.save();ctx.globalCompositeOperation='lighter';glow(f.rgb,f.x,f.y,f.r*1.8,a*.5);ctx.restore();ctx.fillStyle=`rgba(${f.rgb},${a*.8})`;circ(f.x,f.y,f.r*.35);ctx.fill()}
  else if(f.k==='pop'){const r=f.r*(1+p*.8);ctx.strokeStyle=f.col;ctx.globalAlpha=1-p;ctx.lineWidth=4*(1-p)+1;circ(f.x,f.y,r);ctx.stroke();ctx.globalAlpha=1}}
// a crystal that has taken enough hits: it shatters and drops 1-2 gems
function breakCrystal(k){k.breaking=true;const n=Math.random()<.15?2:1;sfx('crystalBreak',0,k.x);shatterRock(k);G.hitstop=Math.max(G.hitstop||0,.05);
  for(let i=0;i<n;i++){const a=rand(-Math.PI*.9,-Math.PI*.1),s=rand(50,95);G.gems.push({x:k.x,y:k.y-4,vx:Math.cos(a)*s,vy:Math.sin(a)*s*.5,z:10,vz:rand(150,210),t:0,ph:rand(0,6)})}
  text(k.x,k.y-kH(k)-8,n>1?'+2 CRISTALLI':'+1 CRISTALLO','#8fe8ff',15);G.texts[G.texts.length-1].pop=1}
function drawGem(x,y,s,a){if(icoOk(ICO.gem)){ctx.save();ctx.globalAlpha=a==null?1:a;const w=17*s;ctx.drawImage(ICO.gem,x-w/2,y-w*.6,w,w);if((G.t*1.3+x*.01)%3<.25){ctx.globalCompositeOperation='lighter';glow('200,240,255',x-2*s,y-4*s,7*s,.9)}ctx.restore();return}ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.globalAlpha=a==null?1:a;
  ink(1.8);ctx.beginPath();ctx.moveTo(0,-6.5);ctx.lineTo(5.5,-1.5);ctx.lineTo(0,6.5);ctx.lineTo(-5.5,-1.5);ctx.closePath();
  const g=ctx.createLinearGradient(-5,-6,5,6);g.addColorStop(0,'#d9fbff');g.addColorStop(.45,'#5fd0f0');g.addColorStop(1,'#5a46c8');ctx.fillStyle=g;ctx.fill();ctx.stroke();
  ctx.strokeStyle='rgba(255,255,255,.75)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-5.5,-1.5);ctx.lineTo(5.5,-1.5);ctx.moveTo(-2.4,-1.5);ctx.lineTo(0,-6.5);ctx.lineTo(2.4,-1.5);ctx.stroke();
  ctx.fillStyle='#fff';ctx.fillRect(-2.6,-4,1.4,1.4);ctx.restore()}
// obstacles crushed by the falling chests
function shatterRock(k){const S=stonePal(),pal=DPAL[k.kind]||[S.hi,S.mid,S.lo],h=kH(k);
  for(let i=0;i<3;i++)rockHit(k,k.x+rand(-k.r,k.r)*.5,k.y-rand(0,h*.6),rand(0,TAU),true);
  const glowy=['crystal','brazier','lavarock','cauldron'].includes(k.kind),leafy=k.kind==='thorns'||k.kind==='stump';
  for(let i=0;i<34;i++){const a=rand(0,TAU),sp=rand(90,260);G.debris.push({x:k.x+rand(-k.r,k.r)*.6,y:k.y+rand(-3,3),z:rand(6,h),vx:Math.cos(a)*sp,vy:Math.sin(a)*sp*.6,vz:rand(140,320),col:pk(pal),s:rand(2.2,5.2),rot:rand(0,TAU),vr:rand(-22,22),life:rand(2.6,4),glow:glowy&&Math.random()<.6,leaf:leafy&&Math.random()<.5})}
  if(G.debris.length>320)G.debris.splice(0,G.debris.length-320);
  vfxBlast(k.x,k.y-8,glowy?(k.kind==='crystal'?'140,220,255':'255,150,60'):'230,215,190',k.r*2.6,{sparks:glowy?18:6,spcol:k.kind==='crystal'?['#c9f3ff','#6fc9e8','#ffffff']:undefined,dust:16,fire:k.kind==='brazier'||k.kind==='cauldron'||k.kind==='lavarock'?10:0});
  stamp('crater',k.x,k.y,k.r*1.3);
  // rubble that stays on the floor until the room ends
  const c=fx;c.setTransform(2,0,0,2,0,0);
  for(let i=0;i<18;i++){const a=rand(0,TAU),d=rand(.2,1.6)*k.r,px=k.x+Math.cos(a)*d,py=k.y+Math.sin(a)*d*.55,s=rand(1.6,4.4);
    c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(px+1,py+s*.5,s*1.1,s*.5,0,0,TAU);c.fill();
    c.fillStyle=pk(pal);c.strokeStyle='#1b1612';c.lineWidth=1.1;c.beginPath();const r0=rand(0,TAU);for(let j=0;j<5;j++){const aa=r0+j/5*TAU,rr=s*(.6+Math.random()*.5);j?c.lineTo(px+Math.cos(aa)*rr,py+Math.sin(aa)*rr*.75):c.moveTo(px+Math.cos(aa)*rr,py+Math.sin(aa)*rr*.75)}c.closePath();c.fill();c.stroke()}
  const ix=G.rocks.indexOf(k);if(ix>=0)G.rocks.splice(ix,1);fields={};shake(5)}
function bandBurst(b){const n=16;for(let i=0;i<n;i++){const t=(i+.5)/n,x=b.h?L+(R-L)*t:b.pos+rand(-6,6),y=b.h?b.pos+rand(-6,6):TOP+(BOT-TOP)*t;
  for(let k=0;k<2;k++)G.debris.push({x,y,z:4,vx:rand(-60,60),vy:rand(-40,40),vz:rand(100,220),col:pk(k?PAL.dirt:PAL.leaf),s:rand(1.8,3.4),rot:rand(0,TAU),vr:rand(-14,14),life:rand(1.4,2.4),leaf:!!k});
  if(i%2===0)fxPush({k:'puff',x,y,vx:rand(-30,30),vy:rand(-30,-5),t:.5,r:rand(6,10)})}}

// ---------- new skills ----------
SK.push(
  {id:'poison',n:'Frecce velenose',d:'Il veleno si accumula sui nemici',max:2,f:()=>P.poison=(P.poison||0)+1},
  {id:'light',n:'Fulmine',d:'Ogni pochi colpi cade un fulmine a catena',max:3,f:()=>P.light=(P.light||0)+1},
  {id:'shield',n:'Scudo di muschio',d:'Blocca un colpo ogni pochi secondi',max:2,f:()=>{P.shield=(P.shield||0)+1;P.shCd=0}},
  {id:'wallb',n:'Frecce di sponda',d:'Le frecce rimbalzano sui muri',max:2,f:()=>P.wb=(P.wb||0)+1},
  {id:'giant',n:'Freccia gigante',d:'Ogni 3 raffiche, una freccia enorme',max:1,f:()=>P.giant=1},
  {id:'vamp',n:'Sete di sangue',d:'Ogni nemico sconfitto ti cura',max:3,f:()=>P.vamp=(P.vamp||0)+1},
  {id:'boots',n:'Stivali leggeri',d:'Velocità di movimento +15%',max:2,f:()=>P.spd=(P.spd||150)*1.15});
Object.assign(ICON,{
  poison:'<path d="M20 4c6 8 11 13 11 19a11 11 0 0 1-22 0c0-6 5-11 11-19z" fill="#8fd14f" '+S2+'/><circle cx="16" cy="24" r="3" fill="#3f6a2a"/><circle cx="24" cy="19" r="2" fill="#3f6a2a"/><circle cx="23" cy="28" r="1.6" fill="#3f6a2a"/>',
  light:'<path d="M23 2L9 22h9l-4 16 17-22h-10z" fill="#bfe9ff" '+S2+'/><path d="M21 8l-6 11" stroke="#fff" stroke-width="2"/>',
  shield:'<path d="M20 3l14 5v10c0 9-6 15-14 19C12 33 6 27 6 18V8z" fill="#7bbf4a" '+S2+'/><path d="M20 9v22M12 15c4 2 12 2 16 0" stroke="#3f6a2a" stroke-width="2.5" fill="none"/>',
  wallb:'<path d="M5 4v32" stroke="#6b5644" stroke-width="5"/><path d="M34 30L9 20 34 10" fill="none" stroke="#8a5a20" stroke-width="3.5" stroke-linejoin="round"/><path d="M36 9l-8 0 4 6z" fill="#e8ecf0" '+S2+'/>',
  giant:'<path d="M3 20H30" stroke="#1b1612" stroke-width="9" stroke-linecap="round"/><path d="M3 20H30" stroke="#d9b27a" stroke-width="5" stroke-linecap="round"/><path d="M38 20L26 11V29Z" fill="#e8ecf0" '+S2+'/><path d="M2 14l6 6-6 6" fill="#f6ead2" '+S2+'/>',
  vamp:'<path d="M20 35C8 26 4 19 4 13a8 8 0 0 1 16-2 8 8 0 0 1 16 2c0 6-4 13-16 22z" fill="#a8243a" '+S2+'/><path d="M14 14l3 7 3-7 3 7 3-7" fill="none" stroke="#f6ead2" stroke-width="2"/>',
  boots:'<path d="M10 4h12v18l10 5v7H8z" fill="#8a5a32" '+S2+'/><path d="M8 30h24" stroke="#1b1612" stroke-width="2.5"/><path d="M2 12h6M1 19h6M3 26h4" stroke="#b8a990" stroke-width="2.5" stroke-linecap="round"/>'});
function lightning(e){const tg=[e];for(const o of G.enemies){if(tg.length>=1+Math.min(3,P.light))break;if(o!==e&&!o.dead&&o.spawn<=0&&!o.hidden&&Math.hypot(o.x-e.x,o.y-e.y)<140)tg.push(o)}
  let px=e.x,py=e.y-240;for(const t of tg){fxPush({k:'bolt',x:px,y:py,x2:t.x,y2:t.y-t.r,t:.25,max:.25});fxPush({k:'flash',x:t.x,y:t.y-t.r,rgb:'170,220,255',r:36,t:.18,max:.18});hurtE(t,P.atk*(.9+.3*P.light),false,true);px=t.x;py=t.y-t.r}
  sfx('thunder',0,e.x);shake(2)}
function drawBolt(f){const a=f.t/f.max;ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';ctx.lineJoin='round';
  const pts=[[f.x,f.y]];const n=7;for(let k=1;k<n;k++)pts.push([f.x+(f.x2-f.x)*k/n+rand(-12,12),f.y+(f.y2-f.y)*k/n+rand(-6,6)]);pts.push([f.x2,f.y2]);
  for(const[c,w] of [[`rgba(120,190,255,${a*.6})`,9],[`rgba(220,240,255,${a})`,3]]){ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke()}ctx.restore()}

// ---------- opening movie: plays at every launch, a tap skips it ----------
TRACKS.opening={bpm:150,roots:[40,36,38,35],chords:[[52,55,59],[48,52,55],[50,54,57],[47,51,54]],
  mel:[[0,71,4],[4,74,4],[8,76,6],[14,74,2],[16,71,8],[24,69,4],[28,67,4],[32,71,4],[36,74,4],[40,79,8],[48,78,6],[54,76,2],[56,74,8]],
  play(tr,step,t,spb){const s=step%16,bar=Math.floor(step/16)%4,loop=step%64,r=this.roots[bar];
    if(s===0){vChoir(tr,t,this.chords[bar],spb*16,.13);vBass(tr,t,r-12,spb*2,.26)}
    if(s%2===0)vBass(tr,t,r+(s%4?12:0),spb*1.4,.19);
    if(s===0||s===6||s===10)vBrass(tr,t,r+24+(s===0?0:s===6?7:10),spb*2,.085);
    if(step>=32)for(const[ss,m,l] of this.mel)if(ss===loop)vBrass(tr,t,m,spb*l*.9,.065);
    if(s%4===0)dTaiko(tr,t,s===0?1:.7);if(s===4||s===12)dFrame(tr,t,.75);if(s%2)dShaker(tr,t,.06);if(s===14||s===15)dTom(tr,t,.32,170+s*12);
    if(s===0&&bar===0)vBell(tr,t,r+48,1.8,.06)}};
function glowAt(c,x,y,r,rgb,a){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${rgb},${a})`);g.addColorStop(1,`rgba(${rgb},0)`);c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2)}

