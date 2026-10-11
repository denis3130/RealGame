// ---------------- chapter 4: ice ----------------
EUPD.wolf=(e,dt,sm,a,d)=>{
  if(e.st==='howl'){e.stT-=dt;e.moving=false;if(e.stT>.25)e.ca=a;e.face=e.ca;if(e.stT<=0){e.st='dash';e.stT=.42;sfx('dash',0,e.x)}return}
  if(e.st==='dash'){e.stT-=dt;const ox=e.x,oy=e.y;moveCircle(e,Math.cos(e.ca)*370*sm*dt,Math.sin(e.ca)*370*sm*dt);e.face=e.ca;e.moving=true;e.walk+=dt*26;if(Math.random()<.7)G.fx.push({k:'puff',x:ox,y:oy+6,vx:0,vy:-8,t:.35,r:rand(3,6)});
    if(e.stT<=0||Math.hypot(e.x-ox,e.y-oy)<1){if(e.elite&&!e.again){e.again=true;e.st='howl';e.stT=.35}else{e.again=false;e.st='rest';e.stT=.6}}return}
  if(e.st==='rest'){e.stT-=dt;e.moving=false;if(e.stT<=0){e.st='walk';e.cd=rand(1.6,2.4)}return}
  const want=d>170?1:d<120?-1:0,sa=a+Math.PI/2*e.side,ox=e.x,oy=e.y;
  moveCircle(e,(Math.cos(sa)*.8+Math.cos(a)*want)*92*sm*dt,(Math.sin(sa)*.8+Math.sin(a)*want)*92*sm*dt);if(Math.hypot(e.x-ox,e.y-oy)<92*dt*.3)e.side*=-1;
  e.face=Math.atan2(e.y-oy,e.x-ox);e.moving=true;e.walk+=dt*13;if(Math.random()<dt*.4)e.side*=-1;
  e.cd-=dt*FR();if(e.cd<=0&&d<270&&clearLine(e.x,e.y,P.x,P.y,e.r*.8)){e.st='howl';e.stT=.7;e.ca=a;sfx('howl',0,e.x)}};
EDRAW.wolf=e=>{const c=Math.cos(e.face);if(Math.abs(c)>.15)e.fl=c<0?-1:1;const f=e.fl||1,x=e.x,y=e.y,howl=e.st==='howl',dash=e.st==='dash',w=e.moving?Math.sin(e.walk):0,up=Math.sin(e.face)<-.5?1:Math.sin(e.face)>.5?-1:0;
  const fur=e.slow>0?'#a8b8d0':'#8a9ab0',lite='#d8e2ee',dark='#5a6a80';ctx.save();ctx.translate(x,y);ctx.scale(f,1);ink(2.3);
  const legs=[[9,1],[5,-1],[-8,1],[-12,-1]];for(const[lx,ph] of legs){const sw=w*ph*(dash?7:4),lift=Math.max(0,-w*ph)*3;ctx.strokeStyle=INK;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(lx,-6);ctx.lineTo(lx+sw,4-lift);ctx.stroke();ctx.strokeStyle=ph>0?fur:dark;ctx.lineWidth=3;ctx.stroke()}
  // bushy tail
  ctx.beginPath();ctx.moveTo(-14,-11);ctx.quadraticCurveTo(-26,-14+(howl?6:0)+Math.sin(e.t*8)*2,-30,-6+(dash?-6:0));ctx.quadraticCurveTo(-22,-4,-14,-6);ctx.closePath();ink(2.2);fs(fur);ctx.fillStyle=lite;circ(-28,-7+(dash?-6:0),2.4);ctx.fill();
  // body
  ell(-2,-10,16,8.5);fs(fur);ctx.fillStyle=lite;ell(0,-6,11,3.5);ctx.fill();ctx.fillStyle=dark;ell(-4,-15,8,3);ctx.fill();
  // head: raised when howling, low and long when dashing
  ctx.save();ctx.translate(12,howl?-20:dash?-12:-15-up*2);ctx.rotate(howl?-.9:dash?.15:0);ink(2.2);
  ctx.beginPath();ctx.moveTo(-5,-6);ctx.lineTo(6,-5);ctx.lineTo(14,-1);ctx.lineTo(13,3);ctx.lineTo(4,5);ctx.lineTo(-5,4);ctx.closePath();fs(fur);
  ctx.fillStyle=lite;ctx.beginPath();ctx.moveTo(4,2);ctx.lineTo(13,1);ctx.lineTo(12,4);ctx.lineTo(4,5);ctx.closePath();ctx.fill();
  for(const ex of [-3,1]){ctx.beginPath();ctx.moveTo(ex-2,-5);ctx.lineTo(ex,-13);ctx.lineTo(ex+3,-5);ctx.closePath();ink(1.8);fs(dark)}
  ctx.fillStyle='#9fe6ff';ctx.shadowColor='#9fe6ff';ctx.shadowBlur=6;ell(5,-2.5,1.8,1.2);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle=INK;circ(14,0,1.3);ctx.fill();
  if(howl){ctx.fillStyle='#5a1f2e';ctx.beginPath();ctx.moveTo(8,2);ctx.lineTo(14,4);ctx.lineTo(8,5);ctx.closePath();ctx.fill()}
  ctx.restore();ctx.restore();
  if(howl&&Math.random()<.3)G.fx.push({k:'puff',x:x+f*22,y:y-30,vx:f*12,vy:-14,t:.5,r:3})};
