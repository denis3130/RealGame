// ---------------- chapter 4 bosses ----------------
EUPD.yeti=(e,dt,sm,a,d)=>{
  if(!e.p2&&e.hp<e.max*.5){e.p2=true;banner('Lo Yeti scatena la valanga','Fase 2',1.6);bossRage(e,'200,230,255');$('bossBar').classList.add('rage');shake(8);sfx('roar',0,e.x)}
  const sp=e.p2?1.25:1,seq=e.p2?['pound','snowball','leap','avalanche','pound','roar']:['pound','snowball','leap','pound','roar','snowball'];e.stT-=dt*sp;
  if(e.st==='walk'){const na=navAngle(e);e.face=na;e.moving=true;e.walk+=dt*6;e.stepT=(e.stepT||0)-dt;if(e.stepT<=0){e.stepT=.45;stepFx(e.x,e.y+6,true);G.shake=Math.max(G.shake,1.5)}moveCircle(e,Math.cos(na)*44*sp*dt,Math.sin(na)*44*sp*dt);
    if(e.stT<=0){e.moving=false;e.st=seq[e.si++%seq.length];e.sub='a';e.stT=e.st==='pound'?.65:e.st==='snowball'?.7:e.st==='leap'?.45:e.st==='roar'?.4:.6;
      if(e.st==='leap'){e.sx=e.x;e.sy=e.y;e.tx=clamp(P.x,L+e.r,R-e.r);e.ty=clamp(P.y,TOP+e.r,BOT-e.r)}if(e.st==='roar')sfx('roar',0,e.x)}}
  else if(e.st==='pound'){e.face=a;if(e.sub==='a'){if(e.stT<=0){e.sub='b';e.stT=.45;G.waves.push({x:e.x,y:e.y,r:e.r,max:e.p2?260:200,dmg:Math.round(15*DMG()),hit:false,rgb:'200,230,255'});if(Math.hypot(P.x-e.x,P.y-e.y)<e.r+24)hurtP(Math.round(24*DMG()));
      const n=e.p2?9:6;for(let i=0;i<n;i++){const tx=P.x+(i?rand(-110,110):0),ty=P.y+(i?rand(-110,110):0);lob(tx,ty,tx,ty,{kind:'icicle',dur:.85+i*.08,r:20,dmg:16,h:0})}
      stamp('crater',e.x,e.y+4,38);vfxBlast(e.x,e.y,'220,240,255',110,{debris:['#ffffff','#e0ecf4','#c8d8e6'],n:24,sparks:10,spcol:['#ffffff','#c9f3ff'],dust:18});shake(10);sfx('boom',0,e.x);fallingPebbles(6)}}
    else if(e.stT<=0)toWalk(e)}
  else if(e.st==='snowball'){e.face=a;if(e.sub==='a'){if(e.stT<=0){const n=e.p2?2:1;for(let i=0;i<n;i++){const an=a+(i-(n-1)/2)*.5;G.rollers.push({x:e.x+Math.cos(an)*34,y:e.y+Math.sin(an)*20,vx:Math.cos(an)*195,vy:Math.sin(an)*195,r:12,max:26,life:4.6,b:e.p2?3:2,dmg:20,rot:0})}sfx('snowball',2,e.x);e.sub='b';e.stT=.45}}else if(e.stT<=0)toWalk(e)}
  else if(e.st==='leap'){if(e.sub==='a'){e.face=Math.atan2(e.ty-e.y,e.tx-e.x);if(e.stT<=0){e.sub='air';e.stT=.85;sfx('dash',0,e.x)}}
    else{const p=clamp(1-e.stT/.85,0,1);e.x=e.sx+(e.tx-e.sx)*p;e.y=e.sy+(e.ty-e.sy)*p;e.z=Math.sin(p*Math.PI)*115;
      if(e.stT<=0){e.z=0;moveCircle(e,0,0);G.waves.push({x:e.x,y:e.y,r:e.r,max:e.p2?300:240,dmg:Math.round(16*DMG()),hit:false,rgb:'200,230,255'});if(Math.hypot(P.x-e.x,P.y-e.y)<e.r+16)hurtP(Math.round(26*DMG()));
        const n=e.p2?14:10;for(let i=0;i<n;i++)shootE(e.x,e.y-10,i*TAU/n,150,6,12,'ice');addZone(e.x,e.y,50,3,'frost');stamp('crater',e.x,e.y,36);
        vfxBlast(e.x,e.y,'220,240,255',110,{debris:['#ffffff','#e0ecf4','#c8d8e6'],n:26,sparks:14,spcol:['#ffffff','#c9f3ff'],dust:18,cracks:40});shake(9);sfx('boom',0,e.x);dustRing(e.x,e.y);toWalk(e)}}}
  else if(e.st==='roar'){e.face=a;if(e.sub==='a'){if(e.stT<=0){e.sub='b';e.stT=.8;if(d<240){const k=(240-d)/240;P.push={vx:Math.cos(a)*420*k,vy:Math.sin(a)*420*k,t:.35}}
      for(let i=0;i<5;i++){const an=rand(0,TAU),r=rand(30,110);addZone(clamp(P.x+Math.cos(an)*r,L+20,R-20),clamp(P.y+Math.sin(an)*r,TOP+20,BOT-20),rand(22,32),3.4,'frost')}
      fxPush({k:'ring2',x:e.x,y:e.y-30,rgb:'220,240,255',r0:20,r1:240,t:.6,max:.6,w:10});for(let i=0;i<24;i++)G.fx.push({k:'snowp',x:e.x+rand(-30,30),y:e.y-40+rand(-20,20),vx:rand(-200,200),vy:rand(-160,120),t:.8});shake(7)}}
    else if(e.stT<=0)toWalk(e)}
  else if(e.st==='avalanche'){if(e.sub==='a'){e.face=-Math.PI/2;if(e.stT<=0){const xs=shuffle([L+40,AW/2-60,AW/2+60,R-40]).slice(0,3);xs.forEach((x0,i)=>G.rollers.push({x:x0,y:TOP+20,vx:rand(-30,30),vy:170+i*15,r:14,max:28,life:4,b:1,dmg:20,rot:0}));sfx('quake',0,e.x);shake(6);fallingPebbles(10);e.sub='b';e.stT=.6}}else if(e.stT<=0)toWalk(e)}
};
EDRAW.yeti=e=>{if(e.intro>0&&(e.iT||0)<1.75){const dx=AW/2;ctx.save();doorPath();ctx.clip();ctx.fillStyle='rgba(6,8,14,.7)';ctx.beginPath();ctx.ellipse(dx,TOP-4,DOORW*.9,30,0,0,TAU);ctx.fill();
    const op=Math.min(1,e.iT/.5)*(Math.sin(e.iT*3)>-.95?1:.1),ey=TOP-30+Math.sin(G.t*3)*2;ctx.fillStyle=`rgba(127,224,255,${op})`;ctx.shadowColor='#7fe0ff';ctx.shadowBlur=10;ell(dx-6,ey,3,2);ctx.fill();ell(dx+6,ey,3,2);ctx.fill();ctx.restore();return}
  const B=basis(e.face),v=B.v,x=e.x,y=(e.yy!=null&&e.intro>0?e.yy:e.y)-e.z,w=e.moving?Math.sin(e.walk):0,crouch=e.st==='leap'&&e.sub==='a'?8:0,
  armsUp=(e.st==='pound'&&e.sub==='a')||(e.st==='snowball'&&e.sub==='a')||(e.st==='avalanche'&&e.sub==='a'),roar=e.st==='roar'&&e.sub==='b'||(e.intro>0&&e.iT>1&&e.iT<2.1),
  fur=e.slow>0?'#d8e0ee':'#eef3f8',shade='#c4d0de',skin='#7a8aa8',hand='#4a5a8a',eye=e.p2?'#ff5a5a':'#7fe0ff';
  ctx.save();ctx.translate(x,y);ctx.scale(B.f,1);ink(3);
  const fluff=(cx,cy,rx,ry,n)=>{ctx.beginPath();for(let i=0;i<=n;i++){const a=i/n*TAU,a2=(i+.5)/n*TAU;const px=cx+Math.cos(a)*rx,py=cy+Math.sin(a)*ry;if(!i)ctx.moveTo(px,py);else ctx.quadraticCurveTo(cx+Math.cos(a2-TAU/n)*rx*1.12,cy+Math.sin(a2-TAU/n)*ry*1.12,px,py)}ctx.closePath()};
  // legs and feet
  if(B.side){ell(-w*9,0,9,6);fs(hand);ell(w*9,0,9,6);fs(hand)}else{ell(-12,0+w*3,10,6);fs(hand);ell(12,0-w*3,10,6);fs(hand)}
  // arms behind the body when seen from the back
  const arm=(s,up)=>{ctx.save();ctx.translate(s*24,-36+crouch);ctx.rotate(up?s*-2.6:s*(.15+w*.1));fluff(0,14,8,16,9);fs(fur);ell(0,30,7,6);fs(hand);ctx.restore();ink(3)};
  if(B.back){arm(-1,armsUp);arm(1,armsUp)}
  fluff(0,-30+crouch,B.side?22:28,30-crouch*.4,14);const g=ctx.createLinearGradient(-28,-60,28,0);g.addColorStop(0,'#ffffff');g.addColorStop(1,shade);ctx.fillStyle=e.slow>0?fur:g;ctx.fill();ctx.stroke();
  if(!B.back){ctx.fillStyle='rgba(150,170,200,.35)';ell(B.side?6:0,-22+crouch,B.side?10:14,14);ctx.fill()}
  ctx.strokeStyle='rgba(120,140,170,.55)';ctx.lineWidth=1.6;for(const[tx,ty] of [[-16,-40],[12,-46],[-6,-26],[18,-24],[-20,-18],[4,-12]]){ctx.beginPath();ctx.moveTo(tx-3,ty-3);ctx.quadraticCurveTo(tx,ty+1,tx+3,ty-3);ctx.stroke()}ink(3);
  // head with horns
  const hx=B.back?0:v==='s'?0:v==='s34'?7:12,hy=-58+crouch;
  for(const s of B.side?[-1]:[-1,1]){ctx.strokeStyle=INK;ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(hx+s*9,hy-6);ctx.quadraticCurveTo(hx+s*22,hy-12,hx+s*18,hy-24);ctx.stroke();ctx.strokeStyle='#9aa3ad';ctx.lineWidth=4;ctx.stroke()}
  fluff(hx,hy,15,13,10);fs(fur);
  if(!B.back){const fx2=hx+(B.side?5:0);ink(2.5);ell(fx2,hy+3,B.side?7:10,8);fs(skin);
    ctx.fillStyle=eye;ctx.shadowColor=eye;ctx.shadowBlur=8;if(B.side){ell(fx2+3,hy,2.2,1.6);ctx.fill()}else{ell(fx2-4,hy,2.4,1.7);ctx.fill();ell(fx2+4,hy,2.4,1.7);ctx.fill()}ctx.shadowBlur=0;
    ctx.strokeStyle=INK;ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(fx2-7,hy-4);ctx.lineTo(fx2-2,hy-2.5);ctx.moveTo(fx2+7,hy-4);ctx.lineTo(fx2+2,hy-2.5);ctx.stroke();
    if(roar){ctx.fillStyle='#3a1a2a';ell(fx2,hy+7,5,4);ctx.fill();ctx.fillStyle='#ffffff';for(const s of [-1,1]){ctx.beginPath();ctx.moveTo(fx2+s*4,hy+3.5);ctx.lineTo(fx2+s*3,hy+7);ctx.lineTo(fx2+s*2,hy+3.5);ctx.fill()}}
    else{ctx.strokeStyle=INK;ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(fx2-4,hy+6);ctx.lineTo(fx2+4,hy+6);ctx.stroke();ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(fx2-3,hy+6);ctx.lineTo(fx2-2,hy+8.5);ctx.lineTo(fx2-1,hy+6);ctx.fill()}}
  if(!B.back){if(B.side)arm(1,armsUp);else{arm(-1,armsUp);arm(1,armsUp)}}
  if(armsUp&&e.st==='snowball'){ink(2.5);circ(0,-98,13);fs('#ffffff')}
  ctx.restore();
  if(roar&&Math.random()<.5)G.fx.push({k:'snowp',x:x+B.f*12,y:y-56,vx:B.f*rand(40,90)+Math.cos(e.face)*60,vy:rand(-20,30),t:.5})};
