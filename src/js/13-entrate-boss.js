// ---------- boss entrances: every boss arrives in its own way; nobody can shoot it until it's done ----------
function bossIntro(e,dt,a){const T=BOSS_INTRO[e.type]||1.6;if(e.iT==null){e.iT=0;e.iStep=0}const t0=e.iT;e.iT+=dt;const t=e.iT,at=s=>t0<s&&t>=s;e.intro=Math.max(0,T-t);e.face=a;
  const roar=()=>{sfx('roar');vib([60,40,120]);shake(6);for(let i=0;i<3;i++)setTimeout(()=>{if(G&&G.fx)fxPush({k:'ring2',x:e.x,y:e.y-e.r,rgb:'255,255,255',r0:e.r,r1:e.r*5,t:.45,max:.45,w:6-i*1.5})},i*170)};
  if(e.type==='golem'){// drops from the ceiling, cracks the floor, then roars
    const wait=.75,fall=1.15;if(t<wait)e.z=1200;else if(t<fall){const k=(t-wait)/(fall-wait);e.z=1200*(1-k*k*k)}else e.z=0;
    if(t0===0){sfx('quake');fallingPebbles(8);shake(2)}
    if(t<wait&&Math.random()<.35)fallingPebbles(1);
    if(at(.4))shake(3);
    if(at(wait))sfx('incoming');
    if(at(fall)){shake(18);G.hitstop=Math.max(G.hitstop||0,.12);sfx('boom');setTimeout(()=>sfx('boom'),70);vib([140,50,200]);dustRing(e.x,e.y,36);
      vfxBlast(e.x,e.y,'210,200,180',150,{debris:'stone',n:40,dust:34,sparks:14});fxPush({k:'flash',x:e.x,y:e.y-10,r:e.r*6,rgb:'255,245,220',t:.25,max:.25});
      for(let i=0;i<3;i++)setTimeout(()=>{if(G&&G.fx)fxPush({k:'ring2',x:e.x,y:e.y,rgb:'230,215,190',r0:e.r,r1:e.r*(4+i*2.2),t:.5+i*.1,max:.5+i*.1,w:9-i*2.5})},i*90);
      stamp('crater',e.x,e.y+4,e.r*1.9);stamp('crater',e.x+e.r*.9,e.y+8,e.r*.8);stamp('crater',e.x-e.r*1.1,e.y+2,e.r*.7);fallingPebbles(16);
      for(const k of G.rocks)if(Math.hypot(k.x-e.x,k.y-e.y)<200&&!k.temp){k.hit=.2;k.dmg=(k.dmg||0)+2}
      if(Math.hypot(P.x-e.x,P.y-e.y)<220)P.inv=Math.max(P.inv,.1)}
    if(at(1.7))roar()}
  else if(e.type==='witch'){// rises out of the ground among roots and spores
    e.em=Math.min(1,Math.max(0,(t-.55)/1.25));e.hole=Math.min(1,t/.45);
    if(t0===0){sfx('creep',0,e.x);shake(3);stamp('crater',e.x,e.y+2,e.r*1.3)}
    if(at(.55)){shake(5);vfxBlast(e.x,e.y,'123,240,192',90,{debris:'leaf',n:22,sparks:0,spore:22,dust:14})}
    if(t>.5&&t<1.8&&Math.random()<.6)fxPush({k:'puff',x:e.x+rand(-26,26),y:e.y+rand(-4,6),vx:rand(-30,30),vy:rand(-40,-10),t:rand(.3,.6),r:rand(4,8)});
    if(t>.5&&t<1.8&&Math.random()<.3)fxPush({k:'spore',x:e.x+rand(-22,22),y:e.y-rand(0,30),vx:rand(-10,10),vy:rand(-40,-15),t:.8,max:.8,r:5,rgb:'123,240,192'});
    if(at(1.95)){sfx('shimmer',2);roar()}}
  else if(e.type==='salamander'){// erupts out of a lava pool
    e.em=Math.min(1,Math.max(0,(t-.6)/.7));e.hole=Math.min(1,t/.4);if(t0===0){addZone(e.x,e.y,46,1.9,'fire');sfx('creep',1,e.x);shake(3)}
    if(at(.6)){sfx('boom');shake(8);vfxBlast(e.x,e.y,'255,130,50',100,{debris:'lava',n:20,fire:14,sparks:16,dust:8})}
    if(at(1.5))roar()}
  else if(e.type==='smith'){// steps out of a pillar of fire and slams his hammer
    e.fa=Math.min(1,Math.max(0,(t-.45)/.6));if(t0===0){sfx('creep',2,e.x);vfxBlast(e.x,e.y-30,'255,150,60',90,{fire:18,sparks:10,dust:0})}
    if(t<.9&&Math.random()<.8)fxPush({k:'firep',x:e.x+rand(-18,18),y:e.y-rand(0,90),r:rand(6,12),t:.4,max:.4});
    if(at(1.05)){sfx('boom');shake(10);vib([80,40,80]);vfxBlast(e.x,e.y+6,'255,170,70',95,{debris:'stone',n:16,sparks:22,dust:16});stamp('crater',e.x,e.y+6,e.r)}
    if(at(1.35))roar()}
  else if(bossIntro3(e,t,t0,at,roar)){}
  else{if(t0===0)sfx('roar')}
  if(e.intro<=0){e.z=0;e.em=null;e.fa=null;e.hole=0;e.yy=null;e.wallY=null;if(e.type==='mimic'){shake(7);sfx('boom');dustRing(e.x,e.y);vib([60,40,90])}}}