ESHADOW.wolf=e=>shadow(e.x,e.y+5,16,5);
ETELE.wolf=e=>{if(e.st==='howl'){ctx.save();ctx.translate(e.x,e.y);ctx.rotate(e.ca);ctx.fillStyle=`rgba(160,220,255,${.14+.12*Math.sin(G.t*22)})`;ctx.fillRect(0,-e.r,150,e.r*2);ctx.strokeStyle='rgba(160,220,255,.75)';ctx.lineWidth=2;ctx.setLineDash([7,6]);ctx.strokeRect(0,-e.r,150,e.r*2);ctx.setLineDash([]);ctx.restore()}};

EUPD.snowspirit=(e,dt,sm,a,d)=>{e.face=a;e.phT=(e.phT==null?rand(1.5,2.5):e.phT)-dt;if(!e.ph2)e.ph2='float';
  if(e.ph2==='float'){e.alpha=1;const want=d>190?1:d<120?-1:0;moveCircle(e,(Math.cos(a)*want+Math.cos(a+Math.PI/2)*e.side*.6)*40*sm*dt,(Math.sin(a)*want+Math.sin(a+Math.PI/2)*e.side*.6)*40*sm*dt,true);if(e.phT<=0){e.ph2='fade';e.phT=.4;sfx('shimmer',0,e.x)}}
  else if(e.ph2==='fade'){e.alpha=e.phT/.4;e.hidden=e.phT<.2;if(e.phT<=0){let tx,ty;for(let i=0;i<16;i++){const an=rand(0,TAU),r=rand(62,84);tx=clamp(P.x+Math.cos(an)*r,L+20,R-20);ty=clamp(P.y+Math.sin(an)*r,TOP+20,BOT-20);if(!G.rocks.some(k=>Math.hypot(k.x-tx,k.y-ty)<k.r+14))break}e.tx=tx;e.ty=ty;e.ph2='tele';e.phT=.6;e.alpha=0;e.hidden=true}}
  else if(e.ph2==='tele'){e.hidden=true;if(Math.random()<.6)G.fx.push({k:'snowp',x:e.tx+rand(-16,16),y:e.ty-rand(0,30),vx:(e.tx-e.x)*0,vy:rand(10,30),t:.5});if(e.phT<=0){e.x=e.tx;e.y=e.ty;e.ph2='appear';e.phT=.32}}
  else if(e.ph2==='appear'){e.alpha=1-e.phT/.32;e.hidden=e.phT>.16;if(e.phT<=0){e.hidden=false;e.alpha=1;const n=e.elite?12:8,o=rand(0,1);for(let i=0;i<n;i++)shootE(e.x,e.y-12,o+i*TAU/n,118,7,10,'snow');fxPush({k:'ring2',x:e.x,y:e.y-10,rgb:'220,240,255',r0:6,r1:60,t:.4,max:.4,w:5});sfx('freeze',0,e.x);e.ph2='float';e.phT=rand(2,2.8);if(Math.random()<.5)e.side*=-1}}};