ESHADOW.yeti=e=>{if(e.intro>0&&(e.iT||0)<1.75)return;const sz=1-Math.min(.5,e.z/200);shadow(e.x,(e.yy!=null&&e.intro>0?e.yy:e.y)+6,38*sz,12*sz,.38)};
ETELE.yeti=e=>{if(e.st==='leap'&&e.sub==='air'){const p=1-e.stT/.85;ctx.strokeStyle='rgba(229,72,77,.7)';ctx.lineWidth=3;circ(e.tx,e.ty,e.r+16);ctx.stroke();ctx.fillStyle=`rgba(229,72,77,${.1+p*.25})`;circ(e.tx,e.ty,(e.r+16)*p);ctx.fill()}
  if(e.st==='pound'&&e.sub==='a'){const p=1-e.stT/.65;ctx.strokeStyle='rgba(160,220,255,.8)';ctx.lineWidth=3;circ(e.x,e.y,e.r+24);ctx.stroke();ctx.fillStyle=`rgba(160,220,255,${.1+p*.3})`;circ(e.x,e.y,(e.r+24)*p);ctx.fill()}};

const QUEEN={sc:1.6,body:'#8fbfe8',hood:'#e8f4ff',skin:'#e0eeff',foot:'#6a8ab8',float:true,robe:true,tiara:true,held:'staff',eyeCol:'#5fd0ff',belt:'#c8a0ff'};
function queenWings(x,y,p2,a){if(!p2)return;ctx.save();ctx.translate(x,y-34);ctx.globalAlpha=.75*a;for(const s of [-1,1]){const fl=Math.sin(G.t*3)*.12;ctx.save();ctx.scale(s,1);ctx.rotate(fl);ctx.beginPath();ctx.moveTo(4,0);ctx.lineTo(34,-26);ctx.lineTo(28,-6);ctx.lineTo(40,-2);ctx.lineTo(26,8);ctx.lineTo(30,20);ctx.lineTo(6,8);ctx.closePath();
  const g=ctx.createLinearGradient(4,0,40,0);g.addColorStop(0,'rgba(200,235,255,.9)');g.addColorStop(1,'rgba(150,120,255,.5)');ctx.fillStyle=g;ctx.fill();ctx.strokeStyle='rgba(30,40,80,.8)';ctx.lineWidth=1.8;ctx.stroke();ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(6,2);ctx.lineTo(32,-20);ctx.moveTo(8,4);ctx.lineTo(34,0);ctx.stroke();ctx.restore()}ctx.restore()}
