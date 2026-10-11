// ---------- render ----------
function render(){
  const cw=cv.width,ch=cv.height,s=Math.min(cw/VW,ch/VH),ox=(cw-VW*s)/2,oy=Math.max(0,(ch-VH*s)/2);
  ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#120e0b';ctx.fillRect(0,0,cw,ch);
  if(!G)return;
  const sx=(Math.random()-.5)*G.shake,sy=(Math.random()-.5)*G.shake;
  const vx=G.vx||0,vy=G.vy||0;
  if(G.state==='dead'&&G.deathT){const k=Math.min(1,G.deathT/.9),zs=1+.12*k,zx=(P.x-vx-VW/2)*k*.5,zy=(P.y-vy-VH/2)*k*.5;ctx.setTransform(s*zs,0,0,s*zs,ox+s*(VW/2)*(1-zs)-s*zs*zx+sx*s,oy+s*(VH/2)*(1-zs)-s*zs*zy+sy*s)}
  else if(G.cam){const c=G.cam;ctx.setTransform(s*c.z,0,0,s*c.z,ox+s*(VW/2-c.z*c.x)+sx*s,oy+s*(VH/2-c.z*c.y)+sy*s)}
  else ctx.setTransform(s,0,0,s,ox+sx*s,oy+sy*s);
  ctx.translate(-vx,-vy);if(AW>VW||AH>VH)drawBackdrop(vx,vy);
  ctx.drawImage(floorCv,0,0,AW,AH);
  if(!LOWFX)drawFloorGlow();
  for(const d of G.decals){ctx.fillStyle=d.col;ctx.globalAlpha=.35;for(let i=0;i<4;i++){const a=d.seed+i*1.6;ell(d.x+Math.cos(a)*d.r*.5,d.y+Math.sin(a)*d.r*.3,d.r*.5,d.r*.3);ctx.fill()}ctx.globalAlpha=1}
  torchLight();lightPools();drawEnvGround();lavaGlowLive();drawTufts();
  // the darkness falls on the room, not on the actors: characters, dangers and loot stay bright and readable
  const split=!G.dark&&!LOWFX;if(split)drawLighting('in');
  drawHazardsGround();drawHazards2Ground();drawLobsGround();drawTelegraphs();drawDebris('ground');
  for(const w of G.waves){if(w.col==='lvl'){ctx.strokeStyle=`rgba(140,255,190,${.8*(1-w.r/w.max)})`;ctx.lineWidth=4;ell(w.x,w.y,w.r,w.r*.6);ctx.stroke();continue}ctx.strokeStyle=`rgba(${w.rgb||'255,138,60'},${.8*(1-w.r/w.max)})`;ctx.lineWidth=9;circ(w.x,w.y,w.r);ctx.stroke();ctx.strokeStyle=w.rgb?'rgba(255,255,255,.6)':'rgba(255,220,150,.6)';ctx.lineWidth=2;circ(w.x,w.y,w.r);ctx.stroke()}
  drawOrbs();
  for(const c of G.coins){if(icoOk(ICO.coin)){const k=.4+.6*Math.abs(Math.cos(G.t*3.2+c.x*.37+c.y*.11));ctx.fillStyle='rgba(0,0,0,.25)';ell(c.x,c.y+5,4.5,1.6);ctx.fill();ctx.drawImage(ICO.coin,c.x-6.5*k,c.y-7,13*k,13)}else{ink(1.8);circ(c.x,c.y,4.5);fs('#ffc93c')}}
  for(const g of G.gems){const b=g.z>0?0:Math.sin(G.t*3+g.ph)*1.6,y=g.y-g.z-8+b;ctx.fillStyle='rgba(0,0,0,.3)';ell(g.x,g.y+1,5,2);ctx.fill();
    ctx.save();ctx.globalCompositeOperation='lighter';glow('120,220,255',g.x,y,16,.35+.15*Math.sin(G.t*4+g.ph));ctx.restore();drawGem(g.x,y,1.15);
    if(Math.sin(G.t*2.3+g.ph)>.92){ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(g.x+3,y-9);ctx.lineTo(g.x+3,y-3);ctx.moveTo(g.x,y-6);ctx.lineTo(g.x+6,y-6);ctx.stroke()}}
  for(const h of G.hearts){const by=Math.sin(G.t*4+h.x)*2;ink(2);ctx.beginPath();const x=h.x,y=h.y-6+by;ctx.moveTo(x,y+7);ctx.bezierCurveTo(x-10,y,x-7,y-7,x,y-3);ctx.bezierCurveTo(x+7,y-7,x+10,y,x,y+7);fs('#e5484d')}
  drawWallBack();
  // shadows first, so no shadow ever lands on top of a sprite
  for(const k of G.rocks)castShadow(k);
  for(const e of G.enemies)if(e.spawn<=0){if(e.elite&&!e.type.includes('slime')){ctx.save();ctx.translate(e.x,e.y);ctx.scale(1.22,1.22);ctx.translate(-e.x,-e.y);shadowFor(e);ctx.restore()}else shadowFor(e)}
  if(G.prop)shadow(G.prop.x,G.prop.y+4,40,12,.35);
  if(!(G.door&&P.y<TOP+2))shadow(P.x,P.y+8,13,5,.32);petShadow();
  noShadow=true;
  const inDoor=G.door&&P.y<TOP+2;
  const list=[];for(const k of G.rocks)list.push({y:k.y,f:()=>drawRock(k)});
  for(const e of G.enemies)list.push({y:e.y+(e.z>20?2000:0)+(e.type==='bat'||e.type==='wisp'?6:0),f:()=>drawEnemy(e)});
  for(const c of G.corpses||[])list.push({y:c.y,f:()=>drawCorpse(c)});
  if(G.prop)list.push({y:G.prop.y,f:()=>drawProp(G.prop)});
  if(G.cc)for(const c of G.cc)list.push({y:c.y,f:()=>drawTwinChest(c)});
  for(const st of G.stuck)list.push({y:st.k.y+(Math.sin(st.a)>0?-1:1),f:()=>drawStuck(st)});
  list.push({y:P.y,f:()=>{if(inDoor){ctx.save();ctx.beginPath();ctx.rect(0,TOP,AW,AH);doorPath();ctx.clip();drawHero();ctx.restore();doorDark(true);doorFrame()}else drawHero()}});
  for(const pt of G.pets||(G.pet?[G.pet]:[]))list.push({y:pt.y+(pt.id==='muschietto'?0:6),f:()=>drawPet(pt)});
  list.sort((a,b)=>a.y-b.y);for(const it of list)it.f();
  noShadow=false;
  for(let i=0;i<P.orbit;i++){const a=G.t*3.6+i*TAU/P.orbit,bx=P.x+Math.cos(a)*(P.storm?60:44),by=P.y-6+Math.sin(a)*(P.storm?60:44);ctx.save();ctx.translate(bx,by);ctx.rotate(a+G.t*8);if(P.storm)ctx.scale(1.45,1.45);ink(2);ctx.beginPath();ctx.moveTo(0,-9);ctx.lineTo(4,0);ctx.lineTo(0,9);ctx.lineTo(-4,0);ctx.closePath();fs('#dfe4ea');ctx.restore()}
  for(const a of G.arrows)drawArrow(a);drawPetShots();if(INTRO.on)introWorld();
  for(const p of G.eproj)drawEproj(p);
  drawBoulders();drawHazards2Air();drawLobsAir();drawUltRain();
  for(const f of G.fx){
    if(f.k==='chunk'){ctx.fillStyle=f.col;circ(f.x,f.y,f.r);ctx.fill()}
    else if(f.k==='puff'){ctx.fillStyle=`rgba(220,210,190,${Math.min(1,f.t*1.4)})`;circ(f.x,f.y,f.r);ctx.fill()}
    else if(f.k==='ghost'){ctx.fillStyle=`rgba(47,179,166,${f.t*2})`;circ(f.x,f.y-8,10);ctx.fill()}
    else if(f.k==='spark'){ctx.fillStyle='#f6ead2';circ(f.x,f.y,2);ctx.fill()}
    else if(f.k==='chain'){const a=f.t/.22;ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(255,140,50,${a})`;ctx.lineWidth=5*a+1;ctx.beginPath();ctx.moveTo(f.x,f.y);const n=5;for(let k=1;k<n;k++)ctx.lineTo(f.x+(f.x2-f.x)*k/n+rand(-7,7),f.y+(f.y2-f.y)*k/n+rand(-7,7));ctx.lineTo(f.x2,f.y2);ctx.stroke();ctx.strokeStyle=`rgba(255,240,180,${a})`;ctx.lineWidth=1.5;ctx.stroke();ctx.restore();glow('255,140,50',f.x2,f.y2,18,.6*a)}
    else if(f.k==='lvl'){ctx.fillStyle=f.gold?`rgba(255,215,90,${Math.min(1,f.t*2.2)})`:`rgba(150,255,195,${Math.min(1,f.t*2.2)})`;circ(f.x,f.y,2.3);ctx.fill()}
    else if(f.k==='bolt')drawBolt(f);
    else if(FXDRAW[f.k])FXDRAW[f.k](f);
    else if(f.k==='flash'||f.k==='ring2'||f.k==='streak'||f.k==='firep'||f.k==='spore'||f.k==='pop')drawFx2(f);
    else if(f.k==='boom'){const p=1-f.t/.35;ctx.fillStyle=`rgba(255,200,90,${.5*(1-p)})`;circ(f.x,f.y,f.r*p);ctx.fill();ctx.strokeStyle=`rgba(255,138,60,${1-p})`;ctx.lineWidth=5;circ(f.x,f.y,f.r*p);ctx.stroke()}
  }
  drawDebris('air');drawAmbient();
  drawWallFront();if(split)drawLighting('out');else drawLighting();if(AW>VW||AH>VH)drawBeastEyes();
  drawUltOverlay();
  if(!inDoor)drawBars();
  if(G.goldRun)drawGoldTimer();if(G.trial)drawTrialTag();
  {const ex=ox/s+2,ey=oy/s+2;ctx.drawImage(VIG,vx-ex,vy-ey,VW+ex*2,VH+ey*2)}
  ctx.textAlign='center';
  for(const t of G.texts){ctx.globalAlpha=Math.min(1,t.life*2.5);ctx.font=Math.round(t.size*(t.pop?1+1.2*Math.max(0,(t.life-.62)/.18):1))+'px "Lilita One", sans-serif';ctx.lineWidth=3.5;ctx.strokeStyle=INK;ctx.strokeText(t.t,t.x,t.y);ctx.fillStyle=t.col;ctx.fillText(t.t,t.x,t.y)}
  ctx.globalAlpha=1;
  if(G.fade>0){ctx.fillStyle=`rgba(12,9,7,${G.fade})`;ctx.fillRect(vx-ox/s-60,vy-oy/s-60,VW+ox/s*2+120,VH+oy/s*2+120)}
  ctx.setTransform(1,0,0,1,0,0);if(AW>VW||AH>VH)drawOffscreen(cw,ch,s,ox,oy,vx,vy);
  if(G.state==='dead')drawDeathFx(cw,ch);
  if(P.hp<P.maxhp*.3&&G.state!=='dead'){const a=.15+.08*Math.sin(G.t*6),g=ctx.createRadialGradient(cw/2,ch/2,Math.min(cw,ch)*.3,cw/2,ch/2,Math.max(cw,ch)*.7);g.addColorStop(0,'rgba(229,72,77,0)');g.addColorStop(1,`rgba(229,72,77,${a})`);ctx.fillStyle=g;ctx.fillRect(0,0,cw,ch)}
  if(joy.active){const rc=cv.getBoundingClientRect(),dpr=cw/rc.width,jx=(joy.ox-rc.left)*dpr,jy=(joy.oy-rc.top)*dpr;
    ctx.strokeStyle='rgba(246,234,210,.35)';ctx.lineWidth=3*dpr;circ(jx,jy,JR*dpr);ctx.stroke();ctx.fillStyle='rgba(246,234,210,.4)';circ(jx+joy.dx*JR*dpr,jy+joy.dy*JR*dpr,20*dpr);ctx.fill()}
}
function hud(){
  if(!G)return;
  $('roomTxt').textContent=G.event?'Evento':G.mode==='inf'?'∞ '+G.room:G.room+'/'+ROOMS;if(modal)$('hint').classList.remove('show');$('goldTxt').textContent=G.gold;$('gemTxt').textContent=G.gemsRun;$('lvTxt').textContent='Liv. '+P.lvl;$('xpFill').style.width=Math.min(100,100*P.xp/P.need)+'%';
  hudUlt();const pct=P.dashCd>0?1-P.dashCd/P.dashMax:1;$('dashBtn').style.background=`conic-gradient(var(--teal) ${pct*360}deg,#3a4c49 0deg)`;
  const b=G.enemies.find(e=>isBoss(e.type));if(b)$('bossFill').style.width=Math.max(0,100*b.hp/b.max)+'%';
}
function resize(){const dpr=SAVE.set&&SAVE.set.q==='bassa'?Math.min(1.25,window.devicePixelRatio||1):Math.min(2,window.devicePixelRatio||1);cv.width=Math.round(cv.clientWidth*dpr);cv.height=Math.round(cv.clientHeight*dpr)}
addEventListener('resize',resize);
let last=performance.now();
let frameEma=.016,slowT=0;
function loop(now){const raw=(now-last)/1000,dt=Math.min(.033,raw);last=now;if(INTRO.on)introTick(now);
  if(started&&!paused&&!INTRO.on&&raw<.2){frameEma+=(raw-frameEma)*.05;if(SAVE.set.q==='auto'&&!LOWFX&&frameEma>.026){slowT+=raw;if(slowT>2.5)LOWFX=true}else slowT=0}
  if(started&&!paused){if(G.hitstop>0)G.hitstop-=dt;else if(G.slowT>0){G.slowT-=dt;update(dt*(G.slowT>1?.22:.22+.78*(1-G.slowT)))}else update(dt)}
  if($('menu').hidden){render();hud()}
  if(!$('menu').hidden&&$('chestScr').hidden){if(!$('tabHero').hidden){G.t+=dt;drawHeroPreview(dt)}else if(!$('tabGear').hidden){G.t+=dt;drawHeroPreview(dt,$('gearCv'),SAVE.hero)}const home=!$('tabPlay').hidden;CAMP.fr=(CAMP.fr||0)+1;if(home){if($('sheetScr').hidden)drawCamp(dt)}else if(CAMP.fr%2===0||!MBG.drawn)drawMenuBg(dt*2)}
  requestAnimationFrame(loop)}

