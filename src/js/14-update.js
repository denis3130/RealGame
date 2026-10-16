// ---------- update ----------
function update(dt){
  G.t+=dt;
  if(G.bannerT>0){G.bannerT-=dt;if(G.bannerT<=0)bannerEl.classList.remove('show')}
  if(G.state==='trans'){G.fade+=dt*G.fadeDir*3.5;if(G.fadeDir>0&&G.fade>=1){G.fade=1;const ev=G.event;nextStep();G.prevState=G.state;G.state='trans';G.fadeDir=-1}else if(G.fadeDir<0&&G.fade<=0){G.fade=0;G.state=G.prevState||(G.event?'cleared':'play')}return}
  if(G.state==='dead'){deathTick(dt);return}
  // player
  if(P.regen&&P.hp<P.maxhp)P.hp=Math.min(P.maxhp,P.hp+P.regen*dt);
  P.inv=Math.max(0,P.inv-dt);P.dashCd=Math.max(0,P.dashCd-dt);if(P.shCd>0)P.shCd-=dt;P.poisonCd=Math.max(0,P.poisonCd-dt);
  const inp=input();
  const px0=P.x,py0=P.y;P.mire=Math.max(0,(P.mire||0)-dt);
  if(P.pull&&P.pull.t>0){P.pull.t-=dt;const dx=P.pull.x-P.x,dy=P.pull.y-P.y,dd=Math.hypot(dx,dy);if(dd>20)moveCircle(P,dx/dd*P.pull.sp*dt,dy/dd*P.pull.sp*dt);P.moving=false}
  else if(P.push&&P.push.t>0){P.push.t-=dt;moveCircle(P,P.push.vx*dt,P.push.vy*dt);P.moving=false}
  else if(P.dashT>0){P.dashT-=dt;moveCircle(P,P.dvx*dt,P.dvy*dt);if(Math.random()<.6)G.fx.push({k:'ghost',x:P.x,y:P.y,t:.2})}
  else{const slip=onIce(P.x,P.y),mire=P.mire>0?.55:1;let tvx=0,tvy=0;
    if(inp.m>.12){P.moving=true;const sp=(P.spd||150)*inp.m*mire;tvx=inp.x/inp.m*sp;tvy=inp.y/inp.m*sp;P.face=Math.atan2(inp.y,inp.x);P.walk+=dt*12*mire}else P.moving=false;
    // on ice you keep sliding a little and turn slower
    if(slip){const k=Math.min(1,dt*2.6);P.ivx=(P.ivx||0)+(tvx-(P.ivx||0))*k;P.ivy=(P.ivy||0)+(tvy-(P.ivy||0))*k;if(!P.moving&&Math.hypot(P.ivx,P.ivy)>18&&Math.random()<.3)G.fx.push({k:'snowp',x:P.x+rand(-5,5),y:P.y+8,vx:-P.ivx*.2,vy:-8,t:.3})}else{P.ivx=tvx;P.ivy=tvy}
    if(P.ivx||P.ivy)moveCircle(P,P.ivx*dt,P.ivy*dt)}
  P.vxs=(P.x-px0)/Math.max(dt,.001);P.vys=(P.y-py0)/Math.max(dt,.001);
  // fire
  P.fireCd-=dt;
  const tgt=INTRO.on&&INTRO.hold?null:nearest(P.x,P.y);P.aiming=false;
  if(!P.moving&&P.dashT<=0&&tgt){P.aiming=true;if(Math.hypot(tgt.x-P.x,tgt.y-P.y)>P.r)P.face=Math.atan2(tgt.y-P.y,tgt.x-P.x);
    if(P.fireCd<=0){P.fireCd=1/P.aspd;for(let k=0;k<P.multi;k++)P.queue.push({t:k*.12})}}
  for(let i=P.queue.length-1;i>=0;i--){const q=P.queue[i];q.t-=dt;if(q.t<=0){const t2=nearest(P.x,P.y);volley(t2?Math.atan2(t2.y-P.y,t2.x-P.x):P.face);P.queue.splice(i,1)}}
  // arrows
  for(let i=G.arrows.length-1;i>=0;i--){
    const ar=G.arrows[i];trailOf(ar);if(!ar.blade&&!LOWFX){if(P.proj==='flame'&&Math.random()<.55)fxPush({k:'firep',x:ar.x+rand(-3,3),y:ar.y+rand(-3,3),vx:rand(-15,15),vy:rand(-45,-10),t:.32,max:.32,r:rand(3,5)});else if(P.proj==='thorn'&&Math.random()<.2)fxPush({k:'spore',x:ar.x,y:ar.y,vx:rand(-12,12),vy:rand(-22,-4),t:.55,max:.55,r:4,rgb:'200,130,255'})}if(P.proj==='leaf'&&!ar.blade){const t=nearest(ar.x,ar.y,ar.hit,170);if(t){const da=angDiff(ar.a,Math.atan2(t.y-ar.y,t.x-ar.x));ar.a+=clamp(da,-3.2*dt,3.2*dt);const v=Math.hypot(ar.vx,ar.vy);ar.vx=Math.cos(ar.a)*v;ar.vy=Math.sin(ar.a)*v}}ar.x+=ar.vx*dt;ar.y+=ar.vy*dt;ar.life-=dt;if(ar.wb>0){let b=false;if(ar.x<L||ar.x>R){ar.vx*=-1;ar.x=clamp(ar.x,L,R);b=true}if(ar.y<TOP||ar.y>BOT){ar.vy*=-1;ar.y=clamp(ar.y,TOP,BOT);b=true}if(b){ar.wb--;ar.a=Math.atan2(ar.vy,ar.vx);ar.hit.clear();ar.life=Math.max(ar.life,.8);fxPush({k:'streak',x:ar.x,y:ar.y,vx:rand(-80,80),vy:rand(-80,80),t:.2,max:.2,col:'#f6ead2',w:1.6})}}let gone=ar.life<=0||ar.x<L||ar.x>R||ar.y<TOP||ar.y>BOT;
    if(!gone){const hk=G.rocks.find(k=>Math.hypot(k.x-ar.x,k.y-ar.y)<k.r);if(hk){gone=true;rockHit(hk,ar.x,ar.y,ar.a,false)}}
    if(gone){if(ar.siege)siegeBoom(ar);G.fx.push({k:'spark',x:ar.x,y:ar.y,t:.15});G.arrows.splice(i,1);continue}
    for(const e of G.enemies){
      if(e.dead||e.spawn>0||e.hidden||e.z>20||ar.hit.has(e))continue;
      if(Math.hypot(e.x-ar.x,e.y-e.z-8-ar.y)>e.r+(ar.rad||5))continue;
      ar.hit.add(e);
      if(e.type==='skeleton'&&e.lunge<=0&&skShield(e)>0){const fx=Math.cos(e.face),fy=Math.sin(e.face);
        if(-(fx*ar.vx+fy*ar.vy)/560>(e.elite?.12:.55)){const hitv=(ar.big?2:1)+(Math.random()<P.crit?1:0);e.sh=Math.max(0,e.sh-hitv);e.shHit=.22;
          G.fx.push({k:'spark',x:e.x+fx*12,y:e.y-8+fy*12,t:.2});moveCircle(e,Math.cos(ar.a)*3,Math.sin(ar.a)*3);
          if(e.sh>0){text(e.x,e.y-34,'PARATO','#c9cfd6',12);sfx('shieldHit',1-e.sh/e.shMax,e.x);}
          else breakShield(e,ar.a);
          gone=true;break}}
      if(BLOCK[e.type]&&BLOCK[e.type](e,ar)){gone=true;break}
      const crit=Math.random()<P.crit;hurtE(e,P.atk*ar.m*(crit?(P.critMul||2):1),crit);if(!ar.siege)ultGain(1.2);if(P.light&&!e.dead&&(G.lc=(G.lc||0)+1)%Math.max(3,7-P.light)===0)lightning(e);
      for(let q=0;q<(crit?7:4);q++)G.fx.push({k:'chunk',x:ar.x,y:ar.y,vx:rand(-90,90)-ar.vx*.12,vy:rand(-90,90)-ar.vy*.12,t:rand(.15,.32),r:rand(1.2,2.3),col:ECOL[e.type]});
      if(!e.dead&&!isBoss(e.type)&&e.type!=='plant'&&e.type!=='eyeflower'){const kb=(crit?9:4)*(P.kbm||1);if(P.kbm>1.5)G.fx.push({k:'spark',x:ar.x,y:ar.y,t:.18});(e.kbx=(e.kbx||0)+Math.cos(ar.a)*kb*14,e.kby=(e.kby||0)+Math.sin(ar.a)*kb*14,e.kbf=e.type==='bat'||e.type==='wisp')}
      if(ar.ric>0){const nx=nearest(ar.x,ar.y,ar.hit,200);if(nx){ar.ric--;ar.a=Math.atan2(nx.y-ar.y,nx.x-ar.x);ar.vx=Math.cos(ar.a)*(P.pspd||560);ar.vy=Math.sin(ar.a)*(P.pspd||560);ar.life=1;continue}}
      if(ar.pierce>0){ar.pierce--;continue}
      gone=true;break;
    }
    if(gone)G.arrows.splice(i,1);
  }
  // orbit blades
  for(let i=0;i<P.orbit;i++){const a=G.t*3.6+i*TAU/P.orbit,bx=P.x+Math.cos(a)*(P.storm?60:44),by=P.y-6+Math.sin(a)*(P.storm?60:44);
    for(const e of G.enemies)if(!e.dead&&e.spawn<=0&&!e.hidden&&e.orbCd<=0&&Math.hypot(e.x-bx,e.y-e.z-by)<e.r+9){e.orbCd=.35;hurtE(e,P.atk*.6,false)}}
  updPet(dt);updUlt(dt);
  // enemies
  for(const e of G.enemies)if(!e.dead){if(isBoss(e.type)&&!(e.intro>0)&&e.type!=='mimic'){const bl=G.bossLvl||(G.bossLvl=bossLvl());updEnemy(e,dt*bl.spd);if(!e.dead&&bl.tier>0)bossExtra(e,dt,bl)}else updEnemy(e,dt)}
  for(let i=0;i<G.enemies.length;i++){const a=G.enemies[i];if(a.dead||a.z>4)continue;for(let j=i+1;j<G.enemies.length;j++){const b=G.enemies[j];if(b.dead||b.z>4)continue;
    const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),m=a.r+b.r-4;if(d<m&&d>.01){const p=(m-d)/4,wa=isBoss(a.type)?0:1,wb=isBoss(b.type)?0:1;a.x-=dx/d*p*wa*(wb?1:2);a.y-=dy/d*p*wa*(wb?1:2);b.x+=dx/d*p*wb*(wa?1:2);b.y+=dy/d*p*wb*(wa?1:2)}}}
  G.enemies=G.enemies.filter(e=>!e.dead);
  // hazards
  for(let i=G.eproj.length-1;i>=0;i--){const p=G.eproj[i];trailOf(p);p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.kind==='bubble'){p.x+=Math.cos(G.t*4+(p.ph||0))*24*dt;p.y+=Math.sin(G.t*3+(p.ph||0))*10*dt}
    const hk=G.rocks.find(k=>Math.hypot(k.x-p.x,k.y-p.y)<k.r+p.r*.5);if(hk){hk.hit=.1;G.fx.push({k:'puff',x:p.x,y:p.y,vx:0,vy:-6,t:.3,r:4});for(let q=0;q<3;q++){const an=rand(0,TAU);G.debris.push({x:p.x,y:p.y,z:8,vx:Math.cos(an)*60,vy:Math.sin(an)*40,vz:rand(60,120),col:stonePal().mid,s:1.6,rot:0,vr:9,life:1})}}
    let gone=p.life<=0||p.x<L||p.x>R||p.y<TOP||p.y>BOT||!!hk;
    if(!gone&&Math.hypot(P.x-p.x,P.y-6-p.y)<P.r+p.r-3&&P.inv<=0&&P.dashT<=0){hurtP(p.dmg);gone=true}
    if(gone)G.eproj.splice(i,1)}
  for(let i=G.waves.length-1;i>=0;i--){const w=G.waves[i];w.r+=210*dt;
    if(!w.hit&&Math.abs(Math.hypot(P.x-w.x,P.y-w.y)-w.r)<10&&P.inv<=0&&P.dashT<=0){w.hit=true;hurtP(w.dmg)}if(w.r>w.max)G.waves.splice(i,1)}
  for(let i=G.zones.length-1;i>=0;i--){const z=G.zones[i];z.t-=dt;
    if(z.kind==='frost'||z.kind==='slime'){if(Math.hypot(P.x-z.x,P.y-z.y)<z.r&&P.dashT<=0)P.mire=Math.max(P.mire||0,.2);if(z.t<=0)G.zones.splice(i,1);continue}
    if(Math.hypot(P.x-z.x,P.y-z.y)<z.r&&P.dashT<=0&&P.poisonCd<=0&&G.state!=='dead'&&!(z.kind==='fire'&&P.fireRes)){G.bossDmg=true;P.poisonCd=.5;const zd=z.kind==='fire'?Math.round(4*Math.min(2,DMG())):5;P.hp-=zd;text(P.x,P.y-40,'-'+zd,z.kind==='fire'?'#ff8a3c':'#b06ad8',13);if(P.hp<=0)die()}
    if(z.t<=0)G.zones.splice(i,1)}
  for(let i=G.bands.length-1;i>=0;i--){const b=G.bands[i];
    if(b.warn>0)b.warn-=dt;else{if(b.act===.45){shake(3);sfx('boom');bandBurst(b)}b.act-=dt;
      const inside=b.h?Math.abs(P.y-b.pos)<b.w/2+P.r*.6:Math.abs(P.x-b.pos)<b.w/2+P.r*.6;if(inside&&!b.hit&&P.inv<=0&&P.dashT<=0){b.hit=true;hurtP(18)}
      if(b.act<=0)G.bands.splice(i,1)}}
  for(let i=G.boulders.length-1;i>=0;i--){const b=G.boulders[i];b.t+=dt;
    if(b.t>=b.dur){G.boulders.splice(i,1);shake(3);dustRing(b.tx,b.ty,10);stamp('crater',b.tx,b.ty,16);vfxBlast(b.tx,b.ty,b.kind==='anvil'?'255,170,70':'230,210,180',46,{debris:b.kind==='anvil'?'lava':'stone',n:10,sparks:b.kind==='anvil'?18:6,dust:8,cracks:b.kind==='anvil'?22:14});
      if(Math.hypot(P.x-b.tx,P.y-b.ty)<24)hurtP(b.kind==='anvil'?Math.round(20*DMG()):16);if(b.kind==='anvil'&&AU.ctx&&AU.on.sfx)vAnvil(null,AU.ctx.currentTime,.12,600);
      if(Math.hypot(P.x-b.tx,P.y-b.ty)>30&&G.rocks.filter(k=>k.temp).length<6&&!G.rocks.some(k=>Math.hypot(k.x-b.tx,k.y-b.ty)<k.r+16)){G.rocks.push({x:b.tx,y:b.ty,r:15,seed:Math.random()*10,temp:true,life:9,kind:b.kind==='anvil'?'anvil':'boulder'});fields={}}}}
  updHazards2(dt);updLobs(dt);updTwinChests(dt);
  if(G.meteorRain&&G.state==='play'&&G.enemies.length){G.mrT=(G.mrT==null?4:G.mrT)-dt;if(G.mrT<=0){G.mrT=rand(3.2,4.6);meteor(P.x+rand(-50,50),P.y+rand(-50,50),0,28,14)}}
  for(const k of G.rocks)if(k.temp)k.life-=dt;
  const nr=G.rocks.length;G.rocks=G.rocks.filter(k=>!k.temp||k.life>0);if(G.rocks.length!==nr)fields={};
  for(const k in fields)fields[k].t-=dt;
  // coins & hearts
  const magnet=G.state!=='play'&&!G.goldRun;
  for(let i=G.coins.length-1;i>=0;i--){const c=G.coins[i];c.t+=dt;
    if(magnet&&c.t>.35){const dx=P.x-c.x,dy=P.y-c.y,d=Math.hypot(dx,dy)||1,sp=200+c.t*300;c.x+=dx/d*sp*dt;c.y+=dy/d*sp*dt}
    else{c.x+=c.vx*dt;c.y+=c.vy*dt;c.vx*=.9;c.vy*=.9;c.x=clamp(c.x,L+6,R-6);c.y=clamp(c.y,TOP+6,BOT-6)}
    if(Math.hypot(P.x-c.x,P.y-c.y)<16&&c.t>.3){const v=c.gr?1:(1+Math.floor(effRoom()/5))*(G.dark?2:1);G.gold+=v;if(G.goldRun)G.goldRun.got+=v;G.coins.splice(i,1);sfx('coin')}}
  for(let i=G.gems.length-1;i>=0;i--){const g=G.gems[i];g.t+=dt;
    if(g.z>0||g.vz>0){g.vz-=520*dt;g.z+=g.vz*dt;g.x+=g.vx*dt;g.y+=g.vy*dt;if(g.z<=0){g.z=0;if(Math.abs(g.vz)>70){g.vz=-g.vz*.38;g.vx*=.6;g.vy*=.6;sfx('click',0,g.x)}else g.vz=0}}
    g.x=clamp(g.x,L+8,R-8);g.y=clamp(g.y,TOP+8,BOT-8);
    const dx=P.x-g.x,dy=P.y-g.y,d=Math.hypot(dx,dy)||1;
    if(g.t>.6&&(magnet||d<48)){const sp=magnet?220+g.t*200:160;g.x+=dx/d*sp*dt;g.y+=dy/d*sp*dt}
    if(d<16&&g.t>.6){G.gemsRun++;G.gems.splice(i,1);sfx('gem',0,g.x);text(P.x,P.y-44,'+1','#8fe8ff',15);for(let q=0;q<6;q++)G.fx.push({k:'spark',x:g.x+rand(-6,6),y:g.y-8+rand(-6,6),t:.25})}}
  for(let i=G.hearts.length-1;i>=0;i--){const h=G.hearts[i];h.t+=dt;if(Math.hypot(P.x-h.x,P.y-h.y)<18){const v=Math.round(P.maxhp*.15);P.hp=Math.min(P.maxhp,P.hp+v);text(P.x,P.y-40,'+'+v,'#7bbf4a',16);G.hearts.splice(i,1);sfx('heal')}}
  for(const f of G.fx){f.t-=dt;if(f.vx!==undefined){if(f.g)f.vy+=f.g*dt;f.x+=f.vx*dt;f.y+=f.vy*dt;const dk=f.g?.985:.92;f.vx*=dk;f.vy*=f.g?1:.92}}
  updEnv(dt);updOrbs(dt);if(G.event)updEvent(dt);
  G.fx=G.fx.filter(f=>f.t>0);
  for(const t of G.texts){t.life-=dt;t.y-=40*dt}G.texts=G.texts.filter(t=>t.life>0);
  G.shake=Math.max(0,G.shake-dt*30);
  // room flow
  AU.intT=INTRO.on||G.state==='play'&&G.enemies.length?1:.12;
  if(G.state==='play'&&G.enemies.length===0){const fin=G.mode!=='inf'&&G.room===ROOMS;if(!fin)sfx('clear');G.state='cleared';G.eproj=[];G.waves=[];G.bands=[];G.boulders=[];G.zones=[];G.meteors=[];G.lines=[];const left=corpseLeft();G.clearT=Math.max(.9,left+.6);onRoomClear();if(!(fin&&left>0))banner(fin?'Vittoria!':'Stanza ripulita')}
  tickCorpses(dt);
  if(G.state==='cleared'&&G.clearT>0){G.clearT-=dt;if(G.clearT<=0){if(G.mode!=='inf'&&G.room===ROOMS&&!G.event)setTimeout(()=>endRun(true),400);else if(ccIsRoom()&&G.ccDone!==G.room)spawnTwinChests();else{G.door=true;banner('La porta è aperta');sfx('door');if(!$('bossBar').classList.contains('dying'))$('bossBar').hidden=true;if(AU.cur&&AU.cur.name==='golem'&&!isBossRoom(G.room))playMusic(musicFor(G.room))}}}
  if(G.door&&P.y<TOP-14&&G.state==='cleared'){G.state='trans';G.fadeDir=1;G.fade=0}
}