EUPD.icequeen=(e,dt,sm,a,d)=>{
  if(!e.p2&&e.hp<e.max*.5){e.p2=true;banner('La Regina scatena la tormenta','Fase 2',1.6);bossRage(e,'190,170,255');$('bossBar').classList.add('rage');shake(8);sfx('freeze',2,e.x);
    for(let i=0;i<8;i++){const t=i/8;addZone(L+20+(R-L-40)*t,TOP+18,24,9,'frost');addZone(L+20+(R-L-40)*t,BOT-18,24,9,'frost')}}
  e.face=a;e.stT-=dt;e.walk+=dt;
  const seq=e.p2?['shards','mirror','storm','nova','blizzard','walls']:['shards','nova','mirror','shards','blizzard','walls'];
  if(e.st==='walk'){if(!e.anchor)e.anchor={x:rand(L+60,R-60),y:rand(TOP+70,TOP+240*AH/VH)};const dx=e.anchor.x-e.x,dy=e.anchor.y-e.y,dd=Math.hypot(dx,dy);e.moving=dd>4;if(dd>4){e.x+=dx/dd*75*dt;e.y+=dy/dd*75*dt}
    if(e.stT<=0){e.anchor=null;e.st=seq[e.si++%seq.length];e.sub='a';e.n=3;e.fireT=0;e.stT=e.st==='shards'?1.5:e.st==='nova'?.6:e.st==='mirror'?.45:e.st==='blizzard'?1.9:e.st==='storm'?2.6:.5;
      if(e.st==='blizzard'){const n=e.p2?4:3;for(let i=0;i<n;i++){const h=i%2===0,base=h?P.y:P.x,off=i<2?0:rand(50,80)*(Math.random()<.5?-1:1);G.bands.push({h,pos:h?clamp(base+off,TOP+14,BOT-14):clamp(base+off,L+14,R-14),w:26,warn:.95+i*.18,act:.45,hit:false,style:'ice'})}sfx('freeze',1,e.x)}}}
  else if(e.st==='shards'){e.fireT-=dt;if(e.fireT<=0&&e.n>0){e.fireT=.45;e.n--;const k=e.p2?7:5;for(let i=0;i<k;i++)shootE(e.x,e.y-26,a+(i-(k-1)/2)*.17,195,6,12,'ice');sfx('eshot','ice',e.x)}if(e.stT<=0)toWalk(e)}
  else if(e.st==='nova'){if(e.sub==='a'){if(e.stT<=0){const n=16;for(let i=0;i<n;i++)shootE(e.x,e.y-20,i*TAU/n,150,7,12,'ice');fxPush({k:'ring2',x:e.x,y:e.y-20,rgb:'190,230,255',r0:10,r1:120,t:.45,max:.45,w:8});sfx('freeze',0,e.x);
      if(e.p2){e.sub='b';e.stT=.35}else toWalk(e)}}else if(e.stT<=0){for(let i=0;i<16;i++)shootE(e.x,e.y-20,(i+.5)*TAU/16,150,7,12,'ice');toWalk(e)}}
  else if(e.st==='mirror'){if(e.sub==='a'){e.hidden=e.stT<.25;e.alpha=Math.max(.15,e.stT/.45);if(e.stT<=0){const base=rand(0,TAU),R0=140,slots=[0,1,2].map(i=>base+i*TAU/3);const pos=slots.map(an=>({x:clamp(P.x+Math.cos(an)*R0,L+30,R-30),y:clamp(P.y+Math.sin(an)*R0,TOP+40,BOT-40)}));
        e.x=pos[0].x;e.y=pos[0].y;for(let i=1;i<3;i++){const m=makeE('qmirror',pos[i].x,pos[i].y,0);m.life=5.5;m.p2=e.p2;m.alpha=0;G.enemies.push(m)}
        e.sub='b';e.stT=.4;e.hidden=true;sfx('shimmer',2,e.x);for(const p of pos)vfxBlast(p.x,p.y-20,'200,230,255',40,{sparks:8,spcol:['#ffffff','#c9f3ff'],dust:0,ring2:false})}}
    else{e.alpha=1-e.stT/.4;e.hidden=e.stT>.2;if(e.stT<=0){e.hidden=false;e.alpha=1;toWalk(e)}}}
  else if(e.st==='blizzard'){if(e.stT<=0)toWalk(e)}
  else if(e.st==='storm'){e.fireT-=dt;if(e.fireT<=0){e.fireT=.11;for(let k=0;k<3;k++)shootE(e.x,e.y-20,(e.rot||0)+k*TAU/3,125,7,11,'snow');e.rot=(e.rot||0)+.21}if(e.stT<=0)toWalk(e)}
  else if(e.st==='walls'){if(e.stT<=0){const ang=Math.atan2(P.y-e.y,P.x-e.x),dd=Math.hypot(P.x-e.x,P.y-e.y);let made=0;
      for(const[t,off] of [[.4,0],[.55,-44],[.55,44]]){const bx=e.x+Math.cos(ang)*dd*t-Math.sin(ang)*off,by=e.y+Math.sin(ang)*dd*t+Math.cos(ang)*off;if(bx<L+20||bx>R-20||by<TOP+20||by>BOT-20)continue;if(Math.hypot(P.x-bx,P.y-by)<40||G.rocks.some(k=>Math.hypot(k.x-bx,k.y-by)<k.r+20))continue;
        G.rocks.push({x:bx,y:by,r:15,seed:Math.random()*10,temp:true,life:6,kind:'iceblock'});made++;vfxBlast(bx,by,'200,230,255',30,{sparks:6,spcol:['#ffffff','#c9f3ff'],dust:4,ring2:false})}
      if(made){fields={};sfx('freeze',1,e.x)}toWalk(e)}}
};
EDRAW.icequeen=e=>{const a=(e.hidden?.12:(e.alpha==null?1:e.alpha))*ctx.globalAlpha;ctx.globalAlpha=a;
  const aura=ctx.createRadialGradient(e.x,e.y-26,4,e.x,e.y-26,54);aura.addColorStop(0,e.p2?'rgba(190,160,255,.35)':'rgba(170,220,255,.3)');aura.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=aura;circ(e.x,e.y-26,54);ctx.fill();
  queenWings(e.x,e.y,e.p2,a);drawRig(e.x,e.y,e.face,e.walk,e.moving,{...QUEEN,p2:e.p2},{});ctx.globalAlpha=a;
  for(let i=0;i<4;i++){const an=G.t*1.4+i*TAU/4,tx=e.x+Math.cos(an)*30,ty=e.y-22+Math.sin(an)*12;ctx.save();ctx.translate(tx,ty);ctx.rotate(an*2);ink(1.4);ctx.beginPath();ctx.moveTo(0,-5);ctx.lineTo(3,0);ctx.lineTo(0,5);ctx.lineTo(-3,0);ctx.closePath();fs('#e8f6ff');ctx.restore()}
  if(e.st==='nova'&&e.sub==='a'){const p=1-e.stT/.6;glow('190,230,255',e.x,e.y-20,20+p*30,.4+p*.4)}
  ctx.globalAlpha=1};
