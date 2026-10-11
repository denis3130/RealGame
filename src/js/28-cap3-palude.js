// ---------------- chapter 3: swamp ----------------
EUPD.frog=(e,dt,sm,a,d)=>{
  if(e.jump>0){e.jump-=dt*sm;const p=1-e.jump/.55;moveCircle(e,e.vx*dt*sm,e.vy*dt*sm);e.z=Math.sin(clamp(p,0,1)*Math.PI)*24;e.moving=true;
    if(e.jump<=0){e.z=0;e.land=.22;e.moving=false;stepFx(e.x,e.y+5,false);e.cd=rand(.45,.9);e.hops=(e.hops||0)+1;if(e.elite)addZone(e.x,e.y,16,2,'acid');
      if(e.hops%2===0&&d<280&&clearLine(e.x,e.y-6,P.x,P.y-6,5)){e.spit=.5;sfx('croak',0,e.x)}}return}
  e.land=Math.max(0,(e.land||0)-dt);
  if(e.spit>0){e.spit-=dt;e.face=a;if(e.spit<=0){const n=e.elite?3:1;for(let k=0;k<n;k++)shootE(e.x,e.y-8,a+(k-(n-1)/2)*.25,170,6,11,'poison')}return}
  if(e.crouch>0){e.crouch-=dt;if(e.crouch<=0){e.jump=.55;const na=navAngle(e),sp=d<70?-90:125;e.vx=Math.cos(na)*sp;e.vy=Math.sin(na)*sp;e.face=na}return}
  e.face=a;e.cd-=dt*sm*FR();if(e.cd<=0)e.crouch=.2};
EDRAW.frog=e=>{const B=basis(e.face),x=e.x,y=e.y-e.z,air=e.jump>0,cr=e.crouch>0?1:e.land>0?e.land/.22:0,sq=1-cr*.18,st=air?1.18:1,sac=e.spit>0?1-e.spit/.5:.25+.15*Math.sin(e.t*5);
  const body=e.slow>0?'#8fc0c0':'#5fb84a',dark='#3f7a2a';ctx.save();ctx.translate(x,y);ctx.scale(B.side?B.f:1,1);ink(2.3);
  // back legs: folded at the sides, kicked out behind in the air
  if(air){for(const s of B.side?[-1]:[-1,1]){ctx.strokeStyle=INK;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(s*6-(B.side?6:0),2);ctx.lineTo(s*14-(B.side?10:0),10);ctx.lineTo(s*10-(B.side?14:0),16);ctx.stroke();ctx.strokeStyle=body;ctx.lineWidth=2.6;ctx.stroke()}}
  else for(const s of B.side?[-1]:[-1,1]){ell(s*10-(B.side?3:0),3,7,5*sq,s*.4);fs(dark);ink(2.3)}
  ctx.save();ctx.scale(1/st,st*sq);
  ell(0,-6,B.side?11:13,10);fs(body);
  ctx.fillStyle=dark;for(const[sx,sy,sr] of B.back?[[-5,-9,2.6],[4,-5,2.2],[0,-12,1.8],[6,-11,1.5]]:[[-8,-10,1.8],[8,-11,1.6]]){circ(sx,sy,sr);ctx.fill()}
  ctx.fillStyle='#b06ad8';for(const[sx,sy] of B.back?[[-2,-6],[3,-10]]:[[-9,-5]]){circ(sx,sy,1.4);ctx.fill()}
  if(!B.back){ctx.fillStyle='#e8e0a0';ell(B.side?4:0,-1,B.side?5:8,4.5);ctx.fill();
    // throat sac swelling before it spits
    if(sac>.3){ink(1.6);circ(B.side?6:0,1+sac*1.5,2+sac*4);fs('#f2e8b0')}
    ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.beginPath();if(B.side)ctx.moveTo(1,-4),ctx.quadraticCurveTo(8,-2,11,-6);else ctx.moveTo(-8,-4),ctx.quadraticCurveTo(0,-1,8,-4);ctx.stroke()}
  // eyes on top of the head
  const ex=B.side?[4]:B.back?[-6,6]:[-6,6];for(const k of ex){ink(2);circ(k,-15,4.2);fs(body);if(!B.back){ctx.fillStyle='#ffb020';circ(k+(B.side?1:0),-15.5,2.6);ctx.fill();ctx.fillStyle=INK;ctx.fillRect(k-1.6+(B.side?1:0),-16,3.2,1.2)}}
  ctx.restore();
  // front feet
  if(!air&&!B.back){for(const s of B.side?[1]:[-1,1]){ink(1.6);ell(s*6+(B.side?4:0),4,3,1.8);fs(body)}}
  ctx.restore()};