// ---------- drawing primitives ----------
function circ(x,y,r){ctx.beginPath();ctx.arc(x,y,r,0,TAU)}
function ell(x,y,rx,ry,rot){ctx.beginPath();ctx.ellipse(x,y,rx,ry,rot||0,0,TAU)}
function ink(w){ctx.strokeStyle=INK;ctx.lineWidth=w||2.5;ctx.lineJoin='round';ctx.lineCap='round'}
function fs(c){ctx.fillStyle=c;ctx.fill();ctx.stroke()}
let noShadow=false;const HASF=typeof CanvasRenderingContext2D!=='undefined'&&'filter' in CanvasRenderingContext2D.prototype;
function shadow(x,y,rx,ry,a){if(noShadow)return;ctx.fillStyle=`rgba(0,0,0,${a||.32})`;ell(x,y,rx,ry);ctx.fill()}

// 8-direction facing: E, SE, S, SW, W, NW, N, NE  ->  view + horizontal flip
const Q8=a=>((Math.round(a/(Math.PI/4))%8)+8)%8;
const VIEWS=[['side',1],['s34',1],['s',1],['s34',-1],['side',-1],['n34',-1],['n',1],['n34',1]];
function basis(face){const d=Q8(face),[v,f]=VIEWS[d],qa=d*Math.PI/4,lx=Math.cos(qa)*f,ly=Math.sin(qa);
  return{d,v,f,qa,lx,ly,la:Math.atan2(ly,lx),back:v==='n'||v==='n34',side:v==='side',front:v==='s'||v==='s34'}}