EDRAW.snowspirit=e=>{if(e.ph2==='tele'||!(e.alpha>.02))return;const B=basis(e.face),x=e.x,y=e.y-15+Math.sin(e.t*2.6)*3;ctx.globalAlpha=Math.max(0,Math.min(1,e.alpha));
  ctx.save();ctx.translate(x,y);const sw=Math.sin(e.t*5)*2;ink(2.2);
  ctx.beginPath();ctx.moveTo(0,12);ctx.bezierCurveTo(-14,12,-13,-8,-4,-12);ctx.quadraticCurveTo(0,-15,4,-12);ctx.bezierCurveTo(13,-8,14,12,0,12);ctx.closePath();
  const g=ctx.createLinearGradient(0,-15,0,12);g.addColorStop(0,'#ffffff');g.addColorStop(1,e.slow>0?'#a8b8d0':'#a8d8f8');ctx.fillStyle=g;ctx.fill();ctx.stroke();
  // little arms and a ragged hem
  ctx.fillStyle='#e8f6ff';for(const s of [-1,1]){ctx.beginPath();ctx.ellipse(s*12,0+sw*s*.5,4,2.4,s*.6,0,TAU);ctx.fill();ctx.stroke()}
  ctx.fillStyle='rgba(255,255,255,.6)';ell(-4,-4,3,5);ctx.fill();
  if(!B.back){const cx=Math.cos(B.qa)*4,cy=Math.sin(B.qa)*2,sp=B.side?0:3.6;for(const k of B.side?[1]:[-1,1]){ctx.fillStyle='#1e3a6a';ell(cx+k*sp,cy-2,1.9,2.9);ctx.fill()}ctx.strokeStyle='#1e3a6a';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(cx,cy+3,1.8,0,Math.PI);ctx.stroke()}
  // snowflake crown
  ctx.translate(0,-17);ctx.rotate(e.t*.8);ctx.strokeStyle='#ffffff';ctx.lineWidth=1.6;ctx.lineCap='round';ctx.beginPath();for(let k=0;k<3;k++){const a=k*Math.PI/3;ctx.moveTo(-Math.cos(a)*6,-Math.sin(a)*6);ctx.lineTo(Math.cos(a)*6,Math.sin(a)*6)}ctx.stroke();
  ctx.restore();glow('200,235,255',x,y,22,.35*(e.alpha||1));
  for(let i=0;i<3;i++){const an=e.t*2+i*2.1;ctx.fillStyle='rgba(255,255,255,.9)';circ(x+Math.cos(an)*16,y+Math.sin(an)*7,1.4);ctx.fill()}ctx.globalAlpha=1};
ESHADOW.snowspirit=e=>{if(e.ph2!=='tele'&&e.alpha>.05)shadow(e.x,e.y+6,9,3.5,.2*e.alpha)};
ELIGHT.snowspirit=(e,Lt)=>{if(!e.hidden)Lt(e.x,e.y-14,55,.55*(e.alpha||1))};
ETELE.snowspirit=e=>{if(e.ph2==='tele'){const p=1-e.phT/.6;ctx.strokeStyle=`rgba(180,225,255,${.45+.4*Math.sin(G.t*25)})`;ctx.lineWidth=3;circ(e.tx,e.ty,22-p*8);ctx.stroke();ctx.fillStyle='rgba(180,225,255,.2)';circ(e.tx,e.ty,10);ctx.fill()}};

BLOCK.icesentinel=(e,ar)=>{if(!e.shards)return false;const ha=Math.atan2(ar.y-(e.y-14),ar.x-e.x);
  for(const s of e.shards){if(s.hp<=0)continue;if(Math.abs(angDiff(ha,e.rot+s.a))<.52){s.hp--;s.hit=.15;G.fx.push({k:'spark',x:ar.x,y:ar.y,t:.2});sfx('iceHit',0,e.x);
      if(s.hp<=0){s.re=5;const sx=e.x+Math.cos(e.rot+s.a)*24,sy=e.y-14+Math.sin(e.rot+s.a)*14;vfxBlast(sx,sy,'180,225,255',26,{sparks:8,spcol:['#ffffff','#c9f3ff'],debris:['#e8f6ff','#a8d8f0'],n:6,dust:0,ring2:false});sfx('iceBreak',0,e.x)}
      else text(e.x,e.y-36,'PARATO','#c9f3ff',12);return true}}return false};
