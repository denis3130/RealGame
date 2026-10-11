// ---------------- chapter 1: necromancer and the little skeletons he raises ----------------
const NECRO={sc:1,body:'#2a2434',hood:'#1e1a26',skin:'#a8c8a0',foot:'#1b1612',held:'staff',eyeCol:'#9fff7a',hoodTip:true,robe:true,belt:'#4a3a5a'};
const BONELET={sc:.72,body:'#d9d2c0',skull:true,skin:'#e8e2d0',foot:'#cfc7b2',ribs:true,held:null,eyeCol:'#9fff7a'};
EUPD.necro=(e,dt,sm,a,d)=>{
  if(e.cast>0){e.cast-=dt;e.face=a;e.moving=false;if(e.cast<=0){const n=G.enemies.filter(o=>o.type==='bonelet').length;const k=Math.min(e.elite?3:2,5-n);
      for(let i=0;i<k;i++){let tx,ty;for(let q=0;q<14;q++){const an=rand(0,TAU),r=rand(70,120);tx=clamp(P.x+Math.cos(an)*r,L+20,R-20);ty=clamp(P.y+Math.sin(an)*r,TOP+20,BOT-20);if(!G.rocks.some(o=>Math.hypot(o.x-tx,o.y-ty)<o.r+14))break}
        const b=makeE('bonelet',tx,ty,0);b.rise=.9;b.hidden=true;G.enemies.push(b);vfxBlast(tx,ty,'140,255,120',30,{sparks:0,dust:8,debris:'dirt',n:8,ring2:false})}
      sfx('summon',0,e.x);e.cd=rand(4.2,5.2)}return}
  const los=clearLine(e.x,e.y-8,P.x,P.y-6,6),mv=d<190?-1:d>260?1:0,sa=mv===0?a+Math.PI/2*e.side:a,dir=mv===0?1:mv,ox=e.x,oy=e.y;
  moveCircle(e,Math.cos(sa)*dir*42*sm*dt,Math.sin(sa)*dir*42*sm*dt);if(Math.hypot(e.x-ox,e.y-oy)<42*dt*.3)e.side*=-1;
  e.face=a;e.moving=true;e.walk+=dt*8;e.cd-=dt*FR();e.orbT=(e.orbT||rand(1.5,2.5))-dt;
  if(e.orbT<=0&&los){e.orbT=rand(2.6,3.4);shootE(e.x,e.y-20,a,135,7,11,'orb')}
  if(e.cd<=0)e.cast=1;
};
EDRAW.necro=e=>{const S=e.slow>0?{...NECRO,body:'#4a4a6a'}:NECRO;drawRig(e.x,e.y,e.face,e.walk,e.moving&&!(e.cast>0),S,{});
  if(e.cast>0){const p=1-e.cast;glow('140,255,120',e.x,e.y-34,16+p*20,.4+p*.4);for(let i=0;i<3;i++){const a=G.t*4+i*2.1;ctx.fillStyle='rgba(180,255,150,.85)';circ(e.x+Math.cos(a)*14*p,e.y-34+Math.sin(a)*8*p,2);ctx.fill()}}
  else glow('140,255,120',e.x+12,e.y-24,8,.35)};
ESHADOW.necro=e=>shadow(e.x,e.y+8,13,5);
ELIGHT.necro=(e,Lt)=>Lt(e.x,e.y-24,e.cast>0?80:45,.6);
EUPD.bonelet=(e,dt,sm,a,d)=>{
  if(e.rise>0){e.rise-=dt;e.hidden=true;if(Math.random()<.4)G.fx.push({k:'puff',x:e.x+rand(-8,8),y:e.y+3,vx:rand(-20,20),vy:-10,t:.35,r:4});if(e.rise<=0){e.hidden=false;sfx('death','skeleton',e.x)}return}
  const na=navAngle(e);e.face+=clamp(angDiff(e.face,na),-6*dt,6*dt);const sp=(e.elite?82:70)*sm;moveCircle(e,Math.cos(e.face+Math.sin(e.t*7)*.3)*sp*dt,Math.sin(e.face+Math.sin(e.t*7)*.3)*sp*dt);e.moving=true;e.walk+=dt*15};
EDRAW.bonelet=e=>{if(e.rise>0){const p=1-e.rise/.9;ctx.save();ctx.beginPath();ctx.rect(e.x-40,e.y-60,80,66);ctx.clip();drawRig(e.x,e.y+(1-p)*26,Math.PI/2,0,false,BONELET,{});ctx.restore();
    ink(1.6);ctx.fillStyle='#3a2a1d';ell(e.x,e.y+5,12*Math.min(1,p*2),4);ctx.fill();ctx.stroke();return}
  drawRig(e.x,e.y,e.face,e.walk,e.moving,e.slow>0?{...BONELET,body:'#a8c8d8'}:BONELET,{})};
ESHADOW.bonelet=e=>{if(!(e.rise>0))shadow(e.x,e.y+6,9,3.5)};

// ---------------- chapter 2: the dwarf bomber ----------------
const DWARF={sc:.92,body:'#7a4a2a',hood:'#5a5f68',skin:'#e8b890',foot:'#3a2a1d',held:null,helm:true,beard:'#c8642a',hoodTip:false,belt:'#3a2a1d',eyeCol:INK};
EUPD.bomber=(e,dt,sm,a,d)=>{
  if(e.throwT>0){e.throwT-=dt;e.face=a;e.moving=false;if(e.throwT<=0){const n=e.elite?2:1;for(let k=0;k<n;k++)lob(e.x,e.y-26,P.x+(k?rand(-50,50):0)+P.vxs*.5,P.y+(k?rand(-50,50):0)+P.vys*.5,{kind:'bomb',dur:.85,r:34,dmg:18,h:110,fuse:.55,delay:k*.15});sfx('dash',0,e.x);e.cd=rand(2.4,3)}return}
  const los=clearLine(e.x,e.y-8,P.x,P.y-6,6),mv=d<150?-1:d>230?1:0,sa=mv===0?a+Math.PI/2*e.side:a,dir=mv===0?1:mv,ox=e.x,oy=e.y;
  if(!los){const na=navAngle(e);moveCircle(e,Math.cos(na)*58*sm*dt,Math.sin(na)*58*sm*dt);e.face=na;e.moving=true;e.walk+=dt*11;return}
  moveCircle(e,Math.cos(sa)*dir*52*sm*dt,Math.sin(sa)*dir*52*sm*dt);if(Math.hypot(e.x-ox,e.y-oy)<52*dt*.3)e.side*=-1;
  e.face=a;e.moving=true;e.walk+=dt*12;e.cd-=dt*FR();if(e.cd<=0)e.throwT=.55};
EDRAW.bomber=e=>{const S=e.slow>0?{...DWARF,body:'#6a7a9a'}:DWARF;drawRig(e.x,e.y,e.face,e.walk,e.moving,S,{});
  // the bomb in his hand: raised while winding up
  const up=e.throwT>0?1-e.throwT/.55:0,B=basis(e.face),hx=e.x+(B.side?B.f*7:9*B.f),hy=e.y-13-up*16;ink(2);circ(hx,hy,5);fs('#2a2a30');ctx.fillStyle='rgba(255,255,255,.35)';circ(hx-1.5,hy-1.5,1.5);ctx.fill();
  ctx.strokeStyle='#8a6a44';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(hx+3,hy-3);ctx.lineTo(hx+5,hy-7);ctx.stroke();glow('255,200,90',hx+5,hy-7,5+Math.sin(G.t*30)*1.5,.9)};
ESHADOW.bomber=e=>shadow(e.x,e.y+7,12,4.6);