ESHADOW.frog=e=>shadow(e.x,e.y+5,12*(1-e.z/60),4.5*(1-e.z/60));

EUPD.mosquito=(e,dt,sm,a,d)=>{e.face=e.st==='dive'?e.ca:a;
  if(e.st==='aim'){e.stT-=dt;if(e.stT>.22)e.ca=a;if(e.stT<=0){e.st='dive';e.stT=.48;sfx('buzz',1,e.x)}return}
  if(e.st==='dive'){e.stT-=dt;const ox=e.x,oy=e.y;moveCircle(e,Math.cos(e.ca)*350*sm*dt,Math.sin(e.ca)*350*sm*dt,true);if(Math.random()<.8)G.fx.push({k:'ghost2',x:ox,y:oy-16,t:.18,col:'138,74,58'});if(e.stT<=0||Math.hypot(e.x-ox,e.y-oy)<1){e.st='rest';e.stT=.55}return}
  if(e.st==='rest'){e.stT-=dt;if(e.stT<=0){e.st='walk';e.cd=rand(1.3,2)}}
  const want=d>150?1:d<95?-1:0,sa=a+Math.PI/2*e.side;
  moveCircle(e,(Math.cos(sa)*.9+Math.cos(a)*want*.8+Math.sin(e.t*9)*.3)*88*sm*dt,(Math.sin(sa)*.9+Math.sin(a)*want*.8+Math.cos(e.t*7)*.3)*88*sm*dt,true);
  if(Math.random()<dt*.7)e.side*=-1;e.cd-=dt*FR();if(e.cd<=0&&e.st!=='rest'&&d<240){e.st='aim';e.stT=.62;e.ca=a;sfx('buzz',0,e.x)}};
EDRAW.mosquito=e=>{const B=basis(e.face),aim=e.st==='aim',x=e.x+(aim?Math.sin(G.t*90)*1.2:0),y=e.y-17+Math.sin(e.t*6)*3,fl=Math.sin(e.t*70);
  ctx.save();ctx.translate(x,y);ctx.scale(B.side?B.f:1,1);
  // dangling legs
  ctx.strokeStyle=INK;ctx.lineWidth=1.3;for(let i=0;i<3;i++){const lx=-3+i*3,sw=Math.sin(e.t*3+i)*2;ctx.beginPath();ctx.moveTo(lx,2);ctx.lineTo(lx-4+sw,10);ctx.lineTo(lx-3+sw,17);ctx.moveTo(lx,2);ctx.lineTo(lx+4-sw,9);ctx.lineTo(lx+5-sw,15);ctx.stroke()}
  // wings: a fast blur
  ctx.fillStyle='rgba(220,235,255,.45)';ctx.strokeStyle='rgba(27,22,18,.6)';ctx.lineWidth=1;for(const s of B.side?[-1]:[-1,1]){ctx.save();ctx.translate(s*2,-5);ctx.rotate(s*(.5+fl*.35));ctx.beginPath();ctx.ellipse(s*9,0,10,3.4,0,0,TAU);ctx.fill();ctx.stroke();ctx.restore()}
  // abdomen glowing red while it locks on
  ink(2);ctx.beginPath();ctx.ellipse(B.side?-8:0,B.side?2:5,B.side?8:5,B.side?4.5:7.5,B.side?.3:0,0,TAU);fs(aim?'#c8443a':e.slow>0?'#8a8aa8':'#8a4a3a');
  ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=1.2;for(const k of [-2,1,4]){ctx.beginPath();if(B.side){ctx.moveTo(-8+k*1.2,-2);ctx.lineTo(-9+k*1.2,6)}else{ctx.moveTo(-4,k+3);ctx.lineTo(4,k+3)}ctx.stroke()}
  ink(2);circ(0,-3,5);fs('#4a2f24');
  if(!B.back){const hx=B.side?6:B.v==='s34'?2:0;ink(1.8);circ(hx,-5,3.8);fs('#5a3a2a');ctx.fillStyle=aim?'#ff5a3c':'#e5484d';for(const k of B.side?[1]:[-1.6,1.6]){circ(hx+k,-6,1.6);ctx.fill()}
    ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.beginPath();const pa=B.side?.25:Math.PI/2;ctx.moveTo(hx,-3);ctx.lineTo(hx+Math.cos(pa)*11,-3+Math.sin(pa)*11*(B.side?1:.6));ctx.stroke()}
  ctx.restore();if(aim)glow('255,80,60',x,y,14,.35+.25*Math.sin(G.t*30))};
ESHADOW.mosquito=e=>shadow(e.x,e.y+6,8,3,.22);

