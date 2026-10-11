// ---------- enemy AI ----------
function golemUpd(e,dt,a){
  if(!e.p2&&e.hp<e.max*.5){e.p2=true;banner('Il Golem si infuria!','Fase 2',1.6);bossRage(e,'255,122,46');$('bossBar').classList.add('rage');shake(8);sfx('boom')}
  const sp=e.p2?1.3:1,seq=['leap','throw','roll','throw','leap','roll'];e.stT-=dt*sp;
  if(e.st==='walk'){const na=navAngle(e);e.face=na;e.moving=true;e.walk+=dt*6;e.stepT=(e.stepT||0)-dt;if(e.stepT<=0){e.stepT=.42;stepFx(e.x,e.y+4,true);G.shake=Math.max(G.shake,1.5)}moveCircle(e,Math.cos(na)*36*sp*dt,Math.sin(na)*36*sp*dt);
    if(e.stT<=0){e.moving=false;e.st=seq[e.si++%seq.length];e.sub='a';e.stT=e.st==='leap'?.5:e.st==='throw'?.6:.7;
      if(e.st==='leap'){e.sx=e.x;e.sy=e.y;e.tx=clamp(P.x,L+e.r,R-e.r);e.ty=clamp(P.y,TOP+e.r,BOT-e.r)}
      if(e.st==='roll')e.ra=a}}
  else if(e.st==='leap'){
    if(e.sub==='a'){e.face=Math.atan2(e.ty-e.y,e.tx-e.x);if(e.stT<=0){e.sub='air';e.stT=.9}}
    else{const p=clamp(1-e.stT/.9,0,1);e.x=e.sx+(e.tx-e.sx)*p;e.y=e.sy+(e.ty-e.sy)*p;e.z=Math.sin(p*Math.PI)*95;
      if(e.stT<=0){e.z=0;moveCircle(e,0,0);G.waves.push({x:e.x,y:e.y,r:e.r,max:e.p2?320:240,dmg:16,hit:false});
        if(Math.hypot(P.x-e.x,P.y-e.y)<e.r+16)hurtP(26);stamp('crater',e.x,e.y,36);vfxBlast(e.x,e.y,'255,210,140',110,{debris:'stone',n:26,cracks:58,sparks:18,dust:18});
        if(e.p2)for(let i=0;i<10;i++)shootE(e.x,e.y-10,i*TAU/10,150,7,12,'orb');
        shake(9);sfx('boom');dustRing(e.x,e.y);toWalk(e)}}}
  else if(e.st==='throw'){
    if(e.sub==='a'){e.face=a;if(e.stT<=0){const n=e.p2?4:3;
      for(let i=0;i<n;i++){const tx=clamp(P.x+(i?rand(-75,75):0),L+20,R-20),ty=clamp(P.y+(i?rand(-75,75):0),TOP+20,BOT-20);
        G.boulders.push({sx:e.x+Math.cos(a)*24,sy:e.y-30,tx,ty,t:-i*.14,dur:.95})}
      e.sub='b';e.stT=.5;sfx('dash')}}
    else if(e.stT<=0)toWalk(e)}
  else if(e.st==='roll'){
    if(e.sub==='a'){if(e.stT>.25)e.ra=a;e.face=e.ra;if(e.stT<=0){e.sub='roll';e.stT=2.6;e.vx=Math.cos(e.ra)*330;e.vy=Math.sin(e.ra)*330;e.bounces=e.p2?4:3}}
    else if(e.sub==='roll'){
      e.spin+=dt*14*sp;e.x+=e.vx*dt*sp;e.y+=e.vy*dt*sp;let hit=false;if(Math.random()<.7)fxPush({k:'puff',x:e.x+rand(-12,12),y:e.y+e.r*.4,vx:-e.vx*.12,vy:-e.vy*.12-12,t:.5,r:rand(5,10)});
      if(e.x<L+e.r){e.x=L+e.r;e.vx=Math.abs(e.vx);hit=true}if(e.x>R-e.r){e.x=R-e.r;e.vx=-Math.abs(e.vx);hit=true}
      if(e.y<TOP+e.r){e.y=TOP+e.r;e.vy=Math.abs(e.vy);hit=true}if(e.y>BOT-e.r){e.y=BOT-e.r;e.vy=-Math.abs(e.vy);hit=true}
      for(const k of G.rocks){const ex=e.x-k.x,ey=e.y-k.y,dd=Math.hypot(ex,ey),m=e.r+k.r;
        if(dd<m&&dd>.01){if(k.temp){k.life=0;dustRing(k.x,k.y,8);continue}const nx=ex/dd,ny=ey/dd;e.x=k.x+nx*m;e.y=k.y+ny*m;const dot=e.vx*nx+e.vy*ny;if(dot<0){e.vx-=2*dot*nx;e.vy-=2*dot*ny}hit=true}}
      if(hit){e.bounces--;shake(4);sfx('boom');vfxBlast(e.x,e.y,'230,210,180',50,{sparks:8,debris:'stone',n:8,dust:6,ring2:false});if(e.p2)for(let i=0;i<5;i++)shootE(e.x,e.y-10,rand(0,TAU),120,6,10,'orb')}
      e.face=Math.atan2(e.vy,e.vx);
      if(e.bounces<=0||e.stT<=0){e.sub='c';e.stT=.5}}
    else if(e.stT<=0)toWalk(e)}
}
function witchUpd(e,dt,a){
  if(!e.p2&&e.hp<e.max*.5){e.p2=true;banner('La Strega si risveglia','Fase 2',1.6);bossRage(e,'123,240,192');$('bossBar').classList.add('rage');shake(8);sfx('boom')}
  e.face=a;e.stT-=dt;e.walk+=dt;
  if(e.p2){e.orb+=dt*1.7;for(let i=0;i<4;i++){const an=e.orb+i*TAU/4,tx=e.x+Math.cos(an)*60,ty=e.y-12+Math.sin(an)*60;if(Math.hypot(P.x-tx,P.y-6-ty)<P.r+7)hurtP(14)}}
  const seq=e.p2?['spiral','roots','blink','summon','spiral','roots','blink']:['spiral','roots','blink','spiral','summon','roots'];
  if(e.st==='walk'){
    if(!e.anchor)e.anchor={x:rand(L+60,R-60),y:rand(TOP+70,TOP+250*AH/VH)};
    const dx=e.anchor.x-e.x,dy=e.anchor.y-e.y,dd=Math.hypot(dx,dy);e.moving=dd>4;if(dd>4){e.x+=dx/dd*70*dt;e.y+=dy/dd*70*dt}
    if(e.stT<=0){e.anchor=null;e.st=seq[e.si++%seq.length];e.sub='a';
      if(e.st==='spiral'){e.stT=2.6;e.fireT=0}else if(e.st==='roots'){e.stT=1.8;makeBands(e)}else if(e.st==='blink')e.stT=.45;else e.stT=.6}}
  else if(e.st==='spiral'){e.fireT-=dt;if(e.fireT<=0){e.fireT=.1;const arms=e.p2?3:2;for(let k=0;k<arms;k++)shootE(e.x,e.y-14,e.rot+k*TAU/arms,125,6,11,'thorn');e.rot+=.23}if(e.stT<=0)toWalk(e)}
  else if(e.st==='roots'){if(e.stT<=0)toWalk(e)}
  else if(e.st==='blink'){
    if(e.sub==='a'){e.hidden=e.stT<.25;if(e.stT<=0){let tx=e.x,ty=e.y;
        for(let i=0;i<14;i++){const an=rand(0,TAU);tx=P.x+Math.cos(an)*130;ty=P.y+Math.sin(an)*130;if(tx>L+30&&tx<R-30&&ty>TOP+30&&ty<BOT-30)break}
        vfxBlast(e.x,e.y-14,'123,240,192',40,{sparks:0,spore:12,dust:0,ring2:false});e.x=clamp(tx,L+30,R-30);e.y=clamp(ty,TOP+30,BOT-30);e.sub='b';e.stT=.55;e.hidden=true}}
    else{e.hidden=e.stT>.2;if(e.stT<=0){e.hidden=false;vfxBlast(e.x,e.y-14,'123,240,192',70,{sparks:10,spcol:PAL.spore,spore:16,dust:0,debris:'leaf',n:10});const k=e.p2?16:12;for(let i=0;i<k;i++)shootE(e.x,e.y-14,i*TAU/k,140,7,12,'orb');toWalk(e)}}}
  else if(e.st==='summon'){if(e.stT<=0){for(let i=0;i<2;i++){const sx=clamp(e.x+(i?55:-55),L+20,R-20),sy=clamp(e.y+30,TOP+20,BOT-20);G.enemies.push(makeE('wisp',sx,sy,.7));vfxBlast(sx,sy,'138,91,196',36,{sparks:0,spore:8,sporeRgb:'170,120,230',dust:0})}toWalk(e)}}
}
