// ---------- new enemies ----------
function impUpd(e,dt,sm,a,d){
  e.face=a;const want=d<110?-1:d>175?1:0,sa=want===0?a+Math.PI/2*e.side:a,dir=want===0?1:want;
  moveCircle(e,Math.cos(sa)*dir*78*sm*dt,Math.sin(sa)*dir*78*sm*dt,true);if(Math.random()<dt*.5)e.side*=-1;
  e.cd-=dt*FR();if(e.cd<=0){e.cd=rand(2.3,3.1);const n=e.elite?3:1;for(let k=0;k<n;k++)shootE(e.x,e.y-16,a+(k-(n-1)/2)*.22,165,6,10,'fire')}
}
function obsidUpd(e,dt,sm,a,d){
  if(e.chg>0){e.chg-=dt;const ox=e.x,oy=e.y;moveCircle(e,Math.cos(e.ca)*(e.elite?310:255)*sm*dt,Math.sin(e.ca)*(e.elite?310:255)*sm*dt);e.face=e.ca;e.moving=true;e.walk+=dt*16;
    if(Math.hypot(e.x-ox,e.y-oy)<1)e.chg=0;if(e.chg<=0){e.cd=rand(2.6,3.4);shake(2);stepFx(e.x,e.y+6,true)}}
  else if(e.wind>0){e.wind-=dt;e.moving=false;if(e.wind>.25)e.ca=a;e.face=e.ca;if(e.wind<=0)e.chg=.55}
  else{const na=navAngle(e);e.face=na;moveCircle(e,Math.cos(na)*30*sm*dt,Math.sin(na)*30*sm*dt);e.moving=true;e.walk+=dt*6;
    e.cd-=dt*FR();if(e.cd<=0&&d<210&&clearLine(e.x,e.y,P.x,P.y,e.r*.8))e.wind=.75}
}
function pyroUpd(e,dt,sm,a,d){
  if(e.cast>0){e.cast-=dt;e.face=a;e.moving=false;if(e.cast<=0){const n=e.elite?3:1;for(let k=0;k<n;k++)meteor(P.x+(k?rand(-60,60):0),P.y+(k?rand(-60,60):0),k*.15);e.cd=rand(2.6,3.4)}return}
  const los=clearLine(e.x,e.y-8,P.x,P.y-6,6);
  if(!los){const na=navAngle(e);moveCircle(e,Math.cos(na)*55*sm*dt,Math.sin(na)*55*sm*dt);e.face=na;e.moving=true;e.walk+=dt*10;e.cd=Math.max(e.cd,.4);return}
  const mv=d<150?-1:d>230?1:0,sa=mv===0?a+Math.PI/2*e.side:a,dir=mv===0?1:mv,ox=e.x,oy=e.y;
  moveCircle(e,Math.cos(sa)*dir*48*sm*dt,Math.sin(sa)*dir*48*sm*dt);if(Math.hypot(e.x-ox,e.y-oy)<48*dt*.3)e.side*=-1;
  e.face=a;e.moving=true;e.walk+=dt*9;e.cd-=dt*FR();if(e.cd<=0)e.cast=.65;
}
function salamUpd(e,dt,a,d){
  if(!e.p2&&e.hp<e.max*.5){e.p2=true;banner('La Salamandra ribolle','Fase 2',1.6);bossRage(e,'255,110,40');$('bossBar').classList.add('rage');shake(8);sfx('roar')}
  if(!e.trail)e.trail=[{x:e.x,y:e.y}];const lt=e.trail[e.trail.length-1];if(Math.hypot(lt.x-e.x,lt.y-e.y)>3){e.trail.push({x:e.x,y:e.y});if(e.trail.length>70)e.trail.shift()}
  const sp=e.p2?1.25:1;e.stT-=dt*sp;e.fireT=(e.fireT||0)-dt;
  const trailFire=()=>{if(e.fireT<=0&&!e.hidden){e.fireT=e.p2?.12:.2;addZone(e.x,e.y,13,e.p2?2.6:1.8,'fire')}};
  const seq=e.p2?['spit','burrow','circle','spit','burrow']:['spit','burrow','spit','circle'];
  if(e.st==='walk'){const ang=a+Math.sin(G.t*3)*.6;e.face=ang;moveCircle(e,Math.cos(ang)*80*sp*dt,Math.sin(ang)*80*sp*dt);e.moving=true;trailFire();
    if(e.stT<=0){e.st=seq[e.si++%seq.length];e.sub='a';e.stT=e.st==='spit'?.5:e.st==='burrow'?.5:3;e.n=e.p2?3:2;e.ca=Math.atan2(e.y-(TOP+BOT)/2,e.x-AW/2)}}
  else if(e.st==='spit'){e.face=a;if(e.stT<=0){const k=e.p2?7:5;for(let i=0;i<k;i++)shootE(e.x,e.y-10,a+(i-(k-1)/2)*.15,175,7,12,'fire');sfx('dash');e.n--;e.stT=.45;if(e.n<=0)toWalk(e)}}
  else if(e.st==='burrow'){
    if(e.sub==='a'){e.hidden=e.stT<.25;if(e.stT<=0){let tx=P.x,ty=P.y;for(let i=0;i<12;i++){const an=rand(0,TAU);tx=clamp(P.x+Math.cos(an)*90,L+30,R-30);ty=clamp(P.y+Math.sin(an)*90,TOP+30,BOT-30);if(!G.rocks.some(k=>Math.hypot(k.x-tx,k.y-ty)<k.r+30))break}
      e.tx=tx;e.ty=ty;e.sub='under';e.stT=.9;e.hidden=true;dustRing(e.x,e.y,10)}}
    else if(e.sub==='under'){e.hidden=true;if(e.stT<=0){e.x=e.tx;e.y=e.ty;e.trail=[{x:e.x,y:e.y}];e.hidden=false;const k=e.p2?16:12;for(let i=0;i<k;i++)shootE(e.x,e.y-8,i*TAU/k,150,7,12,'fire');
      if(Math.hypot(P.x-e.x,P.y-e.y)<46)hurtP(Math.round(22*DMG()));shake(7);sfx('boom');stamp('crater',e.x,e.y,26);vfxBlast(e.x,e.y,'255,120,40',85,{debris:'lava',n:22,fire:14,sparks:18,cracks:40});addZone(e.x,e.y,26,2.2,'fire');toWalk(e)}}}
  else if(e.st==='circle'){e.ca+=dt*1.8*sp;const tx=AW/2+Math.cos(e.ca)*130,ty=(TOP+BOT)/2+Math.sin(e.ca)*170,dx=tx-e.x,dy=ty-e.y,dd=Math.hypot(dx,dy)||1;
    const v=Math.min(dd,230*dt);moveCircle(e,dx/dd*v,dy/dd*v);e.face=Math.atan2(dy,dx);e.moving=true;e.fireT=Math.min(e.fireT,.06);trailFire();
    if(e.stT<=0){for(let i=0;i<10;i++)shootE(e.x,e.y-8,i*TAU/10+G.t,140,7,12,'fire');toWalk(e)}}
}
function smithUpd(e,dt,a,d){
  if(!e.p2&&e.hp<e.max*.5){e.p2=true;banner('Il Fabbro si infiamma','Fase 2',1.6);bossRage(e,'255,170,70');$('bossBar').classList.add('rage');shake(8);sfx('roar')}
  const sp=e.p2?1.2:1,seq=e.p2?['slam','rain','anvil','slam','rain','imps']:['slam','anvil','slam','imps'];e.stT-=dt*sp;
  if(e.st==='walk'){const na=navAngle(e);e.face=na;e.moving=true;e.walk+=dt*5;moveCircle(e,Math.cos(na)*(e.p2?52:42)*dt,Math.sin(na)*(e.p2?52:42)*dt);
    e.stepT=(e.stepT||0)-dt;if(e.stepT<=0){e.stepT=.5;stepFx(e.x,e.y+8,true);G.shake=Math.max(G.shake,1.5)}
    if(e.stT<=0){e.moving=false;e.st=seq[e.si++%seq.length];e.sub='a';
      if(e.st==='slam'){e.stT=.85;e.ca=a;e.sx=e.x+Math.cos(a)*44;e.sy=e.y+Math.sin(a)*44;const n=e.p2?5:3;for(let i=0;i<n;i++)G.lines.push({x:e.sx,y:e.sy,a:a+(i-(n-1)/2)*.45,len:300,w:22,warn:.85,act:.45,hit:false})}
      else e.stT=.6}}
  else if(e.st==='slam'){e.face=e.ca;if(e.sub==='a'&&e.stT<=0){e.sub='b';e.stT=.5;G.waves.push({x:e.sx,y:e.sy,r:10,max:200,dmg:Math.round(16*DMG()),hit:false});
      if(Math.hypot(P.x-e.sx,P.y-e.sy)<62)hurtP(Math.round(26*DMG()));shake(9);sfx('boom');stamp('crater',e.sx,e.sy,40);dustRing(e.sx,e.sy,16);vfxBlast(e.sx,e.sy,'255,180,80',105,{debris:'lava',n:24,sparks:32,cracks:60,fire:8})}
    else if(e.sub==='b'&&e.stT<=0)toWalk(e)}
  else if(e.st==='anvil'){e.face=a;if(e.stT<=0){const n=e.p2?5:3;for(let i=0;i<n;i++)G.boulders.push({sx:e.x,sy:e.y-40,tx:clamp(P.x+(i?rand(-80,80):0),L+20,R-20),ty:clamp(P.y+(i?rand(-80,80):0),TOP+20,BOT-20),t:-i*.12,dur:1,kind:'anvil'});sfx('dash');e.stT=.5;e.st='rec'}}
  else if(e.st==='rec'){if(e.stT<=0)toWalk(e)}
  else if(e.st==='imps'){if(e.stT<=0){if(G.enemies.filter(o=>o.type==='imp').length<4)for(let i=0;i<2;i++)G.enemies.push(makeE('imp',clamp(e.x+(i?60:-60),L+20,R-20),clamp(e.y+20,TOP+20,BOT-20),.7));toWalk(e)}}
  else if(e.st==='rain'){if(e.stT<=0){for(let i=0;i<9;i++)meteor(P.x+rand(-110,110),P.y+rand(-110,110),i*.12,28,16);meteor(P.x,P.y,.2,30,18);toWalk(e)}}
}