// the extra move of the high-tier bosses: a warned ring of orbs (and, in the top tier, an aimed fan too)
function bossExtra(e,dt,bl){if(G.state!=='play'||e.hidden||e.z>10)return;e.xT=(e.xT==null?3.5:e.xT)-dt;
  if(e.xWarn>0){e.xWarn-=dt;if(e.xWarn<=0){const n=bl.tier>1?14:10,o=rand(0,TAU);for(let i=0;i<n;i++)shootE(e.x,e.y-14,o+i*TAU/n,130,7,12,'orb');
      if(bl.tier>1){const a=Math.atan2(P.y-e.y,P.x-e.x);for(const k of[-.25,0,.25])shootE(e.x,e.y-14,a+k,175,7,12,'orb')}
      if(!LOWFX)fxPush({k:'ring2',x:e.x,y:e.y-10,rgb:'255,120,200',r0:10,r1:90,t:.4,max:.4,w:8});sfx('boom');shake(3)}return}
  if(e.xT<=0){e.xT=bl.tier>1?4.5:6.5;e.xWarn=.7;sfx('shimmer',1)}}
function updEnemy(e,dt){
  e.t+=dt;e.flash=Math.max(0,e.flash-dt);e.orbCd-=dt;if(e.kbx||e.kby){const f=Math.exp(-dt*14);moveCircle(e,e.kbx*(1-f)/14,e.kby*(1-f)/14,e.kbf);e.kbx*=f;e.kby*=f;if(Math.abs(e.kbx)+Math.abs(e.kby)<.5)e.kbx=e.kby=0}
  if(e.spawn>0){e.spawn-=dt;return}
  if(e.frozen>0){e.frozen-=dt;e.moving=false;return}
  if(e.root>0){e.root-=dt;e.moving=false;e.rootT=(e.rootT||0)-dt;if(e.rootT<=0){e.rootT=.5;hurtE(e,P.atk*.45,false,true);if(e.dead)return}if(!isBoss(e.type))return}
  const dx=P.x-e.x,dy=P.y-e.y,d=Math.hypot(dx,dy)||1,a=Math.atan2(dy,dx);
  if(e.intro>0){bossIntro(e,dt,a);return}
  if(e.poisonT>0){e.poisonT-=dt;e.pTick=(e.pTick||0)-dt;if(e.pTick<=0){e.pTick=.5;hurtE(e,P.atk*.07*e.poisonS*(P.poison||1),false,true);if(e.dead)return}}else e.poisonS=0;
  if(e.burn>0){e.burn-=dt;e.burnTick-=dt;if(e.burnTick<=0){e.burnTick=.5;hurtE(e,P.atk*.18*(P.burnMul||1),false,true);if(e.dead)return}}
  if(e.slow>0)e.slow-=dt;
  const sm=e.slow>0?.55:1;
  switch(e.type){
    case 'slime':case 'bigslime':case 'magmaslime':
      if(e.jump>0){e.jump-=dt*sm;moveCircle(e,e.vx*dt*sm,e.vy*dt*sm);e.z=Math.sin(clamp(1-e.jump/.5,0,1)*Math.PI)*12;if(e.jump<=0){e.z=0;e.cd=rand(.5,1.1);if(e.type==='magmaslime'){if(e.elite||(e.jn=(e.jn||0)+1)%3===0)addZone(e.x,e.y,e.elite?22:14,1.3,'fire');G.fx.push({k:'puff',x:e.x,y:e.y,vx:0,vy:-8,t:.3,r:6})}else if(e.elite)addZone(e.x,e.y,20,2.4,'acid')}}
      else{const na=navAngle(e);e.face=na;e.cd-=dt*sm*FR();if(e.cd<=0){e.jump=.5;const sp=e.type==='bigslime'?90:e.type==='magmaslime'?110:120;e.vx=Math.cos(na)*sp;e.vy=Math.sin(na)*sp}}
      break;
    case 'bat':{if(e.elite){e.cd-=dt*FR();if(e.cd<=0){e.cd=2.4;shootE(e.x,e.y-14,a,150,6,10,'orb')}}const w=Math.sin(e.t*4)*.9,sp=88*sm;if(d>P.r){e.face=a+w*.6;moveCircle(e,Math.cos(a+w)*sp*dt,Math.sin(a+w)*sp*dt,true)}break}
    case 'goblin':
      if(e.aim>0){e.moving=false;e.aim-=dt;if(e.aim>.25)e.aimA=a;e.face=e.aimA;if(e.aim<=0){for(const off of (e.elite?[-.2,0,.2]:[0]))shootE(e.x,e.y-8,e.aimA+off,300,5,14,'arrow');e.cd=rand(1.6,2.4)}}
      else{
        const los=clearLine(e.x,e.y-8,P.x,P.y-6,6);
        if(!los){const na=navAngle(e);moveCircle(e,Math.cos(na)*62*sm*dt,Math.sin(na)*62*sm*dt);e.face=na;e.moving=true;e.walk+=dt*11;e.cd=Math.max(e.cd,.35)}
        else{
          e.strafeT=Math.max(0,(e.strafeT||0)-dt);
          const mv=e.strafeT>0?0:d<140?-1:d>220?1:0,sa=mv===0?a+Math.PI/2*e.side:a,dir=mv===0?1:mv,sp=55*sm,ox=e.x,oy=e.y;
          moveCircle(e,Math.cos(sa)*dir*sp*dt,Math.sin(sa)*dir*sp*dt);
          if(Math.hypot(e.x-ox,e.y-oy)<sp*dt*.35){if(mv===-1)e.strafeT=.9;else e.side*=-1}
          e.face=Math.atan2(Math.sin(sa)*dir,Math.cos(sa)*dir);e.moving=true;e.walk+=dt*11;
          e.cd-=dt*FR();if(e.cd<=0)e.aim=.75;if(Math.random()<dt*.4)e.side*=-1}}
      break;
    case 'plant':e.face=a;e.cd-=dt*sm*FR();if(e.cd<=0){{const n=e.elite?12:8;for(let i=0;i<n;i++)shootE(e.x,e.y-14,e.rot+i*TAU/n,125,6,10,'orb')};e.rot+=.39;e.cd=2.6}break;
    case 'skeleton':
      if(e.stun>0){e.stun-=dt;e.moving=false;break}
      // crossbow skeleton: keeps its distance and shoots while walking; every 5 s it can dash (sideways, or away when you get close)
      if(e.dashCd==null){e.dashCd=rand(2,4);e.side=Math.random()<.5?-1:1;e.cd=rand(1,1.8)}
      e.dashCd-=dt;
      if(e.lunge>0){e.lunge-=dt;moveCircle(e,Math.cos(e.la)*230*sm*dt,Math.sin(e.la)*230*sm*dt);e.moving=true;e.walk+=dt*16;e.face=a;
        if(!LOWFX&&Math.random()<.5)G.fx.push({k:'puff',x:e.x+rand(-5,5),y:e.y+4,vx:-Math.cos(e.la)*30,vy:-8,t:.3,r:4})}
      else if(e.wind>0){e.moving=false;e.face=a;e.wind-=dt;if(e.wind<=0){e.lunge=.28;e.dashCd=5;sfx('dash')}}
      else{e.face=a;
        if(e.dashCd<=0&&(d<110||Math.random()<dt*.8)){e.la=d<110?a+Math.PI+rand(-.5,.5):a+Math.PI/2*e.side;e.wind=.3;e.side*=-1}
        else{const mv=d<120?-1:d>210?1:0,ma=mv===0?a+Math.PI/2*e.side:mv>0?navAngle(e):a+Math.PI,sp=40*sm,ox=e.x,oy=e.y;
          moveCircle(e,Math.cos(ma)*sp*dt,Math.sin(ma)*sp*dt);if(Math.hypot(e.x-ox,e.y-oy)<sp*dt*.35)e.side*=-1;e.moving=true;e.walk+=dt*8;if(Math.random()<dt*.35)e.side*=-1}
        e.cd-=dt*FR();e.aim=e.cd<.5?e.cd:0;
        if(e.cd<=0){if(clearLine(e.x,e.y,P.x,P.y,4)){shootE(e.x+Math.cos(a)*12,e.y-12+Math.sin(a)*8,a,165,5,12,'arrow');if(e.elite)for(const k of[-.2,.2])shootE(e.x,e.y-12,a+k,165,5,12,'arrow');e.cd=rand(1.7,2.3)}else e.cd=.4}}
      break;
    case 'mushroom':
      if(e.puff>0){e.face=a;e.moving=false;e.puff-=dt;if(e.puff<=0){addZone(e.x,e.y,e.elite?58:40,3.2);vfxBlast(e.x,e.y-6,'176,106,216',40,{sparks:0,spore:12,sporeRgb:'190,130,240',dust:0,ring2:false})}}
      else{const na=navAngle(e);e.face=na;moveCircle(e,Math.cos(na)*28*sm*dt,Math.sin(na)*28*sm*dt);e.moving=true;e.walk+=dt*7;e.cd-=dt*FR();if(e.cd<=0){e.puff=.6;e.cd=rand(3.2,4.2)}}
      break;
    case 'wisp':
      e.face=a;e.phT-=dt;
      if(e.ph==='show'){moveCircle(e,Math.cos(a)*28*sm*dt,Math.sin(a)*28*sm*dt,true);e.alpha=1;if(e.phT<=0){e.ph='fade';e.phT=.45}}
      else if(e.ph==='fade'){e.alpha=e.phT/.45;e.hidden=e.phT<.25;if(e.phT<=0){
          let tx,ty;for(let i=0;i<14;i++){const an=rand(0,TAU),r=rand(110,165);tx=clamp(P.x+Math.cos(an)*r,L+20,R-20);ty=clamp(P.y+Math.sin(an)*r,TOP+20,BOT-20);if(Math.hypot(tx-P.x,ty-P.y)>90&&!G.rocks.some(k=>Math.hypot(k.x-tx,k.y-ty)<k.r+14))break}
          e.tx=tx;e.ty=ty;e.ph='tele';e.phT=.55;e.alpha=0}}
      else if(e.ph==='tele'){e.hidden=true;if(e.phT<=0){e.x=e.tx;e.y=e.ty;e.ph='appear';e.phT=.3}}
      else{e.alpha=1-e.phT/.3;e.hidden=e.phT>.15;if(e.phT<=0){e.hidden=false;e.alpha=1;for(let k=(e.elite?-2:-1);k<=(e.elite?2:1);k++)shootE(e.x,e.y-10,a+k*.22,170,6,10,'orb');e.ph='show';e.phT=rand(1.6,2.4)}}
      break;
    case 'beetle':
      if(e.arm>0){e.moving=false;e.arm-=dt;if(e.arm<=0){explode(e);return}}
      else{const na=navAngle(e);e.face=na;moveCircle(e,Math.cos(na)*62*sm*dt,Math.sin(na)*62*sm*dt);e.moving=true;e.walk+=dt*18;if(d<62&&clearLine(e.x,e.y,P.x,P.y,4))e.arm=.75}
      break;
    case 'golem':golemUpd(e,dt,a);break;
    case 'witch':witchUpd(e,dt,a);break;
    case 'imp':impUpd(e,dt,sm,a,d);break;
    case 'obsidian':obsidUpd(e,dt,sm,a,d);break;
    case 'pyro':pyroUpd(e,dt,sm,a,d);break;
    case 'salamander':salamUpd(e,dt,a,d);break;
    case 'smith':smithUpd(e,dt,a,d);break;
    case 'eyeflower':eyeflowerUpd(e,dt,a,d);break;
    case 'shadoweye':shadoweyeUpd(e,dt,sm,a,d);break;
    case 'mimic':mimicUpd(e,dt,a,d);break;
    default:if(EUPD[e.type])EUPD[e.type](e,dt,sm,a,d);
  }
  if(!e.hidden&&!e.air&&e.z<4&&d<P.r+e.r-2)hurtP(e.cdmg);
}