EUPD.croc=(e,dt,sm,a,d)=>{
  if(!e.st||e.st==='walk'){e.st='under';e.stT=rand(1.2,2);e.hidden=true}
  e.snap=Math.max(0,(e.snap||0)-dt);e.stT-=dt;
  if(e.st==='under'){e.hidden=true;const na=navAngle(e);e.face=na;moveCircle(e,Math.cos(na)*86*sm*dt,Math.sin(na)*86*sm*dt);
    if(Math.random()<dt*9)G.fx.push({k:'bub',x:e.x+rand(-7,7),y:e.y+rand(-4,4),t:.5,r:rand(1.5,3)});
    if(e.stT<=0||d<36){e.st='rise';e.stT=.55;sfx('splash',1,e.x)}}
  else if(e.st==='rise'){e.hidden=true;e.face=a;if(e.stT<=0){e.hidden=false;e.st='out';e.stT=rand(2.4,3);e.snap=.35;e.sn=1.2;sfx('chomp',0,e.x);
      vfxBlast(e.x,e.y,'120,160,90',46,{sparks:6,spcol:['#c8e0a0','#8ab060'],dust:0,debris:['#5a6a3a','#3e4a28','#8a9a5a'],n:10,ring2:false});G.ripples.push({x:e.x,y:e.y,r:6,max:40,a:1});
      if(d<e.r+24)hurtP(Math.round(e.cdmg*1.25))}}
  else if(e.st==='out'){const na=navAngle(e);e.face=na;moveCircle(e,Math.cos(na)*34*sm*dt,Math.sin(na)*34*sm*dt);e.moving=true;e.walk+=dt*7;e.sn-=dt;
    if(e.sn<=0&&d<56){e.sn=1.3;e.snap=.35;moveCircle(e,Math.cos(a)*10,Math.sin(a)*10);sfx('chomp',0,e.x);if(d<e.r+20)hurtP(e.cdmg)}
    if(e.stT<=0){e.st='dive';e.stT=.45;e.moving=false}}
  else if(e.st==='dive'){e.hidden=e.stT<.15;if(e.stT<=0){e.st='under';e.stT=rand(1.6,2.4);G.ripples.push({x:e.x,y:e.y,r:6,max:30,a:1});sfx('splash',0,e.x)}}};
EDRAW.croc=e=>{const x=e.x,y=e.y,under=e.st==='under'||e.st==='rise';
  if(under){const p=e.st==='rise'?1-e.stT/.55:0;ctx.fillStyle=`rgba(30,40,24,${.45+p*.25})`;ell(x,y,16+p*8,7+p*3);ctx.fill();ctx.strokeStyle=`rgba(200,230,170,${.25+.15*Math.sin(G.t*6)})`;ctx.lineWidth=1.4;ell(x,y,18+p*10+Math.sin(G.t*5)*2,8+p*4);ctx.stroke();
    const qa=e.face,ex=Math.cos(qa),ey=Math.sin(qa)*.5;ink(1.6);for(const s of [-1,1]){const px=x+ex*6-ey*s*5,py=y-2+ey*6+ex*s*2.5-p*4;circ(px,py,2.6+p);fs('#6b7a3a');ctx.fillStyle='#ffd86b';circ(px,py-.6,1.2);ctx.fill();ctx.fillStyle=INK;ctx.fillRect(px-.3,py-1.4,.6,1.6)}
    ctx.fillStyle=INK;circ(x+ex*14,y-1+ey*14,1);ctx.fill();circ(x+ex*14+1.5,y+ey*14,1);ctx.fill();return}
  const sink=e.st==='dive'?1-e.stT/.45:0,a=Q8(e.face)*Math.PI/4,w=e.moving?Math.sin(e.walk):0,open=e.snap>0?Math.sin((1-e.snap/.35)*Math.PI):0;
  ctx.save();ctx.translate(x,y-4+sink*6);ctx.rotate(a);ctx.globalAlpha=1-sink*.6;ink(2.4);
  // tail swaying, legs splayed
  ctx.beginPath();ctx.moveTo(-10,-6);ctx.quadraticCurveTo(-26,Math.sin(e.t*4)*8,-36,Math.sin(e.t*4+1)*10);ctx.quadraticCurveTo(-24,Math.sin(e.t*4)*4+4,-10,6);ctx.closePath();fs('#5a6a32');
  for(const[lx,s] of [[8,-1],[8,1],[-7,-1],[-7,1]]){const st=(lx>0?w:-w)*s*3;ell(lx+st,s*12,4,3);fs('#5a6a32')}
  ell(0,0,15,10);fs(e.slow>0?'#8aa0a8':'#6b7a3a');ctx.fillStyle='#4a5a2a';for(let i=-2;i<=2;i++){ctx.beginPath();ctx.moveTo(i*5-2,-1.5);ctx.lineTo(i*5,-5);ctx.lineTo(i*5+2,-1.5);ctx.fill();ctx.beginPath();ctx.moveTo(i*5-2,1.5);ctx.lineTo(i*5,5);ctx.lineTo(i*5+2,1.5);ctx.fill()}
  // snout: two jaws that open when it bites
  for(const s of [-1,1]){ctx.save();ctx.rotate(s*open*.45);ctx.beginPath();ctx.moveTo(10,s*1);ctx.lineTo(10,s*7);ctx.lineTo(28,s*4);ctx.quadraticCurveTo(31,s*2,30,0);ctx.closePath();ink(2.2);fs('#6b7a3a');
    ctx.fillStyle='#f6ead2';for(let k=0;k<4;k++){ctx.beginPath();ctx.moveTo(13+k*4,s*(open>.1?.5:3.5));ctx.lineTo(14.5+k*4,s*(open>.1?3:6.5));ctx.lineTo(16+k*4,s*(open>.1?.5:3.5));ctx.fill()}ctx.restore()}
  if(open>.1){ctx.fillStyle='#8a2a2a';ctx.beginPath();ctx.moveTo(11,0);ctx.lineTo(27,-open*8);ctx.lineTo(27,open*8);ctx.closePath();ctx.fill()}
  for(const s of [-1,1]){ink(1.6);circ(9,s*5.5,3);fs('#6b7a3a');ctx.fillStyle='#ffd86b';circ(9.6,s*5.5,1.6);ctx.fill();ctx.fillStyle=INK;ctx.fillRect(9.3,s*5.5-1.2,.6,2.4)}
  ctx.restore();ctx.globalAlpha=1};