ESHADOW.icequeen=e=>{if(!e.hidden)shadow(e.x,e.y+12,17,6.5,.22)};
ELIGHT.icequeen=(e,Lt)=>{if(!e.hidden)Lt(e.x,e.y-24,100,.8)};
EUPD.qmirror=(e,dt,sm,a,d)=>{e.face=a;e.life-=dt;e.alpha=Math.min(1,(e.alpha||0)+dt*3)*Math.min(1,e.life/.4);e.fireT=(e.fireT==null?rand(.6,1.2):e.fireT)-dt;
  if(e.fireT<=0){e.fireT=1.4;for(let k=-1;k<=1;k++)shootE(e.x,e.y-26,a+k*.2,165,5,8,'ice')}
  if(e.life<=0){vfxBlast(e.x,e.y-20,'200,230,255',40,{sparks:10,spcol:['#ffffff','#c9f3ff'],debris:['#e8f6ff','#a8d8f0'],n:8,dust:0,ring2:false});killE(e,true)}};
EDRAW.qmirror=e=>{ctx.globalAlpha=.7*(e.alpha||0);drawRig(e.x,e.y,e.face,G.t,false,{...QUEEN,body:'#b8d8f8',p2:e.p2},{});ctx.globalAlpha=(e.alpha||0)*.4;ctx.save();ctx.globalCompositeOperation='lighter';glow('200,230,255',e.x,e.y-26,30,.5);ctx.restore();ctx.globalAlpha=1};
ESHADOW.qmirror=e=>shadow(e.x,e.y+12,15,5,.15*(e.alpha||0));