EUPD.icesentinel=(e,dt,sm,a,d)=>{if(!e.shards)e.shards=Array.from({length:e.elite?4:3},(_,i,arr)=>({a:i*TAU/(e.elite?4:3),hp:2,re:0,hit:0}));
  e.rot=(e.rot||0)+dt*1.5;for(const s of e.shards){s.hit=Math.max(0,s.hit-dt);if(s.hp<=0){s.re-=dt;if(s.re<=0){s.hp=2;sfx('freeze',1,e.x)}}}
  if(e.cast>0){e.cast-=dt;e.face=a;e.moving=false;if(e.cast<=0){const n=e.elite?5:3;for(let k=0;k<n;k++)shootE(e.x,e.y-16,a+(k-(n-1)/2)*.2,175,6,12,'ice');sfx('freeze',0,e.x);e.cd=rand(2.6,3.4)}return}
  const na=navAngle(e);e.face=na;moveCircle(e,Math.cos(na)*26*sm*dt,Math.sin(na)*26*sm*dt);e.moving=true;e.walk+=dt*5;e.cd-=dt*FR();if(e.cd<=0&&d<300)e.cast=.6};
EDRAW.icesentinel=e=>{const B=basis(e.face),x=e.x,y=e.y,w=e.moving?Math.sin(e.walk):0,glowP=e.cast>0?1-e.cast/.6:.3+.2*Math.sin(G.t*3);
  const shardAt=s=>{const an=e.rot+s.a;return{x:x+Math.cos(an)*24,y:y-14+Math.sin(an)*14,back:Math.sin(an)<0}};
  const drawShard=s=>{const p=shardAt(s),grow=s.hp>0?1:Math.max(.15,1-s.re/5)*.5;if(s.hp<=0&&s.re>4.5)return;ctx.save();ctx.translate(p.x,p.y);ctx.globalAlpha=s.hp>0?1:.5;ink(1.6);ctx.scale(grow,grow);
    ctx.beginPath();ctx.moveTo(0,-9);ctx.lineTo(5,0);ctx.lineTo(0,8);ctx.lineTo(-5,0);ctx.closePath();const g=ctx.createLinearGradient(-5,-9,5,8);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#6fb8e8');ctx.fillStyle=s.hit>0?'#ffffff':g;ctx.fill();ctx.stroke();ctx.restore();ctx.globalAlpha=1};
  if(e.shards)for(const s of e.shards)if(shardAt(s).back)drawShard(s);
  ctx.save();ctx.translate(x,y);ctx.scale(B.f,1);ink(2.5);
  if(B.side){ell(-w*5,3,6,4.5);fs('#6a8aa8');ell(w*5,3,6,4.5);fs('#6a8aa8')}else{ell(-7,3+w*1.5,6,4.5);fs('#6a8aa8');ell(7,3-w*1.5,6,4.5);fs('#6a8aa8')}
  ctx.beginPath();ctx.moveTo(-13,0);ctx.lineTo(-15,-18);ctx.lineTo(-8,-28);ctx.lineTo(8,-28);ctx.lineTo(15,-18);ctx.lineTo(13,0);ctx.closePath();
  const g=ctx.createLinearGradient(-15,-28,15,0);g.addColorStop(0,'#e8f6ff');g.addColorStop(.5,'#a8d0ee');g.addColorStop(1,'#6a9ac8');ctx.fillStyle=e.slow>0?'#b8c8e0':g;ctx.fill();ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.5)';ctx.beginPath();ctx.moveTo(-12,-18);ctx.lineTo(-7,-26);ctx.lineTo(-4,-26);ctx.lineTo(-10,-14);ctx.closePath();ctx.fill();
  if(!B.back){ctx.save();ctx.globalCompositeOperation='lighter';glow('120,210,255',B.side?4:0,-14,12+glowP*8,.5+glowP*.4);ctx.restore();ink(1.6);ctx.beginPath();ctx.moveTo(B.side?4:0,-19);ctx.lineTo((B.side?4:0)+4,-14);ctx.lineTo(B.side?4:0,-9);ctx.lineTo((B.side?4:0)-4,-14);ctx.closePath();fs('#bff0ff');
    ctx.fillStyle='#1e3a6a';const hx=B.side?6:B.v==='s34'?2:0;ell(hx-3,-23,1.6,1.1);ctx.fill();if(!B.side){ell(hx+3,-23,1.6,1.1);ctx.fill()}}
  for(const s of B.side?[1]:[-1,1]){ink(2.2);ell(s*17,-12+(e.cast>0?-4:0),5,7);fs('#8ab8e0')}
  ctx.restore();
  if(e.shards)for(const s of e.shards)if(!shardAt(s).back)drawShard(s)};
ESHADOW.icesentinel=e=>shadow(e.x,e.y+5,16,6);
ELIGHT.icesentinel=(e,Lt)=>Lt(e.x,e.y-14,e.cast>0?70:44,.55);