ESHADOW.croc=e=>{if(e.st==='out'||e.st==='dive')shadow(e.x,e.y+3,20,7,.3)};

BLOCK.snail=(e,ar)=>{if(e.shell>0){G.fx.push({k:'spark',x:ar.x,y:ar.y,t:.2});text(e.x,e.y-30,'PARATO','#e8d890',12);sfx('shieldHit',.3,e.x);return true}
  e.hc=(e.hcT>0?e.hc:0)+1;e.hcT=1.6;if(e.hc>=3){e.goShell=true;e.hc=0}return false};
EUPD.snail=(e,dt,sm,a,d)=>{e.hcT=(e.hcT||0)-dt;
  if(e.goShell&&!(e.shell>0)&&!(e.out>0)){e.goShell=false;e.shell=2.1;e.sa=a;e.svx=Math.cos(a)*175;e.svy=Math.sin(a)*175;e.sb=3;sfx('shieldHit',0,e.x)}
  if(e.shell>0){e.shell-=dt;e.spin=(e.spin||0)+dt*16;const ox=e.x,oy=e.y;e.x+=e.svx*dt*sm;e.y+=e.svy*dt*sm;let hit=false;
    if(e.x<L+e.r){e.x=L+e.r;e.svx=Math.abs(e.svx);hit=true}if(e.x>R-e.r){e.x=R-e.r;e.svx=-Math.abs(e.svx);hit=true}if(e.y<TOP+e.r){e.y=TOP+e.r;e.svy=Math.abs(e.svy);hit=true}if(e.y>BOT-e.r){e.y=BOT-e.r;e.svy=-Math.abs(e.svy);hit=true}
    for(const k of G.rocks){const ex=e.x-k.x,ey=e.y-k.y,dd=Math.hypot(ex,ey),m=e.r+k.r;if(dd<m&&dd>.01){const nx=ex/dd,ny=ey/dd;e.x=k.x+nx*m;e.y=k.y+ny*m;const dot=e.svx*nx+e.svy*ny;if(dot<0){e.svx-=2*dot*nx;e.svy-=2*dot*ny}hit=true;k.hit=.12}}
    if(hit){sfx('rock','snail',e.x);shake(1.5);const na=Math.atan2(P.y-e.y,P.x-e.x),v=Math.hypot(e.svx,e.svy);if(--e.sb<=1){e.svx=Math.cos(na)*v;e.svy=Math.sin(na)*v}}
    if(Math.random()<.5)G.fx.push({k:'puff',x:ox,y:oy+6,vx:0,vy:-5,t:.3,r:3});
    if(e.shell<=0){e.out=.45;e.svx=e.svy=0}return}
  if(e.out>0){e.out-=dt;return}
  const na=navAngle(e);e.face=na;moveCircle(e,Math.cos(na)*24*sm*dt,Math.sin(na)*24*sm*dt);e.moving=true;e.walk+=dt*3;
  e.trT=(e.trT||0)-dt;if(e.trT<=0){e.trT=.32;addZone(e.x-Math.cos(na)*10,e.y-Math.sin(na)*10,e.elite?17:13,3.6,'slime')}};
EDRAW.snail=e=>{const B=basis(e.face),x=e.x,y=e.y,f=B.side?B.f:(Math.cos(e.face)>=0?1:-1);
  const shellDraw=(sx,sy,rr,spin)=>{ink(2.4);circ(sx,sy,rr);const g=ctx.createRadialGradient(sx-rr*.3,sy-rr*.4,rr*.1,sx,sy,rr);g.addColorStop(0,'#c890d8');g.addColorStop(1,'#6a3a7a');ctx.fillStyle=g;ctx.fill();ctx.stroke();
    ctx.save();ctx.translate(sx,sy);ctx.rotate(spin);ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.beginPath();for(let t2=0;t2<9;t2+=.25){const rr2=rr*(.9-t2*.09);ctx.lineTo(Math.cos(t2*1.3)*rr2,Math.sin(t2*1.3)*rr2)}ctx.stroke();
    ctx.strokeStyle='#e8c8f0';ctx.lineWidth=.9;ctx.stroke();ctx.restore();ctx.fillStyle='rgba(255,255,255,.4)';ell(sx-rr*.35,sy-rr*.45,rr*.3,rr*.15,-.4);ctx.fill()};
  if(e.shell>0){shellDraw(x,y-11,14,e.spin*f);ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=1.5;for(let k=0;k<3;k++){ctx.beginPath();ctx.arc(x,y-11,18+k*3,e.spin+k,e.spin+k+.8);ctx.stroke()}return}
  const em=e.out>0?1-e.out/.45:1,wv=Math.sin(e.walk*4)*1.5;ctx.save();ctx.translate(x,y);ctx.scale(f,1);
  // the soft foot, eye stalks bobbing
  ink(2.2);ctx.beginPath();ctx.moveTo(-14,4);ctx.quadraticCurveTo(-2,8+wv*.3,10+em*8,5);ctx.quadraticCurveTo(16+em*8,2,14+em*8,-6*em);ctx.quadraticCurveTo(10,-9*em,6,-2);ctx.lineTo(-14,-1);ctx.closePath();fs(e.slow>0?'#a8c8c8':'#d8c86a');
  ctx.fillStyle='rgba(255,255,255,.35)';ell(2,2,8,1.6);ctx.fill();
  if(em>.5)for(const k of [0,1]){const bx=12+em*8+k*3,by=-5,tx=bx+3+Math.sin(e.t*3+k)*2,ty=by-10-k*2+Math.cos(e.t*2+k)*1.5;ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(tx,ty);ctx.stroke();ctx.strokeStyle='#d8c86a';ctx.lineWidth=1.6;ctx.stroke();ink(1.4);circ(tx,ty,2.4);fs('#f6ead2');ctx.fillStyle=INK;circ(tx+.8,ty,1.1);ctx.fill()}
  ctx.restore();shellDraw(x-f*3,y-12,13,0)};
ESHADOW.snail=e=>shadow(e.x,e.y+6,15,5);

EUPD.tadpole=(e,dt,sm,a,d)=>{const na=navAngle(e),w=Math.sin(e.t*12)*.5;e.face=na+w*.3;moveCircle(e,Math.cos(na+w)*92*sm*dt,Math.sin(na+w)*92*sm*dt);e.moving=true};
EDRAW.tadpole=e=>{ctx.save();ctx.translate(e.x,e.y-3);ctx.rotate(e.face);ink(1.8);ctx.beginPath();ctx.moveTo(-4,0);for(let i=1;i<=6;i++)ctx.lineTo(-4-i*2.4,Math.sin(e.t*16-i*.9)*i*.7);ctx.strokeStyle=INK;ctx.lineWidth=4;ctx.stroke();ctx.strokeStyle='#4a6a3a';ctx.lineWidth=2;ctx.stroke();
  ink(1.8);ell(1,0,6.5,5.2);fs(e.slow>0?'#7a9aa8':'#3a5a2a');ctx.fillStyle='#ffd86b';for(const s of [-1,1]){circ(4,s*2.6,1.5);ctx.fill()}ctx.fillStyle='rgba(255,255,255,.35)';ell(-1,-2,2.5,1.2);ctx.fill();ctx.restore()};
ESHADOW.tadpole=e=>shadow(e.x,e.y+3,7,2.5,.25);

